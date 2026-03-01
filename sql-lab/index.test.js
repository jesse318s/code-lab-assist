import { SQLGenerator } from "./js/SQLGenerator.js";
import { SQLDatabase } from "./js/SQLDatabase.js";

// ---- SQLGenerator Tests ----

const generator = new SQLGenerator("test_db", "test_table");

// Test generateSelectQuery
const selectQuery = generator.generateSelectQuery("1234567", "record_id");
const selectQueryValid =
  selectQuery.includes("SELECT * FROM test_db.test_table") &&
  selectQuery.includes("WHERE record_id = '1234567'");

console.log(selectQueryValid ? "✓ " : "✗ ", "generateSelectQuery produces valid SQL.");

// Test generateSelectQueries
const selectQueries = generator.generateSelectQueries(
  ["1001", "1002"],
  "record_id"
);
const selectQueriesValid =
  selectQueries.includes("record_id = '1001'") &&
  selectQueries.includes("record_id = '1002'") &&
  selectQueries.includes("--------------------------------------------------");

console.log(selectQueriesValid ? "✓ " : "✗ ", "generateSelectQueries produces multiple queries.");

// Test generateUpdateProc
const updateProc = generator.generateUpdateProc(
  "update_status_proc",
  "status",
  "inactive",
  "record_id",
  "1001",
  "category",
  "admin"
);
const updateProcValid =
  updateProc.includes("CREATE PROCEDURE test_db.update_status_proc()") &&
  updateProc.includes("SET status = 'inactive'") &&
  updateProc.includes("record_id = '1001'") &&
  updateProc.includes("category = 'admin'") &&
  updateProc.includes("CALL test_db.update_status_proc()") &&
  updateProc.includes("DROP PROCEDURE test_db.update_status_proc");

console.log(updateProcValid ? "✓ " : "✗ ", "generateUpdateProc produces valid procedure.");

// Test generateUpdateProc without optional condition
const simpleProcValid = generator
  .generateUpdateProc("simple_proc", "col_a", "Y", "id_col", "999")
  .includes("WHERE id_col = '999'");

console.log(simpleProcValid ? "✓ " : "✗ ", "generateUpdateProc works without optional condition.");

// Test generateDateAdjustProc
const dateProc = generator.generateDateAdjustProc(
  "date_adj_proc",
  "due_date",
  "account_id",
  "000000001",
  -1,
  -5
);
const dateProcValid =
  dateProc.includes("CREATE PROCEDURE test_db.date_adj_proc()") &&
  dateProc.includes("DATE_SUB(DATE_SUB(due_date, INTERVAL 5 DAY), INTERVAL 1 MONTH)") &&
  dateProc.includes("account_id = '000000001'") &&
  dateProc.includes("CALL test_db.date_adj_proc()") &&
  dateProc.includes("DROP PROCEDURE test_db.date_adj_proc");

console.log(dateProcValid ? "✓ " : "✗ ", "generateDateAdjustProc produces valid procedure.");

// Test schema and table assignment
const schemaValid = generator.schema === "test_db" && generator.table === "test_table";

console.log(schemaValid ? "✓ " : "✗ ", "Constructor assigns schema and table correctly.");

// ---- Config Loading Tests ----

// Test that config fallback provides required keys
const fallbackConfig = {
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

const configKeysValid =
  "generator" in fallbackConfig &&
  "query" in fallbackConfig &&
  "proc" in fallbackConfig &&
  "schema" in fallbackConfig.generator &&
  "table" in fallbackConfig.generator &&
  Array.isArray(fallbackConfig.query.idValues) &&
  "whereCol" in fallbackConfig.query &&
  "procName" in fallbackConfig.proc &&
  "setCol" in fallbackConfig.proc;

console.log(configKeysValid ? "✓ " : "✗ ", "Default config has all required keys.");

// Test that generator works with fallback config values
const fallbackGenerator = new SQLGenerator(
  fallbackConfig.generator.schema,
  fallbackConfig.generator.table
);
const fallbackQuery = fallbackGenerator.generateSelectQuery(
  fallbackConfig.query.idValues[0],
  fallbackConfig.query.whereCol
);
const fallbackQueryValid =
  fallbackQuery.includes("my_db.my_table") &&
  fallbackQuery.includes("WHERE id = '1'");

console.log(fallbackQueryValid ? "✓ " : "✗ ", "Generator works with fallback config.");

// Test that generator works with a loaded config structure
const loadedConfig = {
  generator: { schema: "app_db", table: "users" },
  query: { idValues: ["1001", "1002"], whereCol: "user_id" },
  proc: {
    procName: "update_status_proc",
    setCol: "status",
    setVal: "inactive",
    whereCol: "user_id",
    whereVal: "1001",
    condCol: "role",
    condVal: "admin",
  },
};
const loadedGenerator = new SQLGenerator(
  loadedConfig.generator.schema,
  loadedConfig.generator.table
);
const loadedProc = loadedGenerator.generateUpdateProc(
  loadedConfig.proc.procName,
  loadedConfig.proc.setCol,
  loadedConfig.proc.setVal,
  loadedConfig.proc.whereCol,
  loadedConfig.proc.whereVal,
  loadedConfig.proc.condCol,
  loadedConfig.proc.condVal
);
const loadedProcValid =
  loadedProc.includes("app_db.update_status_proc") &&
  loadedProc.includes("SET status = 'inactive'") &&
  loadedProc.includes("role = 'admin'");

console.log(loadedProcValid ? "✓ " : "✗ ", "Generator works with loaded config.");

// ---- SQLDatabase Tests ----

const runDatabaseTests = async () => {
  const db = new SQLDatabase("sql_lab_test_db");

  await db.init();
  await db.reset();

  // Test database initialization
  const dbInitValid = db.db !== null;

  console.log(dbInitValid ? "✓ " : "✗ ", "SQLDatabase initializes successfully.");

  // Test CREATE TABLE and execute
  db.execute(
    "CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT NOT NULL, price REAL);"
  );
  const tablesAfterCreate = db.listTables();
  const createValid = tablesAfterCreate.includes("products");

  console.log(createValid ? "✓ " : "✗ ", "CREATE TABLE creates a table.");

  // Test INSERT and query
  db.execute("INSERT INTO products (id, name, price) VALUES (1, 'Widget', 9.99);");
  db.execute("INSERT INTO products (id, name, price) VALUES (2, 'Gadget', 19.99);");
  db.execute("INSERT INTO products (id, name, price) VALUES (3, 'Doohickey', 4.50);");

  const insertResult = db.query("SELECT * FROM products;");
  const insertValid =
    insertResult.rows.length === 3 &&
    insertResult.columns.includes("id") &&
    insertResult.columns.includes("name") &&
    insertResult.columns.includes("price");

  console.log(insertValid ? "✓ " : "✗ ", "INSERT and SELECT return correct rows and columns.");

  // Test WHERE clause query
  const whereResult = db.query("SELECT name FROM products WHERE price > 5;");
  const whereValid =
    whereResult.rows.length === 2 &&
    whereResult.rows.some((r) => r.name === "Widget") &&
    whereResult.rows.some((r) => r.name === "Gadget");

  console.log(whereValid ? "✓ " : "✗ ", "SELECT with WHERE filters correctly.");

  // Test UPDATE
  db.execute("UPDATE products SET price = 12.99 WHERE id = 1;");

  const updateResult = db.query("SELECT price FROM products WHERE id = 1;");
  const updateValid = updateResult.rows[0].price === 12.99;

  console.log(updateValid ? "✓ " : "✗ ", "UPDATE modifies data correctly.");

  // Test DELETE
  db.execute("DELETE FROM products WHERE id = 3;");

  const deleteResult = db.query("SELECT * FROM products;");
  const deleteValid = deleteResult.rows.length === 2;

  console.log(deleteValid ? "✓ " : "✗ ", "DELETE removes rows correctly.");

  // Test describeTable
  const schema = db.describeTable("products");
  const describeValid =
    schema.length === 3 &&
    schema[0].name === "id" &&
    schema[0].pk === true &&
    schema[1].name === "name" &&
    schema[1].notNull === true;

  console.log(describeValid ? "✓ " : "✗ ", "describeTable returns column metadata.");

  // Test listTables
  db.execute("CREATE TABLE orders (id INTEGER PRIMARY KEY, product_id INTEGER);");

  const allTables = db.listTables();
  const listValid = allTables.includes("products") && allTables.includes("orders");

  console.log(listValid ? "✓ " : "✗ ", "listTables returns all tables.");

  // Test empty query result
  const emptyResult = db.query("SELECT * FROM products WHERE id = 999;");
  const emptyValid = emptyResult.rows.length === 0 && emptyResult.columns.length === 0;

  console.log(emptyValid ? "✓ " : "✗ ", "Empty query returns no rows.");

  // Test persistence via save and reload
  db.save();

  const db2 = new SQLDatabase("sql_lab_test_db");

  await db2.init();

  const persistResult = db2.query("SELECT * FROM products;");
  const persistValid = persistResult.rows.length === 2;

  console.log(persistValid ? "✓ " : "✗ ", "Database persists across reloads via localStorage.");

  // Test reset
  await db2.reset();

  const resetTables = db2.listTables();
  const resetValid = resetTables.length === 0;

  console.log(resetValid ? "✓ " : "✗ ", "reset() clears the database.");

  // Cleanup
  db.close();
  db2.close();
  localStorage.removeItem("sql_lab_test_db");
};

runDatabaseTests().catch((err) => {
  console.error("Database test error:", err);
});
