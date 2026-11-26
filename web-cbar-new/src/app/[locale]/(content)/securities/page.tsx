import type { Metadata } from 'next'

import { getT } from '@/shared/i18n/server'
import type { Locale } from '@/shared/i18n'
import type { RawSearchParams } from '@/shared/lib/search-params'
import { SecuritiesView } from '@/views/securities'
import { loadSecurities } from '@/views/securities/loader'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ locale: Locale }>; searchParams: Promise<RawSearchParams> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = getT(locale, 'finance')
  return { title: t('securities'), alternates: { languages: { az: '/az/securities', en: '/en/securities' } } }
}

export default async function SecuritiesPage({ params, searchParams }: Props) {
  const [{ locale }, sp] = await Promise.all([params, searchParams])
  const data = await loadSecurities(locale, sp)
  return <SecuritiesView data={data} />
}
