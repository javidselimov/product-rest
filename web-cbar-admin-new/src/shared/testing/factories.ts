/**
 * Test data factory-ləri (guideline §13.20): hər test öz datasını override-larla
 * qurur, fixture-lara birbaşa bağlanmır.
 */

import {
  ROLE_CLAIM,
  permissionsForRole,
  type AuthUser,
} from '@/entities/user/model/types'

let sequence = 0
export const nextId = (): number => ++sequence

const base64Url = (value: string): string =>
  btoa(unescape(encodeURIComponent(value)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')

/**
 * İmzasız (yalnız formaca düzgün) JWT: `header.payload.signature`. Panel imzanı
 * yoxlamır — yalnız payload-u oxuyur (research R4).
 */
export function makeJwt(payload: Record<string, unknown>): string {
  const header = base64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = base64Url(JSON.stringify(payload))
  return `${header}.${body}.mock-signature`
}

/** Seed `admin` istifadəçisinin token-i (15 dəq etibarlı). */
export function makeAdminJwt(minutes = 15): string {
  return makeJwt({
    sub: '1',
    preferred_username: 'admin',
    [ROLE_CLAIM]: 'admin',
    iss: 'cbar-admin-api',
    aud: 'cbar-admin',
    exp: Math.floor(Date.now() / 1000) + minutes * 60,
  })
}

export const adminUser: AuthUser = {
  id: '1',
  username: 'admin',
  name: 'admin',
  roleCode: 'admin',
  permissions: permissionsForRole('admin'),
}

/**
 * Random password satisfying `PASSWORD_POLICY`, generated per call so tests
 * keep no hardcoded credentials. Characters are safe for `user.type`
 * (no `{` / `[`).
 */
export function makeStrongPassword(): string {
  const random = crypto.randomUUID().replaceAll('-', '').slice(0, 12)
  const upper = String.fromCodePoint(65 + (nextId() % 26))
  return `${upper}${random}#${nextId() % 10}x`
}

export function createAuthUserMock(
  overrides: Partial<AuthUser> = {},
): AuthUser {
  return { ...adminUser, id: String(nextId()), ...overrides }
}
