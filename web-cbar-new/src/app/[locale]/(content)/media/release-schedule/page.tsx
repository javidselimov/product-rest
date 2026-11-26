import type { Metadata } from 'next'

import type { Locale } from '@/shared/i18n'
import type { RawSearchParams } from '@/shared/lib/search-params'
import { ReleaseScheduleView } from '@/views/media-release-schedule'
import { loadReleaseSchedule, releaseScheduleMetadata } from '@/views/media-release-schedule/loader'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ locale: Locale }>; searchParams: Promise<RawSearchParams> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return releaseScheduleMetadata(locale)
}

export default async function ReleaseSchedulePage({ params, searchParams }: Props) {
  const { locale } = await params
  const data = await loadReleaseSchedule(locale, await searchParams)
  return <ReleaseScheduleView data={data} />
}
