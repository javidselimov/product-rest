/**
 * The "Consumer and investor rights" section end to end: API response → loader → view (spec 050 US1–US4).
 */
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { describe, expect, it } from 'vitest'

import type { PageNode } from '@/entities/page-node'
import type { PageDetail } from '@/features/pages/model/schemas'
import { API } from '@/shared/testing/api-base'
import {
  complaintAz,
  consumerTreeAz,
  consumerTreeEn,
  documentsAz,
  infographicsAz,
  insuranceAz,
  officialsAz,
  rootAz,
  rootAzLegacy,
  rootEn,
  statisticsAz,
} from '@/shared/testing/fixtures/consumer-section'
import { bankReportsAz, bankReportsEn, infographicsReportsAz, insuranceReportsAz } from '@/shared/testing/fixtures/monthly-reports'
import { monthlyReportsHandler } from '@/shared/testing/handlers/monthly-reports'
import { renderApp, screen, within } from '@/shared/testing/render'
import { server } from '@/shared/testing/server'

import { CmsPageView } from './index'
import { loadCmsPage } from './loader'

type Query = Record<string, string>

/** The tree and the pages; a companion page that is `'error'` answers 500. */
function serve(pages: PageDetail[], tree: PageNode[] = consumerTreeAz(), failing: string[] = []) {
  server.use(
    http.get(`${API}/api/v1/pages/tree`, () => HttpResponse.json(tree)),
    ...failing.map((slug) => http.get(`${API}/api/v1/pages/${slug}`, () => new HttpResponse(null, { status: 500 }))),
    ...pages.map((page) => http.get(`${API}/api/v1/pages/${page.slug}`, () => HttpResponse.json(page))),
  )
}

async function open(segments: string[], { locale = 'az', query }: { locale?: 'az' | 'en'; query?: Query } = {}) {
  const data = await loadCmsPage(locale, segments)
  renderApp(<CmsPageView data={data!} query={query} />, { locale })
  return data!
}

const sideNavLinks = () =>
  within(screen.getByRole('navigation', { name: 'Bölmə naviqasiyası' }))
    .getAllByRole('link')
    .map((link) => link.textContent)

const FIGMA_MENU = [
  'Vətəndaş müraciətlərinə dair statistika',
  'Şikayət indeksləri',
  'İnzibati işlərə baxan vəzifəli şəxslər',
  'Sənədlər',
]

describe('Consumer rights root (spec 050 US1)', () => {
  it('opens in the section template: lead, numbered cards, the four Figma pages in the left menu', async () => {
    serve([rootAz])
    const data = await open(['istehlakcilarin-ve-investorlarin-huquqlari'])

    expect(data.shellPage).toMatchObject({ section: 'consumer', layout: 'consumer-text' })
    expect(screen.getByRole('heading', { level: 1, name: 'İstehlakçıların və investorların hüquqları' })).toBeInTheDocument()
    expect(sideNavLinks()).toEqual(FIGMA_MENU)
    const text = document.querySelector<HTMLElement>('[data-slot="consumer-text"]')!
    expect(within(within(text).getByRole('list')).getAllByRole('listitem')).toHaveLength(9)
    expect(screen.getByText(/^Bununla əlaqədar/)).toBeInTheDocument()
  })

  it('a page outside Figma still opens and shows itself in the menu while it is open (spec 041)', async () => {
    const events: PageDetail = { id: 97, title: 'Tədbirlər', slug: 'tedbirler-2', content: '<p>Arxiv</p>', assets: [] }
    serve([events])
    await open(['tedbirler-2'])

    expect(sideNavLinks()).toEqual([...FIGMA_MENU.slice(0, 2), 'Tədbirlər', ...FIGMA_MENU.slice(2)])
    expect(screen.getByText('Arxiv')).toBeInTheDocument()
  })

  it('the legacy root text still shows the lead and the list', async () => {
    serve([rootAzLegacy])
    await open(['istehlakcilarin-ve-investorlarin-huquqlari'])

    expect(screen.getByText(/Bununla əlaqədar, Mərkəzi Bank/)).toBeInTheDocument()
    expect(screen.getAllByRole('listitem').length).toBeGreaterThanOrEqual(9)
  })

  it('opens in English', async () => {
    serve([rootEn], consumerTreeEn())
    await open(['consumer-and-investor-rights'], { locale: 'en' })

    expect(screen.getByRole('heading', { level: 1, name: 'Consumer and Investor Rights' })).toBeInTheDocument()
    expect(screen.getByText(/^In this regard/)).toBeInTheDocument()
  })
})

describe('Complaint indices (spec 050 US2)', () => {
  it('shows the bank tab: the latest file, the archive closed, the bank methodology, no file list', async () => {
    serve([complaintAz, insuranceAz])
    await open(['bank-xidmetlerinden-istifade-uzre-sikayet-indeksi'])

    const tabs = screen.getByRole('navigation', { name: 'Şikayət indeksləri' })
    expect(within(tabs).getByRole('link', { name: 'Bank xidmətlərindən istifadə üzrə şikayət indeksi' })).toHaveAttribute('aria-current', 'page')
    expect(within(tabs).getByRole('link', { name: 'Avto-icbari sığorta üzrə şikayət indeksi' })).toHaveAttribute('href', '?tab=insurance')

    const latest = document.querySelector('[data-slot="consumer-latest"]')
    expect(latest).toHaveAttribute('href', '/media/1179')
    expect(latest).toHaveTextContent(/2026-cı ilin may ayı üzrə/)

    const years = document.querySelectorAll('[data-slot="consumer-archive"] details')
    expect([...years].map((d) => d.querySelector('summary')?.textContent)).toEqual(['2026', '2025'])
    expect([...years].every((d) => !d.hasAttribute('open'))).toBe(true)

    expect(screen.getByRole('heading', { level: 2, name: 'Şikayət indeksinin metodologiyası' })).toBeInTheDocument()
    expect(screen.getByText('Müştərilər üzrə bazar payı')).toBeInTheDocument()
    expect(document.querySelector('[data-slot="attachments"]')).toBeNull()
  })

  it('opens a year and its months as document cards', async () => {
    serve([complaintAz, insuranceAz])
    await open(['bank-xidmetlerinden-istifade-uzre-sikayet-indeksi'])

    const year = screen.getByText('2026', { selector: 'summary span' })
    await userEvent.click(year)
    expect(year.closest('details')).toHaveAttribute('open')
    expect(screen.getByRole('link', { name: /^May 2026/ })).toHaveAttribute('href', '/media/1179')
  })

  it('shows the insurance tab with its own methodology', async () => {
    serve([complaintAz, insuranceAz])
    await open(['bank-xidmetlerinden-istifade-uzre-sikayet-indeksi'], { query: { tab: 'insurance' } })

    expect(screen.getByRole('link', { name: 'Avto-icbari sığorta üzrə şikayət indeksi' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByText('Bağlanan müqavilələr üzrə bazar payı')).toBeInTheDocument()
    expect(document.querySelector('[data-slot="consumer-latest"]')).toHaveTextContent(/Avto-icbari sığorta üzrə şikayət indeksi/)
  })

  it('without the insurance page it shows the bank archive with no tabs', async () => {
    serve([complaintAz], consumerTreeAz(), ['avto-icbari-sigorta-uzre-sikayet-indeksi'])
    await open(['bank-xidmetlerinden-istifade-uzre-sikayet-indeksi'], { query: { tab: 'insurance' } })

    expect(screen.queryByRole('navigation', { name: 'Şikayət indeksləri' })).toBeNull()
    expect(document.querySelector('[data-slot="consumer-latest"]')).toHaveAttribute('href', '/media/1179')
  })
})

describe('Complaint indices from monthly reports (spec 052 US2)', () => {
  it('builds both tabs from the reports and hides the legacy archive of the page text', async () => {
    serve([complaintAz, insuranceAz])
    server.use(monthlyReportsHandler({ az: [bankReportsAz, insuranceReportsAz] }))
    await open(['bank-xidmetlerinden-istifade-uzre-sikayet-indeksi'])

    const latest = document.querySelector('[data-slot="consumer-latest"]')
    expect(latest).toHaveAttribute('href', '/media/2001')
    expect(latest).toHaveTextContent('Bank müştərilərinin bank xidmətlərindən istifadəsi üzrə şikayət indeksi (Sentyabr 2026)')

    const years = document.querySelectorAll('[data-slot="consumer-archive"] details')
    expect([...years].map((d) => d.querySelector('summary')?.textContent)).toEqual(['2026', '2025'])
    expect(document.querySelector('a[href="/media/1179"]')).toBeNull()
    expect(screen.getByRole('heading', { level: 2, name: 'Şikayət indeksinin metodologiyası' })).toBeInTheDocument()
  })

  it('titles the insurance index with its twelve-month period', async () => {
    serve([complaintAz, insuranceAz])
    server.use(monthlyReportsHandler({ az: [bankReportsAz, insuranceReportsAz] }))
    await open(['bank-xidmetlerinden-istifade-uzre-sikayet-indeksi'], { query: { tab: 'insurance' } })

    expect(document.querySelector('[data-slot="consumer-latest"]')).toHaveTextContent('Avto-icbari sığorta üzrə şikayət indeksi (İyun 2025 – May 2026)')
    expect(screen.getByText('Bağlanan müqavilələr üzrə bazar payı')).toBeInTheDocument()
  })

  it('keeps the page text archive for a series without reports', async () => {
    serve([complaintAz, insuranceAz])
    server.use(monthlyReportsHandler({ az: [insuranceReportsAz] }))
    await open(['bank-xidmetlerinden-istifade-uzre-sikayet-indeksi'])

    expect(document.querySelector('[data-slot="consumer-latest"]')).toHaveAttribute('href', '/media/1179')
  })

  it('falls back to the page text when the reports request fails', async () => {
    serve([complaintAz, insuranceAz])
    server.use(http.get(`${API}/api/v1/monthly-reports`, () => new HttpResponse(null, { status: 500 })))
    await open(['bank-xidmetlerinden-istifade-uzre-sikayet-indeksi'])

    expect(document.querySelector('[data-slot="consumer-latest"]')).toHaveAttribute('href', '/media/1179')
    expect(screen.getByRole('navigation', { name: 'Şikayət indeksləri' })).toBeInTheDocument()
  })

  it('asks only for the two complaint series', async () => {
    const asked: string[] = []
    serve([complaintAz, insuranceAz])
    server.use(
      http.get(`${API}/api/v1/monthly-reports`, ({ request }) => {
        asked.push(new URL(request.url).searchParams.get('series') ?? '')
        return HttpResponse.json({ series: [] })
      }),
    )
    await open(['bank-xidmetlerinden-istifade-uzre-sikayet-indeksi'])

    expect(asked).toEqual(['bank-complaint-index,insurance-complaint-index'])
  })
})

describe('Infographics from monthly reports (spec 052 US3)', () => {
  it('builds the infographics block from the reports and does not ask for the infographics page', async () => {
    const asked: string[] = []
    serve([statisticsAz, infographicsAz])
    server.use(
      monthlyReportsHandler({ az: [infographicsReportsAz] }),
      http.get(`${API}/api/v1/pages/infoqrafika`, () => {
        asked.push('infoqrafika')
        return HttpResponse.json(infographicsAz)
      }),
    )
    await open(['vetendas-muracietlerine-dair-statistika'])

    const infographics = document.getElementById('infoqrafika')!
    expect(infographics.querySelector('[data-slot="consumer-latest"]')).toHaveAttribute('href', '/media/2021')
    expect(infographics.querySelector('[data-slot="consumer-latest"]')).toHaveTextContent('müraciətlərə dair statistik hesabat (Sentyabr 2026)')
    expect(asked).toEqual([])
  })

  it('reads the infographics page when the series has no reports', async () => {
    serve([statisticsAz, infographicsAz])
    await open(['vetendas-muracietlerine-dair-statistika'])

    const infographics = document.getElementById('infoqrafika')!
    expect(infographics.querySelector('[data-slot="consumer-latest"]')).toHaveTextContent(/2026-cı ilin may ayı üzrə/)
  })

  it('shows English reports with English month names', async () => {
    serve([], consumerTreeEn())
    server.use(
      http.get(`${API}/api/v1/pages/complaint-index-on-bank-customers-use-of-bank-services`, () =>
        HttpResponse.json({ ...complaintAz, slug: 'complaint-index-on-bank-customers-use-of-bank-services' }),
      ),
      http.get(`${API}/api/v1/pages/complaint-index-on-compulsory-mtpl-insurance`, () => new HttpResponse(null, { status: 404 })),
      monthlyReportsHandler({ en: [bankReportsEn] }),
    )
    await open(['complaint-index-on-bank-customers-use-of-bank-services'], { locale: 'en' })

    expect(document.querySelector('[data-slot="consumer-latest"]')).toHaveTextContent("Complaint index on bank customers' use of bank services (September 2026)")
  })
})

describe('Appeal statistics (spec 050 US3)', () => {
  it('shows the summary of the latest common month, the first channel and its newest year, the infographics', async () => {
    serve([statisticsAz, infographicsAz])
    await open(['vetendas-muracietlerine-dair-statistika'])

    const summary = screen.getByRole('heading', { level: 2, name: 'May 2026 — qısa icmal' }).closest('section')!
    expect(within(summary).getAllByRole('listitem').map((card) => card.querySelector('p')?.textContent)).toEqual([
      'Yazılı müraciətlər',
      'Vətəndaş qəbulu',
    ])
    expect(within(summary).getByText('2228')).toBeInTheDocument()

    const channels = screen.getByRole('navigation', { name: 'Müraciət kanalları' })
    expect(within(channels).getByRole('link', { name: 'Yazılı müraciətlər' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('table', { name: 'Yazılı müraciətlər, 2026' })).toBeInTheDocument()
    expect(within(screen.getByRole('navigation', { name: 'İllər' })).getByRole('link', { name: '2025' })).toHaveAttribute('href', '?channel=1&year=2025')

    const infographics = document.getElementById('infoqrafika')!
    expect(within(infographics).getByRole('heading', { name: 'İnfoqrafika' })).toBeInTheDocument()
    expect(infographics.querySelector('[data-slot="consumer-latest"]')).toHaveTextContent(/2026-cı ilin may ayı üzrə/)
  })

  it('shows the channel and year in the address, the mobile reception table as typed', async () => {
    serve([statisticsAz, infographicsAz])
    await open(['vetendas-muracietlerine-dair-statistika'], { query: { channel: '3', year: '2026' } })

    const table = screen.getByRole('table', { name: 'Vətəndaşların səyyar qəbulu, 2026' })
    expect(within(table).getByRole('columnheader', { name: 'Şəhər və rayonlar' })).toBeInTheDocument()
    expect(within(table).getByRole('rowheader', { name: 'Kürdəmir' })).toBeInTheDocument()
  })

  it('an unknown channel or year falls back to the first channel and its newest year', async () => {
    serve([statisticsAz, infographicsAz])
    await open(['vetendas-muracietlerine-dair-statistika'], { query: { channel: '9', year: '1999' } })

    expect(screen.getByRole('table', { name: 'Yazılı müraciətlər, 2026' })).toBeInTheDocument()
  })

  it('without the infographics page the statistics still show', async () => {
    serve([statisticsAz], consumerTreeAz(), ['infoqrafika'])
    await open(['vetendas-muracietlerine-dair-statistika'])

    expect(document.getElementById('infoqrafika')).toBeNull()
    expect(screen.getByRole('table', { name: 'Yazılı müraciətlər, 2026' })).toBeInTheDocument()
  })
})

describe('Administrative officials and documents (spec 050 US4)', () => {
  it('the officials page is in the section, with its old nested Media address too', async () => {
    serve([officialsAz])
    await open(['media', 'inzibati-islere-baxan-vezifeli-sexsler'])

    const crumbs = screen.getByRole('navigation', { name: 'Səhifənin yeri' })
    expect(within(crumbs).getByRole('link', { name: 'İstehlakçıların və investorların hüquqları' })).toBeInTheDocument()
    expect(sideNavLinks()).toEqual(FIGMA_MENU)
    expect(screen.getByRole('heading', { level: 2, name: 'İnzibati xətalar haqqında işlərə baxmağa səlahiyyəti olan vəzifəli şəxslər:' })).toBeInTheDocument()
  })

  it('the documents page shows closed sections with document cards', async () => {
    serve([documentsAz])
    await open(['kapital-bazari-3'])

    const sections = [...document.querySelectorAll('[data-slot="consumer-documents"] details')]
    expect(sections.map((d) => d.querySelector('summary')?.textContent)).toEqual([
      'Səhmdarların hüquq və vəzifələri',
      'Emitentlərin illik və yarımillik hesabatlarının təqdim edilməsi',
      'İnformasiya sorğusu',
    ])
    expect(sections.every((d) => !d.hasAttribute('open'))).toBe(true)
    expect(screen.getByRole('link', { name: /Emitentlər tərəfindən təqdim edilməli olan məlumatlar/ })).toHaveAttribute('href', '/media/1371')
    expect(document.querySelector('[data-slot="attachments"]')).toBeNull()
  })
})
