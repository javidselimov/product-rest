# Contract — `api-cbar-admin` (spec 060)

Spec-first: `product-rest/api-cbar-admin/openapi/` (`paths/organization.yaml`, `components/schemas/organization.yaml`) controller-dən
**əvvəl** dəyişir, lint + bundle olunur (`/api-endpoint`). Yeni route `PUT /organization/chart/order`-dir. Hook
`.claude/hooks/spec-first.mjs` onu bundle-da tapmasa, controller redaktəsini bloklayır.

Bütün xətalar `application/problem+json`-dur (`BadRequestProblem`, spec 018). Hər yazma `AuditService`-ə düşür.

## `PUT /api/v1/organization/chart/order` (yeni)

İcazə: `Organization.Update`.

```json
{ "parentId": 31, "ids": [37, 38, 39] }
```

| Hal | Cavab |
|---|---|
| `ids` həmin valideynin bütün uşaqlarıdır, hər biri bir dəfə (`parentId: null` → köklər) | 204. `sort_order = i + 1`. Audit `org_chart_nodes.reorder`, entity id = `parentId ?? 0`, before/after id siyahıları |
| `parentId` var, amma kart tapılmır | 404 |
| `ids` əskik, artıq, təkrar və ya başqa valideynin uşağıdır | 400 (`ContentSupport.InvalidOrder`-in mətni) |

Sıra deaktiv uşaqları da əhatə edir: panel onları da göstərir.

## `POST /api/v1/organization/chart`, `PUT /api/v1/organization/chart/{id}` (dəyişir)

`OrgChartNodeUpsertDto`-ya yeni sahə əlavə olunur: `departmentsOpen: boolean | null`.

- `null` və ya göndərilməyib → saxlanmış dəyər qalır (yaradılışda `false`).
- `true`, amma `kind` 4 və ya 6 deyil → 400 "Only a block or a group can show its departments always open."
- `false` → sətir varsa yenilənir, yoxdursa yaradılmır. `true` → sətir yaradılır və ya yenilənir.

`sortOrder` əvvəlki kimi tələb olunur: panel onu özü hesablayır (data-model §Panel).

## `GET /api/v1/organization/chart`, `GET /{id}` (dəyişir)

Detail cavabına `departmentsOpen: boolean` əlavə olunur (sətir yoxdursa `false`).

`layout` və `connector` qalır, OpenAPI-də `deprecated: true` olur.

## `DELETE /api/v1/organization/chart/{id}` (dəyişir)

Kartla birlikdə `org_chart_node_details` sətri də silinir (eyni `SaveChangesAsync`). Cavablar dəyişmir.

## `PUT /api/v1/organization/chart/layout` (köhnəlmiş)

Route və davranış qalır. OpenAPI-də `deprecated: true` olur, təsvirə "spec 060-dan panel çağırmır" yazılır. Silinməsi ayrıca qərardır.

## Tests (`tests/Cbar.AdminApi.Tests`)

Saf funksiyalar `internal`-dır, testlə görünür:

- `OrgChartController.ValidateDepartmentsOpen(kind, value)`;
- sıra validasiyası `ContentSupport.InvalidOrder`. Bunun mövcud testi yoxdursa, əlavə olunur.

Bazası olan yollar PGlite ilə və ya stack-də endpoint çağırmaqla yoxlanır ([quickstart.md](../quickstart.md) §1).
