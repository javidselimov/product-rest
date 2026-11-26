/**
 * Press release lists (spec 029, spec 032, spec 033).
 */
import { PRESS_RELEASE_TYPE } from '@/features/press-releases/model/constants'
import type { PressReleaseType } from '@/features/press-releases/model/schemas'

/** 3 × 3 card grid per page (Figma). */
export const NEWS_PAGE_SIZE = 9
/** A list URL without `?type=` is the news list. */
export const DEFAULT_PRESS_RELEASE_TYPE: PressReleaseType = PRESS_RELEASE_TYPE.NEWS
/** The site's own list label, used when the CMS tree has no item for the type. */
export const PRESS_RELEASE_LABEL_KEYS = {
  [PRESS_RELEASE_TYPE.NEWS]: 'newsList.news',
  [PRESS_RELEASE_TYPE.ANNOUNCEMENT]: 'newsList.announcements',
  [PRESS_RELEASE_TYPE.INTERVIEW]: 'newsList.interviews',
} as const satisfies Record<PressReleaseType, string>
