/** `GET /api/v1/csr-projects`, `specs/038-media-csr/contracts/api.md`. */
import { z } from 'zod'

export const csrProjectSchema = z.object({
  id: z.number(),
  category: z.string().nullable(),
  cardTitle: z.string(),
  summary: z.string(),
  title: z.string(),
  content: z.string().nullable(),
  cover: z.string().nullable(),
  images: z.array(z.object({ mediaId: z.number(), url: z.string() })),
})

export const csrProjectListSchema = z.object({ items: z.array(csrProjectSchema) })

export type CsrProjectDto = z.infer<typeof csrProjectSchema>
