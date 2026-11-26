import type { Metadata } from 'next'

import { getT } from '@/shared/i18n/server'
import type { Locale } from '@/shared/i18n'
import { buildHref, first, type RawSearchParams } from '@/shared/lib/search-params'
import { AzirView } from '@/views/azir'
import { azirRangeFromSearchParams, loadAzirPage } from '@/views/azir/loader'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ locale: Locale }>; searchParams: Promise<RawSearchParams> }

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const [{ locale }, sp] = await Promise.all([params, searchParams])
  const t = getT(locale, 'finance')
  const query = { dateFrom: first(sp.dateFrom), dateTo: first(sp.dateTo) }
  return {
    title: t('azirPage.title'),
    alternates: {
      languages: { az: buildHref('/az/statistics/azir', query), en: buildHref('/en/statistics/azir', query) },
    },
  }
}

export default async function AzirPage({ params, searchParams }: Props) {
  const [{ locale }, sp] = await Promise.all([params, searchParams])
  const data = await loadAzirPage(locale, azirRangeFromSearchParams(sp))
  return <AzirView data={data} />
}
