/*
 * Kök 404 — `[locale]` seqmentindən kənardadır (dəstəklənməyən locale: `/ru/…`).
 * Burada i18n provider-i yoxdur, ona görə mətn hər iki dildə statikdir —
 * Maddə I.2 istisnası yalnız bu faylda (spec 002 research R13).
 */
/* eslint-disable no-restricted-syntax -- spec 002 R13: kök 404 i18n-siz, iki dilli statik mətn */
import Link from 'next/link'

import { defaultLocale } from '@/shared/i18n'

export default function RootNotFound() {
  return (
    <main className="bg-background text-foreground flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="text-muted-foreground text-6xl font-semibold">404</p>
      <p lang="az" className="text-lg">
        Səhifə tapılmadı
      </p>
      <p lang="en" className="text-muted-foreground text-base">
        Page not found
      </p>
      <Link href={`/${defaultLocale}`} className="text-primary underline underline-offset-4">
        cbar.az
      </Link>
    </main>
  )
}
