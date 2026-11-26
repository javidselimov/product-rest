/**
 * The page text before its first accordion (spec 054). The working paper list shows only that part of its CMS page as
 * the intro: the legacy year accordions after it are the old link list the content type replaces. The year archive
 * template splits the same way. Legacy `div` wrappers are opened first (`topNodes`), so both the import and the
 * editor's form split at the same place.
 */
import { parseBlocks } from '@/shared/lib/html-blocks'

import { topNodes } from './year-archive'

export type SplitText = {
  /** HTML before the first top-level `<details>`; the whole text when there is none. */
  before: string
  /** HTML from the first `<details>` on; empty when there is none. */
  rest: string
}

export function splitAtFirstDetails(html: string): SplitText {
  const nodes = parseBlocks(html)
  if (!nodes) return { before: html, rest: '' }
  const flat = topNodes(nodes)
  const first = flat.findIndex((node) => node.tag === 'details')
  if (first === -1) return { before: flat.map((node) => node.outer).join(''), rest: '' }
  return {
    before: flat.slice(0, first).map((node) => node.outer).join(''),
    rest: flat.slice(first).map((node) => node.outer).join(''),
  }
}
