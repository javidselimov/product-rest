/**
 * Təşkilat nümunələri (seed-ə bənzər az/en). `array` envelope resurslarında
 * siyahı elementi = detail DTO — `translations` sətirdədir.
 */

import type { MockRow } from '../handlers/lib/crud-store'

/** Əsasnamə hər dil üçün ayrı sənəddir; `regulationName` yalnız cavabda olan oxunuş sahəsidir. */
interface DivisionTranslationMock {
  name: string
  description: string | null
  regulationMediaId: number | null
  regulationName?: string | null
}

export interface DivisionMock extends MockRow {
  sortOrder: number
  isActive: boolean
  mediaId: number | null
  updatedAt: string
  translations: {
    az?: DivisionTranslationMock
    en?: DivisionTranslationMock
  }
}

interface OfficeTranslationMock {
  name: string
  address: string | null
  phone: string | null
  directorName: string | null
  regulationMediaId: number | null
  regulationName: string | null
}

export interface OfficeMock extends MockRow {
  sortOrder: number
  isActive: boolean
  photoMediaId: number | null
  updatedAt: string
  translations: {
    az?: OfficeTranslationMock
    en?: OfficeTranslationMock
  }
}

export interface StaffPhotoMock {
  id: number
  mediaId: number
  originalName: string | null
  sortOrder: number
}

export interface StaffMock extends MockRow {
  type: number
  sortOrder: number
  isActive: boolean
  phone: string | null
  photoMediaId: number | null
  updatedAt: string
  photos: StaffPhotoMock[]
  translations: {
    az?: {
      fullName: string
      position: string | null
      receptionDays: string | null
      bio: string | null
    }
    en?: {
      fullName: string
      position: string | null
      receptionDays: string | null
      bio: string | null
    }
  }
}

export const divisionFixtures: DivisionMock[] = [
  {
    id: 1,
    sortOrder: 1,
    isActive: true,
    mediaId: 1,
    updatedAt: '2026-02-10T09:00:00+00:00',
    translations: {
      az: {
        name: 'Pul siyasəti departamenti',
        description: '<p>Pul siyasətinin hazırlanması.</p>',
        regulationMediaId: 3,
        regulationName: 'pul-siyaseti-esasname.pdf',
      },
      en: {
        name: 'Monetary Policy Department',
        description: '<p>Monetary policy design.</p>',
        regulationMediaId: null,
        regulationName: null,
      },
    },
  },
  {
    id: 2,
    sortOrder: 2,
    isActive: true,
    mediaId: null,
    updatedAt: '2026-02-11T09:00:00+00:00',
    translations: {
      az: { name: 'Maliyyə sabitliyi departamenti', description: null, regulationMediaId: null },
      en: { name: 'Financial Stability Department', description: null, regulationMediaId: null },
    },
  },
  {
    id: 3,
    sortOrder: 3,
    isActive: false,
    mediaId: null,
    updatedAt: '2026-02-12T09:00:00+00:00',
    translations: {
      az: { name: 'Statistika şöbəsi', description: null, regulationMediaId: null },
    },
  },
]

export const officeFixtures: OfficeMock[] = [
  {
    id: 1,
    sortOrder: 1,
    isActive: true,
    photoMediaId: 1,
    updatedAt: '2026-02-10T09:00:00+00:00',
    translations: {
      az: {
        name: 'Gəncə regional ofisi',
        address: 'Gəncə şəhəri, Heydər Əliyev pr. 1',
        phone: '+994 22 256 00 00',
        directorName: 'Hacıyev Fuad Həsən oğlu',
        regulationMediaId: 3,
        regulationName: 'hesabat-2025.pdf',
      },
      en: {
        name: 'Ganja Regional Office',
        address: '1 Heydar Aliyev Ave., Ganja',
        phone: '+994 22 256 00 00',
        directorName: 'Fuad Hajiyev',
        regulationMediaId: null,
        regulationName: null,
      },
    },
  },
  {
    id: 2,
    sortOrder: 2,
    isActive: true,
    photoMediaId: null,
    updatedAt: '2026-02-11T09:00:00+00:00',
    translations: {
      az: {
        name: 'Naxçıvan regional ofisi',
        address: 'Naxçıvan şəhəri, Təbriz küç. 10',
        phone: null,
        directorName: null,
        regulationMediaId: null,
        regulationName: null,
      },
    },
  },
]

export const staffFixtures: StaffMock[] = [
  {
    id: 1,
    type: 1,
    sortOrder: 1,
    isActive: true,
    phone: '+994 12 493 11 22',
    photoMediaId: 2,
    updatedAt: '2026-02-10T09:00:00+00:00',
    photos: [
      { id: 1, mediaId: 1, originalName: 'placeholder-1.svg', sortOrder: 1 },
    ],
    translations: {
      az: {
        fullName: 'Taleh Kazımov',
        position: 'İdarə Heyətinin sədri',
        receptionDays: 'Çərşənbə, 15:00–17:00',
        bio: '<p>2022-ci ildən İdarə Heyətinin sədridir.</p>',
      },
      en: {
        fullName: 'Taleh Kazimov',
        position: 'Chairman of the Board',
        receptionDays: 'Wednesday, 15:00–17:00',
        bio: '<p>Chairman of the Board since 2022.</p>',
      },
    },
  },
  {
    id: 2,
    type: 1,
    sortOrder: 2,
    isActive: true,
    phone: null,
    photoMediaId: null,
    updatedAt: '2026-02-11T09:00:00+00:00',
    photos: [],
    translations: {
      az: {
        fullName: 'Aysel Məmmədova',
        position: 'İdarə Heyətinin üzvü',
        receptionDays: null,
        bio: null,
      },
    },
  },
  {
    id: 3,
    type: 2,
    sortOrder: 1,
    isActive: true,
    phone: null,
    photoMediaId: null,
    updatedAt: '2026-02-12T09:00:00+00:00',
    photos: [],
    translations: {
      az: {
        fullName: 'Rəşad Orucov',
        position: 'Baş direktor',
        receptionDays: null,
        bio: null,
      },
      en: {
        fullName: 'Rashad Orujov',
        position: 'Director General',
        receptionDays: null,
        bio: null,
      },
    },
  },
  {
    id: 4,
    type: 3,
    sortOrder: 1,
    isActive: true,
    phone: null,
    photoMediaId: null,
    updatedAt: '2026-02-12T09:00:00+00:00',
    photos: [],
    translations: {
      az: {
        fullName: 'Rəna Məlikova',
        position: 'Sədrin müşaviri',
        receptionDays: null,
        bio: null,
      },
      en: {
        fullName: 'Rana Malikova',
        position: 'Adviser to the Governor',
        receptionDays: null,
        bio: null,
      },
    },
  },
]
