# Tasks: Beynəlxalq maliyyə təşkilatları — admin paneldən idarə olunan məzmun növü

**Input**: `specs/044-ifi-cooperation/`: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

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

- [X] T001 `git status` təmizdir; `ADMIN-API/db/migrations/`-da `0025`, `0026` boşdur, `WEB-API`-də migration qovluğu yoxdur; `diff -rq ADMIN-API/src/Cbar.Domain WEB-API/src/Cbar.Domain` boşdur
- [X] T002 [P] Səhifə 121-in köhnə en məzmununu (`schema-new/cbar-schema-and-data-20260914.sql`, `page_translations` COPY, səhifə 121 en sətri) seed mənbəyi kimi oxu; az mətnləri Figma `2172:3599`-dan (`figma_text`) götür — fayl yaradılmır, mətn T039-da birbaşa SQL-ə gedir

---

## Phase 2: Foundational

**Bütün story-lərin əsası: sxem, domain, icazələr və təsdiqlənmiş API kontraktı.**

- [X] T003 `ADMIN-API/db/migrations/0025-ifi-organizations.sql`: `data-model.md`-dəki 4 cədvəl, index-lər, şərti FK DO bloku, `set_updated_at` trigger, `cbar_web_ro` `GRANT SELECT`, `ifi.*` icazələri + `moderator` (`0020-csr-projects.sql` nümunəsi, `BEGIN/COMMIT` yox)
- [X] T004 `ADMIN-API/src/Cbar.Domain/Entities/IfiOrganization.cs` (`IfiOrganization`, `IfiOrganizationTranslation`, `IfiMembership`, `IfiMembershipTranslation`) və `ADMIN-API/src/Cbar.Domain/CbarDbContext.cs`: DbSet-lər, `ToTable`, `HasQueryFilter(DeletedAt == null)`, unique index-lər, cascade (`CsrProject` konfiqurasiyası nümunəsi)
- [X] T005 T004-ü `WEB-API/src/Cbar.Domain/`-a bayt-bayt köçür, `diff -rq` boşdur
- [X] T006 `ADMIN-API/src/Cbar.AdminApi/Authorization/Permissions.cs`: `Ifi` sinfi (`Read/Create/Update/Delete`), `All`-a əlavə, sayğac şərhi
- [X] T007 [P] `ADMIN-API/openapi/`: `paths/ifi-organizations.yaml` (`collection`, `item`, `memberships`, `membership`, `membershipsOrder`), `components/schemas/ifi-organizations.yaml`, `openapi.yaml` tag + ref-lər, `x-permission`; `/api-endpoint` skill-i ilə; `npm run lint` + `npm run bundle`
- [X] T008 [P] `WEB-API/openapi/`: `paths/ifi-organizations.yaml` (`listIfiOrganizations`, `Locale` param, 429), `components/schemas/ifi-organizations.yaml`, `openapi.yaml`; lint + bundle
- [X] T009 **GATE**: OpenAPI spec-lərini istifadəçiyə təqdim et və təsdiq al. Təsdiqə qədər controller yazılmır
- [X] T010 `dotnet build` hər iki API-də (`C:/Program Files/dotnet`)

**Checkpoint**: Sxem, domain, icazələr və kontrakt hazırdır.

---

## Phase 3: User Story 1 - Ziyarətçi təşkilat kartlarını görür və açır (P1) 🎯 MVP

**Goal**: Səhifə 121 Figma görünüşündə kartları public API-dən göstərir, hamısı bağlı gəlir, köhnə siyahı kəsilir.

**Independent Test**: MSW fikstürü / fikstür proxy ilə səhifəni az/en, 1728/744/390 ölçülərində aç, `contracts/ui-contract.md` ilə tutuşdur.

### api-cbar

- [X] T011 [US1] `WEB-API/src/Cbar.WebApi/Controllers/IfiOrganizationsController.cs`: `GET api/v1/ifi-organizations?locale=`, filtr Published + `DeletedAt == null` + ShowAz/ShowEn + tərcümə var, sıra `SortOrder, Id`, üzvlüklər həmin dildə adı olanlar, `logo` = `/media/{id}`, `joinedOn` `yyyy-MM-dd` (`CsrProjectsController.cs` nümunəsi)
- [X] T012 [US1] `quickstart.md` §3-ü `cbar_web_ro` ilə PGlite üzərində icra et; `route-diff.mjs` `api-cbar` təmizdir

### web-cbar-new

- [X] T013 [P] [US1] `SITE/src/shared/testing/fixtures/ifi-organizations.ts` (Figma-dakı 4 təşkilat, DB-nin 5 tarixi, biri loqosuz) və `SITE/src/shared/testing/handlers/ifi-organizations.ts` + `handlers/index.ts` qeydiyyatı
- [X] T014 [US1] `SITE/src/features/ifi-organizations/model/schemas.ts` (Zod, `contracts/api.md` public forması) və `SITE/src/features/ifi-organizations/api/ifi-organizations.api.ts` (`server-only`, `cachedJson`, keyPrefix/tag `ifi-organizations`)
- [X] T015 [US1] `SITE/src/features/about-content/model/types.ts`: `AboutLayoutKind`-ə `'ifi-organizations'`, `IfiOrganization` və `IfiOrganizationsBlock { kind, introHtml, organizations }`
- [X] T016 [US1] `SITE/src/features/about-content/model/layouts.ts`: `COOPERATION_LAYOUTS` (az `beynelxalq-teskilatlarla-emekdasliq`, en `cooperation-with-international-organizations` + `-copy` variantları) və `cooperationLayoutFor(slug)`
- [X] T017 [US1] `SITE/src/features/about-content/model/ifi-organizations.ts`: `parseIfiOrganizations(nodes, organizations)` — təşkilat varsa ilk heading line (`<p>` içində tək `<strong>`) node-undan kəs (research R5); `parse.ts`-də `ParseContext.organizations` və dispatch
- [X] T018 [US1] `SITE/src/views/cms-page/loader.ts`: `sectionLayout` cooperation-da `cooperationLayoutFor`; `ifi-organizations` layout-unda `getIfiOrganizations(locale).catch(() => [])`, `prepareCmsHtml(content)`, `mediaUrl(logo)`; `parseAbout(..., { organizations })`
- [X] T019 [US1] `SITE/src/widgets/about-blocks/ifi-organization-card.tsx`: native `<details>` (`open` prop), `<summary>` loqo 103×58 + ad + "Üzvlük: {il}" + caret; açıq məzmun: missiya qutusu, giriş sətri, tarix şəbəkəsi (`DD.MM.YYYY`), `CmsContent` mətn, sayt linki (host, `target=_blank rel=noopener noreferrer`, "↗"); boş sahələr göstərilmir (spec Edge Cases)
- [X] T020 [US1] `SITE/src/widgets/about-blocks/ifi-organizations.tsx`: giriş `CmsContent variant="about"`, başlıq "Əməkdaşlıq edilən təşkilatlar" yalnız təşkilat varsa, kartlar gap 16, hamısı bağlı (2026-11-13; əvvəl birinci `open`); `about-blocks.tsx` dispatch; `views/cms-page/index.tsx` attachments qaydasını yoxla
- [X] T021 [P] [US1] Stil: `ui-contract.md` ölçüləri Tailwind sinifləri ilə, rəqəmlər `SITE/src/widgets/about-blocks/constants.ts` və ya slice `constants.ts`-də (spec 032), 744 → 2 sütun, 390 → 1 sütun; `SITE/src/app/globals.css` çap qaydası (details açıq)
- [X] T022 [P] [US1] `SITE/src/locales/{az,en}/about.json`: `ifi.sectionTitle` ("Əməkdaşlıq edilən təşkilatlar" / "Cooperating organizations"), `ifi.membership` ("Üzvlük: {{year}}" / "Membership: {{year}}"), `ifi.mission` ("Əsas missiya" / "Main mission")
- [X] T023 [US1] Guard: `SITE/src/features/about-content/fixtures/ifi-organizations.html` (seed-dən sonrakı səhifə məzmunu: giriş + köhnə `<p><strong>` siyahı, editor formasında) və eyni faylı `ADMIN/src/features/rich-text/fixtures/layouts/ifi-organizations.html`; `SITE/src/features/about-content/model/layout-fixtures.test.ts` `EXPECTED_BLOCKS` + `blockShape`; `ADMIN/src/features/rich-text/roundtrip.test.ts` siyahısı
- [X] T024 [US1] Testlər: `SITE/src/features/about-content/model/ifi-organizations.test.ts` (kəsmə, təşkilatsız tam məzmun, heading yoxdur), `SITE/src/widgets/about-blocks/ifi-organizations.test.tsx` (ilk açıq, klik/klaviatura ilə açılış, boş sahələr, link atributları, en etiketləri), `SITE/src/views/cms-page/cooperation.test.tsx` (səhifə 121 kartlarla; API 500 → tam köhnə məzmun; boş siyahı → başlıq yoxdur; bölmənin digər səhifəsi `plain` qalır)
- [X] T025 [US1] Node 22-də `setup:check`, `check:self-contained`, `check:layout-fixtures`, `lint`, `typecheck`, `test:run` (`SITE`); `build`
- [X] T026 [US1] Fikstür proxy + production build + headless Edge: 1728/744/390 ölçüləri `ui-contract.md` ilə, JS-siz açılış, çap, API 500 (`quickstart.md` §5). Müvəqqəti qovluğu sonra sil

**Checkpoint**: Ziyarətçi görünüşü hazırdır, məlumat fikstürdən/API-dən gəlir.

---

## Phase 4: User Story 2 - Redaktor təşkilatları formadan idarə edir (P1)

**Goal**: Admin paneldə "Beynəlxalq maliyyə təşkilatları" bölməsi: CRUD, loqo, az/en, üzvlük tarixləri.

**Independent Test**: İki dildə təşkilat yarat, iki tarix əlavə et və sırala, dərc et; panel siyahısında və public API-də gör.

### api-cbar-admin

- [X] T027 [US2] `ADMIN-API/src/Cbar.AdminApi/Controllers/IfiOrganizationsController.cs`: `GET /` (paging, search, status), `GET /{id}`, `POST`, `PUT /{id}`, `DELETE /{id}` soft; `CbarControllerBase` problem+json, `AuditService` (`ifi.create|update|delete`), `CreatedBy/UpdatedBy = CurrentUserId()`, validasiya `data-model.md` (`CsrProjectsController.cs` nümunəsi)
- [X] T028 [US2] Eyni controller-də `POST /{id}/memberships`, `PUT /{id}/memberships/{membershipId}`, `DELETE /{id}/memberships/{membershipId}`, `PUT /{id}/memberships/order` (dəqiq id dəsti, yoxsa 400), audit `ifi.membership_*`
- [X] T029 [US2] `ADMIN-API/src/Cbar.AdminApi/Controllers/MediaController.cs`: in-use SQL-ə `ifi_organizations.logo_media_id`
- [X] T030 [US2] `quickstart.md` §2-ni PGlite ilə icra et; `route-diff.mjs` `api-cbar-admin` təmizdir

### web-cbar-admin-new

- [X] T031 [P] [US2] `ADMIN/src/shared/testing/fixtures/ifi-organizations.ts` və `ADMIN/src/shared/testing/handlers/ifi-organizations.ts` (`createCrudStore` + memberships marşrutları) + `handlers/index.ts`
- [X] T032 [US2] `ADMIN/src/features/ifi-organizations/api/ifi-organizations.keys.ts` (`IFI_ORGANIZATIONS_MODULE_ID`, `crudKeys`) və `ADMIN/src/features/ifi-organizations/model/schemas.ts` (row, detail, membership Zod)
- [X] T033 [US2] `ADMIN/src/features/ifi-organizations/model/module.ts`: `defineModule` — sütunlar (id, name, memberSince, membershipCount, sortOrder, status), sahələr (status `scheduled`-siz, sortOrder, memberSince, websiteUrl, showAz/showEn, `logoMediaId` `type:'media'`), perLocale (name required, mission textarea, membershipIntro text, content richtext), `superRefine` "başlanmış dildə ad"
- [X] T034 [US2] `ADMIN/src/features/ifi-organizations/components/ifi-memberships-section.tsx`: `editExtras` — siyahı, əlavə/redaktə (tarix + az/en ad), silmə, sıra; mutasiyadan sonra `detail(id)` invalidate
- [X] T035 [US2] `ADMIN/src/pages/ifi-organizations/index.tsx`, `ADMIN/src/app/routes/index.ts` (`createCrudRoutes` + `lazyRouteComponent`, `chunk-reload`), `ADMIN/src/app/routes/nav.ts` (`NavKey 'ifiOrganizations'`, group `content`)
- [X] T036 [P] [US2] `ADMIN/src/locales/{az,en}/ifiOrganizations.json`, `nav.json`, `ADMIN/src/shared/i18n/index.ts` qeydiyyatı
- [X] T037 [US2] `ADMIN/src/features/ifi-organizations/ifi-organizations.test.tsx`: yaratma, boş ad, səhv il, tarix əlavə/sıra/silmə, soft delete, siyahı
- [X] T038 [US2] `npm run verify` Node 22-də (`ADMIN`), `npm run roundtrip -- "Beynəlxalq təşkilatlarla əməkdaşlıq"`

**Checkpoint**: US1 + US2 birlikdə tam axındır.

---

## Phase 5: User Story 3 - Figma məzmunu əl işi olmadan gəlir (P2)

**Goal**: Yayımda 4 təşkilat, DB tarixləri və səhifə başlığı/girişi avtomatik gəlir.

**Independent Test**: `quickstart.md` §1.

- [X] T039 [US3] `ADMIN-API/db/migrations/0026-ifi-organizations-seed.sql`: `DO $seed$`, boş cədvəl qoruyucusu, 4 təşkilat (sort 10/20/30/40, published, il, link), az/en tərcümələr (dollar-quoting), DB-nin 5 üzvlüyü az/en
- [X] T040 [US3] Eyni faylda səhifə bloku: az slug ilə səhifəni tap, `has_table_privilege('page_translations','UPDATE')` və az başlıq köhnə dəyərdirsə — az başlıq Figma başlığı, az/en məzmunun əvvəlinə giriş `<p>`; əks halda `RAISE NOTICE` (research R4)
- [X] T041 [US3] `quickstart.md` §1-in dörd ssenarisini PGlite-da icra et (boş baza, təkrar, dəyişmiş başlıq, `cbar_web_ro` SELECT)

**Checkpoint**: Seed təkrar işlənə bilir, redaktor dəyişikliyi qorunur.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [X] T042 [P] `SITE/docs/cooperation-cms-guide.md`: bölmə, kartlar, loqo yükləmə (103×58 nisbəti), tarixlər, sıra, köhnə siyahının kəsilməsi, "(Kopya)"
- [X] T043 [P] Kök `CLAUDE.md`: web-cbar-new bölməsinə spec 044 bəndi, layout guard siyahısına `ifi-organizations`
- [X] T044 [P] `SITE/CLAUDE.md` və `ADMIN/CLAUDE.md`: yeni layout və yeni bölmə qeydi
- [X] T045 `/sync-openapi` hər iki API üçün, `# Sync:` sətri
- [X] T046 `/sync-business-logic` (`new_business_logic.md`, `diff_report_logic.md` — axtarış sonrakı iş kimi)
- [X] T047 `diff -rq` Domain, `dotnet build` hər ikisində, hər iki frontend gate-i Node 22-də, `git status`-da müvəqqəti fayl yoxdur
- [X] T048 Deploy qeydi istifadəçiyə: 4 MR, sıra `api-cbar-admin` → `api-cbar` → `web-cbar-new`, `web-cbar-admin-new` admin API-dən sonra; redaktor işi: loqoları yükləmək, en mətni yoxlamaq

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup → Foundational → story-lər → Polish
- **T009 gate** bütün controller tapşırıqlarını (T011, T027, T028) bloklayır

### User Story Dependencies

- **US1**: Foundational-dan sonra; sayt hissəsi MSW fikstürü ilə public API-siz də yoxlanılır
- **US2**: Foundational-dan sonra, US1-dən asılı deyil; T023-dəki admin roundtrip siyahısı US1-dədir
- **US3**: T003-dən sonra yazıla bilər, nəticəsi US1 + US2 hazır olanda yoxlanılır

### Parallel Opportunities

- T007 + T008
- T013 + T021 + T022
- T031 + T036
- US1 (sayt) və US2 (panel) T009-dan sonra paralel
- T042 + T043 + T044

## Implementation Strategy

### MVP

Phase 1–2, US1, US2: ziyarətçi görür, redaktor idarə edir. Seed olmadan təşkilatlar admindən əl ilə yazılır.

### Tam çatdırılma

US3 ilə birgə: `api-cbar-admin` (`0025`, `0026`, CRUD), `api-cbar`, `web-cbar-admin-new`, `web-cbar-new`.
