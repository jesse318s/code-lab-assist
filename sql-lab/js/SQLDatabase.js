/**
 * SQLDatabase - Provides an in-browser SQL database using sql.js (SQLite
 * compiled to WebAssembly). Supports creating tables, running queries,
 * and persisting the database to localStorage.
 */
class SQLDatabase {
  /**
   * @param {string} dbName - The name used as the localStorage key for persistence
   */
  constructor(dbName) {
    this.dbName = dbName;
    this.db = null;
    this._sqlPromise = null;
  }

  /**
   * Initializes the sql.js library and either restores a saved database
   * from localStorage or creates a new empty one.
   *
   * @returns {Promise<void>}
   */
  async init() {
    if (this.db) return;

    const SQL = await this._loadSqlJs();
    const saved = localStorage.getItem(this.dbName);

    if (saved) {
      const binaryArray = Uint8Array.from(atob(saved), (c) => c.charCodeAt(0));

      this.db = new SQL.Database(binaryArray);
    } else {
      this.db = new SQL.Database();
    }
  }

  /**
   * Loads the sql.js library from CDN. Caches the promise so the
   * library is only fetched once per page session.
   *
   * @returns {Promise<object>} The initialized sql.js module
   */
  _loadSqlJs() {
    if (this._sqlPromise) return this._sqlPromise;

    this._sqlPromise = initSqlJs({
      locateFile: (file) =>
        `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.11.0/${file}`,
    });

    return this._sqlPromise;
  }

  /**
   * Executes a SQL statement that does not return rows (CREATE, INSERT,
   * UPDATE, DELETE, DROP, etc.) and auto-saves to localStorage.
   *
   * @param {string} sql - The SQL statement to execute
   * @returns {{ changes: number }} The number of rows affected
   */
  execute(sql) {
    this.db.run(sql);
    this.save();

    return { changes: this.db.getRowsModified() };
  }

  /**
   * Executes a SQL query and returns the result rows as an array of objects.
   *
   * @param {string} sql - The SQL SELECT statement
   * @returns {{ columns: string[], rows: object[] }} The column names and row data
   */
  query(sql) {
    const results = this.db.exec(sql);

    if (results.length === 0) return { columns: [], rows: [] };

    const columns = results[0].columns;
    const rows = results[0].values.map((row) => {
      const obj = {};

      columns.forEach((col, i) => {
        obj[col] = row[i];
      });

      return obj;
    });

    return { columns, rows };
  }

  /**
   * Lists all user-created tables in the database.
   *
   * @returns {string[]} Array of table names
   */
  listTables() {
    const result = this.query(
      "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;"
    );

    return result.rows.map((row) => row.name);
  }

  /**
   * Returns column info for a given table.
   *
   * @param {string} tableName - The table to describe
   * @returns {object[]} Array of column metadata objects
   */
  describeTable(tableName) {
    const result = this.db.exec(`PRAGMA table_info('${tableName}');`);

    if (result.length === 0) return [];

    return result[0].values.map((row) => ({
      cid: row[0],
      name: row[1],
      type: row[2],
      notNull: row[3] === 1,
      defaultValue: row[4],
      pk: row[5] === 1,
    }));
  }

  /**
   * Saves the current database state to localStorage as a base64 string.
   */
  save() {
    const data = this.db.export();
    let binary = "";
    const chunkSize = 8192;

    for (let i = 0; i < data.length; i += chunkSize) {
      binary += String.fromCharCode(...data.subarray(i, i + chunkSize));
    }

    const base64 = btoa(binary);

    localStorage.setItem(this.dbName, base64);
  }

  /**
   * Deletes the saved database from localStorage and resets the
   * in-memory database to an empty state.
   */
  async reset() {
    localStorage.removeItem(this.dbName);
    this.db.close();
    this.db = null;
    await this.init();
  }

  /**
   * Closes the database connection.
   */
  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

export { SQLDatabase };
