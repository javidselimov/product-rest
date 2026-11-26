/**
 * Shared UI state (guideline §6.4: only real shared app state).
 * Dark mode is class-driven and `.dark` goes ONLY on `<html>` — portalled
 * components (Dialog, Toaster, …) render into `document.body`, a scoped
 * wrapper would keep them light. The language choice lives in the i18next
 * detector's own localStorage cache (`shared/i18n`), not here.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { UI_STORE_KEY } from '@/shared/constants/storage'

export type Theme = 'light' | 'dark'

const systemTheme = (): Theme =>
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'

const applyTheme = (theme: Theme) => {
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

interface UiState {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  /**
   * Sidebar groups the editor opened (spec 046). Plain keys: the group list lives in `app/routes/nav`,
   * which filters out keys that no longer exist. A state saved before spec 046 has no such field and
   * gets the empty default from the persist merge.
   */
  openNavGroups: string[]
  toggleNavGroup: (group: string) => void
  openNavGroup: (group: string) => void
  /**
   * The menu item to mark instead of the one the route matches (spec 053): a page form whose content comes from a
   * panel section of its own marks that section. The slug is known only after the page loads, so the route alone
   * cannot say it. Session state: never persisted, cleared when the form unmounts.
   */
  activeNavOverride: string | null
  setActiveNavOverride: (key: string) => void
  clearActiveNavOverride: () => void
}

export const useUiStore = create<UiState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      setTheme: (theme) => {
        applyTheme(theme)
        set({ theme })
      },
      toggleTheme: () => {
        get().setTheme(get().theme === 'dark' ? 'light' : 'dark')
      },
      openNavGroups: [],
      toggleNavGroup: (group) => {
        const open = get().openNavGroups
        set({
          openNavGroups: open.includes(group)
            ? open.filter((key) => key !== group)
            : [...open, group],
        })
      },
      openNavGroup: (group) => {
        const open = get().openNavGroups
        if (!open.includes(group)) set({ openNavGroups: [...open, group] })
      },
      activeNavOverride: null,
      setActiveNavOverride: (key) => set({ activeNavOverride: key }),
      clearActiveNavOverride: () => set({ activeNavOverride: null }),
    }),
    {
      name: UI_STORE_KEY,
      // Only the editor's choices outlive a reload; the menu mark belongs to the screen that set it.
      partialize: ({ theme, openNavGroups }) => ({ theme, openNavGroups }),
      onRehydrateStorage: () => (state, error) => {
        // No saved choice falls back to the system preference; apply the class either way.
        if (error || !state) return
        applyTheme(state.theme)
      },
    },
  ),
)

/** Once at bootstrap: without a saved choice the system preference is applied. */
export function initTheme(): void {
  const persisted = localStorage.getItem(UI_STORE_KEY)
  if (!persisted) {
    useUiStore.getState().setTheme(systemTheme())
  } else {
    applyTheme(useUiStore.getState().theme)
  }
}
