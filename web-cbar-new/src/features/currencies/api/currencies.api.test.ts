import { HttpResponse, http } from 'msw'
import { describe, expect, it } from 'vitest'

import { API } from '@/shared/testing/api-base'
import { server } from '@/shared/testing/server'

import { formatRate, rateTrend } from '../model/schemas'
import { getCurrencies, previousSheet, xmlFeedUrl } from './currencies.api'

describe('currencies api', () => {
  it('tarixsiz sorğu bugünkü vərəqi verir', async () => {
    const sheet = await getCurrencies('az')

    expect(sheet?.date).toBe('2026-09-14')
    expect(sheet?.rates.filter((r) => r.showOnHomepage)).toHaveLength(4)
  })

  it('date parametri yalnız verildikdə göndərilir', async () => {
    const seen: string[] = []
    server.use(
      http.get(`${API}/api/v1/currencies`, ({ request }) => {
        seen.push(new URL(request.url).search)
        return new HttpResponse(null, { status: 404 })
      }),
    )

    await getCurrencies('en')
    await getCurrencies('en', '2026-01-02')

    expect(seen).toEqual(['?locale=en', '?locale=en&date=2026-01-02'])
  })

  it('vərəq olmayan tarixdə null', async () => {
    await expect(getCurrencies('az', '2026-09-13')).resolves.toBeNull()
  })

  it('previousSheet həftə sonunu atlayıb ilk tapılan vərəqi qaytarır', async () => {
    const previous = await previousSheet('az', '2026-09-14')

    expect(previous?.date).toBe('2026-09-12')
  })

  it('previousSheet 5 gündən çox geri getmir', async () => {
    let calls = 0
    server.use(
      http.get(`${API}/api/v1/currencies`, () => {
        calls += 1
        return new HttpResponse(null, { status: 404 })
      }),
    )

    await expect(previousSheet('az', '2026-09-14')).resolves.toBeNull()
    expect(calls).toBe(5)
  })

  it('xmlFeedUrl DD.MM.YYYY formatını saxlayır', () => {
    expect(xmlFeedUrl('2026-09-04')).toBe('http://localhost:5139/currencies/04.09.2026.xml')
  })

  it('trend və format köməkçiləri', () => {
    expect(rateTrend(1.985, 1.99)).toBe('down')
    expect(rateTrend(1.7, 1.7)).toBe('flat')
    expect(rateTrend(1.8, undefined)).toBe('flat')
    expect(formatRate(1.7)).toBe('1.7000')
  })
})
