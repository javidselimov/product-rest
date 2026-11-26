---
name: frontend-standards
description: Apply this project's corporate frontend standards whenever writing or changing application code — FSD layer architecture, TanStack Router/Query, Zustand, Axios, React Hook Form + Zod, react-i18next, and the mandatory Azerbaijani-language rules from .specify/memory/constitution.md. Use for any feature, page, refactor or spec work, and when the user says "standartlara uyğunlaşdır", "yeni feature", "spec yaz" or asks whether code follows the guideline.
---

# frontend-standards

Bu skill layihənin frontend inkişafını vahid, ölçülə bilən, təhlükəsiz və
dəstəklənə bilən şəkildə aparmaq üçündür. Məqsəd yalnız "kod yazmaq" deyil —
arxitekturanı, domain qaydalarını, API kontraktını, test strategiyasını və
spec-driven prosesi qorumaqdır.

Normativ mənbələr (bu skill onların qısaldılmış icra formasıdır):

| Sənəd | Rolu |
| --- | --- |
| `.specify/memory/constitution.md` | dəyişməz prinsiplər — heç nə ona zidd ola bilməz |
| `specs/NNN-*/` | aktiv spec-lər (spec → plan → tasks) |
| `../../specdd/guideline.md` | korporativ standart — bölmə nömrələri ilə istinad |
| `CLAUDE.md` | repo-spesifik məcburi kontekst |

## Project Reality Rules

1. `project-nexus-main/` — inkişaf olunan aplikasiya budur; parent workspace-in qalan
   qovluqları bu layihənin inkişaf yeri deyil.
2. `specs/` — spec-driven mənbədir: kod dəyişikliyi spec-siz başlanmır
   (constitution Maddə IX).
3. `../showcase-ui` — UI kit-in öz repo-sudur. Kit bug-ı report olunur,
   **heç vaxt** `node_modules`-da yamaqlanmır.
4. Real backend **yoxdur** — `src/shared/testing/handlers/` altındakı MSW
   handler-ləri real API spec gələnə qədər kontraktdır. Auth endpoint-ləri
   (`/auth/login`, `/auth/me`) uydurma kontraktdır və belə işarələnib.
5. `plans/` (parent workspace) — uzunmüddətli iş axını sənədləridir.

## Mandatory Language Rules

Dil auditoriyaya görə seçilir (constitution Maddə I, v1.4.0):

- **Azərbaycan:** UI text, domain etiketi, istifadəçiyə görünən error mesajı,
  `locales/az/` dəyərləri, layihə sənədləşməsi (README, CLAUDE.md, `specs/`)
- **İngilis:** kod şərhləri (TS/TSX, skript, YAML, Dockerfile, CSS), commit
  mesajları, MR təsvirləri

Qalan qaydalar:

- `ə ı ğ ş ç ö ü` hərflərini düzgün yazmaq
- terminləri tərcümə/transliterasiya etməmək
- backend error mesajlarını "gözəl ingilis dili" ilə əvəzləməmək
- UI-də görünən string yalnız i18n açarı ilə (`t('...')`) — hardcoded mətn qadağandır
- heç bir string-i `Set-Content` və ya shell redirection ilə yazmamaq (UTF-8 korlanır)
- mövcud AZ şərhlər kütləvi çevrilmir — fayla toxunanda İngilisə keçirilir

Düzgün: `Məlumat tapılmadı` · `İcazə yoxdur` — Yanlış: `Data not found` · `Permission denied`

## Architecture Rules

### 1. FSD strukturu

```text
src/
  app/        # providers, routes (TanStack tree), router.ts, shell
  pages/      # overview, projects, team, reports, components, settings, not-found
  widgets/    # stats-cards, activity-feed — səhifə kompozisiyaları
  features/   # auth, projects, team, reports, settings
    <name>/   #   api/ model/ hooks/ components/ routes/
    <name>/model/constants.ts   # slice sabitləri (COLUMN_WIDTH, növ kodları)
  entities/   # project, member — domain tipləri və reusable entity logic
  shared/     # api, config, constants, i18n, lib, model, testing, ui
    constants/  # pagination, timing, http, storage, files, limits, ui — fayl üzrə import
  locales/    # az/, en/ — namespace JSON-ları
```

### 2. Layer Boundaries

- import yalnız aşağıya doğru: `app → pages → widgets → features → entities → shared`
- UI komponentlər API çağırışı etmir; API layer yalnız transport və DTO ilə işləyir
- server state dəyişiklikləri hook/query layer-də; business logic komponentlərdə yayılmır
- `shared` heç bir yuxarı layer-dən asılı deyil

### 3. Import Rules

- path alias: `@/*`; dərin nisbi import qadağandır
- kit import-ları yalnız subpath ilə: `@cbar/lib-react-ui-kit/button` — barrel qadağandır
- import istiqaməti lint ilə qorunur (`no-restricted-imports`)

### 4. Sabitlər (constitution Maddə XI, spec 032)

- **magic number yoxdur** — `@typescript-eslint/no-magic-numbers` (`detectObjects: true`,
  istisna `0 1 -1 2 100`, massiv indeksi, enum, tip literalı) `verify`-də `error`-dur
- cross-cutting sabit → `src/shared/constants/<mövzu>.ts`: `pagination` (`DEFAULT_PAGE_SIZE`,
  `LARGE_PAGE_SIZE`), `timing` (`SEARCH_DEBOUNCE_MS`, `QUERY_STALE_MS`, `API_TIMEOUT_MS`…),
  `http` (`HTTP_STATUS`), `storage` (`UI_STORE_KEY`, `AUTH_CHANNEL`…), `files`
  (`BYTES_PER_KB`, `XLSX_ACCEPT`), `limits`, `ui` (`COLUMN_WIDTH`, `ACTIONS_COLUMN_WIDTH`);
  barrel yoxdur — `import { DEFAULT_PAGE_SIZE } from '@/shared/constants/pagination'`
- slice sabiti → `features/<x>/model/constants.ts` (`pages/<x>/constants.ts`,
  `shared/<x>/constants.ts`); slice-dan kənarda lazım olanda `shared/constants`-a qalxır
- ad `SCREAMING_SNAKE_CASE`, obyekt `as const`, vahid sonluqda (`_MS`, `_PX`), İngilis şərh
- magic string də sabitdir: HTTP status (`HTTP_STATUS.NOT_FOUND`), storage açarı, növ kodu
  (`PRESS_RELEASE_TYPE.ANNOUNCEMENT`), status (`CONTENT_STATUSES`)
- `shared/config/` (brand, runtime-config) konfiqdir — sabit deyil, ora rəqəm daşınmır
- testdə konfiq dəyəri sabitdən import olunur; fikstür məlumatı literal qala bilər;
  `*.test.*`, `shared/testing/**`, `features/crud/fixtures/**` və sabit faylları azaddır
- Tailwind `[Npx]`: eyni ölçü ≥ 2 yerdə → `index.css` token-i; birdəfəlik Figma ölçüsü qalır

## Tech Stack Rules

React 19 · TypeScript (strict) · Vite · TanStack Router · TanStack Query · Zustand ·
Axios · React Hook Form + Zod · Tailwind CSS v4 · `@cbar/lib-react-ui-kit` ·
react-i18next · Vitest + Testing Library + MSW · ESLint + Prettier

Stack constitution Maddə II ilə kilidlidir — yeni runtime dependency yalnız spec ilə.
Icon, chart, date, class-merge kitabxanaları qadağandır (kit ödəyir).

## Data Fetching and Server State Rules

- server state yalnız TanStack Query ilə; mutation-lar `useMutation` ilə
- axın: UI → Query Hooks → Services → API Client (guideline §10.3)
- hər feature öz `api/<x>.service.ts` + `hooks/use<X>.ts` + query key factory saxlayır
- endpoint-lər MSW handler-lərindəki kontrakta uyğundur; real API spec gələndə
  yalnız handler-lər və service-lər yenilənir
- hər query üçün loading / empty / error / success UI-də görünür

## Auth, Roles and Security Rules

- JWT bearer modeli; access token **yalnız yaddaşda** (Zustand, persist-siz) —
  localStorage-da token qadağandır (guideline §16.13, kənarlaşma D4 spec 001-də);
  sessionStorage-da yalnız qeyri-həssas user snapshot
- `401` yeganə auto-logout statusudur; `5xx`, timeout, network error logout etmir
- logout = auth store clear + `queryClient.clear()` + `/login` redirect
- permission yoxlaması `<Can permission="...">` ilə — `user.role === "ADMIN"`
  müqayisəsi qadağandır; UI gate təhlükəsizlik deyil, real yoxlama backend-dədir
- user input validasiyası həmişə Zod schema ilə

## UI and Component Rules

Bu bölmə qəsdən qısadır — komponent seçimi, variant/colorPalette/size oxları,
subpath-lar və styling üçün **`ui-kit-usage` skill-i məcburidir**; dublikat etmə.

| Qonşu skill | Nə vaxt |
| --- | --- |
| `ui-kit-usage` | hər hansı UI yazılanda — hansı komponent, hansı subpath, hansı ox |
| `ui-kit-setup` | nəsə unstyled render olunanda, dark mode işləməyəndə |
| `ui-kit-review` | UI-ni kit-ə qarşı audit/align etmək istənəndə |
| `figma-page` | Figma link/səhifə adı veriləndə |

Əlavə qaydalar:

- rənglər yalnız semantik: `bg-background`, `text-muted-foreground` — heç bir
  hex/rgb/`bg-blue-600`
- `src/index.css`-in route B bloku toxunulmazdır; `styles.css` heç vaxt import edilmir
- `TooltipProvider` + `Toaster` yalnız bir dəfə, root-da
- reusable kompozisiyalar `shared/ui/` və ya `widgets/`-də; feature məzmunu `features/`-də

Component checklist:

- [ ] Props tipi müəyyənləşdirilib
- [ ] Rəqəm/açar literalı yoxdur — sabit `shared/constants` və ya slice `constants.ts`-dən gəlir
- [ ] Doğru layer seçilib (page/widget/feature/entity/shared)
- [ ] Loading və error vəziyyətləri nəzərə alınıb
- [ ] UI text i18n açarı ilə, Azərbaycan dilində
- [ ] Test yazılıb

## State Management Rules

Guideline §6.4 matrisi məcburidir: server = TanStack Query · paylaşılan client =
Zustand (`shared/model/ui-store.ts`, `features/auth/model/auth-store.ts`) · form =
RHF + Zod (schema feature model layer-ində) · URL = `validateSearch` (Zod-typed) ·
lokal = `useState`/`useReducer`. Global state yalnız real paylaşılan app state
üçündür; derived state saxlanılmır.

## Testing Rules

- yeni funksiya/dəyişiklik əvvəlcə test ilə izah olunur (TDD)
- testlər real istifadəçi davranışı üzərindədir; mock davranışını assert etmək qadağandır
- API mock yalnız MSW ilə (`shared/testing/handlers/`); custom render
  `shared/testing/render.tsx`-dən, data `factories.ts`-dən

```bash
npm run test        # watch
npm run test:run    # bir dəfə
npm run verify      # lint + typecheck + test + build — merge şərti (guideline §18.28)
```

Yalnız test run etmək yetməz — typecheck və lint də icra olunur; nəticəni süni
"pass" kimi qeyd etmək olmaz.

## Workflow Rules

**Kod yazmazdan əvvəl:** problem/requirement müəyyənləşdir; aktiv spec-i
(`specs/NNN-*/`) və constitution-u yoxla; uyğun layer və fayl yerini FSD üzrə seç;
MSW kontraktına bax.

**Yazarkən:** minimal və auditable patch; böyük refactor əvəzinə bir problemi
düzgün həll et; data/state axını aydın qalsın; UI text və error mesajları
Azərbaycan, kod şərhləri İngilis dilində; tez-tez verification.

**Bitirməzdən əvvəl:** typecheck, lint, aidiyyəti testlər; davranışın real
nəticəsini yoxla; əvvəl root cause, sonra fix; "işləyəcək" deyib bitirmə —
kanonik verification apar.

## Anti-patterns

- API çağırışını komponentdə yazmaq · hər state-i Context-də saxlamaq · monolit
  komponentlər · token-i localStorage-da saxlamaq · ingiliscə UI/error mesajı ·
  hardcoded UI mətni · hex/rgb rəng · kit əvəzinə hand-rolled control · barrel
  import · mock-ə əsaslanan test · test-siz feature · spec-siz kod dəyişikliyi ·
  status label-i "özündən uydurmaq" · magic number (`pageSize: 20`, `width: 140`,
  `status === 404`) · sabiti işləndiyi modulda gizlətmək · eyni rəqəmi iki yerdə yazmaq

## Implementation Checklist

- [ ] spec/plan/tasks mövcuddur və bu iş ona uyğundur
- [ ] feature və layer düzgün seçilib
- [ ] MSW kontraktı oxunub, DTO/model formaları müəyyən edilib
- [ ] Zod validasiya qaydaları müəyyən edilib
- [ ] sabitlər `shared/constants/<mövzu>.ts` və ya `model/constants.ts`-dədir, magic number yoxdur
- [ ] loading və error state-ləri var
- [ ] UI text i18n açarları ilə, Azərbaycan dilindədir
- [ ] hook, query, mutation və component strukturu FSD-yə uyğundur
- [ ] testlər yazılıb və run olunub
- [ ] `npm run verify` keçir

## Final Rule

Layihə yalnız "işləyən kod" deyil — domain-etibarlı, test edilə bilən, sabit
strukturlu, Azərbaycan-dilli və uzunmüddətli dəstəklənən məhsuldur. Hər dəyişiklikdə:

- Bu feature düzgün layer-dədir?
- Bu, aktiv spec və constitution ilə uyğundur?
- Bu API kontraktla (MSW handler-ləri) uyğun gəlir?
- Bu UI text Azərbaycan dilindədir və i18n açarı ilədir?
- Bu kod test oluna bilər və test olunub?
- Bu işin real verification-u var?

Yalnız hamısına "bəli" cavabı olan dəyişikliklər qəbul olunur.
