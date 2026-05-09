<!--
  TaskForm.svelte
  Shared create/edit form for tasks.  Used by:
    • BottomNav quick-add bottom sheet (initialTask = null)
    • Task Detail screen /tasks/[id] (initialTask = existing Task)

  Props:
    initialTask (Task | null)                              — null → create mode
    onSave      (data: FormData) => void                   — called on valid submit
    onCancel    () => void                                 — called on cancel
-->
<script lang="ts">
  import { untrack } from 'svelte';
  import type { Task, Priority } from '$lib/types';

  /** Shape of the data emitted to the parent on save. */
  interface FormData {
    title: string;
    dueDate: string | null;
    priority: Priority;
    tags: string[];
  }

  interface Props {
    initialTask?: Task | null;
    onSave: (data: FormData) => void;
    onCancel: () => void;
  }

  const { initialTask = null, onSave, onCancel }: Props = $props();

  // ── Form field state ─────────────────────────────────────────────────────
  // untrack() prevents the Svelte 5 "state_referenced_locally" warning:
  // the prop is read once to seed the local state; reactivity tracks via
  // the local $state variables from that point forward.
  let title = $state(untrack(() => initialTask?.title ?? ''));
  let dueDate = $state(untrack(() => initialTask?.dueDate ?? ''));
  let priority = $state<Priority>(untrack(() => initialTask?.priority ?? 'medium'));
  let tagsInput = $state(untrack(() => initialTask?.tags.join(', ') ?? ''));

  let titleError = $state('');

  const priorities: Priority[] = ['low', 'medium', 'high'];

  // ── Submit handler ───────────────────────────────────────────────────────
  function handleSubmit(e: SubmitEvent): void {
    e.preventDefault();
    titleError = '';

    if (!title.trim()) {
      titleError = 'Title is required';
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    onSave({
      title: title.trim(),
      dueDate: dueDate || null,
      priority,
      tags
    });
  }
</script>

<form class="task-form" onsubmit={handleSubmit}>
  <!-- Title -->
  <div class="form-group">
    <label for="task-title" class="form-label">Title</label>
    <input
      id="task-title"
      class="form-input"
      class:input-error={titleError}
      type="text"
      bind:value={title}
      placeholder="What needs to be done?"
      autocomplete="off"
      autocapitalize="sentences"
      required
    />
    {#if titleError}
      <span class="error-msg" role="alert">{titleError}</span>
    {/if}
  </div>

  <!-- Due date -->
  <div class="form-group">
    <label for="task-due-date" class="form-label">Due Date</label>
    <input
      id="task-due-date"
      class="form-input"
      type="date"
      bind:value={dueDate}
    />
  </div>

  <!-- Priority radio group -->
  <fieldset class="form-group">
    <legend class="form-label">Priority</legend>
    <div class="priority-group" role="radiogroup">
      {#each priorities as p}
        <label
          class="priority-option"
          class:selected={priority === p}
          class:prio-low={p === 'low'}
          class:prio-medium={p === 'medium'}
          class:prio-high={p === 'high'}
        >
          <input type="radio" name="priority" value={p} bind:group={priority} />
          {p}
        </label>
      {/each}
    </div>
  </fieldset>

  <!-- Tags -->
  <div class="form-group">
    <label for="task-tags" class="form-label">
      Tags <span class="optional">(comma-separated)</span>
    </label>
    <input
      id="task-tags"
      class="form-input"
      type="text"
      bind:value={tagsInput}
      placeholder="work, personal, urgent…"
      autocomplete="off"
    />
  </div>

  <!-- Actions -->
  <div class="form-actions">
    <button type="button" class="btn btn-ghost" onclick={onCancel}>Cancel</button>
    <button type="submit" class="btn btn-primary">
      {initialTask ? 'Save Changes' : 'Add Task'}
    </button>
  </div>
</form>

<style>
  .task-form {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
    border: none;
    padding: 0;
    margin: 0;
  }

  .form-label {
    font-size: 12px;
    font-weight: 700;
    color: var(--color-text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .optional {
    font-weight: 400;
    text-transform: none;
    letter-spacing: 0;
    color: var(--color-text-secondary);
  }

  .form-input {
    padding: var(--spacing-sm) var(--spacing-md);
    border: 1.5px solid var(--color-border);
    border-radius: var(--border-radius-sm);
    background: var(--color-background);
    color: var(--color-text-primary);
    font-size: 15px;
    font-family: var(--font-family);
    outline: none;
    transition: border-color 0.2s;
    touch-action: manipulation;
    min-height: 44px;
  }

  .form-input:focus {
    border-color: var(--color-primary);
  }

  .form-input.input-error {
    border-color: var(--color-priority-high);
  }

  .error-msg {
    font-size: 12px;
    color: var(--color-priority-high);
    font-weight: 500;
  }

  /* ── Priority radio group ───────────────────────────────────────────── */
  .priority-group {
    display: flex;
    gap: var(--spacing-sm);
  }

  .priority-option {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-sm);
    border-radius: var(--border-radius-sm);
    border: 1.5px solid var(--color-border);
    background: var(--color-background);
    font-size: 13px;
    font-weight: 600;
    text-transform: capitalize;
    cursor: pointer;
    transition: all 0.15s;
    min-height: 44px;
    touch-action: manipulation;
    user-select: none;
  }

  /* Hide the native radio button — the label is the visual control */
  .priority-option input[type='radio'] {
    display: none;
  }

  .priority-option.selected.prio-low {
    background: var(--color-priority-low-bg);
    border-color: var(--color-priority-low);
    color: var(--color-priority-low);
  }

  .priority-option.selected.prio-medium {
    background: var(--color-priority-medium-bg);
    border-color: var(--color-priority-medium);
    color: var(--color-priority-medium);
  }

  .priority-option.selected.prio-high {
    background: var(--color-priority-high-bg);
    border-color: var(--color-priority-high);
    color: var(--color-priority-high);
  }

  /* ── Action buttons ─────────────────────────────────────────────────── */
  .form-actions {
    display: flex;
    gap: var(--spacing-sm);
    padding-top: var(--spacing-xs);
  }

  .btn {
    flex: 1;
    padding: var(--spacing-sm) var(--spacing-md);
    border-radius: var(--border-radius-sm);
    border: none;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    min-height: 44px;
    transition: opacity 0.15s;
    touch-action: manipulation;
    font-family: var(--font-family);
  }

  .btn:active {
    opacity: 0.75;
  }

  .btn-primary {
    background: var(--color-primary);
    color: white;
  }

  .btn-ghost {
    background: var(--color-background);
    color: var(--color-text-secondary);
    border: 1.5px solid var(--color-border);
  }
</style>
