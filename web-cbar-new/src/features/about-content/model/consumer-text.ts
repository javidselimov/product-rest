/**
 * The consumer rights section root and the administrative officials page (spec 050 `contracts/cms-markup.md` §1).
 *
 * The first paragraph is the lead (a bold-only first paragraph loses its bold), a heading line or bold-only paragraph is a
 * heading, a list becomes the numbered cards; everything else stays ordinary content in the editor's order.
 */
import { parseBlocks, textOf, type HtmlNode } from '@/shared/lib/html-blocks'

import { headingInner, meaningful } from './markup'
import type { ConsumerTextBlock, ConsumerTextPart } from './types'
import { topNodes } from './year-archive'

const LIST_TAGS: ReadonlySet<string> = new Set(['ul', 'ol'])

function listItems(node: HtmlNode): string[] {
  return (parseBlocks(node.inner) ?? []).filter((child) => child.tag === 'li').map((li) => li.inner)
}

/** `null` for an empty page or one that does not open with a paragraph: it stays ordinary content. */
export function parseConsumerText(nodes: HtmlNode[]): ConsumerTextBlock | null {
  const blocks = meaningful(topNodes(nodes))
  const [first, ...rest] = blocks
  if (first?.tag !== 'p' || !textOf(first.inner)) return null

  const parts: ConsumerTextPart[] = []
  const pushHtml = (html: string) => {
    const last = parts.at(-1)
    if (last?.type === 'html') last.html += html
    else parts.push({ type: 'html', html })
  }

  for (const node of rest) {
    const heading = headingInner(node)
    if (heading != null) parts.push({ type: 'heading', text: textOf(heading) })
    else if (LIST_TAGS.has(node.tag) && listItems(node).length > 0) parts.push({ type: 'numbered', itemsHtml: listItems(node) })
    else pushHtml(node.outer)
  }

  return { kind: 'consumer-text', leadHtml: headingInner(first) ?? first.inner, parts }
}
