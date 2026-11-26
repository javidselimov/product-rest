/**
 * "Financial literacy" page (spec 047): CMS HTML → sections, quote, principle cards, target group chips, gallery and
 * the closing banner (`specs/047-financial-literacy/contracts/cms-markup.md` §1).
 *
 * Every block comes from ordinary editor markup: `h2` opens a section, `h3` is a subheading, a quote without a mail
 * link is the definition, a list whose items open with a bold line is the cards, a plain list right after an `h3` is
 * the chips, a paragraph of media links is the gallery, the first quote with a mail link is the banner. A rule is
 * recognised whole or not at all; what is not recognised stays in place as ordinary content, so no text is dropped.
 */
import type { AttachmentFile } from '@/entities/content'
import { parseBlocks, textOf, type HtmlNode } from '@/shared/lib/html-blocks'

import { headingInner, mailtoIn, meaningful, mediaParagraphIds, outerOf } from './markup'
import type { FinancialLiteracyBlock, LiteracyCta, LiteracyPart, LiteracySection } from './types'

/** Element children of a block, without line breaks and blank text. */
function childrenOf(html: string): HtmlNode[] | null {
  const nodes = parseBlocks(html)
  return nodes ? meaningful(nodes).filter((n) => n.tag !== '#text' || textOf(n.outer) !== '') : null
}

function quote(node: HtmlNode): LiteracyPart {
  const children = childrenOf(node.inner)
  const last = children?.at(-1)
  if (!children || children.length < 2 || last?.tag !== 'p') return { kind: 'quote', html: node.inner, source: null }
  return { kind: 'quote', html: outerOf(children.slice(0, -1)), source: textOf(last.inner) || null }
}

/** Two or more paragraphs: eyebrow (with three or more), title, then the address lines holding the mail link. */
function cta(node: HtmlNode, email: string): LiteracyCta | null {
  const children = childrenOf(node.inner)
  if (!children || children.length < 2 || children.some((n) => n.tag !== 'p')) return null
  const [first, second] = children
  const withEyebrow = children.length > 2
  return {
    eyebrow: withEyebrow ? textOf(first!.inner) : '',
    title: textOf((withEyebrow ? second : first)!.inner),
    addressHtml: outerOf(children.slice(withEyebrow ? 2 : 1)),
    email,
  }
}

const listItems = (list: HtmlNode) => (childrenOf(list.inner) ?? []).filter((n) => n.tag === 'li')

/** Every item opens with a heading line: `<li><p><strong>Title</strong></p><p>Description</p></li>`. */
function principles(list: HtmlNode): LiteracyPart | null {
  const items = listItems(list)
  if (items.length === 0) return null
  const cards: { title: string; description: string | null }[] = []
  for (const item of items) {
    const [head, ...rest] = childrenOf(item.inner) ?? []
    const title = head ? headingInner(head) : null
    if (title == null) return null
    cards.push({ title: textOf(title), description: textOf(outerOf(rest)) || null })
  }
  return { kind: 'principles', items: cards }
}

/** Items without a bold heading line, each with some text. */
function chips(list: HtmlNode): LiteracyPart | null {
  const items = listItems(list)
  if (items.length === 0) return null
  const labels: string[] = []
  for (const item of items) {
    const [head] = childrenOf(item.inner) ?? []
    const label = textOf(item.inner)
    if ((head && headingInner(head) != null) || !label) return null
    labels.push(label)
  }
  return { kind: 'chips', items: labels }
}

/** Adds a part, merging consecutive ordinary content into one `html` part. */
function push(section: LiteracySection, part: LiteracyPart) {
  const last = section.parts.at(-1)
  if (part.kind === 'html' && last?.kind === 'html') last.html += part.html
  else section.parts.push(part)
}

/** Parser state while walking the top-level blocks. */
type State = {
  sections: LiteracySection[]
  usedMediaIds: number[]
  banner: LiteracyCta | null
  /** The previous block was a subheading: a plain list right after it is the chips. */
  afterSubheading: boolean
}

/** The part a block stands for inside a section; `null` when the block opened a section or became the banner. */
function partOf(node: HtmlNode, state: State, files: readonly AttachmentFile[]): LiteracyPart | null {
  const subheading = node.tag === 'h2' ? null : headingInner(node)
  if (subheading != null) return { kind: 'subheading', text: textOf(subheading) }

  if (node.tag === 'blockquote') {
    const email = state.banner ? null : mailtoIn(node.inner)
    const banner = email ? cta(node, email) : null
    if (!banner) return quote(node)
    state.banner = banner
    return null
  }
  if (node.tag === 'ul') return principles(node) ?? (state.afterSubheading ? chips(node) : null) ?? { kind: 'html', html: node.outer }

  const ids = mediaParagraphIds(node, files)
  if (ids) {
    state.usedMediaIds.push(...ids)
    return { kind: 'gallery', images: ids.map((mediaId) => ({ mediaId, src: `/media/${mediaId}` })) }
  }
  return { kind: 'html', html: node.outer }
}

export function parseFinancialLiteracy(nodes: HtmlNode[], files: readonly AttachmentFile[] = []): FinancialLiteracyBlock {
  const state: State = { sections: [{ heading: null, parts: [] }], usedMediaIds: [], banner: null, afterSubheading: false }

  for (const node of nodes) {
    if (node.tag === '#text' && !textOf(node.outer)) continue
    if (node.tag === 'h2' && textOf(node.inner)) {
      state.sections.push({ heading: textOf(node.inner), parts: [] })
      state.afterSubheading = false
      continue
    }
    const part = partOf(node, state, files)
    if (part) push(state.sections.at(-1)!, part)
    state.afterSubheading = part?.kind === 'subheading'
  }

  return {
    kind: 'financial-literacy',
    sections: state.sections.filter((s) => s.heading != null || s.parts.length > 0),
    cta: state.banner,
    usedMediaIds: state.usedMediaIds,
  }
}
