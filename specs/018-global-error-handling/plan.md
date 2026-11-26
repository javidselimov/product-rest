# Implementation Plan: Admin API-də qlobal xəta idarəsi və vahid xəta forması

**Branch**: `018-global-error-handling` (spec qovluğu; iş hazırda `test` branch-indədir) | **Date**: 2026-10-06 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/018-global-error-handling/spec.md`

## Summary

Bir upstream repo (`api-cbar-admin`), bir MR, təxminən 9 SP (8 + Q1=C üçün +1):

- **Qlobal tutucu (~3 SP)** — `AddProblemDetails` + `UseExceptionHandler` + `UseStatusCodePages`
  və bir `DbExceptionHandler : IExceptionHandler`. Handler `PostgresException`-u istisna
  zəncirində tapır və SQLSTATE-ə görə xəritələyir: `23505` → 409, `23503` → 400 (`DELETE`-də
  409), `22001`/`22003`/`23502`/`23514` → 400 (R4). Məlum məhdudiyyətlər (slug, username, email)
  sahəni adlandırır (R8). Qalan hər şey daxili 500 yoluna düşür (ProblemDetails + Error logu).
  Müştəri kəsilməsi 499 olur və Error kimi loglanmır (R9). Yeni dependency yoxdur (R2).
- **Media dedup (~1 SP, Q1 = C)** — checksum axtarışı deterministik `FirstOrDefault` olur; insert-də
  `storage_key` pozuntusu lokal tutulur və mövcud qeyd 200 ilə qaytarılır (R7).
- **Vahid forma (~4 SP)** — `CbarControllerBase` köməkçiləri (`BadRequestProblem`,
  `ConflictProblem`, `NotFoundProblem`, `ErrorProblem`). Təxminən 125 `new { message … }`
  çağırışı mexaniki əvəzlənir; status və mətnlər dəyişmir (R6). Keçid uyğunluğu üçün `message`
  və bugünkü üç `code` qalır. 401/403/5xx `message`-siz olanda `title` buraxılır ki, panel öz
  lokallaşdırılmış mesajını göstərməyə davam etsin (R5). Gövdəsiz `NotFound()` artıq
  ProblemDetails-dir, toxunulmur (R1).
- **OpenAPI (~1 SP, spec-first)** — bir `ProblemDetails` sxemi, `ErrorMessage` silinir,
  `x-known-issues` yenilənir ([contracts/error-response.md](./contracts/error-response.md)).

Spec 016 8b bu planın formasını istifadə edir: `ValidationProblemDetails`-ə `message` əlavəsi və
controller 400-lərinin `errors`-a köçürülməsi orada qalır.

## Technical Context

**Language/Version**: C# / .NET 10 (`api-cbar-admin`)

**Primary Dependencies**: mövcud — ASP.NET Core (`Microsoft.AspNetCore.Diagnostics` framework-un
hissəsidir), EF Core + Npgsql 10 (`PostgresException`, `PostgresErrorCodes`), Serilog.
**Yeni NuGet yoxdur**

**Storage**: PostgreSQL — sxem, migration, `Cbar.Domain` dəyişmir. Yeni sorğu yoxdur (media
axtarışı eyni sorğunun sıralanmış formasıdır)

**Testing**: avtomatik test yoxdur (Konstitusiya VIII.1); GitLab `test` → pipeline build + deploy,
sonra `test` mühitində `curl` (paralel sorğularla) + panel + `openapi/scripts/contract-check.mjs`
([quickstart.md](./quickstart.md)). Baseline (§1) deploy-dan **əvvəl**

**Target Platform**: Linux konteyner (k8s), ingress arxasında

**Project Type**: web-service (bir upstream repo, bir MR)

**Performance Goals**: uğurlu yolda əlavə iş yoxdur; xəta yolunda bir ProblemDetails
serializasiyası. Media upload-da sıralama bir indekssiz `ORDER BY` əlavə edir — checksum üzrə
nəticə 1–2 sətirdir

**Constraints**: status kodları və mesaj mətnləri dəyişmir (FR-012); route-lar və uğurlu
cavablar dəyişmir; panel dəyişmir (FR-010); `refresh_*`/`origin_forbidden` kodları (FR-011);
login vaxt profili (FR-014, spec 011/012); binding 400-ü toxunulmur (8b-yə qalır); `Cbar.Domain`
toxunulmur; lokalda .NET SDK yoxdur — kod build olunmadan yazılır, pipeline yoxlayır

**Scale/Scope**: 4 yeni fayl (`Errors/`), `Program.cs`, 27 controller faylı (32 sinif — baza
sinfi; ~125 çağırış), `MediaController.Upload`; OpenAPI: `common.yaml`, `auth.yaml`,
`responses.yaml`, ~10 `paths/*.yaml`, `openapi.yaml`, `dist/`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Maddə | Yoxlama | Status |
|---|---|---|
| I.2–I.3 `product-host` referansı | Spec Yii2 `errorHandler` (`common/config/components.php`, `ErrorController`) və `unique` qaydasını (`common/models/Users.php:52`) göstərir; paritet cədvəli var. Səssiz itki yoxdur | ✅ |
| II.1/II.3 müstəqil proyektlər | Yalnız `api-cbar-admin`, bir MR. Panel dəyişmir və API-dən asılı deploy tələb etmir (R5 keçid sahələri). Panel uyğunlaşması ayrıca task | ✅ |
| III.2 `api-cbar` read-only | `api-cbar` toxunulmur | ✅ |
| III.4 admin JWT, audit | Avtorizasiya dəyişmir. Rədd olunan yazma audit yazmır: yaratmada audit ikinci `SaveChanges`-dədir və ona çatılmır, redaktədə eyni əməliyyatda geri qayıdır (R1). Media yarışında uduzan sorğu audit yazmır, mövcud qeydi qaytarır | ✅ |
| IV run/start sırası | Port, skript, sıra dəyişmir | ✅ |
| V.1 `Cbar.Domain` iki kopya | Toxunulmur | ✅ |
| V.2 migration | Yoxdur (checksum `UNIQUE` qəsdən edilmir — R7) | ✅ |
| V.3 ikidillilik | Locale FK mesajı yalnız naməlum açara aiddir; tərcümənin olmaması xəta deyil (dəyişmir) | ✅ |
| VII.3 kontrakt geriyə uyğunluğu | Route, status, mətn və uğurlu cavablar eyni. Media tipi `application/json` → `application/problem+json`; `message`/`code` qalır. `title`-sız 401/403/5xx paneli sındırmır. Spec-first: `openapi/` əvvəl ([contracts/](./contracts/)); route dəyişmədiyi üçün hook keçir | ✅ |
| VII.1 XML feed | `api-cbar`-dadır, toxunulmur | ✅ |
| VII.5 sirlər | `Include Error Detail` yandırılmır — dəyərlər loga düşmür (R4) | ✅ |
| VIII.1 real icra ilə verification | Lokal stack qaldırıla bilmir (.NET SDK yoxdur). Build pipeline-da, icra `test`-də | ⚠️ sapma, əsaslandırılıb (Complexity Tracking) |
| Yeni runtime dependency yalnız spec ilə | Yoxdur | ✅ |

**Post-design re-check (Phase 1-dən sonra)**: dizayn bir yeni qovluq (`Errors/`, 4 fayl), bir baza
controller sinfi, bir `IExceptionHandler` və bir lokal `catch` (media) əlavə edir. Hamısı bir
proyekt daxilindədir; yeni proyekt, port, dependency və ya paylaşılan cədvəl yoxdur. Baza sinfi
cross-cutting olduğu üçün əsaslandırılıb: alternativ ~125 çağırışda `this.` prefiksli extension
metodlar və ya reflection-lu result filter idi (R6). Nəticə dəyişmir, ✅ (VIII.1 sapması qalır).

## Project Structure

### Documentation (this feature)

```text
specs/018-global-error-handling/
├── spec.md
├── plan.md                    # bu fayl
├── research.md                # Phase 0 — R1–R10
├── data-model.md              # Phase 1 — cavab modeli, DB→status, məhdudiyyət xəritəsi, media axtarışı
├── quickstart.md              # Phase 1 — §0 məhdudiyyət adları, §1 baseline, §2–§5 test mühiti
├── contracts/
│   └── error-response.md      # vahid forma, nümunələr, DB cədvəli, OpenAPI dəyişikliyi
├── checklists/
│   └── requirements.md
└── tasks.md                   # Phase 2 (/speckit-tasks)
```

### Source Code (repository root)

```text
product-rest/api-cbar-admin/
├── src/Cbar.AdminApi/
│   ├── Errors/                              # YENİ qovluq
│   │   ├── ProblemDetailsSetup.cs           # CustomizeProblemDetails: title qaydası (R5), StatusCodeSelector (R9)
│   │   ├── CbarControllerBase.cs            # BadRequestProblem / ConflictProblem / NotFoundProblem / ErrorProblem (R6)
│   │   ├── DbErrorMapping.cs                # PostgresException + metod → (status, type, message, əlavələr) — saf funksiya (R4, R8)
│   │   └── DbExceptionHandler.cs            # IExceptionHandler: abort → 499; mapping → IProblemDetailsService; Warning logu
│   ├── Program.cs                           # AddProblemDetails, AddExceptionHandler<…>, UseExceptionHandler,
│   │                                        # UseStatusCodePages; Serilog konsol şablonuna {TraceId} (R10)
│   └── Controllers/
│       ├── 27 fayl                          # : CbarControllerBase; new { message … } → köməkçilər
│       └── MediaController.cs               # + FirstOrDefault axtarışı, storage_key 23505 lokal catch (R7)
└── openapi/
    ├── components/schemas/common.yaml       # ProblemDetails genişlənir, ErrorMessage silinir
    ├── components/schemas/auth.yaml         # OriginError → ProblemDetails
    ├── components/responses.yaml            # BusinessRule, Conflict, Unauthorized, Forbidden; + ServerError, PayloadTooLarge
    ├── paths/*.yaml                         # inline application/json xətaları; yeni 400/409-lar
    ├── openapi.yaml                         # info.description, x-known-issues
    └── dist/                                # bundle
```

**Structure Decision**: xəta infrastrukturu `src/Cbar.AdminApi/Errors/`-də — `Services/` DI
servisləri, `Validation/` (spec 016) sorğu yoxlaması üçündür; spec 016 8b-nin
`ValidationResponse.cs`-i `Errors/`-dəki köməkçiləri çağıracaq. `api-cbar`, `web-cbar-admin-new`,
`Cbar.Domain` toxunulmur.

**Pipeline sırası** (`Program.cs`, R3, R9):

```text
UseSerilogRequestLogging      ← xaricdə: yekun statusu görür, xəritələnən DB xətasını 500 kimi loglamır
UseExceptionHandler(options)  ← DbExceptionHandler → yoxsa daxili 500 ProblemDetails
UseStatusCodePages            ← gövdəsiz 401/403/404/405 → ProblemDetails
(MapOpenApi) → UseCors → UseAuthentication → UseAuthorization → MapControllers
```

**İcra sırası** (bir MR, amma bu ardıcıllıqla commit-lər):

1. Deploy-dan əvvəl: quickstart §0 (məhdudiyyət adları) və §1 (baseline) `test`-də.
2. OpenAPI (contracts/error-response.md) → lint + bundle → təsdiq (spec-first).
3. `Errors/` + `Program.cs` → `test`-ə push → quickstart §2a, d, e, f, §3, §4-ün çərçivə
   sətirləri (401/403/404) — controller-lər hələ köhnə formadadır, amma 500-lər artıq yoxdur.
4. `MediaController` dedup → §2c.
5. 27 controller faylı: baza sinfi + köməkçilər → §4 tam, §5 panel.
6. `api-admin-review.md` #7 "Vəziyyət" sətri; spec 016 8b-nin giriş şərti (2) ödənir.

**Deploy**: yalnız `api-cbar-admin`; sıra dəyişmir, migration yoxdur. Konsol log formatı dəyişir
(`{TraceId}`) — log toplayıcısı formatı parse edirsə, DevOps-a əvvəlcədən xəbər verilir.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| VIII.1: verification `dev.ps1` lokal stack-i ilə yox, deploy olunmuş `test` mühitində | Bu maşında .NET SDK yoxdur, `api-cbar-admin` lokalda nə build, nə run olunur | SDK quraşdırmaq bu task-ın əhatəsindən kənardır; spec 013–016 eyni yolla yoxlanılıb |
| 401/403/5xx-də `title`-ın buraxılması (keçid qaydası) | Panel `message` olmayanda `title`-ı göstərir; defolt ingiliscə `title` panelin azərbaycanca mesajını əvəz edərdi (FR-010b) | Paneli eyni anda dəyişmək iki MR-ın birgə deploy-unu tələb edir (II.3); boş gövdə saxlamaq FR-009-u pozur. Qayda panel task-ından sonra silinə bilər (R5) |
| Media upload-da lokal `catch` (qlobal handler-dən başqa yeganə) | Q1 = C: paralel eyni upload xəta yox, mövcud qeyd qaytarmalıdır — qlobal handler 200 qaytara bilməz | Checksum `UNIQUE` + migration əhatədən kənardır; advisory lock ay sərhədi halını həll etmir (R7) |
