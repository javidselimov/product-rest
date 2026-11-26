/**
 * API konfiqurasiyası — build zamanı sabitlənir (köhnə web-cbar-admin ilə eyni model):
 * hər mühit üçün ayrıca image qurulur, `Dockerfile` `BUILD_ENV`-ə görə
 * `npm run build:<env>` işlədir və Vite uyğun `.env.<env>` faylından `VITE_API_URL`-i
 * bundle-a yazır. Runtime `/config.json` DAHA YOXDUR. `apiUrl` `/api/v1` ilə bitir —
 * servis yolları ona nisbidir.
 *
 * `loadRuntimeConfig()` / `getRuntimeConfig()` imzaları saxlanılıb: bootstrap
 * (main.tsx), interceptor-lar və testlər onları çağırır.
 */

import { z } from 'zod'

const runtimeConfigSchema = z.looseObject({
  urls: z.looseObject({
    apiUrl: z.string().min(1),
    // İctimai api-cbar kökü — redaktordakı nisbi `/media/{id}` göstərilərkən ona
    // əlavə olunur. Boş = eyni mənbə (lokalda Vite `/media`-nı proxy edir). Sonda `/` yoxdur.
    mediaBaseUrl: z.string(),
    // The public site's root (spec 060, "Saytda bax" on the org chart). Empty = the link is hidden. No trailing `/`.
    siteUrl: z.string(),
  }),
})

export type RuntimeConfig = z.infer<typeof runtimeConfigSchema>

let config: RuntimeConfig | null = null

const fromBuild = (): RuntimeConfig =>
  runtimeConfigSchema.parse({
    urls: {
      apiUrl: import.meta.env.VITE_API_URL ?? '/api/v1',
      mediaBaseUrl: (import.meta.env.VITE_MEDIA_BASE_URL ?? '').replace(
        /\/+$/,
        '',
      ),
      siteUrl: (import.meta.env.VITE_SITE_URL ?? '').replace(/\/+$/, ''),
    },
  })

/** Bootstrap-da, router yaranmazdan ƏVVƏL çağırılır (main.tsx). */
export async function loadRuntimeConfig(): Promise<RuntimeConfig> {
  config = fromBuild()
  return config
}

export function getRuntimeConfig(): RuntimeConfig {
  if (!config) {
    throw new Error(
      'Runtime config yüklənməyib — loadRuntimeConfig() bootstrap-da çağırılmalıdır',
    )
  }
  return config
}

/** Yalnız testlər üçün. */
export function resetRuntimeConfig(): void {
  config = null
}
