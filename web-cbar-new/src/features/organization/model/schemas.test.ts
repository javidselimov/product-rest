import { describe, expect, it } from 'vitest'

import { initials, splitBoard } from './schemas'

describe('splitBoard (spec 024 FR-012)', () => {
  it('birinci üzv sədr, qalanı müavinlər — sıra qorunur', () => {
    expect(splitBoard(['a', 'b', 'c'])).toEqual({ chair: 'a', deputies: ['b', 'c'] })
  })

  it('bir üzv: müavin yoxdur; boş siyahı: sədr yoxdur', () => {
    expect(splitBoard(['a'])).toEqual({ chair: 'a', deputies: [] })
    expect(splitBoard([])).toEqual({ chair: null, deputies: [] })
  })
})

describe('initials', () => {
  it('ilk iki sözün baş hərfi, Azərbaycan hərfləri ilə', () => {
    expect(initials('əli İsmayıl oğlu')).toBe('Əİ')
    expect(initials(null)).toBe('•')
  })
})
