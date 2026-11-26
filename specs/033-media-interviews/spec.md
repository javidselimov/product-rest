# Feature Specification: Müsahibələr və çıxışlar — press-relizin üçüncü tipi

**Branch**: `main` (istifadəçi qərarı, ayrıca branch açılmır)

**Created**: 2026-11-04

**Status**: Draft

**Input**: Media bölməsinin üçüncü bəndi. Köhnə "Təqdimat və məruzələr" Figma-da "Müsahibələr və
çıxışlar" adlanır. Köhnə saytda bu bölmə yalnız PDF siyahısı idi; indi Figma-dakı kimi həm mətn, həm
də PDF yükləmə olmalıdır. Press-relizlərə yeni tip əlavə olunur.

**Figma** (`cbar website (Copy)`, səhifə `Media`, bölmə `1333:30587`):

| Ekran | Desktop | Tablet 744 | iPhone 13 |
|---|---|---|---|
| Siyahı | `1107:27193` (kontent `1107:27201`) | `1659:18410` | `1659:19162` |
| Detal | `1308:29099` | `1659:19795` | `1659:20332` |

- **Siyahı**: Xəbərlər kimidir. H1, filtr (axtarış + tarix aralığı + "Filtrləri təmizlə" + "Axtar"),
  3 sütunlu şəkilli kart (312 en, şəkil 197 hündür, tarix, başlıq), sağda paginasiya.
- **Detal**: başlıq (32/600, lh 44) → mətn → **`Save as PDF`** düyməsi (`1308:29833`: 312×56, ağ fon,
  1px stroke `#A3A3A3`, radius 4, mətn 18/500). Örtük şəkli və tarix **yoxdur**.
- **Fərq**: `Save as PDF` Xəbər (`1298:19683`) və Elan (`1298:20343`) detalında yoxdur; onlarda tarix var.
- **Menyu** (`1709:62504`): Xəbərlər, Elanlar, **Müsahibələr və çıxışlar**, Tədbirlər, …

**Hazırkı vəziyyət** (test mühiti, 2026-11-04, ölçülüb):

- Səhifə `teqdimat-ve-meruzeler` (`id 80`, köhnə `59`): mətn boşdur, **44 qoşma**. Menyu node-unun
  `navUrl`-i yoxdur. Figma kartları bu materiallardır (COP29, Toronto Centre, Global Finance).
- 44 sətrin tərkibi: **15 işlək AZ PDF, 14 işlək EN PDF, `/media/{id}` 404 verən 15 sətir**
  (`1792–1806`). 404 sətirlərinin 14-ünün eyni EN başlıqlı işlək əkizi var, yəni təkrardır. Yeganə həqiqi
  boşluq **Global Finance-in EN faylıdır** (`1795`, əkizi yoxdur). Cütlər `content-inventory.md`-dədir.
  `sizeBytes` köçürmədən qalma saxta dəyərdir (1064 yazılıb, fayl 406 KB-dır).
- Köçürülmüş faylların adı hash-dir (`324c1a…pdf`). Media seçicisi `OriginalName` üzrə axtarır.
- Həcm təxminən 240 PDF səhifəsidir. Ən azı biri tam skandır (`Voprosı ekonomiki`, 21 səhifə, 13 MB).
- Materialların dərc tarixi saxlanmayıb. PDF `CreationDate` etibarsızdır (2007-ci il çıxışında 2018).
- Xəbər (21) və Elanlarda (23) mətn var, heç birində PDF yoxdur. Test bazası kiçikdir, prod ölçülməyib.
- `press_release_assets`-də dil yoxdur, ona görə bir qeydin AZ və EN PDF-ini ayırmaq mümkün deyil.
- `press_releases.type` üzərində CHECK yoxdur; tip üçün miqrasiya lazım deyil.
- Saytın `typeSchema`-sı `2`-dən başqa hər şeyi xəbər sayır, admin API `3`-ü rədd edir.

**İstifadəçi qərarları (2026-11-04)**:

1. Yeni entity yox, `press_releases.type = 3`.
2. Köçürmə **tam əl ilədir**: kod yalnız imkanı açır, köçürmə skripti yazılmır. 15 materialı (mətn,
   tarix, PDF, şəkil) redaktorlar admin paneldən daxil edir.
3. Qoşmaya **dil** əlavə olunur: `/az`-da AZ PDF, `/en`-də EN PDF açılır, tək düymə qorunur.
4. `Save as PDF` **yüklənmiş PDF-i** açır və yalnız `type = 3`-dədir. Xəbər və Elanlarda PDF hazırkı
   kimi qoşma sətridir, görünüşləri dəyişmir.
5. Tarixi redaktorlar verir (real tarix). PDF metadata-sı istifadə olunmur.

**Əhatə olunan proyektlər** (Konstitusiya Maddə II — hər biri ayrıca MR):

- `api-cbar-admin`: `type = 3` qəbulu, qoşma dili, miqrasiya, OpenAPI, `Cbar.Domain`.
- `api-cbar`: qoşmaların dilə görə süzülməsi, OpenAPI, `Cbar.Domain` (bayt-bayt eyni).
- `web-cbar-admin-new`: tip seçimi, qoşma dili seçimi, nişanlar, izah.
- `web-cbar-new`: üçüncü tipin siyahısı və detalı, `Save as PDF`.

**Deploy sırası**: `api-cbar-admin` (miqrasiya) → `api-cbar` → `web-cbar-admin-new` → `web-cbar-new` →
redaktor məzmunu. Sayt deploy olunmamış `type = 3` dərc edilməməlidir: köhnə sayt onu xəbər şablonu ilə
açar (birbaşa link və sayt axtarışı ilə).

**`product-host` istinadı (Konstitusiya Maddə I.2)**:

| Köhnə | Nə edir | Yenidə |
|---|---|---|
| `visitor/views/pages/index.php`, səhifə `59` | PDF siyahısı | `type = 3` siyahısı və detalı; `59` qoşmaları köçürmə bitənə qədər qalır |
| `common/models/PagesAssets.php` | Qoşma: başlıq, `filename_az/en` | Press-reliz qoşmasının dili (`filename_az/en` boşluğu `type`-dan asılı olmayaraq bağlanır) |
| `visitor/models/PressReleasesForm.php` (`type` max 2) | İki tip | Üç tip |
| `common/models/PressReleasesAssets.php` | Reliz qoşmaları | Dəyişmir, dil əlavə olunur |

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Ziyarətçi Müsahibələr və çıxışlar siyahısını görür (Priority: P1)

Ziyarətçi Media menyusunun üçüncü bəndini açır. H1, breadcrumb, filtr, paginasiya və şəkilli kartlar
Xəbərlərlə eynidir. Kartda redaktorun əlavə etdiyi ilk şəkil, tarix və başlıq var.

**Why this priority**: Bölmə bu gün menyuda boş səhifə kimi görünür, faylları isə siyahıda deyil.

**Independent Test**: MSW ilə `type=3` siyahısı → şəkilli kartlar, link detala aparır, H1 CMS menyu
adından gəlir, filtr `type=3`-ü saxlayır. `type=1` və `type=2` testləri dəyişmədən keçir.

**Acceptance Scenarios**:

1. **Given** `/az/press-releases?type=3`, **When** səhifə açılır, **Then** yalnız üçüncü tip materiallar
   görünür, yenidən köhnəyə sıralanıb, 9 kart bir səhifədə.
2. **Given** şəkilsiz material, **Then** kartda boz placeholder görünür (Xəbərlər kimi).
3. **Given** axtarış və tarix aralığı doldurulub, **When** "Axtar" basılır, **Then** nəticə yalnız bu
   tipdədir, "Filtrləri təmizlə" `?type=3`-ə qaytarır.
4. **Given** CMS-də `navUrl = /press-releases?type=3`, **Then** menyuda bu bənd aktivdir, H1 və
   breadcrumb menyu adını göstərir. Node yoxdursa sayt öz etiketinə keçir.
5. **Given** ana səhifə, **Then** Media tablarında üçüncü tip görünmür.

### User Story 2 — Ziyarətçi mətni oxuyur və PDF-i yükləyir (Priority: P1)

Ziyarətçi materialı açır: başlıq, mətn, altda `Save as PDF`. Düymə həmin dilin PDF-ini açır. Örtük,
qalereya və tarix göstərilmir.

**Why this priority**: İşin əsas tələbi "həm mətn, həm PDF"dir.

**Independent Test**: MSW-də şəkil + PDF-li material → örtük, qalereya, `time` yoxdur, düymə
`/media/{id}`-yə aparır. PDF-siz materialda düymə yoxdur. Xəbər və Elan detalı dəyişmir.

**Acceptance Scenarios**:

1. **Given** mətn + PDF, **When** detal açılır, **Then** başlıq → mətn → düymə ardıcıllığı, düymə
   hər uyğun PDF-in sırada birincisinə aparır.
2. **Given** mətni boş material (skan PDF), **Then** başlıq və düymə görünür, boş blok qalmır.
3. **Given** PDF-siz material, **Then** düymə görünmür, mətn normal açılır.
4. **Given** 2 PDF + 2 şəkil, **Then** ilk PDF düymədir; ikinci PDF və ikinci şəkil "Sənədlər"
   siyahısındadır; ilk şəkil detalda heç yerdə görünmür.
5. **Given** eyni qoşmalı xəbər və ya elan, **Then** görünüş 029/031-dəki kimidir, düymə yoxdur.

### User Story 3 — Hər dildə öz PDF-i açılır (Priority: P1)

Redaktor qoşmanın dilini seçir: "Hər iki dil", "AZ" və ya "EN". Ziyarətçi yalnız öz dilinə uyğun və
hər iki dilli faylları görür.

**Why this priority**: 15 materialın əksəriyyətində AZ və EN ayrı fayldır, Figma isə tək düymə verir.

**Independent Test**: İki PDF (AZ, EN) qoşulmuş material üçün public API `locale=az` yalnız AZ faylı,
`locale=en` yalnız EN faylı qaytarır; dili seçilməmiş qoşma hər ikisində gəlir.

**Acceptance Scenarios**:

1. **Given** AZ və EN PDF, **When** `/en/...` açılır, **Then** düymə EN faylını açır, AZ fayl
   səhifədə yoxdur.
2. **Given** yalnız AZ PDF, **When** `/en/...` açılır, **Then** düymə görünmür, AZ fayl göstərilmir.
3. **Given** dili seçilməmiş köhnə qoşma, **Then** hər iki dildə əvvəlki kimi görünür.
4. **Given** dili AZ olan qoşma xəbərdə, **When** `/en/...` açılır, **Then** o fayl qoşma siyahısında
   yoxdur. Dil yalnız seçiləndə təsir edir, mövcud xəbər və elanlar dəyişmir.

### User Story 4 — Redaktor materialı admin paneldən daxil edir (Priority: P1)

Redaktor press-reliz formasında tipi "Müsahibə və çıxış" seçir, tarix, az/en başlıq və mətni yazır,
yadda saxlayandan sonra PDF və şəkil qoşur, hər faylın dilini seçir. Siyahıda bu tipə görə süzə bilir.

**Why this priority**: Köçürmə əl ilədir, 15 material yalnız bu axınla sayta çıxır.

**Independent Test**: MSW-də `type: 3` yaradılması, nişan rəngi, filtr; qoşma sətrində dil seçimi PUT
sorğusu göndərir; xəbərdə və elanda 030/031 nişanları dəyişmir.

**Acceptance Scenarios**:

1. **Given** yeni forma, **When** tip "Müsahibə və çıxış" seçilib saxlanır, **Then** qeyd `type = 3` olur.
2. **Given** üçüncü tipin qoşma bölməsi, **Then** ilk şəkildə "Kart şəkli" nişanı, ilk PDF-də "PDF
   düyməsi" nişanı, izah bu tipə uyğundur.
3. **Given** qoşma sətri, **When** dil dəyişilir, **Then** dəyişiklik saxlanır və audit olunur.
4. **Given** `type = 4` göndərən müştəri, **Then** API 400 qaytarır.

### Edge Cases

- `type = 3` material sayt axtarışında çıxır, link `/press-releases/{slug}`-dir, detal şablonu tipdən
  gəlir; ayrıca iş tələb etmir.
- Birbaşa `?type=4` URL-i etibarsız sayılır, Xəbərlər açılır (mövcud `enumParam` davranışı).
- Yalnız bir dildə tərcüməsi olan material o biri dildə siyahıda yoxdur və detalı 404-dür (mövcud qayda).
- Redaktor materialın tipini dəyişir → eyni qoşmalar növbəti yükləmədə yeni tipin qaydası ilə görünür;
  qoşma dili qalır.
- Kart şəkli dil üzrə süzülür: `/en`-də yalnız AZ şəkil varsa kart placeholder göstərir.
- API-dən 2-dən böyük naməlum tip gəlsə sayt onu xəbər kimi açır (mövcud müdafiə davranışı; yalnız `3` əlavə olunur).
- Səhifə `teqdimat-ve-meruzeler`-in öz ünvanı köçürmə müddətində işləyir; `navUrl` dəyişəndən sonra
  menyu yeni siyahıya aparır.
- "Media (Kopya)" node-u `409`-un `navUrl`-i `/press-releases?type=3&copy=1` olmalıdır (digər kopyalar kimi).

## Requirements *(mandatory)*

### Functional Requirements

**Admin API (`api-cbar-admin`) — spec-first, əvvəl `openapi/`**

- **FR-001**: `IsValidType` `1 | 2 | 3` qəbul edir; `InvalidTypeMessage` və XML şərhi yenilənir. Digər
  dəyər 400 `problem+json` qaytarır.
- **FR-002**: Miqrasiya `0017-press-release-asset-details.sql`: yoldaş cədvəl `press_release_asset_details
  (asset_id bigint PRIMARY KEY, locale varchar(5))`. Sütun yox: paylaşılan mühitlərdə mövcud cədvəllərin
  sahibi başqa roldur, `ALTER TABLE` "must be owner of table" verir (`0007`, `0014`, `0016`). Sətir yoxdursa və
  ya `locale` `NULL`-dursa fayl hər iki dildədir, backfill lazım deyil. FK-lər yalnız `REFERENCES` icazəsi
  olanda qoşulur, `cbar_web_ro`-ya `SELECT` verilir. `BEGIN`/`COMMIT` yoxdur; ad hər iki API üzrə unikaldır.
- **FR-003**: `PressReleaseAssetDetail` entity-si, `PressReleaseAsset.Details` naviqasiyası və `CbarDbContext`
  xəritələməsi hər iki `Cbar.Domain` kopyasında bayt-bayt eyni əlavə olunur.
- **FR-004**: Yeni `PUT /press-releases/{id}/assets/{mediaId}/locale` dili dəyişir (`az`, `en`, `null`).
  Yalnız `PressReleases.Update` icazəsi; audit yazılır; naməlum dil 400, tapılmayan qoşma 404.
  Əlavə etmə (`POST .../assets`) dəyişmir: qoşma `null` ilə düşür, redaktor sonra seçir. `AttachAssetDto`
  Qanunlarla ortaqdır və toxunulmur.
- **FR-005**: Detal DTO-sunun `assets[]` elementlərində `locale` qaytarılır.

**Public API (`api-cbar`)**

- **FR-010**: Detal `assets` və siyahı `imageUrl` yalnız dili boş və ya sorğu dili olan qoşmaları
  nəzərə alır. Sıra (`SortOrder`, `Id`) dəyişmir. Süzmə server tərəfindədir, sayt başqa dilin faylını
  almır; cavab formasına yeni sahə əlavə olunmur.
- **FR-011**: `type` filtri dəyişmir. OpenAPI təsvirləri (`3` Müsahibə və çıxış, dil qaydası) yenilənir.

**Sayt (`web-cbar-new`)**

- **FR-020**: `PRESS_RELEASE_TYPES` `['1','2','3']`; `typeSchema` `3`-ü saxlayır, qalan naməlum dəyərlər
  xəbər sayılır. `'2'` / `'3'` sabitləri adlandırılır (spec 032, magic number yoxdur).
- **FR-021**: `pressReleasesLabel` üçüncü tip üçün `newsList.interviews` qaytarır (`Müsahibələr və
  çıxışlar` / `Interviews and speeches`). Siyahı `photo` variantındadır.
- **FR-022**: `splitPressReleaseAssets` üçüncü tip rejimi: `cover: null`, `gallery: []`, `pdf`: ilk
  `application/pdf`, ilk şəkil heç yerə düşmür, qalan bütün qoşmalar `attachments`-dədir.
- **FR-023**: Detal: üçüncü tipdə `time` render olunmur, `CmsContent` yalnız mətn varsa render olunur,
  `Save as PDF` düyməsi `pdf` varsa görünür. Düymə adi linkdir (`/media/{id}`), JS tələb etmir;
  `download` atributu faylı material başlığı ilə saxlayır, çünki köçürülmüş faylların adı hash-dir.
  Ölçülər hər üç ekranda eynidir: Figma `1308:29833`, `1659:20066`, `1659:20482`, 312×56, mətndən 60
  aşağı. Mobil H1 22/28-dir (mövcud `SectionShell` davranışı).
- **FR-024**: Düymə etiketi `newsList.saveAsPdf` (`PDF kimi yüklə` / `Save as PDF`), çapda gizlidir
  (`data-print="hide"`). Detal `current` href-i `?type=3`-dür, breadcrumb bölmə bəndini göstərir.
- **FR-025**: Xəbər və Elan render yolları dəyişmir: 029/030/031 view testləri dəyişmədən keçir.
  `split-assets.test.ts`-də imza dəyişdiyi üçün yalnız çağırış forması yenilənir, gözləntilər eyni qalır.
- **FR-026**: Funksional testlər (MSW, rol, `userEvent`): siyahı, 4 detal halı (mətn + PDF, yalnız PDF,
  yalnız mətn, 2 PDF + 2 şəkil), `split-assets`, `typeSchema`, loader etiketi.

**Admin panel (`web-cbar-admin-new`)**

- **FR-030**: `PRESS_RELEASE_TYPE.INTERVIEW = 3`; `options`, `labelKeys`, `palette` üçüncü tipi alır;
  `locales/{az,en}/pressReleases.json` `types.3` (`Müsahibə və çıxış` / `Interview and speech`);
  `check:i18n` keçir.
- **FR-031**: `attachedAssetSchema` opsional `locale` qəbul edir; `AssetsSection` opsional dil seçimi
  alır, seçim PUT sorğusu göndərir, sonra detail refetch olunur. Digər istifadəçilər (səhifələr, qanunlar)
  dəyişmir: prop verilməsə seçim görünmür.
- **FR-032**: `PressReleaseAttachmentsSection`: dil seçimi bütün tiplərdə; üçüncü tipdə nişanlar "Kart
  şəkli" (ilk şəkil) və "PDF düyməsi" (ilk PDF), izah `attachments.descriptionInterview`. Nişan dildən
  asılıdır: AZ və EN PDF-də hər biri öz dilinin ilk PDF-idirsə ikisi də nişan alır.
- **FR-033**: Funksional testlər: tip seçimi, filtr, dil dəyişmə sorğusu, nişanlar; 030/031 testləri
  dəyişmədən keçir.

**CMS və sənədlər (kod yox, redaktor/iş sənədi)**

- **FR-040**: `web-cbar-new/docs/media-cms-guide.md`: node `80` adı `Müsahibələr və çıxışlar` /
  `Interviews and speeches`, `navUrl` `/press-releases?type=3`; kopya `409` `?type=3&copy=1`; material
  əlavə etmə addımları; dil seçimi; şəkil qaydası.
- **FR-041**: Köçürmə siyahısı `specs/033-media-interviews/content-inventory.md` (plan mərhələsində
  test məlumatından qurulub): 15 material, AZ/EN başlıq, `mediaId`, axtarış üçün fayl adı, səhifə və
  skan qeydi, redaktorun dolduracağı tarix sütunu. Bu sənəd redaktorlara təhvil verilir.
- **FR-042**: Global Finance-in EN PDF-i köhnə saytdan yenidən yüklənir. Qalan 14 səbəb redaktorun
  işinə təsir etmir: işlək əkizləri siyahıdadır. Prod-da eyni cütləmə köçürmədən əvvəl yoxlanılır.
- **FR-043**: Səhifə `80`-in 44 qoşması bütün 15 material dərc olunub yoxlanana qədər silinmir.
- **FR-044**: Root `CLAUDE.md`, `business_logic` (`/sync-business-logic`) və `web-cbar-new/CLAUDE.md`
  Media bəndi yenilənir.

### Key Entities

- **PressRelease** (`press_releases.type`: 1 Xəbər, 2 Elan, **3 Müsahibə və çıxış**): render qaydası yalnız bu sahəyə baxır.
- **PressReleaseAsset**: yoldaş sətirdə `locale` (sətir yoxdur və ya null = hər iki dil, `az`, `en`). Sıra (`sort_order`) kart şəklini və PDF düyməsini seçir.
- **Page `80`**: məzmun mənbəyi, köçürmə bitənə qədər toxunulmur; menyu node-u kimi qalır.

## Success Criteria *(mandatory)*

- **SC-001**: `/az/press-releases?type=3` 1728/744/390-da Figma `1107:27193` / `1659:18410` / `1659:19162` ilə ±2px — `visual-diff.md`.
- **SC-002**: Detal 1728/744/390-da Figma `1308:29099` / `1659:19795` / `1659:20332` ilə ±2px; düymə 312×56.
- **SC-003**: AZ və EN PDF-li materialda hər dil yalnız öz faylını açır (test mühitində yoxlanılır).
- **SC-004**: Mövcud 21 xəbər və 23 elanın saytdakı görünüşü dəyişmir: qoşma, örtük və siyahı eynidir.
- **SC-005**: Redaktor bir materialı (mətn, tarix, 2 PDF, şəkil) koda toxunmadan admin paneldən dərc edə bilir.
- **SC-006**: `npm run verify` hər iki frontend-də yaşıl (Node 24, testlər Node 22-də də); `dotnet build` hər iki API-də keçir; `route-diff.mjs` fərq göstərmir.
- **SC-007**: Hər iki `Cbar.Domain` kopyası bayt-bayt eynidir.

## Əhatədən kənar

- 15 materialın daxil edilməsi, PDF-dən mətn çıxarılması, OCR və ingilis/az tərcüməsi — redaktor işi.
- Köçürmə skripti (istifadəçi qərarı).
- Brauzerdə PDF yaratma (`window.print` və ya server render): düymə yalnız yüklənmiş faylı açır.
- Ana səhifə tablarına üçüncü tip.
- Köhnə `/page-59/...` URL-indən redirect: `legacyRedirect`-də səhifə redirect-i yoxdur, ümumi boşluqdur
  (`business_logic/diff_report_logic.md` #4). Maddə I.3 üzrə: səhifə slug-u yeni ünvanda qalır, köhnə
  ID-li URL ümumi redirect işində həll olunur.
- Xəbər və Elanlarda mətni olmayan PDF qeydlərinin axtarışı: prod ölçüsü olmadan iş yoxdur.
- Press-reliz qoşmasına başlıq (`diff_report_logic.md` §5.2): sayt `originalName` göstərməyə davam edir.

## Assumptions

- Düymə etiketi Figma-da ingiliscədir; AZ versiyada `PDF kimi yüklə` işlədilir, EN-də Figma mətni qalır.
- Detalda tarixin olmaması qəsdəndir (Figma); tarix siyahıda, filtrdə və SEO-da işlənir.
- Şəkil Figma-da kartda var, detalda yox: ilk şəkil yalnız kart üçündür. Redaktor şəkil yükləməsə placeholder qalır.
- İngiliscə ad `Interviews and speeches`-dir; Figma-da EN ekranı yoxdur.
- Bu spec-in `Requirements` bölməsi layihənin 029–031 üslubu ilə texniki yazılıb.
