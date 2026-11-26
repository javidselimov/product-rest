/**
 * The consumer rights root and the administrative officials page (spec 050, Figma `2445:16786`, `2553:6979`): the lead,
 * then headings, ordinary text and numbered cards in the editor's order.
 */
import type { ConsumerTextBlock } from '@/features/about-content/model/types'
import { CmsContent } from '@/widgets/cms-content/cms-content'

export function ConsumerText({ block }: Readonly<{ block: ConsumerTextBlock }>) {
  return (
    <div data-slot="consumer-text" className="flex flex-col gap-6">
      {/* Figma lead 18/30 Medium; the `about` variant sets its own size, hence `!`. */}
      <CmsContent html={block.leadHtml} variant="about" className="text-foreground text-lg! leading-[30px]! font-medium!" />
      {block.parts.map((part, index) => {
        const key = `${index}-${part.type}`
        if (part.type === 'heading') {
          return (
            <h2 key={key} className="text-foreground text-xl leading-7 font-semibold">
              {part.text}
            </h2>
          )
        }
        if (part.type === 'html') return <CmsContent key={key} html={part.html} variant="about" />
        return (
          <ol key={key} className="flex flex-col gap-4">
            {part.itemsHtml.map((item, i) => (
              <li key={`${i}-${item.length}`} className="flex gap-4">
                <span aria-hidden="true" className="text-site-accent-strong w-6 shrink-0 text-base leading-7 font-semibold">
                  {i + 1}
                </span>
                <CmsContent html={item} variant="about" className="min-w-0 flex-1 [&_p]:m-0" />
              </li>
            ))}
          </ol>
        )
      })}
    </div>
  )
}
