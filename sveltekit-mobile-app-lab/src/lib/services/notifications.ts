/**
 * notifications.ts — Capacitor LocalNotifications wrapper.
 *
 * Schedules and cancels due-date reminders for tasks.  All calls are
 * guarded with Capacitor.isNativePlatform() so the service is inert during
 * browser-based development and Vitest runs.
 *
 * Because @capacitor/local-notifications is not in package.json, the plugin
 * module is loaded via a dynamic import inside a try/catch block.
 */
import { Capacitor } from '@capacitor/core';
import { browser } from '$app/environment';

/**
 * Deterministically convert a UUID task-id string to a stable 32-bit integer
 * required by the LocalNotifications API.
 */
function taskIdToNotificationId(taskId: string): number {
  let hash = 0;

  for (const char of taskId) {
    hash = (hash << 5) - hash + char.charCodeAt(0);
    hash |= 0; // Truncate to 32-bit signed integer.
  }

  return Math.abs(hash);
}

/**
 * Schedule a local notification reminder for a task's due date.
 *
 * @param taskId  - Task identifier used to derive a stable notification id.
 * @param title   - Task title shown in the notification.
 * @param dueDate - ISO date string (YYYY-MM-DD) used to schedule the alert.
 */
export async function scheduleReminder(
  taskId: string,
  title: string,
  dueDate: string
): Promise<void> {
  if (!browser || !Capacitor.isNativePlatform()) return;

  try {
    // @vite-ignore tells rolldown not to resolve this specifier at build time.
    const { LocalNotifications } = await import(/* @vite-ignore */ '@capacitor/local-notifications');
    const id = taskIdToNotificationId(taskId);

    await LocalNotifications.requestPermissions();
    await LocalNotifications.schedule({
      notifications: [
        {
          id,
          title: `Task Due: ${title}`,
          body: `"${title}" is due today.`,
          schedule: { at: new Date(dueDate) },
          extra: { taskId }
        }
      ]
    });
  } catch {
    // Plugin unavailable or permission denied — skip silently.
  }
}

/**
 * Cancel a previously scheduled reminder for the given task.
 *
 * @param taskId - Task identifier whose notification should be cancelled.
 */
export async function cancelReminder(taskId: string): Promise<void> {
  if (!browser || !Capacitor.isNativePlatform()) return;

  try {
    // @vite-ignore tells rolldown not to resolve this specifier at build time.
    const { LocalNotifications } = await import(/* @vite-ignore */ '@capacitor/local-notifications');
    const id = taskIdToNotificationId(taskId);
    await LocalNotifications.cancel({ notifications: [{ id }] });
  } catch {
    // Plugin unavailable — skip silently.
  }
}
