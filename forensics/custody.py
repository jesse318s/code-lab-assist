# Append-only, hash-chained custody events for DFIR cases.
import json
from pathlib import Path
from typing import Any

from .utils import canonical_json_bytes, sha256_bytes, utc_now_iso

GENESIS_HASH = "0" * 64


def append_event(case_dir: Path, action: str, actor: str, details: dict[str, Any] | None = None, evidence_sha256: str | None = None) -> dict:
    """Append one custody event and link it to the previous event hash."""
    log_path = case_dir / "custody.jsonl"
    log_path.parent.mkdir(parents=True, exist_ok=True)

    previous_hash = GENESIS_HASH
    sequence = 0

    if log_path.exists():
        lines = log_path.read_text(encoding="utf-8").splitlines()

        if lines:
            previous_hash = json.loads(lines[-1])["event_hash"]
            sequence = len(lines)

    event = {
        "sequence": sequence + 1,
        "timestamp_utc": utc_now_iso(),
        "actor": actor,
        "action": action,
        "evidence_sha256": evidence_sha256,
        "details": dict(details or {}),
        "previous_hash": previous_hash,
    }
    event["event_hash"] = sha256_bytes(canonical_json_bytes(event))

    with log_path.open("a", encoding="utf-8") as log_file:
        log_file.write(json.dumps(event, sort_keys=True) + "\n")

    return event


def verify_events(case_dir: Path) -> list[str]:
    """Verify the custody log chain and return any integrity problems."""
    log_path = case_dir / "custody.jsonl"

    if not log_path.exists(): return []

    problems: list[str] = []
    previous_hash = GENESIS_HASH

    for line_number, line in enumerate(log_path.read_text(encoding="utf-8").splitlines(), start=1):
        try:
            event = json.loads(line)
            event_hash = event.pop("event_hash")
        except (json.JSONDecodeError, KeyError):
            problems.append(f"invalid custody event on line {line_number}")
            continue

        if event.get("sequence") != line_number: problems.append(f"custody sequence mismatch on line {line_number}")
        if event.get("previous_hash") != previous_hash: problems.append(f"custody chain mismatch on line {line_number}")
        if sha256_bytes(canonical_json_bytes(event)) != event_hash: problems.append(f"custody hash mismatch on line {line_number}")

        previous_hash = event_hash

    return problems
