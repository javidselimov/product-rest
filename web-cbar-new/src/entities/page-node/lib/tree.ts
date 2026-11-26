/**
 * Tree walking for the section's left menu and the breadcrumb chain (data-model.md §2).
 */
import type { Locale } from '@/shared/i18n'

import type { PageNode } from '../model/schemas'

/** Chain from the root to the node with `slug`; `null` if not found. DFS, first match. */
export function findChain(tree: PageNode[], slug: string): PageNode[] | null {
  for (const node of tree) {
    if (node.slug === slug) return [node]
    const inner = findChain(node.children, slug)
    if (inner) return [node, ...inner]
  }
  return null
}

/** Turns the chain's slugs into a `/{locale}/a/b/c` path. */
export function hrefFor(chain: PageNode[], locale: Locale): string {
  return `/${locale}/${chain.map((n) => n.slug).join('/')}`
}

/** Chain from the root to the first node matching the predicate; `null` if not found. DFS. */
export function findChainBy(tree: PageNode[], match: (node: PageNode) => boolean): PageNode[] | null {
  for (const node of tree) {
    if (match(node)) return [node]
    const inner = findChainBy(node.children, match)
    if (inner) return [node, ...inner]
  }
  return null
}

/** The events list (spec 034). */
export const EVENTS_PATH = '/media/events'

const EVENTS_SLUGS: ReadonlySet<string> = new Set(['tedbirler', 'events'])

/**
 * The legacy "Events" page, now the events list. Its subtree stays in the tree, since the old
 * pages keep their breadcrumb and left menu, and the menus leave it out on their own.
 */
export function isEventsNode(node: PageNode): boolean {
  return node.navUrl === EVENTS_PATH || (!node.navUrl && node.slug !== null && EVENTS_SLUGS.has(node.slug))
}

/** The information disclosure schedule (spec 039). */
export const RELEASE_SCHEDULE_PATH = '/media/release-schedule'

/** Slugs of CMS page 130 (legacy page 72); its table is now a content type of its own. */
export const RELEASE_SCHEDULE_SLUGS: ReadonlySet<string> = new Set([
  'melumatlarin-yayimlanmasi-qrafiki',
  'information-disclosure-schedule',
])

/** The CMS page of the schedule. It keeps its title and intro, but the menus lead to the feature route. */
export function isReleaseScheduleNode(node: PageNode): boolean {
  return (
    node.navUrl === RELEASE_SCHEDULE_PATH ||
    (!node.navUrl && node.slug !== null && RELEASE_SCHEDULE_SLUGS.has(node.slug))
  )
}

/** The FAQ page (spec 051): a CMS page whose topics and questions come from the FAQ content type. */
export const FAQ_SLUG: Record<Locale, string> = { az: 'sual-cavab', en: 'faq' }

/** Whether a page slug is the FAQ page in any locale. */
export function isFaqSlug(slug: string): boolean {
  return Object.values(FAQ_SLUG).includes(slug)
}

/** The FinCERT page (spec 053): a CMS page whose blocks come from the FinCERT content type; the slug is the same in both locales. */
export const FINCERT_SLUG: Record<Locale, string> = { az: 'fincert', en: 'fincert' }

/**
 * The pages of the homepage "Strategiya və sənədlər" documents (spec 057 US4), where the legacy addresses go:
 * `/pages/strategy` (page 104, the governor's letter), `page-872/*` (66) and `page-878/*` (76).
 */
export const STRATEGY_SLUG: Record<Locale, string> = {
  az: 'maliyye-sektorunun-inkisaf-strategiyasi',
  en: 'financial-sector-development-strategy',
}
export const RISK_SUPERVISION_SLUG: Record<Locale, string> = {
  az: 'risk-esasli-nezaret-uzre-siyaset-konsepsiyasi',
  en: 'risk-based-supervision-policy-concept',
}
export const MICROFINANCE_SLUG: Record<Locale, string> = {
  az: 'mikromaliyye-modeli-uzre-strateji-cercive',
  en: 'strategic-framework-for-a-microfinance-model',
}

/** Whether a page slug is the FinCERT page in any locale. */
export function isFincertSlug(slug: string): boolean {
  return Object.values(FINCERT_SLUG).includes(slug)
}

/** The working papers page (spec 054): a CMS page whose list comes from the working papers content type. */
export const WORKING_PAPERS_SLUG: Record<Locale, string> = { az: 'isci-meqaleler-silsilesi', en: 'working-paper-series' }

/** Whether a page slug is the working papers page in any locale. */
export function isWorkingPapersSlug(slug: string): boolean {
  return Object.values(WORKING_PAPERS_SLUG).includes(slug)
}

/** Root of the financial literacy section (spec 047): it carries the "General information" text. */
export const LITERACY_ROOT_SLUG: Record<Locale, string> = { az: 'maliyye-savadliligi', en: 'financial-literacy' }

/** Slugs of the "General information" page; its address redirects to the section root (spec 047 research R8). */
export const LITERACY_GENERAL_SLUGS: ReadonlySet<string> = new Set(['umumi-melumat', 'general-information'])

/** Root of the consumer and investor rights section (spec 050). */
export const CONSUMER_ROOT_SLUG: Record<Locale, string> = {
  az: 'istehlakcilarin-ve-investorlarin-huquqlari',
  en: 'consumer-and-investor-rights',
}

/** The complaint index page (bank): it shows the insurance index as its second tab (spec 050 research R4). */
export const CONSUMER_COMPLAINT_SLUG: Record<Locale, string> = {
  az: 'bank-xidmetlerinden-istifade-uzre-sikayet-indeksi',
  en: 'complaint-index-on-bank-customers-use-of-bank-services',
}

/** The appeal statistics page: it shows the infographics page's archive at its end. */
export const CONSUMER_STATISTICS_SLUG: Record<Locale, string> = {
  az: 'vetendas-muracietlerine-dair-statistika',
  en: 'statistics-of-citizens-appeals',
}

/** The insurance complaint index; its address redirects to the complaint index page's insurance tab. */
export const CONSUMER_INSURANCE_SLUG: Partial<Record<Locale, string>> = {
  az: 'avto-icbari-sigorta-uzre-sikayet-indeksi',
  en: 'complaint-index-on-compulsory-mtpl-insurance',
}

/** The infographics page; it has no en page, its address redirects to the statistics page's infographics block. */
export const CONSUMER_INFOGRAPHICS_SLUG: Partial<Record<Locale, string>> = { az: 'infoqrafika' }

/** Anchor of the infographics block on the statistics page. */
export const CONSUMER_INFOGRAPHICS_ANCHOR = 'infoqrafika'

/** "Activity directions": the root carries its text, so its address redirects to the root (spec 050 clarify Q2). */
export const CONSUMER_ACTIVITY_SLUGS: ReadonlySet<string> = new Set(['fealiyyet-istiqametleri', 'activity-directions'])

/** The node's link: `navUrl` (external as is, internal with the locale), else `/{locale}/{slug}`. */
export function nodeHref(node: PageNode, locale: Locale): string {
  if (isEventsNode(node)) return `/${locale}${EVENTS_PATH}`
  if (isReleaseScheduleNode(node)) return `/${locale}${RELEASE_SCHEDULE_PATH}`
  if (node.navUrl) return /^https?:\/\//.test(node.navUrl) ? node.navUrl : `/${locale}${node.navUrl}`
  return `/${locale}/${node.slug}`
}

/** The current page: a CMS slug or a feature page's address (matched through `navUrl`). */
export type CurrentPage = { slug?: string; href?: string }

export function isCurrentNode(node: PageNode, locale: Locale, current: CurrentPage): boolean {
  return (
    (current.slug != null && node.slug === current.slug) ||
    (current.href != null &&
      (node.navUrl != null || isEventsNode(node) || isReleaseScheduleNode(node)) &&
      nodeHref(node, locale) === current.href)
  )
}

/** Ids of the chain leading to the current page inside `section` (the nodes that stay open). */
export function activeChainIds(section: PageNode, isCurrent: (node: PageNode) => boolean): Set<number> {
  const ids = new Set<number>()
  const mark = (node: PageNode): boolean => {
    let found = isCurrent(node)
    for (const child of node.children) {
      if (mark(child)) found = true
    }
    if (found) ids.add(node.id)
    return found
  }
  mark(section)
  return ids
}

/**
 * Whether a node is listed in its section's left menu (spec 041). An editor can turn it off with
 * "Sol menyuda göstər"; the page then stays in the top menu, footer and breadcrumb. It still shows
 * while it, or a page under it, is open (`open` is `activeChainIds`), so a visitor sees where they
 * are. Leaving a node out drops its subtree with it: nothing is lifted to the level above.
 */
export function isInSideNav(node: PageNode, open: ReadonlySet<number>): boolean {
  return node.showInSideNav !== false || open.has(node.id)
}

/**
 * Whether a node is listed in the site's dropdown menus: the bar's mega menu, the hamburger panel and the
 * mobile drawer (spec 048). The same "Sol menyuda göstər" flag as `isInSideNav`, so a page left out of its
 * section's left menu is not offered there either, but with no open-page exception: these menus are the
 * same on every page. Section roots are not items of a left menu, so callers apply this to children only.
 * Spec 054: `showInDropdownNav` overrides it when set — `true` lists a page only the dropdown menus carry
 * ("Ödəniş xidmətləri"), `false` drops one from them alone; null follows the left-menu flag.
 */
export function isInDropdownNav(node: PageNode): boolean {
  return node.showInDropdownNav ?? node.showInSideNav !== false
}

/**
 * Sections that use the shared template (`widgets/section-shell`). Recognised by the root's title (az/en,
 * like the legacy site): spec 024 "Haqqımızda", spec 028 "Media", spec 043 "Beynəlxalq əməkdaşlıq",
 * spec 047 "Maliyyə savadlılığı", spec 050 "İstehlakçıların və investorların hüquqları", spec 054 "Nəşrlər və tədqiqatlar".
 * A new section is one line here.
 */
export type SectionKey = 'about' | 'media' | 'cooperation' | 'literacy' | 'consumer' | 'publications'

export const SECTION_TITLES: Record<SectionKey, ReadonlySet<string>> = {
  about: new Set(['Haqqımızda', 'About us', 'About Us']),
  media: new Set(['Media']),
  cooperation: new Set(['Beynəlxalq əməkdaşlıq', 'International Cooperation', 'International cooperation']),
  literacy: new Set(['Maliyyə savadlılığı', 'Financial Literacy', 'Financial literacy']),
  consumer: new Set(['İstehlakçıların və investorların hüquqları', 'Consumer and Investor Rights', 'Consumer and investor rights']),
  publications: new Set(['Nəşrlər və tədqiqatlar', 'Nəşrlər və Tədqiqatlar', 'Publications and research', 'Publications and Research']),
}

export function sectionRoot(tree: PageNode[], key: SectionKey): PageNode | null {
  return tree.find((node) => SECTION_TITLES[key].has(node.title)) ?? null
}

/** Which templated section a root node is; `null` if none (the legacy CMS layout). */
export function sectionKeyOf(tree: PageNode[], root: PageNode): SectionKey | null {
  for (const key of Object.keys(SECTION_TITLES) as SectionKey[]) {
    if (sectionRoot(tree, key)?.id === root.id) return key
  }
  return null
}

const COPY_SUFFIXES = ['(Kopya)', '(Copy)'] as const

/**
 * An editor's draft copy: "Haqqımızda (Kopya)" / "Media (Copy)" (spec 024, 028). It is a child of the
 * real section in the tree, so its own pages sit one level deeper.
 */
export function isSectionCopy(node: PageNode, key: SectionKey): boolean {
  const suffix = COPY_SUFFIXES.find((s) => node.title.endsWith(s))
  return suffix != null && SECTION_TITLES[key].has(node.title.slice(0, -suffix.length).trim())
}

/** "Haqqımızda" shortcuts (spec 024), used by `features/about-content` and tests. */
export const ABOUT_SECTION_TITLES: ReadonlySet<string> = SECTION_TITLES.about

export function aboutSection(tree: PageNode[]): PageNode | null {
  return sectionRoot(tree, 'about')
}

export function isAboutCopy(node: PageNode): boolean {
  return isSectionCopy(node, 'about')
}

/** Flattens the tree into a list with depths, for tests and search. */
export function flattenTree(tree: PageNode[], depth = 1): { node: PageNode; depth: number }[] {
  return tree.flatMap((node) => [{ node, depth }, ...flattenTree(node.children, depth + 1)])
}
