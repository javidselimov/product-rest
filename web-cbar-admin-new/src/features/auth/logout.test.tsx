import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import { queryClient } from '@/app/providers/query-client'
import { restoreSession } from '@/app/providers/auth-bridge'
import { loadRuntimeConfig } from '@/shared/config/runtime-config'
import { adminUser, makeAdminJwt } from '@/shared/testing/factories'
import {
  getLogoutCallCount,
  setMockSession,
} from '@/shared/testing/handlers/auth'
import { renderApp } from '@/shared/testing/render'
import { server } from '@/shared/testing/server'
import { useAuthStore } from './model/auth-store'

const signIn = () => {
  setMockSession('active')
  useAuthStore
    .getState()
    .login(
      makeAdminJwt(),
      adminUser,
      new Date(Date.now() + 15 * 60_000).toISOString(),
    )
}

const clickSignOut = async () => {
  const user = userEvent.setup()
  await user.click(await screen.findByRole('button', { name: 'Hesab menyusu' }))
  await user.click(await screen.findByRole('menuitem', { name: 'Çıxış' }))
}

describe('çıxış (spec 005, US3)', () => {
  beforeAll(async () => {
    await loadRuntimeConfig()
  })

  beforeEach(() => {
    useAuthStore.getState().logout()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('"Çıxış" serverdə sessiyanı bağlayır, lokal təmizlik edir', async () => {
    signIn()
    const router = renderApp('/laws')
    await screen.findByRole('heading', { name: 'Qanunlar' })

    await clickSignOut()

    await waitFor(() => expect(router.state.location.pathname).toBe('/login'))
    expect(getLogoutCallCount()).toBe(1)
    expect(useAuthStore.getState().status).toBe('anonymous')
    expect(queryClient.getQueryCache().getAll()).toHaveLength(0)

    // Yenilənmədən sonra sessiya bərpa olunmur.
    await restoreSession()
    expect(useAuthStore.getState().status).toBe('anonymous')
  })

  it('logout 500 olsa da istifadəçi bu brauzerdə çıxır', async () => {
    server.use(
      http.post('/api/v1/auth/logout', () =>
        HttpResponse.text('', { status: 500 }),
      ),
    )
    signIn()
    const router = renderApp('/laws')
    await screen.findByRole('heading', { name: 'Qanunlar' })

    await clickSignOut()

    await waitFor(() => expect(router.state.location.pathname).toBe('/login'))
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
  })

  it('başqa tabın logout mesajı bu tabı toast-suz çıxarır, serverə sorğu getmir', async () => {
    const channels: FakeChannel[] = []
    class FakeChannel {
      listeners: ((event: MessageEvent) => void)[] = []
      constructor() {
        channels.push(this)
      }
      addEventListener(_type: string, listener: (event: MessageEvent) => void) {
        this.listeners.push(listener)
      }
      postMessage() {}
      close() {}
    }
    vi.stubGlobal('BroadcastChannel', FakeChannel)
    signIn()
    const router = renderApp('/laws')
    await screen.findByRole('heading', { name: 'Qanunlar' })

    const emit = (origin: string) =>
      act(() => {
        for (const listener of channels.at(-1)!.listeners)
          listener(
            new MessageEvent('message', { data: { type: 'logout' }, origin }),
          )
      })

    emit('https://evil.example')
    expect(useAuthStore.getState().isAuthenticated).toBe(true)

    emit(window.location.origin)

    await waitFor(() => expect(router.state.location.pathname).toBe('/login'))
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
    expect(getLogoutCallCount()).toBe(0)
    expect(
      screen.queryByText('Sessiyanın vaxtı bitdi — yenidən daxil olun'),
    ).not.toBeInTheDocument()
  })
})
