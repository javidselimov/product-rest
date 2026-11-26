---

description: "Task list for 008-admin-rbac-four-eyes"
---

# Tasks: Admin API-də RBAC (1a) və məzənnələr üçün four-eyes təsdiqi (1b)

**Input**: Design documents from `specs/008-admin-rbac-four-eyes/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/rbac.md](./contracts/rbac.md), [contracts/currency-rate-requests.md](./contracts/currency-rate-requests.md), [quickstart.md](./quickstart.md)

**Tests**: API-də avtomatik test yoxdur və spec bunu tələb etmir (Konstitusiya VIII.1).
Verification bu üç yolla aparılır:

- statik yoxlamalar: `permission-inventory.mjs`, OpenAPI lint/bundle, `route-diff.mjs`;
- GitLab pipeline-ın build-i;
- `test` mühitində [quickstart.md](./quickstart.md) ssenariləri.

Lokalda .NET SDK yoxdur, ona görə C# kodu build olunmadan yazılır. `using`-ləri, `async`/`await`-i,
namespace-ləri və adların uyğunluğunu diqqətlə yoxla (review task-ları T032 və T043 bunun üçündür).

**Organization**: Spec-də dörd user story var. Onlar iki ayrıca çatdırılmaya bölünür:

- **1a**: US1 (P1), US3 (P2), US4 (P3);
- **1b**: US2 (P1).

US2 P1 olsa da, sonda gəlir, çünki onun "hazırla/təsdiqlə" icazələri 1a-nın kataloqundan
gəlir (spec, "Çatdırılma bölgüsü"). Upstream iş paketləri:

| Paket | Repo | Məzmun | Deploy sırası |
|---|---|---|---|
| **A** | `product-rest/api-cbar-admin/` | 1a: OpenAPI, migration `0009`, `Authorization/`, controller-lər, inventar skripti | 1 |
| **B** | `product-rest/api-cbar-admin/` | 1b: OpenAPI, migration `0010`, `Cbar.Domain`, servis, controller-lər | 2 |
| **C** | `product-rest/api-cbar/` | 1b: yalnız `Cbar.Domain` (B ilə bayt-bayt eyni) | 3 |

Yollar repo kökünə nisbidir. Panel (`web-cbar-admin-new`) dəyişmir.

**Deploy qeydi**: Bu checkout-un `origin`-i GitHub-dır və oradan push heç nəyi deploy etmir.
Deploy yalnız GitLab-dakı komponent repo-larının `test` branch-indən gedir. Commit və push
yalnız istifadəçinin təsdiqi ilə edilir.

**Spec-first hook**: `.claude/hooks/spec-first.mjs` controller-ə yeni route əlavə edən redaktəni
həmin route `openapi/dist/openapi.json`-da yoxdursa bloklayır. Ona görə hər fazada OpenAPI
task-ı controller task-ından **əvvəl** gəlir. Atribut dəyişiklikləri route-u dəyişmir və
hook-dan keçir.

---

## Bir neçə agentlə icra

Lane-lərin fayl dəstləri kəsişmir. Agentlər eyni işçi ağacda, worktree-siz, paralel işləyə
bilər. Hər agent yalnız öz fayllarını redaktə edir və commit etmir. Lane-ləri aşağıdakı
**sabit interfeys** birləşdirir.

| Lane | Agent | Fayllar (yalnız bunlar) | Task-lar |
|---|---|---|---|
| **M** | əsas söhbət (orkestrator) | `product-rest/api-cbar-admin/openapi/**`, `specs/008-*/**`, `CLAUDE.md`, `business_logic/**` | T001–T005, T022, T027, T029, T031, T033–T036, T044–T051 |
| **S** | schema agent | `product-rest/api-cbar-admin/db/migrations/0009-*.sql`, `0010-*.sql`; hər iki `src/Cbar.Domain/Entities/Currency.cs`, `src/Cbar.Domain/CbarDbContext.cs` | T006, T037, T038 |
| **Z** | authz agent | `product-rest/api-cbar-admin/src/Cbar.AdminApi/Authorization/**`, `Program.cs` | T007–T012, T014, T015, T042 |
| **I** | inventory agent | `product-rest/api-cbar-admin/scripts/permission-inventory.mjs` | T013 |
| **C1–C6** | controller agentləri (6 paralel) | Hər biri T016–T021-dən birinin fayl siyahısı | T016–T021 |
| **E** | endpoints agent | `PagesController.cs`, `SettingsController.cs`, `MediaController.cs` (US3 hissəsi; T016/T020/T021-dən **sonra**), `Validation/KnownSettings.cs`, `MeController.cs`, `RolesController.cs`, `AuditLogController.cs` | T023–T026, T028, T030 |
| **F** | four-eyes agent | `Services/CurrencyRateApproval.cs`, `CurrencyRatesController.cs` (1b), `CurrencyRateRequestsController.cs` | T039–T041 |
| **R** | review agent (yalnız oxuyur) | heç nəyi dəyişmir, tapıntıları M-ə qaytarır | T032, T043 |

**Dalğalar**:

| Wave | Kim | Nə |
|---|---|---|
| 0 | M | T001–T005 |
| 1 | S, Z, I | Paralel: T006, T007–T012, T013 |
| 2 | Z (T014–T015), C1–C6 (T016–T021) | Paralel |
| 3 | M | T022 |
| 4 | E | T023–T026, T028, T030; M-də T027, T029 |
| 5 | R | T032 |
| 6 | M | Çatdırılma 1a: T033–T035 |
| 7 | M | T036 |
| 8 | S, F, Z | T037–T038, T039–T041, T042 |
| 9 | R | T043 |
| 10 | M | Çatdırılma 1b: T044–T046, Polish |

E lane-i C1/C5/C6 bitəndən sonra başlayır, çünki eyni controller fayllarına toxunur.

### Sabit interfeys (bütün lane-lər üçün kontrakt)

```csharp
// namespace Cbar.AdminApi.Authorization  (Lane Z)

public static class Permissions                       // T007 — data-model §2, 98 kod
{
    public static class Pages { public const string Read = "pages.read", Create = "pages.create",
        Update = "pages.update", Delete = "pages.delete", DeleteSubtree = "pages.delete_subtree"; }
    // … hər modul üçün eyni nümunə: PressReleases, Banners, Galleries, HomepageLinks,
    // HomepagePublications, ImagePopups, InfoLines, RunningLines, NewsSlider, Videos,
    // VideoStreams, Laws, LawCategories, MoneyMarks, Organization, Azir (Read/Create/Delete),
    // Inflation, YieldCurves, Currencies (Read/Update), CurrencyRates (Read/Prepare/Approve),
    // Meas, Media (Read/Create/Delete/DeleteOwn), Settings (Read/Update/Delete), Users,
    // Roles (Read), Audit (Read)
    public static readonly IReadOnlyList<string> All;  // refleksiya ilə yox, açıq siyahı; Count == 98
}

[RequirePermission(params string[] anyOf)]            // T008 — : AuthorizeAttribute; Policy = "perm:" + string.Join('|', anyOf)
[AnyAuthenticatedUser]                                // T008 — : AuthorizeAttribute; marker (yalnız GET me/permissions)

public sealed class PermissionMatrix                  // T010 — singleton
{
    public const string AdminRole = "admin";
    public Task<IReadOnlySet<string>> ForRoleAsync(string? roleCode);           // admin → All; naməlum → boş
    public Task<IReadOnlyList<RoleSummary>> RolesAsync();                       // GET /roles üçün
    public Task VerifyCatalogAsync(ILogger logger);                            // startup: All ⊆ permissions.code
}
public record RoleSummary(short Id, string Code, string Name, IReadOnlyList<string> Permissions);

public sealed class PermissionChecker                 // T011 — scoped (action daxilində yoxlama)
{
    public Task<bool> HasAsync(string code);                                   // HttpContext.User-in rolu ilə
    public Task<ObjectResult> DenyAsync(string code, string entityType, long entityId);
    // authz.denied-i AYRICA scope-un DbContext-i ilə yazır (çağıranın izlənən dəyişikliklərini flush etmir),
    // 403 problem details qaytarır (title/message yoxdur)
}
```

İcazə claim-i yoxdur. Rol `ClaimTypes.Role`-dan oxunur (`AuthController.CreateAccessTokenAsync`
onu bu gün də yazır). `sub` `ClaimTypes.NameIdentifier ?? "sub"`-dur (`AuditService` kimi).

---

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Paralel icra oluna bilər (fərqli fayl, tamamlanmamış task-dan asılılıq yoxdur)
- **[Story]**: Aid olduğu user story (US1–US4)

---

## Phase 1: Setup — razılaşma, test hesabları, baseline (kod yazılmazdan ƏVVƏL, Lane M)

**Purpose**: Matrisi biznes ilə təsdiqləmək və bugünkü vəziyyəti ölçmək (layihə qaydası: əvvəl
ölç, sonra iddia et). 1a-nın əsas vaxt xərci buradadır.

- [X] T001 [data-model.md §3](./data-model.md) matrisini istifadəçiyə təqdim et və məzmun/maliyyə sahibləri ilə razılaşdırılmasını xahiş et. Ayrıca soruşulmalı nöqtə: moderatorun `meas.*` hüququ (legacy paritet, research R6). Razılaşdırılmış nəticəni `specs/008-admin-rbac-four-eyes/spec.md`-də `## Clarifications` → `### Session 2026-10-09` altına yeni sətir kimi yaz. Matris dəyişərsə, `data-model.md` §2–§3-ü və [quickstart.md](./quickstart.md) §3-dəki sayları (98/87/7) eyni anda yenilə. **T006 və T007 bu task-dan asılıdır**
- [ ] T002 İstifadəçinin təsdiqi ilə `test` mühitində (`https://api-cbar-admin-test.cbar.az/api/v1`) üç test hesabı yarat: `qa_admin2` (admin), `qa_mod` (moderator), `qa_meas` (meas_manager). Parollar MR qaralamasına yazılmır. `GET /users` cavabında `roleCode`-ların `admin|moderator|meas_manager` olduğunu yoxla ([quickstart.md](./quickstart.md) §0.1). Fərqli rol kodu çıxsa, dayan və istifadəçiyə bildir (research R12)
- [ ] T003 Problemi deploy-dan **əvvəl** sübut et. `qa_meas` tokeni ilə `PUT /settings/qa.probe {"value":1}` göndər: bu gün 200 qaytarmalıdır. Sonra admin ilə həmin açarı bazadan sil və ya qeyd et ki, T026-dan sonra silinəcək. Nəticəni MR qaralamasına "Baseline 1a" kimi yaz (depends on T002)
- [ ] T004 1b deploy-undan **əvvəl** son 30 günün XML feed-ini `baseline/` qovluğuna saxla ([quickstart.md](./quickstart.md) §0.2). Qovluq skretçpad-da olsun, repo-da yox. Bu task T044-dən əvvəl bitməlidir

---

## Phase 2: Foundational — kontrakt, kataloq, avtorizasiya infrastrukturu (Paket A)

**Purpose**: Bütün story-lərin dayandığı hissələr: spec-first OpenAPI, `0009` seed-i, `Authorization/`
qovluğu, `Program.cs` qoşulması, inventar skripti.

**⚠️ CRITICAL**: Bu faza bitmədən heç bir controller atributu yazılmır.

- [X] T005 OpenAPI 1a, `product-rest/api-cbar-admin/openapi/` (Lane M, [contracts/rbac.md](./contracts/rbac.md) §1–§6). Addımlar:
  1. `components/responses.yaml#/Forbidden` təsvirini contracts §1-dəki mətnlə əvəz et.
  2. Yeni `paths/rbac.yaml` yarat: `mePermissions`, `roles`, `auditLog` açarları (contracts §2–§4).
  3. `components/schemas/`-a `MePermissions`, `RoleWithPermissions`, `AuditLogEntry`, `AuditLogPage` sxemlərini əlavə et. Mövcud sxem fayllarının formasına bax.
  4. `paths/settings.yaml`-a `item.delete` əlavə et (204/404). `put`-a 400 "Unknown setting key" təsvirini yaz.
  5. `openapi.yaml`-da `/api/v1/me/permissions`, `/api/v1/roles`, `/api/v1/audit-log` path-lərini qeyd et. `info.description`-a `x-permission` konvensiyasını bir abzasla əlavə et. `# Sync:` sətrini yenilə.
  6. **Hər** qorunan əməliyyata `x-permission: <kod>` (data-model §2 xəritəsi) və `'403': {$ref: ../components/responses.yaml#/Forbidden}` əlavə et.
  7. `npm run lint && npm run bundle` işlət. Hər ikisi yaşıl olmalıdır.

  Diff-i istifadəçiyə göstər və spec təsdiqini al (`/api-endpoint` axını).
- [X] T006 [P] `product-rest/api-cbar-admin/db/migrations/0009-rbac-permissions.sql` yarat (Lane S, [data-model.md §1](./data-model.md); depends on T001). Faylın quruluşu:
  - Əvvəldə şərh: spec 008, niyə admin sətri yoxdur (R2), niyə şərtidir (R12).
  - Tək `DO $$ … $$` bloku:
    1. `IF NOT has_table_privilege(current_user, 'permissions', 'INSERT') OR NOT has_table_privilege(current_user, 'role_permissions', 'INSERT') THEN RAISE WARNING 'spec 008: no INSERT privilege on permissions/role_permissions, RBAC seed skipped'; RETURN; END IF;`
    2. `INSERT INTO permissions (code, description) VALUES … ON CONFLICT (code) DO NOTHING`. Data-model §2-dəki 98 kodun hamısı, hər birinə qısa ingiliscə təsvirlə.
    3. Moderator üçün `INSERT INTO role_permissions (role_id, permission_id) SELECT r.id, p.id FROM roles r JOIN permissions p ON p.code <> ALL (ARRAY['pages.delete_subtree','currency_rates.approve','settings.read','settings.update','settings.delete','users.read','users.create','users.update','users.delete','roles.read','audit.read']) WHERE r.code = 'moderator' ON CONFLICT DO NOTHING;`. Nəticə 87 sətir olmalıdır.
    4. meas_manager üçün `… p.code = ANY (ARRAY['meas.read','meas.create','meas.update','meas.delete','media.read','media.create','media.delete_own']) WHERE r.code = 'meas_manager' …`. Nəticə 7 sətir olmalıdır.

  `BEGIN/COMMIT` yazma. Rolları id ilə tapma, yalnız `code` ilə tap.
- [X] T007 [P] `product-rest/api-cbar-admin/src/Cbar.AdminApi/Authorization/Permissions.cs` yarat (Lane Z; depends on T001). Sabit interfeysdəki forma ilə yaz: hər modul üçün iç-içə `static class`, `const string` kodları və `All` (açıq siyahı, 98 element). Kodlar T006-dakı SQL ilə hərfbəhərf eyni olmalıdır
- [X] T008 [P] `Authorization/RequirePermissionAttribute.cs` və `Authorization/AnyAuthenticatedUserAttribute.cs` yarat (Lane Z):
  - `RequirePermissionAttribute(params string[] anyOf) : AuthorizeAttribute`, `AttributeTargets.Class | AttributeTargets.Method`, `AllowMultiple = false`. Konstruktor `Policy = PermissionPolicyProvider.Prefix + string.Join('|', anyOf)` təyin edir və `AnyOf` property-sini saxlayır. Boş siyahıda `ArgumentException` atır.
  - `AnyAuthenticatedUserAttribute : AuthorizeAttribute`, policy-siz (yalnız authentication).
- [X] T009 `Authorization/PermissionPolicyProvider.cs` (`IAuthorizationPolicyProvider`) və `Authorization/PermissionHandler.cs` (`AuthorizationHandler<PermissionRequirement>`) yarat (Lane Z; depends on T008, T010).
  - **Provider**: `Prefix = "perm:"`. Policy adı bu prefikslə başlayırsa, `new AuthorizationPolicyBuilder(JwtBearerDefaults.AuthenticationScheme).RequireAuthenticatedUser().AddRequirements(new PermissionRequirement(codes)).Build()` qaytarır. Əks halda `DefaultAuthorizationPolicyProvider`-ə ötürür (default və fallback policy də ona ötürülür).
  - **Handler** (singleton, `PermissionMatrix` inject edir):
    - `ClaimTypes.Role`-u oxuyur.
    - `await matrix.ForRoleAsync(role)` çağırır.
    - `requirement.AnyOf`-dan biri dəstdədirsə, `context.Succeed`.
    - Əks halda heç nə etmir. Nəticə Forbidden olur, `AuditingAuthorizationResultHandler` (T014) onu tutur.
    - Uğursuz yoxlamanı `Debug` səviyyəsində rol və kodla loglayır.
- [X] T010 `Authorization/PermissionMatrix.cs` yarat (Lane Z, sabit interfeys):
  - Singleton-dur, `IServiceScopeFactory`, `IMemoryCache` və `ILogger<PermissionMatrix>` inject edir.
  - `ForRoleAsync`:
    - `role == AdminRole` → `Permissions.All` dəsti.
    - `null` və ya boş → boş dəst.
    - Digər hallarda cache açarı `rbac:matrix`-dir (TTL 5 dəqiqə). Dəyər `Dictionary<string, HashSet<string>>`-dir və yeni scope-da `CbarDbContext` ilə bir sorğudan yüklənir: `db.Roles.AsNoTracking().Select(r => new { r.Code, Codes = r.Permissions.Select(p => p.Code) })`.
    - Yalnız `Permissions.All`-da olan kodlar saxlanılır. Naməlum DB kodları atılır və `Warning` loglanır.
  - `RolesAsync()`: `id` üzrə sıralanmış rollar, admin üçün `All`.
  - `VerifyCatalogAsync(logger)`:
    - `permissions.code`-u oxuyur.
    - `Permissions.All`-da olub DB-də olmayanları `Error` səviyyəsində bir sətirlə loglayır (`"Permission catalog: {Missing} codes missing in database: {Codes}"`).
    - Hər halda `Information` səviyyəsində `"Permission catalog: {Total} codes, {Missing} missing"` yazır.
    - Exception atmır, startup-ı yıxmır.
- [X] T011 `Authorization/PermissionChecker.cs` yarat (Lane Z, scoped, sabit interfeys):
  - Inject edir: `IHttpContextAccessor`, `PermissionMatrix`, `IServiceScopeFactory`, `ProblemDetailsFactory`.
  - `DenyAsync`:
    1. `await using var scope = scopeFactory.CreateAsyncScope();` ilə yeni scope aç. Oradan `AuditService` və `CbarDbContext` al.
    2. `audit.Log("authz.denied", entityType, entityId, after: new { permission = code, method, path })` → həmin scope-un `db.SaveChangesAsync()`-i.
    3. `ProblemDetailsFactory.CreateProblemDetails(ctx, 403)` → `ObjectResult` (status 403, `application/problem+json`).
  - **Niyə ayrıca scope** (analyze U2): çağıranın DbContext-ində izlənən dəyişiklik varsa, onun `SaveChangesAsync`-i bu dəyişikliyi də yazardı. Bu, SC-002-ni ("rədddə verilənlər dəyişmir") pozardı. Ayrı scope yalnız audit sətrini yazır.
  - Audit yazısı exception atsa, `Error` loglanır və 403 yenə qaytarılır.
  - `message` əlavə etmir, ki `ProblemDetailsSetup` `title`-ı silsin.
- [X] T012 `product-rest/api-cbar-admin/src/Cbar.AdminApi/Program.cs`-i qoş (Lane Z; depends on T009–T011):
  - DI:
    - `builder.Services.AddMemoryCache();`
    - `AddSingleton<PermissionMatrix>()`
    - `AddSingleton<IAuthorizationPolicyProvider, PermissionPolicyProvider>()`
    - `AddSingleton<IAuthorizationHandler, PermissionHandler>()`
    - `AddScoped<PermissionChecker>()`
  - Startup: `MigrationRunner.Apply(...)`-dan **sonra** `await app.Services.GetRequiredService<PermissionMatrix>().VerifyCatalogAsync(app.Logger);` çağır.
  - Hər sətrin üstünə spec 008-ə istinad edən qısa şərh yaz (faylın mövcud şərh üslubu ilə).
- [X] T013 [P] `product-rest/api-cbar-admin/scripts/permission-inventory.mjs` yarat (Lane I, research R3):
  - Node 22+, ESM, asılılıqsız.
  - `.claude/skills/sync-openapi/scripts/routes.mjs`-dən `routesFromSource` və `ROOT` import edir (nisbi yol `../../../../.claude/skills/sync-openapi/scripts/routes.mjs`).
  - `src/Cbar.AdminApi/Controllers/*.cs`-i oxuyur. Hər `ops` girişi (`METHOD path` → sətir) üçün effektiv atributu tapır:
    - action sətrindən yuxarıya, əvvəlki action-a və ya `class` sətrinə qədər `[RequirePermission(`, `[AnyAuthenticatedUser]`, `[AllowAnonymous]`;
    - tapılmasa, ən yaxın yuxarıdakı `class`-ın atributları.
  - `AuthController`-in `login|refresh|logout` əməliyyatları istisnadır (`[Authorize]` daşımırlar).
  - Çıxış: `METHOD path → permission(s)` cədvəli, sonra `N unbound actions`. Bağlanmamış action varsa, exit 1.
  - `--json` flag-ı ilə maşın oxuya bilən çıxış verir (T029 bundan istifadə edir).
  - Faylın başına 3–4 sətirlik şərh: məqsəd SC-001-dir.

**Checkpoint**: OpenAPI bundle yaşıldır. `Authorization/` faylları və `0009` hazırdır.
`node product-rest/api-cbar-admin/scripts/permission-inventory.mjs` işləyir və bu mərhələdə
hamısını "unbound" göstərir.

---

## Phase 3: User Story 1 — hər əməliyyat rolun icazəsi ilə məhdudlaşır (Priority: P1) 🎯 MVP

**Goal**: Hər action icazəyə bağlanır. İcazəsiz cəhd 403 alır və audit-ə düşür. Bağlanmamış
action qeyri-admin üçün qadağandır.

**Independent Test**: [quickstart.md](./quickstart.md) §3. Hər rolun `GET /me/permissions`
cavabı matrislə eynidir (bu, US4-ün T028-ini tələb edir; o yoxdursa, 3.1–3.7 ssenariləri
kifayətdir). İcazəsiz sorğular verilənləri dəyişmir və `audit_log`-da `authz.denied` olur.

- [X] T014 [US1] `Authorization/AuditingAuthorizationResultHandler.cs` yarat və `Program.cs`-də qeyd et (Lane Z; FR-004, research R4):
  - `IAuthorizationMiddlewareResultHandler` implementasiyasıdır, daxildə `AuthorizationMiddlewareResultHandler` instansiyası saxlayır.
  - `authorizeResult.Forbidden` və istifadəçi authenticated olanda: `PermissionRequirement` tapılır (`policy.Requirements.OfType<PermissionRequirement>()`), resurs route-dan götürülür (`endpoint` route pattern-inin `api/v1/`-dən sonrakı ilk seqmenti, `-` → `_`), `id` route dəyərindən (`long.TryParse`, yoxdursa 0). Scope-dan `AuditService` və `CbarDbContext` alınır, `authz.denied` yazılır, `SaveChangesAsync` çağırılır.
  - Audit yazısı exception atsa, `Error` loglanır və 403 yenə verilir (audit xətası rəddi 500-ə çevirməməlidir).
  - Sonda default handler-ə ötürülür.
  - Qeydiyyat: `builder.Services.AddSingleton<IAuthorizationMiddlewareResultHandler, AuditingAuthorizationResultHandler>();`
- [X] T015 [US1] `Authorization/PermissionGuardFilter.cs` yarat və `AddControllers(o => o.Filters.Add<PermissionGuardFilter>())` ilə qoş (Lane Z; FR-001 default-deny, research R3):
  - `IAsyncAuthorizationFilter`-dir.
  - Endpoint metadata-sında `RequirePermissionAttribute`, `AnyAuthenticatedUserAttribute` və ya `IAllowAnonymous` yoxdursa və istifadəçinin rolu `admin` deyilsə, `PermissionChecker.DenyAsync("unbound", <resurs>, <id>)` nəticəsini `context.Result`-a yazır. `Warning` loglanır: `"Action {Action} has no permission binding"`.
  - `Program.cs`-də `AddControllers()` çağırışı mövcud `AddJsonOptions` zəncirini qorumalıdır.
- [X] T016 [P] [US1] Atribut yayılması — məzmun A (Lane C1). Fayllar `product-rest/api-cbar-admin/src/Cbar.AdminApi/Controllers/` altındadır: `PagesController.cs`, `PressReleasesController.cs`, `BannersController.cs`, `GalleriesController.cs`, `HomepageLinksController.cs`, `HomepagePublicationsController.cs`, `ImagePopupsController.cs`. Qaydalar:
  - Sinif səviyyəsindəki `[Authorize]`-u `[RequirePermission(Permissions.<Modul>.Read)]` ilə əvəz et.
  - Hər yazma action-a öz atributunu əlavə et: `[HttpPost]` → `Create`, `[HttpPut]` → `Update`, `[HttpDelete]` → `Delete`.
  - Alt resurslar (`assets/*`, `images/*`, `move`, `order`) `Update` icazəsinə bağlanır, `GET`-lər class-dan `Read` miras alır.
  - Action atributu class atributunu **əvəz etmir**, ASP.NET hər ikisini tələb edir. Ona görə yazma action-ları həm `Read`, həm öz kodunu tələb edir. Matrisdə `create/update/delete` olan rolda `read` də var, buna görə bu, qəbul olunandır. Data-model §3 ilə ziddiyyət yaranırsa, dayan və M-ə bildir.
  - `using Cbar.AdminApi.Authorization;` əlavə et, artıq lazım deyilsə `Microsoft.AspNetCore.Authorization` using-ini sil.
  - `PagesController.Delete` bu task-da yalnız `Permissions.Pages.Delete` alır (alt ağac T023-dədir).
- [X] T017 [P] [US1] Atribut yayılması — məzmun B (Lane C2, T016-nın qaydaları ilə): `InfoLinesController.cs`, `RunningLinesController.cs`, `NewsSliderController.cs`, `VideosController.cs`, `VideoStreamsController.cs`, `LawsController.cs`, `LawCategoriesController.cs`
- [X] T018 [P] [US1] Atribut yayılması — məzmun C (Lane C3, T016-nın qaydaları ilə):
  - `MoneyMarksController.cs`: faylda 3 sinif var, hamısı `Permissions.MoneyMarks.*` alır.
  - `OrganizationController.cs`: faylda 3 sinif var, hamısı `Permissions.Organization.*` alır.
- [X] T019 [P] [US1] Atribut yayılması — maliyyə (Lane C4, T016-nın qaydaları ilə): `AzirController.cs` (`Read/Create/Delete`), `InflationController.cs` (`PUT settings` → `Update`), `YieldCurvesController.cs`, `CurrenciesController.cs` (`PUT {code}` → `Update`), `CurrencyRatesController.cs` (class → `CurrencyRates.Read`; `PUT` və `DELETE` → `CurrencyRates.Prepare`; 1a-da semantika dəyişmir)
- [X] T020 [P] [US1] Atribut yayılması — MEAS və media (Lane C5, T016-nın qaydaları ilə):
  - `MeasDocumentsController.cs` və `MeasLookupsController.cs` (2 sinif) `Permissions.Meas.*` alır.
  - `MediaController.cs`: class → `Media.Read`, `POST` → `Media.Create`, `DELETE` → `[RequirePermission(Permissions.Media.Delete, Permissions.Media.DeleteOwn)]` (any-of). Sahiblik yoxlaması T025-dədir.
- [X] T021 [P] [US1] Atribut yayılması — sistem (Lane C6, T016-nın qaydaları ilə):
  - `SettingsController.cs`: class → `Settings.Read`, `PUT` → `Settings.Update`.
  - `UsersController.cs`: `[Authorize(Roles = "admin")]` → class `[RequirePermission(Permissions.Users.Read)]`, `POST` → `Create`, `PUT {id}` və `PUT {id}/password` → `Update`, `DELETE` → `Delete`.
  - Last-admin guard-a (spec 015) və stamp rotasiyasına (spec 020) toxunma.
- [X] T022 [US1] Lane M yoxlamaları (depends on T016–T021):
  - `node product-rest/api-cbar-admin/scripts/permission-inventory.mjs` → `0 unbound actions`, exit 0.
  - `node .claude/skills/sync-openapi/scripts/route-diff.mjs api-cbar-admin` → route fərqi yoxdur.
  - Inventardakı hər `METHOD path → kod` cütü T005-dəki `x-permission` ilə eyni olmalıdır. Fərq varsa, OpenAPI və ya atribut düzəldilir.
  - `git grep -n "\[Authorize\]" product-rest/api-cbar-admin/src` boş olmalıdır.

**Checkpoint**: US1 kodda tamamdır. Hər action bağlıdır, rədd audit olunur.

---

## Phase 4: User Story 3 — dağıdıcı və sistem əməliyyatları (Priority: P2)

**Goal**: Alt ağacın silinməsi, ayarlar və başqasının mediası ayrıca icazə tələb edir. Yeni
ayar açarı yalnız allowlist-dən yaradıla bilər.

**Independent Test**: [quickstart.md](./quickstart.md) §4 (4.1–4.7).

- [X] T023 [US3] `PagesController.cs` → `Delete` (Lane E; depends on T016; FR-019, research R8):
  - `PermissionChecker` inject et.
  - `RemovableAll` budağında, heç nə silinmədən **əvvəl**: `if (!await perms.HasAsync(Permissions.Pages.DeleteSubtree)) return await perms.DenyAsync(Permissions.Pages.DeleteSubtree, "pages", id);`
  - `ExecuteSqlAsync`-i `db.Database.SqlQuery<int>($"UPDATE pages SET deleted_at = {now} WHERE path <@ {path}::ltree AND deleted_at IS NULL RETURNING id AS \"Value\"").ToListAsync()` ilə əvəz et.
  - `audit.Log("pages.delete_subtree", "page", entity.Id, after: new { ids })`.
  - Mövcud ltree şərhini saxla.
- [X] T024 [P] [US3] `product-rest/api-cbar-admin/src/Cbar.AdminApi/Validation/KnownSettings.cs` yarat (Lane E): `public static class KnownSettings { public static readonly IReadOnlySet<string> Keys = new HashSet<string>(StringComparer.Ordinal) { "accessibility.widget" }; }`. Şərhdə açarı kimin oxuduğunu yaz (`api-cbar` `SiteSettingsController`, spec 007) və yeni açarın buraya əlavə olunmalı olduğunu qeyd et
- [X] T025 [US3] `MediaController.cs` → `Delete` (Lane E; depends on T020; edge case "Media"). `PermissionChecker` inject et. Asset yükləndikdən sonra, in-use yoxlamasından **əvvəl**: `if (!await perms.HasAsync(Permissions.Media.Delete) && asset.CreatedBy != <sub>) return await perms.DenyAsync(Permissions.Media.Delete, "media", id);`. `sub` `AuditService`-dəki üsulla oxunur
- [X] T026 [US3] `SettingsController.cs` (Lane E; depends on T005, T021, T024; FR-020):
  - `Upsert`-də `entity is null && !KnownSettings.Keys.Contains(key)` → `BadRequestProblem($"Unknown setting key '{key}'.")`. Bu yoxlama `Value` yoxlamasından sonra, DB yazısından əvvəl gəlir.
  - Yeni `[HttpDelete("{key}")] [RequirePermission(Permissions.Settings.Delete)]` action:
    - yoxdursa → `NotFoundProblem("Setting not found.")`;
    - varsa → `audit.Log("settings.delete", "setting", 0, before: new { key, value })` → `Remove` → `SaveChangesAsync` → `NoContent()`.
- [X] T027 [US3] T003-də yaradılmış `qa.probe` açarını (əgər qalıbsa) T026 deploy olunandan sonra `DELETE /settings/qa.probe` ilə silməyi quickstart §4.6-nın bir hissəsi kimi qeyd et (Lane M, `quickstart.md`)

**Checkpoint**: US1 + US3 kodda tamamdır.

---

## Phase 5: User Story 4 — kimin nə edə bildiyini görmək (Priority: P3)

**Goal**: `me/permissions`, `roles` və `audit-log` oxuma endpoint-ləri ([contracts/rbac.md](./contracts/rbac.md) §2–§4).

**Independent Test**: [quickstart.md](./quickstart.md) §3-ün ilk bloku (98/87/7) və 3.8.

- [X] T028 [P] [US4] `Controllers/MeController.cs` yarat (Lane E; depends on T005, T010):
  - Atributlar: `[ApiController] [AnyAuthenticatedUser] [Route("api/v1/me")]`, `: CbarControllerBase`.
  - `[HttpGet("permissions")]` → `Ok(new { role, permissions = (await matrix.ForRoleAsync(role)).Order(StringComparer.Ordinal) })`.
  - `role` `ClaimTypes.Role`-dan gəlir, yoxdursa `""` olur.
- [X] T029 [US4] Lane M: `MeController`-in `[AnyAuthenticatedUser]` istisnasını `permission-inventory.mjs` çıxışında yoxla (T013 bunu "bound" saymalıdır) və quickstart §3-dəki gözlənilən sayları T001-in nəticəsi ilə tutuşdur
- [X] T030 [P] [US4] `Controllers/RolesController.cs` və `Controllers/AuditLogController.cs` yarat (Lane E; depends on T005, T010).
  - **Roles**: `[RequirePermission(Permissions.Roles.Read)] [Route("api/v1/roles")]`, `GET` → `Ok(await matrix.RolesAsync())`.
  - **AuditLog**: `[RequirePermission(Permissions.Audit.Read)] [Route("api/v1/audit-log")]`. `GET`-in parametrləri: `[FromQuery] string? action, int? actorId, string? entityType, long? entityId, DateTimeOffset? from, DateTimeOffset? to, [FromQuery] PagingQuery paging`, default page size 50.
  - Sorğu: `db.AuditLog.AsNoTracking()`, `action` üçün `StartsWith`, digər filtrlər bərabərlik, `from <= CreatedAt < to`, sıralama `OrderByDescending(CreatedAt).ThenByDescending(Id)`.
  - Projeksiya: `actorUsername = a.Actor != null ? a.Actor.Username : null`. `before`/`after` `JsonSerializer.Deserialize<JsonElement?>` ilə obyekt kimi qaytarılır. `ip` `ToString()` ilə.
  - Cavab forması `{ items, total, page, pageSize }`-dir (`CurrencyRatesController.Dates` kimi).

**Checkpoint**: 1a kodda tamamdır (US1, US3, US4).

---

## Çatdırılma 1a — review, MR, test (Paket A)

- [X] T031 [P] Lane M: `node product-rest/api-cbar-admin/scripts/permission-inventory.mjs` və `route-diff.mjs`-i yenidən işlət. Hər ikisi yaşıl olmalıdır. OpenAPI-də `npm run lint && npm run bundle` yaşıl olmalıdır
- [X] T032 Lane R (yalnız oxuyur) 1a diff-ini yoxlayır:
  - (a) Hər yeni C# faylında `namespace`, `using`, `async`/`await`, sabit interfeysə uyğun adlar.
  - (b) `PermissionPolicyProvider`-in default/fallback policy-ni ötürməsi.
  - (c) `AuditingAuthorizationResultHandler`-in 401-i (Challenged) toxunmadan ötürməsi.
  - (d) `Permissions.All.Count == 98` və T006 SQL-i ilə hərfbəhərf eyniliyi.
  - (e) Heç bir `Cbar.Domain` dəyişikliyinin olmaması.
  - (f) `ProblemDetailsSetup`-ın 403-ün `title`-ını silməsi.

  Tapıntıları M-ə qaytar.
- [X] T033 Lane M: R-in tapıntılarını düzəlt və ya fayl sahibi lane-ə qaytar. Sonra `git diff --stat` və əsas hissələri istifadəçiyə göstər. **İstifadəçinin təsdiqi ilə** commit et (`feat(api-cbar-admin): RBAC permissions (spec 008 1a)`) və istifadəçiyə GitLab `api-cbar-admin` repo-sunun `test` branch-inə gedən MR-ı hazırla. Bu checkout-dan push deploy etmir
- [ ] T034 Pipeline-ın build-i yaşıl olandan sonra [quickstart.md](./quickstart.md) §2 (startup log, Grafana `App api-cbar-admin`), §3 və §4 ssenarilərini icra et. Nəticələri MR-a yaz. `RAISE WARNING … RBAC seed skipped` və ya `Permission catalog: … missing` `Error`-u görünərsə, deploy **uğursuz** sayılır (spec FR-002). Dayan və istifadəçiyə research R12 fallback-ını təklif et
- [ ] T035 Lane M: T034-dəki fərqlərə görə `spec.md` / `data-model.md` düzəlişləri (lazım olsa) edilir. 1a-nın `test`-də qəbulunu istifadəçi təsdiqləyir

---

## Phase 6: User Story 2 — məzənnə four-eyes (Priority: P1, 1b)

**Goal**: Məzənnə vərəqinin göndərilməsi, düzəlişi və silinməsi təsdiq tələbi yaradır.
Hazırlayan öz tələbini təsdiqləyə bilmir. Public tərəf yalnız təsdiqlənmiş dəyəri görür.

**Independent Test**: [quickstart.md](./quickstart.md) §5 (5.1–5.12) və §6 (feed baseline ilə bayt-bayt eyni).

**Asılılıq**: 1a `test`-də qəbul olunub (T035). T004 baseline-ı hazırdır.

- [ ] T036 [US2] OpenAPI 1b (Lane M, [contracts/currency-rate-requests.md](./contracts/currency-rate-requests.md)):
  1. `paths/statistics.yaml#/rateSheet`: `put` və `delete` 204 əvəzinə 202 + `CurrencyRateRequest` cavabı, `Location` header-i.
  2. Yeni açarlar `rateRequests` (list), `rateRequest` (get), `rateRequestApprove`, `rateRequestReturn`.
  3. Sxemlər `CurrencyRateRequest`, `CurrencyRateRequestDetail`, `CurrencyRateRequestPage`, `ReturnReason`.
  4. `openapi.yaml`-da 4 yeni path və `x-permission`.
  5. `info.x-known-issues`-da `currency-rates` qeydinə 202 semantikasını əlavə et.
  6. `npm run lint && npm run bundle`. Diff-i istifadəçiyə göstər və təsdiq al.
- [ ] T037 [P] [US2] `product-rest/api-cbar-admin/db/migrations/0010-currency-rate-requests.sql` yarat (Lane S, [data-model.md §4](./data-model.md)):
  - `CREATE TABLE IF NOT EXISTS currency_rate_requests (...)`. FK-lar burada **yoxdur**, CHECK-lər hamısı var, `prepared_by integer NOT NULL`, `decided_by integer`.
  - `CREATE UNIQUE INDEX IF NOT EXISTS currency_rate_requests_one_pending ON currency_rate_requests (rate_date) WHERE status = 'pending';`
  - `CREATE INDEX IF NOT EXISTS currency_rate_requests_status_idx ON currency_rate_requests (status, prepared_at);`
  - Şərti `DO $$` blokunda, `0007`/`0008`-dəki nümunə ilə, `users(id)`-ə və öz-özünə (`superseded_by`) FK əlavə olunur. Hüquq yoxdursa, ötürülür.
  - `cbar_web_ro`-ya **GRANT yoxdur**. Bunu şərhdə səbəbi ilə yaz (research R12).
  - Faylın başında şərh: spec 008 1b, niyə `currency_rates`-ə toxunulmur (R9).
- [ ] T038 [P] [US2] `CurrencyRateRequest` entity-si və DbSet (Lane S; V.1):
  - `product-rest/api-cbar-admin/src/Cbar.Domain/Entities/Currency.cs`-ə `public class CurrencyRateRequest` əlavə et. Property-lər: `long Id`, `DateOnly RateDate`, `string Kind`, `string Status`, `string? Payload`, `string? Before`, `int PreparedBy`, `DateTimeOffset PreparedAt`, `int? DecidedBy`, `DateTimeOffset? DecidedAt`, `string? ReturnReason`, `long? SupersededBy`. jsonb sahələri `AuditLogEntry` kimi `string?`-dir.
  - `CbarDbContext.cs`-ə `public DbSet<CurrencyRateRequest> CurrencyRateRequests => Set<CurrencyRateRequest>();` və `b.Entity<CurrencyRateRequest>(e => { e.ToTable("currency_rate_requests"); e.Property(x => x.Payload).HasColumnType("jsonb"); e.Property(x => x.Before).HasColumnType("jsonb"); });` əlavə et. Mövcud `AuditLogEntry` mapping-inin üslubuna bax.
  - Eyni dəyişikliyi `product-rest/api-cbar/src/Cbar.Domain/`-a da et.
  - `diff -r product-rest/api-cbar/src/Cbar.Domain product-rest/api-cbar-admin/src/Cbar.Domain` boş olmalıdır.
- [ ] T039 [US2] `product-rest/api-cbar-admin/src/Cbar.AdminApi/Services/CurrencyRateApproval.cs` yarat (Lane F; depends on T038; data-model §4, research R9). Scoped servisdir, `CbarDbContext` və `AuditService` inject edir. Metodlar:
  - **`Task<CurrencyRateRequest> SubmitAsync(DateOnly date, IReadOnlyList<CurrencyRateItemDto>? rates, int userId)`**. `rates == null` silmə tələbidir. Bir tranzaksiyada:
    0. `kind` müəyyən olunur: `rates == null` → `"delete"`; həmin gün üçün `currency_rates`-də sətir varsa → `"correction"`; yoxdursa → `"new"` (FR-016).
    1. Həmin gün üçün `pending` sətir varsa, onu əvəz et. Partial unique index-ə görə sıra **dəqiq** belədir: köhnəni `status = "superseded"` et → `SaveChanges` → yenisini əlavə et → `SaveChanges` → köhnənin `SupersededBy = yeni.Id` → `audit.Log("currency_rates.supersede", "currency_rate_request", old.Id, after: new { supersededBy = yeni.Id })`.
    1a. Paralel göndərişdə unique index pozulursa, exception-u tutma. Tranzaksiya rollback olur, `DbExceptionHandler` 409 qaytarır (contracts §1).
    2. `before`-a `currency_rates`-dəki cari dəyərləri yaz.
    3. Yeni sətir: `status = "pending"`.
    4. `audit.Log("currency_rates.submit", …)`.
  - **`Task<ApprovalResult> ApproveAsync(long id, int userId)`**:
    1. Sətir yüklənir. Yoxdursa → `NotFound`. `PreparedBy == userId` → `Preparer` (və `audit.Log("currency_rates.approve_denied", …)` + save).
    2. Tranzaksiya: `ExecuteSqlInterpolatedAsync($"UPDATE currency_rate_requests SET status='approved', decided_by={userId}, decided_at=now() WHERE id={id} AND status='pending'")`. 0 sətir dəyişsə → `NotPending`.
    3. Valyuta kodlarının mövcudluğu yenidən yoxlanılır (`is_active` yox). Naməlum kod varsa → rollback + `UnknownCodes`.
    4. `before`-a qərar anındakı dəyərlər yazılır.
    5. Payload tətbiq olunur. `new`/`correction` üçün `CurrencyRatesController.Upsert`-in bugünkü merge məntiqi buraya köçürülür: mövcud kodu yenilə, yenisini `CreatedBy = PreparedBy` ilə əlavə et. `delete` üçün günün bütün sətirləri silinir.
    6. `audit.Log("currency_rates.approve", "currency_rate_request", id, before, after: new { date, kind, rates, preparedBy, preparedAt })`.
    7. Commit.
  - **`Task<ApprovalResult> ReturnAsync(long id, int userId, string reason)`**: eyni şərtli UPDATE (`status='returned'`, `return_reason`), self → `Preparer`, `audit.Log("currency_rates.return", …)`.
  - `ApprovalResult` enum-dur: `Ok`, `NotFound`, `Preparer`, `NotPending`, `UnknownCodes`. Lazım olan məlumat (kodlar, sətir) ilə record kimi qaytarılır.
- [ ] T040 [US2] `CurrencyRatesController.cs` → `Upsert` və `Delete` (Lane F; depends on T036, T039; contracts §1–§2):
  - Mövcud doğrulamalar (boş siyahı, təkrar kod, naməlum kod) saxlanılır.
  - `Delete`-də təsdiqlənmiş vərəq yoxdursa, 404 qalır.
  - DB-yə birbaşa yazı **silinir**, əvəzində `approval.SubmitAsync(...)` çağırılır.
  - Cavab: `Accepted($"/api/v1/currency-rate-requests/{r.Id}", ToDto(r))` (202 + `Location`). `ToDto` contracts §1 formasındadır: `preparedBy` `{ id, username }`, `supersedes` köhnə id.
  - Köhnə `currency_rates.upsert`/`currency_rates.delete` audit çağırışları silinir (artıq `submit`/`approve` yazılır, data-model §5).
- [ ] T041 [US2] `Controllers/CurrencyRateRequestsController.cs` yarat (Lane F; depends on T036, T039; contracts §4–§7):
  - Sinif atributları: `[ApiController] [RequirePermission(Permissions.CurrencyRates.Read)] [Route("api/v1/currency-rate-requests")]`.
  - `GET` (siyahı, `status` default `pending`, sıralama contracts §4).
  - `GET {id:long}` (detail, `published` = cari və ya `before`).
  - `[HttpPost("{id:long}/approve")] [RequirePermission(Permissions.CurrencyRates.Approve)]`.
  - `[HttpPost("{id:long}/return")] [RequirePermission(Permissions.CurrencyRates.Approve)]`. Gövdə `record ReturnRequestDto(string? Reason)`. Boş/boşluq və ya 1000-dən uzun səbəb → `FieldValidationProblem(new Dictionary<string,string[]> { ["reason"] = [...] })`.
  - Nəticələrin xəritəsi:
    - `Preparer` → `ErrorProblem(403, "The preparer of a rate request cannot approve it.")` (return üçün `"…cannot return it."`).
    - `NotPending` → `ConflictProblem("This request is no longer pending.")`.
    - `UnknownCodes` → `ConflictProblem($"Unknown currency codes: …")`.
    - `NotFound` → `NotFound()`.
    - `Ok` → `Ok(detail)`.
- [ ] T042 [US2] `Program.cs`-ə `builder.Services.AddScoped<CurrencyRateApproval>();` əlavə et. Mövcud `AddScoped` sətirlərinin yanına, spec 008 şərhi ilə (Lane Z)
- [ ] T043 [US2] Lane R (yalnız oxuyur) 1b diff-ini yoxlayır:
  - (a) `SubmitAsync`-də partial unique index ilə əməliyyat sırası (köhnə `superseded` → yeni `insert`).
  - (b) `ApproveAsync`-də şərtli UPDATE-in tranzaksiya daxilində olması və 0 sətirdə rollback.
  - (c) Self-approval-un admin üçün də işləməsi (rol yoxlanmır).
  - (d) `currency_rates`-ə yazının yalnız `ApproveAsync`-də olması (`git grep -n "CurrencyRates\.\(Add\|Remove\)" product-rest/api-cbar-admin/src`).
  - (e) `diff -r` hər iki `Cbar.Domain` üçün boşdur.
  - (f) `permission-inventory.mjs` → 0 unbound, `route-diff.mjs` yaşıl.
  - (g) `0010`-da `cbar_web_ro` grant-ı yoxdur.

**Checkpoint**: 1b kodda tamamdır.

---

## Çatdırılma 1b — iki MR, test (Paket B → C)

- [ ] T044 Lane M: R-in tapıntılarını düzəlt. **İstifadəçinin təsdiqi ilə** iki commit et:
  - (B) `api-cbar-admin`: OpenAPI, `0010`, `Cbar.Domain`, servis, controller-lər, `Program.cs`;
  - (C) `api-cbar`: yalnız `src/Cbar.Domain`.

  MR-ları B → C sırası ilə hazırla. MR təsvirinə yaz ki, **prod-a çıxış panelin təsdiq ekranı ilə eyni vaxtda** planlaşdırılmalıdır (research R11). Məzənnə hazırlayanlara "göndərilən vərəq artıq təsdiq gözləyir" xəbərdarlığı lazımdır (spec Assumptions).
- [ ] T045 B `test`-də deploy olunandan sonra [quickstart.md](./quickstart.md) §5-i (gələcək tarix `D` ilə) və §6-nı (T004 baseline ilə `cmp`) icra et. C deploy olunandan sonra `api-cbar` `/healthz` yaşıl olmalı və §6 yenə heç bir `DIFF` göstərməməlidir. Nəticələri MR-a yaz
- [ ] T046 Lane M: `D` tarixi üçün qalan tələbləri `return` ilə bağla, `qa_*` hesablarını deaktiv et ([quickstart.md](./quickstart.md) §7). Hesabların deaktivasiyası istifadəçi təsdiqi tələb edir

---

## Phase 7: Polish & Cross-Cutting Concerns (Lane M)

- [ ] T047 [P] `product-rest/api-cbar-admin/openapi/README.md`-ə `x-permission` konvensiyasını (hər əməliyyatda bir kod; any-of halında massiv) və `403`-ün məcburiliyini əlavə et. `/sync-openapi api-cbar-admin` işlət: drift olmamalıdır
- [ ] T048 [P] Root `CLAUDE.md`-də "api-cbar-admin (CMS API)" bölməsinə 3–4 cümlə əlavə et:
  - hər action `[RequirePermission]` daşıyır, kodlar `Authorization/Permissions.cs`-dədir;
  - matris `role_permissions`-dadır, admin isə kodda;
  - yeni icazə migration + `Permissions.cs` + `x-permission` ilə əlavə olunur, admin addımı yoxdur;
  - `scripts/permission-inventory.mjs` merge-dən əvvəl yaşıl olmalıdır;
  - məzənnə yazısı yalnız `CurrencyRateApproval.ApproveAsync`-dədir.
- [ ] T049 [P] `/sync-business-logic` işlət (`api-cbar-admin` modulu). `business_logic/new_business_logic.md` RBAC və four-eyes-i, `diff_report_logic.md` isə legacy rollarının paritetini əks etdirməlidir
- [ ] T050 Panel üçün ötürmə qeydi: istifadəçiyə `web-cbar-admin-new` üçün ayrıca `/speckit-specify` təklif et. Əhatə:
  - təsdiq növbəsi ekranı (`GET /currency-rate-requests`, approve/return);
  - `PUT /currency-rates`-in 202 cavabının "təsdiq gözləyir" kimi göstərilməsi;
  - `GET /me/permissions` ilə düymələrin gizlədilməsi;
  - 403 mətni.

  Spec-i burada yaratma.
- [ ] T051 `specs/008-admin-rbac-four-eyes/checklists/requirements.md`-ə icra qeydi əlavə et: hansı quickstart bəndləri keçdi, R12 riski reallaşdımı, faktiki SP

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (T001–T004)**:
  - T001 T006/T007-ni bloklayır.
  - T002 T034-dən əvvəl bitməlidir.
  - T004 T044-dən əvvəl bitməlidir.
- **Foundational (T005–T013)**: T001-dən asılıdır, bütün story-ləri bloklayır.
- **US1 (T014–T022)**: Foundational-dan sonra.
- **US3 (T023–T027)**: T016/T020/T021-dən sonra, çünki eyni controller faylları redaktə olunur.
- **US4 (T028–T030)**: T005 və T010-dan sonra. US1/US3 ilə paralel gedə bilər, fayllar ayrıdır.
- **Çatdırılma 1a (T031–T035)**: US1, US3 və US4-dən sonra.
- **US2 (T036–T043)**: Çatdırılma 1a qəbul olunandan sonra (T035).
- **Çatdırılma 1b (T044–T046)**: US2-dən sonra. B, sonra C.
- **Polish (T047–T051)**: Müvafiq çatdırılmadan sonra. T047–T049 1a-dan sonra başlaya bilər və 1b-dən sonra yenilənir.

### User Story Dependencies

- **US1 (P1)**: Yalnız Foundational-dan asılıdır. **MVP budur**.
- **US3 (P2)**: US1-in atribut task-larından asılıdır (eyni fayllar), funksional olaraq müstəqildir.
- **US4 (P3)**: Foundational-dan asılıdır. US1 olmadan da işləyir, amma faydalı olması üçün US1 lazımdır.
- **US2 (P1)**: `currency_rates.prepare/approve` icazələrinə görə **1a-nın çatdırılmasından** asılıdır.

### Within Each Story

- OpenAPI (M) → controller (spec-first hook).
- Migration və `Cbar.Domain` (S) → servis (F) → controller (F).
- Hər story review (R) ilə bağlanır, sonra çatdırılır.

---

## Parallel Example: Wave 1–2 (1a)

```text
# Wave 1 — üç agent paralel:
Lane S: T006  0009-rbac-permissions.sql
Lane Z: T007 → T008 → T010 → T009 → T011 → T012   (Authorization/*, Program.cs)
Lane I: T013  scripts/permission-inventory.mjs

# Wave 2 — yeddi agent paralel (fayl dəstləri kəsişmir):
Lane Z:  T014, T015                      (Authorization/*, Program.cs)
Lane C1: T016  Pages, PressReleases, Banners, Galleries, HomepageLinks, HomepagePublications, ImagePopups
Lane C2: T017  InfoLines, RunningLines, NewsSlider, Videos, VideoStreams, Laws, LawCategories
Lane C3: T018  MoneyMarks (3 sinif), Organization (3 sinif)
Lane C4: T019  Azir, Inflation, YieldCurves, Currencies, CurrencyRates
Lane C5: T020  MeasDocuments, MeasLookups, Media
Lane C6: T021  Settings, Users
```

## Parallel Example: 1b

```text
Lane S: T037 (0010) ‖ T038 (Cbar.Domain ×2)
Lane F: T039 → T040 → T041          (T038-dən sonra)
Lane Z: T042                         (Program.cs)
```

---

## Implementation Strategy

### MVP (yalnız US1)

1. Phase 1 (T001 razılaşması kritikdir) → Phase 2 → Phase 3.
2. Bu mərhələdə review-un kritik iradı bağlanır: MEAS manager və moderator məzənnəni,
   ayarları və istifadəçiləri dəyişə bilmir, hər rədd audit olunur.
3. İstəyə görə, US1 təkbaşına `test`-ə çıxa bilər (T031–T034 yalnız §3 ilə).

### Incremental Delivery

1. **1a** = US1 + US3 + US4 → bir MR (Paket A) → `test` → qəbul (T035).
2. **1b** = US2 → iki MR (Paket B → C) → `test` → prod panel ekranı ilə birlikdə.
3. Hər çatdırılma öz quickstart bölmələri ilə yoxlanılır: 1a üçün §2–§4, 1b üçün §5–§7.

### Notes

- Task-lar Azərbaycan dilindədir. Kod, commit mesajları və OpenAPI ingiliscədir.
- Commit yalnız istifadəçinin təsdiqi ilə edilir. `--no-verify` istifadə olunmur.
- Spec-də olmayan davranış görünərsə, kodu dəyişməzdən əvvəl M-ə qaytar.
