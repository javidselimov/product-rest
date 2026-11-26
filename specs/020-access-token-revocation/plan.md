# Implementation Plan: Admin API — giriş tokeninin dərhal ləğvi (access token revocation)

**Branch**: `020-access-token-revocation` (spec qovluğu; iş hazırda `test` branch-indədir) | **Date**: 2026-10-08 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/020-access-token-revocation/spec.md`

## Summary

Bu gün imzası və müddəti etibarlı olan giriş tokeni deaktivasiya, silmə, parol reset və rol
dəyişikliyindən sonra da 15 dəqiqə 30 saniyəyə qədər işləyir. Həll **təhlükəsizlik versiyası**
(security stamp) üzərində qurulur:

1. **Saxlama.** Yeni cədvəl `admin_user_security_stamps` (migration `0007`) yaradılır, çünki
   `users` cədvəlini `ALTER` etmək paylaşılan mühitlərdə yıxılır (R1). Versiya tətbiqdə
   yaradılan uuid-dir və token verilərkən tənbəl yaradılır (R2).
2. **Daşıma.** Login və refresh-in verdiyi token `sst` claim-ini daşıyır (R3).
3. **Yoxlama.** `JwtBearerEvents.OnTokenValidated` hər qorunan sorğuda bir DB sorğusu ilə
   aktivliyi, silinməni və versiyanı yoxlayır. Uyğunsuzluqda `context.Fail` standart 401-i
   qaytarır və panel səssiz yenilənir (R4). **Keş yoxdur** (Q1 → C, R6).
4. **Ləğv.** `UsersController.Update` (deaktivasiya və ya rol dəyişikliyi), `ResetPassword` və
   `Delete` versiyanı istifadəçi dəyişikliyi ilə eyni tranzaksiyada upsert ilə dəyişir (R5).

Endpoint dəyişmir. OpenAPI-də yalnız `Unauthorized` təsviri yenilənir və bu kod
dəyişikliyindən əvvəl edilir (R7). Panel dəyişmir. Qiymət: **4 SP** (ilkin 5-dən Redis çıxdı).

## Technical Context

**Language/Version**: C# / .NET 10 (`api-cbar-admin`; `api-cbar`-da yalnız `Cbar.Domain`)

**Primary Dependencies**: `Microsoft.AspNetCore.Authentication.JwtBearer` 10.0.9 (mövcud), EF Core + Npgsql (mövcud). **Yeni dependency yoxdur**. Redis qoşulmur (Q1)

**Storage**: PostgreSQL. **Yeni** cədvəl `admin_user_security_stamps (user_id PK, stamp uuid, changed_at)`, [data-model.md](./data-model.md). `users` dəyişmir

**Testing**: API-də avtomatik test yoxdur (Konstitusiya VIII.1). GitLab `test` branch-i pipeline-da build və deploy olunur, sonra `test` mühitində `curl` və panel ssenariləri işlədilir ([quickstart.md](./quickstart.md))

**Target Platform**: Linux konteyner (k8s), ingress arxasında

**Project Type**: web-service (iki upstream repo: `api-cbar-admin`, `api-cbar`)

**Performance Goals**: hər qorunan sorğuya bir PK sorğusu əlavə olunur. Median fərqi < 10 ms (SC-004, quickstart §6)

**Constraints**: rədd növbəti sorğuda olur (FR-006). Versiya dəyişikliyi istifadəçi dəyişikliyi ilə atomikdir (FR-005). 401 gövdəsi spec 018 formasındadır (FR-007). Migration `users`-ə `ALTER` etmir (FR-011). Lokalda .NET SDK yoxdur, kod build olunmadan yazılır və pipeline yoxlayır

**Scale/Scope**: yeni `Services/SecurityStampService.cs` (~70 sətir), `Program.cs` (events + DI), `AuthController` (`CreateAccessToken` async, login/refresh-də versiya), `UsersController` (3 metodda tranzaksiya + rotate), 1 migration, hər iki kopyada `Auth.cs` + `CbarDbContext.cs`, `openapi/components/responses.yaml`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Maddə | Yoxlama | Status |
|---|---|---|
| I.2–I.3 `product-host` referansı | Spec `UserIdentity::findIdentity`-ə (istifadəçi hər sorğuda bazadan yüklənir) istinad edir. Feature bu davranışı bərpa edir, heç nə ləğv olunmur | ✅ |
| II.3 iki proyekt = iki MR, deploy sırası | **(1)** `api-cbar-admin`: OpenAPI, migration, kod, `Cbar.Domain`. **(2)** `api-cbar`: yalnız `Cbar.Domain` (`Auth.cs`, `CbarDbContext.cs`). Sıra 1 → 2 | ✅ |
| III.2 yeganə yazan | Yeni cədvələ yalnız `api-cbar-admin` yazır. `api-cbar` onu oxumur da | ✅ |
| III.4 JWT, audit | Hər endpoint JWT ilə qorunmağa davam edir, yoxlama daha da sərtləşir. İstifadəçi dəyişikliklərinin audit-i dəyişmir. Rədd audit-ə yox, loga yazılır (R8) | ✅ |
| IV.2 start/deploy sırası | `api-cbar-admin` əvvəl gəlir (migration `0007`). `api-cbar` cədvəldən asılı deyil. Port və skript dəyişmir | ✅ |
| V.1 `Cbar.Domain` bayt-bayt eyni | `UserSecurityStamp` + DbSet + mapping hər iki kopyaya eyni commit-də düşür, `diff -r` boş olmalıdır | ✅ |
| V.2 migration qaydaları | Yeni fayl, `CREATE TABLE IF NOT EXISTS`, FK şərtlidir, `BEGIN/COMMIT` yoxdur, ad hər iki API üzrə unikaldır (R1) | ✅ |
| VII.3 kontrakt geriyə uyğunluğu | Route və cavab gövdələri dəyişmir. 401 artıq mövcud status idi, yeni olan yalnız onun səbəbləridir. Spec-first: OpenAPI əvvəl gəlir ([contracts/access-token.md](./contracts/access-token.md)) | ✅ |
| VII.5 sirlər, `TODO(devops)` | Yeni sirr və Vault açarı yoxdur (Redis-dən imtina edildiyi üçün) | ✅ |
| VIII.1 real icra ilə verification | Lokal stack qaldırıla bilmir (.NET SDK yoxdur). Build pipeline-da, icra `test` mühitində, baseline deploy-dan **əvvəl** | ⚠️ sapma, əsaslandırılıb (Complexity Tracking) |
| VIII.3 iki proyektli verification | `api-cbar` deploy-dan sonra `/healthz` yaşıl qalır və public sorğu işləyir (quickstart ön şərtlər) | ✅ |
| Yeni runtime dependency yalnız spec ilə | Yoxdur | ✅ |
| Mürəkkəblik əsaslandırılır (Governance 4) | Yeni cədvəl R1-də alternativlərlə əsaslandırılıb | ✅ |

**Post-design re-check (Phase 1-dən sonra)**: dizayn bir yeni servis (proyekt daxilində), bir
cədvəl və OpenAPI-də bir təsvir dəyişikliyi əlavə edir. Spec ilə ziddiyyət yoxdur: FR-001…FR-012
hamısı R1–R8-də qarşılanır. Bir dəqiqləşdirmə var: rəddin `WWW-Authenticate` başlığında
`error_description` olmur, gövdə isə eynidir (contracts §2). Nəticə: ✅, bir əsaslandırılmış
sapma (VIII.1).

## Project Structure

### Documentation (this feature)

```text
specs/020-access-token-revocation/
├── spec.md
├── plan.md              # bu fayl
├── research.md          # Phase 0: R1–R8, SP
├── data-model.md        # Phase 1: cədvəl, entity, claim, yoxlama qaydası, keçidlər
├── quickstart.md        # Phase 1: test mühitində ssenarilər (§1–§7)
├── contracts/
│   └── access-token.md  # Phase 1: 401 semantikası, invariantlar, OpenAPI diff
├── checklists/
│   └── requirements.md
└── tasks.md             # Phase 2 (/speckit-tasks)
```

### Source Code (repository root)

```text
# İş paketi 1 — api-cbar-admin (əvvəl deploy)
product-rest/api-cbar-admin/
├── openapi/
│   ├── components/responses.yaml        # ƏVVƏL: Unauthorized təsviri (contracts §4)
│   ├── openapi.yaml                     # # Sync: sətri
│   └── dist/                            # lint + bundle
├── db/migrations/
│   └── 0007-admin-user-security-stamps.sql   # YENİ: cədvəl + şərti FK
└── src/
    ├── Cbar.Domain/
    │   ├── Entities/Auth.cs             # UserSecurityStamp
    │   └── CbarDbContext.cs             # DbSet + mapping
    └── Cbar.AdminApi/
        ├── Services/SecurityStampService.cs   # YENİ: GetOrCreate, Rotate, Validate (+ log)
        ├── Program.cs                   # AddScoped + JwtBearerEvents.OnTokenValidated
        └── Controllers/
            ├── AuthController.cs        # CreateAccessToken(user, stamp) + sst; login/refresh-də GetOrCreate
            └── UsersController.cs       # Update/ResetPassword/Delete: tranzaksiya + Rotate

# İş paketi 2 — api-cbar (1-dən sonra deploy)
product-rest/api-cbar/src/Cbar.Domain/
├── Entities/Auth.cs                     # eyni dəyişiklik, diff boş
└── CbarDbContext.cs                     # eyni dəyişiklik, diff boş
```

**Structure Decision**: Mövcud strukturlar saxlanılır. Servis `Services/`-də yaşayır,
`RefreshTokenService` kimi scoped-dur, çünki `CbarDbContext` istifadə edir. `OnTokenValidated`
onu `RequestServices`-dən alır. Ayrıca middleware və ya authorization policy yazılmır (R4).
`web-cbar-admin-new` toxunulmur.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| VIII.1: verification `dev.ps1` lokal stack-i ilə yox, deploy olunmuş `test` mühitində aparılır | Bu maşında .NET SDK yoxdur, `api-cbar-admin` lokalda nə build, nə run olunur | SDK quraşdırmaq bu task-ın əhatəsindən kənardır. Xərc ölçümü (SC-004) real mühitdə daha etibarlıdır |
| Yeni cədvəl `admin_user_security_stamps` (+ `api-cbar` MR-ı yalnız `Cbar.Domain` üçün) | FR-001/FR-004 hər istifadəçi üçün dəyişən versiya tələb edir | `users`-ə sütun əlavə etmək deploy-u bloklayır. `updated_at` email dəyişikliyində də dəyişir. `user_sessions`-in mənası fərqlidir (research R1) |
