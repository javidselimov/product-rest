import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

/*
 * Baza qat `web-cbar` formatındadır; onun üzərindəki **konstitusiya qatı**
 * qaydaları avtomatik icra edir (R-010). Sənədə güvənmək kifayət deyil —
 * SC-004 «6/6 pozuntu tutulur» yalnız gate avtomatik olduqda ödənir.
 *
 * İki qeyd:
 *
 * 1. `no-restricted-syntax` və `no-restricted-imports` config obyektləri arasında
 *    **birləşmir** — sonuncu qalib gəlir. Ona görə aşağıdakı obyektlərin fayl
 *    dəstləri qəsdən kəsişməyəcək şəkildə qurulub və hər biri qadağan siyahısını
 *    tam təkrarlayır.
 *
 * 2. Qat istiqaməti (Maddə IV.5) `import/no-restricted-paths` yerinə
 *    `no-restricted-imports` pattern-ləri ilə icra olunur: həmin qayda faylı
 *    diskdə həll etməyə çalışır və `eslint-config-next`-in daxilindəki
 *    `eslint-import-resolver-typescript` köhnə plugin interfeysini dəstəkləmir
 *    («invalid interface loaded as resolver»). Pattern yanaşması resolver tələb
 *    etmir və burada tam əhatəlidir, çünki qat-arası import **yalnız** `@/…`
 *    alias-ı ilə yazılır (dərin nisbi import onsuz da qadağandır).
 */

// ── Maddə II: qadağan dependency-lər ─────────────────────────────────────────

const QADAGAN_PAKETLER = [
  {
    name: '@cbar/lib-react-ui-kit',
    message:
      'Barrel import qadağandır (Maddə III.2) — yalnız subpath: @cbar/lib-react-ui-kit/button',
  },
  { name: 'clsx', message: 'Class-merge kitabxanası qadağandır (Maddə II) — kit onu ödəyir.' },
  {
    name: 'classnames',
    message: 'Class-merge kitabxanası qadağandır (Maddə II) — kit onu ödəyir.',
  },
  {
    name: 'class-variance-authority',
    message: 'Variant kitabxanası qadağandır (Maddə II) — kit onu ödəyir.',
  },
  {
    name: 'lucide-react',
    message: 'Icon kitabxanası qadağandır (Maddə II) — @cbar/lib-react-ui-kit/icons işlət.',
  },
  { name: 'date-fns', message: 'Date kitabxanası qadağandır (Maddə II) — Intl API kifayətdir.' },
  { name: 'dayjs', message: 'Date kitabxanası qadağandır (Maddə II) — Intl API kifayətdir.' },
  { name: 'moment', message: 'Date kitabxanası qadağandır (Maddə II) — Intl API kifayətdir.' },
  {
    name: 'next-intl',
    message: 'i18n yığını kilidlidir (Maddə II): react-i18next. Dəyişiklik spec tələb edir.',
  },
  {
    name: 'next-auth',
    message: 'Auth yığını kilidlidir (Maddə II, R-003): httpOnly cookie + /api/session.',
  },
  {
    name: 'i18next-browser-languagedetector',
    message: 'Dil URL-dən gəlir (R-004) — detector iki mənbə yaradır.',
  },
]

/** Maddə IV.9 — paket həmişə adı ilə gətirilir, `node_modules` yolu ilə yox. */
const NODE_MODULES_QADAGASI = {
  group: ['**/node_modules', '**/node_modules/**'],
  message:
    '`node_modules`-a yol ilə import qadağandır (Maddə IV.9) — paketin adını yaz: `react-i18next`, `@cbar/lib-react-ui-kit/button`.',
}

const QADAGAN_QRUPLAR = [
  NODE_MODULES_QADAGASI,
  {
    group: ['@radix-ui/*', 'radix-ui'],
    message: 'Radix birbaşa gətirilmir (Maddə II) — kit onu vendor edib.',
  },
  {
    group: ['../../*'],
    message: 'Dərin nisbi import qadağandır (Maddə IV.8) — `@/*` alias-ından istifadə et.',
  },
]

/** Prezentasiya qatında əlavə olaraq birbaşa HTTP qadağandır (Maddə IV.6). */
const HTTP_QADAGASI =
  'Komponentdə birbaşa HTTP qadağandır (Maddə IV.6) — sorğu feature-in api/ qatından və query hook-undan keçir.'

const QADAGAN_HTTP = [
  { name: 'axios', message: HTTP_QADAGASI },
  { name: '@/shared/api/api-client', message: HTTP_QADAGASI },
]

const QADAGAN_GLOBALLAR = [
  { name: 'fetch', message: HTTP_QADAGASI },
  { name: 'XMLHttpRequest', message: HTTP_QADAGASI },
]

// ── Maddə IV.5 / XI.2: qat istiqaməti ────────────────────────────────────────

const QAT_MESAJI = (qat) =>
  `Qat istiqaməti pozulub (Maddə IV.5): \`${qat}\` yalnız aşağı qatlardan import edə bilər — app → views → widgets → features → entities → shared.`

const SERVER_MESAJI =
  'src/server/* server-only-dur (Maddə XI.2) — client kodundan import edilə bilməz; sərhəd yalnız route handler və ya server komponenti ilə keçilir.'

/** `@/x` və `@/x/...` — hər ikisi tutulur. */
const qatQrupu = (qatlar, message) => ({
  group: qatlar.flatMap((q) => [`@/${q}`, `@/${q}/*`]),
  message,
})

/** Hər qatın görə bilmədiyi yuxarı qatlar. `server` hamı üçün bağlıdır. */
const QAT_QADAGASI = {
  shared: ['app', 'providers', 'shell', 'views', 'widgets', 'features', 'entities'],
  entities: ['app', 'providers', 'shell', 'views', 'widgets', 'features'],
  features: ['app', 'providers', 'shell', 'views', 'widgets'],
  widgets: ['app', 'providers', 'shell', 'views'],
  views: ['app', 'providers', 'shell'],
  shell: ['app'],
  providers: ['app'],
}

// ── Maddə III.3 / X.1 / VIII.2: məzmun qadağaları ────────────────────────────

const PALITRA =
  'red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|neutral|stone'

const MEZMUN_QAYDALARI = [
  {
    selector: String.raw`Literal[value=/\b(bg|text|border|ring|from|via|to|fill|stroke|outline|decoration|shadow|accent|caret|divide|placeholder)-(${PALITRA})-\d{2,3}\b/]`,
    message:
      'Palitra rəng sinifləri (bg-blue-600 və s.) qadağandır (Maddə III.3) — yalnız semantik tokenlər: bg-background, text-muted-foreground, bg-primary…',
  },
  {
    selector: String.raw`Literal[value=/#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?\b/]`,
    message:
      'Hərfi rəng dəyəri (#hex) qadağandır (Maddə III.3) — yalnız semantik tokenlərdən istifadə et.',
  },
  {
    selector: String.raw`Literal[value=/\b(rgb|rgba|hsl|hsla|oklch|oklab)\s*\(/]`,
    message:
      'Hərfi rəng funksiyası (rgb(), oklch()…) qadağandır (Maddə III.3) — yalnız semantik tokenlərdən istifadə et.',
  },
  {
    selector: 'JSXAttribute[name.name="dangerouslySetInnerHTML"]',
    message:
      'dangerouslySetInnerHTML qadağandır (Maddə X.1) — React-in default escaping-i sıradan çıxarılmır.',
  },
  {
    selector: 'NewExpression[callee.name="Function"]',
    message: 'String-dən funksiya yaratmaq qadağandır (Maddə X.1).',
  },
  {
    selector:
      'MemberExpression[object.object.name="process"][object.property.name="env"][property.name=/^NEXT_PUBLIC_/]',
    message:
      'Yeni NEXT_PUBLIC_* dəyişəni bu şablonda yoxdur (Maddə VIII.2, FR-050) — brauzerə çıxan konfiqurasiya yalnız spec ilə əlavə olunur; secret heç vaxt NEXT_PUBLIC_* olmur.',
  },
  {
    selector: 'Literal[value=/^NEXT_PUBLIC_/]',
    message:
      'Yeni NEXT_PUBLIC_* dəyişəni bu şablonda yoxdur (Maddə VIII.2, FR-050) — secret heç vaxt brauzer bundle-ına düşmür.',
  },
]

/** Maddə I.2 — UI-də görünən heç bir string hardcoded ola bilməz. */
const HARDCODED_METN = {
  // Yalnız hərf saxlayan mətn düyünləri: `404`, `·` və boşluq buraya düşmür.
  selector: 'JSXText[value=/[A-Za-z]/]',
  message:
    'Hardcoded UI mətni qadağandır (Maddə I.2) — mətn i18n açarından gəlir: {t("namespace:key")}.',
}

const QALEREYA = ['src/views/components/**/*.{ts,tsx}']
const TESTLER = ['src/**/*.test.{ts,tsx}', 'src/shared/testing/**/*.{ts,tsx}']

// ── Maddə XII: sabitlər (spec 032) ───────────────────────────────────────────

/**
 * Sabitlərin öz faylları — burada rəqəm yazmaq məhz məqsəddir. `shared/lib/xlsx`
 * zip/xlsx bayt formatıdır (siqnaturlar, ofsetlər) və fayl başında səbəbli
 * `eslint-disable` daşıyır.
 */
const SABIT_FAYLLARI = ['src/shared/constants/**/*.ts', 'src/**/constants.ts', 'src/shared/lib/xlsx/**/*.ts']

/**
 * `0 1 -1 2 100` adsız qala bilər (indeks, işarə, cüt/tək, faiz); qalan hər rəqəm
 * — obyekt dəyərləri daxil (`detectObjects`) — adlı sabitdir və `constants`
 * faylındadır. Testlərdə fikstür rəqəmləri sərbəstdir (Maddə XII.5).
 */
const SABIT_QAYDASI = [
  'error',
  {
    ignore: [0, 1, -1, 2, 100],
    ignoreArrayIndexes: true,
    ignoreEnums: true,
    ignoreNumericLiteralTypes: true,
    ignoreReadonlyClassProperties: true,
    ignoreTypeIndexes: true,
    enforceConst: true,
    detectObjects: true,
  },
]

/** Server modullarının öz testləri — sərhədin bu tərəfindədirlər. */
const SERVER_TESTLERI = [
  'src/proxy.test.ts',
  'src/server/**/*.test.ts',
  'src/app/**/*.test.{ts,tsx}',
]

/** Bir qat üçün tam `no-restricted-imports` konfiqurasiyası. */
function qatQaydasi(qat, { http = false } = {}) {
  const yuxari = QAT_QADAGASI[qat] ?? []

  return [
    'error',
    {
      paths: http ? [...QADAGAN_PAKETLER, ...QADAGAN_HTTP] : QADAGAN_PAKETLER,
      patterns: [
        ...QADAGAN_QRUPLAR,
        ...(yuxari.length > 0 ? [qatQrupu(yuxari, QAT_MESAJI(qat))] : []),
        qatQrupu(['server'], SERVER_MESAJI),
      ],
    },
  ]
}

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'coverage/**',
    'next-env.d.ts',
    // MSW-nin postinstall ilə yaratdığı worker faylı — vendor kodu, redaktə edilmir.
    'public/mockServiceWorker.js',
    // Müyəssərlik widget-inin yoxlanmış surəti (spec 007) — vendor kodu, redaktə edilmir.
    'public/vendor/**',
  ]),

  // ── Maddə XII: magic number yoxdur ────────────────────────────────────────
  // Ayrı qaydadır, ona görə `no-restricted-*` obyektlərinin fayl dəstləri ilə
  // kəsişməsi problem yaratmır (yuxarıdakı 1-ci qeyd yalnız eyni qaydaya aiddir).
  {
    name: 'konstitusiya/sabitler',
    files: ['src/**/*.{ts,tsx}'],
    ignores: [...TESTLER, ...SABIT_FAYLLARI],
    rules: {
      'no-magic-numbers': 'off',
      '@typescript-eslint/no-magic-numbers': SABIT_QAYDASI,
    },
  },

  // ── Məzmun qaydaları (hardcoded mətn DAXİL) ────────────────────────────────
  {
    name: 'konstitusiya/mezmun',
    files: ['src/**/*.{ts,tsx}'],
    ignores: [...QALEREYA, ...TESTLER],
    rules: {
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-restricted-syntax': ['error', ...MEZMUN_QAYDALARI, HARDCODED_METN],
    },
  },

  // Qalereyada variant adları (`solid`, `red`) kit-in API-sidir və tərcümə
  // olunmur; testlərdə isə görünən mətn assertion-un özüdür.
  {
    name: 'konstitusiya/mezmun-istisna',
    files: [...QALEREYA, ...TESTLER],
    rules: {
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-restricted-syntax': ['error', ...MEZMUN_QAYDALARI],
    },
  },

  // ── Qat-qat import qadağaları ─────────────────────────────────────────────
  {
    name: 'konstitusiya/import-app',
    files: ['src/app/**/*.{ts,tsx}', 'src/proxy.ts', 'src/instrumentation.ts'],
    rules: {
      // Route qatı `src/server`-i görə bilər — sərhəd məhz burada keçilir.
      'no-restricted-imports': [
        'error',
        { paths: QADAGAN_PAKETLER, patterns: QADAGAN_QRUPLAR },
      ],
    },
  },
  {
    name: 'konstitusiya/import-views',
    files: ['src/views/**/*.{ts,tsx}'],
    ignores: [...QALEREYA, ...TESTLER],
    rules: {
      'no-restricted-imports': qatQaydasi('views', { http: true }),
      'no-restricted-globals': ['error', ...QADAGAN_GLOBALLAR],
    },
  },
  {
    name: 'konstitusiya/import-qalereya',
    files: QALEREYA,
    rules: {
      'no-restricted-imports': qatQaydasi('views', { http: true }),
      'no-restricted-globals': ['error', ...QADAGAN_GLOBALLAR],
    },
  },
  {
    name: 'konstitusiya/import-widgets',
    files: ['src/widgets/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': qatQaydasi('widgets', { http: true }),
      'no-restricted-globals': ['error', ...QADAGAN_GLOBALLAR],
    },
  },
  {
    name: 'konstitusiya/import-shell',
    files: ['src/shell/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': qatQaydasi('shell', { http: true }),
      'no-restricted-globals': ['error', ...QADAGAN_GLOBALLAR],
    },
  },
  {
    name: 'konstitusiya/import-providers',
    files: ['src/providers/**/*.{ts,tsx}'],
    rules: { 'no-restricted-imports': qatQaydasi('providers') },
  },
  {
    name: 'konstitusiya/import-features',
    files: ['src/features/**/*.{ts,tsx}'],
    ignores: TESTLER,
    rules: { 'no-restricted-imports': qatQaydasi('features') },
  },
  {
    name: 'konstitusiya/import-entities',
    files: ['src/entities/**/*.{ts,tsx}'],
    rules: { 'no-restricted-imports': qatQaydasi('entities') },
  },
  {
    name: 'konstitusiya/import-shared',
    files: ['src/shared/**/*.{ts,tsx}'],
    ignores: ['src/shared/testing/**/*.{ts,tsx}', 'src/**/*.test.{ts,tsx}'],
    rules: { 'no-restricted-imports': qatQaydasi('shared') },
  },

  // Server-only məlumat qatı (spec 002 research D6): `features/*/api` və
  // `views/*/loader.ts` faylları `import 'server-only'` ilə işarələnir və yalnız
  // serverdə işləyir, ona görə `@/server/*`-i (env, api-client) görə bilər. Qat
  // istiqaməti və paket qadağaları olduğu kimi qalır.
  {
    name: 'konstitusiya/server-only-features',
    files: ['src/features/**/api/**/*.ts'],
    ignores: TESTLER,
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: QADAGAN_PAKETLER,
          patterns: [...QADAGAN_QRUPLAR, qatQrupu(QAT_QADAGASI.features, QAT_MESAJI('features'))],
        },
      ],
    },
  },
  {
    name: 'konstitusiya/server-only-loaders',
    files: ['src/views/**/loader.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [...QADAGAN_PAKETLER, ...QADAGAN_HTTP],
          patterns: [...QADAGAN_QRUPLAR, qatQrupu(QAT_QADAGASI.views, QAT_MESAJI('views'))],
        },
      ],
      'no-restricted-globals': ['error', ...QADAGAN_GLOBALLAR],
    },
  },

  // Test infrastrukturu qatları qəsdən görür: `handlers/` və `factories.ts`
  // domain tiplərini işlədir. Bu, məhsul kodu deyil və bundle-a düşmür, ona görə
  // qat qaydası burada yumşaldılır — paket qadağaları isə qalır.
  {
    name: 'konstitusiya/testler',
    files: TESTLER,
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: QADAGAN_PAKETLER,
          patterns: [...QADAGAN_QRUPLAR, qatQrupu(['server'], SERVER_MESAJI)],
        },
      ],
    },
  },

  // Server modullarının testləri sərhədin server tərəfindədir: `proxy.test.ts`
  // sessiya cookie-sinin adını məhz `@/server/session`-dan oxumalıdır, əks halda
  // ad ikiləşərdi. Bu obyekt yuxarıdakı test obyektindən SONRA gəlir ki, üstələsin.
  {
    name: 'konstitusiya/server-testleri',
    files: SERVER_TESTLERI,
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: QADAGAN_PAKETLER,
          // Dərin nisbi qadağası burada tətbiq olunmur: `headers.test.ts`
          // repo kökündəki `next.config.ts`-i oxumalıdır və `@/*` alias-ı
          // yalnız `src/`-ə çatır. Qayda qatlar arasıdır, kök konfiqurasiya
          // faylı isə qat deyil.
          patterns: QADAGAN_QRUPLAR.filter((q) => !q.group.includes('../../*')),
        },
      ],
    },
  },

  // Skriptlər: yalnız paket qadağaları (qat anlayışı onlara aid deyil).
  {
    name: 'konstitusiya/skriptler',
    files: ['scripts/**/*.mjs'],
    rules: {
      'no-restricted-imports': [
        'error',
        { paths: QADAGAN_PAKETLER, patterns: [NODE_MODULES_QADAGASI, { group: ['@radix-ui/*'] }] },
      ],
    },
  },
])

export default eslintConfig
