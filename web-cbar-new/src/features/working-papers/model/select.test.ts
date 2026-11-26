import { describe, expect, it } from 'vitest'

import { workingPapersAz } from '@/shared/testing/fixtures/working-papers'

import { WORKING_PAPERS_PAGE_SIZE } from './constants'
import { filterPapers, formatCode, formatKey, paginate, paperYears, parseKey } from './select'

const titles = (items: { title: string }[]) => items.map((p) => p.title)

describe('working paper selection (spec 054 FR-008, FR-009)', () => {
  it('searches title, authors and keywords, folding case and the Azerbaijani i letters', () => {
    expect(titles(filterPapers(workingPapersAz, { q: 'muxtarov' }))).toEqual([
      'Likvidlik şəraitindən asılı overnayt banklararası faiz dərəcəsinin dəyişkənliyi: əsas determinantlar və siyasət tövsiyələri',
    ])
    expect(filterPapers(workingPapersAz, { q: 'İNFLYASİYA' }).length).toBeGreaterThan(0)
    expect(filterPapers(workingPapersAz, { q: 'İNFLYASİYA' })).toEqual(filterPapers(workingPapersAz, { q: 'inflyasiya' }))
    // A keyword only: "məcburi ehtiyatlar" is not in any title.
    expect(filterPapers(workingPapersAz, { q: 'MƏCBURİ EHTİYAT' }).length).toBe(1)
  })

  it('filters by year and keeps the API order (year, then number, descending)', () => {
    const y2024 = filterPapers(workingPapersAz, { year: 2024 })
    expect(y2024.every((p) => p.year === 2024)).toBe(true)
    expect(y2024.map((p) => p.code)).toEqual(['04/2024', '03/2024', '02/2024', '01/2024'])
    expect(filterPapers(workingPapersAz, {})).toHaveLength(workingPapersAz.length)
  })

  it('lists the years that have papers, newest first', () => {
    const years = paperYears(workingPapersAz)
    expect(years[0]).toBe(2026)
    expect([...years].sort((a, b) => b - a)).toEqual(years)
    expect(new Set(years).size).toBe(years.length)
  })

  it('pages by ten and clamps a page out of range', () => {
    const first = paginate(workingPapersAz, 1)
    expect(first.items).toHaveLength(WORKING_PAPERS_PAGE_SIZE)
    expect(first.total).toBe(workingPapersAz.length)
    const last = paginate(workingPapersAz, 99)
    expect(last.page).toBe(Math.ceil(workingPapersAz.length / WORKING_PAPERS_PAGE_SIZE))
    expect(last.items.length).toBeGreaterThan(0)
    expect(paginate([], 3)).toEqual({ items: [], page: 1, total: 0 })
  })

  it('formats and parses the address key', () => {
    expect(formatKey(2, 2025)).toBe('02-2025')
    expect(formatCode(2, 2025)).toBe('02/2025')
    expect(parseKey('02-2025')).toEqual({ number: 2, year: 2025 })
    expect(parseKey('2-2025')).toBeNull()
    expect(parseKey('02-25')).toBeNull()
    expect(parseKey('abc')).toBeNull()
  })
})
