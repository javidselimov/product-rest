# Data Model: Media → Tədbirlər (spec 034)

Yeni dörd cədvəl. Mövcud cədvəllər dəyişmir (`no ALTER`). EF modeli hər iki `Cbar.Domain` surətində bayt-bayt eynidir.

## Miqrasiyalar (`api-cbar-admin/db/migrations`)

| Fayl | İş |
|---|---|
| `0018-events.sql` | Cədvəllər, indekslər, şərti FK-lar, `cbar_web_ro` grant-ı, 4 icazə + moderator sətirləri |
| `0019-events-legacy-seed.sql` | 6 köhnə tədbir, `research.md` R2 |

Qaydalar: `IF NOT EXISTS`, `BEGIN/COMMIT` yox. Mövcud cədvəllərə FK `has_table_privilege(..., 'REFERENCES')` şərti ilə (`0017`).
İcazə blokları `0009` kimi: `INSERT` hüququ yoxdursa `WARNING`, deploy dayanmır. Moderator yeni icazələri alır, admin kodda alır.

## `event_categories`

| Sahə | Tip | Qayda |
|---|---|---|
| `id` | serial PK | |
| `sort_order` | integer | default 0 |
| `is_active` | boolean | default true |
| `created_at`, `updated_at` | timestamptz | default now() |

## `event_category_translations`

| Sahə | Tip | Qayda |
|---|---|---|
| `id` | bigserial PK | |
| `category_id` | integer | FK, `ON DELETE CASCADE` |
| `locale` | varchar(5) | |
| `name` | varchar(200) | NOT NULL |

Unikal: `(category_id, locale)`.

## `events`

| Sahə | Tip | Qayda |
|---|---|---|
| `id` | serial PK | |
| `type` | smallint null | 1 Qərar, 2 Mətbuat konfransı, 3 Konfrans, 4 Seminar; `CHECK` 1–4 |
| `category_id` | integer null | FK `event_categories`, `ON DELETE SET NULL` |
| `status` | `content_status` | default `draft`; API `scheduled` qəbul etmir |
| `starts_on` | date | NOT NULL |
| `ends_on` | date null | `CHECK (ends_on IS NULL OR ends_on >= starts_on)` |
| `start_time` | time null | Bakı vaxtı |
| `gallery_id` | integer null | şərti FK, `ON DELETE SET NULL` |
| `press_release_id` | integer null | şərti FK, `ON DELETE SET NULL` |
| `page_id` | integer null | şərti FK, `ON DELETE SET NULL` |
| `created_by`, `updated_by` | integer null | şərti FK `users` |
| `created_at`, `updated_at` | timestamptz | default now() |
| `deleted_at` | timestamptz null | soft-delete, EF `HasQueryFilter` |

İndekslər: `(status, starts_on)`, `(status, coalesce(ends_on, starts_on))`, `category_id`.

## `event_translations`

| Sahə | Tip | Qayda |
|---|---|---|
| `id` | bigserial PK | |
| `event_id` | integer | FK, `ON DELETE CASCADE` |
| `locale` | varchar(5) | |
| `title` | varchar(500) | NOT NULL |
| `slug` | varchar(500) | NOT NULL |
| `location` | varchar(255) null | |
| `content` | text null | |

Unikal: `(event_id, locale)`, `(locale, slug)`.

## Əlaqələr

```
EventCategory 1 ─── * Event * ─── 0..1 Gallery
                        * ─── 0..1 PressRelease
                        * ─── 0..1 Page
Event 1 ─── * EventTranslation
EventCategory 1 ─── * EventCategoryTranslation
```

İstinad birtərəflidir: `Gallery`, `PressRelease`, `Page` entity-lərinə kolleksiya əlavə olunmur.

## İctimai görünürlük

Tədbir görünür, əgər: `Status == Published`, `DeletedAt == null`, ziyarətçinin dilində tərcümə var. `PublishedAt` yoxdur.

- `upcoming`: `(EndsOn ?? StartsOn) >= bakuToday`.
- Bağlı səhifə canlıdır, əgər: `Published`, `Active`, dil üzrə `ShowAz`/`ShowEn`, tərcümə var. `Visible` şərt deyil.
- Bağlı reliz canlıdır, əgər: `Published`, `PublishedAt <= now`, tərcümə var.
- Bağlı qalereya canlıdır, əgər: `IsActive`.

## Sərhəd qaydaları

- İstinad olunan id mövcud deyilsə admin API `400`.
- Bölmə bir silinməmiş tədbirdə işlənirsə silinmir (`409`).
- Tədbir silinəndə istinad etdiyi qalereya, reliz, səhifə dəyişmir.
- `status`: `draft`, `published`, `archived`.
