import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import type { Locale } from '@/shared/i18n'
import { MoneyMarkView } from '@/views/money-mark'
import { loadMoneyMark } from '@/views/money-mark/loader'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ locale: Locale; slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const data = await loadMoneyMark(locale, slug)
  if (!data) return {}
  return {
    title: data.title,
    description: data.description || undefined,
    alternates: { languages: { az: `/az/national-currency/${slug}`, en: `/en/national-currency/${slug}` } },
  }
}

export default async function MoneyMarkPage({ params }: Props) {
  const { locale, slug } = await params
  const data = await loadMoneyMark(locale, slug)
  if (!data) notFound()
  return <MoneyMarkView data={data} />
}
