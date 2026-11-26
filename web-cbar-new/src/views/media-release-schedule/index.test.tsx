import { HttpResponse, http } from 'msw'
import { describe, expect, it } from 'vitest'

import { API } from '@/shared/testing/api-base'
import { mediaTreeAz } from '@/shared/testing/fixtures/media-section'
import { pageDetailFixture } from '@/shared/testing/fixtures/pages'
import { releaseSchedulePageContent } from '@/shared/testing/fixtures/release-schedule'
import { renderApp, screen, within } from '@/shared/testing/render'
import { server } from '@/shared/testing/server'

import { ReleaseScheduleView } from './index'
import { loadReleaseSchedule } from './loader'

/** CMS page 130 under Media, as editors are asked to place it (docs/media-cms-guide.md). */
const scheduleNode = { id: 130, title: 'Məlumatların yayımlanması qrafiki', slug: 'melumatlarin-yayimlanmasi-qrafiki', navUrl: null, children: [] }
const tree = [{ ...mediaTreeAz[0]!, children: [...mediaTreeAz[0]!.children, scheduleNode] }]

function usePage(content: string | null = releaseSchedulePageContent) {
  server.use(
    http.get(`${API}/api/v1/pages/tree`, () => HttpResponse.json(tree)),
    http.get(`${API}/api/v1/pages/:slug`, ({ params }) =>
      HttpResponse.json({ ...pageDetailFixture, id: 130, title: 'Məlumatların yayımlanması qrafiki', slug: String(params.slug), content }),
    ),
  )
}

async function renderPage(searchParams: Record<string, string> = {}, locale: 'az' | 'en' = 'az') {
  const data = await loadReleaseSchedule(locale, searchParams)
  renderApp(<ReleaseScheduleView data={data} />, { locale })
  return data
}

const table = () => screen.getByRole('table', { name: /Məlumatların yayımlanması qrafiki: məzmun/ })
const bodyRows = () => within(table()).getAllByRole('row').slice(1)

describe('Information disclosure schedule (spec 039 US2)', () => {
  it('shows the title, the CMS intro without the old table, and the groups in order', async () => {
    usePage()
    await renderPage()

    expect(screen.getByRole('heading', { level: 1, name: 'Məlumatların yayımlanması qrafiki' })).toBeInTheDocument()
    expect(screen.getByText(/internet saytında yerləşdirilən məlumatların növləri/)).toBeInTheDocument()
    expect(screen.queryByText('Köhnə cədvəlin sətri')).not.toBeInTheDocument()

    expect(within(within(table()).getAllByRole('rowgroup')[0]!).getAllByRole('columnheader').map((h) => h.textContent)).toEqual([
      'Məzmun',
      'Dövrilik',
      'Təqdim olunma müddəti',
    ])
    expect(bodyRows().map((row) => row.firstElementChild?.textContent)).toEqual([
      'Pul və məzənnə siyasəti üzrə',
      'Pul siyasətinin əsas istiqamətləri (Bəyanat)',
      'Pul siyasəti ilə bağlı qəbul olunan qərarlar',
      'İllik inflyasiya',
      'Normativ-hüquqi baza üzrə',
      'Normativ-xarakterli aktlar',
      'Statistik hesabatların yayımlanması qrafiki',
    ])
  })

  it('marks the page in the left Media menu', async () => {
    usePage()
    await renderPage()

    const menu = screen.getByRole('navigation', { name: 'Bölmə naviqasiyası' })
    expect(within(menu).getByRole('link', { name: 'Məlumatların yayımlanması qrafiki' })).toHaveAttribute('aria-current', 'page')
    expect(within(menu).getByRole('link', { name: 'Məlumatların yayımlanması qrafiki' })).toHaveAttribute('href', '/az/media/release-schedule')
  })

  it('renders each timing mode: text, links with ↗, the decisions link, and — for no value', async () => {
    usePage()
    await renderPage()

    const external = within(table()).getByRole('link', { name: /Reyestrə daxil edildikdən sonra/ })
    expect(external).toHaveAttribute('href', 'https://e-qanun.az')
    expect(external).toHaveAttribute('target', '_blank')
    expect(external).toHaveAttribute('rel', 'noopener noreferrer')
    expect(external).toHaveTextContent('↗')

    const sitePath = within(table()).getByRole('link', { name: 'Keçid' })
    expect(sitePath).toHaveAttribute('href', '/az/statistik-hesabatlarin-yayimlanmasi-qrafiki')
    expect(sitePath).not.toHaveAttribute('target')
    expect(sitePath).toHaveTextContent('Keçid ↗')

    const decisions = within(table()).getByRole('link', { name: 'Qrafikə uyğun' })
    expect(decisions).toHaveAttribute('href', '/az/media/events?type=1')
    expect(decisions).toHaveAttribute('aria-haspopup', 'dialog')

    const statistics = bodyRows().at(-1)!
    expect(within(statistics).getAllByRole('cell')[1]).toHaveTextContent('—')
  })

  it('searches the content from the URL, regardless of case and dotted i', async () => {
    usePage()
    const data = await renderPage({ q: 'INFLYASIYA' })

    expect(screen.getByRole('searchbox', { name: 'Məzmun üzrə axtarış' })).toHaveValue('INFLYASIYA')
    expect(bodyRows().map((row) => row.firstElementChild?.textContent)).toEqual(['Pul və məzənnə siyasəti üzrə', 'İllik inflyasiya'])
    expect(screen.getByRole('link', { name: 'Filtrləri təmizlə' })).toHaveAttribute('href', '/az/media/release-schedule')
    expect(data.shell.share.pageUrl).toContain('q=INFLYASIYA')
  })

  it('says so when nothing matches, and keeps the search form', async () => {
    usePage()
    await renderPage({ q: 'zzz' })

    expect(screen.getByRole('status')).toHaveTextContent('Axtarışa uyğun məlumat tapılmadı.')
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
    expect(screen.getByRole('search', { name: 'Qrafik üzrə axtarış' })).toBeInTheDocument()
  })

  it.each([
    ['the API fails', () => new HttpResponse(null, { status: 500 })],
    ['nothing is published', () => HttpResponse.json({ groups: [], decisions: { year: 2026, dates: [], next: null } })],
  ])('shows the whole CMS text, old table included, when %s', async (_, respond) => {
    usePage()
    server.use(http.get(`${API}/api/v1/release-schedule`, respond))
    await renderPage()

    expect(screen.getByRole('heading', { level: 1, name: 'Məlumatların yayımlanması qrafiki' })).toBeInTheDocument()
    expect(screen.getByText('Köhnə cədvəlin sətri')).toBeInTheDocument()
    expect(screen.queryByRole('search')).not.toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('falls back to the chrome title without the CMS page', async () => {
    server.use(
      http.get(`${API}/api/v1/pages/tree`, () => HttpResponse.json(mediaTreeAz)),
      http.get(`${API}/api/v1/pages/:slug`, () => new HttpResponse(null, { status: 404 })),
    )
    await renderPage()

    expect(screen.getByRole('heading', { level: 1, name: 'Məlumatların yayımlanması qrafiki' })).toBeInTheDocument()
    expect(table()).toBeInTheDocument()
  })

  it('renders the English page', async () => {
    usePage(null)
    await renderPage({}, 'en')

    const english = screen.getByRole('table', { name: /Information disclosure schedule: content/ })
    expect(within(english).getByRole('link', { name: 'According to the schedule' })).toHaveAttribute('href', '/en/media/events?type=1')
    expect(within(within(english).getAllByRole('rowgroup')[0]!).getAllByRole('columnheader').map((h) => h.textContent)).toEqual(['Content', 'Periodicity', 'Period of release'])
  })
})
