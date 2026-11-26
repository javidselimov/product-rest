/**
 * CMS səhifəsi (spec 002 data-model.md §2).
 */
import { z } from 'zod'

import { pageAssetSchema } from '@/entities/content'
import { pageNodeSchema, pageTreeSchema, type PageNode } from '@/entities/page-node'

export const pageDetailSchema = z
  .object({
    id: z.number(),
    title: z.string(),
    slug: z.string(),
    content: z.string().nullable(),
    assets: z.array(pageAssetSchema).optional(),
  })
  .passthrough()

export type PageDetail = z.infer<typeof pageDetailSchema>

export { pageNodeSchema, pageTreeSchema, type PageNode }
