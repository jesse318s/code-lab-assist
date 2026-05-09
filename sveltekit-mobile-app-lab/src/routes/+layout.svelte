<!--
  Root layout — TaskFlow
  Wraps every page in the app shell with:
    • A scrollable <main> content area padded to avoid the fixed BottomNav.
    • The BottomNav component pinned to the viewport bottom.
    • All CSS design tokens as custom properties on :root.
    • A [data-theme='dark'] override block for dark mode.

  Svelte 5: children is accessed via $props() and rendered with {@render}.
  The themeStore $effect applies the saved theme on first mount.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import BottomNav from '$lib/components/BottomNav.svelte';
  import { themeStore } from '$lib/stores/themeStore';
  import { browser } from '$app/environment';

  interface Props {
    children: Snippet;
  }

  const { children }: Props = $props();

  // Apply the persisted theme to the document root on hydration.
  $effect(() => {
    if (browser) {
      document.documentElement.dataset.theme =
        $themeStore === 'dark' ? 'dark' : '';
    }
  });
</script>

<div class="app-shell">
  <main class="app-content">
    {@render children()}
  </main>
  <BottomNav />
</div>

<style>
  /* ================================================================
     Global resets
     ================================================================ */
  :global(*),
  :global(*::before),
  :global(*::after) {
    box-sizing: border-box;
  }

  :global(html, body) {
    margin: 0;
    padding: 0;
    height: 100%;
    font-family: var(--font-family);
    background: var(--color-background);
    color: var(--color-text-primary);
    /* Prevent pull-to-refresh & elastic bounce on mobile. */
    overscroll-behavior: none;
    -webkit-text-size-adjust: 100%;
  }

  /* Eliminate the 300 ms tap delay across all interactive elements. */
  :global(button),
  :global(a),
  :global(input),
  :global(label) {
    touch-action: manipulation;
  }

  /* ================================================================
     Design tokens — light theme (default)
     ================================================================ */
  :global(:root) {
    /* Surfaces */
    --color-background: #f0f2f5;
    --color-surface: #ffffff;

    /* Brand */
    --color-primary: #6366f1;
    --color-primary-dark: #4f46e5;

    /* Text */
    --color-text-primary: #111827;
    --color-text-secondary: #6b7280;

    /* Borders */
    --color-border: #e5e7eb;

    /* Priority colours */
    --color-priority-high: #ef4444;
    --color-priority-high-bg: rgba(239, 68, 68, 0.12);
    --color-priority-medium: #f59e0b;
    --color-priority-medium-bg: rgba(245, 158, 11, 0.12);
    --color-priority-low: #10b981;
    --color-priority-low-bg: rgba(16, 185, 129, 0.12);

    /* Bottom navigation */
    --color-nav-bg: #ffffff;
    --color-nav-active: #6366f1;
    --color-nav-inactive: #9ca3af;

    /* Spacing scale */
    --spacing-xs: 4px;
    --spacing-sm: 8px;
    --spacing-md: 16px;
    --spacing-lg: 24px;
    --spacing-xl: 32px;

    /* Border radii */
    --border-radius-sm: 8px;
    --border-radius-md: 12px;
    --border-radius-lg: 20px;

    /* Elevation */
    --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.08);
    --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
    --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.1);

    /* Layout */
    --nav-height: 64px;
    --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
      sans-serif;
  }

  /* ================================================================
     Dark theme token overrides
     Activated by: document.documentElement.dataset.theme = 'dark'
     ================================================================ */
  :global([data-theme='dark']) {
    --color-background: #0f172a;
    --color-surface: #1e293b;
    --color-primary: #818cf8;
    --color-primary-dark: #6366f1;
    --color-text-primary: #f1f5f9;
    --color-text-secondary: #94a3b8;
    --color-border: #334155;
    --color-nav-bg: #1e293b;
    --color-nav-active: #818cf8;
    --color-nav-inactive: #64748b;
    --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.3);
    --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.3);
    --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.4);
  }

  /* ================================================================
     App shell
     ================================================================ */
  .app-shell {
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
    background: var(--color-background);
  }

  .app-content {
    flex: 1;
    overflow-y: auto;
    /* Pad below the fixed nav bar + iOS safe area. */
    padding-bottom: calc(var(--nav-height) + env(safe-area-inset-bottom, 0px));
    -webkit-overflow-scrolling: touch;
  }
</style>
