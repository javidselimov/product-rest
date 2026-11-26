/**
 * Auth store (guideline §5.6). Access token YALNIZ yaddaşda yaşayır —
 * localStorage/sessionStorage-da token və ya user snapshot-ı yoxdur.
 * Səhifə yenilənəndə sessiya httpOnly refresh cookie ilə bərpa olunur (spec 005):
 * `app/providers/auth-bridge#restoreSession` render-dən əvvəl `POST /auth/refresh`
 * çağırır, cookie-nin özü JS-ə heç vaxt görünmür.
 */

import { create } from 'zustand'

import type { AuthUser } from '@/entities/user/model/types'

/** `restoring` — açılışda refresh cavabı gözlənilir (router hələ render olunmur). */
export type AuthStatus = 'restoring' | 'anonymous' | 'authenticated'

interface AuthState {
  status: AuthStatus
  isAuthenticated: boolean
  user: AuthUser | null
  accessToken: string | null
  /** ISO vaxt — token bu andan sonra etibarsızdır. */
  expiresAt: string | null
  login: (accessToken: string, user: AuthUser, expiresAt: string) => void
  logout: () => void
  /** Bərpa alınmadı — istifadəçi heç daxil olmamış kimi (toast-suz). */
  setAnonymous: () => void
}

const signedOut = {
  status: 'anonymous',
  isAuthenticated: false,
  user: null,
  accessToken: null,
  expiresAt: null,
} as const

export const useAuthStore = create<AuthState>((set) => ({
  status: 'restoring',
  isAuthenticated: false,
  user: null,
  accessToken: null,
  expiresAt: null,

  login: (accessToken, user, expiresAt) =>
    set({
      status: 'authenticated',
      isAuthenticated: true,
      user,
      accessToken,
      expiresAt,
    }),

  logout: () => set(signedOut),

  setAnonymous: () => set(signedOut),
}))
