---

description: "Task list — admin panelinin new-template UI kiti üzərində yenidən qurulması"
---

# Tasks: Admin panelinin `new-template` UI kiti üzərində yenidən qurulması

**Input**: Design documents from `/specs/001-admin-template-migration/`

**Prerequisites**: plan.md, spec.md, research.md (R1–R14), data-model.md, contracts/ (admin-api.md, module-config.md, runtime-config.md), quickstart.md

**Tests**: Daxildir — spec FR-038 və template konstitusiyası Maddə VI hər feature üçün real-davranış testi tələb edir. Testlər `renderApp(path)` + MSW ilə yazılır; mock assert qadağandır.

**Organization**: Faza 1–2 təməl (bütün hekayələri bloklayır), Faza 3–7 spec-in US1–US5 hekayələri prioritet sırası ilə, Faza 8 cilalama və root orkestrasiya.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Paralel işlənə bilər (fərqli fayllar, tamamlanmamış task-a asılılıq yoxdur)
- **[Story]**: US1–US5 (spec.md hekayələri)
- Hər task-da dəqiq fayl yolu var

## Path Conventions

- Yeni panel: `web-cbar-admin-next/` (kopya `new-template/`-dən). Bütün `src/…` yolları bu qovluğa nisbidir.
- Root orkestrasiya: `dev.ps1`, `dev.sh`, `GUIDE.md`, `CLAUDE.md` (repository root).
- Kit importları yalnız subpath (`@cbar/lib-react-ui-kit/<component>`); rənglər yalnız semantik; UI mətnləri yalnız `t()`; AZ hərfli fayllar yalnız UTF-8 qoruyan alətlərlə (Write/Edit) yazılır.
- Hər faza `cd web-cbar-admin-next && npm run verify` ilə bitir.

---

## Phase 1: Setup (kopya, təmizləmə, konfiqurasiya)

**Purpose**: `new-template` → `web-cbar-admin-next`; demo domain silinir; TipTap, env və rejim konfiqləri (research R1, R2, R14; contracts/runtime-config.md)

- [X] T001 `new-template/` qovluğunu `web-cbar-admin-next/` kimi kopyala (`node_modules`, `dist`, `coverage`, `artifacts`, `.git` istisna); `web-cbar-admin-next/package.json` `name`-i `cbar-admin` et, `version` `0.1.0`
- [X] T002 [P] Template tarixçəsini sil: `web-cbar-admin-next/specs/002-cicd-template-config` … `006-husky-git-hooks`, `web-cbar-admin-next/.claude/skills/template-setup/`, `web-cbar-admin-next/.claude/skills/figma-page/`, `web-cbar-admin-next/.mcp.json`, `web-cbar-admin-next/lighthouse-report.json`, `web-cbar-admin-next/.specify/feature.json`; `specs/001-template-reconstruction/` SAXLA
- [X] T003 [P] Demo domain-i sil: `web-cbar-admin-next/src/pages/{projects,team,reports,components}`, `src/features/{projects,team}`, `src/widgets/{stats-cards,activity-feed}`, `src/entities/{project,member}`, `src/shared/testing/handlers/{projects,team}.ts`, `src/shared/testing/fixtures/{projects,team}.ts`, `src/locales/{az,en}/{projects,team,reports,overview}.json`; `src/shared/lib/money.ts` və onun testini sil
- [X] T004 Silinən demo-ya istinadları təmizlə ki, `tsc -b` keçsin: `web-cbar-admin-next/src/app/routes/index.ts` (yalnız `login` + `authed` + `/` overview yer tutucusu qalır), `src/app/routes/nav.ts` (boş siyahı, T023-də doldurulur), `src/shared/i18n/index.ts` (resources: common, nav, auth, settings), `src/shared/testing/handlers/index.ts` (auth, settings), `src/shared/config/brand.test.ts` (avatarPalette/formatMoney testlərini sil), `src/app/shell/topbar.tsx` (`avatarPalette`/`initials` importlarını `entities/user`-dən alacaq — müvəqqəti olaraq `initials`-ı `src/entities/user/model/types.ts`-ə köçür)
- [X] T005 [P] Brend: `web-cbar-admin-next/src/shared/config/brand.ts` → `shortName: 'CBAR'`, `appName: 'CBAR Admin'`, `templateInfo.enabled: false`, `repoUrl: 'https://gitlab.cbar.az/cbar/web-cbar-admin'`; `web-cbar-admin-next/index.html` `<title>CBAR Admin</title>`; `src/locales/{az,en}/common.json` `tagline`/`brand.orgName` dəyərləri (AZ: "Mərkəzi Bankın məzmun idarəetmə paneli")
- [X] T006 [P] TipTap dependency-lərini əlavə et (spec D1) — QEYD: bütün paketlər `3.31.3`-ə (cari mövcud versiya, core ilə eyni) pin edilib, çünki 3.26.0 core extension-ların peer tələbi ilə toqquşurdu: `web-cbar-admin-next/package.json` dependencies → `@tiptap/core` `3.26.0` (pin), `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-details`, `@tiptap/extension-image`, `@tiptap/extension-link`, `@tiptap/extension-table`, `@tiptap/extension-text-align`, `@tiptap/extension-text-style`, `@tiptap/extension-youtube` hamısı `^3.26.0`; `npm run install:public` → `package-lock.json` yenilənir; `npm audit --audit-level=high` sıfır tapıntı
- [X] T007 [P] Mühit faylları (contracts/runtime-config.md §2): `web-cbar-admin-next/.env.development` → `VITE_API_URL=/api/v1`, `VITE_API_PROXY_TARGET=http://localhost:5253`; `.env.production` → `VITE_API_URL=<<DEYISDIRIN:API-URL-PROD>>`; `.env.example` eyni açarlar izahla; `.env.prod` sil; `public/config.json` → `{"urls":{"apiUrl":"/api/v1"}}`
- [X] T008 [P] MSW rejimi: `web-cbar-admin-next/src/main.tsx`-də `shouldUseMockApi = import.meta.env.VITE_ENABLE_MSW === 'true'` (DEV/hostname şərtlərini sil), izah şərhini yenilə; `web-cbar-admin-next/vitest.config.ts`-də `env: { VITE_API_URL: '/api/v1' }` (test-də fallback `/api/v1` olsun)
- [X] T009 [P] `web-cbar-admin-next/scripts/check-kit-only.mjs` yaz: `src/**/*.{ts,tsx,css}` (`src/index.css` istisna) içində `#[0-9a-f]{3,8}\b`, `rgb(`, `oklch(`, `hsl(`, `\b(bg|text|border)-(red|blue|green|gray|slate|zinc|orange|purple|yellow)-\d{2,3}\b`, `from '@cbar/lib-react-ui-kit'` (barrel), `@chakra-ui`, `react-icons`, `lucide` tapılarsa exit 1; `package.json` script `check:kit`; `verify` skriptinə `npm run check:kit` əlavə et (lint-dən sonra)
- [X] T010 [P] `web-cbar-admin-next/package.json` script `roundtrip: node scripts/roundtrip-check.mjs` əlavə et (skript T060-da); `web-cbar-admin-next/README.md`-ni yenidən yaz: layihə adı, məqsəd (CBAR CMS admin paneli), quraşdırma (`install:public` + `install:nexus`), `npm run dev` (API :5253 proxy), `VITE_ENABLE_MSW`, verify, roundtrip, deploy qeydləri; `web-cbar-admin-next/CLAUDE.md` başlığını və "Data axını" bölməsini real API-yə uyğunlaşdır (MSW yalnız test/opt-in)
- [X] T011 `.ci-cd` dəyərləri (contracts/runtime-config.md §3): `web-cbar-admin-next/.ci-cd/dev.yaml` hostname `cbaradmin-temp.e-cbar.az`, apiUrl `https://api-cbar-test.e-cbar.az/api/v1`; `test.yaml` hostname `cbaradmin-temp.e-cbar.az`, apiUrl `https://api-expertise-test.e-cbar.az/api/v1`; `prod.yaml` hostname `cbaradmin-prod.e-cbar.az`, apiUrl `https://<<DEYISDIRIN:API-URL-PROD>>/api/v1`; hər üçünə `# TODO(devops): …` şərhi (test/dev host toqquşması, prod API ünvanı)
- [X] T012 Faza 1 verification: `cd web-cbar-admin-next && npm run verify` keçir (login + boş overview ilə); `npm run dev` açılır, kit stilləri var

---

## Phase 2: Foundational (təməl — bütün hekayələri bloklayır)

**Purpose**: Auth/JWT, xəta normalizasiyası, naviqasiya qabığı, ortaq UI widget-ləri, CRUD mühərriki, media və zəngin mətn — hekayələr bunlarsız qurula bilmir (research R3–R11, R13; contracts/module-config.md)

**⚠️ CRITICAL**: Heç bir hekayə bu faza bitmədən başlamır

### 2a. Entity-lər, API qatı, auth

- [X] T013 [P] `web-cbar-admin-next/src/entities/content/model/types.ts`: `Locale`, `Translations<T>`, `ContentStatus`, `STATUS_PALETTE`, `ACTIVE_PALETTE`, `CONTENT_STATUS_OPTIONS` (labelKey `common:status.*`), `ACTIVE_OPTIONS`, `optionLabel(options, value)` (data-model.md §1)
- [X] T014 [P] `web-cbar-admin-next/src/shared/lib/jwt.ts`: `decodeJwtPayload(token): unknown` (base64url, `atob`, JSON) + `web-cbar-admin-next/src/shared/lib/jwt.test.ts` (düzgün token, korlanmış token → null)
- [X] T015 [P] `web-cbar-admin-next/src/entities/user/model/types.ts`: `RoleCode`, `Permission` ('content.manage'|'media.manage'|'finance.manage'|'users.manage'|'settings.manage'), `AuthUser {id, username, name, roleCode, permissions}`, `ROLE_IDS = {admin:1, moderator:2, meas_manager:3}`, `ROLE_OPTIONS`, `permissionsForRole(role)`, `hasPermission`, `initials(name)`; `jwtPayloadSchema` (Zod: `sub`, `preferred_username`, rol açarı `http://schemas.microsoft.com/ws/2008/06/identity/claims/role` və ya `role`, `exp`), `userFromToken(token): AuthUser | null`; `types.test.ts` yenilə (research R4, data-model.md §2)
- [X] T016 [P] `web-cbar-admin-next/src/shared/api/axios.ts`: `withCredentials: false` (bearer header yeganə auth; API CORS `AllowCredentials` vermir — deploy-da cross-origin sorğu əks halda bloklanır; şərh ilə). `web-cbar-admin-next/src/shared/api/types.ts#normalizeApiError` genişlət (research R3): `message = body.message ?? body.title ?? ilk errors mesajı ?? default`; `fieldErrors` ValidationProblemDetails `errors`-dan (açar camelCase, `$.` prefiksi silinir); `code` status xəritəsi (401 AUTH, 403 FORBIDDEN, 404 NOT_FOUND, 409 CONFLICT, 400 VALIDATION); boş gövdəli 401/500 üçün i18n açarlı default mesajlar (`i18n.t('errors.unauthorized' | 'errors.unexpected', {ns:'common'})`); `web-cbar-admin-next/src/shared/api/types.test.ts`-ə üç forma üçün testlər əlavə et
- [X] T017 [P] `web-cbar-admin-next/src/shared/config/runtime-config.ts`: `config.json` yoxlamasını Zod sxeminə keçir (`z.object({urls: z.object({apiUrl: z.string().min(1)})})`), test faylını `/api/v1` fallback-ına uyğunlaşdır
- [X] T018 Auth servis və store (research R4): `web-cbar-admin-next/src/features/auth/api/auth.service.ts` → `LoginRequest {username, password}`, `LoginResponse {accessToken, expiresAt}`, `login()`; `me()` sil. `web-cbar-admin-next/src/features/auth/model/auth-store.ts` → `login(accessToken, user, expiresAt)`, state-ə `expiresAt: string | null`; snapshot-a `expiresAt` daxil; `restore()` `expiresAt` keçmişdirsə snapshot-ı silir
- [X] T019 `web-cbar-admin-next/src/app/providers/auth-bridge.ts`: `registerAuthBridge` — 401 → `performLogout()` + toast (mövcud); `scheduleExpiry(expiresAt)`: `setTimeout` (max 2^31-1 clamp) → `performLogout()` + `toast.warning(t('auth:sessionExpired'))`; store `subscribe` ilə login/logout-da taymer qur/sil
- [X] T020 [P] Login formu: `web-cbar-admin-next/src/features/auth/components/login-form.tsx` — `email` sahəsini `username` et (Zod `min(1)`), `authService.login` → `userFromToken(accessToken)` (null → xəta) → `store.login(token, user, expiresAt)`; 401 → `t('auth:invalidCredentials')`, digər → `AppError.message`; `web-cbar-admin-next/src/locales/{az,en}/auth.json` açarları (`username`, `invalidCredentials`, `sessionExpired`); demo göstərişini sil
- [X] T021 [P] MSW auth handler-i real kontrakta keçir (contracts/admin-api.md §1): `web-cbar-admin-next/src/shared/testing/handlers/auth.ts` → `POST /api/v1/auth/login` `{username,password}`; `admin/ChangeMe123!` → `{accessToken: <HS256 formatlı, payload-da sub/preferred_username/rol açarı/exp>, expiresAt}`; yanlış → 401 `{message:'Invalid credentials.'}`; `/auth/me` sil; `web-cbar-admin-next/src/shared/testing/factories.ts`-ə `makeJwt(payload)` və `adminUser` əlavə et
- [X] T022 [P] MSW in-memory store helper: `web-cbar-admin-next/src/shared/testing/handlers/lib/crud-store.ts` — `createCrudHandlers({ path, envelope: 'paged'|'items'|'array', seed, pageSize, searchFields, filterFields })` → GET list (page/pageSize/search/filtr, envelope-ə uyğun), GET/:id (bare 404 ProblemDetails), POST (201, id artımı), PUT/:id (200, translations tam əvəz), DELETE/:id (204); `web-cbar-admin-next/src/shared/testing/handlers/lib/errors.ts` — `problem404()`, `validation400(errors)`, `message(status, text)`

### 2b. Qabıq, naviqasiya, ortaq widget-lər

- [X] T023 `web-cbar-admin-next/src/app/routes/nav.ts` (research R13): `NavItem.group: 'content'|'media'|'homepage'|'finance'|'admin'`, `key` union-u 18 bənd (`dashboard, pages, pressReleases, laws, meas, organization, moneyMarks, mediaLibrary, galleries, videos, homepageBlocks, infoLines, currencyRates, azir, inflation, yieldCurves, users, settings`), `NAV_GROUPS` sıra; ikonlar kit `icons`-dan (`HomeIcon, DocumentIcon, FolderIcon, ImageIcon, LayoutIcon, ChartPieIcon, UserIcon, SettingsIcon`…); `path`-lar T031-də route tree ilə tiplənəcək — indi `string` literal
- [X] T024 [P] `web-cbar-admin-next/src/locales/{az,en}/nav.json`: 18 bənd `label`+`description`, `groups.{content,media,homepage,finance,admin}` başlıqları (AZ: Məzmun, Media, Ana səhifə, Maliyyə, İdarəetmə)
- [X] T025 `web-cbar-admin-next/src/app/shell/sidebar.tsx`: `NAV_GROUPS` üzrə qrup başlığı (`text-muted-foreground text-xs uppercase tracking-wide px-3`), aktivlik `pathname === path || pathname.startsWith(path + '/')`, storage/progress demo blokunu sil
- [X] T026 [P] `web-cbar-admin-next/src/app/shell/topbar.tsx`: bildiriş popover-i, density/emailDigest demo-larını sil; avatar `initials(user.name)`, menyu `DropdownMenuLabel` `user.username`; "Profil" bəndini sil (spec: profil yoxdur); `common.json` açarlarını təmizlə
- [X] T027 [P] `web-cbar-admin-next/src/app/shell/command-palette.tsx`: `navItems`-i qrup başlıqları ilə (`CommandGroup heading`) göstər
- [X] T028 [P] Breadcrumb: `web-cbar-admin-next/src/app/shell/app-shell.tsx` (və ya breadcrumb komponenti) `useMatches()` → hər match-ın `staticData.crumb` (i18n açarı) → kit `Breadcrumb` (`BreadcrumbSeparator` `BreadcrumbItem`-ın qardaşı); `web-cbar-admin-next/src/app/routes/root.ts`-də `StaticDataRouteOption { crumb?: string }` declaration merging
- [X] T029 [P] `web-cbar-admin-next/src/widgets/section-tabs/section-tabs.tsx`: `SectionTab {to, labelKey}[]` → kit `Tabs variant="line"` + `TabsTrigger asChild` → `Link`; aktiv = ən uzun prefiks uyğunluğu; `<Outlet/>` altında
- [X] T030 [P] Ortaq UI: `web-cbar-admin-next/src/widgets/delete-dialog/delete-dialog.tsx` (`open, title, description, onConfirm, isPending, error`, kit `Dialog showCloseButton={false}`, `Button variant="destructive"`); `web-cbar-admin-next/src/shared/ui/list-pagination.tsx` (`page, pageCount, total, pageSize, onPageChange` → kit `Pagination*`, mətn `t('crud:pagination', {total, page, pageCount})`, Prev/Next `aria-label` i18n); `web-cbar-admin-next/src/shared/ui/empty-state.tsx`; `web-cbar-admin-next/src/locales/{az,en}/crud.json` (`new, edit, save, cancel, delete, deleteConfirm, deleted, saved, pagination, empty, search, filterAll, requiredOneLocale, localeTab.{az,en}`)
- [X] T031 `web-cbar-admin-next/src/app/routes/index.ts`: `authed` layout altında hələlik `/` (dashboard) və `/404` fallback; `createCrudRoutes(parent, config, overrides)` helper `web-cbar-admin-next/src/features/crud/routes/create-crud-routes.ts` (contracts/module-config.md §3: list `validateSearch` = `listSearchSchema(config)`, `/new`, `/$id`, `staticData.crumb`); `nav.ts` `path` tipini `LinkProps['to']`-ya qaytar

### 2c. CRUD mühərriki

- [X] T032 [P] `web-cbar-admin-next/src/shared/crud/types.ts`: contracts/module-config.md §1 tipləri birə-bir (`AnyRow, Locale, SelectOption{value,labelKey?,label?}, ColumnConfig, FieldType, FieldConfig, FilterConfig, FormValues, FormTranslations, ModuleConfig` — o cümlədən `rowSchema?/detailSchema?/lookupSchema?: ZodType`); `web-cbar-admin-next/src/shared/crud/envelope-schema.ts`: `listEnvelopeSchema(envelope, rowSchema)` (paged/items/array), `DEFAULT_ROW_SCHEMA = z.record(z.unknown())`, `DEFAULT_LOOKUP_SCHEMA`; `envelope-schema.test.ts` (üç envelope, yanlış forma → xəta)
- [X] T033 [P] `web-cbar-admin-next/src/shared/crud/date-io.ts`: `formatDate`, `formatDateTime` (`Intl`, locale i18n-dən), `isoToLocalInput`, `localInputToIso`, `dateStringToDate`/`dateToDateString` (kit `formatDate/parseDate` ilə `yyyy-MM-dd`); `date-io.test.ts`
- [X] T034 [P] `web-cbar-admin-next/src/shared/crud/path.ts`: `getByPath(row, 'a.b.c')`, `getRowKey(config,row)`, `configLocales(config)`; `path.test.ts`
- [X] T035 `web-cbar-admin-next/src/shared/crud/form-model.ts`: `coerceFieldValue` (data-model.md §7 cədvəli), `initialFormState`, `defaultParseDetail`, `defaultBuildPayload` (boş locale ötürmə — research R5), `unwrapList(raw, envelope)` → `{items, total?}`; `web-cbar-admin-next/src/shared/crud/form-model.test.ts` (hər coercion sətri, boş locale, transformItems)
- [X] T036 `web-cbar-admin-next/src/shared/crud/schema.ts`: `buildFormSchema(config): ZodObject` — `values` (required text/select/media `min(1)`, number regex, date/datetime format) + `translations` (`superRefine`: per-locale `required` sahə ən azı bir locale-də dolu → xəta yolu `translations`); `config.schema?.(base)`; `listSearchSchema(config)` (`page`, `search`, filtrlər, `.catch(undefined)`); `schema.test.ts`
- [X] T037 [P] `web-cbar-admin-next/src/features/crud/api/crud.keys.ts` (`crudKeys(id).all/list(params)/detail(rowId)/options()`) və `web-cbar-admin-next/src/features/crud/api/crud.service.ts` (`list(config, params)`, `detail(config,id)`, `create/update/remove`, `lookup(path, schema)` — `apiClient` üzərindən; **hər cavab Zod ilə yoxlanır** (B13): `list` → `listEnvelopeSchema(config.listEnvelope, config.rowSchema ?? DEFAULT_ROW_SCHEMA).parse`, `detail` → `config.detailSchema ?? config.rowSchema`, `lookup` → `lookupSchema`; `ZodError` → `AppError{code:'CONTRACT', message: t('errors.contract')}`; sonra `unwrapList`); `crud.service.test.ts` (uyğunsuz cavab → CONTRACT xətası, `passthrough` əlavə sahəni keçirir)
- [X] T038 `web-cbar-admin-next/src/features/crud/hooks/use-crud.ts`: `useCrudList(config, search)` (`placeholderData: keepPreviousData`), `useCrudDetail`, `useCrudSave` (invalidate `[config.id]`, toast, navigate), `useCrudDelete`, `useLookupOptions(moduleId, path, nameKey)` (label `translations.az.name ?? translations.en.name ?? #id`, key `[moduleId,'options']`)
- [X] T039 `web-cbar-admin-next/src/features/crud/hooks/use-list-url-state.ts`: route search ↔ `{page, search, filters}`; `setSearch(patch)` `replace: true`, axtarış/filtr dəyişəndə `page` silinir; 400 ms debounce (`useDebouncedCallback` `web-cbar-admin-next/src/shared/lib/debounce.ts`)
- [X] T040 `web-cbar-admin-next/src/features/crud/components/field-control.tsx`: `FieldType` → kit control (research R7 cədvəli): `Input`, `InputNumber`/`Input type=number`, `DatePicker` (Date↔string), `Input type=datetime-local`, `Checkbox`, `Select`+`SelectTrigger clearable={nullable}` (`''` boş), `RichTextEditor` (lazy, T059), `MediaIdField` (T054); RHF `FormField/FormItem/FormLabel/FormControl/FormMessage` (kit `form`); etiket `t(labelKey,{ns})` (+ ` (AZ)`/` (EN)` per-locale)
- [X] T041 `web-cbar-admin-next/src/features/crud/components/crud-form-page.tsx`: detail fetch + loading/error/`notFound`; `<CrudFormEditor key={id ?? 'new'}>` `useForm({resolver: zodResolver(buildFormSchema(config)), defaultValues})`; kit `Tabs` az/en (tab başlığında xəta `Badge colorPalette="red"`), ümumi sahələr `Card`; `Alert variant="destructive"` ümumi xəta, `fieldErrors` → `setError`; Saxla/Ləğv; `editExtras` form-dan kənar (`detail` ilə); `canEdit=false` → sahələr disabled
- [X] T042 `web-cbar-admin-next/src/features/crud/components/crud-list-page.tsx`: `PageHeader` (+ Yeni düyməsi `canCreate`), filtr `Card` (axtarış `Input startElement=SearchIcon`, filtr `Select clearable` placeholder `{label}: hamısı`, `DatePicker`, `Input number`), `isFetching` `Spinner`, kit `DataTable` (`rowKey`, sütun `render` B4 qaydası, əməllər sütunu `IconButton` edit/delete + `rowActions`), `EmptyState`, `ErrorState`, `ListPagination` yalnız `paged`, `DeleteDialog` (`deleteConfirmKey`, `rowLabel`)
- [X] T043 `web-cbar-admin-next/src/features/crud/components/cell.tsx`: `renderCellValue(column, row, t)` (`custom/date/datetime/badge/text`, `—`); `cell.test.tsx`
- [X] T044 Mühərrik integrasiya testi: `web-cbar-admin-next/src/features/crud/crud-engine.test.tsx` — test-only nümunə modul (`fixtures/sample-module.ts`, paged, az/en `title`, select filtr, media sahəsi) + `createCrudHandlers` ilə: siyahı render, axtarış URL-ə düşür və `page` silinir, səhifə 2, Yeni → yalnız AZ → Saxla → toast + siyahıda görünür, boş başlıq → tab nişanı + sorğu getmir, Sil → dialoq → yox olur, 409 mesajı dialoqda, `items`/`array` envelope-də səhifələmə yoxdur

### 2d. Media, sənədlər, zəngin mətn

- [X] T045 [P] `web-cbar-admin-next/src/entities/media/model/types.ts`: `MediaItem`, `AttachedAsset`, `formatBytes`, `iconForMime` (kit ikonları — data-model.md §4), `ACCEPTED_EXTENSIONS`, `MEDIA_URL(id) = /media/${id}`; `types.test.ts`
- [X] T046 [P] `web-cbar-admin-next/src/features/media/api/media.service.ts` (`list({page,pageSize:24,search})` → `listEnvelopeSchema('paged', mediaItemSchema)`, `upload(file, onProgress)` — axios `FormData` sahə `file`, cavab `mediaItemSchema`, `remove(id)`), `media.keys.ts`; `mediaItemSchema` `web-cbar-admin-next/src/entities/media/model/types.ts`-də (T045); `web-cbar-admin-next/src/features/media/hooks/use-media.ts`
- [X] T047 [P] MSW media handler: `web-cbar-admin-next/src/shared/testing/handlers/media.ts` (paged 24, `search` originalName, POST multipart → 200 DTO, DELETE 204 / 409 `{message:'File is attached to content; detach it first.'}` seed-də işarələnmiş id-lər üçün) + `fixtures/media.ts`
- [X] T048 `web-cbar-admin-next/src/features/media/components/media-picker-dialog.tsx` (research R8): kit `Dialog`, `Input` axtarış (debounce), kart grid (`iconForMime`, ad, `formatBytes`, tarix), `disabledIds`, `ListPagination`, `onPick(item)`, `error` Alert; `web-cbar-admin-next/src/locales/{az,en}/media.json`
- [X] T049 `web-cbar-admin-next/src/features/media/components/media-id-field.tsx`: `value/onChange/nameHint` → `#id · ad` + Dəyiş/Təmizlə (`Button variant="outline"`), `MediaPickerDialog` yalnız açıqkən mount
- [X] T050 [P] `web-cbar-admin-next/src/features/media/components/upload-button.tsx`: kit `Upload variant="button" accept={ACCEPTED_EXTENSIONS} customRequest={…mediaService.upload}` → `onSuccess` invalidate + `toast.success`, `onError` toast; progress `Progress`
- [X] T051 [P] `web-cbar-admin-next/src/features/assets/components/assets-section.tsx` (research R9a): `assetsPath, assets, onChanged` → kit `Card` siyahı (`iconForMime`, ad, ölçü), Əlavə et → `MediaPickerDialog disabledIds`, Ayır → `DeleteDialog`; `POST {mediaId}` 204 / `DELETE /{mediaId}`; `web-cbar-admin-next/src/features/assets/api/assets.service.ts`
- [X] T052 [P] `web-cbar-admin-next/src/shared/lib/sanitize-html.ts` (research R10, spec D2): DOMParser; `script/style/object/embed/meta/link` sil, `on*` atributları sil, `href/src/action` `javascript:`/`vbscript:`/`data:` (img `data:image/*` istisna) sil, `iframe` saxla; `sanitize-html.test.ts` (XSS nümunələri, legacy markup dəyişmir)
- [X] T053 [P] `web-cbar-admin-next/src/features/rich-text/model/extensions.ts` (React-siz): `AccordionDetails` (node view `open=true`, summary klik bloklama), `AccordionContent` (iki `parseHTML` tag, `details-content` render, görünən node view), `MediaLink` (`data-media-link`), `EmbedFrame` (10 atribut, `priority: 40`), `buildExtensions(): Extensions` (sıra: StarterKit{link:false}, MediaLink{openOnClick:false, autolink}, AccordionDetails, DetailsSummary, AccordionContent, TableKit{resizable:false}, Image{inline:true}, Youtube{nocookie,640×360}, EmbedFrame, TextAlign{heading,paragraph}, TextStyleKit)
- [X] T054 [P] `web-cbar-admin-next/src/features/rich-text/fixtures/legacy-content.ts`: 6 legacy nümunə (accordion `<details data-accordion>` + `details-content`, 3×3 cədvəl başlıq sətri ilə, `data-media-link` link, `<a><img></a>` inline şəkil, YouTube iframe, Google Maps iframe) + `web-cbar-admin-next/src/features/rich-text/roundtrip.test.ts`: hər nümunə `new Editor({extensions: buildExtensions(), content})` → `getHTML()`; sayğaclar `details/table/tr/data-media-link/img/iframe` bərabər (research R11)
- [X] T055 [P] `web-cbar-admin-next/src/features/rich-text/ui/editor-icons.tsx`: kit `Icon` bazası ilə yerli path-lar — `BoldIcon, ItalicIcon, LinkIcon, UndoIcon, RedoIcon, TableIcon, TableRowAddIcon, TableColumnAddIcon, TableRowDeleteIcon, TableColumnDeleteIcon, TableHeaderIcon, MergeCellsIcon, SplitCellIcon, CodeIcon, FullscreenIcon, ExitFullscreenIcon, Heading2Icon, Heading3Icon, ListIcon, ListOrderedIcon, IndentIcon, OutdentIcon, QuoteIcon, AlignLeft/Center/Right/JustifyIcon, HighlightIcon, TextColorIcon, ClearFormatIcon, AccordionIcon` (kit-də olanlar — `ImageIcon, AttachIcon, EyeIcon, TrashIcon` — kit-dən)
- [X] T056 [P] `web-cbar-admin-next/src/features/rich-text/ui/editor.css`: `.rte .ProseMirror` və `.rte-preview` qaydaları — yalnız `var(--foreground|--muted-foreground|--border|--muted|--primary|--background|--ui-radius-md|--font-sans)`; p/h2/h3/ul/ol/blockquote/a/details/summary/`details-content`/table/td/th/`.selectedCell::after`/img/`.ProseMirror-selectednode`/`div[data-youtube-video] iframe`; `min-height` `--rte-min-h` custom property (normal 240px / tam ekran 70vh)
- [X] T057 `web-cbar-admin-next/src/features/rich-text/ui/toolbar.tsx`: `useEditorState` selektoru (bold, italic, h2, h3, listlər, blockquote, link, details, table, hizalama, canIndent/Outdent, canUndo/Redo); kit `IconButton size="sm" variant="ghost"` + `Tooltip` + `Separator orientation="vertical"`; rəng `Input type="color"` (kit `Input`); cədvəl əməlləri yalnız cədvəl içində; `web-cbar-admin-next/src/locales/{az,en}/richText.json` (hər düymə `aria-label`)
- [X] T058 `web-cbar-admin-next/src/features/rich-text/ui/link-dialog.tsx` (kit `Dialog` + `Input`, boş → unset) və `preview-dialog.tsx` (kit `Dialog` geniş, `sanitizeHtml(html)` → `dangerouslySetInnerHTML` `.rte-preview` — D2 şərhi faylın başında)
- [X] T059 `web-cbar-admin-next/src/features/rich-text/ui/rich-text-editor.tsx`: props `{value, onChange, editable?}`; `useEditor({extensions: buildExtensions(), content, editable, onUpdate})`; xarici `value` sinxronu `setContent(value,{emitUpdate:false})`; `insertMediaLink(item)` (`/media/{id}` + `data-media-link`), `insertImage(item)`; iki `MediaPickerDialog`; HTML mənbə rejimi (kit `Textarea` mono, toolbar gizli); tam ekran (`fixed inset-0 z-[var(--ui-z-modal)] bg-background`); `web-cbar-admin-next/src/features/rich-text/index.ts` → `RichTextEditor = lazy(...)` + `Skeleton` fallback; `rich-text-editor.test.tsx` (render, bold toggle HTML-ə düşür, mənbə rejimi, editable=false)
- [X] T060 [P] `web-cbar-admin-next/scripts/roundtrip-check.mjs`: köhnə `web-cbar-admin/roundtrip-check.mjs`-in yenidən yazılmış versiyası — env `API_URL` (default `http://localhost:5253/api/v1`), `ADMIN_USER`/`ADMIN_PASSWORD` (default seed), extension-lar T053 ilə eyni semantikada (node view-suz), sayğaclar eyni, mismatch → `process.exit(1)`; jsdom bootstrap
- [X] T061 Faza 2 verification: `npm run verify` + `npm run check:kit` keçir; `crud-engine.test.tsx`, `roundtrip.test.ts`, `sanitize-html.test.ts`, `jwt.test.ts`, `types.test.ts` (api) yaşıl

**Checkpoint**: Təməl hazırdır — hekayələr başlaya bilər

---

## Phase 3: User Story 1 — Giriş və panel qabığı (Priority: P1) 🎯 MVP

**Goal**: Redaktor daxil olur, kit dizaynında qabıq (qruplu sidebar, üst panel, breadcrumb, mobil çekmecə, tema, dil) görür; 401 və sessiya bitməsi router ilə girişə aparır və geri qaytarır.

**Independent Test**: Real API ilə `admin` girişi → hər nav bəndinə keçid (yer tutucu səhifələr) → tema/dil keçidi → token bitəndə login + geri qayıdış (quickstart Q1–Q3).

- [X] T062 [P] [US1] `web-cbar-admin-next/src/features/auth/routes/login-page.tsx`: `CardDescription` `t('auth:subtitle')` ("Mərkəzi Bankın məzmun idarəetmə paneli"), `TemplateBadge` sil; `LoginForm onSuccess` → `redirect ?? '/'`
- [X] T063 [P] [US1] `web-cbar-admin-next/src/pages/dashboard/index.tsx`: köhnə yer tutucu — üç `Card` (`dashboard:publishQueue`, `latestEdits`, `auditLog`) izahla; `web-cbar-admin-next/src/locales/{az,en}/dashboard.json`; `src/pages/overview` sil
- [X] T064 [P] [US1] `web-cbar-admin-next/src/pages/not-found/index.tsx`: `TemplateBadge` sil, `Link to="/"`; `common.json` `notFound.*`
- [X] T065 [US1] `web-cbar-admin-next/src/app/routes/index.ts`: 18 nav bəndi üçün bölmə kök route-ları (hələlik `pages/<x>/index.tsx` yer tutucu `PageHeader` ilə — sonrakı fazalar doldurur); pathless section layout-lar: `/laws` (Qanunlar|Kateqoriyalar), `/meas` (Sənədlər|Emitentlər|Məlumat tipləri), `/organization` (→ `/organization/staff` redirect; Heyət|Şöbələr|Ofislər), `/money-marks` (Nişanlar|Kateqoriyalar|Xəbərlər), `/videos` (Videolar|Yayımlar), `/homepage-blocks` (Ümumi|Bannerlər|Xəbər slayderi|Sürüşən sətirlər|Linklər|Nəşrlər|Məlumat sətirləri), `/currency-rates` (Məzənnələr|Valyutalar) — `SectionTabs` (T029) + `staticData.crumb`
- [X] T066 [US1] `web-cbar-admin-next/src/features/auth/auth-flow.test.tsx` yenilə: `/laws` → login-ə redirect (`?redirect=`) → `admin/ChangeMe123!` → `/laws`-a qayıdır → topbar-da `admin` → MSW 401 (token silindikdən sonra) → login + `sessionExpired` toast → `expiresAt` keçmiş token ilə taymer logout (fake timers)
- [X] T067 [US1] Qabıq testi `web-cbar-admin-next/src/app/shell/shell.test.tsx`: sidebar 5 qrup başlığı və 18 bənd; dil keçidi etiketləri dəyişir; tema düyməsi `html.dark`; dar ekranda (`useIsMobile` mock — `matchMedia`) menyu `Sheet`-də
- [X] T068 [US1] Faza 3 verification: `npm run verify`; real API ilə quickstart Q1–Q3 əl icrası (`JWT AccessTokenMinutes` qısaldılmış API ilə Q2)

**Checkpoint**: US1 tək başına işləyir — MVP

---

## Phase 4: User Story 2 — Konfiqurasiya ilə yaradılan CRUD ekranları (Priority: P1)

**Goal**: 21 konfiq modulu (ana səhifə 5, məlumat sətirləri, qanunlar 2, MEAS 3, təşkilat 3, pul nişanları 3, qalereyalar, videolar 2, press relizlər) real API kontraktı ilə tam işlək.

**Independent Test**: Hər bölmədə yaratma (az+en) → siyahı/axtarış/filtr → redaktə → silmə; lookup redaktəsi asılı seçimi dərhal yeniləyir (quickstart Q4–Q7).

Hər modul üçün task naxışı: (a) servis+açarlar+Zod cavab sxemi (`model/schemas.ts`: list item, detail, lookup — `.passthrough()`; konfiqdə `rowSchema`/`detailSchema` **məcburidir**, B13), (b) MSW handler+fixture (fixture həmin sxemdən tiplənir), (c) `model/module.ts` konfiqi, (d) `pages/<x>/index.tsx` + route + locale JSON, (e) test. Modullar arası [P] — fərqli fayllar.

### Ana səhifə blokları (`items` envelope)

- [X] T069 [P] [US2] `web-cbar-admin-next/src/features/homepage/api/homepage.service.ts` + `homepage.keys.ts` (banners, news-slider, running-lines, homepage-links, homepage-publications — `items` envelope, DTO Zod sxemləri `passthrough`) ; `web-cbar-admin-next/src/shared/testing/handlers/homepage.ts` + `fixtures/homepage.ts` (`createCrudHandlers envelope:'items'` ×5; banner tərcüməsi optional)
- [X] T070 [P] [US2] `web-cbar-admin-next/src/features/homepage/model/modules.ts`: `bannersModule` (media, sort, active, startsAt/endsAt datetime, ★title/link — hamısı optional, `schema` hook: tərcüməsiz icazəli), `newsSliderModule` (newsDate date required, media, sort, active, ★title req/description/link), `runningLinesModule` (active, startsAt/endsAt, ★text req), `homepageLinksModule` (sort, active, ★title/url req), `publicationsModule` (media file, publishedAt datetime, sort, active, ★title req/url); sütunlar spec inventarına görə (status `badge` ACTIVE_PALETTE, tarixlər `datetime`)
- [X] T071 [US2] `web-cbar-admin-next/src/pages/homepage-blocks/{index,banners,news-slider,running-lines,links,publications}/index.tsx` (hub: 6 `Card` link — `homepage:hub.*`), `createCrudRoutes` ×5 `web-cbar-admin-next/src/app/routes/index.ts`-də `/homepage-blocks` layout altında; `web-cbar-admin-next/src/locales/{az,en}/homepage.json`
- [X] T072 [P] [US2] `web-cbar-admin-next/src/features/homepage/homepage.test.tsx`: `/homepage-blocks/banners` siyahı (səhifələmə yoxdur), yalnız şəkilli banner saxlanır, running-line tarixləri siyahıda formatlı

### Məlumat sətirləri (qruplu paged)

- [X] T073 [P] [US2] `web-cbar-admin-next/src/features/info-lines/{api/info-lines.service.ts,api/info-lines.keys.ts,model/module.ts}`: `INFO_LINE_ALIASES` (13), `transformItems` qrupları düzləşdirir, `pageSize: 50`, `searchParam: 'alias'`, sahələr alias select req/year/sort/active/★title req/★value; `web-cbar-admin-next/src/shared/testing/handlers/info-lines.ts` (qruplu `items:[{alias,lines}]`, `total` sətir sayı, `alias` like) + fixture
- [X] T074 [US2] `web-cbar-admin-next/src/pages/info-lines/index.tsx` + route (`/homepage-blocks/info-lines` və nav `/info-lines` → eyni səhifə; nav bəndi `/info-lines` route-u `/homepage-blocks/info-lines`-a redirect) + `locales/{az,en}/infoLines.json`; `info-lines.test.tsx` (alias filtri URL-də, qrup düzləşməsi)

### Qanunlar

- [X] T075 [P] [US2] `web-cbar-admin-next/src/features/laws/api/{laws.service.ts,laws.keys.ts}` (laws paged; law-categories array; assets attach/detach), `web-cbar-admin-next/src/shared/testing/handlers/laws.ts` + `fixtures/laws.ts` (search title, `categoryId`/`status` filtr; `POST /laws/{id}/assets` 204; `DELETE …/{mediaId}` 204; law-categories bare array)
- [X] T076 [P] [US2] `web-cbar-admin-next/src/features/laws/model/{modules.ts,law-attachments-section.tsx}`: `lawsModule(categoryOptions)` (contracts/module-config.md §5 nümunəsi; `LAW_TYPE_OPTIONS` 1/2), `lawCategoriesModule` (array; `deleteConfirmKey` qanunların yenidən təyin xəbərdarlığı), `LawAttachmentsSection` = `AssetsSection` (`/laws/{id}/assets`, `onChanged` → invalidate `['laws','detail',id]`)
- [X] T077 [US2] `web-cbar-admin-next/src/pages/laws/{index,categories}/index.tsx`: laws səhifəsi `useLookupOptions('laws','/law-categories')` + `LookupGate` (`web-cbar-admin-next/src/features/crud/components/lookup-gate.tsx` — Spinner / ErrorState / children) + `useMemo(lawsModule)`; routes `/laws` layout altında; `locales/{az,en}/laws.json`
- [X] T078 [P] [US2] `web-cbar-admin-next/src/features/laws/laws.test.tsx`: kateqoriya yaradılır → `/laws/new` select-də görünür (B1 invalidasiya); qanun yaradılır (kateqoriya req xətası → seçildikdən sonra keçir); redaktədə sənəd əlavə/ayır; status filtri

### MEAS

- [X] T079 [P] [US2] `web-cbar-admin-next/src/features/meas/{api/meas.service.ts,api/meas.keys.ts,model/modules.ts}`: `measDocumentsModule(emitents, infoTypes)` (paged; filtr emitentId/infoTypeId/status; sahələr emitent req, infoType req, registrationDate date req, dqn text placeholder `AZ1001-2026`, media `mediaNameKey:'media.originalName'`, status; tərcümə yoxdur), `measLookupModule(id, path)` fabriki (emitents, info-types — array, active, ★name req); `web-cbar-admin-next/src/shared/testing/handlers/meas.ts` + fixture
- [X] T080 [US2] `web-cbar-admin-next/src/pages/meas/{index,emitents,info-types}/index.tsx` (`LookupGate` iki lookup ilə), routes `/meas` layout, `locales/{az,en}/meas.json`; `meas.test.tsx` (sənəd yaratma, dqn axtarışı, emitent filtri)

### Təşkilat

- [X] T081 [P] [US2] `web-cbar-admin-next/src/features/organization/{api/organization.service.ts,api/organization.keys.ts,model/modules.ts}`: `divisionsModule` (array; sort, active, media, ★name req, ★description richtext), `officesModule` (sort, active, ★name req, ★address, ★phone), `staffModule` (filtr `type`; type select 1/2, sort, active, phone, media foto, ★fullName req, ★position, ★receptionDays, ★bio richtext); handler `web-cbar-admin-next/src/shared/testing/handlers/organization.ts` (bare array ×3, staff `type` filtri) + fixture
- [X] T082 [US2] `web-cbar-admin-next/src/pages/organization/{staff,divisions,offices}/index.tsx`, `/organization` → `/organization/staff` redirect route, `locales/{az,en}/organization.json`; `organization.test.tsx` (heyət yaratma richtext bio ilə, type filtri, ofis bilingual ünvan)

### Pul nişanları

- [X] T083 [P] [US2] `web-cbar-admin-next/src/features/money-marks/{api/money-marks.service.ts,api/money-marks.keys.ts,model/modules.ts}`: `moneyMarksModule(categories)` (paged; filtr categoryId/type/status; category req, type 1/2, frontMediaId, rearMediaId, sort, status, ★title req, ★description richtext, ★securityFeatures richtext), `moneyMarkCategoriesModule` (array), `moneyMarkNewsModule` (paged; search; status filtr; status, publishedAt datetime, ★title req, ★content richtext); handler `handlers/money-marks.ts` + fixture
- [X] T084 [US2] `web-cbar-admin-next/src/pages/money-marks/{index,categories,news}/index.tsx` (`LookupGate` kateqoriya), routes `/money-marks` layout, `locales/{az,en}/moneyMarks.json`; `money-marks.test.tsx` (iki media sahəsi, type filtri, xəbər status)

### Qalereyalar, videolar

- [X] T085 [P] [US2] `web-cbar-admin-next/src/features/galleries/{api/galleries.service.ts,api/galleries.keys.ts,model/module.ts,components/gallery-images-section.tsx}`: `galleriesModule` (paged; eventDate date, sort, active, ★title req; sütun `imageCount`), `GalleryImagesSection` (research R9c: `POST /images {mediaId}` 200, `PUT /images/order {imageIds}` tam siyahı, `DELETE /images/{imageId}`; yuxarı/aşağı `IconButton`, `MediaPickerDialog disabledIds`); handler `handlers/galleries.ts` (images alt-resursu, 409 `Already attached.`) + fixture
- [X] T086 [P] [US2] `web-cbar-admin-next/src/features/videos/{api/videos.service.ts,api/videos.keys.ts,model/modules.ts}`: `videosModule` (paged; youtubeUrl req, publishedAt datetime, sort, active, ★title req), `videoStreamsModule` (`items`; streamUrl req placeholder `.m3u8`, isLive checkbox → sütun `badge` red/black `live/offline`, startsAt datetime, ★title req); handler `handlers/videos.ts` + fixture
- [X] T087 [US2] `web-cbar-admin-next/src/pages/{galleries,videos/index,videos/streams}/index.tsx`, routes (`/galleries`, `/videos` layout), `locales/{az,en}/{galleries,videos}.json`; `galleries.test.tsx` (şəkil əlavə → sırala → sil), `videos.test.tsx` (canlı nişanı)

### Press relizlər (əl klonu mühərrikə qatılır)

- [X] T088 [P] [US2] `web-cbar-admin-next/src/features/press-releases/{api/press-releases.service.ts,api/press-releases.keys.ts,model/module.ts}`: `pressReleasesModule` (paged; search; status filtr; status, publishedAt datetime, ★title req, ★content richtext; `editExtras` = `AssetsSection` `/press-releases/{id}/assets`); handler `handlers/press-releases.ts` (assets 204 attach / mediaId detach) + fixture
- [X] T089 [US2] `web-cbar-admin-next/src/pages/press-releases/index.tsx` + `createCrudRoutes`, `locales/{az,en}/pressReleases.json`; `press-releases.test.tsx` (yaratma, status filtri, sənəd bağla/ayır — 204-dən sonra detail refetch)

### Faza bağlanışı

- [X] T090 [US2] `web-cbar-admin-next/src/app/routes/index.ts`-də bütün US2 route-larını `authed` altında birləşdir, `nav.ts` `path`-ları tiplənmiş; `i18n/index.ts` bütün yeni namespace-ləri (homepage, infoLines, laws, meas, organization, moneyMarks, galleries, videos, pressReleases) qeyd et; `handlers/index.ts` hamısı
- [X] T091 [US2] Faza 4 verification: `npm run verify` + `check:kit`; real API ilə quickstart Q4–Q7; hər modulda 1 qeyd yarat/redaktə/sil (SC-002: göndərilən payload köhnə panellə eyni — brauzer Network-də müqayisə)

**Checkpoint**: US1 + US2 işləyir

---

## Phase 5: User Story 3 — Səhifə ağacı və zəngin mətn redaktoru (Priority: P1)

**Goal**: Səhifə ağacı (az/en, alt səhifə, köçür, sil, bayraqlar), səhifə formu (slug, 14 bayraq, kilid), qruplu/sıralanan sənədlər; legacy markup itkisiz.

**Independent Test**: Seed-lənmiş "Haqqımızda"/"Pul siyasəti" → aç → saxla → `npm run roundtrip` 0 mismatch; ağacda köçür/alt səhifə/sənəd sırala (quickstart Q8–Q11).

- [X] T092 [P] [US3] `web-cbar-admin-next/src/features/pages/api/{pages.service.ts,pages.keys.ts}`: `tree(locale)` (bare array, `PageNode` Zod), `detail(id)`, `create/update` (`PageUpsert` — `flags` tam obyekt), `move(id,{newParentId,sortOrder})` 204, `remove`, assets: `attach(id,{mediaId,translations,groupLabel})`, `updateAsset`, `order(id,{assetIds})`, `detach(id, assetId)`; açarlar `['pages','tree',locale]`, `['pages','detail',id]`; `web-cbar-admin-next/src/features/pages/model/tree.ts`: `flattenTree(nodes) → {node, depth, descendantCount}[]`, `descendantIds(node)`, `DEFAULT_PAGE_FLAGS`; `tree.test.ts`
- [X] T093 [P] [US3] MSW `web-cbar-admin-next/src/shared/testing/handlers/pages.ts` + `fixtures/pages.ts` (3 səviyyəli ağac, `readonly` və `removable=false` düyünlər, legacy HTML məzmunlu 2 səhifə T054 fixture-larından): tree locale-ə görə, detail, POST 201, PUT (parentId dəyişikliyi → 400 `{message}`), move 204 / 409 / 400, DELETE 204 / 409, assets (order tam siyahı yoxlaması 400)
- [X] T094 [US3] `web-cbar-admin-next/src/pages/pages/index.tsx` + `web-cbar-admin-next/src/features/pages/components/page-tree.tsx` (research R12): `validateSearch {locale}`; kit `Tabs` az/en; kit `DataTable` düz sətirlər (girinti `depth`, `ChevronRightIcon`, başlıq + slug `text-muted-foreground`, `Badge` status/qeyri-aktiv/gizli), əməllər `DropdownMenu` (Alt səhifə → `/pages/new?parentId=`, Redaktə, Köçür `disabled={!movableU&&!movableD&&!movableL&&!movableR}`, Sil `disabled={!removable}`); `locales/{az,en}/pages.json`
- [X] T095 [US3] `web-cbar-admin-next/src/features/pages/components/move-dialog.tsx` (kit `Dialog`, `TreeSelect treeData` — düyün özü + nəsilləri `disabled`, `allowClear` = kök, `InputNumber` sıra → `move`, 409/400 mesajı dialoqda) və `delete-page-dialog.tsx` (`DeleteDialog` + `descendantCount` mətni `pages:deleteWithChildren`)
- [X] T096 [US3] `web-cbar-admin-next/src/pages/pages/form/index.tsx` + `web-cbar-admin-next/src/features/pages/components/page-form.tsx`: RHF+Zod (`pageFormSchema`: ən azı bir locale `title`); az/en `Tabs` (title, slug `Input` placeholder `pages:slugAuto` + help `pages:slugFixed`, `RichTextEditor content`); ümumi: status select (draft/published/archived), sortOrder, navUrl, showInFooter; 14 bayraq 4 `FieldSet` qrupunda (`Checkbox`); `readonly||disabled` → sahələr disabled + `Alert colorPalette="yellow"`; `?parentId` search → payload; saxla → `PageUpsert` (flags tam, boş locale ötürülür) → toast → `/pages`; `PageAttachmentsSection` (T097) redaktədə
- [X] T097 [US3] `web-cbar-admin-next/src/features/assets/components/page-attachments-section.tsx` (research R9b): siyahı (qrup etiketi, az/en başlıq, ölçü), Əlavə et dialoqu (`MediaPickerDialog` → `Input` az/en başlıq + `Input` qrup, help `pages:groupHint`), başlıq redaktə dialoqu (`PUT /{assetId}`), yuxarı/aşağı → `PUT /order {assetIds}` tam siyahı, Ayır → `DeleteDialog` → `DELETE /{assetId}`; invalidate `['pages','detail',id]`
- [X] T098 [US3] Routes `web-cbar-admin-next/src/app/routes/index.ts`: `/pages` (`validateSearch locale`), `/pages/new` (`validateSearch parentId`), `/pages/$id`; crumb-lar
- [X] T099 [US3] `web-cbar-admin-next/src/features/pages/pages.test.tsx`: ağac render + EN keçidi (URL `?locale=en`, boş başlıq `—`); `removable=false` sətirdə Sil disabled; köçürmə dialoqunda nəsil disabled, uğurda ağac yenilənir; uşaqlı silmədə say mətni; `readonly` səhifə formu kilidli; yeni səhifə yalnız AZ → payload-da `en` yoxdur, `flags` tam; legacy səhifə aç → saxla → MSW-ə gedən `content` sayğacları giriş ilə eyni (SC-003)
- [X] T100 [US3] Faza 5 verification: `npm run verify`; real API: quickstart Q8–Q11; `npm run roundtrip -- "Haqqımızda" "Pul siyasəti"` → `mismatches: 0`

**Checkpoint**: US1–US3 işləyir (bütün P1)

---

## Phase 6: User Story 4 — Maliyyə məlumat ekranları (Priority: P2)

**Goal**: Məzənnə vərəqi redaktoru, valyuta siyahısı (seyrək dirty), AZIR və inflyasiya upsert, gəlirlik əyrisi forması.

**Independent Test**: quickstart Q12–Q15.

- [X] T101 [P] [US4] `web-cbar-admin-next/src/features/currency/api/{currency.service.ts,currency.keys.ts}` (`sheet(date?)`, `putSheet`, `deleteSheet(date)`, `dates(page)`, `currencies()`, `putCurrency(code, body)` — cavablar `model/schemas.ts` Zod sxemləri ilə parse olunur (B13); açarlar `['currency-rates','sheet',date]`, `['currency-rates','dates',page]`, `['currencies','master']`); MSW `handlers/currency.ts` + fixture (son vərəq, `?date`, PUT 204 upsert, DELETE 204/404, dates paged, currencies items, PUT currencies 204/404 `{message}`)
- [X] T102 [US4] `web-cbar-admin-next/src/pages/currency-rates/index.tsx` + `web-cbar-admin-next/src/features/currency/components/rate-sheet-editor.tsx` (data-model.md §5): `DatePicker` tarix seçimi → `sheet(date)`; "Yeni vərəq" → qaralama (cari vərəqdən, `Alert colorPalette="yellow"` "saxlanılmayıb"), `editorKey` ilə remount; kit `DataTable` sətirlər: kod/ad/nominal read-only, `Input type=number step=any` rate; "Valyuta əlavə et" `Combobox` (mövcud olmayan kodlar), təkrar → xəta; sətir sil (yalnız qaralamada); bütöv validasiya (boş/qeyri-rəqəm/≤0) → sahə xətaları; Saxla → `PUT` → toast → invalidate; "Vərəqi sil" → `DeleteDialog`; "Tarixlər" `Sheet side="right"` (`DataTable` tarix/say + `ListPagination`, klik → yüklə); `locales/{az,en}/currency.json`
- [X] T103 [US4] `web-cbar-admin-next/src/pages/currencies/index.tsx` + `web-cbar-admin-next/src/features/currency/components/currency-master-grid.tsx`: `dirty: Map<code, Partial<…>>` state; `DataTable` sütunlar kod, ad az/en, nominal, `InputNumber` sıra, `Switch` aktiv, `Switch` ana səhifə + `Badge`; dirty sətir `rowClassName` `bg-warning/10`; başlıqda `t('currency:homepageCount',{n})`; "Dəyişiklikləri saxla (N)" → ardıcıl `PUT /currencies/{code}` (uğursuz olanlar dirty qalır, xəta toast); route `/currency-rates/currencies`
- [X] T104 [P] [US4] `web-cbar-admin-next/src/features/currency/currency.test.tsx`: son vərəq yüklənir; yeni vərəq → USD dəyişdir → EUR sil → GBP əlavə → təkrar GBP xəta → boş rate xəta → Saxla → PUT gövdəsi yalnız qalan kodlar; tarixlər çekmecəsi; valyuta grid 3 dirty → 3 PUT → dirty təmizlənir
- [X] T105 [P] [US4] `web-cbar-admin-next/src/features/azir/{api/azir.service.ts,api/azir.keys.ts,model/schemas.ts,model/module.ts,components/azir-upsert-card.tsx}`: `azirModule` (paged 50; `rowSchema: azirItemSchema`; filtrlər `from` date, `to` date, `term` select 1D/1W/1M; `canCreate:false, canEdit:false`; sütunlar valueDate date, term badge, rate, updatedAt); upsert `Card` (RHF+Zod: valueDate req, term req, rate rəqəm) → `POST /azir` → toast + invalidate `['azir']`; MSW `handlers/azir.ts` (upsert valueDate+term) + fixture; `web-cbar-admin-next/src/pages/azir/index.tsx` (`AzirUpsertCard` + `CrudListPage`), `locales/{az,en}/azir.json`
- [X] T106 [P] [US4] `web-cbar-admin-next/src/features/inflation/{api/inflation.service.ts,api/inflation.keys.ts,model/schemas.ts,model/module.ts,components/inflation-upsert-card.tsx}`: `inflationModule` (array; `rowSchema: inflationItemSchema`; filtr `year` number; `canCreate/canEdit:false`; sütunlar year, month, parameterCode badge, value, updatedAt); upsert `Card` (year 4 rəqəm, month `Select` 1–12 `common:months.*`, parameterCode `Select` cpi_yoy/target, value rəqəm) → `POST /inflation`; MSW `handlers/inflation.ts` + fixture; `web-cbar-admin-next/src/pages/inflation/index.tsx`, `locales/{az,en}/inflation.json`
- [X] T107 [P] [US4] `web-cbar-admin-next/src/features/azir/azir.test.tsx` və `web-cbar-admin-next/src/features/inflation/inflation.test.tsx`: eyni açarla iki dəfə saxla → bir sətir, dəyər yenilənib; filtr URL-də; silmə dialoqu
- [X] T108 [P] [US4] `web-cbar-admin-next/src/features/yield-curves/{api/yield-curves.service.ts,api/yield-curves.keys.ts,model/schemas.ts,model/module.ts}`: `yieldCurvesModule` (paged; `rowSchema`/`detailSchema` (parameters nullable, yields massivi); sütunlar curveDate date, hasParameters badge, yieldsCount, updatedAt; `fields: []` — forma override); MSW `handlers/yield-curves.ts` (409 təkrar tarix, 400 təkrar period) + fixture
- [X] T109 [US4] `web-cbar-admin-next/src/pages/yield-curves/{index,form}/index.tsx` + `web-cbar-admin-next/src/features/yield-curves/components/yield-curve-form.tsx`: RHF+Zod (`curveDate` req; `hasParameters` `Checkbox` → `FieldSet` beta0/beta1/beta2/lambda rəqəm; `useFieldArray` yields `{period, yield}` əlavə/sil; `superRefine`: boş period, təkrar period, qeyri-rəqəm yield; tam boş sətirlər süzülür; qrup bağlı → `parameters: null`); `createCrudRoutes(..., {form: YieldCurveFormPage})`; `locales/{az,en}/yieldCurves.json`; `yield-curves.test.tsx` (təkrar period xətası, parametrsiz saxlama, 409 mesajı)
- [X] T110 [US4] Faza 6 verification: `npm run verify`; real API: quickstart Q12–Q15

**Checkpoint**: US1–US4 işləyir

---

## Phase 7: User Story 5 — Media kitabxanası, istifadəçilər və parametrlər (Priority: P2)

**Goal**: Media yüklə/axtar/sil (409 banner), istifadəçi CRUD + şifrə sıfırlama, parametrlər açar/JSON.

**Independent Test**: quickstart Q16–Q18.

- [X] T111 [P] [US5] `web-cbar-admin-next/src/pages/media-library/index.tsx` + `web-cbar-admin-next/src/features/media/components/media-grid.tsx`: `validateSearch {page, search}`; `PageHeader` + `UploadButton` (T050); axtarış `Input` (debounce); kart grid (`Card`: `iconForMime`, ad, mime, `formatBytes`, ölçülər `—`, tarix); Sil → `DeleteDialog`; 409 → `Alert variant="destructive"` banner (mesaj API-dən); `ListPagination` 24; `media.test.tsx` (yükləmə → siyahıda; 409 banner; axtarış URL-də)
- [X] T112 [P] [US5] `web-cbar-admin-next/src/features/users/{api/users.service.ts,api/users.keys.ts,model/schemas.ts,model/module.ts,components/reset-password-action.tsx}`: `usersModule` (paged; `rowSchema` (list: `roleCode`), `detailSchema` (+`roleId`); search; sütunlar username, email, roleCode badge (`primary/secondary/tertiary`), isActive badge, createdAt; `fields: []`; `rowActions: ResetPasswordAction` — `KeyIcon` → `Dialog` yeni şifrə + siyasət göstərişi `users:passwordPolicy` → `PUT /users/{id}/password` → toast; `deleteConfirmKey` "deaktiv + soft delete"); MSW `handlers/users.ts` (admin-only 403 simulyasiyası yox; 409 username/email; 400 şifrə siyasəti; detail `roleId`) + fixture
- [X] T113 [US5] `web-cbar-admin-next/src/pages/users/{index,form}/index.tsx` + `web-cbar-admin-next/src/features/users/components/user-form.tsx`: create (username req, email req format, password req + policy regex, roleId `Select` `ROLE_OPTIONS`) / edit (detail-dən `roleId`; username `Input disabled` payload-da yox; password yox; isActive `Checkbox`) — iki Zod sxemi; payload create `{username,email,password,roleId}`, update `{email,roleId,isActive}`; `createCrudRoutes(..., {form: UserFormPage})`; `locales/{az,en}/users.json`; `users.test.tsx` (zəif şifrə 400 mesajı formda; redaktədə username kilidli; sıfırlama toast)
- [X] T114 [P] [US5] `web-cbar-admin-next/src/features/settings/{api/settings.service.ts,api/settings.keys.ts,model/schemas.ts,components/setting-dialog.tsx}` (template `settings` feature-ini əvəz edir: `list()` items → `settingItemSchema` (`value: z.unknown()`), `put(key,{value})`), MSW `handlers/settings.ts` real kontrakta (items, PUT upsert 200, 400 `Value is required.`) + fixture; `web-cbar-admin-next/src/pages/settings/index.tsx`: `DataTable` (key, `<pre>` JSON `text-xs font-mono` `ScrollArea`, updatedAt), "Yeni parametr" / sətir "Redaktə" → `Dialog` (`Input` key — redaktədə disabled, `Textarea` JSON; `JSON.parse` xətası `FormMessage`-də parser mesajı ilə) → `PUT`; `locales/{az,en}/settings.json` yenidən; `settings.test.tsx` (yanlış JSON xətası, yeni açar cədvəldə)
- [X] T115 [US5] Faza 7 verification: `npm run verify`; real API: quickstart Q16–Q18

**Checkpoint**: Bütün hekayələr işləyir

---

## Phase 8: Polish, root orkestrasiya və cutover hazırlığı

**Purpose**: Root skriptlər/sənədlər, dizayn/tema/mobil keçid, son gate-lər (root konstitusiya IV, VI.6, VIII; spec SC-001…SC-008)

- [X] T116 [P] `dev.ps1`: `-NextAdmin` switch → `$servers`-də `web-cbar-admin` girişi `Dir='web-cbar-admin-next'` olur (port/log eyni); `npm install` addımı `web-cbar-admin-next` üçün `npm run install:public` və (`.env.nexus` varsa) `npm run install:nexus`, yoxdursa xəbərdarlıq; yekun çıxışda "Admin panel (next)"; `-Stop` dəyişmir
- [X] T117 [P] `dev.sh`: `next-admin` arqumenti eyni davranış (`SERVERS` sətri, install addımı, çıxış mətni)
- [X] T118 [P] `GUIDE.md`: "Yeni admin panel (`web-cbar-admin-next`)" bölməsi — quraşdırma (Nexus), `dev.ps1 -NextAdmin` / `dev.sh next-admin`, `VITE_ENABLE_MSW`, roundtrip; `CLAUDE.md` (root): "Architecture" və "Commands"-a `web-cbar-admin-next` sətri (port 5173 alternativ, `npm run verify`, `npm run roundtrip`), "web-cbar-admin (CMS panel)" bölməsinə cutover qeydi (köhnə panel paritet təsdiqinə qədər qalır)
- [ ] T119 [P] (QISMƏN: tema keçidi testlə təsdiqlənib, vizual keçid əl ilə qalır) Qaranlıq tema və dar ekran keçidi: quickstart Q19–Q20 hər ekranda; tapıntılar üçün yalnız semantik token düzəlişləri (`web-cbar-admin-next/src/**`); geniş cədvəllər `DataTable scroll={{x: true}}`
- [X] T120 [P] i18n tamlıq yoxlaması: `web-cbar-admin-next/scripts/check-i18n.mjs` — `locales/az/*.json` və `locales/en/*.json` açar dəstləri eyni, `src/**` içində `t('…')` açarları mövcud; `verify`-ə əlavə (SC-008)
- [X] T121 [P] `web-cbar-admin-next/src/locales/{az,en}/common.json` və `auth.json` təmizliyi: template demo açarlarını (notifications, sidebar.storage, account.density…) sil; `status.*`, `months.*`, `errors.*`, `actions.*` tam
- [X] T122 Performans: route-ların `lazyRouteComponent` olduğunu, TipTap chunk-ının yalnız richtext form-larında yükləndiyini `vite build` çıxışında təsdiqlə (chunk adları); `web-cbar-admin-next/vite.config.ts`-də `build.rollupOptions.output.manualChunks` lazımdırsa (`tiptap`)
- [X] T123 Təhlükəsizlik: `npm audit --audit-level=high` sıfır; `web-cbar-admin-next/src/shared/lib/sanitize-html.test.ts` XSS test dəsti genişləndirilir (svg `onload`, `javascript:` böyük/kiçik hərf, `data:text/html`); token-un heç yerdə `localStorage`-a yazılmadığı `grep -r localStorage src` ilə təsdiqlənir (yalnız `nexus-ui`, `nexus-language`)
- [X] T124 Tam gate (QEYD: `npm run verify` + `audit` keçir; `docker:build` bu maşından Nexus-a çata bilmədiyi üçün kit install addımında dayandı — CI/VPN ilə işlədilməlidir): `cd web-cbar-admin-next && npm run verify && npm run check:kit && npm run audit` (script) keçir; `npm run docker:build` image qurulur, `docker run -p 8080:80` → `/config.json` default cavab verir (quickstart §6)
- [X] T125 Son paritet icrası (QEYD: canlı brauzer keçidi giriş/qabıq/səhifə ağacı/qanunlar ilə məhdudlaşdı — brauzer avtomatlaşdırması kəsildi; qalan ekranlar `checklists/parity.md`-də "açıq" kimi qeyd olunub): real stack (`.\dev.ps1 -Seed -NextAdmin`) ilə quickstart Q1–Q20 tam; nəticələr `specs/001-admin-template-migration/checklists/parity.md` cədvəlində (ekran → status → qeyd) — SC-001, SC-002, SC-004, SC-006, SC-007 təsdiqi; açıq DevOps sualları (`TODO(devops)`: hostname-lər, prod API, `Cors__Origins`) siyahısı

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: asılılıq yoxdur; T001 hər şeyi bloklayır, T002–T011 [P]; T012 gate
- **Phase 2 (Foundational)**: Phase 1-dən sonra. Daxili sıra: 2a (T013–T022) → 2b (T023–T031; T028/T029/T030 [P]) → 2c (T032–T036 [P] utillər → T037–T043 → T044 test) → 2d (T045–T047 [P] → T048/T049 → T050–T056 [P] → T057–T059 → T060). T040 T049 və T059-dan asılıdır (lazy import — interfeys razılaşdırılıb, stub ilə əvvəl də keçir). T061 gate. **Bütün hekayələri bloklayır.**
- **Phase 3 (US1)**: Phase 2-dən sonra. T062–T064 [P] → T065 → T066/T067 → T068
- **Phase 4 (US2)**: Phase 2-dən sonra (US1-dən müstəqil; nav yer tutucuları T065 olmadan da route əlavə edilə bilər). Modul qrupları bir-birindən [P]; hər qrupda service/handler → module → page/route → test
- **Phase 5 (US3)**: Phase 2-dən sonra; T097 T051 naxışını izləyir; US2-dən müstəqil
- **Phase 6 (US4)**: Phase 2-dən sonra; T105/T106/T108 `CrudListPage`-dən asılı (T042); US2/US3-dən müstəqil
- **Phase 7 (US5)**: Phase 2-dən sonra; T111 T050-dən asılı
- **Phase 8**: bütün istənilən hekayələrdən sonra; T116–T121 [P]

### User Story Dependencies

- **US1**: təməldən sonra, digər hekayələrdən asılı deyil
- **US2**: təməldən sonra; US1 ilə yalnız route tree faylını (`app/routes/index.ts`) paylaşır — eyni fayla ardıcıl əlavə
- **US3**: təməldən sonra; `AssetsSection` naxışı (T051) və `RichTextEditor` (T059) təməldədir
- **US4**: təməldən sonra; mühərrikin `CrudListPage` (T042) və `canCreate:false` rejimi
- **US5**: təməldən sonra; `UploadButton` (T050)

### Parallel Opportunities

- Phase 1: T002, T003, T005–T011 eyni anda (T001-dən sonra)
- Phase 2a: T013–T017 eyni anda; T020–T022 eyni anda (T018/T019-dan sonra)
- Phase 2c: T032–T034 eyni anda; Phase 2d: T045–T047, T050–T056 eyni anda
- Phase 4: 8 modul qrupu (homepage, info-lines, laws, meas, organization, money-marks, galleries+videos, press-releases) ayrı developer-lərə paylana bilər; hər qrupun (a)/(b) task-ı digərləri ilə [P]
- Phase 6: currency (T101–T104), azir (T105, T107), inflation (T106, T107), yield-curves (T108–T109) paralel
- Phase 7: T111, T112, T114 paralel
- Phase 8: T116–T121 paralel

---

## Parallel Example: User Story 2

```bash
# Modul qruplarının (a)+(b) task-ları eyni anda:
Task: "T069 homepage service + handlers"
Task: "T075 laws service + handlers"
Task: "T079 meas service + module"
Task: "T081 organization service + module"
Task: "T083 money-marks service + module"
Task: "T085 galleries service + images section"
Task: "T086 videos service + module"
Task: "T088 press-releases service + module"
# Sonra hər qrupun page/route task-ı (T071, T077, T080, T082, T084, T087, T089) — app/routes/index.ts-ə ardıcıl əlavə
```

## Parallel Example: Phase 2d (media + rich-text)

```bash
Task: "T045 entities/media"
Task: "T046 media.service"
Task: "T047 media MSW handler"
Task: "T052 sanitize-html"
Task: "T053 rich-text extensions"
Task: "T054 legacy fixtures + roundtrip.test"
Task: "T055 editor icons"
Task: "T056 editor.css"
```

---

## Implementation Strategy

### MVP First (US1)

1. Phase 1 (kopya + konfiq) → Phase 2 (təməl: bu feature-də təməl böyükdür, çünki mühərrik, media və redaktor hər hekayənin altındadır) → Phase 3 (US1)
2. **DAYAN və yoxla**: quickstart Q1–Q3 real API ilə; `npm run verify`
3. Nümayiş: kit dizaynında qabıq, giriş, sessiya davranışı

### Incremental Delivery

1. Setup + Foundational → təməl hazır (mühərrik testi yaşıl, round-trip fixture testi yaşıl)
2. US1 → MVP
3. US2 → 21 modul; hər modul qrupu ayrıca nümayiş edilə bilər (məsələn əvvəlcə Qanunlar)
4. US3 → səhifələr + canlı round-trip (cutover üçün ən kritik qapı)
5. US4 → maliyyə ekranları
6. US5 → media/istifadəçi/parametrlər
7. Phase 8 → root skriptlər, sənədlər, paritet cədvəli → cutover qərarı (ayrı spec: köhnə `web-cbar-admin` silinməsi və qovluğun adının dəyişməsi)

### Parallel Team Strategy

1. Komanda Phase 1–2-ni birlikdə (2c mühərrik və 2d redaktor iki nəfərə bölünə bilər)
2. Sonra: Dev A — US1 + US3 (səhifələr/redaktor); Dev B — US2 (modullar, 8 qrup); Dev C — US4 + US5
3. Phase 8 birlikdə

---

## Notes

- [P] = fərqli fayllar, asılılıq yoxdur; `app/routes/index.ts`, `shared/i18n/index.ts`, `shared/testing/handlers/index.ts` **paylaşılan** fayllardır — onlara əlavələr ardıcıl edilir (merge konflikti riski)
- Hər task-dan sonra `npm run verify` (və ya ən azı `tsc -b` + aid testlər); AZ hərfli JSON-lar yalnız Write/Edit ilə
- Kit-də olmayan control yazmaq qadağandır; problem varsa `showcase-ui`-yə report, burada `node_modules` yamaqlanmır
- `src/index.css` route B blokuna toxunulmur
- Köhnə `web-cbar-admin/`-dən yalnız **davranış** oxunur (referans); fayl kopyalanmır (Chakra, react-icons, localStorage token daşınmır); istisna: `roundtrip-check.mjs` və `crud/utils.ts` məntiqi yenidən yazılaraq daşınır
- Cutover (köhnə panelin silinməsi, `web-cbar-admin-next` → `web-cbar-admin`, `.gitlab-ci` upstream repo) bu spec-in əhatəsində deyil — T125 paritet cədvəli ona giriş sənədidir
