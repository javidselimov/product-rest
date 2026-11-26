/**
 * Legacy markup parity and sanitising (spec 002 SC-003, FR-014, D2).
 */
import { describe, expect, it } from 'vitest'

import { legacyCmsHtml, legacyCounts } from '@/shared/testing/fixtures/cms-html'

import { lazyLoadImages, markMediaLinks, prepareCmsHtml, sanitizeCmsHtml, wrapTables } from './cms-html'

function count(html: string, pattern: RegExp): number {
  return (html.match(pattern) ?? []).length
}

describe('prepareCmsHtml — structure counts', () => {
  const out = prepareCmsHtml(legacyCmsHtml)

  it('keeps the number of accordions, tables, images, YouTube embeds and iframes', () => {
    expect(count(out, /<details\b[^>]*data-accordion/g)).toBe(legacyCounts.accordions)
    expect(count(out, /<table\b/g)).toBe(legacyCounts.tables)
    expect(count(out, /<img\b/g)).toBe(legacyCounts.images)
    expect(count(out, /data-youtube-video/g)).toBe(legacyCounts.youtube)
    expect(count(out, /<iframe\b/g)).toBe(legacyCounts.iframes)
  })

  it('a media link stays relative and opens in a new window', () => {
    // spec 003 D1: the address is not joined with `{API_URL}` — it goes through the proxy route.
    expect(count(out, /href="\/media\/12"/g)).toBe(legacyCounts.mediaLinks)
    expect(out).toMatch(/<a[^>]*href="\/media\/12"[^>]*target="_blank"[^>]*rel="noopener noreferrer"/)
    expect(out).toContain('src="/media/34"')
    expect(out).not.toContain('http://localhost:5139/media/')
  })

  it('every image loads lazily (spec 003 FR-012)', () => {
    expect(count(out, /<img\b[^>]*loading="lazy"/g)).toBe(legacyCounts.images)
    expect(count(out, /<img\b[^>]*decoding="async"/g)).toBe(legacyCounts.images)
  })

  it('leaves data-* attributes and inline style alone', () => {
    expect(out).toContain('data-type="details-content"')
    expect(out).toContain('style="color: inherit"')
  })
})

describe('sanitizeCmsHtml — three harmful classes', () => {
  const out = sanitizeCmsHtml(legacyCmsHtml)

  it('removes <script> blocks', () => {
    expect(out).not.toMatch(/<script/i)
    expect(out).not.toContain("alert('xss')")
  })

  it('removes on* attributes and keeps the element', () => {
    expect(out).not.toMatch(/\son[a-z]+=/i)
    expect(out).toContain('Klik')
  })

  it('removes javascript: hrefs, entity variant included', () => {
    expect(out).not.toMatch(/javascript:/i)
    expect(out).not.toMatch(/JaVaScRiPt&#58;/)
    expect(out).toContain('Zərərli keçid')
  })

  it('keeps YouTube and generic iframe sources', () => {
    expect(out).toContain('https://www.youtube.com/embed/abc123')
    expect(out).toContain('https://maps.example.az/embed')
  })
})

describe('markMediaLinks', () => {
  it('is idempotent', () => {
    const once = markMediaLinks(legacyCmsHtml)
    expect(markMediaLinks(once)).toBe(once)
  })

  it('does not repeat existing target and rel attributes', () => {
    const html = '<a target="_self" rel="nofollow" href="/media/1">x</a>'
    const out = markMediaLinks(html)

    expect(count(out, /target=/g)).toBe(1)
    expect(count(out, /rel=/g)).toBe(1)
    expect(out).toContain('target="_self"')
  })
})

describe('lazyLoadImages', () => {
  it('is idempotent', () => {
    const once = lazyLoadImages(legacyCmsHtml)
    expect(lazyLoadImages(once)).toBe(once)
  })

  it('gives an image lazy loading and async decoding', () => {
    expect(lazyLoadImages('<img src="/media/1">')).toBe(
      '<img loading="lazy" decoding="async" src="/media/1">',
    )
  })

  it('also catches a self-closing tag', () => {
    expect(lazyLoadImages('<img src="/media/1" />')).toContain('loading="lazy"')
  })

  it("does not override an editor's `loading`", () => {
    const html = '<img loading="eager" src="/media/1">'
    expect(lazyLoadImages(html)).toBe(html)
  })

  it('leaves content without images alone', () => {
    const html = '<p>Mətn</p><table><tr><td>a</td></tr></table>'
    expect(lazyLoadImages(html)).toBe(html)
  })
})

describe('wrapTables', () => {
  it('puts every table in its own scroll box and keeps the rest of the content', () => {
    const html = '<p>Mətn</p><table style="min-width: 75px"><tr><td>a</td></tr></table><table><tr><td>b</td></tr></table>'

    expect(wrapTables(html)).toBe(
      '<p>Mətn</p><div class="tableWrapper"><table style="min-width: 75px"><tr><td>a</td></tr></table></div>' +
        '<div class="tableWrapper"><table><tr><td>b</td></tr></table></div>',
    )
  })

  it('is idempotent', () => {
    const once = wrapTables('<table><tr><td>a</td></tr></table>')
    expect(wrapTables(once)).toBe(once)
  })

  it('leaves content without tables alone', () => {
    expect(wrapTables('<p>tablet</p>')).toBe('<p>tablet</p>')
  })
})

describe('prepareCmsHtml', () => {
  it('empty content is an empty string', () => {
    expect(prepareCmsHtml(null)).toBe('')
    expect(prepareCmsHtml(undefined)).toBe('')
    expect(prepareCmsHtml('')).toBe('')
  })
})
