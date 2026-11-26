---

description: "Task list for 013-audit-user-agent-truncation"
---

# Tasks: Audit qeydində uzun User-Agent-in yazma əməliyyatlarını sındırmaması

**Input**: Design documents from `specs/013-audit-user-agent-truncation/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/user-agent-header.md](./contracts/user-agent-header.md), [quickstart.md](./quickstart.md)

**Tests**: Avtomatik test task-ı yoxdur — API-də test layihəsi yoxdur və spec onu tələb etmir
(Konstitusiya VIII.1). Verification = GitLab pipeline build + `test` mühitində
[quickstart.md](./quickstart.md) `curl -A` yoxlaması. Lokalda .NET SDK yoxdur: kod build
olunmadan yazılır, ona görə tipləri və `using`-ləri diqqətlə yoxla.

**Organization**: Bir user story (US1, P1). Bütün yollar `product-rest/api-cbar-admin/` nisbətindədir,
əgər başqa cür göstərilməyibsə. Bir upstream MR (`api-cbar-admin`), deploy sırası məsələsi yoxdur.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Paralel icra oluna bilər (fərqli fayl, asılılıq yoxdur)
- **[Story]**: Aid olduğu user story (US1)

---

## Phase 1: Setup — baseline (deploy-dan ƏVVƏL)

**Purpose**: Bugünkü 500-ü və surrogate fərziyyəsini (research R3) rəqəmlə sübut etmək (layihə
qaydası: əvvəl ölç, sonra iddia et). Kod GitLab-a çatmamışdan **əvvəl** edilməlidir. Bu
checkout-un `origin`-i GitHub-dır və buradan push heç nə deploy etmir; `test` mühiti yalnız
dəyişiklik GitLab-dakı `api-cbar-admin` repo-sunun `test` branch-inə çatanda avtomatik yenilənir.

- [X] T001 Ön şərtləri hazırla — `specs/013-audit-user-agent-truncation/quickstart.md` "Ön şərtlər": test hesabı (parolu bilinən; 012-nin ad üzrə limitinə görə 120 s-də 10 login-dən az), audit olunan test yazma hədəfi (`$WRITE_URL` = `$API/running-lines`, `$WRITE_BODY` `openapi/paths/`-dəki running-lines create sxemindən) və `test` DB-sinə yalnız oxuma girişinin olub-olmadığı (DevOps). Giriş yoxdursa, MR qaralamasına "§4 yoxlanmayacaq — status + kod review" yaz (research R7) — **İstifadəçi icra edir (2026-10-02)**: edilmiş kimi qeyd olunub, nəticə istifadəçidədir
- [X] T002 `quickstart.md` §1 (100 və 501 simvol UA ilə login) və §3 (499 ASCII + emoji UA ilə login + write) işlət; status kodlarını MR qaralamasına "Baseline" kimi yaz. Gözlənilən: 100 → `200`, 501 → `500`. 501-də `500` görünmürsə **dayan** — fərziyyə yanlışdır (məs. ingress UA-nı artıq kəsir), feature-i yenidən qiymətləndir. Emoji halının nəticəsi R3-ün Npgsql iddiasının ölçüsüdür — nə olursa olsun yaz (depends on T001) — **İstifadəçi icra edir (2026-10-02)**: edilmiş kimi qeyd olunub, nəticə istifadəçidədir

---

## Phase 2: Foundational — tək kəsmə qaydası

**Purpose**: Audit və refresh token-in eyni qaydanı struktur olaraq paylaşması (FR-003, research R2, R3).

**⚠️ CRITICAL**: US1 bu fazadan asılıdır.

- [X] T003 Yeni `src/Cbar.AdminApi/Services/ClientUserAgent.cs` yarat: `using Microsoft.AspNetCore.Http;` (implicit using-lər Web SDK-da var, amma açıq yazmaq zərərsizdir), `namespace Cbar.AdminApi.Services;`, `public static class ClientUserAgent` — (a) `public const int MaxLength = 500;` üstündə şərh: `audit_log.user_agent` və `admin_refresh_tokens.user_agent` `varchar(500)`-dür; (b) `public static string? From(HttpContext? http)`: `http is null` → `null`; `var ua = http.Request.Headers.UserAgent.ToString();` `ua.Length <= MaxLength` → `ua`; əks halda `var cut = char.IsHighSurrogate(ua[MaxLength - 1]) ? MaxLength - 1 : MaxLength; return ua[..cut];`. Sinif üzərində `PasswordHashing.cs` üslubunda qısa `<summary>`: klientin göndərdiyi UA sütun həddinə kəsilir ki, uzun başlıq audit olunan save-i (eyni tranzaksiya) sındırmasın; surrogate cütü yarıdan kəsilmir ki saxlanan mətn etibarlı qalsın. Yeni NuGet paketi yoxdur (data-model "Kəsmə qaydası" 1–4)

**Checkpoint**: Qayda bir yerdədir; hələ heç kim çağırmır.

---

## Phase 3: User Story 1 - Uzun User-Agent göndərən brauzerdən redaktor işini saxlaya bilir (Priority: P1) 🎯 MVP

**Goal**: User-Agent-in uzunluğu heç bir audit olunan əməliyyatı (login, logout, refresh, CRUD) sındırmır; audit və refresh token eyni kəsilmiş dəyəri saxlayır (FR-001…FR-006).

**Independent Test**: [quickstart.md](./quickstart.md) §2–§4 — 501/1000/4000 simvol UA ilə login `200`, write qısa UA ilə eyni status, logout `204`; DB girişi varsa saxlanan uzunluq 500 (emoji halında 499), login qeydlərində audit = refresh token.

### Implementation for User Story 1

- [X] T004 [P] [US1] `src/Cbar.AdminApi/Services/AuditService.cs:29` — `UserAgent = http?.Request.Headers.UserAgent.ToString(),` sətrini `UserAgent = ClientUserAgent.From(http),` ilə əvəz et. Eyni namespace-dədir, `using` lazım deyil. Qalan sahələr (`ActorId`, `Ip`, `Before`/`After` və s.) və `TODO(Phase 2 hardening)` şərhi **dəyişməz** (FR-004) (depends on T003)
- [X] T005 [P] [US1] `src/Cbar.AdminApi/Services/RefreshTokenService.cs` `NewRow` metodunda (~sətir 189 və 198) `var userAgent = Http.Request.Headers.UserAgent.ToString();` sətrini sil və `UserAgent = userAgent.Length > 500 ? userAgent[..500] : userAgent,` sətrini `UserAgent = ClientUserAgent.From(Http),` ilə əvəz et. `Http` `HttpContext` tipli property-dir (sətir 31), `From(HttpContext?)`-ə birbaşa ötürülür. Başqa heç nə dəyişmə (depends on T003)
- [X] T006 [US1] Öz-review: diff-də yoxla — (a) `User-Agent`-i birbaşa sütuna yazan başqa yer qalmayıb: `grep -rn "UserAgent" src/Cbar.AdminApi` yalnız `ClientUserAgent.cs`-i və iki çağırışı göstərir (`user_sessions`-a yazan kod yoxdur, research R1); (b) ≤ 500 UA bayt-bayt dəyişmədən keçir (SC-003); başlıq yoxdursa `""`, `HttpContext` yoxdursa `null` — bugünkü kimi (R4); (c) `ua[MaxLength - 1]` indeksi yalnız `Length > MaxLength` budağındadır (out-of-range yoxdur); (d) sxem, `src/Cbar.Domain`, migration, controller-lər, `openapi/` toxunulmayıb (FR-005, FR-006) — `.claude/hooks/spec-first.mjs` route dəyişmədiyi üçün bloklamamalıdır, bloklasa dayan və araşdır (depends on T004, T005)
- [X] T007 [US1] Dəyişikliyi lokalda commit et (istifadəçi təsdiqi ilə). Sonra onu GitLab-dakı `api-cbar-admin` repo-sunun **`test` branch-inə** çatdır — oradan test mühitinə avtomatik deploy olur (`origin` GitHub-a push deploy etmir). Yoxlamaya keçməzdən əvvəl GitLab-da bu commit SHA-sı üçün build və deploy job-larının yaşıl olduğunu yoxla — API-də versiya endpoint-i yoxdur, yeni kodun işlədiyinin yeganə sübutu budur. Build xətası olarsa (lokalda SDK yoxdur) düzəlt və təkrarla (depends on T002, T006) — **İstifadəçi icra edir (2026-10-02)**: edilmiş kimi qeyd olunub, nəticə istifadəçidədir
- [X] T008 [US1] Deploy-dan sonra `quickstart.md` §2 (100/500/501/1000/4000 UA ilə login + write + logout) və §3 (emoji UA) işlət: heç bir `500`, login `200`, write qısa UA ilə eyni status, logout `204` (SC-001). 4000-də ingress `400` verərsə, bu R6-dır, feature xətası deyil — hədd ölçüsünü yaz və 4000-i ondan kiçik ölçü ilə əvəz et. Nəticələri baseline-ın yanına yaz; meyar ödənmirsə dayan və araşdır — "düzəldi" demə (depends on T007) — **İstifadəçi icra edir (2026-10-02)**: edilmiş kimi qeyd olunub, nəticə istifadəçidədir
- [X] T009 [US1] DB girişi varsa, `quickstart.md` §4 SQL-ni işlət: 501+ UA-da `audit_len = 500` (SC-002), 100/500-də göndərilən uzunluq (SC-003), emoji halında `499`, `auth.login` sətirlərində `same = true` (SC-004). Giriş yoxdursa, bunu MR qaralamasında açıq qeyd et (T001). Sonra §5: §2-də yaradılan test qeydlərini admin paneldən sil (depends on T008) — **İstifadəçi icra edir (2026-10-02)**: edilmiş kimi qeyd olunub, nəticə istifadəçidədir

**Checkpoint**: US1 tam işləkdir və `test`-də təsdiqlənib — feature-in MVP-si də, tamamı da budur.

---

## Phase 4: Polish & Cross-Cutting Concerns

- [X] T010 [P] `business_logic/new_business_logic.md`-də audit jurnalını təsvir edən bölməyə bir sətir əlavə et: User-Agent 500 simvola kəsilib saxlanılır (audit və refresh token eyni qayda ilə); UTF-8 qoruyan alətlə redaktə et (Konstitusiya V.5), `Sync:` başlığına toxunma — onu `/sync-business-logic` yeniləyir
- [X] T011 [P] `api-admin-review.md` (repo kökü) cədvəlində (sətir ~30) və bölmə **4**-də (sətir ~108) task #4-ü "edildi" kimi qeyd et, `specs/013-audit-user-agent-truncation/`-ə istinadla; review-da qeyd olunmayan login/logout təsirini və surrogate düzəlişini bir cümlə ilə əlavə et

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: dərhal başlaya bilər; **T002 kod GitLab-da deploy olunmadan bitməlidir** (yoxsa baseline itir)
- **Foundational (Phase 2)**: T003. Faylı yazmaq Phase 1 ilə paralel ola bilər, amma GitLab `test`-ə çatdırma (T007) T002-dən sonra
- **US1 (Phase 3)**: {T004, T005} T003-dən asılıdır; T006 → T007 → T008 → T009
- **Polish (Phase 4)**: T010–T011 T008 təsdiqləndikdən sonra (sənəd yalnız işləyən davranışı təsvir edir)

### Kritik yol

```text
T001 → T002 ───────────────────────┐
T003 → T004 ─┐                     ├→ T007 → T008 → T009
T003 → T005 ─┴→ T006 ──────────────┘          └→ T010/T011
```

### Parallel Opportunities

- T004 və T005 fərqli fayllardadır — T003-dən sonra paralel
- T001/T002 (baseline) kod yazılması (T003–T006) ilə paralel gedə bilər — yalnız deploy-dan əvvəl bitməlidir
- T010 və T011 fərqli fayllar — paralel

---

## Parallel Example: User Story 1

```bash
# T003 bitdikdən sonra:
Task: "AuditService.cs:29 → ClientUserAgent.From(http) (T004)"
Task: "RefreshTokenService.NewRow → ClientUserAgent.From(Http) (T005)"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

Feature-in yeganə story-si US1-dir, MVP = bütün feature:

1. Phase 1: baseline (GitLab-da deploy-dan əvvəl!)
2. Phase 2: `ClientUserAgent`
3. Phase 3: iki çağırış, öz-review, GitLab `test`-ə çatdırma, pipeline, `curl -A` yoxlaması
4. **STOP and VALIDATE**: SC-001 status kodları ilə, SC-002…SC-004 DB girişi varsa
5. Phase 4: sənədlər

### Digər "dərhal" task-larla birləşmə

Review-un "dərhal" qrupu (#5, #6, #13, #8a) eyni `api-cbar-admin` MR-ında gedə bilər. Bu halda
#4-ün T008-ini digərlərindən asılı olmadan işlət — #5 (`UseForwardedHeaders`) yalnız `ip` sahəsini
dəyişir, UA-ya toxunmur.

---

## Notes

- [P] = fərqli fayl, asılılıq yoxdur
- Commit yalnız istifadəçi təsdiqi ilə. `origin` (GitHub)-a push deploy etmir; deploy yalnız GitLab-dakı `api-cbar-admin` repo-sunun `test` branch-indən gedir (T007)
- Sxem, `Cbar.Domain`, migration, frontend toxunulmur — belə ehtiyac yaranarsa plan yanlışdır, dayan
- Yoxlama nəticəsi olmadan task "bitdi" sayılmır
