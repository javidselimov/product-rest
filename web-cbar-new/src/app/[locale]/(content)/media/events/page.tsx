import type { Metadata } from 'next'

import type { Locale } from '@/shared/i18n'
import type { RawSearchParams } from '@/shared/lib/search-params'
import { MediaEventsView } from '@/views/media-events'
import { eventsMetadata, loadMediaEvents } from '@/views/media-events/loader'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ locale: Locale }>; searchParams: Promise<RawSearchParams> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return eventsMetadata(locale)
}

export default async function MediaEventsPage({ params, searchParams }: Props) {
  const { locale } = await params
  const data = await loadMediaEvents(locale, await searchParams)
  return <MediaEventsView data={data} />
}
