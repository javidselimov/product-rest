# Research: Admin login-də brute-force qoruması

**Feature**: [spec.md](./spec.md) · **Plan**: [plan.md](./plan.md) · **Date**: 2026-10-02

Spec-də açıq sual yoxdur (Clarifications Q1–Q3). Burada yalnız plan mərhələsinin texniki
qərarları var. Mənbə kodu: `product-rest/api-cbar-admin` (`test` branch, `de50d38`).

---

## R1 — 10 dəqiqəlik pəncərə üçün son uğursuz cəhdin vaxtı harada saxlanılır

**Decision**: `users` cədvəlinə yeni sütun — `last_failed_login_at timestamptz NULL`
(migration `0007-users-last-failed-login.sql`), `User.LastFailedLoginAt` hər iki `Cbar.Domain`
kopyasında.

**Rationale**:
- FR-002 pəncərəni **son uğursuz cəhddən** sayır. Mövcud iki sahə (`failed_logins`,
  `locked_until`) bu vaxtı saxlamır.
- `updated_at` yaramır: `CbarDbContext.SaveChangesAsync` onu istənilən dəyişiklikdə (admin
  e-poçtu dəyişəndə, refresh zamanı və s.) yeniləyir — pəncərə səhv sıfırlanar və ya uzanar.
- Sütun nullable və default-suzdur → `ADD COLUMN IF NOT EXISTS` mövcud bazada dərhal, cədvəli
  yenidən yazmadan işləyir (Maddə V.2).

**Alternatives considered**:
- *`locked_until`-u kilid olmayanda "son uğursuz cəhd vaxtı" (keçmiş tarix) kimi işlətmək*:
  sxem dəyişmir, `RefreshTokenService`-in `LockedUntil > now` yoxlaması da düz qalır. Rədd
  edildi: sütunun adı ilə mənası ayrılır, növbəti oxuyan (və #12, #16) onu səhv başa düşər;
  Konstitusiyanın "sxem dəyişməsin" tələbi yoxdur, yalnız əsaslandırma tələbi var.
- *Sabit pəncərə (ilk uğursuz cəhddən 10 dəq)*: yenə də bir vaxt sahəsi tələb edir, üstəlik
  spec-ə zidddir.
- *Pəncərəsiz sayğac (yalnız uğurlu girişdə sıfırlanır)*: Edge Case "köhnə uğursuz cəhdlər"
  pozulur — həftələr ərzində 5 typo redaktoru kilidləyər.

**Qiymətə təsir**: +1 SP (migration + iki `Cbar.Domain` kopyası + deploy sırası yoxlaması).

---

## R2 — Sayğacın paralel cəhdlərdə itməməsi (FR-003)

**Decision**: Uğursuz cəhd sayğacı EF change tracker ilə yox, **bir atomik `UPDATE … RETURNING`**
ilə yazılır: yeni dəyər SQL-də köhnə sətir dəyərindən hesablanır, şərt
(`locked_until IS NULL OR locked_until <= now()`) eyni ifadədədir. Qaytarılan `failed_logins` və
`locked_until` log (FR-012) üçün istifadə olunur.

**Rationale**:
- Tracked entity ilə "oxu → +1 → yaz" iki paralel sorğuda eyni köhnə dəyəri oxuyub hər ikisi
  `N+1` yazır (lost update) — SC-004 pozulur.
- PostgreSQL-də tək `UPDATE` sətir kilidini alır, paralel ikinci `UPDATE` birincinin nəticəsini
  görür (READ COMMITTED-də yenidən qiymətləndirmə). Əlavə transaction və ya `FOR UPDATE` lazım
  deyil.
- `now()` DB vaxtıdır; pəncərə və kilid müddəti hamısı eyni saatla hesablanır.

**Alternatives considered**:
- *`ExecuteUpdateAsync`*: atomikdir, amma `RETURNING` vermir → kilidin məhz bu cəhdlə qoyulduğunu
  bilmək üçün ikinci sorğu lazım olur (yarış yenidən açılır). Rədd edildi.
- *Optimistic concurrency (`xmin`)*: retry dövrü tələb edir və #10-un mövzusudur.

**İcra qeydi**: `Database.SqlQuery<T>($"UPDATE … RETURNING …")` FormattableString ilə
parametrləşdirilir və LINQ ilə compose edilmədən `ToListAsync()` ilə işlədilir. EF bunu
compose etməyə çalışarsa (subquery-yə bükərsə, `UPDATE` alt sorğuda xəta verir), ehtiyat yol
`db.Database.GetDbConnection()` üzərindən birbaşa `NpgsqlCommand`-dır. Bu, pipeline build-də
yox, `test`-də ilk cəhddə üzə çıxır — quickstart §3 onu birinci yoxlayır.

---

## R3 — Kilid yoxlamasının yeri və cavab vaxtının bərabərliyi (FR-005, SC-002)

**Decision**: Login axını:
1. Ad üzrə rate limit (R4) — aşılıbsa 429, bazaya müraciət yoxdur.
2. İstifadəçi axtarışı (dəyişmir).
3. `locked = user?.LockedUntil > now` — **parol yoxlanmazdan əvvəl** hesablanır.
4. bcrypt `Verify` **həmişə** işləyir (spec 011: `user?.PasswordHash ?? DummyHash`).
5. `user is null || locked || !verified` → eyni `401 Invalid credentials.` Sayğac yalnız
   `user != null && !locked && !verified` halında artır (R2).
6. Uğur → sayğac/kilid/pəncərə sıfırlanır (tracked entity, audit ilə eyni `SaveChanges`).

**Rationale**:
- Kilidli hesabda da `Verify` işləyir, ona görə cavab vaxtı səhv parol və mövcud olmayan ad
  halları ilə eyni bcrypt xərcini daşıyır. `Verify` nəticəsi kilidli halda **istifadə
  olunmur** — cavab paroldan asılı deyil (oracle bağlanır).
- "Account temporarily locked." cavabı silinir (Q1 → A). Mesajı yazan kod da qalmır.
- Səhv parol yolu əlavə bir `UPDATE` (~1–3 ms) edir, kilidli və mövcud olmayan yollar etmir.
  Fərq SC-002-nin 25 ms həddindən çox aşağıdır; quickstart bunu ölçür.

**Alternatives considered**:
- *Kilidli hesabda `Verify`-i ötürmək*: kilidli hal ~250 ms tez cavab verər — kilid vaxtdan
  oxunar, Q1-in mənası itər. Rədd edildi.
- *Kilidli cəhdi də sayğaca yazmaq*: Edge Case "kilid müddətində cəhdlər kilidi uzatmır"
  pozulur.

---

## R4 — Ad üzrə rate limit mexanizmi (FR-008, FR-010, FR-011)

**Decision**: `System.Threading.RateLimiting` (ASP.NET Core shared framework-ün hissəsidir —
**yeni NuGet paketi yoxdur**) ilə singleton `PartitionedRateLimiter<string>`:
`SlidingWindowRateLimiter`, `PermitLimit = 10`, `Window = 120 s`, `SegmentsPerWindow = 12`
(10 s seqment), `QueueLimit = 0`. Partition açarı = `username.Trim().ToLowerInvariant()`.
Login metodunun əvvəlində `AttemptAcquire(key)` çağırılır; uğursuzdursa
`429 Too Many Requests` + `Retry-After` başlığı + `{ message }` gövdəsi.

**Rationale**:
- Açar sorğu **gövdəsindədir**. `AddRateLimiter` middleware-i model binding-dən əvvəl işləyir,
  gövdəni oxumaq üçün buffering və ikinci JSON parse tələb edərdi. Limiteri controller daxilində
  çağırmaq daha sadədir və FR-011-i (yalnız login) avtomatik təmin edir — refresh/logout ona
  heç vaxt toxunmur.
- Sliding window "120 s-də 10" tələbini (SC-003) fixed window-dan dəqiq ödəyir: fixed window
  sərhəd ətrafında 20 cəhdə icazə verir.
- `username` sütunu `citext`-dir — axtarış artıq hərf registrinə həssas deyil; açarın kiçik
  hərfə salınması bununla uyğun gəlir (Edge Case "hesab adının yazılışı").
- Limiter DB-dən əvvəl çağırılır: 429 mövcud və mövcud olmayan ad üçün eynidir, sayğaca
  düşmür (FR-010), bcrypt xərci yaranmır.

**Alternatives considered**:
- *`AddRateLimiter` + `[EnableRateLimiting]` attribute-u*: gövdə oxunması problemi (yuxarıda);
  IP partition-ı isə #5-ə qədər yanlışdır (Q3).
- *Redis-də paylaşılan sayğac*: Redis qeydiyyatı `api-cbar-admin`-də yoxdur (yalnız
  docker-compose-da); yeni dependency və konfiqurasiya. Çox pod halında belə hesab kilidi bazada
  olduğu üçün qoruma qalır (spec Assumptions). Rədd edildi.
- *DB-də cəhd cədvəli*: hər login-ə yazma əlavə edir, təmizləmə job-u tələb edir. Rədd edildi.

**Qeydlər**:
- *Yaddaş*: təsadüfi adlarla partition sayını şişirtmək mümkündür. `PartitionedRateLimiter`
  boş qalan limiterləri fon "heartbeat"-i ilə atır; açar uzunluğu 256 simvolla kəsilir. Hər
  partition kiçikdir, ölçü 120 s-lik pəncərə ilə məhduddur.
- *`Retry-After`*: uğursuz lease-in `MetadataName.RetryAfter` dəyəri varsa o (saniyəyə
  yuxarı yuvarlaqlaşdırılmış), yoxdursa seqment uzunluğu (10 s) yazılır. Sliding window
  limiterinin bu metadata-nı verməsi `test`-də yoxlanılır (quickstart §5).
- *Sabitlər* — `Services/LoginProtection.cs`-də (`PasswordHashing` kimi statik sinif):
  `MaxFailedLogins = 5`, `FailureWindow = 10 dəq`, `LockDuration = 15 dəq`,
  `AttemptsPerUsername = 10`, `AttemptWindow = 120 s`. Konfiqurasiyaya çıxarılmır — spec
  rəqəmləri sabitləyib, mühitlər arasında fərq gözlənilmir.

---

## R5 — Admin müdaxiləsi kilidi açır (FR-007)

**Decision**: `UsersController.ResetPassword` və `Update`-də (yalnız `IsActive` `false → true`
keçidində) `FailedLogins = 0`, `LockedUntil = null`, `LastFailedLoginAt = null`. Mövcud audit
qeydləri saxlanılır; kilid sahələri audit `before/after`-ə əlavə olunmur (#16).

**Rationale**: Parol sıfırlaması kilidli redaktorun yeganə dəstək yoludur (Q1 → kilid
görünmür). Yenidən aktivləşdirmə köhnə seriyanı "miras" verməməlidir.

**Alternatives considered**: *Ayrıca `POST /users/{id}/unlock` endpoint-i* — yeni route,
spec-first dövrü, panel ekranı; spec onu tələb etmir. Rədd edildi (gələcəkdə #16 audit
ekranı ilə birlikdə ola bilər).

---

## R6 — Kontrakt dəyişikliyi və panel (FR-013)

**Decision**:
- OpenAPI (`openapi/paths/auth.yaml` → `login`): 401 təsvirindən kilid mətni çıxarılır,
  "kilidli hesab da `Invalid credentials.` qaytarır" yazılır; yeni `429` cavabı
  (`Retry-After` başlığı, `ErrorMessage` sxemi). Route əlavə/silinmədiyi üçün spec-first
  hook keçir, amma `/api-endpoint` qaydası ilə spec **əvvəl** yazılır, lint + bundle olunur.
- `web-cbar-admin-new`: `login-form.tsx`-də `status === 429` → `t('tooManyAttempts')`
  (az/en `auth.json`), MSW handler-ə 429 ssenarisi, `auth-flow.test.tsx`-ə bir test.

**Rationale**: Panel bu gün 401-dən başqa `AppError`-da server mesajını (`body.message`)
göstərir — ingiliscə mətn az interfeysdə görünər. Ara vəziyyət sınıq deyil, amma iki dilli
mesaj Maddə V.4 tələbidir.

**Alternatives considered**: *Server mesajını lokallaşdırmaq* — API dili bilmir; rədd edildi.
