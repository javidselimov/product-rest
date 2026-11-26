# Research: Admin paneldə şəkillərin önizləməsi

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md) | **Date**: 2026-10-01

Technical Context-də açıq sual qalmadı. Aşağıdakı qərarlar mövcud koda baxılaraq verilib.

## R1. Şəkil panelə haradan gəlir

**Decision**: `api-cbar-admin`-ə yeni endpoint əlavə olunur: `GET /api/v1/media/{id}/preview`.
O, `[Authorize]` ilə qorunur və şəklin baytlarını MinIO-dan stream edir. Kontrakt:
[contracts/admin-api.md](./contracts/admin-api.md).

**Rationale**:
- Admin API hazırda yalnız metadata qaytarır (`GET /media`: id, ad, mime, ölçü, en/hündürlük).
  Faylın özünü verən endpoint yoxdur.
- Public `api-cbar`-da `GET /media/{id}` var, amma panelin ona müraciəti Maddə III.1 ilə
  qadağandır. Spec 009 R5-də siyahıda thumbnail olmamasının səbəbi də bu idi.
- Stream məntiqi `api-cbar/.../MediaController.cs`-də artıq sınanıb: callback stream,
  `Content-Length` yoxdur, çünki miqrasiya olunmuş sətirlərin `size_bytes`-i yanlışdır. Eyni yanaşma
  `MediaStorage`-ə `GetAsync` metodu kimi köçürülür. Kod deyil, davranış köçürülür:
  repo-lar ayrıdır, paylaşılan kod yoxdur (Maddə II.4).

**Alternatives considered**:
- *Public `/media/{id}`-dən istifadə*: Maddə III.1 pozulur. Bundan əlavə, panel public saytın ünvanını bilməli olardı. Rədd edildi.
- *MinIO presigned URL*: MinIO deploy mühitlərində brauzerə açıq deyil. Bundan əlavə, imzalı ünvan girişdən asılı olmadan paylaşıla bilər. Rədd edildi.
- *Mövcud `GET /media` cavabına `url` sahəsi əlavə etmək*: ünvan yenə girişsiz açılmalı olardı (R2). Rədd edildi.

## R2. Qorunan şəkil `<img>`-də necə göstərilir

**Decision**: Panel şəkli mövcud `apiClient` ilə `responseType: 'blob'` olaraq alır. Bu zaman
`Authorization: Bearer` header-i, sessiya refresh-i və 401 axını interceptor-lardan gəlir.
Blob TanStack Query keşində `['media', 'preview', id]` açarı ilə saxlanılır. Komponent ondan
`URL.createObjectURL` ilə `blob:` ünvanı yaradır və unmount olanda `revokeObjectURL` çağırır.

**Rationale**:
- Access token yalnız yaddaşdadır (spec 005, template Maddə V). `<img src>` header göndərə bilmir.
  Refresh cookie isə `Path=/api/v1/auth` ilə məhdudlaşıb, ona görə media sorğusuna getmir.
- Tokeni query string-ə qoymaq template Maddə X.3 ilə qadağandır: token URL-də, server
  log-larında və brauzer tarixçəsində görünərdi.
- Query keşi eyni şəklin bir səhifədə təkrar endirilməsinin qarşısını alır (FR-017).
  Komponent səviyyəsində object URL hər istifadəçinin öz ünvanıdır, ona görə revoke
  başqa komponentin şəklini sındırmır.
- Endpoint `Cache-Control: private, max-age=31536000, immutable` qaytarır. Məzmun SHA-256 ilə
  ünvanlandığına görə bu təhlükəsizdir. Brauzerin HTTP keşi səhifə yenilənəndən sonra da
  təkrar endirmənin qarşısını alır. `private` olduğu üçün paylaşılan proxy keşləmir.

**Alternatives considered**:
- *`?access_token=` query parametri*: Maddə X.3. Rədd edildi.
- *Media üçün ayrıca auth cookie*: API-də yeni cookie, CSRF səthi və CORS dəyişikliyi tələb edir. Rədd edildi.
- *Qısa ömürlü HMAC imzalı URL*: işləyir, amma API-də açar idarəsi və müddət məntiqi lazımdır. Blob yanaşması ilə müqayisədə üstünlüyü yalnız native `loading="lazy"`-dir. Bu da R5 ilə həll olunur. Rədd edildi.

## R3. Şəkil olmayan fayl (FR-005) və mime-ı bilinməyən sahə

**Decision**: Endpoint mime tipini DB-dən oxuyur. `image/*` deyilsə, baytları göndərmədən
**415** qaytarır. Panel 415-i "önizləmə yoxdur, ikon göstər" kimi şərh edir. Mime-ı artıq bilinən
yerlərdə sorğu heç göndərilmir:
- media seçici, media kitabxanası və assets siyahıları `mimeType` ilə gəlir;
- seçicidən yenicə seçilmiş fayl üçün `MediaIdField` `item.mimeType`-ı yadda saxlayır.

**Rationale**: Generic CRUD formasının detail cavabında yalnız `mediaId` və (bəzən) `mediaName` var,
mime yoxdur. 200 MB PDF-i "şəkil deyil" olduğunu öyrənmək üçün endirmək olmaz. Server qərarı
ucuzdur: bir DB sətri.

**Alternatives considered**:
- *Bütün detail DTO-larına `mediaMimeType` əlavə etmək*: 13 cədvəl və onlarla DTO dəyişməli olardı. Rədd edildi.
- *Əvvəlcə `HEAD` sorğusu*: hər şəkil üçün iki sorğu olur. Rədd edildi.
- *Fayl adının uzantısına görə təxmin*: `mediaName` hər modulda yoxdur və etibarlı deyil. Yalnız əlavə siqnal ola bilər, qərar serverindir.

## R4. SVG təhlükəsizliyi (FR-014)

**Decision**:
- Panel SVG-ni yalnız `<img>` elementində göstərir. `<img>` skript icra etmir və xarici resurs yükləmir.
- `<object>`, `<iframe>`, `dangerouslySetInnerHTML` və SVG-nin inline DOM kimi göstərilməsi istifadə olunmur.
- Endpoint əlavə müdafiə kimi bu başlıqları qaytarır: `X-Content-Type-Options: nosniff`, `Content-Security-Policy: default-src 'none'; style-src 'unsafe-inline'; sandbox` və `Content-Disposition: inline`. Beləcə ünvan birbaşa tabda açılsa da, skript icra olunmur.

**Rationale**: Upload whitelist-i `.svg`-yə icazə verir (`MediaController.AllowedTypes`) və mock
şəkillər SVG-dir. `blob:` ünvanı panelin origin-ini daşıyır, ona görə SVG heç vaxt sənəd kimi
açılmamalıdır. Lightbox-da da `<img>` istifadə olunur.

## R5. Çoxlu önizləmə (SC-006, edge case "50+ şəkil")

**Decision**: Önizləmə komponenti görünən sahəyə daxil olana qədər sorğu göndərmir. Bunu
`IntersectionObserver` əsaslı kiçik `useInView` hook-u edir (`rootMargin: 200px`, yeni dependency yoxdur).
Seçici və kitabxana səhifə başına 24 element göstərir (`MEDIA_PAGE_SIZE`). Query `staleTime: Infinity`,
`gcTime: 5 dəq` ilə işləyir, `retry: false`. 415 və 404 cavabları təkrarlanmır.

**Rationale**: Blob yanaşmasında native `loading="lazy"` işləmir. Server thumbnail yaratmır
(spec Assumptions), ona görə böyük fotoların yalnız lazım olanda endirilməsi vacibdir.
Testdə `IntersectionObserver` jsdom-da yoxdur. Hook onun olmamasını "görünür" kimi qəbul edir.

**Alternatives considered**: *Server tərəfdə thumbnail* — spec xaricindədir, `ImageSharp` kimi
yeni dependency və saxlama tələb edir. Gələcək təkmilləşdirmə kimi qeyd olunur.

## R6. UI yerləşməsi və komponent strukturu

**Decision**:
- Yeni ortaq komponentlər `features/media/`-də yaranır. Bu slice-ı artıq `crud`, `assets`, `galleries`, `pages` istifadə edir, FSD istiqaməti dəyişmir.
  - `MediaPreview`: kiçik çərçivə və vəziyyətlər (yüklənir, şəkil, ikon, xəta).
  - `MediaLightbox`: kit `Dialog`. Esc və fokus qaytarılması kit-dən gəlir.
- Fetch funksiyası `media.service.preview(id)`, hook isə `useMediaPreview(id, enabled)` olur.
- `MediaIdField` sahəsi `#id · ad` mətnini və düymələri saxlayır, solunda 96×96 önizləmə görünür.
- Seçici kartlarında, kitabxana grid-ində, qalereya və assets sətirlərində mövcud mime ikonunun yerini şəkillər üçün eyni ölçülü `MediaPreview` tutur.

**Rationale**: Bütün media sahələri `field-control.tsx` → `MediaIdField`-dən keçir. Bir komponenti
dəyişmək P1-i 7 modulun hamısında (homepage, image-popups, meas, money-marks, organization və s.)
birdən həll edir. `perLocale` sahələr hər dil üçün ayrıca `MediaIdField` render edir, ona görə FR-004 avtomatik təmin olunur.

## R7. Testlər

**Decision**:
- MSW-ə `GET /api/v1/media/:id/preview` handler-i əlavə olunur. Şəkil fixture-ları üçün kiçik SVG/PNG blob, digərləri üçün 415, olmayan id üçün 404 qaytarır.
- Testlər `renderApp` ilə real axını yoxlayır:
  - redaktə formasında `img[alt=<ad>]` görünür;
  - yeni seçim önizləməni dəyişir;
  - "Təmizlə" önizləməni silir;
  - PDF-də ikon görünür və `img` yoxdur;
  - 404-də yer tutucu görünür;
  - lightbox açılır və Esc ilə bağlanır.
- jsdom-da `URL.createObjectURL` yoxdur, ona görə `vitest.setup`-da polyfill verilir. Bu, ağır dependency mock-udur, davranış assert-i deyil.

**Rationale**: Template Maddə VI: real davranış testi, mock assert-i qadağandır.
