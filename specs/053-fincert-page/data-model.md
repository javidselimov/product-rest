# Data model — 053 FinCERT

Migration `api-cbar-admin/db/migrations/0036-fincert.sql` (sxem, icazələr, grant) və `0037-fincert-seed.sql` (məzmun). Adlar hər iki API üzrə
unikaldır (`api-cbar`-da migration yoxdur). `IF NOT EXISTS`, `BEGIN/COMMIT` yox, mövcud cədvəllərə `ALTER` yox. EF modeli
`src/Cbar.Domain/Entities/Fincert.cs` + `CbarDbContext` — **hər iki nüsxədə bayt-bayt eyni** (Konstitusiya V.1). FK-lar `users`/`media_assets`-ə
yalnız `REFERENCES` icazəsi varsa qurulur (0032 nümunəsi); yoxdursa admin API id-ni özü yoxlayır.

## Cədvəllər

### `fincert_settings` — tək qeyd

| Sütun | Tip | Qayda |
|---|---|---|
| `id` | smallint PK, `CHECK (id = 1)` | həmişə 1; admin `PUT` upsert edir |
| `email` | varchar(255) NULL | e-poçt formatı (admin API) |
| `phone` | varchar(64) NULL | sərbəst yazılış; `tel:` saytda rəqəm + `+`-dan qurulur |
| `portal_url` | varchar(500) NULL | `http://` və ya `https://` |
| `updated_by` | integer NULL | |
| `created_at`, `updated_at` | timestamptz | `set_updated_at` trigger |

Status və soft-delete yoxdur: görünürlüyü CMS səhifəsi 133-ün statusu idarə edir.

### `fincert_setting_translations`

| Sütun | Tip | Qayda |
|---|---|---|
| `id` | bigserial PK | |
| `settings_id` | smallint NOT NULL → `fincert_settings` ON DELETE CASCADE | |
| `locale` | varchar(5) NOT NULL | `az` / `en` |
| `mission` | text NULL | sadə mətn, sətir sonları paraqraf olur |
| `portal_title` | varchar(255) NULL | |
| `portal_description` | varchar(1000) NULL | |
| `rfc_media_id` | bigint NULL | `media_assets`; sənəd növü (admin API) |
| `rfc_url` | varchar(500) NULL | xarici link; `rfc_media_id` varsa saytda işlədilmir |

UNIQUE `(settings_id, locale)`.

### `fincert_directions`

| Sütun | Tip | Qayda |
|---|---|---|
| `id` | serial PK | |
| `sort_order` | integer NOT NULL DEFAULT 0 | yeni bənd = max + 1 |
| `status` | `content_status` NOT NULL DEFAULT 'draft' | public yalnız `published` |
| `created_by`, `updated_by` | integer NULL | |
| `created_at`, `updated_at` | timestamptz | trigger |
| `deleted_at` | timestamptz NULL | soft-delete |

İndeks `(status, sort_order)`.

### `fincert_direction_translations`

`id` bigserial PK · `direction_id` → `fincert_directions` ON DELETE CASCADE · `locale` varchar(5) · `title` varchar(500) NOT NULL · `body` text NOT NULL
DEFAULT '' (rich-text HTML) · UNIQUE `(direction_id, locale)`.

### `fincert_memberships`

| Sütun | Tip | Qayda |
|---|---|---|
| `id` | serial PK | |
| `logo_media_id` | bigint NULL | şəkil növü (admin API) |
| `url` | varchar(500) NULL | `http(s)://` |
| `sort_order`, `status`, `created_by`, `updated_by`, `created_at`, `updated_at`, `deleted_at` | | `fincert_directions` kimi |

### `fincert_membership_translations`

`id` bigserial PK · `membership_id` → CASCADE · `locale` · `name` varchar(255) NOT NULL · `description` varchar(1000) NULL · `badge` varchar(120) NULL ·
UNIQUE `(membership_id, locale)`.

### İcazələr və grant (0036)

`fincert.read`, `fincert.create`, `fincert.update`, `fincert.delete` → `moderator` rolu (0034 nümunəsi; `INSERT` icazəsi yoxdursa `RAISE WARNING`, API
fail-closed). `GRANT SELECT` altı cədvəlin hamısına `cbar_web_ro`-ya, rol varsa.

## Bölmələr və ankerlər (sayt, saxlanmır)

| Sıra | Bölmə | Anker | Görünür, əgər (ziyarətçinin dilində) |
|---|---|---|---|
| 1 | Missiya | `missiya` | `mission` trim boş deyil |
| 2 | Fəaliyyətin əsas istiqamətləri | `istiqametler` | ən azı bir görünən istiqamət |
| 3 | Əlaqə məlumatları | `elaqe` | `email` və ya `phone` dolu (boş kart düşür) |
| 4 | Yüksək kateqoriyalı insident üzrə hesabatın göndərilməsi | `hesabat-portali` | `portal_url` dolu **və** `portal_title` dolu |
| 5 | RFC-2350 | `rfc-2350` | `rfc_media_id` mövcud silinməmiş fayldır və ya `rfc_url` dolu |
| 6 | Beynəlxalq əməkdaşlıq | `beynelxalq-emekdasliq` | ən azı bir görünən üzvlük |

Altı bölmənin hamısı boşdursa FinCERT məlumatı "yox" sayılır və səhifə 133-ün CMS mətni göstərilir (FR-016).

## Görünürlük qaydaları (public, Konstitusiya III.3)

- İstiqamət: `status = published`, `deleted_at IS NULL`, həmin dildə `title` və `body` (HTML teqsiz mətni) trim boş deyil.
- Üzvlük: `status = published`, `deleted_at IS NULL`, həmin dildə `name` boş deyil.
- Sıra: `sort_order`, sonra `id`. İstiqamətin nömrəsi görünən siyahıdakı indeks + 1-dir.
- Media: `deleted_at IS NULL`; silinmiş fayl `null` qaytarılır (RFC faylı → `rfc_url`-ə düşür; loqo → loqosuz kart).

## Validasiya (admin API, 400 `problem+json`, Azərbaycanca `message`)

- Ümumi: `email` boş və ya düzgün e-poçt; `portal_url` boş və ya `http(s)://` mütləq URL; `rfc_url` eyni; `rfc_media_id` mövcud silinməmiş media,
  `mime_type` sənəd (PDF, DOC(X), XLS(X), ZIP, TXT — `MediaStorage`-in icazəli sənəd növləri); hər dildə portal başlığı varsa `portal_url` vacibdir.
- İstiqamət: ən azı bir dil tam (başlıq + mətn); başlanmış dil yarımçıq ola bilməz (başlıq var, mətn yox və ya əksinə → 400, spec 051 qaydası);
  başlıq ≤ 500.
- Üzvlük: ən azı bir dildə ad; ad ≤ 255, təsvir ≤ 1000, nişan ≤ 120; `logo_media_id` mövcud şəkil (`image/*`); `url` boş və ya `http(s)://`.
- Sıra: `ids` silinməmiş elementlərin tam dəsti (çatışmayan/artıq → 400, spec 044/051 kimi).

## Seed (0037) — axın

```text
test API GET /api/v1/pages/fincert?locale=az|en
  └─ specs/053-fincert-page/seed/extract.mjs ─► fincert-az.json, fincert-en.json
        { mission, directions: [{ title, body }], email, phone, portal: { url, title, description }, rfc: { legacyName, url } }
        (yoxlama: 4 istiqamət hər dildə, hər gövdədə ən azı bir <p>)
fincert-first.json (FIRST üzvlüyü: az Figma mətni, en qaralama)
  └─ build-seed.mjs ─► api-cbar-admin/db/migrations/0037-fincert-seed.sql
```

Şərt: az slug-ı `fincert` olan silinməmiş səhifə var və üç əsas cədvəlin hər biri boşdur (silinmişlər daxil). Həmçinin `fincert-copy`
səhifəsi üçün `page_details.show_in_side_nav = false` (ON CONFLICT DO UPDATE). Səhifə mətnlərinə toxunmur. Detallar `research.md` R10.

## Saytdakı görünüş modeli (web-cbar-new, saxlanmır)

```ts
type FincertView = {
  title: string                       // CMS səhifəsi 133
  mission: string[] | null            // paraqraflar
  directions: { id: number; number: number; title: string; bodyHtml: string }[]   // bodyHtml prepareCmsHtml-dən
  contacts: { kind: 'email' | 'phone'; value: string; href: string }[]
  portal: { title: string; description: string | null; url: string } | null
  rfc: { href: string; download: boolean; fileType: string | null } | null
  memberships: { id: number; name: string; description: string | null; badge: string | null; url: string | null; logo: string | null }[]
}
```
