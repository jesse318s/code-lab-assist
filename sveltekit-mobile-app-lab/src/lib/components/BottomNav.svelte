<!--
  BottomNav.svelte
  Four-tab bottom navigation bar that is fully self-contained.

  Tabs:
    1. Home     (/)         — Dashboard
    2. Tasks    (/tasks)    — Task list
    3. Add      (button)    — Opens a bottom-sheet with TaskForm; manages its
                              own showAddModal $state — no external props needed
    4. Settings (/settings) — App settings

  The active tab is derived from $page.url.pathname via $app/state so the
  component needs no props and stays in sync with client-side navigation.
-->
<script lang="ts">
  import { fly } from 'svelte/transition';
  import { page } from '$app/state';
  import { taskStore } from '$lib/stores/taskStore';
  import TaskForm from './TaskForm.svelte';
  import type { Priority } from '$lib/types';

  /** Shape passed from TaskForm.onSave back to this component. */
  interface FormData {
    title: string;
    dueDate: string | null;
    priority: Priority;
    tags: string[];
  }

  // ── Local state ──────────────────────────────────────────────────────────
  let showAddModal = $state(false);

  // ── Active tab derivation ────────────────────────────────────────────────
  /**
   * Determine which top-level route is currently active.
   * /tasks/[id] should still highlight the Tasks tab.
   */
  function isActive(href: string): boolean {
    const pathname = page.url.pathname;
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }

  // ── Add-task modal handlers ──────────────────────────────────────────────
  function handleAddSave(data: FormData): void {
    taskStore.addTask(data.title, data.dueDate, data.priority, data.tags);
    showAddModal = false;
  }

  function handleAddCancel(): void {
    showAddModal = false;
  }

  function handleBackdropClick(e: MouseEvent): void {
    if (e.target === e.currentTarget) showAddModal = false;
  }

  function handleBackdropKeydown(e: KeyboardEvent): void {
    if (e.key === 'Escape') showAddModal = false;
  }
</script>

<!-- ── Quick-add bottom sheet ──────────────────────────────────────────── -->
{#if showAddModal}
  <div
    class="modal-backdrop"
    role="dialog"
    aria-modal="true"
    aria-label="Add new task"
    onclick={handleBackdropClick}
    onkeydown={handleBackdropKeydown}
    tabindex="-1"
  >
    <div
      class="modal-sheet"
      transition:fly={{ y: 400, duration: 320, opacity: 1 }}
    >
      <div class="modal-handle" aria-hidden="true"></div>
      <h2 class="modal-title">New Task</h2>
      <TaskForm onSave={handleAddSave} onCancel={handleAddCancel} />
    </div>
  </div>
{/if}

<!-- ── Navigation bar ───────────────────────────────────────────────────── -->
<nav class="bottom-nav" aria-label="Main navigation">
  <a
    href="/"
    class="nav-item"
    class:active={isActive('/')}
    aria-label="Dashboard"
    aria-current={isActive('/') ? 'page' : undefined}
  >
    <span class="nav-icon" aria-hidden="true">⊞</span>
    <span class="nav-label">Home</span>
  </a>

  <a
    href="/tasks"
    class="nav-item"
    class:active={isActive('/tasks')}
    aria-label="Tasks"
    aria-current={isActive('/tasks') ? 'page' : undefined}
  >
    <span class="nav-icon" aria-hidden="true">☑</span>
    <span class="nav-label">Tasks</span>
  </a>

  <!-- Centre FAB — add task -->
  <button
    class="nav-item nav-add"
    type="button"
    aria-label="Add new task"
    onclick={() => (showAddModal = true)}
  >
    <span class="add-circle" aria-hidden="true">+</span>
  </button>

  <a
    href="/settings"
    class="nav-item"
    class:active={isActive('/settings')}
    aria-label="Settings"
    aria-current={isActive('/settings') ? 'page' : undefined}
  >
    <span class="nav-icon" aria-hidden="true">⚙</span>
    <span class="nav-label">Settings</span>
  </a>
</nav>

<style>
  /* ── Navigation bar ───────────────────────────────────────────────── */
  .bottom-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: var(--nav-height);
    padding-bottom: env(safe-area-inset-bottom, 0px);
    background: var(--color-nav-bg);
    border-top: 1px solid var(--color-border);
    display: flex;
    align-items: center;
    justify-content: space-around;
    z-index: 100;
    box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.06);
  }

  .nav-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    padding: var(--spacing-xs);
    text-decoration: none;
    color: var(--color-nav-inactive);
    background: transparent;
    border: none;
    cursor: pointer;
    min-height: 44px;
    touch-action: manipulation;
    transition: color 0.15s;
  }

  .nav-item.active {
    color: var(--color-nav-active);
  }

  .nav-icon {
    font-size: 20px;
    line-height: 1;
  }

  .nav-label {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  /* Centre add button — raised circular FAB */
  .nav-add {
    flex: 0 0 56px;
  }

  .add-circle {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: var(--color-primary);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 30px;
    font-weight: 300;
    line-height: 1;
    box-shadow: 0 4px 14px rgba(99, 102, 241, 0.45);
    transition: transform 0.15s, box-shadow 0.15s;
  }

  .nav-add:active .add-circle {
    transform: scale(0.9);
    box-shadow: 0 2px 6px rgba(99, 102, 241, 0.3);
  }

  /* ── Bottom sheet ─────────────────────────────────────────────────── */
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 200;
    display: flex;
    align-items: flex-end;
  }

  .modal-sheet {
    width: 100%;
    background: var(--color-surface);
    border-radius: var(--border-radius-lg) var(--border-radius-lg) 0 0;
    padding: var(--spacing-sm) var(--spacing-lg)
      calc(var(--spacing-xl) + env(safe-area-inset-bottom, 0px));
    max-height: 92dvh;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }

  .modal-handle {
    width: 36px;
    height: 4px;
    background: var(--color-border);
    border-radius: 2px;
    margin: 0 auto var(--spacing-md);
  }

  .modal-title {
    margin: 0 0 var(--spacing-md);
    font-size: 18px;
    font-weight: 700;
    color: var(--color-text-primary);
  }
</style>
