import type { Metadata } from 'next'

import { getT } from '@/shared/i18n/server'
import type { Locale } from '@/shared/i18n'
import type { RawSearchParams } from '@/shared/lib/search-params'
import { LawsView } from '@/views/laws'
import { loadLaws } from '@/views/laws/loader'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ locale: Locale }>; searchParams: Promise<RawSearchParams> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = getT(locale, 'content')
  return { title: t('laws'), alternates: { languages: { az: '/az/laws', en: '/en/laws' } } }
}

export default async function LawsPage({ params, searchParams }: Props) {
  const [{ locale }, sp] = await Promise.all([params, searchParams])
  const data = await loadLaws(locale, sp)
  return <LawsView data={data} />
}
