import type { Metadata } from 'next'

import { getT } from '@/shared/i18n/server'
import type { Locale } from '@/shared/i18n'
import type { RawSearchParams } from '@/shared/lib/search-params'
import { OrganizationView } from '@/views/organization'
import { loadOrganization } from '@/views/organization/loader'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ locale: Locale }>; searchParams: Promise<RawSearchParams> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = getT(locale, 'organization')
  return { title: t('title'), alternates: { languages: { az: '/az/organization', en: '/en/organization' } } }
}

export default async function OrganizationPage({ params, searchParams }: Props) {
  const [{ locale }, sp] = await Promise.all([params, searchParams])
  const data = await loadOrganization(locale, sp)
  return <OrganizationView data={data} />
}
