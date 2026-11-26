# Feature Specification: `web-cbar-new` public saytının performans optimizasiyası

**Feature Branch**: `003-performance-optimization`

**Created**: 2026-09-22

**Status**: Draft

**Input**: User description: "C:\Users\javid_salimov\Desktop\jspace\common\commonrabc\web-cbar-new bu saytda analiz et hansi optimallasma etmek olar ki sehifeler tez yuklensin shekillerde falan hansi optimallashma etmek olar"

## Məqsəd və əhatə

`web-cbar-new` spec 002 ilə funksional olaraq tamamlanıb, amma performans heç vaxt
ölçülməyib və optimallaşdırılmayıb — spec 002 "keşləmə/revalidasiya strategiyası"nı
açıq şəkildə **əhatədən kənar** saxlamışdı. Bu spec həmin təxirə salınmış işi görür:
səhifə yüklənmə sürəti ölçülür, dörd konkret səbəb aradan qaldırılır və nəticə
yenidən ölçülür.

Funksional davranış **dəyişmir**: eyni 18 route, eyni `api-cbar` çağırışları, eyni
ekran məzmunu. Dəyişən yalnız həmin məzmunun brauzerə necə və nə qədər tez çatmasıdır.

**Hədəf proyektlər**: `web-cbar-new` (əsas iş) və `api-cbar` (yalnız media cavab
başlıqları + response compression). Upstream-də bunlar iki müstəqil GitLab
repo-sudur, ona görə iş **iki ayrı merge request**-dir. `api-cbar-admin`,
`web-cbar-admin-new` və verilənlər bazası sxemi toxunulmur.

**Əhatəyə daxil deyil**: yeni funksiya, yeni səhifə, dizayn dəyişikliyi, CDN
quraşdırılması, şəkillərin `api-cbar` tərəfində resize edilməsi (bax D1),
`api-cbar-admin` tərəfdə revalidate webhook-u (gələcək spec).

## Ölçülən baza (2026-09-22, prod build)

Bu checkout-da `npm run build` icra olunub və ana səhifə (`/az`) real
`next start` serverindən çəkilib. Rəqəmlər təxmin deyil:

| Metrika | Dəyər |
| --- | --- |
| Ana səhifə client JS | 1 956 KB xam / ~420 KB gzip, 26 chunk |
| CSS | 127 KB xam / 21 KB gzip |
| ECharts (lazy chunk-lar) | əlavə ~1.1 MB xam |
| `<img>` sayı (ana səhifə) | 8 — heç birində `loading`, `width`/`height`, `fetchpriority` yoxdur |
| Route-lar | 18-i də `ƒ Dynamic` — server keşi sıfır |
| `GET /media/{id}` cavab başlıqları | `Content-Type` + `Content-Disposition` — `Cache-Control` və `ETag` **yoxdur** |

### Aşkarlanan dörd səbəb

1. **Şəkillər heç vaxt keşlənmir.** `api-cbar/src/Cbar.WebApi/Controllers/MediaController.cs`
   keş başlığı yazmır. Fayllar MinIO-da SHA-256 ilə content-addressed saxlanılır
   (`MediaAsset.ChecksumSha256`) — məzmun dəyişməzdir, uzun keş təhlükəsizdir.
2. **`zod` client bundle-ındadır.** Zəncir: `src/providers/app-providers.tsx`
   (`'use client'`) → `src/providers/query-client.ts` → `src/shared/api/app-error.ts`
   → `zod`. Build çıxışında təsdiqləndi (`$ZodError`, `_zod`, `safeParse` vendor
   chunk-ında). Brauzer heç nə validate etmir — bütün sxem yoxlaması `server-only`
   `src/server/api-client.ts`-dədir.
3. **ECharts barrel import edilir.** `src/widgets/chart-card/chart.tsx` dinamik
   `import('echarts/charts')` və `import('echarts/components')` işlədir. Dinamik
   namespace import-u tree-shake olunmur; build chunk-larında `geo/map`, `dataZoom`,
   `toolbox` var, halbuki yalnız Line + Bar + Grid + Tooltip + Legend + Canvas lazımdır.
4. **Şəkillər brauzerdən birbaşa `api-cbar`-a gedir.** `mediaUrl()` mütləq
   `{API_URL}/media/{id}` ünvanı qurur. Bu, spec 002 research R2-nin "brauzer API-yə
   birbaşa müraciət etmir" prinsipinin yeganə pozulduğu yerdir və məhz buna görə nə
   keş, nə resize, nə WebP/AVIF tətbiq oluna bilmir.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Təkrar ziyarətçi şəkilləri yenidən endirmir (Priority: P1)

Ziyarətçi bir press-relizi açır, geri qayıdır, başqa səhifəyə keçir və yenidən həmin
relizə qayıdır. İkinci dəfə şəkillər şəbəkədən **enmir** — brauzer keşindən gəlir.

**Why this priority**: Ən böyük trafik qənaəti, ən az kod. Hazırda hər səhifə
baxışında hər şəkil sıfırdan enir; cbar.az kimi məzmun saytında bu, trafikin böyük
hissəsidir.

**Independent Test**: `.\dev.ps1 -Seed` ilə stack qaldırılır; DevTools Network-də
ikinci baxışda şəkil sətirləri `304` və ya `(from disk cache)` göstərir.

**Acceptance Scenarios**:

1. **Given** media asset mövcuddur, **When** `GET /media/1` çağırılır, **Then** cavabda
   `Cache-Control: public, max-age=31536000, immutable` və `ETag` başlıqları olur.
2. **Given** brauzerdə keşlənmiş şəkil var, **When** eyni `ETag` ilə `If-None-Match`
   göndərilir, **Then** server `304 Not Modified` qaytarır və gövdə göndərmir.
3. **Given** ziyarətçi qalereya səhifəsini ikinci dəfə açır, **When** səhifə yüklənir,
   **Then** heç bir şəkil üçün yeni tam endirmə olmur.

---

### User Story 2 - Şəkillər ekran ölçüsünə uyğun və müasir formatda gəlir (Priority: P1)

Ziyarətçi qalereya səhifəsini açır. 3 sütunlu grid-də hər xanaya CMS-in orijinal
2–4 MP JPEG-i yox, həmin xananın enində, AVIF/WebP formatında variant gəlir. Ekrandan
kənardakı şəkillər scroll edilənə qədər ümumiyyətlə enmir.

**Why this priority**: Qalereya və siyahı səhifələri hazırda saytın ən ağır
səhifələridir; bir ekranlıq məzmun üçün on megabaytlarla orijinal şəkil endirilir.

**Independent Test**: Qalereya səhifəsi açılır; DevTools-da şəkil ünvanları
`/_next/image?url=…&w=…` formasındadır, `Content-Type` `image/avif` və ya
`image/webp`-dir, ekrandan kənar şəkillər ilkin yükdə yoxdur.

**Acceptance Scenarios**:

1. **Given** qalereyada 30 şəkil var, **When** səhifə açılır, **Then** yalnız görünən
   sahədəki şəkillər endirilir; qalanları scroll zamanı gəlir.
2. **Given** ziyarətçi mobil ekrandadır, **When** şəkil endirilir, **Then** endirilən
   variantın eni ekran enindən böyük deyil.
3. **Given** ana səhifə açılır, **When** slayder render olunur, **Then** yalnız birinci
   slaydın şəkli prioritetlə endirilir, qalan slaydlar lazy-dir.

---

### User Story 3 - Səhifələr daha az JavaScript ilə açılır (Priority: P2)

Ziyarətçi istənilən səhifəni açır. Brauzer heç vaxt işlətməyəcəyi kod — server tərəf
sxem validasiyası (`zod`) və istifadə olunmayan ECharts modulları (xəritə, dataZoom,
toolbox) — artıq endirilmir.

**Why this priority**: Zəif şəbəkə və zəif cihazda hydration vaxtını birbaşa azaldır.
Davranış dəyişmədiyi üçün riski aşağıdır.

**Independent Test**: `npm run build`; ana səhifənin chunk-larında `$ZodError` və
`GeoModel`/`ToolboxModel`/`DataZoomModel` string-ləri **tapılmır**.

**Acceptance Scenarios**:

1. **Given** prod build çıxarılıb, **When** ana səhifənin yüklədiyi chunk-lar skan
   olunur, **Then** `zod` runtime-ı orada deyil.
2. **Given** ziyarətçi ana səhifəni açır, **When** qrafiklər render olunur, **Then**
   inflyasiya, pul bazarı və yield curve qrafikləri əvvəlki kimi işləyir və tema
   dəyişəndə rəngləri yenilənir.

---

### User Story 4 - Səhifə HTML-i daha tez gəlir (Priority: P2)

Ziyarətçi ana səhifəni açır. Server hər sorğuda `api-cbar`-a ~10 çağırış etmir —
qısa müddətli keşdən oxuyur. Redaktor CMS-də dəyişiklik edəndə həmin dəyişiklik
ən çox **bir dəqiqə** ərzində saytda görünür.

**Why this priority**: TTFB-yə birbaşa təsir edir və `api-cbar` üzərindəki yükü
kəskin azaldır. Spec 002-nin açıq şəkildə təxirə saldığı iş budur.

**Independent Test**: Ana səhifə ardıcıl iki dəfə açılır; `logs/api-web.log`-da
ikinci açılış üçün sorğu sətirləri görünmür.

**Acceptance Scenarios**:

1. **Given** ana səhifə bir dəfə açılıb, **When** 60 saniyə içində yenidən açılır,
   **Then** `api-cbar`-a yeni sorğu getmir.
2. **Given** redaktor CMS-də press-relizin başlığını dəyişir, **When** 60 saniyə
   keçir, **Then** yeni başlıq public saytda görünür.
3. **Given** ziyarətçi axtarış səhifəsində sorğu yazır, **When** nəticələr gəlir,
   **Then** nəticələr keşlənmir — hər sorğu təzədir.

---

### User Story 5 - Yavaş API səhifəni bloklamır (Priority: P3)

`api-cbar`-ın bir bloku yavaş cavab verəndə ziyarətçi boş ekrana baxmır: sayt qabığı,
başlıq və menyu dərhal gəlir, yavaş blok öz yerində skeleton göstərir.

**Why this priority**: Hiss olunan sürəti artırır, amma Faza 1–6-dan sonra qazanc
daha kiçikdir.

**Independent Test**: `api-cbar` süni yavaşladılır; header və menyu qrafiklərdən
əvvəl görünür.

**Acceptance Scenarios**:

1. **Given** bir API bloku yavaşdır, **When** ana səhifə açılır, **Then** qabıq və
   naviqasiya dərhal render olunur.
2. **Given** bir blok xəta verir, **When** səhifə render olunur, **Then** yalnız həmin
   kart `ErrorState` göstərir — qalan bloklar normal işləyir (mövcud davranış qorunur).

---

### Edge Cases

- **Faza 1 hələ deploy olmayıb, Faza 5 olub.** Media proxy route upstream-dən keş
  başlığı gəlmədiyini görür və öz fallback-ını (`public, max-age=3600`) qoyur.
- **CMS məzmunundakı `<img>` etiketləri.** `dangerouslySetInnerHTML` ilə render olunur,
  `next/image`-ə çevrilə bilmir. Bunlar relativ `/media/{id}` qalır (proxy route-dan
  keş alır) və `rewriteMediaUrls` onlara `loading="lazy"` inject edir.
- **Xarici CMS şəkilləri** (`https://…` ilə başlayan mütləq ünvanlar) proxy-dən
  keçmir, olduğu kimi qalır — CSP-də `img-src https:` onsuz da var.
- **Media faylı şəkil deyil** (PDF, DOCX, ZIP — `attachments` widget-i). Proxy route
  onları da ötürür; `next/image`-ə verilmir.
- **Media id-si etibarsızdır** (`/media/abc`, `/media/../secret`). Proxy route yalnız
  rəqəm qəbul edir, qalanına 404 verir.
- **Redaktor dəyişikliyi gözləmək istəmir.** 60 saniyə qəbul edilmiş həddir; tam
  dərhal görünmə `revalidateTag` + admin webhook tələb edir (gələcək spec).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: `GET /media/{id}` cavabı `ETag` başlığı qaytarmalıdır; dəyər asset-in
  `ChecksumSha256` sahəsindən gəlir.
- **FR-002**: `GET /media/{id}` cavabı `Cache-Control: public, max-age=31536000, immutable`
  qaytarmalıdır.
- **FR-003**: Sorğuda `If-None-Match` mövcud `ETag` ilə üst-üstə düşürsə, server
  obyekt saxlayıcısına müraciət etmədən `304` qaytarmalıdır.
- **FR-004**: `GET /media/{id}` cavabı `Content-Length` qaytarmalıdır.
- **FR-005**: `api-cbar` mətn cavablarını (JSON, XML) Brotli/Gzip ilə sıxmalıdır;
  şəkil və video MIME tipləri sıxılmamalıdır.
- **FR-006**: Brauzer media fayllarını `api-cbar` origin-indən **birbaşa** istəməməlidir;
  bütün media sorğuları `web-cbar-new` origin-indən keçməlidir.
- **FR-007**: Media proxy yalnız rəqəmli id qəbul etməli, qalan hər şeyə 404 verməlidir.
- **FR-008**: Media proxy upstream-in `Content-Type`, `Content-Length`, `ETag` və
  `Cache-Control` başlıqlarını ötürməli; upstream `Cache-Control` verməyibsə öz
  fallback-ını qoymalıdır.
- **FR-009**: Raster şəkillər `next/image` optimizer-i vasitəsilə render olunmalı,
  AVIF və ya WebP formatında və konteyner ölçüsünə uyğun enlə verilməlidir.
- **FR-010**: Ekrandan kənardakı şəkillər ilkin yükdə endirilməməlidir; ana səhifə
  slayderində yalnız birinci slaydın şəkli prioritetlidir.
- **FR-011**: Hər `<img>`/`<Image>` elementi ölçü məlumatı daşımalıdır ki, şəkil
  yüklənəndə layout sıçramasın.
- **FR-012**: CMS HTML-indəki `<img>` etiketlərinə `loading="lazy"` və
  `decoding="async"` əlavə olunmalıdır.
- **FR-013**: `zod` runtime-ı client bundle-ına düşməməlidir.
- **FR-014**: ECharts-dan yalnız faktiki istifadə olunan modullar (Line, Bar, Grid,
  Tooltip, Legend, Canvas renderer) bundle-a düşməlidir.
- **FR-015**: Məzmun API cavabları server tərəfdə 60 saniyə keşlənməlidir.
- **FR-016**: CMS səhifə ağacı (`getPagesTree`) 300 saniyə keşlənməlidir.
- **FR-017**: Axtarış nəticələri keşlənməməlidir.
- **FR-018**: İstifadə olunmayan statik asset-lər (`coin_bg.png`, `money_bg.png`)
  image-ə düşməməlidir.
- **FR-019**: Sayt qabığı (başlıq, menyu, altlıq) məzmun bloklarını gözləmədən
  render olunmalıdır.
- **FR-020**: Bütün mövcud funksional davranış — 18 route, ekran məzmunu, blok-səviyyə
  xəta idarəsi, az/en dil keçidi, tema keçidi — dəyişməz qalmalıdır.

### Key Entities

Yeni entity yoxdur. Toxunulan mövcud anlayışlar:

- **MediaAsset** (`api-cbar/src/Cbar.Domain/Entities/Content.cs`) — `ChecksumSha256`
  artıq mövcuddur və `ETag` mənbəyi olur; `SizeBytes` `Content-Length` olur;
  `Width`/`Height` sahələri mövcuddur, amma public DTO-lara **çıxarılmır** (bu spec
  API kontraktını dəyişmir).
- **Media ünvanı** — hazırda `{API_URL}/media/{id}` mütləq ünvanı; bu specdən sonra
  same-origin `/media/{id}` relativ yolu.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Təkrar səhifə baxışında endirilən şəkil bayt-larının sayı sıfırdır
  (bütün şəkil sorğuları `304` və ya brauzer keşindən).
- **SC-002**: Qalereya səhifəsinin ilkin şəkil yükü baza ölçmə ilə müqayisədə ən azı
  **70%** azalır.
- **SC-003**: Ana səhifənin ilkin client JS-i ~420 KB gzip-dən **≤ 330 KB gzip**-ə düşür.
- **SC-004**: ECharts lazy chunk-larının cəmi ~1.1 MB xam-dan **≤ 450 KB xam**-a düşür.
- **SC-005**: Ana səhifənin ikinci açılışında `api-cbar`-a gedən sorğu sayı **0**-dır
  (60 saniyə pəncərəsi daxilində).
- **SC-006**: Prod build chunk-larında `$ZodError`, `GeoModel`, `ToolboxModel`,
  `DataZoomModel` string-ləri tapılmır.
- **SC-007**: `npm run verify` (lint → typecheck → test → build) keçir.
- **SC-008**: `dotnet build` `api-cbar`-da keçir.
- **SC-009**: Spec 002-nin paritet checklist-i
  (`specs/002-public-site-template-migration/checklists/parity.md`) hələ də keçir —
  heç bir funksional reqressiya yoxdur.
- **SC-010**: CMS-də edilən redaktə public saytda ən çox 60 saniyəyə görünür.

## Assumptions

- **Content-addressed saxlama.** `api-cbar-admin/MediaStorage` faylları SHA-256 ilə
  content-addressed saxlayır (root `CLAUDE.md`), yəni verilmiş `id` üçün bayt-lar
  dəyişmir. `immutable` keş bu fakta söykənir. Əgər gələcəkdə bir asset-in məzmunu
  eyni id altında dəyişdirilə bilsə, bu qərar yenidən baxılmalıdır.
- **`sharp` mövcuddur.** `next/image` optimizer-i prod-da `sharp` tələb edir; bu
  checkout-da `sharp` və `@img` artıq `.next/standalone/node_modules`-a trace olunur,
  yəni Docker image-ində əlavə addım lazım deyil.
- **60 saniyə redaktorlar üçün qəbul ediləndir.** Bu, istifadəçi ilə razılaşdırılıb.
  Daha sərt tələb yaranarsa `revalidateTag` + admin webhook ayrı specdə qurulur.
- **Reverse proxy sıxma etmir.** `api-cbar`-a response compression əlavə olunur;
  əgər deploy mühitindəki ingress onsuz da sıxırsa, bu addım zərərsiz təkrardır
  (`Content-Encoding` iki dəfə tətbiq olunmur).
- **Iki MR, sərt olmayan deploy sırası.** Frontend Faza 1-siz `api-cbar` ilə də
  işləyir (proxy route öz fallback keşini qoyur), ona görə deploy sırası tövsiyədir,
  məcburiyyət deyil.

## Kənarlaşmalar registri (template konstitusiyası üzrə)

- **D1 — Şəkil optimizasiyası `next/image` ilə, `api-cbar`-da resize ilə deyil.**
  `api-cbar`-a ImageSharp əlavə etmək hər iki panelə və gələcək istehlakçılara fayda
  verərdi, amma yeni backend NuGet asılılığı, yeni endpoint kontraktı və MinIO-da
  variant keşi tələb edir. `next/image` eyni nəticəni yalnız frontend tərəfdə verir.
  **Şərt**: `images.remotePatterns` build zamanı `required-server-files.json`-a
  serialize olunur (bu checkout-da yoxlandı), `API_URL` isə runtime env-dir — bir
  image bütün mühitlərə promote olunur (root `CLAUDE.md`). Ona görə media
  **same-origin route handler** ilə proxy olunur; bu, həm build-time/runtime
  ziddiyyətini həll edir, həm də spec 002 research R2-nin "brauzer API-yə birbaşa
  getmir" prinsipini bərpa edir (FR-006), həm də CSP-yə toxunmağa ehtiyac qoymur.

- **D2 — `src/shared/api/app-error.ts` ikiyə bölünür.** Konstitusiya Maddə VII.2 xəta
  axınını (`normalizeApiError` → `AppError` → TanStack Query → UI) təyin edir və bu
  axın dəyişmir; yalnız fayl sərhədi dəyişir. Zod-dan asılı hissə
  (`apiErrorPayloadSchema`, `schemaMismatch`, `normalizeApiError`, `parseOrThrow`)
  `server-only` fayla köçür, `AppError` class-ı və `AppErrorKind` isə təmiz qalır.
  Səbəb: `query-client.ts` client modulundan `AppError`-u import edir və bununla
  bütün zod runtime-ını client bundle-ına dartır.

- **D3 — `cache: 'no-store'` qərarı 60/300 saniyə revalidate ilə əvəzlənir.**
  Root `CLAUDE.md` və spec 002 keşsizliyi şüurlu qərar kimi qeyd etmişdi ("Caching/
  revalidation is a later, deliberate step"). Bu spec həmin "later, deliberate
  step"-dir. TanStack Query (Maddə II, Maddə V) yığında qalır və silinmir — yalnız
  `query-client.ts`-in import zənciri təmizlənir.

- **D4 — `dangerouslySetInnerHTML` ilə render olunan CMS `<img>`-ləri `next/image`-ə
  çevrilmir.** Maddə X.1 istisnası (sanitizasiya olunmuş CMS məzmunu) spec 002-də
  artıq qeydə alınıb; bu spec həmin boruya yalnız `loading="lazy"` inject edir və
  sanitizasiya məntiqinə toxunmur.

- **D5 — YouTube önizləmələri `next/image`-dən keçmir.** `src/views/media/index.tsx`-dəki
  video kartları `https://i.ytimg.com/vi/{id}/hqdefault.jpg` ünvanını işlədir. Bu,
  sabit hostdur (runtime env-dən asılı deyil), fayl onsuz da 480×360 və ~10–20 KB-dır,
  həm də YouTube-un öz CDN-indən keşli gəlir. Onu proxy-dən və optimizer-dən keçirmək
  ölçü qazandırmır, əvəzində gecikmə və server yükü əlavə edərdi. Ona görə `<img>`
  qalır, amma `loading="lazy"`, `decoding="async"` və `width`/`height` alır (FR-010,
  FR-011 ödənilir). Eyni mülahizə `public/site/` altındaki lokal SVG ikonlara da
  aiddir (bayraqlar, fayl tipi ikonları, loqo, sosial şəbəkə ikonları): vektor
  fayllar rasterləşdirilmir, yalnız ölçü atributu alır.
