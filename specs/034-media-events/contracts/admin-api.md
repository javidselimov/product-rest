# Kontrakt: `api-cbar-admin` (CMS)

Əvvəl `api-cbar-admin/openapi/paths/events.yaml`, sonra `Controllers/EventsController.cs`, `EventCategoriesController.cs`.
Hamısı JWT + `RequirePermission`, `CbarControllerBase`, xətalar `application/problem+json`. Yazmalar `AuditService`-dədir.
`SaveChangesAsync` try/catch-a alınmır (`DbExceptionHandler`).

## İcazələr

`events.read`, `events.create`, `events.update`, `events.delete`: `Authorization/Permissions.cs` (`Permissions.All`-a da) + `0018`.
Bölmələr eyni icazələrlədir.

## `/api/v1/events`

| Metod | Yol | İcazə | Cavab |
|---|---|---|---|
| GET | `/` | read | `{ items, total, page, pageSize }`, `PagingQuery`, filtrlər `search`, `status`, `type`, `categoryId` |
| GET | `/{id}` | read | detail |
| POST | `/` | create | `201` detail |
| PUT | `/{id}` | update | detail |
| DELETE | `/{id}` | delete | `204`, soft-delete |

**Sətir**: `id, title, type, status, startsOn, endsOn, categoryName`. Sıra: `startsOn` azalan.

**Upsert**:

```json
{
  "type": 3,
  "categoryId": 1,
  "status": "published",
  "startsOn": "2026-06-04",
  "endsOn": "2026-06-05",
  "startTime": null,
  "galleryId": 3,
  "pressReleaseId": 75,
  "pageId": null,
  "translations": {
    "az": { "title": "…", "location": "Bakı", "content": "<p>…</p>" },
    "en": { "title": "…", "location": "Baku", "content": null }
  }
}
```

**Detail** = upsert + `id` + hər dil üçün `slug` + seçici etiketləri:
`category`, `gallery`, `pressRelease`, `page`: `{ id, title } | null`.

**`400`**: tərcümə yoxdur, `type` 1–4 deyil, `status = scheduled`, `endsOn < startsOn`, istinad olunan id tapılmır.
Slug `SlugService`/`UniqueSlug` ilə yaranır.

## `/api/v1/event-categories`

| Metod | Yol | İcazə | Cavab |
|---|---|---|---|
| GET | `/` | read | `{ items }`, `sort_order` üzrə, aktiv olmayanlar da |
| GET | `/{id}` | read | detail |
| POST | `/` | create | `201` |
| PUT | `/{id}` | update | detail |
| DELETE | `/{id}` | delete | `204`; istifadədədirsə `409` |

```json
{ "sortOrder": 1, "isActive": true, "translations": { "az": { "name": "Pul siyasəti" }, "en": { "name": "Monetary policy" } } }
```
