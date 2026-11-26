# api-cbar-admin

Admin/CMS API for cbar.az. Every write to the site's content goes through this
service: editors work in the admin panel (`web-cbar-admin`), which calls this
API, which owns the database.

ASP.NET Core 10 · C# · Entity Framework Core · PostgreSQL 16

## Role in the system

```
web-cbar-admin  ──JWT──▶  api-cbar-admin ──writes──┐
                                                   ├─▶  PostgreSQL
web-cbar        ─────────▶  api-cbar   ──reads─────┘     (+ MinIO for files)
```

Two APIs share one database. This one holds the schema and is the only service
with write access; `api-cbar` reads through a SELECT-only role and serves the
public site. Because this service owns the schema, **it must be deployed and
started before `api-cbar`** on a database that does not exist yet.

## What it provides

26 controllers under `/api/v1`, all JWT-protected except login:

| Area | Routes |
|---|---|
| Content | `pages` (tree, move, assets), `press-releases`, `laws`, `law-categories` |
| Money & markets | `currencies`, `currency-rates`, `azir`, `inflation`, `yield-curves`, `meas-*` |
| National currency | `money-marks`, `money-mark-categories`, news |
| Homepage | `banners`, `news-slider`, `homepage-links`, `homepage-publications`, `running-lines`, `info-lines` |
| Media | `media` (upload/delete), `galleries`, `videos`, `video-streams` |
| Organization | `organization/divisions`, `offices`, `staff` |
| Administration | `auth`, `users`, `settings` |

Plus `GET /healthz` and the OpenAPI document at `/openapi/v1.json` (Development and
Staging only — not served in Production).

Content is bilingual (az/en). Every translatable entity has a companion
`<entity>_translations` table keyed by `(entity_id, locale)`, with slugs unique
per locale.

## Repository layout

```
db/migrations/     SQL migrations, applied at startup
db/seed.sql        development seed (locales, roles, admin user, currencies)
db/dev/            optional mock-data scripts, applied by hand
scripts/           python content seeders (optional tooling)
src/Cbar.Domain/   EF Core model — CbarDbContext and entities
src/Cbar.AdminApi/ controllers, services, MigrationRunner
tests/Cbar.AdminApi.Tests/  xUnit tests of the database-free rules
docker-compose.yml local infrastructure
```

`src/Cbar.Domain` is duplicated in `api-cbar`, deliberately: the two services
are separate deployables with no shared package. **A schema change must update
both copies.**

Services worth knowing: `AuditService` records who changed what into
`audit_log`; `MediaStorage` puts uploads into MinIO/S3 content-addressed by
SHA-256, so identical bytes are stored once; `UniqueSlug` appends `-2`, `-3` on
slug collisions.

## Running it

Prerequisites: Docker with compose v2, and the .NET 10 SDK.

```bash
docker compose up -d                      # Postgres, Redis, MinIO, Meilisearch, Mailpit
dotnet run --project src/Cbar.AdminApi    # http://localhost:5253
```

That is the whole setup. On startup the service applies any unapplied
migrations, and — in Development, against an empty database — the seed as well,
so the first run provisions the database from nothing.

Logins, ports and service credentials for local development:
[CREDENTIALS.md](CREDENTIALS.md).

Unit tests need no database or Docker:

```bash
dotnet test CbarAdminApi.slnx
```

They cover rules that are plain functions (for example `WorkingPaperRules`, the page menu
flags). To make a controller rule testable, move it into such a function, as `WorkingPaperRules`
does; anything that needs PostgreSQL (query filters, unique indexes, `DbExceptionHandler`) is
still checked by running the stack and calling the endpoint.

## Migrations

`MigrationRunner` runs `db/migrations/*.sql` in filename order at startup,
recording each in a `schema_migrations` table keyed by the full filename, under
an advisory lock, one transaction per file.

Rules for adding one:

1. **Append only.** Never edit a migration that has been applied anywhere; ship
   a new file.
2. **No `BEGIN`/`COMMIT` inside the file** — the runner wraps it already.
3. **Filenames must be unique across both APIs.** They share the
   `schema_migrations` table, so a name used twice is silently skipped the
   second time. Keep names descriptive.
4. `api-cbar` may add migrations only for tables it owns, referencing tables
   here — never the reverse.

Write migrations so they can run against an existing database
(`ADD COLUMN IF NOT EXISTS` and friends), and update the EF model in **both**
repositories in the same change.

## Configuration

| Setting | Purpose |
|---|---|
| `ConnectionStrings:Cbar` | database connection |
| `ConnectionStrings:Migrations` | optional; a DDL-capable connection if the main one is not |
| `Jwt:Issuer` / `Audience` / `SigningKey` / `AccessTokenMinutes` | token issuance |
| `Cors:Origins` | allowed admin-panel origins |
| `MediaStorage:*` | S3/MinIO endpoint, keys, bucket |

The values in `appsettings.Development.json` are for local use only. Deployed
environments must supply their own — in particular `Jwt:SigningKey`, the
database passwords and the storage keys — from the vault, and provision the
`cbar_web_ro` database role out of band (migration `0001` grants it read access
if it exists, but never creates it).

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

The container listens on 8080 and exposes `/healthz`, which the readiness and
liveness probes use. On startup it applies any unapplied migrations, so a deploy
carrying a new migration file also migrates the database — deploy this service
before `api-cbar` when the schema changes.
