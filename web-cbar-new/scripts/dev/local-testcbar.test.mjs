// local-testcbar.mjs saf funksiyalarının testləri.
// Şəbəkə burada çağırılmır — yalnız arqument təhlili, mühit qurma və hesabat mətni.

import { describe, expect, it } from 'vitest'

import {
  childEnv,
  DEFAULT_API_URL,
  DEFAULT_PORT,
  nextArgs,
  nextBinPath,
  normalizeApiUrl,
  normalizePort,
  parseArgs,
  preflightReport,
} from './local-testcbar.mjs'

describe('normalizeApiUrl', () => {
  it('sondakı kəsiyi atır', () => {
    expect(normalizeApiUrl('https://api-cbar-test.cbar.az/')).toBe('https://api-cbar-test.cbar.az')
    expect(normalizeApiUrl('https://api-cbar-test.cbar.az///')).toBe(
      'https://api-cbar-test.cbar.az',
    )
  })

  it('alt yolu saxlayır', () => {
    expect(normalizeApiUrl('https://gw.cbar.az/public/')).toBe('https://gw.cbar.az/public')
  })

  it('boş, yanlış və http olmayan ünvanı rədd edir', () => {
    expect(() => normalizeApiUrl('')).toThrow()
    expect(() => normalizeApiUrl('api-cbar-test.cbar.az')).toThrow()
    expect(() => normalizeApiUrl('ftp://api-cbar-test.cbar.az')).toThrow()
  })
})

describe('normalizePort', () => {
  it('düzgün portu qaytarır', () => {
    expect(normalizePort('3005')).toBe(3005)
    expect(normalizePort(3002)).toBe(3002)
  })

  it('diapazondan kənarı rədd edir', () => {
    expect(() => normalizePort('0')).toThrow()
    expect(() => normalizePort('70000')).toThrow()
    expect(() => normalizePort('abc')).toThrow()
  })
})

describe('parseArgs', () => {
  it('arqumentsiz defolt-ları verir', () => {
    expect(parseArgs([])).toEqual({
      apiUrl: DEFAULT_API_URL,
      port: DEFAULT_PORT,
      skipCheck: false,
    })
  })

  it('npm-in qoyduğu baş `--`-i atır', () => {
    expect(parseArgs(['--', '--port=3005']).port).toBe(3005)
  })

  it('`--ad=dəyər` və `--ad dəyər` formalarını eyni oxuyur', () => {
    expect(parseArgs(['--api=https://api-cbar-dev.cbar.az']).apiUrl).toBe(
      'https://api-cbar-dev.cbar.az',
    )
    expect(parseArgs(['--api', 'https://api-cbar-dev.cbar.az']).apiUrl).toBe(
      'https://api-cbar-dev.cbar.az',
    )
    expect(parseArgs(['-p', '3007']).port).toBe(3007)
  })

  it('--skip-check bayrağını tutur', () => {
    expect(parseArgs(['--skip-check']).skipCheck).toBe(true)
  })

  it('mühit dəyişənləri defolt-u əvəz edir, arqument isə mühiti', () => {
    const env = { TESTCBAR_API_URL: 'https://api-cbar-dev.cbar.az', TESTCBAR_PORT: '3009' }

    expect(parseArgs([], env)).toEqual({
      apiUrl: 'https://api-cbar-dev.cbar.az',
      port: 3009,
      skipCheck: false,
    })
    expect(parseArgs(['--port=3010'], env).port).toBe(3010)
  })

  it('naməlum arqumenti rədd edir', () => {
    expect(() => parseArgs(['--prod'])).toThrow(/Naməlum arqument/)
  })
})

describe('nextArgs / nextBinPath', () => {
  it('portu `next dev`-ə ötürür', () => {
    expect(nextArgs(3002)).toEqual(['dev', '-p', '3002'])
  })

  it('lokal next CLI-nin yolunu qurur', () => {
    expect(nextBinPath('/repo').split(/[\\/]/)).toEqual([
      '',
      'repo',
      'node_modules',
      'next',
      'dist',
      'bin',
      'next',
    ])
  })
})

describe('childEnv', () => {
  it('yalnız API_URL-i əlavə edir, qalanına toxunmur', () => {
    const base = { TZ: 'Asia/Baku', PATH: '/usr/bin', API_URL: 'http://localhost:5139' }
    const result = childEnv(base, 'https://api-cbar-test.cbar.az')

    expect(result.API_URL).toBe('https://api-cbar-test.cbar.az')
    expect(result.TZ).toBe('Asia/Baku')
    expect(result.PATH).toBe('/usr/bin')
    // Mənbə mühit dəyişmir.
    expect(base.API_URL).toBe('http://localhost:5139')
  })

  it('brauzerə açıq dəyişən yaratmır (Maddə VIII.2)', () => {
    const keys = Object.keys(childEnv({}, 'https://api-cbar-test.cbar.az'))
    expect(keys.some((k) => k.startsWith('NEXT_PUBLIC_'))).toBe(false)
  })
})

describe('preflightReport', () => {
  it('API çatmayanda dayandırır', () => {
    const { lines, fatal } = preflightReport({
      health: { ok: false, error: 'fetch failed' },
      media: null,
    })

    expect(fatal).toBe(true)
    expect(lines.join('\n')).toContain('fetch failed')
  })

  it('/healthz 200 olmayanda dayandırır', () => {
    expect(preflightReport({ health: { ok: true, status: 503 }, media: null }).fatal).toBe(true)
  })

  it('media 500 olanda dayandırmır, xəbərdarlıq verir', () => {
    const { lines, fatal } = preflightReport({
      health: { ok: true, status: 200 },
      media: { ok: true, status: 500 },
    })

    expect(fatal).toBe(false)
    expect(lines.join('\n')).toContain('MinIO/S3')
  })

  it('hər şey qaydasındadırsa yalnız təsdiq sətirləri olur', () => {
    const { lines, fatal } = preflightReport({
      health: { ok: true, status: 200 },
      media: { ok: true, status: 200 },
    })

    expect(fatal).toBe(false)
    expect(lines.every((line) => line.startsWith('✓'))).toBe(true)
  })
})
