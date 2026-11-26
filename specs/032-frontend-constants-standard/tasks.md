---
description: "Task list — 032 Frontend sabitlər standartı (web-cbar-new, web-cbar-admin-new, workspace)"
---

# Tasks: Frontend sabitlər standartı — magic number yoxdur

**Input**: `specs/032-frontend-constants-standard/` — [spec.md](./spec.md), [plan.md](./plan.md),
[research.md](./research.md), [contracts/constants-contract.md](./contracts/constants-contract.md)

**Branch**: `feature/032-frontend-constants-standard`. Yollar `product-rest/`-ə nisbətəndir.

**Ümumi qaydalar**: davranış və rəqəm dəyərləri dəyişmir; yeni şərhlər ingiliscə; köçürülən sabitin köhnə
yerdə re-export-u qalmır; `prettier --write` yoxdur; commit yalnız istifadəçi istəyəndə.

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Setup

- [x] T001 Spec-kit sənədləri: spec, plan, research, tasks, contracts/constants-contract
- [x] T002 Quru lint qaçışı hər iki layihədə → tapıntı siyahısı (research R1)

## Phase 2: web-cbar-new (US1, US2)

- [x] T003 [P] `src/shared/constants/` — pagination, time, timing, cache, http, headers, query-params, layout, text, files, limits
- [x] T004 [P] Slice `constants.ts`: entities/content/lib, features/{stats,currencies,about-content,organization}/model,
  views/{press-releases,home,statistics,media-videos}, widgets/{home-cards,chart-card,org-chart,about-blocks,list-pagination}, shell
- [x] T005 Miqrasiya: app route-ları (`HTTP_STATUS`), `proxy.ts`/`layout.tsx` (`LOCALE_HEADER`), loader-lər (`EXCERPT_LENGTH`,
  `DEFAULT_PAGE_SIZE`), `entities/content` (ISO_DATE, splitFileSize), stats/currencies/about-content/organization, providers,
  server, shared/api|config|lib, shell (loqo, nav), widgets (chart, org-chart, history, pagination), `sizes=` dublikatları
- [x] T006 `eslint.config.mjs`: `konstitusiya/sabitler` (`SABIT_FAYLLARI`, `SABIT_QAYDASI`)
- [x] T007 `scripts/lint-rules.test.mjs`: 2 tutma halı (literal, obyekt dəyəri) + 1 keçmə halı
- [x] T008 Testlər: `press-releases.test.tsx` → `NEWS_PAGE_SIZE`; `laws/meas/press-releases.api.test.ts` → `DEFAULT_PAGE_SIZE`;
  `media-proxy.test.ts`, `nav*.test`, `history-stepper.test` yeni import yolları
- [x] T009 Gate: `npx eslint` 0 tapıntı, `tsc --noEmit` 0, `vitest run` 1005/1005 (lint-rules faylı tək 13/13;
  tam qaçışda bir dəfə 15 s timeout — maşın yüklü idi)
- [x] T010 `npm run verify` (Node 24) keçir, Node 22.23.2-də `vitest run` 1005/1005 (ilk `verify` `next.config.ts` → `security-headers.ts`-dəki `@/` alias importunda qırıldı — nisbi importa çevrildi)
- [x] T011 Sənəd: konstitusiya 2.2.0 Maddə XII, `CLAUDE.md`, `frontend-standards/SKILL.md`

## Phase 3: web-cbar-admin-new (US1, US2)

- [x] T012 [P] `src/shared/constants/` — pagination, timing, http, storage, files, limits, ui
- [x] T013 [P] Slice `model/constants.ts`: entities/user, features/{azir,currency,homepage,inflation,media,org-chart,organization,
  pages,press-releases,rich-text,yield-curves}, pages/settings
- [x] T014 Miqrasiya: 158 tapıntı; `STATUS_CODES` ← `HTTP_STATUS`; `PRESS_RELEASE_TYPE`; `XLSX_ACCEPT` dublikatı; debounce; stale
- [x] T015 `eslint.config.js`: ikinci obyekt, eyni opsiyalar; `ignores` + `features/crud/fixtures/**`
- [x] T016 Testlər: handler defoltları `DEFAULT_PAGE_SIZE`/`LARGE_PAGE_SIZE`; görünən mətn iddiaları qalır
- [x] T017 Gate: `npx eslint` 0, `npm run verify` keçir, 500/500 (Node 24 və Node 22)
- [x] T018 Sənəd: konstitusiya 1.4.0 Maddə XI, `CLAUDE.md`, `frontend-standards/SKILL.md`

## Phase 4: Workspace (US3)

- [x] T019 Root `CLAUDE.md` "Frontend skills" bəndinə 032 cümləsi
- [x] T020 `.claude/skills/senior-front/references/code-smells.md` — "Magic Number / Magic String" smell-i
- [x] T021 `FIGMA-REDIZAYN-PLANI.md` — "Harada qaldım (032)", qərarlar, mərhələlər

## Phase 5: Yekun

- [ ] T022 Göz yoxlaması `local:testcbar`: `/az/press-releases` 9 kart, admin siyahı 20 sətir
- [ ] T023 Commit-lər (plan "Mərhələlər"), 2 MR
