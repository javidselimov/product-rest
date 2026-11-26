# Feature Specification: Frontend sabitlər standartı — magic number yoxdur, sabitlər `constants` qovluğunda

**Feature Branch**: `032-frontend-constants-standard`

**Created**: 2026-11-03

**Status**: Draft

**Input**: İstifadəçi frontend standartlarına yeni qayda istəyir: **magic number işlənmir, sabitlər ayrıca
`constants` qovluğunda saxlanılır**. Qayda hər iki frontend-də (`web-cbar-new`, `web-cbar-admin-new`) tətbiq
olunur və bundan sonrakı bütün dəyişikliklərdə nəzərə alınır — yəni yalnız sənəd yox, **skill + lint gate**.

**Hazırkı vəziyyət** (2026-11-03, araşdırma): heç bir layihədə `constants` qovluğu və `no-magic-numbers`
qaydası yoxdur. Adlı sabitlər var, amma işləndiyi modulun içindədir (web ~45, admin ~60 `SCREAMING_CASE`
export) və bir neçəsi təkrarlanır: web-də `LOCALE_HEADER` 2 yerdə, `86_400_000` 2, excerpt `160` 4,
`pageSize = 10` ~9, loqo `228×56` 3, eyni `sizes=` sətri 3; admin-də debounce `400` 4, `pageSize: 20` 5,
`XLSX_ACCEPT` 2, `60_000` 2. Quru lint qaçışı (`@typescript-eslint/no-magic-numbers`, testlər xaric,
`detectObjects`) **web 121** (xlsx yazıcısı xaric), **admin 158** tapıntı verdi.

**İstifadəçi qərarları (2026-11-03)**: iki pilləli yerləşmə (`shared/constants/<mövzu>.ts` + slice
`constants.ts`); `shared/config/` toxunulmur (konfiq ≠ sabit); lint `error` və tam miqrasiya; magic
string-lər konvensiya ilə; Tailwind `[Npx]` dəyərləri əhatədən kənar; hook yoxdur — `verify`-dəki lint kifayətdir.

**Əhatə olunan proyektlər** (Konstitusiya Maddə II — hər biri ayrıca MR):

- `web-cbar-new`: `src/shared/constants/` (11 fayl), 16 slice `constants.ts`, 121 tapıntının miqrasiyası,
  `eslint.config.mjs` `konstitusiya/sabitler`, `scripts/lint-rules.test.mjs`, konstitusiya **2.2.0**
  (Maddə XII), `CLAUDE.md`, `frontend-standards` skill-i.
- `web-cbar-admin-new`: `src/shared/constants/` , slice `model/constants.ts`-lər, 158 tapıntının miqrasiyası,
  `eslint.config.js` qaydası, konstitusiya **1.4.0** (Maddə XI), `CLAUDE.md`, `frontend-standards` skill-i.
- Workspace: bu spec, root `CLAUDE.md` bir cümlə, `senior-front/references/code-smells.md` "Magic Number"
  smell-i, `FIGMA-REDIZAYN-PLANI.md` tracker.
- `api-cbar`, `api-cbar-admin`: **dəyişmir**.

**Deploy sırası**: asılılıq yoxdur — davranış dəyişmir (refactor), iki müstəqil frontend MR-ı.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Developer yeni kodda rəqəm yazır və lint onu dayandırır (Priority: P1)

Developer siyahı komponentinə `pageSize: 20` və ya `setTimeout(fn, 400)` yazır. `npm run lint` (və
`verify`) `@typescript-eslint/no-magic-numbers` xətası verir; developer dəyəri `constants` faylına çıxarır və
import edir — lint keçir.

**Why this priority**: Standartın "bundan sonra həmişə" hissəsi yalnız avtomatik gate ilə ödənir
(konstitusiya VI — sənədə güvənmək kifayət deyil).

**Independent Test**: `scripts/lint-rules.test.mjs` (web) — literal `20` xəta verir, `constants.ts`-dən import
edən eyni kod keçir; admin-də `npx eslint` ilə eyni iki fayl.

**Acceptance Scenarios**:

1. **Given** `src/features/x/model/module.ts`-də `{ pageSize: 20 }`, **When** lint işləyir, **Then**
   `No magic number: 20` xətası (obyekt dəyəri də tutulur — `detectObjects`).
2. **Given** eyni dəyər `src/features/x/model/constants.ts`-də `export const X_PAGE_SIZE = 20` və module-da
   import, **When** lint, **Then** xəta yoxdur.
3. **Given** `0`, `1`, `-1`, `2`, `100` və massiv indeksi, **When** lint, **Then** xəta yoxdur (istisna siyahısı).
4. **Given** `*.test.ts(x)` və ya `shared/testing/**` faylında `total: 25`, **When** lint, **Then** xəta yoxdur.

### User Story 2 — Mövcud təkrar sabitlər bir mənbəyə yığılır (Priority: P1)

Hər layihədəki təkrarlanan dəyər (`160`, `pageSize = 10`, `LOCALE_HEADER`, `DAY_MS`, debounce `400`,
`pageSize: 20`, `XLSX_ACCEPT`) tək fayldan oxunur; dəyəri dəyişmək bir sətirlik işdir.

**Independent Test**: `rg -n "86_400_000|\b160\b|pageSize = 10" src` web-də, `rg -n "400\)|pageSize: 20" src`
admin-də yalnız `constants` fayllarında tapır (research.md §Dublikat siyahısı).

**Acceptance Scenarios**:

1. **Given** miqrasiya bitib, **When** hər layihədə `npx eslint "src/**/*.{ts,tsx}"`, **Then** 0 tapıntı.
2. **Given** `EXCERPT_LENGTH` dəyişdirilir, **When** `grep 160`, **Then** başqa yerdə tapılmır.
3. **Given** miqrasiya, **When** test dəstləri işləyir, **Then** say və nəticə dəyişmir (davranış reqressiyası yoxdur).

### User Story 3 — Agent / skill standartı yeni işdə tətbiq edir (Priority: P2)

`frontend-standards` skill-i, konstitusiya və `CLAUDE.md` qaydanı, qovluq ağacını, anti-pattern-i və checklist
bəndini daşıyır; `senior-front` "Magic Number / Magic String" smell-ini adlandırır. Yeni spec/plan artefaktları
Constitution Check-də bu maddəyə baxır.

**Independent Test**: skill mətnində "constants" ağacı və checklist bəndi var; konstitusiya versiya sətirləri
2.2.0 / 1.4.0; Sync Impact Report yenilənib.

### Edge Cases

- **Bayt formatı** (`shared/lib/xlsx`: zip siqnaturları, ofsetlər, CRC cədvəli) — rəqəmin özü formatdır;
  fayl başında səbəbli `eslint-disable` + lint `ignores`.
- **Figma birdəfəlik ölçüsü** className-də (`h-[114px]`) — lint-dən kənar (string); ≥ 2 yerdə təkrarlananda
  `@theme` token-i (əhatədən kənar, ayrıca spec).
- **Regex, className sətirləri, lookup cədvəlləri** (`MIME_EXTENSION`, `FEATURE_ROUTES`) — sabit deyil,
  modul-lokal məlumatdır; yerində qalır.
- **Sıra nömrəsi kimi işlənən kiçik rəqəmlər** (`toImage(cover, 1)`, `i + 2`) — `ignore` siyahısı örtür;
  `3`+ olanda ad verilir (`FULL_ROW_CARDS`, `TALL_LAYOUT_IMAGES`).
- **Nömrəli obyekt açarları** (`KIND_CLASS[3]`) — açar da tutulur; `[ORG_CHART_KIND.director]` ilə yazılır.

## Requirements *(mandatory)*

### Functional Requirements

**Yerləşmə və adlandırma (hər iki layihə)**

- **FR-001** Cross-cutting sabitlər `src/shared/constants/<mövzu>.ts`-dədir (`pagination`, `time`, `timing`,
  `http`, `headers`, `query-params`, `layout`, `text`, `cache`, `files`, `limits`; admin-də `storage`, `ui`).
  **Barrel yoxdur** — import fayl üzrə: `@/shared/constants/pagination`.
- **FR-002** Domen/slice sabiti öz slice-ında `constants.ts`-dədir: `features/<x>/model/constants.ts`;
  web-də `views/<x>/constants.ts`, `widgets/<x>/constants.ts`, `shell/constants.ts`,
  `entities/<x>/lib/constants.ts`. Slice-dan kənarda lazım olanda `shared/constants`-a qalxır (FSD IV.5:
  `shared` biznes-spesifik ad daşımır — `NEWS_PAGE_SIZE` view-dadır, `DEFAULT_PAGE_SIZE` shared-dədir).
- **FR-003** Ad `SCREAMING_SNAKE_CASE`; vahid adda (`_MS`, `_PX`, `_SECONDS`, `_DAYS`); qrup obyektləri
  `as const` (`HTTP_STATUS`, `ISO_DATE`, `LOGO_SIZE`). Hər sabitin bir sətirlik ingiliscə doc-comment-i var
  (dəyərin *niyə* bu olduğunu deyir, nə olduğunu yox).
- **FR-004** `shared/config/` (brand, contacts, security-headers, runtime-config) **konfiqdir** — məhsul/brend/mühit
  dəyəri; `shared/constants/` texniki literal-lardır. Konfiq faylı öz içində rəqəm işlədəndə o da adlı sabitdən gəlir.

**Lint gate**

- **FR-005** `@typescript-eslint/no-magic-numbers: error`, hər iki layihədə eyni opsiyalar:
  `ignore: [0, 1, -1, 2, 100]`, `ignoreArrayIndexes`, `ignoreEnums`, `ignoreNumericLiteralTypes`,
  `ignoreReadonlyClassProperties`, `ignoreTypeIndexes`, `enforceConst`, **`detectObjects: true`**.
- **FR-006** İstisna fayllar: `**/*.test.{ts,tsx}`, `src/shared/testing/**`, `src/shared/constants/**`,
  `**/constants.ts`; web-də əlavə `src/shared/lib/xlsx/**` (fayl başında səbəb).
- **FR-007** `npm run verify` hər iki layihədə bu qaydanı icra edir (lint addımı); hook əlavə olunmur.
- **FR-008** Web `scripts/lint-rules.test.mjs` iki tutma halı (literal; obyekt dəyəri) və bir keçmə halı
  (`constants.ts` + import) saxlayır.

**Magic string-lər (konvensiya)**

- **FR-009** Lint ilə tutulmur; qayda kontraktdadır: sorğu parametr adları (`QUERY_PARAM`), xüsusi header adları
  (`LOCALE_HEADER`), storage/channel açarları, HTTP status kodları (`HTTP_STATUS`), növ kodları
  (`PRESS_RELEASE_TYPE`, `ORG_CHART_KIND`, `STAFF_TYPE`), status sətirləri (`CONTENT_STATUS`) sabitdir.
  Miqrasiya bunları da çıxarır.

**Testlər**

- **FR-010** Konfiqurasiya dəyərini yoxlayan test sabiti import edir (`NEWS_PAGE_SIZE`, `DEFAULT_PAGE_SIZE`,
  `REFRESH_MARGIN_MS`), literal yox. Fikstür məlumatı (tarix, id, ölçü, `total: 25`) literal qala bilər.

**Miqrasiya**

- **FR-011** Tam: hər iki layihə 0 lint tapıntısı ilə bitir; heç bir rəqəmin dəyəri dəyişmir; davranış dəyişmir.
- **FR-012** Köçürülən mövcud adlı sabitin köhnə yerdə re-export-u qalmır; importçular yeni yola keçir.

**Sənəd / skill**

- **FR-013** Hər layihənin konstitusiyasına yeni maddə (web **XII**, admin **XI** — "Sabitlər"), MINOR bump
  (2.2.0 / 1.4.0), Sync Impact Report.
- **FR-014** Hər layihənin `CLAUDE.md` (§2 ağacı + qayda) və `.claude/skills/frontend-standards/SKILL.md`
  (ağac, anti-pattern, checklist, konstitusiya versiyası) yenilənir.
- **FR-015** Root `CLAUDE.md` "Frontend skills" bəndində bir cümlə; `senior-front/references/code-smells.md`
  "Magic Number / Magic String" smell-i → `refactorings.md` "Replace Magic Number with Symbolic Constant".

### Key Entities

- **Sabit (constant)** — kodun davranışını və ya ölçüsünü təyin edən, kompilyasiya zamanı məlum literal;
  adlıdır və `constants` faylındadır.
- **Konfiq (config)** — məhsul/brend/mühit dəyəri (`brand.displayName`, `API_URL`); `shared/config/` və env.
- **Fikstür** — test məlumatı; literal sərbəstdir.

## Success Criteria *(mandatory)*

- **SC-001** `npx eslint "src/**/*.{ts,tsx}"` hər iki layihədə **0** tapıntı (qayda konfiqdədir).
- **SC-002** `npm run verify` hər iki layihədə yaşıl (Node 24 + Node 22-də `vitest run`).
- **SC-003** research.md-dəki dublikat siyahısının hər bəndi yalnız bir `constants` faylında tapılır.
- **SC-004** Test sayı yalnız lint-rules halları qədər artır (web 1002 → 1005); davranış testləri dəyişmir.
- **SC-005** Konstitusiya versiya sətirləri və Sync Impact Report yenilənib; `frontend-standards` skill-i
  qaydanı sitat gətirir; `/az/press-releases` 9 kart, admin siyahı 20 sətir (göz yoxlaması).

## Əhatədən kənar

- Tailwind `[Npx]` dəyərlərinin `@theme` token-laşdırılması (154 mövcud dəyər) — ayrıca spec.
- Magic string üçün lint qaydası (`no-restricted-syntax` ilə string literal) — səs-küy həddən artıqdır.
- Admin konstitusiyası VIII-dəki köhnəlmiş `/config.json` cümləsi — tracker-ə tapıntı, burada düzəldilmir.
- `.NET` API-ləri.

## Assumptions

- `@typescript-eslint/eslint-plugin` hər iki layihədə mövcuddur (web: `eslint-config-next/typescript`;
  admin: `typescript-eslint`) — yeni dependency yoxdur.
- Spec nömrəsi 032 boşdur; 018 cross-cutting standart nümunəsidir.
