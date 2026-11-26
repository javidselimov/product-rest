# Implementation Plan: Şəkil və məlumat yüklənməsində boş yer

**Branch**: `036-image-loading-states` (ayrıca branch yaradılmayıb, iş cari branch-dadır) | **Date**: 2026-11-06 | **Spec**: [spec.md](./spec.md)

## Summary

Dörd iş, hamısı `web-cbar-new`-də: (A) `Dockerfile`-da optimizer keşini yazıla bilən edirik; (B) `next/image` üzərində
`SiteImage` örtüyü shimmer, fade-in və xəta vəziyyəti verir; (C) ilk sıra və qonşu şəkillər əvvəlcədən yüklənir;
(D) əsas siyahı və detal route-ları spinner əvəzinə səhifə formasını göstərir. API, miqrasiya və admin dəyişmir.

## Technical Context

- **Stack**: Next 16 App Router, React 19, `@cbar/lib-react-ui-kit`, Tailwind 4, Vitest + jsdom (Next plugin-siz).
- **Mühit**: Docker bu maşında işləmir. Konteyner dəyişikliyi yalnız test deploy-dan sonra yoxlanır.
- **Məhdudiyyətlər**: nonce CSP (inline `onload` işləmir), JS-siz iş rejimi qorunur, spec 032 sabitləri,
  `no-magic-numbers`, yeni şərhlər ingiliscə, `prettier --write` işlədilmir.
- **Kit**: `Skeleton` = `animate-pulse rounded-md bg-accent`, `aria-hidden` özündədir, `motion-reduce` yoxdur.
- **Açıq sual yoxdur**, qərarlar: [research.md](./research.md).

## Constitution Check

| Maddə | Qiymət |
|---|---|
| I, III, V, VI | Toxunulmur: köhnə sayt, admin, sxem dəyişmir |
| II | Bir repo, bir MR |
| IV | Start və deploy sırası dəyişmir |
| VII.2–3 | URL və API kontraktı dəyişmir |
| VII.4 | `Dockerfile` pipeline-a uyğun qalır: yalnız runtime mərhələsinə bir `RUN` əlavə olunur |
| VIII | `npm run verify`, real brauzer ölçməsi, deploy-dan sonra header yoxlaması. Maddə VIII.1 "`web-cbar`-da test yoxdur" köhnədir: `web-cbar-new`-də Vitest var və merge şərtidir |

Pozuntu yoxdur.

## Project Structure

```text
specs/036-image-loading-states/
  spec.md, plan.md, research.md, quickstart.md, contracts/ui-contract.md, tasks.md

product-rest/web-cbar-new/
  Dockerfile                                  .next/cache node sahibliyində
  src/shared/ui/site-image.tsx                yeni, +site-image.test.tsx
  src/shared/constants/layout.ts              EAGER_CARD_COUNT
  src/app/globals.css                         fade, reveal, route skeleton qaydaları
  src/widgets/news-grid/                      SiteImage, eager; NewsGridSkeleton
  src/widgets/section-shell/                  SectionShellSkeleton
  src/widgets/hero-slider/, photo-gallery/    SiteImage, əvvəlcədən yükləmə
  src/widgets/{video-player,about-blocks,home-cards,attachments,content-list}/   SiteImage
  src/views/{money-mark,money-marks,press-release}/index.tsx                     SiteImage
  src/app/[locale]/(content)/media/{galleries,videos}/{,[id]/}loading.tsx        yeni
  src/app/[locale]/(content)/media/events/{,[slug]/}loading.tsx                  yeni
  src/app/[locale]/(content)/press-releases/{,[slug]/}loading.tsx                yeni
```

Ayrıca `data-model.md` yoxdur: yeni məlumat yoxdur. Şəklin vəziyyət modeli [ui-contract.md](./contracts/ui-contract.md)-dədir.

## Yerinə yetirmə sırası

1. A (`Dockerfile`): müstəqildir, ən böyük təsir.
2. B: `SiteImage`, CSS, test, sonra widget-lərin köçürülməsi.
3. C: eager və əvvəlcədən yükləmə.
4. D: skeleton-lar və `loading.tsx`.
5. Yoxlama: verify (Node 24 və 22), brauzer ölçməsi, sənəd.

## Post-design Constitution Check

Dəyişiklik yoxdur. Təsdiqlənmiş plandan fərqlər: skeleton-lar `shared/ui/skeletons/`-də yox, öz widget-lərinin və
`views/*/skeleton.tsx`-in yanındadır (research R6); `SiteImage` kit `Skeleton`-u yox, eyni class-lı `span` işlədir (R4).
