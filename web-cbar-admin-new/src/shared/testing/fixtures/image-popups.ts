/** Şəkilli popup nümunələri (spec 009) — media id-ləri `fixtures/media.ts`-dəndir. */

import type { MockRow } from '../handlers/lib/crud-store'

export interface ImagePopupTranslationMock {
  mediaId: number | null
  mediaName: string | null
  link: string | null
  altText: string | null
}

export interface ImagePopupMockRow extends MockRow {
  title: string
  isActive: boolean
  activatedAt: string | null
  createdAt: string
  updatedAt: string
  translations: { az?: ImagePopupTranslationMock; en?: ImagePopupTranslationMock }
}

export const imagePopupFixtures: ImagePopupMockRow[] = [
  {
    id: 1,
    title: 'Maliyyə savadlılığı həftəsi',
    isActive: true,
    activatedAt: '2026-06-10T09:00:00+00:00',
    createdAt: '2026-06-10T09:00:00+00:00',
    updatedAt: '2026-06-10T09:00:00+00:00',
    translations: {
      az: {
        mediaId: 1,
        mediaName: 'placeholder-1.svg',
        link: 'https://www.cbar.az/az/page-40',
        altText: 'Maliyyə savadlılığı həftəsi',
      },
      en: {
        mediaId: 2,
        mediaName: 'placeholder-2.svg',
        link: '/en/page-40',
        altText: 'Financial literacy week',
      },
    },
  },
  {
    id: 2,
    title: 'Köhnə elan',
    isActive: false,
    activatedAt: '2026-05-01T09:00:00+00:00',
    createdAt: '2026-05-01T09:00:00+00:00',
    updatedAt: '2026-05-20T09:00:00+00:00',
    translations: {
      az: {
        mediaId: 2,
        mediaName: 'placeholder-2.svg',
        link: null,
        altText: null,
      },
    },
  },
]
