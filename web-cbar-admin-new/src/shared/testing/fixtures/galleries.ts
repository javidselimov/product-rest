/** Qalereya nümunələri — seed-ə bənzər az/en tərcümələr, `images` alt-siyahısı. */

import type { MockRow } from '../handlers/lib/crud-store'

export interface GalleryImageMock {
  id: number
  mediaId: number
  originalName: string | null
  sortOrder: number
}

export interface GalleryMockRow extends MockRow {
  eventDate: string | null
  sortOrder: number
  isActive: boolean
  updatedAt: string
  translations: { az?: { title: string }; en?: { title: string } }
  images: GalleryImageMock[]
}

export const galleryFixtures: GalleryMockRow[] = [
  {
    id: 1,
    eventDate: '2026-03-12',
    sortOrder: 0,
    isActive: true,
    updatedAt: '2026-03-12T10:00:00+00:00',
    translations: {
      az: { title: 'Valyuta sərgisi' },
      en: { title: 'Currency exhibition' },
    },
    images: [
      { id: 1, mediaId: 1, originalName: 'placeholder-1.svg', sortOrder: 0 },
    ],
  },
  {
    id: 2,
    eventDate: '2026-05-20',
    sortOrder: 1,
    isActive: true,
    updatedAt: '2026-05-20T09:30:00+00:00',
    translations: { az: { title: 'Maliyyə savadlılığı həftəsi' } },
    images: [],
  },
  {
    id: 3,
    eventDate: null,
    sortOrder: 2,
    isActive: false,
    updatedAt: '2026-06-01T08:00:00+00:00',
    translations: { en: { title: 'Open day' } },
    images: [
      { id: 2, mediaId: 1, originalName: 'placeholder-1.svg', sortOrder: 0 },
      { id: 3, mediaId: 2, originalName: 'placeholder-2.svg', sortOrder: 1 },
    ],
  },
]
