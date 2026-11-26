---

description: "Task list for 020-access-token-revocation"
---

# Tasks: Admin API — giriş tokeninin dərhal ləğvi (access token revocation)

**Input**: Design documents from `specs/020-access-token-revocation/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/access-token.md](./contracts/access-token.md), [quickstart.md](./quickstart.md)

**Tests**: API-də avtomatik test yoxdur və spec bunu tələb etmir (Konstitusiya VIII.1). Verification
GitLab pipeline-ın build-i və `test` mühitində [quickstart.md](./quickstart.md) ssenariləri ilə aparılır.
Lokalda .NET SDK yoxdur, ona görə C# kodu build olunmadan yazılır. Tipləri, `using`-ləri,
`async`/`await`-i və ad uyğunluğunu diqqətlə yoxla (T013 bunun üçündür).

**Organization**: Üç user story var: US1, US2 (P1) və US3 (P2). İki upstream iş paketi var:
**(A)** `product-rest/api-cbar-admin/` və **(B)** `product-rest/api-cbar/` (yalnız `Cbar.Domain`).
Deploy sırası A → B-dir. Yollar repo kökünə nisbidir. Panel (`web-cbar-admin-new`) dəyişmir.

**Deploy qeydi**: Spec 012-nin kodu commit olunub, amma GitLab `test`-ə hələ çatmayıb
(`api-admin-review.md` #2). A paketi `test`-ə gedəndə 012 da onunla birlikdə gedir. Ona görə
012-nin baseline-ı da (onun T002-si) deploy-dan əvvəl alınmalıdır (T002).

---

## Bir neçə agentlə icra

İş dörd **lane**-ə bölünüb. Lane-lərin fayl dəstləri **kəsişmir**, ona görə agentlər eyni işçi
ağacda, worktree-siz, paralel işləyə bilər. Lane-lər bir-birinin kodunu gözləmir. Onları
birləşdirən şey aşağıdakı **sabit interfeysdir**. Hər agent ona görə yazır, öz faylından
kənara çıxmır və commit etmir.

| Lane | Agent | Fayllar (yalnız bunlar) | Task-lar |
|---|---|---|---|
| **M** | əsas söhbət (orkestrator) | `openapi/**`, `specs/020-*/**`, sənədlər | T001–T003, T014–T024 |
| **A** | schema agent | `db/migrations/0007-admin-user-security-stamps.sql`; hər iki `src/Cbar.Domain/Entities/Auth.cs` və `src/Cbar.Domain/CbarDbContext.cs` | T004–T006 |
| **B** | auth agent | `src/Cbar.AdminApi/Services/SecurityStampService.cs` (yeni), `src/Cbar.AdminApi/Program.cs`, `src/Cbar.AdminApi/Controllers/AuthController.cs` | T007–T009 |
| **C** | users agent | `src/Cbar.AdminApi/Controllers/UsersController.cs` | T010–T012 |
| **R** | review agent (yalnız oxuyur) | heç birini dəyişmir, tapıntıları M-ə qaytarır | T013 |

**Dalğalar**: Wave 0 M-dir (T001–T003, təsdiq). Wave 1-də A, B və C **paralel** işləyir. Wave 2
R-dir. Wave 3 yenə M-dir: düzəlişlər, istifadəçiyə diff, delivery, verification.
R-in tapdığı düzəlişləri M edir və ya fayl sahibi olan lane agentinə qaytarır. İki agent eyni
faylı heç vaxt redaktə etmir.

### Sabit interfeys (bütün lane-lər üçün kontrakt)

```csharp
// Cbar.Domain (Lane A) — namespace Cbar.Domain.Entities
public class UserSecurityStamp { int UserId; Guid Stamp; DateTimeOffset ChangedAt; }   // auto-properties
// CbarDbContext: public DbSet<UserSecurityStamp> UserSecurityStamps => Set<UserSecurityStamp>();

// Cbar.AdminApi.Services (Lane B) — scoped, ctor (CbarDbContext db, ILogger<SecurityStampService> logger)
public class SecurityStampService
{
    public const string ClaimType = "sst";
    public Task<Guid> GetOrCreateAsync(int userId);                 // login/refresh
    public Task RotateAsync(int userId);                            // caller-in tranzaksiyasında
    public Task<string?> ValidateAsync(ClaimsPrincipal principal);  // null = qəbul, əks halda səbəb
}
```

Rədd səbəbləri bunlardır: `stamp_missing`, `user_missing`, `user_deleted`, `user_inactive`,
`stamp_mismatch` ([data-model.md §4](./data-model.md)).

---

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Paralel icra oluna bilər (fərqli fayl, tamamlanmamış task-dan asılılıq yoxdur)
- **[Story]**: Aid olduğu user story (US1, US2, US3)

---

## Phase 1: Setup — test hesabı və baseline (deploy-dan ƏVVƏL, Lane M)

**Purpose**: Bugünkü "deaktiv hesabın tokeni işləyir" vəziyyətini və sorğu müddətini sübut
etmək (layihə qaydası: əvvəl ölç, sonra iddia et). Bu checkout-un `origin`-i GitHub-dır və
oradan push deploy etmir. Deploy yalnız GitLab-dakı repo-ların `test` branch-indən gedir.

- [ ] T001 `test` mühitində (`https://api-cbar-admin-test.cbar.az/api/v1`) admin paneldən **admin rolunda** test hesabı yarat: `rv-test-20261008`, parolu bilinən. Hesab id-sini və adını (parolsuz) MR qaralamasına yaz ([quickstart.md](./quickstart.md) "Ön şərtlər"). Hesab yaratmaq istifadəçi təsdiqi tələb edir. Real redaktor hesabı istifadə etmə
- [ ] T002 Deploy-dan **əvvəl**, Git Bash-də iki baseline al: (a) [quickstart.md](./quickstart.md) §1. Deaktiv hesabın tokeni `200` qaytarmalıdır. Sonra hesabı yenidən aktivləşdir. (b) §6, `GET /settings` × 30 sorğunun medianı. Hər ikisini MR qaralamasına "Baseline" kimi yaz. A paketi 012-ni də daşıdığı üçün `specs/012-login-brute-force-protection/tasks.md` T002-ni də indi icra et (depends on T001). Bu task T015-dən əvvəl bitməlidir

---

## Phase 2: Foundational — kontrakt, sxem, versiya servisi, token yoxlaması

**Purpose**: Hər üç story-nin dayandığı hissələr bunlardır: spec-first təsvir, cədvəl, hər iki
`Cbar.Domain` kopyası, `SecurityStampService`, `sst` claim-i və `OnTokenValidated`. Bu faza
bitəndən sonra deaktiv və silinmiş istifadəçinin tokeni artıq rədd olunur (`IsActive` və
`DeletedAt` birbaşa yoxlanılır).

**⚠️ CRITICAL**: T003 təsdiqlənmədən Wave 1 başlamır.

- [X] T003 **Spec-first (M, Wave 0)**: `product-rest/api-cbar-admin/openapi/components/responses.yaml` → `Unauthorized.description`-ı [contracts/access-token.md §4](./contracts/access-token.md)-dakı diff-ə görə dəyiş. Başqa heç nə dəyişmir. Sonra `product-rest/api-cbar-admin/openapi/`-də lint + bundle et (`openapi/README.md`-dəki əmrlər), `openapi/dist/openapi.json` təzə olsun. Diff-i istifadəçiyə göstər və **təsdiq al** (`.claude/skills/api-endpoint/` qaydası). Route dəyişmədiyi üçün `spec-first.mjs` hook-u bloklamamalıdır
- [X] T004 [P] **Lane A** Yeni `product-rest/api-cbar-admin/db/migrations/0007-admin-user-security-stamps.sql`. Fayl `0004-admin-refresh-tokens.sql` üslubundadır. Üstə şərh yaz: spec 020; versiya istifadəçi başına bir sətirdir və token-in `sst` claim-i ilə müqayisə olunur; `users` cədvəli ALTER edilmir, çünki paylaşılan mühitlərdə ona başqa rol sahibdir; sətirlər tənbəl yaradılır, backfill yoxdur. Sonra `CREATE TABLE IF NOT EXISTS admin_user_security_stamps (user_id integer PRIMARY KEY, stamp uuid NOT NULL, changed_at timestamptz NOT NULL DEFAULT now());` yaz. Sonra `0004`-dəki kimi `DO $$ … IF has_table_privilege('users','REFERENCES') AND NOT EXISTS (… conname = 'fk_admin_user_security_stamps_user_id') THEN ALTER TABLE admin_user_security_stamps ADD CONSTRAINT fk_admin_user_security_stamps_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE; …` blokunu əlavə et. Yazmayacaqların: `BEGIN`/`COMMIT`, grant, `gen_random_uuid()`, əlavə indeks. Adın `product-rest/api-cbar/db/migrations/`-də olmadığını yoxla (orada yalnız `README.md` var)
- [X] T005 [P] **Lane A** `product-rest/api-cbar-admin/src/Cbar.Domain/Entities/Auth.cs`-də `RefreshToken` sinfindən sonra `public class UserSecurityStamp` yaz: `int UserId`, `Guid Stamp`, `DateTimeOffset ChangedAt` auto-property-ləri, naviqasiya yoxdur. `product-rest/api-cbar-admin/src/Cbar.Domain/CbarDbContext.cs`-də `DbSet<RefreshToken> RefreshTokens` sətrindən sonra `public DbSet<UserSecurityStamp> UserSecurityStamps => Set<UserSecurityStamp>();` əlavə et. `b.Entity<RefreshToken>(…)` blokundan sonra `b.Entity<UserSecurityStamp>(e => { e.ToTable("admin_user_security_stamps"); e.HasKey(x => x.UserId); e.Property(x => x.UserId).ValueGeneratedNever(); });` yaz və onun üstünə bir sətirlik şərh qoy (`// Not a users column: see db/migrations/0007-admin-user-security-stamps.sql.`). Query filter əlavə etmə
- [X] T006 **Lane A** T005-in iki dəyişikliyini `product-rest/api-cbar/src/Cbar.Domain/Entities/Auth.cs` və `product-rest/api-cbar/src/Cbar.Domain/CbarDbContext.cs`-ə eyni yerə köçür. Sonra `diff -r product-rest/api-cbar/src/Cbar.Domain product-rest/api-cbar-admin/src/Cbar.Domain` boş çıxmalıdır, `obj/` və `bin/` nəzərə alınmır (Konstitusiya V.1). Bu, B paketinin yeganə dəyişikliyidir (depends on T005)
- [X] T007 [P] **Lane B** Yeni `product-rest/api-cbar-admin/src/Cbar.AdminApi/Services/SecurityStampService.cs`. Namespace `Cbar.AdminApi.Services`-dir, `RefreshTokenService.cs` üslubunda primary constructor `(CbarDbContext db, ILogger<SecurityStampService> logger)` ilə yazılır. Sinfə `<summary>` yaz: spec 020; token `sst` claim-i daşıyır; hər qorunan sorğu onu bazadakı ilə müqayisə edir; deaktivasiya, silmə, parol reset və rol dəyişikliyi versiyanı dəyişir; keş yoxdur (research R6). Sinfin üzvləri "Sabit interfeys" bölməsindəki kimidir:
  - (a) `public const string ClaimType = "sst";`
  - (b) `GetOrCreateAsync`: `await db.Database.ExecuteSqlInterpolatedAsync($"INSERT INTO admin_user_security_stamps (user_id, stamp, changed_at) VALUES ({userId}, {Guid.NewGuid()}, now()) ON CONFLICT (user_id) DO NOTHING");`, sonra `db.UserSecurityStamps.AsNoTracking().Where(s => s.UserId == userId).Select(s => s.Stamp).SingleAsync()`.
  - (c) `RotateAsync`: bir ifadədir, `… VALUES ({userId}, {Guid.NewGuid()}, now()) ON CONFLICT (user_id) DO UPDATE SET stamp = excluded.stamp, changed_at = excluded.changed_at`. XML şərhinə yaz ki çağıran onu istifadəçi dəyişikliyi ilə eyni tranzaksiyada çağırmalıdır (`ExecuteSql` EF-in cari tranzaksiyasına qoşulur).
  - (d) `ValidateAsync(ClaimsPrincipal principal)` addımları:
    - `sub`-ı `principal.FindFirstValue(ClaimTypes.NameIdentifier) ?? principal.FindFirstValue("sub")` kimi oxu (`AuditService` nümunəsi). `int.TryParse` alınmazsa `user_missing` qaytar.
    - `principal.FindFirstValue(ClaimType)`-i `Guid.TryParse` ilə oxu. Alınmazsa `stamp_missing` qaytar.
    - Bir sorğu yaz: `db.Users.IgnoreQueryFilters().AsNoTracking().Where(u => u.Id == id).Select(u => new { u.IsActive, u.DeletedAt, Stamp = db.UserSecurityStamps.Where(s => s.UserId == u.Id).Select(s => (Guid?)s.Stamp).FirstOrDefault() }).SingleOrDefaultAsync()`.
    - Sıra belədir: `null` → `user_missing`, `DeletedAt != null` → `user_deleted`, `!IsActive` → `user_inactive`, `Stamp != claim` → `stamp_mismatch`, əks halda `null`. `LockedUntil` yoxlanmır (data-model §4).
    - Rəddi `"Access token rejected for user {UserId}: {Reason}"` ilə logla. `stamp_missing` və `stamp_mismatch` üçün səviyyə `LogInformation`, qalanları üçün `LogWarning`-dir (research R8). Token, claim dəyəri və versiya loga yazılmır
- [X] T008 **Lane B** `product-rest/api-cbar-admin/src/Cbar.AdminApi/Program.cs`. `builder.Services.AddScoped<RefreshTokenService>();` sətrindən sonra `builder.Services.AddScoped<SecurityStampService>();` əlavə et. `AddJwtBearer(opt => { … })`-un içində, `TokenValidationParameters`-dən sonra `opt.Events = new JwtBearerEvents { OnTokenValidated = async ctx => { var stamps = ctx.HttpContext.RequestServices.GetRequiredService<SecurityStampService>(); if (await stamps.ValidateAsync(ctx.Principal!) is { } reason) ctx.Fail(reason); } };` yaz. Üstünə 2 sətirlik şərh qoy: spec 020; `Fail` standart 401 challenge-ı verir, panel yenilənib təkrarlayır; keş yoxdur. Ayrıca middleware və ya authorization policy **əlavə etmə** (research R4) (depends on T007)
- [X] T009 **Lane B** `product-rest/api-cbar-admin/src/Cbar.AdminApi/Controllers/AuthController.cs`:
  - (a) Primary constructor-a `SecurityStampService stamps` əlavə et (`refreshTokens`-dən sonra).
  - (b) `CreateAccessToken(User user)`-i `CreateAccessToken(User user, Guid stamp)` et. Claim siyahısına `new Claim(SecurityStampService.ClaimType, stamp.ToString())` əlavə et.
  - (c) `Login`-də `await db.SaveChangesAsync();`-dan sonra, `WriteCookie`-dən əvvəl `var stamp = await stamps.GetOrCreateAsync(user.Id);` yaz. Return `CreateAccessToken(user, stamp)` olur.
  - (d) `Refresh`-in `RotateResult.Success ok` qolunda `return CreateAccessToken(ok.User, await stamps.GetOrCreateAsync(ok.User.Id));` yaz. Mövcud şərh saxlanılır.
  - Endpoint atributlarına və cavab tiplərinə toxunma (depends on T007)

**Checkpoint**: Kontrakt təsdiqlənib. Cədvəl və entity hər iki kopyadadır. Token `sst` daşıyır.
Hər qorunan sorğu yoxlanılır.

---

## Phase 3: User Story 1 - Deaktiv edilmiş və ya silinmiş istifadəçi dərhal kəsilir (Priority: P1) 🎯 MVP

**Goal**: Deaktivasiya və ya silmədən sonra köhnə token növbəti sorğuda 401 alır.
Reaktivləşdirmədən sonra köhnə token **yenə** rədd olunur (AS4). Bunun üçün versiya
deaktivasiya anında dəyişməlidir.

**Independent Test**: [quickstart.md](./quickstart.md) §3.

- [X] T010 [P] [US1] **Lane C** `product-rest/api-cbar-admin/src/Cbar.AdminApi/Controllers/UsersController.cs`. Primary constructor-a `SecurityStampService stamps` əlavə et.
  - `Update` metodunda son-admin yoxlaması, `before` və sahələrin təyini olduğu kimi qalır. `audit.Log(…); await db.SaveChangesAsync();` cütünü `await using var tx = await db.Database.BeginTransactionAsync();` … `await tx.CommitAsync();` ilə əhatə et. `SaveChangesAsync`-dən sonra, commit-dən əvvəl `if (before.IsActive && !dto.IsActive) await stamps.RotateAsync(entity.Id);` yaz. Mövcud `RevokeAllForUserAsync` bloku commit-dən **sonra**, yerində qalır.
  - `Delete` metodunda `audit.Log(…); await db.SaveChangesAsync();`-ı eyni şəkildə tranzaksiyaya al. Commit-dən əvvəl `await stamps.RotateAsync(entity.Id);` yaz. `RevokeAllForUserAsync` commit-dən sonra qalır.
  - Reaktivləşdirmə (false→true) versiyanı dəyişmir (research R5). Lane B-nin faylını gözləmə, "Sabit interfeys"ə görə yaz

---

## Phase 4: User Story 2 - Parol reset köhnə tokenləri etibarsız edir (Priority: P1)

**Goal**: Parol reset-dən sonra köhnə tokenlər 401 alır, yeni parolla giriş isə işləyir.

**Independent Test**: [quickstart.md](./quickstart.md) §4.

- [X] T011 [US2] **Lane C** `product-rest/api-cbar-admin/src/Cbar.AdminApi/Controllers/UsersController.cs` → `ResetPassword`. `audit.Log(…); await db.SaveChangesAsync();`-ı tranzaksiyaya al. Commit-dən əvvəl `await stamps.RotateAsync(entity.Id);` yaz. Kilidin sıfırlanması (spec 012) və commit-dən sonrakı `RevokeAllForUserAsync` dəyişmir (depends on T010, eyni fayl və constructor)

---

## Phase 5: User Story 3 - Rol dəyişikliyi növbəti sorğuda qüvvəyə minir (Priority: P2)

**Goal**: Rol dəyişəndən sonra köhnə token 401 alır. Refresh yeni rolla token verir və
istifadəçi çıxarılmır. Yalnız email dəyişəndə tokenə toxunulmur.

**Independent Test**: [quickstart.md](./quickstart.md) §5.

- [X] T012 [US3] **Lane C** `product-rest/api-cbar-admin/src/Cbar.AdminApi/Controllers/UsersController.cs` → `Update`. T010-un rotate şərtini `if ((before.IsActive && !dto.IsActive) || before.RoleId != dto.RoleId)` et. Commit-dən sonrakı şərhi ("a role change does not need to — the next refresh issues a token with the current role") belə yenilə: rol dəyişikliyi giriş tokenini ləğv edir (spec 020), amma refresh tokenlərini yox, ona görə növbəti refresh cari rolla token verir və istifadəçi çıxarılmır. `RevokeAllForUserAsync` şərti (`before.IsActive && !dto.IsActive`) **dəyişmir** (FR-008) (depends on T010)

---

## Phase 6: Review (Lane R, Wave 2)

- [X] T013 **Lane R** T004–T012 bitəndən sonra bir review agenti işə sal. Agent faylları dəyişmir, tapıntıları fayl:sətir ilə qaytarır. SDK olmadığı üçün build-i əvəz edən yoxlama budur:
  - (1) Lane-lər arası adlar "Sabit interfeys" ilə üst-üstə düşür: `UserSecurityStamps`, `ClaimType`, metod imzaları.
  - (2) Hər faylda lazım olan `using`-lər var: `System.Security.Claims`, `Microsoft.EntityFrameworkCore`, `Cbar.AdminApi.Services`, `Microsoft.Extensions.DependencyInjection`. `async`/`await` düzgündür, `CreateAccessToken`-in bütün çağırışları yeni imzadadır.
  - (3) `diff -r` hər iki `Cbar.Domain` üzrə boşdur.
  - (4) `RotateAsync` hər üç metodda `SaveChangesAsync` ilə `CommitAsync` arasındadır, `RevokeAllForUserAsync` isə commit-dən sonradır.
  - (5) Loga token, claim və versiya dəyəri yazılmır.
  - (6) Migration: `BEGIN`/`COMMIT` yoxdur, `users`-ə `ALTER` yalnız FK-nın şərtli blokundadır, `IF NOT EXISTS` var.
  - (7) FR-001…FR-012-nin hər biri bir task-a bağlıdır.

  Tapıntıları M düzəldir. Faylın sahibi olan lane hələ aktivdirsə, düzəliş ona qaytarılır (depends on T006, T008, T009, T011, T012)

---

## Phase 7: Delivery — commit və deploy (A → B, Lane M)

**Purpose**: Kod GitLab `test` branch-lərinə Konstitusiyanın sırası ilə çatır. Commit yalnız
istifadəçi təsdiqi ilə edilir.

- [ ] T014 Bütün diff-i (T003–T012 və T013-ün düzəlişləri) istifadəçiyə göstər və commit üçün təsdiq al (depends on T013)
- [ ] T015 **(A)** Lokalda commit et, sonra GitLab-dakı `api-cbar-admin` repo-sunun `test` branch-inə çatdır. Bu deploy 012-nin commit-lərini də daşıyır. Bu SHA üçün build və deploy job-larının yaşıl olduğunu yoxla. Pod logunda migration runner-in `0007-admin-user-security-stamps.sql`-i tətbiq etdiyini gör. Build xətası olarsa (lokalda SDK yoxdur) düzəlt və təkrarla (depends on T002, T014)
- [ ] T016 **(B)** T015 deploy-u bitəndən **sonra** T006-nı `api-cbar` repo-sunun `test` branch-inə çatdır. Build və deploy yaşıl olmalı, `api-cbar` `/healthz` `200` qaytarmalı, public saytda bir səhifə açılmalıdır (Konstitusiya VIII.3) (depends on T015)

---

## Phase 8: Verification — `test` mühitində (Lane M)

- [ ] T017 [quickstart.md](./quickstart.md) §2. Rollout bitəndən sonra yoxla (T013 S2: RollingUpdate zamanı köhnə pod hələ `sst`-siz token verir, yeni pod onu rədd edir, ona görə rollout pəncərəsində bir dəfəlik login ekranı mümkündür — MR-da qeyd et). T015-dən **dərhal sonra**, deploy-dan əvvəl açılmış panel sessiyasında yoxla: bir `401` → `auth/refresh` `200` → təkrar sorğu `200` olmalı, giriş ekranı görünməməlidir (SC-003). Logda `stamp_missing` olmalıdır (depends on T015)
- [ ] T018 [US1] [quickstart.md](./quickstart.md) §3 — deaktivasiya, reaktivləşdirmə (AS4) və ən sonda silmə. Nəticələri baseline-ın (T002) yanına yaz (SC-001) (depends on T015)
- [ ] T019 [US2] [quickstart.md](./quickstart.md) §4 (depends on T015)
- [ ] T020 [US3] [quickstart.md](./quickstart.md) §5: rolun endirilməsi, paneldə `401 → refresh → 403`, yalnız email dəyişikliyi `200` qalır (SC-002, SC-005), son admin üçün `409`-dan sonra token `200` qalır (FR-005) (depends on T015)
- [ ] T021 [quickstart.md](./quickstart.md) §6 — median T002(b) ilə müqayisə olunur, fərq < 10 ms olmalıdır (SC-004). Hədd aşılarsa rəqəmləri MR-a yaz, keş üçün ayrıca spec təklif et, bu işdə optimizasiya etmə (depends on T015)
- [ ] T022 [quickstart.md](./quickstart.md) §7 — Grafana-da T018–T020-nin hər rəddi üçün id və səbəb görünür, token və versiya dəyəri görünmür (FR-010) (depends on T018, T019, T020)

---

## Phase 9: Polish & Cross-Cutting Concerns (Lane M)

- [ ] T023 [P] `business_logic/new_business_logic.md` §10.2 "Tokenlər"-ə yaz: giriş tokeni `sst` versiyası daşıyır, deaktivasiya, silmə, parol reset və rol dəyişikliyi onu növbəti sorğuda ləğv edir, rol dəyişikliyi sessiyanı bağlamır. `diff_report_logic.md`-də uyğun fərq varsa çıxar. UTF-8 qoruyan alətdən istifadə et, `Sync:` başlığına toxunma (depends on T018–T020)
- [ ] T024 [P] `api-admin-review.md`. Cədvəldə #12 sətrinin (sətir 39) Status-unu `✅ — specs/020; 4 SP (Redis yox, Q1)` et. Bölmə **12**-nin (sətir 213) başlığına eyni qeydi yaz. "Bitib" sətrini yenilə. Root `CLAUDE.md` → "api-cbar-admin (CMS API)"-də "access token valid 15 minutes" cümləsinə əlavə et: "and revoked on the next request once its user is deactivated, deleted, has the password reset or the role changed (spec 020)". `product-rest/api-cbar-admin/openapi/openapi.yaml`-ın `# Sync:` sətrini yalnız T015 commit-indən sonra `/sync-openapi api-cbar-admin` ilə yenilə (depends on T015, T018–T020)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: dərhal başlaya bilər. **T002 T015-dən əvvəl bitməlidir**
- **Foundational (Phase 2)**: T003 (təsdiq) Wave 1-i bloklayır. Lane A: T004 ∥ T005, T006 ← T005. Lane B: T007, sonra T008 və T009 (ikisi də ← T007, fərqli fayllar)
- **US1–US3 (Phase 3–5)**: Lane C-dir, ardıcıl gedir: T010 → T011, T010 → T012 (eyni fayl). Lane A/B-ni **gözləmir** (sabit interfeys)
- **Review (Phase 6)**: T013 ← bütün lane-lər
- **Delivery (Phase 7)**: T014 ← T013. T015 ← {T002, T014}. T016 ← T015
- **Verification (Phase 8)**: T017–T021 ← T015, T017 isə deploy-dan dərhal sonra. T022 ← {T018, T019, T020}
- **Polish (Phase 9)**: Phase 8-dən sonra

### User Story Dependencies

- **US1** Foundational-dan sonra işləyir. AS1–AS3 Foundational-ın özü ilə ödənir, AS4 T010-u tələb edir
- **US2** T010-un constructor dəyişikliyinin üstündə qurulur (eyni fayl). Məntiqcə müstəqildir
- **US3** T010-un `Update` dəyişikliyini genişləndirir (eyni metod)
- Üçü də **bir deploy** ilə gedir (T015): lokalda build və run yoxdur, story-lər test mühitində ayrı-ayrı yoxlanılır (T018–T020)

### Kritik yol

```text
T001 → T002 ───────────────────────────────────────────────┐
T003 (təsdiq) ─┬→ Lane A: T004 ∥ T005 → T006 ──────────┐    │
               ├→ Lane B: T007 → T008 ∥ T009 ───────────┼→ T013 → T014 → T015 → T016
               └→ Lane C: T010 → T011 → T012 ───────────┘                 └→ T017 … T022 → T023 ∥ T024
```

### Parallel Opportunities

- **Wave 1**: üç agent (A, B, C) eyni anda işləyir, fayl dəstləri kəsişmir
- Lane A daxilində T004 ∥ T005. Lane B daxilində T008 ∥ T009 (T007-dən sonra)
- T001/T002 (insan, `test` mühiti) Wave 0 və Wave 1 ilə paralel gedə bilər
- T018, T019, T020 eyni test hesabı üzərindədir, ona görə **ardıcıl** aparılır, amma deploy-dan sonra istənilən sırada
- T023 ∥ T024

---

## Parallel Example: Wave 1 (T003 təsdiqləndikdən sonra, bir mesajda üç Agent çağırışı)

```text
Agent "schema" (Lane A): T004, T005, T006 — tasks.md-nin "Sabit interfeys" bölməsi və
  data-model.md §1–§2. Yalnız Lane A fayllarına toxun, commit etmə, sonda diff -r nəticəsini qaytar.
Agent "auth"   (Lane B): T007, T008, T009 — "Sabit interfeys", research R2–R4, R8,
  data-model §3–§4. Yalnız Lane B fayllarına toxun, commit etmə.
Agent "users"  (Lane C): T010, T011, T012 — "Sabit interfeys", research R5, data-model §5.
  Yalnız UsersController.cs, commit etmə.
```

Hər agentin promptuna bunlar daxil edilir: lokalda .NET SDK yoxdur (build etmə və etməyə
çalışma); faylın mövcud şərh sıxlığı və üslubu saxlanılır; Lane cədvəlindən kənar fayl dəyişsə,
iş dayandırılır və M-ə bildirilir. Sonra **Wave 2**: bir review agenti (T013).

---

## Implementation Strategy

### MVP First (US1)

1. Phase 1: test hesabı və baseline (GitLab-a çatmazdan əvvəl!)
2. Wave 0: T003 təsdiqi
3. Wave 1: A, B və C paralel işləyir. US1-in AS1–AS3-ü Foundational ilə, AS4-ü T010 ilə ödənir
4. Wave 2: review, düzəlişlər, istifadəçi təsdiqi
5. Phase 7–8: A → B, sonra quickstart §2–§7
6. **STOP and VALIDATE**: SC-001…SC-005 rəqəmlərlə ödənib
7. Phase 9: sənədlər

### Incremental alternativ

US2 və US3 hər biri `UsersController`-də bir-iki sətirdir və eyni deploy-a qoşulur. Onları
ayırmaq yalnız ayrıca pipeline dövrü əlavə edərdi. Ehtiyac olarsa, T011/T012 çıxarılıb A paketi
yalnız US1 ilə deploy oluna bilər. Bu halda OpenAPI təsviri (T003) parol reset və rol
dəyişikliyini hələ vəd etməməlidir.

---

## Notes

- [P] = fərqli fayl, asılılıq yoxdur
- Agentlər commit etmir. Commit yalnız M edir, istifadəçi təsdiqi ilə (T014). `origin` (GitHub)-a push deploy etmir
- Real redaktor hesabını deaktiv etmə, yalnız T001-in hesabından istifadə et
- `api-cbar`-a yalnız `Cbar.Domain`-in iki faylı gedir. Başqa dəyişiklik ehtiyacı yaranarsa plan yanlışdır, dayan
- Ölçmə rəqəmləri olmadan verification task-ı "bitdi" sayılmır
