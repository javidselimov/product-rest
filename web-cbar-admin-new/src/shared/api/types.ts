/**
 * Normalize olunmuş API xətası (guideline §15.8): interceptor hər xətanı bu
 * formaya salır, UI heç vaxt raw texniki mesaj görmür.
 *
 * `api-cbar-admin` üç fərqli xəta gövdəsi qaytarır (contracts/admin-api.md §2):
 *   { message }                        — açıq BadRequest/Conflict/NotFound
 *   ProblemDetails { title, status }   — bare NotFound()
 *   ValidationProblemDetails { errors: { Field: [..] } }
 * 401/403/500 isə BOŞ gövdə ilə gəlir — mesaj i18n-dən.
 */

import { isAxiosError } from 'axios'

import { HTTP_STATUS } from '@/shared/constants/http'
import { i18n } from '@/shared/i18n'

export interface AppError {
  status?: number
  code?: string
  message: string
  fieldErrors?: Record<string, string>
  traceId?: string
  /** Xəta gövdəsi olduğu kimi — `code`-dan başqa extension-lar (`row`, `count` …) üçün. */
  details?: Record<string, unknown>
}

interface ApiErrorBody {
  code?: string
  message?: string
  title?: string
  errors?: Record<string, string[] | string>
  fieldErrors?: Record<string, string>
  traceId?: string
}

const STATUS_CODES: Record<number, string> = {
  [HTTP_STATUS.BAD_REQUEST]: 'VALIDATION',
  [HTTP_STATUS.UNAUTHORIZED]: 'AUTH',
  [HTTP_STATUS.FORBIDDEN]: 'FORBIDDEN',
  [HTTP_STATUS.NOT_FOUND]: 'NOT_FOUND',
  [HTTP_STATUS.CONFLICT]: 'CONFLICT',
}

const STATUS_MESSAGE_KEYS: Record<number, string> = {
  [HTTP_STATUS.UNAUTHORIZED]: 'errors.unauthorized',
  [HTTP_STATUS.FORBIDDEN]: 'errors.forbidden',
  [HTTP_STATUS.NOT_FOUND]: 'errors.notFound',
  [HTTP_STATUS.CONFLICT]: 'errors.conflict',
  [HTTP_STATUS.INTERNAL_SERVER_ERROR]: 'errors.unexpected',
}

const t = (key: string) => i18n.t(key, { ns: 'common' })

/** ValidationProblemDetails açarı → form sahə adı: `Translations` → `translations`, `$.status` → `status`. */
const toFieldName = (key: string): string => {
  const stripped = key.replace(/^\$\.?/, '')
  return stripped ? stripped[0].toLowerCase() + stripped.slice(1) : stripped
}

const toFieldErrors = (
  errors: ApiErrorBody['errors'],
): Record<string, string> | undefined => {
  if (!errors || typeof errors !== 'object') return undefined
  const result: Record<string, string> = {}
  for (const [key, value] of Object.entries(errors)) {
    const first = Array.isArray(value) ? value[0] : value
    if (typeof first === 'string' && first) result[toFieldName(key)] = first
  }
  return Object.keys(result).length > 0 ? result : undefined
}

export function normalizeApiError(error: unknown): AppError {
  if (isAxiosError(error)) {
    if (error.response) {
      const status = error.response.status
      const raw = error.response.data
      const body: ApiErrorBody =
        typeof raw === 'object' && raw !== null ? (raw as ApiErrorBody) : {}
      const fieldErrors = body.fieldErrors ?? toFieldErrors(body.errors)
      const firstFieldError = fieldErrors
        ? Object.values(fieldErrors)[0]
        : undefined
      const message =
        body.message ??
        (body.errors ? (firstFieldError ?? body.title) : body.title) ??
        (STATUS_MESSAGE_KEYS[status]
          ? t(STATUS_MESSAGE_KEYS[status])
          : t('errors.requestFailed'))
      return {
        status,
        code:
          body.code ??
          STATUS_CODES[status] ??
          (status >= HTTP_STATUS.INTERNAL_SERVER_ERROR ? 'SERVER' : undefined),
        message,
        fieldErrors,
        traceId:
          body.traceId ??
          (error.response.headers?.['x-trace-id'] as string | undefined) ??
          undefined,
        details:
          typeof raw === 'object' && raw !== null
            ? (raw as Record<string, unknown>)
            : undefined,
      }
    }
    if (error.code === 'ECONNABORTED') {
      return { code: 'TIMEOUT', message: t('errors.timeout') }
    }
    return { code: 'NETWORK', message: t('errors.network') }
  }
  if (isAppError(error)) return error
  return { code: 'UNKNOWN', message: t('errors.unexpected') }
}

/** Zod parse uğursuzluğu — API forması kontrakta uyğun deyil (B13). */
export function contractError(detail?: string): AppError {
  return {
    code: 'CONTRACT',
    message: t('errors.contract'),
    traceId: detail,
  }
}

/** Yalnız normalize olunmuş obyekt — `Error` instansiyası (raw texniki xəta) AppError sayılmır. */
export function isAppError(value: unknown): value is AppError {
  return (
    typeof value === 'object' &&
    value !== null &&
    !(value instanceof Error) &&
    'message' in value &&
    typeof (value as AppError).message === 'string'
  )
}
