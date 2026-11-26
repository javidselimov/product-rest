# Implementation Plan: Admin API-də RBAC və məzənnələr üçün four-eyes təsdiqi

**Branch**: `008-admin-rbac-four-eyes` (spec qovluğu; iş hazırda `test` branch-indədir) | **Date**: 2026-10-09 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/008-admin-rbac-four-eyes/spec.md`

## Summary

Bu gün admin API-də yeganə rol yoxlaması `UsersController`-dədir. Qalan 25 faylda (31
controller sinfi, ~150 action) istənilən login olmuş istifadəçi hər şeyi edə bilir, o
cümlədən rəsmi məzənnəni dərhal dərc edə və silə bilir. Həll iki ardıcıl, ayrıca deploy
olunan hissədən ibarətdir.

**1a — RBAC (13 SP)**

1. Mövcud boş `permissions`/`role_permissions` cədvəlləri migration `0009` ilə seed olunur:
   98 kod, moderator və meas_manager sətirləri. `admin` kodda bütün icazələrə malikdir (R2).
2. Tokendə yalnız rol qalır. Server rolu yaddaşda saxlanılan xəritə ilə icazələrə çevirir.
   Spec 020-nin stamp mexanizmi rol dəyişikliyini artıq növbəti sorğuda tətbiq edir (R1).
3. Hər action `[RequirePermission]` daşıyır. Daşımayan action qeyri-admin üçün 403 verir
   (default-deny), statik inventar skripti isə SC-001-i ölçür (R3).
4. 403 rəddi `audit_log`-a `authz.denied` kimi yazılır (R4).
5. Dağıdıcı və sistem əməliyyatları üçün ayrıca kodlar: `pages.delete_subtree`, `settings.*`
   (allowlist + yeni `DELETE`), `users.*` (R8).
6. Üç oxuma endpoint-i əlavə olunur: `me/permissions`, `roles`, `audit-log` (R7).

**1b — four-eyes (13 SP, ilkin 8)**

1. Gözləyən dəyişiklik yeni `currency_rate_requests` cədvəlində yaşayır. `currency_rates`
   yalnız təsdiqlənmiş məlumatı saxlayır. Nəticədə `api-cbar` və XML feed toxunulmaz qalır,
   `ALTER TABLE` lazım olmur (R9).
2. `PUT/DELETE /currency-rates` 202 qaytarır və tələb yaradır.
3. `approve`/`return` endpoint-ləri əlavə olunur. Hazırlayan ≠ təsdiqləyən qaydası kodda və
   DB `CHECK`-ində təmin olunur. Versiya tələb id-sidir: yeni göndəriş köhnəni `superseded`
   edir.

Panel bu spec-in əhatəsində deyil (R11).

## Technical Context

**Language/Version**: C# / .NET 10 (`api-cbar-admin`; `api-cbar`-da yalnız `Cbar.Domain`, 1b). Node 22 (inventar skripti)

**Primary Dependencies**: ASP.NET Core Authorization (`IAuthorizationPolicyProvider`, `AuthorizationHandler`, `IAuthorizationMiddlewareResultHandler`), EF Core + Npgsql, `Microsoft.Extensions.Caching.Memory` (framework-ün bir hissəsi). **Yeni NuGet paketi yoxdur**

**Storage**: PostgreSQL. 1a: mövcud `permissions`, `role_permissions` (yalnız seed, sxem dəyişmir). 1b: **yeni** `currency_rate_requests` ([data-model.md §4](./data-model.md)). `currency_rates` dəyişmir

**Testing**: API-də avtomatik test yoxdur (Konstitusiya VIII.1). Statik yoxlama: `permission-inventory.mjs`, OpenAPI lint/bundle, `route-diff.mjs`. Davranış `test` mühitində [quickstart.md](./quickstart.md) ilə yoxlanılır

**Target Platform**: Linux konteyner (k8s), ingress arxasında

**Project Type**: web-service (upstream repo-lar: `api-cbar-admin`; 1b-də əlavə olaraq `api-cbar`, yalnız `Cbar.Domain`)

**Performance Goals**: icazə yoxlaması yaddaşdan gedir, sorğu başına əlavə DB sorğusu yoxdur. `media.delete_own` əlavə sorğu tələb etmir, çünki action asset-i onsuz da yükləyir. Xəritə 5 dəqiqədə bir yüklənir

**Constraints**:
- Rol dəyişikliyi növbəti sorğuda qüvvəyə minir (spec 020, FR-005).
- 403-ün `title`-ı olmur (`ProblemDetailsSetup`, panel uyğunlaşana qədər).
- Mövcud cədvəllərə `ALTER` edilmir.
- XML feed bayt-bayt eyni qalır (Maddə VII.1).
- Panel JWT rolunu enum kimi oxuyur, ona görə yeni rol yaradılmır.
- Endpoint dəyişiklikləri spec-first qaydası ilə gedir (hook).
- Lokalda .NET SDK yoxdur.

**Scale/Scope**:
- 25 controller faylı (~150 action-a atribut).
- Yeni `Authorization/` qovluğu (~6 fayl, ~300 sətir).
- 3 yeni controller (`Me`, `Roles`, `AuditLog`), `SettingsController` (`DELETE` + allowlist),
  `PagesController.Delete`, `MediaController.Delete`.
- 1b: `CurrencyRatesController` (PUT/DELETE) və yeni `CurrencyRateRequestsController`.
- 2 migration, 1 Node skripti, OpenAPI.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Maddə | Yoxlama | Status |
|---|---|---|
| I.2 `product-host` referansı | `MainController.php:52`, `meas/controllers/BaseController.php`, `HomeController.php:19`, `UsersController.php:34`, `CurrencyController.php` (spec və research R6). Matris legacy-ni təkrarlayır, four-eyes isə yeni funksiyadır | ✅ |
| I.3 səssiz itki qadağandır | Moderatorun MEAS hüququ legacy-də var idi və saxlanılır (R6). Bu nöqtə matris razılaşmasında açıq təsdiqlənir (quickstart §1). Heç bir funksiya ləğv olunmur | ✅ |
| II.3 iki proyekt = iki MR, deploy sırası | 1a: yalnız `api-cbar-admin` (1 MR). 1b: **(1)** `api-cbar-admin` (OpenAPI, migration `0010`, kod, `Cbar.Domain`), **(2)** `api-cbar` (yalnız `Cbar.Domain`). Sıra 1a → 1b(1) → 1b(2) | ✅ |
| III.2 yeganə yazan | Yeni cədvələ yalnız `api-cbar-admin` yazır. `api-cbar` onu oxumur, `cbar_web_ro`-ya grant verilmir | ✅ |
| III.3 public filtr | Public sorğular dəyişmir. Gözləyən dəyər `currency_rates`-ə düşmür, yəni filtr konstruktivdir (R9) | ✅ |
| III.4 JWT + audit | JWT qalır, icazə yoxlaması üstünə əlavə olunur. Rədd, təsdiq, qaytarma və əvəzetmə audit-ə yazılır (data-model §5) | ✅ |
| IV.2 start/deploy sırası | `api-cbar-admin` əvvəl gəlir (migration). `api-cbar` yeni cədvəldən asılı deyil. Port və skript dəyişmir | ✅ |
| V.1 `Cbar.Domain` bayt-bayt eyni | 1a dəyişmir. 1b-də `CurrencyRateRequest` + DbSet hər iki kopyaya eyni commit-də düşür, `diff -r` boş olur (quickstart §7) | ✅ |
| V.2 migration qaydaları | `0009`, `0010` yeni fayllardır, ad hər iki API üzrə unikaldır (`api-cbar`-da migration yoxdur). `IF NOT EXISTS` / `ON CONFLICT` istifadə olunur, `BEGIN/COMMIT` yoxdur. Hüquq yoxlaması şərtidir, deploy-u bloklamır | ✅ |
| V.5 UTF-8 | Spec faylları Node/Edit ilə yazılır, shell redirection istifadə olunmur | ✅ |
| VII.1 XML feed kontraktı | Toxunulmur. Bayt-bayt müqayisə quickstart §6-dadır | ✅ |
| VII.3 kontraktın geriyə uyğunluğu | `PUT/DELETE /currency-rates` 204 əvəzinə 202 qaytarır, route və request eynidir. Panel cavabı parse etmir (R11). 403 yeni statusdur, amma panel onu idarə edir. Spec-first: OpenAPI koddan əvvəl gəlir | ⚠️ semantika dəyişir, əsaslandırılıb (Complexity Tracking) |
| VII.5 sirlər | Yeni sirr və Vault açarı yoxdur | ✅ |
| VIII.1 real icra ilə verification | Lokal stack qaldırıla bilmir (.NET SDK yoxdur). Build pipeline-da, icra `test`-də gedir. Baseline deploy-dan **əvvəl** götürülür | ⚠️ sapma, əsaslandırılıb (spec 020 ilə eyni) |
| VIII.3 iki proyektli verification | 1b(2)-dən sonra `api-cbar` `/healthz` yaşıl olur və feed bayt-bayt eyni qalır | ✅ |
| Yeni runtime dependency yalnız spec ilə | Yoxdur | ✅ |
| Mürəkkəblik əsaslandırılır (Governance 4) | Yeni cədvəl (R9) və yeni endpoint-lər (R7, R8) alternativlərlə əsaslandırılıb | ✅ |

**Post-design re-check (Phase 1-dən sonra)**: dizayn spec-ə ziddiyyət yaratmır. FR-001…FR-021
R1–R10 ilə qarşılanır. Spec-dən üç dəqiqləşdirmə var:

- FR-006: moderatora `meas.*` verilir (legacy paritet, R6).
- "Ortaq soraqçalar" üçün ayrıca lookup endpoint-i lazım olmadı. Hər formanın oxuduğu
  soraqça elə həmin rolun `read` icazəsinin içindədir, `[AnyAuthenticatedUser]` yalnız
  `me/permissions` üçündür. Spec-in edge case-i buna uyğunlaşdırılıb (analyze F1).
- Spec-in "status draft → approved" ifadəsi status sütunu kimi yox, tələb cədvəli kimi
  həyata keçirilir (R9).

Nəticə: ✅, iki əsaslandırılmış sapma (VII.3, VIII.1).

## Paritet cədvəli (iş axını, bənd 5)

| `product-host` | Legacy davranış | Yeni qarşılıq | Status |
|---|---|---|---|
| `admin/controllers/MainController.php:52` | Məzmun və maliyyə modullarına admin və moderator girir | `moderator` rolunda 16 məzmun modulu və `azir`, `inflation`, `yield_curves`, `currencies` (data-model §3) | ✅ birə-bir |
| `admin/modules/meas/controllers/BaseController.php` | MEAS istənilən login olmuş istifadəçiyə açıqdır | `meas.*` admin, moderator və meas_manager üçün | ✅ birə-bir (T001-də təsdiqlənir) |
| `admin/controllers/HomeController.php:19` | meas_manager yalnız MEAS bölməsinə yönləndirilir | meas_manager: `meas.*` + `media.read/create/delete_own`, qalan hər şey 403 | ✅ API səviyyəsində. Panel naviqasiyası ayrıca spec-dir (T050) |
| `admin/controllers/UsersController.php:34` | İstifadəçiləri yalnız admin idarə edir | `users.*` yalnız admin | ✅ birə-bir (mövcud davranış saxlanılır) |
| `admin/controllers/CurrencyController.php` (`MainController`-dən) | Admin və moderator məzənnəni dəyişir, dəyişiklik dərhal dərc olunur | Admin və moderator **hazırlayır**, başqa admin təsdiqləyəndən sonra dərc olunur | 🔄 dəyişir: four-eyes yeni funksiyadır (spec US2) |
| `admin/controllers/PagesController.php` (`MainController`-dən) | Səhifə alt ağacı ilə birlikdə silinir, admin və moderator edə bilir | `pages.delete_subtree` yalnız admin-də, tək səhifəni moderator da silir | 🔒 sərtləşir (FR-019) |
| — | Rol → icazə görünüşü və audit oxuması yoxdur | `GET /me/permissions`, `GET /roles`, `GET /audit-log` | ➕ yeni (US4) |

Heç bir legacy funksiya ləğv olunmur (Maddə I.3).

## Project Structure

### Documentation (this feature)

```text
specs/008-admin-rbac-four-eyes/
├── spec.md
├── plan.md                         # bu fayl
├── research.md                     # Phase 0: R1–R12, SP
├── data-model.md                   # Phase 1: kataloq (98), matris, currency_rate_requests, audit
├── quickstart.md                   # Phase 1: test mühitində §0–§7
├── contracts/
│   ├── rbac.md                     # 1a: 403 semantikası, me/permissions, roles, audit-log, settings
│   └── currency-rate-requests.md   # 1b: PUT/DELETE 202, requests, approve/return
├── checklists/
│   └── requirements.md
└── tasks.md                        # Phase 2 (/speckit-tasks)
```

### Source Code (repository root)

```text
# 1a — api-cbar-admin (1 MR)
product-rest/api-cbar-admin/
├── openapi/                                   # ƏVVƏL (spec-first)
│   ├── paths/{rbac,settings,pages}.yaml       # me/permissions, roles, audit-log; DELETE settings; 403
│   ├── components/{responses.yaml,schemas/}   # Forbidden təsviri, yeni sxemlər
│   └── openapi.yaml + dist/                   # x-permission konvensiyası, lint + bundle
├── db/migrations/0009-rbac-permissions.sql    # YENİ: hüquq yoxlaması + kataloq + rol sətirləri
├── scripts/permission-inventory.mjs           # YENİ: SC-001 (routes.mjs-i paylaşır)
└── src/Cbar.AdminApi/
    ├── Authorization/                         # YENİ
    │   ├── Permissions.cs                     # 98 sabit + All
    │   ├── RequirePermissionAttribute.cs      # : AuthorizeAttribute, Policy = "perm:<kod>"
    │   ├── AnyAuthenticatedUserAttribute.cs
    │   ├── PermissionPolicyProvider.cs        # "perm:" prefiksi → PermissionRequirement
    │   ├── PermissionHandler.cs               # admin → ✓; matris; any-of
    │   ├── PermissionChecker.cs               # action daxilində yoxlama + authz.denied (subtree, delete_own)
    │   ├── PermissionMatrix.cs                # singleton, IMemoryCache 5 dəq, startup kataloq yoxlaması
    │   ├── PermissionGuardFilter.cs           # default-deny (R3)
    │   └── AuditingAuthorizationResultHandler.cs  # 403 → authz.denied (R4)
    ├── Program.cs                             # DI, filter, result handler, startup yoxlaması
    ├── Controllers/
    │   ├── *.cs (25 fayl)                     # [Authorize] → [RequirePermission(...)]
    │   ├── MeController.cs                    # YENİ: GET me/permissions
    │   ├── RolesController.cs                 # YENİ: GET roles
    │   ├── AuditLogController.cs              # YENİ: GET audit-log
    │   ├── PagesController.cs                 # Delete: subtree icazəsi + RETURNING id
    │   ├── SettingsController.cs              # allowlist + DELETE
    │   └── MediaController.cs                 # Delete: delete_own
    └── Validation/KnownSettings.cs            # YENİ: tanınan açarlar

# 1b(1) — api-cbar-admin (MR)
product-rest/api-cbar-admin/
├── openapi/paths/statistics.yaml              # ƏVVƏL: rateSheet 202, rateRequests*
├── db/migrations/0010-currency-rate-requests.sql   # YENİ cədvəl, CHECK-lər, partial unique, şərti FK
└── src/
    ├── Cbar.Domain/{Entities/Currency.cs,CbarDbContext.cs}   # CurrencyRateRequest
    └── Cbar.AdminApi/
        ├── Services/CurrencyRateApproval.cs   # YENİ: submit/supersede/approve/return (tranzaksiya)
        └── Controllers/
            ├── CurrencyRatesController.cs     # PUT/DELETE → 202 + tələb
            └── CurrencyRateRequestsController.cs  # YENİ: list, get, approve, return

# 1b(2) — api-cbar (MR, 1b(1)-dən sonra)
product-rest/api-cbar/src/Cbar.Domain/{Entities/Currency.cs,CbarDbContext.cs}   # eyni, diff boş
```

**Structure Decision**: Avtorizasiya kodu ayrıca `Authorization/` qovluğunda yaşayır, ki
`Services/` (biznes servisləri) və `Errors/` (cavab forması) ilə qarışmasın. Four-eyes
məntiqi `RefreshTokenService`/`SecurityStampService` nümunəsi ilə scoped servisə
(`CurrencyRateApproval`) çıxarılır, çünki tranzaksiya və konkurensiya qaydaları iki
controller arasında paylaşılır. `web-cbar-admin-new` toxunulmur, onun işi ayrıca frontend
spec-idir.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| VII.3: `PUT/DELETE /currency-rates` 204 əvəzinə 202 qaytarır, dəyər dərhal dərc olunmur | FR-010 dəyişikliyin dərhal qüvvəyə minməməsini tələb edir. Bu, semantikanın özüdür | Yeni route (`POST /currency-rate-requests`) əlavə edib köhnəni saxlamaq four-eyes-i yan keçən yolu açıq qoyardı. Panel 2xx-i uğur sayır və cavabı parse etmir (R11) |
| VIII.1: verification `test` mühitində aparılır | Bu maşında .NET SDK yoxdur | Spec 020 ilə eyni əsas. Baseline deploy-dan əvvəl götürülür |
| Yeni cədvəl `currency_rate_requests` (+ `api-cbar` MR-ı yalnız `Cbar.Domain` üçün) | Gözləyən və dərc olunmuş dəyər eyni gün üçün yanaşı yaşamalıdır (US2 AS5) | `currency_rates.status` sütunu `ALTER` tələb edir, `(rate_date, currency_code)` unique açarı ilə toqquşur və `api-cbar`-da 4 sorğuya filtr lazım olur (R9) |
| 3 yeni oxuma endpoint-i və `DELETE /settings/{key}` | US4 (FR-007, AS3) və US3 edge case | Bu gün audit-i oxuyan və ayarı silən heç bir yol yoxdur. Alternativ DB-yə birbaşa girişdir |
