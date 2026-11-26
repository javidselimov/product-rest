/**
 * Press release samples — seed-like az/en translations, `assets` sub-list, all types
 * (1 news, 2 announcement, 3 interview or speech). Item 4 (news) carries images + a PDF for the
 * spec 030 ordering tests; item 3 (announcement) carries an image + a PDF for the spec 031
 * "no badges" test; item 5 (interview) carries one PDF per language for spec 033.
 */

import type { AttachedAsset } from '@/entities/media/model/types'
import type { MockRow } from '../handlers/lib/crud-store'

export interface PressReleaseTranslationMock {
  title: string
  slug: string
  content: string | null
}

export interface PressReleaseMockRow extends MockRow {
  type: number
  status: string
  publishedAt: string | null
  updatedAt: string
  translations: {
    az?: PressReleaseTranslationMock
    en?: PressReleaseTranslationMock
  }
  assets: AttachedAsset[]
}

export const pressReleaseFixtures: PressReleaseMockRow[] = [
  {
    id: 1,
    type: 1,
    status: 'published',
    publishedAt: '2026-01-15T10:00:00+00:00',
    updatedAt: '2026-01-15T10:00:00+00:00',
    translations: {
      az: {
        title: 'Uçot dərəcəsi dəyişməz saxlanılıb',
        slug: 'ucot-derecesi-deyismez-saxlanilib',
        content:
          '<p>Mərkəzi Bankın İdarə Heyəti uçot dərəcəsini dəyişməz saxlayıb.</p>',
      },
      en: {
        title: 'Refinancing rate kept unchanged',
        slug: 'refinancing-rate-kept-unchanged',
        content: '<p>The Board kept the refinancing rate unchanged.</p>',
      },
    },
    assets: [
      {
        mediaId: 3,
        originalName: 'hesabat-2025.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 240113,
      },
    ],
  },
  {
    id: 2,
    type: 2,
    status: 'draft',
    publishedAt: null,
    updatedAt: '2026-02-02T08:30:00+00:00',
    translations: {
      az: {
        title: 'Maliyyə sabitliyi hesabatı təqdim olunub',
        slug: 'maliyye-sabitliyi-hesabati',
        content: null,
      },
    },
    assets: [],
  },
  {
    id: 3,
    type: 2,
    status: 'scheduled',
    publishedAt: '2026-12-01T09:00:00+00:00',
    updatedAt: '2026-03-10T12:00:00+00:00',
    translations: {
      en: {
        title: 'Statement on FX market',
        slug: 'statement-on-fx-market',
        content: null,
      },
    },
    // Spec 031: announcements show no photos on the site, so the panel shows no badges.
    assets: [
      {
        mediaId: 2,
        originalName: 'placeholder-2.svg',
        mimeType: 'image/svg+xml',
        sizeBytes: 1536,
      },
      {
        mediaId: 3,
        originalName: 'hesabat-2025.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 240113,
      },
    ],
  },
  {
    id: 4,
    type: 1,
    status: 'published',
    publishedAt: '2026-04-20T11:00:00+00:00',
    updatedAt: '2026-04-20T11:00:00+00:00',
    translations: {
      az: {
        title: 'Yeni əskinasların tədavülə buraxılması',
        slug: 'yeni-eskinaslar',
        content: '<p>Yeni nominallı əskinaslar tədavülə buraxılır.</p>',
      },
    },
    // Spec 030: three images + one PDF — the first image is the cover on the site,
    // the other two the photo gallery, the PDF a listed document.
    assets: [
      {
        mediaId: 1,
        originalName: 'placeholder-1.svg',
        mimeType: 'image/svg+xml',
        sizeBytes: 2048,
      },
      {
        mediaId: 2,
        originalName: 'placeholder-2.svg',
        mimeType: 'image/svg+xml',
        sizeBytes: 1536,
      },
      {
        mediaId: 7,
        originalName: 'eskinas-3.jpg',
        mimeType: 'image/jpeg',
        sizeBytes: 90112,
      },
      {
        mediaId: 3,
        originalName: 'hesabat-2025.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 240113,
      },
    ],
  },
  {
    id: 5,
    type: 3,
    status: 'archived',
    publishedAt: '2026-05-05T09:00:00+00:00',
    updatedAt: '2026-05-05T09:00:00+00:00',
    translations: {
      az: {
        title: 'Mərkəzi Bankın sədrinin müsahibəsi',
        slug: 'sedrin-musahibesi',
        content: '<p>Müsahibə mətni.</p>',
      },
      en: {
        title: 'Interview of the Governor',
        slug: 'interview-of-the-governor',
        content: '<p>Interview text.</p>',
      },
    },
    // Spec 033: the first image is the list card; the first PDF of each language is its button.
    assets: [
      {
        mediaId: 1,
        originalName: 'placeholder-1.svg',
        mimeType: 'image/svg+xml',
        sizeBytes: 2048,
        locale: null,
      },
      {
        mediaId: 2,
        originalName: 'placeholder-2.svg',
        mimeType: 'image/svg+xml',
        sizeBytes: 1536,
        locale: null,
      },
      {
        mediaId: 3,
        originalName: 'hesabat-2025.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 240113,
        locale: 'az',
      },
      {
        mediaId: 8,
        originalName: 'report-2025.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 180224,
        locale: 'en',
      },
      {
        mediaId: 9,
        originalName: 'elave-2025.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 90112,
        locale: 'az',
      },
    ],
  },
]
