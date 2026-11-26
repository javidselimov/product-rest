/**
 * Page outline shown while a section page loads (spec 036, contracts/ui-contract.md §3). Same
 * layout classes as `SectionShell`. The menu is neutral lines: its items are not known yet, so its
 * height can differ from the real menu where it stacks above the content (below `desk`).
 */
import { cn } from '@cbar/lib-react-ui-kit/lib'
import { Skeleton } from '@cbar/lib-react-ui-kit/skeleton'
import type { ReactNode } from 'react'

import { PAGE_TOOLS_CLASS, SHELL_BODY_CLASS, SHELL_CLASS } from './constants'

const NAV_LINES = 5

const lines = (count: number) => Array.from({ length: count }, (_, i) => i)

export function SectionShellSkeleton({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div data-slot="route-skeleton" aria-hidden="true" className={SHELL_CLASS}>
      <div className={PAGE_TOOLS_CLASS}>
        <Skeleton className="h-5 w-72 max-w-full rounded-xs" />
        <Skeleton className="h-8 w-32 rounded-xs" />
      </div>
      <div className={SHELL_BODY_CLASS}>
        <div className="bg-site-surface-muted flex flex-col gap-4 rounded-xs p-5">
          {lines(NAV_LINES).map((line) => (
            <Skeleton key={line} className="h-7 rounded-xs" />
          ))}
        </div>
        <div className="min-w-0">
          <Skeleton className="mb-8 h-7 w-1/2 rounded-xs tab:mb-9 tab:h-11" />
          {children}
        </div>
      </div>
    </div>
  )
}

type DetailSkeletonProps = Readonly<{
  /** Aspect ratio class of the cover, player or photo; left out when the page has none. */
  boxClass?: string
  /** Text lines under the box. */
  textLines?: number
}>

/** A detail page: an optional box, then lines of text. */
export function DetailSkeleton({ boxClass, textLines = 0 }: DetailSkeletonProps) {
  return (
    <SectionShellSkeleton>
      {boxClass ? <Skeleton className={cn('mb-8 w-full rounded-none', boxClass)} /> : null}
      <div className="flex flex-col gap-3">
        {lines(textLines).map((line) => (
          <Skeleton key={line} className="h-5 rounded-xs" />
        ))}
      </div>
    </SectionShellSkeleton>
  )
}
