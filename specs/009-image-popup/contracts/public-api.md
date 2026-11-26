# Contract: `api-cbar` — `GET api/v1/image-popups`

Anonimdir. Qlobal `public` rate-limit tətbiq olunur (1000 sorğu/dəqiqə/IP). Yer: `MediaContentController`, `video-streams`-in yanında.

## Sorğu

`GET /api/v1/image-popups?locale=az`. `locale` göndərilməsə `"az"` qəbul olunur.

## Cavab

Sadə massivdir, **0 və ya 1 element** (R4):

```json
[
  {
    "id": 3,
    "imageUrl": "/media/41",
    "link": "/az/pages/strategiya",
    "altText": "2024-2026-cı illərdə maliyyə sektorunun inkişaf Strategiyası…"
  }
]
```

- `imageUrl` həmişə doludur: şəkilsiz dil seçilmir.
- `link` və `altText` `null` ola bilər.
- `title`, `isActive`, tarixlər və başqa dilin məlumatı public tərəfə **çıxmır**.
- Heç nə yoxdursa: `200 []`.

## Filtr və sıra

`data-model.md` → "Public seçim".

## `web-cbar-new` tərəfi (istehlakçı)

`features/image-popup/api/image-popup.api.ts` (`server-only`):

- `cachedJson(z.array(imagePopupSchema), { keyPrefix: 'image-popups', tag: 'media' })`
- `getImagePopups(locale)` → `/api/v1/image-popups?locale=${locale}`
- Layout-da `.catch(() => [])` ilə çağırılır. API xətası popup-ı sadəcə gizlədir, səhifəni sındırmır.
