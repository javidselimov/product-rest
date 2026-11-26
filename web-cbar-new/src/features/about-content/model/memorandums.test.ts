import { describe, expect, it } from 'vitest'

import { cooperationLayoutFor } from './layouts'
import { parseAbout } from './parse'
import type { Memorandum, MemorandumsBlock } from './types'
import { YEAR_SORT, orderByYear, type YearSort } from './year-sort'

const rows: Memorandum[] = [
  { id: 1, organization: 'Slovakiya Milli Bankı', country: 'Slovakiya', year: 2026 },
  { id: 2, organization: 'Rusiya Federasiyasının Mərkəzi Bankı', country: 'Rusiya', year: 2026 },
  { id: 3, organization: 'Çin Xalq Bankı', country: 'Çin', year: 2025 },
  { id: 4, organization: 'Rusiya Federasiyasının Mərkəzi Bankı', country: 'Rusiya', year: 2006 },
]

const PAGE = '<p>Giriş</p><p><strong>İsveçrə Milli Bankı</strong></p><p>Köhnə bank mətni</p>'

function parsed(html: string, memorandums: Memorandum[]): MemorandumsBlock {
  const [block] = parseAbout(html, 'memorandums', { memorandums })
  if (block?.kind !== 'memorandums') throw new Error(`unexpected block: ${block?.kind}`)
  return block
}

describe('cooperationLayoutFor', () => {
  it.each([
    'merkezi-banklarla-emekdasliq',
    'cooperation-with-central-banks',
    'merkezi-banklarla-emekdasliq-copy',
    'cooperation-with-central-banks-copy',
  ])('%s gets the memorandum layout', (slug) => {
    expect(cooperationLayoutFor(slug)).toBe('memorandums')
  })
})

describe('parseMemorandums', () => {
  it('keeps the intro and leaves out the legacy bank texts once memorandums exist', () => {
    const block = parsed(PAGE, rows)
    expect(block.introHtml).toBe('<p>Giriş</p>')
    expect(block.rows).toBe(rows)
  })

  it('keeps the whole page text while there are no memorandums', () => {
    expect(parsed(PAGE, []).introHtml).toBe(PAGE)
  })

  it('treats a page without a heading line as all intro', () => {
    expect(parsed('<p>Giriş</p><p>Davamı</p>', rows).introHtml).toBe('<p>Giriş</p><p>Davamı</p>')
  })

  it('has no intro when the page opens with a heading line', () => {
    expect(parsed('<p><strong>İsveçrə Milli Bankı</strong></p><p>Köhnə bank mətni</p>', rows).introHtml).toBe('')
  })
})

// The memorandum rows arrive newest year first; the shared year order must keep that (spec 046 research R4).
describe('orderByYear on memorandums', () => {
  const order = (sort: YearSort) => orderByYear(rows, (row) => row.year, sort)

  it('leaves the API order for newest first', () => {
    expect(order(YEAR_SORT.NEWEST).map((row) => row.id)).toEqual([1, 2, 3, 4])
  })

  it('turns the years around and keeps the order inside a year', () => {
    expect(order(YEAR_SORT.OLDEST).map((row) => row.id)).toEqual([4, 3, 1, 2])
  })

  it('loses no row, two memorandums with one organization included', () => {
    expect(order(YEAR_SORT.OLDEST)).toHaveLength(rows.length)
  })
})
