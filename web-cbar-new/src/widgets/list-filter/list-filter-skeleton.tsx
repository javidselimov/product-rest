/** Filter row while a list loads (spec 036). Same layout classes as `ListFilter`. */
import { Skeleton } from '@cbar/lib-react-ui-kit/skeleton'

import { LIST_FILTER_CLASS, LIST_FILTER_FIELDS_CLASS } from './model'

const FIELD = 'h-11 w-full rounded-xs desk:w-78'

export function ListFilterSkeleton() {
  return (
    <div className={LIST_FILTER_CLASS}>
      <div className={LIST_FILTER_FIELDS_CLASS}>
        <Skeleton className={FIELD} />
        <Skeleton className={FIELD} />
      </div>
      <Skeleton className="h-11 w-36 self-end rounded-xs" />
    </div>
  )
}
