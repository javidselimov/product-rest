# Data Model: Login cavab vaxtı üzrə username enumeration

**Sxem dəyişikliyi yoxdur.** Migration, `Cbar.Domain` dəyişikliyi və ya yeni cədvəl tələb
olunmur; hər iki `Cbar.Domain` kopyası toxunulmaz qalır.

## İştirak edən mövcud sahələr (`users`, yalnız oxunur)

| Sahə | Rolu bu feature-da |
|---|---|
| `username` (citext, unique) | Axtarış açarı. Tapılmırsa → dummy yolu |
| `is_active` | `false` → axtarış nəticəsi boş → dummy yolu (FR-002) |
| `deleted_at` | EF query filter (`DeletedAt == null`) → silinmiş hesab boş nəticə → dummy yolu (FR-002) |
| `password_hash` | bcrypt hash; mövcud hesabda `Verify` buna qarşı. Gözlənilən format `$2a$/$2b$/$2y$` + iş faktoru `12` |
| `locked_until` | Toxunulmur (#2-nin əhatəsi, research R5) |
| `failed_logins` | Toxunulmur (#2-nin əhatəsi) |

## Yaddaşdakı dəyərlər (persist olunmur)

| Ad | Növ | Qayda |
|---|---|---|
| `PasswordHashing.WorkFactor` | sabit, `12` | Yeni parol hash-larının **və** dummy hash-ın yeganə mənbəyi (research R2) |
| `PasswordHashing.DummyHash` | proses ömrü boyu sabit sətir | Təsadüfi, heç yerdə saxlanılmayan paroldan `WorkFactor` ilə yaradılır; heç bir istifadəçiyə aid deyil, loglanmır, cavaba düşmür (research R3) |

## Login qərar cədvəli (dəyişiklikdən sonra)

| Hal | bcrypt yoxlaması nəyə qarşı | Nəticə | Cavab |
|---|---|---|---|
| Ad yoxdur | `DummyHash` | rədd | 401 `Invalid credentials.` |
| Hesab deaktivdir / silinib | `DummyHash` | rədd | 401 `Invalid credentials.` |
| Ad var, parol səhvdir | `password_hash` | rədd | 401 `Invalid credentials.` |
| Ad var, parol doğrudur, kilidlidir | `password_hash` | rədd | 401 `Account temporarily locked.` (bugünkü kimi; #2 dəyişəcək) |
| Ad var, parol doğrudur | `password_hash` | qəbul | 200 + token + refresh cookie |

Hər sətirdə bcrypt **tam bir dəfə** eyni iş faktoru ilə icra olunur — vaxt invariantının mənbəyi budur.
