/**
 * CMS HTML → "About us" blocks (spec 024 FR-006…FR-008, `contracts/cms-markup.md`).
 *
 * The input is `prepareCmsHtml` output: sanitising happens once, before splitting (research R4).
 * The rules look only at top-level blocks and are recognised whole or not at all: an unrecognised
 * block stays in place as ordinary content (`html`), no text is dropped.
 */
import type { AttachmentFile } from '@/entities/content'
import type { Locale } from '@/shared/i18n'
import { attrOf, parseBlocks, textOf, type HtmlNode } from '@/shared/lib/html-blocks'

import { parseAppealStatistics } from './appeal-statistics'
import { parseBrandLogos } from './brand-logos'
import { parseComplaintIndex } from './complaint-index'
import { IMG_TAG_OPEN, MAX_DATE_CARDS, TALL_LAYOUT_IMAGES } from './constants'
import { parseConsumerDocuments } from './consumer-documents'
import { parseDocumentList } from './document-list'
import { parseFileArchive } from './file-archive'
import { parseConsumerText } from './consumer-text'
import { parseCsrProjects } from './csr-projects'
import { parseFinancialLiteracy } from './financial-literacy'
import { parseIfiOrganizations } from './ifi-organizations'
import { parseLiteracyPlatform } from './literacy-platform'
import { headingInner, imagesIn, isImageParagraph, outerOf, safeImageSrc } from './markup'
import { parseMediaRequests } from './media-requests'
import { parseMemberships } from './memberships'
import { parseMemorandums } from './memorandums'
import { tableRows } from './table-rows'
import type {
  AboutBlock,
  AboutImage,
  AboutLayoutKind,
  CsrProject,
  HistoryYear,
  IfiOrganization,
  Memorandum,
  PhotoLayout,
  ReportSeries,
  TimelineEvent,
  ValueItem,
} from './types'

// ── Shared helpers ───────────────────────────────────────────────────────────

/** Collects consecutive ordinary content into one `html` block. */
class BlockList {
  readonly blocks: AboutBlock[] = []

  html(html: string) {
    if (!html.trim()) return
    const last = this.blocks.at(-1)
    if (last?.kind === 'html') last.html += html
    else this.blocks.push({ kind: 'html', html })
  }

  push(block: AboutBlock) {
    this.blocks.push(block)
  }
}

// ── about-main (contract §2) ────────────────────────────────────────────────

function dateCards(table: HtmlNode): AboutBlock | null {
  const rows = tableRows(table)
  if (!rows || rows.length === 0 || rows.length > MAX_DATE_CARDS) return null
  const cards: { date: string; html: string }[] = []
  for (const cells of rows) {
    const [dateCell, textCell] = cells
    if (cells.length !== 2 || !dateCell || !textCell) return null
    const date = textOf(dateCell.inner)
    if (!date) return null
    cards.push({ date, html: textCell.inner })
  }
  return { kind: 'date-cards', cards }
}

function highlight(node: HtmlNode): AboutBlock {
  const children = parseBlocks(node.inner)
  const [first, ...rest] = children ?? []
  const title = first ? headingInner(first) : null
  return title != null
    ? { kind: 'highlight', title: textOf(title), html: outerOf(rest) }
    : { kind: 'highlight', title: null, html: node.inner }
}

const isAccordion = (node: HtmlNode) => node.tag === 'details' && attrOf(node.attrs, 'data-accordion') != null

/** A run of accordions; the first one renders open (Figma `1186:14901`). */
function accordionGroup(nodes: HtmlNode[]): AboutBlock {
  const [first, ...rest] = nodes
  const opened = first && attrOf(first.attrs, 'open') == null ? first.outer.replace(/^<details\b/i, '<details open') : (first?.outer ?? '')
  return { kind: 'accordion-group', html: opened + outerOf(rest) }
}

function parseAboutMain(nodes: HtmlNode[]): AboutBlock[] {
  const list = new BlockList()
  let tableSeen = false
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]!
    if (node.tag === 'table' && !tableSeen) {
      tableSeen = true
      const cards = dateCards(node)
      if (cards) list.push(cards)
      else list.html(node.outer)
    } else if (node.tag === 'blockquote') {
      list.push(highlight(node))
    } else if (isAccordion(node)) {
      let end = i
      while (end + 1 < nodes.length && isAccordion(nodes[end + 1]!)) end++
      list.push(accordionGroup(nodes.slice(i, end + 1)))
      i = end
    } else {
      list.html(node.outer)
    }
  }
  return list.blocks
}

// ── mission (contract §4) ───────────────────────────────────────────────────

function valueItem(heading: HtmlNode, body: HtmlNode[]): ValueItem {
  const iconIndex = body.findIndex(isImageParagraph)
  const icon = iconIndex >= 0 ? (imagesIn(body[iconIndex]!.inner)[0] ?? null) : null
  const rest = iconIndex >= 0 ? body.filter((_, i) => i !== iconIndex) : body
  return { title: textOf(headingInner(heading) ?? ''), icon, html: outerOf(rest) }
}

function parseMission(nodes: HtmlNode[]): AboutBlock[] {
  const list = new BlockList()
  const bannerIndex = nodes.findIndex((n) => n.tag === 'blockquote')
  const banner = bannerIndex >= 0 ? nodes[bannerIndex]! : null

  // Content before the banner stays ordinary.
  if (banner) {
    list.html(outerOf(nodes.slice(0, bannerIndex)))
    list.push({ kind: 'mission', html: banner.inner })
  }

  const rest = banner ? nodes.slice(bannerIndex + 1) : nodes
  const items: ValueItem[] = []
  let heading: HtmlNode | null = null
  let body: HtmlNode[] = []
  const flush = () => {
    if (heading) items.push(valueItem(heading, body))
    heading = null
    body = []
  }

  for (const node of rest) {
    if (headingInner(node) != null) {
      flush()
      heading = node
    } else if (heading) {
      body.push(node)
    } else {
      list.html(node.outer)
    }
  }
  flush()
  if (items.length > 0) list.push({ kind: 'values', items })
  return list.blocks
}

// ── history (contract §3) ───────────────────────────────────────────────────

const YEAR = /(?<!\d)([12]\d{3})(?!\d)/

// The editor's layout marker: the paragraph's whole text is `[foto: tall]` (spec 026 FR-004a).
const PHOTO_MARKER = /^\[\s*foto\s*:\s*(single|note|hero2|tall)\s*\]$/i

function photoMarker(node: HtmlNode): PhotoLayout | null {
  if (node.tag !== 'p') return null
  const match = PHOTO_MARKER.exec(textOf(node.inner))
  return match ? (match[1]!.toLowerCase() as PhotoLayout) : null
}

/** Without a marker (spec 026 research R4): the count, and with 3 images the orientation of the first. */
function autoPhotoLayout(images: AboutImage[]): PhotoLayout {
  if (images.length === 1) return 'single'
  if (images.length === 2) return 'note'
  const [first] = images
  if (images.length === TALL_LAYOUT_IMAGES && first?.width && first.height && first.height > first.width) return 'tall'
  return 'hero2'
}

function timelineEvent(dateCell: HtmlNode, bodyCell: HtmlNode): TimelineEvent {
  const dateText = textOf(dateCell.inner)
  const year = YEAR.exec(dateText)?.[1]
  if (!year) return { kind: 'loose', html: dateCell.inner + bodyCell.inner }

  const dayMonth = dateText
    .replace(year, ' ')
    .split(/\s+/)
    .filter((part) => part && !/^[,.-]+$/.test(part))
    .join(' ')
  const highlighted = new RegExp(String.raw`<strong\b[^>]*>[^<]*${year}`).test(dateCell.inner)

  // Marker paragraphs are not shown; photoMarker misses an unknown one (`[foto: xyz]`), it stays in the text.
  const all = parseBlocks(bodyCell.inner) ?? []
  const marker = all.map(photoMarker).find((m) => m != null) ?? null
  const nodes = all.filter((n) => photoMarker(n) == null)

  const titleIndex = nodes.findIndex((n) => headingInner(n) != null)
  const title = titleIndex >= 0 ? textOf(headingInner(nodes[titleIndex]!) ?? '') : null
  const images = nodes.filter(isImageParagraph).flatMap((n) => imagesIn(n.inner))
  const html = outerOf(nodes.filter((n, i) => i !== titleIndex && !isImageParagraph(n)))
  const photoLayout = images.length > 0 ? (marker ?? autoPhotoLayout(images)) : null

  return {
    kind: 'event',
    year,
    dayMonth,
    highlighted,
    title,
    html,
    images,
    photoLayout,
    boxed: highlighted || (images.length > 0 && photoLayout !== 'note'),
  }
}

/**
 * Events → years (spec 026 research R3): order of first appearance in the table, non-adjacent
 * rows of one year merge. A row without a year joins the previous event's year, or the start of
 * the first year when the table opens without one, so no row is lost.
 */
export function groupByYear(events: TimelineEvent[]): HistoryYear[] {
  const years: HistoryYear[] = []
  const byYear = new Map<string, HistoryYear>()
  const leading: TimelineEvent[] = []
  let current: HistoryYear | null = null

  for (const event of events) {
    if (event.kind === 'loose') {
      if (current) current.items.push(event)
      else leading.push(event)
      continue
    }
    current = byYear.get(event.year) ?? null
    if (!current) {
      current = { year: event.year, anchorId: `year-${event.year}`, items: [] }
      byYear.set(event.year, current)
      years.push(current)
    }
    current.items.push(event)
  }
  years[0]?.items.unshift(...leading)
  return years
}

function timeline(table: HtmlNode): AboutBlock | null {
  const rows = tableRows(table)
  if (!rows || rows.length === 0 || rows.some((cells) => cells.length !== 2)) return null

  const events = rows.map(([dateCell, bodyCell]) => timelineEvent(dateCell!, bodyCell!))
  if (!events.some((e) => e.kind === 'event')) return null
  return { kind: 'timeline', years: groupByYear(events) }
}

function parseHistory(nodes: HtmlNode[]): AboutBlock[] | null {
  const tableIndex = nodes.findIndex((n) => n.tag === 'table')
  const block = tableIndex >= 0 ? timeline(nodes[tableIndex]!) : null
  if (!block) return null

  const list = new BlockList()
  const before = nodes.slice(0, tableIndex)
  const heroIndex = before.findIndex((n) => headingInner(n) != null)
  before.forEach((node, i) => {
    if (i === heroIndex) list.push({ kind: 'history-hero', html: headingInner(node) ?? '' })
    else list.html(node.outer)
  })
  list.push(block)
  list.html(outerOf(nodes.slice(tableIndex + 1)))
  return list.blocks
}

// ── Biography (contract §5, analyze U1) ───────────────────────────────────

/**
 * Turns a top-level "bold only" paragraph into `h2` so it shows as a bio section heading
 * ("Doğum tarixi", "Təhsil"…). CSS cannot recognise this reliably (`:has` does not see text
 * nodes), so it happens on the server. Broken HTML is left alone.
 */
export function promoteHeadingLines(html: string): string {
  const nodes = parseBlocks(html)
  if (!nodes) return html
  return nodes
    .map((node) => {
      const inner = node.tag === 'p' ? headingInner(node) : null
      return inner == null ? node.outer : `<h2>${inner}</h2>`
    })
    .join('')
}

// ── Org chart (spec 024 US5 #2) ───────────────────────────────────────────

/**
 * Wraps the first image (e.g. the org chart) in a link opening it full size in a new tab. The
 * HTML is left alone when the image is already inside a link or its address is not safe.
 */
export function linkFirstImage(html: string): string {
  const match = /<img\b[^>]*>/i.exec(html)
  if (!match) return html
  const before = html.slice(0, match.index)
  if (before.lastIndexOf('<a') > before.lastIndexOf('</a>')) return html
  const src = safeImageSrc(attrOf(match[0].slice(IMG_TAG_OPEN.length, -1), 'src'))
  if (!src) return html
  const link = `<a href="${src}" target="_blank" rel="noopener noreferrer">${match[0]}</a>`
  return before + link + html.slice(match.index + match[0].length)
}

// ── Department facts (spec 024 US5 #3, Figma `1003:12462`) ───────────────────

export type InfoFact = { label: string; value: string }

// "Direktor: Ad": the label must be short, so a colon in an ordinary sentence does not match.
const FACT_LINE = /^([^:]{1,40}):\s*(\S.*)$/

/**
 * Splits `<p>Direktor: <span>Ad</span></p>` lines of a department description into label/value
 * pairs. Blocks with a link (`mailto:` etc.) or another form stay in `html`, no text is dropped.
 */
export function parseFacts(html: string): { facts: InfoFact[]; html: string } {
  const nodes = parseBlocks(html)
  if (!nodes) return { facts: [], html }
  const facts: InfoFact[] = []
  const rest: string[] = []
  for (const node of nodes) {
    const match = node.tag === 'p' && !/<a\b/i.test(node.inner) ? FACT_LINE.exec(textOf(node.inner)) : null
    if (match?.[1] && match[2]) facts.push({ label: match[1].trim(), value: match[2] })
    else rest.push(node.outer)
  }
  return { facts, html: rest.join('') }
}

// ── Entry point ───────────────────────────────────────────────────────────

/** `html` is `prepareCmsHtml` output. An unrecognised form or broken HTML gives one `html` block. */
export { headingInner, safeImageSrc } from './markup'

/**
 * What the CSR, logo, IFI, memorandum, financial literacy and consumer rights layouts need besides the HTML: the page's
 * assets, the content-type rows and the companion page (specs 038, 040, 044, 045, 047, 050).
 */
export type ParseContext = {
  files?: AttachmentFile[]
  projects?: CsrProject[]
  organizations?: IfiOrganization[]
  memorandums?: Memorandum[]
  /** The page shown inside this one: the insurance complaint index, the infographics (spec 050 research R4). */
  companion?: { html: string; files: AttachmentFile[] } | null
  /** Monthly report series with a report in `locale` (spec 052); a series not here falls back to the page text. */
  reports?: ReportSeries[]
  /** The visitor's language, for the month names and titles of the reports. */
  locale?: Locale
}

/**
 * Consumer rights layouts (spec 050): `null` when the page lacks the expected accordions (it stays ordinary content),
 * `undefined` for any other layout.
 */
function parseConsumerLayout(layout: AboutLayoutKind, nodes: HtmlNode[], context: ParseContext): AboutBlock | null | undefined {
  switch (layout) {
    case 'consumer-text':
      return parseConsumerText(nodes)
    case 'complaint-index':
      return parseComplaintIndex(nodes, context.files ?? [], context.companion, context.reports, context.locale)
    case 'appeal-statistics':
      return parseAppealStatistics(nodes, context.companion, context.reports, context.locale)
    case 'consumer-documents':
      return parseConsumerDocuments(nodes, context.files ?? [])
    default:
      return undefined
  }
}

export function parseAbout(html: string, layout: AboutLayoutKind, context: ParseContext = {}): AboutBlock[] {
  const plain: AboutBlock[] = html.trim() ? [{ kind: 'html', html }] : []
  if (layout === 'plain') return plain
  const nodes = parseBlocks(html)
  if (!nodes) return plain

  if (layout === 'media-requests') return [parseMediaRequests(nodes)]
  if (layout === 'csr-projects') return [parseCsrProjects(nodes, context.files ?? [], context.projects ?? [])]
  if (layout === 'brand-logos') return [parseBrandLogos(nodes, context.files ?? [])]
  if (layout === 'ifi-organizations') return [parseIfiOrganizations(nodes, context.organizations ?? [])]
  if (layout === 'memorandums') return [parseMemorandums(nodes, context.memorandums ?? [])]
  if (layout === 'memberships') return [parseMemberships(nodes)]
  if (layout === 'financial-literacy') return [parseFinancialLiteracy(nodes, context.files ?? [])]
  if (layout === 'literacy-platform') return [parseLiteracyPlatform(nodes, context.files ?? [])]
  // Publications (spec 054): the layout was picked from the text's shape, so an archive always has accordions.
  if (layout === 'file-archive') {
    const archive = parseFileArchive(nodes, context.files ?? [])
    return archive ? [archive] : plain
  }
  if (layout === 'document-list') return [parseDocumentList(nodes, context.files ?? [])]
  const consumer = parseConsumerLayout(layout, nodes, context)
  if (consumer !== undefined) return consumer ? [consumer] : plain
  if (layout === 'about-main') return parseAboutMain(nodes)
  if (layout === 'mission') return parseMission(nodes)
  return parseHistory(nodes) ?? plain
}
