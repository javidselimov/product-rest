import { describe, expect, it } from 'vitest'

import { formatNumber, formatSigned } from './numbers'

describe('formatNumber', () => {
  it('az vergül, en nöqtə işlədir', () => {
    expect(formatNumber(7.25, 'az', { minFraction: 2, maxFraction: 4 })).toBe('7,25')
    expect(formatNumber(7.25, 'en', { minFraction: 2, maxFraction: 4 })).toBe('7.25')
    expect(formatNumber(6.12346, 'en', { minFraction: 2, maxFraction: 4 })).toBe('6.1235')
  })

  it('onluq sayını sabitləyir', () => {
    expect(formatNumber(250, 'az', { minFraction: 2, maxFraction: 2 })).toBe('250,00')
    expect(formatNumber(14, 'en', { maxFraction: 0 })).toBe('14')
  })

  it('null və qeyri-rəqəm → —', () => {
    expect(formatNumber(null, 'az')).toBe('—')
    expect(formatNumber(undefined, 'en')).toBe('—')
    expect(formatNumber(Number.NaN, 'en')).toBe('—')
  })
})

describe('formatSigned', () => {
  it('müsbətə +, mənfiyə − qoyur', () => {
    expect(formatSigned(0.25, 'az', { minFraction: 2 })).toBe('+0,25')
    expect(formatSigned(-0.1, 'az', { minFraction: 2 })).toBe('−0,10')
    expect(formatSigned(0.75, 'en', { minFraction: 2 })).toBe('+0.75')
  })

  it('sıfır və sıfıra yuvarlanan dəyər işarəsizdir', () => {
    expect(formatSigned(0, 'en', { minFraction: 2, maxFraction: 2 })).toBe('0.00')
    expect(formatSigned(-0.001, 'en', { minFraction: 2, maxFraction: 2 })).toBe('0.00')
  })

  it('null → —', () => {
    expect(formatSigned(null, 'az')).toBe('—')
  })
})
