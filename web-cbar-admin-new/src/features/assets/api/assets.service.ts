/**
 * Attachment sub-resources (contracts/admin-api.md §7) for press releases and laws:
 * `POST {mediaId}` → 204, `DELETE /{mediaId}` → 204. Spec 030 adds `PUT /order` for
 * press releases (full `mediaIds` list → 204; a partial or foreign id is a 400), spec 033
 * `PUT /{mediaId}/locale` (`{ locale }`, null for both languages → 204).
 * Pages and galleries keep their own variants (different key conventions).
 */

import { apiClient } from '@/shared/api/api-client'

export const assetsService = {
  attach: (assetsPath: string, mediaId: number) =>
    apiClient.post<void>(assetsPath, { mediaId }),
  detach: (assetsPath: string, mediaId: number) =>
    apiClient.delete<void>(`${assetsPath}/${mediaId}`),
  reorder: (assetsPath: string, mediaIds: number[]) =>
    apiClient.put<void>(`${assetsPath}/order`, { mediaIds }),
  setLocale: (assetsPath: string, mediaId: number, locale: string | null) =>
    apiClient.put<void>(`${assetsPath}/${mediaId}/locale`, { locale }),
}
