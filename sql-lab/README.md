# SQL Lab

An interactive SQL learning environment with lessons, exercises, and a hands-on SQL sandbox.

## Features

### 📚 Lessons
Structured lessons covering SQL fundamentals:
- SELECT basics
- WHERE clause filtering
- INSERT statements
- UPDATE statements
- DELETE statements
- JOIN operations
- Aggregate functions

### ✏️ Exercises
Practice problems with automatic validation:
- Step-by-step guidance
- Hints when you get stuck
- Progress tracking
- Real-time feedback

### 🏖️ SQL Sandbox
Interactive SQL execution environment:
- Write and run custom SQL queries
- View and explore database tables
- Reset database to initial state
- Real-time query results

### 🔧 Query Builder
Build SQL queries without memorizing syntax:
- Step-by-step query construction
- Visual query preview
- Run queries directly from builder
- Copy queries to clipboard

## Usage

### Running Locally

1. Open `index.html` in a modern web browser
2. Navigate between tabs to access different features
3. Start with **Lessons** to learn SQL concepts
4. Practice with **Exercises** to test your knowledge
5. Use **SQL Sandbox** for free-form querying
6. Use **Query Builder** to build queries visually

### Prerequisites
- Modern web browser (Chrome, Firefox, Edge, Safari)
- Internet connection (for loading sql.js from CDN)

## File Structure

```
sql-lab/
├── index.html           # Main HTML page with tabbed interface
├── index.js             # Main JavaScript application logic
├── index.test.js       # Unit tests for SQLGenerator and SQLDatabase
├── sql-lab-config.json  # Configuration for query generation
├── README.md            # This file
└── js/
    ├── SQLDatabase.js       # In-browser SQLite database wrapper
    ├── SQLGenerator.js      # SQL query and procedure generator
    ├── SQLLesson.js         # Lesson content and library
    ├── SQLExercise.js       # Exercise validation and management
    └── SQLQueryBuilder.js   # Visual query builder
```

## API Reference

### SQLDatabase
```javascript
const db = new SQLDatabase("my_db");
await db.init();
db.execute("CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT);");
db.execute("INSERT INTO users (name) VALUES ('Alice');");
const result = db.query("SELECT * FROM users;");
db.save();
await db.reset();
```

### SQLQueryBuilder
```javascript
const builder = new SQLQueryBuilder("users", ["name", "email"]);
builder.where("age", ">", 18).orderBy("name", "ASC").limit(10);
const sql = builder.build();
// SELECT name, email
// FROM users
// WHERE age > 18
// ORDER BY name ASC
// LIMIT 10;
```

### SQLLesson
```javascript
const library = new SQLLessonLibrary();
const lesson = library.getLesson("select-basics");
console.log(lesson.title);      // "Introduction to SELECT"
console.log(lesson.getExamples()); // Array of example objects
```

### SQLExercise
```javascript
const manager = new SQLExerciseManager();
const exercise = manager.createFromLesson({
  id: 1,
  prompt: "Select all users",
  expectedSql: "SELECT * FROM users"
});
const result = exercise.validate("SELECT * FROM users;");
console.log(result.isCorrect); // true
```

## Testing

Open `index.html` in a browser to run the interactive tests, or run the automated tests:

```bash
# Using Node.js
node --experimental-vm-modules test_runner.js

# Or open index.test.js directly in browser
```

## Configuration (`sql-lab/sql-lab-config.json`)

The Generate Queries and Generate Procedures buttons in the Sandbox tab read their parameters from `sql-lab-config.json`. If the file is missing or invalid, built-in defaults are used.

## Database Persistence

The SQLite database is automatically saved to `localStorage` after every write operation. Refreshing the page or reopening the browser restores the previous state. Use the Reset Database button to clear it.

## License

MIT
