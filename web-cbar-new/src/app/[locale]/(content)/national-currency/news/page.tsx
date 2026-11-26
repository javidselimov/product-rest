import type { Metadata } from 'next'

import { getT } from '@/shared/i18n/server'
import type { Locale } from '@/shared/i18n'
import type { RawSearchParams } from '@/shared/lib/search-params'
import { MoneyMarkNewsView } from '@/views/money-mark-news'
import { loadMoneyMarkNews } from '@/views/money-mark-news/loader'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ locale: Locale }>; searchParams: Promise<RawSearchParams> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = getT(locale, 'content')
  return {
    title: t('moneyMarkNews'),
    alternates: { languages: { az: '/az/national-currency/news', en: '/en/national-currency/news' } },
  }
}

export default async function MoneyMarkNewsPage({ params, searchParams }: Props) {
  const [{ locale }, sp] = await Promise.all([params, searchParams])
  const data = await loadMoneyMarkNews(locale, sp)
  return <MoneyMarkNewsView data={data} />
}
