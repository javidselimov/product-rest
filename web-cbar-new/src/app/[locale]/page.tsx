import type { Metadata } from 'next'

import { brand } from '@/shared/config/brand'
import { getT } from '@/shared/i18n/server'
import type { Locale } from '@/shared/i18n'
import { HomeView } from '@/views/home'
import { loadHome } from '@/views/home/loader'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ locale: Locale }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = getT(locale, 'common')
  return {
    title: { absolute: `${t('brand.name')} | ${brand.displayName}` },
    alternates: { languages: { az: '/az', en: '/en' } },
  }
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params
  const data = await loadHome(locale)
  return <HomeView data={data} />
}
