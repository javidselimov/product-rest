# Admin API kontraktı (api-cbar-admin)

Spec-first: əvvəl `openapi/paths/release-schedule.yaml` + `components/schemas/release-schedule.yaml` + `openapi.yaml` (tag `ReleaseSchedule`: "Information disclosure schedule: items, groups and periodicities."), `npm run lint` + `bundle`, sonra controller-lər (`.claude/skills/api-endpoint`). Hamısı JWT; icazə `x-permission`. Xətalar `application/problem+json` (`BadRequestProblem` / `ConflictProblem` / `NotFoundProblem`). Enum-lar camelCase string.

## Sətirlər — `ReleaseScheduleItemsController`, `[Route("api/v1/release-schedule/items")]`

| Metod | Yol | İcazə | Cavab |
|---|---|---|---|
| GET | `/api/v1/release-schedule/items` | `release_schedule.read` | 200 `ReleaseScheduleItemPage`; 400 `ValidationFailed` |
| POST | `/api/v1/release-schedule/items` | `release_schedule.create` | 201 + `Location`, `ReleaseScheduleItemDetail`; 400 `BusinessRule` |
| GET | `/api/v1/release-schedule/items/{id}` | `release_schedule.read` | 200 detail; 404 |
| PUT | `/api/v1/release-schedule/items/{id}` | `release_schedule.update` | 200 detail; 400; 404 |
| DELETE | `/api/v1/release-schedule/items/{id}` | `release_schedule.delete` | 204 (soft delete); 404 |

List parametrləri: `page`, `pageSize` (default 20, max 100, `PagingQuery`), `search` (hər dilin `title`-ında `ILike`), `status`, `groupId`, `periodicityId`. Sıra: qrupun `sortOrder` → `sortOrder` → `id`.

```jsonc
// ReleaseScheduleItemPage
{ "items": [ { "id": 2, "title": "Pul siyasəti ilə bağlı qəbul olunan qərarlar",   // az, yoxdursa istənilən dil
               "group": "Pul və məzənnə siyasəti üzrə", "periodicity": "Qərar müvafiq qaydada təsdiq edildikdə",
               "timingMode": "decisions", "sortOrder": 20, "status": "published", "showAz": true, "showEn": true } ],
  "total": 22, "page": 1, "pageSize": 20 }

// ReleaseScheduleItemUpsert (POST/PUT body) = ReleaseScheduleItemDetail - id
{ "groupId": 1, "periodicityId": 6, "timingMode": "decisions", "timingUrl": null,
  "sortOrder": 20, "status": "published", "showAz": true, "showEn": true,
  "translations": { "az": { "title": "…", "timing": "Qrafikə uyğun" },
                    "en": { "title": "…", "timing": null } } }
```

`timingMode`: `"text" | "link" | "decisions"`. Validasiya mesajları (400 `BusinessRule`, ingiliscə): "At least one language is required.", "A title is required.", "The group does not exist.", "The periodicity does not exist.", "A link is required for the link mode.", "The link must start with http://, https:// or /.", "An item cannot be scheduled."

Audit: `release_schedule.item.create|update|delete`, entity `release_schedule_item`. Create bir tranzaksiyada (`CsrProjectsController.Create` kimi).

## Qruplar — `ReleaseScheduleGroupsController`, `[Route("api/v1/release-schedule/groups")]`

| Metod | Yol | İcazə | Cavab |
|---|---|---|---|
| GET | `/api/v1/release-schedule/groups` | read | 200 `{ items: ReleaseScheduleGroup[] }` (səhifəsiz, `sortOrder` → `id`) |
| POST | `/api/v1/release-schedule/groups` | create | 201 + `Location`; 400 |
| GET | `/api/v1/release-schedule/groups/{id}` | read | 200; 404 |
| PUT | `/api/v1/release-schedule/groups/{id}` | update | 200; 400; 404 |
| DELETE | `/api/v1/release-schedule/groups/{id}` | delete | 204; 404; 409 "The group is used by an item." (soft-deleted sətirlər də sayılır) |

```jsonc
// ReleaseScheduleGroup
{ "id": 1, "name": "Pul və məzənnə siyasəti üzrə", "sortOrder": 10, "isActive": true,
  "translations": { "az": { "name": "…" }, "en": { "name": "…" } } }
// Upsert: { "sortOrder": 10, "isActive": true, "translations": { … } }
```

## Dövriliklər — `ReleaseSchedulePeriodicitiesController`, `[Route("api/v1/release-schedule/periodicities")]`

Qruplarla eyni beş əməliyyat və statuslar; `isActive` yoxdur. 409 mesajı: "The periodicity is used by an item."

```jsonc
// ReleaseSchedulePeriodicity
{ "id": 6, "name": "Qərar müvafiq qaydada təsdiq edildikdə", "sortOrder": 60,
  "translations": { "az": { "name": "…" }, "en": { "name": "…" } } }
```

## Route sırası

`/api/v1/release-schedule/items/{id:int}`, `/groups/{id:int}`, `/periodicities/{id:int}` — statik seqment `{id:int}` məhdudiyyəti ilə toqquşmur. Hook `spec-first.mjs` 15 əməliyyatın hamısını bundle-da tapmalıdır; sonda `route-diff.mjs api-cbar-admin` 0 fərq.
