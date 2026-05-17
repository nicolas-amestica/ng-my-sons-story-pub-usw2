import { computed, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { STORAGE_KEYS } from '@shared/constants/storage-keys.constant';

type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
}

export const ThemeStore = signalStore(
  { providedIn: 'root' },
  withState<ThemeState>({ theme: 'light' }),
  withComputed(({ theme }) => ({
    isDark: computed(() => theme() === 'dark'),
    themeIcon: computed(() => theme() === 'dark' ? 'pi pi-sun' : 'pi pi-moon'),
    themeTooltip: computed(() => theme() === 'dark' ? 'Modo claro' : 'Modo oscuro'),
  })),
  withMethods((store) => {
    const doc = inject(DOCUMENT);
    const apply = (t: Theme) => {
      if (t === 'dark') doc.documentElement.classList.add('dark');
      else doc.documentElement.classList.remove('dark');
    };
    return {
      loadTheme(): void {
        const saved = (localStorage.getItem(STORAGE_KEYS.THEME) as Theme | null) ?? 'light';
        patchState(store, { theme: saved });
        apply(saved);
      },
      toggleTheme(): void {
        const next: Theme = store.theme() === 'light' ? 'dark' : 'light';
        patchState(store, { theme: next });
        apply(next);
        localStorage.setItem(STORAGE_KEYS.THEME, next);
      },
    };
  }),
);
