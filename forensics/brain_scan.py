# Offline BrainScan analysis for forensic case copies.
import json
from pathlib import Path
import subprocess
from typing import Any

from .evidence import ForensicCase
from .utils import sha256_file, utc_now_iso, write_json_with_hash

TEXT_SUFFIXES = {".js", ".html", ".css", ".json", ".ts", ".py", ".sql"}


class BrainScanError(RuntimeError):
    pass


class BrainScanAnalyzer:
    """Run the trained BrainScan snapshot offline against captured evidence.

    Args:
        workspace_root: Repository root containing forensics/ and brainscan/.
        snapshot_path: Optional trained-network.json override.
        node_executable: Node.js command used to launch scan_artifact.js.
    """

    def __init__(self, workspace_root: Path, snapshot_path: Path | None = None, node_executable: str = "node"):
        self.workspace_root = workspace_root.resolve()
        self.runner_path = self.workspace_root / "forensics" / "scan_artifact.js"
        self.node_executable = node_executable
        self.snapshot_path = snapshot_path or self.workspace_root / "brainscan" / "data" / "trained-network.json"

        if not self.snapshot_path.is_absolute(): self.snapshot_path = self.workspace_root / self.snapshot_path

    def scan_code(self, code: str) -> dict[str, Any]:
        """Analyze a code string with BrainScan.

        Args:
            code: Text captured from an evidence copy.
        """
        if not self.snapshot_path.is_file(): raise BrainScanError(f"BrainScan snapshot not found: {self.snapshot_path}")
        if not self.runner_path.is_file(): raise BrainScanError(f"BrainScan runner not found: {self.runner_path}")

        # The runner reads the snapshot read-only and never starts the BrainScan HTTP server.
        payload = {"code": code, "snapshotPath": str(self.snapshot_path.resolve())}
        completed = subprocess.run(
            [self.node_executable, str(self.runner_path)],
            input=json.dumps(payload),
            text=True,
            capture_output=True,
            check=False,
        )

        if completed.returncode != 0: raise BrainScanError(f"BrainScan runner failed: {completed.stderr.strip()}")

        try:
            result = json.loads(completed.stdout)
        except json.JSONDecodeError as error:
            raise BrainScanError(f"BrainScan runner returned invalid JSON: {completed.stdout[:200]}") from error

        required_keys = {"risk", "riskPercent", "label", "features"}

        if not required_keys.issubset(result): raise BrainScanError("BrainScan result is missing expected fields")

        return result

    def analyze_case(self, case: ForensicCase) -> Path:
        """Analyze every text-like source artifact in a case and write a report.

        Args:
            case: Case whose stored evidence copies will be scanned.
        """
        snapshot_hash = sha256_file(self.snapshot_path)
        results: list[dict[str, Any]] = []

        for record in case.evidence:
            if record.role != "source": continue
            if Path(record.source_path).suffix.lower() not in TEXT_SUFFIXES: continue

            evidence_file = case.output_dir / record.evidence_path
            code = evidence_file.read_text(encoding="utf-8", errors="replace")
            scan_result = self.scan_code(code)

            result = {
                "evidence_id": record.evidence_id,
                "evidence_sha256": record.sha256,
                "source_path": record.source_path,
                "snapshot_sha256": snapshot_hash,
                "analyzed_at_utc": utc_now_iso(),
                **scan_result,
            }
            results.append(result)
            case.add_event("analyzed", actor="brain-scan-forensics", evidence_sha256=record.sha256, details={"risk_percent": scan_result["riskPercent"], "label": scan_result["label"]})

        report = {
            "schema_version": "1.0",
            "case_id": case.case_id,
            "generated_at_utc": utc_now_iso(),
            "snapshot_path": str(self.snapshot_path.resolve()),
            "snapshot_sha256": snapshot_hash,
            "tool": "forensics/scan_artifact.js",
            "results": results,
        }
        report_path, _ = write_json_with_hash(case.output_dir / "analysis.json", report)

        return report_path
