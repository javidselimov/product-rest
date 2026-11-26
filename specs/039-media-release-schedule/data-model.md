# Data Model: Məlumatların yayımlanması qrafiki

Miqrasiya `product-rest/api-cbar-admin/db/migrations/0022-release-schedule.sql` (`0020-csr-projects.sql` quruluşu: yeni cədvəllər, şərti FK DO-bloku, `set_updated_at` trigger dövrü, `cbar_web_ro` GRANT, icazələr). Mövcud cədvəllər dəyişmir. Entity-lər `src/Cbar.Domain/Entities/ReleaseSchedule.cs`, hər iki API-də eyni.

## release_schedule_groups

| Sütun | Tip | Qayda |
|---|---|---|
| `id` | serial PK | |
| `sort_order` | integer NOT NULL DEFAULT 0 | saytda artan |
| `is_active` | boolean NOT NULL DEFAULT true | deaktiv qrup və sətirləri saytda görünmür |
| `created_at`, `updated_at` | timestamptz NOT NULL DEFAULT now() | trigger |

**release_schedule_group_translations**: `id bigserial PK`, `group_id integer NOT NULL REFERENCES release_schedule_groups ON DELETE CASCADE`, `locale varchar(5) NOT NULL` (şərti FK → `locales(code)`), `name varchar(300) NOT NULL`, `UNIQUE (group_id, locale)`.

Silinmə: sərt (`DELETE`). Silinməmiş və ya soft-deleted sətri olan qrup → 409 (`IgnoreQueryFilters`, `CsrCategoriesController` kimi).

## release_schedule_periodicities

| Sütun | Tip | Qayda |
|---|---|---|
| `id` | serial PK | |
| `sort_order` | integer NOT NULL DEFAULT 0 | admin seçim siyahısında artan |
| `created_at`, `updated_at` | timestamptz NOT NULL DEFAULT now() | trigger |

**release_schedule_periodicity_translations**: `periodicity_id … ON DELETE CASCADE`, `locale`, `name varchar(300) NOT NULL`, `UNIQUE (periodicity_id, locale)`.

Silinmə: sərt; istifadədə → 409.

## release_schedule_items

| Sütun | Tip | Qayda |
|---|---|---|
| `id` | serial PK | |
| `group_id` | integer NOT NULL REFERENCES release_schedule_groups ON DELETE RESTRICT | məcburi |
| `periodicity_id` | integer NULL REFERENCES release_schedule_periodicities ON DELETE RESTRICT | boş → saytda "—" |
| `timing_mode` | smallint NOT NULL DEFAULT 1, `CHECK (timing_mode BETWEEN 1 AND 3)` | 1 text, 2 link, 3 decisions |
| `timing_url` | varchar(1000) NULL, `CHECK ((timing_mode = 2) = (timing_url IS NOT NULL))` | `http(s)://…` və ya `/yol` |
| `sort_order` | integer NOT NULL DEFAULT 0 | qrup daxilində artan, sonra `id` |
| `status` | content_status NOT NULL DEFAULT 'draft' | `scheduled` qəbul edilmir |
| `show_az`, `show_en` | boolean NOT NULL DEFAULT true | |
| `created_by`, `updated_by` | integer NULL (şərti FK → `users`, SET NULL) | |
| `created_at`, `updated_at` | timestamptz NOT NULL DEFAULT now() | trigger |
| `deleted_at` | timestamptz NULL | soft delete, `HasQueryFilter` |

İndeks: `release_schedule_items_status_group_sort_idx (status, group_id, sort_order)`, `release_schedule_items_periodicity_idx (periodicity_id)`.

**release_schedule_item_translations**: `id bigserial PK`, `item_id … ON DELETE CASCADE`, `locale`, `title varchar(500) NOT NULL`, `timing varchar(500) NULL`, `UNIQUE (item_id, locale)`.

## Validasiya (server `InvalidAsync`, admin Zod eyni)

- Ən azı bir dil; dolu dildə `title` boş ola bilməz (sətir), `name` boş ola bilməz (qrup, dövrilik).
- `groupId` mövcud qrup; `periodicityId` null və ya mövcud dövrilik.
- `timingMode = link` → `timingUrl` məcburi, `^https?://` və ya `/` (amma `//` yox), ≤ 1000; digər rejimlərdə server `timingUrl`-u null saxlayır.
- `status = scheduled` → 400 "An item cannot be scheduled."
- Mətn uzunluqları DB limiti ilə; aşma `DbExceptionHandler` ilə 400.

## İcazələr

`release_schedule.read`, `.create`, `.update`, `.delete` — `Permissions.ReleaseSchedule`, `All` siyahısı, miqrasiyada `permissions` + `moderator` (`0020` blok quruluşu, imtiyaz yoxdursa `RAISE WARNING`). Üç controller eyni icazələri işlədir.

## Audit

`audit.Log("release_schedule.item.create|update|delete", "release_schedule_item", id, before, after)`; qrup və dövrilik üçün `release_schedule.group.*` / `release_schedule.periodicity.*`, entity tipi `release_schedule_group` / `release_schedule_periodicity`.

## Public oxu qaydası (api-cbar)

Sətir saytda görünür ⇔ `status = published` ∧ `deleted_at IS NULL` ∧ `show_{locale}` ∧ həmin dildə tərcümə var ∧ qrup `is_active` ∧ qrupun həmin dildə adı var. Dövriliyin həmin dildə adı yoxdursa `periodicity = null`.

Qərar tarixləri (`events`, yalnız oxu): `type = 1` ∧ `status = published` ∧ `deleted_at IS NULL`; tərcümə tələb olunmur. `withPressConference` ⇔ eyni `starts_on`-da eyni filtrli `type = 2` tədbiri var. İl = `BakuClock.Today().Year`; `next` = `starts_on >= BakuClock.Today()` olan ən kiçik `type = 1` tarixi (il məhdudiyyəti yoxdur).

## Seed (`0023-release-schedule-seed.sql`)

Hər üç cədvəldən biri boş deyilsə `RAISE NOTICE` + atlanır. Bütün sətirlər `published`, `show_az = show_en = true`, `sort_order` 10-luq addımla.

**Qruplar**: 1 "Pul və məzənnə siyasəti üzrə" / "Monetary and exchange rate policy"; 2 "Normativ-hüquqi baza üzrə" / "Normative and legal base".

**Dövriliklər** (P): 1 İllik / Annually; 2 Rüblük / Quarterly; 3 Aylıq / Monthly; 4 Gündəlik / Daily; 5 İnformasiyanın dəyişməsindən asılı olaraq / Depending on updates; 6 Qərar müvafiq qaydada təsdiq edildikdə / When decisions are accordingly approved; 7 Yeni layihə müzakirələrə təqdim edildikdə / When new drafts are released.

**Sətirlər** (Q qrup, P dövrilik, M rejim; mətnlər köhnə cədvəldən, ⚑ Figma-dan doldurulan dəyər):

| # | Q | Məzmun (az / en) | P | Müddət (az / en) | M |
|---|---|---|---|---|---|
| 1 | 1 | Pul siyasətinin əsas istiqamətləri (Bəyanat) / Main directions of the monetary policy (Statement) | 1 | Dekabr ayının 31-dək / Up to December 31 | text |
| 2 | 1 | Pul siyasəti ilə bağlı qəbul olunan qərarlar / Monetary policy related decisions | 6 | Qrafikə uyğun / According to the schedule | decisions |
| 3 | 1 | Pul siyasəti icmalı / Monetary Policy Review | 2 | Növbəti aydan sonrakı ayın 15-dək / Up to the 15th day of the month following the next month | text |
| 4 | 1 | Pul bazarının kəmiyyət göstəriciləri / Quantitative indicators of the money market | 4 | Dərhal / Instantly | text |
| 5 | 1 | Pul siyasəti alətləri haqqında press-relizlər / Press releases on monetary policy tools | 5 | Dərhal / Instantly | text |
| 6 | 1 | İllik inflyasiya / 12-month inflation | 3 | Növbəti ayın 20-dək / Up to the 20th day of the following month | text |
| 7 | 1 | AZN məzənnəsi / AZN exchange rate | 4 | Dərhal / Instantly | text |
| 8 | 1 | Monetar göstəricilər / Monetary indicators | 3 | Növbəti ayın 10-dək / Up to the 10th day of the following month | text |
| 9 | 1 | Pul Siyasəti və Maliyyə Sabitliyi Komitəsi haqqında məlumat / Information on the Monetary Policy and Financial Stability Committee | 5 | Dərhal / Instantly | text |
| 10 | 2 | Normativ-xarakterli aktlar / Regulations | 5 | Normativ hüquqi aktların vahid internet elektron reyestrinə daxil edildikdən sonra / Upon entry to the unified Internet electronic registry of normative acts of legal nature | text |
| 11 | 2 | Normativ-xarakterli aktların layihələri / Draft regulations | 7 | Dərhal / Instantly | text |
| 12 | 2 | Statistik hesabatların yayımlanması qrafiki / The schedule of statistical releases | — | “Statistika” bölməsində yerləşdirilib / Placed in the ‘Statistics’ section | text |
| 13 | 2 | Audit rəyi ilə təsdiq olunmuş ilin yekunlarına dair konsolidə edilmiş (birləşdirilmiş) maliyyə hesabatı / Audited consolidated financial statements for the year-end | 1 | İyun ayının 30-dək / Until June 30 | text |
| 14 | 2 | Ödəniş və hesablaşmalar sistemləri üzrə məlumatlar / Payment and settlement systems | 5 | Dərhal / Instantly | text |
| 15 | 2 | Milli pul nişanları üzrə məlumatlar / National currency | 5 ⚑ | Dərhal / Instantly ⚑ | text |
| 16 | 2 | Nəşrlər və tədqiqatlar üzrə məlumatlar / Publications and research | 5 ⚑ | Dərhal / Instantly ⚑ | text |
| 17 | 2 | Maliyyə savadlılığı üzrə məlumatlar / Financial literacy | 5 ⚑ | Dərhal / Instantly ⚑ | text |
| 18 | 2 | Beynəlxalq əməkdaşlıq üzrə / International cooperation | 5 ⚑ | Dərhal / Instantly ⚑ | text |
| 19 | 2 | Ümumi kommunikasiya məlumatları / Communication | 5 ⚑ | Dərhal / Instantly ⚑ | text |
| 20 | 2 | Maliyyə xidmətləri istehlakçılarının müraciətlərinə dair statistik məlumatlar / Statistical information on appeals of financial service consumers | 3 | Növbəti ayın 10-dək / Up to the 10th day of the following month | text |
| 21 | 2 | Bank xidmətlərindən istifadə üzrə “şikayət indeksi” / Complaint index on bank customers' use of bank services | 3 | Növbəti ayın 10-dək / Up to the 10th day of the following month | text |
| 22 | 2 | Avtonəqliyyat vasitəsi sahiblərinin mülki məsuliyyətinin icbari sığortası üzrə “şikayət indeksi” / Complaint index on compulsory civil liability insurance of vehicle owners | 3 | Növbəti ayın 10-dək / Up to the 10th day of the following month | text |

Mətnlər köhnə cədvəldən təmizlənərək götürülür: sondakı ":" və artıq boşluqlar atılır, en dövriliklər böyük hərflə başlayır ("annually" → "Annually"). 12 və 22-ci sətirlərin en mətni köhnə cədvəldən qısaldılıb; redaktor yoxlamalıdır.
