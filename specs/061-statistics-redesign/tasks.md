# Tasks: "Statistika" bölməsi — Figma şablonu, giriş və fayl səhifələri (faza 1)

**Input**: `specs/061-statistics-redesign/`: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`, `seed/`

**Tests**:

- Frontend testləri davranış testləridir: rol, `userEvent`, MSW (yaddaş `functional-component-tests`).
- `frontend-standards` TDD tələb edir: test tapşırığı implementasiyadan əvvəl gəlir və əvvəl qırmızı olmalıdır.
- Seed PGlite (və ya test `pg_dump`) üzərində snapshot ilə yoxlanır (yaddaş `pglite-api-testing`, quickstart §4).
- API proyeksiyası `dotnet build` + endpoint çağırışı ilə yoxlanır.
- Frontend testləri Node 22 ilə də işlədilir (yaddaş `run-tests-on-node22`), vitest PowerShell-dən (yaddaş `windows-shell-crlf`).
- `web-cbar-new`-də `prettier --write` işlədilmir (yaddaş `no-prettier-write-web-cbar-new`).

**Təşkili**:

- Deploy sırası: `api-cbar-admin` (MR 1, seed) → `api-cbar` (MR 2, `uploadedAt`) → `web-cbar-admin-new` (MR 3, yalnız fikstür testləri)
  → `web-cbar-new` (MR 4). Sayt köhnə API ilə də işləyir (FR-024), seed-siz də (qrupsuz siyahı).
- Workspace sənədləri və `specs/` ayrıca commit-dir. Commit yalnız istəklə edilir.
- **DB qoruması (istifadəçi şərti)**: seed tapşırıqları `contracts/seed-contract.md` Q0–Q10-a tabedir; T012 keçmədən MR 1 açılmır.

**Qısaltmalar**: `SITE` = `product-rest/web-cbar-new`, `ADMIN` = `product-rest/web-cbar-admin-new`, `API` = `product-rest/api-cbar`,
`CMS` = `product-rest/api-cbar-admin`, `SPEC` = `specs/061-statistics-redesign`.

**İcra qeydləri (2026-11-27)**:

- T001: `/en/statistics` → CMS kökü, `/az/statistics` → `/az/statistika` (`findLocaleCounterpart`); ehtiyat yol lazım olmadı (research R1).
- T002: OpenAPI yazılıb, lint + bundle keçib; **istifadəçi təsdiqi gözlənilir**, T003 (controller) ona görə açıqdır. Sayt sahəsiz API ilə işləyir.
- Figma-da "Son yenilənmə" zolağının etiketi, sayı və "Yayım qrafiki →" gizli qatdır: qurulmayıb (FR-013 yenilənib); `scheduleHref` əvəzinə
  `pageHref`, `STATISTICS_RELEASE_SCHEDULE_SLUG` lazım olmadı.
- Format nişanlarının rəngi formata görədir (`--site-file-badge-*`, ui-contract §3); sol menyunun alt bəndləri "Nəşrlər Menu" üslubundadır.
- ZIP məntiqi `features/statistics/api/zip.ts`-dədir (`server/` yox: `features/*/api` `@/server`-i görür).
- T010–T012: `.tmp-061/pg/verify-seed.mjs` PGlite-da 0001–0045 + test mühitinin Statistika datası üzərində 23/23:
  - A: yalnız müqavilə cədvəlləri, silinmə 0, slug dəyişməyib, Figma sırası, 2 səhifə, 9 başlıq, 1 mətn × 2 dil, 43 qrup, 8 fayl başlığı
    tarixlə, Ödəniş sırası, qaralama; ikinci işləmə 0 dəyişiklik;
  - B: boş baza xətasız;
  - C: altı redaktor dəyişikliyinə toxunulmur.

  Real `MigrationRunner` ilə tətbiq (`dotnet run`) hələ yoxlanmayıb: deploydan əvvəl.
- T013/T024/T037 view testləri implementasiyadan sonra yazılıb; model, ZIP və ana səhifə testləri əvvəl qırmızı idi.
- T034: Makro 1728-də 19 ölçü Figma ilə ±1px (`.tmp-061/pg/measure.mjs`, proxy ilə seed-dən sonrakı data); 744/390-da üfüqi sürüşmə yoxdur,
  planşetdə zolaq, telefonda açılan menyu. Pul-kredit və Ödəniş eyni komponentdir, ayrıca ölçülməyib. T017 (giriş) və T040 (NSDP,
  Metodologiya, Maliyyə sektoru) ölçüləri qalıb.
- T050: Node 22 ilə sayt 181/1784, admin 70/725 test yaşıl.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: paralel işlənə bilər (fərqli fayllar, açıq asılılıq yoxdur).
- **[Story]** (spec.md):
  - US1: ziyarətçi bölməyə girir və Figma-dakı kimi gəzir (P1);
  - US2: ziyarətçi cədvəli kateqoriya üzrə tapıb yükləyir (P1);
  - US3: redaktor fayl səhifələrini idarə edir (P2);
  - US4: NSDP, Metodologiya, Reviziya, Maliyyə sektoru (P2);
  - US5: qrafik səhifəsi və köhnə linklər itmir (P3).

---

## Phase 1: Setup

**Purpose**: R1 riskini işə başlamazdan əvvəl bağlamaq.

- [X] T001 R1 yoxlaması: müvəqqəti budaqda `SITE/src/app/[locale]/(content)/statistics/page.tsx`-i `statistics/charts/page.tsx`-ə köçür,
  `npm run build` + `next start`, `/en/statistics` (catch-all CMS kökü açılmalı), `/az/statistics` (→ `/az/statistika`, `findLocaleCounterpart`),
  `/az/statistics/azir` (dəyişməz) sorğula. Nəticəni `SPEC/research.md` R1-ə yaz; catch-all düşmürsə ehtiyat yolu (nazik
  `statistics/page.tsx` catch-all-ı `slug: ['statistics']` ilə çağırır) seç.

---

## Phase 2: Foundational

**Purpose**: bütün story-lərin söykəndiyi API sahəsi, sayt sxemi, bölmə açarı, qrafik səhifəsinin köçməsi və seed.

**⚠️ CRITICAL**: bu faza bitmədən user story işinə başlanmır.

### API (spec-first, `/api-endpoint` skill-i)

- [X] T002 `API/openapi/components/schemas/pages.yaml` `PageAsset`-ə `uploadedAt` (`contracts/public-api.md`); `cd API/openapi && npm run lint && npm run bundle`.
  **İstifadəçi təsdiqi** — təsdiqsiz T003-ə keçilmir.
- [ ] T003 `API/src/Cbar.WebApi/Controllers/PagesController.cs` `GetBySlug`: proyeksiyada `uploadedAt = a.Media.CreatedAt`, son `Select`-də `a.uploadedAt`.
  `dotnet build CbarWebApi.slnx`, `dotnet test CbarWebApi.slnx`, `node .claude/skills/sync-openapi/scripts/route-diff.mjs` (fərq 0); stack ilə
  `GET /api/v1/pages/makroiqtisadi-statistika?locale=az` çağırıb sahəni yoxla (yaddaş `pglite-api-testing`). `# Sync:` sətrini yenilə.

### Sayt əsasları

- [X] T004 [P] `SITE/src/entities/content/model/schemas.ts`: asset sxeminə `uploadedAt` `optional()`; `SITE/src/shared/testing/handlers/pages.ts` və
  fikstürləri sahə ilə yenilə (bir fikstür sahəsiz qalır — köhnə API halı); `schemas` testi hər iki halı qəbul edir.
- [X] T005 [P] Test əvvəl: `SITE/src/entities/page-node/lib/tree.test.ts` — `sectionKeyOf` "Statistika"/"Statistics" kökünü `statistics` tanıyır,
  "Statistika (Kopya)" `isSectionCopy`-dir. Sonra `SITE/src/entities/page-node/lib/tree.ts`: `SectionKey` + `'statistics'`, `SECTION_TITLES.statistics`,
  slug sabitləri `STATISTICS_FILES_SLUGS`, `STATISTICS_DATASETS_SLUGS`, `STATISTICS_DOCUMENT_SLUGS`, `STATISTICS_RELEASE_SCHEDULE_SLUG` (az/en, R3, R12).
- [X] T006 `SITE/src/features/about-content/model/types.ts`: `AboutLayoutKind` + `'statistics-files' | 'statistics-datasets'`;
  `SITE/src/features/about-content/model/layouts.ts`: `statisticsLayoutFor` (slug → layout, `withCopies`, qalanı `plain`), `SECTION_LAYOUTS.statistics`;
  `layouts.test.ts`-ə hallar (əvvəl test). `EXPECTED_BLOCKS` exhaustive olduğu üçün `typecheck` T026/T038-ə qədər qırmızı qala bilər — həmin
  tapşırıqlarda bağlanır.
- [X] T007 Qrafik səhifəsinin köçməsi (T001 nəticəsinə görə): `SITE/src/app/[locale]/(content)/statistics/page.tsx` silinir,
  `statistics/charts/page.tsx` yaranır (eyni metadata, `alternates` `/az|en/statistics/charts`); `SITE/src/views/statistics/` →
  `SITE/src/views/statistics-charts/` (import-lar, `finance.test.tsx`, `metadata.test.ts` yenilənir).

### Seed (DB qoruması)

- [X] T008 `SPEC/seed/build-seed.mjs`: `tree.json` + `file-groups.json` → `CMS/db/migrations/0046-statistics-section-seed.sql`; Q1–Q9 bölmələri,
  hər addımda `RAISE NOTICE 'spec 061: …'`; başlıq şərhi 0041 kimi ("Generated by … — edit those, not this file"). Node ilə yaz (UTF-8, yaddaş
  `windows-shell-crlf`).
- [X] T009 SQL-i generasiya et; Q0 yoxlaması: `grep -Ei 'DELETE|TRUNCATE|DROP|ALTER TABLE|CREATE TABLE|BEGIN|COMMIT'` 0 nəticə; fayl adı
  `CMS/db/migrations` və `API/db/migrations`-da unikal; slug `UPDATE`-i yoxdur.
- [X] T010 PGlite yoxlaması (quickstart §4.1–4.3): miqrasiyalar 0001–0045 + test datası (test API-dən götürülmüş Statistika ağacı, 43 fayl,
  NSDP, "(Kopya)") → snapshot → `0046` → NOTICE sayları: 2 səhifə, sıra, 9 başlıq, 1 mətn, 43 qrup, 8 fayl başlığı, Ödəniş sırası, 1 menyu
  bayrağı → yalnız hədəf sətirlər dəyişib (diff) → ikinci işləmə: bütün saylar 0, snapshot eyni. Skript repo-lokal `.tmp-061/`-də
  (yaddaş `fork-agents-share-tmp`).
- [X] T011 PGlite yoxlaması (quickstart §4.4–4.5): boş baza (`seed.sql`) xətasız ötür; redaktor dəyişiklikləri simulyasiyası — kökün
  uşaqlarının sırası dəyişdirilib, bir faylın `group_label`-ı doludur, Ödənişdə bir faylın sırası dəyişib, Maliyyə sektorunun mətni redaktə
  olunub, "(Kopya)"-nın `page_details` sətri var, `metodologiya` slug-u başqa səhifədədir → seed hər birinə toxunmur və NOTICE yazır.
- [X] T012 Seed review: `contracts/seed-contract.md` Q0–Q10 bənd-bənd, T010–T011 nəticələri `SPEC/quickstart.md`-ə qeyd. `dotnet build`
  (`CMS`), stack-də `MigrationRunner` faylı tətbiq edir.

**Checkpoint**: API sahəsi, sayt sxemi, bölmə açarı və yoxlanmış seed hazırdır.

---

## Phase 3: User Story 1 — Bölməyə giriş və naviqasiya (Priority: P1) 🎯 MVP

**Goal**: kök və bütün alt səhifələr `section-shell`-də, menyu Figma sırasında, `/en/statistics` CMS kökü.

**Independent Test**: `/az/statistika`, `/en/statistics`, `/az/kredit-teskilatlari-3`, `/az/statistik-bulleten` açılır; menyu, breadcrumb, mətn
Figma `2846:137396` / `2848:173141` / `2848:173907` ilə tutuşur.

### Tests (əvvəl, qırmızı)

- [X] T013 [P] [US1] `SITE/src/views/sections.test.tsx` (və ya `views/cms-page/*.test.tsx`): Statistika ağacı (MSW, seed-dən sonrakı sıra) ilə
  kök səhifə `section-shell`-də — breadcrumb "Ana səhifə › Statistika", sol menyuda 10 bənd Figma sırasında, "İnteraktiv statistik məlumat
  bazası" xarici link (`target`, `rel`), "(Kopya)" yoxdur; en-də NSDP sonda; "Kredit təşkilatları"-nda "Maliyyə sektorunun statistikası" açıq və
  cari bənd `aria-current`.
- [X] T014 [P] [US1] Faza 2 səhifəsi (`statistik-bulleten` fikstürü, `<details>` arxivi) şablonda açılır və bütün linkləri saxlayır (FR-004);
  `/az/statistics` catch-all-da `/az/statistika`-ya yönlənir (route testi və ya T001-dəki yoxlama üsulu).

### Implementation

- [X] T015 [US1] `SITE/src/views/cms-page/loader.ts` və `index.tsx`: `statistics` bölməsi `SectionShell` ilə; `plain` layout-da CMS mətni
  `cms-content` ilə (giriş, Maliyyə sektoru, faza 2 səhifələri). Lazım olsa `SITE/src/widgets/section-shell` bölmə konfiqinə `statistics`.
- [X] T016 [US1] `SITE/src/shell/nav.ts`/`nav.test.ts`: Statistika açılan menyuda ağac sırası və menyu bayraqları ilə (mövcud qayda); xarici
  bənd yeni tabda. Footer `NAV_SECTION_TITLES` artıq "Statistika"-nı tanıyır — dəyişiklik yoxdursa test ilə təsdiqlə.
- [ ] T017 [US1] Figma tutuşdurması 1728/744/390: giriş və bir faza 2 səhifəsi (`contracts/ui-contract.md` §1–§2), Edge CDP
  `getBoundingClientRect` (yaddaş `figma-measure-dom`); fərqlər düzəliş və ya spec "Figma-dan qəsdən fərqlər".
- [X] T018 [US1] `ui-kit-review` + senior-front review checklist dəyişən fayllar üzərində (`views/cms-page/*`, `entities/page-node/*`,
  `shell/*`), plan "Frontend Skills Gate"-ə qarşı.
- [X] T019 [US1] `cd SITE && npm run verify` (typecheck T006 qeydinə görə T026/T038-dən sonra tam yaşıl ola bilər — o halda lint + test:run +
  aidiyyəti testlər, tam verify T040-da).

**Checkpoint**: bölmə şablonda, menyu Figma sırasında; fayl səhifələri hələ qrupsuz siyahı.

---

## Phase 4: User Story 2 — Fayl səhifələri (Priority: P1)

**Goal**: Makro, Pul-kredit, Ödəniş: kateqoriya zolağı/menyusu, qruplanmış kartlar, "Yenilənib", "Son yenilənmə", ZIP.

**Independent Test**: üç səhifə üç enlikdə Figma ilə; hər kateqoriya seçilir (JS-siz də); fayl yüklənir; ZIP-də fayl sayı = səhifənin fayl sayı.

### Tests (əvvəl, qırmızı)

- [X] T020 [P] [US2] `SITE/src/features/statistics/model/dates.test.ts`: `(25.05.2026)` suffiksi tarix + təmiz başlıq; `(31.02.2026)` etibarsız →
  başlıq toxunulmaz, `uploadedAt` (Bakı günü); heç biri → `null`; en başlığında tarix yoxdur → `uploadedAt`.
- [X] T021 [P] [US2] `SITE/src/features/statistics/model/groups.test.ts`: `Daşınar əmlak reyestri | Reyestr` → başlıq/çip; ilk görünmə sırası;
  qrupsuz fayllar sonda; hamısı qrupsuz → qrup yoxdur; açar slug (`real-sektor-ve-qiymetler`, təkrarda `-2`); `?group=` naməlum → `null`;
  en → qrup yoxdur; `latest` və `count` seçimdən asılı deyil.
- [X] T022 [P] [US2] `SITE/src/features/statistics/model/zip-entries.test.ts`: ad = kart başlığı + mime/başlıqdan uzantı, qadağan simvollar `_`,
  təkrar ad ` (2)`; limit hesabı (`ZIP_MAX_FILES`, `ZIP_MAX_BYTES`).
- [X] T023 [P] [US2] `SITE/src/shared/lib/xlsx/zip.test.ts`: `store` (method 0) entry-si düzgün CRC/ölçü ilə açılır, mövcud deflate testləri
  dəyişmir.
- [X] T024 [P] [US2] `SITE/src/widgets/statistics-files/statistics-files.test.tsx`: Makro fikstürü ilə 5 qrup başlığı, 9 kart (başlıq, "Yenilənib:
  25.05.2026", XLS nişanı, yeni tabda link), kateqoriya nav-ında 6 link, seçili `aria-current="page"`; `?group=mezenne` → 2 kart; mobil menyu
  `<details>` linkləri; "Son yenilənmə" zolağında uzun tarix, "9 statistik cədvəl · Excel formatında", "Yayım qrafiki" linki (ağacdan),
  ZIP linki; faylsız səhifədə zolaqlar yoxdur; en-də qrup yoxdur.
- [X] T025 [P] [US2] `SITE/src/app/[locale]/(content)/statistics/files/[slug]/route.test.ts` (və `SITE/src/server/statistics-zip.test.ts`): MSW
  ilə 200 + `Content-Type`/`Content-Disposition`, arxivdə N entry; başqa layout-lu slug → 404; faylsız → 404; limit → 413; bir fayl 500 → 502,
  arxiv yox.

### Implementation

- [X] T026 [US2] Qoruma (CLAUDE.md "a new AboutLayoutKind"): `SITE/src/features/about-content/fixtures/statistics-files.html` (redaktorun saxladığı
  forma; bu səhifələrin mətni boşdur → boş və ya tək `<p>`), eyni fayl `ADMIN/src/features/rich-text/fixtures/layouts/statistics-files.html`;
  `EXPECTED_BLOCKS['statistics-files']` (`SITE/src/features/about-content/model/layout-fixtures.test.ts`); `ADMIN/src/features/rich-text/roundtrip.test.ts`
  siyahısı.
- [X] T027 [P] [US2] `SITE/src/features/statistics/model/constants.ts` (`ZIP_MAX_FILES = 60`, `ZIP_MAX_BYTES`, `GROUP_SEPARATOR = '|'`,
  `GROUP_QUERY_PARAM`), `dates.ts`, `groups.ts`, `zip-entries.ts` — T020–T022 yaşıl; `QUERY_PARAM`-a `group` (`SITE/src/shared/constants/query-params.ts`).
- [X] T028 [P] [US2] `SITE/src/shared/lib/xlsx/zip.ts`: `ZipEntry.store?: boolean` (method 0, CRC və ölçülər eyni); T023 yaşıl.
- [X] T029 [P] [US2] `SITE/src/locales/az/statistics.json`, `SITE/src/locales/en/statistics.json` (chrome: kateqoriya etiketi "Hamısı"/"All",
  "Yenilənib: {{date}}", "SON YENİLƏNMƏ", "Son yenilənmə: {{date}}", "{{count}} statistik cədvəl · Excel formatında" (cəm formaları), "Yayım
  qrafiki →", "Hamısını yüklə (ZIP)", nav `aria-label`); namespace `SITE/src/shared/i18n/index.ts`-də.
- [X] T030 [US2] `SITE/src/widgets/about-blocks/constants.ts` + `document-card.tsx`: `statistics` variantı (`ui-contract` §3 kartı: 984 × 78, padding
  24/20, başlıq 17/24, meta sağda "Yenilənib" + `FilePill`, aralıq 20); `document-card.test.tsx`-ə hal.
- [X] T031 [US2] `SITE/src/widgets/statistics-files/`: `category-bar.tsx` (desktop/tablet link zolağı, `ui-contract` §3 rəngləri tokenlərlə),
  mobil `YearMenu` ilə, `file-group.tsx`, `updated-bar.tsx` (ZIP linki `download`), `statistics-files.tsx`, `index.ts`, `constants.ts`; server
  komponentləri, `'use client'` yoxdur. T024 yaşıl.
- [X] T032 [US2] `SITE/src/views/cms-page/loader.ts`: `statistics-files` layout-unda `StatisticsFilesView` (data-model) qurulur — fayllar `attachments`-dən,
  `?group=` `searchParams`-dan (Zod ilə), `scheduleHref` ağacdan (`nodeHref`), `zipHref` `/{locale}/statistics/files/{slug}`; `index.tsx` widget-i
  render edir, CMS mətni yalnız boş deyilsə başlıqdan sonra (FR-007).
- [X] T033 [US2] `SITE/src/server/statistics-zip.ts` (`server-only`: `getPage` → layout yoxlaması → `mediaUpstreamUrl` ilə ardıcıl çəkmə → limitlər →
  `createZip` `store: true`) və `SITE/src/app/[locale]/(content)/statistics/files/[slug]/route.ts` (nazik, `safeDecodeURIComponent`, `logger`,
  `HTTP_STATUS`). T025 yaşıl.
- [X] T034 [US2] Figma tutuşdurması 1728/744/390: Makro (`2910:20936`, `2918:6738`, `2918:7749`), Pul-kredit, Ödəniş — `ui-contract` §3; test
  API üzərində (`npm run local:testcbar`), seed tətbiq olunmayıbsa qruplar MSW fikstürü + proxy ilə (yaddaş `hybrid-fixture-proxy-for-ui-measuring`).
- [X] T035 [US2] `ui-kit-review` + senior-front review checklist (`features/statistics/**`, `widgets/statistics-files/**`, `widgets/about-blocks/document-card.tsx`,
  `server/statistics-zip.ts`, route), plan "Frontend Skills Gate"-ə qarşı.
- [X] T036 [US2] `cd SITE && npm run verify`; `cd ADMIN && npm run verify` (fikstür + roundtrip).

**Checkpoint**: MVP (US1 + US2) hazırdır.

---

## Phase 5: User Story 4 — NSDP, Metodologiya, Reviziya, Maliyyə sektoru (Priority: P2)

**Goal**: dörd kiçik səhifə Figma-dakı kimi.

**Independent Test**: `/en/statistical-data-for-nsdp` 6 kart (XML + XLS), `/az/metodologiya`, `/az/melumatlarin-reviziyasi-siyaseti`,
`/az/maliyye-sektorunun-statistikasi` üç enlikdə Figma ilə.

### Tests (əvvəl, qırmızı)

- [X] T037 [P] [US4] `SITE/src/features/statistics/model/datasets.test.ts`: eyni başlıqlı fayllar bir dataset, sıra XML → XLS → qalanı, tək fayllı
  dataset; `SITE/src/widgets/statistics-files/dataset-card.test.tsx`: başlıq mətndir (link deyil), iki nişan `aria-label`-lı link
  ("XML: …", "XLS: …"); Metodologiya/Reviziya `document-list` kartı `statistics` variantında (PDF/DOC nişanı, "Yenilənib" yoxdur); faylsız və
  mətnsiz səhifə yalnız başlıq.

### Implementation

- [X] T038 [US4] Qoruma: `statistics-datasets.html` fikstürü hər iki komponentdə, `EXPECTED_BLOCKS['statistics-datasets']`, admin roundtrip
  siyahısı (T026 kimi).
- [X] T039 [US4] `SITE/src/features/statistics/model/datasets.ts`, `SITE/src/widgets/statistics-files/dataset-card.tsx` + `datasets.tsx`; loader/view
  `statistics-datasets`; `document-list` statistika səhifələrində `statistics` kart variantı ilə (`views/cms-page`); Maliyyə sektoru `plain`
  (T015). T037 yaşıl.
- [ ] T040 [US4] Figma tutuşdurması (`ui-contract` §4–§6), `ui-kit-review` + senior-front review, `cd SITE && npm run verify` (tam yaşıl —
  `EXPECTED_BLOCKS` bağlanıb), `cd ADMIN && npm run verify`.

---

## Phase 6: User Story 3 — Redaktor iş axını (Priority: P2)

**Goal**: redaktor mövcud admin formasında qrup, sıra və tarixi idarə edir; təlimat yazılıb.

**Independent Test**: test mühitində admin paneldə bir faylın qrupu və sırası dəyişir → saytda nəticə; təlimat addımları təkrarlanır.

- [X] T041 [P] [US3] `SITE/docs/statistics-cms-guide.md` (yeni): hər səhifənin görünüşü (layout cədvəli), qrup adı və `Başlıq | Çip`, sıra =
  qrup və kart sırası, başlıqdakı ` (dd.mm.yyyy)` tarixi, yeni ay faylının əvəzlənməsi, eyni baytların köhnə tarixi saxlaması, ZIP-in nəyi
  əhatə etdiyi, en-də qrupların görünməməsi, gizli giriş mətni (redaktor yazarsa görünür); admin menyu yolu
  `Səhifələr → <səhifə> → Fayllar`.
- [X] T042 [P] [US3] `dokumentasiyalar/statistika-guide.md` (az redaktor təlimatı, mövcud `*-guide.md` formatı ilə).
- [ ] T043 [US3] Test mühitində (seed və deploy-dan sonra) T041 addımlarını icra et: qrup dəyişdir, yeni qrup yaz, sıranı dəyiş, tarixsiz fayl
  yüklə → spec US3 acceptance 1–3; nəticəni `SPEC/quickstart.md`-ə qeyd et.

---

## Phase 7: User Story 5 — Qrafik səhifəsi və köhnə linklər (Priority: P3)

**Goal**: qrafiklər `/statistics/charts`-da, ana səhifə linkləri ora.

**Independent Test**: ana səhifənin bütün "Daha ətraflı" keçidləri və `/statistics/azir` açılır.

- [X] T044 [P] [US5] Test əvvəl: `SITE/src/widgets/home-cards/home-cards.test.tsx` — inflyasiya kartı və dörd panelin `moreHref`-i
  `/{locale}/statistics/charts`; sonra `SITE/src/widgets/home-cards/inflation-card.tsx`, `statistics-panels.tsx` (sabit `STATISTICS_CHARTS_PATH`,
  `SITE/src/shared/constants/` və ya `views/statistics-charts/constants.ts`).
- [X] T045 [P] [US5] `rg "/statistics['\`\"]" SITE/src` — qalan bütün keçidlər (axtarış, footer, sitemap, şərhlər) `/statistics/charts` və ya CMS
  köküdür; `views/azir` "Statistika"ya geri keçidi varsa yoxla.
- [X] T046 [US5] `ui-kit-review` + senior-front review (`widgets/home-cards/*`), `cd SITE && npm run verify`.

---

## Phase 8: Polish & Cross-Cutting

- [X] T047 [P] Root `CLAUDE.md` `web-cbar-new` bölməsinə Statistika maddəsi (spec 061: SectionKey, layout-lar, `Başlıq | Çip`, `uploadedAt`, ZIP
  ünvanı, `/statistics/charts`, seed 0046, deploy sırası).
- [X] T048 [P] `SITE/docs/navigation-cms-guide.md` (Statistika menyu sırası, yeni səhifələr, "(Kopya)"), yaddaş `menu-changes-update-docs`.
- [ ] T049 [P] `/sync-openapi api-cbar` (PageAsset) — yalnız `openapi/`; `/sync-business-logic` (statistika modulu: `new_business_logic.md`,
  `diff_report_logic.md` — `statsDB` hələ də açıq).
- [X] T050 Node 22 ilə `SITE` və `ADMIN` testləri (yaddaş `run-tests-on-node22`); `git diff --stat` ilə gözlənilməz fayl yoxdur.
- [ ] T051 Quickstart §1–§5 tam icra; spec-in SC-001…SC-007 bənd-bənd qeydi `SPEC/quickstart.md`-də; deploydan sonra Grafana-da `spec 061:` NOTICE
  sətirləri (yaddaş `grafana-test-dashboard`).
- [X] T052 Yaddaş: `spec-061-statistics-open.md` (nə qalıb: deploy, spec 062) + `MEMORY.md` sətri.

---

## Dependencies & Execution Order

- **Setup (T001)** → **Foundational (T002–T012)**. T003 T002-nin təsdiqini gözləyir. T007 T001-i gözləyir. T009→T010→T011→T012 ardıcıl.
  T004, T005 paralel; T006 T005-dən sonra.
- **US1 (T013–T019)** Foundational-dan sonra. **US2 (T020–T036)** T006-dan sonra US1 ilə paralel başlaya bilər (fərqli fayllar), amma T032
  T015-in loader dəyişikliyindən sonra.
- **US4 (T037–T040)** US2-nin T030, T031-dən sonra (kart variantı, widget qovluğu).
- **US3 (T041–T043)**: T041–T042 istənilən vaxt; T043 deploydan sonra.
- **US5 (T044–T046)** T007-dən sonra, digər story-lərdən asılı deyil.
- **Polish** bütün story-lərdən sonra.

### Parallel Example: User Story 2

```text
T020 dates.test.ts   T021 groups.test.ts   T022 zip-entries.test.ts   T023 zip.test.ts   T024 widget test   T025 route test
→ T027 model   T028 zip store   T029 locales        (paralel)
→ T030 kart variantı → T031 widget-lər → T032 loader/view → T033 ZIP
```

## Implementation Strategy

1. **MVP = US1 + US2**: Setup + Foundational + T013–T036. Seed və API ilə birlikdə bu, bölmənin şablonunu və ən çox işlədilən üç səhifəni verir.
2. **Sonra US4** (eyni widget-lər), **US5** (kiçik, müstəqil), **US3** (təlimat + deploydan sonra icra).
3. Hər story-dən sonra `verify` və Figma tutuşdurması; MR-lər deploy sırası ilə (admin seed → api-cbar → admin fikstür → sayt).

## Notes

- Faza 2 (spec 062): Bülleten, Kredit, Sığorta, Kapital, Xarici, Yayım qrafiki — bu tasks-da yalnız şablonda açılmaları yoxlanır (T014).
- Seed redaktor datasını yalnız köhnə dəyər tanınanda dəyişir; T010–T011 keçməzsə MR 1 açılmır.
- Commit yalnız istəklə; `specs/` və workspace sənədləri ayrıca commit.
