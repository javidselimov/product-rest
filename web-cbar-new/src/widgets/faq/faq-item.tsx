/**
 * One question, Figma `FAQ / Item` (spec 051 ui-contract "Sual"). A native `<details>`: it opens without JS, the browser
 * announces its state, and `data-accordion` prints it open (`globals.css`). The id is the question's link target
 * (`#sual-<id>`, FR-016a). The group is named: the item sits inside a topic `<details>` whose open state must not style it.
 */
import { CaretDownIcon } from '@cbar/lib-react-ui-kit/icons'

import { faqAnchor } from '@/features/faq/model/constants'
import type { FaqQuestionView } from '@/features/faq/model/select'
import { CmsContent } from '@/widgets/cms-content/cms-content'

type FaqItemProps = Readonly<{ question: FaqQuestionView }>

export function FaqItem({ question }: FaqItemProps) {
  return (
    <li className="border-border border-b">
      <details id={faqAnchor(question.id)} data-slot="faq-item" data-accordion="" open={question.open} className="group/item scroll-mt-24">
        <summary className="focus-visible:outline-ring flex cursor-pointer list-none items-center gap-4 px-4 py-4 outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 tab:px-6 tab:py-5 [&::-webkit-details-marker]:hidden">
          <span className="text-foreground group-open/item:text-primary min-w-0 flex-1 text-base leading-6 font-medium group-open/item:font-semibold tab:text-[17px] tab:leading-[26px]">
            {question.number}. {question.question}
          </span>
          <CaretDownIcon aria-hidden="true" className="text-foreground size-5 shrink-0 transition-transform group-open/item:rotate-180" />
        </summary>
        <div data-type="details-content" className="px-4 pb-6 tab:pr-18 tab:pl-6">
          <CmsContent html={question.answerHtml} variant="about" className="[&_p]:leading-[26px]!" />
        </div>
      </details>
    </li>
  )
}
