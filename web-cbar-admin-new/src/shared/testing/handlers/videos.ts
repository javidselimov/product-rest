/**
 * Video mock-ları — real kontrakt (contracts/admin-api.md §6): `/videos` paged
 * (list DTO düz `title`). Canlı yayımlar: `./live-streams.ts`.
 */

import { videoFixtures, type VideoMockRow } from '../fixtures/videos'
import { createCrudStore } from './lib/crud-store'

export const videosStore = createCrudStore<VideoMockRow>({
  path: '/videos',
  envelope: 'paged',
  seed: videoFixtures,
  listItem: (row) => ({
    id: row.id,
    youtubeUrl: row.youtubeUrl,
    publishedAt: row.publishedAt,
    sortOrder: row.sortOrder,
    isActive: row.isActive,
    updatedAt: row.updatedAt,
    title: row.translations.az?.title ?? row.translations.en?.title ?? null,
  }),
  applyBody: (body, existing, id) =>
    ({
      ...(existing ?? {}),
      ...body,
      id,
      updatedAt: new Date().toISOString(),
    }) as VideoMockRow,
})

export const videosHandlers = videosStore.handlers
