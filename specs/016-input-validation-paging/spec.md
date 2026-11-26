# Feature Specification: Admin API-də sistemli input validation və səhifələmə limitləri

**Feature Branch**: `016-input-validation-paging`

**Created**: 2026-10-05

**Status**: Draft

**Input**: User description: "8. Input validation sistemli deyil. — 8a: 2 SP, 8b: 8 SP. pageSize/page clamp olunmur (bütün List endpoint-lər). pageSize=1000000 bütün cədvəli yükləyir. page=0 mənfi Skip verir, nəticə 500. Title boş ola bilər, locale açarları locales cədvəlinə qarşı yoxlanmır. Məzənnə <= 0 ola bilər, email formatı yoxlanmır. Sahə uzunluqları DB-yə çatana qədər yoxlanmır. Həll: FluentValidation və ya DataAnnotations, üstəlik ortaq PagingQuery record-u (clamp ilə). SP izahı: 8a: bir record və List endpoint-lərdə mexaniki əvəzləmə — AI üçün ideal iş. 8b: hər DTO üçün validator. AI uzunluqları schema-dan çıxara bilər, amma qaydaların (məs. hansı sahə məcburidir) hər biri yoxlanmalıdır. #7-dən sonra etmək daha yaxşıdır ki, xəta formatı eyni olsun."

**Mənbə**: `api-admin-review.md`, task #8a (🟠, 2 SP) və #8b (🟠, 8 SP).

**Əhatə olunan proyekt**: yalnız `api-cbar-admin`. `api-cbar` (public API), sxem və
`Cbar.Domain` **toxunulmur** — migration yoxdur, route-lar dəyişmir. Admin panel
(`product-rest/web-cbar-admin-new`) üçün dəyişiklik tələb olunmur: onun göndərdiyi ən böyük
`pageSize` 50-dir (azir, info-lines), qalanları 20/24 (bax Assumptions). Panelin 400 cavabını
göstərməsi ilə bağlı uyğunlaşma, lazım olarsa, #7 kimi ayrıca task-dır.

**İki hissə, iki çatdırılma**:

- **8a — səhifələmə limitləri** (User Story 1): müstəqildir, dərhal edilə bilər
  (review-da "Dərhal" sırasındadır).
- **8b — sorğu gövdəsinin yoxlanması** (User Story 2–4): xəta cavabının forması #7
  (ProblemDetails + `DbUpdateException` mapping) ilə müəyyən olunur. 8b #7-dən sonra
  icra olunur ki, validation xətası və DB-dən gələn xəta eyni formada qayıtsın.

**`product-host` istinadı (Konstitusiya Maddə I.2)**: `common/models` və `admin/models` —
36 Yii2 modelinin `rules()` metodu (`required`, `string max`, `email` və s.) və admin
list-lərinin `pagination => ['pageSize' => PAGE_SIZE]` (səhifə ölçüsü serverdə sabitdir,
istifadəçidən gəlmir). Köhnə sistem hər iki məsələni həll edirdi; yeni sistemdə bu itib.
Bu spec onu bərpa edir — paritetin qaytarılmasıdır, yeni davranış deyil.

**Paritet (İş axını qaydası 5)**:

| `product-host` davranışı | Yeni sistemdə (bu gün) | Bu spec-dən sonra |
|---|---|---|
| List səhifə ölçüsü serverdə sabitdir | İstənilən `pageSize` qəbul olunur, `1000000` bütün cədvəli qaytarır | `pageSize` 1..100 aralığına sıxılır |
| Səhifə nömrəsi səhv olanda ilk səhifə göstərilir | `page=0` / mənfi → server xətası (500) | `page < 1` → 1-ci səhifə |
| `rules()`: `required` (məs. `title_az`, `title_en`, `date`) | Boş başlıq saxlanılır | Göndərilən hər tərcümədə başlıq məcburidir; dil tamlığı tələbi qəsdən **bərpa olunmur** (Maddə V.3) |
| `rules()`: `string max` | Uzun dəyər DB-yə çatır, 500 | Sahə səviyyəsində 400, DB-yə müraciət olmadan |
| `rules()`: `email` | Formatı yoxlanmır | Format yoxlanır |
| Locale yalnız `az`/`en` formalarından gəlir | İstənilən locale açarı qəbul olunur, FK xətası → 500 | Naməlum və ya qeyri-aktiv locale → 400 |

## User Scenarios & Testing *(mandatory)*

### User Story 1 - List sorğuları ağlabatan həcmlə məhdudlaşır və səhv səhifə nömrəsi xəta vermir (Priority: P1) — 8a

Redaktor və ya inteqrasiya (və ya JWT-si olan istənilən şəxs) list endpoint-inə
`pageSize=1000000` göndərir. Bu gün server bütün cədvəli yaddaşa yükləyib qaytarır — media,
xəbər və məzənnə tarixçəsi kimi böyüyən cədvəllərdə bu, API-ni yavaşladır və ya yıxır.
`page=0` və ya mənfi səhifə isə 500 xətası verir. Bu spec-dən sonra hər list sorğusu bir
səhifədə müəyyən maksimumdan çox qeyd qaytarmır, səhv səhifə nömrəsi isə xəta yox, ilk
səhifəni verir. Cavab həqiqətən tətbiq olunan `page` və `pageSize`-ı göstərir ki, müştəri
səhifələməni düzgün qursun.

**Why this priority**: Ən ucuz (2 SP), müstəqil, və bir sorğu ilə API-ni yükləmək
imkanını bağlayır. Review-da "Dərhal" sırasındadır, #7-dən asılı deyil.

**Independent Test**: Hər list endpoint-ində (13 endpoint, bax FR-001) `pageSize=1000000`,
`pageSize=0`, `pageSize=-5`, `page=0`, `page=-1` və parametrsiz sorğu göndərilir; cavabın
200 olduğu, qaytarılan qeyd sayının maksimumu aşmadığı və cavabdakı `page`/`pageSize`-ın
tətbiq olunan dəyərlər olduğu yoxlanılır.

**Acceptance Scenarios**:

1. **Given** cədvəldə 500 qeyd var, **When** `pageSize=1000000` ilə list istənir, **Then**
   cavab 200-dür, ən çox 100 qeyd qaytarılır, cavabdakı `pageSize` 100-dür və `total` 500-dür.
2. **Given** istənilən list endpoint-i, **When** `page=0` və ya `page=-1` göndərilir,
   **Then** cavab 200-dür və 1-ci səhifə qaytarılır (`page` = 1).
3. **Given** istənilən list endpoint-i, **When** `pageSize=0` və ya mənfi göndərilir,
   **Then** cavab 200-dür və həmin endpoint-in bugünkü default ölçüsü tətbiq olunur.
4. **Given** parametrsiz sorğu, **When** list istənir, **Then** nəticə bu gün ilə eynidir
   (eyni default `page` = 1 və endpoint-ə xas default `pageSize`).
5. **Given** admin panel adi iş axınında (ölçü 20, 24, 50), **When** list-lər açılır,
   **Then** heç bir fərq görünmür.
6. **Given** `page` son səhifədən böyükdür, **When** list istənir, **Then** bu gün kimi
   boş `items` və düzgün `total` qaytarılır (xəta yox).

---

### User Story 2 - Səhv məzmun saxlanılmır və redaktor hansı sahənin səhv olduğunu görür (Priority: P2) — 8b

Redaktor tərcüməsi olan bir qeyd (səhifə, xəbər, banner, qalereya və s.) yaradır və ya
redaktə edir. Bu gün başlığı boş tərcümə qəbul olunur və public saytda başlıqsız qeyd çıxır;
sahə uzunluğu aşılanda isə DB xətası 500 kimi qayıdır və redaktor nəyin səhv olduğunu bilmir.
Bu spec-dən sonra belə sorğu saxlanılmadan rədd edilir və cavab **hər səhv sahəni ayrıca**,
dil (locale) daxil olmaqla, adlandırır.

**Why this priority**: Məlumat keyfiyyətini və istifadəçi təcrübəsini birbaşa yaxşılaşdırır,
500-lərin əksəriyyətini anlaşılan 400-ə çevirir. #7-dən asılıdır, ona görə P1-dən sonra.

**Independent Test**: Tərcüməli bir resursda (məs. press release) boş başlıqlı `az`
tərcüməsi, limitdən uzun başlıq və həm boş, həm uzun sahələri olan sorğu göndərilir;
hər birinin 400 ilə rədd olunduğu, cavabın səhv sahələri adlandırdığı və bazada heç nəyin
dəyişmədiyi yoxlanılır.

**Acceptance Scenarios**:

1. **Given** yaratma və ya redaktə sorğusu, **When** göndərilən tərcümələrdən birində başlıq
   boşdur və ya yalnız boşluqdan ibarətdir, **Then** 400 qaytarılır, xəta həmin locale-in
   başlıq sahəsini göstərir və heç nə saxlanılmır.
2. **Given** sorğuda yalnız `az` tərcüməsi var (dolu başlıqla), **When** göndərilir, **Then**
   uğurlu olur — `en` tərcüməsinin olmaması xəta deyil.
3. **Given** sahə dəyəri bazadakı uzunluq limitini aşır, **When** sorğu göndərilir, **Then**
   400 qaytarılır, xəta sahəni və icazə verilən maksimumu göstərir; bu gün 500 verən hal
   artıq 500 vermir.
4. **Given** sorğuda bir neçə səhv sahə var, **When** göndərilir, **Then** cavab **hamısını**
   bir dəfədə sadalayır (ilk səhvdə dayanmır).
5. **Given** rədd edilən sorğu, **When** audit jurnalına baxılır, **Then** heç bir qeyd yaranmayıb.
6. **Given** sorğu bütün qaydalara uyğundur, **When** göndərilir, **Then** davranış bu gün
   ilə eynidir.

---

### User Story 3 - Naməlum dil açarı qəbul olunmur (Priority: P2) — 8b

Tərcümələr dil kodu açarı ilə göndərilir. Bu gün `"ru"` və ya `"AZ"` kimi açar qəbul olunur
və ya DB-də FK xətası ilə 500 verir, ya da (qeyri-aktiv dil üçün) heç yerdə görünməyən
tərcümə yaradır. Bu spec-dən sonra yalnız sistemdə qeydiyyatda olan və aktiv dil kodları
qəbul olunur.

**Why this priority**: 500-ün başqa bir mənbəyini bağlayır və "görünməyən məzmun"
problemini əvvəlcədən kəsir. US2 ilə eyni çatdırılmadadır.

**Independent Test**: Tərcüməli resursa `ru` açarı ilə, böyük hərfli `AZ` ilə və qeyri-aktiv
edilmiş dil açarı ilə sorğu göndərilir; hər birinin 400 olduğu və xətanın açarı adlandırdığı
yoxlanılır.

**Acceptance Scenarios**:

1. **Given** `locales`-da yalnız `az` və `en` aktivdir, **When** `ru` açarlı tərcümə
   göndərilir, **Then** 400 qaytarılır, xəta naməlum locale-i adlandırır.
2. **Given** dil cədvəlinə yeni aktiv dil əlavə olunub, **When** həmin açarla tərcümə
   göndərilir, **Then** kod dəyişikliyi olmadan qəbul olunur — siyahı kodda sabit deyil.
3. **Given** açar `AZ` (böyük hərf) və ya boşluqludur, **When** göndərilir, **Then** 400 —
   açarlar dəqiq uyğunluqla yoxlanır.

---

### User Story 4 - Rəqəm, tarix və email kimi sahələr məntiqi qaydalarla yoxlanır (Priority: P3) — 8b

Məzənnə vərəqində sıfır və ya mənfi kurs, istifadəçi formasında `abc` kimi email bu gün
qəbul olunur. Məzənnə səhvi rəsmi məlumatın public saytda və tarixi XML feed-də səhv
dərc olunması deməkdir. Bu spec-dən sonra belə dəyərlər sahə səviyyəsində rədd edilir.

**Why this priority**: Ən böyük risk məzənnədədir, amma qayda sayı azdır; resurs-resurs
qaydaların təsdiqlənməsi vaxt aparır (bax Assumptions — qayda inventarı).

**Independent Test**: Məzənnə vərəqinə `0`, `-1.5` və müsbət kurslu sətir; istifadəçi
yaratma/redaktəsinə səhv və düzgün email göndərilir; səhvlərin 400, düzgünlərin uğurlu olduğu
yoxlanılır.

**Acceptance Scenarios**:

1. **Given** məzənnə vərəqi, **When** hər hansı sətirdə kurs `<= 0`-dır, **Then** 400
   qaytarılır, xəta həmin sətri (valyuta kodu ilə) göstərir və vərəqin heç bir sətri
   saxlanılmır.
2. **Given** istifadəçi yaratma və ya redaktəsi, **When** email düzgün formatda deyil,
   **Then** 400 qaytarılır və email sahəsi göstərilir.
3. **Given** mövcud yoxlamalar (məs. "ən azı bir tərcümə", "dublikat valyuta kodu",
   "naməlum valyuta kodu", "media tapılmadı"), **When** eyni səhv göndərilir, **Then** yenə
   400 qaytarılır, mənası dəyişmir, forması isə yeni validation cavabı ilə eynidir.

---

### Edge Cases

- **Rəqəm olmayan `page`/`pageSize`** (`pageSize=abc`): bu gün framework onu default-a
  çevirir və ya 400 verir; davranış dəyişməməlidir, amma heç bir halda 500 olmamalıdır.
- **`int` aşan dəyər** (`pageSize=99999999999`): 500 yox — ya 400, ya da maksimuma sıxılma.
- **Çox böyük `page`** (`page=2147483647`): ofset hesabı daşmamalı və 500 verməməlidir;
  boş səhifə qaytarılır.
- **Default ölçüsü maksimumdan böyük endpoint**: hazırda yoxdur (ən böyüyü 50); gələcəkdə
  əlavə olunarsa default da maksimuma tabe olur.
- **Səhifələnməyən list-lər** (bütün siyahını qaytaran lookup-lar, səhifə ağacı): bu spec
  onlara səhifələmə **əlavə etmir** — onların cavab forması panel tərəfindən gözlənilir.
- **Boşluqla əhatələnmiş başlıq** (`"  Xəbər  "`): boş sayılmır; trim edib saxlamaq bu
  spec-in işi deyil — dəyər olduğu kimi saxlanılır, yalnız "tam boşluq" boş sayılır.
- **Rich-text məzmun uzunluğu**: HTML məzmun sahələri (səhifə `Content`) limitsiz mətn
  sütunlarıdır; onlara süni uzunluq limiti qoyulmur (sanitize #9-un işidir).
- **Locale-in yarı yolda qeyri-aktiv edilməsi**: artıq mövcud tərcümələr toxunulmur; yalnız
  yeni yazılan tərcümələr yoxlanır. Mövcud qeyri-aktiv locale tərcüməsini olduğu kimi geri
  göndərən redaktə sorğusu — qayda bərabər tətbiq olunur (400), bu, planda təsdiqlənməlidir.
- **Validation ilə DB-nin uyğunsuzluğu**: kodda yazılan uzunluq limiti bazadakından böyük
  olarsa, DB xətası yenə mümkündür — #7 onu 400-ə çevirir; limitlər bazadan götürülür ki,
  belə hal olmasın.
- **Eyni anda iki unikal dəyər** (slug, username yarışı): bu validation-un işi deyil — #7
  (409 mapping) həll edir.

## Requirements *(mandatory)*

### Functional Requirements

**8a — səhifələmə**

- **FR-001**: Səhifələnmiş cavab qaytaran **bütün** admin list endpoint-ləri eyni səhifələmə
  qaydasına tabe olmalıdır. Bu gün 13 endpoint-dir: azir, currency-rates dates, galleries,
  info-lines, laws, meas-documents, media, money-marks (iki list), press-releases, users,
  videos, yield-curves. Gələcəkdə əlavə olunan list endpoint-i eyni qaydanı təkrar yazmadan
  istifadə etməlidir (qayda bir yerdə saxlanılır).
- **FR-002**: `pageSize` 1-dən kiçikdirsə, endpoint-in default ölçüsü tətbiq olunmalıdır;
  maksimumdan (100) böyükdürsə, maksimum tətbiq olunmalıdır. Sorğu rədd edilmir.
- **FR-003**: `page` 1-dən kiçikdirsə, 1 tətbiq olunmalıdır. Heç bir `page` dəyəri server
  xətası (500) verməməlidir.
- **FR-004**: Cavabdakı `page` və `pageSize` sorğuda göndərilən deyil, **tətbiq olunan**
  dəyərlər olmalıdır.
- **FR-005**: Parametrsiz sorğunun nəticəsi, endpoint-ə xas default ölçülər (20, 24, 50)
  və cavab forması (`items`, `total`, `page`, `pageSize`) dəyişməməlidir.

**8b — sorğu gövdəsinin yoxlanması**

- **FR-006**: Hər yaratma/redaktə sorğusu saxlanılmadan **əvvəl** yoxlanmalıdır; səhv sorğu
  bazaya heç bir yazı, audit qeydi və ya fayl əməliyyatı etməməlidir.
- **FR-007**: Göndərilən hər tərcümədə başlıq (və ya resursun əsas ad sahəsi) boş və yalnız
  boşluqdan ibarət olmamalıdır. Tərcümənin **göndərilməməsi** xəta deyil (ikidillilik
  modeli, Konstitusiya Maddə V.3); resursa xas "ən azı bir tərcümə" qaydaları qorunur.
- **FR-008**: Tərcümə açarları sistemdə qeydiyyatda olan və aktiv dil kodlarından biri
  olmalıdır; siyahı məlumat mənbəyindən oxunur, kodda sabit yazılmır.
- **FR-009**: Uzunluq limiti olan hər mətn sahəsinin limiti bazadakı sütun limiti ilə
  **eyni** olmalı və aşıldıqda sahə səviyyəsində xəta verilməlidir.
- **FR-010**: Məzənnə kursu 0-dan böyük olmalıdır; səhv sətir vərəqin tamamını rədd edir.
- **FR-011**: İstifadəçi email-i düzgün email formatında olmalıdır (yaratma və redaktədə).
- **FR-012**: Məcburi sahələr hər resurs üçün açıq inventar şəklində müəyyən edilməlidir
  (sahə → məcburidir/deyil → mənbə: sxemdə `NOT NULL`, mövcud biznes qaydası və ya
  `product-host` `rules()`); inventar planın bir hissəsidir və hər qayda təsdiqlənir.
- **FR-013**: Səhv sorğu 400 ilə qaytarılmalı və cavab **bütün** səhv sahələri ayrıca,
  sahə yolu (tərcümə sahələri üçün locale daxil, məs. `translations.az.title`; siyahı
  sətirləri üçün indeks və ya açar) və oxunaqlı mesajla sadalamalıdır.
- **FR-014**: Validation xətası cavabının forması #7-də qəbul olunan vahid xəta forması ilə
  eyni olmalıdır; mövcud panellərin oxuduğu ümumi `message` mətni cavabda qalmalıdır ki,
  panel dəyişiklik olmadan ən azı ümumi xəta mesajını göstərsin.
- **FR-015**: Controller-lərdəki mövcud əl ilə yoxlamalar (US4.3-də sadalananlar)
  ya yeni yoxlama qatına köçürülməli, ya da eyni cavab formasını qaytarmalıdır — iki fərqli
  400 forması qalmamalıdır.
- **FR-016**: Login sorğusu (`auth/login`) bu yoxlamanın əhatəsinə daxil edilərsə, cavab
  spec 011/012-nin müəyyən etdiyi davranışı (eyni mesaj, eyni vaxt profili, istifadəçi
  mövcudluğunu açmamaq) pozmamalıdır.
- **FR-017**: Endpoint kontraktında dəyişiklik (400 cavabı, sahə limitləri, `pageSize`
  maksimumu) əvvəlcə `openapi/` spec-ində əks olunmalıdır (spec-first qaydası).

### Key Entities

- **Səhifələmə parametrləri**: `page` (≥ 1) və `pageSize` (1..100, endpoint-ə xas default)
  — bütün list endpoint-ləri üçün ortaq anlayış; tətbiq olunan dəyərlər cavabda qayıdır.
- **Validation xətası**: sahə yolu → bir və ya bir neçə mesaj; ümumi `message` ilə birlikdə
  vahid xəta cavabının (#7) bir növüdür.
- **Qayda inventarı**: resurs → sahə → qayda (məcburi, maksimum uzunluq, format, aralıq) →
  mənbə; planın çıxışıdır və review-da sahə-sahə təsdiqlənir.
- **Dil (locale)**: mövcud `locales` qeydləri; aktiv olanlar tərcümə açarları üçün etibarlı
  dəyərlər siyahısıdır.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 13 list endpoint-inin heç biri bir sorğuda 100-dən çox qeyd qaytarmır;
  `pageSize=1000000` sorğusunun cavab müddəti və həcmi `pageSize=100` ilə eynidir.
- **SC-002**: `page`/`pageSize`-ın istənilən tam dəyəri (0, mənfi, maksimum tam ədəd) üçün
  13 endpoint-dən heç biri 500 qaytarmır.
- **SC-003**: Review-da sadalanan səhv giriş hallarının (boş başlıq, naməlum locale, uzun
  sahə, `<= 0` məzənnə, səhv email) hər biri üçün cavab 500 yox, 400-dür və səhv sahəni
  adlandırır — 5 haldan 5-i.
- **SC-004**: Bir neçə səhvi olan sorğu üçün redaktor bütün səhvləri **bir** cavabda görür
  (düzəlt–göndər–növbəti səhv dövrü olmur).
- **SC-005**: Admin panelin (`web-cbar-admin-new`) bütün list və forma ekranları düzgün
  məlumatla əvvəlki kimi işləyir — `npm run verify` yaşıldır və əl ilə yoxlamada reqressiya
  yoxdur.
- **SC-006**: Qayda inventarında hər tərcüməli resurs və hər yazma DTO-su üçün sətir var;
  təsdiqlənməmiş qayda qalmır.

## Assumptions

- **Maksimum `pageSize` = 100.** Panelin ən böyük ölçüsü 50-dir, 2× ehtiyat saxlanılır;
  ehtiyac olarsa sonradan artırmaq kontrakt dəyişikliyi deyil. Bütün endpoint-lər üçün
  eyni maksimum.
- **Clamp, rədd yox (8a).** Review "clamp" deyir; səhv `page`/`pageSize` 400 deyil, düzəldilmiş
  dəyərlə 200 verir. Bu, panelin və köhnə URL-lərin sınmamasını təmin edir.
- **8a #7-dən asılı deyil**, 8b isə #7-dən sonra icra olunur. #7 gecikərsə, 8b-nin xəta
  forması #7 üçün nəzərdə tutulan standart (RFC 7807 ProblemDetails, sahə xətaları ilə)
  olacaq və #7 onu yenidən istifadə edəcək — iki forma yaradılmayacaq.
- **Kitabxana seçimi planın işidir.** FluentValidation yeni runtime dependency-dir —
  Konstitusiyanın tələbinə görə seçilərsə planda əsaslandırılır; DataAnnotations əlavə
  dependency tələb etmir.
- **Məcburi sahələr inventarı** (FR-012) planda sxem (`NOT NULL`, `varchar(n)`), mövcud
  controller yoxlamaları və `product-host` `rules()` əsasında hazırlanır, sonra istifadəçi
  tərəfindən sahə-sahə təsdiqlənir — review-un "hər qayda yoxlanmalıdır" qeydi budur.
  `product-host`-un hər iki dili məcburi edən qaydaları **bərpa olunmur** (Maddə V.3).
- **Email formatı** praktik yoxlamadır (`ad@domen` forması), RFC-nin tam qrammatikası yox.
- **`api-cbar` əhatədən kənardır.** Public API-nin öz səhifələmə problemi varsa, ayrıca
  task-dır; bu review yalnız `api-cbar-admin`-i əhatə edir.
- **URL/HTML məzmunun yoxlanması** (#9), unikal dəyər yarışları və DB xətalarının mapping-i
  (#7), optimistic concurrency (#10) bu spec-in əhatəsindən kənardır.
- **Verification**: lokalda .NET SDK yoxdur — build GitLab pipeline-ında, yoxlama `test`
  mühitində endpoint-ləri əl ilə çağırmaqla aparılır (Konstitusiya Maddə VIII.1).
- **Deploy**: yalnız `api-cbar-admin`; deploy sırası dəyişmir, migration yoxdur.
