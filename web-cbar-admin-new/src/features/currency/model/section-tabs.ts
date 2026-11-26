/** Məzənnələr | Valyutalar alt bölmə tabları — hər iki səhifədə eyni. */

import type { SectionTab } from '@/shared/ui/section-tabs'

export const CURRENCY_SECTION_TABS: SectionTab[] = [
  { to: '/currency-rates', labelKey: 'currency:tabs.rates' },
  { to: '/currency-rates/currencies', labelKey: 'currency:tabs.currencies' },
]
