# Data model — 054 "Nəşrlər və tədqiqatlar"

Migration-lar `api-cbar-admin/db/migrations/`-dədir. `api-cbar`-da migration yoxdur, ona görə adlar hər iki API üzrə unikaldır:

| Fayl | Məzmun | Faza |
|---|---|---|
| `0038-working-papers.sql` | işçi məqalələri cədvəlləri, icazələr, `cbar_web_ro` grant | 1 |
| `0039-page-nav-details.sql` | `page_nav_details`, `page_translation_details` | 1 |
| `0040-media-asset-details.sql` | `media_asset_details` (ölçü yoxlaması jurnalı) | 1 |
| `0041-publications-tree-seed.sql` | ağac, başlıqlar, giriş mətnləri, menyu bayraqları, qrup etiketləri | 1 |
| `0042-working-papers-seed.sql` | köhnə məqalələr (generator çıxışı) | son faza; nömrə o vaxt növbəti boş nömrədir |

Qaydalar: `IF NOT EXISTS`, `BEGIN/COMMIT` yoxdur, mövcud cədvəllərə `ALTER` yoxdur.
- **FK-lar.** `pages`, `locales`, `media_assets`, `users`-ə FK yalnız `REFERENCES` icazəsi varsa qurulur (0034 `DO $$ … has_table_privilege` nümunəsi).
  İcazə yoxdursa admin API id-ni özü yoxlayır.
- **EF modeli.** `src/Cbar.Domain/Entities/WorkingPaper.cs`, `Content.cs`-də `PageNavDetail`, `PageTranslationDetail`, `MediaAssetDetail` və `CbarDbContext`.
  Bunlar **iki nüsxədə bayt-bayt eynidir** (Konstitusiya V.1).

## İşçi məqaləsi

### `working_papers`

| Sütun | Tip | Qayda |
|---|---|---|
| `id` | serial PK | |
| `number` | smallint NOT NULL `CHECK (number BETWEEN 1 AND 99)` | il daxilində sıra; saytda 2 rəqəmlə ("02") |
| `year` | smallint NOT NULL `CHECK (year BETWEEN 1990 AND 2100)` | admin API əlavə olaraq `≤ cari il + 1` yoxlayır |
| `paper_language` | varchar(8) NOT NULL DEFAULT `'en'` `CHECK (paper_language IN ('az','en','other'))` | məqalənin yazıldığı dil |
| `jel_codes` | text[] NOT NULL DEFAULT `'{}'` | hər biri `^[A-Z][0-9]{1,2}$` (admin API) |
| `legacy_page_id` | integer NULL | köhnə `page-<id>`; seed idempotentlik açarı |
| `status` | `content_status` NOT NULL DEFAULT `'draft'` | public yalnız `published` |
| `created_by`, `updated_by` | integer NULL | |
| `created_at`, `updated_at` | timestamptz | `set_updated_at` trigger |
| `deleted_at` | timestamptz NULL | soft-delete |

İndekslər:
- `UNIQUE (number, year) WHERE deleted_at IS NULL` (`working_papers_number_year_uq`). Pozuntu `DbExceptionHandler` ilə 409 olur.
- `UNIQUE (legacy_page_id) WHERE legacy_page_id IS NOT NULL AND deleted_at IS NULL`.
- `(status, year DESC, number DESC)`.

Hesablanan dəyərlər saxlanılmır:
- `code = lpad(number,2,'0') || '/' || year`, nümunə "02/2025".
- `key = lpad(number,2,'0') || '-' || year`, nümunə "02-2025". Bu, ünvan açarıdır.

### `working_paper_translations`

| Sütun | Tip | Qayda |
|---|---|---|
| `id` | bigserial PK | |
| `paper_id` | integer NOT NULL → `working_papers` ON DELETE CASCADE | |
| `locale` | varchar(5) NOT NULL | `az` / `en` |
| `title` | varchar(500) NULL | boşdursa məqalə həmin dildə görünmür |
| `authors` | text[] NOT NULL DEFAULT `'{}'` | sıra saxlanılır |
| `abstract` | text NULL | sadə mətn, sətir sonları paraqraf olur |
| `keywords` | text[] NOT NULL DEFAULT `'{}'` | |
| `media_id` | bigint NULL | PDF; sənəd növü (admin API, R16) |

`UNIQUE (paper_id, locale)`.

Görünürlük (public): `status = 'published' AND deleted_at IS NULL AND btrim(title) <> ''` həmin dildə. Media silinibsə (`media_assets.deleted_at`)
fayl kartı düşür, məqalə qalır.

Admin yoxlamaları (FR-004):
- nömrə 1–99;
- il 1990 – (cari il + 1);
- ən azı bir dildə başlıq;
- başlığı olan dildə ən azı bir müəllif;
- hər JEL kodu `^[A-Z][0-9]{1,2}$`;
- `paper_language` siyahıdadır;
- media sənəd növüdür.

Siyahı sahələrində trim edilir, boş element və təkrar silinir.

### İcazələr

`working_papers.read|create|update|delete`. `Permissions.cs` daxilində həm sinif, həm `All` siyahısı. Migration onları `moderator` roluna verir (0034 nümunəsi, icazə
yoxdursa xəbərdarlıq verib dayanır). `admin` kodda bütün icazələrə malikdir.

## Səhifə menyu bayraqları

### `page_nav_details` (yeni, səhifə üzrə)

| Sütun | Tip | Qayda |
|---|---|---|
| `page_id` | integer PK | → `pages` (FK icazə varsa) |
| `show_in_dropdown_nav` | boolean NULL | `NULL` = `page_details.show_in_side_nav`-ı izlə |

Effektiv qayda (sayt `entities/page-node`):

| `show_in_side_nav` | `show_in_dropdown_nav` | Sol menyular | Açılan menyular (kökdən aşağı) |
|---|---|---|---|
| true / sətir yox | NULL | var | var |
| false | NULL | yox (açıq səhifə istisnası) | yox |
| false | true | yox (açıq səhifə istisnası) | **var** ("Ödəniş xidmətləri") |
| true | false | var | yox |

Admin input: `flags.showInDropdownNav` nullable-dır, göndərilməyən və ya `null` saxlanılan dəyəri saxlayır (`showInSideNav` qaydası). Panel həmişə iki boolean
göndərir. Sətir yalnız dəyər effektiv sol menyu dəyərindən fərqlidirsə və ya sətir artıq varsa yazılır (`page_details` `ApplySettings` nümunəsi).

### `page_translation_details` (yeni, səhifə × dil)

| Sütun | Tip | Qayda |
|---|---|---|
| `page_id` | integer NOT NULL | → `pages` (FK icazə varsa) |
| `locale` | varchar(5) NOT NULL | → `locales` (FK icazə varsa) |
| `menu_group` | varchar(120) NULL | trim; boş sətir `NULL` olur |

PK `(page_id, locale)`. Açar `translation_id` deyil, çünki `ApplyTranslationsAsync` göndərilməyən dilin tərcüməsini silir. FK qurulmayanda
`translation_id` yetim sətirlər qoyardı (research R12).

`GET /pages/tree` hər node üçün `menuGroup` qaytarır. 054-də sayt onu göstərmir (spec 055).

## Media ölçüsü yoxlaması

### `media_asset_details` (yeni)

| Sütun | Tip | Qayda |
|---|---|---|
| `media_id` | bigint PK | → `media_assets` (FK icazə varsa) |
| `size_verified_at` | timestamptz NOT NULL | MinIO ilə tutuşdurulma vaxtı |

`MediaSizeBackfillService` (research R10) belə işləyir:
- sətri olmayan və silinməmiş `media_assets` sətirlərini 100-lük partiyalarla götürür;
- hər biri üçün `StatObject(storage_key)` çağırır;
- ölçü fərqlidirsə `UPDATE media_assets SET size_bytes = <real>` edir;
- sonra sətri `INSERT … ON CONFLICT DO NOTHING` ilə yazır;
- obyekt tapılmasa xəbərdarlıq loglanır, sətir yenə yazılır.

`MediaStorage` yeni yükləmədə sətri özü yazır. `api-cbar` bu cədvəli oxumur.

## Ağac seed-i (`0041`) — gözlənilən nəticə

Səhifələr az slug ilə tapılır. Sıra `sort_order` 10, 20, … ilə verilir.

```text
nesrler-ve-tedqiqatlar (62)                       kök; Figma giriş mətni (md5 köhnədirsə)
├── tedqiqatlar (yeni)                            "Tədqiqatlar" / "Research"; Figma girişi (en draft)
│   ├── ekonometrik-modeller (74)
│   └── isci-meqaleler-silsilesi (73)             başlıq → "İşçi məqalələri" / "Working papers" (köhnədirsə)
├── nesrler-hesabatlar-ve-senedler (yeni)          "Nəşrlər, hesabatlar və sənədlər" / "Publications, reports and documents"
│   ├── illik-hesabat (63)
│   ├── sahelerarasi-maliyye-axinlarinin-tehlili (75)
│   ├── mikromaliyye-modeli-uzre-strateji-cercive (76)            menu_group "Strategiyalar və konsepsiyalar"
│   ├── maliyye-bazarlarinda-kibertehlukesizlik-strategiyasi (69)  menu_group "Strategiyalar və konsepsiyalar"
│   ├── risk-esasli-nezaret-uzre-siyaset-konsepsiyasi (66)         menu_group "Strategiyalar və konsepsiyalar"; Figma başlığı
│   ├── nezaret-texnologiyalari-uzre-yol-xeritesi (67)             menu_group "Strategiyalar və konsepsiyalar"; Figma başlığı
│   ├── reqemsal-firildaqciliq-statistikasi (103, 87-dən)          show_in_side_nav → true
│   └── odenis-xidmetleri (102, 87-dən)                            side false, dropdown true; menu_group "Ödəniş sistemləri"
├── maliyye-sabitliyi-hesabati (64)                show_in_side_nav false
├── bank-sektoru-uzre-makroprudensial-… (65)       show_in_side_nav false
├── istehlakcilarin-huquqlarinin-mudafiesi-… (68)  show_in_side_nav false
├── dayaniqli-maliyye-uzre-yol-xeritesi (70)       show_in_side_nav false
├── kreditlesme-fealiyyeti-… (71)                  show_in_side_nav false
├── maliyye-xidmetleri-sahesinde-… (72)            show_in_side_nav false
└── nesrler-ve-tedqiqatlar-copy (371)              toxunulmur
```

Ümumi qaydalar:
- Köçən səhifələrin ünvanı slug olduğu üçün dəyişmir.
- Qrup səhifələri `status = published`, `show_az = show_en = true`, `visible = true` olur.
- Figma mətnləri və köhnə md5-lər seed generatorunun JSON-undadır (`specs/054-publications-research/seed/`).
- İstehlakçı bölməsinin (87) qalan uşaqlarının `sort_order`-u dəyişmir. Spec 050 sol menyu sırası (94, 95, 86, 101) pozulmur.

## Sayt görünüş modeli (yaddaşda, saxlanılmır)

| Tip | Mənbə | Sahələr |
|---|---|---|
| `WorkingPaperListItem` | `GET /working-papers` | `id, number, year, code, key, language, title, authors[], keywords[]` |
| `WorkingPaper` | `GET /working-papers/{key}` | yuxarıdakılar + `abstract, jelCodes[], file?: {id, url, mimeType, sizeBytes}` |
| `FileArchive` (block) | CMS HTML + assets | `before: Block[]`, `groups: {label, year?: number, items: (ArchiveFile \| Link \| Html)[]}[]`, `after: Block[]` |
| `DocumentList` (block) | CMS HTML + assets | `intro: Html`, `files: ArchiveFile[]` |
| `ArchiveFile` | mövcud tip + `sizeBytes?` | `id, title, url, mimeType, sizeBytes?` |
| `PageNode` | `GET /pages/tree` | mövcud + `showInDropdownNav: boolean \| null`, `menuGroup: string \| null` |

Vəziyyət keçidləri: işçi məqaləsinin statusu `draft ⇄ published`, soft-delete isə `deleted_at` ilə edilir. Başqa vəziyyət yoxdur.
