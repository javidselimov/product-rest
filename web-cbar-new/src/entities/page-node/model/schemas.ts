/**
 * CMS page tree (spec 002 data-model.md §2).
 *
 * Recursive schema: `z.lazy` cannot infer its own type, so the interface is written out.
 */
import { z } from 'zod'

export interface PageNode {
  id: number
  title: string
  slug: string
  navUrl: string | null
  /** False: left out of its section's left menu, kept everywhere else (spec 041). Missing means shown. */
  showInSideNav?: boolean
  /**
   * Dropdown menus (mega menu, mobile drawer) below the section root (spec 054). null/missing follows `showInSideNav`;
   * `showInSideNav: false` with `true` here is a page only the dropdown menus list.
   */
  showInDropdownNav?: boolean | null
  /** Menu group label in the locale (spec 054). Data only until the header redesign (spec 055): nothing renders it. */
  menuGroup?: string | null
  children: PageNode[]
}

export const pageNodeSchema: z.ZodType<PageNode> = z.lazy(() =>
  z
    .object({
      id: z.number(),
      title: z.string(),
      slug: z.string(),
      navUrl: z.string().nullable().optional().transform((v) => v ?? null),
      showInSideNav: z.boolean().optional(),
      showInDropdownNav: z.boolean().nullable().optional(),
      menuGroup: z.string().nullable().optional(),
      children: z.array(pageNodeSchema).optional().transform((v) => v ?? []),
    })
    .passthrough(),
) as z.ZodType<PageNode>

export const pageTreeSchema = z.array(pageNodeSchema)
