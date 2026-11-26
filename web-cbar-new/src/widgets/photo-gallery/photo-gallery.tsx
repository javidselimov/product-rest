'use client'

/**
 * Photo gallery under a news item (spec 029 US3, contracts/ui-contract.md §3.1, Figma `1652:36210`).
 *
 * A large photo with a thumbnail strip between previous/next buttons. Selection moves by
 * clicking a thumbnail, by the arrow buttons (they stop at the ends, no wrap-around) and by
 * ←/→ while a thumbnail has focus. The position is announced through a polite live region.
 * The large photo links to the original file — there is no lightbox (research R7).
 *
 * Client component because the selected photo is state. Without JS the first photo and all
 * thumbnails still render; only switching needs JS.
 */
import { IconButton } from '@cbar/lib-react-ui-kit/icon-button'
import { CaretLeftIcon, CaretRightIcon } from '@cbar/lib-react-ui-kit/icons'
import { cn } from '@cbar/lib-react-ui-kit/lib'
import { useRef, useState, type KeyboardEvent } from 'react'

import { IMAGE_SIZES } from '@/shared/constants/layout'
import { SiteImage } from '@/shared/ui/site-image'

export type GalleryImage = { id: number; url: string; alt: string }

/** Translated on the server; `{{…}}` placeholders are filled here (functions cannot cross to the client). */
export type PhotoGalleryLabels = {
  label: string
  prev: string
  next: string
  /** `{{current}}`, `{{total}}` */
  position: string
  /** `{{n}}` */
  thumb: string
  open: string
}

const fill = (template: string, values: Record<string, number>) =>
  template.replace(/\{\{(\w+)\}\}/g, (match, key: string) => (key in values ? String(values[key]) : match))

const ARROW_CLASS = 'size-11 shrink-0 rounded-md border disabled:border-border enabled:border-primary'

export function PhotoGallery({ images, labels }: Readonly<{ images: GalleryImage[]; labels: PhotoGalleryLabels }>) {
  const [index, setIndex] = useState(0)
  const thumbs = useRef<(HTMLButtonElement | null)[]>([])
  const current = images[index]
  if (!current) return null

  const select = (next: number, focus = false) => {
    const target = Math.min(Math.max(next, 0), images.length - 1)
    setIndex(target)
    const button = thumbs.current[target]
    // jsdom has no scrollIntoView; browsers always do.
    button?.scrollIntoView?.({ inline: 'nearest', block: 'nearest' })
    if (focus) button?.focus()
  }

  const onStripKey = (event: KeyboardEvent) => {
    if (event.key === 'ArrowRight') select(index + 1, true)
    else if (event.key === 'ArrowLeft') select(index - 1, true)
    else return
    event.preventDefault()
  }

  return (
    <section aria-label={labels.label} data-slot="photo-gallery" className="flex flex-col gap-12">
      <a
        href={current.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={labels.open}
        className="bg-site-surface-muted relative block aspect-[984/601] w-full overflow-hidden"
      >
        <SiteImage src={current.url} alt={current.alt} fill sizes={IMAGE_SIZES.CONTENT_COLUMN} className="object-contain" />
      </a>

      {/* Neighbours are fetched ahead with the same `sizes`, so the next photo is already cached. */}
      {[images[index - 1], images[index + 1]].map((image) =>
        image ? (
          <span key={image.id} className="relative hidden">
            <SiteImage src={image.url} alt="" fill skeleton={false} loading="eager" sizes={IMAGE_SIZES.CONTENT_COLUMN} />
          </span>
        ) : null,
      )}

      <div className="flex items-center gap-4 tab:gap-10">
        <IconButton
          variant="outline"
          size="lg"
          className={ARROW_CLASS}
          aria-label={labels.prev}
          disabled={index === 0}
          onClick={() => select(index - 1)}
        >
          <CaretLeftIcon aria-hidden="true" />
        </IconButton>

        <ul className="flex min-w-0 flex-1 snap-x gap-6 overflow-x-auto" onKeyDown={onStripKey}>
          {images.map((image, i) => (
            <li key={image.id} className="shrink-0 snap-start">
              <button
                ref={(el) => {
                  thumbs.current[i] = el
                }}
                type="button"
                aria-label={fill(labels.thumb, { n: i + 1 })}
                aria-current={i === index ? 'true' : undefined}
                onClick={() => select(i)}
                className={cn(
                  'bg-site-image-placeholder relative block h-31 w-45 overflow-hidden',
                  'focus-visible:outline-ring focus-visible:outline-2 focus-visible:outline-offset-2',
                  // Selected frame is drawn by an ::after overlay: an inset ring on the button
                  // itself is a box-shadow painted under the absolutely positioned fill image, so
                  // it never shows. `inset-0` + `ring-inset` keeps the 180x124 box (INSIDE stroke
                  // as in Figma). Colour is `site-accent` (same teal as the active arrow) instead of
                  // Figma's #D4D4D4, which is invisible on the grey placeholder — accepted deviation.
                  i === index &&
                    'after:ring-site-accent after:pointer-events-none after:absolute after:inset-0 after:ring-2 after:ring-inset after:content-[""]',
                )}
              >
                <SiteImage src={image.url} alt="" fill sizes="180px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>

        <IconButton
          variant="outline"
          size="lg"
          className={ARROW_CLASS}
          aria-label={labels.next}
          disabled={index === images.length - 1}
          onClick={() => select(index + 1)}
        >
          <CaretRightIcon aria-hidden="true" />
        </IconButton>
      </div>

      <p role="status" aria-live="polite" className="sr-only">
        {fill(labels.position, { current: index + 1, total: images.length })}
      </p>
    </section>
  )
}
