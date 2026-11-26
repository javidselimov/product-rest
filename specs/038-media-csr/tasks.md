# Tasks: KSM layihələri — admin paneldən idarə olunan məzmun növü

**Input**: `specs/038-media-csr/`: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

**Tests**: Frontend testləri davranış testləridir (rol, `userEvent`, MSW). API-lərdə test layihəsi yoxdur: yoxlama `quickstart.md` ilə real icradır.

**Təşkili**: User story-lər üzrə, hər story daxilində deploy sırası: `api-cbar-admin` → `api-cbar` → `web-cbar-admin-new` → `web-cbar-new`. Hər komponent ayrıca merge request-dir. Commit yalnız istəklə.

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

- [x] T001 İlk iterasiyanın işçi vəziyyətini yoxla: `git status`, `SITE/src/features/about-content/model/csr-projects.ts` və `SITE/src/widgets/about-blocks/csr-project-card.tsx` yerindədir, Node 22-də `npm run test:run` yaşıldır (`SITE`)
- [x] T002 [P] `ADMIN-API/db/migrations/` və `WEB-API/db/migrations/`-da `0020`, `0021` adlarının boş olduğunu təsdiqlə, `diff -r ADMIN-API/src/Cbar.Domain WEB-API/src/Cbar.Domain` boşdur

---

## Phase 2: Foundational

**Bütün story-lərin əsası: sxem, domain və təsdiqlənmiş API kontraktı.**

- [x] T003 `ADMIN-API/db/migrations/0020-csr-projects.sql` yaz: `data-model.md`-dəki beş cədvəl, şərti FK-lər, `set_updated_at` trigger, `GRANT SELECT` to `cbar_web_ro`, `csr.*` icazələri + moderator grant (`0018-events.sql` nümunəsi, `BEGIN/COMMIT` yox)
- [x] T004 `ADMIN-API/src/Cbar.Domain/Entities/CsrProject.cs` və `ADMIN-API/src/Cbar.Domain/CbarDbContext.cs`: `CsrProject`, `CsrProjectTranslation`, `CsrProjectImage`, `CsrCategory`, `CsrCategoryTranslation`, xəritələmə, `HasQueryFilter`
- [x] T005 T004-ü `WEB-API/src/Cbar.Domain/`-a bayt-bayt köçür, `diff -r` boşdur
- [x] T006 [P] `ADMIN-API/openapi/paths/csr-projects.yaml` və `openapi.yaml`: `contracts/api.md`-dəki 13 marşrut, `x-permission`, `/api-endpoint` skill-i ilə; lint + bundle
- [x] T007 [P] `WEB-API/openapi/paths/csr-projects.yaml` və `openapi.yaml`: `GET /api/v1/csr-projects`, `search` cavabına `csr-project` tipi; lint + bundle
- [x] T008 **GATE**: OpenAPI spec-lərini istifadəçiyə təqdim et və təsdiq al. Təsdiqə qədər controller yazılmır

- [x] T009 `ADMIN-API/src/Cbar.AdminApi/Controllers/CsrCategoriesController.cs` (`EventCategoriesController.cs` nümunəsi), bağlı layihədə `ConflictProblem`. Foundational-dadır, çünki layihə kateqoriyasız yaradıla bilmir (T008-dən sonra)

**Checkpoint**: Sxem, domain, kontrakt və kateqoriya API-si hazırdır, `dotnet build` hər iki API-də keçir.

---

## Phase 3: User Story 1 - Redaktor layihəni formadan idarə edir (P1) 🎯 MVP

**Goal**: Redaktor admin paneldə layihə yaradır, foto əlavə edir, sıralayır və dərc edir.

**Independent Test**: İki dildə layihə yarat, fotoları sırala, dərc et; `GET /api/v1/csr-projects/{id}` (admin) və panel siyahısında dəyişikliyi gör.

### api-cbar-admin

- [x] T010 [US1] `ADMIN-API/src/Cbar.AdminApi/Authorization/Permissions.cs`: `Csr` sinfi (`Read/Create/Update/Delete`) və `All`
- [x] T011 [US1] `ADMIN-API/src/Cbar.AdminApi/Controllers/CsrProjectsController.cs`: siyahı, oxuma, yaratma, yeniləmə, soft delete; `CbarControllerBase`, `AuditService`, `category_id` və media id yoxlaması (`EventsController.cs` nümunəsi)
- [x] T012 [US1] Eyni controller-də `/{id}/assets`, `/{id}/assets/order`, `/{id}/assets/{mediaId}` (`PressReleasesController.cs:79-158` nümunəsi, locale marşrutu yoxdur)
- [x] T013 [US1] `ADMIN-API/src/Cbar.AdminApi/Controllers/MediaController.cs`: in-use SQL-ə `csr_projects.cover_media_id` və `csr_project_images.media_id`
- [x] T014 [US1] `quickstart.md` §2 admin hissəsini PGlite ilə icra et, `route-diff.mjs` təmizdir

### web-cbar-admin-new

- [x] T015 [P] [US1] `ADMIN/src/shared/crud/types.ts`, `ADMIN/src/features/crud/components/field-control.tsx`: `textarea` `FieldType`, kit `Textarea`
- [x] T016 [P] [US1] `ADMIN/src/shared/testing/handlers/csr-projects.ts`: real kontrakta uyğun MSW handler + handler siyahısına qeydiyyat
- [x] T017 [US1] `ADMIN/src/features/csr-projects/model/schemas.ts`, `api/csr-projects.service.ts`, `api/keys.ts`, `model/constants.ts`
- [x] T018 [US1] `ADMIN/src/features/csr-projects/model/module.ts`: `perLocale` sahələr, `textarea`, `richtext`, `media`, status, görünüş; `ADMIN/src/features/csr-projects/components/csr-project-images-section.tsx` (`AssetsSection reorderable`)
- [x] T019 [US1] `ADMIN/src/pages/csr-projects/index.tsx` (`LookupGate`), `ADMIN/src/app/routes/index.ts` (`createCrudRoutes`), `ADMIN/src/app/routes/nav.ts` (`NavKey`, group `content`)
- [x] T020 [P] [US1] `ADMIN/src/locales/{az,en}/csr-projects.json`, `nav.json`, `ADMIN/src/shared/i18n/index.ts` qeydiyyatı
- [x] T021 [US1] `ADMIN/src/features/csr-projects/model/module.test.tsx`: davranış testləri (yaratma, boş məcburi sahə, foto sırası, silmə), `textarea` üçün field-control testi
- [x] T022 [US1] `npm run verify` Node 22-də (`ADMIN`)

**Checkpoint**: Layihə admin paneldən tam idarə olunur.

---

## Phase 4: User Story 2 - Ziyarətçi layihələri görür və oxuyur (P1)

**Goal**: KSM səhifəsi kartları yeni endpoint-dən alır, görünüş dəyişmir.

**Independent Test**: Fikstür proxy ilə səhifəni az/en, 1728/744/390 ölçülərində aç, `contracts/ui-contract.md` ilə tutuşdur.

### api-cbar

- [x] T023 [US2] `WEB-API/src/Cbar.WebApi/Controllers/CsrProjectsController.cs`: `GET api/v1/csr-projects`, filtr `data-model.md` "Public görünüş", EF projeksiyası
- [x] T024 [US2] `WEB-API/src/Cbar.WebApi/Controllers/SearchController.cs`: `csr-project` bloku (`research.md` R9)
- [x] T025 [US2] `quickstart.md` §2 public hissəsini `cbar_web_ro` ilə icra et

### web-cbar-new

- [x] T026 [P] [US2] `SITE/src/shared/testing/handlers/csr-projects.ts` və `SITE/src/shared/testing/fixtures/csr-projects.ts`
- [x] T027 [US2] `SITE/src/features/csr-projects/model/csr-project.ts` (Zod sxemi) və `SITE/src/features/csr-projects/api/csr-projects.api.ts` (`server-only`, `cachedJson`)
- [x] T028 [US2] `SITE/src/features/about-content/model/csr-projects.ts`: cədvəl və `h3` məntiqini sil, yalnız giriş + `linkedFile`; `types.ts`-də `CsrProject` API formasına uyğun, `markup.ts`-dən artıq istifadə olunmayan ixraclar yoxlanılır
- [x] T029 [US2] `SITE/src/views/cms-page/loader.ts`: `csr-projects` layout-unda layihələri yüklə, `prepareCmsHtml`, `mediaUrl`, cover fallback; xəta `[]`; `SITE/src/views/cms-page/index.tsx` fayl bloku gizli qalır
- [x] T030 [US2] `SITE/src/widgets/about-blocks/csr-projects.tsx`: başlıq `media.json`-dan, boş siyahıda başlıq və grid yoxdur; `noscript` qorunur; `csr-project-card.tsx` yeni tip sahələri
- [x] T031 [P] [US2] `SITE/src/locales/{az,en}/media.json` (`csr.projectsTitle`), `SITE/src/locales/{az,en}/search.json`, `SITE/src/features/search/model/schemas.ts`
- [x] T032 [US2] Fikstürləri sadələşdir: `SITE/src/features/about-content/fixtures/csr-projects.html` və `ADMIN/src/features/rich-text/fixtures/layouts/csr-projects.html` eyni; `layout-fixtures.test.ts` gözləntisi
- [x] T033 [US2] Testlər: `SITE/src/features/about-content/model/csr-projects.test.ts`, `SITE/src/widgets/about-blocks/csr-projects.test.tsx`, `SITE/src/views/cms-page/csr-projects.test.tsx` (API-dən kart → modal, boş siyahı, API xətası, fayl bloku yoxdur)
- [x] T034 [US2] Node 22-də `setup:check`, `check:self-contained`, `check:layout-fixtures`, `lint`, `typecheck`, `test:run` (`SITE`); `build` ayrı nüsxədə
- [x] T035 [US2] Fikstür proxy + production build + headless Edge: 3 ölçü, modal, JS-siz, en PDF, API 500 (`quickstart.md` §4). Müvəqqəti qovluğu sonra sil, əvvəlcə junction-u aç

**Checkpoint**: US1 + US2 birlikdə tam axındır.

---

## Phase 5: User Story 3 - Redaktor kateqoriyaları idarə edir (P2)

**Goal**: Etiket siyahıdan seçilir, Tədbirlərə qarışmır.

**Independent Test**: Kateqoriya adını dəyiş, kart və modalda yeni adı gör; bağlı kateqoriyanı silməyə çalış.

- [x] T036 [US3] `ADMIN/src/features/csr-projects/model/module.ts`: kateqoriya modulu, `sectionTabs`, layihə formasında `useLookupOptions`
- [x] T037 [P] [US3] `ADMIN/src/shared/testing/handlers/csr-projects.ts` kateqoriya marşrutları, `ADMIN/src/features/csr-projects/model/categories.test.tsx`: siyahı, ad dəyişmə, 409 mesajı
- [x] T038 [US3] `quickstart.md`: kateqoriya 409, Tədbir filtrində KSM kateqoriyası yoxdur; `ADMIN` `verify`

**Checkpoint**: Etiketlər idarə olunur.

---

## Phase 6: User Story 4 - Mövcud məzmun əl işi olmadan köçür (P2)

**Goal**: Yayımda dörd layihə mətn və fotolarla köçür.

**Independent Test**: `quickstart.md` §1.

- [x] T039 [US4] `ADMIN-API/db/migrations/0021-csr-projects-seed.sql`: 4 kateqoriya + 4 layihə az/en (`specs/038-media-csr/csr-html/`), dollar-quoting, status `published`, sıra 10/20/30/40
- [x] T040 [US4] Eyni faylda fotolar: `page_assets` + `page_asset_translations`, az başlıq `bilesuvar-nba-%`, `qanverme_%`, `sort_order`; tapılmayanda `RAISE NOTICE` (`research.md` R7)
- [x] T041 [US4] Köhnə mətn CMS-də qalır, sayt onu layihələr gələndə göstərmir: `SITE/src/features/about-content/model/csr-projects.ts` (`research.md` R8). Miqrasiya yoxdur
- [x] T042 [US4] `specs/038-media-csr/csr-html/az.html`, `en.html`: seed mənbəyi kimi artıq lazım deyil: mətn `0021`-ə köçürüldü, qovluq silindi
- [x] T043 [US4] `quickstart.md` §1-in dörd ssenarisini real SQL-də (PGlite) icra et

**Checkpoint**: Köçürmə təkrar işlənə bilir, dublikat yoxdur.

---

## Phase 7: Polish & Cross-Cutting Concerns

- [x] T044 [P] `SITE/docs/media-cms-guide.md`: KSM bölməsini yenidən yaz
- [x] T045 [P] Kök `CLAUDE.md`: spec 038 qeydi, `csr-projects` guard sətri yeni mənada
- [x] T046 [P] `ADMIN/src/features/rich-text/roundtrip.test.ts` şərhi və siyahısı aktualdır
- [ ] T047 `/sync-openapi` hər iki API üçün, `# Sync:` sətri
- [ ] T048 `/sync-business-logic`
- [x] T049 `diff -r` Domain, `dotnet build` hər ikisində, hər iki frontend gate-i Node 22-də, `git status`-da müvəqqəti fayl yoxdur
- [ ] T050 Deploy qeydi: dörd komponent bir yayımda, sıra, `quickstart.md` §5 yoxlaması istifadəçiyə təqdim olunur

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup → Foundational → story-lər → Polish
- **T008 gate** bütün controller tapşırıqlarını bloklayır

### User Story Dependencies

- **US1**: Foundational-dan sonra. Kateqoriya API-si (T009) orada hazırdır, panelin kateqoriya tab-ı US3-dədir
- **US2**: Foundational-dan sonra, endpoint fikstürlə müstəqil yoxlanılır
- **US3**: US1-dən sonra, admin UI hissəsi
- **US4**: US1 + US2 hazır olanda yoxlanılır, çünki nəticə saytda görünür

### Parallel Opportunities

- T006 + T007
- T015 + T016 + T020
- T026 + T031
- T044 + T045 + T046

## Implementation Strategy

### MVP

Phase 1–2, US1, US2: redaktor idarə edir, ziyarətçi görür. Bu halda köçürmə əvəzinə layihələr admindən əl ilə yazılır.

### Tam çatdırılma

US4 ilə birgə. Yayım sırası `plan.md` "Deploy sırası"ndadır: `api-cbar-admin` (`0020`, `0021`, CRUD), `api-cbar`, `web-cbar-admin-new`, `web-cbar-new`, hamısı bir yayımda.
