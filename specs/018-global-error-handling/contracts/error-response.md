# Contract: vahid xəta cavabı (`api-cbar-admin`)

**Əhatə**: `/api/v1/**`-un **bütün** 4xx/5xx cavabları — controller, çərçivə (binding, JWT,
rol, routing, gövdə limiti) və qlobal handler. İstisnalar: `304` (xəta deyil), `/healthz`
(health check formatı), `GET /openapi/v1.json`.

## Forma

`Content-Type: application/problem+json` (RFC 9457):

| Sahə | Nə vaxt | Məna |
|---|---|---|
| `type` | həmişə | ümumi hallarda ASP.NET defoltu (RFC 9110 bölmə linki); DB-xəritəli hallarda `urn:cbar:problem:*` (aşağıda) |
| `title` | həmişə, **istisna**: 401/403/5xx `message`-siz | statusun qısa adı (`"Bad Request"`, `"Conflict"`, `"Not Found"`) |
| `status` | həmişə | HTTP status |
| `detail` | `message` olan hər cavabda + 5xx | insan oxuyan izah; `message` ilə eyni mətn |
| `traceId` | həmişə | server logundakı `TraceId` (W3C formasının orta hissəsi) |
| `message` | bu gün `message` qaytaran hər cavab + DB-xəritəli cavablar | **keçid sahəsi** — panel bunu göstərir; mətn bugünkü ilə eyni |
| `code` | yalnız refresh 401 (`refresh_missing`, `refresh_stale`, `refresh_invalid`, `refresh_reused`, `refresh_expired`) və `origin_forbidden` (403) | panel `refresh_stale`-ə görə budaqlanır; yeni dəyər **əlavə olunmur** |
| `errors` | binding/validation 400; username/email toqquşması (409) | sahə → mesajlar; açar DTO property adı (`Username`) |
| `field`, `locale` | slug toqquşması (409) | `field: "slug"`; `locale` — yalnız birmənalı olduqda |
| `mimeType` | media preview 415 | bugünkü əlavə sahə |

Daxili detal **heç vaxt** yoxdur (bütün mühitlərdə): SQL, cədvəl/sütun/məhdudiyyət adı,
`PostgresException` mətni, stack trace.

## Nümunələr

**Biznes qaydası (bu gün `{ message }`)** — status və mətn eyni:

```json
// bu gün: 409 application/json
{ "message": "Page has children; delete or move them first." }
// sonra: 409 application/problem+json
{
  "type": "https://tools.ietf.org/html/rfc9110#section-15.5.10",
  "title": "Conflict",
  "status": 409,
  "detail": "Page has children; delete or move them first.",
  "message": "Page has children; delete or move them first.",
  "traceId": "00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01"
}
```

**Slug yarışı (bu gün 500)**:

```json
{
  "type": "urn:cbar:problem:unique-violation",
  "title": "Conflict",
  "status": 409,
  "detail": "Another item in this language already uses the same slug. Save again to get a new one.",
  "message": "Another item in this language already uses the same slug. Save again to get a new one.",
  "field": "slug",
  "locale": "az",
  "traceId": "00-…"
}
```

**Username yarışı (bu gün 500)**:

```json
{
  "type": "urn:cbar:problem:unique-violation",
  "title": "Conflict",
  "status": 409,
  "detail": "Username or email is already in use.",
  "message": "Username or email is already in use.",
  "errors": { "Username": ["Username or email is already in use."] },
  "traceId": "00-…"
}
```

**Token yoxdur (bu gün boş 401)** — `title` qəsdən yoxdur:

```json
{ "type": "https://tools.ietf.org/html/rfc9110#section-15.5.2", "status": 401, "traceId": "00-…" }
```

`WWW-Authenticate: Bearer …` başlığı bugünkü kimi qalır.

**Sessiya rəddi (bu gün `{ message, code }`)**:

```json
{ "type": "…", "title": "Unauthorized", "status": 401,
  "detail": "Session expired.", "message": "Session expired.", "code": "refresh_stale", "traceId": "00-…" }
```

**Gözlənilməz xəta (bu gün boş 500)**:

```json
{ "type": "https://tools.ietf.org/html/rfc9110#section-15.6.1", "status": 500,
  "detail": "An unexpected error occurred.", "traceId": "00-…" }
```

## DB xətası → cavab

| Hal | Status | `type` | `message` |
|---|---|---|---|
| `*_locale_slug_key` | 409 | `urn:cbar:problem:unique-violation` | "Another item in this language already uses the same slug. Save again to get a new one." |
| `users_username_key` | 409 | eyni | "Username or email is already in use." |
| `users_email_key` | 409 | eyni | `PUT`-da "Email is already in use.", qalanlarda "Username or email is already in use." |
| `media_assets_storage_key_key` (upload) | **200** — mövcud qeyd | — | — (bax R7) |
| digər unikal | 409 | eyni | "A record with the same unique value already exists." |
| `*_locale_fkey`, `POST`/`PUT`/`PATCH` | 400 | `urn:cbar:problem:reference-missing` | "Unknown locale." |
| digər FK, `POST`/`PUT`/`PATCH` | 400 | eyni | "A referenced item does not exist." |
| istənilən FK, `DELETE` | 409 | `urn:cbar:problem:reference-in-use` | "The item is still referenced by other content." |
| `22001` | 400 | `urn:cbar:problem:value-too-long` | "A value is longer than allowed." |
| `22003` | 400 | `urn:cbar:problem:value-out-of-range` | "A number is out of the allowed range." |
| `23502` | 400 | `urn:cbar:problem:value-required` | "A required value is missing." |
| `23514` | 400 | `urn:cbar:problem:value-rejected` | "A value is not allowed." |
| digər DB xətası | 500 | defolt | — (`detail`: "An unexpected error occurred.") |

## Dəyişməyənlər

- Status kodları və bugünkü bütün mesaj mətnləri (500 → 4xx halları istisna).
- Binding 400 `ValidationProblemDetails` — eyni `errors` açarları, `message` əlavə **olunmur**
  (spec 016 8b-nin işidir).
- Gövdəsiz `NotFound()` — artıq bu formadadır (`title: "Not Found"`).
- `WWW-Authenticate`, `Cache-Control: no-store` (media preview 404) və digər başlıqlar.
- Login cavablarının mətni, statusu və vaxt profili (spec 011/012).
- Uğurlu cavabların heç biri.

## OpenAPI dəyişikliyi (spec-first, FR-015)

`openapi/`-də, kod dəyişikliyindən **əvvəl**:

- `components/schemas/common.yaml`
  - `ProblemDetails`: `required: [type, status, traceId]` (`title` artıq məcburi deyil, izahı:
    401/403/5xx-də `message` yoxdursa buraxılır); `message`, `code`, `field`, `locale` əlavə
    olunur (`code`: bugünkü 6 dəyərin enum-u); `type`-ın
    təsvirində `urn:cbar:problem:*` siyahısı.
  - `ValidationProblemDetails` — dəyişmir (`allOf ProblemDetails` yeni sahələri miras alır).
  - `ErrorMessage` **silinir**.
- `components/schemas/auth.yaml#/OriginError` → `ProblemDetails` (`code: origin_forbidden`).
- `components/responses.yaml`
  - `BusinessRule`: yalnız `application/problem+json` (`ValidationProblemDetails` — `errors`
    binding-də var, biznes qaydasında yox); `application/json` variantı silinir.
  - `Conflict`: `application/problem+json` `ProblemDetails`; təsvirə "concurrent duplicate" əlavə.
  - `Unauthorized`, `Forbidden`: `application/problem+json` gövdəsi əlavə olunur (`title`-sız).
  - Yeni `ServerError` (500) və `PayloadTooLarge` (413, media upload).
- `paths/*.yaml`
  - inline `application/json` xəta gövdələri (login 401/429, refresh 401, media preview 415,
    media 404) → `application/problem+json`;
  - slug-lı yaratma/redaktə əməliyyatları (pages, press-releases, laws, money-marks,
    money-mark news) və users `POST`/`PUT` → `409: Conflict` (yoxdursa);
  - tərcüməli yazma əməliyyatları → `400` (yoxdursa).
- `openapi.yaml`
  - `info.description`: "Errors come in three shapes…" bəndi → bir forma + `message`/`code`
    keçid sahələri + 500 `ServerError` hər əməliyyatda mümkündür;
  - `x-known-issues`: "Error bodies are inconsistent" — **silinir**; "No input validation…" —
    "surface as 500 (there is no exception handler)" hissəsi "DB rəddi 400-dür; sahə səviyyəli
    validation #8b" ilə əvəzlənir; "Media upload deduplicates with `SingleOrDefault`…" — 500
    hissəsi silinir, yaddaşda buferləmə (#11) qalır.
- `npm run lint` + `npm run bundle` yaşıl; `dist/` yenidən qurulur. Route dəyişmir — spec-first
  hook keçir.
