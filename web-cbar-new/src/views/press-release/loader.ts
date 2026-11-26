/**
 * Press release detail (spec 029 US3, data-model §4.3). Wrapped in `cache` so
 * `generateMetadata` and the page share one request (SC-002).
 *
 * The page sits in the Media section shell under the menu item of its type, with the title as
 * the last breadcrumb. The type picks the layout, see `splitPressReleaseAssets`.
 */
import 'server-only'

import { cache } from 'react'

import { excerpt, formatDate, stripHtml, type AttachmentFile, type MediaAsset } from '@/entities/content'
import { getPagesTree } from '@/features/pages/api/pages.api'
import { getPressRelease } from '@/features/press-releases/api/press-releases.api'
import { pressReleasesListHref } from '@/features/press-releases/model/routes'
import type { PressReleaseType } from '@/features/press-releases/model/schemas'
import { pdfFileName } from '@/features/press-releases/model/pdf-file-name'
import { layoutFor, splitPressReleaseAssets, type PressReleaseLayout } from '@/features/press-releases/model/split-assets'
import { absolutePageUrl } from '@/server/page-url'
import { EXCERPT_LENGTH } from '@/shared/constants/text'
import { getT } from '@/shared/i18n/server'
import type { Locale } from '@/shared/i18n'
import { prepareCmsHtml, wrapTables } from '@/shared/lib/cms-html'
import { safeDecodeURIComponent } from '@/shared/lib/uri'
import type { GalleryImage } from '@/widgets/photo-gallery'
import { buildSectionShell, type SectionShellData } from '@/widgets/section-shell'

export type PressReleaseViewData = {
  locale: Locale
  type: PressReleaseType
  layout: PressReleaseLayout
  title: string
  /** `dd.mm.yyyy` */
  dateLabel: string
  dateTime: string
  html: string
  /** False when the editor left the body empty, as with a scanned document. */
  hasText: boolean
  description: string
  cover: GalleryImage | null
  gallery: GalleryImage[]
  /** Download button of the `document` layout. */
  pdf: { url: string; fileName: string } | null
  attachments: AttachmentFile[]
  shell: SectionShellData
}

export const loadPressRelease = cache(async (locale: Locale, rawSlug: string): Promise<PressReleaseViewData | null> => {
  const slug = safeDecodeURIComponent(rawSlug)
  const [release, tree] = await Promise.all([getPressRelease(locale, slug), getPagesTree(locale).catch(() => [])])
  if (!release) return null

  const prepared = prepareCmsHtml(release.content)
  const layout = layoutFor(release.type)
  // Announcements carry wide tables (up to 6 columns); other types do not.
  const html = layout === 'files' ? wrapTables(prepared) : prepared
  const t = getT(locale, 'content')
  const { cover, gallery, pdf, attachments } = splitPressReleaseAssets(release.assets, layout)
  // Photo numbers follow the page order: the cover is photo 1.
  const toImage = (asset: MediaAsset, n: number): GalleryImage => ({
    id: asset.mediaId,
    url: `/media/${asset.mediaId}`,
    alt: t('newsList.imageAlt', { title: release.title, n }),
  })

  return {
    locale,
    type: release.type,
    layout,
    title: release.title,
    dateLabel: formatDate(release.publishedAt, locale),
    dateTime: release.publishedAt,
    html,
    hasText: stripHtml(html).trim() !== '',
    description: excerpt(stripHtml(html), EXCERPT_LENGTH),
    cover: cover ? toImage(cover, 1) : null,
    gallery: gallery.map((asset, i) => toImage(asset, i + 2)),
    pdf: pdf ? { url: `/media/${pdf.mediaId}`, fileName: pdfFileName(release.title) } : null,
    // The old site served press release files as `/media/{mediaId}`.
    attachments: attachments.map((asset) => ({
      id: asset.mediaId,
      title: asset.originalName,
      mimeType: asset.mimeType,
      sizeBytes: asset.sizeBytes,
      group: null,
      url: `/media/${asset.mediaId}`,
    })),
    shell: buildSectionShell({
      section: 'media',
      tree,
      locale,
      current: { href: pressReleasesListHref(locale, release.type) },
      pageUrl: await absolutePageUrl(`/${locale}/press-releases/${encodeURIComponent(slug)}`),
      pageTitle: release.title,
      trail: release.title,
    }),
  }
})
