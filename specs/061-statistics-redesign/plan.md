# Implementation Plan: "Statistika" bölməsi — Figma şablonu, giriş və fayl səhifələri (faza 1)

**Branch**: `061-statistics-redesign` | **Date**: 2026-11-27 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/061-statistics-redesign/spec.md`

## Summary

Statistika bölməsi `section-shell` şablonuna keçir (`SectionKey 'statistics'`). Səhifələrin görünüşü slug-a görə seçilir:
- Makro, Pul-kredit və Ödəniş səhifələri yeni `statistics-files` görünüşünü alır: kateqoriya zolağı, qruplanmış XLS kartları, "Son yenilənmə" zolağı və ZIP.
- NSDP yeni `statistics-datasets` görünüşünü alır: hər datasetin bir kartında XML və XLS.
- Metodologiya və Reviziya mövcud `document-list` görünüşü ilədir.
- Kök, Maliyyə sektoru və faza 2 səhifələri `plain` qalır.

Data mövcud cədvəllərdən gəlir: səhifə faylları və onların qrup adları. Public API-yə yalnız bir əlavə sahə gəlir: faylın yüklənmə tarixi (`uploadedAt`). Qrafik səhifəsi `/statistics/charts`-a köçür, `/en/statistics` CMS kökünü açır.

Bir seed miqrasiyası (`0046`) ağacın sırasını, başlıqları, iki yeni səhifəni, fayl qruplarını və 8 fayl başlığını Figma-ya gətirir. Seed yalnız köhnə vəziyyəti tanıyanda yazır, heç nə silmir və heç bir cədvəli dəyişmir.

## Technical Context

**Language/Version**: TypeScript 5 (strict), Next.js 16 App Router, React 19 (`web-cbar-new`); C# .NET 10 (`api-cbar`); PostgreSQL PL/pgSQL `DO`
blok (`api-cbar-admin` miqrasiyası); Node 24/22 (seed generatoru).

**Primary Dependencies**: mövcud — `@cbar/lib-react-ui-kit`, Tailwind 4, Zod, react-i18next, `shared/lib/xlsx/zip.ts` (`createZip`, ZIP üçün);
EF Core (API). **Yeni runtime asılılıq yoxdur.**

**Storage**: PostgreSQL (sxem dəyişmir), MinIO (fayllar `api-cbar` media endpoint-i ilə, sayt `server/media-proxy` ilə).

**Testing**: Vitest + MSW + Testing Library (sayt, admin fikstür testi); xUnit (`Cbar.WebApi.Tests`, yeni test yoxdur — proyeksiya
dəyişikliyi `dotnet build` + endpoint çağırışı ilə); seed PGlite/pg_dump üzərində (quickstart §4).

**Target Platform**: SSR Node server (standalone), brauzerlər JS-siz də.

**Project Type**: web (public site + public API + CMS API miqrasiyası).

**Performance Goals**: səhifə yükü indiki CMS səhifəsi qədər (bir `pages/{slug}` + ağac sorğusu); ZIP ≤ 60 fayl / 50 MB, axın yox,
yaddaşda qurulur (43 fayl × ~1 MB real ölçüdə qəbul ediləndir; limitlər sabitdir).

**Constraints**: Figma-ya uyğunluq (gizli qatlar qurulmur); DB qorunması (seed-contract Q0–Q10); JS-siz işləmə; no magic numbers
(spec 032); `dangerouslySetInnerHTML` yalnız `cms-content`; route faylları nazik.

**Scale/Scope**: 8 ekran × 3 enlik, 43 + 12 + metodika faylı; 1 miqrasiya; 1 API sahəsi.

## Constitution Check

| Maddə | Yoxlama | Status |
|---|---|---|
| I.2 product-host | Əvəz edilən: `visitor` statik səhifələri (Statistika CMS səhifələri), dəyişmir; paritet cədvəli spec-də | ✅ |
| I.3 səssiz itki yoxdur | qrafik səhifəsi köçür (link yenilənir), faza 2 məzmunu tam qalır, "(Kopya)" yalnız menyudan çıxır, heç nə silinmir; `statsDB` qrafikləri açıq "xaricdə" | ✅ |
| II.3 iki+ proyekt | üç iş paketi, deploy sırası: admin seed → api-cbar → web-cbar-new (spec, quickstart §5) | ✅ |
| III.2 yeganə yazan | seed `api-cbar-admin`-dədir; `api-cbar` yalnız SELECT proyeksiyası | ✅ |
| III.3 public filtr | `GetBySlug` filtrləri dəyişmir; ZIP yalnız public səhifənin fayllarını public API ilə çəkir | ✅ |
| V.1 Cbar.Domain | dəyişmir | ✅ |
| V.2 miqrasiya | yeni fayl `0046-…`, append-only, `BEGIN/COMMIT` yox, `IF NOT EXISTS`/guard; `ALTER` yox | ✅ |
| V.3 ikidillilik | az/en başlıqlar, en-də qrup yoxdur (Qərar 8, açıq fərq) | ✅ |
| V.4 editorial API-dən | kart və başlıq mətnləri API-dən; yalnız chrome etiketləri locale fayllarında | ✅ |
| VII.2 URL-lər | slug-lar dəyişmir; `/statistics` → CMS, qrafik `/statistics/charts` (yeni saytın öz səhifəsi idi, köhnə saytda yox) | ✅ |
| VII.3 API geriyə uyğun | yalnız əlavə sahə | ✅ |
| VIII verification | verify + build + test API ilə səhifə icrası + seed snapshot | ✅ |
| Yeni asılılıq | yoxdur (`createZip` mövcuddur) | ✅ |

Pozuntu yoxdur, Complexity Tracking boşdur.

## Frontend Skills Gate

Yüklənib: `senior-front`, `frontendpatterns`, `web-cbar-new` `frontend-standards` və `ui-kit-usage` (2026-11-27). `web-cbar-admin-new`-də
yalnız fikstür/roundtrip testi dəyişir (UI yoxdur).

| UI piece | Kit components (`ui-kit-usage`) | Patterns (`frontendpatterns`) | Smells avoided (`senior-front`) |
|----------|----------------------------------|-------------------------------|----------------------------------|
| Bölmə şablonu | mövcud `SectionShell` | Server Component, semantic nav | Duplicate Code (yeni shell yazmamaq) |
| Kateqoriya zolağı (desktop/tablet) | kit tokenləri; `next/link` | URL state (`?group=`), progressive enhancement, `aria-current="page"` | Client state for server data; `<div onClick>` |
| Kateqoriya menyusu (mobil) | mövcud `YearMenu` (native `<details>` + linklər), `CaretDownIcon` (`/icons`, `aria-hidden`) | Disclosure, platform first | Hand-rolled dropdown, `'use client'` page shell |
| Fayl kartı | mövcud `FilePill`, `DocumentCard`-ın `statistics` variantı (`DOCUMENT_CARD_VARIANTS`) | Whole-card link, new tab `rel="noopener"` | Duplicate Code; boolean prop soup (variant union) |
| "Son yenilənmə" zolağı | kit tokenləri, `FilePill` (ZIP) | Download link (`download` + `Content-Disposition`) | Magic numbers (sabitlər) |
| NSDP dataset kartı | `FilePill` × 2 linklər, `aria-label` | Nested interactive yox (kart link deyil) | Iç-içə `<a>` |
| Qruplama/tarix modeli | — | Pure functions, derive-don't-store | Feature Envy (view-da parsing), Primitive Obsession (tarix sətri) |
| ZIP route handler | — | Resilience: limitlər, all-or-nothing, logging; server-only | Silent partial failure |

Review: tasks.md-də hər frontend fazası `ui-kit-review` + senior-front review checklist ilə bitir, sonra `npm run verify`.

## Project Structure

### Documentation (this feature)

```text
specs/061-statistics-redesign/
├── spec.md, checklists/requirements.md
├── plan.md               # bu fayl
├── research.md           # R1–R13
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── ui-contract.md    # Figma ölçüləri, §1–§7
│   ├── public-api.md     # PageAsset.uploadedAt, ZIP ünvanı
│   └── seed-contract.md  # Q0–Q10 (DB qorunması)
└── seed/
    ├── tree.json         # ağac, başlıqlar, yeni səhifələr
    ├── file-groups.json  # 43 fayl: legacy → figma, qrup, Ödəniş sırası (generasiya olunub)
    └── build-seed.mjs    # → api-cbar-admin/db/migrations/0046-statistics-section-seed.sql (tasks)
```

### Source Code

```text
product-rest/api-cbar-admin/
└── db/migrations/0046-statistics-section-seed.sql            # yeni, generasiya olunur

product-rest/api-cbar/
├── openapi/components/schemas/pages.yaml                      # PageAsset.uploadedAt (əvvəl)
└── src/Cbar.WebApi/Controllers/PagesController.cs             # proyeksiya + 1 sahə

product-rest/web-cbar-new/src/
├── app/[locale]/(content)/statistics/
│   ├── page.tsx                      # SİLİNİR (R1)
│   ├── charts/page.tsx               # köçən qrafik səhifəsi
│   ├── files/[slug]/route.ts         # ZIP (R8)
│   └── azir/…                        # dəyişmir
├── entities/page-node/lib/tree.ts    # SectionKey 'statistics', SECTION_TITLES, slug sabitləri
├── entities/content/model/schemas.ts # uploadedAt optional
├── features/about-content/model/     # layouts.ts statisticsLayoutFor, types.ts 2 yeni kind, fixtures/*.html, layout-fixtures.test.ts
├── features/statistics/model/        # YENİ: groups.ts, dates.ts, datasets.ts, zip-entries.ts (+ testlər), constants.ts
├── features/statistics/api/zip.ts   # YENİ: səhifə → fayllar → createZip (server-only; `features/*/api` `@/server`-i görür)
├── shared/lib/xlsx/zip.ts            # store (method 0) seçimi
├── views/cms-page/                   # loader: statistics blokları; index: yeni layout-lar
├── views/statistics → views/statistics-charts
├── widgets/statistics-files/         # YENİ: category-bar, file-group, updated-bar, dataset-card
├── widgets/about-blocks/document-card.tsx, constants.ts   # 'statistics' variantı
├── widgets/home-cards/*              # moreHref → /statistics/charts
├── locales/{az,en}/statistics.json   # chrome: "Hamısı", "Yenilənib", "SON YENİLƏNMƏ", "N statistik cədvəl · Excel formatında", "Yayım qrafiki", "Hamısını yüklə (ZIP)"
└── shared/testing/handlers + fixtures # uploadedAt, statistika səhifələri

product-rest/web-cbar-admin-new/src/features/rich-text/
├── fixtures/layouts/statistics-files.html, statistics-datasets.html
└── roundtrip.test.ts                 # siyahıya 2 layout

docs:  web-cbar-new/docs/statistics-cms-guide.md (yeni), navigation-cms-guide.md, CLAUDE.md (root), business_logic (sync skill),
       api-cbar/openapi (sync-openapi)
```

**Structure Decision**: mövcud FSD slotları istifadə olunur. Yeni slice-lar `features/statistics` (saf model), `widgets/statistics-files`
(server komponentləri) və `features/statistics/api/zip.ts`-dir. Shell, kart, menyu və ZIP writer yenidən yazılmır.

## Phase sırası (tasks üçün)

0. **R1 yoxlaması**: `/en/statistics` catch-all-a düşürmü? Build + sorğu, nəticəyə görə R1 və ya ehtiyat yolu.
1. **API (spec-first)**: `pages.yaml` → lint/bundle → təsdiq → controller → build → endpoint çağırışı.
2. **Seed**: generator → SQL → PGlite snapshot yoxlaması (quickstart §4) → review (Q0 grep).
3. **Sayt şablonu**: SectionKey, layout seçimi, qrafik səhifəsinin köçməsi, ana səhifə linkləri (US1, US5).
4. **Fayl səhifələri**: model (TDD) → widget-lər → loader/view → ZIP (US2, US3).
5. **NSDP, Metodologiya, Reviziya, Maliyyə sektoru** (US4).
6. **Qoruma**: fikstürlər, `EXPECTED_BLOCKS`, admin roundtrip; `verify` hər iki frontend.
7. **Figma tutuşdurması** 3 enlikdə; `ui-kit-review` + senior-front review.
8. **Sənədlər**: CMS təlimatı, naviqasiya təlimatı, CLAUDE.md, `/sync-business-logic`, `/sync-openapi`.

## Complexity Tracking

Boş: Constitution Check-də pozuntu yoxdur.
