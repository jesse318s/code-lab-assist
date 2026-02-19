import unittest
from unittest.mock import MagicMock
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from code_lab_generator import CodeLabGenerator

class TestCodeLabGenerator(unittest.TestCase):
    def setUp(self):
        self.generator = CodeLabGenerator()

    def test_generate_code_all_templates(self):
        # (lang, name, params, desc, tem_type, expected_snippet)
        cases = [
            ('Python',     'add',      'a, b',          'Add two numbers',   'function',  'def solve_add'),
            ('Python',     'Stack',    'capacity: int',  'A stack',           'class',     'class Stack'),
            ('Java',       'multiply', 'int x, int y',  'Multiply',          'function',  'class Solution_multiply'),
            ('Java',       'Sorter',   'int[] arr',      'Sorting interface', 'interface', 'interface ISorter'),
            ('JavaScript', 'divide',   'num1, num2',     'Divide',            'function',  'function solve_divide'),
            ('TypeScript', 'Queue',    'size: number',   'A queue',           'class',     'class Queue'),
            ('TypeScript', 'Printable','',               'Printable',         'interface', 'interface Printable'),
            ('C',          'subtract', 'int x, int y',  'Subtract',          'function',  'void solve_subtract'),
            ('C#',         'modulus',  'int a, int b',   'Modulus',           'function',  'class Solution_modulus'),
            ('C#',         'Drawable', '',               'Drawable',          'interface', 'interface IDrawable'),
            ('C++',        'power',    'int base, int exp', 'Power',          'function',  'void solve_power'),
            ('C++',        'Matrix',   'int rows, int cols', 'A matrix',      'class',     'class Matrix'),
        ]

        for lang, name, params, desc, tem_type, snippet in cases:
            with self.subTest(lang=lang, tem_type=tem_type):
                result = self.generator.generate_code(lang, name, params, desc, tem_type)
                self.assertIn(snippet, result)
                self.assertIn(desc, result)

    def test_unsupported_language_raises(self):
        with self.assertRaises(ValueError):
            self.generator.generate_code('Ruby', 'foo', '', 'desc', 'function')

    def test_unsupported_template_type_raises(self):
        with self.assertRaises(ValueError):
            self.generator.generate_code('C', 'foo', '', 'desc', 'class')

    def test_list_templates(self):
        templates = self.generator.list_templates()

        for lang in ['Python', 'Java', 'JavaScript', 'TypeScript', 'C', 'C#', 'C++']:
            self.assertIn(lang, templates)
            self.assertIsInstance(templates[lang], list)

class TestLabPanel(unittest.TestCase):
    def _make_panel(self):
        import types
        import importlib
        import ipywidgets

        stub = types.ModuleType('IPython.display')
        stub.display = MagicMock()
        stub.HTML = MagicMock(side_effect=lambda x: x)
        stub.clear_output = MagicMock()

        sys.modules['IPython.display'] = stub

        import json

        nb_path = Path(__file__).parent / 'code_lab_ui.ipynb'
        nb = json.loads(nb_path.read_text(encoding='utf-8'))
        cell_source = ''.join(nb['cells'][0]['source'])
        lines = cell_source.splitlines()
        lines = [l for l in lines if not l.strip().startswith('panel = LabPanel()')]
        module_source = '\n'.join(lines)
        mod = types.ModuleType('lab_panel_module')

        exec(compile(module_source, 'code_lab_ui.ipynb', 'exec'), mod.__dict__)
        return getattr(mod, 'LabPanel', None)()

    def test_panel_initializes(self):
        panel = self._make_panel()

        self.assertIsNotNone(panel)

    def test_panel_has_expected_widgets(self):
        panel = self._make_panel()

        self.assertTrue(hasattr(panel, 'lang_dropdown'))
        self.assertTrue(hasattr(panel, 'template_type'))
        self.assertTrue(hasattr(panel, 'name_text'))
        self.assertTrue(hasattr(panel, 'problem_text'))
        self.assertTrue(hasattr(panel, 'params_text'))
        self.assertTrue(hasattr(panel, 'generate_btn'))

    def test_validate_inputs_empty_name(self):
        panel = self._make_panel()
        panel.name_text.value = ''
        panel.problem_text.value = 'Some description'
        errors = panel._validate_inputs()

        self.assertTrue(any('Name' in e for e in errors))

    def test_validate_inputs_empty_description(self):
        panel = self._make_panel()
        panel.name_text.value = 'valid_name'
        panel.problem_text.value = ''
        errors = panel._validate_inputs()

        self.assertTrue(any('Description' in e for e in errors))

    def test_validate_inputs_passes_with_valid_data(self):
        panel = self._make_panel()
        panel.name_text.value = 'add'
        panel.problem_text.value = 'Add two numbers'
        errors = panel._validate_inputs()

        self.assertEqual(errors, [])

    def test_language_change_updates_template_types(self):
        panel = self._make_panel()
        panel.lang_dropdown.value = 'C'

        self.assertEqual(list(panel.template_type.options), ['function'])

    def test_generate_produces_output(self):
        panel = self._make_panel()
        panel.lang_dropdown.value = 'Python'
        panel.template_type.value = 'function'
        panel.name_text.value = 'add'
        panel.params_text.value = 'a, b'
        panel.problem_text.value = 'Add two numbers'

        panel._on_generate(None)
        self.assertIn('success', panel.status_display.value.lower())

    def test_generate_shows_error_on_invalid_input(self):
        panel = self._make_panel()
        panel.name_text.value = ''
        panel.problem_text.value = ''

        panel._on_generate(None)
        self.assertIn('error', panel.status_display.value.lower())

if __name__ == '__main__':
    unittest.main()
