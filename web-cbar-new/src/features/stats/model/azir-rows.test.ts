import { describe, expect, it } from 'vitest'

import { azirDataset } from '@/shared/testing/fixtures/stats'

import { hasReservePlan, toAzirTableRows } from './azir-rows'
import { azirValueSchema } from './schemas'

describe('toAzirTableRows', () => {
  it('yalnız 1D və rate > 0, tarix azalan', () => {
    const rows = toAzirTableRows(azirDataset)

    expect(rows.map((r) => r.date)).toEqual([
      '2026-09-14',
      '2026-09-12',
      '2026-09-10',
      '2026-08-31',
      '2025-12-31',
      '2025-06-10',
      '2025-01-15',
      '2024-12-31',
    ])
    expect(rows.some((r) => r.date === '2026-09-11')).toBe(false)
  })

  it('həcm, say və işarəni köçürür; boş sahə null qalır', () => {
    const rows = toAzirTableRows(azirDataset)

    expect(rows.find((r) => r.date === '2026-09-12')).toEqual({
      date: '2026-09-12',
      rate: 7.25,
      dealVolume: 250,
      dealCount: 21,
      isReservePlan: false,
    })
    expect(rows.find((r) => r.date === '2026-09-14')).toMatchObject({ dealVolume: null, dealCount: null })
    expect(rows.find((r) => r.date === '2026-08-31')?.isReservePlan).toBe(true)
  })

  it('köhnə API cavabı (yeni sahələrsiz) null / false verir', () => {
    const legacy = azirValueSchema.parse({ valueDate: '2026-09-01', term: '1D', rate: 7 })

    expect(toAzirTableRows([legacy])).toEqual([
      { date: '2026-09-01', rate: 7, dealVolume: null, dealCount: null, isReservePlan: false },
    ])
  })
})

describe('hasReservePlan', () => {
  it('yalnız göstərilən sətirlər üzrə hesablanır', () => {
    const rows = toAzirTableRows(azirDataset)

    expect(hasReservePlan(rows)).toBe(true)
    expect(hasReservePlan(rows.filter((r) => r.date >= '2026-09-01'))).toBe(false)
    expect(hasReservePlan([])).toBe(false)
  })
})
