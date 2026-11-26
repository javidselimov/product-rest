/**
 * Spec 021 — AZIR səhifəsi (quickstart §5 ssenari 1–7; US1, US3, US4).
 */
import { HttpResponse, http } from 'msw'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { API } from '@/shared/testing/api-base'
import { azirSummaryFixture } from '@/shared/testing/fixtures/stats'
import { renderApp, screen, within } from '@/shared/testing/render'
import { server } from '@/shared/testing/server'
import type { RawSearchParams } from '@/shared/lib/search-params'
import type { Locale } from '@/shared/i18n'

import { AzirView } from '.'
import { azirRangeFromSearchParams, loadAzirPage } from './loader'

vi.mock('echarts/core', () => ({
  use: () => undefined,
  init: () => ({ setOption: () => undefined, resize: () => undefined, dispose: () => undefined }),
}))
vi.mock('echarts/lib/renderer/installCanvasRenderer', () => ({ install: () => undefined }))
vi.mock('echarts/lib/chart/line', () => ({}))
vi.mock('echarts/lib/chart/bar', () => ({}))
vi.mock('echarts/lib/component/grid', () => ({}))
vi.mock('echarts/lib/component/tooltip', () => ({}))
vi.mock('echarts/lib/component/legend', () => ({}))

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date('2026-10-08T12:00:00'))
})
afterEach(() => {
  vi.useRealTimers()
})

function recordRequests() {
  const seen: string[] = []
  server.events.on('request:start', ({ request }) => {
    const url = new URL(request.url)
    seen.push(`${url.pathname}${url.search}`)
  })
  return seen
}

async function renderPage(locale: Locale, searchParams: RawSearchParams = {}) {
  const data = await loadAzirPage(locale, azirRangeFromSearchParams(searchParams))
  renderApp(<AzirView data={data} />, { locale })
  return data
}

function dataTable(name: string) {
  return screen.getByRole('table', { name })
}

function tableDates(name: string) {
  return within(dataTable(name))
    .getAllByRole('row')
    .slice(1)
    .map((row) => within(row).getAllByRole('cell')[0].textContent)
}

const AZ_TITLE = 'Banklararası Təminatsız Pul Bazarında İstinad Faiz Dərəcəsi - AZIR'
const EN_TITLE = 'Benchmark rate in the unsecured interbank money market – AZIR'
const AZ_FOOTNOTE = '*Ehtiyat plan əsasında hesablanmışdır'

describe('AZIR cədvəli və qrafiki (US1)', () => {
  it('default aralıq bu gün − 60 … bu gün, bir sətir sorğusu + summary', async () => {
    const seen = recordRequests()
    const data = await renderPage('az')

    expect(seen.sort()).toEqual(['/api/v1/azir/summary', '/api/v1/azir?from=2026-08-09&to=2026-10-08&term=1D'])
    expect(data.range).toEqual({ from: '2026-08-09', to: '2026-10-08', error: null, isDefault: true })
    expect(screen.getByLabelText('Başlanğıc tarix')).toHaveValue('2026-08-09')
    expect(screen.getByLabelText('Son tarix')).toHaveValue('2026-10-08')
    expect(screen.getByRole('heading', { level: 1, name: AZ_TITLE })).toBeInTheDocument()
  })

  it('tarix azalan, rate 0 olan gün yoxdur, həcm/say formatlanır', async () => {
    await renderPage('az')

    expect(tableDates(AZ_TITLE)).toEqual(['14.09.2026', '12.09.2026', '10.09.2026', '31.08.2026'])
    expect(screen.queryByText('11.09.2026')).not.toBeInTheDocument()

    const row = within(dataTable(AZ_TITLE)).getAllByRole('row')[2]
    expect(within(row).getAllByRole('cell').map((c) => c.textContent)).toEqual(['12.09.2026', '7,25%', '250,00', '21'])
    const empty = within(dataTable(AZ_TITLE)).getAllByRole('row')[1]
    expect(within(empty).getAllByRole('cell').map((c) => c.textContent)).toEqual(['14.09.2026', '7,02%', '—', '—'])
  })

  it('işarəli gündə * və footnote; işarəsiz aralıqda footnote yoxdur', async () => {
    const data = await renderPage('az')

    expect(screen.getByText('7,00% *')).toBeInTheDocument()
    expect(screen.getByText(AZ_FOOTNOTE)).toBeInTheDocument()
    expect(data.hasReservePlan).toBe(true)
  })

  it('bir günlük işarəsiz aralıq: bir sətir, footnote yoxdur', async () => {
    await renderPage('az', { dateFrom: '2026-09-12', dateTo: '2026-09-12' })

    expect(tableDates(AZ_TITLE)).toEqual(['12.09.2026'])
    expect(screen.queryByText(AZ_FOOTNOTE)).not.toBeInTheDocument()
  })

  it('qrafik eyni sətirlərdən, artan sıra və tam tarix etiketi ilə', async () => {
    const data = await renderPage('az')

    expect(data.chart.data?.categories).toEqual(['31.08.2026', '10.09.2026', '12.09.2026', '14.09.2026'])
    expect(data.chart.data?.series[0].data).toEqual([7, 7, 7.25, 7.02])
  })

  it('metodologiya xəbərdarlığı göstərilir', async () => {
    await renderPage('az')

    expect(screen.getByRole('note')).toHaveTextContent(
      '15 may 2025-ci il tarixindən etibarən AZIR indeksləri Mərkəzi Bankın İdarə Heyətinin 06 may 2025-ci il tarixində təsdiqlədiyi metodologiya əsasında açıqlanır.',
    )
  })

  it('/en: etiketlər ingiliscə, onluq ayırıcı nöqtədir', async () => {
    await renderPage('en')

    const headers = within(dataTable(EN_TITLE))
      .getAllByRole('columnheader')
      .map((h) => h.textContent)
    expect(headers).toEqual(['Date', 'Interest rate', 'Value of transactions (mln. AZN)', 'Number of transactions'])
    expect(tableDates(EN_TITLE)[1]).toBe('12/09/2026')
    expect(screen.getByText('7.00% *')).toBeInTheDocument()
    expect(screen.getByText('*Calculated on the basis of the contingency plan')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Download' })).toBeInTheDocument()
  })

  it('boş aralıq boş vəziyyət verir', async () => {
    await renderPage('az', { dateFrom: '2023-01-01', dateTo: '2023-02-01' })

    expect(screen.getAllByText('Seçilmiş dövr üçün məlumat yoxdur.').length).toBeGreaterThan(0)
  })

  it('sətir sorğusu 500 → cədvəl və qrafikdə inline xəta, statistika görünür', async () => {
    server.use(http.get(`${API}/api/v1/azir`, () => new HttpResponse(null, { status: 500 })))
    const data = await renderPage('en')

    expect(data.rows.error).toBe(true)
    expect(data.chart.error).toBe(true)
    expect(screen.getAllByText('A server error occurred. Please try again shortly')).toHaveLength(2)
    expect(screen.getByRole('region', { name: 'Information about the 1D AZIR index' })).toHaveTextContent('147.06')
  })
})

describe('statistika bloku (US3)', () => {
  function summary(name = 'AZIR indeksi ilə bağlı məlumatlar') {
    return within(screen.getByRole('region', { name }))
  }

  it('formatlanmış dəyərlər və işarə', async () => {
    await renderPage('az')

    const rows = summary().getAllByRole('row')
    expect(rows).toHaveLength(11)
    expect(summary().getByRole('rowheader', { name: 'Yenilənmə tarixi' }).nextSibling).toHaveTextContent('12.09.2026')
    expect(summary().getByText('7,25%')).toBeInTheDocument()
    expect(summary().getByText('+0,25')).toBeInTheDocument()
    expect(summary().getByText('+0,75')).toBeInTheDocument()
    expect(summary().getByText('6,90%')).toBeInTheDocument()
    expect(summary().getByText('+30,00')).toBeInTheDocument()
    expect(summary().getByText('147,06')).toBeInTheDocument()
  })

  it('null sahə — göstərir', async () => {
    server.use(
      http.get(`${API}/api/v1/azir/summary`, () =>
        HttpResponse.json({ ...azirSummaryFixture, rateChangeSinceYearEnd: null, lastVolumeUsd: null }),
      ),
    )
    await renderPage('en')

    const block = summary('Information about the 1D AZIR index')
    expect(block.getByRole('rowheader', { name: 'Interest rate change since previous year-end' }).nextSibling).toHaveTextContent('—')
    expect(block.getByRole('rowheader', { name: 'Value of transactions in US dollars, mln USD' }).nextSibling).toHaveTextContent('—')
    expect(block.getByText('+0.25')).toBeInTheDocument()
  })

  it('summary 500 → yalnız blokda xəta, cədvəl və qrafik görünür', async () => {
    server.use(http.get(`${API}/api/v1/azir/summary`, () => new HttpResponse(null, { status: 500 })))
    const data = await renderPage('az')

    expect(data.summary.error).toBe(true)
    expect(data.rows.error).toBe(false)
    expect(summary().getByText('Serverdə xəta baş verdi. Bir azdan yenidən cəhd edin')).toBeInTheDocument()
    expect(screen.getAllByText('Serverdə xəta baş verdi. Bir azdan yenidən cəhd edin')).toHaveLength(1)
    expect(tableDates(AZ_TITLE)).toHaveLength(4)
  })

  it('filtr dəyişəndə blok dəyişmir', async () => {
    const seen = recordRequests()
    const first = await loadAzirPage('az', azirRangeFromSearchParams({}))
    const second = await loadAzirPage('az', azirRangeFromSearchParams({ dateFrom: '2025-01-01', dateTo: '2025-12-31' }))

    expect(second.summary.data).toEqual(first.summary.data)
    expect(seen.filter((p) => p.startsWith('/api/v1/azir/summary'))).toEqual(['/api/v1/azir/summary', '/api/v1/azir/summary'])
  })
})

describe('tarix filtri (US4)', () => {
  it('yanvar aralığı yalnız yanvarı göstərir', async () => {
    await renderPage('az', { dateFrom: '2025-01-01', dateTo: '2025-01-31' })

    expect(tableDates(AZ_TITLE)).toEqual(['15.01.2025'])
    expect(screen.getByLabelText('Başlanğıc tarix')).toHaveValue('2025-01-01')
  })

  it('order xətası: inline mesaj, default aralıq göstərilir', async () => {
    const data = await renderPage('az', { dateFrom: '2026-10-01', dateTo: '2026-09-01' })

    expect(data.range.error).toBe('order')
    expect(screen.getByRole('alert')).toHaveTextContent('Başlanğıc tarix son tarixdən sonra ola bilməz.')
    expect(screen.getByLabelText('Başlanğıc tarix')).toHaveValue('2026-08-09')
    expect(tableDates(AZ_TITLE)).toHaveLength(4)
  })

  it('format xətası', async () => {
    await renderPage('en', { dateFrom: 'abc' })

    expect(screen.getByRole('alert')).toHaveTextContent('The date is not valid.')
    expect(screen.getByLabelText('To')).toHaveValue('2026-10-08')
  })

  it('tooLong xətası', async () => {
    await renderPage('az', { dateFrom: '2000-01-01', dateTo: '2026-01-01' })

    expect(screen.getByRole('alert')).toHaveTextContent('Aralıq 10 ildən uzun ola bilməz.')
  })
})

describe('Excel linki (US5)', () => {
  it('effektiv aralıqla export marşrutuna aparır', async () => {
    await renderPage('az', { dateFrom: '2026-09-01' })

    expect(screen.getByRole('link', { name: 'Yüklə' })).toHaveAttribute(
      'href',
      '/az/statistics/azir/export?dateFrom=2026-09-01&dateTo=2026-10-08',
    )
  })

  it('səhv aralıqda link default aralığa aparır', async () => {
    await renderPage('en', { dateFrom: 'abc' })

    expect(screen.getByRole('link', { name: 'Download' })).toHaveAttribute(
      'href',
      '/en/statistics/azir/export?dateFrom=2026-08-09&dateTo=2026-10-08',
    )
  })
})
