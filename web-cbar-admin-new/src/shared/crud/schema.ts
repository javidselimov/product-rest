/**
 * Form və URL search sxemləri (B3, B7). Xəta mesajları i18n açarları ilə —
 * `crud` namespace-i (`shared` → `shared/i18n` icazəlidir).
 */

import { z, type ZodType } from 'zod'

import { i18n } from '@/shared/i18n'
import { isDateString, isLocalDateTime } from './date-io'
import { configLocales } from './path'
import type {
  FieldConfig,
  FilterConfig,
  FormSchema,
  ModuleConfig,
} from './types'

/** `HH:mm`, as `<input type="time">` gives it. */
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/

const t = (key: string, options?: Record<string, unknown>) =>
  i18n.t(key, { ns: 'crud', ...options })

const fieldLabel = (config: Pick<ModuleConfig, 'ns'>, field: FieldConfig) =>
  i18n.t(
    field.labelKey.includes(':')
      ? field.labelKey
      : `${config.ns}:${field.labelKey}`,
  )

function valueSchema(
  config: Pick<ModuleConfig, 'ns'>,
  field: FieldConfig,
): ZodType {
  const label = fieldLabel(config, field)
  const required = t('validation.required', { field: label })
  switch (field.type) {
    case 'checkbox':
      return z.boolean()
    case 'number': {
      let s = z
        .string()
        .refine(
          (v) => v.trim() === '' || !Number.isNaN(Number(v)),
          t('validation.number', { field: label }),
        )
      if (field.required) s = s.refine((v) => v.trim() !== '', required)
      if (field.min !== undefined)
        s = s.refine(
          (v) => v.trim() === '' || Number(v) >= field.min!,
          t('validation.min', { field: label, min: field.min }),
        )
      if (field.max !== undefined)
        s = s.refine(
          (v) => v.trim() === '' || Number(v) <= field.max!,
          t('validation.max', { field: label, max: field.max }),
        )
      return s
    }
    case 'date': {
      let s = z
        .string()
        .refine(
          (v) => v === '' || isDateString(v),
          t('validation.date', { field: label }),
        )
      if (field.required) s = s.refine((v) => v !== '', required)
      return s
    }
    case 'time': {
      let s = z
        .string()
        .refine(
          (v) => v === '' || TIME_PATTERN.test(v),
          t('validation.time', { field: label }),
        )
      if (field.required) s = s.refine((v) => v !== '', required)
      return s
    }
    case 'datetime': {
      let s = z
        .string()
        .refine(
          (v) => v === '' || isLocalDateTime(v),
          t('validation.datetime', { field: label }),
        )
      if (field.required) s = s.refine((v) => v !== '', required)
      return s
    }
    default: {
      const s = z.string()
      return field.required ? s.refine((v) => v.trim() !== '', required) : s
    }
  }
}

/** Form sxemi: `values` (qeyri-locale sahələr) + `translations` (locale × sahə). */
export function buildFormSchema(
  config: Pick<ModuleConfig, 'ns' | 'fields' | 'locales' | 'schema'>,
): FormSchema {
  const valueShape: Record<string, ZodType> = {}
  const localeShape: Record<string, ZodType> = {}
  for (const field of config.fields) {
    if (field.perLocale) localeShape[field.name] = z.string()
    else valueShape[field.name] = valueSchema(config, field)
  }
  const translationShape: Record<string, ZodType> = {}
  for (const locale of configLocales(config)) {
    translationShape[locale] = z.object(localeShape).partial()
  }

  const requiredLocaleFields = config.fields.filter(
    (f) => f.perLocale && f.required,
  )

  const base = z
    .object({
      values: z.object(valueShape),
      translations: z.object(translationShape),
    })
    .superRefine((data, ctx) => {
      for (const field of requiredLocaleFields) {
        const filled = configLocales(config).some(
          (locale) =>
            (
              (data.translations as Record<string, Record<string, string>>)[
                locale
              ]?.[field.name] ?? ''
            ).trim() !== '',
        )
        if (!filled) {
          ctx.addIssue({
            code: 'custom',
            path: ['translations'],
            message: t('validation.requiredOneLocale', {
              field: fieldLabel(config, field),
            }),
          })
        }
      }
    }) as unknown as FormSchema

  return config.schema ? config.schema(base) : base
}

const searchValue = z
  .union([z.string(), z.number(), z.boolean()])
  .transform((v) => String(v))
  .optional()
  .catch(undefined)

/** Siyahı URL state-i: page, search, filtrlər (B3). */
export function listSearchSchema(
  config: Pick<ModuleConfig, 'filters' | 'supportsSearch' | 'searchParam'>,
) {
  const shape: Record<string, ZodType> = {
    page: z.number().int().min(1).optional().catch(undefined),
  }
  if (config.supportsSearch) shape[config.searchParam ?? 'search'] = searchValue
  for (const filter of config.filters ?? []) shape[filter.name] = searchValue
  return z.object(shape)
}

/** Create form URL state: optional prefills (`ModuleConfig.prefillFromSearch`), all as strings. */
export const newFormSearchSchema = z.record(z.string(), searchValue)

/** The prefills of a create form: only the configured fields, only non-empty values. */
export function prefillValues(
  names: readonly string[] | undefined,
  search: Record<string, unknown>,
): Record<string, string> {
  const result: Record<string, string> = {}
  for (const name of names ?? []) {
    const value = search[name]
    if ((typeof value === 'string' || typeof value === 'number') && String(value) !== '') {
      result[name] = String(value)
    }
  }
  return result
}

export type ListSearch =Record<string, string | number | undefined> & {
  page?: number
}

export const filterNames = (filters: FilterConfig[] | undefined) =>
  (filters ?? []).map((f) => f.name)
