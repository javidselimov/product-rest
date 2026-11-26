import { afterEach, describe, expect, it, vi } from 'vitest'

import { createPopupDismissal } from './popup-dismissal'

describe('createPopupDismissal', () => {
  const a = createPopupDismissal('test:a')
  const b = createPopupDismissal('test:b')

  afterEach(() => {
    sessionStorage.clear()
    vi.restoreAllMocks()
  })

  it('açar prefiks və id-dən qurulur — səhifədən asılı deyil', () => {
    expect(a.key(3)).toBe('test:a:3')
  })

  it('iki fərqli prefiks və iki fərqli id bir-birinə təsir etmir', () => {
    a.markDismissed(1)
    expect(a.isDismissed(1)).toBe(true)
    expect(b.isDismissed(1)).toBe(false)
    expect(a.isDismissed(2)).toBe(false)
  })

  it('storage xəta atanda çökmür: bağlanmayıb sayılır', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError')
    })
    expect(() => a.markDismissed(1)).not.toThrow()
    expect(a.isDismissed(1)).toBe(false)
  })
})
