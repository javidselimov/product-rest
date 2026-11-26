# Data model: spec 044 — Beynəlxalq maliyyə təşkilatları

Sahib: `api-cbar-admin`. Migration-lar `db/migrations/0025-ifi-organizations.sql` və `0026-ifi-organizations-seed.sql` (adlar hər iki API üzrə
unikaldır; `api-cbar`-da migration yoxdur). Üslub `0020-csr-projects.sql` ilədir: `CREATE TABLE IF NOT EXISTS`, `BEGIN/COMMIT` yoxdur,
mövcud cədvəllərə `ALTER TABLE` yoxdur.

## Cədvəllər

### `ifi_organizations`

| Sütun | Tip | Qayda |
|---|---|---|
| `id` | `serial` PK | |
| `logo_media_id` | `bigint` null | şərti FK → `media_assets(id)` `ON DELETE SET NULL`; yalnız `image/*` (API) |
| `website_url` | `varchar(500)` null | `http(s)://` (API) |
| `member_since` | `smallint` null | `CHECK (member_since BETWEEN 1900 AND 2100)` |
| `sort_order` | `integer` NOT NULL default 0 | |
| `status` | `content_status` NOT NULL default `'draft'` | `scheduled` API-də qadağan |
| `show_az`, `show_en` | `boolean` NOT NULL default true | |
| `created_by`, `updated_by` | `integer` null | şərti FK → `users(id)` `SET NULL` |
| `created_at`, `updated_at` | `timestamptz` NOT NULL default `now()` | `updated_at` `set_updated_at()` trigger ilə |
| `deleted_at` | `timestamptz` null | soft delete |

Index: `ifi_organizations_status_sort_idx (status, sort_order)`.

### `ifi_organization_translations`

| Sütun | Tip | Qayda |
|---|---|---|
| `id` | `bigserial` PK | |
| `organization_id` | `integer` NOT NULL | FK → `ifi_organizations(id)` `ON DELETE CASCADE` |
| `locale` | `varchar(5)` NOT NULL | şərti FK → `locales(code)` |
| `name` | `varchar(255)` NOT NULL | boş ola bilməz (API) |
| `mission` | `text` null | "Əsas missiya" qutusu |
| `membership_intro` | `varchar(500)` null | tarix şəbəkəsindən əvvəlki qalın sətir |
| `content` | `text` null | zəngin mətn (tarixlərdən sonrakı paraqraflar) |

`UNIQUE (organization_id, locale)`.

### `ifi_memberships`

| Sütun | Tip | Qayda |
|---|---|---|
| `id` | `bigserial` PK | |
| `organization_id` | `integer` NOT NULL | FK → `ifi_organizations(id)` `ON DELETE CASCADE` |
| `joined_on` | `date` NOT NULL | |
| `sort_order` | `integer` NOT NULL default 0 | |

Index: `ifi_memberships_org_sort_idx (organization_id, sort_order)`.

### `ifi_membership_translations`

| Sütun | Tip | Qayda |
|---|---|---|
| `id` | `bigserial` PK | |
| `membership_id` | `bigint` NOT NULL | FK → `ifi_memberships(id)` `ON DELETE CASCADE` |
| `locale` | `varchar(5)` NOT NULL | şərti FK → `locales(code)` |
| `name` | `varchar(255)` NOT NULL | |

`UNIQUE (membership_id, locale)`.

## Migration-dakı DO blokları (0020 nümunəsi)

1. Şərti FK-lar: `has_table_privilege(ref, 'REFERENCES')` və constraint yoxdursa `fk_<tbl>_<col>`.
2. `set_updated_at` trigger: `ifi_organizations`.
3. `cbar_web_ro` varsa: dörd cədvələ `GRANT SELECT`.
4. İcazələr: `permissions`/`role_permissions` INSERT privilege varsa `ifi.read/create/update/delete` + `moderator` rolu, `ON CONFLICT DO NOTHING`.

## Validasiya (admin API)

- Tərcümə xəritəsi boş deyil; hər dolu dildə `name` boş deyil.
- `status` `scheduled` deyil; `member_since` 1900–2100 və ya null; `website_url` mütləq `http(s)` URL və ya null.
- `logo_media_id` mövcud və `image/*` media.
- Üzvlük: `joined_on` məcburi; ən azı bir dildə `name`; sıra dəyişikliyində id dəsti cari dəstlə dəqiq eynidir.

## Vəziyyətlər

`draft` → `published` ↔ `archived`; silmə `deleted_at` qoyur (EF `HasQueryFilter(DeletedAt == null)`). Saytda yalnız `published`, silinməmiş,
cari dildə görünən və həmin dildə tərcüməsi olan təşkilatlar çıxır.

## EF modeli (hər iki `Cbar.Domain` kopyası, bayt-bayt eyni)

`src/Cbar.Domain/Entities/IfiOrganization.cs`: `IfiOrganization`, `IfiOrganizationTranslation`, `IfiMembership`, `IfiMembershipTranslation`
(CSR-dəki kimi bir fayl). `CbarDbContext`: 4 `DbSet`, `ToTable`, `HasQueryFilter`, translation unique index-ləri, cascade əlaqələr.
Yoxlama: `diff -rq product-rest/api-cbar/src/Cbar.Domain product-rest/api-cbar-admin/src/Cbar.Domain` boş.

## Seed (`0026`)

- Qoruyucu: `IF EXISTS (SELECT FROM ifi_organizations) THEN RAISE NOTICE …; RETURN`.
- Təşkilatlar (sort, il, link):

| sort | az ad | il | link |
|---|---|---|---|
| 10 | Dünya Bankı Qrupu | 1992 | https://www.worldbank.org |
| 20 | Beynəlxalq Valyuta Fondu | 1992 | https://www.imf.org |
| 30 | Asiya İnkişaf Bankı | 1999 | https://www.adb.org |
| 40 | Avropa Yenidənqurma və İnkişaf Bankı | 1992 | https://www.ebrd.com |

- DB üzvlükləri: 18.09.1992 Beynəlxalq Yenidənqurma və İnkişaf Bankı; 23.09.1992 Çoxtərəfli İnvestisiya Zəmanətləri Agentliyi;
  18.10.1992 Beynəlxalq İnvestisiya Mübahisələrinin Həlli Mərkəzi; 31.03.1995 Beynəlxalq İnkişaf Assosiasiyası; 11.10.1995 Beynəlxalq Maliyyə Korporasiyası.
- Missiya, giriş sətri və mətn: Figma `2172:3599` (az). en: köhnə en məzmunu; AYİB tərcümə qaralaması.
- Səhifə bloku: research R4.
