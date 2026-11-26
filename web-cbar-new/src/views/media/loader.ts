/**
 * Media landing page (spec 028 US1, data-model §4): the CMS "Media" page (slug `media`, same in az
 * and en) in the section shell. The tree is read separately — if it fails, the menu is empty and the
 * breadcrumb has two levels (FR-008). Without the page (empty database) the title is the site label
 * and the content is empty.
 *
 * The gallery and video lists moved off this page to their own addresses (`views/media-gallery-list`,
 * spec 035) — the Figma landing page has only the title and the intro text.
 */
import 'server-only'

import { cache } from 'react'

import { mediaUrl, type AttachmentFile } from '@/entities/content'
import type { PageNode } from '@/entities/page-node'
import { getPage, getPagesTree } from '@/features/pages/api/pages.api'
import { absolutePageUrl } from '@/server/page-url'
import { prepareCmsHtml } from '@/shared/lib/cms-html'
import { getT } from '@/shared/i18n/server'
import type { Locale } from '@/shared/i18n'
import { buildSectionShell, type SectionShellData } from '@/widgets/section-shell'

/** Slug of the CMS root — `media` in both languages on the test environment (research R2). */
export const MEDIA_PAGE_SLUG = 'media'

export type MediaViewData = {
  locale: Locale
  title: string
  html: string
  attachments: AttachmentFile[]
  shell: SectionShellData
}

export const loadMedia = cache(async (locale: Locale): Promise<MediaViewData> => {
  const [page, tree] = await Promise.all([
    getPage(locale, MEDIA_PAGE_SLUG).catch(() => null),
    getPagesTree(locale).catch((): PageNode[] => []),
  ])

  const title = page?.title ?? getT(locale, 'media')('title')
  const html = page ? prepareCmsHtml(page.content) : ''
  const attachments: AttachmentFile[] = (page?.assets ?? []).map((asset) => ({
    id: asset.mediaId,
    title: asset.title,
    mimeType: asset.mimeType,
    sizeBytes: asset.sizeBytes,
    group: asset.group,
    url: mediaUrl(asset.url) ?? asset.url,
  }))

  const shell = buildSectionShell({
    section: 'media',
    tree,
    locale,
    current: { slug: page?.slug ?? MEDIA_PAGE_SLUG },
    pageUrl: await absolutePageUrl(`/${locale}/media`),
    pageTitle: title,
  })

  return { locale, title, html, attachments, shell }
})
