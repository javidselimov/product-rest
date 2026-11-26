/**
 * The three platform pages of "Financial literacy" (spec 047): CMS HTML → intro, note box, photo row, ruled sections and
 * the "go to the platform" button (`specs/047-financial-literacy/contracts/cms-markup.md` §2).
 *
 * The first quote is the note, the first paragraph of media links is the photo row, each `h2` opens a section and a
 * last paragraph holding a single web link is the button. A second quote or photo paragraph stays where it is as
 * ordinary content, so no text is dropped.
 */
import type { AttachmentFile } from '@/entities/content'
import { attrOf, parseBlocks, textOf, type HtmlNode } from '@/shared/lib/html-blocks'

import { WEB_LINK } from './constants'
import { meaningful, mediaParagraphIds, outerOf } from './markup'
import type { LiteracyImage, LiteracyPlatformBlock } from './types'

/** A paragraph whose only content is one `http(s)` link; its text is the button label. */
function linkButton(node: HtmlNode | undefined): { href: string; label: string } | null {
  if (node?.tag !== 'p') return null
  const children = parseBlocks(node.inner)
  const parts = children ? meaningful(children).filter((n) => n.tag !== '#text' || textOf(n.outer) !== '') : []
  const [only] = parts
  if (parts.length !== 1 || only?.tag !== 'a') return null
  const href = attrOf(only.attrs, 'href')
  const label = textOf(only.inner)
  return href && WEB_LINK.test(href) && label ? { href, label } : null
}

export function parseLiteracyPlatform(nodes: HtmlNode[], files: readonly AttachmentFile[] = []): LiteracyPlatformBlock {
  const blocks = nodes.filter((n) => n.tag !== '#text' || textOf(n.outer) !== '')
  const link = linkButton(blocks.at(-1))
  const body = link ? blocks.slice(0, -1) : blocks

  let noteHtml: string | null = null
  let photos: LiteracyImage[] = []
  const usedMediaIds: number[] = []
  const intro: HtmlNode[] = []
  const sections: { heading: string; body: HtmlNode[] }[] = []

  for (const node of body) {
    if (node.tag === 'blockquote' && noteHtml == null) {
      noteHtml = node.inner
      continue
    }
    const ids = photos.length === 0 ? mediaParagraphIds(node, files) : null
    if (ids) {
      usedMediaIds.push(...ids)
      photos = ids.map((mediaId) => ({ mediaId, src: `/media/${mediaId}` }))
      continue
    }
    if (node.tag === 'h2' && textOf(node.inner)) {
      sections.push({ heading: textOf(node.inner), body: [] })
      continue
    }
    const section = sections.at(-1)
    if (section) section.body.push(node)
    else intro.push(node)
  }

  return {
    kind: 'literacy-platform',
    introHtml: outerOf(intro),
    noteHtml,
    photos,
    sections: sections.map((s) => ({ heading: s.heading, html: outerOf(s.body) })),
    link,
    usedMediaIds,
  }
}
