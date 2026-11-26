/**
 * Events (spec 034, contracts/public-api.md). `upcoming` comes from the API, which knows the Baku
 * day, so the site does not repeat that rule. `pageSlug` is set when a legacy event opens its
 * CMS page.
 */
import { z } from 'zod'

import { listEnvelope } from '@/entities/content'

import { EVENT_TYPES } from './constants'

const nullableString = z.string().nullable().optional().transform((v) => v ?? null)

export { EVENT_TYPES }
export type EventType = (typeof EVENT_TYPES)[number]

const isEventType = (value: number | null | undefined): value is EventType => (EVENT_TYPES as readonly unknown[]).includes(value)
const toEventType = (value: number | null | undefined) => (isEventType(value) ? value : null)

export const eventCategorySchema = z.object({ id: z.number(), name: z.string() }).passthrough()

export const eventListItemSchema = z
  .object({
    id: z.number(),
    title: z.string(),
    slug: z.string(),
    type: z.number().nullable().optional().transform(toEventType),
    category: eventCategorySchema.nullable().optional().transform((v) => v ?? null),
    startsOn: z.string(),
    endsOn: nullableString,
    startTime: nullableString,
    location: nullableString,
    upcoming: z.boolean(),
    pageSlug: nullableString,
  })
  .passthrough()

export const eventListSchema = listEnvelope(eventListItemSchema)

export const eventDetailSchema = eventListItemSchema
  .extend({
    content: nullableString,
    gallery: z
      .object({
        title: nullableString,
        images: z.array(z.object({ mediaId: z.number(), url: z.string() }).passthrough()),
      })
      .passthrough()
      .nullable()
      .optional()
      .transform((v) => v ?? null),
    pressRelease: z
      .object({ title: z.string(), slug: z.string() })
      .passthrough()
      .nullable()
      .optional()
      .transform((v) => v ?? null),
  })
  .passthrough()

export const eventCategoryListSchema = z.object({ items: z.array(eventCategorySchema) }).passthrough()

export type EventListItem = z.infer<typeof eventListItemSchema>
export type EventList = z.infer<typeof eventListSchema>
export type EventDetail = z.infer<typeof eventDetailSchema>
export type EventCategory = z.infer<typeof eventCategorySchema>
