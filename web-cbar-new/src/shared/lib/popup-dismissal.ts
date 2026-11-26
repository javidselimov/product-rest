/**
 * "Popup bağlandı" qeydi — `sessionStorage` (spec 006 FR-005, D-1;
 * spec 009 şəkilli popup eyni qaydanı işlədir; clarification 2026-10-22).
 *
 * Açar yalnız popup-a bağlıdır (səhifəyə yox):
 * - popup sessiyada ilk açılan səhifədə avtomatik çıxır;
 * - bağlanandan sonra həmin sessiyada heç bir səhifədə avtomatik çıxmır
 *   (canlı yayımı header düyməsi qeydə baxmadan yenə açır);
 * - yeni popup (başqa `id`) yenidən çıxır;
 * - yeni tab / yeni sessiya — storage boşdur, popup çıxır.
 *
 * Hər popup növü öz prefiksini alır, ona görə canlı yayımı bağlamaq şəkilli
 * popup-ı bağlamış saymır. Saxlanan dəyər həssas deyil (yalnız `'1'`) —
 * Maddə X.3 pozulmur. Storage əlçatan olmasa (SSR, private mode, bloklanmış
 * storage) xəta atılmır: popup sadəcə yadda saxlanmadan işləyir.
 */

function storage(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.sessionStorage
  } catch {
    return null
  }
}

export type PopupDismissal = {
  key: (id: number) => string
  isDismissed: (id: number) => boolean
  markDismissed: (id: number) => void
}

export function createPopupDismissal(prefix: string): PopupDismissal {
  const key = (id: number) => `${prefix}:${id}`

  return {
    key,
    isDismissed(id) {
      try {
        return storage()?.getItem(key(id)) === '1'
      } catch {
        return false
      }
    },
    markDismissed(id) {
      try {
        storage()?.setItem(key(id), '1')
      } catch {
        // Kvota və ya bloklanmış storage — qeyd itir, popup növbəti dəfə yenə çıxar.
      }
    },
  }
}
