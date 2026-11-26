/**
 * Working paper samples in the real detail shape (spec 054, `api-cbar-admin/openapi/components/schemas/working-papers.yaml`):
 * translations are a locale-keyed object, lists are arrays, the PDF is `media` (null when there is none). Paper 1 is
 * in both languages, paper 2 only in az, paper 3 an older draft.
 */

import type { MockRow } from '../handlers/lib/crud-store'

export interface WorkingPaperMockMedia {
  id: number
  originalName: string
  mimeType: string
  sizeBytes: number
}

export interface WorkingPaperMockTranslation {
  title: string
  authors: string[]
  abstract: string | null
  keywords: string[]
  mediaId: number | null
  media: WorkingPaperMockMedia | null
}

export interface WorkingPaperMockRow extends MockRow {
  number: number
  year: number
  code: string
  paperLanguage: 'az' | 'en' | 'other'
  jelCodes: string[]
  legacyPageId: number | null
  status: string
  createdAt: string
  updatedAt: string
  translations: { az?: WorkingPaperMockTranslation; en?: WorkingPaperMockTranslation }
}

const PDF: WorkingPaperMockMedia = {
  id: 3,
  originalName: 'hesabat-2025.pdf',
  mimeType: 'application/pdf',
  sizeBytes: 240113,
}

export const workingPaperFixtures: WorkingPaperMockRow[] = [
  {
    id: 1,
    number: 2,
    year: 2025,
    code: '02/2025',
    paperLanguage: 'en',
    jelCodes: ['E52', 'E58'],
    legacyPageId: null,
    status: 'published',
    createdAt: '2025-06-01T09:00:00+00:00',
    updatedAt: '2025-06-10T09:00:00+00:00',
    translations: {
      az: {
        title: 'Pul siyasətinin ötürülmə mexanizmi',
        authors: ['Elvin Əliyev', 'Nigar Həsənova'],
        abstract: 'Məqalə faiz kanalını öyrənir.\nİkinci paraqraf.',
        keywords: ['pul siyasəti', 'faiz dərəcəsi'],
        mediaId: 3,
        media: PDF,
      },
      en: {
        title: 'Monetary policy transmission mechanism',
        authors: ['Elvin Aliyev', 'Nigar Hasanova'],
        abstract: 'The paper studies the interest rate channel.',
        keywords: ['monetary policy', 'interest rate'],
        mediaId: 3,
        media: PDF,
      },
    },
  },
  {
    id: 2,
    number: 1,
    year: 2025,
    code: '01/2025',
    paperLanguage: 'az',
    jelCodes: ['C22'],
    legacyPageId: null,
    status: 'published',
    createdAt: '2025-03-01T09:00:00+00:00',
    updatedAt: '2025-03-05T09:00:00+00:00',
    translations: {
      az: {
        title: 'İnflyasiya gözləntilərinin ölçülməsi',
        authors: ['Rauf Məmmədov'],
        abstract: null,
        keywords: [],
        mediaId: null,
        media: null,
      },
    },
  },
  {
    id: 3,
    number: 4,
    year: 2024,
    code: '04/2024',
    paperLanguage: 'other',
    jelCodes: [],
    legacyPageId: 371,
    status: 'draft',
    createdAt: '2024-11-01T09:00:00+00:00',
    updatedAt: '2024-11-02T09:00:00+00:00',
    translations: {
      en: {
        title: 'Exchange rate pass-through',
        authors: ['Leyla Quliyeva'],
        abstract: null,
        keywords: ['exchange rate'],
        mediaId: null,
        media: null,
      },
    },
  },
]
