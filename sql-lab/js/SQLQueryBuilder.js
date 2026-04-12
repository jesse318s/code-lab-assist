/**
 * SQLQueryBuilder - Helps students construct SQL queries step-by-step
 * with validation and guidance. The builder uses a fluent interface
 * that chains methods together to build complete queries.
 */
class SQLQueryBuilder {
  /**
   * @param {string} tableName - The target table name
   * @param {string[]} columns - Array of column names to select (default: all)
   */
  constructor(tableName, columns = ["*"]) {
    this._tableName = tableName;
    this._columns = columns;
    this._whereClauses = [];
    this._orderByColumn = null;
    this._orderByDirection = "ASC";
    this._limitValue = null;
    this._joinTable = null;
    this._joinCondition = null;
    this._joinType = "INNER";
  }

  /**
   * Specifies the columns to select.
   *
   * @param {string|string[]} cols - Column name(s) to select
   * @returns {SQLQueryBuilder} This builder for chaining
   */
  select(cols) {
    this._columns = Array.isArray(cols) ? cols : [cols];
    return this;
  }

  /**
   * Adds a WHERE condition.
   *
   * @param {string} column - Column name for the condition
   * @param {string} operator - Comparison operator (=, >, <, >=, <=, LIKE, etc.)
   * @param {string|number} value - Value to compare against
   * @returns {SQLQueryBuilder} This builder for chaining
   */
  where(column, operator, value) {
    const formattedValue = typeof value === "string" ? `'${value}'` : value;
    this._whereClauses.push(`${column} ${operator} ${formattedValue}`);
    return this;
  }

  /**
   * Adds an AND condition to the WHERE clause.
   *
   * @param {string} column - Column name for the condition
   * @param {string} operator - Comparison operator
   * @param {string|number} value - Value to compare against
   * @returns {SQLQueryBuilder} This builder for chaining
   */
  andWhere(column, operator, value) {
    const formattedValue = typeof value === "string" ? `'${value}'` : value;
    this._whereClauses.push(`AND ${column} ${operator} ${formattedValue}`);
    return this;
  }

  /**
   * Adds an OR condition to the WHERE clause.
   *
   * @param {string} column - Column name for the condition
   * @param {string} operator - Comparison operator
   * @param {string|number} value - Value to compare against
   * @returns {SQLQueryBuilder} This builder for chaining
   */
  orWhere(column, operator, value) {
    const formattedValue = typeof value === "string" ? `'${value}'` : value;
    this._whereClauses.push(`OR ${column} ${operator} ${formattedValue}`);
    return this;
  }

  /**
   * Specifies the ORDER BY column and direction.
   *
   * @param {string} column - Column to order by
   * @param {string} direction - Sort direction (ASC or DESC)
   * @returns {SQLQueryBuilder} This builder for chaining
   */
  orderBy(column, direction = "ASC") {
    this._orderByColumn = column;
    this._orderByDirection = direction.toUpperCase();
    return this;
  }

  /**
   * Limits the number of results.
   *
   * @param {number} limit - Maximum number of rows to return
   * @returns {SQLQueryBuilder} This builder for chaining
   */
  limit(limit) {
    this._limitValue = limit;
    return this;
  }

  /**
   * Adds a JOIN clause.
   *
   * @param {string} table - Table to join
   * @param {string} condition - JOIN condition (e.g., "orders.customer_id = customers.id")
   * @param {string} type - JOIN type (INNER, LEFT, RIGHT, FULL)
   * @returns {SQLQueryBuilder} This builder for chaining
   */
  join(table, condition, type = "INNER") {
    this._joinTable = table;
    this._joinCondition = condition;
    this._joinType = type.toUpperCase();
    return this;
  }

  /**
   * Builds and returns the complete SQL query string.
   *
   * @returns {string} The formatted SQL SELECT statement
   */
  build() {
    const cols = this._columns.join(", ");
    let query = `SELECT ${cols}\nFROM ${this._tableName}`;

    if (this._joinTable) {
      query += `\n${this._joinType} JOIN ${this._joinTable}\nON ${this._joinCondition}`;
    }

    if (this._whereClauses.length > 0) {
      query += `\nWHERE ${this._whereClauses.join(" ")}`;
    }

    if (this._orderByColumn) {
      query += `\nORDER BY ${this._orderByColumn} ${this._orderByDirection}`;
    }

    if (this._limitValue !== null) {
      query += `\nLIMIT ${this._limitValue}`;
    }

    return query + ";";
  }

  /**
   * Gets a hint for the next step in building the query.
   *
   * @returns {string} A hint about what to do next
   */
  getHint() {
    if (this._whereClauses.length === 0) {
      return "Try adding a WHERE clause to filter results using .where(column, operator, value)";
    }

    if (!this._orderByColumn) {
      return "Consider adding ORDER BY to sort results using .orderBy(column, 'ASC' or 'DESC')";
    }

    if (this._limitValue === null) {
      return "You might want to limit results with .limit(number)";
    }

    return "Your query looks complete! Use .build() to generate the SQL.";
  }

  /**
   * Validates the current query configuration.
   *
   * @returns {{ valid: boolean, errors: string[] }} Validation result
   */
  validate() {
    const errors = [];

    if (!this._tableName || this._tableName.trim() === "") {
      errors.push("Table name is required");
    }

    if (!Array.isArray(this._columns) || this._columns.length === 0) {
      errors.push("At least one column must be selected");
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Resets the builder to its initial state.
   *
   * @returns {SQLQueryBuilder} A new clean builder
   */
  reset() {
    return new SQLQueryBuilder(this._tableName);
  }
}

export { SQLQueryBuilder };
