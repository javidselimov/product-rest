import type { Locale } from '@/shared/i18n'

import type { PressReleaseType } from './schemas'

/**
 * Typed list address. CMS menu items (`navUrl`) use exactly this form, which is what marks the
 * menu item of the type current — on the list and on a detail page alike (spec 029 R1).
 */
export const pressReleasesListHref = (locale: Locale, type: PressReleaseType) => `/${locale}/press-releases?type=${type}`
