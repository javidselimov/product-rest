// local-testcbar.mjs saf funksiyalarının testləri.
// Şəbəkə burada çağırılmır — yalnız arqument təhlili, mühit qurma və hesabat mətni.

import { describe, expect, it } from 'vitest'

import {
  childEnv,
  DEFAULT_API_URL,
  DEFAULT_MEDIA_URL,
  DEFAULT_PORT,
  normalizeApiUrl,
  normalizePort,
  parseArgs,
  preflightReport,
  viteArgs,
  viteBinPath,
} from './local-testcbar.mjs'

describe('normalizeApiUrl', () => {
  it('sondakı kəsiyi atır, yolu saxlayır', () => {
    expect(normalizeApiUrl('https://api-cbar-admin-test.cbar.az/api/v1/')).toBe(
      'https://api-cbar-admin-test.cbar.az/api/v1',
    )
    expect(
      normalizeApiUrl('https://api-cbar-admin-test.cbar.az/api/v1///'),
    ).toBe('https://api-cbar-admin-test.cbar.az/api/v1')
  })

  it('boş, yanlış və http olmayan ünvanı rədd edir', () => {
    expect(() => normalizeApiUrl('')).toThrow()
    expect(() => normalizeApiUrl('api-cbar-admin-test.cbar.az')).toThrow()
    expect(() => normalizeApiUrl('ftp://api-cbar-admin-test.cbar.az')).toThrow()
  })
})

describe('normalizePort', () => {
  it('düzgün portu qaytarır', () => {
    expect(normalizePort('5180')).toBe(5180)
    expect(normalizePort(5175)).toBe(5175)
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
      mediaUrl: DEFAULT_MEDIA_URL,
      port: DEFAULT_PORT,
      direct: false,
      skipCheck: false,
    })
  })

  it('defolt API test mühitinin /api/v1 kökünə baxır', () => {
    expect(DEFAULT_API_URL).toBe('https://api-cbar-admin-test.cbar.az/api/v1')
  })

  it('defolt port `npm run dev`-in 5174 portundan fərqlidir', () => {
    expect(DEFAULT_PORT).not.toBe(5174)
  })

  it('npm-in qoyduğu baş `--`-i atır', () => {
    expect(parseArgs(['--', '--port=5180']).port).toBe(5180)
  })

  it('`--ad=dəyər` və `--ad dəyər` formalarını eyni oxuyur', () => {
    const url = 'https://api-cbar-admin-dev.cbar.az/api/v1'
    expect(parseArgs([`--api=${url}`]).apiUrl).toBe(url)
    expect(parseArgs(['--api', url]).apiUrl).toBe(url)
    expect(parseArgs(['-p', '5181']).port).toBe(5181)
  })

  it('--media ictimai API kökünü dəyişir, sondakı kəsiyi atır', () => {
    expect(parseArgs(['--media=https://api-cbar-dev.cbar.az/']).mediaUrl).toBe(
      'https://api-cbar-dev.cbar.az',
    )
  })

  it('--direct və --skip-check bayraqlarını tutur', () => {
    expect(parseArgs(['--direct']).direct).toBe(true)
    expect(parseArgs(['--skip-check']).skipCheck).toBe(true)
  })

  it('mühit dəyişənləri defolt-u əvəz edir, arqument isə mühiti', () => {
    const env = {
      TESTCBAR_API_URL: 'https://api-cbar-admin-dev.cbar.az/api/v1',
      TESTCBAR_PORT: '5190',
    }

    expect(parseArgs([], env)).toEqual({
      apiUrl: 'https://api-cbar-admin-dev.cbar.az/api/v1',
      mediaUrl: DEFAULT_MEDIA_URL,
      port: 5190,
      direct: false,
      skipCheck: false,
    })
    expect(parseArgs(['--port=5191'], env).port).toBe(5191)
  })

  it('naməlum arqumenti rədd edir', () => {
    expect(() => parseArgs(['--prod'])).toThrow(/Naməlum arqument/)
  })
})

describe('viteArgs / viteBinPath', () => {
  it('portu CLI ilə əvəz edir və portu boş olmayanda dayandırır', () => {
    expect(viteArgs(5175)).toEqual(['--port', '5175', '--strictPort'])
  })

  it('lokal vite CLI-nin yolunu qurur', () => {
    expect(viteBinPath('/repo').split(/[\\/]/)).toEqual([
      '',
      'repo',
      'node_modules',
      'vite',
      'bin',
      'vite.js',
    ])
  })
})

describe('childEnv', () => {
  it('proxy rejimində yolu və hədəfi ayırır', () => {
    const result = childEnv(
      { PATH: '/usr/bin' },
      { apiUrl: 'https://api-cbar-admin-test.cbar.az/api/v1' },
    )

    expect(result.VITE_API_URL).toBe('/api/v1')
    expect(result.VITE_API_PROXY_TARGET).toBe(
      'https://api-cbar-admin-test.cbar.az',
    )
    expect(result.PATH).toBe('/usr/bin')
  })

  it('proxy rejimində /media ictimai API-yə ötürülür, src nisbi qalır', () => {
    const result = childEnv(
      {},
      {
        apiUrl: 'https://api-cbar-admin-test.cbar.az/api/v1',
        mediaUrl: 'https://api-cbar-test.cbar.az',
      },
    )

    expect(result.VITE_MEDIA_PROXY_TARGET).toBe('https://api-cbar-test.cbar.az')
    expect(result.VITE_MEDIA_BASE_URL).toBe('')
  })

  it('--direct rejimində media kökü bundle-a düşür', () => {
    const result = childEnv(
      {},
      {
        apiUrl: 'https://api-cbar-admin-test.cbar.az/api/v1',
        mediaUrl: 'https://api-cbar-test.cbar.az',
        direct: true,
      },
    )

    expect(result.VITE_MEDIA_BASE_URL).toBe('https://api-cbar-test.cbar.az')
    expect(result.VITE_MEDIA_PROXY_TARGET).toBe('')
  })

  it('--direct rejimində tam ünvanı qoyur, proxy-ni söndürür', () => {
    const result = childEnv(
      {},
      { apiUrl: 'https://api-cbar-admin-test.cbar.az/api/v1', direct: true },
    )

    expect(result.VITE_API_URL).toBe(
      'https://api-cbar-admin-test.cbar.az/api/v1',
    )
    expect(result.VITE_API_PROXY_TARGET).toBe('')
  })

  it('mock rejimini söndürür — bu əmr real API üçündür', () => {
    const result = childEnv(
      { VITE_ENABLE_MSW: 'true' },
      { apiUrl: 'https://api-cbar-admin-test.cbar.az/api/v1' },
    )

    expect(result.VITE_ENABLE_MSW).toBe('false')
  })

  it('mənbə mühiti dəyişmir', () => {
    const base = {
      VITE_API_URL: '/api/v1',
      VITE_API_PROXY_TARGET: 'http://localhost:5253',
    }
    childEnv(base, { apiUrl: 'https://api-cbar-admin-test.cbar.az/api/v1' })

    expect(base.VITE_API_PROXY_TARGET).toBe('http://localhost:5253')
  })

  it('proxy tuta bilməyən yolu rədd edir', () => {
    expect(() =>
      childEnv({}, { apiUrl: 'https://gw.cbar.az/admin/v1' }),
    ).toThrow(/--direct/)
  })
})

describe('preflightReport', () => {
  it('API çatmayanda dayandırır', () => {
    const { lines, fatal } = preflightReport({
      health: { ok: false, error: 'fetch failed' },
      guard: null,
    })

    expect(fatal).toBe(true)
    expect(lines.join('\n')).toContain('fetch failed')
  })

  it('/healthz 200 olmayanda dayandırır', () => {
    expect(
      preflightReport({ health: { ok: true, status: 503 }, guard: null }).fatal,
    ).toBe(true)
  })

  it('401 gözlənilən cavabdır — dayandırmır', () => {
    const { lines, fatal } = preflightReport({
      health: { ok: true, status: 200 },
      guard: { ok: true, status: 401 },
    })

    expect(fatal).toBe(false)
    expect(lines.every((line) => line.startsWith('✓'))).toBe(true)
  })

  it('404 səhv prefiks deməkdir — dayandırır', () => {
    const { lines, fatal } = preflightReport({
      health: { ok: true, status: 200 },
      guard: { ok: true, status: 404 },
    })

    expect(fatal).toBe(true)
    expect(lines.join('\n')).toContain('prefiksi səhvdir')
  })

  it('gözlənilməz status yalnız xəbərdarlıqdır', () => {
    const { lines, fatal } = preflightReport({
      health: { ok: true, status: 200 },
      guard: { ok: true, status: 200 },
    })

    expect(fatal).toBe(false)
    expect(lines.join('\n')).toContain('gözlənilən 401')
  })
})
