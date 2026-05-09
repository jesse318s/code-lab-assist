/** Priority levels for tasks, ordered low → high. */
export type Priority = 'low' | 'medium' | 'high';

/** Filter options used by the task list and filteredTasks factory. */
export type FilterOption = 'all' | 'pending' | 'completed';

/** Core data model for a single task. */
export interface Task {
  /** Unique identifier generated with crypto.randomUUID(). */
  id: string;
  /** Human-readable task title. */
  title: string;
  /** ISO date string (YYYY-MM-DD) or null if no due date is set. */
  dueDate: string | null;
  /** Task priority level used for colour-coding and sorting. */
  priority: Priority;
  /** Optional user-defined tags for grouping / filtering. */
  tags: string[];
  /** Whether the task has been marked complete. */
  completed: boolean;
  /** Unix timestamp (ms) recorded when the task was created. */
  createdAt: number;
  /** Unix timestamp (ms) of the last edit — undefined until first update. */
  updatedAt?: number;
}
