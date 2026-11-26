/**
 * Org-chart widget geometry (spec 027, spec 032). Desktop chart geometry is in `entities/org-chart` (`CHART`, spec 060).
 */

/**
 * Tree view branch geometry per depth: indent, top padding and the `tick` — distance of the
 * horizontal connector from the top of the branch (Figma 31.25 at level 1: gap + first card line).
 */
export const BRANCH = [
  { indent: 'pl-6', top: 'pt-4', tick: 31 },
  { indent: 'pl-5', top: 'pt-3', tick: 27 },
  { indent: 'pl-4', top: 'pt-2', tick: 23 },
] as const
