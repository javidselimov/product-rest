import { describe, expect, it } from 'vitest'

import { nextPeriod, periodLabel } from './period'

const AZ = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'İyun', 'İyul', 'Avqust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr']
const EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const az = (month: number) => AZ[month - 1] ?? ''
const en = (month: number) => EN[month - 1] ?? ''

describe('nextPeriod', () => {
  it('moves to the next month of the same year', () => {
    expect(nextPeriod(2026, 5)).toEqual({ year: 2026, month: 6 })
  })

  it('moves from December to January of the next year', () => {
    expect(nextPeriod(2026, 12)).toEqual({ year: 2027, month: 1 })
  })
})

describe('periodLabel', () => {
  it('names one month and its year', () => {
    expect(periodLabel(2026, 9, 1, az)).toBe('Sentyabr 2026')
    expect(periodLabel(2026, 9, 1, en)).toBe('September 2026')
  })

  it('names the twelve months ending with the month', () => {
    expect(periodLabel(2026, 5, 12, az)).toBe('İyun 2025 – May 2026')
  })

  it('starts the twelve months in the previous year from January', () => {
    expect(periodLabel(2026, 1, 12, az)).toBe('Fevral 2025 – Yanvar 2026')
  })

  it('stays in one year when a twelve-month period ends in December', () => {
    expect(periodLabel(2025, 12, 12, en)).toBe('January 2025 – December 2025')
  })
})
