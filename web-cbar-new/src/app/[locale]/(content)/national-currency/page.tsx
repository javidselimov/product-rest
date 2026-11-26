import type { Metadata } from 'next'

import { getT } from '@/shared/i18n/server'
import type { Locale } from '@/shared/i18n'
import type { RawSearchParams } from '@/shared/lib/search-params'
import { MoneyMarksView } from '@/views/money-marks'
import { loadMoneyMarks } from '@/views/money-marks/loader'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ locale: Locale }>; searchParams: Promise<RawSearchParams> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = getT(locale, 'content')
  return { title: t('nationalCurrency'), alternates: { languages: { az: '/az/national-currency', en: '/en/national-currency' } } }
}

export default async function NationalCurrencyPage({ params, searchParams }: Props) {
  const [{ locale }, sp] = await Promise.all([params, searchParams])
  const data = await loadMoneyMarks(locale, sp)
  return <MoneyMarksView data={data} />
}
