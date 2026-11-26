---

description: "Task list for 016-input-validation-paging"
---

# Tasks: Admin API-də sistemli input validation və səhifələmə limitləri

**Input**: Design documents from `specs/016-input-validation-paging/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/paging.md](./contracts/paging.md), [contracts/validation-error.md](./contracts/validation-error.md), [quickstart.md](./quickstart.md)

**Tests**: Avtomatik test task-ı yoxdur — API-də test layihəsi yoxdur və spec onu tələb etmir
(Konstitusiya VIII.1). Verification = GitLab pipeline build + `test` mühitində
[quickstart.md](./quickstart.md) `curl` + panel. Lokalda .NET SDK yoxdur: kod build olunmadan
yazılır — tipləri, `using`-ləri və atribut hədəflərini diqqətlə yoxla.

**Organization**: İki çatdırılma, iki MR, bir upstream repo (`api-cbar-admin`):
**8a** = US1 (Phase 3), **#7-dən asılı deyil**, dərhal edilə bilər. **8b** = Phase 2 + US2–US4,
#7 birləşəndən və [data-model.md §3](./data-model.md) inventarı təsdiqlənəndən sonra. Bütün
yollar `product-rest/api-cbar-admin/` nisbətindədir, başqa cür göstərilməyibsə.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Paralel icra oluna bilər (fərqli fayl, asılılıq yoxdur)
- **[Story]**: Aid olduğu user story (US1–US4)

---

## Phase 1: Setup — baseline və giriş şərtləri

**Purpose**: "500 → 400" və "dəyişməyib" iddialarını ölçmək üçün bugünkü davranışı qeyd etmək
və 8b-nin qərar giriş şərtlərini bağlamaq.

- [ ] T001 [quickstart.md](./quickstart.md) §1 baseline-ı `test`-də **hər hansı deploy-dan əvvəl** icra et və nəticəni (HTTP kodları, `items|length`, boş başlıqlı qalereyanın 400/201 olması — research R1 qeyri-müəyyənliyi) `specs/016-input-validation-paging/quickstart.md` §1-in altına "Baseline nəticəsi (tarix, SHA)" kimi yaz; 201 olarsa yaradılan qalereyanı sil — **İstifadəçi icra edir** (token lazımdır)
- [ ] T002 [data-model.md §3](./data-model.md)-dəki hər sətrin "Təsdiq" sütununu ✅ və ya ❌ et — xüsusən **Təklif** sətirləri (`Type` 1..2 dörd DTO-da, `Year` 1900..2100, `StartsAt ≤ EndsAt` banner/running line, Username L 100, parol L 72 bayt) və PressRelease/Page `Update`-də "ən azı bir tərcümə". ⬜ qalan sətir üçün 8b kodu yazılmır — **İstifadəçi qərar verir** (8b giriş şərti, FR-012)
- [ ] T003 #7 (ProblemDetails + `DbUpdateException` mapping) statusunu yoxla: birləşibsə, onun 400 üçün `InvalidModelStateResponseFactory`-ni (və ya ekvivalentini) dəyişib-dəyişmədiyinə bax və T005-i ona uyğunlaşdır (iki forma olmamalıdır — research R4). Birləşməyibsə, 8b-ni gözlət və ya istifadəçidən #7-siz başlamaq üçün açıq icazə al; qərarı bu sətrin altına yaz — **İstifadəçi qərar verir**

---

## Phase 2: Foundational — 8b infrastrukturu (yalnız US2–US4 üçün)

**Purpose**: 400 formasını (R4) və tərcümə filterini (R5) bir yerdə qurmaq. **US1 (8a) bu fazadan
asılı deyil** — Phase 3 bundan əvvəl və ya paralel icra oluna bilər.

**⚠️ CRITICAL**: US2, US3, US4 bu fazadan asılıdır. Giriş şərti: T002, T003.

- [ ] T004 [P] Spec-first ([contracts/validation-error.md](./contracts/validation-error.md) "OpenAPI dəyişikliyi"): `openapi/components/schemas/common.yaml#/ValidationProblemDetails`-ə `message` (string, `required`-ə əlavə) və `errors` təsvirinə açar formalarını yaz (`Email`, `Translations[az].Title`, `Translations[ru]`, `Translations`, `Rates[2].Rate`); `openapi/components/responses.yaml#/BusinessRule`-dan `application/json` `ErrorMessage` variantını sil (yalnız `application/problem+json`), təsviri yenilə; `ErrorMessage` sxemi 409-lar üçün qalır — silmə. `openapi/openapi.yaml` `info.x-known-issues`-da "No input validation beyond binding…" bəndini sil, "Error bodies are inconsistent…" bəndini "404/409 still differ (#7)" mənasında qısalt. `openapi/`-də `npm run lint && npm run bundle && npm run contract` — xətasız. `# Sync:` sətrinə toxunma
- [ ] T005 [P] `src/Cbar.AdminApi/Validation/ValidationResponse.cs` yarat (namespace `Cbar.AdminApi.Validation`): `public static class ValidationResponse { public static IActionResult Create(ActionContext context) }` — `context.HttpContext.RequestServices.GetRequiredService<ProblemDetailsFactory>().CreateValidationProblemDetails(context.HttpContext, context.ModelState)` ilə standart `ValidationProblemDetails` qur (`type`, `title`, `status: 400`, `traceId` ASP.NET-in özü əlavə edir); bütün mesajları `errors`-un sırası ilə düz siyahıya yığ, `message` = ilk 3-ü `"; "` ilə, `n > 3` olsa sonuna `$" (+{n - 3} more)"`; `problem.Extensions["message"] = message`; `return new BadRequestObjectResult(problem) { ContentTypes = { "application/problem+json" } };`. Faylın başında 2-3 sətir şərh: niyə `message` (panel onu birinci oxuyur, `web-cbar-admin-new/src/shared/api/types.ts`), spec 016 R4. `ControllerBase.ValidationProblem()` eyni factory-dən keçir — controller-lərdəki DB yoxlamaları da bu formanı alır
- [ ] T006 [P] `src/Cbar.AdminApi/Validation/TranslationsValidationFilter.cs` yarat: (a) `public interface IHasTranslations { IEnumerable<KeyValuePair<string, object>>? TranslationEntries { get; } bool RequiresTranslation => true; }`; (b) `public sealed class TranslationsValidationFilter(CbarDbContext db) : IAsyncActionFilter, IOrderedFilter` — `Order => -2001` (şərh: `[ApiController]`-in `ModelStateInvalidFilter`-i `-2000`-dir, xətalar ondan əvvəl ModelState-ə düşməlidir ki, hamısı bir 400-də qayıtsın); (c) `OnActionExecutionAsync`: `context.ActionArguments.Values.OfType<IHasTranslations>()` boşdursa dərhal `await next()`; əks halda bir dəfə `var active = (await db.Locales.AsNoTracking().Where(l => l.IsActive).Select(l => l.Code).ToListAsync()).ToHashSet(StringComparer.Ordinal);` (keşsiz — R5); hər arqument üçün `entries = arg.TranslationEntries?.ToList() ?? []`; `entries.Count == 0 && arg.RequiresTranslation` → `AddModelError("Translations", "At least one translation is required.")`; hər `(locale, value)` üçün: `!active.Contains(locale)` → `AddModelError($"Translations[{locale}]", $"Unknown or inactive locale '{locale}'.")` və növbəti; `value is null` → `AddModelError($"Translations[{locale}]", $"[{locale}] Translation is required.")`; əks halda `var results = new List<ValidationResult>(); Validator.TryValidateObject(value, new ValidationContext(value), results, validateAllProperties: true);` və hər nəticə üçün hər `MemberNames` üzvünə `AddModelError($"Translations[{locale}].{member}", $"[{locale}] {r.ErrorMessage}")`; sonra `await next()`. **Qeyd**: `Validator.TryValidateObject` record-un **constructor parametrlərindəki** atributları görmür, yalnız property-dəkiləri — ona görə tərcümə DTO-larında atributlar `[property: …]` hədəfi ilə yazılmalıdır (bax "DTO resepti" aşağıda); faylın şərhində bunu qeyd et. Entity adlarını (`db.Locales`, `Locale.Code`, `Locale.IsActive`) `src/Cbar.Domain/Entities/`-də yoxla
- [ ] T007 `src/Cbar.AdminApi/Program.cs`: `builder.Services.AddControllers()` → `AddControllers(o => o.Filters.Add<TranslationsValidationFilter>())` (`AddJsonOptions` zənciri qalır) və zəncirə `.ConfigureApiBehaviorOptions(o => o.InvalidModelStateResponseFactory = ValidationResponse.Create)`; `using Cbar.AdminApi.Validation;`. Filter scoped DI-dən `CbarDbContext` alır — `Filters.Add<T>()` tip əsaslıdır, əlavə qeydiyyat lazım deyil (depends on T005, T006)

**Checkpoint**: Hələ heç bir DTO dəyişməyib — bu gün binding xətası verən sorğular eyni 400-ü, əlavə olaraq `message` ilə qaytarır. Davranış başqa heç yerdə dəyişmir (heç bir DTO `IHasTranslations` deyil).

---

## Phase 3: User Story 1 - List sorğuları məhdudlaşır, səhv səhifə xəta vermir (Priority: P1) 🎯 MVP — 8a

**Goal**: 13 list endpoint-də `page` 1..100000, `pageSize` 1..100 (`< 1` → default), cavabda tətbiq olunan dəyərlər (FR-001…FR-005).

**Independent Test**: [quickstart.md](./quickstart.md) §2 — hər sətir 200, `n ≤ 100`, `page`/`pageSize` contracts/paging.md cədvəlinə uyğun; parametrsiz nəticə T001 baseline-ı ilə eyni; panel siyahıları dəyişməyib.

### Implementation for User Story 1

- [X] T008 [US1] Spec-first ([contracts/paging.md](./contracts/paging.md) "OpenAPI dəyişikliyi"): `openapi/components/parameters.yaml` — `Page`: təsvir "1-based page number. Values below 1 are treated as 1, above 100000 as 100000.", `maximum: 100000`; `PageSize20`: təsvir "Page size. Values below 1 use the default (20); values above 100 are capped at 100.", `maximum: 100`; faylın başındakı şərh qalır. Inline `pageSize` tərifləri — `openapi/paths/homepage.yaml:531` (info-lines, 50), `openapi/paths/media.yaml:9` (24), `openapi/paths/statistics.yaml:168` (azir, 50): eyni təsvir öz default-u ilə, `maximum: 100`. `openapi/components/schemas/common.yaml#/PageMeta` təsviri: "`page` and `pageSize` are the values actually applied (clamped), not necessarily the ones sent." `openapi/openapi.yaml` `info.x-known-issues`-dan ilk iki bəndi (`page` is not clamped…, `pageSize` is not capped…) sil. `npm run lint && npm run bundle && npm run contract` — xətasız
- [X] T009 [P] [US1] `src/Cbar.AdminApi/Validation/PagingQuery.cs` yarat (namespace `Cbar.AdminApi.Validation`): `public sealed record PagingQuery(int? Page = null, int? PageSize = null) { public const int MaxPage = 100_000; public const int MaxPageSize = 100; public PageWindow Resolve(int defaultPageSize) { … } }` və `public readonly record struct PageWindow(int Page, int PageSize) { public int Skip => (Page - 1) * PageSize; }`. `Resolve`: `page = Page is null or < 1 ? 1 : Math.Min(Page.Value, MaxPage)`; `size = PageSize is null or < 1 ? defaultPageSize : Math.Min(PageSize.Value, MaxPageSize)`; `size = Math.Min(size, MaxPageSize)` (default da maksimuma tabe — spec edge case). Şərh: hədlər `api-cbar`-dakı ilə eynidir (`Math.Clamp(page, 1, 100_000)`, `Math.Clamp(pageSize, 1, 100)`); fərq — `< 1` default-a qayıdır (spec 016 FR-002); `Skip` ≤ 99_999 × 100, daşmır. Record `[FromQuery]` ilə bağlanır, property adları query `page`/`pageSize` ilə case-insensitive uyğundur
- [X] T010 [US1] **List resepti** (T011–T022 üçün, hər faylda eyni): action imzasında `[FromQuery] int page = 1, [FromQuery] int pageSize = N` → `[FromQuery] PagingQuery paging` (digər query parametrləri və onların sırası qalır; `paging`-i köhnə `page`-in yerinə qoy); gövdənin başında `var w = paging.Resolve(N);` (N — köhnə default, **dəyişmir**); `.Skip((page - 1) * pageSize).Take(pageSize)` → `.Skip(w.Skip).Take(w.PageSize)`; cavabda `page, pageSize` → `page = w.Page, pageSize = w.PageSize` (anonim tipdə ad saxlanılsın: `new { items, total, page = w.Page, pageSize = w.PageSize }`); `using Cbar.AdminApi.Validation;`. Bu task yalnız resepti təsdiqləyir — kod T011–T022-dədir
- [X] T011 [P] [US1] `src/Cbar.AdminApi/Controllers/AzirController.cs` `List` (~:17-38), default 50 — T010 resepti
- [X] T012 [P] [US1] `src/Cbar.AdminApi/Controllers/CurrencyRatesController.cs` `Dates` (~:46-60), default 20 — T010 resepti
- [X] T013 [P] [US1] `src/Cbar.AdminApi/Controllers/GalleriesController.cs` `List` (~:24-47), default 20 — T010 resepti
- [X] T014 [P] [US1] `src/Cbar.AdminApi/Controllers/InfoLinesController.cs` `List` (~:24-49), default 50 — T010 resepti; cavab zərfi (~:47 `pageSize,` çox sətirli) eyni adlarla qalsın
- [X] T015 [P] [US1] `src/Cbar.AdminApi/Controllers/LawsController.cs` `List` (~:23-55), default 20 — T010 resepti (`search`, `categoryId`, `status` qalır)
- [X] T016 [P] [US1] `src/Cbar.AdminApi/Controllers/MeasDocumentsController.cs` `List` (~:24-61), default 20 — T010 resepti
- [X] T017 [P] [US1] `src/Cbar.AdminApi/Controllers/MediaController.cs` `List` (~:35-50), default **24** — T010 resepti
- [X] T018 [P] [US1] `src/Cbar.AdminApi/Controllers/MoneyMarksController.cs` — **iki** action: `MoneyMarksController.List` (~:140-171) və `MoneyMarkNewsController.List` (~:319-345), hər ikisi default 20 — T010 resepti
- [X] T019 [P] [US1] `src/Cbar.AdminApi/Controllers/PressReleasesController.cs` `List` (~:23-50), default 20 — T010 resepti
- [X] T020 [P] [US1] `src/Cbar.AdminApi/Controllers/UsersController.cs` `List` (~:24-49), default 20 — T010 resepti
- [X] T021 [P] [US1] `src/Cbar.AdminApi/Controllers/VideosController.cs` `List` (~:24-45), default 20 — T010 resepti
- [X] T022 [P] [US1] `src/Cbar.AdminApi/Controllers/YieldCurvesController.cs` `List` (~:24-43), default 20 — T010 resepti
- [X] T023 [US1] Öz-review: (a) `src/`-də `grep -rn "(page - 1) \* pageSize\|int pageSize" src/Cbar.AdminApi` — heç nə qalmamalıdır; (b) 13 action-un hər birində default N köhnə ilə eynidir (data-model.md §1 cədvəli); (c) səhifələnməyən list-lərə toxunulmayıb; (d) `route-diff.mjs api-cbar-admin` route fərqi göstərmir; spec-first hook bloklamayıb; (e) `src/Cbar.Domain`, `api-cbar`, panel toxunulmayıb (depends on T008, T011–T022)
  - **Nəticə (2026-10-05)**: (a) heç nə qalmayıb; (b) 50/20/20/50/20/20/24/20+20/20/20/20/20 — köhnə ilə eyni; (c) toxunulmayıb; (d) `route-diff` "no differences" (162 kod / 163 spec — fərq `GET /healthz`, əvvəldən); hook route dəyişmədiyini təsdiqlədi; (e) toxunulmayıb. OpenAPI: `lint` təmiz, `contract` test-ə qarşı 166/166.
  - **Plandan sapmalar**: T009 — `PagingQuery` positional record yox, `init` property-li record (query-də olmayan parametr sadəcə `null` qalsın, constructor binding nüansı olmasın). T011/T014 — `Azir` və `InfoLines`-də `paging` parametri default dəyərli parametrlərdən **əvvələ** köçürüldü (əks halda CS1737); binding sıradan asılı deyil, query adları dəyişmir. Fayllar CRLF saxlanılıb (işçi ağacın bugünkü sətir sonu).
- [ ] T024 [US1] 8a-nı ayrıca commit et (istifadəçi təsdiqi ilə; mesajda "spec 016 8a"). GitLab `api-cbar-admin` repo-sunun **`test` branch-inə** çatdır (`origin` GitHub-a push deploy etmir); bu SHA üçün build + deploy job-ları yaşıl olmalıdır, build xətası olarsa düzəlt və təkrarla (depends on T023) — **İstifadəçi icra edir**
- [ ] T025 [US1] [quickstart.md](./quickstart.md) §2-ni `test`-də icra et (13 endpoint × 7 sorğu) və panel siyahılarını (`npm run local:testcbar`) yoxla; nəticəni T001 baseline-ı ilə müqayisə edib quickstart §2-nin altına yaz (depends on T024)

**Checkpoint**: 8a tamamdır və deploy oluna bilər — `api-admin-review.md` #8a ✅ ola bilər (T046).

---

## DTO resepti (US2, US3, US4 task-ları üçün ortaq)

Hər faylda yalnız [data-model.md §3](./data-model.md)-də **✅** olan sətirlər icra olunur; ❌ —
atlanır; ⬜ — dayan, T002-yə qayıt.

1. **Tərcümə DTO-su** (`XTranslationDto`): `R` sahələrə `[property: Required]`, `L n` sahələrə
   `[property: MaxLength(n)]` — **`property:` hədəfi ilə** (T006 qeydi: `Validator` constructor
   parametrlərini görmür; bu DTO-lar MVC tərəfindən yoxlanmır, çünki `Translations` `[ValidateNever]`-dir,
   ona görə MVC-nin "həm parametrdə, həm property-də" xətası burada yaranmır). `T` sahələrə heç nə.
2. **Upsert DTO** (`XUpsertDto`): `Translations` parametrinə `[ValidateNever]`
   (`Microsoft.AspNetCore.Mvc.ModelBinding.Validation`); record-a `: IHasTranslations` və
   `public IEnumerable<KeyValuePair<string, object>>? TranslationEntries => Translations?.Select(kv => KeyValuePair.Create(kv.Key, (object)kv.Value));`
   `RequiresTranslation` yalnız data-model.md deyən yerdə override olunur.
3. **Top-level sahələr** (MVC yoxlayır): `[MaxLength(n)]`, `[Range]`, `[EmailAddress]` — **parametr**
   atributu, `property:` hədəfi **yox** (MVC record parametrlərini özü tanıyır; ikisi birlikdə xəta atır).
   Sahələrarası qaydalar (`StartsAt ≤ EndsAt`, dublikat, `> 0`) — record-a `IValidatableObject`,
   `yield return new ValidationResult(msg, [nameof(EndsAt)])`.
4. **Controller**: `if (dto.Translations.Count == 0) return BadRequest(new { message = "At least one translation is required." });`
   sətirlərini **sil** (filter edir); atributa köçən əl ilə yoxlamaları (data-model "Mövcud → A") sil;
   DB-yə baxan yoxlamaları (data-model "Mövcud → VP") `ModelState.AddModelError("<Sahə>", "<eyni mesaj>"); return ValidationProblem();`
   ilə əvəz et — **mesaj mətni eyni**, açar DTO-dakı sahə adı (PascalCase). 409 və 404 qayıdışlarına
   **toxunma** (#7). Yoxlamaların sırası və mutasiyadan əvvəl olması qalır (FR-006).
5. `using Cbar.AdminApi.Validation;`, `using System.ComponentModel.DataAnnotations;` əlavə et.

---

## Phase 4: User Story 2 - Səhv məzmun saxlanılmır, səhv sahələr adlandırılır (Priority: P2) — 8b

**Goal**: Tərcüməli məzmun DTO-larında boş başlıq, uzun sahə, boş lüğət 400 verir; bütün xətalar bir cavabda; uğurlu yol dəyişmir (FR-006, FR-007, FR-009, FR-012–FR-015).

**Independent Test**: [quickstart.md](./quickstart.md) §3 a, b, e, f, j, k, l — 400 + gözlənən açar + `message`; f 201; DB/audit dəyişməyib. Panel ilə hər bölmədə bir yaratma + redaktə uğurlu.

### Implementation for User Story 2

- [ ] T026 [US2] Spec-first: [data-model.md §3.1–3.3](./data-model.md) ✅ qaydalarını sxemlərə yaz — `openapi/components/schemas/{press-releases,laws,pages,money-marks,meas,homepage,media-content,organization,settings}.yaml`-dakı `*Upsert`, `PageMove`, `PageAsset*`, `GalleryImage*`, `SettingUpsert` sxemlərində: R sahələr `minLength: 1` (+ təsvirdə "not blank"), `L n` → `maxLength: n`, Təklif ✅ olanlar (`Type` → `minimum: 1, maximum: 2`; tarix ardıcıllığı təsvirdə). `ImagePopupUpsert`-ə toxunma (T036). Bu sxemləri istifadə edən `paths/*.yaml` əməliyyatlarında 400 cavabı artıq `BusinessRule`/`ValidationFailed`-dirsə dəyişmə; yoxdursa `$ref: ../components/responses.yaml#/BusinessRule` əlavə et. `npm run lint && npm run bundle && npm run contract` (depends on T004)
- [ ] T027 [P] [US2] `src/Cbar.AdminApi/Controllers/PressReleasesController.cs`: `TranslationDto.Title` R + L 500; `PressReleaseUpsertDto` IHasTranslations; `Type` 1..2 (✅ olarsa); Create-dəki "At least one translation" sil (filter); Update-də də tələb olunur (✅ olarsa — `RequiresTranslation` default `true` bunu avtomatik edir; ❌ olarsa `RequiresTranslation` Update-də işləməməlidir → bu halda Update üçün ayrıca DTO lazımdır, dayan və soruş); `AttachAsset` "Media asset not found." → VP (`MediaId`), "Already attached." 409 qalır — DTO resepti
- [ ] T028 [P] [US2] `src/Cbar.AdminApi/Controllers/LawsController.cs` və `src/Cbar.AdminApi/Controllers/LawCategoriesController.cs`: `LawTranslationDto.Title` R + L 500, `LawCategoryTranslationDto.Name` R + L 500; hər iki Upsert IHasTranslations; `LawUpsertDto.Type` 1..2 (✅ olarsa); "Law category not found." → VP (`CategoryId`); `AttachAsset` "Media asset not found." → VP; LawCategories `Delete`-in 409-u qalır — DTO resepti
- [ ] T029 [P] [US2] `src/Cbar.AdminApi/Controllers/PagesController.cs`: `PageTranslationDto` Title R + L 500, Slug L 500; `PageUpsertDto` IHasTranslations (Update-də boş lüğət — T002 qərarı), `NavUrl` L 500; "Parent page not found." → VP (`ParentId`); `MoveDto`-nun 400-ləri ("A page cannot be its own parent.", "Parent page not found.", "Cannot move a page under its own descendant.") → VP (`NewParentId`), 409-lar qalır; "Moving pages is not supported yet…" 400-ü → VP (`ParentId`, mesaj eyni); `PageAssetTranslationDto.Title` R + L 500; `PageAssetAttachDto` IHasTranslations + `RequiresTranslation => false` (nullable `Translations` — `TranslationEntries` `?.` ilə), `GroupLabel` L 100, "Media asset not found." → VP; `PageAssetUpdateDto` IHasTranslations, `GroupLabel` L 100 (mövcud `:281` silinir); `PageAssetOrderDto` "assetIds must contain…" → VP (`AssetIds`); "Already attached." 409 qalır. `UniqueSlugAsync` və slug məntiqinə toxunma (#15) — DTO resepti
- [ ] T030 [P] [US2] `src/Cbar.AdminApi/Controllers/MoneyMarksController.cs`: `MoneyMarkCategoryTranslationDto.Name`, `MoneyMarkTranslationDto.Title`, `MoneyMarkNewsTranslationDto.Title` — R + L 500; üç Upsert IHasTranslations; `MoneyMarkUpsertDto.Type` 1..2 (✅ olarsa); `Validate` (~:252-263)-dəki "At least one translation" sil, "Money mark category not found." → VP (`CategoryId`), "Front/Rear media asset not found." → VP (`FrontMediaId`/`RearMediaId`) — DTO resepti (T018 ilə eyni fayl — T018 bitməyibsə ardıcıl et)
- [ ] T031 [P] [US2] `src/Cbar.AdminApi/Controllers/MeasDocumentsController.cs` və `src/Cbar.AdminApi/Controllers/MeasLookupsController.cs`: `MeasDocumentUpsertDto.Dqn` `[MaxLength(100)]` (parametr), `ValidateReferences` (~:136-145) 3 mesajı → VP (`EmitentId`, `InfoTypeId`, `MediaId`); `MeasLookupTranslationDto.Name` R + L 500, `MeasLookupUpsertDto` IHasTranslations (hər iki controller sinfi — emitents, info-types) — DTO resepti
- [ ] T032 [P] [US2] `src/Cbar.AdminApi/Controllers/BannersController.cs`, `src/Cbar.AdminApi/Controllers/HomepageLinksController.cs`, `src/Cbar.AdminApi/Controllers/HomepagePublicationsController.cs`: `BannerTranslationDto` Title L 500 (**R yox** — data-model istisnası), Link L 1000; `BannerUpsertDto` IHasTranslations + `RequiresTranslation => MediaId is null` və filterin mesajı banner üçün "A banner needs an image or at least one translation." olmalıdır → `IHasTranslations`-a `string MissingTranslationMessage => "At least one translation is required.";` default üzvü əlavə et (T006 faylında) və Banner-də override et; `StartsAt ≤ EndsAt` (✅ olarsa, `IValidatableObject`, açar `EndsAt`); "Media asset not found." → VP. `HomepageLinkTranslationDto` Title R + L 500, Url R + L 1000; `HomepagePublicationTranslationDto` Title R + L 500, Url L 1000; hər ikisi IHasTranslations, "Media asset not found." → VP — DTO resepti
- [ ] T033 [P] [US2] `src/Cbar.AdminApi/Controllers/NewsSliderController.cs`, `src/Cbar.AdminApi/Controllers/RunningLinesController.cs`: `NewsSliderTranslationDto` Title R + L 500, Link L 1000; `RunningLineTranslationDto.Text` R + L 1000; hər iki Upsert IHasTranslations; `RunningLineUpsertDto` `StartsAt ≤ EndsAt` (✅ olarsa); NewsSlider "Media asset not found." → VP — DTO resepti
- [ ] T034 [P] [US2] `src/Cbar.AdminApi/Controllers/GalleriesController.cs`, `src/Cbar.AdminApi/Controllers/VideosController.cs`, `src/Cbar.AdminApi/Controllers/VideoStreamsController.cs`: `GalleryTranslationDto`, `VideoTranslationDto`, `VideoStreamTranslationDto` Title R + L 500; üç Upsert IHasTranslations; `VideoUpsertDto.YoutubeUrl` və `VideoStreamUpsertDto.StreamUrl` `[MaxLength(500)]`; Galleries `AttachImage` "Media asset not found." → VP, `ReorderImages` "imageIds must contain…" → VP (`ImageIds`), "Already attached." 409 qalır — DTO resepti (T013/T021 ilə eyni fayllar — ardıcıllığa diqqət)
- [ ] T035 [P] [US2] `src/Cbar.AdminApi/Controllers/OrganizationController.cs` və `src/Cbar.AdminApi/Controllers/InfoLinesController.cs`: `DivisionTranslationDto.Name` R + L 500; `OfficeTranslationDto` Name R + L 500, Address L 1000, Phone L 100; `StaffTranslationDto` FullName R + **L 300**, Position/ReceptionDays L 500; `StaffUpsertDto` Phone L 100, Type 1..2 (✅ olarsa); üç Upsert IHasTranslations; "Media asset not found." → VP (`MediaId`/`PhotoMediaId`). `InfoLineUpsertDto.Alias` `[Required, MaxLength(100)]` (mövcud "Alias is required." sil), Year 1900..2100 (✅ olarsa); `InfoLineTranslationDto` Title R + L 500, Value L 500. `src/Cbar.AdminApi/Controllers/SettingsController.cs` "Value is required." → VP (`Value`) — DTO resepti

**Checkpoint**: Məzmun bölmələrinin hamısında atribut + filter işləyir; `BadRequest(new { message` yalnız US3/US4 fayllarında qalıb.

---

## Phase 5: User Story 3 - Naməlum dil açarı qəbul olunmur (Priority: P2) — 8b

**Goal**: Yalnız aktiv `locales.code` açarları qəbul olunur; yeni dil kod dəyişmədən; açar dəqiq uyğunluqla (FR-008). Filter Phase 2-də qurulub, US2 DTO-ları onu artıq işlədir — bu faza qalan tərcüməli DTO-nu (image popups) köçürür və locale davranışını yoxlayır.

**Independent Test**: [quickstart.md](./quickstart.md) §3 c, d — `ru`, `AZ` → 400 `Translations[ru]` / `Translations[AZ]`; image popup üçün də eyni.

### Implementation for User Story 3

- [ ] T036 [US3] Spec-first: `openapi/components/schemas/media-content.yaml#/ImagePopupUpsert` (və translation sxemi) — Title `minLength: 1, maxLength: 500`, AltText `maxLength: 500`; `openapi/components/schemas/common.yaml#/Locale`-in təsvirinə "Any active locale code; `az` and `en` today. Unknown or inactive keys are rejected with 400." (enum qalır — bu gün iki dil). `npm run lint && npm run bundle && npm run contract` (depends on T004)
- [ ] T037 [US3] `src/Cbar.AdminApi/Controllers/ImagePopupsController.cs`: `ImagePopupUpsertDto` IHasTranslations (`Translations` nullable-dırsa `?.`), `RequiresTranslation => false` (popup tərcüməsiz ola bilməz amma qayda "ən azı bir dildə şəkil"-dir — o, controller-də qalır); `Title` `[Required, MaxLength(500)]` parametr atributu, `ImagePopupTranslationDto.AltText` `[property: MaxLength(500)]`; `Validate` (~:122-157)-dən çıxar: "Title is required.", "Title must be at most 500 characters.", "Unknown locale." (filter edir, `is_active` ilə), "Alt text must be at most 500 characters."; qalan yoxlamalar ("At least one locale must have an image.", "Media asset not found.", "Media asset must be an image.", "Link must start with http://, https:// or /.") VP-yə keçir — açar `Translations[{locale}].MediaId` / `.Link`, mesaj `[{locale}] ` prefiksi ilə (filterlə eyni üslub), birincisi `Translations`. `Normalize` (trim, boş → null) **atributlardan əvvəl** işləmir (MVC action-dan əvvəl yoxlayır) — ona görə `Title` üçün "tam boşluq" `[Required]` ilə tutulur, uzunluq isə trim olunmamış dəyərə baxır: bu, bugünkü davranışdan (trim-dən sonra 500) fərqlidir — şərhdə qeyd et və ya uzunluq yoxlamasını `Normalize`-dan sonra VP kimi saxla (sadə olanı seç, fərqi MR-da yaz) — DTO resepti
- [ ] T038 [US3] Öz-review locale: (a) `grep -rn "Dictionary<string, .*TranslationDto>" src/Cbar.AdminApi/Controllers` — hər nəticənin DTO-su `IHasTranslations`-dır və `Translations`-ı `[ValidateNever]`-dir (yeni DTO-da unutmaq — R5); (b) heç bir faylda `"az"`/`"en"` sabit siyahı kimi validation üçün işlədilmir (FR-008); (c) filter yalnız `IHasTranslations` arqumenti olanda DB-yə gedir (depends on T027–T035, T037)

**Checkpoint**: Bütün tərcüməli DTO-lar eyni filterdən keçir.

---

## Phase 6: User Story 4 - Rəqəm, tarix və email qaydaları (Priority: P3) — 8b

**Goal**: Məzənnə `> 0` (sətir valyuta kodu ilə), email formatı, numeric sütunların hədləri, mövcud yoxlamalar eyni mənada, yeni formada (FR-010, FR-011, FR-015, FR-016).

**Independent Test**: [quickstart.md](./quickstart.md) §3 g, h, i və §4 — 400 + açar; login 401 əvvəlki kimi.

### Implementation for User Story 4

- [ ] T039 [US4] Spec-first: `openapi/components/schemas/statistics.yaml` — `CurrencyRateSheetUpsert` sətrində `rate: exclusiveMinimum: 0, maximum: 99999999.9999`, `currencyCode: minLength: 3, maxLength: 3`; `AzirUpsert` term `minLength: 1, maxLength: 10`, rate `exclusiveMaximum: 10000, exclusiveMinimum: -10000`; `InflationParameterUpsert` month 1..12, parameterCode `minLength: 1, maxLength: 50`, value `|x| < 10^6`, year (✅ olarsa); `InflationSettingsUpdate` (mövcud qaydalar sənədlidirsə toxunma); `YieldCurveUpsert` beta/lambda `|x| < 10^6`, period `minLength: 1, maxLength: 20`, yield `|x| < 10^4`. `openapi/components/schemas/users.yaml` — `UserCreate`/`UserUpdate` email `format: email`, username `minLength: 1` (+ `maxLength: 100` ✅ olarsa), password `maxLength` (✅ olarsa). `auth.yaml`-a **toxunma** (FR-016). `npm run lint && npm run bundle && npm run contract` (depends on T004)
- [ ] T040 [P] [US4] `src/Cbar.AdminApi/Controllers/CurrencyRatesController.cs`: `CurrencyRateSheetDto : IValidatableObject` — `Rates` boşdursa `("At least one rate is required.", [nameof(Rates)])`; dublikat kod → `($"Duplicate currency code '{code}' in payload.", [nameof(Rates)])`; hər `i` üçün `Rates[i].Rate <= 0` → `($"Rate for {Rates[i].CurrencyCode} must be greater than 0.", [$"Rates[{i}].Rate"])`, `>= 100_000_000` → `($"Rate for {code} is out of range.", …)` (numeric(12,4)); `CurrencyRateItemDto.CurrencyCode` `[StringLength(3, MinimumLength = 3)]`. Controller-dən mövcud "At least one rate" və "Duplicate…" (~:65-69) sil; "Unknown currency codes: …" (~:71-78) → VP (`Rates`). **Diqqət**: `IValidatableObject.Validate` yalnız property atributları keçəndə çağırılır — MVC davranışı; kod sırası bunu nəzərə alsın. Ardıcıllıq: T012 ilə eyni fayl
- [ ] T041 [P] [US4] `src/Cbar.AdminApi/Controllers/AzirController.cs` və `src/Cbar.AdminApi/Controllers/InflationController.cs`: `AzirUpsertDto.Term` `[Required, MaxLength(10)]` (mövcud "Term is required." sil), `Rate` `[Range(typeof(decimal), "-9999.9999", "9999.9999")]`; `InflationUpsertDto.Month` `[Range(1, 12)]` (mövcud ~:37 sil, mesaj fərqi MR-da qeyd), `ParameterCode` `[Required, MaxLength(50)]` (mövcud ~:39 sil), `Value` `[Range(typeof(decimal), "-999999.9999", "999999.9999")]`, `Year` (✅ olarsa) `[Range(1900, 2100)]`; `InflationSettingsDto` — `TargetInflation` trim controller-də qaldığı üçün "required/255" yoxlamaları (~:86-90) VP kimi qalır (trim-dən sonra ölçür), "Current inflation is out of range." (~:91) → `[Range(typeof(decimal), "-9999.99", "9999.99")]` atributu və ya VP — mesaj mətni eyni qalsın. Ardıcıllıq: T011 ilə eyni fayl
- [ ] T042 [P] [US4] `src/Cbar.AdminApi/Controllers/YieldCurvesController.cs`: `YieldCurveParametersDto` Beta0..2/Lambda `[property: Range(typeof(decimal), "-999999.999999", "999999.999999")]` — **diqqət**: bu nested DTO-lar MVC tərəfindən yoxlanır (dictionary deyil), ona görə **parametr** atributu (`property:` yox) — DTO resepti §3; `YieldPointDto.Period` `[Required, MaxLength(20)]`, `Yield` `[Range(typeof(decimal), "-9999.9999", "9999.9999")]`; `YieldCurveUpsertDto : IValidatableObject` — "Duplicate period '{dup}' in payload." (~:61, :94-dən köçür, açar `Yields`); "A yield curve for … already exists." 409 qalır. Ardıcıllıq: T022 ilə eyni fayl
- [ ] T043 [P] [US4] `src/Cbar.AdminApi/Controllers/UsersController.cs`: `UserCreateDto` — `Username` (gizli R var; L 100 ✅ olarsa `[MaxLength(100)]`), `Email` `[EmailAddress]`, `Password` (L 72 ✅ olarsa `[MaxLength(72)]` — şərh: bcrypt 72 baytdan sonrasını nəzərə almır; bayt yox simvol sayıdır, AZ hərfləri 2 bayt — fərqi şərhdə qeyd et); `UserUpdateDto.Email` `[EmailAddress]`; `UserPasswordResetDto.NewPassword` eyni L. Controller: "Username is required." / "Email is required." (~:64, :66, :104) sil — gizli `[Required]` artıq tutur (mesaj ASP.NET default-u olur; MR-da qeyd); `PasswordPolicyError` nəticəsi → VP (açar `Password` / `NewPassword`, mesaj eyni); "Role not found." (~:72, :108) → VP (`RoleId`); 409-lar (dublikat, son admin — spec 015) **qalır**. Ardıcıllıq: T020 ilə eyni fayl
- [ ] T044 [US4] `src/Cbar.AdminApi/Controllers/AuthController.cs` — **dəyişiklik yoxdur** (FR-016): `LoginRequest`-ə atribut əlavə olunmadığını, `TranslationsValidationFilter`-in onu tutmadığını (`IHasTranslations` deyil) yoxla. `ValidationResponse` factory-si login-də yalnız bugünkü binding 400-lərinə `message` əlavə edir — spec 011/012-nin 401/429 davranışı dəyişmir; bunu MR təsvirinə yaz

**Checkpoint**: 8b kodu tamamdır.

---

## Phase 7: Polish & Cross-Cutting

- [ ] T045 Öz-review 8b: (a) `grep -rn "BadRequest(new { message" src/Cbar.AdminApi` — heç nə qalmamalıdır (FR-015; `Conflict(new { message` və `NotFound` qalır); (b) hər `[MaxLength(n)]` data-model.md §3-dəki `L n` ilə eynidir; (c) tərcümə DTO-larında atributlar `[property: …]`, top-level DTO-larda parametr atributlarıdır (DTO resepti §1/§3) — səhv hədəf **səssizcə işləməz**; (d) heç bir 409/404 dəyişməyib; (e) `src/Cbar.Domain`, migration, `api-cbar`, panel toxunulmayıb; (f) `route-diff.mjs api-cbar-admin` fərqsiz, spec-first hook bloklamayıb; (g) `using`-lər: `System.ComponentModel.DataAnnotations`, `Microsoft.AspNetCore.Mvc.ModelBinding.Validation`, `Cbar.AdminApi.Validation` (depends on T026–T044)
- [ ] T046 8b-ni commit et (istifadəçi təsdiqi ilə; "spec 016 8b"), GitLab `test` branch-inə çatdır, build + deploy yaşıl; sonra [quickstart.md](./quickstart.md) §3 (a–l), §4, §5 (`information_schema` uzunluq tutuşdurması — T001 kimi oxuma girişi), §6 (`npm run drift` test-ə qarşı) icra et və nəticələri quickstart-a yaz; panel ilə hər bölmədə bir yaratma + redaktə (US2.6, SC-005) — **İstifadəçi icra edir** (push, token, DB girişi)
- [ ] T047 [P] `api-admin-review.md` (repo kökü): cədvəldə #8a və #8b sətirlərinin Status-unu yenilə (✅ SHA + `specs/016`, və ya 🔄 deploy/yoxlama gözləyir), "Bitib/Qalıb" cəmlərini və prioritet xülasəsini yenidən hesabla; #8 bölməsinə qısa "icra olunub" qeydi (spec 015/014 qeydlərinin üslubunda). `openapi.yaml`-dakı x-known-issues-da köhnəlmiş "Users: the last-active-admin guard exists only on delete…" bəndi spec 015-dən qalıbsa, onu ayrıca qeyd et (bu spec-in işi deyil — silmə, istifadəçiyə de)
- [ ] T048 [P] Frontend follow-up qeydi (kod yox): `web-cbar-admin-new`-da CRUD forması dil üzrə sahələrin xətasını (`Translations[az].Title`) sahənin altına qoymur, yalnız üst xəta kimi göstərir (`features/crud/components/crud-form-page.tsx:143-156`) — ayrıca frontend task-ı kimi `api-admin-review.md` #8 bölməsinə "Frontend:" sətri əlavə et (review-un SP qaydasına uyğun, SP-yə daxil deyil)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1**: T001 hər deploy-dan əvvəl. T002, T003 yalnız 8b-ni bloklayır.
- **Phase 3 (US1, 8a)**: heç nədən asılı deyil (T001-dən başqa) — **ən əvvəl** icra oluna bilər.
- **Phase 2 (8b infra)**: T002 + T003 → T004, T005, T006 → T007.
- **Phase 4 (US2)**, **Phase 5 (US3)**, **Phase 6 (US4)**: Phase 2-dən sonra; bir-birindən
  asılı deyillər (fərqli fayllar), US3-ün T038-i US2 bitəndən sonra.
- **Phase 7**: US2–US4 bitəndən sonra.

### Fayl toqquşmaları (eyni fayl, ardıcıl)

8a və 8b ayrı MR olduğu üçün adətən problem yoxdur; 8b 8a-dan sonra gəlir. Əgər paralel
budaqlarda gedirsə: `AzirController` (T011 → T041), `CurrencyRatesController` (T012 → T040),
`GalleriesController` (T013 → T034), `InfoLinesController` (T014 → T035), `LawsController`
(T015 → T028), `MeasDocumentsController` (T016 → T031), `MoneyMarksController` (T018 → T030),
`PressReleasesController` (T019 → T027), `UsersController` (T020 → T043), `VideosController`
(T021 → T034), `YieldCurvesController` (T022 → T042). T032 `TranslationsValidationFilter.cs`-ə
(T006) `MissingTranslationMessage` əlavə edir — T006-dan sonra.

### Parallel Opportunities

- **US1**: T009 və T011–T022 (12 fayl) paralel; T008 (OpenAPI) da paralel, amma kod commit-dən əvvəl bitməlidir.
- **Phase 2**: T004, T005, T006 paralel.
- **US2**: T027–T035 paralel (fərqli fayllar); T026 (OpenAPI) onlardan əvvəl.
- **US4**: T040–T043 paralel.

```text
# US1 — bir agentə bir neçə fayl:
T011 Azir + T012 CurrencyRates + T013 Galleries
T014 InfoLines + T015 Laws + T016 MeasDocuments
T017 Media + T018 MoneyMarks + T019 PressReleases
T020 Users + T021 Videos + T022 YieldCurves

# US2 — bölmə üzrə:
T027 PressReleases | T028 Laws+LawCategories | T029 Pages | T030 MoneyMarks
T031 Meas* | T032 Banners+Homepage* | T033 NewsSlider+RunningLines
T034 Galleries+Videos+VideoStreams | T035 Organization+InfoLines+Settings
```

## Implementation Strategy

### MVP First (8a = US1)

1. T001 baseline (deploy-dan əvvəl).
2. T008 → T009 → T011–T022 → T023 → T024 (commit + push `test`) → T025.
3. **Dayan və yoxla**: 13 endpoint, panel siyahıları. 8a ayrıca deploy olunur — review-un "Dərhal" sırası.

### Incremental Delivery (8b)

1. T002 (inventar təsdiqi) + T003 (#7 statusu) — qərarlar.
2. Phase 2 (T004–T007) — formanın özü; heç bir DTO dəyişmədən deploy etmək mümkündür (yalnız `message` əlavə olunur).
3. US2 → US3 → US4 (hər biri bir neçə commit ola bilər, amma bir MR).
4. Phase 7 — review, deploy, quickstart §3–§6, sənədlər.

### Risklər (lokalda build yoxdur)

- **Atribut hədəfi** (`property:` vs parametr) səhv olarsa build keçir, amma qayda **səssizcə
  işləmir** — T045(c) və quickstart §3 bunu tutur; hər bölmədən ən azı bir sorğu.
- `IValidatableObject` yalnız atributlar keçəndə çağırılır — iki mərhələli xəta (contracts/validation-error.md "Davranış qaydaları" 2) gözləniləndir.
- Filter `Order` səhv olarsa locale xətaları ayrıca 400 yox, action-a çatıb 500 verə bilər — quickstart §3 c/e.
