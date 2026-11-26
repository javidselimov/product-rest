'use client'

/**
 * Şəkilli popup — admin paneldən idarə olunan elan şəkli (spec 009 US2/US3).
 *
 * Qayda canlı yayım popup-ı ilə eynidir (`shared/lib/popup-dismissal`): sessiyada
 * ilk açılan səhifədə çıxır, bağlananda popup üçün qeyd yazılır və sessiya boyu
 * bir daha avtomatik çıxmır (clarification 2026-10-22). Canlı yayım da varsa,
 * növbə onundur (Q2, FR-013): bu popup yalnız canlı yayım dialoqu açıq deyilsə
 * **və** bu sessiyada bağlanıbsa açılır.
 *
 * Görünüş nümunə ekran şəklinə uyğundur (R9): çərçivəsiz şəkil, küncdə dairəvi ×.
 * Şəkil yüklənməsə popup qeyd yazılmadan bağlanır — boş çərçivə göstərilmir.
 */
import { Dialog, DialogContent, DialogTitle } from '@cbar/lib-react-ui-kit/dialog'
import Link from 'next/link'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { isImagePopupDismissed, markImagePopupDismissed } from '@/features/image-popup/model/dismissal'
import type { ImagePopup } from '@/features/image-popup/model/image-popup'
import { useImagePopupStore } from '@/features/image-popup/model/store'
import { isDismissed as isLiveStreamDismissed } from '@/features/live-stream/model/dismissal'
import { useLiveStreamStore } from '@/features/live-stream/model/store'
import { mediaUrl } from '@/entities/content/lib/media-url'

const CONTENT_CLASS = [
  'p-0 gap-0 w-fit max-w-[calc(100%-2rem)] sm:max-w-[min(50vw,720px)] overflow-hidden rounded-lg border-0 bg-transparent shadow-xl',
  '[&_[data-slot=dialog-close]]:top-2 [&_[data-slot=dialog-close]]:right-2 [&_[data-slot=dialog-close]]:size-7',
  '[&_[data-slot=dialog-close]]:rounded-full [&_[data-slot=dialog-close]]:bg-background',
  '[&_[data-slot=dialog-close]]:opacity-100 [&_[data-slot=dialog-close]]:shadow',
].join(' ')

const isExternal = (link: string) => /^https?:\/\//i.test(link)

type ImagePopupDialogProps = {
  popup: ImagePopup | null
  /** Canlı yayım varsa onun id-si — növbə üçün (US3). */
  liveStreamId?: number
}

export function ImagePopupDialog({ popup, liveStreamId }: ImagePopupDialogProps) {
  const { t } = useTranslation('media')
  const open = useImagePopupStore((s) => s.open)
  const setOpen = useImagePopupStore((s) => s.setOpen)
  const liveOpen = useLiveStreamStore((s) => s.open)
  const popupId = popup?.id

  useEffect(() => {
    if (popupId === undefined || liveOpen) return
    if (liveStreamId !== undefined && !isLiveStreamDismissed(liveStreamId)) return
    if (!isImagePopupDismissed(popupId)) setOpen(true)
  }, [popupId, liveStreamId, liveOpen, setOpen])

  if (!popup) return null

  const src = mediaUrl(popup.imageUrl)
  if (!src) return null

  const current = popup

  function handleOpenChange(next: boolean) {
    if (!next) markImagePopupDismissed(current.id)
    setOpen(next)
  }

  function handleLinkClick() {
    markImagePopupDismissed(current.id)
    setOpen(false)
  }

  const image = (
    // eslint-disable-next-line @next/next/no-img-element -- ölçüsü bilinməyən CMS şəkli, next/image eni/hündürlüyü tələb edir
    <img
      src={src}
      alt={current.altText ?? ''}
      decoding="async"
      className="block h-auto max-h-[85vh] w-auto max-w-full"
      onError={() => setOpen(false)}
    />
  )

  const link = current.link
  const linkLabel = t('imagePopup.openLink')

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className={CONTENT_CLASS} aria-describedby={undefined} data-slot="image-popup-dialog">
        <DialogTitle className="sr-only">{current.altText ?? t('imagePopup.title')}</DialogTitle>
        {!link ? (
          image
        ) : isExternal(link) ? (
          <a href={link} target="_blank" rel="noopener noreferrer" aria-label={`${linkLabel} ${t('imagePopup.newTab')}`} onClick={handleLinkClick}>
            {image}
          </a>
        ) : (
          <Link href={link} aria-label={linkLabel} onClick={handleLinkClick}>
            {image}
          </Link>
        )}
      </DialogContent>
    </Dialog>
  )
}
