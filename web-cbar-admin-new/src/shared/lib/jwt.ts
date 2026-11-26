/**
 * JWT payload oxuyucusu (research R4). API `/auth/me` vermir — cari istifadəçi
 * yalnız access token-in payload-undan çıxarılır. İmza YOXLANMIR: bu, təhlükəsizlik
 * yoxlaması deyil, UI üçün məlumat mənbəyidir; real yetki backend-dədir.
 */

import { BASE64_GROUP } from '@/shared/constants/limits'

const base64UrlToString = (segment: string): string => {
  const base64 = segment.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64 + '='.repeat((BASE64_GROUP - (base64.length % BASE64_GROUP)) % BASE64_GROUP)
  const binary = atob(padded)
  // UTF-8 bərpası (Azərbaycan hərfli istifadəçi adları üçün).
  const bytes = Uint8Array.from(binary, (ch) => ch.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

/** Payload-u obyekt kimi qaytarır; korlanmış token → `null`. Tip yoxlaması çağıranındır (Zod). */
export function decodeJwtPayload(token: string): unknown {
  const parts = token.split('.')
  if (parts.length < 2 || !parts[1]) return null
  try {
    const parsed: unknown = JSON.parse(base64UrlToString(parts[1]))
    return typeof parsed === 'object' && parsed !== null ? parsed : null
  } catch {
    return null
  }
}
