'use client'

/**
 * Canlı yayım popup-ı — YouTube pleyeri (spec 006 US2, FR-005/FR-006).
 *
 * Qayda: sessiyada ilk açılan səhifədə popup çıxır; bağlananda `sessionStorage`-ə
 * həmin yayım üçün qeyd yazılır — sessiya boyu heç bir səhifədə avtomatik
 * çıxmır, yalnız header düyməsi açır; yeni yayım (başqa id) yenidən çıxır
 * (clarification 2026-10-22). Yoxlama `useEffect`-dədir (Maddə XI.4 — `window`
 * yalnız effect-də oxunur; SSR-də dialoq həmişə bağlı render olunur).
 *
 * `iframe` yalnız dialoq açıq olanda mövcuddur (Radix bağlıyken məzmunu
 * unmount edir) — bağlananda video dayanır. Autoplay yoxdur: video yalnız
 * ziyarətçi pleyerdə play-ə basanda başlayır (istifadəçi qərarı, 2026-09-25).
 */
import { Badge } from '@cbar/lib-react-ui-kit/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@cbar/lib-react-ui-kit/dialog'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { isDismissed, markDismissed } from '@/features/live-stream/model/dismissal'
import { useLiveStreamStore } from '@/features/live-stream/model/store'
import type { LiveStream } from '@/features/media/model/live-stream'

export function LiveStreamDialog({ stream }: { stream: LiveStream | null }) {
  const { t } = useTranslation('media')
  const open = useLiveStreamStore((s) => s.open)
  const setOpen = useLiveStreamStore((s) => s.setOpen)
  const streamId = stream?.id

  useEffect(() => {
    if (streamId !== undefined && !isDismissed(streamId)) setOpen(true)
  }, [streamId, setOpen])

  if (!stream) return null

  const title = stream.title ?? t('streams')

  function handleOpenChange(next: boolean) {
    if (!next && stream) markDismissed(stream.id)
    setOpen(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-4xl" aria-describedby={undefined} data-slot="live-stream-dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 pr-8">
            <Badge variant="solid" colorPalette="red" size="sm">
              {t('live')}
            </Badge>
            <span className="line-clamp-2">{title}</span>
          </DialogTitle>
        </DialogHeader>
        <div className="bg-muted aspect-video w-full overflow-hidden rounded-md">
          <iframe
            src={stream.embedUrl}
            title={t('videoFrameTitle', { title })}
            className="size-full border-0"
            allow="encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
