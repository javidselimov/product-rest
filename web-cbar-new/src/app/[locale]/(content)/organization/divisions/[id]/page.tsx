import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import type { Locale } from '@/shared/i18n'
import { DivisionView } from '@/views/division'
import { loadDivision } from '@/views/division/loader'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ locale: Locale; id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id } = await params
  const data = await loadDivision(locale, id)
  if (!data) return {}
  return {
    title: data.name || undefined,
    alternates: { languages: { az: `/az/organization/divisions/${id}`, en: `/en/organization/divisions/${id}` } },
  }
}

export default async function DivisionPage({ params }: Props) {
  const { locale, id } = await params
  const data = await loadDivision(locale, id)
  if (!data) notFound()
  return <DivisionView data={data} />
}
