/**
 * Photo and video gallery lists (spec 035): `/media/galleries` and `/media/videos`, one page
 * template with two link tabs. Was `views/media-galleries` + `views/media-videos` (spec 028).
 *
 * URL: `q`, `from`, `to` (`YYYY-MM-DD`), `page`. Invalid values are dropped, never sent to the
 * API. The tabs link to the other list without filters, so switching resets them. The H1 is the
 * shared "Gallery" label; the menu item of the current list is active and names the breadcrumb.
 */
import 'server-only'

import { formatDate, mediaUrl } from '@/entities/content'
import { findChainBy, isCurrentNode, type PageNode } from '@/entities/page-node'
import { getGalleries, getVideos, type MediaListQuery } from '@/features/media/api/media.api'
import type { GalleryListItem, VideoItem } from '@/features/media/model/schemas'
import { youtubeId, youtubeThumbnail } from '@/features/media/model/youtube'
import { getPagesTree } from '@/features/pages/api/pages.api'
import { absolutePageUrl } from '@/server/page-url'
import { getT } from '@/shared/i18n/server'
import type { Locale } from '@/shared/i18n'
import { buildHref, dateParam, pageSchema, queryParam, type RawSearchParams } from '@/shared/lib/search-params'
import { hasListFilters, type ListFilterValues } from '@/widgets/list-filter'
import type { NewsCardItem } from '@/widgets/news-grid'
import { buildSectionShell, type SectionShellData } from '@/widgets/section-shell'

import { GALLERY_KINDS, GALLERY_LIST_PATH, GALLERY_PAGE_SIZE, GALLERY_TAB_LABEL_KEY, type GalleryKind } from './constants'

export type GalleryTab = { kind: GalleryKind; href: string; label: string; current: boolean }

export type MediaGalleryListData = {
  locale: Locale
  kind: GalleryKind
  title: string
  tabs: GalleryTab[]
  /** The list address without filters — form action, pagination base and "clear filters". */
  basePath: string
  filters: ListFilterValues
  hasFilters: boolean
  page: number
  pageSize: number
  total: number
  items: NewsCardItem[] | null
  error: boolean
  shell: SectionShellData
}

export const galleryListHref = (kind: GalleryKind, locale: Locale) => `/${locale}/${GALLERY_LIST_PATH[kind]}`
export const galleriesHref = (locale: Locale) => galleryListHref('photos', locale)
export const videosHref = (locale: Locale) => galleryListHref('videos', locale)

/** Name of the CMS menu item pointing at `href`, if the tree has one. */
export function menuTitle(tree: PageNode[], locale: Locale, href: string): string | null {
  return findChainBy(tree, (node) => isCurrentNode(node, locale, { href }))?.at(-1)?.title ?? null
}

/** Metadata of a list route: the tab label as title, language alternates. */
export function galleryListMetadata(kind: GalleryKind, locale: Locale) {
  return {
    title: getT(locale, 'media')(GALLERY_TAB_LABEL_KEY[kind]),
    alternates: { languages: { az: galleryListHref(kind, 'az'), en: galleryListHref(kind, 'en') } },
  }
}

function galleryCard(gallery: GalleryListItem, locale: Locale): NewsCardItem {
  return {
    key: String(gallery.id),
    href: `${galleriesHref(locale)}/${gallery.id}`,
    title: gallery.title ?? '',
    dateLabel: gallery.eventDate ? formatDate(gallery.eventDate, locale) : null,
    dateTime: gallery.eventDate,
    imageUrl: mediaUrl(gallery.coverUrl),
  }
}

function videoCard(video: VideoItem, locale: Locale): NewsCardItem {
  const id = youtubeId(video.youtubeUrl)
  return {
    key: String(video.id),
    href: `${videosHref(locale)}/${video.id}`,
    title: video.title ?? '',
    dateLabel: video.publishedAt ? formatDate(video.publishedAt, locale) : null,
    dateTime: video.publishedAt,
    imageUrl: id ? youtubeThumbnail(id) : null,
    imageExternal: true,
  }
}

async function fetchCards(kind: GalleryKind, locale: Locale, query: MediaListQuery) {
  if (kind === 'photos') {
    const list = await getGalleries(locale, query)
    return { total: list.total, items: list.items.map((g) => galleryCard(g, locale)) }
  }
  const list = await getVideos(locale, query)
  return { total: list.total, items: list.items.map((v) => videoCard(v, locale)) }
}

export async function loadMediaGalleryList(kind: GalleryKind, locale: Locale, searchParams: RawSearchParams): Promise<MediaGalleryListData> {
  const page = pageSchema.parse(searchParams.page)
  const filters: ListFilterValues = {
    q: queryParam.parse(searchParams.q),
    from: dateParam.parse(searchParams.from),
    to: dateParam.parse(searchParams.to),
  }
  const basePath = galleryListHref(kind, locale)
  const t = getT(locale, 'media')

  const [list, tree] = await Promise.allSettled([
    fetchCards(kind, locale, { page, pageSize: GALLERY_PAGE_SIZE, ...filters }),
    getPagesTree(locale),
  ])
  const pageTree = tree.status === 'fulfilled' ? tree.value : []
  const title = t('gallery.title')

  return {
    locale,
    kind,
    title,
    tabs: GALLERY_KINDS.map((tab) => ({
      kind: tab,
      href: galleryListHref(tab, locale),
      label: t(GALLERY_TAB_LABEL_KEY[tab]),
      current: tab === kind,
    })),
    basePath,
    filters,
    hasFilters: hasListFilters(filters),
    page,
    pageSize: GALLERY_PAGE_SIZE,
    total: list.status === 'fulfilled' ? list.value.total : 0,
    error: list.status === 'rejected',
    items: list.status === 'fulfilled' ? list.value.items : null,
    shell: buildSectionShell({
      section: 'media',
      tree: pageTree,
      locale,
      current: { href: basePath },
      // Shared links keep the filters, so the recipient sees the same list.
      pageUrl: await absolutePageUrl(buildHref(basePath, { ...filters, page })),
      pageTitle: menuTitle(pageTree, locale, basePath) ?? t(GALLERY_TAB_LABEL_KEY[kind]),
    }),
  }
}
