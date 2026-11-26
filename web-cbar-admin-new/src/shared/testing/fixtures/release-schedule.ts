/** Release schedule samples: the real contract (spec 039, `contracts/admin-api.md`). */

import type { MockRow } from '../handlers/lib/crud-store'

type NameTranslations = { az?: { name: string }; en?: { name: string } }

export interface ReleaseScheduleGroupMockRow extends MockRow {
  sortOrder: number
  isActive: boolean
  translations: NameTranslations
}

export interface ReleaseSchedulePeriodicityMockRow extends MockRow {
  sortOrder: number
  translations: NameTranslations
}

interface ReleaseScheduleItemMockTranslation {
  title: string
  timing: string | null
}

export interface ReleaseScheduleItemMockRow extends MockRow {
  groupId: number
  periodicityId: number | null
  timingMode: 'text' | 'link' | 'decisions'
  timingUrl: string | null
  sortOrder: number
  status: string
  showAz: boolean
  showEn: boolean
  translations: {
    az?: ReleaseScheduleItemMockTranslation
    en?: ReleaseScheduleItemMockTranslation
  }
}

export const releaseScheduleGroupFixtures: ReleaseScheduleGroupMockRow[] = [
  {
    id: 1,
    sortOrder: 10,
    isActive: true,
    translations: {
      az: { name: 'Pul və məzənnə siyasəti üzrə' },
      en: { name: 'Monetary and exchange rate policy' },
    },
  },
  {
    id: 2,
    sortOrder: 20,
    isActive: true,
    translations: {
      az: { name: 'Normativ-hüquqi baza üzrə' },
      en: { name: 'Normative and legal base' },
    },
  },
]

export const releaseSchedulePeriodicityFixtures: ReleaseSchedulePeriodicityMockRow[] = [
  { id: 1, sortOrder: 10, translations: { az: { name: 'İllik' }, en: { name: 'Annually' } } },
  { id: 3, sortOrder: 30, translations: { az: { name: 'Aylıq' }, en: { name: 'Monthly' } } },
  {
    id: 6,
    sortOrder: 60,
    translations: {
      az: { name: 'Qərar müvafiq qaydada təsdiq edildikdə' },
      en: { name: 'When decisions are accordingly approved' },
    },
  },
  {
    id: 8,
    sortOrder: 80,
    translations: { az: { name: 'İstifadə olunmayan' } },
  },
]

export const releaseScheduleItemFixtures: ReleaseScheduleItemMockRow[] = [
  {
    id: 1,
    groupId: 1,
    periodicityId: 1,
    timingMode: 'text',
    timingUrl: null,
    sortOrder: 10,
    status: 'published',
    showAz: true,
    showEn: true,
    translations: {
      az: { title: 'Pul siyasətinin əsas istiqamətləri (Bəyanat)', timing: 'Dekabr ayının 31-dək' },
      en: { title: 'Main directions of the monetary policy (Statement)', timing: 'Up to December 31' },
    },
  },
  {
    id: 2,
    groupId: 1,
    periodicityId: 6,
    timingMode: 'decisions',
    timingUrl: null,
    sortOrder: 20,
    status: 'published',
    showAz: true,
    showEn: true,
    translations: {
      az: { title: 'Pul siyasəti ilə bağlı qəbul olunan qərarlar', timing: 'Qrafikə uyğun' },
      en: { title: 'Monetary policy related decisions', timing: 'According to the schedule' },
    },
  },
  {
    id: 3,
    groupId: 2,
    periodicityId: 3,
    timingMode: 'link',
    timingUrl: 'https://e-qanun.az',
    sortOrder: 10,
    status: 'draft',
    showAz: true,
    showEn: false,
    translations: {
      az: { title: 'Normativ-xarakterli aktlar', timing: 'Reyestrə daxil edildikdən sonra' },
    },
  },
]
