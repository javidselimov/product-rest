import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import type { Locale } from '@/shared/i18n'
import { PressReleaseView } from '@/views/press-release'
import { loadPressRelease } from '@/views/press-release/loader'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ locale: Locale; slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const data = await loadPressRelease(locale, slug)
  if (!data) return {}
  return {
    title: data.title,
    description: data.description || undefined,
    alternates: { languages: { az: `/az/press-releases/${slug}`, en: `/en/press-releases/${slug}` } },
  }
}

export default async function PressReleasePage({ params }: Props) {
  const { locale, slug } = await params
  const data = await loadPressRelease(locale, slug)
  if (!data) notFound()
  return <PressReleaseView data={data} />
}
