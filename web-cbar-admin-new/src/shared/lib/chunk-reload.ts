/**
 * Deploy-dan sonra köhnə tabda chunk yüklənməsi (spec 004, research R1/R2).
 *
 * Hər deploy yeni hash-li `assets/*.js` gətirir, köhnələri silinir. Açıq qalmış tab
 * köhnə `index.html`-in göstərdiyi chunk-ı istəyəndə 404 alır və import rədd olunur.
 * TanStack `lazyRouteComponent` route chunk-ları üçün bunu özü həll edir (bir dəfə
 * reload), amma `React.lazy` etmir — rədd olunmuş import render xətası olur və
 * "Nəsə səhv getdi" ekranı çıxır. Yeganə çıxış yolu səhifəni yeniləyib yeni
 * `index.html`-i almaqdır; qoruyucu bunu 10 s-də bir dəfə ilə məhdudlaşdırır ki,
 * həqiqətən sınıq build-də sonsuz dövrə yaranmasın.
 *
 * Yeni `React.lazy` istifadəsi import-unu `isChunkLoadError` + `reloadOnce` ilə sarmalıdır.
 */

import { CHUNK_RELOAD_KEY } from '@/shared/constants/storage'
import { CHUNK_RELOAD_WINDOW_MS } from '@/shared/constants/timing'
import { logger } from './logger'

/** How many `cause` links are followed when looking for a chunk error. */
const MAX_CAUSE_DEPTH = 3

// Chromium · Firefox · Safari · Vite CSS preload.
const CHUNK_ERROR_PATTERN =
  /failed to fetch dynamically imported module|error loading dynamically imported module|importing a module script failed|unable to preload css/i

/** Xətanın özü və ya `cause` zənciri chunk yükləmə xətasıdırsa `true`. */
export function isChunkLoadError(error: unknown, depth = 0): boolean {
  if (!(error instanceof Error) || depth > MAX_CAUSE_DEPTH) return false
  return (
    CHUNK_ERROR_PATTERN.test(error.message) ||
    isChunkLoadError(error.cause, depth + 1)
  )
}

/** Son 10 s-də yenilənməyibsə səhifəni yeniləyir; `true` — reload başladı. */
export function reloadOnce(error?: unknown): boolean {
  try {
    const last = Number(sessionStorage.getItem(CHUNK_RELOAD_KEY) ?? 0)
    if (Date.now() - last < CHUNK_RELOAD_WINDOW_MS) return false
    sessionStorage.setItem(CHUNK_RELOAD_KEY, String(Date.now()))
  } catch {
    // sessionStorage bağlıdırsa dövrəni izləyə bilmirik — yeniləmə riskə getmir.
    return false
  }
  logger.warn('chunk-reload', {
    message: error instanceof Error ? error.message : undefined,
  })
  window.location.reload()
  return true
}

/** Bootstrap-da, ilk dinamik import-dan əvvəl çağırılır (main.tsx). */
export function installChunkReloadGuard(): void {
  window.addEventListener('vite:preloadError', (event) => {
    if (reloadOnce((event as Event & { payload?: unknown }).payload)) {
      event.preventDefault()
    }
  })
}
