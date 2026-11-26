/**
 * Yönləndirmə cədvəli (spec 002 contracts/routes.md §2, quickstart §4 ssenari 1).
 */
import { NextRequest } from 'next/server'
import { describe, expect, it } from 'vitest'

import { CSP_HEADER, NONCE_HEADER } from '@/shared/config/security-headers'

import { config, proxy } from './proxy'

function request(path: string, cookies: Record<string, string> = {}) {
  const cookieHeader = Object.entries(cookies)
    .map(([name, value]) => `${name}=${value}`)
    .join('; ')

  return new NextRequest(`http://localhost:3001${path}`, {
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
  })
}

function location(response: Response | undefined): string | null {
  return response?.headers.get('location') ?? null
}

describe('locale yönləndirməsi', () => {
  it('kök ünvan /az-a gedir', () => {
    expect(location(proxy(request('/')))).toBe('http://localhost:3001/az')
  })

  it('prefikssiz yol az prefiksi alır və sorğu parametrləri qorunur', () => {
    expect(location(proxy(request('/laws?type=law&page=2')))).toBe(
      'http://localhost:3001/az/laws?type=law&page=2',
    )
  })

  it('307 status ilə yönləndirir', () => {
    expect(proxy(request('/press-releases'))?.status).toBe(307)
  })

  it('NEXT_LOCALE cookie-si oxunmur — həmişə az', () => {
    expect(location(proxy(request('/laws', { NEXT_LOCALE: 'en' })))).toBe(
      'http://localhost:3001/az/laws',
    )
  })

  it('/az və /en yolları ötürülür', () => {
    expect(location(proxy(request('/az/laws')))).toBeNull()
    expect(location(proxy(request('/en/laws?page=3')))).toBeNull()
  })

  it('dəstəklənməyən dil kodu yönləndirilmir — 404-ə buraxılır', () => {
    expect(location(proxy(request('/ru')))).toBeNull()
    expect(location(proxy(request('/ru/laws')))).toBeNull()
    expect(location(proxy(request('/pt-BR/x')))).toBeNull()
  })
})

describe('köhnə URL xəritəsi (spec 021 contracts/web-routes.md §3)', () => {
  const base = 'http://localhost:3001'

  it.each([
    ['/indeks/rates', '/az/statistics/azir'],
    ['/indeks/rates/', '/az/statistics/azir'],
    ['/INDEKS/Rates', '/az/statistics/azir'],
    ['/indeks/rates?language=en', '/en/statistics/azir'],
    ['/indeks/rates?language=az', '/az/statistics/azir'],
    ['/az/indeks/rates', '/az/statistics/azir'],
    ['/en/indeks/rates', '/en/statistics/azir'],
    ['/EN/indeks/rates/', '/en/statistics/azir'],
    ['/indeks/rates?foo=1&page=2', '/az/statistics/azir'],
  ])('%s → %s (308)', (from, to) => {
    const response = proxy(request(from))

    expect(response?.status).toBe(308)
    expect(location(response)).toBe(`${base}${to}`)
  })

  it.each([
    ['/indeks/rates?dateFrom=01/09/2026&dateTo=30/09/2026', '/az/statistics/azir?dateFrom=2026-09-01&dateTo=2026-09-30'],
    ['/indeks/rates?dateFrom=01%2F09%2F2026&dateTo=30%2F09%2F2026', '/az/statistics/azir?dateFrom=2026-09-01&dateTo=2026-09-30'],
    ['/indeks/rates?dateFrom=31/02/2026&dateTo=30/09/2026', '/az/statistics/azir?dateTo=2026-09-30'],
    ['/indeks/rates?dateFrom=abc', '/az/statistics/azir'],
  ])('tarixlər d/m/Y → ISO: %s', (from, to) => {
    expect(location(proxy(request(from)))).toBe(`${base}${to}`)
  })

  it('export=true export marşrutuna aparır', () => {
    expect(location(proxy(request('/indeks/rates?language=en&export=true')))).toBe(`${base}/en/statistics/azir/export`)
    expect(
      location(proxy(request('/indeks/rates?export=true&dateFrom=01/09/2026&dateTo=30/09/2026'))),
    ).toBe(`${base}/az/statistics/azir/export?dateFrom=2026-09-01&dateTo=2026-09-30`)
  })

  it.each([
    ['/gallery/photos', '/az/media/galleries'],
    ['/gallery/photos/', '/az/media/galleries'],
    ['/gallery/photos/detail/5', '/az/media/galleries/5'],
    ['/gallery/photos/detail/5?language=en', '/en/media/galleries/5'],
    ['/en/gallery/photos', '/en/media/galleries'],
    ['/videos', '/az/media/videos'],
    ['/videos/?language=en', '/en/media/videos'],
    ['/az/videos', '/az/media/videos'],
  ])('media köhnə yolları (spec 028 FR-016): %s → %s', (from, to) => {
    const response = proxy(request(from))

    expect(response?.status).toBe(308)
    expect(location(response)).toBe(`${base}${to}`)
  })

  it.each([
    ['/page-72/melumatlarin-yayimlanmasi-qrafiki', '/az/media/release-schedule'],
    ['/page-72/information-disclosure-schedule?language=en', '/en/media/release-schedule'],
    ['/en/page-72/x', '/en/media/release-schedule'],
    ['/az/page-72', '/az/media/release-schedule'],
    ['/az/melumatlarin-yayimlanmasi-qrafiki', '/az/media/release-schedule'],
    ['/en/information-disclosure-schedule/', '/en/media/release-schedule'],
  ])('yayım qrafiki (spec 039 FR-020): %s → %s', (from, to) => {
    const response = proxy(request(from))

    expect(response?.status).toBe(308)
    expect(location(response)).toBe(`${base}${to}`)
  })

  it.each([
    ['/page-131/sual-cavab', '/az/sual-cavab'],
    ['/page-131/faq?language=en', '/en/faq'],
    ['/az/page-131', '/az/sual-cavab'],
    ['/en/page-131/x', '/en/faq'],
  ])('köhnə FAQ səhifəsi (spec 051 FR-020): %s → %s', (from, to) => {
    const response = proxy(request(from))

    expect(response?.status).toBe(308)
    expect(location(response)).toBe(`${base}${to}`)
  })

  it.each([
    ['/page-893/fincert', '/az/fincert'],
    ['/en/page-893/fincert', '/en/fincert'],
    ['/page-893/fincert?language=en', '/en/fincert'],
    ['/az/page-893', '/az/fincert'],
  ])('köhnə FinCERT səhifəsi (spec 053 US5): %s → %s', (from, to) => {
    const response = proxy(request(from))

    expect(response?.status).toBe(308)
    expect(location(response)).toBe(`${base}${to}`)
  })

  it('başqa köhnə səhifə FinCERT-ə yönlənmir (spec 053 US5)', () => {
    expect(location(proxy(request('/page-8931/x')))).not.toContain('fincert')
  })

  it.each([
    ['/pages/strategy', '/az/maliyye-sektorunun-inkisaf-strategiyasi'],
    ['/pages/strategy/', '/az/maliyye-sektorunun-inkisaf-strategiyasi'],
    ['/pages/strategy?language=en', '/en/financial-sector-development-strategy'],
    ['/en/pages/strategy', '/en/financial-sector-development-strategy'],
    ['/az/pages/strategy?language=en', '/en/financial-sector-development-strategy'],
    [
      '/page-872/risk-based-supervision-policy-concept-of-the-central-bank-of-the-republic-of-azerbaijan',
      '/az/risk-esasli-nezaret-uzre-siyaset-konsepsiyasi',
    ],
    ['/page-872', '/az/risk-esasli-nezaret-uzre-siyaset-konsepsiyasi'],
    ['/en/page-872/x', '/en/risk-based-supervision-policy-concept'],
    ['/page-878/strategic-framework-for-a-microfinance-model', '/az/mikromaliyye-modeli-uzre-strateji-cercive'],
    ['/page-878/x?language=en', '/en/strategic-framework-for-a-microfinance-model'],
  ])('the legacy strategy documents (spec 057 US4): %s → %s', (from, to) => {
    const response = proxy(request(from))

    expect(response?.status).toBe(308)
    expect(location(response)).toBe(`${base}${to}`)
  })

  it.each(['/pages/strategy-x', '/pages/strategyx', '/page-8720', '/page-8781/x'])(
    'a lookalike of a legacy strategy address is not redirected there: %s',
    (from) => {
      const target = location(proxy(request(from))) ?? ''
      expect(target).not.toMatch(/strategiyasi|strategy$|konsepsiyasi|policy-concept|cercive|microfinance-model/)
    },
  )

  it.each([
    ['/az/umumi-melumat', '/az/maliyye-savadliligi'],
    ['/en/general-information/', '/en/financial-literacy'],
    ['/az/maliyye-savadliligi/umumi-melumat', '/az/maliyye-savadliligi'],
    ['/EN/General-Information', '/en/financial-literacy'],
  ])('financial literacy "General information" (spec 047 R8): %s → %s', (from, to) => {
    const response = proxy(request(from))

    expect(response?.status).toBe(308)
    expect(location(response)).toBe(`${base}${to}`)
  })

  it.each([
    ['/az/fealiyyet-istiqametleri', '/az/istehlakcilarin-ve-investorlarin-huquqlari'],
    ['/az/istehlakcilarin-ve-investorlarin-huquqlari/fealiyyet-istiqametleri', '/az/istehlakcilarin-ve-investorlarin-huquqlari'],
    ['/en/activity-directions/', '/en/consumer-and-investor-rights'],
    ['/az/avto-icbari-sigorta-uzre-sikayet-indeksi', '/az/bank-xidmetlerinden-istifade-uzre-sikayet-indeksi?tab=insurance'],
    [
      '/en/consumer-and-investor-rights/complaint-index-on-compulsory-mtpl-insurance',
      '/en/complaint-index-on-bank-customers-use-of-bank-services?tab=insurance',
    ],
    ['/az/infoqrafika', '/az/vetendas-muracietlerine-dair-statistika#infoqrafika'],
  ])('consumer rights (spec 050 R6): %s → %s', (from, to) => {
    const response = proxy(request(from))

    expect(response?.status).toBe(308)
    expect(location(response)).toBe(`${base}${to}`)
  })

  it('the consumer rights drafts and the pages that stay are not redirected (spec 050)', () => {
    expect(location(proxy(request('/az/fealiyyet-istiqametleri-copy')))).toBeNull()
    expect(location(proxy(request('/az/infoqrafika-copy')))).toBeNull()
    expect(location(proxy(request('/az/bank-xidmetlerinden-istifade-uzre-sikayet-indeksi')))).toBeNull()
    expect(location(proxy(request('/az/inzibati-islere-baxan-vezifeli-sexsler')))).toBeNull()
  })

  it('the draft copy and the section root are not redirected (spec 047)', () => {
    expect(location(proxy(request('/az/umumi-melumat-copy')))).toBeNull()
    expect(location(proxy(request('/az/maliyye-savadliligi')))).toBeNull()
  })

  it('yeni yayım qrafiki ünvanı və oxşar səhifələr yönləndirilmir', () => {
    expect(location(proxy(request('/az/media/release-schedule')))).toBeNull()
    expect(location(proxy(request('/az/page-721/x')))).toBeNull()
    expect(location(proxy(request('/az/statistik-hesabatlarin-yayimlanmasi-qrafiki')))).toBeNull()
  })

  it('xəritədə olmayan köhnə yollar toxunulmur', () => {
    expect(proxy(request('/indeks/chart-data'))?.status).toBe(307)
    expect(location(proxy(request('/az/indeks/rates-x')))).toBeNull()
  })
})

describe('başlıqlar', () => {
  it('x-locale başlığını sorğuya qoyur', () => {
    const response = proxy(request('/en/laws'))

    expect(response?.headers.get('x-middleware-request-x-locale')).toBe('en')
  })

  it('nonce-lu tək CSP qoyur və media mənbələrini daxil edir', () => {
    const response = proxy(request('/az'))
    const csp = response?.headers.get(CSP_HEADER) ?? ''

    expect(csp).toMatch(/script-src 'self' 'nonce-[^']+' 'strict-dynamic'/)
    expect(csp).toContain('http://localhost:5139')
    expect(csp).toContain('https://www.youtube.com')
    expect(csp.split('default-src')).toHaveLength(2)
  })

  it('nonce-u Next oxusun deyə sorğu başlıqlarına da qoyur', () => {
    const response = proxy(request('/az'))
    const nonce = response?.headers.get(`x-middleware-request-${NONCE_HEADER}`)
    const csp = response?.headers.get(`x-middleware-request-${CSP_HEADER.toLowerCase()}`)

    expect(nonce ?? '').not.toBe('')
    expect(csp ?? '').toContain(`'nonce-${nonce}'`)
  })

  it('cookie yazmır', () => {
    const response = proxy(request('/az/laws'))

    expect(response?.headers.get('set-cookie')).toBeNull()
  })
})

describe('matcher əhatəsi', () => {
  /**
   * Matcher-in özünü yoxlayır, `proxy()`-ni deyil: bir yol matcher-ə düşmürsə
   * funksiya heç vaxt çağırılmır, ona görə davranış testi bu səhvi tutmur.
   */
  const pattern = new RegExp(`^${config.matcher[0]}$`)

  it.each(['/', '/az', '/az/laws', '/press-releases', '/en/media/galleries/5', '/media', '/media/galleries', '/media/videos'])(
    'səhifə yolu matcher-ə düşür: %s',
    (path) => {
      expect(pattern.test(path)).toBe(true)
    },
  )

  it.each([
    // Media proxy marşrutu (spec 003 FR-006): kənarda qalmalıdır, əks halda
    // `/media/12` → `/az/media/12` yönləndirilər və marşrut çağırılmaz.
    '/media/12',
    '/media/1809',
    '/_next/static/chunk.js',
    '/api/anything',
    '/favicon.svg',
  ])('kənarda qalır: %s', (path) => {
    expect(pattern.test(path)).toBe(false)
  })

  it('media səhifələri matcher-də qalır, locale-siz `/media` yönləndirilir (spec 028 FR-015)', () => {
    // Yalnız rəqəmli `/media/{id}` kənardadır — media bölməsinin səhifələri locale alır.
    expect(pattern.test('/az/media')).toBe(true)
    expect(location(proxy(request('/media')))).toBe('http://localhost:3001/az/media')
    expect(location(proxy(request('/media/galleries')))).toBe('http://localhost:3001/az/media/galleries')
  })
})
