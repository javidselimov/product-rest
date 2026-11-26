import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vitest/config'

// Ayrıca config: Vitest-ə react/tailwind plugin-ləri lazım deyil (esbuild JSX-i
// özü çevirir), jsdom mühiti isə yalnız testlərə aiddir.
export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/shared/testing/setup.ts'],
    css: false,
    // Vitest `test` mode-dadır və `.env.test`-i (deploy TEST API-si) oxuyardı; bu
    // dəyər onu üstələyir — MSW handler-ləri `/api/v1/...` yolları ilə yazılıb.
    env: { VITE_API_URL: '/api/v1', VITE_MEDIA_BASE_URL: '' },
    // Tam paralel qaçışda ağır form testləri (TipTap + kit) 5 s-i keçə bilir;
    // RTL `asyncUtilTimeout` (setup.ts, 5 s) bundan kiçik qalmalıdır.
    testTimeout: 15_000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**'],
      exclude: ['src/shared/testing/**', 'src/**/*.test.*'],
    },
  },
})
