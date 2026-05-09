<!--
  Task Detail — /tasks/[id]
  Edit an existing task or view it in read-only mode when completed.

  Features:
  • Loads the task from taskStore by id (from page.data.taskId).
  • Redirects back to /tasks if the id is not found.
  • Pre-populates TaskForm with the existing task data.
  • Delete button with confirmation prompt.
  • scheduleReminder / cancelReminder wired to the due-date field.
  • Back button navigates to /tasks.
-->
<script lang="ts">
  import { goto } from '$app/navigation';
  import TaskForm from '$lib/components/TaskForm.svelte';
  import { taskStore } from '$lib/stores/taskStore';
  import { scheduleReminder, cancelReminder } from '$lib/services/notifications';
  import type { Task, Priority } from '$lib/types';

  // page.data comes from the +page.js load function.
  interface PageData {
    taskId: string;
  }

  interface Props {
    data: PageData;
  }

  const { data }: Props = $props();

  // ── Reactive task lookup ─────────────────────────────────────────────────
  const task = $derived($taskStore.find((t) => t.id === data.taskId) ?? null);

  // ── Confirmation state ───────────────────────────────────────────────────
  let confirmDelete = $state(false);

  // ── Form data shape (mirrors TaskForm.onSave) ────────────────────────────
  interface FormData {
    title: string;
    dueDate: string | null;
    priority: Priority;
    tags: string[];
  }

  // ── Handlers ────────────────────────────────────────────────────────────
  async function handleSave(formData: FormData): Promise<void> {
    if (!task) return;

    taskStore.updateTask(task.id, {
      title: formData.title,
      dueDate: formData.dueDate,
      priority: formData.priority,
      tags: formData.tags
    });

    // Reschedule notification when due date changes.
    if (formData.dueDate) {
      await scheduleReminder(task.id, formData.title, formData.dueDate);
    } else {
      await cancelReminder(task.id);
    }

    goto('/tasks');
  }

  function handleCancel(): void {
    goto('/tasks');
  }

  async function handleDelete(): Promise<void> {
    if (!task) return;

    if (!confirmDelete) {
      confirmDelete = true;
      return;
    }

    await cancelReminder(task.id);
    taskStore.deleteTask(task.id);
    goto('/tasks');
  }
</script>

<svelte:head>
  <title>TaskFlow — {task?.title ?? 'Task'}</title>
</svelte:head>

<div class="detail-page">
  <!-- ── Back navigation ──────────────────────────────────────────────────── -->
  <header class="page-header">
    <a href="/tasks" class="back-btn" aria-label="Back to tasks">
      <span aria-hidden="true">←</span> Tasks
    </a>
    <h1 class="page-title">Edit Task</h1>
  </header>

  {#if task}
    <!-- ── Edit form ────────────────────────────────────────────────────────── -->
    <div class="form-card">
      <TaskForm
        initialTask={task}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </div>

    <!-- ── Danger zone ───────────────────────────────────────────────────────── -->
    <div class="danger-zone">
      {#if confirmDelete}
        <p class="confirm-text">Are you sure? This cannot be undone.</p>
        <div class="confirm-actions">
          <button
            class="btn btn-ghost"
            type="button"
            onclick={() => (confirmDelete = false)}
          >Cancel</button>
          <button
            class="btn btn-danger"
            type="button"
            onclick={handleDelete}
          >Yes, Delete</button>
        </div>
      {:else}
        <button
          class="btn btn-danger-outline"
          type="button"
          onclick={handleDelete}
        >
          Delete Task
        </button>
      {/if}
    </div>
  {:else}
    <!-- Task not found (store hasn't hydrated yet or bad id) -->
    <div class="not-found">
      <span class="not-found-icon" aria-hidden="true">🔍</span>
      <p>Task not found.</p>
      <a href="/tasks" class="btn btn-primary">Back to Tasks</a>
    </div>
  {/if}
</div>

<style>
  .detail-page {
    padding: var(--spacing-lg) var(--spacing-md);
    max-width: 480px;
    margin: 0 auto;
  }

  /* ── Header ─────────────────────────────────────────────────────────── */
  .page-header {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-lg);
  }

  .back-btn {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    color: var(--color-primary);
    text-decoration: none;
    font-size: 15px;
    font-weight: 600;
    min-height: 44px;
    touch-action: manipulation;
    flex-shrink: 0;
  }

  .page-title {
    margin: 0;
    font-size: 20px;
    font-weight: 800;
    color: var(--color-text-primary);
  }

  /* ── Form card ───────────────────────────────────────────────────────── */
  .form-card {
    background: var(--color-surface);
    border-radius: var(--border-radius-lg);
    padding: var(--spacing-lg);
    box-shadow: var(--shadow-sm);
    margin-bottom: var(--spacing-lg);
  }

  /* ── Danger zone ─────────────────────────────────────────────────────── */
  .danger-zone {
    border-top: 1px solid var(--color-border);
    padding-top: var(--spacing-lg);
  }

  .confirm-text {
    margin: 0 0 var(--spacing-md);
    font-size: 14px;
    color: var(--color-priority-high);
    font-weight: 600;
  }

  .confirm-actions {
    display: flex;
    gap: var(--spacing-sm);
  }

  /* ── Buttons ─────────────────────────────────────────────────────────── */
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
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
    text-decoration: none;
  }

  .btn:active {
    opacity: 0.75;
  }

  .btn-primary {
    background: var(--color-primary);
    color: white;
  }

  .btn-ghost {
    flex: 1;
    background: var(--color-background);
    color: var(--color-text-secondary);
    border: 1.5px solid var(--color-border);
  }

  .btn-danger {
    flex: 1;
    background: var(--color-priority-high);
    color: white;
  }

  .btn-danger-outline {
    width: 100%;
    background: transparent;
    color: var(--color-priority-high);
    border: 1.5px solid var(--color-priority-high);
  }

  /* ── Not found ───────────────────────────────────────────────────────── */
  .not-found {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-md);
    padding: var(--spacing-xl) 0;
    text-align: center;
  }

  .not-found-icon {
    font-size: 48px;
  }

  .not-found p {
    margin: 0;
    color: var(--color-text-secondary);
    font-size: 16px;
  }
</style>
