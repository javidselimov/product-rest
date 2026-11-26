/**
 * The "International cooperation" section end to end: API response → loader → view (specs 043, 044, 045, 046).
 */
import { HttpResponse, http } from 'msw'
import { describe, expect, it } from 'vitest'

import { API } from '@/shared/testing/api-base'
import { cooperationPageAz, cooperationTreeAz, membershipPageAz } from '@/shared/testing/fixtures/cooperation-section'
import { ifiOrganizations } from '@/shared/testing/fixtures/ifi-organizations'
import { mediaTreeAz } from '@/shared/testing/fixtures/media-section'
import { renderApp, screen, within } from '@/shared/testing/render'
import { server } from '@/shared/testing/server'

import { CmsPageView } from './index'
import { loadCmsPage } from './loader'

function servePage(page = cooperationPageAz, tree = cooperationTreeAz) {
  server.use(
    http.get(`${API}/api/v1/pages/tree`, () => HttpResponse.json(tree)),
    http.get(`${API}/api/v1/pages/${page.slug}`, () => HttpResponse.json(page)),
  )
}

describe('International cooperation section', () => {
  it('shows the root page in the section template: breadcrumb, side menu, one heading and the intro', async () => {
    servePage()
    const data = await loadCmsPage('az', ['beynelxalq-emekdasliq'])
    expect(data?.shellPage?.section).toBe('cooperation')
    renderApp(<CmsPageView data={data!} />, { locale: 'az' })

    const crumbs = screen.getByRole('navigation', { name: 'Səhifənin yeri' })
    expect(within(crumbs).getByRole('link', { name: 'Ana səhifə' })).toHaveAttribute('href', '/az')
    expect(within(crumbs).getByText('Beynəlxalq əməkdaşlıq')).toHaveAttribute('aria-current', 'page')

    const nav = screen.getByRole('navigation', { name: 'Bölmə naviqasiyası' })
    expect(within(nav).getByRole('link', { name: 'Mərkəzi banklarla əməkdaşlıq' })).toHaveAttribute('href', '/az/merkezi-banklarla-emekdasliq')
    expect(within(nav).queryByRole('link', { current: 'page' })).toBeNull()

    expect(screen.getByRole('heading', { level: 1, name: 'Beynəlxalq əməkdaşlıq' })).toBeInTheDocument()
    expect(screen.getByRole('list', { name: 'Paylaş' })).toBeInTheDocument()
    expect(screen.getByText(/beynəlxalq maliyyə-kredit təşkilatları/)).toBeInTheDocument()
    // The old layout's sidebar is gone.
    expect(screen.queryByRole('complementary')).toBeNull()
  })

  it('marks the open child page in the side menu', async () => {
    servePage({ ...cooperationPageAz, id: 122, title: 'Mərkəzi banklarla əməkdaşlıq', slug: 'merkezi-banklarla-emekdasliq' })
    const data = await loadCmsPage('az', ['beynelxalq-emekdasliq', 'merkezi-banklarla-emekdasliq'])
    renderApp(<CmsPageView data={data!} />, { locale: 'az' })

    const nav = screen.getByRole('navigation', { name: 'Bölmə naviqasiyası' })
    expect(within(nav).getByRole('link', { name: 'Mərkəzi banklarla əməkdaşlıq' })).toHaveAttribute('aria-current', 'page')
  })

  it('does not take a Media layout for a slug it shares with Media', async () => {
    // A page under this section with a Media layout slug stays ordinary content.
    const root = cooperationTreeAz[0]!
    const tree = [{ ...root, children: [...root.children, { id: 900, title: 'Sorğular', slug: 'media-sorgulari', navUrl: null, children: [] }] }, ...mediaTreeAz]
    servePage({ ...cooperationPageAz, id: 900, title: 'Sorğular', slug: 'media-sorgulari' }, tree)
    const data = await loadCmsPage('az', ['beynelxalq-emekdasliq', 'media-sorgulari'])

    expect(data?.shellPage?.section).toBe('cooperation')
    expect(data?.shellPage?.layout).toBe('plain')
  })
})

describe('International financial institutions page (spec 044)', () => {
  const ifiPage = {
    ...cooperationPageAz,
    id: 121,
    title: 'Beynəlxalq maliyyə təşkilatları ilə əməkdaşlıq',
    slug: 'beynelxalq-teskilatlarla-emekdasliq',
    content: '<p>ARMB dörd təşkilatla əməkdaşlıq edir.</p><p><strong>Dünya Bankı</strong></p><p>Köhnə siyahının mətni</p>',
  }
  const load = () => loadCmsPage('az', ['beynelxalq-emekdasliq', 'beynelxalq-teskilatlarla-emekdasliq'])

  it('shows the intro and the organization cards, without the old list', async () => {
    servePage(ifiPage)
    const data = await load()
    expect(data?.shellPage?.layout).toBe('ifi-organizations')
    renderApp(<CmsPageView data={data!} />, { locale: 'az' })

    expect(screen.getByRole('heading', { level: 1, name: 'Beynəlxalq maliyyə təşkilatları ilə əməkdaşlıq' })).toBeInTheDocument()
    expect(screen.getByText('ARMB dörd təşkilatla əməkdaşlıq edir.')).toBeInTheDocument()
    expect(screen.queryByText('Köhnə siyahının mətni')).toBeNull()
    expect(screen.getByRole('heading', { level: 2, name: 'Əməkdaşlıq edilən təşkilatlar' })).toBeInTheDocument()

    // Every card arrives closed; its body is in the page for the browser to open.
    const cards = [...document.querySelectorAll('details[data-slot=ifi-organization]')]
    expect(cards).toHaveLength(3)
    for (const card of cards) expect(card).not.toHaveAttribute('open')
    // The date arrives as `yyyy-MM-dd` and shows as the site's day-first date.
    expect(within(cards[0] as HTMLElement).getByText('18.09.1992')).toBeInTheDocument()
  })

  it('shows the whole page text when the organizations cannot be read', async () => {
    servePage(ifiPage)
    server.use(http.get(`${API}/api/v1/ifi-organizations`, () => new HttpResponse(null, { status: 500 })))
    const data = await load()
    renderApp(<CmsPageView data={data!} />, { locale: 'az' })

    expect(screen.getByText('Köhnə siyahının mətni')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { level: 2, name: 'Əməkdaşlıq edilən təşkilatlar' })).toBeNull()
  })

  it('shows no section title while there are no organizations', async () => {
    servePage(ifiPage)
    server.use(http.get(`${API}/api/v1/ifi-organizations`, () => HttpResponse.json({ items: [] })))
    const data = await load()
    renderApp(<CmsPageView data={data!} />, { locale: 'az' })

    expect(screen.getByText('Köhnə siyahının mətni')).toBeInTheDocument()
    expect(screen.queryByText('Əməkdaşlıq edilən təşkilatlar')).toBeNull()
  })

  it('drops a website address that is not http(s)', async () => {
    servePage(ifiPage)
    server.use(
      http.get(`${API}/api/v1/ifi-organizations`, () =>
        HttpResponse.json({ items: [{ ...ifiOrganizations[0], websiteUrl: 'javascript:alert(1)' }] }),
      ),
    )
    const data = await load()
    renderApp(<CmsPageView data={data!} />, { locale: 'az' })

    const card = screen.getByText('Dünya Bankı Qrupu').closest('details')!
    expect(within(card).queryByRole('link')).toBeNull()
  })
})

describe('Central banks page (spec 045)', () => {
  const banksPage = {
    ...cooperationPageAz,
    id: 122,
    title: 'Mərkəzi banklarla əməkdaşlıq',
    slug: 'merkezi-banklarla-emekdasliq',
    content: '<p>ARMB xarici mərkəzi banklarla əməkdaşlıq edir.</p><p><strong>İsveçrə Milli Bankı</strong></p><p>Köhnə bank mətni</p>',
  }
  const load = (slug = banksPage.slug) => loadCmsPage('az', ['beynelxalq-emekdasliq', slug])
  const firstOrganization = () => within(screen.getAllByRole('row')[1]!).getAllByRole('cell')[0]

  it('shows the intro and the memorandum table, without the legacy bank texts', async () => {
    servePage(banksPage)
    const data = await load()
    expect(data?.shellPage?.layout).toBe('memorandums')
    renderApp(<CmsPageView data={data!} />, { locale: 'az' })

    expect(screen.getByRole('heading', { level: 1, name: 'Mərkəzi banklarla əməkdaşlıq' })).toBeInTheDocument()
    expect(screen.getByText('ARMB xarici mərkəzi banklarla əməkdaşlıq edir.')).toBeInTheDocument()
    expect(screen.queryByText('Köhnə bank mətni')).toBeNull()
    // The head row and the four memorandums of the fixture, newest year first.
    expect(screen.getAllByRole('row')).toHaveLength(5)
    expect(firstOrganization()).toHaveTextContent('Slovakiya Milli Bankı')
  })

  it('shows the oldest memorandum first for the "oldest" order', async () => {
    servePage(banksPage)
    const data = await load()
    renderApp(<CmsPageView data={data!} query={{ sort: 'oldest' }} />, { locale: 'az' })

    expect(firstOrganization()).toHaveTextContent('Pakistan İslam Respublikası Mərkəzi Bankı')
    expect(screen.getAllByRole('row')).toHaveLength(5)
  })

  it('shows the whole page text when the memorandums cannot be read', async () => {
    servePage(banksPage)
    server.use(http.get(`${API}/api/v1/memorandums`, () => new HttpResponse(null, { status: 500 })))
    const data = await load()
    renderApp(<CmsPageView data={data!} />, { locale: 'az' })

    expect(screen.getByText('Köhnə bank mətni')).toBeInTheDocument()
    expect(screen.queryByRole('table')).toBeNull()
  })

  it('gives the "(Kopya)" draft page the same table', async () => {
    servePage({ ...banksPage, id: 468, title: 'Mərkəzi banklarla əməkdaşlıq (Kopya)', slug: 'merkezi-banklarla-emekdasliq-copy' })
    const data = await load('merkezi-banklarla-emekdasliq-copy')
    renderApp(<CmsPageView data={data!} />, { locale: 'az' })

    expect(data?.shellPage?.layout).toBe('memorandums')
    expect(screen.getByRole('table')).toBeInTheDocument()
  })
})

describe('Membership page (spec 046)', () => {
  const load = (slug = membershipPageAz.slug) => loadCmsPage('az', ['beynelxalq-emekdasliq', slug])
  const bodyRows = () => screen.getAllByRole('row').slice(1)
  const yearOf = (row: HTMLElement) => within(row).getAllByRole('cell')[1]?.textContent

  it('turns the editor table into the membership table, newest year first, with the page open in the side menu', async () => {
    servePage(membershipPageAz)
    const data = await load()
    expect(data?.shellPage?.layout).toBe('memberships')
    renderApp(<CmsPageView data={data!} />, { locale: 'az' })

    expect(screen.getByRole('heading', { level: 1, name: 'Beynəlxalq təşkilatlarda üzvlük' })).toBeInTheDocument()
    const nav = screen.getByRole('navigation', { name: 'Bölmə naviqasiyası' })
    expect(within(nav).getByRole('link', { name: 'Beynəlxalq təşkilatlarda üzvlük' })).toHaveAttribute('aria-current', 'page')
    // The editor's header row is not a body row: 14 memberships, 2025 down to 1997.
    expect(bodyRows()).toHaveLength(14)
    expect(yearOf(bodyRows()[0]!)).toBe('2025')
    expect(yearOf(bodyRows()[13]!)).toBe('1997')
    expect(screen.queryByText('Üzvlük tarixi', { selector: 'td p' })).toBeNull()
  })

  it('shows the oldest membership first for the "oldest" order', async () => {
    servePage(membershipPageAz)
    const data = await load()
    renderApp(<CmsPageView data={data!} query={{ sort: 'oldest' }} />, { locale: 'az' })

    expect(within(bodyRows()[0]!).getAllByRole('cell')[0]).toHaveTextContent('Mərkəzi Asiya, Qara Dəniz Regionu')
    expect(bodyRows()).toHaveLength(14)
  })

  it('shows the placeholder text as ordinary content while the page has no table', async () => {
    servePage({ ...membershipPageAz, content: '<p>Beynəlxalq təşkilatlarda üzvlük</p>' })
    const data = await load()
    renderApp(<CmsPageView data={data!} />, { locale: 'az' })

    expect(screen.queryByRole('table')).toBeNull()
    expect(screen.getAllByText('Beynəlxalq təşkilatlarda üzvlük').length).toBeGreaterThan(1)
  })
})
