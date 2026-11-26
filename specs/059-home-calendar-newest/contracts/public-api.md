# Contract: `GET /api/v1/events` — `sort` (api-cbar)

Only the new parameter is described. Everything else is spec 034 `contracts/public-api.md` and `openapi/paths/events.yaml`.

## Parameter

| Name | In | Type | Values | Default |
|---|---|---|---|---|
| `sort` | query | string | `newest` | omitted = today's order |

- Omitted: unchanged. Upcoming and unfiltered run oldest first, past newest first. Then start time (no time last, ascending), then title.
- `newest`: start date **descending**, then events with a time first, start time **descending**, then title. It combines with every
  filter (`when`, `q`, `from`, `to`, `type`, `categoryId`) and with paging. `total` does not change.
- Blank `sort=` is the same as omitted (model binding gives `null`, exactly as for `when=`, checked 2026-11-25).
- Any other value (`foo`, `NEWEST`) → `400`, the same empty bad request as an unknown `when`.

## Examples

```http
GET /api/v1/events?locale=az&sort=newest&pageSize=3
→ 200 { "items": [ …3 newest by start date, past or upcoming… ], "total": 41, "page": 1, "pageSize": 3 }

GET /api/v1/events?locale=az&sort=oldest
→ 400
```

## Compatibility

- Old clients send no `sort` → same response byte for byte (`/media/events`, any external reader).
- A new site against an old API: ASP.NET ignores the unknown parameter and the home page would show the **oldest** three. Deploy `api-cbar`
  first.
