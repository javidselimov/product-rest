import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import type { Locale } from '@/shared/i18n'
import { MoneyMarkNewsItemView } from '@/views/money-mark-news-item'
import { loadMoneyMarkNewsItem } from '@/views/money-mark-news-item/loader'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ locale: Locale; slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const data = await loadMoneyMarkNewsItem(locale, slug)
  if (!data) return {}
  return {
    title: data.title,
    description: data.description || undefined,
    alternates: { languages: { az: `/az/national-currency/news/${slug}`, en: `/en/national-currency/news/${slug}` } },
  }
}

export default async function MoneyMarkNewsItemPage({ params }: Props) {
  const { locale, slug } = await params
  const data = await loadMoneyMarkNewsItem(locale, slug)
  if (!data) notFound()
  return <MoneyMarkNewsItemView data={data} />
}
