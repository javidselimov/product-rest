# Implementation Plan: Admin API-nin OpenAPI sənədinin prod-da gizlədilməsi

**Branch**: `014-openapi-hide-in-prod` (spec qovluğu; iş hazırda `test` branch-indədir) | **Date**: 2026-10-05 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/014-openapi-hide-in-prod/spec.md`

## Summary

`api-cbar-admin` generasiya olunmuş API sənədini (`/openapi/v1.json`, ~157 əməliyyat, 155 KB)
hər mühitdə, autentifikasiyasız verir (`Program.cs:72`, ölçülüb: test → 200). Review `IsDevelopment()`
təklif edir, amma dev/test `Staging` adı ilə işləyir və `npm run drift` məhz test-ə qarşıdır —
`IsDevelopment()` drift-i sındırardı (research R1, R2).

Həll: `app.MapOpenApi()` icazə siyahısı şərtinə bağlanır — **`Development` və ya `Staging`**; qalan
hər ad (`Production`, təyin olunmamış, gələcək yeni ad) 404 alır. `AddOpenApi()`, controller-lər,
route-lar, sxem dəyişmir. Paralel olaraq "hər mühitdə açıqdır" deyən 5 sənəd yeri yenilənir.
Lokal build/run yoxdur: compile yoxlaması GitLab pipeline-ıdır, açıq qol publish-dən sonra
`test`-də, bağlı qol ilk prod deploy-dan sonra prod-da yoxlanılır; ona qədər kod review (R5).

## Technical Context

**Language/Version**: C# / .NET 10 (`api-cbar-admin`, `net10.0`)

**Primary Dependencies**: mövcud `Microsoft.AspNetCore.OpenApi` 10.0.8. **Yeni dependency yoxdur**

**Storage**: N/A — verilənlər modeli dəyişmir ([data-model.md](./data-model.md))

**Testing**: avtomatik test yoxdur (Konstitusiya VIII.1). Lokal build/run yoxdur. Kod review +
GitLab pipeline build + publish-dən sonra `test`-də `probe` və `npm run drift` + prod-da `curl` +
`openapi/`-də `npm run lint && npm run bundle` (Node, lokal) ([quickstart.md](./quickstart.md))

**Target Platform**: Linux konteyner (k8s, paylaşılan CBAR Helm chart), ingress arxasında

**Project Type**: web-service (bir upstream repo: `api-cbar-admin`)

**Performance Goals**: yoxdur — start vaxtı bir şərt; prod-da sənəd heç qurulmur

**Constraints**: drift-check skripti dəyişmir (FR-004); `openapi/` `paths` dəyişmir (FR-007);
`.ci-cd/*.yaml`, `Dockerfile`, `.gitlab-ci.yml` toxunulmur (VII.4); lokalda .NET SDK yoxdur və
Docker ilə lokal yoxlama aparılmır — kod yalnız GitLab pipeline-ında build olunur

**Scale/Scope**: `Program.cs`-də 1 sətir → 2 sətir; 5 sənəd faylında 1–2 sətir; ≤ 1 SP

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Maddə | Yoxlama | Status |
|---|---|---|
| I.2–I.3 `product-host` referansı | Spec göstərir: Yii2 admin maşın oxunan API xəritəsi dərc etmirdi — qarşılıq yoxdur, itki yoxdur; feature köhnə vəziyyətə qaytarır | ✅ |
| İş axını 5 — paritet cədvəli | Spec-də var (header, "Paritet"): xəritənin dərc olunmaması bərpa olunur, drift yeni sistemə məxsusdur və saxlanılır | ✅ |
| II.1/II.3 müstəqil proyektlər | Yalnız `api-cbar-admin` — bir MR, deploy sırası yoxdur. Root `GUIDE.md` workspace sənədidir, upstream MR-a getmir. `api-cbar` bilərəkdən toxunulmur (R7) | ✅ |
| III.4 admin API JWT ilə qorunur | Endpoint-lər dəyişmir; xəritə prod-da artıq anonim verilmir — qorunma güclənir | ✅ |
| IV run/start sırası, portlar | Dəyişmir. Lokal `Development` sənədi əvvəlki kimi verir (`CREDENTIALS.md` linki işləyir) | ✅ |
| V `Cbar.Domain` / migration | Toxunulmur | ✅ |
| VII.3 kontrakt geriyə uyğunluğu | Biznes endpoint-ləri eyni ([contracts/](./contracts/openapi-document-endpoint.md)); sənəd ünvanı hand-written spec-də endpoint deyil. Spec-first hook `Program.cs`-ə tətbiq olunmur (controller deyil, route siyahısı dəyişmir) | ✅ |
| VII.4 `.ci-cd` / pipeline | Helm values və pipeline dəyişmir — qərar mövcud `ASPNETCORE_ENVIRONMENT`-ə əsaslanır (konfiq bayrağı rədd edildi, R2) | ✅ |
| VII.5 / VIII.5 `TODO(devops)` | Markerlərə toxunulmur | ✅ |
| VIII.1 real icra ilə verification | `dev.ps1` lokal stack-i qaldırıla bilmir (.NET SDK yoxdur). Açıq qol publish-dən sonra `test`-də real icra olunur (probe + drift); bağlı qol yalnız ilk prod deploy-dan sonra — ona qədər kod review | ⚠️ sapma, əsaslandırılıb (Complexity Tracking) |
| Yeni runtime dependency yalnız spec ilə | Yoxdur | ✅ |

**Post-design re-check (Phase 1-dən sonra)**: dizayn yeni fayl əlavə etmir, yalnız `Program.cs`-də
şərt və sənəd sətirləri. Qayda `Program.cs:67`-dəki mövcud mühitə görə qərar üslubunu təkrarlayır.
Nəticə dəyişmir — bir əsaslandırılmış sapma (VIII.1), qalanı ✅.

## Project Structure

### Documentation (this feature)

```text
specs/014-openapi-hide-in-prod/
├── spec.md
├── plan.md                              # bu fayl
├── research.md                          # Phase 0 — R1–R7
├── data-model.md                        # Phase 1 — mühit adı → 200/404 cədvəli
├── quickstart.md                        # Phase 1 — baseline, publish sonrası test drift, prod
├── contracts/
│   └── openapi-document-endpoint.md     # Phase 1 — sənəd ünvanı + dəyişməyən endpoint-lər
├── checklists/
│   └── requirements.md
└── tasks.md                             # Phase 2 (/speckit-tasks)
```

### Source Code (repository root)

```text
product-rest/api-cbar-admin/                       # upstream repo `api-cbar-admin` — bir MR
├── src/Cbar.AdminApi/
│   └── Program.cs              # :72  app.MapOpenApi() →
│                               #      if (IsDevelopment() || IsStaging()) app.MapOpenApi();
│                               #      + qısa şərh: niyə Staging (test-ə qarşı drift), niyə icazə siyahısı
│                               #      :48 AddOpenApi() dəyişmir (R3)
├── openapi/
│   ├── openapi.yaml            # info.x-known-issues: "exposed in every environment" sətri silinir;
│   │                           # info.description "Maintained by hand" abzasına 1 cümlə (R6)
│   ├── README.md               # "Niyə əl ilə?" — runtime sənəd prod-da yoxdur, drift dev/test/lokala
│   └── dist/openapi.{yaml,json}# npm run bundle ilə yenidən generasiya
├── README.md                   # :36  "/openapi/v1.json (Development and Staging only)"
└── CREDENTIALS.md              # :52  eyni qeyd

GUIDE.md                                           # root, workspace sənədi (upstream deyil)
                                                   # :277 admin API üçün "yalnız Development/Staging"
```

Toxunulmayanlar: `product-rest/api-cbar/**` (R7), `openapi/scripts/drift-check.mjs` (FR-004),
`.ci-cd/*.yaml`, `Dockerfile`, `.gitlab-ci.yml`, `.claude/hooks/*`, `business_logic/*`.

**Structure Decision**: Mövcud `api-cbar-admin` strukturu; dəyişiklik `Program.cs`-in pipeline
qurulması hissəsində, `devSeedFile` qaydasının yanında. Yeni sinif, DI qeydiyyatı və ya konfiqurasiya
açarı yoxdur. Sənəd yeniləmələri eyni MR-da gedir ki, repo heç vaxt kodla ziddiyyətli olmasın (SC-004).

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| VIII.1: verification `dev.ps1` lokal stack-i ilə yox, publish-dən sonra deploy olunmuş `test` (açıq qol) və prod (bağlı qol) ilə; prod-a qədər bağlı qol yalnız kod review ilə | Bu maşında .NET SDK yoxdur, lokal Docker yoxlaması aparılmır (istifadəçi qərarı); dev/test `Staging`-dir — `Production` qolunu prod-dan əvvəl icra edən mühit yoxdur | SDK quraşdırmaq və ya lokal Docker yoxlaması istifadəçi tərəfindən rədd edilib. Risk məhduddur: bağlı qol səhv olsa, prod bugünkü vəziyyətdə qalır (sənəd açıq) və ilk prod yoxlamasında görünür; açıq qolun səhvi `test`-də dərhal görünür |
