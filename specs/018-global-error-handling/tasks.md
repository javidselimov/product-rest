---

description: "Task list — Admin API-də qlobal xəta idarəsi və vahid xəta forması"
---

# Tasks: Admin API-də qlobal xəta idarəsi və vahid xəta forması

**Input**: Design documents from `specs/018-global-error-handling/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md),
[data-model.md](./data-model.md), [contracts/error-response.md](./contracts/error-response.md),
[quickstart.md](./quickstart.md)

**Tests**: avtomatik test task-ı yoxdur — API-də test yığını yoxdur (Konstitusiya VIII.1),
spec də tələb etmir. Verification = GitLab pipeline build + `test` mühitində
[quickstart.md](./quickstart.md) ssenariləri.

**Organization**: task-lar user story-lərə görə qruplaşdırılıb.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: paralel icra oluna bilər (fərqli fayllar, bitməmiş task-dan asılılıq yoxdur)
- **[Story]**: US1–US4 (spec.md)

## Path Conventions

Bütün yollar `product-rest/api-cbar-admin/`-ə nisbidir (aşağıda `API/` kimi qısaldılır):
`API/src/Cbar.AdminApi/…`, `API/openapi/…`. Panel: `product-rest/web-cbar-admin-new/`.

**Ümumi qaydalar (hər kod task-ına aiddir)**

- Lokalda .NET SDK yoxdur: kod build olunmadan yazılır, build GitLab `test` pipeline-ında
  yoxlanılır. `using`-ləri unutmayın: `Npgsql`, `Microsoft.AspNetCore.Diagnostics`,
  `Microsoft.AspNetCore.Mvc`, `Microsoft.AspNetCore.Http`, `Microsoft.EntityFrameworkCore`.
- Status kodları və mesaj mətnləri **bayt-bayt dəyişmir** (FR-012). Gövdəsiz `NotFound()`
  çağırışlarına **toxunulmur** (research R1).
- Yeni mətnlər ingiliscədir, [contracts/error-response.md](./contracts/error-response.md)
  cədvəlindəki kimi hərfi.
- Azərbaycan hərfli fayllar yalnız Edit/Write aləti ilə yazılır (Konstitusiya V.5).
- Spec-first hook (`.claude/hooks/spec-first.mjs`) route dəyişmədiyi üçün keçir; xatırlatma
  çıxarsa, OpenAPI artıq Phase 2-də yenilənib.

---

## Phase 1: Setup (deploy-dan əvvəl ölçmə)

**Purpose**: dizaynın əsaslandığı faktları `test` mühitində təsdiqləmək və "bu gün 500"
iddiasını sübut etmək — kod yazmazdan **əvvəl**.

- [ ] T001 `test` bazasında [quickstart.md §0](./quickstart.md) SQL-ini işlət (DB çıxışı olan şəxsdən xahiş et); nəticəni [data-model.md §3](./data-model.md) ilə müqayisə et — 5 `*_locale_slug_key`, 25 `*_locale_fkey`, `users_username_key`, `users_email_key`, `media_assets_storage_key_key`. Fərq varsa `specs/018-global-error-handling/data-model.md` §3 və `contracts/error-response.md` cədvəlini düzəlt, sonra davam et
- [ ] T002 Köhnə versiyada [quickstart.md §1](./quickstart.md) baseline-ı çıxar: §2a–f, §4 sorğularının status/`Content-Type`/gövdəsini `specs/018-global-error-handling/baseline.md`-yə yaz (tarix, commit `1de2eb2`)

**Checkpoint**: məhdudiyyət adları təsdiqlənib, baseline qeyd olunub.

---

## Phase 2: Foundational (spec-first kontrakt + ortaq infrastruktur)

**Purpose**: OpenAPI kontraktı (spec-first) və bütün story-lərin istifadə etdiyi ProblemDetails
infrastrukturu.

**⚠️ CRITICAL**: OpenAPI (T003–T009) təsdiqlənmədən controller koduna başlanmır.

### OpenAPI (spec-first, FR-015)

- [X] T003 `API/openapi/components/schemas/common.yaml`-da `ProblemDetails`-i genişlət: `required: [type, status, traceId]` (`title` artıq məcburi deyil; təsvir: "401/403/5xx-də `message` yoxdursa buraxılır"); yeni optional property-lər `message` (string, "keçid sahəsi — bugünkü mətn"), `code` (`enum: [refresh_missing, refresh_stale, origin_forbidden]`), `field` (string), `locale` (string); `type` təsvirinə `urn:cbar:problem:unique-violation | reference-missing | reference-in-use | value-too-long | value-out-of-range | value-required | value-rejected` siyahısı; `description`-ı "RFC 9457, every 4xx/5xx of this API" et. `ValidationProblemDetails`-ə toxunma. `ErrorMessage` sxemini **sil**
- [X] T004 `API/openapi/components/schemas/auth.yaml`-da `OriginError`-u `allOf: [$ref common.yaml#/ProblemDetails]` + `code: const origin_forbidden` + `required: [message, code]` et
- [X] T005 `API/openapi/components/responses.yaml`: `BusinessRule` → yalnız `application/problem+json` (`ValidationProblemDetails` ilə `ProblemDetails`-in `oneOf`-u; təsvir: "binding failure carries `errors`, a business rule carries `message`"), `application/json` variantını sil; `Conflict` → `application/problem+json` `ProblemDetails`, təsvirə "also a concurrent duplicate (unique-violation) or a delete of still-referenced data (reference-in-use)"; `Unauthorized` və `Forbidden` → `application/problem+json` `ProblemDetails` gövdəsi (təsvir: "no `title` unless `message` is present"), `WWW-Authenticate` başlığı qalır; `OriginForbidden` content-type-ı `application/problem+json`; yeni `ServerError` (500, `ProblemDetails`, "no internal details; use `traceId`") və `PayloadTooLarge` (413, `ProblemDetails`)
- [X] T006 [P] `API/openapi/paths/auth.yaml` (sətir ~44, ~59) və `API/openapi/paths/statistics.yaml` (~48): `application/json` + `ErrorMessage` → `application/problem+json` + `ProblemDetails` (`required: [message]` allOf ilə); login 401/429, refresh 401 (`code` enum-un `refresh_missing`/`refresh_stale` hissəsi) təsvirləri bugünkü mətnlərlə
- [X] T007 [P] `API/openapi/paths/media.yaml`: ~163-dəki `ErrorMessage` → `ProblemDetails`; preview 415 cavabına `mimeType` property-li `ProblemDetails`; upload (`POST /media`) cavabına `413: PayloadTooLarge` və təsvirə "identical bytes — including two concurrent uploads — return the existing asset (200)"
- [X] T008 [P] Slug-lı və istifadəçi yazma əməliyyatlarına cavab əlavə et (yoxdursa): `API/openapi/paths/pages.yaml`, `press-releases.yaml`, `laws.yaml`, `money-marks.yaml` (money marks + money-mark news) `POST`/`PUT` → `'409': $ref Conflict`, `'400': $ref BusinessRule`; `API/openapi/paths/users.yaml` `POST`/`PUT` → `409` təsvirinə "`errors.Username` / `errors.Email`"; digər tərcüməli yazma əməliyyatlarında (`homepage.yaml`, `law-categories.yaml`, `meas.yaml`, `media-content.yaml`, `misc.yaml`, `organization.yaml`, `settings.yaml`, `statistics.yaml`) `400: BusinessRule` yoxdursa əlavə et; hər `DELETE` əməliyyatında `409: Conflict` yoxdursa əlavə et (reference-in-use)
- [X] T009 `API/openapi/openapi.yaml`: `info.description`-da "Errors come in three shapes…" bəndini bir forma ilə əvəz et (problem+json; `message`/`code` keçid sahələri; `title` 401/403/5xx-də `message`-siz buraxılır; istənilən əməliyyat `500 ServerError` qaytara bilər, `traceId` ilə); `x-known-issues`: "Error bodies are inconsistent…" bəndini **sil**; "No input validation beyond binding…" bəndində "fail in PostgreSQL and surface as 500 (there is no exception handler)" → "are rejected by PostgreSQL and answered 400 without naming the field (field-level validation is #8b)"; "Media upload deduplicates with `SingleOrDefault`…" bəndində 500 hissəsini sil, yalnız "The file is buffered fully in memory (up to 250 MB)." qalsın
  > **İcra qeydləri (T003–T009, 2026-10-06)** — plandan fərqlər:
  > - `code` enum-u **6 dəyərdir**, 3 yox: refresh 401 həm də `refresh_invalid`, `refresh_reused`, `refresh_expired` qaytarır (`RefreshTokenService`, `SessionError` sxemi). Spec, research, data-model, contract düzəldilib.
  > - `ErrorMessage` silinmədi, `ProblemDetails` + məcburi `message`/`detail` kimi yenidən təyin olundu — path-lardakı istinadlar düzgün qalır və "biznes xətasında `message` mütləq var" kontraktı daha dəqiqdir. `SessionError`, `OriginError`, `MediaPreviewUnsupported` da `allOf ProblemDetails` oldu.
  > - `BusinessRule`-da `oneOf` əvəzinə `anyOf` — 8b `ValidationProblemDetails`-ə `message` əlavə edəndə iki variant birlikdə uyğun gələcək.
  > - `DELETE`-lərə 409 **əlavə olunmadı**: cascade olmayan FK-si olan hard-delete-lər (law categories, MEAS emitents/info types, money-mark categories) artıq 409 sənədləyir; qalanları soft-delete və ya yalnız `ON DELETE CASCADE` istinadlıdır — FK pozuntusu mümkün deyil. Tərcüməli yazmaların hamısında 400 artıq var idi.
  > - Əlavə: `{id}` route constraint-lərinin "(404, empty body)" təsviri → "problem details without `message`" (`UseStatusCodePages`); `settings.yaml`, `users.yaml`-da `{ message }` ifadələri.
- [X] T010 `API/openapi`-də `npm run lint` və `npm run bundle` (korporativ CA: `NODE_EXTRA_CA_CERTS`); `grep -rn ErrorMessage API/openapi/components API/openapi/paths API/openapi/openapi.yaml` → 0. `dist/openapi.yaml`, `dist/openapi.json` yenilənib. **İstifadəçi təsdiqi** — sonra T011+

### Ortaq infrastruktur

- [X] T011 [P] `API/src/Cbar.AdminApi/Errors/ProblemDetailsSetup.cs` yarat: `public static class ProblemDetailsSetup` — `public static void Customize(ProblemDetailsOptions o)` `o.CustomizeProblemDetails = ctx => { … }` təyin edir: `status = ctx.ProblemDetails.Status ?? ctx.HttpContext.Response.StatusCode`; `(status is 401 or 403 or >= 500) && !ctx.ProblemDetails.Extensions.ContainsKey("message")` olduqda `ctx.ProblemDetails.Title = null` (R5 — panelin lokallaşdırılmış mesajı; XML şərhində aradan qaldırma şərti: panel uyğunlaşmasından sonra); `status >= 500` və `Detail` boşdursa `Detail = "An unexpected error occurred."`. Əlavə `public static int SelectStatusCode(Exception ex) => ex is BadHttpRequestException b ? b.StatusCode : StatusCodes.Status500InternalServerError;` (R9)
- [X] T012 [P] `API/src/Cbar.AdminApi/Errors/CbarControllerBase.cs` yarat: `public abstract class CbarControllerBase : ControllerBase` — `protected ObjectResult ErrorProblem(int status, string message, string? code = null, IReadOnlyDictionary<string, object?>? extensions = null)`: `var pd = ProblemDetailsFactory.CreateProblemDetails(HttpContext, status, detail: message);` → `pd.Title ??= ReasonPhrases.GetReasonPhrase(status);` (factory customize-ı `message` əlavə olunmazdan əvvəl çağırır, `title` itməsin) → `pd.Extensions["message"] = message;` → `code` varsa `pd.Extensions["code"] = code;` → `extensions`-i köçür → `return new ObjectResult(pd) { StatusCode = status, ContentTypes = { "application/problem+json" } };`. Qısa formalar: `BadRequestProblem(string message)` (400), `ConflictProblem(string message)` (409), `NotFoundProblem(string message)` (404). XML şərhi: niyə `message` (keçid, R5) və niyə yeni `code` yoxdur (FR-011)
- [X] T013 `API/src/Cbar.AdminApi/Program.cs`: `builder.Services.AddProblemDetails(ProblemDetailsSetup.Customize);` (`AddControllers`-dən əvvəl); Serilog konsol: `.WriteTo.Console(outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] {TraceId} {Message:lj}{NewLine}{Exception}")` (R10); pipeline-da `app.UseSerilogRequestLogging();`-dən **dərhal sonra** `app.UseExceptionHandler(new ExceptionHandlerOptions { StatusCodeSelector = ProblemDetailsSetup.SelectStatusCode });` və `app.UseStatusCodePages();` (sıra plan.md "Pipeline sırası" — request logging xaricdə qalır, R3). Hər əlavənin üstünə bir sətirlik şərh (mövcud üslubda, spec 018-ə istinadla)

**Checkpoint**: OpenAPI təsdiqlənib; işlənməmiş istisna artıq boş 500 deyil, gövdəsiz 401/403
ProblemDetails-dir. Controller-lər hələ köhnə formadadır — bu, ara vəziyyət kimi deploy oluna bilər.

---

## Phase 3: User Story 1 — DB-nin rədd etdiyi yazma 400/409 verir (Priority: P1) 🎯 MVP

**Goal**: unikal, FK, uzunluq, aralıq, NOT NULL, CHECK pozuntuları 500 yox, 400/409 + vahid
forma; paralel eyni upload mövcud qeydi qaytarır (FR-002–FR-005, Q1 = C).

**Independent Test**: [quickstart.md §2](./quickstart.md) a–g.

- [X] T014 [P] [US1] `API/src/Cbar.AdminApi/Errors/DbErrorMapping.cs` yarat — saf funksiya, DI yoxdur: `public sealed record DbProblem(int Status, string Type, string Message, string? Field = null, string? Locale = null, IReadOnlyDictionary<string, string[]>? Errors = null);` və `public static class DbErrorMapping { public static PostgresException? FindPostgres(Exception ex); public static DbProblem? Map(PostgresException pg, string httpMethod, DbUpdateException? update); }`. `FindPostgres` `InnerException` zəncirini gəzir. `Map` qaydaları [data-model.md §2](./data-model.md) sırası ilə, `PostgresErrorCodes` sabitləri ilə (`UniqueViolation`, `ForeignKeyViolation`, `StringDataRightTruncation`, `NumericValueOutOfRange`, `NotNullViolation`, `CheckViolation`); mətnlər və `type`-lar [contracts/error-response.md "DB xətası → cavab"](./contracts/error-response.md) cədvəlindən hərfi. Unikal: `ConstraintName` `EndsWith("_locale_slug_key")` → `Field = "slug"`, `Locale` = `update?.Entries`-də `Metadata.GetTableName() == pg.TableName` olan entry-lərin `"Locale"` property dəyərləri birmənalıdırsa; `users_username_key` → `Errors = { ["Username"] = [msg] }`; `users_email_key` → metod `PUT` isə "Email is already in use.", əks halda "Username or email is already in use.", `Errors = { ["Email"] = [msg] }`. FK: `HttpMethods.IsDelete(method)` → 409 reference-in-use; əks halda `ConstraintName` `EndsWith("_locale_fkey")` → "Unknown locale.", qalanları "A referenced item does not exist." (400). Tanınmayan `SqlState` → `null`. Cavaba heç bir DB adı/mətni qoyulmur (FR-007)
- [X] T015 [US1] `API/src/Cbar.AdminApi/Errors/DbExceptionHandler.cs` yarat: `public sealed class DbExceptionHandler(IProblemDetailsService problemDetails, ILogger<DbExceptionHandler> logger) : IExceptionHandler`. `TryHandleAsync`: (1) `ctx.RequestAborted.IsCancellationRequested && ex is OperationCanceledException or IOException` → `ctx.Response.StatusCode = 499`, `LogDebug`, `return true` (FR-008, R9); (2) `DbErrorMapping.FindPostgres(ex)` null → `false`; (3) `Map(...)` null → `false` (daxili 500 yolu + Error logu, R3); (4) `LogWarning("Database rejected {Method} {Path}: {SqlState} {Constraint} on {Table} → {Status}", …)` (FR-006 — Error yox); `ProblemDetails { Status, Type, Title = ReasonPhrases.GetReasonPhrase(status), Detail = Message }`, `Extensions["message"] = Message`, `field`/`locale`/`errors` (null olmayanlar); `ctx.Response.StatusCode = status`; `if (!await problemDetails.TryWriteAsync(new() { HttpContext = ctx, ProblemDetails = pd, Exception = ex })) await ctx.Response.WriteAsJsonAsync(pd, (JsonSerializerOptions?)null, "application/problem+json", ct);` → `return true`
- [X] T016 [US1] `API/src/Cbar.AdminApi/Program.cs`: `builder.Services.AddExceptionHandler<DbExceptionHandler>();` (`AddProblemDetails`-dən sonra) (depends on T013, T015)
- [X] T017 [US1] `API/src/Cbar.AdminApi/Controllers/MediaController.cs` `Upload` (R7, [data-model.md §4](./data-model.md)): (a) `IgnoreQueryFilters().SingleOrDefaultAsync(m => m.ChecksumSha256 == checksum)` → `Where(m => m.ChecksumSha256 == checksum).OrderBy(m => m.DeletedAt != null).ThenBy(m => m.Id).FirstOrDefaultAsync()` — axtarışı və "mövcud qeyd → bərpa + `media.restore` → `Ok(...)`" blokunu lokal funksiyaya (`async Task<IActionResult?> ReturnExisting()`) çıxar ki, iki yerdən çağırılsın; mövcud şərhi "SingleOrDefault" əvəzinə "legacy duplicates → oldest live row" ilə yenilə; (b) yeni qeydin birinci `await db.SaveChangesAsync();`-ini `try { … } catch (DbUpdateException ex) when (DbErrorMapping.FindPostgres(ex) is { SqlState: PostgresErrorCodes.UniqueViolation, ConstraintName: "media_assets_storage_key_key" }) { db.ChangeTracker.Clear(); return await ReturnExisting() ?? throw; }` ilə əhatələ; şərh: "a concurrent identical upload won the insert; the object in storage has the same bytes" (Q1 = C)
- [ ] T018 [US1] `test`-ə push (pipeline yaşıl) → [quickstart.md §2](./quickstart.md) a–g; nəticəni T002 baseline-ı ilə yan-yana `specs/018-global-error-handling/baseline.md`-yə əlavə et. 500 qalan hal varsa → T014/T017-yə qayıt

**Checkpoint**: SC-001 (5/5) — US1 müstəqil çatdırıla bilər.

---

## Phase 4: User Story 2 — Gözlənilməz xəta vahid, izlənə bilən, detalsız (Priority: P1)

**Goal**: 500 vahid formada, `traceId` logda tapılır, daxili detal yoxdur, müştəri kəsilməsi
500 deyil (FR-001, FR-006–FR-008).

**Independent Test**: [quickstart.md §3](./quickstart.md).

Kod Phase 2 (T011, T013) və T015-dədir; bu faza yoxlama və düzəlişdir.

- [ ] T019 [US2] `test`-də [quickstart.md §3.1–§3.2](./quickstart.md): DevOps ilə razılaşdırılmış qısa MinIO kəsilməsində yeni fayl upload-u → 500 gövdəsində `type`, `status`, `detail`, `traceId` var, `title`/SQL/stack trace yoxdur; `traceId`-nin orta 32 simvolu pod logunda Error + stack trace ilə 1 dəqiqədən az vaxtda tapılır. Log sətrində `TraceId` boşdursa → `API/src/Cbar.AdminApi/Program.cs` şablonuna `{RequestId}` əlavə et və R10-u `research.md`-də yenilə
- [ ] T020 [US2] `test`-də [quickstart.md §3.3–§3.5](./quickstart.md): §2 hallarında log səviyyəsi Warning; 409/500 cavablarında `Access-Control-Allow-Origin` (`-H 'Origin: <panel origin>'`) var; böyük upload-un yarıda kəsilməsi Error logu vermir. CORS başlığı itirsə → `API/src/Cbar.AdminApi/Program.cs`-də `UseCors`-u `UseExceptionHandler`-dən əvvələ köçürməyi sına və `research.md` R9-u yenilə
- [ ] T021 [US2] `test` mühitində (Staging) və `ASPNETCORE_ENVIRONMENT` Production olan istənilən yoxlanıla bilən mühitdə §2 və §3 cavablarında `SqlState`, məhdudiyyət/cədvəl adı, `Npgsql`, `at Cbar.` sətirləri **yoxdur** (`grep`) — SC-003; nəticəni `specs/018-global-error-handling/baseline.md`-yə yaz

**Checkpoint**: SC-003, SC-004 yoxlanılıb.

---

## Phase 5: User Story 3 — Bütün xəta cavabları bir formadadır (Priority: P2)

**Goal**: controller-lərin əl ilə yazdığı ~122 `new { message … }` cavabı vahid formaya keçir
(FR-009, FR-012, FR-013); status və mətnlər dəyişmir.

**Independent Test**: [quickstart.md §4](./quickstart.md) + `grep -rn "new { message" API/src/Cbar.AdminApi/Controllers` → 0.

**Hər task üçün eyni əməliyyat**: faylın hər `[ApiController]` sinfində `: ControllerBase` →
`: CbarControllerBase` (`using Cbar.AdminApi.Errors;`); `BadRequest(new { message = X })` →
`BadRequestProblem(X)`, `Conflict(new { message = X })` → `ConflictProblem(X)`,
`NotFound(new { message = X })` → `NotFoundProblem(X)`. Çoxsətirli çağırışlar əl ilə. `X` ifadəsi
(interpolasiya daxil) hərfi saxlanılır. Gövdəsiz `NotFound()`/`NoContent()`/`Ok()` toxunulmur.
Sonda faylda `new { message` qalmamalıdır. Sayı mötərizədə (`grep -c "new { message"`, sinif sayı).

- [X] T022 [P] [US3] `API/src/Cbar.AdminApi/Controllers/AuthController.cs` (4, 1 sinif): sətir ~43 `StatusCode(429, new { message = "Too many login attempts. Try again later." })` → `ErrorProblem(StatusCodes.Status429TooManyRequests, "Too many login attempts. Try again later.")` (`Retry-After` başlığı varsa saxla); ~64 `Unauthorized(new { message = "Invalid credentials." })` → `ErrorProblem(401, "Invalid credentials.")`; ~213 → `ErrorProblem(StatusCodes.Status403Forbidden, "Origin not allowed.", "origin_forbidden")`; ~216 `Rejected(string code)` → qaytarma tipi `ObjectResult`, `ErrorProblem(401, "Session expired.", code)`. Çağıran metodların imzası (`ActionResult<LoginResponse>`, `IActionResult`) `ObjectResult` ilə uyğun qalır. **Vaxt profili** (spec 011): yalnız cavab obyekti dəyişir, `LoginProtection`/bcrypt çağırış sırasına toxunma (FR-014)
- [X] T023 [P] [US3] `API/src/Cbar.AdminApi/Controllers/MediaController.cs` (6, 1): ~79 `StatusCode(415, new { message = "Preview is available for images only.", mimeType = asset.MimeType })` → `ErrorProblem(StatusCodes.Status415UnsupportedMediaType, "Preview is available for images only.", extensions: new Dictionary<string, object?> { ["mimeType"] = asset.MimeType })`; ~120 `catch` içindəki `NotFound(new { message = "Not found." })` → `NotFoundProblem("Not found.")` (`Cache-Control: no-store` qalır); qalan `BadRequest`/`Conflict`-lər standart qayda ilə (depends on T017 — eyni fayl)
- [X] T024 [P] [US3] `API/src/Cbar.AdminApi/Controllers/UsersController.cs` (12, 1) — standart qayda; `"Username or email is already in use."`, `"Email is already in use."`, son-admin 409 mətnləri hərfi
- [X] T025 [P] [US3] `API/src/Cbar.AdminApi/Controllers/PagesController.cs` (14, 1) — standart qayda, o cümlədən "Moving pages is not supported yet…" və "Page has children…"
- [X] T026 [P] [US3] `API/src/Cbar.AdminApi/Controllers/OrganizationController.cs` (10, 3 sinif) və `MoneyMarksController.cs` (9, 3 sinif) — standart qayda, hər faylda **bütün** siniflər
- [X] T027 [P] [US3] `API/src/Cbar.AdminApi/Controllers/LawsController.cs` (6), `LawCategoriesController.cs` (3), `PressReleasesController.cs` (3), `MeasDocumentsController.cs` (3), `MeasLookupsController.cs` (6, 2 sinif) — standart qayda
- [X] T028 [P] [US3] `API/src/Cbar.AdminApi/Controllers/GalleriesController.cs` (5), `VideosController.cs` (2), `VideoStreamsController.cs` (2), `BannersController.cs` (4), `NewsSliderController.cs` (4), `ImagePopupsController.cs` (2) — standart qayda
- [X] T029 [P] [US3] `API/src/Cbar.AdminApi/Controllers/HomepageLinksController.cs` (2), `HomepagePublicationsController.cs` (4), `RunningLinesController.cs` (2), `InfoLinesController.cs` (4), `SettingsController.cs` (1) — standart qayda
- [X] T030 [P] [US3] `API/src/Cbar.AdminApi/Controllers/AzirController.cs` (1), `CurrenciesController.cs` (1), `CurrencyRatesController.cs` (3), `InflationController.cs` (5), `YieldCurvesController.cs` (4) — standart qayda
- [X] T031 [US3] Yoxlama (T022–T030-dan sonra): `grep -rn "new { message" API/src/Cbar.AdminApi/Controllers` → 0; `grep -rn ": ControllerBase" API/src/Cbar.AdminApi/Controllers` → 0; `grep -rn "message = \|code = " API/src/Cbar.AdminApi/Controllers` yalnız uğurlu cavab gövdələrində qalır. `git diff --stat` ilə hər faylda yalnız gözlənilən sətirlərin dəyişdiyinə bax (mətnlər hərfi)
- [ ] T032 [US3] `test`-ə push → [quickstart.md §4](./quickstart.md) cədvəli tam; `cd API/openapi && API_URL=https://api-cbar-admin-test.cbar.az ADMIN_USER=… ADMIN_PASSWORD=… node scripts/contract-check.mjs` yaşıl (SC-002, SC-006)

**Checkpoint**: SC-002, SC-006.

---

## Phase 6: User Story 4 — Admin panel dəyişmədən işləyir (Priority: P2)

**Goal**: dəyişməmiş `web-cbar-admin-new` yeni API ilə bu günkü mesajları göstərir (FR-010,
FR-011, SC-005). Kod dəyişikliyi yoxdur — keçid qaydaları T011/T012-dədir.

**Independent Test**: [quickstart.md §5](./quickstart.md).

- [X] T033 [P] [US4] `product-rest/web-cbar-admin-new`-də **heç bir dəyişiklik etmədən** `npm run verify` (Node 22 ilə də — CI node:22) yaşıl; `src/shared/api/types.ts`-in yeni gövdələri (`title`-sız 401, `message`+`detail`, `errors.Username`) düzgün normalizə etdiyini kodu oxuyaraq təsdiqlə və `specs/018-global-error-handling/baseline.md`-yə qeyd et
- [ ] T034 [US4] `test` panelində [quickstart.md §5](./quickstart.md) 1–6 ssenariləri (T032-dən sonra): biznes mesajları eyni, 401/403/500-də panelin azərbaycanca mesajı, `refresh_stale` təkrarı işləyir, binding sahə xətaları yerində. İngiliscə `title` görünən ekran varsa → T011 qaydasını düzəlt

**Checkpoint**: SC-005.

---

## Phase 7: Polish & Cross-Cutting Concerns

- [X] T035 [P] `api-admin-review.md` #7-yə "**Vəziyyət:** `specs/018-global-error-handling` — …" sətri (nə edildi, nə qaldı: panel uyğunlaşması ayrıca task, `title` keçid qaydası, checksum `UNIQUE` edilmədi); #8b "qərar gözləyir" siyahısındakı "(2) #7 birləşsin" şərtini ✅ et; "Tövsiyə olunan sıra"-da #7-ni işarələ
- [X] T036 [P] `specs/016-input-validation-paging/contracts/validation-error.md` və `research.md`-də 8b-nin bu spec-dən asılı hissələrinə qeyd: 400 köməkçisi `Errors/CbarControllerBase.cs` (`BadRequestProblem`), DB fallback `Errors/DbErrorMapping.cs`; `ValidationProblemDetails`-ə `message` əlavəsi hələ 8b-dədir (018 R5)
- [X] T037 [P] Root `CLAUDE.md` "api-cbar-admin (CMS API)" bölməsinə bir abzas: xətalar `application/problem+json`; controller-lər `CbarControllerBase` köməkçilərini işlədir (`new { message }` yox); DB pozuntuları `Errors/DbExceptionHandler` tərəfindən 400/409-a xəritələnir; 401/403/5xx `message`-siz olanda `title` keçid üçün buraxılır
- [X] T038 `/sync-openapi api-cbar-admin` (inkremental) — controller dəyişikliklərindən sonra spec ilə drift yoxdur; `API/openapi/openapi.yaml`-ın `# Sync:` sətri yenilənir
- [ ] T039 Deploy-dan bir həftə sonra (SC-007): `test` (və prod deploy olunubsa prod) loglarında unikal/FK/uzunluq səbəbli 500 sayı 0; nəticə `api-admin-review.md` #7 "Vəziyyət"-ə

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (T001–T002)**: dərhal; T001 nəticəsi T014-ün girişidir, T002 deploy-dan **əvvəl** olmalıdır
- **Phase 2**: T003–T009 → T010 (lint/bundle + təsdiq) → T011, T012 [P] → T013
- **US1 (Phase 3)**: Phase 2-dən sonra. T014 → T015 → T016; T017 T014-dən sonra; T018 sonda
- **US2 (Phase 4)**: T013 + T015-dən sonra (kod yoxdur, yalnız yoxlama); T018 ilə eyni deploy-da
- **US3 (Phase 5)**: T012-dən sonra; T023 T017-dən sonra (eyni fayl); T031 → T032
- **US4 (Phase 6)**: T033 istənilən vaxt; T034 T032-dən sonra
- **Polish**: T035–T037 [P] T032-dən sonra; T038 T031-dən sonra; T039 deploy + 1 həftə

### User Story Dependencies

- **US1** — müstəqil (Phase 2 infrastrukturu kifayətdir); MVP
- **US2** — US1 ilə eyni koda söykənir (T015), ayrıca kod yoxdur
- **US3** — müstəqil; US1-siz də çatdırıla bilər (yalnız T012 lazımdır)
- **US4** — US3 tamamlanandan sonra mənalıdır (yeni gövdələr panelə çatanda)

### Parallel Opportunities

- T006, T007, T008 — fərqli OpenAPI faylları
- T011, T012 — fərqli yeni fayllar; T014 da onlarla paralel (fərqli fayl)
- T022–T030 — hamısı fərqli controller faylları (T023 T017-dən sonra)
- T033 — panel repo-su, hər şeylə paralel
- T035, T036, T037 — fərqli sənədlər

---

## Parallel Example: User Story 3

```bash
Task: "T022 AuthController.cs — ErrorProblem çağırışları"
Task: "T024 UsersController.cs — standart qayda"
Task: "T025 PagesController.cs — standart qayda"
Task: "T026 OrganizationController.cs + MoneyMarksController.cs"
Task: "T027 Laws / LawCategories / PressReleases / MeasDocuments / MeasLookups"
Task: "T028 Galleries / Videos / VideoStreams / Banners / NewsSlider / ImagePopups"
Task: "T029 HomepageLinks / HomepagePublications / RunningLines / InfoLines / Settings"
Task: "T030 Azir / Currencies / CurrencyRates / Inflation / YieldCurves"
```

---

## Implementation Strategy

### MVP First (US1)

1. Phase 1 (ölçmə) → Phase 2 (OpenAPI təsdiqi + infrastruktur)
2. Phase 3 (US1) → `test`-ə push → quickstart §2
3. **STOP and VALIDATE**: 500-lər 400/409 olub, paralel upload eyni qeydi qaytarır

### Incremental Delivery

1. Phase 2 tək başına deploy oluna bilər: boş 500/401/403 yox olur, controller-lər köhnə formada
2. + US1/US2 → DB xətaları və izlənə bilən 500
3. + US3 → vahid forma, OpenAPI drift yoxdur
4. + US4 → panel yoxlaması; sonra spec 016 8b başlaya bilər

### Commit-lər

Bir MR (`api-cbar-admin`), plan.md "İcra sırası" ilə commit-lər: OpenAPI → infrastruktur →
DB handler + media → controller-lər → sənədlər. Commit yalnız istifadəçi istəyəndə.

---

## Notes

- [P] = fərqli fayllar, asılılıq yoxdur
- Hər yoxlama task-ı nəticəsini `specs/018-global-error-handling/baseline.md`-yə yazır — "işləyəcək" verification deyil (Konstitusiya VIII.1)
- Mətnlərə toxunmaq, `NotFound()`-ları dəyişmək, binding 400-ünə `message` əlavə etmək bu spec-in əhatəsində **deyil**
