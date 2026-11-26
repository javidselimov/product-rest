# API contract: spec 044

Endpoint-lər spec-first-dir: əvvəl `product-rest/<api>/openapi/` (`paths/ifi-organizations.yaml`, `components/schemas/ifi-organizations.yaml`,
`openapi.yaml` tag `IfiOrganizations` + path ref-ləri), `npm run lint` + `npm run bundle`, sonra controller. `route-diff.mjs` hər iki API-də təmiz.

## Public — `api-cbar`

### `GET /api/v1/ifi-organizations?locale=az|en`

Filtr: `Status == Published`, `DeletedAt == null`, `locale == "en" ? ShowEn : ShowAz`, həmin dildə tərcümə var. Sıra: `SortOrder`, `Id`.
Səhifələmə yoxdur. Xəta: `429` (rate limit).

```json
{
  "items": [
    {
      "id": 1,
      "name": "Dünya Bankı Qrupu",
      "logo": "/media/42",
      "memberSince": 1992,
      "websiteUrl": "https://www.worldbank.org",
      "mission": "Dünya Bankının (DB) əsas missiyası …",
      "membershipIntro": "Azərbaycan DB Qrupuna daxil olan beş quruma …",
      "content": "<p>…</p>",
      "memberships": [{ "joinedOn": "1992-09-18", "name": "Beynəlxalq Yenidənqurma və İnkişaf Bankı" }]
    }
  ]
}
```

- `logo`, `memberSince`, `websiteUrl`, `mission`, `membershipIntro`, `content`: `null` ola bilər.
- `memberships`: yalnız həmin dildə adı olanlar, `SortOrder, Id` ilə; boş massiv ola bilər.

## Admin — `api-cbar-admin`

Kök: `api/v1/ifi-organizations`, JWT, sinif səviyyəsində `RequirePermission(Ifi.Read)`. Bütün xətalar `application/problem+json`
(`CbarControllerBase` köməkçiləri). Yazmalar `AuditService` ilə, `CreatedBy/UpdatedBy = CurrentUserId()`.

| Metod | Yol | İcazə | Cavab |
|---|---|---|---|
| GET | `/` | `ifi.read` | 200 `IfiOrganizationPage` |
| GET | `/{id}` | `ifi.read` | 200 `IfiOrganizationDetail`, 404 |
| POST | `/` | `ifi.create` | 201 `IfiOrganizationDetail`, 400 |
| PUT | `/{id}` | `ifi.update` | 200 `IfiOrganizationDetail`, 400, 404 |
| DELETE | `/{id}` | `ifi.delete` | 204, 404 (soft delete) |
| POST | `/{id}/memberships` | `ifi.update` | 201 `IfiMembership`, 400, 404 |
| PUT | `/{id}/memberships/{membershipId}` | `ifi.update` | 200 `IfiMembership`, 400, 404 |
| DELETE | `/{id}/memberships/{membershipId}` | `ifi.update` | 204, 404 |
| PUT | `/{id}/memberships/order` | `ifi.update` | 204, 400 (dəst uyğun deyil), 404 |

Audit hərəkətləri: `ifi.create`, `ifi.update`, `ifi.delete`, `ifi.membership_create`, `ifi.membership_update`, `ifi.membership_delete`,
`ifi.membership_reorder`; entity `ifi_organization`.

### Sorğu parametrləri (`GET /`)

`page`, `pageSize` (default 20), `search` (ILIKE ad üzrə), `status`.

### Sxemlər

```text
IfiOrganizationListItem { id, status, sortOrder, showAz, showEn, name (az, yoxdursa ilk), memberSince|null, membershipCount }
IfiOrganizationPage     { items: IfiOrganizationListItem[], total, page, pageSize }

IfiOrganizationTranslation { name, mission|null, membershipIntro|null, content|null }
IfiOrganizationUpsert {
  logoMediaId|null, websiteUrl|null, memberSince|null, sortOrder, status, showAz, showEn,
  translations: { [locale]: IfiOrganizationTranslation }   // buraxılan dil silinir
}
IfiOrganizationDetail = IfiOrganizationUpsert + {
  id, logo: { mediaId, originalName, mimeType, sizeBytes }|null, createdAt, updatedAt, memberships: IfiMembership[]
}

IfiMembershipUpsert { joinedOn: "YYYY-MM-DD", translations: { [locale]: { name } } }
IfiMembership       = IfiMembershipUpsert + { id, sortOrder }
IfiMembershipOrder  { ids: int64[] }
```

Validasiya qaydaları: `data-model.md` → Validasiya.

### Media qoruması

`MediaController.Delete` EXISTS zəncirinə: `OR EXISTS (SELECT 1 FROM ifi_organizations WHERE logo_media_id = {id})` → 409
"File is attached to content; detach it first."
