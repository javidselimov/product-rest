import 'server-only'

import { cache } from 'react'

import { mediaUrl } from '@/entities/content'
import type { PageNode } from '@/entities/page-node'
import { promoteHeadingLines } from '@/features/about-content/model/parse'
import { getStaffMember } from '@/features/organization/api/organization.api'
import { formatPhotoSize, photoMeta, photosTotalBytes } from '@/features/organization/model/photos'
import { isBoard } from '@/features/organization/model/schemas'
import { getPagesTree } from '@/features/pages/api/pages.api'
import { absolutePageUrl } from '@/server/page-url'
import { prepareCmsHtml } from '@/shared/lib/cms-html'
import type { Locale } from '@/shared/i18n'
import { buildSectionShell, type SectionShellData } from '@/widgets/section-shell'
import type { StaffPhotoCardData } from '@/widgets/about-blocks/staff-photos'

export type StaffMemberViewData = {
  locale: Locale
  fullName: string | null
  position: string | null
  receptionDays: string | null
  phone: string | null
  tel: string | null
  photoUrl: string | null
  bioHtml: string
  /** Mətbuat fotoları (Figma `2037:4289`); boşdursa bölmə göstərilmir. */
  photos: StaffPhotoCardData[]
  /** Same-origin ZIP proxy-si (`app/media/staff-photos/[id]/route.ts`) və onun düymədəki ölçüsü. */
  photosZip: { href: string; size: string } | null
  shell: SectionShellData
}

/** `id` müsbət tam ədəd deyilsə `null` (route 404 verir). */
export function parseStaffId(raw: string): number | null {
  if (!/^\d+$/.test(raw)) return null
  const id = Number(raw)
  return Number.isSafeInteger(id) && id > 0 ? id : null
}

export const loadStaffMember = cache(async (locale: Locale, rawId: string): Promise<StaffMemberViewData | null> => {
  const id = parseStaffId(rawId)
  if (id === null) return null

  const [member, tree] = await Promise.all([
    getStaffMember(locale, id).catch(() => null),
    getPagesTree(locale).catch((): PageNode[] => []),
  ])
  if (!member) return null

  // Breadcrumb: … › İdarə Heyəti (və ya Rəhbərlik) › Ad (spec 024 US4 #5).
  const parentSection = isBoard(member.type) ? 'board' : 'management'
  const fullName = member.fullName ?? ''
  const photos = member.photos.map((photo) => ({
    mediaId: photo.mediaId,
    url: mediaUrl(photo.url) ?? photo.url,
    fileName: photo.originalName,
    meta: photoMeta(photo, locale),
  }))
  return {
    locale,
    fullName: member.fullName,
    position: member.position,
    receptionDays: member.receptionDays,
    phone: member.phone,
    tel: member.phone ? member.phone.replace(/[^+\d]/g, '') || null : null,
    photoUrl: mediaUrl(member.photoUrl),
    bioHtml: promoteHeadingLines(prepareCmsHtml(member.bio)),
    photos,
    photosZip:
      photos.length > 0
        ? { href: `/media/staff-photos/${id}`, size: formatPhotoSize(photosTotalBytes(member.photos), locale) }
        : null,
    shell: buildSectionShell({
      section: 'about',
      tree,
      locale,
      current: { href: `/${locale}/organization?section=${parentSection}` },
      pageUrl: await absolutePageUrl(`/${locale}/organization/staff/detail/${id}`),
      pageTitle: fullName,
      trail: fullName,
    }),
  }
})
