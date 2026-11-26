/**
 * CMS page: side tree + title + content or child page cards + attachments.
 *
 * Pages of template sections (spec 024 "About us", spec 028 "Media", spec 043 "International
 * cooperation") render with `SectionShell`, the other sections with the spec 002 look. About's Figma
 * blocks are About only; a Media or cooperation page is ordinary content in the same template, unless
 * it has a layout of its own (spec 037). FAQ topics linked to the page follow its text as link cards, before the
 * files (spec 051 US5).
 */
import { Card, CardContent } from '@cbar/lib-react-ui-kit/card'
import { ChevronRightIcon } from '@cbar/lib-react-ui-kit/icons'
import Link from 'next/link'

import { parseYearSort, type YearSort } from '@/features/about-content/model/year-sort'
import { QUERY_PARAM } from '@/shared/constants/query-params'
import { AboutBlocks } from '@/widgets/about-blocks'
import { Attachments } from '@/widgets/attachments/attachments'
import { CmsContent } from '@/widgets/cms-content/cms-content'
import { FaqTopicLinks } from '@/widgets/faq'
import { SectionShell } from '@/widgets/section-shell'
import { SectionSidebar } from '@/widgets/section-sidebar/section-sidebar'

import type { CmsPageViewData, ShellPageData } from './loader'

type ChildPage = CmsPageViewData['childPages'][number]

function ChildPageCards({ pages }: Readonly<{ pages: ChildPage[] }>) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {pages.map((child) => (
        <li key={child.key}>
          <Card className="hover:border-primary h-full transition-colors">
            <CardContent className="p-0">
              <Link href={child.href} className="text-foreground flex items-center justify-between gap-3 p-5 text-base font-medium">
                <span>{child.title}</span>
                <ChevronRightIcon className="text-muted-foreground size-4 shrink-0" aria-hidden="true" />
              </Link>
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  )
}

type Query = Record<string, string | string[] | undefined>

type ShellPageProps = Readonly<{ data: CmsPageViewData; page: ShellPageData; yearSort?: YearSort; query?: Query }>

/**
 * Blocks that show the page's files themselves, so there is no file list under them: CSR (spec 038), logo (spec 040)
 * and the consumer rights archives and documents (spec 050). The consumer pages' assets also hold the other language's
 * files, which a list would show.
 */
const BLOCKS_WITH_FILES: ReadonlySet<ShellPageData['blocks'][number]['kind']> = new Set([
  'csr-projects',
  'brand-logos',
  'complaint-index',
  'appeal-statistics',
  'consumer-documents',
  // Publications (spec 054 FR-019): the cards come from the text's links, so each language shows only its own files.
  'file-archive',
  'document-list',
])

/** Page files a block already shows: the financial literacy photos (spec 047 research R5). */
function shownMediaIds(blocks: ShellPageData['blocks']): Set<number> {
  return new Set(blocks.flatMap((block) => ('usedMediaIds' in block ? block.usedMediaIds : [])))
}

function ShellPage({ data, page, yearSort, query }: ShellPageProps) {
  const shown = shownMediaIds(page.blocks)
  return (
    <SectionShell shell={page.shell} title={data.title}>
      {data.childPages.length > 0 ? (
        <ChildPageCards pages={data.childPages} />
      ) : page.section === 'about' || page.layout !== 'plain' ? (
        <AboutBlocks blocks={page.blocks} locale={data.locale} yearSort={yearSort} title={data.title} query={query} />
      ) : (
        <CmsContent html={data.html} variant="about" />
      )}
      <FaqTopicLinks topics={data.faqTopics} locale={data.locale} />
      {/*
        Some blocks place the page's files themselves (`BLOCKS_WITH_FILES`); the financial literacy pages show their
        photos in the blocks, so only the other files are listed (spec 047).
      */}
      {page.blocks.some((block) => BLOCKS_WITH_FILES.has(block.kind)) ? null : (
        <Attachments locale={data.locale} files={data.attachments.filter((file) => !shown.has(file.id))} />
      )}
    </SectionShell>
  )
}

/**
 * `query` is the page's search parameters: the memorandum and membership pages read its `sort` (specs 045, 046), the
 * consumer rights pages its `tab`, `channel` and `year` (spec 050); other pages ignore it.
 */
type CmsPageViewProps = Readonly<{ data: CmsPageViewData; query?: Record<string, string | string[] | undefined> }>

export function CmsPageView({ data, query }: CmsPageViewProps) {
  const { locale } = data
  const yearSort = parseYearSort(query?.[QUERY_PARAM.SORT])
  if (data.shellPage) return <ShellPage data={data} page={data.shellPage} yearSort={yearSort} query={query} />

  return (
    <div data-slot="cms-page" className="flex items-start gap-8">
      {data.section ? <SectionSidebar section={data.section} locale={locale} currentSlug={data.slug} /> : null}

      <article className="min-w-0 flex-1">
        <h1 className="bg-primary text-primary-foreground rounded-md px-5 py-3 text-xl font-semibold">{data.title}</h1>

        <div className="py-5 lg:pl-6">
          {data.childPages.length > 0 ? <ChildPageCards pages={data.childPages} /> : <CmsContent html={data.html} />}
          <FaqTopicLinks topics={data.faqTopics} locale={locale} />

          <Attachments locale={locale} files={data.attachments} />
        </div>
      </article>
    </div>
  )
}
