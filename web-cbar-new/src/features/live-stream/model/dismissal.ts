/**
 * Canlı yayım popup-ının "bu sessiyada bağlandı" qeydi (spec 006 FR-005, D-1).
 * Qayda və storage xətalarına dözümlülük `shared/lib/popup-dismissal`-dadır —
 * şəkilli popup (spec 009) eyni modulu öz prefiksi ilə işlədir.
 */
import { createPopupDismissal } from '@/shared/lib/popup-dismissal'

const dismissal = createPopupDismissal('cbar:live-stream:dismissed')

export function dismissalKey(streamId: number): string {
  return dismissal.key(streamId)
}

export function isDismissed(streamId: number): boolean {
  return dismissal.isDismissed(streamId)
}

export function markDismissed(streamId: number): void {
  dismissal.markDismissed(streamId)
}
