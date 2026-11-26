import { describe, expect, it } from 'vitest'

import { safeDecodeURIComponent } from './uri'

describe('safeDecodeURIComponent', () => {
  it('decodes a percent-encoded slug', () => {
    expect(safeDecodeURIComponent('m%C9%99rk%C9%99zi-bank')).toBe('mərkəzi-bank')
    expect(safeDecodeURIComponent('tarix')).toBe('tarix')
  })

  it('gives a malformed value back instead of throwing', () => {
    expect(safeDecodeURIComponent('%')).toBe('%')
    expect(safeDecodeURIComponent('100%-test')).toBe('100%-test')
    expect(safeDecodeURIComponent('%E0%A4%A')).toBe('%E0%A4%A')
  })
})
