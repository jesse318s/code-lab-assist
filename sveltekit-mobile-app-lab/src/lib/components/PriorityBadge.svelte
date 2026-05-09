<!--
  PriorityBadge.svelte
  Reusable pill badge that maps a Priority value to a colour-coded label.
  No dependencies — build this component first.
  Props: priority ('low' | 'medium' | 'high')
-->
<script lang="ts">
  import type { Priority } from '$lib/types';

  interface Props {
    priority: Priority;
  }

  const { priority }: Props = $props();

  // Map each priority to a small directional icon for quick visual scanning.
  const icons: Record<Priority, string> = {
    high: '▲',
    medium: '●',
    low: '▼'
  };
</script>

<span class="priority-badge {priority}" aria-label="{priority} priority">
  <span class="icon" aria-hidden="true">{icons[priority]}</span>
  {priority}
</span>

<style>
  .priority-badge {
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-xs);
    padding: 2px var(--spacing-sm);
    border-radius: var(--border-radius-sm);
    font-size: 11px;
    font-weight: 600;
    text-transform: capitalize;
    letter-spacing: 0.03em;
    white-space: nowrap;
    line-height: 1.6;
  }

  .icon {
    font-size: 9px;
    line-height: 1;
  }

  .high {
    background: var(--color-priority-high-bg);
    color: var(--color-priority-high);
  }

  .medium {
    background: var(--color-priority-medium-bg);
    color: var(--color-priority-medium);
  }

  .low {
    background: var(--color-priority-low-bg);
    color: var(--color-priority-low);
  }
</style>
