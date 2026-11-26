/**
 * `AboutBlock[]` → Figma components (spec 024 FR-006). 32 between blocks (Figma `content` gap).
 *
 * HTML fragments render only through `CmsContent` (spec 002 D2), this file does not use
 * `dangerouslySetInnerHTML`.
 *
 * Each block below the first screen reveals on scroll as a whole (spec 049); blocks do not reveal
 * their own cards, so reveals never nest.
 */
import type { YearSort } from '@/features/about-content/model/year-sort'
import type { AboutBlock } from '@/features/about-content/model/types'
import type { Locale } from '@/shared/i18n'
import { Reveal } from '@/shared/ui/reveal'
import { CmsContent } from '@/widgets/cms-content/cms-content'

import { AppealStatistics } from './appeal-statistics'
import { BrandLogos } from './brand-logos'
import { ComplaintIndex } from './complaint-index'
import { ConsumerDocuments } from './consumer-documents'
import { ConsumerText } from './consumer-text'
import { CsrProjects } from './csr-projects'
import { DateCards } from './date-cards'
import { DocumentList } from './document-list'
import { FileArchive } from './file-archive'
import { FinancialLiteracy } from './financial-literacy'
import { HighlightBox } from './highlight-box'
import { HistoryHero } from './history-hero'
import { HistoryTimeline } from './history-timeline'
import { IfiOrganizations } from './ifi-organizations'
import { LiteracyPlatform } from './literacy-platform'
import { MediaRequests } from './media-requests'
import { Memberships } from './memberships'
import { Memorandums } from './memorandums'
import { MissionBanner } from './mission-banner'
import { ValueRows } from './value-row'

type Query = Record<string, string | string[] | undefined>

type BlockProps = Readonly<{ block: AboutBlock; locale: Locale; yearSort?: YearSort; title: string; query?: Query }>

function Block({ block, locale, yearSort, title, query }: BlockProps) {
  switch (block.kind) {
    case 'history-hero':
      return <HistoryHero html={block.html} />
    case 'timeline':
      // Hero → timeline: mobile 32, tablet 48, desktop 40 (spec 026 ui-contract §2 "Konteyner").
      return (
        <div className="tab:mt-3 desk:mt-1">
          <HistoryTimeline block={block} locale={locale} />
        </div>
      )
    case 'html':
    case 'accordion-group':
      return <CmsContent html={block.html} variant="about" />
    case 'date-cards':
      return <DateCards cards={block.cards} />
    case 'highlight':
      return <HighlightBox title={block.title} html={block.html} />
    case 'mission':
      return <MissionBanner html={block.html} />
    case 'values':
      return <ValueRows items={block.items} />
    case 'media-requests':
      return <MediaRequests block={block} />
    case 'csr-projects':
      return <CsrProjects block={block} locale={locale} />
    case 'brand-logos':
      return <BrandLogos block={block} locale={locale} />
    case 'ifi-organizations':
      return <IfiOrganizations block={block} locale={locale} />
    case 'memorandums':
      return <Memorandums block={block} locale={locale} sort={yearSort} />
    case 'memberships':
      return <Memberships block={block} locale={locale} sort={yearSort} />
    case 'financial-literacy':
      return <FinancialLiteracy block={block} locale={locale} title={title} />
    case 'literacy-platform':
      return <LiteracyPlatform block={block} locale={locale} title={title} />
    case 'consumer-text':
      return <ConsumerText block={block} />
    case 'complaint-index':
      return <ComplaintIndex block={block} locale={locale} query={query} />
    case 'appeal-statistics':
      return <AppealStatistics block={block} locale={locale} query={query} />
    case 'consumer-documents':
      return <ConsumerDocuments block={block} locale={locale} />
    case 'file-archive':
      return <FileArchive block={block} locale={locale} query={query} />
    case 'document-list':
      return <DocumentList block={block} locale={locale} />
  }
}

/**
 * `yearSort` is the page's `sort` search parameter; only the memorandum and membership tables read it (specs 045, 046).
 * `title` is the page title, used for the alt text of the financial literacy photos (spec 047).
 * `query` is the page's search parameters: the consumer rights tabs, channel and year (spec 050).
 */
type AboutBlocksProps = Readonly<{ blocks: AboutBlock[]; locale: Locale; yearSort?: YearSort; title?: string; query?: Query }>

export function AboutBlocks({ blocks, locale, yearSort, title = '', query }: AboutBlocksProps) {
  if (blocks.length === 0) return null
  return (
    <div data-slot="about-blocks" className="flex flex-col gap-8 tab:gap-9">
      {blocks.map((block, index) => (
        <Reveal key={`${index}-${block.kind}`}>
          <Block block={block} locale={locale} yearSort={yearSort} title={title} query={query} />
        </Reveal>
      ))}
    </div>
  )
}
