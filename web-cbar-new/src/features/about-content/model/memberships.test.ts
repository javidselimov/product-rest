import { describe, expect, it } from 'vitest'

import { cooperationLayoutFor } from './layouts'
import { parseAbout } from './parse'
import type { MembershipsBlock } from './types'

const cell = (tag: 'td' | 'th', html: string) => `<${tag} colspan="1" rowspan="1"><p>${html}</p></${tag}>`
const row = (tag: 'td' | 'th', ...cells: string[]) => `<tr>${cells.map((html) => cell(tag, html)).join('')}</tr>`
const table = (...rows: string[]) => `<table style="min-width: 50px;"><tbody>${rows.join('')}</tbody></table>`

const HEADER = row('th', 'Təşkilat', 'Üzvlük tarixi')

function parsed(html: string): MembershipsBlock {
  const [block] = parseAbout(html, 'memberships')
  if (block?.kind !== 'memberships') throw new Error(`unexpected block: ${block?.kind}`)
  return block
}

describe('cooperationLayoutFor', () => {
  it.each([
    'beynelxalq-teskilatlarda-uzvluk',
    'beynelxalq-teskilatlarda-uzvluk-copy',
    'membership-in-international-organizations',
    'membership-in-international-organizations-copy',
  ])('%s gets the membership layout', (slug) => {
    expect(cooperationLayoutFor(slug)).toBe('memberships')
  })
})

describe('parseMemberships', () => {
  it('reads organization and year from the first table, leaving out the editor header row', () => {
    const block = parsed(table(HEADER, row('td', 'Qlobal Maliyyə İnnovasiyaları Şəbəkəsi', '2025'), row('td', 'IOSCO', '2020')))
    expect(block.rows).toEqual([
      { organization: 'Qlobal Maliyyə İnnovasiyaları Şəbəkəsi', href: null, yearLabel: '2025', year: 2025 },
      { organization: 'IOSCO', href: null, yearLabel: '2020', year: 2020 },
    ])
  })

  it('treats a first ordinary row without a year as the header', () => {
    const block = parsed(table(row('td', 'Təşkilat', 'Üzvlük tarixi'), row('td', 'IOSCO', '2020')))
    expect(block.rows.map((r) => r.organization)).toEqual(['IOSCO'])
  })

  it('keeps the first row of a table without a header', () => {
    const block = parsed(table(row('td', 'FinCoNet', '2025'), row('td', 'IOSCO', '2020')))
    expect(block.rows.map((r) => r.organization)).toEqual(['FinCoNet', 'IOSCO'])
  })

  it('shows the year cell as typed and sorts by its first year', () => {
    const block = parsed(table(HEADER, row('td', 'A', '2025-ci il'), row('td', 'B', '1997/1998'), row('td', 'C', '')))
    expect(block.rows.map((r) => [r.yearLabel, r.year])).toEqual([
      ['2025-ci il', 2025],
      ['1997/1998', 1997],
      ['', null],
    ])
  })

  it('links the organization to a web address only', () => {
    const block = parsed(
      table(
        HEADER,
        row('td', '<a target="_blank" rel="noopener noreferrer nofollow" href="https://www.iosco.org">IOSCO</a>', '2020'),
        row('td', '<a href="javascript:alert(1)">IAIS</a>', '2020'),
        row('td', '<a href="/az/page">SBFN</a>', '2022'),
      ),
    )
    expect(block.rows.map((r) => [r.organization, r.href])).toEqual([
      ['IOSCO', 'https://www.iosco.org'],
      ['IAIS', null],
      ['SBFN', null],
    ])
  })

  it('reads the first two cells and drops empty rows', () => {
    const block = parsed(table(HEADER, row('td', 'IOSCO', '2020', 'qeyd'), row('td', '', ''), row('td', 'IAIS')))
    expect(block.rows).toEqual([
      { organization: 'IOSCO', href: null, yearLabel: '2020', year: 2020 },
      { organization: 'IAIS', href: null, yearLabel: '', year: null },
    ])
  })

  it('splits the page text into intro and the text after the table; a second table stays content', () => {
    const second = table(row('td', 'x', 'y'))
    const block = parsed(`<p>Giriş</p>${table(HEADER, row('td', 'IOSCO', '2020'))}<p>Sonra</p>${second}`)
    expect(block.introHtml).toBe('<p>Giriş</p>')
    expect(block.restHtml).toBe(`<p>Sonra</p>${second}`)
    expect(block.rows).toHaveLength(1)
  })

  it('shows the whole text as intro when there is no table', () => {
    const html = '<p>Beynəlxalq təşkilatlarda üzvlük</p>'
    expect(parsed(html)).toEqual({ kind: 'memberships', introHtml: html, rows: [], restHtml: '' })
  })

  it('shows the whole text as intro when the table holds only a header', () => {
    const html = `<p>Giriş</p>${table(HEADER)}`
    expect(parsed(html)).toEqual({ kind: 'memberships', introHtml: html, rows: [], restHtml: '' })
  })
})
