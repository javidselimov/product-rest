/**
 * Media domain-i (data-model.md §4, contracts/admin-api.md §5). API `url` vermir —
 * şəkil önizləməsi tokenlə `GET /media/{id}/preview`-dan blob kimi alınır (spec 010,
 * `features/media/components/media-preview.tsx`); qalanlar mime ikonudur. Redaktora daxil edilən
 * ünvanlar mühitdən asılı olmayan `/media/{id}` formasındadır (spec FR-024).
 */

import {
  ColumnsIcon,
  DocumentIcon,
  FileIcon,
  FolderIcon,
  ImageIcon,
} from '@cbar/lib-react-ui-kit/icons'
import { z } from 'zod'

import { BYTES_PER_KB } from '@/shared/constants/files'

export const mediaItemSchema = z.looseObject({
  id: z.number(),
  originalName: z.string(),
  mimeType: z.string().nullable().default(''),
  sizeBytes: z.number().nullable().default(0),
  width: z.number().nullable().optional(),
  height: z.number().nullable().optional(),
  createdAt: z.string().optional(),
})

export type MediaItem = z.infer<typeof mediaItemSchema>

export interface AttachedAsset {
  mediaId: number
  originalName?: string | null
  mimeType?: string | null
  sizeBytes?: number | null
  /** Press releases (spec 033): the file's language, null for both. */
  locale?: string | null
}

/** Select value for "both languages": the kit Select takes no empty value. */
export const ASSET_LOCALE_ALL = 'all'

export const attachedAssetSchema = z.looseObject({
  mediaId: z.number(),
  originalName: z.string().nullable().optional(),
  mimeType: z.string().nullable().optional(),
  sizeBytes: z.number().nullable().optional(),
  locale: z.string().nullable().optional(),
})

/** The legacy panel's allowed list (the API also accepts `.rar`). */
export const ACCEPTED_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.webp',
  '.svg',
  '.pdf',
  '.xlsx',
  '.xls',
  '.docx',
  '.doc',
  '.zip',
  '.xml',
] as const

export const ACCEPT_ATTRIBUTE = ACCEPTED_EXTENSIONS.join(',')

export const MEDIA_PAGE_SIZE = 24

export const mediaUrl = (id: number): string => `/media/${id}`

/**
 * Nisbi `/media/{id}` ünvanını göstərmək üçün ictimai api-cbar kökü ilə tamamlayır.
 * Saxlanılan HTML-ə toxunulmur — yalnız redaktor/önizləmə DOM-unda işlənir; mütləq
 * və ya başqa ünvanlar olduğu kimi qalır. Boş kök = eyni mənbə (lokal Vite proxy).
 */
export function resolveMediaSrc(src: string, mediaBaseUrl: string): string {
  if (!mediaBaseUrl || !src.startsWith('/media/')) return src
  return `${mediaBaseUrl}${src}`
}

export function formatBytes(bytes: number | null | undefined): string {
  if (bytes === null || bytes === undefined || !Number.isFinite(bytes))
    return '—'
  if (bytes < BYTES_PER_KB) return `${bytes} B`
  if (bytes < BYTES_PER_KB * BYTES_PER_KB)
    return `${(bytes / BYTES_PER_KB).toFixed(1)} KB`
  return `${(bytes / (BYTES_PER_KB * BYTES_PER_KB)).toFixed(2)} MB`
}

export function isImageMime(mimeType: string | null | undefined): boolean {
  return (mimeType ?? '').startsWith('image/')
}

/** Kit ikonu ilə mime tipi (köhnə panelin `iconForMime` qarşılığı). */
export function iconForMime(mimeType: string | null | undefined) {
  const mime = (mimeType ?? '').toLowerCase()
  if (mime.startsWith('image/')) return ImageIcon
  if (mime.includes('pdf') || mime.includes('word') || mime.includes('msword'))
    return DocumentIcon
  if (mime.includes('sheet') || mime.includes('excel') || mime.includes('csv'))
    return ColumnsIcon
  if (
    mime.includes('zip') ||
    mime.includes('compressed') ||
    mime.includes('rar')
  )
    return FolderIcon
  return FileIcon
}
