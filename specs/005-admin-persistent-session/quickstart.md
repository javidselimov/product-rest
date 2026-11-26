# Quickstart: davamlı sessiyanın yoxlanılması

Kontraktlar: [auth-api.md](./contracts/auth-api.md), [panel-session.md](./contracts/panel-session.md).
Model: [data-model.md](./data-model.md).

## 0. Ön şərtlər

- Docker infra: `cd api-cbar-admin && docker compose up -d` (Postgres 5433).
- **API build/run .NET SDK tələb edir** — bu maşında yoxdur (research R14). SDK olan
  maşında və ya CI-da §1–§2; burada yalnız §3 (MSW) və §4 (test mühiti).
- Seed giriş: `admin` / `ChangeMe123!` (`api-cbar-admin/CREDENTIALS.md`).

## 1. API — build və migration

```powershell
cd api-cbar-admin
dotnet build
dotnet run --project src/Cbar.AdminApi   # :5253, log-da "Applying migration 0004-refresh-token-rotation.sql"
```

Gözlənilən: `schema_migrations`-da `0004-refresh-token-rotation.sql`; `\d refresh_tokens`
`family_id`, `family_created_at`, `replaced_by_id` göstərir. `api-cbar` də build olur
(`Cbar.Domain` kopyaları eynidir):

```powershell
git diff --no-index api-cbar/src/Cbar.Domain api-cbar-admin/src/Cbar.Domain   # boş çıxış
cd api-cbar; dotnet build
```

## 2. API — endpoint-lər (curl, cookie jar ilə)

```bash
B=http://localhost:5253/api/v1/auth
curl -si -c jar -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"ChangeMe123!"}' $B/login     # 200 + Set-Cookie cbar_admin_rt (HttpOnly; SameSite=Strict; Path=/api/v1/auth)
cp jar jar.old
curl -si -b jar -c jar -X POST $B/refresh                        # 200, yeni accessToken, yeni cookie
curl -si -b jar.old -X POST $B/refresh                           # ≤30 s: 401 refresh_stale
sleep 31; curl -si -b jar.old -X POST $B/refresh                 # 401 refresh_reused + ailə ləğv
curl -si -b jar -X POST $B/refresh                               # 401 (ailə ləğv olunub)
curl -si -X POST -H 'Origin: https://evil.example' -b jar $B/refresh   # 403 origin_forbidden
curl -si -b jar -X POST $B/logout                                # 204, Max-Age=0; təkrar → yenə 204
```

Əlavə:
- Admin olaraq ikinci istifadəçini deaktiv et / şifrəsini sıfırla → onun cookie-si ilə
  refresh `401 user_inactive` / `refresh_expired`.
- `audit_log`-da `auth.login`, `auth.logout`, `auth.refresh_reuse`; log-da token/hash yoxdur:
  `Select-String -Path logs/api-admin.log -Pattern 'cbar_admin_rt='` → boş.
- Köhnə panel (`web-cbar-admin`, :5173): login + bir CRUD əməliyyatı dəyişmədən işləyir.

## 3. Panel — avtomatik gate (lokal, API-siz)

```powershell
cd web-cbar-admin-new
npm run verify
```

`auth-flow.test.tsx` / `session.test.ts` bu ssenariləri əhatə etməlidir:
bootstrap bərpası (200/401/5xx), 401 → refresh → bir dəfə təkrar, N paralel sorğu → 1
refresh, `refresh_stale` → təkrar, refresh 401 → login + toast, refresh 5xx → çıxış yox,
logout → endpoint çağırılır və broadcast, login `withCredentials`, storage-da token yoxdur.

## 4. Real axın (brauzer)

Lokal (SDK olan maşın): `.\dev.ps1` → `http://localhost:5174`.
Burada: test mühiti `https://admin-temp.cbar.az` (hər iki MR `test`-ə deploy olunduqdan sonra; API əvvəl).

| # | Addım | Gözlənilən | SC |
| --- | --- | --- | --- |
| 1 | Daxil ol → `/pages` → F5 | login ekranı görünmür, siyahı yüklənir (<1 s bərpa) | SC-001 |
| 2 | Yeni tab → `/laws` | girişsiz açılır | US1-2 |
| 3 | Brauzeri bağla/aç | daxil olmuş qalır (8 saat hərəkətsizlik ərzində) | US1-3 |
| 4 | 16+ dəq gözlə → yadda saxla | uğurlu, Network-də 1 `refresh` + təkrarlanmış sorğu | SC-002 |
| 5 | DevTools → Application → Cookies | `cbar_admin_rt` HttpOnly; `document.cookie`-də yoxdur; Local/Session Storage boş | SC-005 |
| 6 | İki tab açıq, ikisində eyni anda F5 | heç biri çıxmır | SC-007 |
| 7 | Çıxış → geri düyməsi → F5 | hər ikisində login; digər açıq tab da login-ə keçir | SC-003 |
| 8 | Admin başqa brauzerdə istifadəçini deaktiv edir | ≤15 dəq ərzində istifadəçi login-ə düşür | SC-004 |
