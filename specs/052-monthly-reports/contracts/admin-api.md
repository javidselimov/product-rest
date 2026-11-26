# Admin API contract: spec 052 (`api-cbar-admin`)

Spec-first: `product-rest/api-cbar-admin/openapi/`. Ora daxildir:
- `paths/monthly-reports.yaml`;
- `components/schemas/monthly-reports.yaml`;
- `openapi.yaml`-da tag `MonthlyReports`.

Sonra lint + bundle, təsdiq, controller. `route-diff.mjs` təmiz qalmalıdır.

Kök: `api/v1/monthly-reports`, JWT, sinif səviyyəsində `RequirePermission(MonthlyReports.Read)`. Xətalar `application/problem+json`
(`CbarControllerBase` köməkçiləri). Yazmalar `AuditService` ilə, `CreatedBy/UpdatedBy = CurrentUserId()`.

| Metod | Yol | İcazə | Cavab |
|---|---|---|---|
| GET | `/series` | `monthly_reports.read` | 200 `MonthlyReportSeriesItem[]` |
| GET | `/` | `monthly_reports.read` | 200 `MonthlyReportPage` |
| GET | `/{id}` | `monthly_reports.read` | 200 `MonthlyReportDetail`, 404 |
| POST | `/` | `monthly_reports.create` | 201 `MonthlyReportDetail`, 400, 409 |
| PUT | `/{id}` | `monthly_reports.update` | 200 `MonthlyReportDetail`, 400, 404, 409 |
| DELETE | `/{id}` | `monthly_reports.delete` | 204, 404 (soft delete) |

Audit hərəkətləri: `monthly_reports.create`, `monthly_reports.update`, `monthly_reports.delete`; entity `monthly_report`.

Route sırası: `GET /series` `GET /{id:int}`-dən ayrılır (`int` constraint).

## Sorğu parametrləri (`GET /`)

| Parametr | Qeyd |
|---|---|
| `page`, `pageSize` | defolt 1, 20 |
| `series` | seriya açarı (`bank-complaint-index` …), paneldə tab |
| `year` | il süzgəci |
| `status` | `draft` \| `published` \| `archived` |

Sıra: `year DESC`, `month DESC`, `series.sort_order`, `id`. Seriya süzüləndə ilk sətir ən yeni aydır: panelin "növbəti ay" prefill-i buna
güvənir (research R7).

## Sxemlər

```text
MonthlyReportSeriesItem { key, name (az), nameEn (null ola bilər), periodMonths }   // seriya hər yerdə açarla: id mühitlər arasında fərqli ola bilər

MonthlyReportListItem {
  id, series (açar), seriesName (az), periodMonths,
  year, month, status,
  locales: string[]        // faylı olan dillər, məs. ["az","en"]
  missingFile: boolean     // dillərdən birinin faylı media kitabxanasında silinib (R14)
  updatedAt
}
MonthlyReportPage { items: MonthlyReportListItem[], total, page, pageSize }

MonthlyReportFile   { mediaId, mediaName }          // mediaName = media_assets.original_name (forma sahəsinin adı üçün)
MonthlyReportUpsert {
  series (açar), year, month, status,
  translations: { [locale]: { mediaId } }             // ən azı bir dil; buraxılan dil silinir
}
MonthlyReportDetail {
  id, series (açar), year, month, status,
  translations: { [locale]: MonthlyReportFile },
  createdAt, updatedAt
}
```

## Validasiya və xətalar

Qaydalar [data-model.md](../data-model.md) → Validasiya bölməsindədir.

- Səhv body: 400 `BadRequestProblem`. Mətn azərbaycancadır, məsələn "Ay 1–12 arasında olmalıdır", "Ən azı bir dildə fayl seçin",
  "Fayl tapılmadı".
- Təkrar dövr: 409 `ConflictProblem("Bu seriyada {Ay} {İl} üçün hesabat artıq var.")`. Ay adı az-dır, C#-da 12 elementli sabit massivdən gəlir.
  Bu admin API-nin yeganə ay adı siyahısıdır.
