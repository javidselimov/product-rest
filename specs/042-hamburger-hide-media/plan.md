# Implementation Plan: Masaüstü hamburger panelində üst zolaqdakı bölmələr təkrarlanmasın

**Branch**: `042-hamburger-hide-media` | **Date**: 2026-11-12 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/042-hamburger-hide-media/spec.md`

## Summary

Hamburger panelinin hər bölmə bəndi (`mega-menu.tsx` `OverflowPanel`) üst zolaq keçidinə (`shared/config/contacts.ts` `topLinks`)
uyğundursa `desk:hidden` sinfini alır. Uyğunluğu `shell/nav.ts`-də yeni saf funksiya `isTopLinkSection(section, locale)` verir:
bölmənin `href`-i ilə `/${locale}/${topLink.slug[locale]}` tutuşdurulur (research R2). Sərhəd `desk` (1360) breakpoint-idir, çünki
üst zolaq da elə həmin breakpoint-də görünür (`max-desk:hidden`) — iki sinif eyni token-a bağlıdır və heç vaxt ayrılmır (R1).
Mobil çekmecə (`MobileNav`), nav çubuğu, footer, breadcrumb toxunulmur. API, admin, miqrasiya yoxdur (R4).

## Technical Context

**Language/Version**: TypeScript 5, React 19, Next.js 16 (App Router, server komponentləri).

**Primary Dependencies**: Tailwind 4 (`--breakpoint-desk: 85rem`), `@cbar/lib-react-ui-kit` `cn`. Yeni paket yoxdur.

**Storage**: yoxdur.

**Testing**: Vitest + MSW, Testing Library (`renderApp`). `npm run verify` (Node 24 lokal, Node 22 ilə də `test:run`).

**Target Platform**: SSR sayt, bütün brauzerlər. Gizlətmə CSS-dir, JS-dən asılı deyil.

**Project Type**: web — yalnız `product-rest/web-cbar-new`.

**Performance Goals**: əlavə sorğu və JS yoxdur; render-də 3 elementlik massivdə axtarış.

**Constraints**: FSD (`shell` → `shared` import icazəlidir). Magic number/string yoxdur (spec 032) — breakpoint Tailwind token-ıdır,
slug-lar `topLinks`-dəndir. `prettier --write` işlədilmir.

**Scale/Scope**: 2 mənbə faylı (`nav.ts`, `mega-menu.tsx`), 2–3 test faylı, 2 sənəd.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Maddə | Yoxlama | Nəticə |
|---|---|---|
| I | Köhnə saytın informasiya arxitekturası dəyişmir: bölmələr ağacda qalır, yalnız eyni keçidin təkrarı geniş ekranda gizlənir | Keçir |
| II | Bir komponent, bir MR | Keçir |
| III | API-lərə toxunulmur | Keçir |
| IV | Port və start sırası dəyişmir | Keçir |
| V | `Cbar.Domain`, miqrasiya, tərcümə cədvəlləri dəyişmir. Qayda az/en eyni işləyir (FR-002) | Keçir |
| VI | Kit və template yığını dəyişmir; yalnız Tailwind utility sinfi | Keçir |
| VII | Marşrut və URL dəyişmir | Keçir |
| VIII | `npm run verify` + brauzerdə ölçmə (quickstart) | Keçir |
| web-cbar-new XII (spec 032) | Yeni rəqəm yoxdur; 1360 `desk` token-ıdır | Keçir |

Faza 1-dən sonra yenidən yoxlandı: pozuntu yoxdur.

## Project Structure

### Documentation (this feature)

```text
specs/042-hamburger-hide-media/
├── spec.md
├── plan.md              # bu fayl
├── research.md          # R1–R5
├── quickstart.md
├── contracts/ui.md      # en-lər üzrə panel tərkibi, uyğunluq qaydası
├── checklists/requirements.md
└── tasks.md             # /speckit-tasks
```

`data-model.md` yoxdur: yeni məlumat yoxdur, mövcud `NavSection` dəyişmir.

### Source Code

```text
product-rest/web-cbar-new/
├── src/shell/nav.ts                 # + isTopLinkSection(section, locale)
├── src/shell/nav.test.ts            # + isTopLinkSection testləri (az/en, xarici keçid, alt bölmə)
├── src/shell/mega-menu.tsx          # OverflowPanel: locale prop, desk:hidden; doc-comment
├── src/shell/nav-overflow.test.tsx  # + Media/İnsan resursları desk:hidden, digərləri yox
├── src/shell/mobile-nav.test.tsx    # (yoxlanılır) Media çekmecədə qalır — yoxdursa test əlavə
├── docs/media-cms-guide.md          # FR-007 qeydi
└── CLAUDE.md                        # §3 bir sətir
```

**Structure Decision**: qayda `nav.ts`-də (naviqasiya modeli), tətbiqi `mega-menu.tsx`-də (görünüş). `NavSection`-a bayraq
əlavə edilmir, çünki mobil çekmecə və footer eyni modeli işlədir və onlara bu qayda aid deyil (R3).

## Complexity Tracking

Pozuntu yoxdur.
