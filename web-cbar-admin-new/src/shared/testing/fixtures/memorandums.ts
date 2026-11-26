/** Memorandum samples: the real contract (spec 045, `contracts/api.md`). The third one has no English text. */

import type { MockRow } from '../handlers/lib/crud-store'

interface MemorandumMockTranslation {
  organization: string
  country: string
}

export interface MemorandumMockRow extends MockRow {
  signedYear: number
  sortOrder: number
  status: string
  showAz: boolean
  showEn: boolean
  translations: { az?: MemorandumMockTranslation; en?: MemorandumMockTranslation }
}

export const memorandumFixtures: MemorandumMockRow[] = [
  {
    id: 1,
    signedYear: 2026,
    sortOrder: 10,
    status: 'published',
    showAz: true,
    showEn: true,
    translations: {
      az: { organization: 'Slovakiya Milli Bankı', country: 'Slovakiya' },
      en: { organization: 'National Bank of Slovakia', country: 'Slovakia' },
    },
  },
  {
    id: 2,
    signedYear: 2025,
    sortOrder: 10,
    status: 'published',
    showAz: true,
    showEn: true,
    translations: {
      az: { organization: 'Çin Xalq Bankı', country: 'Çin' },
      en: { organization: 'People’s Bank of China', country: 'China' },
    },
  },
  {
    id: 3,
    signedYear: 1996,
    sortOrder: 10,
    status: 'draft',
    showAz: true,
    showEn: true,
    translations: {
      az: { organization: 'Pakistan İslam Respublikası Mərkəzi Bankı', country: 'Pakistan' },
    },
  },
]
