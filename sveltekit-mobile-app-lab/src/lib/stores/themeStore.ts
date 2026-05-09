/**
 * themeStore — lightweight writable that tracks the active UI theme.
 *
 * Persists the chosen theme to localStorage and synchronises
 * document.documentElement.dataset.theme so the CSS [data-theme='dark']
 * selector in the root layout applies the correct design tokens.
 */
import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type Theme = 'light' | 'dark';

const THEME_KEY = 'taskflow-theme';

function createThemeStore() {
  const initial: Theme = browser
    ? ((localStorage.getItem(THEME_KEY) as Theme | null) ?? 'light')
    : 'light';

  const { subscribe, set, update } = writable<Theme>(initial);

  return {
    subscribe,

    /** Apply and persist a specific theme. */
    setTheme(theme: Theme): void {
      set(theme);
      if (browser) {
        localStorage.setItem(THEME_KEY, theme);
        document.documentElement.dataset.theme = theme === 'dark' ? 'dark' : '';
      }
    },

    /** Toggle between light and dark. */
    toggle(): void {
      update((current) => {
        const next: Theme = current === 'dark' ? 'light' : 'dark';
        if (browser) {
          localStorage.setItem(THEME_KEY, next);
          document.documentElement.dataset.theme = next === 'dark' ? 'dark' : '';
        }
        return next;
      });
    }
  };
}

export const themeStore = createThemeStore();
