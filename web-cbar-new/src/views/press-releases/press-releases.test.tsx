import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { describe, expect, it } from 'vitest'

import { API } from '@/shared/testing/api-base'
import { mediaTreeAz } from '@/shared/testing/fixtures/media-section'
import { interviewItems } from '@/shared/testing/fixtures/press-releases'
import { cleanup, renderApp, screen, within } from '@/shared/testing/render'
import { server } from '@/shared/testing/server'

import { NEWS_PAGE_SIZE } from './constants'
import { PressReleasesView } from './index'
import { loadPressReleases, pressReleasesMetadata } from './loader'

const useMediaTree = () => server.use(http.get(`${API}/api/v1/pages/tree`, () => HttpResponse.json(mediaTreeAz)))

/** Records list request query strings, then lets the default handler answer. */
function spyListRequests(): URLSearchParams[] {
  const seen: URLSearchParams[] = []
  server.use(
    http.get(`${API}/api/v1/press-releases`, ({ request }) => {
      seen.push(new URL(request.url).searchParams)
    }),
  )
  return seen
}

async function renderList(locale: 'az' | 'en', params: Record<string, string>) {
  const data = await loadPressReleases(locale, params)
  renderApp(<PressReleasesView data={data} />, { locale })
  return data
}

const cardTitles = () => screen.queryAllByRole('heading', { level: 2 }).map((h) => h.textContent)
const sectionNav = () => screen.getByRole('navigation', { name: 'Bölmə naviqasiyası' })
const breadcrumb = () => screen.getByRole('navigation', { name: 'Səhifənin yeri' })

describe('News list in the Media section (spec 029 US1)', () => {
  it('an untyped URL is the news list: 9 newest news, news item active in the menu', async () => {
    useMediaTree()
    const requests = spyListRequests()

    await renderList('az', {})

    expect(requests[0]?.get('type')).toBe('1')
    expect(requests[0]?.get('pageSize')).toBe(String(NEWS_PAGE_SIZE))
    // The H1 is the CMS menu item's name, so the heading, breadcrumb and menu always agree.
    expect(screen.getByRole('heading', { level: 1, name: 'Press-relizlər' })).toBeInTheDocument()
    expect(within(sectionNav()).getByRole('link', { name: 'Press-relizlər' })).toHaveAttribute('aria-current', 'page')
    expect(within(breadcrumb()).getByText('Press-relizlər')).toBeInTheDocument()
    expect(cardTitles()).toHaveLength(NEWS_PAGE_SIZE)
    expect(cardTitles()[0]).toBe('Uçot dərəcəsi dəyişməz saxlanılıb')
    expect(cardTitles()).not.toContain('Elan 1')
  })

  it('type=2 lists only announcements with the announcements item active', async () => {
    useMediaTree()

    await renderList('az', { type: '2' })

    expect(screen.getByRole('heading', { level: 1, name: 'Elanlar' })).toBeInTheDocument()
    expect(within(sectionNav()).getByRole('link', { name: 'Elanlar' })).toHaveAttribute('aria-current', 'page')
    expect(within(sectionNav()).getByRole('link', { name: 'Press-relizlər' })).not.toHaveAttribute('aria-current')
    expect(cardTitles()).toEqual(['Elan 1', 'Elan 2', 'Elan 3', 'Elan 4'])
  })

  it('announcements are text cards (spec 031): link, date and title, no image box even when the API sends an imageUrl', async () => {
    const { container } = renderApp(<PressReleasesView data={await loadPressReleases('az', { type: '2' })} />, { locale: 'az' })

    // Fixture: "Elan 1" has imageUrl /media/821 — the announcement card ignores it.
    const first = screen.getByRole('link', { name: /Elan 1/ })
    expect(first).toHaveAttribute('href', '/az/press-releases/elan-1')
    expect(within(first).getByText('05.09.2026')).toBeInTheDocument()
    expect(first.querySelector('img')).toBeNull()
    expect(container.querySelectorAll('img')).toHaveLength(0)
    expect(container.querySelector('[data-slot="news-grid"]')).toHaveAttribute('data-variant', 'text')
  })

  it('falls back to the site label when the CMS tree has no matching item', async () => {
    await renderList('az', {})
    expect(screen.getByRole('heading', { level: 1, name: 'Xəbərlər' })).toBeInTheDocument()
  })

  it('news cards link to the detail page and show the dd.mm.yyyy date; cards without a photo keep the image box', async () => {
    const { container } = renderApp(<PressReleasesView data={await loadPressReleases('az', {})} />, { locale: 'az' })
    expect(container.querySelector('[data-slot="news-grid"]')).toHaveAttribute('data-variant', 'photo')

    const first = screen.getByRole('link', { name: /Uçot dərəcəsi dəyişməz saxlanılıb/ })
    expect(first).toHaveAttribute('href', '/az/press-releases/ucot-derecesi')
    expect(within(first).getByText('30.09.2026')).toBeInTheDocument()
    // The photo is decorative (alt=""), so it has no img role — query the element itself.
    expect(first.querySelector('img')).not.toBeNull()

    // Item 2 has no image: the card keeps its link and title, just no <img>.
    const noPhoto = screen.getByRole('link', { name: /Press reliz 2$/ })
    expect(noPhoto).toHaveAttribute('href', '/az/press-releases/press-reliz-2')
    expect(noPhoto.querySelector('img')).toBeNull()
  })

  it('pagination keeps the type: 23 news → 3 pages', async () => {
    await renderList('az', { type: '1', page: '2' })

    expect(cardTitles()[0]).toBe('Press reliz 10')
    expect(screen.getByRole('link', { name: '3' })).toHaveAttribute('href', '/az/press-releases?type=1&page=3')
    expect(screen.getByRole('link', { name: '1' })).toHaveAttribute('href', '/az/press-releases?type=1')
  })

  it('invalid type and page fall back to news, page 1', async () => {
    const requests = spyListRequests()

    const data = await renderList('az', { type: 'abc', page: '-1' })

    expect(data.type).toBe('1')
    expect(requests[0]?.get('page')).toBe('1')
    expect(cardTitles()).toHaveLength(NEWS_PAGE_SIZE)
  })

  it('an API failure keeps the section shell and shows the error state', async () => {
    useMediaTree()
    server.use(http.get(`${API}/api/v1/press-releases`, () => new HttpResponse(null, { status: 500 })))

    const { container } = renderApp(<PressReleasesView data={await loadPressReleases('az', {})} />, { locale: 'az' })

    expect(breadcrumb()).toBeInTheDocument()
    expect(sectionNav()).toBeInTheDocument()
    expect(container.querySelector('[data-slot="error-state"]')).not.toBeNull()
    expect(cardTitles()).toHaveLength(0)
  })

  it('English labels', async () => {
    await renderList('en', { type: '2' })
    expect(screen.getByRole('heading', { level: 1, name: 'Announcements' })).toBeInTheDocument()
  })
})

describe('Interviews and speeches list (spec 033 US1)', () => {
  /** The CMS menu after editors point node 80 at the list. */
  function useInterviewsMenu() {
    const tree = structuredClone(mediaTreeAz)
    const node = tree.flatMap((root) => root.children).find((item) => item.id === 80)!
    node.title = 'Müsahibələr və çıxışlar'
    node.navUrl = '/press-releases?type=3'
    server.use(http.get(`${API}/api/v1/pages/tree`, () => HttpResponse.json(tree)))
  }

  it('type=3 lists only interviews as photo cards; a card without a photo keeps the image box', async () => {
    const { container } = renderApp(<PressReleasesView data={await loadPressReleases('az', { type: '3' })} />, { locale: 'az' })

    expect(container.querySelector('[data-slot="news-grid"]')).toHaveAttribute('data-variant', 'photo')
    expect(cardTitles()).toHaveLength(interviewItems.length)
    expect(cardTitles()[0]).toBe('COP29-dan sonrakı dövr')

    const first = screen.getByRole('link', { name: /COP29-dan sonrakı dövr/ })
    expect(first).toHaveAttribute('href', '/az/press-releases/cop29-sonrasi')
    expect(within(first).getByText('20.08.2026')).toBeInTheDocument()
    expect(first.querySelector('img')).not.toBeNull()
    expect(screen.getByRole('link', { name: /Toronto Mərkəzinin müsahibəsi/ }).querySelector('img')).toBeNull()
  })

  it('the H1, the breadcrumb and the active menu item come from the CMS node', async () => {
    useInterviewsMenu()

    await renderList('az', { type: '3' })

    expect(screen.getByRole('heading', { level: 1, name: 'Müsahibələr və çıxışlar' })).toBeInTheDocument()
    expect(within(sectionNav()).getByRole('link', { name: 'Müsahibələr və çıxışlar' })).toHaveAttribute('aria-current', 'page')
    expect(within(breadcrumb()).getByText('Müsahibələr və çıxışlar')).toBeInTheDocument()
  })

  it('without a CMS node the site uses its own label in both languages', async () => {
    await renderList('az', { type: '3' })
    expect(screen.getByRole('heading', { level: 1, name: 'Müsahibələr və çıxışlar' })).toBeInTheDocument()
    cleanup()

    await renderList('en', { type: '3' })
    expect(screen.getByRole('heading', { level: 1, name: 'Interviews and speeches' })).toBeInTheDocument()
  })

  it('search stays inside the type and "clear filters" returns to it', async () => {
    const requests = spyListRequests()

    await renderList('az', { type: '3', q: 'toronto' })

    expect(requests[0]?.get('type')).toBe('3')
    expect(cardTitles()).toEqual(['Toronto Mərkəzinin müsahibəsi'])
    expect(screen.getByRole('link', { name: 'Filtrləri təmizlə' })).toHaveAttribute('href', '/az/press-releases?type=3')
  })

  it('page metadata carries the label and keeps the type in the language alternates', () => {
    const metadata = pressReleasesMetadata('en', { type: '3' })

    expect(metadata.title).toBe('Interviews and speeches')
    expect(metadata.alternates.languages.az).toBe('/az/press-releases?type=3')
  })

  it('an unknown type still falls back to news', async () => {
    const requests = spyListRequests()

    await renderList('az', { type: '4' })

    expect(requests[0]?.get('type')).toBe('1')
  })
})

describe('Search and date-range filter (spec 029 US2)', () => {
  const filterForm = () => screen.getByRole('search', { name: 'Xəbər filtri' })
  const searchBox = () => within(filterForm()).getByRole('searchbox', { name: 'Bölmə üzrə axtarış' })
  const fromField = () => within(filterForm()).getByLabelText('Başlanğıc tarixi')
  const toField = () => within(filterForm()).getByLabelText('Son tarix')

  it('search matches the title case-insensitively and keeps the term in the box', async () => {
    await renderList('az', { q: 'dünya bankı' })

    expect(cardTitles()).toEqual([
      'Mərkəzi Bankın sədri Dünya Bankının nümayəndə heyəti ilə görüşüb',
      'DÜNYA Bankı ilə texniki yardım layihəsi müzakirə olunub',
      'Dünya bankı hesabatı təqdim edilib',
    ])
    expect(searchBox()).toHaveValue('dünya bankı')
  })

  it('date range is inclusive and uses Baku days (20:30 UTC already counts as the next day)', async () => {
    await renderList('az', { from: '2026-09-25', to: '2026-09-25' })
    expect(cardTitles()).toEqual(['Press reliz 6'])

    // Rerender with a wider range: both ends are included.
    cleanup()
    await renderList('az', { from: '2026-09-24', to: '2026-09-26' })
    expect(cardTitles()).toEqual(['Press reliz 5', 'Press reliz 6', 'DÜNYA Bankı ilə texniki yardım layihəsi müzakirə olunub'])
    expect(fromField()).toHaveValue('2026-09-24')
    expect(toField()).toHaveValue('2026-09-26')
  })

  it('search and dates combine', async () => {
    await renderList('az', { q: 'dünya', from: '2026-09-20' })
    expect(cardTitles()).toEqual([
      'Mərkəzi Bankın sədri Dünya Bankının nümayəndə heyəti ilə görüşüb',
      'DÜNYA Bankı ilə texniki yardım layihəsi müzakirə olunub',
    ])
  })

  it('pagination links keep every filter', async () => {
    await renderList('az', { q: 'press reliz', from: '2026-09-01' })

    // 19 "Press reliz N" items → 3 pages of 9.
    const href = screen.getByRole('link', { name: '2' }).getAttribute('href')!
    const params = new URL(href, 'http://x').searchParams
    expect(Object.fromEntries(params)).toEqual({ type: '1', q: 'press reliz', from: '2026-09-01', page: '2' })
  })

  it('nothing found: message, filled fields, no pagination', async () => {
    await renderList('az', { q: 'mövcud olmayan söz' })

    expect(screen.getByText('Heç nə tapılmadı')).toBeInTheDocument()
    expect(searchBox()).toHaveValue('mövcud olmayan söz')
    expect(screen.queryByRole('link', { name: '2' })).toBeNull()
    expect(cardTitles()).toHaveLength(0)
  })

  it('"clear filters" leads to the unfiltered list of the same type', async () => {
    await renderList('az', { type: '2', q: 'elan', from: '2026-09-01' })
    expect(screen.getByRole('link', { name: 'Filtrləri təmizlə' })).toHaveAttribute('href', '/az/press-releases?type=2')
  })

  it('the form is a plain GET form: it submits type, q, from, to and starts again at page 1', async () => {
    const user = userEvent.setup()
    await renderList('az', { type: '2', page: '3' })

    await user.type(searchBox(), 'yeni elan')
    await user.type(fromField(), '2026-09-01')

    const form = filterForm() as HTMLFormElement
    expect(form.method).toBe('get')
    expect(new URL(form.action).pathname).toBe('/az/press-releases')
    expect(Object.fromEntries(new FormData(form))).toEqual({ type: '2', q: 'yeni elan', from: '2026-09-01', to: '' })
  })

  it('a malformed date is ignored and never sent to the API; from after to finds nothing', async () => {
    const requests = spyListRequests()
    await renderList('az', { from: 'abc', to: '2026-09-29' })

    expect(requests[0]?.has('from')).toBe(false)
    expect(requests[0]?.get('to')).toBe('2026-09-29')
    expect(fromField()).toHaveValue('')

    cleanup()
    await renderList('az', { from: '2026-09-29', to: '2026-09-01' })
    expect(screen.getByText('Heç nə tapılmadı')).toBeInTheDocument()
  })
})
