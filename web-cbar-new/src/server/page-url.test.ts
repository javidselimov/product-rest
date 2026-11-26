import { describe, expect, it } from 'vitest'

import { originFrom } from './page-url'

const from = (h: Record<string, string>) => originFrom((name) => h[name] ?? null)

describe('originFrom', () => {
  it('reverse proxy başlıqlarına üstünlük verir', () => {
    expect(from({ 'x-forwarded-host': 'www.cbar.az', 'x-forwarded-proto': 'https', host: 'node:3000' })).toBe('https://www.cbar.az')
  })

  it('proxy yoxdursa host, sxem defolt https', () => {
    expect(from({ host: 'localhost:3002' })).toBe('https://localhost:3002')
    expect(from({ host: 'localhost:3002', 'x-forwarded-proto': 'http' })).toBe('http://localhost:3002')
  })

  it('siyahıdan ilk dəyəri götürür', () => {
    expect(from({ 'x-forwarded-host': 'a.cbar.az, b.internal', 'x-forwarded-proto': 'https,http' })).toBe('https://a.cbar.az')
  })

  it('etibarsız host-u rədd edir', () => {
    expect(from({ host: 'evil.com/"><script>' })).toBeNull()
    expect(from({})).toBeNull()
  })
})
