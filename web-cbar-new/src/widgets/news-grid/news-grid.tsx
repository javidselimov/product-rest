/**
 * News card grid (spec 029, contracts/ui-contract.md §2.1, Figma `card / press-release` `1048:20711`;
 * spec 031 text variant, Figma `1048:23221`).
 *
 * Desktop 3 × 312, tablet 2 × 320, mobile 1 column; 24 px gaps both ways. The whole card is
 * one link — the title gives it its name, so the photo is decorative (`alt=""`).
 *
 * - `photo` (news): image box, 24 px, date, 16 px, title. Without a photo the grey box stays,
 *   so cards in a row keep the same image height. The title stops at 3 lines with an ellipsis.
 * - `text` (announcements, spec 031): date, 16 px, title — no image box at all, even when the
 *   API sends an `imageUrl`. Below `desk` the Figma card has 16 px padding and a 4 px radius.
 *
 * The gallery lists (spec 035, Figma `1643:29930`) use the same photo card: a gallery may have no
 * event date (the date line is left out) and a video thumbnail comes straight from YouTube
 * (`imageExternal`, not proxied — see `views/media-gallery-list`).
 *
 * Cards below the first screen reveal on scroll, staggered by position (spec 049, `shared/ui/reveal`).
 */
import Link from 'next/link'

import { cn } from '@cbar/lib-react-ui-kit/lib'

import { EAGER_CARD_COUNT } from '@/shared/constants/layout'
import { Reveal } from '@/shared/ui/reveal'
import { SiteImage } from '@/shared/ui/site-image'

export type NewsCardItem = {
  key: string
  href: string
  title: string
  /** `dd.mm.yyyy`; `null` leaves the date line out. */
  dateLabel: string | null
  /** ISO value for `<time dateTime>`. */
  dateTime: string | null
  imageUrl: string | null
  /** The image is on a third-party CDN, so it bypasses the optimizer (no `remotePatterns`). */
  imageExternal?: boolean
}

export type NewsGridVariant = 'photo' | 'text'

/** Shared with `NewsGridSkeleton`, so the two cannot drift apart. */
export const NEWS_GRID_CLASS = 'grid grid-cols-1 gap-6 tab:grid-cols-2 desk:grid-cols-3'
export const NEWS_CARD_IMAGE_CLASS = 'relative mb-6 aspect-[312/197] w-full overflow-hidden'

export function NewsGrid({ items, variant = 'photo' }: Readonly<{ items: NewsCardItem[]; variant?: NewsGridVariant }>) {
  const text = variant === 'text'
  return (
    <ul data-slot="news-grid" data-variant={variant} className={NEWS_GRID_CLASS}>
      {items.map((item, index) => (
        <Reveal as="li" key={item.key} index={index}>
          <Link
            href={item.href}
            className={cn(
              'group block rounded-xs focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring',
              text && 'flex flex-col gap-4 p-4 desk:p-0',
            )}
          >
            {text ? null : (
              <div className={cn('bg-site-image-placeholder', NEWS_CARD_IMAGE_CLASS)}>
                {item.imageUrl ? (
                  <SiteImage
                    src={item.imageUrl}
                    alt=""
                    fill
                    sizes="(min-width: 85rem) 312px, (min-width: 46.5rem) 50vw, 100vw"
                    loading={index < EAGER_CARD_COUNT ? 'eager' : undefined}
                    unoptimized={item.imageExternal}
                    className="object-cover"
                  />
                ) : null}
              </div>
            )}
            {item.dateLabel ? (
              <time dateTime={item.dateTime ?? undefined} className={cn('text-muted-foreground block text-base leading-7 font-semibold', !text && 'mb-4')}>
                {item.dateLabel}
              </time>
            ) : null}
            <h2 className={cn('text-foreground group-hover:text-primary text-xl leading-7 font-semibold transition-colors', !text && 'line-clamp-3')}>
              {item.title}
            </h2>
          </Link>
        </Reveal>
      ))}
    </ul>
  )
}
