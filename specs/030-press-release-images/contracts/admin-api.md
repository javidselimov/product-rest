# Admin API kontraktı: `api-cbar-admin` press-reliz qoşma sırası (spec 030)

Spec-first: `product-rest/api-cbar-admin/openapi/paths/press-releases.yaml` (`assetsOrder`),
`components/schemas/press-releases.yaml` (`PressReleaseAssetOrder`), `openapi.yaml`
(`/api/v1/press-releases/{id}/assets/order`), lint + bundle, sonra controller.

## 1. `PUT /api/v1/press-releases/{id}/assets/order` — **YENİ**

`operationId: reorderPressReleaseAssets`, `x-permission: press_releases.update`.

Gövdə:

```json
{ "mediaIds": [12, 7, 9, 3] }
```

`mediaIds` — xəbərin bağlı media id-lərinin tam dəsti (`assets[].mediaId`), hər biri bir dəfə, yeni
sıra ilə. `sort_order` bu sıra ilə 1, 2, 3… yazılır. Saytda ilk şəkil qoşması örtük, qalan şəkillər
fotoqalereya, digər fayllar sənəd siyahısıdır.

| Cavab | Nə vaxt |
|---|---|
| `204` | sıra yazıldı (eyni sıra da 204 — idempotent) |
| `400 problem+json` | dəst uyğun deyil: `message: "mediaIds must contain exactly the press release's attached media ids."` |
| `401` / `403` | token yoxdur / `press_releases.update` icazəsi yoxdur |
| `404` | xəbər yoxdur və ya soft-delete olunub |

Audit: `press_releases.reorder_assets` (`before: { mediaIds: [köhnə] }`, `after: gövdə`).

Route `{id:int}/assets/order` ilə `DELETE {id:int}/assets/{mediaId:long}` konflikt etmir (`long`
məhdudiyyəti `order`-i qəbul etmir).

## 2. Dəyişməyənlər

- `POST /api/v1/press-releases/{id}/assets` `{ mediaId }` → 204, sona əlavə (`max + 1`).
- `DELETE /api/v1/press-releases/{id}/assets/{mediaId}` → 204.
- `GET /api/v1/press-releases/{id}` → `assets[]` `AssetRef` (`mediaId`, `originalName`, `mimeType`,
  `sizeBytes`), `SortOrder, Id` sırası ilə.

## 3. Panel tərəfi

`features/assets/api/assets.service.ts` → `reorder(assetsPath, mediaIds)` =
`apiClient.put<void>(`${assetsPath}/order`, { mediaIds })`. MSW
`shared/testing/handlers/press-releases.ts` eyni qaydaları təkrarlayır (dəst yoxlaması → 400
`message`, yenidən sıralanmış `assets` → 204).
