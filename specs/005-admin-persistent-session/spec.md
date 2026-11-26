# Feature Specification: Admin panel — davamlı sessiya (httpOnly cookie + refresh token)

**Feature Branch**: `005-admin-persistent-session`

**Created**: 2026-09-23

**Status**: Draft

**Input**: User description: "api-cbar-admin və web-cbar-admin-new login sistemində httpOnly cookie set edə bilərik? Token hal-hazırda React tərəfdə state-də saxlanılır, hər səhifə yenilənəndə yenidən login olmalı oluram. Refresh token məntiqini də implement etmək olarsa onu da tətbiq edək, olmazsa bununla bağlı məlumat ver."

**Əhatə olunan proyektlər**: `api-cbar-admin` (CMS API) və `web-cbar-admin-new` (yeni admin panel).
Köhnə `web-cbar-admin` (Chakra) **toxunulmur** — o, cutover-ə qədər bugünkü davranışla
(yalnız access token) işləməyə davam edir.

**`product-host` istinadı (Konstitusiya Maddə I.2)**: `admin/controllers/LoginController`
+ `admin/viewmodels/LoginViewModel` + `common/config/components.php` (`user` komponenti:
`enableAutoLogin`, `authTimeout = 28800` — 8 saat hərəkətsizlik). Köhnə sistemdə sessiya
server tərəfində saxlanılır və brauzer yenilənməsindən sağ çıxır; bu feature həmin
davranışı yeni sistemə qaytarır. Köhnənin "məni xatırla" (1 il) seçimi aşağıdakı
Q1-ə bağlıdır.

**Hazırkı vəziyyət (ölçülüb)**:

- API yalnız qısaömürlü (15 dəq) giriş tokeni verir; yeniləmə, çıxış və "mən kiməm"
  əməliyyatı yoxdur (`AuthController`-də `TODO(Phase 2): refresh tokens`).
- Sxemdə `refresh_tokens` cədvəli (istifadəçi, token hash-i, bitmə, ləğv, IP,
  user-agent) və hər iki `Cbar.Domain` kopyasında ona uyğun model **artıq mövcuddur**,
  amma heç yerdə istifadə olunmur.
- Panel tokeni yalnız yaddaşda saxlayır (spec 001 FR-010) — yenilənmədə sessiya
  itir; 15 dəqiqədən sonra isə işləyən istifadəçi də çıxarılır.
- Deploy-da panel və API ayrı host-lardadır, panel API-yə cross-origin sorğu
  göndərir; API-nin CORS siyasəti kimlik məlumatlı (credentialed) sorğuya icazə vermir.

**Cavab (istifadəçinin sualına)**: Bəli, həm httpOnly cookie, həm refresh token tətbiq
oluna bilər — lazımi məlumat strukturu artıq bazadadır. Yeganə şərt: brauzerin cookie-ni
göndərməsi üçün panel və API **eyni sayt** (eyni qeydiyyatlı domen) altında olmalı və ya
panel API-yə öz host-u üzərindən proxy ilə getməlidir (bax Q2).

## Clarifications

### Session 2026-09-23

- Q1 (sessiya müddəti): **Plan default-u** (istifadəçi təsdiqi gözlənilir) — 8 saat hərəkətsizlik, maksimum 7 gün, "məni xatırla" yoxdur; konfiqurasiya olunandır (research R0, R7). Köhnə sistemin 1 illik "məni xatırla"sı bu default ilə ləğv olunur.
- Q2 (deploy domenləri): Prod API-nin əsas ünvanı **`api-cbar-admin.cbar.az`**-dır (API chart-ı düzgündür). Panelin `.env.production`-dakı `api-cbar-admin.e-cbar.az` səhvdir və düzəldilməlidir.
- Q2a (prod panel host-u): **Plan default-u** (istifadəçi/DevOps təsdiqi gözlənilir) — panel `cbar.az` altına köçür (məs. `cbar-admin.cbar.az`). `cbar-admin.e-cbar.az`-da qalsa cookie bloklanır; alternativ nginx `/api` proxy-dir (research R0, R3). API kodu hər iki halda eynidir.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Səhifə yenilənəndə sessiya qalır (Priority: P1)

Redaktor admin panelə daxil olub işləyir. Brauzerdə səhifəni yeniləyir (F5), yeni tabda
panelin başqa ünvanını açır və ya brauzeri bağlayıb yenidən açır. Hər dəfə eyni
ekrana, yenidən giriş etmədən qayıdır.

**Why this priority**: İstifadəçinin birbaşa şikayəti budur; hər yenilənmədə giriş
gündəlik iş axınını qırır və redaksiya məzmununu (yadda saxlanmamış forma xaric) itirmək
riskini artırır.

**Independent Test**: Daxil ol → istənilən siyahı səhifəsinə keç → səhifəni yenilə →
giriş ekranı görünmədən eyni səhifə açılır və məlumat yüklənir.

**Acceptance Scenarios**:

1. **Given** istifadəçi daxil olub və sessiyası etibarlıdır, **When** səhifəni yeniləyir,
   **Then** giriş ekranı göstərilmədən eyni ünvan açılır və istifadəçi adı/rolu görünür.
2. **Given** istifadəçi daxil olub, **When** paneli yeni tabda açır, **Then** həmin tab da
   yenidən giriş tələb etmədən işləyir.
3. **Given** istifadəçi daxil olub, **When** brauzeri bağlayıb sessiya müddəti ərzində
   yenidən açır, **Then** Q1-də seçilən siyasətə uyğun olaraq ya daxil olmuş qalır, ya da
   giriş ekranına düşür.
4. **Given** sessiyası olmayan istifadəçi, **When** qorunan ünvanı birbaşa açır, **Then**
   giriş ekranına yönləndirilir, girişdən sonra həmin ünvana qaytarılır.

---

### User Story 2 - İşləyən istifadəçi 15 dəqiqədən sonra çıxarılmır (Priority: P1)

Redaktor uzun bir səhifəni 30–40 dəqiqə redaktə edir və "Yadda saxla" düyməsini basır.
Qısaömürlü giriş tokeni arxa planda səssizcə yenilənir; yadda saxlama uğurlu olur və
istifadəçi heç bir fasilə hiss etmir.

**Why this priority**: Refresh məntiqi olmadan yenilənmədən sağ çıxan sessiya da 15
dəqiqədən sonra bitir — yəni US1 tək başına problemin yarısını həll edir. Bugünkü
davranışda uzun redaktə yadda saxlama anında məlumat itkisinə gətirir.

**Independent Test**: Daxil ol → giriş tokeninin müddətindən uzun gözlə (test üçün müddət
qısaldıla bilər) → yazma əməliyyatı et → uğurlu olur, giriş ekranı görünmür.

**Acceptance Scenarios**:

1. **Given** giriş tokeninin müddəti bitib, sessiya isə etibarlıdır, **When** istifadəçi
   hər hansı əməliyyat edir, **Then** əməliyyat bir dəfə uğurla icra olunur (təkrar yazma
   yoxdur) və istifadəçi fərq hiss etmir.
2. **Given** eyni anda bir neçə sorğu tokenin bitdiyini aşkar edir, **When** yeniləmə
   baş verir, **Then** yalnız bir yeniləmə edilir və bütün gözləyən sorğular yeni tokenlə
   davam edir.
3. **Given** sessiyanın özü bitib və ya ləğv olunub, **When** yeniləmə cəhdi rədd edilir,
   **Then** istifadəçi "sessiya bitdi" bildirişi ilə giriş ekranına aparılır və girişdən
   sonra olduğu ünvana qaytarılır.

---

### User Story 3 - Çıxış sessiyanı həqiqətən bağlayır (Priority: P2)

İstifadəçi "Çıxış" düyməsini basır. Sessiya serverdə ləğv olunur; sonra kimsə həmin
brauzerdə səhifəni yeniləsə, geri düymə ilə qayıtsa və ya köhnə cookie-ni təkrar
göndərsə, panel giriş tələb edir.

**Why this priority**: Davamlı sessiya ortaq/iş kompüterində risk yaradır; çıxış yalnız
brauzer yaddaşını təmizləsə, sessiya serverdə yaşamağa davam edər.

**Independent Test**: Daxil ol → çıx → səhifəni yenilə və geri düyməsini bas → hər iki
halda giriş ekranı; əvvəlki sessiya ilə yeniləmə cəhdi rədd olunur.

**Acceptance Scenarios**:

1. **Given** daxil olmuş istifadəçi, **When** "Çıxış" basır, **Then** sessiya serverdə
   ləğv olunur, brauzerdəki sessiya cookie-si silinir və giriş ekranı açılır.
2. **Given** istifadəçi bir tabda çıxıb, **When** başqa açıq tabda əməliyyat edir,
   **Then** həmin tab da giriş ekranına keçir (ən gec növbəti sorğuda).
3. **Given** çıxışdan əvvəl oğurlanmış/köçürülmüş sessiya dəyəri, **When** təkrar
   istifadə olunur, **Then** rədd edilir.

---

### User Story 4 - Admin istifadəçinin sessiyalarını bağlaya bilir (Priority: P3)

Administrator istifadəçini deaktiv edir, şifrəsini dəyişir və ya rolunu dəyişir. Həmin
istifadəçinin bütün açıq sessiyaları növbəti yeniləmədə etibarsız olur.

**Why this priority**: Davamlı sessiya ilə deaktiv edilmiş istifadəçi uzun müddət işləməyə
davam edə bilər; bu, bank mühitində qəbuledilməzdir. Mövcud istifadəçi idarəetmə
ekranları dəyişmir — təsir arxa planda baş verir.

**Independent Test**: A istifadəçisi ilə daxil ol → admin olaraq A-nı deaktiv et → A-nın
tabında giriş tokeni bitdikdən sonra əməliyyat et → giriş ekranı.

**Acceptance Scenarios**:

1. **Given** A istifadəçisinin açıq sessiyası var, **When** admin A-nı deaktiv edir və ya
   şifrəsini dəyişir, **Then** A-nın növbəti yeniləmə cəhdi rədd olunur.
2. **Given** A-nın rolu dəyişdirilib, **When** A-nın tokeni yenilənir, **Then** yeni token
   yeni rolu daşıyır.

---

### Edge Cases

- **Yeniləmə tokeninin təkrar istifadəsi**: artıq istifadə olunmuş (dəyişdirilmiş) yeniləmə
  dəyəri yenidən təqdim olunarsa, bu oğurluq siqnalı sayılır — həmin sessiya zəncirinin
  hamısı ləğv olunur.
- **Paralel tablar eyni anda yeniləyir**: iki tab eyni anda yeniləmə istəsə, biri digərini
  "oğurluq" kimi göstərib istifadəçini çıxarmamalıdır (qısa tolerans pəncərəsi və ya tablar
  arası koordinasiya).
- **Şəbəkə kəsilməsi/5xx yeniləmə zamanı**: istifadəçi çıxarılmır (spec 001 FR-011 ruhu:
  yalnız rədd edilmiş sessiya çıxış səbəbidir); sorğu xətası adi xəta kimi göstərilir.
- **Server saatı ilə brauzer saatı fərqlidir**: yeniləmə qərarı brauzer saatına etibar
  etmir; server tokeni rədd edəndə yeniləmə baş verir.
- **Login cəhdinin öz uğursuzluğu** (yanlış şifrə, bloklanmış hesab) yeniləmə axınını işə
  salmır və "sessiya bitdi" bildirişi göstərmir.
- **Cookie brauzer tərəfindən bloklanıb** (məs. panel və API fərqli saytlardadır): panel
  bugünkü davranışa (yalnız yaddaşdakı sessiya) səssiz geri düşməməli — problem deploy
  zamanı aşkarlanmalıdır (bax Asılılıqlar, Q2).
- **Köhnə panel (`web-cbar-admin`) eyni API ilə işləyir**: onun giriş axını dəyişmədən
  işləməyə davam edir.
- **Vaxtı keçmiş sessiya qeydləri**: bazada sonsuz yığılmır, vaxtaşırı təmizlənir.

## Requirements *(mandatory)*

### Functional Requirements

**Sessiya yaradılması (`api-cbar-admin`)**

- **FR-001**: Uğurlu girişdə sistem qısaömürlü giriş tokeni ilə yanaşı uzunömürlü sessiya
  (yeniləmə) identifikatoru yaratmalı və onu brauzerə **JavaScript-in oxuya bilmədiyi**,
  yalnız təhlükəsiz bağlantı üzərindən göndərilən (lokal inkişaf istisna), yalnız
  autentifikasiya ünvanlarına göndərilən cookie kimi verməlidir.
- **FR-002**: Sessiya identifikatoru bazada yalnız geri çevrilməz hash şəklində
  saxlanmalı; istifadəçi, bitmə vaxtı, IP və user-agent ilə birlikdə qeydə alınmalıdır.
- **FR-003**: Login cavabının bugünkü forması (giriş tokeni + bitmə vaxtı) saxlanmalıdır,
  ki köhnə panel dəyişmədən işləsin.

**Yeniləmə**

- **FR-004**: Sistem etibarlı sessiya cookie-si ilə gələn sorğuya yeni giriş tokeni (və
  cari istifadəçi məlumatı) qaytaran yeniləmə əməliyyatı təqdim etməlidir.
- **FR-005**: Hər uğurlu yeniləmədə sessiya identifikatoru **rotasiya olunmalı** — köhnə
  dəyər ləğv, yenisi verilməlidir.
- **FR-006**: Artıq rotasiya olunmuş dəyərin təkrar təqdimi həmin sessiyanın bütün
  zəncirini ləğv etməlidir; paralel tabların qanuni eyni-anlı yeniləməsi bu qaydanı işə
  salmamalıdır.
- **FR-007**: Yeniləmə deaktiv edilmiş, silinmiş və ya bloklanmış istifadəçi üçün rədd
  edilməli; yeni giriş tokeni istifadəçinin **cari** rolunu daşımalıdır.
- **FR-008**: Sessiya hərəkətsizlik müddəti və maksimal ömrü konfiqurasiya olunan
  olmalıdır; default dəyərlər Q1-ə görə təyin edilir.
- **FR-009**: Şifrə dəyişikliyi, istifadəçinin deaktiv edilməsi və ya silinməsi həmin
  istifadəçinin bütün aktiv sessiyalarını ləğv etməlidir.

**Çıxış**

- **FR-010**: Sistem cari sessiyanı serverdə ləğv edən və cookie-ni silən çıxış
  əməliyyatı təqdim etməlidir; artıq bitmiş sessiya ilə çağırılsa belə uğurlu nəticə
  qaytarmalıdır (idempotent).

**Təhlükəsizlik və audit**

- **FR-011**: Cookie ilə işləyən əməliyyatlar (yeniləmə, çıxış) saytlararası sorğu
  saxtakarlığından (CSRF) qorunmalıdır: cookie başqa saytdan göndərilən sorğularla
  gəlməməli, və/və ya sorğunun mənbəyi icazəli panel ünvanları ilə yoxlanmalıdır.
- **FR-012**: Kontent API-ləri bugünkü kimi yalnız `Authorization` başlığındakı giriş
  tokenini qəbul etməli; sessiya cookie-si kontent əməliyyatlarına icazə verməməlidir.
- **FR-013**: Kimlik məlumatlı saytlararası sorğulara yalnız konfiqurasiyada açıq
  sadalanmış panel ünvanlarından icazə verilməlidir (wildcard qadağandır).
- **FR-014**: Giriş, uğursuz yeniləmə, təkrar istifadə aşkarlanması və çıxış hadisələri
  qeydə alınmalıdır (kim, nə vaxt, haradan); sessiya dəyəri və tokenlər heç vaxt log-a
  yazılmamalıdır.
- **FR-015**: Vaxtı keçmiş və ləğv edilmiş sessiya qeydləri avtomatik təmizlənməlidir.

**Admin panel (`web-cbar-admin-new`)**

- **FR-016**: Panel açılarkən (və səhifə yenilənəndə) qorunan ekranı göstərməzdən əvvəl
  sessiyanı bərpa etməyə cəhd etməli; bu müddətdə giriş ekranı "yanıb-sönməməli".
- **FR-017**: Giriş tokeni bugünkü kimi yalnız yaddaşda qalmalı; heç bir token, sessiya
  dəyəri və ya istifadəçi snapshot-ı brauzer yaddaşına (local/session storage)
  yazılmamalıdır. (Spec 001 FR-010-un "yenilənəndə yenidən daxil olur" hissəsini bu spec
  əvəz edir; "yalnız yaddaşda" hissəsi qüvvədə qalır.)
- **FR-018**: Giriş tokeni bitəndə və ya API onu rədd edəndə panel bir dəfə yeniləmə edib
  əsl sorğunu təkrarlamalı; eyni anda bir neçə sorğu üçün yalnız bir yeniləmə
  aparılmalıdır.
- **FR-019**: Panelin bugünkü "token müddəti bitdi → çıxış" taymeri avtomatik çıxış
  səbəbi olmaqdan çıxmalıdır; avtomatik çıxışın yeganə səbəbi yeniləmənin rədd
  edilməsidir (şəbəkə/5xx xətası çıxış səbəbi deyil).
- **FR-020**: "Çıxış" düyməsi serverdə sessiyanı bağlamalı, yaddaşı və sorğu keşini
  təmizləməli; server çağırışı uğursuz olsa belə lokal çıxış tamamlanmalıdır.
- **FR-021**: Bir tabda edilən çıxış digər açıq tablarda da ən gec növbəti sorğuda
  qüvvəyə minməlidir.
- **FR-022**: Lokal inkişafda (Vite proxy, eyni mənbə) və MSW test rejimində axın real
  API-dəki kimi işləməlidir; MSW handler-ləri yeni əməliyyatların real kontraktını əks
  etdirməlidir.

**Uyğunluq və deploy**

- **FR-023**: Köhnə `web-cbar-admin` paneli heç bir dəyişiklik olmadan işləməyə davam
  etməlidir.
- **FR-024**: `api-cbar-admin` dəyişikliyi paneldən **əvvəl** deploy olunmalıdır; yeni
  API köhnə paneli, köhnə API isə yeni paneli sındırmamalıdır (panel yeniləmə
  əməliyyatı olmayan API-də bugünkü davranışa qayıdır).

### Key Entities

- **Sessiya (yeniləmə tokeni)**: bir istifadəçinin bir brauzerdəki davamlı girişi.
  Atributlar: istifadəçi, identifikatorun hash-i, yaradılma, bitmə (hərəkətsizlik və
  maksimal ömür), ləğv vaxtı, IP, user-agent, zəncir əlaqəsi (hansı dəyəri əvəz etdiyi —
  təkrar istifadəni aşkarlamaq üçün). Mövcud `refresh_tokens` cədvəli əsasdır; zəncir
  əlaqəsi üçün əlavə sahə lazım ola bilər.
- **Giriş tokeni**: qısaömürlü (default 15 dəq), yalnız panelin yaddaşında; istifadəçi
  id-si, adı və rolunu daşıyır. Dəyişmir.
- **İstifadəçi**: mövcud; aktivlik, blok və şifrə dəyişikliyi sessiyaların etibarlılığına
  təsir edir.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Etibarlı sessiya ilə səhifə yeniləmələrinin 100%-i giriş ekranı göstərmədən
  eyni ünvanı açır; bərpa istifadəçi üçün 1 saniyədən az çəkir.
- **SC-002**: Aktiv işləyən istifadəçi seçilmiş hərəkətsizlik müddətindən (Q1) əvvəl heç
  vaxt avtomatik çıxarılmır — 60 dəqiqəlik fasiləsiz redaktə sessiyasında sıfır
  gözlənilməz giriş ekranı.
- **SC-003**: Çıxışdan sonra həmin brauzerdə geri düyməsi, yeniləmə və ya köhnə sessiya
  dəyərinin təkrar göndərilməsi hallarının 100%-i giriş tələb edir.
- **SC-004**: Deaktiv edilmiş və ya şifrəsi dəyişdirilmiş istifadəçi ən gec bir giriş
  tokeni ömrü (default 15 dəq) ərzində paneldən kəsilir.
- **SC-005**: Brauzerdə işləyən heç bir skript sessiya identifikatorunu oxuya bilmir;
  brauzer yaddaşında heç bir token tapılmır.
- **SC-006**: Köhnə panel üçün giriş və kontent əməliyyatlarında sıfır reqressiya.
- **SC-007**: Paralel iki-üç tab bir saat açıq qaldıqda istifadəçi yanlışlıqla (təkrar
  istifadə aşkarlanması səbəbindən) çıxarılmır.

## Assumptions

- **Arxitektura seçimi** (istifadəçinin sualına cavab): tam "access token cookie-də"
  modeli yox, **hibrid** model — qısaömürlü giriş tokeni yaddaşda (başlıqla göndərilir),
  uzunömürlü sessiya httpOnly cookie-də, yalnız yeniləmə/çıxış ünvanlarına göndərilir.
  Səbəb: kontent API-ləri cookie qəbul etmədiyi üçün CSRF səthi iki əməliyyatla
  məhdudlaşır, köhnə panel və mövcud 26 controller dəyişmir, XSS token oğurlaya bilmir.
- Panel və API hər deploy mühitində **eyni sayt** altındadır (test: `admin-temp.cbar.az`
  ↔ `api-cbar-admin-test.cbar.az` — hər ikisi `cbar.az`, uyğundur). Prod API-si
  `api-cbar-admin.cbar.az`-dır (Q2); panelin prod host-u Q2a-ya bağlıdır.
- Lokal inkişafda panel API-yə Vite proxy ilə eyni mənbədən gedir — cookie heç bir
  əlavə quraşdırma olmadan işləyir; lokal HTTP üzərində "yalnız HTTPS" bayrağı söndürülür.
- Mövcud `refresh_tokens` cədvəli istifadə olunur; zəncir/ailə sahəsi lazım olarsa yeni,
  append-only migration (hər iki `Cbar.Domain` kopyası eyni dəyişiklikdə) əlavə edilir.
- TOTP 2FA, eskalasiya edən blok, "bütün cihazlardan çıx" UI-ı, aktiv sessiyaların
  siyahısı ekranı və QRadar inteqrasiyası **əhatədən kənardır** (AuthController-dəki
  Phase 2 siyahısının qalanı).
- `user_sessions` cədvəli bu feature-da istifadə olunmur.
- Sessiya hadisələri mövcud strukturlaşdırılmış log-a yazılır; `audit_log` məzmun
  dəyişiklikləri üçün qalır (fərqli qərar plan mərhələsində verilə bilər).

### Asılılıqlar

- **DevOps**: `Cors__Origins__0` hər mühitdə panelin dəqiq ünvanı olmalıdır (hazırda
  `TODO(devops)`). `web-cbar-admin-new/.env.production`-da `VITE_API_URL`
  `https://api-cbar-admin.cbar.az/api/v1` olmalıdır (Q2). Panelin prod host-u (Q2a)
  deploydan əvvəl həll olunmalıdır.
- Deploy sırası: `api-cbar-admin` → `web-cbar-admin-new` (iki ayrı merge request).
