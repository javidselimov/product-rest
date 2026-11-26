/**
 * Paylaşılan `QueryClient` defolt-ları (konstitusiya Maddə V — server state).
 *
 * Hər sorğu üçün loading / empty / error / success vəziyyətləri məcburidir
 * (Maddə VII.4) — bu fayl yalnız təkrar cəhd və köhnəlmə siyasətini təyin edir.
 *
 * ⚠️ Bu modul `app-providers.tsx`-dən (`'use client'`) çağırılır, yəni buradakı hər
 * import bütün səhifələrin client bundle-ına düşür. Məhz buna görə `@/shared/api/app-error`
 * zod-suz saxlanılır: əvvəllər `AppError` zod-lu modulda idi və bütün zod runtime-ı
 * hər səhifəyə gedirdi (spec 003 D2). Parse funksiyaları lazım olsa — onlar
 * `@/shared/api/app-error-parse` server-only modulundadır, **buradan import edilmir**.
 */
import { QueryClient } from '@tanstack/react-query'

import { AppError } from '@/shared/api/app-error'
import { QUERY_GC_MS, QUERY_STALE_MS } from '@/shared/constants/timing'

/** Yenidən cəhd etməyin mənası olmayan hallar. */
const NON_RETRYABLE: ReadonlySet<AppError['kind']> = new Set([
  'auth',
  'forbidden',
  'notFound',
  'validation',
  'schema',
])

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: QUERY_STALE_MS,
        gcTime: QUERY_GC_MS,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          if (error instanceof AppError && NON_RETRYABLE.has(error.kind)) return false
          return failureCount < 2
        },
      },
      mutations: {
        retry: false,
      },
    },
  })
}
