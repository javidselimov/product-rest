/**
 * Cari səhifənin mütləq ünvanı — paylaşma linkləri üçün (spec 024 research R7).
 *
 * Saytın öz origin-i konfiqurasiyada yoxdur, ona görə sorğu başlıqlarından qurulur
 * (reverse proxy `X-Forwarded-*` verir). Ünvan yalnız `encodeURIComponent` ilə link
 * parametrinə düşür və React tərəfindən escape olunur — başlıq dəyəri HTML-ə xam yazılmır.
 */
import 'server-only'

import { headers } from 'next/headers'

const HOST = /^[a-z0-9.-]+(?::\d{1,5})?$/i

export function originFrom(get: (name: string) => string | null): string | null {
  const host = (get('x-forwarded-host') ?? get('host') ?? '').split(',')[0]?.trim() ?? ''
  if (!HOST.test(host)) return null
  const proto = (get('x-forwarded-proto') ?? '').split(',')[0]?.trim()
  const scheme = proto === 'http' || proto === 'https' ? proto : 'https'
  return `${scheme}://${host}`
}

/**
 * `pathname` (`/az/...`, sorğu daxil ola bilər) üçün mütləq ünvan. Origin bilinmirsə və ya
 * sorğu konteksti yoxdursa (loader testləri) nisbi yol — paylaşma linki yenə qurulur.
 */
export async function absolutePageUrl(pathname: string): Promise<string> {
  try {
    const store = await headers()
    const origin = originFrom((name) => store.get(name))
    return origin ? `${origin}${pathname}` : pathname
  } catch {
    return pathname
  }
}
