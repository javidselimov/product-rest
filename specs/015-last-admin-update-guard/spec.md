# Feature Specification: Son aktiv administratorun redaktə ilə itirilməsinin qarşısının alınması

**Feature Branch**: `015-last-admin-update-guard`

**Created**: 2026-10-05

**Status**: Draft

**Input**: User description: "6. Son admin özünü kilidləyə bilər. — 2 SP. Delete \"son aktiv admin\" halını yoxlayır (UsersController.cs:161), amma Update yoxlamır. Admin özünü IsActive=false edə və ya rolunu redaktora endirə bilər, sistemdə admin qalmır. SP izahı: mövcud yoxlamanı ortaq metoda çıxarıb Update-də də çağırmaq."

**Mənbə**: `api-admin-review.md`, task #6 (🔴, 2 SP).

**Əhatə olunan proyekt**: yalnız `api-cbar-admin` (istifadəçi idarəsi). Admin panel
(`product-rest/web-cbar-admin-new`), `api-cbar` və sxem **toxunulmur** — migration yoxdur,
`Cbar.Domain` dəyişmir, endpoint-in route-u və sorğu/cavab forması dəyişmir. Panelin istifadəçi
formu 409 cavabındakı `message`-i artıq formanın üstündə göstərir (research R4).

**`product-host` istinadı (Konstitusiya Maddə I.2)**: `admin/controllers/UsersController.php`
— `actionManage` (redaktə, rol daxil) və `actionChangeStatus` (aktiv/deaktiv)
(`business_logic/old_businesslogic.md` §7, istifadəçi idarəsi). Köhnə sistemdə **heç bir**
"son admin" qoruması yoxdur — nə silmədə, nə statusda, nə rolda. Yeni sistem silmədə bu
qorumanı artıq əlavə edib; bu spec onu redaktəyə də genişləndirir. Bu, paritetdən kənar,
qəsdən edilən sərtləşdirmədir.

**Paritet (İş axını qaydası 5)**:

| `product-host` davranışı | Yeni sistemdə (bu gün) | Bu spec-dən sonra |
|---|---|---|
| Admin istənilən istifadəçini (özü daxil) deaktiv edə bilir | Edə bilir | Son aktiv admin deaktiv edilə bilmir |
| Admin istənilən istifadəçinin rolunu dəyişə bilir | Dəyişə bilir | Son aktiv adminin rolu endirilə bilmir |
| Silmədə qoruma yoxdur | Son aktiv admin silinə bilmir | Dəyişmir |

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Son aktiv admin öz hesabını redaktə ilə əlçatmaz edə bilmir (Priority: P1)

Sistemdə yeganə aktiv administrator öz profilini istifadəçilər siyahısından açır və ya
təsadüfən "Aktiv" işarəsini götürür, ya da rolunu "Moderator"/"MEAS Manager"-ə dəyişib
saxlayır. Bu gün əməliyyat uğurlu olur: admin rolunda heç kim qalmır, istifadəçi idarəsi
(yaratma, parol sıfırlama, rol təyini) heç kimə əlçatan deyil və vəziyyəti yalnız
verilənlər bazasına birbaşa müdaxilə ilə düzəltmək olar. Bu spec-dən sonra belə dəyişiklik
izahlı mesajla rədd edilir və heç nə saxlanılmır.

**Why this priority**: Feature-in yeganə məqsədi budur; review-da 🔴 qeyd olunub. Nəticəsi
panelin idarəetmə funksiyasının tam itirilməsidir, bərpası isə DBA müdaxiləsi tələb edir.

**Independent Test**: Test mühitində yalnız bir aktiv admin olan vəziyyətdə həmin admin
öz hesabına (a) deaktivasiya, (b) rolun endirilməsi, (c) hər ikisi birlikdə tətbiq etməyə
cəhd edir. Hər cəhdin rədd edildiyi, mesajın göstərildiyi, hesabın dəyişmədiyi və adminin
sessiyasının davam etdiyi yoxlanılır.

**Acceptance Scenarios**:

1. **Given** sistemdə yalnız bir aktiv admin var, **When** o, öz hesabını deaktiv edib
   saxlayır, **Then** əməliyyat konflikt kimi rədd edilir, "son aktiv administrator"
   mənalı mesaj qaytarılır, hesab aktiv qalır və sessiyaları ləğv olunmur.
2. **Given** sistemdə yalnız bir aktiv admin var, **When** o, öz rolunu admin olmayan rola
   dəyişib saxlayır, **Then** əməliyyat eyni mesajla rədd edilir və rol dəyişmir.
3. **Given** rədd edilən sorğu digər sahələri də (məsələn email) dəyişirdi, **When** cavab
   qaytarılır, **Then** həmin sahələr də saxlanılmır — sorğu tam rədd olunur, qismən yox.
4. **Given** rədd edilən cəhd, **When** audit jurnalına baxılır, **Then** uğursuz cəhd üçün
   "dəyişiklik edildi" qeydi yaranmayıb.

---

### User Story 2 - Başqa aktiv admin olduqda adi redaktə əvvəlki kimi işləyir (Priority: P2)

Sistemdə ən azı iki aktiv admin var. Onlardan biri vəzifəsini dəyişir və öz rolunu
endirir, ya da digər admin onu deaktiv edir. Bu, normal idarəetmə əməliyyatıdır və heç bir
əlavə maneə olmadan uğurlu olmalıdır.

**Why this priority**: Qorumanın legitim əməliyyatları sındırmaması — reqressiyanın
qarşısını alır. P1 olmadan mənası yoxdur, amma ayrıca yoxlanılmalıdır.

**Independent Test**: İki aktiv admin olan vəziyyətdə birinin deaktivasiyası və rolunun
endirilməsi uğurlu olur; bundan sonra qalan yeganə admin üçün eyni cəhd rədd edilir.

**Acceptance Scenarios**:

1. **Given** iki aktiv admin var, **When** biri digərini (və ya özünü) deaktiv edir,
   **Then** əməliyyat uğurlu olur və deaktiv edilən hesabın sessiyaları bugünkü kimi ləğv olunur.
2. **Given** iki aktiv admin var, **When** biri öz rolunu moderatora endirir, **Then**
   əməliyyat uğurlu olur.
3. **Given** US2.1 və ya US2.2-dən sonra bir aktiv admin qalıb, **When** onun deaktivasiyası
   və ya rolunun endirilməsi cəhd edilir, **Then** US1-dəki kimi rədd edilir.
4. **Given** son aktiv admin, **When** onun yalnız email-i dəyişdirilir (rol admin, status
   aktiv qalır), **Then** əməliyyat uğurlu olur — qoruma yalnız admin statusunu itirən
   dəyişikliklərə tətbiq olunur.

---

### Edge Cases

- **Artıq deaktiv olan admin**: deaktiv admin hesabının redaktəsi (rolu endirmək, deaktiv
  saxlamaq) qorumaya düşmür — o, onsuz da "aktiv admin" sayılmır. Silmə ilə eyni qayda.
- **Deaktiv admini yenidən aktivləşdirmək** və ya istifadəçiyə admin rolu vermək həmişə
  icazəlidir — bu, aktiv adminlərin sayını artırır.
- **Silinmiş (soft-delete) admin hesabları** "digər aktiv admin" kimi sayılmır.
- **Kilidlənmiş admin** (spec 012, müvəqqəti login kilidi): hesab aktiv və admin roludur,
  ona görə "digər aktiv admin" kimi sayılır — kilid müvəqqətidir və parol sıfırlama ilə açılır.
  Silmədəki mövcud qayda ilə eyni.
- **Eyni anda iki admin bir-birini deaktiv edir**: hər iki yoxlama digərini hələ aktiv görə
  bilər və sistem adminsiz qala bilər. Bu yarış silmədə də mövcuddur; 2 SP-lik bu dəyişikliyin
  əhatəsindən kənardır (bax Assumptions).
- **Mesaj**: silmədəki mesajla eyni mənada, amma əməliyyata uyğun — "son aktiv administratoru
  deaktiv etmək və ya rolunu dəyişmək olmaz".

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: İstifadəçi redaktəsi nəticəsində hədəf hesab aktiv admin statusunu itirəcəksə
  (deaktivasiya, admin olmayan rola keçid və ya hər ikisi) və sistemdə ondan başqa aktiv,
  silinməmiş admin yoxdursa, əməliyyat konflikt kimi rədd edilməlidir.
- **FR-002**: Rədd edilən redaktədə heç bir sahə saxlanılmamalı, audit jurnalına "dəyişiklik"
  qeydi yazılmamalı və hədəfin sessiyaları ləğv olunmamalıdır.
- **FR-003**: Rədd cavabı istifadəçiyə göstəriləcək, səbəbi aydın izah edən mesaj
  daşımalıdır; cavab forması silmədəki "son aktiv admin" cavabı ilə eyni olmalıdır.
- **FR-004**: "Başqa aktiv admin var" qərarı silmə və redaktə üçün eyni qayda ilə verilməlidir
  (eyni say meyarları: aktiv, silinməmiş, admin rolu, hədəfin özü istisna) — qayda bir yerdə
  müəyyən olunmalı və hər iki əməliyyat onu istifadə etməlidir.
- **FR-005**: Aktiv admin statusunu itirməyən redaktələr (email dəyişikliyi, admin rolu
  saxlanılaraq status aktiv qalır, deaktiv hesabın redaktəsi, aktivləşdirmə, admin rolu
  vermək) bugünkü kimi işləməlidir.
- **FR-006**: Silmədəki mövcud davranış (özünü silmə qadağası, son aktiv admin qoruması,
  mesajlar) dəyişməməlidir.
- **FR-007**: Sxem dəyişməməli, migration tələb olunmamalıdır; endpoint-in route-u və uğurlu
  cavab forması dəyişməməlidir. OpenAPI spec-də redaktə əməliyyatı üçün yeni 409 hal sənədləşdirilməlidir.

### Key Entities *(include if feature involves data)*

- **İstifadəçi**: email, rol, aktivlik statusu, silinmə işarəsi. "Aktiv admin" = aktiv,
  silinməmiş, admin rollu istifadəçi.
- **Rol**: `admin`, `moderator`, `meas_manager`. Yalnız `admin` istifadəçiləri idarə edə bilər.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Test mühitində yeganə aktiv admin üçün deaktivasiya, rolun endirilməsi və hər
  ikisinin birlikdə cəhdinin 3/3-ü rədd edilir; hər cəhddən sonra sistemdə aktiv admin sayı 1 qalır.
- **SC-002**: Ən azı iki aktiv admin olduqda bu üç əməliyyatın 3/3-ü uğurlu olur (reqressiya yoxdur).
- **SC-003**: Rədd edilən hər cəhddən sonra hədəf hesabın bütün sahələri cəhddən əvvəlki
  vəziyyətlə eynidir və həmin cəhd üçün audit jurnalında dəyişiklik qeydi yoxdur.
- **SC-004**: Admin paneldə rədd cəhdi zamanı istifadəçi səbəbi izah edən mesaj görür
  (generik "server xətası" yox).
- **SC-005**: Silmə əməliyyatının mövcud qorumaları üçün əvvəlki ssenarilər eyni nəticəni verir.

## Assumptions

- Qayda hədəfin kim olmasından asılı deyil (özü və ya başqası). Praktikada son aktiv admini
  yalnız özü redaktə edə bilər (istifadəçi idarəsi yalnız adminlərə açıqdır), amma qayda
  hədəfin vəziyyətinə əsaslanır, çağıranın kimliyinə yox — silmədəki kimi.
- Silmədəki "özünü silmək olmaz" qadağasının redaktə analoqu (admin özünü heç vaxt deaktiv
  edə bilməsin) əlavə edilmir: başqa aktiv admin varsa özünü endirmək legitim əməliyyatdır.
- Eyni anda iki paralel redaktə/silmə arasındakı yarış (hər ikisi digərini aktiv görür)
  qəbul edilən risk kimi əhatədən kənardır: çox nadir, admin sayı az, silmədə də eyni hal var.
  Lazım olarsa ayrıca task kimi (kilid və ya ardıcıllaşdırma) götürülə bilər.
- Rədd cavabı silmədəki ilə eyni status (409) və `{ message }` formasıdır; panelin istifadəçi
  formu bu mesajı artıq göstərir, ona görə panel dəyişikliyi gözlənilmir. Bunu `test`-də yoxlamaq SC-004-ün hissəsidir.
- Lokalda .NET SDK yoxdur; build GitLab pipeline-ında, yoxlama `test` mühitinə deploy
  olunduqdan sonra `curl` sorğuları və panel üzərindən aparılır (Konstitusiya Maddə VIII.1).
- Bir proyekt, sxem dəyişikliyi yoxdur — deploy sırası məsələsi yoxdur. Review-un "dərhal"
  qrupundakı digər task-larla (#5, #13, #8a) eyni `api-cbar-admin` MR-ında gedə bilər.
