import { HttpResponse, http } from 'msw'
import { describe, expect, it } from 'vitest'

import { API } from '@/shared/testing/api-base'
import { eventCategories, pastEvents } from '@/shared/testing/fixtures/events'
import { mediaTreeAz } from '@/shared/testing/fixtures/media-section'
import { renderApp, screen, within } from '@/shared/testing/render'
import { server } from '@/shared/testing/server'

import { MediaEventsView } from './index'
import { loadMediaEvents } from './loader'

const eventsNode = {
  id: 84,
  title: 'Tədbirlər',
  slug: 'tedbirler',
  navUrl: null,
  children: [{ id: 209, title: 'COP29', slug: 'cop29', navUrl: null, children: [] }],
}
const tree = [{ ...mediaTreeAz[0]!, children: mediaTreeAz[0]!.children.map((node) => (node.slug === eventsNode.slug ? eventsNode : node)) }]

async function renderList(searchParams: Record<string, string> = {}) {
  server.use(http.get(`${API}/api/v1/pages/tree`, () => HttpResponse.json(tree)))
  const data = await loadMediaEvents('az', searchParams)
  renderApp(<MediaEventsView data={data} />, { locale: 'az' })
  return data
}

const rows = () => screen.getAllByRole('link').filter((link) => link.getAttribute('data-slot') === 'event-row')

describe('Upcoming events (spec 034 US2)', () => {
  it('opens on upcoming events, oldest first, under month headings', async () => {
    await renderList()

    expect(screen.getByRole('heading', { level: 1, name: 'Tədbirlər' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Gələcək tədbirlər' })).toHaveAttribute('aria-current', 'true')
    expect(screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)).toEqual(['Noyabr 2026', 'Dekabr 2026'])
    expect(rows()[0]).toHaveTextContent('Maliyyə Sabitliyi Hesabatının təqdimatı')
    expect(rows()[2]).toHaveTextContent('Faiz dəhlizinə dair qərar')
  })

  it('shows the date box, tags, time and place, and leaves out what is missing', async () => {
    await renderList()

    const first = rows()[0]
    expect(first).toHaveTextContent('4noy')
    expect(within(first).getByText('Maliyyə sabitliyi')).toBeInTheDocument()
    expect(within(first).getByText('Mətbuat konfransı')).toBeInTheDocument()
    expect(within(first).getByText('12:00')).toBeInTheDocument()
    expect(within(first).getByText('Onlayn')).toBeInTheDocument()

    const noTime = rows()[1]
    expect(within(noTime).getByText('Bakı')).toBeInTheDocument()
    expect(noTime.textContent).not.toContain('·')
  })

  it('links a category tab and marks it active, keeping the filters', async () => {
    const data = await renderList({ category: '1', q: 'qərar' })

    expect(screen.getByRole('link', { name: 'Pul siyasəti' })).toHaveAttribute('aria-current', 'true')
    expect(rows()).toHaveLength(1)
    expect(data.categories[1]!.href).toBe('/az/media/events?q=q%C9%99rar&category=2')
    expect(data.allCategories.href).toBe('/az/media/events?q=q%C9%99rar')
  })

  it('narrows by type and clears to the same tab', async () => {
    await renderList({ type: '4', when: 'past' })
    expect(screen.getByRole('link', { name: 'Filtrləri təmizlə' })).toHaveAttribute('href', '/az/media/events?when=past')
  })

  it('shows the empty state with a way to the archive', async () => {
    await renderList({ q: 'yoxdur' })

    expect(screen.getByText('Bu bölmə üzrə gələcək tədbir yoxdur')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Keçmiş tədbirlərə baxa bilərsiniz' })).toHaveAttribute('href', '/az/media/events?q=yoxdur&when=past')
  })

  it('ignores values it does not know', async () => {
    const data = await renderList({ when: 'x', type: '9', category: 'abc', from: 'dünən', limit: '-1' })

    expect(data.past).toBe(false)
    expect(data.filters.type).toBeUndefined()
    expect(data.categoryId).toBeUndefined()
    expect(data.filters.from).toBeUndefined()
    expect(rows()).toHaveLength(3)
  })

  it('keeps the page frame when the list fails', async () => {
    server.use(http.get(`${API}/api/v1/events`, () => new HttpResponse(null, { status: 500 })))
    await renderList()

    expect(document.querySelector('[data-slot="error-state"]')).not.toBeNull()
    expect(screen.getByRole('heading', { level: 1, name: 'Tədbirlər' })).toBeInTheDocument()
  })
})

describe('Category filter variants (spec 034)', () => {
  const many = (count: number) => Array.from({ length: count }, (_, i) => ({ id: i + 1, name: `Bölmə ${i + 1}` }))
  const withCategories = (items: unknown[]) =>
    server.use(http.get(`${API}/api/v1/event-categories`, () => HttpResponse.json({ items })))

  it('shows every category as a tab up to five', async () => {
    await renderList()

    const nav = screen.getByRole('navigation', { name: 'Bölmələr' })
    expect(within(nav).getByRole('link', { name: 'Hamısı' })).toHaveAttribute('aria-current', 'true')
    eventCategories.forEach((category) => expect(within(nav).getByRole('link', { name: category.name })).toBeInTheDocument())
    expect(document.querySelector('[data-slot="event-categories-more"]')).toBeNull()
  })

  it('moves the rest under "Other", and a chosen one takes its place', async () => {
    withCategories(many(7))
    await renderList({ category: '7' })

    const more = document.querySelector('[data-slot="event-categories-more"]')
    expect(more?.querySelector('summary')).toHaveTextContent('Bölmə 7')
  })

  it('labels the menu "Other" when nothing in it is chosen', async () => {
    withCategories(many(7))
    await renderList()

    expect(document.querySelector('[data-slot="event-categories-more"] summary')).toHaveTextContent('Digər')
  })

  it('becomes a searchable list from ten categories', async () => {
    withCategories(many(10))
    await renderList()

    expect(document.querySelector('[data-slot="event-category-search"]')).not.toBeNull()
    expect(screen.getByRole('searchbox', { name: 'Bölmə üzrə axtar' })).toBeInTheDocument()
  })
})

describe('Past events (spec 034 US3)', () => {
  it('lists past events with their dates, and a legacy card opens its page', async () => {
    await renderList({ when: 'past' })

    expect(rows()[0]).toHaveTextContent('4–5iyn')
    expect(rows()[0]).toHaveTextContent('4–5 iyun 2026 · Bakı')
    expect(rows()[1]).toHaveAttribute('href', '/az/cop29')
    expect(rows()[1]).toHaveTextContent('14 noyabr 2024')
  })

  it('offers more only while events remain, and keeps the earlier ones', async () => {
    const twelve = Array.from({ length: 12 }, (_, i) => ({ ...pastEvents[0]!, id: 100 + i, slug: `e-${i}` }))
    server.use(
      http.get(`${API}/api/v1/events`, ({ request }) => {
        const pageSize = Number(new URL(request.url).searchParams.get('pageSize'))
        return HttpResponse.json({ items: twelve.slice(0, pageSize), total: 12, page: 1, pageSize })
      }),
    )
    await renderList({ when: 'past' })

    expect(rows()).toHaveLength(10)
    expect(screen.getByRole('link', { name: 'Daha çox göstər' })).toHaveAttribute('href', '/az/media/events?when=past&limit=20')
  })

  it('has no more link at the end', async () => {
    await renderList({ when: 'past', limit: '20' })

    expect(screen.queryByRole('link', { name: 'Daha çox göstər' })).not.toBeInTheDocument()
  })

  it('has no more link on upcoming events', async () => {
    await renderList()

    expect(screen.queryByRole('link', { name: 'Daha çox göstər' })).not.toBeInTheDocument()
  })
})

describe('Section menu (spec 034 US6)', () => {
  it('marks Events active in the left menu without its legacy subtree', async () => {
    await renderList()

    const nav = screen.getByRole('navigation', { name: 'Bölmə naviqasiyası' })
    expect(within(nav).getByRole('link', { name: 'Tədbirlər' })).toHaveAttribute('aria-current', 'page')
    expect(within(nav).getByRole('link', { name: 'Tədbirlər' })).toHaveAttribute('href', '/az/media/events')
    expect(within(nav).queryByRole('link', { name: 'COP29' })).not.toBeInTheDocument()
  })
})
