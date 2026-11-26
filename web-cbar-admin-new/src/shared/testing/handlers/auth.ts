/**
 * Auth mock-ları — REAL KONTRAKT (specs/005-admin-persistent-session/contracts/auth-api.md):
 *   POST /api/v1/auth/login   { username, password } → { accessToken, expiresAt } + cookie
 *   401 → { message: 'Invalid credentials.' } (kilidli hesab da — spec 012)
 *   429 → { message: 'Too many login attempts. Try again later.' } + Retry-After
 *   POST /api/v1/auth/refresh → eyni forma; sessiya yoxdursa 401 { message, code }
 *   POST /api/v1/auth/logout  → 204
 * `/auth/me` YOXDUR. Seed giriş: admin / ChangeMe123! (`templateInfo.demoPassword`).
 *
 * httpOnly cookie-ni node mühitində brauzer kimi saxlamaq mümkün deyil — server
 * tərəfi sessiya əvəzinə bu modulun vəziyyətidir (`setMockSession`). Hər testdən
 * sonra `resetAuthMock` (setup.ts) sessiyanı bağlayır.
 */

import { HttpResponse, http } from 'msw'

import type { LoginRequest } from '@/features/auth/api/auth.service'
import { templateInfo } from '@/shared/config/brand'
import { makeAdminJwt } from '../factories'

export const SEED_USERNAME = 'admin'
export const SEED_PASSWORD = templateInfo.demoPassword
/** Bu ad ilə login ad üzrə limitə düşür (429) — server bunu 120 s-də 10 cəhddən sonra edir. */
export const RATE_LIMITED_USERNAME = 'rate-limited'

/** `refresh_stale` — bir dəfə stale, sonra uğur (başqa tabın rotasiyası). */
export type MockSession = 'active' | 'none' | 'stale-once'

let session: MockSession = 'none'
let refreshCalls = 0
let logoutCalls = 0
let lastCredentials: RequestCredentials | null = null

export const setMockSession = (value: MockSession): void => {
  session = value
}
export const getRefreshCallCount = (): number => refreshCalls
export const getLogoutCallCount = (): number => logoutCalls
/** Son auth sorğusunun `credentials` rejimi — `include` = `withCredentials: true`. */
export const getLastAuthCredentials = (): RequestCredentials | null =>
  lastCredentials

export function resetAuthMock(): void {
  session = 'none'
  refreshCalls = 0
  logoutCalls = 0
  lastCredentials = null
}

const tokenResponse = () =>
  HttpResponse.json({
    accessToken: makeAdminJwt(),
    expiresAt: new Date(Date.now() + 15 * 60_000).toISOString(),
  })

const sessionExpired = (code: string) =>
  HttpResponse.json({ message: 'Session expired.', code }, { status: 401 })

export const authHandlers = [
  http.post('/api/v1/auth/login', async ({ request }) => {
    lastCredentials = request.credentials
    const body = (await request.json()) as LoginRequest
    if (body.username === RATE_LIMITED_USERNAME) {
      return HttpResponse.json(
        { message: 'Too many login attempts. Try again later.' },
        { status: 429, headers: { 'Retry-After': '10' } },
      )
    }
    if (body.username !== SEED_USERNAME || body.password !== SEED_PASSWORD) {
      return HttpResponse.json(
        { message: 'Invalid credentials.' },
        { status: 401 },
      )
    }
    session = 'active'
    return tokenResponse()
  }),

  http.post('/api/v1/auth/refresh', ({ request }) => {
    lastCredentials = request.credentials
    refreshCalls++
    if (session === 'none') return sessionExpired('refresh_missing')
    if (session === 'stale-once') {
      session = 'active'
      return sessionExpired('refresh_stale')
    }
    return tokenResponse()
  }),

  http.post('/api/v1/auth/logout', ({ request }) => {
    lastCredentials = request.credentials
    logoutCalls++
    session = 'none'
    return new HttpResponse(null, { status: 204 })
  }),
]
