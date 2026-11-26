# Research: Media upload hardening (spec 019)

**Date**: 2026-10-07 | **Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

Hər bölmə: **Decision / Rationale / Alternatives considered**. Kod istinadları 2026-10-07 vəziyyətinə
görədir (`product-rest/api-cbar-admin`, `product-rest/api-cbar`; ikisi də .NET 10, `Minio` 7.0.0).

---

## R1 — Yaddaş haradan gəlir və hansı nüsxə aradan qaldırılır

**Decision**: Çərçivənin multipart buferləməsinə toxunulmur. Controller-in öz `MemoryStream`
nüsxəsi və `ms.ToArray()` silinir; fayl `file.OpenReadStream()` ilə oxunur (iki dəfə: hash, sonra
anbara yazma). Öz müvəqqəti faylımız **yaradılmır**.

**Rationale**:

- `IFormFile` model binding zamanı `FormReader` + `FileBufferingReadStream` ilə oxunur:
  `FormOptions.MemoryBufferThreshold` (defolt 64 KB) aşılanda bölmə `ASPNETCORE_TEMP` (yoxsa
  `Path.GetTempPath()`, konteynerdə `/tmp`) altında müvəqqəti fayla yazılır. Yəni böyük fayl action-a
  çatanda **artıq diskdədir**; yaddaşda yalnız ArrayPool buferi (KB-lar) var.
- Bu gün yaddaşı tutan: `MemoryStream` (genişlənən bufer — 250 MB fayl üçün 256 MB-a qədər massiv,
  böyüdükcə ara massivlər də LOH-da) + `ToArray()` (ikinci 250 MB). Pik ≈ 500–750 MB/sorğu.
- `file.OpenReadStream()` müvəqqəti faylın üzərində **seekable** stream qaytarır, ona görə
  `Position = 0` ilə ikinci dəfə oxumaq olur, `MediaStorage.PutAsync`-in "non-seekable → MemoryStream"
  qolu işə düşmür.
- Müvəqqəti fayl `FileOptions.DeleteOnClose` ilə açılır və sorğunun sonunda dispose olunur — uğur,
  xəta və müştəri kəsilməsi hallarında (FR-003, SC-007). Bizim kod yeni müvəqqəti fayl yaratmadığı
  üçün təmizləməli bir şey də qalmır.

**Alternatives considered**:

- *Review-un "temp fayla yazmaq" təklifi* — çərçivə bunu artıq edir; ikinci nüsxə disk I/O-nu
  ikiqat artırar, fayda vermərdi.
- *Form binding-i söndürüb `MultipartReader` ilə birbaşa MinIO-ya axıtmaq (sıfır disk)* — anbar açarı
  checksum-dan qurulur və dedup **yazmadan əvvəl** qərar verir. Birbaşa axında hash yalnız sonda
  bilinir: müvəqqəti açara yazıb server-side copy + delete lazım olardı (MinIO-ya iki əlavə çağırış,
  yarımçıq obyektlərin təmizlənməsi, yeni xəta halları). ~3 SP-ni aşır, yaddaş qazancı R1-dən fərqsizdir.
- *`FormOptions.MemoryBufferThreshold`-u dəyişmək* — defolt artıq düzgündür.

---

## R2 — Checksum stream üzərində

**Decision**: `await SHA256.HashDataAsync(stream, ct)` → `Convert.ToHexString(...).ToLowerInvariant()`.

**Rationale**: SHA-256 deterministikdir — eyni baytlar üzərində bir dəfəyə (`HashData(byte[])`) və ya
axınla hesablanan dəyər eynidir, ona görə mövcud `checksum_sha256` qeydləri ilə dedup qırılmır
(FR-002). `HashDataAsync(Stream)` daxildə `IncrementalHash` kimi sabit ölçülü bufer ilə oxuyur
(.NET 7+), əlavə kod tələb etmir.

**Alternatives considered**: `IncrementalHash` əl ilə dövrə — eyni nəticə, daha çox kod. Hash-i
MinIO-ya yazma ilə eyni keçiddə hesablamaq (tee stream) — açar hash-dən asılı olduğu üçün mümkün deyil
(R1).

---

## R3 — `Minio` 7.0.0 yazarkən yaddaş

**Decision**: `PutObjectArgs` dəyişmir (`WithStreamData` + `WithObjectSize`). Yaddaş həddi ölçmə ilə
təsdiqlənir (quickstart §1, §3).

**Rationale**: Ölçü məlum olanda klient faylı multipart yükləyir; hissə ölçüsü `ceil(size/10000)`-in
5 MiB-a yuxarı yuvarlanmasıdır → 250 MB üçün **5 MiB** hissələr, hər hissə yaddaşa oxunub göndərilir.
Gözlənilən pik sorğu başına ~5–15 MB-dır (hissə buferi + imzalama), FR-001-in 50 MB həddinin altında.
Bu, kitabxananın davranışından çıxarılan **gözləntidir**, iddia deyil — SC-002 ölçmə ilə bağlanır.

**Alternatives considered**: Hissə ölçüsünü əl ilə kiçiltmək — klient 7.0-da bunu açıq API kimi vermir;
lazım olarsa ölçmədən sonra baxılır.

---

## R4 — Kəsilmə və ləğv (cancellation)

**Decision**: `HttpContext.RequestAborted` hash-ə, imza oxumasına və `MediaStorage.PutAsync`-ə ötürülür
(`PutAsync`-ə opsional `CancellationToken` parametri əlavə olunur).

**Rationale**: Bu gün qopmuş bağlantıda belə 250 MB MinIO-ya yazılmağa davam edir. DB qeydi `PutAsync`
**uğurla bitdikdən sonra** yaranır, ona görə kəsilmə heç vaxt yarımçıq qeyd qoymur (US1 ss. 4). Yarımçıq
multipart hissələri MinIO-nun özü təmizləyir (`stale_uploads_expiry`, defolt 24 saat) — qeyd olunur,
iş tələb etmir. Müştəri kəsilməsi spec 018-in `StatusCodeSelector`-u ilə 499 olur, Error kimi loglanmır.

**Alternatives considered**: Ləğvi ötürməmək — funksional düzgündür, amma kəsilmiş yükləmə resurs
tutmağa davam edir (paralel DoS ssenarisini pisləşdirir).

---

## R5 — Magic byte cədvəli və oxuma

**Decision**: Extension whitelist-dən sonra, hash-dən əvvəl faylın ilk **1024 baytı** oxunur
(`ReadAtLeastAsync(…, throwOnEndOfStream: false)`), sonra `Position = 0`. Uyğunluq qaydaları
[data-model.md §2](./data-model.md#2-məzmun-imzaları-fr-005)-dədir. Uyğunsuzluq → 400
`File content does not match type '.pdf'.`, heç nə saxlanmır.

**Rationale**:

- İmza yoxlaması hash-dən **əvvəl** olur ki, saxta fayl üçün 250 MB oxunmasın və dedup saxta faylı
  mövcud qeydə bağlamasın.
- PDF: spesifikasiya `%PDF-`-in ilk 1024 bayt daxilində olmasına icazə verir (bəzi generatorlar əvvələ
  zibil yazır) — 1024 baytlıq pəncərə bundandır.
- ZIP ailəsi (`.zip`, `.docx`, `.xlsx`) eyni `PK` imzasını paylaşır; `.docx`-i `.zip`-dən ayırmaq əhatədən
  kənardır (spec Assumptions). Boş ZIP (`PK\x05\x06`) yalnız `.zip` üçün qəbul olunur.
- OLE2 (`.doc`, `.xls`) bir imzadır. RAR v4 və v5 ortaq `Rar!\x1A\x07` prefiksi ilə.
- XML/SVG: UTF-8 BOM və ya UTF-16 BOM, sonra ASCII boşluqlar, sonra `<`. `<svg`-ni axtarmırıq — SVG-dən
  əvvəl uzun şərh/DOCTYPE ola bilər; skriptə qarşı müdafiə R7-dədir, imza yox.

**Ölçmə nəticəsi (2026-10-07, quickstart §1b)**: `test`-də 1976 fayldan 8 uyğunsuz — 6 şəkil başqa raster
formatın uzantısı ilə (JPEG↔PNG), 2 `.rar` əslində 7-Zip. Gözlənilən `.xls`-HTML halı **yoxdur** (9/9
OLE2). İstifadəçi qərarı: raster şəkil uzantıları bir ailə kimi yoxlanır (hamısı icra olunmayan şəkildir,
brauzer hər halda məzmundan dekodlayır; rədd etmək təhlükəsizlik qazandırmır) və `.rar`-da 7-Zip imzası
da qəbul olunur. Saxlanan MIME tipi əvvəlki kimi uzantıdan gəlir.

**Risk (ölçülür, iddia edilmir)**: CBAR-ın köhnə statistika `.xls` faylları arasında HTML və ya
XML-SpreadsheetML olub `.xls` adlandırılanlar ola bilər; bunlar yeni qayda ilə rədd ediləcək.
Quickstart §1b mövcud kitabxananın hər faylına eyni qaydanı **quru rejimdə** tətbiq edir (yalnız ilk
1 KB endirilir). Rədd payı > 0 olarsa, implementasiyadan əvvəl spec-ə qayıdılır (həmin tip üçün istisna
və ya redaktorlara bildiriş) — səssiz qərar verilmir.

**Alternatives considered**: `FileSignatures`/`Mime-Detective` NuGet — yeni dependency (Konstitusiya),
11 imza üçün əsassızdır. `libmagic` — native dependency, konteyner image-ini dəyişir.

---

## R6 — Fayl adının təmizlənməsi

**Decision**: Saf statik funksiya; addımlar (sıra vacibdir):

1. Unicode **NFC** normallaşdırma.
2. Son `/` və ya `\`-dən sonrakı hissə (hər iki ayırıcı — Linux-da `Path.GetFileName` `\`-i ayırıcı saymır).
3. Kateqoriya `Cc` (idarəetmə) simvolları və bidi idarəetmə simvolları (U+200E/F, U+202A–202E,
   U+2066–2069) silinir.
4. Əvvəl/sondakı boşluqlar kəsilir.
5. Extension `Path.GetExtension` ilə ayrılır; ad > 255 **kod nöqtəsi** olarsa əsas hissə surrogate cütünü
   bölmədən kəsilir, extension saxlanır.
6. Əsas hissə boş qalarsa → `file` + extension (məs. `file.pdf`).

Whitelist yoxlaması təmizlənmiş adın extension-ı üzərində aparılır (FR-008).

**Rationale**: PostgreSQL `varchar(255)` kod nöqtələrini sayır, C# `string.Length` isə UTF-16 vahidlərini —
kəsmə kod nöqtəsi ilə aparılır ki, emoji/nadir simvol 255-dən əvvəl kəsilməsin və cüt bölünməsin.
NFC: macOS NFD ad göndərir (`ö`, `ş`, `ç` parçalanmış) — görünüş eynidir, amma `ILIKE` axtarışı tapmır;
NFC görünən adı dəyişmir, FR-007-nin "adi adlar dəyişmir" şərtinə uyğundur. Bidi simvolları
`hesabat‮fdp.exe` kimi görünüş aldatmasına imkan verir.

**Alternatives considered**: Adı tam generasiya etmək (Yii2 kimi) — media siyahısında və yükləmə adında
redaktorun adı itər, paritet cədvəlindəki "orijinal ad görünür" davranışı pozular. Allowlist (yalnız
hərf/rəqəm) — Azərbaycan adlarını və mötərizələri korlayar.

---

## R7 — Public verilmədə SVG/XML skriptinin qarşısı (FR-009)

**Decision**: `api-cbar` `GET /media/{id}` 200 cavabı, digər başlıqlarla eyni yerdə (MinIO callback-i
daxilində):

- **bütün** fayllara `X-Content-Type-Options: nosniff`;
- **bütün** fayllara admin `preview`-dakı ilə eyni
  `Content-Security-Policy: default-src 'none'; style-src 'unsafe-inline'; sandbox`.

> **Yenilənmə (2026-10-07, quickstart §1c)**: əvvəlcə PDF-in istisna edilməsi planlaşdırılmışdı (aşağıdakı
> "PDF istisnası" bəndi). Lokal Node serveri ilə yoxlandı: CSP `sandbox` ilə verilən PDF brauzerdə
> **açılır**. İstisna silindi — qayda "hamısı"dır, spec FR-009 ilə hərfən uyğundur.

**Rationale**:

- Risk SVG ilə məhdud deyil: `application/xml` olaraq verilən `.xml` faylı XHTML namespace-i ilə
  `<script>` daşıya və birbaşa açılanda işlədə bilər. Ona görə qayda tip siyahısı deyil, "istisna
  olmadıqca hamısı"dır, köhnə miqrasiya olunmuş fayllar da əhatə olunur.
- `<img>` / CSS fonu kimi yerləşdirilmədə cavabın CSP-si tətbiq olunmur — saytda görünüş dəyişmir
  (US2 ss. 2). Raster şəkil birbaşa açılanda `sandbox` heç nəyə təsir etmir. Office/ZIP/RAR yüklənir.
- **PDF istisnası (rədd edildi, §1c)**: Chromium-un daxili PDF görüntüləyicisi `sandbox` CSP-li sənəddə açılmaya bilər
  (sandbox plugin/görüntüləyicini bloklayır); bu, FR-009-un "PDF davranışı dəyişməməlidir" şərtini
  pozardı. PDF-in JS-i origin-də deyil, görüntüləyicinin öz sandbox-unda işləyir, ona görə istisna
  təhlükəsizliyi azaltmır. **Bu gözləntidir** — quickstart §1c lokal Node serveri ilə (.NET lazım deyil)
  Chrome/Edge/Firefox-da yoxlayır. PDF `sandbox` ilə hər üç brauzerdə problemsiz açılarsa istisna
  silinir və qayda "hamısına" olur.
- `default-src 'none'` birbaşa açılan SVG-nin daxili `data:` şəkillərini də bloklayır — admin preview-da
  bu gün də belədir, FR-009 "eyni siyasət" tələb edir; `<img>` kimi göstərilmə təsirlənmir.

**Spec ilə fərq**: yoxdur — §1c-dən sonra istisna silindi, FR-009 olduğu kimi qalır.

**Keş**: Cavab `public, max-age=31536000, immutable`-dir. Ziyarətçilərin brauzerində əvvəldən keşlənmiş
cavablar köhnə başlıqlarla qalır — bu yalnız artıq baxılmış faylları əhatə edir, yeni yüklənən zərərli
SVG ilk dəfə yeni başlıqlarla gəlir. Ingress/CDN səviyyəsində paylaşılan keş varsa (məlum deyil —
`TODO(devops)`), deploy-dan sonra təmizlənməsi DevOps-dan istənir.

**Alternatives considered**: SVG-ni qadağan etmək; sanitizer (yeni dependency); `attachment`; ayrı media
domeni — spec Assumptions-da rədd edilib. CSP-ni yalnız `image/svg+xml`-ə tətbiq etmək — XML
vektorunu açıq qoyur.

---

## R8 — Yaddaşın ölçülməsi (SC-001, SC-002)

**Decision**: İki mənbə, hər ikisi deploy olunmuş `test` mühitində:

1. **Əsas**: pod metrikləri (`container_memory_working_set_bytes`, restart sayı) — Rancher/Grafana və ya
   `kubectl`. Giriş olub-olmadığı quickstart §0-da təsdiqlənir.
2. **Ehtiyat (həmişə)**: `Upload`-un sonunda bir Information log sətri — fayl ölçüsü, müddət,
   `Environment.WorkingSet` və `Process.PeakWorkingSet64` (Linux-da `/proc/self/status` `VmHWM`).
   Bu sətir **ayrı, birinci commit**-də gəlir ki, baseline köhnə upload kodu ilə ölçülsün; deploy podu
   yenidən başladır, ona görə `PeakWorkingSet64` təmiz başlayır.

**Yenilənmə (2026-10-07)**: istifadəçinin Grafana dashboard-unda (`Namespace cbar`, `App api-cbar-admin`)
Memory, Container restarts və log axtarışı panelləri var — 1-ci mənbə mövcuddur. Log sətri yenə də
saxlanılır: panel nöqtələri scrape intervalı ilə gəlir və bir neçə saniyəlik piki göstərməyə bilər,
`PeakWorkingSet64` isə onu itirmir.

**Rationale**: Lokal .NET SDK yoxdur; ölçmə yalnız `test`-də mümkündür. Log sətri metrik girişindən
asılı olmayan, əvvəl/sonra müqayisə edilə bilən rəqəm verir və sonradan əməliyyat logu kimi qalır
(yükləmə müddəti faydalıdır).

**Alternatives considered**: Müvəqqəti diaqnostika endpoint-i — yeni route (spec-first, OpenAPI, sonra
silmək) — log sətrindən baha. `dotnet-counters` — konteynerdə alət yoxdur.

---

## R8a — Ingress gövdə limiti (ölçmə zamanı tapıldı, 2026-10-07)

**Fakt**: `api-cbar-admin-test.cbar.az` qarşısındakı nginx ingress 100 MiB-dan böyük gövdəni API-yə
çatdırmadan 413 ilə rədd edir (100 000 000 B → 401/200, 104 857 600 B → 413; token-siz probe + bir real
yükləmə). `.ci-cd/*.yaml`-da `proxy-body-size` annotasiyası yoxdur — limit platformanın defoltudur.

**Nəticələr**:

- Controller-in `RequestSizeLimit(250_000_000)`-u və "~200 MB illik hesabat" şərhi bu gün `test`-də
  **əlçatmazdır**; redaktor 100 MiB-dan böyük faylda nginx HTML 413 səhifəsi alır (panel bunu
  ProblemDetails kimi oxumur). Prod-da eyni defolt varsa, eyni məhdudiyyət prod-da da var — `TODO(devops)`.
- DoS riski real, amma review-dakı rəqəmlərdən kiçikdir: bir sorğu ≤ ~100 MB → köhnə kodla ~200–300 MB;
  2 GiB limiti üçün ~6–8 paralel böyük yükləmə lazımdır (3–4 yox). Ingress limiti qaldırılsa, risk
  review-dakı səviyyəyə qayıdır — düzəliş buna görə də lazımdır.
- SC-001/SC-002 `test`-də 250 MB ilə ölçülə bilmir; ölçmə 96.5 MB (90 MiB) faylla aparılır, hədd
  mütənasib yoxlanır: "pik artım faylın ölçüsündən asılı deyil" — 1 × və 4 × yükləmədə köhnə kod artımı
  fayl ölçüsü ilə böyüyür, yeni kod sabit qalmalıdır.

**Qərar (istifadəçi, 2026-10-07)**: ingress limiti **olduğu kimi qalır** (~100 MiB, DevOps-un platforma
ayarı — bizim repo-larda yoxdur). DevOps-dan dəyişiklik istənmir; T025-də yalnız məlumat kimi qeyd
olunur. Controller-in 250 MB limiti dəyişmir (spec Assumptions); faktiki hədd ingress-dir.

---

## R9 — Disk tutumu (yeni risk deyil, qeyd olunur)

**Decision**: Dəyişiklik yoxdur.

**Rationale**: 4 paralel 250 MB yükləmə konteynerin `/tmp`-sində ~1 GB tutur — bu **bu gün də** belədir
(R1). `.ci-cd/*.yaml`-da `ephemeral-storage` limiti yoxdur və `readOnlyRootFilesystem` təyin olunmayıb;
aspnet image-in non-root istifadəçisi `/tmp`-yə yaza bilir. Node-un ephemeral storage-i dolarsa eviction
riski var — `TODO(devops)` qeydi kimi plan-da, kod dəyişikliyi kimi yox.

---

## R10 — Kodun yeri

**Decision**: `src/Cbar.AdminApi/Validation/MediaUploadRules.cs` — `AllowedTypes` (controller-dən köçür),
`SanitizeFileName`, `MatchesSignature`. Saf statik funksiyalar, DI yoxdur.

**Rationale**: `Validation/` spec 016-dan bəri sorğu yoxlaması üçündür (`PagingQuery.cs`); `Services/`
DI servisləri üçündür. Saf funksiyalar avtomatik test olmadan da kod review-da cədvəl kimi oxunur və
quickstart §1b-nin quru rejim skripti ilə eyni qaydanı təkrarlayır.

**Alternatives considered**: Controller daxilində private metodlar — `MediaController` artıq 250 sətirdir;
`Services/MediaInspector` — vəziyyətsiz koda DI qeydiyyatı lazımsızdır.
