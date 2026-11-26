# Tasks: Struktur sxemi — koordinatsız düzülüş və blokların açılan departament siyahısı

**Input**: `specs/060-org-chart-auto-layout/`: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

**Tests**:

- Frontend testləri davranış testləridir: rol, `userEvent`, MSW (yaddaş `functional-component-tests`).
- `frontend-standards` TDD tələb edir: test tapşırığı implementasiyadan əvvəl gəlir və əvvəl qırmızı olmalıdır.
- API-lərdə saf funksiyalar xUnit ilə yoxlanır. Bazası olan yollar `dotnet build` + PGlite ilə yoxlanır (yaddaş `pglite-api-testing`).
- Frontend testləri Node 22 ilə də işlədilir (yaddaş `run-tests-on-node22`).
- Vitest PowerShell-dən işlədilir (yaddaş `windows-shell-crlf`).

**Təşkili**:

- Tapşırıqlar user story-lər üzrə qruplaşdırılıb. Hər komponent ayrıca merge request-dir.
- Deploy sırası: `api-cbar-admin` (MR 1) → `api-cbar` (MR 2) → `web-cbar-admin-new` (MR 3) → `web-cbar-new` (MR 4).
- Tapşırıq sırası deploy sırası ilə eyni deyil: sayt (US2, US1) MSW fikstürü ilə əvvəl qurulur. R12 sayəsində o, köhnə API ilə də işləyir.
- Workspace sənədləri və `specs/` ayrıca commit-dir. Commit yalnız istəklə edilir.

**Təsdiqlənmiş qərarlar (2026-11-26)**:

- R6: açıq hal üçün defolt 8/8;
- L7: yan departamentlər;
- R10: `VITE_SITE_URL`;
- R5: Figma-dan qəsdən fərqlər.

**İcra qeydləri (2026-11-26)**:

- `CHART` sabitləri və `ORG_CHART_KIND` `entities/org-chart/constants.ts`-dədir: model onları oxuyur, `entities` isə `widgets`/`features`-dən import edə bilməz (FSD). `features/organization/model/constants.ts` `ORG_CHART_KIND`-i oradan ixrac edir.
- T013 və T021 bir faylda yazılıb: `OC-W/chart-parts.tsx` (kart, blok, sütun). T014-T015 `OC-W/org-chart-chart.tsx`-dədir.
- T019-un testləri `OC-W/org-chart-chart.test.tsx`-dədir. `<summary>`-də Enter/Space-i jsdom emulyasiya etmir, ona görə klaviatura yolu T022-də brauzerdə yoxlanır.
- Figma rəqəmləri 2026-11-26-da yenidən oxunub (layout-rules §Ölçülər): sütun aralığı 6, qruplar arası 5.
- Root `.gitignore` dəyişmədi: `.tmp-*/` artıq `.git/info/exclude`-dadır.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: paralel işlənə bilər (fərqli fayllar, açıq asılılıq yoxdur).
- **[Story]** (spec.md):
  - US1: ziyarətçi bloka klik edib departamentlərini görür (P1);
  - US2: desktop sxemi koordinatsız qurulur və Figma ilə eynidir (P1);
  - US3: redaktor sxemi yalnız ağacla idarə edir (P2).
- **US2 US1-dən əvvəl gəlir.** Açılan siyahı (US1) yalnız axın düzülüşündə (US2) işləyir (spec, US2 "Why this priority"). İkisi də P1-dir,
  MVP ikisidir.

## Yol qısaltmaları

- `ADMIN-API` = `product-rest/api-cbar-admin`.
- `WEB-API` = `product-rest/api-cbar`.
- `ADMIN` = `product-rest/web-cbar-admin-new`.
- `SITE` = `product-rest/web-cbar-new`.
- `OC-E` = `SITE/src/entities/org-chart`.
- `OC-W` = `SITE/src/widgets/org-chart`.
- `OC-A` = `ADMIN/src/features/org-chart`.
- `TMP` = `.tmp-060` (repo-lokal, yaddaş `fork-agents-share-tmp`). Root `.gitignore`-da hələ yoxdur: birinci skriptdən əvvəl
  `.tmp-060/` əlavə olunur.

---

## Phase 1: Setup — spec-first OpenAPI

**Məqsəd**: API kontraktı controller-dən əvvəl təsdiqlənir. `.claude/hooks/spec-first.mjs` yeni route-u bundle-da tapmasa, controller
redaktəsini bloklayır.

- [X] T001 `ADMIN-API/openapi/paths/organization.yaml` və `ADMIN-API/openapi/components/schemas/organization.yaml` faylları
  [contracts/admin-api.md](contracts/admin-api.md) üzrə dəyişir. `/api-endpoint` skill-i ilə:
  - yeni `PUT /organization/chart/order`, `operationId: reorderOrgChartNodes`. Body `OrgChartOrder { parentId: integer|null, ids: integer[] }`,
    cavablar 204/400/404;
  - `OrgChartNodeUpsert`-ə `departmentsOpen: boolean|null`, detail-ə `departmentsOpen: boolean` əlavə olunur;
  - `layout`, `connector` və `PUT /organization/chart/layout` `deprecated: true` olur, təsvirə "spec 060-dan panel çağırmır" yazılır;
  - `# Sync:` sətri yenilənir.

  Lint + bundle (`openapi/README.md`).
- [X] T002 [P] `WEB-API/openapi/components/schemas/organization.yaml` [contracts/public-api.md](contracts/public-api.md) üzrə dəyişir:
  - chart node-a `departmentsOpen: boolean` (required) əlavə olunur;
  - `layout` və `connector` `deprecated: true` olur;
  - `# Sync:` sətri yenilənir.

  Lint + bundle.
- [X] T003 T001–T002-nin diff-i istifadəçiyə göstərilir və spec təsdiqi alınır (`/api-endpoint` addımı). Təsdiqə qədər controller
  tapşırıqlarına (T026–T029) başlanmır.

---

## Phase 2: Foundational — sxem, entity, saytın modeli

**Məqsəd**: bütün story-lərin dayandığı məlumat və model. API hissəsi MR 1/MR 2-yə, sayt hissəsi MR 4-ə düşür.

### Baza və domen

- [X] T004 `ADMIN-API/db/migrations/0045-org-chart-node-details.sql` yazılır ([data-model.md](data-model.md#org_chart_node_details-yeni-migration-0045-org-chart-node-detailssql)):
  - `CREATE TABLE IF NOT EXISTS org_chart_node_details (node_id integer PRIMARY KEY, departments_open boolean NOT NULL DEFAULT false)`;
  - FK `fk_org_chart_node_details_node_id` → `org_chart_nodes(id) ON DELETE CASCADE`. Bu, `DO $$` blokunda,
    `has_table_privilege('org_chart_nodes','REFERENCES')` və `pg_constraint` yoxlaması ilə yazılır (`0016` nümunəsi);
  - `cbar_web_ro`-ya `GRANT SELECT`, rol varsa;
  - İngiliscə başlıq şərhi: niyə yoldaş cədvəl (ALTER yoxdur);
  - `BEGIN`/`COMMIT` yoxdur.

  Fayl adının `WEB-API/db/migrations`-da olmadığı yoxlanır.
- [X] T005 `ADMIN-API/src/Cbar.Domain/Entities/Organization.cs` dəyişir:
  - `OrgChartNodeDetails { int NodeId; bool DepartmentsOpen }` sinfi;
  - `OrgChartNode.Details` (`OrgChartNodeDetails?`);
  - `X/Y/W/H/Connector` şərhlərinə "unused since spec 060, kept for rollback" yazılır.

  `ADMIN-API/src/Cbar.Domain/CbarDbContext.cs`-də:
  - `DbSet<OrgChartNodeDetails> OrgChartNodeDetails`;
  - `ToTable("org_chart_node_details")`, key `NodeId`, `HasOne(d => d.Node)`/`WithOne(n => n.Details)`, `HasForeignKey<OrgChartNodeDetails>(d => d.NodeId)`;
  - sütun adları snake_case, mövcud konvensiya ilə.
- [X] T006 T005-in iki faylı `WEB-API/src/Cbar.Domain/`-a bayt-bayt köçürülür. Hər iki repo-da `diff -r` boş olmalıdır, `dotnet build`
  keçməlidir.
- [X] T007 PGlite: boş bazada `0001…0045` işləyir. `0045` ikinci dəfə xətasız işləyir. `cbar_web_ro` (PGlite-də rol yaradılır)
  `SELECT * FROM org_chart_node_details` edə bilir. Skript `TMP/pglite-0045.mjs`-dədir (yaddaş `pglite-api-testing`).

### Saytın modeli (MR 4, MSW ilə)

- [X] T008 [P] `SITE/src/features/organization/model/schemas.ts`, `orgChartNodeSchema`:
  - `departmentsOpen: z.boolean().default(false)` əlavə olunur;
  - `layout` və `connector` çıxır.

  `OC-W/model.ts` `OrgChartCardData`:
  - `layout` və `connector` çıxır, `departmentsOpen: boolean` əlavə olunur.

  Loader `SITE/src/views/organization/loader.ts` sahəni ötürür.
- [X] T009 [P] `SITE/src/shared/testing/fixtures/organization.ts`: Figma ağacını əks etdirən fikstür yazılır. Test mühitinin 40 kartı,
  FR-017 düzəlişi ilə:
  - 40–43 → valideyn 37, 37 `departmentsOpen: true`;
  - "Kredit təşkilatlarının… bloku" 3 departamentlə;
  - adlar `GET https://api-cbar-test.cbar.az/api/v1/organization/chart?locale=az`-dan götürülür;
  - `layout`/`connector` yoxdur.

  `SITE/src/shared/testing/handlers/organization.ts` yeni fikstürü qaytarır. Köhnə API ilə uyğunluq testi üçün `departmentsOpen`-siz bir
  variant əlavə olunur.
- [X] T010 `OC-W/constants.ts`-ə `CHART` sabitləri yazılır ([contracts/layout-rules.md](contracts/layout-rules.md) §Ölçülər):
  - kart enləri və min. hündürlüklər;
  - sütun eni 68, sütun aralığı 4;
  - baş direktor → blok 10, blok → blok 8;
  - sədr siyahısı: sətir eni 213, aralıq 4, daraq 29, siyahının sədrdən məsafəsi 131;
  - müavin barı 35;
  - yan departament tick-i 5;
  - açılan siyahı: boşluq 8, aralıq 8 (R6);
  - müavinlər sırasının Əliyar yüksəkliyi 80 (966 − 886).

  Hər sabitə Figma node-u və ya nöqtəsi ingiliscə şərhdə yazılır. `WIDE_ROW` silinir, `BRANCH` (ağac görünüşü) qalır.

**Checkpoint**: API sxemi hər iki repo-da qurulur, saytın sxemi və fikstürü hazırdır.

---

## Phase 3: User Story 2 — koordinatsız desktop sxemi, Figma ilə eyni (Priority: P1) 🎯 MVP

**Goal**: desktop sxemi yalnız ağacdan (valideyn, sıra, növ, `departmentsOpen`) qurulur. Bütün aktiv kartlar görünür, bloklar bağlı halda
kartlar və xətlər Figma ilə ±1 px uyğundur (R5 fərqləri istisna).

**Independent Test**: T009 fikstürü ilə 1728 px-də `/az/organization?section=divisions`. Kartların və xətlərin yeri ölçülür, heç bir kartın
koordinatı yoxdur (quickstart §3.4, birinci bənd).

### Tests for User Story 2 (əvvəl qırmızı)

- [X] T011 [P] [US2] `OC-E/model/layout.test.ts` yazılır: `buildChartLayout` T009 fikstürü və kiçik əl ilə qurulmuş ağaclarla.
  - L1–L11-in hər biri: hansı kart hansı sahəyə düşür;
  - sıra `sortOrder`, sonra `id` ilə;
  - kartlar modeldə düz bir dəfə görünür, modelin kart dəsti API-nin kart dəstinə bərabərdir (SC-001);
  - sədr yoxdursa `null`;
  - ikinci kök `extraRoots`-a düşür;
  - departamentləri filtrdən düşən blok `mode: 'plain'`-dir, `departmentsOpen` blok `open`-dır, qalan hal `dropdown`-dur;
  - L7: sonuncu sütun "həmişə açıq" blokla bitəndə `sideJoinsOpenBlock: true`, başqa halda `false`;
  - növ 4/6 olmayan kartda `departmentsOpen: true` nəzərə alınmır;
  - köhnə `buildTree` testləri (`OC-E/model/geometry.test.ts`-dəki) bu fayla köçür.

### Implementation for User Story 2

- [X] T012 [US2] `OC-E/model/layout.ts`:
  - `buildTree` `geometry.ts`-dən köçür;
  - `buildChartLayout(nodes)` [data-model.md](data-model.md#sayt-görünüş-modeli) tipləri ilə yazılır (`ChartCard`, `ChartBlock`,
    `ColumnItem`, `ChartColumn`, `DeputyGroup`, `ChartLayout`);
  - qaydalar layout-rules L1–L11-dir, növlər `ORG_CHART_KIND` sabitlərindən;
  - fayl DOM-suzdur.

  `OC-E/index.ts` ixracları yenilənir. `OC-E/model/geometry.ts` və `geometry.test.ts` silinir. T011 yaşıl olmalıdır.
- [X] T013 [P] [US2] `OC-W/chart-card.tsx` (Server Component):
  - kart stilləri `org-chart-canvas.tsx`-dəki `KIND_CLASS`/`NAME_CLASS`/`ROLE_CLASS`-dan köçür (FR-008: `*`, rənglər, yazı);
  - en və min. hündürlük `CHART`-dandır;
  - `href` varsa `next/link`, yoxdursa `div`;
  - caret buraya düşmür, US1-də blok komponentindədir.
- [X] T014 [US2] Desktop widget-i qurulur, connector-lar CSS seqmentləridir (R1):
  - `OC-W/chart-column.tsx`: baş direktor + alt-alta bloklar, L8, L10, L11;
  - `OC-W/deputy-group.tsx`: L5, L6, L7, bar, uşaq müavinlər, yan departamentlər;
  - `OC-W/org-chart-chart.tsx`: sədr, L2 daraq, L3 "L", L4 bar, `extraRoots`.

  Xət qaydaları:
  - xətlər `before:`/`after:` pseudo-elementləri və ya `aria-hidden` boş elementlərdir;
  - sıraları keçən xətlər grid sıralarını əhatə edir, mətn uzananda onlarla birlikdə uzanır;
  - rəng `text-site-org-line` / `border-site-org-line`, 1 px;
  - sütunlar `items-start`-dır;
  - client JS yoxdur.
- [X] T015 [US2] Enli sxem (FR-009, R13): `org-chart-chart.tsx` wrapper-i `overflow-x-auto`-dur, `tabIndex={0}`, `role="region"`,
  `aria-label={t('chart.label')}`, fokus halqası var. `SITE/src/views/organization/index.tsx` `OrgChartCanvas` əvəzinə `OrgChartChart`
  render edir (`max-desk:hidden` qalır). `OC-W/org-chart-canvas.tsx` silinir, `OC-W/index.ts` ixracları yenilənir.
- [X] T016 [P] [US2] `OC-W/org-chart-chart.test.tsx` yazılır (rol əsaslı):
  - fikstürün bütün kartları render olunur;
  - keçidli kartların `href`-i düzgündür;
  - sxem `region`-dur və fokuslana bilir;
  - `departmentsOpen` olan blokun departamentləri görünür, `<details>` yoxdur;
  - `departmentsOpen`-siz köhnə API fikstürü də render olunur (FR-016).

  `SITE/src/views/sections.test.tsx` canvas-a istinad edirsə, yenilənir. `OrgChartTree` testlərinə toxunulmur (SC-006).
- [X] T017 [US2] Ölçmə: `TMP/measure-chart.mjs` yazılır. Edge CDP, 1728 px, `getBoundingClientRect` (yaddaş `figma-measure-dom`, `measure-before-claiming`).
  - Sayt T009 fikstürünü verən MSW və ya Node proxy ilə işləyir (yaddaş `hybrid-fixture-proxy-for-ui-measuring`).
  - Kartların və xətlərin uc nöqtələri layout-rules §Ölçülər-in Figma nöqtələri ilə tutuşdurulur. Fərq hesabatı R5 yerlərini ayrıca
    göstərir.
  - Əliyar → uşaq müavinlər xəttinin yeri (Figma y 920, layout-rules R5 sətri) burada qərarlaşır və `CHART`-a yazılır.
  - ±1 px-dən böyük fərq düzəldilir və ya istifadəçiyə nəticə ilə göstərilir.
- [X] T018 [US2] Uzun ad (US2-4): fikstürdə bir baş direktorun adı 4 sətrə uzadılır. Ölçmə altındakı blokların və xətlərin aşağı
  düşdüyünü, kəsişmə olmadığını göstərir.

**Checkpoint**: desktop sxemi canvas-sız, Figma ilə eynidir. Bloklar hələ bağlı və açılmır (US1).

---

## Phase 4: User Story 1 — bloka klik departamentləri açır (Priority: P1) 🎯 MVP

**Goal**: departamentləri olan, "həmişə açıq" olmayan blok native `<details>`-dir. Klik, Enter və Space açıb-bağlayır, JS-siz işləyir.
Yalnız öz sütunu uzanır.

**Independent Test**: "Kredit təşkilatlarının… bloku"nu açmaq. 3 departament görünür, "Maliyyə monitorinqi bloku" aşağı düşür, qonşu sütunlar
tərpənmir (quickstart §3.4, ikinci bənd).

### Tests for User Story 1 (əvvəl qırmızı)

- [X] T019 [P] [US1] `OC-W/chart-block.test.tsx` yazılır:
  - `dropdown` blok `group` rollu `<details>`-dir (`summary` blokun adı ilə), açılmamış halda departament keçidləri gizlidir;
  - `userEvent.click(summary)` siyahını açır, ikinci klik bağlayır;
  - `summary` içində keçid yoxdur (FR-006);
  - departament keçidləri doğru `href`-lidir;
  - iki blok müstəqil açılır, `name` atributu yoxdur;
  - `plain` blok keçid və ya sadə kartdır, `<details>` yoxdur;
  - caret `aria-hidden`-dır.

### Implementation for User Story 1

- [X] T020 [US1] R6 ölçüsü: istifadəçidən "Kredit təşkilatlarının… bloku"nun açıq halının Figma ekran şəkli istənilir. Blokdan siyahıya
  boşluq, departament kartlarının aralığı və eni ölçülür. Fərq çıxarsa, yalnız `CHART.dropdown*` sabitləri dəyişir. Bridge-dən
  `1965:60690` oxunmur (yaddaş `spec-060-org-chart-open`).
- [X] T021 [US1] `OC-W/chart-block.tsx` yazılır:
  - `mode: 'dropdown'` → `<details className="group">`. `<summary>` blok kartıdır (`list-none`, `[&::-webkit-details-marker]:hidden`,
    fokus halqası). Caret `CaretDownIcon` (`@cbar/lib-react-ui-kit/icons`) `group-open:rotate-180` ilə çevrilir. Departamentlər
    `<ul>`-dur, `CHART.dropdownGap`/`dropdownItemGap` ilə;
  - `mode: 'open'` → kart keçiddir, altında departament `<ul>`-u var, caret yoxdur;
  - `mode: 'plain'` → `ChartCard`.

  `chart-column.tsx` blokları bununla render edir. T019 yaşıl olmalıdır.
- [X] T022 [US1] Ölçmə `TMP/measure-chart.mjs`-ə əlavə olunur (SC-003):
  - `dropdown` bloklarının hər açıq/bağlı birləşməsində (2ⁿ, CDP ilə `details.open`) kart düzbucaqlılarının kəsişmədiyi yoxlanır;
  - açılan blokun qonşu sütunlarının `x/y`-i dəyişmir;
  - JS söndürülmüş Edge-də (`Emulation.setScriptExecutionDisabled`) klik açıb-bağlayır (SC-005);
  - Tab + Enter/Space işləyir.

### Review və verify (SITE, MR 4)

- [X] T023 [US1] `ui-kit-review` + senior-front review checklist dəyişən fayllar üzərində işlədilir: `OC-E/model/layout.ts`, `OC-W/*.tsx`,
  `views/organization/index.tsx`, `schemas.ts`. Yoxlama plan.md "Frontend Skills Gate"-ə qarşıdır:
  - `'use client'` yoxdur;
  - magic number yoxdur;
  - summary-də iç-içə interaktiv element yoxdur;
  - semantik rənglər işlənib.

  Tapıntılar düzəldilir.
- [X] T024 [US1] `SITE`-də `npm run verify`, sonra Node 22 ilə `npm run test:run`. `prettier --write` işlədilmir (yaddaş
  `no-prettier-write-web-cbar-new`). Verify-ın çıxışı tam oxunur, `tail` ilə yox.

**Checkpoint**: MVP (US2 + US1) saytda işləyir, köhnə API ilə də.

---

## Phase 5: User Story 3 — redaktor sxemi yalnız ağacla idarə edir (Priority: P2)

**Goal**: canvas redaktoru yoxdur. Redaktor qardaşların sırasını dialoqla dəyişir, blok və qrup üçün "Departamentlər" seçimini edir,
"Saytda bax" ilə sayta keçir.

**Independent Test**: paneldə blok 37-nin departamentlərinin sırasını dəyişmək, bloku "həmişə açıq" etmək. Saytda sıra və görünüş dəyişir,
koordinat sahəsi yoxdur (quickstart §4, §2).

### Admin API (MR 1)

- [X] T025 [P] [US3] `ADMIN-API/tests/Cbar.AdminApi.Tests/OrgChartRulesTests.cs` yazılır: `OrgChartController.ValidateDepartmentsOpen(short kind, bool? value)`
  (`internal static`):
  - növ 4/6 + `true` → null;
  - növ 1/2/3/5 + `true` → mesaj;
  - istənilən növ + `false`/`null` → null.

  `ContentSupport.InvalidOrder`-in testi yoxdursa, burada əlavə olunur: əskik, artıq, təkrar id. Əvvəl qırmızı.
- [X] T026 [US3] `ADMIN-API/src/Cbar.AdminApi/Controllers/OrgChartController.cs` dəyişir:
  - `OrgChartNodeUpsertDto`-ya `bool? DepartmentsOpen` (sonuncu parametr) əlavə olunur;
  - `ValidateAsync` `ValidateDepartmentsOpen`-i çağırır;
  - `Apply` sətri data-model qaydası ilə yaradır və ya yeniləyir: `true` olanda və ya sətir varsa; `null` → toxunulmur;
  - `WithDetails` `.Include(n => n.Details)` edir;
  - `ToDetailDto`-ya `DepartmentsOpen = n.Details?.DepartmentsOpen ?? false` əlavə olunur;
  - `Delete` details sətrini də silir.

  T025 yaşıl olmalıdır.
- [X] T027 [US3] Eyni controller-ə `[HttpPut("order")] [RequirePermission(Permissions.Organization.Update)] Reorder(OrgChartOrderDto dto)`
  əlavə olunur. `record OrgChartOrderDto(int? ParentId, List<int> Ids)`.
  - `ParentId` var, amma kart tapılmır → `NotFound()`;
  - uşaqlar (`ParentId == dto.ParentId`, deaktivlər də) `ContentSupport.InvalidOrder` ilə yoxlanır → `BadRequestProblem`;
  - `SortOrder = i + 1`;
  - `audit.Log("org_chart_nodes.reorder", "org_chart_node", dto.ParentId ?? 0, before: new { ids }, after: dto)`;
  - cavab 204.

  `UpdateLayout`-a `[Obsolete]` qoyulmur (build xəbərdarlığı yaratmasın). XML şərhinə "deprecated since spec 060" yazılır.
- [X] T028 [US3] `ADMIN-API`-də `dotnet build` + `dotnet test CbarAdminApi.slnx`. PGlite + socket ilə real SQL yoxlanır (quickstart §1):
  - `order`: 204/400/404;
  - `departmentsOpen`: saxlanır, `null` dəyəri saxlayır, baş direktorda 400;
  - silmə details sətrini də silir;
  - `audit_log` qeydləri yazılır.

  `.claude/skills/sync-openapi/scripts/route-diff.mjs` fərq göstərmir.

### Public API (MR 2)

- [X] T029 [US3] `WEB-API/src/Cbar.WebApi/Controllers/OrganizationController.cs` `GetChart` dəyişir:
  - proyeksiyaya `DepartmentsOpen = n.Details != null && n.Details.DepartmentsOpen` əlavə olunur;
  - cavaba `departmentsOpen = (r.Kind == 4 || r.Kind == 6) && r.DepartmentsOpen` yazılır, sabitlərlə, magic number olmadan;
  - XML şərhi yenilənir;
  - `layout`/`connector` qalır.

  `dotnet build` + `dotnet test CbarWebApi.slnx`. PGlite-də `cbar_web_ro` ilə endpoint çağırılır. `route-diff.mjs` təmizdir.

### Panel (MR 3)

- [X] T030 [P] [US3] `ADMIN/src/features/org-chart/org-chart.test.tsx` yenilənir (əvvəl qırmızı):
  - canvas, koordinat sahələri, "canvas-da yoxdur" nişanı və "Sıra" sahəsi yoxdur;
  - ən azı iki uşağı olan kartda "Sıranı dəyiş" dialoq açır;
  - hərəkət `PUT /organization/chart/order`-u `{ parentId, ids }` ilə çağırır;
  - MSW 500 → xəta toast-u, sıra geri qayıdır (US3-5);
  - blok formunda "Departamentlər" radio-su var və `departmentsOpen` göndərir, baş direktor formunda yoxdur;
  - redaktədə saxlanmış `sortOrder` geri göndərilir;
  - valideyn dəyişəndə `sortOrder` yeni qardaşların `max + 1`-idir;
  - "Saytda bax" `VITE_SITE_URL/az/organization?section=divisions`-a `target="_blank"` ilə gedir, dəyişən boşdursa görünmür.
- [X] T031 [P] [US3] `ADMIN/src/shared/testing/fixtures/org-chart.ts` və `handlers/org-chart.ts`:
  - `layout`/`connector` çıxır, `departmentsOpen` əlavə olunur;
  - `PUT /organization/chart/order` handler-i real kontrakta uyğundur: 204, səhv `ids` → 400 problem+json.
- [X] T032 [US3] `OC-A/model/schemas.ts`: `layout`/`connector` çıxır, `departmentsOpen: z.boolean().default(false)` əlavə olunur.
  `OC-A/api/org-chart.service.ts`:
  - `saveLayout` çıxır;
  - `reorder(parentId, ids)` → `apiClient.put('/organization/chart/order', …)` əlavə olunur;
  - başlıq şərhi yenilənir.

  `OC-A/hooks/use-org-chart.ts`-ə `useReorderOrgChart` əlavə olunur (invalidate `organization.chart`).
- [X] T033 [US3] Silinənlər: `OC-A/components/canvas-editor.tsx`, `OC-A/model/geometry.ts`, `geometry.test.ts`, `layout.ts`. Bunlara bağlı
  sabitlər `OC-A/model/constants.ts`-dən çıxır. `ADMIN/src/pages/org-chart/index.tsx`-dən `CanvasEditor` və `selectedId` canvas məntiqi
  çıxır.
- [X] T034 [US3] `OC-A/components/node-list.tsx`:
  - `notPlaced` nişanı çıxır;
  - ən azı iki uşağı olan kartda "Sıranı dəyiş" `IconButton` (`aria-label` `chart.reorder` + ad);
  - siyahının başında köklər üçün eyni düymə.

  Düymə `features/crud/components/reorder-dialog.tsx`-i açır: `load` = keşdən həmin valideynin uşaqları, `save` = `reorder`, `getLabel` =
  `nodeTitle`. Dialoq mövcud `onError` geri qaytarmasını işlədir.
- [X] T035 [US3] `OC-A/components/node-form-dialog.tsx`:
  - "Sıra" sahəsi və `sortOrderInvalid` validasiyası çıxır;
  - `sortOrder` data-model §Panel qaydası ilə hesablanır;
  - növ 4 və 6-da "Departamentlər" `RadioGroup` (`@cbar/lib-react-ui-kit/radio-group`, `menu-visibility-card.tsx` nümunəsi): "Açılan
    siyahı" / "Həmişə açıq";
  - başqa növdə `departmentsOpen: false` göndərilir;
  - server xətası sahəsinə düşür.
- [X] T036 [US3] "Saytda bax" (R10):
  - `VITE_SITE_URL` `.env.development` (`http://localhost:3001`), `.env.dev`, `.env.test` və `.env.production`. Test və prod saytının hostu
    `SITE/.ci-cd/test.yaml` və `SITE/.ci-cd/prod.yaml`-dan götürülür, yoxdursa `# TODO(devops)` ilə boş qalır, və `.env.example`-a yazılır;
  - `ADMIN/src/vite-env.d.ts` tipi yenilənir;
  - `ADMIN/src/pages/org-chart/index.tsx` `PageHeader`-də `Button asChild` + `<a target="_blank" rel="noopener">` göstərir;
  - dəyişən boşdursa, keçid render olunmur.

  Ünvan `shared/constants`-da sabitdir.
- [X] T037 [P] [US3] `ADMIN/src/locales/az/organization.json` və `en/organization.json`:
  - yeni açarlar: `chart.reorder`, `chart.reorderRoots`, `chart.viewOnSite`, `chart.form.departments`, `chart.form.departmentsDropdown`,
    `chart.form.departmentsOpen`;
  - `chart.notPlaced`, canvas və `sortOrder` açarları silinir.

  `npm run check:i18n` keçməlidir.

### Review və verify (ADMIN, MR 3)

- [X] T038 [US3] `ui-kit-review` + senior-front review checklist dəyişən fayllar üzərində işlədilir: `OC-A/**`, `pages/org-chart/index.tsx`.
  plan.md gate-ə qarşı yoxlanır:
  - ikon düymələrində `aria-label` var;
  - kit subpath importları işlənib;
  - yeni sıra komponenti yazılmayıb;
  - token yaddaşa yazılmır;
  - `React.lazy` yeni import-u varsa, `chunk-reload` ilə bükülüb.

  Tapıntılar düzəldilir.
- [X] T039 [US3] `ADMIN`-də `npm run verify`, sonra Node 22 ilə `npm run test:run`. Lockfile dəyişərsə, npm 10 ilə (yaddaş `npm-corporate-ca`).

**Checkpoint**: dörd komponent hazırdır, deploya gedə bilər (quickstart §6).

---

## Phase 5b: User Story 4 — paneldə sxem (Priority: P2, əlavə 2026-11-26)

**Goal**: panelin "Struktur sxemi" səhifəsində "Siyahı | Sxem" görünüşləri; sxem saytın desktop düzülüşü ilə eynidir, saytın süzgəci və
AZ/EN seçimi ilə; karta klik redaktə formunu açır (FR-018–FR-022).

- [X] T045 [US4] Düzülüş kodu panelə köçürülür, bayt-bayt: `SITE/src/entities/org-chart/constants.ts` → `OC-A/chart/constants.ts`,
  `SITE/src/entities/org-chart/model/layout.ts` → `OC-A/chart/model/layout.ts`. Hər iki komponentə `scripts/check-chart-layout.mjs`
  (`check-layout-fixtures.mjs` nümunəsi: qonşu komponent yoxdursa ötürülür) və `verify`-ə `check:chart-layout` əlavə olunur.
- [X] T046 [US4] Rənglər: `ADMIN/src/index.css`-də route B blokundan sonra `--org-*` tokenləri (saytın `--site-org-*` dəyərləri, D-2) və
  `@theme inline`. Sxem açıq fonda qalır (FR-022).
- [X] T047 [P] [US4] `OC-A/model/chart-view.ts` (saf funksiya, test əvvəl): admin node-ları + staff/şöbə siyahıları + dil → `OrgChartInput[]`,
  saytın süzgəci (FR-020). `chart-view.test.ts`.
- [X] T048 [US4] `OC-A/components/chart-preview.tsx` + `chart-preview-parts.tsx`: saytın `org-chart-chart.tsx` / `chart-parts.tsx`
  render-i, keçid əvəzinə redaktə düyməsi (FR-021), açılan blok native `<details>`, sürüşən region.
- [X] T049 [US4] Səhifə: `orgChartRoute`-a `validateSearch` (`view: list|chart`, `locale: az|en`), kit `Tabs` "Siyahı | Sxem", dil seçimi,
  klik → mövcud `NodeFormDialog`. Loading / empty / error vəziyyətləri.
- [X] T050 [P] [US4] `locales/{az,en}/organization.json` açarları; `check:i18n`.
- [X] T051 [US4] `org-chart.test.tsx`: sxem görünüşü, süzgəc (deaktiv kart görünmür), EN, karta klik formu açır, saxlamadan sonra sxem
  yenilənir, görünüş ünvandan bərpa olunur.
- [X] T052 [US4] `ui-kit-review` + senior-front review; `ADMIN` və `SITE` `npm run verify`, Node 22 ilə testlər.
- [X] T053 [US4] Sənədlər: `dokumentasiyalar/struktur-sxemi-guide.md` (§3 "Sxem" görünüşü), root `CLAUDE.md` maddəsi, `business_logic`
  §5.6a panel bəndi.

---

## Phase 6: Polish & Cross-Cutting

- [X] T040 [P] `dokumentasiyalar/struktur-sxemi-guide.md`:
  - canvas bölməsi çıxır;
  - əlavə olunur: düzülüşün ağacdan necə çıxdığı (L1–L11 redaktor dilində), "Sıranı dəyiş", "Departamentlər: açılan siyahı / həmişə
    açıq", "Saytda bax";
  - əlavə olunur: Figma-da olmayan quruluşun redaktordan həll olunmadığı (spec Assumptions).

  `dokumentasiyalar/README.md`-də canvas qeydi yenilənir. Menyu yolu dəyişmir (yaddaş `menu-changes-update-docs`).
- [X] T041 [P] `SITE/CLAUDE.md` və `ADMIN/CLAUDE.md`-də struktur sxemi haqqında canvas qeydi varsa yenilənir. Root `CLAUDE.md` `web-cbar-new`
  bölməsinə spec 060 üçün bir maddə əlavə olunur: desktop sxemi ağacdan, `layout-rules.md`, `departmentsOpen`, `0045`, deploy sırası.
- [X] T042 `/sync-openapi` (`api-cbar`, `api-cbar-admin`, `organization`) və `/sync-business-logic organization` işlədilir. Nəticə
  yoxlanır.
- [ ] T043 Deploydan sonra test mühiti (quickstart §5): redaktor 40–43-ün valideynini 37 edir, 37-ni "həmişə açıq" edir. Sonra
  `measure/measure-chart.mjs <test saytının ünvanı>` test saytına qarşı işlədilir (T017-dən sonra spec qovluğunda saxlanır, `measure/report-2026-11-26.md` — lokal nəticə) (`npm run local:testcbar` və ya test hostu). Grafana-da restart və log yoxlanır.
- [ ] T044 Prod yoxlaması (quickstart §5): `GET {prod api-cbar}/api/v1/organization/chart?locale=az`.
  - boşdursa, heç nə lazım deyil;
  - doludursa, düzəliş redaktora tapşırılır, siyahı data-model §FR-017-dədir.

  Prod hostu `TODO(devops)`-dursa, istifadəçidən soruşulur.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1** (T001–T003): heç nədən asılı deyil. API controller tapşırıqlarını (T026–T029) bloklayır.
- **Phase 2**: T004 → T005 → T006 → T007. T008–T010 Phase 1-dən asılı deyil, T001–T007 ilə paralel gedə bilər.
- **US2 (Phase 3)**: T008–T010-dan asılıdır.
- **US1 (Phase 4)**: US2-dən (T012, T014) asılıdır.
- **US3 (Phase 5)**:
  - API hissəsi (T025–T029): T003 və T004–T007-dən asılıdır;
  - panel hissəsi (T030–T039): T032 kontraktı üçün T001-dən asılıdır, saytdan asılı deyil.
- **Polish**: T040–T042 hər story-dən sonra. T043–T044 deploydan sonra.

### User Story Dependencies

- US2 → US1: açılan siyahı axın düzülüşünə dayanır.
- US3 saytdan müstəqildir. Saytın "həmişə açıq" görünüşü (L10) US2/US1-də fikstürlə qurulur, real dəyəri US3-ün API-si verir.

### Within Each User Story

Testlər (qırmızı) → model → komponentlər → ölçmə → review → verify.

### Parallel Opportunities

- T001 ‖ T002; T008 ‖ T009; T011 ‖ T013; T016 ‖ T019.
- T025 ‖ T030 ‖ T031 ‖ T037. API (MR 1/2) və panel (MR 3) iki ayrı icraçıda paralel gedə bilər.
- T040 ‖ T041.

## Parallel Example: User Story 3

```text
İcraçı A (API):   T025 → T026 → T027 → T028 → T029
İcraçı B (panel): T030 + T031 + T037 → T032 → T033 → T034 → T035 → T036 → T038 → T039
```

## Implementation Strategy

### MVP (US2 + US1)

1. Phase 1 + Phase 2.
2. US2: düzülüş, ölçmə (T017).
3. US1: açılan siyahı, R6 ölçüsü (T020), SC-003/SC-005 ölçməsi.
4. Sayt köhnə API ilə də işləyir (R12). Blok 37 "həmişə açıq" olana qədər bütün bloklar açılan siyahıdır.

### Incremental Delivery

1. MR 1 (`api-cbar-admin`) → MR 2 (`api-cbar`) deploy olunur, sayt dəyişmir.
2. MR 3 (panel): redaktor sıra və seçimi edə bilir.
3. MR 4 (sayt): yeni sxem. Sonra T043 məlumat düzəlişi və ölçmə.

## Notes

- `Cbar.Domain` iki nüsxədə bayt-bayt eynidir (T006). Hər entity dəyişikliyində `diff -r`.
- `ALTER TABLE` yoxdur. Migration adı iki repo üzrə unikaldır.
- Yeni kod şərhləri ingiliscədir. Dəyişən faylda azərbaycanca şərhlər də çevrilir (yaddaş `code-comments-english`). Bu,
  `OC-W/org-chart-tree.tsx` kimi toxunulmayan fayllara aid deyil.
- Figma bridge-dən PNG və ya böyük node oxunmur (yaddaş `figma-bridge-no-png-large`).
- Ölçmə skriptləri `TMP/`-dədir, commit olunmur.
