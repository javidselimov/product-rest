/**
 * The document card and its file pill, shared by every page that lists files as cards: the consumer rights pages
 * (spec 050 `Complaint / Document` 2463:4855) and the publications section (spec 054 ui-contract §6) — year archives,
 * single-document pages, working papers.
 *
 * The whole card is one link that opens the file in a new tab. The size line shows only for a known, positive size:
 * files imported from the legacy site carried made-up sizes until the admin API corrected them (spec 054 FR-032).
 */
import { DownloadIcon } from '@cbar/lib-react-ui-kit/icons'
import { cn } from '@cbar/lib-react-ui-kit/lib'

import { fileExtension, formatFileSize } from '@/entities/content'
import type { ArchiveFile } from '@/features/about-content/model/types'
import type { Locale } from '@/shared/i18n'
import { getT } from '@/shared/i18n/server'

import { DOCUMENT_CARD_VARIANTS, type DocumentCardVariant } from './constants'

type FileProps = Readonly<{ file: ArchiveFile; locale: Locale }>

/**
 * File pill (Figma `Fayl · PDF` 3534:344414, 83 × 36): the type badge and the download icon. The type comes from the
 * asset, the generic "File" without one.
 */
export function FilePill({ file, locale }: FileProps) {
  const t = getT(locale, 'about')
  const type = fileExtension(file.mimeType, file.title)?.toUpperCase() ?? t('document.file')
  return (
    <span aria-hidden="true" className="border-site-file-border bg-background inline-flex shrink-0 items-center gap-2.5 rounded-xs border px-3 py-2">
      <span className="bg-site-file-badge text-site-file-on-badge rounded-[3px] px-1.5 py-0.5 text-[11px] leading-[14px] font-semibold">{type}</span>
      <DownloadIcon className="text-primary size-3.5" />
    </span>
  )
}

type DocumentCardProps = FileProps &
  Readonly<{
    /** A visible label instead of the file title (a month of an archive); the title stays for screen readers. */
    label?: string
    /** The page's Figma card: box and size line together (`DOCUMENT_CARD_VARIANTS`). */
    variant?: DocumentCardVariant
  }>

export function DocumentCard({ file, locale, label, variant = 'publications' }: DocumentCardProps) {
  const t = getT(locale, 'about')
  const { box, showSize } = DOCUMENT_CARD_VARIANTS[variant]
  const size = showSize && file.sizeBytes && file.sizeBytes > 0 ? formatFileSize(file.sizeBytes, locale) : ''

  return (
    <a
      href={file.url}
      target="_blank"
      rel="noopener noreferrer"
      data-slot="document-card"
      className={cn(
        'border-site-file-border bg-background hover:border-primary focus-visible:outline-ring flex h-full items-center rounded-xs border transition-colors outline-none focus-visible:outline-2 focus-visible:outline-offset-2',
        box,
      )}
    >
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-foreground text-base leading-6 font-semibold">
          {label ?? file.title}
          {label ? <span className="sr-only"> — {file.title}</span> : null}
        </span>
        {size ? (
          <span data-slot="document-size" className="text-site-faint text-[13px] leading-5">
            {size}
          </span>
        ) : null}
      </span>
      <FilePill file={file} locale={locale} />
      <span className="sr-only">{t('document.newTab')}</span>
    </a>
  )
}
