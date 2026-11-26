# Data Model: 033 Müsahibələr və çıxışlar

## `press_releases.type` (sxem dəyişmir)

| Dəyər | Ad | Siyahı kartı | Detal |
|---|---|---|---|
| `1` | Xəbər | şəkilli | örtük, qalereya, tarix, qoşmalar |
| `2` | Elan | mətn | tarix, qoşmalar (şəkil də fayl sətridir) |
| `3` | **Müsahibə və çıxış** | şəkilli | mətn, `Save as PDF`, qalan qoşmalar; örtük, qalereya, tarix yoxdur |

Etibarlılıq admin API-dədir (`IsValidType`). DB-də CHECK əlavə olunmur, mövcud qayda davam edir.

## `press_release_asset_details` (yeni yoldaş cədvəl)

Miqrasiya `product-rest/api-cbar-admin/db/migrations/0017-press-release-asset-details.sql`:

| Sütun | Tip | Null | Qayda |
|---|---|---|---|
| `asset_id` | `bigint` | yox | PK; `press_release_assets(id)`-yə FK, icazə varsa, `ON DELETE CASCADE` |
| `locale` | `varchar(5)` | bəli | `locales(code)`-a FK, icazə varsa; `NULL` = hər iki dil |

- Sütun yox, cədvəl: mövcud cədvəldə `ALTER TABLE` paylaşılan mühitlərdə yıxılır (research R2).
- Sətir yoxdursa fayl hər iki dildədir. `BEGIN`/`COMMIT` yoxdur. Backfill yoxdur.
- FK-lər `has_table_privilege(..., 'REFERENCES')` ilə qoşulur. FK olmasa `DetachAsset` sətri özü silir, dili
  isə controller `locales`-a görə yoxlayır.
- Ad unikaldır: `api-cbar/db/migrations`-da miqrasiya yoxdur, admin-də sonuncu `0016`-dır.
- `cbar_web_ro`-ya `SELECT` miqrasiyada açıq verilir (`0001` yalnız mövcud cədvəlləri əhatə edir).

## EF modeli

`PressReleaseAssetDetail { long AssetId; string? Locale }`, `PressReleaseAsset.Details`, `CbarDbContext`-də
`0016` nümunəsi ilə xəritələmə; hər iki `Cbar.Domain` kopyasında bayt-bayt eyni.

## Görünürlük qaydası

Qoşma `a` dili `L` olan sorğuda görünür ⇔ `a.Details!.Locale == null || a.Details.Locale == L`.

Bu süzmədən sonra, sıra (`sort_order`, `id`) üzrə:

| Tip 3 detal | Seçim |
|---|---|
| Kart şəkli | ilk `image/*` (`imageUrl`) — detalda göstərilmir |
| `Save as PDF` | ilk `application/pdf` |
| "Sənədlər" | qalan bütün qoşmalar, ikinci şəkil daxil |

## Vəziyyət keçidləri

- Tip dəyişəndə qoşmalar və dil qalır, görünüş yeni tipin qaydasına keçir.
- Dil dəyişəndə audit yazılır: `press_releases.set_asset_locale`, `before`/`after` ilə.
- Qoşma silinəndə dil də silinir. Sıralama dili dəyişmir.

## İstifadə olunmayan

`press_release_questions` və `press_release_votes` toxunulmur.
