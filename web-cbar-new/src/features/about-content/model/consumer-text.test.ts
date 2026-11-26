import { describe, expect, it } from 'vitest'

import { parseBlocks } from '@/shared/lib/html-blocks'

import { parseConsumerText } from './consumer-text'

const parse = (html: string) => parseConsumerText(parseBlocks(html) ?? [])

describe('parseConsumerText', () => {
  it('splits the root into the lead, text and the numbered list', () => {
    const block = parse('<p>Lead.</p><p>In this regard:</p><ul><li><p>one;</p></li><li><p>two.</p></li></ul>')

    expect(block).toEqual({
      kind: 'consumer-text',
      leadHtml: 'Lead.',
      parts: [
        { type: 'html', html: '<p>In this regard:</p>' },
        { type: 'numbered', itemsHtml: ['<p>one;</p>', '<p>two.</p>'] },
      ],
    })
  })

  it('reads the legacy root: one paragraph, then a list without paragraphs', () => {
    const block = parse('<p>Lead. In this regard:</p>\n<ul>\n<li>one;</li>\n<li>two.</li>\n</ul>')

    expect(block?.leadHtml).toBe('Lead. In this regard:')
    expect(block?.parts).toEqual([{ type: 'numbered', itemsHtml: ['one;', 'two.'] }])
  })

  it('reads the officials page: a bold first paragraph is the lead, a bold line is a heading', () => {
    const block = parse('<p><strong>List of officials</strong></p><p>By decree,</p><p><strong>Officials:</strong></p><ol><li><p>Deputies;</p></li></ol><p>Closing.</p>')

    expect(block?.leadHtml).toBe('List of officials')
    expect(block?.parts).toEqual([
      { type: 'html', html: '<p>By decree,</p>' },
      { type: 'heading', text: 'Officials:' },
      { type: 'numbered', itemsHtml: ['<p>Deputies;</p>'] },
      { type: 'html', html: '<p>Closing.</p>' },
    ])
  })

  it('is null for an empty page or one that does not open with a paragraph', () => {
    expect(parse('')).toBeNull()
    expect(parse('<ul><li>x</li></ul>')).toBeNull()
  })
})
