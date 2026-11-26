/**
 * Media proxy-nin saf funksiyaları (spec 003 FR-007, FR-008).
 *
 * `parseMediaId` təhlükəsizlik sərhədidir — SSRF qapısı məhz burada bağlanır,
 * ona görə mənfi hallar müsbətlərdən çoxdur.
 */
import { describe, expect, it } from 'vitest'

import { MEDIA_FALLBACK_CACHE_CONTROL } from '@/shared/constants/cache'

import {
  mediaUpstreamUrl,
  parseMediaId,
  proxyResponseHeaders,
  staffPhotosZipUpstreamUrl,
  upstreamRequestHeaders,
} from './media-proxy'

describe('staffPhotosZipUpstreamUrl', () => {
  it('api-cbar-ın photos.zip endpoint-inə yönəlir; sondakı / təmizlənir', () => {
    expect(staffPhotosZipUpstreamUrl('3', 'http://api.test/')).toBe('http://api.test/api/v1/organization/staff/3/photos.zip')
  })
})

describe('parseMediaId', () => {
  it.each(['1', '12', '1809', '9007199254740991'])('rəqəmli id qəbul edir: %s', (raw) => {
    expect(parseMediaId(raw)).toBe(raw)
  })

  it.each([
    ['boş', ''],
    ['təyin olunmayan', undefined],
    ['hərf', 'abc'],
    ['qarışıq', '12a'],
    ['nisbi yol', '..'],
    ['yol keçidi', '../secret'],
    ['mütləq ünvan', 'http://evil.test/x'],
    ['mənfi', '-1'],
    ['onluq', '1.5'],
    ['boşluqlu', ' 12'],
    ['çox uzun', '12345678901234567890'],
  ])('rədd edir (%s)', (_ad, raw) => {
    expect(parseMediaId(raw)).toBeNull()
  })

  it('baş sıfırlı id-ni rədd edir — eyni fayl üçün ikinci URL keşi parçalayardı', () => {
    expect(parseMediaId('007')).toBeNull()
    expect(parseMediaId('0')).toBe('0')
  })
})

describe('mediaUpstreamUrl', () => {
  it('upstream ünvanını qurur', () => {
    expect(mediaUpstreamUrl('12', 'https://api-cbar-test.cbar.az')).toBe(
      'https://api-cbar-test.cbar.az/media/12',
    )
  })

  it('sondaki kəsiyi ikiləmir', () => {
    expect(mediaUpstreamUrl('12', 'https://api-cbar-test.cbar.az/')).toBe(
      'https://api-cbar-test.cbar.az/media/12',
    )
  })
})

describe('upstreamRequestHeaders', () => {
  it('If-None-Match ötürülür — revalidasiya upstream-də həll olunur', () => {
    const headers = upstreamRequestHeaders(new Headers({ 'if-none-match': '"abc"' }))

    expect(headers).toMatchObject({ 'If-None-Match': '"abc"' })
  })

  it('If-None-Match yoxdursa başlıq əlavə edilmir', () => {
    expect(upstreamRequestHeaders(new Headers())).not.toHaveProperty('If-None-Match')
  })

  it('cookie və Authorization ötürülmür — media endpoint-i anonimdir', () => {
    const headers = upstreamRequestHeaders(
      new Headers({ cookie: 'session=x', authorization: 'Bearer y' }),
    )

    expect(headers).not.toHaveProperty('cookie')
    expect(headers).not.toHaveProperty('Cookie')
    expect(headers).not.toHaveProperty('authorization')
    expect(headers).not.toHaveProperty('Authorization')
  })
})

describe('proxyResponseHeaders', () => {
  it('upstream keş siyasətinə güvənir', () => {
    const headers = proxyResponseHeaders(
      new Headers({
        'content-type': 'image/jpeg',
        'content-length': '633000',
        etag: '"sha256"',
        'cache-control': 'public, max-age=31536000, immutable',
      }),
    )

    expect(headers.get('content-type')).toBe('image/jpeg')
    expect(headers.get('content-length')).toBe('633000')
    expect(headers.get('etag')).toBe('"sha256"')
    expect(headers.get('cache-control')).toBe('public, max-age=31536000, immutable')
  })

  it('upstream keş başlığı verməyəndə ehtiyat dəyər qoyur', () => {
    const headers = proxyResponseHeaders(new Headers({ 'content-type': 'image/png' }))

    expect(headers.get('cache-control')).toBe(MEDIA_FALLBACK_CACHE_CONTROL)
  })

  it('siyahıda olmayan başlıqları ötürmür', () => {
    const headers = proxyResponseHeaders(
      new Headers({ 'content-type': 'image/png', server: 'Kestrel', 'set-cookie': 'a=b' }),
    )

    expect(headers.get('server')).toBeNull()
    expect(headers.get('set-cookie')).toBeNull()
  })
})
