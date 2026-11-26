#!/usr/bin/env node
// Lokal dev server → **test** api-cbar-admin (https://api-cbar-admin-test.cbar.az/api/v1).
//
//   npm run local:testcbar                        # :5175, test API, /api proxy
//   npm run local:testcbar -- --port=5180
//   npm run local:testcbar -- --api=https://api-cbar-admin-dev.cbar.az/api/v1
//   npm run local:testcbar -- --media=https://api-cbar-dev.cbar.az   # /media/{id} mənbəyi
//   npm run local:testcbar -- --direct            # proxy yox, brauzer birbaşa (CORS lazımdır)
//   npm run local:testcbar -- --skip-check        # pre-flight yoxlamasını atla
//
// Niyə ayrıca əmr (qarışıqlıq olmasın deyə):
//   • `npm run dev` toxunulmur — o həmişə `.env.development`-dəki lokal API-yə
//     (localhost:5253) baxır və 5174 portunda qalır. Burada ayrı port (5175) var,
//     ona görə ikisi eyni vaxtda işləyə bilər və hansının hara baxdığı portdan bəllidir.
//   • Defolt rejimdə sorğu brauzerdən `http://localhost:5175/api/v1/...`-ə gedir,
//     Vite dev server onu test API-yə proxy edir (`changeOrigin`) — CORS lazım
//     deyil, test API-nin `Cors__Origins` siyahısına lokal port əlavə edilmir.
//     `--direct` əksinədir: ünvan bundle-a düşür, brauzer birbaşa gedir və test
//     API CORS-a görə rədd edə bilər — yalnız CORS-u yoxlamaq üçün.
//   • Dəyişənlər uşaq prosesin mühitinə qoyulur; Vite `loadEnv`-də artıq təyin
//     olunmuş dəyişənin üzərinə `.env.*`-dan yazmır, ona görə override tutur.
//   • Başlamazdan əvvəl API yoxlanılır: panel hər ekranda ayrı xəta vermək
//     əvəzinə dərhal bir aydın mesajla dayanır.
//
// Yalnız Node built-in modulları (Maddə II).

import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

/** Test mühitinin admin API kökü — `/api/v1` prefiksi daxildir (runtime-config). */
export const DEFAULT_API_URL = 'https://api-cbar-admin-test.cbar.az/api/v1'

/**
 * Test mühitinin **ictimai** api-cbar kökü — redaktordakı `<img src="/media/{id}">`
 * baytlarını bu verir (admin API-də belə endpoint yoxdur). `.env.test`
 * `VITE_MEDIA_BASE_URL` ilə eyni.
 */
export const DEFAULT_MEDIA_URL = 'https://api-cbar-test.cbar.az'

/** `npm run dev` 5174-dədir; bu əmr ona toxunmasın deyə ayrı port. */
export const DEFAULT_PORT = 5175

/** Pre-flight sorğularının vaxt limiti (ms) — asılı qalmaq yox, tez nəticə. */
export const PROBE_TIMEOUT_MS = 10_000

/**
 * API kökünü normallaşdırır: sondakı `/` atılır.
 *
 * Axios `baseURL` + `/laws` birləşməsini onsuz da düzgün qurur, amma banner-də və
 * proxy hədəfində ünvanın tək formada görünməsi diaqnostikanı asanlaşdırır.
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
 * `--api=… --port=… --direct --skip-check` (saf funksiya).
 *
 * `npm run … -- args` çağırışında npm `--`-i özü silir; birbaşa node çağırışında
 * qalır, ona görə baş `--` atılır.
 */
export function parseArgs(argv, env = {}) {
  const args = [...argv]
  if (args[0] === '--') args.shift()

  let api = env.TESTCBAR_API_URL || DEFAULT_API_URL
  let media = env.TESTCBAR_MEDIA_URL || DEFAULT_MEDIA_URL
  let port = env.TESTCBAR_PORT || DEFAULT_PORT
  let direct = false
  let skipCheck = false

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i]
    const value = (prefix) =>
      arg.startsWith(`${prefix}=`) ? arg.slice(prefix.length + 1) : args[++i]

    if (arg === '--api' || arg.startsWith('--api=')) api = value('--api')
    else if (arg === '--media' || arg.startsWith('--media='))
      media = value('--media')
    else if (arg === '--port' || arg.startsWith('--port=') || arg === '-p')
      port = value(arg === '-p' ? '-p' : '--port')
    else if (arg === '--direct') direct = true
    else if (arg === '--skip-check') skipCheck = true
    else throw new Error(`Naməlum arqument: ${arg}`)
  }

  return {
    apiUrl: normalizeApiUrl(api),
    mediaUrl: normalizeApiUrl(media),
    port: normalizePort(port),
    direct,
    skipCheck,
  }
}

/** `vite` arqumentləri — konfiqdəki 5174 portu CLI ilə əvəz olunur. */
export function viteArgs(port) {
  return ['--port', String(port), '--strictPort']
}

/** Lokal `vite` CLI-nin giriş faylı — Windows-da `.cmd` problemi olmasın deyə node ilə. */
export function viteBinPath(root) {
  return join(root, 'node_modules', 'vite', 'bin', 'vite.js')
}

/**
 * Uşaq prosesin mühiti (saf funksiya).
 *
 * Proxy rejimi: `VITE_API_URL` yalnız yoldur (`/api/v1`) — sorğu eyni mənbəyə
 * gedir, `vite.config.ts` `/api`-ni `VITE_API_PROXY_TARGET`-ə ötürür.
 * `--direct`: tam ünvan bundle-a düşür, proxy söndürülür (boş sətir konfiqdə
 * `undefined` proxy deməkdir).
 *
 * Media (`<img src="/media/{id}">`) eyni qayda ilə: proxy rejimində `/media` ictimai
 * api-cbar-a (`mediaUrl`) ötürülür və `VITE_MEDIA_BASE_URL` boşdur (nisbi qalır);
 * `--direct`-də kök bundle-a düşür, redaktor `src`-i onunla tamamlayır.
 *
 * `VITE_ENABLE_MSW=false` hər iki halda qoyulur: bu əmrin mənası real test
 * API-yə çıxmaqdır, `.env.local`-dakı mock açarı onu səssizcə kəsməsin.
 */
export function childEnv(
  baseEnv,
  { apiUrl, mediaUrl = DEFAULT_MEDIA_URL, direct = false },
) {
  const base = { ...baseEnv, VITE_ENABLE_MSW: 'false' }

  if (direct) {
    return {
      ...base,
      VITE_API_URL: apiUrl,
      VITE_API_PROXY_TARGET: '',
      VITE_MEDIA_BASE_URL: mediaUrl,
      VITE_MEDIA_PROXY_TARGET: '',
    }
  }

  const { origin, pathname } = new URL(apiUrl)
  if (!pathname.startsWith('/api')) {
    throw new Error(
      `Proxy yalnız /api ilə başlayan yolu ötürür, bu isə "${pathname}" — --direct işlət`,
    )
  }

  return {
    ...base,
    VITE_API_URL: pathname,
    VITE_API_PROXY_TARGET: origin,
    VITE_MEDIA_BASE_URL: '',
    VITE_MEDIA_PROXY_TARGET: new URL(mediaUrl).origin,
  }
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
    return {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

/**
 * Pre-flight nəticəsindən mətn qurur (saf funksiya — test edilir).
 *
 * `/healthz` çatmırsa bu **dayandırıcı** haldır: VPN/şəbəkə yoxdur, ya ünvan səhvdir.
 * İkinci sorğu tokensiz qorunan endpoint-ədir: **401 gözlənilən cavabdır** — yol da,
 * auth da yerindədir. 404 isə `/api/v1` prefiksinin səhv olduğunu göstərir, ona görə
 * dayandırır: əks halda panel açılır və hər ekran boş qalır.
 */
export function preflightReport({ health, guard }) {
  const lines = []
  let fatal = false

  if (!health.ok) {
    lines.push(`✗ API-yə çatmaq olmadı: ${health.error}`)
    lines.push(
      '  VPN/şəbəkə bağlantısını və ünvanı yoxla, ya da --skip-check ilə keç.',
    )
    fatal = true
  } else if (health.status !== 200) {
    lines.push(`✗ /healthz ${health.status} qaytardı — API sağlam deyil.`)
    fatal = true
  } else {
    lines.push('✓ API cavab verir (/healthz 200)')
  }

  if (!guard) return { lines, fatal }

  if (!guard.ok) {
    lines.push(`⚠ Qorunan endpoint yoxlanmadı: ${guard.error}`)
  } else if (guard.status === 401) {
    lines.push('✓ /laws → 401: yol və JWT qoruması yerindədir')
  } else if (guard.status === 404) {
    lines.push(
      '✗ /laws → 404: API prefiksi səhvdir (--api dəyərinə /api/v1 daxildir?).',
    )
    fatal = true
  } else {
    lines.push(`⚠ /laws → ${guard.status}: gözlənilən 401 idi, ünvanı yoxla.`)
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
    console.error(
      '  İstifadə: npm run local:testcbar -- [--api=<url>] [--media=<url>] [--port=<n>] [--direct] [--skip-check]',
    )
    return 1
  }

  const { apiUrl, mediaUrl, port, direct, skipCheck } = options

  let env
  try {
    env = childEnv(process.env, { apiUrl, mediaUrl, direct })
  } catch (error) {
    console.error(`✗ ${error.message}`)
    return 1
  }

  const bin = viteBinPath(root)
  if (!existsSync(bin)) {
    console.error(
      '✗ `vite` tapılmadı — əvvəlcə asılılıqları qur:  npm run install:public',
    )
    return 1
  }

  console.log('')
  console.log('  web-cbar-admin-new → TEST API')
  console.log(
    `  API     : ${apiUrl}${direct ? '  (birbaşa, CORS lazımdır)' : '  (Vite proxy)'}`,
  )
  console.log(
    `  Media   : ${mediaUrl}${direct ? '' : '  (Vite proxy /media)'}`,
  )
  console.log(`  Panel   : http://localhost:${port}/`)
  console.log('')

  if (!skipCheck) {
    const { origin } = new URL(apiUrl)
    const health = await probe(`${origin}/healthz`)
    const guard = health.ok
      ? await probe(`${apiUrl}/laws?page=1&pageSize=1`)
      : null
    const { lines, fatal } = preflightReport({ health, guard })

    for (const line of lines) console.log(`  ${line}`)
    console.log('')

    if (fatal) return 1
  }

  const child = spawn(process.execPath, [bin, ...viteArgs(port)], {
    stdio: 'inherit',
    env,
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
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  process.exit(await main())
}
