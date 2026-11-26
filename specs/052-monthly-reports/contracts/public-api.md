# Public API contract: spec 052 (`api-cbar`)

Spec-first: əvvəl `product-rest/api-cbar/openapi/`. Ora daxildir:
- `paths/monthly-reports.yaml`;
- `components/schemas/monthly-reports.yaml`;
- `openapi.yaml`-da tag `MonthlyReports` və path ref.

Sonra `npm run lint` + `npm run bundle`, istifadəçi təsdiqi, controller (`/api-endpoint` skill, hook `spec-first.mjs`). `route-diff.mjs` təmiz
qalmalıdır.

## `GET /api/v1/monthly-reports`

| Parametr | Tip | Defolt | Qeyd |
|---|---|---|---|
| `locale` | `az` \| `en` | `az` | başqa dəyər → `az` (digər public controller-lər kimi) |
| `series` | string | — | vergüllə ayrılmış seriya açarları. Yoxdursa bütün seriyalar, tanınmayan açar nəzərə alınmır |

**Filtr** (konstitusiya III.3, research R2):
- `MonthlyReport.Status == Published`, `DeletedAt == null`;
- həmin dildə `MonthlyReportTranslation` var;
- onun `Media.DeletedAt == null`.

**Sıra**: seriyalar `sort_order`, `id` üzrə; hesabatlar `year DESC`, `month DESC`. Həmin dildə görünən hesabatı olmayan seriya cavabda yoxdur.

**Cavab 200**:

```json
{
  "series": [
    {
      "key": "bank-complaint-index",
      "name": "Bank müştərilərinin bank xidmətlərindən istifadəsi üzrə şikayət indeksi",
      "periodMonths": 1,
      "reports": [
        {
          "id": 12,
          "year": 2026,
          "month": 5,
          "file": { "id": 1179, "url": "/media/1179", "mimeType": "application/pdf", "sizeBytes": 245760 }
        }
      ]
    }
  ]
}
```

- `name` həmin dilin adıdır. Seriyanın o dildə adı yoxdursa `az` adı gəlir.
- `file.url` nisbidir, `PagesController` asset-ləri kimi (`/media/{id}`). Sayt onu `mediaUrl()` ilə tamamlayır.
- Heç bir sahə `null` deyil.

**Xətalar**: `429` (rate limit). Səhv `locale` 400 vermir.

## Saytda istifadə (`web-cbar-new`)

- `features/monthly-reports/api/monthly-reports.api.ts` (`server-only`): `getMonthlyReports(locale, keys)`.
- `features/monthly-reports/model/schemas.ts`: Zod.
- Xəta → loader `[]` qəbul edir → spec 050 HTML yolu (FR-014).
- MSW: `shared/testing/handlers/monthly-reports.ts` + `fixtures/monthly-reports.ts`.
