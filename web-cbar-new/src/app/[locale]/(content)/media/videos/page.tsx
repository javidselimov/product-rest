import type { Metadata } from 'next'

import type { Locale } from '@/shared/i18n'
import type { RawSearchParams } from '@/shared/lib/search-params'
import { MediaGalleryListView } from '@/views/media-gallery-list'
import { galleryListMetadata, loadMediaGalleryList } from '@/views/media-gallery-list/loader'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ locale: Locale }>; searchParams: Promise<RawSearchParams> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return galleryListMetadata('videos', locale)
}

export default async function MediaVideosPage({ params, searchParams }: Props) {
  const [{ locale }, sp] = await Promise.all([params, searchParams])
  const data = await loadMediaGalleryList('videos', locale, sp)
  return <MediaGalleryListView data={data} />
}
