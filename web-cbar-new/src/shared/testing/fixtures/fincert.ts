/**
 * FinCERT fixtures (spec 053), shaped like the 0037 seed: four directions (paragraphs and lists), the RFC-2350 document
 * as the legacy external link, FIRST without a logo. `partial` fills only the mission and the contacts; `empty` is the
 * answer of a database without FinCERT rows.
 */
import type { FincertDto } from '@/features/fincert/model/schemas'

export const fincertAz: FincertDto = {
  mission:
    'Azərbaycan Respublikasının Mərkəzi Bankı (Mərkəzi Bank) tərəfindən yaradılmış Maliyyə sektorunda sahəvi Kompüter İnsidentlərinə qarşı Mübarizə Mərkəzinin (FinCERT) missiyası maliyyə bazarının kibertəhlükəsizlik səviyyəsini və dayanıqlılığını gücləndirməkdir.',
  email: 'fincert@cbar.az',
  phone: '(+994 12) 437 00 97',
  portal: {
    title: 'Vahid Elektron Hesabatlılıq Portalı',
    description: 'Yüksək kateqoriyalı insidentlər üzrə hesabatlar nəzarət subyektləri tərəfindən Mərkəzi Banka bu portal vasitəsilə göndərilir.',
    url: 'https://portal.e-cbar.az/',
  },
  rfc: { file: null, url: 'https://uploads.cbar.az/assets/f7322827bd3688a2be3136204.pdf' },
  directions: [
    {
      id: 1,
      title: 'İnsidentlər barədə məlumatların əldə olunması və paylaşılması',
      body: '<p>FinCERT maliyyə bazar iştirakçılarına təsir edən kibertəhlükəsizlik insidentləri barədə məlumatların mərkəzləşdirilmiş formada toplanmasını təmin edir.</p><p>FinCERT bu istiqamətdə:</p><ul><li>CERT-lər ilə sıx kommunikasiya həyata keçirir;</li><li>effektiv kommunikasiya mühitini formalaşdırır;</li><li>qlobal ən yaxşı təcrübələri tətbiq edir.</li></ul>',
    },
    {
      id: 2,
      title: 'İnsidentlərin təhlili və ilkin cavab tədbirlərinin təmin olunması',
      body: '<p>FinCERT daxil olan məlumatları analiz edərək insidentlərin əsas səbəblərini müəyyənləşdirir.</p>',
    },
    {
      id: 3,
      title: 'İnsidentlər üzrə fəaliyyətin koordinasiyası və maliyyə ekosistemində dayanıqlılığın gücləndirilməsi',
      body: '<p>FinCERT insidentlərə cavab proseslərini vahid formada təşkil edir.</p><p>FinCERT eyni zamanda:</p><ul><li>bilik və bacarıqların artırılmasına şərait yaradır;</li><li>kibergigiyena səviyyəsini yüksəldir;</li><li>kibertəhlükəsizlik məlumatlarının yayılmasını təmin edir.</li></ul>',
    },
    {
      id: 4,
      title: 'Təhdidlərin proaktiv aşkarlanması və iştirakçıların əvvəlcədən xəbərdar edilməsi',
      body: '<p>FinCERT yeni və yaranmaqda olan təhdidlərin identifikasiyasını həyata keçirir.</p><p>Bu fəaliyyət nəticəsində ümumi kiberdayanıqlılıq gücləndirilir.</p>',
    },
  ],
  memberships: [
    {
      id: 1,
      name: 'Forum for Incident Response and Security Teams',
      description: 'İnsidentlərlə Mübarizə və Təhlükəsizlik Mərkəzlərinin Beynəlxalq Forumu',
      badge: '2026-cı ildən tam hüquqlu üzv',
      url: 'https://www.first.org/',
      logo: null,
    },
  ],
}

export const fincertEn: FincertDto = {
  ...fincertAz,
  mission:
    'The mission of the Financial Computer Emergency Response Center (FinCERT), established by the Central Bank of the Republic of Azerbaijan, is to strengthen the level of cybersecurity and resilience of the financial market.',
  portal: {
    title: 'Unified Electronic Reporting Portal',
    description: "The Central Bank's portal used by supervised entities to submit reports on high-category incidents.",
    url: 'https://portal.e-cbar.az/',
  },
  rfc: { file: null, url: 'https://uploads.cbar.az/assets/02c3d655e376515419c623ce2.pdf' },
  directions: [
    { id: 1, title: 'Obtaining and Sharing of Information on Incidents', body: '<p>FinCERT ensures the centralized collection of information.</p>' },
    { id: 2, title: 'Incident Analysis and Provision of Initial Response Measures', body: '<p>FinCERT identifies the root causes of incidents.</p>' },
  ],
  memberships: [
    {
      id: 1,
      name: 'Forum of Incident Response and Security Teams',
      description: 'International forum of incident response and security teams',
      badge: 'Full member since 2026',
      url: 'https://www.first.org/',
      logo: null,
    },
  ],
}

/** Only the mission and the contacts: the portal, RFC and cooperation sections are left out. */
export const fincertPartial: FincertDto = {
  mission: fincertAz.mission,
  email: fincertAz.email,
  phone: fincertAz.phone,
  portal: null,
  rfc: null,
  directions: [],
  memberships: [],
}

export const fincertEmpty: FincertDto = {
  mission: null,
  email: null,
  phone: null,
  portal: null,
  rfc: null,
  directions: [],
  memberships: [],
}
