/**
 * Interceptor-lar (guideline §15.8 axını): burada UI logic yoxdur — yalnız
 * transport səviyyəsi. Auth ilə əlaqə `setAuthHooks` ilə qurulur (shared layer
 * features-dən asılı ola bilməz — körpünü app layer qeydiyyatdan keçirir).
 *
 * Sessiya axını (spec 005, contracts/panel-session.md §2): token bitmək üzrədirsə
 * sorğudan əvvəl, 401 gəldikdə isə sonra səssiz refresh edilir və sorğu BİR dəfə
 * təkrarlanır. Çıxış yalnız refresh rədd ediləndə olur; 5xx/timeout/şəbəkə heç vaxt.
 */

import {
  isAxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios'

import { getRuntimeConfig } from '@/shared/config/runtime-config'
import { HTTP_STATUS } from '@/shared/constants/http'
import { REFRESH_MARGIN_MS } from '@/shared/constants/timing'
import { normalizeApiError } from './types'

export interface AuthHooks {
  getToken: () => string | null
  getExpiresAt: () => string | null
  /**
   * `true` — yeni token store-dadır; `false` — refresh rədd edildi (sessiya bitib).
   * Şəbəkə/5xx xətasında reject edir — bu, çıxış səbəbi deyil.
   */
  refresh: () => Promise<boolean>
  onSessionExpired: () => void
}

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean }

/** Öz 401-i "sessiya bitdi" demək olmayan və refresh axınına girməyən sorğular. */
const isAuthUrl = (url: string | undefined): boolean =>
  /\/auth\/(login|refresh|logout)$/.test(url ?? '')

const isExpiring = (expiresAt: string | null): boolean => {
  if (!expiresAt) return false
  const expiresAtMs = new Date(expiresAt).getTime()
  return !Number.isNaN(expiresAtMs) && expiresAtMs - REFRESH_MARGIN_MS <= Date.now()
}

let authHooks: AuthHooks | null = null

/** App bootstrap-ı çağırır (`app/providers/auth-bridge.ts`). */
export function setAuthHooks(hooks: AuthHooks): void {
  authHooks = hooks
}

export function setupInterceptors(client: AxiosInstance): void {
  client.interceptors.request.use(async (config: RetriableConfig) => {
    config.baseURL ??= getRuntimeConfig().urls.apiUrl
    if (
      authHooks &&
      !isAuthUrl(config.url) &&
      authHooks.getToken() &&
      isExpiring(authHooks.getExpiresAt())
    ) {
      try {
        if (!(await authHooks.refresh())) {
          authHooks.onSessionExpired()
          // Sessiya artıq bitib — 401 gəlsə ikinci refresh cəhdi olmasın.
          config._retry = true
        }
      } catch {
        // Refresh-in şəbəkə xətası: sorğu köhnə tokenlə gedir, nəticəni server deyir.
      }
    }
    const token = authHooks?.getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  })

  client.interceptors.response.use(
    (response) => response,
    async (error: unknown) => {
      const appError = normalizeApiError(error)
      const config = isAxiosError(error)
        ? (error.config as RetriableConfig | undefined)
        : undefined
      if (
        appError.status === HTTP_STATUS.UNAUTHORIZED &&
        authHooks &&
        config &&
        !config._retry &&
        !isAuthUrl(config.url)
      ) {
        config._retry = true
        let refreshed: boolean
        try {
          refreshed = await authHooks.refresh()
        } catch {
          return Promise.reject(appError)
        }
        if (refreshed) return client.request(config)
        authHooks.onSessionExpired()
      }
      return Promise.reject(appError)
    },
  )
}
