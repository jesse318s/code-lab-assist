import unittest
from unittest.mock import patch, mock_open, MagicMock
import sys
from pathlib import Path
from io import StringIO

sys.path.insert(0, str(Path(__file__).parent))

class TestPomlRenderer(unittest.TestCase):
    def _run_main(self):
        """Import and call main() with a clean module state each time."""
        import importlib
        import poml_renderer

        importlib.reload(poml_renderer)
        return poml_renderer

    def test_missing_prompt_file_prints_message(self):
        with patch('pathlib.Path.exists', return_value=False), \
             patch('sys.stdout', new_callable=StringIO) as mock_out:
            mod = self._run_main()
            
            mod.main()
            self.assertIn('not found', mock_out.getvalue())

    def test_renders_prompt_without_context_file(self):
        fake_messages = [{'content': 'Hello from POML'}]

        def path_exists(self):
            return str(self).endswith('prompt.poml')

        with patch('pathlib.Path.exists', path_exists), \
             patch('poml.poml', return_value=fake_messages) as mock_poml, \
             patch('sys.stdout', new_callable=StringIO) as mock_out:
            mod = self._run_main()
            
            mod.main()
            mock_poml.assert_called_once_with('prompt.poml', context={})
            self.assertIn('Hello from POML', mock_out.getvalue())

    def test_renders_prompt_with_context_file(self):
        fake_messages = [{'content': 'Rendered with context'}]
        fake_context = '{"lang": "Python"}'

        def path_exists(self):
            return True

        with patch('pathlib.Path.exists', path_exists), \
             patch('builtins.open', mock_open(read_data=fake_context)), \
             patch('poml.poml', return_value=fake_messages) as mock_poml, \
             patch('sys.stdout', new_callable=StringIO) as mock_out:
            mod = self._run_main()
            
            mod.main()
            mock_poml.assert_called_once_with('prompt.poml', context={'lang': 'Python'})
            self.assertIn('Rendered with context', mock_out.getvalue())

    def test_invalid_context_json_falls_back_to_empty(self):
        fake_messages = [{'content': 'Fallback render'}]

        def path_exists(self):
            return True

        with patch('pathlib.Path.exists', path_exists), \
             patch('builtins.open', mock_open(read_data='not valid json')), \
             patch('poml.poml', return_value=fake_messages) as mock_poml, \
             patch('sys.stdout', new_callable=StringIO) as mock_out:
            mod = self._run_main()
            
            mod.main()
            mock_poml.assert_called_once_with('prompt.poml', context={})

    def test_poml_exception_prints_error(self):
        def path_exists(self):
            return str(self).endswith('prompt.poml')

        with patch('pathlib.Path.exists', path_exists), \
             patch('poml.poml', side_effect=Exception('render failed')), \
             patch('sys.stdout', new_callable=StringIO) as mock_out:
            mod = self._run_main()
            mod.main()
            self.assertIn('Error rendering POML', mock_out.getvalue())

if __name__ == '__main__':
    unittest.main()
