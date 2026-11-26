import { describe, expect, it } from 'vitest'

import type { AttachmentFile } from '@/entities/content'
import { parseBlocks } from '@/shared/lib/html-blocks'

import { parseDocumentList } from './document-list'
import { publicationsLayoutFor } from './layouts'

const nodes = (html: string) => parseBlocks(html) ?? []
const ASSET: AttachmentFile = { id: 77, title: 'Mərkəzi Bankda istifadə olunan modellər', mimeType: 'application/pdf', sizeBytes: 591_888, group: null, url: '/media/77' }

describe('publicationsLayoutFor (spec 054 FR-016)', () => {
  it('picks the layout from the shape of the text, never from the slug', () => {
    expect(publicationsLayoutFor('<p>a</p><details data-accordion=""><summary>2025</summary><div>x</div></details>', [])).toBe('file-archive')
    expect(publicationsLayoutFor('<div><details><summary>2025</summary></details></div>', [])).toBe('file-archive')
    expect(publicationsLayoutFor('<p><a href="/media/1033">Konsepsiya</a></p>', [])).toBe('document-list')
    // Econometric models: no link in the text, the file is only in the page assets.
    expect(publicationsLayoutFor('<p>Ekonometrik modellər…</p>', [ASSET])).toBe('document-list')
    expect(publicationsLayoutFor('<p>Kök səhifənin mətni</p>', [])).toBe('plain')
    expect(publicationsLayoutFor('', [])).toBe('plain')
  })
})

describe('parseDocumentList (spec 054 contracts/publication-markup.md)', () => {
  it('keeps the intro and turns the file paragraphs into cards, in order', () => {
    const html = '<p>Giriş mətni</p><p><a data-media-link="" href="/media/1033">Konsepsiya</a></p><p>Əlavə</p><p><a href="/media/1034">İkinci</a></p>'
    const block = parseDocumentList(nodes(html), [])
    expect(block.introHtml).toBe('<p>Giriş mətni</p><p>Əlavə</p>')
    expect(block.files.map((f) => [f.id, f.title])).toEqual([
      [1033, 'Konsepsiya'],
      [1034, 'İkinci'],
    ])
  })

  it('builds the cards from the page assets when the text links no file', () => {
    const block = parseDocumentList(nodes('<p>Ekonometrik və riyazi modellər…</p>'), [ASSET])
    expect(block.files).toEqual([{ id: 77, title: 'Mərkəzi Bankda istifadə olunan modellər', url: '/media/77', mimeType: 'application/pdf', sizeBytes: 591_888 }])
  })
})
