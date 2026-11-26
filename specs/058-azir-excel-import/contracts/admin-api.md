# Contract: `POST /api/v1/azir/import` (api-cbar-admin)

Spec-first (CLAUDE.md "Endpoint changes are spec-first"): əvvəl `product-rest/api-cbar-admin/openapi/` yenilənir, `npm run lint` + `npm run
bundle`, istifadəçi təsdiqi, sonra controller. `.claude/hooks/spec-first.mjs` `dist/openapi.json`-da olmayan route-u controller-ə yazmağa icazə
vermir. `api-cbar` dəyişmir.

## 1. OpenAPI dəyişiklikləri

| Fayl | Dəyişiklik |
|---|---|
| `openapi.yaml` | `paths`: `/api/v1/azir/import: $ref: paths/statistics.yaml#/azirImport` (`/api/v1/azir`-dan sonra); başdakı `# Sync:` sətrinə `azir import (spec 058)` |
| `paths/statistics.yaml` | yeni `azirImport` əməliyyatı (aşağıda) |
| `components/schemas/statistics.yaml` | `AzirImportForm`, `AzirImportResult`, `AzirImportValue`, `AzirImportSkipped`, `AzirImportProblem`; `AzirValue.term` təsviri: `1D`, `30D`, `90D`, `180D` |

```yaml
azirImport:
  post:
    tags: [Statistics]
    operationId: importAzir
    x-permission: azir.create
    summary: Import one day of AZIR values from the bank's daily workbook (.xlsx)
    description: |
      Reads the active sheet. The date is cell `B2` (an Excel date, or `dd.MM.yyyy` text). The table starts after the
      first row whose `B` is `Ad` and `C` is `Faiz`; `B` names the index, `C` its rate, `D` and `E` the 1D deal volume and
      count. Names are matched trimmed and case-insensitively, `*` marks the reserve plan:
      `AZIR` / `1D AZIR` → 1D, `TF AZIR 30D|90D|180D` → that tenor, `LAST MIN RATE` / `LAST MAX RATE` → the 1D
      minimum / maximum rate. `AZIR TFAI` is recognised and not stored. Rows starting with `*` and blank rows are ignored;
      any other name rejects the file.

      Rates are fractions in the file and are stored × 100, rounded to 4 decimals half away from zero. A blank, `-` or
      zero 30D/90D/180D rate leaves that tenor out (`skipped`). A zero minimum or maximum is stored as null. The 1D deal
      volume is stored in millions of manat: up to 10 000 as is, from 1 000 000 divided by 1 000 000
      (`volumeConverted`), anything between is rejected (`ambiguous_volume`).

      Written like `POST /azir` for each tenor in the file — a merge: other tenors of the date are left untouched. A date
      that already has any of the file's tenors needs `overwrite=true`. Every check runs before anything is written, and
      the write is one transaction: a failed import changes nothing.
    requestBody:
      required: true
      content:
        multipart/form-data:
          schema:
            $ref: ../components/schemas/statistics.yaml#/AzirImportForm
    responses:
      '200':
        description: The values written.
        content:
          application/json:
            schema:
              $ref: ../components/schemas/statistics.yaml#/AzirImportResult
      '400':
        description: |
          The request or the file was rejected (`code`: `file_required`, `not_xlsx`, `file_too_large`, `date_missing`,
          `date_in_future`, `header_missing`, `unknown_index`, `duplicate_index`, `missing_1d`, `invalid_value`,
          `ambiguous_volume`).
        content:
          application/problem+json:
            schema:
              $ref: ../components/schemas/statistics.yaml#/AzirImportProblem
      '401':
        $ref: ../components/responses.yaml#/Unauthorized
      '403':
        $ref: ../components/responses.yaml#/Forbidden
      '409':
        description: |
          The date already has some of the file's tenors and `overwrite` is not `true` (`code` is `date_exists`, with
          `valueDate`, `count` and `terms`).
        content:
          application/problem+json:
            schema:
              $ref: ../components/schemas/statistics.yaml#/AzirImportProblem
      '413':
        $ref: ../components/responses.yaml#/PayloadTooLarge
```

## 2. Sxemlər

```yaml
AzirImportForm:
  type: object
  required: [file]
  properties:
    file:
      type: string
      contentMediaType: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
      description: |
        `.xlsx` only (content must start with `PK\3\4`), at most 5 MB (5 242 880 bytes). Only the active sheet is read.
        The file is not stored.
    overwrite:
      type: boolean
      default: false
      description: Must be `true` when the date already has any of the file's tenors; those tenors are then replaced.

AzirImportResult:
  type: object
  required: [valueDate, values, skipped, volumeConverted]
  properties:
    valueDate:
      $ref: ./common.yaml#/Date
    values:
      type: array
      description: The tenors written, in file order (1D first when the file lists it first).
      items:
        $ref: '#/AzirImportValue'
    skipped:
      type: array
      items:
        $ref: '#/AzirImportSkipped'
    volumeConverted:
      type: boolean
      description: The 1D deal volume was given in manat and divided by 1 000 000.

AzirImportValue:   # implemented as allOf AzirImportFields + { term, previous: null | AzirImportFields }
  type: object
  required: [term, rate, dealVolume, dealCount, minRate, maxRate, isReservePlan, previous]
  properties:
    term: { type: string }
    rate: { type: number }
    dealVolume: { type: [number, 'null'], description: Millions of manat. }
    dealCount: { type: [integer, 'null'], format: int32 }
    minRate: { type: [number, 'null'] }
    maxRate: { type: [number, 'null'] }
    isReservePlan: { type: boolean }
    previous:
      description: The stored value this import replaced, or null when the tenor was new for the date.
      oneOf:
        - type: 'null'
        - type: object
          required: [rate, dealVolume, dealCount, minRate, maxRate, isReservePlan]
          properties:
            rate: { type: number }
            dealVolume: { type: [number, 'null'] }
            dealCount: { type: [integer, 'null'], format: int32 }
            minRate: { type: [number, 'null'] }
            maxRate: { type: [number, 'null'] }
            isReservePlan: { type: boolean }

AzirImportSkipped:
  type: object
  required: [row, name, reason]
  properties:
    row: { type: integer, format: int32, description: Spreadsheet row number (1-based). }
    name: { type: string, description: The name as written in the file, trimmed. }
    reason:
      type: string
      enum: [tfai, empty]
      description: '`tfai` — the TFAI index is not stored; `empty` — the tenor has no rate in the file.'

AzirImportProblem:
  description: |
    A rejected import. `code` names the reason; `row` and `column` locate a bad cell; `valueDate` is the file's date
    (`date_in_future`, `date_exists`); `count` and `terms` describe the stored tenors (`date_exists`). Nothing is written
    when an import fails.
  allOf:
    - $ref: ./common.yaml#/ErrorMessage
    - type: object
      required: [code]
      properties:
        code:
          type: string
          enum: [file_required, not_xlsx, file_too_large, date_missing, date_in_future, header_missing, unknown_index,
            duplicate_index, missing_1d, invalid_value, ambiguous_volume, date_exists]
        row: { type: integer, format: int32 }
        column: { type: string, description: Spreadsheet column letter (`B`–`E`). }
        valueDate: { $ref: ./common.yaml#/Date }
        count: { type: integer, format: int32 }
        terms: { type: array, items: { type: string } }
```

## 3. Nümunələr

`tools/AZIR Website 2026-10-27.xlsx`, boş tarix → `200`:

```json
{
  "valueDate": "2026-10-27",
  "values": [
    { "term": "1D", "rate": 6.3048, "dealVolume": 0, "dealCount": 0, "minRate": null, "maxRate": null, "isReservePlan": true, "previous": null },
    { "term": "30D", "rate": 5.9748, "dealVolume": null, "dealCount": null, "minRate": null, "maxRate": null, "isReservePlan": false, "previous": null },
    { "term": "90D", "rate": 6.1316, "dealVolume": null, "dealCount": null, "minRate": null, "maxRate": null, "isReservePlan": false, "previous": null },
    { "term": "180D", "rate": 6.3484, "dealVolume": null, "dealCount": null, "minRate": null, "maxRate": null, "isReservePlan": false, "previous": null }
  ],
  "skipped": [{ "row": 10, "name": "AZIR TFAI", "reason": "tfai" }],
  "volumeConverted": false
}
```

Eyni fayl ikinci dəfə, `overwrite` olmadan → `409`:

```json
{ "type": "about:blank", "title": "…", "status": 409, "code": "date_exists", "message": "AZIR values for 2026-10-27 already exist; send overwrite=true to replace them.",
  "valueDate": "2026-10-27", "count": 4, "terms": ["1D", "30D", "90D", "180D"] }
```

Tanınmayan ad → `400 { "code": "unknown_index", "row": 8, "column": "B", "message": "Cell B8: unknown index \"TF AZIR 60D\"." }`.
