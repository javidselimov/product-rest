# Data Model: "İstehlakçıların və investorların hüquqları" (spec 050)

Saxlanan yeni data yoxdur. Aşağıdakılar CMS HTML-indən hesablanan **view-modellərdir** (`features/about-content/model/types.ts`) və seed-in
bazada dəyişdiyi sətirlərdir.

## 1. Mövcud saxlanma (dəyişmir)

| Cədvəl | Sahə | İstifadə |
|---|---|---|
| `pages` | `parent_id`, `path` (ltree), `sort_order` | 86-nın köçürülməsi (seed, R7) |
| `page_translations` | `title`, `content` (az/en) | başlıqlar, metodologiya, İnformasiya sorğusu, kök lead (seed) |
| `page_details` | `show_in_side_nav` | 4 bəndlik sol menyu (seed) |
| `page_assets` | fayllar (`mediaId`, `title`, `mimeType`) | sənəd kartının adı/tipi; API `assets` kimi verir |

## 2. View-modellər

> **Implementasiyadan sonra** tiplərin mənbəyi `web-cbar-new/src/features/about-content/model/types.ts`-dir. Aşağıdakı plan formasından fərqlər:
> - `ComplaintTab`-a `introHtml`, `restHtml` əlavə olundu.
> - `StatTable` `months` formasında `head`, `rows`, `totalRow`, `totalIndex` saxlayır.
> - `StatSummary` `{ year, monthLabel, cards }`-dur.
> - `AppealStatisticsBlock`-a `restHtml` əlavə olundu.
> - `usedMediaIds` yoxdur (research R16).

```ts
type AboutLayoutKind = … | 'consumer-text' | 'complaint-index' | 'appeal-statistics' | 'consumer-documents'

/** One file of a month or a section, resolved from `/media/{id}` against the page's assets. */
type ArchiveFile = { id: number; title: string; url: string; mimeType: string | null }

type ArchiveMonth = { label: string; month: number | null; file: ArchiveFile }   // month: 1–12, null when not recognised
type ArchiveYear = { year: number; months: ArchiveMonth[] }                       // months newest first
type YearArchive = { years: ArchiveYear[]; latest: { year: number; month: ArchiveMonth } | null }

/** Root and page 86. */
type ConsumerTextBlock = {
  kind: 'consumer-text'
  leadHtml: string
  /** In editor order: ordinary HTML, a heading line, or a numbered list. */
  parts: ({ type: 'html'; html: string } | { type: 'heading'; text: string } | { type: 'numbered'; itemsHtml: string[] })[]
}

type Methodology = {
  title: string                                // the <h2>
  parts: ({ type: 'html'; html: string } | { type: 'formula'; left: string; numerator: string; denominator: string } | { type: 'note'; html: string })[]
}

type ComplaintTab = { key: 'bank' | 'insurance'; archive: YearArchive; methodology: Methodology | null; restHtml: string }
type ComplaintIndexBlock = { kind: 'complaint-index'; tabs: ComplaintTab[] }   // 1 tab when the companion page is missing

type SectorValue = { sector: string; value: number }
type MonthRow = { label: string; month: number | null; values: (number | null)[]; total: number | null }
type StatTable =
  | { form: 'months'; sectors: string[]; rows: MonthRow[]; totalRow: MonthRow | null }
  | { form: 'generic'; head: string[]; rows: string[][] }
type StatChannel = { index: number; label: string; years: { year: number; table: StatTable }[] }   // years newest first
type StatSummary = { year: number; month: number; monthLabel: string; cards: { channel: string; total: number; sectors: SectorValue[] }[] }

type AppealStatisticsBlock = {
  kind: 'appeal-statistics'
  introHtml: string                // page text before the first channel
  summary: StatSummary | null      // clarify Q3: common last filled month, null otherwise
  channels: StatChannel[]
  infographics: YearArchive | null // companion page 93; null in en or on failure
}

type DocumentSection = { title: string; parts: ({ type: 'html'; html: string } | { type: 'file'; file: ArchiveFile })[] }
type ConsumerDocumentsBlock = { kind: 'consumer-documents'; introHtml: string; sections: DocumentSection[]; restHtml: string }
```

**Seçim (view, R5)**: `selectComplaintTab(block, query.tab)`, `selectStat(block, query.channel, query.year)` — saf funksiyalar, yanlış dəyər defolta düşür.

## 3. Doğrulama qaydaları

- Bir layout üçün tanınan quruluş yoxdursa (heç bir il `<details>`-i, kanal və ya bölmə yoxdursa), `parseAbout` `[]` deyil, mövcud `plain` bloku
  qaytarır: səhifə bütöv göstərilir (FR-012).
- `ArchiveFile` yalnız `/media/{rəqəm}` linkindən qurulur. Page `assets`-də olmayan id üçün başlıq link mətnidir, `mimeType` `null`-dur.
  Kart ümumi ikona düşür (spec Assumptions).
- `StatSummary.cards` sırası kanalların redaktor sırasıdır. Kart yalnız `form: 'months'` olan kanallardan qurulur.
- İl `^\d{4}$` olmalıdır. Ay adları: az `Yanvar…Dekabr`, en `January…December` (böyük-kiçik hərf və `İ/i`, `I/ı` fərqinə dözümlü).

## 4. Seed-in dəyişdiyi sətirlər (`0031-consumer-rights-seed.sql`)

| Addım | Şərt (idempotentlik) | Dəyişiklik |
|---|---|---|
| 1. 86-nı köçür | 86-nın ana səhifəsi hələ `media`-dır | `parent_id = 87`, `path = 87.path || 86.id`, `sort_order` (R7); `page_details(86).show_in_side_nav = true` (upsert) |
| 2. Başlıqlar | az başlıq hələ köhnədir | 95: "Şikayət indeksləri" / "Complaint indices"; 101: "Sənədlər" / "Documents" |
| 3. Kök lead | az/en mətnin md5-i köhnədir | birinci paraqraf iki paraqrafa bölünür |
| 4. Metodologiya | mətndə `<h2>Şikayət indeksinin metodologiyası</h2>` (en: `<h2>Complaint index methodology</h2>`) yoxdur | 95-ə Bank, 96-ya Sığorta mətni sona əlavə olunur (az/en) |
| 5. İnformasiya sorğusu | 101-də `<summary>İnformasiya sorğusu</summary>` (en: `Information request`) yoxdur | `<details data-accordion>` bölməsi sona əlavə olunur |
| 6. Sol menyu | `page_details` sətri yoxdur | 88, 89, 90, 91, 92, 93, 96, 97, 98, 99, 100, 102, 103, 433 → `false` |

Metodologiya mətni (az, Figma `2453:4819` və `2453:3928`) `contracts/cms-markup.md` §4-də fixture forması ilə verilir. en mətni tərcümə qaralamasıdır.

## 5. Vəziyyət keçidləri

Yoxdur. Redaktorun yeni ay əlavə etməsi yeni `<details>` sətridir. "Son məlumat" və icmal növbəti sorğuda yenidən hesablanır (sorğular keşlənmir).
