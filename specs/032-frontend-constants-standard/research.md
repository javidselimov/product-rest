# Research: Frontend sabitlər standartı (spec 032)

Hər bənd: **Qərar**, **Səbəb**, **Alternativlər**. Mənbə — kod oxunuşu və quru lint qaçışı (2026-11-03).

## R1. Quru qaçış sayları

`npx eslint "src/**/*.{ts,tsx}" --rule '@typescript-eslint/no-magic-numbers …'` (opsiyalar kontrakt §5),
testlər və `shared/testing` xaric:

| Layihə | Tapıntı | Qeyd |
|---|---|---|
| web-cbar-new | 163 → **121** | 46-sı `shared/lib/xlsx` (zip/xlsx bayt formatı) — istisna |
| web-cbar-admin-new | **158** | 5-i `features/crud/fixtures/sample-module.ts` (CRUD mühərriki test fikstürü) |

Ən çox təkrarlananlar: web — HTTP status (14), `pageSize 10` (9), `160` (5), ECharts ölçüləri (11),
org-chart `kind` kodları (14); admin — sütun enləri 60/72/80/90/96/110/120/140 (≈45), `pageSize: 20` (5),
HTTP status (16), org-chart canvas həndəsəsi (20).

## R2. İki pilləli yerləşmə (`shared/constants` + slice `constants.ts`)

- **Qərar**: cross-cutting → `src/shared/constants/<mövzu>.ts`; slice-a məxsus → slice-ın `constants.ts`.
- **Səbəb**: FSD IV.5 `shared`-də biznes-spesifik kod qadağan edir; `NEWS_PAGE_SIZE`, `LAW_TYPES`,
  `PRESS_RELEASE_TYPE` domen bilgisidir. Tək `constants/` qovluğu ya qatı pozardı, ya da 60+ fayllıq
  "hər şey" qovluğuna çevrilərdi.
- **Alternativlər**: tək `src/constants/` (FSD-dən kənar qat, import istiqaməti qaydası ilə ziddiyyət);
  hər şey modulun içində (status-kvo — dublikatlar qalır, lint istisnası "hər fayl" olardı).

## R3. `shared/config/` toxunulmur

- **Qərar**: `brand`, `contacts`, `security-headers`, `runtime-config` konfiq kimi qalır; `constants` ayrı qovluqdur.
- **Səbəb**: konfiq məhsul/brend/mühit dəyəridir və dəyişəndə məhsul dəyişir; sabit texniki literal-dır və
  dəyişəndə kod dəyişir. Qarışdırmaq hər iki qovluğu mənasız edər. Konfiq faylı öz içində rəqəm işlədəndə
  (`createNonce` 16 bayt) o rəqəm `shared/constants/limits.ts`-dən gəlir.

## R4. `detectObjects: true`

- **Qərar**: aktiv.
- **Səbəb**: admin-də tapıntıların yarısı obyekt dəyəridir (`pageSize: 20`, `width: 140`, ECharts `grid`);
  söndürülsə qayda məhz ən çox təkrarlanan halları buraxardı. Nömrəli açarlar da tutulur (`KIND_CLASS[3]`) —
  `[ORG_CHART_KIND.director]` ilə yazılır, bu oxunaqlılığı artırır.
- **Alternativlər**: `detectObjects: false` (default) — 60+ tapıntı görünməz qalır.

## R5. `ignore: [0, 1, -1, 2, 100]`

- **Qərar**: bu beşi adsız qala bilər.
- **Səbəb**: `0/1/-1` — indeks, işarə, boş yoxlama; `2` — cüt/tək, yarı, ikinci element; `100` — faiz.
  Siyahını genişləndirmək (`3`, `10`, `1000`) qaydanı boşaldır: `3` artıq məna daşıyır (`FULL_ROW_CARDS`,
  `TALL_LAYOUT_IMAGES`, `MAX_DEPTH`).
- **Alternativlər**: boş `ignore` — `i + 1`, `arr.length - 1` kimi hər yerdə səs-küy.

## R6. İstisna fayllar

- **Qərar**: `**/*.test.{ts,tsx}`, `src/shared/testing/**`, `src/shared/constants/**`, `**/constants.ts`;
  web `src/shared/lib/xlsx/**`; admin `src/features/crud/fixtures/**`.
- **Səbəb**: testlərdə fikstür rəqəmi məlumatdır; `constants` faylında rəqəm yazmaq məqsəddir; xlsx yazıcısında
  rəqəm formatın özüdür (zip siqnaturu `0x04034b50`, ofsetlər) — ad vermək məlumatı gizlədər; CRUD sample
  modulu yalnız mühərrikin testləri üçün fikstürdür.
- **Alternativlər**: xlsx-də hər bayta ad — 46 sabit, oxunaqlılıq pisləşir.

## R7. Magic string-lər lint-siz

- **Qərar**: konvensiya + kod rəyi; miqrasiyada aşkar olanlar çıxarılır (`HTTP_STATUS`, `QUERY_PARAM`,
  `LOCALE_HEADER`, `PRESS_RELEASE_TYPE`, storage açarları).
- **Səbəb**: `no-restricted-syntax` ilə string literal qadağası i18n açarlarını, className-ləri, URL-ləri,
  Zod mesajlarını tutar — faydalı siqnal itər.

## R8. Tailwind `[Npx]` əhatədən kənar

- **Qərar**: className daxilindəki Figma ölçüləri lint-dən kənardır; ≥ 2 yerdə təkrarlananda `@theme` token.
- **Səbəb**: 154 mövcud dəyər; token-laşdırma dizayn sistemi işidir, sabit standartı deyil. Ayrıca spec.

## R9. Hook yox, `verify` kifayətdir

- **Qərar**: PreToolUse hook əlavə olunmur.
- **Səbəb**: qayda `error`-dur və hər iki `verify` zənciri `lint` ilə başlayır; merge şərti onsuz da budur.
  Hook yalnız controller route-ları kimi "spec-first" halları üçün lazım olub.

## R10. Dublikat siyahısı (SC-003)

| Dəyər | Əvvəl | İndi |
|---|---|---|
| `'x-locale'` | `proxy.ts`, `app/layout.tsx` | `shared/constants/headers.ts` |
| `86_400_000` | `azir-range.ts`, `xlsx/workbook.ts` | `shared/constants/time.ts` `DAY_MS` |
| `160` (excerpt) | 5 loader/page | `shared/constants/text.ts` `EXCERPT_LENGTH` |
| `pageSize = 10` | 5 api + 3 loader | `shared/constants/pagination.ts` `DEFAULT_PAGE_SIZE` |
| `228×56` | header ×2, footer | `shared/constants/layout.ts` `LOGO_SIZE` |
| `sizes="(min-width: 1024px) 33vw…"` | 3 view | `IMAGE_SIZES.GRID_THIRD` |
| `1024` + vahid massivi | `files.ts`, `photos.ts` | `shared/constants/files.ts` + `splitFileSize` |
| admin debounce `400` | 4 yer | `shared/constants/timing.ts` `SEARCH_DEBOUNCE_MS` |
| admin `pageSize: 20` | 5 modul | `shared/constants/pagination.ts` `DEFAULT_PAGE_SIZE` |
| admin `XLSX_ACCEPT` | 2 dialoq | `shared/constants/files.ts` |
| admin `60_000` | 2 hook | `shared/constants/timing.ts` `DETAIL_STALE_MS` |
| admin status kodları | `types.ts`, interceptor, login, dialoqlar | `shared/constants/http.ts` `HTTP_STATUS` |

## R11. Plandan kənarlaşmalar (admin)

- Sütun enləri: tək modulda işlənənlər modulun `constants.ts`-ində, çox modulda təkrarlananlar
  `shared/constants/ui.ts` `COLUMN_WIDTH`-də (plan "hər modulda" deyirdi; təkrarı azaltmaq üçün hibrid).
- `auth-flow.test.tsx`-dəki `60_000` toxunulmadı — "müddət bitəndən xeyli sonra" fikstürüdür, `REFRESH_MARGIN_MS` deyil.
- `LONG_TEXT_MAX = 500` kodda işlənmədiyi üçün əlavə edilmədi.
- Admin konstitusiyası VIII.1-dəki köhnəlmiş `/config.json` cümləsi yalnız Sync Impact Report-da TODO kimi qeyd olunub.
