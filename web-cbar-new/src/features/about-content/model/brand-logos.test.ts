/**
 * Rules of `specs/040-media-logo/contracts/cms-markup.md`.
 */
import { describe, expect, it } from 'vitest'

import type { AttachmentFile } from '@/entities/content'
import { prepareCmsHtml } from '@/shared/lib/cms-html'

import { mediaLayoutFor } from './layouts'
import { parseAbout } from './parse'
import type { BrandLogosBlock } from './types'

const HEADING = '<h2>Loqo versiyaları</h2>'
const row = (...cells: string[]) => `<tr>${cells.map((cell) => `<td>${cell}</td>`).join('')}</tr>`
const table = (...rows: string[]) => `<table><tbody>${rows.join('')}</tbody></table>`
const COLOURED = row('<p><img src="/media/101" alt="Rəngli loqo"></p>', '<p>Rəngli horizontal versiya</p>', '<p>Əsas versiya</p>', '<p>açıq</p>')
const WHITE = row('<p><img src="/media/102" alt=""></p>', '<p>Ağ horizontal versiya</p>', '<p>Tünd fonlar üçün</p>', '<p> Tünd </p>')

const svg: AttachmentFile = { id: 201, title: 'SVG', mimeType: 'image/svg+xml', sizeBytes: 49_152, group: null, url: '/media/201' }
const zip: AttachmentFile = { id: 202, title: 'cbar-logo-eps.zip', mimeType: 'application/zip', sizeBytes: 0, group: null, url: '/media/202' }

function parse(html: string, files: AttachmentFile[] = []): BrandLogosBlock {
  const [block, ...others] = parseAbout(prepareCmsHtml(html), 'brand-logos', { files })
  expect(others).toEqual([])
  if (block?.kind !== 'brand-logos') throw new Error(`unexpected block: ${block?.kind}`)
  return block
}

describe('mediaLayoutFor', () => {
  it.each(['merkezi-bankin-logosu', 'merkezi-bankin-logosu-copy', 'central-bank-logo', 'central-bank-logo-copy'])('%s gets the logo layout', (slug) => {
    expect(mediaLayoutFor(slug)).toBe('brand-logos')
  })
})

describe('parseAbout brand-logos', () => {
  it('turns the first table into versions and the first image into the hero', () => {
    const block = parse(`${HEADING}${table(COLOURED, WHITE)}<p>Sonra</p>`)

    expect(block.introHtml).toBe(HEADING)
    expect(block.restHtml).toBe('<p>Sonra</p>')
    expect(block.versions).toEqual([
      { image: { src: '/media/101', alt: 'Rəngli loqo' }, title: 'Rəngli horizontal versiya', description: 'Əsas versiya', background: 'light' },
      { image: { src: '/media/102', alt: 'Ağ horizontal versiya' }, title: 'Ağ horizontal versiya', description: 'Tünd fonlar üçün', background: 'dark' },
    ])
    expect(block.hero).toBe(block.versions[0])
  })

  it('accepts a row without image, description or background cell', () => {
    const block = parse(table(row('<p></p>', '<p>Rəngli vertikal versiya</p>', '<p></p>')))

    expect(block.versions).toEqual([{ image: null, title: 'Rəngli vertikal versiya', description: null, background: 'light' }])
    expect(block.hero).toBeNull()
  })

  it.each([
    ['a row with two cells', table(COLOURED, row('<p>Ad</p>', '<p>İzah</p>'))],
    ['a row without a name', table(COLOURED, row('<p></p>', '<p></p>', '<p>İzah</p>'))],
    ['more than eight rows', table(...Array.from({ length: 9 }, () => COLOURED))],
  ])('keeps the whole table as content for %s', (_, html) => {
    const block = parse(html)

    expect(block.versions).toEqual([])
    expect(block.hero).toBeNull()
    expect(block.introHtml).toContain('<table')
    expect(block.introHtml).toContain('Rəngli horizontal versiya')
  })

  it('leaves a second table in the content after the versions', () => {
    const block = parse(`${table(COLOURED)}${table(row('<p>a</p>', '<p>b</p>'))}`)

    expect(block.versions).toHaveLength(1)
    expect(block.restHtml).toContain('<table')
  })

  it('offers every page file as a download, labelled by title or format', () => {
    const block = parse(table(COLOURED), [svg, zip])

    expect(block.downloads).toEqual([
      { id: 201, label: 'SVG', size: 49_152, url: '/media/201' },
      { id: 202, label: 'ZIP', size: 0, url: '/media/202' },
    ])
  })

  it('keeps the downloads when the table is not recognised', () => {
    expect(parse('<p>Hələ cədvəl yoxdur</p>', [svg]).downloads).toHaveLength(1)
  })
})
