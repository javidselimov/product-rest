# Public API kontraktı: `api-cbar` press-relizlər (spec 029)

Spec-first (CLAUDE.md "Endpoint changes are spec-first"): əvvəl
`product-rest/api-cbar/openapi/paths/press-releases.yaml` + `components/schemas/press-releases.yaml`
+ `components/parameters.yaml` yenilənir, `npm run lint && npm run bundle` təmiz keçir, sonra
`PressReleasesController`. Route-lar dəyişmir — yalnız parametr və sahə əlavəsi (hook yalnız
xatırlatma verir, bloklamır). Bütün dəyişikliklər **geriyə uyğundur** (Maddə VII.3).

## 1. `GET /api/v1/press-releases`

| Parametr | Tip | Default | Dəyişiklik | Qayda |
|---|---|---|---|---|
| `locale` | `az`\|`en` | `az` | — | |
| `page` | int | 1 | — | clamp 1…100 000 |
| `pageSize` | int | 10 | — | clamp 1…100 |
| `type` | int16 | — | təsvir dəqiqləşir | `1` Xəbər, `2` Elan; verilməsə hər ikisi |
| `q` | string | — | **YENİ** | trim; boş → filtr yox; > 200 simvol → 400. Başlıq üzrə, böyük-kiçik hərfə həssas olmayan alt-sətir; `%`, `_`, `\` hərfi |
| `from` | date `yyyy-MM-dd` | — | **YENİ** | `PublishedAt ≥ from 00:00 Asia/Baku (+04:00)`; səhv format → 400 |
| `to` | date `yyyy-MM-dd` | — | **YENİ** | `PublishedAt < (to+1) 00:00 +04:00` (gün daxil); `from > to` → boş nəticə, 200 |

Dəyişməz filtrlər: `Status = Published`, `PublishedAt ≤ now`, `DeletedAt IS NULL`, tərcümə
`locale`-də var. Sıra: `PublishedAt DESC`.

Cavab `200` (`PressReleasePage`) — **yeni sahə `type`**:

```json
{
  "items": [
    { "id": 73, "type": 1, "title": "…", "slug": "…", "publishedAt": "2026-06-11T09:00:00+00:00", "imageUrl": "/media/1811" }
  ],
  "total": 20, "page": 1, "pageSize": 9
}
```

`400` — mövcud `components/responses.yaml#/BadRequest` (model binding / `q` uzunluğu).

## 2. `GET /api/v1/press-releases/{slug}`

Parametrlər dəyişmir. Cavab `200` (`PressReleaseDetail`) — **yeni sahə `type`**:

```json
{
  "id": 73, "type": 1, "title": "…", "slug": "…", "content": "<p>…</p>",
  "publishedAt": "2026-06-11T09:00:00+00:00",
  "assets": [
    { "mediaId": 1811, "originalName": "foto1.jpg", "mimeType": "image/jpeg", "sizeBytes": 245133, "url": "/media/1811" },
    { "mediaId": 1812, "originalName": "qerar.pdf", "mimeType": "application/pdf", "sizeBytes": 88211, "url": "/media/1812" }
  ]
}
```

`assets` sırası `SortOrder` (sonra `Id`) — frontend örtüyü və qalereyanı bu sıradan qurur.
`404` — slug yoxdur, dərc olunmayıb, embargo və ya soft-delete (R9 ilə təsdiqlənir).

## 3. İstehlakçılar (reqressiya yoxlaması, SC-007)

| İstehlakçı | Çağırış | Təsir |
|---|---|---|
| `web-cbar-new` ana səhifə (`views/home/loader.ts`) | siyahı `type=1`, `type=2` | yeni imza, eyni sorğu |
| `web-cbar-new` siyahı / detal | siyahı + filtrlər, detal | bu spec |
| `web-cbar-new` axtarış | `SearchController` (ayrı endpoint) | dəyişmir |
| RSS (köhnə `RssController`) | yeni stack-də yoxdur | — |
