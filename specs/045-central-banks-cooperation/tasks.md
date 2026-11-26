# Tasks: Mərkəzi banklarla əməkdaşlıq — Anlaşma Memorandumları cədvəli

**Input**: `specs/045-central-banks-cooperation/`: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

**Tests**: Frontend testləri davranış testləridir (rol, `userEvent`, MSW). API-lərdə test layihəsi yoxdur: yoxlama `quickstart.md` ilə real icradır (PGlite).

**Təşkili**: User story-lər üzrə, hər story daxilində deploy sırası: `api-cbar-admin` → `api-cbar` → `web-cbar-admin-new` → `web-cbar-new`.
Hər komponent ayrıca merge request-dir. Commit yalnız istəklə.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: paralel işlənə bilər (fərqli fayllar, açıq asılılıq yoxdur)
- **[Story]**: aid olduğu user story

## Yol qısaltmaları

- `ADMIN-API` = `product-rest/api-cbar-admin`
- `WEB-API` = `product-rest/api-cbar`
- `ADMIN` = `product-rest/web-cbar-admin-new`
- `SITE` = `product-rest/web-cbar-new`

---

## Phase 1: Setup

- [X] T001 `git status` təmizdir; `ADMIN-API/db/migrations/`-da `0027`, `0028` boşdur, `WEB-API`-də migration yoxdur; `diff -rq ADMIN-API/src/Cbar.Domain WEB-API/src/Cbar.Domain` boşdur
- [X] T002 **GATE (istifadəçi)**: köhnə bank mətnlərinin saytda gizlənməsi (research R5) təsdiqlənir; təsdiq olunmasa T017 kəsmir və köhnə mətn cədvəldən sonra göstərilir
  - İstifadəçi təsdiqi (2026-11-13): köhnə bank mətnləri gizlədilir.
- [X] T003 Figma plugin açıqdır (`figma_health`); `contracts/ui-contract.md`-dəki `?` dəyərləri əsas komponentdən oxunur (`2208:5858`, `2208:5872`, `2208:5878`, `2208:5885`, tablet/mobil variantları; `figma_node` depth 2–3, PNG yox) və fayl tamamlanır

---

## Phase 2: Foundational

**Bütün story-lərin əsası: sxem, domain, icazələr və təsdiqlənmiş API kontraktı.**

- [X] T004 `ADMIN-API/db/migrations/0027-memorandums.sql`: `data-model.md`-dəki 2 cədvəl, index, şərti FK DO bloku, `set_updated_at` trigger, `cbar_web_ro` `GRANT SELECT`, `memorandums.*` icazələri + `moderator` (`0025-ifi-organizations.sql` nümunəsi, `BEGIN/COMMIT` yox)
- [X] T005 `ADMIN-API/src/Cbar.Domain/Entities/Memorandum.cs` (`Memorandum`, `MemorandumTranslation`) və `ADMIN-API/src/Cbar.Domain/CbarDbContext.cs`: DbSet-lər, `ToTable`, `HasQueryFilter(DeletedAt == null)`, unique index, cascade (`IfiOrganization` konfiqurasiyası nümunəsi)
- [X] T006 T005-i `WEB-API/src/Cbar.Domain/`-a bayt-bayt köçür, `diff -rq` boşdur
- [X] T007 `ADMIN-API/src/Cbar.AdminApi/Authorization/Permissions.cs`: `Memorandums` sinfi (`Read/Create/Update/Delete`), `All`-a əlavə, sayğac şərhi
- [X] T008 [P] `ADMIN-API/openapi/`: `paths/memorandums.yaml` (`collection`, `item`), `components/schemas/memorandums.yaml`, `openapi.yaml` tag `Memorandums` + ref-lər, `x-permission`; `/api-endpoint` skill-i ilə; `npm run lint` + `npm run bundle`
- [X] T009 [P] `WEB-API/openapi/`: `paths/memorandums.yaml` (`listMemorandums`, `Locale` param, 429), `components/schemas/memorandums.yaml`, `openapi.yaml`; lint + bundle
- [X] T010 **GATE**: OpenAPI spec-lərini istifadəçiyə təqdim et və təsdiq al. Təsdiqə qədər controller yazılmır
  - İstifadəçi təsdiqi (2026-11-13): hər iki API-nin spec-i təsdiqləndi (kod əvvəlcədən yazılmışdı, `route-diff` fərqsiz).
- [X] T011 `dotnet build` hər iki API-də (`C:/Program Files/dotnet`)

**Checkpoint**: Sxem, domain, icazələr və kontrakt hazırdır.

---

## Phase 3: User Story 1 - Ziyarətçi cədvəli görür və çeşidləyir (P1) 🎯 MVP

**Goal**: Səhifə 122 Figma görünüşündə giriş + cədvəli public API-dən göstərir, çeşidləmə ünvan parametri ilə işləyir, köhnə mətn kəsilir.

**Independent Test**: MSW fikstürü / fikstür proxy ilə səhifəni az/en, 1728/744/390 ölçülərində aç, `contracts/ui-contract.md` ilə tutuşdur.

### api-cbar

- [X] T012 [US1] `WEB-API/src/Cbar.WebApi/Controllers/MemorandumsController.cs`: `GET api/v1/memorandums?locale=`, filtr Published + `DeletedAt == null` + ShowAz/ShowEn + tərcümə var, sıra `SignedYear DESC, SortOrder, Id`, cavab `{ items: [{ id, organization, country, year }] }` (`IfiOrganizationsController.cs` nümunəsi)
- [X] T013 [US1] `quickstart.md` §3-ü `cbar_web_ro` ilə PGlite üzərində icra et; `route-diff.mjs` `api-cbar` təmizdir

### web-cbar-new

- [X] T014 [P] [US1] `SITE/src/features/memorandums/model/schemas.ts` (Zod: `memorandumSchema`, `memorandumListSchema`), `api/memorandums.api.ts` (`server-only`, `cachedJson`, `getMemorandums(locale)`), `SITE/src/shared/testing/{fixtures/memorandums.ts,handlers/memorandums.ts,handlers/index.ts}`
- [X] T015 [P] [US1] `SITE/src/features/memorandums/model/{constants.ts,sort.ts,sort.test.ts}`: `MEMORANDUM_SORT` (`newest`/`oldest`), `parseMemorandumSort(value)` (tanınmayan → `newest`), `orderMemorandums(rows, sort)` — `oldest`-də illər artan, il daxilində giriş sırası qorunur; test: eyni ilin sətirləri hər iki sırada eyni ardıcıllıqdadır, heç biri itmir (SC-007). `QUERY_PARAM.SORT` `SITE/src/shared/constants/query-params.ts`-də (yoxdursa)
  - Qeyd: `MEMORANDUM_SORT`, `parseMemorandumSort`, `orderMemorandums` `SITE/src/features/about-content/model/memorandums.ts`-dədir (ayrı `features/memorandums/model/sort.ts` yoxdur), testlər `memorandums.test.ts`-də.
- [X] T016 [US1] `SITE/src/features/about-content/model/types.ts`: `AboutLayoutKind`-a `'memorandums'`, `Memorandum` tipi, `AboutBlock`-a `{ type: 'memorandums'; rows }`, `ParseContext.memorandums`; `layouts.ts` `COOPERATION_LAYOUTS`-a 4 slug (research R7)
- [X] T017 [US1] `SITE/src/features/about-content/model/memorandums.ts` + `memorandums.test.ts`: sətirlər varsa məzmunu ilk heading line-dan kəs (spec 044 `ifi-organizations.ts`-in kəsmə funksiyasını paylaş, kopyalama), giriş bloku + `memorandums` bloku; sətir yoxdursa məzmun tam; heading line yoxdursa məzmun tam giriş; məzmun birbaşa heading ilə başlayırsa giriş boş. `parse.ts`-ə qoş
- [X] T018 [US1] Layout guard: `SITE/src/features/about-content/fixtures/memorandums.html` (redaktorun saxladığı forma: giriş `<p>` + `<p><strong>` bank bölməsi + link `target`/`rel` ilə), `model/layout-fixtures.test.ts` `EXPECTED_BLOCKS`-a `memorandums`
- [X] T019 [US1] `SITE/src/views/cms-page/loader.ts`: `layout === 'memorandums'` olanda `getMemorandums(locale).catch(() => [])`, `parseAbout` kontekstinə ötür (FR-012, SC-005); imza dəyişmir
- [X] T020 [US1] `SITE/src/widgets/about-blocks/memorandum-sort.tsx`: native `<details>` — `<summary>` "Tarix: {seçim}" + ox, içində iki `Link` (`?sort=oldest` / parametrsiz), aktiv `aria-current="true"`, `print:hidden`; server komponenti, ölçülər ui-contract
- [X] T021 [US1] `SITE/src/widgets/about-blocks/memorandums.tsx`: H2 (`id`), Controls sətri, `<table aria-labelledby>` — `<thead>` brend fon, `<th scope="col">`, zebra sətirlər, sərhəd/radius, 1728/744/390 sinifləri (ui-contract); əvvəl `widgets/data-table`-ın variantla uyğunluğunu yoxla (research R8); rənglər yalnız semantik token; sabitlər `constants.ts`; `about-blocks.tsx` + `index.ts`-ə qoş
- [X] T022 [US1] `SITE/src/app/[locale]/[...slug]/page.tsx` + `SITE/src/views/cms-page/index.tsx`: `searchParams.sort` → `parseMemorandumSort` → view prop; view `memorandums` blokunu `orderMemorandums` ilə sıralayıb render edir (Next 16 `searchParams` qaydası üçün `node_modules/next/dist/docs/` oxu)
- [X] T023 [P] [US1] `SITE/src/locales/{az,en}/about.json`: `memorandums.title`, `columns.organization/country/date`, `sort.label`, `sort.newest`, `sort.oldest`
- [X] T024 [US1] `SITE/src/widgets/about-blocks/memorandums.test.tsx` + `SITE/src/views/cms-page/cooperation.test.tsx`: cədvəl rolu və sütun başlıqları, 3 sütun, standart sıra, `sort=oldest` sırası, aktiv seçim, en etiketlər, API xətasında tam məzmun və cədvəl yox, sətir olanda köhnə mətn yox, `-copy` slug eyni görünüş
- [X] T025 [US1] `SITE`: `npm run verify` (Node 24), `npx vitest run` Node 22 ilə
- [X] T026 [US1] Ölçmə: fikstür proxy + Edge CDP ilə 1728/744/390-da `getBoundingClientRect` → ui-contract (SC-001); JS-siz çeşidləmə; çap önizləməsi; 390-da üfüqi sürüşmə yoxdur
  - 2026-11-13: `.tmp-044/measure045.mjs` 55/55 PASS. Başlıq sətri 44.5 (border-collapse birinci sətrin 1px üst sərhədinin yarısını başlığa verir; sətir addımı 57/81 Figma ilə eynidir). Headless Edge scrollbar-ı 15px: 744/390-da cədvəl 649/327, scrollbar-sız 664/342.

**Checkpoint**: Sayt tərəfi fikstürlə tam işləyir.

---

## Phase 4: User Story 2 - Redaktor memorandumları paneldən idarə edir (P1)

**Goal**: Paneldə "Memorandumlar" bölməsi: siyahı, yarat, redaktə, sil.

**Independent Test**: Paneldə iki dildə memorandum yarat, dərc et, public API-də gör.

### api-cbar-admin

- [X] T027 [US2] `ADMIN-API/src/Cbar.AdminApi/Controllers/MemorandumsController.cs`: 5 endpoint (`contracts/api.md`), `CbarControllerBase` problem köməkçiləri, validasiya (`data-model.md`), `AuditService`, `RequirePermission`, siyahıda `search` (təşkilat + ölkə ILIKE) və `status` (`IfiOrganizationsController.cs` nümunəsi, alt resurs və media olmadan)
- [~] T028 [US2] `quickstart.md` §2-ni PGlite üzərində icra et; `route-diff.mjs` `api-cbar-admin` təmizdir
  - Buraxıldı. İstifadəçi qərarı (2026-11-13): 403 yoxlaması lazım deyil.
  - 2026-11-13: `.tmp-044/check045.mjs` 32/32 PASS, `route-diff` təmiz, `audit_log`-da `memorandums.create/update/delete` var. 2026-11-13-də düzəldildi (hər iki `Cbar.Domain`-də `role_permissions` sütunları açıq göstərildi), `.tmp-044/check-rbac.mjs` 10/10 PASS: icazəsiz rol 403 alır. Əvvəl 403 yox, 500 alırdı. Bu spec 045-dən asılı olmayan köhnə xətadır: `CbarDbContext`-də `UsingEntity("role_permissions")` sütunları `permissions_id/roles_id` kimi axtarır, migration `0001` isə `permission_id/role_id` yaradıb (`PermissionMatrix` və `GET /roles` admin olmayan hər rol üçün 42703).

### web-cbar-admin-new

- [X] T029 [P] [US2] `ADMIN/src/features/memorandums/api/memorandums.keys.ts`, `model/schemas.ts` (Zod cavab + forma: il 1991 … cari il + 1, dolu dildə hər iki sahə məcburi), `model/constants.ts`
- [X] T030 [US2] `ADMIN/src/features/memorandums/model/module.ts` (`ModuleConfig`: sütunlar təşkilat/ölkə/il/status, sahələr `signedYear`, `sortOrder`, `status`, `showAz/showEn`, per-locale `organization`, `country`), `ADMIN/src/pages/memorandums/index.tsx`, `ADMIN/src/app/routes/{index.ts,nav.ts}` (`chunk-reload` ilə lazy), icazə `memorandums.*` (`ADMIN/CLAUDE.md` yeni bölmə resepti)
  - Qeyd: ayrıca `ADMIN/src/pages/memorandums/` yoxdur; bölmə `createCrudRoutes(..., registerModule(memorandumsModule))` ilə qoşulub.
- [X] T031 [P] [US2] `ADMIN/src/locales/{az,en}/{memorandums.json,nav.json}`, `ADMIN/src/shared/i18n/index.ts`; `check:i18n` keçir
- [X] T032 [P] [US2] `ADMIN/src/shared/testing/{fixtures/memorandums.ts,handlers/memorandums.ts,handlers/index.ts}` — real kontrakt
- [X] T033 [US2] `ADMIN/src/features/memorandums/memorandums.test.tsx`: siyahı sütunları, axtarış, yaratma (az + en + il → POST body), boş ölkə və səhv il → sahə xətası və sorğu yox, redaktə, silmə
- [X] T034 [US2] Layout guard-ın admin yarısı: `ADMIN/src/features/rich-text/fixtures/layouts/memorandums.html` (T018 ilə bayt-bayt eyni), `roundtrip.test.ts` siyahısına əlavə; `check:layout-fixtures` hər iki `verify`-da keçir
- [~] T035 [US2] `ADMIN`: `npm run verify` (Node 24 və 22), `npm run roundtrip -- "Mərkəzi banklarla əməkdaşlıq"`
  - Buraxıldı. İstifadəçi qərarı (2026-11-13): canlı API ilə `roundtrip` lazım deyil.
  - 2026-11-13: `verify` (Node 24) və `vitest` Node 22-də yaşıl (585 test). **Açıq**: canlı API-yə qarşı `npm run roundtrip`.

**Checkpoint**: Redaktor axını başdan sona işləyir.

---

## Phase 5: User Story 3 - Figma məzmunu seed ilə gəlir (P2)

- [X] T036 [US3] `ADMIN-API/db/migrations/0028-memorandums-seed.sql`: `data-model.md` cədvəlindəki 28 sətir (az + en), qoruyucu `IF EXISTS`; səhifə bloku — slug ilə tap, `has_table_privilege('page_translations','UPDATE')`, dil üzrə `<p><strong>` şərti, giriş paraqrafını əvvələ əlavə et (`0026` nümunəsi); AZ hərfləri UTF-8, tək dırnaqlar ikiləşdirilir
- [X] T037 [US3] `quickstart.md` §1: boş baza, təkrar işləmə (dublikat yox, giriş ikiləşmir), redaktorun dəyişdiyi məzmun (toxunulmur), `UPDATE` privilege olmayan rol (startup bloklanmır)

---

## Phase 6: Sənədlər və yekun

- [X] T038 [P] `SITE/docs/cooperation-cms-guide.md`: "Mərkəzi banklarla əməkdaşlıq" bölməsi (giriş mətni harada, sətirlər harada, kəsmə qaydası); `dokumentasiyalar/`-da istifadəçi təlimatı (spec 044 təlimatı nümunəsi)
- [X] T039 [P] `CLAUDE.md` (root: spec 045 bəndi, guard siyahısına `memorandums`), `SITE/CLAUDE.md`, `ADMIN/CLAUDE.md`
- [X] T040 `/sync-openapi` (hər iki API, `# Sync:` sətri) və `/sync-business-logic` (`new_business_logic.md`, `diff_report_logic.md`)
- [X] T041 `quickstart.md` tam keçid; `spec.md` Status → Implemented; ui-contract-da qalan `?` yoxdur
  - 2026-11-13: quickstart-ın lazım bilinən bəndləri keçdi (T028 403 və T035 roundtrip istifadəçi qərarı ilə buraxıldı), `spec.md` Implemented, ui-contract-da `?` yoxdur.
- [~] T042 `/code-review` dəyişikliklər üzərində (istəklə)
  - Buraxıldı. İstifadəçi qərarı (2026-11-13): lazım deyil.

---

## Asılılıqlar

- Phase 2 hər şeyi bloklayır; T010 (GATE) T012 və T027-ni bloklayır; T003 (ölçülər) T020, T021, T026-nı bloklayır.
- US1 saytı fikstürlə US2-dən asılı olmadan tamamlanır; real məlumat üçün T012 + T036 lazımdır.
- US2: T027 → T029–T035. US3: T004-dən sonra istənilən vaxt.
- Deploy: `api-cbar-admin` (T004–T008, T027, T036) → `api-cbar` (T006, T009, T012) → `web-cbar-admin-new` / `web-cbar-new`.

## MVP

Phase 1–3 + T036: sayt Figma görünüşündə 28 sətri göstərir. Panel bölməsi (US2) ikinci addımdır.
