import { rm } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath, URL } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type Plugin } from 'vite'

// The MSW worker lives in `public/` so dev and MSW demos can register it, but a
// real deployment never starts MSW — drop it from `dist/` unless the build opts in.
function stripMswWorker(enabled: boolean): Plugin {
  let outDir = 'dist'
  return {
    name: 'strip-msw-worker',
    apply: 'build',
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir)
    },
    async closeBundle() {
      if (enabled) return
      await rm(resolve(outDir, 'mockServiceWorker.js'), { force: true })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), tailwindcss(), stripMswWorker(env.VITE_ENABLE_MSW === 'true')],
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    server: {
      // Port 5174: köhnə `web-cbar-admin` cutover-ə qədər 5173-də qalır (API CORS
      // siyasəti yalnız 5173-ə icazə verir); bu panel `/api`-ni proxy etdiyi üçün
      // eyni mənbədən sorğu göndərir və portu sərbəst seçə bilir. `dev.ps1`/`dev.sh`
      // hər ikisini yan-yana qaldırır.
      port: 5174,
      strictPort: true,
      // Real backend ilə işləyəndə `/api` bu hədəfə proxy olunur (CORS-suz).
      // MSW brauzer worker-i yalnız `VITE_ENABLE_MSW=true` olanda `/api/v1`-i tutur.
      // Redaktordakı `<img src="/media/{id}">` nisbi qalır (saxlanılan HTML mühitdən
      // asılı olmasın deyə); fayl baytlarını ictimai api-cbar verir, ona görə `/media`
      // ayrıca hədəfə (`VITE_MEDIA_PROXY_TARGET`) proxy olunur. Deploy-da proxy yoxdur —
      // orada `VITE_MEDIA_BASE_URL` prefiksi işləyir (`shared/config/runtime-config.ts`).
      proxy:
        env.VITE_API_PROXY_TARGET || env.VITE_MEDIA_PROXY_TARGET
          ? {
              ...(env.VITE_API_PROXY_TARGET && {
                '/api': {
                  target: env.VITE_API_PROXY_TARGET,
                  changeOrigin: true,
                },
              }),
              ...(env.VITE_MEDIA_PROXY_TARGET && {
                '/media': {
                  target: env.VITE_MEDIA_PROXY_TARGET,
                  changeOrigin: true,
                },
              }),
            }
          : undefined,
    },
    // The kit sometimes gets swapped for a local tarball while testing an
    // unpublished build. Without this, Vite pre-bundles it once and keeps serving
    // that copy, so the rebuilt kit looks like it did nothing until `vite --force`.
    optimizeDeps: { exclude: ['@cbar/lib-react-ui-kit'] },
  }
})
