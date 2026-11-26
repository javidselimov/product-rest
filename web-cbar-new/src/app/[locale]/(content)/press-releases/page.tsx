import type { Metadata } from 'next'

import type { Locale } from '@/shared/i18n'
import type { RawSearchParams } from '@/shared/lib/search-params'
import { PressReleasesView } from '@/views/press-releases'
import { loadPressReleases, pressReleasesMetadata } from '@/views/press-releases/loader'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ locale: Locale }>; searchParams: Promise<RawSearchParams> }

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const [{ locale }, sp] = await Promise.all([params, searchParams])
  return pressReleasesMetadata(locale, sp)
}

export default async function PressReleasesPage({ params, searchParams }: Props) {
  const [{ locale }, sp] = await Promise.all([params, searchParams])
  const data = await loadPressReleases(locale, sp)
  return <PressReleasesView data={data} />
}
