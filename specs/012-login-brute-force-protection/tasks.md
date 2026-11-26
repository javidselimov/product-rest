---

description: "Task list for 012-login-brute-force-protection"
---

# Tasks: Admin login-də brute-force qoruması (lockout, rate limit, lock oracle)

**Input**: Design documents from `specs/012-login-brute-force-protection/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/auth-login.md](./contracts/auth-login.md), [quickstart.md](./quickstart.md)

**Tests**: API-də avtomatik test yoxdur və spec onu tələb etmir (Konstitusiya VIII.1) — verification =
GitLab pipeline build + `test` mühitində [quickstart.md](./quickstart.md) ssenariləri. Lokalda .NET SDK
yoxdur: C# kodu build olunmadan yazılır, tipləri, `using`-ləri və `async`/`await`-i diqqətlə yoxla.
Panel (`web-cbar-admin-new`) üçün bir Vitest + MSW testi var — orada `npm run verify` merge şərtidir
(VIII.2).

**Organization**: Üç user story (US1, US2 — P1; US3 — P2), üç upstream iş paketi:
**(A)** `product-rest/api-cbar-admin/`, **(B)** `product-rest/api-cbar/` (yalnız `Cbar.Domain`),
**(C)** `product-rest/web-cbar-admin-new/`. Deploy sırası: A → B → C (plan, Constitution Check II.3,
IV.2). Yollar repo kökünə nisbidir.

**Deploy qeydi**: US1–US3-ün kodu `AuthController.Login`-in eyni metodundadır və lokalda build/run
yoxdur, ona görə A paketi **bir deploy** ilə gedir; story-lər ayrı-ayrı yazılır və öz-review olunur,
amma test mühitində birlikdə yoxlanılır (Phase 7).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Paralel icra oluna bilər (fərqli fayl, tamamlanmamış task-dan asılılıq yoxdur)
- **[Story]**: Aid olduğu user story (US1, US2, US3)

---

## Phase 1: Setup — test hesabları və baseline (deploy-dan ƏVVƏL)

**Purpose**: Real redaktorları kilidləməmək üçün ayrıca hesablar və bugünkü "kilid yoxdur"
vəziyyətinin sübutu (layihə qaydası: əvvəl ölç, sonra iddia et). Bu checkout-un `origin`-i
GitHub-dır, oradan push deploy etmir — deploy yalnız GitLab-dakı repo-ların `test` branch-indən.

- [ ] T001 Test mühitində (`https://api-cbar-admin-test.cbar.az/api/v1`) admin paneldən iki redaktor hesabı yarat: `bf-test-20261002` və `bf-test-other`, parolları bilinən; bir də admin access token-i (`$ADMIN_TOKEN`, §6 üçün) əldə et. Adları (parolsuz) və hesab id-lərini MR qaralamasına yaz — `specs/012-login-brute-force-protection/quickstart.md` "Ön şərtlər". Hesab yaratmaq istifadəçi təsdiqi tələb edir
- [ ] T002 `specs/012-login-brute-force-protection/quickstart.md` §1 baseline-ı Git Bash-də işlət (6 səhv + 1 doğru parol `bf-test-20261002`-yə). Gözlənilən: 6×`401`, sonra `200` — kilid yoxdur. Nəticəni MR qaralamasına "Baseline" kimi yaz. Bu task A paketi GitLab `test`-ə çatmazdan **əvvəl** bitməlidir (depends on T001)

---

## Phase 2: Foundational — kontrakt, sxem, sabitlər

**Purpose**: Hər üç story-nin dayandığı ortaq hissələr: spec-first kontrakt, yeni sütun (research R1),
hər iki `Cbar.Domain` kopyası və `LoginProtection` köməkçisi.

**⚠️ CRITICAL**: Phase 3–5 bu fazadan asılıdır.

- [X] T003 **Spec-first (A)**: `product-rest/api-cbar-admin/openapi/paths/auth.yaml` → `login.post` — [contracts/auth-login.md](./contracts/auth-login.md) "OpenAPI dəyişikliyi" bölməsinə görə: (a) `description`-a kilid abzası (5 səhv / 10 dəq → 15 dəq kilid, kilidli hesab doğru parolla da eyni 401 alır, admin parol sıfırlaması/yenidən aktivləşdirmə kilidi açır); (b) `'401'.description`-dan `Account temporarily locked.` mətnini çıxar, "kilidli hesab da `Invalid credentials.` qaytarır, səhv paroldan fərqlənmir" yaz; (c) yeni `'429'` cavabı — description (120 s-də ad üzrə 10-dan çox, ad mövcud olsa da olmasa da, parol yoxlanmadan), `headers.Retry-After` (`schema: {type: integer, minimum: 1}`, saniyə), `content.application/json.schema.$ref: ../components/schemas/common.yaml#/ErrorMessage`. `users` path faylında (`PUT /users/{id}/password` və `PUT /users/{id}`) təsvirə bir cümlə: kilidi və uğursuz cəhd sayğacını sıfırlayır. Sonra `product-rest/api-cbar-admin/openapi/`-də lint + bundle işlət (`openapi/README.md`-dəki əmrlər) ki `openapi/dist/openapi.json` təzə olsun. Dəyişikliyi istifadəçiyə göstər və **təsdiq al** — yalnız sonra Phase 3+ controller kodu (`.claude/skills/api-endpoint/` qaydası)
- [X] T004 [P] **(A)** Yeni migration `product-rest/api-cbar-admin/db/migrations/0007-users-last-failed-login.sql`: üstdə 2–3 sətirlik şərh (spec 012: 10 dəqiqəlik uğursuz cəhd pəncərəsinin lövbəri; `NULL` = seriya yoxdur; `0006-image-popups.sql` üslubunda), sonra yalnız `ALTER TABLE users ADD COLUMN IF NOT EXISTS last_failed_login_at timestamptz;`. `BEGIN`/`COMMIT` yox, default yox, grant yox (`0001`-in cədvəl səviyyəli `SELECT`-i əhatə edir). Fayl adının `product-rest/api-cbar/db/migrations/`-də olmadığını yoxla (Konstitusiya V.2)
- [X] T005 [P] **(A)** `product-rest/api-cbar-admin/src/Cbar.Domain/Entities/Auth.cs` — `User` sinfində `public DateTimeOffset? LockedUntil { get; set; }` sətrindən dərhal sonra `public DateTimeOffset? LastFailedLoginAt { get; set; }` əlavə et. `CbarDbContext`-ə toxunma (snake-case konvensiyası sütunu `last_failed_login_at` kimi tapır)
- [X] T006 [P] **(B)** `product-rest/api-cbar/src/Cbar.Domain/Entities/Auth.cs` — T005-dəki eyni sətri eyni yerə əlavə et. Sonra `diff product-rest/api-cbar/src/Cbar.Domain/Entities/Auth.cs product-rest/api-cbar-admin/src/Cbar.Domain/Entities/Auth.cs` boş olmalıdır (Konstitusiya V.1). Bu, B paketinin yeganə dəyişikliyidir
- [X] T007 [P] **(A)** Yeni `product-rest/api-cbar-admin/src/Cbar.AdminApi/Services/LoginProtection.cs` (`namespace Cbar.AdminApi.Services;`, `using System.Threading.RateLimiting;`) — `public sealed class LoginProtection : IDisposable`: (a) `public const int MaxFailedLogins = 5;`, `public static readonly TimeSpan FailureWindow = TimeSpan.FromMinutes(10);`, `LockDuration = TimeSpan.FromMinutes(15);`, `public const int AttemptsPerUsername = 10;`, `AttemptWindow = TimeSpan.FromSeconds(120);`, `private const int Segments = 12;`, `private const int MaxKeyLength = 256;`; (b) `private readonly PartitionedRateLimiter<string> _limiter = PartitionedRateLimiter.Create<string, string>(key => RateLimitPartition.GetSlidingWindowLimiter(key, _ => new SlidingWindowRateLimiterOptions { PermitLimit = AttemptsPerUsername, Window = AttemptWindow, SegmentsPerWindow = Segments, QueueLimit = 0, AutoReplenishment = true }));`; (c) `public static string NormalizeKey(string? username)` → `(username ?? "").Trim().ToLowerInvariant()`, `MaxKeyLength`-dən uzundursa kəsilir; (d) `public bool TryAcquire(string username, out TimeSpan retryAfter)` — `using var lease = _limiter.AttemptAcquire(NormalizeKey(username));` `IsAcquired`-dirsə `retryAfter = TimeSpan.Zero; return true;`, deyilsə `lease.TryGetMetadata(MetadataName.RetryAfter, out var ra)` varsa `ra`, yoxdursa `AttemptWindow / Segments` (10 s); `return false;`; (e) `Dispose()` → `_limiter.Dispose()`. Sinif üzərində `PasswordHashing.cs` üslubunda `<summary>`: ad üzrə limit login metodunun içində, bazadan əvvəl çağırılır (gövdədəki ada görə — middleware gövdəni oxumur), yaddaşdadır və pod başınadır, hesab kilidi isə bazadadır; IP limiti #5-dən sonra (research R4). Yeni NuGet paketi əlavə etmə
- [X] T008 **(A)** `product-rest/api-cbar-admin/src/Cbar.AdminApi/Program.cs` — `builder.Services.AddSingleton<MediaStorage>();` sətrindən sonra `builder.Services.AddSingleton<LoginProtection>();`. `AddRateLimiter`/`UseRateLimiter` **əlavə etmə** (research R4) (depends on T007)

**Checkpoint**: Kontrakt təsdiqlənib, sütun + entity hər iki kopyada, `LoginProtection` DI-dədir.

---

## Phase 3: User Story 1 - Bir hesaba parol seçmə hücumu bir neçə cəhddən sonra dayandırılır (Priority: P1) 🎯 MVP

**Goal**: Səhv parol sayılır (paralel cəhdlər itmədən), 10 dəqiqədə 5-ci səhv hesabı 15 dəqiqəlik
kilidləyir, kilid özü açılır, uğurlu giriş və admin müdaxiləsi sayğacı sıfırlayır (FR-001–FR-004,
FR-006, FR-007, FR-012).

**Independent Test**: [quickstart.md](./quickstart.md) §2 (kilid, sıfırlanma, 15 dəq), §4 (paralel
cəhdlər), §6 (admin parol sıfırlaması və yenidən aktivləşdirmə).

### Implementation for User Story 1

- [X] T009 [US1] `product-rest/api-cbar-admin/src/Cbar.AdminApi/Controllers/AuthController.cs` — yeni `private async Task RecordFailureAsync(User user)` metodu: bir atomik SQL ilə ([data-model.md](./data-model.md) "Hesab vəziyyətləri" cədvəli, research R2) — `db.Database.SqlQuery<FailureResult>($"""UPDATE users SET failed_logins = CASE WHEN last_failed_login_at IS NULL OR last_failed_login_at < now() - {LoginProtection.FailureWindow} OR locked_until IS NOT NULL THEN 1 ELSE failed_logins + 1 END, last_failed_login_at = now(), locked_until = CASE WHEN (CASE WHEN last_failed_login_at IS NULL OR last_failed_login_at < now() - {LoginProtection.FailureWindow} OR locked_until IS NOT NULL THEN 1 ELSE failed_logins + 1 END) >= {LoginProtection.MaxFailedLogins} THEN now() + {LoginProtection.LockDuration} ELSE NULL END WHERE id = {user.Id} AND (locked_until IS NULL OR locked_until <= now()) RETURNING failed_logins AS "FailedLogins", locked_until AS "LockedUntil" """).ToListAsync()` (`TimeSpan` parametrləri Npgsql-də `interval` olur; LINQ ilə compose **etmə**). `FailureResult` — fayl səviyyəsində `internal record FailureResult(short FailedLogins, DateTimeOffset? LockedUntil);` (`LoginRequest`/`LoginResponse` yanında). Nəticə sətri varsa və `LockedUntil` dəyəri varsa: `logger.LogWarning("Account {Username} locked until {LockedUntil} after {FailedLogins} failures from {Ip}", …, HttpContext.Connection.RemoteIpAddress)` (FR-012). Qeyd: "`locked_until IS NOT NULL`" şərti `WHERE` ilə birlikdə "kilidi bitmiş hesabda yeni seriya 1-dən" deməkdir. EF bu SQL-i alt sorğuya bükürsə (`test`-də xəta), ehtiyat yol: `db.Database.GetDbConnection()` + `NpgsqlCommand` eyni SQL ilə (research R2 "İcra qeydi") (depends on T005, T007, T003)
- [X] T010 [US1] `AuthController.cs` `Login` — mövcud `if (user is null || !verified)` blokunda, `Unauthorized`-dan əvvəl: `if (user is not null) await RecordFailureAsync(user);`. Uğur yolunda (`refreshTokens.IssueAsync`-dən əvvəl): `user.FailedLogins = 0; user.LockedUntil = null; user.LastFailedLoginAt = null;` — mövcud `await db.SaveChangesAsync()` audit ilə birlikdə yazır (FR-004). Mövcud `Login failure for {Username} from {Ip}` log-u dəyişmir. Kilid yoxlamasının yeri bu task-da **dəyişmir** — onu T012 edir (depends on T009)
- [X] T011 [P] [US1] `product-rest/api-cbar-admin/src/Cbar.AdminApi/Controllers/UsersController.cs` — (a) `ResetPassword`-də `entity.PasswordHash = …` sətrindən sonra `entity.FailedLogins = 0; entity.LockedUntil = null; entity.LastFailedLoginAt = null;`; (b) `Update`-də `entity.IsActive = dto.IsActive;`-dan sonra `if (!before.IsActive && dto.IsActive) { …eyni üç sətir… }` (yalnız `false → true` keçidində, FR-007). Audit `before/after` obyektlərinə kilid sahələrini əlavə etmə (#16). Bir sətirlik şərh: kilidli redaktorun dəstək yolu parol sıfırlamasıdır, çünki kilid xaricdən görünmür (spec Q1) (depends on T005)

**Checkpoint**: Sayğac, pəncərə, kilid və sıfırlama yazılıb. Oracle hələ açıqdır — US2 ilə birlikdə deploy olunur.

---

## Phase 4: User Story 2 - Kilid cavabı nə parolu, nə də kilidin özünü açır (Priority: P1)

**Goal**: Kilid parol yoxlanmazdan əvvəl müəyyən edilir, bcrypt yenə də həmişə işləyir, kilidli
hesab adi `401 Invalid credentials.` alır və cəhdlər kilidi uzatmır (FR-005, FR-014; research R3).

**Independent Test**: [quickstart.md](./quickstart.md) §3 — dörd qrup (kilidli + doğru, kilidli +
səhv, kilidsiz + səhv, mövcud olmayan), status/gövdə 100% eyni, median fərqi < 25 ms.

### Implementation for User Story 2

- [X] T012 [US2] `AuthController.cs` `Login` — axını research R3-ə görə yenidən sırala: `user` axtarışından sonra `var locked = user?.LockedUntil > DateTimeOffset.UtcNow;` (Verify-dan **əvvəl**); `Verify` sətri spec 011-dəki kimi **qeyd-şərtsiz** qalır; şərt `if (user is null || locked || !verified)` olur; blokun içində `if (user is not null && !locked) await RecordFailureAsync(user);` (kilidli hesab sayğacı artırmır, kilid uzanmır). Köhnə `if (user.LockedUntil is { } lockedUntil && …) return Unauthorized(new { message = "Account temporarily locked." });` blokunu və mətni **tamamilə sil**. Kilidli halda da eyni `Login failure for {Username} from {Ip}` log-u yazılır. Şərhi yenilə: kilidli hesabda da bcrypt işləyir və nəticəsi istifadə olunmur, ki nə parolun doğruluğu, nə də kilid cavabdan/vaxtdan oxunmasın (depends on T010)
- [X] T013 [US2] Öz-review (A paketinin `AuthController.cs`, `UsersController.cs` diff-i): (a) `Verify` heç bir yolda short-circuit ilə ötürülmür (kilidli, mövcud olmayan, deaktiv); (b) `user is null` və ya `locked` halında giriş `verified`-dən asılı olmayaraq rədd olunur; (c) dörd `401` yolunun hamısı eyni `Unauthorized(new { message = "Invalid credentials." })` obyektini qaytarır; (d) `Account temporarily locked` mətni kodda, OpenAPI-də (`grep -r "temporarily locked" product-rest/api-cbar-admin --include=*.cs --include=*.yaml`) qalmayıb — `openapi/dist/` T003-də yenilənib; (e) `RecordFailureAsync` yalnız `user is not null && !locked` halında çağırılır; (f) `.claude/hooks/spec-first.mjs` redaktəni bloklamır (route dəyişmir) — bloklasa dayan; (g) `RefreshTokenService.cs:92`-dəki `user.LockedUntil > now` yoxlaması dəyişməz qalıb (FR-006) (depends on T011, T012)

**Checkpoint**: US1 + US2 kodu tamdır — hesab kilidi oracle-sız işləyir.

---

## Phase 5: User Story 3 - Bir hesab adına qısa müddətdə edilən cəhdlər məhdudlaşdırılır (Priority: P2)

**Goal**: 120 s-də ad üzrə 10-dan çox login cəhdi bazaya çatmadan `429` + `Retry-After` alır;
refresh/logout limitsizdir; panel mesajı iki dildədir (FR-008, FR-010–FR-013).

**Independent Test**: [quickstart.md](./quickstart.md) §5 (11-ci sorğu `429`, böyük hərfli ad da,
başqa ad təsirlənmir, 120 s sonra açılır, refresh limitsiz) və §7 (panel mesajı).

### Implementation for User Story 3 — API (A)

- [X] T014 [US3] `AuthController.cs` — primary constructor-a `LoginProtection loginProtection` parametri əlavə et. `Login`-in **ən əvvəlində** (`db.Users` sorğusundan qabaq): `if (!loginProtection.TryAcquire(request.Username, out var retryAfter)) { logger.LogWarning("Login rate limit hit for {Username} from {Ip}", request.Username, HttpContext.Connection.RemoteIpAddress); Response.Headers.RetryAfter = ((int)Math.Ceiling(retryAfter.TotalSeconds)).ToString(); return StatusCode(StatusCodes.Status429TooManyRequests, new { message = "Too many login attempts. Try again later." }); }`. `Math.Ceiling` nəticəsi ən azı 1 olsun (`Math.Max(1, …)`). `Refresh` və `Logout` metodlarına toxunma (FR-011). `LoginResponse` qaytaran metod imzası `ActionResult<LoginResponse>` qalır — `StatusCode(...)` `ObjectResult` kimi uyğundur (depends on T008, T012)

### Implementation for User Story 3 — Panel (C)

- [X] T015 [P] [US3] `product-rest/web-cbar-admin-new/src/locales/az/auth.json` və `src/locales/en/auth.json` — `invalidCredentials`-dan sonra `"tooManyAttempts"`: az `"Çox sayda giriş cəhdi. Bir az sonra yenidən cəhd edin"`, en `"Too many sign-in attempts. Please try again shortly"`. Yalnız UTF-8 qoruyan alətlə (Write/Edit) yaz (Konstitusiya V.5)
- [X] T016 [P] [US3] `product-rest/web-cbar-admin-new/src/shared/testing/handlers/auth.ts` — `POST /api/v1/auth/login` handler-ində real kontrakta uyğun 429 ssenarisi: başlıq şərhinə `429 → { message: 'Too many login attempts. Try again later.' } + Retry-After` sətrini əlavə et; xüsusi ad (`RATE_LIMITED_USERNAME = 'rate-limited'`, export olunur) gələndə `HttpResponse.json({ message: 'Too many login attempts. Try again later.' }, { status: 429, headers: { 'Retry-After': '10' } })` qaytar (mövcud 401 yoxlamasından əvvəl)
- [X] T017 [US3] `product-rest/web-cbar-admin-new/src/features/auth/components/login-form.tsx` — `catch` blokunda `status === 401` şərtindən sonra `else if (isAppError(error) && error.status === 429) form.setError('root', { message: t('tooManyAttempts') })`. Şərh: server mətni ingiliscədir, ona görə 429 lokal mətnlə göstərilir (spec 012 FR-013). `AppError`-da `status` sahəsinin 429 üçün də doldurulduğunu `src/shared/api/types.ts`-də yoxla (depends on T015)
- [X] T018 [US3] `product-rest/web-cbar-admin-new/src/features/auth/auth-flow.test.tsx` — mövcud "yanlış məlumat" testinin üslubunda yeni test: `RATE_LIMITED_USERNAME` ilə login → formada `auth:tooManyAttempts` mətni görünür, `invalidCredentials` görünmür, istifadəçi login səhifəsində qalır. Mock assert yox — yalnız ekran (template qaydası) (depends on T016, T017)
- [X] T019 [US3] `product-rest/web-cbar-admin-new`-də `npm run verify` (lint + check:kit + check:i18n + tsc -b + test + build) — hamısı yaşıl. Node 22 ilə də işlət (CI `node:22`-dir) (depends on T018)

**Checkpoint**: Üç story-nin kodu tamdır; A, B, C paketləri deploy-a hazırdır.

---

## Phase 6: Delivery — commit və deploy (A → B → C)

**Purpose**: Kod GitLab `test` branch-lərinə Konstitusiyanın sırası ilə çatır. Commit yalnız
istifadəçi təsdiqi ilə.

- [ ] T020 **(A)** Lokalda commit (istifadəçi təsdiqi ilə), sonra GitLab-dakı `api-cbar-admin` repo-sunun `test` branch-inə çatdır. GitLab-da bu SHA üçün build və deploy job-larının yaşıl olduğunu və bitmə vaxtını yoxla (API-də versiya endpoint-i yoxdur). Pod log-unda migration runner-in `0007-users-last-failed-login.sql`-i tətbiq etdiyini gör. Build xətası olarsa (lokalda SDK yoxdur) düzəlt və təkrarla (depends on T002, T013, T014)
- [ ] T021 **(B)** T020 deploy-u bitəndən **sonra** `api-cbar` repo-sunun `test` branch-inə T006-nı çatdır; build/deploy yaşıl, `https://api-cbar-test.cbar.az/healthz` (və ya `.ci-cd/test.yaml`-dakı host) `200`, public saytda bir səhifə açılır (Konstitusiya VIII.3) (depends on T020)
- [ ] T022 **(C)** T021-dən sonra `web-cbar-admin-new` repo-sunun `test` branch-inə T015–T018-i çatdır; build/deploy yaşıl (depends on T019, T021)

---

## Phase 7: Verification — `test` mühitində (story-lər üzrə)

- [ ] T023 [US1] [quickstart.md](./quickstart.md) §2 — **birinci** (a) addımından sonra API log-unda `UPDATE … RETURNING` xətası olmadığını yoxla (research R2); sonra (a)–(c) və 15 dəqiqəlik açılma. Log-da `Account bf-test-… locked until …` sətri (FR-012). Nəticələri baseline-ın yanına yaz. Xəta varsa T009-un ehtiyat yoluna keç, T020-dən təkrarla (depends on T020)
- [ ] T024 [US1] [quickstart.md](./quickstart.md) §4 (paralel cəhdlər, SC-004) və §6 (admin parol sıfırlaması + deaktiv→aktiv, SC-006) (depends on T023)
- [ ] T025 [US2] [quickstart.md](./quickstart.md) §3 — dörd qrup × 30 sorğu (28 s fasilə), status/gövdə 100% eyni, istənilən iki median fərqi < 0.025 s (SC-002); heç bir faylda `429` olmamalıdır. Meyar ödənmirsə dayan və araşdır — "düzəldi" demə (depends on T023)
- [ ] T026 [US3] [quickstart.md](./quickstart.md) §5 — 11-ci sorğu `429` + `Retry-After` (müsbət tam ədəd) + gövdə; böyük hərfli ad da `429`; başqa ad `200`; 120 s sonra `401`; mövcud ad üçün də eyni və `failed_logins` 429-dan artmır; refresh 11+ dəfə — `429` yoxdur (SC-003, FR-011) (depends on T020)
- [ ] T027 [US3] [quickstart.md](./quickstart.md) §7 — panelə normal giriş (1 səhv + 1 doğru, SC-007); login formunda 11 səhv → az və en interfeysdə `tooManyAttempts` mətni (depends on T022)

---

## Phase 8: Polish & Cross-Cutting Concerns

- [ ] T028 [P] `business_logic/new_business_logic.md` §10.1 "Login axını"-na: hesab kilidi (10 dəq/5 → 15 dəq, kilidli hesab generik 401), ad üzrə rate limit (120 s/10 → 429), admin sıfırlaması kilidi açır; `diff_report_logic.md`-də login fərqlərindən bərpa olunanları çıxar, qalanları (CAPTCHA, artan kilid, IP limiti, QRadar) saxla. UTF-8 qoruyan alətlə; `Sync:` başlığına toxunma (depends on T023–T026)
- [ ] T029 [P] `api-admin-review.md` — cədvəldə #2 sətrinin Status-unu `🟡 qismən — specs/012; IP limiti #5-dən sonra` et, bölmə **2**-nin başlığına eyni qeyd; "Bitib/Qalıb" sətirlərini yenilə (#2-nin 5 SP-sindən IP limiti hissəsini ~1 SP kimi qalıq say) (depends on T023–T026)
- [ ] T030 [P] `product-rest/api-cbar-admin/openapi/openapi.yaml`-dakı `# Sync:` sətrini `/sync-openapi api-cbar-admin auth` ilə yenilə — yalnız T020 commit-indən sonra (depends on T020)
- [ ] T031 `api-admin-review.md` #5 bölməsinə qeyd: "#5 bitəndən sonra login-ə IP üzrə limit (60 s-də 10, köhnə sistem kimi) əlavə olunmalıdır — spec 012 FR-009" ki, təxirə salınmış iş itməsin (Konstitusiya I.3) (depends on T029)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: dərhal başlaya bilər; **T002 A paketi GitLab-a çatmamış bitməlidir** (T020)
- **Foundational (Phase 2)**: T003 (təsdiq) controller task-larını bloklayır; T004–T007 paralel; T008 ← T007
- **US1 (Phase 3)**: T009 ← {T003, T005, T007}; T010 ← T009; T011 ← T005 (T009/T010 ilə paralel)
- **US2 (Phase 4)**: T012 ← T010 (eyni metod); T013 ← {T011, T012}
- **US3 (Phase 5)**: T014 ← {T008, T012} (eyni metod, US2-dən sonra); panel T015/T016 istənilən vaxt, T017 ← T015, T018 ← {T016, T017}, T019 ← T018
- **Delivery (Phase 6)**: T020 ← {T002, T013, T014}; T021 ← T020; T022 ← {T019, T021}
- **Verification (Phase 7)**: T023/T026 ← T020; T024/T025 ← T023; T027 ← T022
- **Polish (Phase 8)**: Phase 7-dən sonra

### User Story Dependencies

- **US1** Foundational-dan sonra; başqa story-dən asılı deyil
- **US2** US1-in `Login` dəyişikliyinin üstündə qurulur (eyni metod, T010 → T012) — ayrıca deploy olunmur
- **US3** API hissəsi US2-dən sonra eyni metoda yazılır (T012 → T014); panel hissəsi (T015–T019) Foundational-dan da asılı deyil

### Kritik yol

```text
T001 → T002 ─────────────────────────────────────────────┐
T003 (təsdiq) ─┐                                         │
T005 ──────────┼→ T009 → T010 → T012 → T014 ─┐           ├→ T020 → T021 → T022 → T027
T007 → T008 ───┘                     T011 ───┴→ T013 ────┘    └→ T023 → T024/T025
T004, T006 ────────────────────────────────────────────────────┘ └→ T026
T015/T016 → T017 → T018 → T019 ──────────────────────────────────────→ T022
```

### Parallel Opportunities

- T004, T005, T006, T007 — dörd fərqli fayl, Phase 2-də paralel
- T011 (`UsersController.cs`) T009/T010 (`AuthController.cs`) ilə paralel
- Panel task-ları (T015–T019) API task-ları (T009–T014) ilə tamamilə paralel — fərqli repo
- T023–T026 deploy-dan sonra müxtəlif test hesabları ilə paralel aparıla bilər, amma eyni hesab (`bf-test-20261002`) üzərində ardıcıl
- T028, T029, T030 — fərqli fayllar

---

## Parallel Example: Foundational + Panel

```bash
# Phase 2, T003 təsdiqləndikdən sonra:
Task: "0007-users-last-failed-login.sql migration (T004)"
Task: "api-cbar-admin Cbar.Domain Auth.cs → LastFailedLoginAt (T005)"
Task: "api-cbar Cbar.Domain Auth.cs → eyni sətir + diff (T006)"
Task: "Services/LoginProtection.cs (T007)"

# Eyni vaxtda, ayrı repo:
Task: "web-cbar-admin-new locales tooManyAttempts (T015)"
Task: "web-cbar-admin-new MSW 429 ssenarisi (T016)"
```

---

## Implementation Strategy

### MVP First (US1 + US2)

US1 tək başına oracle-ı **gücləndirir** (kilid olur, amma kilid mesajı parolu təsdiqləyir), ona görə
MVP = US1 + US2 birlikdə:

1. Phase 1: test hesabları + baseline (GitLab-a çatmazdan əvvəl!)
2. Phase 2: OpenAPI təsdiqi, migration, iki `Auth.cs`, `LoginProtection`
3. Phase 3 + 4: sayğac/kilid/sıfırlama, sonra sıralama və oracle-ın silinməsi, öz-review
4. Phase 5-in API hissəsi (T014) — bir sətirlik blok, eyni deploy-a qoşulur
5. Phase 6–7: A → B → C, sonra quickstart §2–§7
6. **STOP and VALIDATE**: SC-001…SC-007 rəqəmlərlə ödənib
7. Phase 8: sənədlər

### Incremental alternativ

US3 (limit) gecikərsə, T014-ü çıxarıb A paketini US1 + US2 ilə deploy etmək olar; panel paketi (C)
onda T022-ə qədər gözləyir. OpenAPI-dəki 429 təsviri (T003) bu halda ayrıca commit-də geri alınmalı
və ya US3 ilə birlikdə əlavə olunmalıdır — spec və kod ayrılmasın.

---

## Notes

- [P] = fərqli fayl, asılılıq yoxdur
- Commit yalnız istifadəçi təsdiqi ilə. `origin` (GitHub)-a push deploy etmir; deploy yalnız GitLab-dakı repo-ların `test` branch-indən (T020–T022)
- Real redaktor hesabları ilə kilid testi etmə — yalnız T001-in hesabları
- `api-cbar`-a yalnız `Cbar.Domain/Entities/Auth.cs` sətri gedir; başqa dəyişiklik ehtiyacı yaranarsa plan yanlışdır, dayan
- Ölçüm rəqəmləri olmadan verification task-ı "bitdi" sayılmır
