/** FAQ panel constants (spec 051). */

/** The section's root route; the topics and videos tabs hang under it. */
export const FAQ_PATH = '/faq'
export const FAQ_TOPICS_PATH = '/faq/topics'
export const FAQ_VIDEOS_PATH = '/faq/videos'

/** The API's page-size cap (`PagingQuery.MaxPageSize`): one request lists every topic, a topic's questions, every video. */
export const FAQ_FULL_LIST_SIZE = 100

/** Search param of `/faq/new` that preselects the topic ("Yeni sual" from a topic). */
export const TOPIC_ID_PARAM = 'topicId'

/** The statuses the FAQ forms name in code (the API refuses `scheduled`). */
export const CONTENT_STATUS = { PUBLISHED: 'published', DRAFT: 'draft' } as const

/** YouTube's thumbnail of a video (`mqdefault` is 320 × 180, 16:9). */
export const youtubeThumbUrl = (youtubeId: string) => `https://i.ytimg.com/vi/${youtubeId}/mqdefault.jpg`
/** The video on YouTube. */
export const youtubeWatchUrl = (youtubeId: string) => `https://www.youtube.com/watch?v=${youtubeId}`

/** Address of a topic on the public site (`?topic=<slug>`, spec 051). */
export const SITE_FAQ_PATH = '/az/sual-cavab'

/** Locale whose missing translation the list filters on. */
export const MISSING_LOCALE_EN = 'en'

/** Preview thumbnail in the videos list: 16:9. */
export const PREVIEW_THUMB = { WIDTH_PX: 96, HEIGHT_PX: 54 } as const
/** Preview on the video form: YouTube's `mqdefault` size. */
export const PREVIEW_LARGE = { WIDTH_PX: 320, HEIGHT_PX: 180 } as const
