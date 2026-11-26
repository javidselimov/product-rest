/**
 * Information disclosure schedule (spec 039 US2, US3, contracts/ui-contract.md).
 *
 * URL: `q` only. The schedule comes in one response and is filtered here (research R4), so a search
 * costs no extra request and a shared link shows the same rows. The title and intro come from CMS
 * page 130; while rows exist its old hand-typed table is cut off, without rows (API down, nothing
 * published yet) the CMS text shows whole, so the schedule is never missing (research R9).
 */
import 'server-only'

import { formatLongDate } from '@/entities/content'
import { findChainBy, isCurrentNode, RELEASE_SCHEDULE_PATH, type PageNode } from '@/entities/page-node'
import { eventsListHref } from '@/features/events/model/routes'
import { getPage, getPagesTree } from '@/features/pages/api/pages.api'
import { getReleaseSchedule } from '@/features/release-schedule/api/release-schedule.api'
import { DECISION_EVENT_TYPE, RELEASE_SCHEDULE_PAGE_SLUG } from '@/features/release-schedule/model/constants'
import { decisionTiles } from '@/features/release-schedule/model/decisions'
import { introHtml } from '@/features/release-schedule/model/intro'
import type { ReleaseScheduleDecisions, ReleaseScheduleGroup } from '@/features/release-schedule/model/schemas'
import { filterSchedule } from '@/features/release-schedule/model/search'
import { azYearSuffix } from '@/features/release-schedule/model/year-suffix'
import { absolutePageUrl } from '@/server/page-url'
import { prepareCmsHtml } from '@/shared/lib/cms-html'
import { getT } from '@/shared/i18n/server'
import type { Locale } from '@/shared/i18n'
import { buildHref, queryParam, type RawSearchParams } from '@/shared/lib/search-params'
import type { DecisionsDialogData } from '@/widgets/decisions-dialog'
import { buildSectionShell, type SectionShellData } from '@/widgets/section-shell'

export type ReleaseScheduleData = {
  locale: Locale
  title: string
  intro: string
  basePath: string
  q: string
  clearHref: string
  /** Null without rows: the page then shows the CMS text alone, with no search. */
  schedule: { groups: ReleaseScheduleGroup[]; decisions: DecisionsDialogData } | null
  shell: SectionShellData
}

export const releaseScheduleHref = (locale: Locale) => `/${locale}${RELEASE_SCHEDULE_PATH}`

function menuTitle(tree: PageNode[], locale: Locale, href: string): string | null {
  return findChainBy(tree, (node) => isCurrentNode(node, locale, { href }))?.at(-1)?.title ?? null
}

function dialogData(decisions: ReleaseScheduleDecisions, locale: Locale): DecisionsDialogData {
  const t = getT(locale, 'media')
  const typeOf = (withConference: boolean) =>
    t(withConference ? 'releaseSchedule.decisions.pressReleaseAndConference' : 'releaseSchedule.decisions.pressRelease')
  const stateWord = { past: t('releaseSchedule.decisions.past'), next: t('releaseSchedule.decisions.next'), future: t('releaseSchedule.decisions.upcoming') }

  return {
    title: t('releaseSchedule.decisions.title'),
    subtitle: t('releaseSchedule.decisions.subtitle', { year: decisions.year, suffix: azYearSuffix(decisions.year) }),
    next: decisions.next
      ? { label: t('releaseSchedule.decisions.next'), date: formatLongDate(decisions.next.date, locale), type: typeOf(decisions.next.withPressConference) }
      : null,
    tiles: decisionTiles(decisions).map((tile) => ({
      key: tile.date,
      day: tile.day,
      month: t(`events.monthShort.${tile.month}`),
      type: typeOf(tile.withPressConference),
      state: tile.state,
      label: [formatLongDate(tile.date, locale), typeOf(tile.withPressConference), stateWord[tile.state]].join(', '),
    })),
    empty: t('releaseSchedule.decisions.empty'),
    allLabel: t('releaseSchedule.decisions.all'),
    allHref: buildHref(eventsListHref(locale), { type: String(DECISION_EVENT_TYPE) }),
  }
}

export function releaseScheduleMetadata(locale: Locale) {
  return {
    title: getT(locale, 'media')('releaseSchedule.title'),
    alternates: { languages: { az: releaseScheduleHref('az'), en: releaseScheduleHref('en') } },
  }
}

export async function loadReleaseSchedule(locale: Locale, searchParams: RawSearchParams): Promise<ReleaseScheduleData> {
  const t = getT(locale, 'media')
  const q = queryParam.parse(searchParams.q)
  const basePath = releaseScheduleHref(locale)

  const [schedule, tree, page] = await Promise.allSettled([
    getReleaseSchedule(locale),
    getPagesTree(locale),
    getPage(locale, RELEASE_SCHEDULE_PAGE_SLUG[locale]),
  ])
  const pageTree = tree.status === 'fulfilled' ? tree.value : []
  const cmsPage = page.status === 'fulfilled' ? page.value : null
  const title = menuTitle(pageTree, locale, basePath) ?? cmsPage?.title ?? t('releaseSchedule.title')

  const groups = schedule.status === 'fulfilled' ? schedule.value.groups : []
  const hasRows = groups.length > 0

  return {
    locale,
    title,
    intro: prepareCmsHtml(introHtml(cmsPage?.content ?? null, hasRows)),
    basePath,
    q,
    clearHref: basePath,
    schedule:
      hasRows && schedule.status === 'fulfilled'
        ? { groups: filterSchedule(groups, q), decisions: dialogData(schedule.value.decisions, locale) }
        : null,
    shell: buildSectionShell({
      section: 'media',
      tree: pageTree,
      locale,
      current: { href: basePath },
      // Shared links keep the search, so the recipient sees the same rows.
      pageUrl: await absolutePageUrl(buildHref(basePath, { q })),
      pageTitle: title,
    }),
  }
}
