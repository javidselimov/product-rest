/**
 * Canlı yayım mock-ları — real kontrakt (contracts/admin-api.md §6):
 * `/video-streams` `{items}` envelope, siyahı detail ilə eyni formadadır.
 * `createdAt` spec 006-dan cavabdadır.
 */

import {
  liveStreamFixtures,
  type LiveStreamMockRow,
} from '../fixtures/live-streams'
import { createCrudStore } from './lib/crud-store'

export const liveStreamsStore = createCrudStore<LiveStreamMockRow>({
  path: '/video-streams',
  envelope: 'items',
  seed: liveStreamFixtures,
  applyBody: (body, existing, id) => {
    const now = new Date().toISOString()
    return {
      ...(existing ?? {}),
      ...body,
      id,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    } as LiveStreamMockRow
  },
})

export const liveStreamsHandlers = liveStreamsStore.handlers
