# api-cbar

Public read-only API for the cbar.az website. It serves the Next.js frontend
(`web-cbar`) and the machine-readable feeds that third parties consume.

ASP.NET Core 10 · C# · Entity Framework Core · PostgreSQL 16 · Redis

## Role in the system

This service reads the same database that `api-cbar-admin` writes, connecting
as the SELECT-only `cbar_web_ro` role. **It must never write.** That is enforced
at the database level, not by convention — a stray write fails with a
permission error rather than corrupting content.

It is also the only public-facing service, so everything it returns must already
be published: each query filters on publication status, soft deletion, and — for
dated content — an embargo on `published_at`.

## Endpoints

All JSON endpoints take `?locale=az|en` (default `az`).

| Group | Endpoints |
|---|---|
| Pages | `GET /api/v1/pages/tree`, `GET /api/v1/pages/{slug}` |
| Press releases | `GET /api/v1/press-releases`, `/{slug}` |
| Laws | `GET /api/v1/laws`, `/{slug}`, `GET /api/v1/law-categories` |
| Homepage | `GET /api/v1/homepage` (banners, slider, links, publications, running lines) |
| Money & markets | `GET /api/v1/currencies`, `azir`, `inflation`, `yield-curves/latest`, `yield-curves/{date}`, `meas`, `meas-emitents`, `meas-info-types` |
| National currency | `GET /api/v1/money-marks`, `/{slug}`, `money-mark-categories`, `money-mark-news`, `/{slug}` |
| Organization | `GET /api/v1/organization/divisions`, `offices`, `staff`, `staff/{id}` |
| Media | `GET /api/v1/galleries`, `/{id}`, `videos`, `video-streams`, `GET /media/{id}` (file bytes) |
| Search | `GET /api/v1/search?q=` across pages, press releases, laws, money marks and staff |

Also `GET /healthz` and `/openapi/v1.json`.

### Legacy XML feed

```
GET /currencies/{DD.MM.YYYY}.xml
```

A compatibility endpoint reproducing the historical cbar.az rate feed, which
external systems have consumed for years at this exact URL. **Treat its output
as a contract**: the element names, ordering and number formatting must not
change. See the `TODO(compat)` marker in `CurrenciesController` for the parts
still being verified against the original.

## Repository layout

```
src/Cbar.Domain/  EF Core model — this repo's own copy (see below)
src/Cbar.WebApi/  controllers, MigrationRunner
tests/Cbar.WebApi.Tests/  xUnit tests for database-free logic
db/migrations/    migrations for tables this service owns — currently none
```

`src/Cbar.Domain` is a deliberate copy of the same project in
`api-cbar-admin`: the services are independent deployables with no shared
package. **A schema change must update both copies.**

## Running it

Prerequisites: the .NET 10 SDK, plus the infrastructure and schema from
`api-cbar-admin` — start that repo's `docker compose up -d` and run its API once
so the database and the `cbar_web_ro` role exist.

```bash
dotnet run --project src/Cbar.WebApi    # http://localhost:5139
```

Local ports and credentials: `api-cbar-admin/CREDENTIALS.md`.

Unit tests need no database or Docker:

```bash
dotnet test CbarWebApi.slnx
```

They cover logic that is a plain function: working paper key parsing and response
shapes, the page tree builder (`PagesController.BuildTree`). To make controller
logic testable, move it into an `internal static` function (the test project
sees internals). The query filters need PostgreSQL and are still checked by
running the stack and calling the endpoint.

## Notes for contributors

- **Publication filters are load-bearing.** Anything that reaches this API is
  world-readable. When adding a query, filter on `Status == Published`, the
  soft-delete filter, and `PublishedAt` where the entity has one.
- **Paging** is clamped, not just floored — an unbounded page number overflows
  the offset calculation. Follow the existing `Math.Clamp` pattern.
- **Search input** is escaped for LIKE metacharacters; keep that if you extend it.
- **Migrations**: this repo may add migrations only for tables it owns,
  referencing admin-owned tables and never the reverse. Filenames must be unique
  across both APIs — they share one `schema_migrations` table. The runner no-ops
  while `db/migrations` holds no `.sql` files; when the first one lands, point
  `ConnectionStrings:Migrations` at a DDL-capable role, since the default
  connection is read-only by design. Full rules are in the `api-cbar-admin`
  README.

## Configuration

| Setting | Purpose |
|---|---|
| `ConnectionStrings:Cbar` | database connection (read-only role) |
| `ConnectionStrings:Redis` | response cache |
| `MediaStorage:*` | S3/MinIO endpoint, keys, bucket for `/media/{id}` |

Requests are rate-limited per client IP. Behind a proxy, configure forwarded
headers so the limiter partitions on the real client address.

## Deployment

CI/CD runs on the shared CBAR pipeline (`devops-linux-team/ci-cd`), included
from `.gitlab-ci.yml`. The branch decides the environment:

| Branch / event | Environment |
|---|---|
| merge request from `feature/*` or `bugfix/*` | dev (manual deploy, manual teardown) |
| `test` | test |
| `master` | prod |

Per-environment Helm values live in `.ci-cd/`: `base.yaml` applies everywhere,
then `dev.yaml` / `test.yaml` / `prod.yaml` layer on the hostname and
environment-specific settings. The image is built from the `Dockerfile` at the
repository root.

Secrets come from Vault at the path named in the environment file — never from
this repository. Hostnames and Vault paths are marked `TODO(devops)` until
confirmed by the DevOps team.

The container listens on 8080 and exposes `/healthz`, used by the readiness and
liveness probes. It connects with the SELECT-only database role, so it never
migrates anything; deploy `api-cbar-admin` first when the schema changes.
