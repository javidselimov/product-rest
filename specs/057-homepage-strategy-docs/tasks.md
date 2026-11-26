# Tasks: Ana səhifənin "Strategiya və sənədlər" bloku — admin paneldən idarə

**Input**: `specs/057-homepage-strategy-docs/`: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

**Tests**:
- `frontend-standards` TDD tələb edir: test tapşırığı implementasiyadan əvvəl gəlir və əvvəl qırmızı olmalıdır. Frontend testləri davranış
  testləridir: rol, `userEvent`, MSW (yaddaş `functional-component-tests`).
- API-lərdə təmiz funksiyalar xUnit ilə yoxlanılır (`StrategyDocRulesTests`, `StrategyDocLinksTests`). SQL tələb edən hissələr PGlite üzərində endpoint
  icrası ilə yoxlanılır (`quickstart.md` §2–§4, yaddaş `pglite-api-testing`).
- Bu spec yeni `AboutLayoutKind` əlavə etmir, layout fixture guard tələb olunmur. Rich-text extension-larına toxunulmur, `npm run roundtrip` lazım
  deyil.

**Təşkili**: tapşırıqlar user story-lər üzrə qruplaşdırılıb. Hər komponent ayrıca merge request-dir. Deploy sırası: `api-cbar-admin` (MR 1) →
`api-cbar` (MR 2) → `web-cbar-admin-new` (MR 3) → `web-cbar-new` (MR 4). Workspace sənədləri və `specs/` ayrıca commit-dir. Commit yalnız istəklə
edilir.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: paralel işlənə bilər (fərqli fayllar, açıq asılılıq yoxdur)
- **[Story]**: aid olduğu user story (spec.md):
  - US1 — redaktor blokun sənədlərini admin paneldə idarə edir — P1
  - US2 — ziyarətçi blokda redaktorun seçdiyi sənədləri görür — P1
  - US3 — bugünkü üç sənəd avtomatik köçürülür — P2
  - US4 — kartlar köhnə saytın üç səhifəsinin yeni qarşılığına aparır, köhnə ünvanlar işləyir — P2

## Yol qısaltmaları

- `ADMIN-API` = `product-rest/api-cbar-admin` · `WEB-API` = `product-rest/api-cbar`
- `ADMIN` = `product-rest/web-cbar-admin-new` · `SITE` = `product-rest/web-cbar-new`
- `HP-ADMIN` = `ADMIN/src/features/homepage` · `SPEC` = `specs/057-homepage-strategy-docs`

## Ümumi qaydalar (hər tapşırıq üçün)

- **Frontend skill qaydası** (`.claude/hooks/frontend-skills.mjs`): `SITE` və ya `ADMIN` tapşırığına başlamazdan əvvəl bu skill-lər yüklənir:
  `senior-front`, `frontendpatterns` və həmin komponentin `frontend-standards`, `ui-kit-usage` skill-ləri. Kod `plan.md` "Frontend Skills Gate"
  cədvəlinə uyğun yazılır.
- Yeni şərhlər ingiliscə yazılır. Toxunulan faylda azərbaycanca şərhlər də ingiliscəyə çevrilir (yaddaş `code-comments-english`). UI mətni yalnız
  i18n açarı ilə verilir, az və en.
- Rəqəmlər adlı sabitdir (spec 032): `SITE/src/views/home/constants.ts`, `HP-ADMIN/model/constants.ts`. API-də limitlər `StrategyDocRules`-dadır.
- `SITE`-da `prettier --write` işlədilmir. Fayllar Edit və ya Node ilə redaktə olunur, `sed -i` işlədilmir (yaddaş `windows-shell-crlf`,
  `no-prettier-write-web-cbar-new`). Köməkçi skriptlər və ölçü nəticələri `.tmp-057/`-dədir (yaddaş `fork-agents-share-tmp`). Vitest PowerShell-dən
  işlədilir.
- Endpoint-lər spec-first yazılır: OpenAPI əvvəl gəlir (T003–T005). `.claude/hooks/spec-first.mjs` bundle-da olmayan route-u rədd edir.
- `Cbar.Domain` iki nüsxədə bayt-bayt eynidir. `dotnet` `C:/Program Files/dotnet/dotnet`-dədir. Docker işlədilmir (yaddaş `dotnet-sdk-local-build`).
- Mövcud cədvəllərə `ALTER TABLE` edilmir (yaddaş `no-alter-existing-tables`).

---

## Phase 1: Setup

**Purpose**: dəyişiklikdən əvvəlki ölçülər, redaktor faylları və spec-first kontraktlar.

- [X] T001 Saytın bugünkü blokunu ölç (SC-004 baza xətti):
  - `SITE` `npm run dev` (:3001), `/az`;
  - 1728, 744 və 390 enliklərində Edge CDP ilə `[data-slot="strategy-docs"]`, onun `ul`-u və hər `li` üçün `getBoundingClientRect`;
  - nəticə `.tmp-057/baseline.json`-a yazılır (yaddaş `figma-measure-dom`, `measure-before-claiming`);
  - API məlumatı lazım deyil, blok bu an mock-dan gəlir.
- [X] T002 [P] `SITE/public/site/home/risk-based-supervision.png` və `microfinance.png` fayllarını `SPEC/assets/`-ə **kopyala**. Silmə T037-dədir.
  Faylların Figma mənbəyini (`813:25108`, `813:25178`) və ölçülərini `SPEC/assets/README.md`-də yaz.
- [X] T003 [P] Admin OpenAPI-ni contracts/admin-api.md üzrə yaz:
  - `ADMIN-API/openapi/paths/homepage.yaml`: `strategyDocs` (GET list, POST), `strategyDoc` (GET, PUT, DELETE), `strategyDocsOrder` (PUT);
  - `ADMIN-API/openapi/components/schemas/homepage.yaml`: `StrategyDocUpsert`, `StrategyDocTranslation`, `StrategyDocListItem`, `StrategyDocDetail`,
    `StrategyDocOrder`;
  - `ADMIN-API/openapi/openapi.yaml`: `/api/v1/homepage-strategy-docs`, `/{id}`, `/order`;
  - sonra `npm run lint && npm run bundle` (`ADMIN-API/openapi`).
- [X] T004 [P] Public OpenAPI-ni contracts/public-api.md üzrə yaz:
  - `WEB-API/openapi/components/schemas/homepage.yaml`: `Homepage.strategyDocs` (required, array) və yeni `StrategyDoc`;
  - `WEB-API/openapi/paths/homepage.yaml`: `description`-a "strategy documents" əlavə olunur;
  - sonra `npm run lint && npm run bundle` (`WEB-API/openapi`).
- [X] T005 Spec təsdiqi (spec-first, `/api-endpoint` skill-i): T003 və T004 diff-ini istifadəçiyə göstər və təsdiq gözlə. Təsdiqə qədər controller
  kodu yazılmır.

**Checkpoint**: baza xətti ölçülüb, kontraktlar təsdiqlənib.

---

## Phase 2: Foundational (bütün hekayələr bundan asılıdır)

**Purpose**: sxem və EF modeli. US1 də, US2 də bu cədvəllərə yazır və ya oxuyur.

- [X] T006 `ADMIN-API/db/migrations/0043-homepage-strategy-docs.sql` yaz (data-model.md "Cədvəllər", `0036-fincert.sql` forması):
  - `homepage_strategy_docs`: `serial` PK, `page_id`, `sort_order`, `status content_status DEFAULT 'draft'`, `created_by`, `updated_by`,
    `created_at`, `updated_at`, `deleted_at`; indeks `(status, sort_order)`;
  - `homepage_strategy_doc_translations`: `bigserial`, `doc_id … ON DELETE CASCADE`, `locale`, `title varchar(300) NOT NULL`, `summary varchar(500)`,
    `cover_media_id bigint`, `url varchar(1000)`, `UNIQUE (doc_id, locale)`;
  - şərti FK-lər `has_table_privilege(…, 'REFERENCES')` ilə: `page_id → pages SET NULL`, `created_by` və `updated_by → users SET NULL`,
    `cover_media_id → media_assets`, `locale → locales`;
  - `set_updated_at` trigger-i;
  - `cbar_web_ro` üçün `GRANT SELECT` (rol varsa);
  - dörd `homepage_strategy_docs.*` icazəsi + moderator, INSERT hüququ yoxdursa `RAISE WARNING`.

  Faylda `BEGIN`/`COMMIT` olmur, hər şey `IF NOT EXISTS` ilədir.
- [X] T007 `ADMIN-API/src/Cbar.Domain`-ə EF modelini əlavə et (data-model.md "EF modeli"):
  - `Entities/Homepage.cs`: `HomepageStrategyDoc` (`Page?` naviqasiyası ilə) və `HomepageStrategyDocTranslation` (`CoverMedia?` ilə);
  - `CbarDbContext.cs`:
    - `DbSet<HomepageStrategyDoc> HomepageStrategyDocs`;
    - `OnModelCreating`-də cədvəl adları, `doc_id` sütun adı, `cover_media_id`, unikal indeks `(DocId, Locale)`;
    - `HasQueryFilter(x => x.DeletedAt == null)` (`FincertMembership` konfiqurasiyası kimi).
- [X] T008 T007-nin iki faylını `WEB-API/src/Cbar.Domain`-ə bayt-bayt köçür. `diff -r ADMIN-API/src/Cbar.Domain WEB-API/src/Cbar.Domain` boş olmalıdır
  (`bin`/`obj` xaric).
- [X] T009 Build və miqrasiya: `dotnet build` (`ADMIN-API/CbarAdminApi.slnx`, `WEB-API/CbarWebApi.slnx`). Sonra admin API-ni PGlite bazasında başlat
  (`quickstart.md` §2): `schema_migrations`-da `0043` olmalı, iki cədvəl və dörd icazə yaranmalıdır. İkinci başlatmada xəta olmamalıdır.

**Checkpoint**: cədvəllər var, iki API build olur, `Cbar.Domain` diff-i sıfırdır.

---

## Phase 3: User Story 1 — redaktor blokun sənədlərini admin paneldə idarə edir (P1) 🎯 MVP (US2 ilə birlikdə)

**Goal**: "Ana səhifə blokları → Strategiya və sənədlər" tabında sənədlər yaradılır, redaktə olunur, silinir, statusu dəyişir və sıralanır. Yanlış
məlumat saxlanılmır.

**Independent Test**: admin-də yeni sənəd yaradılır, "Sıranı dəyiş" ilə birinci yerə çəkilir, üz qabığı yüklənir. `GET /homepage-strategy-docs` yeni
sıranı, `audit_log` dörd hadisəni göstərir. Saytın göstərməsi US2-dir.

### Tests for User Story 1 (əvvəl yaz, qırmızı olmalıdır)

- [X] T010 [P] [US1] `ADMIN-API/tests/Cbar.AdminApi.Tests/StrategyDocRulesTests.cs`. Hər validasiya sətri üçün bir hal (data-model.md "Validasiya"):
  - `scheduled` status;
  - naməlum dil;
  - heç bir başlıq yoxdur;
  - uzunluq limitləri (300, 500, 1000);
  - `url` qaydası: `javascript:`, `//host`, `www.x`, `/x` (keçir), `https://x` (keçir);
  - nə səhifə, nə də başlıqlı dildə `url`;
  - başlıqsız dildəki `url` sayılmır;
  - hər xətanın `errors` açarı (`translations.az.title`, `pageId` …).

  `ContentSupport.IsAllowedLink` üçün ayrıca hallar.
- [X] T011 [P] [US1] MSW: `ADMIN/src/shared/testing/handlers/homepage.ts`-ə `/homepage-strategy-docs` əlavə et:
  - digər ana səhifə blokları kimi `createCrudStore`;
  - siyahı cavabı contracts/admin-api.md formasındadır: `pageTitle`, `urls`, `cover`, `locales`, `linkBroken`;
  - detal `page`, `translations.<dil>.cover` ilə;
  - `PUT /order` permutasiya yoxlaması ilə;
  - server yoxlamaları eyni Azərbaycanca mesajlar və `errors` açarları ilə;
  - soft delete;
  - fikstür: üç sənəd (biri `linkBroken: true`).
- [X] T012 [US1] `HP-ADMIN/strategy-docs.test.tsx` (`renderApp(path)` + MSW, istifadəçi davranışı). Hallar:
  - (a) `/homepage-blocks`-da "Strategiya və sənədlər" tabı və hub kartı var, tab siyahını açır;
  - (b) siyahının təsviri "ilk üç" qaydasını deyir, "Keçid işləmir" nişanı görünür;
  - (c) yeni sənəd: səhifə axtarışla seçilir, az başlığı yazılır, yadda saxlanılır → siyahıda görünür;
  - (d) başlıqsız və ünvansız yadda saxlama → xəta az tabında başlıq altında, səhifə sahəsində;
  - (e) en tabında `javascript:` ünvanı → en tab "Xəta" ilə işarələnir;
  - (f) üz qabığı seçicisində PDF söndürülüb;
  - (g) "Sıranı dəyiş" dialoqunda yuxarı düyməsi → sıra dəyişir, live region elan edir;
  - (h) formanı dəyişib tabdan çıxma → təsdiq soruşulur.

### Implementation for User Story 1 — `api-cbar-admin` (MR 1)

- [X] T013 [US1] `ADMIN-API/src/Cbar.AdminApi/Services/ContentSupport.cs`-ə `IsAllowedLink(string)` əlavə et (`http://`, `https://` və ya `/`, `//`
  rədd edilir). `Controllers/ImagePopupsController.cs` və `Controllers/ReleaseScheduleItemsController.cs`-dəki özəl kopyaları sil, ona yönəlt. Davranış
  dəyişmir.
- [X] T014 [US1] `ADMIN-API/src/Cbar.AdminApi/Validation/StrategyDocRules.cs`-i yaz:
  - `internal static`, `WorkingPaperRules` forması;
  - limit sabitləri (`MaxTitleLength = 300`, `MaxSummaryLength = 500`, `MaxUrlLength = 1000`);
  - `Validate(dto, pageExists, mediaMimeTypes)` → `errors` lüğəti (`WorkingPaperRules` kimi), DB-siz; controller `FieldValidationProblem` qaytarır.

  T010 yaşıl olur.
- [X] T015 [US1] `ADMIN-API/src/Cbar.AdminApi/Authorization/Permissions.cs`: `HomepageStrategyDocs` (`homepage_strategy_docs.read|create|update|delete`)
  sinfini yaz və ümumi siyahıya `HomepagePublications`-dan sonra əlavə et.
- [X] T016 [US1] `ADMIN-API/src/Cbar.AdminApi/Controllers/HomepageStrategyDocsController.cs` (`FincertMembershipsController` forması, contracts/admin-api.md):
  - Route `api/v1/homepage-strategy-docs`. Endpoint-lər: `List` (paging, `search` `ILIKE`, `status`), `Get`, `Create` (`max + 1` sıra), `Update`, `Delete`
    (soft), `PUT order` (`ContentSupport.InvalidOrder`).
  - Yoxlamalar: əvvəl `StrategyDocRules`, sonra DB.
    - `pageId` mövcuddur;
    - `coverMediaId` şəkildir (`MediaUploadRules.ImageMimePrefix`);
    - xəta `BadRequestProblem` + `errors` açarı ilə.
  - Başlıqsız dil saxlanılmır, mövcud sətri silinir.
  - `linkBroken` public qaydası ilə hesablanır: dildə `url` və ya görünən səhifənin həmin dildə slug-u (`Published`, `Active`, `ShowAz`/`ShowEn`).
  - Audit `homepage.strategy_doc_create|update|delete|reorder`, entity `homepage_strategy_doc`.
  - Bütün endpoint-lər `RequirePermission`-dır.
- [X] T017 [US1] `ADMIN-API` yoxlaması:
  - `dotnet build` + `dotnet test CbarAdminApi.slnx` (T010 yaşıl);
  - PGlite üzərində `quickstart.md` §3 cədvəli (hər sətir; T005-dəki mesajlar);
  - `node .claude/skills/sync-openapi/scripts/route-diff.mjs` — admin üçün fərq yoxdur.

### Implementation for User Story 1 — `web-cbar-admin-new` (MR 3)

- [X] T018 [P] [US1] `HP-ADMIN/model/constants.ts`: `STRATEGY_DOC_LIMITS = { TITLE: 300, SUMMARY: 500, URL: 1000 } as const` (API ilə eyni rəqəmlər,
  ingiliscə "niyə" şərhi).
- [X] T019 [US1] `HP-ADMIN/model/strategy-docs.ts` (contracts/admin-ux.md):
  - Zod `rowSchema`/`detailSchema` T011 forması ilə;
  - forma sxemi `superRefine` ilə: ən azı bir başlıq, səhifə və ya başlıqlı dildə ünvan, `isAllowedLink`, limitlər;
  - `strategyDocsModuleBase: ModuleConfig`:
    - `apiPath: '/homepage-strategy-docs'`, `basePath: '/homepage-blocks/strategy-docs'`;
    - sütunlar: sıra, başlıq, keçid + "Keçid işləmir" nişanı, `LocaleBadges`, status;
    - sahələr: `status` defolt `published`, `pageId` searchable/nullable/`valueAsNumber`/`mediaNameKey: 'page.title'`, `perLocale` `title`, `summary`,
      `coverMediaId` (`mediaAccept: 'image'`, `mediaNameKey` `{locale}` ilə), `url`;
    - `descriptionKey`, crumb `HOMEPAGE_CRUMBS`, `sectionTabs` `HOMEPAGE_SECTION_TABS`.
  - Seçimləri (`pages`) qəbul edən fabrik `strategyDocsModule(pages)`, `pages/events` nümunəsi.
- [X] T020 [US1] Sıra:
  - `HP-ADMIN/api/strategy-docs.service.ts`: `order(ids)` → `PUT /homepage-strategy-docs/order`, siyahı query-sini invalidasiya edir;
  - `HP-ADMIN/components/strategy-docs-reorder-dialog.tsx`: `features/crud/components/reorder-dialog.tsx`-i başlıq açarı `strategyDocs.reorderTitle`
    ilə sarır (`features/fincert/components/reorder-dialogs.tsx` nümunəsi).
- [X] T021 [US1] Ekran və naviqasiya:
  - `ADMIN/src/pages/homepage-blocks/strategy-docs.tsx`: `StrategyDocsPage` (`CrudListPage` + `extraActions` sıra dialoqu) və `StrategyDocsFormPage`. İkisi də
    səhifə ağacını `pagesService.tree` ilə `LookupGate` arxasında yükləyir (`pages/events/index.tsx` `flattenPages` nümunəsi; üçüncü istifadə olarsa ortaq
    yerə çıxarılır).
  - `ADMIN/src/app/routes/index.ts`: `createCrudRoutes(authLayoutRoute, registerModule(strategyDocsModuleBase), { list, form })`, `lazyRouteComponent` ilə.
  - `HP-ADMIN/model/section.ts`: "Nəşrlər"-dən sonra tab.
  - `ADMIN/src/pages/homepage-blocks/index.tsx` `HUB_CARDS`: `DocumentIcon` ilə kart.
- [X] T022 [P] [US1] `ADMIN/src/locales/az/homepage.json` və `ADMIN/src/locales/en/homepage.json`-a contracts/admin-ux.md "i18n" açarlarını yaz (mövcud
  `fields.title`, `fields.url` təkrarlanmır). Fayllar UTF-8 qoruyan alətlə yazılır, `npm run check:i18n` keçməlidir.
- [X] T023 [US1] T012-ni yaşıl et. `npx vitest run src/features/homepage` PowerShell-dən işlədilir, sonra Node 22 ilə də (yaddaş `run-tests-on-node22`).
- [X] T024 [US1] Review: `ui-kit-review` + `senior-front` review checklist (`references/review-checklist.md`) US1-də dəyişən `ADMIN` fayllarına. `plan.md`
  "Frontend Skills Gate" ilə tutuşdur:
  - hand-rolled siyahı və forma yoxdur (yalnız `ModuleConfig`);
  - ortaq reorder dialoqu işlədilir;
  - semantik rənglər;
  - nişanın xəbərdarlıq rəngi token-dəndir;
  - ikon düymələrində `aria-label`;
  - magic number yoxdur.

  Tapılanları düzəlt.
- [X] T025 [US1] `ADMIN` `npm run verify` (lint → check:kit → check:i18n → check:layout-fixtures → tsc -b → test:run → build). Nəticəni sonundan deyil, tam
  oxu (yaddaş `windows-shell-crlf`).

**Checkpoint**: admin API və panel işləyir. US1 müstəqil yoxlanılır (saytsız).

---

## Phase 4: User Story 2 — ziyarətçi blokda redaktorun seçdiyi sənədləri görür (P1)

**Goal**: ana səhifənin bloku mock əvəzinə `GET /homepage`-in `strategyDocs`-undan qurulur, görünüşü dəyişmir.

**Independent Test**: bazada sənədlər US1 admin API-si və ya SQL ilə yaradılır. `/az` və `/en` blokda ilk üç sənədi redaktor sırası ilə göstərir. Kartlar
CMS səhifəsinə və ya xarici ünvana aparır. Qaralama və işləməyən keçidli sənəd görünmür. Ölçülər T001 ilə eynidir.

### Tests for User Story 2 (əvvəl yaz, qırmızı olmalıdır)

- [X] T026 [P] [US2] `WEB-API/tests/Cbar.WebApi.Tests/StrategyDocLinksTests.cs`. Hallar:
  - `href`: dildə `url` → url; `url` yoxdur, görünən səhifə slug-u var → `/slug`; ikisi də yoxdur → `null` (sənəd düşür); xarici `url` səhifədən
    üstündür;
  - `coverUrl`: dilin şəkli → o; yoxdursa digər dilin → o; heç biri → `null`.
- [X] T027 [P] [US2] `SITE` testləri:
  - MSW `SITE/src/shared/testing/handlers/homepage.ts` (və onun fikstürü): `/homepage` cavabına 4 sənəd (daxili `href`, xarici `https://` `href`,
    `coverUrl: null`, `summary` ilə biri);
  - `SITE/src/views/home/loader.test.ts`:
    - ilk 3 götürülür, sıra saxlanılır;
    - daxili `href` → `/az/<slug>`, xarici olduğu kimi;
    - `coverUrl` `mediaUrl`-dən keçir;
    - `/homepage` 500 → `strategyDocs: []`.
  - Köhnə mock fərziyyələri `loader.test.ts`-də yeni fikstürə görə dəyişir: təxminən sətir 79 (events xətası → `strategyDocs` hələ doludur), 119 (mock
    ünvanları), 152 (statik üz qabıqları).
  - `SITE/src/views/home/index.test.tsx`: xarici `href`-li kartın başlıq linki və "Daha ətraflı" düyməsi `target="_blank"` və
    `rel="noopener noreferrer"` ilə; daxili link `target`-siz.

### Implementation for User Story 2 — `api-cbar` (MR 2)

- [X] T028 [US2] `WEB-API/src/Cbar.WebApi/Controllers/StrategyDocLinks.cs`: `internal static` `Href(url, pageSlug)` və `Cover(ownMediaId, otherMediaId)`
  (təmiz funksiyalar, `"/media/{id}"`). T026 yaşıl olur.
- [X] T029 [US2] `WEB-API/src/Cbar.WebApi/Controllers/HomepageController.cs`: `strategyDocs` sorğusu.
  - Filtr: `Status == Published`, dildə tərcümə var (`DeletedAt` query filter-dədir).
  - Sıra: `SortOrder`, `Id`.
  - Proyeksiya:
    - həmin dilin `title`, `summary`, `url`, `CoverMediaId`;
    - digər dilin `CoverMediaId`-si;
    - səhifənin həmin dildəki slug-u, yalnız `Page.Status == Published && Page.Active && (locale == "en" ? ShowEn : ShowAz)` olanda;
    - media sətri mövcud olanda `cover` id-si.
  - Yaddaşda `StrategyDocLinks` ilə `href` və `coverUrl` qurulur, `href` `null` olanlar atılır.
  - Cavaba `strategyDocs` əlavə olunur. `<summary>` şərhi yenilənir.
- [X] T030 [US2] `WEB-API` yoxlaması:
  - `dotnet build` + `dotnet test CbarWebApi.slnx`;
  - PGlite üzərində `quickstart.md` §4 (`cbar_web_ro` ilə): az/en `strategyDocs`, səhifəni qaralamaya keçirmə, sənədi `draft` etmə, en `url` əlavəsi;
  - route-diff: public üçün fərq yoxdur.

### Implementation for User Story 2 — `web-cbar-new` (MR 4)

- [X] T031 [US2] `SITE/src/features/homepage/model/schemas.ts`:
  - `homepageStrategyDocSchema` (`id: number`, `title: string`, `summary`/`coverUrl` `nullableString`, `href: string`, `.passthrough()`);
  - `homepageSchema.strategyDocs: z.array(...).default([])`;
  - `HomepageStrategyDoc` tipi;
  - toxunulan fayldakı azərbaycanca şərhlər ingiliscəyə çevrilir.
- [X] T032 [US2] `SITE/src/views/home/constants.ts`-ə `STRATEGY_DOCS_MAX = 3` (şərh: desktop sırası 424 + 200 + 200). `SITE/src/views/home/loader.ts`:
  - `toStrategyDoc(doc, locale)` (`key = String(id)`, `localizeHref`, `mediaUrl`);
  - `strategyDocs: HOME_BLOCKS.strategyDocs ? (home.data?.strategyDocs ?? []).slice(0, STRATEGY_DOCS_MAX).map(…) : []`;
  - `getHomeMocks` importu və `mocks` dəyişəni silinir;
  - `HomeData.strategyDocs` şərhi yenilənir.
- [X] T033 [US2] `SITE/src/views/home/mock.ts`-i sil. `SITE/src/views/home/blocks.ts` şərhində mock qeydini düzəlt: `HOME_BLOCKS` qalır, "mock bloklar"
  cümləsi çıxır.
- [X] T034 [US2] `SITE/src/widgets/home-cards/strategy-docs.tsx`:
  - böyük kartın başlıq linki, "Daha ətraflı" düyməsi (`Button asChild` → `SmartLink`) və dar kartların başlıq linki `widgets/smart-link` `SmartLink`
    ilə: daxili ünvan `Link`, xarici ünvan yeni vərəq;
  - doc-comment ingiliscə və mock qeydisiz.

  `Button asChild`-ın `SmartLink`-ə `className` ötürdüyünü testdə və brauzerdə yoxla.
- [X] T035 [US2] T027-ni yaşıl et (`npx vitest run src/views/home src/features/homepage`, PowerShell). Sonra Node 22 ilə də işlət.
- [X] T036 [US2] Review: `ui-kit-review` + `senior-front` review checklist US2-də dəyişən `SITE` fayllarına. `plan.md` gate ilə tutuşdur:
  - yeni `'use client'` yoxdur;
  - HTML sink yoxdur;
  - xarici link `noopener noreferrer` ilədir;
  - semantik rənglər;
  - magic number yoxdur;
  - mock-dan qalan ölü kod yoxdur.

  Tapılanları düzəlt.
- [X] T037 [US2] `SITE/public/site/home/risk-based-supervision.png` və `microfinance.png`-i sil. Əvvəl T002 ilə `SPEC/assets/`-də olduqlarını yoxla.
  `grep -r "risk-based-supervision\|microfinance.png" SITE/src` boş olmalıdır. `coin-banner.png`-ə toxunulmur.
- [X] T038 [US2] `SITE` `npm run verify` (setup:check → check:self-contained → check:layout-fixtures → lint → typecheck → test:run → build).
- [X] T039 [US2] SC-004 ölçüsü: T001-in eyni üsulu ilə üç enlikdə ölç. Məlumat test API-dən gəlir, `/homepage`-də `strategyDocs` yoxdursa fikstür proxy
  ilə verilir (yaddaş `hybrid-fixture-proxy-for-ui-measuring`). `.tmp-057/baseline.json` ilə fərq ≤ 2 px olmalı, yana sürüşmə olmamalıdır. Üz qabığı
  yer tutucu fonla gəlir, ölçü qutuya görədir.

**Checkpoint**: US1 + US2 birlikdə spec-in əsas dəyəridir: redaktor dəyişir, sayt göstərir.

---

## Phase 5: User Story 3 — bugünkü üç sənəd avtomatik köçürülür (P2)

**Goal**: deploy günü blok boş qalmır. Üç sənəd CMS səhifələrinə bağlı və dərc olunmuş halda yaranır.

**Independent Test**: boş cədvəlli PGlite bazasında API başlayır. Admin siyahısında üç sənəd, `/homepage`-də az və en üç sənəd var. API yenidən başlayanda
heç nə dəyişmir.

- [X] T040 [US3] `ADMIN-API/db/migrations/0044-homepage-strategy-docs-seed.sql` (data-model.md "Seed"):
  - `homepage_strategy_docs`-da sətir varsa (silinmiş də) heç nə edilmir;
  - üç sənəd sıra ilə yazılır: səhifə `page_translations (locale='az', slug=…)` ilə tapılır, tapılmayan atlanır;
  - `status 'published'`, `sort_order` 1..3, iki tərcümə (data-model cədvəlindəki az/en başlıqlar);
  - CMS səhifələrinə və media-ya toxunulmur;
  - `BEGIN`/`COMMIT` yoxdur.

  Mətnlər UTF-8 qoruyan alətlə yazılır.
- [X] T041 [US3] Köçürmə yoxlaması (PGlite, `quickstart.md` §2):
  - (a) üç səhifəli bazada 3 sətir, 6 tərcümə;
  - (b) yenidən başlatma → dəyişmir;
  - (c) bir slug-u olmayan bazada 2 sətir, xəta yoxdur;
  - (d) əvvəlcədən bir sətri olan bazada heç nə yazılmır.

  Test mühitində üç slug-un mövcudluğu 2026-11-23-də yoxlanılıb (104, 66, 76).
- [X] T042 [US3] Seed-dən sonra `WEB-API` `/homepage?locale=az|en` üç sənədi az və en slug-ları ilə qaytarır, `coverUrl: null` (`quickstart.md` §4).

**Checkpoint**: deploy-dan sonra blok bugünkü üç sənədi göstərir. Redaktorun işi üz qabıqlarını yükləməkdir.

---

## Phase 6: User Story 4 — kartlar köhnə saytın üç səhifəsinin yeni qarşılığına aparır, köhnə ünvanlar işləyir (P2)

**Goal**: köhnə `/pages/strategy` CMS səhifəsi 104-ün mətni olur (portret, müraciət, imza, PDF). Portret və PDF-lər idxal aləti ilə media
kitabxanasına yazılır. Köhnə beş ünvan yeni səhifələrə yönlənir. 104 kök bölmə kimi qalır (spec 056 header-i).

**Independent Test**: test mühitində alət `--apply` ilə işləyir. `/az/maliyye-sektorunun-inkisaf-strategiyasi` və en qarşılığı müraciəti və PDF-i
göstərir. `curl -sI` ilə yoxlananda beş köhnə ünvan 308 ilə düzgün səhifəyə gedir (`quickstart.md` §7). US4 yeni cədvəllərdən asılı deyil: US1–US3-dən
əvvəl və ya sonra edilə bilər.

### Tests for User Story 4 (əvvəl yaz, qırmızı olmalıdır)

- [X] T043 [P] [US4] Admin fikstürü `ADMIN/src/features/rich-text/fixtures/strategy-letter.html` (contracts/strategy-page.md §1, az):
  - mətn `product-host/visitor/views/pages/strategy.php`-nin az budağıdır, entity-lər UTF-8-dir, abzaslar dəyişdirilmir;
  - media id-ləri test üçün sabit rəqəmlərdir (`/media/9001` portret, `/media/9002` PDF).

  `ADMIN/src/features/rich-text/roundtrip.test.ts`-ə `STRATEGY_LETTER` halını əlavə et (`faq-answer`, `fincert-direction` nümunəsi). Redaktor
  atribut sırasını və ya boşluğu dəyişirsə, fikstür redaktorun formasına gətirilir. Amma `width="300"`, `style="text-align: right"`,
  `data-media-link` və `<strong>` qalmalıdır. Qalmırsa dayan və istifadəçiyə de (R17).
- [X] T044 [P] [US4] `SITE/src/proxy.test.ts`. Hallar contracts/strategy-page.md §3-dədir:
  - `/pages/strategy` → `/az/<STRATEGY_SLUG.az>`;
  - `/en/pages/strategy` və `/pages/strategy?language=en` → en;
  - `/page-872`, `/page-872/risk-based-…`, `/az/page-872/x?language=en` → 66 (dil qaydası);
  - `/page-878/strategic-framework-for-a-microfinance-model` → 76;
  - status 308;
  - `/pages/strategy-x` və `/page-8720` yönlənmir.

### Implementation for User Story 4 — `web-cbar-new` (MR 4)

- [X] T045 [US4] Slug sabitləri: `SITE/src/entities/page-node`-də `FINCERT_SLUG`-ın yanına `STRATEGY_SLUG`, `RISK_SUPERVISION_SLUG`, `MICROFINANCE_SLUG`
  (`Record<Locale, string>`, ingiliscə "niyə" şərhi) və index export-u.
- [X] T046 [US4] `SITE/src/proxy.ts`:
  - `LEGACY_STRATEGY_PAGE = /^\/(?:(az|en)\/)?pages\/strategy\/?$/i`, `LEGACY_RISK_SUPERVISION_PAGE = /^\/(?:(az|en)\/)?page-872(?:\/.*)?$/i`,
    `LEGACY_MICROFINANCE_PAGE = /^\/(?:(az|en)\/)?page-878(?:\/.*)?$/i` (doc-comment-li, FAQ/FinCERT kimi);
  - `LEGACY_PAGES`-ə üç sətir.

  T044 yaşıl olur.
- [X] T047 [US4] `SITE/next.config.ts`-ə `redirects()` yaz (`permanent: true`): `/2024_2026_Azerbaijani.pdf` → `/az/<STRATEGY_SLUG.az>`,
  `/2024_2026_English.pdf` → `/en/<STRATEGY_SLUG.en>`.
  - Əvvəl Next 16 sənədini oxu: `node_modules/next/dist/docs/`-da `redirects`.
  - Slug-ları sabitdən import et. `next.config.ts` `@/` alias-ı görməyə bilər, onda nisbi yol və ya dəyəri təkrarlayan, testlə bağlanmış sabit
    işlədilir.
  - Yoxlama: `npm run build && npx next start -p 3009`, sonra `curl -sI` ilə iki ünvan.
- [X] T048 [US4] Review: `ui-kit-review` + `senior-front` checklist US4-də dəyişən `SITE` fayllarına (`proxy.ts`, `next.config.ts`, `entities/page-node`):
  - yönləndirmə bir mexanizmdədir;
  - magic string yoxdur;
  - regex-lər lövbərlidir (`^…$`);
  - yeni `'use client'` yoxdur.

  Sonra `SITE` `npm run verify`.

### Implementation for User Story 4 — idxal aləti (`tools/media-backfill`)

- [X] T049 [P] [US4] Şablonlar `tools/media-backfill/strategy-letter.az.html` və `strategy-letter.en.html`:
  - az T043 fikstürünün eynisidir, yalnız id-lər `{PORTRAIT_ID}` və `{PDF_ID}` yer tutucularıdır;
  - en `strategy.php`-nin en budağıdır, eyni formadadır;
  - `alt` mətnləri contracts §1-dədir.

  Fayllar UTF-8 qoruyan alətlə yazılır.
- [X] T050 [US4] `tools/media-backfill/import-strategy-page.mjs` (contracts/strategy-page.md §2):
  - `import-working-papers.mjs`-in `.env`, PG, MinIO, SHA-256 və açar funksiyalarını təkrarla. Üçüncü istifadə olarsa ortaq modula çıxarılır;
  - `--plan | --dry-run | --apply`, `--source`, `--report`;
  - endirmə uğursuz olarsa heç nə yazılmır;
  - 104 və 105 slug ilə tapılır;
  - mətn yalnız 105-in surətinə bərabər olanda yazılır;
  - PG yazısı bir tranzaksiyadadır.

  `tools/media-backfill/README.md`-yə bölmə: məqsəd, `.env`, test → prod, geri qaytarma.
- [X] T051 [US4] Aləti PGlite + saxta S3 ilə yoxla (spec 054 yolu, yaddaş `pglite-api-testing`). Hallar:
  - (a) `--plan` → üç fayl, iki səhifə tapılıb;
  - (b) `--apply` → 3 media, az/en `written`;
  - (c) ikinci `--apply` → yeni media yoxdur, `same`;
  - (d) əvvəlcədən dəyişdirilmiş az mətni → `edited`, toxunulmayıb, en yazılıb;
  - (e) `--source` səhv host → çıxış kodu 1, bazada dəyişiklik yoxdur.

  Yazılmış az mətni T043 fikstürü ilə (id-lər xaric) eyni olmalıdır.
- [X] T052 [US4] `ADMIN` `npm run verify` (roundtrip daxil). T043 yaşıl olmalıdır.
- [X] T053 [US4] **Test mühitində işlətmə: əvvəl istifadəçidən açıq təsdiq al**, çünki paylaşılan test bazasına və MinIO-ya yazılır.
  - **2026-11-24, istifadəçinin təsdiqi ilə:** `--plan` (ölçülər quickstart ilə eyni), `--dry-run` (104 və 105 tapıldı, az/en `written`, 3 media
    yeni), `--apply` → media **2355** (portret), **2356** (az PDF), **2357** (en PDF), 104 az/en `written`; ikinci `--apply` → `created: false`,
    az/en `same`. Hesabatlar `.tmp-057/strategy-report-test{-plan,-dryrun,,-2}.json`.
  - Test API: `/media/2355|2356|2357` → 200 (`image/png`, `application/pdf`); `GET /pages/<slug>?locale=az|en` → id 104, portret, `<h3>`, sağa
    düzlənmiş imza, dilin PDF linki.
  - Sayt (`local:testcbar`, :3002, Edge CDP, `.tmp-057/measure-strategy-page*.mjs`, `strategy-page-measure.json`): 1728/744/390 az və en —
    `overflowX` 0, portret yüklənir, imza `text-align: right`, PDF yeni vərəqdə, sol menyuda 105, header-də link var (dəyişməyib). Yeddi köhnə ünvan
    (`/pages/strategy`, `?language=en`, `/en/pages/strategy`, `/page-872/x`, `/page-878`, iki PDF) → 308, düzgün `location`.
  - ⚠️ **Tapıntı (FR-021 / kənar hal "390-da tam en"):** portret saytda **sağda deyil, solda**dır (1728: x=580 = sütunun solu; 744/390: x=16) və 390-da
    300 px qalır (sütun 358). Səbəb: Tailwind preflight `img { display: block }`, `app/cms-content.css` `.cms-content img`-ə
    `margin-inline-start` vermir, blok şəkil valideynin `text-align: right`-ına tabe deyil. Bu bütün CMS səhifələrinə aiddir. Spec "kod dəyişmir"
    demişdi — düzəliş üçün bax T061.
  - Footer-də strategiya linki yoxdur, amma bu spec 057 ilə bağlı deyil: footer başlıqla seçilmiş sabit kök bölmələrdir (`shell/nav.ts:99`
    `NAV_SECTION_TITLES`), "Strategiya" orada heç vaxt olmayıb. spec.md US4 #4-dəki "footer" ifadəsi dəqiq deyil.
  - `tools/media-backfill/.env` test dəyərləri ilə: `--plan`, `--dry-run`, sonra `--apply`.
  - Sonra `quickstart.md` §7 test API və `npm run local:testcbar` ilə: səhifə, PDF-lər `GET /media/{id}` 200, 390 enində yana sürüşmə yoxdur, header
    dəyişməyib.
  - Hesabat `.tmp-057/strategy-report-test.json`-a yazılır.
- [X] T054 [US4] Prod əmri hazırlanır, **işlədilmir**: `--source=https://www.cbar.az` + prod `.env` README-də yazılır. Prod-da işlətmə yalnız
  istifadəçinin ayrıca təsdiqi ilə və prod deploy-dan sonra olur.

**Checkpoint**: strategiya kartı köhnə müraciətin yeni qarşılığına aparır, köhnə ünvanlar işləyir.

---

### US4 əlavəsi — T053-də tapılan görünüş boşluğu (`web-cbar-new`, MR 4), 2026-11-24

- [X] T061 [US4] `SITE/src/app/cms-content.css`: redaktorun abzas düzləndirməsi blok şəkilə də aid olsun (FR-021 "sağda portret", kənar hal "390-da
  portret tam enə yayılır"). Tailwind preflight `img`-ə `display: block` verir, `text-align` onu hərəkət etdirmir:
  - `p[style*="text-align: right"] > img` → `margin-inline-start: auto`; `text-align: center` → `margin-inline: auto`;
  - tab-dan (`--breakpoint-tab`, 744) dar ekranda sağa düzlənmiş şəkil sütunun tam enindədir (köhnə saytın mobil qaydası);
  - təsir sahəsi ölçülüb (test dump 2026-09-14): sağa düzlənmiş şəkil 0 (yalnız 104), mərkəzə düzlənmiş 32 — onlar indi solda, düzəlişdən sonra
    mərkəzdə (köhnə sayt kimi), ölçüləri dəyişmir.
  - Yoxlama: jsdom layout hesablamır, ona görə Edge CDP (`.tmp-057/measure-strategy-page2.mjs`) əvvəl/sonra — 1728/744/390 portretin `right`-ı sütunun
    `right`-ına bərabər, 390-da eni sütun eni (358), `overflowX` 0; mərkəzə düzlənmiş bir köhnə şəkil mərkəzdə. Sonra `ui-kit-review` + senior-front
    yoxlaması və `SITE` `npm run verify`.

## Phase 7: Polish & Cross-Cutting

- [X] T055 [P] `dokumentasiyalar/ana-sehife-bloklari-guide.md`:
  - yeni `### 3.7. Strategiya və sənədlər (/homepage-blocks/strategy-docs)`: sahələr, keçid qaydası (ünvan səhifədən üstündür), status, sıra, "ilk üç,
    birincisi böyük kart";
  - üz qabığı ölçüləri (424×240, 200×236), dil fallback-i, `SPEC/assets/` faylları, "Keçid işləmir" nişanı;
  - §4 ("Saytda nə görünür"), §7 (yoxlama siyahısı) və §8 (problemlər) yenilənir;
  - strategiya səhifəsi (104) üçün qeyd: mətn köhnə müraciətdəndir, redaktor onu "Səhifələr"-dən dəyişir, PDF media kitabxanasındadır, portretin eni
    300-dür.
- [X] T056 [P] Kök `CLAUDE.md`, `SITE/CLAUDE.md` və `ADMIN/CLAUDE.md` yenilənir:
  - kök `CLAUDE.md` web-cbar-new bölməsinə qısa bənd: spec 057, `/homepage` `strategyDocs`, admin tabı, 104 = köhnə `/pages/strategy`, köhnə
    ünvanlar;
  - `SITE/CLAUDE.md`: mock silinib, loader qaydası, `LEGACY_PAGES`-in yeni sətirləri, `next.config` PDF yönləndirmələri;
  - `ADMIN/CLAUDE.md`: yeni modul, `LookupGate` ilə səhifə seçimi, `strategy-letter` fikstürü.
- [X] T057 `/sync-openapi` (`api-cbar`, `api-cbar-admin`): `# Sync:` sətirləri yenilənir, sonra `route-diff.mjs` fərqsiz olmalıdır.
- [X] T058 `/sync-business-logic`:
  - `business_logic/new_business_logic.md`: yeni məzmun növü, strategiya səhifəsi;
  - `diff_report_logic.md`: köhnə saytda blok yox idi; `/pages/strategy` köçürüldü; lightbox ləğv edildi.
- [X] T059 Son yoxlama:
  - `diff -r` iki `Cbar.Domain` → boş;
  - `quickstart.md` §1–§8 tam keçid;
  - SC-001…SC-008 nəticəsi `SPEC/checklists/requirements.md` qeydlərinə.
- [X] T060 `git status`-u qruplaşdır: dörd MR (ADMIN-API, WEB-API, ADMIN, SITE), `tools/media-backfill` və workspace sənədləri. `.tmp-057/` təmizlənir,
  commit yalnız istifadəçi istəyəndə.
  - **2026-11-24.** Əsas kod `2dd1929`-dadır. Bu turun commit olunmamış dəyişiklikləri:
    - MR 1 `ADMIN-API`: `openapi/openapi.yaml` (sync markeri);
    - MR 2 `WEB-API`: `openapi/openapi.yaml` (sync markeri);
    - MR 3 `ADMIN`: `CLAUDE.md`;
    - MR 4 `SITE`: `src/app/cms-content.css` (T061), `CLAUDE.md`;
    - workspace: kök `CLAUDE.md`, `business_logic/new_business_logic.md`, `business_logic/diff_report_logic.md`,
      `dokumentasiyalar/ana-sehife-bloklari-guide.md`, `specs/057-…/{tasks.md, contracts/strategy-page.md, checklists/requirements.md}`;
    - `tools/media-backfill`: dəyişiklik yoxdur.
  - `.tmp-057/` istifadəçinin qərarı ilə silinib. Yuxarıdakı `.tmp-057/...` istinadları (hesabatlar, `measure-*.mjs`, `sc007.mjs`) artıq yoxdur; nəticələri
    T053 və `checklists/requirements.md`-də yazılıb.
  - Hələ qalır: T054-ün prod icrası (prod deploy-dan sonra, ayrıca təsdiqlə). Deploy sırası: `api-cbar-admin` → `api-cbar` → admin panel → sayt.

---

## Dependencies & Execution Order

### Phase dependencies

- **Setup (T001–T005)**: T001 dəyişiklikdən əvvəl olmalıdır (baza xətti). T005 bütün controller tapşırıqlarını bloklayır.
- **Foundational (T006–T009)**: T005-dən sonra. US1, US2 və US3 bunu gözləyir.
- **US1 (T010–T025)**: Foundational-dan sonra.
- **US2 (T026–T039)**: Foundational-dan sonra. API hissəsi (T026–T030) US1-dən asılı deyil (test məlumatı SQL ilə). Sayt hissəsi (T031–T038) yalnız MSW ilə
  işləyir. T039-un real məlumatı üçün US1 və ya US3 lazımdır.
- **US3 (T040–T042)**: Foundational-dan sonra. T042 T029-u gözləyir.
- **US4 (T043–T054)**: Setup və Foundational-dan asılı deyil (yeni cədvəl işlətmir). İstənilən vaxt edilə bilər.
  - `SITE` hissəsi (T044–T048) T038-dən sonra gəlsə, `verify` bir dəfə işlədilir.
  - Alət (T049–T051) T043 fikstürünün formasını gözləyir.
  - T053 istifadəçi təsdiqini gözləyir, T054 prod deploy-dan sonradır.
- **Polish (T055–T060)**: bütün hekayələrdən sonra.

### Within each story

- Testlər (T010–T012, T026–T027) implementasiyadan əvvəl yazılır və qırmızı olur.
- API: qaydalar (T014/T028) → controller (T016/T029) → yoxlama (T017/T030).
- Admin: sabitlər → modul → servis və dialoq → ekran və route → i18n → yaşıl test → review → verify.
- Sayt: sxem → loader → mock-un silinməsi → widget → yaşıl test → review → faylların silinməsi → verify → ölçü.

### Deploy sırası (upstream)

MR 1 `api-cbar-admin` (T006, T007, T013–T016, T040) → MR 2 `api-cbar` (T008, T028, T029) → MR 3 `web-cbar-admin-new` → MR 4 `web-cbar-new`
(T045–T047 daxil). Sonra idxal aləti işlədilir: əvvəl test (T053), sonra prod (T054). MR 4 MR 2-dən əvvəl çıxsa da sınmır (`default([])`), sadəcə
blok gizlənir. Ona görə prod-da MR 2-ni MR 4-dən əvvəl çıxar. Alət işlədilməsə də sayt sınmır: 104 bugünkü mətni ilə qalır.

## Parallel Example

```text
# Setup
T002 (assets) ‖ T003 (admin OpenAPI) ‖ T004 (public OpenAPI)

# US1 tests
T010 (xUnit rules) ‖ T011 (admin MSW)            → T012 (admin behaviour test)

# US1 + US2 after Foundational, by different people
US1: T013 → T014 → T015 → T016 → T017            (ADMIN-API)
US2: T026 → T028 → T029 → T030                   (WEB-API)
US2: T027 → T031 → T032 → T033 → T034 → T035     (SITE, MSW only)
US1: T018 ‖ T022, then T019 → T020 → T021 → T023 (ADMIN, MSW only)

# US4, independent of the new tables
T043 (admin fixture) ‖ T044 (proxy tests) ‖ T045 (slugs)
T043 → T049 (templates) → T050 (tool) → T051 (PGlite + fake S3)
T044 + T045 → T046 → T047 → T048 (SITE review + verify)
```

## Implementation Strategy

### MVP

US1 + US2 birlikdə MVP-dir. Admin ilə idarə saytda görünməsə dəyəri yoxdur, sayt isə redaktorun məlumatı olmadan bugünkü mock-dan fərqlənmir.

1. Setup + Foundational.
2. US1 API (MR 1) və US2 API (MR 2): endpoint-lər PGlite-də yoxlanılır.
3. US1 admin (MR 3) və US2 sayt (MR 4).
4. Dayan və yoxla: admin-də sıranı dəyiş → ana səhifə 10 saniyə ərzində göstərir.

### Incremental

- US3 (seed) MR 1-ə daxildir. Deploy-dan əvvəl hazır olmalıdır, yoxsa prod-da blok redaktor sənəd yaradana qədər gizli qalır.
- US4 ayrıca dəyər verir: köhnə ünvanlar və strategiya müraciəti. MVP-dən əvvəl də, sonra da edilə bilər. Yönləndirmələr MR 4-ə, alət isə workspace-ə
  düşür.
- Polish sənədləri eyni dəyişiklikdə gedir (yaddaş `menu-changes-update-docs`).

### Notes

- Hər frontend fazası review (ui-kit-review + senior-front) və `npm run verify` ilə bitir (layihə qaydası).
- Toxunulan faylda azərbaycanca şərhlər ingiliscəyə çevrilir. Kütləvi çevirmə edilmir.
