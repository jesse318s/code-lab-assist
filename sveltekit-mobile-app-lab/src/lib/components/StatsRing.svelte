<!--
  StatsRing.svelte
  SVG circular progress ring showing task completion percentage.

  The ring is drawn with two concentric <circle> elements:
    - track  : static background ring (uses --color-border)
    - progress: animated arc driven by stroke-dashoffset

  Circumference = 2π × r = 2π × 50 ≈ 314.16 px
  strokeDashoffset = circumference × (1 − percentage/100)
    → 0 % → full offset (invisible arc)
    → 100 % → zero offset (full circle)

  Props:
    total     (number) — total task count
    completed (number) — completed task count
-->
<script lang="ts">
  interface Props {
    total: number;
    completed: number;
  }

  const { total, completed }: Props = $props();

  const R = 50;
  const CIRCUMFERENCE = 2 * Math.PI * R; // ≈ 314.16

  // Clamp to [0, 100] and round to nearest integer for the label.
  const percentage = $derived(
    total === 0 ? 0 : Math.min(100, Math.round((completed / total) * 100))
  );

  // Offset drives the animated arc: 0 = full ring, CIRCUMFERENCE = empty ring.
  const dashOffset = $derived(CIRCUMFERENCE * (1 - percentage / 100));
</script>

<svg
  class="stats-ring"
  viewBox="0 0 120 120"
  role="img"
  aria-label="{completed} of {total} tasks completed"
>
  <!-- Background track -->
  <circle
    cx="60"
    cy="60"
    r={R}
    fill="none"
    stroke="var(--color-border)"
    stroke-width="10"
  />

  <!-- Animated progress arc — rotated so 0 % starts at 12 o'clock -->
  <circle
    class="progress-arc"
    cx="60"
    cy="60"
    r={R}
    fill="none"
    stroke="var(--color-primary)"
    stroke-width="10"
    stroke-linecap="round"
    stroke-dasharray={CIRCUMFERENCE}
    stroke-dashoffset={dashOffset}
    transform="rotate(-90 60 60)"
  />

  <!-- Centre labels -->
  <text x="60" y="53" class="pct-text" text-anchor="middle" dominant-baseline="middle">
    {percentage}%
  </text>

  <text x="60" y="72" class="label-text" text-anchor="middle">
    {completed}/{total}
  </text>
</svg>

<style>
  .stats-ring {
    width: 160px;
    height: 160px;
    flex-shrink: 0;
  }

  /* CSS transition animates the arc whenever dashOffset changes. */
  .progress-arc {
    transition: stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .pct-text {
    fill: var(--color-text-primary);
    font-size: 22px;
    font-weight: 700;
  }

  .label-text {
    fill: var(--color-text-secondary);
    font-size: 13px;
    font-weight: 500;
  }
</style>
