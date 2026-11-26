/**
 * Sayt qabığı — başlıq + `<main>` + altlıq (server komponenti) + canlı yayım
 * popup-ı (spec 006; yayım yoxdursa heç nə render olunmur) + şəkilli popup
 * (spec 009; canlı yayımdan sonra növbə ilə) + müyəssərlik menyusu
 * (spec 007; deaktivdirsə teq yoxdur) + ana səhifə birinci ekranının miqyas skripti.
 */
import type { ReactNode } from 'react'

import type { PageNode } from '@/entities/page-node'
import type { ImagePopup } from '@/features/image-popup/model/image-popup'
import type { LiveStream } from '@/features/media/model/live-stream'
import { getT } from '@/shared/i18n/server'
import type { Locale } from '@/shared/i18n'
import { AccessibilityWidgetScript } from '@/widgets/accessibility-widget/accessibility-widget-script'
import { HeroScaleScript } from '@/widgets/hero-scale/hero-scale-script'
import { ImagePopupDialog } from '@/widgets/image-popup/image-popup-dialog'
import { LiveStreamDialog } from '@/widgets/live-stream/live-stream-dialog'

import { SiteFooter } from './site-footer'
import { SiteHeader } from './site-header'

type SiteShellProps = {
  locale: Locale
  tree: PageNode[]
  /** Layout serverdə alır (`toLiveStream`); testlərdə buraxıla bilər. */
  liveStream?: LiveStream | null
  /** Layout serverdə alır (`toImagePopup`, spec 009); canlı yayımdan sonra açılır. */
  imagePopup?: ImagePopup | null
  /** Layout serverdə alır (ayar + CSP nonce); verilməyəndə menyu yoxdur. */
  accessibilityWidget?: { enabled: boolean; nonce?: string }
  /** Sorğunun CSP nonce-u — shell-in öz skriptləri üçün (`HeroScaleScript`). */
  nonce?: string
  children: ReactNode
}

export function SiteShell({
  locale,
  tree,
  liveStream = null,
  imagePopup = null,
  accessibilityWidget,
  nonce,
  children,
}: SiteShellProps) {
  const t = getT(locale, 'nav')

  return (
    <div data-slot="site-shell" className="bg-background text-foreground flex min-h-svh flex-col">
      <a
        href="#content"
        className="bg-primary text-primary-foreground sr-only z-50 rounded-md px-3 py-2 focus:not-sr-only focus:absolute focus:top-2 focus:left-2"
      >
        {t('skipToContent')}
      </a>

      <SiteHeader locale={locale} tree={tree} hasLiveStream={liveStream !== null} />
      {/*
        Header-dən dərhal sonra, `<main>`-dən əvvəl: header ölçülə bilir, ana səhifənin birinci ekranı
        ilk boyamadan əvvəl miqyası bilir. Səhifədə yox, shell-dədir — client-side keçiddə React-in
        əlavə etdiyi `<script>` icra olunmur, layout isə bir dəfə yüklənib qalır.
      */}
      <HeroScaleScript nonce={nonce} />

      {/* Konteyner səhifənin özündədir: məzmun səhifələri `(content)` layout-unda, ana səhifə tam enli (spec 022 R3). */}
      <main id="content" className="w-full flex-1">
        {children}
      </main>

      <SiteFooter locale={locale} tree={tree} />

      <LiveStreamDialog stream={liveStream} />
      <ImagePopupDialog popup={imagePopup} liveStreamId={liveStream?.id} />

      <AccessibilityWidgetScript
        enabled={accessibilityWidget?.enabled ?? false}
        locale={locale}
        nonce={accessibilityWidget?.nonce}
      />
    </div>
  )
}
