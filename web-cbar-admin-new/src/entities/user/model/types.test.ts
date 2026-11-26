import { describe, expect, it } from 'vitest'

import { makeJwt } from '@/shared/testing/factories'
import {
  ROLE_CLAIM,
  hasPermission,
  initials,
  permissionsForRole,
  roleCodeFromId,
  tokenExpiry,
  userFromToken,
} from './types'

describe('hasPermission', () => {
  it('user null olanda false qaytarır', () => {
    expect(hasPermission(null, 'content.manage')).toBe(false)
  })

  it('admin bütün icazələrə, moderator users.manage-dən başqa hamısına malikdir', () => {
    expect(permissionsForRole('admin')).toContain('users.manage')
    expect(permissionsForRole('moderator')).not.toContain('users.manage')
    expect(permissionsForRole('meas_manager')).toContain('content.manage')
  })
})

describe('userFromToken', () => {
  it('ASP.NET rol claim-i ilə AuthUser qurur', () => {
    const token = makeJwt({
      sub: '1',
      preferred_username: 'admin',
      [ROLE_CLAIM]: 'admin',
      exp: Math.floor(Date.now() / 1000) + 900,
    })
    const user = userFromToken(token)
    expect(user).toMatchObject({
      id: '1',
      username: 'admin',
      name: 'admin',
      roleCode: 'admin',
    })
    expect(hasPermission(user, 'users.manage')).toBe(true)
  })

  it('ehtiyat `role` açarını da qəbul edir', () => {
    const token = makeJwt({
      sub: 5,
      preferred_username: 'mod',
      role: 'moderator',
      exp: 1,
    })
    expect(userFromToken(token)?.roleCode).toBe('moderator')
  })

  it('rol olmayanda və ya forma pozulanda null qaytarır', () => {
    expect(
      userFromToken(makeJwt({ sub: '1', preferred_username: 'x', exp: 1 })),
    ).toBeNull()
    expect(userFromToken('korlanmis')).toBeNull()
  })

  it('exp saniyəsindən ISO vaxt çıxarır', () => {
    const token = makeJwt({
      sub: '1',
      preferred_username: 'a',
      role: 'admin',
      exp: 1_800_000_000,
    })
    expect(tokenExpiry(token)).toBe(
      new Date(1_800_000_000 * 1000).toISOString(),
    )
  })
})

describe('köməkçilər', () => {
  it('roleCodeFromId sabit xəritəni oxuyur', () => {
    expect(roleCodeFromId(3)).toBe('meas_manager')
    expect(roleCodeFromId(9)).toBeUndefined()
  })

  it('initials tək və çox sözlü adlar üçün işləyir', () => {
    expect(initials('admin')).toBe('AD')
    expect(initials('Aysel Məmmədova')).toBe('AM')
    expect(initials('   ')).toBe('?')
  })
})
