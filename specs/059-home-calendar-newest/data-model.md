# Data model: spec 059

Sxem dəyişmir. Mövcud `events` / `event_translations` (spec 034) oxunur.

## Tədbir (oxunan sahələr)

| Sahə | Mənbə | İstifadə |
|---|---|---|
| `starts_on` | `events.starts_on` | Sıra (azalan), tarix qutusu (gün + ay) |
| `start_time` | `events.start_time` (null ola bilər) | Gün daxilində sıra (azalan, null sonra), saat sətri |
| `type` | `events.type` (null ola bilər) | Etiket (`media:events.types.<n>`) |
| `title`, `slug` | `event_translations` (dil üzrə) | Başlıq, linkin adı, sıranın son açarı |
| `pageSlug` | bağlı CMS səhifəsinin slug-ı | Köhnə tədbirin ünvanı |

## Saytın görünüş modeli (`CalendarEvent`, `widgets/home-cards/event-calendar.tsx`)

| Sahə | Tip | Dəyişiklik |
|---|---|---|
| `key` | `string` | — |
| `date` | ISO `YYYY-MM-DD` | — |
| `time` | `string \| null` | — |
| `tags` | `string[]` | — |
| `title` | `string` | — |
| `href` | `string` | **`string \| null`-dan `string`-ə**: `eventHref` həmişə ünvan verir |

`EventCalendar` props-a `listHref: string` əlavə olunur ("Təqvim" başlığının ünvanı).

## Seçim qaydası (FR-001…FR-003)

İctimai filtr (dərc olunmuş, silinməmiş, dildə görünən, başlığı olan) → `starts_on DESC, start_time IS NULL, start_time DESC, title` → ilk 3.
