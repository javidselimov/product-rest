# API müqaviləsi: 033

Spec-first: dəyişiklik əvvəl `openapi/`-yə yazılır, lint + bundle olunur, sonra kod (`/api-endpoint`).
Spec mətnləri ingiliscədir.

## `api-cbar-admin`

### `type`

`POST` və `PUT /api/v1/press-releases`: `type` enum `[1, 2, 3, null]`.
`InvalidTypeMessage`: `Type must be 1 (news), 2 (announcement) or 3 (interview or speech).`

Yeniləniləcək təsvirlər: `components/schemas/press-releases.yaml` (`PressReleaseListItem`,
`PressReleaseDetail`, `PressReleaseUpsert`), `paths/press-releases.yaml`, `type` query parametri.

### Yeni: `PUT /api/v1/press-releases/{id}/assets/{mediaId}/locale`

| | |
|---|---|
| Spec açarı | `paths/press-releases.yaml#/assetLocale` |
| operationId | `setPressReleaseAssetLocale` |
| Icazə | `press_releases.update` |
| Body | `PressReleaseAssetLocale`: `{ "locale": "az" \| "en" \| null }`, `locale` required, nullable |
| 204 | saxlandı |
| 400 | naməlum dil (`BadRequestProblem`) |
| 401 / 403 | auth |
| 404 | reliz və ya qoşma yoxdur |

Audit: `press_releases.set_asset_locale`, `before: { mediaId, locale }`, `after: dto`.

### `assets[]` detal cavabı

Yeni sxem `PressReleaseAssetRef`: `allOf` `common.yaml#/AssetRef` + `locale: string | null`. Qanunlar
`AssetRef`-də qalır. `ToDetailDto` `Locale` qaytarır.

`POST .../assets`, `PUT .../assets/order`, `DELETE .../assets/{mediaId}` dəyişmir.

## `api-cbar`

Yeni route yoxdur. Cavab forması dəyişmir.

| Endpoint | Dəyişiklik |
|---|---|
| `GET /api/v1/press-releases` | `imageUrl` yalnız dili uyğun qoşmalardan; `type` təsviri `3`, enum `[1, 2, 3]` |
| `GET /api/v1/press-releases/{slug}` | `assets` yalnız `locale == null` və ya sorğu dili; `type` təsviri |
| `GET /api/v1/search` | dəyişmir |

## Uyğunluq

| Vəziyyət | Nəticə |
|---|---|
| Yeni API + köhnə sayt | Düzgün. `locale == null` hamısı görünür; `type = 3` xəbər kimi açılır, ona görə sayt deploy olunmadan dərc edilmir |
| Yeni admin API + köhnə panel | Düzgün. `locale` looseObject-də keçir |
| Yeni panel + köhnə admin API | Deploy sırası ilə baş vermir |
