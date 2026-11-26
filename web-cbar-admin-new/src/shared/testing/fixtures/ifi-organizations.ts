/** International financial institution samples: the real contract (spec 044, `contracts/api.md`). */

import type { MockRow } from '../handlers/lib/crud-store'

interface IfiOrganizationMockTranslation {
  name: string
  mission: string | null
  membershipIntro: string | null
  content: string | null
}

export interface IfiMembershipMock {
  id: number
  joinedOn: string
  sortOrder: number
  translations: { az?: { name: string }; en?: { name: string } }
}

export interface IfiOrganizationMockRow extends MockRow {
  logoMediaId: number | null
  logo: { mediaId: number; originalName: string; mimeType: string; sizeBytes: number } | null
  websiteUrl: string | null
  memberSince: number | null
  sortOrder: number
  status: string
  showAz: boolean
  showEn: boolean
  translations: {
    az?: IfiOrganizationMockTranslation
    en?: IfiOrganizationMockTranslation
  }
  memberships: IfiMembershipMock[]
}

export const ifiOrganizationFixtures: IfiOrganizationMockRow[] = [
  {
    id: 1,
    logoMediaId: null,
    logo: null,
    websiteUrl: 'https://www.worldbank.org',
    memberSince: 1992,
    sortOrder: 10,
    status: 'published',
    showAz: true,
    showEn: true,
    translations: {
      az: {
        name: 'Dünya Bankı Qrupu',
        mission: 'Yoxsulluğun azaldılması.',
        membershipIntro: 'Azərbaycan beş quruma üzv olmuşdur:',
        content: '<p>Mətn</p>',
      },
      en: { name: 'World Bank Group', mission: null, membershipIntro: null, content: null },
    },
    memberships: [
      {
        id: 11,
        joinedOn: '1992-09-18',
        sortOrder: 1,
        translations: {
          az: { name: 'Beynəlxalq Yenidənqurma və İnkişaf Bankı' },
          en: { name: 'International Bank for Reconstruction and Development' },
        },
      },
      {
        id: 12,
        joinedOn: '1992-09-23',
        sortOrder: 2,
        translations: { az: { name: 'Çoxtərəfli İnvestisiya Zəmanətləri Agentliyi' } },
      },
    ],
  },
  {
    id: 2,
    logoMediaId: null,
    logo: null,
    websiteUrl: null,
    memberSince: 1999,
    sortOrder: 30,
    status: 'draft',
    showAz: true,
    showEn: true,
    translations: {
      az: { name: 'Asiya İnkişaf Bankı', mission: null, membershipIntro: null, content: null },
    },
    memberships: [],
  },
]
