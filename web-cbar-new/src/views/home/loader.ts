/**
 * Home page loader (spec 002 research R14; spec 022 data-model §2).
 *
 * First wave: parallel calls, each wrapped in `settle` — a failing block only turns that
 * block into an `ErrorState` (FR-016). Second wave: the previous rate sheet (for trends).
 * Blocks hidden in `HOME_BLOCKS` send no request (`/videos`). The strategy documents come
 * with `/homepage` (spec 057).
 */
import 'server-only'

import {
  formatDate,
  formatLongDate,
  formatMonthYear,
  mediaUrl,
  shiftIsoDate,
  toIsoDate,
} from '@/entities/content'
import {
  getCurrencies,
  previousSheet,
} from '@/features/currencies/api/currencies.api'
import { rateTrend } from '@/features/currencies/model/schemas'
import { getHomepage } from '@/features/homepage/api/homepage.api'
import {
  INFO_LINE_ALIASES,
  statRows,
  statUpdatedAt,
  type HomepageStrategyDoc,
  type StatRow,
} from '@/features/homepage/model/schemas'
import { getGalleries, getVideos } from '@/features/media/api/media.api'
import { getPressReleases } from '@/features/press-releases/api/press-releases.api'
import {
  getAzir,
  getInflation,
  getInflationSettings,
  getYieldCurveLatest,
} from '@/features/stats/api/stats.api'
import { AZIR_DEFAULT_DAYS } from '@/features/stats/model/constants'
import { HOME_AZIR_TERMS } from '@/features/stats/model/schemas'
import { ISO_DATE } from '@/shared/constants/time'
import {
  azirDailySeries,
  azirLatest,
  inflationSummary,
  yieldSeries,
  type ChartData,
} from '@/features/stats/model/series'
import { getT } from '@/shared/i18n/server'
import type { Locale } from '@/shared/i18n'
import { localizeHref } from '@/widgets/smart-link/smart-link'
import type { HeroSlide } from '@/widgets/hero-slider/hero-slider'
import type { CurrencyRow } from '@/widgets/home-cards/currency-card'
import { getEvents } from '@/features/events/api/events.api'
import { eventHref, eventsListHref } from '@/features/events/model/routes'
import type { CalendarEvent } from '@/widgets/home-cards/event-calendar'
import type {
  PromoBanner,
  PublicationCard,
  QuickLink,
  UsefulLink,
} from '@/widgets/home-cards/links-grid'
import { FEED_CARDS } from '@/widgets/home-cards/constants'
import type { FeedTab } from '@/widgets/home-cards/news-tabs'
import type { MoneyMarketTerm } from '@/widgets/home-cards/statistics-panels'
import type { StrategyDoc } from '@/widgets/home-cards/strategy-docs'

import { HOME_BLOCKS } from './blocks'
import { CALENDAR_EVENTS_MAX, STRATEGY_DOCS_MAX } from './constants'

export type HomeErrors = {
  homepage: boolean
  currencies: boolean
  pressReleases: boolean
  inflation: boolean
  azir: boolean
  galleries: boolean
  videos: boolean
  yieldCurve: boolean
}

export type HomeViewData = {
  locale: Locale
  errors: HomeErrors
  hero: HeroSlide[]
  currency: { dateLabel: string; rows: CurrencyRow[] } | null
  corridor: StatRow[]
  /** Last edit date of the corridor rows (`updatedAt`); empty when the API has none. */
  corridorDateLabel: string
  inflation: {
    current: number | null
    currentDate: string
    target: string | null
  } | null
  moneyMarket: {
    dateLabel: string
    current1D: number | null
    /** The latest 1D value comes from the fallback plan — `*` + footnote (spec 021 US6). */
    current1DReserve: boolean
    terms: MoneyMarketTerm[]
    series: ChartData | null
  } | null
  feedTabs: FeedTab[]
  promo: PromoBanner | null
  monetary: StatRow[]
  notes: { rows: StatRow[]; grid: StatRow[] }
  yieldCurve: { dateLabel: string; series: ChartData } | null
  banking: StatRow[]
  /** The first `STRATEGY_DOCS_MAX` documents of `/homepage` (spec 057); empty when the request fails. */
  strategyDocs: StrategyDoc[]
  /** The newest events by start date, past or upcoming (spec 059); a failed request hides the block. */
  calendar: CalendarEvent[]
  /** The events list, linked from the block heading (spec 059). */
  calendarHref: string
  /** Hidden blocks (spec 022 FR-015) — data comes from `/homepage`, no extra request. */
  publications: PublicationCard[]
  quickLinks: QuickLink[]
  usefulLinks: UsefulLink[]
}

type Settled<T> = { data: T | null; error: boolean }

async function settle<T>(promise: Promise<T>): Promise<Settled<T>> {
  try {
    return { data: await promise, error: false }
  } catch {
    return { data: null, error: true }
  }
}

/** Stands in for a hidden block — no request, no error. */
const SKIPPED: Settled<never> = { data: null, error: false }

/**
 * The coin banner in Figma (`813:26806`) is only the image of the commemorative coins
 * banner. When the CMS banner has no image, the static export is used for that banner alone
 * (link `coin.e-cbar.az`), never for others. TODO(cms): once the image is uploaded to the
 * CMS banner this fallback is unused — the CMS image always wins.
 */
function promoFallbackImage(link: string | null): string | null {
  return hostOf(link) === 'coin.e-cbar.az' ? '/site/home/coin-banner.png' : null
}

function hostOf(url: string | null): string {
  if (!url) return ''
  try {
    return new URL(url).hostname
  } catch {
    return url.replace(/^https?:\/\//, '').replace(/\/.*$/, '')
  }
}

/** A strategy card (spec 057): the API resolves the link and the cover; a site path gets the locale here. */
function toStrategyDoc(doc: HomepageStrategyDoc, locale: Locale): StrategyDoc {
  return {
    key: String(doc.id),
    title: doc.title,
    summary: doc.summary,
    coverUrl: mediaUrl(doc.coverUrl),
    href: localizeHref(doc.href, locale, `/${locale}`),
  }
}

export async function loadHome(locale: Locale): Promise<HomeViewData> {
  const t = getT(locale, 'home')

  const [
    home,
    currencies,
    releases,
    announcements,
    inflation,
    inflationSettings,
    azir,
    galleries,
    videos,
    curve,
    calendarEvents,
  ] = await Promise.all([
    settle(getHomepage(locale)),
    settle(getCurrencies(locale)),
    // As on the old site, announcements are press releases with `type = 2` — the News tab shows only 1.
    settle(getPressReleases(locale, { pageSize: FEED_CARDS, type: '1' })),
    HOME_BLOCKS.announcementsTab ? settle(getPressReleases(locale, { pageSize: FEED_CARDS, type: '2' })) : SKIPPED,
    settle(getInflation()),
    settle(getInflationSettings()),
    // Last 60 days, all terms (spec 021 R13) — the card's latest values do not change.
    settle(getAzir({ from: shiftIsoDate(toIsoDate(new Date()), -AZIR_DEFAULT_DAYS) })),
    settle(getGalleries(locale, { pageSize: FEED_CARDS })),
    // The video tab is hidden (spec 022 FR-015) — no request is sent.
    HOME_BLOCKS.videosTab ? settle(getVideos(locale, { pageSize: FEED_CARDS })) : SKIPPED,
    settle(getYieldCurveLatest()),
    // Newest by start date across past and upcoming (spec 059), so the block never empties between events.
    HOME_BLOCKS.calendar ? settle(getEvents(locale, { sort: 'newest', pageSize: CALENDAR_EVENTS_MAX })) : SKIPPED,
  ])

  // Second wave: waits for the rate sheet's **date** (for the trend arrows).
  // Before spec 022 the featured release's summary was fetched here too; the new news
  // cards have no summary, so that request is gone.
  const previous = currencies.data ? await previousSheet(locale, currencies.data.date) : null

  // ── Slider ──
  const hero: HeroSlide[] = (home.data?.newsSlider ?? []).map((item, i) => ({
    key: `hero-${i}`,
    title: item.title,
    description: item.description,
    href: localizeHref(item.link, locale, `/${locale}/press-releases`),
    imageUrl: mediaUrl(item.imageUrl),
    dateLabel: formatLongDate(item.newsDate, locale),
  }))

  // ── Exchange rates (trend) ──
  const prevByCode = new Map(
    (previous?.rates ?? []).map((r) => [r.code, r.rate]),
  )
  const currencyRows: CurrencyRow[] = (currencies.data?.rates ?? [])
    .filter((r) => r.showOnHomepage)
    .map((r) => ({
      code: r.code,
      nominal: r.nominal,
      rate: r.rate,
      trend: rateTrend(r.rate, prevByCode.get(r.code)),
    }))
  const currency =
    currencies.data && currencyRows.length > 0
      ? {
          dateLabel: formatDate(currencies.data.date, locale),
          rows: currencyRows,
        }
      : null

  // ── Info lines ──
  const groups = (home.data?.infoLines ?? []).filter((g) => g.items.length > 0)
  const corridor = statRows(groups, INFO_LINE_ALIASES.corridor)
  // The decision date is not in the schema — the editor's last save time is shown (spec 022).
  const corridorDateLabel = formatDate(statUpdatedAt(groups, INFO_LINE_ALIASES.corridor), locale)
  // TODO(api): the API has no info-line date (only `year`) — `updatedAt` for the monetary
  // panel's date will be added by a separate spec (see `MonetaryPanel`).
  const monetary = statRows(groups, INFO_LINE_ALIASES.monetary)
  const notes = {
    rows: statRows(groups, INFO_LINE_ALIASES.notesVolume),
    grid: statRows(groups, INFO_LINE_ALIASES.notesLevels),
  }
  const banking = statRows(groups, INFO_LINE_ALIASES.banking)

  // ── Inflation ──
  // Current/target/date come from the admin's "Monthly inflation parameters" form, as on
  // the old site. Until that form is saved, the monthly series is used instead.
  const summary = inflationSummary(inflation.data ?? [])
  const settings = inflationSettings.data
  const inflationBlock =
    settings || summary.current
      ? {
          current: settings
            ? settings.currentInflation
            : (summary.current?.value ?? null),
          currentDate: settings
            ? formatMonthYear(
                Number(settings.nextUpdateDate.slice(0, ISO_DATE.YEAR_END)),
                Number(settings.nextUpdateDate.slice(ISO_DATE.MONTH_START, ISO_DATE.MONTH_END)),
                locale,
              )
            : summary.current
              ? formatMonthYear(
                  summary.current.year,
                  summary.current.month,
                  locale,
                )
              : '',
          target: settings
            ? settings.targetInflation
            : summary.target != null
              ? String(summary.target)
              : null,
        }
      : null

  // ── Money market ──
  const latest = azirLatest(azir.data ?? [])
  const current1D = latest.byTerm.get('1D') ?? null
  const terms: MoneyMarketTerm[] = HOME_AZIR_TERMS.flatMap((term) => {
    const rate = latest.byTerm.get(term)
    return rate == null
      ? []
      : [{ term, days: Number(term.replace('D', '')), rate }]
  })
  const daily = azirDailySeries(azir.data ?? [])
  const moneyMarket =
    current1D != null || terms.length > 0
      ? {
          dateLabel: latest.date ? formatDate(latest.date, locale) : '',
          current1D,
          current1DReserve: current1D != null && latest.reserve1D,
          terms,
          series: daily.categories.length > 1 ? daily : null,
        }
      : null

  // ── Media tabs ──
  const eventType = getT(locale, 'media')
  const calendar: CalendarEvent[] = (calendarEvents.data?.items ?? []).map((event) => ({
    key: String(event.id),
    date: event.startsOn,
    time: event.startTime,
    tags: event.type === null ? [] : [eventType(`events.types.${event.type}`)],
    title: event.title,
    href: eventHref(event, locale),
  }))
  const newsItems = (releases.data?.items ?? []).map((r) => ({
    key: `press-${r.id}`,
    title: r.title,
    dateLabel: formatDate(r.publishedAt, locale),
    href: `/${locale}/press-releases/${r.slug}`,
    imageUrl: mediaUrl(r.imageUrl),
    kind: 'image' as const,
  }))
  const announcementItems = (announcements.data?.items ?? []).map((r) => ({
    key: `announcement-${r.id}`,
    title: r.title,
    dateLabel: formatDate(r.publishedAt, locale),
    href: `/${locale}/press-releases/${r.slug}`,
    imageUrl: mediaUrl(r.imageUrl),
    kind: 'image' as const,
  }))
  const galleryItems = (galleries.data?.items ?? []).map((g) => ({
    key: `gallery-${g.id}`,
    title: g.title,
    dateLabel: g.eventDate ? formatDate(g.eventDate, locale) : null,
    href: `/${locale}/media/galleries/${g.id}`,
    imageUrl: mediaUrl(g.coverUrl),
    kind: 'image' as const,
  }))
  const videoItems = (videos.data?.items ?? []).map((v) => ({
    key: `video-${v.id}`,
    title: v.title,
    dateLabel: null,
    href: v.youtubeUrl || `/${locale}/media`,
    imageUrl: null,
    kind: 'video' as const,
  }))
  const feedTabs: FeedTab[] = [
    {
      key: 'news',
      label: t('news'),
      items: newsItems,
      viewAllHref: `/${locale}/press-releases`,
      viewAllLabel: t('allNews'),
    },
    {
      key: 'announcements',
      label: t('announcements'),
      items: announcementItems,
      viewAllHref: `/${locale}/press-releases?type=2`,
      viewAllLabel: t('allAnnouncements'),
    },
    {
      key: 'gallery',
      label: t('gallery'),
      items: galleryItems,
      viewAllHref: `/${locale}/media`,
      viewAllLabel: t('allGallery'),
    },
    ...(HOME_BLOCKS.videosTab
      ? [
          {
            key: 'videos',
            label: t('videos'),
            items: videoItems,
            viewAllHref: `/${locale}/media`,
            viewAllLabel: t('viewAll'),
          },
        ]
      : []),
  ]

  // ── Banners, publications, links ──
  const banners = home.data?.banners ?? []
  const promoSource = banners.find((b) => b.description)
  const promo: PromoBanner | null = promoSource
    ? {
        title: promoSource.title,
        description: promoSource.description,
        href: localizeHref(promoSource.link, locale, `/${locale}`),
        imageUrl: mediaUrl(promoSource.imageUrl) ?? promoFallbackImage(promoSource.link),
      }
    : null
  const usefulLinks: UsefulLink[] = banners
    .filter((b) => !b.description)
    .map((b, i) => ({
      key: `useful-${i}`,
      title: b.title,
      href: b.link ? localizeHref(b.link, locale, `/${locale}`) : null,
      host: hostOf(b.link),
    }))
  const publications: PublicationCard[] = (home.data?.publications ?? []).map(
    (p, i) => ({
      key: `pub-${i}`,
      title: p.title,
      href: p.url
        ? p.url.startsWith('/media/')
          ? (mediaUrl(p.url) ?? p.url)
          : localizeHref(p.url, locale, `/${locale}`)
        : `/${locale}`,
      imageUrl: mediaUrl(p.imageUrl),
      dateLabel: formatDate(p.publishedAt, locale),
    }),
  )
  const quickLinks: QuickLink[] = (home.data?.links ?? []).map((l, i) => ({
    key: `link-${i}`,
    title: l.title,
    href: l.url ? localizeHref(l.url, locale, `/${locale}`) : null,
  }))

  const yieldBlock =
    curve.data && curve.data.yields.length > 0
      ? {
          dateLabel: formatDate(curve.data.curveDate, locale),
          series: yieldSeries(curve.data, t('yieldCurve')),
        }
      : null

  return {
    locale,
    errors: {
      homepage: home.error,
      currencies: currencies.error,
      pressReleases: releases.error,
      inflation: inflation.error,
      azir: azir.error,
      galleries: galleries.error,
      videos: videos.error,
      yieldCurve: curve.error,
    },
    hero,
    currency,
    corridor,
    corridorDateLabel,
    inflation: inflationBlock,
    moneyMarket,
    feedTabs,
    promo,
    monetary,
    notes,
    yieldCurve: yieldBlock,
    banking,
    strategyDocs: HOME_BLOCKS.strategyDocs
      ? (home.data?.strategyDocs ?? []).slice(0, STRATEGY_DOCS_MAX).map((doc) => toStrategyDoc(doc, locale))
      : [],
    calendar,
    calendarHref: eventsListHref(locale),
    publications,
    quickLinks,
    usefulLinks,
  }
}
