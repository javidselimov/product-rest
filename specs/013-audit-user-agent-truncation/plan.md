# Implementation Plan: Audit qeydində uzun User-Agent-in yazma əməliyyatlarını sındırmaması

**Branch**: `013-audit-user-agent-truncation` (spec qovluğu; iş hazırda `test` branch-indədir) | **Date**: 2026-10-02 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/013-audit-user-agent-truncation/spec.md`

## Summary

`AuditService.Log` `User-Agent`-i kəsmədən `audit_log.user_agent varchar(500)`-ə yazır. 500
simvoldan uzun UA-da PostgreSQL yazmanı rədd edir və audit əsas dəyişikliklə eyni tranzaksiyada
olduğu üçün bütün save — **login daxil** — 500 ilə uğursuz olur (research R1).

Həll: kəsmə qaydası kiçik statik köməkçiyə (`Services/ClientUserAgent.cs`) çıxarılır və həm
`AuditService`, həm `RefreshTokenService` onu çağırır — iki qeyd eyni dəyəri saxlayır (FR-003,
R2). Köməkçi həm də bugünkü `[..500]`-ün surrogate cütünü yarıdan kəsmə kənarını bağlayır (R3).
Sxem, `Cbar.Domain`, kontrakt və frontend dəyişmir.

## Technical Context

**Language/Version**: C# / .NET 10 (`api-cbar-admin`)

**Primary Dependencies**: mövcud (ASP.NET Core, EF Core + Npgsql). **Yeni dependency yoxdur**

**Storage**: PostgreSQL `audit_log`, `admin_refresh_tokens` — sxem və migration dəyişikliyi yoxdur

**Testing**: avtomatik test yoxdur (Konstitusiya VIII.1); GitLab-dakı `api-cbar-admin` repo-sunun
`test` branch-i → pipeline build + avtomatik deploy, sonra `test` mühitində `curl -A` ilə
([quickstart.md](./quickstart.md)). Bu checkout-un `origin`-i GitHub-dır, oradan push deploy etmir

**Target Platform**: Linux konteyner (k8s), ingress arxasında

**Project Type**: web-service (bir upstream repo)

**Performance Goals**: yoxdur — sorğu başına bir uzunluq yoxlaması

**Constraints**: kontrakt dəyişmir (FR-006); sxem dəyişmir (FR-005); qısa UA bayt-bayt eyni
saxlanılır (SC-003); lokalda .NET SDK yoxdur — kod build olunmadan yazılır, pipeline yoxlayır

**Scale/Scope**: 1 yeni kiçik statik sinif (~15 sətir), `AuditService` və `RefreshTokenService`-də
hərəsi 1 sətir; ≤ 1 SP kod + deploy/yoxlama dövrü

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Maddə | Yoxlama | Status |
|---|---|---|
| I.2–I.3 `product-host` referansı | Spec `QradarLogger`-i (§7.4) göstərir; köhnə sistemdə audit əməliyyatı sındırmırdı — reqressiya aradan qaldırılır, UA saxlanması qalır | ✅ |
| II.1/II.3 müstəqil proyektlər | Yalnız `api-cbar-admin` — bir MR, deploy sırası yoxdur | ✅ |
| III.2/III.4 admin ayrılığı, JWT, audit | Audit atomikliyi saxlanılır (ayrı tranzaksiya rədd edildi, R2); audit indi uzun UA ilə də yazılır — qorunma güclənir | ✅ |
| IV run/start sırası | Port, skript, start sırası dəyişmir | ✅ |
| V `Cbar.Domain` / migration | Entity, EF modeli və sxem toxunulmur (`HasMaxLength` bilərəkdən əlavə edilmir, R2) → iki kopya sinxronu məsələsi yoxdur | ✅ |
| VII.3 kontrakt geriyə uyğunluğu | Route, sorğu, cavab eyni ([contracts/user-agent-header.md](./contracts/user-agent-header.md)); `/sync-openapi` lazım deyil, spec-first hook keçir | ✅ |
| VIII.1 real icra ilə verification | Lokal stack qaldırıla bilmir (.NET SDK yoxdur). Build pipeline-da, icra `test`-də; baseline deploy-dan **əvvəl** götürülür. Saxlanan dəyəri yoxlamaq `test` DB-sinə oxuma girişi tələb edir (R7) | ⚠️ sapma, əsaslandırılıb (Complexity Tracking) |
| Yeni runtime dependency yalnız spec ilə | Yeni dependency yoxdur | ✅ |

Bir əsaslandırılmış sapma var (VIII.1), qalan maddələr uyğundur. **Post-design re-check
(Phase 1-dən sonra)**: dizayn yeni fayl kimi yalnız `Services/ClientUserAgent.cs` əlavə edir
(proyekt daxilində, paylaşılan kod deyil; `MediaStorageOptions` kimi `api-cbar`-da kopyası
lazım deyil, çünki `api-cbar` audit və ya refresh token yazmır) — nəticə dəyişmir, ✅.

## Project Structure

### Documentation (this feature)

```text
specs/013-audit-user-agent-truncation/
├── spec.md
├── plan.md                    # bu fayl
├── research.md                # Phase 0
├── data-model.md              # Phase 1 — sxem dəyişikliyi yoxdur, kəsmə qaydası
├── quickstart.md              # Phase 1 — baseline + deploy sonrası curl -A yoxlaması
├── contracts/
│   └── user-agent-header.md   # Phase 1 — dəyişməyən HTTP kontraktı + status invariantı
├── checklists/
│   └── requirements.md
└── tasks.md                   # Phase 2 (/speckit-tasks)
```

### Source Code (repository root)

```text
product-rest/api-cbar-admin/src/Cbar.AdminApi/Services/
├── ClientUserAgent.cs        # YENİ: MaxLength = 500 (audit_log / admin_refresh_tokens sütunu),
│                             #       From(HttpContext?) → null | "" | ≤500, surrogate-safe
├── AuditService.cs           # :29  UserAgent = ClientUserAgent.From(http)
└── RefreshTokenService.cs    # :189/:198  UserAgent = ClientUserAgent.From(Http)
```

**Structure Decision**: Mövcud `api-cbar-admin` strukturu; köməkçi `Services/`-də yaşayır
(011-dəki `PasswordHashing` kimi). DI qeydiyyatı lazım deyil — vəziyyətsiz statik metoddur.
`api-cbar` toxunulmur.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| VIII.1: verification `dev.ps1` lokal stack-i ilə yox, deploy olunmuş `test` mühitində | Bu maşında .NET SDK yoxdur, `api-cbar-admin` lokalda nə build, nə run olunur | SDK quraşdırmaq bu task-ın əhatəsindən kənardır. Real ingress yolu əlavə olaraq R6-dakı başlıq limitini də göstərir |
