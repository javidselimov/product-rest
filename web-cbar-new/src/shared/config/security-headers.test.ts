/**
 * CSP mənbələri (spec 002 contracts/runtime-config.md §3, research R5).
 */
import { describe, expect, it } from 'vitest'

import { contentSecurityPolicy, securityHeaders } from './security-headers'

function directive(csp: string, name: string): string {
  return new RegExp(`${name} ([^;]+)`).exec(csp)?.[1] ?? ''
}

describe('contentSecurityPolicy', () => {
  it('img-src və media-src API origin-ini daxil edir', () => {
    const csp = contentSecurityPolicy({ apiOrigin: 'http://localhost:5139' })

    expect(directive(csp, 'img-src')).toContain('http://localhost:5139')
    expect(directive(csp, 'media-src')).toContain('http://localhost:5139')
    expect(directive(csp, 'img-src')).toContain("'self'")
    expect(directive(csp, 'img-src')).toContain('data:')
  })

  it('frame-src həmişə YouTube-u daxil edir', () => {
    const frameSrc = directive(contentSecurityPolicy(), 'frame-src')

    expect(frameSrc).toContain('https://www.youtube.com')
    expect(frameSrc).toContain('https://www.youtube-nocookie.com')
  })

  it('CSP_FRAME_SRC mənbələri frame-src-ə əlavə olunur, təkrarlanmır', () => {
    const csp = contentSecurityPolicy({
      frameSources: ['https://maps.example.az', 'https://www.youtube.com'],
    })
    const frameSrc = directive(csp, 'frame-src')

    expect(frameSrc).toContain('https://maps.example.az')
    expect(frameSrc.split('https://www.youtube.com ').length).toBe(2)
  })

  it('script-src və connect-src dəyişmir', () => {
    const csp = contentSecurityPolicy({ apiOrigin: 'https://api.example.az' })

    expect(directive(csp, 'script-src')).toBe("'self'")
    expect(directive(csp, 'connect-src')).toBe("'self'")
    expect(csp).toContain("frame-ancestors 'none'")
  })

  it('nonce-lu variantda strict-dynamic var, unsafe-inline yoxdur', () => {
    const scriptSrc = directive(contentSecurityPolicy({ nonce: 'abc' }), 'script-src')

    expect(scriptSrc).toContain("'nonce-abc'")
    expect(scriptSrc).toContain("'strict-dynamic'")
    expect(scriptSrc).not.toContain('unsafe-inline')
  })

  it('securityHeaders() CSP-ni nonce-suz verir və dörd statik başlığı əlavə edir', () => {
    const headers = securityHeaders({ apiOrigin: 'https://api.example.az' })
    const csp = headers.find((h) => h.key === 'Content-Security-Policy')?.value ?? ''

    expect(csp).not.toContain('nonce-')
    expect(csp).toContain('https://api.example.az')
    expect(headers.map((h) => h.key)).toEqual([
      'Content-Security-Policy',
      'X-Content-Type-Options',
      'X-Frame-Options',
      'Referrer-Policy',
      'Permissions-Policy',
    ])
  })
})
