import unittest
from unittest.mock import patch
import sys
from pathlib import Path
from io import StringIO

project_root = Path(__file__).parent.parent

sys.path.append(str(project_root / "python-lab"))

class TestMain(unittest.TestCase):
    def test_hello_world(self):
        captured_output = StringIO()
        
        with patch('sys.stdout', new=captured_output):
            import main
            
            self.assertEqual(captured_output.getvalue(), "Hello World!\n")

if __name__ == '__main__':
    unittest.main()