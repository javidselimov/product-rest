/**
 * Statusu siyahıdan dəyişmə (spec 009 FR-008). API-də PATCH yoxdur —
 * `PUT /image-popups/{id}` tam DTO gözləyir (`ImagePopupUpsertDto`), siyahı
 * sətri isə detail ilə eyni formadadır, ona görə əlavə GET lazım deyil.
 * `mediaName` yalnız cavabdadır, göndərilmir.
 */

import { apiClient } from '@/shared/api/api-client'
import type { ImagePopupRow } from '../model/schemas'

export const imagePopupsService = {
  setActive: (row: ImagePopupRow, isActive: boolean) =>
    apiClient.put<unknown>(`/image-popups/${row.id}`, {
      title: row.title,
      isActive,
      translations: Object.fromEntries(
        Object.entries(row.translations).map(([locale, tr]) => [
          locale,
          {
            mediaId: tr?.mediaId ?? null,
            link: tr?.link ?? null,
            altText: tr?.altText ?? null,
          },
        ]),
      ),
    }),
}
