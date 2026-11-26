/** CSR samples: the real contract (spec 038, `contracts/api.md`). */

import type { MockRow } from '../handlers/lib/crud-store'

export interface CsrCategoryMockRow extends MockRow {
  sortOrder: number
  isActive: boolean
  translations: { az?: { name: string }; en?: { name: string } }
}

interface CsrProjectMockTranslation {
  cardTitle: string
  summary: string
  title: string
  content: string | null
}

export interface CsrProjectMockAsset {
  mediaId: number
  originalName: string
  mimeType: string
  sizeBytes: number
}

export interface CsrProjectMockRow extends MockRow {
  categoryId: number
  coverMediaId: number | null
  cover: CsrProjectMockAsset | null
  sortOrder: number
  status: string
  showAz: boolean
  showEn: boolean
  translations: {
    az?: CsrProjectMockTranslation
    en?: CsrProjectMockTranslation
  }
  assets: CsrProjectMockAsset[]
}

export const csrCategoryFixtures: CsrCategoryMockRow[] = [
  {
    id: 1,
    sortOrder: 10,
    isActive: true,
    translations: { az: { name: 'Təhsil' }, en: { name: 'Education' } },
  },
  {
    id: 2,
    sortOrder: 20,
    isActive: true,
    translations: { az: { name: 'Ekologiya' }, en: { name: 'Ecology' } },
  },
]

export const csrProjectFixtures: CsrProjectMockRow[] = [
  {
    id: 1,
    categoryId: 1,
    coverMediaId: null,
    cover: null,
    sortOrder: 10,
    status: 'published',
    showAz: true,
    showEn: true,
    translations: {
      az: {
        cardTitle: 'Biləsuvar lisey-məktəb kompleksi',
        summary: 'Müasir təhsil kompleksi.',
        title: 'Biləsuvar şəhərində lisey-məktəb kompleksi',
        content: '<p>Mətn</p>',
      },
      en: {
        cardTitle: 'Bilasuvar lyceum',
        summary: 'A modern complex.',
        title: 'Bilasuvar lyceum-school complex',
        content: '<p>Text</p>',
      },
    },
    assets: [
      {
        mediaId: 1,
        originalName: 'birinci.jpg',
        mimeType: 'image/jpeg',
        sizeBytes: 2048,
      },
      {
        mediaId: 2,
        originalName: 'ikinci.jpg',
        mimeType: 'image/jpeg',
        sizeBytes: 2048,
      },
    ],
  },
]
