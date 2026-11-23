# Concise DFIR layer: findings, playbooks, IOCs, and integrity verification.
import json
from pathlib import Path
from typing import Any

from .custody import append_event, verify_events
from .evidence import ForensicCase
from .signing import verify_manifest_signature
from .utils import sha256_file, utc_now_iso, write_json_with_hash

SEVERITY_BY_LABEL = {
    "Low Risk": "low",
    "Medium Risk": "medium",
    "High Risk": "high",
    "Critical Risk": "critical",
}
RESPONSE_ACTIONS = {
    "low": "Log and monitor; no containment required.",
    "medium": "Review the artifact and schedule remediation.",
    "high": "Investigate the affected system and isolate it if malicious activity is confirmed.",
    "critical": "Contain immediately, preserve evidence, and escalate to incident response.",
}
PLAYBOOKS = {
    "low": ["Log the finding", "Monitor for recurrence"],
    "medium": ["Assign an owner", "Review the code path", "Patch or remove the risky pattern", "Re-scan the evidence"],
    "high": ["Preserve related logs", "Isolate the affected system if confirmed", "Remediate and verify", "Document lessons learned"],
    "critical": ["Contain the system", "Preserve volatile evidence", "Escalate to incident response", "Eradicate and recover", "Complete a post-incident review"],
}
INDICATOR_DESCRIPTIONS = {
    "has_eval": "eval() usage",
    "has_inner_html": "innerHTML assignment",
    "has_document_write": "document.write() usage",
    "has_sql": "SQL statement literals",
    "has_exec": "process execution calls",
    "has_unvalidated_input": "direct request input access",
    "has_dynamic_import": "dynamic require/import",
    "has_http_request": "outbound HTTP references",
}


def build_findings(results: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Turn BrainScan results into short, actionable DFIR findings."""
    findings: list[dict[str, Any]] = []

    for result in results:
        indicators = sorted(key for key, value in result["features"].items() if value == 1)
        severity = SEVERITY_BY_LABEL.get(result["label"], "medium")

        findings.append({
            "evidence_sha256": result["evidence_sha256"],
            "source_path": result["source_path"],
            "severity": severity,
            "label": result["label"],
            "risk_percent": result["riskPercent"],
            "indicators": indicators,
            "response_action": RESPONSE_ACTIONS[severity],
            "playbook": PLAYBOOKS[severity],
        })

    return findings


def write_dfir_report(case: ForensicCase, results: list[dict[str, Any]], snapshot_hash: str) -> Path:
    """Write a single hashed DFIR report for the case."""
    report = {
        "schema_version": "1.0",
        "case_id": case.case_id,
        "incident_type": case.incident_type,
        "examiner": case.examiner,
        "generated_at_utc": utc_now_iso(),
        "snapshot_sha256": snapshot_hash,
        "chain_of_custody_events": len(case.chain_of_custody),
        "playbooks": PLAYBOOKS,
        "findings": build_findings(results),
    }
    report_path, _ = write_json_with_hash(case.output_dir / "dfir_report.json", report)

    return report_path


def write_ioc_export(case: ForensicCase, findings: list[dict[str, Any]]) -> Path:
    """Write a compact IOC list derived from triggered indicators."""
    iocs: list[dict[str, Any]] = []

    for finding in findings:
        for indicator in finding["indicators"]:
            iocs.append({
                "type": "code-pattern",
                "indicator": indicator,
                "description": INDICATOR_DESCRIPTIONS.get(indicator, indicator),
                "severity": finding["severity"],
                "evidence_sha256": finding["evidence_sha256"],
                "source_path": finding["source_path"],
            })

    export = {
        "schema_version": "1.0",
        "case_id": case.case_id,
        "generated_at_utc": utc_now_iso(),
        "iocs": iocs,
    }
    export_path, _ = write_json_with_hash(case.output_dir / "iocs.json", export)

    return export_path


def verify_sidecar(path: Path) -> list[str]:
    """Verify one JSON file against its .sha256 sidecar."""
    sidecar = path.with_suffix(path.suffix + ".sha256")

    if not sidecar.is_file(): return [f"missing {sidecar.name}"]

    expected_hash = sidecar.read_text(encoding="utf-8").split()[0]

    if expected_hash != sha256_file(path): return [f"hash mismatch: {path.name}"]

    return []


def verify_case(case_dir: Path, signing_key: bytes | None = None) -> list[str]:
    """Re-hash a case, verify signatures/custody, and log the verification.

    Args:
        case_dir: Directory containing case.json, evidence/, and hashed reports.
        signing_key: Optional HMAC key used to verify a sealed manifest.
    """
    manifest_path = case_dir / "case.json"

    if not manifest_path.is_file(): return ["missing case.json"]

    problems = verify_sidecar(manifest_path)

    try:
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as error:
        problems.append(f"invalid case.json: {error}")
        return problems

    if signing_key is not None and manifest.get("signature"): problems.extend(verify_manifest_signature(manifest, signing_key))
    if manifest.get("custody_log"): problems.extend(verify_events(case_dir))

    for record in manifest.get("evidence", []):
        evidence_path = case_dir / record["evidence_path"]

        if not evidence_path.is_file():
            problems.append(f"missing evidence: {record['evidence_id']}")
        elif sha256_file(evidence_path) != record["sha256"]:
            problems.append(f"hash mismatch: {record['evidence_id']}")

    for json_path in sorted(case_dir.glob("*.json")):
        if json_path != manifest_path: problems.extend(verify_sidecar(json_path))

    append_event(case_dir, "verified", actor="forensics-cli", details={"problems": len(problems)})

    return problems
