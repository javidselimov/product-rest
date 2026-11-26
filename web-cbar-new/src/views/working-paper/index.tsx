/**
 * Working paper page (spec 054 FR-010, ui-contract §4; Figma `2703:6295`, tablet `2743:8111`, mobile `2743:8913`): the
 * title, the meta box, abstract, keywords, JEL codes and the PDF card, 40 apart (32 on mobile).
 */
import { DocumentCard } from '@/widgets/about-blocks/document-card'
import { SectionShell } from '@/widgets/section-shell'
import { PaperMeta } from '@/widgets/working-papers'

import type { WorkingPaperViewData } from './loader'

export function WorkingPaperView({ data }: Readonly<{ data: WorkingPaperViewData }>) {
  return (
    <SectionShell shell={data.shell} title={data.paper.title}>
      <div data-slot="working-paper" className="flex flex-col gap-10 max-tab:gap-8">
        <PaperMeta paper={data.paper} locale={data.locale} />
        {data.file ? <DocumentCard file={data.file} locale={data.locale} /> : null}
      </div>
    </SectionShell>
  )
}
