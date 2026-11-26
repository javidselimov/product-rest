# Research: son aktiv admin qoruması `Update`-də

## R1 — Problem həqiqətən mövcuddur

- **Decision**: Problem təsdiqlənir.
- **Rationale**: `UsersController.Update` (`product-rest/api-cbar-admin/src/Cbar.AdminApi/Controllers/UsersController.cs:100-137`)
  yalnız email, rolun varlığı, 404 və email unikallığını yoxlayır, sonra `RoleId` və `IsActive`-i
  şərtsiz yazır. `Delete` (`:171-177`) isə hədəf aktiv admindirsə
  `AnyAsync(u => u.Id != id && u.IsActive && u.Role.Code == "admin")` ilə başqa aktiv admin axtarır.
  OpenAPI də bunu açıq deyir: `openapi/paths/users.yaml:90` — "No last-admin guard here".
  `product-host`-da (`admin/controllers/UsersController.php`, `actionManage`/`actionChangeStatus`)
  heç bir qoruma yoxdur — bu, paritet yox, sərtləşdirmədir.
- **Alternatives considered**: yoxdur.

## R2 — Qaydanın yeri: controller-in private metodu

- **Decision**: `private Task<bool> HasOtherActiveAdminAsync(int exceptUserId)` `UsersController`
  daxilində; `Delete` və `Update` onu çağırır.
- **Rationale**: Review-un SP izahı ("ortaq metoda çıxarmaq") ilə üst-üstə düşür, FR-004-ü
  (bir qayda, iki istifadəçi) təmin edir. Qaydanın başqa istifadəçisi yoxdur — `auth`
  endpoint-ləri istifadəçinin rolunu/statusunu dəyişmir. Sorğu `db.Users`-in query filter-ini
  (`DeletedAt == null`, `CbarDbContext.cs:97`) istifadə edir, ona görə soft-delete olunmuş
  hesablar sayılmır — silmədəki kimi.
- **Alternatives considered**:
  - Ayrıca servis (`AdminGuard`) + DI — bir istifadəçi üçün əlavə fayl və qeydiyyat, əsassız.
  - DB trigger / constraint — sxem dəyişikliyi və migration tələb edir (FR-007 əleyhinə),
    xətası 500 kimi gələrdi (review #7 həll olunmayıb).

## R3 — `Update`-də "admin statusunu itirmə" şərti və yoxlama sırası

- **Decision**: `loses = entity.IsActive && entity.Role.Code == "admin" && (!dto.IsActive || newRoleCode != "admin")`.
  `true` və `!await HasOtherActiveAdminAsync(id)` olduqda mutasiyadan əvvəl
  `Conflict(new { message = "Cannot deactivate or demote the last active administrator." })`.
  Yer: 404 və email-conflict yoxlamalarından sonra, `before` snapshot-dan və sahə təyinlərindən əvvəl.
- **Rationale**:
  - Yeni rolun `Code`-u lazımdır; mövcud `db.Roles.AnyAsync(r => r.Id == dto.RoleId)` sorğusu
    `Select(r => r.Code).SingleOrDefaultAsync()`-a çevrilir — eyni sayda sorğu, `null` → 400 "Role not found." (dəyişmir).
  - Mutasiyadan əvvəl qayıtmaq FR-002-ni avtomatik təmin edir: `SaveChanges`, `audit.Log`,
    `RevokeAllForUserAsync` çağırılmır, tracked entity dəyişmir.
  - Şərt hədəfin **cari** vəziyyətinə əsaslanır: deaktiv admin, aktivləşdirmə və admin rolu
    vermə qorumaya düşmür (spec edge cases, FR-005).
  - Mövcud 400/404/409(email) sırası dəyişmir; yeni 409 sonuncudur — OpenAPI-dəki
    "validated (400) before looked up (404)" təsviri doğru qalır.
- **Alternatives considered**: çağıranın özünü redaktə etdiyini yoxlamaq (`callerId == id`) —
  rədd edildi: qayda vəziyyət haqqındadır, kimlik haqqında yox (spec Assumptions); həmçinin JWT-dəki
  rol 15 dəqiqəyə qədər köhnə ola bilər.

## R4 — Panel 409 mesajını göstərir

- **Decision**: Panel dəyişikliyi yoxdur.
- **Rationale**: Bu checkout-da yeganə admin panel `product-rest/web-cbar-admin-new`-dur.
  `src/features/users/components/user-form.tsx:113-131` `save.mutateAsync` xətasında
  `isAppError` → `setRootError(error.message)`; `src/shared/api/types.ts:80-81` mesajı
  `body.message`-dən götürür. Yəni API-nin `{ message }`-i formanın üstündəki Alert-də görünür.
  Mesaj ingiliscədir — email-conflict mesajları kimi; lokalizasiya ayrıca iş olardı.
- **Alternatives considered**: paneldə "son admin" halında checkbox-u/rol seçimini
  deaktivləşdirmək — panelin kim son admin olduğunu bilməsi üçün əlavə sorğu lazımdır, API
  qoruması onsuz da həqiqət mənbəyidir. Əhatədən kənar.

## R5 — OpenAPI: yalnız təsvir

- **Decision**: `openapi/paths/users.yaml` `updateUser.description`-da "No last-admin guard here:
  the last active admin can be deactivated or demoted." cümləsi "Refused (409) if it would leave
  no active admin: deactivating or demoting the last active admin." ilə əvəz olunur; `409` cavabı
  (`responses.yaml#/Conflict`) artıq siyahıdadır. Lint + bundle (`openapi/dist/openapi.json`).
- **Rationale**: Spec-first qaydası (CLAUDE.md): əvvəl spec, sonra controller. Route dəyişmədiyi üçün
  `.claude/hooks/spec-first.mjs` bloklamır, amma status semantikası dəyişikliyi əl ilə sənədləşdirilməlidir.
  `# Sync:` sətri `/sync-openapi` işinin işidir, burada toxunulmur.
- **Alternatives considered**: yeni `LastAdminConflict` response komponenti — mövcud generik
  `Conflict` forması (`ErrorMessage`) eynidir, ayrıca komponent artıqdır.

## R6 — Verification `test` mühitində

- **Decision**: [quickstart.md](./quickstart.md)-dakı ssenarilər deploy-dan sonra `test`-də;
  test mühitində iki admin hesabı (mövcud + müvəqqəti `admin-guard-test`) istifadə olunur.
- **Rationale**: Lokalda .NET SDK yoxdur. "Son aktiv admin" vəziyyətini yaratmaq üçün `test`-də
  real olaraq yalnız bir aktiv admin qalmalıdır — bu, digər admin hesablarını müvəqqəti deaktiv
  etmək deməkdir. Bu, mühiti başqa istifadəçilər üçün dəyişdirə biləcəyi üçün koordinasiya tələb edir;
  mümkün deyilsə, US1 ssenariləri yalnız kod review ilə yoxlanılır, US2 isə tam yoxlanılır.
- **Alternatives considered**: lokalda `dotnet run` — SDK yoxdur.

## R7 — Paralel yarış

- **Decision**: Əhatədən kənar (spec Assumptions).
- **Rationale**: `SERIALIZABLE` və ya advisory lock tələb edir; silmədə də eyni yarış var, ikisini
  birlikdə həll etmək ayrıca task-dır. Adminlər azdır, eyni anda qarşılıqlı demote praktik deyil.
