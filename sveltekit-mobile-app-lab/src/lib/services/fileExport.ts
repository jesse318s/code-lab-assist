/**
 * fileExport.ts
 *
 * Handles writing the tasks JSON to the device and presenting it to the user.
 *
 * Native (Android / iOS — Capacitor):
 *   1. Writes the file to the app's Cache directory via @capacitor/filesystem.
 *      (No extra manifest permissions required for the Cache directory.)
 *   2. Opens the OS share sheet via @capacitor/share so the user can send the
 *      file to Files, Google Drive, email, etc.
 *   3. Cleans up the temp cache file whether the share succeeds or is cancelled.
 *
 * Web (desktop browser):
 *   Falls back to an anchor-download using a Blob object URL.
 *
 * Returns true  → export completed (user acted on share sheet, or desktop download fired).
 * Returns false → user dismissed the share sheet without saving.
 */

import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

export async function exportTasksToFile(
  json: string,
  filename: string
): Promise<boolean> {
  if (Capacitor.isNativePlatform()) {
    // Write JSON to the app's private cache directory.
    // No READ_EXTERNAL_STORAGE / WRITE_EXTERNAL_STORAGE permissions needed.
    const { uri } = await Filesystem.writeFile({
      path: filename,
      data: json,
      directory: Directory.Cache,
      encoding: Encoding.UTF8,
    });

    try {
      // Open the native share sheet pointing at the cache file URI.
      await Share.share({
        title: 'TaskFlow Export',
        url: uri,
        dialogTitle: 'Save your TaskFlow backup',
      });
    } catch {
      // User dismissed the share sheet — treat as a cancellation.
      await Filesystem.deleteFile({
        path: filename,
        directory: Directory.Cache,
      }).catch(() => {
        // Ignore cleanup errors.
      });
      return false;
    }

    // Clean up the temp file now that the share has been handled.
    await Filesystem.deleteFile({
      path: filename,
      directory: Directory.Cache,
    }).catch(() => {
      // Ignore cleanup errors.
    });

    return true;
  }

  // Desktop browser fallback: create a Blob URL and click a hidden anchor.
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);

  return true;
}
