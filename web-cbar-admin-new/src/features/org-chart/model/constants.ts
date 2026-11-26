/** Org chart constants (spec 032, spec 027, spec 060). */

/** Node kinds as stored by the API. */
export const ORG_CHART_KIND = {
  GOVERNOR: 1,
  DEPUTY: 2,
  DIRECTOR_GENERAL: 3,
  BLOCK: 4,
  DEPARTMENT: 5,
  GROUP: 6,
} as const

/** Kind values in display order — select options and validation. */
export const ORG_CHART_KINDS = [
  ORG_CHART_KIND.GOVERNOR,
  ORG_CHART_KIND.DEPUTY,
  ORG_CHART_KIND.DIRECTOR_GENERAL,
  ORG_CHART_KIND.BLOCK,
  ORG_CHART_KIND.DEPARTMENT,
  ORG_CHART_KIND.GROUP,
] as const

/** Kinds whose departments can be always open on the site's desktop chart (spec 060, FR-012). */
export const DEPARTMENTS_OPEN_KINDS: readonly number[] = [ORG_CHART_KIND.BLOCK, ORG_CHART_KIND.GROUP]

/** "Departamentlər" radio values. */
export const DEPARTMENTS_MODE = { DROPDOWN: 'dropdown', OPEN: 'open' } as const

/** Tree list: base padding + indent per depth (px). */
export const NODE_LIST_INDENT = { BASE: 8, PER_DEPTH: 20 } as const

/** The page's two views (spec 060, US4), kept in `?view=`; the list is the default and stays out of the URL. */
export const ORG_CHART_VIEW = { LIST: 'list', CHART: 'chart' } as const
export type OrgChartView = (typeof ORG_CHART_VIEW)[keyof typeof ORG_CHART_VIEW]

/** The public site's org-chart page, appended to the site URL (spec 060, "Saytda bax"). */
export const SITE_CHART_PATH = '/az/organization?section=divisions'
