/**
 * Text and document cards of a publications page, in the order the editor wrote them (spec 054 ui-contract §5–§7): a
 * file paragraph is a card, the rest goes through the one HTML sink, `CmsContent`. Cards stack 12 apart.
 */
import type { DocumentPart } from '@/features/about-content/model/types'
import type { Locale } from '@/shared/i18n'
import { CmsContent } from '@/widgets/cms-content/cms-content'

import { DocumentCard } from './document-card'

export function DocumentParts({ parts, locale }: Readonly<{ parts: DocumentPart[]; locale: Locale }>) {
  if (parts.length === 0) return null
  return (
    <div className="flex flex-col gap-3">
      {parts.map((part, index) =>
        part.type === 'file' ? (
          <DocumentCard key={`f-${index}-${part.file.id}`} file={part.file} locale={locale} />
        ) : (
          <CmsContent key={`h-${index}`} html={part.html} variant="about" />
        ),
      )}
    </div>
  )
}
