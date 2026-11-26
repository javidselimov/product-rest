# Data Model: Admin paneldə şəkillərin önizləməsi

**Feature**: [spec.md](./spec.md) | **Date**: 2026-10-01

**Sxem dəyişikliyi yoxdur.** Migration, `Cbar.Domain` dəyişikliyi və yeni cədvəl yoxdur. Bu sənəd
mövcud məlumatın önizləmə üçün necə oxunduğunu təsvir edir.

## 1. `media_assets` (mövcud, dəyişmir)

| Sahə | Önizləmədə rolu |
| --- | --- |
| `id` | Endpoint açarı (`/media/{id}/preview`) və panel keş açarı |
| `storage_key` | MinIO obyekt adı. Yalnız serverdə istifadə olunur, cavabda görünmür |
| `original_name` | `alt` mətni, fayl adı və `Content-Disposition` faylı |
| `mime_type` | `image/*` olduqda önizləmə, əks halda 415 (research R3) |
| `checksum_sha256` | `ETag` |
| `width`, `height` | Önizləmədə istifadə olunmur. Çərçivə sabitdir və `object-contain` ilə işləyir |
| `deleted_at` | Global query filter. Soft-delete olunmuş fayl üçün 404 qaytarılır |

## 2. Media istinadları (mövcud, dəyişmir)

Önizləmə göstərilən yerlər və mime-ın haradan bilindiyi:

| Yer | Mənbə | Mime məlum? |
| --- | --- | --- |
| CRUD form sahəsi (`type: 'media'`), məsələn homepage banner/slider/nəşr, image-popups (`perLocale`), meas, money-marks (ön/arxa), organization (bölmə, rəhbər foto) | detail cavabında `mediaId` + bəzən `mediaName` | Xeyr, server qərar verir (415) |
| Seçicidən yenicə seçilmiş fayl | `MediaItem` | Bəli |
| Media seçici, media kitabxanası | `GET /media` → `MediaItem` | Bəli |
| Assets (səhifə, qanun, press-reliz əlavələri) | `AttachedAsset.mimeType` | Bəli |
| Qalereya şəkilləri | `GalleryImage` (mime yoxdur) | Xeyr, server qərar verir |

## 3. Panel tərəfi vəziyyəti (`MediaPreview`)

Bu vəziyyət serverə yazılmır, yalnız query keşində yaşayır.

```text
            enabled=false (görünmür / id yoxdur)
idle ───────────────────────────────────────────▶ idle
  │ görünən sahəyə daxil oldu
  ▼
loading ──200 image/*──▶ image   (blob → object URL, alt = ad)
   │────415──────────▶ notImage (mime ikonu + ad)
   │────404──────────▶ unavailable (neytral yer tutucu + ad)
   └────şəbəkə/5xx───▶ unavailable (təkrar cəhd yoxdur, forma işləyir)
```

- Keş açarı `['media', 'preview', id]` olur. Parametrlər: `staleTime: Infinity`, `gcTime: 5 dəq`, `retry: false`.
- Mime əvvəlcədən məlumdursa və `image/*` deyilsə, sorğu göndərilmir və vəziyyət birbaşa `notImage` olur.
- 401 halında interceptor sessiyanı yeniləyib sorğunu bir dəfə təkrarlayır. Refresh rədd edilsə, panelin ümumi çıxış axını işləyir.
