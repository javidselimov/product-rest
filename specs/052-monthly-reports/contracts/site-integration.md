# Site integration contract: spec 052 (`web-cbar-new`)

Saytın görünüşü, ünvanları, tabları və yönləndirmələri dəyişmir (FR-011, FR-012, FR-016). Ölçülər spec 050-nin
`contracts/ui-contract.md` §3 sənədində qalır. Dəyişən yalnız `YearArchive`-in mənbəyidir. `AboutLayoutKind` əlavə olunmur, ona görə layout
guard-ı (fikstür, `EXPECTED_BLOCKS`, `check:layout-fixtures`) yeni iş tələb etmir.

## Tiplər (`features/about-content/model/types.ts`)

```ts
/** A monthly report series from the API (spec 052), mapped by the loader. */
export type ReportSeriesKey = 'bank-complaint-index' | 'insurance-complaint-index' | 'infographics'
export type MonthlyReport = { year: number; month: number; file: AttachmentFile }
export type ReportSeries = { key: ReportSeriesKey; name: string; periodMonths: number; reports: MonthlyReport[] }

export type ParseContext = {
  // … mövcud sahələr
  /** Series with at least one report visible in this locale; a missing series falls back to the page HTML. */
  reports?: ReportSeries[]
}
```

## Model (`features/about-content/model/report-archive.ts`, yeni, + test)

`archiveFromReports(series: ReportSeries, locale: Locale): YearArchive`

1. İllər və aylar azalan sırayla düzülür. API sırasına güvənilmir: model öz invariantını saxlayır.
2. Hər ay üçün `ArchiveMonth` qurulur:
   - `label` ayın göstərilən adıdır: `MONTHS_AZ`/`MONTHS_EN`, ilk hərf `toLocaleUpperCase(locale)` ilə böyüdülür (`İyun`, `June`).
   - `month` ayın nömrəsidir.
   - `file` API faylıdır, `title` isə `reportTitle(series, year, month, locale)`-dan gəlir.
3. `latest` ən yeni ilin ən yeni ayıdır.

`reportTitle`: `periodMonths === 1` olanda `"{name} ({Ay} {İl})"`, `> 1` olanda `"{name} ({Başlanğıc ay} {İl} – {Ay} {İl})"` (research R3).
Başlanğıc ay `month − periodMonths + 1`-dir, il keçidi nəzərə alınır.

`ARCHIVE_PERIOD_SEPARATOR = ' – '` `constants.ts`-dədir.

## Parser-lər

**`complaint-index.ts`**: `parseComplaintIndex(nodes, files, companion, reports)`.

`tabFromReports(key, nodes, series)`:
1. `legacy = parseYearArchive(nodes)`. Mətn hissələri belə seçilir: `legacy ? [...legacy.before, ...legacy.after] : topNodes(nodes)`.
2. Metodologiya mövcud `methodologyOf` ilə ayrılır.
3. `introHtml` metodologiyadan əvvəlki mətndir. Köhnə arxiv varsa, `introHtml` arxivdən əvvəlki, `restHtml` isə arxivlə `h2` arasındakı
   mətndir, yəni bugünkü kimi.

Seçim belədir:
- **Bank tabı**: `bank-complaint-index` seriyası varsa `tabFromReports(nodes)`, yoxdursa bugünkü `parseTab`.
- **Sığorta tabı**: `insurance-complaint-index` seriyası varsa `tabFromReports(companionNodes ?? [])`. Bu halda metodologiya yoldaş səhifənin
  mətnindəndir, o yüklənməyibsə metodologiya yoxdur. Seriya yoxdursa bugünkü yoldaş yolu işləyir.

Bank tabı yoxdursa, blok `null` olur (bugünkü qayda).

**`appeal-statistics.ts`**: `infographics` seriyası varsa `infographics = archiveFromReports(series)`, yoxdursa yoldaş səhifənin HTML-i.

## Loader (`views/cms-page/loader.ts`)

```text
REPORT_SERIES_FOR_LAYOUT: complaint-index → [bank, insurance]; appeal-statistics → [infographics]
reports   = getMonthlyReports(locale, keys).catch(() => [])      → toReportSeries (DTO → ReportSeries, mediaUrl)
companion = loadCompanion(layout, locale, reports)
```

Yoldaş səhifənin yüklənməsi layout-a görə fərqlidir:
- `complaint-index`: yoldaş (96) həmişə lazımdır, çünki Sığorta tabının metodologiyası onun mətnindədir. `reports` və yoldaş `Promise.all` ilə
  paralel yüklənir.
- `appeal-statistics`: yoldaş (93) yalnız arxiv üçündür. Əvvəl `reports` yüklənir, yoldaş yalnız İnfoqrafika seriyası olmayanda yüklənir.

## Testlər (Vitest + MSW)

1. `report-archive.test.ts`:
   - sıra;
   - `latest`;
   - az/en ay adları (`İyun`, `June`);
   - 12 aylıq dövr il keçidi ilə: Yanvar 2026 → "Fevral 2025 – Yanvar 2026".
2. `complaint-index.test.ts`:
   - seriya + köhnə arxiv: arxiv sətirlərdəndir, giriş və metodologiya HTML-dəndir;
   - seriya + arxivsiz HTML: Bank tabı yenə qurulur;
   - seriya yoxdur: bugünkü nəticə (mövcud testlər dəyişmir).
3. `appeal-statistics.test.ts`: İnfoqrafika seriyadan qurulur, seriya yoxdursa yoldaşdan.
4. `views/cms-page` loader testi (MSW): API 500 verəndə səhifə spec 050 HTML yolu ilə render olunur (FR-014, SC-005).
5. Mövcud `layout-fixtures.test.ts` dəyişmədən keçir (fikstürlər seriyasız kontekstlə yoxlanır).
