/**
 * Navigation model — menus built from the CMS page tree (spec 002 contracts/routes.md §3, data-model.md §8).
 *
 * Link precedence: `navUrl` set in the admin panel → dedicated feature route (`FEATURE_ROUTES`)
 * → `/{locale}/{slug}`. The first `VISIBLE_SECTIONS` root sections go on the bar (from `desk`; fewer from
 * `lg`, spec 056), the rest into the hamburger panel; depth is capped at 3 — same as the legacy cbar.az.
 *
 * Below the root sections, a page an editor took out of its section's left menu ("Sol menyuda göstər",
 * spec 041) is left out of these menus too, with everything under it (spec 048). A root keeps its place in
 * every menu; the same flag only takes it out of the wide-screen hamburger panel (`inDropdownNav`, spec 056).
 * The footer is not affected.
 */
import { isEventsNode, isInDropdownNav, type PageNode } from '@/entities/page-node'
import { topLinks } from '@/shared/config/contacts'
import type { Locale } from '@/shared/i18n'

import { FOOTER_SECTIONS, MAX_DEPTH, VISIBLE_SECTIONS } from './constants'

export type NavSection = {
  key: string
  title: string
  href: string
  external: boolean
  /**
   * The editor's menu location (`isInDropdownNav`). Children are already filtered by it, so only a root can be
   * `false`: such a root leaves the hamburger panel from `desk` up and stays in every other menu (spec 056).
   */
  inDropdownNav: boolean
  children: NavSection[]
}

/**
 * CMS sections served by dedicated feature routes — keyed by slug (both locales).
 */
export const FEATURE_ROUTES: Record<string, string> = {
  'press-relizler': 'press-releases',
  'press-releases': 'press-releases',
  fotoqalereya: 'media/galleries',
  'photo-gallery': 'media/galleries',
  videoqalereya: 'media/videos',
  'video-gallery': 'media/videos',
  tedbirler: 'media/events',
  events: 'media/events',
  'melumatlarin-yayimlanmasi-qrafiki': 'media/release-schedule',
  'information-disclosure-schedule': 'media/release-schedule',
  'teskilati-struktur-ve-idareetme': 'organization',
  'organizational-structure-and-management': 'organization',
  'tedavulde-olan-pul-nisanlari': 'national-currency',
  'currency-in-circulation': 'national-currency',
  'merkezi-bankin-huquqi-esaslari': 'laws',
  'legal-framework-of-the-central-bank': 'laws',
}

export function navFor(node: PageNode, locale: Locale): { href: string; external: boolean } {
  if (node.navUrl) {
    const external = /^https?:\/\//.test(node.navUrl)
    return { href: external ? node.navUrl : `/${locale}${node.navUrl}`, external }
  }
  const feature = node.slug ? FEATURE_ROUTES[node.slug] : undefined
  return { href: feature ? `/${locale}/${feature}` : `/${locale}/${node.slug}`, external: false }
}

function toSection(node: PageNode, locale: Locale, depth: number): NavSection {
  return {
    key: `${node.id}-${node.slug}`,
    title: node.title,
    ...navFor(node, locale),
    inDropdownNav: isInDropdownNav(node),
    children:
      depth >= MAX_DEPTH || isEventsNode(node)
        ? []
        : node.children.filter((child) => isInDropdownNav(child)).map((child) => toSection(child, locale, depth + 1)),
  }
}

export function buildNavSections(
  tree: PageNode[],
  locale: Locale,
): { visible: NavSection[]; overflow: NavSection[]; all: NavSection[] } {
  const all = tree.map((page) => toSection(page, locale, 1))
  return {
    visible: all.slice(0, VISIBLE_SECTIONS),
    overflow: all.slice(VISIBLE_SECTIONS),
    all,
  }
}

/**
 * Whether the header's top strip already links to this section (spec 042): Careers → "İnsan resursları",
 * Media → "Media". Matched by address, not title, so a renamed section still matches; built the same way
 * `SiteHeader` builds the top-strip links. The wide-desktop hamburger panel leaves these out (Figma
 * `1088:26879`), every other menu keeps them.
 */
export function isTopLinkSection(section: NavSection, locale: Locale): boolean {
  return !section.external && topLinks.some((link) => section.href === `/${locale}/${link.slug[locale]}`)
}

/** Footer navigation: a fixed set of root sections (az + en titles), in tree order. */
export const NAV_SECTION_TITLES: ReadonlySet<string> = new Set([
  'Haqqımızda',
  'About us',
  'About Us',
  'Pul siyasəti',
  'Monetary policy',
  // From the Figma footer (spec 022); shown as soon as the section exists in the CMS.
  'Maliyyə sabitliyi',
  'Financial stability',
  'Media',
  'İnsan resursları',
  'Human Resources',
  'Statistika',
  'Statistics',
  'Nəşrlər və tədqiqatlar',
  'Publications and research',
  // Figma footer `3613:5734` (spec 051 FR-017a); 'Sual − cavab' is the legacy title until the 0033 seed renames it.
  'Sual-cavab',
  'Sual − cavab',
  'Frequently asked questions',
  'FAQ',
])

/** Falls back to the first 6 root sections when none match. */
export function footerSections(tree: PageNode[], locale: Locale): NavSection[] {
  const matched = tree.filter((page) => NAV_SECTION_TITLES.has(page.title))
  const source = matched.length > 0 ? matched : tree.slice(0, FOOTER_SECTIONS)
  return source.map((page) => ({ ...toSection(page, locale, MAX_DEPTH), children: [] }))
}
