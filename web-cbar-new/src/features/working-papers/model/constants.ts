/** Working papers (spec 054). */

/** Rows per list page (research R5; Figma's 5 rows and 22 pages are sample numbers). */
export const WORKING_PAPERS_PAGE_SIZE = 10

/** The address key of a paper: number padded to two digits, then the year (`02-2025`). */
export const WORKING_PAPER_KEY = /^(\d{2})-(\d{4})$/

/** Digits the number is padded to in the code and the key. */
export const PAPER_NUMBER_DIGITS = 2

/** Length of the meta description taken from the abstract. */
export const PAPER_DESCRIPTION_LENGTH = 160

/** `year` search parameter value of "all years" — the parameter is simply left out. */
export const ALL_YEARS = ''
