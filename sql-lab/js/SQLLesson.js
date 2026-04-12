/**
 * SQLLesson - Presents structured lessons on SQL concepts.
 * Each lesson contains theory, examples, exercises, and hints
 * to help students learn SQL fundamentals.
 */
class SQLLesson {
  /**
   * @param {string} lessonId - Unique identifier for the lesson
   * @param {object} content - Lesson content object
   */
  constructor(lessonId, content) {
    this.lessonId = lessonId;
    this.title = content.title || "Untitled Lesson";
    this.theory = content.theory || "";
    this.examples = content.examples || [];
    this.exercises = content.exercises || [];
    this.hints = content.hints || [];
    this.concepts = content.concepts || [];
  }

  /**
   * Gets the formatted lesson content for display.
   *
   * @returns {object} Formatted lesson object
   */
  getLessonContent() {
    return {
      lessonId: this.lessonId,
      title: this.title,
      theory: this.theory,
      concepts: this.concepts,
      examples: this.examples,
      exercises: this.exercises.length,
      hints: this.hints.length,
    };
  }

  /**
   * Gets the theory section with formatting.
   *
   * @returns {string} Formatted theory text
   */
  getTheory() {
    return this.theory;
  }

  /**
   * Gets all examples for this lesson.
   *
   * @returns {object[]} Array of example objects
   */
  getExamples() {
    return this.examples;
  }

  /**
   * Gets all exercises for this lesson.
   *
   * @returns {object[]} Array of exercise objects
   */
  getExercises() {
    return this.exercises;
  }

  /**
   * Gets a hint for a specific exercise.
   *
   * @param {number} exerciseIndex - Index of the exercise
   * @returns {string|null} Hint text or null if not found
   */
  getHint(exerciseIndex) {
    if (exerciseIndex >= 0 && exerciseIndex < this.hints.length) {
      return this.hints[exerciseIndex];
    }
    return null;
  }

  /**
   * Gets the next lesson ID based on a progression order.
   *
   * @param {object[]} allLessons - All available lessons
   * @returns {string|null} Next lesson ID or null
   */
  getNextLesson(allLessons) {
    const currentIndex = allLessons.findIndex((l) => l.lessonId === this.lessonId);
    if (currentIndex >= 0 && currentIndex < allLessons.length - 1) {
      return allLessons[currentIndex + 1].lessonId;
    }
    return null;
  }

  /**
   * Gets the previous lesson ID based on a progression order.
   *
   * @param {object[]} allLessons - All available lessons
   * @returns {string|null} Previous lesson ID or null
   */
  getPreviousLesson(allLessons) {
    const currentIndex = allLessons.findIndex((l) => l.lessonId === this.lessonId);
    if (currentIndex > 0) {
      return allLessons[currentIndex - 1].lessonId;
    }
    return null;
  }
}

/**
 * SQLLessonLibrary - Manages a collection of SQL lessons
 * and provides access to lesson content.
 */
class SQLLessonLibrary {
  constructor() {
    this.lessons = [];
    this._initializeDefaultLessons();
  }

  /**
   * Initializes the library with default SQL lessons.
   */
  _initializeDefaultLessons() {
    this.lessons = [
      new SQLLesson("select-basics", {
        title: "Introduction to SELECT",
        theory:
          "The SELECT statement is used to retrieve data from a database. It is the most commonly used SQL command. The basic syntax is: SELECT column1, column2 FROM table_name. Use * to select all columns.",
        concepts: ["SELECT", "FROM", "WHERE", "ORDER BY", "LIMIT"],
        examples: [
          {
            description: "Select all columns from a table",
            sql: "SELECT * FROM customers;",
          },
          {
            description: "Select specific columns",
            sql: "SELECT first_name, last_name, email FROM customers;",
          },
          {
            description: "Select with column alias",
            sql: "SELECT first_name AS \"First Name\" FROM customers;",
          },
        ],
        exercises: [
          {
            id: 1,
            prompt: "Write a query to select all columns from the 'products' table",
            expectedSql: "SELECT * FROM products",
          },
          {
            id: 2,
            prompt: "Select only the 'name' and 'price' columns from the 'products' table",
            expectedSql: "SELECT name, price FROM products",
          },
        ],
        hints: [
          "Use SELECT * to select all columns from a table",
          "Separate column names with commas when selecting multiple columns",
        ],
      }),

      new SQLLesson("where-clause", {
        title: "Filtering with WHERE",
        theory:
          "The WHERE clause filters records based on specified conditions. You can use comparison operators (=, >, <, >=, <=, <>) and logical operators (AND, OR, NOT). String values must be enclosed in single quotes.",
        concepts: ["WHERE", "Comparison Operators", "AND", "OR", "LIKE", "IN"],
        examples: [
          {
            description: "Filter with equality",
            sql: "SELECT * FROM products WHERE category = 'Electronics';",
          },
          {
            description: "Filter with numeric comparison",
            sql: "SELECT * FROM products WHERE price > 100;",
          },
          {
            description: "Filter with multiple conditions",
            sql: "SELECT * FROM products WHERE price > 50 AND category = 'Electronics';",
          },
          {
            description: "Filter with LIKE pattern",
            sql: "SELECT * FROM customers WHERE name LIKE 'J%';",
          },
        ],
        exercises: [
          {
            id: 1,
            prompt: "Select all products with a price greater than 50",
            expectedSql: "WHERE price > 50",
          },
          {
            id: 2,
            prompt: "Select customers whose last name starts with 'S'",
            expectedSql: "WHERE last_name LIKE 'S%'",
          },
        ],
        hints: [
          "Use = for exact matches, >, <, >=, <= for comparisons",
          "LIKE with % matches any characters, _ matches single character",
        ],
      }),

      new SQLLesson("insert-statement", {
        title: "INSERT Data",
        theory:
          "The INSERT statement adds new rows to a table. You can specify columns and values, or insert values for all columns in order. Always ensure data types match the table schema.",
        concepts: ["INSERT INTO", "VALUES", "NULL values", "Auto-increment"],
        examples: [
          {
            description: "Insert a single row",
            sql: "INSERT INTO customers (first_name, last_name, email) VALUES ('John', 'Doe', 'john@example.com');",
          },
          {
            description: "Insert multiple rows",
            sql: "INSERT INTO products (name, price) VALUES ('Widget', 9.99), ('Gadget', 19.99);",
          },
          {
            description: "Insert with NULL value",
            sql: "INSERT INTO customers (first_name, email) VALUES ('Jane', NULL);",
          },
        ],
        exercises: [
          {
            id: 1,
            prompt: "Insert a new product named 'SuperItem' with price 29.99",
            expectedSql: "INSERT INTO products (name, price) VALUES ('SuperItem', 29.99)",
          },
        ],
        hints: [
          "List column names in parentheses after table name",
          "Match values in the same order as columns",
        ],
      }),

      new SQLLesson("update-statement", {
        title: "UPDATE Data",
        theory:
          "The UPDATE statement modifies existing records. Always include a WHERE clause to avoid updating all rows. Use SET to specify which columns to update and their new values.",
        concepts: ["UPDATE", "SET", "WHERE", "Arithmetic in updates"],
        examples: [
          {
            description: "Update single column",
            sql: "UPDATE products SET price = 19.99 WHERE id = 1;",
          },
          {
            description: "Update multiple columns",
            sql: "UPDATE customers SET first_name = 'Jane', last_name = 'Smith' WHERE id = 5;",
          },
          {
            description: "Update with arithmetic",
            sql: "UPDATE products SET price = price * 1.1 WHERE category = 'Sale';",
          },
        ],
        exercises: [
          {
            id: 1,
            prompt: "Update the price of product with id=3 to 49.99",
            expectedSql: "UPDATE products SET price = 49.99 WHERE id = 3",
          },
        ],
        hints: [
          "Always include WHERE clause to target specific rows",
          "Separate multiple column assignments with commas",
        ],
      }),

      new SQLLesson("delete-statement", {
        title: "DELETE Data",
        theory:
          "The DELETE statement removes rows from a table. Use with caution - deleted data cannot be recovered. Always include a WHERE clause unless you intend to delete all rows.",
        concepts: ["DELETE FROM", "WHERE", "TRUNCATE", "Data recovery"],
        examples: [
          {
            description: "Delete specific row",
            sql: "DELETE FROM customers WHERE id = 10;",
          },
          {
            description: "Delete with condition",
            sql: "DELETE FROM products WHERE price < 5;",
          },
          {
            description: "Delete all rows (use with caution)",
            sql: "DELETE FROM temp_data;",
          },
        ],
        exercises: [
          {
            id: 1,
            prompt: "Delete the customer with id=7",
            expectedSql: "DELETE FROM customers WHERE id = 7",
          },
        ],
        hints: [
          "Be very careful with DELETE - there is no undo!",
          "Always test your WHERE clause with SELECT first",
        ],
      }),

      new SQLLesson("join-basics", {
        title: "JOIN Tables",
        theory:
          "JOIN combines rows from two or more tables based on a related column. INNER JOIN returns rows with matches in both tables. LEFT JOIN returns all rows from the left table with matches from the right.",
        concepts: ["INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "ON clause"],
        examples: [
          {
            description: "Inner join two tables",
            sql: "SELECT orders.id, customers.name FROM orders INNER JOIN customers ON orders.customer_id = customers.id;",
          },
          {
            description: "Left join with alias",
            sql: "SELECT o.id, c.name FROM orders o LEFT JOIN customers c ON o.customer_id = c.id;",
          },
          {
            description: "Join with multiple conditions",
            sql: "SELECT * FROM orders o JOIN products p ON o.product_id = p.id AND o.quantity > 0;",
          },
        ],
        exercises: [
          {
            id: 1,
            prompt: "Join orders and customers tables to get order id and customer name",
            expectedSql: "INNER JOIN customers ON orders.customer_id = customers.id",
          },
        ],
        hints: [
          "Use table aliases (like 'o' for 'orders') for shorter queries",
          "ON clause specifies the join condition between tables",
        ],
      }),

      new SQLLesson("aggregation", {
        title: "Aggregate Functions",
        theory:
          "Aggregate functions perform calculations on sets of rows and return a single result. Common functions: COUNT(), SUM(), AVG(), MIN(), MAX(). Use GROUP BY to aggregate per group.",
        concepts: ["COUNT", "SUM", "AVG", "MIN", "MAX", "GROUP BY", "HAVING"],
        examples: [
          {
            description: "Count all rows",
            sql: "SELECT COUNT(*) FROM customers;",
          },
          {
            description: "Sum a column",
            sql: "SELECT SUM(amount) FROM orders;",
          },
          {
            description: "Group and aggregate",
            sql: "SELECT category, COUNT(*) as count, AVG(price) as avg_price FROM products GROUP BY category;",
          },
          {
            description: "Filter groups with HAVING",
            sql: "SELECT category, COUNT(*) FROM products GROUP BY category HAVING COUNT(*) > 5;",
          },
        ],
        exercises: [
          {
            id: 1,
            prompt: "Count the number of orders",
            expectedSql: "SELECT COUNT(*) FROM orders",
          },
          {
            id: 2,
            prompt: "Find the average price per category",
            expectedSql: "SELECT category, AVG(price) FROM products GROUP BY category",
          },
        ],
        hints: [
          "GROUP BY groups rows before aggregation",
          "HAVING filters groups (WHERE filters individual rows)",
        ],
      }),
    ];
  }

  /**
   * Gets a lesson by its ID.
   *
   * @param {string} lessonId - The lesson ID to find
   * @returns {SQLLesson|null} The lesson or null if not found
   */
  getLesson(lessonId) {
    return this.lessons.find((lesson) => lesson.lessonId === lessonId) || null;
  }

  /**
   * Gets all lessons in the library.
   *
   * @returns {SQLLesson[]} Array of all lessons
   */
  getAllLessons() {
    return this.lessons;
  }

  /**
   * Gets a summary of all lessons.
   *
   * @returns {object[]} Array of lesson summaries
   */
  getLessonSummaries() {
    return this.lessons.map((lesson) => ({
      lessonId: lesson.lessonId,
      title: lesson.title,
      concepts: lesson.concepts,
      exerciseCount: lesson.exercises.length,
    }));
  }

  /**
   * Adds a custom lesson to the library.
   *
   * @param {string} lessonId - Unique identifier
   * @param {object} content - Lesson content
   * @returns {SQLLesson} The created lesson
   */
  addLesson(lessonId, content) {
    const lesson = new SQLLesson(lessonId, content);
    this.lessons.push(lesson);
    return lesson;
  }
}

export { SQLLesson, SQLLessonLibrary };
