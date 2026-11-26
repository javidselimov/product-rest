# Public API kontraktı (api-cbar)

Spec-first: `openapi/paths/release-schedule.yaml` (açar `list`), `components/schemas/release-schedule.yaml`, `openapi.yaml` (tag `ReleaseSchedule`: "Information disclosure schedule and monetary policy decision dates."). Anonim, rate limit ümumi (429 `TooManyRequests`).

## `GET /api/v1/release-schedule?locale=az`

`ReleaseScheduleController` (`ControllerBase`, `CbarDbContext`), `[HttpGet("api/v1/release-schedule")]`, `locale` default `az` (`CsrProjectsController` kimi filtr). Səhifəsiz; axtarış parametri **yoxdur** (research R4 — sayt süzür).

```jsonc
// 200 ReleaseSchedule
{
  "groups": [
    { "id": 1, "name": "Pul və məzənnə siyasəti üzrə",
      "items": [
        { "id": 1, "title": "Pul siyasətinin əsas istiqamətləri (Bəyanat)", "periodicity": "İllik",
          "timing": "Dekabr ayının 31-dək", "timingMode": "text", "timingUrl": null },
        { "id": 2, "title": "Pul siyasəti ilə bağlı qəbul olunan qərarlar",
          "periodicity": "Qərar müvafiq qaydada təsdiq edildikdə",
          "timing": "Qrafikə uyğun", "timingMode": "decisions", "timingUrl": null }
      ] }
  ],
  "decisions": {
    "year": 2026,
    "dates": [ { "date": "2026-02-04", "withPressConference": true },
               { "date": "2026-04-02", "withPressConference": false } ],
    "next":  { "date": "2026-10-29", "withPressConference": true }   // və ya null
  }
}
```

| Sahə | Tip | Qayda |
|---|---|---|
| `groups[]` | array | yalnız aktiv, həmin dildə adı olan və ən azı bir görünən sətri olan qruplar; `sortOrder` → `id` |
| `items[]` | array | `data-model.md` §Public oxu qaydası; `sortOrder` → `id` |
| `periodicity` | string \| null | həmin dildə ad; yoxdursa və ya seçilməyibsə null |
| `timing` | string \| null | boş sətir null-a çevrilir |
| `timingMode` | `"text" \| "link" \| "decisions"` | |
| `timingUrl` | string \| null | yalnız `link` rejimində dolu |
| `decisions.year` | int | `BakuClock.Today().Year` |
| `decisions.dates[]` | array | həmin ilin unikal `type = 1` tarixləri, artan; boş ola bilər |
| `date` | string (`date`) | `yyyy-MM-dd` |
| `withPressConference` | bool | eyni gündə `type = 2` |
| `decisions.next` | object \| null | `starts_on >= today` ilk `type = 1`, il məhdudiyyəti yoxdur |

`decisions` həmişə qaytarılır (sətirlərin rejimindən asılı deyil). Bütün sahələr `required`.

## Saytın istehlakı (web-cbar-new)

`features/release-schedule/api/release-schedule.api.ts`: `getReleaseSchedule(locale)` → `cachedJson(releaseScheduleSchema, { keyPrefix: 'release-schedule', tag })`, 10 s. Zod sxemi yuxarıdakı forma ilə eynidir (`model/schemas.ts`). MSW handler `shared/testing/handlers/release-schedule.ts` bu cavabı verir.
