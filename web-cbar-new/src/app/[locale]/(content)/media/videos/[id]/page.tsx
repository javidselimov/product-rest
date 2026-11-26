import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import type { Locale } from '@/shared/i18n'
import { VideoView } from '@/views/video'
import { loadVideo } from '@/views/video/loader'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ locale: Locale; id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id } = await params
  const data = await loadVideo(locale, id)
  if (!data) return {}
  return {
    title: data.title,
    alternates: { languages: { az: `/az/media/videos/${id}`, en: `/en/media/videos/${id}` } },
  }
}

export default async function VideoPage({ params }: Props) {
  const { locale, id } = await params
  const data = await loadVideo(locale, id)
  if (!data) notFound()
  return <VideoView data={data} />
}
