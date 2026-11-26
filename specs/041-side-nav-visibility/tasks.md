# Tasks: "Sol menyuda göstər" — səhifəni yalnız bölmənin sol menyusundan gizlətmək

**Input**: `specs/041-side-nav-visibility/` — plan.md, spec.md, research.md (R1–R10), data-model.md, contracts/api.md, contracts/ui.md, quickstart.md

**Tests**: hər iki frontendin merge şərti `npm run verify`-dır (Vitest + MSW). Ona görə test tapşırıqları da var. Testlər istifadəçi
davranışını yoxlayır: rol, `userEvent`, MSW. Mock assert yoxdur. API-lərdə test layihəsi yoxdur. Onların yoxlaması `dotnet build` +
PGlite ilə real SQL + endpoint çağırışıdır (konstitusiya VIII.1).

**Organization**: dörd upstream repo, dörd MR. Faza 2 API-ləri və kontraktı qurur, bütün hekayələr ondan asılıdır. US1+US2 sayt,
US3 paneldir. Faza 2-nin T001–T003-ü təsdiqlənəndən sonra US1/US2 və US3 paralel gedə bilər, çünki MSW kontraktı
`contracts/api.md`-dəndir.

Yollar repo kökünə nisbidir. Qısaltmalar: `ADM` = `product-rest/api-cbar-admin`, `WEB` = `product-rest/api-cbar`,
`SITE` = `product-rest/web-cbar-new`, `PNL` = `product-rest/web-cbar-admin-new`.

Ümumi qaydalar (hər tapşırıqda):
- Kod şərhləri ingiliscə yazılır. Toxunulan faylda azərbaycanca şərhlər də ingiliscəyə çevrilir.
- Magic number yoxdur (spec 032).
- AZ hərfli fayllar yalnız Edit/Write ilə yazılır. `sed -i` və shell redirect işlədilmir (CRLF, UTF-8).
- `SITE`-də `prettier --write` işlədilmir.

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Setup

**Purpose**: başlanğıc vəziyyəti qeyd etmək ki, SC-005 (heç bir menyu öz-özünə dəyişmir) sonra tutuşdurula bilsin.

- [X] T001 Hər iki frontenddə `npm run verify`-ı dəyişiklikdən əvvəl işlədin (`SITE`, `PNL`), yaşıl olduğunu qeyd edin. Qırmızıdırsa səbəbi bu feature-dan əvvəl yazılsın. `ADM/db/migrations/` və `WEB/db/migrations/`-da `0024-*` adlı fayl olmadığını yoxlayın

---

## Phase 2: Foundational (kontrakt + iki API)

**Purpose**: bayrağın saxlanması və hər iki API-dən qaytarılması. Bütün hekayələri bloklayır.

**⚠️ CRITICAL**: T002–T003 (spec-first) istifadəçi təsdiqindən əvvəl heç bir controller dəyişmir (`/api-endpoint` axını).

### Kontrakt (spec-first)

- [X] T002 [P] `WEB/openapi/components/schemas/pages.yaml` `PageNode`-a `showInSideNav: boolean` əlavə edin: `required`-ə daxil, təsvir `contracts/api.md`-dəndir. `openapi.yaml` başındakı `# Sync:` sətrinə toxunmayın. `cd WEB/openapi && npm run lint && npm run bundle`
- [X] T003 [P] `ADM/openapi/components/schemas/pages.yaml`: `PageFlags`-a `showInSideNav: boolean` əlavə edin (`required` + təsvir). `PageFlagsInput`-a `showInSideNav: { type: [boolean, 'null'] }` və istisnanın təsviri (`contracts/api.md`), ümumi təsvirə "`showInSideNav` is the exception" cümləsi. `cd ADM/openapi && npm run lint && npm run bundle`
- [X] T004 `node .claude/skills/sync-openapi/scripts/route-diff.mjs` işlədin (marşrut fərqi olmamalıdır). T002–T003 diff-ini istifadəçiyə göstərin və **təsdiq gözləyin**

### api-cbar-admin

- [X] T005 `ADM/db/migrations/0024-page-details.sql` yaradın, `0017-press-release-asset-details.sql` nümunəsi ilə: başlıq şərhi (niyə yoldaş cədvəl, sətir yoxdursa görünür, backfill yoxdur), `CREATE TABLE IF NOT EXISTS page_details (page_id integer PRIMARY KEY, show_in_side_nav boolean NOT NULL DEFAULT true)`, FK `fk_page_details_page_id` → `pages(id) ON DELETE CASCADE` yalnız `has_table_privilege('pages','REFERENCES')` olanda və constraint yoxdursa, `cbar_web_ro` varsa `GRANT SELECT`. `BEGIN/COMMIT` yazılmır
- [X] T006 `ADM/src/Cbar.Domain/Entities/Content.cs`: `Page`-ə `public PageDetail? Detail { get; set; }`, `Page`-dən sonra `public class PageDetail { public int PageId { get; set; } public bool ShowInSideNav { get; set; } = true; }`, şərhdə miqrasiyaya istinad
- [X] T007 `ADM/src/Cbar.Domain/CbarDbContext.cs`: `DbSet<PageDetail> PageDetails`. `b.Entity<Page>` daxilində `e.HasOne(x => x.Detail).WithOne().HasForeignKey<PageDetail>(d => d.PageId).OnDelete(DeleteBehavior.Cascade)`. Ayrıca `b.Entity<PageDetail>`: `ToTable("page_details")`, `HasKey(x => x.PageId)`, `Property(x => x.PageId).ValueGeneratedNever()`, `Property(x => x.ShowInSideNav).HasColumnName("show_in_side_nav")`, əgər snake_case konvensiyası avtomatik deyilsə (`PressReleaseAssetDetail` konfiqurasiyası ilə tutuşdurun)
- [X] T008 `ADM/src/Cbar.AdminApi/Controllers/PagesController.cs`, DTO və oxuma: `PageFlagsDto`-nun sonuna `bool? ShowInSideNav = null`. `Tree` proyeksiyasında `new PageFlagsDto(..., p.Collapsed, p.Detail == null || p.Detail.ShowInSideNav)`. `ToDetailDto`-da eyni ifadə. `Get` və `Update`-də `.Include(p => p.Detail)`
- [X] T009 `ADM/src/Cbar.AdminApi/Controllers/PagesController.cs` `ApplySettings`, yazma (research R4, R5): `f.ShowInSideNav is { } side` olanda, `side == false` və ya `entity.Detail != null` olarsa `entity.Detail ??= new PageDetail(); entity.Detail.ShowInSideNav = side;`. `null` olanda heç nə etmir. Create zamanı `PageId` naviqasiya ilə dolur. `ApplySettings`-in doc-comment-ini istisna ilə yeniləyin
- [X] T010 `cd ADM && dotnet build` (0 xəta, yeni xəbərdarlıq yoxdur)

### api-cbar

- [X] T011 `ADM/src/Cbar.Domain`-ı `WEB/src/Cbar.Domain`-a köçürün (yalnız T006–T007 faylları), sonra `diff -r WEB/src/Cbar.Domain ADM/src/Cbar.Domain` boş olmalıdır
- [X] T012 `WEB/src/Cbar.WebApi/Controllers/PagesController.cs`: `record PageNode(int Id, string Title, string Slug, string? NavUrl, bool ShowInSideNav, List<PageNode> Children)`. Proyeksiyada `ShowInSideNav = p.Detail == null || p.Detail.ShowInSideNav`, iki `new PageNode(...)` çağırışında ötürülür. Süzgəc şərtləri dəyişmir. `GetTree` summary-sinə bir cümlə: bayraq süzgəc deyil, sahədir (spec 041)
- [X] T013 `cd WEB && dotnet build`
- [X] T014 Real SQL yoxlaması (`quickstart.md` §2, PGlite + socket, admin API əvvəl): miqrasiya bir dəfə tətbiq olunur və ikinci boot-da atlanır. `PUT` `showInSideNav:false` → sətir yaranır, `audit_log`-da `pages.update`. `flags`-lı, amma sahəsiz `PUT` → dəyər qalır. `true` → sətir `true`. api-cbar `GET /pages/tree` `cbar_web_ro` ilə → səhifə ağacda, `showInSideNav:false`, uşaqlar yerində. Soft-delete → xəta yoxdur. Nəticələri tasks.md-nin sonuna "Yoxlama qeydləri" kimi yazın

**Checkpoint**: iki API bayrağı saxlayır və qaytarır. Saytda və paneldə hələ dəyişiklik görünmür.

---

## Phase 3: User Story 1 — Redaktor bəndi yalnız sol menyudan çıxarır (Priority: P1) 🎯 MVP

**Goal**: `showInSideNav:false` olan bənd və onun alt bəndləri hər iki sol menyudan çıxır, üst menyu, footer və breadcrumb dəyişmir (FR-007, FR-008, FR-010–FR-012).

**Independent Test**: MSW ağacında Media altındakı bir node `showInSideNav:false` olsun. Bölmənin başqa səhifəsini render edin: bənd sol menyuda yoxdur, mega menyuda var, uşaqları kökə qalxmayıb.

### Tests for User Story 1

- [X] T015 [P] [US1] `SITE/src/entities/page-node/lib/tree.test.ts`: `isInSideNav` üçün testlər. Sahə yoxdur → görünür. `true` → görünür. `false` + `open`-da yoxdur → gizli. `false` + `open`-da var → görünür
- [X] T016 [P] [US1] `SITE/src/widgets/section-shell/model.test.ts`: `buildSectionShell`. Gizli uşaq `nav`-da yoxdur, qardaşların sırası eynidir. Gizli bəndin uşaqları heç bir yerdə yoxdur. Breadcrumb dəyişmir. Tədbirlər qaydası ilə birlikdə işləyir. Kopya kökündə də işləyir (`contracts/ui.md` 1, 4, 5, 6)
- [X] T017 [P] [US1] `SITE/src/widgets/section-sidebar/section-sidebar.test.tsx`: köhnə görünüşlü ağac. Gizli bəndin linki `getByRole('complementary', { name: 'Bölmə naviqasiyası' })` daxilində yoxdur, bölmə başlığı var
- [X] T018 [P] [US1] `SITE/src/shell/nav.test.ts` və `SITE/src/shell/site-footer.test.tsx`: gizli node mega menyu modelində (`buildNavSections`) və `footerSections`-da yerindədir (FR-007 reqressiya)

### Implementation for User Story 1

- [X] T019 [US1] `SITE/src/entities/page-node/model/schemas.ts`: `PageNode`-a `showInSideNav?: boolean` (doc-comment: spec 041, yoxdursa görünür), sxemdə `showInSideNav: z.boolean().optional()`. Faylın azərbaycanca şərhləri ingiliscəyə çevrilir
- [X] T020 [US1] `SITE/src/entities/page-node/lib/tree.ts`: `export function isInSideNav(node: PageNode, open: ReadonlySet<number>): boolean`, yəni `node.showInSideNav !== false || open.has(node.id)`. Doc-comment FR-009-a istinad edir. `SITE/src/entities/page-node/index.ts`-dən export edin
- [X] T021 [US1] `SITE/src/widgets/section-shell/model.ts`: `buildSectionShell`-də `navRoot.children` və `toNavItem` daxilində `node.children` `isInSideNav(child, open)` ilə süzülür, sonra map olunur. `hideChildren` (Tədbirlər) dəyişmir
- [X] T022 [US1] `SITE/src/widgets/section-sidebar/section-sidebar.tsx`: `renderLevel` `items`-i `isInSideNav(node, chainIds)` ilə süzür. Boş siyahı qaydası (`items.length === 0`) süzgəcdən sonra yoxlanılır
- [X] T023 [P] [US1] `SITE/src/shared/testing/fixtures/media-section.ts` (və ya `about.ts`): testlər üçün bir `showInSideNav:false` node və onun uşağı. `SITE/src/shared/testing/handlers/pages.ts`-in kontraktı `contracts/api.md` nümunəsinə uyğun gəlməlidir
- [X] T024 [US1] `cd SITE && npm run verify`. Node 22 ilə: `npx -y node@22 node_modules/vitest/vitest.mjs run src/entities/page-node src/widgets/section-shell src/widgets/section-sidebar src/shell`

**Checkpoint**: sayt bayrağa əməl edir, bayraq olmayan ağacda hər şey əvvəlki kimidir (SC-005).

---

## Phase 4: User Story 2 — Ziyarətçi gizli səhifənin özündə yerini itirmir (Priority: P1)

**Goal**: açıq səhifə gizli bəndin özü və ya alt ağacındadırsa, bənd və zəncir sol menyuda adi qaydada görünür (FR-009).

**Independent Test**: gizli node-un özünü, sonra uşağını cari səhifə kimi render edin: sol menyuda bənd aktivdir (`aria-current="page"`), breadcrumb tam yoldur.

US1-in T020–T022 kodu bunu artıq təmin edir (`open.has(node.id)`). Bu faza davranışı testlə kilidləyir və view səviyyəsində yoxlayır.

- [X] T025 [P] [US2] `SITE/src/widgets/section-shell/model.test.ts`: cari səhifə gizli node-dur → `nav`-da `current:true`. Cari səhifə gizli node-un uşağıdır → gizli node `open:true`, uşaq `current:true`. Breadcrumb "Ana səhifə › Media › Gizli › Uşaq". Başqa səhifəyə keçid → gizli node yenə yoxdur (US2.1–US2.4)
- [X] T026 [P] [US2] `SITE/src/widgets/section-sidebar/section-sidebar.test.tsx`: gizli node cari səhifədir → link `aria-current="page"` ilə görünür. Uşağı cari səhifədir → hər ikisi görünür
- [X] T027 [US2] `SITE/src/views/cms-page/index.test.tsx`: view səviyyəsində bir ssenari. Media altındakı gizli CMS səhifəsi açılır → `getByRole('navigation', { name: 'Bölmə naviqasiyası' })` daxilində cari link var
- [X] T028 [US2] `cd SITE && npm run verify`

**Checkpoint**: US1 + US2 = saytın MVP-si. Panel hələ bayrağı göstərmir, amma API ilə qurmaq olar.

---

## Phase 5: User Story 3 — Redaktor nəyin harada görünəcəyini paneldə görür (Priority: P2)

**Goal**: formada "Sol menyuda göstər" bayrağı, kartda üst və sol menyu sətirləri səbəbi ilə, ağacda nişan (FR-005, FR-013–FR-017).

**Independent Test**: `renderApp('/pages/{id}')` + MSW: bayrağı söndür → kartda "Sol menyu: Görünməyəcək: sol menyuda göstərilmir" və açıq olanda görünmə qeydi. Saxla → ağacda "Sol menyuda gizli" nişanı.

### Tests for User Story 3

- [X] T029 [P] [US3] `PNL/src/features/pages/model/menu-visibility.test.ts`: `side` nəticəsi `data-model.md`-nin vəziyyət cədvəlinin hər sətri üçün. Üst menyu gizli → side eyni səbəblər. Kök → `sectionRoot`. Öz bayrağı → `sideNavOff` + `openOnly`. Əcdad → `parentSideNavOff` + `openOnly`. Kök əcdad sayılmır. Kökə qalxan səhifə (`promotedToRoot`) → `sectionRoot`. Mövcud `top` testləri yeni nəticə formasına uyğunlaşdırılır, mənaları dəyişmir
- [X] T030 [P] [US3] `PNL/src/features/pages/pages.test.tsx`: funksional ssenarilər. Yeni səhifə formasında "Sol menyuda göstər" seçilidir (US3.6). Söndür → `menu-visibility-az-side` mətni və qeyd (US3.2). Saxla → PUT body-də `flags.showInSideNav:false`, ağacda nişan (US3.5). Valideyni gizli olan alt səhifə → "valideyn sol menyuda gizlidir" (US3.3). "Menyuda görünür" söndürülüb → hər iki sətir görünməyəcək (US3.4)

### Implementation for User Story 3

- [X] T031 [US3] `PNL/src/features/pages/model/schemas.ts`: `PAGE_FLAG_KEYS`-in sonuna `'showInSideNav'` (API `PageFlagsDto`-da da sonuncudur), `DEFAULT_PAGE_FLAGS.showInSideNav = true`. Sxem default-u köhnə API cavabını qəbul edir (R9)
- [X] T032 [US3] `PNL/src/shared/testing/fixtures/pages.ts` + `PNL/src/shared/testing/handlers/pages.ts`: fikstür `flags()`-a `showInSideNav: true`, bir alt ağac üçün `false` nümunəsi. PUT handler-ində R4: `body.flags.showInSideNav` `null`/yoxdursa `row.flags.showInSideNav` saxlanılır (indiki `{...pageFixtures[0].flags, ...body.flags}` onu sıfırlayırdı). POST-da yoxdursa `true`
- [X] T033 [US3] `PNL/src/features/pages/model/menu-visibility.ts`: `MenuHiddenReason`-a `'sectionRoot' | 'sideNavOff' | 'parentSideNavOff'`. `MenuPageInput.flags` `Pick`-inə `showInSideNav`. `placementUnder` görünən əcdad zəncirində (kök xaric) `flags.showInSideNav === false` axtarır və `sideNavHiddenAncestor` qaytarır. `menuVisibility` hər dil üçün `{ top, side }` qaytarır (research R7). Başlıq şərhi: üçüncü mənbə kimi `web-cbar-new/src/entities/page-node/lib/tree.ts isInSideNav`, `MAX_DEPTH`-in yerini yoxlayın (`shell/constants.ts`). Şərhləri ingiliscəyə çevirin
- [X] T034 [US3] `PNL/src/features/pages/components/menu-visibility-card.tsx`: hər dil üçün iki sətir: `rows.top` və `rows.side`, `data-testid` `menu-visibility-{locale}-top|side`. `promotedToRoot` top sətrinin altında qalır, `side.openOnly` → `menuVisibility.sideNavOpenOnly` qeydi. Səhifənin `showInSideNav` dəyəri formadan ötürülür
- [X] T035 [US3] `PNL/src/features/pages/components/page-form.tsx`: `flagGroups` `visibility` → `['active', 'visible', 'showAz', 'showEn', 'showInSideNav']`. `MenuVisibilityCard`-a gedən `page.flags`-a `showInSideNav` daxil edilir. Payload flags-ı artıq bütöv göndərir, yoxlayın
- [X] T036 [P] [US3] `PNL/src/features/pages/components/page-tree.tsx`: `badges.hidden`-dən sonra `row.node.flags.showInSideNav === false` → `badges.sideNavHidden` nişanı, eyni Badge üslubu
- [X] T037 [P] [US3] `PNL/src/locales/az/pages.json` və `PNL/src/locales/en/pages.json`: `contracts/ui.md` i18n cədvəlindəki bütün açarlar, `menuVisibility.hint` mətni yenilənir. Yalnız Edit ilə
- [X] T038 [US3] `cd PNL && npm run verify` (lint, check:kit, check:i18n, check:layout-fixtures, tsc -b, test, build). Node 22 ilə `vitest run src/features/pages`

**Checkpoint**: redaktor bayrağı paneldən idarə edir və nəticəni saytı açmadan görür.

---

## Phase 6: User Story 4 — Redaktor təlimatda bayraqların fərqini tapır (Priority: P3)

**Goal**: təlimatlarda bayraqların təsir cədvəli (FR-019).

- [X] T039 [P] [US4] `SITE/docs/media-cms-guide.md`: "Sol menyu" bölməsinə `contracts/ui.md`-dəki üç sətirli cədvəl. "Tədbirlər" bölməsindəki "Bu səhifələri gizlətməyin" xəbərdarlığına "Sol menyudan çıxarmaq lazımdırsa, 'Sol menyuda göstər'-i söndürün" əlavəsi. "Media sorğuları"-ndakı "İnformasiya sorğusu (`85`) … gizlətmək redaksiya qərarıdır" cümləsinə yeni bayraq variantı
- [X] T040 [P] [US4] `SITE/docs/about-cms-guide.md`: eyni cədvəl, sol menyunu təsvir edən bölmədə (yoxdursa "Sol menyu" bölməsi əlavə olunur)

---

## Phase 7: Polish & Cross-Cutting

- [X] T041 [P] Root `CLAUDE.md`, web-cbar-new bölməsində About/Media şablonu bəndinə bir cümlə: sol menyudan gizlətmə `showInSideNav`-dır (spec 041), ağacdan süzgəc deyil, `isInSideNav` iki widget-də. `Visible` bütün naviqasiyanı gizlədir və uşaqları kökə qaldırır
- [X] T042 [P] `SITE/CLAUDE.md` §3 "Bölmə şablonu" bəndinə eyni qısa qeyd. `PNL/CLAUDE.md`-yə qeyd lazım deyil, əgər səhifə bölməsi təsvir olunmayıbsa (yoxlayın)
- [X] T043 `/sync-openapi` işlədin (`api-cbar`, `api-cbar-admin`, `pages`). `# Sync:` sətirləri skill-in qaydası ilə yenilənir
- [X] T044 `/sync-business-logic` işlədin (`pages` modulu): `business_logic/new_business_logic.md` yeni qaydanı, `diff_report_logic.md` lazım gələrsə qeydi alır
- [X] T045 `quickstart.md` §3–§5 brauzer yoxlaması: lokal stack və ya `local:testcbar` + fikstür proxy. Nəticələr "Yoxlama qeydləri"-nə yazılır. SC-005 üçün dörd bölmənin sol menyusu dəyişməzdən əvvəlki HTML ilə tutuşdurulur
- [X] T046 `specs/041-side-nav-visibility/spec.md` `**Status**: Implemented`. Commit-lər dörd komponent üzrə ayrı edilir və yalnız istifadəçi istəyəndə

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1** → **Phase 2**.
- **Phase 2**: T002–T003 paralel → T004 (təsdiq, bloklayır) → T005–T010 (admin API) → T011–T013 (api-cbar) → T014.
- **US1 (Phase 3)** və **US3 (Phase 5)** T004-dən sonra başlaya bilər (MSW kontraktı), T014-ü gözləmədən. T045 (real yoxlama) T014-ü gözləyir.
- **US2 (Phase 4)** US1-in T019–T022-sini gözləyir (eyni kod, əlavə testlər).
- **US4 (Phase 6)** istənilən vaxt, ideal olaraq US1 və US3-dən sonra (mətnlər kodla uyğun olsun).
- **Phase 7** bütün hekayələrdən sonra.

### Deploy sırası (MR-lar)

`api-cbar-admin` (T003, T005–T010) → `api-cbar` (T002, T011–T013) → `web-cbar-new` (US1, US2, US4, T042) və `web-cbar-admin-new`
(US3). Panel admin API-dən əvvəl deploy olunmamalıdır (research R9).

### Within Each User Story

- Testlər implementasiya ilə eyni MR-dadır. Əvvəl yazılır, qırmızı olduğu yoxlanılır, sonra kod.
- Sxem → helper → widget → verify.

## Parallel Example

```text
# T004 təsdiqindən sonra iki axın paralel:
Axın A (sayt):  T015 + T016 + T017 + T018 [P] → T019 → T020 → T021, T022 → T023 → T024 → US2
Axın B (panel): T029 + T030 [P] → T031 → T032 → T033 → T034, T035 + T036 + T037 [P] → T038
Axın C (API):   T005 → T006 → T007 → T008 → T009 → T010 → T011 → T012 → T013 → T014
```

## Implementation Strategy

### MVP

Phase 2 + US1 + US2. Bayraq API ilə qurulur, sayt ona əməl edir. Bu mərhələdə panel bayrağı göstərmir və saxlayanda onu
dəyişmir (R4), ona görə panelin köhnə versiyası təhlükəsizdir.

### Incremental Delivery

1. Kontrakt təsdiqi (T004).
2. API-lər deploy, test mühitində sayt dəyişməz qalır (SC-005).
3. Sayt (US1+US2).
4. Panel (US3), bayraq redaktorlara açılır.
5. Təlimatlar və sinxron (US4, Phase 7).

## Yoxlama qeydləri

### T014 — API-lər, PGlite (2026-11-12)

Baza: PGlite + socket (`.tmp-041/db.mjs`), bütün miqrasiyalar (`seed.sql` 0021-dən əvvəl), `cbar_web_ro` rolu əvvəlcədən
yaradılıb. Hər iki API `dotnet run --no-build` ilə həmin bazaya qoşulub (admin :5263, public :5149). Yoxlama skripti
`.tmp-041/check.mjs`.

- Miqrasiya `0024`: cədvəl `page_id integer NOT NULL`, `show_in_side_nav boolean NOT NULL DEFAULT true`. FK
  `fk_page_details_page_id` və `cbar_web_ro` üçün `SELECT` yarandı. İkinci icra xətasızdır.
- 28/28 PASS: default `true` (admin və public). PUT `false` → 200, cavabda və GET-də `false`. `flags` sahəsiz, `null` və
  `flags`-sız PUT dəyəri saxlayır (R4). Admin ağacında bayraq var. Public ağac (az, en): səhifə ağacda qalır, uşağı onun altındadır,
  kök və qardaş sırası dəyişməyib. PUT `true` geri qaytarır. POST `false` → 201 və public-də `false`, bayraqsız POST → `true`.
  Gizli səhifənin silinməsi → 204, public ağacda yoxdur, admin ağacı yüklənir. Audit jurnalında `showInSideNav` var.
- Yoxlanmayan: R5 (sətir yalnız lazım olanda yaranır) cədvələ birbaşa sorğu ilə yoxlanmadı, yalnız davranış yoxlandı. PGlite-socket
  istifadəçi rolunu tətbiq etmir, ona görə `cbar_web_ro` ilə oxuma yalnız `GRANT`-ın olması ilə təsdiqləndi.
- Loglarda yeni xəta yoxdur. EF-in "global query filter … required end" xəbərdarlıqları mövcud nümunədəndir (Page, PageDetail
  `PressReleaseAsset`, `PressReleaseAssetDetail` kimi).

### T045 — sayt, real API ilə (2026-11-12)

`verify`-ın build-i `next start -p 3011` ilə, `API_URL` PGlite-dakı api-cbar-a (:5149). Ağac: Media (1) → Alpha (2), Beta (3,
sol menyuda söndürülüb) → Beta-1 (4), Gamma (5), Epsilon (T014-dən). Skript `.tmp-041/site-check.mjs`, server render HTML-i
yoxlayır. 18/18 PASS:

- `/az/gamma`, `/en/gamma-en`: sol menyuda Beta və Beta-1 yoxdur, Gamma aktivdir.
- `/az/beta`: Beta öz yerində aktivdir, açıq olduğu üçün Beta-1 də görünür (FR-009).
- `/az/beta-1`: zəncir görünür, Beta-1 aktivdir, breadcrumb-da Beta var.
- Hər səhifədə Beta üst menyudadır.

Panel brauzerdə açılmadı: US3 ssenariləri `pages.test.tsx`-də `renderApp` + MSW ilə yoxlanılıb. SC-005 (köhnə saytın sol
menyusu ilə tutuşdurma) edilmədi: bayraq default açıqdır, bayraqsız ağac üçün davranış dəyişmir. Bunu `model.test.ts`
"bayraqsız ağac əvvəlki kimidir" və mövcud 1224 sayt testi göstərir, test mühitində deploy-dan sonra baxmaq lazımdır.

### Gate-lər

- web-cbar-new `npm run verify`: 129 fayl, 1243 test (əvvəl 1224). Node 22: 20 fayl, 129 test.
- web-cbar-admin-new `npm run verify`: 60 fayl, 567 test (əvvəl 550). Node 22: `features/pages` 62 test.
- İki API `dotnet build --no-incremental`: 0 xəbərdarlıq, 0 xəta. `Cbar.Domain` `diff -r` boş.
- OpenAPI: lint təmiz, route-diff 0 fərq. Drift: admin-də `flags.showInSideNav` test API-də yoxdur (deploy olunmayıb, gözlənilir).
