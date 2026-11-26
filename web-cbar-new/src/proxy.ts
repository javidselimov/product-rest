/**
 * Proxy (Next 16-da `middleware.ts`-in yeni adı) — spec 002 contracts/routes.md §2, research R5.
 *
 * İki iş, **ardıcıllığı vacibdir** (bunlardan əvvəl köhnə URL xəritəsi — `legacyRedirect`, 308):
 *   1. Locale seqmenti yoxdursa → **həmişə** `/az{path}` (307, sorğu qorunur).
 *      Dil koduna oxşayan, amma dəstəklənməyən seqment (`/ru/…`) yönləndirilmir —
 *      tətbiq 404 verir (səssiz defolt-a düşmə yoxdur).
 *   2. `x-locale` başlığı (root layout `<html lang>` üçün) + nonce-lu CSP.
 *
 * Public sayt anonimdir: sessiya gate-i yoxdur (spec 002 D3). Cookie yazılmır.
 */
import { NextResponse, type NextRequest } from 'next/server'

import {
  CONSUMER_ACTIVITY_SLUGS,
  CONSUMER_COMPLAINT_SLUG,
  CONSUMER_INFOGRAPHICS_ANCHOR,
  CONSUMER_INFOGRAPHICS_SLUG,
  CONSUMER_INSURANCE_SLUG,
  CONSUMER_ROOT_SLUG,
  CONSUMER_STATISTICS_SLUG,
  LITERACY_GENERAL_SLUGS,
  FAQ_SLUG,
  FINCERT_SLUG,
  LITERACY_ROOT_SLUG,
  MICROFINANCE_SLUG,
  RISK_SUPERVISION_SLUG,
  STRATEGY_SLUG,
  RELEASE_SCHEDULE_PATH,
  RELEASE_SCHEDULE_SLUGS,
} from '@/entities/page-node'
import { COMPLAINT_TAB } from '@/features/about-content/model/constants'
import { legacyDateToIso } from '@/features/stats/model/azir-range'
import { apiOrigin, env } from '@/server/env'
import { LOCALE_HEADER } from '@/shared/constants/headers'
import { HTTP_STATUS } from '@/shared/constants/http'
import { QUERY_PARAM } from '@/shared/constants/query-params'
import {
  CSP_HEADER,
  NONCE_HEADER,
  contentSecurityPolicy,
  createNonce,
} from '@/shared/config/security-headers'
import { defaultLocale, isSupportedLocale, type Locale } from '@/shared/i18n'

/** `az`, `en`, `de`, `pt-BR` — dil koduna oxşayan seqment. */
const LOCALE_LIKE = /^[a-z]{2}(-[A-Za-z]{2,4})?$/

/** Yolun birinci seqmenti dəstəklənən dildirsə onu qaytarır. */
export function localeFromPathname(pathname: string): string | null {
  const first = pathname.split('/')[1]
  return isSupportedLocale(first) ? first : null
}

/** Köhnə cbar.az AZIR səhifəsi (spec 021 contracts/web-routes.md §3). */
const LEGACY_AZIR = /^\/(?:(az|en)\/)?indeks\/rates\/?$/i

/** Köhnə qalereya və video siyahıları (spec 028 FR-016, research R6): `gallery/photos[/detail/{id}]`, `videos`. */
const LEGACY_GALLERY = /^\/(?:(az|en)\/)?gallery\/photos(?:\/detail\/(\d+))?\/?$/i
const LEGACY_VIDEOS = /^\/(?:(az|en)\/)?videos\/?$/i

/** Legacy page 72, the hand-typed schedule table, and CMS page 130's own addresses (spec 039 FR-020). */
const LEGACY_RELEASE_SCHEDULE_PAGE = /^\/(?:(az|en)\/)?page-72(?:\/.*)?$/i
/** Legacy FAQ page (the old site's `page-131/sual-cavab`, spec 051 FR-020): goes to the FAQ page of the locale. */
const LEGACY_FAQ_PAGE = /^\/(?:(az|en)\/)?page-131(?:\/.*)?$/i
/** Legacy FinCERT page (the old site's `page-893/fincert`, spec 053 US5): goes to the FinCERT page of the locale. */
const LEGACY_FINCERT_PAGE = /^\/(?:(az|en)\/)?page-893(?:\/.*)?$/i
/** The legacy governor's letter on the strategy (`PagesController::actionStrategy`, spec 057 US4): goes to page 104. */
const LEGACY_STRATEGY_PAGE = /^\/(?:(az|en)\/)?pages\/strategy\/?$/i
/** The legacy risk-based supervision concept page (`page-872/…`, spec 057 US4): goes to page 66. */
const LEGACY_RISK_SUPERVISION_PAGE = /^\/(?:(az|en)\/)?page-872(?:\/.*)?$/i
/** The legacy microfinance framework page (`page-878/…`, spec 057 US4): goes to page 76. */
const LEGACY_MICROFINANCE_PAGE = /^\/(?:(az|en)\/)?page-878(?:\/.*)?$/i
/** Legacy pages that go to one CMS page of the locale, whatever follows their number. */
const LEGACY_PAGES: ReadonlyArray<readonly [RegExp, Record<Locale, string>]> = [
  [LEGACY_FAQ_PAGE, FAQ_SLUG],
  [LEGACY_FINCERT_PAGE, FINCERT_SLUG],
  [LEGACY_STRATEGY_PAGE, STRATEGY_SLUG],
  [LEGACY_RISK_SUPERVISION_PAGE, RISK_SUPERVISION_SLUG],
  [LEGACY_MICROFINANCE_PAGE, MICROFINANCE_SLUG],
]
const RELEASE_SCHEDULE_SLUG = new RegExp(`^/(az|en)/(?:${[...RELEASE_SCHEDULE_SLUGS].join('|')})/?$`, 'i')

/**
 * "General information" of the financial literacy section: its text is the section root's now, so its address,
 * flat or under the section path, goes to the root (spec 047 research R8). Draft `-copy` slugs do not match.
 */
const LITERACY_GENERAL_SLUG = new RegExp(`^/(az|en)/(?:.+/)?(?:${[...LITERACY_GENERAL_SLUGS].join('|')})/?$`, 'i')

/** A path ending in one of `slugs`, flat or under the section path; draft `-copy` slugs do not match. */
function slugPath(slugs: Iterable<string | undefined>): RegExp {
  const names = [...slugs].filter((slug): slug is string => Boolean(slug)).join('|')
  return new RegExp(`^/(az|en)/(?:.+/)?(?:${names})/?$`, 'i')
}

/**
 * Consumer and investor rights (spec 050 research R6): "Activity directions" goes to the root that carries its text, the
 * insurance complaint index to the complaint page's insurance tab, the infographics to the statistics page's block.
 */
const CONSUMER_ACTIVITY_PATH = slugPath(CONSUMER_ACTIVITY_SLUGS)
const CONSUMER_INSURANCE_PATH = slugPath(Object.values(CONSUMER_INSURANCE_SLUG))
const CONSUMER_INFOGRAPHICS_PATH = slugPath(Object.values(CONSUMER_INFOGRAPHICS_SLUG))

function consumerRedirect(url: URL): URL | null {
  const activity = CONSUMER_ACTIVITY_PATH.exec(url.pathname)
  if (activity) {
    const locale = activity[1]!.toLowerCase() as Locale
    return new URL(`/${locale}/${CONSUMER_ROOT_SLUG[locale]}`, url)
  }
  const insurance = CONSUMER_INSURANCE_PATH.exec(url.pathname)
  if (insurance) {
    const locale = insurance[1]!.toLowerCase() as Locale
    const target = new URL(`/${locale}/${CONSUMER_COMPLAINT_SLUG[locale]}`, url)
    target.searchParams.set(QUERY_PARAM.TAB, COMPLAINT_TAB.INSURANCE)
    return target
  }
  const infographics = CONSUMER_INFOGRAPHICS_PATH.exec(url.pathname)
  if (infographics) {
    const locale = infographics[1]!.toLowerCase() as Locale
    const target = new URL(`/${locale}/${CONSUMER_STATISTICS_SLUG[locale]}`, url)
    target.hash = CONSUMER_INFOGRAPHICS_ANCHOR
    return target
  }
  return null
}

/** The legacy site took the language from `?language=`; without it, the path prefix, and without that, `az`. */
function legacyLocale(url: URL, pathLocale: string | undefined): Locale {
  const language = url.searchParams.get(QUERY_PARAM.LANGUAGE)?.toLowerCase()
  if (isSupportedLocale(language)) return language
  const path = pathLocale?.toLowerCase()
  return isSupportedLocale(path) ? path : defaultLocale
}

/** `LEGACY_PAGES`: the CMS page of the locale, `null` when no legacy page matches. */
function legacyPageRedirect(url: URL): URL | null {
  for (const [pattern, slugs] of LEGACY_PAGES) {
    const match = pattern.exec(url.pathname)
    if (match) {
      const locale = legacyLocale(url, match[1])
      return new URL(`/${locale}/${slugs[locale]}`, url)
    }
  }
  return null
}

/**
 * Köhnə URL xəritəsi (Konstitusiya VII.2) — 308. Tarixlər `d/m/Y` idi. Səhv tarix və
 * digər parametrlər atılır.
 */
export function legacyRedirect(url: URL): URL | null {
  const gallery = LEGACY_GALLERY.exec(url.pathname)
  if (gallery) {
    const id = gallery[2]
    return new URL(`/${legacyLocale(url, gallery[1])}/media/galleries${id ? `/${id}` : ''}`, url)
  }
  const videos = LEGACY_VIDEOS.exec(url.pathname)
  if (videos) return new URL(`/${legacyLocale(url, videos[1])}/media/videos`, url)

  const schedulePage = LEGACY_RELEASE_SCHEDULE_PAGE.exec(url.pathname)
  if (schedulePage) return new URL(`/${legacyLocale(url, schedulePage[1])}${RELEASE_SCHEDULE_PATH}`, url)
  const legacyPage = legacyPageRedirect(url)
  if (legacyPage) return legacyPage
  const scheduleSlug = RELEASE_SCHEDULE_SLUG.exec(url.pathname)
  if (scheduleSlug) return new URL(`/${scheduleSlug[1]!.toLowerCase()}${RELEASE_SCHEDULE_PATH}`, url)
  const literacyGeneral = LITERACY_GENERAL_SLUG.exec(url.pathname)
  if (literacyGeneral) {
    const locale = literacyGeneral[1]!.toLowerCase() as Locale
    return new URL(`/${locale}/${LITERACY_ROOT_SLUG[locale]}`, url)
  }
  const consumer = consumerRedirect(url)
  if (consumer) return consumer

  const match = LEGACY_AZIR.exec(url.pathname)
  if (!match) return null

  const locale = legacyLocale(url, match[1])
  const exportFile = url.searchParams.get('export') === 'true'

  const target = new URL(`/${locale}/statistics/azir${exportFile ? '/export' : ''}`, url)
  for (const name of ['dateFrom', 'dateTo']) {
    const iso = legacyDateToIso(url.searchParams.get(name))
    if (iso) target.searchParams.set(name, iso)
  }
  return target
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Addım 0 — köhnə ünvanlar locale yönləndirməsindən əvvəl.
  const legacy = legacyRedirect(new URL(request.url))
  if (legacy) return NextResponse.redirect(legacy, HTTP_STATUS.PERMANENT_REDIRECT)

  const pathLocale = localeFromPathname(pathname)

  // Addım 1 — locale seqmenti yoxdur.
  if (!pathLocale) {
    if (LOCALE_LIKE.test(pathname.split('/')[1] ?? '')) {
      return NextResponse.next()
    }

    const url = request.nextUrl.clone()
    url.pathname = `/${defaultLocale}${pathname === '/' ? '' : pathname}`
    return NextResponse.redirect(url)
  }

  // Addım 2 — URL həqiqətin mənbəyidir: server layout-u üçün başlığa qoyulur.
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set(LOCALE_HEADER, pathLocale)

  // CSP nonce-u: Next onu sorğunun `Content-Security-Policy` başlığından oxuyur
  // və öz inline script-lərinə qoşur. Media/iframe mənbələri runtime env-dən.
  const nonce = createNonce()
  const csp = contentSecurityPolicy({
    nonce,
    apiOrigin: apiOrigin(env),
    frameSources: env.CSP_FRAME_SRC,
  })
  requestHeaders.set(NONCE_HEADER, nonce)
  requestHeaders.set(CSP_HEADER, csp)

  const response = NextResponse.next({ request: { headers: requestHeaders } })

  // `set` — `append` deyil: `next.config.ts`-dəki nonce-suz fallback əvəz olunur,
  // əks halda brauzer iki siyasətin kəsişməsini tətbiq edərdi.
  response.headers.set(CSP_HEADER, csp)

  return response
}

export const config = {
  // `_next`, `api` və fayl uzantılı yollar kənarda qalır (köhnə `web-cbar` ilə eyni).
  //
  // `media/{id}` fayl proxy-si də kənardadır (spec 003 FR-006): `/media/12` uzantısız olduğu
  // üçün bu matcher-ə düşürdü, `media` isə dil kodu olmadığından Addım 1 onu `/az/media/12`-yə
  // yönləndirərdi — media proxy marşrutu heç vaxt çağırılmazdı. Yalnız rəqəmli seqment
  // kənardadır (spec 028 FR-015): `/media`, `/media/galleries` səhifədir və locale alır.
  matcher: ['/((?!_next|api|media/\\d+|.*\\..*).*)'],
}
