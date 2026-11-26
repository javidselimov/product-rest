# Tasks: Masaüstü hamburger panelində üst zolaqdakı bölmələr təkrarlanmasın

**Input**: `specs/042-hamburger-hide-media/` — plan.md, spec.md, research.md (R1–R5), contracts/ui.md, quickstart.md

**Tests**: merge şərti `npm run verify`-dır (Vitest + MSW). Testlər davranışı yoxlayır (rol, link adı, sinif qaydası — JSDOM media
query hesablamır, R5). Faktiki görünüş brauzerdə ölçülür (T008).

**Organization**: bir komponent (`SITE` = `product-rest/web-cbar-new`), bir MR. API, admin panel, miqrasiya yoxdur.

Ümumi qaydalar: kod şərhləri ingiliscə (toxunulan faylda azərbaycanca şərhlər də çevrilir); magic number yoxdur (spec 032);
AZ hərfli fayllar yalnız Edit/Write ilə; `SITE`-də `prettier --write` işlədilmir.

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Setup

- [X] T001 `SITE`-də `npx vitest run src/shell` dəyişiklikdən əvvəl yaşıldır — qeyd et

---

## Phase 2: User Story 1 — ≥1360 paneldə üst zolaq bölmələri yoxdur (P1) 🎯 MVP

**Independent Test**: `nav-overflow.test.tsx` Media/İnsan resursları bəndlərində `desk:hidden` görür; 1440 endə brauzerdə `display:none`.

- [X] T002 [P] [US1] `SITE/src/shell/nav.test.ts`: `isTopLinkSection` testləri — az `Media`, `İnsan resursları` true; en `Media`
  (`/en/media`) true; adi bölmə, xarici keçid (`E-xidmətlər`), alt bölmə href-i false
- [X] T003 [US1] `SITE/src/shell/nav.ts`: `isTopLinkSection(section, locale)` (research R2) — `topLinks`-dən `/${locale}/${slug[locale]}`,
  `external` false; doc-comment (spec 042, Figma `1088:26879`). Başlıq şərhini ingiliscəyə çevir
- [X] T004 [P] [US1] `SITE/src/shell/nav-overflow.test.tsx`: panel kök bəndlərindən Media və İnsan resursları `desk:hidden` alır,
  `Maliyyə sabitliyi` və `E-xidmətlər` almır; en ağacında Media alır
- [X] T005 [US1] `SITE/src/shell/mega-menu.tsx`: `OverflowPanel` `locale` prop alır, `li` sinfinə `isTopLinkSection(...) && 'desk:hidden'`;
  `MegaMenu` `locale`-i ötürür; modul və `OverflowPanel` doc-comment-lərinə qayda (contracts/ui.md). Şərhləri ingiliscəyə çevir

**Checkpoint**: T002, T004 yaşıl.

---

## Phase 3: User Story 2 — dar ekranlarda heç nə dəyişmir (P1)

- [X] T006 [P] [US2] `SITE/src/shell/mobile-nav.test.tsx`: çekmecədə "Media" və alt bəndi (Fotoqalereya) var — yoxdursa test əlavə et;
  `nav-overflow.test.tsx`-də Media bəndində `max-*`/`lg:hidden`-dan başqa gizlədən sinif olmadığını (1024–1359 görünür) yoxla

---

## Phase 4: Polish

- [X] T007 [P] `SITE/docs/media-cms-guide.md`: "Media geniş ekranda hamburgerdə yoxdur — qəsdəndir, üst zolaqdadır; admin ayarı yoxdur,
  'Menyuda görünür'ü söndürmə" qeydi (FR-007); `SITE/CLAUDE.md` §3-ə bir sətir (spec 042)
- [X] T008 `npm run verify` (+ Node 22 ilə `test:run`); `npm run local:testcbar` + Edge ilə quickstart cədvəli (1440/1200/900/390, az və en)

---

## Dependencies

T001 → T002/T004 (paralel) → T003 → T005 → T006 → T007 → T008. T003 T002-ni, T005 T004-ü yaşıla çevirir.
