/**
 * Media ünvanı (spec 002 data-model.md §1, contracts/public-api.md §1; spec 003 D1).
 *
 * `null` → `null`; `http…` → olduğu kimi; nisbi yol → kökdən başlayan **same-origin**
 * yol (`/media/12`).
 *
 * Ünvan `{API_URL}` ilə **birləşdirilmir**: fayllar `src/app/media/[id]/route.ts`
 * proxy-sindən keçir. Üç səbəb (spec 003 D1):
 *   • `next/image` işləyə bilsin — `images.remotePatterns` build-time-dır, `API_URL`
 *     isə runtime dəyişənidir, ikisi bir araya gəlmir;
 *   • brauzer `api-cbar` origin-inə birbaşa getməsin (Maddə XI, research R2);
 *   • fayllar keş başlığı alsın.
 *
 * API-nin qaytardığı mütləq ünvanlar (xarici CDN şəkilləri) toxunulmur.
 */
export function mediaUrl(path: string | null | undefined): string | null {
  if (!path) return null
  if (/^https?:\/\//.test(path)) return path
  return path.startsWith('/') ? path : `/${path}`
}
