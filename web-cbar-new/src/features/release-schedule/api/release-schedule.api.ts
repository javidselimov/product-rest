/** The information disclosure schedule (spec 039). Cached for 10 s (spec 003 FR-015). */
import 'server-only'

import { cachedJson } from '@/server/cached'
import type { Locale } from '@/shared/i18n'

import { RELEASE_SCHEDULE_CACHE } from '../model/constants'
import { releaseScheduleSchema, type ReleaseSchedule } from '../model/schemas'

const fetchSchedule = cachedJson(releaseScheduleSchema, RELEASE_SCHEDULE_CACHE)

export async function getReleaseSchedule(locale: Locale): Promise<ReleaseSchedule> {
  return fetchSchedule(`/api/v1/release-schedule?locale=${locale}`)
}
