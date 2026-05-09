/**
 * TaskCard.test.ts
 * Component tests for TaskCard.svelte using @testing-library/svelte v5.
 *
 * @testing-library/svelte v5 with Svelte 5:
 *   render(Component, { prop1, prop2 })  ← props are the second argument directly
 *
 * triggerHaptic is mocked so no native Capacitor calls are made.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import TaskCard from '$lib/components/TaskCard.svelte';
import type { Task } from '$lib/types';

// Mock the haptics service so tests never attempt native calls.
vi.mock('$lib/services/haptics', () => ({
  triggerHaptic: vi.fn().mockResolvedValue(undefined)
}));

// ── Fixture ───────────────────────────────────────────────────────────────────

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'abc-123',
    title: 'Write unit tests',
    dueDate: null,
    priority: 'medium',
    tags: [],
    completed: false,
    createdAt: Date.now(),
    ...overrides
  };
}

// ── Suites ────────────────────────────────────────────────────────────────────

describe('TaskCard', () => {
  const onToggle = vi.fn();
  const onDelete = vi.fn();
  const onEdit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Rendering ─────────────────────────────────────────────────────────────

  it('renders the task title', () => {
    const task = makeTask({ title: 'Buy groceries' });
    const { getByText } = render(TaskCard, { task, onToggle, onDelete, onEdit });

    expect(getByText('Buy groceries')).toBeTruthy();
  });

  it('applies line-through styling when task is completed', () => {
    const task = makeTask({ completed: true });
    const { getByText } = render(TaskCard, { task, onToggle, onDelete, onEdit });

    const titleEl = getByText(task.title);

    expect(titleEl.classList.contains('done')).toBe(true);
  });

  it('renders a due date when present', () => {
    const task = makeTask({ dueDate: '2025-12-25' });
    const { getByText } = render(TaskCard, { task, onToggle, onDelete, onEdit });

    // The formatted date should appear somewhere in the component.
    expect(getByText(/Dec 25/)).toBeTruthy();
  });

  it('renders tags when present', () => {
    const task = makeTask({ tags: ['work', 'urgent'] });
    const { getByText } = render(TaskCard, { task, onToggle, onDelete, onEdit });

    expect(getByText('#work')).toBeTruthy();
    expect(getByText('#urgent')).toBeTruthy();
  });

  it('limits displayed tags to two', () => {
    const task = makeTask({ tags: ['a', 'b', 'c'] });
    const { queryByText } = render(TaskCard, { task, onToggle, onDelete, onEdit });

    // Third tag should not appear.
    expect(queryByText('#c')).toBeNull();
  });

  // ── Toggle ────────────────────────────────────────────────────────────────

  it('calls onToggle with the task id when the toggle button is clicked', async () => {
    const task = makeTask();
    const { getByRole } = render(TaskCard, { task, onToggle, onDelete, onEdit });

    const toggleBtn = getByRole('button', { name: /toggle task completion/i });

    await fireEvent.click(toggleBtn);

    expect(onToggle).toHaveBeenCalledOnce();
    expect(onToggle).toHaveBeenCalledWith(task.id);
  });

  it('shows a checkmark when the task is completed', () => {
    const task = makeTask({ completed: true });
    const { getByText } = render(TaskCard, { task, onToggle, onDelete, onEdit });

    expect(getByText('✓')).toBeTruthy();
  });

  // ── Edit ──────────────────────────────────────────────────────────────────

  it('calls onEdit with the task id when the card body is clicked', async () => {
    const task = makeTask();
    const { getByRole } = render(TaskCard, { task, onToggle, onDelete, onEdit });

    const editBtn = getByRole('button', { name: /edit task/i });

    await fireEvent.click(editBtn);

    expect(onEdit).toHaveBeenCalledOnce();
    expect(onEdit).toHaveBeenCalledWith(task.id);
  });

  // ── Overdue ───────────────────────────────────────────────────────────────

  it('adds the overdue border class when the task is past due and not completed', () => {
    const task = makeTask({ dueDate: '2020-01-01', completed: false });
    const { container } = render(TaskCard, { task, onToggle, onDelete, onEdit });

    const card = container.querySelector('.task-card');

    expect(card?.classList.contains('overdue')).toBe(true);
  });

  it('does not mark an overdue date as overdue when the task is completed', () => {
    const task = makeTask({ dueDate: '2020-01-01', completed: true });
    const { container } = render(TaskCard, { task, onToggle, onDelete, onEdit });

    const card = container.querySelector('.task-card');

    expect(card?.classList.contains('overdue')).toBe(false);
  });
});
