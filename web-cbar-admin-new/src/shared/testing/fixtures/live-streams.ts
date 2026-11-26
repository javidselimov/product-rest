/** Canlı yayım nümunələri (spec 006) — prod-dakı kimi YouTube linkləri. */

import type { MockRow } from '../handlers/lib/crud-store'

export interface LiveStreamMockRow extends MockRow {
  streamUrl: string
  isLive: boolean
  startsAt: string | null
  createdAt: string
  updatedAt: string
  translations: { az?: { title: string }; en?: { title: string } }
}

export const liveStreamFixtures: LiveStreamMockRow[] = [
  {
    id: 1,
    streamUrl: 'https://www.youtube.com/watch?v=cbarLive01',
    isLive: true,
    startsAt: '2026-06-10T11:00:00+00:00',
    createdAt: '2026-06-09T08:00:00+00:00',
    updatedAt: '2026-06-10T10:55:00+00:00',
    translations: {
      az: { title: 'Mətbuat konfransı' },
      en: { title: 'Press conference' },
    },
  },
  {
    id: 2,
    streamUrl: 'https://youtu.be/cbarLive02',
    isLive: false,
    startsAt: null,
    createdAt: '2026-05-20T08:00:00+00:00',
    updatedAt: '2026-05-20T08:00:00+00:00',
    translations: { en: { title: 'Financial forum' } },
  },
]
