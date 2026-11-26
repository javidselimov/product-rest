/** FinCERT samples: the real contract (spec 053, `specs/053-fincert-page/contracts/admin-api.md`), shaped like the 0037 seed. */

import type { MockRow } from '../handlers/lib/crud-store'

export interface FincertSettingsMockTranslation {
  mission: string | null
  portalTitle: string | null
  portalDescription: string | null
  rfcMediaId: number | null
  rfcUrl: string | null
}

export interface FincertSettingsMock {
  email: string | null
  phone: string | null
  portalUrl: string | null
  updatedAt: string | null
  translations: { az?: FincertSettingsMockTranslation; en?: FincertSettingsMockTranslation }
}

export interface FincertDirectionMockRow extends MockRow {
  sortOrder: number
  status: string
  updatedAt: string
  translations: { az?: { title: string; body: string }; en?: { title: string; body: string } }
}

type MembershipTranslation = { name: string; description: string | null; badge: string | null }

export interface FincertMembershipMockRow extends MockRow {
  sortOrder: number
  status: string
  logoMediaId: number | null
  url: string | null
  updatedAt: string
  translations: { az?: MembershipTranslation; en?: MembershipTranslation }
}

const UPDATED = '2026-11-19T10:00:00+04:00'

export const fincertSettingsFixture: FincertSettingsMock = {
  email: 'fincert@cbar.az',
  phone: '(+994 12) 437 00 97',
  portalUrl: 'https://portal.e-cbar.az/',
  updatedAt: UPDATED,
  translations: {
    az: {
      mission: 'FinCERT-in missiyası maliyyə bazarının kibertəhlükəsizlik səviyyəsini gücləndirməkdir.',
      portalTitle: 'Vahid Elektron Hesabatlılıq Portalı',
      portalDescription: 'Hesabatlar Mərkəzi Banka bu portal vasitəsilə göndərilir.',
      rfcMediaId: null,
      rfcUrl: 'https://uploads.cbar.az/assets/f7322827bd3688a2be3136204.pdf',
    },
    en: {
      mission: 'The mission of FinCERT is to strengthen the cybersecurity of the financial market.',
      portalTitle: 'Unified Electronic Reporting Portal',
      portalDescription: null,
      rfcMediaId: null,
      rfcUrl: 'https://uploads.cbar.az/assets/02c3d655e376515419c623ce2.pdf',
    },
  },
}

const direction = (id: number, az: string, en: string | null): FincertDirectionMockRow => ({
  id,
  sortOrder: id,
  status: 'published',
  updatedAt: UPDATED,
  translations: {
    az: { title: az, body: `<p>${az} mətni</p>` },
    ...(en ? { en: { title: en, body: `<p>${en} text</p>` } } : {}),
  },
})

export const fincertDirectionFixtures: FincertDirectionMockRow[] = [
  direction(1, 'İnsidentlər barədə məlumatların əldə olunması və paylaşılması', 'Obtaining and Sharing of Information on Incidents'),
  direction(2, 'İnsidentlərin təhlili və ilkin cavab tədbirlərinin təmin olunması', 'Incident Analysis and Provision of Initial Response Measures'),
  direction(3, 'İnsidentlər üzrə fəaliyyətin koordinasiyası', null),
  direction(4, 'Təhdidlərin proaktiv aşkarlanması', 'Proactive Threat Detection'),
]

export const fincertMembershipFixtures: FincertMembershipMockRow[] = [
  {
    id: 1,
    sortOrder: 1,
    status: 'published',
    logoMediaId: null,
    url: 'https://www.first.org/',
    updatedAt: UPDATED,
    translations: {
      az: {
        name: 'Forum for Incident Response and Security Teams',
        description: 'İnsidentlərlə Mübarizə və Təhlükəsizlik Mərkəzlərinin Beynəlxalq Forumu',
        badge: '2026-cı ildən tam hüquqlu üzv',
      },
      en: { name: 'Forum of Incident Response and Security Teams', description: null, badge: 'Full member since 2026' },
    },
  },
]
