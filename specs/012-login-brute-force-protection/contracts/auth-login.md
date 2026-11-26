# Contract: `POST /api/v1/auth/login` — brute-force qoruması ilə

Mənbə spec: `product-rest/api-cbar-admin/openapi/paths/auth.yaml#/login`. Route, `security: []`,
`LoginRequest`, `LoginResponse` və `400` **dəyişmir**. Dəyişən: `401`-in mənası (kilid daxil
olur, ayrıca mesajı yoxdur) və yeni `429`. Spec-first: əvvəl `openapi/` yenilənir, lint + bundle,
sonra kod (`/api-endpoint`, research R6). Route əlavə/silinmədiyi üçün `spec-first.mjs` hook-u
keçir, amma xatırlatma verir — bu sənəd həmin yoxlamanın əl ilə hissəsidir.

## Cavablar

| Sorğu | Status | Başlıqlar | Gövdə |
|---|---|---|---|
| Ad üzrə limit aşılıb (120 s-də 10-dan çox; ad mövcud olsa da, olmasa da) | **`429`** *(yeni)* | `Retry-After: <saniyə>` | `{"message":"Too many login attempts. Try again later."}` |
| Ad yoxdur / deaktiv / silinib | `401` | — | `{"message":"Invalid credentials."}` |
| Ad var, parol səhv (5-ci səhv hesabı kilidləyir) | `401` | — | `{"message":"Invalid credentials."}` |
| Hesab kilidlidir — parol **doğru və ya səhv** | `401` *(dəyişib)* | — | `{"message":"Invalid credentials."}` |
| Parol doğru, hesab kilidli deyil | `200` | `Set-Cookie: cbar_admin_rt=…` | `{"accessToken":"…","expiresAt":"…"}` *(dəyişmir)* |
| Gövdə validasiyadan keçmir | `400` | — | ValidationFailed *(dəyişmir; limitdən əvvəl model binding işləyir)* |

`{"message":"Account temporarily locked."}` cavabı **artıq yoxdur**. Panel heç vaxt ona
əsaslanmayıb (`login-form.tsx` yalnız `status === 401`-ə baxır), ona görə bu, geriyə uyğun
dəyişiklikdir.

## İnvariantlar

1. **Cavab bərabərliyi** (FR-005, SC-002): dörd `401` sətrinin status, gövdə və başlıqları
   bayt-bayt eynidir; median cavab vaxtı fərqi < 25 ms. Hər `401` yolunda bir bcrypt `Verify`
   işləyir (spec 011 invariantı genişlənir: kilidli hesab da daxildir).
2. **Limit bazadan əvvəldir** (FR-010): `429` cavabında istifadəçi axtarılmır, parol
   yoxlanmır, sayğac dəyişmir. Mövcud və mövcud olmayan ad üçün `429` eynidir.
3. **Yalnız login** (FR-011): `POST /auth/refresh` və `POST /auth/logout` heç vaxt `429`
   qaytarmır.
4. **Açar normallaşdırılır** (FR-008): `Admin`, ` admin ` və `admin` eyni limit pəncərəsini
   paylaşır.

## OpenAPI dəyişikliyi (`openapi/paths/auth.yaml` → `login.post.responses`)

- `'401'.description`: "Wrong username/password, inactive or unknown user, **or a locked
  account** — all return `Invalid credentials.` with no `code`, and take the same time.
  A locked account is not distinguishable from a wrong password."
- `'429'` *(yeni)*: description "More than 10 attempts for this username within 120 seconds
  (counted whether or not the user exists). Sent before the password is checked."; header
  `Retry-After` (integer, seconds); content `application/json` →
  `../components/schemas/common.yaml#/ErrorMessage`.
- `login.post.description`-a bir abzas: "After 5 wrong passwords within 10 minutes the account
  is locked for 15 minutes; while locked, even the correct password is rejected with the same
  401. An administrator's password reset or reactivation clears the lock."
- `openapi.yaml`-dakı `# Sync:` sətri `/sync-openapi` qaydası ilə yenilənir.

## Server log-u (FR-012) — kontrakt deyil, əməliyyat üçün

| Hadisə | Səviyyə | Mətn |
|---|---|---|
| Hər uğursuz cəhd (mövcud) | Warning | `Login failure for {Username} from {Ip}` *(dəyişmir)* |
| Hesab kilidləndi | Warning | `Account {Username} locked until {LockedUntil} after {FailedLogins} failures from {Ip}` |
| Ad üzrə limit aşıldı | Warning | `Login rate limit hit for {Username} from {Ip}` |

`{Ip}` #5-ə qədər ingress IP-sidir — log-da qalır, amma limit açarı deyil (Q3).

## `UsersController` yan təsiri (FR-007) — kontrakt dəyişmir

`PUT /users/{id}/password` və `PUT /users/{id}` (`isActive: false → true`) əlavə olaraq kilidi
və sayğacı sıfırlayır. Sorğu/cavab forması eynidir, OpenAPI-də yalnız təsvirə bir cümlə.
