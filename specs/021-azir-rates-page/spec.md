# Feature Specification: AZIR səhifəsi — əqd həcmi/sayı, `*` ehtiyat plan, statistika bloku, 60 günlük filtr, Excel export

**Feature Branch**: `021-azir-rates-page`

**Created**: 2026-10-08

**Status**: Draft

**Input**: User description: "11 Y AZIR səhifəsi: əqd həcmi/sayı, * ehtiyat plan işarəsi, statistika bloku, 60 günlük filtr, Excel export, LAST MIN/MAX RATE yoxdur — banklar bu hissə ilə bağlı. product-host-u analiz et və bax gör product-rest-də nə nəzərə alınmayıb."

**Mənbə**: `business_logic/diff_report_logic.md` §1 sətir 11 (prioritet **Y**, auditoriya: banklar), §4.2, §9, §11 qayda 4.

**Əhatə olunan proyektlər**:

- `api-cbar-admin` — AZIR məlumat modelinin genişlənməsi (migration-u o sahibdir) və redaktor üçün yeni sahələr.
- `api-cbar` — public AZIR oxuması: genişlənmiş sətirlər, statistika, Excel faylı. `Cbar.Domain` hər iki kopyada eyni dəyişir.
- `web-cbar-admin-new` — AZIR upsert kartı və siyahısında yeni sahələr.
- `web-cbar-new` — yeni AZIR səhifəsi; ana səhifə "Pul bazarı" kartında `*` və düymənin hədəfi.
- Köhnə `web-cbar` və `web-cbar-admin` **dəyişmir** (onlar əvəz olunur, root `CLAUDE.md`).

**`product-host` istinadı (Konstitusiya Maddə I.2)** — bu feature aşağıdakıları əvəz edir:

| Köhnə | Nə edir |
|---|---|
| `visitor/controllers/IndeksController.php` `actionRates`, `actionChartData` | `/indeks/rates` səhifəsi, 60 günlük qrafik datası, `?export=true` |
| `visitor/viewmodels/IndeksRatesViewModel.php` | 1D cədvəli: son 60 gün və ya `dateFrom–dateTo`, yalnız `faiz_az > 0` |
| `visitor/models/AzirForm1D.php`, `views/indeks/1D_azir_form.php` | tarix filtri (`d/m/Y`), `dateFrom` default bu gün − 60 gün |
| `views/indeks/rates.php` | qrafik + 15.05.2025 xəbərdarlığı, "Yüklə" düyməsi, cədvəl (Tarix, Faiz, Əqdlərin həcmi, Əqdlərin sayı), `*` + footnote, "1D AZIR indeksi haqqında məlumat" bloku |
| `common/models/Azir.php` `collectData()` | statistika bloku (11 göstərici, o cümlədən `LAST MIN RATE`/`LAST MAX RATE`) |
| `visitor/helpers/IndeksExportHelper.php` `exportRates` | Excel, sheet `1D AZIR`, 4 sütun |
| `admin/controllers/AzirController.php`, `admin/views/azir/manage.php` | redaktor formu: `faiz`, `eqd_hecm_az/en`, `eqd_hecm_usd`, `eqd_say_az/en`, başlıqda `*` |

**Hazırkı vəziyyət (koddan ölçülüb, 2026-10-08)**:

- Köhnədə AZIR sətri `azir_indexses`-dədir: indeks növü **başlıq mətnindən** tanınır (`title_az LIKE '1D AZIR%'`), ehtiyat plan başlıqdakı `*` ilə, gün üzrə min/max dərəcə isə **`LAST MIN RATE` / `LAST MAX RATE` başlıqlı ayrıca sətirlərlə** daxil edilir. Həcm və say mətn sahələridir (az/en ayrı).
- Yenidə `azir_index_values` yalnız `(value_date, term, rate)` saxlayır, unique `(value_date, term)`. Həcm, say, ehtiyat plan, gün min/max üçün **heç bir sahə yoxdur** (`Cbar.Domain/Entities/Statistics.cs`, `0001-initial-schema.sql`).
- Public API: `GET /api/v1/azir?from&to&term` — filtrsiz bütün tarixçə, yalnız `valueDate, term, rate` (`StatsController`). Statistika və export endpoint-i yoxdur.
- Public sayt: AZIR yalnız `/statistics`-də bütün tarixçənin qrafiki kimi (`views/statistics`) və ana səhifədə "Pul bazarı" kartı kimi var; kartın düyməsi `/statistics`-ə aparır. Cədvəl, tarix filtri, statistika, footnote, Excel **yoxdur**.
- Admin: upsert kartı yalnız `valueDate`, `term` (`1D`/`1W`/`1M`), `rate` qəbul edir.
- Köhnə statistikada məlum xətalar (`old_businesslogic.md` §10 #22): həcm min/max "son 1 il" yazılır, faktiki keçən ilin 1 yanvarından hesablanır; USD ekvivalenti məzənnə yoxdursa sıfıra bölünür; "son" dəyərlər tarixə yox, sətir id-sinə görə seçilir.

## Clarifications

### Session 2026-10-08

- Q: Yeni saytda AZIR səhifəsi harada olsun? → A: Ayrıca alt səhifə `/{locale}/statistics/azir`; `/statistics` dəyişmir, ana səhifə kartı və `/indeks/rates` bura aparır.
- Q: Statistika blokunda "son 1 ildə minimum/maksimum həcm" necə hesablansın? → A: Köhnə qayda birəbir — keçən ilin 1 yanvarından bu günə qədər; etiket "son 1 il" qalır.
- Q: Köhnə AZIR tarixçəsi bu feature-un içində köçürülsünmü? → A: Xeyr — ayrıca spec; import cutover-dən əvvəl ayrıca iş kimi edilir.
- Q: Excel faylının strukturu köhnə faylla birəbir eyni olsun, yoxsa ehtiyat plan üçün əlavə sütun yazılsın? → A: Birinci vərəq `1D AZIR` köhnə kimi 4 sütun, əlavə sətir yoxdur; ehtiyat plan günləri və footnote ayrıca "Qeydlər" vərəqində.
- Q: Redaktorun daxil etdiyi AZIR dəyəri dərhal public olsun, yoxsa four-eyes təsdiqindən sonra? → A: Dərhal (köhnə kimi); four-eyes qərarı spec 008-ə qalır, bu feature ona mane olmamalıdır.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Bank analitiki son 60 günün 1D AZIR cədvəlini həcm və say ilə görür (Priority: P1)

Bank xəzinədarlığının analitiki AZIR səhifəsini açır və son 60 günün 1D AZIR dəyərlərini cədvəldə görür: tarix, faiz dərəcəsi, əqdlərin həcmi (mln manat), əqdlərin sayı. Ehtiyat plan əsasında hesablanmış günlər `*` ilə işarələnir, cədvəlin altında izah verilir.

**Why this priority**: Banklar üçün əsas məlumat budur; həcm və say olmadan dərəcənin bazar dərinliyini qiymətləndirmək olmur. Digər hissələr (statistika, export) bu məlumat modelinə söykənir.

**Independent Test**: Redaktor bir neçə gün üçün 1D dəyərini həcm, say və bir gün üçün ehtiyat plan işarəsi ilə daxil edir; public səhifədə həmin sətirlər ən yenisi yuxarıda, `*` və footnote ilə görünür.

**Acceptance Scenarios**:

1. **Given** son 60 gündə 40 iş günü üçün 1D dəyəri var, **When** istifadəçi səhifəni filtrsiz açır, **Then** cədvəldə həmin 40 sətir tarixə görə azalan sırada, hər birində tarix, faiz, həcm və say göstərilir.
2. **Given** 61 gün əvvəlki tarix üçün dəyər var, **When** səhifə filtrsiz açılır, **Then** həmin sətir cədvəldə görünmür.
3. **Given** bir gün ehtiyat plan əsasında işarələnib, **When** cədvəl göstərilir, **Then** həmin günün faizinin yanında `*` var və cədvəlin altında "*Ehtiyat plan əsasında hesablanmışdır" qeydi çıxır.
4. **Given** göstərilən aralıqda heç bir gün işarələnməyib, **When** cədvəl göstərilir, **Then** footnote göstərilmir.
5. **Given** dərəcəsi 0 və ya boş olan gün var, **When** cədvəl göstərilir, **Then** o gün cədvəldə yoxdur.
6. **Given** istifadəçi ingilis dilindədir, **When** səhifəni açır, **Then** sütun başlıqları, footnote və bütün sabit mətnlər ingiliscədir, rəqəmlər eynidir.

---

### User Story 2 — Redaktor gündəlik AZIR məlumatını tam daxil edir (Priority: P1)

Redaktor admin paneldə 1D AZIR üçün tarix və dərəcə ilə yanaşı əqdlərin həcmini, sayını, son əməliyyat gününün minimum və maksimum dərəcəsini və "ehtiyat plan əsasında hesablanıb" işarəsini daxil edir, sonradan düzəldir.

**Why this priority**: Bu sahələr daxil edilmədən public səhifədə göstəriləcək heç nə yoxdur; US1 və US3 bundan asılıdır.

**Independent Test**: Admin paneldə bir tarix üçün bütün sahələrlə 1D dəyəri saxlanır, siyahıda görünür, eyni tarixə yenidən saxlananda yenilənir, audit jurnalında dəyişiklik qeyd olunur.

**Acceptance Scenarios**:

1. **Given** redaktor upsert kartını açıb, **When** 1D üçün tarix, dərəcə, həcm, say, min dərəcə, max dərəcə və ehtiyat plan işarəsini doldurub saxlayır, **Then** sətir yaranır və siyahıda bütün sahələrlə görünür.
2. **Given** həmin tarix+müddət üçün sətir artıq var, **When** redaktor yeni həcmlə saxlayır, **Then** mövcud sətir yenilənir (dublikat yaranmır) və audit jurnalında əvvəlki/sonrakı dəyər qalır.
3. **Given** redaktor yalnız tarix və dərəcəni doldurur, **When** saxlayır, **Then** sətir qəbul olunur — əlavə sahələr məcburi deyil (tarixçə və digər müddətlər üçün).
4. **Given** redaktor mənfi həcm, mənfi və ya kəsr say, yaxud max-dan böyük min dərəcə daxil edir, **When** saxlayır, **Then** sahəyə bağlı aydın xəta mesajı çıxır və heç nə yazılmır.
5. **Given** 30D/90D/180D kimi digər müddət üçün sətir daxil edilir, **When** saxlanır, **Then** ehtiyat plan işarəsi bu müddətlər üçün də qəbul olunur, həcm/say/min/max isə boş qala bilər.

---

### User Story 3 — Analitik "1D AZIR indeksi haqqında məlumat" statistika blokunu görür (Priority: P2)

Səhifədə cədvəldən asılı olmayaraq ən son vəziyyəti xülasə edən blok var: yenilənmə tarixi, son faiz, ötən ay sonundan və il sonundan dəyişmə, son əməliyyat günündə minimum və maksimum dərəcə, son əqd həcmi və onun ötən ay sonundan dəyişməsi, son 1 ildə minimum və maksimum həcm, həcmin ABŞ dolları ekvivalenti.

**Why this priority**: Banklar bu xülasəni hesabat və risk qiymətləndirməsində istifadə edir, amma o, US1-in məlumatına söykənir və onsuz da cədvəldən əl ilə hesablana bilər.

**Independent Test**: Məlum test dəstində (məs. ötən ayın son günü 7,00%, ilin son günü 6,50%, son gün 7,25%) blok gözlənilən rəqəmləri (+0,25 / +0,75) göstərir.

**Acceptance Scenarios**:

1. **Given** son 1D dəyəri 7,25% (12.09.2026), ötən ayın sonuna qədər son dəyər 7,00%, keçən ilin 31 dekabrına qədər son dəyər 6,50%, **When** blok göstərilir, **Then** yenilənmə tarixi 12.09.2026, son faiz 7,25%, aylıq dəyişmə +0,25, illik dəyişmə +0,75.
2. **Given** son gün üçün min 6,90% və max 7,60% daxil edilib, **When** blok göstərilir, **Then** "son əməliyyat günündə minimum/maksimum dərəcə" sətirləri bu dəyərləri göstərir.
3. **Given** son günün həcmi 250 mln manat, həmin tarixə rəsmi USD məzənnəsi 1,7000, **When** blok göstərilir, **Then** ABŞ dolları ekvivalenti 147,06 mln USD.
4. **Given** bu gün 08.10.2026-dır, 01.01.2025-dən bəri həcmlər 80–420 arası dəyişir, 31.12.2024-də isə həcm 500 olub, **When** blok göstərilir, **Then** min 80, max 420 — keçən ilin 1 yanvarından əvvəlki dəyərlər nəzərə alınmır (köhnə qayda).
5. **Given** göstərici üçün məlumat çatışmır (məs. min/max daxil edilməyib, USD məzənnəsi yoxdur, keçən ilə aid dəyər yoxdur), **When** blok göstərilir, **Then** həmin sətirdə "—" görünür, səhifənin qalanı normal işləyir.
6. **Given** istifadəçi cədvəldə tarix filtri tətbiq edib, **When** blok göstərilir, **Then** blokun rəqəmləri filtrdən asılı olmayaraq ən son vəziyyəti əks etdirir.

---

### User Story 4 — Analitik istənilən tarix aralığını seçir (Priority: P2)

İstifadəçi başlanğıc və son tarix seçib cədvəli həmin aralıqla məhdudlaşdırır; seçim linkdə qalır ki, paylaşıla bilsin.

**Why this priority**: Tarixi dövrlər üzrə təhlil üçün lazımdır, amma default 60 gün əksər gündəlik istifadəni əhatə edir.

**Independent Test**: 01.01.2026–31.01.2026 aralığı seçilir; cədvəldə yalnız yanvar günləri görünür, link kopyalanıb başqa brauzerdə açılanda eyni nəticə alınır.

**Acceptance Scenarios**:

1. **Given** filtr boşdur, **When** səhifə açılır, **Then** başlanğıc sahəsində bu gün − 60 gün, son sahədə bu gün göstərilir.
2. **Given** istifadəçi 01.01.2026–31.01.2026 seçir, **When** tətbiq edir, **Then** cədvəldə yalnız bu aralığın (hər iki uc daxil) sətirləri görünür və seçim səhifənin ünvanında saxlanır.
3. **Given** yalnız başlanğıc tarix verilib, **When** tətbiq edilir, **Then** son tarix bu gün sayılır.
4. **Given** başlanğıc son tarixdən sonradır və ya tarix formatı səhvdir, **When** tətbiq edilir, **Then** filtrin yanında aydın xəta mesajı çıxır, səhifə default 60 günü göstərməyə davam edir (köhnədəki kimi ana səhifəyə atmır).
5. **Given** aralıqda məlumat yoxdur, **When** tətbiq edilir, **Then** "seçilmiş dövr üçün məlumat yoxdur" mesajı görünür.

---

### User Story 5 — Analitik cədvəli Excel faylı kimi yükləyir (Priority: P3)

İstifadəçi "Yüklə" düyməsi ilə ekranda görünən cədvəli (cari filtr ilə) Excel faylı kimi alır və öz modellərinə köçürür.

**Why this priority**: Faydalıdır, amma cədvəl ekrandan da götürülə bilər; diff hesabatında bu hissənin prioriteti **O**-dur.

**Independent Test**: Yanvar 2026 filtri ilə yüklənən fayl Excel-də açılır; `1D AZIR` vərəqində 4 sütun və ekrandakı ilə eyni sayda sətir var.

**Acceptance Scenarios**:

1. **Given** cədvəldə cari filtr ilə 21 sətir var, **When** istifadəçi "Yüklə"-yə basır, **Then** `1D AZIR` adlı vərəqi olan Excel faylı yüklənir: başlıq sətri (Tarix, Faiz, Əqdlərin həcmi, Əqdlərin sayı — səhifənin dilində) + eyni sırada 21 sətir.
2. **Given** fayl yüklənib, **When** Excel-də açılır, **Then** faiz, həcm və say xanaları rəqəm kimi tanınır (mətn kimi yox), tarix `DD.MM.YYYY` formatındadır.
3. **Given** aralıqda 2 sətir ehtiyat plan işarəlidir, **When** fayl yaradılır, **Then** `1D AZIR` vərəqi köhnə kimi yalnız 4 sütundan ibarətdir (`*` yoxdur, rəqəm xanaları rəqəmdir), ikinci "Qeydlər" vərəqində həmin 2 tarix və footnote mətni var.
4. **Given** aralıqda məlumat yoxdur, **When** "Yüklə" basılır, **Then** yalnız başlıq sətri olan fayl yüklənir.
5. **Given** aralıqda işarəli sətir yoxdur, **When** fayl yaradılır, **Then** faylda yalnız `1D AZIR` vərəqi var.

---

### User Story 6 — Ana səhifə kartı ehtiyat planı göstərir və AZIR səhifəsinə aparır (Priority: P3)

Ana səhifənin "Pul bazarı" kartında son 1D dəyəri ehtiyat plan əsasında hesablanıbsa `*` görünür; kartın düyməsi yeni AZIR səhifəsinə aparır.

**Why this priority**: Kiçik, amma köhnə ana səhifədə olan və banklar üçün yanıltıcı olmaması vacib olan detal.

**Independent Test**: Son 1D sətri işarələnir; ana səhifədə 1D dəyərinin yanında `*` çıxır; düymə AZIR səhifəsini açır.

**Acceptance Scenarios**:

1. **Given** son 1D dəyəri ehtiyat plan işarəlidir, **When** ana səhifə açılır, **Then** kartdakı 1D dəyərinin yanında `*` və qısa izah var.
2. **Given** kartdakı düyməyə basılır, **When** keçid olur, **Then** cari dildə AZIR səhifəsi açılır.

### Edge Cases

- **Bir tarixdə bir neçə 1D yazısı**: yeni modeldə `(tarix, müddət)` unikaldır, bu hal yaranmır; köhnədəki "id-yə görə son" qaydası tətbiq olunmur — "son" həmişə ən böyük tarixdir.
- **Həftəsonu/bayram**: o günlər üçün yazı yoxdur, cədvəldə görünmür; "ötən ay sonu"/"il sonu" müqayisəsi həmin tarixə **qədər olan son** dəyərlə aparılır.
- **Yeni ilin ilk günləri / ayın əvvəli**: müqayisə dəyəri yoxdursa dəyişmə "—" göstərilir, sıfır yox.
- **USD məzənnəsi həmin tarixə yoxdur**: həmin tarixə qədər olan son rəsmi USD məzənnəsi götürülür; heç biri yoxdursa "—" (sıfıra bölmə yoxdur).
- **Əlavə sahələri boş köhnə/tarixi sətirlər**: cədvəldə həcm və say xanası "—" göstərilir, sətir gizlənmir.
- **Çox geniş aralıq (məs. 10 il)**: icazəlidir; səhifə və fayl tam aralığı qaytarır, amma ekranda göstərmə səhifələnə bilər (Assumptions).
- **Gələcək tarix**: son tarix bu gündən sonradırsa bu günə endirilir.
- **Rəqəm formatı**: az dilində onluq ayırıcı vergül, en dilində nöqtədir; Excel faylında xanalar rəqəm kimi saxlanır, format dildən asılı deyil.

## Requirements *(mandatory)*

### Functional Requirements

**Məlumat və redaktə (`api-cbar-admin`, `web-cbar-admin-new`)**

- **FR-001**: AZIR dəyəri tarix, müddət və dərəcəyə əlavə olaraq bunları saxlamalıdır: əqdlərin həcmi (mln manat, 2 onluğa qədər), əqdlərin sayı (tam ədəd), son əməliyyat gününün minimum dərəcəsi, maksimum dərəcəsi və "ehtiyat plan əsasında hesablanıb" işarəsi. Yeni sahələr boş ola bilər; işarə default "yox"-dur.
- **FR-002**: Mövcud sətirlər dəyişikliksiz qalmalı və yeni sahələri boş/"yox" olaraq almalıdır.
- **FR-003**: Redaktor upsert kartında yeni sahələri doldura və mövcud sətri eyni tarix+müddətlə yenidən saxlayaraq dəyişə bilməlidir; ehtiyat plan işarəsini götürmək də mümkün olmalıdır.
- **FR-004**: Saxlamada yoxlama: həcm ≥ 0, say ≥ 0 tam ədəd, min/max dərəcə ≥ 0, ikisi də verilibsə min ≤ max. Xəta sahəyə bağlı mesajla qaytarılmalı, heç nə yazılmamalıdır.
- **FR-005**: Admin siyahısı yeni sahələri (ən azı həcm, say, ehtiyat plan işarəsi) göstərməlidir.
- **FR-006**: Hər yaratma/yeniləmə/silmə audit jurnalına yeni sahələrlə birlikdə yazılmalıdır.
- **FR-006a**: Saxlanmış dəyər təsdiq addımı olmadan dərhal public olur (köhnə davranış). Hazırkı giriş/icazə qaydası dəyişmir. Dəyər "yaz → saxla" kimi tək əməliyyat qalır ki, spec 008 (FR-009) AZIR-i sonradan four-eyes-a daxil etsə, bütün sahələr (FR-001) qaralama/təsdiq axınına olduğu kimi qoşula bilsin.
- **FR-007**: İndeks növü sərbəst başlıq mətnindən deyil, ayrıca müddət sahəsindən gəlməyə davam etməlidir; `LAST MIN RATE`/`LAST MAX RATE` ayrıca sətir kimi **yox**, 1D sətrinin sahələri kimi saxlanır.

**Public səhifə (`api-cbar`, `web-cbar-new`)**

- **FR-008**: Public saytda iki dildə ayrıca AZIR səhifəsi `/{locale}/statistics/azir` ünvanında olmalıdır; köhnə `/indeks/rates` ünvanı (dil prefiksli və prefikssiz, query parametrləri ilə) yeni səhifəyə yönləndirilməlidir (Konstitusiya I.3).
- **FR-009**: Səhifə 1D AZIR qrafikini cədvəlin göstərdiyi eyni aralıq üçün göstərməlidir.
- **FR-010**: Cədvəl yalnız 1D dəyərlərini, yalnız dərəcəsi 0-dan böyük olanları, tarixə görə azalan sırada göstərməlidir; sütunlar: Tarix, Faiz, Əqdlərin həcmi, Əqdlərin sayı.
- **FR-011**: Filtr verilməyəndə aralıq "bu gün − 60 gün" ilə "bu gün" arasıdır (hər iki uc daxil).
- **FR-012**: İstifadəçi başlanğıc və son tarix seçə bilməlidir; seçim səhifə ünvanında saxlanmalı, səhv və ya ziddiyyətli tarix yönləndirmə yox, xəta mesajı ilə cavablanmalıdır (US4 ssenari 4).
- **FR-013**: Ehtiyat plan işarəli sətirlərdə faizin yanında `*` göstərilməli; göstərilən sətirlər arasında ən azı biri işarəlidirsə, cədvəlin altında dilə uyğun footnote çıxmalıdır.
- **FR-014**: Səhifədə "15 may 2025-ci il tarixindən etibarən AZIR indeksləri ... metodologiya əsasında açıqlanır" xəbərdarlığı qrafikin altında göstərilməlidir (köhnə `AZIR Chart Alert` mətni, iki dildə).
- **FR-015**: Statistika bloku filtrdən asılı olmayaraq bu göstəriciləri verməlidir (hamısı 1D üzrə):
  1. yenilənmə tarixi — dərəcəsi olan ən son tarix;
  2. son faiz;
  3. ötən ay sonundan dəyişmə — son faiz − ötən ayın son gününə qədər olan son faiz;
  4. il sonundan dəyişmə — son faiz − keçən ilin 31 dekabrına qədər olan son faiz;
  5. son əməliyyat günündə minimum dərəcə;
  6. son əməliyyat günündə maksimum dərəcə;
  7. son əqd həcmi;
  8. həcmin ötən ay sonundan dəyişməsi — eyni qayda ilə;
  9. "son 1 il" minimum həcm — keçən ilin 1 yanvarından bu günə qədər (köhnə qayda birəbir);
  10. "son 1 il" maksimum həcm — eyni dövr;
  11. son həcmin ABŞ dolları ekvivalenti — son həcm ÷ həmin tarixə qədər olan son rəsmi USD məzənnəsi, 2 onluq.
- **FR-016**: Hesablana bilməyən göstərici "—" göstərilməli, blokun qalanına və səhifəyə təsir etməməlidir. Dəyişmələr işarə ilə göstərilməlidir (`+0,25`, `−0,10`).
- **FR-017**: Səhifənin hissələri (qrafik, cədvəl, statistika) müstəqil yüklənməlidir: biri xəta versə, digərləri göstərilir, xətalı hissədə inline mesaj olur.
- **FR-018**: "Yüklə" düyməsi cari filtrlə cədvəlin Excel faylını verməlidir: vərəq adı `1D AZIR`, başlıqlar səhifənin dilində, sütunlar Tarix, Faiz, Əqdlərin həcmi, Əqdlərin sayı; rəqəmlər rəqəm xanası kimi. Birinci vərəqin strukturu köhnə faylla birəbir eynidir (4 sütun, başlıqdan sonra yalnız məlumat sətirləri, əlavə sütun/sətir yoxdur) ki, faylı avtomatik oxuyan bank skriptləri qırılmasın. Aralıqda ehtiyat plan işarəli sətir varsa, ikinci "Qeydlər" (en: "Notes") vərəqində həmin tarixlər və footnote mətni verilir; yoxdursa ikinci vərəq yaradılmır.
- **FR-019**: Public cavablar yalnız oxuma ilə qurulur; public komponent heç nə yazmır.
- **FR-020**: Ana səhifə "Pul bazarı" kartında son 1D dəyəri işarəlidirsə `*` və footnote göstərilməli, kartın düyməsi AZIR səhifəsinə aparmalıdır; `/statistics` səhifəsindəki AZIR qrafiki dəyişmədən qalır.
- **FR-021**: Bütün sabit mətnlər (başlıqlar, sütunlar, footnote, xəbərdarlıq, statistika etiketləri, xəta və boş mesajlar) az və en dillərində olmalıdır; köhnənin mətnləri əsas götürülür.

### Ləğv edilən / əhatədən kənar (Konstitusiya I.3)

- **`eqd_hecm_az/en`, `eqd_say_az/en` ayrı dil sahələri** — ləğv edilir: rəqəm dildən asılı deyil, bir dəyər saxlanır.
- **`eqd_hecm_usd` əl ilə daxil edilən sahə** — ləğv edilir: köhnə public səhifə də onu oxumurdu, USD ekvivalenti məzənnədən hesablanır (FR-015.11).
- **`LAST MIN RATE` / `LAST MAX RATE` ayrıca sətirlər** — 1D sətrinin sahələri ilə əvəz olunur (FR-007).
- Bu spec-ə daxil deyil, ayrıca işdir (diff §4.2, prioritet O/A): TFAI-nin `%`-siz göstərilməsi, `home_view`/`date_view`, `show_before_day` qeydi, `compounded_term.pdf` yükləmə və metodologiya PDF düymələri, admin müddət siyahısının (`1D/1W/1M`) ana səhifədəki `30D/90D/180D` ilə uyğunlaşdırılması.
- **Köhnə `azir_indexses` tarixçəsinin import-u** — ayrıca spec-dir və **cutover-dən əvvəl** bitməlidir (Clarifications 2026-10-08). Bu feature-un məlumat modeli həmin import-un hədəfidir, ona görə import-un ehtiyac duyduğu bütün sahələri (FR-001) daşımalıdır. Import spec-i nəzərə almalıdır: indeks növü və `*` başlıq mətnindən çıxarılır, `LAST MIN/MAX RATE` sətirləri eyni tarixin 1D sətrinə birləşdirilir, köhnə admin INSERT-indəki sütun yerdəyişməsi (`old_businesslogic.md` §10 #3) yoxlanılır. Import olmadan bu feature deploy oluna bilər, amma cutover oluna bilməz.

### Key Entities

- **AZIR dəyəri**: bir tarix və müddət (1D, 30D, ...) üçün bir yazı. Atributlar: tarix, müddət, dərəcə (%), əqdlərin həcmi (mln manat, boş ola bilər), əqdlərin sayı (boş ola bilər), son gün minimum dərəcə, son gün maksimum dərəcə (boş ola bilər), ehtiyat plan işarəsi. Tarix+müddət unikaldır.
- **Rəsmi USD məzənnəsi**: mövcud valyuta məzənnələri cədvəlindən; yalnız USD ekvivalentini hesablamaq üçün oxunur.
- **1D statistika xülasəsi**: saxlanmır, hər sorğuda AZIR dəyərlərindən və USD məzənnəsindən hesablanır (FR-015).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Köhnə `/indeks/rates` səhifəsindəki 4 cədvəl sütunu, `*` + footnote, 11 statistika göstəricisi, 60 günlük default, tarix filtri və Excel export-un **hamısı** yeni saytda var — `diff_report_logic.md` §1 sətir 11 və §4.2-nin "Y" sətirləri ✅ olur.
- **SC-002**: Eyni test dəsti üzərində statistika blokunun 11 göstəricisindən hər biri əl ilə hesablanmış dəyərlə 0,01 dəqiqliklə üst-üstə düşür (ən azı ayın əvvəli, ilin əvvəli və məlumat çatışmayan hal daxil).
- **SC-003**: Yüklənən Excel faylı ekrandakı cədvəllə sətir sayına və dəyərlərə görə 100% eynidir və əlavə əməliyyatsız cədvəl prosessorunda rəqəm kimi cəmlənə bilir.
- **SC-004**: Redaktor bir günün tam AZIR məlumatını (bütün sahələr) 1 dəqiqədən az vaxtda daxil edir və dəyər public səhifədə dərhal (yenidən yükləmədən sonra) görünür.
- **SC-005**: Səhifə default 60 günlük görünüşdə adi iş saatı yükündə 2 saniyədən tez tam açılır; 10 illik aralıq seçiləndə də səhv vermədən cavab verir.
- **SC-006**: Səhifənin bir hissəsinin (məs. statistikanın) xətası digər hissələrin göstərilməsinə mane olmur — hər hissə üçün yoxlanılır.

## Assumptions

- **Səhifə ünvanı**: yeni sayt ünvanları köhnə Yii marşrutlarını təkrarlamır; AZIR səhifəsi `/{locale}/statistics/azir`-dir (Clarifications 2026-10-08).
- **Həcm vahidi** mln manatdır, köhnədəki kimi; redaktor rəqəmi elə daxil edir.
- **"Son 1 il" həcm min/max** köhnə saytla rəqəm uyğunluğu üçün birəbir köçürülür: dövr keçən ilin 1 yanvarından bu günə qədərdir (9–21 ay), etiket "son 1 il" qalır. Bu, məlum köhnə xətanın (`old_businesslogic.md` §10 #22) şüurlu saxlanmasıdır (Clarifications 2026-10-08).
- **Dərəcə filtrləri**: cədvəl də, statistika da yalnız dərəcəsi > 0 olan sətirləri nəzərə alır (köhnədə statistika ≥ 0, cədvəl > 0 idi; vahid qayda seçilir, çünki 0% AZIR "məlumat yoxdur" deməkdir).
- **"Son əməliyyat günü min/max"** yalnız son tarixin 1D sətrindən götürülür; o gün üçün daxil edilməyibsə "—" (əvvəlki günə fallback yoxdur, köhnədəki kimi).
- **İngiliscə footnote**: köhnə mətn ("The reserve was calculated based on the plan") səhv tərcümədir; "*Calculated on the basis of the contingency plan" kimi düzəldilmiş mətn istifadə olunur, final mətn redaksiya ilə təsdiqlənir.
- **Səhifələmə**: geniş aralıqda ekran cədvəli səhifələnə bilər; Excel həmişə tam aralığı verir.
- **Ehtiyat plan işarəsi** bütün müddətlər üçün saxlana bilər, amma bu spec-də yalnız 1D üçün göstərilir.
- **Deploy sırası** root `CLAUDE.md`-ə uyğundur: əvvəl `api-cbar-admin` (migration), sonra `api-cbar`, sonra frontendlər. Endpoint dəyişiklikləri spec-first (`openapi/` əvvəl).
- **Lokal yoxlama**: .NET SDK lokalda yoxdur; backend test mühitində yoxlanılır, frontendlər `npm run verify` (Node 22 də daxil) ilə.
