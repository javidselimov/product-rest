/** Card grid while a list loads (spec 036). Same grid and image box as `NewsGrid`. */
import { cn } from '@cbar/lib-react-ui-kit/lib'
import { Skeleton } from '@cbar/lib-react-ui-kit/skeleton'

import { NEWS_CARD_IMAGE_CLASS, NEWS_GRID_CLASS } from './news-grid'

export function NewsGridSkeleton({ count }: Readonly<{ count: number }>) {
  return (
    <ul className={NEWS_GRID_CLASS}>
      {Array.from({ length: count }, (_, i) => (
        <li key={i}>
          <Skeleton className={cn(NEWS_CARD_IMAGE_CLASS, 'rounded-none')} />
          <Skeleton className="mb-4 h-7 w-24 rounded-xs" />
          <Skeleton className="h-21 rounded-xs" />
        </li>
      ))}
    </ul>
  )
}
