<!--
  Tasks — /tasks
  Full filterable task list.

  Features:
  • Search input that filters by title (case-insensitive).
  • Filter tabs: All / Pending / Completed.
  • Sorted newest-first.
  • animate:flip on list items; transition:slide on individual items.
  • Delegates toggle/delete to taskStore; navigate to /tasks/[id] on edit.
-->
<script lang="ts">
  import { flip } from 'svelte/animate';
  import { slide } from 'svelte/transition';
  import { goto } from '$app/navigation';
  import TaskCard from '$lib/components/TaskCard.svelte';
  import { taskStore } from '$lib/stores/taskStore';
  import type { FilterOption } from '$lib/types';

  // ── Filter & search state ────────────────────────────────────────────────
  let filter = $state<FilterOption>('all');
  let search = $state('');

  const filters: { label: string; value: FilterOption }[] = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Done', value: 'completed' }
  ];

  // ── Derived list (filter + search + sort) ────────────────────────────────
  const tasks = $derived(
    [...$taskStore]
      .filter((t) => {
        if (filter === 'pending') return !t.completed;
        if (filter === 'completed') return t.completed;
        return true;
      })
      .filter((t) =>
        search.trim() === ''
          ? true
          : t.title.toLowerCase().includes(search.trim().toLowerCase())
      )
      .sort((a, b) => b.createdAt - a.createdAt)
  );

  // ── Action handlers ──────────────────────────────────────────────────────
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
  <title>TaskFlow — Tasks</title>
  <meta name="description" content="All your TaskFlow tasks" />
</svelte:head>

<div class="tasks-page">
  <!-- ── Header ──────────────────────────────────────────────────────────── -->
  <header class="page-header">
    <h1 class="page-title">Tasks</h1>
  </header>

  <!-- ── Search bar ──────────────────────────────────────────────────────── -->
  <div class="search-wrapper">
    <span class="search-icon" aria-hidden="true">🔍</span>
    <input
      class="search-input"
      type="search"
      bind:value={search}
      placeholder="Search tasks…"
      aria-label="Search tasks"
      autocomplete="off"
      autocapitalize="off"
    />
    {#if search}
      <button
        class="search-clear"
        type="button"
        aria-label="Clear search"
        onclick={() => (search = '')}
      >×</button>
    {/if}
  </div>

  <!-- ── Filter tabs ──────────────────────────────────────────────────────── -->
  <div class="filter-tabs" role="tablist" aria-label="Task filter">
    {#each filters as f}
      <button
        class="filter-tab"
        class:active={filter === f.value}
        role="tab"
        aria-selected={filter === f.value}
        type="button"
        onclick={() => (filter = f.value)}
      >
        {f.label}
      </button>
    {/each}
  </div>

  <!-- ── Task list ────────────────────────────────────────────────────────── -->
  {#if tasks.length > 0}
    <ul class="task-list" aria-label="Task list" aria-live="polite">
      {#each tasks as task (task.id)}
        <li animate:flip={{ duration: 280 }} transition:slide={{ duration: 200 }}>
          <TaskCard
            {task}
            onToggle={handleToggle}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        </li>
      {/each}
    </ul>
  {:else}
    <div class="empty-state">
      <span class="empty-icon" aria-hidden="true">
        {search ? '🔎' : filter === 'completed' ? '🏁' : '📋'}
      </span>
      <p class="empty-text">
        {#if search}
          No tasks match "{search}"
        {:else if filter === 'completed'}
          No completed tasks yet
        {:else if filter === 'pending'}
          Nothing pending — great work!
        {:else}
          No tasks yet. Tap <strong>+</strong> to add one.
        {/if}
      </p>
    </div>
  {/if}
</div>

<style>
  .tasks-page {
    padding: var(--spacing-lg) var(--spacing-md);
    max-width: 480px;
    margin: 0 auto;
  }

  /* ── Header ─────────────────────────────────────────────────────────── */
  .page-header {
    margin-bottom: var(--spacing-md);
  }

  .page-title {
    margin: 0;
    font-size: 28px;
    font-weight: 800;
    color: var(--color-text-primary);
    letter-spacing: -0.5px;
  }

  /* ── Search bar ──────────────────────────────────────────────────────── */
  .search-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    margin-bottom: var(--spacing-md);
  }

  .search-icon {
    position: absolute;
    left: var(--spacing-md);
    font-size: 14px;
    pointer-events: none;
    user-select: none;
  }

  .search-input {
    width: 100%;
    padding: var(--spacing-sm) var(--spacing-md) var(--spacing-sm)
      calc(var(--spacing-md) + 24px);
    border: 1.5px solid var(--color-border);
    border-radius: var(--border-radius-md);
    background: var(--color-surface);
    color: var(--color-text-primary);
    font-size: 15px;
    font-family: var(--font-family);
    outline: none;
    min-height: 44px;
    transition: border-color 0.2s;
    touch-action: manipulation;
    /* Remove native search clear button — we have our own */
    -webkit-appearance: none;
  }

  .search-input:focus {
    border-color: var(--color-primary);
  }

  .search-clear {
    position: absolute;
    right: var(--spacing-sm);
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: var(--color-border);
    color: var(--color-text-secondary);
    border-radius: 50%;
    font-size: 18px;
    cursor: pointer;
    touch-action: manipulation;
    line-height: 1;
  }

  /* ── Filter tabs ─────────────────────────────────────────────────────── */
  .filter-tabs {
    display: flex;
    gap: var(--spacing-xs);
    margin-bottom: var(--spacing-md);
    background: var(--color-surface);
    padding: var(--spacing-xs);
    border-radius: var(--border-radius-md);
    box-shadow: var(--shadow-sm);
  }

  .filter-tab {
    flex: 1;
    padding: var(--spacing-xs) var(--spacing-sm);
    border: none;
    border-radius: var(--border-radius-sm);
    background: transparent;
    color: var(--color-text-secondary);
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    min-height: 36px;
    transition: background 0.15s, color 0.15s;
    touch-action: manipulation;
    font-family: var(--font-family);
  }

  .filter-tab.active {
    background: var(--color-primary);
    color: white;
  }

  /* ── Task list ───────────────────────────────────────────────────────── */
  .task-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .task-list li {
    display: block;
  }

  /* ── Empty state ─────────────────────────────────────────────────────── */
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
    font-size: 16px;
    color: var(--color-text-secondary);
    line-height: 1.5;
  }
</style>
