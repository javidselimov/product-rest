import { describe, expect, it, vi } from 'vitest'

import { renderApp, screen, within } from '@/shared/testing/render'

import { HomeView } from './index'
import type { HomeViewData } from './loader'

vi.mock('echarts/core', () => ({
  use: () => undefined,
  init: () => ({
    setOption: () => undefined,
    resize: () => undefined,
    dispose: () => undefined,
  }),
}))
// Leaf modules only have side effects (they register themselves), so an empty mock is enough;
// the renderer is the exception: chart.tsx calls its install explicitly (spec 003 FR-014).
vi.mock('echarts/lib/renderer/installCanvasRenderer', () => ({
  install: () => undefined,
}))
vi.mock('echarts/lib/chart/line', () => ({}))
vi.mock('echarts/lib/chart/bar', () => ({}))
vi.mock('echarts/lib/component/grid', () => ({}))
vi.mock('echarts/lib/component/tooltip', () => ({}))
vi.mock('echarts/lib/component/legend', () => ({}))

const noErrors: HomeViewData['errors'] = {
  homepage: false,
  currencies: false,
  pressReleases: false,
  inflation: false,
  azir: false,
  galleries: false,
  videos: false,
  yieldCurve: false,
}

const fixture: HomeViewData = {
  locale: 'az',
  errors: noErrors,
  hero: [
    {
      key: 'h',
      title: 'Slayd',
      description: null,
      href: '/az/press-releases/a',
      imageUrl: null,
      dateLabel: '1 sentyabr 2026',
    },
  ],
  currency: {
    dateLabel: '14/09/2026',
    rows: [{ code: 'USD', nominal: 1, rate: 1.7, trend: 'flat' }],
  },
  corridor: [{ label: 'Aşağı hədd', value: '6,25%' }],
  corridorDateLabel: '25.09.2026',
  inflation: { current: 5, currentDate: 'yanvar 2026', target: '4' },
  moneyMarket: {
    dateLabel: '14/09/2026',
    current1D: 7.02,
    current1DReserve: false,
    terms: [],
    series: null,
  },
  feedTabs: [
    {
      key: 'news',
      label: 'Xəbərlər',
      viewAllHref: '/az/press-releases',
      viewAllLabel: 'Bütün xəbərlər',
      items: [
        {
          key: 'p',
          title: 'Reliz',
          dateLabel: '10/09/2026',
          href: '/az/press-releases/p',
          imageUrl: null,
          kind: 'image',
        },
      ],
    },
    { key: 'announcements', label: 'Elanlar', viewAllHref: '/az/press-releases?type=2', viewAllLabel: 'Bütün elanlar', items: [] },
  ],
  promo: {
    title: 'Sikkələr',
    description: null,
    href: 'https://www.e-cbar.az/coins',
  },
  monetary: [{ label: 'Pul bazası', value: '25,1 mlrd AZN' }],
  notes: { rows: [], grid: [] },
  yieldCurve: null,
  banking: [{ label: 'Bankların sayı', value: '23' }],
  strategyDocs: [
    { key: 's', title: 'Strategiya', summary: null, coverUrl: null, href: '/az/strategiya' },
  ],
  calendar: [
    { key: 'c', date: '2026-10-15', time: '11:00', tags: ['Mətbuat konfransı'], title: 'Konfrans', href: '/az/media/events/konfrans' },
  ],
  calendarHref: '/az/media/events',
  publications: [
    {
      key: 'pub',
      title: 'İllik hesabat',
      href: 'http://api/media/601',
      imageUrl: null,
      dateLabel: '01.06.2026',
    },
  ],
  quickLinks: [{ key: 'q', title: 'Kalkulyator', href: '/az/currencies' }],
  usefulLinks: [
    {
      key: 'u',
      title: 'Savadlı',
      href: 'https://savadli.az',
      host: 'savadli.az',
    },
  ],
}

function slots(container: HTMLElement): string[] {
  return Array.from(
    container.querySelectorAll(
      '[data-slot="hero-slider"], [data-slot="currency-card"], [data-slot="statistics-tabs"], [data-slot="news-tabs"], [data-slot="promo-banner"], [data-slot="strategy-docs"], [data-slot="event-calendar"]',
    ),
  ).map((el) => el.getAttribute('data-slot') as string)
}

describe('HomeView', () => {
  it('blokları Figma sırası ilə render edir (spec 022)', () => {
    const { container } = renderApp(<HomeView data={fixture} />, { locale: 'az' })

    expect(slots(container)).toEqual([
      'hero-slider',
      'currency-card',
      'statistics-tabs',
      'news-tabs',
      'promo-banner',
      'strategy-docs',
      'event-calendar',
    ])
    expect(screen.getByRole('region', { name: 'Maliyyə göstəriciləri' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'AZN məzənnəsi' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'İnflyasiya' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Faiz dəhlizi' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'İcmal göstəricilər' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Media' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Strategiya və sənədlər' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Təqvim' })).toBeInTheDocument()
  })

  it('İcmal göstəricilər: yalnız datası olan tablar; boş elanlar tabı gizlidir', () => {
    renderApp(<HomeView data={fixture} />, { locale: 'az' })

    const statistics = screen.getByRole('heading', { name: 'İcmal göstəricilər' }).closest('[data-slot="statistics-tabs"]') as HTMLElement
    expect(within(statistics).getAllByRole('tab').map((tab) => tab.textContent)).toEqual([
      'Monetar',
      'Pul bazarı',
      'Maliyyə sektoru',
    ])

    const media = screen.getByRole('heading', { name: 'Media' }).closest('[data-slot="news-tabs"]') as HTMLElement
    expect(within(media).getAllByRole('tab').map((tab) => tab.textContent)).toEqual(['Xəbərlər'])
    expect(within(media).getByRole('link', { name: 'Bütün xəbərlər' })).toHaveAttribute('href', '/az/press-releases')
  })

  it('gizli bloklar (nəşrlər, faydalı/sürətli keçidlər) render olunmur — FR-015', () => {
    renderApp(<HomeView data={fixture} />, { locale: 'az' })

    expect(screen.queryByRole('region', { name: 'Nəşrlər' })).toBeNull()
    expect(screen.queryByRole('region', { name: 'Sürətli keçidlər' })).toBeNull()
    expect(screen.queryByRole('region', { name: 'Faydalı keçidlər' })).toBeNull()
    expect(screen.queryByText('Kalkulyator')).toBeNull()
  })

  it('blok xətasında yalnız həmin kart xəta göstərir, qalanı render olunur', () => {
    renderApp(
      <HomeView
        data={{
          ...fixture,
          currency: null,
          errors: { ...noErrors, currencies: true },
        }}
      />,
      { locale: 'az' },
    )

    expect(screen.getAllByText('Bu blok hazırda yüklənə bilmədi')).toHaveLength(1)
    expect(screen.queryByRole('region', { name: 'AZN məzənnəsi' })).toBeNull()
    expect(screen.getByRole('region', { name: 'Faiz dəhlizi' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Media' })).toBeInTheDocument()
  })

  it('boş məlumatda bölmələr gizlənir', () => {
    renderApp(
      <HomeView
        data={{
          ...fixture,
          hero: [],
          currency: null,
          corridor: [],
          inflation: null,
          moneyMarket: null,
          feedTabs: [],
          promo: null,
          monetary: [],
          banking: [],
          strategyDocs: [],
          calendar: [],
        }}
      />,
      { locale: 'en' },
    )

    expect(screen.queryByRole('region', { name: 'Financial indicators' })).toBeNull()
    expect(screen.queryByRole('heading', { name: 'Key indicators' })).toBeNull()
    expect(screen.queryByRole('heading', { name: 'Media' })).toBeNull()
    expect(screen.queryByRole('heading', { name: 'Calendar' })).toBeNull()
  })
})
