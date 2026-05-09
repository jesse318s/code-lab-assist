<!--
  Settings — /settings
  Provides three actions:
    • Theme toggle  — light / dark mode via themeStore
    • Export tasks  — writes JSON to device cache then opens the OS share sheet
                      (desktop: triggers an anchor download)
    • Clear all     — wipes every task from the store after a confirmation prompt

  Svelte 5 runes:
    $state  — local UI state (export status message, clear confirm flag)
    $derived — current theme label derived reactively from the store
-->
<script lang="ts">
  import { taskStore } from '$lib/stores/taskStore';
  import { themeStore } from '$lib/stores/themeStore';
  import { exportTasksToFile } from '$lib/services/fileExport';

  // ── Local state ──────────────────────────────────────────────────────────
  let exportStatus = $state<'idle' | 'busy' | 'done' | 'cancelled'>('idle');
  let showClearConfirm = $state(false);

  // ── Derived ──────────────────────────────────────────────────────────────
  const isDark = $derived($themeStore === 'dark');

  // ── Handlers ─────────────────────────────────────────────────────────────
  function handleThemeToggle(): void {
    themeStore.toggle();
  }

  async function handleExport(): Promise<void> {
    exportStatus = 'busy';

    const json = JSON.stringify($taskStore, null, 2);
    const filename = `taskflow-export-${Date.now()}.json`;

    const saved = await exportTasksToFile(json, filename);

    exportStatus = saved ? 'done' : 'cancelled';

    // Reset status label after 2.5 s.
    setTimeout(() => { exportStatus = 'idle'; }, 2500);
  }

  function handleClearRequest(): void {
    showClearConfirm = true;
  }

  function handleClearConfirm(): void {
    taskStore.clear();
    showClearConfirm = false;
  }

  function handleClearCancel(): void {
    showClearConfirm = false;
  }
</script>

<svelte:head>
  <title>TaskFlow — Settings</title>
  <meta name="description" content="TaskFlow app settings" />
</svelte:head>

<div class="settings">
  <!-- ── Header ─────────────────────────────────────────────────────────── -->
  <header class="page-header">
    <h1 class="page-title">Settings</h1>
  </header>

  <!-- ── Appearance ─────────────────────────────────────────────────────── -->
  <section class="settings-section" aria-labelledby="appearance-heading">
    <h2 class="section-heading" id="appearance-heading">Appearance</h2>

    <div class="settings-card">
      <div class="setting-row">
        <div class="setting-info">
          <span class="setting-label">Dark Mode</span>
          <span class="setting-description">Switch between light and dark theme</span>
        </div>
        <!-- Toggle switch -->
        <button
          class="toggle-btn"
          class:on={isDark}
          type="button"
          role="switch"
          aria-checked={isDark}
          aria-label="Toggle dark mode"
          onclick={handleThemeToggle}
        >
          <span class="toggle-thumb"></span>
        </button>
      </div>
    </div>
  </section>

  <!-- ── Data ───────────────────────────────────────────────────────────── -->
  <section class="settings-section" aria-labelledby="data-heading">
    <h2 class="section-heading" id="data-heading">Data</h2>

    <div class="settings-card">
      <!-- Export -->
      <div class="setting-row">
        <div class="setting-info">
          <span class="setting-label">Export Tasks</span>
          <span class="setting-description">Save all tasks as JSON</span>
        </div>
        <button
          class="action-btn"
          type="button"
          disabled={exportStatus === 'busy'}
          onclick={handleExport}
        >
          {#if exportStatus === 'busy'}
            Exporting…
          {:else if exportStatus === 'done'}
            ✓ Saved
          {:else if exportStatus === 'cancelled'}
            Cancelled
          {:else}
            Export
          {/if}
        </button>
      </div>

      <div class="divider" aria-hidden="true"></div>

      <!-- Clear all -->
      <div class="setting-row">
        <div class="setting-info">
          <span class="setting-label">Clear All Tasks</span>
          <span class="setting-description">Permanently delete every task</span>
        </div>
        <button
          class="action-btn danger"
          type="button"
          onclick={handleClearRequest}
        >
          Clear
        </button>
      </div>
    </div>
  </section>
</div>

<!-- ── Clear-all confirmation sheet ─────────────────────────────────────── -->
{#if showClearConfirm}
  <div
    class="modal-backdrop"
    role="dialog"
    aria-modal="true"
    aria-labelledby="confirm-heading"
  >
    <div class="confirm-sheet">
      <h2 class="confirm-title" id="confirm-heading">Clear all tasks?</h2>
      <p class="confirm-body">This cannot be undone. All tasks will be permanently deleted.</p>
      <div class="confirm-actions">
        <button class="confirm-cancel" type="button" onclick={handleClearCancel}>
          Cancel
        </button>
        <button class="confirm-delete" type="button" onclick={handleClearConfirm}>
          Delete All
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .settings {
    padding: var(--spacing-lg) var(--spacing-md);
    max-width: 480px;
    margin: 0 auto;
  }

  /* ── Header ──────────────────────────────────────────────────────────── */
  .page-header {
    margin-bottom: var(--spacing-lg);
  }

  .page-title {
    margin: 0;
    font-size: 28px;
    font-weight: 800;
    color: var(--color-text-primary);
    letter-spacing: -0.5px;
  }

  /* ── Sections ────────────────────────────────────────────────────────── */
  .settings-section {
    margin-bottom: var(--spacing-lg);
  }

  .section-heading {
    margin: 0 0 var(--spacing-sm);
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--color-text-secondary);
  }

  /* ── Card ────────────────────────────────────────────────────────────── */
  .settings-card {
    background: var(--color-surface);
    border-radius: var(--border-radius-md);
    box-shadow: var(--shadow-sm);
    overflow: hidden;
  }

  .setting-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--spacing-md);
    padding: var(--spacing-md);
    min-height: 56px;
  }

  .setting-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex: 1;
  }

  .setting-label {
    font-size: 16px;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  .setting-description {
    font-size: 13px;
    color: var(--color-text-secondary);
  }

  .divider {
    height: 1px;
    background: var(--color-border);
    margin: 0 var(--spacing-md);
  }

  /* ── Toggle switch ───────────────────────────────────────────────────── */
  .toggle-btn {
    position: relative;
    width: 48px;
    height: 28px;
    border-radius: 14px;
    border: none;
    background: var(--color-border);
    cursor: pointer;
    flex-shrink: 0;
    touch-action: manipulation;
    transition: background 0.2s;
  }

  .toggle-btn.on {
    background: var(--color-primary);
  }

  .toggle-thumb {
    position: absolute;
    top: 3px;
    left: 3px;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
    transition: transform 0.2s;
  }

  .toggle-btn.on .toggle-thumb {
    transform: translateX(20px);
  }

  /* ── Action buttons ──────────────────────────────────────────────────── */
  .action-btn {
    padding: 8px 18px;
    border-radius: var(--border-radius-sm);
    border: none;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    touch-action: manipulation;
    background: var(--color-primary);
    color: #fff;
    min-height: 44px;
    min-width: 80px;
    transition: opacity 0.15s;
  }

  .action-btn:disabled {
    opacity: 0.55;
    cursor: default;
  }

  .action-btn.danger {
    background: var(--color-priority-high);
  }

  /* ── Confirmation sheet ──────────────────────────────────────────────── */
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 200;
    display: flex;
    align-items: flex-end;
  }

  .confirm-sheet {
    width: 100%;
    background: var(--color-surface);
    border-radius: var(--border-radius-lg) var(--border-radius-lg) 0 0;
    padding: var(--spacing-lg) var(--spacing-lg)
      calc(var(--spacing-xl) + env(safe-area-inset-bottom, 0px));
  }

  .confirm-title {
    margin: 0 0 var(--spacing-sm);
    font-size: 18px;
    font-weight: 700;
    color: var(--color-text-primary);
  }

  .confirm-body {
    margin: 0 0 var(--spacing-lg);
    font-size: 14px;
    color: var(--color-text-secondary);
  }

  .confirm-actions {
    display: flex;
    gap: var(--spacing-sm);
  }

  .confirm-cancel,
  .confirm-delete {
    flex: 1;
    padding: 14px;
    border-radius: var(--border-radius-sm);
    border: none;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    touch-action: manipulation;
    min-height: 44px;
  }

  .confirm-cancel {
    background: var(--color-border);
    color: var(--color-text-primary);
  }

  .confirm-delete {
    background: var(--color-priority-high);
    color: #fff;
  }
</style>
