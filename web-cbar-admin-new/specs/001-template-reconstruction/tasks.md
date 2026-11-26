# Tasks 001 — İcra siyahısı

> [plan.md](plan.md)-dəki dizaynın fazalara bölünmüş icrası. Fazalar asılılıq
> sırasındadır — bir fazanın Verification-u keçmədən növbətiyə keçilmir
> (constitution Maddə VI). Task ID formatı: `T<faza>.<n>`.

---

## Faza 0 — Tooling və dependency-lər

- [x] T0.1 Dependency-lərin quraşdırılması (plan.md §4 siyahısı; əvvəlcə Vitest-in
      Vite 8 ilə uyğun major-u yoxlanılır — spec risk 4)
- [x] T0.2 Prettier + `prettier-plugin-tailwindcss` + `.prettierrc`; mövcud kod bir
      dəfə format olunur (ayrıca commit)
- [x] T0.3 `@/*` path alias (`tsconfig.app.json` + `vite.config.ts`); mövcud nisbi
      import-lar alias-a keçirilir
- [x] T0.4 Scripts: `test`, `test:run`, `test:coverage`, `format`, `verify`
- [x] T0.5 `vitest.config.ts` + setup faylı + bir smoke test (`expect(true)`)
- [x] T0.6 `vite.config.ts`-də stale "local tarball" comment-inin düzəlişi

**Verification:** `npm run verify` köhnə struktur üzərində təmiz keçir.

## Faza 1 — FSD skeleti + TanStack Router

- [x] T1.1 Qovluq skeleti: `app/{providers,routes}`, `pages/`, `widgets/`,
      `features/`, `entities/`, `shared/{api,config,i18n,lib,model,testing,ui}`, `locales/`
- [x] T1.2 Mövcud faylların köçürülməsi (plan.md §3 xəritəsi üzrə) — davranış
      dəyişmədən, yalnız yerdəyişmə + import düzəlişləri
- [x] T1.3 Route tree: `root.tsx` (shell + `Outlet` + `notFoundComponent`),
      6 səhifə route-u (hamısı lazy), `app/router.ts`
- [x] T1.4 Sidebar / mobile sheet / command palette naviqasiyası vahid siyahıdan
      oxunur — `app/routes/nav.ts` (typed `LinkProps['to']` path-lər; `staticData`
      əvəzinə sadə siyahı seçildi)
- [x] T1.5 Hash router (`src/app/router.tsx`) silinir; `app-shell.tsx`-dən `pages`
      map çıxarılır

**Verification:** bütün 6 səhifə path URL ilə açılır, deep-link və geri/irəli
işləyir, tanınmayan URL 404 göstərir, Network tab-da route chunk-ları ayrı yüklənir,
`npm run verify` keçir. (FR-01, FR-02)

## Faza 2 — API layer + runtime config + MSW

- [x] T2.1 `shared/config/runtime-config.ts` + `public/config.json` nümunəsi +
      `main.tsx`-də `await loadRuntimeConfig()` bootstrap
- [x] T2.2 `shared/api/`: `axios.ts`, `interceptors.ts` (401-only logout hazırlığı,
      `normalizeApiError`), `api-client.ts`, `types.ts` (`AppError`)
- [x] T2.3 Vite dev proxy (`/api` → `VITE_API_PROXY_TARGET`)
- [x] T2.4 MSW: `shared/testing/{server,browser}.ts` + ilk handler-lər
      (`/api/projects`, `/api/team`); dev-də worker avtomatik başlayır
- [x] T2.5 `src/data/*` → `shared/testing/fixtures/` (MSW seed); tiplər
      `entities/{project,member}/model/types.ts`-ə çıxarılır

**Verification:** dev-də Network tab-da `/api/projects` MSW-dən cavab alır;
`public/config.json`-da `apiUrl` dəyişəndə axios `baseURL` dəyişir (preview ilə).
(FR-05 əsası, FR-06)

## Faza 3 — Auth scaffold

- [x] T3.1 `features/auth/model/auth-store.ts` (token in-memory — D4; `restore()`
      sessionStorage snapshot-dan)
- [x] T3.2 `features/auth/api/auth.service.ts` + MSW `/auth/login`, `/auth/me`
      (uydurma kontrakt comment-i ilə)
- [x] T3.3 Login səhifəsi: RHF + Zod + kit komponentləri, xətalar `fieldErrors`-dan
- [x] T3.4 `_auth` pathless layout: `beforeLoad` redirect + `redirect` search param
      ilə qayıdış
- [x] T3.5 Logout: store clear + `queryClient.clear()` + redirect (§5.10); topbar
      account menyusuna bağlanır
- [x] T3.6 401 interceptor inteqrasiyası + sessiya bitmə mesajı (Azərbaycanca toast)
- [x] T3.7 `hasPermission` + `Permission` tipi `entities/user/model/types.ts`-də
      (FSD: shared entities-dən asılı ola bilməz deyə plan-dakı `shared/lib`
      yerinə entity seçildi) + `<Can permission>` + Projects səhifəsində
      "New project" düyməsində real istifadə

**Verification:** logout → qorunan URL → `/login` redirect → login → əvvəlki URL-ə
qayıdış; MSW-də 401 simulyasiyası sessiya mesajı göstərir. (FR-03, FR-04)

## Faza 4 — State + i18n

- [x] T4.1 `shared/model/ui-store.ts` (theme, language, sidebar); `theme.ts` əridilir
- [x] T4.2 `shared/i18n/index.ts` init + languagedetector (`fallbackLng: 'az'`)
- [x] T4.3 `locales/{az,en}/` namespace faylları (common, nav, auth, overview,
      projects, team, reports, settings) — UTF-8, redirection-sız (Maddə I.5)
- [x] T4.4 Bütün UI mətnlərinin `t()`-yə çıxarılması — səhifə-səhifə, shell daxil.
      **İstisna:** `pages/components` (kit qalereyası) tərcümə olunmur — oradakı
      mətnlər variant/prop adlarıdır (`solid`, `outline`, …) və kit-in nümayiş
      datasıdır, istifadəçi-üzü aplikasiya mətni deyil
- [x] T4.5 Dil seçici topbar-da (kit `DropdownMenu`); seçim persist olunur

**Verification:** dil keçidi bütün ekranları dəyişir, reload-da qalır; `src/`-də
hardcoded UI mətni qalmır (grep ilə yoxlanır). (FR-07)

## Faza 5 — Demo səhifələrin FSD-yə yenidən qurulması

Hər səhifədə: data query hook-dan, loading / empty / error state-lər görünür (FR-09).

- [x] T5.1 Overview → `pages/overview` + `widgets/{stats-cards,activity-feed}`
- [x] T5.2 Projects → `features/projects`: list + filter-lər URL search state ilə
      (`validateSearch` + Zod — D3 nümunəsi), query hooks, dialog/drawer
- [x] T5.3 Team → `features/team` + `entities/member` (virtual list qalır)
- [x] T5.4 Reports → `features/reports`
- [x] T5.5 Components gallery → `pages/components` (feature-siz, flat qalır)
- [x] T5.6 Settings → `features/settings`: RHF + Zod form, mutation + toast
      nümunəsi (FR-11)

**Verification:** bütün səhifələr MSW datası ilə işləyir; hər səhifədə
loading/empty/error ssenariləri əl ilə (MSW delay/error handler-i ilə) göstərilir;
`npm run verify` keçir. (FR-08)

## Faza 6 — Testlər

- [x] T6.1 `shared/testing/render.tsx` (Query + i18n + Router wrapper) +
      `factories.ts`
- [x] T6.2 Unit testlər: `permissions`, `normalizeApiError`, `runtime-config`
      fallback
- [x] T6.3 Component testlər: login-form (validasiya + submit), projects list
      (loading/empty/error), `<Can>`
- [x] T6.4 Auth flow inteqrasiya testi (MSW ilə: login → qorunan səhifə → logout)
- [x] T6.5 `test:coverage` report-only konfiqurasiyası

**Verification:** `npm run test:run` yaşıl; coverage report yaranır. (NFR-04)

## Faza 7 — Error handling + monitoring

- [x] T7.1 `app/providers/error-boundary.tsx` (kit primitivləri, Azərbaycanca) +
      router `defaultErrorComponent`
- [x] T7.2 `QueryCache.onError` → toast siyasəti (yalnız background xətalar)
- [x] T7.3 `shared/lib/logger.ts` — Sentry no-op adapteri (env ilə şərti init)
- [x] T7.4 Audit: heç bir raw texniki mesaj istifadəçiyə çıxmır

**Verification:** süni runtime error fallback göstərir; MSW 500 cavabı Azərbaycanca
toast göstərir. (FR-10, FR-11)

## Faza 8 — Sənədləşmə

- [x] T8.1 `CLAUDE.md` yenidən yazılır: FSD strukturu, yeni skriptlər, "no routing
      dep" qaydasının ləğvi (D5), spec-driven proses; kit/route-B bölmələri qalır
- [x] T8.2 `README.md` yenilənir (template kimi istifadə təlimatı)
- [x] T8.3 `figma-page` skill-inin hash-router istinadları yeni router-ə uyğunlaşdırılır
- [x] T8.4 Final yoxlama: spec.md §8 qəbul meyarları işarələnib (2 bənd manual
      brauzer smoke testinə saxlanılıb — spec §8 qeydləri); grep auditləri:
      hex/rgb yox, raw error sızması yox, köhnə `@/data/` istinadı yox

**Verification:** təzə clone ssenarisi — `npm ci && npm run verify` təmiz keçir
(guideline §18.28 gate tam).

---

## İcra zamanı aşkarlanan, kit-ə aid məsələ

- **`PaginationPrevious`/`PaginationNext` mətnləri kit build-ində hardcoded-dır** —
  i18n override API-si yoxdur, az interfeysdə "Previous/Next" görünür.
  `../showcase-ui`-yə report ediləcək (kit `node_modules`-da yamaqlanmır —
  CLAUDE.md qaydası).
