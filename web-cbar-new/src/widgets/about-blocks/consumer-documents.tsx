/**
 * The consumer rights "Documents" page (spec 050, Figma `2572:14435`, `Sənədlər / Section` 2572:14430): one native
 * `<details>` per section, all closed on arrival, the files as document cards. `data-accordion` reuses the print rule.
 */
import { CaretDownIcon } from '@cbar/lib-react-ui-kit/icons'

import type { ConsumerDocumentsBlock } from '@/features/about-content/model/types'
import type { Locale } from '@/shared/i18n'
import { CmsContent } from '@/widgets/cms-content/cms-content'

import { DocumentCard } from './document-card'

export function ConsumerDocuments({ block, locale }: Readonly<{ block: ConsumerDocumentsBlock; locale: Locale }>) {
  return (
    <div data-slot="consumer-documents" className="flex flex-col gap-6">
      {block.introHtml.trim() ? <CmsContent html={block.introHtml} variant="about" /> : null}
      <div>
        {block.sections.map((section, index) => (
          <details key={`${index}-${section.title}`} data-accordion="" className="group border-site-consumer-card-border border-b">
            <summary className="focus-visible:outline-ring flex cursor-pointer list-none items-center gap-4 py-5 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 [&::-webkit-details-marker]:hidden">
              <span className="text-foreground flex-1 text-xl leading-7 font-semibold">{section.title}</span>
              <CaretDownIcon aria-hidden="true" className="text-foreground size-5 shrink-0 transition-transform group-open:rotate-180" />
            </summary>
            <div data-type="details-content" className="flex flex-col gap-5 pb-8">
              {section.parts.map((part, i) =>
                part.type === 'file' ? (
                  <DocumentCard key={`${i}-${part.file.id}`} file={part.file} locale={locale} variant="consumer" />
                ) : (
                  <CmsContent key={`${i}-html`} html={part.html} variant="about" />
                ),
              )}
            </div>
          </details>
        ))}
      </div>
      {block.restHtml.trim() ? <CmsContent html={block.restHtml} variant="about" /> : null}
    </div>
  )
}
