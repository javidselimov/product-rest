/**
 * SERVER-ONLY — API cavablarının qısa müddətli keşi (spec 003 FR-015…FR-017, D3).
 *
 * Niyə lazımdır: sorğular `axios` ilə gedir (`./api-client`), yəni Next-in `fetch`
 * keşindən tam kənardadır və hər 18 route `force-dynamic` idi. Nəticədə hər
 * ziyarətçinin hər səhifə açılışı `api-cbar`-a tam fan-out edirdi — ana səhifədə
 * ~10 çağırış. Spec 002 keşləməni açıq şəkildə təxirə salmışdı ("Caching/
 * revalidation is a later, deliberate step"); bu modul həmin addımdır.
 *
 * ## Niyə `unstable_cache`, niyə `use cache` deyil
 *
 * Next 16-da `unstable_cache`-in əvəzi `use cache` direktivi sayılır, amma o,
 * `cacheComponents` flag-ını tələb edir və həmin flag bütün render modelini
 * dəyişir (dinamik hissələr `Suspense` sərhədi istəyir). Bu, ayrıca və daha böyük
 * işdir — spec 003 Faza 7 ilə üst-üstə düşür. Ona görə hələlik `unstable_cache`.
 * Gələcək miqrasiya üçün bütün keşləmə **bu bir faylda** toplanıb: `use cache`-ə
 * keçid yalnız buranı dəyişməyi tələb edir.
 *
 * ## Açar quruluşu
 *
 * `unstable_cache` açarı funksiyanın mətnindən, `keyParts`-dan və **arqumentlərdən**
 * qurur. Ona görə Zod sxemi arqument kimi ötürülmür (seriallaşdırıla bilməz) —
 * o, closure-da qalır, `keyPrefix` isə endpoint-i fərqləndirir. Yol (`path`)
 * arqumentdir: locale, səhifə nömrəsi və filtrlər onsuz da onun içindədir, yəni
 * hər variant öz keş yazısını alır.
 *
 * ⚠️ Keşlənən funksiya daxilində `cookies()`/`headers()` çağırmaq **dəstəklənmir**
 * (Next sənədi). Bu qat onları onsuz da işlətmir — sorğu yalnız yoldan asılıdır.
 *
 * ## Niyə route fayllarındaki `force-dynamic` qalır
 *
 * Spec 003 tasks.md (T066) onların silinməsini nəzərdə tuturdu, amma ölçmə başqa
 * şey göstərdi və qərar dəyişdi:
 *
 *   1. `unstable_cache` `force-dynamic` ilə **birlikdə işləyir** — eyni `/az`
 *      səhifəsində TTFB 367 ms (soyuq) → 27 ms (isti). Yəni direktiv keşi söndürmür:
 *      o, `fetch()` davranışına aiddir, bu qat isə `axios` + data keşi işlədir.
 *   2. Direktivi silmək route-u statik **etmir**: root `layout.tsx` `cookies()` və
 *      `headers()` oxuyur, ona görə bütün route-lar onsuz da dinamikdir. Bir səhifədə
 *      sınandı — build cədvəlində `ƒ Dynamic` olaraq qaldı.
 *
 * Yəni silmək ölçülən fayda vermir, amma gizli risk yaradır: kimsə gələcəkdə root
 * layout-dakı cookie oxumasını götürsə, səhifələr səssizcə statikləşib HTML-i (tema
 * class-ı ilə birlikdə) keşləməyə başlayardı. Direktiv niyyəti sənədləşdirir və qalır.
 */
import 'server-only'

import { unstable_cache } from 'next/cache'
import type { z } from 'zod'

import { CONTENT_REVALIDATE_SECONDS } from '@/shared/constants/cache'

import { getJson, getJsonOrNull } from './api-client'

type CacheOptions = {
  /** Keş açarının endpoint hissəsi — closure-daki sxemi fərqləndirir. */
  keyPrefix: string
  /** `revalidateTag` üçün etiket; gələcək webhook bunu işlədəcək. */
  tag: string
  /** Saniyə ilə ömür; verilməyəndə məzmun ömrü. */
  revalidate?: number
}

/**
 * Keşlənən `getJson` — modul səviyyəsində **bir dəfə** qurulur və qaytarılan
 * funksiya yolla çağırılır.
 *
 * ```ts
 * const fetchTree = cachedJson(pageTreeSchema, { keyPrefix: 'pages-tree', tag: 'pages' })
 * export function getPagesTree(locale: Locale) {
 *   return fetchTree(`/api/v1/pages/tree?locale=${locale}`)
 * }
 * ```
 */
export function cachedJson<T>(
  schema: z.ZodType<T>,
  { keyPrefix, tag, revalidate = CONTENT_REVALIDATE_SECONDS }: CacheOptions,
): (path: string) => Promise<T> {
  return unstable_cache((path: string) => getJson(path, schema), [keyPrefix], {
    revalidate,
    tags: [tag],
  })
}

/**
 * Detal endpoint-ləri üçün keşlənən variant: `404` → `null`, digər xətalar atılır.
 *
 * `null` da keşlənir — mövcud olmayan slug üçün hər sorğuda API-yə getmək mənasızdır.
 */
export function cachedJsonOrNull<T>(
  schema: z.ZodType<T>,
  { keyPrefix, tag, revalidate = CONTENT_REVALIDATE_SECONDS }: CacheOptions,
): (path: string) => Promise<T | null> {
  return unstable_cache((path: string) => getJsonOrNull(path, schema), [keyPrefix], {
    revalidate,
    tags: [tag],
  })
}
