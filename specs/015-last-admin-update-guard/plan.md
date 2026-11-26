# Implementation Plan: Son aktiv administratorun redaktə ilə itirilməsinin qarşısının alınması

**Branch**: `015-last-admin-update-guard` (spec qovluğu; iş hazırda `test` branch-indədir) | **Date**: 2026-10-05 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/015-last-admin-update-guard/spec.md`

## Summary

`UsersController.Delete` (`:171-177`) son aktiv adminin silinməsini 409 ilə rədd edir, amma
`Update` (`:100-137`) eyni nəticəyə aparan iki yolu — `isActive=false` və admin olmayan
`roleId` — yoxlamır (research R1). Həll: "hədəfdən başqa aktiv admin varmı?" sorğusu
controller daxilində bir private metoda (`HasOtherActiveAdminAsync(int exceptUserId)`) çıxarılır;
`Delete` onu çağırır (davranış eyni), `Update` isə dəyişiklik hədəfi aktiv admin statusundan
çıxarırsa onu çağırır və başqa aktiv admin yoxdursa heç nə dəyişmədən 409 qaytarır (R2, R3).
Sxem, `Cbar.Domain`, route və panel dəyişmir; OpenAPI-də yalnız `updateUser` təsviri yenilənir
(409 cavabı artıq sənədlidir, R5).

## Technical Context

**Language/Version**: C# / .NET 10 (`api-cbar-admin`)

**Primary Dependencies**: mövcud (ASP.NET Core, EF Core + Npgsql). **Yeni dependency yoxdur**

**Storage**: PostgreSQL `users`, `roles` — sxem və migration dəyişikliyi yoxdur

**Testing**: avtomatik test yoxdur (Konstitusiya VIII.1); GitLab-dakı `api-cbar-admin` repo-sunun
`test` branch-i → pipeline build + avtomatik deploy, sonra `test` mühitində `curl` və panel ilə
([quickstart.md](./quickstart.md)). Bu checkout-dan push deploy etmir

**Target Platform**: Linux konteyner (k8s), ingress arxasında

**Project Type**: web-service (bir upstream repo)

**Performance Goals**: yoxdur — `Update`-də rol sorğusu `AnyAsync`-dən `Select(Code)`-a dəyişir
(eyni sayda sorğu), yalnız qoruma halında bir əlavə `AnyAsync`

**Constraints**: route və uğurlu cavab dəyişmir (FR-007); sxem dəyişmir; silmə davranışı və
mesajları dəyişmir (FR-006); rədd edilən sorğu heç nə saxlamır, audit yazmır, sessiya ləğv
etmir (FR-002); lokalda .NET SDK yoxdur — kod build olunmadan yazılır, pipeline yoxlayır

**Scale/Scope**: bir fayl (`UsersController.cs`, ~15 sətir dəyişiklik) + `openapi/paths/users.yaml`
təsviri + bundle; 2 SP

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Maddə | Yoxlama | Status |
|---|---|---|
| I.2–I.3 `product-host` referansı | Spec `admin/controllers/UsersController.php` (`actionManage`, `actionChangeStatus`) göstərir; köhnədə qoruma yoxdur — paritet cədvəlində qəsdən sərtləşdirmə kimi qeyd olunub. Funksiya itmir: legitim deaktivasiya/rol dəyişikliyi qalır | ✅ |
| II.1/II.3 müstəqil proyektlər | Yalnız `api-cbar-admin` — bir MR, deploy sırası yoxdur | ✅ |
| III.4 admin JWT, audit | `[Authorize(Roles = "admin")]` dəyişmir; rədd halında audit yazılmır (silmə ilə eyni), uğurlu redaktənin audit qeydi dəyişmir | ✅ |
| IV run/start sırası | Port, skript, start sırası dəyişmir | ✅ |
| V `Cbar.Domain` / migration | Entity, EF modeli, sxem toxunulmur → iki kopya sinxronu məsələsi yoxdur | ✅ |
| VII.3 kontrakt geriyə uyğunluğu | Route eyni; 409 `updateUser` üçün artıq sənədlidir, yalnız şərti təsvirə əlavə olunur ([contracts/users-update.md](./contracts/users-update.md)). Spec-first: `openapi/` əvvəl yenilənir, hook route dəyişmədiyi üçün keçir | ✅ |
| VIII.1 real icra ilə verification | Lokal stack qaldırıla bilmir (.NET SDK yoxdur). Build pipeline-da, icra `test`-də; ssenari test mühitində ikinci admin hesabı tələb edir (R6) | ⚠️ sapma, əsaslandırılıb (Complexity Tracking) |
| Yeni runtime dependency yalnız spec ilə | Yeni dependency yoxdur | ✅ |

**Post-design re-check (Phase 1-dən sonra)**: dizayn yeni fayl, servis və ya DI qeydiyyatı
əlavə etmir — yalnız controller daxilində private metod. Nəticə dəyişmir, ✅ (VIII.1 sapması qalır).

## Project Structure

### Documentation (this feature)

```text
specs/015-last-admin-update-guard/
├── spec.md
├── plan.md                 # bu fayl
├── research.md             # Phase 0
├── data-model.md           # Phase 1 — sxem dəyişmir; "aktiv admin" tərifi və keçid cədvəli
├── quickstart.md           # Phase 1 — test mühitində curl + panel yoxlaması
├── contracts/
│   └── users-update.md     # Phase 1 — PUT /users/{id} yeni 409 halı, DELETE dəyişmir
├── checklists/
│   └── requirements.md
└── tasks.md                # Phase 2 (/speckit-tasks)
```

### Source Code (repository root)

```text
product-rest/api-cbar-admin/
├── src/Cbar.AdminApi/Controllers/UsersController.cs
│     Update:  roleId-nin varlıq yoxlaması → hədəf rolun Code-unu oxumaq;
│              404 və email-conflict yoxlamalarından sonra, mutasiyadan ƏVVƏL:
│              hədəf aktiv admindirsə və (dto.IsActive == false || yeni rol != "admin")
│              && !HasOtherActiveAdminAsync(id) → 409
│     Delete:  :171-177 inline sorğu → HasOtherActiveAdminAsync(id), mesaj eyni
│     YENİ private: Task<bool> HasOtherActiveAdminAsync(int exceptUserId)
└── openapi/
    ├── paths/users.yaml    # updateUser təsviri: "No last-admin guard here…" cümləsi əvəzlənir
    └── dist/openapi.json   # bundle yenidən qurulur
```

**Structure Decision**: Qayda controller-in private metodu olaraq qalır — onu yalnız
`UsersController` istifadə edir, ayrıca servis və DI qeydiyyatı (R2) əsassızdır. `api-cbar` və
`web-cbar-admin-new` toxunulmur.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| VIII.1: verification `dev.ps1` lokal stack-i ilə yox, deploy olunmuş `test` mühitində | Bu maşında .NET SDK yoxdur, `api-cbar-admin` lokalda nə build, nə run olunur | SDK quraşdırmaq bu task-ın əhatəsindən kənardır; spec 013/014 eyni yolla yoxlanılıb |
