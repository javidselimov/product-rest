# api-cbar-admin OpenAPI kontraktı

`api-cbar-admin`-in (CMS API) əl ilə saxlanılan OpenAPI 3.1 spec-i. Qardaşı:
`../../api-cbar/openapi/` (public API) — eyni alətlər, eyni yanaşma.

## Niyə əl ilə?

Runtime `/openapi/v1.json`-da **request** sxemləri var (DTO-lar `record`-dur), amma
**cavab** sxemi yoxdur — controller-lər anonim tip qaytarır. Üstəlik generator hər
constructor parametrini `required` sayır (nullable olanları da), yəni onun request
sxemləri də olduğu kimi götürülə bilməz. Bu spec hər ikisini koddan yazır; runtime
sənəd yalnız əməliyyat siyahısının mənbəyidir (`npm run drift`).

Runtime `/openapi/v1.json` yalnız `Development` və `Staging`-də (lokal, dev, test) verilir,
prod-da 404-dür. Ona görə `npm run drift` yalnız test-ə (default) və ya lokala
(`API_URL=http://localhost:5253`) qarşı işləyir.

Spec **mövcud davranışı** təsvir edir. Səhvlər `openapi.yaml`-da `info.x-known-issues`
altında qeyd olunur, spec-də "düzəldilmir".

## Əmrlər

```bash
npm ci
npm run lint        # Redocly
npm run bundle      # dist/openapi.{yaml,json}
npm run drift       # spec ↔ test API /openapi/v1.json əməliyyat siyahısı
npm run contract    # test API-yə sorğular; login olmadan yalnız auth/401 yolları
```

`API_URL` (default `https://api-cbar-admin-test.cbar.az`). Korporativ şəbəkədə:
`NPM_CONFIG_USERCONFIG=~/.npmrc`.

Tam contract yoxlaması (GET cavablarının sxemi) üçün test istifadəçisi lazımdır:
`ADMIN_USER=… ADMIN_PASSWORD=… npm run contract`. Yazma əməliyyatları heç vaxt yoxlanılmır.

## Konvensiyalar

**Fayllar.** `openapi.yaml` hər path-i `paths/<fayl>.yaml#/<açar>`-a bağlayır — fayl və
açar adları oradan götürülür. Sxemlər `components/schemas/<domen>.yaml`-da, adları
domen prefiksi ilə (`PressReleaseDetail`, `LawCategoryUpsert`) — bundle-da hamısı bir
namespace-ə düşür, toqquşmamalıdır.

**Path item.** Path parametri (`id`) path item səviyyəsində, `parameters.yaml#/Id`.
Hər əməliyyatda: `tags` (openapi.yaml-dakı 14 tag-dan), `operationId` (camelCase:
`list*`, `get*`, `create*`, `update*`, `delete*`, xüsusi hərəkətlər üçün fel — `movePage`,
`attachLawAsset`), `summary`, lazım olanda `description`.

**Cavablar** (`components/responses.yaml`):

| Kodda | Spec-də |
|---|---|
| `Ok(x)` | `200` + sxem |
| `CreatedAtAction(...)` | `201` + `Location` header + sxem |
| `NoContent()` | `204` → `NoContent` |
| `NotFound()` (bare) | `404` → `NotFound` (ProblemDetails) |
| `NotFound(new { message })` | `404` inline, `application/json` → `common.yaml#/ErrorMessage` |
| `BadRequest(new { message })` | `400` → `BusinessRule` (problem+json **və** json) |
| yalnız binding (body/query tipli, BadRequest yoxdur) | `400` → `ValidationFailed` |
| `Conflict(new { message })` | `409` → `Conflict` |
| `[Authorize]` | hər əməliyyatda `401` → `Unauthorized` |
| `[Authorize(Roles=…)]` | + `403` → `Forbidden` |

Body və ya tipli query parametri olan hər əməliyyatda 400 var. Route constraint
(`{id:int}`) uyğun gəlməyəndə route tapılmır → 404 boş body; bunu ayrıca sənədləşdirmirik.

**Cavab sxemləri — proyeksiyadan.** Anonim obyektdəki hər sahə `required`-dır (JSON-da
null olsa da açar var). Tip entity-dən (`Cbar.Domain/Entities`):
`int` → `integer/int32`, `long` → `int64`, `short` → `int16`, `decimal` → `number`,
`DateTimeOffset` → `date-time`, `DateOnly` → `date`, `T?` → `[T, 'null']`.
`Status = x.Status.ToString().ToLowerInvariant()` → `common.yaml#/ContentStatus`.
`a.Media?.X` → nullable. `.FirstOrDefault()` → nullable.
`Translations.ToDictionary(t => t.Locale, …)` → `type: object`, `propertyNames: Locale`,
`additionalProperties: <XTranslation>`.
Sahə kodda yoxdursa spec-də də yoxdur; kodda olan hər sahə spec-də var.

**Request sxemləri — DTO record-dan.** `required` = nullable olmayan bütün sahələr
(`int`, `bool` daxil: göndərilməsə server səssizcə `0`/`false` götürür — klient üçün
bu demək olar ki, heç vaxt niyyət deyil). Nullable (`T?`) sahələr required deyil.
Adlar camelCase. `Dictionary<string, XTranslationDto>` → Translations map (yuxarıdakı kimi).
Enum-lar lowercase string.

**Təsvirlər** qısa, yalnız klient üçün qeyri-aşkar olanı deyir: soft vs hard delete,
slug generasiyası, silinmə şərtləri (409), sıralama, update-də yox olan locale-in
silinməsi, cavabda boş gələn kolleksiyalar (məs. update-dən sonra `assets`).

## Endpoint dəyişəndə

1. Controller-i dəyiş. 2. Path + sxem fayllarını yenilə. 3. `npm run lint`.
4. Test-ə deploy-dan sonra `npm run drift` (və imkan varsa `contract`).
