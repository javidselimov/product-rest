/**
 * International financial institution schemas (spec 044, `contracts/api.md`). The list DTO is flat;
 * the detail adds the translations, the membership dates and the display data of the logo.
 */

import { z } from 'zod'

import {
  CONTENT_STATUS_OPTIONS,
  translationsSchema,
  type ContentStatus,
  type SelectOption,
} from '@/entities/content/model/types'
import { attachedAssetSchema } from '@/entities/media/model/types'

/** The API refuses `scheduled`: an organization has no planned publication. */
const SCHEDULED: ContentStatus = 'scheduled'
export const IFI_STATUS_OPTIONS: SelectOption[] = CONTENT_STATUS_OPTIONS.filter(
  (option) => option.value !== SCHEDULED,
)

export const ifiOrganizationRowSchema = z.looseObject({
  id: z.number(),
  status: z.string(),
  sortOrder: z.number(),
  showAz: z.boolean(),
  showEn: z.boolean(),
  name: z.string().nullable().optional(),
  memberSince: z.number().nullable().optional(),
  membershipCount: z.number(),
})

export type IfiOrganizationRow = z.infer<typeof ifiOrganizationRowSchema>

export const ifiMembershipSchema = z.looseObject({
  id: z.number(),
  joinedOn: z.string(),
  sortOrder: z.number(),
  translations: translationsSchema(z.looseObject({ name: z.string() })),
})

export type IfiMembership = z.infer<typeof ifiMembershipSchema>

export interface IfiMembershipUpsert {
  joinedOn: string
  translations: Partial<Record<string, { name: string }>>
}

export const ifiOrganizationDetailSchema = z.looseObject({
  id: z.number(),
  logoMediaId: z.number().nullable().optional(),
  logo: attachedAssetSchema.nullable().optional(),
  websiteUrl: z.string().nullable().optional(),
  memberSince: z.number().nullable().optional(),
  sortOrder: z.number(),
  status: z.string(),
  showAz: z.boolean(),
  showEn: z.boolean(),
  translations: translationsSchema(
    z.looseObject({
      name: z.string(),
      mission: z.string().nullable().optional(),
      membershipIntro: z.string().nullable().optional(),
      content: z.string().nullable().optional(),
    }),
  ),
  memberships: z.array(ifiMembershipSchema),
})
