# Implementation Plan: Elanlar — Figma-dakı şəkilsiz kart və detal

**Branch**: `feature/031-announcements-layout` | **Date**: 2026-11-03 | **Spec**: [spec.md](./spec.md)

## Summary

Elanlar (`press_releases.type = 2`) saytda Figma `1048:23221` (siyahı) və `1298:20343` (detal) üzrə
şəkilsiz render olunur: `NewsGrid` mətn variantı, detalda örtük/qalereya söndürülür və şəkil qoşmaları
adi fayl sətri kimi qalır. Admin paneldə elanın qoşma bölməsində nişanlar götürülür, izah elana uyğun
olur. API və sxem dəyişmir.

Əsas qərarlar:

- **Render qərarı `type`-a görə, yeni entity yox** — ünvan, loader, filtr, paginasiya 029-dan qalır.
- **Şəkil qoşmaları atılmır** — `Attachments imagesAsFiles` ilə fayl sətri (miniatür zolağı deyil),
  çünki Figma "şəkil yoxdur" deyir, redaktorun yüklədiyi fayl isə itməməlidir.
- **`splitPressReleaseAssets`-ə parametr**, ayrıca funksiya yox — detal loader-ində bir yer dəyişir.
- **Admin-də yalnız nişan + izah** — sıralama saytdakı qoşma sırasını idarə etdiyi üçün qalır.

## Technical Context

**Language/Version**: TypeScript 5 strict — Next.js 16 App Router + React 19 (`web-cbar-new`); React 19 +
Vite (`web-cbar-admin-new`)

**Primary Dependencies**: `@cbar/lib-react-ui-kit` (`lib` `cn`), Tailwind 4; react-i18next. **Yeni
dependency yoxdur.**

**Storage**: dəyişmir.

**Testing**: Vitest + Testing Library + MSW (`onUnhandledRequest: 'error'`), `npm run verify` hər iki
proyektdə; testlər Node 22 ilə də. Brauzer ölçməsi `local:testcbar` (:3002) + `getBoundingClientRect`.

**Project Type**: web application — 2 frontend komponenti, 2 MR, deploy sırası asılılığı yoxdur.

**Constraints**: FSD istiqaməti (views → widgets → features); `'use client'` əlavə olunmur (hamısı
server komponentidir); semantik token-lər; kod şərhləri ingiliscə; fikstürlər UTF-8.

## Constitution Check

- **I.2 `product-host` istinadı** — spec-də cədvəl.
- **II Hər komponent öz MR-ı** — 2 MR (`web-cbar-new`, `web-cbar-admin-new`).
- **VII.3 Geriyə uyğunluq** — API/sxem toxunulmur; 029-dan əvvəlki API (`type` yox) xəbər sayılır.
- **Sayt: `dangerouslySetInnerHTML` yalnız cms-content; brauzer API-yə getmir** — dəyişmir.
- **Panel: Zod, token yaddaşda, i18n açar bərabərliyi** — yeni açar hər iki dildə.

## Project Structure

### Documentation (this feature)

```text
specs/031-announcements-layout/
├── spec.md
├── plan.md
├── tasks.md
├── contracts/ui-contract.md
└── visual-diff.md            # ölçmədən sonra
```

### Source Code

```text
product-rest/web-cbar-new/src/
├── widgets/news-grid/news-grid.tsx                    # + variant 'photo' | 'text'
├── widgets/news-grid/index.ts                         # + NewsGridVariant
├── widgets/attachments/attachments.tsx                # + imagesAsFiles
├── views/press-releases/index.tsx                     # variant = type === '2' ? 'text' : 'photo'
├── views/press-release/loader.ts                      # photos: type !== '2'
├── views/press-release/index.tsx                      # imagesAsFiles={type === '2'}
├── features/press-releases/model/split-assets.ts      # { photos } parametri
├── shared/testing/fixtures/press-releases.ts          # elan 1 imageUrl; elan detalı şəkil + PDF; tək şəkilli xəbər
├── shared/testing/handlers/press-releases.ts          # yeni detal fikstürü
└── *.test.ts(x)                                        # siyahı, detal, split-assets

product-rest/web-cbar-admin-new/src/
├── features/press-releases/components/press-release-attachments-section.tsx   # type 2: nişan yox, elan izahı
├── locales/{az,en}/pressReleases.json                 # attachments.descriptionAnnouncement
├── shared/testing/fixtures/press-releases.ts          # 3 ↔ 4 növ dəyişimi; elanda şəkil + PDF
└── features/press-releases/press-releases.test.tsx    # + elan testi, siyahı iddiaları

specs/029-media-news/spec.md                            # Clarifications: 031 istinadı
FIGMA-REDIZAYN-PLANI.md                                 # 031 bölməsi
```

## Mərhələlər (commit-lər)

1. **Spec sənədləri + tracker** (`docs(specs): 031 announcements layout`).
2. **web-cbar-new** (`feat(web-cbar-new): 031 announcements without images`) — gate: `npm run verify`
   (+ Node 22 vitest).
3. **web-cbar-admin-new** (`feat(web-cbar-admin-new): 031 announcement attachments text`) — gate:
   `npm run verify`.
4. **Ölçmə** `local:testcbar` → `visual-diff.md` + tracker (`docs(specs): 031 visual diff`).

Commit yalnız istifadəçi istəyəndə.

## Complexity Tracking

Yoxdur.
