/**
 * Məzmun domain-inin ortaq tipləri (data-model.md §1): locale-lər, tərcümə
 * konteyneri, ContentStatus və nişan palitraları. Etiketlər i18n açarlarıdır
 * (`common:status.*`) — konfiqlərdə hardcoded mətn yoxdur.
 */

import type { ColorPalette } from '@cbar/lib-react-ui-kit/lib'
import { z } from 'zod'

export const LOCALES = ['az', 'en'] as const
export type Locale = (typeof LOCALES)[number]

export type Translations<T> = Partial<Record<Locale, T>>

export const CONTENT_STATUSES = [
  'draft',
  'scheduled',
  'published',
  'archived',
] as const
export type ContentStatus = (typeof CONTENT_STATUSES)[number]

export const contentStatusSchema = z.enum(CONTENT_STATUSES)

/** Seçim siyahısı elementi — `labelKey` i18n açarı, `label` yalnız API-dən gələn mətn üçün. */
export interface SelectOption {
  value: string | number
  labelKey?: string
  label?: string
}

export const CONTENT_STATUS_OPTIONS: SelectOption[] = CONTENT_STATUSES.map(
  (status) => ({ value: status, labelKey: `common:status.${status}` }),
)

/** Səhifələr üçün `scheduled` yoxdur (contracts/admin-api.md §4). */
export const PAGE_STATUS_OPTIONS: SelectOption[] =
  CONTENT_STATUS_OPTIONS.filter((o) => o.value !== 'scheduled')

export const ACTIVE_OPTIONS: SelectOption[] = [
  { value: 'true', labelKey: 'common:status.active' },
  { value: 'false', labelKey: 'common:status.inactive' },
]

export const STATUS_PALETTE: Record<string, ColorPalette> = {
  draft: 'black',
  scheduled: 'yellow',
  published: 'green',
  archived: 'secondary',
}

export const STATUS_LABEL_KEYS: Record<string, string> = Object.fromEntries(
  CONTENT_STATUSES.map((s) => [s, `common:status.${s}`]),
)

export const ACTIVE_PALETTE: Record<string, ColorPalette> = {
  true: 'green',
  false: 'black',
}

export const ACTIVE_LABEL_KEYS: Record<string, string> = {
  true: 'common:status.active',
  false: 'common:status.inactive',
}

export const YES_NO_LABEL_KEYS: Record<string, string> = {
  true: 'common:status.yes',
  false: 'common:status.no',
}

/** Bir tərcümə obyektinin `translations` dict sxemi: `{ az?: T, en?: T }`. */
export const translationsSchema = <T extends z.ZodTypeAny>(item: T) =>
  z.object({ az: item.optional(), en: item.optional() }).partial()

/** Seçim etiketini dəyərə görə həll edir (id → ad sütunları üçün). */
export function optionLabel(
  options: SelectOption[],
  value: unknown,
  t: (key: string) => string,
): string {
  if (value === null || value === undefined || value === '') return '—'
  const option = options.find((o) => String(o.value) === String(value))
  if (!option) return `#${String(value)}`
  return option.labelKey ? t(option.labelKey) : (option.label ?? String(value))
}

/** API tərcümə dict-indən ilk mövcud mətn (az → en → "—"). */
export function firstTranslation(
  translations: Translations<Record<string, unknown>> | undefined,
  field: string,
): string {
  for (const locale of LOCALES) {
    const value = translations?.[locale]?.[field]
    if (typeof value === 'string' && value.trim() !== '') return value
  }
  return '—'
}
