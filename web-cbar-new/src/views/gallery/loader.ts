/**
 * Photo gallery detail (spec 028 FR-013, spec 035). The API answers 404 for a gallery without a
 * translation in the locale, so the page is a 404 too instead of an untitled gallery.
 */
import 'server-only'

import { cache } from 'react'

import { mediaUrl } from '@/entities/content'
import { getGallery } from '@/features/media/api/media.api'
import { getPagesTree } from '@/features/pages/api/pages.api'
import { absolutePageUrl } from '@/server/page-url'
import { getT } from '@/shared/i18n/server'
import type { Locale } from '@/shared/i18n'
import { galleriesHref } from '@/views/media-gallery-list/loader'
import { parseStaffId as parsePositiveId } from '@/views/staff-member/loader'
import type { GalleryImage } from '@/widgets/photo-gallery'
import { buildSectionShell, type SectionShellData } from '@/widgets/section-shell'

export type GalleryViewData = {
  locale: Locale
  title: string
  images: GalleryImage[]
  /** Breadcrumb "… › Photo gallery › {title}", the list item active in the menu. */
  shell: SectionShellData
}

export const loadGallery = cache(async (locale: Locale, rawId: string): Promise<GalleryViewData | null> => {
  const id = parsePositiveId(rawId)
  if (id === null) return null

  const [gallery, tree] = await Promise.all([getGallery(locale, id), getPagesTree(locale).catch(() => [])])
  if (!gallery) return null

  const t = getT(locale, 'media')
  const href = galleriesHref(locale)

  return {
    locale,
    title: gallery.title,
    images: gallery.images.map((image, index) => ({
      id: image.mediaId,
      url: mediaUrl(image.url) ?? image.url,
      alt: t('galleryImageAlt', { title: gallery.title, index: index + 1 }),
    })),
    shell: buildSectionShell({
      section: 'media',
      tree,
      locale,
      current: { href },
      pageUrl: await absolutePageUrl(`${href}/${id}`),
      pageTitle: gallery.title,
      trail: gallery.title,
    }),
  }
})
