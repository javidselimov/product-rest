# Tasks: "Aylıq hesabatlar" — şikayət indeksləri və infoqrafika üçün ayrıca məzmun növü

**Input**: `specs/052-monthly-reports/` — `plan.md`, `spec.md`, `research.md` (R1–R15), `data-model.md`, `contracts/`, `quickstart.md`

**Tests**:
- **Frontend testləri** davranış testləridir: rol, `userEvent`, MSW (yaddaş `functional-component-tests`). `frontend-standards` TDD tələb edir:
  test tapşırığı implementasiyadan əvvəl gəlir və əvvəl qırmızı olmalıdır.
- **Layout guard** lazım deyil: spec yeni `AboutLayoutKind` əlavə etmir. Mövcud `layout-fixtures.test.ts` dəyişmədən keçməlidir.
- **API-lər**: test layihəsi yoxdur. Yoxlama `dotnet build`, PGlite üzərində endpoint və migration icrası (`quickstart.md` §1–3, yaddaş
  `pglite-api-testing`) və route-diff ilə aparılır.

**Təşkili**:
- Tapşırıqlar user story-lər üzrə qruplaşdırılıb.
- Hər komponent ayrıca merge request-dir. Deploy sırası: `api-cbar-admin` (MR 1) → `api-cbar` (MR 2) → `web-cbar-admin-new` (MR 3) →
  `web-cbar-new` (MR 4).
- Workspace sənədləri və `specs/` ayrıca commit-dir. Commit yalnız istəklə edilir.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: paralel işlənə bilər (fərqli fayllar, açıq asılılıq yoxdur)
- **[Story]**: aid olduğu user story (spec.md):
  - US1 — redaktor yeni ayın faylını əlavə edir (admin API + panel) — P1
  - US2 — ziyarətçi şikayət indekslərini görür (public API + sayt) — P1
  - US4 — mövcud fayllar avtomatik köçürülür (seed) — P1
  - US3 — ziyarətçi infoqrafikanı görür — P2
  - US5 — səhifə formundan bölməyə keçid — P3

## Yol qısaltmaları

- `ADMIN-API` = `product-rest/api-cbar-admin` · `WEB-API` = `product-rest/api-cbar`
- `ADMIN` = `product-rest/web-cbar-admin-new` · `SITE` = `product-rest/web-cbar-new`
- `MR-ADMIN` = `ADMIN/src/features/monthly-reports` · `MR-SITE` = `SITE/src/features/monthly-reports`
- `AC` = `SITE/src/features/about-content/model`
- `TMP` = `.tmp-052/` (repo kökündə, commit olunmur — yaddaş `fork-agents-share-tmp`)

## Ümumi qaydalar (hər tapşırıq üçün)

- **Frontend skill qaydası** (layihə qaydası, `.claude/hooks/frontend-skills.mjs`): `SITE` və ya `ADMIN` tapşırığına başlamazdan əvvəl `senior-front`,
  `frontendpatterns` və həmin komponentin `frontend-standards`, `ui-kit-usage` skill-ləri yüklənir. Kod `plan.md` "Frontend Skills Gate"
  cədvəlinə uyğun yazılır.
- **Mətn və sabitlər**:
  - Yeni şərhlər ingiliscədir (yaddaş `code-comments-english`).
  - UI mətni yalnız i18n açarı ilə yazılır, az və en.
  - Rəqəmlər adlı sabitdir (spec 032): `MR-ADMIN/model/constants.ts`, `AC/constants.ts`.
- **SITE faylları**: `prettier --write` işlədilmir. Fayllar Edit və ya Node ilə redaktə olunur (yaddaş `windows-shell-crlf`,
  `no-prettier-write-web-cbar-new`). Saytda yeni `'use client'` və `dangerouslySetInnerHTML` yoxdur.
- **API**: endpoint-lər spec-first-dir. OpenAPI əvvəl yazılır (T002–T004). `.claude/hooks/spec-first.mjs` bundle-da olmayan route-u rədd edir.
- **Domain və mühit**:
  - `Cbar.Domain` iki nüsxədə bayt-bayt eynidir.
  - `dotnet` `C:/Program Files/dotnet/dotnet`-dədir. Docker işlədilmir (yaddaş `dotnet-sdk-local-build`).
  - Mövcud cədvəllərə `ALTER TABLE` edilmir (yaddaş `no-alter-existing-tables`).

---

## Phase 1: Setup

**Purpose**: köçürmənin baza xətti və spec-first kontraktlar.

- [X] T001 Test API-dən (`https://api-cbar-test.cbar.az/api/v1/pages/{slug}?locale=`) bu səhifələri `TMP/api/`-yə yaz: az/en
  `bank-xidmetlerinden-istifade-uzre-sikayet-indeksi`, `complaint-index-on-bank-customers-use-of-bank-services`,
  `avto-icbari-sigorta-uzre-sikayet-indeksi`, `complaint-index-on-compulsory-mtpl-insurance` və az `infoqrafika`.
  `TMP/baseline.mjs` ilə hər seriya və dil üçün `{year, month, mediaId}` siyahısını spec 050 parser-inin qaydası ilə çıxar (`/media/N` +
  `data-media-link`) və `TMP/baseline.json`-a yaz. Gözlənilən: Bank 32/32, Sığorta 45/41 (+2 xarici link), İnfoqrafika 65/0 (SC-002 baza xətti).
- [X] T002 [P] `ADMIN-API/openapi/paths/monthly-reports.yaml`, `ADMIN-API/openapi/components/schemas/monthly-reports.yaml`,
  `ADMIN-API/openapi/openapi.yaml` (tag `MonthlyReports`, path ref-ləri). Məzmun: `contracts/admin-api.md`-dəki 6 route, sxemlər,
  400/404/409 `problem+json`. Sonra `ADMIN-API/openapi`-də `npm run lint && npm run bundle`.
- [X] T003 [P] `WEB-API/openapi/paths/monthly-reports.yaml`, `components/schemas/monthly-reports.yaml`, `openapi.yaml`:
  `GET /api/v1/monthly-reports` (`contracts/public-api.md`). Sonra `npm run lint && npm run bundle`.
- [X] T004 OpenAPI dəyişikliklərini istifadəçiyə təsdiq üçün göstər (spec-first qaydası, `/api-endpoint` skill-i). Təsdiqsiz controller yazılmır.

**Checkpoint**: baza xətti saylarla təsdiqlənib, iki OpenAPI bundle hazırdır və təsdiqlənib.

---

## Phase 2: Foundational (bütün hekayələr bundan asılıdır)

**Purpose**: sxem, entity-lər, icazələr.

- [X] T005 `ADMIN-API/db/migrations/0034-monthly-reports.sql`. Tərkibi:
  - `data-model.md`-dəki 4 cədvəl və index-lər, o cümlədən partial unique `(series_id, year, month) WHERE deleted_at IS NULL`;
  - `CHECK`-lər;
  - şərti FK DO bloku (0027 kimi: `users`, `locales`, `media_assets`);
  - `monthly_reports_set_updated_at` trigger, `cbar_web_ro` GRANT;
  - `monthly_reports.read|create|update|delete` icazələri + `moderator`;
  - üç seriyanın seed-i (açar, `period_months` 1/12/1, sort 10/20/30, az/en adlar), `ON CONFLICT DO NOTHING`.

  `IF NOT EXISTS` işlədilir, BEGIN/COMMIT yoxdur.
- [X] T006 [P] `ADMIN-API/src/Cbar.Domain/Entities/MonthlyReport.cs`: `MonthlyReportSeries`, `MonthlyReportSeriesTranslation`, `MonthlyReport`,
  `MonthlyReportTranslation` (`Media` → `MediaAsset`). `ADMIN-API/src/Cbar.Domain/CbarDbContext.cs`-də mapping:
  - snake_case cədvəl və sütunlar, `content_status`;
  - `MonthlyReport` üçün `HasQueryFilter(DeletedAt == null)`;
  - partial unique index `HasFilter("deleted_at IS NULL")`;
  - cascade əlaqələr.
- [X] T007 T006-nın fayllarını `WEB-API/src/Cbar.Domain/`-a bayt-bayt köçür. `git diff --no-index WEB-API/src/Cbar.Domain ADMIN-API/src/Cbar.Domain`
  boş olmalıdır.
- [X] T008 [P] `ADMIN-API/src/Cbar.AdminApi/Authorization/Permissions.cs`: `MonthlyReports.Read/Create/Update/Delete`. Lazım olsa, matris faylını da
  yenilə (memorandum nümunəsi).
- [X] T009 `dotnet build ADMIN-API` və `dotnet build WEB-API`. Sonra PGlite ilə boş bazada `api-cbar-admin`-i başlat: `0034` tətbiq olunur,
  `monthly_report_series`-də 3 sətir yaranır. İkinci start heç nə dəyişmir.

**Checkpoint**: sxem və entity-lər hazırdır, iki API build olur.

---

## Phase 3: User Story 1 — redaktor yeni ayın faylını əlavə edir (P1) 🎯 MVP

**Goal**: redaktor admin paneldə seriya, il, ay və fayl seçib sətir yaradır. Təkrar ay, faylsız və səhv il rədd olunur.

**Independent Test**: `quickstart.md` §2 cədvəli + §4 əl ilə addımlar. Bank tabında "Yeni" İyun 2026 ilə açılır, saxlanılır, siyahıda görünür.

### Admin API (`api-cbar-admin`, MR 1)

- [X] T010 [US1] `ADMIN-API/src/Cbar.AdminApi/Controllers/MonthlyReportsController.cs` (`CbarControllerBase`,
  `RequirePermission(MonthlyReports.Read)`). Endpoint-lər:
  - `GET series` → `{key, name, nameEn, periodMonths}`, `sort_order` üzrə;
  - `GET` siyahı → `series`/`year`/`status` süzgəci, `year DESC, month DESC, series.sort_order, id` sırası, `locales`, `missingFile`;
  - `GET {id:int}`, `POST`, `PUT {id:int}`, `DELETE {id:int}` (soft).

  Qaydalar: validasiya `data-model.md`-dəki kimidir (seriya açarı, il 2000…cari+1, ay 1–12, ən azı bir dil, media mövcud və silinməmiş,
  `scheduled` yox). Təkrar dövr pre-check ilə `ConflictProblem("Bu seriyada {Ay} {İl} üçün hesabat artıq var.")` qaytarır, az ay adları
  controller-də sabit massivdir. Buraxılan dilin faylı silinir. `AuditService` ilə `monthly_reports.create|update|delete` yazılır. Mesajlar
  azərbaycancadır.
- [X] T011 [US1] PGlite + API ilə `quickstart.md` §2 cədvəlinin hər sətrini icra et: 409, 400 ×3, sil, sonra yenidən yarat, `audit_log`.
  `node .claude/skills/sync-openapi/scripts/route-diff.mjs api-cbar-admin` fərqsiz olmalıdır.

### Admin panel (`web-cbar-admin-new`, MR 3)

- [X] T012 [P] [US1] `ADMIN/src/features/faq/components/locale-badges.tsx` → `ADMIN/src/entities/content/ui/locale-badges.tsx` (`shared` `entities`-dən import edə bilmir; etiketlər `common:languages.*`): FAQ importlarını yenilə,
  köhnə yerdə re-export qalmasın (research R13). FAQ testləri dəyişmədən keçməlidir.
- [X] T013 [P] [US1] Test (əvvəl qırmızı): `ADMIN/src/features/crud/components/crud-list-page.test.tsx`-ə `newSearch` ssenarisini əlavə et.
  Süzülmüş siyahıda "Yeni" `newSearch(rows, filters)` nəticəsini `prefillFromSearch` sorğusu ilə birlikdə URL-ə qoyur. `newSearch` yoxdursa,
  davranış dəyişmir.
- [X] T014 [US1] `ADMIN/src/shared/crud/types.ts`: `ModuleConfig.newSearch?: (rows: Row[], filters: Record<string, string | undefined>) =>
  Record<string, string>` (JSDoc ingiliscə). Bunu `ADMIN/src/features/crud/components/crud-list-page.tsx`-də tətbiq et, T013 yaşıl olmalıdır.
- [X] T015 [P] [US1] `ADMIN/src/shared/testing/handlers/monthly-reports.ts`: in-memory store, 3 seriya, `contracts/admin-api.md` formaları,
  409 təkrar dövr, 400 validasiya, soft delete. Qeydiyyat `handlers/index.ts`-də, factory-lər `shared/testing/factories.ts`-də.
- [X] T016 [P] [US1] Test (əvvəl qırmızı): `MR-ADMIN/model/period.test.ts`.
  - `nextPeriod`: 2026/5 → 2026/6, 2026/12 → 2027/1.
  - `periodLabel` (az/en): 1 ay "Sentyabr 2026", 12 ay 2026/5 "İyun 2025 – May 2026", 12 ay 2026/1 "Fevral 2025 – Yanvar 2026".
- [X] T017 [US1] `MR-ADMIN/model/constants.ts` (`YEAR_MIN`, `YEAR_MAX_AHEAD`, `MONTHS_IN_YEAR`, `COLUMN_WIDTH`, `PERIOD_SEPARATOR`) və
  `MR-ADMIN/model/period.ts`. Ay adları i18n-dən gəlir (`monthly-reports:months.1…12`). T016 yaşıl olmalıdır.
- [X] T018 [P] [US1] Lookup qatı:
  - `MR-ADMIN/model/schemas.ts` (Zod: `rowSchema`, `detailSchema`, `seriesSchema`);
  - `MR-ADMIN/api/monthly-reports.service.ts` (`getSeries`);
  - `MR-ADMIN/api/keys.ts`.
- [X] T019 [P] [US1] i18n:
  - `ADMIN/src/locales/{az,en}/monthly-reports.json`: başlıq, təsvir, sütunlar, sahələr, kömək mətni ("en faylı yoxdursa…"), 12 ay, seriyaların
    qısa etiketləri, "Fayl silinib", boş vəziyyət;
  - `ADMIN/src/locales/{az,en}/nav.json`: `groups.consumer` "İstehlakçı hüquqları" / "Consumer rights", `monthlyReports.label/description`;
  - namespace qeydiyyatı. `check:i18n` keçməlidir.
- [X] T020 [US1] Funksional testlər (əvvəl qırmızı): `ADMIN/src/features/monthly-reports/monthly-reports.test.tsx` (FAQ testi kimi feature-də) (`renderApp`, MSW).
  `contracts/admin-ux.md` §Test 1–4-ü əhatə edir:
  - Bank tabında "Yeni", forma Bank + İyun 2026 ilə açılır, fayl seçilir, saxlanılır, siyahıda sətir görünür;
  - təkrar dövrdə 409 mesajı;
  - faylsız saxlamada validasiya;
  - "Fayl silinib" nişanı.
- [X] T021 [US1] `MR-ADMIN/model/module.ts`: `createMonthlyReportsModule(series)`. Tərkibi:
  - `rowSchema`, `detailSchema`;
  - süzgəclər: `series` tabs, `year` number, `statusFilter`;
  - sütunlar: seriya, dövr (`periodLabel`), fayllar (`LocaleBadges` + `missingFile` `Badge colorPalette="red"`), status, dəyişib;
  - sahələr: `series` select, `year` number min/max, `month` select `valueAsNumber`, per-locale `media` `required`
    `mediaNameKey: 'translations.{locale}.mediaName'`, status;
  - `prefillFromSearch: ['series', 'year', 'month']`;
  - `newSearch`: seriya süzülübsə `nextPeriod(rows[0])`;
  - `buildPayload`/`parseDetail`: `translations: {az: {mediaId}}`, boş dil göndərilmir.
- [X] T022 [US1] `ADMIN/src/pages/monthly-reports/index.tsx` (`LookupGate` ilə seriyalar → `CrudListPage`/`CrudFormPage`, `pages/faq` nümunəsi).
  Route-lar `ADMIN/src/app/routes/index.ts`-də `createCrudRoutes` ilə. `ADMIN/src/app/routes/nav.ts`-də:
  - `NavGroup` `consumer` `cooperation`-dan sonra, `faq`-dan əvvəl;
  - `NavKey` `monthlyReports` + ikon (kit `icons`).

  Nav testlərini yenilə. T020 yaşıl olmalıdır.
- [X] T023 [US1] Review: US1-də dəyişən `ADMIN` fayllarına `ui-kit-review` + `senior-front` review checklist
  (`.claude/skills/senior-front/references/review-checklist.md`). `plan.md` gate ilə tutuşdur: CRUD şablonu, `features → features` importu
  yoxdur, semantik rənglər, magic number yoxdur. Tapılanları düzəlt.
- [X] T024 [US1] `ADMIN`: `npm run verify`, Node 22 ilə də `npm run test:run` (yaddaş `run-tests-on-node22`). — verify 67 fayl / 642 test + build; Node 22 ilə 642 yaşıl

**Checkpoint**: redaktor paneldən aylıq hesabat əlavə edir. Sayt hələ köhnə HTML yolu ilə işləyir.

---

## Phase 4: User Story 2 — ziyarətçi şikayət indekslərini görür (P1) 🎯 MVP

**Goal**: Şikayət indeksləri səhifəsinin hər iki tabı sətirlərdən qurulur. Görünüş spec 050 ilə eynidir, sətir yoxdursa HTML fallback işləyir.

**Independent Test**: `quickstart.md` §3 + §5 (Bank, Sığorta, en, API 500 → fallback).

### Public API (`api-cbar`, MR 2)

- [X] T025 [US2] `WEB-API/src/Cbar.WebApi/Controllers/MonthlyReportsController.cs`: `GET /api/v1/monthly-reports?locale=&series=`
  (`contracts/public-api.md`).
  - Filtr: `Published`, `DeletedAt == null`, həmin dildə fayl, `Media.DeletedAt == null`.
  - Seriyalar `sort_order` üzrə, hesabatlar `year DESC, month DESC`. Boş seriya cavabda yoxdur.
  - `name` dildə yoxdursa az adı gəlir. `file.url = /media/{id}`.
  - Səhv `locale` → `az`.
- [X] T026 [US2] PGlite + `cbar_web_ro` ilə T011-də yaradılmış sətirlərə `quickstart.md` §3 sorğuları (az/en/`series`/draft). `route-diff.mjs api-cbar`
  fərqsiz olmalıdır.

### Sayt (`web-cbar-new`, MR 4)

- [X] T027 [P] [US2] `SITE/src/shared/testing/fixtures/monthly-reports.ts` (3 seriya: Bank 2 il, Sığorta 12 aylıq, İnfoqrafika; az + en variantı) və
  `SITE/src/shared/testing/handlers/monthly-reports.ts` (`series` süzgəci, `locale`). Qeydiyyat `handlers/index.ts`-də.
- [X] T028 [P] [US2] `MR-SITE/model/schemas.ts` (Zod, `contracts/public-api.md`) və `MR-SITE/api/monthly-reports.api.ts` (`server-only`,
  `getMonthlyReports(locale, keys)`). Mövcud api-client pattern-i işlədilir, keşsiz.
- [X] T029 [P] [US2] Test (əvvəl qırmızı): `AC/report-archive.test.ts`.
  - İllər və aylar azalan sıradadır (qarışıq giriş də olsa), `latest` düzgündür.
  - Ay etiketi az `İyun`, en `June`.
  - Başlıq 1 ayda "{ad} (May 2026)", 12 ayda "{ad} (İyun 2025 – May 2026)", il keçidində Yanvar 2026 → "Fevral 2025 – Yanvar 2026".
  - `file` API-dən gəlir.
- [X] T030 [P] [US2] Test (əvvəl qırmızı): `AC/complaint-index.test.ts`-ə yeni ssenarilər.
  - Bank seriyası + köhnə arxivli HTML: arxiv sətirlərdəndir, `introHtml`/`restHtml`/metodologiya HTML-dəndir, köhnə ay faylları nəticədə yoxdur.
  - Bank seriyası + arxivsiz HTML: tab qurulur, metodologiya ayrılır.
  - Sığorta seriyası + yoldaş HTML: Sığorta tabının metodologiyası yoldaşdandır.
  - Seriya yoxdur: mövcud testlər dəyişmir.
- [X] T031 [P] [US2] Test (əvvəl qırmızı): `SITE/src/views/cms-page/loader.test.ts` (MSW).
  - Şikayət səhifəsi seriyalarla tabları sətirlərdən qurur.
  - `monthly-reports` 500 verəndə səhifə spec 050 HTML yolu ilə eyni bloku verir (FR-014, SC-005).
- [X] T032 [US2] `AC/types.ts` (`ReportSeriesKey`, `MonthlyReport`, `ReportSeries`, `ParseContext.reports`), `AC/constants.ts`
  (`ARCHIVE_PERIOD_SEPARATOR`, seriya açarları) və `AC/report-archive.ts` (`archiveFromReports`, `reportTitle`). T029 yaşıl olmalıdır.
- [X] T033 [US2] `AC/complaint-index.ts`-də `tabFromReports` (`contracts/site-integration.md` §Parser-lər), `parseComplaintIndex(..., reports)`.
  `AC/parse.ts` `context.reports`-u ötürür. T030 yaşıl olmalıdır.
- [X] T034 [US2] `SITE/src/views/cms-page/loader.ts`. Tərkibi:
  - `REPORT_SERIES_FOR_LAYOUT` (`complaint-index` → bank + insurance);
  - `toReportSeries` (DTO → `ReportSeries`, `mediaUrl`);
  - `complaint-index` üçün `getMonthlyReports` və `loadCompanion` `Promise.all` ilə;
  - xəta → `[]`;
  - `parseAbout` kontekstinə `reports`.

  T031 yaşıl olmalıdır.
- [X] T035 [US2] Review: US2-də dəyişən `SITE` fayllarına `ui-kit-review` + `senior-front` checklist. Yoxlanır: yeni client komponenti yoxdur,
  model saf funksiyadır, DTO çevirməsi loader-dədir, magic number yoxdur. Tapılanları düzəlt.
- [X] T036 [US2] `SITE`: `npm run verify`, Node 22 ilə də `npm run test:run`. Mövcud `layout-fixtures.test.ts` dəyişmədən keçməlidir. — verify 160 fayl / 1555 test + build; Node 22 ilə 1555 yaşıl

**Checkpoint**: sayt arxivi admin sətirlərindən göstərir. Sətir yoxdursa, bugünkü kimi işləyir.

---

## Phase 5: User Story 4 — mövcud fayllar avtomatik köçürülür (P1)

**Goal**: deploy-da 95, 96 və 93-ün az/en arxivləri sətirlərə köçür. Səhifə mətnləri dəyişmir, təkrar işləmə zərərsizdir.

**Independent Test**: `quickstart.md` §1. NOTICE sayları T001 baza xətti ilə tutuşur.

- [X] T037 [US4] `ADMIN-API/db/migrations/0035-monthly-reports-seed.sql` (`data-model.md` → Köçürmə):
  - **Səhifə tapılması**: bir DO bloku, seriya → az slug cədvəli, səhifə `page_translations` az slug-ı ilə tapılır, en mətni eyni `page_id`-nin
    en tərcüməsidir.
  - **Qoruyucu**: seriyada istənilən sətir varsa (silinmiş də daxil) `NOTICE` verilir və seriya ötürülür.
  - **Parse**: `regexp_split_to_table` il hissələri üçün, `regexp_matches(..., 'g')` ay + `/media/N` üçün, `.` ilə (`[\s\S]` yox).
  - **Ay adları**: az + en `VALUES` cədvəli, `lower(replace(…,'ı','i'))` ilə.
  - **Fayl**: `media_assets`-də mövcud və silinməmiş olmalıdır.
  - **Yazma**: az sətir `published` statusla yaranır, en eyni dövrə əlavə olunur. Tanınmayan ay `NOTICE` ilə ötürülür.
  - **Yekun**: `NOTICE 'spec 052: <key> az=N en=M'`. `page_translations`-a yazılmır.
- [X] T038 [US4] `TMP/pglite-seed.mjs` ilə PGlite bazası hazırla: `0001…0033`, T001-in `content`-i ilə 95/96/93 səhifələri və onların `/media/N`
  id-ləri üçün `media_assets` sətirləri. Sonra API-ni başlat və yoxla:
  - NOTICE sayları Bank 32/32, Sığorta 45/41, İnfoqrafika 65/0-dır;
  - ikinci start yeni sətir yaratmır;
  - səhifəsiz boş bazada xəta yoxdur.
- [X] T039 [US4] `TMP/compare.mjs`: `GET /api/v1/monthly-reports` (az, en) cavabındakı `{series, year, month, file.id}` çoxluğu T001 baza
  xəttinə bərabər olmalıdır (SC-002, fərq 0). Nəticəni bu tapşırığın qeydinə yaz. — fərq 0: az Bank 32, Sığorta 45, İnfoqrafika 65; en Bank 32, Sığorta 41 (`.tmp-052/compare.mjs`)

**Checkpoint**: köçürmə real HTML üzərində yoxlanıb, sayt tam məlumatla sətir yolundadır.

---

## Phase 6: User Story 3 — ziyarətçi infoqrafikanı görür (P2)

**Goal**: Statistika səhifəsinin İnfoqrafika bloku İnfoqrafika seriyasından qurulur.

**Independent Test**: `quickstart.md` §5, `/az/vetendas-muracietlerine-dair-statistika#infoqrafika` 6 il / 65 ay; en-də blok yoxdur.

- [X] T040 [P] [US3] Test (əvvəl qırmızı): `AC/appeal-statistics.test.ts`-ə yeni ssenarilər. İnfoqrafika seriyası varsa
  `infographics = archiveFromReports(...)`, yoxdursa yoldaş HTML-dən. Statistika cədvəli və icmal dəyişmir.
- [X] T041 [P] [US3] Test (əvvəl qırmızı): `SITE/src/views/cms-page/loader.test.ts`. Statistika səhifəsində İnfoqrafika seriyası varsa yoldaş (93)
  sorğusu edilmir (MSW handler çağırılmır), yoxdursa edilir.
- [X] T042 [US3] `AC/appeal-statistics.ts` (`parseAppealStatistics(nodes, companion, reports)`) və `AC/parse.ts`. T040 yaşıl olmalıdır.
- [X] T043 [US3] `SITE/src/views/cms-page/loader.ts`. `REPORT_SERIES_FOR_LAYOUT`-a `appeal-statistics` → infographics əlavə et. Əvvəl `reports`
  yüklənir, yoldaş yalnız seriya yoxdursa. T041 yaşıl olmalıdır.
- [X] T044 [US3] Review: US3 fayllarına `ui-kit-review` + `senior-front` checklist.
- [X] T045 [US3] `SITE`: `npm run verify`, Node 22 ilə də testlər.

**Checkpoint**: üç seriyanın hamısı saytda sətirlərdən göstərilir.

---

## Phase 7: User Story 5 — səhifə formundan bölməyə keçid (P3)

**Goal**: 95, 96 və 93-ün admin formasında kart "Aylıq hesabatlar"-a uyğun seriya süzgəci ilə aparır.

**Independent Test**: səhifə 95-in formasında kart `/monthly-reports?series=bank-complaint-index`-ə aparır.

- [X] T046 [P] [US5] Test (əvvəl qırmızı): `ADMIN/src/features/pages/components/*.test.tsx` (mövcud `ManagedSectionCard` testinin yanında). Səhifə
  95-in formasında kartın linki `series=bank-complaint-index` ilə, 93-də isə `series=infographics` ilə olmalıdır.
- [X] T047 [US5] `ADMIN/src/features/pages/model/managed-sections.ts`: `link` növünə opsional `search?: Record<string, string>` əlavə et. Üç slug
  (`bank-xidmetlerinden-istifade-uzre-sikayet-indeksi`, `avto-icbari-sigorta-uzre-sikayet-indeksi`, `infoqrafika`) → `/monthly-reports`, group
  `consumer`, item `monthlyReports`, öz `series` açarı ilə. `ManagedSectionCard` `search`-i `Link`-ə ötürür. T046 yaşıl olmalıdır.
- [X] T048 [US5] Review: US5 fayllarına `ui-kit-review` + `senior-front` checklist.
- [X] T049 [US5] `ADMIN`: `npm run verify`, Node 22 ilə də testlər. — verify 67 fayl / 645 test + build. Node 22-də tam run-da mövcud `sənədlər: sırala…` testi 15 s timeout verdi (maşın API/PGlite/next prosesləri ilə yüklü idi), fayl ayrıca Node 22 ilə 35/35 yaşıl

---

## Phase 8: Polish & Cross-Cutting

- [X] T050 [P] `SITE/docs/consumer-rights-cms-guide.md` yenilənir:
  - arxiv artıq "**İstehlakçı hüquqları → Aylıq hesabatlar**"-dadır;
  - yeni ay səhifə HTML-inə yazılmır;
  - sətir olduqda köhnə akkordeon gizlənir, sətir olmadıqda HTML fallback işləyir;
  - en faylı olmayan ay en-də görünmür;
  - Sığortanın 12 aylıq başlığı;
  - xarici linkli 2 en ayı əl ilə əlavə etmə yolu.

  `SITE/CLAUDE.md`-də spec 050 bəndinə qeyd əlavə et.
- [X] T051 [P] `dokumentasiyalar/istehlakci-huquqlari-guide.md`: redaktor üçün ekran-ekran yeni iş axını ("Yeni" → növbəti ay, fayl, status).
  Lazım olsa `dokumentasiyalar/README.md` sətri.
- [X] T052 [P] Kök `CLAUDE.md`: spec 050 bəndinə "arxivlər spec 052-dən `GET /api/v1/monthly-reports`-dandır, HTML fallback-dır". Admin bölməsinə
  "Aylıq hesabatlar" və `newSearch`. `ADMIN/CLAUDE.md`-yə bölmə paraqrafı (memorandum paraqrafı kimi) və mühərrik genişlənməsi.
- [X] T053 [P] Menyu sənədləri (yaddaş `menu-changes-update-docs`): `specs/046-international-memberships/contracts/admin-nav.md` (yeni `consumer`
  qrupu, sıra, `managed-sections` sətirləri). `SITE/docs/*-cms-guide.md`-də mövcud menyu yolları dəyişmirsə, bunu yoxla və qeyd et.
- [X] T054 [P] `business_logic/new_business_logic.md` və `diff_report_logic.md` (`/sync-business-logic` qaydası ilə). Yazılacaq: məzmun növü,
  köçürmə, xarici linklər, HTML fallback.
- [X] T055 [P] İki `openapi.yaml`-ın `# Sync:` sətrinə "monthly-reports (spec 052)" yazılır (`/sync-openapi` qaydası). `route-diff` hər iki API-də
  fərqsiz olmalıdır.
- [X] T056 Figma ölçməsi: Edge CDP ilə 1728/744/390 enində Şikayət indeksləri (Bank + Sığorta) və İnfoqrafika bloku üçün
  `getBoundingClientRect`. Müqayisə spec 050 `contracts/ui-contract.md` §3 ilə (yaddaş `figma-measure-dom`, `hybrid-fixture-proxy-for-ui-measuring`).
  Gözlənilən fərq 0-dır, Sığortanın uzun başlığında sətir sınması yoxlanır. — eyni build, proxy (spec 050 mətnləri + test API) və köçürülmüş bazadakı api-cbar ilə Edge CDP: bütün x və enlər eyni, yalnız "Son məlumat" kartı yeni başlıq bir sətir qısa olanda 26 px alçalır (Bank 1728/390, Statistika 744). İki `next start` eyni `.next/cache`-i paylaşdığı üçün A/B yalnız Statistika üçün eyni build-də ölçüldü
- [X] T057 `quickstart.md`-nin bütün addımlarını icra et. `Cbar.Domain` diff boş olmalıdır. — quickstart §1–3 (PGlite: migration, təkrar start, səhifəsiz baza, admin 23 + public 13 yoxlama, müqayisə), §4–5 (`verify` ×2, Node 22, `next start` ilə render), §6 sənədlər; `Cbar.Domain` diff boş. Admin panel brauzerdə əl ilə açılmadı — davranış MSW funksional testləri ilə yoxlanıb
- [ ] T058 Deploy-dan əvvəl prod-da 95/96/93 slug-larının mövcudluğunu və ay etiketlərinin formasını yoxla: komandadan `pg_dump` və ya test ilə
  eyni olduğunun təsdiqi. Fərqli formalar varsa, `0035`-i tətbiqdən əvvəl düzəlt. Tətbiq olunmuş migration redaktə edilmir.

---

## Dependencies & Execution Order

### Phase asılılıqları

- **Phase 1** asılılıqsızdır. T004 (OpenAPI təsdiqi) bütün controller tapşırıqlarını (T010, T025) bloklayır.
- **Phase 2** Phase 1-dən sonra gəlir: T005 → T006 → T007 → T009; T008 T006 ilə paraleldir.
- **US1 (Phase 3)** Phase 2-dən sonra gəlir. Admin API (T010–T011) admin paneldən (T012–T024) asılı deyil, çünki panel MSW ilə işləyir.
- **US2 (Phase 4)**: T025 T007-dən sonra gəlir. T026 T011-dən sonra gəlir (sətirlər admin API ilə yaradılır). Sayt tapşırıqları (T027–T036) yalnız
  T003-dən asılıdır (MSW).
- **US4 (Phase 5)**: T037 T005-dən, T038 T009 + T001-dən, T039 T025 + T038-dən sonra gəlir.
- **US3 (Phase 6)**: US2-dən sonra gəlir (`report-archive.ts`, `loader.ts` paylaşılır).
- **US5 (Phase 7)**: US1-dən sonra gəlir (route və nav açarı).
- **Polish** bütün hekayələrdən sonra gəlir.

### Deploy sırası (Maddə IV.2)

1. MR 1 `api-cbar-admin`: T002, T005–T011, T037.
2. MR 2 `api-cbar`: T003, T007, T025.
3. MR 3 `web-cbar-admin-new`: T012–T024, T046–T049.
4. MR 4 `web-cbar-new`: T027–T036, T040–T045.

Sayt köhnə API ilə də sınmır: endpoint yoxdursa xəta verir, xəta isə HTML fallback-a aparır.

### Fayl toqquşmaları (ardıcıl olmalıdır)

- `SITE/src/views/cms-page/loader.ts` + `loader.test.ts`: T031 → T034 → T041 → T043
- `AC/parse.ts`: T033 → T042
- `AC/types.ts`, `AC/constants.ts`: yalnız T032
- `ADMIN/src/features/crud/components/crud-list-page.tsx`: yalnız T014
- `ADMIN/src/app/routes/nav.ts`: T022 → (T047 yalnız `managed-sections.ts`-ə toxunur)
- `ADMIN-API/.../CbarDbContext.cs`: yalnız T006 (T007 köçürür)

### Paralel imkanlar

- **Phase 1**: T002 ‖ T003 (T001 ilə də).
- **Phase 2**: T006 ‖ T008.
- **US1**: T012 ‖ T013 ‖ T015 ‖ T016 ‖ T018 ‖ T019. Admin API (T010–T011) panel işi ilə paralel gedir.
- **US2**: T027 ‖ T028 ‖ T029 ‖ T030 ‖ T031. Public API (T025) sayt işi ilə paralel gedir.
- **US3**: T040 ‖ T041.
- **Komponentlər arası**: US1 panel (MR 3) ilə US2 sayt (MR 4) fərqli komponentlərdir, paralel gedə bilər.

### Paralel nümunə: US2

```text
T027 fixtures/handlers ‖ T028 api/schemas ‖ T029 report-archive.test ‖ T030 complaint-index.test ‖ T031 loader.test
sonra: T032 report-archive → T033 complaint-index → T034 loader → T035 review → T036 verify
paralel: T025 public controller → T026 PGlite yoxlaması
```

## Implementation Strategy

### MVP (Phase 1 + 2 + US1 + US2)

Bu mərhələdən sonra redaktor paneldən hesabat əlavə edir, sayt Şikayət indekslərini sətirlərdən göstərir. Köçürmə olmasa da təhlükəsizdir:
sətir olmayan seriya HTML yolu ilə göstərilir. Amma bu halda yeni ay əlavə edildikdən sonra sayt yalnız sətirləri göstərir. Ona görə **prod deploy
US4 (köçürmə) ilə birlikdə** edilir.

### Artımlı çatdırılma

1. US1 admin → 2. US2 Şikayət indeksləri → 3. US4 köçürmə (MR 1-ə daxildir, prod-dan əvvəl məcburidir) → 4. US3 İnfoqrafika → 5. US5 keçid kartı →
6. Polish.

### Qeydlər

- Sığortanın en-dəki 2 xarici linkli ayı köçürülmür. Bu research R6-da qeyd olunub, redaktor təlimatında yazılır.
- Seriya adlarını dəyişən admin ekranı bu spec-də yoxdur (spec, Assumptions).
- Hər frontend fazası review (ui-kit-review + senior-front) və `npm run verify` ilə bitir (layihə qaydası).
