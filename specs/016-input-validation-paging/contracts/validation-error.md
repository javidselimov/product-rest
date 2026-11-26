# Contract: 400 validation cavabı (8b)

**Əhatə**: `api-cbar-admin`-in bütün yazma endpoint-ləri (`POST`/`PUT` gövdəli), `auth/login`
istisna (FR-016). 404, 409, 401, 403 və 500-ün forması **dəyişmir** — o, #7-dir.

> **#7-dən sonra (spec 018, 2026-10-06)**: controller 400-ləri artıq `problem+json` + `message`
> formasındadır, `Errors/CbarControllerBase.BadRequestProblem` ilə (hələ `errors` yoxdur).
> DB-nin rədd etdiyi uzunluq/locale/CHECK halları `Errors/DbErrorMapping` ilə 400 verir.
> 8b-də qalan: `ValidationProblemDetails`-ə `message` (`InvalidModelStateResponseFactory`) və
> biznes 400-lərinin `errors`-a köçürülməsi. OpenAPI `BusinessRule` artıq `anyOf` istifadə edir.
> Bu iki variant birlikdə uyğun gəlsin deyə edilib.

## Forma

`400 Bad Request`, `Content-Type: application/problem+json`:

```json
{
  "type": "https://tools.ietf.org/html/rfc9110#section-15.5.1",
  "title": "One or more validation errors occurred.",
  "status": 400,
  "message": "[az] The Title field is required.; Unknown or inactive locale 'ru'.; The field Dqn must be a string or array type with a maximum length of '100'. (+1 more)",
  "errors": {
    "Translations[az].Title": ["[az] The Title field is required."],
    "Translations[ru]": ["Unknown or inactive locale 'ru'."],
    "Dqn": ["The field Dqn must be a string or array type with a maximum length of '100'."],
    "Rates[2].Rate": ["Rate for USD must be greater than 0."]
  },
  "traceId": "00-…"
}
```

| Sahə | Məcburi | Məna |
|---|---|---|
| `type`, `title`, `status`, `traceId` | bəli | ASP.NET `ValidationProblemDetails` standartı — bu gün binding xətalarında da belədir |
| `errors` | bəli | **Bütün** xətalar (SC-004); açar → bir və ya bir neçə mesaj |
| `message` | bəli | İlk 3 mesaj `"; "` ilə, daha çoxu olsa `" (+N more)"` — panelin üst xətası (FR-014) |

Açar formaları: [data-model.md §2](../data-model.md). Mesajlar ingiliscədir (API-nin mövcud
mesajları kimi); tərcümə xətası `[locale]` prefiksi daşıyır.

## Bugünkü `{ message }` 400-ləri

Controller-lərdəki əl ilə yazılmış `BadRequest(new { message })` cavabları (data-model.md §3,
"Mövcud → A / VP") **eyni mesaj mətni** ilə bu formaya keçir:

```json
// bu gün
{ "message": "Media asset not found." }
// sonra
{ "type": "…", "title": "One or more validation errors occurred.", "status": 400,
  "message": "Media asset not found.",
  "errors": { "MediaId": ["Media asset not found."] }, "traceId": "…" }
```

`message` açarı qaldığı üçün `message`-i oxuyan istənilən müştəri eyni mətni görür. Panel
(`web-cbar-admin-new/src/shared/api/types.ts`) hər iki formanı artıq oxuyur; top-level sahə
açarlarını (`MediaId` → `mediaId`) formadakı sahənin altına qoyur.

## Davranış qaydaları

1. Validation xətası olan sorğuda **heç bir** yazı olmur: DB, audit, MinIO, refresh token
   (FR-006). Atribut/filter xətaları action-dan əvvəl dayanır; `VP` yoxlamaları mutasiyadan
   əvvəl gəlir (bugünkü sıra ilə).
2. Atribut və filter xətaları bir cavabda toplanır. Controller-dəki DB yoxlamaları (`VP`) yalnız
   atributlar keçəndən sonra işləyir — bu iki mərhələ bir cavabda birləşmir (bilərəkdən: DB
   yoxlaması etibarsız gövdə üzərində mənasızdır).
3. Bugün 400 verən heç bir hal 400-dən başqa koda keçmir; bugün 500 verən validation halları
   (uzunluq, locale FK, `rate <= 0` CHECK, numeric overflow) 400 olur.

## OpenAPI dəyişikliyi (spec-first, FR-017)

- `components/schemas/common.yaml#/ValidationProblemDetails`: `message` (required) əlavə
  olunur; `errors` təsviri açar formaları ilə yenilənir.
- `components/responses.yaml#/BusinessRule`: `application/json` `ErrorMessage` variantı
  silinir — yalnız `application/problem+json`. `ValidationFailed` ilə birləşdirilə bilər.
- Hər yazma DTO sxemində (`components/schemas/*.yaml`) `maxLength`, `minLength: 1` (R sahələr),
  `format: email`, `minimum`/`exclusiveMinimum`/`maximum` data-model.md §3-ə uyğun.
- `openapi.yaml` `info.x-known-issues`: "No input validation beyond binding…" bəndi silinir;
  "Error bodies are inconsistent" bəndi 400 üçün həll olunur, 404/409 hissəsi #7-yə qalır.
