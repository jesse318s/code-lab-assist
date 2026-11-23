# Unit and integration tests for the offline forensic BrainScan wrapper.
import json
import shutil
import tempfile
import unittest
from pathlib import Path

from forensics.brain_scan import BrainScanAnalyzer
from forensics.evidence import ForensicCase, ForensicCaseError
from forensics.utils import sha256_file

WORKSPACE_ROOT = Path(__file__).resolve().parent
EXPECTED_FEATURE_KEYS = {
    "has_eval",
    "has_inner_html",
    "has_document_write",
    "has_sql",
    "has_exec",
    "has_unvalidated_input",
    "has_dynamic_import",
    "has_http_request",
}


class ForensicCaseTests(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.root = Path(self.temp_dir.name)
        self.source = self.root / "sample.js"
        self.source.write_text("const total = 1 + 2;\n", encoding="utf-8")

    def tearDown(self):
        self.temp_dir.cleanup()

    def create_case(self) -> ForensicCase:
        return ForensicCase(
            case_id="CASE-TEST-1",
            output_dir=self.root / "cases",
            examiner="tester",
            workspace_root=self.root,
        )

    def test_capture_file_preserves_source_and_records_hash(self):
        case = self.create_case()
        original_bytes = self.source.read_bytes()

        record = case.capture_file(self.source)

        self.assertEqual(self.source.read_bytes(), original_bytes)
        self.assertEqual(record.sha256, sha256_file(self.source))

        copied_evidence = case.output_dir / record.evidence_path

        self.assertTrue(copied_evidence.is_file())
        self.assertEqual(copied_evidence.read_bytes(), original_bytes)

    def test_manifest_and_hash_file_are_written(self):
        case = self.create_case()
        case.capture_file(self.source)

        manifest_path, hash_path = case.write_manifest()
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        stored_hash = hash_path.read_text(encoding="utf-8").split()[0]

        self.assertEqual(manifest["case_id"], "CASE-TEST-1")
        self.assertEqual(len(manifest["evidence"]), 1)
        self.assertEqual(stored_hash, sha256_file(manifest_path))
        self.assertTrue(any(event["action"] == "manifest_written" for event in manifest["chain_of_custody"]))

    def test_duplicate_case_id_is_rejected(self):
        case = self.create_case()
        case.capture_file(self.source)
        case.write_manifest()

        with self.assertRaises(ForensicCaseError):
            self.create_case()


class BrainScanForensicsTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.snapshot = WORKSPACE_ROOT / "brainscan" / "data" / "trained-network.json"

        if shutil.which("node") is None or not cls.snapshot.is_file():
            raise unittest.SkipTest("BrainScan snapshot or Node.js is not available")

    def create_case_with_evidence(self) -> ForensicCase:
        temp_dir = tempfile.TemporaryDirectory()
        self.addCleanup(temp_dir.cleanup)
        root = Path(temp_dir.name)
        source = root / "sample.js"
        source.write_text("const total = 1 + 2;\n", encoding="utf-8")

        case = ForensicCase(
            case_id="CASE-SCAN-1",
            output_dir=root / "cases",
            examiner="tester",
            workspace_root=root,
        )
        case.capture_file(source)

        return case

    def test_scan_code_returns_risk_and_features(self):
        analyzer = BrainScanAnalyzer(workspace_root=WORKSPACE_ROOT, snapshot_path=self.snapshot)

        result = analyzer.scan_code("const total = 1 + 2;\n")

        self.assertEqual(set(result["features"]), EXPECTED_FEATURE_KEYS)
        self.assertGreaterEqual(result["risk"], 0)
        self.assertLessEqual(result["risk"], 1)
        self.assertIn("label", result)

    def test_analyze_case_writes_report_and_custody_event(self):
        case = self.create_case_with_evidence()
        analyzer = BrainScanAnalyzer(workspace_root=WORKSPACE_ROOT, snapshot_path=self.snapshot)

        report_path = analyzer.analyze_case(case)
        report = json.loads(report_path.read_text(encoding="utf-8"))
        manifest = json.loads(case.manifest_path.read_text(encoding="utf-8")) if case.manifest_path.exists() else None

        self.assertEqual(report["case_id"], "CASE-SCAN-1")
        self.assertEqual(len(report["results"]), 1)
        self.assertEqual(report["results"][0]["snapshot_sha256"], sha256_file(self.snapshot))
        self.assertIsNone(manifest)

        case.write_manifest()
        manifest = json.loads(case.manifest_path.read_text(encoding="utf-8"))

        self.assertTrue(any(event["action"] == "analyzed" for event in manifest["chain_of_custody"]))


if __name__ == "__main__":
    unittest.main()
