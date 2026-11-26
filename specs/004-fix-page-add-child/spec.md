# Feature Specification: Səhifə ağacında alt səhifə əlavə edəndə yaranan xətanın düzəldilməsi

**Feature Branch**: `004-fix-page-add-child`

**Created**: 2026-09-23

**Status**: Draft

**Input**: User description: "C:\Users\javid_salimov\Desktop\jspace\common\commonrabc\web-cbar-admin-new burda /pages sehifesine kecid edende haqqimizda hisesinde yeni bir menu item elave etmek isteyirem amma + buttona klik edirem  error olur something went wrong deyire  bunu hell etmek lazimdir"

## Məqsəd və əhatə

Yeni admin panelində (`web-cbar-admin-new`) **Səhifələr** ekranında redaktor
mövcud bir səhifənin (məsələn "Haqqımızda") altına yeni menyu bəndi — yəni alt
səhifə — əlavə etmək üçün həmin sətrin **+** düyməsinə basır. Gözlənilən: boş
"Yeni səhifə" formu açılır, valideyn kimi "Haqqımızda" seçilmiş olur. Faktiki:
ekran ümumi xəta səhifəsi ilə ("Something went wrong") əvəz olunur və redaktor
heç nə əlavə edə bilmir.

Bu, köhnə paneldə mümkün olan əsas CMS əməliyyatıdır; onsuz sayt menyusu yeni
paneldən genişləndirilə bilmir və bu, keçid (cutover) üçün bloklayıcıdır.

**Hədəf proyekt**: yalnız `web-cbar-admin-new`. `api-cbar-admin` yalnız xətanın
səbəbi API cavabında olarsa toxunulur (bax Assumptions).

**Əhatəyə daxil deyil**: səhifə ağacının dizaynının dəyişdirilməsi, yeni
sahələr, sürüklə-burax sıralama, köçürmə/silmə axınlarında dəyişiklik (onlarda
eyni səbəbdən xəta aşkarlanmasa).

**Məlum faktlar** (2026-09-23, plan mərhələsində toplanıb):

- Mövcud test və tam aplikasiya (real marşrut ağacı + app shell) mock API ilə
  `/pages/new?parentId=…` ünvanını xətasız açır.
- İstifadəçi: lokalda (`npm run local:testcbar`, **eyni test API və eyni
  məlumat**) xəta **yoxdur**; yalnız deploy olunmuş saytda olur və **təkrar
  cəhddə işləyir**. Deməli səbəb məlumatda deyil, deploy olunmuş build-in
  yüklənməsindədir (ətraflı: `research.md` R1).
- Xəta ekranı səbəbi heç yerdə göstərmir və log-a yazmır — ona görə istifadəçi
  real xəta mətnini verə bilmədi.

**Əlavə tələb (plan mərhələsində)**: bu yolla əlavə olunan menyu bəndi sonra
ictimai saytda (`web-cbar-new`) menyuda görünməlidir.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Mövcud səhifənin altına yeni alt səhifə əlavə etmək (Priority: P1)

Redaktor Səhifələr ekranına keçir, "Haqqımızda" sətrində **+** düyməsinə basır,
açılan formda başlıq (az və/və ya en) və məzmun yazır, saxlayır. Yeni səhifə
ağacda "Haqqımızda"nın altında görünür.

**Why this priority**: İstifadəçinin bildirdiyi xəta məhz budur; menyunu
genişləndirməyin başqa yolu yoxdur.

**Independent Test**: Test mühitində "Haqqımızda" sətrinin **+** düyməsinə basıb
formun açıldığını, saxlamadan sonra yeni səhifənin həmin valideynin altında
göründüyünü yoxlamaq.

**Acceptance Scenarios**:

1. **Given** redaktor Səhifələr ekranındadır, **When** "Haqqımızda" sətrinin **+** düyməsinə basır, **Then** xəta ekranı yox, boş "Yeni səhifə" formu açılır.
2. **Given** form "Haqqımızda"nın **+** düyməsindən açılıb, **When** redaktor yalnız AZ başlığı yazıb saxlayır, **Then** uğur bildirişi görünür, redaktor ağaca qaytarılır və yeni səhifə "Haqqımızda"nın birbaşa uşağı kimi göstərilir.
3. **Given** redaktor EN dil tabındadır (`?locale=en`), **When** hər hansı sətrin **+** düyməsinə basır, **Then** eyni forma xətasız açılır.
4. **Given** form açıqdır, **When** redaktor səhifəni yeniləyir (F5) və ya ünvanı birbaşa açır, **Then** forma yenə xətasız açılır və valideyn itmir.

---

### User Story 2 - Ağacın istənilən sətrindən alt səhifə əlavə etmək (Priority: P2)

Eyni **+** düyməsi ağacın hər sətrində — kök səhifələrdə, dərin alt səhifələrdə,
qorunan (readonly/silinməz) səhifələrdə — xətasız işləyir.

**Why this priority**: Xəta yalnız "Haqqımızda"da deyil, müəyyən məlumat
xüsusiyyətinə görə yarana bilər; düzəliş bütün ağacı əhatə etməlidir.

**Independent Test**: Test mühitindəki ağacın hər səviyyəsindən ən azı bir sətir
üçün **+** düyməsinə basıb formun açıldığını yoxlamaq.

**Acceptance Scenarios**:

1. **Given** ağacda kök, 2-ci və 3-cü səviyyə səhifələri var, **When** hər birinin **+** düyməsinə basılır, **Then** hər dəfə forma xətasız açılır.
2. **Given** yuxarıdakı ümumi "Yeni səhifə" düyməsi, **When** basılır, **Then** forma xətasız açılır və saxlanan səhifə kök səviyyədə yaranır.

---

### User Story 3 - Gözlənilməz xəta olarsa aydın bildiriş (Priority: P3)

Formu açmaq üçün lazım olan məlumat yüklənə bilməzsə, redaktor bütün paneli
bağlayan ümumi "Something went wrong" ekranı yox, səbəbi izah edən və geri
qayıtmağa / yenidən cəhd etməyə imkan verən bildiriş görür.

**Why this priority**: Əsas düzəliş P1-dir; bu, gələcəkdə oxşar xətaların
redaktoru çıxılmaz vəziyyətdə qoymamasını təmin edir.

**Independent Test**: API-ni əlçatmaz edib **+** düyməsinə basmaq; redaktorun
yerli xəta bildirişi və "Səhifələrə qayıt" imkanı görməsi.

**Acceptance Scenarios**:

1. **Given** API cavab vermir, **When** redaktor **+** düyməsinə basır, **Then** forma daxilində/yerində başa düşülən xəta bildirişi görünür, naviqasiya menyusu işlək qalır.
2. **Given** panel açıq ikən yeni versiya deploy olunub, **When** redaktor **+** düyməsinə basır, **Then** panel özü bir dəfə yenilənir və forma açılır — xəta ekranı görünmür.
3. **Given** xəta ekranı hər hansı səbəbdən görünür, **When** komanda brauzer konsoluna baxır, **Then** real xəta mətni orada yazılıb (deploy olunmuş build-də də).

---

### User Story 4 - Əlavə olunan bənd ictimai saytın menyusunda görünür (Priority: P1)

Redaktor "Haqqımızda" altına yeni səhifə əlavə edir; bu səhifə ictimai saytın
(`web-cbar-new`) üst menyusunda "Haqqımızda" bölməsinin altında görünür və
klikləndikdə səhifənin məzmunu açılır.

**Why this priority**: İstifadəçinin məqsədi menyunu genişləndirməkdir; səhifə
yaranıb menyuda görünməsə iş yarımçıqdır. Yeni səhifə default olaraq
**qaralama** statusunda yaranır və qaralama ictimai menyuda görünmür — redaktor
bunu formda bilməlidir.

**Independent Test**: Test mühitində "Haqqımızda" altına "Dərc olunub" statuslu
səhifə yaradıb 5 dəqiqə ərzində ictimai saytın menyusunda görmək.

**Acceptance Scenarios**:

1. **Given** yeni səhifə "Dərc olunub" statusu, aktiv, görünən, AZ-da göstərilən və AZ başlığı ilə saxlanıb, **When** ictimai saytın AZ versiyası açılır, **Then** ən gec 5 dəqiqə sonra menyuda "Haqqımızda" altında görünür və link səhifənin özünü açır.
2. **Given** yeni səhifə qaralama statusunda saxlanıb, **When** redaktor formdadır, **Then** formda "ictimai menyuda görünməyəcək" xəbərdarlığı və səbəbi (status) görünür.
3. **Given** səhifənin yalnız AZ başlığı var, **When** ictimai saytın EN versiyası açılır, **Then** səhifə EN menyusunda görünmür (gözlənilən davranış) və form bunu göstərir.
4. **Given** səhifə ağacda 4-cü və daha dərin səviyyədədir, **When** redaktor formdadır, **Then** formda "menyu yalnız 3 səviyyə göstərir" xəbərdarlığı görünür.

### Edge Cases

- Valideyn göstəricisi ünvanda səhv və ya mövcud olmayan səhifəyə işarə edirsə: forma açılır, saxlama cəhdi API-nin rədd cavabını formada göstərir (bütün ekran çökmür).
- Valideyn səhifə readonly/disabled-dirsə: alt səhifə əlavə etmək bloklanmır (köhnə panel davranışı) — valideynin kilidi yeni uşağa ötürülmür.
- Valideynin başlığı yalnız bir dildə doludursa və ya heç birində yoxdursa: forma xətasız açılır.
- Eyni slug-lu səhifə artıq varsa: sistem slug-u avtomatik unikallaşdırır (`-2`, `-3`), redaktor xəta görmür.
- Redaktorun sessiyası (token) formu açan anda bitibsə: giriş səhifəsinə yönləndirilir, xəta ekranı yox.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Səhifə ağacının istənilən sətrindəki **+** düyməsi ümumi xəta ekranı göstərmədən "Yeni səhifə" formunu açmalıdır.
- **FR-002**: Bu yolla açılan formdan saxlanan səhifə basılmış sətrin birbaşa uşağı kimi yaranmalıdır.
- **FR-003**: Ümumi "Yeni səhifə" düyməsi xətasız işləməli və kök səviyyədə səhifə yaratmalıdır.
- **FR-004**: Forma həm birbaşa ünvanla açılanda, həm də yeniləndikdə (F5) valideyn məlumatını itirməməlidir.
- **FR-005**: Forma açılarkən və ya saxlanarkən baş verən xətalar formun yerində, oxunaqlı mətnlə göstərilməli, panelin qalan hissəsi (menyu, naviqasiya) işlək qalmalıdır.
- **FR-006**: Xətanın kök səbəbi real mühitdə təkrarlanıb sənədləşdirilməli, və həmin səbəbi tutan avtomatlaşdırılmış reqressiya testi əlavə olunmalıdır (mövcud test xətanı tutmadığı üçün).
- **FR-007**: Səhifə redaktəsi, köçürmə və silmə axınları dəyişməz qalmalı; mövcud testlər keçməlidir.
- **FR-008**: Yeni versiya deploy olunduqdan sonra köhnə açıq tabda formun hissələri yüklənə bilmədikdə panel özü bir dəfə yenilənməlidir; yenilənmə sonsuz dövrə girməməlidir.
- **FR-009**: Xəta ekranı göstərilən hər halda real xəta mətni deploy olunmuş build-də də brauzer konsoluna yazılmalıdır (token və şəxsi məlumat olmadan).
- **FR-010**: Səhifə formu səhifənin ictimai menyuda görünüb-görünməyəcəyini hər dil üçün canlı göstərməlidir; görünməyəcəksə səbəbi adı ilə (status, aktiv, görünən, dildə göstər, həmin dildə başlıq, dərinlik) yazılmalıdır.
- **FR-011**: İctimai menyuda görünmə qaydaları dəyişmir; `web-cbar-new` və `api-cbar`-da kod dəyişikliyi tələb olunmur.

### Key Entities

- **Səhifə (Page)**: ağacda yer alan CMS səhifəsi; valideyn səhifəsi (və ya kök), sıra nömrəsi, status, bayraqlar və az/en tərcümələri (başlıq, slug, məzmun) var.
- **Valideyn əlaqəsi**: yeni səhifənin ağacda hansı səhifənin altına düşəcəyini müəyyən edir; **+** düyməsi ilə ötürülür.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Test mühitində ağacın bütün səviyyələrindən seçilmiş sətirlərdə **+** düyməsi 100% hallarda formu xətasız açır (0 dəfə "Something went wrong").
- **SC-002**: Redaktor "Haqqımızda" altına yeni menyu bəndini 1 dəqiqədən az müddətdə, köməksiz əlavə edə bilir.
- **SC-003**: Yaradılan alt səhifə saxlamadan dərhal sonra ağacda düzgün valideynin altında görünür (100% hallarda).
- **SC-004**: Yeni reqressiya testi düzəlişdən əvvəlki kodda uğursuz, düzəlişdən sonra uğurlu olur; panelin tam yoxlama dəsti (`verify`) keçir.
- **SC-005**: Panel açıq ikən ardıcıl iki deploy-dan sonra **+** düyməsi 0 dəfə xəta ekranı göstərir.
- **SC-006**: "Haqqımızda" altına dərc olunmuş səhifə əlavə edildikdən sonra 5 dəqiqə ərzində ictimai saytın menyusunda görünür.

## Assumptions

- Xəta yeni paneldədir (`web-cbar-admin-new`) və API ilə bağlı deyil: eyni test API ilə lokal panel xətasız işləyir.
- Yeni səhifənin default statusu qaralama olaraq qalır (təsadüfi dərcin qarşısını alır); redaktor dərc etmək üçün statusu özü seçir.
- İctimai saytın menyusu 5 dəqiqəlik keşlə yenilənir (spec 003); ani yenilənmə (webhook) bu spec-in əhatəsindən kənardır.
- Yerli .NET SDK olmadığı üçün təkrarlama və yoxlama yerli paneli deploy olunmuş test API-yə qarşı işlətməklə aparılır.
- İstifadəçinin "menu item" dediyi şey səhifə ağacında alt səhifədir (sayt menyusu bu ağacdan qurulur); ayrıca menyu redaktoru nəzərdə tutulmur.
- Alt səhifə əlavə etmək hüququ bütün daxil olmuş redaktorlara aiddir (mövcud icazə modeli dəyişmir).
