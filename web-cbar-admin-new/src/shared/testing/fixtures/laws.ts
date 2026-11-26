/** Qanunlar seed-ə bənzər nümunələr: 3 kateqoriya (az/en), 25 qanun, biri sənədli. */

import type { AttachedAsset } from '@/entities/media/model/types'
import type { MockRow } from '../handlers/lib/crud-store'

export interface LawCategoryFixture extends MockRow {
  sortOrder: number
  isActive: boolean
  translations: { az?: { name: string }; en?: { name: string } }
}

export interface LawFixture extends MockRow {
  categoryId: number
  type: number
  status: string
  publishedAt: string | null
  updatedAt: string
  translations: {
    az?: { title: string; slug?: string; description?: string | null }
    en?: { title: string; slug?: string; description?: string | null }
  }
  assets: AttachedAsset[]
}

export const lawCategoryFixtures: LawCategoryFixture[] = [
  {
    id: 1,
    sortOrder: 1,
    isActive: true,
    translations: {
      az: { name: 'Konstitusiya qanunları' },
      en: { name: 'Constitutional laws' },
    },
  },
  {
    id: 2,
    sortOrder: 2,
    isActive: true,
    translations: {
      az: { name: 'Bank qanunvericiliyi' },
      en: { name: 'Banking legislation' },
    },
  },
  {
    id: 3,
    sortOrder: 3,
    isActive: false,
    translations: { az: { name: 'Normativ aktlar' } },
  },
]

const STATUSES = ['published', 'draft', 'scheduled', 'archived'] as const

export const lawFixtures: LawFixture[] = Array.from({ length: 25 }, (_, i) => {
  const n = i + 1
  const status = STATUSES[i % STATUSES.length]
  return {
    id: n,
    categoryId: (i % 3) + 1,
    type: i % 2 === 0 ? 1 : 2,
    status,
    publishedAt:
      status === 'draft'
        ? null
        : `2026-01-${String((i % 28) + 1).padStart(2, '0')}T09:00:00+00:00`,
    updatedAt: `2026-02-${String((i % 28) + 1).padStart(2, '0')}T12:00:00+00:00`,
    translations: {
      az: {
        title: `Qanun ${n}`,
        slug: `qanun-${n}`,
        description: `<p>Qanun ${n} haqqında</p>`,
      },
      ...(i % 2 === 0
        ? { en: { title: `Law ${n}`, slug: `law-${n}`, description: null } }
        : {}),
    },
    assets:
      n === 1
        ? [
            {
              mediaId: 3,
              originalName: 'hesabat-2025.pdf',
              mimeType: 'application/pdf',
              sizeBytes: 240113,
            },
          ]
        : [],
  }
})
