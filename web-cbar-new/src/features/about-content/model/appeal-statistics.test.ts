import { describe, expect, it } from 'vitest'

import { parseBlocks } from '@/shared/lib/html-blocks'

import { buildSummary, channelLabel, parseAppealStatistics, parseCount } from './appeal-statistics'
import type { ReportSeries } from './types'

const nodes = (html: string) => parseBlocks(html) ?? []

const SECTORS = ['Kredit təşkilatları', 'Sığortaçılar', 'Cəmi']

const cell = (text: string) => `<td colspan="1" rowspan="1"><p>${text}</p></td>`
const row = (cells: string[]) => `<tr>${cells.map(cell).join('')}</tr>`

/** A months × sectors table; `filled` maps a month row to its two sector values. */
function table(filled: Record<string, [number, number]>, months = ['Yanvar', 'Fevral', 'Mart']) {
  const rows = months.map((m) => {
    const values = filled[m]
    return row([m, ...(values ? [String(values[0]), String(values[1]), String(values[0] + values[1])] : ['', '', ''])])
  })
  return `<table><tbody>${row(['Aylar', ...SECTORS])}${rows.join('')}${row(['Yekun', '1', '2', '3'])}</tbody></table>`
}

const details = (summary: string, body: string) =>
  `<details data-accordion=""><summary>${summary}</summary><div data-type="details-content">${body}</div></details>`

const channel = (title: string, years: Record<string, string>) =>
  details(title, Object.entries(years).map(([year, body]) => details(year, body)).join(''))

const MOBILE = `<table><tbody>${row(['Şəhər və rayonlar', 'Yanvar', 'Fevral'])}${row(['Kürdəmir', '9', ''])}${row(['Cəmi', '9', ''])}</tbody></table>`

describe('appeal statistics helpers', () => {
  it('reads counts and drops the channel affixes in az and en', () => {
    expect(parseCount('1 510')).toBe(1510)
    expect(parseCount('2.142')).toBe(2142)
    expect(parseCount('-')).toBeNull()
    expect(parseCount('')).toBeNull()
    expect(channelLabel('Yazılı müraciətlər üzrə statistika')).toBe('Yazılı müraciətlər')
    expect(channelLabel('Statistics of written appeals')).toBe('Written appeals')
    expect(channelLabel('Statistics on mobile reception of citizens')).toBe('Mobile reception of citizens')
    expect(channelLabel('WhatsApp statistics')).toBe('WhatsApp')
  })
})

describe('parseAppealStatistics', () => {
  it('reads channels, years newest first, and both table forms', () => {
    const block = parseAppealStatistics(
      nodes(
        channel('Yazılı müraciətlər üzrə statistika', { 2025: table({ Yanvar: [1, 2] }), 2026: table({ Yanvar: [3, 4] }) }) +
          channel('Vətəndaşların səyyar qəbulu üzrə statistika', { 2026: MOBILE }),
      ),
    )

    expect(block?.channels.map((c) => [c.index, c.label, c.years.map((y) => [y.year, y.table.form])])).toEqual([
      [1, 'Yazılı müraciətlər', [[2026, 'months'], [2025, 'months']]],
      [2, 'Vətəndaşların səyyar qəbulu', [[2026, 'generic']]],
    ])
    const written = block?.channels[0]?.years[0]?.table
    expect(written).toMatchObject({ form: 'months', totalIndex: 2, totalRow: { label: 'Yekun', cells: [1, 2, 3] } })
    expect(block?.channels[1]?.years[0]?.table).toEqual({
      form: 'generic',
      head: ['Şəhər və rayonlar', 'Yanvar', 'Fevral'],
      rows: [
        ['Kürdəmir', '9', ''],
        ['Cəmi', '9', ''],
      ],
    })
  })

  it('reads the legacy import: wrapper div, cells without paragraphs, th header', () => {
    const legacy = `<div>\n ${details(
      'Yazılı müraciətlər üzrə statistika',
      `<div><table><tbody><tr><td><div>${details(
        '2026',
        '<div><table><tbody><tr><th><em>Aylar</em></th><th><strong>Kredit</strong></th><th><strong>Cəmi</strong></th></tr><tr><td>Yanvar</td><td>1510</td><td>1510</td></tr></tbody></table></div>',
      )}</div></td></tr></tbody></table></div>`,
    )}\n</div>`
    const block = parseAppealStatistics(nodes(legacy))

    expect(block?.channels[0]?.years[0]?.table).toMatchObject({ form: 'months', head: ['Aylar', 'Kredit', 'Cəmi'] })
    expect(block?.summary).toEqual({ year: 2026, monthLabel: 'Yanvar', cards: [{ channel: 'Yazılı müraciətlər', total: 1510, sectors: [{ sector: 'Kredit', value: 1510 }] }] })
  })

  it('reads the legacy en text: an empty year with its table after it, and years after the channel closed', () => {
    // api-cbar-test, page 94 en, 2026-11-17: "Statistics of written appeals".
    const en =
      details('Statistics of written appeals', `${details('2026', '')}${table({ Yanvar: [1, 2] })}`) +
      details('2025', table({ Yanvar: [3, 4] })) +
      details('Statistics of incoming calls', details('2026', table({ Yanvar: [5, 6] })))
    const block = parseAppealStatistics(nodes(en))

    expect(block?.channels.map((c) => [c.label, c.years.map((y) => y.year)])).toEqual([
      ['Written appeals', [2026, 2025]],
      ['Incoming calls', [2026]],
    ])
    expect(block?.restHtml).toBe('')
  })

  it('adds the infographics archive from the companion page', () => {
    const archive = details('2026', details('May', '<p><a href="/media/7" data-media-link="">May</a></p>'))
    const block = parseAppealStatistics(nodes(channel('A üzrə statistika', { 2026: table({ Yanvar: [1, 1] }) })), { html: archive, files: [] })

    expect(block?.infographics?.latest?.month.file.id).toBe(7)
  })

  it('is null without a channel', () => {
    expect(parseAppealStatistics(nodes('<p>Text</p>'))).toBeNull()
  })

  it('builds the infographics archive from the monthly reports, over the companion page (spec 052)', () => {
    const archive = details('2026', details('May', '<p><a href="/media/7" data-media-link="">May</a></p>'))
    const infographics: ReportSeries = {
      key: 'infographics',
      name: 'Statistik hesabat',
      periodMonths: 1,
      reports: [{ year: 2026, month: 9, file: { id: 30, url: '/media/30', mimeType: 'application/pdf' } }],
    }
    const block = parseAppealStatistics(
      nodes(channel('A üzrə statistika', { 2026: table({ Yanvar: [1, 1] }) })),
      { html: archive, files: [] },
      [infographics],
    )

    expect(block?.infographics?.latest?.month.file).toMatchObject({ id: 30, title: 'Statistik hesabat (Sentyabr 2026)' })
    expect(block?.channels).toHaveLength(1)
  })
})

describe('buildSummary (clarify Q3)', () => {
  const parse = (html: string) => parseAppealStatistics(nodes(html))?.channels ?? []

  it('takes the latest month every channel has filled', () => {
    const channels = parse(
      channel('Daxil olan zənglər üzrə statistika', { 2026: table({ Yanvar: [10, 20], Fevral: [30, 40], Mart: [50, 60] }) }) +
        channel('Yazılı müraciətlər üzrə statistika', { 2026: table({ Yanvar: [1, 2], Fevral: [3, 4] }) }) +
        channel('Vətəndaşların səyyar qəbulu üzrə statistika', { 2026: MOBILE }),
    )

    expect(buildSummary(channels)).toEqual({
      year: 2026,
      monthLabel: 'Fevral',
      cards: [
        { channel: 'Daxil olan zənglər', total: 70, sectors: [{ sector: 'Kredit təşkilatları', value: 30 }, { sector: 'Sığortaçılar', value: 40 }] },
        { channel: 'Yazılı müraciətlər', total: 7, sectors: [{ sector: 'Kredit təşkilatları', value: 3 }, { sector: 'Sığortaçılar', value: 4 }] },
      ],
    })
  })

  it('passes over a new year added empty and looks across the year boundary', () => {
    const channels = parse(
      channel('A üzrə statistika', { 2026: table({ Yanvar: [1, 1] }), 2025: table({ Dekabr: [2, 2] }, ['Dekabr']) }) +
        channel('B üzrə statistika', { 2026: table({}), 2025: table({ Dekabr: [3, 3] }, ['Dekabr']) }),
    )

    expect(buildSummary(channels)).toMatchObject({ year: 2025, monthLabel: 'Dekabr', cards: [{ total: 4 }, { total: 6 }] })
  })

  it('is null when a channel has no filled month at all', () => {
    const channels = parse(channel('A üzrə statistika', { 2026: table({ Yanvar: [1, 1] }) }) + channel('B üzrə statistika', { 2026: table({}) }))

    expect(buildSummary(channels)).toBeNull()
  })

  it('is null when a cell of the month is not a number', () => {
    const channels = parse(channel('A üzrə statistika', { 2026: `<table><tbody>${row(['Aylar', 'X', 'Cəmi'])}${row(['Yanvar', '-', '5'])}</tbody></table>` }))

    expect(buildSummary(channels)).toBeNull()
  })
})
