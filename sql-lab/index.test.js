import { SQLGenerator } from "./js/SQLGenerator.js";
import { SQLDatabase } from "./js/SQLDatabase.js";
import { SQLLesson, SQLLessonLibrary } from "./js/SQLLesson.js";
import { SQLExercise, SQLExerciseManager } from "./js/SQLExercise.js";
import { SQLQueryBuilder } from "./js/SQLQueryBuilder.js";

// ---- SQLGenerator Tests ----

const generator = new SQLGenerator("test_db", "test_table");

// Test generateSelectQuery
const selectQuery = generator.generateSelectQuery("1234567", "record_id");
const selectQueryValid =
  selectQuery.includes("SELECT * FROM test_db.test_table") &&
  selectQuery.includes("WHERE record_id = '1234567'");

console.log(
  selectQueryValid ? "✓ " : "✗ ",
  "generateSelectQuery produces valid SQL.",
);

// Test generateSelectQueries
const selectQueries = generator.generateSelectQueries(
  ["1001", "1002"],
  "record_id",
);
const selectQueriesValid =
  selectQueries.includes("record_id = '1001'") &&
  selectQueries.includes("record_id = '1002'") &&
  selectQueries.includes("--------------------------------------------------");

console.log(
  selectQueriesValid ? "✓ " : "✗ ",
  "generateSelectQueries produces multiple queries.",
);

// Test generateUpdateProc
const updateProc = generator.generateUpdateProc(
  "update_status_proc",
  "status",
  "inactive",
  "record_id",
  "1001",
  "category",
  "admin",
);
const updateProcValid =
  updateProc.includes("CREATE PROCEDURE test_db.update_status_proc()") &&
  updateProc.includes("SET status = 'inactive'") &&
  updateProc.includes("record_id = '1001'") &&
  updateProc.includes("category = 'admin'") &&
  updateProc.includes("CALL test_db.update_status_proc()") &&
  updateProc.includes("DROP PROCEDURE test_db.update_status_proc");

console.log(
  updateProcValid ? "✓ " : "✗ ",
  "generateUpdateProc produces valid procedure.",
);

// Test generateUpdateProc without optional condition
const simpleProcValid = generator
  .generateUpdateProc("simple_proc", "col_a", "Y", "id_col", "999")
  .includes("WHERE id_col = '999'");

console.log(
  simpleProcValid ? "✓ " : "✗ ",
  "generateUpdateProc works without optional condition.",
);

// Test generateDateAdjustProc
const dateProc = generator.generateDateAdjustProc(
  "date_adj_proc",
  "due_date",
  "account_id",
  "000000001",
  -1,
  -5,
);
const dateProcValid =
  dateProc.includes("CREATE PROCEDURE test_db.date_adj_proc()") &&
  dateProc.includes(
    "DATE_SUB(DATE_SUB(due_date, INTERVAL 5 DAY), INTERVAL 1 MONTH)",
  ) &&
  dateProc.includes("account_id = '000000001'") &&
  dateProc.includes("CALL test_db.date_adj_proc()") &&
  dateProc.includes("DROP PROCEDURE test_db.date_adj_proc");

console.log(
  dateProcValid ? "✓ " : "✗ ",
  "generateDateAdjustProc produces valid procedure.",
);

// Test schema and table assignment
const schemaValid =
  generator.schema === "test_db" && generator.table === "test_table";

console.log(
  schemaValid ? "✓ " : "✗ ",
  "Constructor assigns schema and table correctly.",
);

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

console.log(
  configKeysValid ? "✓ " : "✗ ",
  "Default config has all required keys.",
);

// Test that generator works with fallback config values
const fallbackGenerator = new SQLGenerator(
  fallbackConfig.generator.schema,
  fallbackConfig.generator.table,
);
const fallbackQuery = fallbackGenerator.generateSelectQuery(
  fallbackConfig.query.idValues[0],
  fallbackConfig.query.whereCol,
);
const fallbackQueryValid =
  fallbackQuery.includes("my_db.my_table") &&
  fallbackQuery.includes("WHERE id = '1'");

console.log(
  fallbackQueryValid ? "✓ " : "✗ ",
  "Generator works with fallback config.",
);

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
  loadedConfig.generator.table,
);
const loadedProc = loadedGenerator.generateUpdateProc(
  loadedConfig.proc.procName,
  loadedConfig.proc.setCol,
  loadedConfig.proc.setVal,
  loadedConfig.proc.whereCol,
  loadedConfig.proc.whereVal,
  loadedConfig.proc.condCol,
  loadedConfig.proc.condVal,
);
const loadedProcValid =
  loadedProc.includes("app_db.update_status_proc") &&
  loadedProc.includes("SET status = 'inactive'") &&
  loadedProc.includes("role = 'admin'");

console.log(
  loadedProcValid ? "✓ " : "✗ ",
  "Generator works with loaded config.",
);

// ---- SQLDatabase Tests ----

const runDatabaseTests = async () => {
  const db = new SQLDatabase("sql_lab_test_db");

  await db.init();
  await db.reset();

  // Test database initialization
  const dbInitValid = db.db !== null;

  console.log(
    dbInitValid ? "✓ " : "✗ ",
    "SQLDatabase initializes successfully.",
  );

  // Test CREATE TABLE and execute
  db.execute(
    "CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT NOT NULL, price REAL);",
  );
  const tablesAfterCreate = db.listTables();
  const createValid = tablesAfterCreate.includes("products");

  console.log(createValid ? "✓ " : "✗ ", "CREATE TABLE creates a table.");

  // Test INSERT and query
  db.execute(
    "INSERT INTO products (id, name, price) VALUES (1, 'Widget', 9.99);",
  );
  db.execute(
    "INSERT INTO products (id, name, price) VALUES (2, 'Gadget', 19.99);",
  );
  db.execute(
    "INSERT INTO products (id, name, price) VALUES (3, 'Doohickey', 4.50);",
  );

  const insertResult = db.query("SELECT * FROM products;");
  const insertValid =
    insertResult.rows.length === 3 &&
    insertResult.columns.includes("id") &&
    insertResult.columns.includes("name") &&
    insertResult.columns.includes("price");

  console.log(
    insertValid ? "✓ " : "✗ ",
    "INSERT and SELECT return correct rows and columns.",
  );

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

  console.log(
    describeValid ? "✓ " : "✗ ",
    "describeTable returns column metadata.",
  );

  // Test listTables
  db.execute(
    "CREATE TABLE orders (id INTEGER PRIMARY KEY, product_id INTEGER);",
  );

  const allTables = db.listTables();
  const listValid =
    allTables.includes("products") && allTables.includes("orders");

  console.log(listValid ? "✓ " : "✗ ", "listTables returns all tables.");

  // Test empty query result
  const emptyResult = db.query("SELECT * FROM products WHERE id = 999;");
  const emptyValid =
    emptyResult.rows.length === 0 && emptyResult.columns.length === 0;

  console.log(emptyValid ? "✓ " : "✗ ", "Empty query returns no rows.");

  // Test persistence via save and reload
  db.save();

  const db2 = new SQLDatabase("sql_lab_test_db");

  await db2.init();

  const persistResult = db2.query("SELECT * FROM products;");
  const persistValid = persistResult.rows.length === 2;

  console.log(
    persistValid ? "✓ " : "✗ ",
    "Database persists across reloads via localStorage.",
  );

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

// ---- SQLLesson / SQLLessonLibrary Tests ----

const runSQLLessonTests = () => {
  // Constructor assigns all fields correctly
  const lesson = new SQLLesson("test-lesson", {
    title: "Test Lesson",
    theory: "Theory text",
    concepts: ["SELECT", "FROM"],
    examples: [{ description: "ex", sql: "SELECT 1;" }],
    exercises: [{ id: 1, prompt: "Do something", expectedSql: "SELECT 1" }],
    hints: ["Hint one", "Hint two"],
  });

  const constructorValid =
    lesson.lessonId === "test-lesson" &&
    lesson.title === "Test Lesson" &&
    lesson.theory === "Theory text" &&
    lesson.concepts.length === 2 &&
    lesson.examples.length === 1 &&
    lesson.exercises.length === 1 &&
    lesson.hints.length === 2;

  console.log(constructorValid ? "✓ " : "✗ ", "SQLLesson constructor assigns all fields.");

  // getLessonContent returns the correct summary shape
  const content = lesson.getLessonContent();
  const contentValid =
    content.lessonId === "test-lesson" &&
    content.title === "Test Lesson" &&
    content.theory === "Theory text" &&
    Array.isArray(content.concepts) &&
    typeof content.exercises === "number" &&
    typeof content.hints === "number";

  console.log(contentValid ? "✓ " : "✗ ", "getLessonContent returns the correct summary shape.");

  // getTheory and getExamples return the right data
  const theoryValid = lesson.getTheory() === "Theory text";
  const examplesValid = lesson.getExamples().length === 1 && lesson.getExamples()[0].sql === "SELECT 1;";

  console.log(theoryValid ? "✓ " : "✗ ", "getTheory returns theory text.");
  console.log(examplesValid ? "✓ " : "✗ ", "getExamples returns examples array.");

  // getHint returns hint by index and null when out of range
  const hintValid = lesson.getHint(0) === "Hint one" && lesson.getHint(1) === "Hint two";
  const hintNullValid = lesson.getHint(99) === null && lesson.getHint(-1) === null;

  console.log(hintValid ? "✓ " : "✗ ", "getHint returns correct hint by index.");
  console.log(hintNullValid ? "✓ " : "✗ ", "getHint returns null for out-of-range index.");

  // getNextLesson and getPreviousLesson navigate correctly
  const lessonA = new SQLLesson("lesson-a", { title: "A" });
  const lessonB = new SQLLesson("lesson-b", { title: "B" });
  const lessonC = new SQLLesson("lesson-c", { title: "C" });
  const allLessons = [lessonA, lessonB, lessonC];

  const nextValid = lessonA.getNextLesson(allLessons) === "lesson-b" && lessonB.getNextLesson(allLessons) === "lesson-c";
  const nextNullValid = lessonC.getNextLesson(allLessons) === null;
  const prevValid = lessonC.getPreviousLesson(allLessons) === "lesson-b" && lessonB.getPreviousLesson(allLessons) === "lesson-a";
  const prevNullValid = lessonA.getPreviousLesson(allLessons) === null;

  console.log(nextValid ? "✓ " : "✗ ", "getNextLesson returns next lesson ID.");
  console.log(nextNullValid ? "✓ " : "✗ ", "getNextLesson returns null at last lesson.");
  console.log(prevValid ? "✓ " : "✗ ", "getPreviousLesson returns previous lesson ID.");
  console.log(prevNullValid ? "✓ " : "✗ ", "getPreviousLesson returns null at first lesson.");

  // SQLLessonLibrary: getAllLessons returns seven default lessons
  const library = new SQLLessonLibrary();
  const allDefaultValid = library.getAllLessons().length === 7;

  console.log(allDefaultValid ? "✓ " : "✗ ", "SQLLessonLibrary initializes with 7 default lessons.");

  // getLesson finds by ID and returns null for unknown ID
  const foundLesson = library.getLesson("select-basics");
  const getLessonValid = foundLesson !== null && foundLesson.lessonId === "select-basics";
  const getLessonNullValid = library.getLesson("nonexistent-lesson") === null;

  console.log(getLessonValid ? "✓ " : "✗ ", "getLesson finds a lesson by ID.");
  console.log(getLessonNullValid ? "✓ " : "✗ ", "getLesson returns null for unknown ID.");

  // getLessonSummaries returns correct shape
  const summaries = library.getLessonSummaries();
  const summaryValid =
    summaries.length === 7 &&
    "lessonId" in summaries[0] &&
    "title" in summaries[0] &&
    "concepts" in summaries[0] &&
    "exerciseCount" in summaries[0];

  console.log(summaryValid ? "✓ " : "✗ ", "getLessonSummaries returns correct shape.");

  // addLesson inserts a new lesson and it can be retrieved
  library.addLesson("custom-lesson", { title: "Custom", theory: "Custom theory" });
  const customLesson = library.getLesson("custom-lesson");
  const addLessonValid = customLesson !== null && customLesson.title === "Custom";

  console.log(addLessonValid ? "✓ " : "✗ ", "addLesson inserts a lesson retrievable by getLesson.");
};

// ---- SQLExercise / SQLExerciseManager Tests ----

const runSQLExerciseTests = () => {
  // Mock localStorage for Node.js compatibility
  const mockStorage = {};
  const mockLocalStorage = {
    getItem: (key) => mockStorage[key] ?? null,
    setItem: (key, value) => {
      mockStorage[key] = value;
    },
    removeItem: (key) => {
      delete mockStorage[key];
    },
  };

  if (typeof localStorage === "undefined") globalThis.localStorage = mockLocalStorage;

  // Constructor assigns all properties
  const exercise = new SQLExercise("ex-1", "Select all users", "SELECT * FROM users");
  const constructorValid =
    exercise.exerciseId === "ex-1" &&
    exercise.prompt === "Select all users" &&
    exercise.expectedResult === "SELECT * FROM users" &&
    exercise.attempts === 0 &&
    exercise.completed === false &&
    exercise.hints.length === 0;

  console.log(constructorValid ? "✓ " : "✗ ", "SQLExercise constructor assigns all properties.");

  // validate returns isCorrect true for matching query (case-insensitive, semicolons optional)
  const correctResult = exercise.validate("select * from users;");
  const validateCorrectValid = correctResult.isCorrect === true;

  console.log(validateCorrectValid ? "✓ " : "✗ ", "validate returns isCorrect true for matching query.");

  // validate marks exercise as completed on success
  console.log(exercise.completed ? "✓ " : "✗ ", "validate marks exercise as completed on success.");

  // validate increments attempts on each call
  const ex2 = new SQLExercise("ex-2", "Prompt", "SELECT * FROM orders WHERE id = 1");
  ex2.validate("wrong query");
  ex2.validate("another wrong query");
  const attemptsValid = ex2.attempts === 2;

  console.log(attemptsValid ? "✓ " : "✗ ", "validate increments attempts on each call.");

  // validate returns isCorrect false with feedback for missing WHERE clause
  const noWhereResult = ex2.validate("SELECT * FROM orders");
  const noWhereValid = noWhereResult.isCorrect === false && noWhereResult.feedback.toLowerCase().includes("where");

  console.log(noWhereValid ? "✓ " : "✗ ", "validate returns feedback mentioning WHERE when clause is missing.");

  // getNextHint advances through hints and returns null when exhausted
  const hintEx = new SQLExercise("ex-h", "Prompt", "SELECT 1");

  hintEx.addHints(["First hint", "Second hint"]);

  const hint1 = hintEx.getNextHint();
  const hint2 = hintEx.getNextHint();
  const hint3 = hintEx.getNextHint();
  const hintsValid = hint1 === "First hint" && hint2 === "Second hint" && hint3 === null;

  console.log(hintsValid ? "✓ " : "✗ ", "getNextHint advances through hints and returns null when exhausted.");

  // getRemainingHints decrements correctly
  const remainEx = new SQLExercise("ex-r", "Prompt", "SELECT 1");

  remainEx.addHints(["h1", "h2", "h3"]);
  remainEx.getNextHint();

  const remainingValid = remainEx.getRemainingHints() === 2;

  console.log(remainingValid ? "✓ " : "✗ ", "getRemainingHints decrements correctly.");

  // SQLExerciseManager: createFromLesson creates an exercise with hints
  const manager = new SQLExerciseManager();

  manager.createFromLesson({ id: 10, prompt: "Count rows", expectedSql: "SELECT COUNT(*) FROM users" }, ["Use COUNT(*)", "FROM specifies the table"]);

  const managedEx = manager.getExercise("10");
  const createValid = managedEx !== null && managedEx.prompt === "Count rows" && managedEx.hints.length === 2;

  console.log(createValid ? "✓ " : "✗ ", "createFromLesson creates an exercise with hints.");

  // getExercise finds by ID
  const foundEx = manager.getExercise("10");
  const getExValid = foundEx !== null && foundEx.exerciseId === "10";

  console.log(getExValid ? "✓ " : "✗ ", "getExercise finds exercise by ID.");

  // getNextIncomplete skips completed exercises
  manager.createFromLesson({ id: 11, prompt: "Next exercise", expectedSql: "SELECT 1" });
  manager.getExercise("10").completed = true;

  const nextIncomplete = manager.getNextIncomplete();
  const nextIncompleteValid = nextIncomplete !== null && nextIncomplete.exerciseId === "11";

  console.log(nextIncompleteValid ? "✓ " : "✗ ", "getNextIncomplete skips completed exercises.");

  // getProgressStats reports correct totals and percentage
  const stats = manager.getProgressStats();
  const statsValid =
    stats.total === 2 &&
    stats.completed === 1 &&
    stats.remaining === 1 &&
    stats.completionPercentage === 50;

  console.log(statsValid ? "✓ " : "✗ ", "getProgressStats reports correct totals and percentage.");

  // saveProgress and loadProgress round-trip through localStorage
  manager.saveProgress("test_progress_key");
  manager.getExercise("11").completed = true;

  const manager2 = new SQLExerciseManager();

  manager2.createFromLesson({ id: 10, prompt: "Count rows", expectedSql: "SELECT COUNT(*) FROM users" });
  manager2.createFromLesson({ id: 11, prompt: "Next exercise", expectedSql: "SELECT 1" });
  manager2.loadProgress("test_progress_key");

  const ex10 = manager2.getExercise("10");
  const persistValid = ex10 !== null && ex10.completed === true;

  console.log(persistValid ? "✓ " : "✗ ", "saveProgress and loadProgress round-trip through localStorage.");
};

// ---- SQLQueryBuilder Tests ----

const runSQLQueryBuilderTests = () => {
  // build produces correct SQL for SELECT with no optional clauses
  const builder = new SQLQueryBuilder("customers", ["name", "email"]);
  const basicSql = builder.build();
  const basicValid = basicSql === "SELECT name, email\nFROM customers;";

  console.log(basicValid ? "✓ " : "✗ ", "build produces correct SQL for SELECT with no optional clauses.");

  // where appends a WHERE clause with quoted strings and unquoted numbers
  const whereBuilder = new SQLQueryBuilder("products", ["*"]);

  whereBuilder.where("category", "=", "Electronics");
  whereBuilder.where("price", ">", 100);

  const whereSql = whereBuilder.build();
  const whereStringValid = whereSql.includes("WHERE category = 'Electronics'");
  const whereNumberValid = whereSql.includes("price > 100");

  console.log(whereStringValid ? "✓ " : "✗ ", "where quotes string values.");
  console.log(whereNumberValid ? "✓ " : "✗ ", "where leaves numeric values unquoted.");

  // andWhere and orWhere prepend AND / OR correctly
  const multiBuilder = new SQLQueryBuilder("orders", ["*"]);

  multiBuilder.where("status", "=", "active");
  multiBuilder.andWhere("total", ">", 50);
  multiBuilder.orWhere("priority", "=", "high");

  const multiSql = multiBuilder.build();
  const andValid = multiSql.includes("AND total > 50");
  const orValid = multiSql.includes("OR priority = 'high'");

  console.log(andValid ? "✓ " : "✗ ", "andWhere prepends AND to condition.");
  console.log(orValid ? "✓ " : "✗ ", "orWhere prepends OR to condition.");

  // orderBy sets direction defaulting to ASC
  const orderBuilder = new SQLQueryBuilder("users", ["name"]);

  orderBuilder.orderBy("name");

  const orderDefaultSql = orderBuilder.build();
  const orderDefaultValid = orderDefaultSql.includes("ORDER BY name ASC");

  orderBuilder.orderBy("age", "desc");

  const orderDescSql = orderBuilder.build();
  const orderDescValid = orderDescSql.includes("ORDER BY age DESC");

  console.log(orderDefaultValid ? "✓ " : "✗ ", "orderBy defaults to ASC direction.");
  console.log(orderDescValid ? "✓ " : "✗ ", "orderBy accepts DESC direction.");

  // limit appends LIMIT clause
  const limitBuilder = new SQLQueryBuilder("logs", ["*"]);

  limitBuilder.limit(25);

  const limitSql = limitBuilder.build();
  const limitValid = limitSql.includes("LIMIT 25");

  console.log(limitValid ? "✓ " : "✗ ", "limit appends LIMIT clause.");

  // join appends correct JOIN type and ON condition
  const joinBuilder = new SQLQueryBuilder("orders", ["orders.id", "customers.name"]);

  joinBuilder.join("customers", "orders.customer_id = customers.id", "LEFT");

  const joinSql = joinBuilder.build();
  const joinValid = joinSql.includes("LEFT JOIN customers") && joinSql.includes("ON orders.customer_id = customers.id");

  console.log(joinValid ? "✓ " : "✗ ", "join appends correct JOIN type and ON condition.");

  // join defaults to INNER JOIN
  const innerJoinBuilder = new SQLQueryBuilder("orders", ["*"]);

  innerJoinBuilder.join("products", "orders.product_id = products.id");

  const innerJoinSql = innerJoinBuilder.build();
  const innerJoinValid = innerJoinSql.includes("INNER JOIN products");

  console.log(innerJoinValid ? "✓ " : "✗ ", "join defaults to INNER JOIN.");

  // select changes the column list
  const selectBuilder = new SQLQueryBuilder("users", ["*"]);

  selectBuilder.select(["id", "username"]);

  const selectSql = selectBuilder.build();
  const selectValid = selectSql.includes("SELECT id, username");

  console.log(selectValid ? "✓ " : "✗ ", "select changes the column list.");

  // select accepts a single string column
  selectBuilder.select("email");

  const selectStringSql = selectBuilder.build();
  const selectStringValid = selectStringSql.includes("SELECT email");

  console.log(selectStringValid ? "✓ " : "✗ ", "select accepts a single string column.");

  // validate returns valid true when tableName and columns are set
  const validationBuilder = new SQLQueryBuilder("users", ["id"]);
  const validResult = validationBuilder.validate();
  const validateValidValid = validResult.valid === true && validResult.errors.length === 0;

  console.log(validateValidValid ? "✓ " : "✗ ", "validate returns valid true when table and columns are set.");

  // validate returns errors when tableName is empty
  const invalidBuilder = new SQLQueryBuilder("", ["id"]);
  const invalidResult = invalidBuilder.validate();
  const validateInvalidValid = invalidResult.valid === false && invalidResult.errors.length > 0;

  console.log(validateInvalidValid ? "✓ " : "✗ ", "validate returns errors when tableName is empty.");

  // validate returns errors when columns list is empty
  const noColsBuilder = new SQLQueryBuilder("users", []);
  const noColsResult = noColsBuilder.validate();
  const noColsValid = noColsResult.valid === false && noColsResult.errors.length > 0;

  console.log(noColsValid ? "✓ " : "✗ ", "validate returns errors when columns list is empty.");

  // reset returns a fresh builder with only the original table name
  const resetResult = builder.reset();
  const resetSql = resetResult.build();
  const resetValid = resetSql === "SELECT *\nFROM customers;";

  console.log(resetValid ? "✓ " : "✗ ", "reset returns a fresh builder.");

  // getHint returns a non-empty string
  const freshBuilder = new SQLQueryBuilder("events", ["*"]);
  const hint = freshBuilder.getHint();
  const getHintValid = typeof hint === "string" && hint.length > 0;

  console.log(getHintValid ? "✓ " : "✗ ", "getHint returns a non-empty string.");
};

runSQLLessonTests();
runSQLExerciseTests();
runSQLQueryBuilderTests();
