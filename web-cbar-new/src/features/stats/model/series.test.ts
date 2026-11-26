import { describe, expect, it } from 'vitest'

import {
  azirFixture,
  azirReferenceFixture,
  inflationFixture,
  yieldCurveFixture,
} from '@/shared/testing/fixtures/stats'

import {
  azirDailySeries,
  azirLatest,
  azirSeries,
  hasChartData,
  inflationSeries,
  inflationSummary,
  inflationYearLines,
  yieldSeries,
} from './series'

describe('azir seriyaları', () => {
  it('hər müddət üçün bir xətt, tarixlər sıralı', () => {
    const data = azirSeries(azirFixture)

    expect(data.categories).toEqual(['2026-09-10', '2026-09-11', '2026-09-14'])
    expect(data.series.map((s) => s.name)).toEqual([
      '180D',
      '1D',
      '1M',
      '1W',
      '30D',
      '90D',
    ])
    expect(data.series[0].data).toHaveLength(3)
  })

  it('gündəlik 1D seriyası MM.DD etiketləri ilə', () => {
    const data = azirDailySeries(azirFixture)

    expect(data.categories).toEqual(['09.10', '09.11', '09.14'])
    expect(data.series[0].data).toEqual([7, 7.01, 7.02])
  })

  it('gündəlik seriya tam DD.MM.YYYY etiketi ilə (ilin keçidi)', () => {
    const data = azirDailySeries(azirReferenceFixture, '1D', 'full')

    expect(data.categories.slice(0, 2)).toEqual(['31.12.2024', '15.01.2025'])
    expect(data.categories.at(-1)).toBe('12.09.2026')
  })

  it('azirLatest son tarixin dəyərlərini verir', () => {
    const { date, byTerm, reserve1D } = azirLatest(azirFixture)

    expect(date).toBe('2026-09-14')
    expect(byTerm.get('1D')).toBe(7.02)
    expect(byTerm.get('30D')).toBe(7.32)
    expect(reserve1D).toBe(false)
  })

  it('azirLatest son 1D işarəlidirsə reserve1D verir', () => {
    const flagged = azirReferenceFixture.filter((v) => v.valueDate <= '2026-08-31')

    expect(azirLatest(flagged)).toMatchObject({ date: '2026-08-31', reserve1D: true })
  })
})

describe('inflyasiya', () => {
  it('statistika seriyası ay adları və parametr etiketləri ilə', () => {
    const data = inflationSeries(
      inflationFixture.filter((v) => v.year === 2026),
      'en',
      (code) => `etiket:${code}`,
    )

    expect(data.categories[0]).toBe('January')
    expect(data.series.map((s) => s.name)).toEqual([
      'etiket:core_yoy',
      'etiket:cpi_yoy',
      'etiket:target',
    ])
    expect(data.series[0].kind).toBe('bar')
  })

  it('ana səhifə il xətləri son 2 ili 12 aylıq verir', () => {
    const lines = inflationYearLines(inflationFixture)

    expect(lines.map((l) => l.year)).toEqual([2025, 2026])
    expect(lines[1].values).toHaveLength(12)
    expect(lines[1].values[8]).toBeNull()
  })

  it('xülasə sonuncu cari və hədəf dəyəri verir', () => {
    const { current, target } = inflationSummary(inflationFixture)

    expect(current?.year).toBe(2026)
    expect(current?.month).toBe(8)
    expect(target).toBe(4)
  })
})

describe('gəlirlik və boş vəziyyət', () => {
  it('yieldSeries API sırasını saxlayır', () => {
    const data = yieldSeries(yieldCurveFixture, 'Gəlirlik')

    expect(data.categories).toEqual(['3M', '6M', '1Y', '2Y', '5Y'])
    expect(data.series[0].smooth).toBe(true)
  })

  it('hasChartData yalnız nöqtə olanda doğrudur', () => {
    expect(hasChartData(null)).toBe(false)
    expect(hasChartData({ categories: [], series: [] })).toBe(false)
    expect(
      hasChartData({
        categories: ['a'],
        series: [{ name: 'x', kind: 'line', data: [null] }],
      }),
    ).toBe(false)
    expect(hasChartData(azirSeries(azirFixture))).toBe(true)
  })
})
