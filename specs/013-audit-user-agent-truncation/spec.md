# Feature Specification: Audit qeydində uzun User-Agent-in yazma əməliyyatlarını sındırmaması

**Feature Branch**: `013-audit-user-agent-truncation`

**Created**: 2026-10-02

**Status**: Draft

**Input**: User description: "4. Audit-də user_agent kəsilmir — bütün yazma əməliyyatları 500 verə bilər. — 1 SP. Sütun varchar(500)-dür (0001-initial-schema.sql:95). AuditService.cs:29 isə dəyəri kəsmədən yazır. RefreshTokenService kəsir, bu servis kəsmir. 500 simvoldan uzun UA göndərən klientin hər save-i uğursuz olur, çünki audit eyni transaction-dadır. SP izahı: bir sətir, yoxlama uzun UA ilə bir curl-dur."

**Mənbə**: `api-admin-review.md`, task #4 (🔴, 1 SP).

**Əhatə olunan proyekt**: yalnız `api-cbar-admin` (CMS API, audit jurnalı). Admin panellər
(`web-cbar-admin`, `web-cbar-admin-next`), `api-cbar` və sxem **toxunulmur** — sütunun ölçüsü
dəyişmir, migration yoxdur, `Cbar.Domain` dəyişmir, endpoint kontraktı dəyişmir.

**`product-host` istinadı (Konstitusiya Maddə I.2)**: `common/components/qradar/QradarLogger.php`
(`business_logic/old_businesslogic.md` §7.4). Köhnə sistem audit hadisəsinə User-Agent-i
əlavə edir, amma onu fayla (`/var/log/cbar_app`) yazır — uzun dəyər heç bir istifadəçi
əməliyyatını sındıra bilməz. Yeni sistemdə audit əsas yazma ilə eyni tranzaksiyadadır, ona
görə uzun dəyər bütün save-i uğursuz edir. Bu, köhnədə olmayan yeni reqressiyadır.

**Paritet (İş axını qaydası 5)** — `QradarLogger`, `old_businesslogic.md` §7.4:

| `product-host` davranışı | Yeni sistemdə | Status |
|---|---|---|
| Audit hadisəsində User-Agent saxlanılır | `audit_log.user_agent` | Saxlanılır (ilk 500 simvol) |
| Audit yazılışı istifadəçi əməliyyatını heç vaxt sındırmır | Uzun UA ilə save 500 verir | **Bu spec bərpa edir** |
| SIEM (QRadar) ötürülməsi | — | Phase 2 (`TODO(Phase 2 hardening)`), əhatədən kənar |

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Uzun User-Agent göndərən brauzerdən redaktor işini saxlaya bilir (Priority: P1)

Redaktor admin panelə elə brauzerdən daxil olur ki, onun User-Agent sətri 500 simvoldan
uzundur (çox sayda plugin/extension, korporativ agent, bəzi WebView-lar və avtomatlaşdırma
alətləri belə sətir göndərir). Bu gün belə redaktor nəinki səhifə saxlaya bilmir — login-in
özü də audit qeydi yazdığı üçün uğursuz olur. Xəta mesajı generik "server xətası"dır, səbəbi
redaktor üçün görünmür, problem yalnız həmin brauzerdə təkrarlanır və diaqnozu çətindir.
Üstəlik bunu hər hansı klient bilərəkdən də edə bilər: ixtiyari audit olunan əməliyyatı
sındırmaq üçün sadəcə uzun başlıq göndərmək kifayətdir.

**Why this priority**: Feature-in yeganə məqsədi budur; review-da 🔴 prioritetlə qeyd olunub.
Təsiri bütün yazma əməliyyatlarıdır (audit olunan hər save), həll isə minimaldır.

**Independent Test**: Test mühitində 500 simvoldan uzun User-Agent başlığı ilə (a) login,
(b) audit olunan istənilən bir yaratma/yeniləmə, (c) logout sorğusu göndərilir. Hər birinin
status kodu və audit jurnalında yaranan qeyd yoxlanılır. Eyni sorğular adi (qısa) User-Agent
ilə təkrarlanıb nəticə müqayisə edilir.

**Acceptance Scenarios**:

1. **Given** 500 simvoldan uzun User-Agent, **When** doğru məlumatlarla login edilir,
   **Then** giriş adi User-Agent-dəki kimi uğurlu olur və audit jurnalında login qeydi yaranır.
2. **Given** uzun User-Agent ilə daxil olmuş redaktor, **When** audit olunan istənilən
   məzmunu yaradır, yeniləyir və ya silir, **Then** əməliyyat uğurlu olur, dəyişiklik saxlanılır
   və audit qeydi yaranır.
3. **Given** uzun User-Agent ilə yaranmış audit qeydi, **When** jurnala baxılır, **Then**
   qeyddəki User-Agent göndərilən dəyərin ilk 500 simvoludur — kəsilmiş, amma tanınan.
4. **Given** 500 simvol və ya daha qısa User-Agent, **When** istənilən audit olunan əməliyyat
   edilir, **Then** jurnalda User-Agent bugünkü kimi tam, dəyişməz saxlanılır.

---

### Edge Cases

- **Dəqiq 500 simvol**: kəsilmir, olduğu kimi saxlanılır. **501 simvol**: ilk 500 saxlanılır.
- **User-Agent başlığı yoxdur və ya boşdur**: bugünkü davranış dəyişmir (əməliyyat uğurludur,
  qeyddə dəyər boşdur).
- **Çox böyük başlıq** (onlarla KB): veb serverin öz başlıq limitini keçən sorğu tətbiqə
  çatmadan rədd edilir — bu, bu feature-in əhatəsindən kənardır. Limit daxilindəki hər ölçü
  500 simvola kəsilib saxlanılır.
- **Çoxbaytlı simvollar**: hədd simvolla ölçülür (sütunun hədd vahidi ilə eyni), baytla yox;
  kəsilmiş dəyər yenə də etibarlı mətn olmalıdır.
- **Anonim auth endpoint-ləri** (login, refresh, logout): bunlar da audit yazır, ona görə
  eyni qaydaya tabedir. Refresh token-in özü artıq kəsilmiş User-Agent saxlayır; audit qeydi ilə
  refresh token qeydindəki dəyər eyni olmalıdır.
- **Digər sərhəd sahələri** (məsələn `action`, `entity_type`, 100 simvol): onlara dəyəri klient
  deyil, kod verir, ona görə bu feature onlara toxunmur.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Audit jurnalına yazılan User-Agent dəyəri saxlama həddindən (500 simvol) uzun
  olduqda ilk 500 simvola qədər kəsilməlidir; qısa dəyərlər dəyişməz saxlanılmalıdır.
- **FR-002**: User-Agent-in uzunluğu heç bir audit olunan əməliyyatın (login, logout, refresh,
  məzmunun yaradılması/yenilənməsi/silinməsi, istifadəçi idarəsi) uğursuz olmasına səbəb
  olmamalıdır.
- **FR-003**: Audit jurnalındakı User-Agent ilə refresh token qeydindəki User-Agent eyni
  kəsmə qaydasına tabe olmalıdır — eyni sorğu üçün eyni dəyər.
- **FR-004**: Audit qeydinin qalan sahələri (icraçı, əməliyyat, obyekt, əvvəl/sonra, IP, vaxt)
  dəyişməz qalmalıdır.
- **FR-005**: Saxlanan sütunun ölçüsü və sxem dəyişməməlidir; dəyişiklik migration tələb
  etməməlidir.
- **FR-006**: Heç bir endpoint-in xarici kontraktı (OpenAPI spec-dəki route, sorğu və cavab
  forması) dəyişməməlidir; spec-də yeniləmə tələb olunmur.

### Key Entities *(include if feature involves data)*

- **Audit qeydi**: kimin, nə vaxt, hansı obyektdə hansı əməliyyatı etdiyini saxlayır; əlavə
  olaraq klientin IP-si və User-Agent-i (ən çox 500 simvol). Əsas dəyişikliklə birlikdə,
  eyni anda saxlanılır.
- **Refresh token qeydi**: sessiyanın davamı üçün; User-Agent-i artıq 500 simvola kəsilmiş
  saxlayır — audit üçün nümunə qaydadır.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Test mühitində 501, 1000 və 4000 simvolluq User-Agent ilə göndərilən login,
  bir audit olunan yazma əməliyyatı və logout sorğularının 100%-i adi User-Agent-dəki ilə eyni
  status kodu ilə uğurlu olur (bu gün hamısı server xətası verir).
- **SC-002**: SC-001-dəki hər sorğu üçün audit jurnalında qeyd yaranır və onun User-Agent
  dəyəri göndərilənin dəqiq ilk 500 simvoludur.
- **SC-003**: 500 simvol və daha qısa User-Agent ilə yaranan qeydlərdə dəyər göndərilənlə
  100% eynidir (reqressiya yoxdur).
- **SC-004**: Eyni login sorğusu üçün audit qeydindəki və refresh token qeydindəki User-Agent
  dəyərləri eynidir.

## Assumptions

- Hədd 500 simvoldur — sxemdəki sütun ölçüsü ilə və refresh token-in mövcud kəsmə qaydası ilə
  eyni. Sütunu böyütmək (migration) alternativ kimi rədd edilir: istənilən sonlu hədd yenə
  kəsmə tələb edir, 500 isə real brauzer User-Agent-ləri üçün kifayətdir.
- Kəsilmə səssizdir: klientə xəbərdarlıq qaytarılmır, ayrıca log yazılmır. User-Agent klientin
  özünün göndərdiyi, etibar olunmayan məlumatdır; onun ilk 500 simvolu insident araşdırması
  üçün kifayətdir.
- IP sahəsinin düzgünlüyü (ingress arxasında real IP) review-un #5 task-ının mövzusudur, bu
  feature-in yox.
- Lokalda .NET SDK yoxdur; build GitLab pipeline-ında, yoxlama `test` mühitinə deploy
  olunduqdan sonra uzun User-Agent ilə `curl` sorğuları və audit jurnalının oxunması ilə
  aparılır (Konstitusiya Maddə VIII.1).
- Bir proyekt, sxem dəyişikliyi yoxdur — deploy sırası məsələsi yoxdur. Review-un "dərhal"
  qrupundakı digər kiçik task-larla (#5, #6, #13, #8a) eyni `api-cbar-admin` MR-ında gedə
  bilər, onlardan asılı deyil.
- QRadar/SIEM ötürülməsi əhatədən kənardır (`TODO(Phase 2 hardening)`).
