/**
 * Org-chart view model (spec 027, spec 060): the API node plus a ready link. The loader builds
 * it, the widgets only render it.
 */
export type OrgChartCardData = {
  id: number
  parentId: number | null
  /** 1 governor, 2 deputy, 3 director general, 4 block, 5 department, 6 group. */
  kind: number
  name: string
  role: string | null
  curatorDirect: boolean
  /** The staff member's or division's page; null — the card is not a link. */
  href: string | null
  /** Block or group only: departments always open on the desktop chart instead of a dropdown. */
  departmentsOpen: boolean
}
