/**
 * Ortaq oxunan modellər (spec 002 data-model.md §1).
 *
 * Hər sxem `.passthrough()` ilədir: backend əlavə sahə göndərəndə sayt qırılmır
 * (research R3). Tiplər `z.infer` ilə çıxarılır — əl ilə interfeys yazılmır.
 */
import { z } from 'zod'

export const localeSchema = z.enum(['az', 'en'])

/** Siyahı envelope-u — `{ items, total, page, pageSize }`; `totalPages` yoxdur. */
export function listEnvelope<T extends z.ZodTypeAny>(item: T) {
  return z
    .object({
      items: z.array(item),
      total: z.number(),
      page: z.number(),
      pageSize: z.number(),
    })
    .passthrough()
}

export type ListEnvelope<T> = {
  items: T[]
  total: number
  page: number
  pageSize: number
}

/** Press reliz və qanun əlavəsi. */
export const mediaAssetSchema = z
  .object({
    mediaId: z.number(),
    originalName: z.string(),
    mimeType: z.string(),
    sizeBytes: z.number(),
    url: z.string(),
  })
  .passthrough()

export type MediaAsset = z.infer<typeof mediaAssetSchema>

/** CMS səhifə əlavəsi — `group` qruplaşdırma açarıdır. */
export const pageAssetSchema = z
  .object({
    mediaId: z.number(),
    title: z.string(),
    mimeType: z.string(),
    sizeBytes: z.number(),
    group: z.string().nullable(),
    url: z.string(),
  })
  .passthrough()

export type PageAsset = z.infer<typeof pageAssetSchema>

/** Ümumi fayl forması — `Attachments` widget-i hər iki tipi buna çevirir. */
export type AttachmentFile = {
  id: number
  title: string
  mimeType: string
  sizeBytes: number
  group: string | null
  url: string
}

/** Səhifələmə üçün ümumi say → səhifə sayı; heç vaxt 0 vermir. */
export function totalPages(total: number, pageSize: number): number {
  if (pageSize <= 0) return 1
  return Math.max(Math.ceil(total / pageSize), 1)
}
