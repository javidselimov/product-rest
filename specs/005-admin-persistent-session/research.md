# Research: Admin panel — davamlı sessiya

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md) | **Date**: 2026-09-23

Hər bölmə: **Qərar** / **Səbəb** / **Alternativlər**.

---

## R0 — Spec-də açıq qalan iki sualın həlli (Q1, Q2a)

İstifadəçi `/speckit-plan`-ı Q1 və Q2a-ya cavab vermədən işə saldı. Hər ikisi dizaynı
**dəyişmir** — yalnız konfiqurasiya dəyərlərini və DevOps tapşırığını müəyyən edir. Ona
görə plan tövsiyə olunan default-larla davam edir; cavab fərqli olsa yalnız aşağıdakı
dəyərlər dəyişir, kod yox.

| Sual | Qəbul edilən default | Fərqli cavab olsa nə dəyişir |
| --- | --- | --- |
| Q1 — sessiya müddəti | **8 saat hərəkətsizlik, maksimum 7 gün** (`product-host`-un `authTimeout = 28800`-i + məhdud maksimum) | Yalnız `Jwt:RefreshIdleHours` / `Jwt:RefreshAbsoluteDays` dəyərləri. "Məni xatırla" (Q1-C) seçilsə login formasına checkbox və login sorğusuna bir sahə əlavə olunur |
| Q2a — prod panel host-u | **Panel `cbar.az` altına köçür** (məs. `cbar-admin.cbar.az`) — test mühiti ilə eyni sxem | Q2a-B (nginx proxy) seçilsə: panelin `default.conf`-una `location /api/` bloku, `.env.production`-da `VITE_API_URL=/api/v1`. API kodu eyni qalır |

Hər iki default `spec.md` Clarifications bölməsinə "plan default-u, istifadəçi təsdiqi
gözlənilir" qeydi ilə yazılıb.

---

## R1 — Token modeli: hibrid (access yaddaşda, refresh httpOnly cookie-də)

**Qərar**: 15 dəqiqəlik access token bugünkü kimi panelin yaddaşında qalır və
`Authorization: Bearer` başlığı ilə göndərilir. Uzunömürlü **refresh token** yalnız
httpOnly cookie-də yaşayır; cookie yalnız `/api/v1/auth/*` yoluna göndərilir.
Səhifə yenilənəndə panel `POST /auth/refresh` çağırır, yeni access token alır.

**Səbəb**:
- 26 kontent controller-i və JWT bearer konfiqi **dəyişmir**; kontent endpoint-ləri
  cookie qəbul etmədiyi üçün CSRF səthi yalnız `refresh` və `logout` ilə məhdudlaşır.
- Köhnə `web-cbar-admin` bearer ilə işləməyə davam edir (FR-023).
- JS heç bir uzunömürlü sirri görmür: XSS ən çoxu yaddaşdakı 15 dəqiqəlik tokeni ələ
  keçirə bilər, sessiyanı yox.
- Template konstitusiyası ("access token yalnız yaddaşda, localStorage yox") pozulmur.

**Alternativlər**:
- *Access token-in özü httpOnly cookie-də*: bütün endpoint-lərdə CSRF qoruması lazım
  olardı, `AddJwtBearer`-a cookie oxuma əlavə olunardı, köhnə panel ilə iki auth yolu
  paralel yaşayardı. Rədd edildi.
- *Refresh token localStorage-da*: XSS ilə oğurlanır, template konstitusiyasına ziddir.
- *Server-side session (ASP.NET cookie auth)*: bütün API-nin auth sxemi dəyişərdi.

## R2 — Cookie atributları

**Qərar**:

| Atribut | Dəyər | Qeyd |
| --- | --- | --- |
| Ad | `cbar_admin_rt` | Konfiq: `Auth:RefreshCookie:Name` |
| `HttpOnly` | həmişə | FR-001 |
| `Secure` | `true`; yalnız Development-də `false` | Konfiq: `Auth:RefreshCookie:Secure`. Lokal Vite proxy HTTP-dir |
| `SameSite` | `Strict` | Panel və API eyni saytdadır (R0/Q2a) — Strict kifayətdir |
| `Path` | `/api/v1/auth` | Kontent sorğuları cookie daşımır (FR-012) |
| `Domain` | təyin edilmir (host-only) | Cookie yalnız API host-una aiddir |
| `Max-Age` | refresh tokenin qalan ömrü | Brauzer bağlanıb açılanda sessiya qalır (US1-3) |

**Səbəb**: `SameSite=Strict` + dar `Path` CSRF-in əsas müdafiəsidir; `Secure` deploy-da
məcburidir. `__Host-` prefiksi `Path=/` tələb etdiyi üçün seçilmədi (dar path daha dəyərlidir).

**Alternativlər**: `SameSite=None` — yalnız panel və API fərqli saytlarda olsa lazımdır,
amma o halda brauzerlər (Safari ITP, Chrome third-party cookie siyasəti) cookie-ni onsuz
da bloklaya bilər. Buna görə eyni sayt şərtdir (Q2/Q2a).

## R3 — Eyni sayt şərti və mühitlər

**Qərar / ölçülən vəziyyət**:

| Mühit | Panel | API | Eyni sayt? |
| --- | --- | --- | --- |
| Lokal | `localhost:5174` | Vite proxy → `localhost:5253` | eyni mənbə ✅ |
| Dev | (host `TODO(devops)`) | `api-cbar-admin-test.cbar.az` | panel `*.cbar.az`-da olmalıdır |
| Test | `admin-temp.cbar.az` | `api-cbar-admin-test.cbar.az` | ✅ `cbar.az` |
| Prod | `cbar-admin.e-cbar.az` → **`cbar-admin.cbar.az`** (R0) | `api-cbar-admin.cbar.az` (Q2) | R0-dan sonra ✅ |

Əlavə: `web-cbar-admin-new/.env.production`-dakı `api-cbar-admin.e-cbar.az` → `api-cbar-admin.cbar.az`.

**Səbəb**: cross-site olsa cookie ya bloklanır, ya `SameSite=None` tələb edir. Eyni sayt
şərti həm də CSRF riskini azaldır.

## R4 — CORS

**Qərar**: default CORS siyasətinə `.AllowCredentials()` əlavə olunur; origin-lər
bugünkü kimi yalnız `Cors:Origins`-dən, wildcard-sız (ASP.NET `AllowCredentials` +
`AllowAnyOrigin` kombinasiyasına onsuz da icazə vermir). Panel yalnız auth
sorğularında `withCredentials: true` göndərir; kontent sorğuları bugünkü kimi
`withCredentials: false` qalır.

`appsettings.Development.json`-da `Cors:Origins`-ə `http://localhost:5174` əlavə olunur
(proxy CORS-a ehtiyac duymur, amma R6-dakı Origin yoxlaması bu siyahını istifadə edir).

**Səbəb**: cross-origin login cavabındakı `Set-Cookie`-ni brauzer yalnız credentialed
sorğuda saxlayır; refresh də credentialed olmalıdır. Köhnə panel credential göndərmir —
ona təsir yoxdur.

## R5 — Rotation, ailə (family) və təkrar istifadənin aşkarlanması

**Qərar**:
- Refresh token = 32 bayt kriptoqrafik təsadüfi dəyər (base64url). Bazada yalnız
  **SHA-256 hash**-i saxlanılır (`token_hash`, mövcud unikal indeks).
- Login yeni **ailə** (`family_id`, UUID) başladır; hər refresh köhnə sətri
  `revoked_at` + `replaced_by_id` ilə bağlayır və eyni ailədə yeni sətir yaradır.
- Artıq əvəz olunmuş token təqdim olunarsa:
  - rotasiyadan **≤ 30 saniyə** keçibsə (`Auth:RefreshReuseGraceSeconds`) — paralel
    tab yarışı sayılır: `401 refresh_stale`, ailə ləğv **olunmur**, cookie silinmir;
  - daha gec — oğurluq siqnalı: ailənin bütün aktiv sətirləri ləğv olunur, cookie
    silinir, `auth.refresh_reuse` audit/log hadisəsi yazılır (Edge case 1, FR-006).

**Səbəb**: OWASP / OAuth 2.0 Security BCP tövsiyəsi (refresh token rotation + reuse
detection). Qısa grace pəncərəsi SC-007-ni (paralel tablar yanlışlıqla çıxmır) qoruyur.

**Alternativlər**: rotasiyasız uzunömürlü token — oğurlanan dəyər 7 gün işləyir, rədd.
Grace-siz sərt reuse detection — iki tabda eyni anda F5 istifadəçini çıxarar, rədd.

## R6 — CSRF müdafiəsi (refresh/logout)

**Qərar**: üç qat:
1. `SameSite=Strict` (R2) — başqa saytdan gələn sorğu cookie daşımır.
2. `Path=/api/v1/auth` — cookie yalnız iki endpoint-ə gedir.
3. `refresh` və `logout`-da `Origin` başlığı varsa və `Cors:Origins`-də deyilsə → `403`.

Refresh cavabında token yalnız JSON body-dədir; CORS olmadan başqa origin onu oxuya bilmir.

**Səbəb**: Refresh "oxuma" əməliyyatıdır, amma state (rotation) dəyişir; logout isə
məcburi çıxış hücumuna açıqdır. Üç qat birlikdə CSRF token-siz kifayətdir.

**Alternativ**: double-submit CSRF token — panel tərəfində JS-in oxuya bildiyi ikinci
cookie lazım olardı; eyni sayt + Strict ilə əlavə dəyəri azdır. Rədd.

## R7 — Sessiya müddəti semantikası

**Qərar**:
- **Hərəkətsizlik (idle)**: hər refresh-də yeni sətrin `expires_at = now + 8 saat`.
- **Maksimal ömür (absolute)**: `expires_at` heç vaxt `family_created_at + 7 gün`-dən
  keçmir.
- Panel **proaktiv taymerlə refresh etmir**; yalnız sorğu lazım olanda (token ≤ 30 s
  qalıbsa və ya 401 gələndə) refresh edir. Beləcə açıq qalmış, amma istifadə olunmayan
  tab sessiyanı sonsuz uzatmır — "hərəkətsizlik" = 8 saat API sorğusu yoxdur.

**Səbəb**: `product-host` `authTimeout` semantikası (hərəkətsizlik) qorunur; maksimal
ömür oğurlanmış ailənin ömrünü məhdudlaşdırır.

## R8 — İstifadəçi dəyişikliklərində sessiyaların ləğvi

**Qərar**: `UsersController`-də:
- `Update` — `IsActive` `true → false` olanda;
- `ResetPassword` — həmişə;
- `Delete` — həmişə;

həmin istifadəçinin bütün aktiv refresh sətirləri `revoked_at = now` alır (eyni
`SaveChangesAsync`-də). Rol dəyişikliyi ləğv etmir — növbəti refresh cari rolu yazır
(US4-2). Refresh həmçinin `IsActive`, `DeletedAt` (query filter) və `LockedUntil`
yoxlayır (FR-007).

**Səbəb**: SC-004 — ən gec bir access token ömrü (15 dəq) ərzində kəsilmə.

## R9 — Audit və log

**Qərar**: `audit_log`-a `auth.login`, `auth.logout`, `auth.refresh_reuse` yazılır
(`entity_type = "user"`, `entity_id = user.Id`). Bunun üçün `AuditService.Log`-a
isteğe bağlı `actorId` parametri əlavə olunur: login/refresh anında `HttpContext.User`
boşdur. Adi uğurlu refresh audit-ə yazılmır (hər 15 dəqiqədən bir səs-küy olardı) —
yalnız Serilog `Debug`. Uğursuz refresh → Serilog `Warning` (istifadəçi id, IP; token yox).

**Səbəb**: Konstitusiya III.4 (yazma əməliyyatları audit-ə düşür) və FR-014; tokenlər və
hash-lər heç vaxt log-a yazılmır.

## R10 — Köhnəlmiş sətirlərin təmizlənməsi

**Qərar**: yeni hosted service yox. Login zamanı həmin istifadəçinin `expires_at`-ı
bir gündən çox keçmiş və ya `revoked_at`-ı 7 gündən köhnə sətirləri silinir (FR-015).
Uzun müddət login olmayan istifadəçilərin sətirləri azdır və onsuz da etibarsızdır.

**Alternativ**: `BackgroundService` gündəlik təmizlik — çox replika ilə koordinasiya
tələb edir. Admin istifadəçi sayı (onlarla) üçün lazımsızdır. Rədd.

## R11 — Sxem dəyişikliyi

**Qərar**: yeni migration `0004-refresh-token-rotation.sql` (unikal ad — `api-cbar`-da
migration yoxdur): `refresh_tokens`-ə `family_id uuid`, `family_created_at timestamptz`,
`replaced_by_id bigint NULL REFERENCES refresh_tokens(id)` və `(user_id)`,
`(family_id)` indeksləri — hamısı `IF NOT EXISTS`. Mövcud sətir yoxdur (cədvəl
istifadə olunmayıb), ona görə yeni sütunlar `NOT NULL` ola bilər. `RefreshToken`
entity-si **hər iki** `Cbar.Domain` kopyasında eyni dəyişiklikdə yenilənir.
`cbar_web_ro` grant-ı `0001`-dəki ümumi grant ilə gəlir — `api-cbar` bu cədvəli oxumur.

## R12 — Panel: sessiyanın bərpası və refresh axını

**Qərar**:
- `main.tsx` bootstrap-ı router render-dən **əvvəl** `restoreSession()` çağırır
  (`POST /auth/refresh`). Uğurlu olsa store doldurulur; `401` → anonim; şəbəkə/5xx →
  anonim + login səhifəsi (istifadəçi yenidən daxil ola bilər). Beləcə `authLayoutRoute`
  sinxron `beforeLoad` yoxlaması dəyişmir, login ekranı yanıb-sönmür (FR-016).
- Request interceptor: token ≤ 30 s qalıbsa əvvəlcə refresh (single-flight).
- Response interceptor: `401` (auth URL-ləri istisna, sorğu hələ təkrarlanmayıbsa) →
  refresh → sorğunu **bir dəfə** təkrarla. Refresh `401` ilə rədd olunarsa
  `expireSession()` ("sessiya bitdi" toast-u). Refresh şəbəkə/5xx ilə uğursuz olarsa
  orijinal xəta qaytarılır, çıxış yoxdur (FR-019).
- `refresh_stale` (R5) → bir dəfə təkrar cəhd (cookie artıq yenidir).
- **Single-flight**: tab daxilində paylaşılan Promise; tablar arası `navigator.locks`
  (`cbar-admin-refresh`) — mövcud deyilsə (jsdom) yalnız tab daxili.
- Bugünkü `scheduleExpiry` taymeri silinir (FR-019).
- Çıxış: `POST /auth/logout` (uğursuz olsa belə lokal çıxış), `BroadcastChannel('cbar-admin-auth')`
  ilə digər tablara `logout` mesajı — onlar toast-suz çıxır (FR-021).
- İstifadəçi bugünkü kimi JWT payload-undan çıxarılır; `/auth/me` əlavə olunmur.

**Səbəb**: auth bridge və interceptor arxitekturası (FSD: shared → app körpüsü) qorunur;
dəyişiklik `auth-bridge.ts`, `interceptors.ts`, `auth.service.ts`, `main.tsx`, `topbar`
logout çağırışı və MSW handler-ləri ilə məhdudlaşır.

## R13 — Uyğunluq və deploy sırası

**Qərar**: `api-cbar-admin` əvvəl deploy olunur. Kombinasiyalar:

| API | Panel | Nəticə |
| --- | --- | --- |
| yeni | köhnə `web-cbar-admin` | login cavabı eyni; `Set-Cookie` credential-sız cross-origin cavabda brauzer tərəfindən nəzərə alınmır; heç nə dəyişmir |
| yeni | köhnə `web-cbar-admin-new` build-i | bugünkü davranış (yaddaşda token) |
| köhnə | yeni `web-cbar-admin-new` | `refresh` → 404/405 → anonim; login işləyir, yenilənmədə yenidən login (bugünkü davranış) |
| yeni | yeni | tam funksiya |

## R14 — Verification məhdudiyyəti

Bu maşında .NET SDK yoxdur: API lokal build/run edilə bilmir. API dəyişikliyi CI
build-i (GitLab) və ya SDK olan maşında yoxlanılır; panel `npm run verify` + MSW
testləri ilə lokal, real axın isə test mühitində (`admin-temp.cbar.az` ↔
`api-cbar-admin-test.cbar.az`) yoxlanılır. Bax [quickstart.md](./quickstart.md).
