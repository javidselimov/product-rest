/** Memorandums section limits (spec 045, `data-model.md`): the same bounds the API checks. */

/** The Central Bank signed no memorandum before this year. */
export const SIGNED_YEAR_MIN = 1991

/** A memorandum signed late in the year may be entered ahead of time. */
const YEARS_AHEAD = 1

/** The latest year the API accepts: next year. */
export const signedYearMax = () => new Date().getFullYear() + YEARS_AHEAD
