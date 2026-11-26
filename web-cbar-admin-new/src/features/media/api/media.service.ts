/**
 * Media servisi (contracts/admin-api.md §5): paged siyahı (24), multipart
 * yükləmə (sahə `file`), silmə (409 → məzmuna bağlıdır). Cavablar Zod ilə (B13).
 */

import { ZodError } from 'zod'

import {
  isImageMime,
  MEDIA_PAGE_SIZE,
  mediaItemSchema,
  type MediaItem,
} from '@/entities/media/model/types'
import { apiClient } from '@/shared/api/api-client'
import { contractError, isAppError } from '@/shared/api/types'
import { HTTP_STATUS } from '@/shared/constants/http'
import {
  listEnvelopeSchema,
  type ListResult,
} from '@/shared/crud/envelope-schema'

const listSchema = listEnvelopeSchema('paged', mediaItemSchema)

const guard = <T>(fn: () => T, where: string): T => {
  try {
    return fn()
  } catch (error) {
    if (error instanceof ZodError) throw contractError(where)
    throw error
  }
}

export interface MediaListParams {
  page: number
  search?: string
}

export const mediaService = {
  async list(params: MediaListParams): Promise<ListResult<MediaItem>> {
    const raw = await apiClient.get<unknown>('/media', {
      params: {
        page: params.page,
        pageSize: MEDIA_PAGE_SIZE,
        ...(params.search ? { search: params.search } : {}),
      },
    })
    return guard(() => listSchema.parse(raw), 'media.list')
  },

  async upload(
    file: File | Blob,
    onProgress?: (percent: number) => void,
  ): Promise<MediaItem> {
    const form = new FormData()
    form.append('file', file, file instanceof File ? file.name : 'file')
    const raw = await apiClient.post<unknown>('/media', form, {
      onUploadProgress: (event) => {
        if (onProgress && event.total) {
          onProgress(Math.round((event.loaded / event.total) * 100))
        }
      },
    })
    return guard(() => mediaItemSchema.parse(raw), 'media.upload')
  },

  remove: (id: number) => apiClient.delete<void>(`/media/${id}`),

  /**
   * Önizləmə baytları (spec 010, contracts/admin-api.md). Token header-dədir
   * (`apiClient`), URL-də deyil. Xəta atılmır — UI yer tutucu göstərir:
   * 415 → şəkil deyil (ikon), qalan hər şey → əlçatan deyil.
   */
  async preview(id: number): Promise<PreviewResult> {
    try {
      const blob = await apiClient.get<Blob>(`/media/${id}/preview`, {
        responseType: 'blob',
      })
      if (blob.type && !isImageMime(blob.type)) return { kind: 'notImage' }
      return { kind: 'image', blob }
    } catch (error) {
      if (isAppError(error) && error.status === HTTP_STATUS.UNSUPPORTED_MEDIA_TYPE) return { kind: 'notImage' }
      return { kind: 'unavailable' }
    }
  },
}

export type PreviewResult =
  | { kind: 'image'; blob: Blob }
  | { kind: 'notImage' }
  | { kind: 'unavailable' }
