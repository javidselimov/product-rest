/** Organization section constants (spec 032). */

/**
 * Staff type: 1 — board, 2 — management, 3 — adviser to the governor. On the site 2 and 3
 * are separate groups of the "Management" page (Figma `1814:4894`); the DB/API does not validate it.
 */
export const STAFF_TYPE = {
  BOARD: 1,
  MANAGEMENT: 2,
  ADVISER: 3,
} as const
