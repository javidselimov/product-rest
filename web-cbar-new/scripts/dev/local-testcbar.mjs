#!/usr/bin/env node
// Lokal dev server → **test** api-cbar (https://api-cbar-test.cbar.az).
//
//   npm run local:testcbar                              # :3002, test API
//   npm run local:testcbar -- --port=3005
//   npm run local:testcbar -- --api=https://api-cbar-dev.cbar.az
//   npm run local:testcbar -- --skip-check              # pre-flight yoxlamasını atla
//
// Niyə ayrıca əmr (qarışıqlıq olmasın deyə):
//   • `npm run dev` toxunulmur — o həmişə `.env.development`-dəki lokal API-yə
//     (localhost:5139) baxır və 3001 portunda qalır. Burada ayrı port (3002) var,
//     ona görə ikisi eyni vaxtda işləyə bilər və hansının hara baxdığı portdan bəllidir.
//   • `API_URL` uşaq prosesin mühitinə qoyulur. `@next/env` `.env.development`-i
//     oxuyanda artıq təyin olunmuş dəyişənin **üzərinə yazmır**, ona görə override tutur.
//   • Başlamazdan əvvəl API yoxlanılır: sayt hər səhifədə ayrı-ayrı xəta vermək
//     əvəzinə dərhal bir aydın mesajla dayanır.
//
// Yalnız Node built-in modulları (Maddə II).

import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

/** Test mühitinin `api-cbar` kökü — `web-cbar-new` bura `API_URL` kimi baxır. */
export const DEFAULT_API_URL = 'https://api-cbar-test.cbar.az'

/** `npm run dev` 3001-dədir; bu əmr ona toxunmasın deyə ayrı port. */
export const DEFAULT_PORT = 3002

/** Pre-flight sorğularının vaxt limiti (ms) — asılı qalmaq yox, tez nəticə. */
export const PROBE_TIMEOUT_MS = 10_000

/**
 * API kökünü normallaşdırır: sondakı `/` atılır.
 *
 * Axios `baseURL` + `/api/v1/…` birləşməsini onsuz da düzgün qurur, amma banner-də
 * və CSP `apiOrigin`-də ünvanın tək formada görünməsi diaqnostikanı asanlaşdırır.
 */
export function normalizeApiUrl(value) {
  const raw = String(value ?? '').trim()
  if (!raw) throw new Error('API ünvanı boşdur')

  let parsed
  try {
    parsed = new URL(raw)
  } catch {
    throw new Error(`API ünvanı düzgün URL deyil: ${raw}`)
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error(`API ünvanı http(s) olmalıdır: ${raw}`)
  }

  return `${parsed.origin}${parsed.pathname}`.replace(/\/+$/, '')
}

/** Port: 1..65535 tam ədəd. */
export function normalizePort(value) {
  const port = Number(value)
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`Port düzgün deyil: ${value}`)
  }
  return port
}

/**
 * `--api=… --port=… --skip-check` (saf funksiya).
 *
 * `npm run … -- args` çağırışında npm `--`-i özü silir; birbaşa node çağırışında
 * qalır, ona görə baş `--` atılır.
 */
export function parseArgs(argv, env = {}) {
  const args = [...argv]
  if (args[0] === '--') args.shift()

  let api = env.TESTCBAR_API_URL || DEFAULT_API_URL
  let port = env.TESTCBAR_PORT || DEFAULT_PORT
  let skipCheck = false

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i]
    const value = (prefix) => (arg.startsWith(`${prefix}=`) ? arg.slice(prefix.length + 1) : args[++i])

    if (arg === '--api' || arg.startsWith('--api=')) api = value('--api')
    else if (arg === '--port' || arg.startsWith('--port=') || arg === '-p') port = value(arg === '-p' ? '-p' : '--port')
    else if (arg === '--skip-check') skipCheck = true
    else throw new Error(`Naməlum arqument: ${arg}`)
  }

  return { apiUrl: normalizeApiUrl(api), port: normalizePort(port), skipCheck }
}

/** `next dev` arqumentləri. */
export function nextArgs(port) {
  return ['dev', '-p', String(port)]
}

/**
 * Uşaq prosesin mühiti.
 *
 * Yalnız `API_URL` əlavə olunur — `TZ` və qalanı `.env.development`-dən gəlməyə
 * davam edir. `NEXT_PUBLIC_*` yoxdur: ünvan brauzer bundle-ına düşmür (Maddə VIII.2).
 */
export function childEnv(baseEnv, apiUrl) {
  return { ...baseEnv, API_URL: apiUrl }
}

/** Lokal `next` CLI-nin giriş faylı — Windows-da `.cmd` problemi olmasın deyə node ilə çağırılır. */
export function nextBinPath(root) {
  return join(root, 'node_modules', 'next', 'dist', 'bin', 'next')
}

/** Bir GET sorğusu: `{ ok, status }` və ya `{ ok: false, error }`. */
export async function probe(url, timeoutMs = PROBE_TIMEOUT_MS) {
  try {
    const response = await fetch(url, {
      method: 'GET',
      signal: AbortSignal.timeout(timeoutMs),
      headers: { Accept: '*/*' },
    })
    return { ok: true, status: response.status }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) }
  }
}

/**
 * Pre-flight nəticəsindən mətn qurur (saf funksiya — test edilir).
 *
 * `/healthz` çatmırsa bu **dayandırıcı** haldır: VPN/şəbəkə yoxdur, ya ünvan səhvdir.
 * `/media/1` isə yalnız **xəbərdarlıqdır** — API özü qalxıb, sadəcə fayl anbarı
 * (MinIO/S3) cavab vermir, sayt mətnlə işləyəcək, şəkillər sınıq görünəcək.
 */
export function preflightReport({ health, media }) {
  const lines = []
  let fatal = false

  if (!health.ok) {
    lines.push(`✗ API-yə çatmaq olmadı: ${health.error}`)
    lines.push('  VPN/şəbəkə bağlantısını və ünvanı yoxla, ya da --skip-check ilə keç.')
    fatal = true
  } else if (health.status !== 200) {
    lines.push(`✗ /healthz ${health.status} qaytardı — API sağlam deyil.`)
    fatal = true
  } else {
    lines.push('✓ API cavab verir (/healthz 200)')
  }

  if (media?.ok && media.status >= 500) {
    lines.push(`⚠ /media/1 → ${media.status}: fayl anbarı (MinIO/S3) cavab vermir.`)
    lines.push('  Sayt açılacaq, mətn gələcək, amma şəkillər sınıq olacaq — bu API tərəfin problemidir.')
  } else if (media?.ok && media.status === 404) {
    lines.push('⚠ /media/1 → 404: bu id-li fayl yoxdur (baza boş ola bilər).')
  } else if (media?.ok) {
    lines.push(`✓ /media/1 → ${media.status}: fayl anbarı işləyir`)
  }

  return { lines, fatal }
}

async function main() {
  const root = process.cwd()

  let options
  try {
    options = parseArgs(process.argv.slice(2), process.env)
  } catch (error) {
    console.error(`✗ ${error.message}`)
    console.error('  İstifadə: npm run local:testcbar -- [--api=<url>] [--port=<n>] [--skip-check]')
    return 1
  }

  const { apiUrl, port, skipCheck } = options

  const bin = nextBinPath(root)
  if (!existsSync(bin)) {
    console.error('✗ `next` tapılmadı — əvvəlcə asılılıqları qur:  npm run install:public')
    return 1
  }

  console.log('')
  console.log('  web-cbar-new → TEST API')
  console.log(`  API_URL : ${apiUrl}`)
  console.log(`  Sayt    : http://localhost:${port}/az`)
  console.log('')

  if (!skipCheck) {
    const health = await probe(`${apiUrl}/healthz`)
    const media = health.ok ? await probe(`${apiUrl}/media/1`) : null
    const { lines, fatal } = preflightReport({ health, media })

    for (const line of lines) console.log(`  ${line}`)
    console.log('')

    if (fatal) return 1
  }

  const child = spawn(process.execPath, [bin, ...nextArgs(port)], {
    stdio: 'inherit',
    env: childEnv(process.env, apiUrl),
  })

  // Ctrl+C uşağa ötürülür; `close` hadisəsi onsuz da çıxış kodunu qaytarır.
  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.on(signal, () => child.kill(signal))
  }

  return await new Promise((resolve) => {
    child.on('error', (error) => {
      console.error(`✗ dev server işə salına bilmədi: ${error.message}`)
      resolve(1)
    })
    child.on('close', (code) => resolve(code ?? 0))
  })
}

// Test faylı bu modulu import edir — main yalnız birbaşa icrada işləyir.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exit(await main())
}
