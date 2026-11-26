# Research: Admin API-nin OpenAPI sənədinin prod-da gizlədilməsi

Bütün faktlar 2026-10-05 tarixində kod oxunaraq və test mühitinə sorğu ilə ölçülüb.

## R1 — Bu gün nə açıqdır və kim istifadə edir

**Ölçmə**:

- `product-rest/api-cbar-admin/src/Cbar.AdminApi/Program.cs:48` `builder.Services.AddOpenApi()`,
  `:72` `app.MapOpenApi()` — şərtsiz, `RequireAuthorization` yoxdur. Default ünvan
  `/openapi/{documentName}.json` → `/openapi/v1.json`.
- `curl https://api-cbar-admin-test.cbar.az/openapi/v1.json` → **200, 155 079 bayt**, token olmadan.
  Sənəddə ~157 əməliyyat və bütün request DTO-ları var (`users`, `roles`, `media`, `settings` daxil).
- Prod hostname `api-cbar-admin.cbar.az` (`.ci-cd/prod.yaml`, `TODO(devops)`) DNS-də resolve
  olunmur (`curl` exit 6) — prod hələ deploy olunmayıb və ya xaricə açıq deyil.
- İstehlakçılar (repo axtarışı `openapi/v1.json`):
  - `openapi/scripts/drift-check.mjs:51` — default `API_URL=https://api-cbar-admin-test.cbar.az`;
  - sənədlər: `README.md:36`, `CREDENTIALS.md:52`, `openapi/README.md`, root `GUIDE.md:277`,
    `openapi/openapi.yaml` `info.x-known-issues`;
  - admin panellər, `api-cbar`, `.claude/hooks/spec-first.mjs` — **oxumur** (hook yerli
    `openapi/dist/openapi.json`-u oxuyur, runtime sənədi yox).
- `.gitlab-ci.yml` yalnız `devops-linux-team/ci-cd` `dotnet-multi` pipeline-ını daxil edir; drift
  orada **yoxdur**, əl ilə işlədilir (`openapi/README.md` "Endpoint dəyişəndə" addım 4,
  `/sync-openapi`, `/api-endpoint`).

**Nəticə**: review-un "Drift-check pipeline-da …" şərti — drift pipeline-da deyil, amma əl ilə
**test**-ə qarşı işlədilir; test-də sənəd açıq qalmalıdır.

## R2 — Hansı mühitlərdə açıq: şərtin forması

**Ölçmə** — `ASPNETCORE_ENVIRONMENT`:

| Mühit | Dəyər | Mənbə |
|---|---|---|
| lokal | `Development` | `Properties/launchSettings.json` (hər iki profil) |
| dev | `Staging` | `.ci-cd/dev.yaml` |
| test | `Staging` | `.ci-cd/test.yaml` |
| prod | `Production` | `.ci-cd/prod.yaml` |
| təyin olunmayıb | `Production` | ASP.NET Core default-u (`Dockerfile`-da `ASPNETCORE_ENVIRONMENT` yoxdur) |

**Decision**: `if (app.Environment.IsDevelopment() || app.Environment.IsStaging()) app.MapOpenApi();`
— açıq **icazə siyahısı**.

**Rationale**:

- Review-un `IsDevelopment()` təklifi test-i (`Staging`) bağlayar → drift-check `404` ilə
  `throw` edər (`drift-check.mjs:52`). FR-004 pozulur.
- `!IsProduction()` da FR-001/FR-002-ni ödəyir, amma gələcək yeni ad (`Test`, `Preprod`,
  hərf səhvi `Prodution`) sənədi **açar** — təhlükəsiz tərəfə yıxılmır. İcazə siyahısında yeni
  ad avtomatik bağlıdır (spec Edge Cases, FR-003). Mühit adları Helm values-dadır və nadir
  dəyişir, ona görə siyahını genişləndirmək şüurlu, görünən addım olur.
- Kod daxilində artıq eyni üslub var: `Program.cs:67` (`devSeedFile`) və
  `Services/MediaStorage.cs:67` mühitə görə `IsDevelopment()` ilə qərar verir.

**Alternatives considered**:

- `IsDevelopment()` — rədd: drift-check-i sındırır (yuxarıda).
- `!IsProduction()` — rədd: yeni/səhv mühit adında açıq qalır.
- Konfiqurasiya bayrağı (`OpenApi:Enabled`, Helm `env`-də) — rədd: üç `.ci-cd/*.yaml`-a dəyişiklik
  və default-un harada yaşayacağı qərarı tələb edir; 1 SP-dən böyükdür, mühit adı isə artıq
  mövcud siqnaldır. Gələcəkdə ehtiyac olsa, ayrıca task.
- Hər mühitdə açıq, amma `RequireAuthorization()` ilə — rədd: drift-check-ə token lazım olardı
  (skript dəyişir, test hesabı sirrini idarə etmək lazımdır), prod-da isə autentifikasiyalı
  istifadəçiyə də sənəd lazım deyil (spec US1 ssenari 2).

## R3 — `AddOpenApi()` qalırmı

**Decision**: `builder.Services.AddOpenApi()` **dəyişmir**, yalnız `MapOpenApi()` şərtə bağlanır.

**Rationale**: `AddOpenApi` yalnız servis qeydiyyatıdır; sənəd yalnız ünvana sorğu gələndə
qurulur. Endpoint xəritələnməyəndə prod-da heç bir iş görülmür. `Microsoft.Extensions.ApiDescription.Server`
referansı yoxdur (`Cbar.AdminApi.csproj`), yəni build vaxtı sənəd generasiyası da yoxdur — build
mühitə bağlı deyil. İkisini də şərtə salmaq kodu mürəkkəbləşdirir, faydası yoxdur.

**Alternatives considered**: hər ikisini `if` içinə almaq — rədd (fayda yox, iki yerdə şərt).

## R4 — Prod-da cavab nə olacaq

**Ölçmə**: `Program.cs` — `UseStaticFiles`, `MapFallback*`, `FallbackPolicy` **yoxdur**
(`AddAuthorization()` parametrsizdir). Xəritələnməmiş route routing-dən keçmir, authorization
middleware endpoint-siz sorğunu ötürür, pipeline sonunda **404, boş gövdə** qaytarılır.

**Decision**: əlavə "404 handler" yazılmır — default davranış spec FR-001-i ödəyir (404, xəritə yox).
Token-li sorğu da eyni 404-ü alır (endpoint yoxdur, auth heç nəyi dəyişmir).

**Ünvan variantları** (`/openapi/v1.json/`, `/OPENAPI/V1.JSON`, `/openapi/v2.json`): hamısı yalnız
`MapOpenApi`-nin route-u ilə uyğunlaşa bilərdi; o olmayanda hamısı 404-dür.

## R5 — Verification yolu

**Məhdudiyyət**: lokalda .NET SDK yoxdur (memory: `no-dotnet-sdk-locally`) və lokal Docker
yoxlaması aparılmır (istifadəçi qərarı, 2026-10-05) — backend lokalda nə build, nə run olunur.
Prod hostname resolve olunmur.

**Decision** (üç qat, hamısı publish-dən sonra, kod review istisna):

1. **Kod review** (commit-dən əvvəl) — dəyişiklik bir `if`-dir; mühit adı → nəticə cədvəli
   ([data-model.md](./data-model.md)) sətir-sətir şərtlə tutuşdurulur. **GitLab pipeline build**
   (`test` branch) compile yoxlamasıdır — lokalda build olmadığı üçün yeganə.
2. **`test` mühiti (Staging) deploy-dan sonra**: `/openapi/v1.json` → 200 (FR-002) və
   `npm run drift` uğurla tamamlanır (FR-004, SC-002). Baseline **deploy-dan əvvəl** götürülür
   (R1-dəki 200 / 155 079 bayt + bugünkü `drift` çıxışı), sonra müqayisə edilir.
3. **Production davranışı (FR-001/FR-003)** — ilk prod deploy-dan sonra `curl` (quickstart §4).
   Ona qədər bağlı qol yalnız kod review ilə yoxlanılıb; MR təsvirində bu açıq yazılır.

**Rationale**: dev və test hər ikisi `Staging`-dir — prod-dan əvvəl `Production` adı ilə işləyən
mühit yoxdur, ona görə bağlı qolu real icra edən ilk yer prod-dur. Risk məhduddur: şərt səhv
olarsa, prod-da sənəd açıq qalar — bugünkü vəziyyət, reqressiya deyil; açıq qolun səhvi isə
test-də dərhal görünür (drift 404).

**Alternatives considered**: lokal Docker image-ı `Production`/`Staging` ilə işlətmək (`Dockerfile`
SDK-nı konteynerdə gətirir) — istifadəçi tərəfindən rədd edildi; yoxlama yalnız publish-dən sonra.

## R6 — Sənədlər və hand-written spec

**Decision**:

- `openapi/openapi.yaml` `info.x-known-issues`: sətir silinir (problem həll olunur). Yerinə
  `info.description`-ın "Maintained by hand" abzasına bir cümlə: runtime sənəd yalnız
  Development/Staging-də verilir. `paths` toxunulmur (FR-007). Sonra `npm run lint && npm run bundle`.
  `# Sync:` başlığına toxunulmur — bu, `/sync-openapi`-nin işidir, endpoint dəyişmədiyi üçün lazım deyil.
- `openapi/README.md`: "Niyə əl ilə?" abzasına — runtime sənəd prod-da yoxdur; `drift` yalnız
  dev/test-ə (və ya lokala, `API_URL=http://localhost:5253`) qarşı.
- `README.md:36`, `CREDENTIALS.md:52`: "(not in Production)" qeydi.
- root `GUIDE.md:277`: admin API üçün "yalnız Development/Staging" (root faylıdır, upstream MR-a
  daxil deyil — workspace sənədi).
- `business_logic/new_business_logic.md:671` mühit qaydasını demir — dəyişmir; `/sync-business-logic`
  sonrakı sync-də özü götürə bilər.

**Spec-first hook**: `Program.cs` controller deyil, route `METHOD path` siyahısı dəyişmir — hook
təsirlənmir, `/api-endpoint` axını tətbiq olunmur.

## R7 — `api-cbar`

**Ölçmə**: `product-rest/api-cbar/src/Cbar.WebApi/Program.cs:113` da şərtsiz `MapOpenApi()`;
`api-cbar/openapi/scripts/drift-check.mjs` da test-ə qarşı işləyir.

**Decision**: əhatədən kənar (spec Assumptions). Plan heç bir `api-cbar` faylına toxunmur. Review
cədvəlinə ayrıca tövsiyə: eyni R2 qaydası orada da tətbiq oluna bilər (ayrıca MR, asılılıq yoxdur).
