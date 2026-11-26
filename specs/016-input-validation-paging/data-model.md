# Data Model: Admin API-də sistemli input validation və səhifələmə limitləri

**Spec**: [spec.md](./spec.md) · **Research**: [research.md](./research.md) · **Tarix**: 2026-10-05

Sxem, migration və `Cbar.Domain` **dəyişmir**. Bu sənəd üç şeyi təyin edir: səhifələmə
anlayışını (8a), 400 cavabının formasını (8b) və **qayda inventarını** (8b, FR-012) — hər yazma
DTO-sunun hər sahəsi üçün qayda, mənbə və təsdiq.

Yollar `product-rest/api-cbar-admin/`-ə nisbidir. `C/X` = `src/Cbar.AdminApi/Controllers/XController.cs`,
`M1` = `db/migrations/0001-initial-schema.sql`, `M5`/`M6` = `0005-…`/`0006-…`.

## 1. Səhifələmə (8a)

| Anlayış | Sahələr | Qayda |
|---|---|---|
| `PagingQuery` (sorğu) | `Page: int?`, `PageSize: int?` — query `page`, `pageSize` | Bağlanma xətası (`abc`, `int` aşan) — bugünkü kimi avtomatik 400 |
| `PageWindow` (tətbiq olunan) | `Page`, `PageSize`, `Skip` | `Page`: `null`/`< 1` → 1, `> 100_000` → 100_000. `PageSize`: `null`/`< 1` → endpoint default-u, `> 100` → 100. `Skip = (Page-1)·PageSize` |
| Cavab zərfi (dəyişmir) | `items`, `total`, `page`, `pageSize` | `page`/`pageSize` = `PageWindow`-dan (FR-004) |

**Əhatə olunan 13 list action** (default-lar dəyişmir):

| Endpoint | Action | Default | Əlavə query |
|---|---|---|---|
| `GET /azir` | `C/Azir:17-38` | 50 | from, to, term |
| `GET /currency-rates/dates` | `C/CurrencyRates:46-60` | 20 | — |
| `GET /galleries` | `C/Galleries:24-47` | 20 | — |
| `GET /info-lines` | `C/InfoLines:24-49` | 50 | alias (sətirlər səhifələnir, sonra alias üzrə qruplaşır) |
| `GET /laws` | `C/Laws:23-55` | 20 | search, categoryId, status |
| `GET /meas-documents` | `C/MeasDocuments:24-61` | 20 | search, emitentId, infoTypeId, status |
| `GET /media` | `C/Media:35-50` | 24 | search |
| `GET /money-marks` | `C/MoneyMarks:140-171` | 20 | type, categoryId, status |
| `GET /money-mark-news` | `C/MoneyMarks:319-345` | 20 | search, status |
| `GET /press-releases` | `C/PressReleases:23-50` | 20 | search, status |
| `GET /users` | `C/Users:24-49` | 20 | search |
| `GET /videos` | `C/Videos:24-45` | 20 | — |
| `GET /yield-curves` | `C/YieldCurves:24-43` | 20 | — |

**Səhifələnməyən list-lər — toxunulmur** (spec edge case): banners, currencies, homepage-links,
homepage-publications, image-popups, inflation, law-categories, meas-emitents, meas-info-types,
money-mark-categories, organization/{divisions,offices,staff}, news-slider, running-lines,
video-streams, settings, pages tree.

## 2. 400 cavabı (8b)

`application/problem+json`, `ValidationProblemDetails` + `message` extension
([contracts/validation-error.md](./contracts/validation-error.md)):

| Sahə | Mənbə |
|---|---|
| `type`, `title`, `status` (400), `traceId` | ASP.NET standartı, bugünkü kimi |
| `errors: { [key]: string[] }` | Bütün xətalar; açar formaları aşağıda |
| `message` | İlk 3 mesaj `"; "` ilə, daha çoxu olsa `" (+N more)"` |

| Açar forması | Nümunə | Kim yazır |
|---|---|---|
| Top-level sahə | `Email`, `RoleId`, `Alias` | MVC (atribut) və ya controller (`AddModelError`) |
| Tərcümə sahəsi | `Translations[az].Title` | `TranslationsValidationFilter` |
| Naməlum locale | `Translations[ru]` | `TranslationsValidationFilter` |
| Boş lüğət | `Translations` | `TranslationsValidationFilter` |
| Siyahı sətri | `Rates[2].Rate`, `Yields[0].Period` | `IValidatableObject` |
| Sahələrarası | `EndsAt` | `IValidatableObject` |

## 3. Qayda inventarı (FR-012, SC-006)

**Qısaltmalar**: **R** — açıq `[Required]` (null, `""`, tam boşluq rədd); **(R)** — artıq gizli
`[Required]` var (null olmayan `string`), yalnız saxlanılır; **L n** — `[MaxLength(n)]` = sütunun
`varchar(n)`-i; **T** — `text`, limit yoxdur; **Mövcud → A** — controller-dəki əl ilə yoxlama
atributa/filterə köçür, mesaj eyni; **Mövcud → VP** — DB-yə baxan yoxlama controller-də qalır,
`{ message }` əvəzinə `ValidationProblem()` (eyni mesaj, açar sahə adı).
**Təklif** — sxemdə və ya bugünkü kodda dayağı olmayan yeni qayda; **istifadəçi təsdiqi
olmadan icra olunmur**. Təsdiq sütunu: ⬜ gözləyir · ✅ təsdiq · ❌ rədd.

Bütün tərcüməli DTO-lar üçün ortaq (filter, R5): locale açarı aktiv `locales.code`-dan biri
(FR-008); `RequiresTranslation` olan yerdə lüğət boş ola bilməz. Bunlar hər cədvəldə təkrar
yazılmır.

### 3.1 Məzmun (tərcüməli, slug-lı)

| DTO (fayl) | Sahə | Sütun | Qayda | Mənbə | Təsdiq |
|---|---|---|---|---|---|
| `PressReleaseUpsertDto` (`C/PressReleases:11-15`) | Type | smallint, şərh "1/2" | **Təklif**: 1..2 | M1:191 şərhi | ⬜ |
| | Translations | — | `RequiresTranslation` — **Update-də də** (bu gün yalnız Create-də, boş lüğət bütün tərcümələri silir) | `C/PressReleases:99`; known-issue | ⬜ |
| `TranslationDto` (`:10`) | Title | varchar(500) NOT NULL | (R) + R + L 500 | M1:206 | ⬜ |
| | Content | text | T | M1:208 | ⬜ |
| `LawUpsertDto` (`C/Laws:11-16`) | CategoryId | FK | Mövcud → VP ("Law category not found.") | `:72, :105` | ⬜ |
| | Type | smallint, şərh "1/2" | **Təklif**: 1..2 | M1 şərhi | ⬜ |
| `LawTranslationDto` (`:10`) | Title | varchar(500) NOT NULL | R + L 500 | M1:382-391 | ⬜ |
| | Description | text | T | M1 | ⬜ |
| `LawCategoryUpsertDto` / `…TranslationDto` (`C/LawCategories:10-14`) | Name | varchar(500) NOT NULL | R + L 500 | M1:361-367 | ⬜ |
| `PageUpsertDto` (`C/Pages:29-36`) | Translations | — | `RequiresTranslation` — **Update-də də** (bu gün yox, known-issue) | `:98`; `openapi.yaml` x-known-issues | ⬜ |
| | NavUrl | varchar(500) NULL | L 500 (URL sxemi #9-dur) | M1:131 | ⬜ |
| | ParentId | FK | Mövcud → VP ("Parent page not found.") | `:105` | ⬜ |
| `PageTranslationDto` (`:10`) | Title | varchar(500) NOT NULL | R + L 500 | M1:163 | ⬜ |
| | Slug | varchar(500) NOT NULL | L 500 (boş → başlıqdan; `Slug.From` 200-ə kəsir) | M1:164 | ⬜ |
| | Content | text | T (rich-text, sanitize #9) | M1:165 | ⬜ |
| `MoveDto` (`C/Pages:156`) | — | — | Mövcud 400-lər → VP; 409-lar **dəyişmir** (#7) | `:168-182` | ⬜ |
| `PageAssetAttachDto` (`:43`) | MediaId | FK | Mövcud → VP | `:248` | ⬜ |
| | Translations | nullable | `RequiresTranslation = false` (boş → `OriginalName`-dən az/en) | `:261-267` | ⬜ |
| | GroupLabel | varchar(100) NULL | L 100 | M1:175 | ⬜ |
| `PageAssetTranslationDto` (`:42`) | Title | varchar(500) NOT NULL | R + L 500 | M1:182 | ⬜ |
| `PageAssetUpdateDto` (`:44`) | Translations, GroupLabel | — | yuxarıdakı kimi; `RequiresTranslation` (mövcud `:281`) | | ⬜ |
| `PageAssetOrderDto` (`:45`) | AssetIds | — | Mövcud → VP | `:317` | ⬜ |
| `MoneyMarkUpsertDto` (`C/MoneyMarks:17-24`) | Type | smallint "1 banknot, 2 sikkə" | **Təklif**: 1..2 | M1:529 | ⬜ |
| | CategoryId, Front/RearMediaId | FK | Mövcud → VP | `:257-261` | ⬜ |
| `MoneyMarkTranslationDto` (`:16`) | Title | varchar(500) NOT NULL | R + L 500 | M1:545 | ⬜ |
| | Description, SecurityFeatures | text | T | M1:547-548 | ⬜ |
| `MoneyMarkCategoryTranslationDto` (`:10`) | Name | varchar(500) NOT NULL | R + L 500 | M1:522 | ⬜ |
| `MoneyMarkNewsTranslationDto` (`:26`) | Title | varchar(500) NOT NULL | R + L 500 | M1:568 | ⬜ |
| | Content | text | T | M1:570 | ⬜ |
| `MeasDocumentUpsertDto` (`C/MeasDocuments:10-16`) | Dqn | varchar(100) NULL | L 100 | M1:438 | ⬜ |
| | EmitentId, InfoTypeId, MediaId | FK | Mövcud → VP | `:139-143` | ⬜ |
| `MeasLookupTranslationDto` (`C/MeasLookups:10`) | Name | varchar(500) NOT NULL | R + L 500 | M1:414, :429 | ⬜ |

### 3.2 Ana səhifə, media blokları

| DTO (fayl) | Sahə | Sütun | Qayda | Mənbə | Təsdiq |
|---|---|---|---|---|---|
| `BannerUpsertDto` (`C/Banners:11-17`) | Translations | — | `RequiresTranslation => MediaId is null` (mövcud "A banner needs an image or at least one translation." mesajı saxlanılır) | `:50, :80` | ⬜ |
| | StartsAt/EndsAt | timestamptz NULL | **Təklif**: ikisi də varsa `StartsAt <= EndsAt` (açar `EndsAt`) | — | ⬜ |
| | MediaId | FK | Mövcud → VP | `:52, :82` | ⬜ |
| `BannerTranslationDto` (`:10`) | Title | varchar(500) **NULL** | L 500, **məcburi deyil** (şəkilli banner başlıqsız ola bilər) — FR-007-nin istisnası | M1:656-663 | ⬜ |
| | Link | varchar(1000) NULL | L 1000 (sxem #9) | M1 | ⬜ |
| `GalleryTranslationDto` (`C/Galleries:10`) | Title | varchar(500) NOT NULL | R + L 500 | M1:589-595 | ⬜ |
| `GalleryAttachImageDto`, `GalleryImageOrderDto` (`:16-17`) | — | — | Mövcud → VP; 409 dəyişmir | `:122-125, :158` | ⬜ |
| `HomepageLinkTranslationDto` (`C/HomepageLinks:10`) | Title | varchar(500) NOT NULL | R + L 500 | M1:712-719 | ⬜ |
| | Url | varchar(1000) NOT NULL | R + L 1000 (sxem #9) | M1 | ⬜ |
| `HomepagePublicationTranslationDto` (`C/HomepagePublications:10`) | Title | varchar(500) NOT NULL | R + L 500 | M1:731-738 | ⬜ |
| | Url | varchar(1000) NULL | L 1000 | M1 | ⬜ |
| `ImagePopupUpsertDto` (`C/ImagePopups:12-15`) | Title | varchar(500) NOT NULL | Mövcud → A: R + L 500 (trim `Normalize`-da qalır) | `:124-127`, M6 | ⬜ |
| | Translations | — | locale yoxlaması filterə keçir (bu gün `is_active`-ə baxmır); "At least one locale must have an image." controller-də qalır → VP | `:129-137` | ⬜ |
| `ImagePopupTranslationDto` (`:11`) | AltText | varchar(500) NULL | Mövcud → A: L 500 | `:153` | ⬜ |
| | Link | varchar(1000) NULL | Mövcud qalır (sxem + uzunluq, `:151`) → VP | `:151-164` | ⬜ |
| | MediaId | FK | Mövcud → VP ("Media asset not found.", "…must be an image.") | `:140-147` | ⬜ |
| `NewsSliderTranslationDto` (`C/NewsSlider:10`) | Title | varchar(500) NOT NULL | R + L 500 | M1:680 | ⬜ |
| | Description | text | T | M1:681 | ⬜ |
| | Link | varchar(1000) NULL | L 1000 | M1:682 | ⬜ |
| `RunningLineUpsertDto` (`C/RunningLines:11-15`) | StartsAt/EndsAt | timestamptz NULL | **Təklif**: `StartsAt <= EndsAt` | — | ⬜ |
| `RunningLineTranslationDto` (`:10`) | Text | varchar(1000) NOT NULL | R + L 1000 | M1:700 | ⬜ |
| `VideoUpsertDto` (`C/Videos:11-16`) | YoutubeUrl | varchar(500) NOT NULL | (R) + L 500 (host yoxlaması #9) | M1:606 | ⬜ |
| `VideoTranslationDto` (`:10`) | Title | varchar(500) NOT NULL | R + L 500 | M1:620 | ⬜ |
| `VideoStreamUpsertDto` (`C/VideoStreams:11-15`) | StreamUrl | varchar(500) NOT NULL | (R) + L 500 | M1:626 | ⬜ |
| `VideoStreamTranslationDto` (`:10`) | Title | varchar(500) NOT NULL | R + L 500 | M1:637 | ⬜ |

### 3.3 Struktur, kataloqlar

| DTO (fayl) | Sahə | Sütun | Qayda | Mənbə | Təsdiq |
|---|---|---|---|---|---|
| `DivisionTranslationDto` (`C/Organization:10`) | Name | varchar(500) NOT NULL | R + L 500 | M1:464 | ⬜ |
| | Description | text | T | M1:465 | ⬜ |
| `OfficeTranslationDto` (`:17`) | Name | varchar(500) NOT NULL | R + L 500 | M1:481 | ⬜ |
| | Address | varchar(1000) NULL | L 1000 | M1:482 | ⬜ |
| | Phone | varchar(100) NULL | L 100 | M1:483 | ⬜ |
| `StaffUpsertDto` (`:24-30`) | Type | smallint "1 idarə heyəti, 2 rəhbərlik" | **Təklif**: 1..2 | M1:489 | ⬜ |
| | Phone | varchar(100) NULL | L 100 | M1:492 | ⬜ |
| `StaffTranslationDto` (`:23`) | FullName | varchar(**300**) NOT NULL | R + L 300 | M1:502 | ⬜ |
| | Position, ReceptionDays | varchar(500) NULL | L 500 | M1:503-504 | ⬜ |
| | Bio | text | T | M1:505 | ⬜ |
| `InfoLineUpsertDto` (`C/InfoLines:12-17`) | Alias | varchar(100) NOT NULL | Mövcud → A: R + L 100 | `:63, :91`, M1 | ⬜ |
| | Year | smallint NULL | **Təklif**: 1900..2100 | — | ⬜ |
| `InfoLineTranslationDto` (`:11`) | Title | varchar(500) NOT NULL | R + L 500 | M1:314-321 | ⬜ |
| | Value | varchar(500) NULL | L 500 | M1 | ⬜ |

### 3.4 Maliyyə məlumatı

| DTO (fayl) | Sahə | Sütun | Qayda | Mənbə | Təsdiq |
|---|---|---|---|---|---|
| `CurrencyRateSheetDto` (`C/CurrencyRates:12`) | Rates | — | Mövcud (boş, dublikat kod) → A (`IValidatableObject`); "Unknown currency codes" → VP | `:65-78` | ⬜ |
| `CurrencyRateItemDto` (`:11`) | Rate | numeric(12,4) `CHECK > 0` | `> 0` və `< 10^8`; mesaj valyuta kodu ilə, açar `Rates[i].Rate` (FR-010) | M1:266 | ⬜ |
| | CurrencyCode | char(3) | (R) + uzunluq 3 | M1 | ⬜ |
| `CurrencyMasterUpdateDto` (`C/Currencies:10`) | — | — | yeni qayda yoxdur | | ⬜ |
| `AzirUpsertDto` (`C/Azir:10`) | Term | varchar(10) NOT NULL | Mövcud → A: R + L 10 | `:44`, M1:277-285 | ⬜ |
| | Rate | numeric(8,4) | `|x| < 10^4` (aşan → bu gün 500). İşarə qaydası yoxdur — AZIR mənfi ola bilər | M1 | ⬜ |
| `InflationUpsertDto` (`C/Inflation:10`) | Month | smallint `CHECK 1..12` | Mövcud → A: `[Range(1,12)]` | `:37`, M1 | ⬜ |
| | ParameterCode | varchar(50) NOT NULL | Mövcud → A: R + L 50 | `:39`, M1 | ⬜ |
| | Value | numeric(10,4) | `|x| < 10^6` | M1 | ⬜ |
| | Year | smallint | **Təklif**: 1900..2100 | — | ⬜ |
| `InflationSettingsDto` (`:12`) | TargetInflation | varchar(255) NOT NULL | Mövcud → A: R + L 255 (trim qalır) | `:86-90`, M5 | ⬜ |
| | CurrentInflation | numeric(6,2) | Mövcud → A: `(-10000, 10000)` | `:91` | ⬜ |
| `YieldCurveUpsertDto` (`C/YieldCurves:13-16`) | Yields | — | Mövcud "Duplicate period" → A (`IValidatableObject`); 409 dəyişmir | `:61, :94` | ⬜ |
| `YieldCurveParametersDto` (`:11`) | Beta0..2, Lambda | numeric(12,6) | `|x| < 10^6` | M1:337-340 | ⬜ |
| `YieldPointDto` (`:12`) | Period | varchar(20) NOT NULL | (R) + L 20 | M1:347 | ⬜ |
| | Yield | numeric(8,4) | `|x| < 10^4` | M1:348 | ⬜ |

### 3.5 İstifadəçilər, auth, media, settings

| DTO (fayl) | Sahə | Sütun | Qayda | Mənbə | Təsdiq |
|---|---|---|---|---|---|
| `UserCreateDto` (`C/Users:11`) | Username | citext NOT NULL, limitsiz | Mövcud → A: R. **Təklif**: L 100 (sxemdə limit yoxdur) | `:64` | ⬜ |
| | Email | citext NOT NULL | Mövcud → A: R + **`[EmailAddress]`** (FR-011) | `:66` | ⬜ |
| | Password | → bcrypt hash | Parol siyasəti controller-də qalır → VP (açar `Password`). **Təklif**: L 72 bayt — bcrypt 72 baytdan sonrasını nəzərə almır | `:68, :196-209` | ⬜ |
| | RoleId | FK | Mövcud → VP ("Role not found.") | `:72` | ⬜ |
| `UserUpdateDto` (`:12`) | Email | citext | Mövcud → A: R + `[EmailAddress]` | `:104` | ⬜ |
| | RoleId | FK | Mövcud → VP | `:108` | ⬜ |
| `UserPasswordResetDto` (`:13`) | NewPassword | | Parol siyasəti → VP; L 72 təklifi kimi | `:151` | ⬜ |
| `LoginRequest` (`C/Auth:13`) | — | — | **Əhatədən kənar** (FR-016): heç bir atribut əlavə olunmur, cavab spec 011/012 kimi qalır | | ⬜ |
| Media upload (`C/Media:139-195`) | file | `original_name varchar(255)` | **Əhatədən kənar** — ad, magic byte, streaming #11-dir | | ⬜ |
| `SettingUpsertDto` (`C/Settings:12`) | Value / route `key` | jsonb / varchar(100) | yeni qayda yoxdur; mövcud "Value is required." → VP | `:39` | ⬜ |

**Toxunulmayan qaydalar** (bu spec-in işi deyil): 409-lar (dublikat, "Already attached",
son admin, movable flags) — #7; URL sxemi / HTML sanitize — #9; slug toqquşmaları — #15;
`Status`/`PublishedAt` uyğunluğu — yeni biznes qaydasıdır, review-da yoxdur.

## 4. Kontrakt interfeysi (kod səviyyəsində)

| Ad | Forma | İstifadə |
|---|---|---|
| `IHasTranslations` | `IEnumerable<KeyValuePair<string, object>>? TranslationEntries`, `bool RequiresTranslation => true`, `string MissingTranslationMessage => "At least one translation is required."` (banner override edir) | Hər tərcüməli upsert DTO-su açıq həyata keçirir; filter yalnız bunu tanıyır |
| `TranslationsValidationFilter` | qlobal, `Order = -2001` | locale + tərcümə atributları + boş lüğət (R5) |
| `ValidationResponse.Create` | `InvalidModelStateResponseFactory` | `message` əlavə edir (R4) |
| `PagingQuery` / `PageWindow` | bax §1 | 13 list action |
