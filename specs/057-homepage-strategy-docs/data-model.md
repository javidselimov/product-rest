# Data model — 057 "Strategiya və sənədlər"

Sxem `api-cbar-admin`-dədir (`0043-homepage-strategy-docs.sql`), EF modeli hər iki `Cbar.Domain` kopyasında bayt-bayt eynidir
(`Entities/Homepage.cs`, `CbarDbContext.cs`). `api-cbar` cədvəlləri `cbar_web_ro` ilə oxuyur.

## Cədvəllər

### `homepage_strategy_docs`

| Sütun | Tip | Qayda |
|---|---|---|
| `id` | `serial` PK | |
| `page_id` | `integer` null | bağlı CMS səhifəsi. Şərti FK → `pages(id) ON DELETE SET NULL` |
| `sort_order` | `integer NOT NULL DEFAULT 0` | yaratmada `max + 1`, `PUT …/order` 1..n yazır |
| `status` | `content_status NOT NULL DEFAULT 'draft'` | yalnız `published` / `draft`. `scheduled` API-də rədd edilir |
| `created_by`, `updated_by` | `integer` null | şərti FK → `users(id) ON DELETE SET NULL` |
| `created_at`, `updated_at` | `timestamptz NOT NULL DEFAULT now()` | `updated_at` `set_updated_at()` trigger-i ilə |
| `deleted_at` | `timestamptz` null | soft delete |

İndeks: `(status, sort_order)`.

### `homepage_strategy_doc_translations`

| Sütun | Tip | Qayda |
|---|---|---|
| `id` | `bigserial` PK | |
| `doc_id` | `integer NOT NULL` → `homepage_strategy_docs(id) ON DELETE CASCADE` | |
| `locale` | `varchar(5) NOT NULL` | `az` / `en`. Şərti FK → `locales(code)` |
| `title` | `varchar(300) NOT NULL` | trim. Başlıqsız dil saxlanılmır |
| `summary` | `varchar(500)` null | yalnız dar kartlarda göstərilir |
| `cover_media_id` | `bigint` null | şəkil olmalıdır. Şərti FK → `media_assets(id)` |
| `url` | `varchar(1000)` null | `http(s)://…` və ya `/…`. `//…` və başqa sxemlər rədd edilir |

`UNIQUE (doc_id, locale)`.

Dil yalnız başlığı olanda saxlanılır (FinCERT üzvlükləri qaydası). Başlığı boş göndərilən dilin sətri silinir, o dilin üz qabığı və ünvanı da
onunla gedir. Panel bunu formada qeyd edir: "Başlıqsız dil saxlanılmır".

### İcazələr və grant (`0043`)

- `permissions`: `homepage_strategy_docs.read`, `.create`, `.update` (redaktə + sıra), `.delete`. Hamısı `moderator` roluna verilir. Admin kodda
  bütün icazələrə malikdir. INSERT hüququ olmayan mühitdə blok `RAISE WARNING` ilə keçir (`0036` kimi).
- `GRANT SELECT ON homepage_strategy_docs, homepage_strategy_doc_translations TO cbar_web_ro` (rol varsa).

## EF modeli

```text
HomepageStrategyDoc            HomepageStrategyDocTranslation
  Id: int                        Id: long
  PageId: int?  → Page?          DocId: int → Doc
  SortOrder: int                 Locale: string
  Status: ContentStatus          Title: string
  CreatedBy/UpdatedBy: int?      Summary: string?
  CreatedAt/UpdatedAt            CoverMediaId: long? → MediaAsset?
  DeletedAt: DateTimeOffset?     Url: string?
  Translations: List<…>
```

`DbSet<HomepageStrategyDoc> HomepageStrategyDocs`. Cədvəl adları və `doc_id` sütun adı `OnModelCreating`-də verilir. Soft delete
`HasQueryFilter(x => x.DeletedAt == null)` ilədir, `FincertMembership` konfiqurasiyası kimi. Ona görə seed-in "sətir varmı" yoxlaması SQL-dədir,
EF-də yox.

## Görünürlük qaydası (public, Konstitusiya III.3)

Sənəd `locale` dilində `strategyDocs`-a yalnız bu hallarda düşür:

1. `deleted_at IS NULL` və `status = 'published'`;
2. həmin dildə tərcüməsi var (deməli başlığı var);
3. `href` həll olunur:
   - həmin dilin `url`-i doludursa → `url`;
   - yoxdursa, `page_id` səhifəsi üçün `Status = Published`, `Active = true`, dilə görə `ShowAz`/`ShowEn` və həmin dildə `page_translations.slug`
     varsa → `"/" + slug`;
   - heç biri yoxdursa → sənəd düşmür.

Sıra: `sort_order`, sonra `id`. `coverUrl` həmin dilin `cover_media_id`-sidir, o yoxdursa digər dilinki (`"/media/{id}"`), ikisi də yoxdursa `null`.

## Validasiya (admin API, 400 `problem+json`, Azərbaycanca `message`)

Ardıcıllıq `StrategyDocRules.Validate` (təmiz funksiya) → DB yoxlamaları:

| Qayda | Mesaj (taslaq) | `errors` açarı |
|---|---|---|
| `status = scheduled` | «Sənəd planlaşdırıla bilməz: «Dərc olunub» və ya «Qaralama» seçin.» | `status` |
| dil `az`/`en` deyil | «Yalnız az və en dilləri qəbul olunur.» | — |
| heç bir dildə başlıq yoxdur | «Sənədin ən azı bir dildə başlığı olmalıdır.» | `translations.az.title` |
| başlıq > 300, qısa mətn > 500, ünvan > 1000 | «… ən çox N simvol ola bilər.» | `translations.<dil>.<sahə>` |
| ünvan qaydaya uymur | «Ünvan http://, https:// və ya / ilə başlamalıdır.» | `translations.<dil>.url` |
| nə `pageId`, nə də başlıqlı dildə `url` var | «Keçid üçün səhifə seçin və ya ünvan yazın.» | `pageId` |
| `pageId` mövcud deyil | «Seçilmiş səhifə tapılmadı.» | `pageId` |
| `coverMediaId` mövcud deyil və ya şəkil deyil | «Üz qabığı üçün şəkil faylı seçin.» | `translations.<dil>.coverMediaId` |

`errors` açarları panelin `serverErrorPath` qaydasındadır (spec 054): xəta həmin dilin tabındakı sahəyə düşür.

## Sıra (`PUT /homepage-strategy-docs/order`)

Body `{ ids: int[] }` silinməmiş bütün sənədlərin tam permutasiyası olmalıdır (`ContentSupport.InvalidOrder`), yoxsa 400 qaytarılır. `sort_order` 1..n
yazılır, audit bir qeyd olur (`entity id 0`, before/after id siyahısı).

## Seed (`0044-homepage-strategy-docs-seed.sql`) — axın

1. `homepage_strategy_docs`-da hər hansı sətir varsa (silinmiş də) → çıxış.
2. Üç sənəd üçün, sıra ilə:

   | # | az slug | az başlıq | en başlıq |
   |---|---|---|---|
   | 1 | `maliyye-sektorunun-inkisaf-strategiyasi` | 2024-2026-cı illərdə maliyyə sektorunun inkişaf Strategiyası | Financial Sector Development Strategy for 2024-2026 |
   | 2 | `risk-esasli-nezaret-uzre-siyaset-konsepsiyasi` | Azərbaycan Respublikası Mərkəzi Bankının risk əsaslı nəzarət üzrə Siyasət Konsepsiyası | Risk-Based Supervision Policy Concept of the Central Bank of the Republic of Azerbaijan |
   | 3 | `mikromaliyye-modeli-uzre-strateji-cercive` | Mikromaliyyə Modeli üzrə Strateji Çərçivə | Strategic Framework for a Microfinance Model |

   Səhifə `page_translations (locale = 'az', slug = …)` ilə tapılır. Tapılmırsa sətir yazılmır. Tapılırsa `status = 'published'`, `page_id`,
   `sort_order` = sıra nömrəsi, iki tərcümə (başlıq, qalan sahələr boş) yazılır.
3. CMS səhifələrinə, media-ya və başqa cədvələ toxunulmur.

## Strategiya səhifəsi (US4) — mövcud cədvəllərə yazı, sxem dəyişmir

İdxal aləti (`tools/media-backfill/import-strategy-page.mjs`) yazır, miqrasiya yox:

| Cədvəl | Yazı |
|---|---|
| `media_assets` | ən çox 3 sətir (`9183.png`, `2024_2026_Azerbaijani.pdf`, `2024_2026_English.pdf`), yalnız eyni `checksum_sha256` yoxdursa |
| `media_asset_details` | yeni sətir üçün `(media_id)` (upload kimi, spec 054) |
| `page_translations` | 104-ün `az` və `en` `content`-i, yalnız 105-in eyni dildəki `content`-inə bərabərdirsə. `title`, `slug` toxunulmur |

`pages`, `page_details`, `page_nav_details`, `page_assets` və 105 dəyişmir. Mətnin forması `contracts/strategy-page.md` §1-dədir.

## Saytdakı görünüş modeli (web-cbar-new, saxlanmır)

`StrategyDoc` tipi dəyişmir (`widgets/home-cards/strategy-docs.tsx`): `{ key, title, summary, coverUrl, href }`.

- `key` = `String(id)`;
- `href` = `localizeHref(api.href, locale, …)`: daxili ünvana `/{locale}` prefiksi verilir, xarici ünvan olduğu kimi qalır;
- `coverUrl` = `mediaUrl(api.coverUrl)`.

Loader ilk `STRATEGY_DOCS_MAX` (3) sənədi götürür. Widget daxili ünvanı `Link` ilə, xarici ünvanı `SmartLink` ilə yeni vərəqdə açır (FR-015).
