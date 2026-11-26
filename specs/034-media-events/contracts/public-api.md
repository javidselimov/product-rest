# Kontrakt: `api-cbar` (ictimai, read-only)

Əvvəl `api-cbar/openapi/paths/events.yaml` yazılır (spec-first), sonra `Controllers/EventsController.cs`.
Süzgəc: `data-model.md` "İctimai görünürlük".

## `GET /api/v1/events`

| Parametr | Tip | Default | Qeyd |
|---|---|---|---|
| `locale` | string | `az` | |
| `when` | `upcoming` \| `past` | hamısı | Bakı günü |
| `q` | string | | başlıq, ILIKE; 200-dən uzun `400` |
| `from`, `to` | date | | `[StartsOn, EndsOn ?? StartsOn]` aralığı ilə kəsişmə |
| `type` | short | | 1–4 |
| `categoryId` | int | | |
| `page` | int | 1 | clamp 1–100000 |
| `pageSize` | int | 10 | clamp 1–500 (`research.md` R6) |

Sıra: `upcoming` və ya `when` yoxdur → `StartsOn` artan; `past` → azalan. Sonra `StartTime` (null axırda), sonra başlıq.

```json
{
  "items": [{
    "id": 7,
    "title": "Faiz dəhlizinin parametrlərinə dair qərar",
    "slug": "faiz-dehlizi-dekabr",
    "type": 1,
    "category": { "id": 2, "name": "Pul siyasəti" },
    "startsOn": "2026-12-23",
    "endsOn": null,
    "startTime": "11:00",
    "location": "Mərkəzi Bank, Bakı",
    "upcoming": true,
    "pageSlug": null
  }],
  "total": 1, "page": 1, "pageSize": 10
}
```

`pageSlug` yalnız bağlı səhifə canlıdırsa doludur. `category` deaktiv olsa da qaytarılır, silinibsə `null`.

## `GET /api/v1/events/{slug}`

Siyahı sahələri + aşağıdakılar. Mövcud deyilsə `404`.

```json
{
  "content": "<p>…</p>",
  "gallery": { "title": "…", "images": [{ "mediaId": 1820, "url": "/media/1820" }] },
  "pressRelease": { "title": "…", "slug": "…" }
}
```

`gallery` və `pressRelease` canlı deyilsə `null`.

## `GET /api/v1/event-categories`

`?locale=az`. Yalnız aktiv, həmin dildə adı olan bölmələr, `sort_order` üzrə. Tədbiri olmayan bölmə də qaytarılır.

```json
{ "items": [{ "id": 2, "name": "Pul siyasəti" }] }
```

## `GET /api/v1/search` (əlavə)

Mövcud cavab formatı. Yeni `type: "event"`, ünvan `/{locale}/media/events/{slug}`, yalnız `PageId == null` (R10).
