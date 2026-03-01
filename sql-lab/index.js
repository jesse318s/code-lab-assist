import { SQLGenerator } from "./js/SQLGenerator.js";
import { SQLDatabase } from "./js/SQLDatabase.js";

const defaultConfig = {
  generator: { schema: "my_db", table: "my_table" },
  query: { idValues: ["1", "2"], whereCol: "id" },
  proc: {
    procName: "my_proc",
    setCol: "col",
    setVal: "value",
    whereCol: "id",
    whereVal: "1",
  },
};

/**
 * Loads SQL lab config from sql-lab-config.json, falling back
 * to defaults if the file is missing or invalid.
 *
 * @returns {Promise<object>} The resolved config object
 */
const loadConfig = async () => {
  try {
    const response = await fetch("./sql-lab-config.json");

    if (!response.ok) return defaultConfig;

    return await response.json();
  } catch {
    return defaultConfig;
  }
};

const config = await loadConfig();
const generator = new SQLGenerator(config.generator.schema, config.generator.table);
const database = new SQLDatabase("sql_lab_db");
const output = document.getElementById("output");
const queryInput = document.getElementById("queryInput");

/**
 * Renders a message to the output area.
 *
 * @param {string} text - The message text
 * @param {string} className - CSS class name for styling (error, success, info)
 */
const showMessage = (text, className) => {
  const p = document.createElement("p");

  p.className = className;
  p.textContent = text;
  output.appendChild(p);
};

/**
 * Renders query results as an HTML table in the output area.
 *
 * @param {{ columns: string[], rows: object[] }} result - The query result
 */
const renderTable = (result) => {
  if (result.rows.length === 0) {
    showMessage("Query returned no rows.", "info");
    return;
  }

  const table = document.createElement("table");
  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");

  result.columns.forEach((col) => {
    const th = document.createElement("th");

    th.textContent = col;
    headerRow.appendChild(th);
  });

  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");

  result.rows.forEach((row) => {
    const tr = document.createElement("tr");

    result.columns.forEach((col) => {
      const td = document.createElement("td");

      td.textContent = row[col] !== null ? row[col] : "NULL";
      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  output.appendChild(table);
};

// Initialize the database on page load
await database.init();
console.log("SQL database initialized.");

document.getElementById("queryButton").addEventListener("click", () => {
  output.innerHTML = "";

  const qCfg = config.query;
  const queries = generator.generateSelectQueries(qCfg.idValues, qCfg.whereCol);
  const elemTxt = document.createElement("pre");

  elemTxt.textContent = queries;
  output.appendChild(elemTxt);
  queryInput.value = generator.generateSelectQuery(qCfg.idValues[0], qCfg.whereCol);
  console.log("SQL query generation complete.");
});

document.getElementById("procButton").addEventListener("click", () => {
  output.innerHTML = "";

  const pCfg = config.proc;
  const proc = generator.generateUpdateProc(
    pCfg.procName,
    pCfg.setCol,
    pCfg.setVal,
    pCfg.whereCol,
    pCfg.whereVal,
    pCfg.condCol,
    pCfg.condVal
  );
  const elemTxt = document.createElement("pre");

  elemTxt.textContent = proc;
  output.appendChild(elemTxt);
  console.log("SQL procedure generation complete.");
});

document.getElementById("runButton").addEventListener("click", () => {
  output.innerHTML = "";

  const sql = queryInput.value.trim();

  if (!sql) {
    showMessage("Enter a SQL statement to run.", "error");
    return;
  }

  try {
    const upperSql = sql.replace(/^--.*\n/gm, "").trimStart().toUpperCase();
    const isReadStatement = /^(SELECT|PRAGMA|EXPLAIN|WITH)\b/.test(upperSql);

    if (isReadStatement) {
      const result = database.query(sql);

      renderTable(result);
      showMessage(`${result.rows.length} row(s) returned.`, "success");
    } else {
      const result = database.execute(sql);

      showMessage(
        `Statement executed successfully. ${result.changes} row(s) affected.`,
        "success"
      );
    }

    console.log("SQL execution complete.");
  } catch (err) {
    showMessage(err.message, "error");
    console.error(err);
  }
});

document.getElementById("tablesButton").addEventListener("click", () => {
  output.innerHTML = "";

  try {
    const tables = database.listTables();

    if (tables.length === 0) {
      showMessage("No tables in database.", "info");
      return;
    }

    tables.forEach((table) => {
      const heading = document.createElement("h3");

      heading.textContent = table;
      heading.style.marginTop = "10px";
      output.appendChild(heading);

      const cols = database.describeTable(table);
      const result = {
        columns: ["name", "type", "notNull", "pk"],
        rows: cols.map((c) => ({
          name: c.name,
          type: c.type,
          notNull: c.notNull ? "YES" : "NO",
          pk: c.pk ? "YES" : "NO",
        })),
      };

      renderTable(result);
    });

    console.log("Table listing complete.");
  } catch (err) {
    showMessage(err.message, "error");
    console.error(err);
  }
});

document.getElementById("resetButton").addEventListener("click", async () => {
  output.innerHTML = "";

  try {
    await database.reset();
    showMessage("Database has been reset.", "success");
    console.log("Database reset complete.");
  } catch (err) {
    showMessage(err.message, "error");
    console.error(err);
  }
});
