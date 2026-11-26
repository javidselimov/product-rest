# Feature Specification: Admin login-də brute-force qoruması (lockout, rate limit, lock oracle)

**Feature Branch**: `012-login-brute-force-protection`

**Created**: 2026-10-02

**Status**: Draft

**Input**: User description: "2. Brute-force qoruması yoxdur. — 5 SP. User.FailedLogins və LockedUntil sahələri var, amma heç yerdə yazılmır — yalnız oxunur. Yəni lockout işləmir. Login-də rate limiter də yoxdur (Program.cs-də AddRateLimiter yoxdur). Üstəlik lock yoxlaması (AuthController.cs:47) parol yoxlamasından sonra gəlir. "Account temporarily locked" cavabı parolun doğru olduğunu açıq deyir, yəni oracle-dır. SP izahı: kod azdır (counter, lock, AddRateLimiter, yoxlamanın yerini dəyişmək), amma bütün ssenariləri (lock, kilidin açılması, uğurlu girişdə sıfırlama, limiter) əl ilə yoxlamaq lazımdır. #5 bitmədən IP əsaslı limiter hamını bir IP kimi görəcək — əvvəl #5 edilməlidir."

**Mənbə**: `api-admin-review.md`, task #2 (🔴, 5 SP). Əlaqəli: #3 (timing,
`specs/011-login-timing-enumeration` — bitib), #5 (`UseForwardedHeaders` — IP limiti ondan
sonra ayrıca gəlir, bax Clarifications).

**Əhatə olunan proyekt**: əsasən `api-cbar-admin` (login endpoint-i və istifadəçi idarəsində
kilidin sıfırlanması). Uğursuz cəhd sayğacı və kilid vaxtı üçün sahələr `users` cədvəlində artıq
var; plan mərhələsində 10 dəqiqəlik pəncərə üçün bir nullable sütun əlavə olundu (research R1),
ona görə `Cbar.Domain` hər iki API-də dəyişir — `api-cbar` üçün yalnız entity sətri olan ayrıca
iş paketi. Admin panel (`web-cbar-admin-new`) tərəfində yalnız "çox sorğu" mesajı üçün kiçik,
ayrıca iş paketi var (FR-013); legacy `web-cbar-admin` toxunulmur.

**`product-host` istinadı (Konstitusiya Maddə I.2)**: `admin/controllers/LoginController.php` +
`admin/viewmodels/LoginViewModel.php` (`business_logic/old_businesslogic.md` §7.1). Köhnə
sistemdə: kilid yoxlaması parol yoxlamasından **əvvəl** gəlir; IP üzrə 60 s-də 10, istifadəçi
üzrə 120 s-də 10 cəhd rate limiti; 2 uğursuz cəhddən sonra CAPTCHA; artan kilid (5 → 60 s,
10 → 180 s, 15 → 300 s, 20 → 900 s, sayğac 10 dəqiqə yaşayır); kilid anında bütün sessiyalar
ləğv olunur; uğurlu girişdə sayğaclar sıfırlanır; xəta mesajı generikdir. Yeni sistem bunların
hamısını itirib (səssiz itki, Maddə I.3); bu feature əsas hissəsini bərpa edir.

**Paritet (İş axını qaydası 5)** — `LoginController` / `LoginViewModel`, `old_businesslogic.md` §7.1:

| `product-host` davranışı | Yeni sistemdə | Status |
|---|---|---|
| Kilid yoxlaması parol yoxlamasından əvvəl | Kilid parol yoxlamasından əvvəl müəyyən edilir | **Bu spec bərpa edir** (FR-005) |
| Uğursuz cəhd sayğacı + kilid | Sayğac + müvəqqəti kilid | **Bu spec bərpa edir** (FR-001–FR-004) |
| Artan kilid (5/10/15/20 → 60/180/300/900 s), sayğac 10 dəq | Sabit kilid: 10 dəqiqədə 5 səhv cəhd → 15 dəqiqə | **Sadələşdirilir**; artan kilid Phase 2 (`TODO(Phase 2)`) |
| Rate limit: istifadəçi üzrə 120 s-də 10 | İstifadəçi adı üzrə 120 s-də 10 | **Bu spec bərpa edir** (FR-008) |
| Rate limit: IP üzrə 60 s-də 10 | — | **Təxirə salınır**: #5-dən sonra ayrıca task (FR-009) |
| Kilid anında bütün sessiyalar ləğv | Kilidli hesabın sessiyası yenilənmir | **Bu spec saxlayır** (FR-006, artıq var) |
| Uğurlu girişdə sayğacların sıfırlanması | Uğurlu girişdə sayğac sıfırlanır | **Bu spec bərpa edir** (FR-004) |
| Generik xəta mesajı | `Invalid credentials.` — kilidli hesab üçün də | Saxlanılır və genişlənir (FR-005) |
| Uğursuz cəhddə təsadüfi 0.3–0.8 s gecikmə | — | Ləğv edilib (spec 011) |
| 2 uğursuz cəhddən sonra rəqəmli CAPTCHA | — | **Ləğv edilir bu spec-də**, Phase 2-yə keçir (Assumptions) |
| QRadar `LOGIN FAILED` / kilid hadisəsi | Server log-una xəbərdarlıq | Qismən (FR-012); QRadar Phase 2 |

## Clarifications

### Session 2026-10-02

- Q: Kilidli hesab üçün hansı cavab qaytarılır? → A: Həmişə `Invalid credentials.` (401) —
  səhv parol cavabı ilə eyni; kilid xaricdən görünmür.
- Q: Kilid həddi və müddəti — sabit, yoxsa köhnə sistem kimi artan? → A: Sabit: 10 dəqiqə
  ərzində 5 səhv cəhd → 15 dəqiqəlik kilid. Artan kilid Phase 2-də qalır.
- Q: #5 bitməmiş IP limiti necə idarə olunur? → A: Bu spec-də yalnız istifadəçi adı üzrə limit
  + hesab kilidi. IP limiti #5 bitəndən sonra ayrıca task kimi gəlir.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Bir hesaba parol seçmə hücumu bir neçə cəhddən sonra dayandırılır (Priority: P1)

Admin panelin login səhifəsi internetdən əlçatandır. Bu gün hücumçu bilinən (və ya təxmin
edilən) admin hesab adına limitsiz sayda parol yoxlaya bilər — sistem uğursuz cəhdləri saymır,
hesab heç vaxt kilidlənmir. Mərkəzi Bankın CMS-ində bir redaktor hesabının ələ keçməsi rəsmi
məzənnələrin, xəbərlərin və səhifələrin dəyişdirilməsi deməkdir.

Feature-dən sonra 10 dəqiqə ərzində eyni hesaba 5 səhv cəhd hesabı 15 dəqiqəlik kilidləyir;
kilid müddətində doğru parol da giriş vermir, müddət bitəndən sonra hesab özü açılır.

**Why this priority**: Brute-force-a qarşı əsas qoruma budur; review-da 🔴 prioritetlə qeyd
olunub. Yalnız bu hissə deploy olunsa belə hesab üzrə hücum praktiki olaraq dayanır.

**Independent Test**: Test mühitində test hesabına ardıcıl 5 səhv parolla login edilir, sonra
doğru parolla cəhd edilir (rədd olunmalıdır), 15 dəqiqə gözlənilir və yenidən doğru parolla
cəhd edilir (uğurlu olmalıdır).

**Acceptance Scenarios**:

1. **Given** aktiv hesab, sayğac sıfır, **When** 4 dəfə səhv parolla cəhd edilir, **Then** hər
   cavab "yanlış məlumat" olur və hesab kilidlənmir; sonra doğru parolla giriş uğurludur.
2. **Given** aktiv hesab, **When** 10 dəqiqə ərzində 5 dəfə səhv parolla cəhd edilir, **Then**
   hesab 15 dəqiqəlik kilidlənir.
3. **Given** kilidli hesab, **When** kilid müddəti ərzində **doğru** parolla cəhd edilir,
   **Then** giriş rədd edilir və sessiya yaradılmır.
4. **Given** kilidi bitmiş hesab, **When** doğru parolla cəhd edilir, **Then** giriş uğurludur
   və sayğac sıfırlanır.
5. **Given** 4 səhv cəhd edilmiş, **When** doğru parolla uğurlu giriş olur, **Then** sayğac
   sıfırlanır — növbəti seriya yenidən sıfırdan sayılır.
6. **Given** 4 səhv cəhd edilmiş, **When** 10 dəqiqədən çox keçəndən sonra 1 səhv cəhd də
   edilir, **Then** hesab kilidlənmir — köhnə cəhdlər yeni seriyaya toplanmır.

---

### User Story 2 - Kilid cavabı nə parolu, nə də kilidin özünü açır (Priority: P1)

Bu gün kilid yoxlaması parol yoxlamasından sonra gəlir: kilidli hesaba səhv parolla "yanlış
məlumat", doğru parolla "hesab müvəqqəti kilidlənib" cavabı qayıdır. Yəni kilid hücumçu üçün
"parol doğrudur" siqnalına çevrilir (oracle) — hücumçu kilidi qəsdən yaradıb parol seçməyə
davam edə bilər.

Feature-dən sonra kilidli hesab üçün cavab adi "yanlış məlumat" cavabı ilə eynidir və
göndərilən paroldan asılı deyil. Xaricdən nə parolun doğruluğu, nə kilidin olması, nə də
(kilid vasitəsilə) hesab adının mövcudluğu görünür.

**Why this priority**: User Story 1-in kilidi oracle ilə birlikdə gəlsə, qoruma əksinə işləyər:
kilid hücumçuya parolu təsdiqləyər. Ona görə US1 ilə eyni prioritetdədir və eyni dəyişiklikdə
gedir.

**Independent Test**: Test hesabı kilidlənir, sonra kilid müddətində hər qrupa 30 sorğu
göndərilir: (a) kilidli hesab + doğru parol, (b) kilidli hesab + səhv parol, (c) kilidli olmayan
hesab + səhv parol, (d) mövcud olmayan ad. Dörd qrupun status kodu, cavab gövdəsi və median
cavab vaxtı müqayisə edilir.

**Acceptance Scenarios**:

1. **Given** kilidli hesab, **When** doğru parolla və səhv parolla ayrı-ayrı cəhd edilir,
   **Then** iki cavab status, gövdə və vaxt baxımından fərqlənmir.
2. **Given** kilidli hesab, **When** cavab qayıdır, **Then** o, kilidli olmayan hesaba səhv
   parol və mövcud olmayan ad cavabı ilə eynidir: status 401, mətn `Invalid credentials.`.
3. **Given** kilidli hesab, **When** kilid müddətində cəhdlər davam edir, **Then** bu cəhdlər
   kilidi uzatmır.

---

### User Story 3 - Bir hesab adına qısa müddətdə edilən cəhdlər məhdudlaşdırılır (Priority: P2)

Hesab kilidi parol seçməni dayandırır, amma parol yoxlaması bilərəkdən bahalıdır və eyni ada
çox tez-tez sorğu göndərmək həm endpoint-i yükləyir, həm də kilid müddəti bitən kimi seriyanın
dərhal təkrarına imkan verir. Feature-dən sonra 120 saniyə ərzində eyni hesab adına 10-dan çox
login cəhdi "çox sorğu" cavabı alır — ad mövcud olsa da, olmasa da.

**Why this priority**: Kilidin üstündə ikinci qatdır; US1 olmadan da dəyərlidir, amma tək
başına parol seçməni dayandırmır. IP üzrə limit (password spraying-ə qarşı) #5-dən sonra
ayrıca gəlir.

**Independent Test**: Test mühitində 120 saniyə ərzində eyni ada 11 login sorğusu göndərilir;
11-ci sorğu "çox sorğu" cavabı alır, pəncərə bitəndən sonra yenidən qəbul olunur. Paralel olaraq
başqa adla edilən giriş təsirlənmir.

**Acceptance Scenarios**:

1. **Given** bir hesab adı, **When** 120 saniyə ərzində 10 login sorğusu göndərilir, **Then**
   hamısı adi qaydada (uğurlu və ya "yanlış məlumat") emal olunur.
2. **Given** bir ad limiti aşıb, **When** həmin ada növbəti sorğu göndərilir, **Then** parol
   yoxlanmadan "çox sorğu" cavabı qayıdır; cavab nə vaxt yenidən cəhd etmək olacağını bildirir.
3. **Given** bir ad limiti aşıb, **When** başqa redaktor öz adı ilə login edir, **Then** onun
   girişi təsirlənmir.
4. **Given** limit pəncərəsi bitib, **When** həmin ada yenidən cəhd edilir, **Then** sorğu adi
   qaydada emal olunur.
5. **Given** mövcud olmayan ad, **When** ona 120 saniyədə 11 sorğu göndərilir, **Then** 11-ci
   sorğu mövcud ad üçün olduğu kimi "çox sorğu" cavabı alır.

---

### Edge Cases

- **Mövcud olmayan login adı**: sayğac yalnız mövcud hesablar üçün saxlanılır, mövcud olmayan
  ad heç vaxt kilidlənmir. Kilidli hesabın cavabı "yanlış məlumat" ilə eyni olduğu üçün (FR-005)
  bu fərq xaricdən görünmür. Ad üzrə rate limit (US3) mövcud və mövcud olmayan adlara eyni
  işləyir.
- **Deaktiv və ya silinmiş hesab**: mövcud olmayan ad kimi işlənir — sayğac artmır, kilid qoyulmur
  (spec 011 FR-002 ilə uyğun).
- **Hesab adının yazılışı**: rate limit açarı login zamanı istifadəçinin yazdığı ad üzrədir;
  böyük/kiçik hərf və ya kənar boşluqla yazılmış eyni ad ayrıca açar sayılmamalıdır, əks halda
  limit asanlıqla keçilir.
- **Paralel uğursuz cəhdlər**: eyni anda gələn N səhv cəhdin hamısı sayılmalıdır; paralellik
  sayğacı "itirməməlidir" (FR-003).
- **Kilid müddətində cəhdlər**: kilidli hesaba edilən cəhdlər sayğacı artırmır və kilidi
  uzatmır, əks halda hücumçu davamlı sorğu ilə real istifadəçini qeyri-müəyyən müddətə
  bayırda saxlayar.
- **Köhnə uğursuz cəhdlər**: 10 dəqiqədən köhnə səhv cəhdlər yeni seriyaya toplanmır (FR-002).
- **Admin parolu sıfırlayır və ya hesabı yenidən aktivləşdirir**: kilid və sayğac sıfırlanır
  (FR-007), redaktor 15 dəqiqəni gözləmədən işə qayıdır.
- **Kilidlənmiş redaktor nə baş verdiyini bilmir**: cavab "yanlış məlumat" olduğu üçün redaktor
  kilidi görmür (bilərəkdən, Q1). Çıxış yolu: 15 dəqiqə gözləmək və ya admindən parol
  sıfırlamasını istəmək. Bu, istifadəçi təlimatında qeyd olunmalıdır.
- **Hücumçu admin hesabını qəsdən kilidləyir (DoS)**: kilid 15 dəqiqədən sonra özü açılır, ad
  üzrə limit kilidin bitən kimi təkrar qoyulmasını ləngidir (120 s-də 10 cəhd). Tam həlli
  (CAPTCHA, 2FA) Phase 2-dir.
- **İngress arxasında bütün sorğular eyni IP-dən görünür**: bu spec IP üzrə limit qoymur, ona
  görə bu problem burada yaranmır. IP limiti #5-dən sonrakı task-dadır.
- **Refresh və logout**: rate limit yalnız login cəhdlərinə aiddir; sessiyanın yenilənməsi
  limitə düşmür, əks halda açıq tablar aktiv redaktoru çıxarar.

## Requirements *(mandatory)*

### Functional Requirements

**Hesab kilidi**

- **FR-001**: Mövcud, aktiv, kilidli olmayan hesaba hər səhv parollu login cəhdi həmin hesabın
  uğursuz cəhd sayğacını bir vahid artırmalıdır.
- **FR-002**: Son uğursuz cəhddən 10 dəqiqə ərzində edilən ardıcıl 5-ci səhv cəhd hesabı
  **15 dəqiqəlik** kilidləməlidir. Son uğursuz cəhddən 10 dəqiqədən çox keçibsə, növbəti səhv
  cəhd seriyanı yenidən 1-dən başladır.
- **FR-003**: Eyni hesaba paralel gələn səhv cəhdlərin hər biri sayğaca düşməlidir; heç bir
  cəhd paralellik səbəbindən sayılmadan qalmamalıdır.
- **FR-004**: Uğurlu girişdə (doğru parol, hesab kilidli deyil) sayğac sıfırlanmalı və
  bitmiş kilid qeydi təmizlənməlidir.
- **FR-005**: Kilid hesabın parolu yoxlanmazdan **əvvəl** müəyyən edilməlidir. Kilidli hesab
  üçün cavab səhv parol cavabı ilə **eyni** olmalıdır — status 401, mətn `Invalid credentials.`,
  eyni başlıqlar və statistik olaraq eyni cavab vaxtı — və göndərilən parolun doğru olub-olmadığından
  asılı olmamalıdır. Kilid müddətində doğru parol giriş verməməli, sessiya yaratmamalıdır.
- **FR-006**: Kilidli hesabın mövcud sessiyası kilid müddətində yenilənə bilməməlidir (bu
  davranış sessiya yeniləmədə artıq var və saxlanılmalıdır).
- **FR-007**: Admin istifadəçinin parolunu sıfırlayanda və ya deaktiv hesabı yenidən
  aktivləşdirəndə həmin hesabın sayğacı və kilidi sıfırlanmalıdır.

**Rate limit**

- **FR-008**: Login endpoint-i hər hesab adı üzrə 120 saniyəlik pəncərədə 10 cəhd qəbul etməlidir;
  limit mövcud olmayan adlara da eyni işləməlidir. Açar müqayisəsi böyük/kiçik hərfə və kənar
  boşluğa həssas olmamalıdır.
- **FR-009**: Mənbə (klient IP-si) üzrə limit bu spec-in əhatəsindən **kənardır**: #5
  (`UseForwardedHeaders`) bitəndən sonra ayrıca task kimi gəlir (köhnə sistemdə 60 s-də 10).
- **FR-010**: Limiti aşan sorğu parol yoxlamasına çatmadan "çox sorğu" cavabı almalı, cavab nə
  vaxt yenidən cəhd etmək olacağını bildirməli, hesab sayğacına (FR-001) düşməməlidir.
- **FR-011**: Rate limit yalnız login-ə aiddir; sessiya yeniləmə, logout və digər endpoint-lər
  bu limitə düşməməlidir.

**Müşahidə və kontrakt**

- **FR-012**: Hesabın kilidlənməsi və rate limitin aşılması server log-una ayrıca xəbərdarlıq
  kimi yazılmalıdır (hesab adı, mənbə IP-si, kilid bitmə vaxtı); parol heç vaxt yazılmır.
  Mövcud "login failure" xəbərdarlığı saxlanılır. Kilid xaricdən görünmədiyi üçün (FR-005)
  insident araşdırmasında onu yalnız log göstərir.
- **FR-013**: Login endpoint-inin xarici kontraktı (OpenAPI spec) yeni "çox sorğu" cavabını
  əks etdirməli, 401 təsvirindən `Account temporarily locked.` mətni çıxarılmalıdır;
  dəyişiklik spec-first qaydası ilə edilir. Admin panel (`web-cbar-admin-new`) "çox sorğu"
  cavabını istifadəçiyə anlaşılan, iki dildə mesajla göstərməlidir — bu ayrıca iş paketidir.
- **FR-014**: Uğurlu girişin davranışı (token, sessiya cookie-si, audit qeydi) və mövcud olmayan
  ad üzrə bərabər cavab vaxtı (spec 011) dəyişməməlidir.

### Key Entities *(include if feature involves data)*

- **İstifadəçi hesabı**: artıq mövcud olan iki sahəni istifadə edir — ardıcıl uğursuz cəhd
  sayı və kilidin bitmə vaxtı — və bir yeni sahə: seriyadakı son uğursuz cəhdin vaxtı
  (FR-002-nin 10 dəqiqəlik pəncərəsi üçün; plan research R1, `data-model.md`).
- **Login cəhdi açarı**: rate limitin açarı — normallaşdırılmış hesab adı. Qalıcı saxlanılmır,
  yalnız 120 saniyəlik pəncərə ərzində sayılır.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Test mühitində test hesabına 5 ardıcıl səhv cəhddən sonra kilid müddəti ərzində
  doğru parolla edilən cəhdlərin 100%-i rədd edilir; 15 dəqiqədən sonra doğru parolla ilk cəhd
  uğurludur.
- **SC-002**: Kilid müddətində US2-dəki dörd qrupa (kilidli + doğru parol, kilidli + səhv parol,
  kilidsiz + səhv parol, mövcud olmayan ad) hər birinə 30 sorğu göndərildikdə status kodu və
  cavab gövdəsi 100% eynidir, istənilən iki qrupun median cavab vaxtları arasındakı fərq
  25 ms-dən azdır.
- **SC-003**: 120 saniyə ərzində eyni ada göndərilən 11-ci və sonrakı sorğuların 100%-i "çox
  sorğu" cavabı alır; eyni anda başqa adla edilən uğurlu giriş təsirlənmir.
- **SC-004**: Eyni hesaba eyni anda göndərilən 4 səhv cəhddən sonra hesabın uğursuz cəhd sayı
  4-dür; 5-ci səhv cəhd hesabı kilidləyir.
- **SC-005**: 4 səhv cəhd + uğurlu giriş + yenə 4 səhv cəhd seriyası hesabı kilidləmir.
- **SC-006**: Admin kilidli hesabın parolunu sıfırlayandan sonra redaktor yeni parolla dərhal
  (15 dəqiqəni gözləmədən) daxil ola bilir.
- **SC-007**: Normal iş rejimində (redaktor 1–2 dəfə parolu səhv yazıb sonra düz yazır) heç bir
  hesab kilidlənmir və heç bir istifadəçi "çox sorğu" cavabı görmür.

## Assumptions

- **CAPTCHA ləğv edilir bu spec-də**: köhnə sistemin rəqəmli CAPTCHA-sı admin paneldə yeni UI,
  API kontraktı və server tərəfində şəkil generasiyası tələb edir; 5 SP-lik qiymətə daxil
  deyil. `AuthController`-dəki `TODO(Phase 2)` (2FA, artan kilidlər, QRadar) ilə birlikdə
  Phase 2-yə keçir.
- **Sabit kilid köhnə sistemdən sərtdir**: köhnə sistemdə 5 cəhd 60 s kilid verirdi, burada
  15 dəqiqədir. Bu bilərəkdəndir (Q2): rate limitlə birlikdə brute-force-u kifayət qədər
  ləngidir, artan pillələr Phase 2-də gəlir.
- **Kilidin görünməməsi** (Q1): kilidlənmiş redaktor "yanlış məlumat" görür. Bu, OWASP
  tövsiyəsinə uyğundur və panel tərəfində dəyişiklik tələb etmir; dəstək admin parol
  sıfırlaması ilə verilir (FR-007).
- **Sxem dəyişikliyi minimaldır**: sayğac və kilid vaxtı sahələri ilk migration-dan bəri `users`
  cədvəlində var, sadəcə yazılmır. Pəncərə üçün bir nullable sütun əlavə olunur (plan R1,
  +1 SP); deploy sırası: `api-cbar-admin` → `api-cbar` → panel.
- **Rate limit sayğacları yaddaşdadır**: `.ci-cd/*.yaml`-da replica sayı ayrıca təyin olunmayıb
  (pipeline default-u); çox pod olarsa limit pod başına olur. Bu, qorumanı zəiflədir, amma ləğv
  etmir — hesab kilidi bazada saxlanıldığı üçün pod sayından asılı deyil.
- **#5-dən asılılıq yoxdur** (Q3): bu spec IP-dən istifadə etmir (log istisna). IP üzrə limit
  #5 bitəndən sonra ayrıca task-dır; `api-admin-review.md`-də #2-nin statusu "qismən" kimi
  qeyd olunmalıdır.
- **Kilidli hesabın mövcud sessiyası**: sessiya yeniləmə kilidli hesabı artıq rədd edir və
  sessiya ailəsini ləğv edir; bu davranış köhnə sistemin "kilid anında bütün sessiyalar ləğv"
  qaydasına kifayət qədər yaxındır. 15 dəqiqəlik access token-in dərhal ləğvi #12-nin
  mövzusudur.
- **Login uğursuzluğunun audit-ə yazılması** #16-nın mövzusudur; bu spec yalnız log-a yazır.
- **Verification**: lokalda .NET SDK yoxdur; build GitLab pipeline-ında, bütün ssenarilər
  (kilid, kilidin açılması, sıfırlama, limit, paralel cəhdlər, cavab bərabərliyi) `test`
  mühitinə deploy olunduqdan sonra `curl` ilə əl ilə yoxlanılır (Konstitusiya Maddə VIII.1).
  Test üçün ayrıca hesab yaradılır ki, real redaktorlar kilidlənməsin.
- **Deploy sırası**: `api-cbar-admin` əvvəl (migration), sonra `api-cbar` (`Cbar.Domain`
  kopyası), sonra `web-cbar-admin-new`-in "çox sorğu" mesajı.
  Panel yeni cavabı tanımasa belə serverin mesajını göstərir, yəni ara vəziyyət sınıq deyil.
