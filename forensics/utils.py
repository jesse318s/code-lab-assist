# Small shared helpers for deterministic forensic JSON output and hashing.
import hashlib
import json
import re
from datetime import datetime, timezone
from pathlib import Path

CASE_ID_PATTERN = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$")


def utc_now_iso() -> str:
    """Return the current UTC time in a stable ISO-8601 format."""
    return datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")


def sha256_bytes(data: bytes) -> str:
    """Return the SHA-256 hex digest for raw bytes."""
    return hashlib.sha256(data).hexdigest()


def sha256_file(path: Path) -> str:
    """Return the SHA-256 hex digest for a file, streaming it in chunks."""
    digest = hashlib.sha256()

    with path.open("rb") as source_file:
        for chunk in iter(lambda: source_file.read(1024 * 1024), b""):
            digest.update(chunk)

    return digest.hexdigest()


def validate_case_id(case_id: str) -> str:
    """Validate a case ID so it cannot escape the configured output directory.

    Args:
        case_id: Proposed case identifier.
    """
    # Restricting the ID prevents a case ID from escaping its output directory.
    if not CASE_ID_PATTERN.fullmatch(case_id): raise ValueError("case_id may only contain letters, numbers, dot, underscore, and hyphen")

    return case_id


def write_json_with_hash(path: Path, payload: dict) -> tuple[Path, Path]:
    """Write deterministic JSON plus a sibling .sha256 verification file.

    Args:
        path: Destination JSON path.
        payload: Serializable dictionary to write.
    """
    # A sibling .sha256 file keeps the report verifiable without putting a self-referential hash inside the JSON.
    path.parent.mkdir(parents=True, exist_ok=True)

    encoded = (json.dumps(payload, indent=2, sort_keys=True) + "\n").encode("utf-8")

    path.write_bytes(encoded)

    hash_path = path.with_suffix(path.suffix + ".sha256")
    hash_line = f"{sha256_bytes(encoded)}  {path.name}\n"

    hash_path.write_text(hash_line, encoding="utf-8")

    return path, hash_path
