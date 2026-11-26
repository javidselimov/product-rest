/**
 * Tək axios instance (guideline §10.5). `baseURL` hər sorğuda runtime config-dən
 * oxunur (request interceptor-da) — beləcə modul import sırası config-in
 * yüklənməsindən asılı olmur.
 *
 * Default `withCredentials: false`: məzmun sorğularında auth yalnız
 * `Authorization: Bearer` header-idir. Refresh cookie (`Path=/api/v1/auth`) yalnız
 * login/refresh/logout-a lazımdır — onlar `withCredentials: true`-nu özləri verir
 * (`features/auth/api/auth.service.ts`, spec 005).
 */

import axios from 'axios'

import { API_TIMEOUT_MS } from '@/shared/constants/timing'

import { setupInterceptors } from './interceptors'

export const httpClient = axios.create({
  timeout: API_TIMEOUT_MS,
  withCredentials: false,
})

setupInterceptors(httpClient)
