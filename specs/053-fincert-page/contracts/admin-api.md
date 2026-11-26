# Admin API contract — `api-cbar-admin` (spec 053)

Spec-first: `api-cbar-admin/openapi/paths/fincert.yaml` əvvəl (lint + bundle + təsdiq, `/api-endpoint` skill), sonra `FincertSettingsController`,
`FincertDirectionsController`, `FincertMembershipsController`. Hamısı JWT, `CbarControllerBase`, xətalar `problem+json`
(`BadRequestProblem`/`NotFoundProblem`, Azərbaycanca `message`), hər yazma `AuditService`-ə. İcazələr `fincert.read|create|update|delete`.
Spec-first hook (`.claude/hooks/spec-first.mjs`) route-ları bundle-a qarşı yoxlayır.

## Ümumi məlumat — `/api/v1/fincert/settings`

| Metod | Yol | İş |
|---|---|---|
| GET | `/api/v1/fincert/settings` | `{ email, phone, portalUrl, updatedAt, translations: { az?: T, en?: T } }`, `T = { mission, portalTitle, portalDescription, rfcMediaId, rfcUrl, rfcFile: AssetRef \| null }`, `AssetRef = { mediaId, originalName, mimeType, sizeBytes }` (IFI loqosu kimi). Sətir yoxdursa bütün sahələr `null`, `translations: {}` (404 yox) |
| PUT | `/api/v1/fincert/settings` | body: `{ email, phone, portalUrl, translations: { az?: T', en?: T' } }`, `T' = { mission, portalTitle, portalDescription, rfcMediaId, rfcUrl }`. Upsert (`id = 1`); göndərilməyən dil silinmir, `null` sahə təmizlənir. Cavab: GET forması. Audit `fincert.settings_update` (`before`/`after`). İcazə `fincert.update` |

Validasiya: `data-model.md` "Validasiya". Səhv sahə üçün `errors` xəritəsi (`email`, `portalUrl`, `translations.az.rfcUrl` …) panel formunda sahənin
altında göstərilir (mövcud `problem+json` → RHF körpüsü).

## İstiqamətlər — `/api/v1/fincert/directions`

| Metod | Yol | İş |
|---|---|---|
| GET | `/api/v1/fincert/directions?page=&pageSize=&status=&search=` | paged (`listEnvelope: 'paged'`); sətir `{ id, number, sortOrder, status, title, locales, incompleteLocales, updatedAt }` — `title` az, yoxdursa en; `number` silinməmişlər arasında sıra (1-dən); `locales` tam dolu dillər. Sıra `sort_order`, `id` |
| GET | `/api/v1/fincert/directions/{id}` | detal + `translations: { az?: { title, body }, en?: … }` |
| POST | `/api/v1/fincert/directions` | `{ status, translations }` → 201 detal; `sortOrder` = max + 1. Audit `fincert.direction_create` |
| PUT | `/api/v1/fincert/directions/{id}` | eyni body. Audit `fincert.direction_update` |
| DELETE | `/api/v1/fincert/directions/{id}` | soft-delete. Audit `fincert.direction_delete` |
| PUT | `/api/v1/fincert/directions/order` | `{ ids: int[] }` — silinməmişlərin tam dəsti, yoxsa 400. Bir transaksiya, `sort_order = index`. Audit `fincert.direction_reorder` |

## Üzvlüklər — `/api/v1/fincert/memberships`

| Metod | Yol | İş |
|---|---|---|
| GET | `/api/v1/fincert/memberships?page=&pageSize=&status=&search=` | paged; sətir `{ id, sortOrder, status, name, badge, logo: AssetRef \| null, url, locales, updatedAt }`; panel önizləməni `mediaId`-dən qurur |
| GET | `/api/v1/fincert/memberships/{id}` | detal + `logoMediaId`, `logo: AssetRef \| null`, `url`, `translations: { az?: { name, description, badge }, en?: … }` |
| POST / PUT / DELETE | `/api/v1/fincert/memberships[/{id}]` | `{ status, logoMediaId, url, translations }`; soft-delete. Audit `fincert.membership_*` |
| PUT | `/api/v1/fincert/memberships/order` | `{ ids: int[] }` |

## Admin panelin istehlakı (web-cbar-admin-new)

`features/fincert/api/fincert.service.ts` + `fincert.keys.ts`; hər cavab Zod ilə (`features/fincert/model/schemas.ts`), uyğunsuzluq
`AppError{code:'CONTRACT'}`. MSW `shared/testing/handlers/fincert.ts` bu formanı kodlayır.
