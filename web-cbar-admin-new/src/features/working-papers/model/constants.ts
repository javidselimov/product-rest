/**
 * Working papers section (spec 054, `data-model.md`, `api-cbar-admin/openapi/components/schemas/working-papers.yaml`):
 * the bounds the API checks and the section's own values.
 */

export const WORKING_PAPERS_PATH = '/working-papers'

/** The number is the position within the year: `02/2025` is number 2. */
export const NUMBER_MIN = 1
export const NUMBER_MAX = 99

/** The legacy series starts later; the API accepts papers from this year. */
export const YEAR_MIN = 1990

/** A paper may be entered ahead of the new year. */
const YEARS_AHEAD = 1

/** The latest year the API accepts: next year. */
export const yearMax = () => new Date().getFullYear() + YEARS_AHEAD

export const TITLE_MAX_LENGTH = 500

/** A JEL code: a letter and one or two digits (`E58`, `C2`). */
export const JEL_CODE_PATTERN = /^[A-Za-z]\d{1,2}$/

/** The language the paper is written in (not the site locale). */
export const PAPER_LANGUAGES = ['az', 'en', 'other'] as const

/** Authors, keywords and JEL codes are typed as one comma-separated line. */
export const LIST_SEPARATOR = ','
export const LIST_JOINER = ', '
