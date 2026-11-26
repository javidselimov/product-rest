/** Release schedule constants (spec 032, spec 039). */
import type { Locale } from '@/shared/i18n'

/** `timingMode` as the API sends it. */
export const TIMING_MODE = {
  TEXT: 'text',
  LINK: 'link',
  DECISIONS: 'decisions',
} as const

/**
 * Slugs of CMS page 130 (legacy page 72), whose title and intro head the page. Slugs are unique
 * per locale, so each language has its own.
 */
export const RELEASE_SCHEDULE_PAGE_SLUG: Record<Locale, string> = {
  az: 'melumatlarin-yayimlanmasi-qrafiki',
  en: 'information-disclosure-schedule',
}

/** Event type of a decision (spec 034); "All decisions" opens the events list filtered by it. */
export const DECISION_EVENT_TYPE = 1

export const RELEASE_SCHEDULE_CACHE = { keyPrefix: 'release-schedule', tag: 'release-schedule' } as const
