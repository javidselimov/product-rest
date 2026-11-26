// @vitest-environment node
/**
 * Spec 021 — AZIR export route-u (contracts/web-routes.md §2, T053).
 * Faylın məzmunu `shared/lib/xlsx` və `azir-export` testlərindədir; burada cavabın özü yoxlanılır.
 */
import { HttpResponse, http } from 'msw'
import { NextRequest } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { API } from '@/shared/testing/api-base'
import { server } from '@/shared/testing/server'

import { GET } from './route'

const XLSX_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date('2026-10-08T12:00:00'))
})
afterEach(() => {
  vi.useRealTimers()
})

function call(locale: string, query: string) {
  const request = new NextRequest(`http://localhost/${locale}/statistics/azir/export${query}`)
  return GET(request, { params: Promise.resolve({ locale }) })
}

/** ZIP-də fayl adları sıxılmamış saxlanılır — vərəqin olub-olmadığını baytlardan oxumaq olur. */
async function partNames(response: Response) {
  return Buffer.from(await response.arrayBuffer()).toString('latin1')
}

describe('GET /{locale}/statistics/azir/export', () => {
  it('200: xlsx, attachment adı aralıqla, private keş', async () => {
    const response = await call('az', '?dateFrom=2026-08-01&dateTo=2026-09-30')

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toBe(XLSX_TYPE)
    expect(response.headers.get('content-disposition')).toBe(
      `attachment; filename="AZIR-1D_2026-08-01_2026-09-30.xlsx"; filename*=UTF-8''AZIR-1D_2026-08-01_2026-09-30.xlsx`,
    )
    expect(response.headers.get('cache-control')).toBe('private, max-age=60')

    const body = await partNames(response)
    expect(body.startsWith('PK')).toBe(true)
    expect(body).toContain('xl/worksheets/sheet1.xml')
    // 2026-08-31 ehtiyat plan işarəlidir → "Qeydlər" vərəqi var.
    expect(body).toContain('xl/worksheets/sheet2.xml')
  })

  it('işarəli gün olmayan aralıqda yalnız bir vərəq', async () => {
    const response = await call('en', '?dateFrom=2026-09-12&dateTo=2026-09-12')

    expect(response.status).toBe(200)
    const body = await partNames(response)
    expect(body).toContain('xl/worksheets/sheet1.xml')
    expect(body).not.toContain('xl/worksheets/sheet2.xml')
  })

  it('səhv aralıq → 400 lokal mətn', async () => {
    const response = await call('az', '?dateFrom=2026-10-01&dateTo=2026-09-01')

    expect(response.status).toBe(400)
    expect(response.headers.get('content-type')).toContain('text/plain')
    expect(await response.text()).toBe('Başlanğıc tarix son tarixdən sonra ola bilməz.')
  })

  it('api-cbar xətası → 502', async () => {
    server.use(http.get(`${API}/api/v1/azir`, () => new HttpResponse(null, { status: 500 })))

    const response = await call('az', '?dateFrom=2026-08-01&dateTo=2026-09-30')

    expect(response.status).toBe(502)
    expect(response.headers.get('content-type')).toContain('text/plain')
  })

  it('dəstəklənməyən dil → 404', async () => {
    const response = await call('ru', '')
    expect(response.status).toBe(404)
  })
})
