# Research: Media → Xəbərlər / Elanlar (spec 029)

Hər bənd: **Qərar**, **Səbəb**, **Alternativlər**. Mənbə — kod oxunuşu, Figma node-ları və
test API ölçmələri (2026-11-02).

## R1. Ünvanlar və növ (`type`) xəritəsi

- **Qərar**: Ünvanlar dəyişmir — `/{locale}/press-releases[?type=1|2]` və
  `/{locale}/press-releases/{slug}`. Tipsiz siyahı `type=1` kimi işləyir (Xəbərlər). Menyunun
  cari bəndi üçün `buildSectionShell`-ə `current.href` olaraq **həmişə tipli** ünvan
  (`/{locale}/press-releases?type=1|2`) ötürülür — CMS `navUrl`-ları məhz belədir
  (`isCurrentNode` tam ünvan bərabərliyi ilə müqayisə edir).
- **Səbəb**: CMS ağacı, ana səhifənin "Hamısına bax" linki və xarici linklər bu ünvanlara gedir.
  Ana səhifə tabı onsuz da `type=1` göstərir, tipsiz siyahının qarışıq olması uyğunsuzluq idi.
- **Alternativlər**: `/media/news`, `/media/announcements` — yeni ünvan, 308 xəritəsi, CMS
  `navUrl` redaktəsi tələb edir; əhatədən kənar (spec). Tipsiz ünvanı `?type=1`-ə 308 ilə
  yönləndirmək — əlavə round-trip, fayda yoxdur.

## R2. Detal səhifəsində növ

- **Qərar**: `api-cbar` detal (və ardıcıllıq üçün siyahı) cavabına `type` (int) əlavə olunur.
  Detal loader-i onu breadcrumb ("Xəbərlər"/"Elanlar") və aktiv menyu bəndi üçün işlədir.
  Sahə gəlməsə (köhnə API deploy olunmayıb) `1` qəbul edilir.
- **Səbəb**: Bu gün detal yazının növünü bilmir. Əlavə sahə geriyə uyğundur (Maddə VII.3).
- **Alternativlər**: Siyahıdan `?from=` parametri ilə növü daşımaq — birbaşa linkdə (ana səhifə,
  axtarış, paylaşma) itir. İki sorğu ilə yoxlamaq (`type=1` siyahısında var?) — bahalı.

## R3. Tarix aralığı sahəsi

- **Qərar**: Bir vizual sahə (312×44, kit `inputVariants` çərçivəsi), içində iki çərçivəsiz
  native `<input type="date">` (`name="from"`, `name="to"`, ayrıca `aria-label`-lərlə: "Başlanğıc
  tarixi", "Son tarix") və aralarında "–". URL formatı `YYYY-MM-DD` (mövcud `dateParam`).
  Tablet/mobildə Figma-da sahələr alt-alta düşür (tablet filtr bloku 664×172, gap 16).
- **Səbəb**: web-cbar-new qaydası (CLAUDE.md, research D6): kitin `DatePicker`/`DateRangePicker`-i
  `name` daşımır, JS-siz GET formasında dəyər göndərmir. Native input JS-siz işləyir (SC-003,
  US2 #7) və yeni `'use client'` tələb etmir.
- **Alternativlər**: Kit `DateRangePicker` + gizli `<input>`-lar (client wrapper) — Figma-ya daha
  yaxın (bir panel, `dd.mm.yyyy` mətni), amma JS-siz işləmir və yeni client modul əlavə edir.
  Qəbul edilmiş fərq: placeholder mətni brauzerin native formatıdır (`gg.aa.iiii` və s.), Figma-dakı
  "from dd.mm.yyyy - to dd.mm.yyyy" deyil → `visual-diff.md`.

## R4. Axtarış sahəsi və filtr sətri

- **Qərar**: `<input type="search" name="q" maxLength={200}>` kit `inputVariants({ size: 'md' })`
  ilə (h44), placeholder `content:news.searchPlaceholder`. Filtr sətri view-a məxsus server
  komponentidir (`views/press-releases/news-filter.tsx`): `<form method="get">`, gizli
  `type`, "Filtrləri təmizlə" — adi `<a href>` (tipli baza ünvan, filtrsiz), "Axtar" — kit
  `Button` primary 144×44. Göndərmə `page`-i sıfırlayır (forma `page` daşımır).
- **Səbəb**: Mövcud `widgets/filter-form` çərçivəli kartdır və "təmizlə" linki yoxdur — Figma-ya
  uyğun deyil; onu dəyişmək digər 6 istehlakçını (laws, statistics, …) təsirləndirərdi.
  `queryParam` (max 200, trim) artıq var.
- **Alternativlər**: `FilterForm`-a `variant` prop — ümumi widget-ə bir istehlakçı üçün şaxə;
  ikinci istehlakçı çıxanda ümumiləşdirmək olar (Qalereya spec-i eyni filtr sətrini işlədəcək).

## R5. Kart grid-i

- **Qərar**: Yeni server widget `widgets/news-grid` (`NewsGrid` + `NewsCard`): `<ul>` grid —
  mobil 1, `tab` 2 (kart 320), `desk` 3 (kart 312) sütun, `gap-6`. Kart: bütöv `<Link>`; şəkil
  qutusu `aspect-[312/197]`, fon yeni token `bg-site-image-placeholder` (`#E5E5E5` =
  `--ui-color-neutral-200`; mövcud `site-photo-placeholder` `#727271`-dir, uyğun deyil —
  ui-contract §4), `next/image` `fill` `object-cover`, `sizes` sütun sayına görə; tarix
  `formatDate` (`dd.mm.yyyy`) 16/600 `text-muted-foreground`; başlıq `<h2>` 20/600 lh28.
  Şəkilsiz kartda boz qutu qalır (US1 #2). Alt mətn `alt=""` — başlıq onsuz da linkin adıdır.
- **Səbəb**: `ContentList` şaquli siyahıdır, Figma kartı ondan fərqlidir; `GalleryCards`
  (`views/media-galleries`) kit `Card` çərçivəlidir, Figma kartında çərçivə yoxdur. Qalereya
  spec-i bu widget-i təkrar işlədə bilər.
- **Alternativlər**: `ContentList`-ə `layout="grid"` — iki fərqli markup bir komponentdə.

## R6. Səhifə ölçüsü

- **Qərar**: 9 (`NEWS_PAGE_SIZE`). Paginasiya mövcud `ListPagination` (kit `Pagination`, JS-siz),
  sağa düzlənmiş (`justify-end`), grid-dən 60 sonra.
- **Səbəb**: Figma desktop 3×3. Tablet-də 2 sütunla 9-cu kart tək qalır — Figma tablet-də də 9-cu
  kart var (gizli edilmiş), qəbul edilir.

## R7. Detal: örtük, fotoqalereya, qoşmalar

- **Qərar**: Saf funksiya `splitPressReleaseAssets(assets)` (`features/press-releases/model`):
  `mimeType` `image/` ilə başlayanlar sıra ilə → `[cover, ...gallery]`, qalanları → `attachments`.
  Örtük 984×502 qutu (`aspect-[984/502]`, `object-cover`, `priority`). Qalereya — yeni client widget
  `widgets/photo-gallery`: böyük şəkil (`aspect-[984/601]`, `object-contain`, fon muted), altında
  ox düymələri (kit `IconButton` 44, `CaretLeft/Right`) və miniatür zolağı (180×124, gap 24,
  üfüqi sürüşmə, seçilmiş 2px `border-primary`). Klaviatura: miniatür düymələri Tab ilə, zolaq
  fokusda olanda ←/→; `aria-live="polite"` "Şəkil 2 / 5". Böyük şəkil orijinal fayla link
  (`target=_blank`) — lightbox yoxdur. Yalnız örtük varsa qalereya render olunmur.
- **Səbəb**: Qalereya state tələb edir (seçilmiş şəkil), ona görə client komponentdir (CLAUDE.md
  `'use client'` siyahısına əlavə olunur). JS-siz: SSR birinci şəkli və bütün miniatürləri
  göstərir, miniatür düymələri işləmir. Miniatürlərə əlavə `<a>` fallback-ı qoyulmur — düymə +
  link qarışığı ekran oxuyucunu çaşdırır. Qəbul edilir: mətn və örtük JS-siz oxunur, qalereya
  proqressiv təkmilləşdirmədir.
- **Alternativlər**: CSS-only (`:target`) qalereya — URL hash-ını dəyişir, tarixçəni çirkləndirir,
  ox düymələri mümkün deyil. Kit-də carousel yoxdur; yeni dependency (Embla və s.) — konstitusiya
  spec tələb edir, ehtiyac yoxdur. `image-popup-dialog` (spec 009) — popup üçündür, qalereya deyil.

## R8. Public API filtrləri (`api-cbar`)

- **Qərar**: `GET /api/v1/press-releases` yeni istəyə bağlı parametrlər: `q` (string, ≤ 200),
  `from`, `to` (`DateOnly`, `yyyy-MM-dd` — `StatsController`-dəki kimi). Semantika:
  - `q`: trim; boş → yox. `EF.Functions.ILike(t.Title, pattern, "\\")`, `pattern = "%" +
    escape(q) + "%"`, `escape` `\`, `%`, `_`-ı `\` ilə qaçırır. > 200 → 400 `BadRequest`.
  - `from`/`to`: Bakı gününün sərhədi — `from 00:00 +04:00 ≤ PublishedAt < (to + 1) 00:00 +04:00`.
    Azərbaycanda DST yoxdur, sabit `+04:00` ofset kifayətdir (TimeZoneInfo asılılığı yoxdur).
    Səhv format — `[ApiController]` model binding avtomatik 400 qaytarır.
  - Cavaba `type` əlavə olunur (siyahı və detal).
- **Səbəb**: Köhnə `PressReleasesForm` (`dateFrom`/`dateTo`) pariteti; `from`/`to` adları
  `StatsController` konvensiyasıdır. `ILIKE` kiçik cədvəl üçün (43 sətir test, köhnə prod
  ~ minlərlə) kifayətdir; `press_releases_pub_idx (status, published_at DESC)` tarix filtrini
  örtür.
- **Alternativlər**: Meilisearch — tam mətn, amma public API Meilisearch-ə qoşulmur (yalnız admin);
  əhatədən kənar. `TimeZoneInfo.FindSystemTimeZoneById("Asia/Baku")` — container-də tzdata
  asılılığı, sabit ofsetlə eyni nəticə.

## R9. Soft-delete yoxlaması (FR-016)

- **Qərar**: `PressRelease` üçün `HasQueryFilter(x => x.DeletedAt == null)` var (`CbarDbContext`
  164). EF Core qlobal filtri tələb olunan naviqasiyanın genişlənməsində də tətbiq edir
  (`t.PressRelease` → filtrli INNER JOIN). Yoxlama: Docker bu maşında işləmədiyi üçün sorğunun
  SQL-i `ToQueryString()` ilə çıxarılır (DB bağlantısı tələb etmir) və `deleted_at IS NULL` şərti
  axtarılır. SQL-də yoxdursa — sorğuya açıq `&& t.PressRelease.DeletedAt == null` əlavə olunur.
  Deploy-dan sonra test mühitində admin-dən silinmiş yazının slug-ı ilə detal 404 yoxlanılır.
- **Səbəb**: İddia ölçülmədən bug kimi düzəldilmir (yaddaş: "əvvəl ölç").
- **Ölçmə (2026-11-02, `ToQueryString`, EF Core 10 + Npgsql 10)**: həm siyahı, həm detal sorğusu
  `INNER JOIN (SELECT … FROM press_releases AS p0 WHERE p0.deleted_at IS NULL) AS p1` yaradır —
  qlobal filtr naviqasiya yolunda tətbiq olunur. **Bug yoxdur, kod dəyişmir.** Eyni çıxışda:
  `p.title ILIKE @pattern ESCAPE '\'` və `@start = 2026-06-10T20:00:00Z` (`from=2026-06-11` Bakı
  günü) — R8 semantikası təsdiqləndi.

## R10. Admin: növ sahəsi və `type=0` bug-ı

- **Qərar**:
  - `api-cbar-admin` `List`: `[FromQuery] short? type` (spec-first, `Type` parametri
    `components/parameters.yaml`-a). `PressReleaseUpsertDto.Type`: `short` → `short?`.
    `null` → POST `1`, PUT mövcud dəyəri saxlayır; `1`/`2` yazılır; başqa dəyər →
    `BadRequestProblem("Type must be 1 (news) or 2 (announcement).")`. Səssiz `0` yazılması
    bitir və köhnə panellə (type göndərmir) uyğunluq qalır — deploy sırası Maddə IV.2 kimi
    (API → panel), aralıqda 400 pəncərəsi yoxdur.
  - `web-cbar-admin-new` `pressReleasesModule`: `fields`-ə `{ name: 'type', type: 'select',
    options: PRESS_RELEASE_TYPE_OPTIONS, valueAsNumber: true, defaultValue: '1', required }`;
    `columns`-a `type` (`render: 'badge'`, `badgeLabelKey`); `filters`-ə `type` select.
    `pressReleaseRowSchema`/`DetailSchema`-ya `type: z.number().int()`. i18n `pressReleases.json`
    (az/en): `fields.type`, `columns.type`, `filters.type`, `types.1|2`.
  - MSW admin handler-i `type` filtrini və 400-ü real kontrakt kimi kodlayır.
- **Səbəb**: `defaultBuildPayload` yalnız elan olunmuş sahələri göndərir; `PressReleaseUpsertDto
  (short Type, …)` çatışmayan sahədə `0` alır. Test mühitində hələ `type=0` yoxdur (ölçülüb),
  amma admin-dən ilk saxlamada yaranacaq. Bütün CRUD bloku mövcud konfiqurasiya imkanları ilə
  (`valueAsNumber`, `defaultValue`, `badgeLabelKey`) qurulur — shared crud dəyişmir.
- **Alternativlər**: DTO-da `short Type = 1` default — redaktədə elanı səssizcə xəbərə
  çevirərdi (forma göndərməsə). Göndərilməyən `type`-a 400 — köhnə panel API-dən sonra deploy
  olunana qədər hər saxlama sınardı (Maddə IV.2 sırası ilə).

## R11. Keş və sorğu sayı

- **Qərar**: `getPressReleases(locale, { page, pageSize, type, q, from, to })` — obyekt
  parametr; URL `URLSearchParams` ilə qurulur (boşlar atlanır). `cachedJson` açarı URL-dir,
  filtr kombinasiyaları ayrı keşlənir (10 s, tag `press-releases`). Ana səhifə çağırışı yeni
  imzaya keçir. Siyahı səhifəsi: siyahı + ağac (2 sorğu, ağac layout üçün onsuz da keşlidir);
  detal: detal + ağac.

## R12. Test strategiyası (funksional — yaddaş qaydası)

Hər test davranış qırılanda düşməlidir; render/snapshot/class testi yoxdur.

- **web-cbar-new** (Vitest + MSW, handler `q`/`from`/`to`/`type`-ı real API kimi süzür):
  - Loader: URL parametrləri → API sorğusu (q, from, to, type, page, pageSize=9); səhv tarix və
    `type=abc` atılır; tipsiz → `type=1`, H1 "Xəbərlər", menyuda "Xəbərlər" `aria-current`.
  - View: filtr formasında dəyərlər URL-dən dolur; "Filtrləri təmizlə" linki filtrsiz tipli
    ünvandır; paginasiya linkləri filtrləri saxlayır; boş nəticədə mesaj + dolu sahələr;
    şəkilsiz kartda link və başlıq var.
  - `splitPressReleaseAssets`: 0/1/çox şəkil + PDF qarışığı.
  - `PhotoGallery` (`userEvent`): miniatür klik → böyük şəklin `src`/`alt` dəyişir,
    `aria-current`/`aria-pressed` keçir, canlı bölgə "2 / 5"; ox düymələri və ←/→; sonda
    "növbəti" deaktiv.
  - Detal view: Elan növü → breadcrumb "Elanlar", menyuda "Elanlar" aktiv; PDF qoşmalarda,
    şəkillər qoşmalarda yox.
- **web-cbar-admin-new**: formada "Növ" default "Xəbər", "Elan" seçib saxlayanda POST/PUT
  gövdəsində `type: 2`; redaktədə mövcud növ seçili gəlir; siyahı filtri `type=2` sorğusu
  göndərir və nəticə süzülür.
- **API-lər**: test layihəsi yoxdur (Maddə VIII) — `dotnet build`, `ToQueryString` (R9),
  deploy-dan sonra test mühitində `curl` ssenariləri (quickstart §2).
