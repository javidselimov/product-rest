# Research: "İstehlakçıların və investorların hüquqları" bölməsi (spec 050)

Mənbələr (2026-11-17): test API `api-cbar-test.cbar.az` (`/api/v1/pages/tree`, `/api/v1/pages/{slug}`, az və en), Figma bridge
("Consumer and Investor Rights" `2445:16785`), `product-host` (Yii2), `web-cbar-new` kodu, `api-cbar-admin/db/migrations`.

## R1. Köhnə saytda bu bölmənin xüsusi məntiqi yoxdur

- **Decision**: Bölmə redaktorun adi HTML-indən qurulur. API, sxem və admin panel dəyişmir.
- **Rationale**: `product-host`-da bu bölmə üçün nə controller, nə view, nə modul var. Hamısı ümumi `visitor/views/pages/index.php` ilə göstərilir.
  Məntiq tamamilə redaktorun HTML-indədir: iç-içə `<details data-accordion>` (il → ay), `<a data-media-link href="/media/{id}">` fayl linkləri
  və cədvəllər. Spec 024 və 044–047 eyni yolla getdi.
- **Alternatives**: Ayrıca məzmun növü (arxiv faylları, statistika sətirləri admin bölməsi kimi). Rədd edildi: 200+ faylın və min-lərlə
  cədvəl hüceyrəsinin köçürülməsi lazım olardı, redaktorun indiki iş axını (ay əlavə et → fayl linklə) pozulardı, üç repo dəyişərdi.

## R2. Bölmə açarı və tanınma

- **Decision**: `SectionKey` `consumer`, `SECTION_TITLES.consumer = {'İstehlakçıların və investorların hüquqları', 'Consumer and Investor Rights',
  'Consumer and investor rights'}`. `sectionLayout` `consumerLayoutFor(slug)`-ı çağırır.
- **Rationale**: Spec 043/047 qaydası: yeni bölmə bir sətirlə qoşulur. "(Kopya)" qaralaması (433) `isSectionCopy` ilə artıq tanınır.

## R3. Layout-lar: dörd yeni `AboutLayoutKind`

| Layout | Səhifələr (az / en slug, `-copy` daxil) | Bloklar |
|---|---|---|
| `consumer-text` | 87 kök, 88 (qaralama üçün), 86 | lead, adi paraqraflar, başlıq sətri, nömrələnmiş siyahı |
| `complaint-index` | 95 (+96 yoldaş) | tablar, son məlumat, il → ay arxivi, metodologiya |
| `appeal-statistics` | 94 (+93 yoldaş) | qısa icmal, kanal/il cədvəli, infoqrafika (son məlumat + arxiv) |
| `consumer-documents` | 101 | akkordeon bölmələri, içində mətn + sənəd kartları |

- **Rationale**: Hər Figma şablonu bir layout-dur. 86 və kök eyni şablondadır (lead + nömrələnmiş kartlar). 96 və 93-ün öz layout-u yoxdur, çünki
  onlar yönləndirilir (R6) və yalnız yoldaş kimi oxunur.
- **Alternatives**: Bir ümumi `consumer` layout. Rədd edildi: guard (`EXPECTED_BLOCKS`) layout başına fixture tələb edir, bir fixture dörd fərqli
  şablonu ifadə edə bilməz.

## R4. Yoldaş səhifə (birləşən səhifələr)

- **Decision**: `loadCmsPage` host layout-u `complaint-index` və ya `appeal-statistics` olanda yoldaş səhifəni də oxuyur (`getPage(locale, slug)`).
  Yoldaş slug-ları sabitdir: `entities/page-node` `CONSUMER_COMPANION` (`complaint-index` → az `avto-icbari-sigorta-uzre-sikayet-indeksi`,
  en `complaint-index-on-compulsory-mtpl-insurance`; `appeal-statistics` → az `infoqrafika`, en yoxdur). Yoldaşın xətası və ya yoxluğu
  (`null`) host səhifəni pozmur: tab/infoqrafika bloku göstərilmir (spec Edge Cases). Yoldaşın faylları `ParseContext.companionFiles` ilə ötürülür.
- **Rationale**: `loadCmsPage` `cache()`-dədir, əlavə bir sorğu yalnız bu iki səhifədə gedir (spec 044/045-in əlavə API çağırışı nümunəsi).
  Slug sabiti layout cədvəli ilə eyni yerdə yaşayır. Slug dəyişsə layout da dəyişir.
- **Alternatives**: (a) Ağacdan qardaşı id ilə tapmaq. Rədd edildi: 93 en ağacında yoxdur, id sabiti mühitlər arasında fərqlənə bilər. (b) Seed ilə
  96-nın mətnini 95-ə köçürmək. Rədd edildi: redaktor iki səhifəni ayrı-ayrı yeniləyir, birləşdirmə onun iş axınını dəyişərdi.

## R5. Seçim vəziyyəti: tab, kanal, il

- **Decision**: URL sorğu parametrləri, server render, `Link`. `QUERY_PARAM.TAB = 'tab'` (`bank` | `insurance`), `QUERY_PARAM.CHANNEL = 'channel'`
  (kanalın redaktor sırasındakı 1-dən başlayan nömrəsi), `QUERY_PARAM.YEAR = 'year'` (4 rəqəm). Route `searchParams`-ı `CmsPageView`-a `query` kimi
  artıq ötürür (spec 045). Seçim view-da olur (`selectConsumerView(blocks, query)`), `loadCmsPage` imzası dəyişmir. Yanlış dəyər defolta düşür
  (Bank; birinci kanal; həmin kanalın ən yeni ili). Tab linkləri `role="tablist"` deyil, `nav` + `aria-current` ilə işarələnir, çünki hər klik yeni
  səhifədir (spec 035 link-tab nümunəsi).
- **Rationale**: Layihə qaydası (web-cbar-new CLAUDE.md §2): "İnteraktiv seçim = URL sorğu parametri + server render". JS-siz işləyir, link paylaşılır
  (US2 ssenari 2), yeni `'use client'` yoxdur.
- **Alternatives**: Client tab state. Rədd edildi: yeni client komponenti, JS-siz işləmir, link seçimi saxlamır.

## R6. Yönləndirmələr

- **Decision**: `proxy.ts` `legacyRedirect()`-ə üç qayda (308, locale yönləndirməsindən əvvəl, spec 047 `LITERACY_GENERAL_SLUG` forması — düz və ya
  hər hansı yolun sonunda slug):
  - 88 `fealiyyet-istiqametleri` / `activity-directions` → `/{locale}/{kök slug}`;
  - 93 `infoqrafika` → `/az/{94 slug}#infoqrafika` (en slug yoxdur);
  - 96 az/en slug → `/{locale}/{95 slug}?tab=insurance`.
  `-copy` slug-ları uyğun gəlmir (qaralama öz ünvanında qalır).
- **Rationale**: Slug hər dildə unikaldır (root CLAUDE.md), ona görə slug sonluğu səhifəni birmənalı tanıyır. Yönləndirmə sabitləri `entities/page-node`-dadır
  (`CONSUMER_ROOT_SLUG`, `CONSUMER_*_SLUGS`). Seed başlıqları dəyişir, slug-ları yox, ona görə hədəflər sabitdir.

## R7. 86-nın köçürülməsi — ünvan dəyişmir

- **Decision**: Seed `pages.parent_id`-ni və `path`-i kökə (87) keçirir, `sort_order`-u 101-inkindən bir az kiçik edir. `page_details.show_in_side_nav`-ı
  `true` edir. Yönləndirmə qaydası lazım deyil.
- **Rationale**: Menyular `nodeHref` ilə düz `/{locale}/{slug}` verir, loader ünvanın yalnız son seqmentini oxuyur. Ona görə həm `/az/{slug}`, həm köhnə
  iç-içə `/az/media/{slug}` açılır və şablonu ağacdakı yeni yerdən alır. Test mühitində 86-nın `show_in_side_nav` dəyəri `false`-dur (redaktor onu Media
  menyusundan gizlədib). Yeni bölmənin menyusunda görünməsi üçün köçürmə ilə birlikdə `true` olmalıdır. Bu, yalnız köçürmə baş verəndə (86 hələ
  Media altında olanda) yazılır, sonra redaktorun seçiminə toxunulmur.
- **Sıra**: `api-cbar` ağacı `ORDER BY sort_order, id` ilə qurur. Sol menyuda görünən sıra 94, 95, 86, 101 olmalıdır (aradakı gizli səhifələr sayılmır).
  86.id < 101.id olduğu üçün `sort_order = 101.sort_order` bərabərlikdə də 86-nı 101-dən əvvələ, 95-dən (sort_order daha kiçikdirsə) sonraya qoyur.
  Seed bunu `95.sort_order < 101.sort_order` olduqda yazır, əks halda `sort_order = 95.sort_order + 1` istifadə edir. Dəqiq dəyərlər PGlite-də dump ilə yoxlanır (quickstart §2).
- **Privilege**: `has_table_privilege('pages', 'UPDATE')` yoxlanır, yoxdursa xəbərdarlıq verilir və köçürmə atlanır (0028/0030 nümunəsi).
  Bu, cədvələ `ALTER` deyil, sətir dəyişikliyidir (root CLAUDE.md Migrations qaydası).

## R8. Arxiv parser-i (il → ay → fayl)

- **Decision**: `model/year-archive.ts`. Üst səviyyədə `<details>` → `<summary>` mətni 4 rəqəmli ildirsə il. İçində (`div`/`table`/`tbody`/`tr`/`td`/`div`
  sarğıları rekursiv açılır) `<details>` → `<summary>` ay adı → ilk `data-media-link` linki. Ay adı az və en ay adları cədvəlindən tanınır
  (`MONTHS_AZ`, `MONTHS_EN`, böyük-kiçik hərf və `İ/ı` fərqinə dözümlü). Tanınmayan ay adı da saxlanılır (`month: null`, sıra redaktorundur).
  İllər azalan, aylar ay nömrəsinə görə azalan sıralanır. "Son məlumat" ən yeni ilin ən yeni faylıdır.
- **Rationale**: 93, 95, 96 eyni quruluşdadır (test API: 65, 64, 79 link). Bir parser üç yerdə işləyir.
- **Edge**: Linksiz ay atılır. İl tapılmırsa layout `plain`-ə düşür (FR-012). İldən kənar mətn (məs. metodologiya) `restHtml`-də qalır.

## R9. Statistika parser-i və qısa icmal

- **Decision**: `model/appeal-statistics.ts`. Üst səviyyə `<details>` = kanal. Başlıq " üzrə statistika" / " statistics" sonluğu atılaraq tab adı olur.
  İçində il `<details>`, onun içində birinci `<table>` = cədvəl. İki forma tanınır:
  - **ay × sektor** (birinci sütunun birinci sətri "Aylar"/"Months", sonrakı sətirlər ay adı, sonuncu "Yekun"/"Total"): `MonthTable`;
  - **digər** (Səyyar qəbul: şəhər × ay): `GenericTable` — sətirlər olduğu kimi göstərilir, icmala daxil deyil.
  **İcmal**: `MonthTable` formalı kanalların hamısında ən yeni ilin ən son **dolu** sətri (bütün rəqəm hüceyrələri boş deyil) tapılır. Ay = bu ayların
  minimumudur (clarify Q3: ortaq son ay). Hər kart: kanal adı, həmin ayın "Cəmi" sütunu (yoxdursa sektorların cəmi), sektor sətirləri
  (başlıq sətrindəki sütun adları, "Cəmi" xaric). Ortaq ay yoxdursa icmal `null`-dur.
- **Rationale**: Test məlumatında dörd kanal eyni formadadır, Səyyar qəbul çevrilmişdir (clarify Q1 zamanı yoxlanıb). Forma tanıma açar söz
  siyahısından etibarlıdır: yeni kanal əlavə olunsa və eyni formada olsa, icmala avtomatik düşür.
- **Rəqəm**: hüceyrə mətni boşluq/nöqtə/vergül təmizlənərək tam ədəd kimi oxunur; oxunmursa həmin sektor sətri göstərilmir (spec Edge Cases).
- **Figma-dan sapma (qeyd olunur)**: kart başlıqları redaktorun kanal adıdır ("Yazılı müraciətlər"), Figma-dakı "Vətəndaşların yazılı müraciətləri" yox;
  kartların sırası redaktorun sırasıdır (Figma: zənglər birinci); "Kapital bazarı" CMS sütun adıdır (Figma: "Kapital bazarları"). Hamısı redaktor
  mətnini dəyişərək düzəldilə bilər, kod dəyişmir.

## R10. Metodologiya və Sənədlər bölmələri

- **Decision (metodologiya)**: Host və yoldaş səhifənin mətnində arxivdən sonra gələn `<h2>` ilə başlayan hissə metodologiyadır. Onun içində
  üç paraqraflı `<blockquote>` düsturdur: 1-ci paraqraf sol tərəf ("Şikayət indeksi ="), 2-ci surət, 3-cü məxrəc. "Qeyd:" ilə başlayan paraqraf
  boz qeyd kimi göstərilir. Qalan paraqraflar adi mətndir. Seed bu mətni 95-ə (Bank) və 96-ya (Sığorta) yazır, yalnız həmin `<h2>` hələ yoxdursa.
- **Decision (Sənədlər)**: Üst səviyyə `<details>` = bölmə. İçindəki məzmun `CmsContent` ilə göstərilir, amma yalnız `data-media-link` linkindən
  ibarət paraqraf sənəd kartına çevrilir (`AboutFileRow` forması, fayl tipi page `assets`-dəki `mimeType`-dan). Seed "İnformasiya sorğusu" bölməsini
  (Figma mətni) 101-in sonuna əlavə edir, yalnız belə `<summary>` hələ yoxdursa.
- **"966 Qaydaları" PDF-i**: Test mühitinin media kitabxanasında yoxdur (bölmənin bütün `assets` siyahıları yoxlanıb; 89-da başqa "Qaydası" var, media 1108).
  Seed fayl linki yazmır. Redaktor təlimatı faylı yükləyib bölməyə linkləməyi göstərir. **Açıq sual**, MR təsvirində qeyd olunur.

## R11. Kök səhifə və 86 (`consumer-text`)

- **Decision**: Birinci paraqraf lead-dir (Figma 18/30 Medium). Yalnız `<strong>` olan paraqraf başlıq sətridir (`promoteHeadingLines`, spec 024),
  `ul`/`ol` nömrələnmiş kartlara çevrilir (Figma "Number" + "Text"). Qalanı adi mətndir. Seed kökün az/en mətnində birinci paraqrafı iki cümləyə
  bölür (Figma: lead + "Bununla əlaqədar…"), yalnız mətn hələ köhnədirsə (md5, 0030 nümunəsi). 86-nın mətni olduğu kimi uyğundur: birinci `<p><strong>`
  lead olur.

## R12. Sol menyu və yeni migration

- **Decision**: `api-cbar-admin/db/migrations/0031-consumer-rights-seed.sql` (sonuncu `0030`; `api-cbar`-da migration yoxdur, ad unikaldır). Tək
  `DO $seed$` bloku: icazə yoxlaması → 86-nın köçürülməsi (R7) → başlıqlar (95, 101; yalnız köhnə başlıq) → kök mətni (md5) → metodologiya (95, 96) →
  İnformasiya sorğusu (101) → `page_details` `show_in_side_nav=false` 88–93, 96–100, 102, 103, 433 üçün (`ON CONFLICT DO NOTHING`). Səhifələr az slug ilə tapılır.
  Başqa bazada bu səhifələr yoxdursa, heç nə dəyişmir.
- **en başlıqlar**: 95 → "Complaint indices", 101 → "Documents". Metodologiya və İnformasiya sorğusunun en mətni tərcümə qaralamasıdır (spec 045/046 kimi).

## R13. Sənədlər (FR-015) — iki təlimat

- **Decision**: `dokumentasiyalar/istehlakci-huquqlari-guide.md`: redaktor üçün bölmənin admin paneldən idarəsi, `dokumentasiyalar/README.md`-nin vahid
  quruluşunda (qısa xülasə → hazırlıq → admin paneldə əməliyyatlar → saytda nə görünür → yoxlama siyahısı → problemlər → developerlər üçün).
  README-yə yeni "İstehlakçı hüquqları" cədvəli. `web-cbar-new/docs/consumer-rights-cms-guide.md`: işarələmə qaydasının qısa forması
  (`contracts/cms-markup.md`-dən), cooperation/literacy təlimatları kimi. Kök `CLAUDE.md`-yə spec 050 bəndi, `business_logic/` `/sync-business-logic` ilə.
- **Rationale**: İstifadəçinin `/speckit-plan` arqumenti: "bu panellərin idarə edilməsi üçün `dokumentasiyalar`-da sənəd yaz". Cooperation bölməsində də iki
  təlimat birlikdə yaşayır (`merkezi-banklarla-emekdasliq-guide.md` + `docs/cooperation-cms-guide.md`).

## R14. Ölçmə üsulu

- **Decision**: Hər üç endə (1728, 744, 390) fikstür proxy + Edge CDP `getBoundingClientRect` ilə ölçmə (memory: "Fikstür proxy ilə UI ölçmə", "Figma ↔ DOM").
  Test API-də seed olmadığı üçün proxy 87, 94, 95, 96, 101-in seed sonrası mətnini fikstürdən qaytarır, qalan sorğuları test API-yə ötürür.
  744-də scrollbar 15 px-dir.

## R15. Köhnə import forması və redaktorun round-trip-i

- **Decision**: Parser həm köhnə import formasını (sarğı `div`/`table`/`td`, `<p>`-siz hüceyrələr), həm redaktorun saxladığı formanı oxuyur
  ([cms-markup §0](./contracts/cms-markup.md)). Fixture redaktor formasındadır, köhnə forma üçün ayrıca parser testi var.
- **Rationale**: Test mühitində 93–96-nın mətni redaktorda hələ saxlanmayıb. Sayt bu mətni seed-dən əvvəl də, sonra da düzgün göstərməlidir.
- **Risk**: TipTap cədvəl hüceyrəsinin içindəki `<details>`-i saxlaya bilməyə bilər. Canlı `npm run roundtrip` (quickstart §4) bunu implementasiyanın
  əvvəlində yoxlayır. İtirirsə: redaktor təlimatı yeni ayları cədvəlsiz (`details` içində birbaşa `details`) yazmağı göstərir. Seed mövcud mətni
  normallaşdırmır, çünki onun forması parser üçün problem deyil.

- **Nəticə (T003, 2026-11-17)**: Admin API lokalda işləmir. Ona görə `roundtrip-check.mjs`-in extension dəsti dəyişmədən `.tmp-050/rt/roundtrip-local.mjs`-ə
  köçürüldü və test API-dən götürülmüş 9 real mətn (93, 94, 95, 96, 101, 87, 86 az; 94, 95 en) üzərində işlədildi. **Hamısı ok**: `td > details`, cədvəllər,
  sətirlər və media linkləri saxlanır. Redaktor sarğı `<div>`-ləri atır, `colgroup` əlavə edir, hüceyrəyə `<p>`, linkə `target`/`rel` qoyur.
  Normallaşmış forma `.tmp-050/roundtrip/`-dədir, fixture-lər onun əsasında yazılır.
- **Link sayları**: `assets` siyahısına başqa dilin faylları da düşür, ona görə arxivdəki link sayı ondan azdır: 95 az 32, 96 az 45, 93 az 65. SC-002 link sayı ilə yoxlanır.
- **en kanal adları**: `Statistics of written appeals`, `WhatsApp statistics`, `Statistics on mobile reception of citizens`; cədvəl başlığı `Months`, cəmi `Total`.
  Tab adı qaydası: az ` üzrə statistika` sonluğu, en `Statistics of ` / `Statistics on ` önü və ` statistics` sonluğu atılır, ilk hərf böyük yazılır.

## R16. Real test məlumatı üzərində yoxlama (implementasiya, 2026-11-17)

`.tmp-050/api/`-dəki bütün az/en səhifələr parser-lərdən keçirildi. Bu yoxlamada aşağıdakı köhnə import halları tapıldı və parser-ə əlavə olundu:

- Köhnə import-da bütün mətn **və ya hər akkordeon** ayrıca `<div>`-ə sarılıb (Bank-da 4 il → 4 `div`). `topNodes` yuxarı səviyyədəki bütün `div`-ləri açır,
  çünki redaktor `div` saxlamır.
- en 94 "Statistics of written appeals":
  - 2026-cı il akkordeonu boşdur, cədvəli akkordeondan sonra gəlir;
  - 2025–2020 illəri kanal akkordeonu bağlandıqdan sonra yuxarı səviyyədədir.
  
  Parser boş ilə ondan sonrakı cədvəli verir, kanaldan sonra gələn il akkordeonlarını və cədvəlləri həmin kanala qatır.
- Sənədlərin köhnə forması: fayl linki `div` içində tək `<a>`-dır. `div`-lər açılandan sonra tək media linki də fayl kartıdır.
- Kanal adının ilk hərfi `toUpperCase()` ilə böyüdülür, `az` locale ilə yox ("incoming" → "Incoming", "İncoming" yox).

Nəticə: Bank 32, Sığorta 45, İnfoqrafika 65 fayl; az və en icmalı "May 2026" (4 kanal); Sənədlər 2 bölmə + 2 PDF (az/en).

**İcmal qaydasının dəqiqləşdirilməsi (implementasiya)**: hər kanal üçün doldurulmuş sətri olan ən yeni il götürülür, yalnız birinci il yox. Səbəb: redaktor
yeni ilin boş cədvəlini əvvəlcədən yaradanda (məsələn, 2027 yanvar dolmamış) icmal bütün kanallar üçün yox olmasın. Ortaq ay (clarify Q3) il
sərhədini də keçir: `il × 12 + ay` açarlarının minimumu.

**Fayl siyahısı**: `complaint-index`, `appeal-statistics`, `consumer-documents` səhifələrində `Attachments` göstərilmir (`BLOCKS_WITH_FILES`). Səbəb:
test mühitində az Bank səhifəsinin 64 `assets`-indən 32-si en faylıdır və siyahıda görünürdü. `usedMediaIds` sahəsi buna görə çıxarıldı.
