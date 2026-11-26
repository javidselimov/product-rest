# Contract: `api-cbar-admin` auth endpoint-ləri

Base: `/api/v1/auth`. Hamısı `[AllowAnonymous]` (bearer tələb etmir).
Cookie: `cbar_admin_rt` — `HttpOnly; SameSite=Strict; Path=/api/v1/auth; Secure` (Development-də `Secure` yox).
Xəta body-si bugünkü forma: `{ "message": string }`, əlavə olaraq maşın oxunaqlı `"code"`.

---

## 1. `POST /login` (mövcud — cavab body-si dəyişmir)

Request:
```json
{ "username": "admin", "password": "ChangeMe123!" }
```

`200 OK`:
```json
{ "accessToken": "<jwt>", "expiresAt": "2026-09-23T10:15:00+00:00" }
```
+ `Set-Cookie: cbar_admin_rt=<32 bayt base64url>; Max-Age=28800; Path=/api/v1/auth; HttpOnly; SameSite=Strict; Secure`

`401` — `{ "message": "Invalid credentials." }` və ya `{ "message": "Account temporarily locked." }` (dəyişmir; cookie verilmir).

Qeyd: köhnə panel credential-sız cross-origin sorğu göndərdiyi üçün brauzer `Set-Cookie`-ni saxlamır — köhnə panel üçün davranış eynidir.

---

## 2. `POST /refresh` (yeni)

Request: body yoxdur. Cookie `cbar_admin_rt` brauzer tərəfindən göndərilir (`credentials: include`).

Server yoxlamaları (ardıcıl):
1. `Origin` varsa və `Cors:Origins`-də deyilsə → `403 { code: "origin_forbidden" }`.
2. Cookie yoxdur → `401 { code: "refresh_missing" }`.
3. Hash tapılmır → `401 { code: "refresh_invalid" }` + cookie silinir.
4. Sətir rotasiya olunub (`replaced_by_id` var):
   - rotasiyadan ≤ `RefreshReuseGraceSeconds` → `401 { code: "refresh_stale" }`, **cookie silinmir**, heç nə dəyişmir;
   - daha gec → ailə ləğv, `auth.refresh_reuse` audit, `401 { code: "refresh_reused" }` + cookie silinir.
5. Ləğv olunub / vaxtı keçib → `401 { code: "refresh_expired" }` + cookie silinir.
6. İstifadəçi deaktiv / silinmiş / bloklanmış → ailə ləğv, `401 { code: "user_inactive" }` + cookie silinir.
7. Uğur: köhnə sətir `revoked_at = now`, `replaced_by_id = new.id`; yeni sətir eyni ailədə.

`200 OK` (login ilə **eyni forma**):
```json
{ "accessToken": "<jwt, cari rol ilə>", "expiresAt": "..." }
```
+ yeni `Set-Cookie: cbar_admin_rt=<yeni dəyər>; Max-Age=<qalan ömür>; ...`

Cookie silmə = eyni ad/path ilə `Max-Age=0`.

Rotasiya tranzaksiya daxilində aparılır; iki paralel sorğu eyni sətri rotasiya edə bilməz
(`UPDATE ... WHERE id = @id AND revoked_at IS NULL` təsirlənən sətir sayı 1 olmalıdır;
0 olarsa addım 4-ə düşür).

---

## 3. `POST /logout` (yeni)

Request: body yoxdur, cookie ilə. `Origin` yoxlaması `/refresh` ilə eynidir.

- Cookie aktiv sətrə uyğundursa: həmin **ailənin** aktiv sətri ləğv, `auth.logout` audit.
- Hər halda (cookie yox, etibarsız, vaxtı keçmiş): cookie silinir.

`204 No Content` — həmişə (idempotent, FR-010). Yalnız `403 origin_forbidden` istisnadır.

---

## 4. Digər endpoint-lər

- Bütün kontent endpoint-ləri: dəyişmir — yalnız `Authorization: Bearer <accessToken>`.
  Cookie onlara göndərilmir (path) və qəbul edilmir.
- `UsersController`: `PUT /users/{id}` (`isActive: false`), `PUT /users/{id}/password`,
  `DELETE /users/{id}` — kontrakt dəyişmir; yan təsir: həmin istifadəçinin bütün aktiv
  refresh sətirləri ləğv olunur.

## 5. CORS

`Access-Control-Allow-Credentials: true`, `Access-Control-Allow-Origin: <dəqiq origin>`
yalnız `Cors:Origins` siyahısı üçün. Wildcard yoxdur.
