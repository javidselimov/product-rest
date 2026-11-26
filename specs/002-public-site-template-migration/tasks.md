---

description: "Task list — public saytın nextjs-template UI kiti üzərində yenidən qurulması"
---

# Tasks: Public saytın (`web-cbar`) `nextjs-template` UI kiti üzərində yenidən qurulması

**Input**: Design documents from `/specs/002-public-site-template-migration/`

**Prerequisites**: plan.md, spec.md, research.md (R1–R14), data-model.md, contracts/ (public-api.md, routes.md, runtime-config.md), quickstart.md

**Tests**: Daxildir — spec FR-030 / SC-005 və template konstitusiyası Maddə VI hər səhifə bölməsi üçün real-davranış testi tələb edir. View-lar prop-la `renderApp` ilə, loader-lər MSW (node) ilə, server tərəfli modullar birbaşa çağırışla test olunur (research R11); mock davranışını assert etmək qadağandır.

**Organization**: Faza 1–2 təməl (bütün hekayələri bloklayır), Faza 3–7 spec-in US1–US5 hekayələri prioritet sırası ilə, Faza 8 cilalama, deploy və root orkestrasiya.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Paralel işlənə bilər (fərqli fayllar, tamamlanmamış task-a asılılıq yoxdur)
- **[Story]**: US1–US5 (spec.md hekayələri)
- Hər task-da dəqiq fayl yolu var

## Path Conventions

- Yeni sayt: `web-cbar-next/` (kopya `nextjs-template/`-dən). Bütün `src/…` yolları bu qovluğa nisbidir.
- Root orkestrasiya: `dev.ps1`, `dev.sh`, `GUIDE.md`, `CLAUDE.md`, `api-cbar-admin/CREDENTIALS.md` (repository root).
- Köhnə `web-cbar/` və `nextjs-template/` **dəyişdirilmir**; `product-host/` yalnız oxunur.
- Kit importları yalnız subpath (`@cbar/lib-react-ui-kit/<component>`); rənglər yalnız semantik; UI mətnləri yalnız `t()`; `'use client'` yalnız plan.md-də sadalanan komponentlərdə; API çağırışı yalnız `features/*/api` (server-only); AZ hərfli fayllar yalnız UTF-8 qoruyan alətlərlə (Write/Edit) yazılır.
- Hər faza `cd web-cbar-next && npm run verify` ilə bitir.

---

## Phase 1: Setup (kopya, təmizləmə, konfiqurasiya)

**Purpose**: `nextjs-template` → `web-cbar-next`; demo domain və sessiya qatı silinir; placeholder-lər, kit, ECharts, env və deploy konfiqləri (research R1, R12; contracts/runtime-config.md)

- [X] T001 `nextjs-template/` qovluğunu `web-cbar-next/` kimi kopyala (`node_modules`, `coverage`, `tsconfig.tsbuildinfo`, `.next`, `specs/001-*`, `specs/002-*` istisna; `vendor/cbar-lib-react-ui-kit-0.4.0.tgz` daxil); `web-cbar-next/package.json` `name`-i `web-cbar-next`, `version` `0.1.0`, `dev` skriptini `next dev -p 3001` et (`start` və Dockerfile `3000` qalır)
- [X] T002 `web-cbar-next/` daxilində `npm run setup` ilə placeholder-ləri doldur (research R1): `PROJECT_NAME=web-cbar-next`, `PROJECT_DISPLAY_NAME` bank adı, `API_HOST_DEV`/`API_HOST_TEST`=`api-cbar-test.e-cbar.az`, `API_HOST_PROD` və `INGRESS_DOMAIN` `web-cbar/.ci-cd`-dən (yoxdursa `TODO(devops)` şərhi ilə placeholder-ə bənzəməyən müvəqqəti dəyər), `NEXUS_*`/`GIT_REPO_URL` `web-cbar-admin-next`-dəki dəyərlər, `CI_TEMPLATE_REF=1.0.0`; `npm run setup:check -- --strict` sıfır qalıq
- [X] T003 [P] Sessiya/giriş qatını sil: `web-cbar-next/src/server/session.ts`, `src/app/api/`, `src/app/[locale]/login/`, `src/app/[locale]/(authed)/` (içindəki `page.tsx`, `loading.tsx`, `error.tsx` ilə birlikdə), `src/features/auth/`, `src/entities/user/`, `src/providers/session-bridge.tsx`, `src/shared/testing/handlers/auth.ts`, `src/locales/{az,en}/auth.json`; `src/app/api/session/route.test.ts` və sessiya testləri ilə birlikdə
- [X] T004 [P] Demo domain-i sil: `web-cbar-next/src/views/{components,overview,projects,reports,settings,team}`, `src/features/{overview,projects,reports,settings,team}`, `src/entities/{project,member}`, `src/widgets/{stats-cards,activity-feed}`, `src/shell/command-palette.tsx`, `src/shared/testing/handlers/{overview,projects,reports,settings,team}.ts`, `src/shared/testing/fixtures/{activity,members,projects}.ts`, `src/locales/{az,en}/{overview,projects,reports,settings,team}.json`, `public/mockServiceWorker.js`, `src/shared/testing/browser.ts`, `docs/how-to-use.md` D-qeydləri (fayl qalır, demo bölmələri silinir)
- [X] T005 Silinən modullara istinadları təmizlə ki, `tsc --noEmit` keçsin: `web-cbar-next/src/shared/i18n/index.ts` (`NAMESPACES` müvəqqəti: common, nav), `src/shared/testing/handlers/index.ts` (boş massiv), `src/shell/nav.ts` (boş `NAV_ITEMS`), `src/shell/sidebar.tsx` və `src/shell/topbar.tsx` (auth/permission/logout importları silinir — T024-də yenidən yazılacaq), `src/providers/app-providers.tsx` (MSW `mockReady` qapısı və `mockEnabled` prop-u silinir), `src/app/[locale]/layout.tsx` (`env.ENABLE_MOCK_API` istinadı silinir), `src/instrumentation.ts` (MSW boot silinir; fayl boş `register()` ilə qalır və ya silinir)
- [X] T006 [P] `web-cbar-next/src/server/env.ts` sxemini contracts/runtime-config.md §1-ə uyğunlaşdır: `API_URL` (`z.url()`, default `http://localhost:5139`), `NODE_ENV`, `TZ`, yeni `CSP_FRAME_SRC` (optional string); `SESSION_COOKIE_NAME`, `ENABLE_MOCK_API` silinir; `src/server/env.test.ts` yenilənir (default-lar, yanlış `API_URL` xətası, `CSP_FRAME_SRC` optional)
- [X] T007 [P] Brend və konfiq: `web-cbar-next/src/shared/config/brand.ts` → `displayName` bank adı (az), `shortName: 'CBAR'`, `templateInfo.enabled: false`, `demoPassword` silinir; `src/shared/config/brand.test.ts` uyğunlaşdırılır; yeni `src/shared/config/contacts.ts` — telefon (`966`, `(+994 12) 966`, `(+994 12) 493 5058`, mətbuat daxili `572`), E-CBAR, onlayn müraciət, sorğu platforması və 6 sosial şəbəkə ünvanları (`web-cbar/src/components/{Header,Footer}.tsx`-dən köçürülür; X hesabı locale-ə görə)
- [X] T008 [P] Statik aktivlər: `web-cbar/public/site/` (loqolar `logo-az.svg`/`logo-en.svg`, fayl ikonları `pdf|xlsx|xls|docx|doc|zip|rar|file.svg`) və `web-cbar/public/favicon*`-ı `web-cbar-next/public/` altına kopyala; template-in demo şəkilləri (varsa) silinir
- [X] T009 Kit və dependency-lər: `cd web-cbar-next && npm run install:public && npm run install:offline` (vendor tarball); `npm install -E echarts@6.1` (spec D1, research R8) → `package-lock.json` yenilənir; `npm run audit` critical/high sıfır; `npm run check:self-contained` keçir
- [X] T010 [P] Deploy konfiqləri: `web-cbar-next/.ci-cd/{dev,test,prod}.yaml` `env` siyahısından `SESSION_COOKIE_NAME` və `ENABLE_MOCK_API` sətirlərini sil, `API_URL` dəyərləri `web-cbar/.ci-cd/*`-dən (`https://api-cbar-test.e-cbar.az` dev/test, prod `TODO(devops)`), hostname sətirləri `TODO(devops)` şərhi ilə; `.ci-cd/base.yaml` `listenPort: 3000` qalır; `Dockerfile` və `.gitlab-ci.yml` dəyişmir (yoxla: `CI_TEMPLATE_REF` əvəzlənib)

**Checkpoint**: `cd web-cbar-next && npm run verify` keçir (boş nav, iki namespace, demo yoxdur).

---

## Phase 2: Foundational (təməl — bütün hekayələri bloklayır)

**Purpose**: Server tərəfli API client + Zod envelope, ortaq entity-lər, URL state, proxy/CSP, i18n namespace-ləri + kit etiketləri, CMS HTML render, səhifələmə widget-i, test infrastrukturu (research R2–R7, R11; data-model.md §1, §7; contracts/routes.md §2, §6, §7)

### 2a — API client və ortaq modellər

- [X] T011 `web-cbar-next/src/server/api-client.ts` (server-only, `import 'server-only'`): axios instansiyası `baseURL: env.API_URL`, `timeout: 20000`, `Accept: application/json`, `withCredentials` yoxdur; `getJson(path, schema)` → Zod parse (`parseOrThrow`), uğursuzluq `AppError{kind:'schema'}`; `getJsonOrNull(path, schema)` → 404-də `null`; digər xətalar `normalizeApiError` ilə `AppError` (research R2); `src/shared/api/api-client.ts`, `src/shared/api/interceptors.ts` və `registerUnauthorizedHandler` silinir, `src/shared/api/app-error.ts` qalır
- [X] T012 [P] `web-cbar-next/src/server/api-client.test.ts` — MSW ilə: uğurlu cavab parse olunur, `passthrough` əlavə sahəni saxlayır, 404 → `null` (`getJsonOrNull`) / `AppError notFound` (`getJson`), sxem uyğunsuzluğu → `kind:'schema'`, 500 → `kind:'server'`, şəbəkə xətası → `kind:'network'`; mesajlarda texniki detal yoxdur
- [X] T013 [P] `web-cbar-next/src/entities/content/model/schemas.ts` — `localeSchema`, `listEnvelope(item)`, `mediaAssetSchema`, `pageAssetSchema` (data-model.md §1), `.passthrough()`; `src/entities/content/model/types.ts` `z.infer` tipləri; `src/entities/content/index.ts` public export
- [X] T014 [P] `web-cbar-next/src/entities/content/lib/{media-url,dates,text,files}.ts` — `mediaUrl(path, apiUrl)` (null/http/nisbi qaydası), `formatDate(iso, locale)` (`az-AZ`/`en-GB`, `Intl.DateTimeFormat`), `stripHtml`, `excerpt(text, n)`, `formatSize(bytes)`, `fileIcon(mimeType|name)` → `/site/{ext}.svg`; `src/entities/content/lib/content-lib.test.ts` (hər helper üçün real nümunələr, o cümlədən AZ hərfli mətn)
- [X] T015 [P] `web-cbar-next/src/entities/page-node/model/schemas.ts` — rekursiv `pageNodeSchema` (`z.lazy`), `src/entities/page-node/lib/tree.ts` — `findChain(tree, slug)`, `hrefFor(chain, locale)`, `flattenTree`; `src/entities/page-node/lib/tree.test.ts` (3 səviyyəli fikstür, tapılmayan slug → `null`)

### 2b — URL state, proxy, CSP

- [X] T016 [P] `web-cbar-next/src/shared/lib/search-params.ts` — `first(value)`, `pageSchema` (`z.coerce.number().int().positive().catch(1)`), `idSchema`, `optionalIdSchema`, `enumParam(values)`, `dateParam` (`YYYY-MM-DD`), `queryParam` (trim), `buildHref(basePath, params, overrides)` (mövcud parametrləri qoruyur, `page` override); `src/shared/lib/search-params.test.ts` (massiv → ilk, yanlış tip → default, `buildHref` sorğu qorunması)
- [X] T017 `web-cbar-next/src/server/security-headers.ts` — template `securityHeaders()`-i genişlət: `img-src 'self' data: {API_URL origin}`, `media-src 'self' {API_URL origin}`, `frame-src https://www.youtube.com https://www.youtube-nocookie.com {CSP_FRAME_SRC}` (research R5, contracts/runtime-config.md §3); `next.config.ts` `headers()` bu funksiyanı çağırır; `src/server/security-headers.test.ts` — direktivlər, `CSP_FRAME_SRC` boş/dolu, `script-src` dəyişməyib
- [X] T018 `web-cbar-next/src/proxy.ts` — sessiya gate və login yönləndirməsini sil; locale qaydası: seqment locale-ə bənzəyirsə ötür, əks halda **həmişə** `/az{path}` (307, sorğu qorunur); `NEXT_LOCALE` cookie oxunmur/yazılmır; `x-locale`, nonce və CSP (T017 mənbələri ilə) template kimi; `matcher` `['/((?!_next|api|.*\\..*).*)']`; `src/proxy.test.ts` — contracts/routes.md §2 cədvəlinin hər sətri + CSP başlığının mövcudluğu

### 2c — i18n və kit etiketləri

- [X] T019 `web-cbar-next/src/locales/{az,en}/` namespace fayllarını contracts/routes.md §6-ya görə yaz: `common`, `nav`, `footer`, `home`, `content`, `finance`, `organization`, `media`, `search`, `errors` (köhnə `web-cbar/src/lib/t.ts` 50 açarı və hər səhifədəki `content` obyektləri paylanır; `dateLocale` `common`-da); `src/shared/i18n/index.ts` `NAMESPACES` və `resources` yenilənir; `src/shared/i18n/key-parity.test.ts` keçir
- [X] T020 [P] `web-cbar-next/src/shared/i18n/server.ts` — `getT(locale, ns)` (`createI18n(locale).getFixedT(null, ns)`, react-i18next-siz, server komponentləri üçün); `src/shared/i18n/server.test.ts` (az/en açar qaytarır, fallback `az`)
- [X] T021 [P] `web-cbar-next/src/shared/i18n/ui-messages.ts` — kit `UIMessages` az/en kataloqu (31 açar: `pagination.*`, `breadcrumb.*`, `sheet.close`, `dialog.close`, `datePicker.clear`, `spinner.label`, `toast.*`, `dataTable.*`, `combobox.*`, `tree.*`, `treeSelect.*`, `upload.*`, `select.clear`, `command.*`); `src/providers/app-providers.tsx`-də `<UIMessagesProvider messages={uiMessages[locale]}>` (`@cbar/lib-react-ui-kit/i18n`) bir dəfə, `locale` prop-u `[locale]/layout.tsx`-dən; `src/shared/i18n/ui-messages.test.ts` (az/en açar pariteti, boş dəyər yoxdur)

### 2d — CMS HTML, səhifələmə, paylaşılan UI

- [X] T022 `web-cbar-next/src/shared/lib/cms-html.ts` — `prepareCmsHtml(html, apiUrl)`: media `href`/`src` → mütləq (`target="_blank"` + `rel="noopener noreferrer"` yalnız yoxdursa) + `sanitizeCmsHtml` (`<script>` blokları, `on*=` atributları, `javascript:` `href`/`src`/`xlink:href` silinir; `<details>`, `<table>`, `<iframe>`, `data-*`, `style` toxunulmur — research R7, spec D2); `src/shared/testing/fixtures/cms-html.ts` legacy fikstür (accordion ×2, table ×1, media link ×1, img ×1, YouTube ×1, iframe ×1, `<script>` ×1, `onclick` ×1, `javascript:` ×1); `src/shared/lib/cms-html.test.ts` — struktur sayları sabit, üç zərərli sinif sıfır, idempotentlik
- [X] T023 `web-cbar-next/src/app/cms-content.css` — köhnə `web-cbar/src/app/globals.css`-in 27 `.cms-content` selektorunu semantik token-larla yenidən yaz (`text-foreground`, `text-primary`, `border-border`, `bg-muted`, `text-muted-foreground`; `.tableWrapper{overflow-x:auto}`, `div[data-youtube-video] iframe{aspect-ratio:16/9}`, `img{max-width:100%}`); `src/app/globals.css` route B blokundan **sonra** `@import './cms-content.css'`; `src/widgets/cms-content/cms-content.tsx` (server komponenti, `<div className="cms-content" dangerouslySetInnerHTML>` — fayl başında ESLint istisna şərhi + `spec 002 D2` istinadı; `apiUrl` `env`-dən); `src/widgets/cms-content/cms-content.test.tsx` (fikstür render, accordion açılır, media keçidi mütləq)
- [X] T024 [P] `web-cbar-next/src/widgets/list-pagination/list-pagination.tsx` — kit `Pagination*` (`@cbar/lib-react-ui-kit/pagination`) + Next `Link`, prop-lar `{ basePath, params, page, total, pageSize }`, `totalPages = max(ceil(total/pageSize),1)`, 1 səhifədə render olunmur, `buildHref` ilə sorğu qorunur; `src/widgets/list-pagination/list-pagination.test.tsx` (keçid `href`-ləri, cari səhifə `aria-current`, az/en etiketləri `UIMessagesProvider`-dən)
- [X] T025 [P] `web-cbar-next/src/shared/ui/` template komponentlərini saxla (`empty-state`, `error-state`, `loading-state`, `page-header`, `route-states`); `error-state.tsx`-ə `errors:*` i18n açarları ilə `AppError kind` → mesaj xəritəsi əlavə et (`contract`, `loadError`, `unexpected`); `src/shared/ui/error-state.test.tsx`
- [X] T026 [P] Test infrastrukturu: `web-cbar-next/src/shared/testing/setup.ts` (`next/headers` mock-u üçün köməkçi `mockRequestHeaders(locale)`), `src/shared/testing/render.tsx` (`renderApp(ui, {locale, theme})` `UIMessagesProvider` ilə), `src/shared/testing/handlers/index.ts` (feature handler-ləri üçün boş barrel, hər feature öz faylını əlavə edir), `src/shared/testing/factories.ts` (`make<Entity>` skeleti); `src/shared/testing/smoke.test.ts` keçir

**Checkpoint**: `npm run verify` keçir; `src/app/[locale]/page.tsx` müvəqqəti boş view render edir; proxy, CSP, cms-html, search-params, i18n testləri yaşıl.

---

## Phase 3: User Story 1 — Sayt qabığı, naviqasiya və dil (Priority: P1) 🎯 MVP

**Goal**: Prefikssiz yönləndirmə, CMS ağacından mega-menyu (8 görünən + "daha çox", 3 səviyyə, `FEATURE_ROUTES`, `navUrl`), başlıq (loqo, axtarış, 966, dil, tema, E-CBAR), mobil çekmecə, altlıq, 404/loading/error, işıqlı/qaranlıq tema — real ağacla (spec US1, FR-005–FR-012; research R5, R9, R13; contracts/routes.md §1–§3)

**Independent Test**: quickstart §4 ssenari 1–5: `/` → `/az`, hər üst bölməyə keçid, `/az/laws?type=law&page=2`-də EN → `/en/laws?type=law&page=2`, `/az/yoxdur` → kit 404, 400px-də Sheet, tema toggle + yenilə.

- [X] T027 [P] [US1] `web-cbar-next/src/features/pages/model/schemas.ts` (`pageDetailSchema`, `pageNodeSchema` re-export) və `src/features/pages/api/pages.api.ts` (server-only): `getPagesTree(locale)` → `/api/v1/pages/tree?locale`, `getPage(locale, slug)` → `/api/v1/pages/{slug}?locale` (`getJsonOrNull`); `src/shared/testing/handlers/pages.ts` + `fixtures/pages.ts` (3 səviyyəli ağac ≥ 9 üst bölmə, `navUrl`-lu node, `FEATURE_ROUTES` slug-ları); `src/features/pages/api/pages.api.test.ts`
- [X] T028 [P] [US1] `web-cbar-next/src/shell/nav.ts` — `FEATURE_ROUTES` (6 slug cütü, contracts/routes.md §3), `VISIBLE_SECTIONS=8`, `MAX_DEPTH=3`, `navFor(node, locale)`, `buildNavSections(tree, locale)` → `{visible, overflow}`, `NAV_SECTION_TITLES` allowlist + `footerSections(tree)` (fallback ilk 6); `src/shell/nav.test.ts` (üstünlük sırası `navUrl` → feature → slug, xarici keçid, 9-cu bölmə overflow-da, dərinlik kəsimi, footer allowlist/fallback)
- [X] T029 [US1] `web-cbar-next/src/shell/mega-menu.tsx` (server): `<nav aria-label>` → `<ul>` → bölmə `<li class="group">` + `<a>`; alt səviyyələr `group-hover:`/`group-focus-within:` flyout (`bg-popover text-popover-foreground border-border shadow-md`), 3 səviyyə, "daha çox" flyout-u `nav:more`; klaviatura ilə fokus zənciri (research R9, D4); `src/shell/mega-menu.test.tsx` (bölmə sayı, keçid `href`-ləri, xarici keçid `rel`, `t` etiketləri)
- [X] T030 [P] [US1] `web-cbar-next/src/shell/header-search.tsx` (`'use client'`, kit `Input` + `IconButton`, GET forma `action=/{locale}/search` `name="q"`), `src/shell/language-switcher.tsx` (template-dən uyğunlaşdırılır: `usePathname` + `useSearchParams` ilə locale seqmentini dəyişir, sorğu qorunur, yalnız digər dil görünür, `rememberLocale` silinir), `src/shell/theme-toggle.tsx` (template `ThemeToggle` ayrılır); `src/shell/language-switcher.test.tsx` (sorğu qorunur, yalnız digər dil), `src/shell/header-search.test.tsx`
- [X] T031 [P] [US1] `web-cbar-next/src/shell/mobile-nav.tsx` (`'use client'`): kit `Sheet` (`@cbar/lib-react-ui-kit/sheet`) + `Accordion` ilə tam ağac (3 səviyyə), dil və tema düymələri çekmecədə; `src/shell/mobile-nav.test.tsx` (açılır, ağac render olunur, keçid bağlayır, `sheet.close` etiketi az/en)
- [X] T032 [US1] `web-cbar-next/src/shell/site-header.tsx` (server): loqo `Link` (`/site/logo-{locale}.svg`, `next/image` və ya `<img>`), `HeaderSearch`, `tel:966` keçidi, `LanguageSwitcher`, `ThemeToggle`, E-CBAR `Button asChild` (contacts.ts), `MegaMenu`, `MobileNav`; `src/shell/site-header.test.tsx` (az/en etiketlər, hardcoded mətn yoxdur)
- [X] T033 [P] [US1] `web-cbar-next/src/shell/site-footer.tsx` (server): `footerSections(tree)` keçidləri, əlaqə bloku (ünvan i18n, telefonlar contacts.ts), onlayn müraciət / sorğu `Button asChild`, 6 sosial keçid (kit `icons`-da varsa kit ikonları, yoxdursa `currentColor` inline SVG — ikon kitabxanası yox), kit `Separator`, müəlliflik `footer:allRightsReserved` + il; `src/shell/site-footer.test.tsx` (allowlist bölmələri, fallback, sosial `rel="noopener"`)
- [X] T034 [US1] `web-cbar-next/src/shell/site-shell.tsx` — `SiteShell{locale, tree, children}` = `SiteHeader` + `<main id="content">` + `SiteFooter` (+ `nav:skipToContent` keçidi); `src/app/[locale]/layout.tsx` (server): `params` await, `isSupportedLocale` yoxsa `notFound()`, `getPagesTree(locale)` `try/catch` → `[]`, `I18nProvider` → `AppProviders{theme, locale}` → `SiteShell`; `src/shell/sidebar.tsx`, `src/shell/topbar.tsx`, `src/shell/app-shell.tsx` silinir
- [X] T035 [P] [US1] Route vəziyyət faylları: `web-cbar-next/src/app/[locale]/loading.tsx` (`RouteLoading`), `src/app/[locale]/error.tsx` (`RouteError`, `'use client'`, `reset`), `src/app/[locale]/not-found.tsx` → `views/not-found/index.tsx` (kit `EmptyState` + ana səhifə `Button asChild`, `errors:notFound.*`), `src/app/not-found.tsx` (dəstəklənməyən locale — iki dildə statik mətn, fayl səviyyəli ESLint istisnası); `src/views/not-found/index.test.tsx` (az/en)
- [X] T036 [US1] `web-cbar-next/src/app/layout.tsx` — template `html lang/class` (tema cookie) + `metadata` (`title: brand.displayName`, `icons`); `src/app/[locale]/page.tsx` müvəqqəti `HomeView` yer tutucusu (T045-də əvəz olunur); `src/app/theme-ssr.test.tsx` və `src/app/headers.test.ts` template-dən keçir; `src/shell/accessibility.test.tsx` yeni qabıq üçün yenilənir (landmark-lar: `banner`, `navigation`, `main`, `contentinfo`)
- [X] T037 [US1] Əl icrası (quickstart §4 ssenari 1–5) real `api-cbar` ilə (`dev.ps1`, `http://localhost:3001`): yönləndirmə cədvəli, menyu keçidləri köhnə saytla eyni, dil dəyişikliyi sorğu qoruyur, Sheet, tema; konsolda hydration xəbərdarlığı və CSP pozuntusu yoxdur; `npm run verify`

**Checkpoint**: US1 tam işləkdir — sayt açılır, gəzilir, 404 və tema işləyir. MVP.

---

## Phase 4: User Story 2 — Ana səhifə (Priority: P1)

**Goal**: Köhnə ana səhifənin 8 paralel sorğusu + əvvəlki vərəq trendi + featured excerpt; slayder, məzənnə/dəhliz/inflyasiya/pul bazarı/gəlirlik kartları (qrafiklər ECharts + kit token-ları), xəbər/media tabları, məlumat vidjetləri, nəşrlər, keçidlər; blok xətası kartda `ErrorState` (spec US2, FR-020, FR-021; research R8, R14; contracts/public-api.md §3 `/`)

**Independent Test**: quickstart §4 ssenari 6–7 və 18: `/az` bütün bloklar köhnə ilə eyni məlumat; `api-cbar` dayandırılanda qabıq qalır, kartlar xəta göstərir; `logs/api-web.log`-da sorğu çoxluğu köhnə ilə eyni.

### 4a — Feature API-ləri (ana səhifənin ehtiyacı olan, digər hekayələrdə də istifadə olunur)

- [X] T038 [P] [US2] `web-cbar-next/src/features/homepage/{model/schemas.ts,api/homepage.api.ts}` — `Homepage` sxemi (data-model.md §4, alias sabitləri `INFO_LINE_ALIASES`), `getHomepage(locale)`; `src/shared/testing/handlers/homepage.ts` + `fixtures/homepage.ts` (banner `description`-lı/-sız, slayder ×3, bütün alias-lar); `src/features/homepage/api/homepage.api.test.ts`
- [X] T039 [P] [US2] `web-cbar-next/src/features/currencies/{model/schemas.ts,api/currencies.api.ts}` — `CurrencySheet`, `getCurrencies(locale, date?)` (`&date=` yalnız truthy, `getJsonOrNull`), `xmlFeedUrl(date)` → `{API_URL}/currencies/DD.MM.YYYY.xml`, `previousSheet(locale, date)` (1–5 gün geri, ilk tapılan — research R14), `rateTrend(current, previous)`; handler + fikstür; `src/features/currencies/api/currencies.api.test.ts` (date parametri, 404 → null, geri axtarış 5-dən çox sorğu etmir)
- [X] T040 [P] [US2] `web-cbar-next/src/features/press-releases/{model/schemas.ts,api/press-releases.api.ts}` — `getPressReleases(locale, page=1, pageSize=10, type?)` (`&type=` yalnız `!= null`), `getPressRelease(locale, slug)`; handler (+ `slug === 'yoxdur'` → 404) + fikstür; test
- [X] T041 [P] [US2] `web-cbar-next/src/features/stats/{model/schemas.ts,api/stats.api.ts}` — `getAzir(from?, to?, term?)` (`?` yalnız parametr varsa, `locale` yoxdur), `getInflation(year?)`, `getYieldCurveLatest()`, `getYieldCurve(date)`; `src/features/stats/model/series.ts` — `azirSeries(values, terms?)`, `inflationSeries(values, dateLocale)`, `yieldSeries(curve)` → `ChartSeries[]` (köhnə `web-cbar/src/app/[locale]/statistics/page.tsx` və `components/home/*Card.tsx` məntiqi); handler + fikstür; `src/features/stats/model/series.test.ts` + api testi
- [X] T042 [P] [US2] `web-cbar-next/src/features/media/{model/schemas.ts,api/media.api.ts}` — `getGalleries(locale, page=1, pageSize=10)`, `getGallery(locale, id)`, `getVideos(...)`, `getVideoStreams(locale)`, `youtubeId(url)` helper (köhnə `media/page.tsx`-dən); handler + fikstür; test

### 4b — Widget-lər

- [X] T043 [P] [US2] `web-cbar-next/src/widgets/chart-card/chart.tsx` (`'use client'`): `useEffect`-də `import('echarts/core')` + `LineChart`, `BarChart`, `GridComponent`, `TooltipComponent`, `LegendComponent`, `CanvasRenderer`; rənglər `getComputedStyle(document.documentElement)` → `--ui-color-chart-1..5`, `--ui-color-foreground`, `--ui-color-border`; `ResizeObserver`; `html.class` `MutationObserver` ilə tema dəyişəndə `setOption`; unmount `dispose`; mount-a qədər kit `Skeleton`; `src/widgets/chart-card/chart-card.tsx` (server): kit `Card` + başlıq + `Chart` / `EmptyState` (nöqtə yoxdur) / `ErrorState`; `src/widgets/chart-card/chart-card.test.tsx` (boş/xəta/skeleton vəziyyətləri; `echarts` modulu `vi.mock` ilə **yalnız** ağır dependency kimi, davranış assert edilmir)
- [X] T044 [P] [US2] `web-cbar-next/src/widgets/hero-slider/hero-slider.tsx` (`'use client'`, kit `Card`/`Button`/`IconButton` + token-lar, avto-keçid + nöqtələr, `prefers-reduced-motion` hörməti, D4) və `src/widgets/home-cards/{currency-card,corridor-card,inflation-card,money-market-card,yield-curve-card,info-widget,news-tabs,media-tabs,promo-banner,links-grid}.tsx` (server, `NewsTabs`/`MediaTabs` kit `Tabs` ilə — `'use client'` yalnız `Tabs` sarğısında); `CurrencyCard` `showOnHomepage` + trend işarəsi (`rate.toFixed(4)`); `src/widgets/home-cards/home-cards.test.tsx` (hər kart fikstürlə: etiketlər az/en, keçidlər, boş məlumat)

### 4c — View və route

- [X] T045 [US2] `web-cbar-next/src/views/home/loader.ts` — research R14 orkestrasiyası: `Promise.all` 8 çağırış hər biri `.catch → {data:null,error:true}`, `previousSheet`, featured `excerpt(stripHtml(content), 260)`, `HomeViewData` tipi; `src/views/home/index.tsx` — köhnə sıra: `HeroSlider` → dashboard (məzənnə + dəhliz, inflyasiya, pul bazarı) → `NewsTabs` + promo banner + aside (`InfoWidget` ×3, `YieldCurveCard`) → nəşrlər + sürətli keçidlər → faydalı keçidlər; hər bölmə `length > 0` qoruması, xəta → `ErrorState` kart daxilində; `src/app/[locale]/page.tsx` = loader + view + `generateMetadata` (brand); `src/views/home/loader.test.ts` (MSW: sorğu çoxluğu contracts/public-api.md §3 `/` sətri ilə eyni, bir endpoint 500 → yalnız həmin blok `error`), `src/views/home/index.test.tsx` (bütün bloklar fikstürlə, xəta kartı)
- [X] T046 [US2] Əl icrası (quickstart §4 ssenari 6, 7, 18): iki sayt yanaşı, blok-blok müqayisə; `logs/api-web.log` sorğu siyahısı eyni; `api-cbar` dayandırılıb qabıq qalır; `npm run verify`

**Checkpoint**: US1 + US2 — sayt qabığı və ana səhifə tam.

---

## Phase 5: User Story 3 — CMS səhifələri və məzmun bölmələri (Priority: P1)

**Goal**: Catch-all CMS səhifəsi (sol ağac, `CmsContent`, alt səhifə kartları, qruplu əlavələr), press relizlər, qanunvericilik və pul nişanı xəbərləri siyahı + detal (filtr, səhifələmə, legacy markup, 404) (spec US3, FR-013–FR-018; research R7, R10; contracts/routes.md #2–#5, #11–#12, #18)

**Independent Test**: quickstart §4 ssenari 8–12: "Haqqımızda"/"Pul siyasəti" DOM sayları köhnə ilə eyni; `?type=2&page=3`; qanun filtri + dil; `en`-də boş reliz → 404.

- [X] T047 [P] [US3] `web-cbar-next/src/features/laws/{model/schemas.ts,api/laws.api.ts}` — `getLaws(locale, page=1, categoryId?, type?, pageSize=10)` (`URLSearchParams`, optional `.set` yalnız `!= null`), `getLaw(locale, slug)`, `getLawCategories(locale)`; handler + fikstür; test
- [X] T048 [P] [US3] `web-cbar-next/src/features/money-marks/{model/schemas.ts,api/money-mark-news.api.ts}` — `getMoneyMarkNews(locale, page=1, pageSize=10)`, `getMoneyMarkNewsItem(locale, slug)` (nişan kataloqu API-si T063-də eyni feature-ə əlavə olunur); handler + fikstür; test
- [X] T049 [P] [US3] `web-cbar-next/src/widgets/section-sidebar/section-sidebar.tsx` (server): `chain[0]` kökündən ağac, aktiv zəncir açıq, `hrefFor`/`navFor` keçidləri, kit token-ları; `src/widgets/section-sidebar/section-sidebar.test.tsx`
- [X] T050 [P] [US3] `web-cbar-next/src/widgets/attachments/attachments.tsx` (server): şəkil zolağı (`image/*`), `group` üzrə `Map` (rəqəm qruplar azalan, əks halda daxil olma sırası), ≥1 qrup → kit `Accordion` (ilk açıq), qrupsuz sonda; `MediaAsset` və `PageAsset` üçün ortaq forma (`title ?? originalName`), `formatSize`, `fileIcon`; `src/widgets/attachments/attachments.test.tsx` (qruplaşdırma və sıra qaydaları)
- [X] T051 [P] [US3] `web-cbar-next/src/widgets/content-list/{content-list.tsx,content-card.tsx}` (server): siyahı elementi (başlıq `Link`, tarix `formatDate`, kateqoriya `Badge`, şəkil), boş vəziyyət, `ErrorState`; `src/widgets/content-list/content-list.test.tsx`
- [X] T052 [US3] `web-cbar-next/src/views/cms-page/{loader.ts,index.tsx}` — son seqment `decodeURIComponent` → `getPage`; `null` → `notFound()`; ağac `findChain`; məzmun boş + uşaqlar → `ChildCards`, əks halda `CmsContent`; `Attachments`; `src/app/[locale]/[...slug]/page.tsx` + `generateMetadata` (`title | brand`, `description` excerpt 160); `src/views/cms-page/loader.test.ts` (kodlanmış slug, 404), `src/views/cms-page/index.test.tsx` (legacy fikstür sayları, alt kartlar, əlavələr)
- [X] T053 [US3] `web-cbar-next/src/views/press-releases/{loader.ts,index.tsx}` (`type` 1|2, `page`; kit `Tabs` və ya keçidlər reliz/elan; `ContentList` + `ListPagination`) və `src/views/press-release/{loader.ts,index.tsx}` (başlıq, tarix, şəkil, `CmsContent`, `Attachments`); `src/app/[locale]/press-releases/page.tsx`, `src/app/[locale]/press-releases/[slug]/page.tsx` + `generateMetadata`; loader/view testləri (`?type=2&page=3` parametrləri, diapazondan kənar boş vəziyyət, 404)
- [X] T054 [US3] `web-cbar-next/src/views/laws/{loader.ts,index.tsx}` (GET filtr forması: kit `Select` `name="categoryId"`, `name="type"`; `Select` nəzarətsiz forma dəyəri göndərməsə native `<select>` kit `field` stilində — nəticə research R4-ə qeyd olunur; `ContentList` + `ListPagination`) və `src/views/law/{loader.ts,index.tsx}` (`CmsContent(description)`, `Attachments`); route faylları + `generateMetadata`; testlər (filtr `href`-ləri sorğu qoruyur, kateqoriya siyahısı, 404)
- [X] T055 [US3] `web-cbar-next/src/views/money-mark-news/{loader.ts,index.tsx}` və `src/views/money-mark-news-item/{loader.ts,index.tsx}`; `src/app/[locale]/national-currency/news/page.tsx`, `.../news/[slug]/page.tsx` + `generateMetadata`; testlər
- [X] T056 [US3] Əl icrası (quickstart §4 ssenari 8–12): SC-003 DOM sayları (`details[data-accordion]`, `table`, `img`, `a[href*="/media/"]`, `iframe`) iki saytda eyni; media keçidi mütləq + `_blank`; `npm run verify`

**Checkpoint**: US1–US3 — bütün P1 hekayələri tam.

---

## Phase 6: User Story 4 — Maliyyə məlumat ekranları (Priority: P2)

**Goal**: Məzənnə vərəqi (tarix seçimi, `toFixed(4)`, XML keçidi), statistika (AZIR bütün müddətlər, inflyasiya cari il, gəlirlik son — seçici yoxdur), MEAS bazası (emitent/tip filtri, səhifələmə, fayl keçidləri) (spec US4, FR-019, FR-020; contracts/routes.md #6–#8)

**Independent Test**: quickstart §4 ssenari 13–15: məzənnə cədvəli sətir-sətir eyni, XML ünvanı eyni; qrafik rəngləri kit token-ları; MEAS filtri.

- [X] T057 [P] [US4] `web-cbar-next/src/features/meas/{model/schemas.ts,api/meas.api.ts}` — `getMeas(locale, page=1, emitentId?, infoTypeId?, pageSize=10)`, `getMeasEmitents(locale)`, `getMeasInfoTypes(locale)`; handler + fikstür; test
- [X] T058 [US4] `web-cbar-next/src/views/currencies/{loader.ts,index.tsx}` — `date` parametri (`dateParam`), `getCurrencies`; GET forma kit `DatePicker` (`@cbar/lib-react-ui-kit/date-picker`, `locale` `az-AZ`/`en-GB`, `name="date"`, `format` `YYYY-MM-DD` — nəzarətsiz forma dəyəri yoxlanılır, əks halda native `<input type="date">` kit `field` stilində, R4 qeydi); cədvəl kit `data-table` deyil, semantik `<table>` kit token-ları ilə (`nominal`, `code`, `name`, `rate.toFixed(4)`); vərəq yoxdursa `EmptyState` (`finance:noSheet`); XML `Button asChild` `xmlFeedUrl(date)`; `src/app/[locale]/currencies/page.tsx` + `generateMetadata` (tarix ilə); testlər (sıra API-dəki kimi, XML ünvan formatı `DD.MM.YYYY`, 404 → boş vəziyyət)
- [X] T059 [US4] `web-cbar-next/src/views/statistics/{loader.ts,index.tsx}` — `getAzir()`, `getInflation(cariİl)`, `getYieldCurveLatest()` hər biri `.catch`; üç `ChartCard` (`azirSeries` bütün müddətlər, `inflationSeries` ay adları `dateLocale`, `yieldSeries`); `src/app/[locale]/statistics/page.tsx` + `generateMetadata`; `src/views/statistics/loader.test.ts` (sorğu çoxluğu contracts §3 ilə eyni: `/api/v1/azir` parametrsiz), `index.test.tsx` (boş cədvəl → boş vəziyyət)
- [X] T060 [US4] `web-cbar-next/src/views/securities/{loader.ts,index.tsx}` — `emitentId`, `infoTypeId`, `page`; GET filtr forması (2 `Select`), cədvəl (`regDate`, `dqn`, `emitentName`, `infoTypeName`, fayl `Button asChild`), `ListPagination`, boş/xəta vəziyyəti; `src/app/[locale]/securities/page.tsx` + `generateMetadata`; testlər
- [X] T061 [US4] Əl icrası (`specs/002-public-site-template-migration/quickstart.md` §4 ssenari 13–15) real `api-cbar` ilə iki sayt yanaşı; `cd web-cbar-next && npm run verify`

**Checkpoint**: US1–US4 tam.

---

## Phase 7: User Story 5 — Milli valyuta, təşkilat, media və axtarış (Priority: P2)

**Goal**: Pul nişanları kataloqu + detal, təşkilat (rəhbərlik, idarə, şöbələr, ofislər) + əməkdaş kartı, media mərkəzi (üç bölmə `Promise.allSettled`, tablar görünüş vəziyyəti) + qalereya, sayt axtarışı (spec US5; contracts/routes.md #9–#10, #13–#17)

**Independent Test**: quickstart §4 ssenari 16: hər bölmə + detal + `?q=manat`; media tabları JS-siz görünür.

- [X] T062 [P] [US5] `web-cbar-next/src/features/organization/{model/schemas.ts,api/organization.api.ts}` — `getStaff(locale, type?)`, `getStaffMember(locale, id)`, `getDivisions(locale)`, `getOffices(locale)`, helper `isBoard(type)`; handler + fikstür; test
- [X] T063 [P] [US5] `web-cbar-next/src/features/money-marks/api/money-marks.api.ts` — `getMoneyMarks(locale, type?, categoryId?)`, `getMoneyMark(locale, slug)`, `getMoneyMarkCategories(locale)`, helper `isBanknote(type)`; `model/schemas.ts` genişlənir; handler + fikstür; test
- [X] T064 [P] [US5] `web-cbar-next/src/features/search/{model/schemas.ts,api/search.api.ts}` — `searchSite(locale, q)`, `groupByType(results)` (məlum tiplər + `other`); handler + fikstür; test
- [X] T065 [US5] `web-cbar-next/src/views/money-marks/{loader.ts,index.tsx}` (`type` 1|2 tab/keçidləri, `categoryId` GET forması, kart toru ön şəkil ilə) və `src/views/money-mark/{loader.ts,index.tsx}` (ön/arxa şəkil, `CmsContent(description)`, `CmsContent(securityFeatures)` başlıq `content:securityFeatures`); `src/app/[locale]/national-currency/page.tsx`, `.../[slug]/page.tsx` + `generateMetadata`; testlər
- [X] T066 [US5] `web-cbar-next/src/views/organization/{loader.ts,index.tsx}` (`getStaff` type 1 və 2 ayrı, şöbələr `CmsContent(description)`, ofislər ünvan/telefon) və `src/views/staff-member/{loader.ts,index.tsx}` (`id` rəqəm deyilsə `notFound()`; foto, vəzifə, qəbul günləri, telefon, `CmsContent(bio)`); `src/app/[locale]/organization/page.tsx`, `.../staff/detail/[id]/page.tsx` + `generateMetadata`; testlər
- [X] T067 [US5] `web-cbar-next/src/views/media/{loader.ts,index.tsx}` (`Promise.allSettled` streams/galleries/videos default parametrlərlə; kit `Tabs` sarğısı `'use client'`, JS-siz üç bölmə ardıcıl; video kartı YouTube `youtubeId` ilə önizləmə + iframe; yayım kartı `streamUrl`) və `src/views/gallery/{loader.ts,index.tsx}` (şəkil toru, `eventDate`); `src/app/[locale]/media/page.tsx`, `.../media/galleries/[id]/page.tsx` + `generateMetadata`; testlər (bir bölmə xəta → digərləri render)
- [X] T068 [US5] `web-cbar-next/src/views/search/{loader.ts,index.tsx}` — `q` boş → `search:emptyQuery` (sorğu göndərilmir); nəticələr `groupByType` başlıqları `search:types.*`, keçidlər (`url` nisbi → `/{locale}` prefiksi ilə, mütləq olduğu kimi), `noResults`; `src/app/[locale]/search/page.tsx` + `generateMetadata`; testlər (boş, qruplaşdırma, naməlum tip `other`)
- [X] T069 [US5] Əl icrası (`specs/002-public-site-template-migration/quickstart.md` §4 ssenari 16) real `api-cbar` ilə iki sayt yanaşı; `cd web-cbar-next && npm run verify`

**Checkpoint**: Bütün hekayələr işləkdir; 18 route tam.

---

## Phase 8: Polish, deploy, root orkestrasiya

**Purpose**: Metadata/əlçatanlıq cilası, statik yoxlamalar, deploy config, dev skriptləri, sənədlər, tam verification və paritet müqayisəsi (spec FR-023, FR-028–FR-030, SC-001–SC-009; contracts/runtime-config.md §2, §6)

- [X] T070 [P] `web-cbar-next/src/app/[locale]/**/page.tsx` — hər route-da `generateMetadata` mövcudluğu, `alternates.languages {az,en}` eyni yol, `<html lang>` locale; `src/app/metadata.test.ts` (18 route faylı `generateMetadata` ixrac edir — fayl siyahısı ilə)
- [X] T071 [P] Statik uyğunluq: `cd web-cbar-next && npm run lint` sıfır tapıntı (hex/rgb/oklch/palitra, hardcoded JSX mətn, `dangerouslySetInnerHTML` yalnız `widgets/cms-content`, `NEXT_PUBLIC_*`, `@/server/*` client importu, kit barrel); `grep -rn "'use client'" src` siyahısı plan.md-dəki ilə üst-üstə düşür (slayder, mobil nav, dil, tema, qrafik, axtarış qutusu, `Tabs` sarğıları, `error.tsx`) — artıq olan `'use client'` silinir
- [X] T072 [P] Əlçatanlıq: `web-cbar-next/src/shell/accessibility.test.tsx` genişlənir (skip link, `nav aria-label`-lar az/en, flyout fokus ilə açılır, `Sheet` fokus tələsi); qaranlıq temada `cms-content.css` kontrastı əl ilə yoxlanılır (quickstart §4 ssenari 5 + 8)
- [X] T073 [P] `web-cbar-next/README.md` — template README-ni sayt üçün yenidən yaz: məqsəd, `install:public` + `install:offline`, `dev` (3001), `verify`, env (`API_URL`, `CSP_FRAME_SRC`), deploy, cutover qeydi; `web-cbar-next/CLAUDE.md` — FSD xəritəsi, loader/view qaydası, `CmsContent` D2, `Chart` D1, "brauzer API-yə müraciət etmir", `web-cbar/AGENTS.md`-dəki Next 16 xəbərdarlığı (AGENTS.md template-dən qalır)
- [X] T074 [P] `web-cbar-next/docs/how-to-use.md` — template-in "sil" cədvəli və demo istinadları silinir, sayt üçün uyğun bölmələr qalır; `web-cbar-next/specs/` boşdursa `.gitkeep` (template konstitusiyası `specs/` yolu ilə işləyir; bu feature-in spec-i root `specs/002-*`-dədir — README-də istinad)
- [X] T075 Root `dev.ps1` — `$Services`-ə `@{ Name='web-cbar-next'; Port=3001; Dir='web-cbar-next'; Cmd='npm run dev'; Log='web-public-next.log'; Url='http://localhost:3001/az' }` (sonuncu), kill port siyahısına `3001`, npm install blokunda `web-cbar-next` üçün `npm run install:public` + `npm run install:offline` budağı, yekun çıxışda `Public (new) http://localhost:3001/az  [web-cbar-next]`, başlıq şərhi
- [X] T076 Root `dev.sh` — `dev.ps1` ilə eyni dəyişiklik (servis sətri, `3001`, `install:offline` budağı, çıxış); `lsof` port siyahısı
- [X] T077 [P] Root sənədlər: `GUIDE.md` "Yeni public sayt (`web-cbar-next`)" bölməsi (port 3001, install, kit vendor, yanaşı işləmə, cutover ayrı spec); `CLAUDE.md` arxitektura diaqramına `web-cbar-next` sətri, komanda cədvəlinə `cd web-cbar-next && npm run dev # :3001`, "web-cbar" bölməsinə "Being replaced" qeydi və `web-cbar-next/CLAUDE.md`-yə istinad, port siyahısı; `api-cbar-admin/CREDENTIALS.md` ünvan siyahısına `http://localhost:3001/az`
- [X] T078 Deploy yoxlaması (quickstart §6): `npm run setup:check -- --strict` sıfır; `npm run build` standalone çıxışı; mümkünsə `npm run docker:build` (VPN) və `docker run -e API_URL=… -p 3000:3000` ilə `/az` açılır, CSP pozuntusu yoxdur; `.ci-cd/*.yaml`-da `TODO(devops)` markerləri qalır
- [X] T079 Tam verification: `cd web-cbar-next && npm run verify && npm run audit`; quickstart §4-ün 18 ssenarisi iki sayt yanaşı; SC-002 üçün `logs/api-web.log` sorğu çoxluğu hər route üçün müqayisə edilib nəticə `specs/002-public-site-template-migration/checklists/parity.md`-yə yazılır (route → köhnə sorğular → yeni sorğular → status; SC-003 DOM sayları; kənarlaşma varsa səbəbi)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: T001 → T002 → (T003, T004 paralel) → T005 → (T006, T007, T008, T010 paralel) → T009. Heç bir hekayə bundan əvvəl başlamır.
- **Foundational (Phase 2)**: Setup-dan sonra. 2a (T011 → T012; T013, T014, T015 paralel), 2b (T016 paralel; T017 → T018), 2c (T019 → T020, T021 paralel), 2d (T022 → T023; T024, T025, T026 paralel). **Bütün hekayələri bloklayır.**
- **US1 (Phase 3)**: Phase 2-dən sonra. T027, T028 paralel → T029 → (T030, T031, T033, T035 paralel) → T032 → T034 → T036 → T037. Digər hekayələr `[locale]/layout.tsx` (T034) və 404 (T035) üçün US1-ə asılıdır.
- **US2 (Phase 4)**: US1-dən sonra (layout). 4a (T038–T042 paralel) → 4b (T043, T044 paralel) → T045 → T046. T039, T040, T041, T042 feature API-ləri US3–US5-də də istifadə olunur.
- **US3 (Phase 5)**: US1-dən sonra; T040 (press-releases API) US2-dən. (T047–T051 paralel) → T052 → (T053, T054, T055 ardıcıl və ya paralel — fərqli fayllar) → T056.
- **US4 (Phase 6)**: US1-dən sonra; T039, T041 US2-dən, T043 (`ChartCard`) US2-dən. T057 → (T058, T059, T060 paralel) → T061.
- **US5 (Phase 7)**: US1-dən sonra; T042 US2-dən, T048 US3-dən. (T062, T063, T064 paralel) → (T065, T066, T067, T068 paralel) → T069.
- **Polish (Phase 8)**: Bütün hekayələrdən sonra. (T070–T074 paralel) → T075 → T076 → T077 → T078 → T079.

### User Story Dependencies

- **US1**: Yalnız Phase 2-yə asılı — MVP.
- **US2**: US1 (layout). Feature API-lərini (T038–T042) US3–US5 üçün də verir; bu API task-ları istənilsə US1-dən dərhal sonra paralel başlana bilər.
- **US3**: US1 + T040. Digər hekayələrdən asılı deyil.
- **US4**: US1 + T039, T041, T043.
- **US5**: US1 + T042, T048.

### Parallel Opportunities

- Phase 2-də dörd alt-qrup (2a–2d) bir-birindən asılı deyil — dörd paralel axın.
- Phase 4a-nın beş feature API task-ı (T038–T042) tam paraleldir; Phase 5/6/7-nin feature API-ləri (T047, T048, T057, T062–T064) də.
- View task-ları fərqli qovluqlardadır; hekayə daxilində paralel işlənə bilər (T053/T054/T055, T058/T059/T060, T065–T068).
- Phase 8-də T070–T074 paralel; T075/T076 (dev skriptləri) ardıcıl, çünki eyni davranışı iki faylda saxlayır.

---

## Parallel Example: Phase 2 (təməl)

```bash
# Dörd axın eyni anda:
Task: "T011 server api-client → T012 test"                 # 2a
Task: "T013 content schemas | T014 content lib | T015 page-node"
Task: "T016 search-params | T017 security-headers → T018 proxy"   # 2b
Task: "T019 locales → T020 server getT | T021 ui-messages"         # 2c
Task: "T022 cms-html → T023 cms-content.css + CmsContent | T024 pagination | T025 error-state | T026 testing"  # 2d
```

## Parallel Example: User Story 2 (ana səhifə)

```bash
# Feature API-ləri birlikdə:
Task: "T038 homepage api" ; Task: "T039 currencies api" ; Task: "T040 press-releases api"
Task: "T041 stats api + series" ; Task: "T042 media api"
# Sonra widget-lər birlikdə:
Task: "T043 chart-card (ECharts)" ; Task: "T044 hero-slider + home-cards"
# Sonra ardıcıl:
Task: "T045 home loader + view + page" → "T046 əl icrası + verify"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 (T001–T010) → `verify` keçir (boş sayt, kit quraşdırılıb, ECharts audit-i təmiz).
2. Phase 2 (T011–T026) → proxy, CSP, i18n, CMS HTML, səhifələmə hazır; `verify` keçir.
3. Phase 3 (T027–T037) → sayt qabığı real ağacla; quickstart §4 ssenari 1–5.
4. **DAYAN və YOXLA**: `http://localhost:3001/az` və `http://localhost:3000/az` yanaşı — menyu keçidləri eyni, yönləndirmə eyni, 404 və tema işləyir.

### Incremental Delivery

1. US1 → qabıq (MVP).
2. US2 → ana səhifə (feature API-lərinin çoxu burada yaranır) → ssenari 6, 7, 18.
3. US3 → CMS + məzmun bölmələri → SC-003 DOM müqayisəsi.
4. US4 → maliyyə ekranları → XML keçidi, qrafik rəngləri.
5. US5 → qalan bölmələr → 18 route tam.
6. Phase 8 → deploy config, dev skriptləri, sənədlər, paritet checklisti → cutover spec-inə hazır.

### Parallel Team Strategy

1. Hamı: Phase 1 + Phase 2 (dörd axın).
2. Phase 3 bitəndən sonra:
   - A: US2 (feature API-ləri əvvəl — B, C, D onları gözləyir)
   - B: US3 (T040 hazır olan kimi)
   - C: US4 (T039, T041, T043 hazır olan kimi)
   - D: US5 (T042, T048 hazır olan kimi)
3. Phase 8 birlikdə.

---

## Notes

- Hər task fərqli fayl(lar)a toxunur; `[P]` işarəsi olmayan task-lar eyni fayla və ya tamamlanmamış task-ın çıxışına asılıdır.
- Kit komponenti gözlənilən forma davranışını verməsə (T054 `Select`, T058 `DatePicker` nəzarətsiz GET forması), native element kit `field` stilində istifadə olunur və `research.md` R4-ə D-qeyd əlavə edilir — spec-ə zidd deyil (FR-022 "kit primitivlərindən yığılır").
- `product-host/visitor` yalnız davranış şübhəsində açılır (məsələn, boş vəziyyət mətni); ondan kod köçürülmür.
- Mock (MSW) yalnız testlərdə; lokal icra həmişə real `api-cbar` ilə (`dev.ps1`).
- Hər fazadan sonra `npm run verify`; "işləyəcək" verification deyil.
- Cutover (köhnə `web-cbar`-in silinməsi, `web-cbar-next` → `web-cbar`, port `3001` → `3000`) bu tasks-a daxil deyil — ayrı spec.
