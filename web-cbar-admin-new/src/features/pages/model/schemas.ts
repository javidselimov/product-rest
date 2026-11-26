/** Page DTO schemas (contracts/admin-api.md §4, data-model.md §3), B13. */

import { z } from 'zod'

import { translationsSchema } from '@/entities/content/model/types'

export const PAGE_FLAG_KEYS = [
  'active',
  'visible',
  'showAz',
  'showEn',
  'readonly',
  'disabled',
  'removable',
  'removableAll',
  'movableU',
  'movableD',
  'movableL',
  'movableR',
  'selected',
  'collapsed',
  // Last, as in the API's PageFlagsDto (spec 041).
  'showInSideNav',
] as const
export type PageFlagKey = (typeof PAGE_FLAG_KEYS)[number]
/**
 * Spec 054: `showInDropdownNav` is the one nullable flag — null follows `showInSideNav` (a page never placed
 * by an editor). It is not a checkbox, so it stays out of `PAGE_FLAG_KEYS`.
 */
export type PageFlags = Record<PageFlagKey, boolean> & {
  showInDropdownNav: boolean | null
}

/** Defaults of the API record (PageFlagsDto). */
export const DEFAULT_PAGE_FLAGS: PageFlags = {
  active: true,
  visible: true,
  showAz: true,
  showEn: true,
  readonly: false,
  disabled: false,
  removable: true,
  removableAll: false,
  movableU: true,
  movableD: true,
  movableL: false,
  movableR: false,
  selected: false,
  collapsed: false,
  showInSideNav: true,
  showInDropdownNav: null,
}

export const pageFlagsSchema = z.looseObject({
  ...(Object.fromEntries(
    PAGE_FLAG_KEYS.map((key) => [
      key,
      z.boolean().default(DEFAULT_PAGE_FLAGS[key]),
    ]),
  ) as Record<PageFlagKey, z.ZodDefault<z.ZodBoolean>>),
  showInDropdownNav: z.boolean().nullable().default(null),
})

export interface PageNode {
  id: number
  parentId: number | null
  sortOrder: number
  status: string
  title: string | null
  slug: string | null
  navUrl: string | null
  flags: PageFlags
  children: PageNode[]
}

export const pageNodeSchema: z.ZodType<PageNode> = z.lazy(() =>
  z.looseObject({
    id: z.number(),
    parentId: z.number().nullable().default(null),
    sortOrder: z.number().default(0),
    status: z.string(),
    title: z.string().nullable().default(null),
    slug: z.string().nullable().default(null),
    navUrl: z.string().nullable().default(null),
    flags: pageFlagsSchema,
    children: z.array(pageNodeSchema).default([]),
  }),
) as z.ZodType<PageNode>

export const pageTreeSchema = z.array(pageNodeSchema)

export const pageAssetSchema = z.looseObject({
  id: z.number(),
  mediaId: z.number(),
  originalName: z.string().nullable().optional(),
  mimeType: z.string().nullable().optional(),
  sizeBytes: z.number().nullable().optional(),
  sortOrder: z.number().default(0),
  groupLabel: z.string().nullable().optional(),
  translations: translationsSchema(
    z.looseObject({ title: z.string() }),
  ).default({}),
})
export type PageAsset = z.infer<typeof pageAssetSchema>

export const pageTranslationSchema = z.looseObject({
  title: z.string(),
  slug: z.string().nullable().optional(),
  content: z.string().nullable().optional(),
  // Spec 054: the label of the page's menu group in this locale; data only until the header redesign (spec 055).
  menuGroup: z.string().nullable().optional(),
})

export const pageDetailSchema = z.looseObject({
  id: z.number(),
  parentId: z.number().nullable().default(null),
  sortOrder: z.number().default(0),
  status: z.string(),
  showInFooter: z.boolean().default(false),
  navUrl: z.string().nullable().default(null),
  flags: pageFlagsSchema,
  translations: translationsSchema(pageTranslationSchema).default({}),
  assets: z.array(pageAssetSchema).default([]),
})
export type PageDetail = z.infer<typeof pageDetailSchema>

export interface PageUpsert {
  parentId: number | null
  sortOrder: number
  status: string
  showInFooter: boolean
  navUrl: string | null
  flags: PageFlags
  translations: Record<
    string,
    /** `menuGroup` omitted keeps the stored label, `''` clears it (contracts/admin-api.md, spec 054). */
    { title: string; content: string; slug?: string; menuGroup?: string }
  >
}
