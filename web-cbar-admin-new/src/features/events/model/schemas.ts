/**
 * Event schemas (spec 034, contracts/admin-api.md; B13). The list DTO is flat; the detail adds
 * `translations` and `{ id, title }` of each linked item, which keeps a choice readable when it
 * falls outside the loaded lookup page.
 */

import { z } from 'zod'

import type { ColorPalette } from '@cbar/lib-react-ui-kit/lib'

import {
  CONTENT_STATUS_OPTIONS,
  translationsSchema,
  type ContentStatus,
  type SelectOption,
} from '@/entities/content/model/types'
import { EVENT_TYPE } from './constants'

const DECISION = String(EVENT_TYPE.DECISION)
const PRESS_CONFERENCE = String(EVENT_TYPE.PRESS_CONFERENCE)
const CONFERENCE = String(EVENT_TYPE.CONFERENCE)
const SEMINAR = String(EVENT_TYPE.SEMINAR)

export const EVENT_TYPE_OPTIONS: SelectOption[] = [
  { value: DECISION, labelKey: `events:types.${DECISION}` },
  { value: PRESS_CONFERENCE, labelKey: `events:types.${PRESS_CONFERENCE}` },
  { value: CONFERENCE, labelKey: `events:types.${CONFERENCE}` },
  { value: SEMINAR, labelKey: `events:types.${SEMINAR}` },
]

export const EVENT_TYPE_LABEL_KEYS: Record<string, string> = {
  [DECISION]: `events:types.${DECISION}`,
  [PRESS_CONFERENCE]: `events:types.${PRESS_CONFERENCE}`,
  [CONFERENCE]: `events:types.${CONFERENCE}`,
  [SEMINAR]: `events:types.${SEMINAR}`,
}

export const EVENT_TYPE_PALETTE: Record<string, ColorPalette> = {
  [DECISION]: 'primary',
  [PRESS_CONFERENCE]: 'secondary',
  [CONFERENCE]: 'tertiary',
  [SEMINAR]: 'black',
}

/** The API refuses `scheduled`: an event has no planned publication. */
const SCHEDULED: ContentStatus = 'scheduled'
export const EVENT_STATUS_OPTIONS: SelectOption[] =
  CONTENT_STATUS_OPTIONS.filter((option) => option.value !== SCHEDULED)

export const eventRowSchema = z.looseObject({
  id: z.number(),
  type: z.number().int().nullable().optional(),
  status: z.string(),
  startsOn: z.string(),
  endsOn: z.string().nullable().optional(),
  title: z.string().nullable().optional(),
  categoryName: z.string().nullable().optional(),
})

export type EventRow = z.infer<typeof eventRowSchema>

const linkSchema = z
  .object({ id: z.number(), title: z.string().nullable() })
  .nullable()
  .optional()

export const eventDetailSchema = z.looseObject({
  id: z.number(),
  type: z.number().int().nullable().optional(),
  categoryId: z.number().nullable().optional(),
  status: z.string(),
  startsOn: z.string(),
  endsOn: z.string().nullable().optional(),
  startTime: z.string().nullable().optional(),
  galleryId: z.number().nullable().optional(),
  pressReleaseId: z.number().nullable().optional(),
  pageId: z.number().nullable().optional(),
  category: linkSchema,
  gallery: linkSchema,
  pressRelease: linkSchema,
  page: linkSchema,
  translations: translationsSchema(
    z.looseObject({
      title: z.string(),
      slug: z.string().nullable().optional(),
      location: z.string().nullable().optional(),
      content: z.string().nullable().optional(),
    }),
  ),
})

export const eventCategoryRowSchema = z.looseObject({
  id: z.number(),
  sortOrder: z.number(),
  isActive: z.boolean(),
  name: z.string().nullable().optional(),
  translations: translationsSchema(z.looseObject({ name: z.string() })),
})

export type EventCategoryRow = z.infer<typeof eventCategoryRowSchema>

export const eventCategoryDetailSchema = z.looseObject({
  id: z.number(),
  sortOrder: z.number(),
  isActive: z.boolean(),
  translations: translationsSchema(z.looseObject({ name: z.string() })),
})
