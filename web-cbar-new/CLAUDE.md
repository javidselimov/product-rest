@AGENTS.md

# CLAUDE.md — web-cbar-next

Bu fayl bu qovluqda işləyən agent üçün **məcburi kontekstdir**. Qaydaların mənbəyi
[`.specify/memory/constitution.md`](.specify/memory/constitution.md) (v2.2.0) —
buradakı heç nə ona zidd ola bilməz; ziddiyyət olsa konstitusiya qalib gəlir.
Workspace səviyyəsində isə root `../CLAUDE.md` və `../.specify/memory/constitution.md`
(proyektlərarası qaydalar) tətbiq olunur.

Feature spec-i, plan və tasks: `../specs/002-public-site-template-migration/`.

## 1. Bu nədir

cbar.az **public saytı** — `web-cbar`-in `nextjs-template` üzərində yenidən qurulmuş
kopyası. Eyni 18 route, eyni `api-cbar` çağırışları (contracts/public-api.md), görünüş
qatı yalnız `@cbar/lib-react-ui-kit`. Cutover-ə qədər köhnə `web-cbar` (3000) ilə yanaşı
3001-də işləyir; cutover ayrı spec-dir.

Sayt **anonimdir**: template-in sessiya/giriş qatı silinib (spec D3). Brauzer API-yə
**heç vaxt** müraciət etmir — bütün məlumat serverdə alınır, hər sorğuda təzədir.

## 2. Memarlıq (FSD, Next uyğunlaşdırması)

```text
src/
├── app/[locale]/…       YALNIZ route qatı: page.tsx = loader + view + generateMetadata; loading/error/not-found
├── views/<route>/       loader.ts (server-only: params/searchParams Zod, features/*/api, Promise.all) + index.tsx (prop-lu)
├── widgets/             cms-content, chart-card, hero-slider, home-cards, list-pagination, attachments, section-sidebar, filter-form, data-table…
├── features/<x>/        api/ (server-only, `import 'server-only'`) + model/ (Zod sxem, helper)
├── entities/            content (envelope, mediaUrl, tarix, fayl), page-node (ağac)
├── shell/               site-shell, site-header, mega-menu, mobile-nav, site-footer, language-switcher, theme-toggle, nav.ts
├── providers/           app-providers (Query, UIMessagesProvider, Tooltip, Toaster), i18n-provider, error-boundary
├── server/              env.ts, api-client.ts, — yalnız app/, features/*/api, views/*/loader görür (ESLint)
├── shared/              api/app-error, config (brand, contacts, cookies, security-headers), constants (pagination, time, timing, cache, http, headers, query-params, layout, text, files, limits), i18n (server getT, ui-messages), lib (cms-html, search-params), ui, testing
└── locales/{az,en}/     common, nav, footer, home, content, finance, organization, media, search, errors
```

**Qaydalar:**

- Import yalnız **aşağıya**: `app → views → widgets → features → entities → shared`.
- Route faylı nazikdir: `loadX()` + `<XView data>`; məlumat orkestrasiyası `views/<x>/loader.ts`-də.
- Loader-lər və `features/*/api` **server-only**dur (`import 'server-only'`); Vitest-də bu
  marker boş modula alias olunur. View-lar prop-la işləyir ki, `renderApp` ilə test olunsun.
- Detal loader-ləri `cache()` ilə sarılır: `generateMetadata` və səhifə eyni sorğunu bölüşür
  (SC-002 — sorğu çoxluğu köhnə saytla eynidir).
- **Magic number yoxdur** (konstitusiya Maddə XII, spec 032): hər rəqəm adlı sabitdir — bir neçə
  slice-da lazım olan `shared/constants/<mövzu>.ts`-də (barrel yoxdur, `@/shared/constants/pagination`),
  slice-a məxsus olan həmin slice-ın `constants.ts`-ində (`views/press-releases/constants.ts`
  `NEWS_PAGE_SIZE`, `features/stats/model/constants.ts` `AZIR_*`). `shared/config/` konfiqdir, sabit deyil.
  Lint `@typescript-eslint/no-magic-numbers` (`0 1 -1 2 100` istisna, `detectObjects`) `verify`-dədir;
  testlər, `shared/testing`, `constants` faylları və `shared/lib/xlsx` istisnadır. HTTP status, header,
  sorğu parametri, növ kodu kimi magic string-lər də sabitdir (`HTTP_STATUS`, `LOCALE_HEADER`,
  `QUERY_PARAM`, `ORG_CHART_KIND`). Kontrakt: `../specs/032-frontend-constants-standard/contracts/constants-contract.md`.
- İnteraktiv seçim = URL sorğu parametri + server render (GET forması, `Link`). Kitin `Select`
  və `DatePicker`-i JS-siz forma dəyəri göndərmədiyi üçün filtrlərdə kit stilində **native**
  `<select>` / `<input type="date">` işlədilir (research D6).
- `'use client'` yalnız: hero-slider, mobile-nav, language-switcher, chart,
  section-tabs (ana səhifə tabları, spec 022 — panellər serverdə render olunub ötürülür),
  money-mark-tabs, error.tsx, not-found view, live-stream-dialog,
  live-stream-button, image-popup-dialog, print-button, year-nav-spy və timeline-motion (spec 024),
  photo-gallery (xəbər detalı, seçilmiş şəkil state-i), category-search (10+ tədbir bölməsində ada görə süzmə), events-filter və `widgets/list-filter` (state-siz GET forması —
  yalnız kitin `inputVariants`-ı client modulunda olduğu üçün, `date-field` kimi; spec 029/035),
  video-player (video detalında YouTube facade-ı, klikdə iframe; spec 035),
  decisions-dialog (yayım qrafikində "Qrafikə uyğun": JS-siz Tədbirlərə link, hidratasiyadan sonra qərar tarixləri modalı; spec 039),
  faq-search-form (Sual-cavab B görünüşündə mövzu seçimi formanı göndərir) və faq-hash-opener (`#sual-<id>` sualı açır; spec 051),
  `shared/ui/reveal` (scroll reveal, spec 049)
  (spec 006/009: sessionStorage yalnız ümumi `shared/lib/popup-dismissal.ts`-dədir — canlı
  yayım və şəkilli popup onu öz prefiksi ilə işlədir; bağlanma popup id-sinə görə sessiya
  boyu yadda qalır, səhifəyə görə yox (2026-10-22); şəkilli popup canlı yayımdan sonra
  növbə ilə açılır, `../specs/009-image-popup/`).
- Ana səhifənin birinci ekranı (slayder + sağ panel) desktop-da `zoom: var(--hero-scale)` ilə ekran
  hündürlüyünə miqyaslanır — Figma-dan təsdiqlənmiş sapma (`../specs/022-figma-redesign/contracts/ui-contract.md` §4).
  Miqyası `public/scripts/hero-scale.js` yazır; `widgets/hero-scale` onu `SiteShell`-də header-dən sonra
  **sinxron**, nonce-lu `<script src>` kimi qoşur (inline kod yox — `dangerouslySetInnerHTML` qaydası).
  Birinci ekranın ölçüləri Figma pikselində qalır; kart/slayder ölçüsünü dəyişəndə 744-ə sığdığını yoxla.

## 3. UI kit və məzmun

- Import yalnız subpath; rənglər yalnız semantik token; `globals.css` route B bloku toxunulmazdır.
  `cms-content.css` ondan sonra import olunur və legacy markup-ı token-larla stilləyir.
- **`dangerouslySetInnerHTML` yalnız `widgets/cms-content`-dədir** (spec D2): məzmun serverdə
  `prepareCmsHtml` (media ünvanları + `<script>`/`on*`/`javascript:` süzgəci) ilə hazırlanır.
  `cms-html.test.ts` legacy fikstürün struktur saylarını kilidləyir (SC-003).
- **Kontent şəkli `next/image` ilə birbaşa yox, `shared/ui/site-image` ilə render olunur** (spec 036,
  `../specs/036-image-loading-states/`): pulsasiya, fade-in, xəta halında boş qutu. `fill`-də qutu rəngi valideyndə
  olmalıdır, şəklin öz üzərində yox: yüklənənə qədər şəkil şəffafdır. Loqo, ikon və bayraq xaricdədir. Əsas siyahı və
  detal route-larının öz `loading.tsx`-i var (`views/*/skeleton.tsx`, `widgets/section-shell`), class-lar real
  komponentlə sabit vasitəsilə paylaşılır; qalan route-larda `[locale]/loading.tsx` spinner-i işləyir.
- **ECharts** yeganə əlavə runtime dependency-dir (spec D1): `widgets/chart-card/chart.tsx`
  tənbəl yükləyir, rəngləri `--chart-1..5` token-larından oxuyur; testlərdə `echarts/*` mock-lanır.
  Spec 049-dan bəri import yalnız qrafik görünən sahəyə bir ekran qalanda başlayır (`useInView`, `LAZY_ROOT_MARGIN`).
- **Scroll reveal** (spec 049, `../specs/049-scroll-reveal-lazy-widgets/`): `shared/ui/reveal.tsx` `<Reveal as index>`. Vəziyyət
  `data-reveal="static|pending|shown"`; server həmişə `static` göndərir, birinci ekranı observer-in ilkin bildirişi `static` saxlayır,
  yalnız `pending` gizlədir. Görünüş, stagger, reduced-motion, çap və `:focus-within` `globals.css`-dədir (`--reveal-*`). Tətbiq
  yerləri: `AboutBlocks` hər blok, `NewsGrid`/`ContentList`/`NewsTabs` kartları (`index` ilə), ana səhifənin hero-dan aşağı bölmələri.
  **Reveal iç-içə olmur**; header, menyu, footer, hero, dialoq bükülmür. Müyəssərlik widget-i `li`-yə inline `transition: all` yazır,
  ona görə `shown` keçidi `!important`-dır. Görünürlük `shared/lib/viewport-observer.ts` (paylaşılan observer hovuzu) və
  `use-in-view.ts`-dədir; testlərdə `shared/testing/intersection-observer.ts` stub-ı yalnız lazım olan testdə quraşdırılır.
- Kitin öz etiketləri (`pagination`, `sheet`…) `shared/i18n/ui-messages.ts` ilə az/en verilir.
- Kit `DatePicker`/`Select` GET formasında dəyər göndərmir → native element + kit `inputVariants`.
- **AZIR səhifəsi** (spec 021, `../specs/021-azir-rates-page/`): `/{locale}/statistics/azir` +
  `…/azir/export` route handler-i (`.xlsx`). `shared/lib/xlsx` dependency-siz yazıcıdır
  (`node:zlib` `deflateRawSync` + `crc32`, research R6) — xlsx üçün yeni paket əlavə **edilmir**.
  Köhnə URL xəritəsi (`/indeks/rates` → 308) `src/proxy.ts` `legacyRedirect()`-dədir və locale
  yönləndirməsindən əvvəl işləyir; yeni legacy ünvan oraya əlavə olunur.
- **Bölmə şablonu** `widgets/section-shell` (spec 024 → 028): breadcrumb, paylaşma, çap, sol menyu.
  `buildSectionShell({ section })` — bölmə kökü `entities/page-node` `SECTION_TITLES` ilə başlıqdan
  tanınır (`about`, `media`, `cooperation`, `literacy`, `consumer`, `publications`); yeni bölmə bir sətirlə əlavə olunur. Layout cədvəli bölməyə görədir
  (`features/about-content/model/layouts.ts` `sectionLayoutFor` — `Record<SectionKey, …>`, yeni `SectionKey` qaydasız kompilyasiya olunmur): About `layoutFor`, Media `mediaLayoutFor`, Beynəlxalq əməkdaşlıq `cooperationLayoutFor`,
  Maliyyə savadlılığı `literacyLayoutFor`, İstehlakçı hüquqları `consumerLayoutFor`, Nəşrlər və tədqiqatlar `publicationsLayoutFor` (mətnin formasına görə).
  "Maliyyə savadlılığı" (spec 047, `../specs/047-financial-literacy/`): kök `maliyye-savadliligi` `financial-literacy` layout-udur
  (`model/financial-literacy.ts`, `widgets/about-blocks/financial-literacy.tsx`), üç platforma səhifəsi `literacy-platform`-dur
  (`model/literacy-platform.ts`, `widgets/about-blocks/literacy-platform.tsx`). Bloklar redaktor işarələməsindəndir: `h2` bölmə, sitat (sonuncu
  paraqraf mənbə), qalın başlıqlı `ul` kartlar, `h3`-dən sonrakı adi `ul` etiketlər, `data-media-link` paraqrafı qalereya (`PhotoGallery`) və ya
  foto sırası, `mailto:` linkli sitat banner, sonuncu tək veb linkli paraqraf düymə (`model/markup.ts` `mediaParagraphIds`, `mailtoIn`). Blokun
  göstərdiyi şəkillər `usedMediaIds` ilə `Attachments`-dən çıxır (`views/cms-page/index.tsx`). İkonlar sıra ilədir (`literacy-icons.tsx`),
  rənglər `--site-literacy-*`. "Ümumi məlumat"ın ünvanı köka yönlənir (`proxy.ts`, `LITERACY_GENERAL_SLUGS`). Seed `api-cbar-admin` `0030`.
  Redaktor qeydi `docs/financial-literacy-cms-guide.md`.
  "İstehlakçıların və investorların hüquqları" (spec 050, `../specs/050-consumer-rights/`, `SectionKey` `consumer`): `consumerLayoutFor` dörd layout verir —
  `consumer-text` (kök və 86: lead, başlıq sətri, siyahı → nömrəli kartlar), `complaint-index` (95), `appeal-statistics` (94), `consumer-documents` (101).
  Parser-lər `features/about-content/model/{year-archive,consumer-text,complaint-index,appeal-statistics,consumer-documents}.ts`-dir. `topNodes`
  köhnə import-un `div` sarğılarını açır, `detailsIn` cədvəl xanasındakı akkordeonları tapır. Statistika en köhnə mətnində kanaldan kənara düşmüş
  illəri də kanala qatır (research R16). **Yoldaş səhifə**: loader `loadCompanion` ilə 95-ə 96-nı (Sığorta tabı), 94-ə 93-ü (İnfoqrafika) oxuyur,
  xətada `null`-dur. Seçim (`?tab=`, `?channel=&year=`) view-dadır (`model/consumer-select.ts`), `loadCmsPage` imzası dəyişmir, tablar `Link`-dir
  (`widgets/about-blocks/consumer-parts.tsx` `LinkTabs`). Qısa icmal bütün `Aylar` formalı kanalların ortaq son dolu ayıdır (`buildSummary`).
  Bu üç səhifədə `Attachments` göstərilmir (`BLOCKS_WITH_FILES`): `assets` başqa dilin fayllarını da saxlayır. Rənglər `--site-consumer-*`.
  `proxy.ts` `consumerRedirect`: 88 → kök, 93 → `…#infoqrafika`, 96 → `…?tab=insurance`. Seed `api-cbar-admin` `0031` (86-nı köçürür, başlıqlar,
  metodologiya, İnformasiya sorğusu, sol menyu). Redaktor qeydi `docs/consumer-rights-cms-guide.md`, idarəetmə təlimatı
  `../../dokumentasiyalar/istehlakci-huquqlari-guide.md`.
  **Aylıq hesabatlar** (spec 052, `../specs/052-monthly-reports/`): 95, 96 və 93-ün il → ay arxivi `GET /api/v1/monthly-reports`-dəndir
  (`features/monthly-reports`, seriyalar `REPORT_SERIES`). Loader `REPORT_SERIES_FOR_LAYOUT` ilə layout-un seriyalarını oxuyur
  (`loadConsumerSources`: şikayət səhifəsində yoldaşla paralel, statistikada İnfoqrafika seriyası varsa 93 oxunmur), xətada `[]`.
  `model/report-archive.ts` sətirlərdən eyni `YearArchive`-i qurur, başlıq seriya adı + dövrdür (`reportTitle`, Sığorta 12 ay). Seriya
  varsa parser mətndəki köhnə arxivi kəsir (giriş və metodologiya qalır), yoxdursa spec 050 yolu işləyir. Yeni `AboutLayoutKind` yoxdur.
  "Beynəlxalq əməkdaşlıq" (spec 043, `../specs/043-international-cooperation/`) adi CMS məzmunudur, yalnız "Beynəlxalq maliyyə təşkilatları ilə
  əməkdaşlıq" səhifəsi (spec 044, `../specs/044-ifi-cooperation/`) `ifi-organizations` layout-udur: kartlar `GET /api/v1/ifi-organizations`-dəndir
  (`features/ifi-organizations`, `widgets/about-blocks/ifi-organization-card.tsx` — native `<details>`, hamısı bağlı gəlir, `data-accordion` ilə çapda açılır),
  təşkilat olanda səhifə mətni ilk başlıq sətrindən kəsilir (`features/about-content/model/ifi-organizations.ts`). `<details>`-də `gap` yox, məzmuna
  `mt-4`: Chrome bağlı kartın gizli məzmununu flex uşağı sayır. Redaktor qeydi `docs/cooperation-cms-guide.md`. Etiketlər `locales/*/section.json`.
  "Mərkəzi banklarla əməkdaşlıq" səhifəsi (spec 045, `../specs/045-central-banks-cooperation/`) `memorandums` layout-udur: cədvəlin sətirləri
  `GET /api/v1/memorandums`-dəndir (`features/memorandums`, `widgets/about-blocks/memorandums.tsx`), il azalan sıra ilə gəlir. Çeşidləmə `?sort=oldest`
  parametridir: route `searchParams`-ı `CmsPageView`-a `query` kimi ötürür (`yearSort`), sıra view-da qurulur (`model/year-sort.ts` `orderByYear` —
  sabit sıralama: illər tərsinə, il daxilində redaktor sırası qalır), `loadCmsPage` imzası dəyişmir. Seçim `year-sort-menu.tsx`-dəki native
  `<details>` + iki `Link`-dir (JS-siz işləyir, `key={sort}` naviqasiyadan sonra siyahını bağlayır). Memorandum olanda səhifə mətni ilk başlıq
  sətrindən kəsilir (`model/memorandums.ts`).
  "Beynəlxalq təşkilatlarda üzvlük" səhifəsi (spec 046, `../specs/046-international-memberships/`) `memberships` layout-udur, amma ayrıca məzmun
  növü yoxdur: sətirlər səhifə mətnindəki **birinci cədvəldir** (təşkilat | il, `model/memberships.ts`; başlıq sətri — `th` və ya ilsiz birinci
  sətir — göstərilmir), API çağırışı yoxdur. Cədvəldən əvvəlki mətn giriş, sonrakı mətn cədvəldən sonra gəlir; cədvəl yoxdursa səhifə adi mətndir.
  Görünüş `widgets/about-blocks/memberships.tsx`, cədvəl sinifləri memorandumla ortaqdır (`widgets/about-blocks/constants.ts` `TABLE_*`), il sırası
  və menyu da ortaqdır (`orderByYear`, `YearSortMenu`; ilsiz sətir sonda). Seed `api-cbar-admin` `0029` yer tutucunu 14 sətirlə əvəz edir.
  Sol menyudan gizlətmə `showInSideNav`-dır (spec 041, `../specs/041-side-nav-visibility/`): ağacdan süzgəc deyil,
  `entities/page-node` `isInSideNav` həm `section-shell`, həm `section-sidebar` menyusunda bəndi və alt ağacını çıxarır,
  bənd və ya onun alt səhifəsi açıq olanda göstərir. Spec 048 (`../specs/048-dropdown-hide-side-nav/`): kökdən aşağıda eyni bayraq
  `isInDropdownNav` ilə açılan menyulardan da (mega-menyu, hamburger paneli, mobil çekmecə — `shell/nav.ts` `toSection`) çıxarır,
  açıq-səhifə istisnası olmadan. Footer və breadcrumb ona baxmır.
- **"Sual-cavab"** (spec 051, `../specs/051-faq-page/`) ayrıca məzmun növüdür: CMS səhifəsi `FAQ_SLUG` (`sual-cavab` / `faq`, `entities/page-node`)
  yalnız başlıq və ünvanı verir, mövzular, suallar və videolar bir sorğu ilə `GET /api/v1/faq?locale=`-dəndir (`features/faq`). Route
  `[...slug]/page.tsx` `isFaqSlug` ilə `views/faq`-a keçir; `loadFaqPage` `null` verəndə (FAQ boş, API xətası, dildə səhifə yoxdur) adi CMS səhifəsi
  göstərilir. Görünüş A (bütün mövzular, native `<details>`) və B (`?topic=<slug>`, düz siyahı + native `<select>`-li GET forması
  `faq-search-form`, client leaf: seçimdə formanı göndərir, JS-siz "Göstər" düyməsi) bir view-dur; seçim və axtarış (`?q=`, sual + cavab mətni, `shared/lib/search-fold.ts`) saf funksiyadadır (`features/faq/model/select.ts`). Sual ankoru
  `#sual-<id>` dillərdə eynidir, `widgets/faq/faq-hash-opener.tsx` sualı açır. Videolar YouTube önizləməsi + xarici linkdir (iframe yoxdur).
  **Keçid kartı** (US5): mövzunun bağlı səhifələri `GET /api/v1/faq/topics?pageId=`-dən `loadCmsPage`-də ağacla paralel oxunur (xəta → `[]`, FAQ
  səhifəsinin özündə sorğu yoxdur), `widgets/faq/faq-topic-links.tsx` mətndən sonra, `Attachments`-dən əvvəl; çərçivə mövzu kartı ilə ortaqdır
  (`widgets/faq/constants.ts`). En sualları təxirə salınıb: en FAQ boşdur və öz CMS mətnini göstərir. Dil dəyişdiricisinin yönləndirməsi
  (`findLocaleCounterpart`) sorğunu saxlayır. Köhnə `page-131/*` `proxy.ts`-dədir (`LEGACY_FAQ_PAGE`). Köhnə "Playlist" linki köçürülməyib.
  Redaktor qeydi `docs/faq-cms-guide.md`.
- **FinCERT** (spec 053, `../specs/053-fincert-page/`) ayrıca məzmun növüdür, FAQ nümunəsi ilə: CMS səhifəsi `FINCERT_SLUG` (`fincert`, az/en eyni,
  `entities/page-node`) başlıq, ünvan və ehtiyat mətni verir, bloklar bir sorğu ilə `GET /api/v1/fincert?locale=`-dəndir (`features/fincert`).
  Route `[...slug]/page.tsx` FAQ-dan sonra `isFincertSlug` ilə `views/fincert`-ə keçir, `generateMetadata` təsviri missiyadan götürür;
  `loadFincertPage` (`cache()`) `null` verəndə (səhifə yox, API xətası, altı bölmənin hamısı boş) adi CMS səhifəsi göstərilir. Model saf
  funksiyadır (`features/fincert/model/view.ts` `buildFincertView`, `fincertSections`): bölmə yalnız dildə məzmunu olanda görünür, sıra və
  ankerlər `FINCERT_SECTION_ORDER`/`FINCERT_ANCHORS`-dadır, istiqamət nömrəsi görünən siyahıdakı yerdir, `tel:` rəqəm və `+`-dan qurulur, RFC-də
  media faylı xarici linkdən üstündür. Görünüş `widgets/fincert` (server komponentləri, bölmə başına bir `Reveal`): istiqamətlər native `<details>`
  `<ol>`-da, gövdə `CmsContent variant="fincert"` (`cms-content.css`), əlaqə/RFC/üzvlük kartları bütövlükdə bir linkdir, portal düyməsi kit
  `Button asChild`. Figma-dakı gizli "Bu səhifədə" bloku qurulmur. Rənglər `--site-fincert-*`. Köhnə `page-893/*` `proxy.ts`-dədir
  (`LEGACY_FINCERT_PAGE`). Redaktor qeydi `docs/fincert-cms-guide.md`.
- **"Nəşrlər və tədqiqatlar"** (spec 054, `../specs/054-publications-research/`, `SectionKey` `publications`): bölmə şablonudur, layout slug-dan
  yox, mətnin formasından seçilir (`publicationsLayoutFor`): üst səviyyədə `<details>` → `file-archive` (il arxivi: `YearMenu` + sənəd kartları,
  `?year=<il>|all`, `model/file-archive.ts`), fayl linki və ya bağlı fayl → `document-list` (giriş + kartlar, `model/document-list.ts`), qalanı
  `plain`. Fayl linki `href="/media/<id>"`-dir, `data-media-link` olmadan da. Kart `widgets/about-blocks/document-card.tsx`-dir (istehlakçı
  sənədləri ilə ortaq), mime və ölçü səhifənin `assets`-indən, bu iki layout `Attachments` göstərmir. Sol menyu `section-nav.tsx`-də
  `section === 'publications'` ilə Figma görünüşündədir, rənglər `--site-faint`, `--site-file-*`, `--site-menu-*`.
  **İşçi məqalələri** ayrıca məzmun növüdür: CMS səhifəsi `WORKING_PAPERS_SLUG` (`isci-meqaleler-silsilesi` / `working-paper-series`) başlıq və
  girişi verir (`splitAtFirstDetails`: ilk akkordiona qədər), sətirlər `GET /api/v1/working-papers?locale=`-dəndir (`features/working-papers`).
  Route `[...slug]/page.tsx`: `paperKeyOf` (`NN-YYYY`) detal (`views/working-paper`, `cache()`), siyahı slug-ı `views/working-papers`; dildə məqalə
  yoxdursa və ya API xətasında adi CMS səhifəsinə düşür. Süzmə, il siyahısı və səhifələmə saytdadır (`model/select.ts`, 10 sətir, `?q=&year=&page=`).
  **Menyu yeri** (spec 054 US5): `isInDropdownNav = showInDropdownNav ?? showInSideNav !== false` (`entities/page-node`), "Ödəniş xidmətləri"
  `false` + `true`-dur, yalnız açılan menyulardadır. `menuGroup` sxemdədir, heç yerdə render olunmur (spec 055). Seed `api-cbar-admin` `0041`
  ağacı qurur. Redaktor qeydi `docs/publications-cms-guide.md`.
- **Hamburger paneli** (`shell/mega-menu.tsx` `OverflowPanel`, spec 042, `../specs/042-hamburger-hide-media/`): header-in üst zolağında
  keçidi olan bölmə (`topLinks`: Media, İnsan resursları; `shell/nav.ts` `isTopLinkSection`, ünvana görə) `desk`-dən paneldə `desk:hidden`-dır —
  üst zolaq da məhz `desk`-dən görünür. Mobil çekmecə və `desk`-dən dar panel dəyişmir. Admin ayarı yoxdur.
  **Spec 056** (`../specs/056-header-financial-stability-nav/`, Figma `I813:25657;9:29`, `1088:26873`) bunun üstünə üç şey əlavə edir:
  - Nav zolağı `desk`-dən `VISIBLE_SECTIONS` (9), `lg`–`desk` arası `VISIBLE_SECTIONS_NARROW` (8) bölmədir. 9-cu bənd zolaqda `max-desk:hidden`,
    paneldə isə `desk:hidden`dır.
  - Kökün menyu yeri bayrağı (`NavSection.inDropdownNav` = `isInDropdownNav`; admin-də "Menyularda yox") kökü yalnız `desk`-dən paneldən çıxarır
    (`leavesWidePanel`). Zolaq, dar panel, çekmecə və footer dəyişmir. Panel `desk`-də boş qalarsa hamburger də `desk:hidden` alır.
  - `desk`-də paneldə görünən 2–4-cü bölmə `desk:break-before-column` alır (`OVERFLOW_PANEL_COLUMNS`): ilk üçü öz sütununu açır, qalanları
    sonuncu sütunda yığılır.

  Seed `api-cbar-admin` `0042` "Maliyyə sabitliyi" və "Rəqəmsal maliyyə ekosistemi"ni qurur. Redaktor qeydi `docs/navigation-cms-guide.md`.
- **Ana səhifənin "Strategiya və sənədlər" bloku** (spec 057, `../specs/057-homepage-strategy-docs/`) artıq API-dəndir: `views/home/mock.ts`
  silinib, ana səhifədə mock blok qalmayıb. Sənədlər ayrıca sorğu deyil, `GET /api/v1/homepage`-in `strategyDocs` sahəsidir
  (`features/homepage/model/schemas.ts`, `.default([])`: sahəsi olmayan köhnə API-də blok sadəcə gizlənir). `api-cbar` dərc olunmuş, dildə başlığı
  və işləyən keçidi olan sənədləri sıra ilə verir, `href` (saytın yolu, dilsiz, və ya mütləq URL) və `coverUrl` (dildə yoxdursa digər dilinki)
  orada həll olunur. Loader (`views/home/loader.ts` `toStrategyDoc`) ilk `STRATEGY_DOCS_MAX` (3) sənədi götürür, yola dil prefiksini qoyur; sorğu
  xətasında siyahı boşdur. Widget `widgets/home-cards/strategy-docs.tsx`: birinci böyük kartdır, keçid `SmartLink` ilə (xarici URL yeni vərəqdə).
  Kartların hədəf səhifələri `entities/page-node`-da `STRATEGY_SLUG` (104, köhnə `/pages/strategy`), `RISK_SUPERVISION_SLUG` (66),
  `MICROFINANCE_SLUG` (76). Köhnə ünvanlar: `/pages/strategy`, `page-872/*`, `page-878/*` `proxy.ts` `LEGACY_PAGES`-dədir; nöqtəli yol proxy-yə
  çatmadığı üçün iki köhnə PDF (`/2024_2026_Azerbaijani.pdf`, `/2024_2026_English.pdf`) `next.config.ts` `redirects()`-dədir (308). 104-ün
  mətni (portret, müraciət, imza, PDF linki) `tools/media-backfill/import-strategy-page.mjs` ilə köçürülür, yeni `AboutLayoutKind` yoxdur. Portretin sağda durması `app/cms-content.css`-dəki
ümumi qaydadandır (T061): sağa / mərkəzə düzlənmiş abzasın şəkli auto inline margin alır (preflight `img`-i blok edir, `text-align` onu
tərpətmir), tab-dan dar ekranda sağa düzlənmiş şəkil tam enlidir.
  Redaktor qeydi `../dokumentasiyalar/ana-sehife-bloklari-guide.md` §3.7.
- **"Haqqımızda" bölməsi** (spec 024, `../specs/024-about-us-redesign/`): şablon + CMS səhifələri,
  təşkilat, şöbə və bio eyni şablondadır; `widgets/about-blocks` (tarix kartları, qutu, accordion, timeline, missiya, əməkdaş kartları),
  `features/about-content` (slug → layout, CMS HTML → bloklar). Bloklar ayrıca sahədən yox,
  redaktorun cədvəl/sitat/accordion/başlığından qurulur — qaydalar
  `../specs/024-about-us-redesign/contracts/cms-markup.md`-də, redaktor təlimatı
  `docs/about-cms-guide.md`-də. Parser `shared/lib/html-blocks.ts`-dir (DOM-suz, dependency-siz);
  tanınmayan blok adi məzmun kimi qalır, mətn atılmır. Kontrakt dəyişəndə `parse.test.ts`,
  təlimat və admin roundtrip eyni dəyişiklikdə yenilənir.
  **Layout guard-ı məcburidir:** hər `AboutLayoutKind` üçün `features/about-content/fixtures/<layout>.html` (redaktorun saxladığı forma)
  və `model/layout-fixtures.test.ts`-də `EXPECTED_BLOCKS` sətri olmalıdır, yoxsa `typecheck` qırılır. Eyni fayl admin panelin
  `src/features/rich-text/fixtures/layouts/`-unda da durur, `check:layout-fixtures` ikisini tutuşdurur. Mövcud layout-a yeni slug əlavə
  etmək guard tələb etmir.
- **"Media" bölməsi** (spec 028, `../specs/028-media-redesign/`): `/media` CMS "Media" səhifəsini
  (slug `media`, az/en eyni) şablonda göstərir — giriş mətni və menyu CMS-dəndir, kodda ad yoxdur.
  Qalereya/video siyahıları `/media/galleries`, `/media/videos`-dadır — bir view, iki link tab
  (`views/media-gallery-list`, spec 035, `../specs/035-media-gallery-redesign/`): H1 "Qalereya", `ListFilter`
  (`q`, `from`, `to`), Xəbər kartı (`NewsGrid`), 9 kart/səhifə. Detallar `views/gallery` (`PhotoGallery`) və
  `/media/videos/{id}` (`views/video`, `VideoPlayer`). Media ağacının CMS səhifələri
  də şablondadır, amma About blokları almır. Proxy matcher-i yalnız `/media/{rəqəm}` fayl
  proxy-sini kənarda saxlayır; köhnə `/gallery/photos…`, `/videos` `legacyRedirect()`-dədir.
  Redaktor qeydi `docs/media-cms-guide.md`. Alt bölmələrin Figma dizaynı sonrakı spec-lərdir.
  Xəbərlər/Elanlar (`/press-releases`, spec 029): `widgets/news-grid` + `views/press-release`. Elanlar
  (`type=2`, spec 031, `../specs/031-announcements-layout/`) şəkilsizdir: siyahıda `NewsGrid variant="text"`
  (tarix + başlıq), detalda örtük/qalereya yoxdur — şəkil qoşmaları da adi fayl sətridir
  (`splitPressReleaseAssets(assets, 'files')`, `Attachments imagesAsFiles`). Müsahibələr və çıxışlar (`type=3`,
  spec 033, `../specs/033-media-interviews/`): siyahı Xəbərlər kimidir, detal `document` rejimidir: mətn + `Save as PDF`
  (ilk PDF, `download` adı `pdfFileName`), örtük, qalereya, tarix yoxdur, ilk şəkil yalnız kartdadır. Rejimi
  `layoutFor(type)` seçir. Başqa dilin faylını `api-cbar` süzür, sayt `locale` görmür.
  Tədbirlər (spec 034, `../specs/034-media-events/`): `/media/events` (`views/media-events`) və detal (`views/media-event`). Gələcək/keçmiş
  `api-cbar`-dan gəlir (`upcoming`), "Daha çox göstər" `limit` parametridir. Bağlı səhifəli tədbir CMS səhifəsini açır. Ana səhifə Təqvimi də
  buradandır: spec 059-dan (`../specs/059-home-calendar-newest/`) `sort=newest&pageSize=3` ilə tarixə görə ən yeni 3 tədbir, keçmiş və ya gələcək.
  Sətir başlıq linkinin `after:absolute after:inset-0` ilə uzadılmış bir linkidir, başlıq `/media/events`-ə aparır. Köhnə alt ağacı menyular `isEventsNode` ilə gizlədir, səhifələr ağacda qalır.
  Media sorğuları (spec 037, `../specs/037-media-requests/`): CMS səhifəsi `media-sorgulari`, layout `mediaLayoutFor`-dan. Birinci cədvəl
  kontakt kartlarıdır (`features/about-content/model/media-requests.ts`, `widgets/about-blocks/contact-cards.tsx`), qaydaya uymayan cədvəl
  adi məzmun qalır. Digər Media səhifələri `plain`-dir.
  Məlumatların yayımlanması qrafiki (spec 039, `../specs/039-media-release-schedule/`): `/media/release-schedule`
  (`views/media-release-schedule`, `widgets/release-schedule-table`, `widgets/decisions-dialog`). Cədvəl `GET /api/v1/release-schedule`-dəndir,
  başlıq və giriş CMS səhifəsi 130-dan (`features/release-schedule/model/intro.ts` köhnə əl cədvəlini sətirlər olanda kəsir). `q` axtarışı
  loader-dədir (`model/search.ts`, İ/ı qatlaması). Menyu node-u `isReleaseScheduleNode`/`FEATURE_ROUTES` ilə yeni ünvana aparır, köhnə
  `page-72/*` və səhifənin slug-ları `legacyRedirect()`-dədir. `ListFilter dates={false}` yalnız axtarış sahəsidir.
  Mərkəzi Bankın loqosu (spec 040, `../specs/040-media-logo/`): CMS səhifəsi `merkezi-bankin-logosu` / `central-bank-logo`, layout
  `brand-logos` (`features/about-content/model/brand-logos.ts`, `widgets/about-blocks/brand-logos.tsx`). Birinci cədvəl versiya kartlarıdır
  (`Şəkil | Ad | İzah | Fon`), birinci şəkil Hero-dur, səhifənin faylları yükləmə kartlarıdır və `Attachments` göstərilmir. Ünvan və API dəyişməyib.

## 4. Konfiqurasiya, təhlükəsizlik

- `src/server/env.ts`: `API_URL`, `NODE_ENV`, `TZ`, `CSP_FRAME_SRC` — Zod ilə, boot-da.
- CSP `src/proxy.ts`-də nonce ilə: `img-src`/`media-src` API origin (+ `https:`), `frame-src`
  YouTube + `CSP_FRAME_SRC`; `connect-src 'self'` — brauzer API-yə getmir.
- Cookie: yalnız `ui-theme` (`docs/cookies.md`) + menyu aktiv olanda vendor widget-in
  `accw` sessiya cookie-si. Dil yalnız URL-dir; prefikssiz ünvan həmişə `/az`-a
  yönləndirilir.
- **Müyəssərlik menyusu** (spec 007, `../specs/007-accessibility-widget/`): CERT.az
  widget-inin yoxlanmış surəti `public/vendor/accw/`-dədir — mənbə, SHA-256, yamaqlar
  və yeniləmə addımları `VENDOR.md`-də; faylları əl ilə redaktə etmə. Bu, konstitusiya
  X.4 (üçüncü tərəf runtime skripti) və X.1 (`innerHTML`) üzrə **sapma D-1**-dir.
  `widgets/accessibility-widget` onu SSR `<script defer nonce>` kimi qoşur —
  `next/script`/`async` **işlətmə**: widget yalnız `readystatechange`-də init olur.
  Dil dəyişdiricisi buna görə `next/link` yox, adi `<a>`-dır (tam yüklənmə).
  Aktivlik `api-cbar` `GET /api/v1/site-settings/accessibility-widget`-dən gəlir
  (10 s keş, xəta → deaktiv).

## 5. Test və gate

```bash
npm run verify        # setup:check → check:self-contained → check:layout-fixtures → check:chart-layout → lint → typecheck → test:run → build
npx vitest run src/views/home/loader.test.ts
```

- View: `renderApp(<View data={fixture}/>, {locale})`; loader: MSW node (`shared/testing/handlers/*`,
  `onUnhandledRequest: 'error'`) — kontraktdan kənar sorğu testi qırır.
- Fikstürlər `shared/testing/fixtures/*`; baza ünvanı `shared/testing/api-base.ts`
  (handler faylları barrel-dən deyil, buradan oxuyur — dövri import olmasın).
- Lokal icra həmişə real `api-cbar` ilə (`../dev.ps1`); mock yalnız testlərdə.
- İki ayrı lokal əmr, qarışmasın deyə iki ayrı port: `npm run dev` → **:3001**, lokal
  API (`.env.development`, `localhost:5139`); `npm run local:testcbar` → **:3002**,
  test API (`https://api-cbar-test.cbar.az`). İkincisi `API_URL`-i uşaq prosesin
  mühitinə qoyur (`@next/env` təyin olunmuş dəyişəni `.env.*`-dan üzərinə yazmır) və
  başlamazdan əvvəl `/healthz` + `/media/1` yoxlayır. `--api=`, `--port=`,
  `--skip-check` ilə dəyişir; `scripts/dev/local-testcbar.mjs`.

## 6. Diqqət

- AZ hərfli fayllar yalnız UTF-8 qoruyan alətlərlə yazılır (`utf8-guard.test.ts`).
- Doc-comment-lərdə `*/` ardıcıllığı (məs. `features/*/api`) blok şərhi qırır — yazma.
- Köhnə `../web-cbar` **dəyişdirilmir**; davranış referansıdır.
- Yeni port/servis əlavə olunanda `../dev.ps1`, `../dev.sh`, `../GUIDE.md`, root `CLAUDE.md`
  eyni dəyişiklikdə yenilənir.
