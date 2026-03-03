/**
 * SQLGenerator - Generates SQL queries and stored procedures
 * for data correction operations.
 *
 * This class builds SELECT queries, UPDATE procedures, and date
 * adjustment procedures from configurable parameters. Uses
 * dialect-agnostic SQL where possible, and MySQL syntax where
 * a specific dialect is required.
 */
class SQLGenerator {
  /**
   * @param {string} schema - The database schema name
   * @param {string} table - The target table name
   */
  constructor(schema, table) {
    this.schema = schema;
    this.table = table;
  }

  /**
   * Generates a SELECT query for a given identifier value.
   *
   * @param {string} idValue - The identifier value to query
   * @param {string} whereCol - The WHERE clause column name
   * @returns {string} The formatted SQL SELECT statement
   */
  generateSelectQuery(idValue, whereCol) {
    return `SELECT * FROM ${this.schema}.${this.table}\nWHERE ${whereCol} = '${idValue}';`;
  }

  /**
   * Generates multiple SELECT queries for an array of identifier values.
   *
   * @param {string[]} idValues - Array of identifier values
   * @param {string} whereCol - The WHERE clause column name
   * @returns {string} The concatenated SQL SELECT statements separated by dividers
   */
  generateSelectQueries(idValues, whereCol) {
    const divider = "--------------------------------------------------";
    let output = divider + "\n";

    for (let i = 0; i < idValues.length; i++) {
      output += this.generateSelectQuery(idValues[i], whereCol) + "\n";
    }

    output += divider;

    return output;
  }

  /**
   * Generates an UPDATE stored procedure for correcting a column value.
   *
   * @param {string} procName - The procedure name
   * @param {string} setCol - The column to update
   * @param {string} setVal - The new value for the column
   * @param {string} whereCol - The WHERE clause column name
   * @param {string} whereVal - The WHERE clause value
   * @param {string} [condCol] - Optional additional condition column
   * @param {string} [condVal] - Optional additional condition value
   * @returns {string} The formatted SQL stored procedure
   */
  generateUpdateProc(
    procName,
    setCol,
    setVal,
    whereCol,
    whereVal,
    condCol,
    condVal,
  ) {
    let whereClause = `${whereCol} = '${whereVal}'`;

    if (condCol && condVal) whereClause += ` AND ${condCol} = '${condVal}'`;

    return `DELIMITER //
CREATE PROCEDURE ${this.schema}.${procName}()
BEGIN
    UPDATE ${this.schema}.${this.table}
    SET ${setCol} = '${setVal}'
    WHERE ${whereClause};
END //
DELIMITER ;

CALL ${this.schema}.${procName}();
DROP PROCEDURE ${this.schema}.${procName};`;
  }

  /**
   * Generates a date adjustment stored procedure that applies
   * configurable month and day offsets using DATE_ADD/DATE_SUB.
   *
   * @param {string} procName - The procedure name
   * @param {string} dateCol - The date column to adjust
   * @param {string} whereCol - The WHERE clause column name
   * @param {string} whereVal - The WHERE clause value
   * @param {number} monthOffset - Number of months to adjust (positive or negative)
   * @param {number} dayOffset - Number of days to adjust (positive or negative)
   * @returns {string} The formatted SQL date adjustment procedure
   */
  generateDateAdjustProc(
    procName,
    dateCol,
    whereCol,
    whereVal,
    monthOffset,
    dayOffset,
  ) {
    const absMonths = Math.abs(monthOffset);
    const absDays = Math.abs(dayOffset);
    const monthFn = monthOffset >= 0 ? "DATE_ADD" : "DATE_SUB";
    const dayFn = dayOffset >= 0 ? "DATE_ADD" : "DATE_SUB";
    const dateExpr = `${monthFn}(${dayFn}(${dateCol}, INTERVAL ${absDays} DAY), INTERVAL ${absMonths} MONTH)`;

    return `DELIMITER //
CREATE PROCEDURE ${this.schema}.${procName}()
BEGIN
    UPDATE ${this.schema}.${this.table}
    SET ${dateCol} = ${dateExpr}
    WHERE ${whereCol} = '${whereVal}';
END //
DELIMITER ;

CALL ${this.schema}.${procName}();
DROP PROCEDURE ${this.schema}.${procName};`;
  }
}

export { SQLGenerator };
