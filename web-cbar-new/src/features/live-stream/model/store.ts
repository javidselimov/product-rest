/**
 * Canlı yayım dialoqunun açıq/bağlı vəziyyəti — Zustand (Maddə VIII.6).
 *
 * Header düyməsi və layout-dakı dialoq ayrı client komponentləridir; state
 * burada paylaşılır. Server heç vaxt `setOpen` çağırmır — modul səviyyəli store
 * SSR-də həmişə `open: false` qalır, sorğular arasında state sızmır.
 */
import { create } from 'zustand'

type LiveStreamState = {
  open: boolean
  setOpen: (open: boolean) => void
}

export const useLiveStreamStore = create<LiveStreamState>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
}))
