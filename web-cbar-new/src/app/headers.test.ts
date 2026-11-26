/**
 * Müdafiə başlıqları (spec 002 contracts/runtime-config.md §3).
 *
 * `next.config.ts#headers()` beş başlığın hamısını verir; səhifə sorğularında
 * `src/proxy.ts` CSP-ni nonce-lu variantı ilə **əvəz edir** (append etmir).
 */
import { describe, expect, it } from 'vitest'

import nextConfig from '../../next.config'
import { CSP_HEADER, contentSecurityPolicy, createNonce } from '@/shared/config/security-headers'

const REQUIRED_HEADERS = [
  'Content-Security-Policy',
  'X-Content-Type-Options',
  'X-Frame-Options',
  'Referrer-Policy',
  'Permissions-Policy',
]

async function configHeaderGroups() {
  const groups = await nextConfig.headers?.()
  return groups ?? []
}

describe('next.config.ts#headers()', () => {
  it('bütün yollara tətbiq olunur', async () => {
    const groups = await configHeaderGroups()

    expect(groups).toHaveLength(1)
    expect(groups[0].source).toBe('/:path*')
  })

  it('beş müdafiə başlığının hamısını verir', async () => {
    const [group] = await configHeaderGroups()
    const names = group.headers.map((h) => h.key)

    for (const name of REQUIRED_HEADERS) {
      expect(names).toContain(name)
    }
  })

  it.each([
    ['X-Content-Type-Options', 'nosniff'],
    ['X-Frame-Options', 'DENY'],
    ['Referrer-Policy', 'strict-origin-when-cross-origin'],
    ['Permissions-Policy', 'camera=(), microphone=(), geolocation=()'],
  ])('%s = %s', async (name, value) => {
    const [group] = await configHeaderGroups()

    expect(group.headers.find((h) => h.key === name)?.value).toBe(value)
  })

  it('fallback CSP nonce-suzdur və YouTube frame-src-i var', async () => {
    const [group] = await configHeaderGroups()
    const csp = group.headers.find((h) => h.key === CSP_HEADER)?.value ?? ''

    expect(csp).not.toContain('nonce-')
    expect(csp).toContain("frame-src https://www.youtube.com")
  })
})

describe('CSP', () => {
  it('script-src-də unsafe-inline yoxdur', () => {
    const scriptSrc = /script-src ([^;]+)/.exec(contentSecurityPolicy())?.[1] ?? ''

    expect(scriptSrc).not.toContain('unsafe-inline')
  })

  it('style-src-də unsafe-inline şüurlu güzəştdir və qalır', () => {
    expect(contentSecurityPolicy()).toContain("style-src 'self' 'unsafe-inline'")
  })

  it('connect-src yalnız self — brauzer birbaşa API-yə getmir', () => {
    expect(contentSecurityPolicy()).toContain("connect-src 'self'")
  })

  it('nonce hər çağırışda fərqlidir', () => {
    expect(createNonce()).not.toBe(createNonce())
  })
})
