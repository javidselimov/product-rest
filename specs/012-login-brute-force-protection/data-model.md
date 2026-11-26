# Data Model: Admin login-də brute-force qoruması

**Feature**: [spec.md](./spec.md) · **Research**: [research.md](./research.md) R1, R2, R4

## `users` cədvəli (mövcud) — iştirak edən sahələr

| Sütun | Tip | Mövcud? | Mənası bu feature-də |
|---|---|---|---|
| `id` | `serial` | var | — |
| `username` | `citext UNIQUE` | var | Axtarış registrə həssas deyil; rate limit açarı da kiçik hərfə salınır |
| `is_active`, `deleted_at` | | var | Deaktiv/silinmiş = "mövcud deyil": sayğac artmır |
| `failed_logins` | `smallint NOT NULL DEFAULT 0` | var, **indi yazılır** | Cari seriyadakı ardıcıl uğursuz cəhd sayı |
| `locked_until` | `timestamptz NULL` | var, **indi yazılır** | Kilidin bitmə vaxtı; `> now()` = kilidli. Refresh bunu artıq yoxlayır |
| `last_failed_login_at` | `timestamptz NULL` | **YENİ** (`0007`) | Seriyadakı son uğursuz cəhdin vaxtı; 10 dəqiqəlik pəncərənin lövbəri |

**Migration**: `product-rest/api-cbar-admin/db/migrations/0007-users-last-failed-login.sql`

- `ALTER TABLE users ADD COLUMN IF NOT EXISTS last_failed_login_at timestamptz;`
- `BEGIN`/`COMMIT` yoxdur, default yoxdur (mövcud sətirlər `NULL` — "seriya yoxdur").
- Fayl adı hər iki API üzrə unikaldır (`api-cbar/db/migrations/`-də yalnız `README.md` var).
- `cbar_web_ro` üçün əlavə grant lazım deyil: `0001` cədvəl səviyyəsində `SELECT` verir.

**EF modeli** — hər iki kopyada eyni (Maddə V.1):
`product-rest/api-cbar-admin/src/Cbar.Domain/Entities/Auth.cs` və
`product-rest/api-cbar/src/Cbar.Domain/Entities/Auth.cs` → `User`-ə
`public DateTimeOffset? LastFailedLoginAt { get; set; }` (`LockedUntil`-dan sonra).
Snake-case konvensiyası sütun adını avtomatik verir; `CbarDbContext`-də konfiqurasiya lazım
deyil. Dəyişiklikdən sonra iki fayl arasında `diff` boş olmalıdır.

## Sabitlər (`Services/LoginProtection.cs`)

| Ad | Dəyər | Mənbə |
|---|---|---|
| `MaxFailedLogins` | 5 | FR-002, Q2 |
| `FailureWindow` | 10 dəqiqə | FR-002 |
| `LockDuration` | 15 dəqiqə | FR-002, Q2 |
| `AttemptsPerUsername` | 10 | FR-008 |
| `AttemptWindow` | 120 saniyə (12 × 10 s seqment) | FR-008 |

## Hesab vəziyyətləri və keçidlər

`now` = DB vaxtı (`now()`). "Kilidli" = `locked_until > now`.

```text
              səhv parol (pəncərə daxilində, count+1 < 5)
            ┌───────────────┐
            ▼               │
 ┌────────────────┐  səhv   ┌────────────────────┐  5-ci səhv  ┌───────────────────┐
 │ TƏMİZ          │────────▶│ SERİYA (1..4)      │────────────▶│ KİLİDLİ (15 dəq)  │
 │ count=0        │         │ count, last_failed │             │ locked_until>now  │
 └────────────────┘         └────────────────────┘             └───────────────────┘
      ▲    ▲                   │ uğurlu giriş        │                 │
      │    └───────────────────┘                     │ last_failed     │ müddət bitir
      │                                              │ +10 dəq keçib   ▼
      │                                              ▼          ┌───────────────────┐
      │                           növbəti səhv → count=1        │ KİLİDİ BİTMİŞ     │
      │                                                         │ count=5, past lock│
      └──────────── uğurlu giriş / admin parol sıfırlaması ─────┴───────────────────┘
                    / admin yenidən aktivləşdirmə (istənilən vəziyyətdən)
```

| Hadisə | Şərt | Yeni dəyərlər |
|---|---|---|
| Səhv parol | kilidli deyil, `last_failed_login_at` `NULL` və ya `< now − 10 dəq`, və ya kilidi bitib | `failed_logins = 1`, `last_failed_login_at = now`, `locked_until = NULL` |
| Səhv parol | kilidli deyil, pəncərə daxilində, `failed_logins + 1 < 5` | `failed_logins += 1`, `last_failed_login_at = now` |
| Səhv parol | kilidli deyil, pəncərə daxilində, `failed_logins + 1 = 5` | `failed_logins = 5`, `last_failed_login_at = now`, `locked_until = now + 15 dəq` → log `Account locked` |
| İstənilən parol | kilidli | **dəyişiklik yoxdur** (kilid uzanmır, sayğac artmır) |
| Doğru parol | kilidli deyil | `failed_logins = 0`, `locked_until = NULL`, `last_failed_login_at = NULL` |
| Admin parolu sıfırlayır | — | eyni sıfırlama |
| Admin `is_active` `false → true` edir | — | eyni sıfırlama |
| Mövcud olmayan / deaktiv / silinmiş ad | — | heç bir sətir dəyişmir |

Bütün "səhv parol" sətirləri **bir atomik `UPDATE … WHERE id = @id AND (locked_until IS NULL
OR locked_until <= now()) RETURNING failed_logins, locked_until`** ilə icra olunur (R2):
yeni dəyərlər SQL-də köhnə sətirdən hesablanır, `WHERE` şərti "kilidli hesab dəyişmir"
qaydasını paralel sorğularda da təmin edir.

**Doğrulama qaydaları**:
- `failed_logins` 0..5 aralığından çıxmır (5-də kilid qoyulur, kilidli hesab artmır).
- `locked_until IS NOT NULL` ⇒ `failed_logins = 5` (kilid yalnız 5-ci cəhdlə qoyulur).
- Rate limit vəziyyəti (ad üzrə sayğac) **bazada saxlanılmır** — proses yaddaşında, 120 s
  pəncərə (research R4).
