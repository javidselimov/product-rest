/**
 * `renderApp` — testlər real provider stack-i ilə render edir.
 *
 * Route faylları deyil, `views`/`widgets`/`shell` komponentləri render olunur
 * (spec 002 research R11): view-lar prop-la işləyir, loader-lər ayrıca test olunur.
 */
import {
  render,
  type RenderOptions,
  type RenderResult,
} from '@testing-library/react'
import type { ReactElement, ReactNode } from 'react'

import { AppProviders } from '@/providers/app-providers'
import { I18nProvider } from '@/providers/i18n-provider'
import { defaultLocale, type Locale } from '@/shared/i18n'

type RenderAppOptions = Omit<RenderOptions, 'wrapper'> & {
  locale?: Locale
}

export function renderApp(
  ui: ReactElement,
  options: RenderAppOptions = {},
): RenderResult {
  const { locale = defaultLocale, ...rest } = options

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <I18nProvider locale={locale}>
        <AppProviders locale={locale}>
          {children}
        </AppProviders>
      </I18nProvider>
    )
  }

  return render(ui, { wrapper: Wrapper, ...rest })
}

export * from '@testing-library/react'
