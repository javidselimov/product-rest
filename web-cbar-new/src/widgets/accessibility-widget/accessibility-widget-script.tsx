/**
 * Müyəssərlik menyusu (accessibility.cert.gov.az) — spec 007 contracts/widget-embed.md.
 *
 * Server komponentidir: teq SSR HTML-inə düşür. Widget yalnız `readystatechange`
 * hadisəsində init olur, ona görə adi `<script defer>` işlədilir — `next/script`,
 * `async` və dinamik əlavə init anını qaçırır (research R2). Skript öz serverimizdən
 * gələn yoxlanmış surətdir (`public/vendor/accw/VENDOR.md`, sapma D-1).
 */
import type { Locale } from '@/shared/i18n'

const WIDGET_SRC = '/vendor/accw/acc-widget.min.js'

/** Mövqe və ölçü sabitdir (spec Q1-A, FR-009). Atributun adı `offset`-dir — sənəddəki `offsett` yazı səhvidir. */
const POSITION = 'bottom-left'
const OFFSET = '20,20'
const SIZE = 'md'

type AccessibilityWidgetScriptProps = {
  enabled: boolean
  locale: Locale
  /** Sorğunun CSP nonce-u: `strict-dynamic` altında nonce-suz skript bloklanır. */
  nonce: string | undefined
}

export function AccessibilityWidgetScript({ enabled, locale, nonce }: AccessibilityWidgetScriptProps) {
  if (!enabled) return null

  return (
    <script
      src={WIDGET_SRC}
      defer
      nonce={nonce}
      data-accw-lang={locale}
      data-accw-position={POSITION}
      data-accw-offset={OFFSET}
      data-accw-size={SIZE}
    />
  )
}
