# Contract: `POST /api/v1/currency-rates/import` (api-cbar-admin)

Spec-first: bu kontrakt əvvəl `product-rest/api-cbar-admin/openapi/paths/statistics.yaml`-a
(`rateImport` açarı, `openapi.yaml`-da `/api/v1/currency-rates/import`) yazılır, lint + bundle
olunur, təsdiqlənir, sonra controller (`/api-endpoint` skill, `spec-first.mjs` hook).

- **Tag**: `Statistics` · **operationId**: `importCurrencyRateSheet`
- **x-permission**: `currency_rates.prepare`
- **Auth**: Bearer JWT (digər `/api/v1` endpoint-ləri kimi)

## Request

`Content-Type: multipart/form-data`, ümumi ölçü ≤ 5 MB (`5_242_880` bayt).

| Sahə | Tip | Məcburi | Qeyd |
|---|---|---|---|
| `date` | string, `format: date` (`yyyy-MM-dd`) | bəli | vərəqin tarixi; fayldakı `C2` oxunmur |
| `file` | binary | bəli | `.xlsx`; ilk baytlar `PK\3\4` |
| `overwrite` | boolean | xeyr (default `false`) | `true` → mövcud vərəqin üstünə merge |

## Responses

### `200 OK` — `application/json`

```json
{
  "date": "2026-10-13",
  "imported": 42,
  "skipped": [],
  "rates": [
    { "currencyCode": "USD", "rate": 1.7 },
    { "currencyCode": "SDR", "rate": 2.3005 },
    { "currencyCode": "XAU", "rate": 7133.251 }
  ]
}
```

`rates` fayldakı sıra ilə, `XDR` artıq `SDR` kimi. `skipped` master-də olmayan kodlardır
(fayldakı sırası ilə, təkrarsız).

### Xətalar — `application/problem+json`

Hamısı `CbarControllerBase.ErrorProblem(status, message, code, extensions)` ilə: `title`,
`detail`, `message` (ingiliscə), `code` (panel lokallaşdırır).

| Status | `code` | Nə vaxt | Əlavə extension |
|---|---|---|---|
| 400 | `date_required` | `date` yoxdur və ya `yyyy-MM-dd` deyil | — |
| 400 | `file_required` | `file` yoxdur və ya 0 bayt | — |
| 400 | `not_xlsx` | uzantı `.xlsx` deyil, imza `PK\3\4` deyil, zip/xml oxunmur, vərəq tapılmır | — |
| 400 | `file_too_large` | açılmış entry hədd(ləri) aşır (zip bomb qoruması) | — |
| 400 | `no_rates` | `B7:G100`-də master-də olan heç bir kod yoxdur | `skipped` |
| 400 | `invalid_rate` | tanınan kodun `G` dəyəri boş / rəqəm deyil / `≤ 0` | `row` (int), `currency` (string) |
| 400 | `duplicate_code` | eyni kod (XDR→SDR-dən sonra) ikinci dəfə | `row`, `currency` |
| 409 | `sheet_exists` | `date` üçün məzənnə var, `overwrite != true` | `count` (mövcud kod sayı) |
| 413 | — | request 5 MB-dan böyük (Kestrel `RequestSizeLimit`) | — |
| 401 / 403 | — | standart (`components/responses.yaml`) | — |

Bir xəta varsa **heç nə yazılmır** (validasiya yazıdan əvvəl, yazı tək tranzaksiyada).

## Yazı semantikası

`PUT /currency-rates` ilə eyni merge: fayldakı hər kod üçün `(date, code)` sətri yaradılır və ya
`rate` yenilənir; həmin tarixin faylda olmayan kodlarına toxunulmur. `created_by` = JWT `sub`.

## Audit

`action = "currency_rates.import"`, `entity_type = "currency_rate_sheet"`,
`entity_id = yyyyMMdd`, `before = { rates: [mövcud dəyərlər] }`,
`after = { fileName, rates }`.

## Admin panel (web-cbar-admin-new) istehlakı

- `currencyService.importSheet({ date, file, overwrite })` → `FormData`, cavab Zod
  `rateImportResultSchema` ilə parse; uyğunsuzluq → `AppError{code:'CONTRACT'}`.
- `409` + `code: sheet_exists` → təsdiq dialoqu → eyni sorğu `overwrite: true`.
- MSW handler `shared/testing/handlers/currency.ts`-də bu kontraktı kodlaşdırır
  (200, 409, 400 `invalid_rate` halları).
