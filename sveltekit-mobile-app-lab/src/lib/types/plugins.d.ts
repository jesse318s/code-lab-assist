/**
 * Ambient type declarations for optional Capacitor plugins that are not
 * listed in package.json.  These declarations satisfy the TypeScript
 * compiler so that dynamic `import('@capacitor/haptics')` calls type-check
 * correctly.  At runtime the native bridge provides the implementations;
 * on the web they are silently skipped behind Capacitor.isNativePlatform().
 */

declare module '@capacitor/haptics' {
  export const ImpactStyle: {
    readonly Heavy: 'HEAVY';
    readonly Medium: 'MEDIUM';
    readonly Light: 'LIGHT';
  };

  export const Haptics: {
    impact(options: { style: 'HEAVY' | 'MEDIUM' | 'LIGHT' }): Promise<void>;
    vibrate(options?: { duration: number }): Promise<void>;
    selectionStart(): Promise<void>;
    selectionChanged(): Promise<void>;
    selectionEnd(): Promise<void>;
  };
}

declare module '@capacitor/local-notifications' {
  export interface LocalNotification {
    id: number;
    title: string;
    body: string;
    schedule?: { at: Date };
    extra?: Record<string, string>;
  }

  export interface PermissionStatus {
    display: 'granted' | 'denied' | 'prompt' | 'prompt-with-rationale';
  }

  export interface LocalNotificationsPlugin {
    requestPermissions(): Promise<PermissionStatus>;
    schedule(options: { notifications: LocalNotification[] }): Promise<void>;
    cancel(options: { notifications: Array<{ id: number }> }): Promise<void>;
  }

  export const LocalNotifications: LocalNotificationsPlugin;
}
