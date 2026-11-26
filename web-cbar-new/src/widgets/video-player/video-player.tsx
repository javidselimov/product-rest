'use client'

/**
 * YouTube player facade (spec 035, Figma `1647:35072`): a 984 × 601 cover with an 80 px play
 * circle; a click swaps it for the `youtube-nocookie` iframe with autoplay. Nothing is loaded
 * from YouTube but the thumbnail until the visitor asks for the video, and CSP `frame-src`
 * already allows the nocookie host.
 *
 * Client component because "playing" is state. Without JS the button does nothing, so the
 * caller also renders a plain link to the video under the player.
 */
import { PlayIcon } from '@cbar/lib-react-ui-kit/icons'
import { useState } from 'react'

import { IMAGE_SIZES } from '@/shared/constants/layout'
import { SiteImage } from '@/shared/ui/site-image'

type VideoPlayerProps = Readonly<{
  /** `https://www.youtube-nocookie.com/embed/{id}` */
  embedUrl: string
  thumbnailUrl: string
  /** iframe `title` */
  title: string
  playLabel: string
}>

const BOX = 'bg-site-video-placeholder relative block aspect-[984/601] w-full overflow-hidden'

export function VideoPlayer({ embedUrl, thumbnailUrl, title, playLabel }: VideoPlayerProps) {
  const [playing, setPlaying] = useState(false)

  if (playing) {
    return (
      <div data-slot="video-player" className={BOX}>
        <iframe
          src={`${embedUrl}?autoplay=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          className="absolute inset-0 size-full border-0"
        />
      </div>
    )
  }

  return (
    <button type="button" data-slot="video-player" aria-label={playLabel} onClick={() => setPlaying(true)} className={`${BOX} group cursor-pointer`}>
      {/* The thumbnail is on YouTube's CDN and already sized; proxying it through the optimizer gains nothing (spec 003 D5). */}
      <SiteImage src={thumbnailUrl} alt="" fill unoptimized sizes={IMAGE_SIZES.CONTENT_COLUMN} className="object-cover" />
      <span
        aria-hidden="true"
        className="bg-site-play-overlay text-primary-foreground absolute top-1/2 left-1/2 flex size-20 -translate-1/2 items-center justify-center rounded-full transition-transform group-hover:scale-105 group-focus-visible:outline-2 group-focus-visible:outline-ring"
      >
        <PlayIcon className="size-10" />
      </span>
    </button>
  )
}
