/**
 * Təşkilat (contracts/routes.md #13): köhnə sayt kimi `?section=board|management|divisions|offices`
 * — yalnız seçilmiş bölmənin sorğusu + səhifə ağacı (sol menyu «Haqqımızda» bölməsi).
 *
 * Spec 024: "Haqqımızda" şablonu (breadcrumb, menyu, paylaşma), İdarə Heyətində sədr/müavin
 * bölgüsü, struktur bölmələrdə CMS səhifəsinin sxemi və əsasnamələri, şöbə səhifəsinə keçid.
 */
import 'server-only'

import { mediaUrl, type AttachmentFile } from '@/entities/content'
import { findChainBy, type PageNode } from '@/entities/page-node'
import { linkFirstImage } from '@/features/about-content/model/parse'
import { getDivisions, getOffices, getOrgChart, getStaff } from '@/features/organization/api/organization.api'
import { STAFF_TYPE } from '@/features/organization/model/constants'
import {
  ORGANIZATION_SECTIONS,
  splitBoard,
  type OrgChartNode,
  type OrganizationSection,
  type StaffMember,
} from '@/features/organization/model/schemas'
import { getPage, getPagesTree } from '@/features/pages/api/pages.api'
import { absolutePageUrl } from '@/server/page-url'
import { prepareCmsHtml } from '@/shared/lib/cms-html'
import { enumParam, first, type RawSearchParams } from '@/shared/lib/search-params'
import { getT } from '@/shared/i18n/server'
import type { Locale } from '@/shared/i18n'
import type { OfficeCardData } from '@/widgets/about-blocks/office-cards'
import type { StaffCardData } from '@/widgets/about-blocks/staff-cards'
import { buildSectionShell, type SectionShellData } from '@/widgets/section-shell'
import type { OrgChartCardData } from '@/widgets/org-chart'

export type { StaffCardData }
export type DivisionListItem = { id: number; name: string | null; href: string }
export type { OfficeCardData } from '@/widgets/about-blocks/office-cards'
/** "Struktur bölmələr" CMS səhifəsinin məzmunu (sxem, qeyd) və əlavələri (əsasnamələr). */
export type DivisionsIntro = { html: string; attachments: AttachmentFile[] }

/** Rəhbərlik — Figma `1814:4894`: iki qrup, hər biri öz alt başlığı ilə. */
export type ManagementData = { directors: StaffCardData[]; advisers: StaffCardData[] }

export type OrganizationViewData = {
  locale: Locale
  section: OrganizationSection
  title: string
  shell: SectionShellData
  error: boolean
  board: { chair: StaffCardData | null; deputies: StaffCardData[] }
  management: ManagementData
  divisionsIntro: DivisionsIntro | null
  /** Təşkilati struktur sxemi (spec 027); boşdursa CMS səhifəsinin şəkli göstərilir. */
  orgChart: OrgChartCardData[]
  divisions: DivisionListItem[]
  offices: OfficeCardData[]
}

type SectionBody = Pick<OrganizationViewData, 'error' | 'board' | 'management' | 'divisionsIntro' | 'orgChart' | 'divisions' | 'offices'>

const sectionParam = enumParam(ORGANIZATION_SECTIONS)

const EMPTY: SectionBody = {
  error: false,
  board: { chair: null, deputies: [] },
  management: { directors: [], advisers: [] },
  divisionsIntro: null,
  orgChart: [],
  divisions: [],
  offices: [],
}

export const telOf = (phone: string | null) => (phone ? phone.replace(/[^+\d]/g, '') || null : null)

const toCard = (locale: Locale) => (m: StaffMember): StaffCardData => ({
  id: m.id,
  href: `/${locale}/organization/staff/detail/${m.id}`,
  fullName: m.fullName,
  position: m.position,
  photoUrl: mediaUrl(m.photoUrl),
})

async function boardBody(locale: Locale): Promise<SectionBody> {
  const staff = await getStaff(locale, STAFF_TYPE.board).catch(() => null)
  return { ...EMPTY, error: staff === null, board: splitBoard((staff ?? []).map(toCard(locale))) }
}

/** Baş direktorlar və müşavirlər ayrı tiplərdir — iki sorğu paralel gedir; biri də yıxılsa bölmə xətadır. */
async function managementBody(locale: Locale): Promise<SectionBody> {
  const [directors, advisers] = await Promise.all([
    getStaff(locale, STAFF_TYPE.director).catch(() => null),
    getStaff(locale, STAFF_TYPE.adviser).catch(() => null),
  ])
  return {
    ...EMPTY,
    error: directors === null || advisers === null,
    management: { directors: (directors ?? []).map(toCard(locale)), advisers: (advisers ?? []).map(toCard(locale)) },
  }
}

/**
 * "Struktur bölmələr" qovşağının CMS səhifəsi — ağacda `navUrl` ilə tapılır (research R10).
 * `&copy=1` redaktorun hazırladığı "(Kopya)" səhifəsini göstərir.
 */
async function divisionsIntro(locale: Locale, tree: PageNode[], isCopy: boolean): Promise<DivisionsIntro | null> {
  const navUrl = `/organization?section=divisions${isCopy ? '&copy=1' : ''}`
  const node = findChainBy(tree, (n) => n.navUrl === navUrl)?.at(-1)
  if (!node) return null
  const page = await getPage(locale, node.slug).catch(() => null)
  const html = linkFirstImage(prepareCmsHtml(page?.content))
  const attachments: AttachmentFile[] = (page?.assets ?? []).map((asset) => ({
    id: asset.mediaId,
    title: asset.title,
    mimeType: asset.mimeType,
    sizeBytes: asset.sizeBytes,
    group: asset.group,
    url: mediaUrl(asset.url) ?? asset.url,
  }))
  return html.trim() || attachments.length > 0 ? { html, attachments } : null
}

/** Sxem kartının keçidi — əməkdaşın bioqrafiyası və ya şöbə səhifəsi (spec 027). */
function chartHref(locale: Locale, link: OrgChartNode['link']): string | null {
  if (!link) return null
  return link.type === 'staff' ? `/${locale}/organization/staff/detail/${link.id}` : `/${locale}/organization/divisions/${link.id}`
}

const toChartCard = (locale: Locale) => (n: OrgChartNode): OrgChartCardData => ({
  id: n.id,
  parentId: n.parentId,
  kind: n.kind,
  name: n.name,
  role: n.role,
  curatorDirect: n.curatorDirect,
  href: chartHref(locale, n.link),
  departmentsOpen: n.departmentsOpen,
})

/** Sxem sorğusu yıxılsa bölmə xəta vermir — CMS səhifəsinin şəkli göstərilir. */
async function divisionsBody(locale: Locale, treePromise: Promise<PageNode[]>, isCopy: boolean): Promise<SectionBody> {
  const [divisions, intro, chart] = await Promise.all([
    getDivisions(locale).catch(() => null),
    treePromise.then((tree) => divisionsIntro(locale, tree, isCopy)),
    getOrgChart(locale).catch((): OrgChartNode[] => []),
  ])
  return {
    ...EMPTY,
    error: divisions === null,
    divisionsIntro: intro,
    orgChart: chart.map(toChartCard(locale)),
    divisions: (divisions ?? []).map((d) => ({ id: d.id, name: d.name, href: `/${locale}/organization/divisions/${d.id}` })),
  }
}

/** Ərazi idarələri — Figma `2046:3531`: foto, ünvan, telefon, rəhbər və əsasnamə sənədi (hər dil üçün öz faylı). */
async function officesBody(locale: Locale): Promise<SectionBody> {
  const offices = await getOffices(locale).catch(() => null)
  return {
    ...EMPTY,
    error: offices === null,
    offices: (offices ?? []).map((o) => ({
      id: o.id,
      name: o.name,
      address: o.address,
      phone: o.phone,
      tel: telOf(o.phone),
      directorName: o.directorName,
      photoUrl: mediaUrl(o.photoUrl),
      regulation: o.regulation ? { url: mediaUrl(o.regulation.url) ?? o.regulation.url, fileName: o.regulation.originalName } : null,
    })),
  }
}

export async function loadOrganization(locale: Locale, searchParams: RawSearchParams): Promise<OrganizationViewData> {
  const section = sectionParam.parse(searchParams.section) ?? 'board'
  const isCopy = first(searchParams.copy) === '1'
  const currentHref = `/${locale}/organization?section=${section}${isCopy ? '&copy=1' : ''}`
  const title = getT(locale, 'organization')(`sections.${section}`)

  const treePromise = getPagesTree(locale).catch((): PageNode[] => [])

  let body: SectionBody
  if (section === 'board') body = await boardBody(locale)
  else if (section === 'management') body = await managementBody(locale)
  else if (section === 'divisions') body = await divisionsBody(locale, treePromise, isCopy)
  else body = await officesBody(locale)

  const tree = await treePromise
  const shell = buildSectionShell({ section: 'about', tree, locale, current: { href: currentHref }, pageUrl: await absolutePageUrl(currentHref), pageTitle: title })
  return { locale, section, title, shell, ...body }
}
