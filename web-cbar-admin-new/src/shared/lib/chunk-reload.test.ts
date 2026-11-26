import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  installChunkReloadGuard,
  isChunkLoadError,
  reloadOnce,
} from './chunk-reload'

const originalLocation = window.location
let reload: ReturnType<typeof vi.fn>

beforeEach(() => {
  sessionStorage.clear()
  reload = vi.fn()
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: { ...originalLocation, reload },
  })
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-09-23T10:00:00Z'))
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: originalLocation,
  })
})

describe('isChunkLoadError', () => {
  it.each([
    'Failed to fetch dynamically imported module: http://x/assets/a-1.js',
    'error loading dynamically imported module: http://x/assets/a-1.js',
    'Importing a module script failed.',
    'Unable to preload CSS for /assets/a.css',
  ])('"%s" chunk xətasıdır', (message) => {
    expect(isChunkLoadError(new TypeError(message))).toBe(true)
  })

  it('sarğı xətasının cause-u chunk xətasıdırsa tanınır', () => {
    const inner = new TypeError('Failed to fetch dynamically imported module: /a.js')
    expect(isChunkLoadError(new Error('wrapper', { cause: inner }))).toBe(true)
  })

  it('adi xəta və qeyri-xəta chunk xətası deyil', () => {
    expect(isChunkLoadError(new Error('boom'))).toBe(false)
    expect(isChunkLoadError(null)).toBe(false)
    expect(isChunkLoadError('Failed')).toBe(false)
  })
})

describe('reloadOnce', () => {
  it('ilk çağırışda bir dəfə yeniləyir', () => {
    expect(reloadOnce()).toBe(true)
    expect(reload).toHaveBeenCalledTimes(1)
  })

  it('10 s ərzində ikinci dəfə yeniləmir (dövrə yoxdur)', () => {
    reloadOnce()
    vi.setSystemTime(Date.now() + 9_000)
    expect(reloadOnce()).toBe(false)
    expect(reload).toHaveBeenCalledTimes(1)
  })

  it('10 s-dən sonra yenidən yeniləyir', () => {
    reloadOnce()
    vi.setSystemTime(Date.now() + 10_001)
    expect(reloadOnce()).toBe(true)
    expect(reload).toHaveBeenCalledTimes(2)
  })

  it('sessionStorage əlçatmazdırsa yeniləmir', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    expect(reloadOnce()).toBe(false)
    expect(reload).not.toHaveBeenCalled()
  })
})

describe('installChunkReloadGuard', () => {
  it('vite:preloadError hadisəsində yeniləyir və default davranışı dayandırır', () => {
    installChunkReloadGuard()
    const event = new Event('vite:preloadError', { cancelable: true })
    window.dispatchEvent(event)
    expect(reload).toHaveBeenCalledTimes(1)
    expect(event.defaultPrevented).toBe(true)
  })
})
