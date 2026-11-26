# Feature Specification: Admin API-də rol əsaslı icazələr (RBAC) və məzənnələr üçün four-eyes təsdiqi

**Feature Branch**: `008-admin-rbac-four-eyes`

**Created**: 2026-09-30

**Status**: Draft

**Input**: User description: "1. RBAC faktiki olaraq yoxdur. roles, permissions və role_permissions cədvəlləri var, amma istifadə olunmur. Rol yoxlaması yalnız UsersController-dədir ([Authorize(Roles="admin")]). Qalan 25 controller-də sadəcə [Authorize] var. Nəticədə istənilən login olmuş redaktor bunları edə bilir: rəsmi valyuta məzənnələrini dəyişə və ya tam silə bilir (CurrencyRatesController.cs:62, :109); istənilən açarla settings yarada bilir; bütöv səhifə ağacını silə bilir. Məzənnə kimi data üçün four-eyes (hazırlayan ≠ təsdiqləyən) prinsipi də yoxdur. C:\Users\javid_salimov\Desktop\jspace\common\commonrabc\product-rest\api-cbar-admin burada tetbiq edek"

**Mənbə**: `api-admin-review.md` (2026-09-30), 🔴 Kritik bənd 1.

**Yenilənmə (2026-10-09)**: Təsvir yenidən verildi, bu dəfə çatdırılma bölgüsü və SP qiymətləri ilə: "1a: 13 SP, 1b: 8 SP. 1a — permission seed-i, policy-lər, JWT-yə permission claim-ləri və 25 controller-də atribut; vaxtın çoxu permission matrisini razılaşdırmağa və hər rolu `test`-də yoxlamağa gedir. 1b — yeni status (draft → approved), migration, təsdiq endpoint-i. Admin paneldə təsdiq ekranı ayrıca frontend task-ıdır." Yeni `022-*` spec açılmadı, çünki bu, eyni feature-dur. Təsvir bu spec-ə birləşdirildi.

**Çatdırılma bölgüsü**: iki ardıcıl, ayrıca deploy olunan hissə. Hər biri öz-özlüyündə dəyər verir.

| Hissə | SP | Əhatə | User Story-lər | FR-lər |
|-------|----|-------|----------------|--------|
| **1a — RBAC** | 13 | İcazə kataloqu və rol → icazə matrisi, hər əməliyyatda icazə yoxlaması, dağıdıcı/sistem əməliyyatları üçün ayrıca icazələr, "mənim icazələrim" | US1, US3, US4 | FR-001…FR-008, FR-019…FR-021 |
| **1b — Four-eyes** | 8 ⚠️ | Məzənnə vərəqinin "təsdiq gözləyir → təsdiqlənib" vəziyyəti, təsdiq və səbəbli geri qaytarma, dərc olunmuş vərəqin düzəlişi və silinməsi təsdiqlə, versiya yoxlaması, public tərəfdən gizlətmə | US2 | FR-009…FR-018 |

- 1b 1a-dan asılıdır: "hazırla" və "təsdiqlə" icazələri 1a-nın kataloqundan gəlir. 1a təkbaşına deploy oluna bilər. 1a deploy olunub 1b hələ olunmayanda məzənnələr bugünkü kimi dərhal dərc olunur, amma yalnız məzənnə icazəsi olan rollar tərəfindən.
- 1a-nın əsas riski kod deyil. Əsas risk matrisin razılaşdırılmasıdır (Sual 1) və hər rolun `test` mühitində yoxlanmasıdır (Independent Test, US1).
- Admin paneldə təsdiq növbəsi ekranı və düymələrin icazəyə görə gizlədilməsi ayrıca frontend task-ıdır (bax: Əhatə olunan proyektlər).

**Əhatə olunan proyektlər**:

- `product-rest/api-cbar-admin` — əsas iş: icazə kataloqu, rol → icazə xəritəsi, hər əməliyyatda icazə yoxlaması, məzənnə təsdiq axını.
- `product-rest/api-cbar` — yalnız o halda toxunulur ki, təsdiq gözləyən məzənnələrin public tərəfdən gizlədilməsi `api-cbar-admin` daxilində həll oluna bilməsin (plan qərar verir; üstünlük `api-cbar`-a toxunmamağa verilir).
- `product-rest/web-cbar-admin-new` — bu spec-in əhatəsində **deyil**; panelin yeni icazələrə uyğunlaşması (düymələri gizlətmək, təsdiq növbəsi ekranı) ayrıca spec olacaq. Bu spec-dən sonra panel 403 cavablarını düzgün göstərməlidir — bu, mövcud xəta idarəsi ilə qarşılanır.

**Deploy sırası (Maddə II.3, IV.2)**: `api-cbar-admin` (migration + icazə seed-i) → (lazım olsa) `api-cbar` → `web-cbar-admin-new`.

**`product-host` istinadı (Maddə I.2)**: Yii2-də üç rol var — `ADMIN_ROLE=1`, `MODERATOR_ROLE=2`, `MEAS_MANAGER_ROLE=3` (`common/components/identity/UserIdentity.php`).

- `admin/controllers/MainController.php:52` — məzmun modullarına yalnız admin və moderator daxil ola bilir.
- `admin/controllers/UsersController.php:34` — istifadəçiləri yalnız admin idarə edir.
- `admin/controllers/HomeController.php:19` — MEAS manager yalnız MEAS bölməsinə yönləndirilir.

Yəni legacy sistemdə MEAS manager məzmunu, məzənnələri və ayarları dəyişə **bilmirdi**. Yeni API-də isə bilir. Bu, **paritet reqressiyasıdır**, və bu spec onu bağlayır. Four-eyes təsdiqi Yii2-də yox idi, bu hissə **yeni funksiyadır**.

**Mövcud vəziyyət (kodda ölçülüb)**:

- `roles` cədvəlində `admin`, `moderator` və `meas_manager` var (`db/seed.sql`).
- `permissions` və `role_permissions` cədvəlləri boşdur. Onları heç bir kod oxumur.
- `CurrencyRatesController`-də `PUT` (bütöv günün vərəqini upsert edir) və `DELETE` (bütöv günün vərəqini silir) var. İkisi də yazılan kimi dərhal public sayta və `/currencies/{DD.MM.YYYY}.xml` feed-inə düşür.
- `SettingsController` `PUT /settings/{key}` ilə istənilən açarı yaradır.
- **Spec 009 (şəkilli popup) ilə gələn yeni controller**: `ImagePopupsController` (`/api/v1/image-popups`). Kataloqa `image_popups.read|create|update|delete` icazələri daxil edilməlidir (spec 009 R13). Matrisdə hansı rollara veriləcəyini plan müəyyən edir; təbii seçim canlı yayımlarla eyni rollardır.
- `PagesController.Delete` `RemovableAll` bayrağı olan səhifədə bütün alt ağacı soft-delete edir.
- **2026-10-09 yoxlaması**: hələ heç nə həyata keçirilməyib. `[Authorize(Roles = "admin")]` yalnız `UsersController`-dədir, 25 controller-də isə çılpaq `[Authorize]` var. `role_permissions`-ı yalnız EF modeli tanıyır, heç bir kod oxumur. RBAC və ya four-eyes üçün migration yoxdur (sonuncusu `0008`).
- **Spec 020 (access token revocation) tamamlanıb**: istifadəçinin deaktiv edilməsi, parol reset-i və rol dəyişikliyi artıq **növbəti sorğuda** qüvvəyə minir, 15 dəqiqə gözləmədən. Bu spec bu davranışı reqressiyaya salmamalıdır. Tokendə icazələrin özü daşınsa belə, rol dəyişikliyi növbəti sorğuda təsir etməlidir (FR-005).
- **Paylaşılan mühitlərdə mövcud cədvəllərin sahibi başqa DB roludur**: `ALTER TABLE` "must be owner of table" ilə yıxılır (`0004`, `0007`, `0008` migration-larındakı şərhlər). Bu, 1b-dəki "yeni status" üçün birbaşa riskdir. Məzənnə vərəqinin vəziyyəti, ehtimal ki, mövcud cədvələ sütun kimi yox, ayrıca cədvəldə saxlanmalı olacaq. Qərarı plan verir.
- **Legacy-də məzənnəni kim dəyişirdi**: `admin/controllers/CurrencyController.php` `MainController`-dən törəyir, yəni məzənnələri admin **və moderator** redaktə edirdi (Sual 1 üçün paritet istinadı).

## Clarifications

### Session 2026-10-09

- Q: Məzənnə üzərində hüquqlar kimdədir — moderator hazırlaya/təsdiqləyə bilsinmi, yoxsa ayrıca rollar yaradılsın? → A: Yeni rol yaradılmır. Moderator və admin məzənnə **hazırlaya** bilir, yalnız admin **təsdiqləyə** bilir. Hazırlayan ≠ təsdiqləyən qaydası admin-ə də aiddir: admin-in hazırladığı vərəqi yalnız başqa admin təsdiqləyə bilər.
- Q: Dərc olunmuş vərəqin düzəlişi və silinməsi, səbəbli geri qaytarma və versiya yoxlaması 1b-yə daxildirmi? → A: Hamısı 1b-yə daxildir (US2-nin bütün ssenariləri). Nəticə: 1b-nin 8 SP qiyməti bu əhatə üçün azdır. Təxminən 13 SP-dir, plan mərhələsində yenidən qiymətləndirilməlidir.
- Q: `data-model.md` §3-dəki rol → icazə matrisi təsdiqlənirmi, moderator MEAS hüququnu saxlayırmı? → A: Matris olduğu kimi təsdiqləndi (implement T001): admin 98, moderator 87, meas_manager 7 icazə. Moderator `meas.*` hüququnu saxlayır (legacy `meas/BaseController` pariteti).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Hər əməliyyat istifadəçinin rolunun icazələri ilə məhdudlaşır (Priority: P1)

Administrator istifadəçiyə rol təyin edir. Həmin istifadəçi admin API-də yalnız rolunun icazə verdiyi əməliyyatları edə bilir. Məsələn, MEAS manager yalnız MEAS bölməsini idarə edir. Məzmun redaktoru səhifə və xəbərlərlə işləyir, amma ayarları, istifadəçiləri və məzənnələri dəyişə bilmir. İcazəsi olmayan əməliyyat cəhdi rədd edilir, məlumat dəyişmir və cəhd audit jurnalına düşür.

**Why this priority**: Bu, review-da kritik kimi qeyd olunan boşluğun özüdür. Hazırda ələ keçirilmiş istənilən redaktor hesabı sistemdəki hər şeyi, o cümlədən rəsmi məzənnələri dəyişə bilir. Tək bu hekayə hazır olsa belə, risk kəskin azalır.

**Independent Test**: Hər rol üçün bir test istifadəçisi yaradılır. İcazə matrisindəki hər əməliyyat hər istifadəçi ilə çağırılır. Nəticə matrislə müqayisə olunur: icazəli əməliyyat uğurlu olur, icazəsiz əməliyyat rədd edilir və verilənlər dəyişmir.

**Acceptance Scenarios**:

1. **Given** MEAS manager rolunda login olmuş istifadəçi, **When** o, səhifəni redaktə etməyə, ayar yaratmağa və ya məzənnə vərəqi göndərməyə çalışır, **Then** əməliyyat "icazə yoxdur" cavabı ilə rədd edilir, verilənlər dəyişmir və audit jurnalında rədd edilmiş cəhd qeyd olunur.
2. **Given** MEAS manager, **When** o, MEAS sənədi yaradır və ya redaktə edir, **Then** əməliyyat uğurla keçir.
3. **Given** moderator (məzmun redaktoru), **When** o, xəbər və ya səhifə yaradır, redaktə edir, dərc edir, **Then** əməliyyat uğurla keçir.
4. **Given** moderator, **When** o, istifadəçi siyahısını açmağa və ya ayar dəyişməyə çalışır, **Then** əməliyyat rədd edilir.
5. **Given** admin, **When** o, istənilən modulda istənilən əməliyyatı edir, **Then** əməliyyat uğurla keçir. Yeganə istisna four-eyes qaydasıdır (User Story 2): admin öz hazırladığı məzənnəni təsdiq edə bilmir.
6. **Given** icazə matrisində heç bir icazəyə bağlanmamış yeni əməliyyat, **When** istənilən qeyri-admin istifadəçi onu çağırır, **Then** əməliyyat rədd edilir (default olaraq qadağandır).
7. **Given** istifadəçinin rolu admin tərəfindən dəyişdirilib, **When** istifadəçi köhnə sessiyası ilə işləməyə davam edir, **Then** yeni icazələr istifadəçinin növbəti sorğusunda qüvvəyə minir (spec 020 davranışı).

---

### User Story 2 - Rəsmi valyuta məzənnələri iki fərqli şəxs tərəfindən hazırlanır və təsdiqlənir (Priority: P1)

Məzənnə hazırlayan əməkdaş günün məzənnə vərəqini daxil edir. Vərəq "təsdiq gözləyir" vəziyyətində qalır və public saytda, eləcə də XML feed-də görünmür. Təsdiq icazəsi olan **başqa** əməkdaş vərəqi yoxlayır və ya təsdiqləyir, ya da səbəb yazaraq geri qaytarır. Yalnız təsdiqlənmiş vərəq public tərəfə çıxır. Artıq dərc olunmuş vərəqin düzəldilməsi və silinməsi də eyni iki addımdan keçir. Düzəliş təsdiqlənənə qədər public tərəfdə köhnə, təsdiqlənmiş dəyərlər qalır.

**Why this priority**: Məzənnə Mərkəzi Bankın rəsmi məlumatıdır. Onu illərdir xarici sistemlər XML feed-dən oxuyur. Tək bir şəxsin səhvi və ya ələ keçmiş bir hesab birbaşa maliyyə nəticələri doğurur. Four-eyes bu cür məlumat üçün sənaye standartıdır.

**Independent Test**: Hazırlayan istifadəçi vərəq göndərir. Public saytda və feed-də həmin gün üçün yeni dəyərlərin görünmədiyi yoxlanılır. Hazırlayanın özünün təsdiq cəhdi rədd edilməlidir. İkinci istifadəçi təsdiqləyir. Bundan sonra dəyərlər public tərəfdə görünməlidir.

**Acceptance Scenarios**:

1. **Given** hazırlama icazəsi olan istifadəçi A, **When** A yeni gün üçün məzənnə vərəqi göndərir, **Then** vərəq "təsdiq gözləyir" vəziyyətində saxlanılır. Public sayt və feed həmin gün üçün heç bir dəyər qaytarmır (və ya əvvəlki təsdiqlənmiş dəyərləri qaytarır).
2. **Given** A-nın göndərdiyi, təsdiq gözləyən vərəq, **When** A (hətta admin rolunda olsa belə) onu təsdiqləməyə çalışır, **Then** əməliyyat "hazırlayan təsdiqləyə bilməz" səbəbi ilə rədd edilir.
3. **Given** təsdiq gözləyən vərəq, **When** təsdiq icazəsi olan istifadəçi B onu təsdiqləyir, **Then** vərəq dərc olunur, public sayt və feed yeni dəyərləri qaytarır, audit jurnalında hazırlayan (A), təsdiqləyən (B) və hər iki vaxt qeyd olunur.
4. **Given** təsdiq gözləyən vərəq, **When** B onu səbəb yazaraq geri qaytarır, **Then** vərəq public tərəfə çıxmır, A səbəbi görür və düzəldib yenidən göndərə bilir.
5. **Given** artıq dərc olunmuş vərəq, **When** A həmin gün üçün düzəliş göndərir, **Then** public tərəfdə köhnə təsdiqlənmiş dəyərlər qalır. Düzəliş yalnız başqa istifadəçi onu təsdiqlədikdən sonra public tərəfə keçir.
6. **Given** dərc olunmuş vərəq, **When** A onun silinməsini tələb edir, **Then** vərəq dərhal silinmir. Silinmə yalnız başqa istifadəçinin təsdiqindən sonra baş verir.
7. **Given** təsdiq gözləyən vərəq, **When** A onu hələ təsdiqlənməmişkən redaktə edir, **Then** vərəq təsdiq gözləyən vəziyyətdə qalır. Artıq verilmiş təsdiq yoxdur, buna görə heç nə sıfırlanmır.
8. **Given** B vərəqi açıb baxır, **When** həmin anda A vərəqi dəyişir, **Then** B köhnə versiyanı təsdiqləyə bilmir. Təsdiq yalnız B-nin gördüyü versiyaya aiddir və versiya dəyişibsə rədd edilir.

---

### User Story 3 - Dağıdıcı və sistem səviyyəli əməliyyatlar yalnız xüsusi icazə ilə mümkündür (Priority: P2)

Bəzi əməliyyatlar tək bir redaktə deyil, saytın böyük hissəsinə və ya işləməsinə təsir edir: bütöv səhifə alt ağacının silinməsi, sistem ayarlarının yaradılması, dəyişdirilməsi və silinməsi, istifadəçi və rol idarəsi. Bu əməliyyatlar adi redaktə icazəsindən ayrı, yüksək səviyyəli icazə tələb edir. Sistem ayarları üçün yalnız əvvəlcədən tanınan açarlar qəbul olunur.

**Why this priority**: Bu əməliyyatlar tək başına saytı sındıra və ya böyük məzmun itkisi yarada bilər. Amma məzənnədən fərqli olaraq public maliyyə məlumatı deyil, soft-delete və audit ilə geri qaytarıla bilir. Buna görə P1-dən sonra gəlir.

**Independent Test**: Moderator ilə alt səhifələri olan və alt ağacı ilə birlikdə silinə bilən səhifə silinməyə çalışılır; əməliyyat rədd edilməlidir. Eyni əməliyyat admin ilə uğurlu olmalıdır. Admin ilə tanınmayan açarlı ayar yaratmaq cəhdi də rədd edilməlidir.

**Acceptance Scenarios**:

1. **Given** moderator və alt səhifələri olan, alt ağacla birlikdə silinə bilən səhifə, **When** moderator onu silməyə çalışır, **Then** əməliyyat rədd edilir və heç bir səhifə silinmir.
2. **Given** moderator və alt səhifəsi olmayan adi səhifə, **When** moderator onu silir, **Then** əməliyyat uğurla keçir (tək səhifə silmək adi məzmun icazəsidir).
3. **Given** admin, **When** o, alt ağacı olan səhifəni silir, **Then** alt ağac silinir və audit jurnalında silinən bütün səhifələrin siyahısı qeyd olunur.
4. **Given** admin, **When** o, sistemin tanımadığı açarla ayar yaratmağa çalışır, **Then** əməliyyat "naməlum ayar açarı" səbəbi ilə rədd edilir.
5. **Given** moderator, **When** o, mövcud ayarı dəyişməyə çalışır, **Then** əməliyyat rədd edilir.

---

### User Story 4 - Administrator kimin nə edə bildiyini görür və yoxlayır (Priority: P3)

Administrator hər rolun hansı icazələrə sahib olduğunu, hər istifadəçinin hansı rolda olduğunu oxuya bilir. Rədd edilmiş cəhdləri və məzənnə təsdiq tarixçəsini audit jurnalında süzə bilir. Login olmuş istifadəçi özünün effektiv icazələrini görür, bu da panelin lazımsız düymələri gizlətməsinə imkan verir.

**Why this priority**: Sistemin təhlükəsizliyi üçün şərt deyil, amma idarə və audit üçün lazımdır. Admin panelin sonrakı spec-də icazələrə uyğunlaşması da bu məlumata əsaslanacaq.

**Independent Test**: İstənilən rolda login olunur və "mənim icazələrim" sorğusu göndərilir. Cavab icazə matrisindəki həmin rol sətri ilə eyni olmalıdır.

**Acceptance Scenarios**:

1. **Given** login olmuş istənilən istifadəçi, **When** o, öz icazələrini soruşur, **Then** rolunun icazə kodlarının tam siyahısını alır.
2. **Given** admin, **When** o, rolların siyahısını icazələri ilə birlikdə soruşur, **Then** icazə matrisini alır.
3. **Given** admin, **When** o, audit jurnalını "rədd edilmiş cəhdlər" və ya "məzənnə təsdiqləri" üzrə süzür, **Then** müvafiq qeydləri actor, vaxt və obyektlə birlikdə görür.

---

### Edge Cases

- **Təsdiqləyən yoxdursa.** Təsdiq icazəsi olan ikinci aktiv istifadəçi yoxdursa, vərəq təsdiq gözləyən vəziyyətdə qalır. "Təcili yol" və ya özünü təsdiqləmə **yoxdur**. Sistem bunu gizlətmir: təsdiq gözləyən vərəqlərin siyahısında vərəqin nə qədər gözlədiyi görünür. Bunun təşkilati həlli (ən azı iki təsdiqləyənin olması) Assumptions bölməsindədir.
- **Hazırlayan hesabı silinib və ya deaktiv edilib.** Onun göndərdiyi, təsdiq gözləyən vərəq başqa istifadəçi tərəfindən təsdiqlənə və ya geri qaytarıla bilir. Hazırlayanın kimliyi audit-də qalır.
- **Eyni gün üçün ikinci göndəriş.** Həmin gün üçün artıq təsdiq gözləyən tələb varsa, yeni göndəriş onu əvəz edir. Köhnə tələb "əvəz olunub" vəziyyətinə keçir və tarixçədə qalır, yeni göndəriş isə yeni tələb olur. Hər gün üçün ən çox bir təsdiq gözləyən tələb olur.
- **Eyni vaxtda iki təsdiqləyən.** Vərəq yalnız bir dəfə təsdiqlənir. İkinci cəhd "artıq təsdiqlənib/qaytarılıb" cavabı alır.
- **Mövcud (miqrasiyadan əvvəlki) məzənnələr.** Bu dəyişiklik deploy olunanda bazada olan bütün vərəqlər təsdiqlənmiş sayılır. Public sayt və feed heç bir tarixi dəyəri itirmir.
- **Rolu olmayan və ya naməlum rolda istifadəçi.** Heç bir icazəsi yoxdur. Login ola bilər, amma heç bir əməliyyat edə bilməz.
- **Rol dəyişikliyi və aktiv sessiya.** İstifadəçinin rolu endiriləndə və ya hesabı deaktiv ediləndə köhnə icazələr növbəti sorğuda qüvvədən düşür (spec 020 davranışı).
- **Oxuma əməliyyatları.** Siyahı və detal oxumaları da icazəyə bağlıdır. MEAS manager-in məzmun modullarının siyahılarını görməsinə ehtiyac yoxdur. Bir modulun forması başqa modulun soraqçasını (məs. valyuta adları, qanun kateqoriyaları) oxuyursa, həmin soraqçanın oxunması o modulun rollarına verilir. Hazırda belə hər soraqça onu istifadə edən rolun öz `read` icazəsinin içindədir, ona görə "hamıya açıq" soraqça yoxdur. Yeganə istisna istifadəçinin öz icazələrinin siyahısıdır (FR-007).
- **Media.** Media yükləmək həm məzmun, həm MEAS redaktoru üçün lazımdır. Yükləmə hər iki rolun icazəsidir. Başqasının yüklədiyi mediyanı silmək isə məzmun icazəsidir.
- **Tanınmayan ayar açarları artıq bazada varsa.** Oxunmağa davam edir və admin onları silə bilir. Yalnız yeni naməlum açar yaratmaq qadağandır.

## Requirements *(mandatory)*

### Functional Requirements

**İcazə modeli**

- **FR-001**: Sistem admin API-nin hər əməliyyatını (oxuma, yaratma, redaktə, dərc, silmə, təsdiq) `<modul>.<əməliyyat>` formatlı adlandırılmış icazəyə bağlamalıdır, məsələn `pages.delete_subtree` və ya `currency_rates.approve`. İcazəyə bağlanmamış əməliyyat qeyri-admin istifadəçilər üçün default olaraq qadağan olmalıdır.
- **FR-002**: İcazə kataloqu və rol → icazə xəritəsi hər mühitdə eyni olmalıdır. Onlar yeni deploy zamanı avtomatik tətbiq olunmalı, mövcud bazada təkrar tətbiq zərərsiz olmalıdır. Mühitdə tətbiq oluna bilmirsə (məsələn, DB hüququ çatışmır), sistem fail-closed işləməlidir: admin-dən başqa heç kim heç bir əməliyyat edə bilmir, bu hal startup-da xəta kimi loglanır, belə deploy isə qəbul edilmiş sayılmır.
- **FR-003**: Sistem hər sorğuda istifadəçinin effektiv icazələrini yoxlamalı və icazəsiz əməliyyatı heç bir verilənə toxunmadan "icazə yoxdur" cavabı ilə rədd etməlidir. Bu cavab "login olunmayıb" cavabından fərqli olmalıdır.
- **FR-004**: Rədd edilmiş hər cəhd audit jurnalına yazılmalıdır: kim, hansı əməliyyat, hansı obyekt, nə vaxt, haradan.
- **FR-005**: Rol dəyişikliyi və hesabın deaktiv edilməsi istifadəçinin növbəti sorğusunda qüvvəyə minməlidir. Bu, spec 020-nin artıq təmin etdiyi davranışdır və bu feature onu zəiflətməməlidir.
- **FR-006**: İlkin rol → icazə matrisi aşağıdakı kimi olmalıdır. Hər modul üçün dəqiq icazə siyahısını plan mərhələsi çıxarır, amma bu sərhədləri pozmamalıdır:
  - **admin**: bütün icazələr, o cümlədən istifadəçi idarəsi, sistem ayarları, səhifə alt ağacının silinməsi, məzənnə hazırlanması və təsdiqi. Four-eyes qaydası (FR-011) admin-ə də şamil olunur.
  - **moderator** (məzmun redaktoru): bütün məzmun modullarında oxuma, yaratma, redaktə, dərc və tək qeydin silinməsi; media yükləmə. Məzmun modulları səhifələr, xəbərlər/press-relizlər, bannerlər, qalereyalar, videolar, qanunlar, homepage blokları, info və running line-lar, pul nişanları, təşkilat strukturu və s.-dir. Moderator məzənnə vərəqini **hazırlaya** bilir: göndərə, düzəliş və silmə tələbi yarada bilir (legacy paritet, orada da moderator məzənnəni redaktə edirdi). Moderator istifadəçiləri, sistem ayarlarını, səhifə alt ağacının silinməsini və məzənnə **təsdiqini** edə bilmir. Məzənnə üçün ayrıca rol yaradılmır.
  - **meas_manager**: yalnız MEAS modulları (MEAS sənədləri və soraqçaları), üstəlik media yükləmə.
- **FR-007**: Login olmuş istifadəçi öz effektiv icazə kodlarının siyahısını ala bilməlidir. Admin bütün rolları icazələri ilə birlikdə oxuya bilməlidir.
- **FR-008**: Rol → icazə xəritəsinin administrator interfeysi ilə redaktəsi bu spec-in əhatəsində deyil. Xəritə FR-002-dəki kimi versiyalanmış şəkildə, yalnız deploy ilə dəyişdirilir. Admin matrisi oxuya bilir (FR-007), amma dəyişə bilmir. *(2026-10-09: 1a-nın 13 SP qiyməti seed + yoxlama üzərində qurulub, redaktə ekranı onda nəzərdə tutulmayıb. Ona görə default olaraq bağlandı.)*

**Four-eyes təsdiq axını**

- **FR-009**: Four-eyes təsdiqi rəsmi valyuta məzənnə vərəqlərinə şamil olunmalıdır. Digər rəsmi maliyyə məlumatları (AZIR, gəlirlilik əyriləri, inflyasiya) bu spec-in əhatəsində deyil. Onlara eyni axın sonrakı spec-də tətbiq oluna bilər, ona görə təsdiq axını yalnız məzənnəyə bağlı qurulmamalıdır. *(2026-10-09: 1b-nin 8 SP qiyməti yalnız məzənnəni əhatə edir. Ona görə default olaraq bağlandı.)*
- **FR-010**: Məzənnə vərəqinin göndərilməsi, dərc olunmuş vərəqin düzəldilməsi və silinməsi dərhal qüvvəyə minməməlidir. Hər biri "təsdiq gözləyən" tələb yaratmalıdır. Bunların hamısı, səbəbli geri qaytarma (FR-012) və versiya yoxlaması (FR-014) da daxil olmaqla, 1b-nin əhatəsindədir.
- **FR-011**: Tələbi göndərən istifadəçi onu təsdiqləyə bilməməlidir. Bu qayda rolundan asılı olmayaraq, admin də daxil olmaqla, hamıya şamil olunur və heç bir parametrlə söndürülə bilmir.
- **FR-012**: Təsdiq icazəsi olan başqa istifadəçi tələbi təsdiqləyə və ya məcburi səbəb yazaraq geri qaytara bilməlidir.
- **FR-013**: Təsdiq gözləyən və geri qaytarılmış vərəqlər public sayta və tarixi XML feed-inə heç vaxt çıxmamalıdır. Düzəliş gözləyən günlər üçün public tərəf son təsdiqlənmiş dəyərləri göstərməyə davam etməlidir. XML feed-in formatı dəyişməməlidir.
- **FR-014**: Təsdiq konkret versiyaya aid olmalıdır. Təsdiqləyən vərəqi açandan sonra vərəq dəyişibsə, təsdiq rədd edilməlidir.
- **FR-015**: Hər tələb üçün sistem bunları saxlamalı və audit-də göstərməlidir: hazırlayan, hazırlanma vaxtı, təsdiqləyən/geri qaytaran, qərar vaxtı, qaytarılma səbəbi, dəyişiklikdən əvvəlki və sonrakı dəyərlər.
- **FR-016**: Təsdiq icazəsi olan istifadəçilər təsdiq gözləyən tələblərin siyahısını görə bilməlidir: gün, hazırlayan, göndərilmə vaxtı, tələb növü (yeni / düzəliş / silmə).
- **FR-017**: Hər gün üçün eyni anda ən çox bir təsdiq gözləyən tələb olmalıdır. Həmin gün üçün yeni göndəriş gözləyən tələbi əvəz etməlidir.
- **FR-018**: Bu dəyişiklik tətbiq olunanda mövcud bütün məzənnə vərəqləri təsdiqlənmiş sayılmalıdır. Public sayt və feed heç bir dəyəri itirməməlidir.

**Dağıdıcı və sistem əməliyyatları**

- **FR-019**: Səhifənin alt ağacı ilə birlikdə silinməsi ayrıca, yüksək səviyyəli icazə tələb etməlidir. Tək səhifənin silinməsi adi məzmun icazəsi olaraq qalır.
- **FR-020**: Sistem ayarlarının yaradılması, dəyişdirilməsi və silinməsi ayrıca icazə tələb etməlidir. Yeni ayar yalnız sistemin tanıdığı açarlar siyahısından yaradıla bilməlidir.
- **FR-021**: İstifadəçi idarəsi (siyahı, yaratma, redaktə, rol təyini, deaktiv etmə, silmə) yalnız admin icazəsi ilə mümkün olmalıdır. Bu, mövcud davranışdır və qorunmalıdır.

### Key Entities *(include if feature involves data)*

- **Rol (Role)**: istifadəçiyə təyin olunan vəzifə qrupu: `admin`, `moderator`, `meas_manager`, lazım olsa yeniləri. Hər istifadəçinin bir rolu var.
- **İcazə (Permission)**: bir modul üzərində bir əməliyyatın adlandırılmış hüququ (`<modul>.<əməliyyat>`) və qısa təsviri.
- **Rol–icazə bağlantısı**: hansı rolun hansı icazələrə sahib olduğunu göstərir. Versiyalanmış, hər mühitdə eynidir.
- **Məzənnə vərəqi (günlük)**: bir tarix üçün bütün valyutaların rəsmi, **təsdiqlənmiş** məzənnələri. Vərəqin özünün vəziyyəti yoxdur: o, yalnız təsdiqlənmiş dəyərləri saxlayır və public tərəf yalnız onu görür.
- **Məzənnə dəyişiklik tələbi**: vərəqin yaradılması (yeni), düzəldilməsi (düzəliş) və ya silinməsi üçün tələb. Vəziyyəti: təsdiq gözləyir / təsdiqlənib / geri qaytarılıb / əvəz olunub. Hazırlayanı, təsdiqləyəni, qərarı, qaytarılma səbəbi və əvvəl/sonra dəyərləri var. Hər göndəriş ayrıca tələbdir, ona görə tələbin özü versiya rolunu oynayır (FR-014).
- **Audit qeydi** (mövcud): əməliyyatın kim tərəfindən, nə vaxt, hansı obyekt üzərində edildiyi. Rədd edilmiş cəhdləri və təsdiq qərarlarını da əhatə edir.
- **Tanınan ayar açarı**: sistemin qəbul etdiyi ayar açarlarının siyahısı.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admin API-nin bütün yazma əməliyyatlarının 100%-i konkret icazəyə bağlıdır. Yalnız "login olmaq kifayətdir" prinsipi ilə qorunan heç bir yazma əməliyyatı qalmır. Bu, avtomatik inventar yoxlaması ilə təsdiqlənir.
- **SC-002**: İcazə matrisindəki hər (rol × əməliyyat) cütü üçün nəticə matrislə 100% uyğun gəlir. Rədd edilən cəhdlərin heç birində verilənlər dəyişmir.
- **SC-003**: Hazırlayanın öz məzənnə tələbini təsdiqləmə cəhdlərinin 100%-i rədd edilir, admin rolunda da.
- **SC-004**: Təsdiq gözləyən və ya geri qaytarılmış heç bir məzənnə dəyəri public saytda və ya XML feed-də görünmür. Təsdiqdən sonra dəyər növbəti public sorğuda görünür.
- **SC-005**: Deploy-dan sonra XML feed-in hər tarixi gün üçün cavabı deploy-dan əvvəlki cavabla bayt-bayt eynidir (FR-018, compat müqaviləsi).
- **SC-006**: Rədd edilmiş cəhdlərin 100%-i və məzənnə təsdiq qərarlarının 100%-i audit jurnalında actor, vaxt və obyektlə birlikdə tapılır.
- **SC-007**: Rolu endirilmiş və ya deaktiv edilmiş istifadəçinin köhnə icazələri onun növbəti sorğusunda işləməyi dayandırır.
- **SC-008**: Məzənnə hazırlayıcısı üçün gündəlik iş axını əlavə addım kimi yalnız "göndər" ilə məhdudlaşır. Təsdiqləyən üçün gözləyən vərəqi tapıb təsdiqləmək 1 dəqiqədən az çəkir.

## Assumptions

- Rol modeli "hər istifadəçinin bir rolu" olaraq qalır (mövcud sxem). Çoxrollu istifadəçi bu spec-in əhatəsində deyil.
- Təsdiq yalnız admin-ə aid olduğu üçün təşkilat ən azı iki aktiv admin saxlamağı öhdəsinə götürür. Bir admin yalnız moderatorların hazırladığı vərəqləri təsdiqləyə bilər. Admin-in özünün hazırladığı vərəqi isə yalnız ikinci admin təsdiqləyə bilər. Sistem təsdiqləyən çatışmazlığını texniki yolla (özünü təsdiqləmə, bypass) həll etmir.
- Four-eyes yalnız məzənnə kimi rəsmi məlumatlara aiddir. Adi məzmunun (xəbər, səhifə) redaksiya təsdiqi (draft → review → publish) bu spec-in əhatəsində deyil. Mövcud `Status` modeli olduğu kimi qalır.
- Son aktiv admin-in özünü deaktiv etməsi və ya rolunu endirməsi problemi (review bənd 6), brute-force/lockout (bənd 2) və username enumeration (bənd 3) ayrı spec-lərdə həll olunur. Bu spec onların həllini çətinləşdirməməlidir.
- Rol dəyişikliyinin növbəti sorğuda qüvvəyə minməsi spec 020-nin mexanizminə əsaslanır. Bu spec həmin mexanizmi yenidən qurmur, yalnız icazə yoxlamasının ona tabe olmasını təmin edir.
- Admin panelin (`web-cbar-admin-new`) yeni icazələrə uyğunlaşması, yəni düymələrin gizlədilməsi və təsdiq növbəsi ekranı, ayrıca spec-dir. Bu spec-dən sonra panelin bəzi düymələri icazəsiz istifadəçiyə "icazə yoxdur" xətası göstərə bilər. Bu, keçid dövründə qəbul edilir. Məzənnə ekranında isə bu spec-dən sonra vərəq göndərişi "təsdiq gözləyir" vəziyyətinə düşəcək. Panel bunu göstərməyə hazır olana qədər məzənnə hazırlayanları bu barədə xəbərdar etmək lazımdır.
- Legacy `web-cbar-admin` API-yə qoşulmağa davam etsə belə, eyni API qaydaları ona da şamil olunur. Onun ayrıca uyğunlaşdırılması planlaşdırılmır.
- Lokalda .NET SDK yoxdur. Yoxlama deploy olunmuş test mühitində aparılır.
