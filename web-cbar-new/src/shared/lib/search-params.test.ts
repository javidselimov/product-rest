import { describe, expect, it } from 'vitest'

import {
  buildHref,
  dateParam,
  enumParam,
  first,
  optionalIdSchema,
  pageSchema,
  queryParam,
  yearParam,
} from './search-params'

describe('first', () => {
  it('massivdən ilk elementi, boşdan undefined qaytarır', () => {
    expect(first(['a', 'b'])).toBe('a')
    expect(first('  ')).toBeUndefined()
    expect(first(undefined)).toBeUndefined()
  })
})

describe('sxemlər', () => {
  it('page: yanlış və mənfi dəyər 1-ə düşür', () => {
    expect(pageSchema.parse('3')).toBe(3)
    expect(pageSchema.parse(['7', '9'])).toBe(7)
    expect(pageSchema.parse('abc')).toBe(1)
    expect(pageSchema.parse('-2')).toBe(1)
    expect(pageSchema.parse(undefined)).toBe(1)
  })

  it('optionalId: yanlış dəyər undefined', () => {
    expect(optionalIdSchema.parse('12')).toBe(12)
    expect(optionalIdSchema.parse('x')).toBeUndefined()
    expect(optionalIdSchema.parse(undefined)).toBeUndefined()
  })

  it('enumParam: siyahıdan kənar dəyər undefined', () => {
    const type = enumParam(['1', '2'])
    expect(type.parse('2')).toBe('2')
    expect(type.parse('3')).toBeUndefined()
  })

  it('dateParam: yalnız YYYY-MM-DD', () => {
    expect(dateParam.parse('2026-09-14')).toBe('2026-09-14')
    expect(dateParam.parse('14.09.2026')).toBeUndefined()
    expect(dateParam.parse('2026-13-99')).toBeUndefined()
  })

  it('queryParam: trim edir, boş sorğu boş sətirdir', () => {
    expect(queryParam.parse('  manat ')).toBe('manat')
    expect(queryParam.parse(undefined)).toBe('')
  })

  it('yearParam: diapazondan kənar undefined', () => {
    expect(yearParam.parse('2025')).toBe(2025)
    expect(yearParam.parse('1800')).toBeUndefined()
  })
})

describe('buildHref', () => {
  it('mövcud parametrləri qoruyur və page-i əvəz edir', () => {
    expect(buildHref('/az/laws', { type: 'law', categoryId: 3, page: 1 }, { page: 2 })).toBe(
      '/az/laws?type=law&categoryId=3&page=2',
    )
  })

  it('page=1 və undefined dəyərləri yazmır', () => {
    expect(buildHref('/az/laws', { type: undefined, page: 1 })).toBe('/az/laws')
    expect(buildHref('/az/laws', { page: 5 }, { page: 1 })).toBe('/az/laws')
  })
})
