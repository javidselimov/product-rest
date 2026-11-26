# Implementation Plan: Admin API-də sistemli input validation və səhifələmə limitləri

**Branch**: `016-input-validation-paging` (spec qovluğu; iş hazırda `test` branch-indədir) | **Date**: 2026-10-05 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/016-input-validation-paging/spec.md`

## Summary

İki ayrı çatdırılma, bir upstream repo (`api-cbar-admin`):

- **8a (2 SP)** — ortaq `PagingQuery` record-u (`[FromQuery]`, `int? Page`, `int? PageSize`) və
  `Resolve(defaultPageSize)` → `PageWindow(Page, PageSize, Skip)`: `page` 1..100000,
  `pageSize` 1..100, `< 1` → endpoint default-u. 13 list action-da `int page, int pageSize`
  parametrləri mexaniki əvəzlənir; cavabda tətbiq olunan dəyərlər qayıdır (research R3).
  Hədlər `api-cbar`-ın artıq istifadə etdiyi ilə eynidir.
- **8b (8 SP)** — DataAnnotations, yeni dependency yoxdur (R2). `[ApiController]`-in artıq
  qaytardığı `ValidationProblemDetails` 400-ün yeganə forması olur, `InvalidModelStateResponseFactory`
  ona `message` əlavə edir ki, panel dəyişmədən oxusun (R1, R4). Tərcümələr üçün qlobal
  `TranslationsValidationFilter` (`Order -2001`): aktiv locale-lər DB-dən, tərcümə DTO-larının
  atributları, "ən azı bir tərcümə" — açarlar `Translations[az].Title` (R5). Uzunluqlar
  `varchar(n)` ilə eyni (R6); məzənnə `> 0`, email formatı (R7). Controller-lərdəki əl ilə
  yazılmış `{ message }` 400-ləri ya atributa köçür, ya da `ValidationProblem()` olur — eyni
  mesajla (FR-015). Qayda inventarı [data-model.md §3](./data-model.md)-dədir və **istifadəçi
  təsdiqi 8b-nin giriş şərtidir** (FR-012).

8b #7-dən sonra icra olunur (spec Assumptions). Bu plan 400-ün formasını təyin edir; #7 DB
xətalarını 400-ə xəritələyəndə eyni factory-ni çağırır. 409/404-ə toxunulmur.

## Technical Context

**Language/Version**: C# / .NET 10 (`api-cbar-admin`)

**Primary Dependencies**: mövcud (ASP.NET Core MVC, EF Core + Npgsql).
`System.ComponentModel.DataAnnotations` framework-un hissəsidir — **yeni NuGet yoxdur**

**Storage**: PostgreSQL — sxem, migration, `Cbar.Domain` dəyişmir. Yeni oxuma: `locales`
(`SELECT code WHERE is_active`), tərcüməli yazma sorğusunda bir dəfə

**Testing**: avtomatik test yoxdur (Konstitusiya VIII.1); GitLab `test` branch-i → pipeline
build + deploy, sonra `test` mühitində `curl` + panel ([quickstart.md](./quickstart.md)).
Baseline (§1) deploy-dan **əvvəl** ölçülür

**Target Platform**: Linux konteyner (k8s), ingress arxasında

**Project Type**: web-service (bir upstream repo, iki MR: 8a, 8b)

**Performance Goals**: 8a list sorğularının ən pis halını 100 qeydlə məhdudlaşdırır. 8b hər
tərcüməli yazmaya bir kiçik `locales` sorğusu əlavə edir (2 sətir) — yazmalar nadirdir

**Constraints**: route-lar, query parametr adları, uğurlu cavablar və default `pageSize`-lar
dəyişmir (FR-005); uğurlu yazma davranışı dəyişmir (US2.6); 409/404/401/403/500 forması
dəyişmir (#7); login cavabı dəyişmir (FR-016); `Cbar.Domain` toxunulmur (iki kopya);
lokalda .NET SDK yoxdur — kod build olunmadan yazılır, pipeline yoxlayır

**Scale/Scope**: 8a — 13 action (12 controller faylı) + 1 yeni fayl + OpenAPI parametrləri.
8b — 39 yazma DTO-su (~27 controller faylı), 3 yeni fayl, `Program.cs`, OpenAPI sxemləri

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Maddə | Yoxlama | Status |
|---|---|---|
| I.2–I.3 `product-host` referansı | Spec `common/models`, `admin/models` `rules()` və admin `pagination`-ı göstərir; paritet cədvəli var. Qəsdən fərq: hər iki dili məcburi edən Yii2 qaydaları bərpa olunmur (Maddə V.3) — spec-də açıq yazılıb | ✅ |
| II.1/II.3 müstəqil proyektlər | Yalnız `api-cbar-admin`; 8a və 8b ayrı MR. Panel dəyişmir (R1: üç xəta formasını artıq oxuyur). Deploy sırası yoxdur | ✅ |
| III.2 `api-cbar` read-only | `api-cbar` toxunulmur; öz clamp-ı (`1..100000`, `1..100`) artıq var | ✅ |
| III.4 admin JWT, audit | Avtorizasiya dəyişmir; rədd edilən sorğu audit yazmır (filter action-dan əvvəl; VP yoxlamaları mutasiyadan əvvəl — bugünkü sıra) | ✅ |
| IV run/start sırası | Port, skript, sıra dəyişmir | ✅ |
| V.1 `Cbar.Domain` iki kopya | Entity/EF modeli dəyişmir — limitlər DTO-larda (R6, EF-dən oxumaq rədd edilib) | ✅ |
| V.2 migration | Yoxdur | ✅ |
| V.3 ikidillilik | Tərcümənin göndərilməməsi xəta deyil; yalnız **göndərilən** tərcümənin başlığı məcburidir (FR-007). Locale-lər DB-dən, sabit siyahı yoxdur (FR-008) | ✅ |
| VII.3 kontrakt geriyə uyğunluğu | Route və uğurlu cavablar eyni. 400 `{ message }` → `problem+json` + `message` — `message` açarı qalır, panel hər iki formanı oxuyur. Spec-first: `openapi/` əvvəl ([contracts/](./contracts/)); route dəyişmədiyi üçün hook keçir | ✅ |
| VII.1 XML feed | `currencies/{date}.xml` `api-cbar`-dadır, toxunulmur | ✅ |
| VIII.1 real icra ilə verification | Lokal stack qaldırıla bilmir (.NET SDK yoxdur). Build pipeline-da, icra `test`-də | ⚠️ sapma, əsaslandırılıb (Complexity Tracking) |
| Yeni runtime dependency yalnız spec ilə | Yoxdur — FluentValidation rədd edilib (R2) | ✅ |

**Post-design re-check (Phase 1-dən sonra)**: dizayn bir yeni qovluq (`Validation/`, 4 fayl),
bir qlobal filter və `ConfigureApiBehaviorOptions` əlavə edir — hamısı bir proyekt daxilində,
yeni proyekt/port/dependency/paylaşılan cədvəl yoxdur. Qlobal filter cross-cutting olduğu
üçün əsaslandırılmış: alternativ ~30 action-da əl ilə çağırışdır (R2). Nəticə dəyişmir, ✅
(VIII.1 sapması qalır).

## Project Structure

### Documentation (this feature)

```text
specs/016-input-validation-paging/
├── spec.md
├── plan.md                    # bu fayl
├── research.md                # Phase 0 — R1–R9
├── data-model.md              # Phase 1 — PagingQuery, 400 forması, QAYDA İNVENTARI (təsdiq sütunu)
├── quickstart.md              # Phase 1 — baseline + test mühitində curl
├── contracts/
│   ├── paging.md              # 8a — 13 GET endpoint
│   └── validation-error.md    # 8b — 400 problem+json + message
├── checklists/
│   └── requirements.md
└── tasks.md                   # Phase 2 (/speckit-tasks)
```

### Source Code (repository root)

```text
product-rest/api-cbar-admin/
├── src/Cbar.AdminApi/
│   ├── Validation/                          # YENİ qovluq
│   │   ├── PagingQuery.cs                   # 8a: PagingQuery, PageWindow
│   │   ├── ValidationResponse.cs            # 8b: InvalidModelStateResponseFactory + message
│   │   └── TranslationsValidationFilter.cs  # 8b: IHasTranslations, filter (Order -2001)
│   ├── Program.cs                           # 8b: AddControllers(o => o.Filters.Add<…>())
│   │                                        #     .ConfigureApiBehaviorOptions(…)
│   └── Controllers/
│       ├── 12 fayl (8a)                     # Azir, CurrencyRates, Galleries, InfoLines, Laws,
│       │                                    # MeasDocuments, Media, MoneyMarks (2 action),
│       │                                    # PressReleases, Users, Videos, YieldCurves
│       └── ~27 fayl (8b)                    # DTO atributları, `: IHasTranslations`,
│                                            # [ValidateNever] Translations, IValidatableObject
│                                            # (CurrencyRateSheet, YieldCurve, Banner, RunningLine),
│                                            # BadRequest({message}) → atribut və ya ValidationProblem()
└── openapi/
    ├── components/parameters.yaml           # 8a: Page, PageSize* hədləri
    ├── components/schemas/common.yaml       # 8a: PageMeta; 8b: ValidationProblemDetails.message
    ├── components/responses.yaml            # 8b: BusinessRule → yalnız problem+json
    ├── components/schemas/*.yaml, paths/*.yaml  # 8b: maxLength/minLength/format/min/max
    ├── openapi.yaml                         # x-known-issues: həll olunan bəndlər silinir
    └── dist/                                # bundle yenidən qurulur
```

**Structure Decision**: DTO-lar bugünkü kimi controller fayllarında qalır, atributlar ora
yazılır. Ortaq kod `src/Cbar.AdminApi/Validation/`-dədir — `Services/` DI servisləri üçündür,
bunlar isə MVC pipeline hissələridir. `api-cbar`, `web-cbar-admin-new`, `Cbar.Domain`
toxunulmur.

**İcra sırası**:

1. **8a** — `PagingQuery.cs` → OpenAPI (contracts/paging.md) → 13 action → `test`-ə push →
   quickstart §1 (əvvəl), §2. #7-dən asılı deyil.
2. **8b giriş şərti** — data-model.md §3-dəki hər ⬜ sətir ✅/❌ olur (xüsusən **Təklif**
   sətirləri: `Type` 1..2, `Year` aralığı, `StartsAt ≤ EndsAt`, Username L 100, parol 72 bayt,
   PressRelease/Page Update-də "ən azı bir tərcümə"). #7 birləşib.
3. **8b** — OpenAPI (contracts/validation-error.md) → `ValidationResponse` + filter +
   `Program.cs` → DTO-lar bölmə-bölmə (data-model §3.1–3.5) → controller `BadRequest`-ləri →
   `test` → quickstart §3–§6.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| VIII.1: verification `dev.ps1` lokal stack-i ilə yox, deploy olunmuş `test` mühitində | Bu maşında .NET SDK yoxdur, `api-cbar-admin` lokalda nə build, nə run olunur | SDK quraşdırmaq bu task-ın əhatəsindən kənardır; spec 013/014/015 eyni yolla yoxlanılıb |
| Qlobal action filter (`TranslationsValidationFilter`) | Locale yoxlaması async DB sorğusu tələb edir və xəta açarı deterministik olmalıdır | Sinxron `ValidationAttribute` DB-yə sinxron çıxış tələb edərdi; hər action-da əl ilə çağırış ~30 yerdə unudulmağa açıqdır |
