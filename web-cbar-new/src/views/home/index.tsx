/**
 * Home page view — Figma "Main page" (`813:25078`, spec 022 FR-010…FR-016).
 *
 * Order: first screen (slider + AZN / inflation / rate corridor) → key indicators (tabs)
 * → Media (tabs, full-width grey background) → promo banner → Strategy and documents | Calendar.
 * 80px between sections. Each section opens its own container (`<main>` has none, R3).
 * A block error is an `ErrorState` in that block only (spec 002 FR-021). Hidden blocks are in
 * `HOME_BLOCKS` — not removed (FR-015).
 *
 * Sections below the first screen reveal on scroll (spec 049). The first-screen row is never wrapped,
 * and neither is the Media section: its cards reveal themselves, so reveals do not nest.
 */
import { cn } from '@cbar/lib-react-ui-kit/lib'
import type { ReactNode } from 'react'

import { getT } from '@/shared/i18n/server'
import { ErrorState } from '@/shared/ui/error-state'
import { Reveal } from '@/shared/ui/reveal'
import { SiteContainer } from '@/shared/ui/site-container'
import { HeroSlider } from '@/widgets/hero-slider/hero-slider'
import { CorridorCard } from '@/widgets/home-cards/corridor-card'
import { CurrencyCard } from '@/widgets/home-cards/currency-card'
import { EventCalendar } from '@/widgets/home-cards/event-calendar'
import { InflationCard } from '@/widgets/home-cards/inflation-card'
import { PromoBannerCard, Publications, QuickLinks, UsefulLinks } from '@/widgets/home-cards/links-grid'
import { NewsTabs } from '@/widgets/home-cards/news-tabs'
import { SectionTabs, type SectionTab } from '@/widgets/home-cards/section-tabs'
import {
  FinancialSectorPanel,
  MonetaryPanel,
  MoneyMarketPanel,
  NotesPanel,
  YieldCurvePanel,
} from '@/widgets/home-cards/statistics-panels'
import { StrategyDocs } from '@/widgets/home-cards/strategy-docs'

import { HOME_BLOCKS } from './blocks'
import { FULL_ROW_CARDS } from './constants'
import type { HomeViewData } from './loader'

function BlockError({ title }: { title: string }) {
  return <ErrorState kind="server" title={title} className="h-full" />
}

/** Key indicator tabs — a tab without data is not shown (data-model §3). */
function statisticsTabs(data: HomeViewData, blockError: string): SectionTab[] {
  const { locale, errors } = data
  const t = getT(locale, 'home')
  const tabs: (SectionTab | null)[] = [
    data.monetary.length > 0
      ? {
          key: 'monetary',
          label: t('monetaryTab'),
          content: <MonetaryPanel locale={locale} title={t('monetaryTab')} rows={data.monetary} />,
        }
      : null,
    errors.yieldCurve || data.yieldCurve
      ? {
          key: 'yield-curve',
          label: t('yieldCurve'),
          content: data.yieldCurve ? (
            <YieldCurvePanel
              locale={locale}
              title={t('yieldCurve')}
              dateLabel={data.yieldCurve.dateLabel}
              series={data.yieldCurve.series}
            />
          ) : (
            <BlockError title={blockError} />
          ),
        }
      : null,
    errors.azir || data.moneyMarket
      ? {
          key: 'money-market',
          label: t('moneyMarketTab'),
          content: data.moneyMarket ? (
            <MoneyMarketPanel locale={locale} title={t('moneyMarketTab')} {...data.moneyMarket} />
          ) : (
            <BlockError title={blockError} />
          ),
        }
      : null,
    data.notes.rows.length > 0 || data.notes.grid.length > 0
      ? {
          key: 'notes',
          label: t('notesTab'),
          content: <NotesPanel locale={locale} title={t('notesTab')} rows={data.notes.rows} grid={data.notes.grid} />,
        }
      : null,
    data.banking.length > 0
      ? {
          key: 'financial-sector',
          label: t('financialSector'),
          content: (
            <FinancialSectorPanel
              locale={locale}
              title={t('financialSector')}
              sectorTitle={t('bankingSector')}
              rows={data.banking}
            />
          ),
        }
      : null,
  ]
  return tabs.filter((tab): tab is SectionTab => tab !== null)
}

export function HomeView({ data }: { data: HomeViewData }) {
  const { locale, errors } = data
  const t = getT(locale, 'home')
  const blockError = t('blockError')

  const cards: ReactNode[] = [
    errors.currencies ? (
      <BlockError key="currency" title={blockError} />
    ) : data.currency ? (
      <CurrencyCard key="currency" locale={locale} dateLabel={data.currency.dateLabel} rows={data.currency.rows} />
    ) : null,
    errors.inflation ? (
      <BlockError key="inflation" title={blockError} />
    ) : data.inflation ? (
      <InflationCard key="inflation" locale={locale} {...data.inflation} />
    ) : null,
    data.corridor.length > 0 ? <CorridorCard key="corridor" locale={locale} items={data.corridor} dateLabel={data.corridorDateLabel} /> : null,
  ].filter(Boolean)

  const statistics = statisticsTabs(data, blockError)
  const hasFeed = data.feedTabs.some((tab) => tab.items.length > 0)
  const hasHero = errors.homepage || data.hero.length > 0

  return (
    <div data-slot="home-view" className="flex flex-col gap-20">
      {hasHero || cards.length > 0 ? (
        <section aria-label={t('financialIndicators')} className="bg-site-surface-muted pb-20 desk:pb-0">
          {/*
            Figma: the slider starts at the left edge of the screen; the cards' right gap is 92px (5.3%) at 1728.
            Deviation from Figma (2026-10-19, user decision): on desktop the row is built at the Figma size (744)
            and scaled as a whole by `--hero-scale` (`widgets/hero-scale`, height left after the header / 744) —
            whatever the browser zoom, slider + right panel fill the first screen in proportion and the sections
            below appear only on scroll. Without JS the scale is 1 (Figma size).
          */}
          <div className="flex flex-col gap-6 desk:h-[744px] desk:flex-row desk:items-start desk:pr-[max(1rem,5.3%)] desk:[zoom:var(--hero-scale,1)]">
            {hasHero ? (
              <div className="min-w-0 desk:flex-1">
                {errors.homepage ? <ErrorState kind="server" /> : <HeroSlider slides={data.hero} />}
              </div>
            ) : null}
            {cards.length > 0 ? (
              <div
                className={cn(
                  'flex flex-col gap-4 px-4 desk:w-106 desk:shrink-0 desk:px-0 desk:pt-6 desk:pb-6',
                  // Three cards fill 744 exactly (24 + 286 + 202 + 200 + 2×16). At a small scale 1px borders
                  // do not shrink and the cards overflow by a few px — the gaps flex, the last card ends with the slider.
                  // `*:h-auto`: in the full-height column `BlockError`'s `h-full` must not take the whole column.
                  cards.length === FULL_ROW_CARDS && 'desk:h-full desk:justify-between desk:gap-0 desk:*:h-auto',
                )}
              >
                {cards}
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {statistics.length > 0 ? (
        <Reveal>
          <SiteContainer className="">
            <SectionTabs title={t('overview')} tabs={statistics} slot="statistics-tabs" tabsAlign="end" className="gap-15" />
          </SiteContainer>
        </Reveal>
      ) : null}

      {hasFeed || errors.pressReleases ? (
        <section aria-label={t('media')} className="bg-site-surface-muted py-20">
          <SiteContainer className="">
            {hasFeed ? <NewsTabs title={t('media')} tabs={data.feedTabs} /> : <BlockError title={blockError} />}
          </SiteContainer>
        </section>
      ) : null}

      {data.promo ? (
        <Reveal>
          <SiteContainer className="">
            <PromoBannerCard banner={data.promo} goLabel={t('goTo')} />
          </SiteContainer>
        </Reveal>
      ) : null}

      {data.strategyDocs.length > 0 || data.calendar.length > 0 ? (
        // The Figma gap is 88px, but 872 + 88 + 424 = 1384 > 1320 — 24px makes it fit (document cards do not shrink).
        <Reveal>
          <SiteContainer className="flex flex-col gap-20 desk:flex-row desk:justify-between desk:gap-6">
            <StrategyDocs title={t('strategyDocs')} moreLabel={t('moreDetails')} docs={data.strategyDocs} />
            <EventCalendar
              locale={locale}
              title={t('calendar')}
              listHref={data.calendarHref}
              events={data.calendar}
            />
          </SiteContainer>
        </Reveal>
      ) : null}

      {/* Hidden blocks (spec 022 FR-015) — can be brought back through HOME_BLOCKS. */}
      {HOME_BLOCKS.publications && data.publications.length > 0 ? (
        <Reveal>
          <SiteContainer className="">
            <Publications title={t('publications')} items={data.publications} />
          </SiteContainer>
        </Reveal>
      ) : null}
      {HOME_BLOCKS.usefulLinks && data.usefulLinks.length > 0 ? (
        <Reveal>
          <SiteContainer className="">
            <UsefulLinks title={t('usefulLinks')} items={data.usefulLinks} />
          </SiteContainer>
        </Reveal>
      ) : null}
      {HOME_BLOCKS.quickLinks && data.quickLinks.length > 0 ? (
        <Reveal>
          <SiteContainer className="">
            <QuickLinks title={t('quickLinks')} items={data.quickLinks} />
          </SiteContainer>
        </Reveal>
      ) : null}
    </div>
  )
}
