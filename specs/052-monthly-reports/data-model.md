# Data model: spec 052 — Aylıq hesabatlar

Sahib: `api-cbar-admin`. Migration-lar `db/migrations/0034-monthly-reports.sql` (sxem, icazələr, seriyalar) və `0035-monthly-reports-seed.sql`
(köçürmə). Üslub `0027-memorandums.sql` ilədir: `CREATE TABLE IF NOT EXISTS`, `BEGIN/COMMIT` yoxdur, mövcud cədvəllərə `ALTER TABLE` yoxdur,
şərti FK-lar, `set_updated_at` trigger, `cbar_web_ro` grant. Qərarlar: [research.md](research.md) R1–R12.

## Cədvəllər

### `monthly_report_series` (sabit siyahı, R1)

| Sütun | Tip | Qayda |
|---|---|---|
| `id` | `smallserial` PK | |
| `key` | `varchar(40)` NOT NULL UNIQUE | `bank-complaint-index`, `insurance-complaint-index`, `infographics` |
| `period_months` | `smallint` NOT NULL default 1 | `CHECK (period_months BETWEEN 1 AND 12)`; dövr = həmin ayla bitən N ay (R3) |
| `sort_order` | `smallint` NOT NULL default 0 | API cavabında seriyaların sırası |

### `monthly_report_series_translations`

| Sütun | Tip | Qayda |
|---|---|---|
| `id` | `serial` PK | |
| `series_id` | `smallint` NOT NULL | FK → `monthly_report_series(id)` `ON DELETE CASCADE` |
| `locale` | `varchar(5)` NOT NULL | şərti FK → `locales(code)` |
| `name` | `varchar(300)` NOT NULL | |

`UNIQUE (series_id, locale)`.

**Seed** (0034, `ON CONFLICT (key) DO NOTHING` / `ON CONFLICT (series_id, locale) DO NOTHING`):

| key | period | sort | az | en |
|---|---|---|---|---|
| `bank-complaint-index` | 1 | 10 | Bank müştərilərinin bank xidmətlərindən istifadəsi üzrə şikayət indeksi | Complaint index on bank customers' use of bank services |
| `insurance-complaint-index` | 12 | 20 | Avto-icbari sığorta üzrə şikayət indeksi | Complaint index on compulsory MTPL insurance |
| `infographics` | 1 | 30 | Azərbaycan Respublikasının Mərkəzi Bankına daxil olan müraciətlərə dair statistik hesabat | Statistical report on appeals received by the Central Bank of the Republic of Azerbaijan |

az adları köhnə link mətnlərindəndir. en adları Bank və Sığorta üçün köhnə en link mətnlərindən götürülüb. İnfoqrafikanın en adı tərcümə
qaralamasıdır: en İnfoqrafika səhifəsi yoxdur və redaktor onu yoxlamalıdır.

### `monthly_reports`

| Sütun | Tip | Qayda |
|---|---|---|
| `id` | `serial` PK | |
| `series_id` | `smallint` NOT NULL | FK → `monthly_report_series(id)` |
| `year` | `smallint` NOT NULL | `CHECK (year BETWEEN 2000 AND 2100)`; API: ≤ cari il + 1 |
| `month` | `smallint` NOT NULL | `CHECK (month BETWEEN 1 AND 12)` |
| `status` | `content_status` NOT NULL default `'draft'` | `scheduled` API-də qadağan |
| `created_by`, `updated_by` | `integer` null | şərti FK → `users(id)` `SET NULL` |
| `created_at`, `updated_at` | `timestamptz` NOT NULL default `now()` | `updated_at` `set_updated_at()` trigger ilə |
| `deleted_at` | `timestamptz` null | soft delete |

Index-lər:
- `monthly_reports_period_uq UNIQUE (series_id, year, month) WHERE deleted_at IS NULL` (R8);
- `monthly_reports_list_idx (series_id, status, year DESC, month DESC)`.

### `monthly_report_translations` (dil üzrə fayl, R1, R2)

| Sütun | Tip | Qayda |
|---|---|---|
| `id` | `bigserial` PK | |
| `report_id` | `integer` NOT NULL | FK → `monthly_reports(id)` `ON DELETE CASCADE` |
| `locale` | `varchar(5)` NOT NULL | şərti FK → `locales(code)` |
| `media_id` | `bigint` NOT NULL | şərti FK → `media_assets(id)` `NO ACTION` |

`UNIQUE (report_id, locale)`. Dilin sətri yoxdursa, həmin dildə fayl yoxdur və sətir o dildə saytda görünmür.

## Migration DO blokları (0034)

1. Şərti FK-lar (`has_table_privilege(ref, 'REFERENCES')`, `fk_<tbl>_<col>`): `monthly_reports.created_by/updated_by → users`,
   `*_translations.locale → locales`, `monthly_report_translations.media_id → media_assets`.
2. `monthly_reports_set_updated_at` trigger.
3. `cbar_web_ro` varsa dörd cədvələ `GRANT SELECT`.
4. İcazələr: `monthly_reports.read/create/update/delete` + `moderator` rolu, `ON CONFLICT DO NOTHING`. INSERT hüququ yoxdursa WARNING (0027).
5. Üç seriyanın seed-i (yuxarıdakı cədvəl).

## Validasiya (admin API)

- `seriesId` mövcud seriyadır, yoxdursa 400.
- `year` 2000 … cari il + 1, `month` 1 … 12.
- `translations` ən azı bir dil saxlayır. Hər dil üçün `mediaId` mövcud və silinməmiş `media_assets` sətridir, yoxdursa 400. Buraxılan dil
  silinir (memorandum qaydası).
- `status` `scheduled` deyil.
- Eyni seriya + il + ay üzrə başqa silinməmiş sətir varsa 409 (`ConflictProblem`, R8).

## Vəziyyətlər

`draft` → `published` ↔ `archived`. Silmə `deleted_at` qoyur (EF `HasQueryFilter(DeletedAt == null)`). Saytda yalnız bunlar çıxır:
- `published` və silinməmiş sətirlər;
- cari dildə `monthly_report_translations` sətri olanlar;
- faylın `media_assets.deleted_at IS NULL` olanlar.

## EF modeli (hər iki `Cbar.Domain` kopyası, bayt-bayt eyni)

`src/Cbar.Domain/Entities/MonthlyReport.cs`: `MonthlyReportSeries`, `MonthlyReportSeriesTranslation`, `MonthlyReport`,
`MonthlyReportTranslation` (implementasiyada `MediaAsset`-ə naviqasiya **yoxdur**: onun query filter-i silinmiş faylları gizlədir və tərcümə sətrini sorğudan atardı; controller-lər `db.MediaAssets` ilə ayrıca yoxlayır — admin `missingFile`, public join).

`CbarDbContext`: 4 `DbSet`, `ToTable`, `HasQueryFilter` (`MonthlyReport`), unique index-lər (partial — `HasFilter("deleted_at IS NULL")`),
cascade əlaqələr.

Yoxlama: `diff -rq product-rest/api-cbar/src/Cbar.Domain product-rest/api-cbar-admin/src/Cbar.Domain` boş olmalıdır.

## Köçürmə (0035, R6)

Hər seriya üçün mənbə səhifə **az slug** ilə tapılır, en mətni həmin səhifənin en tərcüməsidir:

| Seriya | az slug | en |
|---|---|---|
| `bank-complaint-index` | `bank-xidmetlerinden-istifade-uzre-sikayet-indeksi` | səhifənin en tərcüməsi |
| `insurance-complaint-index` | `avto-icbari-sigorta-uzre-sikayet-indeksi` | səhifənin en tərcüməsi |
| `infographics` | `infoqrafika` | yoxdur |

Hər seriya üçün addımlar:

1. **Qoruyucu**: seriyada istənilən sətir varsa (silinmiş də daxil), seriya ötürülür (`RAISE NOTICE`). Səhifə yoxdursa, səssiz ötürülür.
2. **İl hissələri**: `regexp_split_to_table(content, '<summary>\s*(?=\d{4}\s*</summary>)')`. Birinci hissə (arxivdən əvvəlki mətn) atılır.
   Qalan hər hissə `^\d{4}` ili ilə başlayır.
3. **Aylar**: hər hissədə
   `regexp_matches(chunk, '<summary>\s*([^<]+?)\s*</summary>(?:(?!<summary>).)*?href="/media/(\d+)"', 'g')`. Nəticə: ay etiketi və
   media id. PostgreSQL ARE-də `.` sətir sonunu da tutur (`n` flag-ı olmadan). `[\s\S]` yazılmır, çünki bracket içində `\S` qadağandır.
   Bir ayda media linki yoxdursa (xarici link), lookahead növbəti `<summary>`-də dayanır və o ay ötürülür.
4. **Ay nömrəsi**: `lower(replace(etiket, 'ı', 'i'))`, boşluqlar sıxılır və az + en ay adları `VALUES` cədvəli ilə tutuşdurulur. Tanınmayan
   etiket ötürülür və `RAISE NOTICE` ilə qeyd olunur (FR-020).
5. **Fayl**: `media_assets`-də mövcud və silinməmiş olmalıdır, yoxdursa ötürülür.
6. **az keçidi**: `INSERT monthly_reports (series, year, month, status 'published')` + `monthly_report_translations (az, media)`. Eyni ay
   ikinci dəfə gəlsə, birincisi qalır (`ON CONFLICT DO NOTHING`).
7. **en keçidi**: eyni seriya + il + ay sətri tapılır, yoxdursa yaradılır və `(en, media)` əlavə olunur.
8. **Yekun**: `RAISE NOTICE 'spec 052: <key> az=N en=M'`.

Səhifə mətnləri dəyişmir (FR-019).

**Gözlənilən nəticə** (test API, 2026-11-18):

| Seriya | Sətir | az faylı | en faylı | Qeyd |
|---|---|---|---|---|
| Bank | 32 | 32 | 32 | |
| Sığorta | 45 | 45 | 41 | en-də 2 ay xarici `uploads.cbar.az` linkidir, köçürülmür; 2022 Sentyabr və Dekabr en-də yoxdur |
| İnfoqrafika | 65 | 65 | 0 | |
