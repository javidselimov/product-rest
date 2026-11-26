/**
 * Statusu siyahıdan dəyişmə (spec 006 FR-003). API-də PATCH yoxdur —
 * `PUT /video-streams/{id}` tam DTO gözləyir (`VideoStreamUpsertDto`), siyahı
 * sətri isə detail ilə eyni formadadır, ona görə əlavə GET lazım deyil.
 */

import { apiClient } from '@/shared/api/api-client'
import type { LiveStreamRow } from '../model/schemas'

export const liveStreamsService = {
  setLive: (row: LiveStreamRow, isLive: boolean) =>
    apiClient.put<unknown>(`/video-streams/${row.id}`, {
      streamUrl: row.streamUrl ?? '',
      isLive,
      startsAt: row.startsAt ?? null,
      translations: row.translations,
    }),
}
