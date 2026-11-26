/** Rich-text editor constants (spec 032). */

/** Generic iframe parse priority — below the YouTube extension so its embeds keep their node. */
export const EMBED_FRAME_PRIORITY = 40

/** Default size of a YouTube embed (TinyMCE parity). */
export const YOUTUBE_EMBED = { WIDTH: 640, HEIGHT: 360 } as const

/** Heading levels offered by the toolbar. */
export const HEADING_LEVEL = { H2: 2, H3: 3 } as const

/** Size of a table inserted from the toolbar. */
export const DEFAULT_TABLE = { ROWS: 3, COLS: 3 } as const
