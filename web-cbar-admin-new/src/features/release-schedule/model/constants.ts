/** Release schedule constants (spec 032, spec 039). */

/** `timingMode` as the API sends it (`contracts/admin-api.md`). */
export const TIMING_MODE = {
  TEXT: 'text',
  LINK: 'link',
  DECISIONS: 'decisions',
} as const

export type TimingMode = (typeof TIMING_MODE)[keyof typeof TIMING_MODE]

export const TIMING_MODES = Object.values(TIMING_MODE)

/** The `timing_url` column length (0022). */
export const TIMING_URL_MAX_LENGTH = 1000
