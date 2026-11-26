import type { Metadata } from 'next'

import { getT } from '@/shared/i18n/server'
import type { Locale } from '@/shared/i18n'
import { StatisticsView } from '@/views/statistics'
import { loadStatistics } from '@/views/statistics/loader'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ locale: Locale }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = getT(locale, 'home')
  return { title: t('statistics'), alternates: { languages: { az: '/az/statistics', en: '/en/statistics' } } }
}

export default async function StatisticsPage({ params }: Props) {
  const { locale } = await params
  const data = await loadStatistics(locale)
  return <StatisticsView data={data} />
}
