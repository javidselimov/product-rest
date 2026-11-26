# Implementation Plan: Sol menyuda gizli səhifələr açılan menyularda da görünməsin

**Branch**: `048-dropdown-hide-side-nav` | **Date**: 2026-11-16 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/048-dropdown-hide-side-nav/spec.md`

## Summary

Bütün açılan menyular (nav çubuğunun mega-menyusu, hamburger paneli, mobil çekmecə) `web-cbar-new/src/shell/nav.ts`
`buildNavSections` → `toSection`-dan qurulur. `toSection` uşaqları süzərkən `showInSideNav === false` olan düyünü alt ağacı ilə
birlikdə atacaq (R1). Kök bölmələrə süzgəc tətbiq olunmur: `tree.map(...)` olduğu kimi qalır, footer da (`footerSections`, uşaqsız)
dəyişmir (R2). "Açıq səhifə" istisnası yoxdur, ona görə `isInSideNav(node, open)` yox, sadə bayraq yoxlaması istifadə olunur: bunu
`entities/page-node`-da yeni saf funksiya `isInDropdownNav(node)` verir ki, bayrağın default-u (undefined = görünür) bir yerdə olsun (R3).

Admin paneldə `features/pages/model/menu-visibility.ts` `menuVisibility` saytın qaydasını təkrarlayır. Kartın "Üst menyu" sətri
depth > 1 olan səhifə üçün öz bayrağı söndürülübsə `sideNavOff`, kökdən aşağıdakı əcdadı söndürülübsə `parentSideNavOff` səbəbini
alacaq (R4). Kart artıq `sidePlacementUnder` ötürür, yeni məlumat lazım deyil. API, DB, miqrasiya yoxdur.

## Technical Context

**Language/Version**: TypeScript 5, React 19; web-cbar-new Next.js 16, web-cbar-admin-new Vite.

**Primary Dependencies**: mövcud olanlar; yeni paket yoxdur.

**Storage**: yoxdur (mövcud `page_details.show_in_side_nav`, `GET /pages/tree` `showInSideNav`).

**Testing**: Vitest + MSW, Testing Library. `npm run verify` hər iki frontend-də; `test:run` Node 22 ilə də.

**Target Platform**: SSR sayt (server-də süzülür, HTML-də gizli bənd yoxdur) və admin SPA.

**Project Type**: web — `product-rest/web-cbar-new`, `product-rest/web-cbar-admin-new`.

**Performance Goals**: əlavə sorğu yoxdur; ağac üzərində bir `filter`.

**Constraints**: FSD (`shell` → `entities` icazəlidir). Magic number yoxdur (spec 032). `prettier --write` web-cbar-new-də işlədilmir.
Kod şərhləri ingiliscə.

**Scale/Scope**: sayt: `entities/page-node/lib/tree.ts`, `index.ts`, `shell/nav.ts` + testlər; admin: `menu-visibility.ts` + test;
sənədlər: 3 CMS təlimatı, `CLAUDE.md`, `business_logic/new_business_logic.md`.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Maddə | Yoxlama | Nəticə |
|---|---|---|
| I | Köhnə saytın informasiya arxitekturası dəyişmir: ağac və ünvanlar eynidir, redaktorun söndürdüyü bəndlər menyulardan çıxır | Keçir |
| II | İki komponent, iki müstəqil MR; deploy sırası şərti yoxdur | Keçir |
| III | API-lərə toxunulmur; admin yalnız öz kartının hesabını dəyişir | Keçir |
| IV | Port və start sırası dəyişmir | Keçir |
| V | `Cbar.Domain`, miqrasiya, tərcümə cədvəlləri dəyişmir. Qayda az/en eyni işləyir (FR-005) | Keçir |
| VI | Kit və template yığını dəyişmir | Keçir |
| VII | Marşrut, URL, `/currencies/*.xml` dəyişmir | Keçir |
| VIII | İki `npm run verify` + test API ağacı ilə brauzerdə yoxlama (quickstart) | Keçir |
| spec 032 | Yeni rəqəm yoxdur | Keçir |

Faza 1-dən sonra yenidən yoxlandı: pozuntu yoxdur.

## Project Structure

### Documentation (this feature)

```text
specs/048-dropdown-hide-side-nav/
├── spec.md
├── plan.md              # bu fayl
├── research.md          # R1–R5
├── quickstart.md
├── contracts/menus.md   # hansı menyu hansı bəndi göstərir; admin kartı qaydası
├── checklists/requirements.md
└── tasks.md             # /speckit-tasks
```

`data-model.md` yoxdur: yeni məlumat yoxdur, `PageNode.showInSideNav` (spec 041) olduğu kimi qalır.

### Source Code

```text
product-rest/web-cbar-new/
├── src/entities/page-node/lib/tree.ts       # + isInDropdownNav(node)
├── src/entities/page-node/lib/tree.test.ts  # + isInDropdownNav testləri
├── src/entities/page-node/index.ts          # export
├── src/shell/nav.ts                         # toSection uşaqları süzür; doc-comment
├── src/shell/nav.test.ts                    # spec 041 blokunu yeni qaydaya çevir
├── src/shell/nav-overflow.test.tsx | mobile-nav.test.tsx | mega-menu.test.tsx  # render səviyyəsində bir yoxlama
└── docs/{about,media,financial-literacy,cooperation}-cms-guide.md            # bayraq cədvəli/qeydi

product-rest/web-cbar-admin-new/
├── src/features/pages/model/menu-visibility.ts       # menuVisibility: sideNavOff / parentSideNavOff
└── src/features/pages/model/menu-visibility.test.ts  # yeni hallar

CLAUDE.md, business_logic/new_business_logic.md      # spec 041 təsvirini yenilə
```

**Structure Decision**: süzgəc menyu modelində (`toSection`) bir yerdədir, çünki üç açılan menyu eyni modeldən qurulur; komponentlər
(`MegaMenu`, `OverflowPanel`, `MobileNav`) dəyişmir.

## Complexity Tracking

Pozuntu yoxdur.
