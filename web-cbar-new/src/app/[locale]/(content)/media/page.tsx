import type { Metadata } from 'next'

import type { Locale } from '@/shared/i18n'
import { MediaView } from '@/views/media'
import { loadMedia } from '@/views/media/loader'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ locale: Locale }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const data = await loadMedia(locale)
  return { title: data.title, alternates: { languages: { az: '/az/media', en: '/en/media' } } }
}

export default async function MediaPage({ params }: Props) {
  const { locale } = await params
  const data = await loadMedia(locale)
  return <MediaView data={data} />
}
