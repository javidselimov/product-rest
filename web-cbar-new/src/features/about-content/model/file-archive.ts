/**
 * Year archive of the publications section (spec 054 `contracts/publication-markup.md`, research R8): the annual report,
 * the interbank flows, the fraud statistics and any page whose text holds accordions.
 *
 * Every top-level accordion is a group: a year, or another label ("Arxiv"; an empty one shows as "Digər"). Inside a
 * group, a paragraph of media library links becomes document cards and everything else stays text, so a link to a page
 * stays an ordinary link. Text before the first and after the last accordion stays in place; a file paragraph there is a
 * card too (the annual report's font link). Unlike the consumer pages, a `/media/{id}` link counts without the editor's
 * `data-media-link` mark: part of the legacy import has none.
 */
import type { AttachmentFile } from '@/entities/content'
import { attrOf, parseBlocks, textOf, type HtmlNode } from '@/shared/lib/html-blocks'

import { ARCHIVE_YEAR, MEDIA_HREF } from './constants'
import { fileLinks } from './consumer-documents'
import type { ArchiveFile, ArchiveGroup, DocumentPart, FileArchiveBlock } from './types'
import { archiveFile, detailsOf, topNodes } from './year-archive'

/** Every `/media/{id}` link of `html`, in order, marked or not. */
export function mediaHrefLinksIn(html: string): { id: number; text: string }[] {
  const links: { id: number; text: string }[] = []
  for (const [, attrs = '', inner = ''] of html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)) {
    const match = MEDIA_HREF.exec(attrOf(attrs, 'href') ?? '')
    if (match) links.push({ id: Number(match[1]), text: textOf(inner) })
  }
  return links
}

/** The card of a link: the link text names it, the page asset gives the type and size. */
export function publicationFile(id: number, text: string, files: readonly AttachmentFile[]): ArchiveFile {
  const file = archiveFile(id, text, files)
  return text ? { ...file, title: text } : file
}

/** File paragraphs as cards, the rest as text; consecutive text nodes join, blank text is dropped. */
export function toParts(nodes: HtmlNode[], files: readonly AttachmentFile[]): DocumentPart[] {
  const parts: DocumentPart[] = []
  for (const node of topNodes(nodes)) {
    const links = fileLinks(node, mediaHrefLinksIn)
    if (links) {
      parts.push(...links.map((link): DocumentPart => ({ type: 'file', file: publicationFile(link.id, link.text, files) })))
      continue
    }
    const last = parts.at(-1)
    if (last?.type === 'html') last.html += node.outer
    else parts.push({ type: 'html', html: node.outer })
  }
  return parts.filter((part) => part.type === 'file' || textOf(part.html) !== '')
}

const label = (summary: string) => summary.replace(/\s+/g, ' ').trim()

/** `null` when the text has no accordion: the page is not an archive. */
export function parseFileArchive(nodes: HtmlNode[], files: readonly AttachmentFile[] = []): FileArchiveBlock | null {
  const before: HtmlNode[] = []
  const after: HtmlNode[] = []
  const byKey = new Map<string, ArchiveGroup>()
  let position = 0

  for (const node of topNodes(nodes)) {
    const details = detailsOf(node)
    if (!details) {
      // Text between two accordions belongs to neither group: it goes to the end with the text after the last one.
      if (byKey.size === 0) before.push(node)
      else after.push(node)
      continue
    }
    position++
    const text = label(details.summary)
    const year = ARCHIVE_YEAR.test(text) ? Number(text) : null
    // An empty label has no text to address it by, so its position in the text is its key.
    const key = year !== null ? String(year) : text || `other-${position}`
    const parts = toParts(parseBlocks(details.body) ?? [], files)
    const existing = byKey.get(key)
    if (existing) existing.parts.push(...parts)
    else byKey.set(key, { key, label: text, year, parts })
  }
  if (byKey.size === 0) return null

  const groups = [...byKey.values()]
  const years = groups.filter((g) => g.year !== null).sort((a, b) => (b.year ?? 0) - (a.year ?? 0))
  const others = groups.filter((g) => g.year === null)
  return { kind: 'file-archive', before: toParts(before, files), groups: [...years, ...others], after: toParts(after, files) }
}

/** `year` search parameter value of "Hamısı": every group, one after another. */
export const ARCHIVE_ALL = 'all'

/**
 * The groups a year archive shows for its `year` search parameter (research R8): one group by its key, every group for
 * `all`, and for anything else (missing, unknown) the newest year — or every group when the archive has no year.
 */
export function selectArchive(groups: readonly ArchiveGroup[], raw: string | string[] | undefined): { selected: string; shown: ArchiveGroup[] } {
  const value = Array.isArray(raw) ? raw[0] : raw
  if (value === ARCHIVE_ALL) return { selected: ARCHIVE_ALL, shown: [...groups] }
  const picked = groups.find((group) => group.key === value)
  if (picked) return { selected: picked.key, shown: [picked] }
  const newest = groups.find((group) => group.year !== null)
  return newest ? { selected: newest.key, shown: [newest] } : { selected: ARCHIVE_ALL, shown: [...groups] }
}
