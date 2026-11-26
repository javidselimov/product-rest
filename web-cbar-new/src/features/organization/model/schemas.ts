/**
 * Təşkilat: əməkdaşlar, şöbələr, ofislər (spec 002 data-model.md §6).
 */
import { z } from 'zod'

import { STAFF_TYPE } from './constants'

const nullableString = z.string().nullable().optional().transform((v) => v ?? null)

/** Mətbuat fotosu — bio altındakı yükləmə dəsti (Figma `2037:4289`); `url` `/media/{id}`-dir. */
export const staffPhotoSchema = z
  .object({
    mediaId: z.number(),
    originalName: z.string(),
    mimeType: z.string(),
    sizeBytes: z.number(),
    width: z.number().nullable().optional().transform((v) => v ?? null),
    height: z.number().nullable().optional().transform((v) => v ?? null),
    url: z.string(),
  })
  .passthrough()

export type StaffPhoto = z.infer<typeof staffPhotoSchema>

export const staffMemberSchema = z
  .object({
    id: z.number(),
    type: z.number().optional(),
    fullName: nullableString,
    position: nullableString,
    receptionDays: nullableString,
    phone: nullableString,
    bio: nullableString,
    photoUrl: nullableString,
    // Köhnə API (deploy-dan əvvəl) sahəni göndərmir — boş dəst kimi oxunur.
    photos: z.array(staffPhotoSchema).optional().default([]),
  })
  .passthrough()

/** Əsasnamə sənədi — `AssetFile` (public-api `Division.regulation`, `Office.regulation`); `url` `/media/{id}`-dir. */
export const regulationSchema = z
  .object({ mediaId: z.number(), originalName: z.string(), mimeType: z.string(), sizeBytes: z.number(), url: z.string() })
  .passthrough()

/** @deprecated `regulationSchema` — eyni forma, hər iki resurs üçün. */
export const officeRegulationSchema = regulationSchema

export type Regulation = z.infer<typeof regulationSchema>

/** Şöbə (Figma `1003:12461`). Köhnə API (deploy-dan əvvəl) `regulation` göndərmir — null kimi oxunur. */
export const divisionSchema = z
  .object({
    id: z.number(),
    name: nullableString,
    description: nullableString,
    regulation: regulationSchema.nullable().optional().transform((v) => v ?? null),
  })
  .passthrough()

/** Ərazi idarəsi kartı (Figma `2046:3531`). Köhnə API (deploy-dan əvvəl) yeni sahələri göndərmir — null kimi oxunur. */
export const officeSchema = z
  .object({
    id: z.number(),
    name: nullableString,
    address: nullableString,
    phone: nullableString,
    directorName: nullableString,
    photoUrl: nullableString,
    regulation: regulationSchema.nullable().optional().transform((v) => v ?? null),
  })
  .passthrough()

/**
 * Org-chart node (spec 027, public-api `OrgChartNode`). A flat list; the tree comes from
 * `parentId`, and the desktop chart is laid out from that tree (spec 060), so the deprecated
 * `layout` / `connector` fields are not read. `departmentsOpen` defaults to false, so an older
 * api-cbar without the field shows every block as a dropdown.
 * `kind`: 1 governor, 2 deputy, 3 director general, 4 block, 5 department, 6 group.
 */
export const orgChartNodeSchema = z
  .object({
    id: z.number(),
    parentId: z.number().nullable(),
    kind: z.number(),
    curatorDirect: z.boolean(),
    name: z.string(),
    role: nullableString,
    link: z
      .object({ type: z.enum(['staff', 'division']), id: z.number() })
      .nullable()
      .optional()
      .transform((v) => v ?? null),
    departmentsOpen: z.boolean().default(false),
  })
  .passthrough()

export type OrgChartNode = z.infer<typeof orgChartNodeSchema>

export type StaffMember = z.infer<typeof staffMemberSchema>
export type Division = z.infer<typeof divisionSchema>
export type Office = z.infer<typeof officeSchema>

export function isBoard(type: number | undefined): boolean {
  return type === STAFF_TYPE.board
}

/**
 * İdarə Heyəti: sıralamada birinci üzv sədrdir, qalanları müavinlərdir (spec 024 FR-012).
 * API-də ayrıca "sədr" bayrağı yoxdur — CMS sırası redaktorun nəzarətindədir.
 */
export function splitBoard<T>(members: T[]): { chair: T | null; deputies: T[] } {
  const [chair = null, ...deputies] = members
  return { chair, deputies }
}

export const ORGANIZATION_SECTIONS = ['board', 'management', 'divisions', 'offices'] as const
export type OrganizationSection = (typeof ORGANIZATION_SECTIONS)[number]

/** Ad hərflərindən inisial (foto yoxdursa). */
export function initials(name: string | null): string {
  if (!name) return '•'
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toLocaleUpperCase('az-AZ') ?? '')
      .join('') || '•'
  )
}
