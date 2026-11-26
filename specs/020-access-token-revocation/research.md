# Research: giriş tokeninin dərhal ləğvi

Bütün faktlar 2026-10-08-də koddan ölçülüb. Spec-də açıq sual qalmayıb (Q1 → C). Aşağıdakı
qərarlar Technical Context-dəki seçimləri əsaslandırır.

## R1 — Versiya harada saxlanılır

**Decision**: Yeni cədvəl `admin_user_security_stamps (user_id PK, stamp uuid, changed_at)`,
migration `0007-admin-user-security-stamps.sql`. `users` cədvəlinə FK yalnız `REFERENCES`
hüququ olan mühitdə əlavə olunur (`0004`-ün `DO $$ … has_table_privilege` nümunəsi).

**Rationale**: Paylaşılan mühitlərdə `users` başqa DB roluna məxsusdur. `ALTER TABLE users`
"must be owner of table" ilə yıxılır (`0004-admin-refresh-tokens.sql` şərhi). Spec 012-nin
`0007-users-last-failed-login.sql`-i məhz buna görə geri çəkilib (commit `85f30bf`). Yeni cədvəl
yaratmaq isə `0004`-də deploy olunmuş mühitlərdə artıq işləyib.

**Alternatives considered**:
- `users.security_stamp` sütunu (tapşırıqdakı tövsiyə). Deploy-u bloklayır.
- `users.updated_at`-i versiya kimi işlətmək. Email dəyişikliyində də dəyişir və SC-005-i pozur.
  Bundan başqa, hansı yazanın onu yenilədiyi bizim nəzarətimizdə deyil.
- Mövcud, istifadə olunmayan `user_sessions` cədvəli. Mənası fərqlidir (sessiya başına sətir).
  Sahibi `users` ilə eyni ola bilər, bu da eyni risk deməkdir.

**Nəticə**: fayl adı `0007-admin-user-security-stamps.sql` hər iki API üzrə unikaldır.
`api-cbar/db/migrations/` yalnız `README.md` saxlayır, geri çəkilmiş `0007-users-…` adı isə
fərqlidir.

## R2 — Versiyanın dəyəri və yaradılması

**Decision**: Dəyər `uuid`-dir və tətbiqdə yaradılır (`Guid.NewGuid()`, parametr kimi
ötürülür). Sətir **tənbəl** yaradılır: token verilərkən (login, refresh) sətir yoxdursa
`INSERT … ON CONFLICT (user_id) DO NOTHING`, sonra oxunur. Migration-da backfill yoxdur.

**Rationale**:
- Versiya sirr deyil. Token imzalıdır, versiya yalnız müqayisə üçündür. Uyğun gəlməsi üçün
  təsadüfilik kifayətdir, `Guid.NewGuid()` 122 təsadüfi bit verir.
- Tətbiqdə yaradılan dəyər `gen_random_uuid()`-dən (PG13+) və extension-lardan asılı deyil.
  Lokalda PG 16 var, deploy-dakı versiya isə `TODO(devops)`-dur.
- Tənbəl yaradılma seed-də, out-of-band və `UsersController.Create` ilə yaradılmış bütün
  istifadəçiləri əhatə edir, backfill-in `users` üzərində `SELECT` hüququndan asılılığı da
  aradan qalxır. `ON CONFLICT DO NOTHING` eyni anda iki ilk girişin PK toqquşmasını
  (`DbExceptionHandler` → 409) istisna edir.

**Alternatives considered**: migration-da `INSERT … SELECT id FROM users` backfill-i. Yenə də
tənbəl yolu tələb edir (sonradan yaradılan istifadəçilər üçün), yəni artıq iş olardı.

## R3 — Token versiyanı necə daşıyır

**Decision**: `CreateAccessToken`-ə yeni claim `sst` (security stamp, uuid mətni) əlavə olunur.
Bu claim-i daşımayan token rədd edilir.

**Sıra (T013 review, S1)**: token qurularkən əvvəl versiya, sonra rol oxunur
(`AuthController.CreateAccessTokenAsync`). Rol dəyişikliyi bu ikisinin arasında commit olunarsa,
token köhnə versiyanı daşıyır və ilk sorğuda ölür. Əks sıra (rol login-in əvvəlində, versiya
bcrypt-dən sonra) köhnə rol + yeni versiya ilə 15 dəqiqəlik token verə bilərdi.

**Rationale**: Qısa custom ad JWT-də daxili mapping-ə düşmür (yalnız `sub` →
`ClaimTypes.NameIdentifier` map olunur; `AuditService` və `UsersController` hər ikisini oxuyur).
Claim-siz tokeni qəbul etmək deploy-dan əvvəlki tokenləri 15 dəqiqə yaşadardı. Rədd olunan
token panelin bir dəfəlik səssiz yeniləməsi ilə əvəzlənir (spec Edge Case "Deploy anı").

## R4 — Yoxlama harada aparılır

**Decision**: `Program.cs`-də `AddJwtBearer` daxilində `opt.Events = new JwtBearerEvents {
OnTokenValidated = … }`. Hook `context.HttpContext.RequestServices`-dən scoped `CbarDbContext`
alır. **Bir sorğu** ilə (`IgnoreQueryFilters`, `users` + `admin_user_security_stamps`, `Id`
üzrə) `IsActive`, `DeletedAt` və `Stamp` oxunur. Uyğunsuzluqda `context.Fail(reason)` çağırılır.
Məntiq `Services/SecurityStampService.cs`-də yaşayır, hook yalnız onu çağırır.

**Rationale**:
- `context.Fail` autentifikasiyanı uğursuz edir. `[Authorize]` endpoint-ləri müddəti bitmiş
  token üçün olduğu kimi **standart 401 challenge**-ı (`WWW-Authenticate: Bearer
  error="invalid_token"`) qaytarır. `UseStatusCodePages` gövdəni spec 018 formasında
  (`title`/`message` olmadan) qurur. Beləliklə FR-007 öz-özünə ödənir və panelin
  401 → refresh → təkrar axını dəyişmir.
- `IgnoreQueryFilters` silinmiş istifadəçini "tapılmadı"dan ayırmağa imkan verir (FR-010-un
  log səbəbi üçün). Hər iki halda nəticə rəddir.
- Kilid (`LockedUntil`) yoxlanmır (spec Edge Case). Refresh onu artıq yoxlayır
  (`RotateAsync` → `user_inactive`), bu dəyişmir.

**Alternatives considered**:
- Ayrıca middleware (`UseAuthentication`-dan sonra). 401-i və `WWW-Authenticate` başlığını əllə
  qurmaq lazım gələrdi, spec 018 formasından ayrılma riski də yaranardı.
- `IAuthorizationHandler` / policy. Rədd 403 olardı, panel bunu "icazə yoxdur" kimi göstərib
  yeniləməyə keçməzdi, bu da US3 AS1-i pozur.
- `IClaimsTransformation`. Autentifikasiyanı uğursuz edə bilmir.

**Qeyd**: autentifikasiya middleware-i bearer başlığı olan **hər** sorğuda işləyir, anonim
`auth/login|refresh|logout` də daxil olmaqla. Orada uğursuz nəticə endpoint-ə təsir etmir.
Xərc bir əlavə sorğudur və qəbul olunur.

## R5 — Versiya nə vaxt dəyişir və atomiklik

**Decision**: `SecurityStampService.RotateAsync(userId)` bir SQL ifadəsidir:
`INSERT … VALUES (@id, @stamp, now()) ON CONFLICT (user_id) DO UPDATE SET stamp =
excluded.stamp, changed_at = excluded.changed_at`. O, `UsersController`-də istifadəçi dəyişikliyi
ilə **eyni tranzaksiyada** çağırılır:

| Yer | Şərt | Bugün tranzaksiya var? |
|---|---|---|
| `Update` | `IsActive` true→false **və ya** `RoleId` dəyişib | yox — `BeginTransactionAsync` əlavə olunur |
| `ResetPassword` | həmişə | yox — əlavə olunur |
| `Delete` | həmişə | yox — əlavə olunur |

Tranzaksiya daxilində sıra belədir: `SaveChangesAsync` (rədd olunarsa `DbExceptionHandler`
→ 400/409, tranzaksiya geri qaytarılır, versiya dəyişmir — FR-005), sonra `RotateAsync`, sonra
`CommitAsync`. Mövcud `RevokeAllForUserAsync` commit-dən sonra, bugünkü yerində qalır.
Son-admin qaydası (spec 015) və validasiya hər şeydən əvvəl yoxlanılır, rədd olunan redaktə
versiyaya toxunmur.

**Rationale**: Reaktivləşdirmə (false→true) versiyanı dəyişmir. Köhnə tokenlər deaktivasiya
anında artıq etibarsız olub (spec US1 AS4). Email dəyişikliyi də versiyanı dəyişmir (SC-005).

**Alternatives considered**: EF ilə tracked entity (`Find` → `Add`/yeniləmə). Eyni anda gələn
ilk login-in tənbəl `INSERT`-i ilə PK toqquşması 409-a çevrilərdi. Upsert bunu aradan qaldırır.

## R6 — Keşsiz yoxlamanın xərci (Q1 → C)

**Decision**: Keş yoxdur. Yoxlama iki PK lookup-dan ibarət tək bir sorğudur. Xərc `test`
mühitində ölçülür (quickstart §6): ucuz endpoint-ə 30 sorğu göndərilir, `time_total`-in
medianı deploy-dan əvvəl və sonra müqayisə edilir. Qəbul həddi median fərqi **< 10 ms**-dir
(SC-004). Hədd aşılarsa, keş ayrıca spec ilə gələcək. Bu işdə optimizasiya edilmir.

**Rationale**: Admin trafiki bir neçə redaktordur, public API-nin 1000/dəq fan-out-u ilə
müqayisə olunmur. Redis-i qoşmaq yeni paket, hər mühit üçün Vault açarı və DevOps asılılığı
deməkdir. Bundan başqa, keşin silinməsi itirilsə, ləğv də itirilir.

## R7 — Kontrakt və deploy keçidi

**Decision**: Route dəyişmir, ona görə `spec-first.mjs` hook-u işə düşmür. OpenAPI-də
dəyişən yeganə şey `components/responses.yaml` → `Unauthorized.description`-dur: ləğv
səbəbləri əlavə olunur. Bu, kod dəyişikliyindən **əvvəl** edilir, sonra lint + bundle.
Deploy sırası: `api-cbar-admin` (migration + kod), sonra `api-cbar` (yalnız `Cbar.Domain`).
`api-cbar` yeni cədvəli oxumur. `cbar_web_ro`-ya grant lazım deyil, çünki EF sorğulanmayan
cədvələ toxunmur.

**Keçid**: deploy anında bütün açıq tokenlər `sst`-siz olur. Hər aktiv istifadəçi bir dəfə 401
alır və `web-cbar-admin-new` səssiz yenilənir (SC-003). Köhnə `web-cbar-admin` bu checkout-da
yoxdur. O, hələ hansısa mühitdə işləyirsə, refresh-i olmadığı üçün istifadəçini bir dəfə
login-ə göndərər. Bu qəbul olunur və MR təsvirində qeyd edilir.

## R8 — Loglama (FR-010)

**Decision**: `SecurityStampService` rəddi bu şəkildə loglayır:
`"Access token rejected for user {UserId}: {Reason}"`. Səbəb `stamp_missing | stamp_mismatch`
olduqda səviyyə `Information` olur (deploy anında və rol dəyişikliyində gözlənilir, səs-küy
yaratmasın). `user_inactive | user_deleted | user_missing` olduqda isə `Warning`. Token,
claim dəyəri və versiya loga yazılmır. Audit-ə yazılmır, çünki rədd dəyişiklik deyil.

## SP qiymətləndirməsi

Redis və keşin silinməsi (Q1) çıxdıqdan sonra:

| İş | SP |
|---|---|
| Migration + hər iki `Cbar.Domain` (entity, DbSet, mapping) | 1 |
| `SecurityStampService` (get-or-create, rotate, validate) + claim | 1 |
| `OnTokenValidated` + login/refresh-də versiya | 1 |
| `UsersController`-də üç tranzaksiya | 0.5 |
| OpenAPI + `test`-də yoxlama (quickstart) | 0.5 |
| **Cəmi** | **4 SP** (ilkin 5-dən) |
