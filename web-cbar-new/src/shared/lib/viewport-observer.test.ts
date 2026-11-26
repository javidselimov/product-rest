/**
 * Shared viewport observer (spec 049 R1): one observer per margin, the browser's first report is
 * flagged, and without IntersectionObserver every target counts as visible.
 */
import { afterEach, describe, expect, it, vi } from 'vitest'

import { installIntersectionObserver } from '@/shared/testing/intersection-observer'

import { observeViewport } from './viewport-observer'

afterEach(() => vi.unstubAllGlobals())

const el = () => document.createElement('div')

describe('observeViewport', () => {
  it('shares one observer between targets with the same margin and disconnects after the last one', () => {
    const io = installIntersectionObserver()
    const stopA = observeViewport(el(), '0px', () => {})
    const stopB = observeViewport(el(), '0px', () => {})
    const stopC = observeViewport(el(), '100% 0px', () => {})
    expect(io.observerCount()).toBe(2)

    stopA()
    stopC()
    expect(io.observerCount()).toBe(1)
    stopB()
    expect(io.observerCount()).toBe(0)
  })

  it('flags only the first report of a target as initial', () => {
    const io = installIntersectionObserver()
    const target = el()
    const cb = vi.fn()
    observeViewport(target, '0px', cb)
    io.enter(target)
    io.leave(target)

    expect(cb.mock.calls.map(([entry]) => entry)).toEqual([
      { isIntersecting: false, initial: true },
      { isIntersecting: true, initial: false },
      { isIntersecting: false, initial: false },
    ])
  })

  it('stops reporting a target once it is unobserved', () => {
    const io = installIntersectionObserver()
    const target = el()
    const cb = vi.fn()
    const stop = observeViewport(target, '0px', cb)
    stop()
    io.enter(target)
    expect(cb).toHaveBeenCalledTimes(1)
    expect(io.isObserved(target)).toBe(false)
  })

  it('reports visible at once when IntersectionObserver does not exist', () => {
    vi.stubGlobal('IntersectionObserver', undefined)
    const cb = vi.fn()
    observeViewport(el(), '0px', cb)
    expect(cb).toHaveBeenCalledWith({ isIntersecting: true, initial: true })
  })
})
