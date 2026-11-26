/**
 * Media faylının kiçik önizləməsi (spec 010, contracts/ui.md §1). Şəkil admin
 * API-dən blob kimi gəlir; mime məlumdursa və şəkil deyilsə sorğu getmir, ikon
 * göstərilir. Xəta formanı bloklamır — yer tutucu ikonu (FR-011).
 */

import { ImageIcon } from '@cbar/lib-react-ui-kit/icons'
import { cn } from '@cbar/lib-react-ui-kit/lib'
import { Skeleton } from '@cbar/lib-react-ui-kit/skeleton'
import { createElement } from 'react'
import { useTranslation } from 'react-i18next'

import { iconForMime, isImageMime } from '@/entities/media/model/types'
import { useInView } from '../hooks/use-in-view'
import { useMediaPreview } from '../hooks/use-media-preview'
import { PREVIEW_ICON_SIZE } from '../model/constants'
import { MediaLightbox } from './media-lightbox'
import { PreviewImage } from './preview-image'

const BOX_SIZE = { sm: 'size-12', md: 'size-24' } as const

interface MediaPreviewProps {
  /** `null` — heç nə render olunmur. */
  mediaId: number | null
  /** `alt` mətni; yoxdursa `#id`. */
  name?: string | null
  /** Məlumdursa və şəkil deyilsə, sorğu göndərilmir. */
  mimeType?: string | null
  size?: 'sm' | 'md'
  /** Klik böyüdülmüş önizləməni açır. Seçici kartında `false` — klik seçimdir. */
  zoomable?: boolean
}

export function MediaPreview({
  mediaId,
  name,
  mimeType,
  size = 'md',
  zoomable = true,
}: MediaPreviewProps) {
  const { t } = useTranslation('media')
  const [ref, inView] = useInView<HTMLSpanElement>()
  const knownNotImage = Boolean(mimeType) && !isImageMime(mimeType)
  const preview = useMediaPreview(mediaId, inView && !knownNotImage)

  if (mediaId === null) return null

  const label = name || `#${mediaId}`
  const result = preview.data
  const boxClass = cn(
    'border-border bg-muted text-muted-foreground grid shrink-0 place-items-center overflow-hidden rounded-md border',
    BOX_SIZE[size],
  )

  if (knownNotImage || result?.kind === 'notImage') {
    return (
      <span ref={ref} className={boxClass} data-slot="media-preview">
        {/* Modul səviyyəli sabit ikon seçilir — render-də yeni komponent yaranmır. */}
        {createElement(iconForMime(mimeType), {
          size: PREVIEW_ICON_SIZE[size],
          'aria-hidden': true,
        })}
      </span>
    )
  }

  if (result?.kind === 'unavailable' || preview.isError) {
    return (
      <span
        ref={ref}
        className={boxClass}
        data-slot="media-preview"
        role="img"
        aria-label={t('preview.unavailable')}
        title={t('preview.unavailable')}
      >
        <ImageIcon size={PREVIEW_ICON_SIZE[size]} aria-hidden />
      </span>
    )
  }

  if (result?.kind === 'image') {
    const image = (
      <PreviewImage
        blob={result.blob}
        alt={label}
        className="size-full object-contain"
      />
    )
    if (!zoomable) {
      return (
        <span ref={ref} className={boxClass} data-slot="media-preview">
          {image}
        </span>
      )
    }
    return (
      <span ref={ref} className="inline-flex shrink-0" data-slot="media-preview">
        <MediaLightbox blob={result.blob} name={label}>
          <button
            type="button"
            className={cn(
              boxClass,
              'hover:border-ring focus-visible:outline-ring cursor-zoom-in transition-colors focus-visible:outline-2 focus-visible:outline-offset-2',
            )}
            aria-label={t('preview.open', { name: label })}
          >
            {image}
          </button>
        </MediaLightbox>
      </span>
    )
  }

  return (
    <span
      ref={ref}
      className={boxClass}
      data-slot="media-preview"
      aria-busy={preview.isFetching}
    >
      <Skeleton className="size-full rounded-none" aria-hidden />
      {preview.isFetching ? (
        <span className="sr-only">{t('preview.loading')}</span>
      ) : null}
    </span>
  )
}
