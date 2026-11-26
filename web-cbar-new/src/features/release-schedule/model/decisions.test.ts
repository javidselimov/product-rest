import { describe, expect, it } from 'vitest'

import { decisionTiles } from './decisions'

const dates = [
  { date: '2026-02-04', withPressConference: true },
  { date: '2026-10-29', withPressConference: true },
  { date: '2026-12-23', withPressConference: false },
]

describe('decisionTiles', () => {
  it('marks the dates before, at and after the next decision', () => {
    const tiles = decisionTiles({ year: 2026, dates, next: dates[1]! })
    expect(tiles.map((t) => t.state)).toEqual(['past', 'next', 'future'])
    expect(tiles[0]).toEqual({ date: '2026-02-04', day: 4, month: 2, withPressConference: true, state: 'past' })
  })

  it('makes every date past when the next decision is in another year or unknown', () => {
    const nextYear = { date: '2027-02-03', withPressConference: false }
    expect(decisionTiles({ year: 2026, dates, next: nextYear }).every((t) => t.state === 'past')).toBe(true)
    expect(decisionTiles({ year: 2026, dates, next: null }).every((t) => t.state === 'past')).toBe(true)
  })

  it('is empty for a year without decisions', () => {
    expect(decisionTiles({ year: 2026, dates: [], next: null })).toEqual([])
  })
})
