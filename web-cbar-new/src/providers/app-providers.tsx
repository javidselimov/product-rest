'use client'

/**
 * Client provider stack-i (FSD app-layer).
 *
 * `TooltipProvider`, `Toaster` və kitin `UIMessagesProvider`-i **yalnız burada,
 * bir dəfə** mount olunur (konstitusiya Maddə III.5; spec 002 FR-024) — heç bir
 * view və ya widget onları təkrarlamır.
 *
 * Public saytda brauzer API-yə müraciət etmir (spec 002 research R2): axios
 * interceptor-ları və mock qapısı yoxdur. `QueryClientProvider` template
 * stack-inin bir hissəsi kimi qalır, query yazılmır.
 */
import { UIMessagesProvider } from '@cbar/lib-react-ui-kit/i18n'
import { Toaster } from '@cbar/lib-react-ui-kit/toast'
import { TooltipProvider } from '@cbar/lib-react-ui-kit/tooltip'
import { QueryClientProvider } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import type { Locale } from '@/shared/i18n'
import { uiMessages } from '@/shared/i18n/ui-messages'
import { ErrorState } from '@/shared/ui/error-state'

import { ErrorBoundary } from './error-boundary'
import { createQueryClient } from './query-client'

/** Render xətasının fallback-ı — mətn i18n-dən gəlir (Maddə I.2). */
function RenderErrorFallback({ reset }: { reset: () => void }) {
  const { t } = useTranslation('common')

  return (
    <div className="p-6">
      <ErrorState title={t('states.error')} onRetry={reset} retryLabel={t('actions.retry')} />
    </div>
  )
}

type AppProvidersProps = {
  /** URL-dən gələn dil — kit etiketlərinin kataloqunu seçir. */
  locale: Locale
  children: ReactNode
}

export function AppProviders({ locale, children }: AppProvidersProps) {
  const [queryClient] = useState(createQueryClient)

  return (
    <QueryClientProvider client={queryClient}>
      <UIMessagesProvider messages={uiMessages[locale]}>
        <TooltipProvider>
          <ErrorBoundary fallback={(_error, reset) => <RenderErrorFallback reset={reset} />}>
            {children}
          </ErrorBoundary>
          <Toaster />
        </TooltipProvider>
      </UIMessagesProvider>
    </QueryClientProvider>
  )
}
