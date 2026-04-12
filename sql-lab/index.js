import { SQLGenerator } from "./js/SQLGenerator.js";
import { SQLDatabase } from "./js/SQLDatabase.js";
import { SQLLessonLibrary } from "./js/SQLLesson.js";
import { SQLExerciseManager } from "./js/SQLExercise.js";
import { SQLQueryBuilder } from "./js/SQLQueryBuilder.js";

// Initialize components
const lessonLibrary = new SQLLessonLibrary();
const exerciseManager = new SQLExerciseManager();
const database = new SQLDatabase("sql_lab_db");

// Current state
let currentLesson = null;
let currentExercise = null;

// Initialize all lessons with exercises
const lessons = lessonLibrary.getAllLessons();
lessons.forEach((lesson) => {
  lesson.exercises.forEach((ex) => {
    exerciseManager.createFromLesson(ex, lesson.hints);
  });
});

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
const output = document.getElementById("output");
const queryInput = document.getElementById("queryInput");

// Initialize database
await database.init();
console.log("SQL Lab database initialized.");

// Load saved progress
exerciseManager.loadProgress();

// ---- Tab Navigation ----

document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach((c) => c.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");
  });
});

// ---- Lessons Tab ----

const renderLessonList = () => {
  const lessonList = document.getElementById("lessonList");
  const summaries = lessonLibrary.getLessonSummaries();

  lessonList.innerHTML = summaries
    .map(
      (summary) => `
    <div class="lesson-card" data-lesson="${summary.lessonId}">
      <div class="lesson-title">${summary.title}</div>
      <div style="color: #aaa; font-size: 14px;">
        Concepts: ${summary.concepts.join(", ")}<br>
        Exercises: ${summary.exerciseCount}
      </div>
      <button onclick="viewLesson('${summary.lessonId}')">Start Lesson</button>
    </div>
  `,
    )
    .join("");
};

const viewLesson = (lessonId) => {
  currentLesson = lessonLibrary.getLesson(lessonId);
  if (!currentLesson) return;

  document.getElementById("lessonList").style.display = "none";
  document.getElementById("lessonContent").style.display = "block";

  const detail = document.getElementById("lessonDetail");
  detail.innerHTML = `
    <h2 style="color: lightgreen;">${currentLesson.title}</h2>
    <div class="lesson-theory">
      <h3>Theory</h3>
      <p>${currentLesson.theory}</p>
    </div>
    <div class="lesson-theory">
      <h3>Concepts Covered</h3>
      <p>${currentLesson.concepts.join(", ")}</p>
    </div>
    <div class="lesson-theory">
      <h3>Examples</h3>
      ${currentLesson.examples
        .map(
          (ex) => `
        <div class="example-box">
          <p><strong>${ex.description}</strong></p>
          <pre>${ex.sql}</pre>
        </div>
      `,
        )
        .join("")}
    </div>
    <div class="lesson-theory">
      <h3>Exercises</h3>
      ${currentLesson.exercises
        .map(
          (ex, i) => `
        <div class="exercise-box">
          <p class="exercise-prompt">Exercise ${i + 1}: ${ex.prompt}</p>
          <button onclick="startExercise('${ex.id}')">Try This Exercise</button>
        </div>
      `,
        )
        .join("")}
    </div>
  `;
};

window.viewLesson = viewLesson;

document.getElementById("backToLessons").addEventListener("click", () => {
  document.getElementById("lessonList").style.display = "block";
  document.getElementById("lessonContent").style.display = "none";
  currentLesson = null;
});

// ---- Exercises Tab ----

const updateExerciseProgress = () => {
  const stats = exerciseManager.getProgressStats();
  document.getElementById("progressFill").style.width = `${stats.completionPercentage}%`;
  document.getElementById("progressText").textContent = `${stats.completed} / ${stats.total} exercises completed`;
};

const startExercise = (exerciseId) => {
  currentExercise = exerciseManager.getExercise(exerciseId.toString());
  if (!currentExercise) {
    // Try to find in lesson exercises
    currentExercise = exerciseManager.getNextIncomplete();
  }

  if (currentExercise) {
    document.getElementById("exercisePrompt").innerHTML = `
      <div class="exercise-box" style="background-color: #0d2a0d;">
        <p class="exercise-prompt">${currentExercise.prompt}</p>
      </div>
    `;
    document.getElementById("exerciseInput").value = "";
    document.getElementById("exerciseFeedback").innerHTML = "";
    document.getElementById("exerciseResult").innerHTML = "";
    document.getElementById("hintsLeft").textContent = currentExercise.getRemainingHints();
    exerciseManager.saveProgress();
    updateExerciseProgress();

    // Switch to exercises tab
    document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach((c) => c.classList.remove("active"));
    document.querySelector('[data-tab="exercises"]').classList.add("active");
    document.getElementById("exercises").classList.add("active");
  }
};

window.startExercise = startExercise;

document.getElementById("checkExercise").addEventListener("click", async () => {
  if (!currentExercise) {
    currentExercise = exerciseManager.getNextIncomplete();
    if (!currentExercise) {
      document.getElementById("exerciseFeedback").innerHTML =
        '<p class="info">All exercises completed! Great job!</p>';
      return;
    }
  }

  const studentQuery = document.getElementById("exerciseInput").value.trim();

  if (!studentQuery) {
    document.getElementById("exerciseFeedback").innerHTML =
      '<p class="error">Please enter a SQL query first.</p>';
    return;
  }

  const result = currentExercise.validate(studentQuery, database);

  if (result.isCorrect) {
    document.getElementById("exerciseFeedback").innerHTML =
      '<p class="success">Correct! Great job!</p>';

    // Run the query to show results
    try {
      const queryResult = database.query(studentQuery);
      if (queryResult.rows.length > 0) {
        document.getElementById("exerciseResult").innerHTML = renderResultsTable(queryResult);
      }
    } catch {
      // Query executed successfully but no results to show
    }

    exerciseManager.saveProgress();
    updateExerciseProgress();

    // Move to next exercise after a delay
    setTimeout(() => {
      const nextExercise = exerciseManager.getNextIncomplete();
      if (nextExercise) {
        startExercise(nextExercise.exerciseId);
      } else {
        document.getElementById("exercisePrompt").innerHTML =
          '<p class="success" style="font-size: 18px;">🎉 Congratulations! You completed all exercises!</p>';
        document.getElementById("exerciseInput").style.display = "none";
        document.getElementById("checkExercise").disabled = true;
        document.getElementById("getHint").disabled = true;
        document.getElementById("skipExercise").disabled = true;
      }
    }, 1500);
  } else {
    document.getElementById("exerciseFeedback").innerHTML = `<p class="error">${result.feedback}</p>`;
    document.getElementById("hintsLeft").textContent = currentExercise.getRemainingHints();
  }
});

document.getElementById("getHint").addEventListener("click", () => {
  if (!currentExercise) return;

  const hint = currentExercise.getNextHint();
  if (hint) {
    const feedbackArea = document.getElementById("exerciseFeedback");
    feedbackArea.innerHTML += `<div class="hint-box"><strong>Hint:</strong> ${hint}</div>`;
    document.getElementById("hintsLeft").textContent = currentExercise.getRemainingHints();
  } else {
    document.getElementById("exerciseFeedback").innerHTML =
      '<p class="info">No more hints available. Try your best!</p>';
    document.getElementById("getHint").disabled = true;
  }
});

document.getElementById("skipExercise").addEventListener("click", () => {
  const nextExercise = exerciseManager.getNextIncomplete();
  if (nextExercise) {
    startExercise(nextExercise.exerciseId);
  }
});

// ---- Query Builder Tab ----

document.getElementById("buildQuery").addEventListener("click", () => {
  const table = document.getElementById("qbTable").value.trim();
  const columns = document.getElementById("qbColumns").value.trim();
  const where = document.getElementById("qbWhere").value.trim();
  const order = document.getElementById("qbOrder").value.trim();
  const limit = document.getElementById("qbLimit").value;

  if (!table) {
    document.getElementById("builderSql").textContent = "Please enter a table name.";
    return;
  }

  const builder = new SQLQueryBuilder(table, columns ? columns.split(",").map((c) => c.trim()) : ["*"]);

  if (where) {
    // Parse WHERE clause (simple parsing for demo)
    const match = where.match(/(\w+)\s*(=|>|<|>=|<=|LIKE)\s*(.+)/i);
    if (match) {
      let value = match[3].trim().replace(/^['"]|['"]$/g, "");
      builder.where(match[1], match[2], value);
    }
  }

  if (order) {
    const parts = order.split(" ");
    const col = parts[0];
    const dir = parts[1] || "ASC";
    builder.orderBy(col, dir);
  }

  if (limit) {
    builder.limit(parseInt(limit, 10));
  }

  document.getElementById("builderSql").textContent = builder.build();
});

document.getElementById("runBuilderQuery").addEventListener("click", () => {
  const sql = document.getElementById("builderSql").textContent;

  if (!sql || sql.includes("Please enter")) return;

  // Copy to sandbox and run
  queryInput.value = sql;
  document.querySelector('[data-tab="sandbox"]').click();

  setTimeout(() => {
    document.getElementById("runButton").click();
  }, 100);
});

document.getElementById("copyQuery").addEventListener("click", () => {
  const sql = document.getElementById("builderSql").textContent;
  navigator.clipboard.writeText(sql).then(() => {
    const btn = document.getElementById("copyQuery");
    btn.textContent = "Copied!";
    setTimeout(() => {
      btn.textContent = "Copy Query";
    }, 1500);
  });
});

// ---- Sandbox Tab (Original functionality) ----

const showMessage = (text, className) => {
  const p = document.createElement("p");
  p.className = className;
  p.textContent = text;
  output.appendChild(p);
};

const renderResultsTable = (result) => {
  if (result.rows.length === 0) return '<p class="info">Query returned no rows.</p>';

  let html = "<table><thead><tr>";
  result.columns.forEach((col) => {
    html += `<th>${col}</th>`;
  });
  html += "</tr></thead><tbody>";

  result.rows.forEach((row) => {
    html += "<tr>";
    result.columns.forEach((col) => {
      const val = row[col];
      html += `<td>${val !== null ? val : "NULL"}</td>`;
    });
    html += "</tr>";
  });
  html += "</tbody></table>";

  return html;
};

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
      output.innerHTML = renderResultsTable(result);
      showMessage(`${result.rows.length} row(s) returned.`, "success");
    } else {
      const result = database.execute(sql);
      showMessage(
        `Statement executed successfully. ${result.changes} row(s) affected.`,
        "success",
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

      output.innerHTML += renderResultsTable(result);
    });
  } catch (err) {
    showMessage(err.message, "error");
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
  }
});

// ---- Initialize ----

renderLessonList();
updateExerciseProgress();

// Auto-start with first incomplete exercise
const firstIncomplete = exerciseManager.getNextIncomplete();
if (firstIncomplete) {
  startExercise(firstIncomplete.exerciseId);
}
