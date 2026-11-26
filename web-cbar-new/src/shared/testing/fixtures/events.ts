/** Event samples, in the shape of `GET /api/v1/events` (spec 034). `today` for these is 2026-11-04. */

export const eventCategories = [
  { id: 1, name: 'Pul siyasəti' },
  { id: 2, name: 'Beynəlxalq' },
  { id: 3, name: 'Maliyyə sabitliyi' },
]

const base = {
  type: null as number | null,
  category: null as { id: number; name: string } | null,
  endsOn: null as string | null,
  startTime: null as string | null,
  location: null as string | null,
  pageSlug: null as string | null,
}

export const upcomingEvents = [
  {
    ...base,
    id: 1,
    title: 'Maliyyə Sabitliyi Hesabatının təqdimatı',
    slug: 'hesabat-teqdimati',
    type: 2,
    category: eventCategories[2],
    startsOn: '2026-11-04',
    startTime: '12:00',
    location: 'Onlayn',
    upcoming: true,
  },
  {
    ...base,
    id: 2,
    title: 'Saatsız tədbir',
    slug: 'saatsiz-tedbir',
    type: 4,
    startsOn: '2026-11-18',
    location: 'Bakı',
    upcoming: true,
  },
  {
    ...base,
    id: 3,
    title: 'Faiz dəhlizinə dair qərar',
    slug: 'faiz-dehlizi',
    type: 1,
    category: eventCategories[0],
    startsOn: '2026-12-23',
    startTime: '11:00',
    location: 'Mərkəzi Bank, Bakı',
    upcoming: true,
  },
]

export const pastEvents = [
  {
    ...base,
    id: 10,
    title: 'TDT mərkəzi banklar Şurasının toplantısı',
    slug: 'tdt-toplantisi',
    type: 3,
    category: eventCategories[1],
    startsOn: '2026-06-04',
    endsOn: '2026-06-05',
    location: 'Bakı',
    upcoming: false,
  },
  {
    ...base,
    id: 11,
    title: 'COP29',
    slug: 'cop29',
    startsOn: '2024-11-14',
    upcoming: false,
    pageSlug: 'cop29',
  },
]

export const eventDetail = {
  ...pastEvents[0],
  content: '<p>Bakı şəhərində toplantı keçirilib.</p>',
  gallery: {
    title: 'TDT',
    images: [
      { mediaId: 1820, url: '/media/1820' },
      { mediaId: 1821, url: '/media/1821' },
    ],
  },
  pressRelease: { title: 'TDT relizi', slug: 'tdt-relizi' },
}

export const upcomingEventDetail = { ...upcomingEvents[0], content: null, gallery: null, pressRelease: null }
