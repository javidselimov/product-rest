import { describe, expect, it } from 'vitest'

import { splitAtFirstDetails } from './split-details'

const year = (y: string, body: string) => `<details data-accordion=""><summary>${y}</summary><div data-type="details-content">${body}</div></details>`

describe('splitAtFirstDetails (spec 054)', () => {
  it('splits the editor form at the first accordion', () => {
    const intro = '<p>İşçi məqalələr Mərkəzi Bankın əməkdaşları tərəfindən aparılan tədqiqat işlərini əhatə edir.</p>'
    const html = `${intro}${year('2025', '<p><a href="https://www.cbar.az/page-895/x">02/2025. Başlıq</a></p>')}${year('2024', '<p>…</p>')}`

    const { before, rest } = splitAtFirstDetails(html)
    expect(before).toBe(intro)
    expect(rest.startsWith('<details')).toBe(true)
    expect(rest).toContain('<summary>2024</summary>')
  })

  it('opens the legacy div wrappers first', () => {
    const html = `<div><p>Giriş</p>${year('2025', '<div><a href="/x">a</a></div>')}</div>`
    const { before, rest } = splitAtFirstDetails(html)
    expect(before).toBe('<p>Giriş</p>')
    expect(rest).toContain('<summary>2025</summary>')
  })

  it('keeps the whole text as the intro when there is no accordion', () => {
    expect(splitAtFirstDetails('<p>Yalnız mətn</p>')).toEqual({ before: '<p>Yalnız mətn</p>', rest: '' })
    expect(splitAtFirstDetails('')).toEqual({ before: '', rest: '' })
  })
})
