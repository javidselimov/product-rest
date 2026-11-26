import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'

import { excerpt, stripHtml } from '@/entities/content'
import { isFaqSlug, isFincertSlug, isWorkingPapersSlug, WORKING_PAPERS_SLUG } from '@/entities/page-node'
import { EXCERPT_LENGTH } from '@/shared/constants/text'
import type { Locale } from '@/shared/i18n'
import { safeDecodeURIComponent } from '@/shared/lib/uri'
import { CmsPageView } from '@/views/cms-page'
import { findLocaleCounterpart, loadCmsPage } from '@/views/cms-page/loader'
import { FaqView } from '@/views/faq'
import { loadFaqPage } from '@/views/faq/loader'
import { FincertView } from '@/views/fincert'
import { loadFincertPage } from '@/views/fincert/loader'
import { WorkingPaperView } from '@/views/working-paper'
import { loadWorkingPaperPage, paperKeyOf, resolveWorkingPaperRoute } from '@/views/working-paper/loader'
import { WorkingPapersView } from '@/views/working-papers'
import { loadWorkingPapersPage } from '@/views/working-papers/loader'

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ locale: Locale; slug: string[] }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const alternates = { languages: { az: `/az/${slug.join('/')}`, en: `/en/${slug.join('/')}` } }
  // FinCERT (spec 053): the description is the start of the mission; without FinCERT data the page text, as for any page.
  const last = safeDecodeURIComponent(slug.at(-1) ?? '')
  if (isFincertSlug(last)) {
    const fincert = await loadFincertPage(locale, last)
    if (fincert) return { title: fincert.view.title, description: fincert.description ?? undefined, alternates }
  }
  // A working paper (spec 054 FR-010): the title and the start of the abstract; both locales share the key.
  const key = paperKeyOf(slug)
  if (key) {
    const paper = await loadWorkingPaperPage(locale, key)
    if (!paper) return {}
    return {
      title: paper.paper.title,
      description: paper.description,
      alternates: { languages: { az: `/az/${WORKING_PAPERS_SLUG.az}/${key}`, en: `/en/${WORKING_PAPERS_SLUG.en}/${key}` } },
    }
  }
  const data = await loadCmsPage(locale, slug)
  if (!data) return {}
  const description = excerpt(stripHtml(data.html), EXCERPT_LENGTH)
  return {
    title: data.title,
    description: description || undefined,
    alternates,
  }
}

export default async function CmsPage({ params, searchParams }: Props) {
  const { locale, slug } = await params
  const query = await searchParams
  // The FAQ page (spec 051) shows the FAQ content type; without it (no FAQ, API down) it falls through to its CMS text.
  const last = safeDecodeURIComponent(slug.at(-1) ?? '')
  if (isFaqSlug(last)) {
    const faq = await loadFaqPage(locale, last, query)
    if (faq) return <FaqView data={faq} />
  }
  // The FinCERT page (spec 053) shows the FinCERT content type; without it (no data, API down) its CMS text.
  if (isFincertSlug(last)) {
    const fincert = await loadFincertPage(locale, last)
    if (fincert) return <FincertView data={fincert} />
  }
  // Working papers (spec 054): the list on the CMS page's address, a paper under it. Without papers (none in the locale,
  // API down) the list page falls through to its CMS text.
  const paperRoute = await resolveWorkingPaperRoute(locale, slug)
  if (paperRoute) {
    if (paperRoute.kind === 'redirect') redirect(paperRoute.href)
    if (paperRoute.kind === 'not-found') notFound()
    return <WorkingPaperView data={paperRoute.data} />
  }
  if (isWorkingPapersSlug(last)) {
    const papers = await loadWorkingPapersPage(locale, last, query)
    if (papers) return <WorkingPapersView data={papers} />
  }
  const data = await loadCmsPage(locale, slug)
  if (!data) {
    // From the language switcher: `/en/tarix` → the page's en address (`/en/history`), with the query.
    const counterpart = await findLocaleCounterpart(locale, slug, query)
    if (counterpart) redirect(counterpart)
    notFound()
  }
  // Only the memorandum table reads the query (spec 045); the load above is the same for every order.
  return <CmsPageView data={data} query={query} />
}
