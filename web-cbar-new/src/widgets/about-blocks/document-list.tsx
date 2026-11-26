/**
 * Single-document page of the publications section (spec 054 ui-contract §7; Figma `2776:16546`, `2766:114051`,
 * `2699:23673`): the intro text, then the document cards, 36 apart.
 */
import type { DocumentListBlock } from '@/features/about-content/model/types'
import type { Locale } from '@/shared/i18n'
import { CmsContent } from '@/widgets/cms-content/cms-content'

import { DocumentCard } from './document-card'

export function DocumentList({ block, locale }: Readonly<{ block: DocumentListBlock; locale: Locale }>) {
  return (
    <div data-slot="document-list" className="flex flex-col gap-9">
      {block.introHtml ? <CmsContent html={block.introHtml} variant="about" /> : null}
      {block.files.length > 0 ? (
        <div className="flex flex-col gap-3">
          {block.files.map((file) => (
            <DocumentCard key={file.id} file={file} locale={locale} />
          ))}
        </div>
      ) : null}
    </div>
  )
}
