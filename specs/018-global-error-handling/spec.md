# Feature Specification: Admin API-də qlobal xəta idarəsi və vahid xəta forması

**Feature Branch**: `018-global-error-handling`

**Created**: 2026-10-06

**Status**: Draft

**Input**: User description: "7. Qlobal xəta idarəsi yoxdur. — 8 SP. Kodda bir dənə də catch / DbUpdateException yoxdur. UseExceptionHandler / AddProblemDetails də yoxdur. Nəticədə bunların hamısı gözlənilən 400/409 əvəzinə 500 verir: unique violation (slug race, eyni faylın paralel upload-u, eyni username ilə paralel create); FK violation (mövcud olmayan locale); varchar uzunluğunun aşılması. Xəta formatı da qarışıqdır: bəzən {message}, bəzən {message, code}, bəzən boş NotFound(). RFC 7807 standartlaşdırması lazımdır. SP izahı: handler və Postgres xəta kodlarının (23505, 23503, 22001) mapping-i ~3 SP-dir. Qalanı bütün controller-lərdə cavab formatını birləşdirmək və OpenAPI-ni yeniləməkdir. Frontend: hər iki admin panel {message} oxuyur — format dəyişəndə onlar da uyğunlaşdırılmalıdır (ayrıca task)."

**Mənbə**: `api-admin-review.md`, task #7 (🟠 Yüksək, 8 SP).

**Əhatə olunan proyekt**: yalnız `api-cbar-admin`. `api-cbar` (public API), sxem və
`Cbar.Domain` **toxunulmur** — migration yoxdur, route-lar dəyişmir. Admin panel
(`product-rest/web-cbar-admin-new`) üçün bu spec çərçivəsində dəyişiklik **tələb olunmur**
(FR-010); panelin yeni formadan tam istifadə etməsi (sahə xətalarını sahənin altında
göstərmək və s.) ayrıca task-dır.

**Asılılıq**: spec `016` hissə 8b (sorğu gövdəsinin yoxlanması) bu spec-in müəyyən etdiyi
xəta formasından istifadə edir — 8b bu spec-dən **sonra** icra olunur. Bu spec 8b-ni
əvəz etmir: burada DB-dən gələn xəta **son müdafiə xətti** kimi düzgün statusa çevrilir;
8b isə səhvi DB-yə çatmamış tutur.

**Kodda faktiki vəziyyət (2026-10-06, ölçülüb)** — review-un iddiaları ilə müqayisə:

| Review iddiası | Kodda | Qeyd |
|---|---|---|
| "Bir dənə də `catch` yoxdur" | Bir `catch` var: `MediaController` faylın obyekt anbarında tapılmamasını 404-ə çevirir | Mahiyyət dəyişmir: DB xətaları heç yerdə tutulmur |
| `UseExceptionHandler` / `AddProblemDetails` yoxdur | Təsdiqlənir | İşlənməmiş istisna boş gövdəli 500 verir |
| Xəta formatı qarışıqdır | Təsdiqlənir. Təxminən: `BadRequest({message})` ~93, gövdəsiz `NotFound()` ~94 (kodda gövdəsizdir, runtime-da çərçivə onu artıq ProblemDetails-ə çevirir — plan R1), `NotFound({message})` 3, `Conflict({message})` ~18, `Unauthorized({message, code})`, `403 {message, code}`, `415 {message, mimeType}`, `429 {message}`; binding xətası çərçivənin `ValidationProblemDetails`-i; 401/403 (JWT/rol) və 500 — boş gövdə | OpenAPI `info.description` üç formanı açıq sənədləşdirir, `x-known-issues`-da da qeyd var |
| "Eyni faylın paralel upload-u" → 500 | Təsdiqlənir, amma səbəb iki cürdür: anbar açarının unikal məhdudiyyəti və checksum üzrə "tək qeyd" axtarışı (checksum unikal deyil — köhnə dublikatlar varsa ardıcıl upload da 500 verir) | OpenAPI `x-known-issues`-da qeyd olunub |
| "Hər iki admin panel `{message}` oxuyur" | Bu workspace-də bir admin panel var (`web-cbar-admin-new`). O, `message`, `title`, `errors`, `code`, `traceId` oxuyur; `code === 'refresh_stale'` ilə token yeniləməsini təkrarlayır | Bax FR-010, FR-011 |

**`product-host` istinadı (Konstitusiya Maddə I.2)**: Yii2-nin `errorHandler` komponenti
(`common/config/components.php` → `errorAction: error/error`, `admin/controllers/ErrorController.php`)
bütün işlənməmiş istisnaları tutub vahid xəta səhifəsi göstərirdi; model validation xətaları
formada sahə səviyyəsində qayıdırdı və unikal dəyər dublikatı (məs. `common/models/Users.php`:
`[['username', 'email'], 'unique']`) istifadəçiyə mesaj kimi çatırdı, server xətası kimi yox. Yeni sistemdə qlobal tutucu itib. Bu spec onu bərpa edir —
paritetin qaytarılmasıdır, yeni davranış deyil.

**Paritet (İş axını qaydası 5)**:

| `product-host` davranışı | Yeni sistemdə (bu gün) | Bu spec-dən sonra |
|---|---|---|
| Qlobal xəta tutucu vahid cavab verir | İşlənməmiş istisna → boş 500 | Vahid xəta cavabı, izləmə identifikatoru ilə; daxili detal açılmır |
| Unikal dublikat → istifadəçiyə mesaj | Yarış halında DB xətası → 500 | 409, hansı dəyərin toqquşduğunu deyən mesajla |
| Mövcud olmayan istinad (locale, kateqoriya) → validation mesajı | FK xətası → 500 | 400 (yazmada) / 409 (silmədə) |
| Uzun dəyər → `string max` mesajı | DB xətası → 500 | 400 |
| — | Beş fərqli xəta gövdəsi forması | Bir forma (RFC 7807), köhnə `message` sahəsi qorunur |

## User Scenarios & Testing *(mandatory)*

### User Story 1 - DB-nin rədd etdiyi yazma server xətası yox, anlaşılan müştəri xətası verir (Priority: P1)

Redaktor xəbər yaradır, eyni anda başqa redaktor eyni başlıqla xəbər yaradır; ya da iki
admin eyni username ilə istifadəçi yaradır; ya da inteqrasiya naməlum dil açarı və ya
sütundan uzun dəyər göndərir. Bu gün hər halda DB sorğunu rədd edir və API **500** qaytarır:
panel "gözlənilməz xəta" göstərir, redaktor səhvin onda, yoxsa serverdə olduğunu bilmir,
monitorinqdə isə əsl server xətaları ilə qarışır. Bu spec-dən sonra DB-nin rədd etdiyi
yazma uyğun müştəri statusu (400 və ya 409) və nəyin səhv olduğunu deyən mesajla qayıdır;
bazada heç nə yarımçıq qalmır.

**Why this priority**: Review-un əsas tapıntısıdır və ən çox 500 mənbəyini bağlayır;
handler + xəta kodu mapping-i (~3 SP) müstəqil çatdırıla bilər.

**Independent Test**: `test` mühitində (a) mövcud username ilə istifadəçi yaratma iki
paralel sorğu ilə, (b) mövcud slug ilə iki paralel xəbər yaratma, (c) `ru` locale açarlı
tərcümə, (d) sütun limitindən uzun başlıq göndərilir; heç birinin 500 olmadığı, statusun
gözləniləndiyi, cavabın vahid formada olduğu və bazada yarımçıq qeyd qalmadığı yoxlanılır.

**Acceptance Scenarios**:

1. **Given** username `editor1` mövcuddur, **When** eyni username ilə yaratma sorğusu
   mövcudluq yoxlamasından keçib DB-də rədd edilir (yarış), **Then** cavab 409-dur və mesaj
   ardıcıl sorğudakı "username artıq mövcuddur" halının mənasını daşıyır.
2. **Given** iki redaktor eyni anda eyni slug-a düşən qeyd yaradır, **When** ikinci yazma
   DB-də unikal məhdudiyyətə çarpır, **Then** cavab 409-dur, mesaj toqquşan slug sahəsini
   adlandırır və ikinci qeyd saxlanılmır (FR-004).
3. **Given** eyni fayl iki paralel sorğu ilə yüklənir, **When** ikinci yazma anbar açarının
   unikallığına çarpır, **Then** hər iki sorğu uğurludur və **eyni** media qeydini qaytarır;
   bazada bu fayl üçün yeni dublikat qeyd yaranmır (FR-004).
3a. **Given** bazada eyni checksum-lu iki köhnə media qeydi var, **When** həmin fayl ardıcıl
   yüklənir, **Then** cavab 500 deyil — mövcud qeydlərdən biri qaytarılır.
4. **Given** tərcümə sistemdə olmayan locale açarı ilə göndərilir, **When** DB istinad
   məhdudiyyətini pozur, **Then** cavab 400-dür.
5. **Given** sahə dəyəri sütun limitini aşır, **When** DB rədd edir, **Then** cavab 400-dür.
6. **Given** başqa qeydin istinad etdiyi qeyd silinir və controller-də əvvəlcədən yoxlama
   yoxdur, **When** DB istinad məhdudiyyətini pozur, **Then** cavab 409-dur ("qeyd istifadə
   olunur" mənasında).
7. **Given** yuxarıdakı rədd edilən sorğulardan hər hansı biri, **When** baza və audit
   jurnalı yoxlanılır, **Then** sorğunun heç bir hissəsi saxlanılmayıb və audit qeydi yoxdur.

---

### User Story 2 - Gözlənilməz xəta vahid formada, izlənə bilən və daxili detalı açmadan qayıdır (Priority: P1)

Kodda hələ öngörülməmiş bir xəta baş verir (məs. obyekt anbarı əlçatmazdır, gözlənilməz
null). Bu gün cavab boş gövdəli 500-dür: istifadəçi heç nə görmür, dəstək komandası isə
həmin sorğunu loglarda tapa bilmir. Bu spec-dən sonra cavab vahid formadadır və izləmə
identifikatoru daşıyır; eyni identifikator server logunda xətanın tam detalı ilə yazılır.
Production-da cavabda stack trace, SQL, cədvəl və ya məhdudiyyət adı görünmür.

**Why this priority**: US1 ilə eyni mexanizmdir (qlobal tutucu); onsuz US1-in xəritələnməyən
qalığı yenə boş 500 olaraq qalır. Təhlükəsizlik baxımından detal sızmasının qarşısını alır.

**Independent Test**: Gözlənilməz xəta yaradan sorğu (məs. obyekt anbarı dayandırılmış
halda upload) göndərilir; cavabın 500, vahid formada, izləmə identifikatorlu olduğu, həmin
identifikatorun logda tapıldığı və production konfiqurasiyasında cavabda daxili detal
olmadığı yoxlanılır.

**Acceptance Scenarios**:

1. **Given** işlənməmiş istisna baş verir, **When** cavab qayıdır, **Then** status 500-dür,
   gövdə vahid xəta formasındadır və izləmə identifikatoru var.
2. **Given** həmin cavabın identifikatoru, **When** server loguna baxılır, **Then** istisnanın
   növü, mesajı və stack trace-i həmin identifikatorla tapılır.
3. **Given** Production mühiti, **When** istənilən xəta cavabına (400/409 daxil) baxılır,
   **Then** SQL mətni, cədvəl/sütun/məhdudiyyət adı, stack trace və ya daxili istisna mesajı
   yoxdur.
4. **Given** müştəri sorğunu yarıda kəsir (bağlantı bağlanır), **When** server bunu
   aşkarlayır, **Then** bu hal server xətası kimi loglanmır və 500 sayılmır.

---

### User Story 3 - Bütün xəta cavabları bir formadadır (Priority: P2)

Panel və ya inteqrasiya yazan developer hər endpoint üçün xəta gövdəsinin hansı formada
gələcəyini təxmin etməli olur: `{message}`, `{message, code}`, çərçivənin ProblemDetails-i,
yoxsa boş gövdə. Bu spec-dən sonra API-nin qaytardığı **hər** xəta cavabı (4xx və 5xx) eyni
standart formadadır (RFC 7807 "problem details"): status, qısa başlıq, insan oxuyan izah,
izləmə identifikatoru; validation xətalarında sahə üzrə siyahı; maşın oxuyan kod lazım olan
yerdə sabit kod. OpenAPI spec bu tək formanı sənədləşdirir.

**Why this priority**: Developer təcrübəsi və 8b (validation) üçün ön şərtdir, amma istifadəçi
üçün görünən fayda US1–US2-dən azdır; işin böyük hissəsi (controller-lərdə mexaniki
əvəzləmə + OpenAPI) buradadır.

**Independent Test**: Hər controller-dən ən azı bir 400, 404 və (varsa) 409 cavabı, üstəlik
token olmadan 401, rol olmadan 403 və binding xətası istənir; hamısının eyni media tipi və
eyni əsas sahələrlə qayıtdığı yoxlanılır; OpenAPI lint/bundle yaşıldır və köhnə formalara
istinad qalmayıb.

**Acceptance Scenarios**:

1. **Given** istənilən endpoint, **When** 400, 401, 403, 404, 409, 413, 415, 429 və ya 500
   qaytarılır, **Then** gövdə vahid xəta formasındadır və media tipi problem details tipidir.
2. **Given** bu gün gövdəsiz qayıdan `NotFound()`, **When** id tapılmır, **Then** cavab 404-dür
   və vahid formadadır.
3. **Given** bu gün `{message}` qaytaran biznes qaydası (məs. "Page has children"), **When**
   eyni səhv təkrarlanır, **Then** status və mesaj mətni eynidir, yalnız forma vahiddir.
4. **Given** bu gün `code` daşıyan cavablar (`refresh_missing`, `refresh_stale`,
   `refresh_invalid`, `refresh_reused`, `refresh_expired`, `origin_forbidden`), **When** eyni hal təkrarlanır, **Then** eyni `code` dəyəri eyni adlı
   sahədə qayıdır.
5. **Given** OpenAPI spec, **When** istənilən əməliyyatın xəta cavabına baxılır, **Then** o,
   bir ortaq xəta sxeminə istinad edir; `info.description`-dakı "üç forma" izahı və
   `x-known-issues`-dakı müvafiq bəndlər yenilənib.

---

### User Story 4 - Admin panel dəyişiklik olmadan işləməyə davam edir (Priority: P2)

API yeni forma ilə deploy olunur, panel isə hələ köhnə versiyadadır. Redaktor heç bir fərq
hiss etməməlidir: biznes qaydası xətaları eyni mətnlə, 401/403/404/500 isə bu gün olduğu kimi
panelin öz (lokallaşdırılmış) mesajı ilə görünür; sessiyanın yenilənməsi pozulmur.

**Why this priority**: Deploy-un panel deploy-undan asılı olmaması (Konstitusiya Maddə II.3 —
iki ayrı MR, ayrıca deploy) və reqressiyanın qarşısını almaq. Panel uyğunlaşması ayrıca
task olduğundan bu, keçid dövrünün zəmanətidir.

**Independent Test**: API yeni versiyada, panel dəyişməmiş halda: biznes qaydası xətası
(məs. uşaqlı səhifəni silmək), mövcud olmayan qeyd, vaxtı keçmiş sessiya, iki tabda token
yeniləməsi və server xətası ssenariləri keçirilir; göstərilən mesajlar bu günkü ilə müqayisə
edilir. Panelin `npm run verify`-ı dəyişmədən yaşıl qalır.

**Acceptance Scenarios**:

1. **Given** panel dəyişməyib, **When** biznes qaydası xətası (400/409) qayıdır, **Then** panel
   bu günkü eyni mətni göstərir.
2. **Given** panel dəyişməyib, **When** 401, 403 və ya 500 qayıdır, **Then** panel bu gün
   olduğu kimi öz lokallaşdırılmış mesajını göstərir — ingiliscə server mətni yox.
3. **Given** iki tab eyni anda tokeni yeniləyir, **When** biri `refresh_stale` alır, **Then**
   panel bu gün olduğu kimi bir dəfə təkrar cəhd edir və sessiya qorunur.
4. **Given** binding xətası (səhv tipli sahə), **When** forma göndərilir, **Then** sahə
   xətaları bu gün olduğu kimi forma sahələrinə düşür.

---

### Edge Cases

- **Əvvəlcədən yoxlama + yarış**: controller mövcudluğu yoxlayır (username, slug), amma iki
  sorğu eyni anda yoxlamadan keçir. Username/email üçün ardıcıl halla eyni 409, fayl üçün
  ardıcıl halla eyni uğurlu nəticə; slug üçün isə qəsdən 409 (ardıcıl halda `-2` verilir) —
  bax FR-004.
- **Bir sorğuda bir neçə DB pozuntusu**: DB yalnız birincisini bildirir; cavab yalnız onu
  əks etdirir — hamısını sadalamaq 8b-nin işidir.
- **Çox addımlı yazma** (məs. əvvəl obyekt anbarına fayl, sonra DB qeydi): DB addımı rədd
  olunanda anbardakı obyekt qala bilər. Məzmun-ünvanlı saxlandığı üçün bu zərərsizdir
  (növbəti eyni upload onu təkrar istifadə edir), amma DB-də yarımçıq qeyd qalmamalıdır.
- **Audit**: audit qeydi əsas yazma ilə eyni əməliyyatda saxlanılırsa, rədd olunan yazma
  audit qeydi yaratmır; ayrıca saxlanılırsa, plan bunu yoxlayıb təsdiqləməlidir.
- **Xəritələnməyən DB xətası** (deadlock, bağlantı kəsilməsi, vaxt aşımı): 500 qalır, amma
  vahid formada və izləmə identifikatoru ilə; bu spec onları 4xx-ə çevirmir.
- **Rəqəm daşması / NOT NULL / CHECK pozuntusu** (review-da adı çəkilməyib, OpenAPI
  `x-known-issues`-da "out-of-range decimal" var): eyni sinif müştəri xətasıdır → 400.
- **Gövdə həddən böyük** (upload limiti): bu gün çərçivə statusu verir; status dəyişmir, forma
  vahid olur.
- **Media preview-un 304 cavabı** xəta deyil — toxunulmur. `415` cavabındakı əlavə
  `mimeType` sahəsi vahid formanın əlavə sahəsi kimi qorunur.
- **Login cavabları** (401 səhv parol, 429 kilid): spec 011/012-nin müəyyən etdiyi davranış
  — eyni mesaj, eyni vaxt profili, istifadəçi mövcudluğunun açılmaması — dəyişməməlidir;
  yalnız forma vahidləşir.
- **Development mühiti**: developer rahatlığı üçün 500 cavabında istisna detalı göstərilə
  bilər; bu, Staging/Production-a heç vaxt keçməməlidir.
- **Rate limiter / CORS rəddi** çərçivə səviyyəsində baş verirsə (controller-ə çatmadan),
  onlar da vahid formada olmalıdır və ya istisna planda əsaslandırılmalıdır.

## Requirements *(mandatory)*

### Functional Requirements

**Qlobal tutucu (US1, US2)**

- **FR-001**: API işlənməmiş **hər** istisnanı bir yerdə tutmalı və vahid xəta cavabına
  çevirməlidir; heç bir xəta boş gövdəli 500 ilə qaytarılmamalıdır.
- **FR-002**: DB-nin yazmanı rədd etdiyi hallar aşağıdakı kimi xəritələnməlidir:

  | DB xəta sinfi | Status | Mesajın mənası |
  |---|---|---|
  | Unikal məhdudiyyət pozuntusu | 409 | "Bu dəyər artıq mövcuddur" (mümkünsə hansı sahə) |
  | İstinad məhdudiyyəti — yaratma/redaktədə (mövcud olmayan qeydə istinad) | 400 | "İstinad olunan qeyd mövcud deyil" |
  | İstinad məhdudiyyəti — silmədə (qeyd istifadə olunur) | 409 | "Qeyd başqa məzmun tərəfindən istifadə olunur" |
  | Sütun uzunluğunun aşılması | 400 | "Dəyər icazə verilən uzunluqdan uzundur" |
  | Rəqəm aralığının aşılması, NOT NULL, CHECK pozuntusu | 400 | "Dəyər qəbul olunmur" |
  | Digər DB xətaları | 500 | Ümumi mesaj |

- **FR-003**: Review-da adı çəkilən unikal məhdudiyyətlər (səhifə/xəbər/qanun/press
  release/pul nişanı slug-ları, istifadəçi username və email, media anbar açarı) üçün mesaj
  **toqquşan sahəni** adlandırmalı və mümkün olduqda ardıcıl sorğudakı mövcud mesajla eyni
  mənanı daşımalıdır. Siyahıda olmayan məhdudiyyət üçün ümumi 409 mesajı kifayətdir.
- **FR-004**: Yarış halında nəticə (Q1 qərarı, 2026-10-06 — seçim C):
  - **Slug toqquşması** → 409, toqquşan slug sahəsini adlandıran mesajla; locale birmənalı
    müəyyən olunanda o da göstərilir (heç vaxt səhv locale göstərilmir).
    Avtomatik yenidən cəhd yoxdur; redaktor yenidən göndərəndə ardıcıl qayda (`-2`, `-3`
    şəkilçisi) tətbiq olunur.
  - **Eyni faylın upload-u** (paralel və ya checksum üzrə köhnə dublikat olduqda ardıcıl) →
    uğurlu cavab, **mövcud media qeydi** qaytarılır — ardıcıl təkrar upload ilə eyni nəticə.
    Bir checksum-a bir neçə köhnə qeyd uyğun gələrsə, onlardan biri müəyyən (sabit) qaydada
    seçilir; heç bir halda 500 yoxdur.
  - **Username / email yarışı** → 409, ardıcıl sorğudakı mesajın mənası ilə.
- **FR-005**: Rədd edilən sorğu bazada heç bir yarımçıq qeyd və audit jurnalında heç bir
  qeyd qoymamalıdır.
- **FR-006**: Hər xəta cavabı izləmə identifikatoru daşımalı; 5xx cavablarında eyni
  identifikatorla istisnanın tam detalı server loguna yazılmalıdır. 4xx-ə xəritələnən DB
  xətaları server xətası səviyyəsində loglanmamalıdır (monitorinqdə əsl 500-lərlə qarışmasın).
- **FR-007**: Development-dən başqa heç bir mühitdə xəta cavabı SQL mətni, cədvəl, sütun və
  ya məhdudiyyət adı, stack trace və ya daxili istisna mesajı daşımamalıdır.
- **FR-008**: Müştərinin kəsdiyi sorğu server xətası kimi loglanmamalı və 500 sayılmamalıdır.

**Vahid forma (US3, US4)**

- **FR-009**: API-nin qaytardığı hər 4xx/5xx cavabı — controller-in açıq qaytardığı,
  çərçivənin (binding, autentifikasiya, avtorizasiya, gövdə limiti) yaratdığı və qlobal
  tutucunun yaratdığı — eyni standart formada (RFC 7807) və problem details media tipi ilə
  olmalıdır: status, başlıq, izah, izləmə identifikatoru; validation xətalarında sahə üzrə
  xəta siyahısı.
- **FR-010**: Keçid uyğunluğu: mövcud admin panel dəyişiklik olmadan bu günkü kimi işləməlidir
  (US4). Konkret olaraq: (a) bu gün `message` qaytaran hər cavab eyni mətni `message`
  sahəsində qaytarmağa davam edir; (b) bu gün gövdəsiz qayıdan 401/403/500 cavabları panelin
  öz lokallaşdırılmış mesajını göstərmək əvəzinə göstərəcəyi yeni mətn sahəsi əlavə etmir;
  (c) binding xətalarının sahə siyahısı bu günkü açar formasını saxlayır.
- **FR-011**: Bu gün `code` daşıyan cavablar (`refresh_missing`, `refresh_stale`,
  `refresh_invalid`, `refresh_reused`, `refresh_expired`, `origin_forbidden`) eyni dəyəri eyni adlı sahədə saxlamalıdır. Yeni maşın oxuyan kodlar
  əlavə edilərsə, onlar mövcud panelin status əsaslı xəta təsnifatını dəyişməməlidir.
- **FR-012**: Bütün controller-lərdəki mövcud xəta cavabları (bax "Kodda faktiki vəziyyət")
  vahid formaya keçirilməlidir; status kodları və mesaj mətnləri **dəyişmir** — bu spec
  davranışı yox, formanı dəyişir (FR-002-nin 500→4xx halları istisnadır).
- **FR-013**: Vahid forma bir yerdə müəyyən olunmalı və yeni endpoint-lər onu təkrar yazmadan
  istifadə etməlidir; spec 016 hissə 8b-nin validation xətaları da eyni formadan istifadə edir.
- **FR-014**: Login axınının (spec 011/012) xəta cavabları yalnız forma baxımından dəyişir;
  mesaj, status, vaxt profili və istifadəçi mövcudluğunu açmamaq qorunur.

**Kontrakt (spec-first)**

- **FR-015**: Kontrakt dəyişikliyi kod dəyişikliyindən **əvvəl** `openapi/`-də edilməlidir:
  bir ortaq xəta sxemi; bütün əməliyyatların xəta cavabları ona istinad edir; yeni 400/409
  cavabları (FR-002) müvafiq əməliyyatlarda sənədləşdirilir; `info.description`-dakı "üç
  forma" izahı və `x-known-issues`-dakı xəta forması, "500 — exception handler yoxdur" və
  paralel upload bəndləri həll olunan hissəyə qədər yenilənir.

### Key Entities

- **Xəta cavabı (problem details)**: status, qısa başlıq, insan oxuyan izah, izləmə
  identifikatoru; keçid üçün `message`; lazım olduqda sabit maşın oxuyan `code`; validation
  hallarında sahə yolu → mesajlar siyahısı; konkret hallarda əlavə sahələr (məs. `mimeType`).
- **DB xəta sinfi → status xəritəsi**: FR-002 cədvəli; bir yerdə saxlanılır.
- **Məlum unikal məhdudiyyətlər → sahə xəritəsi**: FR-003-dəki siyahı; toqquşan sahəni
  adlandırmaq üçün.
- **İzləmə identifikatoru**: cavabı server logundakı qeydlə əlaqələndirən dəyər.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Review-da sadalanan beş hal (slug yarışı, paralel eyni upload, paralel eyni
  username, mövcud olmayan locale, uzun dəyər) üçün 5-dən 5-i 500 yox, FR-002/FR-004-ə uyğun
  status qaytarır.
- **SC-002**: Controller-lərin açıq qaytardığı xəta cavablarının 100%-i və çərçivənin
  yaratdığı 400/401/403/404/413/415/429/500 cavablarının hamısı eyni formadadır; kodda köhnə
  formada (`{message}` anonim obyekt, gövdəsiz 404) xəta cavabı qalmır.
- **SC-003**: Production konfiqurasiyasında heç bir xəta cavabında SQL, məhdudiyyət adı və ya
  stack trace yoxdur (yuxarıdakı hər halda yoxlanılır).
- **SC-004**: Hər 500 cavabının izləmə identifikatoru ilə server logunda müvafiq qeyd 1
  dəqiqədən az müddətdə tapılır.
- **SC-005**: Dəyişməmiş admin panel US4-ün dörd ssenarisində bu günkü ilə eyni mesajları
  göstərir; `npm run verify` yaşıldır.
- **SC-006**: OpenAPI lint və bundle yaşıldır; spec-də xəta cavabları üçün bir ortaq sxem
  var və köhnə formalara istinad qalmayıb.
- **SC-007**: Deploy-dan sonrakı ilk həftədə 4xx-ə xəritələnən səbəblərdən (unikal, istinad,
  uzunluq) yaranan 500 sayı sıfırdır.

## Assumptions

- **RFC 7807 forması + keçid sahələri.** Vahid forma problem details-dir, əlavə olaraq
  `message` (və mövcud olduğu yerdə `code`) saxlanılır. Bu, panelin dəyişmədən işləməsini
  təmin edir, ona görə panel uyğunlaşması **məcburi deyil, təkmilləşdirmədir** (ayrıca task):
  API-ni paneldən əvvəl, ayrıca deploy etmək olur.
- **Status kodları və mətnlər dəyişmir.** FR-002-də 500-dən 4xx-ə keçən hallardan başqa, heç
  bir endpoint-in statusu və mesaj mətni dəyişmir; mesajlar bu gün olduğu kimi ingiliscədir.
- **İstinad məhdudiyyəti üçün iki status** (yazmada 400, silmədə 409) bu gün kodda əl ilə
  edilən yoxlamaların mənası ilə uyğundur (mövcud olmayan istinad → 400, "referenced by" →
  409).
- **Əlavə DB xəta sinifləri** (rəqəm aralığı, NOT NULL, CHECK) review-da adı çəkilməyib, amma
  eyni sinifdir və OpenAPI `x-known-issues`-da qeyd olunub; xərci cüzidir, ona görə əhatəyə
  daxil edilib.
- **Media anbarında tapılmayan fayl** üçün mövcud `catch` (404) qorunur, yalnız forması
  vahidləşir.
- **Checksum üzrə köhnə dublikatlar** (ardıcıl upload-da da 500 verən hal) FR-004 ilə həll
  olunur (mövcud qeydlərdən biri qaytarılır); köhnə dublikatları birləşdirmək və checksum-u
  unikal etmək (migration) əhatədən kənardır.
- **SP**: Q1 seçimi C upload dedup-u üçün təxminən +1 SP əlavə edir (cəmi ~9 SP). Slug yarışında
  avtomatik yenidən cəhd qəsdən edilmir — nadir haldır, redaktor yenidən göndərir.
- **`api-cbar` əhatədən kənardır.** Public API-də eyni problem varsa, ayrıca task-dır.
- **Panel uyğunlaşması əhatədən kənardır** (review-un qeydi): sahə xətalarını sahənin altında
  göstərmək, yeni `code`-lardan istifadə və s. — ayrıca task.
- **Verification**: lokalda .NET SDK yoxdur — build GitLab pipeline-ında, yoxlama `test`
  mühitində endpoint-ləri əl ilə çağırmaqla aparılır (Konstitusiya Maddə VIII.1). Paralel
  yarış halları eyni anda göndərilən sorğularla yoxlanılır.
- **Deploy**: yalnız `api-cbar-admin`; deploy sırası dəyişmir, migration yoxdur. Spec 016
  hissə 8b bundan sonra icra olunur.
