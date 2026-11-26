/**
 * Locale layout-u — client sərhədi burada açılır; qabıq CMS ağacı ilə qurulur.
 *
 * Naməlum locale (`/ru/…`) səssiz defolt-a **düşmür**: `notFound()` çağırılır.
 * Ağac yüklənməsə menyu boş qalır, səhifə render olunur (spec 002 Edge Cases).
 * Canlı yayım da eyni qaydadadır: xəta → popup yoxdur (spec 006 Edge Cases); şəkilli
 * popup da (spec 009 FR-014).
 * Müyəssərlik menyusu da: ayar oxunmasa menyu yoxdur (spec 007 FR-010). Onun skripti
 * CSP nonce-u ilə render olunur — nonce-u `src/proxy.ts` sorğu başlığına qoyur.
 */
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'

import { getAccessibilityWidgetSetting } from '@/features/accessibility-widget/api/accessibility-widget.api'
import { getImagePopups } from '@/features/image-popup/api/image-popup.api'
import { toImagePopup } from '@/features/image-popup/model/image-popup'
import { getVideoStreams } from '@/features/media/api/media.api'
import { toLiveStream } from '@/features/media/model/live-stream'
import { getPagesTree } from '@/features/pages/api/pages.api'
import { AppProviders } from '@/providers/app-providers'
import { I18nProvider } from '@/providers/i18n-provider'
import { NONCE_HEADER } from '@/shared/config/security-headers'
import { SUPPORTED_LANGUAGES, isSupportedLocale } from '@/shared/i18n'
import { SiteShell } from '@/shell/site-shell'

export function generateStaticParams() {
  return SUPPORTED_LANGUAGES.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isSupportedLocale(locale)) notFound()

  const [headerStore, tree, streams, imagePopups, accessibilityWidget] = await Promise.all([
    headers(),
    getPagesTree(locale).catch(() => []),
    getVideoStreams(locale).catch(() => []),
    getImagePopups(locale).catch(() => []),
    getAccessibilityWidgetSetting(),
  ])

  return (
    <I18nProvider locale={locale}>
      <AppProviders locale={locale}>
        <SiteShell
          locale={locale}
          tree={tree}
          liveStream={toLiveStream(streams)}
          imagePopup={toImagePopup(imagePopups)}
          accessibilityWidget={{
            enabled: accessibilityWidget.enabled,
            nonce: headerStore.get(NONCE_HEADER) ?? undefined,
          }}
          nonce={headerStore.get(NONCE_HEADER) ?? undefined}
        >
          {children}
        </SiteShell>
      </AppProviders>
    </I18nProvider>
  )
}
