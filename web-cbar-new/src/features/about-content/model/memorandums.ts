/**
 * "Cooperation with central banks" page: CMS HTML → the intro above the memorandum table
 * (spec 045). The memorandums are a content type of their own and reach the block through the loader.
 *
 * The page may still carry the legacy text, one heading line (`<p><strong>Bank</strong></p>`,
 * contract §1.5) per bank. It is left out from the first heading line once memorandums arrive: the
 * design shows the intro and the table only. Without memorandums it stays, so the text never disappears.
 * The table's order is `year-sort.ts`, shared with the membership table (spec 046).
 */
import type { HtmlNode } from '@/shared/lib/html-blocks'

import { headingInner, outerOf } from './markup'
import type { Memorandum, MemorandumsBlock } from './types'

export function parseMemorandums(nodes: HtmlNode[], rows: Memorandum[]): MemorandumsBlock {
  const legacyStart = rows.length > 0 ? nodes.findIndex((node) => headingInner(node) !== null) : -1
  const page = legacyStart >= 0 ? nodes.slice(0, legacyStart) : nodes

  return { kind: 'memorandums', introHtml: outerOf(page), rows }
}
