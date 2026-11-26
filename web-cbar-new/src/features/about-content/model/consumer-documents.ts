/**
 * The "Documents" page of the consumer rights section (spec 050 `contracts/cms-markup.md` §5): page 101.
 *
 * Each top-level accordion is a section. Inside it, a paragraph holding only media library links becomes document
 * cards; everything else stays ordinary content. Text outside the accordions stays before or after them.
 */
import type { AttachmentFile } from '@/entities/content'
import { parseBlocks, textOf, type HtmlNode } from '@/shared/lib/html-blocks'

import { meaningful, outerOf } from './markup'
import type { ConsumerDocumentsBlock, DocumentPart, DocumentSection } from './types'
import { archiveFile, detailsOf, mediaLinksIn, topNodes } from './year-archive'

const FILE_PARAGRAPH_TAGS: ReadonlySet<string> = new Set(['p', 'div'])

type MediaLink = { id: number; text: string }

/**
 * The links of a paragraph made of media library links only, otherwise `null`. `find` says which links count: the
 * consumer pages need the editor's `data-media-link` mark, the publications section any `/media/{id}` link (spec 054).
 */
export function fileLinks(node: HtmlNode, find: (html: string) => MediaLink[] = mediaLinksIn): MediaLink[] | null {
  // A bare link: the legacy import's `div` around it has been opened.
  if (node.tag === 'a') {
    const links = find(node.outer)
    return links.length === 1 ? links : null
  }
  if (!FILE_PARAGRAPH_TAGS.has(node.tag)) return null
  const children = parseBlocks(node.inner)
  if (!children) return null
  const parts = meaningful(children).filter((child) => child.tag !== '#text' || textOf(child.outer) !== '')
  if (parts.length === 0 || parts.some((part) => part.tag !== 'a')) return null
  const links = find(node.inner)
  return links.length === parts.length ? links : null
}

function sectionParts(body: string, files: readonly AttachmentFile[]): DocumentPart[] {
  const parts: DocumentPart[] = []
  // The legacy import wraps a section's content in one more `div`.
  for (const node of topNodes(parseBlocks(body) ?? [])) {
    const links = fileLinks(node)
    if (links) {
      parts.push(...links.map((link): DocumentPart => ({ type: 'file', file: archiveFile(link.id, link.text, files) })))
      continue
    }
    const last = parts.at(-1)
    if (last?.type === 'html') last.html += node.outer
    else parts.push({ type: 'html', html: node.outer })
  }
  return parts.filter((part) => part.type === 'file' || textOf(part.html) !== '')
}

/** `null` when the page has no accordion: it stays ordinary content. */
export function parseConsumerDocuments(nodes: HtmlNode[], files: readonly AttachmentFile[] = []): ConsumerDocumentsBlock | null {
  const intro: HtmlNode[] = []
  const rest: HtmlNode[] = []
  const sections: DocumentSection[] = []
  for (const node of topNodes(nodes)) {
    const details = detailsOf(node)
    if (details) sections.push({ title: details.summary, parts: sectionParts(details.body, files) })
    else if (sections.length === 0) intro.push(node)
    else rest.push(node)
  }
  if (sections.length === 0) return null
  return { kind: 'consumer-documents', introHtml: outerOf(intro), sections, restHtml: outerOf(rest) }
}
