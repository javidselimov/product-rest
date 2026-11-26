# Data model: spec 045 — Anlaşma Memorandumları

Sahib: `api-cbar-admin`. Migration-lar `db/migrations/0027-memorandums.sql` və `0028-memorandums-seed.sql` (adlar hər iki API üzrə unikaldır;
`api-cbar`-da migration yoxdur). Üslub `0025-ifi-organizations.sql` ilədir: `CREATE TABLE IF NOT EXISTS`, `BEGIN/COMMIT` yoxdur, mövcud
cədvəllərə `ALTER TABLE` yoxdur.

## Cədvəllər

### `memorandums`

| Sütun | Tip | Qayda |
|---|---|---|
| `id` | `serial` PK | |
| `signed_year` | `smallint` NOT NULL | `CHECK (signed_year BETWEEN 1991 AND 2100)` |
| `sort_order` | `integer` NOT NULL default 0 | il daxilində sıra |
| `status` | `content_status` NOT NULL default `'draft'` | `scheduled` API-də qadağan |
| `show_az`, `show_en` | `boolean` NOT NULL default true | |
| `created_by`, `updated_by` | `integer` null | şərti FK → `users(id)` `SET NULL` |
| `created_at`, `updated_at` | `timestamptz` NOT NULL default `now()` | `updated_at` `set_updated_at()` trigger ilə |
| `deleted_at` | `timestamptz` null | soft delete |

Index: `memorandums_status_year_idx (status, signed_year DESC, sort_order)`.

### `memorandum_translations`

| Sütun | Tip | Qayda |
|---|---|---|
| `id` | `bigserial` PK | |
| `memorandum_id` | `integer` NOT NULL | FK → `memorandums(id)` `ON DELETE CASCADE` |
| `locale` | `varchar(5)` NOT NULL | şərti FK → `locales(code)` |
| `organization` | `varchar(500)` NOT NULL | boş ola bilməz (API) |
| `country` | `varchar(100)` NOT NULL | boş ola bilməz (API) |

`UNIQUE (memorandum_id, locale)`.

## Migration-dakı DO blokları (`0025` nümunəsi)

1. Şərti FK-lar: `has_table_privilege(ref, 'REFERENCES')` və constraint yoxdursa `fk_<tbl>_<col>`.
2. `set_updated_at` trigger: `memorandums`.
3. `cbar_web_ro` varsa: iki cədvələ `GRANT SELECT`.
4. İcazələr: `permissions`/`role_permissions` INSERT privilege varsa `memorandums.read/create/update/delete` + `moderator` rolu, `ON CONFLICT DO NOTHING`.

## Validasiya (admin API)

- Tərcümə xəritəsi boş deyil; hər dolu dildə `organization` və `country` boş deyil (trim), uzunluq 500 / 100.
- `signedYear` 1991 … cari il + 1.
- `status` `scheduled` deyil.

## Vəziyyətlər

`draft` → `published` ↔ `archived`; silmə `deleted_at` qoyur (EF `HasQueryFilter(DeletedAt == null)`). Saytda yalnız `published`, silinməmiş,
cari dildə görünən və həmin dildə tərcüməsi olan sətirlər çıxır.

## EF modeli (hər iki `Cbar.Domain` kopyası, bayt-bayt eyni)

`src/Cbar.Domain/Entities/Memorandum.cs`: `Memorandum`, `MemorandumTranslation`. `CbarDbContext`: 2 `DbSet`, `ToTable`, `HasQueryFilter`,
translation unique index, cascade əlaqə. Yoxlama: `diff -rq product-rest/api-cbar/src/Cbar.Domain product-rest/api-cbar-admin/src/Cbar.Domain` boş.

## Seed (`0028`)

- Qoruyucu: `IF EXISTS (SELECT FROM memorandums) THEN RAISE NOTICE …; RETURN`.
- Hamısı `published`, `show_az = show_en = true`. `sort_order` il daxilində Figma sırası ilə 10, 20, …
- az — Figma `2208:77938`; en — tərcümə qaralaması (Figma-da və köhnə saytda yoxdur), redaktor yoxlamalıdır.

| # | İl | sort | Təşkilat (az) | Ölkə (az) | Organization (en) | Country (en) |
|---|---|---|---|---|---|---|
| 1 | 2026 | 10 | Slovakiya Milli Bankı | Slovakiya | National Bank of Slovakia | Slovakia |
| 2 | 2026 | 20 | Rusiya Federasiyasının Mərkəzi Bankı | Rusiya | Central Bank of the Russian Federation | Russia |
| 3 | 2026 | 30 | Qırğız Respublikasının İqtisadiyyat və Ticarət Nazirliyi yanında Maliyyə Bazarının Tənzimlənməsi və Nəzarəti Xidməti | Qırğızıstan | Financial Market Regulation and Supervision Service under the Ministry of Economy and Commerce of the Kyrgyz Republic | Kyrgyzstan |
| 4 | 2026 | 40 | Türkmənistanın Maliyyə və İqtisadiyyat Nazirliyi | Türkmənistan | Ministry of Finance and Economy of Turkmenistan | Turkmenistan |
| 5 | 2026 | 50 | Sudan Mərkəzi Bankı | Sudan | Central Bank of Sudan | Sudan |
| 6 | 2026 | 60 | Macarıstan Mərkəzi Bankı | Macarıstan | Central Bank of Hungary | Hungary |
| 7 | 2026 | 70 | Özbəkistan Respublikasının Perspektivli Layihələr üzrə Milli Agentliyi | Özbəkistan | National Agency of Perspective Projects of the Republic of Uzbekistan | Uzbekistan |
| 8 | 2025 | 10 | Belarus Respublikasının Maliyyə Nazirliyi | Belarus | Ministry of Finance of the Republic of Belarus | Belarus |
| 9 | 2025 | 20 | Türkiyə Sığorta və Özəl Pensiyaları Tənzimləmə və Nəzarət Agentliyi | Türkiyə | Insurance and Private Pension Regulation and Supervision Agency of Türkiye | Türkiye |
| 10 | 2025 | 30 | Çin Xalq Bankı | Çin | People's Bank of China | China |
| 11 | 2025 | 40 | Qazaxıstan Respublikasının Maliyyə Bazarlarının Tənzimlənməsi və İnkişafı Agentliyi | Qazaxıstan | Agency of the Republic of Kazakhstan for Regulation and Development of the Financial Market | Kazakhstan |
| 12 | 2025 | 50 | Birləşmiş Ərəb Əmirliklərinin Mərkəzi Bankı | BƏƏ | Central Bank of the United Arab Emirates | UAE |
| 13 | 2025 | 60 | Gürcüstan Milli Bankı | Gürcüstan | National Bank of Georgia | Georgia |
| 14 | 2024 | 10 | Özbəkistan Mərkəzi Bankı | Özbəkistan | Central Bank of the Republic of Uzbekistan | Uzbekistan |
| 15 | 2024 | 20 | Qırğız Respublikasının Milli Bankı | Qırğızıstan | National Bank of the Kyrgyz Republic | Kyrgyzstan |
| 16 | 2024 | 30 | Belarus Milli Bankı | Belarus | National Bank of the Republic of Belarus | Belarus |
| 17 | 2023 | 10 | Qazaxıstan Milli Bankı | Qazaxıstan | National Bank of Kazakhstan | Kazakhstan |
| 18 | 2023 | 20 | Tacikistan Milli Bankı | Tacikistan | National Bank of Tajikistan | Tajikistan |
| 19 | 2022 | 10 | Çin Xalq Respublikasının Bank və Sığorta Tənzimləmə Komissiyası | Çin | China Banking and Insurance Regulatory Commission | China |
| 20 | 2022 | 20 | Türkiyə Respublikası Prezidenti Administrasiyasının Maliyyə Ofisi | Türkiyə | Finance Office of the Presidency of the Republic of Türkiye | Türkiye |
| 21 | 2021 | 10 | Türkiyə Kapital Bazarları Şurası | Türkiyə | Capital Markets Board of Türkiye | Türkiye |
| 22 | 2020 | 10 | Türkiyə Respublikasının Mərkəzi Bankı | Türkiyə | Central Bank of the Republic of Türkiye | Türkiye |
| 23 | 2020 | 20 | İtaliya Respublikasının Milli Mikrokredit Agentliyi | İtaliya | Italian National Microcredit Agency | Italy |
| 24 | 2016 | 10 | İran İslam Respublikasının Mərkəzi Bankı | İran | Central Bank of the Islamic Republic of Iran | Iran |
| 25 | 2006 | 10 | Rusiya Federasiyasının Mərkəzi Bankı | Rusiya | Central Bank of the Russian Federation | Russia |
| 26 | 2005 | 10 | Türkiyə Bank Tənzimlənməsi və Nəzarəti Agentliyi | Türkiyə | Banking Regulation and Supervision Agency of Türkiye | Türkiye |
| 27 | 2000 | 10 | Ukrayna Milli Bankı | Ukrayna | National Bank of Ukraine | Ukraine |
| 28 | 1996 | 10 | Pakistan İslam Respublikası Mərkəzi Bankı | Pakistan | State Bank of Pakistan | Pakistan |

### Səhifə bloku (research R5)

Giriş paraqrafı, az (Figma `2198:112845`):

> Azərbaycan Respublikasının Mərkəzi Bankı (ARMB) beynəlxalq arenada fəal rol oynamaq məqsədilə öz fəaliyyəti çərçivəsində xarici ölkələrin
> mərkəzi bankları, maliyyə bazarlarına nəzarət orqanları, rezolyusiya orqanları ilə ikitərəfli formatda sıx əməkdaşlıq edir. Bu çərçivədə ARMB
> sözügedən qurumlar ilə Anlaşma Memorandumları imzalayaraq texniki əməkdaşlıq və yüksək səviyyəli dialoq fəaliyyəti həyata keçirir. Bu
> Memorandumların əsas məqsədi monetar siyasət, bank nəzarəti, kapital bazarı, sığorta sektoru, ödəniş sistemləri, maliyyə texnologiyaları
> sahəsində əməkdaşlıq edilməsi, təcrübə və məlumat mübadiləsinin aparılması, aktual məsələlərin müzakirəsi, təlim, internatura proqramları və
> seminarların keçirilməsi, texniki məsləhətlərin verilməsi məqsədilə araşdırma və tədqiqat xarakterli səfərlərin təşkilindən ibarətdir.

en (tərcümə qaralaması):

> In order to play an active role in the international arena, the Central Bank of the Republic of Azerbaijan (CBA) cooperates closely on a
> bilateral basis with the central banks, financial market supervisory authorities and resolution authorities of foreign countries. Within this
> framework the CBA signs Memoranda of Understanding with these institutions and carries out technical cooperation and high-level dialogue. The
> main purpose of these Memoranda is cooperation in monetary policy, banking supervision, the capital market, the insurance sector, payment
> systems and financial technologies, the exchange of experience and information, the discussion of topical issues, trainings, internship
> programmes and seminars, and study and research visits for technical advice.

Şərt: həmin dilin `content`-i (əvvəldəki boşluqlar atılmaqla) `<p><strong>` ilə başlayır → `content = '<p>giriş</p>' || E'\n' || content`.
