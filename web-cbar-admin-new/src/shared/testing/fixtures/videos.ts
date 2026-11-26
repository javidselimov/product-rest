/** Video nümunələri — seed-ə bənzər az/en tərcümələr. */

import type { MockRow } from '../handlers/lib/crud-store'

export interface VideoMockRow extends MockRow {
  youtubeUrl: string
  publishedAt: string | null
  sortOrder: number
  isActive: boolean
  updatedAt: string
  translations: { az?: { title: string }; en?: { title: string } }
}

export const videoFixtures: VideoMockRow[] = [
  {
    id: 1,
    youtubeUrl: 'https://www.youtube.com/watch?v=cbar0001',
    publishedAt: '2026-02-14T09:00:00+00:00',
    sortOrder: 0,
    isActive: true,
    updatedAt: '2026-02-14T09:00:00+00:00',
    translations: {
      az: { title: 'Pul siyasəti haqqında brifinq' },
      en: { title: 'Monetary policy briefing' },
    },
  },
  {
    id: 2,
    youtubeUrl: 'https://www.youtube.com/watch?v=cbar0002',
    publishedAt: null,
    sortOrder: 1,
    isActive: false,
    updatedAt: '2026-03-01T12:00:00+00:00',
    translations: { az: { title: 'Maliyyə savadlılığı dərsi' } },
  },
  {
    id: 3,
    youtubeUrl: 'https://youtu.be/cbar0003',
    publishedAt: '2026-04-05T15:30:00+00:00',
    sortOrder: 2,
    isActive: true,
    updatedAt: '2026-04-05T15:30:00+00:00',
    translations: { en: { title: 'Annual report presentation' } },
  },
]
