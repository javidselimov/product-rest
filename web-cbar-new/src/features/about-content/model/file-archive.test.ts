import { describe, expect, it } from 'vitest'

import type { AttachmentFile } from '@/entities/content'
import { parseBlocks } from '@/shared/lib/html-blocks'

import { parseFileArchive, selectArchive } from './file-archive'

const nodes = (html: string) => parseBlocks(html) ?? []
const year = (label: string, body: string) => `<details data-accordion=""><summary>${label}</summary><div data-type="details-content">${body}</div></details>`
const file = (id: number, text: string, mark = true) => `<p><a ${mark ? 'data-media-link="" ' : ''}href="/media/${id}">${text}</a></p>`

const FILES: AttachmentFile[] = [
  { id: 948, title: 'Asset title 948', mimeType: 'application/pdf', sizeBytes: 2_961_312, group: null, url: '/media/948' },
]

describe('parseFileArchive (spec 054 contracts/publication-markup.md)', () => {
  it('groups the years newest first and keeps the text before and after', () => {
    const html = `<p>Giriş</p>${year('2024', file(948, 'Hesabat 2024'))}${year('2025', file(947, 'Hesabat 2025'))}<p>Son</p>`
    const block = parseFileArchive(nodes(html), FILES)

    expect(block?.groups.map((g) => [g.key, g.label, g.year])).toEqual([
      ['2025', '2025', 2025],
      ['2024', '2024', 2024],
    ])
    expect(block?.before).toEqual([{ type: 'html', html: '<p>Giriş</p>' }])
    expect(block?.after).toEqual([{ type: 'html', html: '<p>Son</p>' }])
  })

  it('takes the card name from the link text, the size and type from the page assets', () => {
    const block = parseFileArchive(nodes(year('2024', file(948, 'Hesabat 2024') + file(950, 'Siyahıda olmayan'))), FILES)
    expect(block?.groups[0]?.parts).toEqual([
      { type: 'file', file: { id: 948, title: 'Hesabat 2024', url: '/media/948', mimeType: 'application/pdf', sizeBytes: 2_961_312 } },
      { type: 'file', file: { id: 950, title: 'Siyahıda olmayan', url: '/media/950', mimeType: null } },
    ])
  })

  it('reads the legacy import: div wrappers, bare links and links without the editor mark', () => {
    const legacy = `<div>${year('2025', '<div><a href="/media/947">Hesabat</a></div><div><a data-media-link="" href="/media/948">İkinci</a></div>')}</div>`
    const block = parseFileArchive(nodes(legacy), FILES)
    expect(block?.groups[0]?.parts.map((p) => (p.type === 'file' ? p.file.id : p.type))).toEqual([947, 948])
  })

  it('trims labels with line breaks, merges a repeated year and keeps other labels after the years', () => {
    const html = `${year('Arxiv', file(1, 'a', false))}${year('\n   2026\n  ', file(2, 'b'))}${year('', file(3, 'c'))}${year('2026', file(4, 'd'))}`
    const block = parseFileArchive(nodes(html))
    expect(block?.groups.map((g) => [g.key, g.label, g.year, g.parts.length])).toEqual([
      ['2026', '2026', 2026, 2],
      ['Arxiv', 'Arxiv', null, 1],
      ['other-3', '', null, 1],
    ])
  })

  it('keeps a link to a page and plain text inside a group as text, and a file paragraph before the years as a card', () => {
    const html = `${file(1537, 'Şrift')}${year('2025', '<p><a href="https://www.cbar.az/page-895/x">02/2025. Məqalə</a></p><p>Qeyd</p>')}`
    const block = parseFileArchive(nodes(html))
    expect(block?.before).toEqual([{ type: 'file', file: { id: 1537, title: 'Şrift', url: '/media/1537', mimeType: null } }])
    expect(block?.groups[0]?.parts).toEqual([
      { type: 'html', html: '<p><a href="https://www.cbar.az/page-895/x">02/2025. Məqalə</a></p><p>Qeyd</p>' },
    ])
  })

  it('is null without accordions', () => {
    expect(parseFileArchive(nodes('<p>Mətn</p>'))).toBeNull()
  })
})

describe('selectArchive (spec 054 research R8)', () => {
  const block = parseFileArchive(
    nodes(`${year('2024', file(1, 'a'))}${year('2025', file(2, 'b'))}${year('Arxiv', file(3, 'c'))}`),
  )!
  it('defaults to the newest year, picks a key, shows every group for "all" and ignores an unknown value', () => {
    expect(selectArchive(block.groups, undefined)).toMatchObject({ selected: '2025', shown: [{ key: '2025' }] })
    expect(selectArchive(block.groups, '2024').shown.map((g) => g.key)).toEqual(['2024'])
    expect(selectArchive(block.groups, 'Arxiv').shown.map((g) => g.key)).toEqual(['Arxiv'])
    expect(selectArchive(block.groups, ['all']).shown.map((g) => g.key)).toEqual(['2025', '2024', 'Arxiv'])
    expect(selectArchive(block.groups, 'abc').selected).toBe('2025')
  })

  it('shows every group when the archive has no year', () => {
    const others = parseFileArchive(nodes(year('Arxiv', file(1, 'a'))))!
    expect(selectArchive(others.groups, undefined)).toMatchObject({ selected: 'all' })
  })
})
