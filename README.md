# code-lab-assist

A powerful academic programming tool that generates structured lab problems and solutions across multiple programming languages. It is designed to streamline lessons for instructors and tutors, and it also supports heuristic POML generation.

## Features

- **Multi-Language Support**: Generate code templates for Python, JavaScript, TypeScript, Java, C, C++, C#, and SQL
- **Versatile Code Templates**: Generate functions, classes, and interfaces with appropriate language-specific syntax
- **Automated Testing**: Generate comprehensive test suites for all supported languages
- **Runtime Vulnerability Scanning**: Playwright tests can run BrainScan directly in the browser runtime to detect risky patterns in rendered lab code
- **User-Friendly Interface**: Interactive Jupyter notebook interface for easy lab creation
- **Heuristic POML Generation**: Generate powerful and intuitive POML prompts for any purpose

## Getting Started

### Prerequisites

- Python 3.6+
- IDE support for Python, Jupyter notebooks, and GitHub Copilot (or an OpenCode installation instead of GitHub Copilot)
- _ipykernel_ and _ipywidgets_ python packages for Jupyter notebook execution (see requirements.txt)
- _poml_ python package for rendering POML prompts (see requirements.txt)
- Language-specific compilers/interpreters for testing code
- A web browser, internet connection, and way to serve websites locally for the SQL Lab (e.g., Live Server extension in VS Code)
- Git access to the private [brainscan](https://github.com/jesse318s/brainscan) repository (required for runtime vulnerability scanning)

### Usage

1. Launch the Jupyter notebook interface (`code_lab_ui.ipynb`)
2. Use the interactive form to specify:
   - Programming language
   - Code type (function, class, or interface)
   - Name
   - Problem description
   - Parameters
3. Click "Generate" to create your lab

### Browser Runtime Security Testing (BrainScan + Playwright)

#### BrainScan Submodule Setup

This project uses the private [brainscan](https://github.com/jesse318s/brainscan) repository as a git submodule for browser-based runtime vulnerability scanning.

**To clone the repository with the submodule:**

```bash
git clone --recurse-submodules https://github.com/jesse318s/brainscan.git
```

**To initialize the submodule after cloning:**

```bash
git submodule update --init --recursive
```

This will populate the `brainscan/` directory with the required files, including the vendored `brain.js` bundle.

#### Running the Playwright-based Runtime Scan Tests

The Playwright suite includes runtime security tests in `playwright-tests/test_brainscan.py`.
These tests inject the vendored BrainScan browser bundle (`brainscan/vendor/brain.js/browser.js`) into the page, restore the trained network snapshot from `brainscan/data/trained-network.json`, and scan runtime page content for vulnerability indicators.

Key behavior:

- Scanning happens inside the browser runtime (not through a separate scan API call)
- The injected BrainScan script is excluded from the scanned content to avoid false positives from the scanner implementation itself
- Tests fail when the predicted risk reaches the Critical threshold

To run the Playwright-based runtime scan tests:

```bash
pytest playwright-tests/test_brainscan.py
```

If the trained snapshot file does not exist yet, generate it by running BrainScan once from `brainscan/`:

```bash
cd brainscan && node index.js && cd ..
```

This will create `brainscan/data/trained-network.json` (gitignored) for use by the tests.

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

### SQL Lab (Browser-based SQL Playground)

The `sql-lab/` directory provides a browser-based SQL playground with two main capabilities: an in-browser SQLite database for running real queries and an SQL generator for producing query and procedure templates.

**Opening the lab:**

Open `sql-lab/index.html` in a browser. The page loads sql.js (SQLite compiled to WebAssembly) from a CDN, so an internet connection is needed on first load.

**UI Controls:**

- **Generate Queries** — Produces SELECT query templates using the configured schema, table, and identifier values
- **Generate Procedures** — Produces an UPDATE stored procedure template from the configured parameters
- **Run SQL** — Executes whatever SQL is in the textarea against the in-browser SQLite database. SELECT and PRAGMA statements display results as a table; write statements (CREATE, INSERT, UPDATE, DELETE) report the number of rows affected
- **Show Tables** — Lists all tables in the database with their column metadata (name, type, NOT NULL, primary key)
- **Reset Database** — Drops all data and tables, returning the database to an empty state

**Database persistence:**

The SQLite database is automatically saved to `localStorage` after every write operation. Refreshing the page or reopening the browser restores the previous state. Use the Reset Database button to clear it.

**Configuration (`sql-lab/sql-lab-config.json`):**

The Generate Queries and Generate Procedures buttons read their parameters from `sql-lab-config.json`. If the file is missing or invalid, built-in defaults are used.
