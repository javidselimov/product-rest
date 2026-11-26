/**
 * Root provider stack (specs/001 plan.md §5). TooltipProvider və Toaster BURADA,
 * bir dəfə mount olunur — login səhifəsi shell-dən kənardadır, amma toast və
 * tooltip ona da lazımdır.
 */

import { useIsMobile } from '@cbar/lib-react-ui-kit/hooks'
import { Toaster } from '@cbar/lib-react-ui-kit/toast'
import { TooltipProvider } from '@cbar/lib-react-ui-kit/tooltip'
import { QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'

import { queryClient } from './query-client'

export function AppProviders({ children }: { children: ReactNode }) {
  const isMobile = useIsMobile()

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={200}>
        {children}
        <Toaster
          position={isMobile ? 'bottom-center' : 'bottom-right'}
          closeButton
        />
      </TooltipProvider>
    </QueryClientProvider>
  )
}
