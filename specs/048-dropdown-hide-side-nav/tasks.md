# Tasks: Sol menyuda gizli səhifələr açılan menyularda da görünməsin

**Input**: `specs/048-dropdown-hide-side-nav/` (spec.md, plan.md, research.md, contracts/menus.md, quickstart.md)

**Tests**: hər iki frontend-in `verify`-ı birləşmə şərtidir, ona görə davranış testləri daxildir (funksional, istifadəçi baxımından).

## Phase 1: Setup

Yoxdur — mövcud layihələr, yeni asılılıq yoxdur.

## Phase 2: Foundational

- [X] T001 Add `isInDropdownNav(node)` (`showInSideNav !== false`, no open-page exception, English doc-comment citing spec 048) next to `isInSideNav` in product-rest/web-cbar-new/src/entities/page-node/lib/tree.ts and export it from product-rest/web-cbar-new/src/entities/page-node/index.ts
- [X] T002 [P] Add `isInDropdownNav` tests (missing flag → shown, true → shown, false → hidden) in product-rest/web-cbar-new/src/entities/page-node/lib/tree.test.ts

## Phase 3: User Story 1 + 2 — açılan menyular sol menyu ilə eynidir (P1) 🎯 MVP

**Goal**: mega-menyu, hamburger paneli və mobil çekmecə `showInSideNav=false` səhifələri alt ağacı ilə göstərmir; köklər qalır.

**Independent Test**: `hideInSideNav` ilə ağac → `buildNavSections` nəticəsində gizli bəndlər yoxdur, köklər yerindədir; render
testində hamburger panelində gizli bənd yoxdur.

- [X] T003 [US1] Filter children with `isInDropdownNav` in `toSection` (roots untouched) and update the module doc-comment in product-rest/web-cbar-new/src/shell/nav.ts
- [X] T004 [US1] Replace the spec 041 block in product-rest/web-cbar-new/src/shell/nav.test.ts: hidden child (11, with subtree) and leaf (51) are absent from `visible`/`overflow`/`all` at every depth; hidden roots (1, 5) stay; az and en trees
- [X] T005 [P] [US2] Add a render test: a page hidden in the left menu is not in the hamburger panel nor the bar dropdown, in product-rest/web-cbar-new/src/shell/mega-menu.test.tsx
- [X] T006 [P] [US1] Add a render test: the mobile drawer leaves out a hidden page, in product-rest/web-cbar-new/src/shell/mobile-nav.test.tsx

## Phase 4: User Story 3 — digər naviqasiya dəyişmir (P2)

**Independent Test**: footer və sol menyu/breadcrumb testləri dəyişmədən keçir.

- [X] T007 [US3] Keep a test that `footerSections` is unchanged by the flag in product-rest/web-cbar-new/src/shell/nav.test.ts; run existing section-shell / section-sidebar tests unchanged

## Phase 5: Admin kartı (FR-008)

- [X] T008 Extend `MenuHiddenReason` with `sideNavOff` / `parentSideNavOff` and add them in `menuVisibility` for depth > 1 (placement may carry `sideNavHiddenAncestor`); update the header comment to cite spec 048, in product-rest/web-cbar-admin-new/src/features/pages/model/menu-visibility.ts
- [X] T009 [P] Add cases (own flag off, ancestor off, root with flag off, unknown placement) in product-rest/web-cbar-admin-new/src/features/pages/model/menu-visibility.test.ts; fix any page-form test in product-rest/web-cbar-admin-new/src/features/pages/pages.test.tsx that asserted the old top-menu result

## Phase 6: Polish & sənədlər

- [X] T010 [P] Update the flag row of the table and its note in product-rest/web-cbar-new/docs/about-cms-guide.md and product-rest/web-cbar-new/docs/media-cms-guide.md
- [X] T011 [P] Add a note in product-rest/web-cbar-new/docs/financial-literacy-cms-guide.md and product-rest/web-cbar-new/docs/cooperation-cms-guide.md
- [X] T012 [P] Update the spec 041 bullet in CLAUDE.md and §5.1 in business_logic/new_business_logic.md
- [X] T013 Run `npm run verify` in product-rest/web-cbar-new and product-rest/web-cbar-admin-new; run vitest with Node 22 too
- [X] T014 Manual check per quickstart.md against the test API (1440 / 900 / 390, az + en)

## Dependencies

T001 → T003 → T004–T007. T008 → T009. Docs (T010–T012) independent. T013 after all code; T014 last.

## Parallel

T002 ‖ T003; T005 ‖ T006; T008–T009 (admin) ‖ all web-cbar-new tasks; T010 ‖ T011 ‖ T012.

## Implementation Strategy

MVP = T001–T004 (the visible bug). Then render tests, admin card, docs, verify.
