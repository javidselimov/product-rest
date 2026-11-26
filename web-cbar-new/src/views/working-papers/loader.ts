/**
 * Working paper list (spec 054 US1, research R4, R5). The CMS page (`WORKING_PAPERS_SLUG`) gives the title, the address,
 * its place in the section tree and the intro (its text before the first accordion: the legacy year accordions after it
 * are the old link list). The papers come from the content type in one response and are searched, filtered by year and
 * paged here. `null` means the route shows the CMS page as before — the page does not exist in the locale, or there are
 * no papers in the locale, or the API is unreachable — so the legacy list stays reachable (FR-013).
 */
import 'server-only'

import type { PageNode } from '@/entities/page-node'
import { splitAtFirstDetails } from '@/features/about-content/model/split-details'
import { getPage, getPagesTree } from '@/features/pages/api/pages.api'
import { getWorkingPapers } from '@/features/working-papers/api/working-papers.api'
import { WORKING_PAPERS_PAGE_SIZE } from '@/features/working-papers/model/constants'
import { filterPapers, paginate, paperYears, type PaperRow } from '@/features/working-papers/model/select'
import { absolutePageUrl } from '@/server/page-url'
import { QUERY_PARAM } from '@/shared/constants/query-params'
import type { Locale } from '@/shared/i18n'
import { prepareCmsHtml } from '@/shared/lib/cms-html'
import { buildHref, pageSchema, queryParam, yearParam, type RawSearchParams } from '@/shared/lib/search-params'
import { buildSectionShell, type SectionShellData } from '@/widgets/section-shell'

export type WorkingPapersViewData = {
  locale: Locale
  title: string
  introHtml: string
  /** The page's own address: the form's action and the base of every link. */
  basePath: string
  q: string
  year: number | undefined
  /** Years with papers in the locale, newest first. */
  years: number[]
  rows: PaperRow[]
  page: number
  total: number
  pageSize: number
  shell: SectionShellData
}

export async function loadWorkingPapersPage(locale: Locale, slug: string, searchParams: RawSearchParams): Promise<WorkingPapersViewData | null> {
  const q = queryParam.parse(searchParams[QUERY_PARAM.QUERY])
  const year = yearParam.parse(searchParams[QUERY_PARAM.YEAR])
  const requestedPage = pageSchema.parse(searchParams[QUERY_PARAM.PAGE])

  const [page, papers, tree] = await Promise.allSettled([getPage(locale, slug), getWorkingPapers(locale), getPagesTree(locale)])
  if (page.status !== 'fulfilled' || !page.value || papers.status !== 'fulfilled' || papers.value.length === 0) return null

  const basePath = `/${locale}/${page.value.slug}`
  const matching = filterPapers(papers.value, { q, year })
  const { items, page: current, total } = paginate(matching, requestedPage)
  const title = page.value.title

  return {
    locale,
    title,
    introHtml: prepareCmsHtml(splitAtFirstDetails(page.value.content ?? '').before),
    basePath,
    q,
    year,
    years: paperYears(papers.value),
    rows: items.map((paper) => ({ ...paper, href: `${basePath}/${paper.key}` })),
    page: current,
    total,
    pageSize: WORKING_PAPERS_PAGE_SIZE,
    shell: buildSectionShell({
      section: 'publications',
      tree: tree.status === 'fulfilled' ? tree.value : ([] as PageNode[]),
      locale,
      current: { slug: page.value.slug },
      // Shared links keep the search, the year and the page, so the recipient sees the same rows.
      pageUrl: await absolutePageUrl(buildHref(basePath, { q, year, page: current })),
      pageTitle: title,
    }),
  }
}
