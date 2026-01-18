# code-lab-assist

> **A powerful, extensible academic code generation tool for instructors, tutors, and students.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
![Python 3.6+](https://img.shields.io/badge/python-3.6%2B-blue)
[![Open in GitHub](https://img.shields.io/badge/github-code--lab--assist-blue?logo=github)](https://github.com/jesse318s/code-lab-assist)

---

## Table of Contents
- [What is code-lab-assist?](#what-is-code-lab-assist)
- [Features](#features)
- [Quickstart](#quickstart)
  - [Notebook Usage](#notebook-usage)
  - [CLI Usage](#cli-usage)
- [What is POML?](#what-is-poml)
- [Example Workflow](#example-workflow)
- [MCP and GitHub Integration](#mcp-and-github-integration)
- [How it Works](#how-it-works)
- [Contributing](#contributing)
- [Resources](#resources)
- [Acknowledgements](#acknowledgements)
- [Contact](#contact)

---

## What is code-lab-assist?

`code-lab-assist` is an AI-powered lab exercise generator and assistant for multi-language coding assignments and interactive programming instruction. It can generate structured lab problems, solutions, test code, and POML prompts, streamlining lesson delivery for both instructors and learners. It provides:
- Language-agnostic template generation (Python, JavaScript, TypeScript, Java, C, C++, C#)
- Interactive notebook workflows as well as script-driven automation
- Heuristic POML generation for lesson scaffolding, assessment, and instant feedback
- Agent/AI integration with GitHub's Model Context Protocol (MCP) for true automation, issue/PR handling, repo querying, and collaborative workflows (see [MCP and GitHub Integration](#mcp-and-github-integration)).

---

## Features

- **Multi-Language Code Lab Generator:** Functions, classes, and interfaces in Python, JavaScript, TypeScript, Java, C, C++, and C#
- **Comprehensive Test Suite Generation:** Automated code testing in supported languages
- **Interactive Jupyter Notebook UI:** Easy, accessible experience for both instructors and students
- **Heuristic POML Prompt Generation:** Quickly scaffold code and problem statements with POML (Prompt Oriented Markup Language)
- **MCP & GitHub Integration:** Use with [GitHub MCP](https://github.com/github/github-mcp-server) for AI/agent-based workflows, automating code review, PRs, and repository management
- **Supports Both Standalone and Automated/Agent-Driven Lab Creation**

---

## Quickstart

### Prerequisites
- **Python 3.6+**
- **Jupyter** (with `ipykernel` and `ipywidgets`)
- Language-specific compilers/interpreters if you wish to compile/run problems or tests
- (Optional) POML renderer/support—e.g., [POML extension for VS Code](https://marketplace.visualstudio.com/items?itemName=)

Install core requirements:
```
pip install -r requirements.txt
```

### Notebook Usage
1. Open `code_lab_ui.ipynb` in Jupyter
2. Select:
   - Programming Language
   - Code type (function/class/interface as supported)
   - Name, parameters, description
3. Click **Generate**
4. Review and copy the generated code lab/problem prompt and scaffolded code

### CLI Usage (for developers)
1. Use `code_lab_generator.py` as a module:
   ```python
   from code_lab_generator import CodeLabGenerator
   gen = CodeLabGenerator()
   code = gen.generate_code('Python', 'adder', 'a: int, b: int', 'Adds two integers', 'function')
   print(code)
   ```
2. Advanced: integrate this into your scripts, batch problem generation, etc.

---

## What is POML?

**Prompt Oriented Markup Language** (POML) is a lightweight language for representing instructional prompts, code scaffolding, or assessment exercises. POML lets you structure lessons, provide input/output examples, and specify test cases in a concise, AI-friendly way.

**Example POML section:**

```
[prompt]
Write a function that adds two integers.
[endprompt]
[solution]
def add(a, b):
    return a + b
[endsolution]
[test]
assert add(2, 3) == 5
assert add(-1, 1) == 0
[endtest]
```

Use a POML renderer (such as the VS Code extension) to view, author, or manage POML labs.

---

## Example Workflow

1. **Instructor** enters assignment in Jupyter UI:
    - Language: Python, Type: function, Name: is_prime, Desc: Check if a number is prime, Params: n: int
2. **Generator** scaffolds:
    ```python
def solve_is_prime(n: int):
    """
    Check if a number is prime
    """
    # TODO: Implement solution
    ```
3. (Optional) Instructor or agent generates a POML prompt/test suite
4. **Student/agent** completes implementation, submits lab
5. Automated/mcp tools run tests and reviewers get AI feedback

---

## MCP and GitHub Integration

Leverage `code-lab-assist` within modern AI/agent-driven IDEs using the [GitHub MCP Server](https://github.com/github/github-mcp-server):

- **Connect to GitHub MCP:**
  - Native support via [VS Code](https://github.com/github/github-mcp-server#install-in-vs-code), [Cursor IDE](https://github.com/github/github-mcp-server/blob/main/docs/installation-guides/install-cursor.md), Claude Desktop, and others.
  - Automate code generation, fetch problems, submit and review labs, manage issues & pull requests.

**Minimal VS Code MCP Config Example:**

```json
{
  "servers": {
    "github": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp/"
    }
  }
}
```

- [More MCP install/config instructions](https://github.com/github/github-mcp-server#installation)

---

## How it Works

- **Templates:** Source code and prompt templates for each language and code entity (function/class/interface)
- **Notebook UI:** Interactive panel in Jupyter, powered by `ipywidgets`, calls into `CodeLabGenerator`
- **CLI API:** Modular generator functions for scripts, agents, or other GUIs
- **MCP Mode:** Integrates with GitHub MCP for AI agent workflows—enabling repo, issue, and PR management through context-aware code generation

---

## Contributing

We welcome contributions from instructors, students, and developers! See [AGENTS.md](./AGENTS.md) for design/role guidelines. To contribute:
- Fork + branch from `main`
- Open a clear PR describing your improvements
- For questions, use [GitHub Issues](https://github.com/jesse318s/code-lab-assist/issues)

Please read [AGENTS.md](./AGENTS.md) for role guidance (Instructor, Tutor, etc.) and best practices.

---

## Resources
- [AGENTS.md](./AGENTS.md)
- [GitHub MCP Server Docs](https://github.com/github/github-mcp-server)
- [Awesome README Patterns](https://github.com/matiassingers/awesome-readme)

---

## Acknowledgements
- POML design inspired by VS Code extensions and open instructional formats
- Thanks to the contributors and the open source AI/edu community

---

## Contact

Created & maintained by [jesse318s](https://github.com/jesse318s)

For support, comment in the Issues tab or <open up a PR>!
