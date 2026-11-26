/**
 * Navigation list — the sidebar, the mobile sheet and the ⌘K palette read it (spec FR-007, research R13).
 * Labels come from the `nav` namespace: t(`${item.key}.label`, { ns: 'nav' }); group titles `groups.<group>`.
 *
 * Groups follow the public site's sections, in the site's order (spec 046,
 * `specs/046-international-memberships/contracts/admin-nav.md`): an editor finds a screen under the
 * section it fills. A group with one screen is shown as that screen, without a title.
 */

import {
  BookIcon,
  BookOpenIcon,
  BullhornIcon,
  CalendarIcon,
  ChatIcon,
  ChartPieAltIcon,
  ChartPieIcon,
  ClipboardIcon,
  ClockIcon,
  DocumentIcon,
  ExchangeIcon,
  FileIcon,
  FolderIcon,
  GlobeIcon,
  HeartIcon,
  HomeIcon,
  ImageIcon,
  LayoutIcon,
  PulseIcon,
  RowsIcon,
  SettingsIcon,
  ShieldIcon,
  UniversityIcon,
  UserIcon,
  VideoIcon,
  YoutubeIcon,
  WalletIcon,
} from '@cbar/lib-react-ui-kit/icons'
import type { LinkProps } from '@tanstack/react-router'

/** Order of the groups in the sidebar: the site's sections first, then the panel's own. */
export const NAV_GROUPS = [
  'about',
  'marketParticipants',
  'legalActs',
  'nationalCurrency',
  'statistics',
  'media',
  'cooperation',
  'consumer',
  'publications',
  'faq',
  'fincert',
  'homepage',
  'admin',
] as const

export type NavGroup = (typeof NAV_GROUPS)[number]

export type NavKey =
  | 'dashboard'
  | 'pages'
  | 'pressReleases'
  | 'events'
  | 'csrProjects'
  | 'ifiOrganizations'
  | 'memorandums'
  | 'monthlyReports'
  | 'workingPapers'
  | 'releaseSchedule'
  | 'faq'
  | 'fincert'
  | 'laws'
  | 'meas'
  | 'organization'
  | 'moneyMarks'
  | 'mediaLibrary'
  | 'galleries'
  | 'videos'
  | 'liveStreams'
  | 'imagePopups'
  | 'homepageBlocks'
  | 'infoLines'
  | 'currencyRates'
  | 'azir'
  | 'inflation'
  | 'yieldCurves'
  | 'users'
  | 'settings'

export interface NavItem {
  /** Typed by the route tree — a path that does not exist is a compile error. */
  path: NonNullable<LinkProps['to']>
  /** Key in the `nav` namespace (label + description). */
  key: NavKey
  icon: typeof HomeIcon
  /** Items without a group (dashboard, pages, media library) come before the groups. */
  group?: NavGroup
}

/** Within a group, the order of this list is the menu order. */
export const navItems: NavItem[] = [
  { path: '/', key: 'dashboard', icon: HomeIcon },
  { path: '/pages', key: 'pages', icon: DocumentIcon },
  { path: '/media-library', key: 'mediaLibrary', icon: FolderIcon },
  {
    path: '/organization',
    key: 'organization',
    icon: UniversityIcon,
    group: 'about',
  },
  { path: '/csr-projects', key: 'csrProjects', icon: HeartIcon, group: 'about' },
  {
    path: '/meas',
    key: 'meas',
    icon: ClipboardIcon,
    group: 'marketParticipants',
  },
  { path: '/laws', key: 'laws', icon: BookIcon, group: 'legalActs' },
  {
    path: '/money-marks',
    key: 'moneyMarks',
    icon: WalletIcon,
    group: 'nationalCurrency',
  },
  {
    path: '/currency-rates',
    key: 'currencyRates',
    icon: ExchangeIcon,
    group: 'statistics',
  },
  { path: '/azir', key: 'azir', icon: PulseIcon, group: 'statistics' },
  {
    path: '/inflation',
    key: 'inflation',
    icon: ChartPieIcon,
    group: 'statistics',
  },
  {
    path: '/yield-curves',
    key: 'yieldCurves',
    icon: ChartPieAltIcon,
    group: 'statistics',
  },
  {
    path: '/press-releases',
    key: 'pressReleases',
    icon: BullhornIcon,
    group: 'media',
  },
  { path: '/events', key: 'events', icon: CalendarIcon, group: 'media' },
  {
    path: '/release-schedule',
    key: 'releaseSchedule',
    icon: ClockIcon,
    group: 'media',
  },
  { path: '/galleries', key: 'galleries', icon: ImageIcon, group: 'media' },
  { path: '/videos', key: 'videos', icon: VideoIcon, group: 'media' },
  {
    path: '/ifi-organizations',
    key: 'ifiOrganizations',
    icon: GlobeIcon,
    group: 'cooperation',
  },
  {
    path: '/memorandums',
    key: 'memorandums',
    icon: ClipboardIcon,
    group: 'cooperation',
  },
  {
    path: '/monthly-reports',
    key: 'monthlyReports',
    icon: FileIcon,
    group: 'consumer',
  },
  {
    path: '/working-papers',
    key: 'workingPapers',
    icon: BookOpenIcon,
    group: 'publications',
  },
  { path: '/faq', key: 'faq', icon: ChatIcon, group: 'faq' },
  { path: '/fincert', key: 'fincert', icon: ShieldIcon, group: 'fincert' },
  {
    path: '/homepage-blocks',
    key: 'homepageBlocks',
    icon: LayoutIcon,
    group: 'homepage',
  },
  { path: '/info-lines', key: 'infoLines', icon: RowsIcon, group: 'homepage' },
  {
    path: '/live-streams',
    key: 'liveStreams',
    icon: YoutubeIcon,
    group: 'homepage',
  },
  {
    path: '/image-popups',
    key: 'imagePopups',
    icon: ImageIcon,
    group: 'homepage',
  },
  { path: '/users', key: 'users', icon: UserIcon, group: 'admin' },
  { path: '/settings', key: 'settings', icon: SettingsIcon, group: 'admin' },
]

/** One line of the menu: a single item, or a group that opens and closes. */
export type NavEntry =
  | { kind: 'item'; item: NavItem }
  | { kind: 'group'; group: NavGroup; items: NavItem[] }

/**
 * The menu, top to bottom: the ungrouped items, then every group in `NAV_GROUPS` order.
 * A group of one item is that item; an empty group is left out.
 */
export function navEntries(): NavEntry[] {
  const ungrouped: NavEntry[] = navItems
    .filter((item) => !item.group)
    .map((item) => ({ kind: 'item', item }))
  const grouped = NAV_GROUPS.flatMap((group): NavEntry[] => {
    const items = navItems.filter((item) => item.group === group)
    const [only] = items
    if (!only) return []
    return items.length === 1
      ? [{ kind: 'item', item: only }]
      : [{ kind: 'group', group, items }]
  })
  return [...ungrouped, ...grouped]
}

const isNavGroup = (value: string): value is NavGroup =>
  (NAV_GROUPS as readonly string[]).includes(value)

/** Stored group keys that still exist; a renamed or removed group is dropped. */
export const knownNavGroups = (keys: readonly string[]): NavGroup[] =>
  keys.filter(isNavGroup)

/** Sub-routes belong to the item: `/laws/categories/3` → `laws`. */
export const isNavItemActive = (item: NavItem, pathname: string): boolean =>
  item.path === '/'
    ? pathname === '/'
    : pathname === item.path || pathname.startsWith(`${item.path}/`)

/** The item with the longest matching prefix (for document.title and the breadcrumb root). */
export const findNavItem = (pathname: string): NavItem | undefined =>
  navItems
    .filter((item) => isNavItemActive(item, pathname))
    .sort((a, b) => b.path.length - a.path.length)[0]

/** The group of the open screen, which the menu keeps open. */
export const groupOf = (pathname: string): NavGroup | undefined =>
  findNavItem(pathname)?.group

/**
 * The item the menu marks (spec 053): the override a screen set, when it names a known item (a page form whose
 * content lives in a panel section of its own), else the route's item. `document.title` and the breadcrumb keep
 * using `findNavItem`: the screen is still the page form.
 */
export const activeNavItem = (
  pathname: string,
  override: string | null,
): NavItem | undefined =>
  (override ? navItems.find((item) => item.key === override) : undefined) ??
  findNavItem(pathname)
