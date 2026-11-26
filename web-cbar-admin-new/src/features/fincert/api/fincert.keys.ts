/** FinCERT module ids and query keys (spec 053): the module ids are the engine's key roots (B1). */

export const FINCERT_DIRECTIONS_MODULE_ID = 'fincert-directions'
export const FINCERT_MEMBERSHIPS_MODULE_ID = 'fincert-memberships'

export const fincertKeys = {
  settings: () => ['fincert', 'settings'] as const,
  /** Under the module roots, so a change in the list refreshes the order dialog. */
  allDirections: () => [FINCERT_DIRECTIONS_MODULE_ID, 'all'] as const,
  allMemberships: () => [FINCERT_MEMBERSHIPS_MODULE_ID, 'all'] as const,
}
