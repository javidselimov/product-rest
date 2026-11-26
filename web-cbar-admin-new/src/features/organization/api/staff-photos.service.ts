/**
 * Heyət üzvünün mətbuat fotoları alt-resursu (qalereya şəkilləri ilə eyni forma):
 * `POST /organization/staff/{id}/photos {mediaId}` → 200 `{id, mediaId, sortOrder}`
 * (400 şəkil deyil, 409 "Already attached."), `PUT /{id}/photos/order {photoIds: tam siyahı}` → 204,
 * `DELETE /{id}/photos/{photoId}` → 204. Adi CRUD `crudService` ilə gedir.
 */

import { crudKeys } from '@/features/crud/api/crud.keys'
import { apiClient } from '@/shared/api/api-client'
import { contractError } from '@/shared/api/types'
import { staffPhotoAddedSchema } from '../model/schemas'

/** `staffModule.id` ilə eyni — detail invalidasiyası mühərrik açarı ilə gedir. */
export const STAFF_MODULE_ID = 'organization-staff'

export const staffKeys = crudKeys(STAFF_MODULE_ID)

const photosPath = (staffId: string) => `/organization/staff/${staffId}/photos`

export const staffPhotosService = {
  async addPhoto(staffId: string, mediaId: number) {
    const raw = await apiClient.post<unknown>(photosPath(staffId), { mediaId })
    const parsed = staffPhotoAddedSchema.safeParse(raw)
    if (!parsed.success) throw contractError('organization.staff.addPhoto')
    return parsed.data
  },

  reorderPhotos(staffId: string, photoIds: number[]) {
    return apiClient.put<void>(`${photosPath(staffId)}/order`, { photoIds })
  },

  removePhoto(staffId: string, photoId: number) {
    return apiClient.delete<void>(`${photosPath(staffId)}/${photoId}`)
  },
}
