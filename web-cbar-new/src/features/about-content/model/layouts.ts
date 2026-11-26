/**
 * Page language + slug → layout (spec 024 research R2, spec 026 FR-022a). A fixed registry, like
 * `FEATURE_ROUTES` in `shell/nav.ts`: a table of another section never turns into a timeline.
 *
 * Split by language (spec 026 research R2): on the test environment the az "Haqqımızda (Kopya)" has
 * the slug `history-copy`, and a language-less registry gave it the layout of the en History copy.
 * In az that slug is the About copy, `about-main`.
 *
 * `-copy` slugs are the "Haqqımızda (Kopya)" subtree, where editors prepare the new form without
 * touching the live page. `tarixi` is the old az slug (today `tarix`).
 */
import type { AttachmentFile } from '@/entities/content'
import type { SectionKey } from '@/entities/page-node'
import type { Locale } from '@/shared/i18n'
import { parseBlocks } from '@/shared/lib/html-blocks'

import { mediaHrefLinksIn } from './file-archive'
import type { AboutLayoutKind } from './types'
import { topNodes } from './year-archive'

const LAYOUTS: Record<Locale, Record<string, AboutLayoutKind>> = {
  az: {
    haqqimizda: 'about-main',
    'haqqimizda-copy': 'about-main',
    'history-copy': 'about-main',
    tarix: 'history',
    tarixi: 'history',
    'tarix-copy': 'history',
    'missiya-ve-deyerler': 'mission',
    'missiya-ve-deyerler-copy': 'mission',
  },
  en: {
    'about-us': 'about-main',
    'about-us-copy': 'about-main',
    history: 'history',
    'history-copy': 'history',
    'mission-and-values': 'mission',
    'mission-and-values-copy': 'mission',
  },
}

export function layoutFor(slug: string, locale: Locale): AboutLayoutKind {
  return LAYOUTS[locale][slug] ?? 'plain'
}

/**
 * Media section (spec 037 research R2, specs 038, 040). Slugs survive a title change. `-copy` slugs are the
 * "(Kopya)" pages, where editors prepare the new form without touching the live page.
 */
const MEDIA_LAYOUTS: Record<string, AboutLayoutKind> = {
  'media-sorgulari': 'media-requests',
  'korporativ-sosial-mesuliyyet': 'csr-projects',
  'korporativ-sosial-mesuliyyet-copy': 'csr-projects',
  'corporate-social-responsibility': 'csr-projects',
  'corporate-social-responsibility-copy': 'csr-projects',
  'merkezi-bankin-logosu': 'brand-logos',
  'merkezi-bankin-logosu-copy': 'brand-logos',
  'central-bank-logo': 'brand-logos',
  'central-bank-logo-copy': 'brand-logos',
}

export function mediaLayoutFor(slug: string): AboutLayoutKind {
  return MEDIA_LAYOUTS[slug] ?? 'plain'
}

/**
 * International cooperation section (specs 044, 045, 046). Its other pages stay ordinary content (spec 043).
 * `-copy` slugs are the "(Kopya)" pages.
 */
const COOPERATION_LAYOUTS: Record<string, AboutLayoutKind> = {
  'beynelxalq-teskilatlarla-emekdasliq': 'ifi-organizations',
  'beynelxalq-teskilatlarla-emekdasliq-copy': 'ifi-organizations',
  'cooperation-with-international-organizations': 'ifi-organizations',
  'cooperation-with-international-organizations-copy': 'ifi-organizations',
  'merkezi-banklarla-emekdasliq': 'memorandums',
  'merkezi-banklarla-emekdasliq-copy': 'memorandums',
  'cooperation-with-central-banks': 'memorandums',
  'cooperation-with-central-banks-copy': 'memorandums',
  'beynelxalq-teskilatlarda-uzvluk': 'memberships',
  'beynelxalq-teskilatlarda-uzvluk-copy': 'memberships',
  'membership-in-international-organizations': 'memberships',
  'membership-in-international-organizations-copy': 'memberships',
}

export function cooperationLayoutFor(slug: string): AboutLayoutKind {
  return COOPERATION_LAYOUTS[slug] ?? 'plain'
}

/**
 * Financial literacy section (spec 047). The root carries the "General information" text; that page's own slugs
 * stay here for its draft copy, the address itself redirects to the root (`proxy.ts`). The three platform pages
 * share one layout. Seminars and Competitions stay ordinary content. `-copy` slugs are the "(Kopya)" pages.
 */
const LITERACY_PLATFORM_SLUGS = [
  'maliyye-savadliligi-portali',
  'financial-literacy-portal',
  'virtual-tehsil-platformasi',
  'virtual-education-platform',
  'maliyye-mehsul-ve-xidmetlerinin-melumat-axtaris-sistemi',
  'information-and-search-system-for-financial-products-and-services',
] as const

const FINANCIAL_LITERACY_SLUGS = ['maliyye-savadliligi', 'financial-literacy', 'umumi-melumat', 'general-information'] as const

const withCopies = (slugs: readonly string[], layout: AboutLayoutKind): [string, AboutLayoutKind][] =>
  slugs.flatMap((slug) => [
    [slug, layout],
    [`${slug}-copy`, layout],
  ])

const LITERACY_LAYOUTS: Record<string, AboutLayoutKind> = Object.fromEntries([
  ...withCopies(FINANCIAL_LITERACY_SLUGS, 'financial-literacy'),
  ...withCopies(LITERACY_PLATFORM_SLUGS, 'literacy-platform'),
])

export function literacyLayoutFor(slug: string): AboutLayoutKind {
  return LITERACY_LAYOUTS[slug] ?? 'plain'
}

/**
 * Consumer and investor rights section (spec 050 research R3). The root shares its layout with "Activity directions"
 * (whose address redirects to the root; the slug stays here for its draft copy) and with the administrative officials
 * page. The insurance index and the infographics have no layout: they are read as companion pages. Other pages stay
 * ordinary content. `-copy` slugs are the "(Kopya)" pages.
 */
const CONSUMER_TEXT_SLUGS = [
  'istehlakcilarin-ve-investorlarin-huquqlari',
  'consumer-and-investor-rights',
  'fealiyyet-istiqametleri',
  'activity-directions',
  'inzibati-islere-baxan-vezifeli-sexsler',
  'officials-authorized-to-consider-cases-on-administrative-violations',
] as const

const COMPLAINT_INDEX_SLUGS = [
  'bank-xidmetlerinden-istifade-uzre-sikayet-indeksi',
  'complaint-index-on-bank-customers-use-of-bank-services',
] as const

const APPEAL_STATISTICS_SLUGS = ['vetendas-muracietlerine-dair-statistika', 'statistics-of-citizens-appeals'] as const

const CONSUMER_DOCUMENTS_SLUGS = ['kapital-bazari-3', 'capital-market-3'] as const

const CONSUMER_LAYOUTS: Record<string, AboutLayoutKind> = Object.fromEntries([
  ...withCopies(CONSUMER_TEXT_SLUGS, 'consumer-text'),
  ...withCopies(COMPLAINT_INDEX_SLUGS, 'complaint-index'),
  ...withCopies(APPEAL_STATISTICS_SLUGS, 'appeal-statistics'),
  ...withCopies(CONSUMER_DOCUMENTS_SLUGS, 'consumer-documents'),
])

export function consumerLayoutFor(slug: string): AboutLayoutKind {
  return CONSUMER_LAYOUTS[slug] ?? 'plain'
}

/**
 * Publications and research (spec 054 FR-016, research R7): no slug table. The layout comes from the shape of the page's
 * text, so a page added later shows in the right template without a code change (SC-006):
 * accordions → `file-archive`; a `/media/{id}` link or attached files → `document-list`; anything else → `plain`.
 * Accordions count where the archive parser reads them (top level, legacy `div` wrappers opened) and links are found by
 * the same reader as the cards (`mediaHrefLinksIn`), so the picked layout always has something to show.
 */
export function publicationsLayoutFor(html: string, files: readonly AttachmentFile[]): AboutLayoutKind {
  const nodes = parseBlocks(html)
  if (nodes && topNodes(nodes).some((node) => node.tag === 'details')) return 'file-archive'
  if (files.length > 0 || mediaHrefLinksIn(html).length > 0) return 'document-list'
  return 'plain'
}

/** What a section's layout rule reads: the slug tables read the slug, publications the text and the files. */
export type LayoutContext = Readonly<{ slug: string; locale: Locale; html: string; files: readonly AttachmentFile[] }>

/**
 * One rule per template section, so a slug of one section never gives its layout to a page of another. A `Record`, so a
 * new `SectionKey` does not compile until it has a rule here.
 */
const SECTION_LAYOUTS: Record<SectionKey, (context: LayoutContext) => AboutLayoutKind> = {
  about: ({ slug, locale }) => layoutFor(slug, locale),
  media: ({ slug }) => mediaLayoutFor(slug),
  cooperation: ({ slug }) => cooperationLayoutFor(slug),
  literacy: ({ slug }) => literacyLayoutFor(slug),
  consumer: ({ slug }) => consumerLayoutFor(slug),
  publications: ({ html, files }) => publicationsLayoutFor(html, files),
}

export function sectionLayoutFor(section: SectionKey, context: LayoutContext): AboutLayoutKind {
  return SECTION_LAYOUTS[section](context)
}
