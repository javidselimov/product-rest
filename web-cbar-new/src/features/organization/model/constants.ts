/**
 * Organization codes coming from api-cbar (spec 027, spec 032).
 */

/** `kind` of an org-chart node; owned by the org-chart entity. */
export { ORG_CHART_KIND } from '@/entities/org-chart'

/** Staff `type`: 1 Board, 2 director general, 3 adviser to the Governor (the last two form "Management"). */
export const STAFF_TYPE = { board: 1, director: 2, adviser: 3 } as const
