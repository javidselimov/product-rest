/**
 * The intro of the schedule page (spec 039 FR-012, research R9). CMS page 130 still holds the
 * hand-typed table of the old site after its intro. While rows come from the API the page shows only
 * what precedes the first table; without rows the CMS text stays whole, so the schedule is never
 * missing (the spec 038 rule).
 */
import { parseBlocks, type HtmlNode } from '@/shared/lib/html-blocks'

const TABLE = 'table'

/** A top-level table, bare or wrapped (`wrapTables` in `cms-html` puts it in a `div`). */
function holdsTable(node: HtmlNode): boolean {
  if (node.tag === TABLE) return true
  return node.tag !== '#text' && /^\s*<table[\s>]/i.test(node.inner)
}

export function introHtml(content: string | null, hasRows: boolean): string {
  if (!content) return ''
  if (!hasRows) return content
  const nodes = parseBlocks(content)
  if (nodes === null) return content
  const tableAt = nodes.findIndex(holdsTable)
  if (tableAt < 0) return content
  return nodes
    .slice(0, tableAt)
    .map((node) => node.outer)
    .join('')
}
