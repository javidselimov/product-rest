# new_business_logic.md — yeni cbar.az-ın (product-rest) biznes məntiqi

Mənbə: `product-rest/` qovluğundakı 4 layihə — `api-cbar-admin`, `api-cbar`, `web-cbar-admin-new`, `web-cbar-new`. Tarix: 2026-10-21.
Sync: `f542884` · 2026-10-21 · inkremental + işçi ağac · qismən: press-releases (spec 033) işçi ağac 2026-11-04, events (spec 034) işçi ağac 2026-11-04, multimedia (spec 035) işçi ağac 2026-11-05, pages (spec 041) işçi ağac 2026-11-12, pages + data-model (spec 044 maliyyə təşkilatları) işçi ağac 2026-11-13, pages + data-model (spec 045 memorandumlar) işçi ağac 2026-11-13, pages + admin naviqasiyası (spec 046 üzvlük, menyu qrupları) işçi ağac 2026-11-16, pages + navigation + data-model (spec 047 maliyyə savadlılığı) işçi ağac 2026-11-16, public sayt UX (spec 049 scroll reveal, qrafiklərin gec yüklənməsi) işçi ağac 2026-11-16, pages + navigation + data-model (spec 050 istehlakçı hüquqları) işçi ağac 2026-11-17, pages + navigation + data-model + admin (spec 051 sual-cavab) işçi ağac 2026-11-17, pages + data-model + admin (spec 052 aylıq hesabatlar) işçi ağac 2026-11-18, pages + navigation + data-model + admin (spec 053 FinCERT) işçi ağac 2026-11-19, pages + navigation + data-model + admin + media (spec 054 nəşrlər, işçi məqalələri, menyu yeri, media ölçüsü) işçi ağac 2026-11-20, navigation + pages + admin (spec 056 header: "Maliyyə sabitliyi", hamburger paneli) işçi ağac 2026-11-23, homepage + navigation + data-model (spec 057 strategiya sənədləri) 2dd1929 2026-11-24, azir (spec 058 Excel importu) işçi ağac 2026-11-24, homepage + events (spec 059 Təqvim: tarixə görə ən yeni 3) işçi ağac 2026-11-25, organization (spec 060 struktur sxemi; spec 027 sxemi ilk dəfə) işçi ağac 2026-11-26
Kod dəyişdirilməyib, yalnız oxunub. Yollar hər layihənin öz qovluğuna nisbətəndir. Sətir nömrələri təxminidir (±3).

Bu sənəd **sistem nə edir, hansı qaydalarla və niyə** sualına cavab verir. Sonda (§12–13) tapılan boşluqlar, buglar və riskler toplanıb.
Köhnə sistemlə müqayisə üçün: [`old_businesslogic.md`](old_businesslogic.md).

---

## Mündəricat

1. [Sistem nədir və necə qurulub](#1-sistem-nədir-və-necə-qurulub)
2. [Hamı üçün keçərli qaydalar](#2-hamı-üçün-keçərli-qaydalar)
3. [Data modeli](#3-data-modeli)
4. [Maliyyə və statistika məlumatları](#4-maliyyə-və-statistika-məlumatları)
5. [Kontent modulları](#5-kontent-modulları)
6. [Ana səhifə](#6-ana-səhifə)
7. [Naviqasiya, dil, axtarış, SEO](#7-naviqasiya-dil-axtarış-seo)
8. [Fayllar (media)](#8-fayllar-media)
9. [Admin panel: ekranlar, rollar, iş axınları](#9-admin-panel-ekranlar-rollar-iş-axınları)
10. [Təhlükəsizlik](#10-təhlükəsizlik)
11. [İnfrastruktur, miqrasiya, seed, deploy](#11-infrastruktur-miqrasiya-seed-deploy)
12. [Məlum buglar və risklər](#12-məlum-buglar-və-risklər)
13. [Uyğunsuzluqlar və yadda saxlanmalı qaydalar](#13-uyğunsuzluqlar-və-yadda-saxlanmalı-qaydalar)

---

## 1. Sistem nədir və necə qurulub

### 1.1 Dörd tətbiq, bir baza

```
web-cbar-admin-new ──JWT + refresh cookie──▶ api-cbar-admin ──yazır──┐
(React SPA, redaktor)                        (CMS API, sxemin sahibi) ├─▶ PostgreSQL
                                                                      │   + MinIO (fayllar)
web-cbar-new ──server-side (SSR)──▶ api-cbar ──yalnız oxuyur─────────┘
(Next.js, ziyarətçi)               (public API, cbar_web_ro rolu)
```

| Tətbiq | Stack | Rolu |
|---|---|---|
| `api-cbar-admin` | .NET, EF Core, Npgsql, Minio client | CMS API. `/api/v1` altında 27 controller. **Bazanın sxeminin sahibi və yeganə yazan tərəf.** Miqrasiyaları və seed-i işə salır. |
| `api-cbar` | .NET, EF Core | Public API. Anonim, yalnız `GET`. Bazaya **SELECT-only** `cbar_web_ro` rolu ilə qoşulur — yazma cəhdi DB səviyyəsində icazə xətası verir. |
| `web-cbar-admin-new` | React, Vite, TanStack Router/Query, RHF + Zod, TipTap, `@cbar/lib-react-ui-kit` | Redaktorların admin paneli. Ekranların çoxu deklarativ konfiqdən generasiya olunur. |
| `web-cbar-new` | Next.js App Router, SSR, ECharts, `@cbar/lib-react-ui-kit` | Public sayt (www.cbar.az). **Brauzer API-yə birbaşa getmir** — bütün sorğular Next serverindən gedir. |

- `Cbar.Domain` (entity-lər + `CbarDbContext`) hər iki API-də **bayt-bayt təkrarlanır** — ortaq paket yoxdur. Entity dəyişikliyi hər iki nüsxədə eyni edilməlidir. `MediaStorageOptions` da eyni qaydada təkrarlanır.
- Hər iki API eyni `schema_migrations` cədvəlini və eyni advisory lock açarını (`0x0CBA5`) paylaşır (§11.1).

### 1.2 Kim istifadə edir

| Auditoriya | Nə edir | Harada |
|---|---|---|
| **Ziyarətçi** (əhali, biznes, media) | məzənnə, statistika, press-relizlər, qanunlar, pul nişanları, təşkilat, multimedia | `web-cbar-new` |
| **Xarici IT sistemləri** | maşın oxuya bilən məzənnə feed-i | `GET /currencies/DD.MM.YYYY.xml` (`api-cbar`) — **kontrakt** |
| **İnvestorlar** | emitentlərin açıqlamaları (MEAS) | `/securities` səhifəsi |
| **Redaktor** (admin / moderator) | moderator: bütün məzmun, maliyyə, MEAS, media; **parametrlər, istifadəçilər, audit, alt ağac silmə yox** (§10.3) | `web-cbar-admin-new` |
| **MEAS meneceri** | API səviyyəsində **yalnız MEAS** + media yükləmə / öz faylını silmə (§10.3); panel menyunu gizlətmir — digər bölmələr 403 verir | `web-cbar-admin-new` |
| **Admin** | hər şey; icazələri kodda verilir, bazadan asılı deyil (§10.3) | `/users`, `/settings` |

### 1.3 Məlumat sayta necə daxil olur

Yeni sistemdə **arxa fon işi (cron, hosted service, scheduler) yoxdur.** Məlumat yalnız bir kanalla gəlir:

1. **Redaktor admin paneldə əl ilə daxil edir** — formlar, məzənnə cədvəli (grid), AZIR/inflyasiya "upsert" kartları.
2. **Redaktor Excel faylı yükləyir** — məzənnə bülleteni (2026-10-20, spec 025, §4.1) və gəlirlilik əyrisinin 3 faylı (2026-10-21, §4.4), köhnə sistemdəki kimi; bankın gündəlik "AZIR Website" faylı (2026-11-24, spec 058, §4.2) — köhnədə AZIR əl ilə yazılırdı.

Köhnə sistemdəki BankInfo XML push API, xarici reyestr/ödəniş statistikası inteqrasiyası **yeni kodda yoxdur**.

Əlavə olaraq `api-cbar-admin/scripts/` altında Python seed skriptləri var — köhnə saytın HTML dump-larından səhifə ağacını və məzmununu admin API vasitəsilə doldururlar (§11.2).

---

## 2. Hamı üçün keçərli qaydalar

### 2.1 İki dil (az/en), dil URL-də

- Yalnız `az` (default) və `en`. `locales` cədvəlində saxlanılır.
- **Hər tərcümə olunan entity-nin yanında `<entity>_translations` cədvəli var**, açar `(entity_id, locale)`. Slug-lı cədvəllərdə əlavə unique `(locale, slug)` — **slug hər dil üçün ayrıca və fərqli ola bilər.**
- Qeyd bir dildə dolu, digərində boş ola bilər. Admin formada "required" per-locale sahə **iki dildən yalnız birində** doldurulmalıdır; bütün sahələri boş olan dil payload-a daxil edilmir.
- **Public saytda dil URL prefiksindədir** (`/az/...`, `/en/...`). Cookie yoxdur (§7.2).
- Public API-də `?locale=` parametri (default `az`) **validasiya olunmur**. `locale=ru` boş siyahı / 404 qaytarır. `en` olmayan hər dəyər `ShowAz` bayrağını istifadə edir.
- **Dil fallback-i demək olar yoxdur.** Tərcüməsi olmayan qeyd həmin dildə sadəcə görünmür. Yeganə istisna: səhifə fayllarının başlığı (tələb olunan dil → əlifba üzrə ilk dil → faylın orijinal adı).

### 2.2 Status iş axını (`ContentStatus`)

PostgreSQL enum `content_status`: **`draft`, `scheduled`, `published`, `archived`** (`Cbar.Domain/Entities/Content.cs:3-9`). API JSON-da camelCase string kimi göndərilir.

| Status | Public saytda |
|---|---|
| `draft` | görünmür |
| `scheduled` | **heç vaxt görünmür** — hətta `PublishedAt` keçəndən sonra da. Onu `published`-ə keçirən iş yoxdur. |
| `published` | görünür (digər filtrlərdən keçərsə) |
| `archived` | görünmür |

- Status sahəsi olan modullar: səhifələr, press-relizlər, qanunlar, MEAS sənədləri, pul nişanları, pul nişanı xəbərləri.
- Səhifə formu `scheduled` variantını göstərmir (`PAGE_STATUS_OPTIONS`).
- Admin API statusu **validasiya etmir** — istənilən keçid mümkündür (məs. `published` + boş `PublishedAt`).
- Status sahəsi olmayan modullar (qalereya, video, banner, ana səhifə blokları, təşkilat) `IsActive` bayrağı ilə idarə olunur.

### 2.3 Embargo (`PublishedAt`)

Public API `PublishedAt <= DateTimeOffset.UtcNow` yoxlayır — gələcək tarixli qeyd tarixi gələndə **avtomatik** görünür (status `published` olmaq şərti ilə). Amma qayda modullara görə **fərqlidir**:

| Modul | `PublishedAt` gələcəkdə | `PublishedAt` boş (NULL) |
|---|---|---|
| Press-relizlər | gizli | **gizli** |
| Pul nişanı xəbərləri | gizli | **gizli** |
| Qanunlar | gizli | **görünür** (siyahının başında — PG-də DESC sıralamada NULL-lar əvvəl gəlir) |
| Videolar | **embargo yoxdur**, yalnız sıralama | görünür |
| Ana səhifə nəşrləri | **embargo yoxdur**, yalnız sıralama | görünür |
| Səhifələr, MEAS, pul nişanları | `PublishedAt` sahəsi yoxdur | — |

Bannerlər və qaçan sətirlər üçün ayrıca **`StartsAt`/`EndsAt` pəncərəsi** var (§6).

### 2.4 Görünürlük bayraqları

| Bayraq | Mənası | Harada |
|---|---|---|
| `status` | §2.2 | səhifə, press-reliz, qanun, MEAS, pul nişanı, PN xəbəri |
| `active` | səhifə aktivdir | `pages` |
| `visible` | menyuda görünür (**slug ilə birbaşa açılışa təsir etmir**, amma axtarışdan gizlədir) | `pages` |
| `show_az`, `show_en` | bu dildə göstər | yalnız `pages` |
| `show_in_footer` | footer menyusu | `pages` — **public API bunu ötürmür**, effekti yoxdur |
| `is_active` | aktivdir | qalereya, video, banner, slayder, link, nəşr, info line, valyuta, kateqoriyalar, emitentlər, heyət və s. |
| `is_live` | canlı yayım aktivdir | `video_streams` |
| `show_on_homepage` | valyuta ana səhifə vidcetində | `currencies` (miqrasiya 0002) |
| `readonly`, `disabled`, `removable`, `removable_all`, `movable_u/d/l/r`, `selected`, `collapsed` | səhifə ağacı redaktorunun davranışı (§5.1) | `pages` |

⚠️ Valideyn obyektin aktivliyi uşaqlara ötürülmür: qeyri-aktiv qanun kateqoriyasındakı qanunlar, qeyri-aktiv emitentin MEAS sənədləri, qeyri-aktiv valyutanın məzənnələri public-də görünməyə davam edir.

### 2.5 Soft delete

EF global query filter (`DeletedAt == null`) ilə — controllerlərdə yox, `CbarDbContext`-də:
**User, MediaAsset, Page, PressRelease, Law, MeasDocument, MoneyMark, MoneyMarkNews, Gallery, Video.**

Qalanları (bannerlər, ana səhifə blokları, təşkilat, kateqoriyalar, lookup-lar, AZIR, inflyasiya, info lines, video yayımlar, qanun/PN kateqoriyaları) admin-də **hard delete** olunur.

### 2.6 Sıralama

- Əksər siyahılar `SortOrder`, sonra `Id` üzrə.
- Tarixli xəbər tipli siyahılar `PublishedAt DESC` üzrə (press-reliz, PN xəbəri — **tiebreak yoxdur**, eyni tarixli qeydlər səhifələr arası "atlaya" bilər).
- Admin-də yeni fayl/şəkil `max(sort_order) + 1` alır; yenidən sıralama tam siyahı göndərməklə edilir və `1..n` nömrələnir.
- Admin siyahılarında **sütun üzrə sıralama yoxdur**.

### 2.7 Səhifələmə (pagination)

- **Public API:** `page` default 1 (1..100 000), `pageSize` default 10 (1..100). Cavab: `{ items, total, page, pageSize }`.
- Səhifələnməyən public endpointlər: `/money-marks`, `/video-streams`, `/azir`, `/inflation` (filtrsiz bütün tarixçəni qaytarır).
- **Admin API** (`Validation/PagingQuery.cs`, spec 016): default 20 (media 24, AZIR və info lines 50). Heç bir dəyər rədd edilmir — sıxılır: `page` 1..100 000, `pageSize` ≤ **100**; `pageSize < 1` endpoint-in default-una düşür. Cavab faktiki verilən `page`/`pageSize`-ı qaytarır.

### 2.8 Keş

- **Public sayt** (`web-cbar-new/src/server/cached.ts`): Next `unstable_cache`, ömür **hamısı üçün 10 san**, səhifə ağacı (menyu) daxil (`CONTENT_REVALIDATE_SECONDS`, `cached.ts:65`; 2026-10-14-ə qədər məzmun 60 san, ağac 300 san idi). Endpoint-lər öz `revalidate`-ini vermir, default-u götürür (`cached.ts:89`, `:104`).
  - Keşlənir: bütün `features/*/api` — səhifə ağacı və CMS səhifəsi, ana səhifə, press-relizlər, qanunlar, MEAS, pul nişanları və xəbərləri, təşkilat, multimedia, məzənnələr, AZIR/inflyasiya/gəlirlilik əyrisi, şəkilli popup, əlçatanlıq vidceti ayarı. **Keşlənmir:** axtarış.
  - **Stale-while-revalidate** (`cached.ts:60-63`): ömür bitəndən sonra ilk sorğu hələ köhnə cavabı alır, təzəsi fonda gətirilir. Admin-dəki dəyişiklik **~10 san + bir yeniləmədən sonra** görünür, dərhal yox. 404 (`null`) də 10 san keşlənir — yeni dərc olunmuş səhifə qısa müddət 404 verə bilər.
  - `next.config.ts`-də `cacheHandler` yoxdur → keş hər pod-un özündədir, pod-lar qısa müddət fərqli versiya göstərə bilər.
  - Tag-lər qoyulub (`cached.ts:93`), amma `revalidateTag` çağıran kod yoxdur (axtarılıb); on-demand təmizləmə (spec 023 — webhook + "Keşi təmizlə") **təxirə salınıb**.
  - Keşi tam söndürmək qəsdən edilmir: `api-client` ziyarətçinin IP-sini ötürmür, `api-cbar`-ın 1000/dəq limiti bütün sayt üçün ortaq olardı (`cached.ts:62-63`).
- **Public API:** Redis qeydiyyatdan keçib, **amma heç yerdə istifadə olunmur.** JSON cavablarda HTTP keş başlığı yoxdur. Yalnız `/media/{id}` uzunmüddətli keşlənir (§8).
- **Admin panel:** TanStack Query, `staleTime` 30 san, mutasiyadan sonra müvafiq açarlar invalidasiya olunur.

### 2.9 Tarix və saat

- `TZ=Asia/Baku` konteynerlərdə, amma embargo UTC ilə müqayisə olunur.
- Tarix-yalnız sahələr (`DateOnly`) ISO `yyyy-MM-dd`; XML feed-də `DD.MM.YYYY`.
- Public sayt tarixləri `Intl` ilə formatlayır, tarix-yalnız stringləri UTC-də.

### 2.10 Xəta davranışı

- **Public sayt:** detal səhifələrində API 404 → Next `notFound()` → real 404 səhifəsi (köhnə saytdakı kimi ana səhifəyə redirect yoxdur). Siyahı və ana səhifə blokları öz xətalarını yerində göstərir (`ErrorState`) ki, bir blok bütün səhifəni sındırmasın.
- **Admin API** (spec 018, `api-cbar-admin/src/Cbar.AdminApi/Errors/`): hər xəta `application/problem+json`. Controllerlər `CbarControllerBase`-dən törəyir və `BadRequestProblem`/`ConflictProblem`/`NotFoundProblem`/`ErrorProblem` qaytarır; mətn həm `detail`-də, həm `message` extension-ında (panel `message`-i oxuyur), auth endpoint-ləri `code`-u saxlayır. Sahə xətaları `errors` (camelCase açarlar) ilə gəlir (`FieldValidationProblem`).
  - **DB rədd etməsi** (`DbExceptionHandler` + `DbErrorMapping`): unique → 409 (slug toqquşması `field: "slug"` + mümkünsə `locale` ilə, "yenidən saxla"), FK → silmədə 409 "hələ istifadə olunur", yazmada 400 (naməlum locale ayrıca), uzunluq/diapazon/NOT NULL/CHECK → 400. DB-nin constraint/cədvəl adları cavaba düşmür. Qalan hər şey 500 (`detail: "An unexpected error occurred."`).
  - Body-siz 401/403/404 də problem details alır (`UseStatusCodePages`); `message`-siz 401/403/5xx-də `title` qəsdən boşdur — panel öz lokal mətnini göstərsin (keçid dövrü). Kestrel-in öz xətaları (body çox böyük) öz statusunu saxlayır. Müştəri bağlantını qırıbsa 499, log Debug.
  - Log sətrində `{TraceId}` var — cavabdakı `traceId` ilə tapılır.
- **Public API:** qlobal exception handler yoxdur (yalnız oxuyur, DB constraint xətası praktikada yaranmır).

---

## 3. Data modeli

Mənbə: `api-cbar-admin/db/migrations/0001-initial-schema.sql` (791 sətir) + 0002–0011.

### 3.1 Biznes sahələri üzrə cədvəllər

| Sahə | Cədvəllər | Qeyd |
|---|---|---|
| Dil | `locales` | az (default), en |
| İstifadəçi / auth | `users`, `roles`, `permissions`, `role_permissions`, `admin_refresh_tokens`, `admin_user_security_stamps`, `audit_log` | `refresh_tokens`, `user_sessions` — köhnə, istifadə olunmur; `permissions` + `role_permissions` — 2026-10-09-dan RBAC kataloqu və matrisi (§10.3, migration `0009`) |
| Media | `media_assets`, `media_asset_details` | SHA-256 checksum, MinIO açarı; `media_asset_details` (PK = media id, 1:1) — ölçünün yoxlandığı an (spec 054, §8.1) |
| Səhifələr | `pages` (+`_translations`), `page_assets` (+`_translations`), `page_details`, `page_nav_details`, `page_translation_details` | ltree `path`, iyerarxiya; `page_details` (PK = səhifənin id-si, 1:1) — `show_in_side_nav` (spec 041, §5.1), sətri olmayan səhifə default sayılır; `page_nav_details` — `show_in_dropdown_nav` (nullable, spec 054), `page_translation_details` — dil üzrə `menu_group` (≤ 120, spec 054) |
| İşçi məqalələri | `working_papers` (+`working_paper_translations`) | spec 054, §5.1i; migration `0038`. `number` 1–99 və `year` 1990–2100 `CHECK`; `(number, year)` və `legacy_page_id` silinməmişlər arasında unikal (partial index); soft delete (`deleted_at`, hər iki `CbarDbContext`-də query filter); dil üzrə başlıq, müəlliflər, xülasə, açar sözlər, `media_id` |
| Maliyyə təşkilatları | `ifi_organizations` (+tr), `ifi_memberships` (+tr) | spec 044, §5.1a; migration `0025` (cədvəllər, icazələr), `0026` (seed) |
| Memorandumlar | `memorandums` (+tr) | spec 045, §5.1b; migration `0027` (cədvəllər, icazələr), `0028` (seed) |
| Beynəlxalq təşkilatlarda üzvlük | — (səhifə 554-ün `page_translations.content`-i) | spec 046, §5.1c; yeni cədvəl yoxdur, migration `0029` yalnız seed |
| Maliyyə savadlılığı | — (səhifə 106, 110–112-nin `page_translations.content`-i, `page_details`) | spec 047, §5.1d; yeni cədvəl yoxdur, migration `0030` yalnız seed |
| İstehlakçıların və investorların hüquqları | — (səhifə 86, 87, 95, 96, 101-in `pages`/`page_translations` sətirləri, `page_details`) | spec 050, §5.1e; yeni cədvəl yoxdur, migration `0031` yalnız seed (86-nın `parent_id`/`path`/`sort_order`-u daxil) |
| Aylıq hesabatlar | `monthly_report_series` (+tr), `monthly_reports`, `monthly_report_translations` (dil üzrə fayl) | spec 052, §5.1g; migration `0034` (cədvəllər, icazələr, 3 seriya), `0035` (köçürmə). `(series_id, year, month)` silinməmişlər arasında unikal (partial index); soft delete (`deleted_at`, hər iki `CbarDbContext`-də query filter) |
| FinCERT | `fincert_settings` (tək sətir, `CHECK (id = 1)`) + `fincert_setting_translations`, `fincert_directions` (+tr), `fincert_memberships` (+tr) | spec 053, §5.1h; migration `0036` (cədvəllər, icazələr), `0037` (seed). RFC-2350 dil üzrə `rfc_media_id` **və/və ya** `rfc_url`; istiqamət/üzvlük soft delete (`deleted_at`, hər iki `CbarDbContext`-də query filter); tək qeydin statusu yoxdur |
| Sual-cavab | `faq_topics` (+tr), `faq_topic_pages`, `faq_questions` (+tr), `faq_videos` (+tr) | spec 051, §5.1f; migration `0032` (cədvəllər, icazələr), `0033` (seed). Mövzu `slug` unikal, yaradılanda sabitlənir; sual/mövzu/video soft delete (`deleted_at`, hər iki `CbarDbContext`-də query filter) |
| Press-relizlər | `press_releases` (+tr), assets, `press_release_questions` (+tr), `press_release_votes` | sorğu/səsvermə cədvəlləri **heç bir API-də istifadə olunmur** |
| Valyuta | `currencies` (+tr), `currency_rates` | kod `char(3)` PK |
| Göstəricilər | `azir_index_values` (+`azir_index_value_details`), `monthly_inflation_parameters`, `inflation_settings`, `info_lines` (+tr), `yc_yields`, `yc_parameters`, `yc_periods` | gəlirlilik əyrisi — 3 müstəqil, tarixə bağlı cədvəl (§4.4). `yield_curves`, `yield_curve_parameters`, `yield_curve_yields` (0001) qalır, kod oxumur — sonrakı miqrasiyada silinəcək |
| Qanunvericilik | `law_categories` (+tr), `laws` (+tr), assets | |
| MEAS | `meas_emitents` (+tr), `meas_info_types` (+tr), `meas_documents` | sənəd tərcümə olunmur |
| Təşkilat | `organization_divisions` (+tr), `organization_offices` (+tr), `organization_staff` (+tr), `org_chart_nodes` (+`org_chart_node_translations`), `org_chart_node_details` | struktur sxemi §5.6a: `org_chart_nodes` — migration `0015` (spec 027; `x/y/w/h`, `connector` spec 060-dan oxunmur), `org_chart_node_details` (PK = node id, 1:1, `departments_open`) — `0045` (spec 060) |
| Pul nişanları | `money_mark_categories` (+tr), `money_marks` (+tr), `money_mark_news` (+tr) | |
| Multimedia | `galleries` (+tr), `gallery_images`, `videos` (+tr), `video_streams` (+tr) | |
| Ana səhifə | `banners` (+tr), `news_slider` (+tr), `running_lines` (+tr), `homepage_links` (+tr), `homepage_publications` (+tr), `homepage_strategy_docs` (+`homepage_strategy_doc_translations`; status, `page_id`, `sort_order`, soft delete — spec 057, §6) | |
| Şəkilli popup | `image_popups` (+tr: hər dil üçün `media_id`, `link`, `alt_text`) | sayt boyu elan şəkli (§6); soft delete yoxdur |
| Parametrlər | `settings` (`key` PK, `value` jsonb) | |

### 3.2 Vacib constraint-lər

- `currency_rates`: `rate numeric(12,4) CHECK (rate > 0)`, unique `(rate_date, currency_code)` — bir gün üçün bir valyutanın bir məzənnəsi.
- `azir_index_values`: unique `(value_date, term)`, `rate numeric(8,4)`. `azir_index_value_details` (PK = dəyərin id-si, 1:1): `deal_volume numeric(12,2)`, `deal_count`, `min_rate`/`max_rate numeric(8,4)` — hamısı `NULL` və ya ≥ 0, `min ≤ max`; `is_reserve_plan` default `false`.
- `monthly_inflation_parameters`: `month CHECK 1..12`, unique `(year, month, parameter_code)`.
- `inflation_settings`: **tək sətir** (`CHECK id = 1`).
- Gəlirlilik əyrisi: `yc_yields` unique `(curve_date, period)`, `period integer CHECK 1..32767` (gün), `yield numeric(8,4)`; `yc_parameters.curve_date` və `yc_periods.curve_date` unique — tarixə bir parametr dəsti, bir müddətlər sətri. Cədvəllər arasında FK yoxdur: tarixin istənilən alt çoxluğu ola bilər.
- `users.username`, `users.email` — `citext` (böyük/kiçik hərf fərqi yoxdur), unique.
- Xarici açarlar əsasən `ON DELETE RESTRICT` — istifadə olunan kateqoriya/media/emitent silinə bilməz.
- `media_assets.storage_key` unique, amma **`checksum_sha256`-da unique indeks yoxdur** (§12).
- Bütün `updated_at` sütunlu cədvəllərdə trigger avtomatik yeniləyir.

### 3.3 Miqrasiyalar

| Fayl | Nə edir |
|---|---|
| `0001-initial-schema.sql` | bütün sxem, `ltree`/`citext` extension-ları, enum, trigger-lər; `cbar_web_ro` rolu **mövcuddursa** ona SELECT verir (yaratmır) |
| `0002-currency-homepage-flag.sql` | `currencies.show_on_homepage` |
| `0003-banner-translation-description.sql` | `banner_translations.description` — **admin API bunu oxumur/yazmır** |
| `0004-admin-refresh-tokens.sql` | `admin_refresh_tokens` (rotasiya ailələri ilə); users-ə FK yalnız `REFERENCES` icazəsi varsa |
| `0005-inflation-settings.sql` | `inflation_settings` tək sətirlik cədvəl |
| `0006-image-popups.sql` | `image_popups` + `image_popup_translations` (unique `(popup_id, locale)`), indeks `(is_active, activated_at DESC)`; `cbar_web_ro` mövcuddursa ona SELECT verir |
| `0007-admin-user-security-stamps.sql` | `admin_user_security_stamps (user_id PK, stamp uuid, changed_at)` — access token ləğvi üçün (§10.2). `users`-ə sütun yox, ayrıca cədvəl: paylaşılan mühitlərdə `users`-in sahibi başqa roldur, `ALTER TABLE` alınmır. Sətirlər tənbəl yaranır (backfill yoxdur); FK yalnız `REFERENCES` icazəsi varsa |
| `0008-azir-index-value-details.sql` | `azir_index_value_details` (§4.2) — eyni səbəbdən ayrıca cədvəl; detalı olmayan dəyər `null`-lar + "ehtiyat plan deyil" kimi oxunur. FK (`ON DELETE CASCADE`) yalnız icazə varsa — yoxdursa `AzirController` detalı özü silir; `cbar_web_ro`-ya SELECT |
| `0009-rbac-permissions.sql` | sxem dəyişmir — `0001`-in boş qalan `permissions`/`role_permissions` cədvəllərinə 98 icazə kodu + `moderator` (87) və `meas_manager` (7) qrantları (§10.3). `admin` üçün sətir yoxdur — admin hər kodu kodda alır. Rollar `code` ilə tapılır. `INSERT` icazəsi yoxdursa `RAISE WARNING` ilə **ötürülür** (deploy bloklanmır) — onda yalnız admin işləyə bilər. ⚠️ Boş bazada seed-dən **əvvəl** işləyir: `roles` hələ boşdur, `role_permissions` boş qalır (§12) |
| `0010-currency-bulletin-master.sql` | sxem dəyişmir — `currencies` + `currency_translations`-a bülletenin 30 kodu (§4.1), `ON CONFLICT DO NOTHING`. Boş bazada seed-dən əvvəl işlədiyi üçün tərcümələr `locales` ilə `JOIN` olunur; həmin adlar `seed.sql`-da da var |
| `0011-yield-curve-datasets.sql` | `yc_yields`, `yc_parameters`, `yc_periods` (§4.4); köhnə `yield_curve_yields`-dən yalnız `period`-u tam gün sayı olan nöqtələri (`'3M'` kimiləri yox) və bütün parametrləri köçürür; `cbar_web_ro`-ya SELECT. Köhnə 3 cədvəli silmir — `api-cbar` yeni cədvəllərdən oxuyana qədər (deploy sırası) |
| `0024-page-details.sql` | `page_details (page_id PK, show_in_side_nav boolean NOT NULL DEFAULT true)` — "Sol menyuda göstər" (§5.1). `pages`-ə sütun yox, ayrıca cədvəl (`0007`, `0008` ilə eyni səbəb); backfill yoxdur, admin API sətri yalnız bayraq söndürüləndə və ya sətir artıq varsa yazır. FK (`ON DELETE CASCADE`) yalnız `REFERENCES` icazəsi varsa — yoxdursa qalıq sətir zərərsizdir: səhifələr soft delete olunur, id təkrar istifadə olunmur; `cbar_web_ro`-ya SELECT |

| `0038-working-papers.sql` | `working_papers` + `working_paper_translations` (§5.1i), partial unique indekslər, `updated_at` trigger-i, FK-lar yalnız `REFERENCES` icazəsi varsa; `working_papers.read|create|update|delete` icazələri (moderator roluna), `INSERT` icazəsi yoxdursa `RAISE WARNING` ilə ötürülür; `cbar_web_ro`-ya SELECT |
| `0039-page-nav-details.sql` | `page_nav_details (page_id PK, show_in_dropdown_nav boolean NULL)` və `page_translation_details (page_id, locale, menu_group varchar(120))` — `0024` kimi ayrıca cədvəllər (`pages`/`page_translations`-a `ALTER` yox); `cbar_web_ro`-ya SELECT |
| `0040-media-asset-details.sql` | `media_asset_details` — media sətrinin ölçüsünün yoxlandığını qeyd edir (§8.1 `MediaSizeBackfillService`); `cbar_web_ro`-ya SELECT |
| `0041-publications-tree-seed.sql` | sxem dəyişmir — "Nəşrlər və tədqiqatlar" ağacı (§5.1i): iki qrup səhifəsi, köçürmələr, menyu bayraqları, menyu qrupları, Figma başlıqları və girişləri (yalnız köhnə mətn dəyişməyibsə). Təkrar işə düşəndə heç nə dəyişmir, səhifə yoxdursa ötürür |
| `0042-financial-stability-nav-seed.sql` | sxem dəyişmir — header Figma ilə (spec 056, §7.1): yeni köklər "Maliyyə sabitliyi" (3-cü; "Dayanıqlı Maliyyə" alt ağacı ilə və "Nəşrlər"dən iki hesabat onun altına köçür, ünvanlar eyni) və "Rəqəmsal maliyyə ekosistemi" (8 boş səhifə, en başlıqları qaralama), köklərin Figma sırası, 4 kök "menyularda yox". Hər hissə yalnız öz kökünü yaradan icrada işləyir — təkrar icra heç nə dəyişmir, redaktorun sonrakı sırası və bayraqları qalır; köhnə ağac yoxdursa ötürür |
| `0043-homepage-strategy-docs.sql` | `homepage_strategy_docs` + `homepage_strategy_doc_translations` (§6, spec 057): status `content_status` enum-u (yalnız `published`/`draft` qaydası API-dədir, bazada yox), tərcümə `(doc_id, locale)` unikal, başlıq `NOT NULL` (≤ 300); FK-lar yalnız `REFERENCES` icazəsi olanda, `updated_at` trigger-i, `cbar_web_ro`-ya SELECT; dörd `homepage_strategy_docs.*` icazəsi moderatora (INSERT icazəsi yoxdursa WARNING ilə ötürülür, `0009` kimi) |
| `0044-homepage-strategy-docs-seed.sql` | sxem dəyişmir — blokun əvvəlki üç sənədi (kodda yazılmışdı) `published`, sıra 1–3, səhifəyə az slug ilə bağlı (104, 66, 76); səhifə tapılmasa həmin sənəd ötürülür. Üz qabığı yazılmır (media id mühitə görə fərqlidir). Cədvəldə sətir varsa heç nə etmir |
| `0045-org-chart-node-details.sql` | `org_chart_node_details (node_id PK, departments_open boolean NOT NULL DEFAULT false)` — blokun/qrupun departamentləri "həmişə açıq" (§5.6a, spec 060). `org_chart_nodes`-ə sütun yox, ayrıca cədvəl (`0016` kimi); backfill yoxdur — sətri olmayan node "açılan siyahı"dır. FK (`ON DELETE CASCADE`) yalnız `REFERENCES` icazəsi varsa — yoxdursa `OrgChartController.Delete` sətri özü silir; `cbar_web_ro`-ya SELECT. `0015`-in koordinat sütunları geri qayıtmaq üçün qalır |

`0012`–`0023`, `0025`–`0037` bu cədvələ hələ yazılmayıb (sonrakı sync; spec 044–053 cədvəlləri §3.1-dədir). `api-cbar/db/migrations` boşdur (yalnız README) — public API heç bir cədvəlin sahibi deyil.

---

## 4. Maliyyə və statistika məlumatları

### 4.1 Rəsmi valyuta məzənnələri

**Master məlumat — `currencies`**
- 12 valyuta seed ilə gəlir (sort 1–12): USD, EUR, **RUB (nominal 100)**, GBP, TRY, CHF, **JPY (100)**, CNY, GEL, AED, SAR, **KZT (100)** — az/en adları ilə. Ana səhifə bayrağı: USD, EUR, RUB, TRY.
- Migration `0010-currency-bulletin-master.sql` (spec 025) rəsmi bülletenin qalan **30 kodunu** əlavə edir (sort 13–42, legacy siyahının sırası ilə): AUD, BYN, **KRW (100)**, CZK, DKK, HKD, INR, SEK, ILS, CAD, KWD, QAR, KGS, **HUF (100)**, MDL, NOK, **UZS (100)**, **PKR (100)**, PLN, RON, RSD, SGD, **SDR**, TMT, UAH, NZD və bank metalları **XAU, XAG, XPT, XPD** (sonda). Cəmi **42**. Hamısı aktiv, ana səhifədə yox; az adı bülletendən, en adı legacy `messages/en/other.php`-dən. `ON CONFLICT DO NOTHING` — mövcud kodlara (və redaktorun sırasına) toxunmur. SDR kodu ISO `XDR` yox, **`SDR`**-dir — legacy XML feed onu `Code="SDR"` ilə verirdi.
- Admin yalnız `showOnHomepage`, `sortOrder`, `isActive`-i dəyişə bilir (`PUT /currencies/{code}`). **Yeni valyuta yaratmaq, silmək, nominal və ad dəyişmək mümkün deyil** — yalnız DB-dən.

**Məzənnə cədvəli (sheet) — admin iş axını** (`web-cbar-admin-new/src/pages/currency-rates/`)
1. Ekran `?date` ilə cədvəl seçir; boşdursa ən son tarix.
2. "Yeni cədvəl" → bu günün tarixi ilə, yüklənmiş cədvəlin kopyası kimi qaralama.
3. Validasiya (frontend): tarix, ən azı bir sətir, hər məzənnə rəqəm və **> 0**.
4. Saxla → `PUT /currency-rates { date, rates[] }`.
   - Server: boş siyahı, dublikat kod, naməlum kod → 400.
   - Hər valyuta üçün **upsert** (tarix + kod). **Payload-da olmayan valyutalar silinmir.**
   - Audit entity id = tarix `yyyyMMdd`.
   - Server `rate > 0`-ı özü yoxlamır — DB CHECK pozuntusu `DbExceptionHandler` ilə **400** `value-rejected` olur (§2.10); frontend də yoxlayır.
   - Qeyri-aktiv valyuta qəbul olunur; kod böyük/kiçik hərfə həssasdır.
5. `DELETE /currency-rates?date=` — bütün günün cədvəlini silir (təsdiq ilə).
6. Yan siyahı: `GET /currency-rates/dates` — tarixlər və hər tarixdəki sətir sayı, 20-lik səhifələrlə.

**Bülleten importu — Excel (spec 025)** (`api-cbar-admin/.../CurrencyRatesController.cs:97-178`, `Validation/RateBulletinReader.cs`; panel: "Excel-dən yüklə" → `features/currency/components/rate-import-dialog.tsx`)
1. Redaktor tarix seçir (default — açıq cədvəlin tarixi) və Mərkəzi Bankın `.xlsx` bülletenini seçir → `POST /currency-rates/import` (multipart: `date`, `file`, `overwrite`). Legacy kimi **dərhal yazılır**, baxış addımı yoxdur.
2. Fayl: yalnız `.xlsx`, ilk baytlar `PK\3\4`, request ≤ 5 MB; zip-in hər hissəsi açılmış halda ≤ 20 MB (zip bomb), DTD qadağan. Fayl saxlanılmır.
3. Oxuma legacy `UploadCurrencyBehavior` ilə eynidir: **aktiv vərəqin `B7:G100`-ü**; `B` (trim + böyük hərf) düz 3 hərfdirsə sətir sayılır, `G` məzənnədir — PHP `round(…, 4)` kimi: əvvəl 15 əhəmiyyətli rəqəm, sonra 4 onluq, yarım sıfırdan uzağa (`RateBulletinReader.cs` `NormalizeRate` → `XlsxSheetReader.NormalizeNumber`; zip/XML oxuma 2026-10-21-dən gəlirlilik əyrisi importu ilə ortaq `XlsxSheetReader.cs`-dədir, davranış dəyişməyib). `XDR` → `SDR`. Nominal (`A`) və faylın öz tarixi (`C2`) oxunmur — tarix formadan gəlir.
4. Master-də olmayan kod ötürülür və cavabda `skipped` siyahısında qayıdır (panel toast-da göstərir). Tanınan kodun dəyəri boş / rəqəm deyil / `≤ 0` → 400 `invalid_rate` (+ `row`, `currency`); təkrar kod → `duplicate_code`; heç bir tanınan kod → `no_rates`. **Xəta varsa heç nə yazılmır** (bütün yoxlamalar yazıdan əvvəl, yazı tək tranzaksiyada).
5. Tarixdə artıq məzənnə varsa → **409 `sheet_exists`** (`count`); panel "üstünə yazılsın?" soruşur və `overwrite=true` ilə təkrarlayır. Yazı `PUT` ilə eyni **merge**-dir (`MergeRatesAsync`): fayldakı kodlar yaradılır/yenilənir, faylda olmayanlara toxunulmur.
6. Audit: `currency_rates.import`, `before` = həmin tarixin köhnə dəyərləri, `after` = fayl adı + yazılan dəyərlər.
7. Import-dan sonra dəyərlər adi cədvəl redaktorunda əl ilə düzəldilir (legacy "Edit" ekranı kimi).

⚠️ Mövcud tarixlə eyni tarixli yeni qaralama (əl ilə) **xəbərdarlıqsız köhnə cədvəlin üstünə yazılır / birləşir** — import-da isə 409 təsdiqi var.
⚠️ Panel "Excel-dən yüklə" düyməsini icazəyə görə gizlətmir (panelin icazə modelində `currency_rates.*` yoxdur; "Yeni cədvəl"/"Sil" də gizlədilmir) — server `currency_rates.prepare` olmadan 403 qaytarır.

**Public JSON — `GET /api/v1/currencies?date&locale`** (`api-cbar/.../CurrenciesController.cs:16-40`)
- `date` verilməyibsə → **`MAX(rate_date)`**. "≤ bu gün" məhdudiyyəti yoxdur: sabahın məzənnəsi əvvəlcədən yüklənibsə, default olaraq sabahınkı qaytarılır (CB-nin ertəsi günün məzənnəsini qabaqcadan elan etməsi ilə uyğun ola bilər, sənədləşdirilməyib).
- Cədvəl tamamilə boşdursa → 404 `{ message: "No rates published yet." }`.
- Verilmiş tarixdə məzənnə yoxdursa → **200 + boş `rates: []`**. Əvvəlki iş gününə keçid (fallback) **yoxdur** — həftəsonu/bayram boş gəlir.
- Sətir: `{ code, nominal, name, rate, showOnHomepage }`, `Currency.SortOrder` üzrə. `IsActive` filtrlənmir.

**Public XML feed — `GET /currencies/{DD.MM.YYYY}.xml`** — xarici sistemlərin illərlə istifadə etdiyi **kontrakt**
- Tarix `dd.MM.yyyy` sərt formatla; səhv → 400 `Expected date format: DD.MM.YYYY`.
- Məzənnə yoxdursa → çılpaq 404 (fallback yoxdur).
- Struktur:
  ```xml
  <?xml version="1.0" encoding="UTF-8"?>
  <ValCurs Date="dd.MM.yyyy" Name="AZN məzənnələri">
    <ValType Type="Bank metalları">          <!-- yalnız həmin tarixdə metal varsa -->
      <Valute Code="XPD">
        <Nominal>1 t.u.</Nominal>
        <Name>Palladium</Name>
        <Value>1950.8605</Value>
      </Valute>
      ...                                    <!-- XPD, XPT, XAG, XAU -->
    </ValType>
    <ValType Type="Xarici valyutalar">
      <Valute Code="USD">
        <Nominal>1</Nominal>
        <Name>1 ABŞ dolları</Name>
        <Value>1.7000</Value>
      </Valute>
      ...
  ```
- `Value` həmişə 4 onluq, nöqtə ilə (`0.0000`, Invariant). `Name` = `"{Nominal} {az adı}"` (az tərcüməsi yoxdursa `"1 "`). Həmişə az dili.
- **Bank metalları** (spec 025, `CurrenciesController.cs:16, 77-99`): legacy `xml.php` kimi metallar heç vaxt "Xarici valyutalar"-a düşmür; tarixdə varsa ayrıca blokda **birinci** gəlir, sabit sıra `XPD, XPT, XAG, XAU` (`sort_order`-dən asılı deyil), `Nominal` = `1 t.u.`, `Name` = prefikssiz az adı. Metalsız tarixdə blok yoxdur — o tarixlərin XML-i əvvəlki kimidir. SDR `Code="SDR"` ilə "Xarici valyutalar"-dadır.
- `TODO(compat)` (sətir 87-88): element sırası, atribut adları, rəqəm formatı arxivdəki prod cavabları ilə **yoxlanılmayıb.** Köhnə feed-dəki `Description` atributu burada yoxdur; valyuta sırası `sort_order`-dir, legacy siyahının sırası deyil.

**Public sayt**
- `/currencies?date=` — cədvəl (məzənnə `toFixed(4)`), boş olanda "cədvəl yoxdur" mesajı, XML feed-ə link (`{API_URL}/currencies/DD.MM.YYYY.xml` — brauzeri birbaşa API-yə göndərir).
- Ana səhifə valyuta kartı: son cədvəl + dəyişikliyi göstərmək üçün **əvvəlki cədvəl** — D-1…D-5 günləri paralel sorğulanır, ilk boş olmayan götürülür. `showOnHomepage` filtrini frontend özü tətbiq edir.

### 4.2 AZIR — banklararası faiz dərəcəsi

- Cədvəl: `azir_index_values (value_date, term, rate)`; term DB-də və API-də sərbəst mətndir (≤ 10 simvol), admin select-i və Excel importu `1D`, `30D`, `90D`, `180D` verir (spec 058-dən əvvəl select `1D/1W/1M` idi və saytın ana səhifəsindəki `30D/90D/180D` qutuları paneldən doldurula bilmirdi).
- **Əqd detalları** (spec 021, miqrasiya 0008) — ayrıca `azir_index_value_details`: əqd həcmi (mln AZN, 2 onluq), əqd sayı, son əməliyyat gününün min/max dərəcəsi, **ehtiyat plan işarəsi** (`is_reserve_plan` → saytda `*` + footnote). Köhnədə ayrı mətn sütunları və `LAST MIN/MAX RATE` sətirləri idi.
- **Admin API** (`api-cbar-admin/.../AzirController.cs`): siyahı (from/to/term filtrləri, 50-lik; detallar birlikdə) + `POST /azir { valueDate, term, rate, dealVolume?, dealCount?, minRate?, maxRate?, isReservePlan }` — eyni tarix+term varsa yenilənir. **Tam əvəzləmə:** göndərilməyən detal sahəsi `null`, işarə `false` olur. Yalnız detal dəyişsə də `updated_at` yenilənir.
  - Validasiya (`Validate`, L122; sahə üzrə 400 `errors`): term məcburi, ≤ 10 simvol; `rate` 0 ≤ x < 10000, ≤ 4 onluq (**0 qəbul olunur**); həcm 0 ≤ x < 10¹⁰, ≤ 2 onluq; say ≥ 0; min/max 0 ≤ x < 10000, ≤ 4 onluq, `min ≤ max`. DB CHECK-ləri eyni qaydaları təkrarlayır.
  - Silmə hard delete; detal sətri açıq şəkildə birlikdə silinir (FK hər mühitdə olmaya bilər).
  - **Excel importu** (spec 058, `POST /azir/import`, multipart `file` + `overwrite`, icazə `azir.create`): bankın gündəlik "AZIR Website" `.xlsx` faylı — bir fayl bir gündür. Oxuyucu saf funksiyadır (`Validation/AzirSheetReader.cs`, testlər bankın real faylı ilə):
    - tarix **B2**-dən (Excel seriya nömrəsi və ya `dd.MM.yyyy` mətni); Bakı günündən sonrakı tarix rədd (`date_in_future`, `Time/BakuClock.cs` sabit +04:00);
    - cədvəl B="Ad", C="Faiz" başlıq sətrindən sonra başlayır, sətirlər **ada görə** tanınır (sıra vacib deyil, boşluq/hərf fərq etmir): `AZIR` / `1D AZIR` → 1D, `TF AZIR 30D|90D|180D` → həmin term, `LAST MIN RATE` / `LAST MAX RATE` → 1D-nin min/max-ı; addakı `*` → ehtiyat plan; `*` ilə başlayan qeyd sətirləri və boş sətirlər atılır; başqa ad → `unknown_index` (sətir, sütun), təkrar ad → `duplicate_index`;
    - faiz faylda kəsrdir (`0.0000%` formatı) → **× 100**, 4 onluğa köhnə PHP qaydası ilə (`NormalizeNumber`): `0.063047774…` → `6.3048` (köhnə sayt eyni günü `6.3048%` göstərir); min/max da × 100, **0 → `null`** (əqd olmayıb);
    - 1D həcmi mln manatla yazılır, vahid təxmin edilmir: `0…10 000` olduğu kimi (2 onluq), `≥ 1 000 000` manat sayılıb `÷ 10⁶` (`volumeConverted`), arası → `ambiguous_volume`; həcm/say `-` → `null`, 0 qalır 0 (köhnə sayt `0.00 / 0` göstərir); say tam ədəd ≥ 0;
    - 1D sətri və onun faizi (> 0) məcburidir (`missing_1d`); 30D/90D/180D faizi boş/`-`/0 → term yazılmır (`skipped: empty`); 30D/90D/180D üçün həcm/say/min/max oxunmur;
    - **`AZIR TFAI` tanınır, amma yazılmır** (`skipped: tfai`) — saytın `/statistics` AZIR qrafiki (`azirSeries`) bütün term-ləri bir `%` oxunda çəkir (ana səhifə qrafiki `azirDailySeries` yalnız 1D-dir), 114-lük indeks onları düzləşdirərdi.
    - Yazma: fayldakı term-lərdən hər hansı biri həmin tarixdə varsa və `overwrite` yoxdursa **409 `date_exists`** (`valueDate`, `count`, `terms`); `overwrite`-da həmin term-lər `POST /azir` kimi **tam əvəzlənir**, faylda olmayan term-lərə toxunulmur (merge). Bütün yoxlamalar yazmadan əvvəl, yazma bir tranzaksiya; audit `azir.import` (entity id `yyyyMMdd`, əvvəlki snapshot-lar + fayl adı). Cavab hər term üçün yeni dəyərləri və əvəzlənən `previous`-u, `skipped` siyahısını, `volumeConverted`-i qaytarır. Yükləmə yoxlaması (`.xlsx`, `PK\3\4`, 5 MB) gəlirlilik əyrisi importu ilə eynidir (§4.4), fayl saxlanmır.
- **Admin UI** (`web-cbar-admin-new/src/features/azir/`): upsert kartı detal sahələri ilə (term seçimi `1D/30D/90D/180D`, `model/schemas.ts` `AZIR_TERMS`); redaktə forması yoxdur — siyahı sətrindəki **"Formaya yüklə"** əməli sətri karta doldurur (`model/prefill.ts`, dinləyici modeli), redaktor dəyişib eyni tarix+term ilə yenidən saxlayır. Server sahə xətaları form sahələrinə bağlanır. Başlıqdakı **"Excel-dən yüklə"** (`components/azir-import-dialog.tsx`, `model/import-state.ts`): fayl → (409) "Əvəz et" / "Ləğv et" təsdiqi → **xülasə** pəncərədə qalır (`azir-import-summary.tsx`: hər term-in dəyəri, əvəzlənəndə köhnə dəyər üstündən xətli, həcm manatdan çevrilibsə sarı xəbərdarlıq, yazılmayan sətirlər); xəta kodları redaktorun dilində, sətir/sütunla. Düymə hamıya görünür (panelin bölmə icazəsi yoxdur) — `azir.create` olmayana API 403 verir.
- **Public API** (`api-cbar/.../StatsController.cs`):
  - `GET /api/v1/azir?from&to&term` — daxil olmaqla, term dəqiq uyğunluq; hər sətirdə `dealVolume, dealCount, minRate, maxRate, isReservePlan`. Filtrsiz bütün tarixçə.
  - `GET /api/v1/azir/summary` — "AZIR indeksi ilə bağlı məlumatlar" bloku: yalnız `1D` və `rate > 0`, tarix filtrindən asılı deyil. Son tarix və faiz; **ay sonundan / il sonundan dəyişmə** (ay və il sonu bu günə yox, **son dəyərin tarixinə** görə — keçən ayın son günlərindəki dəyər özü ilə müqayisə olunmasın); son min/max dərəcə (son 1D dəyərin detalından); son həcm + ay sonundan dəyişmə; həcm min/max **keçən ilin 1 yanvarından bu günə** (köhnə saytdakı "son 1 il" qüsuru qəsdən saxlanılıb; "bu gün" konteynerin `TZ=Asia/Baku` vaxtıdır); həcmin USD ekvivalenti (son tarixdə və ya ondan əvvəl qüvvədə olan USD məzənnəsi / nominal, 2 onluq). Hesablanmayan göstərici `null`, digərləri yenə qaytarılır; dəyərlər 4 onluğa yuvarlaqlaşdırılır. **Son 1 il üzrə min/max faiz yoxdur.**
- **Public sayt:**
  - `/[locale]/statistics/azir` (`views/azir/`) — köhnə `/indeks/rates`-in əvəzi: 15.05.2025 metodologiya xəbərdarlığı; tarix filtri `dateFrom/dateTo` (`features/stats/model/azir-range.ts`) — default **bu gün − 60 gün … bu gün**, yalnız `dateFrom` → `dateTo` = bu gün, gələcək `dateTo` bu günə endirilir; səhv format / `from > to` / **10 ildən uzun** aralıq → default aralıq + xəbərdarlıq (yönləndirmə yoxdur). Qrafik (`DD.MM.YYYY` etiketlər) və cədvəl — **yalnız 1D, `rate > 0`**, tarix azalan, `*` işarəsi; footnote yalnız göstərilən sətirlərdən biri işarəlidirsə. Statistika bloku (11 göstərici) ayrıca yüklənir — biri düşsə digəri göstərilir.
  - `/[locale]/statistics/azir/export` — cari aralığın `.xlsx` faylı (`AZIR-1D_{from}_{to}.xlsx`), ekranla eyni sətir funksiyası. Sheet `1D AZIR`: Tarix, Faiz, Həcm, Say — `%`/`*` işarəsiz (köhnə `IndeksExportHelper` formatı); işarəli günlər varsa ikinci sheet-də siyahı + footnote. Səhv aralıq → 400 mətn, API xətası → 502. XLSX kitabxanasız, öz kodu ilə qurulur (`shared/lib/xlsx/`).
  - Köhnə `/indeks/rates[?language=&dateFrom=d/m/Y&dateTo=&export=true]` → **308** yeni ünvana (§7.2).
  - `/statistics` qrafiki (bütün tarixçə, tarix aralığı olmadan) və ana səhifədə "İcmal göstəricilər" → "Pul bazarı" tabı (son 60 gün, §6).
- TFAI (faizsiz indeks), `compounded_term.pdf`, metodologiya PDF düymələri yoxdur (axtarılıb: `TFAI`, `compounded`, `methodology` — `web-cbar-new/src`). TFAI Excel importunda bilərəkdən atılır (yuxarıda); əl ilə `TFAI` term-i API-də hələ də yazıla bilər və onda saytın qrafiklərinə düşər (§12 #57).

### 4.3 İnflyasiya

**Aylıq parametrlər** — `monthly_inflation_parameters (year, month, parameter_code, value)`
- Kodlar: `cpi_yoy` (illik), `cpi_mom` (aylıq), `target` və s. — sərbəst mətn (admin-də select: cpi_yoy/target).
- Admin: il filtri + upsert kartı (`POST /inflation`), il 4 rəqəm, ay 1–12.

**Parametrlər** — `inflation_settings` (tək sətir)
- `currentInflation` (numeric 6,2; -10000 < x < 10000), `targetInflation` (sərbəst mətn, max 255, məs. `"4 (±2)"`), `nextUpdateDate`.
- Admin: `GET/PUT /inflation/settings`; ilk saxlamaya qədər `null`.
- Public: `GET /api/v1/inflation/settings` — sətir yoxdursa 404.

**Public sayt**
- Ana səhifə inflyasiya kartı (birinci ekran, `web-cbar-new/src/widgets/home-cards/inflation-card.tsx`): iki qutu — **illik inflyasiya** (tarixlə) və **hədəf** (`4 (±2) %` kimi sərbəst mətn). Mənbə `inflation settings`-dir; o hələ saxlanmayıbsa (404) aylıq seriyanın son `cpi_yoy` və `target` dəyərinə düşür (`views/home/loader.ts:228-255`). Başlıq `/statistics`-ə keçiddir.
- Spec 022 ilə ana səhifədən illər üzrə qrafik və il seçimi (Switch) çıxıb; seriya yalnız `/statistics`-dədir, ana səhifədə yalnız ehtiyat mənbə kimi yüklənir.
- ⚠️ "İllik inflyasiya"nın ayı `settings.nextUpdateDate`-dən götürülür (`web-cbar-new/src/views/home/loader.ts:236-241`) — admin bu sahəni "Növbəti yenilənmə tarixi" adlandırır. Yəqin ki, səhvdir. Növbəti yenilənmə tarixinin özü ana səhifədə göstərilmir.
- ⚠️ Kartın xəta vəziyyəti yalnız aylıq seriya sorğusundan asılıdır (`views/home/index.tsx:115-116`): seriya düşsə settings gəlsə belə kart xəta göstərir; settings düşsə (404-dən başqa) səssizcə seriyaya keçir.
- `/statistics`: cari ilin inflyasiyası — yanvarın əvvəlində cari ilə məlumat olmadığı üçün "məlumat yoxdur".

### 4.4 Gəlirlilik əyrisi (Yield curve, Nelson–Siegel)

Köhnə admin kimi (2026-10-21-dən) **3 müstəqil, tarixə bağlı data dəsti** — hər biri öz Excel faylı ilə yüklənir və tarixə görə ayrıca silinir. Bir tarixin istənilən alt çoxluğu ola bilər (məs. nöqtələr var, parametrlər hələ yüklənməyib).

| Data dəsti | Cədvəl | Excel (aktiv vərəq, 1-ci sətir başlıqdır) | Yoxlamalar |
|---|---|---|---|
| Əyri nöqtələri | `yc_yields (curve_date, period gün, yield numeric 8,4)` | 2-ci sətirdən: **B** = müddət (gün), **C** = gəlirlilik; B və C boş sətir atılır | B tam ədəd 1–32767, C rəqəm (|x| < 10000); müddət təkrarı → `duplicate_period`; ən çox 5000 nöqtə → `too_many_rows`; heç nöqtə yoxdursa `no_rows` |
| Nelson–Siegel parametrləri | `yc_parameters (beta0, beta1, beta2, lambda — numeric 12,6)` | yalnız 2-ci sətir: **A–D** = β₀, β₁, β₂, λ | dördü də rəqəm (|x| < 10⁶), 6 onluğa yuvarlaqlaşdırılır |
| 7 standart müddət | `yc_periods (three_month … four_year, numeric 8,4)` | **C2:C8** = 3 ay, 6 ay, 9 ay, 1 il, 2 il, 3 il, 4 il; B-dəki adlar yoxlanmır | yeddisi də rəqəm; C9 və aşağıda data → `too_many_rows` (səhvən əyri faylı yüklənməsin) |

- **Ümumi import qaydaları** (`api-cbar-admin/src/Cbar.AdminApi/Controllers/YieldCurvesController.cs`): tarix formadan gəlir (`yyyy-MM-dd`), fayldakı A sütununun tarixi **oxunmur** (köhnə kimi). Yalnız `.xlsx` (`PK\3\4` imzası), ən çox 5 MB, fayl saxlanmır. Rəqəmlər köhnə PHP `round()` kimi yuvarlaqlaşdırılır (`Validation/XlsxSheetReader.cs` `NormalizeNumber`: əvvəl 15 əhəmiyyətli rəqəm, sonra half-away-from-zero), mətn xanası rəqəm sayılmır. Tarixdə həmin data artıq varsa 409 `date_exists` — `overwrite=true` ilə **tam əvəzlənir**. Bütün yoxlamalar yazmadan əvvəldir və yazma bir tranzaksiyadır: köhnədən fərqli olaraq səhv fayl tarixin datasını yarımçıq silmir. Hər import/silmə `audit_log`-a düşür (`yield_curves.import_*`/`delete_*`, entity id = `yyyyMMdd`).
- Xlsx oxuyucu (`Validation/XlsxSheetReader.cs`) məzənnə bülleteni ilə ortaqdır (§4.1): BCL zip + XML, DTD qadağandır, hər hissə açılmış halda ≤ 20 MB (zip bomb).
- **Admin** (`web-cbar-admin-new/src/pages/yield-curves/index.tsx`): 3 tablı bölmə — Əyri (`/yield-curves`), Parametrlər, Müddətlər. Hər biri tarixə görə siyahı (yeni → köhnə) + "Excel-dən yüklə" dialoqu (409-da "Üstünə yaz" təsdiqi) + tarixə görə silmə; əyri tabında tarixin nöqtələri yan paneldə. Əl ilə yaratma/redaktə **yoxdur** (köhnədə də yox idi; əvvəlki əl ilə forma silinib). İcazələr: `yield_curves.read` / `.create` (import) / `.delete`.
- Əyrinin özü hesablanmır; sadəcə saxlanılan nöqtələr göstərilir.
- **Public API** (`api-cbar/src/Cbar.WebApi/Controllers/StatsController.cs`): `GET /yield-curves/latest` (nöqtələri olan ən son tarix), `GET /yield-curves/{date}` (nöqtə yoxdursa 404) → `{ curveDate, parameters | null, yields[], periods | null }`. `yields` müddətə görə sıralı, `period` kontrakt üçün **string** qalır (`"90"`). Parametrlər və müddətlər həmin tarix üçün yüklənməyibsə `null`.
- **Public sayt:** `/statistics` (`web-cbar-new/src/views/statistics/loader.ts:39`, β₀…λ 4 onluqla) və ana səhifənin "İcmal göstəricilər" → "Gəlirlilik əyrisi" tabı (`widgets/home-cards/statistics-panels.tsx`, `views/home/loader.ts:385-391`) — yalnız nöqtələr xətt qrafiki kimi (x = gün sayı, vahidsiz); cavab 404 və ya nöqtəsizdirsə tab gizlənir, sorğu xətasında tab xəta göstərir. ⚠️ `periods` (7 müddət, köhnədə "Yields %" cədvəli) API-də var, saytda **hələ göstərilmir**.

### 4.5 İnformativ bloklar (info lines) — pul siyasəti və makro göstəricilər

- `info_lines (alias, year, sort_order, is_active)` + tərcümə `(title, value)`.
- **Alias sabit siyahıdır (admin-də 13 dəyər)** — məs. faiz dəhlizinin min/max/uçot dərəcəsi, ehtiyatlar, pul bazası, bank sektoru göstəriciləri. Alias qrupu ana səhifədə bir kartı təşkil edir.
- Admin: siyahı (alias üzrə axtarış, 50-lik), alias + ən azı bir tərcümə tələb olunur. ⚠️ Serverdə sətirlər səhifələnib sonra qruplaşdırılır — bir alias iki səhifəyə bölünə bilər.
- Public: ana səhifə payload-ında `infoLines: [{ alias, items: [{ title, value, year, updatedAt }] }]` — alias əlifba sırası, sonra sort (`api-cbar/.../HomepageController.cs:76-96`). `updatedAt` — sətrin **son saxlanma anı** (qərarın tarixi deyil).
- Public sayt (`web-cbar-new/src/features/homepage/model/schemas.ts:72-99`): hər alias-dan **yalnız birinci sətir** (`items[0]`, `year` nəzərə alınmır); başlığı və ya dəyəri boşdursa atlanır.
  - Faiz dəhlizi kartı (birinci ekran): `corridor_min`, `corridor_max`, `corridor_percent` (sonuncu vurğulanır); kartın tarixi üç sətrin ən son `updatedAt`-idir (`views/home/loader.ts:215`) — ⚠️ istənilən redaktə (hətta yazı düzəlişi) "tarixi" dəyişir.
  - "İcmal göstəricilər" tabları: **Monetar** — `money_reserve_usd`, `money_base` (tarixsiz); **Mərkəzi Bankın notları** — `nots_volume` + `nots_levels_28/84/168/252` rəqəmləri (qrafik yoxdur); **Maliyyə sektoru** — `bank_credit`, `bank_nation`.
  - Admin-dəki `homepage_indicators` alias-ı saytda istifadə olunmur (axtarılıb). Bütün "Daha ətraflı" keçidləri `/statistics`-ə aparır — alias üzrə ayrıca səhifə yoxdur.

---

## 5. Kontent modulları

### 5.1 Səhifə ağacı (CMS səhifələri)

Saytın "statik" hissəsi (Haqqımızda, Pul siyasəti, Maliyyə sabitliyi və s.) iyerarxik səhifələrdir.

**Model**
- `pages.parent_id` + ltree `path` (valideyn yolu + öz id). Səhifənin `published_at`-ı **yoxdur** — embargo yoxdur.
- Tərcümə: `title` (500), `slug`, `content` (HTML).
- `nav_url`: menyu linkini başqa ünvana yönəldir (http ilə başlayırsa xarici link).
- Fayllar: `page_assets` — media, sıra, `group_label` (fayllar qruplaşdırılır, məs. "2024-cü il hesabatları"), hər dil üçün başlıq.
- **Menyu yeri** (spec 041, 048, 054): iki bayraq, iki dil üçün bir dəyər:
  - `page_details.show_in_side_nav` (default açıq) — bölmənin sol menyusu;
  - `page_nav_details.show_in_dropdown_nav` (nullable; `NULL` = `show_in_side_nav`-ı izlə) — açılan menyular (nav çubuğunun mega-menyusu, hamburger
    paneli, mobil menyu). Sayt qaydası `isInDropdownNav = showInDropdownNav ?? showInSideNav !== false`; alt ağacı ilə birlikdə çıxır, açıq-səhifə
    istisnası yoxdur. "Ödəniş xidmətləri" `false` + `true`-dur: yalnız açılan menyularda.

  Paneldə üç seçimdir (bütün menyularda / yalnız açılan menyularda / menyularda yox). Kök bölmədə "menyularda yox" yalnız ≥ 1360 hamburger panelindən
  çıxarır (spec 056, §7.1); nav çubuğu, dar panel, mobil menyu dəyişmir, "yalnız açılan" kök üçün yoxdur. Footer, breadcrumb və slug ilə açılış
  dəyişmir. `visible`-dan fərqi: `visible` səhifəni bütün naviqasiyadan çıxarır və uşaqlarını kökə qaldırır (aşağıda ⚠️), bu bayraqlar isə ağacı dəyişmir.
- **Menyu qrupu** (spec 054): `page_translation_details.menu_group`, dil üzrə, ≤ 120. Bacı səhifələri açılan menyuda qruplaşdırmaq üçündür;
  ⚠️ sayt onu hələ **göstərmir** (spec 055).

**Admin qaydaları** (`api-cbar-admin/.../PagesController.cs`, `web-cbar-admin-new/src/pages/pages/`)
- **Yaratma:** ən azı bir tərcümə, valideyn mövcud olmalıdır. Bayraqlar default-larla.
- **Bayraqlar (`flags`):** göndərilsə buraxılan hər sahə default-a qayıdır, göndərilməsə hamısı dəyişmir. İstisna `showInSideNav` və `showInDropdownNav`: nullable-dır, buraxılsa və ya `null` gəlsə saxlanmış dəyər qalır (yaratmada `true` / izlə) — bayrağı bilməyən köhnə panel onu sıfırlamasın deyə (`PagesController.cs` `PageFlagsDto`, `ApplySettings`). `page_nav_details` sətri yalnız dəyər izlədiyi sol menyu bayrağından fərqlidirsə və ya sətir artıq varsa yazılır; ona görə "izlə" vəziyyətinə API ilə qayıtmaq olmur (dəyər bərabər qalır, təsiri eynidir).
- **Menyu qrupu (`translations.<dil>.menuGroup`):** buraxılsa və ya `null` gəlsə saxlanılır, `""` silir, trim olunur; 120-dən uzun → 400 (DB uzunluğu, `DbExceptionHandler`, sahə açarı yoxdur). Tərcüməsi silinən dilin etiketi də silinir. Panel etiketi yalnız redaktor dəyişəndə göndərir.
- **Slug:** yeni tərcümədə redaktor yazdığı və ya başlıqdan yaranan slug; toqquşmada `-2`, `-3`. **Başlıq dəyişəndə slug dəyişmir** — yalnız redaktor açıq şəkildə yeni slug göndərərsə. (Digər modullarda əksinədir — §5.2.)
- **Redaktə:** valideyn dəyişmək PUT ilə olmaz (400 "Moving pages is not supported yet") — ayrıca move əməliyyatı var.
- **Köçürmə** — `POST /pages/{id}/move`:
  - valideyn dəyişmək üçün `movable_l` və ya `movable_r`, eyni valideyn daxilində sıra dəyişmək üçün `movable_u` və ya `movable_d` lazımdır, əks halda 409;
  - səhifəni öz altına və ya öz nəslinin altına köçürmək → 400;
  - nəsillərin `path`-ı ltree SQL ilə yenidən yazılır.
- **Admin UI-da:** ağac (dil tabı ilə), drag & drop **yalnız eyni valideyn daxilində**; köçürmə dialoqu (ağac seçicisi, özünü və nəslini istisna edir, boş = kökə); sıra dəyişmə hər qardaş üçün ayrı `move` sorğusu kimi göndərilir (**atomik deyil**).
- **Silmə:**
  - `removable = false` → 409;
  - uşaqları varsa və `removable_all = false` → 409;
  - `removable_all = true` → əlavə olaraq **`pages.delete_subtree` icazəsi** (yalnız admin, §10.3) — yoxdursa rədd, heç nə dəyişmir (`PagesController.cs:227-228`); sonra **bütün alt ağac** bir tranzaksiyada soft delete (`path <@`), nəsillərin öz bayraqlarına baxılmadan; audit kök üçün bir qeyddir, silinən bütün id-lər onun içində (`:236-247`).
  - UI silmədən əvvəl nəsil sayını göstərir.
- **Kilid:** `readonly`/`disabled` UI-da başlıq, slug, məzmun, navUrl-i bağlayır — amma status, sort və bayraqlar redaktə oluna bilir (kilidi açıb saxlamaq mümkündür).
- **"Saytın menyusunda" kartı** (`menu-visibility.ts`, `menu-visibility-card.tsx`). Spec 054-dən: kartın başında "Menyudakı yeri" radio qrupu
  (`MENU_LOCATIONS`; hər seçim `showInSideNav` + `showInDropdownNav` cütü, panel ikisini də göndərir). Bölmə kökündə (`parentId` yoxdur) "Yalnız açılan
  menyularda" deaktivdir. Saxlanmış `true` + `false` ("yalnız sol menyuda", heç bir seçim vermir) gəlsə heç bir radio seçilmir, kart xəbərdarlıq
  göstərir, dəyər dəyişmədən göndərilir. Köhnə "Sol menyuda göstər" checkbox-u bayraqlar kartından çıxıb. Üst menyu sətrinin menyu səbəbləri
  `dropdownNavOff` / `parentDropdownNavOff`-dur (`isInDropdownNav` ilə). Hər dil üçün iki sətir — **üst menyu** və **sol menyu**. Üst menyu səbəbləri sıra ilə: status, qeyri-aktiv, gizli, dil söndürülüb, başlıq yoxdur, çox dərin (> 3 səviyyə); valideyn görünmürsə "kökə qalxacaq" qeydi. Sol menyu (spec 041): üst menyunun öz səbəbləri (dərinlik limiti istisna), səhifə kökdürsə "bölmənin kökü", öz bayrağı söndürülübsə "sol menyuda göstərilmir", bölmə kökü ilə səhifə arasındakı əcdadda söndürülübsə "valideyn sol menyuda gizlidir"; son ikisində "özü açıq olanda görünür" qeydi. ⚠️ "Haqqımızda"/"Media" şablonunun iki səviyyə limiti kartda modelləşdirilmir. Bu məntiq api-cbar `GetTree`, web-cbar-new `shell/constants.ts` `MAX_DEPTH` və `entities/page-node` `isInSideNav` ilə **əl ilə sinxron saxlanılmalıdır.** Ağacda sol menyuda gizli səhifənin "Sol menyuda gizli" nişanı var.
- **Fayllar:** fayl seç → az/en başlıq (default orijinal ad) + qrup; yuxarı/aşağı sıralama (`PUT /pages/{id}/assets/order` — tam siyahı); silmə hard delete (media özü qalır).

**Public qaydalar** (`api-cbar/.../PagesController.cs`)
- **Ağac (menyu)** — `GET /pages/tree?locale`: `published && active && visible && show_{locale}` + soft delete; həmin dildə başlığı və ya slug-ı olmayan səhifə atılır. Nəticə: `{ id, title, slug, navUrl, showInSideNav, showInDropdownNav, menuGroup, children[] }`. `showInSideNav` süzgəc deyil, məlumatdır: söndürülən səhifə ağacda öz yerində qalır (`page_details` sətri yoxdursa `true`). `showInDropdownNav` sətir yoxdursa `null`, `menuGroup` həmin dilin etiketi və ya `null` (spec 054).
  - ⚠️ Valideyni filtrdən keçməyən səhifə **köklə birləşir** (kod şərhi "alt ağacla birlikdə atılır" deyir, kod əksini edir). Bölməni gizlətmək onun görünən uşaqlarını yuxarı menyuya çıxarır.
- **Detal** — `GET /pages/{slug}?locale`: `published && active && show_{locale}`. **`visible` yoxlanılmır** (menyudan gizli səhifə slug ilə açılır). Valideynin statusu yoxlanılmır. Cavab: `{ id, title, slug, content, assets[] }`. Breadcrumb, valideyn, **digər dildəki slug** qaytarılmır.

**Public sayt** — `/[locale]/[...slug]` (`web-cbar-new/src/views/cms-page/`)
- Məzmun route-ları `src/app/[locale]/(content)/` route group-undadır — URL dəyişmir, səhifə 1320-lik konteynerə düşür; ana səhifə qrupdan kənardadır.
- URL-in **yalnız son seqmenti** slug kimi istifadə olunur; `/az/istənilən/şey/foo` = `foo` səhifəsi (dublikat URL-lər, canonical yoxdur) (`cms-page/loader.ts:37-41`).
- Ağac ayrıca oxunur; səhifənin zənciri **slug ilə** tapılır (DFS, ilk uyğunluq — `entities/page-node/lib/tree.ts:9-16`). Ağac alınmasa səhifə menyusuz və "Haqqımızda" şablonu olmadan açılır.
- Səhifə məzmunu boşdursa və uşaqları varsa — uşaq kartları göstərilir (bölmə səhifəsi), "Haqqımızda" səhifələrində də.
- **İki şablon — seçim ağacdakı yerə görədir** (`loader.ts:66-80`):
  - Kök bölmə **"Haqqımızda" kökü**dürsə → "Haqqımızda" şablonu (`widgets/about-shell/`). Kök **başlığı ilə** tanınır: `Haqqımızda` / `About us` / `About Us` (`tree.ts:65-69`). ⚠️ CMS-də kökün adı dəyişsə bütün bölmə səssizcə köhnə şablona qayıdır.
  - Qalan bölmələr → köhnə görünüş: solda bölmə ağacı (`SectionSidebar`, aktiv zəncir açıq), mavi başlıq zolağı, məzmun, fayllar.
  - **Hər iki sol menyuda** `showInSideNav = false` bənd alt ağacı ilə birlikdə göstərilmir, **istisna:** cari səhifə həmin bəndin özü və ya alt ağacındadır — onda bənd və zəncir adi qaydada görünür (`entities/page-node/lib/tree.ts` `isInSideNav`, `widgets/section-shell/model.ts`, `widgets/section-sidebar/section-sidebar.tsx`). Bölmə kökündəki bayrağın təsiri yoxdur: kök menyunun başlığıdır, bəndi deyil.
- **"Haqqımızda" şablonu** (spec 024):
  - **Breadcrumb:** "Ana səhifə" → kökdən cari səhifəyə qədər zəncir; ağacda tapılmasa "Ana səhifə › Haqqımızda › səhifə".
  - **Sol menyu:** kökün uşaqları, **iki səviyyə** (3-cü səviyyə menyuda görünmür); yalnız cari səhifəyə aparan qrup açıq; xarici `navUrl` yeni tabda.
  - **Paylaşma/çap:** §7.4.
  - **Layout səhifə slug-ı ilə seçilir** — kodda sabit reyestr (`features/about-content/model/layouts.ts`):

    | Slug (az / en, `-copy` variantları ilə) | Layout |
    |---|---|
    | `haqqimizda`, `about-us` | əsas səhifə |
    | `tarixi` (`tarix-copy`), `history` | tarix |
    | `missiya-ve-deyerler`, `mission-and-values` | missiya |
    | qalan hər slug | `plain` — adi CMS məzmunu, şablon (breadcrumb, menyu, paylaşma) yenə tətbiq olunur |

    ⚠️ Slug admin-də dəyişdirilsə səhifə səssizcə `plain`-ə düşür.
  - **Bloklar adi redaktor markup-ından qurulur** — ayrıca forma/sahə yoxdur. Kontrakt: `specs/024-about-us-redesign/contracts/cms-markup.md` (repo kökündə), redaktor təlimatı `web-cbar-new/docs/about-cms-guide.md`, parser `features/about-content/model/parse.ts`. HTML əvvəl `prepareCmsHtml`-dən keçir, sonra bölünür; fraqmentlər yenə `CmsContent` ilə render olunur.
    - **Ümumi:** yalnız **yuxarı səviyyə** bloklara baxılır (iç-içə struktur tanınmır). "Başlıq-sətir" = `h2`/`h3`/`h4` və ya yalnız bir `<strong>`-dan ibarət paraqraf; "şəkil-paraqraf" = içində yalnız `<img>` / `<a><img></a>` olan `<p>`. Cədvəl qaydaları hər sətirdə **tam 2 hücrə** gözləyir; yalnız `th`-lı sətir başlıqdır və atlanır.
    - **Əsas səhifə:** **ilk** cədvəl → tarix kartları (1–6 sətir, sol hücrə tarix, sağ mətn; uymasa adi cədvəl); hər `<blockquote>` → rəngli qutu (ilk uşaq başlıq-sətirdirsə qutunun başlığı); ardıcıl `<details data-accordion>` → bir accordion qrupu (birincisi açıq); qalanı adi məzmun, CMS sırası saxlanılır.
    - **Tarix:** **ilk** cədvəl timeline olur — hər sətir bir hadisə; sol hücrədə 1000–2999 aralığında 4 rəqəmli il (qalanı gün-ay), il `<strong>`-dadırsa **əsas mərhələ**; sağ hücrədə ilk başlıq-sətir hadisənin başlığı, şəkil-paraqraflar şəkil, qalanı mətn. İli olmayan sətir atılmır (markersiz). İl naviqasiyası avtomatikdir (`#year-YYYY`, JS-siz işləyir). Cədvəldən əvvəlki ilk başlıq-sətir hero kartdır (`<em>` vurğu rəngində). ⚠️ Timeline tanınmasa **bütün səhifə `plain` olur, hero da göstərilmir** (`parse.ts:249-252`) — kontrakt §3 bunun əksini deyir.
    - **Missiya:** **ilk** `<blockquote>` banner; ondan sonra hər başlıq-sətir yeni dəyər sətri başlayır, növbəti başlığa qədər hər şey onun mətnidir; mətndəki ilk şəkil-paraqraf ikon olur.
    - **Fallback:** hər qayda ya tam tanınır, ya heç; tanınmayan blok eyni yerdə adi məzmun kimi qalır, **mətn atılmır**. Balanssız HTML-də bütün səhifə bir adi blokdur (`shared/lib/html-blocks.ts`).
    - ⚠️ Timeline şəkilləri və dəyər ikonları yalnız `/media/...` və ya `https://` ola bilər — başqa ünvanlı şəkil-paraqraf **görünmədən itir** (`parse.ts:33-46`).
  - **"(Kopya)" səhifələri** — redaktorun hazırlıq surəti: "Haqqımızda (Kopya)" / "About Us (Copy)" əsl kökün **uşağıdır**, altındakı `-copy` slug-ları eyni layout-u alır. Cari səhifə bu alt ağacdadırsa sol menyu Kopya node-undan qurulur (başlığın sonundakı `(Kopya)`/`(Copy)` ilə tanınır; `tree.ts:71-80`). ⚠️ Kopya səhifələri **public-dir** və orijinal menyuda görünür; gizlədilsələr ağacdan düşüb şablonu itirirlər.
- Fayllar `page.assets`-dən, qrup etiketinə görə (şəkil zolağı + qruplu accordion / düz siyahı) — "Haqqımızda" səhifələrində də eyni köhnə görünüş; yeni sətir görünüşü yalnız "Struktur bölmələr"dədir (§5.6).

### 5.1a Beynəlxalq maliyyə təşkilatları (spec 044)

Səhifə mətnindən ayrı məzmun növü: `ifi_organizations` (+tr), `ifi_memberships` (+tr). Öz ünvanı yoxdur — kartlar "Beynəlxalq əməkdaşlıq" bölməsinin CMS səhifəsi 121-də (`beynelxalq-teskilatlarla-emekdasliq` / `cooperation-with-international-organizations`, `-copy` daxil) göstərilir; layout `ifi-organizations`, slug ilə `cooperationLayoutFor` seçir (`web-cbar-new/src/features/about-content/model/layouts.ts`). Panel bölməsi `/ifi-organizations` ("Maliyyə təşkilatları").

- **Sahələr:** ad, əsas missiya, üzvlük tarixlərinin başlığı, zəngin mətn (az/en); loqo (yalnız şəkil, `logo_media_id`), sayt ünvanı (yalnız `http(s)`), üzvlük ili (1900–2100, DB `CHECK`), sıra, status (`scheduled` qadağandır), `show_az`/`show_en`; soft delete `deleted_at`. Boş missiya/başlıq `null` saxlanılır (`api-cbar-admin/src/Cbar.AdminApi/Controllers/IfiOrganizationsController.cs` `Apply`).
- **Üzvlük tarixləri** alt resursdur (`POST|PUT|DELETE /ifi-organizations/{id}/memberships…`, `PUT …/order` dəqiq id dəsti ilə, yoxsa 400): tarix + qurumun adı (az/en). Panel onları təşkilat ilk dəfə saxlanandan sonra göstərir (`web-cbar-admin-new/src/features/ifi-organizations/components/ifi-memberships-section.tsx`). Başqa təşkilatın tarixi və ya silinmiş təşkilatın tarixi 404-dür.
- **Public** (`api-cbar/src/Cbar.WebApi/Controllers/IfiOrganizationsController.cs`): `GET /ifi-organizations?locale=` — yalnız `published`, silinməmiş, həmin dildə görünən və tərcüməsi olan təşkilatlar, `sort_order, id` ilə; səhifələmə yoxdur. Tarixdən yalnız həmin dildə adı olanlar qayıdır. Loqo `/media/{id}`.
- **Sayt** (`web-cbar-new/src/widgets/about-blocks/ifi-organization-card.tsx`): hər təşkilat native `<details>` kartı, **hamısı bağlı gəlir**; JS-siz açılır, çapda bağlı kartlar da açıq çap olunur (`data-accordion`). Boş sahə öz hissəsini göstərmir. Sayt ünvanı yeni tabda, mətni host-dur; `http(s)` olmayan ünvan atılır (loader `website()`). Tarix `DD.MM.YYYY`.
- **Köhnə siyahının kəsilməsi:** təşkilat varsa səhifə mətni ilk başlıq-sətirdən (`<p><strong>…</strong></p>` və ya H2–H4) kəsilir, ondan əvvəlki hissə girişdir (`features/about-content/model/ifi-organizations.ts`). Təşkilat yoxdursa və ya API xəta verirsə mətn tam göstərilir — səhifə heç vaxt boş qalmır.
- **Seed** (`0026`): cədvəl boşdursa və `az`/`en` locale-ləri varsa Figma-dakı 4 təşkilat və Dünya Bankının 5 tarixi; səhifə 121-in az başlığı Figma başlığına dəyişir və mətnin əvvəlinə giriş qoyulur — **yalnız az başlıq hələ köhnə "Beynəlxalq təşkilatlarla əməkdaşlıq"-dırsa** və `page_translations`-a UPDATE icazəsi varsa. Loqo seed edilmir; en missiya mətnləri və AYİB en mətni tərcümə qaralamasıdır.
- **İcazələr:** `ifi.read|create|update|delete` (moderator roluna migration `0025`); hər yazma `audit_log`-a (`ifi.*`, `ifi.membership_*`). Loqo kimi istifadə olunan media silinə bilməz (`MediaController.Delete`).
- ⚠️ Təşkilat mətnləri **sayt axtarışında yoxdur** (`api-cbar` `SearchController`-də blok yoxdur, KSM-dən fərqli) — səhifə yalnız öz CMS mətni ilə tapılır.
- ⚠️ Layout slug-a bağlıdır: admin-də slug dəyişsə kartlar görünmür, səhifə `plain`-ə düşür (§12 #42).

### 5.1b Anlaşma Memorandumları (spec 045)

Səhifə mətnindən ayrı məzmun növü: `memorandums` (+tr). Öz ünvanı yoxdur — sətirlər "Beynəlxalq əməkdaşlıq" bölməsinin CMS səhifəsi 122-də (`merkezi-banklarla-emekdasliq` / `cooperation-with-central-banks`, `-copy` nüsxələri ilə) cədvəl kimi göstərilir.

- **Sahələr:** təşkilat (≤500) və ölkə (≤100, sərbəst mətn) az/en; imzalanma ili (`signed_year`, 1991 … gələn il API-də, DB `CHECK` 1991–2100), sıra (il daxilində), status (`scheduled` qadağandır), `show_az`/`show_en`. Dolu dildə hər iki mətn məcburidir; buraxılan dil silinir.
- **Admin** (`api-cbar-admin/src/Cbar.AdminApi/Controllers/MemorandumsController.cs`): `GET|POST /memorandums`, `GET|PUT|DELETE /memorandums/{id}` (soft delete). Siyahı `signed_year DESC, sort_order, id`; `search` təşkilat və ya ölkə üzrə istənilən dildə (ILIKE). Alt resurs və media yoxdur.
- **Public** (`api-cbar/src/Cbar.WebApi/Controllers/MemorandumsController.cs`): `GET /memorandums?locale=` — yalnız `published`, silinməmiş, həmin dildə görünən və tərcüməsi olan sətirlər, `{ id, organization, country, year }`, il azalan, il daxilində redaktor sırası. Sıra parametri yoxdur.
- **Sayt** (`web-cbar-new/src/widgets/about-blocks/memorandums.tsx`): üç sütunlu həqiqi `<table>` (bütün enlərdə, uzun ad sətir keçir). Çeşidləmə `?sort=oldest` — view-da qurulur (`features/about-content/model/year-sort.ts` `orderByYear`, spec 046-da üzvlük cədvəli ilə ortaq): illər artan, **il daxilində redaktor sırası dəyişmir**; tanınmayan dəyər standart sıradır. Seçim native `<details>` + iki linkdir, JS-siz işləyir, çapda gizlidir.
- **Köhnə mətnin kəsilməsi:** memorandum varsa səhifə mətni ilk başlıq-sətirdən kəsilir (köhnə saytın dörd bank mətni), əvvəlki hissə girişdir; memorandum yoxdursa və ya API xəta verirsə mətn tam göstərilir.
- **Seed** (`0028`): cədvəl boşdursa və `az`/`en` locale-ləri varsa Figma-dakı 28 sətir (en adlar tərcümə qaralamasıdır); səhifə 122-nin az və en mətninin əvvəlinə giriş paraqrafı — yalnız mətn hələ `<p><strong>` ilə başlayırsa və `page_translations`-a UPDATE icazəsi varsa.
- **İcazələr:** `memorandums.read|create|update|delete` (moderator roluna migration `0027`); hər yazma `audit_log`-a (`memorandums.*`).
- ⚠️ Memorandumlar **sayt axtarışında yoxdur**; layout slug-a bağlıdır (§5.1a ilə eyni risk).

### 5.1c Beynəlxalq təşkilatlarda üzvlük (spec 046)

Ayrıca məzmun növü **yoxdur**: üzvlüklər CMS səhifəsi 554-ün (`beynelxalq-teskilatlarda-uzvluk` / `membership-in-international-organizations`,
`-copy` nüsxələri ilə; layout `memberships`) mətnindəki **birinci adi cədvəldir** — birinci sütun təşkilat, ikinci il. API, sxem və admin bölməsi
dəyişməyib; redaktor cədvəli səhifə redaktorunda düzəldir.

- **Oxunma** (`web-cbar-new/src/features/about-content/model/memberships.ts`): yalnız `th`-dan ibarət sətir və ya ikinci xanasında dörd rəqəmli il
  olmayan birinci sətir başlıqdır, göstərilmir. Təşkilat düz mətndir; xanada `http(s)` link varsa ad link olur (yeni pəncərə), başqa sxemlər atılır.
  İl xanası yazıldığı kimi göstərilir, sıra onun ilk dörd rəqəmli ilinə (1800–2099) görədir. 3+ sütun göstərilmir, iki xanası boş sətir atılır.
  Cədvəldən əvvəlki mətn giriş, sonrakı mətn cədvəldən sonradır. Cədvəl yoxdursa / sətir qalmırsa səhifə adi mətndir, çeşidləmə yoxdur.
- **Sayt** (`widgets/about-blocks/memberships.tsx`): iki sütunlu həqiqi `<table>`, memorandum cədvəli ilə eyni üslub; cədvəlin adı ("Azərbaycan
  Respublikası Mərkəzi Bankının üzv olduğu təşkilatlar") dizaynda gizlidir, yalnız ekran oxuyucusu üçün. Çeşidləmə memorandumla ortaqdır
  (`model/year-sort.ts` `orderByYear`, `?sort=oldest`): sabit sıralama, il daxilində redaktor sırası, ilsiz sətir hər iki sırada sonda.
- **Seed** `0029`: az mətn boş və ya yer tutucudursa (`<p>Beynəlxalq təşkilatlarda üzvlük</p>`) Figma-dakı 14 sətirlik cədvəli yazır; en tərcümə
  yoxdursa və ya az səhifənin surətidirsə (eyni başlıq, yer tutucu mətn) en başlıq, slug və cədvəl (qaralama tərcümə) yazır. Yalnız
  `page_translations`-a, privilege yoxlaması ilə; redaktə olunmuş səhifəyə toxunmur, təkrar işləmə heç nə dəyişmir.
- ⚠️ Layout slug-a bağlıdır (§5.1a ilə eyni risk). Mətn səhifənin adi mətni kimi sayt axtarışında tapılır.

### 5.1d Maliyyə savadlılığı (spec 047)

Bölmə şablondadır (breadcrumb, paylaşma, sol menyu): kök **başlığı ilə** tanınır — `Maliyyə savadlılığı` / `Financial Literacy`
(`web-cbar-new/src/entities/page-node/lib/tree.ts` `SECTION_TITLES.literacy`). Ayrıca məzmun növü, API və admin bölməsi **yoxdur**: Figma blokları
səhifə mətnindəki adi redaktor işarələməsindən qurulur, slug ilə `literacyLayoutFor` seçir (`features/about-content/model/layouts.ts`, `-copy` daxil).

- **Kök** (`maliyye-savadliligi` / `financial-literacy`, səhifə 106; layout `financial-literacy`, `model/financial-literacy.ts`): "Ümumi məlumat"ın
  mətni kökün **özündədir** (redaktorlar köçürüb; API-də fallback yoxdur). `h2` bölmə başlayır; `h3` / tək qalın sətir alt başlıqdır; poçt linki
  olmayan `blockquote` tərifdir (bir neçə paraqrafda sonuncusu mənbə); hər `li`-si qalın başlıqla açılan `ul` prinsip kartlarıdır (bütöv və ya heç);
  `h3`-dən dərhal sonrakı adi `ul` hədəf qrupu etiketləridir; yalnız `<a data-media-link href="/media/{id}">`-dən ibarət paraqraf qalereyadır
  (`PhotoGallery`; səhifənin şəkil olmayan faylına link varsa tanınmır); **birinci** poçt linkli `blockquote` banner-dir (dəvət sətri, başlıq,
  ünvan; düymə `mailto:`), həmişə sonda göstərilir. Tanınmayan hər şey yerində adi mətn qalır. Kökün mətni boşdursa — köhnə qayda, uşaq kartları.
- **Platforma səhifələri** (portal 110, Virtual Təhsil Platforması 111, məlumat-axtarış sistemi 112; layout `literacy-platform`,
  `model/literacy-platform.ts`): birinci `h2`-yə qədər giriş; **birinci** `blockquote` qeyd qutusu; **birinci** media paraqrafı foto sırası (hər şəkil
  faylı yeni tabda açır); `h2` üst xətli bölmədir; mətnin **sonuncu** paraqrafı yalnız bir `http(s)` linkdən ibarətdirsə platformaya keçid düyməsidir
  (yeni pəncərə). İkinci qeyd/foto paraqrafı yerində adi mətn qalır.
- **Fayllar:** blokun göstərdiyi şəkillər (`usedMediaIds`) səhifənin fayl siyahısından çıxarılır (`views/cms-page/index.tsx`), qalan fayllar adi qaydada.
- **İkonlar** (kartlar 4, etiketlər 7) dizaynın hissəsidir, sıra ilə verilir, uzun siyahıda təkrarlanır (`widgets/about-blocks/literacy-icons.tsx`).
- **"Ümumi məlumat"** (107) ağacda qalır, ünvanı 308 ilə köka gedir (`src/proxy.ts`, §7). Seminarlar/vebinarlar (108) və Müsabiqələr (109) adi
  mətndir (en-də gizli, `show_en = false`).
- **Seed** `0030` (`api-cbar-admin/db/migrations/0030-financial-literacy-seed.sql`): 106, 110, 111, 112-nin az və en mətnini Figma quruluşunda yazır —
  **yalnız mətnin md5-i köhnə mətnin md5-idirsə** (redaktə olunmuş mətnə toxunmur, təkrar işləmə heç nə dəyişmir); səhifələri az slug ilə tapır.
  107, 108, 109 və "Maliyyə savadlılığı (Kopya)" (452, alt ağacı ilə) üçün `page_details.show_in_side_nav = false` — sətir artıq varsa toxunmur.
  Privilege yoxlaması var; en mətnin yeni hissələri tərcümə qaralamasıdır.
- ⚠️ Layout slug-a, bölmə kökün başlığına bağlıdır (§5.1a ilə eyni risk; başlıq dəyişsə bölmə köhnə görünüşə qayıdır).

### 5.1e İstehlakçıların və investorların hüquqları (spec 050)

Bölmə şablondadır: kök başlığı ilə tanınır — `İstehlakçıların və investorların hüquqları` / `Consumer and Investor Rights`
(`web-cbar-new/src/entities/page-node/lib/tree.ts` `SECTION_TITLES.consumer`). Köhnə saytda olduğu kimi ayrıca məzmun növü, API və admin bölməsi
**yoxdur**: Figma blokları səhifə mətnindəki redaktor akkordeonlarından, cədvəllərdən və fayl linklərindən qurulur, slug ilə `consumerLayoutFor`
seçir (`features/about-content/model/layouts.ts`, `-copy` daxil). Parser-lər həm köhnə import formasını (hər akkordeon ayrıca `div`-də, ay akkordeonları
cədvəl xanasında, `<p>`-siz xanalar), həm redaktorun saxladığı formanı oxuyur (`model/year-archive.ts` `topNodes`, `detailsIn`).

- **Kök və İnzibati işlər** (87, 86; layout `consumer-text`, `model/consumer-text.ts`): birinci paraqraf lead-dir (qalınlığı atılır); yalnız qalın
  sətir və ya `h2`–`h4` başlıqdır; `ul`/`ol` nömrələnmiş kartlardır; qalanı adi mətndir. Mətn paraqrafla başlamırsa — adi mətn.
- **Şikayət indeksləri** (95 Bank + **yoldaş** 96 Sığorta; layout `complaint-index`, `model/complaint-index.ts`): il akkordeonu (başlıq 4 rəqəm) →
  ay akkordeonu (başlıq az/en ay adı) → ilk `data-media-link`. İllər və aylar azalan sıralanır, tanınmayan ay adı sonda qalır, faylsız ay atılır;
  "son məlumat" ən yeni ilin ən yeni faylıdır. Arxivdən sonrakı ilk `h2` metodologiyadır: dəqiq 3 paraqraflı `blockquote` düsturdur, `Qeyd:`/`Note:`
  paraqrafı və sonrakılar kiçik qeyddir. Sığorta səhifəsini loader ayrıca oxuyur (`views/cms-page/loader.ts` `loadCompanion`); xətada tab olmur.
  Tab `?tab=bank|insurance` parametridir (`model/consumer-select.ts`), yanlış dəyər Bank-a düşür.
- **Statistika** (94 + **yoldaş** 93 İnfoqrafika; layout `appeal-statistics`, `model/appeal-statistics.ts`): üst səviyyə akkordeon kanaldır (ad
  `… üzrə statistika` / `Statistics of …` hissəsi atılaraq), içində il akkordeonu → ilk cədvəl. Birinci xanası `Aylar`/`Months` olan cədvəl
  "ay × sektor" formasıdır (`Yekun`/`Total` sətri, `Cəmi`/`Total` sütunu); başqa forma (Səyyar qəbul: şəhər × ay) olduğu kimi göstərilir. Köhnə en
  mətnindəki xəta (boş il akkordeonu, cədvəli ondan sonra; kanal bağlandıqdan sonra gələn illər) da oxunur: həmin cədvəl və illər kanala qatılır.
  **Qısa icmal** avtomatik hesablanır: hər "ay × sektor" kanalında doldurulmuş sətri olan ən yeni ilin son tam dolu ayı, bunların **minimumu**
  (ortaq ay, il sərhədini keçə bilər); hansısa kanalda dolu ay yoxdursa icmal yoxdur. Kartda kanalın "Cəmi"-si (yoxdursa sektorların cəmi) və
  sektorlar. Kanal və il `?channel=<sıra>&year=<il>`-dir, yanlış dəyər birinci kanala və onun ən yeni ilinə düşür. İnfoqrafika (93) sonda il → ay
  arxividir; en səhifəsi yoxdur.
- **Sənədlər** (101; layout `consumer-documents`, `model/consumer-documents.ts`): hər üst səviyyə akkordeon bölmədir; yalnız media linkindən ibarət
  paraqraf (və ya tək link) sənəd kartıdır, qalanı adi mətndir.
- **Fayllar:** `complaint-index`, `appeal-statistics`, `consumer-documents` səhifələrində ayrıca fayl siyahısı göstərilmir (`views/cms-page/index.tsx`
  `BLOCKS_WITH_FILES`): fayllar arxivdə və bölmələrdədir, səhifənin `assets`-i isə başqa dilin fayllarını da saxlayır. Mətndə linklənməyən fayl görünmür.
- **Ünvanlar** (`src/proxy.ts` `consumerRedirect`, §7): 88 "Fəaliyyət istiqamətləri" → kök; 93 → `…/vetendas-muracietlerine-dair-statistika#infoqrafika`;
  96 → `…/bank-xidmetlerinden-istifade-uzre-sikayet-indeksi?tab=insurance`. 86 köçəndə ünvanı dəyişmir: menyular `/{locale}/{slug}` verir, loader son seqmenti oxuyur.
- **Seed** `0031` (`api-cbar-admin/db/migrations/0031-consumer-rights-seed.sql`): (1) 86 hələ Media altındadırsa kökə köçürülür — kökün uşaqları
  `(sort_order, id)` sırası ilə 10 addımla yenidən nömrələnir, 86 Bank indeksindən sonra qoyulur, `path` (+ alt ağac) yenilənir, `page_details.show_in_side_nav = true`;
  (2) 95 → "Şikayət indeksləri"/"Complaint indices", 101 → "Sənədlər"/"Documents" — yalnız başlıq köhnədirsə; (3) kökün birinci paraqrafı ikiyə bölünür —
  yalnız md5 köhnədirsə; (4) 95-ə Bank, 96-ya Sığorta metodologiyası — mətndə həmin `h2` yoxdursa; (5) 101-ə "İnformasiya sorğusu" — həmin `summary`
  yoxdursa; (6) 88–93, 96–100, 102, 103, 433 üçün `show_in_side_nav = false` — sətir varsa toxunmur. Privilege yoxlaması var (`pages` UPDATE daxil);
  en mətnlər tərcümə qaralamasıdır. Sol menyu nəticədə: Statistika, Şikayət indeksləri, İnzibati işlər, Sənədlər.
- ⚠️ Layout və yoldaş səhifələr slug-a, bölmə kökün başlığına bağlıdır (§5.1a ilə eyni risk). "966 Çağrı Mərkəzi Qaydaları" PDF-i (Figma "İnformasiya
  sorğusu") media kitabxanasında yoxdur — redaktor yükləyənə qədər kart olmur. Figma-da gizli "Mərkəzi Banka müraciət imkanları" hub-ı (89–92, 98, 99)
  qurulmayıb, həmin səhifələr adi mətndir və sol menyuda gizlidir.

### 5.1f Sual-cavab (spec 051)

Səhifə mətnindən ayrı məzmun növü: mövzular, suallar, videolar. Köhnə saytda FAQ bir CMS səhifəsinin (`sual-cavab`) əl ilə yazılmış HTML siyahısı
idi. Yeni saytda həmin CMS səhifəsi (`FAQ_SLUG` = `sual-cavab` / `faq`, `web-cbar-new/src/entities/page-node/lib/tree.ts`) yalnız başlıq və ünvanı
verir; route `[...slug]/page.tsx` slug-ı tanıyıb `views/faq`-ı göstərir. Panel bölməsi `/faq` ("Sual-cavab": Suallar, Mövzular, Videolar).

- **Admin** (`api-cbar-admin/src/Cbar.AdminApi/Controllers/FaqTopicsController.cs`, `FaqQuestionsController.cs`, `FaqVideosController.cs`,
  qaydalar `Services/FaqSupport.cs`):
  - **Mövzu:** ən azı bir dildə ad; `slug` az addan (yoxdursa en), `UniqueSlug` ilə, **sonra dəyişmir** (saytın `?topic=` linkləri qırılmasın).
    Yeni mövzu sonuna düşür. Silinməmiş sualı olan mövzu silinmir → **409** "Mövzuda N sual var — …". `pageIds` (bağlı CMS səhifələri, sıra ilə)
    göndərilməsə bağlantılara toxunulmur; mövcud olmayan səhifə → 400.
  - **Sual:** mövcud mövzu; ən azı bir dil tam (sual + cavab); başlanmış dil yarımçıq ola bilməz → 400. Cavab rich-text-dir, `<p></p>` kimi boş HTML
    boş sayılır (`IsBlankHtml`; şəkil/cədvəl/iframe/video/audio məzmundur). Yeni sual mövzunun sonuna, mövzusu dəyişən sual yeni mövzunun sonuna.
    Siyahıda `missingLocale=en` həmin dildə tam olmayan sualları verir (tərcümə işi), `number` mövzu daxilində 1-dən sıradır.
  - **Video:** link YouTube id-sinə çevrilməlidir (`watch?v=`, `youtu.be/`, `embed/`, `shorts/`, `live/`, `v/`; id ən azı 6 simvol), yoxsa 400
    "YouTube linki tanınmadı"; ən azı bir dildə başlıq.
  - **Sıra:** `PUT /faq/topics/order`, `PUT /faq/topics/{id}/questions/order`, `PUT /faq/videos/order` — `ids` silinməmiş elementlərin **tam dəsti**
    olmalıdır, yoxsa 400 ("Sıra siyahısı bütün elementləri bir dəfə saxlamalıdır…"); bir transaksiyada `sort_order = index`.
  - `scheduled` statusu qəbul olunmur (planlı dərc yoxdur). İcazələr `faq.read|create|update|delete` (moderator roluna `0032`); hər yazma
    `audit_log`-a (`faq.topic_*`, `faq.question_*`, `faq.video_*`).
- **Public** (`api-cbar/src/Cbar.WebApi/Controllers/FaqController.cs`):
  - `GET /faq?locale=` — bir cavabda mövzular (suallarla) və videolar. Mövzu: `published`, həmin dildə adı var **və** ən azı bir görünən sualı var.
    Sual: `published`, həmin dildə sual və cavab boş deyil (trim). Video: `published`, həmin dildə başlıq. Sıra `sort_order, id`. Səhifələmə yoxdur.
  - `GET /faq/topics?pageId=&locale=` — səhifəyə bağlı mövzular (`faq_topic_pages.sort_order`), `{ slug, name, questionCount }`; adı və ya görünən
    sualı olmayan mövzu qaytarılmır; `pageId < 1` → 400.
- **Sayt** (`web-cbar-new/src/views/faq`, `widgets/faq`, `features/faq/model/select.ts`):
  - Bir səhifə, iki görünüş: **A** — bütün mövzular bağlı native `<details>` kartlarıdır, açılan kartda nömrələnmiş suallar və "Ayrıca aç";
    **B** — `?topic=<slug>`: mövzu başlıq, suallar düz siyahı, mövzu seçimi (native `<select>`-li GET forması). Tanınmayan slug A-ya düşür.
  - **Axtarış** `?q=` saytda süzülür (API yox): sual mətni + cavabın mətni, böyük-kiçik hərf və İ/ı qatlanır (`shared/lib/search-fold.ts`, Postgres
    `ILIKE` İ/ı-nı qatlamır). Uyğun suallar və mövzuları açıq gəlir; nömrə mövzudakı yerdir, axtarışda dəyişmir. Boş nəticədə "«…» üzrə sual
    tapılmadı" + təmizləmə linki, videolar qalır. Hamısı JS-siz işləyir; paylaşma linki `q` və `topic`-i saxlayır.
  - **Sual ankoru** `#sual-<id>` (dillərdə eyni): brauzer mövzunu açır, `faq-hash-opener.tsx` sualı açıb ona sürüşdürür.
  - **Videolar** YouTube önizləmə şəkli + xarici link (yeni pəncərə); iframe və playlist yoxdur — köhnə "Playlist-ə keçid" linki köçürülməyib.
  - **Ehtiyat:** görünən mövzu yoxdursa və ya API xəta verirsə `loadFaqPage` `null` verir və səhifə öz CMS mətnini (köhnə əl siyahısı) göstərir —
    suallar heç vaxt tamamilə itmir.
  - **Keçid kartı:** mövzuya bağlı hər CMS səhifəsində mətndən sonra, fayllardan əvvəl "<Mövzu> üzrə sual-cavab · N sual · Bax →" kartı, bütün kart B-yə
    link (`widgets/faq/faq-topic-links.tsx`). `loadCmsPage` onu ağacla paralel oxuyur, xətada kart olmur, FAQ səhifəsinin özündə sorğu getmir.
- **Seed** `0033` (`specs/051-faq-page/seed/` generatoru ilə köhnə səhifədən): yalnız `faq_topics` boşdursa — 8 mövzu, 226 sual (az), 1 video,
  hamısı `published`; mövzuların en adları var, en suallar **təxirə salınıb**, ona görə en FAQ boşdur və en səhifə öz CMS mətnini göstərir.
  "Pul siyasəti" mövzusu `pul-siyaseti` səhifəsinə bağlanır. Səhifə başlığı "Sual − cavab" → "Sual-cavab" (yalnız köhnə başlıqdırsa, UPDATE icazəsi varsa).
- ⚠️ FAQ **sayt axtarışında yoxdur** (`api-cbar` `SearchController`-də blok yoxdur; axtarılıb: `faq`) — suallar yalnız FAQ səhifəsinin öz axtarışı
  ilə tapılır. Səhifə `FAQ_SLUG`-a bağlıdır: CMS-də slug dəyişsə FAQ görünüşü itir, adi mətn qalır. Köhnə `page-131` yönləndirməsi (§7.2) test
  bazasının id-sinə əsaslanır.

### 5.1g Aylıq hesabatlar (spec 052)

§5.1e-nin üç il → ay arxivi (95 Bank şikayət indeksi, 96 Sığorta, 93 İnfoqrafika) spec 052-dən ayrıca məzmun növüdür. Səhifə mətni yalnız
giriş və metodologiya üçündür.

- **Model:** üç sabit seriya (`monthly_report_series`, açar `bank-complaint-index`, `insurance-complaint-index`, `infographics`; `period_months` 1/12/1,
  az/en ad). Hesabat = seriya + il + ay + status, hər dil üçün bir fayl (`monthly_report_translations.media_id`). Başlıq saxlanılmır: sayt
  "{seriyanın adı} ({Ay} {İl})" qurur, 12 aylıq seriyada "({Ay−11} {İl'} – {Ay} {İl})" (`features/about-content/model/report-archive.ts` `reportTitle`).
- **Admin** (`MonthlyReportsController`): `GET /monthly-reports/series`, `GET|POST /monthly-reports` (`series`, `year`, `status` süzgəci; sıra `year DESC,
  month DESC`, seriya sırası, `id`), `GET|PUT|DELETE /monthly-reports/{id}` (soft delete). Seriya açarla gəlir. Validasiya: il 2000 … gələn il, ay 1–12,
  ən azı bir dildə mövcud və silinməmiş media, `scheduled` yox; eyni seriya + dövr → 409 "Bu seriyada {Ay} {İl} üçün hesabat artıq var.". Siyahıda
  `missingFile` (faylı media kitabxanasında silinib). İcazələr `monthly_reports.*` (moderator), audit `monthly_reports.*`.
- **Public** (`api-cbar`): `GET /monthly-reports?locale=&series=a,b` — `published`, silinməmiş, həmin dildə faylı olan və faylı silinməmiş hesabatlar,
  seriyalar öz sırası ilə, hesabatlar ən yenisi birinci; həmin dildə hesabatı olmayan seriya cavabda **yoxdur**. `ShowAz/ShowEn` yoxdur: dildə faylın olması görünürlükdür.
- **Sayt:** loader layout-un seriyalarını oxuyur (`complaint-index` → Bank + Sığorta, yoldaşla paralel; `appeal-statistics` → İnfoqrafika, onda 93 oxunmur).
  Seriya varsa arxiv sətirlərdən qurulur və mətndəki köhnə akkordeon arxivi **göstərilmir** (giriş və metodologiya qalır, arxivsiz mətn də işləyir);
  seriya yoxdursa və ya API xəta verirsə §5.1e yolu (mətndən). Görünüş eynidir.
- **Panel:** "İstehlakçı hüquqları → Aylıq hesabatlar" (§9.2), seriya tabları, "Yeni" seriya tabında növbəti ayla açılır (`ModuleConfig.newSearch`).
- **Köçürmə** `0035`: səhifələri az slug ilə tapır, il → ay akkordeonlarından ilk `/media/N` linkini oxuyur (az sətir yaradır, en eyni dövrə fayl əlavə edir);
  tanınmayan ay, kitabxanada olmayan fayl, xarici link köçmür; seriyada sətir varsa (silinmiş də) toxunmur; səhifə mətnini dəyişmir. Test mühitində
  nəticə: Bank 32/32, Sığorta 45/41, İnfoqrafika 65/0 (Sığortanın en-dəki 2 ayı `uploads.cbar.az`-a link verir).
- ⚠️ Seriyanın bir dərc olunmuş sətri olan kimi mətndəki bütün köhnə arxiv gizlənir — köçürmə admin API ilə eyni deploy-dadır. Seriya adlarını
  dəyişən admin ekranı yoxdur (migration ilə yazılır).

### 5.1h FinCERT (spec 053)

Səhifə mətnindən ayrı məzmun növü, FAQ (§5.1f) nümunəsi ilə. Köhnə saytda FinCERT bir CMS səhifəsinin (`fincert`, köhnə `page-893`, yeni id 133)
mətni idi: missiya, dörd istiqamət (az bir bəndli `<ol><li><strong>` başlıqlar, en `h3`), e-poçt, telefon, portal linki və `uploads.cbar.az`-dakı
RFC-2350 PDF-i. Yeni saytda CMS səhifəsi (`FINCERT_SLUG` = `fincert`, az/en eyni) yalnız başlıq, ünvan və ehtiyat mətni verir; route `[...slug]/page.tsx`
FAQ-dan sonra slug-ı tanıyıb `views/fincert`-i göstərir. Panel bölməsi `/fincert` ("FinCERT": Ümumi, Fəaliyyət istiqamətləri, Beynəlxalq üzvlüklər).

- **Admin** (`api-cbar-admin/src/Cbar.AdminApi/Controllers/FincertSettingsController.cs`, `FincertDirectionsController.cs`,
  `FincertMembershipsController.cs`, qaydalar `Services/FincertSupport.cs`):
  - **Ümumi (tək qeyd):** `GET` sətir yoxdursa boş sahələr və `translations: {}` (404 yox); `PUT` `id = 1`-i yaradır və ya yeniləyir.
    **Göndərilməyən dil saxlanılır** (başqa bölmələrdən fərqli); göndərilən dildə `null` sahə təmizlənir. Yoxlamalar sahə üzrə 400 `errors`
    (`email`, `portalUrl`, `translations.az.rfcUrl` …): e-poçt forması, `http(s)://` linklər, uzunluqlar, RFC faylı mövcud silinməmiş **sənəd**
    (şəkil olmayan icazəli yükləmə növü), dildə portal adı varsa portal ünvanı vacib. Audit `fincert.settings_update` (`before`/`after`).
  - **İstiqamət:** ən azı bir dil tam (başlıq + mətn); başlanmış dil yarımçıq → 400; `<p></p>` boş sayılır (`FaqSupport.IsBlankHtml`); başlıq ≤ 500.
    Yeni bənd sonuna; siyahıda `number` silinməmişlər arasında sıradır.
  - **Üzvlük:** ən azı bir dildə ad; loqo mövcud **şəkil** (`image/*`), link `http(s)://`; ad ≤ 255, təsvir ≤ 1000, nişan ≤ 120.
  - **Sıra:** `PUT /fincert/directions/order`, `PUT /fincert/memberships/order` — tam dəst, yoxsa 400. `scheduled` qəbul olunmur. İcazələr
    `fincert.read|create|update|delete` (moderator roluna `0036`); audit `fincert.direction_*`, `fincert.membership_*`.
- **Public** (`api-cbar/src/Cbar.WebApi/Controllers/FincertController.cs`): `GET /fincert?locale=` bir cavabda hamısı, həmişə 200. Boş sətir `null`;
  `portal` yalnız ünvan **və** dildə ad doludursa; `rfc` dildə silinməmiş fayl (`/media/{id}`) və/və ya link varsa; istiqamət `published`, dildə
  başlıq və teqsiz mətn boş deyil; üzvlük `published`, dildə ad; sıra `sort_order, id`; silinmiş loqo `null`.
- **Sayt** (`web-cbar-new/src/views/fincert`, `widgets/fincert`, `features/fincert/model/view.ts`):
  - Altı bölmə Figma sırası ilə, hər biri yalnız dildə məzmunu olanda: missiya (başlıqsız, sətir = paraqraf), nömrəli native `<details>`
    akkordionlar (`<ol>`, hamısı bağlı, nömrə görünən siyahıdakı yer), əlaqə kartları (`mailto:`, `tel:` rəqəm + `+`), portal kartı (kit düyməsi,
    yeni vərəq), RFC-2350 kartı (fayl `download` ilə, link yeni vərəqdə; fayl üstündür; "PDF" nişanı mime-dan və ya `.pdf` sonluğundan),
    üzvlük kartları (loqo, ad, təsvir, nişan; `url` varsa bütün kart link). Sabit ankerlər `#missiya` … `#beynelxalq-emekdasliq`. Figma-dakı
    gizli "Bu səhifədə" bloku və üçüncü əlaqə kartı qurulmayıb. JS-siz işləyir; yeni client komponenti yoxdur (yalnız `Reveal`).
  - **Ehtiyat:** altı bölmənin hamısı boşdursa, API xəta verirsə və ya səhifə dildə yoxdursa `loadFincertPage` `null` verir və səhifə öz CMS mətnini
    göstərir. `generateMetadata` təsviri missiyadan götürür.
- **Seed** `0037` (`specs/053-fincert-page/seed/` generatoru ilə köhnə səhifədən; baza xətti ilə tutuşdurulur): yalnız az slug-ı `fincert` olan
  silinməmiş səhifə varsa və üç əsas cədvəl boşdursa (silinmişlər daxil) — missiya, 4 istiqamət (az + en, gövdə HTML olduğu kimi), e-poçt, telefon
  (Figma forması), portal (az Figma mətni, en köhnə mətndən), RFC: köhnə fayl adı ilə media tapılarsa `rfc_media_id`, yoxsa köhnə link `rfc_url`-ə;
  FIRST üzvlüyü (az Figma, en qaralama, loqosuz). `fincert-copy` (479) `page_details.show_in_side_nav = false`. Səhifə mətnlərinə toxunmur.
- ⚠️ FinCERT **sayt axtarışında yoxdur** (yalnız səhifənin köhnə CMS mətni tapılır). Səhifə `FINCERT_SLUG`-a bağlıdır. Köhnə `page-893`
  yönləndirməsi (§7.2) köhnə saytın qaydasına (`page-<id>/<slug>`) və `seed_sections.py`-dəki id-yə əsaslanır, canlı bazada yoxlanmayıb.

### 5.1i Nəşrlər və tədqiqatlar (spec 054)

Bölmə şablonudur (`SectionKey` `publications`, kök başlıqla tanınır: "Nəşrlər və tədqiqatlar" / "Publications and research"). Köhnə saytda bölmə düz
siyahı idi; seed `0041` onu Figma ağacına salır: iki qrup səhifəsi ("Tədqiqatlar": Ekonometrik modellər, İşçi məqalələri; "Nəşrlər, hesabatlar və
sənədlər": illik hesabat, il arxivləri, dörd strategiya/konsepsiya sənədi, istehlakçı bölməsindən köçən "Rəqəmsal fırıldaqçılıq statistikası" və
"Ödəniş xidmətləri"). Figma-da olmayan köhnə səhifələr silinmir, menyulardan çıxır (`show_in_side_nav = false`); "(Kopya)" ağacına toxunulmur.
Onlardan ikisi ("Maliyyə sabitliyi hesabatı", makroprudensial siyasət çərçivəsi) seed `0042` ilə "Maliyyə sabitliyi" bölməsinə köçür və orada
menyulardadır (spec 056, §7.1).

- **Layout mətnin formasından** (`web-cbar-new/src/features/about-content/model/layouts.ts` `publicationsLayoutFor`, kontrakt
  `specs/054-publications-research/contracts/publication-markup.md`), slug-dan yox — yeni səhifə avtomatik doğru görünüşə düşür:
  - üst səviyyədə (legacy `div` sarğıları açıldıqdan sonra) `<details>` → **il arxivi** (`model/file-archive.ts`): hər akkordion qrupdur; `^\d{4}$`
    etiket il qrupu, boş etiket "Digər"; il qrupları azalan, sonra digərləri; eyni il birləşir. "İl" menyusu `?year=<il>|all`, default ən yeni il
    (il qrupu yoxdursa "Hamısı"). Akkordiondan əvvəl/sonra yalnız fayl linkindən ibarət paraqraf kartdır, içində başqa səhifəyə link adi link qalır;
  - `<details>` yoxdur, `/media/<id>` linki və ya bağlı fayl var → **tək sənəd** (`model/document-list.ts`): giriş + kartlar; mətndə fayl linki
    yoxdursa kartlar `assets`-dən;
  - qalanı `plain`.
- **Sənəd kartı** (`widgets/about-blocks/document-card.tsx`, istehlakçı sənədləri ilə ortaq): ad linkin mətnidir, mime və ölçü səhifənin `assets`-indən
  media id ilə. ⚠️ Fayl mətndə linklənib, amma səhifəyə bağlı deyilsə kart "Fayl" yazır, ölçü göstərilmir. `data-media-link` olmadan da `/media/<id>`
  fayl linki sayılır (köhnə import). Bu iki layout-da `Attachments` göstərilmir (hər dil yalnız öz mətnindəki kartlar).
- **Sol menyu** (`widgets/section-shell/section-nav.tsx`, `section === 'publications'`): kökdə iki qrup bağlı, qrup səhifəsində öz qrupu açıq və
  başlığı aktiv, yarpaqda qrupu açıq və bənd seçilmiş. Server render, JS-siz.
- **İşçi məqalələri** — ayrıca məzmun növü:
  - **Admin** (`api-cbar-admin/.../WorkingPapersController.cs`, panel "Nəşrlər və tədqiqatlar → İşçi məqalələri"): nömrə 1–99, il 1990 … gələn il,
    `paperLanguage` az/en/other, `scheduled` status olmaz, JEL kodu hərf + 1–2 rəqəm (böyük hərfə çevrilir); ən azı bir dildə başlıq (≤ 500),
    başlığı olan dildə ən azı bir müəllif, PDF yalnız sənəd mime-ı. Siyahı sahələri trim edilir, boş və təkrar atılır. Eyni `(number, year)` və ya
    `legacyPageId` → 409. Göndərilməyən dilin tərcüməsi silinir; `legacyPageId` göndərilməsə saxlanılır. Sahə xətaları `errors`
    (`number`, `translations.az.authors` …). Audit `working_papers.create|update|delete`, icazələr `working_papers.*`.
  - **Public** (`api-cbar/.../WorkingPapersController.cs`): `GET /working-papers?locale=` — `published`, silinməmiş, dildə başlığı olan məqalələr,
    sıra il ↓, nömrə ↓, xülasəsiz; `GET /working-papers/{key}` — açar `NN-YYYY` (iki rəqəmli nömrə; `2-2025` → 404), xülasə, JEL, açar sözlər,
    fayl (`sizeBytes` ilə).
  - **Sayt**: CMS səhifəsi `isci-meqaleler-silsilesi` / `working-paper-series` (`WORKING_PAPERS_SLUG`) başlığı və girişi verir (`splitAtFirstDetails`:
    ilk akkordiona qədər; sonrakı köhnə il akkordionları köhnə link siyahısıdır). Axtarış (`?q=`, başlıq/müəllif/açar söz, İ/ı qatlaması), il
    menyusu və səhifələmə (10 sətir) saytdadır (`features/working-papers/model/select.ts`). Detal `/{locale}/<siyahı slug>/NN-YYYY`, açar dillərdə
    eynidir; dil dəyişdiricisi başqa dilin slug-ı ilə gəlsə həmin dilin ünvanına, tərcümə yoxdursa siyahıya yönləndirir. **Ehtiyat:** dildə məqalə
    yoxdursa və ya API xəta verirsə səhifə öz CMS mətnini bütöv göstərir.
- ⚠️ İşçi məqalələri **sayt axtarışında yoxdur** (`api-cbar` `SearchController` onları oxumur; axtarılıb: `WorkingPaper`).
- ⚠️ Köhnə ~78 məqalənin köçürülməsi və köhnə `page-895/*` ünvanlarının detala yönləndirilməsi (spec 054 US6) **edilməyib** — prod-da siyahı köhnə
  CMS mətnini göstərəcək, ta ki məqalələr paneldən daxil edilənə və ya US6 icra olunana qədər.
- Seed `0041` və menyu yeri: §5.1 "Menyu yeri", §3.3.

### 5.2 Press-relizlər və elanlar

- `press_releases`: `type` (1 = press-reliz, 2 = elan/digər, 3 = müsahibə və çıxış), `status`, `published_at`; tərcümədə `title`, `slug`, `content`; fayllar.
- Qoşmanın dili (spec 033): `press_release_asset_details` (`asset_id`, `locale`), sətir yoxdursa və ya `locale` boşdursa fayl hər iki dildədir. Sütun yox, yoldaş cədvəl: mövcud cədvəldə `ALTER TABLE` paylaşılan mühitlərdə yıxılır.
- **Admin:** axtarış + status filtri; `PublishedAt ?? CreatedAt DESC`; forma: status, publishedAt, başlıq*, məzmun (rich text); fayl əlavə/sil (başlıqsız, sırasız).
  - ⚠️ **Başlıq dəyişəndə slug yenidən generasiya olunur** — dərc olunmuş xəbərin public URL-i dəyişir, köhnə linklər 404 verir.
  - ⚠️ PUT boş tərcümə siyahısı ilə gələrsə **bütün tərcümələr silinir** (Create yoxlayır, Update yox).
  - Tip `1 | 2 | 3` olmalıdır, başqası 400. Status və tarix validasiya olunmur.
  - Fayl dili `PUT /press-releases/{id}/assets/{mediaId}/locale` ilə seçilir (`az`, `en`, `null`), audit `press_releases.set_asset_locale`. Paneldə hər fayl sətrində seçim var, müsahibədə "Kart şəkli" və hər dilin "PDF düyməsi" nişanı görünür.
- **Public API:** siyahı `?type&page&pageSize` — `published && PublishedAt <= now` (NULL gizli), `PublishedAt DESC`; element: `{ id, title, slug, publishedAt, imageUrl }` (ilk şəkil fayl). Detal: `{ ..., content, assets[] }`. `imageUrl` və `assets` başqa dilin fayllarını nəzərə almır; cavabda `locale` yoxdur.
- **Public sayt:** `/press-releases?type=1|2&page` (Hamısı / Relizlər / Elanlar, 10-luq); detal `/press-releases/[slug]` — başlıq şəkli, məzmun, fayllar. Ana səhifədə 5 son xəbər + aparıcı xəbərin 260 simvolluq çıxarışı.
- **Müsahibələr və çıxışlar** (`/press-releases?type=3`): siyahı Xəbərlər kimidir. Detalda örtük, qalereya və tarix yoxdur: başlıq, mətn (boş ola bilər), həmin dilin ilk PDF-i üçün "PDF kimi yüklə" düyməsi (`download` adı başlıqdan), qalan fayllar sənəd siyahısında. İlk şəkil yalnız kartdadır. Ana səhifəyə çıxmır. Köhnə "Təqdimat və məruzələr" (səhifə 80) materialları redaktorlar tərəfindən əl ilə köçürülür.
- Sorğu/səsvermə (`press_release_questions/votes`) — cədvəllər var, **API və UI yoxdur.**

### 5.2a Tədbirlər (spec 034)

Press-relizdən ayrı məzmun növü: `events` (+tr), `event_categories` (+tr). Saytda `/media/events`, detal `/media/events/{slug}`, panel `/events`, `/events/categories`.

- **Sahələr:** növ (sabit: 1 qərar, 2 mətbuat konfransı, 3 konfrans, 4 seminar), bölmə (paneldən), başlanğıc/bitmə tarixi, saat, status, dil üzrə başlıq/məkan/mətn; istəyə bağlı qalereya, press-reliz, CMS səhifəsi.
- **Görünürlük:** yalnız `published`, silinməmiş, həmin dildə tərcüməsi olan. `PublishedAt` embargo-su yoxdur, gələcək tədbir görünməlidir. `scheduled` status qəbul olunmur.
- **Gələcək/keçmiş:** bitmə (yoxdursa başlanğıc) tarixi Bakı günü ilə bu gün və sonradırsa gələcək. Gələcək artan, keçmiş azalan sıra; "Daha çox göstər" hər dəfə 10.
- **`sort=newest`** (spec 059, `GET /events`): başlanğıc tarixi azalan sıra, keçmiş və gələcək birlikdə (`when` verilməyibsə). Eyni gündə gec saat əvvəldir, saatsız sonra gəlir, sonra başlıq. Bütün filtrlərlə birləşir. Boş dəyər verilməmiş sayılır, başqa dəyər 400 qaytarır. Parametrsiz sıra dəyişmir.
- **Köhnə tədbirlər:** 6 tədbir `0019` ilə ilkin tarixlə yaranır, `page_id` ilə CMS səhifəsinə bağlıdır; kart və detal ünvanı səhifəni açır, axtarışda yalnız səhifə çıxır. Səhifələr ağacda qalır, menyular alt ağacı gizlədir (`isEventsNode`).
- **Bölmə silinməsi:** tədbirdə işlənirsə 409.

### 5.3 Qanunvericilik bazası

- `law_categories` (sort, aktiv, ad) → `laws` (`category_id` RESTRICT, `type` 1 = qanun / 2 = normativ akt, status, `published_at`, soft delete) → tərcümə `title`, `slug`, `description` (rich text) → fayllar.
- **Admin:** kateqoriya + status filtri; kateqoriya mövcud olmalıdır; PUT ən azı bir tərcümə tələb edir; başlıq dəyişəndə slug dəyişir. İstifadə olunan kateqoriya silinmir (409 — soft-deleted qanunlar da sayılır).
- **Public API:** `/laws?categoryId&type&page` (`published`, `PublishedAt` NULL və ya ≤ now), `/laws/{slug}`, `/law-categories` (aktiv + tərcüməli).
- **Public sayt:** `/laws` (2 select + səhifələmə), `/laws/[slug]`.

### 5.4 MEAS / ESİD — emitentlərin məlumat açıqlamaları

- Lookup-lar: `meas_emitents`, `meas_info_types` (aktiv + ad tərcüməsi). İstifadə olunan lookup silinmir (409).
- `meas_documents`: emitent*, məlumat tipi*, `reg_date`*, `dqn` (dövlət qeydiyyat nömrəsi), fayl (`media_id`), status, soft delete. **Tərcümə olunmur, `published_at` yoxdur.**
- **Admin:** axtarış (yalnız `dqn`), emitent/tip/status filtrləri, `reg_date DESC`. MEAS meneceri üçün heç bir xüsusi məhdudiyyət yoxdur.
- **Public API:** `/meas?emitentId&infoTypeId&page` — yalnız `published`; `reg_date DESC, id DESC`; element: `{ id, regDate, dqn, emitentName, infoTypeName, fileUrl }`. `/meas-emitents`, `/meas-info-types`.
- **Public sayt:** `/securities` — cədvəl (tarix, DQN, emitent, tip, fayl yükləmə). 3 sorğu `Promise.all`-dadır — biri düşsə bütün səhifə xəta göstərir.

### 5.5 Milli pul nişanları (əskinas və sikkələr)

- Kateqoriyalar → `money_marks`: kateqoriya, `type` (1 = əskinas, 2 = sikkə), ön/arxa şəkil, sort, status; tərcümə `title`, `slug`, `description`, `security_features` (təhlükəsizlik əlamətləri, rich text).
- `money_mark_news`: status, `published_at`, `title`, `slug`, `content`.
- **Admin:** tip/kateqoriya/status filtrləri; başlıq dəyişəndə slug dəyişir; tip 1/2 ilə məhdudlaşdırılmır.
- **Public API:** `/money-marks?type&categoryId` (səhifələnmir), `/money-marks/{slug}`, `/money-mark-categories`, `/money-mark-news` (`PublishedAt` NULL gizli).
- **Public sayt:** `/national-currency?type&categoryId` (default əskinas), detal (ön/arxa şəkil, təhlükəsizlik əlamətləri tabı yalnız HTML varsa), `/national-currency/news`. ⚠️ Slug-ı `news` olan pul nişanı statik route tərəfindən kölgələnir.

### 5.6 Təşkilat — rəhbərlik, bölmələr, ərazi idarələri

- `organization_staff`: `type` (1 = İdarə Heyəti, 2 = rəhbərlik), telefon, foto, sort, aktiv; tərcümə `full_name`, `position`, `reception_days` (qəbul günləri), `bio`.
- `organization_divisions`: ad, təsvir, media (public API media-nı ötürmür).
- `organization_offices`: ad, ünvan, telefon (tərcümədə).
- **Admin:** hamısı hard delete; staff `type` tələb olunmur (null göndərilə bilər).

**Public sayt** — bütün təşkilat səhifələri "Haqqımızda" şablonundadır (§5.1). Menyu və breadcrumb CMS ağacındakı node-ların `navUrl`-i ilə bağlanır (`/organization?section=…`, dəqiq sətir uyğunluğu — `entities/page-node/lib/tree.ts:42-47`). Bölmə tab düymələri yoxdur — keçid sol menyudandır.

- `/organization?section=board|management|divisions|offices` (default `board`) — yalnız seçilmiş bölmənin sorğusu + ağac; başlıq tərcümə faylından. Sorğu düşsə xəta vəziyyəti, boşdursa "Bu bölmə üçün məlumat yoxdur".
  - **İdarə Heyəti:** sıralamada **birinci** üzv **sədrdir** (ayrı böyük kart), qalanları müavinlər. API-də "sədr" bayrağı yoxdur — sıra redaktorun nəzarətindədir (`features/organization/model/schemas.ts:42-45`).
  - **Rəhbərlik:** kart şəbəkəsi; foto yoxdursa ad inisialları.
  - **Struktur bölmələr** (`views/organization/loader.ts:138-151`): şöbələr, `navUrl = /organization?section=divisions` olan CMS səhifəsi və struktur sxemi paralel oxunur. **Sxemdə görünən kart varsa** interaktiv sxem (§5.6a) + kuratora tabe qeydi + CMS səhifəsinin faylları (əsasnamələr) göstərilir, CMS şəkli və düz şöbə siyahısı yox (`views/organization/index.tsx:118`). **Kart yoxdursa** (və ya sxem sorğusu düşübsə — `[]`) köhnə görünüş: CMS səhifəsinin məzmunu və faylları, məzmundakı **ilk şəkil** (təşkilati sxem) yeni tabda tam ölçüdə açılır; fayllar sətir-sətir (ikon, ad, ölçü), qrup varsa accordion; altda şöbələrin **yalnız adları** — hər biri şöbə səhifəsinə link. CMS səhifəsi tapılmasa bu hissə səssizcə göstərilmir.
  - **Ərazi idarələri:** ad, ünvan, telefon (`tel:`).
  - **`&copy=1`** — "(Kopya)" variantı: menyu/breadcrumb və Struktur bölmələrin CMS məzmunu Kopya alt ağacından; əməkdaş/şöbə məlumatı eynidir. ⚠️ Kopya kontekstindən bioqrafiya/şöbə səhifəsinə keçəndə `copy=1` itir.
- `/organization/divisions/[id]` — **şöbə səhifəsi** (`views/division/loader.ts`): tək şöbə endpoint-i yoxdur — bütün siyahı alınıb id ilə tapılır; tapılmasa 404, API xətası → xəta səhifəsi. Təsvirdəki `Etiket: dəyər` paraqrafları (etiket ≤ 40 simvol, məs. `Direktor: Ad Soyad`) məlumat kartında cüt kimi göstərilir (`about-content/model/parse.ts:306-323`); qalanı adi mətn. Şöbənin media faylı göstərilmir.
- `/organization/staff/detail/[id]` — **bioqrafiya**: başlıq kartı (foto/inisial, ad, vəzifə, qəbul günləri, telefon); `type ≠ 2` olan hər kəs (null daxil) İdarə Heyəti sayılır. Bio-da yuxarı səviyyədə "yalnız qalın" paraqraf bölmə başlığına (`h2`) çevrilir. ⚠️ İstənilən server xətası 404 kimi göstərilir.

### 5.6a Təşkilati struktur sxemi (spec 027, spec 060)

Köhnə saytın şəkil/SVG sxeminin əvəzi: kartlardan qurulan, kliklənən sxem. Məlumat `org_chart_nodes` (+tr) və `org_chart_node_details`-dir (§3.1); panel bölməsi "Təşkilat → Struktur sxemi" (`/organization/chart`). Redaktor təlimatı `dokumentasiyalar/struktur-sxemi-guide.md`.

- **Node:** `kind` 1 sədr, 2 müavin, 3 baş direktor, 4 blok, 5 departament, 6 qrup (qrup hər qaydada blokdur); `parent_id` (ağac), `sort_order` (qardaşlar arasında), `is_active`, `curator_direct` (`*` + qeyd); əməkdaşa **və ya** şöbəyə bağlı ola bilər (ikisi birlikdə 400, DB-də CHECK), tərcümədə `title`/`subtitle` bağlı qeydin adını/vəzifəsini əvəz edir. Bağlanmayan node-un ən azı bir dildə `title`-ı olmalıdır (400).
- **Admin API** (`api-cbar-admin/src/Cbar.AdminApi/Controllers/OrgChartController.cs`): `GET/POST /organization/chart`, `GET/PUT/DELETE /{id}` — hard delete, uşağı olan node 409; valideyn dövrü (özünə və ya nəslinə) 400. `PUT /{id}` sıraya toxunmur, `PUT` payload-da olmayan dilin tərcüməsini silir. `PUT /order` `{ parentId, ids }` (spec 060) — `ids` həmin valideynin **bütün** uşaqları (deaktivlər də), hər biri bir dəfə, yoxsa 400; naməlum `parentId` 404; `sort_order = 1…n`, audit `org_chart_nodes.reorder`. `departmentsOpen` (`null` = saxlanmış dəyər; `true` yalnız növ 4/6, yoxsa 400 — `ValidateDepartmentsOpen`) yoldaş cədvələ yazılır, `false` yeni sətir yaratmır. `PUT /layout` (spec 027 canvas koordinatları) **köhnəlib** — route qalır, panel çağırmır.
- **Public API** (`api-cbar/.../OrganizationController.cs` `GetChart`, `GET /organization/chart?locale=`): düz siyahı `sort_order, id` ilə. Node atılır: `is_active = false`, bağlı əməkdaş/şöbə deaktiv, həmin dildə adı yoxdur (`title ?? fullName ?? name`) — və **bütün nəsli ilə** atılır, ona görə hər `parentId` siyahıdakı node-dur. `role = subtitle ?? position`; `link` yalnız bağlı qeydin həmin dildə tərcüməsi varsa. `departmentsOpen` yalnız növ 4/6 üçün `true` ola bilər. `layout`/`connector` hələ göndərilir, sayt oxumur.
- **Sayt, desktop (≥1360, spec 060):** koordinat yoxdur — yer **növdən və valideynin növündən** çıxır (`web-cbar-new/src/entities/org-chart/model/layout.ts` `buildChartLayout`, saf funksiya; qaydalar L1–L11 `specs/060-org-chart-auto-layout/contracts/layout-rules.md`): sədr yuxarıda, sədrin departamentləri sağında siyahı, sədrin baş direktorları solda ayrıca sütun ("L" xətti), müavinlər bir sırada (müavinə tabe müavin valideyninin sağında, valideyn yuxarı qalxır), müavinin baş direktorları və birbaşa blokları 68 px sütunlar, müavinə birbaşa tabe departamentlər sağda "yan departamentlər", baş direktorun blokları sütunda altında. Ölçülər Figma-dandır (`CHART`); kartın hündürlüyü mətnindən, altdakılar sürüşür. Sədrsiz köklər sxemin altında sütun kimi (heç nə itmir). Enli sxem öz daxilində üfüqi sürüşür (fokuslanan region).
- **Blokun departamentləri:** `departmentsOpen = false` (defolt) → blok native `<details>` (JS-siz, klaviatura ilə açılır), **blokun öz səhifəsinə desktop-da keçid yoxdur**, açıq siyahı yalnız öz sütununu uzadır; `true` → departamentlər klik olmadan altında, blok kartı keçiddir. Bu dildə görünən departamenti olmayan blok adi kartdır. Server Component, client JS yoxdur.
- **Sayt, planşet/mobil (spec 027):** alt-alta ağac (`widgets/org-chart/org-chart-tree.tsx`), blok açılan siyahıdır, blokun səhifəsi siyahının birinci sətridir; `departmentsOpen` burada təsirsizdir.
- **Panel** (`web-cbar-admin-new/src/features/org-chart/`): ağac siyahısı; "Sıranı dəyiş" (ən azı iki uşağı olan kartda və köklər üçün; generik `ReorderDialog`, hər hərəkət dərhal saxlanır, xətada geri qayıdır); formda "Sıra" sahəsi yoxdur — yeni kart və valideyni dəyişən kart qardaşlarının sonuna (`max + 1`) düşür, redaktə saxlanmış sıranı göndərir; blok/qrupda "Departamentlər: açılan siyahı / həmişə açıq"; "Saytda bax" (`VITE_SITE_URL`, boşdursa yoxdur). Canvas redaktoru (spec 027) silinib.
- **Paneldə sxem (US4):** "Siyahı | Sxem" görünüşləri, `?view=chart&locale=az|en`. Sxem saytın desktop sxemidir — **eyni düzülüş kodu** (`web-cbar-admin-new/src/features/org-chart/chart/` saytın `entities/org-chart/constants.ts` + `model/layout.ts`-inin bayt-bayt nüsxəsi, `check:chart-layout` hər iki `verify`-da) və saytın API süzgəcinin təkrarı (`model/chart-view.ts`: deaktiv kart, deaktiv əməkdaş/şöbə, dildə adsız — nəsli ilə; deaktivlik staff/şöbə siyahılarından). Karta klik redaktə formunu açır (açılan siyahılı blok yalnız açılır), saxlamadan sonra sxem yenilənir — saytın 10 s keşi yoxdur. Sayt iframe-də açılmır (`X-Frame-Options: DENY`). ⚠️ Render saytın `widgets/org-chart`-ının əl portudur, yoxlanmır — saytda kart görünüşü dəyişəndə paneldə də dəyişməlidir.
- **Niyə:** koordinatlar redaktordan asılı idi və canvas-da yeri olmayan departament desktop-da görünmürdü; indi quruluş yalnız mənaya (valideyn, növ, sıra) bağlıdır. Qiyməti: Figma-da olmayan quruluş paneldən qurulmur, koda qayda əlavə olunur.

### 5.7 Multimedia

- **Qalereyalar:** `event_date`, sort, aktiv, soft delete, başlıq; şəkillər `gallery_images` (media, sıra). Status yoxdur — `is_active`.
  - Admin: şəkil əlavə (`POST /{id}/images`, eyni şəkil 409), sıralama (`PUT /order` — tam siyahı), silmə.
  - Public: `/galleries` (aktiv + dildə tərcümə; `sort, event_date DESC` — tarixsiz qalereya `DESC`-də NULL kimi **əvvələ** düşür; `{ title, eventDate, imageCount, coverUrl }`), `/galleries/{id}` — deaktiv və ya **dildə tərcüməsi olmayan** qalereya 404-dür (spec 035; əvvəl `title: null` ilə 200 qaytarırdı) (`api-cbar/src/Cbar.WebApi/Controllers/MediaContentController.cs`).
  - Filtr (spec 035): `q` — dildəki başlıqda böyük-kiçik hərfə həssas olmayan alt-sətir (`ILIKE`, trim, `%`/`_`/`\` hərfi mənada, 200 simvoldan uzun → 400); `from`/`to` — `event_date` üzrə, hər iki uc daxil; tarixsiz qalereya filtr qoyulanda düşür.
- **Videolar:** `youtube_url`*, `published_at` (embargo deyil), sort, aktiv, soft delete.
  - Public: `/videos` (`sort, published_at DESC`), eyni `q`; `from`/`to` — `published_at`-ın **Bakı günü** (UTC+4, `[from 00:00, to+1 00:00)`); tarixsiz video filtrdə düşür. `/videos/{id}` (spec 035) — aktiv + dildə tərcümə, yoxdursa 404.
- **Canlı yayımlar:** `video_streams` — `stream_url` (admin yalnız YouTube hostlarını qəbul edir), `is_live`, `starts_at`. Bir neçə yayım eyni anda `is_live` ola bilər. Admin siyahısında toggle.
  - Public sayt: ilk etibarlı YouTube id-li canlı yayım header-də düymə + popup (youtube-nocookie); bağlanması sessionStorage-də yadda qalır (açar `yayım id + səhifə yolu`, `shared/lib/popup-dismissal.ts` — şəkilli popup da eyni qaydanı işlədir, §6). Canlı yayım popup-ı şəkilli popup-dan **əvvəl** gəlir.
- **Public sayt** (spec 035, `web-cbar-new/src/views/media-gallery-list/`): `/media` yalnız CMS giriş səhifəsidir. `/media/galleries` və `/media/videos` — bir "Qalereya" səhifəsi, "Fotoqalereya" / "Videoqalereya" link tabları (keçid filtrləri sıfırlayır), GET filtr forması (`q`, `from`, `to`; yanlış dəyər API-yə getmir), 9 kart/səhifə, **səhifələmə** filtrləri saxlayır. Filtrli boş nəticə "Heç nə tapılmadı", filtrsiz boş siyahı "… tapılmadı". Video kartı saytdakı `/media/videos/[id]`-yə aparır (əvvəl birbaşa YouTube-a); önizləmə YouTube CDN-indən (`hqdefault`). Video siyahısında canlı yayım kartı **yoxdur** — canlı yayım yalnız header düyməsindədir.
  - `/media/galleries/[id]`: başlıq + fotoqalereya (böyük şəkil, miniatürlər, ox düymələri), tarix göstərilmir. `/media/videos/[id]`: başlıq + örtük, klikdə `youtube-nocookie` iframe (autoplay); o vaxta qədər YouTube-dan yalnız önizləmə yüklənir. YouTube olmayan keçiddə pleyer yoxdur, "YouTube-da izlə" linki. Hər iki detal 404 verəndə "Səhifə tapılmadı" (status 200 — streaming, §12 #49).

---

## 6. Ana səhifə

**Public API bir aqreqat endpoint qaytarır** — `GET /api/v1/homepage?locale`:

| Blok | Filtr | Sıra | Sahələr |
|---|---|---|---|
| `banners` | aktiv; `StartsAt` NULL və ya ≤ now; `EndsAt` NULL və ya ≥ now; tərcüməli | sort, id | title, link, description, imageUrl |
| `newsSlider` | aktiv, tərcüməli (tarix pəncərəsi yoxdur) | sort, `NewsDate DESC` | title, description, link, imageUrl, newsDate |
| `runningLines` (qaçan sətir) | aktiv + Starts/Ends pəncərəsi | id | `string[]` |
| `links` (faydalı linklər) | aktiv, tərcüməli | sort, id | title, url |
| `publications` | aktiv, tərcüməli | sort, `PublishedAt DESC` | title, url, imageUrl, publishedAt |
| `infoLines` | aktiv, tərcüməli | alias, sort, id | qruplaşdırılmış, hər sətirdə `updatedAt` (§4.5) |

**Public sayt ana səhifəsi** (`web-cbar-new/src/views/home/`, spec 022 Figma redizaynı) — hər sorğuda serverdə qurulur, API cavabları 10 san keşlənir (§2.8).

**Sorğular** (`views/home/loader.ts:149-174`) — birinci dalğa paralel, hər biri müstəqil:

| Sorğu | Blok |
|---|---|
| `/homepage` | slayder, faiz dəhlizi, İcmal tablarının info-line panelləri, promo banner |
| `/currencies` | AZN kartı |
| `/press-releases` `type=1`, 4 ədəd | Media → Xəbərlər |
| `/press-releases` `type=2`, 4 ədəd | Media → Elanlar |
| `/inflation`, `/inflation/settings` | inflyasiya kartı |
| `/azir?from=bu gün−60` (bütün term-lər) | Pul bazarı tabı |
| `/galleries`, 4 ədəd | Media → Qalereya |
| `/yield-curves/latest` | Gəlirlilik əyrisi tabı |
| `/videos` | **göndərilmir** — video tabı gizlidir |

İkinci dalğa yalnız əvvəlki məzənnə vərəqidir (D-1…D-5, trend oxları üçün); əvvəlki "aparıcı xəbər" sorğusu çıxıb.

**Blokların görünməsi bir yerdən idarə olunur** — `views/home/blocks.ts` (`HOME_BLOCKS`). Gizli: nəşrlər, faydalı linklər, sürətli keçidlər, video tabı (komponent və data yerindədir). Açıq: Elanlar tabı, "Strategiya və sənədlər", "Təqvim".

**Tərkib və sıra** (`views/home/index.tsx`):

1. **Birinci ekran:** solda xəbər slayderi, sağda üç kart — AZN məzənnəsi → İnflyasiya → Faiz dəhlizi.
   - Desktop-da sıra Figma ölçüsündə (744 px) qurulur və bütövlükdə ekrana miqyaslanır (`public/scripts/hero-scale.js`): miqyas = qalan hündürlük / 744, kartlar ekran eninin 40%-indən enli olmur, minimum 0.5; JS-siz 1. Skript sinxrondur və hər səhifədə yüklənir (`shell/site-shell.tsx:62`).
   - **Slayder** (`widgets/hero-slider/hero-slider.tsx`): `newsSlider` — şəkil, başlıq (≤ 3 sətir), təsvir (≤ 2 sətir), "Ətraflı"; linki boş slayd `/press-releases`-ə aparır; 6 san-dən bir keçir, `prefers-reduced-motion`-da dayanır; birdən çox slaydda `1/N` və oxlar. ⚠️ Slaydın tarixi hesablanır, amma **göstərilmir** (`loader.ts:188`).
   - **AZN kartı:** `showOnHomepage` valyutaları — nominal + kod, məzənnə (4 onluq), əvvəlki vərəqə görə ↑/↓/•; tarix = vərəqin tarixi; başlıq `/currencies`-ə keçid.
   - **İnflyasiya kartı** — §4.3. **Faiz dəhlizi kartı** — üç qutu, tarix = `updatedAt` (§4.5).
2. **"İcmal göstəricilər"** tabları (ilk mövcud tab açıq): Monetar → Gəlirlilik əyrisi → Pul bazarı → Mərkəzi Bankın notları → Maliyyə sektoru. Hər panel: başlıq (+ tarix), məzmun, "Daha ətraflı" (`/statistics`; Pul bazarı `/statistics/azir`). Datası olmayan tab gizlənir.
   - **Gəlirlilik əyrisi** — §4.4.
   - **Pul bazarı** (`widgets/home-cards/statistics-panels.tsx:219-273`): son tarixin 1D AZIR dəyəri (ehtiyat plandırsa `*` + footnote), `30D/90D/180D` qutuları (data varsa), son 60 günün 1D qrafiki (ən azı 2 nöqtə).
3. **Media** (`widgets/home-cards/news-tabs.tsx`): Xəbərlər · Elanlar · Qalereya, hər tabda 4 kart; boş tab göstərilmir. "Bütün xəbərlər" → `/press-releases` (bütün növlər — tab isə yalnız `type 1`), "Bütün elanlar" → `/press-releases?type=2`, "Bütün qalereya" → `/media`.
4. **Promo banner** (`loader.ts:348-357`): **`description`-u dolu birinci** CMS banneri; şəkli varsa tam şəkilli (1320×220), yoxdursa teal kart. Linki `coin.e-cbar.az` olan şəkilsiz bannerə statik `/site/home/coin-banner.png` qoyulur. Təsvirsiz bannerlər "faydalı linklər" sayılır — o blok gizlidir. ⚠️ Admin API banner `description`-unu qəbul etmir (`api-cbar-admin/.../BannersController.cs:11`) — promo yalnız DB-yə birbaşa yazılmış təsvirlə çıxır, adi CMS bannerləri saytda görünmür.
5. **"Strategiya və sənədlər" | "Təqvim"** — ikisi də API-dəndir (spec 057, spec 034); hər ikisi boşdursa sıra çəkilmir (`views/home/index.tsx:190`).
   - **Strategiya və sənədlər** (spec 057, `widgets/home-cards/strategy-docs.tsx`): `/homepage`-in `strategyDocs` sahəsi — ayrıca sorğu yoxdur. `api-cbar` (`HomepageController.cs:102-141`) yalnız **dərc olunmuş, silinməmiş, həmin dildə başlığı olan və həmin dildə işləyən keçidi olan** sənədləri sıra ilə verir. Keçid (`StrategyDocLinks.Href`): dilin `url`-u (mütləq `http(s)://` və ya sayt yolu) **səhifədən üstündür**; yoxdursa bağlı səhifənin həmin dildəki slug-ı — yalnız səhifə dərc olunub, aktivdir və həmin dildə göstərilirsə (`GetBySlug` filtri). Keçidi olmayan sənəd həmin dildə düşür. Üz qabığı dilinki, yoxdursa digər dilinki, o da yoxdursa boz fon (`StrategyDocLinks.Cover`). Sayt ilk **3**-ü götürür (`STRATEGY_DOCS_MAX`, `loader.ts`), birincisi böyük kartdır (424 px), qalanı kiçik kart + qısa mətn; sayt yoluna dil prefiksini sayt əlavə edir, xarici ünvan yeni tabda açılır (`SmartLink`). Sənəd yoxdursa blok görünmür; `/homepage` xətasında siyahı boşdur. `.default([])`: `strategyDocs`-suz köhnə API-də blok sadəcə gizlənir.
   - Deploy-da `0044` əvvəlki üç kod sənədini ("2024-2026-cı illərdə maliyyə sektorunun inkişaf Strategiyası", "Risk əsaslı nəzarət üzrə Siyasət Konsepsiyası", "Mikromaliyyə Modeli üzrə Strateji Çərçivə") səhifələrə (104, 66, 76) bağlı yazır; **üz qabıqları yoxdur** — redaktor `specs/057-homepage-strategy-docs/assets/`-dəki iki şəkli yükləyib seçməlidir, böyük kartın şəkli dizayndan gəlir.
   - **Strategiya səhifəsi** (104, `maliyye-sektorunun-inkisaf-strategiyasi` / `financial-sector-development-strategy`): köhnə `/pages/strategy`-nin sədr müraciəti (portret, mətn, sağa düzlənmiş imza, PDF linkləri) bir dəfəlik `tools/media-backfill/import-strategy-page.mjs` ilə səhifə mətninə yazılır: fayllar köhnə saytdan endirilir (sha256 ilə dedup), mətn yalnız səhifə hələ 105-in (alt səhifəsi) nüsxəsidirsə yazılır — redaktorun dəyişdirdiyi mətnə toxunulmur, təkrar icra heç nə yazmır. Sonra redaktor onu adi səhifə kimi dəyişir. Köhnə PDF lightbox-u (desktop iframe) yoxdur — PDF brauzerdə açılır. Portret sağda, telefonda (< 744) tam enlidir: bu, bütün CMS səhifələrinə aid ümumi qaydadır — sağa / mərkəzə düzlənmiş abzasın şəkli `app/cms-content.css`-də auto inline margin alır (Tailwind preflight `img`-i blok edir və `text-align` onu tərpətmir; T061, 2026-11-24).
   - **Təqvim** (`widgets/home-cards/event-calendar.tsx`): başlanğıc tarixinə görə ən yeni 3 tədbir, keçmiş və ya gələcək (`GET /events?sort=newest&pageSize=3`, spec 059). Spec 059-a qədər ən yaxın 3 gələcək tədbir idi, gələcək tədbir olmayanda blok gizlənirdi. Bütün sətir tədbirin səhifəsinə tək linkdir (klaviaturada sətir başına bir dayanacaq). Köhnə tədbir CMS səhifəsini açır. "Təqvim" başlığı `/media/events`-ə aparır. Nişan tədbir növüdür. Tədbir yoxdursa və ya sorğu uğursuzdursa blok görünmür.
6. Gizli bloklar — nəşrlər, faydalı linklər, sürətli keçidlər: data `/homepage`-dən gəlir, render olunmur.

**Boş / xəta vəziyyətləri:** datası olmayan blok göstərilmir. `ErrorState` göstərənlər: slayder sahəsi (`/homepage` xətası), AZN kartı, inflyasiya kartı (yalnız seriya xətası), Gəlirlilik əyrisi və Pul bazarı tabları, Media (yalnız Xəbərlər xəta verib heç bir tab dolmayanda). ⚠️ `/homepage` düşəndə faiz dəhlizi, Monetar, Notlar, Maliyyə sektoru və promo **səssizcə yox olur**; Elanlar/Qalereya xətası da səssizdir.

- ⚠️ `runningLines` parse olunur, amma **göstərilmir** (axtarılıb: yalnız `features/homepage/model/schemas.ts:56`).
- **Admin "Strategiya və sənədlər"** (`/homepage-blocks/strategy-docs`, `HomepageStrategyDocsController`, qaydalar `Validation/StrategyDocRules.cs`): status yalnız «Dərc olunub» / «Qaralama»; başlıq ən azı bir dildə (≤ 300), qısa mətn ≤ 500, ünvan ≤ 1000 və `http(s)://` və ya `/` ilə (`//host`, `javascript:` yox — popup və yayım qrafiki ilə ortaq `ContentSupport.IsAllowedLink`); üz qabığı mövcud `image/*` media; **ya səhifə, ya da başlıqlı dildə ünvan** məcburidir, səhifə mövcud olmalıdır. Başlıqsız dil saxlanılmır (göndərilməyən dil silinir). Yeni sənəd sona düşür; sıra yalnız «Sıranı dəyiş» dialoqundan (`PUT /order`, bütün silinməmiş id-lər bir dəfə). Silmə **soft** (`deleted_at`), audit-ə yazılır. Siyahıda «Keçid işləmir» nişanı (`linkBroken`): heç bir başlıqlı dildə nə ünvan, nə də saytın göstərdiyi səhifə var. İcazələr `homepage_strategy_docs.read|create|update|delete`.
- **Admin:** hər blok ayrıca ekran (`/homepage-blocks` hub-u, 7 kart). Banner üçün şəkil və ya ən azı bir tərcümə tələb olunur (`BannersController.cs:52`), amma tərcümə sahələri boş ola bilər; başlama ≤ bitmə tarixi və URL formatı yoxlanılmır. Banner `description` sahəsi admin API-də işlənmir.

**Şəkilli popup** (spec 009) — yalnız ana səhifədə yox, **saytın hər səhifəsində** modal kimi açılan elan şəkli. Köhnə saytdakı kodda sabit "sorğu popup-ı"nın CMS-dən idarə olunan əvəzidir.

- **Məlumat:** başlıq (yalnız admin üçün), aktivlik, `activated_at`; hər dil üçün ayrıca şəkil, link və alt mətn. Tarix pəncərəsi (başlama/bitmə) **yoxdur** — popup əl ilə deaktiv edilənə qədər görünür.
- **Hansı popup görünür** (`api-cbar/MediaContentController.cs:126`, `GET /api/v1/image-popups?locale`): aktiv popup-lardan **həmin dildə şəkli olan** (şəkil soft-deleted deyil) və `activated_at`-ı ən son olan — ən çox **bir** element (siyahı forması genişlənmə üçün saxlanılıb). Heç vaxt aktivləşdirilməmiş popup sona düşür.
- **`activated_at` qaydası** (`api-cbar-admin/ImagePopupsController.cs:53,85`): aktiv yaradılanda və hər **deaktiv → aktiv** keçidində indiki vaxt yazılır; aktiv popup-u redaktə etmək onu öndə gətirmir. Yəni köhnə popup-u yenidən aktivləşdirmək onu yenisinin qabağına çıxarır.
- **Admin validasiyası** (server, 400 problem details + `message`): başlıq məcburi (≤ 500); naməlum locale qəbul edilmir; **ən azı bir dildə şəkil** (frontend-də də eyni qayda); media mövcud olmalı və `image/*` olmalıdır; link boş, `http(s)://` və ya sayt daxili `/…` (`//host`, `javascript:` və s. rədd olunur, ≤ 1000); alt mətn ≤ 500. Boşluqlu dəyərlər `null`-a çevrilir. Silmə **hard delete**; hər əməliyyat audit-ə yazılır, `created_by` doldurulur.
- **Admin paneli** (`web-cbar-admin-new/src/features/image-popups/`): "Media" qrupunda ekran; siyahıda başlıq, şəkil adı, dillər, tarixlər; status sütunu klikləməklə aktiv/deaktiv edir (PATCH yoxdur — siyahı sətrindən tam `PUT` göndərilir).
- **Public sayt** (`web-cbar-new/src/widgets/image-popup/image-popup-dialog.tsx`): layout serverdə alır (10 san keş, §2.8, `media` tag-i; xəta → popup yoxdur). Qaydalar:
  - səhifə ilk dəfə açılanda çıxır; bağlananda `sessionStorage`-də `popup id + səhifə yolu` üçün qeyd yazılır — eyni səhifədə refresh-də çıxmır, başqa səhifədə yenə çıxır, yeni popup hər yerdə yenidən çıxır, yeni tab/sessiyada yenə çıxır;
  - **canlı yayım varsa növbə onundur:** şəkilli popup yalnız canlı yayım dialoqu açıq deyilsə və həmin səhifədə bağlanıbsa açılır;
  - linkə klik popup-u bağlayır; daxili linkdə hədəf səhifə üçün də qeyd yazılır (keçiddən sonra təkrar çıxmasın); xarici link yeni tabda açılır;
  - şəkil yüklənməsə popup qeyd yazılmadan bağlanır (boş çərçivə göstərilmir).

---

## 7. Naviqasiya, dil, axtarış, SEO

### 7.1 Menyular (`web-cbar-new/src/shell/`)

- Mənbə: `GET /pages/tree`, hər səhifədə `[locale]/layout.tsx`-dən, 10 san keş (§2.8). Ağac gəlməsə menyu boş qalır, səhifə yenə açılır.
- Link seçimi (`nav.ts:43-50`): `navUrl` (http → xarici, yeni pəncərədə) → `FEATURE_ROUTES` slug xəritəsi (`nav.ts:28-41`) → `/{locale}/{slug}`. Dərinlik 3 səviyyə (`nav.ts:23`).
- Footer `showInSideNav`-a baxmır. Header-in mega-menyusu, hamburger paneli və mobil menyu kökdən aşağıda `isInDropdownNav`-a baxır (spec 048,
  spec 054: `showInDropdownNav ?? showInSideNav !== false`, `shell/nav.ts` `toSection`) — §5.1 "Menyu yeri". `menuGroup` header-də hələ
  render olunmur (spec 055).
- **Header (spec 022)** — ekran eninə görə (breakpoint-lər `tab` 744, `lg` 1024, `desk` 1360):
  - **< 744:** tək tünd zolaq — loqo + hamburger. Çekmecədə (Sheet + akkordeon, 3 səviyyə): axtarış, dil, "Ana səhifə", bölmələr, aktiv yayım varsa "Canlı yayım", qaynar xətt **966**, E-CBAR (`mobile-nav.tsx`).
  - **≥ 744:** iki zolaq. Üstdə dilə görə loqo, Karyera / Media / Əlaqə keçidləri (CMS slug-ları kodda, `contacts.ts:31-35`; yalnız ≥ 1360), axtarış (≥ 768), "Canlı yayım", dil, E-CBAR. **Qaynar xətt header-də yoxdur** (Figma-da gizli) — yalnız mobil çekmecədə və footer-də. Altda tünd nav çubuğu.
  - **Nav çubuğu ≥ 1024** (spec 056, Figma `I813:25657;9:29`): ≥ 1360-da ilk **9** CMS kök bölməsi (`shell/constants.ts` `VISIBLE_SECTIONS`), 1024–1359-da ilk **8** (`VISIBLE_SECTIONS_NARROW` — 9 bölmə orada sığmır, ölçülüb; 9-cu hamburgerə keçir). Test ağacında: Haqqımızda, Pul siyasəti, Maliyyə sabitliyi, Bazar iştirakçıları, Hüquqi aktlar, Ödəniş sistemləri, Milli pul nişanları, Statistika, Nəşrlər və tədqiqatlar. Alt bölməsi olan bölmədə hover/fokusla mega-menu paneli (4 sütun: 2-ci səviyyə başlıq, 3-cü səviyyə siyahı) — **yalnız CSS ilə**, JS-siz işləyir. "Maliyyə sabitliyi"nin paneli Figma-da çəkilməyib, ağacdandır.
  - **"Bütün bölmələr" hamburgeri** (`nav-overflow.tsx`, əvvəlki "Daha çox"un yerinə), çubuğun birinci elementi: masaüstündə çubuğa sığmayan bölmələr (hamısı sığırsa gizli). ≥ 1360-da paneldən üç qrup çıxır (`mega-menu.tsx` `leavesWidePanel`): çubuqdakılar, üst zolaqda keçidi olanlar (Media, İnsan resursları; spec 042) və "menyularda yox" seçilmiş köklər (spec 056; seed `0042`: Strategiya, Yayım qrafiki, Sual-cavab, İstinadlar). Test ağacında panel Figma `1088:26873` kimidir: İstehlakçı hüquqları | Rəqəmsal maliyyə ekosistemi | Beynəlxalq əməkdaşlıq | Maliyyə savadlılığı + FinCERT + Naxçıvan (ilk üç bölmə sütun açır, `desk:break-before-column`; Firefox-da brauzer balansı). 1024–1359 paneli bayrağa baxmır; 744–1023-də çubuqda **yalnız hamburger**, paneldə bütün bölmələr. Panel 2 səviyyə göstərir — ⚠️ tabletdə 3-cü səviyyə menyudan görünmür. Siçan: hover açır, 200 ms gecikmə ilə bağlanır; toxunma: klik; klaviatura: `:focus-visible`, Escape bağlayır.
- **Footer (spec 022, `site-footer.tsx`):** loqo, 6 sosial şəbəkə (X hesabı dilə görə fərqli). Üç sütun:
  - **Əlaqə:** ünvan (Heydər Əliyev prospekti 167, AZ1029 — köhnə saytdakı kimi), qaynar xətt **(+994 12) 966**, telefon **(+994 12) 493 5058** (`contacts.ts:10-17`), "Onlayn müraciət" və "Sorğu platforması" düymələri. Mətbuat xətti göstərilmir (əlavə nömrə `contacts.ts:16`-da 2243-ə düzəldilib, istifadə olunmur).
  - **Naviqasiya:** CMS kök bölmələri **başlığa görə** seçilir, siyahı kodda sabitdir (Haqqımızda, Pul siyasəti, Maliyyə sabitliyi, Media, İnsan resursları, Statistika, Nəşrlər və tədqiqatlar, Sual-cavab — `nav.ts` `NAV_SECTION_TITLES`; spec 051 köhnə "Sual − cavab" başlığını da tanıyır, en-də "FAQ" / "Frequently asked questions" yalnız en səhifəsi olanda); heç biri tapılmasa ilk 6 kök bölmə.
  - **Faydalı linklər:** 8 sabit link (sorğu, MEAS, infobank, bizimpullar, edu, mpcr, azranking, dxr — `contacts.ts:42-88`).
  - "Məxfilik siyasəti" və "Saytın xəritəsi" **render olunmur** — hədəf səhifə yoxdur (`href: null`, `contacts.ts:96-97`).
- "Haqqımızda" şablonunun (spec 024) yan menyusu və breadcrumb-u bölməni **başlığa görə** tapır (`entities/page-node/lib/tree.ts:64-69`) — CMS-də adı dəyişsə səssizcə boş qalır.
- Sayt **yalnız açıq temadadır**: tema düyməsi, `ui-theme` cookie-si və `ui-store` spec 022 ilə silinib.

### 7.2 Dil

- `src/proxy.ts`: əvvəlcə **köhnə URL xəritəsi** (`legacyRedirect`, 308): `/[az|en/]indeks/rates` → `/{locale}/statistics/azir[/export]` (dil `?language=`-dən, sonra yol prefiksindən, sonra `az`; `d/m/Y` tarixlər ISO-ya çevrilir, səhv tarix və digər parametrlər atılır); köhnə qalereya/video yolları (spec 028), `page-72/*` və səhifə 130-un slug-ları → `/media/release-schedule` (spec 039); "Ümumi məlumat"ın slug-ları (`umumi-melumat` / `general-information`, düz və ya bölmə yolunun altında, `-copy` istisna) → bölmə kökü `/{locale}/maliyye-savadliligi|financial-literacy` (spec 047, `LITERACY_GENERAL_SLUGS`); istehlakçı hüquqları (spec 050, `consumerRedirect`): "Fəaliyyət istiqamətləri" → bölmə kökü, `infoqrafika` → statistika səhifəsinin `#infoqrafika` bloku, Sığorta şikayət indeksi → Bank səhifəsinin `?tab=insurance` tabı (`-copy` slug-ları istisna); köhnə FAQ `page-131/*` → `/{locale}/sual-cavab|faq` (spec 051, `LEGACY_FAQ_PAGE`); köhnə FinCERT `page-893/*` → `/{locale}/fincert` (spec 053, `LEGACY_FINCERT_PAGE`); spec 057: köhnə `/pages/strategy` → strategiya səhifəsi (104), `page-872/*` → risk əsaslı nəzarət konsepsiyası (66), `page-878/*` → mikromaliyyə çərçivəsi (76) (`LEGACY_PAGES`). Nöqtəli yol proxy-yə çatmır, ona görə köhnə kökdəki `/2024_2026_Azerbaijani.pdf` və `/2024_2026_English.pdf` `next.config.ts` `redirects()`-də (308) həmin dilin strategiya səhifəsinə gedir. Sonra prefiksiz yol → **307** `/az{yol}` (query saxlanılır). İstənilən 2 hərfli ilk seqment (`/ru`) keçir və 404 ilə bitir.
- Dil dəyişdirici yalnız locale seqmentini əvəz edir və query-ni saxlayır, tam səhifə yenilənməsi ilə (adi `<a>`, cookie yazmır; `language-switcher.tsx:24-34`).
- CMS səhifəsində slug digər dilə aiddirsə (`/en/sual-cavab`), `[...slug]/page.tsx` `findLocaleCounterpart` ilə səhifəni id ilə ağacda tapıb həmin dildəki
  ünvana yönləndirir (`/en/faq`); spec 051-dən query də saxlanılır (`?topic=`, `?sort=`, `views/cms-page/loader.ts` `withQuery`). Səhifənin həmin dildə
  versiyası yoxdursa 404.
- ⚠️ **Slug dillər arasında fərqli ola bilər**, amma dəyişdirici və `alternates.languages` eyni slug-ı güman edir → dil dəyişəndə tez-tez 404 və ya başqa səhifə. API digər dilin slug-ını qaytarmır. Header-in üst keçidləri bunu dilə görə kodda yazılmış slug-larla yan keçir (`contacts.ts:31-35`) — CMS-də slug dəyişsə 404.

### 7.3 Axtarış

- **Public API** — `GET /api/v1/search?q&locale` (`SearchController.cs`): `ILIKE`, LIKE simvolları escape olunur; hər tipdən max **12**, cəmi max **30**.

  | Tip | Nədə axtarır | URL |
  |---|---|---|
  | page | başlıq və ya **xam HTML** məzmun | `/{locale}/{slug}` |
  | press-release | başlıq (embargo ilə) | `/{locale}/press-releases/{slug}` |
  | law | başlıq | `/{locale}/laws/{slug}` |
  | money-mark | başlıq | `/{locale}/national-currency/{slug}` |
  | staff | ad-soyad | `/{locale}/organization/staff/detail/{id}` |

  Snippet: teqlər silinir, uyğunluğun ətrafında ±80 simvol (HTML entity-lər decode olunmur — `&nbsp;` görünə bilər). Menyudan gizli (`visible = false`) səhifələr axtarışda çıxmır.
- **Public sayt** — header-də adi GET forması (JS-siz işləyir) → `/search?q`: 200 simvoldan uzun sorğu boşa çevrilir, boş sorğu API-yə getmir; nəticələr tipə görə qruplaşdırılır; `noindex`; keşlənmir. ⚠️ Header axtarışı ≥ 768-də və < 744 çekmecəsində var — **744–767 enində axtarış sahəsi yoxdur** (`shell/site-header.tsx:47`, `:90`).
- Meilisearch docker-compose-da var, **kodda istifadə olunmur.**

### 7.4 SEO

- Hər səhifədə `title` (`%s | brend`), description (CMS səhifələrində 160 simvolluq çıxarış), `alternates.languages`.
- **Yoxdur:** `sitemap.xml`, `robots.txt`, OpenGraph/Twitter teqləri, canonical, RSS, veb analitika (axtarılıb: `og:|openGraph|twitter:|robots|sitemap|canonical`, `gtag|googletagmanager|metrika|analytics`; analitik cookie konstitusiya ilə qadağandır — `docs/cookies.md`).
- **Paylaşma/çap** (spec 024): yalnız "Haqqımızda" şablonundakı səhifələrdə (CMS "Haqqımızda" səhifələri, təşkilat, bölmə, əməkdaş) — Facebook, LinkedIn, WhatsApp, e-poçt, çap; adi linklər, kənar SDK yoxdur (`widgets/about-shell/share-buttons.tsx`). X/Twitter yoxdur. Mütləq ünvan `X-Forwarded-Host`/`Host`-dan qurulur (`server/page-url.ts`).

### 7.5 Əlçatanlıq vidceti

- CERT.az vidceti (`public/vendor/accw`), nonce ilə yüklənir.
- Admin-dən idarə olunur: `settings` açarı `accessibility.widget` = `{ "enabled": true }`. Public API yalnız bu açarı ağ siyahıya alır: `GET /api/v1/site-settings/accessibility-widget` → `{ enabled }` (xəta/format səhvi = `false`). Ayar 10 san keşlənir (§2.8).
- Vidcet açılanda `li`, `p`, `a`, `h1`–`h6` və s. elementlərə inline `transition: all` yazır (miqyas funksiyası). Saytın öz keçidləri bunu nəzərə almalıdır: spec 049 reveal keçidi buna görə `!important`-dır.

### 7.6 Scroll reveal və qrafiklərin gec yüklənməsi (spec 049)

Yalnız `web-cbar-new`; məzmun, URL, API və admin dəyişmir.

- **Qrafiklər** (`widgets/chart-card/chart.tsx`): ECharts kodu (~233 KB) qrafik görünən sahəyə bir ekran qalanda yüklənir (`LAZY_ROOT_MARGIN`). O vaxta qədər eyni hündürlükdə skeleton durur, səhifə tullanmır. `IntersectionObserver` olmayan brauzerdə dərhal yüklənir. Bugünkü səhifələrdə (`/statistics`, `/statistics/azir`) bütün qrafiklər ilk ~1.5 ekrandadır, ona görə praktikada yenə açılışda yüklənir; fayda daha aşağıda qrafiki olan səhifələrdədir.
- **Reveal** (`shared/ui/reveal.tsx`): "Haqqımızda"/şablon səhifələrinin blokları, xəbər/siyahı kartları və ana səhifənin hero-dan aşağı bölmələri scroll-da bir dəfə fade + 16 px sürüşmə ilə görünür (450 ms, kartlarda 60 ms addımla, ən çox 8 addım → hər şey 1 s-dən tez). Birinci ekran, header/menyular/footer/hero/dialoqlar animasiya olunmur.
- **Məzmun heç vaxt itmir:** server HTML-i həmişə görünən halı (`data-reveal="static"`) göndərir; JS-siz, robot, çap, "hərəkəti azalt" seçimi və klaviatura fokusu gizli blok qoymur.

---

## 8. Fayllar (media)

### 8.1 Yükləmə (admin)

- `POST /api/v1/media` (multipart), limit **250 000 000 bayt**. Fayl framework tərəfindən diskə spool olunur və oradan iki dəfə oxunur (hash, sonra MinIO) — yaddaşa köçürülmür (spec 019; köhnə `MemoryStream` faylın ~3.4 qatını tuturdu).
- İcazəli uzantılar (`Validation/MediaUploadRules.cs`): **jpg, jpeg, png, gif, webp, svg, pdf, xlsx, xls, docx, doc, zip, rar, xml.** MIME uzantıdan təyin olunur.
- **Məzmun imzası yoxlanılır** (ilk 1024 bayt, hash-dən əvvəl): uzantının iddia etdiyi format deyilsə 400 "File content does not match type". Tolerantlıqlar: raster şəkillər bir ailədir (JPEG `.png` adı ilə keçir), `.rar` 7-Zip-i də qəbul edir; xml/svg — BOM + boşluqdan sonra `<`; zip/docx/xlsx bir-birindən ayrılmır. Boş fayl → 400.
- **Fayl adı təmizlənir** (saxlanan və göstərilən ad): yalnız son yol seqmenti (`/` və `\`), idarəedici və **bidi** simvollar silinir (`report\u202Efdp.exe` hiyləsi), NFC (macOS-un parçalanmış `ş/ö/ç`-si axtarışda tapılsın), uzantı saxlanmaqla ≤ 255 kod nöqtəsi, boş qalarsa `file.ext`. Whitelist təmizlənmiş ada görə yoxlanılır.
- **SHA-256 ilə deduplikasiya:** eyni bayt artıq varsa (hətta soft-deleted — onda `media.restore` kimi bərpa olunur) mövcud qeyd köhnə adı ilə qaytarılır; bir neçə uyğun sətir varsa ən köhnə canlı sətir. Paralel eyni upload `storage_key` unique-inə dəyərsə, uduzan sorğu qalibin qeydini qaytarır.
- MinIO açarı: `yyyy/MM/{sha[..16]}{ext}` — məzmuna görə ünvanlanır.
- `width`/`height` doldurulmur; şəkil resize/emal yoxdur.
- **Ölçü düzəlişi** (spec 054, `Services/MediaSizeBackfillService.cs`): köhnə importda `size_bytes` saxta idi (1064/2008 bayt). Hosted servis
  `MigrationRunner`-dən sonra başlayır, startu bloklamır, `pg_try_advisory_lock` ilə yalnız bir instansda işləyir. `media_asset_details` sətri
  olmayan media sətirlərinin obyekt ölçüsünü MinIO-dan (`StatObject`) oxuyur, fərqlisini düzəldir və sətri yoxlanmış kimi qeyd edir — növbəti start
  onu yoxlamır. Obyekt yoxdursa sətir yenə qeyd olunur (`missing`); saxlama əlçatmazdırsa iş dayanır, heç nə yazılmır, növbəti startda təkrar
  olunur. Log: `media sizes: checked N, fixed M, missing K`. Yeni yükləmə (`UploadAsync`) öz detal sətrini yazır.
- **Silmə:** fayl hər hansı yerdə istifadə olunursa (səhifə/press-reliz/qanun faylları, MEAS, qalereya, banner, şəkilli popup, slayder, nəşr, bölmə, heyət fotosu, avatar, pul nişanı şəkilləri) → 409. Əks halda soft delete; MinIO-dakı obyekt **qalır.** ⚠️ Rich text HTML-in içindəki `/media/{id}` linkləri "istifadə" sayılmır.
- **Önizləmə** — `GET /api/v1/media/{id}/preview` (JWT ilə, `MediaController.cs:50`): yalnız `image/*`; digər tiplər MinIO-ya getmədən **415** (+`mimeType`) — panel bundan "ikon göstər" qərarını çıxarır. `ETag` = sha256, 304; `Cache-Control: private, max-age=31536000, immutable`; `nosniff` + sandbox CSP. Panel public `api-cbar`-a getmir, token URL-ə qoyulmur — şəkli blob kimi alır.
- **Admin media kitabxanası:** 24-lük siyahı, ada görə axtarış, progress ilə yükləmə, 409 banner kimi. Şəkillər üçün **kiçik önizləmə** (görünüş sahəsinə girəndə yüklənir, id üzrə keşdə), klikdə böyüdülmüş lightbox; qeyri-şəkil — MIME ikonu (`features/media/components/media-preview.tsx`). Eyni önizləmə media sahəsində, seçici dialoqda, qalereya şəkillərində və fayl bölmələrində. URL kopyalama və ad dəyişmə yoxdur, seçici dialoqdan yükləmək olmur.

### 8.2 Göstərmə (public)

- **Public API:** `GET /media/{id}` — MinIO-dan stream.
  - `ETag` = `"<sha256>"`; `If-None-Match` uyğun gəlirsə 304 (MinIO-ya getmədən).
  - `Cache-Control: public, max-age=31536000, immutable`; `Content-Disposition: inline`; `Content-Length` qəsdən yoxdur (köçürülmüş qeydlərdə `size_bytes` saxta idi; spec 054-dən admin API onları düzəldir, §8.1).
  - Hər tipə `X-Content-Type-Options: nosniff` + `Content-Security-Policy: default-src 'none'; style-src 'unsafe-inline'; sandbox` (spec 019) — birbaşa açılan SVG/XML skript işlətmir; `<img>` kimi yerləşdirməyə və PDF baxışına təsir etmir.
  - Obyekt yoxdur → 404.
- **Public sayt:** `/media/[id]` route handler — API-yə proxy (id yalnız rəqəm; şəbəkə xətası 502; digər xəta 404). Bütün JSON-larda media URL nisbi `"/media/{id}"` kimi gəlir.
- **Admin:** nginx-də və Vite-də `/media` proxy yoxdur — rich text redaktorunda şəkillər və linklər sınıq görünür.

### 8.3 MinIO konfiqurasiyası

- Hər iki API **`Minio` .NET client** istifadə edir (AWS SDK v4 chunked upload MinIO ilə uyğunsuzdur).
- `MediaStorage__Endpoint` sxemsiz (`host:port`) gəlirsə `UseSsl` sxemi təyin edir; `http://`/`https://` ilə gəlirsə URL qalib gəlir. Hər iki API-də eyni olmalıdır.
- Bucket yalnız Development-də avtomatik yaranır.
- Mühitlər: dev/test `cbar-media-test`, `UseSsl=true`; prod `cbar-media-prod`, `UseSsl=false` (TODO(devops)).

---

## 9. Admin panel: ekranlar, rollar, iş axınları

### 9.1 CRUD mühərriki

Ekranların çoxu `defineModule` konfiqindən generasiya olunur (`web-cbar-admin-new/src/shared/crud/types.ts`): siyahı + yeni + redaktə route-ları.

- **Sahə tipləri:** text, number, date, datetime, checkbox, select, richtext, media.
- **Siyahı:** 400 ms debounce ilə axtarış, modul filtrləri (select), silmədə təsdiq. Səhifələmə yalnız `paged` cavab tipində.
- **Forma:** az/en tabları; tapılmayan qeyd "notFound". Yadda saxlanmamış dəyişikliklə formadan çıxanda (siyahıya keçid, "Ləğv et", tabı bağlamaq)
  panel soruşur (spec 051, TanStack `useBlocker`, `features/crud/components/crud-form-page.tsx`); saxlama gedərkən (`crudSaveKey` mutasiyası) soruşmur.
- **İlkin dəyər URL-dən** (spec 051): `ModuleConfig.prefillFromSearch` sahələri yaratma formunda URL-dən dolur, siyahının "Yeni" düyməsi eyni adlı aktiv
  filtrləri ötürür (Sual-cavab: mövzu tabından "Yeni" → `/faq/new?topicId=`). Spec 052: `ModuleConfig.newSearch(rows, filters)` "Yeni"-yə
  siyahının sətirlərindən törənən sorğu əlavə edir (Aylıq hesabatlar: seriya tabında birinci sətrin növbəti ayı).
- **Sıralama:** `shared/ui/sortable-list.tsx` — sürüşdür-burax + yuxarı/aşağı düymələri (klaviatura yolu), `aria-live` elanı; FAQ-da hər hərəkət dərhal saxlanır.
- **Slug:** CRUD modullarında server generasiya edir — yalnız səhifə formunda redaktor yazır.
- **Tərcümə sinxronu (server):** payload-da olmayan dillər silinir (tam əvəzləmə).
- **Keş:** TanStack Query açarları `[modul]`, `[modul,'list',params]`, `[modul,'detail',id]`, `[modul,'options']`.
- **Xətalar:** `normalizeApiError` — ProblemDetails / ValidationProblemDetails / `{message}` → VALIDATION, AUTH, FORBIDDEN, NOT_FOUND, CONFLICT, SERVER, TIMEOUT, NETWORK, CONTRACT. Hər cavab Zod ilə yoxlanılır; uyğunsuzluq CONTRACT xətasıdır.

### 9.2 Ekranlar

| Ekran | API | Tələb olunan sahələr / xüsusi qaydalar |
|---|---|---|
| Səhifələr | `/pages` | §5.1 |
| Press-relizlər | `/press-releases` | başlıq |
| Qanunlar, kateqoriyalar | `/laws`, `/law-categories` | kateqoriya, başlıq / ad |
| MEAS sənədləri, emitentlər, tiplər | `/meas-documents`, `/meas-emitents`, `/meas-info-types` | emitent, tip, qeydiyyat tarixi / ad |
| Heyət, bölmələr, ərazi idarələri | `/organization/staff|divisions|offices` | ad-soyad / ad |
| Struktur sxemi | `/organization/chart`, `PUT /organization/chart/order` | növ; bağlı qeyd yoxdursa ad; sıra formda deyil, "Sıranı dəyiş"-dədir; "Departamentlər" yalnız blok/qrupda; "Sxem" görünüşü saytın desktop sxemini göstərir, karta klik formu açır (§5.6a) |
| Pul nişanları, kateqoriyalar, xəbərlər | `/money-marks`, `/money-mark-categories`, `/money-mark-news` | kateqoriya, başlıq |
| Qalereyalar | `/galleries` | başlıq; şəkil idarəsi |
| Videolar | `/videos` | YouTube URL (yalnız `http(s)://`), başlıq |
| Canlı yayımlar | `/video-streams` | başlıq, URL (YouTube hostları) |
| Şəkilli popup-lar | `/image-popups` | başlıq + ən azı bir dildə şəkil; link qaydası; siyahıda status toggle (§6) |
| Bannerlər | `/banners` | **heç nə** |
| Xəbər slayderi, qaçan sətir, linklər, nəşrlər | `/news-slider`, `/running-lines`, `/homepage-links`, `/homepage-publications` | tarix + başlıq; mətn; başlıq + url; başlıq |
| Info lines | `/info-lines` | alias (13 sabit), başlıq |
| AZIR | `/azir` | upsert kartı + "Excel-dən yüklə" (bankın gündəlik faylı, 409-da təsdiq, xülasə) (§4.2) |
| İnflyasiya | `/inflation`, `/inflation/settings` | upsert kartı + parametrlər kartı (§4.3) |
| Gəlirlilik əyrisi | `/yield-curves`, `/yield-curves/parameters`, `/yield-curves/periods` | 3 tab: siyahı + Excel importu + tarixə görə silmə, əl ilə forma yoxdur (§4.4) |
| Məzənnələr, valyutalar | `/currency-rates`, `/currencies` | §4.1 |
| Aylıq hesabatlar | `/monthly-reports` | §5.1g; seriya tabları, dövr sütunu (Sığorta 12 ay), dil nişanları və "Fayl silinib"; "Yeni" növbəti ayla |
| FinCERT: ümumi, istiqamətlər, üzvlüklər | `/fincert`, `/fincert/directions`, `/fincert/memberships` | §5.1h; tək qeyd forması (CRUD deyil; server sahə xətaları sahənin altında, çıxışda xəbərdarlıq), iki siyahı "Sıranı dəyiş" dialoqu ilə; loqo sahəsi yalnız şəkil, RFC faylı yalnız sənəd seçir. Səhifə 133-ün (və idarə olunan digər səhifələrin) formunda sol menyu bölmənin bəndini aktiv göstərir |
| İşçi məqalələri | `/working-papers` | §5.1i; nömrə + il, JEL, hər dildə başlıq + müəlliflər (vergüllü sahələr bir sətirdir), PDF yalnız sənəd; sahə xətası həmin dil tabında, 409 "Nömrə" sahəsinin altında |
| Sual-cavab: suallar, mövzular, videolar | `/faq/questions`, `/faq/topics`, `/faq/videos` | §5.1f; mövzu formunda suallar və bağlı səhifələr (dərhal saxlanır), siyahının üstündə "Sıranı dəyiş" |
| Media kitabxanası | `/media` | §8.1 |
| İstifadəçilər | `/users` | §9.3 |
| Parametrlər | `/settings` | açar (boşluqsuz) + JSON dəyər; eyni açarla "Yeni" səssizcə üstünə yazır. Server **yeni** açarı yalnız allowlist-dən qəbul edir (hazırda tək `accessibility.widget`, `Validation/KnownSettings.cs`), qalanı → 400 "Unknown setting key"; mövcud açarlar redaktə olunur. API-də `DELETE /settings/{key}` var, **paneldə silmə düyməsi yoxdur**. Yalnız admin |
| Dashboard | — | 3 statik placeholder kart (audit log daxil), məlumat yoxdur |

**Sol menyu** (spec 046, `web-cbar-admin-new/src/app/routes/nav.ts`): ekranlar saytın bölmələri üzrə, saytın üst menyusunun sırası ilə
qruplaşdırılıb — qrupsuz: İdarə paneli, Səhifələr, Media kitabxanası; "Haqqımızda" (Təşkilat, KSM layihələri); "Bazar iştirakçıları" (MEAS),
"Hüquqi aktlar" (Qanunlar), "Milli pul nişanları" (Pul nişanları) — tək ekranlı bölmə başlıqsız bənd kimi görünür; "Statistika" (Məzənnələr,
AZIR, İnflyasiya, Gəlirlik əyriləri); "Media" (Press relizlər, Tədbirlər, Yayım qrafiki, Qalereyalar, Videolar); "Beynəlxalq əməkdaşlıq"
(Maliyyə təşkilatları, Memorandumlar); "İstehlakçı hüquqları" (Aylıq hesabatlar, tək bənd, spec 052); "Nəşrlər və tədqiqatlar" (İşçi məqalələri, tək bənd, spec 054); "Sual-cavab" (tək bənd, spec 051); panelin öz qrupları "Ana səhifə" (bloklar, məlumat sətirləri, canlı yayımlar, şəkilli popup-lar) və
"İdarəetmə" (İstifadəçilər, Parametrlər). Qruplar açılıb-bağlanır, vəziyyət brauzerdə saxlanır (`nexus-ui`), ekrana gələndə onun qrupu açılır;
⌘K paleti eyni qrupları göstərir. Ünvanlar və icazələr dəyişməyib. Səhifə formunda cədvəli/kartları ayrıca bölmədən gələn səhifələr (121, 122,
KSM, 130, `sual-cavab`, 95, 96, 93 — spec 052, seriya süzgəci ilə —, `isci-meqaleler-silsilesi` — spec 054 — və `-copy` nüsxələri) üçün "Bu səhifənin məzmunu" kartı həmin bölməyə keçid verir; üzvlük səhifəsində (§5.1c) cədvəl qaydasını izah edir. FAQ mövzusuna
bağlı səhifənin formunda "Sual-cavab keçid kartı" həmin mövzuları göstərir (spec 051).

**Audit log ekranı yoxdur** — API-də `GET /audit-log` 2026-10-09-dan var (yalnız admin, §10.4), panel onu çağırmır.

**Panel icazəni serverdən oxumur:** `GET /me/permissions` və `GET /roles` çağırılmır, menyu və düymələr rola görə gizlədilmir — icazəsi olmayan rol ekranı açır, API 403 qaytarır, panel ümumi "icazə yoxdur" mətnini göstərir (§10.3).

### 9.3 İstifadəçilər və rollar

- **Rollar** (seed): `admin` (1), `moderator` (2), `meas_manager` (3). Rol → icazə matrisi §10.3-dədir; onu yalnız migration dəyişir. API-də `GET /roles` var (`roles.read`, yalnız admin), amma panel onu çağırmır — rol siyahısı frontend-də sabit id xəritəsidir (`entities/user/model/types.ts:31-36`).
- **İstifadəçi idarəsi yalnız admindir:** `users.*` kodları heç bir rola verilmir, admin onları kodda alır (`Controllers/UsersController.cs` — `[RequirePermission(users.*)]`); parol sıfırlama `users.update` sayılır.
- **Yaratma:** username*, email*, parol*, rol. Username/email unikallığı soft-deleted istifadəçilər daxil yoxlanılır (409; paralel yaratmada DB unique-i eyni 409 mətnini verir). Parol BCrypt (work factor 12 — `PasswordHashing.WorkFactor`, hər yerdə bir dəyər), audit-ə yazılmır.
- **Parol siyasəti:** min 8 simvol, böyük hərf, kiçik hərf, rəqəm, simvol (həm frontend, həm server).
- **Redaktə:** email, rol, aktivlik. **Son aktiv admini deaktiv etmək və ya rolunu endirmək → 409** (heç nə saxlanmır). Deaktivasiya access token-i dərhal (security stamp, §10.2) və bütün refresh token-ləri ləğv edir. Rol dəyişikliyi yalnız access token-i ləğv edir — panel refresh edib yeni rolla davam edir, sessiya qalır. Yenidən aktivləşdirmə login kilidini sıfırlayır.
- **Parol sıfırlama** (`PUT /users/{id}/password`) — bütün sessiyaları və access token-ləri ləğv edir, **login kilidini açır** (kilid xaricdən görünmür, kilidlənmiş redaktorun dəstək yolu budur).
- **Silmə:** özünü silmək → 409; son aktiv admini silmək → 409; soft delete + deaktiv + stamp rotasiyası + refresh token ləğvi.
- Yoxdur: username dəyişmək, istifadəçinin öz parolunu dəyişməsi. Başqa aktiv admin varsa admin özünü deaktiv edə / rolunu endirə bilər (server yalnız sonuncunu qoruyur).

### 9.4 Rich text redaktoru (TipTap)

- Extension-lar: StarterKit, **MediaLink** (`data-media-link`), **Accordion** (`<details data-accordion>`), TableKit, Image, **YouTube** (nocookie), **EmbedFrame** (ümumi `<iframe>`, `src` yoxlanılmır), TextAlign, rəng/highlight.
- Toolbar: qalın, kursiv, rəng, 4 düzləndirmə, H2/H3, siyahılar, girinti, sitat, akkordeon, cədvəl idarəsi, link, fayl, şəkil, formatı təmizlə, undo/redo, önizləmə, **HTML mənbə rejimi**, tam ekran. YouTube/iframe daxil etmə düyməsi yoxdur.
- **Qayda:** TipTap heç bir extension-un sahib çıxmadığı elementi **səssizcə silir.** Extension silmək köhnə cbar.az markup-ını redaktorun açıb saxladığı hər səhifədən silər. Buna görə `scripts/roundtrip-check.mjs` var — səhifələri redaktordan keçirib details/table/row/media link/image/iframe saylarını müqayisə edir (extension siyahısının öz nüsxəsi var — əl ilə sinxron).
- Önizləmə `sanitizeHtml` ilə. ⚠️ HTML mənbə rejimində saxlanılarsa textarea məzmunu **birbaşa, normallaşdırılmadan** (skriptlər daxil) göndərilir.

### 9.5 Əsas iş axınları

1. **Xəbər dərc etmək:** press-reliz yarat (status `draft`) → məzmun, fayllar → `published` + `publishedAt` (gələcək tarix = embargo) → public saytda ~10 san keşdən (+ bir yeniləmədən) sonra görünür (§2.8).
2. **Günün məzənnəsi:** "Yeni cədvəl" və ya "Excel-dən yüklə" → saxla → XML feed və JSON dərhal (public API keşsizdir), saytda ~10 san. Yazma, import və silmə `currency_rates.prepare` tələb edir (admin, moderator). Təsdiq addımı (four-eyes, `currency_rates.approve`) **planlaşdırılıb, kodda yoxdur** (spec 008 1b) — hazırlayan özü dərc edir.
3. **Yeni statik səhifə:** ağacda valideyn seç → "Uşaq əlavə et" → hər iki dildə başlıq/slug/məzmun → `published`, `active`, `visible`, `show_az/en` → menyuda ~10 san ərzində.
4. **Ana səhifə kartı yeniləmək:** info lines-da alias üzrə sətri dəyiş.
5. **MEAS açıqlaması:** faylı media-ya yüklə → MEAS sənədi yarat (emitent, tip, tarix, DQN, fayl) → `published`. `meas_manager` bu axını tam edə bilər (`meas.*`, `media.read/create`); başqasının faylını silə bilməz, yalnız özününkünü.
6. **Gəlirlilik əyrisi:** hər data dəsti üçün tab → "Excel-dən yüklə" → tarix + fayl → mövcud tarixdə "Üstünə yaz" təsdiqi (§4.4).

---

## 10. Təhlükəsizlik

### 10.1 Login axını

- `POST /api/v1/auth/login` (anonim), `AuthController.cs:36`:
  1. **İstifadəçi adı üzrə limit** (`Services/LoginProtection.cs`, spec 012): sürüşən pəncərə **10 cəhd / 120 san**, açar — trim olunmuş, kiçik hərfə salınmış username (citext ilə uyğun). Bazadan və BCrypt-dən **əvvəl** yoxlanılır → **429** + `Retry-After`. Yaddaşdadır — **hər pod-un öz sayğacı** var. IP üzrə limit yoxdur (forwarded header-lər həll olunana qədər).
  2. Aktiv istifadəçi username ilə tapılır. BCrypt **hər halda** yoxlanılır — istifadəçi yoxdursa sabit `DummyHash` ilə (`PasswordHashing.cs`) — ki, cavab və vaxt istifadəçinin mövcudluğunu, kilidini və parolun düzlüyünü açmasın.
  3. İstifadəçi yoxdur / kilidlidir / parol səhvdir → həmişə eyni **401 "Invalid credentials."** (kilid xaricdən görünmür). Loglanır, **audit-ə yazılmır.**
  4. **Hesab kilidi** (DB-də, bütün pod-lar üçün): aralarında 10 dəqiqədən az fasilə olan **5 səhv parol → 15 dəqiqə kilid**. Sayğac bir atomik `UPDATE` ilə artırılır (paralel cəhdlər itmir); seriya açıq ikən `locked_until`-da son səhvin vaxtı 1 gün **keçmişə** sürüşdürülmüş halda saxlanılır (yeni sütun yox — `users`-ə `ALTER` alınmır), həqiqi kilid `failed_logins ≥ 5` ilə tanınır. Kilidli hesabda cəhdlər sayılmır — kilid uzanmır. Kilid artan deyil (sabit 15 dəq).
  5. Uğur → `failed_logins = 0`, `locked_until = NULL`, refresh token ailəsi, `auth.login` audit, cookie, `{ accessToken, expiresAt }`.
- Kilidi açmaq: 15 dəq gözləmək, admin tərəfindən parol sıfırlama və ya deaktiv → aktiv (§9.3).
- Panel 429-u lokal mətnlə göstərir ("Çox sayda giriş cəhdi…"), 401-i "yanlış məlumat" kimi (`features/auth/components/login-form.tsx`).
- `TODO(Phase 2)` (`AuthController.cs:34`): TOTP 2FA, artan kilidləmə, sessiya bağlama, QRadar CEF.

### 10.2 Tokenlər

- **Access token:** JWT HS256, claim-lər `sub`, `preferred_username`, rol, **`sst`** (security stamp); **15 dəqiqə**; clock skew 30 san. Frontend onu **yalnız yaddaşda** saxlayır. Rol token yaradılanda bazadan təzə oxunur.
- **Access token ləğvi** (`Services/SecurityStampService.cs`, spec 020): hər qorunan sorğuda (`Program.cs` `OnTokenValidated`, keşsiz — sorğu başına bir DB sorğusu) token-in `sst`-i `admin_user_security_stamps`-dakı ilə müqayisə olunur; istifadəçi yoxdur / silinib / deaktivdir / stamp uyğun deyil → standart 401 (panel refresh edib təkrarlayır). Stamp **deaktivasiya, silmə, parol sıfırlama və rol dəyişikliyində** dəyişir — həmin dəyişikliklə eyni tranzaksiyada. Kilid burada yoxlanılmır (refresh kilidli hesabı onsuz da rədd edir — yəni kilidlənən istifadəçinin mövcud access token-i 15 dəq-ə qədər işləyir). Stamp sətri ilk login/refresh-də tənbəl yaranır; `sst`-siz köhnə token-lər bir dəfə 401 alıb refresh olunur.
- **Refresh token** (`RefreshTokenService.cs`):
  - 32 təsadüfi bayt, DB-də yalnız SHA-256 hash.
  - Cookie `cbar_admin_rt`: HttpOnly, SameSite=Strict, Path `/api/v1/auth`, Secure (Development istisna).
  - Müddət: **8 saat hərəkətsizlik** və ya **ailənin yaranmasından 7 gün** — hansı tezdirsə.
  - Hər istifadədə **rotasiya.** Artıq rotasiya olunmuş token: 30 san grace ərzində `refresh_stale` (cookie saxlanılır); sonra **bütün ailə ləğv**, `auth.refresh_reuse` audit (oğurlanmış token aşkarlanması).
  - Qeyri-aktiv / silinmiş / kilidli istifadəçi → ailə ləğv.
  - `/auth/refresh` və `/auth/logout` Origin başlığını `Cors:Origins` ilə yoxlayır (başlıq yoxdursa keçir).
- **Frontend:** bitmədən 30 san əvvəl və ya 401-də bir dəfə refresh + təkrar; tab daxilində tək uçuş, tablar arası `navigator.locks`; yalnız rədd edilmiş refresh logout edir (5xx/şəbəkə yox); logout `BroadcastChannel` ilə digər tablara ötürülür; `/login?redirect` `safeRedirect` ilə qorunur.
- ⚠️ Prod-da panel (`cbar-admin.e-cbar.az`) və API (`cbar.az`) fərqli saytlardır — SameSite=Strict cookie sessiyanı bərpa etməyə bilər.

### 10.3 Avtorizasiya

**Model (spec 008 1a, 2026-10-09):** access token yalnız rolu daşıyır, icazə kodlarını server hər sorğuda roldan hesablayır. Hər controller action-u bir `<modul>.<əməliyyat>` kodu tələb edir — "login olmaq kifayətdir" artıq yoxdur. ⚠️ Kod build/run olunmayıb və `test`-də yoxlanılmayıb (spec 008 T034 açıqdır).

- **Kataloq — 98 kod** (`Authorization/Permissions.cs`), əsasən modul başına `read/create/update/delete`; xüsusi kodlar: `pages.delete_subtree`, `media.delete_own`, `currency_rates.prepare` / `.approve`, `settings.delete`, `roles.read`, `audit.read`. Kodlar `0009` migration-ı ilə hərfbəhərf eynidir.
- **Matris:**

  | Rol | Kodlar | Nə edə bilmir |
  |---|---|---|
  | `admin` | hamısı (98) — **kodda**, bazadan oxunmur (`Authorization/PermissionMatrix.cs:36-37`) | — |
  | `moderator` | 87 | `pages.delete_subtree`, `currency_rates.approve`, `settings.*`, `users.*`, `roles.read`, `audit.read` (`0009-rbac-permissions.sql:127-135`) |
  | `meas_manager` | 7: `meas.*`, `media.read`, `media.create`, `media.delete_own` (`0009:138-145`) | qalan hər şey |
  | naməlum rol / rol claim-i yoxdur | 0 — login ola bilir, heç nə edə bilmir | |

  **Niyə admin kodda:** `role_permissions` sətri unudulsa və ya seed ötürülsə belə admin bloklanmır.
- **Yoxlama ardıcıllığı:** controller-dəki `[RequirePermission(x.read)]` bütün action-lara aiddir, action-dakı atribut **onun üstünə** əlavə olunur (yazma = modulun `read`-i + öz kodu). Bir atributda bir neçə kod "hansı biri olsa" deməkdir. İcazə yoxdursa **403** (`message`-siz problem details) — panel ümumi `errors.forbidden` mətnini göstərir. Token yoxdur / bitib / ləğv olunub → 401 (§10.2).
- **Default-deny:** `[Authorize]` arxasında olub heç bir kod göstərməyən action admindən başqa hamıya 403 verir və `unbound` kimi audit olunur (`Authorization/PermissionGuardFilter.cs`). Yeni endpoint-ə atribut unudulsa endpoint "bağlı" olur. İstisnalar: anonim auth endpoint-ləri və `[AnyAuthenticatedUser]` (`GET /me/permissions`). `scripts/permission-inventory.mjs` bağlanmamış action-ları statik tapır (exit 1) — ⚠️ CI-a qoşulmayıb.
- **Datadan asılı yoxlamalar** (heç nə dəyişməzdən əvvəl):
  - **Səhifə silmə:** uşağı olan səhifədə bayraqlardan (409) sonra **`pages.delete_subtree`** (yalnız admin) yoxlanılır (`Controllers/PagesController.cs:210-228`).
  - **Media silmə:** `media.delete` VƏ YA `media.delete_own`; başqasının faylı (o cümlədən `created_by = NULL` olan köhnə fayllar) yalnız `media.delete` ilə (`Controllers/MediaController.cs:245-258`).
  - **Parametrlər:** yeni açar yalnız `KnownSettings` allowlist-indən; mövcud açar redaktə/silinə bilir. **Niyə:** heç nəyin oxumadığı açar məlumat gizlətmək üçün yer olurdu.
- **Rol dəyişikliyi** dərhal təsir edir (security stamp, §10.2). Matris yaddaşda **5 dəqiqə** keşlənir, pod başına; yalnız migration (deploy) ilə dəyişir; bazada olub API-nin tanımadığı kodlar atılır.
- **Startup yoxlaması:** kataloqun hər kodu `permissions`-da olmalıdır — çatışmayan `Error` loglanır, start dayanmır. `role_permissions` qrantları **yoxlanılmır**.
- **Oxuma endpoint-ləri:** `GET /me/permissions` → `{ role, permissions[] }` (hər login olmuş istifadəçi); `GET /roles` (`roles.read`).
- **Endpoint-i olmayan kodlar:** `currency_rates.approve` (four-eyes, spec 008 1b — **planlaşdırılıb**) və `yield_curves.update` (gəlirlilik əyrisi API-də redaktə yoxdur, yalnız import/silmə).
- **Frontend — UI-da RBAC hələ yoxdur:** panelin serverlə əlaqəsiz sabit modeli var (`content/media/finance/users/settings.manage`; admin olmayan hər rol `users.manage`-dən başqa hamısını alır — `entities/user/model/types.ts:15-20,56-59`). `<Can>` bir yerdə (`pages/settings/index.tsx:109`) — moderator əlçatanlıq kartını görür, server isə ona `settings.*` vermir. Menyu rola görə filtrlənmir, route guard yalnız login-i yoxlayır. Serverdəki koda keçid planlaşdırılıb (spec 008 T050).

### 10.4 Audit

- `AuditService`: hər yazma əməliyyatı `<modul>.<əməliyyat>` kimi, `before`/`after` JSON, actor (`sub`), IP, user-agent ilə. Çağıranın `SaveChanges`-i ilə birlikdə saxlanılır. User-agent 500 simvola kəsilir (`ClientUserAgent`, refresh token ilə eyni qayda) ki, uzun başlıq save-i sındırmasın.
- **İcazə rəddləri — `authz.denied`** (2026-10-09): login olmuş istifadəçinin hər 403-ü bir sətir — `after = { permission, method, path }` (bir neçə koddan biri tələb olunanda `a|b`, default-deny-də `unbound`); `entity_type` = `/api/v1/`-dən sonrakı ilk seqment snake_case ilə, `entity_id` = route-dakı `{id}` və ya 0 (`Authorization/PermissionChecker.cs`, `AuditingAuthorizationResultHandler.cs`). Ayrıca scope-da saxlanılır; yazılmasa xəta loglanır, cavab 403 qalır. 401 audit olunmur.
- **Alt ağac silmə** silinən bütün səhifə id-lərini `after.ids`-də saxlayır; parametr silmə `settings.delete` kimi, köhnə dəyər `before`-da.
- **Oxuma — `GET /audit-log`** (`audit.read`, yalnız admin; `Controllers/AuditLogController.cs`): filtrlər AND ilə — `action` (**prefiks**, məs. `authz.`), `actorId`, `entityType`, `entityId`, `from` (daxil) / `to` (xaric); ən yenisi yuxarıda, səhifə 50 (max 100); silinmiş istifadəçinin adı da göstərilir. Panel ekranı yoxdur (§9.2).
- ⚠️ `entity_type` ardıcıl deyil: rədd sətri URL-dən (`pages`, `media`, `currency_rates`), uğurlu əməliyyatlar controller-in öz adını (`page`, `media_asset`, `currency_rate_sheet`) yazır — bir obyektin bütün tarixçəsi bir filtrlə alınmır.
- `created_by`/`updated_by` yalnız bəzi cədvəllərdə doldurulur (məzənnə, info lines, media, settings, gəlirlilik əyrisi, şəkilli popup — yalnız `created_by`) — digərlərində "kim dəyişdi" yalnız `audit_log`-dadır. `media.delete_own` sahibliyi `media_assets.created_by`-dan oxunur.
- `TODO(Phase 2)`: QRadar-a CEF/syslog ilə ötürmə (köhnə sistemdə var idi). Uğursuz login hələ də audit-ə yazılmır (§10.1).

### 10.5 Public tərəf

- **Public API:** rate limit **1000/dəq** hər IP-yə (`X-Forwarded-For`-un ilk dəyəri) — bir SSR səhifə bir neçə API sorğusu yaratdığı üçün. ⚠️ XFF-yə kor-koranə etibar olunur (saxtalaşdırıla bilər); Next serveri ziyarətçinin IP-sini ötürmürsə, bütün ziyarətçilər bir kvotanı paylaşır. CORS yoxdur (lazım deyil — SSR). Təhlükəsizlik başlıqları, HSTS yoxdur. OpenAPI prod-da açıqdır.
- **Public sayt:** hər sorğuya nonce + `strict-dynamic` CSP; `img-src` https + API origin; `frame-src` YouTube + `CSP_FRAME_SRC`; `frame-ancestors 'none'`, `X-Frame-Options: DENY`, nosniff, `strict-origin-when-cross-origin`, Permissions-Policy (kamera/mikrofon/geo bağlı).
- **CMS HTML sanitizasiyası** (`shared/lib/cms-html.ts`): `<script>`, `on*` atributları, `javascript:` silinir; `/media/` linklərinə `target=_blank`; şəkillərə lazy-load. `<svg onload>`, `iframe srcdoc`, object/embed, `data:` URL-ləri tutulmur — CSP bunu yumşaldır.
- ⚠️ `/media/{id}` publikasiya yoxlaması etmir — ardıcıl id-lərlə qaralama faylları və avatarlar əldə edilə bilər. SVG/XML birbaşa açılışda skripti `nosniff` + sandbox CSP ilə bloklanır (§8.2).

---

## 11. İnfrastruktur, miqrasiya, seed, deploy

### 11.1 MigrationRunner (hər iki API-də)

1. Startup-da, trafikdən əvvəl işə düşür.
2. `db/migrations/*.sql` fayllarını adına görə sıralayır (fayl yoxdursa bağlantı açmadan çıxır — `api-cbar`-da hazırda belədir).
3. `pg_advisory_lock(0x0CBA5)` (hər iki API eyni açar — paralel işləmə qarşısı alınır).
4. `schema_migrations(version text PK, applied_at)` yaradır; tətbiq olunmuş faylları ötürür.
5. Hər faylı öz tranzaksiyasında + versiya qeydi ilə icra edir. Faylın içində `BEGIN/COMMIT` olmamalıdır.
6. `Migrations` connection string, yoxdursa `Cbar`.
7. **Admin API:** yalnız Development-də və `locales` boşdursa `db/seed.sql`-i icra edir.

Qaydalar: fayl adları **hər iki repo üzrə unikal** olmalıdır (ortaq `schema_migrations`); tətbiq olunmuş faylı dəyişmək olmaz; `IF NOT EXISTS` stili. ⚠️ `0001`-dəki `cbar_web_ro` qrantları rol sonradan yaradılarsa **yenidən işə düşmür** — əl ilə verilməlidir.

**Başlama/deploy sırası sabitdir:** əvvəl `api-cbar-admin` (miqrasiya + seed `cbar_web_ro`-nu yaradır), sonra `api-cbar`.

### 11.2 Seed

- `db/seed.sql`: `cbar_web_ro` rolu (LOGIN, lokal parol, qrantlar), az/en, 3 rol, `admin` istifadəçisi, 12 valyuta (+ `0010`-un 30 valyutasının az/en adları). İcazələr seed olunmur.
- `db/dev/home-mock-seed.sql`, `home-mock-seed-2.sql` (əl ilə, öz BEGIN/COMMIT-i ilə): info lines, `cpi_yoy` 2025-06…2026-05, AZIR 30D/90D/180D, RUB/TRY məzənnələri, slayder/nəşr/link/banner/video — hamısı `media_id = 2`.
- `scripts/seed_pages.py`: cbar.az menyu ağacını qurur (idempotent, valideyn + az başlıq üzrə). `seed_market_actors.py`, `seed_legal_framework.py`, `seed_sections.py` (+ `seed_lib.py`): köhnə saytın HTML dump-larını oxuyur → faylları media-ya yükləyir → HTML-i TipTap üçün yenidən yazır (details, cədvəllər, `/media/{id}`) → səhifə məzmununu PUT edir. Dump yolları başqa kompüterə bağlıdır.

### 11.3 Docker-compose (lokal)

Postgres 16 (**5433**), Redis, MinIO (**9002/9003**), Meilisearch, Mailpit. **Kod yalnız Postgres və MinIO istifadə edir.** Email göndərmə, axtarış indeksi, Redis keşi yoxdur.

### 11.4 Deploy

- Hər layihə ayrı GitLab repo, ortaq pipeline. Branch → mühit: `feature/*`/`bugfix/*` MR → dev (manual), `test` → test, `master` → prod. `.ci-cd/base.yaml` + `dev|test|prod.yaml`.
- **API-lər:** port 8080, non-root. Sirlər Vault-dan. Health `/healthz` (yalnız Npgsql) — liveness və readiness eyni endpoint-dir (DB düşəndə pod-lar restart dövrünə düşür).
- **web-cbar-new:** Node 22 alpine, standalone, port 3000. CI `app:check`-də `npm run audit` (`scripts/audit/audit-check.mjs`): high/critical tapıntı gate-i qırır; istisna (`scripts/audit/exceptions.json`, səbəbləri `docs/audit-exceptions.md`) yalnız paket tam dev-only-dirsə və `reviewBy` tarixi keçməyibsə. `API_URL` və `CSP_FRAME_SRC` **runtime-da** oxunur — bir image mühitlər arasında keçir. Hostlar: test `temp.cbar.az`, prod `cbar.e-cbar.az`. Pod label-i `instana-autotrace: "false"` (`.ci-cd/base.yaml:15-19`): Instana inyeksiya etdiyi modul konteynerdə tapılmırdı və Node `MODULE_NOT_FOUND` ilə başlamırdı — nəticədə bu servisdə Instana avtomatik tracing yoxdur.
- **web-cbar-admin-new:** `VITE_API_URL` **build zamanı** bişirilir (`BUILD_ENV` → `npm run build:*`), nginx ilə verilir. Hostlar: test `admin-temp.cbar.az`, prod `cbar-admin.e-cbar.az`. Lokal dev port 5174.
- ⚠️ `api-cbar` dev və test Helm dəyərləri eyni host və Vault yolunu göstərir. web-cbar-new dev `api-cbar-test.e-cbar.az`, test `api-cbar-test.cbar.az` — mümkün yazı səhvi.

### 11.5 OpenAPI kontraktı

- Hər iki API-də `openapi/` qovluğu: **əl ilə saxlanılan** OpenAPI 3.1 spec-i (public ~35, admin ~157 əməliyyat). Səbəb: controller-lər anonim tip qaytarır, runtime `/openapi/v1.json`-da cavab sxemi yoxdur (admin-də request sxemləri də nullable sahələri `required` sayır).
- Spec **mövcud davranışı** təsvir edir; məlum səhvlər `x-known-issues` altında qeyd olunur, spec-də "düzəldilmir".
- Alətlər (`npm run …`): `lint` (Redocly), `bundle` (tək fayl, frontend üçün), `contract` (test API-yə real sorğular + ajv; admin-də `ADMIN_USER`/`ADMIN_PASSWORD` olmadan yalnız auth/401 yolları), `drift` (spec ↔ runtime əməliyyat siyahısı). Default hədəf test mühitidir.
- Admin API-nin runtime `/openapi/v1.json`-u yalnız Development və Staging-də (dev/test) verilir, Production-da yox (spec 014). Public API-də hər mühitdə açıqdır.
- Qayda: endpoint dəyişəndə spec eyni MR-da yenilənir. ⚠️ Bu **CI-da yoxlanılmır** (`.gitlab-ci.yml`-də openapi addımı yoxdur) — intizam məsələsidir; yalnız bu iş mühitindəki Claude hook-u (`.claude/hooks/spec-first.mjs`) route əlavə/silməni lokal bloklayır.

---

## 12. Məlum buglar və risklər

Ciddilik sırası ilə (ən vacib yuxarıda).

| # | Problem | Harada | Təsir |
|---|---|---|---|
| 1 | ⚠️ qismən düzəlib 2026-10-08: hesab kilidi (5 səhv / 10 dəq → 15 dəq) və username üzrə limit (10 / 120 san) var. Qalır: limit pod-başına yaddaşdadır, **IP üzrə limit yoxdur**, kilid artan deyil, CAPTCHA yoxdur, uğursuz login audit-ə yazılmır | `api-cbar-admin/AuthController.cs`, `LoginProtection.cs` | çox username-ə paylanmış brute-force |
| 2 | ⚠️ qismən düzəlib 2026-10-09 (spec 008 1a): API-də hər action icazə kodu tələb edir, default-deny, `authz.denied` audit. Qalır: **kod build/run olunmayıb və `test`-də yoxlanılmayıb** (spec T034); EF join mapping riski (#34); panel icazəni serverdən oxumur — menyu/düymələr gizlədilmir | admin API `Authorization/`, panel `entities/user/model/types.ts` | mapping səhvdirsə admin olmayan rollar üçün hər sorğu 500; UI-da icazəsiz düymələr 403 verir |
| 3 | HTML mənbə rejimində xam HTML (skriptlər daxil) saxlanılır | `rich-text-editor.tsx` | stored XSS (public sanitizer + CSP qismən qoruyur) |
| 4 | `/media/{id}` publikasiya yoxlaması yoxdur (SVG XSS hissəsi düzəlib 2026-10-08 — `nosniff` + sandbox CSP) | public Media | qaralama fayllarının sızması |
| 5 | Press-reliz/qanun/pul nişanı slug-ı başlıq dəyişəndə dəyişir | admin controllerlər | dərc olunmuş URL-lər sınır |
| 6 | Press-reliz PUT boş tərcümə ilə bütün tərcümələri silir | `PressReleasesController` | məlumat itkisi |
| 7 | Səhifə formunda başlığı boş dil məzmunu ilə birlikdə atılır | `page-form.tsx:181-202` | məlumat itkisi |
| 8 | Eyni tarixli yeni məzənnə cədvəli (əl ilə) köhnənin üstünə xəbərdarlıqsız yazılır; Excel importunda isə 409 təsdiqi var | currency-rates ekranı | səhv rəsmi məzənnə |
| 9 | XML feed prod ilə müqayisə olunmayıb (`Description` atributu, valyuta sırası); metallar bloku 2026-10-20-də əlavə olunub | `api-cbar/.../CurrenciesController.cs:87` | xarici sistemlər sına bilər |
| 10 | Məzənnə üçün əvvəlki iş gününə fallback yoxdur; default tarix gələcəkdə ola bilər | public Currencies | həftəsonu boş cədvəl |
| 11 | `scheduled` statusu heç vaxt dərc olunmur | bütün sistem | planlaşdırılmış xəbər çıxmır |
| 12 | Dil dəyişəndə fərqli slug-lı səhifələr 404 verir | web-cbar-new language switcher | UX, SEO |
| 13 | Menyu ağacında gizli valideynin uşaqları kökə çıxır | `api-cbar/PagesController.cs:42-46` | gözlənilməz menyu; gizlədilmiş "(Kopya)" səhifələri "Haqqımızda" şablonunu itirir |
| 14 | Səhifə sıralaması atomik deyil (ayrı-ayrı move sorğuları) | admin `use-pages.ts` | yarımçıq sıra |
| 15 | Kilidli səhifə kilidi açılıb saxlanıla bilər | `page-form.tsx` | qoruma formaldır |
| 16 | "İllik inflyasiya" ayı `nextUpdateDate`-dən götürülür | `views/home/loader.ts:236-241` | səhv ay göstərilir; növbəti yenilənmə tarixi saytda yoxdur |
| 17 | Prod-da refresh cookie cross-site ola bilər | deploy hostları | hər 15 dəq yenidən login |
| 18 | ✅ düzəlib 2026-10-08 — dedup ən köhnə canlı sətri götürür, paralel upload `storage_key` unique-inə dəyəndə qalibin qeydi qaytarılır (checksum-da unique indeks hələ yoxdur) | admin `MediaController.cs:173-224` | — |
| 19 | Rich text içindəki media linkləri "istifadədə" sayılmır | admin Media delete | səhifədə sınıq linklər |
| 20 | Qeyri-aktiv valyuta/kateqoriya/emitent uşaqları public-də görünür | public API | gizlədilən məlumat görünür |
| 21 | ✅ admin API-də düzəlib 2026-10-08 — `DbExceptionHandler` DB rədd etməsini 400/409 problem details-ə çevirir (§2.10). Public API-də handler yoxdur (read-only, risk aşağı) | `api-cbar-admin/Errors/` | — |
| 22 | Banner tərcümə sahələri boş saxlanıla bilər (şəkil və ya tərcümə tələbi var, `BannersController.cs:52`); tarix aralığı və URL yoxlanılmır; banner `description` admin-də işlənmir — **ana səhifədə promo yalnız `description`-lu bannerdən qurulur** | admin + `web-cbar-new/src/views/home/loader.ts:349` | boş/səhv bannerlər; CMS bannerləri saytda görünmür |
| 23 | Public API rate limit XFF saxtalaşdırmasına açıq və SSR arxasında ortaq ola bilər | `api-cbar/Program.cs` | limit bypass və ya 429 |
| 24 | Redis, Meilisearch, Mailpit docker-da var, kodda istifadə olunmur | infra | yanlış təəssürat |
| 25 | `/statistics` bütün AZIR tarixçəsini yükləyir (ana səhifə artıq son 60 günü alır); yanvarda inflyasiya boşdur | `web-cbar-new/src/views/statistics/loader.ts` | performans, boş qrafik |
| 26 | `runningLines` göstərilmir; ana səhifədə nəşrlər, faydalı linklər, sürətli keçidlər və video tabı gizlidir (`views/home/blocks.ts`); sitemap/robots/OG/analitika yoxdur; footer-də məxfilik siyasəti və sayt xəritəsi linki yoxdur (hədəf səhifə yoxdur) | web-cbar-new | parity boşluqları |
| 27 | Audit log ekranı (API `GET /audit-log` var, panel çağırmır), sütun sıralaması, dashboard məlumatı yoxdur | admin panel | redaktor rahatlığı |
| 28 | Info lines səhifələməsi qrupları bölür | admin API + panel | çaşqın siyahı |
| 29 | `inflation_settings`-də 1-dən çox sətir olsa 500 (CHECK bunu qoruyur) | public API | aşağı risk |
| 30 | Liveness probe DB-dən asılıdır | `.ci-cd/base.yaml` | DB düşəndə restart fırtınası |
| 31 | Spec yoxlaması CI-da deyil (`image-popups` endpoint-ləri artıq hər iki spec-dədir — düzəlib 2026-10-08) | `*/.gitlab-ci.yml` | kontrakt köhnələ bilər |
| 32 | Şəkilli popup-da başlama/bitmə tarixi yoxdur; siyahıdan status toggle köhnə sətirlə tam `PUT` göndərir | `ImagePopupsController`, admin `image-popups.service.ts` | unudulan popup saytda qalır; paralel redaktə üstünə yazıla bilər |
| 33 | Access token ləğvi hər qorunan sorğuda keşsiz DB sorğusu edir; login limiti pod sayına görə zəifləyir (N pod → N×10 cəhd / 120 san) | `SecurityStampService.cs`, `LoginProtection.cs` | DB yükü; limitin effektivliyi |
| 34 | ⚠️ (runtime-da yoxlanılmayıb) `role_permissions` many-to-many `UsingEntity("role_permissions")` FK sütun adlarını vermir — EF konvensiyası snake_case ilə `roles_id`/`permissions_id` gözləyir, cədvəldə `role_id`/`permission_id` var. Doğrudursa admin olmayan rolun **hər qorunan sorğusu** və `GET /roles` 500 verir; admin təsirlənmir (bazaya getmir) | `Cbar.Domain/CbarDbContext.cs:88-89`, `db/migrations/0001-initial-schema.sql:42-46`, `Authorization/PermissionMatrix.cs` | moderator/meas_manager işləyə bilməz |
| 35 | Boş (dev) bazada `0009` seed-dən əvvəl işləyir: `roles` boşdur, `role_permissions` yaranmır, `seed.sql` onları əlavə etmir; startup yoxlaması qrantları yoxlamır | `MigrationRunner.cs`, `db/seed.sql`, `0009-rbac-permissions.sql:127-145` | lokal dev-də moderator/meas_manager hər şeyə 403 alır |
| 36 | `0009` `INSERT` icazəsi olmayanda `WARNING` ilə səssiz ötürülür (yalnız admin işləyir); matris 5 dəq pod başına keşlənir | `0009-rbac-permissions.sql:16-22`, `PermissionMatrix.cs:27` | deploy "uğurlu" görünür, redaktorlar bloklanır |
| 37 | Panelin icazə modeli serverlə uyğun deyil: moderatora `settings.manage` verir (server `settings.*` vermir), `meas_manager`-ə bütün ekranları göstərir; `ROLE_IDS` sabit xəritədir | `web-cbar-admin-new/src/entities/user/model/types.ts`, `pages/settings/index.tsx:109` | çaşqın UX, düymə → 403 |
| 38 | `permission-inventory.mjs` CI-da işləmir; kataloqda endpoint-i olmayan kodlar var (`currency_rates.approve`, `yield_curves.update`); `authz.denied`-in `entity_type`-ı uğurlu əməliyyatlarınkı ilə üst-üstə düşmür | `scripts/permission-inventory.mjs`, `Authorization/PermissionChecker.cs` | bağlanmamış endpoint deploy-dan əvvəl tutulmur (default-deny onu bağlı saxlayır); audit filtrləməsi natamam |
| 39 | ✅ düzəlib 2026-11-24 (spec 057): "Strategiya və sənədlər" bloku artıq admin-dən idarə olunur, `mock.ts` silinib (§6). Qalan: deploy-dan sonra üz qabıqları yoxdur (boz fon) — redaktor yükləməlidir | `api-cbar-admin` `0044`; `web-cbar-new/src/views/home/loader.ts` | kartlar şəkilsiz görünür |
| 40 | `/homepage` xətasında faiz dəhlizi və info-line tabları səssizcə yox olur (yalnız slayder xəta göstərir); faiz dəhlizinin tarixi qərarın tarixi deyil, info-line-ın son redaktə anıdır | `views/home/index.tsx`, `views/home/loader.ts:215` | əsas pul siyasəti göstəricisinin xəbərsiz itməsi; səhv tarix |
| 41 | Public saytın keşi 10 san, stale-while-revalidate, pod-başına; on-demand təmizləmə yoxdur (spec 023 təxirə salınıb). Root `CLAUDE.md` "Requests are uncached by design so CMS edits appear immediately" deyir — kodla **ziddiyyətdir** | `web-cbar-new/src/server/cached.ts:65` | redaktor dəyişikliyi dərhal görünmür; 404 də 10 san keşlənir |
| 42 | CMS-ə kodda **başlıq/slug ilə** bağlantılar: footer naviqasiyası (`nav.ts:75-91`), "Haqqımızda" kökü (`tree.ts:65`), "Haqqımızda", Media və "Beynəlxalq əməkdaşlıq" layout-ları (`about-content/model/layouts.ts`, spec 044 IFI səhifəsi daxil), header üst keçidləri (`contacts.ts:31-35`), `FEATURE_ROUTES`, FAQ səhifəsi (`FAQ_SLUG`, spec 051) | web-cbar-new | CMS-də ad/slug dəyişəndə səssiz sınır (bölmə itir, dizayn `plain`-ə düşür, 404) |
| 43 | "Haqqımızda" tarix səhifəsində timeline tanınmasa hero kart da itir (kontrakt əksini deyir); timeline/dəyər şəkli `/media/` və ya `https://` deyilsə səssizcə silinir | `about-content/model/parse.ts:33-46, 249-252` | redaktor gözlədiyi blokları görmür; köçürülməmiş legacy şəkillər görünmür |
| 44 | "(Kopya)" səhifələri public-dir və orijinal menyuda görünür; Kopya kontekstindən bioqrafiya/şöbəyə keçəndə `copy=1` itir | `about-shell/model.ts:86-89`, `views/organization/loader.ts` | qaralama ziyarətçiyə görünür |
| 45 | 744–767 px enində header-də axtarış yoxdur; tablet hamburger paneli (744–1023) və "Haqqımızda" menyusu yalnız 2 səviyyə göstərir | `shell/site-header.tsx:47,90`, `shell/mega-menu.tsx:84-107`, `about-shell/model.ts` | dar planşetdə axtarış yoxdur; dərin səhifələrə menyudan keçid yoxdur |
| 46 | Gəlirlilik əyrisinin 7 standart müddəti (`periods`) API-də var, saytda göstərilmir; ana səhifə qrafikində x oxu vahidsiz gün rəqəmləridir | `web-cbar-new/src/features/stats/model/series.ts:158-172` | köhnədəki "Yields %" cədvəli yoxdur |
| 47 | `docs/cookies.md` köhnəlib (kodda olmayan `web-cbar-next-session`, `NEXT_LOCALE`, tema cookie-si); paylaşma linkinin host-u `X-Forwarded-Host`/`Host`-dan qurulur (yalnız format yoxlanır) | `web-cbar-new/docs/cookies.md`, `src/server/page-url.ts` | cookie reyestri yanlışdır; saxta host-lu paylaşma linki (aşağı risk) |
| 48 | Şöbə səhifəsi tək şöbə üçün bütün siyahını çəkir; API xətası xəta səhifəsi verir, bioqrafiyada isə hər xəta 404 | `views/division/loader.ts`, `views/staff-member/loader.ts` | uyğunsuz xəta davranışı |
| 49 | Detal səhifələrində `notFound()` HTTP **200** ilə gəlir (ehtimal olunan səbəb `[locale]/loading.tsx` streaming-inin statusu əvvəldən göndərməsidir — yoxlanmayıb); məzmun "Səhifə tapılmadı" + `noindex`-dir. 2026-11-05 prod build (`next start`) ilə də ölçülüb: `/az/media/videos/99999`, `/az/media/galleries/999999` | `web-cbar-new/src/app/[locale]/loading.tsx` | axtarış sistemləri və monitorinq 404-ü görmür |
| 50 | Köhnə FAQ ünvanının yönləndirməsi `page-131/*`-ə yazılıb — id test bazasından götürülüb, canlı `product-host` bazasında yoxlanmayıb (spec 051 T088). FAQ sualları sayt axtarışında yoxdur (`SearchController`, §5.1f) | `web-cbar-new/src/proxy.ts` `LEGACY_FAQ_PAGE`; `api-cbar` `SearchController` | id fərqlidirsə köhnə FAQ linkləri 404 verir; ümumi axtarışda suallar tapılmır |
| 51 | İşçi məqalələri sayt axtarışında yoxdur; köhnə ~78 məqalə köçürülməyib və köhnə `page-895/*` ünvanları yeni detala yönlənmir (spec 054 US6 təxirə salınıb) | `api-cbar` `SearchController`, `web-cbar-new/src/proxy.ts` | prod-da siyahı köhnə CMS mətnini göstərir; məqalələr axtarışda tapılmır |
| 52 | Sənəd kartı mime və ölçünü yalnız səhifəyə bağlı fayldan götürür: mətndə linklənib, amma `page_assets`-də olmayan fayl "Fayl" yazılır, ölçüsüz | `features/about-content/model/file-archive.ts` `publicationFile` | redaktor faylı bağlamağı unudanda natamam kart |
| 53 | `menuGroup` saxlanılır, amma sayt onu göstərmir (spec 055); en qrup başlıqları, girişlər və etiketlər qaralamadır (seed `0041`) | §5.1i | redaktor dəyişikliyi saytda görmür; en mətnlər yoxlanmalıdır |
| 54 | Bölmənin zəif mətni (#A3A3A3) #F5F5F5 fonda ~2.3:1 kontrastdır — WCAG AA (4.5:1) keçmir; Figma tələbidir | `web-cbar-new` `--site-faint` | əlçatanlıq |
| 55 | `GET /homepage` strategiya sənədlərini hər sorğuda oxuyur və cədvəlin olmamasına qarşı qorunmur: `api-cbar` `api-cbar-admin`-in `0043`-ündən əvvəl deploy olunsa, **bütün** `/homepage` 500 verir (§6 boş/xəta vəziyyətləri: slayder xəta göstərir, qalan bloklar səssizcə yox olur) | `api-cbar` `HomepageController.cs:104` | deploy sırası pozulanda ana səhifənin əsas blokları itir |
| 56 | AZIR Excel importunda həcmin vahidi real faylla təsdiqlənməyib: nümunə faylda (27.10.2026) həcm 0-dır, başlıq "(AZN)" yazır, xana formatı tam ədəddir, köhnə sayt isə `27.50` kimi mln göstərir. İki diapazon (≤ 10 000 mln, ≥ 1 000 000 manat) hər iki vahidi qəbul edir, arası rədd olunur | `api-cbar-admin` `Validation/AzirSheetReader.cs` `ReadVolume` | bankın faylı başqa vahiddədirsə ya rədd, ya səhv həcm; əqd olan günün faylı ilə yoxlanmalıdır |
| 57 | `/statistics` AZIR qrafiki (`web-cbar-new/src/views/statistics/loader.ts:52` → `features/stats/model/series.ts` `azirSeries`) bazadakı **bütün** term-ləri bir `%` oxunda çəkir; API istənilən term-i qəbul edir. Excel importu TFAI-ni atır, admin kartı yalnız 4 term verir, amma API-yə birbaşa `TFAI` (indeks ~114) yazılsa qrafik düzləşər | `api-cbar-admin` `AzirController.Validate`, `web-cbar-new` `azirSeries` | qrafik oxunmaz olur |
| 58 | `GET /organization/chart` `org_chart_node_details`-i hər sorğuda oxuyur: `api-cbar` `api-cbar-admin`-in `0045`-indən əvvəl deploy olunsa sorğu yıxılır, sayt sxemsiz köhnə görünüşə (CMS şəkli) düşür. Test mühitinin 40 kartında 40–43-ün valideyni 31-dir, 37 isə "açılan siyahı" — redaktor düzəltməyənə qədər "Təşkilati inkişaf bloku"nun departamentləri yan departament kimi görünür (spec 060 FR-017) | `api-cbar` `OrganizationController.GetChart`; test bazası | deploy sırası pozulanda sxem itir; düzəlişsiz sxem Figma-dan fərqlidir |
| 59 | JavaScript söndürülmüş brauzerdə saytın heç bir səhifəsi görünmür: kök `src/app/[locale]/loading.tsx` Suspense sərhədi məzmunu Next-in gizli streaming blokunda (`<div hidden>`) saxlayır, onu yalnız inline script açır. "JS-siz işləyir" deyilən native `<details>`/GET formaları vidjet səviyyəsində işləyir, səhifə səviyyəsində yox (spec 060 T022-də tapılıb) | `web-cbar-new/src/app/[locale]/loading.tsx` | JS-i bloklanmış/sınmış ziyarətçi və bəzi botlar boş səhifə görür |

---

## 13. Uyğunsuzluqlar və yadda saxlanmalı qaydalar

### 13.1 Modullar arası uyğunsuzluqlar

| Mövzu | Davranış A | Davranış B |
|---|---|---|
| Slug başlıq dəyişəndə | səhifələr: **sabit qalır** | press-reliz, qanun, pul nişanı, PN xəbəri: **yenidən yaranır** |
| `PublishedAt = NULL` | qanunlar: görünür | press-reliz, PN xəbəri: gizli |
| Embargo | press-reliz, qanun, PN xəbəri | video, ana səhifə nəşri, şəkilli popup: yoxdur |
| `visible` | səhifə detalı: yoxlanılmır | ağac və axtarış: yoxlanılır |
| Silmə | 10 entity soft delete | qalanı hard delete |
| Tərcümə tələbi PUT-da | qanun: tələb olunur | press-reliz: tələb olunmur |
| Menyu görünürlüyü məntiqi | api-cbar `GetTree` | admin `menu-visibility.ts` + web `nav.ts` + web `isInSideNav` (sol menyu, spec 041) — əl ilə sinxron |
| CMS dəyişikliyinin görünmə gecikməsi | public sayt: 10 san keş, SWR, pod-başına (`cached.ts:65`); axtarış keşsiz | admin panel: TanStack `staleTime` 30 san + mutasiyadan sonra invalidasiya |
| CMS bölməsinin tanınması | slug ilə: `FEATURE_ROUTES`, header üst keçidləri, "Haqqımızda" layout-ları | başlıq ilə: footer naviqasiyası, "Haqqımızda" kökü, "(Kopya)" node-u |
| İcazə modeli | admin API: 98 kodluq RBAC, server hesablayır | admin panel: sabit 5 kodluq model, serverlə əlaqəsiz |

### 13.2 Mütləq qorunmalı qaydalar

1. **Yalnız `api-cbar-admin` yazır.** `api-cbar` read-only roldadır — bu DB qrantları ilə təmin olunur.
2. **Deploy sırası:** əvvəl admin API, sonra public API.
3. **`Cbar.Domain` və `MediaStorageOptions` hər iki API-də eynidir** — dəyişiklik ikisində birlikdə.
4. **Miqrasiya adları hər iki repo üzrə unikal**, append-only, `BEGIN/COMMIT`-siz.
5. **Public-də hər sorğu filtrlənir:** `published`, soft delete, `show_az/en`, `PublishedAt` embargo. Boş sayt adətən boş baza deməkdir, bug yox.
6. **XML feed (`/currencies/DD.MM.YYYY.xml`) kontraktdır** — element adları, sıra, 4 onluq format dəyişməməlidir.
7. **Məzənnə: bir gün + bir valyuta = bir məzənnə, > 0**, 4 onluq dəqiqlik.
8. **TipTap extension-larını silmək köhnə markup-ı silir** — dəyişiklikdən sonra round-trip yoxlaması.
9. **MinIO üçün `Minio` client** — AWS SDK-ya qayıtmaq olmaz.
10. **İki dil, slug hər dil üçün ayrıca** — dil dəyişdirici və SEO alternates bunu nəzərə almalıdır.
11. **Media məzmuna görə (SHA-256) ünvanlanır** — eyni fayl bir dəfə saxlanılır; istifadədə olan fayl silinmir.
12. **Səhifə ağacında hərəkət/silmə bayraqlarla idarə olunur** (`movable_*`, `removable*`) — köhnə cbar.az redaktor davranışının davamı.
13. **Admin API xətaları yalnız problem details** (`CbarControllerBase` helper-ləri, `new { message }` yox); `message` extension-ı və auth `code`-u panel oxuyur. DB xətası üçün `SaveChangesAsync`-i try/catch-ə salma — `DbExceptionHandler` xəritələyir.
14. **İstifadəçi dəyişikliyi (deaktiv, silmə, parol, rol) security stamp-ı eyni tranzaksiyada dəyişməlidir** — əks halda köhnə access token-lər 15 dəq yaşayır.
15. **Mövcud cədvəllərə (`users`, `azir_index_values` …) `ALTER TABLE` yox** — paylaşılan mühitlərdə sahibi başqa roldur; yeni sahə = yeni companion cədvəl (0007, 0008), FK yalnız `REFERENCES` icazəsi varsa.
16. **Hər yeni admin endpoint-i `[RequirePermission(Permissions.X.Y)]` ilə bağlanır** — string literal yox, `Permissions.cs` sabiti; OpenAPI-də `x-permission` eyni dəyişiklikdə. Atributsuz action admindən başqa hamıya 403 verir (default-deny).
17. **Yeni icazə kodu = `Permissions.cs` sabiti + `All` siyahısı + yeni migration** (kodu `permissions`-a əlavə edir, lazım olan rollara verir — **admin-ə heç vaxt**, admin kodda hamısını alır). `0009`-u dəyişmək olmaz. Admin icazələri bazadan oxunmamalıdır.
18. **Datadan asılı icazə yoxlaması heç bir entity dəyişdirilməzdən əvvəl edilir** (`PermissionChecker`).
19. **Public saytın keş ömrü bir yerdədir** — `CONTENT_REVALIDATE_SECONDS` (`web-cbar-new/src/server/cached.ts`). Bütün `features/*/api` ondan keçir, yalnız axtarış keşsizdir; keşi tam söndürmə — `api-cbar`-ın 1000/dəq limiti bütün sayt üçün ortaqdır.
20. **Ana səhifə blokları `views/home/blocks.ts`-dən (`HOME_BLOCKS`) yandırılır/söndürülür** — gizli blok silinmir. Spec 057-dən sonra mock blok qalmayıb (`mock.ts` silinib); yeni blok kodda sabit məzmunla prod-a çıxmamalıdır — ya API-dən, ya söndürülmüş.
21. **"Haqqımızda" markup kontraktı append-only-dir** (`specs/024-about-us-redesign/contracts/cms-markup.md`) — mövcud qaydanın mənasını dəyişmək artıq formaya salınmış CMS məzmununu pozur; tanınmayan forma **həmişə** adi məzmun kimi qalır, mətn atılmır. Kök başlığı (`Haqqımızda`/`About us`), layout slug-ları (`-copy` daxil) və təşkilat node-larının `navUrl`-i CMS-də dəyişdirilməməlidir; İdarə Heyətində sıra = vəzifə (birinci üzv sədrdir).
22. **Info-line alias → ana səhifə paneli xəritəsi** (`web-cbar-new/src/features/homepage/model/schemas.ts`) admin-in sabit alias siyahısı ilə (`web-cbar-admin-new/src/features/info-lines/model/module.ts`) əl ilə sinxron saxlanılır.
23. **Gəlirlilik əyrisinin 3 data dəsti müstəqildir və Excel xanaları köhnə şablonlarla eynidir** (B/C, A2–D2, C2:C8) — dəyişsə redaktorlara bildirilməlidir; import heç vaxt tarixin datasını yarımçıq qoymamalıdır (yoxlama → bir tranzaksiyada yazma).
