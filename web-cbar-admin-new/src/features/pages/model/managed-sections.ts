/**
 * Pages whose site content partly comes from a panel section of its own (spec 046 FR-013,
 * `specs/046-international-memberships/contracts/admin-nav.md`). The page form shows where to edit it.
 *
 * Keyed by the az slug, as the site and the seeds key these pages: ids differ between environments.
 * The "(Kopya)" drafts (`-copy`) get the same card. Labels are the `nav` namespace keys of the menu
 * group and item, so the card names the section exactly as the sidebar does.
 */
import type { LinkProps } from '@tanstack/react-router'

/** Suffix of the "(Kopya)" draft pages. */
export const COPY_SLUG_SUFFIX = '-copy'

export type ManagedSection =
  | {
      kind: 'link'
      /** Panel route of the section. */
      to: NonNullable<LinkProps['to']>
      /** `nav:groups.<group>` and `nav:<item>.label`. */
      group: string
      item: string
      /** The section's list filter the link opens with (spec 052: a monthly report series). */
      search?: Record<string, string>
      /** `pages:<key>` in place of the generic "table or cards" sentence; `{{path}}` is the menu path. */
      textKey?: string
    }
  /** No section of its own: the content is the page's text, the card explains the rule. */
  | { kind: 'note'; noteKey: string }

/** The complaint index and infographics pages (spec 052): their archive is a monthly report series. */
function monthlyReports(series: string): ManagedSection {
  return {
    kind: 'link',
    to: '/monthly-reports',
    group: 'consumer',
    item: 'monthlyReports',
    search: { series },
    textKey: 'managedSection.monthlyReportsText',
  }
}

const MANAGED_SECTIONS: Readonly<Record<string, ManagedSection>> = {
  'beynelxalq-teskilatlarla-emekdasliq': {
    kind: 'link',
    to: '/ifi-organizations',
    group: 'cooperation',
    item: 'ifiOrganizations',
  },
  'merkezi-banklarla-emekdasliq': {
    kind: 'link',
    to: '/memorandums',
    group: 'cooperation',
    item: 'memorandums',
  },
  'korporativ-sosial-mesuliyyet': {
    kind: 'link',
    to: '/csr-projects',
    group: 'about',
    item: 'csrProjects',
  },
  'melumatlarin-yayimlanmasi-qrafiki': {
    kind: 'link',
    to: '/release-schedule',
    group: 'media',
    item: 'releaseSchedule',
  },
  'sual-cavab': { kind: 'link', to: '/faq', group: 'faq', item: 'faq' },
  fincert: { kind: 'link', to: '/fincert', group: 'fincert', item: 'fincert' },
  'bank-xidmetlerinden-istifade-uzre-sikayet-indeksi': monthlyReports('bank-complaint-index'),
  'avto-icbari-sigorta-uzre-sikayet-indeksi': monthlyReports('insurance-complaint-index'),
  infoqrafika: monthlyReports('infographics'),
  'isci-meqaleler-silsilesi': {
    kind: 'link',
    to: '/working-papers',
    group: 'publications',
    item: 'workingPapers',
    textKey: 'managedSection.workingPapersText',
  },
  'beynelxalq-teskilatlarda-uzvluk': {
    kind: 'note',
    noteKey: 'managedSection.membershipsNote',
  },
}

export function managedSectionFor(
  slug: string | null | undefined,
): ManagedSection | undefined {
  if (!slug) return undefined
  const key = slug.endsWith(COPY_SLUG_SUFFIX)
    ? slug.slice(0, -COPY_SLUG_SUFFIX.length)
    : slug
  return MANAGED_SECTIONS[key]
}
