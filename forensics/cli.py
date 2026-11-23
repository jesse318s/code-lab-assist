# Command-line entry point for offline forensic BrainScan analysis.
import argparse
from pathlib import Path
import sys

from .brain_scan import BrainScanAnalyzer, BrainScanError
from .evidence import ForensicCase, ForensicCaseError


def build_parser() -> argparse.ArgumentParser:
    """Build the forensic CLI argument parser."""
    parser = argparse.ArgumentParser(
        prog="python -m forensics.cli",
        description="Capture artifacts as read-only evidence and analyze copies with BrainScan.",
        epilog='Example: python -m forensics.cli --case-id INC-2026-001 --examiner "Jesse" javascript-lab/index.js sql-lab/index.js',
    )
    parser.add_argument("--case-id", required=True, help="Unique case identifier, e.g. INC-2026-001")
    parser.add_argument("--examiner", required=True, help="Name of the person or tool performing acquisition")
    parser.add_argument("--output-dir", default="forensics/cases", help="Case output directory (default: forensics/cases)")
    parser.add_argument("--snapshot", default=None, help="BrainScan snapshot path (default: brainscan/data/trained-network.json)")
    parser.add_argument("--notes", default="", help="Optional case notes")
    parser.add_argument("artifacts", nargs="+", type=Path, help="Source files to acquire and scan")

    return parser


def main(argv: list[str] | None = None) -> int:
    """Acquire artifacts, analyze them offline, and write a case report.

    Args:
        argv: Optional argument list; defaults to sys.argv when omitted.
    """
    args = build_parser().parse_args(argv)
    workspace_root = Path(__file__).resolve().parent.parent
    output_dir = Path(args.output_dir)

    if not output_dir.is_absolute(): output_dir = workspace_root / output_dir

    snapshot_path = Path(args.snapshot) if args.snapshot else None
    case = ForensicCase(
        case_id=args.case_id,
        output_dir=output_dir,
        examiner=args.examiner,
        workspace_root=workspace_root,
        notes=args.notes,
    )

    for artifact in args.artifacts:
        record = case.capture_file(artifact)
        print(f"Acquired {record.source_path} -> {record.sha256[:16]}")

    analyzer = BrainScanAnalyzer(workspace_root=workspace_root, snapshot_path=snapshot_path)
    report_path = analyzer.analyze_case(case)
    manifest_path, hash_path = case.write_manifest()

    print(f"Analysis report: {report_path}")
    print(f"Case manifest:   {manifest_path}")
    print(f"Manifest hash:   {hash_path}")

    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except (ForensicCaseError, BrainScanError, OSError, ValueError) as error:
        print(f"error: {error}", file=sys.stderr)
        sys.exit(1)
