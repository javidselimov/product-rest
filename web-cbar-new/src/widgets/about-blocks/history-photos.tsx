/**
 * Event photos in four layouts (spec 026 FR-004, ui-contract §2 "Photo"; ratios from `tarix.html`).
 *
 * Each photo links to the full-size image: without JS it opens in a new tab, with JS `HistoryStepper`
 * catches the `data-zoom` link and opens a lightbox (research R8).
 */
import type { AboutImage, PhotoLayout } from '@/features/about-content/model/types'
import { IMAGE_SIZES } from '@/shared/constants/layout'
import { SiteImage } from '@/shared/ui/site-image'

/** Grid and the ratio of each slot; `i` is the position of the photo. */
const LAYOUTS: Record<PhotoLayout, { grid: string; cell: (i: number) => string }> = {
  single: { grid: '', cell: () => 'aspect-[450/361]' },
  note: { grid: 'grid-cols-[75fr_429fr]', cell: () => 'h-full min-h-0 aspect-auto' },
  hero2: { grid: 'grid-cols-2', cell: (i) => (i === 0 ? 'col-span-2 aspect-[478/313]' : 'aspect-[235/160]') },
  tall: { grid: 'grid-cols-[191fr_279fr] grid-rows-2 aspect-[478/376]', cell: (i) => (i === 0 ? 'row-span-2' : '') },
}

type HistoryPhotosProps = Readonly<{
  images: AboutImage[]
  layout: PhotoLayout
  zoomLabel: (alt: string) => string
}>

export function HistoryPhotos({ images, layout, zoomLabel }: HistoryPhotosProps) {
  const { grid, cell } = LAYOUTS[layout]
  return (
    <div
      data-slot="history-photos"
      data-layout={layout}
      // `note`: both photos are the same height (prototype: both at ratio 184).
      className={`grid gap-2 ${grid} ${layout === 'note' ? 'aspect-[504/184]' : ''}`}
    >
      {images.map((image, i) => (
        <a
          key={`${image.src}-${i}`}
          href={image.src}
          target="_blank"
          rel="noopener noreferrer"
          data-zoom=""
          aria-label={zoomLabel(image.alt)}
          className={`bg-site-history-photo relative block cursor-zoom-in overflow-hidden rounded-xs focus-visible:ring-site-history-accent focus-visible:ring-2 focus-visible:outline-none ${cell(i)}`}
        >
          {/* CMS media image (spec 002 D4): the size comes from the editor, so the optimizer is bypassed. Every slot has a ratio, so `fill` is safe. */}
          <SiteImage src={image.src} alt={image.alt} fill unoptimized sizes={IMAGE_SIZES.HALF} className="object-cover" />
        </a>
      ))}
    </div>
  )
}
