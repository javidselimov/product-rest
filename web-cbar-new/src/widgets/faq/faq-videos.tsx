/**
 * "Video sual-cavab" (spec 051 FR-015, Figma `2642:3541`): a card per video — 16:9 preview with a 56px play mark and the
 * title. The whole card is one link that opens the video on YouTube in a new tab; there is no player on the page.
 * Without videos the block is left out.
 */
import { PlayIcon } from '@cbar/lib-react-ui-kit/icons'

import type { Locale } from '@/shared/i18n'
import { getT } from '@/shared/i18n/server'
import { Reveal } from '@/shared/ui/reveal'
import { SiteImage } from '@/shared/ui/site-image'

import { VIDEO_IMAGE_SIZES } from './constants'

export type FaqVideoCard = { id: number; title: string; href: string; thumbnail: string | null }

type FaqVideosProps = Readonly<{ videos: FaqVideoCard[]; locale: Locale }>

export function FaqVideos({ videos, locale }: FaqVideosProps) {
  if (videos.length === 0) return null
  const t = getT(locale, 'faq')

  return (
    <section data-slot="faq-videos" aria-labelledby="faq-videos-heading" className="flex flex-col gap-5 pt-8 tab:gap-6 tab:pt-10">
      <h2 id="faq-videos-heading" className="text-foreground text-xl leading-7 font-semibold tab:text-2xl tab:leading-8">
        {t('videos.title')}
      </h2>
      <ul className="grid grid-cols-1 gap-6 tab:grid-cols-2 desk:grid-cols-3">
        {videos.map((video, index) => (
          <Reveal as="li" index={index} key={video.id}>
            <a
              href={video.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t('videos.watch', { title: video.title })}
              className="group focus-visible:outline-ring flex flex-col gap-3 rounded-xs outline-none focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              <span className="bg-site-image-placeholder relative block aspect-video overflow-hidden rounded-xs">
                {video.thumbnail ? (
                  <SiteImage src={video.thumbnail} alt="" fill unoptimized sizes={VIDEO_IMAGE_SIZES} className="object-cover" />
                ) : null}
                <span className="bg-site-logo-muted text-primary-foreground absolute top-1/2 left-1/2 flex size-14 -translate-1/2 items-center justify-center rounded-full transition-transform group-hover:scale-105">
                  <PlayIcon aria-hidden="true" variant="solid" size={24} />
                </span>
              </span>
              <span className="text-foreground group-hover:text-primary line-clamp-2 text-base leading-6 font-semibold">{video.title}</span>
            </a>
          </Reveal>
        ))}
      </ul>
    </section>
  )
}
