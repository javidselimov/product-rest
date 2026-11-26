# Implementation Plan: Public saytın (`web-cbar`) `nextjs-template` UI kiti üzərində yenidən qurulması

**Branch**: `002-public-site-template-migration` | **Date**: 2026-09-14 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-public-site-template-migration/spec.md`

## Summary

`web-cbar` (Next.js App Router, əl ilə yazılmış Tailwind komponentləri, 12 hex
custom-property-li palitra, `t.ts` + səhifə daxili `content` obyektləri, sanitizasiyasız
`dangerouslySetInnerHTML`, 4 yerdə təkrarlanan səhifələmə) `nextjs-template`-in
kopyası olan yeni **`web-cbar-next`** qovluğunda, template-in kilidli stack-i
(Next 16 App Router + React 19 + TypeScript strict + Tailwind v4 +
`@cbar/lib-react-ui-kit` 0.4.0 + react-i18next + Zod + Vitest/MSW, FSD:
`app → views → widgets → features → entities → shared`) üzərində yenidən qurulur.
Köhnə saytın **davranışı** köçürülür (18 route, 30 public API çağırışı eyni yol və
parametrlərlə, CMS ağacından mega-menyu, `FEATURE_ROUTES` slug xəritəsi, legacy
markup-ı qoruyan `.cms-content` render-i, ana səhifənin 8 paralel sorğusu və
"əvvəlki vərəq" trend məntiqi); kodu, palitrası və əl ilə yazılmış control-ları
gətirilmir. Template-in **sessiya/giriş qatı public saytda çıxarılır** (sayt
anonimdir), render modeli **tam server render + hər sorğuda təzə məlumat** olaraq
qalır; brauzer heç vaxt API-yə birbaşa müraciət etmir (interaktiv seçimlər URL
sorğu parametrləri ilə serverdə yenidən render olunur). Yeganə yeni runtime
dependency ECharts-dır (spec D1); qrafik rəngləri kitin `--ui-color-chart-1..5`
token-larından oxunur. Verification = `npm run verify` (6 addım) + real stack ilə
əl icrası + legacy markup fikstür testi.

## Technical Context

**Language/Version**: TypeScript 5.9 (strict), React 19.2, Next.js 16.3 (App Router, `output: 'standalone'`, `src/proxy.ts`), Node 22 (`node:22-alpine`).

**Primary Dependencies**: template-dən miras — `next`, `react`, `react-dom`, `i18next` 26 / `react-i18next` 17, `zod` 4, `@tanstack/react-query` 5 (provider qalır, məlumat üçün istifadə edilmir — research R2), `zustand` 5 (yalnız tema store-u), `axios` 1 (server-only API client), `react-hook-form` (istifadə yeri yoxdur, template stack-i olaraq qalır); `@cbar/lib-react-ui-kit` 0.4.0 (`optionalDependencies`, `vendor/*.tgz`-dən `install:offline`). **Yeganə yeni runtime dependency** (spec D1): `echarts` 6.1.x (pin). Yeni devDependency yoxdur.

**Storage**: Yoxdur (SSR sayt). Bütün məlumat `api-cbar` (`:5139`, PostgreSQL read-only) üzərindən server tərəfli HTTP ilə. Brauzerdə yalnız `ui-theme` cookie (tema); `localStorage` istifadə olunmur; sessiya cookie-si yoxdur.

**Testing**: Vitest 4 + jsdom + React Testing Library + MSW 2 (node server; brauzer worker silinir). `npm run verify` = `setup:check` → `check:self-contained` → `eslint` → `tsc --noEmit` → `vitest run` → `next build`. View-lar prop-la (fikstür) `renderApp` ilə, loader-lər MSW ilə, layout/proxy `renderToStaticMarkup` / birbaşa funksiya çağırışı ilə test olunur (research R11). Legacy markup: `cms-html.test.ts` fikstür əsaslı struktur sayı.

**Target Platform**: Müasir brauzerlər (son 2 versiya), JS-siz oxunaqlı (məzmun, menyu keçidləri, səhifələmə, filtr formları server render). Deploy: standalone Node server, port 3000, Helm `.ci-cd/*.yaml`, runtime `API_URL`.

**Project Type**: Web (SSR frontend-only); backend `api-cbar` mövcuddur və dəyişmir.

**Performance Goals**: SC-006 — ana səhifə və siyahılar 50 qeydlə 3 s içində istifadəyə yararlı; ilkin JS-də ECharts yoxdur (yalnız qrafik olan səhifələrdə dinamik import); `'use client'` yalnız slayder, çekmecə, tema/dil düymələri, qrafik, axtarış qutusu.

**Constraints**: Kit-dən kənar rəng və control yoxdur (ESLint `konstitusiya/mezmun` blokları: hex/rgb/oklch/palitra sinifi/hardcoded JSX mətn qadağası); `dangerouslySetInnerHTML` ESLint-də qadağandır — yalnız `shared/lib/cms-html` və `CmsContent` komponentində fayl səviyyəli istisna ilə (spec D2, research R7); `NEXT_PUBLIC_*` yoxdur; `@/server/*` client-dən import edilmir; CSP nonce-lu, `frame-src` YouTube + konfiqurasiya ilə (research R5); `globals.css` route B bloku toxunulmur; kit `Pagination` etiketləri `UIMessagesProvider` ilə lokallaşdırılır (research R6).

**Scale/Scope**: 18 route + layout + 404 + xəta sərhədi, 30 API funksiyası (12 controller), 46 cavab tipi, ~10 view, ~9 widget, 11 feature, 2 locale, ~10 i18n namespace, 27 `.cms-content` qaydası. Köhnə sayt 41 fayl / 6 190 sətir (`globals.css` 520, `api.ts` 675, ana səhifə 548).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Root konstitusiya (`.specify/memory/constitution.md` v1.0.0)

| Maddə | Tələb | Bu plan | Status |
| --- | --- | --- | --- |
| I.2, I.3 | Spec `product-host/visitor` qarşılığını göstərir; səssiz itki yoxdur | Spec paritet cədvəli: 18 route "Saxlanılır", `product-host`-only 6 ünvan "Təxirə salınır", template demo "Ləğv" | ✅ |
| I.4 | `product-host` yalnız oxunur | Toxunulmur | ✅ |
| II.1, II.4 | Root-da paylaşılan kod yoxdur; proyektlər arası yalnız HTTP | `web-cbar-next` müstəqil qovluq, öz `package.json`/`Dockerfile`/`.ci-cd`; `web-cbar`-dən fayl import edilmir, məntiq yenidən yazılır | ✅ |
| II.3 | İki proyektə toxunan dəyişiklik ayrı iş paketləri | Yalnız frontend + root orkestrasiya (`dev.ps1`/`dev.sh`/`GUIDE.md`/`CLAUDE.md`); API-yə toxunulmur | ✅ |
| III.1 | Client cütü: `web-cbar-next` ↔ `api-cbar` | Yalnız `/api/v1` public API + `/media/{id}` + `/currencies/*.xml` keçidi | ✅ |
| III.3 | Public sorğular filtrlənir | API tərəfində; sayt filtrsiz endpoint çağırmır | ✅ |
| III.5 | `web-cbar` üçün API ünvanı runtime | `API_URL` server-only env, Zod ilə (template VIII.1 ilə eyni model) | ✅ |
| IV.1–IV.3 | `dev.ps1` və `dev.sh` eyni dəyişiklikdə; portlar sabit; start sırası | Yeni port `3001` hər iki skriptə, `GUIDE.md`, `CLAUDE.md`-yə eyni dəyişiklikdə; sıra: … → `web-cbar` → `web-cbar-next` (sonuncu) | ⚠️ yeni port, əsaslandırılıb (spec D5) |
| IV.4 | Log faylı | `logs/web-public-next.log` | ✅ |
| V.3, V.4 | İkidillilik; chrome etiketləri hər iki dildə; editorial mətn API-dən | `locales/{az,en}/*.json` paralel + key-parity testi; məzmun yalnız API | ✅ |
| V.5 | AZ hərfli fayllar UTF-8 alətlərlə | Write/Edit; `utf8-guard.test.ts` template-dən qalır | ✅ |
| VII.1 | `/currencies/{DD.MM.YYYY}.xml` kontraktı | Sayt yalnız keçid verir (`{API_URL}/currencies/…xml`), format dəyişmir | ✅ |
| VII.2 | Public URL-lər saxlanılır | 18 route eyni yol; prefikssiz → `/az` yönləndirməsi eyni | ✅ |
| VII.3 | `api-cbar` endpoint-ləri geriyə uyğun | Dəyişiklik yoxdur; contracts/public-api.md istehlak olunan hissəni qeyd edir | ✅ |
| VII.4, VII.5 | `.ci-cd`, `Dockerfile`, `.gitlab-ci.yml` paylaşılan pipeline; credential yalnız lokal | Template faylları + `web-cbar` env dəyərləri, `TODO(devops)`; sirr yoxdur | ✅ |
| VIII.1, VIII.4 | Verification real icra; boş sayt = boş baza | quickstart.md §4, §7 | ✅ |

### Template konstitusiyası (`nextjs-template/.specify/memory/constitution.md` v2.0.0)

| Maddə | Tələb | Bu plan | Status |
| --- | --- | --- | --- |
| I | UI mətnləri, comment-lər AZ; hardcoded string yoxdur; `az` default | Bütün etiketlər `t()`; ESLint hardcoded JSX mətn qadağası aktiv | ✅ |
| II | Stack kilidli; chart kitabxanası qadağan | ECharts spec D1 ilə (aşağıda Complexity); `next/font` yox (Fira Sans gətirilmir, kit tipoqrafiyası) | ⚠️ ECharts əsaslandırılıb |
| III.1–III.3 | Hər control kit-dən, subpath import, semantik rənglər | `Pagination`, `Breadcrumb`, `Tabs`, `Accordion`, `Sheet`, `DatePicker`, `Card`, `Badge`, `Skeleton`, `Input`, `Select`, `Button`; hover mega-menyu `<nav>`/`<a>` + token-lar (control deyil, research R9) | ✅ |
| III.4–III.6 | Route B toxunulmaz; Toaster/TooltipProvider bir dəfə; `.dark` html-də, hydration mismatch yoxdur | Dəyişmir; tema cookie-dən SSR (template mexanizmi) | ✅ |
| III.7 | Kit `optionalDependencies`, Nexus/`vendor` install | `install:offline` (vendor tgz) lokal; Docker `install:nexus` | ✅ |
| IV.1–IV.8 | FSD; `src/app` nazik; API çağırışı yalnız `features/*/api`; `@/*` | Route faylı = loader çağırışı + view render; loader `views/<x>/loader.ts` → `features/<x>/api/*.ts` (server-only) — research R10, R11 | ✅ |
| V | State matrisi; URL state Zod ilə | Filtr/səhifə `searchParams` → `shared/lib/search-params.ts` Zod sxemləri; server state SSR-də (Query cache-ə yazılmır — XI.3) | ✅ |
| V (sessiya) | Token client-ə çatmır | Sessiya yoxdur — modul silinir (spec D3) | ✅ (tətbiq sahəsindən kənar) |
| VI | Test hər feature; real davranış; gate | View + loader + cms-html + proxy + layout testləri; `npm run verify` | ✅ |
| VII | Error axını; loading/empty/error/success | `AppError` server tərəfdə; siyahı → `ErrorState`, detal → `notFound()` / route `error.tsx`; `loading.tsx` `RouteLoading` | ✅ |
| VIII.1–VIII.5 | Server env; `NEXT_PUBLIC_*` yalnız zərurətdə; placeholder proseduru | `src/server/env.ts` (API_URL, TZ, CSP_FRAME_SRC); `NEXT_PUBLIC_*` sıfır; `npm run setup` + `setup:check` | ✅ |
| VIII.6 | Cookie siyasəti sənədləşdirilir | Yalnız `ui-theme` (contracts/runtime-config.md §5); `NEXT_LOCALE` silinir (research R5) | ✅ |
| IX | Spec → plan → tasks; D-registri | Bu sənəd; spec D1–D5 | ✅ |
| X.1 | `dangerouslySetInnerHTML` yalnız sanitizasiya + D-qeyd | `CmsContent` (tək yer), `sanitizeCmsHtml` script/`on*`/`javascript:` süzgəci — spec D2 | ⚠️ əsaslandırılıb |
| X.2 | Xarici sərhədlər Zod ilə | Hər API cavabı `entities/*/model/schemas.ts` (`passthrough`), `searchParams`, route params, env Zod ilə | ✅ |
| X.4 | `npm audit` critical/high yoxdur; lockfile | ECharts quraşdırıldıqdan sonra `npm run audit` (tasks-da) | ✅ |
| X.6 | Müdafiə başlıqları tətbiq səviyyəsində | Template CSP saxlanılır; `img-src`/`frame-src` genişlənməsi sənədlə (research R5) | ⚠️ genişlənmə əsaslandırılıb |
| XI.1–XI.5 | `'use client'` sərhəd; server-only modullar; store-a server yazmır | Client: slayder, çekmecə, dil/tema düymələri, qrafik, axtarış qutusu; `@/server/*` env + api-client server-only | ✅ |

**Gate nəticəsi**: Keçir. Dörd əsaslandırılmış kənarlaşma Complexity Tracking-də.

## Project Structure

### Documentation (this feature)

```text
specs/002-public-site-template-migration/
├── plan.md              # Bu fayl
├── research.md          # Faza 0 — qərarlar R1–R14
├── data-model.md        # Faza 1 — public oxunan modellər, Zod sxem siyahısı, URL state
├── quickstart.md        # Faza 1 — icra/verification bələdçisi
├── contracts/
│   ├── public-api.md    # api-cbar HTTP kontraktı (saytın istehlak etdiyi 30 çağırış)
│   ├── routes.md        # URL kontraktı: 18 route, yönləndirmə, sorğu parametrləri, slug xəritəsi, i18n namespace-ləri
│   └── runtime-config.md# env, portlar, CSP, cookie, deploy, dev skriptləri
├── checklists/requirements.md
└── tasks.md             # Faza 2 — /speckit-tasks yaradır
```

### Source Code (repository root)

```text
web-cbar-next/                        # nextjs-template-in kopyası (git tarixçəsiz), yeni public sayt
├── package.json                      # name: web-cbar-next; dev: next dev -p 3001; + echarts (D1)
├── next.config.ts                    # standalone + securityHeaders() (dəyişmir)
├── vendor/cbar-lib-react-ui-kit-0.4.0.tgz
├── .ci-cd/{base,dev,test,prod}.yaml  # API_URL web-cbar dəyərləri, hostname TODO(devops); SESSION_* silinir
├── Dockerfile, .gitlab-ci.yml        # template-dən (PORT=3000)
├── public/site/                      # loqo, fayl ikonları (web-cbar/public-dən köçürülür)
└── src/
    ├── app/
    │   ├── layout.tsx                # html lang/class (tema cookie) — template
    │   ├── globals.css               # route B toxunulmaz + @import './cms-content.css'
    │   ├── cms-content.css           # 27 .cms-content qaydası, semantik token-larla (R7)
    │   ├── not-found.tsx             # dəstəklənməyən locale
    │   └── [locale]/
    │       ├── layout.tsx            # I18nProvider + AppProviders + SiteShell(tree)
    │       ├── page.tsx              # ana səhifə
    │       ├── loading.tsx, error.tsx, not-found.tsx
    │       ├── press-releases/{page.tsx,[slug]/page.tsx}
    │       ├── laws/{page.tsx,[slug]/page.tsx}
    │       ├── securities/page.tsx
    │       ├── currencies/page.tsx
    │       ├── statistics/page.tsx
    │       ├── national-currency/{page.tsx,[slug]/page.tsx,news/page.tsx,news/[slug]/page.tsx}
    │       ├── organization/{page.tsx,staff/detail/[id]/page.tsx}
    │       ├── media/{page.tsx,galleries/[id]/page.tsx}
    │       ├── search/page.tsx
    │       └── [...slug]/page.tsx    # CMS catch-all (son seqment = slug)
    ├── proxy.ts                      # locale yönləndirmə (həmişə az) + x-locale + CSP nonce; sessiya gate silinir
    ├── server/
    │   ├── env.ts                    # API_URL, NODE_ENV, TZ, CSP_FRAME_SRC (Zod)
    │   └── api-client.ts             # server-only axios: baseURL env.API_URL, no-store, Zod parse, AppError
    ├── providers/                    # app-providers (Query, Tooltip, Toaster, UIMessagesProvider az/en), i18n-provider, error-boundary
    ├── shell/                        # SiteHeader (client hissələr ayrı), MegaMenu, MobileNav (Sheet), SiteFooter, LanguageSwitcher, ThemeToggle, nav.ts (FEATURE_ROUTES, navFor)
    ├── views/                        # hər route bir qovluq: loader.ts (server) + index.tsx (prop-lu view) + *.test.tsx
    │   ├── home/ press-releases/ press-release/ laws/ law/ securities/ currencies/ statistics/
    │   ├── money-marks/ money-mark/ money-mark-news/ money-mark-news-item/ organization/ staff-member/
    │   ├── media/ gallery/ search/ cms-page/ not-found/
    ├── widgets/
    │   ├── hero-slider/              # client, kit Card/Button + token-lar (D4)
    │   ├── section-sidebar/          # aktiv zəncir açıq bölmə ağacı
    │   ├── list-pagination/          # kit Pagination + Link, URL qoruyaraq
    │   ├── attachments/              # qruplu Accordion + fayl siyahısı (ölçü, ikon)
    │   ├── cms-content/              # CmsContent (D2 — yeganə dangerouslySetInnerHTML)
    │   ├── chart-card/               # client, ECharts wrapper (D1) + Skeleton/Empty/Error
    │   └── home-cards/               # CurrencyCard, CorridorCard, InflationCard, MoneyMarketCard, YieldCurveCard, InfoWidget, NewsTabs, MediaTabs
    ├── features/                     # hər biri api/ (server-only fetch funksiyaları) + model/ (Zod sxem, tiplər, helper)
    │   ├── pages/ press-releases/ laws/ meas/ currencies/ stats/ money-marks/ organization/ media/ search/ homepage/
    ├── entities/
    │   ├── content/                  # Locale, ListEnvelope<T> sxemi, formatDate(locale), mediaUrl, stripHtml/excerpt
    │   └── page-node/                # PageNode sxemi, findChain, hrefFor
    ├── shared/
    │   ├── api/                      # app-error.ts (template), normalizeApiError
    │   ├── config/                   # brand.ts (CBAR), kit-status.ts, contacts.ts (telefon, sosial, xarici CTA ünvanları)
    │   ├── i18n/                     # create-i18n, index (namespaces), ui-messages.ts (kit UIMessages az/en)
    │   ├── lib/                      # search-params.ts (Zod), cms-html.ts (prepare + sanitize), dates.ts
    │   ├── ui/                       # empty-state, error-state, loading-state, page-header, route-states (template)
    │   └── testing/                  # setup, server, handlers/<feature>.ts (real kontrakt), fixtures/, render.tsx
    └── locales/{az,en}/              # common, nav, home, content, finance, organization, media, search, errors, footer
```

**Structure Decision**: Template-in FSD ağacı olduğu kimi saxlanılır; demo domain
(`views/{components,overview,projects,reports,settings,team}`, `features/{auth,overview,projects,reports,settings,team}`,
`entities/{user,project,member}`, `widgets/{stats-cards,activity-feed}`, `app/[locale]/login`,
`app/[locale]/(authed)`, `app/api/session`, `server/session.ts`, `shell/command-palette`,
`shared/testing/handlers/{auth,…}`, 6 demo namespace, `public/mockServiceWorker.js`,
`instrumentation.ts` MSW boot) silinir. Route faylları yalnız `loader` çağırıb view render
edir (template IV.2); server tərəfli məlumat orkestrasiyası `views/<x>/loader.ts`-də
(bir route-un bir neçə feature-ə ehtiyacı var — məsələn ana səhifə 8 feature çağırır —
və `views` layer-i `features`-dən yuxarıdadır, ona görə orkestrasiya orada). View-lar
prop-la işləyir ki, `renderApp` ilə test olunsunlar. `features/*/api` yalnız
server-only funksiyalardır (`import 'server-only'`), brauzer axios client-i və
interceptors silinir — brauzer API-yə heç vaxt müraciət etmir (research R2).

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Yeni runtime dependency: `echarts` 6.1 — template Maddə II, root "yeni dependency yalnız spec ilə" | Kit qrafik komponenti vermir (export siyahısında yoxdur, yalnız 5 chart rəng token-u); köhnə saytın 6 qrafik kartı (ana səhifə 3 + statistika 3) paritet tələbidir (FR-020). Spec D1 ilə icazəlidir. | SVG-ni əl ilə çəkmək: tooltip, ox, uyğunlaşma, boş vəziyyət — kitdən kənar əl yazması control yaradır, daha çox kod. Kitə qrafik əlavə olunmasını gözləmək: müddətsiz. Başqa kitabxana (Recharts/Chart.js): köhnə saytın ECharts seçimlərinin (xüsusilə gəlirlik əyrisi) yenidən kalibrlənməsi; ECharts artıq təsdiqlənmiş çıxış verir. |
| `dangerouslySetInnerHTML` (CMS məzmunu, 7 yer → tək `CmsContent` komponenti) — template Maddə X.1 | Zəngin mətn saxlanılan HTML-dir; React ağacına çevirmək üçün HTML parser dependency-si lazımdır. Spec D2. | Parser kitabxanası (`html-react-parser`): yeni dependency, legacy markup-ın (`<details>`, `data-*` atributlar) semantikasını dəyişmək riski. Sanitizasiya kitabxanası (DOMPurify + jsdom serverdə): jsdom runtime-a düşür (ağır). Seçim: server tərəfli, qaydası məhdud süzgəc (`<script>`, `on*=`, `javascript:`), məzmun yalnız admin panelindən gəlir. |
| CSP genişlənməsi (`img-src` API host, `frame-src` YouTube + konfiq) — template Maddə X.6 "zəiflədən dəyişiklik yalnız spec ilə" | Media faylları API host-dan gəlir (`{API_URL}/media/{id}`); CMS məzmununda YouTube və ümumi iframe var (spec FR-013). | `img-src 'self'` ilə saxlayıb şəkilləri proxy etmək: hər şəkil üçün Node üzərindən keçid, əlavə yük; iframe-ləri süzmək: paritet pozulur. Genişlənmə minimaldır və mənbələr sadalanır (`CSP_FRAME_SRC` env), `script-src` dəyişmir. |
| Yeni port `3001` — root Maddə IV.3 | Köhnə və yeni sayt cutover-ə qədər yanaşı işləməlidir (spec FR-028). Spec D5. | Köhnəni dayandırıb yenini `3000`-də qaldırmaq: paritet müqayisəsi (SC-002, SC-003) iki saytı eyni anda tələb edir. Cutover-də `3001` silinir. |

## Faza 0 və Faza 1 çıxışları

- Faza 0: [research.md](./research.md) — R1–R14, bütün texniki qeyri-müəyyənliklər həll olunub; açıq aydınlaşdırma markeri qalmayıb.
- Faza 1: [data-model.md](./data-model.md), [contracts/public-api.md](./contracts/public-api.md), [contracts/routes.md](./contracts/routes.md), [contracts/runtime-config.md](./contracts/runtime-config.md), [quickstart.md](./quickstart.md).

## Constitution Check — dizayn sonrası yenidən yoxlama

Faza 1 dizaynı yuxarıdakı cədvəlləri dəyişmir. Əlavə təsdiqlər:

- **Brauzer API trafiki sıfırdır** (research R2): `connect-src 'self'` olduğu kimi qalır; template-in
  `withCredentials: true` axios client-i və `registerUnauthorizedHandler` silinir — public saytda
  401 axını yoxdur. `@tanstack/react-query` provider template stack-i kimi qalır, amma heç bir query
  yazılmır (XI.3 — server Query cache-inə yazmır, pozulmur).
- **Zod sxemləri `passthrough()` ilə** (X.2): backend əlavə sahə göndərəndə sayt qırılmır; forma
  uyğunsuzluğu `AppError{kind:'schema'}` → siyahıda `ErrorState`, detalda route `error.tsx`. 404 →
  `null` → `notFound()`. Fikstürlər eyni sxemlərdən tiplənir (data-model.md §7).
- **Loader-lər view layer-indədir** (IV.2/IV.6): route faylı `await loadX(params, searchParams)` +
  `<XView …/>`; loader yalnız `features/*/api`-ni çağırır, komponentdə fetch yoxdur; ESLint
  `no-restricted-globals fetch` presentation qatlarında qalır.
- **`'use client'` siyahısı sabitdir** (XI.1): `hero-slider`, `mobile-nav` (Sheet), `language-switcher`,
  `theme-toggle`, `chart-card`, `header-search`, `cms-content`-in accordion-u JS-siz `<details>` olduğu
  üçün client deyil. `[locale]/layout.tsx` server komponenti olaraq qalır (ağacı fetch edir).
- **Cookie inventarı** (VIII.6): yalnız `ui-theme` (SameSite=Lax, Secure https-də, HttpOnly yox).
  `NEXT_LOCALE` silinir — prefikssiz ünvan həmişə `az`-a gedir (spec FR-005, SC-007).
- **Kit etiketləri lokallaşdırılır** (FR-024): `UIMessagesProvider` `AppProviders`-də bir dəfə mount
  olunur, `shared/i18n/ui-messages.ts` az/en kataloqu (31 açar); `DatePicker locale` cari locale-dən
  (`az-AZ`/`en-GB`). 001-dəki D3 problemi burada yaranmır.
- **`API_URL` yalnız serverdə**: media ünvanları `mediaUrl()` ilə serverdə mütləq ünvana çevrilir,
  XML keçidi serverdə render olunur; client komponentlərinə yalnız hazır string ötürülür.

## Faza 2 üçün istiqamət (`/speckit-tasks`)

Task-lar bir proyektdə (`web-cbar-next`) + root orkestrasiya (`dev.ps1`, `dev.sh`, `GUIDE.md`,
`CLAUDE.md`) olaraq iki bölmədə verilir. Faza sırası: (0) kopyalama, `setup`, demo/sessiya
təmizliyi, `install:offline`, ECharts + `audit` → (1) təməl: env, server api-client + Zod
envelope, proxy (locale + CSP), i18n namespace-ləri + `UIMessagesProvider`, `cms-content.css`,
`CmsContent` + sanitizasiya testi, `search-params`, `ListPagination` → (2) qabıq: `[locale]/layout`
(ağac), header + mega-menyu + mobil çekmecə, footer, dil/tema, 404/loading/error (US1) →
(3) CMS səhifəsi + press relizlər + qanunlar + pul nişanı xəbərləri (US3) → (4) ana səhifə
loader-i (8 sorğu + trend + excerpt) + kartlar + `ChartCard` (US2) → (5) məzənnə, statistika,
MEAS (US4) → (6) pul nişanları, təşkilat, media, axtarış (US5) → (7) metadata, deploy config,
dev skriptləri, sənədlər, tam `verify` + iki saytın yanaşı əl müqayisəsi (SC-002, SC-003).
Hər faza `npm run verify` ilə bitir.
