/** `GET /api/v1/release-schedule`, `specs/039-media-release-schedule/contracts/public-api.md`. */
import { z } from 'zod'

import { TIMING_MODE } from './constants'

export const releaseScheduleItemSchema = z.object({
  id: z.number(),
  title: z.string(),
  periodicity: z.string().nullable(),
  timing: z.string().nullable(),
  timingMode: z.enum([TIMING_MODE.TEXT, TIMING_MODE.LINK, TIMING_MODE.DECISIONS]),
  timingUrl: z.string().nullable(),
})

export const releaseScheduleGroupSchema = z.object({
  id: z.number(),
  name: z.string(),
  items: z.array(releaseScheduleItemSchema),
})

export const decisionDateSchema = z.object({
  date: z.iso.date(),
  withPressConference: z.boolean(),
})

export const releaseScheduleSchema = z.object({
  groups: z.array(releaseScheduleGroupSchema),
  decisions: z.object({
    year: z.number(),
    dates: z.array(decisionDateSchema),
    next: decisionDateSchema.nullable(),
  }),
})

export type ReleaseScheduleItem = z.infer<typeof releaseScheduleItemSchema>
export type ReleaseScheduleGroup = z.infer<typeof releaseScheduleGroupSchema>
export type DecisionDate = z.infer<typeof decisionDateSchema>
export type ReleaseSchedule = z.infer<typeof releaseScheduleSchema>
export type ReleaseScheduleDecisions = ReleaseSchedule['decisions']
