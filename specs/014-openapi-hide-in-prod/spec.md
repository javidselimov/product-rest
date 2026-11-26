# Feature Specification: Admin API-nin OpenAPI sənədinin prod-da gizlədilməsi

**Feature Branch**: `014-openapi-hide-in-prod` (spec qovluğu; iş hazırda `test` branch-indədir)

**Created**: 2026-10-05

**Status**: Draft

**Input**: User description: "13. OpenAPI prod-da açıqdır (Program.cs:71, MapOpenApi() şərtsiz). — 1 SP. Admin API-nin tam xəritəsi anonim istifadəçiyə açıqdır. IsDevelopment() şərti arxasına keçirilməlidir. SP izahı: bir if. Drift-check pipeline-da OpenAPI endpoint-inə müraciət edirsə, onun da işlədiyini yoxlamaq lazımdır."

**Mənbə**: `api-admin-review.md`, task #13 (🟠 Yüksək, 1 SP).

**Əhatə olunan proyekt**: yalnız `api-cbar-admin` (CMS API). `api-cbar`, admin panellər
(`web-cbar-admin`, `web-cbar-admin-next`), sxem, migration və `Cbar.Domain` **toxunulmur**.
Heç bir controller endpoint-i dəyişmir.

**`product-host` istinadı (Konstitusiya Maddə I.2)**: qarşılığı yoxdur. Köhnə Yii2 admin
(`product-host/admin`) maşın oxuya bilən API xəritəsi dərc etmirdi — bu, yeni stack-in
gətirdiyi yeni ifşa səthidir. Paritet itkisi yoxdur; feature köhnə vəziyyətə (xəritə xaricə
açıq deyil) qaytarır.

**Paritet (İş axını qaydası 5)**:

| `product-host` davranışı | Yeni sistemdə | Status |
|---|---|---|
| Admin API-nin maşın oxunan xəritəsi dərc olunmur | `/openapi/v1.json` bu gün hər mühitdə açıqdır | **Bu spec bərpa edir**: `Production`-da 404 |
| — (köhnədə kontrakt yoxlaması yoxdur) | `npm run drift` dev/test-də runtime sənədi oxuyur | Yeni sistemə məxsus, saxlanılır (`Development`/`Staging`-də açıq) |

### Mövcud vəziyyətin ölçülmüş faktları

| Fakt | Mənbə |
|---|---|
| Generasiya olunan API sənədi (`/openapi/v1.json`) hər mühitdə, autentifikasiyasız verilir | `src/Cbar.AdminApi/Program.cs:72` |
| Hand-written spec bunu artıq məlum problem kimi qeyd edir | `openapi/openapi.yaml`, `info.x-known-issues` |
| Mühitlər: lokal = `Development`, **dev və test = `Staging`**, prod = `Production` | `appsettings.Development.json`, `.ci-cd/{dev,test,prod}.yaml` |
| Drift-check GitLab pipeline-ında **işləmir**; əl ilə (`npm run drift`) **test** mühitinə qarşı işlədilir | `.gitlab-ci.yml` (yalnız paylaşılan pipeline), `openapi/scripts/drift-check.mjs:12`, `openapi/README.md` |
| Sənədin başqa istehlakçısı yoxdur — admin panellər onu oxumur | repo axtarışı |

Nəticə: review-un təklif etdiyi kimi sənədi **yalnız `Development`-də** açmaq test mühitini
(`Staging`) də bağlayar və drift-check-i sındırar. Ona görə bu spec sərhədi **"Production-da
bağlı, yalnız `Development` və `Staging`-də açıq"** kimi qoyur (bax: Assumptions).

Ölçmə (2026-10-05): `https://api-cbar-admin-test.cbar.az/openapi/v1.json` → **200, 155 079 bayt**,
autentifikasiyasız; prod hostname (`api-cbar-admin.cbar.az`, `TODO(devops)`) hələ resolve olunmur.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Anonim ziyarətçi prod-da admin API-nin xəritəsini ala bilmir (Priority: P1)

Bu gün internetdən istənilən şəxs prod admin API-nin ünvanına bir sorğu göndərib onun bütün
endpoint-lərinin, parametrlərinin və sorğu gövdələrinin tam siyahısını ala bilir — login
olmadan. Bu, hücumçu üçün kəşfiyyat mərhələsini tamamilə aradan qaldırır: hansı istifadəçi
idarəetmə, media yükləmə və ya parametr endpoint-lərinin olduğunu təxmin etməyə ehtiyac qalmır.
Feature-dən sonra prod-da həmin ünvan "tapılmadı" cavabı verir və heç bir məlumat açmır.

**Why this priority**: Feature-in yeganə məqsədi budur; review-da 🔴 prioritetlə qeyd olunub.
İnformasiya ifşasıdır, həlli minimaldır.

**Independent Test**: Prod mühitində (və ya `Production` rejimində işə salınmış nüsxədə)
autentifikasiyasız `GET /openapi/v1.json` sorğusu göndərilir; cavab "tapılmadı" olmalı və
gövdədə API xəritəsi olmamalıdır. `/healthz` və login kimi digər endpoint-lər əvvəlki kimi
cavab verməlidir.

**Acceptance Scenarios**:

1. **Given** `Production` mühiti, **When** anonim istifadəçi API sənədinin ünvanını sorğulayır,
   **Then** cavab "tapılmadı" (404) olur və gövdədə heç bir endpoint siyahısı yoxdur.
2. **Given** `Production` mühiti, **When** etibarlı token-lə daxil olmuş istifadəçi eyni ünvanı
   sorğulayır, **Then** cavab yenə "tapılmadı" olur — sənəd prod-da autentifikasiya ilə də
   verilmir.
3. **Given** `Production` mühiti, **When** sağlamlıq yoxlaması, login və digər mövcud endpoint-lər
   çağırılır, **Then** onların davranışı dəyişmir.

---

### User Story 2 - Komanda test mühitində drift-check-i əvvəlki kimi işlədə bilir (Priority: P1)

Developer endpoint dəyişikliyini test-ə deploy etdikdən sonra `npm run drift` işlədir: skript
test API-nin generasiya etdiyi sənədi əl ilə saxlanılan spec ilə müqayisə edir. Bu yoxlama
spec-first iş axınının (`/api-endpoint`, `/sync-openapi`) son addımıdır və ondan sonra da
işləməlidir. Lokal işləyən developer də sənədi lokal API-dən əvvəlki kimi ala bilir.

**Why this priority**: User Story 1 ilə eyni dərəcədə vacibdir — ifşanı bağlamaq kontrakt
yoxlamasını sındırmamalıdır. Review-un SP izahı bunu açıq şərt kimi qoyur.

**Independent Test**: Test mühitinə deploy-dan sonra `cd product-rest/api-cbar-admin/openapi &&
npm run drift` işlədilir; skript sənədi uğurla alır və bugünkü kimi nəticə (fərq siyahısı və ya
"fərq yoxdur") verir. Lokal `Development` ssenarisi (ssenari 3) bu maşında icra olunmur — .NET
SDK yoxdur; SDK olan maşında `dotnet run` → `http://localhost:5253/openapi/v1.json` ilə yoxlanılır,
burada isə kod review ilə (`Development` siyahıdadır).

**Acceptance Scenarios**:

1. **Given** test mühiti (`Staging`), **When** drift-check skripti işlədilir, **Then** o, API
   sənədini uğurla alır və müqayisəni tamamlayır — "sənəd alınmadı" xətası vermir.
2. **Given** dev mühiti (`Staging`), **When** API sənədinin ünvanı sorğulanır, **Then** sənəd
   bugünkü kimi verilir.
3. **Given** lokal `Development` mühiti, **When** developer API sənədinin ünvanını açır, **Then**
   sənəd bugünkü kimi verilir.

---

### Edge Cases

- **Mühit adı təyin olunmayıb**: platformanın default-u `Production`-dur — sənəd bağlı qalır
  (təhlükəsiz tərəfə yıxılma).
- **Gözlənilməz mühit adı** (məs. gələcəkdə `Test` və ya `Preprod` əlavə olunsa): sənəd **bağlı**
  qalır — açıq olduğu mühitlər açıq siyahıdır (`Development`, `Staging`), qalan hər ad prod kimi
  davranır (təhlükəsiz tərəfə yıxılma; plan research R2). Yeni daxili mühitdə sənəd lazım olarsa,
  siyahı şüurlu şəkildə genişləndirilir.
- **Sənəd ünvanının variantları** (sonunda `/`, böyük-kiçik hərf, başqa versiya adı): prod-da
  heç biri API xəritəsi qaytarmamalıdır.
- **`/healthz`** və digər Program.cs-də xəritələnən endpoint-lər: təsirlənmir — prod monitorinqi
  və Kubernetes yoxlamaları əvvəlki kimi işləyir.
- **Prod-a qarşı drift-check**: bu gün də istifadə olunmur; feature-dən sonra prod-a qarşı
  işlədilsə aydın xəta verir (404) — bu, gözlənilən davranışdır.
- **`api-cbar` (public API)**: onun da sənədi şərtsiz açıqdır, amma o, yalnız oxuyan public
  API-dir və bu feature-in əhatəsindən kənardır (bax: Assumptions).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: `Production` mühitində admin API generasiya olunmuş API sənədini **heç bir**
  istifadəçiyə (anonim və ya autentifikasiyalı) verməməlidir; sənədin ünvanı "tapılmadı" (404)
  cavabı qaytarmalıdır.
- **FR-002**: Yalnız açıq sadalanan daxili mühitlərdə — lokal `Development` və dev/test `Staging` —
  sənəd bugünkü ünvanda, bugünkü formada verilməyə davam etməlidir.
- **FR-003**: Mühit adı təyin olunmadıqda və ya siyahıda olmayan hər hansı adda davranış
  `Production`-dakı kimi olmalıdır (sənəd bağlı).
- **FR-004**: Test mühitinə qarşı mövcud drift-check skripti dəyişiklik edilmədən uğurla
  işləməlidir.
- **FR-005**: Sağlamlıq yoxlaması, autentifikasiya və bütün controller endpoint-lərinin
  davranışı heç bir mühitdə dəyişməməlidir.
- **FR-006**: Əl ilə saxlanılan OpenAPI spec-də (`openapi/openapi.yaml`) bu problemi qeyd edən
  `x-known-issues` sətri feature-in nəticəsini əks etdirəcək şəkildə yenilənməli və ya
  silinməlidir; layihə sənədləri (`README.md`, `CREDENTIALS.md`, `openapi/README.md`) sənədin
  yalnız prod-dan kənar mühitlərdə mövcud olduğunu göstərməlidir.
- **FR-007**: Endpoint kontraktı dəyişmir: əl ilə saxlanılan spec-in `paths` hissəsinə toxunulmur
  (generasiya olunmuş sənədin ünvanı spec-də endpoint kimi təsvir olunmur).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Prod-a deploy-dan sonra autentifikasiyasız və autentifikasiyalı API sənədi
  sorğularının 100%-i "tapılmadı" alır; cavab gövdələrinin heç birində endpoint siyahısı yoxdur.
- **SC-002**: Test mühitinə deploy-dan sonra `npm run drift` ilk cəhddə sənədi alır və
  müqayisəni tamamlayır; nəticə feature-dən əvvəlki ilə eynidir — fərq yalnız eyni deploy-a
  düşmüş başqa endpoint dəyişikliklərindən gələ bilər və hər biri izah olunur.
- **SC-003**: İlk prod deploy-dan sonra prod-da `/healthz` 200, doğru məlumatlarla login 200 qaytarır (reqressiya yoxdur; prod-un "əvvəlki"
  vəziyyəti olmadığından müqayisə `Staging`-dəki eyni sorğularla aparılır).
- **SC-004**: Repo daxilində "sənəd hər mühitdə açıqdır" deyən heç bir sənəd qalmır.

## Assumptions

- **Sərhəd: `Development` + `Staging` açıq, qalan hər ad (o cümlədən `Production`) bağlı** —
  yalnız `Development` yox. Review `IsDevelopment()` təklif edir, amma dev və
  test mühitləri `Staging` adı ilə işləyir; drift-check isə test-ə qarşı işlədilir. Yalnız
  `Development`-də açmaq test-i də bağlayardı və drift-check-i sındırardı — review-un SP izahında
  qoyduğu şərt pozulardı. Dev/test daxili mühitlərdir və orada sənədi açıq saxlamaq qəbul edilir.
  Alternativ (sənədi `Staging`-də də bağlayıb drift-check-ə token və ya ayrıca açar vermək) bu
  task-ın 1 SP həcmindən çıxır və rədd edilir; ehtiyac yaranarsa ayrıca task olacaq.
- **Dev/test-in xaricdən əlçatanlığı** DevOps tərəfindən idarə olunur (`TODO(devops)` hostname-lər);
  bu feature yalnız prod-u bağlayır.
- **Generator servisinin özü qalır** (yalnız ünvanın xəritələnməsi şərtə bağlanır): prod-da əlavə
  yük yaratmır, çünki sənəd yalnız sorğu gələndə qurulur.
- **`api-cbar` əhatədən kənardır**: review task-ı yalnız admin API-ni göstərir; public API-nin
  sənədi yalnız oxuyan public endpoint-ləri açır. Eyni dəyişiklik orada lazım olarsa, ayrıca
  task/MR olacaq (Konstitusiya Maddə II.3 — iki proyekt = iki MR).
- **Drift-check pipeline-da yoxdur**: `.gitlab-ci.yml` yalnız paylaşılan CBAR pipeline-ını daxil
  edir; drift əl ilə işlədilir. Paylaşılan pipeline-ın `verify` mərhələsi sənəd ünvanını yox,
  `/healthz`-i yoxlayır deyə fərz olunur — deploy-dan sonra test pipeline-ının yaşıl olması ilə
  təsdiqlənir.
- Lokalda .NET SDK yoxdur və lokal Docker yoxlaması aparılmır: backend lokalda nə build, nə run
  olunur. Build GitLab pipeline-ında (compile yoxlaması), yoxlama **publish-dən sonra** — `test`
  mühitində `probe` + `npm run drift` ilə (açıq qol), prod-da ilk prod deploy-dan sonra `curl` ilə
  (bağlı qol) aparılır (Konstitusiya Maddə VIII.1).
- **Bağlı qol (US1) prod-dan əvvəl real icra olunmur**: dev və test hər ikisi `Staging`-dir, yəni
  `Production` davranışını göstərən mühit prod-un özüdür. Prod-a qədər bu qol kod review ilə
  yoxlanılır. Risk məhduddur: şərt səhv olsa, prod-da sənəd açıq qalar — bu, bugünkü vəziyyətdən
  pis deyil və ilk prod yoxlamasında (quickstart §4) görünür.
- Bir proyekt, sxem dəyişikliyi yoxdur — deploy sırası məsələsi yoxdur. Review-un "dərhal"
  qrupundakı digər kiçik task-larla eyni `api-cbar-admin` MR-ında gedə bilər, onlardan asılı deyil.
