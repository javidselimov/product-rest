/**
 * Struktur bölmənin səhifəsi (spec 024 US5 #3): `/organization/divisions/{id}`.
 *
 * API-də tək şöbə endpoint-i yoxdur — siyahı (`getDivisions`) alınıb `id` ilə tapılır.
 * Breadcrumb və sol menyu "Struktur bölmələr" qovşağına bağlanır.
 */
import 'server-only'

import { cache } from 'react'

import { mediaUrl, type AttachmentFile } from '@/entities/content'
import type { PageNode } from '@/entities/page-node'
import { parseFacts, type InfoFact } from '@/features/about-content/model/parse'
import { getDivisions } from '@/features/organization/api/organization.api'
import type { Regulation } from '@/features/organization/model/schemas'
import { getPagesTree } from '@/features/pages/api/pages.api'
import { absolutePageUrl } from '@/server/page-url'
import { prepareCmsHtml } from '@/shared/lib/cms-html'
import type { Locale } from '@/shared/i18n'
import { getT } from '@/shared/i18n/server'
import { parseStaffId as parsePositiveId } from '@/views/staff-member/loader'
import { buildSectionShell, type SectionShellData } from '@/widgets/section-shell'

export type { InfoFact }

export type DivisionViewData = {
  locale: Locale
  name: string
  /** "Direktor: Ad" sətirləri — Figma `1003:12462` məlumat kartı. */
  facts: InfoFact[]
  /** Təsvirin qalan hissəsi (CMS HTML). */
  html: string
  /** Əsasnamə — kartın altındakı fayl sətri (Figma `1000:12443`); CMS-də bağlanmayıbsa boş. */
  attachments: AttachmentFile[]
  shell: SectionShellData
}

/** Şöbənin əsasnaməsi `Attachments` widget-inin formasına — başlıq sabit "Əsasnamə" etiketidir, fayl adı yox. */
function regulationAttachment(regulation: Regulation | null, title: string): AttachmentFile[] {
  if (!regulation) return []
  return [
    {
      id: regulation.mediaId,
      title,
      mimeType: regulation.mimeType,
      sizeBytes: regulation.sizeBytes,
      group: null,
      url: mediaUrl(regulation.url) ?? regulation.url,
    },
  ]
}

/** Şöbə tapılmırsa və ya `id` səhvdirsə `null` (route 404). API xətası səhifə xətasına gedir. */
export const loadDivision = cache(async (locale: Locale, rawId: string): Promise<DivisionViewData | null> => {
  const id = parsePositiveId(rawId)
  if (id === null) return null

  const [divisions, tree] = await Promise.all([getDivisions(locale), getPagesTree(locale).catch((): PageNode[] => [])])
  const division = divisions.find((d) => d.id === id)
  if (!division) return null

  const name = division.name ?? ''
  const { facts, html } = parseFacts(prepareCmsHtml(division.description))
  return {
    locale,
    name,
    facts,
    html,
    attachments: regulationAttachment(division.regulation, getT(locale, 'organization')('division.regulation')),
    shell: buildSectionShell({
      section: 'about',
      tree,
      locale,
      current: { href: `/${locale}/organization?section=divisions` },
      pageUrl: await absolutePageUrl(`/${locale}/organization/divisions/${id}`),
      pageTitle: name,
      trail: name,
    }),
  }
})
