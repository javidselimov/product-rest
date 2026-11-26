import { screen, waitFor } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { restoreSession } from '@/app/providers/auth-bridge'
import { loadRuntimeConfig } from '@/shared/config/runtime-config'
import { setMockSession } from '@/shared/testing/handlers/auth'
import { renderApp } from '@/shared/testing/render'
import { server } from '@/shared/testing/server'
import { useAuthStore } from './model/auth-store'

/** Səhifə yenilənməsi = təmiz store + `restoreSession` (main.tsx ilə eyni sıra). */
describe('sessiya bərpası (spec 005, US1)', () => {
  beforeAll(async () => {
    await loadRuntimeConfig()
  })

  beforeEach(() => {
    useAuthStore.setState({
      status: 'restoring',
      isAuthenticated: false,
      user: null,
      accessToken: null,
      expiresAt: null,
    })
  })

  it('etibarlı cookie → login ekranı olmadan qorunan səhifə açılır', async () => {
    setMockSession('active')

    await restoreSession()
    renderApp('/laws')

    expect(
      await screen.findByRole('heading', { name: 'Qanunlar' }),
    ).toBeInTheDocument()
    const state = useAuthStore.getState()
    expect(state.status).toBe('authenticated')
    expect(state.user?.username).toBe('admin')
    // Token yalnız yaddaşdadır, cookie JS-ə görünmür (FR-010).
    const stored = [
      ...Object.values(localStorage),
      ...Object.values(sessionStorage),
    ].join('\n')
    expect(stored).not.toContain(state.accessToken!)
    expect(Object.keys(sessionStorage)).toHaveLength(0)
    expect(document.cookie).not.toContain('cbar_admin_rt')
  })

  it('sessiya yoxdur → login-ə redirect ilə, toast-suz', async () => {
    await restoreSession()
    const router = renderApp('/laws')

    expect(
      await screen.findByRole('button', { name: 'Daxil ol' }),
    ).toBeInTheDocument()
    expect(useAuthStore.getState().status).toBe('anonymous')
    expect(router.state.location.pathname).toBe('/login')
    expect(router.state.location.search).toMatchObject({ redirect: '/laws' })
    expect(
      screen.queryByText('Sessiyanın vaxtı bitdi — yenidən daxil olun'),
    ).not.toBeInTheDocument()
  })

  it.each([
    ['500', 500],
    ['404 (köhnə API)', 404],
  ])('refresh %s → anonim, toast yox', async (_label, status) => {
    server.use(
      http.post('/api/v1/auth/refresh', () =>
        HttpResponse.text('', { status }),
      ),
    )

    await restoreSession()
    renderApp('/')

    expect(
      await screen.findByRole('button', { name: 'Daxil ol' }),
    ).toBeInTheDocument()
    expect(useAuthStore.getState().status).toBe('anonymous')
    expect(
      screen.queryByText('Sessiyanın vaxtı bitdi — yenidən daxil olun'),
    ).not.toBeInTheDocument()
  })

  it('daxil olmuş istifadəçi /login?redirect=… açanda hədəfə keçir', async () => {
    setMockSession('active')

    await restoreSession()
    const router = renderApp('/login?redirect=/laws')

    expect(
      await screen.findByRole('heading', { name: 'Qanunlar' }),
    ).toBeInTheDocument()
    await waitFor(() => expect(router.state.location.pathname).toBe('/laws'))
  })

  it('xarici redirect hədəfi qəbul edilmir — kökə keçir', async () => {
    setMockSession('active')

    await restoreSession()
    const router = renderApp('/login?redirect=//evil.example')

    await waitFor(() => expect(router.state.location.pathname).toBe('/'))
  })
})
