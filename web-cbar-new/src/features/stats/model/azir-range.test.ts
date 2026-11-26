import { describe, expect, it } from 'vitest'

import { defaultAzirRange, legacyDateToIso, parseAzirRange } from './azir-range'

const TODAY = '2026-10-08'

describe('parseAzirRange', () => {
  it('parametrsiz → bu gün − 60 … bu gün', () => {
    expect(parseAzirRange({}, TODAY)).toEqual({ from: '2026-08-09', to: TODAY, error: null, isDefault: true })
    expect(defaultAzirRange(TODAY)).toEqual(parseAzirRange({}, TODAY))
  })

  it('verilmiş aralıq olduğu kimi qalır', () => {
    expect(parseAzirRange({ dateFrom: '2026-01-01', dateTo: '2026-01-31' }, TODAY)).toEqual({
      from: '2026-01-01',
      to: '2026-01-31',
      error: null,
      isDefault: false,
    })
  })

  it('yalnız dateFrom → dateTo bu gündür', () => {
    expect(parseAzirRange({ dateFrom: '2026-09-01' }, TODAY)).toMatchObject({ from: '2026-09-01', to: TODAY, error: null })
  })

  it('gələcək dateTo bu günə endirilir', () => {
    expect(parseAzirRange({ dateFrom: '2026-09-01', dateTo: '2027-01-01' }, TODAY)).toMatchObject({
      to: TODAY,
      error: null,
    })
  })

  it.each([
    [{ dateFrom: 'abc' }, 'format'],
    [{ dateFrom: '2026-02-30' }, 'format'],
    [{ dateTo: '01/09/2026' }, 'format'],
    [{ dateFrom: '2026-10-01', dateTo: '2026-09-01' }, 'order'],
    [{ dateFrom: '2010-01-01', dateTo: '2026-01-01' }, 'tooLong'],
  ] as const)('%o → %s xətası və default aralıq', (params, error) => {
    expect(parseAzirRange(params, TODAY)).toEqual({ ...defaultAzirRange(TODAY), error })
  })

  it('3653 gün hələ icazəlidir, 3654 yox', () => {
    expect(parseAzirRange({ dateFrom: '2016-10-07', dateTo: TODAY }, TODAY).error).toBeNull()
    expect(parseAzirRange({ dateFrom: '2016-10-06', dateTo: TODAY }, TODAY).error).toBe('tooLong')
  })

  it('string[] → birincisi', () => {
    expect(parseAzirRange({ dateFrom: ['2026-09-01', 'x'], dateTo: ['2026-09-30'] }, TODAY)).toMatchObject({
      from: '2026-09-01',
      to: '2026-09-30',
      error: null,
    })
  })
})

describe('legacyDateToIso', () => {
  it('d/m/Y → ISO', () => {
    expect(legacyDateToIso('01/09/2026')).toBe('2026-09-01')
    expect(legacyDateToIso('30/09/2026')).toBe('2026-09-30')
    expect(legacyDateToIso('1/9/2026')).toBe('2026-09-01')
  })

  it('səhv dəyər → null', () => {
    expect(legacyDateToIso('31/02/2026')).toBeNull()
    expect(legacyDateToIso('2026-09-01')).toBeNull()
    expect(legacyDateToIso('abc')).toBeNull()
    expect(legacyDateToIso(null)).toBeNull()
    expect(legacyDateToIso('')).toBeNull()
  })
})
