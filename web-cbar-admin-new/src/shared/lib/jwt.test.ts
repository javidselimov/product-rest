import { describe, expect, it } from 'vitest'

import { makeJwt } from '@/shared/testing/factories'
import { decodeJwtPayload } from './jwt'

describe('decodeJwtPayload', () => {
  it('düzgün token-in payload-unu qaytarır (UTF-8 daxil)', () => {
    const token = makeJwt({ sub: '7', preferred_username: 'əli', exp: 123 })
    expect(decodeJwtPayload(token)).toMatchObject({
      sub: '7',
      preferred_username: 'əli',
      exp: 123,
    })
  })

  it('korlanmış token üçün null qaytarır', () => {
    expect(decodeJwtPayload('abc')).toBeNull()
    expect(decodeJwtPayload('a.!!!.c')).toBeNull()
    expect(decodeJwtPayload('')).toBeNull()
  })
})
