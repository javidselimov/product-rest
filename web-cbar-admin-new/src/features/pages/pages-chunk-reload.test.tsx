/**
 * Reqressiya (spec 004 SC-004): deploy-dan sonra köhnə tabda redaktor chunk-ı
 * yüklənmir. Əvvəl bu, "Nəsə səhv getdi" ekranı verirdi; indi səhifə bir dəfə
 * yenilənir (yeni `index.html` → yeni chunk-lar). Ayrı fayldadır, çünki modul
 * mock-u eyni fayldakı digər testlərə sızmamalıdır.
 */

import { screen } from '@testing-library/react'
import { afterEach, beforeAll, beforeEach, expect, it, vi } from 'vitest'

import { useAuthStore } from '@/features/auth/model/auth-store'
import { loadRuntimeConfig } from '@/shared/config/runtime-config'
import { adminUser, makeAdminJwt } from '@/shared/testing/factories'
import { pagesHandlers, pagesStore } from '@/shared/testing/handlers/pages'
import { renderApp } from '@/shared/testing/render'
import { server } from '@/shared/testing/server'

vi.mock('@/features/rich-text/ui/rich-text-editor', () => {
  throw new TypeError(
    'Failed to fetch dynamically imported module: /assets/rich-text-editor-old.js',
  )
})

const originalLocation = window.location
let reload: ReturnType<typeof vi.fn>

beforeAll(async () => {
  await loadRuntimeConfig()
})

beforeEach(() => {
  sessionStorage.clear()
  pagesStore.reset()
  server.use(...pagesHandlers)
  reload = vi.fn()
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: { ...originalLocation, reload },
  })
  useAuthStore
    .getState()
    .login(
      makeAdminJwt(),
      adminUser,
      new Date(Date.now() + 15 * 60_000).toISOString(),
    )
})

afterEach(() => {
  useAuthStore.getState().logout()
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: originalLocation,
  })
})

it('redaktor chunk-ı tapılmayanda xəta ekranı yox, bir dəfə yenilənmə', async () => {
  renderApp('/pages/new?parentId=1')
  await screen.findByRole('heading', { name: 'Yeni səhifə' })
  await vi.waitFor(() => expect(reload).toHaveBeenCalledTimes(1))
  expect(screen.queryByText('Nəsə səhv getdi')).not.toBeInTheDocument()
})
