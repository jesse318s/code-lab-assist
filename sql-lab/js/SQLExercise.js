/**
 * SQLExercise - Provides practice problems with automatic validation.
 * Exercises can be compared against expected SQL patterns or
 * by executing against a database and comparing results.
 */
class SQLExercise {
  /**
   * @param {string} exerciseId - Unique identifier for the exercise
   * @param {string} prompt - The exercise prompt/question
   * @param {function|string} expectedResult - Expected SQL pattern or validation function
   */
  constructor(exerciseId, prompt, expectedResult) {
    this.exerciseId = exerciseId;
    this.prompt = prompt;
    this.expectedResult = expectedResult;
    this.attempts = 0;
    this.completed = false;
    this.hints = [];
    this._hintsShown = 0;
  }

  /**
   * Adds hints to the exercise.
   *
   * @param {string[]} hints - Array of hint strings
   * @returns {SQLExercise} This exercise for chaining
   */
  addHints(hints) {
    this.hints = hints;
    return this;
  }

  /**
   * Gets the next hint for this exercise.
   *
   * @returns {string|null} The next hint or null if no more hints
   */
  getNextHint() {
    if (this._hintsShown < this.hints.length) {
      return this.hints[this._hintsShown++];
    }
    return null;
  }

  /**
   * Gets the number of hints remaining.
   *
   * @returns {number} Number of hints not yet shown
   */
  getRemainingHints() {
    return this.hints.length - this._hintsShown;
  }

  /**
   * Resets the hint counter.
   */
  resetHints() {
    this._hintsShown = 0;
  }

  /**
   * Validates a student's SQL query against the expected result.
   *
   * @param {string} studentQuery - The student's SQL query
   * @param {object} database - Optional database instance for execution-based validation
   * @returns {object} Validation result with isCorrect and feedback
   */
  validate(studentQuery, database = null) {
    this.attempts++;

    if (typeof this.expectedResult === "function") {
      // Use custom validation function
      return this.expectedResult(studentQuery, database);
    }

    // Default pattern-based validation
    const normalizedQuery = this._normalizeSql(studentQuery);
    const normalizedExpected = this._normalizeSql(this.expectedResult);

    if (normalizedQuery === normalizedExpected) {
      this.completed = true;
      return {
        isCorrect: true,
        feedback: "Correct! Well done.",
        attempts: this.attempts,
      };
    }

    // Check for common mistakes
    const feedback = this._getFeedback(normalizedQuery, normalizedExpected);

    return {
      isCorrect: false,
      feedback,
      attempts: this.attempts,
    };
  }

  /**
   * Normalizes SQL for comparison.
   *
   * @param {string} sql - SQL string to normalize
   * @returns {string} Normalized SQL
   */
  _normalizeSql(sql) {
    return sql
      .toUpperCase()
      .replace(/\s+/g, " ")
      .replace(/;\s*$/, "")
      .trim();
  }

  /**
   * Provides feedback based on common mistakes.
   *
   * @param {string} query - Student's normalized query
   * @param {string} expected - Expected normalized query
   * @returns {string} Feedback message
   */
  _getFeedback(query, expected) {
    // Check for missing WHERE clause
    if (expected.includes("WHERE") && !query.includes("WHERE")) {
      return "Your query is missing a WHERE clause to filter the results.";
    }

    // Check for incorrect table name
    const expectedTable = expected.match(/FROM\s+(\w+)/i);
    const queryTable = query.match(/FROM\s+(\w+)/i);
    if (expectedTable && queryTable && expectedTable[1] !== queryTable[1]) {
      return `Check your table name. Expected '${expectedTable[1]}'.`;
    }

    // Check for missing semicolon
    if (!query.endsWith(";")) {
      return "Don't forget the semicolon at the end of your SQL statement.";
    }

    // Check for incorrect column names
    if (expected.includes("SELECT") && query.includes("SELECT")) {
      const expectedCols = expected.match(/SELECT\s+(.+?)\s+FROM/i);
      const queryCols = query.match(/SELECT\s+(.+?)\s+FROM/i);
      if (expectedCols && queryCols && expectedCols[1] !== queryCols[1]) {
        return "Check your column selection - make sure you select the right columns.";
      }
    }

    return "Not quite right. Review the example and try again. Use 'Get Hint' if you need help.";
  }

  /**
   * Gets the current exercise status.
   *
   * @returns {object} Exercise status object
   */
  getStatus() {
    return {
      exerciseId: this.exerciseId,
      prompt: this.prompt,
      attempts: this.attempts,
      completed: this.completed,
      hintsRemaining: this.getRemainingHints(),
    };
  }
}

/**
 * SQLExerciseManager - Manages a collection of exercises and tracks progress.
 */
class SQLExerciseManager {
  constructor() {
    this.exercises = [];
    this.progress = new Map();
  }

  /**
   * Creates an exercise from a lesson exercise object.
   *
   * @param {object} lessonExercise - Exercise object from SQLLesson
   * @param {string[]} hints - Optional hints array
   * @returns {SQLExercise} The created exercise
   */
  createFromLesson(lessonExercise, hints = []) {
    const exercise = new SQLExercise(
      lessonExercise.id.toString(),
      lessonExercise.prompt,
      lessonExercise.expectedSql,
    );

    if (hints.length > 0) {
      exercise.addHints(hints);
    }

    this.exercises.push(exercise);
    return exercise;
  }

  /**
   * Gets an exercise by ID.
   *
   * @param {string} exerciseId - Exercise ID
   * @returns {SQLExercise|null} The exercise or null
   */
  getExercise(exerciseId) {
    return this.exercises.find((e) => e.exerciseId === exerciseId) || null;
  }

  /**
   * Gets all exercises.
   *
   * @returns {SQLExercise[]} Array of all exercises
   */
  getAllExercises() {
    return this.exercises;
  }

  /**
   * Gets exercises for a specific lesson.
   *
   * @param {string} lessonId - Lesson ID
   * @returns {SQLExercise[]} Array of exercises for the lesson
   */
  getExercisesByLesson(lessonId) {
    return this.exercises.filter((e) => e.exerciseId.startsWith(lessonId));
  }

  /**
   * Gets the next incomplete exercise.
   *
   * @returns {SQLExercise|null} Next incomplete exercise or null
   */
  getNextIncomplete() {
    return this.exercises.find((e) => !e.completed) || null;
  }

  /**
   * Gets overall progress statistics.
   *
   * @returns {object} Progress statistics
   */
  getProgressStats() {
    const total = this.exercises.length;
    const completed = this.exercises.filter((e) => e.completed).length;
    const totalAttempts = this.exercises.reduce((sum, e) => sum + e.attempts, 0);

    return {
      total,
      completed,
      remaining: total - completed,
      completionPercentage: total > 0 ? Math.round((completed / total) * 100) : 0,
      totalAttempts,
      averageAttemptsPerExercise: total > 0 ? (totalAttempts / total).toFixed(1) : 0,
    };
  }

  /**
   * Resets all exercise progress.
   */
  resetAllProgress() {
    this.exercises.forEach((e) => {
      e.completed = false;
      e.attempts = 0;
      e.resetHints();
    });
    this.progress.clear();
  }

  /**
   * Saves progress to localStorage.
   *
   * @param {string} key - Storage key
   */
  saveProgress(key = "sql_lab_progress") {
    const data = {
      exercises: this.exercises.map((e) => ({
        id: e.exerciseId,
        completed: e.completed,
        attempts: e.attempts,
      })),
    };

    localStorage.setItem(key, JSON.stringify(data));
  }

  /**
   * Loads progress from localStorage.
   *
   * @param {string} key - Storage key
   */
  loadProgress(key = "sql_lab_progress") {
    const stored = localStorage.getItem(key);
    if (!stored) return;

    try {
      const data = JSON.parse(stored);
      data.exercises.forEach((saved) => {
        const exercise = this.getExercise(saved.id);
        if (exercise) {
          exercise.completed = saved.completed;
          exercise.attempts = saved.attempts;
        }
      });
    } catch {
      console.warn("Failed to load progress from localStorage");
    }
  }
}

export { SQLExercise, SQLExerciseManager };
