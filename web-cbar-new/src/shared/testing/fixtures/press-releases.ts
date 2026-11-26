import type { MediaAsset } from '@/entities/content'

import { makeMediaAsset } from '../factories'

/** List item as the API sends it — `type` is the numeric API code. */
export type RawListItem = {
  id: number
  type: 1 | 2 | 3
  title: string
  slug: string
  publishedAt: string
  imageUrl: string | null
}
/** `locale` exists in the database only: `api-cbar` filters by it and never sends it (spec 033). */
export type RawAsset = MediaAsset & { locale?: 'az' | 'en' }
type RawDetail = RawListItem & { content: string | null; assets: RawAsset[] }

/** Interviews and speeches (`type=3`). Item 2 has no photo: the card keeps its grey box. */
export const interviewItems: RawListItem[] = [
  { title: 'COP29-dan sonrakı dövr', slug: 'cop29-sonrasi', imageUrl: '/media/851' },
  { title: 'Toronto Mərkəzinin müsahibəsi', slug: 'toronto-merkezi', imageUrl: null },
  { title: 'Reuters TV-yə müsahibə', slug: 'reuters-tv', imageUrl: '/media/854' },
  { title: 'Nazirlər Kabinetində çıxış', slug: 'nk-cixis', imageUrl: '/media/856' },
  { title: 'Global Finance müsahibəsi', slug: 'global-finance', imageUrl: null },
  { title: 'Reuters agentliyinə müsahibə', slug: 'reuters-agentliyi', imageUrl: null },
].map((item, i) => ({ ...item, id: 300 + i, type: 3 as const, publishedAt: `2026-08-${String(20 - i).padStart(2, '0')}T09:00:00+00:00` }))

/** Titles the search tests look for — note the different letter case. */
const WORLD_BANK_TITLES: Record<number, string> = {
  2: 'Mərkəzi Bankın sədri Dünya Bankının nümayəndə heyəti ilə görüşüb',
  // Upper-case "I" would lower to "i", not "ı", in both Postgres ILIKE and JS — keep it out.
  6: 'DÜNYA Bankı ilə texniki yardım layihəsi müzakirə olunub',
  11: 'Dünya bankı hesabatı təqdim edilib',
}

/**
 * News (`type=1`), newest first, one item per day from 30.09.2026 down to 08.09.2026.
 * Item 5 is published at 20:30 UTC, which is already the next day in Baku (+04:00) —
 * date filter tests rely on it.
 */
export const pressReleaseItems: RawListItem[] = Array.from({ length: 23 }, (_, i) => ({
  id: 100 + i,
  type: 1,
  title: i === 0 ? 'Uçot dərəcəsi dəyişməz saxlanılıb' : (WORLD_BANK_TITLES[i] ?? `Press reliz ${i + 1}`),
  slug: i === 0 ? 'ucot-derecesi' : `press-reliz-${i + 1}`,
  publishedAt: i === 5 ? '2026-09-24T20:30:00+00:00' : `2026-09-${String(30 - i).padStart(2, '0')}T09:00:00+00:00`,
  imageUrl: i % 3 === 0 ? `/media/${700 + i}` : null,
}))

/** Announcements (`type=2`). Item 1 has an `imageUrl` — the API still computes it, the text card (spec 031) ignores it. */
export const announcementItems: RawListItem[] = Array.from({ length: 4 }, (_, i) => ({
  id: 200 + i,
  type: 2,
  title: `Elan ${i + 1}`,
  slug: `elan-${i + 1}`,
  publishedAt: '2026-09-05T09:00:00+00:00',
  imageUrl: i === 0 ? `/media/821` : null,
}))

const image = (mediaId: number, n: number) =>
  makeMediaAsset({ mediaId, originalName: `foto-${n}.jpg`, mimeType: 'image/jpeg', url: `/media/${mediaId}` })

/** News with a cover, four more photos for the gallery and one PDF (API `SortOrder`). */
export const pressReleaseDetailFixture: RawDetail = {
  ...pressReleaseItems[0]!,
  content:
    '<p>Mərkəzi Bankın İdarə Heyəti uçot dərəcəsini <strong>7,25%</strong> səviyyəsində saxlamaq qərarına gəlib. <a href="/media/12">Qərar</a>.</p><p>Faiz dəhlizinin aşağı həddi 6,25%, yuxarı həddi 8,25% səviyyəsindədir.</p>',
  assets: [
    image(811, 1),
    image(812, 2),
    makeMediaAsset({ mediaId: 801, originalName: 'qerar.pdf', url: '/media/801' }),
    image(813, 3),
    image(814, 4),
    image(815, 5),
  ],
}

/** Announcement with a single photo and a PDF — on the site (spec 031) both are plain attachments. */
export const announcementDetailFixture: RawDetail = {
  ...announcementItems[0]!,
  content: '<p>Elan mətni.</p>',
  assets: [image(821, 1), makeMediaAsset({ mediaId: 822, originalName: 'elan.pdf', url: '/media/822' })],
}

/** News without photos — only a PDF attachment. */
export const noImageDetailFixture: RawDetail = {
  ...pressReleaseItems[1]!,
  content: '<p>Şəkilsiz xəbər.</p>',
  assets: [makeMediaAsset({ mediaId: 831, originalName: 'hesabat.pdf', url: '/media/831' })],
}

/** News with a single photo — cover only, no gallery. */
export const singlePhotoDetailFixture: RawDetail = {
  ...pressReleaseItems[3]!,
  content: '<p>Bir şəkilli xəbər.</p>',
  assets: [image(841, 1)],
}

const pdfAsset = (mediaId: number, originalName: string) => makeMediaAsset({ mediaId, originalName, url: `/media/${mediaId}` })

/** Interview with text, a card photo and one PDF (spec 033). */
export const interviewDetailFixture: RawDetail = {
  ...interviewItems[0]!,
  content: '<p><strong>Sual: dayanıqlı maliyyə nədir?</strong></p><p>Cavab mətni.</p>',
  assets: [image(851, 1), pdfAsset(852, '324c1a24.pdf')],
}

/** Scanned interview: only the PDF. The editor saves an empty field as an empty paragraph. */
export const interviewScanFixture: RawDetail = {
  ...interviewItems[1]!,
  content: '<p></p>',
  assets: [pdfAsset(853, 'skan.pdf')],
}

/** Interview with text and no PDF. */
export const interviewTextOnlyFixture: RawDetail = {
  ...interviewItems[2]!,
  content: '<p>Yalnız mətn.</p>',
  assets: [image(854, 1)],
}

/** Two PDFs and two photos in editor order. */
export const interviewManyFilesFixture: RawDetail = {
  ...interviewItems[3]!,
  content: '<p>Çıxışın mətni.</p>',
  assets: [pdfAsset(855, 'cixis.pdf'), image(856, 1), pdfAsset(857, 'elave.pdf'), image(858, 2)],
}

/** One PDF per language plus a file for both. */
export const interviewBilingualFixture: RawDetail = {
  ...interviewItems[4]!,
  content: '<p>İki dilli material.</p>',
  assets: [
    { ...pdfAsset(861, 'az-versiya.pdf'), locale: 'az' },
    { ...pdfAsset(862, 'en-version.pdf'), locale: 'en' },
    pdfAsset(863, 'cedvel.pdf'),
  ],
}

/** The English file is missing, as with Global Finance. */
export const interviewAzOnlyFixture: RawDetail = {
  ...interviewItems[5]!,
  content: '<p>Yalnız AZ faylı var.</p>',
  assets: [{ ...pdfAsset(864, 'yalniz-az.pdf'), locale: 'az' }],
}
