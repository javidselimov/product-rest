import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { describe, expect, it } from 'vitest'

import { API } from '@/shared/testing/api-base'
import { mediaTreeAz } from '@/shared/testing/fixtures/media-section'
import { renderApp, screen, within } from '@/shared/testing/render'
import { server } from '@/shared/testing/server'

import { GALLERY_PAGE_SIZE, type GalleryKind } from './constants'
import { MediaGalleryListView } from './index'
import { galleryListMetadata, loadMediaGalleryList } from './loader'

/** On the test API the menu items are `/media#galleries|#videos`; once the editor fixes them they are the list paths. */
const treeWithListNavUrls = [
  {
    ...mediaTreeAz[0]!,
    children: mediaTreeAz[0]!.children.map((n) =>
      n.slug === 'fotoqalereya' ? { ...n, navUrl: '/media/galleries' } : n.slug === 'videoqalereya' ? { ...n, navUrl: '/media/videos' } : n,
    ),
  },
]

/** Records list request query strings, then lets the default handler answer. */
function spyListRequests(resource: 'galleries' | 'videos'): URLSearchParams[] {
  const seen: URLSearchParams[] = []
  server.use(
    http.get(`${API}/api/v1/${resource}`, ({ request }) => {
      seen.push(new URL(request.url).searchParams)
    }),
  )
  return seen
}

async function renderList(kind: GalleryKind, params: Record<string, string> = {}, locale: 'az' | 'en' = 'az') {
  const data = await loadMediaGalleryList(kind, locale, params)
  renderApp(<MediaGalleryListView data={data} />, { locale })
  return data
}

const tabs = () => screen.getByRole('navigation', { name: 'Qalereya növləri' })
const cardTitles = () => screen.queryAllByRole('heading', { level: 2 }).map((h) => h.textContent)
const filterForm = () => screen.getByRole('search', { name: 'Qalereya filtri' })
const pagination = () => screen.queryByRole('navigation', { name: 'Səhifələmə' })

describe('Photo gallery list (spec 035)', () => {
  it('H1 "Qalereya", the photo tab current, 9 cards linking to the gallery, menu item active', async () => {
    server.use(http.get(`${API}/api/v1/pages/tree`, () => HttpResponse.json(treeWithListNavUrls)))
    const requests = spyListRequests('galleries')

    await renderList('photos')

    expect(requests[0]?.get('pageSize')).toBe(String(GALLERY_PAGE_SIZE))
    expect(screen.getByRole('heading', { level: 1, name: 'Qalereya' })).toBeInTheDocument()
    expect(within(tabs()).getByRole('link', { name: 'Fotoqalereya' })).toHaveAttribute('aria-current', 'page')
    expect(cardTitles()).toHaveLength(GALLERY_PAGE_SIZE)

    const first = screen.getByRole('link', { name: /Qalereya 1$/ })
    expect(first).toHaveAttribute('href', '/az/media/galleries/300')
    expect(within(first).getByText('28.08.2026')).toHaveAttribute('dateTime', '2026-08-28')

    const nav = screen.getByRole('navigation', { name: 'Bölmə naviqasiyası' })
    expect(within(nav).getByRole('link', { name: 'Fotoqalereya' })).toHaveAttribute('aria-current', 'page')
  })

  it('tabs link to both lists without filters, so switching resets them', async () => {
    await renderList('photos', { q: 'Qalereya', from: '2026-08-01' })

    expect(within(tabs()).getByRole('link', { name: 'Fotoqalereya' })).toHaveAttribute('href', '/az/media/galleries')
    expect(within(tabs()).getByRole('link', { name: 'Videoqalereya' })).toHaveAttribute('href', '/az/media/videos')
    expect(within(tabs()).getByRole('link', { name: 'Videoqalereya' })).not.toHaveAttribute('aria-current')
  })

  it('sends valid filters to the API and drops invalid ones', async () => {
    const requests = spyListRequests('galleries')

    const data = await renderList('photos', { q: '  Qalereya 1 ', from: '2026-08-20', to: 'dünən' })

    expect(requests[0]?.get('q')).toBe('Qalereya 1')
    expect(requests[0]?.get('from')).toBe('2026-08-20')
    expect(requests[0]?.has('to')).toBe(false)
    expect(data.filters).toEqual({ q: 'Qalereya 1', from: '2026-08-20', to: undefined })
    // "Qalereya 1" and "Qalereya 10"–"14" match the title; only the first is dated 20 Aug or later.
    expect(cardTitles()).toEqual(['Qalereya 1'])
  })

  it('the filter is a GET form to the list: it submits q, from, to and no page', async () => {
    const user = userEvent.setup()
    await renderList('photos', { page: '2' })

    const form = filterForm() as HTMLFormElement
    expect(form).toHaveAttribute('method', 'get')
    expect(form).toHaveAttribute('action', '/az/media/galleries')

    await user.type(within(form).getByRole('searchbox', { name: 'Bölmə üzrə axtarış' }), 'forum')
    await user.type(within(form).getByLabelText('Başlanğıc tarixi'), '2026-08-01')

    expect([...new FormData(form).entries()]).toEqual([
      ['q', 'forum'],
      ['from', '2026-08-01'],
      ['to', ''],
    ])
    expect(within(form).getByRole('link', { name: 'Filtrləri təmizlə' })).toHaveAttribute('href', '/az/media/galleries')
    expect(within(form).getByRole('button', { name: 'Axtar' })).toHaveAttribute('type', 'submit')
  })

  it('pagination keeps the filters', async () => {
    await renderList('photos', { from: '2026-08-01' })

    expect(within(pagination()!).getByRole('link', { name: '2' })).toHaveAttribute('href', '/az/media/galleries?from=2026-08-01&page=2')
  })

  it('a filter with no match says "nothing found"; an empty list says there are no galleries', async () => {
    const { unmount } = renderApp(<MediaGalleryListView data={await loadMediaGalleryList('photos', 'az', { q: 'yoxdur' })} />, { locale: 'az' })
    expect(screen.getByText('Heç nə tapılmadı')).toBeInTheDocument()
    expect(pagination()).toBeNull()
    unmount()

    server.use(http.get(`${API}/api/v1/galleries`, () => HttpResponse.json({ items: [], total: 0, page: 1, pageSize: GALLERY_PAGE_SIZE })))
    await renderList('photos')
    expect(screen.getByText('Fotoqalereya tapılmadı')).toBeInTheDocument()
  })

  it('a failed list request keeps the shell, tabs and filter and shows the error state', async () => {
    server.use(http.get(`${API}/api/v1/galleries`, () => new HttpResponse(null, { status: 500 })))

    const { error } = await renderList('photos')

    expect(error).toBe(true)
    expect(tabs()).toBeInTheDocument()
    expect(filterForm()).toBeInTheDocument()
    expect(screen.getByText('Serverdə xəta baş verdi. Bir azdan yenidən cəhd edin')).toBeInTheDocument()
  })
})

describe('Video gallery list (spec 035)', () => {
  it('the video tab is current; a card opens the video page and shows the YouTube thumbnail', async () => {
    const data = await renderList('videos', {}, 'en')

    expect(screen.getByRole('heading', { level: 1, name: 'Gallery' })).toBeInTheDocument()
    const videoTab = within(screen.getByRole('navigation', { name: 'Gallery types' })).getByRole('link', { name: 'Video gallery' })
    expect(videoTab).toHaveAttribute('aria-current', 'page')
    expect(data.items).toHaveLength(GALLERY_PAGE_SIZE)

    const first = screen.getByRole('link', { name: /Video 1$/ })
    expect(first).toHaveAttribute('href', '/en/media/videos/400')
    expect(first).not.toHaveAttribute('target')
    // Straight from YouTube's CDN, not through the optimizer.
    expect(first.querySelector('img')).toHaveAttribute('src', 'https://i.ytimg.com/vi/video1abc/hqdefault.jpg')
    // Fixture video 4 has no YouTube link: the grey box stays, without an image.
    expect(screen.getByRole('link', { name: /Video 4$/ }).querySelector('img')).toBeNull()
  })

  it('the date filter goes to the video list and the clear link stays on it', async () => {
    const requests = spyListRequests('videos')

    await renderList('videos', { to: '2026-07-15' })

    expect(requests[0]?.get('to')).toBe('2026-07-15')
    expect(filterForm()).toHaveAttribute('action', '/az/media/videos')
    expect(screen.getByRole('link', { name: 'Filtrləri təmizlə' })).toHaveAttribute('href', '/az/media/videos')
    expect(cardTitles()[0]).toBe('Video 6')
  })
})

describe('galleryListMetadata', () => {
  it('titles the page by tab and links both languages of the same list', () => {
    expect(galleryListMetadata('videos', 'az')).toEqual({
      title: 'Videoqalereya',
      alternates: { languages: { az: '/az/media/videos', en: '/en/media/videos' } },
    })
  })
})
