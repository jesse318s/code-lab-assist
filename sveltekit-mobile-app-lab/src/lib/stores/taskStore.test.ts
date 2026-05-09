/**
 * taskStore.test.ts
 * Unit tests for the central task store and filteredTasks factory.
 *
 * The `browser` flag from $app/environment is false in Vitest (jsdom),
 * so localStorage persistence code is never executed — tests are
 * fully isolated without any additional mocking.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import { taskStore, filteredTasks } from '$lib/stores/taskStore';

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Add a task and return its generated id. */
function addAndGetId(title = 'Test task', priority = 'medium' as const): string {
  taskStore.addTask(title, null, priority, []);
  const tasks = get(taskStore);
  return tasks[tasks.length - 1].id;
}

// ── Test suites ───────────────────────────────────────────────────────────────

describe('taskStore', () => {
  beforeEach(() => {
    taskStore.clear();
  });

  // ── addTask ──────────────────────────────────────────────────────────────

  describe('addTask', () => {
    it('appends a new task to the store', () => {
      taskStore.addTask('Buy milk', null, 'low', []);

      const tasks = get(taskStore);

      expect(tasks).toHaveLength(1);
      expect(tasks[0].title).toBe('Buy milk');
    });

    it('sets completed to false by default', () => {
      taskStore.addTask('Draft report', null, 'high', []);

      expect(get(taskStore)[0].completed).toBe(false);
    });

    it('stores the provided priority and tags', () => {
      taskStore.addTask('Team meeting', '2025-06-01', 'high', ['work', 'urgent']);

      const task = get(taskStore)[0];

      expect(task.priority).toBe('high');
      expect(task.dueDate).toBe('2025-06-01');
      expect(task.tags).toEqual(['work', 'urgent']);
    });

    it('assigns a unique id to each task', () => {
      taskStore.addTask('Task A', null, 'low', []);
      taskStore.addTask('Task B', null, 'low', []);

      const [a, b] = get(taskStore);

      expect(a.id).toBeTruthy();
      expect(b.id).toBeTruthy();
      expect(a.id).not.toBe(b.id);
    });
  });

  // ── updateTask ───────────────────────────────────────────────────────────

  describe('updateTask', () => {
    it('merges the provided updates into the matching task', () => {
      const id = addAndGetId('Old title');

      taskStore.updateTask(id, { title: 'New title', priority: 'high' });

      const task = get(taskStore).find((t) => t.id === id)!;

      expect(task.title).toBe('New title');
      expect(task.priority).toBe('high');
    });

    it('stamps updatedAt on the modified task', () => {
      const id = addAndGetId();

      taskStore.updateTask(id, { title: 'Updated' });

      const task = get(taskStore).find((t) => t.id === id)!;

      expect(task.updatedAt).toBeDefined();
      expect(typeof task.updatedAt).toBe('number');
    });

    it('does not mutate other tasks', () => {
      const idA = addAndGetId('Task A');
      const idB = addAndGetId('Task B');

      taskStore.updateTask(idA, { title: 'Task A edited' });

      const taskB = get(taskStore).find((t) => t.id === idB)!;

      expect(taskB.title).toBe('Task B');
    });
  });

  // ── deleteTask ───────────────────────────────────────────────────────────

  describe('deleteTask', () => {
    it('removes the task with the given id', () => {
      const id = addAndGetId('Removable');

      taskStore.deleteTask(id);

      const found = get(taskStore).find((t) => t.id === id);

      expect(found).toBeUndefined();
    });

    it('leaves other tasks intact', () => {
      const idA = addAndGetId('Keep me');
      const idB = addAndGetId('Delete me');

      taskStore.deleteTask(idB);

      expect(get(taskStore)).toHaveLength(1);
      expect(get(taskStore)[0].id).toBe(idA);
    });
  });

  // ── toggleComplete ───────────────────────────────────────────────────────

  describe('toggleComplete', () => {
    it('flips completed from false → true', () => {
      const id = addAndGetId();

      taskStore.toggleComplete(id);

      expect(get(taskStore).find((t) => t.id === id)!.completed).toBe(true);
    });

    it('flips completed from true → false', () => {
      const id = addAndGetId();

      taskStore.toggleComplete(id); // → true
      taskStore.toggleComplete(id); // → false

      expect(get(taskStore).find((t) => t.id === id)!.completed).toBe(false);
    });

    it('stamps updatedAt on every toggle', () => {
      const id = addAndGetId();

      taskStore.toggleComplete(id);

      expect(get(taskStore).find((t) => t.id === id)!.updatedAt).toBeDefined();
    });
  });

  // ── clear ────────────────────────────────────────────────────────────────

  describe('clear', () => {
    it('empties the store', () => {
      addAndGetId('Task 1');
      addAndGetId('Task 2');

      taskStore.clear();

      expect(get(taskStore)).toHaveLength(0);
    });
  });
});

// ── filteredTasks ─────────────────────────────────────────────────────────────

describe('filteredTasks', () => {
  beforeEach(() => {
    taskStore.clear();
  });

  it('returns all tasks when filter is "all"', () => {
    const idA = addAndGetId('Pending task');
    const idB = addAndGetId('Done task');
    taskStore.toggleComplete(idB);

    const result = get(filteredTasks('all'));

    expect(result).toHaveLength(2);
    expect(result.map((t) => t.id)).toContain(idA);
    expect(result.map((t) => t.id)).toContain(idB);
  });

  it('returns only incomplete tasks when filter is "pending"', () => {
    const idPending = addAndGetId('Not done');
    const idDone = addAndGetId('Done');
    taskStore.toggleComplete(idDone);

    const result = get(filteredTasks('pending'));

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(idPending);
  });

  it('returns only completed tasks when filter is "completed"', () => {
    addAndGetId('Not done');
    const idDone = addAndGetId('Done');
    taskStore.toggleComplete(idDone);

    const result = get(filteredTasks('completed'));

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(idDone);
  });

  it('further filters by tag when a tag argument is supplied', () => {
    taskStore.addTask('Work task', null, 'medium', ['work']);
    taskStore.addTask('Personal task', null, 'low', ['personal']);

    const result = get(filteredTasks('all', 'work'));

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Work task');
  });
});
