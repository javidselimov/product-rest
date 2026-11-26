/**
 * "Media requests" page body (spec 037): intro, contact cards, remaining content, 16 apart. One
 * block, because the gap between `AboutBlocks` blocks is 32/36 and Figma has 16 here.
 */
import type { MediaRequestsBlock } from '@/features/about-content/model/types'
import { CmsContent } from '@/widgets/cms-content/cms-content'

import { ContactCards } from './contact-cards'

export function MediaRequests({ block }: Readonly<{ block: MediaRequestsBlock }>) {
  return (
    <div data-slot="media-requests" className="flex flex-col gap-4">
      <CmsContent html={block.introHtml} variant="media-requests" />
      {block.cards.length > 0 ? <ContactCards cards={block.cards} /> : null}
      <CmsContent html={block.restHtml} variant="media-requests" />
    </div>
  )
}
