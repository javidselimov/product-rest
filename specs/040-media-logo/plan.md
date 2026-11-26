# Implementation Plan: Mərkəzi Bankın loqosu — redaktor markup-ı və səhifə faylları

**Branch**: `040-media-logo` | **Date**: 2026-11-11 | **Spec**: [spec.md](spec.md)

**Input**: `specs/040-media-logo/spec.md`, yanaşma A (istifadəçi qərarı 2026-11-11)

## Summary

Mövcud CMS səhifəsi `553` (`merkezi-bankin-logosu`) Media şablonunda yeni `brand-logos` layout-u alır. Redaktorun
birinci cədvəli versiya kartlarına çevrilir, birinci versiyanın şəkli Hero olur. Səhifənin faylları yükləmə kartlarıdır,
adı, növü və ölçüsü mövcud `GET /api/v1/pages/{slug}` cavabından gəlir. API, baza və admin kodu dəyişmir. Admin panelə
yalnız layout fikstürü düşür.

## Technical Context

**Language/Version**: TypeScript strict, React 19, Next.js 16 (web-cbar-new); Vite + TipTap (web-cbar-admin-new, yalnız test)

**Primary Dependencies**: `@cbar/lib-react-ui-kit`, Tailwind 4, `shared/lib/html-blocks` (DOM-suz parser), `widgets/section-shell`

**Storage**: Yoxdur. Mövcud `pages`, `page_assets`, `media_assets`

**Testing**: Vitest + MSW, `npm run verify` hər iki frontenddə; admin `roundtrip.test.ts`

**Target Platform**: Next standalone server (SSR), brauzer API çağırmır

**Project Type**: Web, 2 komponent (web-cbar-new, web-cbar-admin-new)

**Performance Goals**: Əlavə API sorğusu yoxdur: səhifə və fayllar eyni `getPage` cavabındadır

**Constraints**: `dangerouslySetInnerHTML` yalnız `widgets/cms-content`; magic number yoxdur (spec 032); rənglər yalnız token; layout guard məcburidir

**Scale/Scope**: 1 səhifə, 1–8 versiya, 0–6 fayl, 2 dil

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Maddə | Yoxlama | Nəticə |
|---|---|---|
| I | Köhnə saytda loqo səhifəsi yoxdur, əvəz edilən davranış yoxdur | Keçir |
| II | İki komponent = iki MR (web-cbar-new, web-cbar-admin-new). Paylaşılan kod yoxdur, fikstür iki nüsxədir | Keçir |
| III | Sayt yalnız `api-cbar`-dan oxuyur, serverdə. Admin yalnız mövcud səhifə redaktorudur | Keçir |
| IV | Port və start sırası dəyişmir | Keçir |
| V | Sxem və miqrasiya dəyişmir, ikidillilik mövcud `page_translations`/`page_asset_translations` ilədir | Keçir |
| VI | Admin kodu dəyişmir, TipTap extension-ları toxunulmazdır, yalnız roundtrip fikstürü | Keçir |
| VII | Yeni endpoint və ünvan yoxdur, səhifə öz CMS ünvanında qalır | Keçir |
| VIII | `npm run verify` hər iki frontenddə, test API ilə real icra (`quickstart.md`), Figma ölçüləri brauzerdə ölçülür | Keçir |

Faza 1-dən sonra yenidən yoxlandı: dəyişiklik yoxdur.

## Project Structure

### Documentation (this feature)

```text
specs/040-media-logo/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── cms-markup.md
│   └── ui-contract.md
├── checklists/requirements.md
└── tasks.md
```

### Source Code

```text
product-rest/web-cbar-new/
├── src/features/about-content/
│   ├── fixtures/brand-logos.html              yeni: guard fikstürü
│   └── model/
│       ├── types.ts                           'brand-logos' layout, LogoVersion, LogoDownload, BrandLogosBlock
│       ├── constants.ts                       MIN/MAX_LOGO_CELLS, MAX_LOGO_VERSIONS, DARK_BACKGROUND_WORDS
│       ├── layouts.ts                         MEDIA_LAYOUTS-a 4 slug
│       ├── brand-logos.ts                     yeni: parser
│       ├── brand-logos.test.ts                yeni
│       ├── parse.ts                           dispatch
│       └── layout-fixtures.test.ts            EXPECTED_BLOCKS sətri
├── src/entities/content/lib/files.ts          formatFileSize(bytes, locale), fileFormatLabel(mime, name)
├── src/features/organization/model/photos.ts  formatPhotoSize → entities köməkçisi (təkrar silinir)
├── src/widgets/about-blocks/
│   ├── brand-logos.tsx                        yeni: Hero + versiya şəbəkəsi + yükləmə kartları
│   ├── brand-logos.test.tsx                   yeni
│   └── about-blocks.tsx                       case 'brand-logos'
├── src/views/cms-page/index.tsx               bu layout-da Attachments göstərilmir
├── src/views/cms-page/brand-logos.test.tsx    yeni: loader + view (MSW)
├── src/app/globals.css                        spec 040 token bloku
├── src/locales/{az,en}/media.json             "Yüklə"/"Download", aria etiketi
├── docs/media-cms-guide.md                    bölmə
└── CLAUDE.md                                  Media qeydinə bir sətir

product-rest/web-cbar-admin-new/
├── src/features/rich-text/fixtures/layouts/brand-logos.html   eyni fayl
└── src/features/rich-text/roundtrip.test.ts                   siyahıya 'brand-logos'

merkezi-bankin-logosu-html/{az.html,en.html,README.md}     hazır məzmun (repo kökü)
dokumentasiyalar/merkezi-bankin-logosu-guide.md            redaktor təlimatı
CLAUDE.md (root)                                            Media siyahısına bir sətir
```

**Structure Decision**: Media sorğuları (spec 037) nümunəsi: layout `features/about-content`-də, widget `about-blocks`-da,
loader dəyişmir, çünki fayllar artıq `parseAbout`-a `context.files` kimi ötürülür.

## Deploy sırası

İki MR bir-birindən asılı deyil. Admin MR yalnız testdir. Site MR deploy olunandan sonra redaktor məzmunu yapışdırır,
fayl yükləyir, başqa deploy lazım deyil.

## Complexity Tracking

Yoxdur.
