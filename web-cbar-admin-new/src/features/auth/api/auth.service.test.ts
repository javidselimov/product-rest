import { HttpResponse, http } from 'msw'
import { beforeAll, describe, expect, it } from 'vitest'

import { apiClient } from '@/shared/api/api-client'
import { loadRuntimeConfig } from '@/shared/config/runtime-config'
import { getLastAuthCredentials } from '@/shared/testing/handlers/auth'
import { server } from '@/shared/testing/server'
import { authService } from './auth.service'

describe('authService — refresh cookie (spec 005)', () => {
  beforeAll(async () => {
    await loadRuntimeConfig()
  })

  it('login/refresh/logout cookie ilə gedir (withCredentials)', async () => {
    await authService.login({ username: 'admin', password: 'ChangeMe123!' })
    expect(getLastAuthCredentials()).toBe('include')

    const refreshed = await authService.refresh()
    expect(refreshed.accessToken.split('.')).toHaveLength(3)
    expect(getLastAuthCredentials()).toBe('include')

    await authService.logout()
    expect(getLastAuthCredentials()).toBe('include')
  })

  it('məzmun sorğuları cookie göndərmir', async () => {
    let credentials: RequestCredentials | null = null
    server.use(
      http.get('/api/v1/laws', ({ request }) => {
        credentials = request.credentials
        return HttpResponse.json({ items: [], total: 0, page: 1, pageSize: 20 })
      }),
    )

    await apiClient.get('/laws')

    expect(credentials).not.toBe('include')
  })
})
