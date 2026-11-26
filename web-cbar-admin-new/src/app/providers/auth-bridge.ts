/**
 * Shared API qatı ilə auth feature arasındakı körpü. Shared layer features-dən
 * asılı ola bilməz (FSD), ona görə interceptor-un auth hook-larını app layer
 * bağlayır. Logout siyasəti (guideline §5.10): store clear + query cache clear.
 *
 * Sessiya (spec 005, contracts/panel-session.md): access token yaddaşdadır,
 * refresh token httpOnly cookie-dədir. Açılışda `restoreSession`, token bitəndə
 * və ya 401-də `refreshAccessToken` işləyir. Avtomatik çıxışın yeganə səbəbi
 * serverin refresh-i rədd etməsidir — 403/5xx/şəbəkə heç vaxt, taymer yoxdur.
 */

import { toast } from '@cbar/lib-react-ui-kit/toast'
import type { AnyRouter } from '@tanstack/react-router'

import { userFromToken } from '@/entities/user/model/types'
import { authService } from '@/features/auth/api/auth.service'
import { useAuthStore } from '@/features/auth/model/auth-store'
import { setAuthHooks } from '@/shared/api/interceptors'
import { isAppError } from '@/shared/api/types'
import { HTTP_STATUS } from '@/shared/constants/http'
import { AUTH_CHANNEL, REFRESH_LOCK } from '@/shared/constants/storage'
import { i18n } from '@/shared/i18n'
import { queryClient } from './query-client'

interface AuthMessage {
  type: 'logout'
}

let activeRouter: AnyRouter | null = null
let channel: BroadcastChannel | null = null
let inFlight: Promise<boolean> | null = null

/** Tam logout: store + query cache + login-ə redirect (router ilə, reload-suz). */
export function performLogout(): void {
  const location = activeRouter?.state.location
  useAuthStore.getState().logout()
  queryClient.clear()
  if (activeRouter) {
    const redirect =
      location && location.pathname !== '/login' ? location.href : undefined
    void activeRouter.navigate({ to: '/login', search: { redirect } })
  }
}

const expireSession = () => {
  if (!useAuthStore.getState().isAuthenticated) return
  performLogout()
  toast.warning(i18n.t('sessionExpired', { ns: 'auth' }))
}

/**
 * Bir `POST /auth/refresh`: `true` — yeni token store-dadır, `false` — server
 * rədd etdi. `refresh_stale` (başqa tab cookie-ni bir an əvvəl rotasiya edib,
 * brauzerdə artıq yenisi var) bir dəfə təkrarlanır. Şəbəkə/5xx xətası atılır.
 */
async function requestNewToken(): Promise<boolean> {
  for (let attempt = 0; ; attempt++) {
    try {
      const { accessToken, expiresAt } = await authService.refresh()
      const user = userFromToken(accessToken)
      if (!user) return false
      useAuthStore.getState().login(accessToken, user, expiresAt)
      return true
    } catch (error) {
      if (!isAppError(error) || error.status !== HTTP_STATUS.UNAUTHORIZED) throw error
      if (error.code === 'refresh_stale' && attempt === 0) continue
      return false
    }
  }
}

/**
 * Tab daxilində single-flight (eyni anda N sorğu → 1 refresh), tablar arasında
 * `navigator.locks`. Lock API-si olmayan mühitdə yalnız tab daxili qoruma qalır.
 */
export function refreshAccessToken(): Promise<boolean> {
  inFlight ??= (
    typeof navigator !== 'undefined' && navigator.locks
      ? navigator.locks.request(REFRESH_LOCK, requestNewToken)
      : requestNewToken()
  ).finally(() => {
    inFlight = null
  })
  return inFlight
}

/**
 * Açılışda, router render olunmazdan əvvəl (main.tsx): cookie etibarlıdırsa
 * sessiya bərpa olunur, deyilsə istifadəçi sadəcə login ekranını görür — toast-suz.
 */
export async function restoreSession(): Promise<void> {
  try {
    if (await refreshAccessToken()) return
  } catch {
    // Şəbəkə/5xx və ya köhnə API (endpoint yoxdur) — anonim kimi davam.
  }
  useAuthStore.getState().setAnonymous()
}

/** Topbar "Çıxış": server sessiyanı bağlayır, nəticədən asılı olmayaraq lokal çıxış. */
export async function logoutEverywhere(): Promise<void> {
  try {
    await authService.logout()
  } catch {
    // Server əlçatmaz olsa da istifadəçi bu brauzerdə çıxmış olmalıdır.
  }
  channel?.postMessage({ type: 'logout' } satisfies AuthMessage)
  performLogout()
}

/**
 * Bootstrap-da (main.tsx) real router ilə, testlərdə (`renderApp`) memory router
 * ilə çağırılır — logout həmişə aktiv router üzərindən yönləndirir.
 */
export function registerAuthBridge(router: AnyRouter): void {
  activeRouter = router
  setAuthHooks({
    getToken: () => useAuthStore.getState().accessToken,
    getExpiresAt: () => useAuthStore.getState().expiresAt,
    refresh: refreshAccessToken,
    onSessionExpired: expireSession,
  })

  channel?.close()
  channel =
    typeof BroadcastChannel === 'undefined'
      ? null
      : new BroadcastChannel(AUTH_CHANNEL)
  const expectedOrigin = window.location.origin
  channel?.addEventListener('message', (event: MessageEvent<unknown>) => {
    // BroadcastChannel is same-origin by spec; the explicit check is defence in depth.
    if (event.origin !== '' && event.origin !== expectedOrigin) return
    if (!isAuthMessage(event.data)) return
    // Başqa tab artıq serverdə çıxış edib — burada yalnız lokal təmizlik.
    if (useAuthStore.getState().isAuthenticated) performLogout()
  })
}

function isAuthMessage(data: unknown): data is AuthMessage {
  return (
    typeof data === 'object' &&
    data !== null &&
    (data as { type?: unknown }).type === 'logout'
  )
}
