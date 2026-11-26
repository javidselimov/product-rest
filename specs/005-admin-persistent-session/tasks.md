---

description: "Task list — Admin panel davamlı sessiya (httpOnly cookie + refresh token)"
---

# Tasks: Admin panel — davamlı sessiya (httpOnly cookie + refresh token)

**Input**: `specs/005-admin-persistent-session/` — [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/auth-api.md](./contracts/auth-api.md), [contracts/panel-session.md](./contracts/panel-session.md), [quickstart.md](./quickstart.md)

**Tests**: `api-cbar-admin`-də test yığını yoxdur (Konstitusiya VIII.1) — verification curl ssenariləri ilə (quickstart §2). `web-cbar-admin-new`-də Vitest + MSW testləri **məcburidir** (template gate `npm run verify`), ona görə panel test task-ları daxildir.

**Organization**: iki upstream repo = iki iş paketi. **A = `api-cbar-admin`** (MR 1, əvvəl deploy), **B = `web-cbar-admin-new`** (MR 2). Hər story daxilində A task-ları B-dən əvvəldir.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: paralel icra oluna bilər (fərqli fayl, tamamlanmamış task-dan asılılıq yoxdur)
- **[Story]**: US1–US4 (spec.md)
- Yollar repo kökünə nisbidir (`commonrabc/`)

## Qəbul edilmiş qərarlar (task-larda istinad)

- Cookie: `cbar_admin_rt`, `HttpOnly; SameSite=Strict; Path=/api/v1/auth`, `Secure` konfiqdən (research R2).
- Sessiya: 8 saat hərəkətsizlik, 7 gün maksimum, 30 s reuse grace (R0, R5, R7) — konfiqdən.
- Refresh/login cavabı eyni forma: `{ accessToken, expiresAt }`; xətalar `{ message, code }` (contracts/auth-api.md).
- Panel access token-i yaddaşda saxlayır; refresh dəyəri JS-ə heç gəlmir.

---

## Phase 1: Setup

**Purpose**: iş mühiti və baseline

- [X] T001 `test` branch-indən `feature/005-admin-persistent-session` branch-i aç (repo kökündə `git switch -c feature/005-admin-persistent-session`); `test`-ə birbaşa push etmə — GitLab-da avtomatik test deploy-u işə düşür
- [X] T002 [P] Baseline: `web-cbar-admin-new`-də `npm run verify` işlət və nəticəni qeyd et (dəyişiklikdən əvvəl yaşıl olmalıdır; qırmızıdırsa səbəbi bu feature-dan ayrı qeyd et)
- [X] T003 [P] Baseline: `api-cbar/src/Cbar.Domain` və `api-cbar-admin/src/Cbar.Domain` eyniliyini yoxla — `git diff --no-index api-cbar/src/Cbar.Domain api-cbar-admin/src/Cbar.Domain` boş olmalıdır

---

## Phase 2: Foundational (bütün story-lər üçün bloklayıcı)

**⚠️ CRITICAL**: bu faza bitmədən heç bir story başlamır.

### A — `api-cbar-admin` (sxem, konfiq, servis)

- [X] T004 Migration yarat `api-cbar-admin/db/migrations/0004-refresh-token-rotation.sql`: `BEGIN/COMMIT` yox; (1) `ALTER TABLE refresh_tokens ADD COLUMN IF NOT EXISTS family_id uuid, ADD COLUMN IF NOT EXISTS family_created_at timestamptz, ADD COLUMN IF NOT EXISTS replaced_by_id bigint REFERENCES refresh_tokens(id) ON DELETE SET NULL;` (2) `DELETE FROM refresh_tokens WHERE family_id IS NULL;` (heç vaxt verilməmiş sətirlər) (3) `ALTER COLUMN family_id SET NOT NULL`, `ALTER COLUMN family_created_at SET NOT NULL` (4) `CREATE INDEX IF NOT EXISTS ix_refresh_tokens_user_id ON refresh_tokens(user_id)` və `ix_refresh_tokens_family_id ON refresh_tokens(family_id)`. Başlıqda şərh: spec 005, data-model §1
- [X] T005 `api-cbar-admin/src/Cbar.Domain/Entities/Auth.cs`-də `RefreshToken`-ə əlavə et: `public Guid FamilyId { get; set; }`, `public DateTimeOffset FamilyCreatedAt { get; set; }`, `public long? ReplacedById { get; set; }`; `api-cbar-admin/src/Cbar.Domain/CbarDbContext.cs`-də `b.Entity<RefreshToken>` blokuna `e.HasIndex(x => x.UserId);` və `e.HasIndex(x => x.FamilyId);` əlavə et
- [X] T006 T005-dəki dəyişikliyi **bayt-bayt eyni** şəkildə `api-cbar/src/Cbar.Domain/Entities/Auth.cs` və `api-cbar/src/Cbar.Domain/CbarDbContext.cs`-ə köçür; `git diff --no-index api-cbar/src/Cbar.Domain api-cbar-admin/src/Cbar.Domain` boş olmalıdır (Konstitusiya V.1)
- [X] T007 [P] Konfiq: `api-cbar-admin/src/Cbar.AdminApi/appsettings.json`-da `Jwt`-yə `"RefreshIdleHours": 8`, `"RefreshAbsoluteDays": 7`; yeni bölmə `"Auth": { "RefreshReuseGraceSeconds": 30, "RefreshCookie": { "Name": "cbar_admin_rt", "Secure": true } }`. `appsettings.Development.json`-da `Jwt`-yə eyni refresh açarları, `"Auth": { "RefreshCookie": { "Secure": false } }` və `Cors:Origins`-ə `"http://localhost:5174"` əlavə et (5173 qalır)
- [X] T008 [P] `api-cbar-admin/src/Cbar.AdminApi/Services/AuditService.cs`-də `Log` metoduna sonda isteğe bağlı `int? actorId = null` parametri əlavə et: verilibsə `ActorId = actorId`, yoxsa bugünkü claim məntiqi. Mövcud çağırışlar dəyişmir
- [X] T009 Yeni servis `api-cbar-admin/src/Cbar.AdminApi/Services/RefreshTokenService.cs` (primary constructor: `CbarDbContext db, IConfiguration config, IHttpContextAccessor http, ILogger<RefreshTokenService> logger`). Metodlar:
  - `Task<string> IssueAsync(int userId)` — 32 bayt `RandomNumberGenerator` → base64url dəyər; `TokenHash = SHA256 hex`; yeni `FamilyId = Guid.NewGuid()`, `FamilyCreatedAt = now`, `ExpiresAt = min(now+idle, family+absolute)`, `Ip`, `UserAgent` (500 simvola kəs); eyni zamanda həmin istifadəçinin `expires_at < now-1 gün` və ya `revoked_at < now-7 gün` sətirlərini sil (research R10); `SaveChangesAsync` çağırmır — çağıran edir, ya da açıq sənədləşdir
  - `Task<RotateResult> RotateAsync(string rawToken)` — contracts/auth-api.md §2 addım 3–7: hash ilə tap (`Include(User).ThenInclude(Role)`, `IgnoreQueryFilters` ilə user silinməni yoxla); rotasiya atomik: yeni sətir insert et, sonra `ExecuteUpdateAsync(... WHERE Id=old AND RevokedAt == null)` → 0 sətir olarsa stale/reused yoluna düş; nəticə tipi: `Success(User, string newRaw, DateTimeOffset expiresAt)` və ya `Failure(string code)` (`refresh_invalid|refresh_stale|refresh_reused|refresh_expired|user_inactive`); reuse-da ailənin bütün aktiv sətirlərini ləğv et və `AuditService.Log("auth.refresh_reuse","user",userId, after: new { familyId }, actorId: userId)`; tranzaksiya (`db.Database.BeginTransactionAsync`) daxilində
  - `Task RevokeFamilyAsync(string rawToken)` — aktiv sətrin ailəsini ləğv et, `int?` user id qaytar
  - `Task RevokeAllForUserAsync(int userId)` — `ExecuteUpdateAsync` ilə bütün aktiv sətirləri `RevokedAt = now`
  - `void WriteCookie(string raw, DateTimeOffset expiresAt)` / `void ClearCookie()` — yeganə cookie yazma yeri: ad/Secure konfiqdən, `HttpOnly=true`, `SameSite=Strict`, `Path="/api/v1/auth"`, `MaxAge` qalan ömür; silmə = eyni atributlar + `MaxAge=0`
  - `string? ReadCookie()` və `bool IsOriginAllowed()` — `Origin` başlığı yoxdursa `true`; varsa `Cors:Origins` siyahısında olmalıdır (research R6)
  - Token dəyəri və hash **heç vaxt** log-a yazılmır; uğursuz nəticələr `LogWarning` (user id, IP, code)
- [X] T010 `api-cbar-admin/src/Cbar.AdminApi/Program.cs`: `builder.Services.AddScoped<RefreshTokenService>();` və CORS siyasətinə `.AllowCredentials()` əlavə et (origin-lər `WithOrigins(...)` ilə qalır, wildcard yox)
- [X] T011 Access token yaratmanı `AuthController.Login`-dən özəl metoda çıxar (`private LoginResponse CreateAccessToken(User user)` — claim-lər, issuer, audience, `AccessTokenMinutes` dəyişmir) ki, refresh eyni kodu istifadə etsin: `api-cbar-admin/src/Cbar.AdminApi/Controllers/AuthController.cs`

### B — `web-cbar-admin-new` (store, servis, mock)

- [X] T012 [P] `web-cbar-admin-new/src/features/auth/model/auth-store.ts`: `status: 'restoring' | 'anonymous' | 'authenticated'` sahəsi (ilkin `'restoring'`), `login` → `'authenticated'`, `logout` → `'anonymous'`, yeni `setAnonymous()`; başlıq şərhini yenilə (spec 005 — "yenilənəndə yenidən daxil olur" artıq keçərli deyil; token hələ də yalnız yaddaşda, persist yoxdur)
- [X] T013 [P] `web-cbar-admin-new/src/features/auth/api/auth.service.ts`: `login` sorğusuna `{ withCredentials: true }`; yeni `refresh: () => apiClient.post('/auth/refresh', undefined, { withCredentials: true })` → `loginResponseSchema.parse`; yeni `logout: () => apiClient.post('/auth/logout', undefined, { withCredentials: true })`; başlıq şərhini real kontrakta (contracts/auth-api.md) uyğunlaşdır
- [X] T014 [P] MSW: `web-cbar-admin-new/src/shared/testing/handlers/auth.ts`-də modul səviyyəli sessiya vəziyyəti (`let session: 'none' | 'active' | 'expired' = 'none'`) və export edilən test helper-ləri `setMockSession(state)`, `getRefreshCallCount()`, `resetAuthMock()`; login uğurlu → `active`; `POST /api/v1/auth/refresh` → `active` isə 200 `{ accessToken: makeAdminJwt(), expiresAt }`, yoxsa 401 `{ message, code: 'refresh_expired' }` (`none` üçün `refresh_missing`); `POST /api/v1/auth/logout` → `none`, 204. Başlıq şərhini yenilə. `web-cbar-admin-new/src/shared/testing/setup.ts`-də hər testdən sonra `resetAuthMock()` çağır

**Checkpoint**: sxem, servis və panel tipləri hazırdır.

---

## Phase 3: User Story 1 — Səhifə yenilənəndə sessiya qalır (P1) 🎯 MVP

**Goal**: login cookie verir, `POST /auth/refresh` işləyir, panel açılışda sessiyanı bərpa edir.

**Independent Test**: daxil ol → `/pages` → F5 → login ekranı görünmədən siyahı yüklənir; yeni tab da girişsiz açılır (quickstart §4 #1–#3, §2 ilk üç curl).

### A — API

- [X] T015 [US1] `AuthController.Login`: uğurlu girişdən sonra `var raw = await refreshTokens.IssueAsync(user.Id)`; `audit.Log("auth.login","user",user.Id, actorId: user.Id)`; `SaveChangesAsync`; `refreshTokens.WriteCookie(raw, expiresAt)`; cavab body-si dəyişmir. Constructor-a `RefreshTokenService refreshTokens, AuditService audit` əlavə et. Phase 2 `TODO` şərhində "refresh tokens" hissəsini sil (qalanları saxla) — `api-cbar-admin/src/Cbar.AdminApi/Controllers/AuthController.cs`
- [X] T016 [US1] `AuthController`-ə `[HttpPost("refresh")]` əlavə et: `IsOriginAllowed` → yoxsa `403 { message, code: "origin_forbidden" }`; cookie yoxdur → `401 refresh_missing`; `RotateAsync`; `Failure` → `refresh_stale` istisna olmaqla `ClearCookie()`, `401 { message, code }`; `Success` → `WriteCookie(newRaw, expiresAt)` və `CreateAccessToken(user)` (cari rol) qaytar — `api-cbar-admin/src/Cbar.AdminApi/Controllers/AuthController.cs`

### B — Panel

- [X] T017 [US1] `web-cbar-admin-new/src/app/providers/auth-bridge.ts`-ə `export async function restoreSession(): Promise<void>` əlavə et: `authService.refresh()` → `userFromToken(accessToken)` (login-form ilə eyni çevirmə) → `useAuthStore.getState().login(...)`; istənilən xəta (401, 404/405, şəbəkə, 5xx) → `setAnonymous()`, toast **yox**
- [X] T018 [US1] `web-cbar-admin-new/src/main.tsx`: `registerAuthBridge(router)`-dan sonra, `createRoot(...).render`-dən əvvəl `await restoreSession()`; şərhi yenilə
- [X] T019 [US1] `web-cbar-admin-new/src/app/routes/index.ts`: `loginRoute`-a `beforeLoad` — `isAuthenticated` isə `redirect` search-ə (yalnız `/` ilə başlayan, `//` ilə başlamayan — `login-page.tsx`-dəki `safeRedirect` qaydası) və ya `/`-ə yönləndir. `safeRedirect`-i paylaşmaq üçün `features/auth/lib/safe-redirect.ts`-ə çıxar və `login-page.tsx`-də oradan import et
- [X] T020 [P] [US1] Testlər `web-cbar-admin-new/src/features/auth/session-restore.test.tsx`: (a) `setMockSession('active')` + `restoreSession()` + `renderApp('/pages')` → login ekranı yoxdur, store `authenticated`; (b) `none` → `/login?redirect=/pages`, toast yox; (c) refresh 500 (`server.use`) → `anonymous`, toast yox; (d) refresh 404 → `anonymous`; (e) autentifikasiyalı istifadəçi `/login?redirect=/laws` açanda `/laws`-a gedir; (f) `localStorage`/`sessionStorage` boşdur və `document.cookie`-də `cbar_admin_rt` yoxdur
- [X] T021 [P] [US1] `web-cbar-admin-new/src/shared/api/api-client.test.ts`-ə test: login sorğusu `withCredentials: true` ilə gedir (axios `config` yoxlaması və ya `httpClient.interceptors` spy)

**Checkpoint**: F5 sessiyanı saxlayır (15 dəqiqə ərzində; ondan sonrası US2).

---

## Phase 4: User Story 2 — İşləyən istifadəçi 15 dəqiqədən sonra çıxarılmır (P1)

**Goal**: token bitəndə və ya 401-də səssiz refresh + bir dəfə təkrar; paralel sorğular və tablar üçün tək refresh; taymerlə çıxış yoxdur.

**Independent Test**: 16+ dəqiqə gözlə → yadda saxla → uğurlu, Network-də bir `refresh` + təkrarlanmış sorğu (quickstart §4 #4, #6).

### B — Panel

- [X] T022 [US2] `web-cbar-admin-new/src/shared/api/interceptors.ts`: `AuthHooks`-u `{ getToken: () => string | null; getExpiresAt: () => string | null; refresh: () => Promise<boolean>; onSessionExpired: () => void }` ilə əvəz et. Request interceptor async: auth URL deyilsə və `expiresAt - 30 s < now` isə `await refresh()`, sonra `Authorization`. Response interceptor: `401` + URL `/auth/login|/auth/refresh|/auth/logout` deyil + `config._retry` yoxdur → `_retry = true`, `const ok = await refresh()` → `ok` isə `client.request(config)` qaytar; `ok === false` (refresh rədd edildi) → `onSessionExpired()` və orijinal xəta; refresh şəbəkə/5xx ilə atdısa orijinal xəta, çıxış yox. Başlıq şərhini yenilə (401 artıq birbaşa çıxış deyil)
- [X] T023 [US2] `web-cbar-admin-new/src/app/providers/auth-bridge.ts`: `refreshAccessToken(): Promise<boolean>` — tab daxili single-flight (`let inFlight: Promise<boolean> | null`); içində `navigator.locks?.request('cbar-admin-refresh', …)` varsa refresh lock altında gedir (tablar cookie-ni paylaşır, növbə ilə rotasiya edir — reuse detection işə düşmür), yoxdursa lock-suz; `authService.refresh()` → store `login`; `401` + `code === 'refresh_stale'` → bir dəfə təkrar; digər `401` → `false`; şəbəkə/5xx → xətanı at. `setAuthHooks`-a yeni hook-ları ver; `onSessionExpired: expireSession`
- [X] T024 [US2] `web-cbar-admin-new/src/app/providers/auth-bridge.ts`-dən `scheduleExpiry`, `expiryTimer`, `MAX_TIMEOUT`, `clearExpiryTimer` və store abunəliyini sil (FR-019); `restoreSession` və `performLogout` onlardan asılı olmasın; başlıq şərhindəki "iki səbəb" mətnini "yeganə səbəb — rədd edilmiş refresh" ilə yenilə
- [X] T025 [US2] `web-cbar-admin-new/src/features/auth/auth-flow.test.tsx`: "token müddəti bitəndə taymer avtomatik çıxarır" testini sil; "API 401 → sessiya təmizlənir…" testini yenilə: `setMockSession('expired')` qur → 401 → refresh 401 → login + "sessiya bitdi" toast-u
- [X] T026 [P] [US2] Yeni testlər `web-cbar-admin-new/src/features/auth/token-refresh.test.ts`: (a) `/laws` birinci dəfə 401, refresh 200 → sorğu bir dəfə təkrarlanır və uğurlu, çıxış yox; (b) `expiresAt` keçmişdə → request-dən əvvəl refresh, `/laws` 401 görmür; (c) 5 paralel sorğu, hamısı 401 → `getRefreshCallCount() === 1`, hamısı uğurlu; (d) refresh `401 refresh_stale` bir dəfə, sonra 200 → uğurlu, çıxış yox; (e) refresh 500 → orijinal xəta, store `authenticated` qalır; (f) təkrarlanmış sorğu yenə 401 → ikinci refresh yoxdur (sonsuz dövr yoxdur); (g) login-in öz 401-i refresh çağırmır

**Checkpoint**: US1 + US2 = istifadəçinin problemi tam həll olunub (MVP).

---

## Phase 5: User Story 3 — Çıxış sessiyanı həqiqətən bağlayır (P2)

**Goal**: server tərəfli logout, cookie silinir, digər tablar da çıxır.

**Independent Test**: daxil ol → çıx → F5 və geri düyməsi → login; köhnə cookie ilə refresh 401 (quickstart §2 logout curl, §4 #7).

### A — API

- [X] T027 [US3] `AuthController`-ə `[HttpPost("logout")]`: `IsOriginAllowed` → yoxsa 403; cookie varsa `RevokeFamilyAsync` → user id qayıdıbsa `audit.Log("auth.logout","user",id, actorId: id)` + `SaveChangesAsync`; hər halda `ClearCookie()` və `NoContent()` — `api-cbar-admin/src/Cbar.AdminApi/Controllers/AuthController.cs`

### B — Panel

- [X] T028 [US3] `web-cbar-admin-new/src/app/providers/auth-bridge.ts`: `export async function logoutEverywhere(): Promise<void>` — `authService.logout()` (xətanı udur) → `broadcast({ type: 'logout' })` → `performLogout()`. `BroadcastChannel('cbar-admin-auth')`-ı `registerAuthBridge`-də yarat (yoxdursa `null`); gələn `logout` mesajında toast-suz `performLogout()` (serverə sorğu yox)
- [X] T029 [US3] `web-cbar-admin-new/src/app/shell/topbar.tsx`: çıxış menyusunda `performLogout()` əvəzinə `void logoutEverywhere()`
- [X] T030 [P] [US3] Testlər `web-cbar-admin-new/src/features/auth/logout.test.tsx`: (a) topbar "Çıxış" → `POST /auth/logout` çağırılır, store `anonymous`, `/login`, query cache boş; (b) logout 500 → yenə lokal çıxış; (c) logout-dan sonra `restoreSession()` → `anonymous` (mock sessiya `none`); (d) `BroadcastChannel` mesajı simulyasiya olunanda (`vi.stubGlobal` ilə fake kanal) tab çıxır, toast yoxdur

**Checkpoint**: US1–US3 müstəqil işləyir.

---

## Phase 6: User Story 4 — Admin istifadəçinin sessiyalarını bağlaya bilir (P3)

**Goal**: deaktiv/şifrə sıfırlama/silmə həmin istifadəçinin bütün sessiyalarını ləğv edir; rol dəyişikliyi növbəti refresh-də görünür.

**Independent Test**: A ilə daxil ol → admin A-nı deaktiv edir → A-nın cookie-si ilə refresh `401` (quickstart §2 "Əlavə", §4 #8).

### A — API

- [X] T031 [US4] `api-cbar-admin/src/Cbar.AdminApi/Controllers/UsersController.cs`: constructor-a `RefreshTokenService refreshTokens`; `Update`-də `before.IsActive && !dto.IsActive` olanda, `ResetPassword`-da və `Delete`-də `await refreshTokens.RevokeAllForUserAsync(entity.Id)` (mövcud `SaveChangesAsync`-dən əvvəl/sonra, amma eyni sorğuda); rol dəyişikliyi ləğv etmir
- [X] T032 [US4] `RefreshTokenService.RotateAsync`-in `user_inactive` yolunu yoxla: `IsActive == false`, `DeletedAt != null` (query filter-i `IgnoreQueryFilters` ilə keç) və ya `LockedUntil > now` → ailə ləğv + `user_inactive`; yeni access token `user.Role.Code`-u cari bazadan oxuyur — `api-cbar-admin/src/Cbar.AdminApi/Services/RefreshTokenService.cs`

**Checkpoint**: bütün story-lər tamamdır.

---

## Phase 7: Polish & Cross-Cutting

- [X] T033 [P] `web-cbar-admin-new/.env.production`: `VITE_API_URL=https://api-cbar-admin.cbar.az/api/v1` (Q2); şərhdə spec 005-ə istinad
- [X] T034 [P] `web-cbar-admin-new/.ci-cd/prod.yaml` və `test.yaml`: şərh əlavə et — refresh cookie panel və API-nin eyni saytda (`*.cbar.az`) olmasını tələb edir; prod host Q2a təsdiqinə qədər dəyişdirilmir, `TODO(devops)` qalır. `api-cbar-admin/.ci-cd/base.yaml`-da (və ya Vault şərhinin olduğu faylda) `Cors__Origins__0` = panelin dəqiq host-u, credentials tələb olunur qeydi
- [X] T035 [P] `specs/001-admin-template-migration/spec.md` FR-010-a qeyd: "Səhifə yenilənəndə yenidən daxil olur" hissəsi spec 005 ilə əvəzlənib; `web-cbar-admin-new/CLAUDE.md`-də auth bölməsi varsa refresh/cookie axınını qısa yenilə
- [X] T036 [P] `web-cbar-admin-new/src/locales/{az,en}/auth.json`: yeni mesaj lazım olubsa hər iki dildə əlavə et; `npm run check:i18n`
- [X] T037 `web-cbar-admin-new`-də `npm run verify` — hamısı yaşıl olmalıdır
- [ ] T038 API build: SDK olan maşında və ya CI-da `cd api-cbar-admin && dotnet build` və `cd api-cbar && dotnet build`; `git diff --no-index api-cbar/src/Cbar.Domain api-cbar-admin/src/Cbar.Domain` boş (bu maşında .NET SDK yoxdur — nəticəni açıq qeyd et, "keçdi" iddia etmə)
- [ ] T039 quickstart.md §1–§2 (API, curl) və §4 (brauzer: lokal `.\dev.ps1` → :5174 və ya test mühiti) ssenarilərini icra et; köhnə `web-cbar-admin` (:5173) login + bir CRUD reqressiya yoxlaması; `logs/api-admin.log`-da `cbar_admin_rt=` və token dəyəri yoxdur
- [ ] T040 İki ayrı MR hazırla: MR 1 `api-cbar-admin` (T004–T011, T015–T016, T027, T031–T032, T034 API hissəsi) + `api-cbar` `Cbar.Domain` (T006); MR 2 `web-cbar-admin-new` (qalanları). MR təsvirində deploy sırası: **API əvvəl** (research R13)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (1)** → **Foundational (2)** → story-lər → **Polish (7)**
- Foundational daxilində: T004 → T005 → T006; T009 T005-dən, T010 T009-dan, T011 müstəqil (T009 ilə paralel yazıla bilər, eyni fayl deyil). T012–T014 API-dən asılı deyil

### User Story Dependencies

- **US1 (P1)**: Foundational-dan sonra. API tərəfi (T015–T016) və panel tərəfi (T017–T021) paralel yazıla bilər — panel MSW ilə test olunur
- **US2 (P1)**: panel tərəfi US1-in `restoreSession`/single-flight-dən asılı deyil, amma `auth-bridge.ts`-i paylaşır → US1-dən sonra. API tərəfi US1-in refresh endpoint-idir (yeni API task-ı yoxdur)
- **US3 (P2)**: Foundational-dan sonra; `auth-bridge.ts` üzərində US2 ilə toqquşur → US2-dən sonra
- **US4 (P3)**: yalnız API; T009-dan sonra istənilən vaxt; panel dəyişikliyi yoxdur

### Within Each Story

- A (API) task-ları B-dən əvvəl deploy olunur; kod yazılışı paralel ola bilər
- Eyni fayl (`AuthController.cs`, `auth-bridge.ts`) üzərindəki task-lar ardıcıldır

### Parallel Opportunities

- T002 ∥ T003
- T007 ∥ T008 ∥ T012 ∥ T013 ∥ T014
- US1: T020 ∥ T021 (test faylları); API T015–T016 ∥ panel T017–T019
- US4 (T031–T032) US2/US3 panel işləri ilə paralel
- Polish: T033 ∥ T034 ∥ T035 ∥ T036

---

## Parallel Example: User Story 1

```bash
# API və panel eyni vaxtda:
Task: "T015–T016 AuthController login cookie + refresh endpoint (api-cbar-admin)"
Task: "T017–T019 restoreSession, main.tsx, login route redirect (web-cbar-admin-new)"

# Testlər:
Task: "T020 session-restore.test.tsx"
Task: "T021 api-client.test.ts withCredentials"
```

---

## Implementation Strategy

### MVP (US1 + US2)

US1 tək başına F5 problemini həll edir, amma sessiya hələ 15 dəqiqəyə bağlıdır — istifadəçinin
problemi US1 + US2 ilə tam həll olunur. MVP = Phase 1–4.

1. Phase 1–2 → T015–T021 → F5 yoxlaması (quickstart §4 #1–#3)
2. T022–T026 → 16 dəqiqəlik yoxlama (#4, #6)
3. **STOP & VALIDATE**, `npm run verify`

### Incremental Delivery

1. MVP (US1+US2) → MR-lar → test mühiti (API əvvəl)
2. US3 (logout) → eyni MR-lara və ya ayrıca
3. US4 (admin ləğvi) — yalnız API
4. Polish + Q1/Q2a təsdiqindən sonra prod host dəyişikliyi (DevOps)

---

## Notes

- `test` branch-inə push = avtomatik test deploy-u; T001-dəki feature branch-dən MR ilə işlə
- Token, refresh dəyəri və hash heç vaxt log, audit, URL və ya storage-a düşmür
- Azərbaycan hərfli fayllar (locales, spec-lər) yalnız UTF-8 saxlayan alətlə yazılır (Konstitusiya V.5)
- Q1 / Q2a fərqli cavablansa: yalnız T007 dəyərləri və T034 dəyişir
