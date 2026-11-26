/**
 * FinCERT page (spec 053 US1, US5). The CMS page (`FINCERT_SLUG`) gives the title and the address; the blocks come from
 * the FinCERT content type in one response. `null` means the route shows the CMS page as before: the page does not
 * exist in the locale, the FinCERT API failed, or every section is empty — the legacy text then shows whole (FR-016).
 * Wrapped in `cache()` so `generateMetadata` and the page share one pair of requests.
 */
import 'server-only'

import { cache } from 'react'

import { excerpt } from '@/entities/content'
import { getFincert } from '@/features/fincert/api/fincert.api'
import { buildFincertView, type FincertPageModel } from '@/features/fincert/model/view'
import { getPage } from '@/features/pages/api/pages.api'
import { absolutePageUrl } from '@/server/page-url'
import { EXCERPT_LENGTH } from '@/shared/constants/text'
import type { Locale } from '@/shared/i18n'
import { getT } from '@/shared/i18n/server'
import { logger } from '@/shared/lib/logger'
import type { SectionShellData } from '@/widgets/section-shell'

export type FincertViewData = {
  locale: Locale
  view: FincertPageModel
  /** Meta description: the start of the mission, `null` without one. */
  description: string | null
  shell: SectionShellData
}

export const loadFincertPage = cache(async (locale: Locale, slug: string): Promise<FincertViewData | null> => {
  const [page, fincert] = await Promise.allSettled([getPage(locale, slug), getFincert(locale)])
  if (fincert.status === 'rejected') {
    // The CMS text is the intended fallback (FR-016); the warning keeps a broken endpoint from going unnoticed.
    const { reason } = fincert
    logger.warn('FinCERT API failed, showing the CMS page text', { locale, error: reason instanceof Error ? reason.message : String(reason) })
  }
  if (page.status !== 'fulfilled' || !page.value || fincert.status !== 'fulfilled') return null

  const view = buildFincertView(fincert.value, page.value)
  if (!view) return null

  const title = view.title
  return {
    locale,
    view,
    description: view.mission ? excerpt(view.mission.join(' '), EXCERPT_LENGTH) : null,
    shell: {
      locale,
      // "Ana səhifə › FinCERT": FinCERT is a root page with no section menu (Figma).
      crumbs: [
        { label: getT(locale, 'section')('breadcrumb.home'), href: `/${locale}` },
        { label: title, href: null },
      ],
      nav: [],
      share: { pageUrl: await absolutePageUrl(`/${locale}/${page.value.slug}`), title },
    },
  }
})
