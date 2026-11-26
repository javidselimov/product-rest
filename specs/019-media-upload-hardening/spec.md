# Feature Specification: Media upload-da yaddaş (DoS) və təhlükəsizlik risklərinin aradan qaldırılması

**Feature Branch**: `019-media-upload-hardening`

**Created**: 2026-10-06

**Status**: Draft

**Input**: User description: "11. Media upload-da DoS və təhlükəsizlik riskləri (MediaController.cs:63-65). — 5 SP. 250MB fayl MemoryStream-ə yığılır, sonra ms.ToArray() onu yenidən kopyalayır. Bir request ~500MB LOH tutur. Pod limiti 2Gi-dir, 3–4 paralel upload OOMKill verəcək. Həll: hash-i stream üzərində hesablamaq (IncrementalHash), temp fayla yazmaq. SVG icazəlidir. SVG script daşıyır; MinIO-dan eyni site altında inline servis olunursa XSS olur. Ya çıxarılmalı, ya sanitize olunmalı, ya da Content-Disposition: attachment / ayrı domen. Fayl tipi yalnız extension-a görə yoxlanır, magic byte yoxlanmır. OriginalName sanitize olunmur. SP izahı: streaming ~3 SP, magic byte + ad ~1 SP, SVG qərarı ~1 SP. Mock content placeholder-*.svg istifadə edir — SVG qadağan olunarsa seed də dəyişməlidir. Dedup-un (eyni fayl bir dəfə) pozulmadığını yoxlamaq lazımdır."

**Mənbə**: `api-admin-review.md`, task #11 (5 SP).

**Əhatə olunan proyektlər**:

- `product-rest/api-cbar-admin` — upload axını (yaddaş, tip yoxlaması, fayl adı). Əsas iş.
- `product-rest/api-cbar` — public `GET /media/{id}` cavabına SVG-nin skript icra etməsinin
  qarşısını alan cavab başlıqları (FR-009). Kiçik, müstəqil dəyişiklik.

Sxem, migration və `Cbar.Domain` **toxunulmur**. Route əlavə olunmur, silinmir. Upload
endpoint-inin yeni rədd halları (FR-005, FR-006) OpenAPI-də **əvvəlcə** sənədləşdirilir
(spec-first qaydası — `/api-endpoint`). Deploy sırası sərbəstdir: iki dəyişiklik bir-birindən
asılı deyil (iki ayrı MR — Konstitusiya Maddə II.3).

**Kodda faktiki vəziyyət (2026-10-06, oxunub)** — review-un iddiaları ilə müqayisə:

| Review iddiası | Kodda | Qeyd |
|---|---|---|
| `MediaController.cs:63-65` | Sətir nömrələri köhnəlib: problem indi `api-cbar-admin/.../MediaController.cs:156-158`-dədir | Mahiyyət eynidir |
| 250MB fayl yaddaşa yığılır, `ToArray()` yenidən kopyalayır | Təsdiqlənir: `MemoryStream` + `SHA256.HashData(ms.ToArray())`. Fayl bir dəfə buferdə, bir dəfə massivdə — ölçünün ~2 qatı (genişlənən bufer ilə daha çox) | Limit `RequestSizeLimit(250_000_000)` |
| "Temp fayla yazmaq" | Çərçivə multipart faylı (64 KB-dan böyük) **artıq** müvəqqəti diskdə saxlayır; yaddaşa yığan yalnız controller-in öz kopyasıdır | Yəni həll əsasən kopyanı aradan qaldırmaqdır; plan bunu ölçərək təsdiqləməlidir |
| Pod limiti 2Gi | Təsdiqlənir: `.ci-cd/{dev,test,prod}.yaml` → `limits.memory: 2Gi`, `requests.memory: 512Mi` | |
| SVG icazəlidir | Təsdiqlənir (`.svg` → `image/svg+xml`) | Admin `/{id}/preview` artıq `nosniff` + `CSP sandbox` göndərir; public `api-cbar` `/media/{id}` **göndərmir**, `Content-Disposition: inline` ilə verir |
| "MinIO-dan eyni site altında" | MinIO birbaşa açılmır; fayllar `api-cbar` (`api-cbar.cbar.az`) üzərindən verilir. Public sayt şəkilləri və yükləmə linklərini `{API_URL}/media/{id}` kimi qurur | Risk faktikidir: redaksiya məzmunundakı SVG linkinə klik edən ziyarətçi faylı `cbar.az` saytının subdomenində yuxarı səviyyəli sənəd kimi açır və içindəki skript işləyir |
| Magic byte yoxlanmır | Təsdiqlənir — yalnız extension | |
| `OriginalName` sanitize olunmur | Təsdiqlənir: `file.FileName` olduğu kimi saxlanır (sütun `varchar(255)`); 255-dən uzun ad bu gün DB xətası verir (spec 018-dən sonra 400) | |

**`product-host` istinadı (Konstitusiya Maddə I.2)**: Yii2 `admin/behaviors/UploadAssetsBehavior.php`
(`UploadBehavior` üzərində) faylı extension whitelist-i ilə qəbul edir və diskdə **yeni,
generasiya olunmuş adla** saxlayırdı — istifadəçinin göndərdiyi ad saxlama yoluna təsir
etmirdi. Fayllar veb-server tərəfindən statik verilirdi. Bu spec yeni funksiya əlavə etmir;
yeni stack-də itmiş/zəif qalmış müdafiələri bərpa edir və gücləndirir.

**Paritet (İş axını qaydası 5)**:

| `product-host` davranışı | Yeni sistemdə (bu gün) | Bu spec-dən sonra |
|---|---|---|
| Extension whitelist | Var | Var + məzmunun extension-a uyğunluğu yoxlanır |
| Saxlama adı generasiya olunur | Saxlama açarı checksum-dandır (təhlükəsiz); orijinal ad təmizlənmədən DB-yə yazılır | Orijinal ad təmizlənir (FR-007) |
| Böyük fayl yükləmə | İşləyir, amma yaddaşı faylın ölçüsünün ~2 qatı tutur | İşləyir, yaddaş fayl ölçüsündən asılı deyil |
| SVG faylı açmaq | — (statik verilirdi) | Açılır və görünür, amma skript icra etmir |
| Eyni fayl bir dəfə saxlanır | — | Dəyişmir (FR-004) |

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Böyük faylların paralel yüklənməsi xidməti çökdürmür (Priority: P1)

Redaktorlar illik hesabat PDF-lərini və ödəniş sistemi proqram paketlərini (~200 MB)
yükləyir. Bu gün hər yükləmə faylın ölçüsünün təxminən iki qatı qədər yaddaş tutur; 3–4
redaktor eyni vaxtda böyük fayl yükləsə admin API-nin konteyneri yaddaş limitini aşır və
platforma tərəfindən öldürülür — o anda bütün redaktorların bütün işi (təkcə yükləmələr yox)
kəsilir. Bu spec-dən sonra yükləmənin yaddaş istifadəsi faylın ölçüsündən asılı olmur, və
eyni anda bir neçə böyük yükləmə xidməti dayandırmır.

**Why this priority**: Bu, hər kəsin (hətta pis niyyəti olmayan redaktorların) təsadüfən
tetikləyə biləcəyi bütöv xidmət kəsintisidir; hücumçu üçün isə tək etibarlı hesabla DoS-dur.
Ən böyük təsir, ən böyük SP payı (~3 SP).

**Independent Test**: Test mühitində 4 ədəd ~240 MB fayl eyni anda yüklənir; konteyner
yenidən başlamır, dörd yükləmə də uğurla bitir, yükləmə zamanı ölçülən yaddaş istifadəsi
limitin xeyli altında qalır.

**Acceptance Scenarios**:

1. **Given** admin API işləyir, **When** 4 redaktor eyni anda hər biri ~240 MB olan 4 fərqli fayl yükləyir, **Then** dörd yükləmə də uğurla bitir və konteyner yaddaş səbəbindən yenidən başlamır.
2. **Given** bir 240 MB fayl yüklənir, **When** yükləmə zamanı prosesin yaddaşı ölçülür, **Then** pik artım faylın ölçüsü ilə mütənasib deyil (FR-001-dəki həddin altındadır).
3. **Given** eyni fayl ikinci dəfə yüklənir, **When** yükləmə bitir, **Then** cavab əvvəlki fayl qeydini qaytarır, yeni qeyd və ya yeni obyekt yaranmır (dedup qorunur).
4. **Given** yükləmə yarıda kəsilir (bağlantı qopur), **When** sorğu bitir, **Then** heç bir yarımçıq fayl qeydi qalmır və müvəqqəti fayllar təmizlənir.

---

### User Story 2 - SVG faylı ziyarətçinin brauzerində skript işlətmir (Priority: P1)

Redaktor (və ya oğurlanmış redaktor hesabı) içində skript olan SVG yükləyir və onu
səhifədə link kimi qoyur. Bu gün ziyarətçi linkə klik edəndə SVG `cbar.az`-ın
subdomenində sənəd kimi açılır və skript işləyir (saxlanılan XSS). Bu spec-dən sonra SVG-lər
əvvəlki kimi şəkil kimi görünür və birbaşa açıla bilir, amma içindəki skript heç bir halda
icra olunmur.

**Why this priority**: Ziyarətçilərə — mərkəzi bankın public saytının istifadəçilərinə —
yönələn təhlükəsizlik boşluğudur. SVG-ni tam qadağan etmək mövcud məzmunu (o cümlədən
dev seed-in `placeholder-*.svg` fayllarını) qırardı; ona görə seçilən yol "saxla, amma
zərərsizləşdir"-dir (bax Assumptions).

**Independent Test**: İçində `<script>` olan SVG yüklənir; public media ünvanı brauzerdə
birbaşa açılır — şəkil görünür, skript işləmir. `<img>` ilə səhifədə göstərilməsi dəyişmir.

**Acceptance Scenarios**:

1. **Given** skript daşıyan SVG yüklənib, **When** ziyarətçi public media ünvanını brauzerdə birbaşa açır, **Then** SVG çəkilir, skript icra olunmur.
2. **Given** eyni SVG səhifədə şəkil kimi yerləşdirilib, **When** səhifə açılır, **Then** şəkil əvvəlki kimi görünür.
3. **Given** dev mühitində boş baza seed olunur, **When** `placeholder-1.svg` və `placeholder-2.svg` yüklənir və mock content bərpa olunur, **Then** seed əvvəlki kimi işləyir və şəkillər görünür (seed skriptlərinə dəyişiklik lazım deyil).
4. **Given** istənilən media faylı (PDF, şəkil, sənəd), **When** public ünvandan alınır, **Then** brauzer faylın tipini məzmundan "təxmin" etmir — elan olunmuş tipə əməl edir.

---

### User Story 3 - Uzantısı saxta olan fayl qəbul edilmir (Priority: P2)

Kimsə icra olunan faylı və ya HTML-i `.pdf` / `.png` adı ilə yükləyir. Bu gün yalnız ada
baxılır, fayl qəbul olunur və ziyarətçilərə PDF/şəkil kimi paylanır. Bu spec-dən sonra
faylın məzmunu elan olunan tipə uyğun gəlmirsə yükləmə aydın mesajla rədd edilir.

**Why this priority**: Zərərli fayl paylanmasının qarşısını alır, amma tək başına ziyarətçi
brauzerində kod icrasına gətirmir (cavab tipi onsuz da extension-dan təyin olunur). ~1 SP.

**Independent Test**: Adı `report.pdf`, məzmunu PNG (və ya mətn) olan fayl yüklənir —
400 və anlaşılan mesaj qayıdır; həqiqi PDF eyni addan qəbul olunur.

**Acceptance Scenarios**:

1. **Given** məzmunu PDF olmayan `report.pdf`, **When** yüklənir, **Then** sorğu rədd edilir, mesaj tipin uyğun gəlmədiyini deyir, heç nə saxlanmır.
2. **Given** icazəli siyahıdakı hər tipdən bir həqiqi fayl, **When** yüklənir, **Then** hamısı qəbul olunur.
3. **Given** köhnə Office formatlı (`.doc`, `.xls`) və yeni Office formatlı (`.docx`, `.xlsx`) həqiqi fayllar, **When** yüklənir, **Then** qəbul olunur.

---

### User Story 4 - Fayl adı təmizlənir (Priority: P3)

Redaktorun (və ya API-ni birbaşa çağıranın) göndərdiyi fayl adında qovluq yolu, idarəetmə
simvolları və ya çox uzun mətn ola bilər. Bu ad media siyahısında, axtarışda və ziyarətçinin
yüklədiyi faylın adında görünür. Bu spec-dən sonra ad saxlanmazdan əvvəl təmizlənir; adi
adlar (Azərbaycan hərfləri, boşluqlar, mötərizələr daxil) dəyişmədən qalır.

**Why this priority**: Kosmetik/robustluq riski; birbaşa istismar yolu məhduddur. Ən kiçik iş.

**Independent Test**: Adı `..\..\evil<TAB>name.pdf` və 300 simvolluq ad olan fayllar
yüklənir; siyahıda təmizlənmiş, ≤255 simvolluq, extension-ı qorunmuş ad görünür.
`İllik hesabat 2025 (son).pdf` dəyişmədən qalır.

**Acceptance Scenarios**:

1. **Given** adında qovluq hissəsi olan fayl (`C:\Users\x\hesabat.pdf`, `../hesabat.pdf`), **When** yüklənir, **Then** saxlanan ad yalnız `hesabat.pdf`-dir.
2. **Given** adında idarəetmə simvolları olan fayl, **When** yüklənir, **Then** həmin simvollar saxlanan adda yoxdur.
3. **Given** 300 simvolluq ad, **When** yüklənir, **Then** yükləmə uğurlu olur, ad 255 simvola qədər qısaldılır və extension qorunur.
4. **Given** Azərbaycan hərfləri və boşluqlu adi ad, **When** yüklənir, **Then** ad dəyişmədən saxlanır.

---

### Edge Cases

- Eyni fayl iki redaktor tərəfindən **eyni anda** yüklənir → hər ikisi eyni fayl qeydini alır, ikinci obyekt yaranmır (spec 018-də qurulmuş davranış qorunur).
- Silinmiş (soft-delete) faylın eynisi yenidən yüklənir → həmin qeyd bərpa olunur (mövcud davranış qorunur).
- Yükləmə zamanı obyekt anbarı əlçatmazdır → yükləmə xəta ilə bitir, DB-də qeyd qalmır, müvəqqəti fayl silinir.
- Fayl tam ölçü həddindədir (250 MB) → qəbul olunur; həddi aşan → bu günkü kimi rədd edilir (hədd dəyişmir).
- Boş fayl → bu günkü kimi rədd edilir.
- Məzmunu tanınmayan, amma extension-ı icazəli fayl (məs. qırıq PDF) → tip uyğunsuzluğu kimi rədd edilir.
- `.xml` və `.svg` mətn əsaslıdır, ilk baytlarında BOM və ya boşluq ola bilər → bunlar tip uyğunsuzluğu sayılmır.
- Adı yalnız qadağan simvollardan ibarət olan və ya təmizlənəndən sonra boş qalan fayl → yükləmə uğurlu olur, ad extension-ı qoruyan neytral adla əvəzlənir.
- Mövcud (miqrasiya olunmuş və əvvəl yüklənmiş) fayllar yenidən yoxlanmır — qayda yalnız yeni yükləmələrə aiddir; amma public verilmə başlıqları (FR-009, FR-010) bütün fayllara, köhnələrə də tətbiq olunur.

## Requirements *(mandatory)*

### Functional Requirements

**Yaddaş (User Story 1)**

- **FR-001**: Bir yükləmənin admin API prosesində tutduğu əlavə yaddaş faylın ölçüsündən asılı OLMAMALIDIR; 250 MB-lıq fayl üçün pik artım **50 MB-dan az** olmalıdır (ölçülərək təsdiqlənir).
  > **Ölçmə nəticəsi və qəbul olunmuş sapma (2026-10-07)**: `test`-də ingress 100 MiB limitinə görə 96.5 MB
  > faylla ölçüldü. Köhnə kod: 1 yükləmə +~330 MB, 4 paralel sonra ~1 GB (geri qaytarılmır). Yeni kod: prosesin
  > working set-i 5 böyük + ~45 kiçik yükləmədən sonra ~380 MB, peak 385 MB; restart 0. Yaxşılaşma ~2.5–4 qatdır,
  > amma "< 50 MB artım" hədəfi **ödənməyib** — qalan artım MinIO klientinin hissə buferləri və Server GC-nin
  > yaddaşı gec qaytarmasıdır (ehtimal, ayrıca ölçülməyib). İstifadəçi nəticəni **qəbul etdi**; davamı (GC rejimi:
  > `DOTNET_GCConserveMemory` / Workstation GC) ayrıca task kimi təxirə salınır.
- **FR-002**: Faylın yoxlama cəmi (dedup açarı) faylı bütövlükdə yaddaşa yükləmədən hesablanmalıdır və bu gün hesablanan dəyərlə **eyni** olmalıdır (mövcud qeydlərlə dedup qırılmamalıdır).
- **FR-003**: Yükləmə uğurla və ya xəta ilə bitdikdən sonra yükləmənin yaratdığı bütün müvəqqəti fayllar silinməlidir.
- **FR-004**: Dedup davranışı dəyişməməlidir: eyni məzmun yenidən (ardıcıl və ya paralel) yükləndikdə mövcud qeyd qaytarılır, silinmiş qeyd bərpa olunur, anbara ikinci obyekt yazılmır.

**Tip yoxlaması (User Story 3)**

- **FR-005**: Sistem yüklənən faylın məzmununun ilk baytlarını extension-ın elan etdiyi tiplə müqayisə etməli, uyğun gəlmədikdə yükləməni **400** və tipin uyğun gəlmədiyini deyən mesajla rədd etməli, heç nə saxlamamalıdır. Yoxlama icazəli siyahıdakı hər tipi əhatə edir: JPEG, PNG, GIF, WebP, PDF, ZIP əsaslı formatlar (`.zip`, `.docx`, `.xlsx`), köhnə Office formatları (`.doc`, `.xls`), RAR, və mətn əsaslı XML/SVG (XML/SVG-yə bənzər başlanğıc, əvvəlində BOM/boşluq icazəlidir).
  **İki tolerantlıq** (2026-10-07, mövcud kitabxananın quru yoxlamasından sonra istifadəçi qərarı —
  `test`-də 1976 fayldan 8 uyğunsuz): (1) raster şəkil uzantıları (`.jpg`, `.jpeg`, `.png`, `.gif`,
  `.webp`) bir ailədir — məzmun bu dörd formatdan biridirsə qəbul olunur (`.png` adlı JPEG və s.; saxlanan
  MIME tipi əvvəlki kimi uzantıdan gəlir); (2) `.rar` uzantılı faylda 7-Zip imzası da qəbul olunur.
- **FR-006**: Rədd cavabları mövcud vahid xəta formasında olmalıdır (spec 018: `application/problem+json`, `message` sahəsi ilə) ki, admin panel mesajı dəyişiklik olmadan göstərsin.

**Fayl adı (User Story 4)**

- **FR-007**: Saxlanan orijinal ad: (a) qovluq hissələrindən (həm `/`, həm `\`) təmizlənməli, (b) idarəetmə simvollarından təmizlənməli, (c) əvvəl/sondakı boşluqlardan təmizlənməli, (d) extension qorunmaqla 255 simvola qədər qısaldılmalı, (e) təmizlənəndən sonra boş qalırsa extension-ı saxlayan neytral adla əvəzlənməlidir. Adi Unicode adlar (Azərbaycan hərfləri, boşluq, mötərizə, tire) dəyişməməlidir.
- **FR-008**: Extension yoxlaması (whitelist) təmizlənmiş ad üzərində aparılmalıdır.

**SVG və public verilmə (User Story 2)**

- **FR-009**: Public media ünvanından verilən hər fayl brauzerə: (a) tipi məzmundan təxmin etməməyi və (b) sənəd kimi açılarsa skript icra etməməyi, xarici resurs yükləməməyi bildirən başlıqlarla verilməlidir — admin `preview` ucunun artıq tətbiq etdiyi siyasətlə eyni. Şəkil kimi yerləşdirilmə (`<img>`, CSS fonu) və PDF/sənəd yükləmə davranışı dəyişməməlidir.
- **FR-010**: SVG yükləmək icazəli qalır; seed axını (`placeholder-*.svg` → mock content) dəyişiklik olmadan işləməlidir.

**Sənədləşdirmə**

- **FR-011**: Upload endpoint-inin yeni rədd halı (FR-005) və public media cavabının yeni başlıqları `api-cbar-admin` və `api-cbar` OpenAPI spec-lərində kod dəyişikliyindən **əvvəl** sənədləşdirilməlidir; `openapi.yaml`-dakı müvafiq `x-known-issues` qeydləri (varsa) silinməlidir.
- **FR-012**: `api-admin-review.md`-də task #11 icra olunduqdan sonra "icra olunub" kimi işarələnməli, qalan (təxirə salınmış) yoxlamalar qeyd olunmalıdır.

### Key Entities

- **Media faylı (media asset)**: yüklənmiş faylın qeydi — orijinal ad (təmizlənmiş, ≤255), tip, ölçü, məzmun yoxlama cəmi (dedup açarı), anbar açarı, yaradan istifadəçi, soft-delete tarixi. Struktur dəyişmir; dəyişən yalnız orijinal adın qəbul qaydası və yükləmənin necə emal olunmasıdır.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Test mühitində 4 paralel ~240 MB yükləmə — 4/4 uğurlu, konteynerin yenidən başlama sayı 0.
- **SC-002**: Bir 250 MB yükləmə zamanı prosesin pik yaddaş artımı < 50 MB (bu günkü ~500 MB+ ilə müqayisədə, əvvəl/sonra ölçülür).
- **SC-003**: Mövcud bir faylın eynisi yenidən yükləndikdə 100% halda eyni qeyd qayıdır; media qeydlərinin və anbardakı obyektlərin sayı artmır.
- **SC-004**: Skript daşıyan test SVG-si public ünvanda birbaşa açıldıqda skript 0 dəfə icra olunur; eyni SVG `<img>` kimi görünür.
- **SC-005**: Uzantısı saxta olan test fayllarının 100%-i rədd edilir; icazəli siyahıdakı hər tipdən həqiqi test faylının 100%-i qəbul olunur.
- **SC-006**: Boş bazadan `dev.ps1 -Seed` ilə qurulan lokal mühitdə public saytın şəkilləri əvvəlki kimi görünür (seed reqressiyası yoxdur).
- **SC-007**: Yükləmə tamamlandıqdan (və ya kəsildikdən) sonra yükləmədən qalan müvəqqəti fayl sayı 0.

## Assumptions

- **SVG qərarı — "saxla, zərərsizləşdir"**. Review üç yol təklif edir: SVG-ni çıxarmaq, sanitize etmək, `attachment`/ayrı domen. Seçilən: SVG icazəli qalır, public verilmədə admin `preview`-dakı kimi "tipi təxmin etmə" + "sənəd kimi açılarsa skript/xarici resurs yoxdur" başlıqları əlavə olunur. Səbəblər: (1) SVG `<img>` kimi göstəriləndə brauzer onsuz da skript icra etmir — risk yalnız birbaşa açılmadadır və bu başlıq məhz onu bağlayır; (2) qadağa mövcud məzmunu və dev seed-i qırır; (3) sanitizer yeni asılılıq və SVG-nin özünü dəyişmək deməkdir (Konstitusiya: yeni dependency yalnız əsaslandırma ilə); (4) `attachment` SVG/şəkil linkini "aç" əvəzinə "yüklə" edir — UX itkisi; (5) ayrı domen DevOps işidir (DNS, ingress, Vault) və bu spec-in əhatəsindən kənardır. Ayrı media domeni gələcək üçün qeyd olunur, amma tələb deyil.
- Başlıqlar bütün public media fayllarına tətbiq olunur (təkcə SVG-yə yox): tətbiqi sadədir, PDF və şəkillərə təsiri yoxdur, və köhnə miqrasiya olunmuş faylları da əhatə edir.
- Ölçü həddi (250 MB) və icazəli tiplər siyahısı dəyişmir; `.rar` siyahıda qalır.
- Magic byte yoxlaması "faylın başlanğıcı tipə uyğundurmu" səviyyəsindədir; tam format validasiyası (məs. PDF-in bütövlüyü, ZIP-in içində nə olduğu, `.docx`-i `.zip`-dən ayırmaq) əhatədən kənardır. ZIP əsaslı üç tip eyni imza ailəsini paylaşır.
- Antivirus skanı əhatədən kənardır.
- Mövcud fayllar yenidən yoxlanmır və adları dəyişdirilmir.
- Admin panelə (`web-cbar-admin-new`) dəyişiklik lazım deyil: rədd cavabı mövcud xəta formasındadır və panel `message`-i artıq göstərir.
- Yerli .NET SDK yoxdur; build və yaddaş ölçməsi GitLab `test` mühitinə publish-dən sonra aparılır (yaddaş: konteyner metrikləri və ya prosesin yaddaş göstəricisi yükləmədən əvvəl/sonra). SC-002-nin "bu gün" bazası da eyni üsulla, dəyişiklikdən əvvəl ölçülür.
- Asılılıq: spec 018 (vahid xəta forması, paralel dedup yarışının 409/mövcud qeyd ilə həlli) artıq tətbiq olunub; bu spec onun davranışını qoruyur.
