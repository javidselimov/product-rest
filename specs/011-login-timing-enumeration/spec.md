# Feature Specification: Login cavab vaxtı üzrə username enumeration-ı bağlamaq

**Feature Branch**: `011-login-timing-enumeration`

**Created**: 2026-10-01

**Status**: Draft

**Input**: User description: "3. Username enumeration (timing). — 1 SP. User tapılmayanda BCrypt.Verify çağırılmır (AuthController.cs:40), cavab ~250ms tez qayıdır. Həll: user tapılmayanda da dummy hash ilə verify çağırmaq. SP izahı: bir neçə sətir. #2 ilə eyni MR-da etmək olar."

**Mənbə**: `api-admin-review.md`, task #3 (🔴, 1 SP).

**Əhatə olunan proyekt**: yalnız `api-cbar-admin` (CMS API, login endpoint-i). Admin panellər
(`web-cbar-admin`, `web-cbar-admin-next`), `api-cbar` və sxem **toxunulmur** — cavabın
forması, status kodu və mətni dəyişmir, ona görə frontend tərəfdə iş yoxdur.

**`product-host` istinadı (Konstitusiya Maddə I.2)**: `admin/controllers/LoginController` +
`admin/viewmodels/LoginViewModel` (`business_logic/old_businesslogic.md` §7.1). Köhnə sistem
uğursuz cəhddə təsadüfi 0.3–0.8 s gecikmə əlavə edir və generik xəta mesajı qaytarır — yəni
cavab vaxtından istifadəçinin mövcudluğunu çıxarmaq orada çətinləşdirilib. Yeni sistem bu
qorumanı itirib (səssiz itki, Maddə I.3); bu feature onu bərpa edir. Təsadüfi gecikmənin özü
köçürülmür (bax: Assumptions).

**Paritet (İş axını qaydası 5)** — `LoginController` / `LoginViewModel`, `old_businesslogic.md` §7.1:

| `product-host` davranışı | Yeni sistemdə | Status |
|---|---|---|
| Generik xəta mesajı | `Invalid credentials.` | Saxlanılır (artıq var idi) |
| Cavab vaxtından istifadəçinin mövcudluğunu çıxarmaq çətindir | Bərabər xərcli parol yoxlaması | **Bu spec bərpa edir** |
| Uğursuz cəhddə təsadüfi 0.3–0.8 s gecikmə | — | **Ləğv edilir** (Assumptions; research R1) |
| CAPTCHA, IP/istifadəçi rate limit, artan kilid | — | #2 və Phase 2 (`TODO(Phase 2)`), bu spec-in əhatəsindən kənar |

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Hücumçu cavab vaxtından hansı login adlarının mövcud olduğunu öyrənə bilmir (Priority: P1)

Admin panelin login səhifəsi internetdən əlçatandır. Bu gün mövcud olmayan login adı ilə
göndərilən sorğu mövcud ad + səhv parol sorğusundan nəzərəçarpacaq dərəcədə (~250 ms) tez
cavab alır. Hücumçu bu fərqə baxaraq ad siyahısını yoxlayıb hansı admin hesablarının
mövcud olduğunu müəyyən edə bilər, sonra brute-force və ya phishing-i yalnız real hesablara
yönəldir. Mərkəzi Bankın CMS-i üçün admin hesab adlarının sızması özü təhlükəsizlik
hadisəsidir.

**Why this priority**: Feature-in yeganə məqsədi budur; review-da 🔴 prioritetlə qeyd olunub.

**Independent Test**: Test mühitində eyni sayda (məsələn hər birinə 30) sorğu iki qrupla
göndərilir: (a) mövcud olmayan login adı, (b) mövcud aktiv login adı + səhv parol. Hər iki
qrupun median cavab vaxtı müqayisə edilir; status kodu və cavab gövdəsi də müqayisə edilir.

**Acceptance Scenarios**:

1. **Given** sistemdə olmayan login adı, **When** istənilən parolla login cəhdi edilir,
   **Then** cavab "yanlış məlumat" xətası ilə qayıdır və cavab vaxtı mövcud ad + səhv parol
   halı ilə eyni diapazondadır.
2. **Given** mövcud, aktiv hesab, **When** səhv parolla login cəhdi edilir, **Then** cavab
   (1)-dəki ilə status, gövdə və vaxt baxımından fərqlənmir.
3. **Given** deaktiv edilmiş hesab, **When** onun adı ilə (doğru və ya səhv parolla) login
   cəhdi edilir, **Then** cavab (1)-dəki ilə status, gövdə və vaxt baxımından fərqlənmir.
4. **Given** mövcud, aktiv hesab, **When** doğru parolla login edilir, **Then** giriş bugünkü
   kimi uğurlu olur — davranış, cavab forması və sessiyanın yaradılması dəyişmir.

---

### Edge Cases

- **Boş və ya çox uzun login adı/parol**: mövcud olmayan ad kimi işlənir — eyni cavab, eyni
  vaxt diapazonu. Mövcud input validation-dan (əgər sorğu daha əvvəl rədd edilirsə) bu feature
  asılı deyil və onu dəyişmir.
- **Kilidlənmiş hesab**: kilid cavabının parol yoxlamasından sonra gəlməsi (lock oracle)
  review-un #2 task-ının mövzusudur, bu feature-in yox. Bu feature kilidli hesabların cavab
  vaxtını pisləşdirməməlidir; #2 ilə eyni MR-da edilərsə, ikisi birlikdə yoxlanılır.
- **Silinmiş (soft-delete) hesab**: deaktiv hesab kimi — "mövcud deyil" cavabı və vaxtı.
- **Fərqli parol hash xərcli hesablar** (məsələn köhnə sistemdən gətirilmiş, başqa iş faktoru
  ilə hash olunmuş parollar): onların vaxtı standart hesablardan fərqlənə bilər. Bu, ad
  mövcudluğunu deyil, hash parametrini açır və bu feature-in əhatəsindən kənardır.
- **Şəbəkə səs-küyü**: tək sorğunun vaxtı müqayisə üçün etibarlı deyil; yoxlama median üzrə
  aparılır (SC-001).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Login endpoint-i login adının mövcud olmadığı halda da mövcud ad + səhv parol
  halında görülən eyni hesablama xərcli parol yoxlamasını icra etməlidir, ki iki halın cavab
  vaxtı statistik olaraq fərqlənməsin.
- **FR-002**: FR-001 deaktiv və silinmiş hesablara da aiddir — onlar xaricdən "mövcud deyil"
  hesabından fərqlənməməlidir.
- **FR-003**: Mövcud olmayan, deaktiv və səhv parollu hallarda status kodu, cavab gövdəsi
  (mətn daxil) və başlıqlar bugünkü "yanlış məlumat" cavabı ilə eyni qalmalıdır.
- **FR-004**: "Mövcud deyil" halında yoxlama heç vaxt uğurlu nəticə verməməlidir — hansı
  parol göndərilsə də giriş rədd edilir.
- **FR-005**: Uğursuz giriş cəhdlərinin bugünkü loglanması (login adı və IP ilə xəbərdarlıq)
  dəyişməz qalmalıdır.
- **FR-006**: Doğru məlumatlarla uğurlu girişin davranışı (token, refresh cookie, audit
  qeydi) dəyişməməlidir.
- **FR-007**: Dəyişiklik login endpoint-inin xarici kontraktını (OpenAPI spec-dəki route,
  sorğu və cavab forması) dəyişməməlidir; spec-də yeniləmə tələb olunmur.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Test mühitində hər qrupa ən azı 30 sorğu göndərildikdə, "mövcud olmayan ad" və
  "mövcud ad + səhv parol" qruplarının median cavab vaxtları arasındakı fərq 25 ms-dən azdır
  (bu gün ~250 ms-dir).
- **SC-002**: "Deaktiv hesab" qrupu üçün də SC-001-dəki eyni hədd ödənir. Silinmiş hesablar
  ölçülmür: onlar deaktiv hesabla eyni yoldan keçir ("tapılmadı"), bunu kod review təsdiqləyir.
  Test mühitində hesab silmək geri qaytarılmır.
- **SC-003**: Bütün uğursuz qruplarda status kodu və cavab gövdəsi 100% eynidir.
- **SC-004**: Doğru məlumatlarla login uğur faizi dəyişmir (test mühitində 10/10 uğurlu
  giriş) və cavab forması (token, refresh cookie) eynidir. Uğurlu girişin vaxtı məlumat üçün
  baseline ilə yanaşı yazılır, amma meyar deyil: iki ölçüm fərqli vaxtda aparılır və mühit
  yükü 25 ms-dən çox dəyişə bilər, uğurlu yol isə bu dəyişiklikdə toxunulmur.

## Assumptions

- Köhnə sistemin təsadüfi 0.3–0.8 s gecikməsi **köçürülmür**: o, cavabı hər uğursuz cəhddə
  yavaşladır, amma vaxt fərqini aradan qaldırmır, yalnız səs-küy əlavə edir. Bərabər xərcli
  yoxlama kök səbəbi aradan qaldırır. Brute-force-u yavaşlatmaq #2-nin (lockout + rate limiter)
  işidir.
- Bütün standart hesabların parolu eyni iş faktoru ilə hash olunub (yeni istifadəçi yaradılanda
  və parol dəyişəndə istifadə olunan dəyər); "mövcud deyil" halının xərci də ona bərabər
  tutulur.
- Lokalda .NET SDK yoxdur; build GitLab pipeline-ında, yoxlama `test` mühitinə deploy
  olunduqdan sonra `curl` ilə aparılır (Konstitusiya Maddə VIII.1).
- Review-un tövsiyəsinə uyğun olaraq bu dəyişiklik #2 (lockout, rate limiter, lock oracle) ilə
  eyni `api-cbar-admin` MR-ında gedə bilər; bu spec ondan asılı deyil və təkbaşına da deploy
  oluna bilər. Bir proyekt olduğu üçün deploy sırası məsələsi yoxdur.
- 2FA, CAPTCHA, eskalasiya edən kilidlər və QRadar inteqrasiyası əhatədən kənardır
  (`AuthController`-dəki `TODO(Phase 2)`).
