/**
 * CRUD-dan kənar istifadəçi endpoint-i (contracts/admin-api.md §8):
 * `PUT /users/{id}/password { newPassword }` → 204; siyasət pozulanda 400 `{message}`.
 * Adi CRUD `crudService` ilə gedir.
 */

import { apiClient } from '@/shared/api/api-client'

export const usersService = {
  resetPassword: (id: number, newPassword: string) =>
    apiClient.put<void>(`/users/${id}/password`, { newPassword }),
}
