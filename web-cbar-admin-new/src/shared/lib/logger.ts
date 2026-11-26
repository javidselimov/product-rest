/**
 * Monitoring adapteri (guideline §15.2). Sentry DSN konfiqurasiya olunana qədər
 * no-op / console — real inteqrasiya gələndə YALNIZ bu fayl dəyişir, çağıran
 * kod yox. Sensitive data (token, şəxsi məlumat) heç vaxt log-a ötürülmür.
 *
 * `error()` production-da da konsola yazır (spec 004 FR-009): əks halda deploy
 * olunmuş build-də xəta ekranının səbəbi heç yerdə görünmürdü. Production-da
 * yalnız ad + mesaj + componentStack gedir — obyektin özü (axios config/response,
 * header-lər) yox.
 */

interface LogContext {
  [key: string]: unknown
}

const isDev = import.meta.env.DEV

export const logger = {
  error(error: unknown, context?: LogContext): void {
    if (isDev) {
      console.error('[nexus]', error, context ?? '')
    } else {
      const summary =
        error instanceof Error ? `${error.name}: ${error.message}` : String(error)
      const componentStack =
        typeof context?.componentStack === 'string' ? context.componentStack : ''
      console.error('[admin]', summary, componentStack)
    }
    // Sentry: Sentry.captureException(error, { extra: context })
  },

  warn(message: string, context?: LogContext): void {
    if (isDev) {
      console.warn('[nexus]', message, context ?? '')
    }
  },

  info(message: string, context?: LogContext): void {
    if (isDev) {
      console.info('[nexus]', message, context ?? '')
    }
  },
}
