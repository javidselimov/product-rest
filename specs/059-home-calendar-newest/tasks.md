# Tasks: Ana səhifənin "Təqvim" bloku — tarixə görə ən yeni 3 tədbir

**Input**: Design documents from `specs/059-home-calendar-newest/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: included. The web-cbar-new `verify` gate requires them, and they check user behaviour (role, link name, href) through MSW
handlers that encode the real contract.

**Deploy order**: `api-cbar` (Phase 2) → `web-cbar-new` (Phases 3–4). Two upstream merge requests.

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup

No setup: no new dependency, project or migration.

---

## Phase 2: Foundational — api-cbar `sort=newest` (blocks US1)

**Purpose**: the public API can return events newest first across past and upcoming (contracts/public-api.md).

- [X] T001 Spec-first: add the `sort` query parameter (`enum: [newest]`, description of the order, combining with filters, 400 otherwise) to
  `list` in `product-rest/api-cbar/openapi/paths/events.yaml` and extend the list description; then `npm run lint` and `npm run bundle` in
  `product-rest/api-cbar/openapi/`
- [X] T002 Add the `sort` parameter to `GetList` in `product-rest/api-cbar/src/Cbar.WebApi/Controllers/EventsController.cs`: constant `Newest`,
  400 when `sort` is not null and not `newest`, ordering `StartsOn desc → StartTime == null → StartTime desc → Title`; without `sort` the
  existing order is unchanged
- [X] T003 Verify: `dotnet build CbarWebApi.slnx`, `dotnet test CbarWebApi.slnx`, and `node .claude/skills/sync-openapi/scripts/route-diff.mjs`
  (no route drift); run the API against a database (or PGlite) and call `?sort=newest&pageSize=3`, `?when=upcoming` (unchanged), `?sort=foo`
  (400)
- [X] T004 Update the `# Sync:` line of `product-rest/api-cbar/openapi/openapi.yaml` with `events sort (spec 059)`

**Checkpoint**: api-cbar can be merged and deployed on its own; no client sends `sort` yet.

---

## Phase 3: User Story 1 — tarixə görə ən yeni 3 tədbir (Priority: P1) 🎯 MVP

**Goal**: the home page block shows the three events with the latest start date, past or upcoming.

**Independent Test**: `views/home/loader.test.ts` with fixtures where the newest three mix past and upcoming; the block is not hidden when
there are no upcoming events.

- [X] T005 [P] [US1] Add `sort?: 'newest'` to `EventsQuery` in `product-rest/web-cbar-new/src/features/events/api/events.api.ts`
- [X] T006 [P] [US1] Make the MSW handler honour `sort=newest` (start date desc, time desc with no time last, title) in
  `product-rest/web-cbar-new/src/shared/testing/handlers/events.ts`
- [X] T007 [US1] Request `getEvents(locale, { sort: 'newest', pageSize: CALENDAR_EVENTS_MAX })` instead of `when: 'upcoming'` in
  `product-rest/web-cbar-new/src/views/home/loader.ts` (rename the `upcoming` settle variable to `calendarEvents`); update the comment in
  `product-rest/web-cbar-new/src/views/home/constants.ts`
- [X] T008 [US1] Update `product-rest/web-cbar-new/src/views/home/loader.test.ts`: the calendar holds the three newest by start date in
  descending order (a past event included), the request carries `sort=newest` and no `when`; failure/empty still gives `[]`

**Checkpoint**: the block shows the right three events; clicking the title already works.

---

## Phase 4: User Story 2 — sətir tədbirə, başlıq siyahıya aparır (Priority: P1)

**Goal**: the whole row is one link to the event; the "Təqvim" heading links to `/media/events` (contracts/ui-contract.md).

**Independent Test**: `widgets/home-cards/home-cards.test.tsx`: each row has exactly one link named after the event title with the event
href; the heading link points to the events list; `views/home/index.test.tsx` still finds `[data-slot="event-calendar"]`.

- [X] T009 [US2] In `product-rest/web-cbar-new/src/widgets/home-cards/event-calendar.tsx`: `href: string` (drop the `null` branch), `li`
  becomes `group relative`, the title link stretches over the row (`after:absolute after:inset-0`) with the focus ring on the pseudo-element and
  `group-hover` underline; new prop `listHref` makes the `<h2>` text a link; English comments
- [X] T010 [US2] Pass `listHref={data.calendarHref}` in `product-rest/web-cbar-new/src/views/home/index.tsx` and set
  `calendarHref: eventsListHref(locale)` in `HomeData` in `product-rest/web-cbar-new/src/views/home/loader.ts`
- [X] T011 [US2] Update `product-rest/web-cbar-new/src/widgets/home-cards/home-cards.test.tsx`: the existing calendar test with `href`, plus one
  test that every row has one link (name = title, href = event address) and that the heading "Təqvim" is a link to `/az/media/events`; fix any
  other `EventCalendar`/`HomeData` fixtures (`views/home/index.test.tsx`)
- [X] T012 [US2] Review: `ui-kit-review` + the senior-front review checklist on the changed files of Phases 3–4 against plan.md "Frontend Skills
  Gate" (one tab stop per row, no nested interactive, kit tokens, no magic numbers)
- [X] T013 [US2] `npm run verify` in `product-rest/web-cbar-new` (from PowerShell; also run `npx vitest run` on Node 22 if available)

**Checkpoint**: web-cbar-new can be merged after api-cbar is deployed.

---

## Phase 5: Polish & Cross-Cutting

- [X] T014 [P] Update the home page bullet in root `CLAUDE.md` (events section, spec 034) with the newest-by-date order and the `sort=newest`
  parameter
- [X] T015 [P] Measure the block in a browser at 1440 px against Figma `813:25284` (box 424, row ≥ 107, date box 74) and check Tab order
  (quickstart §2)
- [X] T016 Sync `business_logic/new_business_logic.md` for the home calendar (via `/sync-business-logic` or by hand, same wording as the spec)

---

## Dependencies & Execution Order

- Phase 2 (api-cbar) → Phase 3 (US1 needs `sort` in the API for real data; MSW covers the tests, so code can start in parallel)
- Phase 3 and Phase 4 touch `loader.ts` both (T007, T010): do them in order
- Phase 5 after Phase 4

### Parallel Opportunities

- T005 and T006 (different files)
- T014 and T015

## Implementation Strategy

1. Phase 2 → deploy api-cbar to test.
2. Phase 3 (MVP: right events), Phase 4 (click), verify, deploy web-cbar-new.
3. Phase 5 docs and measuring.
