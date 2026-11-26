/**
 * Press release schemas (contracts/admin-api.md §3, §6 `/press-releases`; B13; spec 029).
 * The list DTO is flat (`title`: az, else the first available); the detail carries
 * `translations` (`title, slug?, content?`) and `assets[]`. `type`: 1 news, 2 announcement,
 * 3 interview or speech.
 */

import { z } from 'zod'

import type { ColorPalette } from '@cbar/lib-react-ui-kit/lib'

import { translationsSchema } from '@/entities/content/model/types'
import type { SelectOption } from '@/entities/content/model/types'
import { attachedAssetSchema } from '@/entities/media/model/types'
import { PRESS_RELEASE_TYPE } from './constants'

const NEWS = String(PRESS_RELEASE_TYPE.NEWS)
const ANNOUNCEMENT = String(PRESS_RELEASE_TYPE.ANNOUNCEMENT)
const INTERVIEW = String(PRESS_RELEASE_TYPE.INTERVIEW)

export const PRESS_RELEASE_TYPE_OPTIONS: SelectOption[] = [
  { value: NEWS, labelKey: `pressReleases:types.${NEWS}` },
  { value: ANNOUNCEMENT, labelKey: `pressReleases:types.${ANNOUNCEMENT}` },
  { value: INTERVIEW, labelKey: `pressReleases:types.${INTERVIEW}` },
]

export const PRESS_RELEASE_TYPE_LABEL_KEYS: Record<string, string> = {
  [NEWS]: `pressReleases:types.${NEWS}`,
  [ANNOUNCEMENT]: `pressReleases:types.${ANNOUNCEMENT}`,
  [INTERVIEW]: `pressReleases:types.${INTERVIEW}`,
}

export const PRESS_RELEASE_TYPE_PALETTE: Record<string, ColorPalette> = {
  [NEWS]: 'primary',
  [ANNOUNCEMENT]: 'secondary',
  [INTERVIEW]: 'tertiary',
}

export const pressReleaseRowSchema = z.looseObject({
  id: z.number(),
  type: z.number().int(),
  title: z.string().nullable().optional(),
  status: z.string(),
  publishedAt: z.string().nullable().optional(),
  updatedAt: z.string().nullable().optional(),
})

export type PressReleaseRow = z.infer<typeof pressReleaseRowSchema>

export const pressReleaseDetailSchema = z.looseObject({
  id: z.number(),
  type: z.number().int(),
  status: z.string(),
  publishedAt: z.string().nullable().optional(),
  translations: translationsSchema(
    z.looseObject({
      title: z.string(),
      slug: z.string().nullable().optional(),
      content: z.string().nullable().optional(),
    }),
  ),
  assets: z.array(attachedAssetSchema).default([]),
})

export type PressReleaseDetail = z.infer<typeof pressReleaseDetailSchema>
