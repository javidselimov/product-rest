# Implementation Plan: Admin panel — davamlı sessiya (httpOnly cookie + refresh token)

**Branch**: `005-admin-persistent-session` (spec qovluğu; iş hazırda `test` branch-indədir) | **Date**: 2026-09-23 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/005-admin-persistent-session/spec.md`

## Summary

Admin panel səhifə yenilənəndə sessiyanı itirir, çünki 15 dəqiqəlik access token yalnız
yaddaşdadır və API-də refresh yoxdur. Həll **hibrid modeldir** (research R1):

- access token bugünkü kimi yaddaşda qalır və bearer ilə göndərilir;
- `api-cbar-admin` login-də uzunömürlü **refresh token**-i `HttpOnly; SameSite=Strict; Path=/api/v1/auth`
  cookie-sində verir;
- yeni `POST /auth/refresh` (rotasiya + reuse detection) və `POST /auth/logout` əlavə olunur;
- `web-cbar-admin-new` açılışda və token bitəndə səssizcə refresh edir.

Mövcud (istifadə olunmayan) `refresh_tokens` cədvəli rotasiya zənciri üçün bir migration
ilə genişlənir. Kontent endpoint-ləri və köhnə `web-cbar-admin` dəyişmir.

**Açıq suallar** (dizaynı dəyişmir, R0): Q1 → default *8 saat hərəkətsizlik / 7 gün
maksimum*; Q2a → default *panelin prod host-u `cbar.az` altına köçür*. İstifadəçi fərqli
cavab versə yalnız konfiq dəyərləri / DevOps tapşırığı dəyişir.

## Technical Context

**Language/Version**: C# / .NET 10 (`api-cbar-admin`); TypeScript strict, React 19 (`web-cbar-admin-new`)

**Primary Dependencies**: ASP.NET Core (JwtBearer, CORS — mövcud), EF Core + Npgsql (mövcud); Axios, Zustand, TanStack Router/Query, MSW (mövcud). **Yeni dependency yoxdur** — `RandomNumberGenerator`, `SHA256`, `navigator.locks`, `BroadcastChannel` platformanın özündədir

**Storage**: PostgreSQL — mövcud `refresh_tokens` cədvəli + migration `0004-refresh-token-rotation.sql`

**Testing**: API — avtomatik test yoxdur (Konstitusiya VIII.1): build + curl ssenariləri; panel — Vitest + RTL + MSW, `npm run verify`

**Target Platform**: Linux konteyner (API, k8s); müasir brauzerlər (Chrome/Edge/Firefox/Safari son 2 versiya)

**Project Type**: web-service + SPA (iki müstəqil upstream repo)

**Performance Goals**: sessiya bərpası < 1 s (SC-001); refresh = bir indeksli sorğu + bir insert

**Constraints**: panel və API hər mühitdə eyni saytda (R3); JS heç bir uzunömürlü sirri görmür; köhnə panel ilə geriyə uyğunluq; bu maşında .NET SDK yoxdur (R14)

**Scale/Scope**: onlarla admin istifadəçi; 2 proyekt, ~10 fayl API + ~8 fayl panel

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Maddə | Yoxlama | Status |
| --- | --- | --- |
| I.2 `product-host` istinadı | spec `LoginController`/`LoginViewModel`/`components.php` (`authTimeout 28800`) göstərir; idle default ondan götürülüb | ✅ |
| I.3 Səssiz itki yoxdur | Köhnənin "məni xatırla" (1 il) funksiyası Q1-də açıq qərara çıxarılıb | ✅ (qərar gözlənilir) |
| II.3 İki MR, deploy sırası | API MR → panel MR; uyğunluq matrisi R13 | ✅ |
| II.4 Yalnız HTTP + sxem əlaqəsi | kontrakt `contracts/auth-api.md` | ✅ |
| III.1 Admin/client ayrılığı | yalnız admin cütü; `api-cbar` bu cədvəli oxumur | ✅ |
| III.4 JWT + audit | kontent endpoint-ləri JWT ilə qalır; `auth/refresh`, `auth/logout` anonimdir (login kimi) — cookie ilə qorunur; login/logout/reuse `audit_log`-a (R9) | ✅ əsaslandırılmış istisna |
| IV.3 Portlar | dəyişmir; `Cors:Origins` Development-ə 5174 əlavə olunur (konfiq, port yox) | ✅ |
| V.1 `Cbar.Domain` eyniliyi | `RefreshToken` + `CbarDbContext` hər iki kopyada eyni commit-də; diff = 0 | ✅ |
| V.2 Migration qaydaları | `0004-refresh-token-rotation.sql`: append-only, `IF NOT EXISTS`, `BEGIN/COMMIT` yox, ad unikal (`api-cbar`-da migration yoxdur) | ✅ |
| VI.1/VI.2 Template stack | yeni lib yox; FSD: transport `shared/api`, körpü `app/providers`, feature `features/auth` | ✅ |
| VI.4 "token yalnız yaddaşda" | access token yaddaşda qalır; refresh token JS-ə heç gəlmir (httpOnly) — maddənin məqsədi (JS-dən oxunan sirr yoxdur) güclənir. Spec 001 FR-010-un "yenilənəndə yenidən daxil olur" hissəsi bu spec ilə əvəzlənir | ✅ |
| Template konst. "Token localStorage-da yox", "sensitive data log-a düşmür" | storage-a heç nə yazılmır; token/hash log/audit-ə yazılmır | ✅ |
| VII.4 CI/CD | `.gitlab-ci.yml`, `Dockerfile` dəyişmir; `.ci-cd` host dəyişikliyi yalnız Q2a-dan sonra, `TODO(devops)` saxlanır | ✅ |
| VII.5 Sirlər | yeni sirr yoxdur; Development cookie `Secure=false` yalnız lokal | ✅ |
| VIII Verification | API: build + quickstart §1–§2 (SDK olan maşın/CI); panel: `npm run verify`; birgə: quickstart §4 | ✅ (SDK məhdudiyyəti qeyd olunub) |

**Nəticə**: pozuntu yoxdur; Complexity Tracking boşdur.

**Post-design re-check** (Phase 1-dən sonra): data-model yalnız mövcud cədvəli genişləndirir,
yeni paylaşılan cədvəl, port, dependency və proyekt yoxdur — status dəyişmir ✅.

## Project Structure

### Documentation (this feature)

```text
specs/005-admin-persistent-session/
├── spec.md
├── plan.md              # bu fayl
├── research.md          # R0–R14
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── auth-api.md      # login / refresh / logout HTTP kontraktı
│   └── panel-session.md # panelin sessiya davranışı
├── checklists/requirements.md
└── tasks.md             # /speckit-tasks
```

### Source Code

```text
# İş paketi A — api-cbar-admin (MR 1, əvvəl deploy)
api-cbar-admin/
├── db/migrations/0004-refresh-token-rotation.sql        # YENİ
├── src/Cbar.Domain/Entities/Auth.cs                     # RefreshToken: FamilyId, FamilyCreatedAt, ReplacedById
├── src/Cbar.Domain/CbarDbContext.cs                     # indekslər
├── src/Cbar.AdminApi/
│   ├── Controllers/AuthController.cs                    # login: cookie; refresh; logout
│   ├── Controllers/UsersController.cs                   # deaktiv/şifrə/silmə → sessiyaları ləğv et
│   ├── Services/RefreshTokenService.cs                  # YENİ: issue / rotate / revoke / cleanup, cookie yazma
│   ├── Services/AuditService.cs                         # Log(..., actorId?) overload
│   ├── Program.cs                                       # CORS AllowCredentials, servis qeydiyyatı
│   ├── appsettings.json                                 # Jwt:Refresh*, Auth:*
│   └── appsettings.Development.json                     # Secure=false, Cors 5174
api-cbar/
└── src/Cbar.Domain/{Entities/Auth.cs,CbarDbContext.cs}  # A ilə bayt-bayt eyni (eyni dəyişiklik)

# İş paketi B — web-cbar-admin-new (MR 2, API-dən sonra)
web-cbar-admin-new/
├── src/main.tsx                                         # render-dən əvvəl restoreSession()
├── src/features/auth/api/auth.service.ts                # login withCredentials; refresh; logout
├── src/features/auth/model/auth-store.ts                # status: restoring|anonymous|authenticated
├── src/features/auth/components/login-form.tsx          # (ehtimal: dəyişməz; store.login eyni)
├── src/shared/api/interceptors.ts                       # AuthHooks: getToken, refresh, onSessionExpired; 401 → refresh → retry
├── src/app/providers/auth-bridge.ts                     # single-flight + navigator.locks, BroadcastChannel, scheduleExpiry silinir
├── src/app/shell/topbar.tsx                             # logout → serverə çağırış (auth-bridge vasitəsilə)
├── src/shared/testing/handlers/auth.ts                  # refresh/logout mock-ları + sessiya vəziyyəti
├── src/features/auth/auth-flow.test.tsx                 # yenilənmiş/yeni ssenarilər
├── src/locales/{az,en}/auth.json                        # (lazım olsa) yeni mesaj açarları
└── .env.production                                      # VITE_API_URL → api-cbar-admin.cbar.az (Q2)

# İş paketi C — DevOps / sənədlər
web-cbar-admin-new/.ci-cd/prod.yaml                      # host → cbar.az altında (Q2a təsdiqindən sonra, TODO(devops) qalır)
api-cbar-admin/.ci-cd/*.yaml                             # yalnız şərh: Cors__Origins__0 = panelin dəqiq host-u
specs/001-admin-template-migration/spec.md               # FR-010-a "005 ilə əvəzlənib" qeydi
```

**Structure Decision**: iki mövcud upstream proyekt, yeni proyekt/qovluq yoxdur. API-də
auth məntiqi `AuthController`-dən `RefreshTokenService`-ə çıxarılır ki, `UsersController`
ləğvi eyni kodu istifadə etsin. Panel tərəfdə FSD sərhədi qorunur: `shared/api`
features-dən asılı deyil, refresh funksiyası `app/providers/auth-bridge` tərəfindən
hook kimi verilir.

## Implementation notes (tasks üçün)

1. **Migration**: sütunları nullable əlavə et → `DELETE FROM refresh_tokens WHERE family_id IS NULL`
   (heç vaxt verilməmiş sətirlər) → `SET NOT NULL`; indekslər `IF NOT EXISTS`.
2. **Rotasiya atomikliyi**: `UPDATE refresh_tokens SET revoked_at=now(), replaced_by_id=@new
   WHERE id=@old AND revoked_at IS NULL` — təsirlənən sətir 0 olarsa reuse/stale yoluna düş.
3. **IP**: `X-Forwarded-For` ingress arxasında — mövcud `RemoteIpAddress` istifadəsi ilə
   eyni (ForwardedHeaders konfiqi bu spec-in əhatəsində deyil).
4. **Cookie yazma** yalnız `RefreshTokenService`-də bir yerdə (ad, path, Secure, SameSite konfiqdən).
5. **Panel interceptor**: `config._retry` bayrağı; `/auth/login|refresh|logout` URL-ləri
   refresh axınından çıxarılır.
6. **Testlərdə** `navigator.locks` / `BroadcastChannel` yoxdursa fallback yolu işləməlidir.

## Complexity Tracking

Pozuntu yoxdur.
