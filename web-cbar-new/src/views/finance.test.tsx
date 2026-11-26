/**
 * US4 — məzənnə vərəqi, statistika, MEAS (quickstart §4 ssenari 13–15).
 */
import { HttpResponse, http } from 'msw'
import { describe, expect, it, vi } from 'vitest'

import { API } from '@/shared/testing/api-base'
import { renderApp, screen, within } from '@/shared/testing/render'
import { server } from '@/shared/testing/server'

import { CurrenciesView } from './currencies'
import { loadCurrencies } from './currencies/loader'
import { SecuritiesView } from './securities'
import { loadSecurities } from './securities/loader'
import { StatisticsView } from './statistics'
import { loadStatistics } from './statistics/loader'

vi.mock('echarts/core', () => ({
  use: () => undefined,
  init: () => ({ setOption: () => undefined, resize: () => undefined, dispose: () => undefined }),
}))
// Leaf modullar yan təsirlidir (özləri qeydiyyatdan keçir) — boş mock kifayətdir;
// renderer istisnadır, chart.tsx onun install-ını açıq çağırır (spec 003 FR-014).
vi.mock('echarts/lib/renderer/installCanvasRenderer', () => ({ install: () => undefined }))
vi.mock('echarts/lib/chart/line', () => ({}))
vi.mock('echarts/lib/chart/bar', () => ({}))
vi.mock('echarts/lib/component/grid', () => ({}))
vi.mock('echarts/lib/component/tooltip', () => ({}))
vi.mock('echarts/lib/component/legend', () => ({}))

function recordRequests() {
  const seen: string[] = []
  server.events.on('request:start', ({ request }) => {
    const url = new URL(request.url)
    seen.push(`${url.pathname}${url.search}`)
  })
  return seen
}

describe('məzənnə vərəqi', () => {
  it('tarix parametri, sıra, 4 onluq və XML keçidi', async () => {
    const data = await loadCurrencies('az', { date: '2026-09-14' })
    renderApp(<CurrenciesView data={data} />, { locale: 'az' })

    expect(data.sheet?.xmlUrl).toBe(`${API}/currencies/14.09.2026.xml`)
    const rows = within(screen.getByRole('table')).getAllByRole('row').slice(1)
    expect(rows.map((r) => within(r).getAllByRole('cell')[0].textContent)).toEqual(['USD', 'EUR', 'RUB', 'TRY', 'GBP'])
    expect(screen.getByText('1.8123')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /XML formatında yüklə/ })).toHaveAttribute('href', `${API}/currencies/14.09.2026.xml`)
    expect(screen.getByLabelText('Məzənnə tarixi')).toHaveValue('2026-09-14')
  })

  it('vərəq yoxdursa boş vəziyyət; yanlış tarix parametrsiz sorğuya düşür', async () => {
    const missing = await loadCurrencies('az', { date: '2026-09-13' })
    renderApp(<CurrenciesView data={missing} />, { locale: 'az' })
    expect(screen.getByText('Seçilmiş tarix üçün məzənnə vərəqi yoxdur')).toBeInTheDocument()

    const seen = recordRequests()
    await loadCurrencies('en', { date: '14.09.2026' })
    expect(seen).toEqual(['/api/v1/currencies?locale=en'])
  })
})

describe('statistika', () => {
  it('parametrsiz üç sorğu, üç qrafik kartı', async () => {
    const seen = recordRequests()
    const data = await loadStatistics('az')
    renderApp(<StatisticsView data={data} />, { locale: 'az' })

    expect(seen).toEqual(
      expect.arrayContaining(['/api/v1/azir', `/api/v1/inflation?year=${new Date().getFullYear()}`, '/api/v1/yield-curves/latest']),
    )
    expect(seen).toHaveLength(3)
    expect(screen.getByText('AZIR — banklararası faiz dərəcəsi')).toBeInTheDocument()
    expect(data.azir.data?.series.map((s) => s.name)).toContain('1D')
    expect(data.yieldCurve.caption).toContain('Nelson-Siegel')
  })

  it('bir endpoint xəta verəndə yalnız həmin kart xəta göstərir', async () => {
    server.use(http.get(`${API}/api/v1/azir`, () => new HttpResponse(null, { status: 500 })))
    const data = await loadStatistics('en')
    renderApp(<StatisticsView data={data} />, { locale: 'en' })

    expect(data.azir.error).toBe(true)
    expect(data.inflation.error).toBe(false)
    expect(screen.getAllByText('A server error occurred. Please try again shortly')).toHaveLength(1)
  })
})

describe('MEAS', () => {
  it('filtrlər, cədvəl, fayl keçidləri və səhifələmə', async () => {
    const data = await loadSecurities('az', { emitentId: '1', page: '1' })
    renderApp(<SecuritiesView data={data} />, { locale: 'az' })

    expect(screen.getByRole('combobox', { name: 'Emitent' })).toHaveValue('1')
    expect(data.rows?.every((r) => r.emitentName === 'Kapital Bank')).toBe(true)
    expect(screen.getAllByRole('link', { name: 'Yüklə' })[0]).toHaveAttribute('href', `/media/1000`)
    expect(screen.getAllByText('—').length).toBeGreaterThan(0)
  })

  it('bir sorğu uğursuz olanda səhifə xəta göstərir', async () => {
    server.use(http.get(`${API}/api/v1/meas-emitents`, () => new HttpResponse(null, { status: 500 })))
    const data = await loadSecurities('az', {})
    renderApp(<SecuritiesView data={data} />, { locale: 'az' })

    expect(data.error).toBe(true)
    expect(screen.getByText('Serverdə xəta baş verdi. Bir azdan yenidən cəhd edin')).toBeInTheDocument()
  })

  it('boş nəticə boş vəziyyət verir', async () => {
    const data = await loadSecurities('en', { page: '99' })
    renderApp(<SecuritiesView data={data} />, { locale: 'en' })

    expect(screen.getByText('There is no content in this section yet')).toBeInTheDocument()
  })
})
