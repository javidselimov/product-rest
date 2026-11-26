/** Press release constants (spec 032, spec 033). */

/** `type` as the site uses it: the URL parameter and the API code as a string. */
export const PRESS_RELEASE_TYPE = {
  NEWS: '1',
  ANNOUNCEMENT: '2',
  INTERVIEW: '3',
} as const

/** A long title stays a usable file name; the extension comes on top of this. */
export const PDF_FILE_NAME_MAX_LENGTH = 120
export const PDF_EXTENSION = '.pdf'
/** For a title with nothing left after cleaning. */
export const PDF_FALLBACK_NAME = 'document'
