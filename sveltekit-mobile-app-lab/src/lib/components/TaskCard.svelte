<!--
  TaskCard.svelte
  Card component for a single task.

  Features:
  • Completion toggle button with haptic feedback via the haptics service.
  • Left-swipe gesture that reveals a delete background; if the swipe exceeds
    SWIPE_THRESHOLD (80 px) the card is deleted with a heavier haptic.
  • Tapping the card body navigates to the edit screen via onEdit().
  • Due-date display with overdue highlighting.
  • PriorityBadge and tag pills in the meta row.
  • touch-action: pan-y on the card prevents scroll interference while still
    allowing vertical scrolling of the parent list.

  Props:
    task     (Task)                     — the task data to display
    onToggle (id: string) => void       — called when the checkbox is tapped
    onDelete (id: string) => void       — called after a complete swipe-left
    onEdit   (id: string) => void       — called when the card body is tapped
-->
<script lang="ts">
  import type { Task } from '$lib/types';
  import PriorityBadge from './PriorityBadge.svelte';
  import { triggerHaptic } from '$lib/services/haptics';

  interface Props {
    task: Task;
    onToggle: (id: string) => void;
    onDelete: (id: string) => void;
    onEdit: (id: string) => void;
  }

  const { task, onToggle, onDelete, onEdit }: Props = $props();

  // ── Swipe-to-delete state ────────────────────────────────────────────────
  let swipeStartX = $state(0);
  let swipeOffset = $state(0);
  let isSwiping = $state(false);

  /** Minimum leftward swipe distance (px) to trigger deletion. */
  const SWIPE_THRESHOLD = 80;

  // ── Derived display values ───────────────────────────────────────────────
  /** True when the task has a due date that has already passed. */
  const isOverdue = $derived(
    task.dueDate !== null &&
      !task.completed &&
      new Date(task.dueDate) < new Date()
  );

  // ── Date formatter ───────────────────────────────────────────────────────
  function formatDate(dateStr: string): string {
    const date = new Date(dateStr + 'T00:00:00'); // Avoid UTC off-by-one.
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }

  // ── Touch gesture handlers ───────────────────────────────────────────────
  function handleTouchStart(e: TouchEvent): void {
    swipeStartX = e.touches[0].clientX;
    isSwiping = true;
  }

  function handleTouchMove(e: TouchEvent): void {
    if (!isSwiping) return;
    const diff = e.touches[0].clientX - swipeStartX;
    // Only allow leftward swipe (negative offset).
    swipeOffset = Math.min(0, diff);
  }

  async function handleTouchEnd(): Promise<void> {
    isSwiping = false;
    if (Math.abs(swipeOffset) > SWIPE_THRESHOLD) {
      // Heavy haptic for destructive action.
      await triggerHaptic('heavy');
      onDelete(task.id);
    } else {
      // Snap back to resting position.
      swipeOffset = 0;
    }
  }

  // ── Action handlers ──────────────────────────────────────────────────────
  async function handleToggle(): Promise<void> {
    await triggerHaptic('medium');
    onToggle(task.id);
  }

  function handleEdit(): void {
    onEdit(task.id);
  }
</script>

<div class="card-wrapper">
  <!-- Revealed delete affordance when user swipes left -->
  <div class="delete-hint" aria-hidden="true">
    <span class="delete-icon">🗑</span>
    <span>Delete</span>
  </div>

  <!-- Main card surface — translates horizontally with the swipe gesture -->
  <div
    class="task-card"
    class:completed={task.completed}
    class:overdue={isOverdue}
    role="listitem"
    style:transform="translateX({swipeOffset}px)"
    style:transition={isSwiping ? 'none' : 'transform 0.25s ease'}
    ontouchstart={handleTouchStart}
    ontouchmove={handleTouchMove}
    ontouchend={handleTouchEnd}
  >
    <!-- Completion toggle -->
    <button
      class="toggle-btn"
      class:checked={task.completed}
      onclick={handleToggle}
      aria-label="Toggle task completion"
      type="button"
    >
      {#if task.completed}
        <span class="checkmark" aria-hidden="true">✓</span>
      {/if}
    </button>

    <!-- Card body — tapping opens the edit screen -->
    <button
      class="task-body"
      onclick={handleEdit}
      aria-label="Edit task: {task.title}"
      type="button"
    >
      <span class="task-title" class:done={task.completed}>{task.title}</span>

      <div class="task-meta">
        <PriorityBadge priority={task.priority} />

        {#if task.dueDate}
          <span class="due-date" class:overdue-label={isOverdue}>
            📅 {formatDate(task.dueDate)}
          </span>
        {/if}

        {#if task.tags.length > 0}
          <div class="tags" aria-label="Tags">
            {#each task.tags.slice(0, 2) as tag}
              <span class="tag">#{tag}</span>
            {/each}
          </div>
        {/if}
      </div>
    </button>
  </div>
</div>

<style>
  .card-wrapper {
    position: relative;
    overflow: hidden;
    border-radius: var(--border-radius-md);
    margin-bottom: var(--spacing-sm);
  }

  /* Red background revealed during swipe */
  .delete-hint {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding-right: var(--spacing-lg);
    background: var(--color-priority-high);
    color: white;
    font-weight: 600;
    font-size: 14px;
    gap: var(--spacing-sm);
    border-radius: var(--border-radius-md);
    z-index: 0;
  }

  .delete-icon {
    font-size: 20px;
  }

  .task-card {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-md);
    padding: var(--spacing-md);
    background: var(--color-surface);
    border-radius: var(--border-radius-md);
    box-shadow: var(--shadow-sm);
    /* pan-y lets the list scroll vertically while we capture horizontal drags */
    touch-action: pan-y;
    will-change: transform;
  }

  .task-card.completed {
    opacity: 0.6;
  }

  .task-card.overdue {
    border-left: 3px solid var(--color-priority-high);
  }

  /* ── Completion toggle ──────────────────────────────────────────────── */
  .toggle-btn {
    flex-shrink: 0;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    border: 2px solid var(--color-border);
    background: transparent;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    margin-top: 1px;
    transition: background 0.2s, border-color 0.2s;
    touch-action: manipulation;
  }

  .toggle-btn.checked {
    background: var(--color-primary);
    border-color: var(--color-primary);
    color: white;
  }

  .checkmark {
    font-size: 13px;
    font-weight: 700;
    line-height: 1;
  }

  /* ── Card body (tap to edit) ────────────────────────────────────────── */
  .task-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
    background: transparent;
    border: none;
    cursor: pointer;
    text-align: left;
    padding: 0;
    min-width: 0;
    touch-action: manipulation;
  }

  .task-title {
    font-size: 15px;
    font-weight: 500;
    color: var(--color-text-primary);
    line-height: 1.4;
    word-break: break-word;
  }

  .task-title.done {
    text-decoration: line-through;
    color: var(--color-text-secondary);
  }

  /* ── Meta row ───────────────────────────────────────────────────────── */
  .task-meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--spacing-sm);
    margin-top: 2px;
  }

  .due-date {
    font-size: 12px;
    color: var(--color-text-secondary);
  }

  .overdue-label {
    color: var(--color-priority-high);
    font-weight: 600;
  }

  .tags {
    display: flex;
    gap: var(--spacing-xs);
  }

  .tag {
    font-size: 11px;
    color: var(--color-primary);
    font-weight: 600;
  }
</style>
