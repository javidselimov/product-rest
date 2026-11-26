/**
 * FAQ page (spec 051 US1–US4). The CMS page (`FAQ_SLUG`) gives the title and the address; topics, questions and videos
 * come from the FAQ content type in one response, filtered here by `q` and `topic` (research R4, R5). `null` means the
 * route shows the CMS page as before: the page does not exist in the locale, or the FAQ is empty or unreachable — the
 * legacy text then shows whole, so the questions are never missing (spec Edge Cases).
 */
import 'server-only'

import { getFaq } from '@/features/faq/api/faq.api'
import { buildFaqView, type FaqView } from '@/features/faq/model/select'
import { youtubeId, youtubeThumbnail } from '@/features/media/model/youtube'
import { getPage } from '@/features/pages/api/pages.api'
import { absolutePageUrl } from '@/server/page-url'
import { QUERY_PARAM } from '@/shared/constants/query-params'
import type { Locale } from '@/shared/i18n'
import { getT } from '@/shared/i18n/server'
import { buildHref, queryParam, type RawSearchParams } from '@/shared/lib/search-params'
import type { FaqVideoCard } from '@/widgets/faq'
import type { SectionShellData } from '@/widgets/section-shell'

export type FaqViewData = {
  locale: Locale
  title: string
  /** The page's own address, the form's action. */
  basePath: string
  view: FaqView
  videos: FaqVideoCard[]
  shell: SectionShellData
}

export async function loadFaqPage(locale: Locale, slug: string, searchParams: RawSearchParams): Promise<FaqViewData | null> {
  const q = queryParam.parse(searchParams[QUERY_PARAM.QUERY])
  const topic = queryParam.parse(searchParams[QUERY_PARAM.TOPIC])

  const [page, faq] = await Promise.allSettled([getPage(locale, slug), getFaq(locale)])
  if (page.status !== 'fulfilled' || !page.value || faq.status !== 'fulfilled') return null

  const view = buildFaqView(faq.value, { q, topic })
  if (!view) return null

  const basePath = `/${locale}/${page.value.slug}`
  const title = page.value.title
  const videos = faq.value.videos.map((video): FaqVideoCard => {
    const id = youtubeId(video.youtubeUrl)
    return {
      id: video.id,
      title: video.title,
      href: id ? `https://www.youtube.com/watch?v=${id}` : video.youtubeUrl,
      thumbnail: id ? youtubeThumbnail(id) : null,
    }
  })

  return {
    locale,
    title,
    basePath,
    view,
    videos,
    shell: {
      locale,
      // "Ana səhifə › Sual-cavab": the FAQ is a root page with no section menu (Figma A and B).
      crumbs: [
        { label: getT(locale, 'section')('breadcrumb.home'), href: `/${locale}` },
        { label: title, href: null },
      ],
      nav: [],
      // Shared links keep the search and the topic, so the recipient sees the same questions.
      share: { pageUrl: await absolutePageUrl(buildHref(basePath, { q: view.query, topic: view.kind === 'topic' ? view.topic.slug : '' })), title },
    },
  }
}
