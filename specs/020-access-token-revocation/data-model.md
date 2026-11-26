# Data Model: giriş tokeninin dərhal ləğvi

## 1. Yeni cədvəl `admin_user_security_stamps`

Migration: `product-rest/api-cbar-admin/db/migrations/0007-admin-user-security-stamps.sql`
(research R1). `BEGIN`/`COMMIT` yoxdur, hər şey `IF NOT EXISTS` ilə yazılır.

| Sütun | Tip | Qayda |
|---|---|---|
| `user_id` | `integer` | PK. `users(id)`-ə FK yalnız `has_table_privilege('users','REFERENCES')` olduqda, `ON DELETE CASCADE` (`0004` nümunəsi) |
| `stamp` | `uuid NOT NULL` | Tətbiqdə yaradılır (R2). Default yoxdur |
| `changed_at` | `timestamptz NOT NULL DEFAULT now()` | Son yaradılma və ya dəyişmə anı. Diaqnostika üçündür, yoxlamada istifadə olunmur |

Əlavə indeks lazım deyil, çünki yeganə axtarış PK üzrədir.

## 2. EF modeli (hər iki `Cbar.Domain` kopyası, bayt-bayt eyni)

`src/Cbar.Domain/Entities/Auth.cs`:

```csharp
public class UserSecurityStamp
{
    public int UserId { get; set; }
    public Guid Stamp { get; set; }
    public DateTimeOffset ChangedAt { get; set; }
}
```

`src/Cbar.Domain/CbarDbContext.cs`: `DbSet<UserSecurityStamp> UserSecurityStamps` və mapping
(`ToTable("admin_user_security_stamps")`, `HasKey(x => x.UserId)`). `User` naviqasiyası
yoxdur: FK bəzi mühitlərdə yoxdur, sorğu da join-i açıq yazır. Query filter yoxdur.

## 3. Giriş tokeni (mövcud, genişlənir)

| Claim | Bugün | Sonra |
|---|---|---|
| `sub` | istifadəçi id-si | eyni |
| `preferred_username` | ad | eyni |
| `role` (`ClaimTypes.Role`) | rol kodu | eyni |
| `sst` | — | **yeni**: versiya, uuid mətni (R3) |

## 4. Yoxlama qaydası (hər qorunan sorğu, R4)

Bir sorğu yazılır: `users` (`IgnoreQueryFilters`) LEFT JOIN `admin_user_security_stamps`,
`users.id = sub` üzrə.

| Vəziyyət | Nəticə | Log səbəbi |
|---|---|---|
| `sst` claim-i yoxdur və ya uuid deyil | rədd | `stamp_missing` |
| istifadəçi sətri yoxdur | rədd | `user_missing` |
| `deleted_at IS NOT NULL` | rədd | `user_deleted` |
| `is_active = false` | rədd | `user_inactive` |
| versiya sətri yoxdur və ya `stamp ≠ sst` | rədd | `stamp_mismatch` |
| digər hallar | qəbul | — |

`locked_until` yoxlanmır (spec Edge Case, R4).

## 5. Vəziyyət keçidləri (versiya)

```text
(sətir yoxdur) ──login/refresh: get-or-create──▶ S1
S1 ──deaktivasiya | rol dəyişikliyi | parol reset | silmə──▶ S2  (S1 ilə tokenlər rədd)
S2 ──reaktivləşdirmə | email dəyişikliyi | kilid──▶ S2  (dəyişmir)
(sətir yoxdur) ──rotate (upsert)──▶ S_new
```

- **Get-or-create** (`login`, `refresh`): `INSERT … ON CONFLICT (user_id) DO NOTHING`, sonra
  `SELECT stamp`. Gələn token bu dəyəri daşıyır.
- **Rotate** (`UsersController.Update | ResetPassword | Delete`, R5): istifadəçi
  dəyişikliyinin tranzaksiyasında upsert edilir. Dəyişiklik rədd olunarsa geri qaytarılır.
- **Rol dəyişikliyi** refresh tokenlərini ləğv **etmir** (FR-008). Deaktivasiya, parol reset
  və silmə isə commit-dən sonra `RevokeAllForUserAsync`-i çağırmağa davam edir.
