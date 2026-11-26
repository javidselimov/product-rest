# Feature Specification: Header naviqasiyası — "Maliyyə sabitliyi" bölməsi və Figma-dakı hamburger paneli

**Feature Branch**: `056-header-financial-stability-nav`

**Created**: 2026-11-23

**Status**: Implemented (2026-11-23; deploy və test mühitində yoxlama qalır)

**Input**: "Naviqasiya menyusunda Figma-da klik etdiyim yerdə Maliyyə sabitliyi menyusu olmalıdır, hal-hazırda yoxdur. Hamburger
menyuda lazım olmayan hissələr görünməz olmalıdır, bunu Figma ilə hal-hazırda olduğum səhifədən götürə bilərsən. Dayanıqlı maliyyə
məncə indi yenilənib Maliyyə Sabitliyi olub, bunu nəzərində saxla." Figma: nav zolağı `I813:25657;9:29`, "menu - hamburger"
`1088:26873`.

Qərarlar (2026-11-23):

1. "Maliyyə sabitliyi" **yeni kök bölmədir**, "Dayanıqlı Maliyyə"nin adı dəyişmir. "Dayanıqlı Maliyyə" bütün alt ağacı ilə onun
   altına köçür. "Maliyyə sabitliyi hesabatı" və "Bank sektoru üzrə makroprudensial siyasət çərçivəsi" də "Nəşrlər və
   tədqiqatlar"dan ora köçür. Səbəb: maliyyə sabitliyi (financial stability) ilə dayanıqlı maliyyə (sustainable finance) fərqli
   mövzulardır və köhnə saytda "Maliyyə sabitliyi" bölməsi heç olmayıb.
2. "Rəqəmsal maliyyə ekosistemi" yeni kök bölmə kimi **8 boş alt səhifə ilə** yaradılır. Səhifələri redaktor doldurur.
3. Hamburger panelindən çıxarma **admin bayrağı ilədir**: mövcud "Menyudakı yeri" seçimi kök bölmələrdə də işləyir. Kodda sabit
   siyahı yoxdur.
4. Bayraqla çıxarılan kök bölmə **yalnız geniş masaüstü hamburger panelindən** (≥1360px) çıxır, spec 042 kimi. Planşet paneli,
   mobil çekmecə və footer dəyişmir.

**Hazırkı vəziyyət** (test API ağacı və kod, 2026-11-23):

- Nav zolağı ağacın ilk 8 kök bölməsidir: Haqqımızda, Pul siyasəti, Bazar iştirakçıları, Hüquqi aktlar, Ödəniş sistemləri, Milli
  pul nişanları, Statistika, Nəşrlər və tədqiqatlar. Figma-da 9 bölmə var, 3-cü "Maliyyə sabitliyi"dir. CMS-də belə bölmə yoxdur.
- Figma-da "Maliyyə sabitliyi"nin açılan menyusu çəkilməyib (Haqqımızda, Pul siyasəti, Milli pul nişanları, Bazar iştirakçıları,
  Statistika, Nəşrlər üçün çəkilib).
- ≥1360px hamburger paneli bunları göstərir: İstehlakçıların və investorların hüquqları, Maliyyə sektorunun inkişaf Strategiyası,
  Maliyyə savadlılığı, Dayanıqlı Maliyyə, Beynəlxalq əməkdaşlıq, Məlumatların yayımlanması qrafiki, Sual-cavab, İstinadlar, FinCERT,
  Naxçıvan MR İdarəsi. Media və İnsan resursları spec 042 ilə artıq yoxdur.
- Figma hamburger paneli (`1088:26873`) yalnız bunları göstərir: İstehlakçıların və investorların hüquqları, Rəqəmsal maliyyə
  ekosistemi, Beynəlxalq əməkdaşlıq, Maliyyə savadlılığı, FinCERT, Naxçıvan MR İdarəsi. Media və Sual-cavab Figma-da gizli
  qatdadır.
- "Menyudakı yeri" (spec 041/048/054) bu gün yalnız kökdən aşağıdakı səhifələrə təsir edir. Kök bölmə heç bir menyudan çıxmır.
- Footer-in sabit siyahısında (spec 022) "Maliyyə sabitliyi" / "Financial stability" artıq var. Bölmə CMS-də yarananda footer-də
  özü görünəcək.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Nav zolağında "Maliyyə sabitliyi" (Priority: P1)

Ziyarətçi masaüstündə saytı açır. Nav zolağında Figma-dakı kimi 9 bölmə var: Haqqımızda, Pul siyasəti, **Maliyyə sabitliyi**,
Bazar iştirakçıları, Hüquqi aktlar, Ödəniş sistemləri, Milli pul nişanları, Statistika, Nəşrlər və tədqiqatlar. "Maliyyə
sabitliyi"nin üzərinə gələndə açılan menyuda "Maliyyə sabitliyi hesabatı", "Bank sektoru üzrə makroprudensial siyasət çərçivəsi"
və "Dayanıqlı Maliyyə" (öz alt səhifələri ilə) görünür.

**Why this priority**: Tələbin əsas hissəsidir. Bu olmadan nav zolağı Figma-dan fərqlidir.

**Independent Test**: 1440px endə saytı açıb nav zolağındakı bölmələrin adını və sırasını Figma `I813:25657;9:29` ilə
tutuşdurmaq; "Maliyyə sabitliyi"nin menyusunu açıb keçidləri yoxlamaq.

**Acceptance Scenarios**:

1. **Given** seed tətbiq olunub, **When** 1440px endə sayt açılır, **Then** nav zolağında Figma-dakı 9 bölmə Figma sırası ilə görünür.
2. **Given** ziyarətçi "Maliyyə sabitliyi"nin üzərinə gəlir və ya klaviatura ilə ona keçir, **When** açılan menyu açılır, **Then** onda üç bənd var və "Dayanıqlı Maliyyə"nin altında onun alt səhifələri görünür.
3. **Given** ziyarətçi "Dayanıqlı Maliyyə" səhifəsini köhnə ünvanı ilə açır, **When** səhifə yüklənir, **Then** səhifə açılır, sol menyunun başlığı "Maliyyə sabitliyi"dir (bu bölmələr ümumi şablondadır, breadcrumb yoxdur).
4. **Given** sayt ingiliscədir (`/en`), **When** nav zolağı göstərilir, **Then** 3-cü bölmə "Financial stability"dir və eyni üç bənd en adları ilə görünür.
5. **Given** "Maliyyə sabitliyi hesabatı" əvvəl "Nəşrlər və tədqiqatlar"da idi, **When** onun köhnə ünvanı açılır, **Then** səhifə açılır, sol menyusu yeni bölmənindir.
6. **Given** footer göstərilir, **When** ziyarətçi footer-ə baxır, **Then** "Maliyyə sabitliyi" footer-də Figma-dakı yerindədir.

---

### User Story 2 - Hamburger paneli Figma-dakı kimidir (Priority: P1)

Ziyarətçi 1360px və daha geniş ekranda hamburger düyməsini açır. Paneldə yalnız Figma-dakı bölmələr Figma sırası ilə görünür:
İstehlakçıların və investorların hüquqları, Rəqəmsal maliyyə ekosistemi, Beynəlxalq əməkdaşlıq, Maliyyə savadlılığı, FinCERT,
Naxçıvan MR İdarəsi. Maliyyə sektorunun inkişaf Strategiyası, Məlumatların yayımlanması qrafiki, Sual-cavab və İstinadlar
paneldə yoxdur.

**Why this priority**: Tələbin ikinci hissəsidir: panel Figma-dan artıq bölmə göstərir.

**Independent Test**: 1440px endə hamburger panelini açıb bölmələrin dəstini, sırasını və sütun bölgüsünü Figma `1088:26873` ilə
tutuşdurmaq.

**Acceptance Scenarios**:

1. **Given** seed tətbiq olunub, **When** 1440px endə hamburger paneli açılır, **Then** paneldə yalnız Figma-dakı 6 bölmə var, Figma sırası ilə.
2. **Given** eyni panel, **When** sütunlara baxılır, **Then** bölgü Figma-dakı kimidir: 1) İstehlakçı hüquqları, 2) Rəqəmsal maliyyə ekosistemi, 3) Beynəlxalq əməkdaşlıq, 4) Maliyyə savadlılığı, FinCERT, Naxçıvan MR İdarəsi.
3. **Given** "Rəqəmsal maliyyə ekosistemi" yaradılıb, **When** panel açılır, **Then** onun altında Figma-dakı 8 bənd Figma sırası ilə görünür və hər biri öz səhifəsini açır.
4. **Given** en saytı, **When** panel açılır, **Then** en ağacında olan eyni bölmələr görünür, bayraqla çıxarılanlar yoxdur.
5. **Given** ekran 1024–1359px-dir, **When** hamburger paneli açılır, **Then** panel əvvəlki qaydası ilə bütün bölmələri göstərir (nav zolağındakılar istisna). Bayraqla çıxarılan bölmələr burada qalır.
6. **Given** ekran mobil endədir, **When** mobil çekmecə açılır, **Then** bütün kök bölmələr, o cümlədən bayraqla çıxarılanlar, əvvəlki kimi görünür.

---

### User Story 3 - Redaktor kök bölməni hamburger panelindən çıxarır (Priority: P2)

Redaktor admin paneldə kök bölmənin formasını açır, "Saytın menyusunda" kartında "Menyudakı yeri" üçün "Menyularda yox"u seçib
saxlayır. Bölmə geniş masaüstü hamburger panelindən çıxır, digər menyularda qalır. "Hər yerdə"ni seçəndə geri qayıdır. Kart kök
bölmə üçün bu nəticəni düzgün yazır.

**Why this priority**: Gizlətmənin idarəsi redaktordadır (qərar 3). Seed başlanğıc vəziyyəti qurur, sonrakı dəyişiklik redaktorun
işidir.

**Independent Test**: Admin paneldə "İstinadlar" bölməsini "Hər yerdə"yə qaytarıb saxlamaq, saytda 1440px paneldə görünməsini
yoxlamaq; sonra "Menyularda yox"a qaytarıb yenidən yoxlamaq.

**Acceptance Scenarios**:

1. **Given** kök bölmə "Hər yerdə"dir, **When** redaktor "Menyularda yox" seçib saxlayır, **Then** bölmə saytın ≥1360px hamburger panelindən çıxır, planşet paneli, mobil çekmecə və footer-də qalır.
2. **Given** kök bölmə "Menyularda yox"dur, **When** redaktor "Hər yerdə" seçib saxlayır, **Then** bölmə panelə əvvəlki yerinə qayıdır.
3. **Given** kök bölmənin forması açılıb, **When** kart göstərilir, **Then** o, kök bölmə üçün "Menyularda yox"un yalnız geniş ekranın hamburger panelinə təsir etdiyini yazır; "Yalnız açılan menyularda" seçimi kök bölmə üçün əvvəlki kimi yoxdur.
4. **Given** kök bölmə nav zolağındadır (ilk 9), **When** redaktor onu "Menyularda yox" edir, **Then** nav zolağı dəyişmir; kart bunu redaktora deyir.

---

### User Story 4 - Yeni bölmələrin səhifələri açılır (Priority: P3)

Ziyarətçi "Maliyyə sabitliyi" və ya "Rəqəmsal maliyyə ekosistemi"nin kökünə, ya da Rəqəmsal bölmənin hər hansı alt səhifəsinə
keçir. Səhifə açılır: başlıq və bölmənin sol menyusu var. Məzmun redaktor doldurana qədər boşdur, səhifə xəta
vermir.

**Why this priority**: Yeni menyu bəndləri ölü keçid olmamalıdır, amma məzmun redaktorun işidir.

**Independent Test**: Hər yeni səhifəni az və en ünvanı ilə açmaq: 404 və ya xəta yoxdur, başlıq və sol menyu görünür.

**Acceptance Scenarios**:

1. **Given** seed tətbiq olunub, **When** 10 yeni səhifənin (2 kök + 8 alt) hər biri az-da açılır, **Then** hər biri açılır və başlığı Figma-dakı adla eynidir.
2. **Given** en saytı, **When** eyni səhifələr en ünvanları ilə açılır, **Then** hər biri en başlığı ilə açılır.
3. **Given** yeni səhifə boşdur, **When** səhifə açılır, **Then** sol menyu bölmənin bəndlərini göstərir və səhifədə boş mətn yerinə xəta yoxdur.

---

### Edge Cases

- **Nav zolağının eni**: 9 bölmə 1360px-də Figma-dakı kimi sığır. 1024–1359px-də 9 bölmə bir sətirə sığmaya bilər. O endə zolağa
  sığmayan bölmə(lər) hamburger panelinə keçir, zolaq heç bir endə iki sətirə düşmür və üfüqi sürüşmə yaratmır.
- **Kök bölmə bayrağı və nav zolağı**: bayraq kök bölməni nav zolağından çıxarmır. Zolaq ağacın ilk bölmələridir, sıra ilə.
- **Bayrağı bu gün söndürülmüş kök bölmə**: kök bölmələrdə bayraq indiyə qədər heç nəyə təsir etmirdi. Seed-dən əvvəl hansı
  mühitdə kök bölmədə bayrağın artıq söndürüldüyü yoxlanmalıdır, yoxsa o bölmə gözlənilmədən paneldən çıxar. Test API-də heç bir
  kök bölmədə bayraq söndürülməyib.
- **"Dayanıqlı Maliyyə (Kopya)" qaralaması** (459) bölmə ilə birlikdə köçür və menyulardan çıxır (spec 047/050/054 nümunəsi).
- **Üç səviyyə**: "Dayanıqlı Maliyyə"nin alt səhifələri üçüncü səviyyəyə düşür. Açılan menyular üç səviyyə göstərir, ona görə
  heç biri itmir. Onların öz alt səhifələri olsa, dördüncü səviyyə əvvəlki kimi göstərilmir.
- **İki "Açıq bankçılıq"**: "Ödəniş sistemləri"ndə mövcud "Açıq bankçılıq" (38) yerində qalır. "Rəqəmsal maliyyə ekosistemi"ndə
  yeni boş səhifə yaranır. Slug-lar dil daxilində təkdir, ona görə yeni səhifənin slug-ı fərqli olur.
- **en ağacı**: en-də Sual-cavab və Naxçıvan kök bölməsi yoxdur (en başlığı yoxdur). Yeni bölmələrin en başlığı qaralamadır.
- **Seed təkrar işləyəndə** və ya bölmə əl ilə artıq yaradılıbsa heç nə ikiləşmir; redaktorun sonrakı dəyişikliklərinin üzərinə
  yazılmır.
- **Footer**: yalnız "Maliyyə sabitliyi" əlavə olunur (sabit siyahıda artıq var). Bayraqla çıxarılan bölmələr footer-də qalır.

## Requirements *(mandatory)*

### Functional Requirements

**Məzmun ağacı (seed)**

- **FR-001**: Yeni kök bölmə "Maliyyə sabitliyi" / "Financial stability" yaradılmalı və kök bölmələrin sırasında 3-cü olmalıdır
  (Pul siyasətindən sonra, Bazar iştirakçılarından əvvəl).
- **FR-002**: "Dayanıqlı Maliyyə" (113) bütün alt ağacı ilə "Maliyyə sabitliyi"nin altına köçməlidir. Onun və alt səhifələrinin
  ünvanları dəyişməməlidir.
- **FR-003**: "Maliyyə sabitliyi hesabatı" (64) və "Bank sektoru üzrə makroprudensial siyasət çərçivəsi" (65) "Nəşrlər və
  tədqiqatlar"dan "Maliyyə sabitliyi"nin altına köçməli, ünvanları dəyişməməli və yeni bölmənin menyularında görünməlidir. Sıra:
  Maliyyə sabitliyi hesabatı, makroprudensial siyasət çərçivəsi, Dayanıqlı Maliyyə.
- **FR-004**: Yeni kök bölmə "Rəqəmsal maliyyə ekosistemi" / "Digital financial ecosystem" yaradılmalıdır. Onun altında Figma
  sırası ilə 8 boş alt səhifə olmalıdır: Maliyyə texnologiyaları; Açıq bankçılıq; Xüsusi tənzimləmə rejimi; Rəqəmsal KYC;
  Kriptoaktivlərin tənzimlənməsi; Mərkəzi Bankın rəqəmsal valyutası; Maliyyə texnologiyaları ekosisteminin xəritəsi; Maliyyə
  texnologiyaları və innovasiyalar üzrə yenilik və tədbirlər. Hər səhifənin az və en başlığı olmalıdır (en qaralama).
- **FR-005**: Kök bölmələrin sırası hamburger panelində Figma sırasını verməlidir: İstehlakçı hüquqları, Rəqəmsal maliyyə
  ekosistemi, Beynəlxalq əməkdaşlıq, Maliyyə savadlılığı, FinCERT, Naxçıvan MR İdarəsi. Gizli bölmələrin aralarındakı yeri
  əhəmiyyətsizdir. Nav zolağının və footer-in sırası pozulmamalıdır.
- **FR-006**: Maliyyə sektorunun inkişaf Strategiyası, Məlumatların yayımlanması qrafiki, Sual-cavab və İstinadlar "Menyularda
  yox" kimi qeyd olunmalıdır.
- **FR-007**: Seed təkrar işləməyə və mövcud verilənlərə dözümlü olmalıdır: bölmə artıq varsa ikiləşməməli, redaktorun sonradan
  dəyişdiyi başlıq, sıra və bayraqların üzərinə yazılmamalıdır. Mövcud cədvəllərin strukturu dəyişməməlidir.

**İctimai sayt**

- **FR-008**: Nav zolağı ağacın ilk 9 kök bölməsini göstərməlidir (Figma `I813:25657;9:29`). Zolaq heç bir endə iki sətirə
  düşməməli və üfüqi sürüşmə yaratmamalıdır. Zolağa sığmayan bölmə həmin endə hamburger panelində görünməlidir.
- **FR-009**: ≥1360px hamburger panelində "Menyularda yox" kimi qeyd olunmuş kök bölmə görünməməlidir. Bu, spec 042-nin üst zolaq
  qaydasına əlavədir, onu əvəz etmir.
- **FR-010**: 1024–1359px hamburger paneli, mobil çekmecə, nav zolağı, footer, breadcrumb və bölmələrin sol menyusu kök bölmə
  bayrağına görə dəyişməməlidir.
- **FR-011**: ≥1360px hamburger panelinin sütun bölgüsü Figma `1088:26873` ilə eyni olmalıdır (FR-005-dəki 6 bölmə, 4 sütun).
- **FR-012**: Yeni səhifələr (2 kök + 8 alt) boş məzmunla xəta vermədən açılmalı, başlığı və bölmənin sol menyusunu göstərməlidir.

**Admin panel**

- **FR-013**: Kök bölmənin formasında "Menyudakı yeri" seçimi "Hər yerdə" və "Menyularda yox" ilə işləməlidir (kök üçün
  "Yalnız açılan menyularda" əvvəlki kimi yoxdur). "Saytın menyusunda" kartı kök bölmə üçün nəticəni saytın qaydası ilə eyni
  yazmalıdır: "Menyularda yox" yalnız geniş ekranın hamburger panelinə təsir edir, nav zolağındakı bölməyə təsir etmir.
- **FR-014**: İctimai və admin API-nin cavab forması dəyişməməlidir: kök bölmələrin bayraqları ağacda artıq gəlir.

**Sənədlər**

- **FR-015**: Redaktor təlimatları (`web-cbar-new/docs/*-cms-guide.md`, `dokumentasiyalar/`), root `CLAUDE.md` və `business_logic`
  sənədləri yeni bölmələri və kök bölmə bayrağının hamburger panelinə təsirini eyni dəyişiklikdə yazmalıdır.

### Key Entities

- **Kök bölmə (CMS səhifəsi, səviyyə 1)**: başlıq (az/en), slug, sıra, menyu bayraqları. Nav zolağı ilk 9-u, hamburger paneli
  qalanını göstərir. Yeni: "Maliyyə sabitliyi", "Rəqəmsal maliyyə ekosistemi".
- **Menyu yeri bayrağı** (mövcud, spec 041/048/054): "Hər yerdə" / "Yalnız açılan menyularda" / "Menyularda yox". Yeni məna: kök
  bölmədə "Menyularda yox" onu geniş ekranın hamburger panelindən çıxarır.
- **Köçən səhifələr**: "Dayanıqlı Maliyyə" alt ağacı ilə, "Maliyyə sabitliyi hesabatı", makroprudensial siyasət çərçivəsi —
  valideyn və sıra dəyişir, ünvan dəyişmir.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 1440px endə nav zolağındakı bölmələrin adları və sırası Figma `I813:25657;9:29` ilə 9/9 üst-üstə düşür (az).
- **SC-002**: 1440px endə hamburger panelindəki kök bölmələrin dəsti, sırası və sütun bölgüsü Figma `1088:26873` ilə 6/6 eynidir.
- **SC-003**: Köçən bütün səhifələr (Dayanıqlı Maliyyə alt ağacı, 64, 65) köhnə ünvanları ilə açılır: 0 qırılan keçid.
- **SC-004**: 10 yeni səhifənin hamısı az və en-də xətasız açılır.
- **SC-005**: Yoxlanan hər endə (1440, 1360, 1280, 1024, 900, 390) nav zolağı bir sətirdir və səhifədə üfüqi sürüşmə yoxdur; hər
  kök bölməyə ən azı bir menyudan çatmaq olur.
- **SC-006**: Redaktor kök bölmənin panel görünməsini kod dəyişmədən bir saxlama ilə dəyişə bilir; nəticə saytda dərhal görünür.

## Assumptions

- "Klik etdiyim yer" Figma-nın nav zolağında 3-cü bənddir ("Maliyyə sabitliyi"). Seçilmiş çərçivə `1088:26873` hamburger panelinin
  tərkibini verir.
- "Maliyyə sabitliyi"nin açılan menyusu Figma-da çəkilmədiyi üçün CMS ağacından mövcud mega-menyu şablonu ilə qurulur. Kök
  səhifələrin mətni boşdur, redaktor doldurur.
- Yeni səhifələrin slug-ları adların translit formasıdır (`maliyye-sabitliyi` / `financial-stability` və s.). Toqquşmada
  dildə tək olan forma seçilir. en başlıqları qaralamadır (spec 045/046/054 nümunəsi).
- Figma panelindəki "İstehlakçıların və investorların hüquqları"nın alt bəndləri ("Mərkəzi Banka müraciət imkanları", "Tədbirlər")
  bu spec-in əhatəsindən kənardır: hub səhifəsi ayrıca spec-dir (spec 050), alt bəndlər əvvəlki kimi ağacdan gəlir.
- "Rəqəmsal maliyyə ekosistemi"nin səhifələrinin məzmunu və Figma dizaynı sonrakı spec-dir. Mövcud "Açıq bankçılıq" (38) köçmür.
- Spec 055 header redesign (`menuGroup` göstərilməsi) üçün rezervdir, bu spec ondan asılı deyil.
- Komponentlər: `api-cbar-admin` (seed migrasiyası), `web-cbar-new` (nav zolağı, panel qaydası), `web-cbar-admin-new` (kartın
  mətni və kök bölmə hesabı). `api-cbar`-da dəyişiklik gözlənilmir. Deploy sırası: **əvvəl admin API (seed), sonra sayt**. Sayt əvvəl
  çıxsa, seed-dən əvvəlki ağacda 9-cu kök bölmə "Media"dır və nav zolağına düşər. Seed əvvəl çıxanda köhnə sayt qısa müddət
  8 bölmə göstərir ("Nəşrlər və tədqiqatlar" hamburgerə keçir) və kök bayraqlarına baxmır. Admin panel istənilən vaxt.
