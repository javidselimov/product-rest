import { describe, expect, it } from 'vitest'

import { YEAR_SORT, orderByYear, parseYearSort } from './year-sort'

type Row = { id: number; year: number | null }

// The editor's order: years mixed, two rows of 2025, one row without a year.
const rows: Row[] = [
  { id: 1, year: 2020 },
  { id: 2, year: 2025 },
  { id: 3, year: null },
  { id: 4, year: 2025 },
  { id: 5, year: 1997 },
]
const yearOf = (row: Row) => row.year
const ids = (list: Row[]) => list.map((row) => row.id)

describe('parseYearSort', () => {
  it('reads "oldest"', () => {
    expect(parseYearSort('oldest')).toBe(YEAR_SORT.OLDEST)
  })

  it.each([undefined, 'newest', 'xyz', '', ['oldest']])('falls back to newest first for %j', (value) => {
    expect(parseYearSort(value)).toBe(YEAR_SORT.NEWEST)
  })
})

describe('orderByYear', () => {
  it('puts the newest year first and keeps the editor order inside a year', () => {
    expect(ids(orderByYear(rows, yearOf, YEAR_SORT.NEWEST))).toEqual([2, 4, 1, 5, 3])
  })

  it('puts the oldest year first, still keeping the editor order inside a year', () => {
    expect(ids(orderByYear(rows, yearOf, YEAR_SORT.OLDEST))).toEqual([5, 1, 2, 4, 3])
  })

  it('leaves the input untouched', () => {
    orderByYear(rows, yearOf, YEAR_SORT.OLDEST)
    expect(ids(rows)).toEqual([1, 2, 3, 4, 5])
  })
})
