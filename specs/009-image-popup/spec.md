# Feature Specification: Şəkilli popup (admin bölməsi + ictimai saytda popup)

**Feature Branch**: `009-image-popup`

**Created**: 2026-09-30

**Status**: Draft

**Input**: User description: "web-cbar-new-də video popup tətbiq olunub, amma bir də şəkilli popup olmasını istəyirəm. Əlavədəki kimi popup şəkillər olsun, hər dil üçün spesifik olaraq görünməlidir. Admin paneldə idarə edilə bilən olmalıdır: web-cbar-admin-new-də sidebar-da əlavə menyu olsun, klik olunduqda admindən əlavə olunmuş URL-ə keçid edilə bilsin, aktiv/deaktiv etmək olsun. İmplementasiya üçün video popup məntiqindən istifadə edilə bilər."

**Əhatə olunan proyektlər**: `api-cbar-admin` (yeni məzmun tipi + CRUD, migration),
`api-cbar` (yeni public oxuma endpoint-i), `web-cbar-admin-new`, `web-cbar-new`.
Yeni məzmun tipi olduğuna görə `Cbar.Domain` hər iki API-də eyni dəyişir (Maddə V.1).
Deploy sırası: `api-cbar-admin` → `api-cbar` → `web-cbar-admin-new` → `web-cbar-new` (Maddə II.3, IV.2).

**`product-host` istinadı (Konstitusiya Maddə I.2)**: `product-host`-da qarşılığı **yoxdur**.
Bu, yeni funksionallıqdır, heç bir Yii2 controller və ya model-i əvəz etmir.
`Banners` (`admin/controllers/BannersController.php`, `common/models/Banners.php`) ayrı
funksiyadır: ana səhifədə link zolağıdır. Dəyişmir və bu feature ilə birləşdirilmir.

**Nümunə (istifadəçinin göndərdiyi ekran şəkli, test.cbar.az, 2026-09-30)**:
- **Arxa fon:** səhifə tünd yarımşəffaf qatla örtülür.
- **Popup:** ekranın ortasında yalnız şəkil var: "2024-2026-cı illərdə maliyyə sektorunun inkişaf Strategiyası"nın 2025-ci il üzrə icra statusu".
  - Başlıq zolağı, çərçivə mətni və düymə yoxdur. Bütün mətn şəklin öz içindədir.
  - Şəkil üfüqidir, təxminən 2:1 proporsiyada. Kənarları azca yuvarlaqdır.
  - Masaüstündə ekran eninin təxminən üçdə birini tutur.
- **Bağlama düyməsi:** şəklin sağ yuxarı küncünün içində kiçik, dairəvi, ağ fonlu "×" düyməsi.
- **Klik:** şəklə klik edəndə redaktorun verdiyi ünvan açılır.

**Video popup-dan (spec 006) təkrar istifadə olunan davranış**:
- Popup sessiyada ilk açılan səhifədə avtomatik açılır (hansı səhifə olursa olsun).
- Bağlanma **sessiya boyu** yadda saxlanılır: bağlanandan sonra heç bir səhifədə avtomatik açılmır (clarification 2026-10-22).
- Yeni popup əlavə olunanda əvvəlki bağlanmalar ona təsir etmir.
- Popup məlumatı serverdə alınır, brauzer API-yə birbaşa müraciət etmir.

## User Scenarios & Testing *(mandatory)*

### User Story 1: Redaktor şəkilli popup-ı idarə edir (Priority: P1)

Redaktor admin panelin sidebar-ında "Şəkilli popup-lar" bəndinə keçir. Hər dil (az/en)
üçün ayrıca şəkil, keçid ünvanı və alternativ mətn daxil edir. Sonra yazını aktiv edir.
Siyahıda hər yazının başlığı, şəkil faylının adı, yaradılma və yenilənmə vaxtı və statusu görünür.
Status siyahıdan birbaşa dəyişdirilir.

**Why this priority**: Admin idarəsi olmadan ictimai saytda göstəriləcək heç nə yoxdur.

**Independent Test**: Admin paneldə yazı yaratmaq, redaktə etmək, aktiv/deaktiv etmək
və silmək olar. Saytın özünə ehtiyac yoxdur.

**Acceptance Scenarios**:

1. **Given** redaktor yeni yazı formasındadır, **When** az üçün şəkil və keçid, en üçün isə yalnız şəkil daxil edib saxlayır, **Then** yazı saxlanılır. En-də keçid boş qalır və bu xəta sayılmır.
2. **Given** heç bir dildə şəkil seçilməyib, **When** redaktor saxlamağa çalışır, **Then** forma saxlanmır və "ən azı bir dildə şəkil tələb olunur" xətası göstərilir.
3. **Given** keçid ünvanı `http://`, `https://` və ya `/` ilə başlamır, **When** saxlanılır, **Then** forma saxlanmır və xəta mesajı göstərilir.
4. **Given** siyahıda aktiv yazı var, **When** redaktor status düyməsini sıxır, **Then** yazı qeyri-aktiv olur, siyahı yenilənir və popup saytda artıq görünmür.
5. **Given** redaktor yazını silir, **When** təsdiqləyir, **Then** yazı siyahıdan və saytdan yox olur.

---

### User Story 2: Ziyarətçi öz dilində şəkilli popup görür (Priority: P1)

Aktiv popup olanda ziyarətçi hansı səhifəni açırsa açsın, cari dil üçün yüklənmiş
şəkil popup-da görünür. Şəklə klik edəndə həmin dil üçün verilmiş ünvana keçid olur.

**Why this priority**: Feature-in əsas dəyəri budur: elanı ziyarətçiyə öz dilində çatdırmaq.

**Independent Test**: Admin API-də (və ya seed-də) aktiv yazı olanda sayt açılır.
Popup-ın dilə görə göstərilməsi, keçid və bağlanma qaydası yoxlanılır.

**Acceptance Scenarios**:

1. **Given** aktiv popup-ın az və en şəkilləri fərqlidir, **When** ziyarətçi `/az/...` səhifəsini açır, **Then** az şəkli görünür. `/en/...`-də isə en şəkli görünür.
2. **Given** aktiv popup-da yalnız az şəkli var, **When** ziyarətçi `/en/...` səhifəsini açır, **Then** popup açılmır. Az şəkli en dilində göstərilmir.
3. **Given** cari dil üçün keçid ünvanı var, **When** ziyarətçi şəklə klik edir, **Then** həmin ünvan açılır. Xarici ünvan yeni tabda, saytın öz səhifəsi eyni tabda açılır.
4. **Given** cari dil üçün keçid ünvanı yoxdur, **When** ziyarətçi şəklə klik edir, **Then** heç nə baş vermir. Şəkil klik edilən element kimi görünmür.
5. **Given** ziyarətçi popup-ı bağlayıb, **When** eyni səhifəni refresh edir, **Then** popup açılmır.
6. **Given** ziyarətçi popup-ı bir səhifədə bağlayıb, **When** başqa səhifəyə və ya başqa dilə keçir, **Then** popup açılmır.
7. **Given** yeni tab və ya yeni brauzer sessiyası, **When** səhifə açılır, **Then** popup yenidən açılır.
8. **Given** ziyarətçi şəklə klik edib keçid edib, **When** hədəf səhifə və ya sonrakı səhifələr açılır, **Then** popup açılmır. Keçid bağlanma sayılır.
9. **Given** popup bu sessiyada bağlanıb, **When** redaktor başqa popup aktiv edir, **Then** yeni popup açılır.
10. **Given** aktiv popup yoxdur, **When** hər hansı səhifə açılır, **Then** popup görünmür və səhifə normal işləyir.

---

### User Story 3: Şəkilli popup və canlı yayım popup-ı birlikdə (Priority: P2)

Eyni anda həm aktiv canlı yayım, həm də aktiv şəkilli popup ola bilər. Ziyarətçi
ekranda eyni anda iki popup görməməlidir.

**Why this priority**: Bu hal nadir olur, amma baş verəndə səhifə istifadəyə yararsız olur.

**Independent Test**: Hər iki növdə aktiv yazı var. Səhifə açılanda və popup-lar
bağlananda nə göründüyü yoxlanılır.

**Acceptance Scenarios**:

1. **Given** həm canlı yayım, həm də şəkilli popup aktivdir, **When** ziyarətçi səhifəni ilk dəfə açır, **Then** əvvəl canlı yayım popup-ı açılır. Şəkilli popup yalnız o bağlanandan sonra açılır. Ekranda eyni anda bir popup olur.
2. **Given** ziyarətçi bu sessiyada canlı yayımı əvvəl bağlayıb, **When** səhifəni refresh edir, **Then** yalnız şəkilli popup açılır (əgər o da bağlanmayıbsa).

### Edge Cases

- **Bir neçə aktiv yazı**: ən son aktiv edilən və ya yaradılan göstərilir. Qalanları göstərilmir (Q1).
- **Şəkil faylı tapılmır və ya yüklənmir**: popup boş çərçivə göstərmir. Ya açılmır, ya da açıq idisə bağlanır. Səhifə normal işləyir.
- **sessionStorage əlçatan deyil** (private mode, bloklanmış storage): popup çıxır və bağlanır, amma bağlanma yadda saxlanmır. Xəta atılmır (006 ilə eyni).
- **API xətası**: popup göstərilmir, səhifə normal render olunur.
- **Çox böyük və ya uzun şəkil**: şəkil ekrana sığacaq şəkildə, proporsiyası saxlanaraq kiçildilir. Mobil ekranda kəsilmir və popup ekrandan kənara çıxmır.
- **Klaviatura və ekran oxuyucu**: popup Esc ilə və bağlama düyməsi ilə bağlanır, fokus popup daxilində qalır. Şəklin alternativ mətni oxunur. Alternativ mətn boşdursa, şəkil dekorativ sayılır.
- **Yazı redaktə olunur** (şəkil və ya keçid dəyişir): bu sessiyada artıq bağlanmış popup yenidən açılmır. Yalnız **başqa** yazı aktiv ediləndə açılır.

## Requirements *(mandatory)*

### Functional Requirements

**Admin panel**

- **FR-001**: Admin panelin sidebar-ında ayrıca "Şəkilli popup-lar" bəndi olmalıdır. O, siyahı, yaratma, redaktə və silmə ekranlarını açır.
- **FR-002**: Hər yazı üçün hər dildə (az, en) ayrıca şəkil, keçid ünvanı və alternativ mətn daxil edilir. Bir dildə dolu, digərində boş ola bilər.
- **FR-003**: Yazı saxlanmaq üçün ən azı bir dildə şəkil olmalıdır.
- **FR-004**: Keçid ünvanı istəyə bağlıdır. Doludursa, `http://`, `https://` (xarici) və ya `/` (saytın öz səhifəsi) ilə başlamalıdır.
- **FR-005**: Şəkil mövcud media yükləmə mexanizmi ilə yüklənir. Yalnız şəkil formatları (JPG, PNG, WebP, GIF, SVG) qəbul edilir.
- **FR-006**: Siyahıda bu sütunlar olur: başlıq, şəkil faylının adı (az, yoxdursa en), hansı dillərdə şəkil olduğu, yaradılma vaxtı, yenilənmə vaxtı, status. Status siyahıdan birbaşa dəyişdirilir. Thumbnail önizləməsi əhatədən kənardır (plan, research R5).
- **FR-007**: Admin tərəfdə hər yaratma, redaktə, status dəyişikliyi və silmə audit jurnalına düşür.
- **FR-008**: Başlıq yalnız admin siyahısında tanımaq üçündür. Saytda göstərilmir.

**İctimai sayt**

- **FR-009**: Sayt aktiv popup-ı serverdə alır. Brauzer bu məlumat üçün API-yə müraciət etmir.
- **FR-010**: Popup yalnız cari dil üçün şəkil olanda göstərilir. Bir dilin şəkli heç vaxt digər dildə göstərilmir.
- **FR-011**: Popup sessiyada ilk açılan səhifədə avtomatik açılır. Bağlananda `sessionStorage`-ə `cbar:image-popup:dismissed:<popupId>` = `1` yazılır. Qeyd varsa, popup sessiya boyu heç bir səhifədə avtomatik açılmır. Qeyd başqa popup-lara təsir etmir (006 FR-005 ilə eyni qayda, ayrıca açar ilə).
- **FR-012**: Şəklə klik edəndə cari dilin keçid ünvanı açılır. Xarici ünvan yeni tabda, saytın öz səhifəsi eyni tabda açılır. Keçid popup-ı bağlanmış sayır.
- **FR-013**: Canlı yayım popup-ı ilə eyni anda açılmır. Canlı yayımın üstünlüyü var (US3).
- **FR-014**: Popup-ın bütün interfeys mətnləri (bağla düyməsi, ekran oxuyucu etiketləri) hər iki dildə tərcümə olunub (Maddə V.4).
- **FR-015**: Public tərəfə yalnız aktiv yazılar çıxır (Maddə III.3).
- **FR-016**: Popup görünüşü nümunəyə uyğundur:
  - popup-da yalnız şəkil var: başlıq zolağı, dialoq mətni və əlavə düymə yoxdur;
  - bağlama düyməsi şəklin sağ yuxarı küncündə kiçik dairəvi "×" düyməsidir;
  - arxa fon qaralır;
  - arxa fona klik etmək və Esc düyməsi popup-ı bağlayır, bu da bağlanma sayılır (FR-011).
- **FR-017**: Şəkil proporsiyası saxlanılır. Masaüstündə popup-ın eni şəklin öz eni ilə məhdudlaşır və ekran eninin təxminən yarısından çox olmur. Mobil ekranda popup ekran eninə kənar boşluqlarla sığır. Hündür şəkil ekran hündürlüyünü aşmır.

### Key Entities

- **Şəkilli popup**: saytda popup kimi göstərilən bir elan. Atributları: status (aktiv/deaktiv), admin üçün başlıq, yaradılma və yenilənmə vaxtı, yaradan istifadəçi.
- **Şəkilli popup tərcüməsi**: popup-ın bir dil üçün məzmunu. Atributları: dil (az/en), şəkil (media faylına istinad), keçid ünvanı (istəyə bağlı), alternativ mətn (istəyə bağlı). Hər popup üçün hər dildə ən çox bir tərcümə olur.

## Clarifications

### Session 2026-09-30

- Q1 (bir neçə aktiv popup): **Yalnız ən sonuncu göstərilir.** Ən son aktiv edilən və ya yaradılan yazı seçilir. Slayder və ya növbə yoxdur.
- Q2 (canlı yayımla birgə): **Əvvəl canlı yayım açılır.** Şəkilli popup yalnız canlı yayım bağlanandan sonra və ya o bu səhifədə artıq bağlanıbsa açılır (US3).

### Session 2026-10-22

- Q3 (bağlanmanın əhatəsi): **Sessiya boyu, səhifədən asılı olmayaraq.** Popup hər yeni səhifədə yenidən çıxması narahatlıq yaradırdı. Bağlanandan sonra həmin sessiyada heç bir səhifədə avtomatik açılmır; açar `<popupId>` ilə qalır, ona görə yeni popup yenə çıxır. Qeyd yalnız bağlananda yazılır: bağlamadan refresh edilsə popup yenidən çıxır. Q2-dəki "bu səhifədə" bundan sonra "bu sessiyada" deməkdir.

## Deviations

- **D-1 (sessionStorage)**: 006-dakı D-1 ilə eyni əsasla. Saxlanan yeganə məlumat həssas olmayan "popup bu sessiyada bağlandı" bayrağıdır. Maddə X.3 pozulmur.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Redaktor yeni şəkilli popup-ı (iki dildə şəkil və keçid) 2 dəqiqədən az vaxtda yaradıb aktiv edə bilir.
- **SC-002**: Aktiv edilən və ya deaktiv edilən popup saytda ən çox 60 saniyə ərzində əks olunur. Bu, saytın bütün məzmunu üçün razılaşdırılmış keş həddidir (spec 003).
- **SC-003**: US2 və US3-ün bütün ssenariləri avtomatik testlərlə əhatə olunub və brauzerdə əl ilə təsdiqlənib (az və en, masaüstü və mobil).
- **SC-004**: 100% hallarda bir dilin şəkli digər dildə göstərilmir.
- **SC-005**: Aktiv popup olmayanda ziyarətçinin gördüyü səhifə bu feature-dən əvvəlki ilə eynidir: heç bir boş çərçivə və ya gecikmə olmur.
- **SC-006**: Hər iki frontend-in keyfiyyət qapısı (`npm run verify`) keçir. API dəyişiklikləri test mühitində build olunub endpoint-lər əl ilə yoxlanılır (lokalda .NET SDK yoxdur).

## Assumptions

- Popup-dakı mətn (başlıq, tarix və s.) redaktor tərəfindən şəklin içinə yerləşdirilir. Buna görə hər dil üçün ayrıca şəkil lazımdır. Sayt şəklin üstünə mətn yazmır.
- Popup canlı yayım popup-ı ilə eyni dialoq komponentindən istifadə edə bilər, amma görünüşü FR-016-a uyğundur. Canlı yayımdakı başlıq zolağı burada yoxdur.
- Nümayiş tarix aralığı (başlama və bitmə) yoxdur. Popup yalnız aktiv/deaktiv status ilə idarə olunur, istifadəçi yalnız bunu istəyib.
- Popup ziyarətçinin hansı səhifədən gəldiyindən asılı olmayaraq bütün səhifələrdə göstərilir, canlı yayımla eyni. Səhifə üzrə hədəfləmə əhatədən kənardır.
- Klik statistikası və ya baxış sayğacı əhatədən kənardır.
- Admin panelin mövcud rol və icazə modeli (spec 008 daxil) yeni bölməyə digər məzmun bölmələri kimi tətbiq olunur. Ayrıca icazə növü yaradılmır.
- Canlı yayım popup-ının mövcud davranışı dəyişmir, yalnız şəkilli popup ilə növbələşmə əlavə olunur.
