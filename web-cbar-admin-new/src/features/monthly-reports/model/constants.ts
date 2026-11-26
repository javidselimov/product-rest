/** Monthly reports section (spec 052, `data-model.md`): the bounds the API checks and the section's own values. */

export const MONTHLY_REPORTS_PATH = '/monthly-reports'

/** The query parameter, list filter and form field of the series; a series is addressed by its key. */
export const SERIES_PARAM = 'series'

/** The legacy archives start in 2021; the API accepts reports from this year. */
export const YEAR_MIN = 2000

/** A report may be entered ahead of the new year. */
const YEARS_AHEAD = 1

/** The latest year the API accepts: next year. */
export const yearMax = () => new Date().getFullYear() + YEARS_AHEAD

export const MONTHS_IN_YEAR = 12

/** The months, 1–12, as select values and `months.<n>` label keys. */
export const MONTHS = Array.from({ length: MONTHS_IN_YEAR }, (_, index) => index + 1)

/** Between the first and the last month of a period longer than a month. */
export const PERIOD_SEPARATOR = ' – '
