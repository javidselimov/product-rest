/**
 * News / announcements list (spec 029 US1–US2, data-model §4.2).
 *
 * URL: `type` (1 | 2, missing = news), `q`, `from`, `to` (`YYYY-MM-DD`), `page`. Invalid values
 * are dropped, never sent to the API. The page sits in the Media section shell; the H1 is the
 * name of the CMS menu item that links to this list, so heading, breadcrumb and menu agree.
 */
import 'server-only'

import { formatDate, mediaUrl } from '@/entities/content'
import { findChainBy, isCurrentNode, type PageNode } from '@/entities/page-node'
import { getPressReleases } from '@/features/press-releases/api/press-releases.api'
import { pressReleasesListHref } from '@/features/press-releases/model/routes'
import { PRESS_RELEASE_TYPES, type PressReleaseType } from '@/features/press-releases/model/schemas'
import { getPagesTree } from '@/features/pages/api/pages.api'
import { absolutePageUrl } from '@/server/page-url'
import { getT } from '@/shared/i18n/server'
import type { Locale } from '@/shared/i18n'
import { buildHref, dateParam, enumParam, pageSchema, queryParam, type RawSearchParams } from '@/shared/lib/search-params'
import { hasListFilters, type ListFilterValues } from '@/widgets/list-filter'
import type { NewsCardItem } from '@/widgets/news-grid'
import { buildSectionShell, type SectionShellData } from '@/widgets/section-shell'

import { DEFAULT_PRESS_RELEASE_TYPE, NEWS_PAGE_SIZE, PRESS_RELEASE_LABEL_KEYS } from './constants'

export type PressReleasesViewData = {
  locale: Locale
  type: PressReleaseType
  title: string
  /** `/{locale}/press-releases` — the form action and the pagination base. */
  basePath: string
  /** Typed list address without filters — the "clear filters" target. */
  clearHref: string
  filters: ListFilterValues
  hasFilters: boolean
  page: number
  pageSize: number
  total: number
  items: NewsCardItem[] | null
  error: boolean
  shell: SectionShellData
}

const typeParam = enumParam(PRESS_RELEASE_TYPES)

/** Name of the CMS menu item pointing at `href`, if the tree has one. */
function menuTitle(tree: PageNode[], locale: Locale, href: string): string | null {
  return findChainBy(tree, (node) => isCurrentNode(node, locale, { href }))?.at(-1)?.title ?? null
}

/** The site's own label for the list, used when the CMS tree has no item for it. */
export function pressReleasesLabel(locale: Locale, type: PressReleaseType): string {
  return getT(locale, 'content')(PRESS_RELEASE_LABEL_KEYS[type])
}

/** Metadata of the list route: title by type, language alternates with the type kept. */
export function pressReleasesMetadata(locale: Locale, searchParams: RawSearchParams) {
  const type = typeParam.parse(searchParams.type) ?? DEFAULT_PRESS_RELEASE_TYPE
  return {
    title: pressReleasesLabel(locale, type),
    alternates: { languages: { az: pressReleasesListHref('az', type), en: pressReleasesListHref('en', type) } },
  }
}

export async function loadPressReleases(locale: Locale, searchParams: RawSearchParams): Promise<PressReleasesViewData> {
  const type = typeParam.parse(searchParams.type) ?? DEFAULT_PRESS_RELEASE_TYPE
  const page = pageSchema.parse(searchParams.page)
  const filters: ListFilterValues = {
    q: queryParam.parse(searchParams.q),
    from: dateParam.parse(searchParams.from),
    to: dateParam.parse(searchParams.to),
  }
  const href = pressReleasesListHref(locale, type)

  const [list, tree] = await Promise.allSettled([
    getPressReleases(locale, { page, pageSize: NEWS_PAGE_SIZE, type, ...filters }),
    getPagesTree(locale),
  ])
  const pageTree = tree.status === 'fulfilled' ? tree.value : []
  const title = menuTitle(pageTree, locale, href) ?? pressReleasesLabel(locale, type)

  return {
    locale,
    type,
    title,
    basePath: `/${locale}/press-releases`,
    clearHref: href,
    filters,
    hasFilters: hasListFilters(filters),
    page,
    pageSize: NEWS_PAGE_SIZE,
    total: list.status === 'fulfilled' ? list.value.total : 0,
    error: list.status === 'rejected',
    items:
      list.status === 'fulfilled'
        ? list.value.items.map((item) => ({
            key: String(item.id),
            href: `/${locale}/press-releases/${item.slug}`,
            title: item.title,
            dateLabel: formatDate(item.publishedAt, locale),
            dateTime: item.publishedAt,
            imageUrl: mediaUrl(item.imageUrl),
          }))
        : null,
    shell: buildSectionShell({
      section: 'media',
      tree: pageTree,
      locale,
      current: { href },
      // Shared links keep the filters, so the recipient sees the same list.
      pageUrl: await absolutePageUrl(buildHref(`/${locale}/press-releases`, { type, ...filters, page })),
      pageTitle: title,
    }),
  }
}
