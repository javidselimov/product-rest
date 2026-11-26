'use client'

/**
 * i18next instansiyasını route-dakı locale ilə qurur (R-004).
 *
 * Dil dəyişəndə `useMemo` yeni instansiya yaradır — render zamanı yan təsir
 * (`changeLanguage`) çağırılmır, ona görə hydration xəbərdarlığı yaranmır (SC-012).
 */
import { useMemo, type ReactNode } from 'react'
import { I18nextProvider } from 'react-i18next'

import { createI18n } from '@/shared/i18n/create-i18n'
import type { Locale } from '@/shared/i18n'

export function I18nProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  const instance = useMemo(() => createI18n(locale), [locale])

  return <I18nextProvider i18n={instance}>{children}</I18nextProvider>
}
