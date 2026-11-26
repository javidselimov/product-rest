/**
 * "Corporate social responsibility" page: CMS HTML → intro and file rows (spec 038,
 * `specs/038-media-csr/contracts/cms-markup.md`). The projects are a content type of their own and
 * reach the block through the loader.
 *
 * The page may still carry the old project list after its heading. It is left out once projects
 * arrive, so they do not show twice; without projects it stays, so the text never disappears.
 */
import { isImageMime, type AttachmentFile } from '@/entities/content'
import { attrOf, parseBlocks, textOf, type HtmlNode } from '@/shared/lib/html-blocks'

import { LEGACY_CSR_LIST_HEADINGS } from './constants'
import { headingInner, meaningful, outerOf } from './markup'
import type { CsrProject, CsrProjectsBlock } from './types'

const MEDIA_HREF = /^\/media\/(\d+)$/

/** A document linked alone on its line, resolved against the page's assets. */
function linkedFile(node: HtmlNode, files: AttachmentFile[]): AttachmentFile | null {
  if (node.tag !== 'p') return null
  const parts = parseBlocks(node.inner)
  if (!parts) return null
  const [only, ...rest] = meaningful(parts)
  if (only?.tag !== 'a' || rest.length > 0) return null

  const id = MEDIA_HREF.exec(attrOf(only.attrs, 'href') ?? '')?.[1]
  const file = files.find((candidate) => String(candidate.id) === id)
  return file && !isImageMime(file.mimeType) ? file : null
}

function isLegacyListHeading(node: HtmlNode): boolean {
  const heading = headingInner(node)
  return heading !== null && LEGACY_CSR_LIST_HEADINGS.includes(textOf(heading))
}

export function parseCsrProjects(nodes: HtmlNode[], files: AttachmentFile[], projects: CsrProject[]): CsrProjectsBlock {
  const listStart = projects.length > 0 ? nodes.findIndex(isLegacyListHeading) : -1
  const page = listStart >= 0 ? nodes.slice(0, listStart) : nodes

  return {
    kind: 'csr-projects',
    introHtml: outerOf(page.filter((node) => !linkedFile(node, files))),
    files: page.flatMap((node) => linkedFile(node, files) ?? []),
    projects,
  }
}
