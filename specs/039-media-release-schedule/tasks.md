# Tasks: Məlumatların yayımlanması qrafiki — admin paneldən idarə olunan məzmun növü

**Input**: `specs/039-media-release-schedule/`: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

**Tests**: Frontend testləri davranış testləridir (rol, `userEvent`, MSW) və `npm run verify`-ın hissəsidir. API-lərdə test layihəsi yoxdur: yoxlama `quickstart.md` ilə PGlite üzərində real icradır.

**Təşkili**: User story-lər üzrə, hər story daxilində deploy sırası: `api-cbar-admin` → `api-cbar` → `web-cbar-admin-new` → `web-cbar-new`. Hər komponent ayrıca merge request-dir. Commit yalnız istəklə. Yeni şərhlər ingiliscə; AZ hərfli fayllar yalnız UTF-8 qoruyan alətlərlə (Edit/Write, Node) yazılır, `sed -i` işlədilmir (CRLF).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: paralel işlənə bilər (fərqli fayllar, açıq asılılıq yoxdur)
- **[Story]**: aid olduğu user story (spec.md: US1–US5)

## Yol qısaltmaları

- `ADMIN-API` = `product-rest/api-cbar-admin`
- `WEB-API` = `product-rest/api-cbar`
- `ADMIN` = `product-rest/web-cbar-admin-new`
- `SITE` = `product-rest/web-cbar-new`

---

## Phase 1: Setup

- [x] T001 İşçi vəziyyəti yoxla: `git status` (spec 039 sənədlərindən başqa dəyişiklik yoxdur), `ADMIN-API/db/migrations/`-da `0022`, `0023` adları boşdur, `diff -rq ADMIN-API/src/Cbar.Domain WEB-API/src/Cbar.Domain` (bin/obj xaric) boşdur
- [x] T002 [P] Alətləri yoxla: `"C:/Program Files/dotnet/dotnet.exe" --version` (.NET 10), `ADMIN-API/openapi` və `WEB-API/openapi`-də `node_modules` var (yoxdursa `npm ci`, korporativ CA `NODE_EXTRA_CA_CERTS`), PGlite yoxlama skripti işləyir (memory `pglite-api-testing`)

---

## Phase 2: Foundational

**Bütün story-lərin əsası: sxem, domain, təsdiqlənmiş API kontraktı, lüğət API-ləri.**

- [x] T003 `ADMIN-API/db/migrations/0022-release-schedule.sql` yaz: `data-model.md`-dəki altı cədvəl (`release_schedule_groups`, `release_schedule_group_translations`, `release_schedule_periodicities`, `release_schedule_periodicity_translations`, `release_schedule_items`, `release_schedule_item_translations`), `timing_mode` və `timing_url` CHECK-ləri, indekslər, şərti FK DO-bloku (`users`, `locales`), `set_updated_at` trigger dövrü, `GRANT SELECT … TO cbar_web_ro` (rol varsa), `release_schedule.read/create/update/delete` icazələri + `moderator` grant (imtiyaz yoxdursa `RAISE WARNING`). Quruluş `ADMIN-API/db/migrations/0020-csr-projects.sql`-dir; `BEGIN/COMMIT` yox, hər şey `IF NOT EXISTS`
- [x] T004 `ADMIN-API/src/Cbar.Domain/Entities/ReleaseSchedule.cs`: `ReleaseScheduleGroup`, `ReleaseScheduleGroupTranslation`, `ReleaseSchedulePeriodicity`, `ReleaseSchedulePeriodicityTranslation`, `ReleaseScheduleItem`, `ReleaseScheduleItemTranslation`, `enum ReleaseTimingMode { Text = 1, Link = 2, Decisions = 3 }`; `ADMIN-API/src/Cbar.Domain/CbarDbContext.cs`: `DbSet`-lər, `ToTable`, `HasQueryFilter(DeletedAt == null)` (yalnız item), `Restrict` FK-lər, `(XId, Locale)` unikal indekslər, `TimingMode` `HasConversion<short>()` (CSR bloku `CbarDbContext.cs:242-270` nümunəsi)
- [x] T005 T004-ün iki faylını `WEB-API/src/Cbar.Domain/`-a bayt-bayt köçür; `diff -rq` boşdur, `dotnet build` hər iki API-də keçir
- [x] T006 [P] `ADMIN-API/openapi/paths/release-schedule.yaml` (açarlar `items`, `item`, `groups`, `group`, `periodicities`, `periodicity`), `ADMIN-API/openapi/components/schemas/release-schedule.yaml`, `ADMIN-API/openapi/openapi.yaml` (tag `ReleaseSchedule`, 6 path `$ref`): `contracts/admin-api.md`-dəki 15 əməliyyat, `x-permission`, `operationId` (`listReleaseScheduleItems` …), `.claude/skills/api-endpoint` addımları; `npm run lint` (0/0) + `npm run bundle`
- [x] T007 [P] `WEB-API/openapi/paths/release-schedule.yaml` (açar `list`), `WEB-API/openapi/components/schemas/release-schedule.yaml` (`ReleaseSchedule`, `ReleaseScheduleGroup`, `ReleaseScheduleItem`, `ReleaseScheduleDecisions`, `ReleaseScheduleDecisionDate`), `WEB-API/openapi/openapi.yaml` (tag + path): `contracts/public-api.md`, 429 daxil; lint + bundle
- [x] T008 **GATE**: T006–T007 OpenAPI spec-lərini istifadəçiyə təqdim et və təsdiq al. Təsdiqə qədər controller yazılmır (`.claude/hooks/spec-first.mjs` route-u bundle-da axtarır)
- [x] T009 `ADMIN-API/src/Cbar.AdminApi/Authorization/Permissions.cs`: `static class ReleaseSchedule { Read, Create, Update, Delete }` (`"release_schedule.read"` …) və `All` siyahısına dörd kod
- [x] T010 [P] `ADMIN-API/src/Cbar.AdminApi/Controllers/ReleaseScheduleGroupsController.cs`: `[Route("api/v1/release-schedule/groups")]`, list (`{ items }`, `sortOrder` → `id`, az-first ad), get, create (tranzaksiya + audit `release_schedule.group.create`), update, sərt delete; istifadədə olan qrup üçün `IgnoreQueryFilters` ilə yoxlayıb `ConflictProblem("The group is used by an item.")`; `Invalid` — ad məcburi (`CsrCategoriesController.cs` nümunəsi)
- [x] T011 [P] `ADMIN-API/src/Cbar.AdminApi/Controllers/ReleaseSchedulePeriodicitiesController.cs`: T010 ilə eyni, `isActive` yoxdur, 409 "The periodicity is used by an item.", audit `release_schedule.periodicity.*`

**Checkpoint**: Sxem, domain, təsdiqlənmiş kontrakt və lüğət API-ləri hazırdır; `dotnet build` hər iki API-də keçir, `0022` PGlite-da boş və dump bazasına tətbiq olunur (`quickstart.md` §1.1).

---

## Phase 3: User Story 1 - Redaktor qrafikin sətirlərini formadan idarə edir (P1) 🎯 MVP

**Goal**: Redaktor admin paneldə sətir yaradır, qrup və dövrilik seçir, müddət rejimini təyin edir, sıralayır, dərc edir və silir.

**Independent Test**: İki dildə sətir yarat (link rejimində), siyahıda qrup filtri ilə tap, redaktə et, sil; audit jurnalında üç qeyd; link rejimində URL-siz saxlama rədd edilir.

### api-cbar-admin

- [x] T012 [US1] `ADMIN-API/src/Cbar.AdminApi/Controllers/ReleaseScheduleItemsController.cs`: DTO record-ları (`ReleaseScheduleItemTranslationDto(string Title, string? Timing)`, `ReleaseScheduleItemUpsertDto(int GroupId, int? PeriodicityId, ReleaseTimingMode TimingMode, string? TimingUrl, int SortOrder, ContentStatus Status, bool ShowAz, bool ShowEn, Dictionary<string, …> Translations)`); list (`PagingQuery.Resolve(20)`, `search` ILike hər dilin `Title`-ında, `status`, `groupId`, `periodicityId`, sıra qrup `SortOrder` → `SortOrder` → `Id`, proyeksiya `contracts/admin-api.md` §ReleaseScheduleItemPage); get; create (tranzaksiya, audit `release_schedule.item.create`, `CreatedAtAction`); update (before/after audit); soft delete (`DeletedAt`, audit). `CsrProjectsController.cs` nümunəsi, `CbarControllerBase` helper-ləri
- [x] T013 [US1] Eyni controller-də `InvalidAsync` və `Apply`: `data-model.md` §Validasiya (dil, başlıq, qrup/dövrilik mövcudluğu, link rejimində URL məcburi və `^https?://` və ya `/` amma `//` yox, `Scheduled` rədd), `Apply` link rejimindən kənar `TimingUrl = null`, boş `Timing` → null, tərcümə upsert + çıxarılan dillərin silinməsi
- [x] T014 [US1] `quickstart.md` §2-ni PGlite üzərində icra et (201/400/409, audit, moderator icazələri); `node .claude/skills/sync-openapi/scripts/route-diff.mjs api-cbar-admin` → 0 fərq; `ADMIN-API/openapi/openapi.yaml` `# Sync:` sətrini yenilə

### web-cbar-admin-new

- [x] T015 [P] [US1] `ADMIN/src/shared/testing/fixtures/release-schedule.ts` və `ADMIN/src/shared/testing/handlers/release-schedule.ts`: üç `createCrudStore` (`items` paged, `searchFields: ['translations.az.title', 'translations.en.title']`, `filterFields: ['status', 'groupId', 'periodicityId']`, düz `listItem`; `groups` və `periodicities` items envelope, `listItem` az-first `name`), istifadədə olan qrup/dövrilik silinəndə 409; `ADMIN/src/shared/testing/handlers/index.ts`-də qeydiyyat
- [x] T016 [US1] `ADMIN/src/features/release-schedule/api/release-schedule.keys.ts` (üç modul id, `crudKeys`), `ADMIN/src/features/release-schedule/model/constants.ts` (`TIMING_MODE` = `text|link|decisions`, `TIMING_URL_MAX_LENGTH = 1000`, sütun enləri), `ADMIN/src/features/release-schedule/model/schemas.ts` (Zod row/detail sxemləri üç modul üçün, `TIMING_MODE_OPTIONS`, `RELEASE_SCHEDULE_STATUS_OPTIONS`)
- [x] T017 [US1] `ADMIN/src/features/release-schedule/model/module.ts`: `releaseScheduleSectionTabs` (`/release-schedule`, `/release-schedule/groups`, `/release-schedule/periodicities`); `buildReleaseScheduleItemsModule(groups, periodicities)` — `defineModule` (`listEnvelope: 'paged'`, filtrlər: `search` text + qrup/dövrilik/status select, sütunlar başlıq/qrup/dövrilik/rejim badge/status badge/sıra), sahələr: `groupId` select məcburi `valueAsNumber`, `periodicityId` select `nullable`, `timingMode` select, `timingUrl` text `helpKey` "yalnız Link rejimində", `sortOrder`, `status`, `showAz`, `showEn`, `perLocale` `title` və `timing`; `schema` `superRefine`: başlanmış dildə başlıq məcburi, link rejimində `timingUrl` məcburi və `isAllowedLink` (`ADMIN/src/features/image-popups/model/link-rule.ts`) — digər rejimdə yoxlanmır; `buildPayload` link rejimindən kənar `timingUrl: null`; `releaseScheduleItemsModuleBase = build…([], [])` (`ADMIN/src/features/csr-projects/model/module.ts` və `ADMIN/src/features/events/model/module.ts` nümunəsi)
- [x] T018 [US1] `ADMIN/src/pages/release-schedule/index.tsx`: `ReleaseScheduleItemsPage` / `ReleaseScheduleItemsFormPage` — iki `useLookupOptions` (qrup və dövrilik, `name`), `LookupGate` + retry (`ADMIN/src/pages/csr-projects/index.tsx`, iki lookup üçün `ADMIN/src/pages/events/index.tsx`); `ADMIN/src/app/routes/index.ts`: `createCrudRoutes(authLayoutRoute, registerModule(releaseScheduleItemsModuleBase), { list, form })` `lazyRouteComponent` ilə (chunk-reload sarğısı mövcud qaydaya uyğun); `ADMIN/src/app/routes/nav.ts`: `NavKey` `'releaseSchedule'`, `{ path: '/release-schedule', key: 'releaseSchedule', icon: ClockIcon, group: 'content' }` (`RowsIcon` Info xətlərindədir, ona görə `ClockIcon`)
- [x] T019 [P] [US1] `ADMIN/src/locales/{az,en}/releaseSchedule.json` (title, entity, description, tabs.{items,groups,periodicities}, columns, fields, help.timingUrl, timingModes.{text,link,decisions}, filters, validation.{titleRequired,linkRequired,linkInvalid}, groups.*, periodicities.*), `ADMIN/src/locales/{az,en}/nav.json` (`releaseSchedule.label/description`), `ADMIN/src/shared/i18n/index.ts` namespace qeydiyyatı; az/en açarları eyni (`check:i18n`)
- [x] T020 [US1] `ADMIN/src/features/release-schedule/release-schedule.test.tsx` (`ADMIN/src/features/csr-projects/csr-projects.test.tsx` quruluşu): siyahıda sətir məlumatı; yalnız az dilində yaratma və POST body (`timingUrl: null` mətn rejimində); link rejimində URL boş → forma xətası, `javascript:` → xəta, `https://…` → saxlanır; başlanmış en dilində boş başlıq → xəta; qrup filtri siyahını süzür; silmə
- [x] T021 [US1] `npm run verify` Node 24 və Node 22-də (`ADMIN`); `check:kit` və `check:i18n` keçir

**Checkpoint**: Sətirlər admin paneldən tam idarə olunur (qrup və dövrilik seed-dən və ya API-dən).

---

## Phase 4: User Story 2 - Ziyarətçi qrafiki görür və axtarır (P1)

**Goal**: `/{locale}/media/release-schedule` Media şablonunda başlıq, giriş, axtarış və qruplu cədvəli göstərir.

**Independent Test**: Fikstür və ya real API ilə səhifəni az/en, 1728/744/390 enlərində aç; `?q=INFLYASIYA`, "Filtrləri təmizlə", boş nəticə, API xətası; ölçüləri `contracts/ui-contract.md` ilə tutuşdur.

### api-cbar

- [x] T022 [US2] `WEB-API/src/Cbar.WebApi/Time/BakuClock.cs`: `public static class BakuClock { Offset = 4h; DateOnly Today() }`; `WEB-API/src/Cbar.WebApi/Controllers/EventsController.cs` öz `BakuToday()`-ini `BakuClock.Today()` ilə əvəz edir (davranış eyni)
- [x] T023 [US2] `WEB-API/src/Cbar.WebApi/Controllers/ReleaseScheduleController.cs`: `[HttpGet("api/v1/release-schedule")]`, `locale = "az"`; qruplar və sətirlər `data-model.md` §Public oxu qaydası ilə (`AsNoTracking`, `AsSplitQuery`), boş qruplar atılır, `timingMode` lower-case string, boş `timing` → null; `decisions`: `BakuClock.Today()` ili, `Events` (`Type == 1`, `Published`, `DeletedAt == null`) unikal `StartsOn` artan, `withPressConference` = eyni gündə `Type == 2` tədbiri, `next` = `StartsOn >= today` ilk `Type == 1`; cavab `contracts/public-api.md` forması (`CsrProjectsController.cs` nümunəsi)
- [x] T024 [US2] `quickstart.md` §3-ü PGlite + `cbar_web_ro` ilə icra et; `route-diff.mjs api-cbar` → 0 fərq; `WEB-API/openapi/openapi.yaml` `# Sync:` sətri

### web-cbar-new

- [x] T025 [P] [US2] `SITE/src/features/release-schedule/model/schemas.ts` (Zod `releaseScheduleSchema`, `public-api.md` ilə eyni), `SITE/src/features/release-schedule/model/constants.ts` (`RELEASE_SCHEDULE_SLUGS = { az: 'melumatlarin-yayimlanmasi-qrafiki', en: 'information-disclosure-schedule' }`, keş açarı), `SITE/src/features/release-schedule/api/release-schedule.api.ts` (`import 'server-only'`, `getReleaseSchedule(locale)` → `cachedJson`, `SITE/src/features/csr-projects/api/csr-projects.api.ts` nümunəsi)
- [x] T026 [P] [US2] `SITE/src/features/release-schedule/model/search.ts`: `foldForSearch(text)` (`normalize('NFC')` → `toLocaleLowerCase('az')` → `ı`→`i`) və `filterSchedule(groups, q)` (sətir başlığında `includes`, boş qruplar atılır); `search.test.ts`: "İllik" ↔ "illik", "INFLYASIYA" ↔ "inflyasiya", boşluqlu `q`, boş `q` hamısını qaytarır
- [x] T027 [P] [US2] `SITE/src/features/release-schedule/model/intro.ts`: `introHtml(content, hasRows)` — `parseBlocks` (`SITE/src/shared/lib/html-blocks.ts`) ilə ilk `<table>` blokundan əvvəlki hissə, `hasRows = false` və ya cədvəl yoxdursa məzmun olduğu kimi; `intro.test.ts` səhifə 130-un real başlanğıcı ilə (`<p><strong>…</strong></p>\n<table>…`)
- [x] T028 [US2] `SITE/src/widgets/list-filter/list-filter.tsx` və `model.ts`: `dates?: boolean` (default `true`) və `labels.placeholder?`; `dates={false}`-də tarix qrupu render olunmur, düzülüş `contracts/ui-contract.md` §Axtarış (desktop bir sətir: sahə 672, düymələr sağda; tablet/mobil sahə tam en, düymələr altda); qalereya və Tədbirlər dəyişmir — mövcud testlər yaşıl qalır
- [x] T029 [US2] `SITE/src/widgets/release-schedule-table/release-schedule-table.tsx` (+ `model.ts` sinif sabitləri, `index.ts`): server komponent; tablet+ `<table>` (`caption.sr-only`, `thead` `--site-table-title`, sütun enləri 440/260/282 və 300/160/202, qrup sətri `th scope="colgroup" colSpan=3` `--site-table-stripe`), mobil `<744` `section`/`h2`/`ul`/`dl` kartlar; müddət xanası: `text` → mətn, `link` → `<a>` + " ↗" (xarici → `target="_blank" rel="noopener noreferrer"`, `/yol` → `/{locale}/yol`), `decisions` → `renderDecisions` slot-u (US3 doldurur, o vaxta qədər Tədbirlərə link); boş dövrilik "—"; boş mətn chrome etiketi; rənglər yalnız token (`SITE/src/app/globals.css:101-107`)
- [x] T030 [US2] `SITE/src/views/media-release-schedule/loader.ts` (`server-only`): `queryParam.parse(searchParams.q)`, `Promise.allSettled([getReleaseSchedule, getPagesTree, getPage(locale, RELEASE_SCHEDULE_SLUGS[locale])])`, başlıq menyu node-u → CMS adı → `t('releaseSchedule.title')` (`SITE/src/views/media-events/loader.ts:68-70` `menuTitle`), `hasRows` = API uğurlu ∧ ən azı bir sətir; `introHtml(content, hasRows)` → `prepareCmsHtml`; `hasRows` olduqda `filterSchedule`, olmadıqda `schedule = null` (xəta bayrağı yoxdur — research R9, analiz I1-A); `buildSectionShell({ section: 'media', current: { href: RELEASE_SCHEDULE_PATH }, pageUrl, pageTitle })`; `releaseScheduleMetadata(locale)` (başlıq + `alternates.languages`); `SITE/src/views/media-release-schedule/constants.ts`
- [x] T031 [US2] `SITE/src/views/media-release-schedule/index.tsx` (`SectionShell` → `CmsContent` giriş; `schedule != null` olduqda `ListFilter dates={false}` → cədvəl və ya `q` uyğun gəlmədikdə boş nəticə mesajı; `schedule == null` olduqda yalnız CMS mətni — axtarış, cədvəl, xəta mesajı yoxdur), `skeleton.tsx`; `SITE/src/app/[locale]/(content)/media/release-schedule/page.tsx` (nazik: `dynamic = 'force-dynamic'`, `generateMetadata`, loader + view) və `loading.tsx` (`SITE/src/app/[locale]/(content)/media/events/` nümunəsi)
- [x] T032 [US2] `SITE/src/entities/page-node/lib/tree.ts`: `RELEASE_SCHEDULE_PATH`, `RELEASE_SCHEDULE_NODE_SLUGS`, `isReleaseScheduleNode()`, `nodeHref` və `isCurrentNode`-da Tədbirlər kimi xüsusi hal; `SITE/src/entities/page-node/index.ts` export; `SITE/src/shell/nav.ts` `FEATURE_ROUTES`-a iki slug → `media/release-schedule`
- [x] T033 [P] [US2] `SITE/src/locales/{az,en}/media.json`: `releaseSchedule.{title, search, placeholder, submit, clear, empty, columns.{content,periodicity,timing}, linkFallback, decisionsFallback}` (az/en eyni açarlar; "Axtar"/"Filtrləri təmizlə" mövcud etiketlərlə eyni mətn)
- [x] T034 [P] [US2] `SITE/src/shared/testing/fixtures/release-schedule.ts` (2 qrup, 4–6 sətir: hər üç rejim, dövriliksiz sətir, `decisions` 8 tarix + `next`), `SITE/src/shared/testing/handlers/release-schedule.ts` (`GET ${API}/api/v1/release-schedule`, `locale`-a görə fikstür), `handlers/index.ts` qeydiyyatı
- [x] T035 [US2] `SITE/src/views/media-release-schedule/index.test.tsx` (`SITE/src/views/media-events/index.test.tsx` quruluşu): qrup başlıqları və sətirlər sırası; giriş mətnində köhnə cədvəl yoxdur; `q` ilə süzmə və boş nəticə; "Filtrləri təmizlə" `href`; link xanası `target`/`rel`; API 500 və boş qrafik → CMS mətni köhnə cədvəli ilə görünür, axtarış forması və xəta mesajı yoxdur, başlıq qalır; en lokal; `SITE/src/app/metadata.test.ts` route siyahısına `/media/release-schedule`; `SITE/src/shell/nav*.test.ts` və ya `entities/page-node` testində səhifə 130 node-u yeni ünvana aparır və aktivdir
- [x] T036 [US2] `npm run verify` Node 24 və Node 22-də (`SITE`); `no-magic-numbers` keçir

**Checkpoint**: İctimai səhifə işləyir; modal düyməsi müvəqqəti olaraq Tədbirlər linkidir.

---

## Phase 5: User Story 3 - Ziyarətçi pul siyasəti qərarlarının qrafikini modalda görür (P1)

**Goal**: "Qrafikə uyğun ↗" cari ilin qərar tarixlərini modalda göstərir, JS-siz Tədbirlərə aparır.

**Independent Test**: Fikstürdə 8 tarix (biri mətbuat konfranslı, biri `next`) ilə modalı aç; vəziyyətlər, etiketlər, Escape/fokus, "Bütün qərarlar →" `href`; JS-siz link.

- [x] T037 [P] [US3] `SITE/src/features/release-schedule/model/year-suffix.ts`: `azYearSuffix(year)` (research R14 qaydası) + `year-suffix.test.ts` (2026 → `cı`, 2027 → `ci`, 2023 → `cü`, 2029 → `cu`, 2030 → `cu`, 2040 → `cı`, 2000 → `ci`, 2100 → `cü`)
- [x] T038 [P] [US3] `SITE/src/features/release-schedule/model/decisions.ts`: `decisionTiles(decisions, today?)` → `{ date, day, month, state: 'past' | 'next' | 'future', withPressConference }[]` (`next.date` ilə müqayisə; `next` null-dırsa hamısı keçmiş) + test
- [x] T039 [US3] `SITE/src/widgets/decisions-dialog/decisions-dialog.tsx` (`'use client'`) + `model.ts` (sinif sabitləri) + `index.ts`: idarə olunan kit `Dialog` (`@cbar/lib-react-ui-kit/dialog`), trigger `<a href="/{locale}/media/events?type=1">` (hidratasiyadan sonra `preventDefault` + açılış), `DialogTitle`, alt sətir, "Növbəti açıqlama" kartı (`formatLongDate`), plitələr (`events.monthShort`), boş il mesajı, "Bütün qərarlar →"; ölçülər `contracts/ui-contract.md` §Modal (desktop/tablet 560 mərkəzdə, mobil aşağı vərəq); etiketlər prop ilə (server `getT`-dən)
- [x] T040 [US3] `SITE/src/widgets/release-schedule-table/release-schedule-table.tsx`: `decisions` rejimli xanada `DecisionsDialog` (`decisions` cavabın məcburi hissəsidir; boş il modalda boş mesajla göstərilir); `SITE/src/views/media-release-schedule/{loader.ts,index.tsx}` `decisions`-ı və modal etiketlərini ötürür
- [x] T041 [P] [US3] `SITE/src/locales/{az,en}/media.json`: `releaseSchedule.decisions.{title, subtitle, next, pressRelease, pressReleaseAndConference, empty, all, close}` (az `subtitle` = `"{{year}}-{{suffix}} il · Mərkəzi Bankın İdarə Heyəti"`, en `"{{year}} · Board of the Central Bank"`)
- [x] T042 [US3] `SITE/src/widgets/decisions-dialog/decisions-dialog.test.tsx`: trigger linkinin `href`-i; klikdə dialoq (`role="dialog"`, ad = başlıq); 8 plitə, mətbuat konfranslı plitənin etiketi; `next` kartı; Escape → bağlanır, fokus triggerə qayıdır; boş il mesajı; `next = null` → kart yoxdur; "Bütün qərarlar →" `href`
- [x] T043 [US3] `SITE/CLAUDE.md` §2 `'use client'` siyahısına `decisions-dialog` (spec 039); `npm run verify` Node 24 və Node 22-də (`SITE`)

**Checkpoint**: Modal Figma-dakı kimi işləyir, tarixlər Tədbirlərdən gəlir.

---

## Phase 6: User Story 4 - Redaktor qrupları və dövrilik siyahısını idarə edir (P2)

**Goal**: Admin paneldə "Qruplar" və "Dövriliklər" tabları; ad dəyişikliyi bütün sətirlərdə görünür, istifadədə olanın silinməsi mesajla rədd edilir.

**Independent Test**: Dövriliyin adını dəyiş → saytda bağlı sətirlərdə yeni ad; qrupların sırasını dəyiş → saytda yeni sıra; istifadədə olan qrupu sil → aydın mesaj; qrupu deaktiv et → saytda görünmür.

- [x] T044 [US4] `ADMIN/src/features/release-schedule/model/module.ts`: `releaseScheduleGroupsModule` (`listEnvelope: 'items'`, `sortOrder` number, `isActive` checkbox, `perLocale` `name` məcburi, `sectionTabs`) və `releaseSchedulePeriodicitiesModule` (`isActive` yoxdur) (`csrCategoriesModule` nümunəsi)
- [x] T045 [US4] `ADMIN/src/app/routes/index.ts`: iki `createCrudRoutes(authLayoutRoute, registerModule(…))`; `/release-schedule/groups` və `/release-schedule/periodicities` `/release-schedule/$id`-dən əvvəl uyğunlaşır (Tədbirlərin `/events/categories` kimi) — testlə təsdiqlə
- [x] T046 [US4] `ADMIN/src/features/release-schedule/release-schedule.test.tsx`-ə: tablar arası keçid; qrup yaratma və ad məcburi; istifadədə olan qrup/dövrilik silinəndə 409 mesajı göstərilir; yeni qrup sətir formasının seçimində görünür
- [x] T047 [US4] `npm run verify` Node 22-də (`ADMIN`); `quickstart.md` §3.3 (deaktiv qrup saytda itir) real API ilə

**Checkpoint**: Lüğətlər paneldən idarə olunur.

---

## Phase 7: User Story 5 - Mövcud qrafik köçür və köhnə ünvanlar işləyir (P2)

**Goal**: Yayım günü 22 sətir hazırdır, köhnə ünvanlar 308 ilə yeni səhifəyə aparır.

**Independent Test**: Dump bazasına `0023` tətbiq et → 2/7/22; ikinci dəfə → atlanır; `/page-72/x`, `/en/page-72/x?language=en`, `/az/melumatlarin-yayimlanmasi-qrafiki`, `/en/information-disclosure-schedule` → 308.

- [x] T048 [US5] `ADMIN-API/db/migrations/0023-release-schedule-seed.sql`: `DO $seed$` bloku; üç cədvəldən biri boş deyilsə `RAISE NOTICE 'spec 039: … seed skipped'` + `RETURN`; `data-model.md` §Seed-dəki 2 qrup, 7 dövrilik, 22 sətir az+en (`$rs$…$rs$` dollar quoting), `RETURNING id INTO` ilə əlaqələr, sətir 2 `timing_mode = 3`, `sort_order` 10-luq addım, `published` (`ADMIN-API/db/migrations/0021-csr-projects-seed.sql` nümunəsi; `pages`-ə yazmır)
- [x] T049 [US5] `quickstart.md` §1.2–1.4-ü icra et (dump bazası, təkrar icra, CHECK pozuntusu); `GET /api/v1/release-schedule?locale=en` 22 en sətir
- [x] T050 [US5] `SITE/src/proxy.ts` `legacyRedirect()`: `LEGACY_RELEASE_SCHEDULE_PAGE = /^\/(?:(az|en)\/)?page-72(?:\/.*)?$/i` → `/{legacyLocale}/media/release-schedule`; `LEGACY_RELEASE_SCHEDULE_SLUG = /^\/(az|en)\/(melumatlarin-yayimlanmasi-qrafiki|information-disclosure-schedule)\/?$/i` → həmin dil; 308; slug-lar `SITE/src/features/release-schedule/model/constants.ts`-dən (proxy-nin mövcud import qaydasına uyğun)
- [x] T051 [US5] `SITE/src/proxy.test.ts`: dörd köhnə ünvan → 308 hədəfləri; `/az/media/release-schedule` yönləndirilmir; mövcud qalereya/AZIR yönləndirmələri dəyişmir
- [x] T052 [US5] `npm run verify` Node 22-də (`SITE`)

**Checkpoint**: Köçürmə idempotentdir, köhnə linklər işləyir.

---

## Phase 8: Polish & Cross-Cutting

- [x] T053 [P] `SITE/docs/media-cms-guide.md`: "Məlumatların yayımlanması qrafiki" sətri — səhifə 130-u Media altına keçirmək, giriş mətnini yeniləmək (cədvəldən əvvəlki hissə), cədvəlin admin "Yayım qrafiki"-ndən gəlməsi, modal tarixlərinin Tədbirlər "Qərar" + "Mətbuat konfransı"-ndan gəlməsi, ⚑ seed sətirlərinin yoxlanması
- [x] T054 [P] Root `CLAUDE.md` (web-cbar-new bölməsinə spec 039 qeydi, 034/038 qeydləri üslubunda), `SITE/CLAUDE.md` §3 "Media" bölməsi, `ADMIN/CLAUDE.md` bölmə siyahısı (varsa)
- [x] T055 Figma ↔ DOM ölçüsü (`quickstart.md` §5.3): Edge CDP, 1728/744/390, səhifə və modal; fərqləri `contracts/ui-contract.md` §Figma-dan qəbul edilmiş fərqlər-ə yaz və ya düzəlt (memory `figma-measure-dom`, `hybrid-fixture-proxy-for-ui-measuring`)
- [x] T056 Yekun yoxlama: `diff -rq` iki `Cbar.Domain` boş; `dotnet build` hər iki API; `route-diff.mjs` hər iki API 0 fərq; `npm run verify` hər iki frontend Node 22-də; `quickstart.md` bütün bölmələr; spec FR-001..FR-026 üzrə qısa uyğunluq qeydi
- [ ] T057 [P] İstəyə görə: `/sync-openapi` (hər iki API) və `/sync-business-logic` (`new_business_logic.md`, `diff_report_logic.md` — səhifə 72 → yeni məzmun növü)

---

## Dependencies & Execution Order

### Phase asılılıqları

- **Setup (1)** → **Foundational (2)** → story-lər. T008 GATE-dən əvvəl heç bir controller yazılmır.
- **US1 (3)**: T009–T011-dən sonra. Admin API (T012–T014) → admin panel (T015–T021).
- **US2 (4)**: Foundational-dan sonra, US1-dən asılı deyil (məlumat seed və ya PGlite insert-dən). `api-cbar` (T022–T024) → sayt (T025–T036).
- **US3 (5)**: US2-dən sonra (T029 cədvəl slot-u, T023 `decisions`).
- **US4 (6)**: US1-dən sonra (eyni `module.ts`, `routes/index.ts`, test faylı).
- **US5 (7)**: seed (T048) Foundational-dan sonra istənilən vaxt; proxy (T050–T051) US2-dən sonra (route mövcud olmalıdır).
- **Polish (8)**: bütün story-lərdən sonra.

### Story daxilində

- Miqrasiya → domain → OpenAPI → GATE → controller → real icra.
- Sayt: sxem/api → model helper-ləri → widget → loader → view/route → test → verify.

### Paralel imkanlar

- T006 ∥ T007; T010 ∥ T011.
- US1: T015 ∥ T016 ∥ T019 (fərqli fayllar), sonra T017 → T018 → T020.
- US2: T025 ∥ T026 ∥ T027 ∥ T033 ∥ T034; API (T022–T023) admin panel işi (US1 frontend) ilə paralel.
- US3: T037 ∥ T038 ∥ T041, sonra T039 → T040 → T042.
- US5: T048 US2/US3 ilə paralel.
- Polish: T053 ∥ T054 ∥ T057.

## Parallel Example: User Story 2

```text
# api-cbar və saytın model qatı eyni vaxtda:
T022–T023  WEB-API BakuClock + ReleaseScheduleController
T025       SITE features/release-schedule api + schema
T026       SITE model/search.ts + test
T027       SITE model/intro.ts + test
T033       SITE locales media.json
T034       SITE MSW fixture + handler
# sonra ardıcıl: T028 → T029 → T030 → T031 → T032 → T035 → T036
```

## Implementation Strategy

### MVP (US1 + US2)

1. Phase 1–2 (GATE daxil).
2. US1: sətirlər paneldən idarə olunur → `quickstart.md` §2, §4.
3. US2: səhifə ictimaidir, modal hələ Tədbirlər linkidir → `quickstart.md` §3, §5.
4. Bu nöqtədə dörd komponent deploy oluna bilər (seed olmadan cədvəl redaktorun daxil etdiyi qədərdir).

### İnkremental

5. US3 modal → yalnız `web-cbar-new` yenidən deploy.
6. US4 lüğət tabları → yalnız `web-cbar-admin-new`.
7. US5 seed + yönləndirmələr → `api-cbar-admin` (`0023`) və `web-cbar-new`. Seed-i US2 ilə eyni yayıma salmaq tövsiyə olunur ki, yayım günü səhifə boş qalmasın.
8. Polish: sənədlər, ölçü, yekun yoxlama.
