import { HttpResponse, http } from 'msw'

import { safeDecodeURIComponent } from '@/shared/lib/uri'

import { API } from '../api-base'
import { paginate } from '../factories'
import {
  announcementDetailFixture,
  announcementItems,
  interviewAzOnlyFixture,
  interviewBilingualFixture,
  interviewDetailFixture,
  interviewItems,
  interviewManyFilesFixture,
  interviewScanFixture,
  interviewTextOnlyFixture,
  noImageDetailFixture,
  pressReleaseDetailFixture,
  pressReleaseItems,
  singlePhotoDetailFixture,
  type RawAsset,
} from '../fixtures/press-releases'

const BAKU_OFFSET_MS = 4 * 60 * 60 * 1000
const DATE = /^\d{4}-\d{2}-\d{2}$/

const withoutLocale = (asset: RawAsset) => {
  const copy = { ...asset }
  delete copy.locale
  return copy
}

/** Publication day in Baku (`YYYY-MM-DD`) — the API's date filter works on Baku days. */
const bakuDay = (iso: string) => new Date(new Date(iso).getTime() + BAKU_OFFSET_MS).toISOString().slice(0, 10)

const details = [
  pressReleaseDetailFixture,
  announcementDetailFixture,
  noImageDetailFixture,
  singlePhotoDetailFixture,
  interviewDetailFixture,
  interviewScanFixture,
  interviewTextOnlyFixture,
  interviewManyFilesFixture,
  interviewBilingualFixture,
  interviewAzOnlyFixture,
]

/** Mirrors `api-cbar` `GET /press-releases` filtering (contracts/public-api.md §1). */
export const pressReleasesHandlers = [
  http.get(`${API}/api/v1/press-releases`, ({ request }) => {
    const params = new URL(request.url).searchParams
    const page = Number(params.get('page') ?? '1')
    const pageSize = Number(params.get('pageSize') ?? '10')
    const type = params.get('type')
    const q = params.get('q')?.trim() ?? ''
    const from = params.get('from')
    const to = params.get('to')

    if (q.length > 200 || [from, to].some((d) => d !== null && !DATE.test(d))) {
      return HttpResponse.json({ title: 'Bad Request', status: 400 }, { status: 400 })
    }

    const byType = { '1': pressReleaseItems, '2': announcementItems, '3': interviewItems } as Record<string, typeof pressReleaseItems>
    const source = (type && byType[type]) || [...pressReleaseItems, ...announcementItems, ...interviewItems]
    const needle = q.toLowerCase()
    const items = source.filter(
      (item) =>
        (!needle || item.title.toLowerCase().includes(needle)) &&
        (!from || bakuDay(item.publishedAt) >= from) &&
        (!to || bakuDay(item.publishedAt) <= to),
    )
    return HttpResponse.json(paginate(items, page, pageSize))
  }),

  http.get(`${API}/api/v1/press-releases/:slug`, ({ params, request }) => {
    const slug = safeDecodeURIComponent(String(params.slug))
    if (slug === 'yoxdur') return new HttpResponse(null, { status: 404 })
    const detail = details.find((d) => d.slug === slug) ?? { ...pressReleaseDetailFixture, slug }
    // Spec 033: the API leaves out files of the other language and does not send `locale`.
    const locale = new URL(request.url).searchParams.get('locale')
    const assets = detail.assets.filter((asset) => !asset.locale || asset.locale === locale).map(withoutLocale)
    return HttpResponse.json({ ...detail, assets })
  }),
]
