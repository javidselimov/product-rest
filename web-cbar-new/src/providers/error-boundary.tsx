'use client'

/**
 * Render xətaları üçün ErrorBoundary (konstitusiya Maddə VII.1).
 *
 * **API xətaları üçün istifadə edilmir** — onlar `AppError` → TanStack Query →
 * komponentin `error` vəziyyəti axını ilə gedir. Buraya yalnız komponent render
 * mərhələsində atılan xətalar düşür.
 */
import { Component, type ErrorInfo, type ReactNode } from 'react'

import { logger } from '@/shared/lib/logger'

type ErrorBoundaryProps = {
  children: ReactNode
  /** Xəta baş verəndə göstəriləcək UI; verilməzsə heç nə render olunmur. */
  fallback?: (error: Error, reset: () => void) => ReactNode
}

type ErrorBoundaryState = {
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Stack trace istifadəçiyə göstərilmir, yalnız log-a düşür (Maddə VII.3).
    logger.error('Render xətası tutuldu', {
      message: error.message,
      componentStack: info.componentStack,
    })
  }

  reset = () => {
    this.setState({ error: null })
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children
    return this.props.fallback?.(error, this.reset) ?? null
  }
}
