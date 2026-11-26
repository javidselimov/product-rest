'use client'

/**
 * Photos in the project dialog (spec 038, Figma `1801:5524`): a large photo with a position counter
 * and a thumbnail strip. Six thumbnails fit from tablet up, four on mobile. The strip has no scrollbar
 * in Figma, so a selected thumbnail moves to the centre and uncovers its neighbours. Not
 * `PhotoGallery`: that one has arrow buttons and links the large photo to the file, Figma has
 * neither here.
 */
import { cn } from '@cbar/lib-react-ui-kit/lib'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { AboutImage } from '@/features/about-content/model/types'
import { SiteImage } from '@/shared/ui/site-image'

const MAIN_SIZES = '(min-width: 85rem) 800px, (min-width: 46.5rem) 584px, 100vw'

export function CsrProjectGallery({ images, title }: Readonly<{ images: AboutImage[]; title: string }>) {
  const { t } = useTranslation('media')
  const [index, setIndex] = useState(0)
  const thumbs = useRef<(HTMLButtonElement | null)[]>([])
  const current = images[index]
  if (!current) return null

  const altOf = (image: AboutImage, n: number) => image.alt || t('galleryImageAlt', { title, index: n })
  const several = images.length > 1

  const select = (next: number) => {
    setIndex(next)
    // jsdom has no scrollIntoView; browsers always do.
    thumbs.current[next]?.scrollIntoView?.({ inline: 'center', block: 'nearest' })
  }

  return (
    <section aria-label={t('gallery.title')} data-slot="csr-project-gallery" className="flex shrink-0 flex-col gap-3">
      <div className="bg-site-image-placeholder relative h-55 overflow-hidden rounded-xs tab:h-105">
        <SiteImage src={current.src} alt={altOf(current, index + 1)} fill sizes={MAIN_SIZES} className="object-cover" />
        {several ? (
          <span
            aria-live="polite"
            className="bg-site-play-overlay absolute top-3 right-3 rounded-xl px-2.5 py-1 text-xs leading-4 tracking-[0.25px] text-white"
          >
            {index + 1} / {images.length}
          </span>
        ) : null}
      </div>

      {several ? (
        <ul className="flex gap-2 overflow-x-auto [scrollbar-width:none]">
          {images.map((image, i) => (
            <li key={image.src} className="w-[calc((100%-1.5rem)/4)] shrink-0 tab:w-[calc((100%-2.5rem)/6)]">
              <button
                ref={(el) => {
                  thumbs.current[i] = el
                }}
                type="button"
                aria-label={altOf(image, i + 1)}
                aria-current={i === index ? 'true' : undefined}
                onClick={() => select(i)}
                className={cn(
                  'bg-site-image-placeholder relative block h-14 w-full cursor-pointer overflow-hidden rounded-xs tab:h-18',
                  'focus-visible:outline-ring focus-visible:outline-2 focus-visible:-outline-offset-2',
                  // The frame is an ::after overlay: a ring on the button would paint under the fill image.
                  i === index &&
                    'after:ring-site-accent after:pointer-events-none after:absolute after:inset-0 after:rounded-xs after:ring-2 after:ring-inset after:content-[""]',
                )}
              >
                <SiteImage src={image.src} alt="" fill sizes="126px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}
