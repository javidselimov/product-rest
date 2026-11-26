import { describe, expect, it } from 'vitest'

import { foldForSearch } from './search-fold'

describe('foldForSearch', () => {
  it.each([
    ['İllik', 'illik'],
    ['ILLIK', 'illik'],
    ['ılıq', 'iliq'],
    ['Məzənnə', 'məzənnə'],
    ['REPO', 'repo'],
  ])('folds %s to %s', (input, folded) => {
    expect(foldForSearch(input)).toBe(folded)
  })
})
