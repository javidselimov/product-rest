/**
 * URL search-parameter names shared by loaders, forms and link builders (spec 032).
 * Parsing lives in `shared/lib/search-params.ts`; these are only the keys.
 */
export const QUERY_PARAM = {
  TYPE: 'type',
  PAGE: 'page',
  QUERY: 'q',
  FROM: 'from',
  TO: 'to',
  DATE_FROM: 'dateFrom',
  DATE_TO: 'dateTo',
  /** Year order of the memorandum and membership tables (specs 045, 046). */
  SORT: 'sort',
  /** Tab of the complaint index page: `bank` or `insurance` (spec 050). */
  TAB: 'tab',
  /** Channel of the appeal statistics: its 1-based position in the editor's order (spec 050). */
  CHANNEL: 'channel',
  /** Year of the appeal statistics table (spec 050). */
  YEAR: 'year',
  /** FAQ topic of view B: the topic slug (spec 051). */
  TOPIC: 'topic',
  /** Legacy cbar.az language switch, honoured by `legacyRedirect()`. */
  LANGUAGE: 'language',
} as const
