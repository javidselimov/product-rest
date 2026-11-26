import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vitest/config'

// Ayrıca config: Vitest-ə Next plugin-i lazım deyil (esbuild JSX-i özü çevirir),
// jsdom mühiti isə yalnız testlərə aiddir.
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      // `import 'server-only'` Next-də build sərhədidir; testdə boş moduldur.
      'server-only': fileURLToPath(new URL('./src/shared/testing/server-only-stub.ts', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    globals: false,
    setupFiles: ['./src/shared/testing/setup.ts'],
    css: false,
    // ESLint-i yükləyən lint-rules testi soyuq başlanğıcda 5 s-i keçə bilər.
    testTimeout: 15_000,
    coverage: {
      provider: 'v8',
      // `lcov` CI artefaktıdır (Sonar onu oxuyur), `text` isə terminal xülasəsi.
      reporter: ['text', 'lcov'],
      reportsDirectory: 'coverage',
      // Uğursuz qaçışda da hesabat yazılır — CI artefaktı boş qalmasın.
      reportOnFailure: true,
      include: ['src/**', 'scripts/**'],
      exclude: [
        // Test infrastrukturu və testlərin özü ölçülmür.
        'src/shared/testing/**',
        '**/*.test.*',
        // Nazik route faylları: məntiq `views` layer-indədir (Maddə IV.2).
        'src/app/**/{layout,loading,error,not-found,page}.tsx',
        'src/**/*.d.ts',
      ],
    },
  },
})
