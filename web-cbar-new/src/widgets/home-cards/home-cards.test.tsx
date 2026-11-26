import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { renderApp, screen, within } from '@/shared/testing/render'

import { CorridorCard } from './corridor-card'
import { CurrencyCard } from './currency-card'
import { EventCalendar } from './event-calendar'
import { InflationCard } from './inflation-card'
import { PromoBannerCard, QuickLinks, UsefulLinks } from './links-grid'
import { NewsTabs, type FeedTab } from './news-tabs'
import { FinancialSectorPanel, MonetaryPanel, MoneyMarketPanel, NotesPanel, splitMetric } from './statistics-panels'
import { StrategyDocs } from './strategy-docs'

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

describe('CurrencyCard', () => {
  it('dəyərlər 4 onluqla, trend işarəsi əlçatan adla, başlıq məzənnələr səhifəsinə keçiddir', () => {
    renderApp(
      <CurrencyCard
        locale="az"
        dateLabel="14/09/2026"
        rows={[
          { code: 'USD', nominal: 1, rate: 1.7, trend: 'flat' },
          { code: 'EUR', nominal: 1, rate: 1.985, trend: 'down' },
          { code: 'RUB', nominal: 100, rate: 1.8123, trend: 'up' },
        ]}
      />,
      { locale: 'az' },
    )

    expect(screen.getByText('1.7000')).toBeInTheDocument()
    expect(screen.getByText('100 RUB')).toBeInTheDocument()
    expect(screen.getByText('14/09/2026')).toBeInTheDocument()
    expect(screen.getByLabelText('azalıb')).toBeInTheDocument()
    expect(screen.getByLabelText('artıb')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'AZN məzənnəsi' })).toHaveAttribute('href', '/az/currencies')
  })
})

describe('CorridorCard', () => {
  it('qutuları sıra ilə göstərir', () => {
    renderApp(
      <CorridorCard
        locale="en"
        items={[
          { label: 'Floor', value: '6.25%' },
          { label: 'Ceiling', value: '8.25%' },
          { label: 'Refinancing rate', value: '7.25%' },
        ]}
      />,
      { locale: 'en' },
    )

    const card = screen.getByRole('region', { name: 'Interest rate corridor' })
    expect(within(card).getAllByRole('listitem').map((li) => li.textContent)).toEqual([
      'Floor6.25%',
      'Ceiling8.25%',
      'Refinancing rate7.25%',
    ])
  })
})

describe('InflationCard', () => {
  it('illik inflyasiya tarixlə, hədəf faizlə', () => {
    renderApp(<InflationCard locale="az" current={5.8} currentDate="yanvar 2026" target="4 (±2)" />, {
      locale: 'az',
    })

    expect(screen.getByText('İllik inflyasiya')).toBeInTheDocument()
    expect(screen.getByText('5,8%')).toBeInTheDocument()
    expect(screen.getByText('yanvar 2026')).toBeInTheDocument()
    expect(screen.getByText('4 (±2) %')).toBeInTheDocument()
  })

  it('dəyər yoxdursa tire', () => {
    renderApp(<InflationCard locale="en" current={null} currentDate="" target={null} />, { locale: 'en' })

    expect(screen.getAllByText('—')).toHaveLength(2)
  })
})

describe('statistika panelləri', () => {
  it('splitMetric rəqəmi vahiddən ayırır', () => {
    expect(splitMetric('15301,3 mln. USD')).toEqual({ number: '15301,3', unit: 'mln. USD' })
    expect(splitMetric('7,10%')).toEqual({ number: '7,10%', unit: '' })
    expect(splitMetric('23')).toEqual({ number: '23', unit: '' })
  })

  it('Monetar: göstəricilər və "Daha ətraflı"', () => {
    renderApp(<MonetaryPanel locale="az" title="Monetar" rows={[{ label: 'Pul bazası', value: '25,1 mlrd AZN' }]} />, {
      locale: 'az',
    })

    expect(screen.getByText('25,1')).toBeInTheDocument()
    expect(screen.getByText('mlrd AZN')).toBeInTheDocument()
    expect(screen.getByText('Pul bazası')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Daha ətraflı' })).toHaveAttribute('href', '/az/statistics')
  })

  it('Notlar və maliyyə sektoru', () => {
    renderApp(
      <>
        <NotesPanel
          locale="en"
          title="Notes"
          rows={[{ label: 'Volume', value: '3.4 bn AZN' }]}
          grid={[{ label: '28 days', value: '7.1%' }]}
        />
        <FinancialSectorPanel locale="en" title="Financial sector" sectorTitle="Banking sector" rows={[{ label: 'Banks', value: '23' }]} />
      </>,
      { locale: 'en' },
    )

    expect(screen.getByText('28 days')).toBeInTheDocument()
    expect(within(screen.getByRole('region', { name: 'Banking sector' })).getByText('23')).toBeInTheDocument()
  })

  it('Pul bazarı: cari 1D, müddət qutuları, AZIR keçidi', () => {
    renderApp(
      <MoneyMarketPanel
        locale="az"
        title="Pul bazarı"
        dateLabel="14/09/2026"
        current1D={7.02}
        terms={[{ term: '30D', days: 30, rate: 7.32 }]}
        series={null}
      />,
      { locale: 'az' },
    )

    expect(screen.getByText('7.02%')).toBeInTheDocument()
    expect(screen.getByText('30 gün')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'AZIR dərəcələri' })).toHaveAttribute('href', '/az/statistics/azir')
    expect(screen.queryByText('*Ehtiyat plan əsasında hesablanmışdır')).not.toBeInTheDocument()
  })

  it('Pul bazarı: ehtiyat plan əsasında 1D — * və footnote (spec 021 US6)', () => {
    renderApp(
      <MoneyMarketPanel
        locale="en"
        title="Money market"
        dateLabel="31/08/2026"
        current1D={7}
        current1DReserve
        terms={[]}
        series={null}
      />,
      { locale: 'en' },
    )

    expect(screen.getByText('7%*')).toBeInTheDocument()
    expect(screen.getByText('*Calculated on the basis of the contingency plan')).toBeInTheDocument()
  })
})

describe('NewsTabs', () => {
  const tabs: FeedTab[] = [
    {
      key: 'news',
      label: 'Xəbərlər',
      viewAllHref: '/az/press-releases',
      viewAllLabel: 'Bütün xəbərlər',
      items: Array.from({ length: 5 }, (_, i) => ({
        key: `p${i}`,
        title: `Xəbər ${i + 1}`,
        dateLabel: '10/09/2026',
        href: `/az/press-releases/${i}`,
        imageUrl: null,
        kind: 'image' as const,
      })),
    },
    { key: 'announcements', label: 'Elanlar', viewAllHref: '/az/elanlar', viewAllLabel: 'Bütün elanlar', items: [] },
    {
      key: 'gallery',
      label: 'Qalereya',
      viewAllHref: '/az/media',
      viewAllLabel: 'Bütün qalereya',
      items: [
        { key: 'g', title: 'Albom', dateLabel: null, href: 'https://example.az/album', imageUrl: null, kind: 'image' },
      ],
    },
  ]

  it('boş tab gizlənir, tabda ən çox 4 kart, "hamısı" düyməsi tab-a görədir', async () => {
    const user = userEvent.setup()
    renderApp(<NewsTabs title="Media" tabs={tabs} />, { locale: 'az' })

    expect(screen.getAllByRole('tab').map((tab) => tab.textContent)).toEqual(['Xəbərlər', 'Qalereya'])
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(4)
    expect(screen.getByRole('link', { name: 'Bütün xəbərlər' })).toHaveAttribute('href', '/az/press-releases')

    await user.click(screen.getByRole('tab', { name: 'Qalereya' }))

    const panel = await screen.findByRole('tabpanel')
    expect(within(panel).getByRole('heading', { name: 'Albom' })).toBeInTheDocument()
    expect(within(panel).getByRole('link', { name: 'Bütün qalereya' })).toHaveAttribute('href', '/az/media')
  })
})

describe('StrategyDocs and EventCalendar', () => {
  it('birinci sənəd böyük kartdır, qalanlar sənəd kartı', () => {
    renderApp(
      <StrategyDocs
        title="Strategiya və sənədlər"
        moreLabel="Daha ətraflı"
        docs={[
          { key: 'a', title: 'Strategiya', summary: null, coverUrl: null, href: '/az/strategiya' },
          { key: 'b', title: 'Konsepsiya', summary: 'Qısa mətn', coverUrl: null, href: '/az/konsepsiya' },
        ]}
      />,
      { locale: 'az' },
    )

    expect(screen.getByRole('link', { name: 'Daha ətraflı' })).toHaveAttribute('href', '/az/strategiya')
    expect(screen.getByRole('link', { name: 'Konsepsiya' })).toHaveAttribute('href', '/az/konsepsiya')
    expect(screen.getByText('Qısa mətn')).toBeInTheDocument()
  })

  it('opens an external document in a new tab and a site page in the same one (spec 057)', () => {
    renderApp(
      <StrategyDocs
        title="Strategiya və sənədlər"
        moreLabel="Daha ətraflı"
        docs={[
          { key: 'a', title: 'Strategiya', summary: null, coverUrl: null, href: 'https://www.cbar.az/strategy.pdf' },
          { key: 'b', title: 'Konsepsiya', summary: null, coverUrl: null, href: '/az/konsepsiya' },
        ]}
      />,
      { locale: 'az' },
    )

    for (const link of [screen.getByRole('link', { name: 'Strategiya' }), screen.getByRole('link', { name: 'Daha ətraflı' })]) {
      expect(link).toHaveAttribute('href', 'https://www.cbar.az/strategy.pdf')
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    }
    expect(screen.getByRole('link', { name: 'Konsepsiya' })).not.toHaveAttribute('target')
  })

  it('təqvim: gün, ay adı, teqlər və saat', () => {
    renderApp(
      <EventCalendar
        locale="az"
        title="Təqvim"
        listHref="/az/media/events"
        events={[
          { key: 'e', date: '2026-10-15', time: '11:00', tags: ['Mətbuat konfransı', 'Press-reliz'], title: 'Konfrans', href: '/az/media/events/konfrans' },
        ]}
      />,
      { locale: 'az' },
    )

    const time = screen.getByText('15').closest('time') as HTMLElement
    expect(time).toHaveAttribute('dateTime', '2026-10-15')
    expect(within(time).getByText(/^Oktyabr$/i)).toBeInTheDocument()
    expect(screen.getByText('Mətbuat konfransı')).toBeInTheDocument()
    expect(screen.getByText('Press-reliz')).toBeInTheDocument()
    expect(screen.getByText('11:00')).toBeInTheDocument()
  })

  it('each event row is one link to the event, and the heading opens the events list (spec 059)', async () => {
    const user = userEvent.setup()
    renderApp(
      <EventCalendar
        locale="az"
        title="Təqvim"
        listHref="/az/media/events"
        events={[
          { key: 'a', date: '2026-12-23', time: '11:00', tags: ['Press-reliz'], title: 'Faiz dəhlizi', href: '/az/media/events/faiz-dehlizi' },
          { key: 'b', date: '2024-11-14', time: null, tags: [], title: 'COP29', href: '/az/cop29' },
        ]}
      />,
      { locale: 'az' },
    )

    expect(screen.getByRole('heading', { level: 2, name: 'Təqvim' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Təqvim' })).toHaveAttribute('href', '/az/media/events')

    const rows = screen.getAllByRole('listitem')
    expect(rows).toHaveLength(2)
    // One link per row, named by the title alone (the date and time stay outside it).
    expect(within(rows[0]).getAllByRole('link')).toHaveLength(1)
    expect(within(rows[0]).getByRole('link', { name: 'Faiz dəhlizi' })).toHaveAttribute('href', '/az/media/events/faiz-dehlizi')
    expect(within(rows[1]).getByRole('link', { name: 'COP29' })).toHaveAttribute('href', '/az/cop29')

    // Keyboard: heading, then one stop per row.
    await user.tab()
    expect(screen.getByRole('link', { name: 'Təqvim' })).toHaveFocus()
    await user.tab()
    expect(screen.getByRole('link', { name: 'Faiz dəhlizi' })).toHaveFocus()
    await user.tab()
    expect(screen.getByRole('link', { name: 'COP29' })).toHaveFocus()
  })
})

describe('keçid blokları', () => {
  it('sürətli keçidlər, faydalı keçidlər (gizli bloklar, FR-015) və promo banner', () => {
    renderApp(
      <>
        <QuickLinks
          title="Sürətli keçidlər"
          items={[
            { key: 'a', title: 'Kalkulyator', href: '/az/currencies' },
            { key: 'b', title: 'Keçidsiz', href: null },
          ]}
        />
        <UsefulLinks
          title="Faydalı keçidlər"
          items={[
            {
              key: 'c',
              title: 'Savadlı',
              href: 'https://savadli.az',
              host: 'savadli.az',
            },
          ]}
        />
        <PromoBannerCard
          banner={{
            title: 'Sikkələr',
            description: 'Yeni',
            href: 'https://www.e-cbar.az/coins',
          }}
          goLabel="Keçid et"
        />
      </>,
      { locale: 'az' },
    )

    expect(screen.getByRole('link', { name: /Kalkulyator/ })).toHaveAttribute('href', '/az/currencies')
    expect(screen.getByText('Keçidsiz')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Savadlı/ })).toHaveAttribute('target', '_blank')
    expect(screen.getByRole('link', { name: 'Keçid et' })).toHaveAttribute('href', 'https://www.e-cbar.az/coins')
  })

  it('şəkilli promo banner tam şəkil keçidi olur (coin banner)', () => {
    renderApp(
      <PromoBannerCard
        banner={{ title: 'Sikkələr', description: 'Yeni', href: 'https://coin.e-cbar.az/', imageUrl: 'http://api/media/9' }}
        goLabel="Keçid et"
      />,
      { locale: 'az' },
    )

    const link = screen.getByRole('link', { name: 'Sikkələr' })
    expect(link).toHaveAttribute('href', 'https://coin.e-cbar.az/')
    // The image is decorative (alt=""): the name is in the link's `aria-label`.
    expect(link.querySelector('img')).not.toBeNull()
  })
})
