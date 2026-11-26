import { screen, waitFor } from '@testing-library/react'
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

import { apiClient } from '@/shared/api/api-client'
import { loadRuntimeConfig } from '@/shared/config/runtime-config'
import { adminUser, makeAdminJwt } from '@/shared/testing/factories'
import {
  RATE_LIMITED_USERNAME,
  getRefreshCallCount,
} from '@/shared/testing/handlers/auth'
import { renderApp } from '@/shared/testing/render'
import { server } from '@/shared/testing/server'
import { useAuthStore } from './model/auth-store'

describe('auth axını', () => {
  beforeAll(async () => {
    await loadRuntimeConfig()
  })

  beforeEach(() => {
    useAuthStore.getState().logout()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('boş form validasiya mesajlarını göstərir, sorğu getmir', async () => {
    const user = userEvent.setup()
    renderApp('/login')

    await user.click(await screen.findByRole('button', { name: 'Daxil ol' }))

    expect(
      await screen.findByText('İstifadəçi adını daxil edin'),
    ).toBeInTheDocument()
    expect(screen.getByText('Şifrəni daxil edin')).toBeInTheDocument()
  })

  it('yanlış şifrə 401 → "istifadəçi adı və ya şifrə yanlışdır"', async () => {
    const user = userEvent.setup()
    renderApp('/login')

    await user.type(await screen.findByLabelText('İstifadəçi adı'), 'admin')
    await user.type(screen.getByLabelText('Şifrə'), 'yanlis-sifre')
    await user.click(screen.getByRole('button', { name: 'Daxil ol' }))

    expect(
      await screen.findByText('İstifadəçi adı və ya şifrə yanlışdır'),
    ).toBeInTheDocument()
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
  })

  it('ad üzrə limit 429 → "çox sayda giriş cəhdi", login səhifəsində qalır', async () => {
    const user = userEvent.setup()
    renderApp('/login')

    await user.type(
      await screen.findByLabelText('İstifadəçi adı'),
      RATE_LIMITED_USERNAME,
    )
    await user.type(screen.getByLabelText('Şifrə'), 'istenilen-sifre')
    await user.click(screen.getByRole('button', { name: 'Daxil ol' }))

    expect(
      await screen.findByText(
        'Çox sayda giriş cəhdi. Bir az sonra yenidən cəhd edin',
      ),
    ).toBeInTheDocument()
    expect(
      screen.queryByText('İstifadəçi adı və ya şifrə yanlışdır'),
    ).not.toBeInTheDocument()
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
    expect(screen.getByRole('button', { name: 'Daxil ol' })).toBeInTheDocument()
  })

  it('server xətası (5xx) giriş xətasından fərqli mesaj göstərir', async () => {
    server.use(
      http.post('/api/v1/auth/login', () =>
        HttpResponse.text('', { status: 500 }),
      ),
    )
    const user = userEvent.setup()
    renderApp('/login')

    await user.type(await screen.findByLabelText('İstifadəçi adı'), 'admin')
    await user.type(screen.getByLabelText('Şifrə'), 'ChangeMe123!')
    await user.click(screen.getByRole('button', { name: 'Daxil ol' }))

    expect(
      await screen.findByText('Gözlənilməz xəta baş verdi'),
    ).toBeInTheDocument()
  })

  it('qorunan ünvan login-ə yönləndirir və girişdən sonra geri qaytarır', async () => {
    const user = userEvent.setup()
    renderApp('/laws')

    await user.type(await screen.findByLabelText('İstifadəçi adı'), 'admin')
    await user.type(screen.getByLabelText('Şifrə'), 'ChangeMe123!')
    await user.click(screen.getByRole('button', { name: 'Daxil ol' }))

    expect(
      await screen.findByRole('heading', { name: 'Qanunlar' }),
    ).toBeInTheDocument()
    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(true)
    expect(state.user?.username).toBe('admin')
    expect(state.user?.roleCode).toBe('admin')
    expect(state.accessToken?.split('.')).toHaveLength(3)
    expect(state.expiresAt).toBeTruthy()
    // Token brauzer yaddaşına yazılmır (FR-010).
    expect(localStorage.getItem('cbar.token')).toBeNull()
    expect(Object.keys(sessionStorage)).toHaveLength(0)
  })

  it('API 401 + refresh rədd edilir → sessiya təmizlənir, login səhifəsi, "sessiya bitdi" toast-u', async () => {
    renderApp('/')
    useAuthStore
      .getState()
      .login(
        makeAdminJwt(),
        adminUser,
        new Date(Date.now() + 900_000).toISOString(),
      )
    server.use(
      http.get('/api/v1/laws', () => HttpResponse.text('', { status: 401 })),
    )

    await expect(apiClient.get('/laws')).rejects.toMatchObject({ status: 401 })

    await waitFor(() =>
      expect(useAuthStore.getState().isAuthenticated).toBe(false),
    )
    expect(await screen.findByText('Daxil ol')).toBeInTheDocument()
    expect(
      await screen.findByText('Sessiyanın vaxtı bitdi — yenidən daxil olun'),
    ).toBeInTheDocument()
    expect(getRefreshCallCount()).toBe(1)
  })

  it('token müddəti bitəndə taymer çıxarmır — sessiyanı yalnız server bitirir', () => {
    vi.useFakeTimers()
    renderApp('/')
    useAuthStore
      .getState()
      .login(
        makeAdminJwt(),
        adminUser,
        new Date(Date.now() + 2_000).toISOString(),
      )

    vi.advanceTimersByTime(60_000)

    expect(useAuthStore.getState().isAuthenticated).toBe(true)
    expect(getRefreshCallCount()).toBe(0)
  })
})
