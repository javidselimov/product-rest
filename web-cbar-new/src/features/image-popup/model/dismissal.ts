/**
 * Şəkilli popup-ın "bu sessiyada bağlandı" qeydi (spec 009 FR-011) — canlı
 * yayımla eyni qayda, öz prefiksi ilə (`shared/lib/popup-dismissal`).
 */
import { createPopupDismissal } from '@/shared/lib/popup-dismissal'

const dismissal = createPopupDismissal('cbar:image-popup:dismissed')

export function imagePopupDismissalKey(popupId: number): string {
  return dismissal.key(popupId)
}

export function isImagePopupDismissed(popupId: number): boolean {
  return dismissal.isDismissed(popupId)
}

export function markImagePopupDismissed(popupId: number): void {
  dismissal.markDismissed(popupId)
}
