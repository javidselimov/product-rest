/**
 * Organisational chart (spec 027, spec 060) — `GET/POST /organization/chart`,
 * `PUT/DELETE /organization/chart/{id}`, `PUT /organization/chart/order`
 * (api-cbar-admin openapi `OrgChartNode`). The list is flat; the tree comes from `parentId`, and the
 * public desktop chart is laid out from that tree, so the deprecated `layout` / `connector` fields are
 * not read. `linked` holds the linked staff member's / division's texts — what the public card shows
 * where no override is set.
 */

import { z } from 'zod'

import { translationsSchema } from '@/entities/content/model/types'
import { ORG_CHART_KINDS } from './constants'

export { ORG_CHART_KINDS }

export const orgChartNodeSchema = z.looseObject({
  id: z.number(),
  parentId: z.number().nullable(),
  kind: z.number(),
  staffId: z.number().nullable(),
  divisionId: z.number().nullable(),
  curatorDirect: z.boolean(),
  sortOrder: z.number(),
  isActive: z.boolean(),
  /** An older API without the field reads as the dropdown. */
  departmentsOpen: z.boolean().default(false),
  translations: translationsSchema(
    z.looseObject({
      title: z.string().nullable(),
      subtitle: z.string().nullable(),
    }),
  ),
  linked: translationsSchema(
    z.looseObject({ name: z.string(), role: z.string().nullable() }),
  ),
})

export const orgChartListSchema = z.array(orgChartNodeSchema)

export type OrgChartNode = z.infer<typeof orgChartNodeSchema>

export interface OrgChartTranslationInput {
  title: string | null
  subtitle: string | null
}

export interface OrgChartNodeUpsert {
  parentId: number | null
  kind: number
  staffId: number | null
  divisionId: number | null
  curatorDirect: boolean
  sortOrder: number
  isActive: boolean
  translations: Partial<Record<'az' | 'en', OrgChartTranslationInput>>
  /** Block or group only; the form always sends it (false for the other kinds). */
  departmentsOpen: boolean
}
