/**
 * Şəkilli popup dialoqunun açıq/bağlı vəziyyəti — Zustand (Maddə VIII.6),
 * `features/live-stream/model/store.ts` ilə eyni quruluş.
 *
 * Server heç vaxt `setOpen` çağırmır — modul səviyyəli store SSR-də həmişə
 * `open: false` qalır, sorğular arasında state sızmır.
 */
import { create } from 'zustand'

type ImagePopupState = {
  open: boolean
  setOpen: (open: boolean) => void
}

export const useImagePopupStore = create<ImagePopupState>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
}))
