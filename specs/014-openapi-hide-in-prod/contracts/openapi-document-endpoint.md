# Contract: generasiya olunmuş API sənədinin ünvanı

Bu, `api-cbar-admin`-in **biznes endpoint-i deyil** — əl ilə saxlanılan `openapi/` spec-in
`paths` hissəsində təsvir olunmur və olunmayacaq (spec FR-007). Kontrakt yalnız onun
istehlakçıları (drift-check, developer) üçün yazılır.

## `GET /openapi/v1.json`

| Mühit | Status | Gövdə | Autentifikasiya |
|---|---|---|---|
| `Development`, `Staging` | `200` | `application/json` — OpenAPI 3.x sənədi, bugünkü ilə eyni (forma dəyişmir) | tələb olunmur (bugünkü kimi) |
| qalan hamısı (`Production` daxil) | `404` | boş | token-li sorğu da `404` alır |

## Dəyişməyən endpoint-lər (invariant)

| Endpoint | Hər mühitdə |
|---|---|
| `GET /healthz` | bugünkü kimi (`200` / DB əlçatmazsa `503`) |
| `POST /api/v1/auth/login` və bütün `/api/v1/**` | status, gövdə və auth qaydaları dəyişmir |

## İstehlakçılar

| İstehlakçı | Hədəf | Feature-dən sonra |
|---|---|---|
| `openapi/scripts/drift-check.mjs` (`npm run drift`) | default test (`Staging`) | dəyişiklik lazım deyil — 200 alır |
| eyni skript, `API_URL=http://localhost:5253` | lokal (`Development`) | 200 |
| eyni skript, prod `API_URL` | `Production` | `Error: …/openapi/v1.json → 404` — gözlənilən; prod-a qarşı drift dəstəklənmir |
| `.claude/hooks/spec-first.mjs`, `route-diff.mjs` | yerli `openapi/dist/openapi.json` | təsirlənmir (runtime sənədi oxumur) |
| admin panellər, `api-cbar` | — | oxumurlar |
