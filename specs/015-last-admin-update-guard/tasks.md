---

description: "Task list for 015-last-admin-update-guard"
---

# Tasks: Son aktiv administratorun redaktə ilə itirilməsinin qarşısının alınması

**Input**: Design documents from `specs/015-last-admin-update-guard/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/users-update.md](./contracts/users-update.md), [quickstart.md](./quickstart.md)

**Tests**: Avtomatik test task-ı yoxdur — API-də test layihəsi yoxdur və spec onu tələb etmir
(Konstitusiya VIII.1). Verification = GitLab pipeline build + `test` mühitində
[quickstart.md](./quickstart.md) `curl` + panel yoxlaması. Lokalda .NET SDK yoxdur: kod build
olunmadan yazılır, ona görə tipləri və sorğuları diqqətlə yoxla.

**Organization**: İki user story (US1 P1 — qoruma, US2 P2 — reqressiya yoxdur). Kod dəyişikliyi bir
fayldadır və hər iki story-yə xidmət edir; story fazaları kodu və yoxlamanı ayırır. Bütün yollar
`product-rest/api-cbar-admin/` nisbətindədir, əgər başqa cür göstərilməyibsə. Bir upstream MR
(`api-cbar-admin`), deploy sırası məsələsi yoxdur.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Paralel icra oluna bilər (fərqli fayl, asılılıq yoxdur)
- **[Story]**: Aid olduğu user story (US1, US2)

---

## Phase 1: Setup — `test` mühitinin hazırlığı

**Purpose**: Yoxlama üçün lazım olan hesabları və girişləri əvvəlcədən müəyyən etmək (research R6).

- [ ] T001 `specs/015-last-admin-update-guard/quickstart.md` "Ön şərtlər"-i hazırla: (a) `test`-də parolu bilinən admin hesabı `$A` (`$A_ID`, `$A_EMAIL`); (b) `GET $API/users?pageSize=100` ilə `test`-dəki bütün aktiv adminlərin siyahısı — `$A`-dan başqa varsa, onları US1 yoxlaması üçün müvəqqəti deaktiv etməyi komanda ilə razılaşdır və ya US1-in yalnız kod review ilə yoxlanacağını MR qaralamasına yaz; (c) admin və moderator `roleId`-ləri `GET $API/users/{id}` cavabından (rollar üçün endpoint yoxdur); (d) `test` DB-sinə yalnız oxuma girişi (audit yoxlaması üçün) var/yox — **İstifadəçi icra edir**

---

## Phase 2: Foundational — spec-first və ortaq qayda

**Purpose**: Kontraktı əvvəl yeniləmək (CLAUDE.md spec-first) və "başqa aktiv admin varmı?" qaydasını bir yerə çıxarmaq (FR-004, research R2, R5).

**⚠️ CRITICAL**: US1 və US2 bu fazadan asılıdır.

- [X] T002 [P] `openapi/paths/users.yaml` `put` → `updateUser.description`-da (~sətir 86-92) "No last-admin guard here: the last active admin can be deactivated or demoted." cümləsini [contracts/users-update.md](./contracts/users-update.md) "`updateUser.description` yeni mətni" blokundakı mətnlə əvəz et (409 cavabı `responses`-da artıq var — ona toxunma). `delete` təsviri dəyişmir. Sonra `openapi/`-də `npm run lint` və `npm run bundle` işlət (`dist/openapi.yaml`, `dist/openapi.json` yenilənir); lint xətasız olmalıdır. `openapi.yaml`-dakı `# Sync:` sətrinə toxunma
- [X] T003 [P] `src/Cbar.AdminApi/Controllers/UsersController.cs`-də `PasswordPolicyError`-dan əvvəl private metod əlavə et: `private Task<bool> HasOtherActiveAdminAsync(int exceptUserId) => db.Users.AnyAsync(u => u.Id != exceptUserId && u.IsActive && u.Role.Code == "admin");` üstündə qısa şərh: silmə və redaktə eyni qaydanı istifadə edir; `db.Users` query filter-i soft-delete olunmuşları çıxarır. `Delete`-də (~sətir 171-177) inline `otherActiveAdmins` sorğusunu `if (!await HasOtherActiveAdminAsync(id))` ilə əvəz et — şərt (`entity.Role.Code == "admin" && entity.IsActive`) və mesaj "Cannot delete the last active administrator." **dəyişməz** (FR-006)

**Checkpoint**: Spec yenilənib, qayda bir yerdədir; `Delete` davranışı eyni.

---

## Phase 3: User Story 1 - Son aktiv admin öz hesabını redaktə ilə əlçatmaz edə bilmir (Priority: P1) 🎯 MVP

**Goal**: Son aktiv adminin deaktivasiyası və/və ya rolunun endirilməsi 409 ilə rədd edilir, heç nə saxlanılmır, audit yazılmır, sessiyalar ləğv olunmur (FR-001…FR-003).

**Independent Test**: [quickstart.md](./quickstart.md) §3 — `$A` yeganə aktiv admin olduqda §3.1–§3.4 `409`, §3.5 `200`, §3.6-da hesab dəyişməyib və audit qeydi yoxdur; §4 panel mesajı.

### Implementation for User Story 1

- [X] T004 [US1] `src/Cbar.AdminApi/Controllers/UsersController.cs` `Update`-də (~sətir 100-137): (a) `if (!await db.Roles.AnyAsync(r => r.Id == dto.RoleId))` yoxlamasını `var newRoleCode = await db.Roles.Where(r => r.Id == dto.RoleId).Select(r => r.Code).SingleOrDefaultAsync(); if (newRoleCode is null) return BadRequest(new { message = "Role not found." });` ilə əvəz et (mesaj və sıra eyni); (b) `emailTaken` yoxlamasından sonra, `var before = …` sətrindən **əvvəl** əlavə et: `var losesAdmin = entity.IsActive && entity.Role.Code == "admin" && (!dto.IsActive || newRoleCode != "admin");` və `if (losesAdmin && !await HasOtherActiveAdminAsync(id)) return Conflict(new { message = "Cannot deactivate or demote the last active administrator." });` üstündə bir sətir şərh (Delete-dəki qaydanın redaktə tərəfi, spec 015). `entity` artıq `Include(u => u.Role)` ilə yüklənir — `entity.Role.Code` cari roldur. Qalan kod (reaktivasiya, audit, revoke, `Reference.LoadAsync`) dəyişmir (depends on T003)
- [X] T005 [US1] Öz-review: diff-də yoxla — (a) 409 qayıdışı `entity.Email/RoleId/IsActive` təyinlərindən, `audit.Log`-dan, `SaveChangesAsync`-dən və `RevokeAllForUserAsync`-dən əvvəldir (FR-002); (b) sıra 400 → 404 → 409 (email) → 409 (son admin) — [data-model.md](./data-model.md) "Prioritet"; (c) `data-model.md` keçid cədvəlinin 6 sətrinin hər biri koda uyğundur (deaktiv admin, aktivləşdirmə, admin rolu vermə, yalnız email → qorumaya düşmür); (d) `HasOtherActiveAdminAsync` hər iki yerdə hədəfin `id`-si ilə çağırılır; (e) `using`-lər kifayətdir (`Where`/`Select` — `System.Linq`, implicit); (f) sxem, `src/Cbar.Domain`, migration, `api-cbar`, `web-cbar-admin-new` toxunulmayıb; `.claude/hooks/spec-first.mjs` route dəyişmədiyi üçün bloklamamalıdır — bloklasa dayan və araşdır (depends on T002, T004)
- [ ] T006 [US1] Dəyişikliyi lokalda commit et (istifadəçi təsdiqi ilə). Sonra GitLab-dakı `api-cbar-admin` repo-sunun **`test` branch-inə** çatdır — oradan test mühitinə avtomatik deploy olur (`origin` GitHub-a push deploy etmir). Yoxlamadan əvvəl GitLab-da bu commit SHA-sı üçün build və deploy job-larının yaşıl olduğunu yoxla. Build xətası olarsa (lokalda SDK yoxdur) düzəlt və təkrarla (depends on T005) — **İstifadəçi icra edir**
- [ ] T007 [US1] Deploy-dan sonra (və T008-dən **sonra**, çünki quickstart §3 §2-də yaradılan `$B`-ni silməklə başlayır) `quickstart.md` §3 işlət: §3.1–§3.4 `409` + mesaj, §3.5 `200`, §3.6 `GET $API/users/$A_ID` → `roleCode: admin`, `isActive: true`, `$A` refresh işləyir, DB girişi varsa audit SQL-də rədd edilən cəhdlər üçün `users.update` yoxdur (SC-001, SC-003); §3.7 silmə mesajı dəyişməyib (SC-005). Sonra §4 panel: formanın üstündə API mesajı (SC-004). Nəticələri MR qaralamasına yaz; meyar ödənmirsə dayan — "düzəldi" demə. T001(b)-də US1 yoxlaması mümkün deyilsə, bu task-ı "yalnız kod review (T005)" kimi qeyd et (depends on T006, T008) — **İstifadəçi icra edir**

**Checkpoint**: US1 `test`-də təsdiqlənib — MVP.

---

## Phase 4: User Story 2 - Başqa aktiv admin olduqda adi redaktə əvvəlki kimi işləyir (Priority: P2)

**Goal**: Ən azı iki aktiv admin olduqda deaktivasiya, rolun endirilməsi və aktivləşdirmə bugünkü kimi uğurlu olur (FR-005). Kod T004-dədir (`losesAdmin` yalnız başqa aktiv admin olmadıqda bloklayır); bu faza onun reqressiya yoxlamasıdır.

**Independent Test**: [quickstart.md](./quickstart.md) §2 — müvəqqəti `admin-guard-test` (`$B`) üzərində §2.2–§2.5-in hamısı `200`, deaktivasiyadan sonra `$B`-nin refresh-i uğursuz.

- [ ] T008 [US2] Deploy-dan sonra (T006) `quickstart.md` §2 işlət: `$B` yarat (admin), §2.2 moderator → `200`, §2.3 geri admin → `200`, §2.4 deaktiv → `200` və `$B` sessiyası ləğv, §2.5 aktivləşdirmə → `200` (SC-002). `$B` §3-ün əvvəlində silinir — T007-ə keç. Meyar ödənmirsə dayan (depends on T006) — **İstifadəçi icra edir**

**Checkpoint**: Hər iki story `test`-də təsdiqlənib.

---

## Phase 5: Polish & Cross-Cutting Concerns

- [ ] T009 [P] `quickstart.md` §5 təmizlik: T001(b)-də müvəqqəti deaktiv edilmiş adminləri geri aktivləşdir; `admin-guard-test` silinib (username/email rezervdə qalır) (depends on T007) — **İstifadəçi icra edir**
- [ ] T010 [P] `business_logic/new_business_logic.md`-də istifadəçi idarəsini təsvir edən bölməyə bir sətir əlavə et: son aktiv admin nə silinə, nə deaktiv edilə, nə də rolu endirilə bilər (409); `diff_report_logic.md`-də köhnə sistemdə bu qorumanın olmadığını qeyd etməyə ehtiyac varsa, `product-host`-un `UsersController::actionManage/actionChangeStatus`-una istinad et. UTF-8 qoruyan alətlə redaktə et (Konstitusiya V.5), `Sync:` başlığına toxunma (depends on T007)
- [X] T011 [P] `api-admin-review.md` (repo kökü) cədvəlində (sətir ~32) və bölmə **6**-da (sətir ~129) task #6-nı "edildi" kimi qeyd et, `specs/015-last-admin-update-guard/`-ə istinadla; paralel yarışın (iki admin eyni anda bir-birini endirir) silmə ilə birlikdə açıq qaldığını bir cümlə ilə əlavə et (research R7) (depends on T007) — **2026-10-05**: "🔄 kod hazırdır, yoxlama gözləyir" kimi qeyd olundu; T007 təsdiqlənəndə ✅ + commit SHA ilə əvəzlə

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: dərhal başlaya bilər; kodla paralel, amma T007/T008-dən əvvəl bitməlidir
- **Foundational (Phase 2)**: T002 və T003 fərqli fayllardadır — paralel
- **US1 (Phase 3)**: T004 ← T003; T005 ← T002, T004; T006 ← T005; T007 ← T006, T008
- **US2 (Phase 4)**: T008 ← T006 (kod T004-də, ayrıca implementasiya yoxdur)
- **Polish (Phase 5)**: T009–T011 T007 təsdiqləndikdən sonra

### Kritik yol

```text
T001 ──────────────────────────────────────┐
T002 ────────────────┐                     │
T003 → T004 ─────────┴→ T005 → T006 → T008 ┴→ T007 → T009/T010/T011
```

Qeyd: icra sırası quickstart-a görə US2 yoxlaması (T008) → US1 yoxlaması (T007)-dir, çünki §3
§2-də yaradılan ikinci admini silməklə "son admin" vəziyyətini qurur.

### Parallel Opportunities

- T002 (OpenAPI) və T003 (controller helper) — fərqli fayllar, paralel
- T001 (mühit hazırlığı) kod yazılması ilə paralel
- T009, T010, T011 — fərqli fayllar, paralel

---

## Parallel Example: Foundational

```bash
Task: "users.yaml updateUser təsviri + lint + bundle (T002)"
Task: "UsersController.HasOtherActiveAdminAsync + Delete refaktoru (T003)"
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Phase 1: `test` mühitində hesablar və girişlər
2. Phase 2: spec-first (OpenAPI) + ortaq qayda
3. Phase 3: `Update` qoruması, öz-review, GitLab `test`-ə çatdırma
4. Phase 4 → Phase 3 yoxlaması (T008 → T007): **STOP and VALIDATE** SC-001…SC-005
5. Phase 5: təmizlik və sənədlər

US1 və US2 eyni kod dəyişikliyindən gəlir, ona görə ayrıca inkremental deploy yoxdur — bir MR.

### Digər "dərhal" task-larla birləşmə

Review-un "dərhal" qrupu (#5, #13, #8a) eyni `api-cbar-admin` MR-ında gedə bilər. #6 onların
heç birindən asılı deyil; #8a (`pageSize` clamp) T001(b)-dəki `pageSize=100` siyahı sorğusunu
kəsə bilər — onda siyahını səhifə-səhifə oxu.

---

## Notes

- [P] = fərqli fayl, asılılıq yoxdur
- Commit yalnız istifadəçi təsdiqi ilə. `origin` (GitHub)-a push deploy etmir; deploy yalnız GitLab-dakı `api-cbar-admin` repo-sunun `test` branch-indən gedir (T006)
- Sxem, `Cbar.Domain`, migration, frontend toxunulmur — belə ehtiyac yaranarsa plan yanlışdır, dayan
- Yoxlama nəticəsi olmadan task "bitdi" sayılmır
