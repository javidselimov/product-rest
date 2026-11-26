---

description: "Task list — Media upload-da yaddaş (DoS) və təhlükəsizlik risklərinin aradan qaldırılması"
---

# Tasks: Media upload-da yaddaş (DoS) və təhlükəsizlik risklərinin aradan qaldırılması

**Input**: Design documents from `specs/019-media-upload-hardening/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md),
[data-model.md](./data-model.md), [contracts/media-upload.md](./contracts/media-upload.md),
[contracts/public-media.md](./contracts/public-media.md), [quickstart.md](./quickstart.md)

**Tests**: avtomatik test task-ı yoxdur — API-lərdə test yığını yoxdur (Konstitusiya VIII.1), spec də
tələb etmir. Verification = GitLab pipeline build + `test` mühitində [quickstart.md](./quickstart.md)
ssenariləri. Nəticələr quickstart-ın sonundakı cədvələ yazılır.

**Organization**: task-lar user story-lərə görə qruplaşdırılıb (US1–US4, spec.md).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: paralel icra oluna bilər (fərqli fayllar, bitməmiş task-dan asılılıq yoxdur)
- **[Story]**: US1–US4 (spec.md)

## Path Conventions

- `ADMIN/` = `product-rest/api-cbar-admin/` (MR 1) — `ADMIN/src/Cbar.AdminApi/…`, `ADMIN/openapi/…`
- `WEB/` = `product-rest/api-cbar/` (MR 2) — `WEB/src/Cbar.WebApi/…`, `WEB/openapi/…`
- `SPEC/` = `specs/019-media-upload-hardening/`
- Ölçmə skriptləri sessiya scratchpad-ında yazılır, repo-ya commit olunmur.

**Ümumi qaydalar (hər kod task-ına aiddir)**

- Lokalda .NET SDK yoxdur: kod build olunmadan yazılır, build GitLab `test` pipeline-ında yoxlanılır.
  "Build keçir" deməyin — pipeline nəticəsini gözləyin.
- Mövcud mesaj mətnləri (`Empty file.`, `File type '{ext}' is not allowed.`) **dəyişmir**. Yeni mətn
  hərfi: `File content does not match type '{ext}'.` ([contracts/media-upload.md](./contracts/media-upload.md)).
- Rədd cavabları yalnız `BadRequestProblem(...)` ilə (spec 018, `Errors/CbarControllerBase`).
- Dedup məntiqi (`ReturnExisting`, `storage_key` 23505 catch-i) **toxunulmur** — yalnız checksum-un necə
  hesablandığı dəyişir.
- Route əlavə/silinmir; `.claude/hooks/spec-first.mjs` keçməlidir. Xatırlatma çıxarsa, OpenAPI artıq
  Phase 2-də yenilənib.
- Azərbaycan hərfli fayllar yalnız Edit/Write aləti ilə (Konstitusiya V.5).
- `Cbar.Domain`, migration, seed skriptləri, panel və `web-cbar*` toxunulmur.

---

## Phase 1: Setup (kodsuz qapılar və baseline-a hazırlıq)

**Purpose**: dizaynın iki fərziyyəsini (research R5 riski, R7 PDF istisnası) kod yazmazdan **əvvəl**
yoxlamaq və test fayllarını hazırlamaq.

- [X] T001 ✅ cavab: **xeyr** (pod metriklərinə giriş yoxdur) → yaddaş yalnız log sətri ilə ölçülür; restart sayı log-dakı startup mesajları və `/healthz` ilə. [quickstart.md §0](./quickstart.md) — `test` podunun yaddaş qrafikinə/restart sayına giriş olub-olmadığını istifadəçidən soruş; cavabı `SPEC/quickstart.md` nəticələr cədvəlinin altına qeyd et (əsas mənbə: metriklər, yoxsa yalnız log sətri)
- [X] T002 [P] Scratchpad-da test fayllarını yarat ([quickstart.md §0](./quickstart.md)): 4 fərqli ~240 MB həqiqi ZIP (təsadüfi baytları arxivlə), bir ~245 MB PDF, hər icazəli tipdən kiçik həqiqi fayl (BOM-lu `.svg` və `.xml` daxil), saxta fayllar `png-as.pdf`, `text-as.png`, `html-as.xls`, `exe-as.docx`, skriptli `xss.svg` (`onload` + `<script>`), XHTML namespace-li `xss.xml`
- [X] T003 [P] ✅ 2026-10-07: 2109 qeyd, 1976 yoxlandı (133 → 404, obyekt anbarda yoxdur), 8 uyğunsuz (6 şəkil JPEG↔PNG, 2 `.rar` = 7-Zip); T005 qərarından sonra 0. Scratchpad-da Node skripti yaz və işlət ([quickstart.md §1b](./quickstart.md)): `GET {ADMIN}/api/v1/media?pageSize=100&page=N` ilə bütün qeydləri gəz, hər biri üçün `GET {PUBLIC}/media/{id}` açıb ilk 1024 baytı oxu və bağlantını kəs, [data-model.md §2](./data-model.md) cədvəlini tətbiq et; tip üzrə uyğun/uyğunsuz sayını və uyğunsuzların siyahısını (id, ad, ilk 16 bayt hex) çap et. Nəticəni `SPEC/quickstart.md` cədvəlinə (§1b) yaz
- [X] T004 [P] ✅ 2026-10-07: PDF CSP ilə açılır → istisna silindi (data-model §5, contracts/public-media.md, research R7, plan, `WEB/openapi/paths/misc.yaml` yeniləndi). Scratchpad-da `node:http` serveri yaz ([quickstart.md §1c](./quickstart.md)): eyni PDF-i başlıqsız və `X-Content-Type-Options: nosniff` + `Content-Security-Policy: default-src 'none'; style-src 'unsafe-inline'; sandbox` ilə iki URL-dən, `xss.svg`-ni CSP ilə verir. İstifadəçidən Chrome, Edge, Firefox-da açmasını xahiş et; nəticəni `SPEC/quickstart.md` cədvəlinə (§1c) yaz
- [X] T005 ✅ 2026-10-07 qərar: raster şəkil uzantıları bir ailə, `.rar`-da 7-Zip də qəbul; spec FR-005, data-model §2, research R5, `ADMIN/openapi/paths/media.yaml` yeniləndi; PDF istisnası silindi (T004). **QAPI**: T003 uyğunsuz > 0 verdisə — dayan, siyahını istifadəçiyə göstər, qərarı (tip istisnası / bildiriş / qayda düzəlişi) al, `SPEC/spec.md` FR-005 və `SPEC/data-model.md` §2-ni yenilə. T004 PDF-in CSP ilə hər üç brauzerdə açıldığını göstərdisə — `SPEC/data-model.md` §5, `SPEC/contracts/public-media.md` və `SPEC/research.md` R7-dən PDF istisnasını sil; açılmadısa — istisna qalır, `SPEC/spec.md` FR-009 mətninə "PDF istisnadır (CSP sandbox Chromium PDF görüntüləyicisini bloklayır)" əlavə et

**Checkpoint**: imza qaydası mövcud kitabxana ilə uyğundur (və ya qərar verilib); PDF/CSP qaydası qəti.

---

## Phase 2: Foundational (spec-first kontrakt)

**Purpose**: hər iki API-nin OpenAPI-si koddan **əvvəl** yenilənir və təsdiqlənir (`/api-endpoint`).

**⚠️ CRITICAL**: T008 təsdiqindən əvvəl controller koduna toxunulmur.

- [X] T006 [P] `ADMIN/openapi/` — [contracts/media-upload.md](./contracts/media-upload.md) cədvəlini tətbiq et: `paths/media.yaml` `collection.post.description`-dan "The whole file is buffered in memory." sil, yerinə disk buferi + yaddaşın ölçüdən asılı olmaması + məzmun imzası yoxlaması (11 tip) + ad təmizlənməsi (qısa qayda) yaz, 400 siyahısına "file content does not match its extension" əlavə et; `components/schemas/media.yaml` `MediaUploadResult.originalName` təsvirinə "sanitised (path parts and control characters removed), at most 255 characters"; `openapi.yaml` `x-known-issues`-dən `'Media upload buffers the file fully in memory (up to 250 MB).'` sətrini sil; `cd ADMIN/openapi && npm run lint && npm run bundle`
- [X] T007 [P] `WEB/openapi/` — [contracts/public-media.md](./contracts/public-media.md) cədvəlini tətbiq et: `paths/misc.yaml` `media.get.description`-a nosniff + sandbox CSP cümləsi (T005 qərarına görə PDF istisnası ilə və ya onsuz); `media.get.responses.200.headers`-ə `X-Content-Type-Options` (`const: nosniff`) və `Content-Security-Policy` (`const: "default-src 'none'; style-src 'unsafe-inline'; sandbox"`, təsvirdə istisna); `cd WEB/openapi && npm run lint && npm run bundle`
- [X] T008 ✅ 2026-10-07: route-diff fərqsiz (api-cbar 35/36, admin 162/163 — fərq yoxdur); istifadəçi təsdiqlədi. `node .claude/skills/sync-openapi/scripts/route-diff.mjs` işlət (fərq 0 olmalıdır); T006/T007 diff-ini istifadəçiyə göstər və təsdiq al

**Checkpoint**: kontrakt təsdiqlənib — kod başlaya bilər. US2 (WEB) və US1/US3/US4 (ADMIN) bundan sonra paralel gedə bilər.

---

## Phase 3: User Story 1 — Böyük faylların paralel yüklənməsi xidməti çökdürmür (Priority: P1) 🎯 MVP

**Goal**: yükləmənin yaddaş istifadəsi faylın ölçüsündən asılı olmur; dedup dəyişmir; kəsilmə qalıq qoymur.

**Independent Test**: `test`-də 4 × ~240 MB paralel yükləmə — 4/4 `200`, restart 0; bir 240 MB yükləmədə pik
artım < 50 MB; eyni fayl təkrar → eyni `id` ([quickstart.md §3, §4](./quickstart.md)).

### Implementation for User Story 1

- [X] T009 [US1] (kod yazılıb; commit/push istifadəçidə. U1: başlanğıc working set də loglanır; dedup/bərpa yolları da `deduplicated`/`restored` outcome ilə loglanır) **Commit A (yalnız ölçmə)** — `ADMIN/src/Cbar.AdminApi/Controllers/MediaController.cs`: `Upload`-un əvvəlində `var started = Stopwatch.GetTimestamp();`, uğurlu yeni-qeyd yolunda `return Ok(...)`-dan əvvəl `ILogger<MediaController>` ilə bir Information sətri: `"Media upload {MediaId} {SizeBytes} bytes in {ElapsedMs} ms; working set {WorkingSetMb} MB, peak {PeakWorkingSetMb} MB"` (`Environment.WorkingSet`, `Process.GetCurrentProcess().PeakWorkingSet64`, MB-a çevrilmiş). Logger-i primary constructor-a əlavə et. Upload məntiqinin qalanına **toxunma**. Commit et, `test`-ə push et (research R8)
- [X] T010 [US1] ✅ 2026-10-07 commit A-sız, köhnə kodla, Grafana Memory ilə: ingress 100 MiB limitinə görə 96.5 MB fayl; 1× → +~330 MB (~3.4× fayl), 4× paralel → ~1 GB, sonra ~1 GB-da qalır; restarts 0 (quickstart cədvəli). T009 deploy olunandan sonra köhnə upload kodu ilə baseline ([quickstart.md §1a, §1d](./quickstart.md)): təmiz podda bir 240 MB yükləmə → log-dan peak; sonra 4 paralel 240 MB → uğur və restart sayı (əvvəlcədən komandaya xəbər ver — OOMKill gözlənilir); bir mövcud faylın təkrar yüklənməsi → `id` və `GET /api/v1/media` `total`. Rəqəmləri `SPEC/quickstart.md` cədvəlinə yaz
- [X] T011 [P] [US1] `ADMIN/src/Cbar.AdminApi/Services/MediaStorage.cs`: `PutAsync(string key, Stream content, string contentType, CancellationToken ct = default)` — `ct`-ni `BucketExistsAsync`, `MakeBucketAsync`, `CopyToAsync` və `PutObjectAsync`-ə ötür. Non-seekable qolunun üstündəki şərhə "IFormFile streams are seekable (disk-backed), so uploads never take this path" əlavə et
- [X] T012 [US1] (kod yazılıb; A+B birlikdə deploy oluna bilər — baseline artıq ölçülüb) **Commit B (axın)** — `ADMIN/src/Cbar.AdminApi/Controllers/MediaController.cs` `Upload`: `var ct = HttpContext.RequestAborted;`; `MemoryStream` + `CopyToAsync` + `SHA256.HashData(ms.ToArray())` blokunu `await using var stream = file.OpenReadStream(); var checksum = Convert.ToHexString(await SHA256.HashDataAsync(stream, ct)).ToLowerInvariant();` ilə əvəz et; `ms.Position = 0; await storage.PutAsync(key, ms, mimeType);` → `stream.Position = 0; await storage.PutAsync(key, stream, mimeType, ct);`. Hash blokunun üstünə şərh: çərçivə >64 KB faylı artıq diskdə buferləyir, burada ikinci nüsxə yaradılmır (research R1). Dedup və catch bloklarına toxunma (T011-dən asılıdır)
- [ ] T013 [US1] `ADMIN/openapi/openapi.yaml` `# Sync:` sətrini T012 commit-i ilə yenilə (sync-openapi konvensiyası); `npm run bundle`
- [X] T014 [US1] ✅ 2026-10-07 (96.5 MB, ingress limiti): 4/4 paralel 200, restart 0, dedup/bərpa/kəsilmə OK; yaddaş ~2.5–4× az (köhnə ~1 GB → yeni ~380 MB process), **< 50 MB hədəfi ödənmədi — istifadəçi qəbul etdi** (spec FR-001 qeydi, GC işi təxirə salındı). T012 `test`-ə push → pipeline build yaşıl olandan sonra [quickstart.md §3, §4](./quickstart.md): tək 240 MB peak (< 50 MB, T010 ilə müqayisə), 4 paralel (4/4, restart 0), yarıda kəsilmiş yükləmə (qeyd yoxdur, log-da 499, Error yoxdur; pod girişi varsa `/tmp` sayı), > 250 MB rədd, dedup ardıcıl/paralel/bərpa. Nəticələri `SPEC/quickstart.md` cədvəlinə yaz. Peak ≥ 50 MB olarsa dayan və research R3-ə qayıt (Minio hissə buferi)

**Checkpoint**: US1 tam — DoS riski bağlanıb, dedup qorunub. Burada dayanıb yalnız US1-i buraxmaq olar (MVP).

---

## Phase 4: User Story 2 — SVG faylı ziyarətçinin brauzerində skript işlətmir (Priority: P1)

**Goal**: public `GET /media/{id}` hər fayla `nosniff`, hamısına (PDF daxil) sandbox CSP verir.

**Independent Test**: `xss.svg` və `xss.xml` public URL-də birbaşa açılır — görünür, alert yoxdur; `<img>` kimi
görünüş dəyişmir; PDF açılır ([quickstart.md §6](./quickstart.md)). US1/US3/US4-dən asılı deyil (ayrı MR).

### Implementation for User Story 2

- [X] T015 [US2] (kod yazılıb; commit/push istifadəçidə) `WEB/src/Cbar.WebApi/Controllers/MediaController.cs` `Get`: sinifə `private const string SandboxPolicy = "default-src 'none'; style-src 'unsafe-inline'; sandbox";` əlavə et (şərh: admin preview ilə eyni dəyər; SVG/XML birbaşa açılanda skript işləməsin; `<img>`/CSS fonu kimi yerləşdirilmədə tətbiq olunmur). `WithCallbackStream` daxilində, digər başlıqların yanında: `Response.Headers[HeaderNames.XContentTypeOptions] = "nosniff";` və şərtsiz `Response.Headers[HeaderNames.ContentSecurityPolicy] = SandboxPolicy;` (hər fayl, PDF daxil — T004). 304 və 404 yollarına toxunma
- [ ] T016 [US2] `WEB/openapi/openapi.yaml` `# Sync:` sətrini T015 commit-i ilə yenilə; `npm run bundle`
- [X] T017 [US2] ✅ 2026-10-07: başlıqlar 4 tipdə, contract-check 73/73, brauzerdə alert yoxdur, PDF açılır. T015 `test`-ə push → pipeline yaşıl → [quickstart.md §6](./quickstart.md): `curl -sI` SVG və PDF üçün başlıqlar; `xss.svg`/`xss.xml` admin-dən yüklənib public URL-də birbaşa açılır (alert yoxdur, Console-da CSP bloku); public saytda şəkilli səhifə və PDF linki; `WEB/openapi/scripts/contract-check.mjs` yaşıl; `placeholder-1.svg`/`placeholder-2.svg` yüklənir və `<img>` kimi görünür (SC-006 əvəzi). Nəticələri `SPEC/quickstart.md` cədvəlinə yaz

**Checkpoint**: US2 tam — saxlanılan XSS vektoru bağlanıb, seed və görünüş dəyişməyib.

---

## Phase 5: User Story 3 — Uzantısı saxta olan fayl qəbul edilmir (Priority: P2)

**Goal**: məzmunu extension-a uyğun gəlməyən fayl 400 ilə rədd edilir, heç nə saxlanmır.

**Independent Test**: `png-as.pdf` → 400 `File content does not match type '.pdf'.`; hər tipdən həqiqi fayl → 200
([quickstart.md §5.1–5.2](./quickstart.md)).

### Implementation for User Story 3

- [X] T018 [US3] (C# qaydası JS güzgüsü ilə eynidir: 30 fixture + test kitabxanasının 1976 faylı) Yeni fayl `ADMIN/src/Cbar.AdminApi/Validation/MediaUploadRules.cs` (`namespace Cbar.AdminApi.Validation; public static class MediaUploadRules`): `AllowedTypes` lüğətini `MediaController`-dən **olduğu kimi** köçür (`public static readonly`, eyni şərhlə); `public const int SignatureWindow = 1024;`; `public static bool MatchesSignature(string ext, ReadOnlySpan<byte> head)` — [data-model.md §2](./data-model.md) cədvəli (T005 düzəlişləri ilə): **şəkil ailəsi** — `.jpg/.jpeg/.png/.gif/.webp` üçün JPEG `FF D8 FF`, PNG 8 bayt, GIF `GIF87a`/`GIF89a`, WebP `RIFF`@0 + `WEBP`@8 imzalarından **hər hansı biri**; PDF `%PDF-` `head` daxilində (`IndexOf`); `.zip` `PK\x03\x04` və ya `PK\x05\x06`; `.docx`/`.xlsx` `PK\x03\x04`; `.doc`/`.xls` OLE2 8 bayt; `.rar` `Rar!\x1A\x07` **və ya** 7-Zip `37 7A BC AF 27 1C`; `.xml`/`.svg` — isteğe bağlı UTF-8 BOM → ASCII boşluqlar → `<`, UTF-16 LE/BE BOM → kodlaşdırılmış boşluqlar → kodlaşdırılmış `<`; naməlum ext → `false`. İmzalar `"…"u8` / `ReadOnlySpan<byte>` literal-ları ilə; hər qaydaya bir sətirlik şərh (research R5)
- [X] T019 [US3] `ADMIN/src/Cbar.AdminApi/Controllers/MediaController.cs`: private `AllowedTypes` lüğətini sil, `MediaUploadRules.AllowedTypes` istifadə et (`using Cbar.AdminApi.Validation;` artıq var). Whitelist yoxlamasından sonra, hash-dən əvvəl: `var head = new byte[MediaUploadRules.SignatureWindow]; var read = await stream.ReadAtLeastAsync(head, head.Length, throwOnEndOfStream: false, ct); if (!MediaUploadRules.MatchesSignature(ext, head.AsSpan(0, read))) return BadRequestProblem($"File content does not match type '{ext}'."); stream.Position = 0;` — `stream`-in açılışını whitelist-dən sonraya, imza oxumasından əvvələ köçür ([data-model.md §4](./data-model.md) ardıcıllığı). T018-dən asılıdır
- [X] T020 [US3] ✅ 2026-10-07: saxta 8/8 → 400, həqiqi 22/22 → 200 (panel toast-u istifadəçidə yoxlanmayıb). **Commit C** (T018–T019, US4 ilə birlikdə və ya ayrıca) `test`-ə push → pipeline yaşıl → [quickstart.md §5.1, §5.2, §5.4](./quickstart.md): hər həqiqi tip 200, hər saxta fayl 400 və `total` artmır, panel toast-ında mesaj (FR-006). Nəticələri `SPEC/quickstart.md` cədvəlinə yaz

**Checkpoint**: US3 tam.

---

## Phase 6: User Story 4 — Fayl adı təmizlənir (Priority: P3)

**Goal**: saxlanan orijinal ad qovluq hissəsiz, idarəetmə simvolsuz, ≤ 255 kod nöqtəsi, extension qorunur; adi adlar dəyişmir.

**Independent Test**: [data-model.md §3](./data-model.md) cədvəlinin hər sətri `test`-də saxlanan adla üst-üstə düşür
([quickstart.md §5.3](./quickstart.md)).

### Implementation for User Story 4

- [X] T021 [US4] (JS güzgüsü ilə data-model §3 + emoji/NFD/bidi halları — 11/11) `ADMIN/src/Cbar.AdminApi/Validation/MediaUploadRules.cs`-ə `public static string SanitizeFileName(string? raw)` əlavə et — [data-model.md §3](./data-model.md) addımları ardıcıl: `raw ?? ""` → `Normalize(NormalizationForm.FormC)` → `LastIndexOfAny(['/', '\\'])`-dən sonrakı hissə → `char.GetUnicodeCategory == Control` və bidi simvolları (U+200E, U+200F, U+202A–U+202E, U+2066–U+2069) silinir → `Trim()` → `ext = Path.GetExtension(name)`, `stem = name[..^ext.Length]` → kod nöqtəsi sayı (`EnumerateRunes().Count()`) 255-i aşırsa `stem` `255 − ext.Length` rune-a qədər kəsilir (rune-larla, surrogate bölünmür) → `stem` boşdursa `"file"` → `stem + ext`. Hər addıma qısa şərh (research R6: niyə hər iki ayırıcı, niyə NFC, niyə rune). T018-dən sonra (eyni fayl)
- [X] T022 [US4] `ADMIN/src/Cbar.AdminApi/Controllers/MediaController.cs` `Upload`: boş fayl yoxlamasından sonra `var originalName = MediaUploadRules.SanitizeFileName(file.FileName);`; `ext`-i `Path.GetExtension(originalName)`-dən götür (FR-008); `new MediaAsset { OriginalName = originalName, … }` və audit `after`-də `originalName`. T019-dan sonra (eyni fayl)
- [X] T023 [US4] ✅ 2026-10-07: 9/9 ad halı (data-model §3 + bidi + NFD). Commit C-nin bir hissəsi kimi `test`-də [quickstart.md §5.3](./quickstart.md): `curl -F "file=@x.pdf;filename=…"` ilə data-model §3 cədvəlinin hər girişi (o cümlədən `C:\Users\x\hesabat.pdf`, `../hesabat.pdf`, TAB-lı ad, 300 simvol, `.pdf`, `İllik hesabat 2025 (son).pdf`, `report.pdf.` → 400) → `GET /api/v1/media?search=` ilə saxlanan ad. Nəticələri `SPEC/quickstart.md` cədvəlinə yaz

**Checkpoint**: bütün user story-lər tam.

---

## Phase 7: Polish & Cross-Cutting Concerns

- [X] T024 [P] ✅ 2026-10-07: cədvəl sətri 🔄 (api-cbar deploy-u gözləyir) + §11 'Vəziyyət' bloku, tapıntılar və təxirə salınanlar. `api-admin-review.md`: cədvəlin #11 sətrinin "Vəziyyət" sütununa `✅ <commit-lər> (specs/019); test-də yoxlanılıb` və §11 bölməsinin başlığına "— ✅ **icra olunub**"; təxirə salınanları qeyd et — `test`-də 133 media qeydinin obyekti MinIO-da yoxdur (public 404, ayrıca tapşırıq), ayrı media domeni, antivirus, `.docx`/`.zip` ayrımı, mövcud faylların yenidən yoxlanmaması (FR-012)
- [ ] T025 [P] `SPEC/plan.md` "Deploy" bəndindəki iki `TODO(devops)` (ingress/CDN paylaşılan keşinin təmizlənməsi; `/tmp` ephemeral storage limiti) üçün DevOps-a göndəriləcək qısa mətni istifadəçiyə hazırla (göndərmə istifadəçinin işidir)
- [X] T026 ✅ cədvəl dolu; boşluqlar səbəbi ilə: SC-002 hədəfi (qəbul olunmuş sapma), SC-006 tam seed (fayllar checkout-da yoxdur), SC-007 `/tmp` sayı (pod girişi yoxdur). `SPEC/quickstart.md` nəticələr cədvəlinin bütün sətirlərinin doldurulduğunu yoxla; SC-001…SC-007 hər birinin faktiki rəqəmi/statusu var. Boş qalan sətir varsa səbəbini yaz (məs. SC-006 tam seed — SDK olan maşın lazımdır)
- [ ] T027 `/sync-business-logic` ilə `business_logic/new_business_logic.md` (media upload qaydaları) və `diff_report_logic.md`-ni yenilə — yalnız istifadəçi istəsə

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: asılılıq yoxdur. T002–T004 paralel; T005 T003 və T004-dən asılıdır
- **Phase 2 (Foundational)**: T005-dən asılıdır (CSP/imza qaydası qəti olmalıdır). **Bütün kodu bloklayır**
- **US1 (Phase 3)**: T008-dən sonra. T009 → (deploy) → T010 → T011 ‖ → T012 → T013 → T014
- **US2 (Phase 4)**: T008-dən sonra; ADMIN işindən **asılı deyil** (ayrı repo, ayrı MR)
- **US3 (Phase 5)**: T012-dən sonra (eyni metod; `stream` dəyişəni T012-də yaranır) — və T014 ölçməsindən sonra commit olunur ki, US1 ölçməsi təmiz qalsın
- **US4 (Phase 6)**: T018 və T019-dan sonra (eyni fayllar)
- **Polish**: bütün istənən story-lərdən sonra

### User Story Dependencies

- **US1 (P1)**: yalnız Foundational
- **US2 (P1)**: yalnız Foundational — tam müstəqil
- **US3 (P2)**: kodda US1-in T012-sinə əsaslanır (eyni `Upload` metodu); funksional olaraq müstəqil yoxlanır
- **US4 (P3)**: US3-ün yaratdığı `MediaUploadRules.cs` faylına və `Upload`-dakı ardıcıllığa əsaslanır

### Within Each User Story

- ADMIN: ölçmə commit-i (A) → axın (B) → qaydalar (C); hər commit-dən sonra `test`-də yoxlama
- OpenAPI `# Sync:` sətri həmin commit ilə birlikdə

### Parallel Opportunities

- T002, T003, T004 (fərqli skriptlər/fayllar)
- T006 ‖ T007 (fərqli repo-lar)
- Phase 2-dən sonra: **US2 (WEB) bütövlükdə US1/US3/US4 (ADMIN) ilə paralel**
- T011 ‖ T010 (T010 `test`-də ölçmədir, T011 kod)
- T024 ‖ T025

---

## Parallel Example: Phase 2-dən sonra

```bash
# İki repo paralel:
Task: "T009–T014 [US1] ADMIN: ölçmə commit-i, baseline, axın, ölçmə"
Task: "T015–T017 [US2] WEB: nosniff + sandbox CSP, test-də yoxlama"

# Phase 1 skriptləri birlikdə:
Task: "T003 imza qaydasının mövcud kitabxanaya quru tətbiqi"
Task: "T004 PDF + CSP lokal Node serveri"
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Phase 1 (qapılar) → Phase 2 (OpenAPI təsdiqi)
2. Phase 3: commit A → baseline → commit B → ölçmə
3. **STOP and VALIDATE**: SC-001, SC-002, SC-003 — DoS riski bağlanıb
4. `test` → (MR) → prod buraxıla bilər

### Incremental Delivery

1. US1 (ADMIN, commit A+B) → yaddaş riski bağlanır
2. US2 (WEB, ayrıca MR) → XSS vektoru bağlanır — US1 ilə eyni vaxtda gedə bilər
3. US3 + US4 (ADMIN, commit C) → tip və ad yoxlaması
4. Polish → review faylı, DevOps qeydləri

### Deploy

İki komponent, sıra sərbəstdir, migration yoxdur. `api-cbar` deploy-dan sonra paylaşılan keş varsa
təmizlənməsi DevOps-dan istənir (T025).

---

## Notes

- [P] = fərqli fayllar, bitməmiş task-dan asılılıq yoxdur
- Commit/push yalnız istifadəçi istədikdə (`test` branch → GitLab test mühiti; GitHub push heç nə deploy etmir)
- Hər ölçmə rəqəmi quickstart cədvəlinə yazılır — "işləyəcək" verification deyil (Konstitusiya VIII.1)
- Ölçmə planla ziddiyyət çıxararsa (peak ≥ 50 MB, uyğunsuz fayllar, PDF/CSP) — dayan, plan/spec-i yenilə, səbəbi yaz
