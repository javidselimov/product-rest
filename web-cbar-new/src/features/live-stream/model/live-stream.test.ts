import { afterEach, describe, expect, it, vi } from 'vitest'

import { toLiveStream } from '@/features/media/model/live-stream'

import { dismissalKey, isDismissed, markDismissed } from './dismissal'
import { useLiveStreamStore } from './store'

describe('toLiveStream', () => {
  it('ilk YouTube yayımını nocookie embed-ə çevirir', () => {
    expect(
      toLiveStream([
        { id: 7, title: 'Brifinq', streamUrl: 'https://www.youtube.com/watch?v=live12345', startsAt: null },
        { id: 8, title: 'Köhnə', streamUrl: 'https://youtu.be/older1234', startsAt: null },
      ]),
    ).toEqual({ id: 7, title: 'Brifinq', embedUrl: 'https://www.youtube-nocookie.com/embed/live12345' })
  })

  it('YouTube id-si çıxmayan linki atlayır, növbətini götürür', () => {
    expect(
      toLiveStream([
        { id: 1, title: 'Kanal', streamUrl: 'https://www.youtube.com/@cbar/live', startsAt: null },
        { id: 2, title: 'HLS', streamUrl: 'https://stream.cbar.az/x.m3u8', startsAt: null },
        { id: 3, title: null, streamUrl: 'https://youtube.com/live/abc123xyz', startsAt: null },
      ]),
    ).toEqual({ id: 3, title: null, embedUrl: 'https://www.youtube-nocookie.com/embed/abc123xyz' })
  })

  it('boş siyahı və ya uyğun link yoxdursa → null', () => {
    expect(toLiveStream([])).toBeNull()
    expect(toLiveStream([{ id: 1, title: 'x', streamUrl: null, startsAt: null }])).toBeNull()
  })
})

describe('dismissal (sessionStorage)', () => {
  afterEach(() => {
    sessionStorage.clear()
    vi.restoreAllMocks()
  })

  it('açar yalnız yayıma bağlıdır', () => {
    expect(dismissalKey(5)).toBe('cbar:live-stream:dismissed:5')
  })

  it('bağlanan yayım sessiya boyu yadda qalır, başqa yayım yox', () => {
    expect(isDismissed(5)).toBe(false)
    markDismissed(5)
    expect(isDismissed(5)).toBe(true)
    expect(isDismissed(6)).toBe(false)
  })

  it('storage xəta atanda çökmür: bağlanmayıb sayılır', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError')
    })
    expect(() => markDismissed(5)).not.toThrow()
    expect(isDismissed(5)).toBe(false)
  })
})

describe('useLiveStreamStore', () => {
  it('default bağlıdır, setOpen dəyişir', () => {
    expect(useLiveStreamStore.getState().open).toBe(false)
    useLiveStreamStore.getState().setOpen(true)
    expect(useLiveStreamStore.getState().open).toBe(true)
    useLiveStreamStore.getState().setOpen(false)
  })
})
