# Feature Specification: CMS dəyişikliyinin public saytda dərhal görünməsi — keşin tələb əsasında təmizlənməsi

**Feature Branch**: `023-cms-cache-revalidation`

**Created**: 2026-10-14

**Status**: Deferred (2026-10-14)

> **Qərar (2026-10-14)**: bu spec qurulmadı. Əvəzinə yalnız `web-cbar-new`-də keşin ömrü
> qısaldıldı: məzmun 60 → 10 san, səhifə ağacı 300 → 10 san (`src/server/cached.ts`).
> Redaktorun dəyişikliyi ən geci ~10 saniyə və bir yeniləmə sonra görünür. Keşi tam
> söndürmək rədd edildi: `api-client` ziyarətçinin IP-sini ötürmür, `api-cbar`-ın
> 1000/dəq limiti isə bütün sayt üçün ortaq olardı. Dərhal (0 san) görünmə tələbi
> gələrsə, bu spec-ə qayıdılır.

**Input**: User description: "CMS dəyişikliklərinin public saytda (web-cbar-new) dərhal görünməsi — keşin on-demand təmizlənməsi. Hazırda web-cbar-new API cavablarını unstable_cache ilə keşləyir (səhifə ağacı/naviqasiya 300 san, digər məzmun 60 san), redaktor admin paneldə dəyişiklik edəndə public saytda 5 dəqiqəyə qədər gecikir. Hədəf: (1) web-cbar-new-də gizli açarla qorunan revalidate endpoint-i; (2) api-cbar-admin hər uğurlu məzmun yazısından sonra onu server-to-server avtomatik çağırır, uğursuzluq yazını pozmur; həmçinin manual purge endpoint-i; (3) web-cbar-admin-new-də 'Keşi təmizlə' düyməsi (PHP saytındakı kimi). Keş hər pod-un öz diskindədir — çox replica halı nəzərə alınmalıdır; spec-first endpoint qaydası; deploy sırası web-cbar-new → api-cbar-admin → panel."

**Mənbə**: spec 003 (performans) keşi gətirib və dərhal təmizləməni açıq şəkildə "gələcək spec"-ə saxlayıb (`specs/003-performance-optimization/spec.md` sətir 29, 191–192). Bu həmin spec-dir.

**Əhatə olunan proyektlər** (üç ayrı upstream merge request, Konstitusiya Maddə II.3):

- `web-cbar-new` — keşi təmizləmək üçün qorunan daxili qəbul nöqtəsi.
- `api-cbar-admin` — yazıdan sonra avtomatik bildiriş və redaktor üçün manual "keşi təmizlə" əməliyyatı (yeni icazə ilə).
- `web-cbar-admin-new` — "Keşi təmizlə" düyməsi.
- `api-cbar` **dəyişmir**: o keşləmir, məzmunu birbaşa bazadan oxuyur.

**`product-host` istinadı (Konstitusiya Maddə I.2)** — bu feature aşağıdakını əvəz edir:

| Köhnə | Nə edir |
|---|---|
| `admin/controllers/HomeController.php` `actionCleanCache` | `visitor/runtime/cache` qovluğunu silir, admin ana səhifəsinə qaytarır |
| `admin/views/home/index.php` sətir 7 | admin ana səhifəsində "Очистить кэш проекта" düyməsi |

Köhnədə yazıdan sonra avtomatik təmizləmə yox idi, yalnız düymə vardı. Yenidə ikisi də olur: avtomatik əsas yol, düymə isə ehtiyat.

**Hazırkı vəziyyət (koddan ölçülüb, 2026-10-14)**:

- `web-cbar-new/src/server/cached.ts`: bütün məzmun oxumaları server tərəfdə keşlənir. Məzmun **60 san**, səhifə ağacı (header naviqasiyası, hər səhifədə `[locale]/layout.tsx`-dən oxunur) **300 san**. Hər keş yazısının bölmə etiketi var: `pages`, `homepage`, `press-releases`, `laws`, `meas`, `media`, `money-marks`, `organization`, `currencies`, `stats`, `settings`. Etiketlər "gələcək webhook üçün" qoyulub, amma onları işlədən heç nə yoxdur. Axtarış keşlənmir.
- Nəticə: redaktor menyu sırasını dəyişəndə əməliyyat uğurlu görünür, public saytda isə 5 dəqiqəyə qədər köhnə menyu qalır. Spec 003 SC-010 ("ən çox 60 saniyə") ağac üçün onsuz da pozulur.
- Keş hər server instansiyasının öz yaddaşında/diskindədir. `web-cbar-new/.ci-cd/*.yaml` replica sayını göstərmir; sayı paylaşılan Helm chart müəyyən edir.
- `web-cbar-new/src/proxy.ts` matcher-i `/api/*` yollarını artıq locale yönləndirməsindən çıxarır.
- `api-cbar-admin`-in xaricə HTTP çağırışı yoxdur. Fon işi (`BackgroundService`) də yoxdur, yəni bütün məzmun yazıları redaktorun sorğusu ilə baş verir. İcazələr `Authorization/Permissions.cs`-də icazə əsaslıdır (`[RequirePermission(...)]`).
- Tarixli məzmunun embarqosu (`PublishedAt` gələcəkdə) public API-də sorğu anında tətbiq olunur. Həmin an heç bir yazı baş vermir.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Redaktorun dəyişikliyi public saytda dərhal görünür (Priority: P1)

Redaktor admin paneldə məzmunu dəyişib saxlayır: menyu sırası, səhifə mətni, press-reliz, ana səhifə bloku, məzənnə təsdiqi və s. Public saytı yeniləyəndə dəyişikliyi dərhal görür, gözləmək və ya kimdənsə xahiş etmək lazım olmur.

**Why this priority**: Problem məhz budur. Redaktor "uğurla icra olundu" mesajından sonra saytda köhnə vəziyyəti görür, dəyişikliyin alınmadığını düşünür və təkrar edir. Avtomatik yol insan addımı tələb etmir.

**Independent Test**: Admin paneldə naviqasiyada iki menyu bəndinin yerini dəyiş və saxla. Public saytın istənilən səhifəsini yenilə. Header-də yeni sıra ilk yeniləmədə görünməlidir.

**Acceptance Scenarios**:

1. **Given** public sayt açılıb və naviqasiya keşdədir, **When** redaktor menyu bəndlərinin sırasını dəyişib saxlayır, **Then** saytın növbəti yenilənməsində (az və en) header yeni sıranı göstərir.
2. **Given** press-reliz public saytda görünür, **When** redaktor başlığını dəyişib saxlayır, **Then** siyahıda, detal səhifəsində və ana səhifədə yeni başlıq növbəti yeniləmədə görünür.
3. **Given** redaktor məzmunu silir və ya dərcdən çıxarır, **When** saxlayır, **Then** məzmun public saytda növbəti yeniləmədə artıq görünmür.
4. **Given** public sayt keşini təmizləmək mümkün deyil (sayt əlçatmazdır, şəbəkə xətası, səhv açar), **When** redaktor saxlayır, **Then** yazı yenə də uğurlu olur, redaktor adi uğur mesajını görür, dəyişiklik isə ən geci keşin adi ömrü bitəndə görünür.
5. **Given** redaktor bir bölmədə dəyişiklik edir, **When** saxlayır, **Then** yalnız həmin bölmənin və ondan asılı blokların (məs. ana səhifə) keşi təmizlənir, saytın qalan keşi qalır.

---

### User Story 2 — Redaktor keşi əl ilə təmizləyir (Priority: P2)

Redaktor (və ya admin) saytda gözlənilməz köhnə məzmun görəndə admin paneldəki "Keşi təmizlə" düyməsinə basır. Bütün public sayt keşi təmizlənir və nəticə barədə aydın mesaj görünür. Bu, köhnə PHP admin panelindəki "Очистить кэш проекта" düyməsinin qarşılığıdır.

**Why this priority**: Avtomatik yolun buraxdığı halları örtür: avtomatik bildirişin alınmaması, embarqo vaxtı çatmış məzmun, bölmələr arası gözlənilməz asılılıq. Redaktorlar köhnə sistemdən bu düyməyə öyrəşiblər.

**Independent Test**: Avtomatik bildirişi söndürülmüş halda məzmunu dəyiş, saytın köhnə versiyanı göstərdiyini yoxla, düyməyə bas, saytı yenilə — yeni məzmun görünür.

**Acceptance Scenarios**:

1. **Given** istifadəçinin keş təmizləmə icazəsi var, **When** "Keşi təmizlə" düyməsinə basır, **Then** düymə əməliyyat bitənə qədər məşğul vəziyyətdədir, sonra uğur mesajı çıxır və saytın bütün bölmələri növbəti yeniləmədə təzə məlumat göstərir.
2. **Given** istifadəçinin icazəsi yoxdur, **When** admin paneli açır, **Then** düyməni görmür. Əməliyyatı birbaşa çağırsa belə rədd edilir.
3. **Given** public sayt əlçatmazdır, **When** düyməyə basılır, **Then** redaktor keşin təmizlənmədiyini bildirən aydın xəta mesajı görür və yenidən cəhd edə bilir.
4. **Given** keş təmizlənib, **When** audit jurnalına baxılır, **Then** kimin, nə vaxt və hansı nəticə ilə keşi təmizlədiyi orada qeyd olunub.

---

### User Story 3 — Keş təmizləmə bütün public sayt instansiyalarına çatır (Priority: P2)

Public sayt bir neçə instansiyada işləyirsə, ziyarətçinin sorğusunun hansı instansiyaya düşməsindən asılı olmayaraq təmizləmədən sonra hamısı təzə məzmun göstərir.

**Why this priority**: Olmasa, US1 və US2 təsadüfi işləyir: bir yeniləmədə yeni menyu, növbətidə köhnəsi görünür. Bu, gecikmədən daha çaşdırıcıdır. Yalnız bir instansiya varsa, bu hekayə öz-özünə ödənir.

**Independent Test**: Public saytı ən azı iki instansiya ilə işə sal, məzmunu dəyiş və hər instansiyaya birbaşa sorğu göndər — hamısı yeni məzmunu qaytarır.

**Acceptance Scenarios**:

1. **Given** public sayt N instansiyada işləyir, **When** keş təmizlənir (avtomatik və ya düymə ilə), **Then** N instansiyanın hamısı növbəti sorğuda təzə məzmun qaytarır.
2. **Given** instansiya keş təmizləndikdən sonra yenidən başlayıb və ya yeni yaranıb, **When** sorğu alır, **Then** köhnə məzmun göstərmir.

---

### Edge Cases

- **Embarqo**: `PublishedAt` gələcək vaxta qoyulmuş məzmun həmin an heç bir yazı olmadan görünməlidir. Avtomatik təmizləmə bunu tutmur. Keşin adi ömrü (60/300 san) təhlükəsizlik toru kimi qalır. Bu gecikmə qəbul edilir və düymə ilə də qısaldıla bilər.
- **Bir dəqiqədə çoxlu yazı** (məs. 30 menyu bəndinin sürüklə-burax ilə yerinin dəyişməsi): hər yazı təmizləmə tələb edə bilər. Bu, public saytı və ya admin API-ni yavaşıtmamalıdır, redaktorun yazı sorğusu isə təmizləməni gözləməməlidir.
- **Uğursuz yazı** (validasiya xətası, konflikt, rədd edilmiş icazə): keş təmizlənmir.
- **Media yüklənməsi**: yalnız yükləmə (heç bir məzmuna bağlanmamış) public görünüşü dəyişmir. Media yazıları yenə də `media` bölməsini təmizləyə bilər, bu zərərsizdir.
- **Səhv və ya boş açar konfiqurasiyası**: public sayt açarı olmayan və ya səhv açarlı təmizləmə sorğusunu rədd edir. Açar konfiqurasiya edilməyibsə, qəbul nöqtəsi heç bir sorğunu qəbul etmir (açıq qalmır). Admin API-də ünvan/açar verilməyibsə, avtomatik bildiriş səssizcə söndürülür və bu, startup-da bir dəfə log-a yazılır.
- **Naməlum bölmə adı**: public sayt naməlum etiketi xəta saymır, rədd edir və ya görməzdən gəlir, amma tanınan etiketlərin işlənməsinə mane olmur.
- **Lokal inkişaf**: admin API və public sayt lokalda da bir-birini tapmalıdır (lokal default-lar), ayrıca quraşdırma tələb olunmamalıdır.
- **Deploy sırası**: public sayt yeni qəbul nöqtəsi olmadan işləyərkən admin API yeni versiyaya keçərsə, bildirişlər uğursuz olur, yazılar isə pozulmur (US1 ss. 4). Ona görə public sayt birinci deploy olunur.

## Requirements *(mandatory)*

### Functional Requirements

**Public sayt (`web-cbar-new`)**

- **FR-001**: Public saytda daxili istifadə üçün keş təmizləmə qəbul nöqtəsi olmalıdır. O, bir və ya bir neçə bölmə adı (yuxarıda sadalanan etiketlər), ya da "hamısı" qəbul edir və həmin bölmələrin keşlənmiş məzmununu etibarsız edir.
- **FR-002**: Qəbul nöqtəsi yalnız paylaşılan gizli açarı təqdim edən sorğuları qəbul etməlidir. Açar müqayisəsi sabit vaxtda aparılır. Açarsız və ya səhv açarlı sorğu heç bir keşə toxunmadan rədd edilir.
- **FR-003**: Qəbul nöqtəsi locale yönləndirməsindən, CSP nonce-dan və legacy URL xəritələməsindən keçməməli, ziyarətçi naviqasiyasında heç yerdə görünməməlidir.
- **FR-004**: Təmizləmədən sonrakı ilk ziyarətçi sorğusu təzə məlumat almalıdır. Köhnə məzmunun "bir dəfə də göstərilib fonda yenilənməsi" bu hal üçün qəbul edilmir.
- **FR-005**: Təmizləmə public saytın bütün işləyən instansiyalarına təsir etməlidir (US3).
- **FR-006**: Keşin adi ömürləri (məzmun 60 san, ağac 300 san) təhlükəsizlik toru kimi qalır. Bu feature onları uzatmır və söndürmür.

**Admin API (`api-cbar-admin`)**

- **FR-007**: Public məzmuna təsir edən hər uğurlu yazıdan (yaratma, yeniləmə, silmə, sıralama, dərc/dərcdən çıxarma, təsdiq) sonra admin API public sayta həmin yazının təsir etdiyi bölmələri bildirməlidir.
- **FR-008**: Hər admin bölməsinin (controller-in) hansı public bölmə etiketlərinə təsir etdiyi bir yerdə, açıq xəritə kimi saxlanmalıdır. Ana səhifədə görünən bölmələr `homepage`-i də daxil edir.
- **FR-009**: Bildiriş yazı cavabını gecikdirməməli və pozmamalıdır. Redaktor cavabı bildirişin nəticəsindən asılı olmayaraq alır. Bildiriş uğursuz olarsa, xəta log-a yazılır.
- **FR-010**: Admin API-də manual "bütün keşi təmizlə" əməliyyatı olmalıdır. O, ayrıca icazə tələb edir, public saytın cavabını gözləyir və nəticəni (uğur/xəta) çağırana qaytarır. Xəta spec 018 formatındadır (`application/problem+json`).
- **FR-011**: Manual təmizləmə audit jurnalına yazılmalıdır (kim, nə vaxt, nəticə). Avtomatik bildirişlər audit jurnalına yazılmır, çünki onları doğuran yazı artıq orada var.
- **FR-012**: Public saytın ünvanı və gizli açar konfiqurasiyadan oxunur (deploy edilmiş mühitlərdə Vault, lokalda development default-ları). Açar kodda və ya repo-da yalnız lokal inkişaf dəyəri kimi ola bilər.
- **FR-013**: Endpoint dəyişikliyi spec-first-dir: manual əməliyyatın kontraktı əvvəlcə `api-cbar-admin/openapi/`-də yazılır və təsdiqlənir.

**Admin panel (`web-cbar-admin-new`)**

- **FR-014**: Admin paneldə icazəsi olan istifadəçilərə "Keşi təmizlə" düyməsi göstərilməlidir. O, FR-010 əməliyyatını çağırır, gedişat zamanı məşğul vəziyyət, sonra uğur və ya xəta bildirişi göstərir.
- **FR-015**: Düymənin bütün mətnləri az və en dillərindədir.
- **FR-016**: Yeni icazə rol idarəetməsində (spec 008) digər icazələr kimi görünür və verilə bilir. Default olaraq admin roluna verilir.

### Key Entities

- **Bölmə etiketi**: public saytda keşlənən məzmunun qrupu (`pages`, `homepage`, `press-releases`, …). Avtomatik və manual təmizləmənin vahidi budur.
- **Bölmə xəritəsi**: admin bölməsi → təsir etdiyi bölmə etiketləri. Admin API-də saxlanılır.
- **Keş təmizləmə icazəsi**: manual təmizləməyə və düyməni görməyə imkan verən yeni icazə.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Redaktor saxladıqdan sonra public saytda dəyişiklik 5 saniyə içində növbəti yeniləmədə görünür. Ölçmə: menyu sırası, səhifə mətni, press-reliz, ana səhifə bloku, məzənnə təsdiqi — hər biri az və en dillərində, test mühitində.
- **SC-002**: Public sayt əlçatmaz olanda admin paneldə yazıların 100%-i yenə uğurlu olur. Yazı cavab müddəti feature-dan əvvəlki ilə müqayisədə ölçülə bilən qədər artmır.
- **SC-003**: Manual təmizləmə düyməyə basdıqdan sonra 5 saniyə içində nəticə mesajı göstərir.
- **SC-004**: Açarsız və ya səhv açarlı təmizləmə cəhdlərinin 100%-i rədd edilir və keşə təsir etmir.
- **SC-005**: Bir neçə instansiyalı mühitdə təmizləmədən sonra ardıcıl 20 yeniləmənin heç birində köhnə məzmun görünmür.
- **SC-006**: Public sayt ziyarətçilər üçün spec 003-ün keş qazancını saxlayır: dəyişiklik olmayan dövrdə səhifə cavab müddəti feature-dan əvvəlki kimidir.

## Assumptions

- Keş təmizləmə yalnız `web-cbar-new`-in server keşinə aiddir. Brauzer keşi, CDN və ya ingress keşi bu feature-a aid deyil (hazırda HTML-i keşləyən qat yoxdur).
- Bir neçə instansiya halının həlli (bütün instansiyalara yayım və ya paylaşılan keş) plan mərhələsində seçilir. Mövcud Redis (artıq stack-dədir) üstünlük verilən namizəddir. Replica sayı paylaşılan Helm chart-dan və ya DevOps-dan dəqiqləşdirilir.
- Avtomatik bildiriş yazı bitəndən sonra "göndər və unut" kimi işləyir. Növbə, təkrar cəhd və davamlı saxlama yoxdur: uğursuz bildirişi keşin adi ömrü örtür.
- "Hamısı" təmizləməsi əlavə yük yaradır (növbəti sorğular API-yə gedir). Bu, `api-cbar`-ın rate limit-i (1000/dəq/IP) daxilindədir, çünki public sayt API-yə öz IP-si ilə gedir və keş tez dolur.
- Üç merge request belə deploy olunur: `web-cbar-new` → `api-cbar-admin` → `web-cbar-admin-new`. Panel düyməsi icazəni və əməliyyatı tələb edir, ona görə sonuncudur.
- Bu spec spec 003-ün SC-010 qərarını (60 san) əvəz edir: hədd dərhaldır, 60/300 san yalnız təhlükəsizlik torudur.
