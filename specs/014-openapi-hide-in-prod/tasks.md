---

description: "Task list — Admin API-nin OpenAPI sənədinin prod-da gizlədilməsi"
---

# Tasks: Admin API-nin OpenAPI sənədinin prod-da gizlədilməsi

**Input**: Design documents from `specs/014-openapi-hide-in-prod/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md),
[data-model.md](./data-model.md), [contracts/openapi-document-endpoint.md](./contracts/openapi-document-endpoint.md),
[quickstart.md](./quickstart.md)

**Tests**: avtomatik test task-ı yoxdur — API-də test yığını yoxdur (Konstitusiya VIII.1) və spec
test istəmir.

**Verification qaydası (bu feature üçün)**: bu maşında .NET SDK yoxdur və lokal Docker yoxlaması
aparılmır — backend lokalda **nə build, nə run olunur**. Compile yoxlaması GitLab pipeline-ıdır.
Davranış **publish-dən sonra** yoxlanılır: `test` (`Staging`) — açıq qol + drift; prod
(`Production`) — bağlı qol, ilk prod deploy-dan sonra. Ona qədər bağlı qol kod review ilə yoxlanılır
(research R5). "Build keçir" yalnız GitLab pipeline yaşıl olanda deyilir.

**Organization**: kod dəyişikliyi bir `if`-dir və hər iki story-yə xidmət edir; sənəd dəyişiklikləri
də eyni publish-ə getməlidir. Ona görə kod + sənəd + commit/publish Foundational fazadadır. Story
fazaları publish-dən sonra həmin dəyişikliyin iki qolunu ayrı yoxlayır: US1 = bağlı qol
(`Production`), US2 = açıq qol (`Staging` + drift).

Yollar repo kökünə nisbətəndir. Bütün kod və upstream sənəd dəyişiklikləri bir upstream repo-dadır
(`product-rest/api-cbar-admin`) — bir MR. Azərbaycan hərfli fayllar yalnız UTF-8 qoruyan alətlə
redaktə olunur (Konstitusiya V.5).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: paralel icra oluna bilər (fərqli fayl, tamamlanmamış task-dan asılılıq yoxdur)
- **[Story]**: US1, US2 — spec.md-dəki user story-lər

---

## Phase 1: Setup (baseline — publish-dən əvvəl)

**Purpose**: dəyişiklikdən əvvəlki vəziyyəti ölçmək — sonrakı müqayisə bu nəticələrə qarşıdır

- [X] T001 `specs/014-openapi-hide-in-prod/quickstart.md` §1-in ilk hissəsini işlət: `probe https://api-cbar-admin-test.cbar.az` (gözlənilən `openapi 200 ~155079B`, `healthz 200`), test hesabı ilə `login_status` (gözlənilən `login 200`; 012-nin ad üzrə limitinə görə cəhdləri az saxla) və `product-rest/api-cbar-admin/openapi/`-də `npm ci && npm run drift > /tmp/drift-before.txt; echo "exit $?"`. Nəticələri bu faylın sonundakı **Nəticələr** bölməsinə yaz, test-in hazırda işlətdiyi commit SHA-sını da (GitLab-dan) qeyd et. `npm ci` sertifikat xətası verərsə `NODE_EXTRA_CA_CERTS` istifadə et (`strict-ssl=false` yox). Test artıq yeni kodu işlədirsə (sənəd 404 verir), baseline etibarsızdır — dayan və bildir
- [X] T002 Repo kökündən `node .claude/skills/sync-openapi/scripts/route-diff.mjs api-cbar-admin > /tmp/route-diff-before.txt; echo "exit $?"` — T001-dəki `npm run drift` bundle-ı artıq yaradıb. Exit 1 burada mövcud fərqlər deməkdir, xəta deyil; çıxışı **Nəticələr**-ə yaz (depends on T001)

---

## Phase 2: Foundational (kod + sənəd + publish)

**Purpose**: hər iki story-nin dayandığı dəyişiklik və onun test-ə çatdırılması

**⚠️ CRITICAL**: US1 və US2 yoxlamaları T012-dən (publish) sonra başlayır

- [X] T003 `product-rest/api-cbar-admin/src/Cbar.AdminApi/Program.cs`-də sətir 72-dəki `app.MapOpenApi();`-ni `if (app.Environment.IsDevelopment() || app.Environment.IsStaging()) app.MapOpenApi();` ilə əvəz et, `app.UseSerilogRequestLogging();`-dən sonra və `app.UseCors();`-dan əvvəl qalsın (sıra dəyişmir). Üstünə faylın şərh üslubunda (bax sətir 52–53) qısa ingiliscə şərh yaz: sənəd yalnız Development və Staging-də verilir; Staging dev/test-dir və `openapi/scripts/drift-check.mjs` test-ə qarşı işləyir; icazə siyahısıdır ki, yeni və ya səhv yazılmış mühit adı bağlı qalsın (spec 014). `builder.Services.AddOpenApi();` (sətir 48) **dəyişmir** (research R3). Başqa heç bir faylda kod dəyişikliyi yoxdur; `product-rest/api-cbar/**`-a toxunma (R7). Build yoxlanılmır — lokalda mümkün deyil
- [X] T004 [P] `product-rest/api-cbar-admin/openapi/openapi.yaml`-da `info.x-known-issues` siyahısından `'`/openapi/v1.json` is exposed in every environment, without authentication.'` sətrini sil; `info.description`-da "Maintained by hand (see `README.md`): the runtime `/openapi/v1.json` …" abzasının sonuna bir cümlə əlavə et: runtime document is served only in Development and Staging (local, dev, test) — not in Production. `paths/`-a və birinci sətirdəki `# Sync:` başlığına toxunma (FR-007, research R6)
- [X] T005 [P] `product-rest/api-cbar-admin/openapi/README.md`-də "Niyə əl ilə?" bölməsinə bir cümlə əlavə et: runtime `/openapi/v1.json` yalnız `Development` və `Staging`-də (lokal, dev, test) verilir, prod-da 404-dür; `npm run drift` ona görə yalnız test-ə (default) və ya lokala (`API_URL=http://localhost:5253`, SDK olan maşında) qarşı işləyir
- [X] T006 [P] `product-rest/api-cbar-admin/README.md:36`-dakı "Plus `GET /healthz` and the OpenAPI document at `/openapi/v1.json`." cümləsinə "(Development and Staging only — not served in Production)" əlavə et
- [X] T007 [P] `product-rest/api-cbar-admin/CREDENTIALS.md:52` cədvəl sətrində `/openapi/v1.json`-un yanına "(not in Production)" əlavə et; lokal URL-lər dəyişmir
- [X] T008 [P] Root `GUIDE.md:277`-dəki "OpenAPI sənədi: `/openapi/v1.json` (hər iki API-də)." sətrini dəqiqləşdir: admin API-də yalnız `Development`/`Staging`-də (prod-da yoxdur), public API-də hər mühitdə. Bu workspace faylıdır — upstream MR-a getmir
- [X] T009 `quickstart.md` §5: `product-rest/api-cbar-admin/openapi/`-də `npm run lint && npm run bundle` — hər ikisi uğurlu olmalıdır, `dist/openapi.{yaml,json}` yenilənir. Sonra repo kökündən `node .claude/skills/sync-openapi/scripts/route-diff.mjs api-cbar-admin > /tmp/route-diff-after.txt` və `diff /tmp/route-diff-before.txt /tmp/route-diff-after.txt` — **boş olmalıdır** (route siyahısı dəyişməyib; meyar exit kodu yox, T002 ilə eynilikdir) (depends on T002, T004)
- [X] T010 `git grep -n "exposed in every environment" -- product-rest/api-cbar-admin` boş qaytarmalıdır; `git grep -n "openapi/v1.json" -- product-rest/api-cbar-admin GUIDE.md` çıxışındakı hər sətrin yeni davranışla ziddiyyət təşkil etmədiyini yoxla (SC-004) (depends on T004–T008)
- [X] T011 `quickstart.md` §2 kod review: `Program.cs`-dəki şərti mühit adı → nəticə cədvəli ilə sətir-sətir tutuşdur (`Development`/`Staging` → 200; `Production`, təyin olunmamış, `Test` → 404); `MapOpenApi()` ikinci dəfə çağırılmır, `AddOpenApi()` və middleware sırası dəyişməyib. `git diff --stat`-ı plan.md-dəki "Source Code" ağacı ilə tutuşdur — siyahıdan kənar fayl (xüsusilə `product-rest/api-cbar/**`, `.ci-cd/*`, `Dockerfile`, `drift-check.mjs`) olmamalıdır. Bu, bağlı qolun prod-a qədər **yeganə** yoxlamasıdır — nəticəni **Nəticələr**-ə yaz (depends on T003, T009, T010)
- [ ] T012 Dəyişikliyi lokalda commit et (**istifadəçi təsdiqi ilə**); istifadəçi onu GitLab-dakı `api-cbar-admin` repo-sunun **`test` branch-inə** publish edir — `origin` GitHub-dır, oradan push deploy etmir. GitLab-da həmin commit SHA-sı üçün build, deploy və `verify` job-larının yaşıl olduğunu yoxla: **build yaşıl = kod compile olunur** (lokalda yoxlanmayıb). Build qırmızıdırsa, xətanı logdan oxu, T003-ü düzəlt və təkrarla. `verify` qırmızıdırsa — onun sənəd ünvanını yox `/healthz`-i yoxladığı fərziyyəsi (spec Assumptions) səhvdir, dayan və araşdır (depends on T011) — **İstifadəçi icra edir**

**Checkpoint**: yeni kod `test`-də işləyir — story yoxlamaları başlaya bilər

---

## Phase 3: User Story 1 — Anonim ziyarətçi prod-da admin API-nin xəritəsini ala bilmir (Priority: P1) 🎯 MVP

**Goal**: `Production` mühitində `GET /openapi/v1.json` → 404, boş gövdə, token ilə də; `/healthz` və login dəyişmir (FR-001, FR-003, FR-005)

**Independent Test**: ilk prod deploy-dan sonra `quickstart.md` §4. Prod-dan əvvəl `Production` adı ilə işləyən mühit yoxdur (dev/test `Staging`-dir) — o vaxta qədər bu qol T011 kod review ilə yoxlanılıb

- [ ] T013 [US1] Publish-dən sonra `test`-də bağlı qolun **görünməməsini** təsdiqlə: `probe https://api-cbar-admin-test.cbar.az` 200 qaytarmalıdır — test `Staging`-dir, burada 404 gözlənilmir. 404 görünsə, bu US1 uğuru deyil, US2 uğursuzluğudur (T014-ə bax). MR təsvirinə açıq yaz: "Production qolu prod-a qədər yalnız kod review ilə yoxlanılıb (T011)" (depends on T012)
- [ ] T014 [US1] **Təxirə salınmış** — ilk prod deploy-dan sonra, `api-cbar-admin.cbar.az` resolve olunanda: `quickstart.md` §4 — `openapi 404 0B`, `healthz 200`, ünvan variantları (`/openapi/v1.json/`, `/OPENAPI/V1.JSON`) 404, doğru login uğurlu və alınan token ilə sənəd sorğusu yenə 404 (SC-001, SC-003). Login nəticəsini T015-də `Staging`-də yazılanla müqayisə et. Prod hesabı və parolu Vault-dandır, istifadəçidədir. Sənəd 200 verərsə — şərt səhvdir, prod bugünkü vəziyyətdədir (reqressiya yox), T003-ü düzəlt. Bu task MR-ı bloklamır — **İstifadəçi icra edir**

**Checkpoint**: bağlı qol prod-da sübut olundu

---

## Phase 4: User Story 2 — Komanda test mühitində drift-check-i əvvəlki kimi işlədə bilir (Priority: P1)

**Goal**: `Staging`-də (dev/test) sənəd bugünkü kimi verilir; `npm run drift` skript dəyişmədən işləyir (FR-002, FR-004)

**Independent Test**: publish-dən sonra `quickstart.md` §3 — sənəd 200, drift tamamlanır və nəticəsi baseline ilə eynidir

- [ ] T015 [US2] Publish-dən sonra `quickstart.md` §3: `probe https://api-cbar-admin-test.cbar.az` → `openapi 200` (~155 KB, T001-ə yaxın), `healthz 200`; test hesabı ilə `login_status` → T001 ilə eyni (`login 200`) (depends on T012)
- [ ] T016 [US2] `product-rest/api-cbar-admin/openapi/`-də `npm run drift > /tmp/drift-after.txt; echo "exit $?"` və `diff /tmp/drift-before.txt /tmp/drift-after.txt` — eyni olmalıdır (SC-002). Fərq varsa, hər sətri bu publish-ə düşmüş başqa commit-lərin endpoint dəyişiklikləri ilə izah et (`git log` T001-də qeyd olunan test SHA-sından bəri); izah olunmayan fərq = dayan və araşdır. `…/openapi/v1.json → 404` isə **həmişə** uğursuzluqdur: test-də deploy geri alınır və T003 yoxlanılır. Nəticələri **Nəticələr**-ə yaz (depends on T015)
- [X] T017 [US2] `Development` qolu (US2 ssenari 3) bu maşında icra olunmur — SDK yoxdur. T011-də kod review ilə yoxlanıldığını **Nəticələr**-də qeyd et; SDK olan maşında `dotnet run --project src/Cbar.AdminApi` → `http://localhost:5253/openapi/v1.json` 200 ilə təsdiqlənə bilər (opsional, MR-ı bloklamır) (depends on T011)

**Checkpoint**: açıq qol və drift test-də sübut olundu

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: review sənədini nəticə ilə yeniləmək

- [ ] T018 Root `api-admin-review.md`-də cədvəl sətri 40-da (`| 13 | OpenAPI-ni prod-da gizlətmək |`) son sütuna status yaz (`specs/014-openapi-hide-in-prod/`-ə istinadla; T014 hələ edilməyibsə "test-də yoxlanılıb, prod yoxlaması gözləyir"), bölmə **13**-də (sətir ~177) bir-iki cümlə əlavə et: `IsDevelopment()` əvəzinə `Development || Staging` seçildi, çünki dev/test `Staging`-dir və drift test-ə qarşıdır; drift pipeline-da deyil, əl ilə işlədilir; `api-cbar`-da da eyni şərtsiz `MapOpenApi()` var (`Program.cs:113`) — ayrıca task (depends on T016)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: T001 → T002; **publish-dən (T012) əvvəl** bitməlidir — sonra baseline götürmək mümkün deyil
- **Foundational (Phase 2)**: T003–T008 paralel (T003 Setup-dan asılı deyil); T009 (T002, T004-dən sonra) → T010 → T011 → T012 (publish)
- **US1 (Phase 3)**: T013 T012-dən sonra; T014 ilk prod deploy-dan sonra (MR-ı bloklamır)
- **US2 (Phase 4)**: T015 → T016 T012-dən sonra; T017 T011-dən sonra
- **Polish (Phase 5)**: T018 T016-dan sonra; T014 edildikdə statusu yenilə

### User Story Dependencies

- **US1 (P1)**: T011 (kod review) + T012-dən asılı; real icra yalnız prod-da (T014). US2-dən asılı deyil
- **US2 (P1)**: T012-dən asılı; US1-dən asılı deyil

### Parallel Opportunities

- T003 ∥ T004 ∥ T005 ∥ T006 ∥ T007 ∥ T008 — altı fərqli fayl; T001/T002 ilə də paralel ola bilər (baseline yalnız deploy olunmuş test-i ölçür, lokal faylları yox — amma T009 T002-ni gözləyir)
- Publish-dən sonra T013 ∥ T015

---

## Parallel Example: Foundational

```text
Task: "T003 Program.cs — MapOpenApi() şərtə"
Task: "T004 openapi.yaml x-known-issues + info.description"
Task: "T005 openapi/README.md"
Task: "T006 README.md:36"
Task: "T007 CREDENTIALS.md:52"
Task: "T008 GUIDE.md:277"
```

---

## Implementation Strategy

### MVP First

1. T001–T002 baseline (publish-dən əvvəl!)
2. T003–T011 kod + sənəd + lokal Node gate-ləri + kod review
3. T012 publish → GitLab build yaşıl (yeganə compile yoxlaması)
4. **STOP and VALIDATE**: T015–T016 — test-də sənəd 200, drift baseline ilə eyni. Uğursuzsa geri al
5. T018 review qeydi; T014 prod deploy-dan sonra

US1 və US2 eyni sətrin iki qoludur, ayrı-ayrı deploy olunmur — bir MR, bir publish.

---

## Nəticələr

### Baseline — 2026-10-05, publish-dən əvvəl (T001, T002)

| Yoxlama | Nəticə |
|---|---|
| `probe https://api-cbar-admin-test.cbar.az` | `openapi 200 155079B`, `healthz 200` |
| `npm run drift` → `/tmp/drift-before.txt` | exit 0 — `spec 163 ops, API 162 ops, 66 request bodies compared, 0 differences` (fərq 1 = `GET /healthz`, generasiya olunmuş sənəddə yoxdur) |
| `route-diff.mjs api-cbar-admin` → `/tmp/route-diff-before.txt` | exit 0 — `code 162 ops, spec 163 ops`, `no differences` |
| `login_status` (test) | **edilməyib** — test hesabının parolu bu sessiyada yoxdur. T015-də istifadəçi publish-dən əvvəl/sonra eyni hesabla müqayisə edir |
| Test-in işlətdiyi commit SHA | GitLab-a giriş yoxdur — istifadəçi T012-də qeyd edir. Sənəd 200 verdiyi üçün test köhnə kodu işlədir (baseline etibarlıdır) |

`npm ci` işlədilmədi — `openapi/node_modules` artıq mövcud idi; lokal Node v24.13.0.

### Lokal gate-lər (T009, T010)

- `npm run lint` — valid (2 problem açıq şəkildə ignore olunub, əvvəldən); `npm run bundle` — exit 0.
- `route-diff` T002 ilə eyni (`diff` boş) — route siyahısı dəyişməyib.
- `git grep "exposed in every environment"` — boş. `openapi/v1.json` qalan istinadları yeni davranışla uyğundur.

### Kod review (T011, T017)

- `Program.cs:72–76`: `if (app.Environment.IsDevelopment() || app.Environment.IsStaging()) app.MapOpenApi();` + 3 sətir şərh.
  `Development`/`Staging` → true (200); `Production`, təyin olunmamış, istənilən başqa ad → false (404).
  `IsDevelopment`/`IsStaging` ad müqayisəsi böyük-kiçik hərfə həssas deyil. Hər ikisi
  `Microsoft.Extensions.Hosting` extension-larıdır, `IsDevelopment()` artıq sətir 67-də istifadə olunur — yeni using lazım deyil.
- `MapOpenApi()` bir dəfə çağırılır; `AddOpenApi()` (sətir 48) və middleware sırası dəyişməyib.
- `git diff --stat`: 6 fayl (`Program.cs`, `openapi/openapi.yaml`, `openapi/README.md`, `README.md`, `CREDENTIALS.md`, root `GUIDE.md`) — plan-dakı ağacla eyni; `api-cbar`, `.ci-cd`, `Dockerfile`, `drift-check.mjs` toxunulmayıb.
- **Build lokalda yoxlanılmayıb** (SDK yoxdur) — compile yoxlaması T012-də GitLab pipeline-dır.
- `Development` qolu (US2 ssenari 3) icra olunmayıb — yalnız bu review ilə.

---

## Notes

- [P] = fərqli fayl, asılılıq yoxdur
- Backend lokalda build/run olunmur — "build keçir" yalnız GitLab pipeline-dan sonra deyilir
- Commit yalnız istifadəçi təsdiqi ilə (T012); publish (GitLab `test`) və prod yoxlaması (T014) istifadəçidədir
- `TODO(devops)` markerlərinə toxunulmur
