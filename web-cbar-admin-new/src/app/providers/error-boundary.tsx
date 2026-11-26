/**
 * Global ErrorBoundary (guideline §15): yalnız render xətaları üçün — API
 * xətaları interceptor + Query axını ilə idarə olunur. Fallback kit
 * primitivlərindən qurulub; router-in `defaultErrorComponent`-i də budur.
 */

import { Button } from '@cbar/lib-react-ui-kit/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@cbar/lib-react-ui-kit/card'
import { InfoCircleIcon } from '@cbar/lib-react-ui-kit/icons'
import { Component, useEffect, type ErrorInfo, type ReactNode } from 'react'

import { i18n } from '@/shared/i18n'
import { isChunkLoadError, reloadOnce } from '@/shared/lib/chunk-reload'
import { logger } from '@/shared/lib/logger'

interface ErrorFallbackProps {
  onRetry: () => void
}

/** Router `defaultErrorComponent` bunu {error, reset} ilə çağırır — aşağıya bax. */
export function ErrorFallback({ onRetry }: ErrorFallbackProps) {
  // Class boundary daxilində hook işləmir deyə i18n.t birbaşa istifadə olunur.
  const t = (key: string) => i18n.t(key, { ns: 'common' })
  return (
    <div className="bg-background flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-lg text-center">
        <CardHeader className="items-center">
          <span className="bg-destructive/10 text-destructive mx-auto grid size-12 place-items-center rounded-full">
            <InfoCircleIcon />
          </span>
          <CardTitle>{t('errors.boundaryTitle')}</CardTitle>
          <CardDescription>{t('errors.boundaryDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onRetry}>{t('errors.retry')}</Button>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Route xətaları buraya düşür və əvvəl heç yerə yazılmırdı — deploy olunmuş
 * build-də səbəb görünmürdü (spec 004 FR-009). Chunk yükləmə xətası isə köhnə
 * tab deməkdir: bir dəfə yenilə (spec 004 R2).
 */
export function RouterErrorFallback({
  error,
  reset,
}: Readonly<{
  error: unknown
  reset: () => void
}>) {
  useEffect(() => {
    logger.error(error, { source: 'router' })
    if (isChunkLoadError(error)) reloadOnce(error)
  }, [error])
  return <ErrorFallback onRetry={reset} />
}

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    logger.error(error, { componentStack: info.componentStack })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <ErrorFallback onRetry={() => this.setState({ hasError: false })} />
      )
    }
    return this.props.children
  }
}
