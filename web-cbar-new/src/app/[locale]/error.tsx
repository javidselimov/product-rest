'use client'

import { RouteError } from '@/shared/ui/route-states'
import { SiteContainer } from '@/shared/ui/site-container'

export default function LocaleError({ reset }: { error: Error; reset: () => void }) {
  return (
    <SiteContainer>
      <RouteError reset={reset} />
    </SiteContainer>
  )
}
