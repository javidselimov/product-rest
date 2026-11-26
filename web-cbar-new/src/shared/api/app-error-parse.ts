/**
 * SERVER-ONLY — xəta normalizasiyası və sxem yoxlaması (spec 003 D2).
 *
 * `./app-error` yalnız tipi və `AppError` class-ını saxlayır, çünki onu client
 * modulu (`src/providers/query-client.ts`) import edir. Zod-dan asılı hər şey
 * buradadır: brauzer heç bir cavabı validate etmir — bütün sorğular serverdə,
 * `src/server/api-client.ts`-də olur (spec 002 research R2).
 *
 * `import 'server-only'` bu modulun client bundle-ına düşməsini build zamanı qırır.
 */
import 'server-only'

import { z } from 'zod'

import { AppError, FALLBACK_MESSAGE, kindFromStatus } from './app-error'

/** Backend-in (və mock qatının) xəta gövdəsi — tək forma. */
export const apiErrorPayloadSchema = z.object({
  code: z.string().min(1),
  message: z.string().min(1),
})

export type ApiErrorPayload = z.infer<typeof apiErrorPayloadSchema>

/** Cavab sxemə uyğun deyilsə — data tipə **cast edilmir** (Maddə X.2). */
export function schemaMismatch(details?: unknown): AppError {
  return new AppError({
    code: 'SCHEMA_MISMATCH',
    message: FALLBACK_MESSAGE.schema,
    kind: 'schema',
    details,
  })
}

type HttpFailure = {
  status?: number
  data?: unknown
  cause?: unknown
}

/**
 * İstənilən xətanı `AppError`-a çevirir. Artıq `AppError`-dursa olduğu kimi qaytarır,
 * beləliklə interceptor və servis qatı bir-birini ikiləmir.
 */
export function normalizeApiError(error: unknown, failure: HttpFailure = {}): AppError {
  if (error instanceof AppError) return error

  if (error instanceof z.ZodError) return schemaMismatch(error.issues)

  const status = failure.status
  const kind = kindFromStatus(status)

  const payload = apiErrorPayloadSchema.safeParse(failure.data)
  if (payload.success) {
    return new AppError({
      code: payload.data.code,
      message: payload.data.message,
      kind,
      status,
    })
  }

  return new AppError({
    code: status ? `HTTP_${status}` : 'NETWORK_ERROR',
    message: FALLBACK_MESSAGE[kind],
    kind,
    status,
    details: failure.cause ?? error,
  })
}

/**
 * Servis qatının sərhəd yoxlaması: cavab sxemə uymursa `AppError` atılır —
 * data heç vaxt tipə cast edilmir (Maddə X.2). Hər feature-in `api/` qatı
 * bunu işlədir ki, yoxlama forması bir yerdə qalsın.
 */
export function parseOrThrow<T>(schema: z.ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data)
  if (!result.success) throw schemaMismatch(result.error.issues)
  return result.data
}
