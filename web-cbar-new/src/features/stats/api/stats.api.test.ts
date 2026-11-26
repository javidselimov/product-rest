import { HttpResponse, http } from 'msw'
import { describe, expect, it } from 'vitest'

import { API } from '@/shared/testing/api-base'
import { server } from '@/shared/testing/server'

import {
  getAzir,
  getAzirSummary,
  getInflation,
  getYieldCurve,
  getYieldCurveLatest,
} from './stats.api'

describe('stats api', () => {
  it('azir parametrsiz çağırılanda sorğu sətri yoxdur', async () => {
    const seen: string[] = []
    server.use(
      http.get(`${API}/api/v1/azir`, ({ request }) => {
        seen.push(new URL(request.url).search)
        return HttpResponse.json([])
      }),
    )

    await getAzir()
    await getAzir({ from: '2026-01-01', term: '1D' })
    await getAzir({ from: '2026-01-01', to: '2026-01-31', term: '1D' })

    expect(seen).toEqual(['', '?from=2026-01-01&term=1D', '?from=2026-01-01&to=2026-01-31&term=1D'])
  })

  it('azir sətirləri from/to ilə süzülür, yeni sahələr gəlir', async () => {
    const rows = await getAzir({ from: '2026-08-31', to: '2026-09-12', term: '1D' })

    expect(rows.map((r) => r.valueDate)).toEqual(['2026-08-31', '2026-09-10', '2026-09-11', '2026-09-12'])
    expect(rows[0]).toMatchObject({ isReservePlan: true, dealVolume: 220 })
  })

  it('azir summary sxemə uyğundur', async () => {
    const summary = await getAzirSummary()

    expect(summary.lastDate).toBe('2026-09-12')
    expect(summary.lastVolumeUsd).toBe(147.06)
  })

  it('inflation year yalnız verildikdə göndərilir', async () => {
    const all = await getInflation()
    const year = await getInflation(2026)

    expect(all.length).toBeGreaterThan(year.length)
    expect(year.every((v) => v.year === 2026)).toBe(true)
  })

  it('yield curve latest və tarixlə; 404 → null', async () => {
    const latest = await getYieldCurveLatest()
    expect(latest?.yields).toHaveLength(5)

    const dated = await getYieldCurve('2026-08-01')
    expect(dated?.curveDate).toBe('2026-08-01')

    await expect(getYieldCurve('1999-01-01')).resolves.toBeNull()
  })
})
