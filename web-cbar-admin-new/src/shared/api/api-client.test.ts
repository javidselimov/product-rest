import { beforeAll, describe, expect, it } from 'vitest'

import {
  loadRuntimeConfig,
  getRuntimeConfig,
  resetRuntimeConfig,
} from '@/shared/config/runtime-config'
import { apiClient } from './api-client'
import { isAppError } from './types'

describe('runtime config', () => {
  it('build-time VITE_API_URL dəyərini (testdə /api/v1) qaytarır', async () => {
    resetRuntimeConfig()
    const config = await loadRuntimeConfig()
    expect(config.urls.apiUrl).toBe('/api/v1')
    expect(getRuntimeConfig()).toBe(config)
  })
})

describe('apiClient + MSW', () => {
  beforeAll(async () => {
    await loadRuntimeConfig()
  })

  it('real kontraktlı login endpoint-inə çatır (baseURL /api/v1)', async () => {
    const response = await apiClient.post<{ accessToken: string }>(
      '/auth/login',
      { username: 'admin', password: 'ChangeMe123!' },
    )
    expect(response.accessToken.split('.')).toHaveLength(3)
  })

  it('yanlış giriş 401 → AppError(status 401, mesaj API-dən)', async () => {
    await expect(
      apiClient.post('/auth/login', { username: 'admin', password: 'x' }),
    ).rejects.toMatchObject({ status: 401, message: 'Invalid credentials.' })
  })

  it('tanınmayan endpoint normalize olunmuş AppError qaytarır', async () => {
    // MSW onUnhandledRequest: 'error' sorğunu şəbəkə xətası kimi kəsir —
    // interceptor onu AppError-ə çevirməlidir.
    await expect(apiClient.get('/movcud-deyil')).rejects.toSatisfy(isAppError)
  })
})
