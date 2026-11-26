# Specification Quality Checklist: Ana səhifənin "Strategiya və sənədlər" bloku — admin paneldən idarə

**Purpose**: Validate specification completeness and quality before proceeding to planning
**Created**: 2026-11-23
**Feature**: [spec.md](../spec.md)

## Content Quality

- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

## Requirement Completeness

- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] Success criteria are technology-agnostic (no implementation details)
- [x] All acceptance scenarios are defined
- [x] Edge cases are identified
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

## Feature Readiness

- [x] All functional requirements have clear acceptance criteria
- [x] User scenarios cover primary flows
- [x] Feature meets measurable outcomes defined in Success Criteria
- [x] No implementation details leak into specification

## Notes

- The spec names files, Figma nodes and target components (`mock.ts`, `dokumentasiyalar/…`, `api-cbar-admin` …). The constitution requires
  this (I.2 target projects and the replaced Yii2 part, I.3 parity table, II.3 deploy order), and specs 050–056 do the same. Requirements
  still describe behaviour, not code.
- How the site gets the documents (inside the existing homepage response or as its own request) is left to the plan on purpose (Assumptions).
- The four user decisions of 2026-11-23 are written into the spec header, together with the four agent defaults the user can change.
- 2026-11-23, second pass: US4 was added (decisions 9–11): the card target pages, page 104 text from the legacy `/pages/strategy`, the import tool and
  the legacy redirects (FR-021…FR-025, SC-007, SC-008). Re-validated: all items still pass. FR-021…FR-025 sit before FR-020 ("Sənədlər") on purpose,
  so the documentation requirement stays last.
- 2026-11-24, T059 final check (implementation, not spec quality; the markers above are unchanged):
  - SC-001 (≤ 2 min for an editor): not timed. The flow is one form plus the "Sıranı dəyiş" dialog (`strategy-docs.test.tsx`); measure with an editor.
  - SC-002 (admin change on the next homepage open): by design. `/homepage` is requested on every page view, the site's cache is at most 10 s
    (new §12 #41); covered on PGlite in US2. Not live on test: the admin and public APIs with spec 057 are not deployed there yet (drift: 6 routes).
  - SC-003 (three documents after migration, both locales): ✓ on PGlite (T041). On test after deploy (`0044`).
  - SC-004 (≤ 2 px at 1728 / 744 / 390, no horizontal scroll): ✓ T039.
  - SC-005 (no card with a dead link): ✓ by construction. `api-cbar` drops a document without a working link in the locale (`StrategyDocLinks`,
    `StrategyDocLinksTests`); the panel marks it "Keçid işləmir".
  - SC-006 (editor mistakes are not saved): ✓ `StrategyDocRulesTests` (68 admin xUnit tests pass) and the panel's form tests.
  - SC-007 (every paragraph, signature and PDF of the legacy letter on page 104): ✓ on test (T053 + `.tmp-057/sc007.mjs`): 17/17 legacy chunks in
    az and in en, the locale's PDF (2356 / 2357) and the portrait (2355) present. Visual: portrait right, full width below 744 after T061.
  - SC-008 (five legacy addresses, one redirect, working page): ✓ on the local site against the test API: `/pages/strategy` (+ `/en`,
    `?language=en`), `/page-872/x`, `/page-878`, both PDFs → one 308, final 200.
  - Gates: both full `verify` runs green (site 174 files / 1704 tests; admin 70 / 719 — two earlier admin runs failed on 5 s lazy-route timeouts
    in untouched features while the two verifies ran in parallel; a full run alone passed),
    the same suites green on Node 22, xUnit 68 + 35, OpenAPI lint + route-diff clean, `Cbar.Domain` sources identical.
