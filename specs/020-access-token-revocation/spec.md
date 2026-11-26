# Feature Specification: Admin API — giriş tokeninin dərhal ləğvi (access token revocation)

**Feature Branch**: `020-access-token-revocation`

**Created**: 2026-10-08

**Status**: Draft

**Input**: User description: "12. Access token revocation. — 5 SP. Deaktivasiya, parol reset və rol endirilməsindən sonra köhnə JWT 15 dəqiqə işləməyə davam edir. Admin panel üçün OnTokenValidated-də security stamp / IsActive yoxlaması (Redis cache ilə) tövsiyə olunur. SP izahı: migration (security_stamp), hər iki Cbar.Domain kopyası, claim, OnTokenValidated və Redis cache-in invalidasiyası."

**Əhatə olunan proyektlər**: `api-cbar-admin` (əsas iş) və `api-cbar` (yalnız `Cbar.Domain`
kopyasının eyniləşdirilməsi — Konstitusiya V.1; `api-cbar` yeni məlumatı oxumur).
`web-cbar-admin-new` paneli **dəyişmir**: o, 401-də artıq səssiz yeniləmə edib sorğunu bir
dəfə təkrarlayır (spec 005), bu feature məhz həmin axına söykənir.

**`product-host` istinadı (Konstitusiya Maddə I.2)**: `common/components/identity/UserIdentity.php`
(`findIdentity` — istifadəçi hər sorğuda sessiyadakı id ilə bazadan yenidən yüklənir) +
`common/config/components.php` (`user` komponenti). Köhnə sistemdə sessiya serverdə yaşadığı
üçün silinmiş istifadəçi və rol dəyişikliyi **növbəti sorğuda** təsir edir. Yeni sistemdə
özünü-daşıyan 15 dəqiqəlik token bu davranışı itirib; bu feature onu qaytarır.

**Hazırkı vəziyyət (ölçülüb, 2026-10-08)**:

- Giriş tokeni 15 dəqiqəlikdir və yalnız imza, issuer, audience və müddət yoxlanılır
  (`Program.cs`); tokendə istifadəçi id-si, adı və rolu var, istifadəçinin hazırkı vəziyyəti
  heç yerdə yoxlanmır.
- Deaktivasiya, parol reset və silmə istifadəçinin **yeniləmə** tokenlərini artıq ləğv edir
  (`UsersController` → `RevokeAllForUserAsync`, spec 005 US4). Amma əlindəki giriş tokeni
  müddəti bitənə qədər — 15 dəqiqə + 30 saniyə saat fərqi — **bütün yazma əməliyyatları üçün
  işləyir**.
- **Rol dəyişikliyi heç nəyi ləğv etmir** (kodda şərh: "the next refresh issues a token with
  the current role"). Admin rolundan endirilən istifadəçi 15 dəqiqəyə qədər istifadəçi
  idarəetməsinə (yeganə `admin`-only bölmə) girişini saxlayır.
- `users` cədvəli paylaşılan mühitlərdə başqa DB roluna məxsusdur: `ALTER TABLE users`
  "must be owner of table" ilə yıxılır (`0004-admin-refresh-tokens.sql`-dəki şərh; spec 012
  eyni səbəbdən sütun əlavəsindən imtina edib). Yəni təklifdəki `users.security_stamp` sütunu
  deploy-u bloklayar — məlumat ayrıca cədvəldə saxlanmalıdır.
- `api-cbar-admin`-də Redis **qoşulmayıb**: nə paket, nə `ConnectionStrings:Redis`, nə Vault
  açarı var (Redis yalnız lokal `docker-compose.yml`-də və `api-cbar`-da). Bax Q1.

## Clarifications

### Session 2026-10-08

- Q1 (keş strategiyası / ləğv gecikməsi): **C — keşsiz.** Hər qorunan sorğuda istifadəçinin
  hazırkı versiyası və aktivliyi birbaşa bazadan bir açar üzrə sorğu ilə oxunur; ləğv növbəti
  sorğuda qüvvəyə minir. Redis tövsiyəsi bu mərhələdə **qəbul edilmir** (yeni asılılıq, Vault
  açarı, DevOps). Əlavə yük `test`-də ölçülür; ölçmə əsaslı problem göstərərsə, keş ayrıca
  spec ilə əlavə olunur.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Deaktiv edilmiş və ya silinmiş istifadəçi dərhal kəsilir (Priority: P1)

Administrator bir redaktorun hesabını deaktiv edir (məsələn, işdən çıxıb və ya hesabın
oğurlandığından şübhələnilir) və ya silir. Redaktorun açıq paneli növbəti əməliyyatda giriş
ekranına düşür; əlindəki token heç bir məlumatı oxuya və ya dəyişə bilmir.

**Why this priority**: Bank mühitində deaktivasiyanın əsas məqsədi girişi **indi** kəsməkdir.
15 dəqiqəlik pəncərə oğurlanmış hesabla məzmunun dəyişdirilməsi və ya silinməsi üçün kifayət
qədər uzundur.

**Independent Test**: A istifadəçisi ilə daxil ol → başqa brauzerdə admin olaraq A-nı deaktiv
et → A-nın tabında dərhal istənilən siyahını aç və ya yadda saxla → giriş ekranı; A-nın
əvvəlki tokeni ilə birbaşa API sorğusu 401 qaytarır.

**Acceptance Scenarios**:

1. **Given** A istifadəçisinin etibarlı giriş tokeni var, **When** admin A-nı deaktiv edir,
   **Then** həmin tokenlə edilən növbəti sorğu (oxuma və ya yazma) 401 ilə rədd olunur və
   heç bir dəyişiklik yadda saxlanmır.
2. **Given** A deaktiv edilib, **When** A-nın paneli 401-dən sonra səssiz yeniləmə cəhd edir,
   **Then** yeniləmə də rədd olunur (spec 005) və A "sessiya bitdi" bildirişi ilə giriş
   ekranına düşür.
3. **Given** A silinib (soft delete), **When** A-nın köhnə tokeni ilə sorğu gəlir, **Then**
   sorğu 401 ilə rədd olunur.
4. **Given** A yenidən aktivləşdirilib, **When** A təzədən daxil olur, **Then** normal işləyir;
   deaktivasiyadan **əvvəl** verilmiş köhnə token isə rədd olunmağa davam edir.

---

### User Story 2 - Parol reset köhnə tokenləri etibarsız edir (Priority: P1)

Administrator şübhəli hesabın parolunu sıfırlayır. Köhnə parolla alınmış bütün giriş tokenləri
dərhal işləməz olur; istifadəçi yalnız yeni parolla daxil olaraq davam edə bilər.

**Why this priority**: Parol reset adətən "hesab oğurlanıb" ssenarisinin cavabıdır; hücumçunun
əlindəki token reset-dən sağ çıxırsa, reset öz məqsədinə çatmır.

**Independent Test**: A ilə daxil ol, tokeni saxla → admin olaraq A-nın parolunu sıfırla →
saxlanmış tokenlə sorğu 401; yeni parolla giriş uğurlu.

**Acceptance Scenarios**:

1. **Given** A-nın parol reset-dən əvvəl alınmış tokeni var, **When** reset-dən sonra həmin
   tokenlə sorğu gəlir, **Then** 401 ilə rədd olunur.
2. **Given** parol sıfırlanıb, **When** A yeni parolla daxil olur, **Then** yeni token normal
   işləyir.

---

### User Story 3 - Rol dəyişikliyi növbəti sorğuda qüvvəyə minir (Priority: P2)

Administrator bir istifadəçini `admin` rolundan redaktor roluna endirir. Həmin istifadəçi
paneldən çıxarılmır: növbəti sorğuda köhnə token rədd olunur, panel səssiz yenilənir və yeni
token artıq yeni rolu daşıyır — `admin`-only bölmələr dərhal bağlanır.

**Why this priority**: İmtiyazın geri alınması deaktivasiya qədər təcili olmasa da, endirilmiş
admin bu gün 15 dəqiqə ərzində başqa istifadəçiləri yarada, parollarını sıfırlaya və ya
silə bilir. İstifadəçi təcrübəsi pozulmur — sessiya yaşayır, yalnız rol dəyişir.

**Independent Test**: Admin B ilə daxil ol → başqa admin olaraq B-ni redaktor et → B-nin
tabında istifadəçilər siyahısını aç → giriş ekranı görünmədən "icazə yoxdur" (403) vəziyyəti;
B-nin digər bölmələri işləməyə davam edir.

**Acceptance Scenarios**:

1. **Given** B admin rolu ilə tokenə malikdir, **When** rolu endirilir və B istifadəçi
   idarəetməsinə sorğu göndərir, **Then** köhnə token rədd olunur, səssiz yeniləmə yeni rolla
   token verir və təkrarlanan sorğu 403 alır — giriş ekranı göstərilmir.
2. **Given** B-nin rolu yüksəldilib, **When** B növbəti sorğunu göndərir, **Then** yeni rolun
   icazələri dərhal əlçatandır.
3. **Given** admin yalnız B-nin email-ini dəyişir (rol, aktivlik eyni qalır), **When** B
   sorğu göndərir, **Then** B-nin tokeni etibarlı qalır — lazımsız yeniləmə baş vermir.

---

### Edge Cases

- **Deploy anı**: bu feature-dən əvvəl verilmiş tokenlərdə yeni "versiya" məlumatı yoxdur. Belə
  token etibarsız sayılır; panel bir dəfə səssiz yenilənir, istifadəçi fərq hiss etmir
  (yeniləmə tokeni etibarlıdırsa).
- **Eyni anda bir neçə sorğu**: rol dəyişikliyindən sonra paralel gələn sorğuların hamısı rədd
  olunur; panel yalnız bir yeniləmə edir (spec 005 US2 AS2) — bu feature onu dəyişmir.
- **Adminin öz hesabı**: admin öz rolunu və ya aktivliyini dəyişirsə (spec 015 son-admin
  qaydası icazə verdiyi halda), öz tokeni də eyni qayda ilə rədd olunur.
- **Hesab kilidi (spec 012)**: uğursuz giriş cəhdlərinə görə kilidlənmə tokenləri **ləğv
  etmir** — əks halda yanlış parolu təkrarlayan hər kəs işləyən istifadəçini paneldən ata
  bilərdi.
- **Uğursuz əməliyyat**: rədd olunan dəyişiklik (validasiya, son-admin qaydası, 409) heç bir
  tokeni ləğv etmir — yalnız həqiqətən yadda saxlanmış dəyişiklik.
- **Yoxlama mənbəyi əlçatmaz olduqda**: istifadəçinin hazırkı vəziyyəti yoxlana bilmirsə
  (baza əlçatmaz), sorğu **qəbul edilmir** (fail closed).
- **Login, refresh, logout** endpoint-ləri bu yoxlamadan keçmir (onlar giriş tokeni tələb
  etmir); `/healthz` də.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Hər admin istifadəçisinin **təhlükəsizlik versiyası** (security stamp) olmalıdır;
  istifadəçiyə ilk token veriləndə (və ya versiya ilk dəfə dəyişəndə) avtomatik təyin olunur.
- **FR-002**: Verilən hər giriş tokeni istifadəçinin verilmə anındakı təhlükəsizlik versiyasını
  daşımalıdır.
- **FR-003**: Qorunan hər sorğuda sistem tokenin daşıdığı versiyanı istifadəçinin hazırkı
  versiyası ilə müqayisə etməli və istifadəçinin hazırda **aktiv və silinməmiş** olduğunu
  yoxlamalıdır; uyğunsuzluqda sorğu 401 ilə rədd olunmalı və controller-ə çatmamalıdır.
- **FR-004**: Təhlükəsizlik versiyası bu hadisələrdə dəyişməlidir: deaktivasiya, silmə, parol
  reset, rol dəyişikliyi (istənilən istiqamətdə). Email və digər sahələrin dəyişikliyi versiyanı
  dəyişməməlidir.
- **FR-005**: Versiya dəyişikliyi istifadəçi dəyişikliyi ilə **eyni əməliyyatda** yadda
  saxlanmalıdır — dəyişiklik rədd olunarsa, versiya da dəyişməməlidir.
- **FR-006**: Versiya dəyişikliyi yadda saxlanandan sonra köhnə tokenlə gələn **növbəti
  sorğu** rədd olunmalıdır — gecikmə pəncərəsi yoxdur. Yoxlama hər sorğuda istifadəçinin
  hazırkı vəziyyətini mənbədən oxuyur; aralıq keş saxlanmır (Q1).
- **FR-007**: Rədd cavabı mövcud 401 formatında olmalıdır (spec 018 — `title`/`message`
  olmadan), ki panel onu adi "token bitdi" kimi emal etsin və səssiz yeniləməyə keçsin.
- **FR-008**: Mövcud davranış qorunmalıdır: deaktivasiya, parol reset və silmə istifadəçinin
  yeniləmə tokenlərini də ləğv etməyə davam edir; rol dəyişikliyi yeniləmə tokenlərini ləğv
  **etmir** (istifadəçi çıxarılmır, yalnız yeni rolla token alır).
- **FR-009**: Səssiz yeniləmə yalnız aktiv istifadəçiyə və hazırkı versiya ilə token verməlidir.
- **FR-010**: Rədd olunan hər token server loguna istifadəçi id-si və səbəbi (deaktiv / versiya
  uyğunsuzluğu / silinib / versiyasız token) ilə yazılmalıdır; tokenin özü loga yazılmamalıdır.
- **FR-011**: Yeni məlumat strukturu hər iki `Cbar.Domain` kopyasında bayt-bayt eyni əks
  olunmalıdır; migration `users` cədvəlini dəyişməməli (paylaşılan mühitlərdə sahiblik
  məhdudiyyəti) və mövcud bazaya qarşı təkrar işlədilə bilən olmalıdır.
- **FR-012**: Endpoint siyahısı dəyişmir; admin API-nin OpenAPI spec-ində qorunan
  endpoint-lərin 401 təsviri "token ləğv oluna bilər" mənasını əks etdirməlidir.

### Key Entities *(include if feature involves data)*

- **İstifadəçi təhlükəsizlik versiyası**: hər admin istifadəçisinə bir qeyd — istifadəçi,
  hazırkı versiya dəyəri (təxmin edilə bilməyən), son dəyişmə anı. İstifadəçi ilə birə-bir;
  `users` cədvəlindən ayrı saxlanılır.
- **Giriş tokeni** (mövcud): əlavə olaraq versiya dəyərini daşıyır.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Deaktivasiya, silmə və ya parol reset-dən sonra köhnə tokenlə edilən sorğuların
  **100%-i** dəyişiklikdən dərhal sonrakı ilk sorğudan etibarən rədd olunur (bu gün: 15 dəqiqə
  30 saniyəyə qədər qəbul olunur).
- **SC-002**: `admin` rolundan endirilmiş istifadəçi dəyişiklikdən dərhal sonra istifadəçi
  idarəetməsində heç bir əməliyyat edə bilmir, və bu zaman giriş ekranına düşmür.
- **SC-003**: Deploy-dan sonra aktiv sessiyası olan redaktorların heç biri yenidən giriş etmək
  məcburiyyətində qalmır (bir dəfəlik səssiz yeniləmə istisna).
- **SC-004**: Redaktorun gündəlik işində qəbul edilən sorğuların cavab müddəti hiss olunacaq
  dərəcədə artmır: tipik siyahı və yadda saxlama əməliyyatları feature-dən əvvəlki ilə eyni
  sürətdə görünür.
- **SC-005**: Versiyanı dəyişməyən istifadəçi redaktəsi (məs. yalnız email) heç bir aktiv
  sessiyaya təsir etmir.

## Assumptions

- Ləğv yalnız admin API-yə aiddir; public `api-cbar` token qəbul etmir və dəyişmir (yalnız
  `Cbar.Domain` kopyası sinxronlaşdırılır).
- "Rol endirilməsi" istənilən rol dəyişikliyi kimi şərh olunur: rollar iyerarxik olmaya bilər
  (spec 008), və yüksəlişin də dərhal təsir etməsi zərərsizdir.
- Giriş tokeninin 15 dəqiqəlik müddəti dəyişmir; bu feature onu qısaltmır, ləğvi əlavə edir.
- `web-cbar-admin-new` paneli dəyişiklik tələb etmir: 401 → səssiz yeniləmə → bir dəfə təkrar
  axını (spec 005) mövcuddur və yoxlanılıb (`shared/api/interceptors.ts`).
- İstifadəçinin öz parolunu dəyişməsi üçün endpoint hazırda yoxdur; əlavə olunarsa, eyni
  qayda (FR-004) ona da tətbiq olunur.
- Deploy sırası standartdır: əvvəl `api-cbar-admin` (migration), sonra `api-cbar`
  (`Cbar.Domain` sinxronu) — iki ayrı merge request.
- Lokal mühitdə .NET SDK yoxdur; backend yoxlaması `test` mühitində publish-dən sonra aparılır.
