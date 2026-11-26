/**
 * Ana səhifə bloklarının seed-ə bənzər nümunələri (contracts/admin-api.md §6).
 * `media_id` 1 və 2 placeholder şəkillərdir (fixtures/media.ts).
 */

import type { MockRow } from '../handlers/lib/crud-store'

type Tr<T> = Partial<Record<'az' | 'en', T>>

export interface BannerFixture extends MockRow {
  mediaId: number | null
  sortOrder: number
  isActive: boolean
  startsAt: string | null
  endsAt: string | null
  updatedAt: string
  translations: Tr<{ title: string | null; link: string | null }>
}

export const bannerFixtures: BannerFixture[] = [
  {
    id: 1,
    mediaId: 1,
    sortOrder: 0,
    isActive: true,
    startsAt: '2026-01-01T00:00:00+00:00',
    endsAt: '2026-12-31T20:00:00+00:00',
    updatedAt: '2026-01-05T09:00:00+00:00',
    translations: {
      az: { title: 'Manat 20 il', link: 'https://www.cbar.az/manat-20' },
      en: { title: 'Manat 20 years', link: 'https://www.cbar.az/en/manat-20' },
    },
  },
  {
    id: 2,
    mediaId: 2,
    sortOrder: 1,
    isActive: false,
    startsAt: null,
    endsAt: null,
    updatedAt: '2026-01-06T09:00:00+00:00',
    translations: { az: { title: 'Maliyyə savadlılığı', link: null } },
  },
  {
    // Yalnız şəkilli banner — tərcüməsiz (kontrakt: hamısı optional).
    id: 3,
    mediaId: 2,
    sortOrder: 2,
    isActive: true,
    startsAt: null,
    endsAt: null,
    updatedAt: '2026-01-07T09:00:00+00:00',
    translations: {},
  },
]

export interface NewsSlideFixture extends MockRow {
  newsDate: string
  mediaId: number | null
  sortOrder: number
  isActive: boolean
  updatedAt: string
  translations: Tr<{
    title: string
    description: string | null
    link: string | null
  }>
}

export const newsSlideFixtures: NewsSlideFixture[] = [
  {
    id: 1,
    newsDate: '2026-02-10',
    mediaId: 1,
    sortOrder: 0,
    isActive: true,
    updatedAt: '2026-02-10T10:00:00+00:00',
    translations: {
      az: {
        title: 'Uçot dərəcəsi dəyişməz saxlanıldı',
        description: 'İdarə Heyətinin qərarı',
        link: '/az/press-releases/1',
      },
      en: {
        title: 'Policy rate kept unchanged',
        description: null,
        link: null,
      },
    },
  },
  {
    id: 2,
    newsDate: '2026-02-20',
    mediaId: null,
    sortOrder: 1,
    isActive: true,
    updatedAt: '2026-02-20T10:00:00+00:00',
    translations: {
      az: {
        title: 'Yeni əskinas dövriyyəyə buraxıldı',
        description: null,
        link: null,
      },
    },
  },
]

export interface RunningLineFixture extends MockRow {
  isActive: boolean
  startsAt: string | null
  endsAt: string | null
  updatedAt: string
  translations: Tr<{ text: string }>
}

export const runningLineFixtures: RunningLineFixture[] = [
  {
    id: 1,
    isActive: true,
    startsAt: '2026-03-01T08:00:00+00:00',
    endsAt: '2026-03-31T18:00:00+00:00',
    updatedAt: '2026-03-01T08:00:00+00:00',
    translations: {
      az: { text: 'Mart ayının uçot dərəcəsi qərarı 20 martda açıqlanacaq' },
      en: {
        text: 'The March policy rate decision will be announced on 20 March',
      },
    },
  },
  {
    id: 2,
    isActive: false,
    startsAt: null,
    endsAt: null,
    updatedAt: '2026-02-01T08:00:00+00:00',
    translations: { az: { text: 'Yeni məzənnə vərəqi dərc olunub' } },
  },
]

export interface HomepageLinkFixture extends MockRow {
  sortOrder: number
  isActive: boolean
  updatedAt: string
  translations: Tr<{ title: string; url: string }>
}

export const homepageLinkFixtures: HomepageLinkFixture[] = [
  {
    id: 1,
    sortOrder: 0,
    isActive: true,
    updatedAt: '2026-01-15T08:00:00+00:00',
    translations: {
      az: { title: 'Elektron xidmətlər', url: 'https://e-cbar.az' },
      en: { title: 'E-services', url: 'https://e-cbar.az/en' },
    },
  },
  {
    id: 2,
    sortOrder: 1,
    isActive: true,
    updatedAt: '2026-01-16T08:00:00+00:00',
    translations: {
      az: {
        title: 'Statistika bülleteni',
        url: 'https://www.cbar.az/statistics',
      },
    },
  },
]

export interface PublicationFixture extends MockRow {
  mediaId: number | null
  publishedAt: string | null
  sortOrder: number
  isActive: boolean
  updatedAt: string
  translations: Tr<{ title: string; url: string | null }>
}

export const publicationFixtures: PublicationFixture[] = [
  {
    id: 1,
    mediaId: 3,
    publishedAt: '2026-01-20T09:00:00+00:00',
    sortOrder: 0,
    isActive: true,
    updatedAt: '2026-01-20T09:00:00+00:00',
    translations: {
      az: { title: 'İllik hesabat 2025', url: null },
      en: { title: 'Annual report 2025', url: null },
    },
  },
  {
    id: 2,
    mediaId: null,
    publishedAt: null,
    sortOrder: 1,
    isActive: false,
    updatedAt: '2026-01-22T09:00:00+00:00',
    translations: {
      az: { title: 'Maliyyə sabitliyi icmalı', url: 'https://www.cbar.az/fsr' },
    },
  },
]

/** A homepage strategy document as the mock API stores it (spec 057, `contracts/admin-api.md`). */
export interface StrategyDocFixture {
  [key: string]: unknown
  id: number
  sortOrder: number
  status: string
  pageId: number | null
  createdAt: string
  updatedAt: string
  translations: Tr<{ title: string; summary: string | null; coverMediaId: number | null; url: string | null }>
}

const STRATEGY_UPDATED = '2026-11-23T10:00:00+04:00'

/** Page 1 is "Haqqımızda" (published); page 999 does not exist, so document 3 has no working link. */
export const strategyDocFixtures: StrategyDocFixture[] = [
  {
    id: 1,
    sortOrder: 1,
    status: 'published',
    pageId: 1,
    createdAt: STRATEGY_UPDATED,
    updatedAt: STRATEGY_UPDATED,
    translations: {
      az: { title: '2024-2026-cı illərdə maliyyə sektorunun inkişaf Strategiyası', summary: null, coverMediaId: 1, url: null },
      en: { title: 'Financial Sector Development Strategy for 2024-2026', summary: null, coverMediaId: null, url: null },
    },
  },
  {
    id: 2,
    sortOrder: 2,
    status: 'published',
    pageId: null,
    createdAt: STRATEGY_UPDATED,
    updatedAt: STRATEGY_UPDATED,
    translations: {
      az: { title: 'Risk əsaslı nəzarət üzrə Siyasət Konsepsiyası', summary: 'Qısa mətn', coverMediaId: null, url: '/az/risk' },
    },
  },
  {
    id: 3,
    sortOrder: 3,
    status: 'draft',
    pageId: 999,
    createdAt: STRATEGY_UPDATED,
    updatedAt: STRATEGY_UPDATED,
    translations: {
      az: { title: 'Mikromaliyyə Modeli üzrə Strateji Çərçivə', summary: null, coverMediaId: null, url: null },
    },
  },
]
