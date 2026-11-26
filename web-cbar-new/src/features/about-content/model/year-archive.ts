/**
 * Year → month → file archive of the consumer rights pages (spec 050 research R8, `contracts/cms-markup.md` §0, §2).
 *
 * The complaint indices (95, 96) and the infographics (93) keep one accordion per year and, inside it, one accordion
 * per month holding a media library link. The legacy import wraps the month accordions in `div`/`table`/`td`, the
 * editor keeps a one-cell table: wrappers are opened at any depth, so both forms read the same.
 */
import type { AttachmentFile } from '@/entities/content'
import { attrOf, parseBlocks, textOf, type HtmlNode } from '@/shared/lib/html-blocks'

import { ARCHIVE_WRAPPERS, ARCHIVE_YEAR, MEDIA_HREF, MONTHS_AZ, MONTHS_EN } from './constants'
import type { ArchiveFile, ArchiveMonth, ArchiveYear, YearArchive } from './types'

/** Lower case with the Azerbaijani dotted/dotless i folded together, for comparing typed labels. */
export function foldText(text: string): string {
  return text.trim().toLocaleLowerCase('az').replace(/ı/g, 'i').replace(/\s+/g, ' ')
}

const MONTH_INDEX = new Map<string, number>(
  [MONTHS_AZ, MONTHS_EN].flatMap((names) => names.map((name, i): [string, number] => [foldText(name), i + 1])),
)

/** 1–12 for a month name in az or en, otherwise `null`. */
export function monthNumber(label: string): number | null {
  return MONTH_INDEX.get(foldText(label)) ?? null
}

/** An accordion's summary text and its content HTML. */
export type Details = { summary: string; body: string }

/** Splits a `<details>` node into its summary text and the HTML after the summary. */
export function detailsOf(node: HtmlNode): Details | null {
  if (node.tag !== 'details') return null
  const children = parseBlocks(node.inner)
  if (!children) return null
  const summary = children.find((child) => child.tag === 'summary')
  if (!summary) return null
  const rest = children.filter((child) => child !== summary)
  const content = rest.length === 1 && rest[0]?.tag === 'div' ? rest[0].inner : rest.map((child) => child.outer).join('')
  return { summary: textOf(summary.inner), body: content }
}

/** Accordions in `html`, opening wrapper elements (never another accordion) at any depth. */
export function detailsIn(html: string): Details[] {
  const nodes = parseBlocks(html)
  if (!nodes) return []
  return nodes.flatMap((node) => {
    if (node.tag === 'details') {
      const details = detailsOf(node)
      return details ? [details] : []
    }
    return ARCHIVE_WRAPPERS.has(node.tag) ? detailsIn(node.inner) : []
  })
}

/**
 * The page's top-level nodes with wrapping `div`s opened: the legacy import puts the whole text, or each accordion, in a
 * `div` of its own. The editor keeps no `div`, so opening them loses nothing.
 */
export function topNodes(nodes: HtmlNode[]): HtmlNode[] {
  return nodes.flatMap((node): HtmlNode[] => {
    if (node.tag === '#text') return textOf(node.outer) === '' ? [] : [node]
    if (node.tag !== 'div') return [node]
    const inner = parseBlocks(node.inner)
    return inner ? topNodes(inner) : [node]
  })
}

/** The file of a `/media/{id}` link: the page's asset when listed, otherwise the link text with no type and no size. */
export function archiveFile(id: number, linkText: string, files: readonly AttachmentFile[]): ArchiveFile {
  const asset = files.find((file) => file.id === id)
  return {
    id,
    title: asset?.title || linkText || String(id),
    url: asset?.url ?? `/media/${id}`,
    mimeType: asset?.mimeType ?? null,
    ...(asset ? { sizeBytes: asset.sizeBytes } : {}),
  }
}

/** The media library links of `html`, in order: id and link text. */
export function mediaLinksIn(html: string): { id: number; text: string }[] {
  const links: { id: number; text: string }[] = []
  for (const [, attrs = '', inner = ''] of html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)) {
    if (attrOf(attrs, 'data-media-link') == null) continue
    const match = MEDIA_HREF.exec(attrOf(attrs, 'href') ?? '')
    if (match) links.push({ id: Number(match[1]), text: textOf(inner) })
  }
  return links
}

function archiveYear(year: number, body: string, files: readonly AttachmentFile[]): ArchiveYear {
  const months: ArchiveMonth[] = []
  for (const details of detailsIn(body)) {
    const [link] = mediaLinksIn(details.body)
    if (link) months.push({ label: details.summary, month: monthNumber(details.summary), file: archiveFile(link.id, link.text, files) })
  }
  // Newest month first; a label that is not a month keeps the editor's place at the end.
  const known = months.filter((m) => m.month != null).sort((a, b) => (b.month ?? 0) - (a.month ?? 0))
  return { year, months: [...known, ...months.filter((m) => m.month == null)] }
}

export type ParsedArchive = {
  archive: YearArchive
  /** Page text before the first year. */
  before: HtmlNode[]
  /** Page text after the first year that is not a year (the complaint methodology). */
  after: HtmlNode[]
}

/** `null` when the page has no year accordion: the caller shows it as ordinary content. */
export function parseYearArchive(nodes: HtmlNode[], files: readonly AttachmentFile[] = []): ParsedArchive | null {
  const before: HtmlNode[] = []
  const after: HtmlNode[] = []
  const years: ArchiveYear[] = []

  for (const node of topNodes(nodes)) {
    const details = detailsOf(node)
    if (details && ARCHIVE_YEAR.test(details.summary)) {
      years.push(archiveYear(Number(details.summary), details.body, files))
      continue
    }
    if (years.length === 0) before.push(node)
    else after.push(node)
  }
  if (years.length === 0) return null

  years.sort((a, b) => b.year - a.year)
  const newest = years.find((year) => year.months.length > 0)
  const latestMonth = newest?.months[0]
  return {
    archive: { years, latest: newest && latestMonth ? { year: newest.year, month: latestMonth } : null },
    before,
    after,
  }
}
