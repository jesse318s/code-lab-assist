# code-lab-assist

A powerful academic programming tool that generates structured lab problems and solutions across multiple programming languages. It is designed to streamline lessons for instructors and tutors, and it also supports heuristic POML generation.

## Features

- **Multi-Language Support**: Generate code templates for Python, JavaScript, TypeScript, Java, C, C++, C#, and SQL
- **Versatile Code Templates**: Generate functions, classes, and interfaces with appropriate language-specific syntax
- **Automated Testing**: Generate comprehensive test suites for all supported languages
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

### Usage

1. Launch the Jupyter notebook interface (code_lab_ui.ipynb)
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
