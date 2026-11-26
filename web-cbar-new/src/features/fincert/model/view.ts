/**
 * FinCERT page model (spec 053, `data-model.md` "Saytdakı görünüş modeli"). Pure: the loader gives it the API answer and
 * the CMS page, the view renders what it returns. A section is in the view only when it has content in the locale;
 * when none has, the result is `null` and the route shows the CMS page text instead (FR-016).
 *
 * CMS links are checked here, not in the schema: a bad link is dropped on its own and does not fail the whole parse,
 * which would hide the page. An empty or blank string counts as missing.
 */
import { fileExtension } from '@/entities/content'
import { prepareCmsHtml } from '@/shared/lib/cms-html'

import { FINCERT_SECTION_ORDER, MISSION_LINE_BREAK, PHONE_NON_DIAL_CHARS, SAFE_HREF, type FincertSectionKey } from './constants'
import type { FincertDto, FincertMembershipDto } from './schemas'

export type FincertDirectionView = { id: number; number: number; title: string; bodyHtml: string }

export type FincertContactView = { kind: 'email' | 'phone'; value: string; href: string }

export type FincertMembershipView = FincertMembershipDto

export type FincertPageModel = {
  title: string
  mission: string[] | null
  directions: FincertDirectionView[]
  contacts: FincertContactView[]
  portal: FincertDto['portal']
  /** A media file downloads; an external link opens in a new tab. */
  rfc: { href: string; download: boolean; fileType: string | null } | null
  memberships: FincertMembershipView[]
}

/** The trimmed text, `null` when blank. */
function filled(value: string | null | undefined): string | null {
  return value?.trim() || null
}

/** An `http(s)` or site-relative address, `null` for anything else. */
export function safeHref(value: string | null | undefined): string | null {
  const href = filled(value)
  return href && SAFE_HREF.test(href) ? href : null
}

function missionParagraphs(mission: string | null): string[] | null {
  const paragraphs = (mission ?? '')
    .split(MISSION_LINE_BREAK)
    .map((line) => line.trim())
    .filter(Boolean)
  return paragraphs.length ? paragraphs : null
}

function contactsOf({ email, phone }: FincertDto): FincertContactView[] {
  const contacts: FincertContactView[] = []
  if (email) contacts.push({ kind: 'email', value: email, href: `mailto:${email}` })
  if (phone) contacts.push({ kind: 'phone', value: phone, href: `tel:${phone.replace(PHONE_NON_DIAL_CHARS, '')}` })
  return contacts
}

/** The portal section shows only when its title and its address are both filled (`fincert-cms-guide.md`). */
function portalOf(portal: FincertDto['portal']): FincertPageModel['portal'] {
  const title = filled(portal?.title)
  const url = safeHref(portal?.url)
  return title && url ? { title, description: filled(portal?.description), url } : null
}

function rfcOf(rfc: FincertDto['rfc']): FincertPageModel['rfc'] {
  const file = safeHref(rfc?.file?.url)
  if (rfc?.file && file) return { href: file, download: true, fileType: fileExtension(rfc.file.mimeType) ?? null }
  const url = safeHref(rfc?.url)
  if (url) return { href: url, download: false, fileType: fileExtension(null, url.split(/[?#]/)[0]) ?? null }
  return null
}

const HAS_CONTENT: Record<FincertSectionKey, (view: FincertPageModel) => boolean> = {
  mission: (view) => view.mission !== null,
  directions: (view) => view.directions.length > 0,
  contacts: (view) => view.contacts.length > 0,
  portal: (view) => view.portal !== null,
  rfc: (view) => view.rfc !== null,
  cooperation: (view) => view.memberships.length > 0,
}

/** The sections the view shows, in the Figma order. */
export function fincertSections(view: FincertPageModel): FincertSectionKey[] {
  return FINCERT_SECTION_ORDER.filter((key) => HAS_CONTENT[key](view))
}

export function buildFincertView(data: FincertDto, page: { title: string }): FincertPageModel | null {
  const view: FincertPageModel = {
    title: page.title,
    mission: missionParagraphs(data.mission),
    // The API sends only the directions visible in the locale, so the number is the place in this list (no gaps).
    directions: data.directions.map((direction, index) => ({
      id: direction.id,
      number: index + 1,
      title: direction.title,
      bodyHtml: prepareCmsHtml(direction.body),
    })),
    contacts: contactsOf(data),
    portal: portalOf(data.portal),
    rfc: rfcOf(data.rfc),
    memberships: data.memberships.map((membership) => ({
      ...membership,
      url: safeHref(membership.url),
      logo: safeHref(membership.logo),
    })),
  }
  return fincertSections(view).length ? view : null
}
