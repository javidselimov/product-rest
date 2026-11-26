---

description: "Task list — spec 056 header naviqasiyası"
---

# Tasks: Header naviqasiyası — "Maliyyə sabitliyi" və Figma-dakı hamburger paneli

**Input**: `specs/056-header-financial-stability-nav/` — spec.md, plan.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: daxildir. Frontend standartı TDD-dir (`frontend-standards`), seed PGlite ilə real SQL icrası ilə yoxlanır (Maddə VIII).

**Yol qısaltmaları**: `SITE` = `product-rest/web-cbar-new`, `ADMIN` = `product-rest/web-cbar-admin-new`, `ADMIN-API` =
`product-rest/api-cbar-admin`, `SPEC` = `specs/056-header-financial-stability-nav`.

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup

- [X] T001 Baseline: `SITE` və `ADMIN`-də `npm run verify` işlət, nəticəni qeyd et ki, sonrakı qırmızılar bu spec-ə aid olsun (PowerShell-dən; memory `windows-shell-crlf`)
- [X] T002 [P] `specs/054-publications-research/tasks.md` T086/T087-də məqalələr seed-inin adını `0043-working-papers-seed.sql` et və qeyd yaz: `0042` spec 056-nın seed-idir (research R5)

---

## Phase 2: Foundational (seed — US1, US2, US4-ün məlumatı)

**Purpose**: ağac seed-dən sonrakı formaya düşməsə heç bir hekayə real mühitdə yoxlanmır. Saytın testləri fikstürlə işləyir, seed-dən
asılı deyil, ona görə Phase 3–5 seed bitənə qədər paralel başlaya bilər.

- [X] T003 `ADMIN-API/db/migrations/0042-financial-stability-nav-seed.sql` yaz (`SPEC/contracts/seed.md`, `SPEC/data-model.md`, nümunə `0041-publications-tree-seed.sql`):
  - imtiyaz yoxlaması; `pul-siyaseti` kökü yoxdursa `NOTICE` ilə çıxış;
  - mərhələ A: `maliyye-sabitliyi` kökü, 64/65/113-ün şərtli köçürülməsi (`path` alt ağacla), 64/65 `show_in_side_nav = true`, 459 `false`;
  - mərhələ B: `reqemsal-maliyye-ekosistemi` + 8 uşaq (az/en başlıq, `-2` slug qaydası, boş `content`);
  - mərhələ C (yalnız A/B kök yaradıbsa): köklərin `sort_order`-i data-model siyahısı ilə, 4 kök `show_in_side_nav = false`;
  - hər addımda `RAISE NOTICE 'spec 056: …'`. `BEGIN/COMMIT` yoxdur, `ALTER` yoxdur.
- [X] T004 PGlite ilə seed-i yoxla (`SPEC/quickstart.md` §1, memory `pglite-api-testing`). Skripti repo-lokal `.tmp-056/`-də saxla, commit etmə:
  - (a) boş baza: xətasız ötür;
  - (b) test API ağacının surəti (`GET /api/v1/pages/tree?locale=az|en` → `pages`/`page_translations`/`page_details` sətirləri): nəticə ağacı, sıra, slug-lar (`aciq-bankciliq-2`), bayraqlar data-model ilə eynidir;
  - (c) ikinci icra: bütün `NOTICE` sayları 0;
  - (d) bir kökün bayrağını `true`-ya qaytarıb yenidən icra: bayraq qalır.
- [X] T005 `ADMIN-API`-də `dotnet build CbarAdminApi.slnx` (C# dəyişmir, migration embed/copy qaydası pozulmasın deyə)

**Checkpoint**: seed hazırdır. `ADMIN-API` MR-ı ayrıca gedə bilər və birinci deploy olunur (research R7).

---

## Phase 3: User Story 1 — Nav zolağında "Maliyyə sabitliyi" (Priority: P1) 🎯 MVP

**Goal**: ≥1360-də zolaqda Figma-dakı 9 bölmə, 1024–1359-da ilk 8 bölmə, 9-cu paneldə. "Maliyyə sabitliyi"nin mega-menyusu ağacdandır.

**Independent Test**: 1440-da zolağın 9 bəndi Figma `I813:25657;9:29` ilə eynidir; 1024-də bir sətirdə 8 bənd var, 9-cu hamburgerdədir.

### Tests (əvvəl yazılır, qırmızı)

- [X] T006 [US1] `SITE/src/shared/testing/fixtures/pages.ts`-i genişləndir: az ağacında 9 zolaq bölməsindən sonra ən azı 3 kök olsun (biri `showInSideNav: false` — gizli kök, biri alt bəndli). Unikal id-lər işlət (`90+`). Fayl başlığındakı şərhi yenilə. Bu fikstürü işlədən testləri (`grep -rl pageTreeAz SITE/src`) say dəyişikliyinə görə yoxla.
- [X] T007 [P] [US1] `SITE/src/shell/nav.test.ts`: `visible` `VISIBLE_SECTIONS` (9) bölmədir; `VISIBLE_SECTIONS_NARROW < VISIBLE_SECTIONS`.
- [X] T008 [P] [US1] `SITE/src/shell/mega-menu.test.tsx`:
  - zolaqda 9 `nav-section` var;
  - indeksi `VISIBLE_SECTIONS_NARROW`-dan kiçik olanlarda `max-desk:hidden` yoxdur, 9-cuda var;
  - "Maliyyə sabitliyi"nin paneli uşaqlarını sütun kimi göstərir (fikstürə uşaq əlavə et).

### Implementation

- [X] T009 [US1] `SITE/src/shell/constants.ts`: `VISIBLE_SECTIONS = 9`, yeni `VISIBLE_SECTIONS_NARROW = 8`. Hər birinə bir sətir "niyə" şərhi (Figma `I813:25657;9:29`, research R2).
- [X] T010 [US1] `SITE/src/shell/mega-menu.tsx` `MegaMenu`: zolaq `li`-si indeks `>= VISIBLE_SECTIONS_NARROW` olanda `max-desk:hidden` alır. Hamburger düyməsinin `lg:hidden` şərti `all.length <= VISIBLE_SECTIONS_NARROW` olur. Faylın başlıq şərhində "first 8" ifadəsini yenilə (`SPEC/contracts/ui.md` "Sinif qaydası").
- [X] T011 [US1] Ölçmə (`SPEC/quickstart.md` §3): `npm run local:testcbar`. Seed test mühitində olana qədər ağacı seed-dən sonrakı formaya gətirən fikstür proxy-si qur (memory `hybrid-fixture-proxy-for-ui-measuring`, skript `.tmp-056/`-də). Edge CDP ilə 1440/1360/1359/1280/1024 az və en ölç: zolaq bir sətirdir və `scrollWidth <= clientWidth`; 1440 mətnləri Figma ilə 9/9 eynidir. en 1024-də sığmasa `VISIBLE_SECTIONS_NARROW = 7` et, `research.md` R2-yə nəticəni yaz.
- [X] T012 [US1] Review: `ui-kit-review` + `senior-front` review checklist (`SITE/src/shell/{constants,mega-menu}.ts(x)`), plan.md "Frontend Skills Gate"ə qarşı.
- [X] T013 [US1] `SITE`-də `npm run verify`.

**Checkpoint**: US1 seed + sayt ilə tam işləyir.

---

## Phase 4: User Story 2 — Hamburger paneli Figma-dakı kimidir (Priority: P1)

**Goal**: ≥1360 panelində `inDropdownNav: false` kökləri, üst zolaq bölmələri və zolağın 9-cu bölməsi yoxdur. 1024–1359 paneli, planşet və mobil dəyişmir.

**Independent Test**: 1440-da panel Figma `1088:26873` ilə 6/6 bölmə, 4 sütun eynidir. 1024-də gizli 4 bölmə paneldə görünür.

### Tests

- [X] T014 [P] [US2] `SITE/src/shell/nav.test.ts`: kök `showInSideNav: false` → `inDropdownNav: false`; `showInDropdownNav: true` onu üstələyir; alt bəndlər `inDropdownNav: true`; mobil üçün `all` gizli kökü də saxlayır.
- [X] T015 [P] [US2] `SITE/src/shell/nav-overflow.test.tsx`:
  - ilk `VISIBLE_SECTIONS_NARROW` bölmə `lg:hidden`, 9-cu `desk:hidden`dır (`lg:hidden` yox);
  - gizli kök `desk:hidden`dır, `lg:hidden` deyil;
  - adi kök heç birini almır;
  - spec 042 testləri (Media, İnsan resursları) yaşıl qalır.
- [X] T016 [P] [US2] `SITE/src/shell/mobile-nav.test.tsx`: gizli kök mobil çekmecədə görünür (FR-010). Mövcud test bunu artıq yoxlayırsa toxunma.

### Implementation

- [X] T017 [US2] `SITE/src/shell/nav.ts`: `NavSection`-a `inDropdownNav: boolean`. `toSection` kök üçün `isInDropdownNav(node)`, alt bəndlər üçün `true` yazır (onlar artıq süzülüb). `buildNavSections`-ın imzası dəyişmir. Faylın başlıq şərhinə kök bölmə qaydasını əlavə et.
- [X] T018 [US2] `SITE/src/shell/mega-menu.tsx` `OverflowPanel`: sinif qaydası bir köməkçi funksiyada (`panelItemClass(section, index, locale)`, `SPEC/contracts/ui.md` "Sinif qaydası"). `desk:hidden` bir dəfə yazılır. Hamburger düyməsi `desk`-də heç bir panel bölməsi görünmürsə `desk:hidden` alır. `OverflowPanel` şərhini yenilə.
- [X] T019 [US2] Ölçmə 1440 (`SPEC/quickstart.md` §3): panel açıq, görünən kök `li`-lərin mətni və `getBoundingClientRect().left` → sütun bölgüsü Figma ilə eynidir. 1024-də 4 gizli bölmə paneldədir. 900 və 390-da hər şey əvvəlki kimidir.
- [X] T020 [US2] (şərti, yalnız T019 sütunda fərq göstərsə) `SITE/src/shell/mega-menu.tsx`: `desk`-də `columns-4` əvəzinə `grid grid-cols-4` + bölmə sütunu (research R4). Yeni testlə kilidlə.
- [X] T021 [US2] Review: `ui-kit-review` + `senior-front` checklist (`SITE/src/shell/{nav,mega-menu}.ts(x)`).
- [X] T022 [US2] `SITE`-də `npm run verify` və Node 22 ilə `npm run test:run` (memory `run-tests-on-node22`).

**Checkpoint**: sayt MR-ı hazırdır (US1 + US2).

---

## Phase 5: User Story 3 — Redaktor kök bölməni paneldən çıxarır (Priority: P2)

**Goal**: admin kartı kök bölmə üçün "Menyularda yox"un mənasını düzgün yazır.

**Independent Test**: kök formasında "Menyularda yox" → izah `noneRoot` və "Üst menyu" sətrində panel qeydi. "Hər yerdə" → qeyd yoxdur.

- [X] T023 [US3] `ADMIN/.claude/skills`-dəki `frontend-standards` və `ui-kit-usage`-i yüklə (admin fazasından əvvəl, plan.md "Frontend Skills Gate").
- [X] T024 [P] [US3] Test `ADMIN/src/features/pages/model/menu-visibility.test.ts`: `rootPanelHidden`. Kök + `none` → `true`; kök + `all` → `false`; uşaq + `none` → `false`; `placement: null` + `parentId === null` → kök sayılır.
- [X] T025 [P] [US3] Test `ADMIN/src/features/pages/components/menu-visibility-card.test.tsx`:
  - kök formasında "Menyularda yox" seçiləndə `noneRoot` izahı və "Üst menyu" sətrində qeyd görünür;
  - "Hər yerdə"də qeyd yoxdur;
  - "Yalnız açılan menyularda" disabled qalır;
  - uşaq səhifənin kartı dəyişməyib.
- [X] T026 [US3] `ADMIN/src/features/pages/model/menu-visibility.ts`: `MENU_BAR_SECTIONS = 9` (başlıq şərhinə `web-cbar-new/src/shell/constants.ts` `VISIBLE_SECTIONS` bağlantısı) və `rootPanelHidden(flags, placement, parentId)` saf funksiyası.
- [X] T027 [US3] `ADMIN/src/features/pages/components/menu-visibility-card.tsx`:
  - kök üçün `none` seçiminin izahı `location.noneRoot`-dur;
  - "Üst menyu" sətrinin `notes`-una `rootPanelHidden` qeydi əlavə olunur (`menuVisibility.rootPanelHidden`, `count: MENU_BAR_SECTIONS`);
  - başlıq şərhinə spec 056-nı əlavə et.
- [X] T028 [P] [US3] `ADMIN/src/locales/az/pages.json` və `ADMIN/src/locales/en/pages.json`: `menuVisibility.location.noneRoot`, `menuVisibility.rootPanelHidden` (`SPEC/contracts/admin-ux.md` "Mətnlər").
- [X] T029 [US3] Review: `ui-kit-review` + `senior-front` checklist (`ADMIN/src/features/pages/{model,components}/menu-visibility*`).
- [X] T030 [US3] `ADMIN`-də `npm run verify` və Node 22 ilə `npm run test:run`.

**Checkpoint**: admin MR-ı hazırdır.

---

## Phase 6: User Story 4 — Yeni bölmələrin səhifələri açılır (Priority: P3)

**Goal**: 10 yeni səhifə və köçən səhifələr xətasız açılır. Kod dəyişikliyi gözlənilmir (research R8).

- [X] T031 [P] [US4] `SITE/src/views/cms-page/index.test.tsx`: boş məzmunlu uşaqsız yarpaq (yeni Rəqəmsal səhifəsi kimi) başlıq + sol menyu ilə render olunur və boş `CmsContent` xəta vermir. Uşaqlı boş kök `ChildPageCards` göstərir. Mövcud test bunu əhatə edirsə toxunma.
- [X] T032 [US4] Yoxlama (`SPEC/quickstart.md` §4): seed-li PGlite + lokal `api-cbar` və ya fikstür proxy ilə 10 yeni səhifəni, 64/65/113-ü və 113-ün uşaqlarını az/en açıb 200 və breadcrumb-u yoxla ("Ana səhifə › Maliyyə sabitliyi › …"). Docker yoxdursa bu addım test mühitinə deploy-dan sonra edilir və nəticə burada qeyd olunur.

---

## Phase 7: Polish & cross-cutting

- [X] T033 [P] Yeni `SITE/docs/navigation-cms-guide.md` (azərbaycanca, redaktor üçün):
  - nav zolağı ilk 9 kök bölmədir (sıra = admin-dəki sıra);
  - hamburger paneli və kök bölmədə "Menyularda yox"un yalnız geniş paneldən çıxarması;
  - planşet və mobil dəyişmir;
  - "Maliyyə sabitliyi" və "Rəqəmsal maliyyə ekosistemi" admin-də harada durur.
- [X] T034 [P] `SITE/docs/publications-cms-guide.md`: 64/65 artıq "Maliyyə sabitliyi"ndədir. `dokumentasiyalar/`-da onlardan və "Dayanıqlı Maliyyə"dən bəhs edən təlimat varsa (`grep -ri`), eyni dəyişikliyi et (memory `menu-changes-update-docs`).
- [X] T035 [P] `SITE/CLAUDE.md`: "Hamburger paneli" bəndinə spec 056 (zolaqda 9/8, kök bölmə bayrağı `desk:hidden`).
- [X] T036 [P] Root `CLAUDE.md`: "A page can leave its section's menus" bəndinə kök bölmə üçün yeni mənanı, web-cbar-new bölməsinə spec 056 qeydini əlavə et.
- [X] T037 `/sync-business-logic` ilə `business_logic/new_business_logic.md` və `diff_report_logic.md`-ni yenilə (menyu modulu).
- [X] T038 Quickstart §5-in prod SQL-ini MR təsvirinə (`ADMIN-API`) və deploy qeydinə köçür: deploy sırası `api-cbar-admin` → `web-cbar-new` → `web-cbar-admin-new`.
- [X] T039 `SPEC/checklists/requirements.md` və spec "Status"unu yenilə, `SPEC/quickstart.md` addımlarının nəticəsini qısa qeyd et.

---

## Dependencies & Execution Order

- **Setup (T001–T002)** → hər şeydən əvvəl. T002 müstəqildir.
- **Foundational (T003–T005)**: seed. Real mühitdə US1/US2/US4-ü bloklayır, saytın vahid testlərini bloklamır.
- **US1 (T006–T013)**: T006 fikstürü US2 testləri üçün də lazımdır, ona görə US2-dən əvvəl.
- **US2 (T014–T022)**: T010 ilə eyni faylda (`mega-menu.tsx`) işlədiyi üçün US1-dən sonra.
- **US3 (T023–T030)**: başqa repo, US1/US2 ilə paralel.
- **US4 (T031–T032)**: T031 paralel, T032 seed (T004) və sayt (T013) bitəndən sonra.
- **Polish (T033–T039)**: hekayələrdən sonra. T033–T036 paralel.

### Deploy sırası

`api-cbar-admin` (T003–T005) → `web-cbar-new` (T006–T022) → `web-cbar-admin-new` (T023–T030), research R7.

## Parallel Example

```text
# Seed və admin bir-birindən asılı deyil:
T003 ADMIN-API seed      ║  T024–T028 ADMIN testlər + kart + i18n
# US1 testləri:
T007 nav.test.ts         ║  T008 mega-menu.test.tsx
# Polish sənədləri:
T033 ║ T034 ║ T035 ║ T036
```

## Implementation Strategy

- **MVP**: Phase 2 + US1. Seed "Maliyyə sabitliyi"ni yaradır, zolaq 9 bölmə göstərir. Bu, istifadəçinin birinci tələbidir.
- **Sonra US2**: panel Figma-dakı kimi olur. Seed-in bayraqları US2 kodu olmadan heç nəyi dəyişmir.
- **US3** redaktorun idarəsini aydınlaşdırır, saytın davranışını dəyişmir.
- **US4** yoxlamadır.
