/**
 * Root layout — **server komponenti** (konstitusiya Maddə XI.1: root client-ə çevrilmir).
 *
 * Dil `src/proxy.ts`-in qoyduğu `x-locale` başlığından oxunur; `<html>` ilk
 * render-də artıq düzgün gəlir. Dil cookie-si yoxdur (spec 002 research R5).
 * Sayt yalnız açıq temadadır — tema seçimi spec 022 ilə ləğv olunub (research R8).
 */
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import type { ReactNode } from 'react'
import { preload } from 'react-dom'

import { brand } from '@/shared/config/brand'
import { LOCALE_HEADER } from '@/shared/constants/headers'
import { KIT_MISSING_NOTICE, isKitInstalled } from '@/shared/config/kit-status'
import { defaultLocale, isSupportedLocale } from '@/shared/i18n'

import './globals.css'

export const metadata: Metadata = {
  title: {
    default: brand.displayName,
    template: `%s | ${brand.displayName}`,
  },
  icons: { icon: '/site/emblem.svg' },
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const headerList = await headers()

  const fromProxy = headerList.get(LOCALE_HEADER) ?? undefined
  const locale = isSupportedLocale(fromProxy) ? fromProxy : defaultLocale

  // Hər səhifədə lazım olan latin alt dəsti; latin-ext yalnız ə/ğ/ş görünəndə yüklənir (fonts.css).
  preload('/fonts/dm-sans/dm-sans-latin-wght-normal.woff2', {
    as: 'font',
    type: 'font/woff2',
    crossOrigin: 'anonymous',
  })

  return (
    <html lang={locale}>
      <body>
        {/* Kit yoxdursa səhifə səssizcə stilsiz açılmır — bildiriş görünür. */}
        {isKitInstalled() ? null : (
          <div role="alert" data-slot="kit-missing-notice" className="p-3 text-sm">
            {KIT_MISSING_NOTICE}
          </div>
        )}
        {children}
      </body>
    </html>
  )
}
