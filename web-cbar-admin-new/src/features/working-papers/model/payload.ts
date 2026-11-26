/**
 * Form ↔ API mapping of a working paper (spec 054, `contracts/admin-ux.md` §2). The CRUD form holds strings, so the
 * authors, keywords and JEL codes are one comma-separated line each: split into trimmed arrays without blanks or
 * repeats on the way out (JEL codes upper-cased, as the API stores them), joined with ", " on the way in. A language
 * with nothing filled is left out, so the API drops its translation.
 */

import { LOCALES } from '@/entities/content/model/types'
import type { AnyRow, FormShape, FormTranslations, FormValues } from '@/shared/crud/types'
import { LIST_JOINER, LIST_SEPARATOR } from './constants'
import { workingPaperDetailSchema } from './schemas'

/** The trimmed, non-empty, distinct items of a comma-separated line. */
export function splitList(text: string | undefined, { upper = false } = {}): string[] {
  const items = (text ?? '')
    .split(LIST_SEPARATOR)
    .map((item) => (upper ? item.trim().toUpperCase() : item.trim()))
    .filter((item) => item !== '')
  return [...new Set(items)]
}

const joinList = (items: readonly string[] | undefined) => (items ?? []).join(LIST_JOINER)

const blank = (value: string | undefined) => (value ?? '').trim() === ''

/** A form string as the API's value: the schema has already checked numbers and required fields. */
const text = (value: string | boolean | undefined) => (typeof value === 'string' ? value.trim() : '')
const optionalId = (value: string | undefined) => (blank(value) ? null : Number(value))

/** The per-locale fields; a language is sent when any of them is filled. */
const LOCALE_FIELD_NAMES = ['title', 'authors', 'abstract', 'keywords', 'mediaId'] as const

/**
 * Whether a language is started: any of its fields filled. The form's validation and the payload both use it, so a
 * language the form checks is never one the payload leaves out.
 */
export const isLocaleStarted = (tr: Readonly<Record<string, string | undefined>>) =>
  LOCALE_FIELD_NAMES.some((name) => !blank(tr[name]))

export function buildWorkingPaperPayload(values: FormValues, translations: FormTranslations, detail: AnyRow | null) {
  const localeEntries = LOCALES.flatMap((locale) => {
    const tr = translations[locale] ?? {}
    if (!isLocaleStarted(tr)) return []
    const abstract = (tr.abstract ?? '').trim()
    return [
      [
        locale,
        {
          title: (tr.title ?? '').trim(),
          authors: splitList(tr.authors),
          abstract: abstract === '' ? null : abstract,
          keywords: splitList(tr.keywords),
          mediaId: optionalId(tr.mediaId),
        },
      ],
    ] as const
  })

  return {
    number: Number(text(values.number)),
    year: Number(text(values.year)),
    paperLanguage: text(values.paperLanguage),
    jelCodes: splitList(text(values.jelCodes), { upper: true }),
    // Not a form field: the migration seed sets it and old addresses redirect by it, so a save keeps it.
    ...(detail?.legacyPageId ? { legacyPageId: detail.legacyPageId } : {}),
    status: text(values.status),
    translations: Object.fromEntries(localeEntries),
  }
}

export function parseWorkingPaperDetail(raw: AnyRow): FormShape {
  const detail = workingPaperDetailSchema.parse(raw)
  const translations: FormTranslations = {}
  for (const locale of LOCALES) {
    const tr = detail.translations[locale]
    translations[locale] = {
      title: tr?.title ?? '',
      authors: joinList(tr?.authors),
      abstract: tr?.abstract ?? '',
      keywords: joinList(tr?.keywords),
      mediaId: tr?.mediaId === null || tr?.mediaId === undefined ? '' : String(tr.mediaId),
    }
  }
  return {
    values: {
      number: String(detail.number),
      year: String(detail.year),
      paperLanguage: detail.paperLanguage,
      jelCodes: joinList(detail.jelCodes),
      status: detail.status,
    },
    translations,
  }
}
