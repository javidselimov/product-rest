/** Press release lists while they load (spec 036): filter and a page of cards. */
import { ListFilterSkeleton } from '@/widgets/list-filter/list-filter-skeleton'
import { NewsGridSkeleton } from '@/widgets/news-grid/news-grid-skeleton'
import { SectionShellSkeleton } from '@/widgets/section-shell/section-shell-skeleton'

import { NEWS_PAGE_SIZE } from './constants'

export function PressReleasesSkeleton() {
  return (
    <SectionShellSkeleton>
      <ListFilterSkeleton />
      <div className="mt-15">
        <NewsGridSkeleton count={NEWS_PAGE_SIZE} />
      </div>
    </SectionShellSkeleton>
  )
}
