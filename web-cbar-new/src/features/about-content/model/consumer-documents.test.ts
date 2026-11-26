import { describe, expect, it } from 'vitest'

import type { AttachmentFile } from '@/entities/content'
import { parseBlocks } from '@/shared/lib/html-blocks'

import { parseConsumerDocuments } from './consumer-documents'

const nodes = (html: string) => parseBlocks(html) ?? []

const section = (title: string, body: string) =>
  `<details data-accordion=""><summary>${title}</summary><div data-type="details-content">${body}</div></details>`

const FILES: AttachmentFile[] = [{ id: 368, title: 'Qərar', mimeType: 'application/pdf', sizeBytes: 100, group: null, url: '/media/368' }]

describe('parseConsumerDocuments', () => {
  it('reads sections, text and the file paragraphs as cards', () => {
    const block = parseConsumerDocuments(
      nodes(
        section('Səhmdarlar', '<p><strong>Hüquqlar:</strong></p><ul><li><p>a</p></li></ul>') +
          section('Emitentlər', '<p>Mətn</p><p><a target="_blank" rel="noopener noreferrer nofollow" href="/media/368" data-media-link="">Qərar linki</a></p>'),
      ),
      FILES,
    )

    expect(block?.sections).toEqual([
      { title: 'Səhmdarlar', parts: [{ type: 'html', html: '<p><strong>Hüquqlar:</strong></p><ul><li><p>a</p></li></ul>' }] },
      {
        title: 'Emitentlər',
        parts: [
          { type: 'html', html: '<p>Mətn</p>' },
          { type: 'file', file: { id: 368, title: 'Qərar', url: '/media/368', mimeType: 'application/pdf', sizeBytes: 100 } },
        ],
      },
    ])
  })

  it('reads the legacy import: wrapper div, an empty link and a link in a div', () => {
    const legacy = `<div>\n ${section('Emitentlər', '<div><p>Mətn</p><a href=""></a><div><a data-media-link="" href="/media/1371">Məlumatlar</a></div></div>')}\n</div>`
    const block = parseConsumerDocuments(nodes(legacy))

    expect(block?.sections[0]?.parts.at(-1)).toEqual({ type: 'file', file: { id: 1371, title: 'Məlumatlar', url: '/media/1371', mimeType: null } })
  })

  it('keeps the text around the sections and is null without one', () => {
    const block = parseConsumerDocuments(nodes(`<p>Giriş</p>${section('A', '<p>x</p>')}<p>Son</p>`))
    expect([block?.introHtml, block?.restHtml]).toEqual(['<p>Giriş</p>', '<p>Son</p>'])
    expect(parseConsumerDocuments(nodes('<p>Text</p>'))).toBeNull()
  })
})
