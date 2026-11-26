import { describe, expect, it } from 'vitest'

import { introHtml } from './intro'

/** The start of CMS page 130 as stored (dump 2026-09-14): a bold paragraph, then the old table. */
const PAGE_130 =
  '<p><strong>Mərkəzi Bankın internet səhifəsi vasitəsilə açıqlanan məlumatların strukturu və dövriliyi</strong></p>\n' +
  '<table><tbody><tr><td><p><strong>Məzmun</strong></p>\n</td><td><p><strong>Dövrilik</strong></p>\n</td></tr>\n' +
  '<tr><td><p>İllik inflyasiya</p>\n</td><td><p>Aylıq</p>\n</td></tr>\n</tbody></table>' +
  '<p>Cədvəldən sonrakı qeyd</p>'

describe('introHtml', () => {
  it('keeps only what precedes the old table while rows exist', () => {
    expect(introHtml(PAGE_130, true)).toBe(
      '<p><strong>Mərkəzi Bankın internet səhifəsi vasitəsilə açıqlanan məlumatların strukturu və dövriliyi</strong></p>',
    )
  })

  it('also cuts a table already wrapped for scrolling', () => {
    const wrapped = '<p>Giriş</p><div class="tableWrapper"><table><tbody><tr><td>x</td></tr></tbody></table></div>'
    expect(introHtml(wrapped, true)).toBe('<p>Giriş</p>')
  })

  it('keeps the whole CMS text, old table included, when there are no rows', () => {
    expect(introHtml(PAGE_130, false)).toBe(PAGE_130)
  })

  it('keeps a page without a table as it is', () => {
    expect(introHtml('<p>Yeni giriş mətni.</p>', true)).toBe('<p>Yeni giriş mətni.</p>')
  })

  it('is empty without content', () => {
    expect(introHtml(null, true)).toBe('')
  })
})
