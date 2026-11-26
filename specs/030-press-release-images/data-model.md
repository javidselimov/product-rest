# Data model: Xəbər şəkilləri — sıralama (spec 030)

**Sxem dəyişmir** (FR-030): migration, yeni cədvəl, `Cbar.Domain` dəyişikliyi yoxdur.

## 1. Mövcud entity (yazılır)

| Entity | Sahələr | Qayda |
|---|---|---|
| `PressReleaseAsset` (`press_release_assets`) | `Id`, `PressReleaseId`, `MediaId`, `SortOrder` | `(PressReleaseId, MediaId)` unikal. Sıralama yalnız `SortOrder`-i 1..n yenidən yazır; sətirlər yaranmır/silinmir |

Bağla (`POST`) `SortOrder = max + 1` verir; sıralama 1..n-ə sıxır. Public API (`api-cbar`) oxuyur:
`OrderBy(SortOrder).ThenBy(Id)` → örtük (ilk `image/*`), qalereya (qalan `image/*`), qoşmalar.

## 2. Admin API DTO-ları

| DTO | Sahələr | İstifadə |
|---|---|---|
| `PressReleaseAssetOrderDto` (yeni) | `List<long> MediaIds` | `PUT …/assets/order` gövdəsi |
| `AttachAssetDto` | `long MediaId` | dəyişmir |
| `AssetRef` (cavab) | `mediaId`, `originalName`, `mimeType`, `sizeBytes` | dəyişmir — öz `id`-si yoxdur (research R1) |

Audit: `audit_log` sətri `action = press_releases.reorder_assets`, `entity = press_release`,
`entity_id = {id}`, `before = { mediaIds: [köhnə sıra] }`, `after = { mediaIds: [yeni sıra] }`.

## 3. Panel view modeli

| Tip | Sahələr | Qayda |
|---|---|---|
| `AttachedAsset` (`entities/media/model/types`) | `mediaId`, `originalName?`, `mimeType?`, `sizeBytes?` | dəyişmir |
| `AssetsSectionProps` | + `descriptionKey?`, `reorderable?`, `badgeFor?(asset, index, assets) → string \| null` | hamısı opsional, defolt söndürülüb |

Nişan funksiyası (press-reliz sarğısında): `!isImageMime(mimeType)` → `null`; şəkillər arasında
birinci → `attachments.cover`; digər şəkil → `attachments.gallery`.

## 4. i18n açarları

| Namespace | Açar | az |
|---|---|---|
| `media` | `assets.moveUpAria` / `assets.moveDownAria` | "{{name}} faylını yuxarı/aşağı köçür" |
| `media` | `assets.reordered` / `assets.reorderFailed` | "Sıra yeniləndi" / "Sıra yenilənmədi" |
| `pressReleases` | `attachments.title` / `attachments.description` | "Şəkillər və sənədlər" / "İlk şəkil saytda örtük, …" |
| `pressReleases` | `attachments.cover` / `attachments.gallery` | "Örtük" / "Qalereya" |
