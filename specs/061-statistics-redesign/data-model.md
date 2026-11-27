# Data model: spec 061

Sxem dəyişmir. Yeni cədvəl, sütun və ya `ALTER` yoxdur (Qərar 2). Aşağıdakılar mövcud cədvəllər və saytın onlardan qurduğu modellərdir.

## Mövcud cədvəllər (yalnız oxunur; seed `contracts/seed-contract.md` qaydaları ilə yazır)

| Cədvəl | İstifadə | Seed yazır? |
|---|---|---|
| `pages` (`parent_id`, `path`, `sort_order`, `status`) | bölmə ağacı | 2 yeni sətir (Q3); `sort_order` (Q4) |
| `page_translations` (`page_id`, `locale`, `title`, `slug`, `content`) | başlıq, ünvan, mətn | 4 yeni sətir (Q3); `title` (Q5); 1 səhifənin `content`-i (Q6) |
| `page_details` (`page_id` PK, `show_in_side_nav`) | menyu bayrağı | 1 sətir, `ON CONFLICT DO NOTHING` (Q8) |
| `page_assets` (`page_id`, `media_id`, `sort_order`, `group_label varchar(100)`) | fayl, qrup, sıra | `group_label` (Q7.1), `sort_order` yalnız Ödəniş (Q7.3) |
| `page_asset_translations` (`page_asset_id`, `locale`, `title`) | fayl başlığı | az `title` (Q7.2) |
| `media_assets` (`created_at`, `mime_type`, `size_bytes`) | yüklənmə tarixi (API `uploadedAt`) | yox |

## API modeli (`GET /api/v1/pages/{slug}`)

`PageAsset`: `mediaId`, `title`, `mimeType`, `sizeBytes`, `group`, **`uploadedAt`** (yeni), `url` — `contracts/public-api.md`.

## Sayt modelləri (`features/statistics/model/`, saf funksiyalar, server)

```text
StatisticsFile      { id, title (tarixsiz), fullTitle, url, mimeType, sizeBytes?, updatedOn: IsoDate | null, groupKey | null }
StatisticsGroup     { key (slug), heading, chip, files: StatisticsFile[] }          // ilk görünmə sırası ilə
StatisticsFilesView { groups: StatisticsGroup[], ungrouped: StatisticsFile[], selected: key | null,
                      latest: IsoDate | null, count, pageHref, zipHref }
NsdpDataset         { title, files: StatisticsFile[] }                              // eyni başlıq; sıra XML, XLS, qalanı
```

Qaydalar:

- `updatedOn`: başlığın sonundakı ` (dd.mm.yyyy)` etibarlı təqvim tarixidirsə o (title ondan təmizlənir), yoxsa `uploadedAt`-in Bakı
  günü, yoxsa `null` (R6).
- `heading | chip`: `group` `|` ilə bölünür, hər hissə trim; boş hissə digərini alır; bütün `group` boşdursa qrup yoxdur (R5).
- `key`: `chip`-in `foldForSearch` + boşluq → `-` slug-u; təkrarlanarsa `-2`.
- `selected`: `?group=` qruplardan birinin `key`-i deyilsə `null` ("Hamısı").
- en-də `groups = []`, bütün fayllar `ungrouped` (Qərar 8).
- `latest` = bütün faylların `updatedOn` maksimumu (seçimdən asılı deyil).
- `count` = səhifənin bütün faylları.

## Layout növləri (`AboutLayoutKind`)

Yeni: `statistics-files`, `statistics-datasets`. Mövcud: `document-list` (Metodologiya, Reviziya), `plain`. Seçim `statisticsLayoutFor`
(slug, `-copy` qaralamaları ilə; R3).
