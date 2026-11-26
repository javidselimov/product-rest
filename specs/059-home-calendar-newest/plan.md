# Implementation Plan: Ana səhifənin "Təqvim" bloku — tarixə görə ən yeni 3 tədbir

**Branch**: `059-home-calendar-newest` | **Date**: 2026-11-25 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/059-home-calendar-newest/spec.md`

## Summary

Ana səhifənin "Təqvim" bloku (Figma `813:25284`) ən yaxın gələcək 3 tədbir əvəzinə tədbir tarixinə görə ən yeni 3 tədbiri göstərir, sətrin
hamısı tədbirə keçid olur, "Təqvim" başlığı `/media/events`-ə aparır. `api-cbar` `GET /api/v1/events`-ə isteğe bağlı `sort=newest` alır
(başlama günü azalan, eyni gündə gec saat əvvəl, saatsız sonra, başlıq). Bu, spec-first qaydası ilə əvvəl OpenAPI-yə yazılır. `web-cbar-new`
loader `when`-siz `sort=newest&pageSize=3` sorğusu göndərir, `EventCalendar` isə stretched link alır. Admin, sxem və `/media/events` dəyişmir.

## Technical Context

**Language/Version**: C# / .NET 10 (`api-cbar`); TypeScript 5, React 19, Next.js 16 (`web-cbar-new`)

**Primary Dependencies**: EF Core + Npgsql (API); `@cbar/lib-react-ui-kit` (`Badge`, `ClockIcon`), Tailwind 4, Vitest + MSW (site)

**Storage**: PostgreSQL `events` / `event_translations`. Read only, no migration.

**Testing**: `dotnet build` + `dotnet test CbarWebApi.slnx` (ordering is a LINQ query, so it is checked against a running API / PGlite, see
quickstart); `npm run verify` in web-cbar-new (loader test + widget test + MSW handler that honours `sort`)

**Target Platform**: Linux containers (Kubernetes), SSR Node server

**Project Type**: web service + SSR web app (two upstream repos)

**Performance Goals**: no new request. The home page keeps one events request (`pageSize=3`); `ORDER BY starts_on DESC … LIMIT 3` on a
small table.

**Constraints**: the old order (no `sort`) stays byte for byte the same for `/media/events` (SC-004); unknown `sort` → 400 like `when`.

**Scale/Scope**: 1 query parameter, 1 loader call, 1 widget, 2 locale-independent tests, OpenAPI + docs.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Maddə | Yoxlama | Nəticə |
|---|---|---|
| I — `product-host` referansdır | Köhnə ana səhifədə tədbir bloku yoxdur; paritet cədvəli spec-dədir. `product-host`-a toxunulmur | ✅ |
| II — dörd müstəqil proyekt | İki proyekt: `api-cbar`, `web-cbar-new`. Tasks hər biri üçün ayrı fazadır, iki MR | ✅ |
| III — admin/client ayrılığı | `api-cbar` yalnız oxuyur (SELECT), admin dəyişmir | ✅ |
| IV — start/deploy sırası | `api-cbar` → `web-cbar-new` (köhnə API `sort`-u nəzərə almır və ən köhnə 3-ü qaytarar). Tasks-da ayrıca addım | ✅ |
| V — sxem və ikidillilik | Sxem dəyişmir, `Cbar.Domain` dəyişmir. Dil filtri mövcud `PublicTranslations`-dadır | ✅ |
| VI — admin template | Admin dəyişmir | N/A |
| VII — xarici kontraktlar | `sort` isteğe bağlıdır; onsuz cavab və sıra eynidir. XML kurs feed-inə toxunulmur | ✅ |
| VIII — real icra ilə yoxlama | `dotnet build`/`test`, API-ni işə salıb `?sort=newest` çağırmaq, `npm run verify`, ana səhifəni brauzerdə ölçmək | ✅ |

Post-design re-check: dəyişmədi, pozuntu yoxdur.

## Frontend Skills Gate

| UI piece | Kit components (`ui-kit-usage`) | Patterns (`frontendpatterns`) | Smells avoided (`senior-front`) |
|----------|----------------------------------|-------------------------------|----------------------------------|
| Kliklənən tədbir sətri | `Badge` (mövcud), `ClockIcon`; rənglər kit token-ləri (`text-primary`, `outline-ring`) | Semantic HTML (bir `<a>`, `<time>`, `<h3>`), stretched link (`after:absolute after:inset-0`, `csr-project-card.tsx` kimi), görünən fokus (`focus-visible:after:outline-2`), progressive enhancement (JS-siz işləyir) | `<div onClick>` yox; sətir başına bir fokus nöqtəsi (nested interactive yox, `Badge` link deyil); `href: null` budağı silinir (Speculative Generality: `eventHref` həmişə ünvan verir) |
| "Təqvim" başlıq keçidi | `next/link`, kit token-ləri | Semantic HTML: `h2 > a`, səviyyə dəyişmir | Başlıq görünüşü eyni qalır (hover-da underline). Keçid ünvanı prop-dur, widget `features/events`-dən import etmir (Feature Envy) |
| Loader sorğusu | — | Boundaries contain failure: `settle(...)` xətada `[]` verir, blok gizlənir (mövcud) | Server Component olaraq qalır, `'use client'` əlavə olunmur. Magic number yox: `CALENDAR_EVENTS_MAX` mövcuddur |

Review: each frontend phase in tasks.md ends with `ui-kit-review` + the senior-front review checklist before `npm run verify`.

## Project Structure

### Documentation (this feature)

```text
specs/059-home-calendar-newest/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── public-api.md     # GET /api/v1/events ?sort=newest
│   └── ui-contract.md    # EventCalendar: stretched row, heading link, Figma numbers
├── checklists/requirements.md
└── tasks.md              # /speckit-tasks
```

### Source Code

```text
product-rest/api-cbar/
├── openapi/paths/events.yaml                       # + sort parameter (spec-first, lint + bundle)
├── openapi/openapi.yaml                            # Sync line
└── src/Cbar.WebApi/Controllers/EventsController.cs # sort=newest ordering, 400 on unknown

product-rest/web-cbar-new/src/
├── features/events/api/events.api.ts               # EventsQuery.sort
├── shared/testing/handlers/events.ts               # MSW honours sort=newest
├── shared/testing/fixtures/events.ts               # (if needed) same-day pair for the time order
├── views/home/loader.ts                            # getEvents(locale, { sort: 'newest', pageSize: 3 }), calendarHref
├── views/home/constants.ts                         # comment: newest by date
├── views/home/index.tsx                            # pass listHref
├── views/home/loader.test.ts                       # newest-by-date, past included
└── widgets/home-cards/
    ├── event-calendar.tsx                          # stretched link, heading link, href non-null
    └── home-cards.test.tsx                         # row link, heading link, one tab stop per row
```

**Structure Decision**: two upstream components, one phase each, deploy order `api-cbar` → `web-cbar-new`. No `Cbar.Domain`, migration or
admin change.

## Complexity Tracking

Pozuntu yoxdur.
