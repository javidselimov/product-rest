import { describe, expect, it } from 'vitest'

import { dateBox, dateLabel, groupByMonth } from './format'

describe('dateBox', () => {
  it('is the day for one day', () => {
    expect(dateBox({ startsOn: '2026-10-29', endsOn: null })).toEqual({ day: '29', month: 10, isRange: false })
  })

  it('is a range for several days', () => {
    expect(dateBox({ startsOn: '2026-06-04', endsOn: '2026-06-05' })).toEqual({ day: '4–5', month: 6, isRange: true })
  })

  it('treats the same first and last day as one day', () => {
    expect(dateBox({ startsOn: '2026-06-04', endsOn: '2026-06-04' }).isRange).toBe(false)
  })

  it('keeps the first month when a range crosses one', () => {
    expect(dateBox({ startsOn: '2026-10-30', endsOn: '2026-11-02' })).toMatchObject({ day: '30–2', month: 10 })
  })
})

describe('dateLabel', () => {
  it('writes one day in full', () => {
    expect(dateLabel({ startsOn: '2026-11-04', endsOn: null }, 'az')).toBe('4 noyabr 2026')
  })

  it('shares month and year within a month', () => {
    expect(dateLabel({ startsOn: '2026-06-04', endsOn: '2026-06-05' }, 'az')).toBe('4–5 iyun 2026')
  })

  it('writes both dates across months', () => {
    expect(dateLabel({ startsOn: '2026-10-30', endsOn: '2026-11-02' }, 'az')).toBe('30 oktyabr 2026 – 2 noyabr 2026')
  })
})

describe('groupByMonth', () => {
  const items = [{ on: '2026-06-30' }, { on: '2026-06-01' }, { on: '2024-06-14' }]

  it('keeps the order and splits the same month of another year', () => {
    const groups = groupByMonth(items, (item) => item.on, 'az')

    expect(groups.map((group) => group.title)).toEqual(['İyun 2026', 'İyun 2024'])
    expect(groups[0]!.items).toHaveLength(2)
  })
})
