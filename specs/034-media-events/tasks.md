---
description: "Task list — 034 Media → Tədbirlər: yeni məzmun növü, admin bölməsi, sayt və ana səhifə Təqvimi (api-cbar-admin, api-cbar, web-cbar-admin-new, web-cbar-new)"
---

# Tasks: Media → Tədbirlər

**Input**: `specs/034-media-events/` — [spec.md](./spec.md), [plan.md](./plan.md), [research.md](./research.md),
[data-model.md](./data-model.md), [contracts/public-api.md](./contracts/public-api.md),
[contracts/admin-api.md](./contracts/admin-api.md), [contracts/ui-contract.md](./contracts/ui-contract.md),
[quickstart.md](./quickstart.md)

**Branch**: `main` (istifadəçi qərarı). Yollar `product-rest/`-ə nisbətəndir, başqa cür göstərilməyibsə.

**Testlər**: iki frontend üçün yazılır, çünki `npm run verify` merge şərtidir və spec-in hər story-si testlə ölçülür. Funksional:
rol və etiket, `userEvent`, MSW. Əvvəl test, qırmızı olduğu görülür, sonra kod. API-lərdə test layihəsi yoxdur: build + route-diff +
test mühitində icra.

**Ümumi qaydalar**

- Kod şərhləri ingiliscədir. Dəyişilən faylda azərbaycanca şərhlər də çevrilir.
- Commit yalnız istifadəçi istəyəndə.
- Spec 032: magic number və magic string yoxdur. Yeni runtime dependency yoxdur.
- `web-cbar-new`-də `prettier --write` işlədilmir.
- Faylların çoxu CRLF-dir: `sed -i` işlədilmir, redaktə Edit alətilə və ya Node ilə. Azərbaycan mətni shell ilə yazılmır.
- `verify` nəticəsi `tail`-dən yox, exit code ilə oxunur. Docker-ə toxunulmur.
- Endpoint dəyişikliyi spec-first-dir: əvvəl `openapi/`, hook route-u yoxlayır (`.claude/skills/api-endpoint`).

**MR xəritəsi** (Konstitusiya II.3, deploy sırası ilə): A `api-cbar-admin` → B `api-cbar` → C `web-cbar-admin-new` → D `web-cbar-new`.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: paralel icra oluna bilər (ayrı fayl, bitməmiş tapşırıqdan asılı deyil)
- **[Story]**: US1 admin, US2 gələcək siyahı, US3 arxiv, US4 detal, US5 Təqvim, US6 köhnə data

---

## Phase 1: Setup

**Purpose**: Gündəlik və kontraktlar

- [X] T001 Root `FIGMA-REDIZAYN-PLANI.md`-yə "Harada qaldım (034)" əlavə et: 6 istifadəçi qərarı, "⛔ Bloklanan (034)" (API yalnız test deployunda yoxlanır, prod slug-ları ölçülməyib, 2 təxmini tarix)
- [X] T002 [P] `api-cbar-admin/openapi/paths/events.yaml` yaz, `api-cbar-admin/openapi/openapi.yaml`-a route-ları və sxemləri əlavə et (`contracts/admin-api.md`); lint + bundle
- [X] T003 [P] `api-cbar/openapi/paths/events.yaml` yaz, `api-cbar/openapi/openapi.yaml`-a route-ları və sxemləri, `search` cavabına `event` tipini əlavə et (`contracts/public-api.md`); lint + bundle

---

## Phase 2: Foundational

**Purpose**: Sxem və icazələr. Bütün story-lər bundan asılıdır.

**⚠️ CRITICAL**: Bu faza bitmədən story-yə başlanmır.

- [X] T004 `api-cbar-admin/db/migrations/0018-events.sql` yaz: 4 cədvəl, CHECK-lər, indekslər, şərti FK-lar (`0017` nümunəsi), `cbar_web_ro` grant-ı, 4 icazə + moderator sətirləri (`0009` nümunəsi), `data-model.md`
- [X] T005 `api-cbar-admin/src/Cbar.Domain/Entities/Event.cs` yarat (`Event`, `EventTranslation`, `EventCategory`, `EventCategoryTranslation`) və `api-cbar-admin/src/Cbar.Domain/CbarDbContext.cs`-ə `DbSet`, xəritə, `HasQueryFilter` əlavə et
- [X] T006 T005-in eyni dəyişikliyini `api-cbar/src/Cbar.Domain/`-a köçür; `diff -r` boş olmalıdır
- [X] T007 `api-cbar-admin/src/Cbar.AdminApi/Authorization/Permissions.cs`-ə `Events` sinfini və `All` siyahısına 4 kodu əlavə et; `dotnet build` hər iki API

**Checkpoint**: Hər iki API build olur, miqrasiya sintaksisi `0017` ilə uyğundur.

---

## Phase 3: User Story 1 — Redaktor tədbirləri idarə edir (Priority: P1) 🎯 MVP

**Goal**: Panel və admin API tədbir və bölmələri tam idarə edir.

**Independent Test**: MSW ilə yaratmaq, redaktə, silmək, filtr, bağlılıq seçmək, səhv form, `409`, icazəsiz istifadəçi.

### Admin API (MR A)

- [X] T008 [US1] `api-cbar-admin/src/Cbar.AdminApi/Controllers/EventCategoriesController.cs` yarat: CRUD, audit, istifadədə olanda `ConflictProblem`
- [X] T009 [US1] `api-cbar-admin/src/Cbar.AdminApi/Controllers/EventsController.cs` yarat: list, detail, create, update, soft-delete, audit, `SlugService`/`UniqueSlug`, `400` qaydaları (`contracts/admin-api.md`)

### CRUD mühərriki (MR C)

- [X] T010 [P] [US1] Test: `time` sahəsi, `web-cbar-admin-new/src/shared/crud/` testlərində
- [X] T011 [US1] `web-cbar-admin-new/src/shared/crud/types.ts`, `form-model.ts`, `schema.ts`-ə `time` tipini və `searchable` bayrağını əlavə et (`research.md` R9)
- [X] T012 [US1] `web-cbar-admin-new/src/features/crud/components/field-control.tsx`-də `time` (`Input type="time"`) və axtarışlı `select` (kit `Combobox`, başlanğıc etiket detail-dən) render et

### Bölmələr və Tədbirlər (MR C)

- [X] T013 [P] [US1] `web-cbar-admin-new/src/shared/testing/handlers/events.ts` və `event-categories.ts` yaz (real kontrakt), `handlers/index.ts`-ə qoş
- [X] T014 [P] [US1] Test `web-cbar-admin-new/src/features/events/events.test.tsx`: siyahı, yaratmaq, silmə `409` mesajı
- [X] T015 [P] [US1] Test `web-cbar-admin-new/src/features/events/events.test.tsx`: Acceptance 1–6 (US1), `endsOn < startsOn`, `scheduled` seçimdə yoxdur
- [X] T016 [US1] Bölmələr modulu `web-cbar-admin-new/src/features/events/model/module.ts`-də (`features/laws` nümunəsi, ayrıca feature yox)
- [X] T017 [US1] `web-cbar-admin-new/src/features/events/{api,model}/` və `src/pages/events/` yarat: `schemas.ts`, açarlar, `constants.ts`, `module.ts`, seçimlər `LookupGate` ilə (R9)
- [X] T018 [US1] `web-cbar-admin-new/src/app/routes/index.ts` (`createCrudRoutes` + `registerModule`), `nav.ts` (media qrupu), `shared/i18n` resurslarına iki modulu qoş
- [X] T019 [P] [US1] `web-cbar-admin-new/src/locales/{az,en}/events.json`, `nav.json`, `crud.json` mətnləri; `npm run check:i18n`

**Checkpoint**: `npm run verify` panel üçün yaşıl, `dotnet build` yaşıl.

---

## Phase 4: User Story 2 — Ziyarətçi gələcək tədbirləri görür (Priority: P1)

**Goal**: `/media/events` gələcək tab, filtrlər, aylara qruplaşma.

**Independent Test**: MSW ilə qruplaşma, sıra, hər filtr, təmizləmə, boş vəziyyət, bölmə variantları.

### Public API (MR B)

- [X] T020 [US2] `api-cbar/src/Cbar.WebApi/Controllers/EventsController.cs` yarat: `GET events`, `GET event-categories`, `BakuOffset`, süzgəc, sıra, `pageSize` tavanı 500, `upcoming`, `pageSlug` (`contracts/public-api.md`)

### Sayt (MR D)

- [X] T021 [P] [US2] `web-cbar-new/src/shared/testing/fixtures/events.ts`, `handlers/events.ts` yaz, `handlers/index.ts`-ə qoş
- [X] T022 [P] [US2] Test `web-cbar-new/src/views/media-events/index.test.tsx`: Acceptance 1–7 (US2), tanınmayan parametrlər
- [X] T023 [P] [US2] Test `web-cbar-new/src/features/events/api/events.api.test.ts`: sorğu parametrləri, Zod uyğunsuzluğu
- [X] T024 [US2] `web-cbar-new/src/features/events/model/{schemas,constants}.ts`, `api/events.api.ts` yarat (`server-only`)
- [X] T025 [US2] `web-cbar-new/src/views/media-events/loader.ts` yarat: parametr Zod-u, `Promise.all` (siyahı, bölmələr, ağac), `buildSectionShell`
- [X] T026 [US2] `web-cbar-new/src/views/media-events/index.tsx` və `event-row.tsx`, `events-filter.tsx` yarat: tablar, filtr, qruplar, sətir, boş vəziyyət (`ui-contract.md` §3)
- [X] T027 [US2] `web-cbar-new/src/views/media-events/category-filter.tsx` yarat: üç variant, JS-siz `<details>`; `'use client'` lazım olsa `web-cbar-new/CLAUDE.md` siyahısına əlavə et
- [X] T028 [US2] `web-cbar-new/src/app/[locale]/(content)/media/events/page.tsx` yarat (loader + view + `generateMetadata`)
- [X] T029 [P] [US2] `web-cbar-new/src/locales/{az,en}/media.json`-a `events.*` mətnləri, ay qısaltmaları

**Checkpoint**: Gələcək tab MSW ilə tam işləyir.

---

## Phase 5: User Story 3 — Keçmiş tədbirlər arxivi (Priority: P1)

**Goal**: Keçmiş tab, azalan sıra, "Daha çox göstər", bağlı kart səhifəni açır.

**Independent Test**: MSW ilə sıra, `limit` artımı, `pageSlug`-lı kartın ünvanı, çoxgünlük tarix.

- [X] T030 [P] [US3] Test `web-cbar-new/src/views/media-events/index.test.tsx`-ə Acceptance 1–4 (US3) əlavə et
- [X] T031 [US3] `web-cbar-new/src/features/events/model/format.ts`: tarix qutusu və alt sətir (tək gün, `4–5`, iki ay), test `format.test.ts` ilə
- [X] T032 [US3] `web-cbar-new/src/views/media-events/loader.ts` və `index.tsx`-ə `when=past`, `limit`, "Daha çox göstər", `pageSlug` ünvanını əlavə et

**Checkpoint**: Hər iki tab işləyir.

---

## Phase 6: User Story 4 — Tədbirin detalı (Priority: P2)

**Goal**: Keçmiş və gələcək detal, qalereya, press-reliz linki.

**Independent Test**: MSW ilə vəziyyət kombinasiyaları (`ui-contract.md` §4).

- [X] T033 [US4] `api-cbar/src/Cbar.WebApi/Controllers/EventsController.cs`-ə `GET events/{slug}` əlavə et: `gallery`, `pressRelease`, `pageSlug` (R7)
- [X] T034 [P] [US4] Test `web-cbar-new/src/views/media-event/index.test.tsx`: Acceptance 1–6 (US4), boş bloklar
- [X] T035 [US4] `web-cbar-new/src/features/events/api/events.api.ts`, `model/schemas.ts`-ə detal əlavə et
- [X] T036 [US4] `web-cbar-new/src/views/media-event/{loader.ts,index.tsx}` yarat: `cache()`, `pageSlug` redirect, `trail`, `CmsContent`, `PhotoGallery`, Tarix/Vaxt/Məkan qutuları
- [X] T037 [US4] `web-cbar-new/src/app/[locale]/(content)/media/events/[slug]/page.tsx` yarat (metadata daxil)

**Checkpoint**: Siyahıdan detala tam axın.

---

## Phase 7: User Story 5 — Ana səhifə Təqvimi (Priority: P2)

**Goal**: Mock silinir, Təqvim API-dən oxuyur.

**Independent Test**: 0, 1, 3, 5 tədbir, API xətası.

- [X] T038 [P] [US5] `web-cbar-new/src/views/home/loader.test.ts` və `index.test.tsx`-i yeni davranışa uyğunlaşdır (Acceptance 1–3)
- [X] T039 [US5] `web-cbar-new/src/views/home/mock.ts`-dən `EVENT_SOURCE` və `calendar`-ı sil; `views/home/loader.ts` `features/events` oxusun, xətada boş siyahı; `blocks.ts`, `TODO(api)` şərhi yenilənir
- [X] T040 [US5] `web-cbar-new/src/widgets/home-cards/event-calendar.tsx`: `CalendarEventTag` əvəzinə növ etiketi, `href`; `views/home/index.tsx`-də `tagLabels` çıxarılır; `home-cards.test.tsx` yenilənir

**Checkpoint**: Ana səhifədə kodda yazılmış tarix qalmır.

---

## Phase 8: User Story 6 — Köhnə data itkisiz keçir (Priority: P2)

**Goal**: 6 tədbir yaranır, menyu keçir, 18 səhifə qalır.

**Independent Test**: Deploy-dan əvvəl və sonra 18 səhifənin tutuşdurulması (quickstart Q6).

- [X] T041 [US6] Deploy-dan əvvəl 18 səhifənin ünvan, mətn uzunluğu, şəkil sayı snapshot-ını `specs/034-media-events/content-inventory.md`-yə yaz
- [X] T042 [US6] `api-cbar-admin/db/migrations/0019-events-legacy-seed.sql` yaz: 6 sətir, az slug, `NOT EXISTS (page_id)`, bütün tərcümələrin kopyası, tapılmayana `RAISE NOTICE` (R2)
- [X] T043 [P] [US6] Test `web-cbar-new/src/shell/` və `widgets/section-shell/model.test.ts`: Tədbirlər uşaqları üst və sol menyuda yox, COP29 açılanda sol menyu və breadcrumb qalır
- [X] T044 [US6] `web-cbar-new/src/shell/nav.ts`: `FEATURE_ROUTES`-a `tedbirler`, `events`; `toSection` bu route-un uşaqlarını boşaldır
- [X] T045 [US6] `web-cbar-new/src/widgets/section-shell/model.ts`: alt ağac qaydası (`ui-contract.md` §2, FR-030); fikstür `shared/testing/fixtures/media-section.ts`

**Checkpoint**: Menyu və arxiv köhnə tədbirləri göstərir, səhifələrə toxunulmayıb.

---

## Phase 9: Polish

**Purpose**: Axtarış, sənədlər, yoxlama

- [X] T046 `api-cbar/src/Cbar.WebApi/Controllers/SearchController.cs`-ə tədbirləri əlavə et, yalnız `PageId == null` (R10); `web-cbar-new/src/shared/testing/handlers/search.ts` və axtarış etiketləri
- [X] T047 [P] `dokumentasiyalar/tedbirler-guide.md` yaz, `dokumentasiyalar/README.md`-yə sətir (repo root); təxmini tarixlərin yoxlanması daxil
- [X] T048 [P] `web-cbar-new/docs/media-cms-guide.md`, `CLAUDE.md` (root), `web-cbar-new/CLAUDE.md`, `web-cbar-admin-new/CLAUDE.md`-ə qısa qeyd
- [X] T049 `/sync-openapi` işlət, `route-diff.mjs` fərqsiz olmalıdır
- [X] T050 `/sync-business-logic` işlət: təqvim mock problemi 39 bağlanır
- [X] T051 Quickstart Q1–Q3 (build, `diff`, `verify` hər iki frontend, Node 22 testləri)
- [X] T052 UI-ni Figma ilə tutuşdur (quickstart Q7): 1728, 744, 390. Figma bridge + headless Edge ilə ölçüldü (2026-11-05): desktop fərqsiz idi; tablet/mobil filtr düymələri (336 / 181), mobil sətir (padding 16, gap 14, tarix 60×72), ay başlığı → sətir 12, mobil tab → filtr 32, detalda meta → mətn 20, mobil başlıq 18/26 və fakt bloku 16/24 düzəldildi, bölmə tablarına `#F9F9F9` fon verildi; indi hər üç endə ≤1px. Paylaşılan `section-shell` H1 (mobil 22/28) və `photo-gallery` tablet/mobil ölçüləri 034-ün əhatəsində deyil (ui-contract §6)
- [ ] T053 İstifadəçi deploy edəndən sonra quickstart Q4–Q6; nəticəni `FIGMA-REDIZAYN-PLANI.md`-yə yaz

---

## Dependencies & Execution Order

- **Setup → Foundational → story-lər → Polish.**
- **US1**: yalnız Foundational-dan asılıdır. Sayt story-ləri paneldən asılı deyil (MSW).
- **US2**: Foundational. **US3**: US2-nin view-su üzərində. **US4**: T024-dən asılıdır.
- **US5**: T024-dən asılıdır. **US6**: T042 Foundational-dan, T044–T045 T028-dən sonra.
- **T041** T042-dən və istənilən deploy-dan əvvəl olmalıdır.
- **T053** istifadəçinin deploy-undan asılıdır, kodu bloklamır.

Hər story daxilində: test (qırmızı) → model → API klienti → loader → view.

### Paralel imkanlar

- T002, T003; T010, T013–T015; T021–T023; T043; T047–T048.
- MR A, B bitəndən sonra C və D paralel gedə bilər.

### Parallel Example: User Story 2

```text
Task: "Fixtures və handlers: web-cbar-new/src/shared/testing/fixtures/events.ts"
Task: "View testi: web-cbar-new/src/views/media-events/index.test.tsx"
Task: "API testi: web-cbar-new/src/features/events/api/events.api.test.ts"
```

---

## Implementation Strategy

### MVP

US1 + US2 + US3 + US6: redaktor idarə edir, ziyarətçi siyahını görür, köhnə data keçir. T008–T009 və T020 lazımdır, çünki panel və
sayt real API olmadan deploy olunmamalıdır.

### Mərhələli çatdırılma

1. MR A: miqrasiyalar + admin API. Sayt dəyişmir, köhnə menyu işləyir.
2. MR B: public API.
3. MR C: panel. Redaktor bölmələri yaradır, 6 tədbirin tarixini yoxlayır.
4. MR D: sayt. Menyu avtomatik keçir, Təqvim canlı data ilə işləyir.

Redaktor MR D-dən əvvəl gələcək tədbirləri daxil etsə, Təqvim boş qalmır.

---

## Notes

- `[P]` = ayrı fayl, bitməmiş tapşırıqdan asılılıq yoxdur.
- T006 Domain-in bayt-bayt eyniliyini yoxlayır, sonrakı Domain dəyişikliklərində təkrarlanır.
- Commit yalnız istifadəçi istəyəndə.
