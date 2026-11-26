/** Pul nişanları nümunələri (seed-ə bənzər az/en). Media id 1/2 placeholder şəkillərdir. */

import type { MockRow } from '../handlers/lib/crud-store'

export interface MoneyMarkMock extends MockRow {
  categoryId: number
  type: number
  frontMediaId: number | null
  rearMediaId: number | null
  sortOrder: number
  status: string
  updatedAt: string
  translations: {
    az?: {
      title: string
      description: string | null
      securityFeatures: string | null
    }
    en?: {
      title: string
      description: string | null
      securityFeatures: string | null
    }
  }
}

export interface MoneyMarkCategoryMock extends MockRow {
  sortOrder: number
  isActive: boolean
  translations: { az?: { name: string }; en?: { name: string } }
}

export interface MoneyMarkNewsMock extends MockRow {
  status: string
  publishedAt: string | null
  updatedAt: string
  translations: {
    az?: { title: string; content: string | null }
    en?: { title: string; content: string | null }
  }
}

export const moneyMarkCategoryFixtures: MoneyMarkCategoryMock[] = [
  {
    id: 1,
    sortOrder: 1,
    isActive: true,
    translations: {
      az: { name: 'Dövriyyədə olan nişanlar' },
      en: { name: 'Marks in circulation' },
    },
  },
  {
    id: 2,
    sortOrder: 2,
    isActive: true,
    translations: {
      az: { name: 'Xatirə sikkələri' },
      en: { name: 'Commemorative coins' },
    },
  },
  {
    id: 3,
    sortOrder: 3,
    isActive: false,
    translations: { az: { name: 'Arxiv nişanları' } },
  },
]

export const moneyMarkFixtures: MoneyMarkMock[] = [
  {
    id: 1,
    categoryId: 1,
    type: 1,
    frontMediaId: 1,
    rearMediaId: 2,
    sortOrder: 1,
    status: 'published',
    updatedAt: '2026-02-10T09:00:00+00:00',
    translations: {
      az: {
        title: '1 manat əskinası',
        description: '<p>Yeni nəsil 1 manat.</p>',
        securityFeatures: '<ul><li>Su nişanı</li></ul>',
      },
      en: {
        title: '1 manat banknote',
        description: '<p>New generation 1 manat.</p>',
        securityFeatures: '<ul><li>Watermark</li></ul>',
      },
    },
  },
  {
    id: 2,
    categoryId: 1,
    type: 1,
    frontMediaId: null,
    rearMediaId: null,
    sortOrder: 2,
    status: 'draft',
    updatedAt: '2026-02-11T09:00:00+00:00',
    translations: {
      az: {
        title: '5 manat əskinası',
        description: null,
        securityFeatures: null,
      },
    },
  },
  {
    id: 3,
    categoryId: 1,
    type: 2,
    frontMediaId: null,
    rearMediaId: null,
    sortOrder: 3,
    status: 'published',
    updatedAt: '2026-02-12T09:00:00+00:00',
    translations: {
      az: {
        title: '50 qəpik sikkəsi',
        description: null,
        securityFeatures: null,
      },
      en: { title: '50 qapik coin', description: null, securityFeatures: null },
    },
  },
  {
    id: 4,
    categoryId: 2,
    type: 2,
    frontMediaId: 1,
    rearMediaId: null,
    sortOrder: 1,
    status: 'archived',
    updatedAt: '2026-02-13T09:00:00+00:00',
    translations: {
      az: {
        title: 'Novruz xatirə sikkəsi',
        description: null,
        securityFeatures: null,
      },
      en: {
        title: 'Novruz commemorative coin',
        description: null,
        securityFeatures: null,
      },
    },
  },
]

export const moneyMarkNewsFixtures: MoneyMarkNewsMock[] = [
  {
    id: 1,
    status: 'published',
    publishedAt: '2026-03-01T08:00:00+00:00',
    updatedAt: '2026-03-01T08:00:00+00:00',
    translations: {
      az: {
        title: 'Yeni 200 manat əskinası dövriyyəyə buraxıldı',
        content: '<p>Mətn.</p>',
      },
      en: { title: 'New 200 manat banknote issued', content: '<p>Text.</p>' },
    },
  },
  {
    id: 2,
    status: 'draft',
    publishedAt: null,
    updatedAt: '2026-03-02T08:00:00+00:00',
    translations: {
      az: { title: 'Xatirə sikkəsi sərgisi', content: null },
    },
  },
]
