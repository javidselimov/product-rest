# Research: Mərkəzi Bankın loqosu

## R1. Məzmun mənbəyi: markup + səhifə faylları

- **Decision**: Versiyalar redaktorun birinci cədvəlindən, yükləmələr səhifənin fayllarından (`page_assets`).
- **Rationale**: Hər ikisi admin paneldə bu gün var. `GET /api/v1/pages/{slug}` faylın adını (dilə görə), `mimeType`, `sizeBytes` və `/media/{id}` ünvanını verir (`api-cbar` `PagesController.cs:52-95`). Backend dəyişikliyi və deploy sırası yoxdur. Redaktor `class`/`div` saxlamır, cədvəl isə saxlanır (spec 037 R-təcrübəsi). Cədvəl xanasında şəkil işləyir (`fixtures/history.html`).
- **Alternatives**: ayrıca məzmun növü (spec 038/039 kimi, 4 MR + miqrasiya `0024`) — istifadəçi A-nı seçdi. Faylları da cədvəldə keçid kimi vermək — ölçü məlum olmazdı, redaktor faylı iki yerdə idarə edərdi.

## R2. Slug-lar

- **Decision**: `MEDIA_LAYOUTS`-a `merkezi-bankin-logosu`, `merkezi-bankin-logosu-copy`, `central-bank-logo`, `central-bank-logo-copy`.
- **Rationale**: Test API-də səhifə `553` az slug-ı ilə var, EN tərcüməsi boşdur. `mediaLayoutFor` dilsizdir, slug-lar dillər arasında toqquşmur. `-copy` digər Media layout-larında olduğu kimi redaktorun hazırlıq nüsxəsidir.
- **Alternatives**: page id ilə tanımaq — mühitlər arasında id fərqlənir, mövcud qayda slug-dır.

## R3. Ünvan və yönləndirmə

- **Decision**: Yeni marşrut və `legacyRedirect` yoxdur. Ünvan `/{locale}/media/{slug}` (mövcud catch-all, menyu `hrefFor`).
- **Rationale**: Köhnə saytda səhifə yox idi (`product-host`-da "loqo" yoxdur). Səhifə ağacdadır, menyu və breadcrumb onsuz da işləyir. `/az/merkezi-bankin-logosu` kimi qısa ünvan da mövcud catch-all ilə açılır.
- **Alternatives**: `/media/logo` sabit marşrutu (`FEATURE_ROUTES` + 308) — kod və test artırır, fayda vermir.

## R4. Fon (açıq/tünd)

- **Decision**: 4-cü xana istəyə bağlıdır. Mətn `tünd`, `tund`, `dark` (kiçik hərflə, boşluqsuz) olduqda tünd, qalan hallarda açıq. Tünd fon `brand-500` (#004976, Figma `2071:3517`), açıq `#F9F9F9` (`--site-surface`).
- **Rationale**: Ağ loqo ağ fonda görünmür. Redaktor rəng seçə bilmir, sözlə seçim ən sadəsidir. `ı`/`İ` qatlaması lazım deyil.
- **Alternatives**: fonu şəklin adından (`ag-*.svg`) çıxarmaq — gizli qayda, redaktor bilməz.

## R5. Hero

- **Decision**: Birinci versiyanın şəkli, ayrıca sahə yoxdur. Şəkil yoxdursa Hero göstərilmir. Hero-nun fonu birinci versiyanın fonudur (Figma-da açıq).
- **Rationale**: Figma-da Hero birinci kartın böyüdülmüş halıdır.

## R6. Yükləmə kartı: format çipi və ölçü

- **Decision**: Çip = faylın adı (redaktorun "Fayllar"-da yazdığı), boşdursa uzantı böyük hərflə. Uzantı üçün yeni `fileFormatLabel(mime, name)`: MIME xəritəsi (`image/svg+xml` → SVG, `image/png` → PNG, `application/postscript` → EPS, `application/pdf` → PDF, `application/zip` → ZIP), sonra addakı uzantı. Ölçü üçün `formatFileSize(bytes, locale)` `entities/content`-ə köçür (bu gün `features/organization/model/photos.ts`-də `formatPhotoSize` kimi var, `formatNumber` + `splitFileSize`): az "1,2 MB", en "1.2 MB". `sizeBytes <= 0` ölçü göstərmir.
- **Rationale**: Mövcud `fileExtension` yalnız sənəd növlərini tanıyır və `fileIcon` ona bağlıdır: ora SVG/PNG əlavə etmək mövcud olmayan `/site/svg.svg` ikonunu çağırardı. `formatPhotoSize` başqa feature-dədir, FSD feature→feature importa icazə vermir.
- **Alternatives**: Faylın adını həmişə çip etmək — redaktor uzun ad yazsa çip qırılar; buna görə çip bir sətirdə qalır, uzun mətn sətrə bölünür.

## R7. Endirmə

- **Decision**: `<a href="/media/{id}" download>`. Başqa origin yoxdur, `/media/{id}` saytın öz proxy marşrutudur (`app/media/[id]/route.ts`), `download` atributu işləyir.
- **Rationale**: JS lazım deyil, server komponentində qalır.

## R8. Faylların təkrar görünməməsi

- **Decision**: `views/cms-page/index.tsx` CSR kimi bu layout-da da `Attachments`-i göstərmir, şərt blok növü ilə yoxlanır (`brand-logos` blokunun özü faylları göstərir).
- **Rationale**: FR-008. Qayda tanınmasa (cədvəl uymur), blok yenə `brand-logos`-dur və faylları yükləmə kartı kimi göstərir, mətn adi məzmun kimi qalır. Fayllar heç vaxt itmir.

## R9. Bölmə başlığı "Loqo versiyaları"

- **Decision**: Redaktorun markup-ındadır (cədvəldən əvvəl `h2`). Kodda yoxdur.
- **Rationale**: Redaksiya mətni API-dəndir (root CLAUDE.md). Cədvəldən əvvəlki məzmun Hero ilə şəbəkə arasında göstərilir ki, başlıq Figma yerinə düşsün. Yükləmə sətrinin Figma-da başlığı yoxdur, cədvəldən sonrakı məzmun yükləmə sətrindən əvvəl göstərilir.
