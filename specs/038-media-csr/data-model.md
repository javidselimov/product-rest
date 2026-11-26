# Data model: KSM layihələri (spec 038)

Yalnız yeni cədvəllər, mövcud cədvəllərə `ALTER TABLE` yoxdur. Sxem sahibi `api-cbar-admin`. EF modeli hər iki `Cbar.Domain` nüsxəsində eynidir.

## `csr_categories`

| Sütun | Tip | Qayda |
|---|---|---|
| `id` | serial PK | |
| `sort_order` | integer | default 0 |
| `is_active` | boolean | default true |
| `created_at`, `updated_at` | timestamptz | trigger |

## `csr_category_translations`

| Sütun | Tip | Qayda |
|---|---|---|
| `id` | bigserial PK | |
| `category_id` | integer FK | `ON DELETE CASCADE` |
| `locale` | varchar(5) | şərti FK `locales` |
| `name` | varchar(200) | NOT NULL |

Unikal: `(category_id, locale)`.

## `csr_projects`

| Sütun | Tip | Qayda |
|---|---|---|
| `id` | serial PK | |
| `category_id` | integer FK | NOT NULL, `ON DELETE RESTRICT` (FR-009) |
| `cover_media_id` | bigint | nullable, şərti FK `media_assets` |
| `sort_order` | integer | default 0 |
| `status` | content_status | default `draft` |
| `show_az`, `show_en` | boolean | default true |
| `created_by`, `updated_by` | integer | şərti FK `users` |
| `created_at`, `updated_at` | timestamptz | trigger |
| `deleted_at` | timestamptz | soft delete, `HasQueryFilter` |

İndeks: `(status, sort_order)`.

## `csr_project_translations`

| Sütun | Tip | Qayda |
|---|---|---|
| `id` | bigserial PK | |
| `project_id` | integer FK | `ON DELETE CASCADE` |
| `locale` | varchar(5) | şərti FK `locales` |
| `card_title` | varchar(255) | NOT NULL |
| `summary` | varchar(500) | NOT NULL |
| `title` | varchar(500) | NOT NULL, modal başlığı |
| `content` | text | |

Unikal: `(project_id, locale)`. Bir dil boş ola bilər: sətir olmur və layihə həmin dildə görünmür.

## `csr_project_images`

| Sütun | Tip | Qayda |
|---|---|---|
| `id` | bigserial PK | |
| `project_id` | integer FK | `ON DELETE CASCADE` |
| `media_id` | bigint | NOT NULL, şərti FK `media_assets` |
| `sort_order` | integer | default 0 |

Unikal: `(project_id, media_id)`. Dil sütunu yoxdur: fotolar iki dil üçün ortaqdır.

## Əlaqələr

```text
csr_categories 1─* csr_category_translations
csr_categories 1─* csr_projects 1─* csr_project_translations
                   csr_projects 1─* csr_project_images ─* media_assets
                   csr_projects *─1 media_assets (cover)
```

## Qaydalar

- `media_assets` FK-ləri şərtidir (`has_table_privilege`, `0017`/`0018`). FK olmayan mühitdə qoruma `MediaController` in-use yoxlamasıdır: `csr_projects.cover_media_id` və `csr_project_images.media_id` ora əlavə olunur (FR-011).
- Admin API `category_id` və media id-ləri özü yoxlayır.
- Kateqoriya silinəndə bağlı layihə varsa `ConflictProblem` (`EventCategoriesController.cs:107` nümunəsi). Silinmiş layihələr də sayılır, çünki FK onları da saxlayır.
- `GRANT SELECT` to `cbar_web_ro`: dörd cədvəlin hamısı + `csr_project_images`.
- İcazələr: `csr.read`, `csr.create`, `csr.update`, `csr.delete`, moderator rolu daxil. `Permissions.cs`-də `Csr` sinfi + `All`. Kateqoriyalar eyni icazələrlə işləyir.

## Status keçidləri

`draft` ↔ `published`, mövcud `content_status` enum-u. `deleted_at` ayrıca: silinmiş layihə heç bir dildə görünmür.

## Public görünüş

`status = published` və `deleted_at IS NULL` və cari dilin `show_*` bayrağı və cari dildə tərcümə sətri. Kateqoriya `is_active = false` olanda layihə görünür, etiket adı qalır.
