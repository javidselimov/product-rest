/**
 * DOM-suz dayaz HTML ağacı (spec 024 research R3).
 */
import { describe, expect, it } from 'vitest'

import { aboutContractHtml, aboutPagesAz } from '@/shared/testing/fixtures/about'

import { attrOf, decodeEntities, parseBlocks, textOf } from './html-blocks'

const tags = (html: string) => parseBlocks(html)?.map((n) => n.tag)

describe('parseBlocks', () => {
  it('yuxarı səviyyə blokları sıra ilə qaytarır', () => {
    expect(tags(aboutContractHtml.main)).toEqual(['p', 'table', 'blockquote', 'h2', 'details', 'details', 'h2', 'p'])
  })

  it('outer birləşəndə boşluqlardan başqa heç nə itmir', () => {
    const html = aboutPagesAz.tarixi.content ?? ''
    const joined = (parseBlocks(html) ?? []).map((n) => n.outer).join('')
    expect(joined.replace(/\s+/g, '')).toBe(html.replace(/\s+/g, ''))
  })

  it('TipTap cədvəlinə enir: colgroup void col, tbody, tr, td', () => {
    const table = parseBlocks(aboutContractHtml.main)?.find((n) => n.tag === 'table')
    expect(table).toBeDefined()
    expect(tags(table!.inner)).toEqual(['colgroup', 'tbody'])
    const tbody = parseBlocks(table!.inner)!.find((n) => n.tag === 'tbody')!
    const rows = parseBlocks(tbody.inner)!
    expect(rows.map((r) => r.tag)).toEqual(['tr', 'tr'])
    const cells = parseBlocks(rows[0]!.inner)!
    expect(cells.map((c) => [c.tag, attrOf(c.attrs, 'colspan')])).toEqual([
      ['td', '1'],
      ['td', '1'],
    ])
    expect(textOf(cells[0]!.inner)).toBe('11.02.1992')
  })

  it('void və özü-bağlanan teqlər (`<img/>`, `<br>`) dərinliyi pozmur', () => {
    const nodes = parseBlocks('<p><img alt="a" src="/media/1"/><br>x</p><hr><p>y</p>')
    expect(nodes?.map((n) => n.tag)).toEqual(['p', 'hr', 'p'])
    expect(parseBlocks(nodes![0]!.inner)?.map((n) => n.tag)).toEqual(['img', 'br', '#text'])
  })

  it('eyni adlı iç-içə teq və atributda `>` simvolu', () => {
    const nodes = parseBlocks('<div title="a > b"><div><p>x</p></div></div><p>y</p>')
    expect(nodes?.map((n) => n.tag)).toEqual(['div', 'p'])
    expect(attrOf(nodes![0]!.attrs, 'title')).toBe('a > b')
  })

  it('yuxarı səviyyə mətni `#text` kimi saxlayır, boşluq mətni atır', () => {
    expect(parseBlocks('  <p>a</p>\n  sərbəst mətn <p>b</p>')?.map((n) => n.tag)).toEqual(['p', '#text', 'p'])
  })

  it('şərhləri keçir', () => {
    expect(tags('<!-- <p> --><p>a</p>')).toEqual(['p'])
  })

  it('balanssız HTML null qaytarır', () => {
    expect(parseBlocks('<p>bağlanmayıb')).toBeNull()
    expect(parseBlocks('<p>a</div>')).toBeNull()
    expect(parseBlocks('</p>')).toBeNull()
    expect(parseBlocks('<p><strong>a</p></strong>')).toBeNull()
  })

  it('boş sətir boş massiv qaytarır', () => {
    expect(parseBlocks('')).toEqual([])
    expect(parseBlocks('   \n ')).toEqual([])
  })
})

describe('attrOf', () => {
  it('dırnaqlı, dırnaqsız və boolean atributlar', () => {
    const attrs = ' data-accordion="" open src=\'/media/1\' width=200 alt="a &amp; b"'
    expect(attrOf(attrs, 'data-accordion')).toBe('')
    expect(attrOf(attrs, 'open')).toBe('')
    expect(attrOf(attrs, 'src')).toBe('/media/1')
    expect(attrOf(attrs, 'width')).toBe('200')
    expect(attrOf(attrs, 'alt')).toBe('a & b')
    expect(attrOf(attrs, 'title')).toBeNull()
    expect(attrOf(' data-src="x"', 'src')).toBeNull()
  })
})

describe('textOf və decodeEntities', () => {
  it('inline teq sözü bölmür, blok teq bölür', () => {
    expect(textOf('<p><strong>1983</strong>-cü ildə</p><p>Bakı</p>')).toBe('1983-cü ildə Bakı')
  })

  it('entity-ləri açır', () => {
    expect(decodeEntities('a&nbsp;b &amp; &#x259;&#65; &quot;x&quot; &bogus;')).toBe('a b & əA "x" &bogus;')
    expect(textOf('<p>m&#x259;rk&#x259;zi&nbsp;bank</p>')).toBe('mərkəzi bank')
  })
})
