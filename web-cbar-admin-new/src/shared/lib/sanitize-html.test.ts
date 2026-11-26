import { describe, expect, it } from 'vitest'

import { sanitizeHtml } from './sanitize-html'

// Teq arası boşluqlar müqayisədə nəzərə alınmır — serializasiya onları dəyişə bilər.
const collapse = (html: string) => html.replace(/>\s+</g, '><').trim()

describe('sanitizeHtml', () => {
  it('script teqini silir', () => {
    const out = sanitizeHtml('<p>salam</p><script>alert(1)</script>')
    expect(out).toBe('<p>salam</p>')
  })

  it('img onerror atributunu silir, şəkli saxlayır', () => {
    const out = sanitizeHtml('<img src="/media/1" onerror="alert(1)" alt="a">')
    expect(out).toBe('<img src="/media/1" alt="a">')
  })

  it('JavaScript: sxemli href-i silir (böyük-kiçik hərf fərqi yoxdur)', () => {
    const out = sanitizeHtml('<a href="JavaScript:alert(1)">link</a>')
    expect(out).toBe('<a>link</a>')
  })

  it('boşluqla gizlədilmiş sxemi tanıyır', () => {
    const out = sanitizeHtml('<a href="  java\tscript:alert(1)">link</a>')
    expect(out).toBe('<a>link</a>')
  })

  it('svg onload atributunu silir', () => {
    const out = sanitizeHtml(
      '<svg onload="alert(1)"><circle r="1"></circle></svg>',
    )
    expect(out).not.toContain('onload')
    expect(out).toContain('<svg>')
  })

  it('data:text/html href-i silir, data:image src-ni saxlayır', () => {
    const out = sanitizeHtml(
      '<a href="data:text/html,x">a</a><img src="data:image/png;base64,AAAA">',
    )
    expect(out).toBe('<a>a</a><img src="data:image/png;base64,AAAA">')
  })

  it('vbscript sxemini və formaction-ı silir', () => {
    const out = sanitizeHtml(
      '<form action="vbscript:x"><button formaction="javascript:y">b</button></form>',
    )
    expect(out).toBe('<form><button>b</button></form>')
  })

  it('style/object/embed/meta/link/base elementlərini silir', () => {
    const out = sanitizeHtml(
      '<meta charset="utf-8"><link rel="x" href="y"><base href="/"><style>p{}</style>' +
        '<object data="x"></object><embed src="y"><p>ok</p>',
    )
    expect(out).toBe('<p>ok</p>')
  })

  it('iframe-i saxlayır, srcdoc-u silir', () => {
    const out = sanitizeHtml(
      '<iframe src="https://www.youtube-nocookie.com/embed/abc" srcdoc="<script>1</script>"></iframe>',
    )
    expect(out).toBe(
      '<iframe src="https://www.youtube-nocookie.com/embed/abc"></iframe>',
    )
  })

  it('legacy markup-ı dəyişməz buraxır', () => {
    const legacy = `
      <details data-accordion="">
        <summary>Başlıq</summary>
        <div data-type="details-content"><p>Mətn</p></div>
      </details>
      <table>
        <tbody>
          <tr><th>A</th><th>B</th></tr>
          <tr><td>1</td><td>2</td></tr>
        </tbody>
      </table>
      <p><a data-media-link="" href="/media/3">fayl</a></p>
      <p><a href="/media/4"><img src="/media/4" alt="şəkil"></a></p>
      <iframe src="https://www.google.com/maps/embed?pb=!1m18" width="600" height="450" style="border:0" allowfullscreen="" loading="lazy"></iframe>
    `
    expect(collapse(sanitizeHtml(legacy))).toBe(collapse(legacy))
  })

  it('boş sətirdə boş sətir qaytarır', () => {
    expect(sanitizeHtml('')).toBe('')
  })
})
