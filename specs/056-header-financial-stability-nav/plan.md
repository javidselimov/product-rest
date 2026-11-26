# Implementation Plan: Header naviqasiyası — "Maliyyə sabitliyi" və Figma-dakı hamburger paneli

**Branch**: `056-header-financial-stability-nav` | **Date**: 2026-11-23 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/056-header-financial-stability-nav/spec.md`

## Summary

Nav zolağı Figma ilə 9 bölmə göstərir, 3-cü yeni "Maliyyə sabitliyi"dir. Hamburger paneli (≥1360) yalnız Figma-dakı 6 bölməni
göstərir. İş üç hissədən ibarətdir:

1. **Seed `0042`** (`api-cbar-admin`, yalnız DML):
   - iki yeni kök: "Maliyyə sabitliyi" və 8 boş uşaqlı "Rəqəmsal maliyyə ekosistemi";
   - 64, 65 və "Dayanıqlı Maliyyə" alt ağacı ilə yeni bölməyə köçür, ünvanlar dəyişmir;
   - köklərin sırası Figma ilə yenidən nömrələnir;
   - 4 kök "Menyularda yox" kimi qeyd olunur.
2. **Sayt** (`web-cbar-new/src/shell`):
   - `VISIBLE_SECTIONS` 9 olur, `lg`–`desk` arası 8 qalır (en problemi);
   - mövcud menyu yeri bayrağı kök bölmədə yalnız ≥1360 hamburger panelinə təsir edir (`desk:hidden`).
3. **Admin** (`web-cbar-admin-new`): "Saytın menyusunda" kartı kök bölmə üçün bu mənanı yazır.

API, sxem və OpenAPI dəyişmir.

## Technical Context

**Language/Version**: TypeScript 5 (Next.js 16 / React 19 sayt; React 19 + Vite admin), PostgreSQL PL/pgSQL (seed); .NET 10 dəyişmir

**Primary Dependencies**: `@cbar/lib-react-ui-kit`, Tailwind 4 (`lg` 1024, `desk` 1360 breakpoint-ləri), react-i18next. Yeni dependency yoxdur

**Storage**: PostgreSQL — mövcud `pages`, `page_translations`, `page_details` üzərində DML. Yeni cədvəl və sütun yoxdur

**Testing**: Vitest + Testing Library + MSW (hər iki frontend), PGlite (seed), Edge CDP ölçmə (Figma ↔ DOM)

**Target Platform**: SSR sayt (standalone Node), nginx-də SPA admin, `api-cbar-admin` startup migrasiyaları

**Project Type**: web — üç müstəqil komponent (`api-cbar-admin`, `web-cbar-new`, `web-cbar-admin-new`), `api-cbar` dəyişmir

**Performance Goals**: əlavə sorğu yoxdur. Menyu eyni ağacdan serverdə qurulur. Client JS dəyişmir (nav zolağının görünüşü CSS sinifləridir)

**Constraints**:
- zolaq heç bir endə iki sətirə düşmür və üfüqi sürüşmə yaratmır;
- seed təkrar icraya dözümlüdür və redaktorun sonrakı dəyişikliyini saxlayır;
- mövcud cədvəllərə `ALTER` edilmir (root `CLAUDE.md`).

**Scale/Scope**: 10 yeni səhifə, 3 köçən səhifə (+ 113-ün 7 uşağı), 21 kökün sırası, 4 bayraq. Sayt: 3 fayl + testlər. Admin: 2 fayl + i18n + testlər

Açıq sual yoxdur. Ölçmədən asılı iki nöqtənin ehtiyat yolu research-dədir: en `lg`-də 8 bölmənin sığması (R2) və panelin sütun
bölgüsü (R4).

## Constitution Check

*GATE: Phase 0-dan əvvəl keçdi. Phase 1 dizaynından sonra yenidən yoxlandı, pozuntu yoxdur.*

| Maddə | Yoxlama | Nəticə |
|---|---|---|
| I — `product-host` referansdır | Köhnə saytda "Maliyyə sabitliyi" və "Rəqəmsal maliyyə ekosistemi" bölmələri yoxdur. Bu, Figma ilə gələn yeni quruluşdur. Köhnə səhifələrin (64, 65, 113) ünvanları qalır. `product-host` dəyişmir. Paritet aşağıdadır. | ✅ |
| II — Dörd müstəqil proyekt | 3 MR: `api-cbar-admin` (seed), `web-cbar-new`, `web-cbar-admin-new`. Deploy sırası research R7-dədir: əvvəl seed, sonra sayt. Paylaşılan kod yoxdur. Admin-in `MENU_BAR_SECTIONS` sabiti saytın `VISIBLE_SECTIONS`-unun sənədləşmiş güzgüsüdür. | ✅ |
| III — Admin/client ayrılığı | Sayt yalnız `api-cbar`-ın ağacını oxuyur, yeni sorğu yoxdur. Seed admin API-nin migrasiyasıdır, `api-cbar` yazmır. | ✅ |
| IV — Start sırası | Dəyişmir. Seed startup-da bir dəfə işləyir, imtiyaz yoxdursa xəbərdarlıq verib keçir. | ✅ |
| V — Sxem, migration, ikidillilik | Yalnız DML. Fayl adı `0042-financial-stability-nav-seed.sql` hər iki repoda təkdir, `BEGIN/COMMIT` yoxdur. Hər yeni səhifənin az/en tərcüməsi var (en qaralama), slug dildə təkdir (`-2`). `Cbar.Domain` dəyişmir. | ✅ |
| VI — Admin template stack | Mövcud kart, kit `RadioGroup`/`Field`/`Badge`, i18n `pages` namespace. Yeni ekran yoxdur. Rich text-ə toxunulmur, roundtrip lazım deyil. | ✅ |
| VII — Xarici kontraktlar | API cavab forması dəyişmir. Bütün mövcud ünvanlar qalır (slug-lar dəyişmir). `currencies` XML-ə toxunulmur. | ✅ |
| VIII — Verification | PGlite seed (2 icra + boş baza), `npm run verify` ×2 (+ Node 22 `test:run`), Edge CDP ölçmə (quickstart §3), səhifələrin açılması (§4), prod SQL yoxlaması (§5). | ✅ |

**Paritet (Maddə I.3)**

| `product-host` | Yeni qarşılıq | Status |
|---|---|---|
| "Dayanıqlı Maliyyə" kök bölmə | "Maliyyə sabitliyi"nin alt bölməsi, ünvanlar eyni | qalır, yeri dəyişir |
| "Maliyyə sabitliyi hesabatı", makroprudensial çərçivə "Nəşrlər"də | "Maliyyə sabitliyi" bölməsində, menyularda görünür | köçür |
| Strategiya, Yayım qrafiki, Sual-cavab, İstinadlar menyuda | ≥1360 hamburgerdə yox. Zolaq, planşet, mobil və footer-də (Sual-cavab), Media-da (Yayım qrafiki) var | geniş paneldən çıxır |
| — | "Rəqəmsal maliyyə ekosistemi" (8 boş səhifə) | yeni, məzmun sonra |

## Frontend Skills Gate

`senior-front`, `frontendpatterns`, `web-cbar-new` `frontend-standards` və `ui-kit-usage` yükləndi. `web-cbar-admin-new`-in öz
`frontend-standards`/`ui-kit-usage` skill-ləri `/speckit-implement`-də admin fazasından əvvəl yüklənir.

| UI piece | Kit components (`ui-kit-usage`) | Patterns (`frontendpatterns`) | Smells avoided (`senior-front`) |
|----------|----------------------------------|-------------------------------|----------------------------------|
| Nav zolağının 8/9 bölməsi | kit `cn`, Tailwind `max-desk:hidden` (rəng yoxdur) | progressive enhancement: CSS breakpoint, JS ilə ölçmə yox | client state for layout (priority+ nav rədd edildi), magic number (`VISIBLE_SECTIONS_NARROW` sabitdir) |
| Hamburger panelində kök bayrağı | mövcud `NavAnchor`, `desk:hidden` | semantic `<nav>/<ul>/<a>`, server komponenti | Shotgun Surgery: qayda bir yerdə (`OverflowPanel` sinif funksiyası), `isTopLinkSection` ilə yanaşı; derive, don't store (`inDropdownNav` ağacdan hesablanır) |
| Admin kartında kök qeydi | `Badge`, `FieldDescription`, mövcud `VisibilityRow` `notes` | qeyd mətndir, rəng tək deyil (a11y); radio `disabled` + izah | Duplicate Code: yeni sətir əvəzinə mövcud `notes` slotu; boolean flag soup yox (`rootPanelHidden` saf funksiya) |

Review: each frontend phase in tasks.md ends with `ui-kit-review` + the senior-front review checklist before `npm run verify`.

## Project Structure

### Documentation (this feature)

```text
specs/056-header-financial-stability-nav/
├── spec.md
├── plan.md              # bu fayl
├── research.md          # R1–R8
├── data-model.md        # ağac, sıra, bayraqlar
├── quickstart.md        # yoxlama və ölçmə
├── contracts/
│   ├── ui.md            # sayt: en üzrə tərkib, sinif qaydası
│   ├── admin-ux.md      # admin kartı kök bölmə üçün
│   └── seed.md          # 0042 qaydaları
├── checklists/requirements.md
└── tasks.md             # /speckit-tasks
```

### Source Code (repository root)

```text
product-rest/api-cbar-admin/
└── db/migrations/0042-financial-stability-nav-seed.sql        # yeni

product-rest/web-cbar-new/
├── src/shell/constants.ts            # VISIBLE_SECTIONS 9, VISIBLE_SECTIONS_NARROW 8
├── src/shell/nav.ts                  # NavSection.inDropdownNav (kök üçün isInDropdownNav)
├── src/shell/mega-menu.tsx           # zolağın 9-cu bəndi max-desk:hidden; OverflowPanel sinif qaydası; hamburger düyməsi
├── src/shell/nav.test.ts, mega-menu.test.tsx, nav-overflow.test.tsx
├── src/shared/testing/fixtures/pages.ts   # seed-dən sonrakı ağac forması (Maliyyə sabitliyi 3-cü, bayraqlı köklər)
├── docs/navigation-cms-guide.md      # yeni: header menyuları və kök bölmə bayrağı
├── docs/publications-cms-guide.md    # 64/65 artıq "Maliyyə sabitliyi"ndədir
└── CLAUDE.md                         # hamburger paneli bəndi

product-rest/web-cbar-admin-new/
├── src/features/pages/model/menu-visibility.ts       # MENU_BAR_SECTIONS, rootPanelHidden
├── src/features/pages/components/menu-visibility-card.tsx
├── src/features/pages/model/menu-visibility.test.ts, components/menu-visibility-card.test.tsx
└── src/locales/{az,en}/pages.json    # noneRoot, rootPanelHidden

CLAUDE.md (root), business_logic/* (/sync-business-logic), specs/054-publications-research/tasks.md (US6 seed nömrəsi 0043)
```

**Structure Decision**: üç mövcud komponent. Sayt dəyişikliyi `shell` slice-ındadır (FSD app qatı), entity qaydası
(`isInDropdownNav`) olduğu kimi işlənir. Admin dəyişikliyi `features/pages`-dədir. `api-cbar` və OpenAPI dəyişmir.

## Complexity Tracking

Pozuntu yoxdur.
