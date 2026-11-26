/**
 * URL state — `searchParams` Zod ilə (spec 002 data-model.md §7, research R4).
 *
 * Next `searchParams` dəyəri `string | string[] | undefined` ola bilər; yanlış
 * dəyər səhifəni qırmır — default-a düşür (konstitusiya Maddə V, X.2).
 */
import { z } from 'zod'

import { QUERY_MAX_LENGTH, YEAR_MAX, YEAR_MIN } from '@/shared/constants/limits'

export type RawSearchParams = Record<string, string | string[] | undefined>

/** Massiv gələndə ilk element, boş sətir → `undefined`. */
export function first(value: string | string[] | undefined): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value
  const trimmed = raw?.trim()
  return trimmed ? trimmed : undefined
}

const rawParam = z
  .union([z.string(), z.array(z.string()), z.undefined()])
  .transform((value) => first(value))

/** Müsbət tam ədəd, yoxsa `undefined`. */
function positiveInt(value: string | undefined): number | undefined {
  if (value === undefined || !/^\d+$/.test(value)) return undefined
  const parsed = Number(value)
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : undefined
}

/** Müsbət tam ədəd; yanlış → 1. */
export const pageSchema = rawParam.transform((value) => positiveInt(value) ?? 1)

/** Müsbət id; yanlış → `undefined`. */
export const optionalIdSchema = rawParam.transform((value) => positiveInt(value))

/** Sabit dəyərlər siyahısından biri; yanlış → `undefined`. */
export function enumParam<const T extends readonly [string, ...string[]]>(values: T) {
  return rawParam.pipe(z.enum(values).optional().catch(undefined))
}

/** `YYYY-MM-DD`; yanlış → `undefined`. */
export const dateParam = rawParam.pipe(
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .refine((v) => !Number.isNaN(new Date(v).getTime()))
    .optional()
    .catch(undefined),
)

/** Axtarış sorğusu — trim, boş → `''`. */
export const queryParam = rawParam.pipe(z.string().max(QUERY_MAX_LENGTH).catch('')).transform((v) => v ?? '')

/** İl; yanlış → `undefined`. */
export const yearParam = rawParam.transform((value) => {
  const year = positiveInt(value)
  return year !== undefined && year >= YEAR_MIN && year <= YEAR_MAX ? year : undefined
})

/**
 * Mövcud sorğu parametrlərini qoruyaraq yeni yol qurur. `overrides`-də `undefined`
 * parametri silir; `page = 1` yazılmır (təmiz ünvan).
 */
export function buildHref(
  basePath: string,
  params: Record<string, string | number | undefined>,
  overrides: Record<string, string | number | undefined> = {},
): string {
  const merged: Record<string, string | number | undefined> = { ...params, ...overrides }
  const search = new URLSearchParams()

  for (const [key, value] of Object.entries(merged)) {
    if (value === undefined || value === '') continue
    if (key === 'page' && Number(value) === 1) continue
    search.set(key, String(value))
  }

  const query = search.toString()
  return query ? `${basePath}?${query}` : basePath
}
