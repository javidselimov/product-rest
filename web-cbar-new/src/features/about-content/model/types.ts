import type { AttachmentFile } from '@/entities/content'

/**
 * View model of the block-based CMS pages (spec 024 data-model §3, spec 037 data-model, specs 038, 040, 044, 045, 046, 047).
 *
 * Blocks are derived from CMS HTML by the contract (`contracts/cms-markup.md`) and not stored.
 * `*Html` fields are `prepareCmsHtml` fragments rendered only through `CmsContent`; the other
 * fields are plain text.
 */

export type AboutLayoutKind =
  | 'about-main'
  | 'history'
  | 'mission'
  | 'media-requests'
  | 'csr-projects'
  | 'brand-logos'
  | 'ifi-organizations'
  | 'memorandums'
  | 'memberships'
  | 'financial-literacy'
  | 'literacy-platform'
  | 'consumer-text'
  | 'complaint-index'
  | 'appeal-statistics'
  | 'consumer-documents'
  | 'file-archive'
  | 'document-list'
  | 'plain'

/** `width`/`height` come only from the `<img>` attributes (spec 026 research R4: automatic `tall`). */
export type AboutImage = { src: string; alt: string; width?: number; height?: number }

/** Layout of event photos (spec 026 FR-004, `contracts/cms-markup.md`). */
export type PhotoLayout = 'single' | 'note' | 'hero2' | 'tall'

export type TimelineEvent =
  | {
      kind: 'event'
      year: string
      dayMonth: string
      highlighted: boolean
      title: string | null
      html: string
      images: AboutImage[]
      /** The editor's `[foto: …]` marker, otherwise automatic; `null` without images. */
      photoLayout: PhotoLayout | null
      /** A highlighted event, or one with images (except `note`), sits in a framed box on the year card. */
      boxed: boolean
    }
  | { kind: 'loose'; html: string }

/** One timeline year: one point on the axis, one card (spec 026 data-model §2). */
export type HistoryYear = {
  year: string
  /** `year-{yyyy}`: the anchor without JS and the 024 links. */
  anchorId: string
  /** Events of that year and the year-less rows attached to it, in table order. */
  items: TimelineEvent[]
}

export type ValueItem = { title: string; icon: AboutImage | null; html: string }

export type ContactKind = 'email' | 'phone'

/** One row of the contact table (spec 037 data-model). All text is plain. */
export type ContactCard = {
  label: string
  value: string
  href: string | null
  note: string | null
  /** Picks the icon; `null` shows no icon. */
  kind: ContactKind | null
}

export type MediaRequestsBlock = { kind: 'media-requests'; introHtml: string; cards: ContactCard[]; restHtml: string }

/** A CSR project, prepared by the loader (spec 038). The first photo stands in for a missing cover. */
export type CsrProject = {
  id: number
  category: string | null
  cardTitle: string
  summary: string
  title: string
  html: string
  cover: AboutImage | null
  gallery: AboutImage[]
}

export type CsrProjectsBlock = {
  kind: 'csr-projects'
  introHtml: string
  /** Documents linked on their own line in the page text. */
  files: AttachmentFile[]
  projects: CsrProject[]
}

export type LogoBackground = 'light' | 'dark'

/** One row of the logo version table (spec 040 data-model). The text is plain. */
export type LogoVersion = {
  image: AboutImage | null
  title: string
  description: string | null
  /** The white logos need the dark preview. */
  background: LogoBackground
}

/** One file of the page, offered as a download card. `size` is bytes, `0` when unknown. */
export type LogoDownload = { id: number; label: string; size: number; url: string }

export type BrandLogosBlock = {
  kind: 'brand-logos'
  /** The first version, when it has an image. */
  hero: LogoVersion | null
  /** Content before the table (the "Logo versions" heading); all content when the table is not recognised. */
  introHtml: string
  versions: LogoVersion[]
  restHtml: string
  downloads: LogoDownload[]
}

/** One institution of an organization with the date the country joined it, already formatted. */
export type IfiMembership = { date: string; name: string }

/** An international financial institution, prepared by the loader (spec 044). Empty fields are `null`. */
export type IfiOrganization = {
  id: number
  name: string
  logo: AboutImage | null
  memberSince: number | null
  /** Only `http(s)` addresses; `websiteLabel` is the host shown as the link text. */
  websiteUrl: string | null
  websiteLabel: string | null
  mission: string | null
  membershipIntro: string | null
  /** `prepareCmsHtml` output, empty without content. */
  html: string
  memberships: IfiMembership[]
}

export type IfiOrganizationsBlock = {
  kind: 'ifi-organizations'
  /** The page text before the old organization list; all of it while there are no organizations. */
  introHtml: string
  organizations: IfiOrganization[]
}

/** A Memorandum of Understanding: one row of the table (spec 045). All text is plain. */
export type Memorandum = { id: number; organization: string; country: string; year: number }

export type MemorandumsBlock = {
  kind: 'memorandums'
  /** The page text before the legacy bank texts; all of it while there are no memorandums. */
  introHtml: string
  /** Newest year first, the editor's order within a year. */
  rows: Memorandum[]
}

/**
 * One row of the membership table (spec 046), read from the editor's table. `yearLabel` is the cell as
 * typed; `year` is its first four-digit year, the sort key, `null` when there is none.
 */
export type Membership = { organization: string; href: string | null; yearLabel: string; year: number | null }

export type MembershipsBlock = {
  kind: 'memberships'
  /** Page text before the table; all of it when no table is recognised. */
  introHtml: string
  /** In the editor's order; the view sorts them. */
  rows: Membership[]
  /** Page text after the table. */
  restHtml: string
}

/** A photo linked from the page text (`<a data-media-link href="/media/{id}">`, spec 047). The view builds the alt text. */
export type LiteracyImage = { mediaId: number; src: string }

/** One piece of a "Financial literacy" section (spec 047 `contracts/cms-markup.md` §1). Text fields are plain. */
export type LiteracyPart =
  | { kind: 'html'; html: string }
  | { kind: 'subheading'; text: string }
  | { kind: 'quote'; html: string; source: string | null }
  | { kind: 'principles'; items: { title: string; description: string | null }[] }
  | { kind: 'chips'; items: string[] }
  | { kind: 'gallery'; images: LiteracyImage[] }

/** `heading` is `null` for the intro before the first `h2`. */
export type LiteracySection = { heading: string | null; parts: LiteracyPart[] }

/** The closing banner: an editor quote holding a mail link. `addressHtml` keeps that link. */
export type LiteracyCta = { eyebrow: string; title: string; addressHtml: string; email: string }

export type FinancialLiteracyBlock = {
  kind: 'financial-literacy'
  sections: LiteracySection[]
  cta: LiteracyCta | null
  /** Page files shown by the gallery; the view leaves them out of the file list. */
  usedMediaIds: number[]
}

/** The three platform pages (spec 047 `contracts/cms-markup.md` §2). */
export type LiteracyPlatformBlock = {
  kind: 'literacy-platform'
  introHtml: string
  /** The editor's quote, shown as the note box (HTML, links kept). */
  noteHtml: string | null
  photos: LiteracyImage[]
  sections: { heading: string; html: string }[]
  /** The closing "go to the platform" link; only `http(s)`. */
  link: { href: string; label: string } | null
  usedMediaIds: number[]
}

/*
 * Consumer and investor rights section (spec 050 data-model §2). Derived from the editor's accordions and tables.
 */

/** A file linked from the page text (`<a data-media-link href="/media/{id}">`), resolved against the page's assets. */
/** `sizeBytes` comes from the page's assets; missing when the link's media is not among them (spec 054). */
export type ArchiveFile = { id: number; title: string; url: string; mimeType: string | null; sizeBytes?: number }

/** `month` is 1–12, `null` when the label is not a month name; `label` is the editor's text. */
export type ArchiveMonth = { label: string; month: number | null; file: ArchiveFile }

/** Months newest first. */
export type ArchiveYear = { year: number; months: ArchiveMonth[] }

/** Years newest first; `latest` is the newest file of the newest year. */
export type YearArchive = { years: ArchiveYear[]; latest: { year: number; month: ArchiveMonth } | null }

/** A monthly report's file (spec 052): the API's, without a title — the title is the series name and the period. */
export type ReportFile = Omit<ArchiveFile, 'title'>

/** One month of a series; `month` is 1–12. */
export type MonthlyReport = { year: number; month: number; file: ReportFile }

/**
 * A monthly report series from the API (spec 052), mapped by the loader: the bank or the insurance complaint index, or
 * the infographics. A report covers `periodMonths` months ending with its own month.
 */
export type ReportSeries = { key: string; name: string; periodMonths: number; reports: MonthlyReport[] }

export type ConsumerTextPart =
  | { type: 'html'; html: string }
  | { type: 'heading'; text: string }
  | { type: 'numbered'; itemsHtml: string[] }

/** The section root and the administrative officials page: a lead, then headings, numbered lists and text. */
export type ConsumerTextBlock = { kind: 'consumer-text'; leadHtml: string; parts: ConsumerTextPart[] }

export type MethodologyPart =
  | { type: 'html'; html: string }
  | { type: 'formula'; left: string; numerator: string; denominator: string }
  | { type: 'note'; html: string }

export type Methodology = { title: string; parts: MethodologyPart[] }

export type ComplaintTabKey = 'bank' | 'insurance'

/** One tab: the archive of one page, the text around it and its methodology (`null` without its `h2`). */
export type ComplaintTab = {
  key: ComplaintTabKey
  archive: YearArchive
  introHtml: string
  restHtml: string
  methodology: Methodology | null
}

export type ComplaintIndexBlock = {
  kind: 'complaint-index'
  /** The bank tab, then the insurance tab when the companion page is there. */
  tabs: ComplaintTab[]
}

/** A table row of the months × sectors form; `cells` follow `head` after the first column. */
export type StatRow = { label: string; month: number | null; cells: (number | null)[] }

export type StatTable =
  | {
      form: 'months'
      /** The header row as typed, the "Months" cell first. */
      head: string[]
      rows: StatRow[]
      totalRow: StatRow | null
      /** Index into `cells` of the "Total" column, `null` without one. */
      totalIndex: number | null
    }
  | { form: 'generic'; head: string[]; rows: string[][] }

export type StatChannel = { index: number; label: string; years: { year: number; table: StatTable }[] }

export type StatSummaryCard = { channel: string; total: number; sectors: { sector: string; value: number }[] }

/** The latest month every months × sectors channel has filled (spec 050 clarify Q3). */
export type StatSummary = { year: number; monthLabel: string; cards: StatSummaryCard[] }

export type AppealStatisticsBlock = {
  kind: 'appeal-statistics'
  introHtml: string
  summary: StatSummary | null
  channels: StatChannel[]
  /** Page text after the first channel that is not a channel. */
  restHtml: string
  /** The infographics companion page's archive; `null` without it (it has no en page). */
  infographics: YearArchive | null
}

export type DocumentPart = { type: 'html'; html: string } | { type: 'file'; file: ArchiveFile }

export type DocumentSection = { title: string; parts: DocumentPart[] }

export type ConsumerDocumentsBlock = {
  kind: 'consumer-documents'
  introHtml: string
  sections: DocumentSection[]
  restHtml: string
}

/**
 * One accordion of a publications page (spec 054 `contracts/publication-markup.md`): a year (`year` set) or another
 * label; an empty label is shown as "Digər". `key` is the value of the `year` search parameter that picks it.
 */
export type ArchiveGroup = { key: string; label: string; year: number | null; parts: DocumentPart[] }

/** Year archive of the publications section: text before the accordions, the groups (years newest first), text after. */
export type FileArchiveBlock = { kind: 'file-archive'; before: DocumentPart[]; groups: ArchiveGroup[]; after: DocumentPart[] }

/** Single-document page of the publications section: the intro text and the document cards. */
export type DocumentListBlock = { kind: 'document-list'; introHtml: string; files: ArchiveFile[] }

export type AboutBlock =
  | { kind: 'html'; html: string }
  | { kind: 'date-cards'; cards: { date: string; html: string }[] }
  | { kind: 'highlight'; title: string | null; html: string }
  | { kind: 'accordion-group'; html: string }
  | { kind: 'history-hero'; html: string }
  | { kind: 'timeline'; years: HistoryYear[] }
  | { kind: 'mission'; html: string }
  | { kind: 'values'; items: ValueItem[] }
  | MediaRequestsBlock
  | CsrProjectsBlock
  | BrandLogosBlock
  | IfiOrganizationsBlock
  | MemorandumsBlock
  | MembershipsBlock
  | FinancialLiteracyBlock
  | LiteracyPlatformBlock
  | ConsumerTextBlock
  | ComplaintIndexBlock
  | AppealStatisticsBlock
  | ConsumerDocumentsBlock
  | FileArchiveBlock
  | DocumentListBlock
