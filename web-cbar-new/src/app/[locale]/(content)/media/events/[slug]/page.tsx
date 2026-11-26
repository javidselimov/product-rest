import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'

import type { Locale } from '@/shared/i18n'
import { MediaEventView } from '@/views/media-event'
import { loadMediaEvent } from '@/views/media-event/loader'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ locale: Locale; slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const data = await loadMediaEvent(locale, slug)
  if (!data || 'redirectTo' in data) return {}
  return { title: data.eventTitle, description: data.description }
}

export default async function MediaEventPage({ params }: Props) {
  const { locale, slug } = await params
  const data = await loadMediaEvent(locale, slug)
  if (!data) notFound()
  if ('redirectTo' in data) redirect(data.redirectTo)
  return <MediaEventView data={data} />
}
