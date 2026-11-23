# Command-line entry point for offline DFIR BrainScan analysis.
import argparse
from pathlib import Path
import sys

from .brain_scan import BrainScanAnalyzer, BrainScanError
from .dfir import verify_case
from .evidence import ForensicCase, ForensicCaseError
from .signing import load_signing_key


def build_parser() -> argparse.ArgumentParser:
    """Build the DFIR CLI argument parser."""
    parser = argparse.ArgumentParser(
        prog="python -m forensics.cli",
        description="Capture artifacts as evidence, analyze copies with BrainScan, and verify case integrity.",
        epilog='Example: python -m forensics.cli --case-id INC-2026-001 --examiner "Jesse" javascript-lab/index.js',
    )
    parser.add_argument("--case-id", help="Unique case identifier, e.g. INC-2026-001")
    parser.add_argument("--examiner", help="Person or tool performing the acquisition")
    parser.add_argument("--incident-type", default="suspicious-code", help="Incident classification (default: suspicious-code)")
    parser.add_argument("--output-dir", default="forensics/cases", help="Parent case directory (default: forensics/cases)")
    parser.add_argument("--snapshot", default=None, help="BrainScan snapshot path (default: brainscan/data/trained-network.json)")
    parser.add_argument("--notes", default="", help="Optional case notes")
    parser.add_argument("--signing-key", type=Path, default=None, help="HMAC key file (default: forensics/case-signing.key or FORENSICS_SIGNING_KEY)")
    parser.add_argument("--verify", metavar="CASE_DIR", help="Verify an existing case and exit")
    parser.add_argument("artifacts", nargs="*", type=Path, help="Source files to acquire and scan")

    return parser


def main(argv: list[str] | None = None) -> int:
    """Acquire, analyze, or verify a DFIR case.

    Args:
        argv: Optional argument list; defaults to sys.argv when omitted.
    """
    parser = build_parser()
    args = parser.parse_args(argv)
    workspace_root = Path(__file__).resolve().parent.parent
    output_dir = Path(args.output_dir)
    invocation = argv if argv is not None else sys.argv[1:]
    command_line = " ".join([Path(sys.executable).name, "-m", "forensics.cli", *map(str, invocation)])
    signing_key = load_signing_key(args.signing_key)

    if not output_dir.is_absolute(): output_dir = workspace_root / output_dir

    if args.verify:
        case_dir = Path(args.verify)

        if not case_dir.is_absolute(): case_dir = workspace_root / case_dir

        problems = verify_case(case_dir, signing_key=signing_key)

        if problems:
            for problem in problems: print(f"MISMATCH: {problem}", file=sys.stderr)
            return 1

        print(f"OK: {case_dir}")
        return 0

    if not args.case_id or not args.examiner: parser.error("--case-id and --examiner are required when acquiring artifacts")
    if not args.artifacts: parser.error("provide at least one artifact or use --verify")

    snapshot_path = Path(args.snapshot) if args.snapshot else None
    case = ForensicCase(
        case_id=args.case_id,
        output_dir=output_dir,
        examiner=args.examiner,
        workspace_root=workspace_root,
        incident_type=args.incident_type,
        notes=args.notes,
    )

    for artifact in args.artifacts:
        record = case.capture_file(artifact)
        print(f"Acquired {record.source_path} -> {record.sha256[:16]}")

    analyzer = BrainScanAnalyzer(workspace_root=workspace_root, snapshot_path=snapshot_path)
    analyzer.analyze_case(case)
    manifest_path, hash_path = case.write_manifest(signing_key=signing_key, command_line=command_line)

    print(f"DFIR report:   {case.output_dir / 'dfir_report.json'}")
    print(f"IOC export:    {case.output_dir / 'iocs.json'}")
    print(f"Analysis:      {case.output_dir / 'analysis.json'}")
    print(f"Case manifest: {manifest_path}")
    print(f"Manifest hash: {hash_path}")

    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except (ForensicCaseError, BrainScanError, OSError, ValueError) as error:
        print(f"error: {error}", file=sys.stderr)
        sys.exit(1)
