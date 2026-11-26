/**
 * YouTube thumbnails of an FAQ video (spec 051): a small one in the videos list, a larger one with a link to the
 * video on the video form. The site shows the same thumbnail and opens the video on YouTube.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@cbar/lib-react-ui-kit/card'
import { useTranslation } from 'react-i18next'

import type { AnyRow } from '@/shared/crud/types'
import { PREVIEW_LARGE, PREVIEW_THUMB, youtubeThumbUrl, youtubeWatchUrl } from '../model/constants'
import { faqVideoDetailSchema } from '../model/schemas'

/** The title sits in the next column, so the image is decorative. */
export function VideoThumb({ youtubeId }: Readonly<{ youtubeId: string }>) {
  if (!youtubeId) return null
  return (
    <img
      src={youtubeThumbUrl(youtubeId)}
      alt=""
      width={PREVIEW_THUMB.WIDTH_PX}
      height={PREVIEW_THUMB.HEIGHT_PX}
      loading="lazy"
      className="bg-muted rounded object-cover"
    />
  )
}

/** `editExtras` of the video form: the saved video, as the site will show it. */
export function VideoPreview({ detail }: Readonly<{ id: string; detail: AnyRow }>) {
  const { t } = useTranslation('faq')
  const parsed = faqVideoDetailSchema.safeParse(detail)
  if (!parsed.success || !parsed.data.youtubeId) return null
  const video = parsed.data
  const title = video.translations.az?.title ?? video.translations.en?.title ?? ''

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('preview.title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <img
          src={youtubeThumbUrl(video.youtubeId)}
          alt={t('preview.alt', { title })}
          width={PREVIEW_LARGE.WIDTH_PX}
          height={PREVIEW_LARGE.HEIGHT_PX}
          loading="lazy"
          className="bg-muted rounded-md object-cover"
        />
        <a
          href={youtubeWatchUrl(video.youtubeId)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary text-sm underline-offset-4 hover:underline"
        >
          {t('preview.open')}
        </a>
      </CardContent>
    </Card>
  )
}
