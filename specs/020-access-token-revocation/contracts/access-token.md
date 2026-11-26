# Contract: admin API giriş tokeninin ləğvi

Route dəyişmir. Dəyişən yalnız **qorunan endpoint-lərin 401 semantikasıdır**: imzası və
müddəti etibarlı olan token də rədd oluna bilər.

## 1. Token (`POST /auth/login`, `POST /auth/refresh` cavabı)

Cavab gövdəsi dəyişmir (`LoginResponse { accessToken, expiresAt }`). JWT payload-a `sst` claim-i
əlavə olunur. İstehlakçı onu oxumamalıdır, bu dəyər server üçündür.

## 2. Qorunan endpoint-lər — 401

Rədd şərtləri: [data-model.md §4](../data-model.md). Status və gövdə müddəti bitmiş tokenin
cavabı ilə **eynidir**. Başlıqda isə `error_description` olmur: `context.Fail(string)` adi
`Exception` yaradır və JwtBearer yalnız tanıdığı `SecurityToken*Exception` tipləri üçün təsvir
yazır (müddəti bitmiş tokendə `The token expired at …`). Panel başlığı oxumur, yalnız statusu
yoxlayır.

```http
HTTP/1.1 401 Unauthorized
WWW-Authenticate: Bearer error="invalid_token"
Content-Type: application/problem+json

{ "type": "...", "status": 401, "traceId": "..." }
```

- `title` və `message` yoxdur (spec 018, CLAUDE.md "401/403/5xx without a message").
- Səbəb cavabda **açıqlanmır** (deaktiv, silinmiş, versiya fərqi eyni görünür). Səbəb yalnız
  server logunda qalır.

## 3. İnvariantlar

1. Deaktivasiya, silmə, parol reset və ya rol dəyişikliyi uğurla yadda saxlanandan sonra köhnə
   tokenlə gələn ilk sorğu 401 alır.
2. Rədd olunan istifadəçi redaktəsi (400/409) heç bir tokeni etibarsız etmir.
3. Email dəyişikliyi və reaktivləşdirmə tokenləri etibarsız etmir.
4. Rol dəyişikliyindən sonra `POST /auth/refresh` uğurlu olur və yeni rolla token verir.
   Deaktivasiya, parol reset və silmədən sonra refresh `401 user_inactive | refresh_expired`
   qaytarır (spec 005, dəyişmir).
5. `auth/login`, `auth/refresh`, `auth/logout`, `/healthz` bu yoxlamadan asılı deyil.

## 4. OpenAPI diff (kod dəyişikliyindən ƏVVƏL, R7)

`product-rest/api-cbar-admin/openapi/components/responses.yaml`:

```diff
 Unauthorized:
   description: |
-    Missing, malformed or expired access token. `WWW-Authenticate: Bearer` (with
-    `error="invalid_token"` when a token was sent but rejected). The body has no `title`
-    and no `message`.
+    Missing, malformed, expired or revoked access token. A token is revoked once its
+    user is deactivated or deleted, or their password is reset or role changed (spec 020);
+    the panel refreshes and retries. `WWW-Authenticate: Bearer` (with
+    `error="invalid_token"` when a token was sent but rejected). The body has no `title`
+    and no `message`, and does not say why the token was rejected.
```

Sonra `openapi.yaml`-ın `# Sync:` sətri yenilənir, lint + bundle edilir (`openapi/README.md`).
`paths/auth.yaml`-da login və refresh cavab gövdəsi dəyişmir.
