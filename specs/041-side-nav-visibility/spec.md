# Feature Specification: "Sol menyuda göstər" — səhifəni yalnız bölmənin sol menyusundan gizlətmək

**Feature Branch**: `041-side-nav-visibility`

**Created**: 2026-11-12

**Status**: Implemented

**Input**: "Mən menyuda və media sol paneldə görünən alt menyuların idarəsini öyrənmək istəyirəm. Sol menyuda görünəni gizli
edəndə naviqasiya menyusu deyir, bunun səbəbini öyrənək." Araşdırmadan sonra: "onun planını quraq". Qərarlar: (1) gizli
səhifənin özü açıq olanda sol menyuda görünür; (2) bayraq hər iki sol menyuya aiddir; (3) admin paneldə adı "Sol menyuda göstər".

**Hazırkı vəziyyət** (kod, 2026-11-12):

- Səhifənin menyu görünüşünü bir bayraq idarə edir: "Menyuda görünür". O söndürüləndə səhifə saytın **bütün** naviqasiyasından
  çıxır: üst menyu, mobil menyu, footer, sol menyu və breadcrumb. Bunların hamısı eyni səhifə ağacından qurulur.
- Belə səhifənin alt səhifələri yox olmur, üst səviyyəyə qalxır və üst menyuda ayrıca bölmə kimi görünə bilər. Panel bunu
  "Valideyn bu dildə görünmür — səhifə menyuda üst səviyyədə çıxacaq" deyə xəbərdar edir. `docs/media-cms-guide.md` buna görə
  köhnə tədbir səhifələrini gizlətməyi qadağan edir.
- Gizli səhifə URL ilə yenə açılır, amma sol menyuda aktiv bəndi olmur, breadcrumb-u bölmə ağacından qurulmur.
- Sayt iki sol menyu göstərir: Haqqımızda və Media bölmə şablonunun menyusu (iki səviyyə) və qalan CMS bölmələrinin köhnə
  görünüşlü sol ağacı (Pul siyasəti, Statistika…). Hər ikisi ağacın bölmə kökünün uşaqlarından qurulur.
- "Yalnız sol menyudan çıxar" imkanı yoxdur. Redaktor ya bəndi saxlayır, ya da onu hər yerdən çıxarıb uşaqlarını üst menyuya
  qaldırır.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Redaktor bəndi yalnız sol menyudan çıxarır (Priority: P1)

Redaktor admin paneldə səhifəni açır, "Sol menyuda göstər" bayrağını söndürür və yadda saxlayır. Bənd bölmənin sol menyusundan
çıxır, amma üst menyuda, mobil menyuda, footer-də və breadcrumb-da qalır. Alt səhifələri üst menyuya qalxmır.

**Why this priority**: Funksiyanın özüdür. Bu gün bunu etmək mümkün deyil, mövcud yol isə yan təsir yaradır.

**Independent Test**: Media altındakı bir səhifədə bayrağı söndürmək, saytda Media bölməsinin başqa bir səhifəsini açmaq: bənd sol
menyuda yoxdur, üst menyuda var, uşaqları üst səviyyədə görünmür.

**Acceptance Scenarios**:

1. **Given** Media altındakı səhifədə "Sol menyuda göstər" söndürülüb, **When** Media bölməsinin başqa səhifəsi açılır, **Then** bənd sol menyuda görünmür.
2. **Given** eyni səhifə, **When** üst menyu, mobil menyu və footer açılır, **Then** bənd əvvəlki yerində görünür.
3. **Given** gizli bəndin alt səhifələri var, **When** bölmənin başqa səhifəsi açılır, **Then** alt səhifələr də sol menyuda görünmür və heç bir menyuda üst səviyyəyə qalxmır.
4. **Given** bayraq söndürülüb, **When** az və en saytları açılır, **Then** bənd hər iki dildə sol menyudan çıxıb.
5. **Given** bayraq yenidən açılıb, **When** səhifə yenilənir, **Then** bənd sol menyuda əvvəlki yerində görünür.
6. **Given** köhnə görünüşlü bölmədəki (məs. Pul siyasəti) səhifədə bayraq söndürülüb, **When** həmin bölmənin başqa səhifəsi açılır, **Then** bənd onun sol ağacında da görünmür.

---

### User Story 2 - Ziyarətçi gizli səhifənin özündə yerini itirmir (Priority: P1)

Ziyarətçi sol menyuda gizli olan səhifəyə üst menyudan, axtarışdan və ya linklə gəlir. Bu səhifədə sol menyu bəndi aktiv halda
göstərir, breadcrumb isə bölmədəki yeri göstərir.

**Why this priority**: Qərar 1. Bu olmasa ziyarətçi açdığı səhifəni menyuda tapmır.

**Independent Test**: Sol menyuda gizli səhifəni birbaşa açmaq: bənd sol menyuda öz yerində aktivdir, breadcrumb "Ana səhifə ›
Bölmə › Səhifə" kimidir.

**Acceptance Scenarios**:

1. **Given** səhifə sol menyuda gizlidir, **When** həmin səhifə açılır, **Then** sol menyuda o, öz yerində aktiv bənd kimi görünür.
2. **Given** gizli səhifənin alt səhifəsi açılır, **When** sol menyu qurulur, **Then** gizli bənd və açıq alt səhifəyə aparan zəncir görünür, aktiv bənd alt səhifədir.
3. **Given** səhifə sol menyuda gizlidir, **When** səhifə açılır, **Then** breadcrumb səhifənin bölmədəki tam yolunu göstərir.
4. **Given** ziyarətçi gizli səhifədən bölmənin başqa səhifəsinə keçir, **When** yeni səhifə açılır, **Then** gizli bənd sol menyuda yenə görünmür.

---

### User Story 3 - Redaktor hansı menyuda nəyin görünəcəyini paneldə görür (Priority: P2)

Səhifə formasındakı "Saytın menyusunda" kartı üst menyu və sol menyu üçün görünüşü ayrıca göstərir, görünmürsə səbəbini də yazır.
Ağac siyahısında sol menyuda gizli səhifənin nişanı var.

**Why this priority**: Araşdırmanın başladığı qarışıqlığı aradan qaldırır: redaktor hansı bayrağın hansı menyunu idarə etdiyini
saytı açmadan bilir.

**Independent Test**: Paneldə bayraqları növbə ilə dəyişmək və kartın iki sətrini, ağacdakı nişanı yoxlamaq.

**Acceptance Scenarios**:

1. **Given** səhifənin bütün bayraqları açıqdır, **When** forma açılır, **Then** kart hər dil üçün "Üst menyu: görünəcək" və "Sol menyu: görünəcək" göstərir.
2. **Given** "Sol menyuda göstər" söndürülüb, **When** forma açılır, **Then** üst menyu sətri "görünəcək", sol menyu sətri "görünməyəcək", səbəb "sol menyuda göstərilmir" olur.
3. **Given** valideyn səhifədə "Sol menyuda göstər" söndürülüb, **When** alt səhifənin forması açılır, **Then** sol menyu sətri "görünməyəcək", səbəb "valideyn sol menyuda gizlidir" olur.
4. **Given** "Menyuda görünür" söndürülüb, **When** forma açılır, **Then** hər iki sətir "görünməyəcək" olur və mövcud səbəblər göstərilir.
5. **Given** səhifə sol menyuda gizlidir, **When** Səhifələr ağacı açılır, **Then** sətirdə "Sol menyuda gizli" nişanı var.
6. **Given** yeni səhifə yaradılır, **When** forma açılır, **Then** "Sol menyuda göstər" açıqdır.

---

### User Story 4 - Redaktor təlimatda bayraqların fərqini tapır (Priority: P3)

Haqqımızda və Media redaktor təlimatlarında hansı bayrağın nəyi gizlətdiyi bir cədvəldə yazılıb.

**Why this priority**: Yeni redaktor üçün lazımdır, amma funksiyanın işləməsinə təsir etmir.

**Independent Test**: Təlimatı oxuyub "yalnız sol menyudan necə çıxarım?" sualına cavab tapmaq.

**Acceptance Scenarios**:

1. **Given** Media təlimatı, **When** redaktor "Sol menyu" bölməsini oxuyur, **Then** "Menyuda görünür" və "Sol menyuda göstər" bayraqlarının təsiri və gizli valideynin uşaqlarına nə olduğu yazılıb.

---

### Edge Cases

- **Bölmə kökündə bayraq**: sol menyu kökün uşaqlarından qurulur, kökün özü bənd deyil. Bölmə kökündə bayrağı söndürmək sol
  menyunu gizlətmir. Köhnə görünüşlü ağacın başlığı da qalır.
- **"Menyuda görünür" söndürülüb**: o bayraq üstündür. Səhifə hər yerdən çıxır, "Sol menyuda göstər" dəyərinin təsiri olmur.
  Mövcud davranış dəyişmir: uşaqları üst səviyyəyə qalxır.
- **Valideyn və uşaq hər ikisi gizlidir**: uşaq açılanda zəncir yenə görünür (US2.2). Bölmənin başqa səhifəsində heç biri görünmür.
- **Tədbirlər**: köhnə tədbir səhifələri artıq yalnız açıq olanda görünür. Yeni bayraq bu qaydanı dəyişmir, ikisi birlikdə işləyir:
  bənd sol menyuda gizlidirsə, "Tədbirlər" bəndi də sol menyuda görünmür.
- **Redaktor surəti** ("Media (Kopya)", "Haqqımızda (Kopya)"): Kopya səhifəsi açılanda menyu Kopya kökündən qurulur. Bayraq orada
  da işləyir, Kopyanın özünü sol menyudan çıxarmaq üçün də istifadə oluna bilər.
- **Dərinlik**: bölmə şablonunda menyu iki səviyyədir, köhnə ağacda limit yoxdur. Bayraq hər səviyyədə işləyir.
- **Ekran eni**: qayda sol menyunun göstərildiyi hər endə eynidir.
- **Köhnə API ilə yeni sayt** (deploy arası): bayraq məlumatı gəlmirsə bütün bəndlər görünür, sayt sınmır.
- **Səhifə silinir**: səhifə və onun bayraq dəyəri heç yerdə görünmür. Bərpa olunan səhifə dəyərini saxlayır.
- **Köhnə panel ilə saxlama** (deploy arası): bayrağı bilməyən panel səhifəni saxlayanda bayrağın dəyəri dəyişmir.
- **Mövcud səhifələr**: heç bir səhifə üçün əl ilə dəyər yazmaq lazım deyil. Bayraq yazılmamış səhifə görünür sayılır.

## Requirements *(mandatory)*

### Functional Requirements

**Məlumat və idarə**

- **FR-001**: Hər səhifənin "Sol menyuda göstər" bayrağı olmalıdır. Default açıqdır, bir dəyər hər iki dilə aiddir.
- **FR-002**: Bayrağı dəyəri yazılmamış mövcud və yeni səhifə üçün açıq sayılmalıdır. Miqrasiya mövcud səhifələri dəyişməməli, onlar üçün dəyər yazmağı tələb etməməlidir.
- **FR-003**: Bayraq səhifələr cədvəlini dəyişmədən saxlanmalıdır (paylaşılan mühitdə o cədvəl başqa rola məxsus ola bilər, workspace qaydası).
- **FR-004**: Silinmiş səhifənin bayraq dəyəri heç yerdə görünməməli və başqa səhifəyə keçməməlidir. Səhifə bərpa olunarsa dəyəri qalır (səhifələr soft-delete olunur, research R3).
- **FR-005**: Admin panel səhifə formasında bayrağı "Görünürlük" qrupunda "Sol menyuda göstər" adı ilə göstərməli, saxlamalı və yenidən açanda eyni dəyəri göstərməlidir. Etiket az və en panel dillərində olmalıdır.
- **FR-006**: Bayrağı dəyişmək admin audit jurnalına səhifənin digər bayraqları kimi yazılmalıdır.

**İctimai sayt**

- **FR-007**: İctimai səhifə ağacı sol menyuda gizli səhifəni ağacdan çıxarmamalı, onu bayraqla birlikdə qaytarmalıdır. Üst menyu, mobil menyu, footer və breadcrumb bu bayrağa baxmamalıdır.
- **FR-008**: Bölmə şablonunun sol menyusu (Haqqımızda, Media) və köhnə görünüşlü CMS bölmələrinin sol ağacı bayrağı söndürülmüş bəndi alt bəndləri ilə birlikdə göstərməməlidir.
- **FR-009**: FR-008-in istisnası: açıq səhifə gizli bəndin özüdürsə və ya onun alt ağacındadırsa, gizli bənd və açıq səhifəyə aparan zəncir sol menyuda adi qaydada görünməlidir. Aktiv bənd açıq səhifədir.
- **FR-010**: Gizli bəndin olmaması digər bəndlərin sırasını, aktiv vəziyyətini və açılmasını dəyişməməlidir.
- **FR-011**: Sayt bayraq məlumatı olmayan ağac cavabını qəbul etməli və bütün bəndləri görünür saymalıdır.
- **FR-012**: "Menyuda görünür" bayrağının mövcud davranışı, o cümlədən uşaqların üst səviyyəyə qalxması, dəyişməməlidir.

**Admin panelin görünüş kartı**

- **FR-013**: "Saytın menyusunda" kartı hər dil üçün iki sətir göstərməlidir: üst menyu və sol menyu. Hər biri "görünəcək" və ya "görünməyəcək: səbəblər" olmalıdır.
- **FR-014**: Sol menyu sətrinin səbəbləri üst menyunun bütün səbəblərini, əlavə olaraq "sol menyuda göstərilmir" və "valideyn sol menyuda gizlidir" səbəblərini əhatə etməlidir. Bölmə kökünün özü üçün bayraq səbəb sayılmır (Edge Cases).
- **FR-015**: Kart sol menyu sətrində FR-009 istisnasını qeyd etməlidir: "Səhifənin özü açıq olanda sol menyuda görünür".
- **FR-016**: Səhifələr ağacında sol menyuda gizli səhifənin "Sol menyuda gizli" nişanı olmalıdır.
- **FR-017**: Kartın bayraq qaydaları ictimai saytın qaydası ilə eyni olmalıdır: panel bayraqlara görə "görünməyəcək" deyirsə sayt da göstərmir, əksinə də. Haqqımızda və Media şablonunun iki səviyyə limiti bu bayraqla bağlı deyil və kartda modelləşdirilmir (research R7).

**Kontrakt və sənədlər**

- **FR-018**: İctimai və admin API-nin əl ilə saxlanılan spesifikasiyaları yeni sahə ilə kod dəyişikliyindən əvvəl yenilənməlidir (workspace spec-first qaydası).
- **FR-019**: Media və Haqqımızda redaktor təlimatlarına bayraqların təsirini göstərən cədvəl əlavə olunmalıdır. Paneldəki "5 dəqiqəyə qədər gecikmə" qeydi saytın faktiki davranışı ilə yoxlanıb düzəldilməlidir.
- **FR-020**: Biznes məntiqi sənədi (`business_logic/new_business_logic.md`) yeni qaydanı əks etdirməlidir.

### Key Entities

- **Səhifə**: mövcud CMS səhifəsi. Yeni xüsusiyyət: "Sol menyuda göstər" (bəli/xeyr, default bəli, dildən asılı deyil).
- **Səhifə detalları**: səhifəyə bir-bir bağlı əlavə qeyd, səhifələr cədvəlini dəyişmədən yeni xüsusiyyətləri saxlayır. Sətri yoxdursa bütün xüsusiyyətlər default sayılır.
- **Ağac node-u** (ictimai): mövcud sahələr (id, başlıq, slug, menyu linki, uşaqlar) və "sol menyuda göstər".

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Redaktor səhifəni yalnız sol menyudan bir bayraqla və bir yadda saxlama ilə çıxarır, kod dəyişikliyi və deploy lazım olmur.
- **SC-002**: Sol menyuda gizli səhifənin bölmədə 100% hallarda: üst menyu, mobil menyu, footer və breadcrumb bayraqdan əvvəlki kimi qalır, heç bir alt səhifə üst səviyyəyə qalxmır.
- **SC-003**: Sol menyuda gizli səhifə və onun alt səhifələri açılanda 100% hallarda sol menyuda aktiv bənd görünür.
- **SC-004**: Admin kartının proqnozu ictimai saytla test ssenarilərinin hamısında (US1, US2, US3, Edge Cases) üst-üstə düşür.
- **SC-005**: Funksiya yayımlananda mövcud səhifələrin heç birinin menyusu dəyişmir: əvvəl və sonra bütün bölmələrin sol menyusu eynidir.
- **SC-006**: Yeni redaktor təlimatı oxuyub "yalnız sol menyudan çıxar" əməliyyatını köməksiz edir.

## Assumptions

- Bayraq iki dil üçün birdir (qərar 3). Dil üzrə görünüş mövcud "AZ/EN saytda göstər" bayraqları ilə idarə olunur.
- "Sol menyu" yalnız bölmələrin sol menyusudur: Haqqımızda və Media şablonu, köhnə görünüşlü CMS bölmələri (qərar 2). Feature
  səhifələri (press-relizlər, qalereya, tədbirlər, yayım qrafiki) bölmə şablonunun eyni menyusunu işlədir, onlara da aiddir.
- Üst menyuda ayrıca "yalnız üst menyudan gizlət" bayrağı bu spec-in əhatəsində deyil.
- Komponentlər: admin API (miqrasiya, hər iki domen nüsxəsi, səhifə bayraqları), ictimai API (ağac cavabı), ictimai sayt, admin
  panel, redaktor təlimatları. Deploy sırası: admin API → ictimai API → sayt və panel. FR-011 sayəsində frontend-lərin sırası
  sınmaya səbəb olmur. Admin panel köhnə admin API ilə işləyəndə bayraq olmadan default açıq göstərilir və saxlananda göndərilir,
  köhnə API onu nəzərə almır.
- Miqrasiya nömrəsi `0024`-dür (son tətbiq olunan `0023-release-schedule-seed.sql`), adı hər iki API repo-sunda unikaldır.
- Bayraq dəyişikliyi saytda səhifə ağacının adi yenilənmə müddəti ilə görünür, ayrıca keş tələbi yoxdur.
