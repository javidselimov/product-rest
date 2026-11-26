import { HttpResponse, http } from 'msw'
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { apiClient } from '@/shared/api/api-client'
import { loadRuntimeConfig } from '@/shared/config/runtime-config'
import { adminUser, makeAdminJwt } from '@/shared/testing/factories'
import {
  getRefreshCallCount,
  setMockSession,
} from '@/shared/testing/handlers/auth'
import { renderApp } from '@/shared/testing/render'
import { server } from '@/shared/testing/server'
import { useAuthStore } from './model/auth-store'

const inMinutes = (minutes: number) =>
  new Date(Date.now() + minutes * 60_000).toISOString()

const signIn = (expiresAt = inMinutes(15)) =>
  useAuthStore.getState().login(makeAdminJwt(), adminUser, expiresAt)

/** Refresh olunana qədər 401, sonra 200 — "access token bitib" serveri. */
const lawsUntilRefreshed = () => {
  let calls = 0
  server.use(
    http.get('/api/v1/laws', () => {
      calls++
      return getRefreshCallCount() === 0
        ? HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
        : HttpResponse.json({ items: [] })
    }),
  )
  return () => calls
}

describe('səssiz token yenilənməsi (spec 005, US2)', () => {
  beforeAll(async () => {
    await loadRuntimeConfig()
  })

  beforeEach(() => {
    useAuthStore.getState().logout()
    // Hook-lar (refresh/onSessionExpired) router-ə bağlanır.
    renderApp('/')
  })

  it('401 → refresh → sorğu bir dəfə təkrarlanır, çıxış yoxdur', async () => {
    setMockSession('active')
    signIn()
    const lawsCalls = lawsUntilRefreshed()

    await expect(apiClient.get('/laws')).resolves.toEqual({ items: [] })

    expect(getRefreshCallCount()).toBe(1)
    expect(lawsCalls()).toBe(2)
    expect(useAuthStore.getState().isAuthenticated).toBe(true)
  })

  it('token bitmək üzrədirsə refresh sorğudan əvvəl gedir — 401 görünmür', async () => {
    setMockSession('active')
    signIn(new Date(Date.now() - 1_000).toISOString())
    const lawsCalls = lawsUntilRefreshed()

    await expect(apiClient.get('/laws')).resolves.toEqual({ items: [] })

    expect(getRefreshCallCount()).toBe(1)
    expect(lawsCalls()).toBe(1)
    expect(
      new Date(useAuthStore.getState().expiresAt!).getTime(),
    ).toBeGreaterThan(Date.now())
  })

  it('5 paralel 401 → tək refresh, hamısı uğurlu', async () => {
    setMockSession('active')
    signIn()
    lawsUntilRefreshed()

    const results = await Promise.all(
      Array.from({ length: 5 }, () => apiClient.get('/laws')),
    )

    expect(results).toHaveLength(5)
    expect(getRefreshCallCount()).toBe(1)
  })

  it('refresh_stale (başqa tab rotasiya edib) bir dəfə təkrarlanır, çıxış yoxdur', async () => {
    setMockSession('stale-once')
    signIn()
    lawsUntilRefreshed()

    await expect(apiClient.get('/laws')).resolves.toEqual({ items: [] })

    expect(getRefreshCallCount()).toBe(2)
    expect(useAuthStore.getState().isAuthenticated).toBe(true)
  })

  it('refresh 500 → orijinal xəta, sessiya qalır', async () => {
    signIn()
    server.use(
      http.post('/api/v1/auth/refresh', () =>
        HttpResponse.text('', { status: 500 }),
      ),
      http.get('/api/v1/laws', () =>
        HttpResponse.json({ message: 'Unauthorized' }, { status: 401 }),
      ),
    )

    await expect(apiClient.get('/laws')).rejects.toMatchObject({ status: 401 })

    expect(useAuthStore.getState().isAuthenticated).toBe(true)
  })

  it('təkrarlanmış sorğu yenə 401 → ikinci refresh yoxdur', async () => {
    setMockSession('active')
    signIn()
    server.use(
      http.get('/api/v1/laws', () =>
        HttpResponse.json({ message: 'Forbidden' }, { status: 401 }),
      ),
    )

    await expect(apiClient.get('/laws')).rejects.toMatchObject({ status: 401 })

    expect(getRefreshCallCount()).toBe(1)
  })

  it('login-in öz 401-i refresh çağırmır', async () => {
    await expect(
      apiClient.post('/auth/login', { username: 'admin', password: 'x' }),
    ).rejects.toMatchObject({ status: 401 })

    expect(getRefreshCallCount()).toBe(0)
  })
})
