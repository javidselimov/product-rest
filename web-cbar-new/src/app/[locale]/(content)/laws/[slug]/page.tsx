import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import type { Locale } from '@/shared/i18n'
import { LawView } from '@/views/law'
import { loadLaw } from '@/views/law/loader'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ locale: Locale; slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const data = await loadLaw(locale, slug)
  if (!data) return {}
  return {
    title: data.title,
    description: data.description || undefined,
    alternates: { languages: { az: `/az/laws/${slug}`, en: `/en/laws/${slug}` } },
  }
}

export default async function LawPage({ params }: Props) {
  const { locale, slug } = await params
  const data = await loadLaw(locale, slug)
  if (!data) notFound()
  return <LawView data={data} />
}
