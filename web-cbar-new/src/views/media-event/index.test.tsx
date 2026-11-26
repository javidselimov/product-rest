import { HttpResponse, http } from 'msw'
import { describe, expect, it } from 'vitest'

import { API } from '@/shared/testing/api-base'
import { eventDetail } from '@/shared/testing/fixtures/events'
import { renderApp, screen } from '@/shared/testing/render'
import { server } from '@/shared/testing/server'

import { MediaEventView } from './index'
import { loadMediaEvent, type MediaEventData } from './loader'

async function load(slug: string): Promise<MediaEventData> {
  const data = await loadMediaEvent('az', slug)
  if (!data || 'redirectTo' in data) throw new Error('expected an event')
  return data
}

function detailWith(changes: Record<string, unknown>) {
  server.use(http.get(`${API}/api/v1/events/:slug`, () => HttpResponse.json({ ...eventDetail, ...changes })))
}

describe('Past event (spec 034 US4)', () => {
  it('shows the title, tags, date, text and gallery', async () => {
    renderApp(<MediaEventView data={await load('tdt-toplantisi')} />, { locale: 'az' })

    expect(screen.getByRole('heading', { level: 1, name: 'Tədbirlər' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: eventDetail.title })).toBeInTheDocument()
    expect(screen.getByText('Beynəlxalq')).toBeInTheDocument()
    expect(screen.getByText('Konfrans')).toBeInTheDocument()
    expect(screen.getByText('4–5 iyun 2026 · Bakı')).toBeInTheDocument()
    expect(screen.getByText('Bakı şəhərində toplantı keçirilib.')).toBeInTheDocument()
    expect(document.querySelector('[data-slot="event-facts"]')).toBeNull()
    expect(screen.getByRole('img', { name: `${eventDetail.title} — şəkil 1` })).toBeInTheDocument()
  })

  it('links the press release', async () => {
    renderApp(<MediaEventView data={await load('tdt-toplantisi')} />, { locale: 'az' })

    expect(screen.getByRole('link', { name: 'Press-reliz' })).toHaveAttribute('href', '/az/press-releases/tdt-relizi')
  })

  it('leaves out a gallery or press release that is not public', async () => {
    detailWith({ gallery: null, pressRelease: null })
    renderApp(<MediaEventView data={await load('tdt-toplantisi-2')} />, { locale: 'az' })

    expect(screen.queryByRole('link', { name: 'Press-reliz' })).not.toBeInTheDocument()
    expect(document.querySelector('[data-slot="photo-gallery"]')).toBeNull()
  })

  it('leaves no empty block without text', async () => {
    detailWith({ content: '<p> </p>', gallery: null, pressRelease: null })
    renderApp(<MediaEventView data={await load('tdt-toplantisi-3')} />, { locale: 'az' })

    expect(document.querySelector('[data-slot="cms-content"]')).toBeNull()
    expect(screen.queryByText(/tezliklə/)).not.toBeInTheDocument()
  })
})

describe('Upcoming event (spec 034 US4)', () => {
  it('shows date, time and place, and says details will follow', async () => {
    renderApp(<MediaEventView data={await load('hesabat-teqdimati')} />, { locale: 'az' })

    const facts = document.querySelector('[data-slot="event-facts"]')
    expect(facts).toHaveTextContent('Tarix4 noyabr 2026')
    expect(facts).toHaveTextContent('Vaxt12:00')
    expect(facts).toHaveTextContent('MəkanOnlayn')
    expect(screen.getByText('Tədbir haqqında ətraflı məlumat və proqram tezliklə dərc olunacaq.')).toBeInTheDocument()
  })

  it('has no box for a missing value, and shows the text once there is one', async () => {
    detailWith({ upcoming: true, startTime: null, location: null })
    renderApp(<MediaEventView data={await load('hesabat-teqdimati-2')} />, { locale: 'az' })

    const facts = document.querySelector('[data-slot="event-facts"]')
    expect(facts).toHaveTextContent('Tarix')
    expect(facts).not.toHaveTextContent('Vaxt')
    expect(facts).not.toHaveTextContent('Məkan')
    expect(screen.getByText('Bakı şəhərində toplantı keçirilib.')).toBeInTheDocument()
    expect(screen.queryByText(/tezliklə/)).not.toBeInTheDocument()
  })
})

describe('Other addresses (spec 034 US4)', () => {
  it('sends a legacy event to its page', async () => {
    expect(await loadMediaEvent('az', 'cop29')).toEqual({ redirectTo: '/az/cop29' })
  })

  it('has nothing for an unknown address', async () => {
    expect(await loadMediaEvent('az', 'yoxdur')).toBeNull()
  })
})
