# Read-only evidence acquisition with hashes and a chain-of-custody log.
from dataclasses import asdict, dataclass
import mimetypes
from pathlib import Path
from typing import Any

from .custody import append_event
from .signing import seal_manifest
from .utils import sha256_bytes, sha256_file, utc_now_iso, validate_case_id, write_json_with_hash


class ForensicCaseError(RuntimeError):
    pass


@dataclass(frozen=True)
class EvidenceRecord:
    """Immutable metadata describing one acquired evidence copy."""

    evidence_id: str
    role: str
    source_path: str
    evidence_path: str
    sha256: str
    size_bytes: int
    media_type: str
    acquired_at_utc: str


@dataclass(frozen=True)
class CustodyEvent:
    """Immutable chain-of-custody entry."""

    timestamp_utc: str
    actor: str
    action: str
    evidence_sha256: str | None
    details: dict[str, Any]


class ForensicCase:
    """A forensic case containing read-only evidence copies and custody events.

    Args:
        case_id: Unique identifier used as the case directory name.
        output_dir: Parent directory for cases; the case ID is appended.
        examiner: Person or tool performing the acquisition.
        workspace_root: Root used to resolve relative source and output paths.
        incident_type: Short classification such as suspicious-code or malware.
        notes: Optional free-text case notes.
    """

    def __init__(self, case_id: str, output_dir: Path, examiner: str, workspace_root: Path, incident_type: str = "suspicious-code", notes: str = ""):
        self.case_id = validate_case_id(case_id)
        self.examiner = examiner
        self.incident_type = incident_type
        self.notes = notes
        self.workspace_root = workspace_root.resolve()
        case_root = output_dir if output_dir.is_absolute() else workspace_root / output_dir

        self.output_dir = (case_root / self.case_id).resolve()
        self.manifest_path = self.output_dir / "case.json"
        self.custody_log_path = self.output_dir / "custody.jsonl"

        if self.manifest_path.exists(): raise ForensicCaseError(f"Case '{case_id}' already exists at {self.output_dir}")

        self.evidence_dir = self.output_dir / "evidence"
        self.evidence: list[EvidenceRecord] = []
        self.chain_of_custody: list[CustodyEvent] = []
        self.created_at_utc = utc_now_iso()

    def capture_file(self, source_path: Path, role: str = "source") -> EvidenceRecord:
        """Copy a source file into evidence without modifying the original.

        Args:
            source_path: File to acquire; relative paths use workspace_root.
            role: Label describing how the artifact will be used in analysis.
        """
        source = source_path if source_path.is_absolute() else self.workspace_root / source_path
        source = source.resolve()

        if not source.is_file(): raise ForensicCaseError(f"Evidence source not found: {source}")

        # Read the original once, then analyze only the stored copy so the source stays untouched.
        source_bytes = source.read_bytes()
        digest = sha256_bytes(source_bytes)
        stored_relative = Path("evidence") / f"{digest}{source.suffix.lower()}"
        stored_path = self.output_dir / stored_relative

        if stored_path.exists() and sha256_file(stored_path) != digest: raise ForensicCaseError(f"Evidence store hash mismatch for {stored_path}")

        if not stored_path.exists():
            stored_path.parent.mkdir(parents=True, exist_ok=True)
            stored_path.write_bytes(source_bytes)

        media_type = mimetypes.guess_type(source.name)[0] or "application/octet-stream"
        record = EvidenceRecord(
            evidence_id=f"EVD-{digest[:16]}",
            role=role,
            source_path=str(source),
            evidence_path=stored_relative.as_posix(),
            sha256=digest,
            size_bytes=len(source_bytes),
            media_type=media_type,
            acquired_at_utc=utc_now_iso(),
        )

        self.evidence.append(record)
        self.add_event("acquired", actor=self.examiner, evidence_sha256=digest, details={"source_path": str(source), "size_bytes": len(source_bytes)})

        return record

    def add_event(self, action: str, actor: str, evidence_sha256: str | None = None, details: dict[str, Any] | None = None) -> None:
        """Append a chain-of-custody event.

        Args:
            action: Short action name such as acquired, analyzed, or manifest_written.
            actor: Person or tool responsible for the action.
            evidence_sha256: Optional hash linking the event to one evidence copy.
            details: Optional structured context for the event.
        """
        event = CustodyEvent(
            timestamp_utc=utc_now_iso(),
            actor=actor,
            action=action,
            evidence_sha256=evidence_sha256,
            details=dict(details or {}),
        )

        self.chain_of_custody.append(event)
        append_event(self.output_dir, action, actor, details, evidence_sha256)

    def write_manifest(self, signing_key: bytes | None = None, command_line: str = "") -> tuple[Path, Path]:
        """Write the case manifest and its hash file.

        Args:
            signing_key: Optional HMAC key used to seal the manifest.
            command_line: Command used for this acquisition, recorded as provenance.
        """
        # Logged here so every finalized case has a final, timestamped custody entry.
        self.add_event("manifest_written", actor="forensics-cli", details={"schema_version": "1.0"})

        manifest = {
            "schema_version": "1.0",
            "case_id": self.case_id,
            "examiner": self.examiner,
            "incident_type": self.incident_type,
            "notes": self.notes,
            "created_at_utc": self.created_at_utc,
            "workspace_root": str(self.workspace_root),
            "custody_log": self.custody_log_path.name,
            "evidence": [asdict(record) for record in self.evidence],
            "chain_of_custody": [asdict(event) for event in self.chain_of_custody],
        }

        if signing_key is not None: manifest = seal_manifest(manifest, signing_key, self.examiner, command_line)

        return write_json_with_hash(self.manifest_path, manifest)
