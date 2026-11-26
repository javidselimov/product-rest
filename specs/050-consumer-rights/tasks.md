# Tasks: "İstehlakçıların və investorların hüquqları" bölməsinin Figma redizaynı

**Input**: `specs/050-consumer-rights/`: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

**Tests**:
- Frontend testləri davranış testləridir: rol, `userEvent`, MSW (yaddaş `functional-component-tests`).
- Layout fixture guard məcburidir (kök CLAUDE.md).
- API-də test layihəsi yoxdur. Seed `quickstart.md` §2-dəki kimi PGlite üzərində real icra ilə yoxlanılır.

**Təşkili**: Tapşırıqlar user story-lər üzrə qruplaşdırılıb. Hər komponent ayrıca merge request-dir. Sıra: `api-cbar-admin` (yalnız SQL) → `web-cbar-new`;
`web-cbar-admin-new` (fixture) `web-cbar-new` ilə eyni seriyada birləşir. `api-cbar` dəyişmir. Workspace sənədləri (`dokumentasiyalar/`, kök `CLAUDE.md`,
`business_logic/`) ayrıca commit-dir. Commit yalnız istəklə edilir.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: paralel işlənə bilər (fərqli fayllar, açıq asılılıq yoxdur)
- **[Story]**: aid olduğu user story (spec.md):
  - US1 — bölmə şablonu, kök səhifə, sol menyu
  - US2 — Şikayət indeksləri
  - US3 — Müraciət statistikası
  - US4 — İnzibati işlər və Sənədlər
  - US5 — redaktor (round-trip, fixture-lər, təlimatlar)

## Yol qısaltmaları

- `ADMIN-API` = `product-rest/api-cbar-admin`
- `ADMIN` = `product-rest/web-cbar-admin-new`
- `SITE` = `product-rest/web-cbar-new`
- `MODEL` = `SITE/src/features/about-content/model`
- `BLOCKS` = `SITE/src/widgets/about-blocks`
- `SEED` = `ADMIN-API/db/migrations/0031-consumer-rights-seed.sql`

## Ümumi qaydalar (hər tapşırıq üçün)

- Yeni şərhlər ingiliscə yazılır. Dəyişilən faylda azərbaycanca şərhlər də ingiliscəyə çevrilir (yaddaş `code-comments-english`).
- Rəqəmlər sabitlərdə saxlanılır (spec 032): `MODEL/constants.ts`, `BLOCKS/constants.ts`, `SITE/src/shared/constants/query-params.ts`.
- `SITE`-da `prettier --write` işlədilmir. Fayllar Edit və ya Node ilə redaktə olunur (yaddaş `windows-shell-crlf`). Köməkçi skriptlər
  `.tmp-050/`-dadır (yaddaş `fork-agents-share-tmp`). Test API cavabları ora yazılır (`.tmp-050/api/<slug>.<locale>.json`).
- `SITE`-da `dangerouslySetInnerHTML` yalnız `widgets/cms-content`-də işlədilir, yeni `'use client'` əlavə olunmur, `Reveal` iç-içə olmur (spec 049).
- Seed HTML-i, sayt fixture-i, admin fixture-i və MSW fikstürü **eyni HTML-dir**. Hər layout üçün HTML bir dəfə yazılır, qalanları ondan kopyalanır.
- Parser həm redaktor formasını, həm köhnə import formasını oxuyur ([cms-markup §0](./contracts/cms-markup.md)).

---

## Phase 1: Setup

- [X] T001 Başlanğıc vəziyyətini yoxla:
  - `git status` təmizdir; iş `050-consumer-rights` branch-ındadır (`git switch -c 050-consumer-rights`).
  - `ADMIN-API/db/migrations/`-da `0031*` yoxdur, `product-rest/api-cbar/db/migrations`-da yalnız README var.
  - `SITE` və `ADMIN`-də `npm run verify` yaşıldır. Bundan sonrakı qırmızılar bu spec-dəndir.
- [X] T002 Test API məzmununu `.tmp-050/api/`-ə yaz və research-i təsdiqlə:
  - Node skripti (`.tmp-050/fetch.cjs`): `tree?locale=az|en` və 86–103, 433 səhifələrinin az/en cavabları.
  - Kök (87) az/en mətninin md5-ini, 95/101-in az/en başlıqlarını, 86-nın ana səhifəsini və `showInSideNav`-ını, 94–101 `sort_order` sırasını (ağac sırası) qeyd et.
  - Fərq varsa `research.md` R7/R12-ni yenilə.
- [X] T003 Canlı round-trip riskini yoxla (research R15, quickstart §4):
  - `cd ADMIN && npm run roundtrip -- "Bank xidmətlərindən istifadə üzrə şikayət indeksi" "Vətəndaş müraciətlərinə dair statistika" "İnfoqrafika" "Kapital bazarı" "İnzibati işlərə baxan vəzifəli şəxslər"`.
  - Nəticəni R15-ə yaz: `td > details` qalırmı, link/hüceyrə necə normallaşır.
  - Normallaşmış formanı `.tmp-050/roundtrip/`-ə saxla. Fixture-lər (T014, T024, T034, T044) bu formada yazılır.

---

## Phase 2: Foundational

**Bütün story-lərin ortaq əsası: bölmə açarı, tiplər, layout cədvəli, query parametrləri, arxiv parser-i, ortaq widget-lər, seed skeleti.**

- [X] T004 `SITE/src/entities/page-node/lib/tree.ts` faylını yenilə:
  - `SectionKey`-ə `'consumer'` əlavə et.
  - `SECTION_TITLES.consumer = new Set(['İstehlakçıların və investorların hüquqları', 'Consumer and Investor Rights', 'Consumer and investor rights'])`.
  - Bu sabitləri əlavə et (research R4, R6):
    - `CONSUMER_ROOT_SLUG: Record<Locale, string>` (`istehlakcilarin-ve-investorlarin-huquqlari` / `consumer-and-investor-rights`);
    - `CONSUMER_COMPLAINT_SLUG` (95 az/en) və `CONSUMER_STATISTICS_SLUG` (94 az/en);
    - `CONSUMER_COMPANION` (layout → locale → yoldaş slug; 93 en-də yoxdur);
    - `CONSUMER_ACTIVITY_SLUGS` (88), `CONSUMER_INFOGRAPHICS_SLUGS` (93), `CONSUMER_INSURANCE_SLUGS` (96).
  - `SITE/src/entities/page-node/index.ts` barrel-ini yenilə.
  - `tree.test.ts`-ə `sectionKeyOf` consumer halını və "(Kopya)" (`isSectionCopy`) halını yaz.
- [X] T005 `SITE/src/shared/constants/query-params.ts`-ə `TAB: 'tab'`, `CHANNEL: 'channel'`, `YEAR: 'year'` əlavə et (şərh: spec 050). Tab dəyərləri
  (`bank`, `insurance`) `MODEL/constants.ts`-də `COMPLAINT_TAB`-dır.
- [X] T006 `MODEL/types.ts` faylını yenilə (`data-model.md` §2):
  - Tiplər: `ArchiveFile`, `ArchiveMonth`, `ArchiveYear`, `YearArchive`, `ConsumerTextBlock`, `Methodology`, `ComplaintTab`, `ComplaintIndexBlock`, `MonthRow`,
    `StatTable`, `StatChannel`, `StatSummary`, `AppealStatisticsBlock`, `DocumentSection`, `ConsumerDocumentsBlock`.
  - `ParseContext`-ə `companion?: { html: string; files: AttachmentFile[] } | null` əlavə et.
  - **`AboutLayoutKind` üzvlərini burada əlavə etmə.** `EXPECTED_BLOCKS` exhaustive `Record`-dur, layout tipi fixture olmadan əlavə olunarsa `typecheck` qırılır.
    Hər story öz layout-unu (`AboutLayoutKind` üzvü + `AboutBlock` birləşməsi + `consumerLayoutFor` sətri + fixture + `EXPECTED_BLOCKS`) bir tapşırıqda əlavə edir:
    T015, T022, T029, T036. Beləcə hər mərhələdən sonra `verify` yaşıl qalır.
- [X] T007 `MODEL/layouts.ts` faylına `CONSUMER_LAYOUTS` + `consumerLayoutFor(slug)` əlavə et:
  - Bu mərhələdə cədvəl boşdur, hər slug `'plain'` qaytarır. Story-lər öz sətirlərini əlavə edir (research R3; hər slug `-copy` ilə — `withCopies`;
    86-nın az/en slug-ı `consumer-text`-dir).
  - `SITE/src/views/cms-page/loader.ts` `sectionLayout`-una `if (section === 'consumer') return consumerLayoutFor(slug)` əlavə et. Başlıq şərhinə spec 050-ni yaz.
  - `MODEL/layouts.test.ts`-də `tedbirler-2` → `'plain'` halını yaz. Story-lər öz slug hallarını əlavə edir.
- [X] T008 `MODEL/year-archive.ts` (yeni) faylını yarat — research R8, `contracts/cms-markup.md` §0, §2:
  - `parseYearArchive(nodes, files): { archive: YearArchive; restNodes: HtmlNode[] } | null`.
  - Sarğıları (`div`, `table`, `tbody`, `tr`, `td`, `th`, `p`) rekursiv açan `unwrapDetails(html)` köməkçisini yaz.
  - Ay adları `MONTHS_AZ`/`MONTHS_EN`-dədir (`MODEL/constants.ts`), `İ/ı` qatlaması ilə tanınır.
  - `/media/{id}` → `ArchiveFile`; `files`-də olmayanda başlıq link mətnidir, `mimeType: null`.
  - Sıra: illər azalan, aylar azalan. `latest` ən yeni ilin ən yeni faylıdır.
  - `MODEL/year-archive.test.ts` hallarını yaz:
    - redaktor forması;
    - köhnə import forması (`.tmp-050/api/bank-…json`-dan 2 il × 2 ay çıxarış, testdə sətir kimi);
    - tanınmayan ay;
    - linksiz ay;
    - il yoxdur → `null`;
    - en ay adları.
- [X] T009 [P] Ortaq widget-ləri yarat (`contracts/ui-contract.md` §3):
  - `BLOCKS/document-card.tsx`: başlıq + fayl tipi pill-i, `AboutFileRow` ilə eyni link/endirmə semantikası; `mimeType` yoxdursa ümumi ikon.
  - `BLOCKS/year-archive.tsx`: il sətirləri native `<details data-accordion>`-dur, hamısı bağlı gəlir. İçində 4 sütunlu kart şəbəkəsi var
    (744-də 2, 390-da 1 — ölçü T053-də dəqiqləşir). `<details>`-də `gap` yox, `mt-*` istifadə olunur (spec 044 qeydi).
  - `BLOCKS/latest-card.tsx`: "SON MƏLUMAT" etiketi, başlıq, pill.
  - `BLOCKS/link-tabs.tsx`: `nav` + `Link`-lər + `aria-current="page"`, alt xətt.
  - Ölçülər `BLOCKS/constants.ts`-dədir.
  - Testlər `BLOCKS/year-archive.test.tsx`: arxiv açılır, kartlar rol `link` ilə tapılır, `aria-current` seçilmiş tabdadır.
- [X] T010 [P] `SITE/src/locales/az/about.json` və `SITE/src/locales/en/about.json` fayllarına `consumer.*` açarlarını əlavə et:
  - `latest` ("SON MƏLUMAT" / "LATEST"), `archive` ("Arxiv" / "Archive"), `archiveHint`, `tabs.bank`, `tabs.insurance` (Figma tab mətnləri və en qaralaması).
  - `statistics.heading`, `statistics.year` ("İl:" / "Year:"), `summary` (`"{{month}} {{year}} — qısa icmal"`), `infographics`, `file`.
- [X] T011 `SITE/src/views/cms-page/loader.ts` faylında yoldaş səhifəni oxu (research R4):
  - Layout `complaint-index` və ya `appeal-statistics`-dirsə, `CONSUMER_COMPANION[layout][locale]` ilə `getPage` çağır.
  - Xətada `null` olur (`.catch`), host səhifə pozulmur. Mətn `prepareCmsHtml`-dən keçir, fayllar `attachments` kimi map olunur və `parseAbout` context-inə `companion` kimi ötürülür.
  - `SITE/src/views/cms-page/loader.test.ts`-ə iki hal yaz: yoldaş tapılır; yoldaş 404/500 qaytarır.
- [X] T012 `SITE/src/views/cms-page/index.tsx` faylında `query`-ni `AboutBlocks`-a ötür:
  - `AboutBlocks` `query`-ni consumer bloklarına verir, mövcud `yearSort` dəyişmir.
  - Yeni layout-larda `Attachments` blokların göstərdiyi faylları (`usedMediaIds`) çıxarır. Yoldaşın faylları onsuz da host-un `attachments`-ində deyil.
- [X] T013 `SEED` skeletini yarat (research R7, R12; `data-model.md` §4; 0030 forması):
  - Başlıq şərhi ingiliscə yazılır.
  - Tək `DO $seed$` bloku. `has_table_privilege` ilə `pages UPDATE`, `page_translations UPDATE`, `page_details INSERT, UPDATE` yoxlanır; icazə yoxdursa `RAISE WARNING` + `RETURN`.
  - **Addım 6 (sol menyu)**: 88, 89, 90, 91, 92, 93, 96, 97, 98, 99, 100, 102, 103, 433 üçün `INSERT INTO page_details … ON CONFLICT DO NOTHING`. Səhifələr az slug ilə tapılır, `-copy` daxil deyil (433-ün slug-ı `istehlakcilarin-ve-investorlarin-huquqlari-copy`-dir).
  - **Addım 1 (86-nın köçürülməsi)**: yalnız 86-nın ana səhifəsinin az slug-ı `media`-dırsa işləyir.
    - `parent_id` və `path` yenilənir; uşaqları olsa `subpath` ilə, `PagesController.Move` kimi.
    - `sort_order` research R7-yə görə hesablanır.
    - `page_details(86).show_in_side_nav = true` (upsert) yazılır.
    - `RAISE NOTICE` ilə hesabat verilir.
  - Addım 2–5 story-lərdə əlavə olunur (T020, T025, T040), sıra T046-da yoxlanılır.

**Checkpoint**: Ortaq parser və widget-lər hazırdır, bölmə şablonda açılır (hər səhifə hələ `plain`). `SITE` `npm run verify` yaşıldır.

---

## Phase 3: User Story 1 — bölmə şablonu, kök səhifə, sol menyu (P1) 🎯 MVP

**Goal**: Kök səhifə Figma görünüşündədir, sol menyuda 4 bənd var. 88 köka yönlənir.

**Independent Test**: Seed olunmuş vəziyyətlə (MSW fikstürü) `/az/istehlakcilarin-ve-investorlarin-huquqlari` və en kökü açılır. Lead, nömrəli kartlar və 4 bəndlik menyu
görünür. `/az/fealiyyet-istiqametleri` 308 ilə köka gedir.

- [X] T014 [US1] `SITE/src/features/about-content/fixtures/consumer-text.html` faylını yaz:
  - Forma `contracts/cms-markup.md` §1-dəndir; T003-ün normallaşmış formasındadır.
  - Mətn kökün seed sonrası az mətnidir: lead + "Bununla əlaqədar…" + 9 bənd. Sonuna 86-nın başlıq sətri, siyahısı və son paraqrafı gəlir.
- [X] T015 [US1] `MODEL/consumer-text.ts` (yeni) faylını yarat:
  - `parseConsumerText(nodes)`: birinci `<p>` lead-dir; `promoteHeadingLines` → `heading`; `ul`/`ol` → `numbered`; qalan → `html`.
  - Layout-u qoş: `AboutLayoutKind`-ə `'consumer-text'`, `AboutBlock`-a `ConsumerTextBlock`, `consumerLayoutFor`-a kök (87), 88 və 86 slug-ları (az/en, `-copy`),
    `parseAbout`-a hal, `EXPECTED_BLOCKS`-ə `'consumer-text': ['consumer-text']`, `layouts.test.ts`-ə slug halları.
  - `MODEL/consumer-text.test.ts`: fixture, kökün köhnə forması (bir paraqraf + `ul`, `.tmp-050/api/`-dən), 86-nın köhnə forması (`<p><strong>` lead), boş mətn → `plain`.
- [X] T016 [US1] `BLOCKS/consumer-text.tsx` (yeni) faylını yarat:
  - Lead 18/30 Medium-dur. Nömrəli kartlar `ol`-dur (ekran oxuyucusu sıranı oxuyur), nömrə vizualdır (`aria-hidden`). `CmsContent` yalnız `*Html` sahələri üçün işlədilir.
  - `about-blocks.tsx`-ə bağla, hər blok `Reveal`-dədir.
  - `BLOCKS/consumer-text.test.tsx`: siyahı `listitem` sayı, lead mətni, başlıq rolu.
- [X] T017 [US1] `SITE/src/proxy.ts` faylına 88 qaydasını əlavə et:
  - `CONSUMER_ACTIVITY_SLUG` regex-i (`LITERACY_GENERAL_SLUG` forması) → `/{locale}/{CONSUMER_ROOT_SLUG}`, 308.
  - `SITE/src/proxy.test.ts`: düz və iç-içə ünvan, en, `-copy` yönlənmir.
- [X] T018 [US1] `SITE/src/shared/testing/fixtures/consumer-section.ts` (yeni) faylını yarat:
  - Seed sonrası ağac (az/en): kök 87; uşaqlar 88–103, 86, 433. `showInSideNav` seed-ə uyğundur, sıra 94, 95, 86, 101.
  - Kök, 86, 94, 93, 95, 96, 101 səhifə cavabları. HTML fixture fayllarından oxunur (təkrar yazılmır).
  - Lazım olan MSW handler-lərini əlavə et.
- [X] T019 [US1] `SITE/src/views/cms-page/consumer.test.tsx` (yeni) faylını yarat — view + loader inteqrasiyası (`renderApp`, MSW):
  - kök səhifə: breadcrumb, sol menyuda dəqiq 4 link Figma sırası ilə;
  - gizli səhifə (`tedbirler-2`) açıq olanda menyuda görünür;
  - en kökü;
  - köhnə mətn → bloklar yenə qurulur.
- [X] T020 [US1] `SEED` Addım 3-ü əlavə et: kökün az/en lead bölünməsi.
  - md5 şərti T002-də götürülmüş dəyərlə yazılır.
  - Yeni mətn T014 fixture-inin kök hissəsi ilə eynidir; en tərcüməsi köhnə en mətnindən bölünür.

**Checkpoint**: US1 tək başına yoxlanıla bilər. Seed-siz test API ilə də kök səhifə tanınan bloklarla açılır.

---

## Phase 4: User Story 2 — Şikayət indeksləri (P1)

**Goal**: Bank/Sığorta tabları, son məlumat, arxiv və taba görə metodologiya. 96 Sığorta tabına yönlənir.

**Independent Test**: `/az/bank-xidmetlerinden-istifade-uzre-sikayet-indeksi` və `?tab=insurance` açılır. Son məlumat kartı ən yeni faylı açır, arxivdə bütün illər var,
metodologiya taba görə dəyişir, `/az/avto-icbari-sigorta-uzre-sikayet-indeksi` 308 ilə Sığorta tabına gedir.

- [X] T021 [US2] Metodologiya mətnini Figma-dan götür (`figma_text` `2453:4819` Bank, `2453:3928` Sığorta). `.tmp-050/methodology.az.html`-ə `contracts/cms-markup.md` §3
  formasında yaz: düstur üç paraqraflı `blockquote`-dur, "Qeyd:" paraqrafı var. Sığortada qeyddən sonra əlavə paraqraf var. en qaralamasını
  `.tmp-050/methodology.en.html`-ə yaz.
- [X] T022 [US2] `MODEL/complaint-index.ts` (yeni) faylını yarat:
  - `parseComplaintIndex(nodes, files, companion)`: host-un və yoldaşın `parseYearArchive`-i ilə `ComplaintTab[]` qurulur (`bank`, `insurance`).
  - Arxivdən sonrakı birinci `<h2>` → `Methodology`; üç paraqraflı `blockquote` → `formula`; "Qeyd:"/"Note:" → `note`.
  - Yoldaş yoxdursa tək tab qalır. Host-da arxiv yoxdursa nəticə `null` olur (`plain`).
  - Layout-u qoş (T015 kimi): `AboutLayoutKind`, `AboutBlock`, `consumerLayoutFor` (95 az/en + `-copy`), `parseAbout`. `EXPECTED_BLOCKS` sətri T024-də fixture ilə birlikdə yazılır,
    ona görə T022 və T024 bir oturumda bitirilir.
- [X] T023 [US2] `MODEL/consumer-select.ts` (yeni) faylında `selectComplaintTab(block, value)` yaz:
  - Yanlış və ya olmayan tab → `bank`.
  - `MODEL/consumer-select.test.ts`.
- [X] T024 [US2] `SITE/src/features/about-content/fixtures/complaint-index.html` faylını yaz:
  - Məzmun: 2 il × 2 ay + Bank metodologiyası (T021); forma T003-dəndir.
  - `EXPECTED_BLOCKS`-ə `'complaint-index': ['complaint-index']` sətrini yaz.
  - `MODEL/complaint-index.test.ts` halları:
    - fixture;
    - köhnə forma (`.tmp-050/api/`);
    - yoldaşlı (2 tab) və yoldaşsız;
    - metodologiyasız mətn;
    - düstur 2 paraqraflıdır → `html`.
- [X] T025 [US2] `SEED` Addım 2 (95 başlığı) və Addım 4 (metodologiya) əlavə et:
  - **Başlıq**: 95 az "Şikayət indeksləri" / en "Complaint indices"; yalnız başlıq T002-dəki köhnə dəyərdirsə.
  - **Metodologiya**: 95-ə Bank, 96-ya Sığorta mətni (az/en, T021) `content || <mətn>` kimi əlavə olunur; yalnız `<h2>` başlığı mətndə yoxdursa.
- [X] T026 [US2] `BLOCKS/complaint-index.tsx` (yeni) faylını yarat:
  - Quruluş: `LinkTabs` (`?tab=`, `QUERY_PARAM.TAB`) → `LatestCard` → "Arxiv" + ipucu → `YearArchive` → metodologiya qutusu.
  - Düstur: kəsr xətti; `math` yoxdur, vizual xətt və ekran oxuyucusu üçün "bölünsün" mətni (`sr-only`, locale açarı).
  - Ölçülər `ui-contract` §3-dəndir.
  - `about-blocks.tsx`-ə bağla, seçim `selectComplaintTab(query)` ilə edilir.
  - `BLOCKS/complaint-index.test.tsx`: tab linkləri, `aria-current`, son məlumatın `href`-i, metodologiya taba görə.
- [X] T027 [US2] `SITE/src/proxy.ts` faylına 96 qaydasını əlavə et:
  - `CONSUMER_INSURANCE_SLUGS` → `/{locale}/{CONSUMER_COMPLAINT_SLUG[locale]}?tab=insurance`, 308.
  - `proxy.test.ts` hallarını yaz.
- [X] T028 [US2] `consumer.test.tsx`-ə Şikayət indeksləri halları:
  - defolt Bank;
  - `?tab=insurance`;
  - yoldaş 500 qaytarır → tabsız Bank;
  - Attachments-də arxiv PDF-ləri təkrarlanmır.

**Checkpoint**: US1 və US2 birlikdə MVP-dir: bölmənin giriş səhifəsi və ən çox yenilənən məlumatı.

---

## Phase 5: User Story 3 — Müraciət statistikası (P2)

**Goal**: Ortaq son ayın qısa icmalı, kanal tabları, il seçimi və cədvəl, İnfoqrafika. 93 statistikaya yönlənir.

**Independent Test**: `/az/vetendas-muracietlerine-dair-statistika` açılır. İcmal "May 2026" (test datası) cədvəlin May sətri ilə eynidir. `?channel=3&year=2025`
düzgün cədvəli göstərir. Səyyar qəbul öz formasındadır. İnfoqrafika 65 fayldır. en-də İnfoqrafika bloku yoxdur.

- [X] T029 [US3] `MODEL/appeal-statistics.ts` (yeni) faylını yarat — research R9, `contracts/cms-markup.md` §4:
  - Kanal → il → birinci cədvəl; `months` / `generic` formaları tanınır.
  - Rəqəm oxunuşu boşluq/nöqtə/vergül təmizləndikdən sonra olur; oxunmayan dəyər `null`-dur.
  - `introHtml` birinci kanaldan əvvəlki mətndir. İnfoqrafika `companion`-un `parseYearArchive`-indən gəlir.
  - Kanal yoxdursa nəticə `null` olur (`plain`).
  - Layout-u qoş (T015 kimi): 94 az/en + `-copy`. `EXPECTED_BLOCKS` sətri T034-də yazılır; T029–T034 bir oturumda bitirilir.
- [X] T030 [US3] Eyni faylda `buildSummary(channels)` yaz (clarify Q3):
  - Yalnız `months` formalı kanallar sayılır. Hər kanal üçün ən yeni ilin son tam dolu sətri tapılır.
  - Ay = minimum; `StatSummary` sektorlar üzrə qurulur ("Cəmi" sütunu ayrıdır).
  - Ortaq ay yoxdursa `null` qaytarılır.
  - `MODEL/appeal-statistics.test.ts` halları:
    - test datası (4 kanal May) → May;
    - zənglər İyun, qalanları May → May;
    - bir kanalın ən yeni ili boşdur → `null`;
    - Səyyar sayılmır;
    - "-" hüceyrəsi.
- [X] T031 [US3] `consumer-select.ts`-ə `selectStat(block, channel, year)` əlavə et:
  - Defolt birinci kanal və onun ən yeni ilidir; olmayan il → ən yeni il.
  - Testlər.
- [X] T032 [US3] `BLOCKS/appeal-statistics.tsx` (yeni) faylını yarat:
  - Bloklar: icmal (2×2 kart, `ui-contract` §4) → "Müraciətlər üzrə statistika" → kanal `LinkTabs` (`?channel=`) → il linkləri ("İl:", seçilmiş `aria-current`, `?channel=&year=`).
  - Cədvəl: `months` üçün başlıq, sətirlər və "Yekun" sətri; `generic` olduğu kimi göstərilir. Cədvəl öz qabında üfüqi sürüşür.
  - Sonda İnfoqrafika: `LatestCard` + `YearArchive`, anchor `id="infoqrafika"`.
  - Cədvəl üçün `<table>` + `<caption class="sr-only">` (kanal + il) istifadə olunur. Rəqəmlər sağa düzlənir, `tabular-nums`.
  - `about-blocks.tsx`-ə bağla.
  - `BLOCKS/appeal-statistics.test.tsx`: icmal kartları, kanal/il linkləri, cədvəl başlıqları, generic cədvəl.
- [X] T033 [US3] `SITE/src/proxy.ts` faylına 93 qaydasını əlavə et:
  - `CONSUMER_INFOGRAPHICS_SLUGS` → `/az/{CONSUMER_STATISTICS_SLUG.az}#infoqrafika`, 308.
  - `proxy.test.ts`.
- [X] T034 [US3] `SITE/src/features/about-content/fixtures/appeal-statistics.html` faylını yaz:
  - Məzmun: 2 `months` kanalı × 2 il + 1 `generic` kanal; forma T003-dəndir.
  - `EXPECTED_BLOCKS`-ə sətir yaz.
  - `appeal-statistics.test.ts`-ə köhnə forma çıxarışı (`.tmp-050/api/vetendas…json`, bir kanal × bir il) əlavə et.
- [X] T035 [US3] `consumer.test.tsx`-ə statistika halları:
  - defolt;
  - `?channel=2&year=2025`;
  - yanlış parametrlər;
  - en (İnfoqrafikasız);
  - yoldaş 500 qaytarır.

**Checkpoint**: US3 müstəqil yoxlanılır. Seed tələb etmir (94/93 mətni dəyişmir).

---

## Phase 6: User Story 4 — İnzibati işlər və Sənədlər (P2)

**Goal**: 86 bölmənin menyusunda və şablonundadır. "Sənədlər" akkordeon bölmələri və sənəd kartları ilə göstərilir, "İnformasiya sorğusu" daxildir.

**Independent Test**: `/az/inzibati-islere-baxan-vezifeli-sexsler` (və `/az/media/…`) bölmə şablonunda açılır. `/az/kapital-bazari-3`-də üç bölmə bağlıdır, PDF kartları açılır.

- [X] T036 [US4] `MODEL/consumer-documents.ts` (yeni) faylını yarat:
  - Üst səviyyə `<details>` → `DocumentSection`.
  - Yalnız `data-media-link`-dən ibarət `<p>` → `file`; qalan → `html`.
  - `introHtml`/`restHtml` bölmələrdən kənar mətndir. Bölmə yoxdursa nəticə `plain`-dir.
  - Layout-u qoş (T015 kimi): 101 az/en + `-copy`. `EXPECTED_BLOCKS` sətri T037-də yazılır.
- [X] T037 [US4] `SITE/src/features/about-content/fixtures/consumer-documents.html` faylını yaz:
  - Məzmun: üç bölmə (Səhmdarlar qısaldılmış, Emitentlər + 2 fayl, İnformasiya sorğusu); forma T003-dəndir.
  - `EXPECTED_BLOCKS`-ə sətir yaz.
  - `MODEL/consumer-documents.test.ts`: fixture, köhnə forma (boş `<a href="">` daxil), bölməsiz mətn.
- [X] T038 [US4] `BLOCKS/consumer-documents.tsx` (yeni) faylını yarat:
  - Native `<details data-accordion>`, bağlı gəlir, çapda açılır. Başlıq 20/28, gövdə aralığı 20, fayl → `DocumentCard`.
  - `about-blocks.tsx`-ə bağla.
  - Test: bölmə açılır, kart linki.
- [X] T039 [US4] `consumer.test.tsx`-ə 86 hallarını yaz:
  - ağacda bölmənin altındadır, breadcrumb 3 səviyyədir;
  - Media menyusunda yoxdur;
  - `/az/media/inzibati-…` seqmentli ünvan da bölmə şablonunu verir.
- [X] T040 [US4] `SEED` Addım 2-yə (101 başlığı: "Sənədlər" / "Documents", yalnız köhnə başlıqda) və Addım 5-ə (İnformasiya sorğusu) əlavə et:
  - `<summary>İnformasiya sorğusu</summary>` / `Information request` yoxdursa, bölmə 101-in az/en mətninin sonuna əlavə olunur.
  - Mətn T037 fixture-inin həmin bölməsi ilə eynidir. PDF linki yoxdur (research R10).

**Checkpoint**: Dörd story-nin hamısı ayrı-ayrı işləyir.

---

## Phase 7: User Story 5 — redaktor: fixture nüsxələri, round-trip, seed yoxlaması (P3)

**Goal**: Redaktor səhifəni açıb saxlayanda heç nə itmir; seed real bazada düzgün və idempotentdir.

**Independent Test**: `ADMIN` `npm run verify` 4 yeni fixture-i bayt-bayt saxlayır. `check:layout-fixtures` iki nüsxəni tutuşdurur. Seed PGlite-də quickstart §2-nin
6 ssenarisini keçir.

- [X] T041 [P] [US5] Dörd fixture-i `ADMIN/src/features/rich-text/fixtures/layouts/`-a bayt-bayt kopyala (Node `copyFileSync`). `ADMIN/src/features/rich-text/roundtrip.test.ts`
  siyahısına dörd layout əlavə et. `ADMIN/CLAUDE.md` fixture siyahısını yenilə.
- [X] T042 [US5] `ADMIN`-də `npm run verify`, `SITE`-da `npm run check:layout-fixtures` işlət. Fixture redaktorda dəyişirsə, fixture-i redaktorun formasına uyğunlaşdır
  (T003). Kodu fixture-ə uyğunlaşdırma.
- [X] T043 [US5] `SEED`-i PGlite-də real icra et (quickstart §2, yaddaş `pglite-api-testing`):
  - `.tmp-050/seed-check.mjs` T002-nin ağac/səhifə dump-ından `pages`, `page_translations`, `page_details` qurur.
  - 6 ssenarini işlət: köhnə vəziyyət, əl ilə dəyişdirilmiş başlıq, 86 artıq köçürülüb, icazə yoxdur, ikinci icra, mövcud `page_details`.
  - `api-cbar`-ın ağac sırasını (`sort_order, id`) SQL ilə yoxla.
  - Nəticəni `research.md` R7/R12-yə qısa yaz.
- [X] T044 [US5] Canlı round-trip-i seed mətni ilə təkrarla:
  - Seed tətbiq olunmuş mühit yoxdursa, `ADMIN` `roundtrip.test.ts`-də 95-in seed sonrası mətni üçün tək hal yaz (arxiv + metodologiya).
  - Nəticəni quickstart §4-ə qeyd et.

---

## Phase 8: Polish & Cross-Cutting

- [X] T045 [P] Seed fixture HTML-lərinin `SEED`-dəki mətnlə eyni olduğunu yoxla:
  - `.tmp-050/compare-seed.mjs` seed-dəki `$html$` bloklarını çıxarır və fixture fayllarının uyğun hissəsi ilə tutuşdurur.
  - Fərq varsa seed-i düzəlt.
- [X] T046 Seed-in yekun başlıq şərhini yaz və bütün addımların sırasını yoxla: 1 köçürmə → 2 başlıqlar → 3 kök lead → 4 metodologiya → 5 İnformasiya sorğusu → 6 sol menyu.
- [X] T047 UI ölçmə (quickstart §3, research R14):
  - Fikstür proxy-ni yaz (`.tmp-050/proxy.mjs`): seed sonrası səhifə və ağac cavablarını qaytarır, qalanını test API-yə ötürür.
  - `npm run local:testcbar -- --api=…` ilə 5 səhifəni 1728/744/390 enində Edge CDP ilə ölç.
  - Tablet/mobil dəyərlərini `contracts/ui-contract.md`-yə yaz, sapmaları düzəlt.
  - Səhifə səviyyəsində üfüqi sürüşmə yoxdur.
- [X] T048 Quickstart §3-ün qalan bəndlərini brauzerdə yoxla:
  - JS söndürülmüş halda tablar, kanal və il linkləri işləyir.
  - Yönləndirmələr 308 qaytarır.
  - Fayl sayları (link): 32 / 45 / 65.
  - Seed-siz test API ilə səhifələr dağılmır.
- [X] T049 [P] `dokumentasiyalar/istehlakci-huquqlari-guide.md` (yeni) faylını yaz — `dokumentasiyalar/README.md`-dəki vahid quruluşla (research R13).
  Strukturun nümunəsi `dokumentasiyalar/merkezi-banklarla-emekdasliq-guide.md`-dir. Bölmələr:
  1. **Qısa xülasə** — admin yolu: **Səhifələr** → İstehlakçıların və investorların hüquqları → …; sayt ünvanları az/en; hansı səhifə nəyi göstərir (cədvəl).
  2. **Yayımdan sonra bir dəfəlik hazırlıq**:
     - seed nə edir;
     - en qaralamalarını yoxlamaq;
     - "966 Qaydaları" PDF-ini yükləyib İnformasiya sorğusuna linkləmək.
  3. **Admin paneldə əməliyyatlar**:
     - Şikayət indeksinə yeni ay əlavə etmək (il akkordeonu, ay akkordeonu, media linki); yeni il;
     - Sığorta indeksi (ayrı səhifə, saytda tab);
     - metodologiyanı redaktə etmək (düstur sitatı 3 paraqrafdır);
     - statistika cədvəlinə ay sətri doldurmaq (icmal avtomatik yenilənir, ortaq ay qaydası);
     - yeni kanal; İnfoqrafika faylı;
     - Sənədlər bölməsi əlavə etmək;
     - kök və İnzibati işlər mətni (lead, başlıq sətri, siyahı);
     - sol menyu ("Sol menyuda göstər" bayrağı).
  4. **Saytda nə görünür** — tablar, son məlumat, arxiv, yönləndirmələr.
  5. **Yoxlama siyahısı**.
  6. **Tez-tez rast gələn problemlər** — ay adı tanınmır, rəqəm deyil, icmal görünmür, tab boşdur, fayl kartı adsızdır.
  7. **Developerlər üçün əlavə** — layout-lar, slug-lar, seed `0031`, spec 050 linki.
- [X] T050 [P] `dokumentasiyalar/README.md`-yə yeni "İstehlakçı hüquqları" cədvəli əlavə et (təlimat | admin panel | sayt). "Hələ təlimatı olmayan bölmələr" siyahısını yoxla.
- [X] T051 [P] `SITE/docs/consumer-rights-cms-guide.md` (yeni) faylını yaz: işarələmə qaydasının qısa forması (`contracts/cms-markup.md`). `SITE/docs/how-to-use.md`-yə link əlavə et.
- [X] T052 Sənədləri yenilə:
  - `SITE/CLAUDE.md` §3-ə "İstehlakçıların və investorların hüquqları" bəndi: layout-lar, yoldaş səhifə, query seçimi, yönləndirmələr, seed `0031`, təlimatlar.
  - Kök `CLAUDE.md`-yə spec 050 bəndini əlavə et; layout guard siyahısını (about-main … literacy-platform) dörd yeni layout ilə yenilə.
  - Menyu dəyişikliyi baş verib (86 Media-dan çıxır), ona görə `SITE/docs/media-cms-guide.md`-də 86-nın qeydini yoxla və yenilə (yaddaş `menu-changes-update-docs`).
- [X] T053 `/sync-business-logic` işlət (`business_logic/new_business_logic.md`, `diff_report_logic.md`).
- [X] T054 Yekun qapılar: `SITE` və `ADMIN` `npm run verify`-ı həm Node 24, həm Node 22 ilə işlət; `ADMIN-API` `dotnet build`.
  `spec.md`, `plan.md` açıq suallarını MR təsvirinə köçür.

---

## Dependencies & Execution Order

### Phase asılılıqları

- **Setup (T001–T003)** → **Foundational (T004–T013)** → story-lər.
- T003 (round-trip forması) bütün fixture tapşırıqlarından (T014, T024, T034, T037) əvvəl gəlir.
- **US1 (Phase 3)** — Foundational-dan sonra. MVP-nin birinci hissəsidir.
- **US2 (Phase 4)** — Foundational-dan sonra, US1-dən asılı deyil (T019-un test faylını genişləndirir, ona görə T028 T019-dan sonra gəlir).
- **US3 (Phase 5)** — Foundational-dan sonra. T008 arxiv parser-indən (İnfoqrafika) və T009 widget-lərindən asılıdır.
- **US4 (Phase 6)** — Foundational-dan sonra. T009 `DocumentCard`-dan asılıdır.
- **US5 (Phase 7)** — dörd fixture-in hamısından (T014, T024, T034, T037) və seed addımlarından (T013, T020, T025, T040) sonra.
- **Polish (Phase 8)** — hamısından sonra. T049–T051 sənədləri istənilən vaxt paralel yazıla bilər, amma son yoxlama T047-dən sonradır.

### Fayl toqquşmaları (ardıcıl olmalıdır)

- `MODEL/parse.ts` və `layout-fixtures.test.ts`: T015 → T022/T024 → T029/T034 → T036/T037.
- `BLOCKS/about-blocks.tsx`: T016 → T026 → T032 → T038.
- `SITE/src/proxy.ts`: T017 → T027 → T033.
- `SEED`: T013 → T020 → T025 → T040 → T046.
- `consumer.test.tsx`: T019 → T028 → T035 → T039.

### Paralel imkanlar

- T009 və T010 (fərqli fayllar) T008 ilə paralel işlənə bilər.
- Story daxilində parser (`MODEL/*.ts`) və widget (`BLOCKS/*.tsx`) bir tip müqaviləsi ilə paralel yazıla bilər, amma `about-blocks.tsx` bağlantısı ardıcıldır.
- T041 (admin fixture-ləri) və T049–T051 (sənədlər) paraleldir.

### Paralel nümunə: US2

```text
T021 Metodologiya mətni (Figma)        ─┐
T023 selectComplaintTab + test          ├─ paralel
T026-nın widget hissəsi (BLOCKS/*.tsx) ─┘
→ T022 parser → T024 fixture + EXPECTED_BLOCKS → T026 about-blocks bağlantısı → T027 proxy → T028 inteqrasiya testi
```

## Implementation Strategy

### MVP (US1 + US2)

1. Phase 1–2 (T001–T013).
2. US1 (T014–T020): bölmə görünür, menyu 4 bənddir.
3. US2 (T021–T028): şikayət indeksləri.
4. **Dayan və yoxla**: `SITE` `verify`, MSW ilə brauzer, PGlite-də seed-in hissəsi.

### Artımlı çatdırılma

1. MVP → US3 (statistika, seed tələb etmir) → US4 (İnzibati + Sənədlər).
2. US5 (fixture nüsxələri, round-trip, seed-in tam yoxlanması) → Polish (ölçmə, sənədlər, business_logic).
3. MR-lar: A `ADMIN-API` (seed) → B `SITE` → C `ADMIN` (B ilə eyni seriya) → D workspace sənədləri.

### Qeydlər

- Hər story-dən sonra `SITE` `npm run verify` yaşıl olmalıdır. Buna görə layout tipi `AboutLayoutKind`-ə öz fixture-i ilə eyni oturumda əlavə olunur (T006 qeydi).
- Commit yalnız istifadəçi istəyəndə edilir.
