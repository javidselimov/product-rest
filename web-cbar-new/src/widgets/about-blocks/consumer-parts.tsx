/**
 * Shared parts of the consumer rights pages (spec 050 `contracts/ui-contract.md` §3, §4): the file type pill, the document
 * card, the "latest" card, the year archive and the link tabs.
 *
 * Files open in a new tab, like the About file rows. Tabs are links: each choice is a server render of the page with
 * its search parameter (research R5), so they work without JS and a shared link keeps the choice.
 */
import { CaretDownIcon } from '@cbar/lib-react-ui-kit/icons'
import Link from 'next/link'

import type { ArchiveFile, YearArchive } from '@/features/about-content/model/types'
import type { Locale } from '@/shared/i18n'
import { getT } from '@/shared/i18n/server'

import { DocumentCard, FilePill } from './document-card'

type FileProps = Readonly<{ file: ArchiveFile; locale: Locale }>

/** "Latest" card (`Complaint / Latest` 2463:5419): the newest file of the archive. */
export function LatestCard({ file, locale }: FileProps) {
  const t = getT(locale, 'about')
  return (
    <a
      href={file.url}
      target="_blank"
      rel="noopener noreferrer"
      data-slot="consumer-latest"
      className="bg-site-consumer-soft hover:bg-site-surface-muted focus-visible:outline-ring flex items-center gap-5 rounded-xs p-6 transition-colors outline-none focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="text-site-consumer-muted text-xs leading-[18px] font-semibold tracking-[0.05em] uppercase">{t('consumer.latest')}</span>
        <span className="text-foreground text-lg leading-[26px] font-semibold">{file.title}</span>
      </span>
      <FilePill file={file} locale={locale} />
    </a>
  )
}

/**
 * Year archive (`Complaint / Year` 2452:145191): one native `<details>` per year, all closed on arrival, months as
 * document cards. `data-accordion` reuses the print rule, so closed years print open.
 */
export function YearArchiveList({ archive, locale }: Readonly<{ archive: YearArchive; locale: Locale }>) {
  return (
    <div data-slot="consumer-archive">
      {archive.years.map((year) => (
        <details key={year.year} data-accordion="" className="group border-site-divider border-b">
          <summary className="focus-visible:outline-ring flex cursor-pointer list-none items-center gap-4 py-[15px] tab:py-5 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 [&::-webkit-details-marker]:hidden">
            <span className="text-foreground flex-1 text-xl leading-7 font-semibold">{year.year}</span>
            <CaretDownIcon aria-hidden="true" className="text-foreground size-5 shrink-0 transition-transform group-open:rotate-180" />
          </summary>
          <div data-type="details-content" className="pb-6">
            <ul className="grid grid-cols-1 gap-4 tab:grid-cols-2 desk:grid-cols-4">
              {year.months.map((month) => (
                <li key={`${month.label}-${month.file.id}`}>
                  <DocumentCard file={month.file} locale={locale} label={`${month.label} ${year.year}`} variant="consumer" />
                </li>
              ))}
            </ul>
          </div>
        </details>
      ))}
    </div>
  )
}

export type LinkTab = { key: string; label: string; href: string; current: boolean }

const TAB_BASE = 'focus-visible:outline-ring -mb-px outline-none focus-visible:outline-2'
/** Underline tab: 24 text + 14 + 2 border = 40, the row's 1px rule makes the 41 of `Complaint / Index`. */
const TAB_UNDERLINE = `${TAB_BASE} block border-b-2 pb-[14px] text-lg leading-6 font-semibold`
const TAB_BOX = `${TAB_BASE} flex h-11 items-center rounded-t-xs border px-4 text-base leading-6 font-medium`
const TAB_IDLE = 'text-muted-foreground hover:text-foreground border-transparent'

function tabClass(variant: 'underline' | 'box', current: boolean): string {
  if (variant === 'underline') return `${TAB_UNDERLINE} ${current ? 'border-site-accent-strong text-foreground' : TAB_IDLE}`
  return `${TAB_BOX} ${current ? 'border-site-divider bg-background text-foreground border-b-background' : TAB_IDLE}`
}

/**
 * Tabs as links (research R5). `underline`: the complaint index tabs (`Complaint / Index`); `box`: the statistics
 * channels (`Stat / Channel`, top corners rounded). The row scrolls on its own on a narrow screen.
 */
export function LinkTabs({ tabs, label, variant }: Readonly<{ tabs: LinkTab[]; label: string; variant: 'underline' | 'box' }>) {
  return (
    <nav aria-label={label} className="border-site-divider overflow-x-auto border-b [scrollbar-width:none]">
      <ul className={variant === 'underline' ? 'flex gap-8' : 'flex gap-6'}>
        {tabs.map((tab) => (
          <li key={tab.key} className="shrink-0">
            <Link
              href={tab.href}
              scroll={false}
              aria-current={tab.current ? 'page' : undefined}
              className={tabClass(variant, tab.current)}
            >
              {tab.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

/** The page's own address with these search parameters (relative, so it keeps the current path). */
export function queryHref(params: Record<string, string>): string {
  return `?${new URLSearchParams(params).toString()}`
}
