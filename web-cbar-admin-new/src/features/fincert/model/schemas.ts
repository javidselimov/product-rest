/** FinCERT schemas (spec 053, `specs/053-fincert-page/contracts/admin-api.md`). List DTOs are flat; details carry the translations. */

import { z } from 'zod'

import {
  CONTENT_STATUS_OPTIONS,
  contentStatusSchema,
  translationsSchema,
  type ContentStatus,
  type SelectOption,
  type Translations,
} from '@/entities/content/model/types'

/** The API refuses `scheduled`: FinCERT items have no planned publication. */
const SCHEDULED: ContentStatus = 'scheduled'
export const FINCERT_STATUS_OPTIONS: SelectOption[] = CONTENT_STATUS_OPTIONS.filter((option) => option.value !== SCHEDULED)

/** A media file as the API names it (`AssetRef`); null when there is none or it is deleted. */
const assetRefSchema = z.looseObject({
  mediaId: z.number(),
  originalName: z.string().nullable(),
  mimeType: z.string().nullable(),
  sizeBytes: z.number().nullable(),
})

const localesSchema = z.array(z.string())

// ---- settings ----

export const fincertSettingsTranslationSchema = z.looseObject({
  mission: z.string().nullable(),
  portalTitle: z.string().nullable(),
  portalDescription: z.string().nullable(),
  rfcMediaId: z.number().nullable(),
  rfcUrl: z.string().nullable(),
  rfcFile: assetRefSchema.nullable(),
})

export const fincertSettingsSchema = z.looseObject({
  email: z.string().nullable(),
  phone: z.string().nullable(),
  portalUrl: z.string().nullable(),
  updatedAt: z.string().nullable(),
  translations: translationsSchema(fincertSettingsTranslationSchema),
})
export type FincertSettings = z.infer<typeof fincertSettingsSchema>

type FincertSettingsTranslation = z.infer<typeof fincertSettingsTranslationSchema>

/**
 * `PUT /fincert/settings` body: a locale left out is kept; a null field is cleared. `Pick`, not `Omit`: the `looseObject`
 * index signature makes `Omit` drop the known keys.
 */
export interface FincertSettingsUpdate extends Pick<FincertSettings, 'email' | 'phone' | 'portalUrl'> {
  translations: Translations<Pick<FincertSettingsTranslation, 'mission' | 'portalTitle' | 'portalDescription' | 'rfcMediaId' | 'rfcUrl'>>
}

// ---- directions ----

export const fincertDirectionRowSchema = z.looseObject({
  id: z.number(),
  number: z.number(),
  sortOrder: z.number(),
  status: contentStatusSchema,
  title: z.string().nullable(),
  locales: localesSchema,
  incompleteLocales: localesSchema,
  updatedAt: z.string(),
})
export type FincertDirectionRow = z.infer<typeof fincertDirectionRowSchema>

export const fincertDirectionDetailSchema = z.looseObject({
  id: z.number(),
  sortOrder: z.number(),
  status: contentStatusSchema,
  translations: translationsSchema(z.looseObject({ title: z.string(), body: z.string() })),
})

// ---- memberships ----

export const fincertMembershipRowSchema = z.looseObject({
  id: z.number(),
  sortOrder: z.number(),
  status: contentStatusSchema,
  name: z.string().nullable(),
  badge: z.string().nullable(),
  logo: assetRefSchema.nullable(),
  url: z.string().nullable(),
  locales: localesSchema,
  updatedAt: z.string(),
})
export type FincertMembershipRow = z.infer<typeof fincertMembershipRowSchema>

export const fincertMembershipDetailSchema = z.looseObject({
  id: z.number(),
  sortOrder: z.number(),
  status: contentStatusSchema,
  logoMediaId: z.number().nullable(),
  logo: assetRefSchema.nullable(),
  url: z.string().nullable(),
  translations: translationsSchema(
    z.looseObject({ name: z.string(), description: z.string().nullable(), badge: z.string().nullable() }),
  ),
})

export const pageListSchema = <T extends z.ZodTypeAny>(row: T) =>
  z.object({ items: z.array(row), total: z.number(), page: z.number(), pageSize: z.number() })
