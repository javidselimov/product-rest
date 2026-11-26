---

description: "Task list for 011-login-timing-enumeration"
---

# Tasks: Login cavab vaxtı üzrə username enumeration-ı bağlamaq

**Input**: Design documents from `specs/011-login-timing-enumeration/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/auth-login.md](./contracts/auth-login.md), [quickstart.md](./quickstart.md)

**Tests**: Avtomatik test task-ı yoxdur — API-də test layihəsi yoxdur və spec onu tələb etmir
(Konstitusiya VIII.1). Verification = GitLab pipeline build + `test` mühitində
[quickstart.md](./quickstart.md) ölçümü. Lokalda .NET SDK yoxdur: kod build olunmadan yazılır,
ona görə tipləri və `using`-ləri diqqətlə yoxla.

**Organization**: Bir user story (US1, P1). Bütün yollar `product-rest/api-cbar-admin/` nisbətindədir,
əgər başqa cür göstərilməyibsə. Bir upstream MR (`api-cbar-admin`), deploy sırası məsələsi yoxdur.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Paralel icra oluna bilər (fərqli fayl, asılılıq yoxdur)
- **[Story]**: Aid olduğu user story (US1)

---

## Phase 1: Setup — baseline ölçüm (deploy-dan ƏVVƏL)

**Purpose**: Bugünkü ~250 ms fərqi rəqəmlə sübut etmək (layihə qaydası: əvvəl ölç, sonra iddia et).
Kod GitLab-a çatmamışdan **əvvəl** edilməlidir. Bu checkout-un `origin`-i GitHub-dır və buradan push heç nə deploy etmir; `test` mühiti yalnız dəyişiklik GitLab-dakı `api-cbar-admin` repo-sunun `test` branch-inə çatanda avtomatik yenilənir.

- [ ] T001 Test mühitində (`https://api-cbar-admin-test.cbar.az/api/v1`) üç login adını hazırla: `EXISTING` (aktiv, parolu bilinən), `INACTIVE` (deaktiv — yoxdursa admin paneldən test hesabı yarat və deaktiv et), `MISSING` (`nobody-$(date +%s)`); adları (parolsuz) MR qaralamasına yaz — `specs/011-login-timing-enumeration/quickstart.md` "Ön şərtlər" — **Qismən:** `MISSING` və `admin` (EXISTING, parolsuz) hazırdır; `INACTIVE` hesab və doğru parol istifadəçidən gözlənilir
- [ ] T002 `specs/011-login-timing-enumeration/quickstart.md` §1 skriptini Git Bash-də işlət (hər qrupa 30 sorğu, növbələşdirilmiş) və §4 uğurlu login ölçümünü də et; `missing` / `wrongpw` / `inactive` / `ok` medianlarını və status saylarını MR qaralamasına "Baseline" kimi yaz. Gözlənilən: `wrongpw` digər iki uğursuz qrupdan ~0.25 s yavaş. Fərq görünmürsə **dayan** və səbəbi araşdır (fərziyyə yanlışdır) — **Qismən (2026-10-01):** `missing`/`wrongpw` ölçüldü (fərq ~342 ms, [measurements.md](./measurements.md)); `inactive` və `ok` kredensial gözləyir

---

## Phase 2: Foundational — tək iş faktoru və dummy hash

**Purpose**: Dummy hash-ın xərcini real hash-larla struktur olaraq bağlamaq (research R2, R3).

**⚠️ CRITICAL**: US1 bu fazadan asılıdır.

- [X] T003 Yeni `src/Cbar.AdminApi/Services/PasswordHashing.cs` yarat: `namespace Cbar.AdminApi.Services;`, `public static class PasswordHashing` — (a) `public const int WorkFactor = 12;`, (b) `public static readonly string DummyHash = BCrypt.Net.BCrypt.HashPassword(Convert.ToBase64String(System.Security.Cryptography.RandomNumberGenerator.GetBytes(32)), WorkFactor);`. Sinif üzərində `UniqueSlug` (`Services/SlugService.cs`) üslubunda qısa `<summary>`: dummy hash login-də istifadəçi tapılmayanda bcrypt işini bərabərləşdirmək üçündür, parol heç yerdə saxlanılmır, iş faktoru yeni parollarla ortaq olmalıdır ki xərc ayrılmasın. Yeni NuGet paketi əlavə etmə (`BCrypt.Net-Next` 4.2.0 artıq var)
- [X] T004 `src/Cbar.AdminApi/Controllers/UsersController.cs` — iki `BCrypt.Net.BCrypt.HashPassword(..., workFactor: 12)` çağırışında (Create, ~sətir 84; ResetPassword, ~sətir 143) `12`-ni `PasswordHashing.WorkFactor` ilə əvəz et. `using Cbar.AdminApi.Services;` faylda artıq var. Başqa heç nə dəyişmə (depends on T003)

**Checkpoint**: Yeni parol hash-ları və dummy hash eyni sabitdən oxuyur.

---

## Phase 3: User Story 1 - Hücumçu cavab vaxtından hansı login adlarının mövcud olduğunu öyrənə bilmir (Priority: P1) 🎯 MVP

**Goal**: Mövcud olmayan, deaktiv, silinmiş hesab və səhv parol hallarında server eyni bcrypt işini görür; cavab vaxtı ad mövcudluğunu açmır (FR-001…FR-007).

**Independent Test**: [quickstart.md](./quickstart.md) §2–§5 — üç uğursuz qrupun median fərqi < 25 ms, statuslar və gövdələr eyni, uğurlu login 10/10.

### Implementation for User Story 1

- [X] T005 [US1] `src/Cbar.AdminApi/Controllers/AuthController.cs` `Login` metodunda (sətir 36–45): `user` sorğusundan sonra, `if`-dən **əvvəl** ayrıca sətir əlavə et — `var verified = BCrypt.Net.BCrypt.Verify(request.Password, user?.PasswordHash ?? PasswordHashing.DummyHash);` — və şərti `if (user is null || !verified)` et. Üstünə bir sətirlik şərh: istifadəçi tapılmasa da bcrypt işlənir ki, cavab vaxtı adın mövcudluğunu açmasın (deaktiv və soft-delete olunmuş hesablar da bu yola düşür). `if` gövdəsi (log + `Unauthorized(new { message = "Invalid credentials." })`), kilid yoxlaması (sətir 47–48) və uğur yolu **dəyişməz** qalır (FR-003, FR-005, FR-006; research R4, R5). `using Cbar.AdminApi.Services;` artıq var (depends on T003)
- [X] T006 [US1] Öz-review: `AuthController.cs` və `UsersController.cs` diff-ində yoxla — (a) `Verify` heç bir yolda short-circuit ilə ötürülmür; (b) `user is null` halında giriş `verified`-dən asılı olmayaraq rədd olunur (FR-004); (c) `DummyHash` heç bir log, audit və ya cavaba düşmür; (d) cavab mətni, status, log şablonu bayt-bayt eynidir; (e) yalnız route əlavə/silinmədiyi üçün `.claude/hooks/spec-first.mjs` redaktəni bloklamır — bloklasa, dayan və səbəbi araşdır; (f) silinmiş hesab `User`-in query filter-i (`DeletedAt == null`, `src/Cbar.Domain/CbarDbContext.cs:97`) ilə axtarışdan düşür, yəni `user is null` → dummy yolu, və login sorğusunda bu filter `IgnoreQueryFilters()` ilə söndürülməyib (FR-002, SC-002) (depends on T004, T005)
- [ ] T007 [US1] Dəyişikliyi lokalda commit et (istifadəçi təsdiqi ilə). Sonra onu GitLab-dakı `api-cbar-admin` repo-sunun **`test` branch-inə** çatdır — oradan test mühitinə avtomatik deploy olur, manual approval yoxdur (`origin` GitHub-a push deploy etmir). Ölçümə keçməzdən əvvəl GitLab-da bu commit SHA-sı üçün build və deploy job-larının yaşıl olduğunu və deploy-un bitmə vaxtını yoxla — API-də versiya endpoint-i yoxdur, yeni kodun işlədiyinin yeganə sübutu budur. Build xətası olarsa (lokalda SDK yoxdur) düzəlt və təkrarla (depends on T006)
- [ ] T008 [US1] Deploy-dan sonra `specs/011-login-timing-enumeration/quickstart.md` §2 (eyni ölçüm skripti, eyni üç ad) işlət: `missing` vs `wrongpw` və `inactive` vs `wrongpw` median fərqi < 0.025 s (SC-001, SC-002), hər üç faylda status 100% `401` (SC-003). Rəqəmləri baseline-ın yanına yaz. Meyar ödənmirsə dayan və araşdır — "düzəldi" demə (depends on T007)
- [ ] T009 [US1] `quickstart.md` §3 (başlıq və gövdə eyniliyi, SC-003), §4 (10/10 uğurlu login, median məlumat üçün baseline ilə yanaşı yazılır — meyar deyil, SC-004; sonra `web-cbar-admin-next`-də giriş + səhifə yeniləmə) və §5 (pod logunda `Login failure for <ad> from <ip>` hər uğursuz cəhd üçün, dummy hash heç yerdə yox, FR-005) yoxlamalarını et; nəticələri MR qaralamasına yaz (depends on T007)

**Checkpoint**: US1 tam işləkdir və ölçümlə təsdiqlənib — feature-in MVP-si də, tamamı da budur.

---

## Phase 4: Polish & Cross-Cutting Concerns

- [ ] T010 [P] `business_logic/new_business_logic.md` §10.1 "Login axını"-na bir sətir əlavə et: istifadəçi tapılmasa da dummy hash ilə BCrypt işlənir (timing enumeration qorunması); UTF-8 qoruyan alətlə redaktə et (Konstitusiya V.5), `Sync:` başlığına toxunma — onu `/sync-business-logic` yeniləyir
- [ ] T011 [P] `api-admin-review.md` cədvəlində və bölmə **3**-də task #3-ü "edildi" kimi qeyd et (spec `specs/011-login-timing-enumeration/`-ə istinadla)
- [X] T012 [P] (İstəyə bağlı, contracts/auth-login.md) `openapi/paths/auth.yaml` `login.description`-a bir cümlə: "Failure responses take the same time whether or not the username exists." Etsən, `openapi/`-də lint + bundle işlət ki `openapi/dist/` təzə qalsın; route dəyişmədiyi üçün spec-first təsdiqi lazım deyil
- [ ] T013 Əgər #2 (lockout, rate limiter, lock oracle) eyni MR-a qoşulursa: kilid yoxlamasını parol yoxlamasından əvvələ köçürərkən kilidli hesabda da `Verify` çağırılmalıdır (research R5) və ölçüm zamanı limiter `429` verə bilər (quickstart "Ön şərtlər"); #2-dən sonra T008-i kilidli hesab qrupu ilə təkrarla

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: dərhal başlaya bilər; **T002 kod GitLab-da deploy olunmadan bitməlidir** (yoxsa baseline itir)
- **Foundational (Phase 2)**: T003 → T004. Faylları yazmaq Phase 1 ilə paralel ola bilər, amma GitLab `test`-ə çatdırma (T007) T002-dən sonra
- **US1 (Phase 3)**: T005 T003-dən asılıdır; T006 → T007 → {T008, T009}
- **Polish (Phase 4)**: T010–T012 T008 təsdiqləndikdən sonra (sənəd yalnız işləyən davranışı təsvir edir); T013 yalnız #2 qoşulursa

### Kritik yol

```text
T001 → T002 ─────────────────────┐
T003 → T004 ─┐                   ├→ T007 → T008 → T010/T011/T012
T003 → T005 ─┴→ T006 ────────────┘        └→ T009
```

### Parallel Opportunities

- T004 və T005 fərqli fayllardadır — T003-dən sonra paralel yazıla bilər
- T001/T002 (ölçüm) kod yazılması (T003–T006) ilə paralel gedə bilər — yalnız GitLab-da deploy-dan əvvəl bitməlidir
- T008 və T009 deploy-dan sonra paralel
- T010, T011, T012 fərqli fayllar — paralel

---

## Parallel Example: User Story 1

```bash
# T003 bitdikdən sonra:
Task: "UsersController.cs-də workFactor: 12 → PasswordHashing.WorkFactor (T004)"
Task: "AuthController.Login-də Verify-ı if-dən əvvələ çıxar (T005)"

# Deploy-dan sonra:
Task: "quickstart §2 vaxt ölçümü (T008)"
Task: "quickstart §3–§5 gövdə/uğurlu login/log yoxlaması (T009)"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

Feature-in yeganə story-si US1-dir, MVP = bütün feature:

1. Phase 1: baseline ölç (GitLab-da deploy-dan əvvəl!)
2. Phase 2: `PasswordHashing` + `UsersController`
3. Phase 3: `AuthController`, öz-review, GitLab `test`-ə çatdırma, pipeline, ölçüm
4. **STOP and VALIDATE**: SC-001…SC-004 rəqəmlərlə ödənib
5. Phase 4: sənədlər

### #2 ilə birləşmə

Review tövsiyəsinə görə #2 ilə eyni MR mümkündür. Bu halda 011 task-larını əvvəl bitir və
ölç (T008), sonra #2-ni əlavə et və T013-ü icra et — iki dəyişikliyin təsirini ayrı-ayrı görmək
üçün.

---

## Notes

- [P] = fərqli fayl, asılılıq yoxdur
- Commit yalnız istifadəçi təsdiqi ilə. `origin` (GitHub)-a push deploy etmir; deploy yalnız GitLab-dakı `api-cbar-admin` repo-sunun `test` branch-indən gedir (T007)
- Sxem, `Cbar.Domain`, migration, frontend toxunulmur — belə ehtiyac yaranarsa plan yanlışdır, dayan
- Ölçüm rəqəmləri olmadan task "bitdi" sayılmır
