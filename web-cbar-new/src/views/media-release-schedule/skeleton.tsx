/** The schedule page while it loads (spec 036, spec 039): intro, search and table rows. */
import { Skeleton } from '@cbar/lib-react-ui-kit/skeleton'

import { ListFilterSkeleton } from '@/widgets/list-filter/list-filter-skeleton'
import { SectionShellSkeleton } from '@/widgets/section-shell/section-shell-skeleton'

const ROWS = 8

export function ReleaseScheduleSkeleton() {
  return (
    <SectionShellSkeleton>
      <div className="flex flex-col gap-5 tab:gap-6">
        <Skeleton className="h-14 rounded-xs" />
        <ListFilterSkeleton />
        <div className="flex flex-col gap-px">
          {Array.from({ length: ROWS }, (_, i) => (
            <Skeleton key={i} className="h-[61px] rounded-none max-tab:h-[167px]" />
          ))}
        </div>
      </div>
    </SectionShellSkeleton>
  )
}
