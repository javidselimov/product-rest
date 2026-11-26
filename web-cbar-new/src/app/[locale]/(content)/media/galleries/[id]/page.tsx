import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import type { Locale } from '@/shared/i18n'
import { GalleryView } from '@/views/gallery'
import { loadGallery } from '@/views/gallery/loader'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ locale: Locale; id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id } = await params
  const data = await loadGallery(locale, id)
  if (!data) return {}
  return {
    title: data.title,
    alternates: { languages: { az: `/az/media/galleries/${id}`, en: `/en/media/galleries/${id}` } },
  }
}

export default async function GalleryPage({ params }: Props) {
  const { locale, id } = await params
  const data = await loadGallery(locale, id)
  if (!data) notFound()
  return <GalleryView data={data} />
}
