# Research: Maliyyə savadlılığı bölməsinin Figma redizaynı

Bütün faktlar 2026-11-16 tarixində ölçülüb: test API (`https://api-cbar-test.cbar.az`), DB dump `schema-new/cbar-schema-and-data-20260914.sql`,
Figma bridge (fayl "cbar website (Copy)", səhifə `2230:66160`) və kod.

## R1. Test mühitinin vəziyyəti

**Fakt.** `GET /api/v1/pages/tree` (az/en):

```text
106 maliyye-savadliligi / financial-literacy                 (bölmə kökü)
├─ 107 umumi-melumat / general-information
├─ 108 seminarlar-vebinarlar        (en-də yoxdur, show_en=false)
├─ 109 musabiqeler                  (en-də yoxdur)
├─ 110 maliyye-savadliligi-portali / financial-literacy-portal
├─ 111 virtual-tehsil-platformasi / virtual-education-platform
├─ 112 maliyye-mehsul-ve-xidmetlerinin-melumat-axtaris-sistemi / information-and-search-system-for-financial-products-and-services
└─ 452 maliyye-savadliligi-copy / financial-literacy-copy    "Maliyyə savadlılığı (Kopya)"
   └─ 453–458: 107–112-nin "(Kopya)" surətləri (`-copy` slug-ları)
```

Hamısında `showInSideNav: true`, `navUrl: null`. Test mühitinin mətni dump ilə **bayt-bayt eynidir** (8 sətir: 106/110/111/112 × az/en): heç kim redaktə
etməyib.

**Fakt.** Kök **106 boş deyil**: onun mətni 107-nin mətni ilə eynidir, 7 şəkli də (1380–1386) öz faylı kimi qoşulub. API-də fallback yoxdur
(`api-cbar` `PagesController.GetBySlug` yalnız slug ilə oxuyur). Deməli redaktorlar mətni köka özləri köçürüblər.

**Qərar.** Spec-in 5-ci qərarı ("kök Ümumi məlumatı göstərsin") **kökün öz mətni ilə** yerinə yetirilir: loader-ə fallback əlavə olunmur. 107-nin ünvanı
köka yönləndirilir, 107 isə sol menyudan çıxır. Seed 107-yə toxunmur, çünki səhifə ziyarətçiyə görünmür.
**Alternativ:** kök boş olanda 107-nin mətnini oxumaq. Rədd edildi, çünki əlavə API çağırışı və xüsusi hal tələb edir, mühitlərin heç birində kök boş
deyil. Kök boş olsa, bu günkü davranış qalır: alt səhifə kartları göstərilir (`childPages`).

**Fakt.** 452 tək surət səhifə deyil, **bölmənin bütöv qaralama alt ağacıdır**. Bu, "Haqqımızda (Kopya)" nümunəsindəki (spec 024) qaralama üsuludur.
Seed 452-ni sol menyudan çıxarır (spec 041 qaydası ilə alt ağac da onunla çıxır). `-copy` slug-ları orijinalın layout-unu alır, ona görə redaktor
qaralamada yeni görünüşü görə bilir.

## R2. Bölmə şablonu

**Fakt.** `entities/page-node` `SECTION_TITLES` yalnız `about | media | cooperation` bölmələrini tanıyır. "Maliyyə savadlılığı" bölməsi bu gün köhnə
spec 002 görünüşündədir (`SectionSidebar`, mavi başlıq zolağı). Figma isə bölmə şablonunu göstərir: breadcrumb, paylaşma və sol menyu (spec 043 ilə eyni).

**Qərar.** Yeni `SectionKey` `'literacy'` əlavə olunur: `SECTION_TITLES.literacy = {'Maliyyə savadlılığı', 'Financial Literacy', 'Financial literacy'}`.
`views/cms-page/loader.ts` `sectionLayout` yeni `literacyLayoutFor(slug)`-ı çağırır. Bu, spec 043-ün "yeni bölmə bir sətirdir" qaydasıdır.

## R3. Layout-lar

**Qərar.** İki yeni `AboutLayoutKind`:

| Layout | Slug-lar (az / en, `-copy` ilə) |
|---|---|
| `financial-literacy` | `maliyye-savadliligi`, `financial-literacy`, `umumi-melumat`, `general-information` (+ hər birinin `-copy`) |
| `literacy-platform` | `maliyye-savadliligi-portali`, `financial-literacy-portal`, `virtual-tehsil-platformasi`, `virtual-education-platform`, `maliyye-mehsul-ve-xidmetlerinin-melumat-axtaris-sistemi`, `information-and-search-system-for-financial-products-and-services` (+ `-copy`) |

`umumi-melumat` reyestrdə qalır, çünki onun `-copy` surəti qaralamadır və yönləndirilmir. Üç platforma səhifəsi bir layout paylaşır: Figma-da eyni
komponentlərdir (giriş, qeyd qutusu, foto sırası, xətli bölmələr, düymə). Seminarlar və Müsabiqələr `plain` qalır.

## R4. İşarələmə qaydası (redaktor nə yazır)

**Fakt.** Admin redaktoru (`features/rich-text/model/extensions.ts`) bunları saxlayır: `h1–h6`, `blockquote`, `ul/ol/li` (StarterKit), `<a data-media-link>`
(`MediaLink`), inline `img`, cədvəl, `details`. Yeni extension lazım deyil.

**Qərar.** Bloklar yalnız yuxarı səviyyəli elementlərdən tanınır. Hər qayda ya bütöv tanınır, ya da blok adi məzmun kimi qalır (spec 024 prinsipi).
Qaydaların özü [contracts/cms-markup.md](./contracts/cms-markup.md)-dədir. Əsas fərqləndirmələr:

- **Sitat ↔ CTA ↔ qeyd**: üçü də `blockquote`-dur. İçində `mailto:` link varsa CTA-dır. `financial-literacy` layout-unda qalanı sitatdır
  (sonuncu paraqrafı mənbədir). `literacy-platform` layout-unda qalanı qeyd qutusudur.
- **Prinsip kartları ↔ hədəf qrupları**: ikisi də `ul`-dur. Hər `li` qalın başlıqla açılırsa kartlardır. Qalın başlıqsız `ul` birbaşa `h3`-dən sonra
  gəlirsə etiketlərdir. Qalan `ul`-lar adi siyahıdır.
- **Qalereya**: yalnız `<a data-media-link href="/media/{id}">`-dən ibarət paraqraf. Köhnə mətn artıq bu formadadır, redaktor bunu "Media" düyməsi ilə
  yaradır. Bir linkin media faylı səhifənin faylları arasında şəkil olmayan fayl kimi varsa (`mimeType`), paraqraf adi məzmun qalır. Fayllar arasında
  olmayan id şəkil sayılır, çünki `layout-fixtures.test.ts` `parseAbout`-u kontekstsiz çağırır.
- **Platforma düyməsi**: mətnin **sonuncu** bloku, içində yalnız bir xarici `http(s)` linki olan paraqraf.

Başlıq səviyyəsi: bölmə başlığı `h2`, alt başlıq `h3`. Səhifənin `h1`-i şablondadır.

## R5. Qalereya və fayllar

**Fakt.** Figma `financial-literacy` qalereyası (`2238:36853`) xəbər detalındakı `PhotoGallery` (spec 029, `widgets/photo-gallery`) komponentidir:
böyük şəkil, oxlu miniatür zolağı. Ölçüləri: desktop 984×601 + 124, tablet 664×405 + 110, mobil 342×228 + 76.
Platforma səhifələrindəki foto sırası (`2421:3034`) isə başqa elementdir: 3 sütun, 312×208, `gap 24`, `r4`. Mobildə 280×190-luq kartlar üfüqi
sürüşür (`gap 12`).

**Fakt.** Hər üç şəkil dəsti həm mətndə link kimi var, həm də səhifə faylı kimi qoşulub (`assets`: 106 → 7, 110/111/112 → 3). `Attachments` şəkil
fayllarını miniatür zolağı kimi göstərir. Heç nə etməsək, şəkillər iki dəfə görünəcək.

**Qərar.** `financial-literacy` mövcud `PhotoGallery`-ni istifadə edir. Etiketlər `media` namespace-indədir, şəkil `/media/{id}` ünvanındandır.
`literacy-platform` üçün yeni server komponenti yazılır: foto sırası, hər şəkil faylı yeni tabda açan link. Qalereyanın istifadə etdiyi media id-ləri
blokda saxlanır, view `Attachments`-ə yalnız qalan faylları ötürür. Bu, spec 038/040-ın "bloklar faylları özü yerləşdirir" qaydasının ümumi formasıdır.

## R6. Figma ilə məzmun arasındakı fərqlər

| Fərq | Qərar |
|---|---|
| Portal səhifəsinin mətnində 3 şəkil (1387–1389) var, Figma-da portal üçün foto sırası yoxdur | Foto sırası göstərilir. Mətndə olan heç nə atılmır (spec FR-006). Redaktor istəsə linki silər. |
| Virtual Təhsil səhifəsinin tablet/mobil kadrlarında "Facts" sırası var (2017 / Ödənişsiz / 3 dil), desktop kadrında yoxdur | **Edilmir.** Desktop dizaynı əsasdır, Facts-ın mətni də yenidir və CMS-də yoxdur. Dizayner ilə dəqiqləşdiriləcək açıq sual kimi qeyd olunur. |
| Kökdə Figma mətni köhnədən fərqlidir: başlıqlar, kartların təsviri, "Yüksək rifah üçün aşağıdakı…" kimi cümlələr | Seed Figma-dakı az mətni yazır. Köhnə en tərcümədən istifadə olunur, yeni hissələr qaralama tərcümədir ([data-model.md](./data-model.md) §4). |
| Figma-da `h2`-dən əvvəl giriş paraqrafı bir dənədir, köhnədə də elədir | Uyğundur. |
| Figma-da sitatın mənbəyi " İƏİT (…), 2012" boşluqla başlayır | Boşluq kəsilir (`trim`). |

## R7. İkonlar

**Fakt.** Prinsip kartında 48×48 dairə var (`#cff3ec`), içində 24px ikon. Hədəf qrupunda 36×36 dairə (`#e9faf7`), içində 20px ikon.
Figma-da ikonlar instance-ların içindədir (`I2249:118793;2249:118689` …). Bridge `I…;…` id-lərini tapmır (memory: figma-bridge-no-png-large).

**Qərar.** İkonlar redaktorun seçimi deyil, sıra ilə verilir: prinsiplər üçün 4, hədəf qrupları üçün 7 sabit SVG. Siyahı dizayndan uzundursa
ikonlar təkrarlanır (`index % length`). Ayrıca "ümumi ikon" çəkilmədi.
SVG-lər implement mərhələsində götürülüb:
- `figma_svg` **instance-ın özündən** işləyir (`2249:118793`), daxili `I…;…` id-lərindən isə işləmir.
- Ağır `figma_find` (`page: "*"`) plugini çökdürdü.
- Yollar kart koordinatlarındadır. `viewBox` ikon çərçivəsini kəsir (24px @ 37,37; 20px @ 21,21), yollar yenidən yazılmayıb.
- Kod `widgets/about-blocks/literacy-icons.tsx`-dədir (`currentColor`, Figma rəngi `#004976`).
**Alternativ:** ikonu redaktor `<img>` ilə versin (spec 024 missiya nümunəsi). Rədd edildi, çünki hər karta media yükləmək lazım olardı, Figma-da da
ikonlar sabit dizayn elementidir.

## R8. Yönləndirmə

**Fakt.** CMS səhifə ünvanı `/{locale}/{slug}`-dır (`nodeHref`). Route yalnız sonuncu seqmenti oxuyur. Spec 039 eyni işi
`proxy.ts` `RELEASE_SCHEDULE_SLUG` ilə görür.

**Qərar.** `proxy.ts`-ə bu qayda əlavə olunur: `^/(az|en)/(?:.+/)?(umumi-melumat|general-information)/?$` → `/{locale}/maliyye-savadliligi` (az) və ya
`/{locale}/financial-literacy` (en), 308. `-copy` slug-ları uyğun gəlmir. Köhnə Yii2 saytında bu bölmənin xüsusi ünvanı yoxdur (`product-host`-da
`Financial-Literacy-Portal` yalnız tərcümə açarıdır, səhifələr ümumi CMS-dəndir), ona görə əlavə legacy xəritə lazım deyil.

## R9. Seed (`0030-financial-literacy-seed.sql`)

**Qərar.**
- Yeni fayl `0030-financial-literacy-seed.sql`. Bu nömrə hər iki API repo-da boşdur (`api-cbar/db/migrations` yalnız README-dir).
- Dəyişdiyi yerlər: yalnız `page_translations.content` (106, 110, 111, 112 × az/en) və `page_details` (`INSERT … ON CONFLICT DO NOTHING`).
  Sxem dəyişmir, `ALTER` yoxdur.
- Səhifələr slug ilə tapılır, id ilə yox.
- Mətn yalnız **köhnə mətnin md5-i tutursa** yazılır:

  | Səhifə | az md5 | en md5 |
  |---|---|---|
  | 106 | `6e383b3ce152cbc919085e18662ef3bd` | `056c6e76ace0b74c578500a90f808272` |
  | 110 | `5b5e10f6a600c0ec257feca4d0bee0d3` | `e316fb18301cb570ff5eaddebb3241cb` |
  | 111 | `e9f452f576a0f95f6057e0a9bf5ea8fe` | `910bcce9667d82db15230275dec7d262` |
  | 112 | `19fca6a8fb68a11470f377c286e258c8` | `1926d220609495b2c1f6ef391940318b` |

  Redaktə olunmuş mətnin md5-i uyğun gəlmir, ona görə toxunulmur. Təkrar işə salınanda da yeni mətnin md5-i fərqli olduğu üçün heç nə dəyişmir.
- `page_details`: 107, 108, 109 və 452 üçün `show_in_side_nav = false`. Sətir artıq varsa redaktorun seçimidir, toxunulmur.
- İcazə yoxlaması 0029 kimidir: `has_table_privilege` çatmayanda `RAISE WARNING`, yayım dayanmır.
- Yeni mətn redaktorun saxladığı formadadır (fixture-larla eyni). Səhifə açılıb saxlananda dəyişmir.

**Yoxlama.** PGlite üzərində real icra (memory: pglite-api-testing): dump-ın `pages`, `page_translations` və `page_details` sətirləri ilə dörd ssenari
yoxlanır: köhnə mətn, redaktə olunmuş mətn, səhifə yoxdur, təkrar icra.

## R10. Sabitlər, i18n, client sərhədi

- Yeni rəqəmlər (sütun sayı, ikon ölçüləri) `widgets/about-blocks/constants.ts`-dədir (spec 032).
- Chrome mətnləri `locales/{az,en}/about.json` `literacy.*` açarlarına yazılır: CTA düyməsi `"{{email}}-a yazın"` / `"Write to {{email}}"`,
  foto sırasının adı, qalereya etiketləri.
- Yeni `'use client'` yoxdur. `PhotoGallery` artıq client komponentidir, foto sırası, kartlar və CTA server komponentləridir.
