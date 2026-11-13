# code-lab-assist

A powerful academic programming tool that generates lessons and structured labs across multiple programming languages and environments. It's designed to streamline lessons for instructors and tutors with automated testing. It also supports heuristic POML generation.

## Features

- **Multi-Language Support**: Generate code templates for Python, JavaScript, TypeScript, Java, C, C++, C#, and SQL
- **Versatile Code Templates**: Generate functions, classes, and interfaces with appropriate language-specific syntax
- **Automated Testing**: Generate comprehensive test suites for all supported languages and environments
- **Vulnerability Scanning**: Playwright tests can run BrainScan directly in the browser runtime to detect risky patterns in all lab code
- **User-Friendly Interface**: Interactive Jupyter notebook interface for easy lab creation
- **Heuristic POML Generation**: Generate powerful and intuitive POML prompts for any purpose

## Getting Started

### Prerequisites

- Python 3.11+
- IDE support for Python, Jupyter notebooks, and GitHub Copilot (or an OpenCode installation instead of GitHub Copilot)
- `requirements.txt` dependencies installed (`pip install -r requirements.txt`)
- Language-specific compilers/interpreters for testing code
- A web browser, internet connection, and way to serve websites locally for the SQL Lab (e.g., Live Server extension in VS Code)
- Git access to the [brainscan](https://github.com/jesse318s/brainscan) repository (required for vulnerability scanning)

### Usage

1. Launch the Jupyter notebook interface (`code_lab_ui.ipynb`)
2. Use the interactive form to specify:
   - Programming language
   - Code type (function, class, or interface)
   - Name
   - Problem description
   - Parameters
3. Click "Generate" to create your lab

### POML Renderer

The project includes a simplified POML renderer (`poml_renderer.py`) for rendering POML prompts with context variables. The renderer is designed to be minimal and straightforward:

```bash
python poml_renderer.py
```

**Features:**

- Renders `prompt.poml`
- Loads context from `prompt_context.json` (optional)
- Outputs rendered content directly to stdout
- Minimal, clean implementation without command-line complexity

**Config Files:**

- `prompt.poml` - The POML prompt file to render
- `prompt_context.json` - Context variables (optional, uses empty context if not found)

### Testing

Each lab needs its own compiler/runtime installed, and `pip install -r requirements.txt` is assumed.

```bash
# Generator and POML unit tests
python -m unittest test_code_lab_generation test_poml_renderer -v

# Python lab
python -m unittest python-lab/test_main.py -v

# TypeScript lab (Jest)
npm --prefix typescript-lab install && npm --prefix typescript-lab test

# C# lab (xUnit)
dotnet test csharp-lab/ConsoleApp1.Tests/ConsoleApp1.Tests.csproj

# Java lab
javac -d java-lab/bin java-lab/src/App.java java-lab/src/AppTest.java && java -cp java-lab/bin AppTest

# SvelteKit mobile app lab (Vitest)
cd sveltekit-mobile-app-lab && npm install && npx vitest run && cd ..

# C / C++ labs (build and smoke-run; no existing assertions)
# If using cmd, use c-lab\program.exe instead of ./c-lab/program.exe for compatibility
gcc -Wall -std=c11 c-lab/main.c -o c-lab/program.exe && ./c-lab/program.exe
# If using cmd, use cplusplus-lab\program.exe instead of ./cplusplus-lab/program.exe for compatibility
g++ -Wall -std=c++11 cplusplus-lab/main.cpp -o cplusplus-lab/program.exe && ./cplusplus-lab/program.exe

# Install the Playwright browser (once per machine)
python -m playwright install chromium

# JavaScript, SQL, and security tests (Playwright; some in-browser assertions for JavaScript and SQL must be checked in the browser console)
python -m pytest playwright-tests -v
```

The security/BrainScan tests require the optional `brainscan` submodule.

### Browser Runtime Security Testing (BrainScan + Playwright)

#### BrainScan Submodule Setup

This project uses the [brainscan](https://github.com/jesse318s/brainscan) repository as a git submodule for browser-based vulnerability scanning.

**To clone the repository with the submodule:**

```bash
git clone https://github.com/jesse318s/brainscan.git
```

#### Running the Playwright-based Vulnerability Scan Tests

The Playwright suite includes runtime security tests in `playwright-tests/test_vulns.py`.
These tests inject the vendored BrainScan browser bundle (`brainscan/vendor/brain.js/browser.js`) and lab index src code into the page, restore the trained network snapshot from `brainscan/data/trained-network.json`, and scan runtime page content for vulnerability indicators.

Key behavior:

- Scanning happens inside the browser runtime (not through a separate scan API call)
- The injected BrainScan script is excluded from the scanned content to avoid false positives from the scanner implementation itself
- Tests fail when the predicted risk reaches the Critical threshold

If the trained snapshot file does not exist yet, generate it by running BrainScan once from `brainscan/`:

```bash
cd brainscan && node index.js && cd ..
```

This will create `brainscan/data/trained-network.json` (gitignored) for use by the tests. (It may need to be deleted and recreated if it causes false positives)
