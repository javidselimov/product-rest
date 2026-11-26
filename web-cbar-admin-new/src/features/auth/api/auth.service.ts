/**
 * Auth servisi — real `api-cbar-admin` kontraktı
 * (specs/005-admin-persistent-session/contracts/auth-api.md):
 *   POST /auth/login   → { accessToken, expiresAt } + httpOnly refresh cookie
 *   POST /auth/refresh → eyni forma, cookie rotasiya olunur
 *   POST /auth/logout  → 204, cookie silinir
 * Yalnız bu üç sorğu `withCredentials` ilə gedir (cookie `Path=/api/v1/auth`).
 * `/auth/me` yoxdur; istifadəçi token payload-undan çıxarılır (entities/user#userFromToken).
 */

import { z } from 'zod'

import { apiClient } from '@/shared/api/api-client'

export interface LoginRequest {
  username: string
  password: string
}

export const loginResponseSchema = z.looseObject({
  accessToken: z.string().min(1),
  expiresAt: z.string().min(1),
})

export type LoginResponse = z.infer<typeof loginResponseSchema>

const withCookie = { withCredentials: true }

export const authService = {
  login: async (body: LoginRequest): Promise<LoginResponse> =>
    loginResponseSchema.parse(
      await apiClient.post('/auth/login', body, withCookie),
    ),

  refresh: async (): Promise<LoginResponse> =>
    loginResponseSchema.parse(
      await apiClient.post('/auth/refresh', undefined, withCookie),
    ),

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout', undefined, withCookie)
  },
}
