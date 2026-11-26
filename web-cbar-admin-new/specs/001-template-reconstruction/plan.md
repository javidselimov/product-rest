# Plan 001 — Texniki dizayn

> [spec.md](spec.md)-dəki tələblərin NECƏ ödəniləcəyi. İcra ardıcıllığı
> [tasks.md](tasks.md)-dədir. Guideline istinadları `../../../specdd/guideline.md`-ə,
> D-nömrələri spec.md §6 registrinə aiddir.

---

## 1. Texniki kontekst

- Mövcud kod: hash router (`src/app/router.tsx` + `nav.ts`), shell
  (`src/app/shell/`), 6 səhifə (`src/pages/*.tsx`), fixture-lar (`src/data/`).
- Toxunulmaz: `src/index.css` route B bloku, kit müqaviləsi (constitution Maddə III),
  Dockerfile / `default.conf` / `.ci-cd/` (yalnız istehlakçısı yazılır, özləri dəyişmir).
- `.mcp.json` və mövcud 4 skill (`figma-page`, `ui-kit-*`) qalır; `figma-page`-in
  hash-router istinadı Faza 8-də yenilənir. `ui-kit-*` üçlüyü sadəcə "qalmır" —
  §16 üzrə UI icra metodunun özüdür (əsas məqsədlərdən biri).

## 2. Hədəf FSD ağacı

```text
src/
  app/
    providers/          # error-boundary, query-client, i18n bootstrap
    routes/             # TanStack route tree: root, _auth, login, səhifə route-ları
    router.ts           # createRouter + context {queryClient, auth}
    shell/              # app-shell, sidebar, topbar, command-palette (qalır)
  pages/
    overview/  projects/  team/  reports/  components/  settings/  not-found/
  widgets/
    stats-cards/  activity-feed/        # overview-dən çıxarılan kompozisiyalar
  features/
    auth/      # api/ model/ components/ routes/
    projects/  # api/ hooks/ components/ (list, filters, dialogs)
    team/      # api/ hooks/ components/
    reports/   # api/ hooks/ components/
    settings/  # components/ (RHF+Zod form, mutation nümunəsi)
  entities/
    project/   # model/types.ts
    member/    # model/types.ts
  shared/
    api/       # axios.ts, interceptors.ts, api-client.ts, types.ts (AppError)
    config/    # runtime-config.ts
    i18n/      # index.ts (init)
    lib/       # permissions.ts, logger.ts
    model/     # ui-store.ts (theme, language, sidebar)
    testing/   # server.ts, browser.ts, handlers/, fixtures/, factories.ts, render.tsx
    ui/        # page-header.tsx və gələcək feature-siz kompozisiyalar
  locales/
    az/  en/   # common, auth, projects, team, reports, settings, components (.json)
  main.tsx
  index.css    # dəyişmir
```

**§2.5 → FSD uyğunluq cədvəli (D1 üçün):**

| Guideline §2.5 | FSD qarşılığı |
| --- | --- |
| `app/config` | `shared/config/` |
| `app/providers`, `app/router`, `app/layouts` | `app/providers/`, `app/routes/` + `app/shell/` |
| `features/<name>` | `features/<name>/` (eyni) + `pages/` (kompozisiya) + `widgets/` |
| `shared/components` | `shared/ui/` |
| `shared/api,hooks,utils,types,constants` | `shared/{api,lib,types}/` |
| `styles/globals.css` | `src/index.css` |
| `test/` | `shared/testing/` + fayl yanında `*.test.tsx` |

## 3. Miqrasiya xəritəsi

| Cari | Hədəf | Qeyd |
| --- | --- | --- |
| `src/main.tsx` | `src/main.tsx` | yenidən yazılır: runtime-config bootstrap + provider stack |
| `src/app/router.tsx`, `src/app/nav.ts` | **silinir** | əvəzinə `app/routes/` + `app/router.ts`; sidebar/palette route siyahısını route tree-dən (staticData) oxuyur |
| `src/app/theme.ts` | `shared/model/ui-store.ts` | Zustand ui-store-a əridilir |
| `src/app/shell/app-shell.tsx` | qalır | `pages` map çıxarılır → router `Outlet`; provider-lər `app/providers/`-ə |
| `src/app/shell/page-header.tsx` | `shared/ui/page-header.tsx` | feature-siz, generic |
| `src/pages/<x>.tsx` | `src/pages/<x>/index.tsx` + `features/<x>/`, `widgets/` | data query hook-lardan |
| `src/data/projects.ts`, `team.ts` | `shared/testing/fixtures/` | MSW seed; tiplər → `entities/{project,member}/model/types.ts` |

## 4. Dependency əlavələri

**dependencies** (hamısı caret ilə):

| Paket | Səbəb |
| --- | --- |
| `@tanstack/react-router` | routing (D2) |
| `@tanstack/react-query` | server state (§6.2, §10) |
| `zustand` | client state (§2.2, §6.4) |
| `axios` | HTTP client (§10.2) |
| `zod` | validasiya (§2.2) + router `validateSearch` |
| `@hookform/resolvers` | RHF↔Zod körpüsü (`react-hook-form` artıq var) |
| `i18next`, `react-i18next`, `i18next-browser-languagedetector` | i18n (§14.2) |

**devDependencies:** `vitest`, `@vitest/coverage-v8`, `jsdom`,
`@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`,
`msw`, `prettier`, `prettier-plugin-tailwindcss`; istəyə görə
`@tanstack/react-router-devtools`, `@tanstack/react-query-devtools` (dev-only).

**Qəsdən əlavə edilmir:** `react-router-dom` (D2); `date-fns` (tarix-ağır feature
yaranınca — §14.3-ün mandatlı seçimi kimi qeyd olunur); `@sentry/react` (DSN yoxdur —
adapter interfeysi kifayətdir); `playwright` (out of scope); icon/chart kitabxanaları
(kit ödəyir).

## 5. Provider stack və bootstrap

`main.tsx`:

```
await loadRuntimeConfig()            // router yaranmazdan ƏVVƏL (top-level await)
if (import.meta.env.DEV) await startMswWorker()
StrictMode
  └ ErrorBoundary                    // app/providers/error-boundary.tsx
      └ QueryClientProvider
          └ TooltipProvider
              └ RouterProvider       // context: {queryClient, auth}
  + <Toaster />                      // bir dəfə, root-da
```

i18n init `app/providers/`-də side-effect import ilə (`import '@/shared/i18n'`).

## 6. Router dizaynı

- **Code-based route tree** (file-based plugin YOX) — FSD `features/*/routes/` ilə
  uyğunluq və Vite plugin asılılığının olmaması üçün. Rədd edilən alternativ: §15.
- `app/routes/root.tsx` — shell layout (`AppShell` + `Outlet`), `notFoundComponent`
  = `pages/not-found`.
- `app/routes/_auth.tsx` — pathless qorunan layout:
  `beforeLoad: ({ context, location }) => { if (!context.auth.isAuthenticated) throw redirect({ to: '/login', search: { redirect: location.href } }) }`
- `app/routes/login.tsx` — public; `features/auth/routes/`-dan komponent.
- Hər səhifə `lazyRouteComponent(() => import('@/pages/<x>'))` (FR-02).
- Guideline §4.5 route sabitləri əvəzinə typed `to` — D2 qeydilə; §4.4-ün "mərkəzi
  router" prinsipi `app/routes/` ilə ödənilir.
- URL state (filter, səhifələmə) `validateSearch` + Zod sxemləri ilə (D3) —
  `features/projects` bunun nümunəsidir.

## 7. API layer (guideline §10)

```
UI → Query Hooks (features/*/hooks) → Services (features/*/api) → API Client (shared/api) → Backend/MSW
```

- `shared/api/axios.ts` — tək instance: `baseURL` runtime-config-dən,
  `timeout: 30000`, `withCredentials: true` (§10.5).
- `shared/api/interceptors.ts` — request: auth header inject (store-dan); response:
  **yalnız 401** → auth store logout + `/login` redirect + sessiya mesajı (5xx /
  timeout / network logout ETMİR — skill qaydası); hər error `normalizeApiError`-dən
  keçir.
- `shared/api/api-client.ts` — typed `get/post/put/patch/delete` wrapper;
  komponentlər axios-u heç vaxt görməz (§10.6).
- `shared/api/types.ts` — `AppError { status?, code?, message, fieldErrors?, traceId? }` (§15.8).
- Hər feature: `api/<x>.service.ts` + `api/<x>.types.ts` + `hooks/use<X>.ts` +
  query key factory (`<x>.keys.ts`).

## 8. Runtime config (FR-06)

`shared/config/runtime-config.ts`:

1. `fetch('/config.json', { cache: 'no-store' })` → `{ urls: { apiUrl } }`
   (`.ci-cd/*.yaml` configMap kontraktı ilə eyni forma);
2. alınmasa → `import.meta.env.VITE_API_URL`;
3. nəticə modul-səviyyə saxlanılır, axios instance yaradılışında oxunur.

Əlavə: `public/config.json` lokal nümunə; `vite.config.ts`-ə dev proxy
(`/api` → `VITE_API_PROXY_TARGET`) və stale "local tarball" comment-inin düzəlişi.

## 9. Auth scaffold (guideline §5)

- `features/auth/model/auth-store.ts` — Zustand:
  `{ isAuthenticated, user, permissions, accessToken, login(), logout(), restore() }`;
  token **yalnız yaddaşda** (D4); `sessionStorage`-da yalnız qeyri-həssas user
  snapshot (boot restore üçün).
- `features/auth/api/auth.service.ts` — `POST /auth/login`, `GET /auth/me` —
  **uydurma kontrakt**, MSW handler-ləri ilə; fayl başında bunu deyən comment.
- `features/auth/components/login-form.tsx` — RHF + Zod + kit komponentləri
  (`Field`, `Input`, `Button`); xətalar `AppError.fieldErrors`-dan.
- Logout (§5.10): store clear + `queryClient.clear()` + `/login` redirect.
- `shared/lib/permissions.ts` + `<Can permission="...">` (§5.8) — UI gate-dir,
  təhlükəsizlik yoxlaması deyil (real yoxlama backend-dədir).

## 10. State və i18n

- `shared/model/ui-store.ts` (Zustand): theme (`theme.ts`-dən əridilir), language,
  sidebar vəziyyəti; persist yalnız theme+language üçün.
- Qalan hər şey §6.4 matrisi üzrə: Query / RHF / URL / lokal state.
- i18n: `shared/i18n/index.ts` — react-i18next + languagedetector,
  `fallbackLng: 'az'`, `supportedLngs: ['az','en']`; namespace-lər səhifə/feature
  üzrə `src/locales/<lng>/<ns>.json` (§14.5); dil seçici topbar-da (kit
  `DropdownMenu`), seçim ui-store + detector cache.

## 11. Test infrastrukturu (guideline §13)

- `vitest.config.ts` — vite config-i extend edir, `environment: 'jsdom'`,
  setup faylı (`@testing-library/jest-dom`, MSW server lifecycle).
- MSW iki rejimdə: `shared/testing/server.ts` (node, testlər) və
  `shared/testing/browser.ts` (dev worker — backend olmadığından MSW həm test, həm
  dev data mənbəyidir); handler-lər `shared/testing/handlers/` altında paylaşılır.
- `shared/testing/render.tsx` — QueryClient + i18n + Router wrapper-li custom render.
- `shared/testing/factories.ts` — `createProjectMock()`, `createMemberMock()` (§13.20).
- Coverage: v8 provider, **report-only** (rəqəmsal gate yox — §13.19 kvalitativdir;
  bu, şüurlu qərardır, unutqanlıq deyil).

## 12. Error handling (guideline §15)

- `app/providers/error-boundary.tsx` — kit primitivlərindən (Card, Button)
  Azərbaycanca fallback; router `defaultErrorComponent` də bundan istifadə edir.
- `QueryCache.onError` → toast **yalnız background xətalar üçün** (ekranda error
  state göstərilən query-lər dublikat toast atmır).
- Mutation xətaları form səviyyəsində `fieldErrors` ilə; ümumi xəta toast ilə (FR-11).
- `shared/lib/logger.ts` — Sentry adapter interfeysi; DSN konfiqurasiya
  olunmayıbsa no-op (§15.2).

## 13. Tooling

- Prettier + `prettier-plugin-tailwindcss`, `.prettierrc` (§2.3).
- `@/*` path alias (`tsconfig.app.json` `paths` + vite `resolve.alias`).
- Layer-boundary lint: ESLint `no-restricted-imports` naxışları ilə (məs.,
  `shared`-dən `features`-ə import qadağası) — sadə başlanğıc;
  `eslint-plugin-boundaries` gələcək gücləndirmədir.
- Scripts: `test`, `test:run`, `test:coverage`, `format`,
  `verify` = `lint && tsc -b && vitest run && vite build`.

## 14. Sıralama

[tasks.md](tasks.md): Faza 0 tooling → 1 FSD+router → 2 API+config+MSW → 3 auth →
4 state+i18n → 5 səhifələr → 6 testlər → 7 error handling → 8 sənədləşmə.
Hər faza öz Verification bəndi ilə bağlanır; fazalar asılılıq sırasındadır.

## 15. Alternativlər və rədd səbəbləri

| Alternativ | Rədd səbəbi |
| --- | --- |
| TanStack file-based routing (vite plugin) | FSD `features/*/routes/` ilə toqquşur; code-based tree eyni tip təhlükəsizliyi plugin-siz verir |
| `fetch` wrapper (axios-suz) | Guideline §10.2 Axios-u mandat edir |
| Redux Toolkit | §6 Zustand + Query ayrımını mandat edir |
| i18n JSON-ların feature qovluğunda saxlanması | §14.5 mərkəzi `locales/<lng>/<ns>` strukturunu mandat edir |
| localStorage token (SKILL.md nümunəsi) | §16.13 qadağan edir — D4 |

## 16. UI hazırlama metodu — `ui-kit-*` skill-ləri (əsas məqsəd)

Bu planda UI istehsalı sərbəst üslubda deyil, üç layihə skill-inin
(`.claude/skills/ui-kit-usage`, `ui-kit-setup`, `ui-kit-review`) üzərində icra
olunur. Bu, constitution Maddə III (kit müqaviləsi) və Maddə VI (verification)
qaydalarının plan səviyyəsində konkretləşməsidir:

| Skill | Rol | Nə vaxt işə düşür |
| --- | --- | --- |
| `ui-kit-usage` | UI yazmanın standart metodu — subpath import, `variant`/`colorPalette` oxları, semantik token-lar, form/icon/dark-mode qaydaları | Hər React komponenti, səhifə, form, dialog, cədvəl və ya layout yazılanda/dəyişdirilanda; sessiyanın ilk UI işindən əvvəl `references/components.md` açılır |
| `ui-kit-setup` | Kit wiring diaqnostikası — stylesheet route-u, `.dark`, provider-lər, TS dev dependency | Nəsə stilsiz/rəngsiz render olunanda, dark mode işləməyəndə, `TS2559` çıxanda; `src/index.css` route B blokuna hər şübhədə əvvəl bu skill oxunur |
| `ui-kit-review` | UI-nin kit-ə qarşı auditi — hand-rolled control, literal rəng, barrel import, dublikat kitabxana tapıntıları | UI-ağır fazaların (Faza 3 auth UI, Faza 5 səhifələr) Verification-ında və merge-dən əvvəl; **report first, fix second** |

Məcburi qaydalar:

1. `tasks.md`-dəki hər UI task-ı `ui-kit-usage` kontekstində icra olunur — skill-siz
   UI yazmaq bu planın pozulmasıdır.
2. Skill-lərin `references/` qovluğu (`components.md`, `props.md`, `tokens.md`,
   `icons.md`, `package.md`) kit üzrə yeganə həqiqət mənbəyidir; komponent API-sini
   yaddaşdan uydurmaq qadağandır.
3. `ui-kit-review` tapıntıları (Critical/High səviyyəli kənarlaşmalar) düzəldilmədən
   faza Verification-ı bağlanmır — Maddə VI gate-inin UI qolu.
4. Skill-lər `../showcase-ui/consumer-skills/`-dən generasiya olunub kopyalanır —
   burada redaktə edilmir; kit versiyası dəyişəndə yenidən sync olunur (CLAUDE.md).
