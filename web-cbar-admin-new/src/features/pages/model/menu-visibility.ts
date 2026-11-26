/**
 * Whether a page shows in the public site's menus (spec 004 US4, FR-010; spec 041).
 *
 * This mirrors rules that live in two other repos. No code is shared; a document ties them
 * together (`specs/004-fix-page-add-child/contracts/menu-visibility.md`,
 * `specs/041-side-nav-visibility/data-model.md`):
 * - `api-cbar/src/Cbar.WebApi/Controllers/PagesController.cs` `GetTree`: status, active/visible,
 *   showAz/showEn, a title in that locale; a child of a page that is not shown is lifted to the root.
 * - `web-cbar-new/src/shell/constants.ts` `MAX_DEPTH`: the top menu shows three levels.
 * - `web-cbar-new/src/entities/page-node/lib/tree.ts` `isInSideNav`: the section's left menu leaves
 *   out a page turned off with showInSideNav, and everything under it, unless that page is open.
 * - same file, `isInDropdownNav` (spec 048, spec 054): the top menu, hamburger panel and mobile drawer
 *   leave out a page below the section root, and everything under it, by `showInDropdownNav ?? showInSideNav`,
 *   with no open-page exception.
 * - `web-cbar-new/src/shell/mega-menu.tsx` `leavesWidePanel` (spec 056): on a section root the same flag only takes
 *   it out of the wide-screen hamburger panel; the nav bar (`VISIBLE_SECTIONS` in `shell/constants.ts`), the tablet
 *   panel, the mobile drawer and the footer keep it.
 * When one of them changes, this file changes with it.
 */

import { LOCALES, type Locale } from '@/entities/content/model/types'
import type { PageFlags, PageNode } from './schemas'

export const MENU_MAX_DEPTH = 3

/** Sections on the site's nav bar from 1360px up: `VISIBLE_SECTIONS` in web-cbar-new `shell/constants.ts` (spec 056). */
export const MENU_BAR_SECTIONS = 9

export type MenuHiddenReason =
  | 'status'
  | 'inactive'
  | 'hidden'
  | 'localeOff'
  | 'noTitle'
  | 'tooDeep'
  | 'sideNavOff'
  | 'parentSideNavOff'
  | 'dropdownNavOff'
  | 'parentDropdownNavOff'

export type SideMenuHiddenReason =
  | Exclude<MenuHiddenReason, 'tooDeep' | 'dropdownNavOff' | 'parentDropdownNavOff'>
  | 'sectionRoot'

type MenuFlags = Pick<
  PageFlags,
  | 'active'
  | 'visible'
  | 'showAz'
  | 'showEn'
  | 'showInSideNav'
  | 'showInDropdownNav'
>

export interface MenuPageInput {
  status: string
  flags: MenuFlags
  titles: Record<Locale, string | null>
}

/** The site's `isInDropdownNav`: an unset dropdown flag follows the left-menu flag (spec 054 R11). */
export const isInDropdownNav = (
  flags: Pick<PageFlags, 'showInSideNav' | 'showInDropdownNav'>,
): boolean => flags.showInDropdownNav ?? flags.showInSideNav !== false

/**
 * Where an editor puts a page in the site's menus (spec 054 contracts/admin-ux.md §3): three radio
 * options, each a pair of flags. The panel always sends both.
 */
export const MENU_LOCATIONS = ['all', 'dropdownOnly', 'none'] as const
export type MenuLocation = (typeof MENU_LOCATIONS)[number]

export const MENU_LOCATION_FLAGS: Record<
  MenuLocation,
  Pick<PageFlags, 'showInSideNav' | 'showInDropdownNav'> & {
    showInDropdownNav: boolean
  }
> = {
  all: { showInSideNav: true, showInDropdownNav: true },
  dropdownOnly: { showInSideNav: false, showInDropdownNav: true },
  none: { showInSideNav: false, showInDropdownNav: false },
}

/**
 * The option a pair of flags stands for. A page never placed (`showInDropdownNav` null) is read by its
 * effective value. `null`: the stored pair is "left menu only" (`true` + `false`), which no option gives;
 * the form keeps it until the editor picks one.
 */
export function menuLocationOf(
  flags: Pick<PageFlags, 'showInSideNav' | 'showInDropdownNav'>,
): MenuLocation | null {
  const side = flags.showInSideNav !== false
  const dropdown = isInDropdownNav(flags)
  if (side) return dropdown ? 'all' : null
  return dropdown ? 'dropdownOnly' : 'none'
}

/**
 * Whether a section root is out of the site's wide-screen hamburger panel (spec 056 contracts/admin-ux.md): a root the
 * editor put in no menu. It keeps the nav bar, the tablet and mobile menus and the footer, so the card shows this as a
 * note, not as a reason. Below the root the flag takes the page out of every dropdown menu (`menuVisibility`).
 * `placement: null` (the tree is not loaded yet): a page without a parent is a root.
 */
export function rootPanelHidden(
  flags: Pick<PageFlags, 'showInSideNav' | 'showInDropdownNav'>,
  placement: Pick<MenuPlacement, 'depth'> | null,
  isSectionRoot: boolean,
): boolean {
  const root = placement ? placement.depth === 1 : isSectionRoot
  return root && !isInDropdownNav(flags)
}

/** Place in the tree: root = 1; `parentVisible: null` means there is no parent. */
export interface MenuPlacement {
  depth: number
  parentVisible: boolean | null
}

/** Place in the tree: whether an ancestor below the section root is turned off for the left / dropdown menus. */
export interface MenuTreePlacement extends MenuPlacement {
  sideNavHiddenAncestor: boolean
  dropdownHiddenAncestor: boolean
}

export interface LocaleMenuVisibility {
  visible: boolean
  reasons: MenuHiddenReason[]
  promotedToRoot: boolean
}

export interface LocaleSideMenuVisibility {
  visible: boolean
  reasons: SideMenuHiddenReason[]
  /** Hidden only by the side-menu flag: the page still shows there while it is open. */
  openOnly: boolean
}

/** Rules 1–4: the page's own fields, independent of its place in the tree. */
type OwnReason = 'status' | 'inactive' | 'hidden' | 'localeOff' | 'noTitle'

function ownReasons(page: MenuPageInput, locale: Locale): OwnReason[] {
  const reasons: OwnReason[] = []
  if (page.status !== 'published') reasons.push('status')
  if (!page.flags.active) reasons.push('inactive')
  if (!page.flags.visible) reasons.push('hidden')
  if (!(locale === 'az' ? page.flags.showAz : page.flags.showEn)) {
    reasons.push('localeOff')
  }
  if (!page.titles[locale]?.trim()) reasons.push('noTitle')
  return reasons
}

const nodeVisible = (node: PageNode, locale: Locale) =>
  ownReasons(
    {
      status: node.status,
      flags: node.flags,
      // The tree is one locale's tree, so `node.title` is that locale's title.
      titles: { az: node.title, en: node.title },
    },
    locale,
  ).length === 0

function pathTo(nodes: PageNode[], id: number): PageNode[] | null {
  for (const node of nodes) {
    if (node.id === id) return [node]
    const rest = pathTo(node.children, id)
    if (rest) return [node, ...rest]
  }
  return null
}

/** Ancestors, nearest first, that the public tree keeps above a page placed under `path`'s end. */
function visibleRun(path: PageNode[], locale: Locale): PageNode[] {
  const run: PageNode[] = []
  for (let i = path.length - 1; i >= 0; i--) {
    if (!nodeVisible(path[i]!, locale)) break
    run.push(path[i]!)
  }
  return run
}

/**
 * Where a page placed under `parentId` lands in the public menu. `tree` is one locale's tree
 * (titles in that locale). The consecutive visible ancestors above the parent are counted; an
 * ancestor that is not shown breaks the chain, because `api-cbar` lifts its child to the root.
 * `null` if the parent is not in the tree.
 */
export function placementUnder(
  tree: PageNode[],
  parentId: number | null,
  locale: Locale = 'az',
): MenuPlacement | null {
  if (parentId === null) return { depth: 1, parentVisible: null }
  const path = pathTo(tree, parentId)
  if (!path) return null
  const run = visibleRun(path, locale)
  return { depth: run.length + 1, parentVisible: run.length > 0 }
}

/**
 * `placementUnder` plus the menu-flag checks on the ancestors between the page and its section root:
 * one with showInSideNav off hides the page from the left menu (`sideNavHiddenAncestor`), one out of the
 * dropdown menus (`isInDropdownNav`) hides it from the top menu (`dropdownHiddenAncestor`). The section
 * root itself does not count, since it heads those menus rather than being an item in them.
 */
export function menuTreePlacementUnder(
  tree: PageNode[],
  parentId: number | null,
  locale: Locale = 'az',
): MenuTreePlacement | null {
  if (parentId === null) {
    return {
      depth: 1,
      parentVisible: null,
      sideNavHiddenAncestor: false,
      dropdownHiddenAncestor: false,
    }
  }
  const path = pathTo(tree, parentId)
  if (!path) return null
  const run = visibleRun(path, locale)
  // The last node of the run is the section root the page ends up under.
  const items = run.slice(0, -1)
  return {
    depth: run.length + 1,
    parentVisible: run.length > 0,
    sideNavHiddenAncestor: items.some((n) => n.flags.showInSideNav === false),
    dropdownHiddenAncestor: items.some((n) => !isInDropdownNav(n.flags)),
  }
}

/**
 * Top-menu visibility for each locale. `placement: null` (the tree is not loaded yet): only the
 * page's own rules are checked, its menu location included. Below the root, a page out of the dropdown
 * menus (`isInDropdownNav`), or one under an ancestor that is, is out of the top menu (spec 048, spec 054).
 */
export function menuVisibility(
  page: MenuPageInput,
  placement: Record<
    Locale,
    (MenuPlacement & Partial<Pick<MenuTreePlacement, 'dropdownHiddenAncestor'>>) | null
  > | null,
): Record<Locale, LocaleMenuVisibility> {
  const result = {} as Record<Locale, LocaleMenuVisibility>
  for (const locale of LOCALES) {
    const reasons: MenuHiddenReason[] = ownReasons(page, locale)
    const place = placement?.[locale] ?? null
    // A section root heads its menus rather than being an item in them, so the flags do not apply.
    if (place?.depth !== 1) {
      if (!isInDropdownNav(page.flags)) reasons.push('dropdownNavOff')
      else if (place?.dropdownHiddenAncestor) reasons.push('parentDropdownNavOff')
    }
    if (place && place.depth > MENU_MAX_DEPTH) reasons.push('tooDeep')
    const visible = reasons.length === 0
    result[locale] = {
      visible,
      reasons,
      promotedToRoot: visible && place?.parentVisible === false,
    }
  }
  return result
}

/**
 * Left-menu visibility for each locale (spec 041 R7). A page out of the public tree is out of
 * the left menu for the same reasons; the top menu's depth limit does not apply. A page that ends
 * up a root heads a left menu instead of being listed in one.
 */
export function sideMenuVisibility(
  page: MenuPageInput,
  placement: Record<Locale, MenuTreePlacement | null> | null,
): Record<Locale, LocaleSideMenuVisibility> {
  const result = {} as Record<Locale, LocaleSideMenuVisibility>
  for (const locale of LOCALES) {
    const own = ownReasons(page, locale)
    const place = placement?.[locale] ?? null
    let reasons: SideMenuHiddenReason[] = own
    if (own.length === 0) {
      if (place?.depth === 1) reasons = ['sectionRoot']
      else if (page.flags.showInSideNav === false) reasons = ['sideNavOff']
      else if (place?.sideNavHiddenAncestor) reasons = ['parentSideNavOff']
    }
    result[locale] = {
      visible: reasons.length === 0,
      reasons,
      openOnly:
        reasons.includes('sideNavOff') || reasons.includes('parentSideNavOff'),
    }
  }
  return result
}
