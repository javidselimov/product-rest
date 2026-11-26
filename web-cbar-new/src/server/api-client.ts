/**
 * SERVER-ONLY — `api-cbar` HTTP client-i (spec 002 research R2, contracts/public-api.md).
 *
 * Bütün API çağırışları serverdə olur; brauzer heç vaxt API-yə birbaşa müraciət
 * etmir. Hər cavab Zod sxemi ilə yoxlanılır — data tipə **cast edilmir**
 * (konstitusiya Maddə X.2). Keş yoxdur: hər sorğu təzədir (köhnə saytın
 * `cache: 'no-store'` davranışı).
 *
 * `import 'server-only'` bu modulun client bundle-ına düşməsini build zamanı
 * qırır; ESLint isə `@/server` qatını yalnız route faylları, feature api və
 * view loader modulları üçün açır (research D6).
 */
import 'server-only'

import axios, { type AxiosInstance } from 'axios'
import type { z } from 'zod'

import { AppError } from '@/shared/api/app-error'
import { normalizeApiError, parseOrThrow } from '@/shared/api/app-error-parse'
import { API_TIMEOUT_MS } from '@/shared/constants/timing'

import { env } from './env'

let instance: AxiosInstance | null = null

/** Tənbəl qurulur ki, testlər `env`-i mock-lamadan da modulu import edə bilsin. */
function client(): AxiosInstance {
  if (!instance) {
    instance = axios.create({
      baseURL: env.API_URL,
      timeout: API_TIMEOUT_MS,
      headers: { Accept: 'application/json' },
    })
  }
  return instance
}

/** Axios xətasını vahid `AppError`-a çevirir (Maddə VII.2). */
export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) return error

  if (axios.isAxiosError(error)) {
    return normalizeApiError(error, {
      status: error.response?.status,
      data: error.response?.data,
      cause: error.code,
    })
  }

  return normalizeApiError(error)
}

/**
 * `GET {API_URL}{path}` → sxem ilə yoxlanmış cavab. Hər xəta `AppError` olur;
 * siyahı səhifələri onu `ErrorState`-ə çevirir.
 */
export async function getJson<T>(path: string, schema: z.ZodType<T>): Promise<T> {
  try {
    const response = await client().get<unknown>(path)
    return parseOrThrow(schema, response.data)
  } catch (error) {
    throw toAppError(error)
  }
}

/**
 * Detal endpoint-ləri üçün: `404` → `null` (səhifə `notFound()` verir), digər
 * xətalar olduğu kimi atılır.
 */
export async function getJsonOrNull<T>(path: string, schema: z.ZodType<T>): Promise<T | null> {
  try {
    return await getJson(path, schema)
  } catch (error) {
    const appError = toAppError(error)
    if (appError.kind === 'notFound') return null
    throw appError
  }
}

/** Testlər üçün: baseURL dəyişəndə instansiyanı sıfırlayır. */
export function resetApiClient(): void {
  instance = null
}
