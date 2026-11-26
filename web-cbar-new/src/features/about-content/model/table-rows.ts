import { parseBlocks, type HtmlNode } from '@/shared/lib/html-blocks'

/** Table rows with their cells; a row of `th` only is skipped. `null` when the structure is broken. */
export function tableRows(table: HtmlNode): HtmlNode[][] | null {
  const parts = parseBlocks(table.inner)
  if (!parts) return null
  const rows: HtmlNode[] = []

  for (const part of parts) {
    if (part.tag === 'tr') rows.push(part)
    else if (part.tag === 'tbody' || part.tag === 'thead') {
      const inner = parseBlocks(part.inner)
      if (!inner) return null
      rows.push(...inner.filter((n) => n.tag === 'tr'))
    }
  }
  const result: HtmlNode[][] = []
  for (const row of rows) {
    const cells = parseBlocks(row.inner)?.filter((n) => n.tag === 'td' || n.tag === 'th')
    if (!cells) return null
    if (cells.length > 0 && cells.every((c) => c.tag === 'th')) continue
    result.push(cells)
  }
  return result
}
