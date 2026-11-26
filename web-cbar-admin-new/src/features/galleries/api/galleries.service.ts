/**
 * Qalereya şəkil alt-resursu (contracts/admin-api.md §7, research R9c):
 * `POST /{id}/images {mediaId}` → 200 `{id, mediaId, sortOrder}` (409 "Already attached."),
 * `PUT /{id}/images/order {imageIds: tam siyahı}` → 204, `DELETE /{id}/images/{imageId}` → 204.
 * Adi CRUD `crudService` ilə gedir.
 */

import { apiClient } from '@/shared/api/api-client'
import { contractError } from '@/shared/api/types'
import { galleryImageAddedSchema } from '../model/schemas'

const imagesPath = (galleryId: string) => `/galleries/${galleryId}/images`

export const galleriesService = {
  async addImage(galleryId: string, mediaId: number) {
    const raw = await apiClient.post<unknown>(imagesPath(galleryId), {
      mediaId,
    })
    const parsed = galleryImageAddedSchema.safeParse(raw)
    if (!parsed.success) throw contractError('galleries.addImage')
    return parsed.data
  },

  reorderImages(galleryId: string, imageIds: number[]) {
    return apiClient.put<void>(`${imagesPath(galleryId)}/order`, { imageIds })
  },

  removeImage(galleryId: string, imageId: number) {
    return apiClient.delete<void>(`${imagesPath(galleryId)}/${imageId}`)
  },
}
