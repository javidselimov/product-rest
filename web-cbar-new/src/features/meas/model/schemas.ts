/**
 * MEAS — qiymətli kağızlar açıqlamaları (spec 002 data-model.md §5).
 */
import { z } from 'zod'

import { listEnvelope } from '@/entities/content'

const nullableString = z.string().nullable().optional().transform((v) => v ?? null)

export const measItemSchema = z
  .object({
    id: z.number(),
    regDate: z.string(),
    dqn: z.string(),
    emitentName: nullableString,
    infoTypeName: nullableString,
    fileUrl: nullableString,
  })
  .passthrough()

export const measListSchema = listEnvelope(measItemSchema)
export const measRefSchema = z.object({ id: z.number(), name: nullableString }).passthrough()

export type MeasItem = z.infer<typeof measItemSchema>
export type MeasList = z.infer<typeof measListSchema>
export type MeasRef = z.infer<typeof measRefSchema>
