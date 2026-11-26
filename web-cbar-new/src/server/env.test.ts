/**
 * Runtime konfiqurasiya (spec 002 contracts/runtime-config.md §1).
 *
 * Əsas iddia: **eyni build** iki fərqli `API_URL` ilə iki fərqli ünvana gedir —
 * dəyər bundle-a bişirilmir, hər dəfə `process.env`-dən oxunur (FR-026).
 */
import { describe, expect, it } from 'vitest'

import { apiOrigin, parseEnv } from './env'

const BASE_ENV = {
  NODE_ENV: 'production',
  API_URL: 'https://api-example.example.az',
} as NodeJS.ProcessEnv

describe('eyni build, fərqli mühit', () => {
  it('API_URL-i hər oxunuşda mənbədən götürür — yenidən build yoxdur', () => {
    const a = parseEnv({ ...BASE_ENV, API_URL: 'https://a.example.az' })
    const b = parseEnv({ ...BASE_ENV, API_URL: 'https://b.example.az' })

    expect(a.API_URL).toBe('https://a.example.az')
    expect(b.API_URL).toBe('https://b.example.az')
  })

  it('API_URL verilməyəndə lokal api-cbar defoltu işləyir', () => {
    expect(parseEnv({ NODE_ENV: 'development' }).API_URL).toBe('http://localhost:5139')
  })

  it('apiOrigin yalnız origin-i qaytarır', () => {
    const config = parseEnv({ ...BASE_ENV, API_URL: 'https://api.example.az/api/v1/' })

    expect(apiOrigin(config)).toBe('https://api.example.az')
  })
})

describe('yanlış dəyər', () => {
  it('düzgün olmayan API_URL azərbaycanca mesajla dayandırır', () => {
    let messageText = ''
    try {
      parseEnv({ ...BASE_ENV, API_URL: 'bu-url-deyil' })
    } catch (error) {
      messageText = error instanceof Error ? error.message : String(error)
    }

    expect(messageText).toContain('Mühit konfiqurasiyası yanlışdır')
    expect(messageText).toContain('API_URL')
    expect(messageText).toContain('düzgün URL olmalıdır')
    // Daxili detal (stack, sxem adı) sızmır — Maddə VII.3.
    expect(messageText).not.toContain('ZodError')
  })
})

describe('defolt dəyərlər', () => {
  it('TZ defolt gəlir', () => {
    expect(parseEnv(BASE_ENV).TZ).toBe('Asia/Baku')
  })

  it('CSP_FRAME_SRC verilməyəndə boş siyahıdır', () => {
    expect(parseEnv(BASE_ENV).CSP_FRAME_SRC).toEqual([])
  })

  it('CSP_FRAME_SRC boşluqla ayrılmış mənbələrə bölünür', () => {
    const config = parseEnv({
      ...BASE_ENV,
      CSP_FRAME_SRC: ' https://maps.example.az   https://player.example.az ',
    })

    expect(config.CSP_FRAME_SRC).toEqual(['https://maps.example.az', 'https://player.example.az'])
  })

  it('sessiya və mock dəyişənləri artıq oxunmur', () => {
    const config = parseEnv({ ...BASE_ENV, SESSION_COOKIE_NAME: 'x', ENABLE_MOCK_API: 'true' })

    expect(config).not.toHaveProperty('SESSION_COOKIE_NAME')
    expect(config).not.toHaveProperty('ENABLE_MOCK_API')
  })
})
