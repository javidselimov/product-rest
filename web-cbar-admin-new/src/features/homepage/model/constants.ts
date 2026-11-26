/** Homepage sections (slider, publications, info lines) — list column widths (spec 032). */
export const COLUMN_WIDTH = {
  ID: 70,
  SORT_ORDER: 80,
  YEAR: 80,
} as const

// ---- strategy documents (spec 057) ----

/** The "Strategiya və sənədlər" tab; its new and edit forms hang under it. */
export const STRATEGY_DOCS_PATH = '/homepage-blocks/strategy-docs'

/** The engine's key root for the strategy documents (B1); the order dialog's query lives under it. */
export const STRATEGY_DOCS_MODULE_ID = 'homepage-strategy-docs'

/** The API's page-size cap (`PagingQuery.MaxPageSize`): one request lists every document for ordering. */
export const STRATEGY_DOCS_FULL_LIST_SIZE = 100

/** Field limits of the API (`StrategyDocRules`), checked in the form before the request. */
export const STRATEGY_DOC_LIMITS = {
  TITLE: 300,
  SUMMARY: 500,
  URL: 1000,
} as const

/** Cover preview in the list. */
export const COVER_THUMB_WIDTH_PX = 64
