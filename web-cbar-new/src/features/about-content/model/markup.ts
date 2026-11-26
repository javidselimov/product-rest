/**
 * Top-level block rules shared by the CMS layout parsers (spec 024 `contracts/cms-markup.md`).
 */
import type { AttachmentFile } from '@/entities/content'
import { attrOf, parseBlocks, textOf, type HtmlNode } from '@/shared/lib/html-blocks'
import { safeDecodeURIComponent } from '@/shared/lib/uri'

import { IMAGE_MIME_PREFIX, IMG_TAG_OPEN, MAILTO_HREF, MEDIA_HREF } from './constants'
import type { AboutImage } from './types'

const HEADING_TAGS = new Set(['h2', 'h3', 'h4'])

export const meaningful = (nodes: HtmlNode[]) => nodes.filter((n) => n.tag !== 'br')

/**
 * Heading line (contract §1.5): `h2`–`h4` or a paragraph of a single `<strong>`.
 * Returns the heading's inner HTML (inline tags such as `<em>` stay), otherwise `null`.
 */
export function headingInner(node: HtmlNode): string | null {
  if (HEADING_TAGS.has(node.tag)) return textOf(node.inner) ? node.inner : null
  if (node.tag !== 'p') return null
  const children = parseBlocks(node.inner)
  if (!children) return null
  const parts = meaningful(children)
  const [only] = parts
  return parts.length === 1 && only?.tag === 'strong' && textOf(only.inner) ? only.inner : null
}

/** Media or https image; `javascript:`, `data:` and relative external paths are dropped (Article X.1). */
export function safeImageSrc(src: string | null): string | null {
  if (!src) return null
  return src.startsWith('/media/') || src.startsWith('https://') ? src : null
}

const IMG_TAG = /<img\b[^>]*>/gi

/** Positive integer attribute (`width="600"`), otherwise `undefined`. */
function sizeAttr(attrs: string, name: string): number | undefined {
  const value = Number(attrOf(attrs, name))
  return Number.isInteger(value) && value > 0 ? value : undefined
}

export function imagesIn(html: string): AboutImage[] {
  return [...html.matchAll(IMG_TAG)].flatMap(([tag]) => {
    const attrs = tag.slice(IMG_TAG_OPEN.length, -1)
    const src = safeImageSrc(attrOf(attrs, 'src'))
    if (!src) return []
    const image: AboutImage = { src, alt: attrOf(attrs, 'alt') ?? '' }
    const width = sizeAttr(attrs, 'width')
    const height = sizeAttr(attrs, 'height')
    if (width && height) Object.assign(image, { width, height })
    return [image]
  })
}

/** Image paragraph (contract §1.6): a `<p>` holding only `<img>` / `<a><img></a>`. */
export function isImageParagraph(node: HtmlNode): boolean {
  if (node.tag !== 'p') return false
  const children = parseBlocks(node.inner)
  if (!children) return false
  const parts = meaningful(children)
  return (
    parts.length > 0 &&
    parts.every((n) => n.tag === 'img' || (n.tag === 'a' && /^\s*(?:<img\b[^>]*>\s*)+$/i.test(n.inner)))
  )
}

export const outerOf = (nodes: HtmlNode[]) => nodes.map((n) => n.outer).join('')

/**
 * Media paragraph (spec 047 contract): a `<p>` holding only `<a data-media-link href="/media/{id}">` links. Returns
 * the ids in order, otherwise `null`. An id the page lists as a file that is not an image breaks the rule; an id it
 * does not list counts as an image (the layout fixture test parses without the page's files).
 */
export function mediaParagraphIds(node: HtmlNode, files: readonly AttachmentFile[] = []): number[] | null {
  if (node.tag !== 'p') return null
  const children = parseBlocks(node.inner)
  if (!children) return null
  const parts = meaningful(children).filter((n) => n.tag !== '#text' || textOf(n.outer) !== '')
  if (parts.length === 0) return null
  const ids: number[] = []
  for (const part of parts) {
    if (part.tag !== 'a' || attrOf(part.attrs, 'data-media-link') == null) return null
    const match = MEDIA_HREF.exec(attrOf(part.attrs, 'href') ?? '')
    if (!match) return null
    const id = Number(match[1])
    const file = files.find((f) => f.id === id)
    if (file && !file.mimeType.startsWith(IMAGE_MIME_PREFIX)) return null
    ids.push(id)
  }
  return ids
}

/** The first mail link's address in `html`, lower case; `null` without one. */
export function mailtoIn(html: string): string | null {
  for (const [, attrs] of html.matchAll(/<a\b([^>]*)>/gi)) {
    const match = MAILTO_HREF.exec(attrOf(attrs ?? '', 'href') ?? '')
    if (match?.[1]) return safeDecodeURIComponent(match[1]).trim().toLowerCase()
  }
  return null
}
