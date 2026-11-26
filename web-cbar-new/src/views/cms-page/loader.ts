/**
 * CMS page loader (spec 002 FR-013, FR-015; contracts/public-api.md §3 `/[...slug]`).
 *
 * The last segment is the slug; without a page `null` (the route calls `notFound()`). The tree is
 * read separately, as on the old site, and on failure the page renders without the side tree.
 * HTML is prepared here (`prepareCmsHtml`), the view gets a ready string.
 *
 * Template sections (spec 024 "About us", spec 028 "Media", spec 043 "International cooperation"): the
 * root is recognised by `sectionKeyOf`, the page gets `SectionShell` data and its layout from `sectionLayoutFor`, one
 * rule per section. About's structured blocks apply
 * only to About (research R7). Media pages stay ordinary content, except the slugs in `mediaLayoutFor`
 * (specs 037, 038); International cooperation is ordinary content, except the slugs in `cooperationLayoutFor`
 * (specs 044, 045); Financial literacy has its two layouts in `literacyLayoutFor` (spec 047); Consumer and investor
 * rights has four in `consumerLayoutFor`, two of them reading a companion page (spec 050). Other sections keep the old look.
 *
 * Every page except the FAQ page itself also gets the FAQ topics linked to it, as link cards (spec 051 US5).
 */
import 'server-only'

import { cache } from 'react'

import { formatDate, mediaUrl, type AttachmentFile } from '@/entities/content'
import {
  CONSUMER_INFOGRAPHICS_SLUG,
  CONSUMER_INSURANCE_SLUG,
  findChain,
  findChainBy,
  FAQ_SLUG,
  hrefFor,
  isFaqSlug,
  nodeHref,
  sectionKeyOf,
  type PageNode,
  type SectionKey,
} from '@/entities/page-node'
import { sectionLayoutFor } from '@/features/about-content/model/layouts'
import { REPORT_SERIES } from '@/features/about-content/model/constants'
import { getFaqTopicsForPage } from '@/features/faq/api/faq.api'
import { getCsrProjects } from '@/features/csr-projects/api/csr-projects.api'
import type { CsrProjectDto } from '@/features/csr-projects/model/schemas'
import { getIfiOrganizations } from '@/features/ifi-organizations/api/ifi-organizations.api'
import type { IfiOrganizationDto } from '@/features/ifi-organizations/model/schemas'
import { getMemorandums } from '@/features/memorandums/api/memorandums.api'
import type { MemorandumDto } from '@/features/memorandums/model/schemas'
import { getMonthlyReports } from '@/features/monthly-reports/api/monthly-reports.api'
import type { MonthlyReportSeriesDto } from '@/features/monthly-reports/model/schemas'
import { parseAbout, type ParseContext } from '@/features/about-content/model/parse'
import type { AboutBlock, AboutLayoutKind, CsrProject, IfiOrganization, ReportSeries } from '@/features/about-content/model/types'
import { getPage, getPagesTree } from '@/features/pages/api/pages.api'
import type { PageDetail } from '@/features/pages/model/schemas'
import { absolutePageUrl } from '@/server/page-url'
import { QUERY_PARAM } from '@/shared/constants/query-params'
import { prepareCmsHtml } from '@/shared/lib/cms-html'
import { safeDecodeURIComponent } from '@/shared/lib/uri'
import { buildHref, type RawSearchParams } from '@/shared/lib/search-params'
import { otherLocale, type Locale } from '@/shared/i18n'
import type { FaqTopicLink } from '@/widgets/faq'
import { buildSectionShell, type SectionShellData } from '@/widgets/section-shell'

/** A page of a template section: the template data and the page's Figma blocks. */
export type ShellPageData = { section: SectionKey; shell: SectionShellData; layout: AboutLayoutKind; blocks: AboutBlock[] }

export type CmsPageViewData = {
  locale: Locale
  title: string
  slug: string
  html: string
  section: PageNode | null
  childPages: { key: string; title: string; href: string }[]
  attachments: AttachmentFile[]
  shellPage: ShellPageData | null
  /** FAQ topics linked to the page, shown as link cards after its text (spec 051 US5). */
  faqTopics: FaqTopicLink[]
}

function toCsrProject(project: CsrProjectDto): CsrProject {
  const gallery = project.images.map((image) => ({ src: mediaUrl(image.url) ?? image.url, alt: '' }))
  const cover = mediaUrl(project.cover)
  return {
    id: project.id,
    category: project.category,
    cardTitle: project.cardTitle,
    summary: project.summary,
    title: project.title,
    html: prepareCmsHtml(project.content ?? ''),
    cover: cover ? { src: cover, alt: '' } : (gallery[0] ?? null),
    gallery,
  }
}

/** An `http(s)` address and its host for the link text; anything else (`javascript:`, relative) is dropped. */
function website(url: string | null): { url: string; label: string } | null {
  if (!url) return null
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:' || parsed.protocol === 'http:' ? { url: parsed.href, label: parsed.host } : null
  } catch {
    return null
  }
}

function toIfiOrganization(organization: IfiOrganizationDto, locale: Locale): IfiOrganization {
  const logo = mediaUrl(organization.logo)
  const site = website(organization.websiteUrl)
  return {
    id: organization.id,
    name: organization.name,
    logo: logo ? { src: logo, alt: organization.name } : null,
    memberSince: organization.memberSince,
    websiteUrl: site?.url ?? null,
    websiteLabel: site?.label ?? null,
    mission: organization.mission?.trim() || null,
    membershipIntro: organization.membershipIntro?.trim() || null,
    html: prepareCmsHtml(organization.content ?? ''),
    memberships: organization.memberships.map((membership) => ({ date: formatDate(membership.joinedOn, locale), name: membership.name })),
  }
}

/** The page shown inside a consumer rights page (spec 050 research R4): the insurance index, the infographics. */
function companionSlug(layout: AboutLayoutKind, locale: Locale): string | undefined {
  if (layout === 'complaint-index') return CONSUMER_INSURANCE_SLUG[locale]
  if (layout === 'appeal-statistics') return CONSUMER_INFOGRAPHICS_SLUG[locale]
  return undefined
}

/** The monthly report series a consumer rights layout builds its archive from (spec 052). */
const REPORT_SERIES_FOR_LAYOUT: Partial<Record<AboutLayoutKind, readonly string[]>> = {
  'complaint-index': [REPORT_SERIES.BANK, REPORT_SERIES.INSURANCE],
  'appeal-statistics': [REPORT_SERIES.INFOGRAPHICS],
}

function toReportSeries(series: MonthlyReportSeriesDto): ReportSeries {
  return {
    key: series.key,
    name: series.name,
    periodMonths: series.periodMonths,
    reports: series.reports.map(({ year, month, file }) => ({
      year,
      month,
      file: { id: file.id, url: mediaUrl(file.url) ?? file.url, mimeType: file.mimeType },
    })),
  }
}

/** A failure leaves the layout on the page text, as before spec 052 (FR-014). */
async function loadReports(layout: AboutLayoutKind, locale: Locale): Promise<ReportSeries[]> {
  const keys = REPORT_SERIES_FOR_LAYOUT[layout]
  if (!keys) return []
  const series = await getMonthlyReports(locale, keys).catch((): MonthlyReportSeriesDto[] => [])
  return series.map(toReportSeries)
}

function toAttachments(assets: PageDetail['assets']): AttachmentFile[] {
  return (assets ?? []).map((asset) => ({
    id: asset.mediaId,
    title: asset.title,
    mimeType: asset.mimeType,
    sizeBytes: asset.sizeBytes,
    group: asset.group,
    url: mediaUrl(asset.url) ?? asset.url,
  }))
}

/** A failure leaves the page without link cards: the cards are a pointer, the page's own content still shows. */
async function loadFaqTopics(locale: Locale, pageId: number, slug: string): Promise<FaqTopicLink[]> {
  if (isFaqSlug(slug)) return []
  const topics = await getFaqTopicsForPage(locale, pageId).catch(() => [])
  const faqPath = `/${locale}/${FAQ_SLUG[locale]}`
  return topics.map((topic) => ({ ...topic, href: buildHref(faqPath, { [QUERY_PARAM.TOPIC]: topic.slug }) }))
}

/** A failure or a missing page leaves the host page without the tab or block, its own content still shows. */
async function loadCompanion(layout: AboutLayoutKind, locale: Locale): Promise<ParseContext['companion']> {
  const slug = companionSlug(layout, locale)
  if (!slug) return null
  const page = await getPage(locale, slug).catch(() => null)
  return page ? { html: prepareCmsHtml(page.content), files: toAttachments(page.assets) } : null
}

/**
 * The companion page and the monthly reports of a consumer rights layout (spec 050, spec 052). The complaint index needs
 * its companion either way (the insurance methodology), so both load at once; the statistics page reads the infographics
 * page only when the infographics series has no reports.
 */
async function loadConsumerSources(
  layout: AboutLayoutKind,
  locale: Locale,
): Promise<{ companion: ParseContext['companion']; reports: ReportSeries[] }> {
  if (layout !== 'appeal-statistics') {
    const [companion, reports] = await Promise.all([loadCompanion(layout, locale), loadReports(layout, locale)])
    return { companion, reports }
  }
  const reports = await loadReports(layout, locale)
  const hasInfographics = reports.some((series) => series.key === REPORT_SERIES.INFOGRAPHICS)
  return { companion: hasInfographics ? null : await loadCompanion(layout, locale), reports }
}

export const loadCmsPage = cache(async (locale: Locale, segments: string[]): Promise<CmsPageViewData | null> => {
  const last = segments[segments.length - 1] ?? ''
  const slug = safeDecodeURIComponent(last)
  const page = await getPage(locale, slug)
  if (!page) return null

  const [tree, faqTopics] = await Promise.all([
    getPagesTree(locale).catch((): PageNode[] => []),
    loadFaqTopics(locale, page.id, page.slug),
  ])
  const chain = findChain(tree, page.slug) ?? []
  const current = chain[chain.length - 1]
  const html = prepareCmsHtml(page.content)

  const childPages =
    html.trim().length === 0 && current
      ? current.children.map((child) => ({
          key: String(child.id),
          title: child.title,
          href: hrefFor([...chain, child], locale),
        }))
      : []

  const attachments = toAttachments(page.assets)

  const section = chain[0] ?? null
  const sectionKey = section ? sectionKeyOf(tree, section) : null
  let shellPage: ShellPageData | null = null
  if (sectionKey) {
    const layout = sectionLayoutFor(sectionKey, { slug: page.slug, locale, html, files: attachments })
    // A failure leaves the page without cards: its own text and file still show (spec 038 FR-019).
    const projects = layout === 'csr-projects' ? await getCsrProjects(locale).catch((): CsrProjectDto[] => []) : []
    // The same for the organizations: the page shows its whole text, old list included (spec 044 FR-013).
    const organizations =
      layout === 'ifi-organizations' ? await getIfiOrganizations(locale).catch((): IfiOrganizationDto[] => []) : []
    // And for the memorandums: the page shows its whole text, legacy bank texts included (spec 045 FR-012).
    const memorandums = layout === 'memorandums' ? await getMemorandums(locale).catch((): MemorandumDto[] => []) : []
    const { companion, reports } = await loadConsumerSources(layout, locale)
    shellPage = {
      section: sectionKey,
      shell: buildSectionShell({
        section: sectionKey,
        tree,
        locale,
        current: { slug: page.slug },
        pageUrl: await absolutePageUrl(`/${locale}/${segments.join('/')}`),
        pageTitle: page.title,
      }),
      layout,
      blocks: parseAbout(html, layout, {
        files: attachments,
        projects: projects.map(toCsrProject),
        organizations: organizations.map((organization) => toIfiOrganization(organization, locale)),
        memorandums,
        companion,
        reports,
        locale,
      }),
    }
  }

  return { locale, title: page.title, slug: page.slug, html, section, childPages, attachments, shellPage, faqTopics }
})

/**
 * When the slug belongs to the other language, the page's address in this one; otherwise `null`.
 * Slugs are per language (`tarix` ↔ `history`) and the language switcher changes only the locale
 * segment, so `/en/tarix` redirects to `/en/history` from here. The page id is the same in both
 * languages, so the counterpart is found in the tree by id. The query goes along: the switcher keeps it, and a FAQ
 * topic (`?topic=`, the same slug in both languages) or a table sort must survive the redirect (spec 051 US4).
 */
export async function findLocaleCounterpart(
  locale: Locale,
  segments: string[],
  searchParams: RawSearchParams = {},
): Promise<string | null> {
  const slug = safeDecodeURIComponent(segments[segments.length - 1] ?? '')
  const page = await getPage(otherLocale(locale), slug)
  if (!page) return null

  const tree = await getPagesTree(locale).catch((): PageNode[] => [])
  const node = findChainBy(tree, (n) => n.id === page.id)?.at(-1)
  return node ? withQuery(nodeHref(node, locale), searchParams) : null
}

function withQuery(path: string, searchParams: RawSearchParams): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(searchParams)) {
    for (const item of [value].flat()) if (item !== undefined) search.append(key, item)
  }
  const query = search.toString()
  return query ? `${path}?${query}` : path
}
