# Data Model: Admin panel — davamlı sessiya

**Feature**: [spec.md](./spec.md) | **Research**: [research.md](./research.md)

## 1. `refresh_tokens` (mövcud cədvəl, genişlənir)

Mövcud (`0001-initial-schema.sql`):

| Sütun | Tip | Qeyd |
| --- | --- | --- |
| `id` | `bigserial` PK | |
| `user_id` | `integer` FK → `users(id)` `ON DELETE CASCADE` | |
| `token_hash` | `varchar(255)` UNIQUE | SHA-256(token), hex/base64url — dəyərin özü heç vaxt saxlanılmır |
| `expires_at` | `timestamptz` | hərəkətsizlik sərhədi, `family_created_at + absolute`-dan keçmir |
| `revoked_at` | `timestamptz` NULL | rotasiya, logout, admin ləğvi və ya reuse |
| `ip` | `inet` NULL | yaradılma anındakı klient IP |
| `user_agent` | `varchar(500)` NULL | kəsilmiş |
| `created_at` | `timestamptz` default `now()` | |

Əlavə (migration `0004-refresh-token-rotation.sql`, `IF NOT EXISTS`):

| Sütun | Tip | Qeyd |
| --- | --- | --- |
| `family_id` | `uuid NOT NULL` | login başına bir ailə; bütün rotasiyalar paylaşır |
| `family_created_at` | `timestamptz NOT NULL` | login anı — maksimal ömrün hesablanması |
| `replaced_by_id` | `bigint NULL` FK → `refresh_tokens(id)` `ON DELETE SET NULL` | rotasiya zənciri, reuse aşkarlanması |

İndekslər: `ix_refresh_tokens_user_id (user_id)`, `ix_refresh_tokens_family_id (family_id)`.

> Cədvəl bu günə qədər istifadə olunmayıb (boşdur), ona görə `NOT NULL` sütunlar
> default-suz əlavə oluna bilər. Migration buna baxmayaraq mövcud sətir üçün təhlükəsiz
> yazılır (bax plan — sətir varsa əvvəlcə silinir: onlar heç vaxt verilməyib).

### EF modeli (`Cbar.Domain/Entities/Auth.cs` — **hər iki API-də eyni**)

`RefreshToken`-ə: `Guid FamilyId`, `DateTimeOffset FamilyCreatedAt`, `long? ReplacedById`.
`CbarDbContext`-də `HasIndex(x => x.UserId)`, `HasIndex(x => x.FamilyId)`.

### Vəziyyətlər

```text
             login
               │
               ▼
          ┌─────────┐   refresh (rotation)   ┌──────────────────────┐
          │ ACTIVE  │ ─────────────────────▶ │ ROTATED (revoked_at, │
          └─────────┘                        │ replaced_by_id set)  │
            │  │  │                          └──────────────────────┘
   logout / │  │  │ expires_at < now                 │ təqdim olunur:
   admin    │  │  ▼                                   │  ≤ grace → 401 stale (dəyişiklik yox)
   ləğvi    │  │ EXPIRED                              │  > grace → bütün ailə REVOKED
            ▼  │
         REVOKED ◀── reuse aşkarlandı (ailə üzrə)
```

- **ACTIVE**: `revoked_at IS NULL AND expires_at > now()`. Ailədə eyni anda ən çox bir ACTIVE sətir.
- Refresh yalnız ACTIVE sətirlə uğurludur **və** istifadəçi `is_active`, `deleted_at IS NULL`,
  `locked_until` keçmişdədir.

### Validasiya qaydaları

- `expires_at = min(now + RefreshIdleHours, family_created_at + RefreshAbsoluteDays)`.
- Yeni sətir `family_id` və `family_created_at`-ı əvvəlkindən miras alır.
- `ip` / `user_agent` hər sətirdə cari sorğudan yazılır (audit izi üçün; bağlama/binding yoxdur).

## 2. Konfiqurasiya (`appsettings*.json`, Vault override)

| Açar | Default | Development |
| --- | --- | --- |
| `Jwt:AccessTokenMinutes` | 15 (mövcud) | 15 |
| `Jwt:RefreshIdleHours` | 8 | 8 |
| `Jwt:RefreshAbsoluteDays` | 7 | 7 |
| `Auth:RefreshReuseGraceSeconds` | 30 | 30 |
| `Auth:RefreshCookie:Name` | `cbar_admin_rt` | eyni |
| `Auth:RefreshCookie:Secure` | `true` | `false` |
| `Cors:Origins` | Vault (`Cors__Origins__0`) | `http://localhost:5173`, `http://localhost:5174` |

Sirr deyil — Vault-a yeni açar lazım deyil; `.ci-cd/*.yaml`-a toxunulmur.

## 3. Panel auth store (`features/auth/model/auth-store.ts`)

Sahələr dəyişmir: `isAuthenticated`, `user`, `accessToken`, `expiresAt`. Əlavə:

| Sahə | Tip | Məna |
| --- | --- | --- |
| `status` | `'restoring' \| 'anonymous' \| 'authenticated'` | bootstrap bərpası zamanı UI yanıb-sönmür |

Heç biri `persist` olunmur (template konstitusiyası). Refresh token panelə **heç vaxt** gəlmir.

## 4. Audit hadisələri (`audit_log`)

| `action` | `entity_type` / `entity_id` | Nə vaxt |
| --- | --- | --- |
| `auth.login` | `user` / istifadəçi id | uğurlu login |
| `auth.logout` | `user` / istifadəçi id | aktiv sessiyanın logout-u |
| `auth.refresh_reuse` | `user` / istifadəçi id | grace-dən sonra təkrar istifadə → ailə ləğvi |

`before`/`after`: yalnız `{ familyId }` — token və hash yox.
