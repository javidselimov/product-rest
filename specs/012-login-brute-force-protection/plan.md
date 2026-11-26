# Implementation Plan: Admin login-də brute-force qoruması (lockout, rate limit, lock oracle)

**Branch**: `012-login-brute-force-protection` (spec qovluğu; iş hazırda `test` branch-indədir) | **Date**: 2026-10-02 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/012-login-brute-force-protection/spec.md`

## Summary

`POST /api/v1/auth/login` bu gün uğursuz cəhdləri saymır, hesabı kilidləmir, limit qoymur, kilidi
isə parol yoxlamasından **sonra** yoxlayır (oracle). Həll üç hissədən ibarətdir:

1. **Hesab kilidi** — səhv parol `failed_logins`-i bir atomik `UPDATE … RETURNING` ilə artırır
   (R2); son uğursuz cəhddən 10 dəqiqə ərzində 5-ci səhv `locked_until = now + 15 dəq` qoyur.
   Pəncərə üçün yeni nullable sütun `last_failed_login_at` (R1, migration `0007`). Uğurlu giriş,
   admin parol sıfırlaması və yenidən aktivləşdirmə hər üçünü sıfırlayır (R5).
2. **Oracle-ın bağlanması** — kilid parol yoxlanmazdan əvvəl hesablanır, bcrypt `Verify` yenə də
   həmişə işləyir, kilidli hesab adi `401 Invalid credentials.` alır (R3, Q1).
   `Account temporarily locked.` cavabı silinir.
3. **Ad üzrə rate limit** — shared framework-ün `System.Threading.RateLimiting`-i ilə singleton
   sliding-window limiter (120 s-də 10, açar = kiçik hərfli ad), login metodunun əvvəlində,
   bazaya müraciətdən qabaq; aşanda `429` + `Retry-After` (R4). IP limiti #5-dən sonra (Q3).

Kontrakt dəyişikliyi (401 təsviri, yeni 429) spec-first gedir (R6). Panel 429-u iki dildə göstərir.

## Technical Context

**Language/Version**: C# / .NET 10 (`api-cbar-admin`, `api-cbar` — yalnız `Cbar.Domain`); TypeScript / React 19 (`web-cbar-admin-new`)

**Primary Dependencies**: `BCrypt.Net-Next` (mövcud), `System.Threading.RateLimiting` (ASP.NET Core shared framework, NuGet deyil), EF Core + Npgsql (mövcud). **Yeni dependency yoxdur**

**Storage**: PostgreSQL `users` — `failed_logins`, `locked_until` (mövcud, indi yazılır) + **yeni** `last_failed_login_at timestamptz NULL` (`0007-users-last-failed-login.sql`). Rate limit sayğacı proses yaddaşında

**Testing**: API-də avtomatik test yoxdur (Konstitusiya VIII.1) — GitLab `test` branch → pipeline build + deploy, sonra `test` mühitində `curl` ssenariləri ([quickstart.md](./quickstart.md)). Panel: `npm run verify` (Vitest + MSW)

**Target Platform**: Linux konteyner (k8s), ingress arxasında; panel nginx statik

**Project Type**: web-service + SPA (üç upstream repo)

**Performance Goals**: dörd `401` qrupunun median fərqi < 25 ms (SC-002); limit yolu bcrypt-siz (< 5 ms əlavə)

**Constraints**: kilidli/səhv/mövcud olmayan cavablar bayt-bayt eyni (FR-005); paralel cəhdlər itmir (FR-003); refresh/logout limitsiz (FR-011); lokalda .NET SDK yoxdur — kod build olunmadan yazılır, pipeline yoxlayır; `UPDATE … RETURNING`-in EF `SqlQuery` ilə compose olunmaması `test`-də ilk yoxlanılan şeydir (R2)

**Scale/Scope**: `AuthController.Login` (~30 sətir dəyişir), yeni `Services/LoginProtection.cs` (sabitlər + limiter), `Program.cs`-də 1 qeydiyyat, `UsersController`-də 2 yer, 1 migration, 2 × `Auth.cs`, `openapi/paths/auth.yaml`; panel: `login-form.tsx`, 2 locale, MSW handler, 1 test. Qiymət: 5 SP + 1 SP (R1 migration) = **6 SP** API + **1 SP** panel

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Maddə | Yoxlama | Status |
|---|---|---|
| I.2–I.3 `product-host` referansı | Spec `LoginController`/`LoginViewModel` (§7.1) göstərir; paritet cədvəlində hər davranış: bərpa / sadələşdirilir (artan kilid) / təxirə salınır (IP limiti) / ləğv edilir (CAPTCHA) — açıq qərarla | ✅ |
| II.3 iki proyekt = iki MR, deploy sırası | Üç iş paketi: **(1)** `api-cbar-admin` (migration + kod + OpenAPI), **(2)** `api-cbar` (yalnız `Cbar.Domain/Entities/Auth.cs`), **(3)** `web-cbar-admin-new` (429 mesajı). Sıra: 1 → 2 → 3 | ✅ |
| III.4 JWT, audit | `auth/login` anonim qalır; uğurlu login audit-i dəyişmir; kilid audit-ə yazılmır (#16), log-a yazılır | ✅ |
| IV.2 start/deploy sırası | `api-cbar-admin` əvvəl (migration `0007`), sonra `api-cbar`. `api-cbar` yeni sütunu migration-dan əvvəl görməli deyil — sıra bunu təmin edir. Port/skript dəyişmir | ✅ |
| V.1 `Cbar.Domain` bayt-bayt eyni | `User.LastFailedLoginAt` hər iki kopyaya eyni commit-də; `diff` boş | ✅ |
| V.2 migration qaydaları | Yeni fayl, `ADD COLUMN IF NOT EXISTS`, `BEGIN/COMMIT` yox, ad hər iki API üzrə unikal (`api-cbar`-da migration yoxdur); `cbar_web_ro` cədvəl səviyyəli `SELECT`-i sütunu əhatə edir | ✅ |
| V.4 i18n | Panel mətni (`tooManyAttempts`) az + en, `check:i18n` | ✅ |
| VII.3 kontrakt geriyə uyğunluğu | Route eyni; 401 gövdəsi eyni forma (`ErrorMessage`); `Account temporarily locked.` mətninə heç bir istehlakçı əsaslanmır; 429 yeni, panel onu tanımasa da serverin mesajını göstərir. Spec-first: OpenAPI əvvəl ([contracts/auth-login.md](./contracts/auth-login.md)) | ✅ |
| VIII.1 real icra ilə verification | `dev.ps1` ilə lokal stack qaldırıla bilmir (.NET SDK yoxdur) — build pipeline-da, icra `test` mühitində, deploy-dan **əvvəl** baseline | ⚠️ sapma, əsaslandırılıb (Complexity Tracking) |
| VIII.2 yeni admin panel gate | `npm run verify` | ✅ |
| Yeni runtime dependency yalnız spec ilə | Yoxdur (`System.Threading.RateLimiting` framework-ün hissəsidir) | ✅ |
| Mürəkkəblik əsaslandırılır (Governance 4) | Yeni sütun — R1-də alternativlərlə əsaslandırılıb | ✅ |

**Post-design re-check (Phase 1-dən sonra)**: dizayn yeni fayl kimi `Services/LoginProtection.cs`
(proyekt daxili), `0007` migration və OpenAPI-də 429 əlavə edir. Spec-in "sxem dəyişmir"
fərziyyəsi R1 ilə dəyişdi — spec-in Assumptions və Key Entities bölmələri buna uyğun
yeniləndi. Nəticə dəyişmir: ✅, bir əsaslandırılmış sapma (VIII.1).

## Project Structure

### Documentation (this feature)

```text
specs/012-login-brute-force-protection/
├── spec.md
├── plan.md              # bu fayl
├── research.md          # Phase 0 — R1–R6
├── data-model.md        # Phase 1 — yeni sütun, vəziyyət keçidləri, atomik UPDATE
├── quickstart.md        # Phase 1 — test mühitində curl ssenariləri (§1–§8)
├── contracts/
│   └── auth-login.md    # Phase 1 — 401 (kilid daxil), yeni 429, invariantlar, OpenAPI diff
├── checklists/
│   └── requirements.md
└── tasks.md             # Phase 2 (/speckit-tasks)
```

### Source Code (repository root)

```text
# İş paketi 1 — api-cbar-admin (əvvəl deploy)
product-rest/api-cbar-admin/
├── openapi/
│   ├── paths/auth.yaml                 # ƏVVƏL: login 401 təsviri, yeni 429, kilid abzası
│   ├── openapi.yaml                    # # Sync: sətri
│   └── dist/                           # bundle (lint + bundle)
├── db/migrations/
│   └── 0007-users-last-failed-login.sql   # YENİ: ADD COLUMN IF NOT EXISTS last_failed_login_at
└── src/
    ├── Cbar.Domain/Entities/Auth.cs    # User.LastFailedLoginAt
    └── Cbar.AdminApi/
        ├── Services/LoginProtection.cs # YENİ: sabitlər + PartitionedRateLimiter (singleton)
        ├── Program.cs                  # LoginProtection-un DI qeydiyyatı
        └── Controllers/
            ├── AuthController.cs       # Login: limit → axtarış → locked → Verify → atomik sayğac / sıfırlama
            └── UsersController.cs      # ResetPassword + Update(false→true): kilidi sıfırla

# İş paketi 2 — api-cbar (1-dən sonra deploy)
product-rest/api-cbar/src/Cbar.Domain/Entities/Auth.cs   # eyni sətir, diff boş

# İş paketi 3 — web-cbar-admin-new (2-dən sonra; 1-dən asılıdır)
product-rest/web-cbar-admin-new/src/
├── features/auth/components/login-form.tsx      # status 429 → t('tooManyAttempts')
├── features/auth/auth-flow.test.tsx             # 429 testi
├── shared/testing/handlers/auth.ts              # MSW: 429 ssenarisi (real kontrakt)
└── locales/{az,en}/auth.json                    # tooManyAttempts
```

**Structure Decision**: Mövcud strukturlar. Köməkçi `Services/`-də yaşayır (`PasswordHashing`,
`RefreshTokenService` kimi); limiter vəziyyətli olduğu üçün `PasswordHashing`-dən fərqli olaraq
DI-də singleton kimi qeydiyyatdan keçir, sabitlər isə eyni sinifdə statikdir. Limiter controller
daxilində çağırılır, `AddRateLimiter` middleware-i istifadə olunmur (R4). Legacy `web-cbar-admin`
toxunulmur.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| VIII.1: verification `dev.ps1` lokal stack-i ilə yox, deploy olunmuş `test` mühitində | Bu maşında .NET SDK yoxdur, `api-cbar-admin` lokalda nə build, nə run olunur | SDK quraşdırmaq bu task-ın əhatəsindən kənardır; kilid müddəti (15 dəq) və vaxt ölçümü real mühitdə daha etibarlıdır |
| Yeni sütun `last_failed_login_at` (+ `api-cbar` MR-ı yalnız `Cbar.Domain` üçün) | FR-002-nin 10 dəqiqəlik pəncərəsi son uğursuz cəhdin vaxtını tələb edir | `updated_at` hər dəyişiklikdə yenilənir; `locked_until`-u iki mənada işlətmək oxunaqlığı pozur; pəncərəsiz sayğac Edge Case-i pozur (research R1) |
