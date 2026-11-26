/**
 * Video detail (spec 035, Figma `1647:34253`; tablet `1660:26784`, mobile `1660:27317`):
 * H1 = video title, 36 px, then the 984 × 601 player facade.
 */
import { getT } from '@/shared/i18n/server'
import { SectionShell } from '@/widgets/section-shell'
import { VideoPlayer } from '@/widgets/video-player'

import type { VideoViewData } from './loader'

export function VideoView({ data }: Readonly<{ data: VideoViewData }>) {
  const t = getT(data.locale, 'media')
  const watch = data.youtubeUrl ? (
    <a href={data.youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-primary font-medium underline underline-offset-4">
      {t('watchOnYoutube')}
    </a>
  ) : null

  return (
    <SectionShell shell={data.shell} title={data.title}>
      <section data-slot="video" className="flex flex-col gap-6">
        {data.player ? (
          <>
            <VideoPlayer
              embedUrl={data.player.embedUrl}
              thumbnailUrl={data.player.thumbnailUrl}
              title={t('videoFrameTitle', { title: data.title })}
              playLabel={t('gallery.play', { title: data.title })}
            />
            {/* The player needs JS; without it the visitor still gets to the video. */}
            {watch ? <noscript>{watch}</noscript> : null}
          </>
        ) : (
          watch
        )}
      </section>
    </SectionShell>
  )
}
