# Feature Specification: Ana səhifənin "Strategiya və sənədlər" bloku — admin paneldən idarə

**Feature Branch**: `057-homepage-strategy-docs`

**Created**: 2026-11-23

**Status**: Draft

**Input**: "hompagede Strategiya və sənədlər bu sectionun admin panelden idare edilmesini isteyirem hal hazirda o formada deyil. Bunu spec yazaraq
icra etmeyi planlayaq"; sonra: "… bu sehifelere getmelidir bu urlleere uygun yeni sayt ucun yaradaq eyni konseptde ihslesin bunun da speckite
elave edek" (üç köhnə ünvan, aşağıda).

Qərarlar (2026-11-23, istifadəçi):

1. **Ayrıca məzmun növü**: "Strategiya və sənədlər" sənədləri öz cədvəlində saxlanılır və admin paneldə "Ana səhifə" bölməsinin ayrıca tabı kimi
   redaktə olunur. Mövcud "Nəşrlər" bloku (`homepage-publications`) dəyişmir və bu bloka qarışmır.
2. **Keçid**: kart ya CMS səhifəsinə gedir (ünvan ziyarətçinin dilindəki slug-dan qurulur), ya da redaktorun hər dil üçün yazdığı ünvana.
3. **Kartlar**: saytda ən çox 3 sənəd göstərilir. Sırada birinci gələn böyük kartdır, qalan ikisi dar kartdır (Figma-dakı kimi).
4. **Üz qabığı hər dil üçün ayrıdır**, çünki Figma-dakı üz qabıqlarının mətni şəklin içinə yazılıb. Bir dildə üz qabığı yoxdursa digər dilinki
   göstərilir.

Agentin qəbul etdiyi defoltlar (istifadəçi düzəldə bilər):

5. Qısa mətn hər dil üçün istəyə bağlı sahədir. Yalnız dar kartlarda göstərilir, çünki Figma-da böyük kartda qısa mətn yoxdur.
6. Blokun başlığı ("Strategiya və sənədlər") və böyük kartın düyməsi ("Daha ətraflı") saytın interfeys mətnləridir, admin-dən dəyişmir.
7. Sənəd o dildə yalnız başlığı və işləyən keçidi varsa göstərilir. Bundan əlavə "aktiv" bayrağı və sıra var. Sıranı redaktor sürükləyərək
   dəyişir.
8. Köçürmə bugünkü üç sənədi CMS səhifələrinə bağlı yazır, üz qabığını yazmır. Üz qabıqlarını redaktor admin-dən yükləyir.

Qərarlar (2026-11-23, ikinci hissə, istifadəçi): kartlar köhnə saytın bu üç səhifəsinin yeni saytdakı qarşılığına aparmalıdır, yeni səhifələr
köhnələrin konseptində işləməlidir:

- `https://test.cbar.az/pages/strategy` (2024-2026-cı illərdə maliyyə sektorunun inkişaf Strategiyası);
- `https://test.cbar.az/page-872/risk-based-supervision-policy-concept-of-the-central-bank-of-the-republic-of-azerbaijan`;
- `https://test.cbar.az/page-878/strategic-framework-for-a-microfinance-model`.

9. **Strategiya səhifəsi = CMS səhifəsi 104**, kök bölmə kimi yerində qalır. Spec 056-nın header-i dəyişmir: 104 nav panelində, mobil menyuda və
   footer-dədir. 104-ün mətni köhnə `/pages/strategy`-nin məzmunu ilə əvəzlənir: sədrin portreti, müraciət, imza, PDF linki. Bu mətn indi alt səhifəsi
   105-in ("icra statusu") eyni akkordeonlarıdır. Başlıq və ünvan dəyişmir.
10. **Fayllar idxal aləti ilə yüklənir** (spec 054 işçi məqalələri kimi): portret və az/en PDF-lər köhnə saytdan endirilir, media kitabxanasına yazılır,
    sonra 104-ün az/en mətni qurulur. Əvvəl test mühitində, sonra prod-da işlədilir.
11. **Risk əsaslı nəzarət (66) və Mikromaliyyə (76)** köhnə 872 və 878-in qarşılığıdır. Məzmunları (giriş + PDF kartı) hazırdır, dəyişmir. Köhnə
    ünvanlar onlara yönləndirilir.

**Köhnə vəziyyət** (`product-host`, `web-cbar-new`, test API `api-cbar-test.cbar.az`, 2026-11-23):

- Köhnə saytın ana səhifəsində bu blok **yoxdur** (`product-host/visitor/views/home/index.php`). Blok Figma redizaynının yeni hissəsidir (spec 022
  FR-014). Köhnə saytda strategiya yalnız ayrıca səhifə idi (`PagesController::actionStrategy`). Onun yeni saytda qarşılığı yoxdur (aşağıda).
- Yeni saytda blok qurulub, amma məlumatı koddadır: `web-cbar-new/src/views/home/mock.ts` (`TODO(api)`). Orada üç sənəd var, iki üz qabığı
  `public/site/home/*.png` faylıdır, böyük kartın şəkli yoxdur. Redaktor bloku dəyişə bilmir.
- Mock-dakı üç sənəd test bazasında CMS səhifəsi kimi mövcuddur: 104 `maliyye-sektorunun-inkisaf-strategiyasi` /
  `financial-sector-development-strategy`, 66 `risk-esasli-nezaret-uzre-siyaset-konsepsiyasi` / `risk-based-supervision-policy-concept`, 76
  `mikromaliyye-modeli-uzre-strateji-cercive` / `strategic-framework-for-a-microfinance-model`.
- Admin paneldə "Ana səhifə → Ana səhifə blokları" bölməsi var: bannerlər, xəbər slayderi, qaçan sətirlər, linklər, nəşrlər və məlumat sətirləri
  tabları. "Strategiya və sənədlər" tabı yoxdur.
- **Köhnə `/pages/strategy`** CMS səhifəsi deyil, Yii2-də əl ilə yazılmış səhifədir (`PagesController::actionStrategy`,
  `views/pages/strategy.php`).
  - Tərkibi: sağa düzlənmiş 300 px portret (`/9183.png`, sədr), "Hörmətli maliyyə sektoru iştirakçıları," müraciəti (az/en), sağa düzlənmiş imza
    (Taleh Kazımov, 26 yanvar 2024) və "Strategiya sənədinin əhatəli icmalı …" cümləsindən sonra PDF düyməsi.
  - PDF-lər `/2024_2026_Azerbaijani.pdf` (36,6 MB) və `/2024_2026_English.pdf` (32,9 MB)-dir, saytın kökündədir, `uploads.cbar.az`-da yoxdur.
    Desktop-da PDF lightbox-da açılır, mobil cihazda birbaşa link kimi.
  - Dil `?language=en` ilədir.
- **Köhnə 872 və 878** adi CMS səhifələridir: başlıq və bir PDF yükləmə kartı. Yeni bazada qarşılıqları 66 və 76-dır: "Nəşrlər və tədqiqatlar →
  Nəşrlər, hesabatlar və sənədlər" altında giriş mətni və az/en PDF (`document-list` quruluşu, spec 054). Yeni saytda `page-872/*` və `page-878/*`
  üçün yönləndirmə yoxdur.
- **Yeni bazada 104** "Maliyyə sektorunun inkişaf Strategiyası" kök bölmədir (spec 056 `0042`: nav paneli, mobil menyu, footer). Mətni alt səhifəsi
  105 "2024-2026-cı illərdə … icra statusu"nun eyni il akkordeonlarıdır, yəni 105-in surətidir. Köhnə müraciətin yeni saytda qarşılığı yoxdur.

**Figma**: "cbar website (Copy)", "Main page": blok `813:25097` (desktop), tablet `831:4378`. Böyük kart: şəkil 240, başlıq, "Daha ətraflı"
düyməsi. Dar kartlar: üz qabığı 200×236, başlıq, qısa mətn. Admin üçün Figma kadrı yoxdur: panelin standart CRUD ekranlarıdır.

**Hədəf proyektlər** (Konstitusiya I.2, II.3):
- `api-cbar-admin`: cədvəllər, admin endpoint-ləri, köçürmə;
- `api-cbar`: oxuma;
- `web-cbar-admin-new`: yeni tab, strategiya mətninin redaktorda saxlanması;
- `web-cbar-new`: blok mock əvəzinə API-dən oxuyur, köhnə ünvanlar yönlənir;
- workspace aləti `tools/media-backfill`: strategiya səhifəsinin faylları və mətni.

Deploy sırası: api-cbar-admin → api-cbar → frontendlər → idxal aləti (test, sonra prod).

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Redaktor blokun sənədlərini admin paneldə idarə edir (Priority: P1)

Redaktor admin paneldə "Ana səhifə blokları"-nı açır və "Strategiya və sənədlər" tabına keçir. Siyahıda sənədlər saytdakı sıra ilə görünür. Redaktor
yeni sənəd yaradır: hər dil üçün başlıq, qısa mətn və üz qabığı daxil edir, keçid üçün CMS səhifəsi seçir (və ya ünvan yazır). Sonra sənədi
sürükləyərək birinci yerə gətirir. Növbəti açılışda saytın ana səhifəsi yeni sənədi böyük kartda göstərir.

**Why this priority**: İstifadəçinin əsas tələbi budur. Bugün bloku dəyişmək üçün koda toxunmaq və yenidən deploy etmək lazımdır.

**Independent Test**: Redaktor yeni sənəd yaradır, onu birinci yerə çəkir və üz qabığını yükləyir. Saytın `/az` ana səhifəsi yeni sənədi böyük
kartda, əvvəlki birincini isə dar kartda göstərir.

**Acceptance Scenarios**:

1. **Given** redaktor "Strategiya və sənədlər" tabındadır, **When** "Yeni" ilə az başlığı, az üz qabığı və CMS səhifəsi seçib yadda saxlayır,
   **Then** sənəd siyahıya düşür, saytın az ana səhifəsində kart görünür, kart seçilən səhifənin az ünvanına aparır.
2. **Given** siyahıda dörd aktiv sənəd var, **When** redaktor dördüncünü sürükləyir (və ya yuxarı düyməsi ilə) birinci yerə gətirir, **Then** sıra
   dərhal yadda saxlanılır, saytda o böyük kartdır, əvvəlki üçüncü isə saytdan düşür (ən çox 3 kart).
3. **Given** sənəd formasında nə səhifə seçilib, nə də heç bir dildə ünvan yazılıb, **When** redaktor yadda saxlamağa çalışır, **Then** forma
   keçidin vacib olduğunu deyir.
4. **Given** sənəd formasında heç bir dildə başlıq yoxdur, **When** redaktor yadda saxlamağa çalışır, **Then** forma başlığın vacib olduğunu deyir.
5. **Given** redaktor ünvan sahəsinə `www.cbar.az/x` yazır, **When** yadda saxlamağa çalışır, **Then** forma ünvanın `/` ilə (saytın daxili ünvanı)
   və ya `http://` / `https://` ilə başlamalı olduğunu deyir.
6. **Given** redaktor üz qabığı sahəsində media kitabxanasını açır, **When** fayllara baxır, **Then** yalnız şəkillər seçilə bilir, sənədlər
   (PDF və s.) seçilə bilmir.
7. **Given** redaktor sənədin "aktiv" bayrağını söndürür, **When** yadda saxlayır, **Then** sənəd saytdan düşür, admin siyahısında qalır, növbəti
   aktiv sənəd onun yerinə keçir.
8. **Given** forma dəyişdirilib və yadda saxlanılmayıb, **When** redaktor başqa tab-a keçmək istəyir, **Then** panel soruşur (bütün CRUD formaları
   kimi).
9. **Given** siyahıda üçdən çox aktiv sənəd var, **When** redaktor siyahıya baxır, **Then** panel saytda yalnız ilk üçünün göstərildiyini və
   birincinin böyük kart olduğunu deyir.

---

### User Story 2 — Ziyarətçi blokda redaktorun seçdiyi sənədləri görür (Priority: P1)

Ziyarətçi ana səhifəni (`/az` və ya `/en`) açır. "Strategiya və sənədlər" blokunda redaktorun sıraladığı ilk üç sənəd görünür: birincisi şəkilli
böyük kart və "Daha ətraflı" düyməsi ilə, digər ikisi üz qabıqlı dar kart və qısa mətnlə. Karta və ya düyməyə klik sənədin səhifəsini açır.

**Why this priority**: Admin dəyişikliyi saytda görünmürsə, birinci hekayənin dəyəri yoxdur. Blokun görünüşü bugünkü kimi qalmalıdır.

**Independent Test**: Köçürülmüş məlumatla ana səhifə üç enlikdə (1728, 744, 390) açılır. Blok bugünkü düzülüşlə görünür, kartlar CMS
səhifələrinə aparır. en ana səhifəsi en başlıqları və en ünvanları göstərir.

**Acceptance Scenarios**:

1. **Given** üç aktiv sənəd var, **When** ziyarətçi desktop-da `/az` açır, **Then** blok bir böyük və iki dar kartı Figma düzülüşü ilə (spec 022)
   göstərir, Təqvim bloku yanındadır.
2. **Given** sənəd CMS səhifəsinə bağlıdır, **When** ziyarətçi `/en`-də karta klik edir, **Then** həmin səhifənin en ünvanı açılır
   (`/en/<en slug>`).
3. **Given** sənədin həmin dil üçün ayrıca ünvanı var, **When** ziyarətçi karta klik edir, **Then** o ünvan açılır. Xarici ünvan yeni vərəqdə,
   saytın daxili ünvanı eyni vərəqdə açılır.
4. **Given** sənədin en üz qabığı yoxdur, az üz qabığı var, **When** ziyarətçi `/en` açır, **Then** kartda az üz qabığı göstərilir.
5. **Given** sənədin heç bir üz qabığı yoxdur, **When** ziyarətçi ana səhifəni açır, **Then** kartda bugünkü yer tutucu fon görünür.
6. **Given** dar kartın qısa mətni var, **When** ziyarətçi ana səhifəni açır, **Then** mətn başlığın altında ən çox 5 sətir görünür. Böyük kartda
   qısa mətn göstərilmir.

---

### User Story 3 — Bugünkü üç sənəd avtomatik köçürülür (Priority: P2)

Bölmə deploy olunanda blok boş qalmır. Kodda olan üç sənəd (Maliyyə sektorunun inkişaf Strategiyası, Risk əsaslı nəzarət üzrə Siyasət
Konsepsiyası, Mikromaliyyə Modeli üzrə Strateji Çərçivə) az və en başlıqları ilə, öz CMS səhifələrinə bağlı yazılır. Redaktor yalnız üz
qabıqlarını yükləyir.

**Why this priority**: Köçürmə olmasa, deploy günü ana səhifədə blok itir, redaktor isə üç sənədi iki dildə əllə yaratmalı olur. Amma bu iş əl ilə
də bir neçə dəqiqəlikdir, ona görə P2-dir.

**Independent Test**: Sənəd cədvəli boş olan bazada API işə düşür. Admin tabında üç sənəd görünür, sayt blokunu üz qabığı olmadan (yer tutucu ilə)
göstərir.

**Acceptance Scenarios**:

1. **Given** cədvəl boşdur və üç CMS səhifəsi az slug-ları ilə tapılır, **When** köçürmə işləyir, **Then** üç sənəd bugünkü sıra və başlıqlarla
   (az və en), həmin səhifələrə bağlı, aktiv yaranır.
2. **Given** köçürmə artıq işləyib və ya redaktor sənəd əlavə edib, **When** API yenidən başlayır, **Then** heç nə təkrarlanmır və dəyişmir.
3. **Given** başqa mühitdə səhifələrdən biri tapılmır, **When** köçürmə işləyir, **Then** yalnız tapılan səhifələrin sənədləri yazılır, xəta yoxdur.
4. **Given** köçürmə, **When** işləyir, **Then** CMS səhifələrinin özünə (mətn, başlıq, menyu) toxunulmur.

---

### User Story 4 — Kartlar köhnə saytın üç səhifəsinin yeni qarşılığına aparır, köhnə ünvanlar işləyir (Priority: P2)

Ziyarətçi ana səhifədə "2024-2026-cı illərdə maliyyə sektorunun inkişaf Strategiyası" kartına klik edir. Köhnə `/pages/strategy` kimi bir səhifə
açılır: sədrin portreti, "Hörmətli maliyyə sektoru iştirakçıları," müraciəti, imza və Strategiya sənədinin PDF-i. İngiliscə saytda eyni səhifə
ingiliscə mətn və en PDF ilə açılır. Digər iki kart risk əsaslı nəzarət konsepsiyasının və mikromaliyyə çərçivəsinin səhifələrinə (giriş + PDF)
aparır. Köhnə saytın bu üç ünvanı ilə gələn ziyarətçi həmin yeni səhifələrə yönləndirilir.

**Why this priority**: kartlar indi də CMS səhifələrinə aparır, amma strategiya kartı müraciəti və PDF-i olmayan bir səhifəyə gedir (105-in surəti).
Köhnə saytın müraciət səhifəsinin yeni saytda qarşılığı yoxdur. Köhnə ünvanlar isə xaricdən (xəbərlər, sosial şəbəkələr) linklənir. Blokun idarəsi (US1,
US2) bundan asılı deyil, ona görə P2-dir.

**Independent Test**: idxal aləti test mühitində işləyir. `/az/maliyye-sektorunun-inkisaf-strategiyasi` portreti, müraciəti, imzanı və PDF linkini
göstərir, PDF açılır. `/en/financial-sector-development-strategy` ingiliscə eynisini göstərir. Köhnə üç ünvan (`/pages/strategy`,
`/pages/strategy?language=en`, `/page-872/…`, `/page-878/…`) 308 ilə yeni səhifələrə gedir.

**Acceptance Scenarios**:

1. **Given** idxal aləti işləyib, **When** ziyarətçi strategiya kartına klik edir, **Then** 104 səhifəsi açılır:
   - sağda portret, sonra "Hörmətli maliyyə sektoru iştirakçıları," başlığı və müraciət mətni (qalın sektor adları ilə);
   - sağa düzlənmiş imza ("Hörmətlə, Taleh Kazımov, Azərbaycan Respublikası Mərkəzi Bankının sədri, 26 yanvar 2024-cü il");
   - "Strategiya sənədinin əhatəli icmalı …" cümləsi və PDF linki.
2. **Given** 104 səhifəsi açılıb, **When** ziyarətçi PDF linkinə klik edir, **Then** həmin dilin PDF-i (az: 36,6 MB, en: 32,9 MB) brauzerdə açılır.
3. **Given** 104 səhifəsi açılıb, **When** ziyarətçi sol menyuya baxır, **Then** "2024-2026-cı illərdə … icra statusu" (105) orada qalır və öz il
   akkordeonlarını göstərir.
4. **Given** header, mobil menyu və footer, **When** idxaldan sonra açılır, **Then** "Maliyyə sektorunun inkişaf Strategiyası" spec 056-dakı yerində və
   adındadır.
5. **Given** ziyarətçi köhnə `/pages/strategy` (və ya `/en/pages/strategy`, `?language=en`) ünvanını açır, **When** sayt cavab verir, **Then** daimi
   yönləndirmə ilə həmin dilin 104 səhifəsinə gedir.
6. **Given** ziyarətçi köhnə `/page-872/<istənilən slug>` və ya `/page-878/<istənilən slug>` ünvanını açır, **When** sayt cavab verir, **Then** daimi
   yönləndirmə ilə həmin dilin 66 və ya 76 səhifəsinə gedir.
7. **Given** ziyarətçi köhnə PDF ünvanını (`/2024_2026_Azerbaijani.pdf`, `/2024_2026_English.pdf`) açır, **When** sayt cavab verir, **Then** daimi
   yönləndirmə ilə həmin dilin 104 səhifəsinə gedir.
8. **Given** idxal aləti bir dəfə işləyib, **When** yenidən işlədilir, **Then** faylları təkrar yükləmir və mətni təkrar yazmır.
9. **Given** redaktor 104-ün mətnini artıq dəyişib (mətn 105-in surəti deyil), **When** idxal aləti işləyir, **Then** mətnə toxunmur və bunu hesabatda
   deyir.
10. **Given** redaktor 104-ü admin-də açıb heç nə dəyişmədən yadda saxlayır, **When** sayt açılır, **Then** portretin eni, imzanın düzlənməsi və PDF
    linki itmir.

---

### Edge Cases

- Aktiv sənəd yoxdur, ya da heç biri ziyarətçinin dilində göstərilə bilmir: blok səhifədən düşür, Təqvim bloku sırada tək qalır (bugünkü
  davranış).
- API cavab vermir və ya xəta qaytarır: blok səhifədən düşür, ana səhifənin qalan blokları işləyir.
- Yalnız bir sənəd göstərilir: o böyük kartdır, dar kart yoxdur. İki sənəd göstərilirsə bir böyük və bir dar kart olur.
- Sənədin az başlığı var, en başlığı yoxdur: en saytında sənəd göstərilmir. Növbəti sənəd onun yerinə keçir, yəni en və az bloklarında fərqli
  sənədlər ola bilər.
- Bağlı CMS səhifəsi silinib, gizlədilib, dərcdən çıxarılıb və ya ziyarətçinin dilində slug-u yoxdur: həmin dil üçün ayrıca ünvan varsa o
  işlədilir, yoxdursa sənəd o dildə göstərilmir. Admin siyahısında sənəd qalır və keçidinin işləmədiyi görünür.
- Seçilmiş üz qabığı media kitabxanasından silinib: kart digər dilin üz qabığını, o da yoxdursa yer tutucunu göstərir.
- Çox uzun başlıq: kartda sətrə keçir, kartlar sıxılmır, desktop sırası (424 + 200 + 200) pozulmur.
- Ünvan sahəsinə `javascript:` və ya başqa təhlükəli sxem yazılır: forma qəbul etmir, API də rədd edir.
- Sıra dəyişərkən bağlantı kəsilir: panel xəta göstərir, siyahı serverdəki sıraya qayıdır.
- İdxal aləti işləməyib (və ya prod-da hələ işlədilməyib): 104 bugünkü mətni (icra statusu akkordeonları) ilə qalır, kart yenə ora aparır. Səhifə boş
  deyil, sadəcə müraciət yoxdur.
- Köhnə saytdan fayl endirilə bilmir (şəbəkə, 404): alət heç nə yazmır, xətanı deyir. Yarımçıq vəziyyət olmur (fayl var, mətn yoxdur).
- Eyni PDF artıq media kitabxanasındadır (redaktor yükləyib): alət o media sətrini işlədir, ikinci nüsxə yaratmır (SHA-256).
- Dar ekranda (390) portret tam enə yayılır, mətn onun altından axır (köhnə saytın mobil qaydası). Səhifə yana sürüşmür.
- Köhnə ünvanın slug hissəsi səhv yazılıb və ya yoxdur (`/page-872`, `/page-872/x`): yenə həmin səhifəyə yönlənir.

## Requirements *(mandatory)*

### Functional Requirements

**Məlumat**

- **FR-001**: Sistem "Strategiya və sənədlər" sənədlərini sıralı siyahı kimi saxlamalıdır. Hər sənəd üçün hər dildə başlıq (vacib), qısa mətn
  (istəyə bağlı), üz qabığı (media kitabxanasından şəkil, istəyə bağlı) və ünvan (istəyə bağlı) saxlanılır. Dildən asılı olmayaraq bağlı CMS
  səhifəsi (istəyə bağlı), sıra və aktivlik saxlanılır. Kim və nə vaxt dəyişdiyi də qeyd olunur.
- **FR-002**: Sənədin heç olmasa bir dildə başlığı olmalıdır. Keçid üçün də ya CMS səhifəsi, ya da ən azı bir dildə ünvan olmalıdır.
- **FR-003**: Ünvan ya saytın daxili ünvanıdır (`/` ilə başlayır), ya da `http://` / `https://` ilə başlayan xarici ünvandır. Başqa sxemlər qəbul
  edilmir. Başlıq və qısa mətnin uzunluğu məhduddur (plan mərhələsində Figma kartına görə seçilir).
- **FR-004**: Üz qabığı yalnız şəkil ola bilər. Seçilən media faylı və CMS səhifəsi mövcud olmalıdır.

**Admin paneli**

- **FR-005**: "Ana səhifə blokları" bölməsində mövcud tabların yanında "Strategiya və sənədlər" tabı olmalıdır. Tabda siyahı, yaratma, redaktə,
  silmə və aktivliyin dəyişməsi var. Sıra sürükləmə və yuxarı/aşağı düymələri ilə dəyişir, hər hərəkət dərhal yadda saxlanılır.
- **FR-006**: Formada dildən asılı sahələr (başlıq, qısa mətn, üz qabığı, ünvan) az/en tablarındadır. CMS səhifəsi səhifə seçicisi ilə seçilir və
  hər iki dil üçün ortaqdır.
- **FR-007**: Siyahı hər sənədin başlığını, keçidini (səhifə adı və ya ünvan), aktivliyini və sırasını göstərir. Panel saytda yalnız ilk üç aktiv
  sənədin göründüyünü və birincinin böyük kart olduğunu deyir.
- **FR-008**: Hər yazma əməliyyatı audit jurnalına düşür. Yadda saxlanılmamış dəyişikliklə forma tərk edilərkən panel soruşur. Server xətaları
  müvafiq sahənin altında, o sahənin dil tabında göstərilir.
- **FR-009**: Bölməyə giriş və dəyişiklik icazəsi ana səhifənin digər bloklarının icazə qaydası ilə eynidir: ayrıca oxuma, yaratma, redaktə və
  silmə icazələri var, onlar mövcud rollara digər ana səhifə blokları kimi verilir.

**Saytda göstərmə**

- **FR-010**: Sayt bloku koddakı məlumatdan deyil, bu sənədlərdən qurur. Kodda saxlanılan sənəd siyahısı və onun üz qabığı faylları silinir.
- **FR-011**: Sayt yalnız aktiv, ziyarətçinin dilində başlığı olan və keçidi işləyən sənədləri göstərir. Keçid belə tapılır: əvvəl həmin dilin
  ünvanı, yoxdursa bağlı CMS səhifəsinin həmin dildəki ünvanı. CMS səhifəsi yalnız saytda görünə bilirsə keçid sayılır (dərc olunub, silinməyib,
  həmin dildə göstərilir).
- **FR-012**: Göstərilən sənədlərdən ilk üçü redaktorun sırası ilə götürülür. Birincisi böyük kartdır (şəkil, başlıq, "Daha ətraflı" düyməsi),
  qalanları dar kartlardır (üz qabığı, başlıq, qısa mətn).
- **FR-013**: Üz qabığı ziyarətçinin dilindən götürülür. Yoxdursa digər dilinki, o da yoxdursa bugünkü yer tutucu göstərilir.
- **FR-014**: Blokun görünüşü (desktop, tablet, mobil düzülüş, Təqvim ilə yan-yana sıra, sürüşdürmədə görünmə) spec 022 və spec 049-dakı kimi
  qalır. Blokun başlığı və düymə mətni az/en interfeys mətnləridir.
- **FR-015**: Xarici ünvan yeni vərəqdə təhlükəsiz şəkildə açılır, saytın daxili ünvanı eyni vərəqdə açılır.
- **FR-016**: Məlumat olmayanda və ya alına bilməyəndə blok səhifədən düşür, ana səhifənin qalan bloklarına təsir etmir. Ana səhifə əlavə gözləmə
  olmadan açılır.
- **FR-017**: Admin-də edilən dəyişiklik saytın növbəti açılışında görünür.

**Köçürmə**

- **FR-018**: Deploy zamanı birdəfəlik köçürmə, sənəd cədvəli boşdursa, bugünkü üç sənədi bugünkü sıra və az/en başlıqları ilə yazır. Hər sənəd öz
  CMS səhifəsinə bağlanır, səhifə az slug-una görə tapılır (id-lər mühitlərdə fərqli ola bilər). Üz qabığı və qısa mətn yazılmır.
- **FR-019**: Köçürmə cədvəldə sətir varsa heç nə etmir, təkrar işlədikdə heç nəyi dəyişmir. Tapılmayan səhifənin sənədini yazmır, xəta vermir.
  CMS səhifələrinə toxunmur.

**Strategiya səhifəsi və köhnə ünvanlar (US4)**

- **FR-021**: CMS səhifəsi 104-ün az və en mətni köhnə `/pages/strategy`-nin həmin dildəki məzmununu saxlayır:
  - portret, sağda, ~300 px enində;
  - müraciət başlığı və mətn, köhnə qalın vurğularla;
  - sağa düzlənmiş imza;
  - "Strategiya sənədinin əhatəli icmalı …" cümləsi;
  - həmin dilin PDF-inə link, media kitabxanasındakı fayla.

  Səhifənin başlığı, ünvanı, ağacdakı yeri və menyu bayraqları dəyişmir.
- **FR-022**: Strategiya mətni panelin redaktorunun saxladığı formadadır: redaktor səhifəni açıb saxlayanda portretin eni, imzanın düzlənməsi və PDF linki
  dəyişmir.
- **FR-023**: Portret və iki PDF birdəfəlik idxal aləti ilə köhnə saytdan (test mühiti üçün `test.cbar.az`, prod üçün `www.cbar.az`) media
  kitabxanasına yazılır. Sonra eyni alət 104-ün iki mətnini qurur. Alət:
  - əvvəl planı göstərir, yalnız açıq əmrlə yazır;
  - eyni faylı ikinci dəfə yükləmir (SHA-256);
  - mətni yalnız 104-ün o dildəki mətni 105-in eyni dildəki mətninin surətidirsə yazır, redaktorun işini əzmir;
  - fayl endirilməsə heç nə yazmır;
  - 105-ə və başqa səhifələrə toxunmur.
- **FR-024**: Sayt köhnə ünvanları həmin dilin yeni səhifəsinə daimi yönləndirir:
  - `/pages/strategy` → 104;
  - `/page-872/*` → 66;
  - `/page-878/*` → 76;
  - `/2024_2026_Azerbaijani.pdf` → az 104, `/2024_2026_English.pdf` → en 104.

  Dil köhnə saytın qaydası ilədir: `?language=`, sonra yol prefiksi, sonra `az`.
- **FR-025**: Köçürmə (FR-018) kartları bu səhifələrə bağlayır: strategiya kartı 104-ə, digər iki kart 66 və 76-ya. Bu FR-018-in səhifə seçimidir,
  dəyişməz qalır.

**Sənədlər**

- **FR-020**: Bu sənədlər eyni dəyişiklikdə yenilənir: redaktor təlimatı (`dokumentasiyalar/ana-sehife-bloklari-guide.md`), root `CLAUDE.md`,
  `business_logic/` sənədləri və hər iki API-nin OpenAPI spec-i. Təlimatda üz qabığının ölçüləri yazılır, Figma-dan export olunmuş iki üz qabığının
  harada olduğu da göstərilir. Strategiya səhifəsinin mətninin haradan gəldiyi və redaktorun onu necə dəyişəcəyi də yazılır. İdxal alətinin
  test/prod işlədilməsi alətin README-sindədir.

### Key Entities

- **Strategiya sənədi**: ana səhifə blokunun bir kartı. Sıra, aktivlik və istəyə bağlı CMS səhifəsi saxlayır. Hər dil üçün tərcüməsi var.
- **Strategiya sənədinin tərcüməsi**: bir dil üçün başlıq, qısa mətn, üz qabığı (media faylı) və ünvan.
- **CMS səhifəsi**: istəyə bağlı keçid hədəfi. Ünvan ziyarətçinin dilindəki slug-dan qurulur. Səhifənin görünürlüğü sənədin göstərilməsini
  müəyyən edir (FR-011).
- **Media faylı**: hər dil üçün üz qabığı şəkli.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Redaktor blokdakı sənədi 2 dəqiqədən az vaxtda dəyişir (yeni sənəd yaradıb birinci yerə gətirir və ya üz qabığını əvəz edir), bunun
  üçün koda toxunmaq və ya deploy etmək lazım deyil.
- **SC-002**: Admin-də edilən dəyişiklik (yeni sənəd, sıra, aktivlik, üz qabığı) ana səhifənin növbəti açılışında 100% hallarda görünür.
- **SC-003**: Köçürmədən sonra ana səhifə bloku hər iki dildə bugünkü üç sənədi bugünkü başlıq və keçidlərlə göstərir. İtən sənəd yoxdur.
- **SC-004**: Blokun görünüşü üç Figma enliyində (1728, 744, 390) bugünkü vəziyyətdən 2 px-dən çox fərqlənmir və səhifə heç bir enlikdə yana
  sürüşmür.
- **SC-005**: Ziyarətçi işləməyən keçidli karta rast gəlmir: göstərilən hər kart açılan səhifəyə aparır.
- **SC-006**: Redaktorun səhvi (başlıqsız və ya keçidsiz sənəd, yanlış ünvan, şəkil olmayan üz qabığı) yadda saxlanılmır.
- **SC-007**: Köhnə saytın strategiya müraciətindəki hər abzas, imza və PDF yeni saytın 104 səhifəsində hər iki dildə var: itən abzas 0, PDF hər iki
  dildə açılır.
- **SC-008**: Köhnə saytın 5 ünvanının hamısı (`/pages/strategy`, `page-872/*`, `page-878/*`, iki PDF) hər iki dildə tək yönləndirmə ilə işləyən
  səhifəyə gedir: 404 sayı 0.

## Assumptions

- Ana səhifədə bir "Strategiya və sənədlər" bloku var. Başqa ana səhifə bloklarının (Nəşrlər, faydalı linklər) yenidən açılması bu spec-in
  əhatəsində deyil.
- Kartların sayı (3) saytın qaydasıdır, admin-dən dəyişmir. Dördüncü kart desktop sırasına (872 px) sığmır.
- Blokun ayrıca "hamısına bax" səhifəsi və ya ünvanı yoxdur. Figma-da da yoxdur.
- Üz qabıqları mühitlərdə fərqli media id-si alır, ona görə köçürmə onları yazmır. Redaktor iki mövcud üz qabığını (Figma `813:25108`, `813:25178`)
  admin-dən yükləyir. Böyük kartın şəkli Figma-dan hələ export olunmayıb, onu dizayn komandası verir.
- Köçürmənin en başlıqları bugünkü kodda olan başlıqlardır. Redaktor sonra dəyişə bilər.
- Sayt sənədləri ana səhifənin artıq aldığı ümumi məlumatla birlikdə almalıdır, əlavə gözləmə olmamalıdır. Bunun necə ediləcəyini (mövcud ana
  səhifə cavabına əlavə və ya ayrıca sorğu) plan seçir. Mövcud cavab geriyə uyğun qalır (Konstitusiya VII.3).
- Bölmə redaktor işarələməsindən qurulmadığı üçün yeni `AboutLayoutKind` və layout fikstürü lazım deyil.
- Frontend işləri spec-lərin məcburi skill qapısından keçir (senior-front, frontendpatterns, frontend-standards, ui-kit-usage) və spec 032 sabitlər
  standartına tabedir.
- Endpoint dəyişiklikləri spec-first-dir: əvvəl OpenAPI, sonra controller (`/api-endpoint`).
- Dəyişiklik dörd komponentə toxunur. Deploy sırası: api-cbar-admin → api-cbar → web-cbar-admin-new və web-cbar-new.
- İdxal aləti PostgreSQL-ə yazma və MinIO giriş məlumatları ilə işləyir (`tools/media-backfill/.env`, Vault-dan). Bu, spec 054 işçi məqalələrinin
  idxalı kimidir. Prod-da işlədilməsi ayrıca addımdır və prod giriş məlumatları tələb edir.
- Köhnə saytın PDF lightbox-u (desktop-da iframe) yeni saytda yoxdur: PDF brauzerin öz görüntüləyicisində açılır. Bu, saytın digər PDF-ləri kimidir.
- Köhnə müraciətin mətni dəyişdirilmədən köçürülür (Konstitusiya I.1). Sədr və tarix köhnə səhifədəki kimidir. Yeniləmə redaktorun işidir.
- 66 və 76-nın mətni və faylları test bazasında hazırdır (2026-11-23-də yoxlanılıb), bu spec onlara toxunmur.

## Paritet cədvəli (Konstitusiya I.3)

| Köhnə sayt | Yeni qarşılıq | Status |
|---|---|---|
| Ana səhifədə "Strategiya və sənədlər" bloku | — | Köhnə saytda yoxdur. Figma-nın yeni blokudur (spec 022) |
| Strategiya səhifəsi `/pages/strategy` (`PagesController::actionStrategy`: portret, müraciət, imza, PDF) | CMS səhifəsi 104-ün mətni (az/en), kart ona aparır | Köçürülür (idxal aləti) |
| `/pages/strategy`, `?language=en` | `/{locale}/maliyye-sektorunun-inkisaf-strategiyasi` / `financial-sector-development-strategy`-ə 308 | Yönləndirilir |
| `/2024_2026_Azerbaijani.pdf`, `/2024_2026_English.pdf` | Media kitabxanasında fayl. Köhnə ünvan 104-ə 308 | Köçürülür + yönləndirilir |
| PDF lightbox (desktop iframe) | Brauzerin PDF görüntüləyicisi | Ləğv edilir (bütün sayt kimi) |
| `page-872/*` (risk əsaslı nəzarət konsepsiyası) | CMS səhifəsi 66-ya 308 | Yönləndirilir (məzmun hazırdır) |
| `page-878/*` (mikromaliyyə strateji çərçivəsi) | CMS səhifəsi 76-ya 308 | Yönləndirilir (məzmun hazırdır) |
| Blokun kodda olan üç sənədi (`views/home/mock.ts`) | Admin-dən idarə olunan sənədlər | Köçürülür, mock silinir |
