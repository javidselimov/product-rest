# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repository is

A working checkout of the cbar.az rewrite. The layout:

```
product-rest/            the new stack — four components, each its own upstream GitLab repo
  api-cbar/              public API (.NET, read-only)
  api-cbar-admin/        CMS API (.NET, owns the schema)
  web-cbar-new/          public site (Next.js 16 SSR, CBAR UI kit)
  web-cbar-admin-new/    CMS admin panel (React + Vite, CBAR UI kit)
product-host/            the legacy Yii2 cbar.az site — behaviour reference only, never edited
specs/                   spec-kit features 001–021 (spec → plan → tasks), shared by all components
business_logic/          Azerbaijani business-logic docs (see below)
.specify/                spec-kit config + workspace constitution (.specify/memory/constitution.md)
GUIDE.md, dev.ps1, dev.sh   local-setup guide (Azerbaijani) and the run-everything scripts
```

Upstream, the four `product-rest/` components are **four independent GitLab repositories** —
each has its own `.gitlab-ci.yml`, `Dockerfile`, `.ci-cd/` Helm values and README, and each
deploys separately. Nothing at the root is shared code. Treat each component as its own
project. A change that spans two of them is two upstream merge requests, and their deploy
order matters (see below).

**The legacy frontends are gone.** `web-cbar` and `web-cbar-admin` were deleted; the former
`web-cbar-next` / `web-cbar-admin-next` were renamed to `web-cbar-new` / `web-cbar-admin-new`
and are now the only frontends. They still run on the side-by-side ports **3001** and
**5174**. Their own `CLAUDE.md` headers still say `-next` and mention the legacy apps on
3000/5173 — read them for architecture, ignore those two remarks.

## Architecture

```
web-cbar-admin-new ──JWT──▶ api-cbar-admin ──writes──┐
(React SPA, :5174)          (CMS API, owns schema)   ├─▶  PostgreSQL
web-cbar-new ──server-side─▶ api-cbar ──reads────────┘     (+ MinIO for files)
(Next.js SSR, :3001)         (public API, read-only)
```

Two .NET APIs share one PostgreSQL database. `api-cbar-admin` owns the schema and is the only
writer. `api-cbar` connects as the SELECT-only `cbar_web_ro` role — read-only is enforced by
database grants, not convention, so an accidental write fails with a permission error.

Consequences that shape almost every task here:

- **Startup and deploy order is fixed.** `api-cbar-admin` applies migrations and (in
  Development, on an empty database) `db/seed.sql`, which is what creates the `cbar_web_ro`
  role. Start or deploy it *before* `api-cbar`, or `api-cbar` cannot connect. Most "api-cbar
  won't start" failures are this.
- **`src/Cbar.Domain` is duplicated byte-for-byte** in `api-cbar` and `api-cbar-admin` —
  deliberately, since there is no shared NuGet package. Any entity or `CbarDbContext` change
  must be made identically in both copies.
- **Everything public is filtered.** `api-cbar` queries always constrain on
  `Status == ContentStatus.Published`, soft-delete flags, locale visibility
  (`ShowAz`/`ShowEn`), and for dated content a `PublishedAt` embargo. A blank public site
  usually means an empty database, not a bug.
- **Content is bilingual (az/en) throughout.** Translatable entities have a companion
  `<entity>_translations` table keyed by `(entity_id, locale)`, slugs unique per locale. A
  record may be filled in one locale and blank in the other.

## Commands

**`dev.ps1` / `dev.sh` are stale.** They still expect the components at the repository root
(`api-cbar-admin\docker-compose.yml`, `web-cbar`, `web-cbar-next`, …) and seed from
`db/dev/mock-content.sql` + `placeholder-*.svg`, which were deleted. Until they are updated to
`product-rest/` and the new frontend names, run the components by hand:

```bash
cd product-rest/api-cbar-admin && docker compose up -d   # Postgres, Redis, MinIO, Meilisearch, Mailpit
dotnet run --project src/Cbar.AdminApi                    # :5253  (start this first)
cd product-rest/api-cbar && dotnet run --project src/Cbar.WebApi   # :5139
cd product-rest/web-cbar-admin-new && npm run dev         # :5174  (/api/v1 proxied to :5253)
cd product-rest/web-cbar-new && npm run dev               # :3001  → redirects to /az
```

Both frontends also have `npm run local:testcbar` (admin :5175, public :3002) that runs
against the deployed test APIs, so no local backend is needed.

Gate for both frontends — the merge condition:

```bash
npm run verify   # web-cbar-new:       setup:check → check:self-contained → lint → typecheck → test:run → build
                 # web-cbar-admin-new: lint → check:kit → check:i18n → tsc -b → test:run → build
```

Both use Vitest + MSW, with handlers that encode the real API contract. The admin panel adds a
live-API guard for the TipTap editor — run it after touching any rich-text extension:

```bash
cd product-rest/web-cbar-admin-new && npm run roundtrip -- "Haqqımızda" "Pul siyasəti"
```

**There is no automated test suite in the APIs** — no test projects. Verification there means
`dotnet build`, run the stack, and exercise the affected endpoint.

Local addresses and credentials are in `product-rest/api-cbar-admin/CREDENTIALS.md`. Note
Postgres is on **5433** and MinIO on **9002/9003** (5432 and 9000/9001 are taken by another
local project). The admin API's Development CORS allows 5173 and 5174; the admin panel proxies
`/api` through Vite anyway, and the public site calls `api-cbar` server-side only, so neither
needs a CORS entry. Frontends default to the right local API URLs (`.env.development`);
override with `API_URL` (web-cbar-new) or `VITE_API_URL` (web-cbar-admin-new).

## Migrations

`MigrationRunner` in each API runs `db/migrations/*.sql` in filename order at startup, under an
advisory lock, one transaction per file, recording each in a shared `schema_migrations` table
keyed by full filename.

- Append only — never edit an applied migration; ship a new file.
- No `BEGIN`/`COMMIT` inside a file; the runner wraps it.
- **Filenames must be unique across both API repos** — they share `schema_migrations`, so a
  reused name is silently skipped.
- Write them to run against an existing database (`IF NOT EXISTS`). In shared environments existing
  tables may be owned by another role, so `ALTER TABLE` on them fails with "must be owner of table" and
  blocks startup. Add a companion `*_details` table instead (`0016`, `0017`).
- `api-cbar` may only add migrations for tables it owns (currently none).
- Update the EF model in *both* `Cbar.Domain` copies in the same change.

## Seeding

A fresh database gets only reference data from `db/seed.sql` (locales, roles, the `admin` user,
currency names). The old full development dump (`db/dev/mock-content.sql` and its placeholder
SVGs) has been deleted; `GUIDE.md` still describes it. What remains in
`product-rest/api-cbar-admin/db/dev/` is `home-mock-seed.sql` and `home-mock-seed-2.sql`
(homepage blocks: info lines, slider, publications). They reference `media_id` **2**, so
upload media through `POST /api/v1/media` first, or images 404 silently.
`api-cbar-admin/scripts/seed_*.py` load real sections through the admin API but need dump
directories from another machine. For real data, ask the team for a `pg_dump`.

## web-cbar-new (public site)

Next.js 16 App Router, React 19, `@cbar/lib-react-ui-kit`, Tailwind 4, ECharts,
react-i18next, Zod, Vitest + MSW. Server-rendered and anonymous; the browser never calls the
API. **Read `web-cbar-new/CLAUDE.md` and `AGENTS.md` first** — this Next version has breaking
changes relative to widely-known conventions (authoritative docs in
`node_modules/next/dist/docs/`; middleware is `src/proxy.ts` exporting `proxy()`).

- FSD: `app → views → widgets → features → entities → shared`, imports only downward.
  Route files are thin (`loadX()` + `<XView>`); orchestration lives in `views/<x>/loader.ts`;
  loaders and `features/*/api` are `server-only`.
- Every route lives under `/[locale]` (`az` default, `en`); `src/proxy.ts` redirects
  unprefixed paths, maps legacy URLs (`legacyRedirect()`) and sets the nonce CSP.
- `dangerouslySetInnerHTML` exists only in `widgets/cms-content`; CMS HTML is prepared
  server-side by `shared/lib/cms-html.ts`.
- Requests are uncached by design so CMS edits appear immediately; detail loaders use
  `cache()` only to share a request between `generateMetadata` and the page.
- Editorial copy always comes from the API; only chrome labels live in `src/locales/{az,en}/`.
- The "About us" pages (spec 024) build their Figma blocks from ordinary editor markup (table,
  blockquote, accordion, headings), not from dedicated fields. The rules are
  `specs/024-about-us-redesign/contracts/cms-markup.md`; the editor guide is
  `web-cbar-new/docs/about-cms-guide.md`.
- The About/Media page template is `widgets/section-shell` (spec 028): breadcrumb, share buttons
  and the left menu are built from the CMS page tree, keyed by section root title
  (`SECTION_TITLES` in `entities/page-node`). `/media` renders CMS page `media`; the gallery and
  video lists live at `/media/galleries` and `/media/videos`. No API or admin change was needed —
  menu labels are editor work (`web-cbar-new/docs/media-cms-guide.md`). "Beynəlxalq əməkdaşlıq" /
  "International Cooperation" uses the same template (spec 043) with ordinary content (`plain`), except the IFI page (spec 044), the central banks page (spec 045) and the membership page (spec 046).
- A page can leave its section's menus (spec 041, spec 048): the panel flag "Sol menyuda göstər",
  stored in the companion table `page_details` and sent as `showInSideNav` in `GET /pages/tree`. It is
  data, not a filter: the page stays in the tree, so the footer and breadcrumb keep it, and
  `isInSideNav` (`entities/page-node`) drops it from both left menus (`section-shell`, `section-sidebar`)
  unless it or a page under it is open. Below the section root, `isInDropdownNav` drops it, with its subtree,
  from the dropdown menus too (`shell/nav.ts` `toSection`: the bar's mega menu, the hamburger panel, the mobile
  drawer), with no open-page exception; the admin card "Saytın menyusunda" (`menuVisibility`) mirrors that. `visible` is different: it removes the page from the whole
  navigation and `GetTree` lifts its children to the top level. In the admin input the field is
  nullable, so a client that omits it keeps the stored value.
- Events are their own content type, not press releases (spec 034): `/media/events`, managed in the panel's "Media → Tədbirlər" section. Upcoming and
  past split on the Baku day in `api-cbar`, so there is no `PublishedAt` embargo. A legacy event links to its CMS page by `page_id`; the
  old pages stay in the tree and only the menus hide them (`isEventsNode`). Never set them to not visible: `GetTree` turns the children of
  a hidden page into roots.
- CSR projects are their own content type too (spec 038): the panel section "Haqqımızda → KSM layihələri", `GET /api/v1/csr-projects`, shown as cards and a dialog on the
  CMS page `korporativ-sosial-mesuliyyet`, with no address of their own. The site shows only the intro and file link of that page: an old project list after its heading is left out while projects exist. Photos are `csr_project_images`, not a
  gallery, because an active gallery also lists in `/media/galleries`.
- The information disclosure schedule is its own content type too (spec 039): the panel section "Media → Yayım qrafiki" (rows, groups,
  periodicities), `GET /api/v1/release-schedule`, shown at `/media/release-schedule`. Title and intro come from CMS page 130
  (`melumatlarin-yayimlanmasi-qrafiki`); its old hand-typed table is cut off while rows exist and shown whole otherwise. A row's
  timing cell is text, a link or the decisions dialog, whose dates are events of type 1 (spec 034) — not a table of their own.
  The search filters in the site loader, not the API, because Postgres does not fold İ/ı. `page-72/*` and the page's slugs redirect.
- The Central Bank logo page is a CMS page with its own layout (spec 040): `merkezi-bankin-logosu` / `central-bank-logo`, layout
  `brand-logos`. The first editor table gives the logo versions (image | name | description | background `tünd`/`dark`), the first
  image is the hero, and the page's files are the download cards, so no API or admin code changed. The admin API takes no EPS: it goes in a ZIP.
- International financial institutions are their own content type (spec 044): the panel section "Beynəlxalq əməkdaşlıq → Maliyyə təşkilatları", `GET /api/v1/ifi-organizations`,
  shown as accordion cards (native `<details>`, all closed on arrival) on CMS page 121 (`beynelxalq-teskilatlarla-emekdasliq`, layout `ifi-organizations`
  from `cooperationLayoutFor`). Membership dates are a sub-resource (`/{id}/memberships`), like CSR photos. While organizations exist, the page
  text is cut at its first heading line (the old list); without them it shows whole. Seed `0026` adds the four Figma organizations and retitles
  the page only while its az title is the legacy one. Editor guide: `web-cbar-new/docs/cooperation-cms-guide.md`.
- Memoranda of Understanding are their own content type too (spec 045): the panel section "Beynəlxalq əməkdaşlıq → Memorandumlar", `GET /api/v1/memorandums`,
  shown as a table (organization | country | year) on CMS page 122 (`merkezi-banklarla-emekdasliq`, layout `memorandums`). The API returns
  newest year first; `?sort=oldest` is applied by the site in the view (`orderByYear` in `model/year-sort.ts`, a stable sort that keeps the
  editor's order inside a year), so `loadCmsPage` stays the same for every order. The sort choice is a native `<details>` with two links, no client
  component. While memorandums exist, the page text is cut at its first heading line (the legacy bank texts). Seed `0028` adds the 28 Figma
  rows and puts the intro in front of the page text only while that text still opens with a heading line. The en names are draft translations.
- Memberships in international organizations are **not** a content type (spec 046): the rows are the first ordinary table in the text of CMS
  page 554 (`beynelxalq-teskilatlarda-uzvluk` / `membership-in-international-organizations`, layout `memberships`), organization | year, header
  row not shown. The site sorts them with the memorandum table's year order and menu (`year-sort`), so no API, schema or panel section changed.
  Seed `0029` writes the 14 Figma rows (az + draft en) only over the placeholder text and fixes the en copy of the az page; it touches only
  `page_translations`. Editor guide: `web-cbar-new/docs/cooperation-cms-guide.md`.
- "Maliyyə savadlılığı" / "Financial Literacy" is a template section too (spec 047, `SectionKey` `literacy`). Its blocks come from ordinary
  editor markup through `literacyLayoutFor`: the section root (`maliyye-savadliligi`, page 106) is `financial-literacy` — `h2` sections, a quote
  with its source, a list of bold-titled items as principle cards, a plain list right after an `h3` as target group chips, a paragraph of
  `data-media-link` links as the `PhotoGallery`, a quote with a `mailto:` link as the closing banner. The three platform pages (portal, Virtual
  Education Platform, infobank) are `literacy-platform`: note box, photo row, ruled `h2` sections, a closing single-link paragraph as the button.
  The root carries the "General information" text; that page's address redirects to the root in `src/proxy.ts`. Photos a block shows are left
  out of the page's file list (`usedMediaIds`). Icons go by position (`widgets/about-blocks/literacy-icons.tsx`). Seed `0030` rewrites the four
  legacy texts only while their md5 is the legacy one and takes General information, Seminars, Competitions and the "(Kopya)" draft out of the
  left menu (`page_details`). Editor guide: `web-cbar-new/docs/financial-literacy-cms-guide.md`.
- "İstehlakçıların və investorların hüquqları" / "Consumer and Investor Rights" is a template section too (spec 050, `SectionKey` `consumer`). The
  legacy site had no code for it: every page is ordinary editor markup, so the blocks come from it through `consumerLayoutFor`:
  - `consumer-text`: the root and page 86;
  - `complaint-index`: page 95, with page 96 as its insurance tab;
  - `appeal-statistics`: page 94, a summary of the latest month all channels have filled, channel tabs, a year table, and page 93's infographics;
  - `consumer-documents`: page 101.

  The loader reads 96 and 93 as **companion pages** (`loadCompanion`). Their own addresses redirect in `src/proxy.ts`, as does
  "Activity directions" (88 → root). Tab, channel and year are search parameters picked in the view. The parsers read both the legacy import (`div`
  wrappers, month accordions in a table cell) and the editor's form. These pages show no file list: their `assets` hold the other language's files
  too. Seed `0031`:
  - moves page 86 from Media into the section and renumbers the root's `sort_order` so the left menu is 94, 95, 86, 101; the address is the slug,
    so it does not change;
  - sets the Figma titles;
  - adds the methodology to 95/96 and the "İnformasiya sorğusu" section to 101;
  - takes the 14 other pages out of the left menu.

  The hidden Figma hub "Mərkəzi Banka müraciət imkanları" is a later spec. Editor guides:
  `dokumentasiyalar/istehlakci-huquqlari-guide.md`, `web-cbar-new/docs/consumer-rights-cms-guide.md`.
- Scroll reveal and lazy charts (spec 049): `shared/ui/reveal.tsx` fades blocks in once on scroll (AboutBlocks blocks, news/list
  cards with a capped stagger, home sections below the hero); the server always renders the visible `static` state, so no-JS,
  print and reduced motion show everything. Never nest reveals. `Chart` loads ECharts only within one screen of the viewport
  (`useInView`, `shared/lib/viewport-observer.ts`). Tests use `shared/testing/intersection-observer.ts`.
- Press releases have three types: 1 news, 2 announcement, 3 interview or speech (spec 033). The type
  picks the detail layout (`layoutFor`). An attachment may have a language
  (`press_release_asset_details`); `api-cbar` leaves out files of the other language.

Pages whose blocks are built from editor markup (`layoutFor` / `mediaLayoutFor` / `cooperationLayoutFor` / `literacyLayoutFor` /
`consumerLayoutFor`: about-main, history, mission, media-requests, csr-projects, brand-logos, ifi-organizations, memorandums, memberships,
financial-literacy, literacy-platform, consumer-text, complaint-index, appeal-statistics, consumer-documents) must have a guard. **A new `AboutLayoutKind` does not pass `verify` without it**:

1. Add `src/features/about-content/fixtures/<layout>.html` in web-cbar-new, in the form the editor saves
   (`colspan`/`rowspan`, `target`/`rel` on links), and the same file to
   `web-cbar-admin-new/src/features/rich-text/fixtures/layouts/`.
2. Add the layout to `EXPECTED_BLOCKS` in `model/layout-fixtures.test.ts` (it is an exhaustive `Record`,
   so `typecheck` fails until you do) and to the list in the admin `roundtrip.test.ts`.

The admin test requires the editor to save the fixture byte for byte, the site test requires the expected
blocks, and `check:layout-fixtures` in both `verify` scripts requires the two copies to match. That last
check only runs when both components are checked out side by side, so it is skipped in upstream CI. A new
slug on an existing layout needs nothing. Pages parsed by anything other than `parseAbout` are outside
this guard: add them to it by hand.

## web-cbar-admin-new (CMS panel)

React 19, Vite, `@cbar/lib-react-ui-kit` + Tailwind 4, TanStack Router/Query, Zustand, Axios,
RHF + Zod, react-i18next, TipTap, Vitest + MSW. **Read `web-cbar-admin-new/CLAUDE.md` first.**

- FSD: `app → pages → widgets → features → entities → shared`. Routine CRUD screens are a
  `ModuleConfig` in `features/<x>/model/module.ts` rendered by `<CrudListPage>` /
  `<CrudFormPage>`; the full recipe for a new section is in that project's `CLAUDE.md`.
- Every API response is parsed with Zod; a mismatch is `AppError{code:'CONTRACT'}`.
- Access token lives **only in memory**; the session is restored from an `HttpOnly` refresh
  cookie (spec 005). Code that writes the token to storage is not accepted.
- **TipTap silently drops any element no extension claims**, so removing an extension
  deletes that legacy cbar.az markup (`<details>`, tables, iframes, media links) from every
  page an editor opens and saves. Guard with `roundtrip.test.ts` and `npm run roundtrip`.
- Every new `React.lazy` import is wrapped with `shared/lib/chunk-reload.ts` so stale tabs
  recover after a deploy.
- The sidebar is grouped by the public site's sections, in the site's order (spec 046, `app/routes/nav.ts`):
  Haqqımızda, Statistika, Media, Beynəlxalq əməkdaşlıq…, then the panel's own Ana səhifə and İdarəetmə; a one-screen
  section is a plain item. Groups open and close and are remembered per browser. A page whose table or cards come
  from a section of its own links to it from the page form (`features/pages/model/managed-sections.ts`). When the
  menu changes, update the menu paths in `web-cbar-new/docs/*-cms-guide.md` in the same change.

## api-cbar (public API)

Controllers only, no service layer — EF Core projections straight to anonymous DTOs. Redis
cache and a MinIO client are registered but content queries hit Postgres directly.
Rate-limited per client IP (`X-Forwarded-For` aware), 1000/min, because one SSR page view
fans out into several API calls.

`GET /currencies/{DD.MM.YYYY}.xml` is a compatibility endpoint reproducing the historical
cbar.az feed that external systems have consumed for years. **Its element names, ordering and
number formatting are a contract** — do not change them; see the `TODO(compat)` markers in
`CurrenciesController`.

## api-cbar-admin (CMS API)

Controllers under `/api/v1`, all JWT-protected except the `auth/*` login/refresh flow (access
token valid 15 minutes, refresh via `HttpOnly` cookie). Services worth knowing: `AuditService`
writes who-changed-what to `audit_log`; `MediaStorage` stores uploads in MinIO/S3
content-addressed by SHA-256 so identical bytes are stored once; `SlugService`/`UniqueSlug`
appends `-2`, `-3` on collisions.

Every error is `application/problem+json` (spec 018). Controllers derive from
`Errors/CbarControllerBase` and return `BadRequestProblem` / `ConflictProblem` /
`NotFoundProblem` / `ErrorProblem` — never `new { message }`. Those helpers repeat the text in
a `message` extension, and the auth endpoints keep their `code`, because the admin panel reads
both. A write PostgreSQL rejects (unique, FK, length, range, CHECK) is mapped to 400/409 by
`Errors/DbExceptionHandler`, so don't wrap `SaveChangesAsync` in try/catch for that.
401/403/5xx without a `message` deliberately carry no `title`: the panel shows `title` in
place of its own localised text. Keep that until the panel is adapted.

## Object storage

Both APIs reach MinIO through the **`Minio` .NET client, not `AWSSDK.S3`** — the AWS SDK v4
turns on request checksums by default and sends every upload as an aws-chunked body with a
CRC32 trailer, which MinIO rejects (a 500 on upload while every other service against the
same MinIO works). Don't swap it back for the AWS SDK.

`MediaStorageOptions` is duplicated in both, like `Cbar.Domain` — keep them in step.
`MediaStorage__Endpoint` comes from Vault in MinIO's own convention (`host:port`, no scheme);
`MediaStorage__UseSsl` decides the scheme in that case and must be identical in both
components, since they talk to the same MinIO. An endpoint that already carries `http://` or
`https://` wins over the flag.

## Business-logic docs

`business_logic/` holds three Azerbaijani documents: `old_businesslogic.md` (the legacy Yii2
site in `product-host/`), `new_business_logic.md` (the new stack in `product-rest/`) and
`diff_report_logic.md` (what the old one had that the new one lacks). Keep them in step with
the code via the `/sync-business-logic` skill (`.claude/skills/sync-business-logic/`):
incremental from the `Sync:` commit in each header, `--full` to rebuild, or a module key to
limit scope. It never edits code and never commits.

## OpenAPI specs

Both APIs carry a hand-maintained OpenAPI 3.1 spec in `product-rest/<api>/openapi/` (Redocly;
conventions in each `openapi/README.md`) — hand-written because the controllers return
anonymous types, so the runtime `/openapi/v1.json` has no response schemas. Keep them in step
with the controllers via the `/sync-openapi` skill (`.claude/skills/sync-openapi/`):
incremental from the `# Sync:` line at the top of each `openapi.yaml`, `--full` to re-check
everything, an API name or `paths/` file key to limit scope. Its `scripts/route-diff.mjs`
compares controller route attributes with the bundled spec statically (no .NET SDK or running
API needed). It never edits code and never commits.

**Endpoint changes are spec-first.** To add, change or remove an endpoint, update `openapi/`
first (lint + bundle, get the spec approved), then the controller — the `/api-endpoint` skill
(`.claude/skills/api-endpoint/`) walks through it. The PreToolUse hook
`.claude/hooks/spec-first.mjs` (registered in `.claude/settings.json`) enforces the route half:
an edit to a controller in `product-rest/{api-cbar,api-cbar-admin}` that adds a `METHOD path`
missing from `openapi/dist/openapi.json`, or removes one still in it, is denied (it rebuilds a
stale bundle first). Body/shape/status changes pass with a reminder only — check those by
hand. The hook shares route extraction with `route-diff.mjs` via
`.claude/skills/sync-openapi/scripts/routes.mjs`.

## Frontend skills

Two skills cover frontend work in `web-cbar-new` / `web-cbar-admin-new`:
`/senior-front` (`.claude/skills/senior-front/`) names code smells and the refactoring that
removes each; `/frontendpatterns` (`.claude/skills/frontendpatterns/`) is a pattern catalog
from frontendpatterns.dev — foundations, decision guides, and accessibility, resilience,
performance and security patterns — mapped to where this repo already implements them.
**Both are mandatory in every spec that touches a frontend**, together with the component's own `frontend-standards` and
`ui-kit-usage` (in `product-rest/<frontend>/.claude/skills/`): `/speckit-plan` fills the plan's "Frontend Skills Gate" section from
them, `/speckit-tasks` ends each frontend phase with a `ui-kit-review` + senior-front review task, and `/speckit-implement` loads them
before the first frontend task. The PreToolUse hook `.claude/hooks/frontend-skills.mjs` (matcher `Skill`) injects the same rule
whenever a spec-kit plan/tasks/implement/analyze/converge skill starts, so it survives a spec-kit upgrade that rewrites the skills.
Both frontends follow the spec 032 constants standard: no magic numbers, cross-cutting values in
`src/shared/constants/<topic>.ts` and slice-specific ones in that slice's `constants.ts`, enforced by
`@typescript-eslint/no-magic-numbers` in each `verify` (contract in
`specs/032-frontend-constants-standard/contracts/constants-contract.md`).

## Secrets

Every credential in this repository — `docker-compose.yml`, `db/seed.sql`,
`appsettings.Development.json` including `Jwt:SigningKey`, MinIO keys — is **local-development
only**. Deployed environments pull their own from Vault at the path named in `.ci-cd/*.yaml`,
and the `cbar_web_ro` role is provisioned out of band (migration `0001` grants it read access
if it exists but never creates it). Hostnames and Vault paths carry `TODO(devops)` markers
until DevOps confirms them.

## Deployment (per component)

Shared CBAR GitLab pipeline (`devops-linux-team/ci-cd`), included from each `.gitlab-ci.yml`.
Branch selects environment: MR from `feature/*` or `bugfix/*` → dev (manual), `test` → test,
`master` → prod. `.ci-cd/base.yaml` applies everywhere, with `dev|test|prod.yaml` layered on
top.

`API_URL` for web-cbar-new (plus an optional `CSP_FRAME_SRC`) is read at **runtime**
(standalone Node server, port 3000 in the container), so one image promotes between
environments. web-cbar-admin-new is the opposite: the API URL is **baked in at build time** via
`BUILD_ENV` selecting a matching `.env.*` file, then served by nginx.
