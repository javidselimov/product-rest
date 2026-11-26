# Implementation Plan: Media → Qalereya

**Branch**: `feature/035-media-gallery-redesign` | **Date**: 2026-11-05 | **Spec**: [spec.md](./spec.md)

## Summary

`api-cbar`-a iki siyahı üçün `q/from/to` və `GET /videos/{id}` əlavə olunur (spec-first, `openapi/`). Saytda
`views/media-galleries` + `views/media-videos` bir `views/media-gallery-list`-ə birləşir; filtr Xəbərlərdən
`widgets/list-filter`-ə çıxır; kart `NewsGrid`-dir. Foto detalı `PhotoGallery`-yə keçir, video detalı yeni route-dur.

## Technical Context

- `api-cbar` (.NET 10, EF Core, read-only) — `MediaContentController`; `PressReleasesController`-dəki
  `MaxQueryLength`, `BakuOffset`, `StartOfBakuDay`, `EscapeLike` eyni nüsxədir (ortaq helper yoxdur).
- `web-cbar-new` (Next 16, FSD, Vitest + MSW). Miqrasiya, Domain, admin dəyişmir.
- Deploy sırası: `api-cbar` → `web-cbar-new`. Yeni sayt köhnə API-yə qarşı: filtr işləmir (parametrlər nəzərə
  alınmır), video detalı 404 verir — ona görə `api-cbar` əvvəl gedir.

## Struktur

```text
product-rest/api-cbar/
  openapi/paths/media-content.yaml, components/schemas/media-content.yaml, openapi.yaml (# Sync)
  src/Cbar.WebApi/Controllers/MediaContentController.cs
product-rest/web-cbar-new/src/
  features/media/api/media.api.ts        MediaListQuery, getVideo; getVideoStreams qalır (layout)
  features/media/model/schemas.ts        galleryDetail.title → string; cards.ts silinir
  widgets/list-filter/                   NewsFilter-dən; hidden sahələr children ilə
  widgets/news-grid/                     dateLabel nullable, imageExternal (YouTube unoptimized)
  widgets/video-player/                  client facade
  views/media-gallery-list/              loader + view + constants (9 kart, tablar)
  views/gallery/, views/video/           detallar
  app/[locale]/(content)/media/{galleries,videos}/page.tsx, videos/[id]/page.tsx
  app/globals.css                        --site-video-placeholder, --site-play-overlay (D-2)
  locales/{az,en}/media.json             gallery.*; watchLive, coverAlt, imageCount silinir
```

## Qərarlar

- Ayrı kart komponenti yazılmadı: Figma kartı Xəbər kartının instance-ıdır.
- YouTube önizləməsi `next/image`-in `unoptimized` rejimində (remotePatterns qəsdən yoxdur, spec 003 D1).
- `hasListFilters` ayrı `model.ts`-dədir: `'use client'` modulundan server loader-ə funksiya client reference kimi gəlir.
- Yoxlama: PGlite + socket (Docker yoxdur) üzərində real SQL; UI ölçməsi `next start` + test API proxy-si
  (`/videos/{id}` test API-də yoxdur) + headless Edge CDP.
