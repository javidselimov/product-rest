# Kontrakt: sabitlər (spec 032)

Hər iki frontend üçün eyni qayda. Mənbə: konstitusiya web **Maddə XII**, admin **Maddə XI**.

## 1. Qovluq ağacı

```text
src/
├── shared/
│   ├── config/             KONFİQ (dəyişmir): brand, contacts, security-headers, runtime-config
│   └── constants/          CROSS-CUTTING SABİTLƏR — barrel yoxdur, fayl üzrə import
│       ├── pagination.ts   DEFAULT_PAGE_SIZE (web 10 / admin 20), LARGE_PAGE_SIZE
│       ├── time.ts         SECOND_MS, MINUTE_MS, DAY_MS, MONTHS_PER_YEAR, ISO_DATE {YEAR_END, MONTH_START…}
│       ├── timing.ts       API_TIMEOUT_MS, QUERY_STALE_MS, QUERY_GC_MS, SEARCH_DEBOUNCE_MS, REFRESH_MARGIN_MS…
│       ├── http.ts         HTTP_STATUS { OK, NOT_MODIFIED, PERMANENT_REDIRECT, BAD_REQUEST, … }
│       ├── headers.ts      LOCALE_HEADER (web)
│       ├── query-params.ts QUERY_PARAM { TYPE, PAGE, QUERY, FROM, TO, DATE_FROM, DATE_TO, LANGUAGE } (web)
│       ├── layout.ts       TAB/DESK_BREAKPOINT_PX, CONTENT_COLUMN_PX, LOGO_SIZE, IMAGE_SIZES (web)
│       ├── text.ts         EXCERPT_LENGTH, EXCERPT_WORD_BOUNDARY_SHARE (web)
│       ├── cache.ts        CONTENT_REVALIDATE_SECONDS, *_CACHE_CONTROL (web)
│       ├── files.ts        BYTES_PER_KB, FILE_SIZE_UNITS, XLSX_ACCEPT (admin)
│       ├── limits.ts       QUERY_MAX_LENGTH, YEAR_MIN/MAX, NONCE_BYTES, SHORT_TEXT_MAX, ISO_DATE_LENGTH…
│       ├── storage.ts      UI_STORE_KEY, CHUNK_RELOAD_KEY, AUTH_CHANNEL, REFRESH_LOCK (admin)
│       └── ui.ts           COLUMN_WIDTH, ACTIONS_COLUMN_WIDTH, PAGINATION_WINDOW (admin)
├── features/<x>/model/constants.ts    SLICE SABİTLƏRİ: PRESS_RELEASE_TYPE, ORG_CHART_KIND, AZIR_*, RATE_DECIMALS…
├── entities/<x>/{lib,model}/constants.ts
├── views/<x>/constants.ts             (web) NEWS_PAGE_SIZE, VIDEO_THUMBNAIL_SIZE, NS_PARAM_DECIMALS
├── widgets/<x>/constants.ts           (web) CHART_GRID, HISTORY_RINGS, BRANCH, FEED_CARDS
├── shell/constants.ts                 (web) VISIBLE_SECTIONS, MAX_DEPTH, LEAVE_DELAY
└── pages/<x>/constants.ts             (admin)
```

**Yer seçimi**: sabit yalnız bir slice-da işlənir → həmin slice-ın `constants.ts`; iki və ya daha çox slice-da,
yaxud `shared`/`server`/`app`/`providers` qatında → `shared/constants/<mövzu>.ts`. `shared` biznes adı
daşımır (FSD IV.5): `NEWS_PAGE_SIZE` view-da, `DEFAULT_PAGE_SIZE` shared-dədir.

## 2. Kateqoriya → fayl

| Kateqoriya | Nümunə | Fayl |
|---|---|---|
| Səhifələmə | `pageSize` defoltu, böyük siyahı ölçüsü | `shared/constants/pagination.ts` |
| Vaxt vahidi, ISO mövqe | `DAY_MS`, `ISO_DATE.MONTH_START` | `shared/constants/time.ts` |
| Müddət (timeout, stale, debounce) | `API_TIMEOUT_MS` | `shared/constants/timing.ts` |
| Keş ömrü, `Cache-Control` | `CONTENT_REVALIDATE_SECONDS` | `shared/constants/cache.ts` |
| HTTP status | `HTTP_STATUS.NOT_FOUND` | `shared/constants/http.ts` |
| Header / sorğu parametri adı | `LOCALE_HEADER`, `QUERY_PARAM.PAGE` | `headers.ts` / `query-params.ts` |
| Storage / channel açarı | `UI_STORE_KEY` | `shared/constants/storage.ts` |
| Hədd, uzunluq | `QUERY_MAX_LENGTH`, `SHORT_TEXT_MAX` | `shared/constants/limits.ts` |
| Fayl ölçüsü, accept | `BYTES_PER_KB`, `XLSX_ACCEPT` | `shared/constants/files.ts` |
| Paylaşılan Figma ölçüsü | `LOGO_SIZE`, `COLUMN_WIDTH` | `layout.ts` / `ui.ts` |
| Domen kodu (API-dən gələn) | `PRESS_RELEASE_TYPE`, `STAFF_TYPE` | `features/<x>/model/constants.ts` |
| Bir komponentin ölçüsü / sayı | `FEED_CARDS`, `CHART_GRID` | `widgets/<x>/constants.ts` |

## 3. Adlandırma

- `SCREAMING_SNAKE_CASE`; vahid suffiks: `_MS`, `_SECONDS`, `_DAYS`, `_PX`, `_LENGTH`, `_MAX`/`_MIN`.
- Qrup → obyekt `as const` (`HTTP_STATUS`, `ISO_DATE`, `LOGO_SIZE`, `IMAGE_SIZES`); açar `SCREAMING` və ya
  domen adı (`ORG_CHART_KIND.director`).
- Hər sabitin bir sətirlik **ingiliscə** doc-comment-i: *niyə* bu dəyər (Figma node, spec FR, API davranışı).
- Törəmə dəyər hesablanır, təkrar yazılmır: `MINUTE_MS = 60 * SECOND_MS`, `QUERY_GC_MS = 5 * MINUTE_MS`.
- Köçürülən sabitin köhnə yerdə re-export-u qalmır; importçular yeni yola keçir.

## 4. Nə sabitdir, nə konfiqdir, nə literal qala bilər

| | Nümunə | Qayda |
|---|---|---|
| **Sabit** | `160`, `pageSize: 20`, `setTimeout(fn, 400)`, `status === 404`, `width={228}`, `'x-locale'`, `type === 2` | `constants` faylında adlı |
| **Konfiq** | `brand.displayName`, `API_URL`, Vault-dan gələn hər şey | `shared/config/` / env — dəyişmir |
| **Literal qala bilər** | `0 1 -1 2 100`; massiv indeksi; enum üzvü; `readonly` sinif sahəsi; tip mövqeyi | lint `ignore` |
| **Literal qala bilər** | test fikstürü (`total: 25`, tarix, id), `shared/testing/**` | lint `ignores` |
| **Literal qala bilər** | `shared/lib/xlsx` bayt formatı | fayl başında səbəbli `eslint-disable` |
| **Literal qala bilər** | regex, className sətirləri, lookup cədvəlləri (`MIME_EXTENSION`) | modul-lokal məlumat, sabit deyil |
| **Literal qala bilər** | Tailwind `h-[114px]` birdəfəlik Figma ölçüsü | lint-dən kənar; ≥ 2 yerdə → `@theme` token (ayrı spec) |

**Magic string-lər** lint ilə tutulmur, amma konvensiya eynidir: sorğu parametr adı, header adı, storage açarı,
HTTP status, növ kodu (`'1' | '2'`), status sətri (`'published'`) → sabit. Kod rəyində yoxlanılır.

## 5. Lint opsiyaları (hər iki layihə eyni)

```js
'@typescript-eslint/no-magic-numbers': ['error', {
  ignore: [0, 1, -1, 2, 100],
  ignoreArrayIndexes: true,
  ignoreEnums: true,
  ignoreNumericLiteralTypes: true,
  ignoreReadonlyClassProperties: true,
  ignoreTypeIndexes: true,
  enforceConst: true,
  detectObjects: true,
}]
// ignores: '**/*.test.{ts,tsx}', 'src/shared/testing/**', 'src/shared/constants/**', '**/constants.ts'
//          web: + 'src/shared/lib/xlsx/**'; admin: + 'src/features/crud/fixtures/**'
```

## 6. Testlər

- Konfiqurasiya dəyərini yoxlayan test sabiti **import edir**:
  `expect(requests[0]?.get('pageSize')).toBe(String(NEWS_PAGE_SIZE))`.
- Fikstür məlumatı literal qalır; `'25 qeyd · səhifə 1 / 2'` kimi görünən mətn iddiası literal qalır.

## 7. Nümunələr

```ts
// ❌ src/views/laws/loader.ts
return { …, pageSize: 10, error: true }

// ✅
import { DEFAULT_PAGE_SIZE } from '@/shared/constants/pagination'
return { …, pageSize: DEFAULT_PAGE_SIZE, error: true }

// ❌ src/widgets/org-chart/org-chart-canvas.tsx
const KIND_CLASS = { 3: '…', 4: '…' }
if (node.kind <= 3) …

// ✅
import { ORG_CHART_KIND } from '@/features/organization/model/constants'
const { director, block } = ORG_CHART_KIND
const KIND_CLASS = { [director]: '…', [block]: '…' }
if (node.kind <= director) …

// ❌ src/features/press-releases/… (admin)
if (detail.type === 2) …

// ✅
import { PRESS_RELEASE_TYPE } from '../model/constants'
if (detail.type === PRESS_RELEASE_TYPE.ANNOUNCEMENT) …
```
