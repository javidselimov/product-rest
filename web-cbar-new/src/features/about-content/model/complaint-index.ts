/**
 * Complaint indices (spec 050 research R3, R4, R10; `contracts/cms-markup.md` §3): the bank page (95) and, as its
 * second tab, the insurance page (96, read by the loader as the companion page).
 *
 * Each page is a year → month archive. After it, the first `h2` opens the methodology: a three-paragraph quote is the
 * formula, a "Qeyd:"/"Note:" paragraph and what follows are small print. Text between the archive and the `h2` stays.
 *
 * Spec 052: a tab whose series has monthly reports takes its archive from them. The page text then gives only the intro
 * and the methodology; a legacy archive still in it is left out, and a page without one keeps its tab.
 */
import type { AttachmentFile } from '@/entities/content'
import type { Locale } from '@/shared/i18n'
import { parseBlocks, textOf, type HtmlNode } from '@/shared/lib/html-blocks'

import { COMPLAINT_TAB, FORMULA_PARAGRAPHS, NOTE_PREFIX, REPORT_SERIES } from './constants'
import { meaningful, outerOf } from './markup'
import { archiveFromReports } from './report-archive'
import type { ComplaintIndexBlock, ComplaintTab, ComplaintTabKey, Methodology, MethodologyPart, ReportSeries } from './types'
import { parseYearArchive, topNodes } from './year-archive'

function formulaOf(node: HtmlNode): MethodologyPart | null {
  if (node.tag !== 'blockquote') return null
  const paragraphs = meaningful(parseBlocks(node.inner) ?? []).filter((child) => child.tag !== '#text' || textOf(child.outer) !== '')
  if (paragraphs.length !== FORMULA_PARAGRAPHS || paragraphs.some((p) => p.tag !== 'p')) return null
  const [left = '', numerator = '', denominator = ''] = paragraphs.map((p) => textOf(p.inner))
  return { type: 'formula', left, numerator, denominator }
}

function methodologyOf(nodes: HtmlNode[]): { methodology: Methodology | null; rest: HtmlNode[] } {
  const start = nodes.findIndex((node) => node.tag === 'h2' && textOf(node.inner))
  if (start < 0) return { methodology: null, rest: nodes }

  const parts: MethodologyPart[] = []
  let inNote = false
  for (const node of nodes.slice(start + 1)) {
    const formula = inNote ? null : formulaOf(node)
    if (formula) {
      parts.push(formula)
      continue
    }
    if (node.tag === 'p' && NOTE_PREFIX.test(textOf(node.inner))) inNote = true
    const type = inNote ? 'note' : 'html'
    const last = parts.at(-1)
    if (last?.type === type) last.html += node.outer
    else parts.push({ type, html: node.outer })
  }
  return { methodology: { title: textOf(nodes[start]?.inner ?? ''), parts }, rest: nodes.slice(0, start) }
}

function parseTab(key: ComplaintTabKey, nodes: HtmlNode[], files: readonly AttachmentFile[]): ComplaintTab | null {
  const parsed = parseYearArchive(nodes, files)
  if (!parsed) return null
  const { methodology, rest } = methodologyOf(parsed.after)
  return { key, archive: parsed.archive, introHtml: outerOf(parsed.before), restHtml: outerOf(rest), methodology }
}

/** A tab whose archive is the series' reports: the intro and the methodology from the page text, around a legacy archive. */
function tabFromReports(key: ComplaintTabKey, nodes: HtmlNode[], series: ReportSeries, locale: Locale): ComplaintTab {
  const legacy = parseYearArchive(nodes)
  const { methodology, rest } = methodologyOf(legacy ? legacy.after : topNodes(nodes))
  return {
    key,
    archive: archiveFromReports(series, locale),
    introHtml: outerOf(legacy ? legacy.before : rest),
    restHtml: legacy ? outerOf(rest) : '',
    methodology,
  }
}

export type ComplaintCompanion = { html: string; files: AttachmentFile[] } | null | undefined

/**
 * `null` when the bank page has neither reports nor a year archive: it stays ordinary content. `reports` are the series
 * with a report in the visitor's `locale` (spec 052).
 */
export function parseComplaintIndex(
  nodes: HtmlNode[],
  files: readonly AttachmentFile[] = [],
  companion?: ComplaintCompanion,
  reports: readonly ReportSeries[] = [],
  locale: Locale = 'az',
): ComplaintIndexBlock | null {
  const seriesOf = (key: string) => reports.find((series) => series.key === key && series.reports.length > 0)
  const bankSeries = seriesOf(REPORT_SERIES.BANK)
  const bank = bankSeries ? tabFromReports(COMPLAINT_TAB.BANK, nodes, bankSeries, locale) : parseTab(COMPLAINT_TAB.BANK, nodes, files)
  if (!bank) return null

  const companionNodes = companion ? (parseBlocks(companion.html) ?? []) : []
  const insuranceSeries = seriesOf(REPORT_SERIES.INSURANCE)
  const insurance = insuranceSeries
    ? tabFromReports(COMPLAINT_TAB.INSURANCE, companionNodes, insuranceSeries, locale)
    : companion
      ? parseTab(COMPLAINT_TAB.INSURANCE, companionNodes, companion.files)
      : null
  return { kind: 'complaint-index', tabs: insurance ? [bank, insurance] : [bank] }
}
