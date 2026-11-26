/** Events list while it loads (spec 036): tabs, filter and event rows. */
import { Skeleton } from '@cbar/lib-react-ui-kit/skeleton'

import { ListFilterSkeleton } from '@/widgets/list-filter/list-filter-skeleton'
import { SectionShellSkeleton } from '@/widgets/section-shell/section-shell-skeleton'

const ROWS = 5

export function MediaEventsSkeleton() {
  return (
    <SectionShellSkeleton>
      <div className="flex flex-col gap-8 tab:gap-12">
        <div className="border-site-divider flex gap-8 border-b pb-[15px]">
          <Skeleton className="h-10 w-32 rounded-xs" />
          <Skeleton className="h-10 w-32 rounded-xs" />
        </div>
        <ListFilterSkeleton />
        <div className="flex flex-col gap-3">
          {Array.from({ length: ROWS }, (_, i) => (
            <Skeleton key={i} className="h-[106px] rounded-xs tab:h-[122px]" />
          ))}
        </div>
      </div>
    </SectionShellSkeleton>
  )
}
