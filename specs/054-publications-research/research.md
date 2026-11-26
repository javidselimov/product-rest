# Research — 054 "Nəşrlər və tədqiqatlar"

Hər bənd: **Qərar**, **Səbəb**, **Rədd edilən alternativlər**. Mənbələr:
- spec 044/045/050/051/052/053 (məzmun növü və bölmə şablonu nümunələri);
- Figma `2698:5000` və `Header menu` (`3195:2363`);
- test bazasının dump-ı `schema-new/cbar-schema-and-data-20260914.sql` (səhifə 62–76, 102, 103);
- test API `https://api-cbar-test.cbar.az`;
- canlı cbar.az (köhnə məqalə səhifəsi `page-895`).

Plan mərhələsində istifadəçi qərarları (2026-11-20):
- **Gizli Figma qatları qurulmur.** "Maraqlı ola bilər", mega menyu alt başlıqları və detalda çiplər gizlidir (spec 053 R4 qaydası).
- **"Ödəniş xidmətləri" köçür və yalnız açılan menyularda görünür.** Sol menyuda görünmür.
- **Köhnə faylların ölçüsü MinIO-dan düzəldilir.**
- **Figma-da olmayan 6 səhifə menyudan çıxır, ünvanı qalır.**
- **Mega menyunun yeni dizaynı ayrıca spec 055-dir.** 054 indiki mega menyu ilə bitir.

## R1 — İşçi məqaləsi: tipli cədvəllər, siyahılar `text[]`

**Qərar**: İki cədvəl yaranır: `working_papers` və `working_paper_translations` (`data-model.md`).
- Müəlliflər, açar sözlər və JEL kodları PostgreSQL `text[]` sütunlarıdır. EF Core + Npgsql onları `List<string>` kimi oxuyur.
- Nömrə + il unikaldır (partial unique index `WHERE deleted_at IS NULL`).
- Ünvan açarı `NN-YYYY` saxlanılmır, nömrə və ildən hesablanır.
- Migration `0038-working-papers.sql`.

**Səbəb**:
- Siyahılar həmişə bütöv oxunur və yazılır. Ayrıca sətir cədvəli (`working_paper_authors` …) üç əlavə cədvəl və sıralama sütunu deməkdir, faydası yoxdur.
- `text[]` bu layihədə ilk dəfə işlədilir. Npgsql bunu əlavə paketsiz dəstəkləyir.

**Rədd edilən**:
- (a) Uşaq cədvəllər: sıra sütunu və üç dəfə çox kod.
- (b) Vergüllə bir `text` sütunu: vergül olan açar söz pozulur, API hər dəfə parse etməli olur.
- (c) `jsonb`: tip yoxlaması olmur.

## R2 — Dil üzrə görünürlük: başlığın olması

**Qərar**: Məqalə bir dildə yalnız bu şərtlərin hamısında görünür: dərc olunub, silinməyib və həmin dildə başlığı doludur (FR-012). `ShowAz`/`ShowEn` bayrağı
yoxdur. Admin yoxlaması: başlığı dolu olan dildə müəllif də vacibdir (FR-004).

**Səbəb**: FAQ/FinCERT qaydası belədir (spec 051/053 R2): "en-də istəmirsənsə, en başlığını boş burax".

**Rədd edilən**: Ayrıca bayraqlar: ikinci həqiqət mənbəyi olur.

## R3 — Public API: dildə bütün siyahı + detal; axtarış saytda

**Qərar**: İki endpoint:
- `GET /api/v1/working-papers?locale=` həmin dildə görünən bütün məqalələri yığcam formada qaytarır: xülasəsiz, sıra il ↓, nömrə ↓.
- `GET /api/v1/working-papers/{key}?locale=` detaldır, `key` = `02-2025`.

Axtarış (`q`), il filtri və səhifələmə saytın loader-indədir: `foldForSearch` (`shared/lib/search-fold.ts`) və `ListPagination`.

**Səbəb**:
- Azərbaycan hərflərinin qatlanması (İ/ı/I/i, Ə/ə) Postgres-də yoxdur. FAQ (spec 051) və yayım qrafiki (spec 039) eyni səbəbdən saytda süzür.
- Həcm kiçikdir: ~78 məqalə, ildə ~4 yeni. Yığcam DTO ~30 KB-dır.
- İl seçimi üçün "dildə məqaləsi olan illər" siyahısı (FR-009) eyni cavabdan hesablanır.

**Rədd edilən**:
- (a) API-də `ILIKE` + `page/pageSize`: İ/ı səhvdir, il siyahısı üçün ikinci sorğu lazımdır.
- (b) SQL-də `lower(translate(…))`: indekssizdir, saytdakı qatlanma ilə fərqli qayda olar.
- (c) Meilisearch: bu ölçüdə əsassız mürəkkəblik.

## R4 — Saytda ünvanlar: CMS səhifəsinin altında detal

**Qərar**: Siyahı CMS səhifəsinin ünvanındadır: `/az/isci-meqaleler-silsilesi`, `/en/working-paper-series`. Bunun üçün `entities/page-node` daxilində
`WORKING_PAPERS_SLUG` və `isWorkingPapersSlug` yaranır. Detal `/az/isci-meqaleler-silsilesi/02-2025` ünvanındadır.

`[...slug]/page.tsx` FAQ və FinCERT-dən sonra iki yoxlama aparır:
- `isWorkingPapersSlug(last)` olarsa siyahı view-u açılır;
- `slug.at(-2)` siyahı slug-ıdırsa və `last` `^\d{2}-\d{4}$` formasındadırsa detal view-u açılır.

Siyahı loader-i `null` qaytararsa (məqalə yoxdur və ya API xətası), adi `loadCmsPage` yolu işləyir (FR-013). Bu yol səhifənin köhnə
mətnini bölmə şablonu ilə göstərir (R7). Dil dəyişdiricisi detalda eyni açarla o biri dilin ünvanını qurur. Məqalə o dildə yoxdursa link
siyahıya aparır.

**Səbəb**:
- Ağacda yer, breadcrumb, footer və dərc statusu CMS səhifəsindən gəlir (FAQ/FinCERT R3).
- `loadCmsPage` yalnız son seqmenti oxuyur, ona görə detal ondan əvvəl ayrılmalıdır.
- `NN-YYYY` ünvanı oxunaqlıdır, iki dildə eynidir və Figma-dakı "№ 02/2026" yazılışına uyğundur.

**Rədd edilən**:
- (a) Ayrıca `/working-papers/[key]` route qovluğu (events nümunəsi): CMS ünvanından qopar, ağacda yeri olmaz.
- (b) Başlıqdan slug: iki dildə fərqli olur, redaktə ilə dəyişir, unikal slug xidməti lazım olur.
- (c) Rəqəmsal id (`/123`): oxunaqlı deyil, mühitlər arasında fərqlənir.

## R5 — Siyahı view-u: server render, GET forması, il menyusu linklərlə

**Qərar**: View tam server komponentidir:
- **Axtarış** `<form method="get">`-dir. Görünən label yoxdur (Figma-da label gizlidir), `sr-only` label var. "Axtar" kit `Button`-dur
  (`type="submit"`). Seçilmiş il gizli `year` sahəsi ilə saxlanılır.
- **İl seçimi** ortaq `YearMenu` widget-idir: native `<details>` və linklər (`?year=2025&q=…`), `YearSortMenu` (`widgets/about-blocks/year-sort-menu.tsx`)
  nümunəsi ilə. Bu, Figma panelinin görünüşünü (`2724:6985`) JS-siz verir. Eyni widget il arxivində də işlədilir (R8).
- **"Filtrləri təmizlə"** adi linkdir: `?` parametrsiz.
- **Səhifələmə** `ListPagination`-dır: səhifə ölçüsü `WORKING_PAPERS_PAGE_SIZE = 10`. Figma 5 sətir və 22 səhifə göstərir, bunlar nümunə rəqəmlərdir. `page` aralıqdan kənardırsa son
  səhifəyə sıxılır.
- **Sətir** bütövlükdə bir `<a>`-dır (kart-link) və detala aparır. Hover zamanı border `#bdbdbd` olur (`2710:8147`).
- **Boş vəziyyət**: mətn və "Filtrləri təmizlə" (Figma-da kadr yoxdur, saytın mövcud boş vəziyyət üslubu).

**Səbəb**:
- FR-014 (JS-siz). Server Component by default.
- Native `<select>` popup-ı Figma panelini verə bilmir. `<details>` link menyusu isə artıq saytda var və sınanıb.

**Rədd edilən**:
- (a) Kit `Select` (client): JS-siz işləmir.
- (b) Native `<select>` + "Axtar": görünüş Figma-dan uzaqlaşır.
- (c) Client-side filtr: ünvan paylaşıla bilməz, JS-siz işləməz.

**Güzəşt**: il linki yazılıb göndərilməmiş axtarış sözünü itirir (ünvandakı `q` qalır).

## R6 — Detal view-u: `section-shell` + `trail`, açar sözlər mətn kimi

**Qərar**:
- `buildSectionShell({ current: { slug: WORKING_PAPERS_SLUG[locale] }, trail: paper.title })`. Breadcrumb "… › İşçi məqalələri › <başlıq>" olur,
  sol menyuda "İşçi məqalələri" aktiv qalır (events/press-release nümunəsi).
- Bloklar ardıcıllıqla: başlıq, dörd sahəli meta qutusu, "Xülasə", "Açar sözlər", "JEL təsnifatı", PDF kartı.
- Açar sözlər və JEL **vergüllə bir sətir mətndir**: Figma-da çiplər gizlidir (istifadəçi qərarı). Boş blok başlığı ilə birlikdə düşür.
- `generateMetadata`: başlıq və xülasənin ilk ~160 simvolu. Loader `cache()` ilə metadata və səhifə arasında paylaşılır.

**Səbəb**: Görünən Figma (`2703:6295`). Saytdakı digər detallarla eyni breadcrumb və menyu qaydası.

**Rədd edilən**: Gizli çip qatlarını qurmaq (istifadəçi rədd etdi).

## R7 — Bölmə şablonu: `SectionKey 'publications'`, layout HTML-in formasından

**Qərar**:
- `SECTION_TITLES.publications` dəsti: "Nəşrlər və tədqiqatlar" / "Publications and research" (tree.ts-dəki digər bölmələr kimi).
- `cms-page/loader.ts` bu bölmə üçün slug cədvəli əvəzinə `publicationsLayoutFor(html, assets)` çağırır. Bu funksiya formanı tanıyır:
  1. mətndə ən azı bir üst səviyyəli `<details>` varsa: **`file-archive`**;
  2. akkordion yoxdur, amma mətndə fayl linki (`href="/media/N"`) və ya səhifənin fayllarında element varsa: **`document-list`**;
  3. qalan hallarda: **`plain`**.
- İki yeni `AboutLayoutKind` yaranır: `file-archive` və `document-list`. Onların fixture-ları və `EXPECTED_BLOCKS` guard-ı var (`contracts/publication-markup.md`).
- `BLOCKS_WITH_FILES` dəstinə hər iki növ əlavə olunur. Səhifənin ümumi fayl siyahısı ayrıca göstərilmir (FR-019).

**Səbəb**:
- İstifadəçinin "köhnə qaydaları ümumiləşdir" tələbi və SC-006 (yeni səhifə üçün 0 deploy).
- Dump bunu təsdiqləyir. Akkordionlu səhifələr: 63, 64, 71, 73, 75, 103. Bir fayl linkli səhifələr: 65, 66, 67, 69, 70, 72, 76, 102. Mətnində linki olmayan səhifələr: 74 və 66-nın en mətni (`shapes.mjs`).
- Guard (root `CLAUDE.md`) layout növü üzrə işləyir. İki konkret növ hər forma üçün ayrıca fixture verir.

**Rədd edilən**:
- (a) Slug cədvəli (spec 050 yolu): yeni səhifə kod dəyişikliyi tələb edər.
- (b) Tək `publication` növü, blokları dinamik: guard bir fixture ilə iki formanı yoxlaya bilməz.
- (c) Redaktorun seçdiyi şablon sahəsi: sxem və panel dəyişikliyi, səhv seçim riski.

## R8 — İl arxivi parseri və görünüşü

**Qərar**: Yeni `parseFileArchive(html, ctx)` yazılır. O, spec 050 `year-archive.ts` köməkçilərindən istifadə edir: `detailsOf`, `topNodes`, `archiveFile`.
- **Mətnin bölünməsi.** Mətn üç hissəyə ayrılır: akkordionlardan əvvəlki mətn (`before`), qruplar və akkordionlardan sonrakı mətn (`after`).
  `before` və `after` hissələrində fayl linkli paraqraf sənəd kartı olur, qalanı `cms-content` ilə göstərilir.
- **Qrup başlığı.** Başlıq `<summary>`-nin trim olunmuş mətnidir. 103-də başlıqlarda sətir sonları var.
  - `^\d{4}$` formasındadırsa il qrupudur.
  - Başqa mətndirsə öz adı ilə qalır. Boşdursa adı "Digər" olur (chrome etiketi).
  - Qeyri-il qrupları illərdən sonra, mətndəki sıra ilə gəlir.
- **Qrupun içi.** Fayl linki (`/media/N`, `data-media-link` olsa da, olmasa da) kart olur. Başqa link (məs. 73-dəki köhnə məqalə linkləri) adi link
  olur. Mətn paraqrafı mətn kimi qalır.
- **İl seçimi.** `?year=` parametri (`QUERY_PARAM.YEAR`) seçimi verir.
  - Default ən yeni ildir. İl qrupu yoxdursa default "Hamısı"-dır.
  - `year=all` "Hamısı" deməkdir: bütün qruplar ardıcıl göstərilir.
  - Tanınmayan dəyər default-a düşür.
  - "Hamısı" bütün arxivlərdə var (spec US3-1). Figma-da illik hesabat dropdown-unda yoxdur, ardıcıllıq üçün hər yerdə qoyulur.
- **Düzülüş.** Kartlar bir sütundadır, grid deyil (ui-contract §5).

**Səbəb**:
- Spec 050 parseri yalnız ay akkordionlarını oxuyur və `data-media-link` tələb edir.
- Bu bölmədə fayllar birbaşa il akkordionunun içindədir.
- Köhnə import və redaktor eyni HTML-i saxlayır (`<details data-accordion>`), bunu dump və test API təsdiqləyir.

**Rədd edilən**:
- (a) Spec 052 `YearArchiveList` (hər il bağlı akkordion): Figma il seçimi göstərir.
- (b) Bütün illər açıq: illik hesabatda 30 il var.

## R9 — Sənəd kartı: bir komponent, ölçü səhifə fayllarından

**Qərar**:
- Ortaq kart `widgets/about-blocks/document-card.tsx`-dir: ad, ölçü sətri, "Fayl · PDF" çipi, bütün kart bir `<a>`. Mövcud `DocumentCard`/`FilePill`
  (`consumer-parts.tsx`) bu forma gətirilir, ikinci kart yaranmır.
- Ölçü `ArchiveFile`-a əlavə olunan `sizeBytes`-dan gəlir. Mənbə səhifə fayllarındakı `pageAssetSchema.sizeBytes`-dır, `archiveFile` media id-yə görə tapır.
  Formatı `formatFileSize(bytes, locale)` verir. Ölçü `> 0` deyilsə sətir göstərilmir.
- Detal kartında Figma ölçü göstərmir, amma FR-018 (bölmədə kart hər yerdə eynidir) üstün tutulur: ölçü bilinirsə göstərilir. Köhnə sayt da
  ölçünü göstərirdi ("1.91 MB").
- Mətnində fayl linki olmayan `document-list` səhifəsi kartlarını səhifənin fayllarından qurur (74 "Ekonometrik modellər"). Fayllar iki dilin
  fayllarıdır. Bu, bugünkü fayl siyahısının davranışıdır, reqressiya deyil.

**Səbəb**: FR-018. Kart bir dəfə yazılır. Fayl ölçüsü yalnız səhifə fayllarında var (`cms-html.ts` linkin ölçüsünü bilmir).

**Rədd edilən**: Hər link üçün API-dən media sorğusu: N sorğu, `api-cbar`-da yeni endpoint.

## R10 — Köhnə faylların ölçüsü: MinIO-dan birdəfəlik düzəliş

**Qərar**: `api-cbar-admin`-də `MediaSizeBackfillService` (`BackgroundService`) yaranır:
- Migration-lardan sonra işə düşür və advisory lock ilə yalnız bir pod-da işləyir.
- `media_asset_details`-də sətri olmayan, silinməmiş media faylları üçün 100-lük partiyalarla MinIO `StatObject(storage_key)` çağırır. Ölçü fərqlidirsə
  `UPDATE media_assets SET size_bytes`. Sonra `media_asset_details (media_id, size_verified_at)` sətri yazır.
- Obyekt tapılmasa xəbərdarlıq loglanır, sətir yenə yazılır. Bununla iş hər start-da təkrarlanmır.
- Yeni yükləmələr (`MediaStorage`) öz sətrini yükləmə zamanı yazır.
- Yeni endpoint yoxdur (spec-first hook təsirlənmir).

**Səbəb**:
- Test bazasında 1819 media faylının 1237-si 1064, ~480-i 2008/2009 baytdır. Real fayllar MB-larladır (yoxlanıb: media 964 2.9 MB, 1033 590 kB).
- `api-cbar` `MediaController.cs:127-131` bunu artıq qeyd edir ("migrated rows carry made-up sizes").
- Düzəliş bütün saytda ölçüləri düzəldir (istifadəçi qərarı).
- `UPDATE` cədvəl sahibliyi tələb etmir, yalnız UPDATE icazəsi lazımdır (admin API soft-delete üçün artıq istifadə edir).

**Rədd edilən**:
- (a) Saxta ölçünü saytda gizlətmək: köhnə faylların hamısında ölçü olmazdı.
- (b) Migration: SQL MinIO-ya çata bilməz.
- (c) Əl ilə skript: hər mühitdə MinIO açarları lazım olur, Vault qaydasına ziddir.
- (d) Hər start-da bütün faylları yoxlamaq: hər deploy-da 1800+ çağırış.

## R11 — "Yalnız açılan menyularda" bayrağı: `show_in_dropdown_nav`

**Qərar**: Yeni yoldaş cədvəl yaranır: `page_nav_details (page_id PK, show_in_dropdown_nav boolean NULL)`. `NULL` mövcud `show_in_side_nav`-ı izləyir, ona görə
bütün köhnə səhifələr dəyişmir. Saytda iki funksiya var:
- `isInSideNav`: bugünkü kimi `showInSideNav !== false`, açıq səhifə istisnası ilə.
- `isInDropdownNav`: `showInDropdownNav ?? (showInSideNav !== false)`.

Admin "Saytın menyusunda" kartı (`menuVisibility`) üç vəziyyət göstərir: hər yerdə / yalnız açılan menyularda / heç yerdə.
"Ödəniş xidmətləri" belə saxlanılır: `show_in_side_nav = false`, `show_in_dropdown_nav = true`.

**Səbəb**: İstifadəçi qərarı (Figma: sol menyuda yoxdur, mega menyuda var). Mövcud bayraq hər ikisini birlikdə gizlədir (spec 048).

**Rədd edilən**:
- (a) `page_details`-ə sütun: mövcud cədvələ `ALTER` qadağandır (root `CLAUDE.md`).
- (b) İkinci müstəqil boolean (default true): köhnə `false` səhifələr açılan menyularda birdən görünərdi.
- (c) Enum sütunu: köhnə bayraqla iki həqiqət mənbəyi olur.

## R12 — Menyu qrupu etiketi: data indi, görünüş spec 055-də

**Qərar**:
- Yeni cədvəl `page_translation_details (page_id, locale, menu_group varchar(120) NULL, PK (page_id, locale))` yaranır.
- Admin səhifə formasında hər dil tabında "Menyu qrupu" sahəsi olur. Input nullable-dır: göndərilməyəndə saxlanılan dəyər qalır.
- `GET /pages/tree` hər node üçün `menuGroup` qaytarır. Sayt Zod sxemində sahəni qəbul edir, amma 054-də **göstərmir**.
- İndiki mega menyu dizaynında alt başlıq yoxdur. Yeni dizayn (Figma `Header menu`, Variant B) spec 055-dir.
- Seed dörd strategiya/konsepsiya səhifəsinə "Strategiyalar və konsepsiyalar", "Ödəniş xidmətləri"nə "Ödəniş sistemləri" yazır (en draft).

**Səbəb**:
- İstifadəçi qərarı: header redizaynı ayrıca spec-dir, etiket data kimi hazır qalır.
- Figma Variant B-də "Nəşrlər" sütunları bu qruplarla bölünür. Dildə mətn olması 055-də alt başlıq göstərilərsə lazım olacaq.

**Rədd edilən**:
- (a) Etiketi 055-ə saxlamaq: seed bu spec-də ağacı qurur, etiketlər eyni məlumat köçürməsinə aiddir.
- (b) Səhifə üzrə dilsiz açar: başlıq görünsə tərcümə lazım olacaq.

## R13 — Ağacın yenidən qurulması: seed `0041`, başlıq və slug ilə

**Qərar**: Seed `0041-publications-tree-seed.sql` spec 050 `0031` nümunəsi ilə yazılır:
- **Səhifələrin tapılması.** Səhifələr az slug ilə tapılır, id ilə yox. Səhifə yoxdursa `RAISE NOTICE` verilir və o addım ötürülür.
- **Qrup səhifələri.** İki qrup səhifəsi yaranır: "Tədqiqatlar" / "Research" (`tedqiqatlar` / `research`) və "Nəşrlər, hesabatlar və sənədlər" / "Publications,
  reports and documents" (`nesrler-hesabatlar-ve-senedler` / `publications-reports-and-documents`). Slug məşğuldursa `-2` əlavə olunur
  (`SlugService` qaydası, SQL-də yoxlanılır). Bu yalnız qrup hələ yoxdursa baş verir (başlıqla yoxlanılır).
- **Köçürmə.** Köçürmə yalnız səhifə hələ köhnə valideynin altındadırsa olur:
  - parent, `path` və alt ağacın `path`-i yenilənir;
  - `sort_order` Figma sırası ilə `10, 20, …` olur;
  - "Ödəniş xidmətləri" və "Rəqəmsal fırıldaqçılıq statistikası" istehlakçı bölməsindən (87) gəlir.
- **Menyu bayraqları.**
  - Köçən iki səhifə üçün `page_details`: `ON CONFLICT DO UPDATE SET show_in_side_nav = true` (0031 onları gizlətmişdi).
  - "Ödəniş xidmətləri" bundan sonra yenidən `false` alır və `page_nav_details.show_in_dropdown_nav = true` olur.
  - Altı səhifə (64, 65, 68, 70, 71, 72) `show_in_side_nav = false` alır, `ON CONFLICT DO NOTHING`.
- **Başlıqlar.** Figma başlıqları yalnız köhnə başlığın üzərinə yazılır: `WHERE title = legacy`. "İşçi məqalələri", "Azərbaycan Respublikası Mərkəzi Bankının risk
  əsaslı nəzarət üzrə Siyasət Konsepsiyası", Yol Xəritəsinin qısa icmalı və s.
- **Giriş mətnləri.** Figma giriş mətnləri yalnız mətnin md5-i köhnə md5-dirsə yazılır. Fayl linki saxlanılır: giriş linkin əvvəlinə əlavə olunur.
- **Toxunulmayanlar.** "(Kopya)" ağacına (371) toxunulmur. Seed generatoru `specs/054-publications-research/seed/` qovluğundadır (spec 053 `seed/` nümunəsi).

**Səbəb**: Mühitlər arasında id fərqlənə bilər. Redaktorun dəyişikliyi üzərinə yazılmamalıdır. Seed təkrar işləyəndə heç nəyi dəyişməməlidir (FR-026/027).

**Rədd edilən**:
- (a) Əl ilə admin paneldə: üç mühitdə təkrarlanmalıdır, səhvə açıqdır.
- (b) id ilə: test və prod-da id-lər fərqli ola bilər.

## R14 — Köhnə məqalə ünvanları: statik xəritə

**Qərar**: `web-cbar-new/src/shared/config/legacy-working-papers.ts` faylı `köhnə page id → "NN-YYYY"` xəritəsini saxlayır. Fayl seed generatoru tərəfindən
köhnə siyahı səhifəsinin linklərindən yaradılır: az-da 77 link (76 unikal id), en-də 78 link (77 unikal id).
- `proxy.ts` `page-<id>(/…)?` ünvanı xəritədə varsa 308 ilə `/{locale}/{WORKING_PAPERS_SLUG}/{key}`-ə yönləndirir. Dil `legacyLocale`-dan gəlir: `?language=` və ya prefiks.
- Detal loader-i açarı tapmasa və açar xəritədədirsə (köçürülməmiş köhnə məqalə), siyahıya 307 ilə yönləndirir. Qalan hallarda 404 verir.
- DB-dəki `legacy_page_id` mənşəni göstərir və seed-in idempotentlik açarıdır.

**Səbəb**:
- Köhnə dəst donmuşdur: yeni köhnə səhifə yaranmayacaq.
- `proxy.ts` statik və sinxrondur. Indiyə qədərki bütün köhnə yönləndirmələr belədir, proxy-də API çağırışı yoxdur.
- US6-5: köçürülməmiş məqalə 404 vermir.

**Rədd edilən**:
- (a) Proxy-də API sorğusu: hər sorğuda gecikmə yaradır, presedenti yoxdur.
- (b) `?legacy=` ilə siyahıya, oradan detala: iki yönləndirmə və yeni API parametri.

Faza qeydi: xəritə köçürmə fazası (FR-028) ilə birlikdə gəlir. O fazaya qədər köhnə ünvanlar bugünkü kimi işləyir.

## R15 — Admin: CRUD modulu, siyahı sahələri vergüllə

**Qərar**: `features/working-papers` modulu `ModuleConfig` ilə qurulur (`monthly-reports` nümunəsi):
- **Siyahı.** Sütunlar: nömrə, il, başlıq, status. Filtrlər: il (`number`) və status (`select`). Axtarış var, `listEnvelope: 'paged'`.
- **Forma.**
  - Dildən asılı olmayan sahələr: nömrə, il, dil (`select`), JEL kodları (`text`, vergüllə).
  - Dil tablarındakı sahələr: başlıq, müəlliflər (`text`, vergüllə), xülasə (`textarea`), açar sözlər (`textarea`, vergüllə), PDF (`media`, `mediaAccept: 'document'`).
  - Siyahılar `buildPayload`-da vergülə görə bölünür, trim və təkrar silinməsi tətbiq olunur. `parseDetail`-də `", "` ilə birləşir.
  - Qaydalar `schema(base).superRefine`-dadır (FR-004).
- **Naviqasiya.** Sidebar-da yeni `publications` qrupu `consumer`-dən sonra, `faq`-dan əvvəl gəlir (saytın footer sırası). Bənd `workingPapers`-dir.
- **İdarə olunan bölmə.** `managed-sections.ts`-ə `isci-meqaleler-silsilesi` → `{ kind: 'link', to: '/working-papers' }` əlavə olunur (spec 053 mexanizmi, FR-006).

**Səbəb**:
- CRUD mühərriki `FormValues = Record<string, string | boolean>` modelindədir. Vergüllə mətn mühərriki dəyişmədən işləyir.
- Spec US2-4 vergüllə yazmanı nəzərdə tutur.

**Rədd edilən**: Yeni "chips" sahə tipi (`FieldControl` + tiplər): bir modul üçün mühərrik genişlənməsi, üçüncü istifadəçi yoxdur.

## R16 — Sənəd mime yoxlaması: ortaq yerə köçür

**Qərar**: `FincertSupport.DocumentMimeTypes` `Services/MediaRules.cs`-ə (və ya mövcud `MediaUploadRules`-a) köçür. Bunu FinCERT və işçi məqalələri birlikdə
işlədir.

**Səbəb**: İkinci istifadəçi gəldi. Kopyalamaq Duplicate Code olardı.

**Rədd edilən**: Kopyalamaq.

## R17 — Mega menyu: 054-də dizayn dəyişmir

**Qərar**: 054 mega menyu komponentinə toxunmur. Yeni ağac indiki menyuda özü işləyir:
- "Nəşrlər və tədqiqatlar" panelində iki sütun var: "Tədqiqatlar" (2 link) və "Nəşrlər, hesabatlar və sənədlər" (8 link, "Ödəniş xidmətləri" daxil).
- Hamburger paneli iki səviyyə göstərir: kök və iki qrup.
- Mobil siyirtmə üç səviyyə göstərir.

"Maraqlı ola bilər", Figma-nın qısa menyu adları və kateqoriya relsi spec 055-ə qalır.

**Səbəb**: İstifadəçi qərarı (2026-11-20). Figma `Header menu`-da dörd rəqib variant var (A, B, D, F), yəni dizayn hələ seçilməyib.

**Rədd edilən**: Yalnız bu bölmə üçün yeni panel: bölmələr arasında uyğunsuzluq yaranardı.

## R18 — Köhnə məqalələrin köçürülməsi (son faza)

**Qərar**: Spec 053 `seed/` nümunəsi tətbiq olunur. `extract.mjs` köhnə siyahının linklərindən hər məqaləni az və en dilində oxuyur
(`https://www.cbar.az/page-<id>/…?language=az|en`). Səhifədəki etiketlər belədir: "Tədqiqatın adı:", "Nömrə:", "Müəlliflər:", "Dil:", "Tarix:", "Xülasə:",
"Açar sözlər:", "JEL təsnifatı:" və `a.download_item`.
- **Nəticə.** Nəticə `working-papers.json`-a yazılır.
- **PDF-lər.** PDF-lər `uploads.cbar.az`-dan endirilir və admin API-yə yüklənir (`POST /api/v1/media`). Content-addressed olduğu üçün təkrar yükləmə yeni fayl yaratmır. Seed media-nı
  `original_name` ilə tapır (0037 nümunəsi).
- **Seed.** `build-seed.mjs` `0042-working-papers-seed.sql`-ı yaradır (və ya o vaxt növbəti boş nömrəni). Seed-in qaydaları:
  - `(number, year)` və ya `legacy_page_id` varsa ötürür;
  - en mətni boşdursa və ya az ilə eynidirsə en başlığı boş qalır;
  - sonda say köhnə linklərin sayı ilə tutuşdurulur (FR-028).

**Səbəb**: FR-028. Spec 053-də sınanmış axın.

**Həcm**: ~78 məqalə × 2 dil oxunur, ~78 PDF yüklənir. Bu, token-ağır və uzun işdir, istifadəçi təxirə sala bilər (spec qərar 2).
