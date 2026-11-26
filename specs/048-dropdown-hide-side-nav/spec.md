# Feature Specification: Sol menyuda gizli səhifələr açılan menyularda da görünməsin

**Feature Branch**: `048-dropdown-hide-side-nav`

**Created**: 2026-11-16

**Status**: Implemented

**Input**: "Maliyyə savadlılığı hissəsində 3 dənə menyu görünür sol tərəfdə, amma hamburger menyuda digərləri də görünür. Bu problem
Beynəlxalq əməkdaşlıq səhifəsində də var, bunu aradan qaldıraq. Sol tərəfdə olmayan menyu elementləri hamburger menyuda da
görünməsin." Qərarlar (2026-11-16): (1) qayda bütün açılan menyulara aiddir: masaüstü/tablet hamburger paneli, mobil çekmecə və nav
çubuğunun mega-menyusu; (2) hamburgerdə "açıq səhifə" istisnası yoxdur: gizli səhifə ziyarətçi onun özündə olanda da açılan
menyularda görünmür.

**Hazırkı vəziyyət** (kod, 2026-11-16):

- Redaktor səhifənin "Sol menyuda göstər" bayrağını (spec 041) söndürəndə səhifə yalnız bölmənin sol menyusundan çıxır. Spec 041
  qəsdən onu üst menyuda, mobil menyuda, footer-də və breadcrumb-da saxlamışdı.
- "Maliyyə savadlılığı"nda seed `0030` dörd səhifəni (Ümumi məlumat, Seminarlar, Müsabiqələr, "(Kopya)" qaralaması) sol menyudan
  çıxarıb, ona görə sol menyuda 3 bənd qalır, hamburger paneli isə bölmənin bütün səhifələrini göstərir. "Beynəlxalq əməkdaşlıq"da
  da sol menyuda söndürülmüş səhifələr hamburger panelində görünür.
- Açılan menyuların hamısı (nav çubuğunun mega-menyusu, tablet/masaüstü hamburger paneli, mobil çekmecə) eyni səhifə ağacından
  qurulur və bu bayrağa baxmır. Footer yalnız kök bölmələri göstərir.

**Admin panel**: yeni ayar lazım deyil. Redaktor artıq bayrağı idarə edir; bundan sonra o, səhifəni sol menyu ilə yanaşı açılan
menyulardan da çıxarır. Amma səhifə formasındakı "Saytın menyusunda" kartı saytın menyu qaydasını təkrarlayır və indi belə səhifə üçün
"Üst menyu: görünəcək" yazır. Kart yeni qaydaya uyğunlaşmalıdır, yoxsa redaktoru çaşdırar.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Hamburger menyusu bölmənin sol menyusu ilə eyni bəndləri göstərir (Priority: P1)

Ziyarətçi "Maliyyə savadlılığı" və ya "Beynəlxalq əməkdaşlıq" bölməsinin səhifəsindədir və hamburger menyusunu açır. Həmin
bölmənin altında yalnız sol menyuda gördüyü bəndlər var; sol menyudan çıxarılmış səhifələr yoxdur.

**Why this priority**: Tələbin özüdür: iki menyu bir-birinə zidd olmamalıdır.

**Independent Test**: "Maliyyə savadlılığı"nın səhifəsini açıb sol menyunu hamburger panelindəki həmin bölmənin bəndləri ilə
tutuşdurmaq: dəst və sıra eynidir.

**Acceptance Scenarios**:

1. **Given** "Maliyyə savadlılığı"nın sol menyusunda 3 bənd var, **When** masaüstündə hamburger paneli açılır, **Then** bölmənin altında yalnız həmin 3 bənd eyni sırada görünür.
2. **Given** "Beynəlxalq əməkdaşlıq"da sol menyudan çıxarılmış səhifə var, **When** hamburger paneli açılır, **Then** o səhifə bölmənin altında görünmür.
3. **Given** ekran mobil endədir, **When** mobil çekmecə açılır və bölmə açılır, **Then** gizli səhifələr orada da yoxdur.
4. **Given** sayt ingiliscədir (`/en`), **When** eyni menyular açılır, **Then** nəticə az ilə eynidir.
5. **Given** gizli səhifənin alt səhifələri var, **When** açılan menyu göstərilir, **Then** alt səhifələr də görünmür və heç bir səviyyəyə qalxmır.
6. **Given** ziyarətçi gizli səhifənin özündədir (məs. "Seminarlar"), **When** hamburger açılır, **Then** o səhifə hamburgerdə yenə görünmür; sol menyu və breadcrumb onu əvvəlki kimi göstərir.

---

### User Story 2 - Qayda hər endə və hər açılan menyuda eynidir (Priority: P1)

Nav çubuğunda olan bölmələrin (məs. "Haqqımızda") sol menyudan çıxarılmış səhifələri də mega-menyuda, tablet hamburgerində və mobil
çekmecədə görünmür. Ziyarətçi ekran enindən asılı olmayaraq eyni bəndləri görür.

**Why this priority**: Qərar 1. Bu olmasa eyni səhifə masaüstünün mega-menyusunda görünər, tabletin hamburgerində görünməzdi.

**Independent Test**: Nav çubuğundakı bölmədə bir səhifənin bayrağını söndürüb 1440px, 900px və 390px endə menyuları açmaq: səhifə
heç birində yoxdur.

**Acceptance Scenarios**:

1. **Given** nav çubuğundakı bölmənin səhifəsi sol menyuda söndürülüb, **When** masaüstündə bölmənin mega-menyusu açılır, **Then** səhifə görünmür.
2. **Given** eyni səhifə, **When** tablet endə hamburger paneli açılır, **Then** səhifə görünmür.
3. **Given** redaktor bayrağı yenidən yandırır, **When** sayt yenilənir, **Then** səhifə bütün açılan menyularda və sol menyuda əvvəlki yerində görünür.

---

### User Story 3 - Digər naviqasiya dəyişmir (Priority: P2)

Gizli səhifə ünvanı ilə açılır, breadcrumb-u və footer-i əvvəlki kimidir; sol menyuda gizli olmayan səhifələr bütün menyularda qalır.

**Why this priority**: Dəyişiklik yalnız açılan menyuların tərkibinə aiddir, başqa heç nəyi qırmamalıdır.

**Independent Test**: Gizli səhifəni birbaşa açmaq, footer-i və breadcrumb-u yoxlamaq; bayrağı söndürülməmiş bölmələrin menyularını
əvvəlki vəziyyətlə tutuşdurmaq.

**Acceptance Scenarios**:

1. **Given** səhifə sol menyuda gizlidir, **When** onun ünvanı açılır, **Then** səhifə açılır, breadcrumb "Ana səhifə › Bölmə › Səhifə" kimidir.
2. **Given** heç bir səhifəsi gizli olmayan bölmə, **When** onun açılan menyusu göstərilir, **Then** bəndlər əvvəlki kimidir.
3. **Given** hər hansı en, **When** nav çubuğu (kök bölmələr), üst zolaq və footer göstərilir, **Then** onlar dəyişməyib.

---

### Edge Cases

- **Kök bölmənin özü**: kök bölmə heç bir sol menyuda bənd deyil, ona görə bayraq onu nav çubuğundan, hamburgerdən və footer-dən
  çıxarmır. Qayda yalnız bölmənin içindəki səhifələrə aiddir.
- **Bölmənin bütün alt səhifələri gizlidir**: bölmə açılan menyuda yalnız başlığı ilə qalır, keçidi işləyir.
- **Üçüncü səviyyə**: açılan menyular üç səviyyə göstərir, sol menyu iki. Üçüncü səviyyədəki gizli səhifə də açılan menyudan çıxır.
- **"Menyuda görünür" söndürülmüş səhifə**: dəyişmir — o əvvəlki kimi bütün naviqasiyadan çıxır və uşaqları üst səviyyəyə qalxır.
- **Köhnə tədbir səhifələri** (spec 034): onların menyuda gizlənməsi əvvəlki kimi qalır.
- **Bayraq gəlməyən köhnə cavab**: bayraq yoxdursa səhifə görünən sayılır (spec 041-dəki default).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: "Sol menyuda göstər" söndürülmüş səhifə nav çubuğunun mega-menyusunda, tablet/masaüstü hamburger panelində və mobil çekmecədə görünməməlidir.
- **FR-002**: Gizli səhifə alt səhifələri ilə birlikdə çıxmalıdır; alt səhifələr heç bir səviyyəyə qalxmamalıdır.
- **FR-003**: Açılan menyularda "açıq səhifə" istisnası olmamalıdır: ziyarətçi gizli səhifənin özündə olanda da o açılan menyularda görünmür.
- **FR-004**: Kök bölmələr, nav çubuğu, üst zolaq, footer, breadcrumb və sol menyunun davranışı dəyişməməlidir.
- **FR-005**: Qayda hər iki dildə (az, en) və hər ekran enində eyni işləməlidir.
- **FR-006**: İctimai və admin API, verilənlər bazası dəyişməməlidir. Admin paneldə yeni sahə olmamalıdır.
- **FR-008**: Admin paneldə səhifə formasındakı "Saytın menyusunda" kartının "Üst menyu" sətri, səhifə və ya onun kökdən aşağıdakı
  əcdadı "Sol menyuda göstər" ilə söndürülübsə, hər iki dil üçün "Görünməyəcək" və səbəbini göstərməlidir. Kök bölmə üçün nəticə dəyişmir.
- **FR-007**: Redaktor təlimatları və layihə sənədləri "Sol menyuda göstər" bayrağının indi açılan menyulara da təsir etdiyini yazmalıdır.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: "Maliyyə savadlılığı" və "Beynəlxalq əməkdaşlıq" bölmələrində hamburger panelindəki bəndlərin dəsti sol menyunun ilk səviyyəsi ilə 100% eynidir.
- **SC-002**: Yoxlanan hər endə (1440, 1200, 900, 390) sol menyuda gizli səhifə açılan menyuların heç birində görünmür.
- **SC-003**: Gizli səhifə ünvanı ilə açılır və breadcrumb-u dəyişmir (0 qırılan keçid).
- **SC-004**: Redaktor üçün heç bir əməliyyat tələb olunmur: dəyişiklik yayımlanan kimi mövcud bayraqlarla işləyir.
- **SC-005**: Admin kartının "Üst menyu" sətri saytın açılan menyularının nəticəsi ilə yoxlanan bütün hallarda üst-üstə düşür.

## Assumptions

- "Hamburger menyu" dedikdə tablet/masaüstü hamburger paneli və mobil çekmecə nəzərdə tutulur; qərar 1 ilə nav çubuğunun mega-menyusu
  da əlavə olunur ki, eyni səhifə enə görə gah görünüb gah gizlənməsin.
- Spec 041-in "səhifə üst menyuda və mobil menyuda qalır" qərarı bu spec ilə dəyişir; footer və breadcrumb haqqında qərarı qalır.
- Gizli səhifələr redaktor bayrağı ilə müəyyən olunur; hansı səhifənin gizli olması redaktor işidir, kodda siyahı yoxdur.
- Komponentlər: ictimai sayt (`web-cbar-new`) və admin panel (`web-cbar-admin-new`, yalnız kartın hesabı). İki ayrı MR; deploy
  sırası şərti yoxdur, çünki məlumat və API dəyişmir.
