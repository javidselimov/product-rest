import { describe, expect, it } from 'vitest'

import { parseBlocks } from '@/shared/lib/html-blocks'

import { parseComplaintIndex } from './complaint-index'
import type { ReportSeries } from './types'

const nodes = (html: string) => parseBlocks(html) ?? []

const archive = (id: number) =>
  `<details data-accordion=""><summary>2026</summary><div data-type="details-content"><details data-accordion=""><summary>May</summary><div data-type="details-content"><p><a href="/media/${id}" data-media-link="">May index</a></p></div></details></div></details>`

const METHODOLOGY =
  '<h2>Şikayət indeksinin metodologiyası</h2><p>Düstur:</p>' +
  '<blockquote><p>Şikayət indeksi =</p><p>Şikayətlər üzrə bazar payı</p><p>Müştərilər üzrə bazar payı</p></blockquote>' +
  '<p>Tərif.</p><p>Qeyd: təhdid yaratmır.</p><p>Əlavə qeyd.</p>'

describe('parseComplaintIndex', () => {
  it('reads the archive and the methodology: formula, text and the small print after the note', () => {
    const block = parseComplaintIndex(nodes(archive(1) + METHODOLOGY))

    expect(block?.tabs.map((tab) => tab.key)).toEqual(['bank'])
    expect(block?.tabs[0]?.methodology).toEqual({
      title: 'Şikayət indeksinin metodologiyası',
      parts: [
        { type: 'html', html: '<p>Düstur:</p>' },
        { type: 'formula', left: 'Şikayət indeksi =', numerator: 'Şikayətlər üzrə bazar payı', denominator: 'Müştərilər üzrə bazar payı' },
        { type: 'html', html: '<p>Tərif.</p>' },
        { type: 'note', html: '<p>Qeyd: təhdid yaratmır.</p><p>Əlavə qeyd.</p>' },
      ],
    })
  })

  it('adds the insurance tab from the companion page with its own files', () => {
    const block = parseComplaintIndex(nodes(archive(1)), [], {
      html: archive(2),
      files: [{ id: 2, title: 'Insurance May', mimeType: 'application/pdf', sizeBytes: 1, group: null, url: '/media/2' }],
    })

    expect(block?.tabs.map((tab) => [tab.key, tab.archive.latest?.month.file.title])).toEqual([
      ['bank', 'May index'],
      ['insurance', 'Insurance May'],
    ])
  })

  it('keeps one tab when the companion page is missing or has no archive', () => {
    expect(parseComplaintIndex(nodes(archive(1)), [], null)?.tabs).toHaveLength(1)
    expect(parseComplaintIndex(nodes(archive(1)), [], { html: '<p>x</p>', files: [] })?.tabs).toHaveLength(1)
  })

  it('has no methodology without its heading, and a two-paragraph quote stays text', () => {
    const block = parseComplaintIndex(nodes(`${archive(1)}<p>Note</p>`))
    expect(block?.tabs[0]?.methodology).toBeNull()
    expect(block?.tabs[0]?.restHtml).toBe('<p>Note</p>')

    const loose = parseComplaintIndex(nodes(`${archive(1)}<h2>M</h2><blockquote><p>a</p><p>b</p></blockquote>`))
    expect(loose?.tabs[0]?.methodology?.parts).toEqual([{ type: 'html', html: '<blockquote><p>a</p><p>b</p></blockquote>' }])
  })

  it('is null when the bank page has no archive', () => {
    expect(parseComplaintIndex(nodes('<p>Text</p>'))).toBeNull()
  })
})

describe('parseComplaintIndex with monthly reports (spec 052)', () => {
  const report = (id: number, month: number) => ({ year: 2026, month, file: { id, url: `/media/${id}`, mimeType: 'application/pdf' } })
  const bank: ReportSeries = { key: 'bank-complaint-index', name: 'Bank index', periodMonths: 1, reports: [report(10, 9), report(11, 8)] }
  const insurance: ReportSeries = { key: 'insurance-complaint-index', name: 'Insurance index', periodMonths: 12, reports: [report(20, 5)] }
  const INTRO = '<p>Giriş.</p>'
  const BETWEEN = '<p>Arxivdən sonra.</p>'

  it('builds the bank archive from the reports and keeps the page text around the legacy archive', () => {
    const block = parseComplaintIndex(nodes(INTRO + archive(1) + BETWEEN + METHODOLOGY), [], undefined, [bank])
    const tab = block?.tabs[0]

    expect(tab?.archive.years.map((y) => [y.year, y.months.map((m) => m.file.id)])).toEqual([[2026, [10, 11]]])
    expect(tab?.archive.latest?.month.file.title).toBe('Bank index (Sentyabr 2026)')
    expect(tab?.introHtml).toBe(INTRO)
    expect(tab?.restHtml).toBe(BETWEEN)
    expect(tab?.methodology?.title).toBe('Şikayət indeksinin metodologiyası')
  })

  it('builds the bank tab from the reports when the page text has no archive left', () => {
    const block = parseComplaintIndex(nodes(INTRO + METHODOLOGY), [], undefined, [bank])

    expect(block?.tabs.map((tab) => tab.key)).toEqual(['bank'])
    expect(block?.tabs[0]?.introHtml).toBe(INTRO)
    expect(block?.tabs[0]?.methodology?.parts).toHaveLength(4)
  })

  it('builds the insurance tab from its reports, with the methodology of the companion page', () => {
    const block = parseComplaintIndex(nodes(archive(1)), [], { html: archive(2) + METHODOLOGY, files: [] }, [bank, insurance])
    const tab = block?.tabs[1]

    expect(tab?.key).toBe('insurance')
    expect(tab?.archive.latest?.month.file).toMatchObject({ id: 20, title: 'Insurance index (İyun 2025 – May 2026)' })
    expect(tab?.methodology?.title).toBe('Şikayət indeksinin metodologiyası')
  })

  it('builds the insurance tab from its reports without the companion page', () => {
    const block = parseComplaintIndex(nodes(archive(1)), [], null, [insurance])

    expect(block?.tabs.map((tab) => [tab.key, tab.archive.latest?.month.file.id])).toEqual([
      ['bank', 1],
      ['insurance', 20],
    ])
    expect(block?.tabs[1]?.methodology).toBeNull()
  })

  it('keeps the spec 050 path for a series without reports', () => {
    expect(parseComplaintIndex(nodes(archive(1)), [], undefined, [])).toEqual(parseComplaintIndex(nodes(archive(1))))
  })
})
