import type { Metadata } from 'next'

import { getT } from '@/shared/i18n/server'
import type { Locale } from '@/shared/i18n'
import type { RawSearchParams } from '@/shared/lib/search-params'
import { CurrenciesView } from '@/views/currencies'
import { loadCurrencies } from '@/views/currencies/loader'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ locale: Locale }>; searchParams: Promise<RawSearchParams> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = getT(locale, 'finance')
  return { title: t('officialRates'), alternates: { languages: { az: '/az/currencies', en: '/en/currencies' } } }
}

export default async function CurrenciesPage({ params, searchParams }: Props) {
  const [{ locale }, sp] = await Promise.all([params, searchParams])
  const data = await loadCurrencies(locale, sp)
  return <CurrenciesView data={data} />
}
