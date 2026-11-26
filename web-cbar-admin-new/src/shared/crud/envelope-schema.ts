/**
 * Siyahı envelope-larının Zod sxemləri (contracts/admin-api.md §2, B13):
 *   paged → { items, total, page, pageSize }   items → { items }   array → T[]
 * Sətir sxemi `passthrough` ilə yazılır — backend əlavə sahə göndərəndə panel qırılmır.
 */

import { z, type ZodType } from 'zod'

import type { AnyRow, ListEnvelope } from './types'

export const DEFAULT_ROW_SCHEMA: ZodType<AnyRow> = z.record(
  z.string(),
  z.unknown(),
)

export const DEFAULT_LOOKUP_SCHEMA: ZodType<AnyRow> = z.looseObject({
  id: z.union([z.number(), z.string()]),
  translations: z
    .record(z.string(), z.record(z.string(), z.unknown()))
    .optional(),
})

export interface ListResult<Row> {
  items: Row[]
  /** Yalnız `paged` envelope-da. */
  total?: number
}

export function listEnvelopeSchema<Row>(
  envelope: ListEnvelope,
  row: ZodType<Row>,
): ZodType<ListResult<Row>> {
  switch (envelope) {
    case 'paged':
      return z
        .looseObject({
          items: z.array(row),
          total: z.number(),
          page: z.number().optional(),
          pageSize: z.number().optional(),
        })
        .transform((v) => ({ items: v.items, total: v.total }))
    case 'items':
      return z
        .looseObject({ items: z.array(row) })
        .transform((v) => ({ items: v.items }))
    case 'array':
      return z.array(row).transform((items) => ({ items }))
  }
}
