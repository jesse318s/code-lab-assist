/**
 * haptics.ts — Capacitor Haptics wrapper.
 *
 * All haptic calls in the app must go through this helper so that:
 *  1. Components never import Capacitor plugins directly.
 *  2. The call is silently skipped in the browser / test environment where
 *     the native bridge is unavailable (Capacitor.isNativePlatform() guard).
 *  3. A missing @capacitor/haptics package (not listed in package.json) is
 *     handled gracefully via dynamic import + try/catch.
 */
import { Capacitor } from '@capacitor/core';
import { browser } from '$app/environment';

export type HapticStyle = 'light' | 'medium' | 'heavy';

/**
 * Trigger a haptic impact on native platforms.
 *
 * @param style - 'light' for subtle feedback, 'medium' for standard actions,
 *                'heavy' for destructive actions such as delete.
 */
export async function triggerHaptic(style: HapticStyle = 'medium'): Promise<void> {
  // Only run in a real browser context on a native device.
  if (!browser || !Capacitor.isNativePlatform()) return;

  try {
    // Dynamic import keeps the build from failing when the plugin is absent.
    // @vite-ignore tells rolldown not to resolve this specifier at build time.
    const { Haptics, ImpactStyle } = await import(/* @vite-ignore */ '@capacitor/haptics');

    const styleMap = {
      light: ImpactStyle.Light,
      medium: ImpactStyle.Medium,
      heavy: ImpactStyle.Heavy
    } as const;

    await Haptics.impact({ style: styleMap[style] });
  } catch {
    // Plugin not installed or native bridge not ready — skip silently.
  }
}
