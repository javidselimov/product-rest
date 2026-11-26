# API contract: spec 045

Endpoint-lər spec-first-dir: əvvəl `product-rest/<api>/openapi/` (`paths/memorandums.yaml`, `components/schemas/memorandums.yaml`,
`openapi.yaml` tag `Memorandums` + path ref-ləri), `npm run lint` + `npm run bundle`, istifadəçi təsdiqi, sonra controller (`/api-endpoint`
skill, hook `spec-first.mjs`). `route-diff.mjs` hər iki API-də təmiz.

## Public — `api-cbar`

### `GET /api/v1/memorandums?locale=az|en`

Filtr: `Status == Published`, `DeletedAt == null`, `locale == "en" ? ShowEn : ShowAz`, həmin dildə tərcümə var.
Sıra: `SignedYear DESC`, `SortOrder`, `Id`. Səhifələmə və sıra parametri yoxdur (research R4). Xəta: `429` (rate limit).

```json
{
  "items": [
    { "id": 1, "organization": "Slovakiya Milli Bankı", "country": "Slovakiya", "year": 2026 }
  ]
}
```

Heç bir sahə `null` deyil.

## Admin — `api-cbar-admin`

Kök: `api/v1/memorandums`, JWT, sinif səviyyəsində `RequirePermission(Memorandums.Read)`. Bütün xətalar `application/problem+json`
(`CbarControllerBase` köməkçiləri). Yazmalar `AuditService` ilə, `CreatedBy/UpdatedBy = CurrentUserId()`.

| Metod | Yol | İcazə | Cavab |
|---|---|---|---|
| GET | `/` | `memorandums.read` | 200 `MemorandumPage` |
| GET | `/{id}` | `memorandums.read` | 200 `MemorandumDetail`, 404 |
| POST | `/` | `memorandums.create` | 201 `MemorandumDetail`, 400 |
| PUT | `/{id}` | `memorandums.update` | 200 `MemorandumDetail`, 400, 404 |
| DELETE | `/{id}` | `memorandums.delete` | 204, 404 (soft delete) |

Audit hərəkətləri: `memorandums.create`, `memorandums.update`, `memorandums.delete`; entity `memorandum`.

### Sorğu parametrləri (`GET /`)

`page`, `pageSize` (default 20), `search` (ILIKE təşkilat adı və ölkə üzrə, istənilən dil), `status`.
Sıra: `SignedYear DESC`, `SortOrder`, `Id` (saytla eyni, redaktor nə görürsə sayt onu göstərir).

### Sxemlər

```text
MemorandumListItem { id, status, sortOrder, showAz, showEn, organization (az, yoxdursa ilk), country (eyni dil), signedYear }
MemorandumPage     { items: MemorandumListItem[], total, page, pageSize }

MemorandumTranslation { organization, country }
MemorandumUpsert {
  signedYear, sortOrder, status, showAz, showEn,
  translations: { [locale]: MemorandumTranslation }   // buraxılan dil silinir
}
MemorandumDetail = MemorandumUpsert + { id, createdAt, updatedAt }
```

Validasiya qaydaları: `data-model.md` → Validasiya. Səhv body → 400 `application/problem+json` (`BadRequestProblem`).
