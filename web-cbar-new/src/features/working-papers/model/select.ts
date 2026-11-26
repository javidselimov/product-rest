/**
 * Working paper list selection (spec 054 FR-008, FR-009, research R3): the API returns every paper of the locale, and the
 * site filters, lists years and pages here. Pure functions, so the loader and the tests share them.
 */
import { foldForSearch } from '@/shared/lib/search-fold'

import { PAPER_NUMBER_DIGITS, WORKING_PAPER_KEY, WORKING_PAPERS_PAGE_SIZE } from './constants'
import type { WorkingPaperListItemDto } from './schemas'

export type PaperFilter = { q?: string; year?: number }

/** A list row with the address of the paper's page. */
export type PaperRow = WorkingPaperListItemDto & { href: string }

/** Papers whose title, authors or keywords contain `q` (case- and İ/ı-insensitive) and of `year`; the API order is kept. */
export function filterPapers<T extends WorkingPaperListItemDto>(papers: readonly T[], { q, year }: PaperFilter): T[] {
  const needle = q ? foldForSearch(q.trim()) : ''
  return papers.filter((paper) => {
    if (year !== undefined && paper.year !== year) return false
    if (!needle) return true
    return [paper.title, ...paper.authors, ...paper.keywords].some((text) => foldForSearch(text).includes(needle))
  })
}

/** Years that have papers, newest first. */
export function paperYears(papers: readonly WorkingPaperListItemDto[]): number[] {
  return [...new Set(papers.map((paper) => paper.year))].sort((a, b) => b - a)
}

export type PaperPage<T> = { items: T[]; page: number; total: number }

/** One page of `pageSize`; a page past the end shows the last page. */
export function paginate<T>(items: readonly T[], page: number, pageSize = WORKING_PAPERS_PAGE_SIZE): PaperPage<T> {
  const pages = Math.max(Math.ceil(items.length / pageSize), 1)
  const current = Math.min(Math.max(page, 1), pages)
  return { items: items.slice((current - 1) * pageSize, current * pageSize), page: current, total: items.length }
}

const pad = (number: number) => String(number).padStart(PAPER_NUMBER_DIGITS, '0')

/** `02-2025`. */
export function formatKey(number: number, year: number): string {
  return `${pad(number)}-${year}`
}

/** `02/2025`, as the site shows it. */
export function formatCode(number: number, year: number): string {
  return `${pad(number)}/${year}`
}

/** Number and year of an address key; `null` when the key is not `NN-YYYY`. */
export function parseKey(key: string): { number: number; year: number } | null {
  const match = WORKING_PAPER_KEY.exec(key)
  return match ? { number: Number(match[1]), year: Number(match[2]) } : null
}
