/** Event samples: the real contract (spec 034), including a legacy event without type or category. */

import type { MockRow } from '../handlers/lib/crud-store'

export interface EventCategoryMockRow extends MockRow {
  sortOrder: number
  isActive: boolean
  translations: { az?: { name: string }; en?: { name: string } }
}

export interface EventMockRow extends MockRow {
  type: number | null
  categoryId: number | null
  status: string
  startsOn: string
  endsOn: string | null
  startTime: string | null
  galleryId: number | null
  pressReleaseId: number | null
  pageId: number | null
  translations: {
    az?: {
      title: string
      slug: string
      location: string | null
      content: string | null
    }
    en?: {
      title: string
      slug: string
      location: string | null
      content: string | null
    }
  }
}

export const eventCategoryFixtures: EventCategoryMockRow[] = [
  {
    id: 1,
    sortOrder: 1,
    isActive: true,
    translations: {
      az: { name: 'Pul siyasəti' },
      en: { name: 'Monetary policy' },
    },
  },
  {
    id: 2,
    sortOrder: 2,
    isActive: true,
    translations: { az: { name: 'Beynəlxalq' }, en: { name: 'International' } },
  },
  {
    id: 3,
    sortOrder: 3,
    isActive: false,
    translations: { az: { name: 'İstifadəsiz' } },
  },
]

export const eventFixtures: EventMockRow[] = [
  {
    id: 1,
    type: 1,
    categoryId: 1,
    status: 'published',
    startsOn: '2026-12-23',
    endsOn: null,
    startTime: '11:00',
    galleryId: null,
    pressReleaseId: null,
    pageId: null,
    translations: {
      az: {
        title: 'Faiz dəhlizinə dair qərar',
        slug: 'faiz-dehlizine-dair-qerar',
        location: 'Mərkəzi Bank, Bakı',
        content: null,
      },
      en: {
        title: 'Interest rate corridor decision',
        slug: 'interest-rate-corridor-decision',
        location: 'Central Bank, Baku',
        content: null,
      },
    },
  },
  {
    id: 2,
    type: null,
    categoryId: null,
    status: 'published',
    startsOn: '2024-11-14',
    endsOn: null,
    startTime: null,
    galleryId: null,
    pressReleaseId: null,
    pageId: 1,
    translations: {
      az: { title: 'COP29', slug: 'cop29', location: null, content: null },
    },
  },
]
