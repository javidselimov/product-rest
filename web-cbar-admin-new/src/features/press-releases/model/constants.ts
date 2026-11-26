/** Press release constants (spec 032, spec 029). */

/** `type` as stored by the API: 1 news, 2 announcement, 3 interview or speech. */
export const PRESS_RELEASE_TYPE = {
  NEWS: 1,
  ANNOUNCEMENT: 2,
  INTERVIEW: 3,
} as const

export const COLUMN_WIDTH = {
  ID: 60,
} as const
