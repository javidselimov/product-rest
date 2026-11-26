# Research: Admin API-də qlobal xəta idarəsi və vahid xəta forması

**Spec**: [spec.md](./spec.md) · **Plan**: [plan.md](./plan.md) · **Tarix**: 2026-10-06

Bütün sətir istinadları `product-rest/api-cbar-admin/` kökünə nisbidir, 2026-10-06 (`1de2eb2`)
vəziyyətinə görə. "✔ yoxlanılıb" — kodda və ya Microsoft sənədində təsdiqlənib; "⚠ test-də
yoxlanılacaq" — lokalda .NET SDK olmadığı üçün davranış `test` mühitində təsdiqlənir
([quickstart.md](./quickstart.md)).

## R1 — Bu gün nə var

**Faktlar** (✔ yoxlanılıb)

- `Program.cs`-də `AddProblemDetails`, `UseExceptionHandler`, `UseStatusCodePages`,
  `IExceptionHandler` yoxdur. Pipeline: `UseSerilogRequestLogging` → (`MapOpenApi`) →
  `UseCors` → `UseAuthentication` → `UseAuthorization` → `MapControllers`.
- Kodda bir `catch` var: `MediaController.cs:117` (preview — anbarda obyekt yoxdursa 404).
  `DbUpdateException` / `PostgresException` heç yerdə tutulmur.
- 32 controller sinfi (27 fayl), hamısı `[ApiController]` (spec 016 R1). Buna görə:
  - binding/model xətası → avtomatik 400 `ValidationProblemDetails` (problem+json, `traceId` ilə);
  - **gövdəsiz `NotFound()` runtime-da artıq ProblemDetails-dir** — `[ApiController]`-in
    client-error mapping-i onu `{type, title:"Not Found", status:404, traceId}`-ə çevirir.
    OpenAPI `NotFound` cavabı da bunu sənədləşdirir. Yəni review-un "boş `NotFound()`" dediyi
    kodun formasıdır, cavabın yox; ~94 belə çağırış **dəyişmədən** vahid formaya uyğundur.
- Əl ilə yazılmış gövdələr (təxmini say, `grep`): `BadRequest(new { message … })` ~94,
  `Conflict(new { message … })` ~20, `NotFound(new { message … })` 3,
  `Unauthorized(new { message, code })` 2 (`AuthController.cs:216-217` və bir `{message}`),
  `StatusCode(403, {message, code="origin_forbidden"})` (`AuthController.cs:213`),
  `StatusCode(429, {message})` (`AuthController.cs:43`),
  `StatusCode(415, {message, mimeType})` (`MediaController.cs:79`). Hamısı `application/json`.
- JWT challenge (401) və rol rəddi (403) — boş gövdə; işlənməmiş istisna — boş 500.
- Audit: `AuditService.Log` yalnız `db.AuditLog.Add` edir, çağıranın `SaveChangesAsync`-i ilə
  saxlanılır. Yaratma axınları iki addımlıdır (entity `SaveChanges` → `audit.Log` →
  `SaveChanges`, id lazım olduğu üçün). Birinci `SaveChanges` DB tərəfindən rədd olunursa,
  audit qeydi heç vaxt əlavə olunmur → FR-005 təbii olaraq ödənir. Redaktə axınlarında audit
  eyni `SaveChanges`-dədir → eyni əməliyyatda geri qaytarılır.
- Unikal məhdudiyyətlər (`db/migrations/0001-initial-schema.sql`) inline yazılıb, ad Postgres
  default qaydası ilə yaranır (`<cədvəl>_<sütunlar>_key`, `<cədvəl>_<sütun>_fkey`):
  `users_username_key`, `users_email_key` (`:50-51`), `media_assets_storage_key_key` (`:106`),
  slug: `page_translations`, `press_release_translations`, `law_translations`,
  `money_mark_translations`, `money_mark_news_translations` → `*_locale_slug_key`.
  Locale FK: 25 cədvəldə `locale varchar(5) NOT NULL REFERENCES locales(code)` →
  `*_locale_fkey`. ⚠ Adlar `test` bazasında `pg_constraint`-dən təsdiqlənir (quickstart §0).
- `currency_rates.rate`-də `CHECK (rate > 0)` var (spec 016 R1) — bu gün `<= 0` 500 verir.
- `media_assets.checksum_sha256` **unikal deyil** (`:112`), `storage_key` isə unikaldır və
  `yyyy/MM/<checksum[..16]><ext>` formasındadır (`MediaController.cs:175`).
- `UsersController.Create` (`:77-80`) username/email mövcudluğunu `AnyAsync` ilə yoxlayır,
  sonra yazır — yarış pəncərəsi var. `UniqueSlug.ForAsync` (`Services/SlugService.cs`) eyni:
  oxu → seç → yaz.
- Panel (`web-cbar-admin-new/src/shared/api/types.ts:69-98`):
  `message = body.message ?? (errors ? firstFieldError ?? title : title) ?? i18n(status)`;
  `code = body.code ?? STATUS_CODES[status]`; `fieldErrors = body.fieldErrors ?? toFieldErrors(errors)`.
  `code`-a görə budaqlanma yalnız `auth-bridge.ts:69` (`refresh_stale`). `'CONFLICT'`,
  `'VALIDATION'` kimi status kodlarına test fayllarından başqa heç yerdə baxılmır.

## R2 — Mexanizm: `AddProblemDetails` + `UseExceptionHandler` + bir `IExceptionHandler`

**Decision**: framework-un daxili mexanizmi — yeni NuGet yoxdur.

- `AddProblemDetails(o => o.CustomizeProblemDetails = …)` — bütün avtomatik ProblemDetails
  (exception handler, status code pages, MVC client-error mapping, `ValidationProblemDetails`)
  üçün tək fərdiləşdirmə nöqtəsi (R5).
- `UseExceptionHandler(new ExceptionHandlerOptions { StatusCodeSelector = … })` — handler
  verilməyəndə ProblemDetails yazır (✔ Microsoft sənədi: "Generates a problem details response
  when a custom handler is not defined"; parametrsiz çağırış `AddProblemDetails` olmadan
  startup-da düşür).
- `AddExceptionHandler<DbExceptionHandler>()` — **yalnız** DB xətalarını və müştəri kəsilməsini
  tutur (`true` qaytarır). Qalan hər şey `false` → daxili yol: 500 ProblemDetails + Error logu.
- `UseStatusCodePages()` — gövdəsiz 4xx/5xx cavablarına (JWT 401, rol 403, uyğun gəlməyən route
  404, 405) ProblemDetails yazır; controller-in artıq yazdığı gövdəyə toxunmur (✔ sənəd).

**Alternatives considered**

- *Global MVC exception filter* — middleware-dən (auth, CORS, routing) gələn xətaları tutmur;
  FR-009 "çərçivənin yaratdığı" cavabları da tələb edir. Rədd.
- *Hər `SaveChangesAsync`-i `try/catch` ilə əhatələmək* — ~60 çağırış, unutmağa açıq. Rədd.
  Yeganə istisna — media upload (R7), çünki orada nəticə xəta deyil, uğurdur.
- *Hellang.Middleware.ProblemDetails* və s. — yeni dependency, .NET 8+-da lazım deyil. Rədd.

## R3 — .NET 10: handled istisna loglanmır; log səviyyələri

**Fakt** (✔ [breaking change sənədi](https://learn.microsoft.com/en-us/aspnet/core/breaking-changes/10/exception-handler-diagnostics-suppressed)):
.NET 10-da `IExceptionHandler.TryHandleAsync` `true` qaytaranda middleware istisnanı **loglamır**
və metrikaya yazmır; `false` olanda köhnə davranış (Error logu) qalır.

**Decision**

- `DbExceptionHandler` 4xx-ə xəritələnən hallarda özü **Warning** yazır: SQLSTATE, məhdudiyyət
  adı, cədvəl, status, traceId (FR-006 — Error yox). Bu, istədiyimiz davranışdır: .NET 10
  defoltu ikiqat logu da aradan qaldırır.
- Xəritələnməyən DB xətası (`40P01`, `08xxx` və s.) üçün handler `false` qaytarır → daxili
  Error logu + 500.
- `UseSerilogRequestLogging` pipeline-da **exception handler-dən əvvəl** (xaricdə) qalır. Səbəb:
  daxildə olsaydı, ondan keçən istisnanı 500 kimi Error səviyyəsində loglayardı — 409-a
  çevrilən unikal pozuntu da. Xaricdə olanda yekun statusu (409) görür → Information.

## R4 — Postgres xəta kodu → status xəritəsi

**Decision** (FR-002): `PostgresException` istisna zəncirində axtarılır — `DbUpdateException`
(EF `SaveChanges`) daxilində və ya birbaşa (`ExecuteUpdate/Delete`, raw SQL — 6 yer).

| SQLSTATE | Ad | Status | `type` |
|---|---|---|---|
| `23505` | unique_violation | 409 | `urn:cbar:problem:unique-violation` |
| `23503` | foreign_key_violation | `DELETE` sorğusunda 409, qalanlarda 400 | `urn:cbar:problem:reference-in-use` / `urn:cbar:problem:reference-missing` |
| `22001` | string_data_right_truncation | 400 | `urn:cbar:problem:value-too-long` |
| `22003` | numeric_value_out_of_range | 400 | `urn:cbar:problem:value-out-of-range` |
| `23502` | not_null_violation | 400 | `urn:cbar:problem:value-required` |
| `23514` | check_violation | 400 | `urn:cbar:problem:value-rejected` |
| digər | — | 500 (handler `false`) | default |

- **FK statusu HTTP metoddan**: `DELETE` → istinad olunan qeyd silinmək istənir (409, bugünkü
  "referenced by" yoxlamalarının mənası); `POST/PUT/PATCH` → mövcud olmayan qeydə istinad (400).
  *Alternativ*: `DbUpdateException.Entries`-in `EntityState`-inə baxmaq — `ExecuteDelete`-də
  `Entries` yoxdur, raw SQL-də də; metod hər halda müəyyəndir. Rədd.
- **`type` URN-dir**, URL yox: həll olunan sənəd ünvanı yoxdur (`TODO(devops)` hostları), URN
  RFC 9457 ilə icazəlidir və sabitdir. Ümumi xətalarda ASP.NET-in default `type`-ı (RFC 9110
  bölmə linki) qalır.
- **`22001`-də sütun adı yoxdur** — Postgres bu xəta üçün `column_name` doldurmur. Mesaj ümumidir;
  sahə səviyyəsi 8b-nin işidir (spec Edge Cases).
- **Serialization/deadlock (`40001`, `40P01`), `DbUpdateConcurrencyException`** — spec-ə görə
  500 qalır (concurrency #10-dur).
- **Cavaba daxili detal düşmür** (FR-007): məhdudiyyət, cədvəl adı, `MessageText`, `Detail`
  yalnız loga yazılır. `Detail` Npgsql-də `Include Error Detail` olmadan onsuz da redaktə olunur;
  bu parametr **yandırılmır** — dəyərləri (username, email) loga sızdırardı.

## R5 — Vahid forma və keçid uyğunluğu (FR-009 – FR-011)

**Decision**: RFC 9457 (7807-nin varisi) ProblemDetails, `application/problem+json`, üstəlik
keçid sahələri. Tam kontrakt: [contracts/error-response.md](./contracts/error-response.md).

- `message` — bu gün `message` qaytaran **hər** cavabda eyni mətnlə; `detail` də eyni mətndir
  (standart sahə). Yeni DB-xəritəli cavablarda da `message` var — panel onu göstərir.
- `code` — yalnız bugünkü dəyərlər: `refresh_missing`, `refresh_stale`, `refresh_invalid`,
  `refresh_reused`, `refresh_expired` (refresh 401, `RefreshTokenService` nəticəsi) və
  `origin_forbidden` (403). (İlk versiyada "üç" yazılmışdı — icra zamanı `SessionError`
  sxemindən düzəldilib.)
  **Yeni `code` əlavə olunmur**: panel `body.code ?? STATUS_CODES[status]` edir, yeni kod
  status təsnifatını əvəz edərdi (FR-011). Maşın oxuyan təsnifat `type` URN-indədir.
- **401/403/5xx-də `message` yoxdursa `title` buraxılır.** Panel `message` olmayanda `title`-ı
  göstərir; bu gün bu cavablar boş gövdəlidir və panel öz azərbaycanca mesajını göstərir.
  ASP.NET defolt `title`-ı ("Unauthorized", "An error occurred while processing your request.")
  əlavə olunsaydı, panel ingiliscə mətn göstərərdi (FR-010b). `title` RFC 9457-də məcburi
  deyil. `CustomizeProblemDetails`-də: `status ∈ {401, 403} ∪ [500, 599]` və `message`
  extension-ı yoxdursa → `Title = null` (JSON-da yazılmır). `detail` qalır — panel onu oxumur.
  **Aradan qaldırma şərti**: panel uyğunlaşması (ayrıca task) status/`type` əsasında öz mesajını
  seçəndə bu qayda silinə bilər.
- **404 `title: "Not Found"`** bu gün də gəlir və panel onu göstərir — dəyişmir.
- **Binding 400-ü** (`ValidationProblemDetails`) toxunulmur: `message` əlavə olunmur, `errors`
  açar forması eynidir (FR-010c). `message` əlavəsi spec 016 8b-nin qərarıdır
  (`InvalidModelStateResponseFactory`) — panel üst xətanı ilk sahə xətasından `message`-ə
  keçirəcəyi üçün orada qəbul ediləcək.
- `errors` yalnız DTO sahəsinə uyğun gələn DB pozuntularında: `users_username_key` →
  `errors.Username`, `users_email_key` → `errors.Email`. Panel istifadəçi formasında bunu
  sahənin altında göstərir (`user-form.tsx:117`) — bu, reqressiya deyil, yaxşılaşmadır.
- `traceId` — framework defoltu (`Activity.Current.Id`, W3C `00-<trace>-<span>-01`). Hər cavabda.

**Alternatives considered**

- *`message`-i atmaq, paneli eyni vaxtda dəyişmək* — iki MR-ın eyni anda deploy olunmasını
  tələb edir (Konstitusiya II.3), panel task-ı ayrıca planlanıb. Rədd.
- *Yeni `code` dəyərləri (`unique_violation` …)* — FR-011-i pozur (yuxarıda). Rədd; `type` kifayətdir.
- *401/403-ü boş saxlamaq* — FR-009 və SC-002 ilə ziddir. Rədd; `title`-sız ProblemDetails
  həm standarta uyğundur, həm paneli sındırmır.

## R6 — Controller cavablarının vahidləşdirilməsi

**Decision**: abstract `CbarControllerBase : ControllerBase` (`Errors/CbarControllerBase.cs`),
32 sinif ondan törəyir; köməkçilər:

| Bu gün | Sonra |
|---|---|
| `BadRequest(new { message = m })` | `BadRequestProblem(m)` |
| `Conflict(new { message = m })` | `ConflictProblem(m)` |
| `NotFound(new { message = m })` | `NotFoundProblem(m)` |
| `Unauthorized(new { message = m, code })` | `ErrorProblem(401, m, code)` |
| `StatusCode(4xx, new { message = m, … })` | `ErrorProblem(4xx, m, code?, extensions?)` |
| `NotFound()` (gövdəsiz) | **dəyişmir** (R1) |

Köməkçilər `ProblemDetailsFactory.CreateProblemDetails(HttpContext, status, detail: m)`-ni
çağırır (`traceId`, `type`, `title` defoltları və `CustomizeProblemDetails` oradan gəlir),
`message`/`code`/əlavələri extension kimi qoyur, `ObjectResult`-u `application/problem+json`
ilə qaytarır. Status kodları və mətnlər **bayt-bayt eyni** qalır (FR-012).

**Alternatives considered**

- *Extension metodlar* — C#-da `this.` prefiksi tələb edir, ~125 çağırışda səs-küy. Rədd.
- *Controller-ləri olduğu kimi saxlayıb result filter ilə `{message}`-i ProblemDetails-ə
  çevirmək* — anonim tipləri reflection ilə oxumaq, kodda köhnə forma qalır (SC-002). Rədd.

## R7 — FR-004 seçim C: media upload dedup

**Problem** (✔ kod): `MediaController.cs:161-163` `SingleOrDefaultAsync(checksum)` — checksum
unikal deyil:
- köhnə dublikatlar (miqrasiya) və ya ay sərhədində iki upload (fərqli `storage_key`, eyni
  checksum) → `InvalidOperationException` → 500, **ardıcıl** upload-da da;
- eyni ayda iki paralel upload → eyni `storage_key` → `23505` → 500.

**Decision**

1. Axtarış deterministik olur: `Where(checksum) → OrderBy(DeletedAt != null) → ThenBy(Id) →
   FirstOrDefault` — canlı qeyd üstün, sonra ən köhnəsi.
2. Yeni qeydin `SaveChangesAsync`-i ətrafında **lokal** `catch`: `DbUpdateException` +
   `23505` + `media_assets_storage_key_key` → `ChangeTracker.Clear()` → (1)-dəki axtarış →
   bugünkü "mövcud qeyd" yolu (silinibsə bərpa + `media.restore` auditi) → 200. Bu, kodda
   qlobal handler-dən başqa yeganə yeni `catch`-dır: nəticə xəta deyil, uğurdur.
3. Obyekt anbarındakı fayl eyni açarla iki dəfə yazılır — eyni baytlar, zərərsiz.

**Alternatives considered**: checksum-u `UNIQUE` etmək (migration + köhnə dublikatların
birləşdirilməsi) — spec-də əhatədən kənar. Advisory lock (checksum hash) — hər upload-a əlavə
DB çağırışı, ay sərhədi halını yenə həll etmir. Rədd.

## R8 — Slug və username yarışı (FR-003, FR-004)

**Decision**

- `*_locale_slug_key` → 409, `type` unique-violation, `message`:
  *"Another item in this language already uses the same slug. Save again to get a new one."*
  `field: "slug"`, `locale` — yalnız `DbUpdateException.Entries`-dəki həmin cədvəlin bütün
  entry-ləri **bir** locale-ə aiddirsə (əks halda buraxılır; heç vaxt səhv locale verilmir).
  ⚠ EF/Npgsql batch-də `Entries`-in yalnız uğursuz əmri, yoxsa bütün batch-i daşıdığı `test`-də
  görünəcək; hər iki halda qayda doğrudur.
- `users_username_key`, `users_email_key` → 409, `message` = bugünkü ardıcıl mətn
  (`"Username or email is already in use."`; redaktədə email üçün `"Email is already in use."` —
  metod `PUT` olduqda), `errors.Username` / `errors.Email`.
- Siyahıda olmayan unikal məhdudiyyət → 409 *"A record with the same unique value already exists."*
- Avtomatik yenidən cəhd yoxdur (Q1 = C).

## R9 — Çərçivə səviyyəli hallar

- **Müştəri kəsilməsi** (FR-008): `DbExceptionHandler` əvvəlcə yoxlayır:
  `HttpContext.RequestAborted.IsCancellationRequested` və istisna `OperationCanceledException`
  və ya `IOException` → status 499, Debug logu, `true`. Framework-un öz davranışına güvənmirik
  (sənəddə açıq yazılmayıb). ⚠ test-də yoxlanılacaq.
- **Gövdə limiti**: `StatusCodeSelector = ex => ex is BadHttpRequestException b ? b.StatusCode : 500`
  — 413 və digər Kestrel statusları 500-ə düşmür. ⚠ 250 MB-dan böyük upload test-də (istəyə görə).
- **Cavab başlayandan sonra** istisna (media preview stream-i): handler yaza bilmir, bağlantı
  bağlanır — bu gün də belədir, dəyişmir.
- **CORS başlıqları 500-də**: CORS middleware başlıqları `OnStarting`-də qoyur, exception handler
  `Response.Clear()` etsə də qalmalıdır. ⚠ test-də `Access-Control-Allow-Origin` yoxlanılır.
- **Development**: avtomatik `DeveloperExceptionPage` xaricdədir, bizim handler ondan əvvəl tutur
  → Development də eyni cavabı verir, istisna detalı göstərilmir (spec buna icazə verir, tələb
  etmir; SC-003 üçün daha sadədir).
- **`Accept`**: ProblemDetails yalnız `Accept` `application/json`-u əhatə edəndə yazılır. Panel
  (axios) `application/json, text/plain, */*` göndərir. Sırf `text/html` göndərən müştəri boş
  gövdə alır — qəbul olunur.

## R10 — Log-da traceId

**Fakt**: Serilog `WriteTo.Console()` defolt şablonu (`Program.cs:16-19`) `TraceId` çap etmir;
`appsettings*.json`-da və `.ci-cd/*.yaml`-da Serilog konfiqurasiyası yoxdur.

**Decision**: konsol şablonuna `{TraceId}` əlavə olunur:
`[{Timestamp:HH:mm:ss} {Level:u3}] {TraceId} {Message:lj}{NewLine}{Exception}`. Serilog 4
(`Serilog.AspNetCore` 10) `TraceId`-ni `Activity`-dən götürür; cavabdakı `traceId`
(`00-<trace>-<span>-01`) onun 32 simvolluq orta hissəsini daşıyır — logda bu hissə ilə axtarılır
(SC-004). ⚠ `test` log-larında görünməsi təsdiqlənir. *Risk*: log toplayıcısı konsol formatını
parse edirsə — `.ci-cd`-də buna işarə yoxdur; DevOps-a qeyd (plan, Deploy).
