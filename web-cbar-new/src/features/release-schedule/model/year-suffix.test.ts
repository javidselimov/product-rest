import { describe, expect, it } from 'vitest'

import { azYearSuffix } from './year-suffix'

describe('azYearSuffix', () => {
  it.each([
    [2026, 'cı'],
    [2027, 'ci'],
    [2023, 'cü'],
    [2024, 'cü'],
    [2029, 'cu'],
    [2030, 'cu'],
    [2040, 'cı'],
    [2050, 'ci'],
    [2090, 'cı'],
    [2000, 'ci'],
    [2100, 'cü'],
  ])('%i-%s il', (year, suffix) => {
    expect(azYearSuffix(year)).toBe(suffix)
  })
})
