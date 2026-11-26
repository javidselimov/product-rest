/** Photo and video lists while they load (spec 036): tabs, filter and a page of cards. */
import { Skeleton } from '@cbar/lib-react-ui-kit/skeleton'

import { ListFilterSkeleton } from '@/widgets/list-filter/list-filter-skeleton'
import { NewsGridSkeleton } from '@/widgets/news-grid/news-grid-skeleton'
import { SectionShellSkeleton } from '@/widgets/section-shell/section-shell-skeleton'

import { GALLERY_PAGE_SIZE } from './constants'

export function MediaGalleryListSkeleton() {
  return (
    <SectionShellSkeleton>
      <div className="flex flex-col gap-6 tab:gap-9">
        <div className="border-site-divider flex gap-8 border-b pb-[15px]">
          <Skeleton className="h-10 w-32 rounded-xs" />
          <Skeleton className="h-10 w-32 rounded-xs" />
        </div>
        <ListFilterSkeleton />
        <NewsGridSkeleton count={GALLERY_PAGE_SIZE} />
      </div>
    </SectionShellSkeleton>
  )
}
