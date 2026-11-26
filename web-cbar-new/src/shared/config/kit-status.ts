/**
 * UI kit-in mövcudluğu (FR-043, spec Edge Cases).
 *
 * Kit `optionalDependencies`-dədir: `npm run install:public` onu **qəsdən**
 * ötürür və quraşdırma yaşıl bitir. Belə halda tətbiq səssizcə stilsiz
 * açılmamalıdır — həm boot log-unda, həm səhifənin başında aydın bildiriş olur.
 *
 * Yoxlama `require.resolve` ilə aparılır və **yalnız server tərəfdə** çağırılır
 * (Node API-si). Kit-in özü buradan import edilmir — əks halda modul kit yoxdursa
 * yüklənməzdi və bildirişi göstərmək mümkün olmazdı.
 */
import { createRequire } from 'node:module'

export const KIT_PACKAGE = '@cbar/lib-react-ui-kit'

/**
 * Bildiriş mətni.
 *
 * i18n açarı **deyil**: bu, məhsul mətni yox, quraşdırma diaqnostikasıdır və
 * i18n resursları yüklənə bilməyən vəziyyətdə də görünməlidir (Maddə I.2-nin
 * əhatəsindən kənar — mətn JSX düyünü kimi deyil, ifadə kimi render olunur).
 */
export const KIT_MISSING_NOTICE =
  'UI kit quraşdırılmayıb (@cbar/lib-react-ui-kit) — interfeys stilsiz görünür. Düzəltmək üçün: npm run install:offline (şəbəkə tələb olunmur) və ya npm run install:nexus'

let cached: boolean | null = null

/** Kit `node_modules`-da varmı? Nəticə keşlənir — hər sorğuda disk oxunmur. */
export function isKitInstalled(): boolean {
  if (cached !== null) return cached

  try {
    createRequire(import.meta.url).resolve(`${KIT_PACKAGE}/package.json`)
    cached = true
  } catch {
    cached = false
  }

  return cached
}

/** Testlər üçün: keşi sıfırlayır. */
export function resetKitStatusCache(): void {
  cached = null
}
