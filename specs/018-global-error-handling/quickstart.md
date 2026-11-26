# Quickstart: qlobal xəta idarəsinin yoxlanması

**Spec**: [spec.md](./spec.md) · **Contract**: [contracts/error-response.md](./contracts/error-response.md)

Lokalda .NET SDK yoxdur (Konstitusiya VIII.1 sapması, plan → Complexity Tracking): build
GitLab pipeline-ında, yoxlama `test` mühitində (`https://api-cbar-admin-test.cbar.az`).
Bütün sorğular bash-da; `$T` — admin access token (`POST /api/v1/auth/login`), `$API` — baza URL.

```bash
API=https://api-cbar-admin-test.cbar.az/api/v1
T=$(curl -s -X POST "$API/auth/login" -H 'Content-Type: application/json' \
      -d '{"username":"…","password":"…"}' | jq -r .accessToken)
H=(-H "Authorization: Bearer $T" -H 'Content-Type: application/json')
```

## §0 — Deploy-dan əvvəl: məhdudiyyət adları

`test` bazasında (DBA və ya `psql` çıxışı olan şəxs):

```sql
SELECT conname FROM pg_constraint
WHERE conname LIKE '%\_locale\_slug\_key' OR conname LIKE '%\_locale\_fkey'
   OR conname IN ('users_username_key', 'users_email_key', 'media_assets_storage_key_key')
ORDER BY 1;
```

Gözlənilən: 5 `*_locale_slug_key`, 25 `*_locale_fkey`, üç adlı məhdudiyyət. Fərq varsa —
data-model §3 düzəldilir, kod yazılmazdan əvvəl.

## §1 — Deploy-dan əvvəl: baseline

Köhnə versiyada aşağıdakı §2–§5 sorğularını bir dəfə işlədin və status/gövdəni qeyd edin
(gözlənilən: §2-də 500-lər, §4-də boş 401/403, `{message}` gövdələri). Bu, "bu gün 500 idi"
iddiasının sübutudur.

## §2 — DB rəddi → 400/409 (US1, SC-001)

| # | Hal | Sorğu | Gözlənilən |
|---|---|---|---|
| a | Username yarışı | eyni yeni username ilə iki `POST /users` **paralel** (`… & … & wait`) | biri 201, digəri 409, `message` "Username or email is already in use.", `errors.Username` |
| b | Slug yarışı | eyni yeni başlıqla iki `POST /press-releases` paralel | biri 201, digəri 201 (`-2`, ardıcıl yol) **və ya** 409 `field: "slug"`; 500 yoxdur |
| c | Paralel eyni upload | yeni (təsadüfi məzmunlu) SVG ilə iki `POST /media` paralel | ikisi də 200, **eyni** `id`; `GET /media?search=<ad>` bir qeyd |
| d | Naməlum locale | `POST /press-releases` `translations: { "ru": {…} }` | 400, `type` `urn:cbar:problem:reference-missing`, "Unknown locale." |
| e | Uzun dəyər | `POST /press-releases`, `az.title` 501 simvol | 400, `urn:cbar:problem:value-too-long` |
| f | `CHECK` | məzənnə vərəqində `rate: 0` | 400, `urn:cbar:problem:value-rejected` (8b gələnə qədər) |
| g | Atomiklik | a–f-dən sonra | rədd olunan sorğulardan heç bir qeyd, heç bir `audit_log` sətri (panel "Audit" və ya SQL) |

Yarış üçün nümunə:

```bash
body='{"username":"race-'$RANDOM'","email":"r'$RANDOM'@x.az","password":"Passw0rd!long","roleId":2}'
for i in 1 2; do curl -s -o /dev/null -w '%{http_code}\n' -X POST "$API/users" "${H[@]}" -d "$body" & done; wait
```

(b)-də ardıcıl `UniqueSlug` çox vaxt yarışı əvvəlcədən həll edir; 409-u görmək üçün 5–10 cəhd
lazım ola bilər. Meyar: **heç bir cəhddə 500 yoxdur**.

## §3 — Gözlənilməz xəta və log (US2, SC-003, SC-004)

1. 500 yaradan sorğu: DevOps ilə razılaşdırılmış qısa MinIO kəsilməsi zamanı yeni fayl upload-u
   (və ya mövcud başqa 500 halı). Cavab: 500, `type`, `status`, `detail`, `traceId`; `title`,
   SQL, stack trace **yoxdur**.
2. `traceId`-nin orta 32 simvolu (`00-<bu hissə>-…-01`) ilə pod loguna baxın:
   Error sətri + stack trace 1 dəqiqədən az vaxtda tapılır.
3. §2 hallarının loqu: Warning (Error yox), `SqlState` və məhdudiyyət adı ilə.
4. Hər §2–§3 cavabında: `Access-Control-Allow-Origin` panel origin-i ilə (`-H 'Origin: …'`).
5. Müştəri kəsilməsi: böyük upload-u yarıda `Ctrl+C` — logda Error yoxdur.

## §4 — Vahid forma (US3, SC-002, SC-006)

| Sorğu | Gözlənilən |
|---|---|
| token olmadan `GET /pages` | 401 problem+json, `title` yoxdur, `WWW-Authenticate` var |
| redaktor tokeni ilə `GET /users` | 403 problem+json, `title` yoxdur |
| `GET /pages/999999999` | 404 problem+json, `title: "Not Found"` (bu günkü kimi) |
| `DELETE` uşaqlı səhifə | 409, bugünkü mətn həm `message`, həm `detail`-də |
| `PUT /pages/1` səhv tipli gövdə | 400 `ValidationProblemDetails`, `errors` açarları bu günkü kimi, `message` **yoxdur** |
| `POST /auth/refresh` cookie-siz | 401, `code: "refresh_missing"`, `message: "Session expired."` |
| non-image preview | 415, `mimeType` sahəsi |
| `GET /no-such-route` | 404 problem+json |

Kodda: `grep -rn "new { message" src/Cbar.AdminApi/Controllers` → **0** nəticə.

OpenAPI: `cd openapi && npm run lint && npm run bundle` yaşıl; deploy-dan sonra
`API_URL=… ADMIN_USER=… ADMIN_PASSWORD=… node scripts/contract-check.mjs` yaşıl (401/404
gövdələri yeni sxemə qarşı yoxlanılır — deploy-dan **əvvəl** işlətmək qırmızı verəcək, bu
gözləniləndir).

## §5 — Panel dəyişmədən (US4, SC-005)

`web-cbar-admin-new` dəyişmir. `test` panelində:

1. Uşaqlı səhifəni silmək → bugünkü ingiliscə biznes mesajı.
2. Silinmiş qeydin URL-i → bugünkü "Not Found" davranışı.
3. Access token-in vaxtının keçməsini gözləmək (15 dəq) və ya iki tabda eyni anda hərəkət →
   sessiya qorunur, `refresh_stale` bir dəfə təkrarlanır.
4. Redaktor kimi "İstifadəçilər" → panelin öz (azərbaycanca) 403 mesajı, ingiliscə mətn yox.
5. Forma səhv tipli dəyərlə → sahə xətası bu günkü yerdə.
6. Mövcud username ilə istifadəçi yaratmaq (ardıcıl) → bugünkü mesaj; panel `errors.Username`-i
   sahənin altında da göstərə bilər (yaxşılaşma).

Panel repo-sunda: `npm run verify` yaşıl (dəyişiklik olmadan — reqressiya şəbəkəsi).
