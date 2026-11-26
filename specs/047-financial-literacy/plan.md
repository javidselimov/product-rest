# Implementation Plan: Maliyyə savadlılığı bölməsinin Figma redizaynı

**Branch**: `047-financial-literacy` | **Date**: 2026-11-16 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/047-financial-literacy/spec.md`

## Summary

"Maliyyə savadlılığı" bölməsi bölmə şablonuna keçir (yeni `SectionKey` `literacy`). Dörd səhifə Figma görünüşünü iki yeni layout ilə alır:

- **`financial-literacy`** — kök 106. Bölmə başlıqları, sitat, 4 prinsip kartı, 7 hədəf qrupu etiketi, qalereya (mövcud `PhotoGallery`), CTA.
- **`literacy-platform`** — 110, 111, 112. Giriş, qeyd qutusu, foto sırası, xətli bölmələr, keçid düyməsi.

Bloklar redaktorun adi işarələməsindən oxunur (`h2`, `h3`, `blockquote`, `ul`, `data-media-link` paraqrafı), API və sxem dəyişmir.
`api-cbar-admin`-ə yalnız `0030` seed-i əlavə olunur. O, köhnə mətni (md5 ilə tanınır) Figma quruluşunda yenidən yazır. Ümumi məlumat, Seminarlar,
Müsabiqələr və "(Kopya)" alt ağacını sol menyudan çıxarır. `proxy.ts` Ümumi məlumatın ünvanını köka yönləndirir.

Test mühitində kök 106 artıq Ümumi məlumatın mətnini daşıyır, ona görə loader-ə fallback lazım deyil ([research.md](./research.md) R1).

## Technical Context

**Language/Version**: TypeScript 5 strict (iki frontend); SQL (PostgreSQL, bir seed migration-u). C# kodu dəyişmir.

**Primary Dependencies**: sayt — Next.js 16 App Router, `@cbar/lib-react-ui-kit`, Tailwind 4, react-i18next, mövcud `parseAbout`/`html-blocks`/
`CmsContent`/`PhotoGallery`/`SiteImage`/`section-shell`. Admin — TipTap (dəyişmir, yalnız fixture). Yeni dependency yoxdur.

**Storage**: `page_translations.content`, `page_details.show_in_side_nav` (mövcud).

**Testing**: Vitest + MSW (iki frontend, `npm run verify`, Node 24 və 22); layout fixture guard; admin `roundtrip` (unit + canlı); seed — PGlite
üzərində real icra; UI — fikstür proxy + Edge CDP ölçmə.

**Target Platform**: Linux konteynerlər (CBAR GitLab pipeline); brauzer 1728 / 744 / 390.

**Project Type**: web — üç upstream repo: `api-cbar-admin` (yalnız SQL), `web-cbar-new`, `web-cbar-admin-new` (yalnız fixture və test siyahısı).
`api-cbar` dəyişmir.

**Performance Goals**: Əlavə API çağırışı yoxdur (bloklar səhifə mətnindəndir, fayllar mövcud `assets`-dəndir). Parse O(blok).

**Constraints**:
- Migration yalnız əlavə olunur, adı unikaldır, mövcud cədvələ ALTER yoxdur, icazə yoxlaması var.
- `dangerouslySetInnerHTML` yalnız `widgets/cms-content`-də.
- Yeni `'use client'` yoxdur.
- Spec 032 sabitlər standartı.
- Layout fixture guard.
- `prettier --write` web-cbar-new-də işlədilmir.
- Kod şərhləri ingiliscə yazılır.

**Scale/Scope**: 1 yeni bölmə açarı, 2 layout (parser + widget), 11 ikon, 1 proxy qaydası, 1 seed, 2 fixture (×2 nüsxə), 1 yeni redaktor
təlimatı; ~6 sənəd faylı.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Maddə | Yoxlama | Status |
|---|---|---|
| I.2 | Köhnə saytın mətni referansdır, bütün paraqraflar yeni quruluşda qalır (data-model §4); `product-host` dəyişmir | ✔ |
| I.3 | URL-lər qalır. Ümumi məlumatın ünvanı 308 ilə köka gedir. Heç bir səhifə silinmir və görünməz edilmir, yalnız sol menyudan çıxır | ✔ |
| II.3 | 3 ayrı MR, deploy sırası aşağıdadır | ✔ |
| III.2–4 | Yazan yalnız `api-cbar-admin`-dir (seed). `api-cbar` dəyişmir, public filtrlər dəyişmir | ✔ |
| IV.2 | `api-cbar-admin` (seed) → `web-cbar-new`; admin fixture MR-ı müstəqildir | ✔ |
| V.1 | `Cbar.Domain` dəyişmir | ✔ |
| V.2 | `0030-financial-literacy-seed.sql` yeni və unikaldır. Yalnız DML-dir, icazə yoxlaması var, idempotentdir (md5 şərti) | ✔ |
| V.3 | az və en ayrı-ayrı yazılır. Bir dil redaktə olunubsa, digəri yenə yazılır | ✔ |
| V.4 | Chrome mətnləri (CTA düyməsi, şəkil adları, "yeni pəncərə") `about.json`-dadır, redaksiya mətni CMS-dəndir | ✔ |
| VI.5 | Redaktor extension-larına toxunulmur. İki fixture `roundtrip.test.ts`-ə və canlı `roundtrip`-ə əlavə olunur | ✔ |
| VII.2–3 | Endpoint və OpenAPI dəyişmir. Yeni yönləndirmə `legacyRedirect` qaydasıdır | ✔ |
| VIII | Real icra: [quickstart.md](./quickstart.md) | ✔ |

Dizayndan sonra təkrar yoxlama: data-model və kontraktlar heç bir maddəni pozmur. Complexity Tracking boşdur.

## Project Structure

### Documentation (this feature)

```text
specs/047-financial-literacy/
├── spec.md
├── plan.md                 # bu fayl
├── research.md             # R1–R10
├── data-model.md           # view-modellər + seed mətninin xəritəsi (az/en)
├── quickstart.md
├── contracts/
│   ├── ui-contract.md      # Figma ölçüləri (3 en, 2 layout)
│   └── cms-markup.md       # işarələmə qaydası + fixture forması
├── checklists/requirements.md
└── tasks.md                # /speckit-tasks
```

### Source Code — iş paketləri deploy sırası ilə

```text
A. product-rest/api-cbar-admin/                         (MR 1)
   db/migrations/0030-financial-literacy-seed.sql

B. product-rest/web-cbar-new/                           (MR 2, A-dan sonra; A-sız da təhlükəsizdir — köhnə mətn adi məzmun kimi görünür)
   src/entities/page-node/lib/tree.ts                                   (SectionKey 'literacy', SECTION_TITLES)
   src/features/about-content/model/{types.ts,layouts.ts,parse.ts,constants.ts}
   src/features/about-content/model/{financial-literacy.ts,financial-literacy.test.ts}   (yeni)
   src/features/about-content/model/{literacy-platform.ts,literacy-platform.test.ts}     (yeni)
   src/features/about-content/model/{layouts.test.ts,layout-fixtures.test.ts}
   src/features/about-content/fixtures/{financial-literacy.html,literacy-platform.html}  (yeni)
   src/widgets/about-blocks/{financial-literacy.tsx,literacy-platform.tsx,literacy-icons.tsx}  (yeni) + testlər
   src/widgets/about-blocks/{about-blocks.tsx,constants.ts,index.ts}
   src/views/cms-page/{loader.ts,index.tsx}                             (sectionLayout; Attachments-dən usedMediaIds çıxır)
   src/views/cms-page/literacy.test.tsx                                 (yeni)
   src/proxy.ts, src/proxy.test.ts                                      (umumi-melumat → kök, 308)
   src/locales/{az,en}/about.json                                       (literacy.*)
   src/shared/testing/fixtures/literacy-section.ts                      (yeni: ağac + səhifələr)
   docs/financial-literacy-cms-guide.md (yeni), docs/how-to-use.md, CLAUDE.md

C. product-rest/web-cbar-admin-new/                     (MR 3, B ilə eyni seriyada)
   src/features/rich-text/fixtures/layouts/{financial-literacy.html,literacy-platform.html}
   src/features/rich-text/roundtrip.test.ts, CLAUDE.md (fixture siyahısı)

R. Kök: CLAUDE.md (spec 047 bəndi), business_logic/ (/sync-business-logic)
```

**Structure Decision**: Sayt tərəfi mövcud `about-content` layout sisteminə qoşulur. `literacyLayoutFor` slug-ları iki yeni layout-a xəritələyir,
`parseAbout` `parseFinancialLiteracy(nodes, files)` və `parseLiteracyPlatform(nodes, files)`-i çağırır. Faylların `mimeType`-ı qalereyanın şəkil
yoxlaması üçündür. Loader yalnız `sectionLayout`-a bir hal əlavə edir. View `Attachments`-ə blokların istifadə etmədiyi faylları ötürür (bu, spec 038/040-ın
"bloklar faylları özü göstərir" qaydasının ümumiləşdirilmiş formasıdır). Bölmə şablonu `SECTION_TITLES`-ə bir sətir əlavə etməklə qoşulur
(spec 043 qaydası). Sol menyunun gizlədilməsi data-dır (spec 041), kodda xüsusi hal yoxdur.

**Deploy sırası**: A → B. C B ilə eyni MR seriyasında birləşir (`check:layout-fixtures` yalnız yan-yana checkout-da işləyir).

**İcra sırası (təklif)**: B-nin bölmə şablonu və `literacy-platform` (sadə layout) → `financial-literacy` → A (seed, fixture mətni ilə eyni) → C → sənədlər.

## Açıq suallar (dizayner)

İcranı bloklamır, MR təsvirində qeyd olunacaq ([research.md](./research.md) R6):

1. Virtual Təhsil səhifəsinin tablet və mobil kadrlarında "Facts" sırası (2017 / Ödənişsiz / 3 dil) var, desktop kadrında yoxdur. Plan onu **etmir**.
2. Portal səhifəsinin mətnində 3 şəkil var, Figma-da portalın foto sırası yoxdur. Plan onu **göstərir**.

## Complexity Tracking

Pozuntu yoxdur.
