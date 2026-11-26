# Data Model: Şəkilli popup

Migration: `api-cbar-admin/db/migrations/0006-image-popups.sql`. Bu ad hər iki API repo-su üzrə unikaldır: `api-cbar/db/migrations`-da yalnız README var, digər spec-lər də `0006` adını tutmayıb.

## Cədvəllər

### `image_popups`

| Sütun | Tip | Qayda |
| --- | --- | --- |
| `id` | `serial PRIMARY KEY` | |
| `title` | `varchar(500) NOT NULL` | Yalnız admin üçündür (FR-008), saytda göstərilmir |
| `is_active` | `boolean NOT NULL DEFAULT true` | |
| `activated_at` | `timestamptz` | API aktivləşmə anında yazır (R3). `NULL` = heç vaxt aktiv olmayıb |
| `created_by` | `integer REFERENCES users(id) ON DELETE SET NULL` | `CurrentUserId()` |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` | `CbarDbContext.SaveChangesAsync` doldurur |
| `updated_at` | `timestamptz NOT NULL DEFAULT now()` | eyni |

İndeks: `(is_active, activated_at DESC)`. Cədvəl kiçikdir, amma sorğu hər səhifə açılışında gedir (keşdən sonra 60 saniyədə bir).

### `image_popup_translations`

| Sütun | Tip | Qayda |
| --- | --- | --- |
| `id` | `bigserial PRIMARY KEY` | |
| `popup_id` | `integer NOT NULL REFERENCES image_popups(id) ON DELETE CASCADE` | |
| `locale` | `varchar(5) NOT NULL REFERENCES locales(code)` | |
| `media_id` | `bigint REFERENCES media_assets(id) ON DELETE SET NULL` | Bu dilin şəkli |
| `link` | `varchar(1000)` | Boş, `http(s)://…` və ya `/…` (amma `//` yox), R7 |
| `alt_text` | `varchar(500)` | Boşdursa şəkil dekorativdir (`alt=""`) |

Unikal: `(popup_id, locale)`.

Migration stili `0005`-dəki kimidir: `CREATE TABLE IF NOT EXISTS` və `cbar_web_ro` üçün qorunan `GRANT SELECT` (hər iki cədvəl).

## EF modeli (`Cbar.Domain`, hər iki kopyada bayt-bayt eyni)

- **Yer**: ayrıca `Entities/ImagePopup.cs` faylı. `Homepage.cs`-ə (`Banner`-in yanına) qoyulmur, çünki popup ana səhifəyə aid deyil.
- **`ImagePopup`**: `int Id`, `string Title`, `bool IsActive = true`, `DateTimeOffset? ActivatedAt`, `int? CreatedBy`, `DateTimeOffset CreatedAt`, `DateTimeOffset UpdatedAt`, `List<ImagePopupTranslation> Translations`.
- **`ImagePopupTranslation`**: `long Id`, `int PopupId`, `ImagePopup Popup`, `string Locale`, `long? MediaId`, `MediaAsset? Media`, `string? Link`, `string? AltText`.
- **`CbarDbContext`**:
  - `DbSet<ImagePopup> ImagePopups => Set<ImagePopup>();`
  - `ToTable("image_popups")`
  - `ToTable("image_popup_translations")`
  - FK açıq yazılır, çünki nav adı `Popup`-dır, `ImagePopup` deyil: `HasOne(x => x.Popup).WithMany(x => x.Translations).HasForeignKey(x => x.PopupId)`
  - `HasIndex(PopupId, Locale).IsUnique()`

Sütun adları `UseSnakeCaseNamingConvention()`-dan gəlir.

## Qaydalar

| Qayda | Harada |
| --- | --- |
| Ən azı bir tərcümədə `media_id` dolu olmalıdır (FR-003) | API 400 + panel Zod (`perLocale` + `required`) |
| Göndərilən `mediaId` `media_assets`-də olmalıdır | API 400 `Media asset not found.` (Banners nümunəsi) |
| Şəkil faylı image MIME olmalıdır (FR-005) | API 400 (`media_assets.mime_type LIKE 'image/%'`). Panelin media seçicisi də yalnız şəkil göstərir |
| `link` yoxlaması (R7) | API 400 + panel `withLinkRule` |
| Hər dildə ən çox bir tərcümə | DB unikal indeksi, `ApplyTranslations` upsert |
| İstifadədə olan media silinmir | `MediaController.Delete` istinad yoxlamasına `image_popup_translations` əlavə olunur (R14) |

## Vəziyyət keçidləri

```
          yaradılır (isActive=true) ─────────► AKTİV   (activated_at = now)
          yaradılır (isActive=false) ────────► DEAKTİV (activated_at = NULL)
AKTİV   ── status toggle / PUT isActive=false ─► DEAKTİV (activated_at dəyişmir)
DEAKTİV ── status toggle / PUT isActive=true ──► AKTİV   (activated_at = now)
AKTİV   ── PUT (isActive yenə true, məzmun dəyişir) ─► AKTİV (activated_at dəyişmir)
istənilən ── DELETE ─► silinir (hard delete, tərcümələr CASCADE)
```

`activated_at` yalnız `false → true` keçidində yenilənir. Buna görə redaktə popup-ı sıranın önünə çıxarmır (R3).

## Public seçim (api-cbar)

```
image_popups p JOIN image_popup_translations t ON t.popup_id = p.id AND t.locale = :locale
JOIN media_assets m ON m.id = t.media_id AND m.deleted_at IS NULL
WHERE p.is_active
ORDER BY p.activated_at DESC NULLS LAST, p.id DESC
LIMIT 1
```

- Dil filtri FR-010-u təmin edir: cari dildə şəkil yoxdursa, popup da yoxdur. Başqa dilin şəklinə fallback edilmir.
- Maddə III.3-ün `Status/ShowAz/ShowEn/PublishedAt` sütunları bu məzmun tipində yoxdur. Public filtr `is_active`, dil tərcüməsi və media soft-delete üzərindədir, `video_streams` və `banners` ilə eyni səviyyədə.
