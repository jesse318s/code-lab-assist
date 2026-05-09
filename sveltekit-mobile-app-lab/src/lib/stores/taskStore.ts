/**
 * taskStore — persistent Svelte writable store for Task data.
 *
 * Reads the initial state from localStorage on the browser, subscribes to
 * every change, and writes back immediately so data survives page reloads.
 * All mutations are co-located here as named action methods so components
 * never call writable's update() directly.
 *
 * Guard pattern: every localStorage or crypto call is wrapped with the
 * `browser` flag from $app/environment so the store stays SSR-safe.
 */
import { writable, derived, get } from 'svelte/store';
import { browser } from '$app/environment';
import type { Task, Priority, FilterOption } from '$lib/types';

const STORAGE_KEY = 'taskflow-tasks';

function createTaskStore() {
  // Seed from localStorage when running in a real browser context.
  const initial: Task[] = browser
    ? (JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as Task[])
    : [];

  const { subscribe, update, set } = writable<Task[]>(initial);

  // Persist every mutation to localStorage.
  if (browser) {
    subscribe((tasks) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    });
  }

  return {
    subscribe,

    /**
     * Append a new task.  The id is generated with crypto.randomUUID() and
     * createdAt is set to the current Unix timestamp in milliseconds.
     */
    addTask(
      title: string,
      dueDate: string | null,
      priority: Priority,
      tags: string[] = []
    ): void {
      update((tasks) => [
        ...tasks,
        {
          id: crypto.randomUUID(),
          title,
          dueDate,
          priority,
          tags,
          completed: false,
          createdAt: Date.now()
        }
      ]);
    },

    /** Shallow-merge `updates` into the matching task and stamp updatedAt. */
    updateTask(id: string, updates: Partial<Task>): void {
      update((tasks) =>
        tasks.map((t) =>
          t.id === id ? { ...t, ...updates, updatedAt: Date.now() } : t
        )
      );
    },

    /** Remove the task with the given id. */
    deleteTask(id: string): void {
      update((tasks) => tasks.filter((t) => t.id !== id));
    },

    /** Flip the completed flag for the given task. */
    toggleComplete(id: string): void {
      update((tasks) =>
        tasks.map((t) =>
          t.id === id
            ? { ...t, completed: !t.completed, updatedAt: Date.now() }
            : t
        )
      );
    },

    /**
     * Reset the store to an empty array.
     * Used in Vitest beforeEach hooks to guarantee test isolation.
     */
    clear(): void {
      set([]);
    }
  };
}

export const taskStore = createTaskStore();

/**
 * Factory that returns a derived store pre-filtered by status and optional tag.
 *
 * @example
 *   const pending = filteredTasks('pending');
 *   const workTasks = filteredTasks('all', 'work');
 */
export function filteredTasks(filter: FilterOption, tag?: string) {
  return derived(taskStore, ($tasks) => {
    let result = $tasks;

    if (filter === 'pending') result = result.filter((t) => !t.completed);
    if (filter === 'completed') result = result.filter((t) => t.completed);
    if (tag) result = result.filter((t) => t.tags.includes(tag));

    return result;
  });
}

// Re-export get so test files only need one import.
export { get };
