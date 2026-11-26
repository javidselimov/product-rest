/**
 * Release schedule schemas (spec 039, `contracts/admin-api.md`). The item list is flat with az-first
 * names; the lookups carry their translations so the item form can offer them as choices.
 */

import { z } from 'zod'

import type { ColorPalette } from '@cbar/lib-react-ui-kit/lib'

import {
  CONTENT_STATUS_OPTIONS,
  translationsSchema,
  type ContentStatus,
  type SelectOption,
} from '@/entities/content/model/types'
import { TIMING_MODE, TIMING_MODES } from './constants'

/** The API refuses `scheduled`: a schedule item has no planned publication. */
const SCHEDULED: ContentStatus = 'scheduled'
export const RELEASE_SCHEDULE_STATUS_OPTIONS: SelectOption[] = CONTENT_STATUS_OPTIONS.filter(
  (option) => option.value !== SCHEDULED,
)

export const TIMING_MODE_OPTIONS: SelectOption[] = TIMING_MODES.map((mode) => ({
  value: mode,
  labelKey: `releaseSchedule:timingModes.${mode}`,
}))

export const TIMING_MODE_PALETTE: Record<string, ColorPalette> = {
  [TIMING_MODE.TEXT]: 'black',
  [TIMING_MODE.LINK]: 'secondary',
  [TIMING_MODE.DECISIONS]: 'green',
}

export const TIMING_MODE_LABEL_KEYS: Record<string, string> = Object.fromEntries(
  TIMING_MODES.map((mode) => [mode, `releaseSchedule:timingModes.${mode}`]),
)

const timingModeSchema = z.enum(TIMING_MODES)

export const releaseScheduleItemRowSchema = z.looseObject({
  id: z.number(),
  title: z.string().nullable().optional(),
  group: z.string().nullable().optional(),
  periodicity: z.string().nullable().optional(),
  timingMode: timingModeSchema,
  sortOrder: z.number(),
  status: z.string(),
  showAz: z.boolean(),
  showEn: z.boolean(),
})

export type ReleaseScheduleItemRow = z.infer<typeof releaseScheduleItemRowSchema>

export const releaseScheduleItemDetailSchema = z.looseObject({
  id: z.number(),
  groupId: z.number(),
  periodicityId: z.number().nullable(),
  timingMode: timingModeSchema,
  timingUrl: z.string().nullable(),
  sortOrder: z.number(),
  status: z.string(),
  showAz: z.boolean(),
  showEn: z.boolean(),
  translations: translationsSchema(
    z.looseObject({ title: z.string(), timing: z.string().nullable().optional() }),
  ),
})

const nameTranslationsSchema = translationsSchema(z.looseObject({ name: z.string() }))

export const releaseScheduleGroupRowSchema = z.looseObject({
  id: z.number(),
  sortOrder: z.number(),
  isActive: z.boolean(),
  name: z.string().nullable().optional(),
  translations: nameTranslationsSchema,
})

export type ReleaseScheduleGroupRow = z.infer<typeof releaseScheduleGroupRowSchema>

export const releaseScheduleGroupDetailSchema = z.looseObject({
  id: z.number(),
  sortOrder: z.number(),
  isActive: z.boolean(),
  translations: nameTranslationsSchema,
})

export const releaseSchedulePeriodicityRowSchema = z.looseObject({
  id: z.number(),
  sortOrder: z.number(),
  name: z.string().nullable().optional(),
  translations: nameTranslationsSchema,
})

export type ReleaseSchedulePeriodicityRow = z.infer<typeof releaseSchedulePeriodicityRowSchema>

export const releaseSchedulePeriodicityDetailSchema = z.looseObject({
  id: z.number(),
  sortOrder: z.number(),
  translations: nameTranslationsSchema,
})
