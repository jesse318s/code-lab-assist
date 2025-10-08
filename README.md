# code-lab-assist

A powerful academic programming tool that generates structured lab problems and solutions across multiple programming languages. It is designed to streamline lessons for instructors and tutors, and it also supports heuristic POML generation.

## Features

- **Multi-Language Support**: Generate code templates for Python, JavaScript, TypeScript, Java, C, C++, and C#
- **Versatile Code Templates**: Generate functions, classes, and interfaces with appropriate language-specific syntax
- **Automated Testing**: Generate comprehensive test suites for all supported languages
- **User-Friendly Interface**: Interactive Jupyter notebook interface for easy lab creation
- **Heuristic POML Generation**: Generate powerful and intuitive POML prompts for any purpose

## Getting Started

### Prerequisites

- Python 3.6+
- IDE support for Python, Jupyter notebooks, and GitHub Copilot (Copilot is the recommended AI assistant)
- _ipykernel_ and _ipywidgets_ python packages for Jupyter notebook execution (see requirements.txt)
- Language-specific compilers/interpreters for testing code
- POML renderer for proper usage of POML prompts (e.g, the POML extension for VS Code)

### Usage

1. Launch the Jupyter notebook interface (code_lab_ui.ipynb)
2. Use the interactive form to specify:
   - Programming language
   - Code type (function, class, or interface)
   - Name
   - Problem description
   - Parameters
3. Click "Generate" to create your lab
