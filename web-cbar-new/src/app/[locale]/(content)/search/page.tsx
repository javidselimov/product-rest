import type { Metadata } from 'next'

import { getT } from '@/shared/i18n/server'
import type { Locale } from '@/shared/i18n'
import type { RawSearchParams } from '@/shared/lib/search-params'
import { SearchView } from '@/views/search'
import { loadSearch } from '@/views/search/loader'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ locale: Locale }>; searchParams: Promise<RawSearchParams> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = getT(locale, 'search')
  return { title: t('title'), robots: { index: false } }
}

export default async function SearchPage({ params, searchParams }: Props) {
  const [{ locale }, sp] = await Promise.all([params, searchParams])
  const data = await loadSearch(locale, sp)
  return <SearchView data={data} />
}
