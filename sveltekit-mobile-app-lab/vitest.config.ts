/**
 * vitest.config.ts
 * Separate Vitest configuration so we can add the `browser` resolve condition
 * without touching vite.config.js.
 *
 * Problem: Vitest runs in Node.js, which resolves the `svelte` package with
 * the `node` export condition → `svelte/src/index-server.js`.  Calling
 * `mount()` from the server build throws `lifecycle_function_unavailable`.
 *
 * Fix: Add `resolve.conditions = ['browser']` so Vite/Vitest picks
 * `svelte/src/index-client.js` instead.  The sveltekit() plugin still runs to
 * handle $lib/ aliases and .svelte file transforms.
 */
import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
  plugins: [sveltekit()],

  resolve: {
    conditions: ['browser']
  },

  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
    exclude: ['**/node_modules/**', '**/*.spec.{ts,js}']
  }
});
