/**
 * Model of the section template (spec 024 data-model §2, spec 028 §3): breadcrumb, left menu, sharing.
 *
 * A pure function: the loader passes the tree, section key, current page and absolute address, and the
 * view gets serializable data. An empty tree does not break the template: the menu is empty and the
 * breadcrumb is "Ana səhifə › page". Pages turned off for the left menu are left out of it only (spec 041).
 */
import {
  activeChainIds,
  findChainBy,
  isCurrentNode,
  isEventsNode,
  isInSideNav,
  isSectionCopy,
  nodeHref,
  sectionRoot,
  type CurrentPage,
  type PageNode,
  type SectionKey,
} from '@/entities/page-node'
import { getT } from '@/shared/i18n/server'
import type { Locale } from '@/shared/i18n'

/** The last element is the current page: `href = null`. */
export type Crumb = { label: string; href: string | null }

export type SectionNavItem = {
  key: string
  title: string
  href: string
  external: boolean
  current: boolean
  open: boolean
  children: SectionNavItem[]
}

export type SectionShellData = {
  locale: Locale
  /** The section the shell was built for; the left menu draws the publications section in its own Figma look (spec 054). */
  section?: SectionKey
  crumbs: Crumb[]
  nav: SectionNavItem[]
  share: { pageUrl: string; title: string }
}

type BuildArgs = {
  /** Which CMS root section the template is for (`SECTION_TITLES`). */
  section: SectionKey
  tree: PageNode[]
  locale: Locale
  current: CurrentPage
  /** Absolute address (`absolutePageUrl`) for the share links. */
  pageUrl: string
  pageTitle: string
  /** A last level that is not in the tree (staff member, division, gallery name). */
  trail?: string
}

/** The menu has two levels (Figma `subcategories`): a section page and its children. */
const NAV_DEPTH = 2

function toNavItem(node: PageNode, locale: Locale, isCurrent: (n: PageNode) => boolean, open: Set<number>, depth: number): SectionNavItem {
  const href = nodeHref(node, locale)
  // The legacy event pages show in the menu only while one of them is open (spec 034 FR-030).
  const hideChildren = isEventsNode(node) && (isCurrent(node) || !open.has(node.id))
  return {
    key: `${node.id}-${node.slug}`,
    title: node.title,
    href,
    external: /^https?:\/\//.test(href),
    current: isCurrent(node),
    open: open.has(node.id),
    children:
      depth >= NAV_DEPTH || hideChildren
        ? []
        : node.children.filter((child) => isInSideNav(child, open)).map((child) => toNavItem(child, locale, isCurrent, open, depth + 1)),
  }
}

export function buildSectionShell({ section, tree, locale, current, pageUrl, pageTitle, trail }: BuildArgs): SectionShellData {
  const t = getT(locale, 'section')
  const isCurrent = (node: PageNode) => isCurrentNode(node, locale, current)
  const root = sectionRoot(tree, section)
  const chain = root ? (findChainBy([root], isCurrent) ?? []) : []

  const crumbs: Crumb[] = [{ label: t('breadcrumb.home'), href: `/${locale}` }]
  if (chain.length > 0) {
    crumbs.push(...chain.map((node) => ({ label: node.title, href: nodeHref(node, locale) })))
  } else {
    if (root) crumbs.push({ label: root.title, href: nodeHref(root, locale) })
    // With a trail (staff member, division) it is the last element, so the title is not written twice.
    if (!trail) crumbs.push({ label: pageTitle, href: null })
  }
  if (trail) crumbs.push({ label: trail, href: null })
  // The last element is the current page and not a link (024 FR-002).
  const last = crumbs.at(-1)
  if (last && crumbs.length > 1) last.href = null

  // On a copy page the menu is built from the copy's root, so it shows the same two levels as the original.
  const navRoot = chain.find((node) => isSectionCopy(node, section)) ?? root
  const open = navRoot ? activeChainIds(navRoot, isCurrent) : new Set<number>()
  const nav = navRoot
    ? navRoot.children.filter((node) => isInSideNav(node, open)).map((node) => toNavItem(node, locale, isCurrent, open, 1))
    : []

  return { locale, section, crumbs, nav, share: { pageUrl, title: trail ?? pageTitle } }
}
