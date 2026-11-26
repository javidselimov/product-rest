---

description: "Task list for spec 021 — AZIR səhifəsi"
---

# Tasks: AZIR səhifəsi — əqd həcmi/sayı, `*` ehtiyat plan, statistika bloku, 60 günlük filtr, Excel export

**Input**: `specs/021-azir-rates-page/` — [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**:
- Frontend proyektlərində (`web-cbar-new`, `web-cbar-admin-new`) Vitest + MSW testləri **məcburidir**: `npm run verify` merge şərtidir (Konstitusiya VIII.2), tələb olunan testlər quickstart §7-dədir.
- API-lərdə avtomatik test yoxdur (VIII.1). Onların yoxlaması test mühitində quickstart §3–§4 ssenariləri ilə aparılır.

**Organization**: hər user story ayrıca fazadır. Story-lər arasında yalnız Phase 2-yə asılılıq var.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: paralel icra oluna bilər (fərqli fayl, tamamlanmamış tapşırıqdan asılı deyil)
- **[Story]**: US1–US6 (spec.md)

## Path Conventions

Bütün yollar `product-rest/` altındadır. 4 upstream repo var:

| Qısa kök | Tam yol | MR |
|---|---|---|
| `api-cbar-admin/` | `product-rest/api-cbar-admin/` | MR 1 |
| `api-cbar/` | `product-rest/api-cbar/` | MR 2 |
| `web-cbar-admin-new/` | `product-rest/web-cbar-admin-new/` | MR 3 |
| `web-cbar-new/` | `product-rest/web-cbar-new/` | MR 4 |

Deploy sırası 1 → 2 → 3 → 4-dür (Konstitusiya II.3, IV.2). API endpoint dəyişiklikləri **spec-first**-dir: əvvəl `openapi/` + `npm run lint && npm run bundle`, sonra controller (`.claude/hooks/spec-first.mjs`).

---

## Phase 1: Setup (baza)

**Purpose**: işə başlamazdan əvvəl yoxlamalar; kod yazılmır.

- [x] T001 ~~Test bazasında sahiblik sorğusu~~. **Ləğv olundu** (2026-10-08): istifadəçi yoldaş cədvəl variantını seçdi, `azir_index_values`-a `ALTER` edilmir, gate lazım deyil (research R1). ID-lər sabit qalsın deyə sətir saxlanılıb.
- [X] T002 [P] Baza vəziyyətini qeyd et: `web-cbar-new/` və `web-cbar-admin-new/`-də `npm run verify` Node 24 **və** Node 22 ilə yaşıldır (memory: CI node:22). Qırmızıdırsa, işə başlamazdan əvvəl səbəbi yaz.
- [X] T003 [P] `node -e "console.log(typeof require('node:zlib').crc32)"` Node 22-də `function` verdiyini yoxla. CI image-in Node versiyasını `web-cbar-new/.gitlab-ci.yml` / Dockerfile-dan təsdiqlə (≥ 22.2; R6). Yoxdursa, T050-də CRC32-ni cədvəl əsaslı köməkçi ilə yaz.

---

## Phase 2: Foundational (bütün story-ləri bloklayır)

**Purpose**: məlumat modeli, kontraktın sahə hissəsi və paylaşılan frontend köməkçiləri.

**⚠️ CRITICAL**: bu faza bitmədən heç bir story başlamır.

### MR 1 — `api-cbar-admin` (sxem)

- [X] T004 `api-cbar-admin/openapi/components/schemas/statistics.yaml`-da `AzirUpsert` request-ə və `AzirItem`/upsert cavabına `dealVolume`, `dealCount`, `minRate`, `maxRate` (nullable) və `isReservePlan` (boolean) əlavə et, `400` cavabına `errors` (`additionalProperties: string[]`) əlavə et ([contracts/admin-api.md](./contracts/admin-api.md)). `api-cbar-admin/openapi/paths/statistics.yaml`-da istinadları yenilə. `cd api-cbar-admin/openapi && npm run lint && npm run bundle` işlət.
- [X] T005 `api-cbar-admin/db/migrations/0008-azir-index-value-details.sql` yarat. Başlıq şərhi `0007-admin-user-security-stamps.sql` üslubunda olsun: niyə ayrıca cədvəl, niyə FK şərtli, niyə backfill yoxdur.
  - `CREATE TABLE IF NOT EXISTS azir_index_value_details`:
    - `azir_index_value_id bigint PRIMARY KEY`;
    - `deal_volume numeric(12,2)`, `deal_count integer`, `min_rate numeric(8,4)`, `max_rate numeric(8,4)`;
    - `is_reserve_plan boolean NOT NULL DEFAULT false`;
    - `updated_at timestamptz NOT NULL DEFAULT now()`;
    - 5 adlı `CONSTRAINT … CHECK` cədvəlin içində (adlar [data-model.md](./data-model.md) §1-də).
  - Şərtli FK: `DO $$ … IF has_table_privilege('azir_index_values','REFERENCES') AND NOT EXISTS (SELECT FROM pg_constraint WHERE conname = 'fk_azir_index_value_details_azir_index_value_id') THEN ALTER TABLE azir_index_value_details ADD CONSTRAINT … FOREIGN KEY (azir_index_value_id) REFERENCES azir_index_values(id) ON DELETE CASCADE; END IF; $$` (`0007:15-25` nümunəsi).
  - Grant: `DO $$ … IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'cbar_web_ro') THEN GRANT SELECT ON azir_index_value_details TO cbar_web_ro; END IF; $$` (`0005-inflation-settings.sql:16-23` nümunəsi).
  - `BEGIN/COMMIT` olmasın; `azir_index_values`-a heç bir `ALTER` olmasın.
- [X] T006 `api-cbar-admin/src/Cbar.Domain/Entities/Statistics.cs`:
  - yeni `AzirIndexValueDetail` sinfi: `AzirIndexValueId` (`long`), `DealVolume` (`decimal?`), `DealCount` (`int?`), `MinRate` (`decimal?`), `MaxRate` (`decimal?`), `IsReservePlan` (`bool`), `UpdatedAt` (`DateTimeOffset`);
  - `AzirIndexValue`-a `public AzirIndexValueDetail? Details { get; set; }` naviqasiyası.

  `api-cbar-admin/src/Cbar.Domain/CbarDbContext.cs`:
  - `DbSet<AzirIndexValueDetail> AzirIndexValueDetails`;
  - `b.Entity<AzirIndexValueDetail>`: `ToTable("azir_index_value_details")`, `HasKey(x => x.AzirIndexValueId)`, `ValueGeneratedNever()`, `HasPrecision(12,2)` / `(8,4)`, migration-a istinad edən şərh (`UserSecurityStamp` `:110-116` nümunəsi);
  - `AzirIndexValue` (`:212-217`): `HasOne(x => x.Details).WithOne().HasForeignKey<AzirIndexValueDetail>(d => d.AzirIndexValueId).OnDelete(DeleteBehavior.Cascade)` ([data-model.md](./data-model.md) §2).
- [X] T007 T006-dakı iki faylı bayt-bayt `api-cbar/src/Cbar.Domain/Entities/Statistics.cs` və `api-cbar/src/Cbar.Domain/CbarDbContext.cs`-ə köçür. `diff -r product-rest/api-cbar-admin/src/Cbar.Domain product-rest/api-cbar/src/Cbar.Domain` boş olmalıdır (Konstitusiya V.1).

### MR 2 — `api-cbar` (public sətir sahələri)

- [X] T008 `api-cbar/openapi/components/schemas/statistics.yaml`-da `AzirValue`-ya yeni sahələri əlavə et; `required`-ə yalnız `isReservePlan` düşür ([contracts/public-api.md](./contracts/public-api.md) §1). `cd api-cbar/openapi && npm run lint && npm run bundle` işlət.
- [X] T009 `api-cbar/src/Cbar.WebApi/Controllers/StatsController.cs:22`-dəki `GetAzir` proyeksiyasına detal sahələrini LEFT JOIN semantikası ilə əlavə et: `dealVolume = v.Details != null ? v.Details.DealVolume : null` (`dealCount`, `minRate`, `maxRate` də eyni qayda ilə), `isReservePlan = v.Details != null && v.Details.IsReservePlan`. Route, query və sıralama dəyişməsin (R3).

### MR 4 — `web-cbar-new` (paylaşılan köməkçilər)

- [ ] T010 [P] `web-cbar-new/src/features/stats/model/schemas.ts`-da `azirValueSchema`-ya `dealVolume`, `dealCount`, `minRate`, `maxRate` (`number|null`, optional) və `isReservePlan` (`boolean`, default `false`) əlavə et. Passthrough saxlanılsın.
- [ ] T011 [P] `web-cbar-new/src/entities/content/lib/numbers.ts` yarat:
  - `formatNumber(value, locale, { minFraction, maxFraction })`;
  - `formatSigned(...)` (`+` / `−`);
  - hər ikisi `Intl.NumberFormat(INTL_LOCALE[locale])` ilə, null → `—`.

  `entities/content` public index-dən export et. Test: `web-cbar-new/src/entities/content/lib/numbers.test.ts` (az vergül, en nöqtə, işarə, null).
- [ ] T012 [P] `web-cbar-new/src/shared/testing/fixtures/stats.ts`-da AZIR fixture-unu quickstart §4 istinad dəsti ilə genişlət: 1D sətirlər, yeni sahələr, `2026-09-11` rate 0, `2026-08-31` işarəli. Əlavə olaraq USD fixture-u ver. `web-cbar-new/src/shared/testing/handlers/stats.ts:74`-də `/azir` handler-inə `from`/`to` filtri əlavə et.

**Checkpoint**: MR 1 sxemi, MR 2 sahələri və frontend köməkçiləri hazırdır, story-lər başlaya bilər.

---

## Phase 3: User Story 1 — 60 günlük 1D cədvəli həcm, say və `*` ilə (Priority: P1) 🎯 MVP

**Goal**: `/{locale}/statistics/azir` açılır: 1D qrafiki, 15.05.2025 xəbərdarlığı, son 60 günün cədvəli (tarix azalan, `rate > 0`), `*` və footnote.

**Independent Test**: MSW fixture ilə `/az/statistics/azir` 60 günlük sətirləri göstərir. Rate 0 olan gün yoxdur, işarəli gündə `*` və footnote var. `/en/...` ingiliscədir (spec US1-in 1–6-cı ssenariləri).

### Tests for User Story 1

- [ ] T013 [P] [US1] `web-cbar-new/src/features/stats/model/azir-rows.test.ts`: 1D filtri, `rate > 0`, tarix azalan, `null` həcm/say saxlanılır, `hasReservePlan` yalnız göstərilən sətirlər üzrə.
- [ ] T014 [P] [US1] `web-cbar-new/src/views/azir/azir.test.tsx` (`views/finance.test.tsx:17-38` nümunəsi, echarts mock, `vi.setSystemTime('2026-10-08')`):
  - default aralıq;
  - cədvəl sırası;
  - `2026-09-11` yoxdur;
  - `2026-08-31`-də `*` var + footnote; işarəsiz aralıqda footnote yoxdur;
  - xəbərdarlıq mətni;
  - `/en` etiketləri;
  - sətir sorğusu 500 → inline xəta.

### Implementation for User Story 1

- [ ] T015 [P] [US1] `web-cbar-new/src/features/stats/model/azir-range.ts` yarat: `defaultAzirRange(today)` (`from = today − 60`, `to = today`, `shiftIsoDate`/`toIsoDate` `entities/content/lib/dates.ts`-dən) və `AzirRange` tipi ([data-model.md](./data-model.md) §6). Parse və xətalar US4-dədir.
- [ ] T016 [P] [US1] `web-cbar-new/src/features/stats/model/azir-rows.ts` yarat: `toAzirTableRows(values)` və `hasReservePlan(rows)` (T013-ü yaşıl edir).
- [ ] T017 [P] [US1] `web-cbar-new/src/features/stats/model/series.ts:179` `azirDailySeries`-ə tam tarix etiketi seçimi (`DD.MM.YYYY`) əlavə et, `series.test.ts`-də yoxla (R10).
- [ ] T018 [US1] `web-cbar-new/src/features/stats/api/stats.api.ts:42`-də `getAzir`-in `{ from, to, term }` ilə çağırılmasını təmin et; `cachedJson` (60 s, tag `stats`) qalır.
- [ ] T019 [US1] `web-cbar-new/src/views/azir/loader.ts` yarat (`import 'server-only'`). `loadAzirPage(locale, range)`:
  - `getAzir({ from, to, term: '1D' })` → `rows` + `chart` (eyni sorğu, `{ data, error }`);
  - `hasReservePlan`;
  - `summary` və `exportHref` üçün yer saxla (US3, US5);
  - `Promise.allSettled` nümunəsi (`views/statistics/loader.ts:25`).
- [ ] T020 [US1] `web-cbar-new/src/views/azir/index.tsx` yarat:
  - `PageTitle`;
  - `ChartCard` + `children`-də kit `Alert` ilə metodologiya xəbərdarlığı;
  - `widgets/data-table/data-table.tsx` ilə 4 sütun (rate `formatNumber` + `%`, işarəlidə ` *`; həcm 2 onluq; say tam);
  - footnote (yalnız `hasReservePlan`);
  - boş vəziyyət `azirPage.empty`.
- [ ] T021 [US1] `web-cbar-new/src/app/[locale]/statistics/azir/page.tsx` yarat (`app/[locale]/statistics/page.tsx:8-22` nümunəsi): `dynamic='force-dynamic'`, `generateMetadata` (`azirPage.title`, `alternates.languages`), `searchParams` qəbul edir; hələlik `defaultAzirRange` ilə `loadAzirPage`.
- [ ] T022 [P] [US1] `web-cbar-new/src/locales/az/finance.json` və `web-cbar-new/src/locales/en/finance.json`-a `azirPage.title`, `methodologyAlert`, `columns.*`, `reserveFootnote`, `empty` açarlarını əlavə et (mətnlər [contracts/web-routes.md](./contracts/web-routes.md) §5-də). `key-parity.test.ts` yaşıl olmalıdır.
- [ ] T023 [US1] `web-cbar-new/src/proxy.ts`-da step 1-dən (`:39`) əvvəl `legacyRedirect(url)` əlavə et. Hələlik baza xəritəsi: `^/(az|en)?/?indeks/rates/?$` (case-insensitive) → `/{locale}/statistics/azir`, `?language=en` → `en`, default `az`, 308, digər query-lər atılır. `web-cbar-new/src/proxy.test.ts`-ə həmin sətirlər üçün testlər yaz ([contracts/web-routes.md](./contracts/web-routes.md) §3).

**Checkpoint**: US1 MSW ilə tam işləyir; T014 və T023 testləri yaşıldır.

---

## Phase 4: User Story 2 — Redaktor gündəlik məlumatı tam daxil edir (Priority: P1)

**Goal**: admin upsert yeni sahələri qəbul edir, validasiya edir, audit-ə yazır; panel onları daxil etməyə, siyahıda görməyə və mövcud sətri formaya yükləməyə imkan verir.

**Independent Test**: panel MSW ilə tam saxlama, işarənin götürülməsi, klient və server validasiyası, prefill ssenariləri keçir. Test mühitində quickstart §3 icra olunur (spec US2-nin 1–5-ci ssenariləri).

### MR 1 — `api-cbar-admin`

- [X] T024 [US2] (ixtiyari) `api-cbar-admin/src/Cbar.AdminApi/Errors/CbarControllerBase.cs`-a `FieldValidationProblem(IDictionary<string,string[]> errors)` köməkçisi əlavə et: `ErrorProblem(400, ilk mesaj, extensions: { errors })` qaytarır, `message` saxlanılır (R2).
- [X] T025 [US2] `api-cbar-admin/src/Cbar.AdminApi/Controllers/AzirController.cs`:
  - `AzirUpsertDto`-ya `decimal? DealVolume`, `int? DealCount`, `decimal? MinRate`, `decimal? MaxRate`, `bool IsReservePlan = false` əlavə et;
  - `Upsert`-də [data-model.md](./data-model.md) §3 qaydalarını camelCase açarlarla `errors`-a yığ (mövcud `Term` yoxlaması da daxil);
  - mövcud sətri `Include(a => a.Details)` ilə yüklə;
  - yaratma və yeniləmədə detal sətri yoxdursa yarat, varsa 5 sahəsini əvəz et (tam əvəzetmə); hamısı bir tranzaksiyada ([data-model.md](./data-model.md) §3 "Yazma qaydası");
  - `Details.UpdatedAt` və ana sətrin `UpdatedAt`-ı açıq `DateTimeOffset.UtcNow` olsun (yalnız detal dəyişəndə ana trigger işləmir);
  - cavab proyeksiyasına (`:71`) yeni sahələri əlavə et.
- [X] T026 [US2] Eyni faylda:
  - audit snapshot-larını genişləndir: `azir.update` `before` (`:65`) və `azir.delete` `before` (`:83`) 8 sahənin hamısını daxil etsin (detal yoxdursa `null` / `false`);
  - siyahı proyeksiyasına (`:38`) yeni sahələri T009-dakı LEFT JOIN qaydası ilə əlavə et;
  - `Delete`-də sətri `Include(a => a.Details)` ilə yüklə və detal sətrini eyni `SaveChangesAsync`-də **açıq** sil. DB-də FK olmaya bilər, ona görə cascade-ə güvənilmir (R1).
- [X] T027 [US2] `node .claude/skills/sync-openapi/scripts/route-diff.mjs` ilə `api-cbar-admin` route fərqinin 0 olduğunu təsdiqlə. Gövdə şəklini T004-dəki spec ilə əl ilə tutuşdur.

### MR 3 — `web-cbar-admin-new`

#### Tests for User Story 2

- [X] T028 [P] [US2] `web-cbar-admin-new/src/shared/testing/fixtures/azir.ts` (`AzirMockRow` + yeni sahələr) və `web-cbar-admin-new/src/shared/testing/handlers/azir.ts`-ı yenilə:
  - upsert bütün sahələri köçürür və qaytarır (`:57`-də yalnız `rate` köçürülür);
  - 400 `errors` qolu (mənfi həcm, kəsr say, min > max);
  - siyahı yeni sahələri qaytarır.
- [X] T029 [US2] `web-cbar-admin-new/src/features/azir/azir.test.tsx`-a testlər əlavə et:
  - tam saxlama → siyahıda həcm, say və işarə görünür;
  - eyni tarix+müddət ilə işarənin götürülməsi;
  - klient validasiyası (min > max, kəsr say, mənfi həcm, 3 onluq həcm);
  - server `fieldErrors` → sahə altında mesaj;
  - "Formaya yüklə" kartı sətrin dəyərləri ilə doldurur.

  `:79-81`-dəki "Redaktə et:" yoxlaması qalsın.

#### Implementation for User Story 2

- [X] T030 [P] [US2] `web-cbar-admin-new/src/features/azir/model/schemas.ts`-da `azirItemSchema`, `azirUpsertResponseSchema` və `AzirUpsertPayload`-a `dealVolume`, `dealCount`, `minRate`, `maxRate` (`number|null`) və `isReservePlan` (`boolean`) əlavə et.
- [X] T031 [P] [US2] `web-cbar-admin-new/src/locales/az/azir.json` və `web-cbar-admin-new/src/locales/en/azir.json`-a əlavə et:
  - `columns.{dealVolume,dealCount,minRate,maxRate,isReservePlan}`;
  - `form.{dealVolume,dealCount,minRate,maxRate,isReservePlan,isReservePlanHint}`;
  - `validation.{dealVolume,dealVolumeDecimals,dealCount,minRate,maxRate,minLeMax}`;
  - `actions.prefill` ("Formaya yüklə: {{label}}" / "Load into form: {{label}}");
  - `badge.{reserve,normal}`.

  `npm run check:i18n` yaşıl olmalıdır.
- [X] T032 [US2] `web-cbar-admin-new/src/features/azir/model/prefill-context.tsx` yarat: `AzirPrefillProvider`, `useAzirPrefill()` (set/subscribe) və `rowToFormValues(row)`.
- [X] T033 [US2] `web-cbar-admin-new/src/features/azir/components/azir-upsert-card.tsx`:
  - formaya `dealVolume`, `dealCount`, `minRate`, `maxRate` (string) və `isReservePlan` (bool, kit `Checkbox`, `yield-curve-form.tsx:286-305` nümunəsi) əlavə et;
  - zod-da boş sətir → keçir, rəqəm/diapazon/onluq yoxlanır, `superRefine` ilə `minRate ≤ maxRate` (`path: ['minRate']`);
  - payload-da boş → `null`;
  - xəta olanda `fieldErrors` whitelist ilə `form.setError` çağır (`crud-form-page.tsx:144-155` nümunəsi), qalanı alert-ə gedir;
  - uğurdan sonra rəqəm sahələri və işarə sıfırlanır, tarix və müddət qalır;
  - prefill gələndə `form.reset(rowToFormValues(row))` + fokus;
  - grid-ə ikinci sıra əlavə et.
- [X] T034 [P] [US2] `web-cbar-admin-new/src/features/azir/components/azir-prefill-action.tsx` yarat: `EditIcon` düyməsi, `aria-label` = `actions.prefill`, klikdə `useAzirPrefill().set(row)`.
- [X] T035 [US2] `web-cbar-admin-new/src/features/azir/model/module.ts`:
  - sütunlar: həcm, say, `isReservePlan` (`render: 'badge'`, `badgeLabelKey`), min və max;
  - `rowActions: [AzirPrefillAction]` (`users/model/module.ts:55` nümunəsi);
  - `canEdit: false` qalır.
- [X] T036 [US2] `web-cbar-admin-new/src/pages/azir/index.tsx`-da səhifəni `AzirPrefillProvider` ilə əhatə et.

**Checkpoint**: `web-cbar-admin-new`-də `npm run verify` yaşıldır; MR 1 test mühitində quickstart §3-dən keçir.

---

## Phase 5: User Story 3 — Statistika bloku (Priority: P2)

**Goal**: 11 göstəricili "AZIR indeksi ilə bağlı məlumatlar" bloku filtrdən asılı olmayaraq göstərilir.

**Independent Test**: quickstart §4 istinad dəsti ilə `/azir/summary` 11/11 gözlənilən dəyəri qaytarır. MSW ilə səhifədəki blok formatlanmış dəyərləri, `—` və işarəni göstərir (spec US3-ün 1–6-cı ssenariləri).

### MR 2 — `api-cbar`

- [X] T037 [US3] `api-cbar/openapi/components/schemas/statistics.yaml`-a `AzirSummary` sxemini əlavə et (11 nullable sahə, hamısı `required`). `api-cbar/openapi/paths/statistics.yaml`-a `azir-summary` path-ını yaz (`operationId: getAzirSummary`, tag, `200`, `429`, `500`). `api-cbar/openapi/openapi.yaml:86-87`-də qeyd et. `npm run lint && npm run bundle` işlət ([contracts/public-api.md](./contracts/public-api.md) §2).
- [X] T038 [US3] `api-cbar/src/Cbar.WebApi/Controllers/StatsController.cs`-a `[HttpGet("api/v1/azir/summary")] GetAzirSummary()` əlavə et. Hər göstərici [data-model.md](./data-model.md) §4 qaydası ilə hesablanır:
  - `S` = `Term == "1D" && Rate > 0`; həcm, min və max `Details` naviqasiyasından gəlir (LEFT JOIN; detal yoxdursa `null`);
  - istinad tarixləri `lastDate`-ə görədir; həcm min/max isə `today = DateOnly` (Asia/Baku) ilə `01.01.(il − 1)`-dən;
  - USD = `CurrencyRates` `USD`, `RateDate <= lastDate`, son sətir, `rate / Currency.Nominal`;
  - 4 onluq (USD 2 onluq) yuvarlaqlaşdırma;
  - hər sahə ayrıca `null` ola bilər.

  Private helper-lər controller-də qalır.
- [X] T039 [US3] `api-cbar/openapi/scripts/contract-check.mjs:~184`-ə `check('/api/v1/azir/summary', …)` əlavə et.

### MR 4 — `web-cbar-new`

- [ ] T040 [P] [US3] `web-cbar-new/src/features/stats/model/schemas.ts`-a `azirSummarySchema` əlavə et. `web-cbar-new/src/features/stats/api/stats.api.ts`-a `getAzirSummary()` yaz (`cachedJson`, 60 s, tag `stats`). `web-cbar-new/src/shared/testing/handlers/stats.ts`-a `/azir/summary` handler-i, `fixtures/stats.ts`-a quickstart §4 gözlənilən obyekti əlavə et.
- [ ] T041 [P] [US3] `web-cbar-new/src/locales/az/finance.json` və `web-cbar-new/src/locales/en/finance.json`-a `azirPage.summary.*` (12 açar, [contracts/web-routes.md](./contracts/web-routes.md) §5) əlavə et.
- [ ] T042 [US3] `web-cbar-new/src/widgets/azir-summary/azir-summary.tsx` yarat: 11 sətirlik cədvəl.
  - Faiz → `formatNumber` + `%`; dəyişmələr → `formatSigned`; həcm → 2 onluq; tarix → `formatDate`;
  - `null` → `—`;
  - `error` → inline `ErrorState`.
- [ ] T043 [US3] `web-cbar-new/src/views/azir/loader.ts`-da `summary: { data, error }` üçün `getAzirSummary()` `allSettled`-ə qoşulsun. `web-cbar-new/src/views/azir/index.tsx`-da cədvəldən sonra `AzirSummary` render et.
- [ ] T044 [US3] `web-cbar-new/src/views/azir/azir.test.tsx`-a testlər əlavə et:
  - blok `7,25%`, `+0,25`, `+0,75`, `147,06` göstərir;
  - `null` sahə → `—`;
  - summary 500 → yalnız blokda xəta, cədvəl və qrafik görünür;
  - filtr dəyişəndə blok dəyişmir.

**Checkpoint**: blok MSW ilə yaşıldır; MR 2 test mühitində quickstart §4 cədvəlinə 11/11 uyğundur.

---

## Phase 6: User Story 4 — Tarix aralığı filtri (Priority: P2)

**Goal**: istifadəçi `dateFrom`/`dateTo` seçir, seçim URL-də qalır, səhv giriş inline xəta verir, köhnə `d/m/Y` linkləri çevrilir.

**Independent Test**: `?dateFrom=2026-01-01&dateTo=2026-01-31` yalnız yanvarı göstərir. `order`/`format`/`tooLong` inline xəta verir və default aralıq göstərilir. Köhnə `/indeks/rates?dateFrom=01/09/2026…` düzgün çevrilir (spec US4-ün 1–5-ci ssenariləri).

### Tests for User Story 4

- [ ] T045 [P] [US4] `web-cbar-new/src/features/stats/model/azir-range.test.ts`:
  - default;
  - yalnız `from` → `to` bu gün;
  - gələcək `to` bu günə endirilir;
  - `format`, `order`, `tooLong` (> 3653 gün);
  - `string[]` → birincisi;
  - `legacyDateToIso('01/09/2026')` → `2026-09-01`, səhv dəyər → `null`.

### Implementation for User Story 4

- [ ] T046 [US4] `web-cbar-new/src/features/stats/model/azir-range.ts`-a `parseAzirRange(searchParams, today)` (`{ from, to, error, isDefault }`; xətada default aralıq + `error`) və `legacyDateToIso(value)` əlavə et. `first()`-i `shared/lib/search-params.ts:12`-dən götür.
- [ ] T047 [US4] `web-cbar-new/src/app/[locale]/statistics/azir/page.tsx`-da `searchParams`-ı `parseAzirRange` ilə oxu və loader-ə ötür. `web-cbar-new/src/views/azir/index.tsx`-a `FilterForm` + iki `DateField` (`name="dateFrom"`, `name="dateTo"`, effektiv dəyərlərlə) və `error` olanda inline kit `Alert` əlavə et (`views/currencies/index.tsx:30-32` nümunəsi). `generateMetadata`-da `alternates` query-ni saxlasın.
- [ ] T048 [P] [US4] `web-cbar-new/src/locales/az/finance.json` və `web-cbar-new/src/locales/en/finance.json`-a `azirPage.filter.{from,to,submit,error.format,error.order,error.tooLong}` əlavə et.
- [ ] T049 [US4] `web-cbar-new/src/proxy.ts` `legacyRedirect`: `dateFrom`/`dateTo` `d/m/Y` (`%2F` daxil) → ISO çevrilsin, səhv dəyər atılsın. `web-cbar-new/src/proxy.test.ts`-ə xəritənin tarix sətirləri üçün testlər, `web-cbar-new/src/views/azir/azir.test.tsx`-a quickstart §5-in 3–5-ci ssenariləri əlavə olunsun.

**Checkpoint**: filtr JS-siz işləyir; US1 və US3 testləri yaşıl qalır.

---

## Phase 7: User Story 5 — Excel yükləmə (Priority: P3)

**Goal**: "Yüklə" cari aralığın `.xlsx` faylını verir. 1-ci vərəq köhnə kimi 4 sütundur, işarəli günlər 2-ci vərəqdədir.

**Independent Test**: route `200` + düzgün başlıqlar qaytarır. Zip açılır, `sheet1.xml` ekrandakı sətirlərlə eynidir, rəqəm və tarix xanaları düzgündür, `Notes` yalnız işarə olanda var. Fayl Excel, LibreOffice və Sheets-də açılır (spec US5-in 1–5-ci ssenariləri, [contracts/xlsx.md](./contracts/xlsx.md)).

### Tests for User Story 5

- [X] T050 [P] [US5] `web-cbar-new/src/shared/lib/xlsx/zip.test.ts`: yaradılan arxivi local header və central directory-dən oxuyub hər hissəni `inflateRawSync` ilə aç. Ad, ölçü və CRC32 uyğun olmalıdır (`zlib.crc32` ilə), EOCD girişlərinin sayı düzgün olmalıdır.
- [X] T051 [P] [US5] `web-cbar-new/src/shared/lib/xlsx/workbook.test.ts`:
  - hissələrin siyahısı ([contracts/xlsx.md](./contracts/xlsx.md));
  - rəqəm xanası `<v>7.25</v>`;
  - tarix seriya nömrəsi (`2026-09-12` → `46277`) + `dd.mm.yyyy` stil;
  - `inlineStr` escape (`&`, `<`);
  - qalın başlıq stili;
  - 1 və 2 vərəqli workbook.
- [X] T052 [P] [US5] `web-cbar-new/src/features/stats/model/azir-export.test.ts`:
  - az/en başlıqlar;
  - sətir sırası `toAzirTableRows` ilə eynidir;
  - `null` → boş xana;
  - işarə yoxdursa 1 vərəq, varsa `Qeydlər`/`Notes` + tarixlər + footnote.
- [ ] T053 [P] [US5] `web-cbar-new/src/app/[locale]/statistics/azir/export/route.test.ts`:
  - `200`, `Content-Type`, `Content-Disposition` (`filename` + `filename*`), `Cache-Control: private, max-age=60`;
  - səhv aralıq → `400`;
  - api-cbar xətası → `502`.

### Implementation for User Story 5

- [X] T054 [US5] `web-cbar-new/src/shared/lib/xlsx/zip.ts` yarat: `createZip(entries: { name, data: Uint8Array }[]): Uint8Array`, `deflateRawSync` + `crc32`, DOS tarix/saat sabiti, ZIP64 yoxdur (T003 mənfi olarsa CRC32 cədvəl köməkçisi).
- [X] T055 [US5] `web-cbar-new/src/shared/lib/xlsx/workbook.ts` və `web-cbar-new/src/shared/lib/xlsx/index.ts` yarat:
  - `buildXlsx({ sheets: [{ name, header: string[], rows: (string|number|IsoDate|null)[][] }] })`;
  - `[Content_Types].xml`, `_rels/.rels`, `xl/workbook.xml`, `xl/_rels/workbook.xml.rels`, `xl/styles.xml` (qalın başlıq, `dd.mm.yyyy` numFmt), `xl/worksheets/sheetN.xml`;
  - XML escape;
  - Excel 1900 tarix seriyası.
- [X] T056 [US5] `web-cbar-new/src/features/stats/model/azir-export.ts` yarat: `toAzirWorkbook(rows, t)`. Vərəq 1 `1D AZIR` 4 sütundur; vərəq 2 `azirPage.export.sheetNotes` yalnız işarəli sətir olanda yaranır.
- [ ] T057 [US5] `web-cbar-new/src/app/[locale]/statistics/azir/export/route.ts` yarat (`app/media/[id]/route.ts` nümunəsi):
  - `GET` → `parseAzirRange`; xəta → `400` lokal mətn;
  - `getAzir({ from, to, term: '1D' })` → `toAzirTableRows` → `toAzirWorkbook` → `buildXlsx`;
  - başlıqlar [contracts/web-routes.md](./contracts/web-routes.md) §2-yə uyğun;
  - şəbəkə/API xətası → `502`.
- [ ] T058 [US5] `web-cbar-new/src/views/azir/loader.ts`-da `exportHref`-i `buildHref` (`shared/lib/search-params.ts:63`) ilə effektiv aralıqdan qur. `web-cbar-new/src/views/azir/index.tsx`-da filtrin yanında "Yüklə" `<a href download>` render et. `azirPage.download`, `azirPage.export.{sheetNotes,reserveDates}` açarlarını `web-cbar-new/src/locales/{az,en}/finance.json`-a əlavə et.
- [ ] T059 [US5] `web-cbar-new/src/proxy.ts` `legacyRedirect`-də `export=true` olanda hədəfi `/{locale}/statistics/azir/export?…` et. `web-cbar-new/src/proxy.test.ts`-ə test əlavə et.

**Checkpoint**: export testləri yaşıldır; fayl əl ilə 3 proqramda açılır (quickstart §6).

---

## Phase 8: User Story 6 — Ana səhifə kartında `*` və yeni link (Priority: P3)

**Goal**: son 1D dəyəri işarəlidirsə kartda `*` və footnote görünür; düymə AZIR səhifəsinə aparır.

**Independent Test**: `home-cards.test.tsx` işarəli fixture ilə `*` və footnote-u, linkin `/az/statistics/azir` olduğunu təsdiqləyir (spec US6-nın 1–2-ci ssenariləri).

- [ ] T060 [P] [US6] `web-cbar-new/src/features/stats/model/series.ts:192` `azirLatest` 1D üçün `isReservePlan`-ı da qaytarsın. `web-cbar-new/src/features/stats/model/series.test.ts`-də yoxla.
- [ ] T061 [US6] `web-cbar-new/src/views/home/loader.ts:143` AZIR sorğusunu `getAzir({ from: today − 60 })` et (bütün müddətlər, R13). `:247-265`-də kart datasına `current1DReserve` ötür. `web-cbar-new/src/views/home/loader.test.ts`-i yenilə.
- [ ] T062 [US6] `web-cbar-new/src/widgets/home-cards/money-market-card.tsx:47`-də işarəli 1D dəyərinə `*` əlavə et, kartın altında footnote göstər. `:68`-dəki düymə `/${locale}/statistics/azir`-ə aparsın. `web-cbar-new/src/locales/{az,en}/home.json`-a `azirReserveFootnote` əlavə et.
- [ ] T063 [US6] `web-cbar-new/src/widgets/home-cards/home-cards.test.tsx:129`: link gözləntisini yenilə, `*` və footnote üçün test əlavə et.

**Checkpoint**: bütün story-lər müstəqil yaşıldır.

---

## Phase 9: Polish & Cross-Cutting

- [ ] T064 [P] `web-cbar-new/`-də `npm run verify` Node 24 **və** Node 22 ilə işlət (Intl, `zlib.crc32`). `cd product-rest/web-cbar-new && npm run lint` FSD boundary qaydası (spec 017) ilə təmiz olmalıdır.
- [ ] T065 [P] `web-cbar-admin-new/`-də `npm run verify` Node 24 **və** Node 22 ilə işlət.
- [ ] T066 [P] `diff -r product-rest/api-cbar-admin/src/Cbar.Domain product-rest/api-cbar/src/Cbar.Domain` boş olmalıdır. Hər iki `openapi/`-də `npm run lint && npm run bundle` təmiz olmalıdır, `dist/` commit olunur.
- [ ] T067 Test mühitində (MR 1 → MR 2 deploy-dan sonra) quickstart §3 və §4-ü icra et: istinad dəsti 11/11, `cd product-rest/api-cbar/openapi && npm run contract && npm run drift`. Nəticəni `specs/021-azir-rates-page/quickstart.md`-nin sonuna "Nəticə (tarix)" kimi yaz.
- [ ] T068 Test mühitində (MR 3, MR 4 deploy-dan sonra) quickstart §5 (1–11) və §6-nı icra et: faylı Excel, LibreOffice və Google Sheets-də aç. Nəticəni quickstart-a yaz.
- [ ] T069 [P] `product-rest/web-cbar-new/CLAUDE.md`-yə qısa qeyd əlavə et: `shared/lib/xlsx` dependency-siz yazıcıdır (spec 021 R6), xlsx üçün yeni paket əlavə edilmir. Legacy redirect `proxy.ts` `legacyRedirect`-dədir.
- [ ] T070 `/sync-openapi` (api-cbar, api-cbar-admin) işlət və `# Sync:` sətirlərini yenilə. `/sync-business-logic` ilə `business_logic/new_business_logic.md` §4.2 və `business_logic/diff_report_logic.md` (§1 sətir 11, §4.2, §9, §11 #4) statuslarını yenilə.
- [ ] T071 `specs/021-azir-rates-page/spec.md` SC-004-ü plan-dakı Complexity Tracking qərarı ilə uzlaşdır ("≤ 60 saniyə"). Bunu istifadəçi təsdiqindən sonra et.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Ph 1)**: T001 ləğv olunub; T002 və T003 paraleldir.
- **Foundational (Ph 2)**: Ph 1-dən sonra. T004 → T005 → T006 → T007 (MR 1). T008 → T009 (MR 2, T007-dən sonra). T010–T012 paraleldir və API-dən asılı deyil (MSW).
- **US1 (Ph 3)** və **US2 (Ph 4)**: Ph 2-dən sonra paraleldir (fərqli proyektlər).
- **US3 (Ph 5)**: Ph 2-dən sonra. Web hissəsi US1-in səhifəsinə (T019–T021) qoşulur.
- **US4 (Ph 6)**: US1-dən sonra (`azir-range.ts`, `page.tsx`, `proxy.ts`).
- **US5 (Ph 7)**: xlsx yazıcı (T050–T055) Ph 2-dən sonra istənilən vaxt. Route və link (T057–T059) US4-ün `parseAzirRange`-dən (T046) sonra.
- **US6 (Ph 8)**: Ph 2-dən sonra, digər story-lərdən asılı deyil.
- **Polish (Ph 9)**: bütün story-lərdən sonra. T067 MR 1 və MR 2 deploy-unu, T068 bütün MR-ları tələb edir.

### Deploy (Konstitusiya IV.2)

MR 1 (`api-cbar-admin`: T004–T007, T024–T027) → MR 2 (`api-cbar`: T007 kopyası, T008–T009, T037–T039) → MR 3 (`web-cbar-admin-new`) → MR 4 (`web-cbar-new`). MR 4 MR 2-dən əvvəl deploy olunarsa, summary 404 verər və blok inline xəta göstərər. Bu dağıdıcı deyil, amma sıra saxlanılmalıdır.

### Within Each Story

Testlər implementasiya ilə eyni MR-dadır və `verify`-dan əvvəl yaşıl olmalıdır. OpenAPI controller-dən əvvəl gəlir (spec-first).

## Parallel Opportunities

- Ph 2: T010, T011, T012 eyni vaxtda; MR 1 zənciri ilə paralel.
- US1 ∥ US2 ∥ US6 ∥ xlsx yazıcı (T050–T055): dörd fərqli sahə.
- US1 daxilində: T013, T014, T015, T016, T017, T022.
- US2 daxilində: T028, T030, T031, T034; backend T024–T026 frontend-lə paralel.
- US5 daxilində: T050–T053 testləri paralel yazılır.

### Parallel Example: User Story 1

```text
T013 azir-rows.test.ts  |  T015 azir-range.ts  |  T016 azir-rows.ts  |  T017 series.ts  |  T022 finance.json
→ sonra T018 → T019 → T020 → T021 → T023
```

### Parallel Example: User Story 2

```text
Backend:  T024 → T025 → T026 → T027
Frontend: T028 | T030 | T031 | T034   →  T032 → T033 → T035 → T036 → T029
```

## Implementation Strategy

### MVP (US1 + US2, hər ikisi P1)

1. Ph 1 (T002, T003) → Ph 2.
2. US2 backend (MR 1) + US1 public səhifə (MR 2 sahələri + MR 4 səhifəsi).
3. **Dayan və yoxla**: redaktor həcm, say və işarə daxil edir; səhifə 60 günlük cədvəli `*` ilə göstərir. Bu, diff hesabatının ən vacib iki "Y" bəndini bağlayır.

### Incremental Delivery

1. MVP → US3 (statistika; summary endpoint MR 2-yə əlavə olunur).
2. → US4 (filtr).
3. → US5 (Excel).
4. → US6 (ana səhifə).
5. Hər addım öz testləri ilə yaşıl qalır, MR 4 bir neçə commit ilə yığılır.

## Notes

- `[P]` = fərqli fayl, tamamlanmamış asılılıq yoxdur.
- `.NET` lokal build olunmur: MR 1 və MR 2 üçün "build" = GitLab `test` pipeline-ı; push etməzdən əvvəl istifadəçidən təsdiq alınır.
- Azərbaycan hərfləri olan fayllar yalnız redaktor alətləri ilə yazılır (Konstitusiya V.5).
- Köhnə `web-cbar` və `web-cbar-admin` dəyişmir.
