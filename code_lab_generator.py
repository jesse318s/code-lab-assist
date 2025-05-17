"""
CodeLabGenerator module for generating code labs from templates
"""

class CodeLabGenerator:
    def __init__(self):
        self._init_templates()

    def _init_templates(self):
        self.templates = {
            'Python': {
                'function': self._get_python_function_template,
                'class': self._get_python_class_template,
            },
            'Java': {
                'function': self._get_java_function_template,
                'class': self._get_java_class_template,
                'interface': self._get_java_interface_template,
            },
            'JavaScript': {
                'function': self._get_javascript_function_template,
                'class': self._get_javascript_class_template,
            },
            'TypeScript': {
                'function': self._get_typescript_function_template,
                'class': self._get_typescript_class_template,
                'interface': self._get_typescript_interface_template,
            },
            'C': {
                'function': self._get_c_function_template,
            },
            'C#': {
                'function': self._get_csharp_function_template,
                'class': self._get_csharp_class_template,
            },
            'C++': {
                'function': self._get_cpp_function_template,
                'class': self._get_cpp_class_template,
            }
        }

    def generate_code(self, lang: str, name: str, params: str, desc: str, template_type='function') -> str:
        if lang not in self.templates:
            raise ValueError(f"Unsupported language: {lang}. Supported languages: {list(self.templates.keys())}")

        if template_type not in self.templates[lang]:
            raise ValueError(f"Unsupported template type: {template_type}. Supported template types for {lang}: {list(self.templates[lang].keys())}")

        template_method = self.templates[lang][template_type]

        return template_method(name, params, desc)

    def _get_python_function_template(self, name: str, params: str, desc: str) -> str:
        solution = '# TODO: Implement solution'

        return f'''
def solve_{name}({params}):
    """
    {desc}
    """
    {solution}
'''
    
    def _get_python_class_template(self, name: str, params: str, desc: str) -> str:
        solution = '# TODO: Implement solution'
        init_params = f'({params})' if params else '()'

        return f'''
class {name}:
    """
    {desc}
    """
    
    def __init__{init_params}:
        {solution}
        
    def solve(self):
        {solution}
'''

    def _get_java_function_template(self, name: str, params: str, desc: str) -> str:
        solution = '// TODO: Implement solution'

        return f'''
/**
 * {desc}
 */
public class Solution_{name} {{
    public static void solve({params}) {{
        {solution}
    }}
}}
'''

    def _get_java_class_template(self, name: str, params: str, desc: str) -> str:
        solution = '// TODO: Implement solution'
        init_params = params if params else ''

        return f'''
/**
 * {desc}
 */
public class {name} {{
    public {name}({init_params}) {{
        {solution}
    }}

    public void solve() {{
        {solution}
    }}
}}
'''

    def _get_java_interface_template(self, name: str, params: str, desc: str) -> str:
        return f'''
/**
 * {desc}
 */
public interface I{name} {{
    void solve({params});
}}
'''

    def _get_javascript_function_template(self, name: str, params: str, desc: str) -> str:
        solution = '// TODO: Implement solution'

        return f'''
/**
 * {desc}
 */
function solve_{name}({params}) {{
    {solution}
}}
'''

    def _get_javascript_class_template(self, name: str, params: str, desc: str) -> str:
        solution = '// TODO: Implement solution'
        init_params = params if params else ''

        return f'''
/**
 * {desc}
 */
class {name} {{
    constructor({init_params}) {{
        {solution}
    }}

    solve() {{
        {solution}
    }}
}}
'''
    
    def _get_typescript_function_template(self, name: str, params: str, desc: str) -> str:
        solution = '// TODO: Implement solution'

        return f'''
/**
    * {desc}
    */
function solve_{name}({params}): void {{
    {solution}
}}
'''
    
    def _get_typescript_class_template(self, name: str, params: str, desc: str) -> str:
        solution = '// TODO: Implement solution'
        init_params = params if params else ''

        return f'''
/**
    * {desc}
    */
class {name} {{
    constructor({init_params}) {{
        {solution}
    }}
    
    solve(): void {{
        {solution}
    }}
}}
'''
    
    def _get_typescript_interface_template(self, name: str, params: str, desc: str) -> str:
        return f'''
/**
    * {desc}
    */
interface {name} {{
    solve({params}): void;
}}
'''

    def _get_c_function_template(self, name: str, params: str, desc: str) -> str:
        solution = '// TODO: Implement solution'

        return f'''
/**
 * {desc}
 */
void solve_{name}({params}) {{
    {solution}
}}
'''

    def _get_csharp_function_template(self, name: str, params: str, desc: str) -> str:
        solution = '// TODO: Implement solution'

        return f'''
/**
 * {desc}
 */
public class Solution_{name} {{
    public static void Solve({params}) {{
        {solution}
    }}
}}
'''

    def _get_csharp_class_template(self, name: str, params: str, desc: str) -> str:
        solution = '// TODO: Implement solution'
        init_params = params if params else ''

        return f'''
/**
 * {desc}
 */
public class {name} {{
    public {name}({init_params}) {{
        {solution}
    }}

    public void Solve() {{
        {solution}
    }}
}}
'''

    def _get_cpp_function_template(self, name: str, params: str, desc: str) -> str:
        solution = '// TODO: Implement solution'

        return f'''
/**
 * {desc}
 */
void solve_{name}({params}) {{
    {solution}
}}
'''

    def _get_cpp_class_template(self, name: str, params: str, desc: str) -> str:
        solution = '// TODO: Implement solution'
        init_params = params if params else ''
        
        return f'''
/**
 * {desc}
 */
class {name} {{
public:
    {name}({init_params}) {{
        {solution}
    }}

    void solve() {{
        {solution}
    }}

private:
}};
'''