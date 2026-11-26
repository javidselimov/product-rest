# Contract: `api-cbar` — AZIR (public, read-only)

Spec-first: əvvəl `product-rest/api-cbar/openapi/` yenilənir (`paths/statistics.yaml`, `components/schemas/statistics.yaml`, `openapi.yaml`-da path qeydi), sonra `npm run lint && npm run bundle` işlədilir. `dist/openapi.json` hook-un (`.claude/hooks/spec-first.mjs`) mənbəyidir. Yalnız bundan sonra `StatsController` dəyişir. Hər operation-da `operationId`, `summary`, tag və `429` olmalıdır (`openapi/README.md`).

## 1. `GET /api/v1/azir` — additiv genişlənmə (geriyə uyğun)

Query (dəyişmir): `from?: date`, `to?: date` (daxil olmaqla), `term?: string` (dəqiq uyğunluq). Sıra dəyişmir: `valueDate` artan, sonra `term`.

`200`: `AzirValue[]`

```yaml
AzirValue:
  type: object
  required: [valueDate, term, rate, isReservePlan]   # isReservePlan həmişə var
  properties:
    valueDate:     { type: string, format: date }
    term:          { type: string, examples: ['1D', '30D'] }
    rate:          { type: number }
    dealVolume:    { type: [number, 'null'], description: 'mln AZN' }   # yeni
    dealCount:     { type: [integer, 'null'] }                          # yeni
    minRate:       { type: [number, 'null'], description: 'son əməliyyat günü min' }  # yeni
    maxRate:       { type: [number, 'null'] }                           # yeni
    isReservePlan: { type: boolean }                                    # yeni
```

Yeni sahələr `required`-ə yalnız `isReservePlan` kimi əlavə olunur. Köhnə istehlakçı (`azirValueSchema`, passthrough) qırılmır.

## 2. `GET /api/v1/azir/summary` — yeni

Parametr yoxdur. Filtrdən asılı deyil (spec US3-ün 6-cı ssenarisi). Qaydalar [data-model.md §4](../data-model.md#4-törəmə-saxlanmır-1d-statistika-xülasəsi-fr-015)-dədir.

`200`: `AzirSummary`. Bütün sahələr nullable-dır, obyekt həmişə qaytarılır (boş bazada hamısı `null` olur, 404 yox).

```yaml
AzirSummary:
  type: object
  required: [lastDate, lastRate, rateChangeSinceMonthEnd, rateChangeSinceYearEnd,
             lastMinRate, lastMaxRate, lastVolume, volumeChangeSinceMonthEnd,
             volumeMinSincePrevYearStart, volumeMaxSincePrevYearStart, lastVolumeUsd]
  properties:
    lastDate:                    { type: [string, 'null'], format: date }
    lastRate:                    { type: [number, 'null'] }
    rateChangeSinceMonthEnd:     { type: [number, 'null'] }
    rateChangeSinceYearEnd:      { type: [number, 'null'] }
    lastMinRate:                 { type: [number, 'null'] }
    lastMaxRate:                 { type: [number, 'null'] }
    lastVolume:                  { type: [number, 'null'], description: 'mln AZN' }
    volumeChangeSinceMonthEnd:   { type: [number, 'null'] }
    volumeMinSincePrevYearStart: { type: [number, 'null'] }
    volumeMaxSincePrevYearStart: { type: [number, 'null'] }
    lastVolumeUsd:               { type: [number, 'null'], description: 'mln USD, 2 onluq' }
```

Nümunə (quickstart §4-dəki istinad dəsti üzrə):

```json
{
  "lastDate": "2026-09-12", "lastRate": 7.25,
  "rateChangeSinceMonthEnd": 0.25, "rateChangeSinceYearEnd": 0.75,
  "lastMinRate": 6.9, "lastMaxRate": 7.6,
  "lastVolume": 250.0, "volumeChangeSinceMonthEnd": 30.0,
  "volumeMinSincePrevYearStart": 80.0, "volumeMaxSincePrevYearStart": 420.0,
  "lastVolumeUsd": 147.06
}
```

Xətalar: `429` (rate limit), `500` (problem+json). `contract-check.mjs`-ə `check('/api/v1/azir/summary', …)` əlavə olunur.

## 3. Route sırası

`[HttpGet("api/v1/azir/summary")]` literal seqmentdir və `api/v1/azir` ilə toqquşmur. Eyni `StatsController`-də yerləşir.
