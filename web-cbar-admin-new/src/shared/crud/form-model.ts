/**
 * Form dəyər modeli (data-model.md §7, B5/B6): input-lar string, checkbox
 * boolean; payload-da tip çevrilməsi `coerceFieldValue` cədvəli ilə; boş
 * locale tərcüməsi göndərilmir (research R5).
 */

import { ISO_DATE_LENGTH } from '@/shared/constants/limits'
import { isoToLocalInput, localInputToIso } from './date-io'
import { configLocales } from './path'
import type {
  AnyRow,
  FieldConfig,
  FormShape,
  FormTranslations,
  FormValues,
  Locale,
  ModuleConfig,
} from './types'

type FormConfig = Pick<ModuleConfig, 'fields' | 'locales' | 'translationsKey'>

/** Bir sahənin form dəyərini payload təqdimatına çevirir. */
export function coerceFieldValue(
  field: FieldConfig,
  value: string | boolean | undefined,
): unknown {
  if (field.type === 'checkbox') return value === true
  const str = typeof value === 'string' ? value : ''
  switch (field.type) {
    case 'number': {
      if (str.trim() === '') return field.nullable === false ? 0 : null
      const n = Number(str)
      return Number.isNaN(n) ? null : n
    }
    case 'date':
    case 'time':
      return str === '' ? null : str
    case 'datetime':
      return localInputToIso(str)
    case 'select':
      if (str === '' && field.nullable) return null
      if (str === '') return field.valueAsNumber ? null : ''
      return field.valueAsNumber ? Number(str) : str
    case 'media':
      return str === '' ? null : Number(str)
    default:
      return str
  }
}

/** Yaratma formu üçün ilkin state. */
export function initialFormState(config: {
  fields: FieldConfig[]
  locales?: readonly Locale[]
}): FormShape {
  const values: FormValues = {}
  const translations: FormTranslations = {}
  for (const locale of configLocales(config)) translations[locale] = {}
  for (const field of config.fields) {
    if (field.perLocale) {
      for (const locale of configLocales(config)) {
        translations[locale][field.name] =
          typeof field.defaultValue === 'string' ? field.defaultValue : ''
      }
    } else if (field.type === 'checkbox') {
      values[field.name] = field.defaultValue === true
    } else {
      values[field.name] =
        typeof field.defaultValue === 'string'
          ? field.defaultValue
          : field.type === 'select' && field.options?.length && !field.nullable
            ? String(field.options[0].value)
            : ''
    }
  }
  return { values, translations }
}

/** Detail DTO → form state (default). */
export function defaultParseDetail(
  config: FormConfig,
  detail: AnyRow,
): FormShape {
  const values: FormValues = {}
  const translations: FormTranslations = {}
  const detailTranslations =
    (detail[config.translationsKey ?? 'translations'] as
      Record<string, AnyRow> | undefined) ?? {}
  for (const locale of configLocales(config)) translations[locale] = {}

  for (const field of config.fields) {
    if (field.perLocale) {
      for (const locale of configLocales(config)) {
        const raw = detailTranslations[locale]?.[field.name]
        translations[locale][field.name] =
          raw === null || raw === undefined ? '' : String(raw)
      }
      continue
    }
    const raw = detail[field.name]
    if (field.type === 'checkbox') {
      values[field.name] = raw === true
    } else if (field.type === 'datetime') {
      values[field.name] = isoToLocalInput(typeof raw === 'string' ? raw : null)
    } else if (field.type === 'date' && typeof raw === 'string') {
      values[field.name] = raw.slice(0, ISO_DATE_LENGTH)
    } else {
      values[field.name] = raw === null || raw === undefined ? '' : String(raw)
    }
  }
  return { values, translations }
}

/**
 * Default payload: qeyri-locale sahələr kökdə (coerce edilmiş) + yalnız hər
 * hansı sahəsi dolu olan locale-ləri saxlayan `translations` obyekti.
 */
export function defaultBuildPayload(
  config: FormConfig,
  values: FormValues,
  translations: FormTranslations,
): AnyRow {
  const payload: AnyRow = {}
  const perLocaleFields = config.fields.filter((f) => f.perLocale)
  for (const field of config.fields) {
    if (field.perLocale) continue
    payload[field.name] = coerceFieldValue(field, values[field.name])
  }
  if (perLocaleFields.length > 0) {
    const result: Record<string, AnyRow> = {}
    for (const locale of configLocales(config)) {
      const localeValues = translations[locale] ?? {}
      const hasContent = perLocaleFields.some(
        (f) => (localeValues[f.name] ?? '').trim() !== '',
      )
      if (!hasContent) continue
      const obj: AnyRow = {}
      for (const field of perLocaleFields) {
        obj[field.name] = coerceFieldValue(field, localeValues[field.name])
      }
      result[locale] = obj
    }
    payload[config.translationsKey ?? 'translations'] = result
  }
  return payload
}

/** A form field path: a general field or a field of one language tab. */
export type FormFieldPath = `values.${string}` | `translations.${string}.${string}`

/**
 * The form path of a server field error (`problem+json` `errors` key): `number` → `values.number`,
 * `translations.en.authors` stays as it is when that language and per-locale field exist. A key the form has no field
 * for (`translations`, `legacyPageId`) is `null`: its message belongs in the banner.
 */
export function serverErrorPath(
  config: FormConfig,
  key: string,
): FormFieldPath | null {
  const general = config.fields.find((f) => f.name === key && !f.perLocale)
  if (general) return `values.${key}`
  const [root, locale, name, ...rest] = key.split('.')
  const known =
    root === (config.translationsKey ?? 'translations') &&
    rest.length === 0 &&
    (configLocales(config) as readonly string[]).includes(locale ?? '') &&
    config.fields.some((f) => f.perLocale && f.name === name)
  return known ? `translations.${locale}.${name}` : null
}
