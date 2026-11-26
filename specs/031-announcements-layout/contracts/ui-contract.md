# UI kontraktı: Media → Elanlar (spec 031)

Əsas: spec 029 `contracts/ui-contract.md` (route-lar, filtr, paginasiya, detal şablonu — hamısı
dəyişmir). Burada yalnız Elanlar (`type=2`) üçün fərqlənən hissə var. Ölçülər Figma node-larından
(2026-11-03); implementasiyada brauzerdə `getBoundingClientRect` ilə tutuşdurulur.

## 1. Siyahı — kart (`Media - Elanlar` `1048:21679`, kart `1048:23221`)

Grid 029 §2 ilə eynidir: desktop 3 × 312 gap 24; tablet (`1658:17103`) 2 × 320 gap 24; mobil
(`1658:17608`) 1 × 342 gap 24. H1, filtr, "Filtr → grid" 60, "Grid → paginasiya" 60 dəyişmir.

| Element | Figma | Desktop (≥ `desk`) | Tablet / mobil (< `desk`) | Token / kod |
|---|---|---|---|---|
| Kart | `1048:23221` 312×96 | şəkil qutusu **yoxdur**; `flex-col gap-4`, padding 0 | 320×120 / 342×120: padding 16, radius 4 (stroke gizli — çərçivə yoxdur) | `NewsGrid variant="text"`; `p-4 rounded-xs desk:p-0` (kit `rounded-xs` = 4px) |
| Tarix | 16/600 lh28, `#787878` | `dd.mm.yyyy`, `<time dateTime>` | eyni | `text-muted-foreground text-base leading-7 font-semibold` |
| Tarix → başlıq | 16 | 16 | 16 | `gap-4` |
| Başlıq | 20/600 lh28, `#222` | `<h2>`, sətir limiti yoxdur | eyni | `text-foreground text-xl leading-7 font-semibold`; hover `text-primary` |
| Link | bütöv kart bir `<a>` | | | fokus: kit fokus halqası (029 kimi) |
| `imageUrl` | — | **oxunmur** | | API göndərsə də render olunmur |

Kart hündürlüyü məzmundan asılıdır (başlıq 1 sətir → 28 + 16 + 28 = 72 + padding); Figma 96/120
iki sətirli başlıq üçündür.

## 2. Detal (`Media - Elanlar -Elan` `1298:20343`)

| Element | Figma | Sayt | Fərq 029 §3-dən |
|---|---|---|---|
| H1 | 32/600 lh44 | `SectionShell title` | eyni |
| Örtük | `1298:20356` **`visible:false`** | render olunmur | 029-da ilk şəkil 984×502 idi |
| H1 → tarix | 36 | 36 (shell boşluğu) | örtük olmadığı üçün tarix birbaşa H1-dən sonra |
| Tarix | 14/400 lh28 | `text-muted-foreground text-sm leading-7` | eyni |
| Tarix → mətn | 24 | 24 | eyni |
| Mətn | 16/28 | `CmsContent variant="about"` | eyni |
| Qoşmalar | — | `Attachments variant="about" imagesAsFiles` — **bütün** fayllar (şəkillər daxil) fayl sətri kimi, API sırası | 029-da şəkillər örtük/qalereya idi |
| Fotoqalereya | yoxdur | render olunmur | 029 §3.1 yalnız xəbərlərdə |

Breadcrumb və sol menyu 029 kimi: "Ana səhifə › Media › Elanlar › {başlıq}", "Elanlar" aktiv.

### 2.1 Mətndəki siyahı cədvəli (`1658:18539` tablet, `1658:19003` mobil, `1308:29093` desktop)

Elanın mətnindəki cədvəl adi redaktor cədvəlidir: API və admin dəyişmir. Sayt elanlarda `CmsContent tables="list"`
verir və cədvəlləri `.tableWrapper`-ə bükür (`wrapTables`), stil `app/cms-content.css`-dədir.

Real məzmun Figma nümunəsindən fərqlidir (test API, 2026-11-04: 23 elanın 22-sində cədvəl): `th` və başlıq
sətri yoxdur, birinci sətir `<td><strong>`-dir, 3–6 sütun var, "SİYAHI…" isə cədvəldən əvvəlki paraqrafdır.
Toolbar-ın "Başlıq sətrini dəyiş" düyməsi də yalnız birinci sətrə çatır. Ona görə sətirlər yerinə görə tanınır.

| Element | Figma | Sayt |
|---|---|---|
| Çərçivə | 1px `#E3E1DC`, şaquli xətt yoxdur | `--site-table-border` |
| Başlıq zolağı ("SİYAHI…") | h52, fon `#073559`, ağ 15/700, mərkəz | yalnız birinci sətir tək birləşmiş xanadırsa; `--site-table-title` = brand-700 `#00355A` |
| Başlıq zolağının küncləri | `1308:29068`: yuxarı künclər elliptik 20.5 × 12, alt düz (tablet/mobil frame-lərdə radius yoxdur) | bütün enliklərdə 20.5 × 12, yalnız başlıq zolağı olanda |
| Mətndən aralıq | 60 | başlıq zolağı varsa 60, yoxdursa paraqrafın 16-sı |
| Sütun başlıqları | h40, fon `#F5F3EF`, 12/700 lh16 `#5B6675` | başlıqdan sonrakı sətir, başlıq yoxdursa birinci sətir |
| Sətir | 44 + 1 xətt `#EEECE8`, cüt sətirlər `#FCFBF9`, son sətirdə xətt yoxdur | yalnız data sətirləri sayılır |
| № | 14/400 `#5B6675`, sol | birinci sütun |
| Ad | 15.5/400 lh20 `#1B2430` | digər sütunlar |
| Saat | 13/700 `#073559`, mərkəz | 3–4 sütunlu cədvəldə son sütun; 5–6 sütunda adi xana |
| Kənar boşluq | tablet/mobil 16 (№ 24 + 16); desktop 34 (№ → ad 48), saat sağdan 33 | `desk` = 85rem |
| Geniş cədvəl | yoxdur | xanalar sözlə sınır, cədvəl `.tableWrapper` içində özü sürüşür |

Sayt rəqəmləri tablet/mobil auto layout-dan götürür; desktop qrupunda 4-cü sətirdəki 1.7px sürüşmə
və altdakı 21px boş sahə köçürülmür.

## 3. Admin panel (`web-cbar-admin-new`)

| Element | Xəbər (030) | Elan (031) |
|---|---|---|
| Bölmə adı | "Şəkillər və sənədlər" | eyni |
| İzah | "İlk şəkil saytda örtük, qalan şəkillər fotoqalereyadır; fayllar siyahı kimi görünür. Sıranı oxlarla dəyişin." | "Elanlarda şəkil göstərilmir; bütün fayllar saytda qoşma siyahısı kimi görünür. Sıranı oxlarla dəyişin." |
| Nişanlar | "Örtük" / "Qalereya" | **yoxdur** |
| Sıralama oxları | var | var (saytdakı qoşma sırası) |

## 4. Dəyişməyən

Route-lar, loader-lər, filtr və paginasiya (029 §1–2), xəbər kartı (029 §2.1), xəbər detalı (029 §3),
fotoqalereya (029 §3.1), ana səhifə "Elanlar" tabı, public və admin API.
