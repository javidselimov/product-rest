# Tasks: `web-cbar-new` public saytının performans optimizasiyası

**Input**: [spec.md](./spec.md), [plan.md](./plan.md)

**Tracker**: root-dakı `OPTIMIZASIYA-PLANI.md` — gündəlik irəliləyiş və ölçmə
nəticələri orada saxlanılır.

## Format: `[ID] [P?] [Story] Description`

- **[P]** — paralel icra oluna bilər (fərqli fayllar, asılılıq yoxdur)
- **[US1…US5]** — spec.md-dəki user story
- Fayl yolları repo kökündən verilir

## Path Conventions

- `api-cbar/` — MR #1 (müstəqil GitLab repo-su)
- `web-cbar-new/` — MR #2 (müstəqil GitLab repo-su)

---

## Phase 0: Sənədləşmə

- [x] **T001** `specs/003-performance-optimization/spec.md` yazılıb
- [x] **T002** `specs/003-performance-optimization/plan.md` yazılıb
- [x] **T003** `specs/003-performance-optimization/tasks.md` (bu fayl) yazılıb
- [x] **T004** Root-da `OPTIMIZASIYA-PLANI.md` tracker-i yaradılıb

**Verification**: `cd web-cbar-new && npm run check:self-contained`

---

## Phase 1: `api-cbar` media keş başlıqları (US1) 🎯 Ən böyük qaytarım

**Repo**: `api-cbar` → MR #1. Bu faza tək başına deploy oluna bilər.

- [x] **T005** [US1] `MediaController.Get` sorğusunun `Select` proyeksiyasına
      `ChecksumSha256` və `SizeBytes` əlavə et —
      `api-cbar/src/Cbar.WebApi/Controllers/MediaController.cs:68-71`
- [x] **T006** [US1] Asset tapılandan sonra `ETag` hesabla:
      `new EntityTagHeaderValue($"\"{asset.ChecksumSha256}\"")` (FR-001)
- [x] **T007** [US1] `If-None-Match` uyğun gəlirsə MinIO-ya **getmədən**
      `StatusCode(StatusCodes.Status304NotModified)` qaytar (FR-003)
- [x] **T008** [US1] `Cache-Control: public, max-age=31536000, immutable` qoy — callback
      stream-in içində, digər başlıqlarla bir yerdə (FR-002)
- [x] **T009** [US1] `Response.ContentLength = asset.SizeBytes` (FR-004)
- [x] **T010** [US1] `AddResponseCompression` (Brotli + Gzip, `EnableForHttps = true`) +
      `UseResponseCompression()` — `UseRateLimiter()`-dən **əvvəl**;
      `api-cbar/src/Cbar.WebApi/Program.cs` (FR-005)
- [x] **T011** [US1] MIME siyahısına `application/json`, `application/xml`, `text/xml`
      əlavə et; şəkil/video tiplərini siyahıdan kənarda saxla (FR-005)

**Verification (Phase 1)**:
```bash
cd api-cbar && dotnet build
# stack: .\dev.ps1   (api-cbar-admin ƏVVƏL qalxır — migration + cbar_web_ro rolu)
curl -I http://localhost:5139/media/1
#   → Cache-Control: public, max-age=31536000, immutable
#   → ETag: "<sha256>"
#   → Content-Length: <bayt>
curl -I -H 'If-None-Match: "<yuxarıdakı etag>"' http://localhost:5139/media/1   # → 304
curl -sI -H 'Accept-Encoding: br' http://localhost:5139/currencies | grep -i content-encoding
```
Nəticəni `OPTIMIZASIYA-PLANI.md`-yə yaz. ✅ SC-001 yoxlanıla bilər.

---

## Phase 2: Sıfır-risk asset təmizliyi

**Repo**: `web-cbar-new` → MR #2 başlayır.

- [x] **T012** [P] `web-cbar-new/public/site/coin_bg.png` (172 KB) və
      `money_bg.png` (168 KB) sil — `src`-də bir dəfə də istinad yoxdur (FR-018)
- [x] **T013** [P] `public/site/logo-az.svg` (84 KB) və `logo-en.svg` (80 KB)
      SVGO ilə optimallaşdır: `npx svgo --precision=2 public/site/logo-*.svg`.
      Mətn outline-a çevrilib — gözlənilən nəticə ~25 KB
- [x] **T014** `src/shell/site-header.tsx:40` loqo `<img>`-inə `width={228} height={56}`
      əlavə et (SVG viewBox-dan) (FR-011)
- [x] **T015** `src/shell/site-footer.tsx:37` loqo `<img>`-inə eyni ölçüləri əlavə et
- [x] **T016** `src/shell/site-footer.tsx:94` sosial ikon `<img>`-lərinə
      `width={36} height={36}` əlavə et (`size-9` class-ına uyğun)

**Verification (Phase 2)**:
```bash
cd web-cbar-new && npm run verify
```
Saytı aç: header və footer loqosu **az və en**, **işıqlı və qaranlıq** temada
vizual olaraq eynidir. Sosial ikonlar yerindədir.

---

## Phase 3: Bundle — zod sızmasını bağla (US3)

- [x] **T017** [US3] `src/shared/api/app-error.ts`-dən zod-dan asılı hər şeyi çıxar;
      qalsın: `AppErrorKind`, `FALLBACK_MESSAGE`, `AppError`, `kindFromStatus`.
      `import { z } from 'zod'` sətri silinir (FR-013)
- [x] **T018** [US3] Yeni `src/shared/api/app-error-parse.ts` yarat, başında
      `import 'server-only'`; içində: `apiErrorPayloadSchema`, `ApiErrorPayload`,
      `schemaMismatch`, `normalizeApiError`, `parseOrThrow`. Azərbaycanca şərhlər
      köçür, Maddə VII.2 axını izah edilsin
- [x] **T019** [US3] `src/server/api-client.ts:18` — `normalizeApiError` və
      `parseOrThrow` yeni fayldan, `AppError` köhnədən import olunsun
- [x] **T020** [US3] `src/providers/query-client.ts:9` yalnız `app-error`-dan
      `AppError` import etsin; `NON_RETRYABLE` dəsti dəyişmir
- [x] **T021** [US3] Mövcud `app-error` testlərini yeni fayl bölgüsünə uyğunlaşdır
      (`src/shared/api/` altındakı test faylları)
- [x] **T022** [US3] `src/shared/ui/error-state.tsx:14` yoxla — `import type`
      işlədir, dəyişiklik lazım deyil (təsdiq tapşırığı)

**Verification (Phase 3)**:
```bash
cd web-cbar-new && npm run verify && npm run build
grep -l '\$ZodError' .next/static/chunks/*.js    # ana səhifənin chunk-larında OLMAMALIDIR
```
✅ SC-006 (zod hissəsi). Gözlənilən: ~30 KB gzip azalma.

---

## Phase 4: Bundle — ECharts leaf import (US3)

- [x] **T023** [US3] `src/widgets/chart-card/chart.tsx:105-119` — barrel `import()`-ləri
      leaf modullarla əvəz et (FR-014):
      `echarts/core`, `echarts/lib/chart/line`, `echarts/lib/chart/bar`,
      `echarts/lib/component/grid`, `echarts/lib/component/tooltip`,
      `echarts/lib/component/legend`, `echarts/lib/renderer/installCanvasRenderer`
- [x] **T024** [US3] `core.use([...])` blokunu sil — leaf modullar özləri
      `use(install)` çağırır (plan.md §3)
- [x] **T025** [US3] `buildOption` funksiyasına **toxunma** — ECharts option kontraktı
      və tema `MutationObserver` məntiqi dəyişmir
- [x] **T026** [P] [US3] `src/views/home/index.test.tsx` echarts mock-larını yenilə
- [x] **T027** [P] [US3] `src/views/finance.test.tsx` echarts mock-larını yenilə
- [x] **T028** [P] [US3] `src/widgets/chart-card/chart-card.test.tsx` mock-larını yenilə
- [x] **T029** [P] [US3] `src/widgets/home-cards/home-cards.test.tsx` mock-larını yenilə

**Verification (Phase 4)**:
```bash
cd web-cbar-new && npm run verify && npm run build
grep -l 'GeoModel\|ToolboxModel\|DataZoomModel' .next/static/chunks/*.js   # boş olmalıdır
du -ch .next/static/chunks/*.js | tail -1
```
Stack ilə **gözlə yoxla**: ana səhifədə inflyasiya, pul bazarı, yield curve
qrafikləri; `/az/statistics` səhifəsi; tema keçidində qrafik rənglərinin yenilənməsi.
✅ SC-004, SC-006.

---

## Phase 5: Media proxy + `next/image` (US1, US2) — ən böyük faza

### 5a — Proxy route

- [x] **T030** [US1] `src/app/media/[id]/route.ts` yarat — `{env.API_URL}/media/{id}`-dən
      stream edir (FR-006, FR-008)
- [x] **T031** [US1] `id` guard: yalnız rəqəm; qalanına 404 (FR-007, SSRF qapısı)
- [x] **T032** [US1] Upstream `Content-Type`, `Content-Length`, `ETag`, `Cache-Control`
      ötürülsün; `If-None-Match` upstream-ə ötürülsün, 304 olduğu kimi qaytarılsın
- [x] **T033** [US1] Upstream `Cache-Control` verməyibsə (Faza 1 hələ deploy olmayıbsa)
      fallback: `public, max-age=3600`
- [x] **T034** [US1] Xəta → 404; API mesajı istifadəçiyə çatmasın (Maddə VII.3)
- [x] **T035** [US1] ⚠️ `src/proxy.ts:78` matcher-ə `media` istisnası əlavə et:
      `['/((?!_next|api|media|.*\\..*).*)']` — **bunsuz route handler heç vaxt
      çağırılmır**, `/media/12` → `/az/media/12` redirect olunur (plan.md §2)
- [x] **T036** [US1] `src/proxy.test.ts`-ə `/media/12` case-i əlavə et: redirect
      **olmamalıdır**
- [x] **T037** [P] [US1] Route handler üçün test: rəqəmsiz id → 404; upstream 404 → 404

### 5b — Mərkəzi URL dəyişikliyi

- [x] **T038** [US1] `src/entities/content/lib/media-url.ts` — nisbi yol artıq
      `{apiUrl}` ilə birləşdirilmir, `/media/12` olduğu kimi qaytarılır. Mütləq
      `http(s)://…` ünvanlar (xarici CMS şəkilləri) dəyişmir
- [x] **T039** [US1] `src/entities/content/lib/content-lib.test.ts:11-26`
      `mediaUrl` testlərini yenilə
- [x] **T040** [US2] `src/shared/lib/cms-html.ts:25-35` — `rewriteMediaUrls` artıq
      `/media/{id}`-ni mütləq ünvana çevirmir. `MEDIA_SRC` regex-i saxlanılır, amma
      indi `loading="lazy" decoding="async"` inject edir (FR-012, D4)
- [x] **T041** [US2] `src/shared/lib/cms-html.test.ts` və
      `src/shared/testing/fixtures/cms-html.ts` fixture-larını yenilə

### 5c — `<img>` → `<Image>` miqrasiyası

Hər birində `sizes` doğru verilməlidir, yoxsa optimizer ən böyük variantı seçir.

- [x] **T042** [US2] `src/widgets/hero-slider/hero-slider.tsx:70` — **LCP elementi**.
      Birinci slayd `priority`, qalanları `loading="lazy"` (FR-010). Hazırda bütün
      slaydlar eyni anda DOM-dadır və hamısının şəkli dərhal enir
- [x] **T043** [P] [US2] `src/views/gallery/index.tsx:27` — **ən ağır səhifə**,
      grid-də orijinal 2–4 MP JPEG-lər. `sizes` grid breakpoint-lərinə uyğun
- [x] **T044** [P] [US2] `src/views/media/index.tsx:81,115` — qalereya və video kartları
- [x] **T045** [P] [US2] `src/widgets/content-list/content-list.tsx:46` — 112 px
      thumbnail (`w-28`), sabit `width`/`height`
- [x] **T046** [P] [US2] `src/views/money-marks/index.tsx:70` və
      `src/views/money-mark/index.tsx:23,30` — `object-contain`, sabit ölçü
- [x] **T047** [P] [US2] `src/views/organization/index.tsx:21` və
      `src/views/staff-member/index.tsx:25` — portret şəkillər
- [x] **T048** [P] [US2] `src/views/press-release/index.tsx:25` — detal şəkli
- [x] **T049** [P] [US2] `src/widgets/attachments/attachments.tsx:78` — qoşma şəkilləri
      (`:42` fayl **ikonudur** — lokal SVG, `next/image` işlədilmir)
- [x] **T050** [P] [US2] `src/widgets/home-cards/links-grid.tsx:33` və
      `news-tabs.tsx:47` — nəşr və xəbər kartları
- [x] **T051** [US2] Lokal SVG ikonlar — `next/image` **işlədilmir**, yalnız
      `width`/`height` əlavə olunur: `src/widgets/home-cards/currency-card.tsx:43`
      (bayraqlar, `size-5`), `src/widgets/attachments/attachments.tsx:42` (`w-10`)
- [x] **T052** [US2] `next.config.ts`-ə `images` bloku:
      `formats: ['image/avif', 'image/webp']`. `remotePatterns` **lazım deyil** —
      hər şey same-origin (D1)
- [x] **T053** [US2] `@next/next/no-img-element` ESLint disable şərhlərini sil
      (çevrilmiş yerlərdə artıq lazım deyil)

**Verification (Phase 5)**:
```bash
cd web-cbar-new && npm run verify
npm run docker:build      # sharp + @img onsuz da standalone-a trace olunur
```
Stack-i qaldır, DevTools Network-də yoxla:
- şəkillər `/_next/image?url=%2Fmedia%2F…&w=…&q=75` ünvanındandır
- `Content-Type: image/avif` və ya `image/webp`
- ikinci baxışda `304` / `(from disk cache)`
- qalereya səhifəsinin ilkin yükü bazadan ≥70% azdır
- ekrandan kənar şəkillər scroll edilənə qədər **enmir**
- `attachments` səhifəsində PDF/DOCX keçidləri hələ də işləyir
- CMS məzmunundakı şəkillər görünür və `loading="lazy"` daşıyır

✅ SC-001, SC-002.

---

## Phase 6: Keşləmə (US4)

- [x] **T054** [US4] `src/server/cached.ts` — `unstable_cache` üzərində nazik sarğı:
      açar prefiksi, `revalidate`, `tags`. `import 'server-only'`
- [x] **T055** [US4] `src/features/pages/api/pages.api.ts` → `getPagesTree`
      **300 s**, tag `pages` (FR-016). Hər səhifədə `[locale]/layout.tsx`-dən
      çağırılır — ən çox təkrarlanan sorğu
- [x] **T056** [P] [US4] `src/features/currencies/api/currencies.api.ts` → 60 s
- [x] **T057** [P] [US4] `src/features/homepage/api/homepage.api.ts` → 60 s
- [x] **T058** [P] [US4] `src/features/press-releases/api/press-releases.api.ts` → 60 s
- [x] **T059** [P] [US4] `src/features/stats/api/stats.api.ts` → 60 s
- [x] **T060** [P] [US4] `src/features/media/api/media.api.ts` → 60 s
- [x] **T061** [P] [US4] `src/features/laws/api/laws.api.ts` → 60 s
- [x] **T062** [P] [US4] `src/features/organization/api/organization.api.ts` → 60 s
- [x] **T063** [P] [US4] `src/features/money-marks/api/money-marks.api.ts` → 60 s
- [x] **T064** [P] [US4] `src/features/meas/api/meas.api.ts` → 60 s
- [x] **T065** [US4] `src/features/search/api/search.api.ts` — **keşlənmir** (FR-017),
      açıq şərhlə qeyd et
- [ ] ~~**T066** [US4] `export const dynamic = 'force-dynamic'` sətirlərini route
      fayllarından sil~~ — **İCRA EDİLMƏDİ, qərar dəyişdi.** Ölçmə göstərdi ki
      (a) `unstable_cache` bu direktivlə birlikdə işləyir (367 ms → 27 ms) və
      (b) direktivi silmək route-u statik etmir, çünki root `layout.tsx`
      `cookies()`/`headers()` oxuyur. Fayda ölçülmədi, gizli risk isə var —
      direktiv niyyəti sənədləşdirir və qalır. Səbəb `src/server/cached.ts`-dədir
- [ ] ~~**T067** [US4] `src/app/metadata.test.ts:61` testini yenilə~~ — T066 icra
      edilmədiyi üçün lazım deyil; test olduğu kimi keçir
- [x] **T068** [US4] `src/views/home/loader.ts` waterfall-ına izahedici şərh
- [x] **T068a** [US4] *(planda yox idi)* `src/shared/testing/setup.ts`-də
      `next/cache` mock-landı — `unstable_cache` jsdom-da incremental cache store
      tapmır və mock-suz 66 test düşürdü (Maddə VI.2: framework konteksti)

**Verification (Phase 6)**:
```bash
cd web-cbar-new && npm run verify && npm run build
# route siyahısında artıq hamısı ƒ Dynamic olmamalıdır
```
Stack ilə: ana səhifəni iki dəfə aç → `logs/api-web.log`-da ikinci açılış üçün sorğu
yoxdur. CMS-də bir press-relizin başlığını dəyiş → **60 saniyə içində** saytda görünür.
Axtarış səhifəsində iki fərqli sorğu → hər ikisi təzə nəticə verir.
✅ SC-005, SC-010.

---

## Phase 7: Streaming (US5)

- [x] **T069** [US5] `src/app/[locale]/loading.tsx` — mövcud
      `src/shared/ui/loading-state.tsx` komponentindən istifadə et, yenisini yazma
      (FR-019)
- [ ] **T070** ⛔ *(dayandırıldı)* [US5] Ana səhifəni blok-blok `<Suspense>`-ə böl:
      `src/views/home/loader.ts`-dəki `settle()` fan-out-u bloklara ayrılır.
      `errors: {…}` strukturu onsuz da blok-səviyyə xəta sərhədləri üçün qurulub —
      həmin sərhədlərdən istifadə et, yenisini icad etmə
- [ ] **T071** ⛔ *(dayandırıldı)* [P] [US5] `press-releases` siyahı səhifəsi üçün eyni nümunə
- [ ] **T072** ⛔ *(dayandırıldı)* [P] [US5] `laws` siyahı səhifəsi üçün eyni nümunə
- [ ] **T073** ⛔ *(dayandırıldı)* [P] [US5] `media` siyahı səhifəsi üçün eyni nümunə

> **T070–T073 dayandırıldı.** Ölçmə göstərdi ki əsas fayda — route səviyyəli
> yüklənmə faylının qabığı məzmundan əvvəl axıtması — artıq alınıb (3.8 s vs 6.7 s,
> API-yə 3 s süni gecikmə ilə). Qalan gecikmə səhifədə yox, layout-un səhifə ağacını
> gözləməsindədir; səhifə daxilindəki Suspense onu qısaltmır. Üstəlik HomeView
> şərtli düzümdür və bu sessiyada vizual yoxlama imkanı yoxdur.
> Tam əsaslandırma: OPTIMIZASIYA-PLANI.md, Faza 7.
- [x] **T074** [US5] Maddə VII.4 yoxlaması: `loading.tsx` mövcud
      `EmptyState`/`ErrorState` vəziyyətlərini **əvəz etmir**, tamamlayır

**Verification (Phase 7)**:
```bash
cd web-cbar-new && npm run verify
```
`api-cbar`-ı süni yavaşlat (breakpoint və ya `Task.Delay`) → header, menyu və altlıq
qrafiklərdən əvvəl görünür. Bir blok xəta verəndə yalnız həmin kart `ErrorState`
göstərir. Lighthouse: LCP və TTFB qeyd et.

---

## Phase 8: i18n tək dil (opsional)

> `src/shared/i18n/index.ts` şərhində "dəst kiçikdir, kod bölünməsi yoxdur" yazılıb —
> bu **şüurlu qərardır**. Qazanc ~35 KB xam (~10 KB gz). Faza 1–7 bitəndən sonra ölç,
> SC-003 hələ də keçmirsə et.

- [ ] **T075** Aktiv dilin kataloqunu dinamik seç (`import()` locale-ə görə)
- [ ] **T076** `src/shared/i18n/server.ts` (`getT`) server tərəfdə hər iki dilə
      çıxışı saxlasın
- [ ] **T077** `key-parity.test.ts` və `utf8-guard.test.ts` hər iki kataloqu
      yoxlamağa davam etsin

**Verification (Phase 8)**: `npm run verify`; hər iki dildə saytı gəz, dil keçidini yoxla.

---

## Yekun verification (MR-lərdən əvvəl)

- [ ] **T078** `cd api-cbar && dotnet build` ✅ SC-008
- [ ] **T079** `cd web-cbar-new && npm run verify` ✅ SC-007
- [ ] **T080** `npm run docker:build` — standalone image qalxır
- [ ] **T081** Tam stack `.\dev.ps1 -Seed` (sıra: `api-cbar-admin` → `api-cbar` →
      frontend-lər) və 18 route-un hamısı hər iki dildə gəzilir
- [ ] **T082** `specs/002-public-site-template-migration/checklists/parity.md`
      yenidən keçirilir ✅ SC-009
- [ ] **T083** Lighthouse əvvəl/sonra rəqəmləri `OPTIMIZASIYA-PLANI.md`-yə yazılır
      ✅ SC-003
- [ ] **T084** İki ayrı MR açılır: `api-cbar` (Faza 1), `web-cbar-new` (Faza 2–8)

## Dependencies & Execution Order

```
Phase 0 ──► Phase 1 (müstəqil, MR #1)
       └──► Phase 2 ─┐
            Phase 3 ─┼─► Phase 5 ──► Phase 6 ──► Phase 7 ──► Phase 8
            Phase 4 ─┘
```

Phase 2, 3, 4 bir-birindən asılı deyil — istənilən sırada və ya paralel.
Phase 5 üç alt-hissəyə bölünüb (5a → 5b → 5c) ki, yarımçıq qalanda aydın nöqtədə
dayanmaq mümkün olsun.

## Toxunulmayanlar

- `GET /currencies/{DD.MM.YYYY}.xml` — element adları, sıra və rəqəm formatı
  kontraktdır (`TODO(compat)` markerləri)
- `src/Cbar.Domain` — hər iki API-də bayt-bayt eynidir; bu iş onu dəyişmir
- `globals.css` route B bloku (Maddə III.4)
- `node_modules`-dakı kit komponentləri (Maddə III.8)
- Public API DTO kontraktları — `Width`/`Height` sahələri DB-də var, amma bu specdə
  DTO-lara çıxarılmır
