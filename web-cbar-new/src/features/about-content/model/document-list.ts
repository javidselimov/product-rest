/**
 * Single-document page of the publications section (spec 054 `contracts/publication-markup.md`): the strategies and
 * concepts, "Ödəniş xidmətləri", the econometric models. The intro is every node that is not a file paragraph; the file
 * paragraphs become document cards in order. A page that links no file in its text (the econometric models; the en text
 * of the risk-based supervision concept) shows its attached files as the cards instead.
 */
import type { AttachmentFile } from '@/entities/content'
import type { HtmlNode } from '@/shared/lib/html-blocks'

import { toParts } from './file-archive'
import type { ArchiveFile, DocumentListBlock } from './types'

export function parseDocumentList(nodes: HtmlNode[], files: readonly AttachmentFile[] = []): DocumentListBlock {
  const parts = toParts(nodes, files)
  const linked = parts.flatMap((part) => (part.type === 'file' ? [part.file] : []))
  const introHtml = parts.flatMap((part) => (part.type === 'html' ? [part.html] : [])).join('')
  const fromAssets = files.map(
    (file): ArchiveFile => ({ id: file.id, title: file.title, url: file.url, mimeType: file.mimeType, sizeBytes: file.sizeBytes }),
  )
  return { kind: 'document-list', introHtml, files: linked.length > 0 ? linked : fromAssets }
}
