import { describe, expect, it } from 'vitest'

import {
  dateStringToDate,
  dateToDateString,
  formatDate,
  formatDateTime,
  isDateString,
  isLocalDateTime,
  isoToLocalInput,
  localInputToIso,
} from './date-io'

describe('date-io', () => {
  it('formatDate/formatDateTime boş və yanlış dəyər üçün "—"', () => {
    expect(formatDate(null)).toBe('—')
    expect(formatDate('abc')).toBe('—')
    expect(formatDateTime(undefined)).toBe('—')
  })

  it('formatDate az/en formatlayır', () => {
    expect(formatDate('2025-09-07T00:00:00', 'az')).toMatch(/07\.09\.2025/)
    expect(formatDate('2025-09-07T00:00:00', 'en')).toMatch(/07\/09\/2025/)
  })

  it('tarix-only string (DateOnly) saat qurşağından asılı olmayaraq eyni günü verir', () => {
    expect(formatDate('2026-01-14', 'az')).toBe('14.01.2026')
    expect(formatDate('2026-01-14', 'en')).toBe('14/01/2026')
  })

  it('datetime-local ↔ ISO round-trip', () => {
    const local = isoToLocalInput('2025-09-07T10:30:00.000Z')
    expect(local).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)
    expect(localInputToIso(local)).toBe(new Date(local).toISOString())
    expect(localInputToIso('')).toBeNull()
    expect(isoToLocalInput('yanlis')).toBe('')
  })

  it('yyyy-MM-dd ↔ Date round-trip', () => {
    const d = dateStringToDate('2025-09-07')
    expect(d?.getFullYear()).toBe(2025)
    expect(d?.getMonth()).toBe(8)
    expect(dateToDateString(d)).toBe('2025-09-07')
    expect(dateToDateString(null)).toBe('')
    expect(dateStringToDate('2025-13-40')).toBeNull()
  })

  it('format yoxlayıcıları', () => {
    expect(isDateString('2025-09-07')).toBe(true)
    expect(isDateString('07.09.2025')).toBe(false)
    expect(isLocalDateTime('2025-09-07T10:30')).toBe(true)
    expect(isLocalDateTime('2025-09-07')).toBe(false)
  })
})
