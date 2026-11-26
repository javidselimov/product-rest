# Implementation Plan: Beynəlxalq təşkilatlarda üzvlük + admin menyunun bölmələr üzrə qruplaşdırılması

**Branch**: `046-international-memberships` | **Date**: 2026-11-16 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/046-international-memberships/spec.md`

## Summary

İki müstəqil iş paketi:

- **A. Üzvlük səhifəsi.** CMS səhifə 554 Figma `2224:7200`-dəki iki sütunlu cədvəli (Təşkilat | Üzvlük tarixi, "əvvəlcə yenilər/köhnələr") alır.
  Sətirlər redaktorun səhifə mətnindəki adi cədvəlidir; sayt onu yeni `memberships` layout-u ilə oxuyur (spec 040 `brand-logos` kimi) və
  memorandum cədvəlinin (spec 045) üslubunda göstərir. Çeşidləmə memorandumla ümumiləşdirilir (`year-sort`). API, sxem, admin bölməsi yoxdur;
  `api-cbar-admin`-ə yalnız seed migration-u (`0029`) — Figma-dakı 14 sətri yer tutucunun yerinə yazır, en surətini düzəldir.
- **B. Admin menyu.** 25 bəndlik düz sidebar saytın bölmələri üzrə açılıb-bağlanan qruplara bölünür (9 qrup, tək bəndlik qruplar başlıqsız),
  vəziyyət brauzerdə saxlanır; səhifə redaktorunda ayrıca bölmədən gələn səhifələr üçün bölmə kartı. Menyuya istinad edən bütün sənədlər
  yenilənir (FR-018).

Qərarlar və faktlar: [research.md](./research.md).

## Technical Context

**Language/Version**: TypeScript 5 strict (iki frontend); SQL (PostgreSQL, bir seed migration-u). C# kodu dəyişmir.

**Primary Dependencies**: sayt — Next.js 16 App Router, `@cbar/lib-react-ui-kit`, Tailwind 4, react-i18next, mövcud `parseAbout`/`tableRows`/
`CmsContent`; admin — React 19 + Vite, TanStack Router, kit ikonları (`ChevronDownIcon`), react-i18next, `cmdk` paleti. Yeni dependency yoxdur.

**Storage**: `page_translations.content` (mövcud); admin menyu vəziyyəti mövcud persist olunan `useUiStore` (`nexus-ui`).

**Testing**: Vitest + MSW (iki frontend, `npm run verify`, Node 24 və 22), admin `roundtrip` (unit + live), layout fixture guard; seed — PGlite
üzərində real icra; UI — Edge CDP ölçmə.

**Target Platform**: Linux konteynerlər (CBAR GitLab pipeline); brauzer 1728 / 744 / 390; admin panel desktop + mobil sheet.

**Project Type**: web — bu spec üç upstream repo-ya toxunur: `api-cbar-admin` (yalnız SQL), `web-cbar-new`, `web-cbar-admin-new`. `api-cbar` dəyişmir.

**Performance Goals**: Səhifə açılışında əlavə API çağırışı yoxdur (cədvəl səhifə məzmunundadır); parse O(sətir), 14 sətir.

**Constraints**: migration append-only, unikal ad, mövcud cədvələ ALTER yoxdur, privilege yoxlaması; `dangerouslySetInnerHTML` yalnız
`widgets/cms-content`; çeşidləmə JS-siz (yeni `'use client'` yoxdur); spec 032 sabitlər standartı (`no-magic-numbers`); layout fixture guard;
admin-də access token storage-a yazılmır (menyu vəziyyəti token deyil); `prettier --write` web-cbar-new-də işlədilmir.

**Scale/Scope**: 1 yeni sayt layout-u + widget, 1 ümumiləşdirilmiş çeşidləmə (memorandum ona keçir), 1 seed; admin-də nav modeli, sidebar,
palet, 1 kart; ~10 sənəd faylı.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Maddə | Yoxlama | Status |
|---|---|---|
| I.2 | Köhnə saytda bu səhifə yoxdur (Figma yeni məzmundur); admin menyunun köhnə qarşılığı `web-cbar-admin` deyil, yeni panelin öz nav-ıdır | ✔ |
| I.3 | URL-lər dəyişmir; heç bir məzmun gizlənmir (yer tutucu seed ilə əvəz olunur, redaktə olunmuş məzmuna toxunulmur) | ✔ |
| II.3 | 3 ayrı MR; deploy sırası aşağıda | ✔ |
| III.2–4 | Yazan yalnız `api-cbar-admin` (seed); `api-cbar` dəyişmir; public filtrlər dəyişmir; admin icazə modeli dəyişmir | ✔ |
| IV.2 | `api-cbar-admin` (seed) → `web-cbar-new`; `web-cbar-admin-new` müstəqil | ✔ |
| V.1 | `Cbar.Domain` dəyişmir | ✔ |
| V.2 | `0029-international-memberships-seed.sql` yeni, unikal; yalnız `page_translations` DML, privilege yoxlaması ilə; idempotent | ✔ |
| V.3 | az və en ayrı yazılır; bir dil boş qala bilər; slug `UNIQUE (locale, slug)` yoxlanılır | ✔ |
| V.4 | Sütun adları, çeşidləmə, gizli H2, menyu qrupları, kart mətnləri az/en locale fayllarında; təşkilat adları CMS-dən | ✔ |
| VI.5 | Editor extension-larına toxunulmur; `memberships.html` `roundtrip.test.ts`-ə və live `roundtrip`-ə əlavə olunur | ✔ |
| VII.3 | Endpoint və OpenAPI dəyişmir (`/sync-openapi` lazım deyil) | ✔ |
| VIII | Real icra: [quickstart.md](./quickstart.md) | ✔ |

Post-design təkrar yoxlama: data-model və kontraktlar heç bir maddəni pozmur. Complexity Tracking boşdur.

## Project Structure

### Documentation (this feature)

```text
specs/046-international-memberships/
├── spec.md
├── plan.md                 # bu fayl
├── research.md             # R1–R10
├── data-model.md           # view-modellər + 14 sətirlik seed (az/en)
├── quickstart.md
├── contracts/
│   ├── ui-contract.md      # Figma ölçüləri (3 en) + admin menyu üslubu
│   ├── cms-markup.md       # `memberships` layout-unun cədvəl qaydası
│   └── admin-nav.md        # qruplar, navEntries, davranış, bölmə kartı
├── checklists/requirements.md
└── tasks.md                # /speckit-tasks
```

### Source Code — iş paketləri deploy sırası ilə

```text
A1. product-rest/api-cbar-admin/                         (MR 1)
    db/migrations/0029-international-memberships-seed.sql

A2. product-rest/web-cbar-new/                           (MR 2, A1-dən sonra; A1-siz də təhlükəsiz — yer tutucu adi mətn kimi görünür)
    src/features/about-content/model/{types.ts,layouts.ts,parse.ts}
    src/features/about-content/model/{memberships.ts,memberships.test.ts}          (yeni)
    src/features/about-content/model/{year-sort.ts,year-sort.test.ts}              (yeni; memorandums.ts ondan istifadə edir)
    src/features/about-content/model/{memorandums.ts,memorandums.test.ts,layouts.test.ts,layout-fixtures.test.ts}
    src/features/about-content/fixtures/memberships.html                           (yeni)
    src/widgets/about-blocks/{memberships.tsx,memberships.test.tsx,year-sort-menu.tsx}   (yeni; memorandum-sort.tsx silinir)
    src/widgets/about-blocks/{memorandums.tsx,about-blocks.tsx,constants.ts,index.ts}
    src/views/cms-page/{index.tsx,cooperation.test.tsx}                           (memorandumSort → yearSort)
    src/locales/{az,en}/about.json                                                 (memberships.*)
    src/shared/testing/fixtures/cooperation-section.ts                             (554 + en ağacı)
    docs/cooperation-cms-guide.md, docs/{about,media}-cms-guide.md, docs/how-to-use.md, CLAUDE.md

B.  product-rest/web-cbar-admin-new/                     (MR 3, istənilən vaxt; A2-dən əvvəl birləşsə fikstür yoxlaması yerli yoxlamada tələb edir)
    src/app/routes/nav.ts                                                          (qruplar, navEntries, groupOf)
    src/app/shell/{sidebar.tsx,command-palette.tsx}, src/app/shell/nav-group.tsx   (yeni)
    src/app/shell/sidebar.test.tsx (yeni), src/app/router.test.tsx
    src/shared/model/ui-store.ts                                                   (openNavGroups + toggleNavGroup)
    src/features/pages/model/managed-sections.ts, components/managed-section-card.tsx, components/page-form.tsx
    src/features/pages/pages.test.tsx
    src/locales/{az,en}/{nav.json,pages.json}
    src/features/rich-text/fixtures/layouts/memberships.html, src/features/rich-text/roundtrip.test.ts
    CLAUDE.md, docs/how-to-use.md

R.  Kök: CLAUDE.md (spec 046 bəndi + panel bölmə adları qrup yolu ilə), business_logic/ (/sync-business-logic)
```

**Structure Decision**: Sayt tərəfi mövcud `about-content` layout sisteminə qoşulur: `cooperationLayoutFor` yeni slug-ları `'memberships'`-ə
xəritələyir, `parseAbout` `parseMemberships(nodes)`-u çağırır, loader dəyişmir (əlavə API yoxdur). Çeşidləmə memorandumdakı kimi view-da tətbiq
olunur (`cache()`-li `loadCmsPage` imzası dəyişmir); `parseYearSort` səhifə sorğusunun `sort` parametrini bir dəfə oxuyur və hər iki blok onu alır.
Admin tərəfində `navItems` tək həqiqət mənbəyi qalır; qruplar data, render `navEntries()` üzərindən — sidebar, mobil sheet və palet eyni
mənbədən oxuyur.

**Deploy sırası**: A1 → A2. B müstəqildir. A2 və B-nin fikstürləri eyni MR seriyasında birləşməlidir (`check:layout-fixtures` yalnız yan-yana
checkout-da işləyir, upstream CI-da yox).

**İcra sırası (təklif)**: A (A1 + A2) əvvəl — ayrıca yayımlana bilər; sonra B. Sənəd işi (FR-017/018) hər paketin öz MR-ındadır, B bitəndə
redaktor təlimatlarındakı qrup yolları yoxlanılır (quickstart §4).

## Complexity Tracking

Pozuntu yoxdur.
