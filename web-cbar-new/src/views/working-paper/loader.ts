/**
 * Working paper page (spec 054 FR-010, FR-011, research R4, R6): `/{locale}/{WORKING_PAPERS_SLUG}/{NN-YYYY}`. The section
 * template keeps "İşçi məqalələri" current in the left menu and adds the paper's title as the last breadcrumb level.
 * `cache()` shares the request between `generateMetadata` and the page. `null`: the key is malformed or the paper is not
 * visible in the locale (404).
 */
import 'server-only'

import { cache } from 'react'

import { excerpt } from '@/entities/content'
import { isWorkingPapersSlug, WORKING_PAPERS_SLUG, type PageNode } from '@/entities/page-node'
import type { ArchiveFile } from '@/features/about-content/model/types'
import { getPagesTree } from '@/features/pages/api/pages.api'
import { getWorkingPaper } from '@/features/working-papers/api/working-papers.api'
import { PAPER_DESCRIPTION_LENGTH, WORKING_PAPER_KEY } from '@/features/working-papers/model/constants'
import type { WorkingPaperDetailDto } from '@/features/working-papers/model/schemas'
import { parseKey } from '@/features/working-papers/model/select'
import { absolutePageUrl } from '@/server/page-url'
import type { Locale } from '@/shared/i18n'
import { safeDecodeURIComponent } from '@/shared/lib/uri'
import { buildSectionShell, type SectionShellData } from '@/widgets/section-shell'

export type WorkingPaperViewData = {
  locale: Locale
  paper: WorkingPaperDetailDto
  /** The PDF as a document card; the card's name is the paper's title. */
  file: ArchiveFile | null
  listHref: string
  /** Meta description: the start of the abstract, else the title. */
  description: string
  shell: SectionShellData
}

/** The key of a working paper address (research R4): the list page's slug in either locale, then `NN-YYYY`; otherwise `null`. */
export function paperKeyOf(slug: string[]): string | null {
  const last = safeDecodeURIComponent(slug.at(-1) ?? '')
  const parent = safeDecodeURIComponent(slug[slug.length - 2] ?? '')
  return slug.length >= 2 && isWorkingPapersSlug(parent) && WORKING_PAPER_KEY.test(last) ? last : null
}

export const loadWorkingPaperPage = cache(async (locale: Locale, key: string): Promise<WorkingPaperViewData | null> => {
  if (!parseKey(key)) return null
  const [paper, tree] = await Promise.all([getWorkingPaper(key, locale), getPagesTree(locale).catch((): PageNode[] => [])])
  if (!paper) return null

  const listHref = `/${locale}/${WORKING_PAPERS_SLUG[locale]}`
  return {
    locale,
    paper,
    file: paper.file
      ? { id: paper.file.mediaId, title: paper.title, url: paper.file.url, mimeType: paper.file.mimeType, sizeBytes: paper.file.sizeBytes }
      : null,
    listHref,
    description: excerpt(paper.abstract ?? paper.title, PAPER_DESCRIPTION_LENGTH),
    shell: buildSectionShell({
      section: 'publications',
      tree,
      locale,
      current: { slug: WORKING_PAPERS_SLUG[locale] },
      pageUrl: await absolutePageUrl(`${listHref}/${key}`),
      pageTitle: paper.title,
      trail: paper.title,
    }),
  }
})

/** What a working paper address renders: the paper, a redirect, or a 404. */
export type WorkingPaperRoute =
  | { kind: 'page'; data: WorkingPaperViewData }
  | { kind: 'redirect'; href: string }
  | { kind: 'not-found' }

/**
 * The route of a working paper address (research R4); `null` when `slug` is not one. The language switcher keeps the
 * other locale's list slug (`/en/isci-meqaleler-silsilesi/02-2025`): that goes to this locale's address, or to this
 * locale's list when the paper has no translation here.
 */
export async function resolveWorkingPaperRoute(locale: Locale, slug: string[]): Promise<WorkingPaperRoute | null> {
  const key = paperKeyOf(slug)
  if (!key) return null
  const paper = await loadWorkingPaperPage(locale, key)
  const listHref = `/${locale}/${WORKING_PAPERS_SLUG[locale]}`
  if (safeDecodeURIComponent(slug[slug.length - 2] ?? '') !== WORKING_PAPERS_SLUG[locale]) {
    return { kind: 'redirect', href: paper ? `${listHref}/${key}` : listHref }
  }
  return paper ? { kind: 'page', data: paper } : { kind: 'not-found' }
}

