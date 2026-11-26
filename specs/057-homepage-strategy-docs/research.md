# Research — 057 Ana səhifənin "Strategiya və sənədlər" bloku

Spec-də `NEEDS CLARIFICATION` yoxdur. Aşağıdakılar plan mərhələsində seçilən texniki qərarlardır. Hər biri mövcud kodda yoxlanılıb
(2026-11-23).

## R1 — Cədvəllər: yeni cüt, FinCERT üzvlükləri nümunəsi

- **Decision**: iki yeni cədvəl: `homepage_strategy_docs` (sıra, status, `page_id`, audit sahələri, `deleted_at`) və
  `homepage_strategy_doc_translations` (`doc_id`, `locale`, başlıq, qısa mətn, `cover_media_id`, `url`). Miqrasiya `0043-homepage-strategy-docs.sql`.
  Mövcud cədvəllərə `ALTER` yoxdur. FK-lər `0036` kimi şərti əlavə olunur (`has_table_privilege(..., 'REFERENCES')`).
- **Rationale**: istifadəçi ayrıca tip seçib (spec qərarı 1). Ən yaxın nümunə `fincert_memberships` + `_translations`-dur
  (`0036-fincert.sql`, `FincertMembershipsController`): orada sıra, status, soft delete, şəkil yoxlaması və `PUT …/order` var.
- **Alternatives considered**: `homepage_publications`-u `*_details` ilə genişləndirmək. İstifadəçi bunu rədd edib: köhnə nəşr sətirləri bu bloka
  qarışar.

## R2 — "Aktiv" = `ContentStatus` (dərc olunub / qaralama) + soft delete

- **Decision**: bayraq `is_active boolean` deyil, `status content_status` olur (`published` | `draft`, `scheduled` rədd edilir). Silmə
  `deleted_at` ilə edilir. Panel formada "Status" seçimi göstərir, siyahıda status nişanı olur. Spec-dəki "aktiv" = "Dərc olunub".
- **Rationale**: Konstitusiya III.3 public sorğunu `Status == Published` və soft-delete ilə filtrləməyi tələb edir. FinCERT, FAQ və memorandumlar
  belədir. Köhnə ana səhifə cədvəllərindəki `is_active` `0001`-dən miras qalıb, yeni cədvəldə təkrarlanmır.
- **Alternatives considered**: `is_active`, digər ana səhifə tabları ilə vizual eynilik üçün. Rədd edildi: konstitusiya qaydası üstündür. Panelin
  CRUD mühərriki status sütununu və filtrini artıq bilir.

## R3 — Sayt sənədləri `/homepage` cavabının içində alır

- **Decision**: `api-cbar` `GET /api/v1/homepage` cavabına yeni `strategyDocs` massivi əlavə olunur. Ayrıca public endpoint yoxdur.
- **Rationale**: ana səhifə loader-i bu cavabı artıq alır (`features/homepage/api/homepage.api.ts`, `cachedJson`, 10 s, tag `homepage`). Əlavə
  sorğu və gözləmə olmur (FR-016). Sahə əlavəsi geriyə uyğundur (Konstitusiya VII.3). Saytın Zod sxemi `.default([])` ilə yazılır, ona görə sayt
  API-dən əvvəl deploy olunsa da blok sadəcə gizlənir.
- **Alternatives considered**: `GET /api/v1/homepage/strategy-docs?locale=`. Bu, ana səhifəyə daha bir sorğu və onun xəta budağını əlavə edir, faydası
  yoxdur.
- **Nəticə**: admin dəyişikliyi saytda 10 saniyəyə qədər gecikə bilər (`CONTENT_REVALIDATE_SECONDS`). Bu, ana səhifənin digər blokları ilə eynidir.
  SC-002 ("növbəti açılış") bu keş pəncərəsi daxilində ölçülür.

## R4 — Keçidi API həll edir, sayt yalnız dil prefiksi verir

- **Decision**: `api-cbar` hər sənəd üçün `href` qaytarır:
  1. həmin dilin `url`-i doludursa, o (daxili `/…` və ya xarici `https://…`);
  2. yoxdursa, bağlı səhifənin həmin dildəki slug-u `/<slug>`, yalnız səhifə saytda görünürsə: `Status == Published && Active` və dilə görə
     `ShowAz`/`ShowEn`. Bu, `PagesController.GetBySlug`-ın filtridir;
  3. heç biri yoxdursa sənəd cavaba düşmür.

  Sayt `localizeHref` ilə daxili ünvana `/{locale}` prefiksi verir və `SmartLink` ilə xarici ünvanı yeni vərəqdə açır (`noopener noreferrer`).
- **Rationale**: public filtr API-nin işidir (Konstitusiya III.3). Sayt səhifə ağacını ana səhifədə oxumur. Səhifənin görünürlük qaydası bir yerdə
  qalır. Mock-dakı ünvan forması (`/${locale}/${slug}`) dəyişmir.
- **Alternatives considered**: API `pageId` qaytarır, sayt ağacdan slug tapır. Bu, ana səhifəyə ağac sorğusu əlavə edər.

## R5 — Üz qabığının dil fallback-i API-dədir

- **Decision**: `coverUrl` = həmin dilin `cover_media_id`-si, o yoxdursa digər dilinki. Media sətri mövcud olmalıdır, şərti FK olmaya bilər. İkisi
  də yoxdursa `null` gəlir və sayt bugünkü yer tutucunu (`bg-border`) göstərir. Format `"/media/{id}"`, digər ana səhifə şəkilləri kimidir
  (`HomepageController` `imageUrl`). Sayt `mediaUrl()` ilə mütləq ünvan qurur.
- **Rationale**: spec qərarı 4 + FR-013. Fallback serverdə olanda saytın modeli sadə qalır (bir `coverUrl`).

## R6 — 3 kart qaydası saytdadır

- **Decision**: API dərc olunmuş və görünən sənədlərin hamısını redaktorun sırası ilə qaytarır. Sayt ilk `STRATEGY_DOCS_MAX = 3`-ü götürür
  (`views/home/constants.ts`). Birincisi böyük kartdır (`StrategyDocs` widget-i bunu artıq edir).
- **Rationale**: kart sayı düzülüş qaydasıdır (desktop sırası 424 + 200 + 200), məzmun qaydası deyil. Sayı dəyişmək yalnız saytın deploy-u olmalıdır.
  API kontraktı ümumi qalır.

## R7 — Validasiya: təmiz funksiya + xUnit, link qaydası bir yerə çıxır

- **Decision**:
  - Yoxlamalar `Validation/StrategyDocRules.cs`-də `internal static` funksiyadır (`WorkingPaperRules` nümunəsi), DB tələb edən yoxlamalar
    (səhifə və media mövcudluğu, şəklin MIME-i) isə controller-dədir. Testlər `tests/Cbar.AdminApi.Tests/StrategyDocRulesTests.cs`-dədir.
  - Link qaydası (`http://`, `https://` və ya `/`, `//` rədd edilir) indi iki controller-də özəl kopyadır (`ImagePopupsController`,
    `ReleaseScheduleItemsController`). Bu, üçüncü istifadədir, ona görə `ContentSupport.IsAllowedLink`-ə çıxarılır və iki köhnə kopya ona yönəlir.
    Davranış dəyişmir.
  - Uzunluqlar: başlıq 300, qısa mətn 500, ünvan 1000 (popup linki kimi). Figma-da dar kartın mətn sahəsi 177 px-dir və `line-clamp-5` ilə kəsilir,
    ona görə 500 kifayətdir.
- **Rationale**: kök `CLAUDE.md`: "Put new validation there in the same way". Senior-front qaydası: üçüncü təkrarda çıxar.

## R8 — İcazələr: dörd yeni kod, moderator rolu

- **Decision**: `homepage_strategy_docs.read|create|update|delete` (`Permissions.HomepageStrategyDocs`). `0043` onları `permissions`-a, moderator
  roluna isə `role_permissions`-a yazır. INSERT hüququ yoxdursa xəbərdarlıqla keçir (`0036` bloku). `update` sıralamanı da əhatə edir.
- **Rationale**: FR-009 — digər ana səhifə blokları kimi (`homepage_publications.*`, `0009`).

## R9 — Admin paneli: `features/homepage`-də dördüncü tip modul, səhifə seçimi `LookupGate` ilə

- **Decision**:
  - Yeni modul `strategyDocsModule` (`features/homepage/model/strategy-docs.ts`), API yolu `/homepage-strategy-docs`, route
    `/homepage-blocks/strategy-docs` (+ `/new`, `/$id`).
  - Tab `HOMEPAGE_SECTION_TABS`-a "Nəşrlər"-dən sonra əlavə olunur, hub kartı `HUB_CARDS`-a.
  - Sahələr:
    - `status` (select);
    - `pageId` (`select`, `searchable`, `nullable`, seçimlər səhifə ağacından: `pages/events` nümunəsi, `LookupGate`);
    - hər dil üçün `title`, `summary` (textarea), `coverMediaId` (`media`, `perLocale`, `mediaAccept: 'image'`) və `url`.
  - Sıra form sahəsi deyil: siyahının üstündə ortaq `features/crud/components/reorder-dialog.tsx` ("Sıranı dəyiş", FinCERT nümunəsi) var, hər
    hərəkət `PUT /homepage-strategy-docs/order` ilə dərhal saxlanır.
  - "Saytda ilk 3 göstərilir, birincisi böyük kartdır" qeydi modulun `descriptionKey` mətnindədir.
  - Klient yoxlaması Zod `superRefine`-dir: ən azı bir başlıq, səhifə və ya ən azı bir ünvan, `isAllowedLink` (`shared/lib/site-link.ts`).
- **Rationale**: kök `CLAUDE.md` "routine CRUD screens are a `ModuleConfig`". Bütün hissələr mövcuddur: `perLocale` media (image-popups),
  `mediaAccept` (spec 053), searchable select + `LookupGate` (events), reorder dialoqu (spec 053), `useBlocker` (spec 051), sahə xətası tabda (spec 054).
  Yeni mühərrik genişlənməsi lazım deyil.
- **Alternatives considered**: ayrıca `features/strategy-docs` slice-ı. Rədd edildi: tab, crumb və hub `features/homepage`-dədir. Yeni tip də ana
  səhifənin bir blokudur.

## R10 — Siyahı sütunları və işləməyən keçid

- **Decision**: admin siyahı DTO-su sırada `title` (az, yoxdursa en), `pageTitle` (bağlı səhifənin az başlığı), `urls` (dolu dillər), `status`,
  `locales` və `linkBroken` qaytarır. `linkBroken` = sənədin heç bir dildə işləyən keçidi yoxdur, R4 qaydası ilə hesablanır. Panel bunu "Keçid
  işləmir" nişanı ilə göstərir (spec edge case: "Admin siyahısında sənəd qalır və keçidinin işləmədiyi görünür"). `missingFile` nişanı (spec 052) bu
  nümunədir.
- **Rationale**: redaktor sənədin niyə saytda görünmədiyini siyahıdan anlayır.

## R11 — Köçürmə: `0044-homepage-strategy-docs-seed.sql`

- **Decision**: cədvəldə sətir yoxdursa (silinmişlər də sayılır), mock-dakı üç sənəd həmin sıra ilə yazılır:
  - Səhifə `page_translations`-da `locale = 'az'` slug-u ilə tapılır: `maliyye-sektorunun-inkisaf-strategiyasi`,
    `risk-esasli-nezaret-uzre-siyaset-konsepsiyasi`, `mikromaliyye-modeli-uzre-strateji-cercive`. Test bazasında id-lər 104, 66 və 76-dır.
  - Başlıqlar mock-dakı az/en mətnləridir, `status = 'published'`, `url`, `summary` və üz qabığı boşdur.
  - Tapılmayan slug-un sətri yazılmır.
- **Rationale**: FR-018/019. Slug ilə axtarış id-lərin mühitdən asılı olmasına qarşıdır (`0035` nümunəsi). "Boşdursa" qaydası təkrar işə düşməyə
  və redaktorun işinə qarşı qorunmadır.

## R12 — Mock-un silinməsi və üz qabığı faylları

- **Decision**:
  - `views/home/mock.ts` silinir, `loader.ts` sənədləri `home.data?.strategyDocs`-dan qurur (`toStrategyDoc` mapper-i, R4/R5).
  - `HOME_BLOCKS.strategyDocs` qalır (blokun söndürülməsi üçün tək yer).
  - `public/site/home/risk-based-supervision.png` və `microfinance.png` saytdan çıxır. Redaktor onları yükləsin deyə
    `specs/057-homepage-strategy-docs/assets/`-ə köçürülür, təlimat ora istinad edir. `coin-banner.png` başqa blokundur, toxunulmur.
- **Rationale**: FR-010, FR-020. Saytda istifadə olunmayan fayl saxlanılmır.

## R13 — Endpoint-lər spec-first, iki MR

- **Decision**: əvvəl OpenAPI yazılır.
  - `api-cbar`: `paths/homepage.yaml` cavab sxeminə `strategyDocs`.
  - `api-cbar-admin`: `paths/homepage.yaml`-a `strategyDocs`, `strategyDoc` və `strategyDocsOrder`. Yollar: `/api/v1/homepage-strategy-docs`,
    `/{id}` və `/order`.

  Lint + bundle təsdiqindən sonra controller yazılır. `.claude/hooks/spec-first.mjs` route yarısını yoxlayır, `route-diff.mjs` sonda.
- **Rationale**: kök `CLAUDE.md`, "Endpoint changes are spec-first".

## R14 — Test strategiyası

- **Decision**:
  - **api-cbar-admin**: `StrategyDocRulesTests` (xUnit, DB-siz). Endpoint-lər PGlite + socket ilə real SQL-ə qarşı işlədilir (yaddaş:
    `pglite-api-testing`), `dotnet build`.
  - **api-cbar**: `href` və `coverUrl` seçimi `StrategyDocLinks` təmiz funksiyasına çıxır (EF proyeksiyasından sonra yaddaşda). Test:
    `tests/Cbar.WebApi.Tests/StrategyDocLinksTests.cs`.
  - **web-cbar-new**: MSW `/homepage` fikstürünə `strategyDocs`, `loader.test.ts`-də xəritələmə (daxili/xarici `href`, 3-ün kəsilməsi, boş massiv
    və xəta). `index.test.tsx` mövcud blok testləri saxlanılır.
  - **web-cbar-admin-new**: MSW mövcud `handlers/homepage.ts`-də (`createCrudStore` + `/order`, real kontrakt). Funksional test istifadəçi
    davranışını yoxlayır: yaratma, yoxlama xətaları, sıranı dəyiş, status (yaddaş: `functional-component-tests`).
  - İki frontend Node 22-də də işlədilir (yaddaş: `run-tests-on-node22`).
- **Rationale**: Konstitusiya VIII, kök `CLAUDE.md` test qaydaları.

## R16 — Strategiya səhifəsi: 104-ün mətni, yeni səhifə və ya yeni layout yoxdur (US4)

- **Decision**: köhnə `/pages/strategy`-nin qarşılığı CMS səhifəsi 104-dür. Onun az/en mətni köhnə müraciətlə əvəzlənir. Ağacdakı yeri (kök), başlığı,
  slug-u və menyu bayraqları (spec 056 `0042`) dəyişmir. 104 heç bir `SectionKey` deyil, ona görə sayt onu adi CMS səhifəsi kimi çəkir: breadcrumb,
  `CmsContent`, `SectionSidebar` (104 → 105). Yeni `AboutLayoutKind`, view və ya komponent yoxdur.
- **Rationale**:
  - İstifadəçi qərarı 9.
  - 104-ün indiki mətni 105-in surətidir, heç nə itmir.
  - Mock-dakı kart ünvanı (`/az/maliyye-sektorunun-inkisaf-strategiyasi`) artıq 104-ə aparır.
  - Spec 056-nın Figma header-i qorunur.
- **Alternatives considered**: 104-ü "Nəşrlər, hesabatlar və sənədlər"-ə köçürmək (`document-list` görünüşü). İstifadəçi rədd edib, çünki kök bölmə
  header, mobil menyu və footer-dən çıxardı. Yeni səhifə yaratmaq da rədd edildi: eyni ad iki səhifədə olardı.

## R17 — Strategiya mətninin forması: redaktorun saxladığı HTML

- **Decision**: mətn panelin TipTap redaktorunun bayt-bayt saxladığı formadadır (contracts/strategy-page.md):
  - portret sağa düzlənmiş öz paraqrafında olur: `<p style="text-align: right"><img src="/media/{id}" alt="…" width="300"></p>`. Stok TipTap 3.31
    `Image`-də `width` atributu var, `MediaImage` `inline: true`-dur;
  - müraciət başlığı `<h3>`-dür;
  - abzaslar `<p>` + `<strong>`-dur;
  - imza `<p style="text-align: right"><strong>…</strong></p>` sətirləridir (`TextAlign` paraqrafda aktivdir);
  - PDF `<p><a data-media-link="" href="/media/{id}">…</a></p>`-dir.

  Fikstür `web-cbar-admin-new/src/features/rich-text/fixtures/strategy-letter.html` `roundtrip.test.ts`-ə əlavə olunur: redaktor onu dəyişmədən
  saxlamalıdır (FR-022).
- **Fərq**: köhnə saytda portret `float: right` idi, mətn onun yanından axırdı. Redaktorda float yoxdur, ona görə portret sağda, mətn isə onun altındadır.
  Mobil qayda köhnə ilə eynidir: `max-width: 100%`. Float üçün `cms-content.css`-ə ümumi qayda yazmaq başqa səhifələrin sağa düzlənmiş şəkillərini də
  dəyişərdi. Bu, istifadəçiyə deyilir.
- **Rationale**: FR-022, kök `CLAUDE.md` ("TipTap silently drops any element no extension claims").

## R18 — İdxal aləti: `tools/media-backfill/import-strategy-page.mjs`

- **Decision**: alət spec 054 `import-working-papers.mjs`-in yanında yazılır və onun hissələrini təkrarlayır:
  - `.env` (PG yazma + MinIO, Vault-dan);
  - `--plan | --dry-run | --apply`, `--source=https://test.cbar.az|https://www.cbar.az`;
  - SHA-256 ilə mövcud media-nın təkrar istifadəsi;
  - açar `YYYY/MM/<sha256[0..16]>.<ext>`;
  - `media_assets` + `media_asset_details`.

  Addımlar:
  1. `9183.png`, `2024_2026_Azerbaijani.pdf`, `2024_2026_English.pdf` endirilir. Biri alınmasa heç nə yazılmır.
  2. Media sətirləri tapılır və ya yaradılır.
  3. 104 az slug-ı ilə tapılır (`maliyye-sektorunun-inkisaf-strategiyasi`), 105 isə onun alt səhifəsidir.
  4. Hər dil üçün, yalnız 104-ün o dildəki `content`-i 105-inkinə bərabərdirsə, şablon mətni media id-ləri ilə doldurulub yazılır. Əks halda
     "dəyişdirilib, toxunulmadı" yazılır.
  5. Hesabat JSON-a yazılır.

  `page_assets` yazılmır: plain səhifə `Attachments`-də hər iki dilin faylını göstərərdi, link mətndə kifayətdir. Audit jurnalı yazılmır, bu, spec 054
  aləti ilə eynidir. README-də qeyd olunur.
- **Rationale**: istifadəçi qərarı 10. PDF-lər 33–37 MB-dır, miqrasiyada yüklənə bilməz. Media id-ləri mühitdən asılıdır. Spec 054-də bu yol test
  mühitində işləyib (yaddaş `spec-054-publications-open`).
- **Alternatives considered**: redaktorun əl ilə yükləməsi. İstifadəçi rədd edib. Admin API ilə yükləmə də rədd edildi: test-də admin login 401
  vermişdi, spec 054 də buna görə birbaşa PG + MinIO-ya keçmişdi.

## R19 — Köhnə ünvanlar: `proxy.ts` `LEGACY_PAGES` + `next.config` yönləndirmələri

- **Decision**:
  - `src/proxy.ts`: mövcud `LEGACY_PAGES` siyahısına üç sətir (FAQ və FinCERT nümunəsi, `legacyLocale`):
    - `^/(?:(az|en)/)?pages/strategy/?$` → 104 slug-ları;
    - `^/(?:(az|en)/)?page-872(?:/.*)?$` → 66;
    - `^/(?:(az|en)/)?page-878(?:/.*)?$` → 76.

    Slug-lar `entities/page-node`-da sabitdir (`STRATEGY_SLUG`, `RISK_SUPERVISION_SLUG`, `MICROFINANCE_SLUG`: `Record<Locale, string>`).
  - PDF ünvanlarında nöqtə var və proxy matcher-i (`.*\..*`) onları buraxır. Ona görə onlar `next.config.ts` `redirects()`-dədir (`permanent: true`):
    az → `/az/<104 az slug>`, en → `/en/<104 en slug>`. Next 16 sənədi `node_modules/next/dist/docs/`-da oxunur.
- **Rationale**: FR-024, Konstitusiya VII.2. Mövcud mexanizm təkrarlanmır.

## R20 — Seed (`0044`) səhifə seçimi dəyişmir

- **Decision**: R11-in az slug-ları artıq 104, 66 və 76-dır. Bu, istifadəçinin göstərdiyi üç səhifənin qarşılığıdır. Seed dəyişmir. Strategiya kartının
  az/en başlıqları mock-dakı kimi qalır, sayt səhifənin başlığını yox, kartın başlığını göstərir.

## R15 — Sabitlər, i18n, sənədlər

- **Decision**:
  - Sabitlər: `STRATEGY_DOCS_MAX` (sayt, `views/home/constants.ts`). Admin-də uzunluq limitləri `features/homepage/model/constants.ts`-dədir
    (`STRATEGY_DOC_LIMITS`), API ilə eyni rəqəmlərdir.
  - i18n: admin `homepage.json`-a `tabs.strategyDocs`, `strategyDocs.*`, sahə və xəta açarları (az/en, `check:i18n`). Saytın `home.json`-u dəyişmir.
  - Sənədlər eyni dəyişiklikdə yenilənir: `dokumentasiyalar/ana-sehife-bloklari-guide.md`, kök `CLAUDE.md`, iki komponentin `CLAUDE.md`-si,
    `business_logic/` (`/sync-business-logic`), OpenAPI `# Sync:` sətri.
- **Rationale**: spec 032, FR-020, yaddaş `menu-changes-update-docs`.
