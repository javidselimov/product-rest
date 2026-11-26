/**
 * Information disclosure schedule (spec 039, `contracts/public-api.md`). Rows from the migrated table
 * of CMS page 130; every timing mode and a row without periodicity are present.
 */
import type { ReleaseSchedule } from '@/features/release-schedule/model/schemas'

export const releaseScheduleAz: ReleaseSchedule = {
  groups: [
    {
      id: 1,
      name: 'Pul və məzənnə siyasəti üzrə',
      items: [
        { id: 1, title: 'Pul siyasətinin əsas istiqamətləri (Bəyanat)', periodicity: 'İllik', timing: 'Dekabr ayının 31-dək', timingMode: 'text', timingUrl: null },
        { id: 2, title: 'Pul siyasəti ilə bağlı qəbul olunan qərarlar', periodicity: 'Qərar müvafiq qaydada təsdiq edildikdə', timing: 'Qrafikə uyğun', timingMode: 'decisions', timingUrl: null },
        { id: 6, title: 'İllik inflyasiya', periodicity: 'Aylıq', timing: 'Növbəti ayın 20-dək', timingMode: 'text', timingUrl: null },
      ],
    },
    {
      id: 2,
      name: 'Normativ-hüquqi baza üzrə',
      items: [
        { id: 10, title: 'Normativ-xarakterli aktlar', periodicity: 'İnformasiyanın dəyişməsindən asılı olaraq', timing: 'Reyestrə daxil edildikdən sonra', timingMode: 'link', timingUrl: 'https://e-qanun.az' },
        { id: 12, title: 'Statistik hesabatların yayımlanması qrafiki', periodicity: null, timing: null, timingMode: 'link', timingUrl: '/statistik-hesabatlarin-yayimlanmasi-qrafiki' },
      ],
    },
  ],
  decisions: {
    year: 2026,
    dates: [
      { date: '2026-02-04', withPressConference: true },
      { date: '2026-04-02', withPressConference: false },
      { date: '2026-05-06', withPressConference: true },
      { date: '2026-06-24', withPressConference: false },
      { date: '2026-07-31', withPressConference: true },
      { date: '2026-09-23', withPressConference: false },
      { date: '2026-10-29', withPressConference: true },
      { date: '2026-12-23', withPressConference: false },
    ],
    next: { date: '2026-12-23', withPressConference: false },
  },
}

export const releaseScheduleEn: ReleaseSchedule = {
  groups: [
    {
      id: 1,
      name: 'Monetary and exchange rate policy',
      items: [
        { id: 2, title: 'Monetary policy related decisions', periodicity: 'When decisions are accordingly approved', timing: 'According to the schedule', timingMode: 'decisions', timingUrl: null },
      ],
    },
  ],
  decisions: releaseScheduleAz.decisions,
}

/** CMS page 130 as stored: an intro paragraph, then the old hand-typed table. */
export const releaseSchedulePageContent =
  '<p>Mərkəzi Bankın internet saytında yerləşdirilən məlumatların növləri aşağıdakı cədvəldə göstərilib.</p>' +
  '<table><tbody><tr><td><p>Köhnə cədvəlin sətri</p></td><td><p>Aylıq</p></td></tr></tbody></table>'
