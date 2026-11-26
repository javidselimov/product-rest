# Contract — `api-cbar` (spec 060)

Spec-first: `product-rest/api-cbar/openapi/` əvvəl dəyişir. Yeni route yoxdur, yalnız cavab sahəsi əlavə olunur.

## `GET /api/v1/organization/chart?locale=` (dəyişir)

Hər node-a yeni sahə əlavə olunur:

| Sahə | Tip | Qayda |
|---|---|---|
| `departmentsOpen` | `boolean` | növ 4/6 üçün `org_chart_node_details.departments_open`, sətir yoxdursa `false`. Qalan növlərdə həmişə `false` |

- Filtrlər, sıra və budaq atma dəyişmir (spec 027).
- `layout` və `connector` qalır, OpenAPI-də `deprecated: true` olur. Sayt onları oxumur.
- Sorğu `cbar_web_ro` ilə yeni cədvəli oxuyur. Ona görə `api-cbar-admin` (migration `0045`, GRANT) əvvəl deploy olunur. Cədvəl
  yoxdursa, sorğu yıxılır (spec 057 ilə eyni deploy qaydası).

```json
{ "id": 37, "parentId": 31, "kind": 4, "curatorDirect": false, "name": "Təşkilati inkişaf bloku", "role": null,
  "link": null, "departmentsOpen": true, "layout": null, "connector": null }
```

## Sayt tərəfi (web-cbar-new)

`features/organization/model/schemas.ts`, `orgChartNodeSchema`:

- `departmentsOpen: z.boolean().default(false)` əlavə olunur. Köhnə API ilə hamısı "açılan siyahı" olur (FR-016).
- `layout` və `connector` sxemdən çıxır, Zod onları atır.
- MSW handler və `shared/testing/fixtures/organization.ts` yeni sahəni daşıyır. Fikstür Figma ağacını əks etdirir (40 kart, düzəldilmiş
  valideynlərlə, data-model §FR-017).
