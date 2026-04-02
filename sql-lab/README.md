# SQL Lab (Browser-based SQL Playground)

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
