/**
 * Statistics of citizens' appeals (spec 050 research R9, `contracts/cms-markup.md` §4): page 94, with the infographics
 * page (93) as its companion.
 *
 * Each top-level accordion is a channel, each accordion inside it a year holding one table. A table whose first cell is
 * "Aylar"/"Months" is the months × sectors form (rows per month, a "Yekun"/"Total" row, a "Cəmi"/"Total" column); any
 * other table (the mobile reception's cities × months) is shown as typed. The summary is the latest month every
 * months × sectors channel has filled (clarify Q3).
 *
 * Spec 052: when the infographics series has monthly reports, the infographics archive comes from them and the
 * companion page is not read.
 */
import type { AttachmentFile } from '@/entities/content'
import type { Locale } from '@/shared/i18n'
import { parseBlocks, textOf, type HtmlNode } from '@/shared/lib/html-blocks'

import {
  ARCHIVE_WRAPPERS,
  ARCHIVE_YEAR,
  MONTHS_IN_YEAR,
  REPORT_SERIES,
  STAT_CHANNEL_AFFIXES,
  STAT_COUNT,
  STAT_COUNT_SEPARATORS,
  STAT_MONTHS_HEADERS,
  STAT_TOTAL_COLUMN,
  STAT_TOTAL_ROW,
} from './constants'
import { outerOf } from './markup'
import { archiveFromReports } from './report-archive'
import type { AppealStatisticsBlock, ReportSeries, StatChannel, StatRow, StatSummary, StatTable, YearArchive } from './types'
import { detailsOf, foldText, monthNumber, parseYearArchive, topNodes, type Details } from './year-archive'

/** A count cell as a number; empty, "-" or text is `null`. */
export function parseCount(text: string): number | null {
  const digits = text.replace(STAT_COUNT_SEPARATORS, '')
  return STAT_COUNT.test(digits) ? Number(digits) : null
}

/** "Yazılı müraciətlər üzrə statistika" → "Yazılı müraciətlər"; "Statistics of written appeals" → "Written appeals". */
export function channelLabel(title: string): string {
  const label = STAT_CHANNEL_AFFIXES.reduce((text, affix) => text.replace(affix, ''), title.trim()).trim() || title.trim()
  // Only the en prefix leaves a lower-case start; the az titles keep theirs, so no Azerbaijani "i" → "İ" here.
  return label.charAt(0).toUpperCase() + label.slice(1)
}

/** Every row's cell texts, `th` rows included (the header may be either). */
function rowsOf(html: string): string[][] | null {
  const nodes = parseBlocks(html)
  if (!nodes) return null
  return nodes.flatMap((node): string[][] => {
    if (node.tag === 'tr') {
      const cells = (parseBlocks(node.inner) ?? []).filter((cell) => cell.tag === 'td' || cell.tag === 'th')
      return [cells.map((cell) => textOf(cell.inner))]
    }
    return node.tag === 'tbody' || node.tag === 'thead' ? (rowsOf(node.inner) ?? []) : []
  })
}

/** The first table in `html`, opening wrapper elements. */
function firstTable(html: string): HtmlNode | null {
  for (const node of parseBlocks(html) ?? []) {
    if (node.tag === 'table') return node
    if (node.tag === 'div' || node.tag === 'p') {
      const inner = firstTable(node.inner)
      if (inner) return inner
    }
  }
  return null
}

function statRow(cells: string[]): StatRow {
  const [label = '', ...values] = cells
  return { label, month: monthNumber(label), cells: values.map(parseCount) }
}

export function parseStatTable(table: HtmlNode): StatTable | null {
  const rows = rowsOf(table.inner)?.filter((row) => row.some((cell) => cell !== ''))
  const [head, ...body] = rows ?? []
  if (!head) return null
  if (!STAT_MONTHS_HEADERS.has(foldText(head[0] ?? ''))) return { form: 'generic', head, rows: body }

  const last = body.at(-1)
  const totalRow = last && STAT_TOTAL_ROW.has(foldText(last[0] ?? '')) ? statRow(last) : null
  const totalColumn = head.slice(1).findIndex((cell) => STAT_TOTAL_COLUMN.has(foldText(cell)))
  return {
    form: 'months',
    head,
    rows: (totalRow ? body.slice(0, -1) : body).map(statRow),
    totalRow,
    totalIndex: totalColumn < 0 ? null : totalColumn,
  }
}

const DETAILS_OPEN = '<details'

const isDetails = (item: Details | HtmlNode): item is Details => 'summary' in item

/**
 * The channel's year accordions and data tables in document order. Wrappers (the editor's one-cell table, the legacy
 * `div`s) are opened; a table holding no accordion is a data table.
 */
function yearSequence(html: string): (Details | HtmlNode)[] {
  return (parseBlocks(html) ?? []).flatMap((node): (Details | HtmlNode)[] => {
    if (node.tag === 'details') {
      const details = detailsOf(node)
      return details ? [details] : []
    }
    if (node.tag === 'table' && !node.inner.includes(DETAILS_OPEN)) return [node]
    return ARCHIVE_WRAPPERS.has(node.tag) ? yearSequence(node.inner) : []
  })
}

function parseChannel(index: number, title: string, body: string): StatChannel {
  const years: StatChannel['years'] = []
  const sequence = yearSequence(body)
  sequence.forEach((item, i) => {
    if (!isDetails(item) || !ARCHIVE_YEAR.test(item.summary)) return
    // The legacy en text leaves some year accordions empty with their table right after them.
    const next = sequence[i + 1]
    const tableNode = firstTable(item.body) ?? (next && !isDetails(next) ? next : null)
    const table = tableNode ? parseStatTable(tableNode) : null
    if (table) years.push({ year: Number(item.summary), table })
  })
  years.sort((a, b) => b.year - a.year)
  return { index, label: channelLabel(title), years }
}

const isFilled = (row: StatRow) => row.month != null && row.cells.length > 0 && row.cells.every((cell) => cell != null)

/**
 * Year × 12 + month of a channel's latest filled row, `null` without one. A newest year the editor has added before its
 * first month is filled is passed over, so an empty new table does not hide the summary.
 */
function latestFilled(channel: StatChannel): number | null {
  for (const { year, table } of channel.years) {
    if (table.form !== 'months') continue
    const filled = table.rows.filter(isFilled).map((row) => row.month ?? 0)
    if (filled.length > 0) return year * MONTHS_IN_YEAR + Math.max(...filled)
  }
  return null
}

/** The summary of the latest month every months × sectors channel has filled; `null` without one. */
export function buildSummary(channels: StatChannel[]): StatSummary | null {
  const monthly = channels.filter((channel) => channel.years[0]?.table.form === 'months')
  if (monthly.length === 0) return null
  const latest = monthly.map(latestFilled)
  if (latest.some((key) => key == null)) return null
  const key = Math.min(...latest.map((k) => k ?? 0))
  const year = Math.floor((key - 1) / MONTHS_IN_YEAR)
  const month = key - year * MONTHS_IN_YEAR

  let monthLabel = ''
  const cards: StatSummary['cards'] = []
  for (const channel of monthly) {
    const table = channel.years.find((y) => y.year === year)?.table
    const row = table?.form === 'months' ? table.rows.find((r) => r.month === month && isFilled(r)) : undefined
    if (table?.form !== 'months' || !row) return null
    monthLabel ||= row.label
    const sectors = table.head
      .slice(1)
      .map((sector, i) => ({ sector, value: row.cells[i] }))
      .filter((cell, i): cell is { sector: string; value: number } => i !== table.totalIndex && cell.value != null)
    const total = table.totalIndex == null ? null : row.cells[table.totalIndex]
    cards.push({ channel: channel.label, total: total ?? sectors.reduce((sum, s) => sum + s.value, 0), sectors })
  }
  return { year, monthLabel, cards }
}

export type StatisticsCompanion = { html: string; files: AttachmentFile[] } | null | undefined

function infographicsArchive(companion: StatisticsCompanion, reports: readonly ReportSeries[], locale: Locale): YearArchive | null {
  const series = reports.find((s) => s.key === REPORT_SERIES.INFOGRAPHICS && s.reports.length > 0)
  if (series) return archiveFromReports(series, locale)
  const companionNodes = companion ? parseBlocks(companion.html) : null
  return companion && companionNodes ? (parseYearArchive(companionNodes, companion.files)?.archive ?? null) : null
}

/** `null` when the page has no channel accordion: it stays ordinary content. */
export function parseAppealStatistics(
  nodes: HtmlNode[],
  companion?: StatisticsCompanion,
  reports: readonly ReportSeries[] = [],
  locale: Locale = 'az',
): AppealStatisticsBlock | null {
  const intro: HtmlNode[] = []
  const rest: HtmlNode[] = []
  const bodies: { title: string; body: string }[] = []
  for (const node of topNodes(nodes)) {
    const details = detailsOf(node)
    const last = bodies.at(-1)
    if (details && !ARCHIVE_YEAR.test(details.summary)) bodies.push({ title: details.summary, body: details.body })
    // The legacy en text closes a channel early: the years and tables after it are still that channel's.
    else if (last && (details != null || node.tag === 'table')) last.body += node.outer
    else if (last) rest.push(node)
    else intro.push(node)
  }
  if (bodies.length === 0) return null
  const channels = bodies.map((channel, i) => parseChannel(i + 1, channel.title, channel.body))

  const infographics = infographicsArchive(companion, reports, locale)
  return {
    kind: 'appeal-statistics',
    introHtml: outerOf(intro),
    summary: buildSummary(channels),
    channels,
    restHtml: outerOf(rest),
    infographics,
  }
}
