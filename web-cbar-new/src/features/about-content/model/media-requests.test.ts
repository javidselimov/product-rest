/**
 * Rules of `specs/037-media-requests/contracts/cms-markup.md`.
 */
import { describe, expect, it } from 'vitest'

import { prepareCmsHtml } from '@/shared/lib/cms-html'

import { mediaLayoutFor } from './layouts'
import { parseAbout } from './parse'
import type { MediaRequestsBlock } from './types'

const INTRO = '<p>Mətn.</p>\n<h3>Media ilə əməkdaşlıq</h3>\n<p>İzah:</p>\n'
const EMAIL_ROW = '<tr><td><p>E-mail</p></td><td><p><a href="mailto:press@cbar.az">press@cbar.az</a></p></td><td><p></p></td></tr>'
const PHONE_ROW = '<tr><td><p>Telefon</p></td><td><p><a href="tel:966">(+994 12) 966</a></p></td><td><p>Daxili nömrə: 2243</p></td></tr>'
const table = (...rows: string[]) => `<table><tbody>${rows.join('')}</tbody></table>`

const parse = (html: string) => {
  const [block, ...others] = parseAbout(prepareCmsHtml(html), 'media-requests')
  expect(others).toEqual([])
  return block as MediaRequestsBlock
}

describe('mediaLayoutFor', () => {
  it('only the media requests page gets the layout', () => {
    expect(mediaLayoutFor('media-sorgulari')).toBe('media-requests')
    expect(mediaLayoutFor('fotoqalereya')).toBe('plain')
  })
})

describe('parseAbout media-requests', () => {
  it('splits the pasted markup into intro and cards', () => {
    const block = parse(`${INTRO}${table(EMAIL_ROW, PHONE_ROW)}\n`)

    expect(block.introHtml).toContain('<h3>Media ilə əməkdaşlıq</h3>')
    expect(block.introHtml).not.toContain('<table')
    expect(block.restHtml).toBe('')
    expect(block.cards).toEqual([
      { label: 'E-mail', value: 'press@cbar.az', href: 'mailto:press@cbar.az', note: null, kind: 'email' },
      { label: 'Telefon', value: '(+994 12) 966', href: 'tel:966', note: 'Daxili nömrə: 2243', kind: 'phone' },
    ])
  })

  it('reads the form the editor saves', () => {
    const saved =
      '<table style="min-width: 75px"><colgroup><col style="min-width: 25px"><col style="min-width: 25px"></colgroup><tbody>' +
      '<tr><td colspan="1" rowspan="1"><p>Phone</p></td>' +
      '<td colspan="1" rowspan="1"><p><a target="_blank" rel="noopener noreferrer nofollow" href="tel:966">966</a></p></td></tr>' +
      '</tbody></table>'

    expect(parse(saved).cards).toEqual([{ label: 'Phone', value: '966', href: 'tel:966', note: null, kind: 'phone' }])
  })

  it('skips a heading row', () => {
    expect(parse(table('<tr><th>Ad</th><th>Dəyər</th></tr>', EMAIL_ROW)).cards).toHaveLength(1)
  })

  it('picks the icon from the value', () => {
    const kinds = parse(
      table(
        '<tr><td>a</td><td>info@cbar.az</td></tr>',
        '<tr><td>b</td><td>(+994 12) 493 5058</td></tr>',
        '<tr><td>c</td><td>Bakı, Heydər Əliyev prospekti</td></tr>',
      ),
    ).cards.map((card) => card.kind)

    expect(kinds).toEqual(['email', 'phone', null])
  })

  it('keeps only safe links', () => {
    const [card] = parse(table('<tr><td>a</td><td><a href="/media/4">fayl</a></td></tr>')).cards
    expect(card?.href).toBeNull()
  })

  it.each([
    ['a row with one cell', table('<tr><td>a</td></tr>')],
    ['a row with four cells', table('<tr><td>a</td><td>b</td><td>c</td><td>d</td></tr>')],
    ['an empty name', table(EMAIL_ROW, '<tr><td><p></p></td><td>b</td></tr>')],
    ['an empty value', table(EMAIL_ROW, '<tr><td>a</td><td><p></p></td></tr>')],
    ['five rows', table(EMAIL_ROW, EMAIL_ROW, EMAIL_ROW, EMAIL_ROW, EMAIL_ROW)],
  ])('leaves the whole table in the content: %s', (_, html) => {
    const block = parse(`<p>Mətn.</p>${html}`)

    expect(block.cards).toEqual([])
    expect(block.introHtml).toContain('<table')
    expect(block.introHtml).toContain('Mətn.')
  })

  it('without a table the content stays whole', () => {
    const block = parse(INTRO)
    expect(block.cards).toEqual([])
    expect(block.introHtml).toContain('İzah:')
  })

  it('only the first table becomes cards, the rest follows them', () => {
    const block = parse(`${table(EMAIL_ROW)}<p>Sonra</p>${table('<tr><td>x</td><td>y</td></tr>')}`)

    expect(block.cards).toHaveLength(1)
    expect(block.restHtml).toContain('Sonra')
    expect(block.restHtml).toContain('<table')
  })
})
