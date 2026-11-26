# Implementation Plan: Login cavab vaxtı üzrə username enumeration-ı bağlamaq

**Branch**: `011-login-timing-enumeration` (spec qovluğu; iş hazırda `test` branch-indədir) | **Date**: 2026-10-01 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/011-login-timing-enumeration/spec.md`

## Summary

`POST /api/v1/auth/login` istifadəçi tapılmayanda (yox, deaktiv və ya soft-delete olunub)
bcrypt yoxlamasını `||` short-circuit ilə ötürür və ~250 ms tez cavab verir. Həll: bcrypt
yoxlaması **həmişə** icra olunur — istifadəçi yoxdursa, prosesin açılışında təsadüfi parolla
yaradılmış, real hesablarla **eyni iş faktorlu** (12) dummy hash-a qarşı (research R1–R3).
Qərar null yoxlamasından əvvəl hesablanır, ona görə dummy hash-ın nəticəsi girişə heç vaxt
təsir etmir (FR-004).

İş faktoru indi `UsersController`-də iki yerdə `12` kimi hardcoded-dur. Dummy hash-ın xərci
onunla ayrılmaz qalsın deyə dəyər bir sabitə çıxarılır (R2). Sxem, kontrakt, cavab gövdəsi və
frontend dəyişmir.

## Technical Context

**Language/Version**: C# / .NET 10 (`api-cbar-admin`)

**Primary Dependencies**: `BCrypt.Net-Next` 4.2.0 (mövcud). **Yeni dependency yoxdur**

**Storage**: PostgreSQL `users` cədvəli — yalnız oxunur; sxem və migration dəyişikliyi yoxdur

**Testing**: avtomatik test yoxdur (Konstitusiya VIII.1); GitLab-dakı `api-cbar-admin` repo-sunun
`test` branch-i → pipeline build + avtomatik deploy, sonra `test` mühitində `curl` ilə vaxt ölçümü
([quickstart.md](./quickstart.md)). Bu checkout-un `origin`-i GitHub-dır, oradan push deploy etmir

**Target Platform**: Linux konteyner (k8s), ingress arxasında

**Project Type**: web-service (bir upstream repo)

**Performance Goals**: uğursuz qrupların median fərqi < 25 ms (SC-001/002); uğurlu login 10/10 və
cavab forması dəyişmir (SC-004; vaxtı yalnız məlumat üçün yazılır)

**Constraints**: cavab status/gövdəsi bayt-bayt eyni (FR-003); OpenAPI route və sxemləri
dəyişmir (FR-007); lokalda .NET SDK yoxdur — kod build olunmadan yazılır, pipeline yoxlayır

**Scale/Scope**: 1 controller metodunda 2–3 sətir, 1 yeni kiçik statik sinif, `UsersController`-də
2 sətir; < 1 SP kod + deploy/ölçüm dövrü

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Maddə | Yoxlama | Status |
|---|---|---|
| I.2–I.3 `product-host` referansı | Spec `LoginController`/`LoginViewModel`-i göstərir; itirilmiş qoruma (vaxt üzrə gizlətmə) bərpa olunur, təsadüfi gecikmənin köçürülməməsi spec-də açıq yazılıb | ✅ |
| II.1/II.3 müstəqil proyektlər | Yalnız `api-cbar-admin` — bir MR, deploy sırası yoxdur | ✅ |
| III.2/III.4 admin ayrılığı, JWT, audit | `auth/login` anonim qalır (istisna); audit davranışı dəyişmir (FR-006) | ✅ |
| IV run/start sırası | Port, skript, start sırası dəyişmir | ✅ |
| V `Cbar.Domain` / migration | Entity və sxem toxunulmur → iki kopya sinxronu məsələsi yoxdur | ✅ |
| VII.3 kontrakt geriyə uyğunluğu | Route, sorğu, cavab eyni ([contracts/auth-login.md](./contracts/auth-login.md)); `/sync-openapi` lazım deyil, spec-first hook-u route əlavə/silinmədiyi üçün keçir | ✅ |
| VIII.1 real icra ilə verification | `dev.ps1` ilə lokal stack **qaldırıla bilmir** (lokalda .NET SDK yoxdur). Əvəzində build GitLab pipeline-ında, icra deploy olunmuş `test` mühitində aparılır; deploy-dan **əvvəl** baseline ölçülür | ⚠️ sapma, əsaslandırılıb (Complexity Tracking) |
| Yeni runtime dependency yalnız spec ilə | Yeni dependency yoxdur | ✅ |

Bir əsaslandırılmış sapma var (VIII.1), qalan maddələr uyğundur. **Post-design re-check (Phase 1-dən sonra)**: dizayn yeni fayl kimi yalnız
`Services/PasswordHashing.cs` əlavə edir (proyekt daxilində, paylaşılan kod deyil) — nəticə dəyişmir, ✅.

## Project Structure

### Documentation (this feature)

```text
specs/011-login-timing-enumeration/
├── spec.md
├── plan.md              # bu fayl
├── research.md          # Phase 0
├── data-model.md        # Phase 1 — sxem dəyişikliyi yoxdur, yalnız iştirak edən sahələr
├── quickstart.md        # Phase 1 — baseline + deploy sonrası vaxt ölçümü
├── contracts/
│   └── auth-login.md    # Phase 1 — dəyişməyən kontrakt + yeni vaxt invariantı
├── checklists/
│   └── requirements.md
└── tasks.md             # Phase 2 (/speckit-tasks)
```

### Source Code (repository root)

```text
product-rest/api-cbar-admin/src/Cbar.AdminApi/
├── Services/
│   └── PasswordHashing.cs        # YENİ: WorkFactor = 12, DummyHash (açılışda bir dəfə)
└── Controllers/
    ├── AuthController.cs         # Login: Verify həmişə çağırılır (user?.PasswordHash ?? DummyHash)
    └── UsersController.cs        # workFactor: 12 → PasswordHashing.WorkFactor (2 yer: :84, :143)
```

**Structure Decision**: Mövcud `api-cbar-admin` strukturu; köməkçi `Services/`-də yaşayır
(`RefreshTokenService`, `AuditService`, `SlugService` kimi). DI-yə qeydiyyat lazım deyil —
vəziyyətsiz statik sabitlərdir. `api-cbar` login etmir, ona toxunulmur.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| VIII.1: verification `dev.ps1` lokal stack-i ilə yox, deploy olunmuş `test` mühitində | Bu maşında .NET SDK yoxdur, `api-cbar-admin` lokalda nə build, nə run olunur | SDK quraşdırmaq bu task-ın əhatəsindən kənardır. Üstəlik vaxt ölçümü üçün real ingress yolu lokal Kestrel-dən daha doğru nəticə verir (research R6) |
