/**
 * "Financial literacy" markup → blocks (spec 047 `contracts/cms-markup.md` §1).
 */
import { describe, expect, it } from 'vitest'

import type { AttachmentFile } from '@/entities/content'
import { prepareCmsHtml } from '@/shared/lib/cms-html'
import { parseBlocks } from '@/shared/lib/html-blocks'
import { rootAz, rootAzLegacy, rootEn } from '@/shared/testing/fixtures/literacy-section'

import { parseFinancialLiteracy } from './financial-literacy'

const parse = (html: string, files: AttachmentFile[] = []) => parseFinancialLiteracy(parseBlocks(prepareCmsHtml(html))!, files)
const kinds = (block: ReturnType<typeof parse>) => block.sections.map((s) => [s.heading, s.parts.map((p) => p.kind)])

describe('parseFinancialLiteracy', () => {
  it('reads the seed text: intro, four sections, quote, cards, chips, gallery and banner', () => {
    const block = parse(rootAz.content!)
    expect(kinds(block)).toEqual([
      [null, ['html']],
      ['İnsan maliyyə cəhətdən necə sağlam ola bilər?', ['html']],
      ['Maliyyə savadlılığı nədir?', ['quote', 'html']],
      ['Maliyyə sağlamlığının dörd prinsipi', ['html', 'principles', 'html']],
      ['Mərkəzi Bankın fəaliyyəti', ['html', 'subheading', 'chips', 'subheading', 'html', 'gallery']],
    ])
    const parts = block.sections.flatMap((s) => s.parts)
    expect(parts.find((p) => p.kind === 'quote')).toMatchObject({ source: 'İƏİT (İqtisadi Əməkdaşlıq və İnkişaf Təşkilatı), 2012' })
    expect(parts.find((p) => p.kind === 'principles')).toMatchObject({
      items: [
        { title: 'Dayanıqlı gəlir', description: 'Sabit və davamlı gəlir mənbəyinə malik olmaq' },
        { title: 'Səmərəli xərcləmə', description: 'Xərcləri planlaşdırmaq və büdcəyə nəzarət etmək' },
        { title: 'Effektiv qənaət', description: 'Gələcək və gözlənilməz hallar üçün yığım etmək' },
        { title: 'Rasional sərmayə', description: 'Risk və gəlirliliyi qiymətləndirərək investisiya etmək' },
      ],
    })
    const chips = parts.find((p) => p.kind === 'chips')
    expect(chips?.kind === 'chips' && chips.items).toHaveLength(7)
    expect(block.usedMediaIds).toEqual([1380, 1381, 1382, 1383, 1384, 1385, 1386])
    expect(block.cta).toMatchObject({
      eyebrow: 'Sizi də bu təşəbbüslərə qoşulmağa dəvət edirik!',
      title: 'Maliyyə sağlamlığınızın qayğısına birlikdə qalaq!',
      email: 'mmpi@cbar.az',
    })
    expect(block.cta?.addressHtml).toContain('mailto:mmpi@cbar.az')
  })

  it('reads the English seed text the same way', () => {
    const block = parse(rootEn.content!)
    expect(block.sections.map((s) => s.heading)).toEqual([
      null,
      'What does it mean to be financially healthy?',
      'What is financial literacy?',
      'Four principles of financial health',
      'Activities of the Central Bank',
    ])
    expect(block.cta?.email).toBe('mmpi@cbar.az')
  })

  it('the legacy text keeps every paragraph as ordinary content, its photos become the gallery', () => {
    const block = parse(rootAzLegacy.content!, rootAzLegacy.assets!.map((a) => ({ ...a, id: a.mediaId })))
    expect(kinds(block)).toEqual([[null, ['html', 'gallery']]])
    expect(block.cta).toBeNull()
    const html = block.sections[0]!.parts[0]!
    expect(html.kind === 'html' && html.html).toContain('mailto:MMPI@cbar.az')
  })

  it('a card without a description has only a title; a list with one plain item is not the cards', () => {
    const cards = parse('<ul><li><p><strong>Gəlir</strong></p></li></ul>').sections[0]!.parts[0]
    expect(cards).toEqual({ kind: 'principles', items: [{ title: 'Gəlir', description: null }] })
    const mixed = parse('<ul><li><p><strong>Gəlir</strong></p></li><li><p>Xərc</p></li></ul>').sections[0]!.parts[0]
    expect(mixed?.kind).toBe('html')
  })

  it('a plain list is chips only right after a subheading', () => {
    expect(parse('<h3>Qruplar</h3><ul><li><p>Tələbələr</p></li></ul>').sections[0]!.parts.map((p) => p.kind)).toEqual(['subheading', 'chips'])
    expect(parse('<p>Mətn</p><ul><li><p>Tələbələr</p></li></ul>').sections[0]!.parts.map((p) => p.kind)).toEqual(['html'])
  })

  it('only the first quote with a mail link is the banner; a one-paragraph quote has no source', () => {
    const mail = (to: string) => `<blockquote><p>Başlıq</p><p><a href="mailto:${to}">${to}</a></p></blockquote>`
    const block = parse(`<blockquote><p>Tərif</p></blockquote>${mail('a@cbar.az')}${mail('b@cbar.az')}`)
    expect(block.cta).toMatchObject({ eyebrow: '', title: 'Başlıq', email: 'a@cbar.az' })
    expect(block.sections[0]!.parts).toEqual([
      { kind: 'quote', html: '<p>Tərif</p>', source: null },
      expect.objectContaining({ kind: 'quote', source: 'b@cbar.az' }),
    ])
  })

  it('a photo paragraph linking a file that is not an image stays ordinary content', () => {
    const pdf: AttachmentFile = { id: 7, title: 'x', mimeType: 'application/pdf', sizeBytes: 1, group: null, url: '/media/7' }
    const block = parse('<p><a data-media-link="" href="/media/7">7</a></p>', [pdf])
    expect(block.sections[0]!.parts.map((p) => p.kind)).toEqual(['html'])
    expect(block.usedMediaIds).toEqual([])
  })
})
