/** `GET /api/v1/memorandums`, `specs/045-central-banks-cooperation/contracts/api.md`. */
import { z } from 'zod'

export const memorandumSchema = z.object({
  id: z.number(),
  organization: z.string(),
  country: z.string(),
  year: z.number(),
})

export const memorandumListSchema = z.object({ items: z.array(memorandumSchema) })

export type MemorandumDto = z.infer<typeof memorandumSchema>
