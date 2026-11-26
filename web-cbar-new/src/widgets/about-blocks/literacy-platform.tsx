/**
 * Platform pages of "Financial literacy" (spec 047, Figma portal `2261:5027`, Virtual Education Platform
 * `2421:2292` / `2421:85067` / `2421:85583`, infobank `2430:4715`; `contracts/ui-contract.md` §2): intro, note box,
 * photo row, sections under a top rule and the "go to the platform" button.
 */
import { cn } from '@cbar/lib-react-ui-kit/lib'

import type { LiteracyImage, LiteracyPlatformBlock } from '@/features/about-content/model/types'
import type { Locale } from '@/shared/i18n'
import { getT } from '@/shared/i18n/server'
import { SiteImage } from '@/shared/ui/site-image'
import { CmsContent } from '@/widgets/cms-content/cms-content'

import { LITERACY_PHOTO_SIZES } from './constants'

/** Three columns from tablet; on mobile the row scrolls sideways with 280 × 190 photos. */
function PhotoRow({ photos, title, locale }: Readonly<{ photos: LiteracyImage[]; title: string; locale: Locale }>) {
  const t = getT(locale, 'about')
  return (
    <ul
      aria-label={t('literacy.photos')}
      data-slot="literacy-photos"
      className={cn(
        'flex snap-x snap-mandatory gap-3 overflow-x-auto [scrollbar-width:none]',
        'tab:grid tab:snap-none tab:grid-cols-3 tab:gap-6 tab:overflow-visible',
      )}
    >
      {photos.map((photo, index) => {
        const alt = t('literacy.imageAlt', { title, n: index + 1 })
        return (
          <li key={photo.mediaId} className="w-70 shrink-0 snap-start tab:w-auto">
            <a
              href={photo.src}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={alt}
              className={cn(
                'bg-site-image-placeholder relative block h-[190px] overflow-hidden rounded-xs tab:h-40 desk:h-52',
                'focus-visible:outline-ring focus-visible:outline-2 focus-visible:outline-offset-2',
              )}
            >
              <SiteImage src={photo.src} alt={alt} fill sizes={LITERACY_PHOTO_SIZES} className="object-cover" />
            </a>
          </li>
        )
      })}
    </ul>
  )
}

type LiteracyPlatformProps = Readonly<{ block: LiteracyPlatformBlock; locale: Locale; title: string }>

export function LiteracyPlatform({ block, locale, title }: LiteracyPlatformProps) {
  const t = getT(locale, 'about')
  return (
    <div data-slot="literacy-platform" className="flex flex-col gap-7 tab:gap-8">
      {block.introHtml.trim() || block.noteHtml ? (
        <div className="flex flex-col gap-4">
          {block.introHtml.trim() ? <CmsContent html={block.introHtml} variant="about" /> : null}
          {block.noteHtml ? (
            <div
              data-slot="literacy-note"
              className="bg-site-literacy-tint border-site-accent text-site-literacy-ink border-l-[3px] px-5 py-3.5 text-base leading-6 font-medium tab:leading-[26px]"
            >
              <CmsContent html={block.noteHtml} variant="inherit" />
            </div>
          ) : null}
        </div>
      ) : null}

      {block.photos.length > 0 ? <PhotoRow photos={block.photos} title={title} locale={locale} /> : null}

      {block.sections.map((section, index) => (
        <section key={`${index}-${section.heading}`} className="border-site-literacy-rule flex flex-col gap-3 border-t pt-6">
          <h2 className="text-foreground text-lg leading-7 font-semibold tab:text-xl">{section.heading}</h2>
          <CmsContent html={section.html} variant="about" />
        </section>
      ))}

      {block.link ? (
        <a
          href={block.link.href}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            'bg-site-literacy-ink text-primary-foreground inline-flex h-12 w-full items-center justify-center gap-2 rounded-xs px-6',
            'text-base leading-6 font-medium tab:w-auto tab:self-start tab:leading-7',
            'focus-visible:outline-ring hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2',
          )}
        >
          {block.link.label}{' '}
          <span className="sr-only">{t('literacy.newWindow')}</span>
        </a>
      ) : null}
    </div>
  )
}
