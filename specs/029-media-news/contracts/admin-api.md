# Admin API kontraktı: `api-cbar-admin` press-relizlər (spec 029)

Spec-first: `product-rest/api-cbar-admin/openapi/paths/press-releases.yaml`,
`components/parameters.yaml` (yeni `PressReleaseType`), `components/schemas/…`, lint + bundle,
sonra controller. Route dəyişmir.

## 1. `GET /api/v1/press-releases` (siyahı)

| Parametr | Dəyişiklik | Qayda |
|---|---|---|
| `page`, `pageSize`, `search`, `status` | — | |
| `type` | **YENİ** | int16, istəyə bağlı; `1`\|`2`; verilməsə hamısı |

Cavab dəyişmir (`type` sahəsi artıq siyahı elementindədir; OpenAPI-də yoxdursa sənədləşdirilir).

## 2. `POST /api/v1/press-releases`, `PUT /api/v1/press-releases/{id}`

Gövdə: `{ type?, status, publishedAt, translations }` — `PressReleaseUpsertDto.Type` `short` →
**`short?`**.

| `type` gövdədə | POST | PUT |
|---|---|---|
| yoxdur / `null` | `1` (Xəbər) | **mövcud dəyər saxlanır** |
| `1` və ya `2` | yazılır | yazılır |
| başqa (`0`, `3`, …) | `400 problem+json` | `400 problem+json` |

400: `BadRequestProblem("Type must be 1 (news) or 2 (announcement).")` (`message` uzantısı ilə,
spec 018). Əvvəlki davranış: göndərilməyən `type` səssizcə `0` yazılırdı (gizli bug, spec
"Hazırkı vəziyyət").

Audit (`press_releases.create|update`) dəyişmir — `type` dəyişikliyi `before/after`-də görünür.

## 3. Admin panel (`web-cbar-admin-new`) istehlakı

| Yer | Dəyişiklik |
|---|---|
| `features/press-releases/model/schemas.ts` | row + detail: `type: z.number().int()` |
| `features/press-releases/model/module.ts` | `fields` + `type` select (`valueAsNumber`, `defaultValue '1'`), `columns` + `type` badge, `filters` + `type` select |
| `shared/testing/handlers/press-releases.ts` (MSW) | siyahı `type` filtrini tətbiq edir; POST/PUT-da `type` qaydası §2 cədvəli kimi |
| `locales/{az,en}/pressReleases.json` | `fields.type`, `columns.type`, `filters.type`, `types.1`, `types.2` |

## 4. Deploy sırası

`api-cbar-admin` → `web-cbar-admin-new` (Maddə IV.2). Aralıq vəziyyət təhlükəsizdir: köhnə panel
`type` göndərmir → API `null` görür → POST `1`, PUT mövcud növü saxlayır. Bug API deploy olunan
anda bağlanır, panel deploy-u yalnız seçimi və filtri əlavə edir.
