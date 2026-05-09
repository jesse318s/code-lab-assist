<!--
  Dashboard — /
  Shows a completion ring, top-level stats, and the three most recent tasks.
  The floating-action role is fulfilled by BottomNav's centre + button.

  Svelte 5 runes used:
    $derived — computes stats and recent task slice reactively from the store
    $taskStore — auto-subscription to the Svelte writable store
-->
<script lang="ts">
  import { flip } from 'svelte/animate';
  import { goto } from '$app/navigation';
  import StatsRing from '$lib/components/StatsRing.svelte';
  import TaskCard from '$lib/components/TaskCard.svelte';
  import { taskStore } from '$lib/stores/taskStore';

  // ── Reactive stats derived from the store ────────────────────────────────
  const total = $derived($taskStore.length);
  const completed = $derived($taskStore.filter((t) => t.completed).length);
  const pending = $derived(total - completed);

  // Show the 3 most recently created tasks (newest first).
  const recent = $derived(
    [...$taskStore]
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 3)
  );

  // ── Task action handlers ─────────────────────────────────────────────────
  function handleToggle(id: string): void {
    taskStore.toggleComplete(id);
  }

  function handleDelete(id: string): void {
    taskStore.deleteTask(id);
  }

  function handleEdit(id: string): void {
    goto(`/tasks/${id}`);
  }
</script>

<svelte:head>
  <title>TaskFlow — Dashboard</title>
  <meta name="description" content="TaskFlow task manager dashboard" />
</svelte:head>

<div class="dashboard">
  <!-- ── Header ──────────────────────────────────────────────────────────── -->
  <header class="page-header">
    <h1 class="page-title">TaskFlow</h1>
    <p class="page-subtitle">
      {#if pending === 0 && total > 0}
        All caught up! 🎉
      {:else if total === 0}
        Add your first task below
      {:else}
        {pending} task{pending === 1 ? '' : 's'} remaining
      {/if}
    </p>
  </header>

  <!-- ── Completion ring + stat counters ─────────────────────────────────── -->
  <section class="ring-section" aria-label="Task completion overview">
    <StatsRing {total} {completed} />
    <div class="stats-grid">
      <div class="stat">
        <span class="stat-value">{total}</span>
        <span class="stat-label">Total</span>
      </div>
      <div class="stat">
        <span class="stat-value" style:color="var(--color-priority-low)"
          >{completed}</span
        >
        <span class="stat-label">Done</span>
      </div>
      <div class="stat">
        <span class="stat-value" style:color="var(--color-primary)"
          >{pending}</span
        >
        <span class="stat-label">Pending</span>
      </div>
    </div>
  </section>

  <!-- ── Recent tasks ─────────────────────────────────────────────────────── -->
  {#if recent.length > 0}
    <section class="recent-section">
      <div class="section-header">
        <h2 class="section-title">Recent Tasks</h2>
        <a href="/tasks" class="see-all-link">See all →</a>
      </div>

      <ul class="task-list" aria-label="Recent tasks">
        {#each recent as task (task.id)}
          <li animate:flip={{ duration: 280 }}>
            <TaskCard
              {task}
              onToggle={handleToggle}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          </li>
        {/each}
      </ul>
    </section>
  {:else}
    <!-- Empty state -->
    <div class="empty-state">
      <span class="empty-icon" aria-hidden="true">📋</span>
      <p class="empty-text">No tasks yet.</p>
      <p class="empty-hint">Tap <strong>+</strong> in the navigation to get started.</p>
    </div>
  {/if}
</div>

<style>
  .dashboard {
    padding: var(--spacing-lg) var(--spacing-md);
    max-width: 480px;
    margin: 0 auto;
  }

  /* ── Header ─────────────────────────────────────────────────────────── */
  .page-header {
    margin-bottom: var(--spacing-lg);
  }

  .page-title {
    margin: 0 0 var(--spacing-xs);
    font-size: 28px;
    font-weight: 800;
    color: var(--color-text-primary);
    letter-spacing: -0.5px;
  }

  .page-subtitle {
    margin: 0;
    color: var(--color-text-secondary);
    font-size: 15px;
  }

  /* ── Stats ring card ─────────────────────────────────────────────────── */
  .ring-section {
    display: flex;
    align-items: center;
    gap: var(--spacing-xl);
    background: var(--color-surface);
    border-radius: var(--border-radius-lg);
    padding: var(--spacing-lg);
    margin-bottom: var(--spacing-lg);
    box-shadow: var(--shadow-sm);
  }

  .stats-grid {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .stat {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .stat-value {
    font-size: 24px;
    font-weight: 700;
    line-height: 1;
    color: var(--color-text-primary);
  }

  .stat-label {
    font-size: 11px;
    color: var(--color-text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    font-weight: 600;
  }

  /* ── Recent tasks section ─────────────────────────────────────────────── */
  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--spacing-sm);
  }

  .section-title {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
    color: var(--color-text-primary);
  }

  .see-all-link {
    font-size: 14px;
    color: var(--color-primary);
    text-decoration: none;
    font-weight: 600;
  }

  .task-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .task-list li {
    display: block;
  }

  /* ── Empty state ──────────────────────────────────────────────────────── */
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-xl) var(--spacing-lg);
    text-align: center;
    gap: var(--spacing-sm);
    min-height: 200px;
  }

  .empty-icon {
    font-size: 48px;
    line-height: 1;
  }

  .empty-text {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  .empty-hint {
    margin: 0;
    font-size: 14px;
    color: var(--color-text-secondary);
  }
</style>
