/**
 * The FinCERT general form (spec 053, `contracts/admin-ux.md` §2.1) as a pure model: the field list, the form state from
 * the stored record, the validation and the `PUT` body. The form uses the CRUD form shape (`values` + `translations`),
 * so it renders with the engine's `FieldControl` and server field errors (`email`, `translations.az.rfcUrl`) land on the
 * field of the same path.
 */

import { z } from 'zod'

import { LOCALES } from '@/entities/content/model/types'
import type { FieldConfig, FormShape } from '@/shared/crud/types'
import { FINCERT_LIMITS } from './constants'
import type { FincertSettings, FincertSettingsUpdate } from './schemas'
import { isEmail, isWebUrl, message } from './validation'

/** Fields that do not depend on the language, by card. */
export const CONTACT_FIELDS: FieldConfig[] = [
  { name: 'email', labelKey: 'fields.email', type: 'text' },
  { name: 'phone', labelKey: 'fields.phone', type: 'text', helpKey: 'fields.phoneHelp' },
]
export const PORTAL_FIELDS: FieldConfig[] = [
  { name: 'portalUrl', labelKey: 'fields.portalUrl', type: 'text', helpKey: 'fields.portalUrlHelp' },
]

/** Fields of each language tab, in the order of the site's sections. */
export const LOCALE_FIELDS: FieldConfig[] = [
  { name: 'mission', labelKey: 'fields.mission', type: 'textarea', perLocale: true, helpKey: 'fields.missionHelp' },
  { name: 'portalTitle', labelKey: 'fields.portalTitle', type: 'text', perLocale: true },
  { name: 'portalDescription', labelKey: 'fields.portalDescription', type: 'textarea', perLocale: true },
  { name: 'rfcMediaId', labelKey: 'fields.rfcMediaId', type: 'media', perLocale: true, mediaAccept: 'document' },
  { name: 'rfcUrl', labelKey: 'fields.rfcUrl', type: 'text', perLocale: true, helpKey: 'fields.rfcUrlHelp' },
]

const text = (value: string | null | undefined) => value ?? ''

export function settingsToForm(settings: FincertSettings): FormShape {
  return {
    values: { email: text(settings.email), phone: text(settings.phone), portalUrl: text(settings.portalUrl) },
    translations: Object.fromEntries(
      LOCALES.map((locale) => {
        const tr = settings.translations[locale]
        return [
          locale,
          {
            mission: text(tr?.mission),
            portalTitle: text(tr?.portalTitle),
            portalDescription: text(tr?.portalDescription),
            rfcMediaId: tr?.rfcMediaId ? String(tr.rfcMediaId) : '',
            rfcUrl: text(tr?.rfcUrl),
          },
        ]
      }),
    ),
  }
}

const blank = (value: unknown) => {
  const trimmed = String(value ?? '').trim()
  return trimmed === '' ? null : trimmed
}

/** Every language is sent: the form shows both, and a cleared field must reach the API as `null`. */
export function formToBody(form: FormShape): FincertSettingsUpdate {
  return {
    email: blank(form.values.email),
    phone: blank(form.values.phone),
    portalUrl: blank(form.values.portalUrl),
    translations: Object.fromEntries(
      LOCALES.map((locale) => {
        const tr = form.translations[locale] ?? {}
        const mediaId = blank(tr.rfcMediaId)
        return [
          locale,
          {
            mission: blank(tr.mission),
            portalTitle: blank(tr.portalTitle),
            portalDescription: blank(tr.portalDescription),
            rfcMediaId: mediaId === null ? null : Number(mediaId),
            rfcUrl: blank(tr.rfcUrl),
          },
        ]
      }),
    ),
  }
}

/** The API's rules (`FincertSettingsController`), checked before the request so the editor sees them at once. */
export const settingsFormSchema = z
  .object({
    values: z.record(z.string(), z.union([z.string(), z.boolean()])),
    translations: z.record(z.string(), z.record(z.string(), z.string())),
  })
  .superRefine((data, ctx) => {
    const value = (name: string) => String(data.values[name] ?? '').trim()
    const tooLong = (path: (string | number)[], text: string, max: number) => {
      if (text.length > max) ctx.addIssue({ code: 'custom', path, message: message('tooLong', { max }) })
    }

    const email = value('email')
    if (email && !isEmail(email)) ctx.addIssue({ code: 'custom', path: ['values', 'email'], message: message('email') })
    tooLong(['values', 'email'], email, FINCERT_LIMITS.EMAIL)
    tooLong(['values', 'phone'], value('phone'), FINCERT_LIMITS.PHONE)

    const portalUrl = value('portalUrl')
    if (portalUrl && !isWebUrl(portalUrl)) ctx.addIssue({ code: 'custom', path: ['values', 'portalUrl'], message: message('url') })
    tooLong(['values', 'portalUrl'], portalUrl, FINCERT_LIMITS.URL)

    for (const locale of LOCALES) {
      const tr = data.translations[locale] ?? {}
      const field = (name: string) => (tr[name] ?? '').trim()
      const rfcUrl = field('rfcUrl')
      if (rfcUrl && !isWebUrl(rfcUrl)) ctx.addIssue({ code: 'custom', path: ['translations', locale, 'rfcUrl'], message: message('url') })
      tooLong(['translations', locale, 'rfcUrl'], rfcUrl, FINCERT_LIMITS.URL)
      tooLong(['translations', locale, 'portalTitle'], field('portalTitle'), FINCERT_LIMITS.PORTAL_TITLE)
      tooLong(['translations', locale, 'portalDescription'], field('portalDescription'), FINCERT_LIMITS.DESCRIPTION)
      // A portal card needs an address (the site shows the portal only with both).
      if (field('portalTitle') && !portalUrl)
        ctx.addIssue({ code: 'custom', path: ['values', 'portalUrl'], message: message('portalUrlRequired') })
    }
  })

type FormPath = `values.${string}` | `translations.${string}.${string}`

const hasField = (fields: FieldConfig[], name: string | undefined) => fields.some((field) => field.name === name)

/**
 * The form path of a server field error: `email` → `values.email`, `translations.az.rfcUrl` stays as it is. A key with no
 * field in this form (`translations`, `translations.az.rfcFile`) is `null`: its message belongs in the banner.
 */
export function formPathOf(apiField: string): FormPath | null {
  if (hasField([...CONTACT_FIELDS, ...PORTAL_FIELDS], apiField)) return `values.${apiField}`
  const [root, locale, name, ...rest] = apiField.split('.')
  const known =
    root === 'translations' && rest.length === 0 && (LOCALES as readonly string[]).includes(locale) && hasField(LOCALE_FIELDS, name)
  return known ? `translations.${locale}.${name}` : null
}
