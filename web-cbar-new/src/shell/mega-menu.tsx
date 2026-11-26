/**
 * Desktop mega menu — server component (spec 002 FR-006, FR-010; spec 022 FR-006, FR-007, R5).
 *
 * Not a control but semantic `<nav>`/`<ul>`/`<a>`: a panel opens through CSS (`group-hover` /
 * `group-focus-within`), so links work without JS and the keyboard (Tab) focus chain reveals the
 * panel. Closing the panel after a click lives in `NavSectionItem` (`data-closed`).
 *
 * Figma `1083:26783`: a 1320-wide panel under the nav bar — section title, divider, 4 columns.
 * Tree level 2 is a column title, level 3 the list under it; more than 4 columns wrap to the next
 * row. The bar holds `VISIBLE_SECTIONS` sections from `desk` up (Figma `I813:25657;9:29`) and
 * `VISIBLE_SECTIONS_NARROW` from `lg` to `desk`, where nine do not fit (spec 056). Sections that do not
 * fit are in the hamburger panel (`NavOverflow`, Figma `1088:26873`), which opens in the same container
 * on hover over the hamburger on tablet and desktop. On tablet the bar sections are hidden, so the panel
 * lists every section; on desktop only the ones that do not fit, and from `desk` up also not the ones
 * the header's top strip already links to (spec 042) nor the roots an editor took out of the menus
 * (spec 056). Below 744 there is no nav bar — the mobile strip is in `SiteHeader`. The sliding
 * underline under the hovered/focused section is in `NavBar` (client, decoration only).
 */
import { cn } from '@cbar/lib-react-ui-kit/lib'

import { getT } from '@/shared/i18n/server'
import type { Locale } from '@/shared/i18n'

import { OVERFLOW_PANEL_COLUMNS, VISIBLE_SECTIONS, VISIBLE_SECTIONS_NARROW } from './constants'
import { isTopLinkSection, type NavSection } from './nav'
import { NavBar } from './nav-bar'
import { NavAnchor } from './nav-anchor'
import { NavOverflow } from './nav-overflow'
import { NavSectionItem } from './nav-section'

/** The panel is positioned against the nav (the `li` is static), so it sits in the same place for every section. */
const PANEL =
  'invisible absolute inset-x-0 top-full z-40 mx-auto w-full max-w-site bg-background px-15 py-7.5 text-foreground opacity-0 shadow-site-panel transition-opacity group-hover/s:visible group-hover/s:opacity-100 group-focus-within/s:visible group-focus-within/s:opacity-100 group-data-closed/s:invisible! group-data-closed/s:opacity-0!'

/**
 * Hamburger panel: the same container (Figma `1088:26873`: 1320, 60/30, shadow), but it also opens
 * from JS state (`data-open`) — touch has no hover. Bottom padding is 30 − 24: every section carries
 * its own 24 bottom space (the column layout has no row `gap`). A long tree (tablet) scrolls inside
 * the panel so it stays on screen; 188 is the header height.
 */
const OVERFLOW_PANEL =
  'invisible absolute inset-x-0 top-full z-40 mx-auto max-h-[calc(100dvh-188px)] w-full max-w-site overflow-y-auto bg-background px-15 pt-7.5 pb-1.5 text-foreground opacity-0 shadow-site-panel transition-opacity group-hover/s:visible group-hover/s:opacity-100 group-data-open/s:visible group-data-open/s:opacity-100 group-data-closed/s:invisible! group-data-closed/s:opacity-0!'

const COLUMN_TITLE = 'text-base/7 font-semibold hover:text-primary focus-visible:text-primary focus-visible:underline'
const COLUMN_LINK = 'text-sm/7 hover:text-primary hover:underline focus-visible:text-primary focus-visible:underline'

/** One section's panel: title, divider, columns. */
function SectionPanel({ section }: { section: NavSection }) {
  if (section.children.length === 0) return null

  return (
    <div className={PANEL} data-slot="mega-menu-panel">
      {/* Text, not a link: the same address is on the section link in the nav bar (no duplicate link). */}
      <p className="text-xl/7 font-semibold">{section.title}</p>
      <div className="border-site-divider mt-6 border-t" aria-hidden="true" />

      <ul className="mt-6 grid grid-cols-4 gap-6">
        {section.children.map((column) => (
          <li key={column.key}>
            <NavAnchor item={column} className={COLUMN_TITLE}>
              {column.title}
            </NavAnchor>
            {column.children.length > 0 ? (
              <ul className="mt-4 flex flex-col gap-2">
                {column.children.map((item) => (
                  <li key={item.key}>
                    <NavAnchor item={item} className={COLUMN_LINK}>
                      {item.title}
                    </NavAnchor>
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  )
}

type OverflowPanelProps = Readonly<{
  locale: Locale
  sections: NavSection[]
}>

/**
 * Whether a root leaves the hamburger panel from `desk` up (spec 056 contracts/ui.md): the bar's sections that fit
 * there only from `desk`, the sections the top strip already links to (spec 042) and the roots an editor took out
 * of the menus (`inDropdownNav`). The first `VISIBLE_SECTIONS_NARROW` sections leave from `lg` already.
 */
function leavesWidePanel(section: NavSection, index: number, locale: Locale): boolean {
  const onBarFromDesk = index >= VISIBLE_SECTIONS_NARROW && index < VISIBLE_SECTIONS
  return onBarFromDesk || isTopLinkSection(section, locale) || !section.inDropdownNav
}

/** Each section's place among the ones the panel lists from `desk` up, `null` for the others. */
function widePanelOrder(sections: NavSection[], locale: Locale): (number | null)[] {
  let next = 0
  return sections.map((section, index) => (index >= VISIBLE_SECTIONS && !leavesWidePanel(section, index, locale) ? next++ : null))
}

/** Whether the panel lists anything from `desk` up; without it the hamburger leaves there too. */
function hasWidePanel(sections: NavSection[], locale: Locale): boolean {
  return widePanelOrder(sections, locale).some((order) => order !== null)
}

/**
 * From `desk` up the first sections of the panel open a column each and the rest stack in the last one (Figma
 * `1088:26873`: İstehlakçı | Rəqəmsal | Beynəlxalq | Savadlılıq + FinCERT + Naxçıvan). Balanced columns put a short
 * section next to another, so a forced column break goes before the 2nd–4th section (spec 056 research R4). A browser
 * without column breaks in multi-column layout (Firefox) keeps the balanced columns.
 */
const opensWideColumn = (order: number | null): boolean => order !== null && order > 0 && order < OVERFLOW_PANEL_COLUMNS

/**
 * Hamburger panel content: each section is a title plus its subsections, flowing into columns.
 * In Figma the 4 × 262 columns sit inside 1200 with `space-between` — gap (1200 − 4·262) / 3.
 *
 * Which width shows which section:
 * - the first `VISIBLE_SECTIONS_NARROW` sections are on the bar from `lg`, so they show only on tablet
 *   (bar hidden) — `lg:hidden`;
 * - the sections `leavesWidePanel` names go from `desk` up — `desk:hidden`: the rest of the bar (spec 056), the
 *   sections the top strip links to, which appears at the same breakpoint (Media, İnsan resursları; spec 042,
 *   Figma `1088:26879`), and the roots an editor marked "Menyularda yox" (spec 056). Each of them stays in the
 *   1024–1359 panel, on tablet and in the mobile drawer.
 */
function OverflowPanel({ locale, sections }: OverflowPanelProps) {
  const wideOrder = widePanelOrder(sections, locale)
  return (
    <ul className="columns-2 gap-x-6 lg:columns-4 lg:gap-x-[max(24px,calc((100%_-_1048px)/3))]">
      {sections.map((section, index) => (
        <li
          key={section.key}
          className={cn(
            'break-inside-avoid pb-6',
            index < VISIBLE_SECTIONS_NARROW && 'lg:hidden',
            leavesWidePanel(section, index, locale) && 'desk:hidden',
            opensWideColumn(wideOrder[index] ?? null) && 'desk:break-before-column',
          )}
        >
          <NavAnchor item={section} className={COLUMN_TITLE}>
            {section.title}
          </NavAnchor>
          {section.children.length > 0 ? (
            <ul className="mt-4 flex flex-col gap-2">
              {section.children.map((item) => (
                <li key={item.key}>
                  <NavAnchor item={item} className={COLUMN_LINK}>
                    {item.title}
                  </NavAnchor>
                </li>
              ))}
            </ul>
          ) : null}
        </li>
      ))}
    </ul>
  )
}

type MegaMenuProps = {
  locale: Locale
  visible: NavSection[]
  /** Every section — for the tablet/desktop hamburger panel; without it there is no hamburger. */
  all?: NavSection[]
}

export function MegaMenu({ locale, visible, all }: MegaMenuProps) {
  const t = getT(locale, 'nav')

  return (
    <nav aria-label={t('mainNavigation')} data-slot="mega-menu" className="bg-primary text-primary-foreground relative max-tab:hidden">
      <NavBar className="mx-auto flex h-18.5 w-full max-w-site items-center gap-5 px-4 desk:px-0 lg:justify-between">
        {all && all.length > 0 ? (
          <NavOverflow
            label={t('allSections')}
            panelClassName={OVERFLOW_PANEL}
            // On tablet the bar holds only the hamburger — on the right in Figma.
            // On desktop the hamburger leaves where the panel would be empty: from `lg` when every section fits on
            // the narrow bar, from `desk` when nothing is left for the wide panel (spec 056).
            className={cn(
              'max-lg:ml-auto',
              all.length <= VISIBLE_SECTIONS_NARROW && 'lg:hidden',
              !hasWidePanel(all, locale) && 'desk:hidden',
            )}
          >
            <OverflowPanel locale={locale} sections={all} />
          </NavOverflow>
        ) : null}

        {visible.map((section, index) => (
          // From `lg` to `desk` only the first `VISIBLE_SECTIONS_NARROW` fit; the rest are in the panel there (spec 056).
          <NavSectionItem key={section.key} className={cn('max-lg:hidden', index >= VISIBLE_SECTIONS_NARROW && 'max-desk:hidden')}>
            <NavAnchor
              item={section}
              className="focus-visible:outline-primary-foreground flex h-18.5 items-center text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              {section.title}
            </NavAnchor>
            <SectionPanel section={section} />
          </NavSectionItem>
        ))}
      </NavBar>
    </nav>
  )
}
