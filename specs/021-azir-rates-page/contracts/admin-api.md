# Contract: `api-cbar-admin` — AZIR (JWT)

Spec-first: əvvəl `product-rest/api-cbar-admin/openapi/` (`paths/statistics.yaml`, `components/schemas/statistics.yaml`), sonra lint + bundle, sonra `AzirController`. Route-lar dəyişmir. Yalnız gövdə və cavab şəkli dəyişir, hook bunu bloklamır, ona görə əl ilə yoxlanılır.

## 1. `POST /api/v1/azir` — upsert

Request (`AzirUpsertDto`):

```json
{
  "valueDate": "2026-09-12",
  "term": "1D",
  "rate": 7.25,
  "dealVolume": 250.00,
  "dealCount": 18,
  "minRate": 6.90,
  "maxRate": 7.60,
  "isReservePlan": false
}
```

- `valueDate`, `term`, `rate` məcburidir. Qalanları ixtiyaridir (`null` və ya buraxılmış).
- Buraxılmış sahələr belə qəbul edilir: nullable → `null`, `isReservePlan` → `false`. Mövcud sətir yenilənəndə də belədir (tam əvəzetmə semantikası).

`200`: `{ id, valueDate, term, rate, dealVolume, dealCount, minRate, maxRate, isReservePlan }`

`400` (problem+json, spec 018), sahə xətaları ilə:

```json
{
  "type": "urn:cbar:problem:validation",
  "title": "Validation failed.",
  "status": 400,
  "message": "Deal volume must be zero or positive.",
  "errors": {
    "dealVolume": ["Deal volume must be zero or positive."],
    "minRate": ["Minimum rate must not exceed maximum rate."]
  }
}
```

- `message` birinci xətadır (panel onu oxuyur).
- `errors` açarları camelCase-dir və panelin `normalizeApiError` → `fieldErrors` axınına uyğundur.
- Mesaj mətnləri ingiliscədir. Panel sahə adına görə öz lokal mətnini göstərir (bax admin i18n).
- Tip uyğunsuzluğunu (məs. `dealCount: 1.5` JSON-da `int`-ə) `[ApiController]` model binding artıq `ValidationProblemDetails` 400 ilə rədd edir. Bu da `errors` daşıyır.
- DB CHECK backstop → 400 `value-rejected` (sahəsiz).

## 2. `GET /api/v1/azir` — siyahı

Query dəyişmir (`page`, `pageSize`, `from`, `to`, `term`). `items[]` sahələri `{ id, valueDate, term, rate, dealVolume, dealCount, minRate, maxRate, isReservePlan, updatedAt }` olur.

## 3. `DELETE /api/v1/azir/{id}` — dəyişmir

Audit `before` snapshot-una yeni sahələr əlavə olunur.

## 4. Audit

| Action | before | after |
|---|---|---|
| `azir.create` | — | tam DTO |
| `azir.update` | 8 sahənin hamısı (əl ilə yazılan anonim obyekt) | tam DTO |
| `azir.delete` | 8 sahənin hamısı | — |
