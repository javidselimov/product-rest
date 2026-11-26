---
name: frontend-standards
description: Apply this project's corporate frontend standards whenever writing or changing application code — FSD layer architecture on Next.js App Router, the thin route layer, the server/client boundary, TanStack Query, Zustand, Axios, React Hook Form + Zod, react-i18next driven by the URL locale segment, the httpOnly cookie session model, and the mandatory Azerbaijani-language rules from .specify/memory/constitution.md. Use for any feature, page, refactor or spec work, and when the user says "standartlara uyğunlaşdır", "yeni səhifə", "spec yaz" or asks whether code follows the guideline.
---

# frontend-standards

Bu skill layihənin frontend inkişafını vahid, ölçülə bilən, təhlükəsiz və
dəstəklənə bilən şəkildə aparmaq üçündür. Məqsəd yalnız «kod yazmaq» deyil —
arxitekturanı, server/client sərhədini, domain qaydalarını, API kontraktını, test
strategiyasını və spec-driven prosesi qorumaqdır.

Normativ mənbələr (bu skill onların qısaldılmış icra formasıdır):

| Sənəd | Rolu |
| --- | --- |
| `.specify/memory/constitution.md` | dəyişməz prinsiplər (v2.2.0) — heç nə ona zidd ola bilməz |
| `specs/NNN-*/` | aktiv spec-lər (spec → plan → tasks) |
| `CLAUDE.md` | repo-spesifik məcburi kontekst |
| `docs/how-to-use.md` | gündəlik prosedurlar — «yeni səhifə», data axını, gate |

## Project Reality Rules

1. Bu repo **şablondur**: deploy identifikatorları placeholder-dir
   (`<PROJECT_NAME>`, `<INGRESS_DOMAIN>`…). Real dəyər commit olunmur.
2. `specs/` spec-driven mənbədir: kod dəyişikliyi spec-siz başlanmır (Maddə IX).
3. UI kit-in bug-ı `node_modules`-da **yamaqlanmır** — kit repo-suna report olunur.
4. Real backend **yoxdur** — `src/shared/testing/handlers/` altındakı MSW
   handler-ləri real API spec gələnə qədər kontraktdır.
5. `/api/session` **tətbiqin öz route-udur**, mock deyil — handler dəstində yeri yoxdur.

## Mandatory Language Rules

Bütün UI text, domain etiketi, error mesajı və code comment Azərbaycan dilindədir
(Maddə I):

- `ə ı ğ ş ç ö ü` hərflərini düzgün yazmaq
- terminləri tərcümə/transliterasiya etməmək (`query`, `hook`, `route`, `server component`)
- backend error mesajlarını «gözəl ingilis dili» ilə əvəzləməmək
- UI-də görünən string yalnız `t('namespace:key')` ilə — hardcoded mətn qadağandır
  (yeganə istisna `src/views/components/`: kit variant adları)
- heç bir faylı `Set-Content` və ya shell redirection ilə yazmamaq (UTF-8 korlanır)

Düzgün: `Məlumat tapılmadı` · `İcazə yoxdur` — Yanlış: `Data not found` · `Permission denied`

## Architecture Rules

### 1. FSD strukturu (Next uyğunlaşdırması)

```text
src/
  app/          YALNIZ route qatı: layout, page, loading, error, not-found + api/session
  providers/    FSD app-layer: app-providers, error-boundary, query-client, session-bridge
  shell/        FSD app-layer: app-shell, sidebar, topbar, command-palette, nav.ts
  views/        FSD pages layer (D2 — `pages` adı Next-ə aiddir)
  widgets/      stats-cards, activity-feed
  features/     auth, projects, team, settings, overview, reports
    <name>/       api/ model/ hooks/ components/
  entities/     user, project, member
  shared/       api/ config/ constants/ i18n/ lib/ model/ testing/ ui/
                constants/ = cross-cutting sabitlər (pagination, time, timing, http, headers, layout…), barrel yoxdur
                <slice>/constants.ts = slice-a məxsus sabitlər (NEWS_PAGE_SIZE, AZIR_*, FEED_CARDS)
  locales/      az/ en/
  server/       SERVER-ONLY: env.ts, session.ts
```

`src/pages/` **istifadə edilmir** — Next onu Pages Router kimi oxuyar.

### 2. Layer Boundaries

- import yalnız aşağıya: `app → views → widgets → features → entities → shared`
- **route faylları nazikdir**: iş məntiqi saxlamır, `views`-dən komponent render edir
- UI komponentlər API çağırışı etmir; sorğu feature `api/` + query hook-undan keçir
- `shared` heç bir yuxarı layer-dən asılı deyil (istisna: `shared/testing/`)

### 3. Server/Client sərhədi (Maddə XI)

- `'use client'` **sərhəddir, adət deyil**: yalnız interaktivlik, browser API-si və
  ya kit komponenti lazım olanda və mümkün olan ən **aşağı** komponentə
- root layout client-ə çevrilmir
- `src/server/*` client faylından import edilə bilməz — lint xətası
- server komponenti Zustand store-a və ya Query keşinə yazmır; ötürmə yalnız props
- `window`/`document`/`localStorage` yalnız client komponentində və effekt daxilində
- hydration mismatch «səs» sayılmır — səbəbi tapılıb düzəldilir

### 4. Sabitlər (Maddə XII, spec 032)

- **magic number yoxdur**: davranışı/ölçünü təyin edən hər rəqəm adlı sabitdir; yalnız
  `0 1 -1 2 100`, massiv indeksi və enum üzvü adsız qala bilər
- bir neçə slice-da lazım olan → `src/shared/constants/<mövzu>.ts`, fayl üzrə import
  (`@/shared/constants/pagination`); yalnız bir slice-da lazım olan → həmin slice-ın
  `constants.ts`-i (`features/<x>/model/`, `views/<x>/`, `widgets/<x>/`, `shell/`)
- `shared/config/` konfiqdir (brand, contacts, security-headers) — sabit ora yazılmır
- ad `SCREAMING_SNAKE_CASE` + vahid suffiksi (`_MS`, `_PX`), qrup `as const`, bir sətirlik
  ingiliscə «niyə» şərhi; köçürüləndə köhnə yerdə re-export qalmır
- magic string-lər də sabitdir: `HTTP_STATUS`, `LOCALE_HEADER`, `QUERY_PARAM`, növ kodları
  (`ORG_CHART_KIND`, `STAFF_TYPE`); Tailwind `[Npx]` className dəyərləri qaydadan kənardır
- gate: `@typescript-eslint/no-magic-numbers` `error` (`detectObjects`) `npm run lint`-dədir;
  testlər, `shared/testing`, `constants` faylları, `shared/lib/xlsx` istisnadır; konfiqurasiya
  dəyərini yoxlayan test sabiti import edir
- kontrakt: `../specs/032-frontend-constants-standard/contracts/constants-contract.md`

### 5. Import Rules

- path alias `@/*`; dərin nisbi import (`../../`) qadağandır
- kit import-ları yalnız subpath: `@cbar/lib-react-ui-kit/button` — barrel qadağandır
- qaydalar `no-restricted-imports` ilə icra olunur (`eslint.config.mjs`)

## Tech Stack Rules

Next 16 (App Router, `output: 'standalone'`) · React 19 · TypeScript (strict) ·
Tailwind v4 (`@tailwindcss/postcss`) · `@cbar/lib-react-ui-kit` · TanStack Query ·
Zustand · Axios · React Hook Form + Zod · react-i18next · Vitest + Testing Library +
MSW · ESLint (flat, `eslint-config-next`) + Prettier

Stack Maddə II ilə kilidlidir — yeni runtime dependency yalnız spec ilə.
Icon, chart, date, class-merge kitabxanaları qadağandır (kit ödəyir).
`next-intl`, `next-auth` bu yığında yoxdur.

## Data Fetching and Server State Rules

- server state yalnız TanStack Query; mutation-lar `useMutation`
- axın: `views/widgets → features/<ad>/hooks/ → features/<ad>/api/ → shared/api/api-client`
- hər cavab Zod ilə parse olunur (`parseOrThrow`) — data tipə **cast edilmir**
- hər feature öz `api/<x>.service.ts` + `hooks/use-<x>.ts` + query key factory saxlayır
- endpoint-lər MSW kontraktına uyğundur; real API gələndə yalnız handler və service dəyişir
- hər query üçün **loading / empty / error / success** UI-də görünür;
  route səviyyəli `loading.tsx` bunu əvəz etmir, tamamlayır

## Auth, Session and Security Rules

- sessiya **`HttpOnly` cookie-dədir**; access token client JavaScript-inə heç vaxt çatmır
  (Maddə V, v2.0.0). `localStorage`, `sessionStorage`, URL və JS-dən oxunan cookie qadağandır
- client yalnız istifadəçi profilini və icazə dəstini saxlayır — token-i yox
- sessiyanın qurulması/silinməsi yalnız `src/server/session.ts` və `/api/session`-dan keçir
- qorunan bölmə `src/proxy.ts`-də süzülür — səhifə brauzerə çatmır
- `401` yeganə auto-logout statusudur; `5xx`, timeout, network error logout etmir
- logout = auth store clear + `queryClient.clear()` + `DELETE /api/session` + login redirect
- icazə yoxlaması `<Can permission="…">` / `hasPermission` ilə; rol sətrini müqayisə
  etmək qadağandır. UI gate təhlükəsizlik deyil — real yoxlama backend-dədir
- `dangerouslySetInnerHTML`, `eval`, `new Function` qadağandır
- yeni `NEXT_PUBLIC_*` dəyişəni yoxdur; secret heç vaxt brauzer bundle-ına düşmür

## UI and Component Rules

Bu bölmə qəsdən qısadır — komponent seçimi, variant/`colorPalette`/`size` oxları,
subpath-lar və styling üçün **`ui-kit-usage` skill-i məcburidir**; dublikat etmə.

| Qonşu skill | Nə vaxt |
| --- | --- |
| `ui-kit-usage` | hər hansı UI yazılanda — hansı komponent, hansı subpath, hansı ox |
| `ui-kit-setup` | nəsə unstyled render olunanda, dark mode işləməyəndə |
| `ui-kit-review` | UI-ni kit-ə qarşı audit/align etmək istənəndə |

Əlavə qaydalar:

- rənglər yalnız semantik: `bg-background`, `text-muted-foreground` — heç bir
  hex/rgb/`bg-blue-600`
- `src/app/globals.css`-in route B bloku **toxunulmazdır**; `styles.css` heç vaxt
  import edilmir
- `TooltipProvider` + `Toaster` yalnız bir dəfə, `src/providers/app-providers.tsx`-də
- yalnız-ikon control-un `aria-label`-ı olmalıdır; dekorativ ikon `aria-hidden`

Component checklist:

- [ ] Props tipi müəyyənləşdirilib
- [ ] Doğru layer seçilib (view/widget/feature/entity/shared)
- [ ] `'use client'` həqiqətən lazımdırmı və ən aşağı komponentdədirmi
- [ ] Loading / empty / error vəziyyətləri var
- [ ] UI text i18n açarı ilə, Azərbaycan dilində
- [ ] Test yazılıb

## State Management Rules

Maddə V matrisi məcburidir: server = TanStack Query · paylaşılan client = Zustand
(`shared/model/ui-store.ts`, `features/auth/model/auth-store.ts`) · form = RHF + Zod ·
URL = Next `searchParams` / route params, **Zod sxemi ilə parse olunur** ·
sessiya = `HttpOnly` cookie · lokal = `useState`/`useReducer`.
Derived state saxlanılmır — hesablanır.

## Testing Rules

- yeni funksiya/dəyişiklik əvvəlcə test ilə izah olunur (TDD)
- testlər real istifadəçi davranışı üzərindədir; mock davranışını assert etmək qadağandır
- API mock yalnız MSW (`shared/testing/handlers/`); custom render
  `shared/testing/render.tsx`-dən (`renderApp`), data `factories.ts`-dən
- `next/navigation` test setup-ında mock-lanır — bu framework konteksti, mock
  davranışı deyil

```bash
npm run test        # watch
npm run test:run    # bir dəfə
npm run verify      # setup:check → check:self-contained → lint → typecheck → test → build
```

Yalnız test run etmək yetməz — bütün gate icra olunur; nəticəni süni «pass» kimi
qeyd etmək olmaz.

## Workflow Rules

**Kod yazmazdan əvvəl:** problem/requirement müəyyənləşdir; aktiv spec-i və
konstitusiyanı yoxla; uyğun layer və fayl yerini FSD üzrə seç; MSW kontraktına bax;
bu kodun server, yoxsa client tərəfdə işlədiyini qərarlaşdır.

**Yazarkən:** minimal və auditable patch; data/state axını aydın qalsın; UI text,
comment və error mesajları Azərbaycan dilində; tez-tez verification.

**Bitirməzdən əvvəl:** lint, typecheck, aidiyyəti testlər; davranışın real nəticəsini
yoxla; əvvəl root cause, sonra fix; «işləyəcək» deyib bitirmə.

## Anti-patterns

- API çağırışını komponentdə yazmaq · route faylına iş məntiqi qoymaq · `'use client'`-i
  root-a qaldırmaq · token-i brauzer storage-ında saxlamaq · `src/server/*`-i client-dən
  import etmək · ingiliscə UI/error mesajı · hardcoded UI mətni · hex/rgb rəng · magic number
  (`pageSize: 10`, `status === 404`, `setTimeout(fn, 400)`) və ya `constants` faylından kənar sabit ·
  kit əvəzinə hand-rolled control · barrel import · mock-ə əsaslanan test · test-siz
  feature · spec-siz kod dəyişikliyi · status label-i «özündən uydurmaq»

## Implementation Checklist

- [ ] spec/plan/tasks mövcuddur və bu iş ona uyğundur
- [ ] feature və layer düzgün seçilib; route faylı nazikdir
- [ ] server/client sərhədi düzgün çəkilib
- [ ] MSW kontraktı oxunub, Zod sxemləri müəyyən edilib
- [ ] rəqəm/kod literal-ları adlı sabitdir və `shared/constants/` və ya slice `constants.ts`-dədir
- [ ] loading / empty / error vəziyyətləri var
- [ ] UI text i18n açarları ilə, hər iki dildə
- [ ] testlər yazılıb və run olunub
- [ ] `npm run verify` keçir

## Final Rule

Layihə yalnız «işləyən kod» deyil — domain-etibarlı, test edilə bilən, sabit
strukturlu, Azərbaycan-dilli və uzunmüddətli dəstəklənən məhsuldur. Hər dəyişiklikdə:

- Bu kod düzgün layer-dədir və route qatı nazik qalıbmı?
- Bu, server, yoxsa client tərəfdir — sərhəd düzgün çəkilibmi?
- Bu, aktiv spec və konstitusiya ilə uyğundurmu?
- Bu, API kontraktı (MSW handler-ləri) ilə uyğun gəlirmi?
- Bu UI text Azərbaycan dilindədir və i18n açarı ilədirmi?
- Bu kod test oluna bilər və test olunubmu?
- Bu işin real verification-u varmı?

Yalnız hamısına «bəli» cavabı olan dəyişikliklər qəbul olunur.
