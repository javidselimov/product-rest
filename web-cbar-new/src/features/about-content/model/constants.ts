/**
 * "About us" CMS markup parser limits (spec 024 `contracts/cms-markup.md`, spec 032).
 */

/** Opening of an `<img …>` tag — attributes start right after it. */
export const IMG_TAG_OPEN = '<img'
/** `about-main` date cards: a table with more rows is ordinary content. */
export const MAX_DATE_CARDS = 6
/** Contact table (spec 037): a row is name, value and optional extra text. */
export const MIN_CONTACT_CARD_CELLS = 2
export const MAX_CONTACT_CARD_CELLS = 3
/** A table with more rows is ordinary content. */
export const MAX_CONTACT_CARDS = 4
/** Headings of the project list that CSR pages may still hold (spec 038); what follows is not shown. */
export const LEGACY_CSR_LIST_HEADINGS = [
  'Korporativ sosial məsuliyyət layihələrimiz',
  'Our Corporate Social Responsibility projects',
  'Layihələrimiz',
  'Our projects',
]
/** Photo paragraph with exactly this many images may use the `tall` layout (spec 026 R4). */
export const TALL_LAYOUT_IMAGES = 3
/** Logo version table (spec 040): a row is image, name, description and an optional background. */
export const MIN_LOGO_CELLS = 3
export const MAX_LOGO_CELLS = 4
/** A table with more rows is ordinary content. */
export const MAX_LOGO_VERSIONS = 8
/** Background cell words (lower case) that put a version on the dark preview. */
export const DARK_LOGO_BACKGROUNDS: ReadonlySet<string> = new Set(['tünd', 'tund', 'dark'])
/**
 * Membership table (spec 046): the sort key is the first four-digit year of the second cell
 * ("2025", "2025-ci il"). A first row without one is the editor's own header row.
 */
export const MEMBERSHIP_YEAR = /\b(?:18|19|20)\d{2}\b/
/** Opening of an `<a …>` tag in the organization cell. */
export const ANCHOR_TAG = /<a\b([^>]*)>/i
/** Only web links become organization links; `javascript:` and relative paths are dropped. */
export const WEB_LINK = /^https?:\/\//i
/** A media library file link (spec 047): `/media/{id}`, the id captured. */
export const MEDIA_HREF = /^\/media\/(\d+)$/
/** A mail link's address: what follows `mailto:`, up to the query. */
export const MAILTO_HREF = /^mailto:([^?]+)/i
/** Image MIME types; a page file of another type does not belong in a photo row (spec 047). */
export const IMAGE_MIME_PREFIX = 'image/'

/*
 * Consumer and investor rights section (spec 050, `specs/050-consumer-rights/contracts/cms-markup.md`).
 */

/** Month names as editors type them in the archive and statistics tables, January first. */
export const MONTHS_AZ = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avqust', 'sentyabr', 'oktyabr', 'noyabr', 'dekabr'] as const
export const MONTHS_EN = [
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december',
] as const
/** A year accordion's summary: four digits. */
export const ARCHIVE_YEAR = /^\d{4}$/
/** Tags that only wrap the archive's accordions (the legacy import and the editor's one-cell table). */
export const ARCHIVE_WRAPPERS: ReadonlySet<string> = new Set(['div', 'table', 'tbody', 'thead', 'tr', 'td', 'th', 'p'])
/** Tabs of the complaint index page; the second one is the insurance companion page. */
export const COMPLAINT_TAB = { BANK: 'bank', INSURANCE: 'insurance' } as const
/** Monthly report series (spec 052): the key the API addresses each by. */
export const REPORT_SERIES = {
  BANK: 'bank-complaint-index',
  INSURANCE: 'insurance-complaint-index',
  INFOGRAPHICS: 'infographics',
} as const
/** Between the first and the last month of a report period longer than a month (the insurance index). */
export const REPORT_PERIOD_SEPARATOR = ' – '
export const MONTHS_IN_YEAR = 12
/** The methodology formula: a quote of exactly three paragraphs (left side, numerator, denominator). */
export const FORMULA_PARAGRAPHS = 3
/** A methodology paragraph starting like this is the note; it and what follows are small print. */
export const NOTE_PREFIX = /^(?:qeyd|note)\s*:/i
/** First cell of a statistics table in the months × sectors form. */
export const STAT_MONTHS_HEADERS: ReadonlySet<string> = new Set(['aylar', 'months'])
/** First cell of the table's last row: the year total. */
export const STAT_TOTAL_ROW: ReadonlySet<string> = new Set(['yekun', 'total'])
/** Header of the total column. */
export const STAT_TOTAL_COLUMN: ReadonlySet<string> = new Set(['cəmi', 'total'])
/** Channel title affixes dropped for the tab label: "Yazılı müraciətlər üzrə statistika", "Statistics of written appeals". */
export const STAT_CHANNEL_AFFIXES = [/\s+üzrə statistika$/i, /^statistics (?:of|on)\s+/i, /\s+statistics$/i] as const
/** A count cell: digits with optional thousands separators. */
export const STAT_COUNT = /^\d+$/
export const STAT_COUNT_SEPARATORS = /[\s .,]/g
