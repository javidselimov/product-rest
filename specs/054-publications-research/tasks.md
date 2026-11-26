# Tasks: "Nəşrlər və tədqiqatlar" bölməsi — Figma dizaynı, işçi məqalələri və ümumi arxiv qaydaları

**Input**: `specs/054-publications-research/`: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

**Tests**:
- Frontend testləri davranış testləridir: rol, `userEvent`, MSW (yaddaş `functional-component-tests`). `frontend-standards` TDD tələb edir: test
  tapşırığı implementasiyadan əvvəl gəlir və əvvəl qırmızı olmalıdır.
- Bu spec iki yeni `AboutLayoutKind` əlavə edir (`file-archive`, `document-list`). Layout fixture guard məcburidir (root `CLAUDE.md`).
- API-lərdə test layihəsi yoxdur. Yoxlama: `dotnet build` + PGlite üzərində endpoint və seed icrası (`quickstart.md` §2–§4, yaddaş `pglite-api-testing`) + route-diff.

**Təşkili**: Tapşırıqlar user story-lər üzrə qruplaşdırılıb. Hər komponent ayrıca merge request-dir. Deploy sırası: `api-cbar-admin` (MR 1) → `api-cbar`
(MR 2) → `web-cbar-admin-new` (MR 3) → `web-cbar-new` (MR 4). Workspace sənədləri və `specs/` ayrıca commit-dir. Commit yalnız istəklə edilir.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: paralel işlənə bilər (fərqli fayllar, açıq asılılıq yoxdur)
- **[Story]**: aid olduğu user story (spec.md):
  - US1 — ziyarətçi işçi məqalələrini tapır və oxuyur — P1
  - US2 — redaktor işçi məqalələrini admin paneldə idarə edir — P1
  - US3 — ziyarətçi illik hesabatları və digər dövri nəşrləri il üzrə tapır (bölmə şablonu, fayl ölçüsü) — P1
  - US4 — ziyarətçi bölmədə Figma-dakı kimi gəzir (ağac, sol menyu, tək sənəd səhifələri) — P2
  - US5 — açılan menyular və redaktorun menyu yeri seçimi (`showInDropdownNav`, `menuGroup`) — P2
  - US6 — köhnə məqalələr və ünvanlar itmir — P3, **son faza, təxirə salına bilər**

## Yol qısaltmaları

- `ADMIN-API` = `product-rest/api-cbar-admin` · `WEB-API` = `product-rest/api-cbar`
- `ADMIN` = `product-rest/web-cbar-admin-new` · `SITE` = `product-rest/web-cbar-new`
- `SEED` = `specs/054-publications-research/seed` · `TMP` = `.tmp-pubs` (gitignored)
- `WP-SITE` = `SITE/src/features/working-papers` · `WP-W` = `SITE/src/widgets/working-papers` · `WP-ADMIN` = `ADMIN/src/features/working-papers`
- `AC` = `SITE/src/features/about-content` · `AB` = `SITE/src/widgets/about-blocks`

## Ümumi qaydalar (hər tapşırıq üçün)

- **Frontend skill qaydası** (`.claude/hooks/frontend-skills.mjs`): `SITE` və ya `ADMIN` tapşırığına başlamazdan əvvəl bu skill-lər yüklənir:
  `senior-front`, `frontendpatterns` və həmin komponentin `frontend-standards`, `ui-kit-usage` skill-ləri. Kod `plan.md` "Frontend Skills Gate"
  cədvəlinə uyğun yazılır.
- Yeni şərhlər ingiliscə yazılır (yaddaş `code-comments-english`). UI mətni yalnız i18n açarı ilə verilir, az və en.
- Rəqəmlər adlı sabitdir (spec 032): `WP-SITE/model/constants.ts`, `WP-W/constants.ts`, `AC/model/constants.ts`, `WP-ADMIN/model/constants.ts`.
- `SITE`-da `prettier --write` işlədilmir. Fayllar Edit və ya Node ilə redaktə olunur (yaddaş `windows-shell-crlf`, `no-prettier-write-web-cbar-new`).
  Köməkçi skriptlər və test API cavabları `TMP/`-dədir (yaddaş `fork-agents-share-tmp`).
- `SITE`-da `dangerouslySetInnerHTML` yalnız `widgets/cms-content`-dədir. Yeni `'use client'` yoxdur. `Reveal` iç-içə olmur.
- Figma-da gizli qatlar qurulmur: "Maraqlı ola bilər", mega menyu alt başlıqları, açar söz/JEL çipləri, illik hesabatın şrift qutusu, tablet/mobil
  "Bütün məqalələr". **Mega menyu komponentinə toxunulmur** (spec 055).
- API endpoint-ləri spec-first yazılır: OpenAPI əvvəl gəlir (T002–T004). `.claude/hooks/spec-first.mjs` bundle-da olmayan route-u rədd edir.
- `Cbar.Domain` iki nüsxədə bayt-bayt eynidir. `dotnet` `C:/Program Files/dotnet/dotnet`-dədir. Docker işlətmə (yaddaş `dotnet-sdk-local-build`).
- Mövcud cədvəllərə `ALTER` yoxdur (yaddaş `no-alter-existing-tables`).

---

## Phase 1: Setup

**Purpose**: köhnə məzmunun baza xətti, Figma mətnləri və spec-first kontraktlar.

- [X] T001 Test API-dən (`https://api-cbar-test.cbar.az`) bu səhifələrin `GET /api/v1/pages/{slug}?locale=az|en` cavablarını `TMP/api/`-yə yaz: 62–76, 102, 103 və
  "(Kopya)" ağacı 371–385. Sonra `TMP/baseline.json`-u yaz (SC-002 baza xətti):
  - hər səhifə üçün forma: `TMP/shapes.mjs` qaydası (`details` sayı, `/media/N` link sayı, assets sayı);
  - hər dil üçün mətndəki fayl linklərinin siyahısı;
  - `TMP/sizes.mjs` çıxışı: saxta ölçülü media sayı.
- [X] T002 [P] `ADMIN-API/openapi/paths/working-papers.yaml`, `components/schemas/working-papers.yaml`, `components/schemas/pages.yaml` (`showInDropdownNav`,
  tərcümədə `menuGroup`) + `openapi.yaml` `paths` sətirləri. Əhatə: `contracts/admin-api.md`-dəki bütün route-lar, DTO-lar, 400/404/409 `problem+json`.
  Sonra `npm run lint && npm run bundle` (`ADMIN-API/openapi`)
- [X] T003 [P] `WEB-API/openapi/paths/working-papers.yaml`, `components/schemas/working-papers.yaml`, `components/schemas/pages.yaml` (`PageNode`: `showInDropdownNav`,
  `menuGroup`, required + nullable) + `openapi.yaml`. Əhatə: `GET /api/v1/working-papers`, `GET /api/v1/working-papers/{key}` (`contracts/public-api.md`). Sonra
  `npm run lint && npm run bundle` (`WEB-API/openapi`)
- [X] T004 OpenAPI dəyişikliklərini istifadəçiyə təsdiq üçün göstər (spec-first qaydası, `/api-endpoint` skill-i). Təsdiqsiz controller yazılmır
- [X] T005 [P] `SEED/figma-texts.json` + `SEED/README.md`. Mənbə: `TMP/t_*.json` (figma_text çıxışları). Yazılacaqlar:
  - kök (`2698:22502`), iki qrup (`3487:291490`, `2730:100609`), ekonometrik modellər (`2699:23673`), dörd tək sənəd (`2766:114051`, `2767:115663`, `2776:16546`, `2776:18033`) və
    işçi məqalələri (`2825:22947`) üçün H1 başlığı və giriş paraqrafları;
  - fırıldaqçılıq (`2797:19903`) və illik hesabat (`2748:10054`) üçün yalnız başlıq;
  - `README.md`: mənbə node id-ləri, generatorların işlədilmə sırası, en mətnlərin draft olduğu.

**Checkpoint**: baza xətti yazılıb, iki OpenAPI bundle hazırdır və təsdiqlənib, Figma mətnləri repo-dadır.

---

## Phase 2: Foundational (bütün hekayələr bundan asılıdır)

**Purpose**: sxem, entity-lər və saytın paylaşılan qatı.

### Sxem (`api-cbar-admin`, MR 1)

- [X] T006 `ADMIN-API/db/migrations/0038-working-papers.sql`. Tələblər:
  - `working_papers` və `working_paper_translations` (`data-model.md`): `text[]` sütunları, CHECK-lər, partial unique `(number, year)` və `legacy_page_id`, siyahı indeksi;
  - şərti FK DO bloku (0034 kimi: `users`, `media_assets`, `locales`);
  - `set_updated_at` trigger;
  - `cbar_web_ro` GRANT;
  - `working_papers.read|create|update|delete` + `moderator` (0034 nümunəsi, `INSERT` yoxdursa `RAISE WARNING`);
  - `IF NOT EXISTS`, BEGIN/COMMIT yox.
- [X] T007 [P] `ADMIN-API/db/migrations/0039-page-nav-details.sql`: `page_nav_details (page_id PK, show_in_dropdown_nav boolean NULL)` və
  `page_translation_details (page_id, locale, menu_group varchar(120), PK (page_id, locale))`. Şərti FK `pages`/`locales`-ə, `cbar_web_ro` GRANT
- [X] T008 [P] `ADMIN-API/db/migrations/0040-media-asset-details.sql`: `media_asset_details (media_id bigint PK, size_verified_at timestamptz NOT NULL)`, şərti FK
  `media_assets`-ə. `cbar_web_ro`-ya grant yoxdur: public API bu cədvəli oxumur
- [X] T009 `ADMIN-API/src/Cbar.Domain/Entities/WorkingPaper.cs` (`WorkingPaper`, `WorkingPaperTranslation`; siyahılar `List<string>` ↔ `text[]`), `Content.cs`
  (`PageNavDetail`, `PageTranslationDetail`, `MediaAssetDetail`; `Page.NavDetails`, `Page.TranslationDetails` naviqasiyaları), `CbarDbContext.cs` mapping-i
  (snake_case, `content_status`, açarlar `data-model.md`-dəki kimi, `ValueGeneratedNever` detail PK-larında)
- [X] T010 T009-un fayllarını `WEB-API/src/Cbar.Domain/`-ə kopyala. `diff -rq product-rest/api-cbar/src/Cbar.Domain product-rest/api-cbar-admin/src/Cbar.Domain` boş olmalıdır.
  Sonra iki API üçün `dotnet build`
- [X] T011 [P] `ADMIN-API/src/Cbar.AdminApi/Authorization/Permissions.cs`: `WorkingPapers` sinfi (`working_papers.read|create|update|delete`) və `All` siyahısı
- [X] T012 [P] `ADMIN-API/src/Cbar.AdminApi/Services/MediaRules.cs`: `DocumentMimeTypes` `FincertSupport.cs`-dən buraya köçür (research R16).
  `FincertSettingsController.cs` yeni yeri işlədir, `FincertSupport`-da re-export qalmır. `dotnet build`
- [X] T013 PGlite yoxlaması (yaddaş `pglite-api-testing`):
  - boş bazada `0001…0040` tətbiq olunur;
  - test dump-ı olan bazada eyni;
  - ikinci start-da heç nə dəyişmir;
  - `cbar_web_ro` ilə `INSERT INTO working_papers` "permission denied" verir.

### Saytın paylaşılan qatı (`web-cbar-new`, MR 4)

- [X] T014 [P] `SITE/src/entities/page-node/lib/tree.test.ts`-ə testlər yaz (qırmızı):
  - `sectionKeyOf` "Nəşrlər və tədqiqatlar" / "Publications and research" kökünü `publications` tanıyır;
  - `isWorkingPapersSlug('isci-meqaleler-silsilesi' | 'working-paper-series')`;
  - sxem `showInDropdownNav`/`menuGroup` sahələri olan və olmayan node-u qəbul edir.
- [X] T015 T014-ü yaşıl et (`SITE/src/entities/page-node/`):
  - `SITE/src/entities/page-node/lib/tree.ts`: `SectionKey` + `'publications'`, `SECTION_TITLES.publications`, `WORKING_PAPERS_SLUG`, `isWorkingPapersSlug`;
  - `model/schemas.ts`: iki sahə `nullable().optional()`;
  - `index.ts` export-ları.

  `SectionKey` üzərindəki `switch`-lərdə yeni case: `cms-page/loader.ts` müvəqqəti `plain` qaytarır, layout seçimi T057-dədir.
- [X] T016 [P] `AB/document-card.test.tsx`-ə testlər yaz (qırmızı):
  - kart bir link-dir, ad və ölçü görünür (`formatFileSize`);
  - `sizeBytes` 0 və ya yoxdursa ölçü sətri yoxdur;
  - mime PDF-dirsə çip "PDF", tanınmayan mime-da ümumi "Fayl";
  - `target=_blank rel=noopener`.
- [X] T017 T016-nı yaşıl et (`AB/document-card.tsx`, `AC/model/`):
  - `AB/document-card.tsx`, ui-contract §6;
  - `AC/model/types.ts`-də `ArchiveFile`-a `sizeBytes?`;
  - `AC/model/year-archive.ts`-də `archiveFile` asset-dən `sizeBytes`-ı götürür;
  - `AB/consumer-parts.tsx`-dəki `DocumentCard` yeni kartı işlədir, ikinci kart qalmır. Spec 050 testləri yaşıl qalır.
- [X] T018 [P] `SITE/src/widgets/year-menu/year-menu.test.tsx`-ə testlər yaz (qırmızı):
  - `<details>` bağlı gəlir, `summary` seçilmiş dəyəri göstərir ("İl: Hamısı" / "2025");
  - linklər `buildHref` ilə qalan parametrləri saxlayır (`q`), `page`-i atır;
  - seçilmiş bənddə `aria-current="true"` var;
  - JS-siz də işləyir (adi `<a>`).
- [X] T019 T018-i yaşıl et (`SITE/src/widgets/year-menu/`):
  - `SITE/src/widgets/year-menu/{year-menu.tsx,constants.ts,index.ts}`: trigger, panel və bənd ölçüləri ui-contract §3/§5-dəndir, max-h 352 daxili sürüşmə ilə;
  - ~~`AB/year-sort-menu.tsx` eyni `<details>` primitivini işlədir~~ — **edilmədi** (2026-11-20): iki menyunun görünüşü və dəyişmə səbəbi fərqlidir (kiçik düymə vs sahə + panel); ortaq primitiv onları bağlayardı (senior-front: "two similar things that change for different reasons are not duplication"). Memorandum menyusu dəyişməyib.
- [X] T020 [P] `AC/model/split-details.ts` + test: `splitAtFirstDetails(html)` → `{ before, rest }`. Legacy `div` sarğıları `topNodes` ilə açılır. Bunu US1 (siyahı girişi)
  və US3 (il arxivi) işlədir
- [X] T021 [P] `SITE/src/shared/testing/fixtures/pages.ts` (və ya mövcud ağac fikstürü). Yeni bölmə ağacı əlavə olunur:
  - quruluş `data-model.md` "Ağac seed-i"-dəki kimi, az/en, `showInSideNav`/`showInDropdownNav`/`menuGroup` dəyərləri ilə;
  - 6 gizli səhifə və "(Kopya)" daxil.

  Mövcud nav testləri yaşıl qalır (bölmə əlavə olunur, başqa heç nə dəyişmir).

**Checkpoint**: sxem və entity-lər hazırdır. Sayt bölməni tanıyır, ortaq kart, il menyusu və ağac fikstürü var.

---

## Phase 3: User Story 1 — ziyarətçi işçi məqalələrini tapır və oxuyur (P1) 🎯 MVP

**Goal**: `/az/isci-meqaleler-silsilesi` Figma Variant B kimi görünür. Tərkibi:
- giriş mətni;
- axtarış (İ/ı qatlanması ilə), il menyusu, "Filtrləri təmizlə";
- sətirlər və səhifələmə.

Hər sətir `…/NN-YYYY` detalına aparır: meta, xülasə, açar sözlər və JEL mətn kimi, PDF kartı. Məqalə yoxdursa CMS mətni göstərilir. Hamısı JS-siz işləyir.

**Independent Test**: 25 məqalə fikstürü ilə siyahı, axtarış, il, səhifələmə və boş vəziyyət yoxlanır. Detal tam və yarımçıq məqalə ilə yoxlanır. API 500 olanda
səhifə CMS mətnini göstərir.

### Public API (`api-cbar`, MR 2)

- [X] T022 [US1] `WEB-API/src/Cbar.WebApi/Controllers/WorkingPapersController.cs`, `contracts/public-api.md` üzrə:
  - siyahı: görünürlük filtri, sıra `year DESC, number DESC`, yığcam DTO;
  - detal: `key` regex `^\d{2}-\d{4}$`-dır, səhv format → 404 `problem+json`; `file` silinməmiş mediadır, `AssetFile` formasında;
  - `locale` normallaşdırılır.

  `dotnet build`, `route-diff.mjs` fərqsiz.
- [X] T023 [US1] PGlite: `quickstart.md` §4-ün işçi məqalələri sətirləri. Bir neçə məqalə SQL ilə yaradılır, `cbar_web_ro` ilə qoşulmaq daxil

### Tests (əvvəl yazılır, qırmızı)

- [X] T024 [P] [US1] `WP-SITE/model/select.test.ts`. Hallar:
  - `foldForSearch` ilə başlıqda, müəllifdə və açar sözdə axtarış ("muxtarov", "İNFLYASİYA" ↔ "inflyasiya", "ı"/"I");
  - il filtri;
  - dildə mövcud illər azalan;
  - səhifələmə 10-luqdur, `page` aralıqdan kənardırsa sıxılır;
  - `formatKey(2, 2025) === '02-2025'`, `parseKey`.
- [X] T025 [P] [US1] `SITE/src/views/working-papers/loader.test.ts` (MSW). Hallar:
  - `locale` sorğuya keçir;
  - `q`/`year`/`page` Zod ilə parse olunur;
  - API 500 → `null`;
  - dildə məqalə yoxdur → `null`;
  - CMS səhifəsi 404 → `null`;
  - giriş `splitAtFirstDetails`-in `before` hissəsidir (köhnə il akkordionları yoxdur);
  - `shell.crumbs` "Ana səhifə › Nəşrlər və Tədqiqatlar › Tədqiqatlar › İşçi məqalələri".
- [X] T026 [P] [US1] `SITE/src/views/working-papers/index.test.tsx` (`renderApp`). Yoxlanır:
  - axtarış forması `method=get`, `sr-only` label, placeholder "Məqalə adı, müəllif və ya açar söz";
  - "Axtar" `type=submit`-dir;
  - il menyusu linkləri `q`-nu saxlayır;
  - "Filtrləri təmizlə" parametrsiz linkdir;
  - "Bütün məqalələr" başlığı var;
  - sətir bir link-dir və `…/02-2025`-ə aparır;
  - sətirdə "№ 02/2025", "Tarix: 2025", başlıq, müəlliflər və "İngilis dili" var;
  - boş nəticədə boş vəziyyət mətni və təmizləmə linki;
  - səhifələmə linkləri.
- [X] T027 [P] [US1] `SITE/src/views/working-paper/{loader.test.ts,index.test.tsx}`. Yoxlanır:
  - meta `<dl>` dörd sahə ilə;
  - "Xülasə";
  - açar sözlər və JEL vergüllə bir sətirdir;
  - açar sözsüz/JEL-siz məqalədə həmin başlıqlar yoxdur;
  - faylsız məqalədə kart yoxdur;
  - PDF kartında ölçü;
  - breadcrumb son bəndi başlıqdır, sol menyuda "İşçi məqalələri" `aria-current`-dir;
  - `parseKey` səhvdirsə və ya API 404 verirsə `notFound`;
  - dil dəyişdiricisi en-də olmayan məqaləni en siyahısına aparır.

### Implementation

- [X] T028 [US1] `WP-SITE/api/working-papers.api.ts` (`server-only`: `getWorkingPapers` → `cachedJson`, `getWorkingPaper` → `cachedJsonOrNull`), `WP-SITE/model/schemas.ts`,
  `SITE/src/shared/testing/handlers/working-papers.ts` (+ `handlers/index.ts`-də qeydiyyat), `SITE/src/shared/testing/fixtures/working-papers.ts`.
  Fikstürdə 25 məqalə var (2013–2026): biri yalnız az, biri açar sözsüz və JEL-siz, biri faylsız
- [X] T029 [US1] `WP-SITE/model/{select.ts,constants.ts}`: `WORKING_PAPERS_PAGE_SIZE = 10`, `WORKING_PAPER_KEY` regex, `filterPapers`, `paperYears`, `paginate`,
  `formatKey`, `parseKey`, `formatCode`. T024 yaşıl olur
- [X] T030 [P] [US1] `WP-W/paper-filter.tsx`, ui-contract §3. Tərkib:
  - `<form method="get">`, kit `Input` (`startElement` böyüdücü ikon) və kit `Button`;
  - `YearMenu`, gizli `year` sahəsi, "Filtrləri təmizlə" linki;
  - desktop bir sətir, tablet/mobil alt-alta.
- [X] T031 [P] [US1] `WP-W/paper-row.tsx` + `WP-W/constants.ts`, ui-contract §3 sətir cədvəli:
  - bütün sətir bir `<a>`, hover border, `focus-visible` halqası;
  - mobil şaquli düzülüş;
  - dil adı chrome etiketindən gəlir.
- [X] T032 [P] [US1] `WP-W/paper-meta.tsx`, ui-contract §4:
  - `<dl>`: desktop/tablet 4 sütun 1.76 : 1 : 1 : 1, mobil alt-alta;
  - `<section aria-labelledby>` blokları (Xülasə, Açar sözlər, JEL);
  - xülasə sətir sonlarına görə paraqraflara bölünür.
- [X] T033 [US1] `SITE/src/views/working-papers/{loader.ts,index.tsx}`:
  - loader: `Promise.allSettled([getPage, getWorkingPapers])`, `buildSectionShell`, `null` halları;
  - view: `SectionShell`, giriş (`CmsContent`), filtr, "Bütün məqalələr" (tablet/mobildə `max-tab:hidden`, Figma), `<ol>` sətirlər `Reveal` capped stagger ilə, `ListPagination`, boş vəziyyət.

  T025–T026 yaşıl olur.
- [X] T034 [US1] `SITE/src/views/working-paper/{loader.ts,index.tsx}`:
  - loader: `cache()`, `parseKey`, `buildSectionShell({ current: { slug }, trail: title })`, o biri dilin ünvanı (məqalə orada yoxdursa siyahı);
  - view: H1, `PaperMeta`, `DocumentCard` (ad = başlıq).

  T027 yaşıl olur.
- [X] T035 [US1] `SITE/src/app/[locale]/(content)/[...slug]/page.tsx`. FinCERT yoxlamasından sonra:
  - `isWorkingPapersSlug(last)` olarsa siyahı view-u açılır, `null` olanda mövcud CMS axını işləyir;
  - `slug.length ≥ 2`, `isWorkingPapersSlug(slug.at(-2))` və `WORKING_PAPER_KEY.test(last)` olarsa detal açılır;
  - `generateMetadata`: detal üçün başlıq və xülasənin ilk ~160 simvolu (`WP-SITE/model/constants.ts`), siyahı üçün bugünkü kimi.
- [X] T036 [P] [US1] `SITE/src/locales/{az,en}/workingPapers.json` + i18n qeydiyyatı. Açarlar:
  - axtarış label və placeholder, "Axtar", "Filtrləri təmizlə", "İl", "Hamısı", "Bütün məqalələr";
  - "№", "Tarix", "Müəllif(lər)", "Nömrə", "Dil", "Xülasə", "Açar sözlər", "JEL təsnifatı";
  - dil adları (Azərbaycan dili / İngilis dili / Digər);
  - boş vəziyyət.
- [X] T037 [US1] Review: `ui-kit-review` + `senior-front` review checklist (`references/review-checklist.md`) US1-də dəyişən `SITE` fayllarına. `plan.md` "Frontend
  Skills Gate" ilə tutuşdur: GET forması, kart-link bir fokus nöqtəsi, `<dl>`, semantik rənglər, `'use client'` yoxdur. Tapılanları düzəlt
- [X] T038 [US1] `SITE`: `npm run verify`, Node 22 ilə `npm run test:run` (yaddaş `run-tests-on-node22`)

**Checkpoint**: fikstürlə siyahı və detal Figma görünüşündədir, JS-siz işləyir. Public endpoint PGlite-da yoxlanılıb.

---

## Phase 4: User Story 2 — redaktor işçi məqalələrini admin paneldə idarə edir (P1)

**Goal**: admin paneldə "İşçi məqalələri" CRUD bölməsi: vergüllü siyahı sahələri, yoxlamalar, audit. Siyahı səhifəsinin formasından bölməyə keçid var.

**Independent Test**: məqalə yaradılır, redaktə olunur, dərcdən çıxarılır, silinir. `GET /api/v1/working-papers` hər addımı əks etdirir. Eyni nömrə/il 409 verir.

### Admin API (`api-cbar-admin`, MR 1)

- [X] T039 [US2] `ADMIN-API/src/Cbar.AdminApi/Controllers/WorkingPapersController.cs`, `contracts/admin-api.md` üzrə:
  - `CbarControllerBase`, `[RequirePermission]`;
  - siyahı: `PagingQuery` + `year`/`status`/`q`;
  - detal və POST/PUT/DELETE: siyahılar normallaşdırılır (trim, boş və təkrar silinir, JEL böyük hərfə çevrilir);
  - yoxlamalar `errors` obyektinə yazılır; media `MediaRules.DocumentMimeTypes` ilə yoxlanır; göndərilməyən dil silinir;
  - `AuditService.Log("working_papers.*")`;
  - unikal pozuntunu `DbExceptionHandler` tutur, `try/catch` yoxdur.

  `dotnet build`, `route-diff.mjs`.
- [X] T040 [US2] PGlite: `quickstart.md` §3-ün işçi məqalələri sətirləri (201, 409, 400 sahə xətaları, siyahı filtrləri, soft-delete-dən sonra eyni nömrə)

### Admin panel (`web-cbar-admin-new`, MR 3). Əvvəl `ADMIN/.claude/skills/{frontend-standards,ui-kit-usage}` yüklənir

- [X] T041 [P] [US2] `WP-ADMIN/working-papers.test.tsx`. Yoxlanır:
  - siyahıda il və status filtrləri və axtarış sorğu parametrinə düşür;
  - "Yeni" ili ötürür;
  - formada vergüllü sahələr massiv kimi göndərilir və redaktədə `", "` ilə birləşir;
  - server 409 nömrə sahəsinin altında görünür;
  - `errors.translations[1].authors` en tabında görünür və tab işarələnir;
  - PDF seçicidə şəkil deaktivdir;
  - saxlanmamış dəyişikliklə çıxanda təsdiq soruşulur.
- [X] T042 [P] [US2] `ADMIN/src/shared/testing/handlers/working-papers.ts` + `fixtures/working-papers.ts` (real kontrakt forması), `handlers/index.ts`-də qeydiyyat
- [X] T043 [US2] `WP-ADMIN/api/{working-papers.keys.ts,working-papers.service.ts}` və `WP-ADMIN/model/{schemas.ts,module.ts,constants.ts}`:
  - `ModuleConfig`: sütunlar, filtrlər, `supportsSearch`, `listEnvelope: 'paged'`, `prefillFromSearch: ['year']`;
  - sahələr `contracts/admin-ux.md` §2-dəki kimi;
  - `buildPayload` vergülə görə bölür, `parseDetail` birləşdirir;
  - `schema(base).superRefine` FR-004 qaydalarını yoxlayır.

  T041 yaşıl olur.
- [X] T044 [US2] `ADMIN/src/pages/working-papers/index.tsx`, `ADMIN/src/app/routes/index.ts`: `createCrudRoutes(registerModule(workingPapersModule), …)`. Yeni `React.lazy`
  `shared/lib/chunk-reload.ts` ilə sarılır
- [X] T045 [US2] Sidebar (`ADMIN/src/app/routes/nav.ts`, `ADMIN/src/locales/{az,en}/nav.json`):
  - `ADMIN/src/app/routes/nav.ts`: `NAV_GROUPS`-a `publications` (`consumer`-dən sonra, `faq`-dan əvvəl), `NavKey` `workingPapers`, bənd;
  - `ADMIN/src/locales/{az,en}/nav.json`: qrup və bənd;
  - sidebar/router testlərində bağlı sətir sayı.
- [X] T046 [P] [US2] `ADMIN/src/locales/{az,en}/workingPapers.json` + `ADMIN/src/shared/i18n/index.ts` qeydiyyatı. `check:i18n` iki dili tutuşdurur
- [X] T047 [US2] `ADMIN/src/features/pages/model/managed-sections.ts`: `'isci-meqaleler-silsilesi' → { kind: 'link', to: '/working-papers', group: 'publications', item:
  'workingPapers' }`. `locales/{az,en}/pages.json` `managedSection.workingPapersText`. `features/pages/pages.test.tsx`-ə hal: kart görünür, sol menyuda "İşçi
  məqalələri" işarələnir
- [X] T048 [US2] Review: `ui-kit-review` + `senior-front` review checklist US2-də dəyişən `ADMIN` fayllarına. `plan.md` "Frontend Skills Gate" ilə tutuşdur: CRUD şablonu,
  əl ilə yazılmış ekran yoxdur, kit komponentləri, i18n. Tapılanları düzəlt
- [X] T049 [US2] `ADMIN`: `npm run verify`

**Checkpoint**: redaktor məqaləni bir formada dərc edir (SC-005), sayt onu növbəti açılışda göstərir.

---

## Phase 5: User Story 3 — il arxivləri, sənəd kartları və real fayl ölçüləri (P1)

**Goal**:
- Bölmənin hər səhifəsi mətninin formasına görə göstərilir: il arxivi (il menyusu + kartlar, "Hamısı") və ya sənəd siyahısı (giriş + kartlar).
- Səhifənin ümumi fayl siyahısı göstərilmir.
- Köhnə faylların ölçüsü MinIO-dan düzəldilir.

**Independent Test**:
- `illik-hesabat` mətni dəyişdirilmədən il menyusu ilə açılır, default ən yeni il, `?year=all` bütün illər.
- `risk-esasli-…` bir kartla açılır.
- Redaktor yeni il akkordionu əlavə edəndə o, menyuda görünür.
- Backfill-dən sonra kartlarda real ölçü var.

### Media ölçüsü (`api-cbar-admin`, MR 1)

- [X] T050 [US3] `ADMIN-API/src/Cbar.AdminApi/Services/MediaSizeBackfillService.cs` (`BackgroundService`), research R10 / `contracts/admin-api.md`:
  - `MigrationRunner`-dən sonra başlayır, `pg_try_advisory_lock`;
  - `media_asset_details` sətri olmayan və silinməmiş media 100-lük partiyalarla emal olunur;
  - Minio `StatObjectAsync(storage_key)` çağırılır, ölçü fərqlidirsə `UPDATE size_bytes`, sonra details sətri yazılır;
  - obyekt tapılmasa xəbərdarlıq loglanır, sətir yenə yazılır;
  - xülasə logu `checked/fixed/missing` sayları ilə;
  - ləğv tokeni hörmətlə qarşılanır.

  `Program.cs`-də `AddHostedService`. `dotnet build`.
- [X] T051 [US3] `ADMIN-API/src/Cbar.AdminApi/Services/MediaStorage.cs` (və ya upload controller): yeni media sətri ilə birlikdə `media_asset_details` sətri eyni
  `SaveChanges`-də yazılır. Dedup halında (mövcud sətir qaytarılanda) yeni sətir yazılmır
- [X] T052 [US3] Backfill yoxlaması (`quickstart.md` §2.6). Docker işləmir, iki yol var:
  - **lokal**: MinIO standalone binary (`minio server`) + PGlite;
  - **binary yoxdursa**: dev mühitində deploy-dan sonra Grafana logu (yaddaş `grafana-test-dashboard`, `App api-cbar-admin`) və test API-də `GET /api/v1/pages/illik-hesabat`
    `sizeBytes`-ın real olması.

  Nəticə `specs/054-publications-research/README.md`-yə yazılır.

### Tests (sayt, əvvəl yazılır, qırmızı)

- [X] T053 [P] [US3] Guard fixture-ları (`contracts/publication-markup.md` "Guard"):
  - `AC/fixtures/file-archive.html`: 63-ün az mətninin 3 illik qısaldılmış forması, üstəlik boş və qeyri-il `summary`-li qrup, başqa səhifəyə link, `before` şrift linki və
    `after` paraqrafı, redaktorun saxladığı formada;
  - `AC/fixtures/document-list.html`: 66-nın Figma girişi + bir fayl linki.

  Eyni iki fayl `ADMIN/src/features/rich-text/fixtures/layouts/`-ə kopyalanır.
- [X] T054 [P] [US3] `AC/model/layout-fixtures.test.ts`: `EXPECTED_BLOCKS`-a `file-archive: ['file-archive']`, `document-list: ['document-list']`, `blockShape`-ə iki case.
  `typecheck` T055-ə qədər qırmızıdır
- [X] T055 [P] [US3] `AC/model/file-archive.test.ts`. Hallar:
  - il qrupları azalan;
  - legacy `<div><a>` və redaktor `<p><a>`;
  - `data-media-link`-siz `/media/N`;
  - `summary`-də sətir sonu (103);
  - boş başlıq → "Digər", qeyri-il başlıq illərdən sonra;
  - təkrar il birləşir;
  - qrupda fayl olmayan link adi linkdir;
  - `before`/`after`-də yalnız fayl linkli paraqraf kartdır, qalanı HTML-dir;
  - ölçü asset-dən gəlir.
- [X] T056 [P] [US3] `AC/model/document-list.test.ts` + `AC/model/layouts.test.ts`:
  - `publicationsLayoutFor` forma matrisi (`contracts/publication-markup.md` cədvəli): `details` → `file-archive`; fayl linki → `document-list`; linksiz, amma assets var →
    `document-list` (74); heç biri → `plain`;
  - `document-list`: giriş və kartlar sırası; assets-dən kart adı `title`, yoxdursa fayl adı.
- [X] T057 [P] [US3] `SITE/src/views/cms-page/publications.test.tsx` (`renderApp`, T021 ağacı + səhifə fikstürləri). Hallar:
  - `illik-hesabat`: "İl" menyusu 2025 seçili, yalnız 2025 kartları, şrift linki menyunun üstündə kart kimi;
  - `?year=all` bütün illər azalan; `?year=abc` default-a düşür;
  - fayl siyahısı (`Attachments`) yoxdur;
  - `risk-…`: giriş + bir kart, ölçü ilə;
  - `ekonometrik-modeller`: asset-dən kart;
  - kök və qrup səhifəsi adi mətndir;
  - `isci-meqaleler-silsilesi` API 500 halında il arxivi kimi açılır, linklər adi linkdir.

### Implementation (sayt, MR 4)

- [X] T058 [US3] `AC/model/types.ts`: `AboutLayoutKind` + `'file-archive' | 'document-list'`, blok tipləri (`data-model.md` "Sayt görünüş modeli").
  `AC/model/constants.ts`: `ARCHIVE_ALL = 'all'`, il regex-i (mövcud `ARCHIVE_YEAR` işlədilir)
- [X] T059 [US3] `AC/model/file-archive.ts`: `parseFileArchive(html, ctx)`. `splitAtFirstDetails`, `detailsOf`, `topNodes`, `archiveFile` istifadə olunur.
  Media linki `href`-ə görə tanınır. T055 yaşıl olur
- [X] T060 [US3] `AC/model/document-list.ts`: `parseDocumentList(html, ctx)`. `AC/model/layouts.ts`: `publicationsLayoutFor(html, assets)`. T056 yaşıl olur
- [X] T061 [US3] Bağlantılar (`AC/model/parse.ts`, `SITE/src/views/cms-page/`):
  - `AC/model/parse.ts`: dispatch-ə iki layout;
  - `SITE/src/views/cms-page/loader.ts`: `section === 'publications'` olarsa `publicationsLayoutFor(content, assets)`;
  - `SITE/src/views/cms-page/index.tsx`: `BLOCKS_WITH_FILES`-ə iki növ; `year` axtarış parametri (`QUERY_PARAM.YEAR`) view-da oxunur və bloka ötürülür (spec 050
    tab/channel nümunəsi).
- [X] T062 [US3] `AB/file-archive.tsx` və `AB/document-list.tsx`, ui-contract §5/§6/§7:
  - `before` → `YearMenu` ("İl" etiketi + 220 seçim, mobil qalan en) → seçilmiş qrup(lar) (başlıq 20/28, mobil 18/26; kartlar arası 12, qruplar arası 40) → `after`;
  - sənəd siyahısında aralar 36;
  - `Reveal` hər blok üçün bir dəfə, kartlarda capped stagger.

  `AB/about-blocks.tsx` switch-i. T053, T054, T057 yaşıl olur.
- [X] T063 [P] [US3] `SITE/src/locales/{az,en}/about.json`: "İl", "Hamısı", "Digər" / "Other", fayl çipi ("Fayl"), menyu label-ı
- [X] T064 [US3] `ADMIN/src/features/rich-text/roundtrip.test.ts`: siyahıya `file-archive` və `document-list`. İki fixture bayt-bayt saxlanılmalıdır. Canlı API varsa
  `npm run roundtrip -- "İllik hesabat" "Risk əsaslı nəzarət üzrə Siyasət Konsepsiyası"`
- [X] T065 [US3] Review: `ui-kit-review` + `senior-front` review checklist US3-də dəyişən `SITE` fayllarına. Yoxlanır:
  - tək HTML sink;
  - slug cədvəli yoxdur;
  - bir kart komponenti;
  - `<details>` menyusu;
  - boş və tanınmayan formada `plain`.

  Tapılanları düzəlt.
- [X] T066 [US3] `SITE`: `npm run verify` (`check:layout-fixtures` daxil), Node 22 ilə `npm run test:run`. `ADMIN`: `npm run verify`

**Checkpoint**: bölmənin bütün köhnə səhifələri yeni şablonla görünür, heç bir fayl itmir (SC-002). Yeni il akkordionu kodsuz menyuya düşür (SC-006).

---

## Phase 6: User Story 4 — bölmədə Figma-dakı kimi gəzmək: ağac, sol menyu, tək sənəd səhifələri (P2)

**Goal**: Seed bunları edir:
- iki qrup səhifəsi yaradır, səhifələri Figma sırası ilə yerləşdirir;
- iki səhifəni istehlakçı bölməsindən köçürür;
- 6 səhifəni menyudan çıxarır;
- Figma başlıqlarını və giriş mətnlərini yalnız köhnə mətnin üzərinə yazır.

Sol menyuda iki açılan qrup var.

**Independent Test**: PGlite-da seed işlədikdən sonra ağac `data-model.md`-dəki kimidir, ikinci işləmə heç nəyi dəyişmir. Saytda hər Figma ekranı açılır, sol menyu
qrupları və aktiv bənd düzgündür.

- [X] T067 [US4] `SEED/extract-tree.mjs`:
  - test API-dən bölmə səhifələrinin az/en başlığını, mətnini və md5-ni oxuyur (və ya T001 cavablarından);
  - `SEED/figma-texts.json` ilə birləşdirir;
  - `SEED/tree.json` yazır: hər səhifə üçün slug, köhnə başlıq, köhnə md5, Figma başlığı, Figma girişi (az + en draft) və hədəf parent/sıra.
- [X] T068 [US4] `SEED/build-tree-seed.mjs` → `ADMIN-API/db/migrations/0041-publications-tree-seed.sql`, research R13 üzrə:
  - icazə guard-ı (0031 kimi);
  - qrup səhifələrinin yaradılması (slug toqquşmasında `-2`);
  - köçürmə (`path` və alt ağac);
  - Figma sırası;
  - `page_details`: 102/103 üçün `true` → 102 `false`; 6 səhifə `false`;
  - `page_nav_details` 102 `true`;
  - `page_translation_details`: 4 sənəd + 102 üçün menyu qrupu (az + en draft);
  - başlıq yalnız `title = legacy` olanda;
  - giriş yalnız `md5 = legacy` olanda;
  - `NOTICE` xülasəsi;
  - "(Kopya)"-ya toxunulmur.

  Generator ikinci dəfə eyni baytları verir.
- [X] T069 [US4] PGlite: `quickstart.md` §2.3–2.5:
  - ağac `data-model.md`-dəki kimidir;
  - 87-nin qalan uşaqlarının sırası dəyişməyib;
  - ikinci start-da heç nə dəyişmir;
  - redaktə olunmuş mətnə giriş yazılmır;
  - boş bazada xəta yoxdur.
- [X] T070 [P] [US4] `SITE/src/widgets/section-shell/section-shell.test.tsx` (və ya `views/cms-page/publications.test.tsx`), T021 ağacı ilə. Hallar:
  - kökdə iki qrup bağlıdır;
  - qrup səhifəsində həmin qrup açıqdır, başlıq aktiv rəngdədir;
  - yarpaqda qrup açıqdır, bənd `aria-current`-dir;
  - "Nəşrlər…" qrupunda 7 bənd var, "Ödəniş xidmətləri" yoxdur;
  - 6 gizli səhifə yoxdur;
  - gizli səhifə açıq olanda breadcrumb bölməni göstərir, aktiv bənd yoxdur;
  - 102/103 breadcrumb-u bu bölmədəndir.
- [X] T071 [US4] `SITE/src/widgets/section-shell/*`: ui-contract §1–§2-yə uyğunlaşdır:
  - qrup başlığı 16/28 w600 + caret;
  - açıq qrupun başlığı primary;
  - link default `muted-foreground` zəif, aktiv w500;
  - tablet/mobil blok başlığın üstündə;
  - native `<details>`.

  Mövcud bölmələrin (about, media, cooperation, literacy, consumer) testləri yaşıl qalmalıdır. Fərq lazımdırsa `SectionKey`-ə görə variant verilir.
- [X] T072 [US4] Review: `ui-kit-review` + `senior-front` checklist US4-də dəyişən `SITE` fayllarına. Fokus: shell-in başqa bölmələrə təsiri yoxdur, semantik rənglər.
  Tapılanları düzəlt
  (Shell yalnız `section === 'publications'`-da fərqlənir. `--site-file-faint` bölmənin ümumi zəif mətni olduğu üçün `--site-faint` adlandı.
  Açıq qalan: #A3A3A3 mətn #F5F5F5 fonda ~2.3:1, WCAG AA-dan aşağıdır — Figma tələbidir, dizayn qərarı lazımdır.
  Sol menyu `<details>` yox, server vəziyyəti ilə açılır: qrup başlığı qrup səhifəsinə linkdir, ui-contract §2 bunu tələb etmir)
- [X] T073 [US4] `SITE`: `npm run verify`, Node 22 ilə `npm run test:run` (173 fayl, 1656 test, hər ikisi yaşıl)

**Checkpoint**: ağac Figma-dakı kimidir, bütün köhnə ünvanlar açılır, heç bir səhifə silinməyib.

---

## Phase 7: User Story 5 — açılan menyular və redaktorun menyu yeri seçimi (P2)

**Goal**:
- "Ödəniş xidmətləri" yalnız açılan menyularda görünür.
- Redaktor səhifənin menyu yerini üç seçimlə idarə edir və menyu qrupu etiketini yazır.
- Ağac endpoint-i iki yeni sahəni qaytarır.

**Independent Test**: admin-də seçim dəyişdirilir, `GET /pages/tree` yeni dəyəri qaytarır. Saytda sol menyu və mega menyu buna uyğun dəyişir. Etiket saxlanılır.

### API (MR 1, MR 2)

- [X] T074 [US5] `ADMIN-API/src/Cbar.AdminApi/Controllers/PagesController.cs`:
  - input `bool? ShowInDropdownNav`, "göndərilməyən = saxla"; sətir yalnız `null` deyilsə və ya varsa yazılır;
  - `PageTranslationDto.MenuGroup`: trim, boş → `null`, 120 simvol;
  - `page_translation_details` upsert;
  - detal DTO hər ikisini qaytarır, audit before/after.

  `dotnet build`.
- [X] T075 [US5] `WEB-API/src/Cbar.WebApi/Controllers/PagesController.cs`: `PageNode` record + `ShowInDropdownNav` (`bool?`) və `MenuGroup` (dildə). `GetTree` projection
  subquery ilə. `dotnet build`, `route-diff.mjs`
- [X] T076 [US5] PGlite: `quickstart.md` §3-ün səhifə sətirləri və §4-ün `pages/tree` sətri
  (`.tmp-pubs/t076-check.mjs`, 16 yoxlama keçdi. Quickstart düzəldildi: `showInDropdownNav: null` kontrakta görə saxlanılan dəyəri saxlayır;
  ağacda 66/67/69/76-nın da `menuGroup`-u var)

### Sayt (MR 4)

- [X] T077 [P] [US5] `SITE/src/entities/page-node/lib/tree.test.ts`-ə `isInDropdownNav` matrisi (`data-model.md` cədvəli). `SITE/src/shell/nav.test.ts`-ə hal:
  "Ödəniş xidmətləri" "Nəşrlər…" sütununda var, `section-shell` sol menyusunda yoxdur. `mobile-nav` testinə hal: siyirtmədə var
- [X] T078 [US5] `SITE/src/entities/page-node/lib/tree.ts`: `isInDropdownNav = showInDropdownNav ?? showInSideNav !== false`. `isInSideNav` dəyişmir. T077 yaşıl
  olur. `menuGroup` heç yerdə render olunmur (spec 055)
- [X] T079 [US5] Review: `ui-kit-review` + `senior-front` checklist US5-də dəyişən `SITE` fayllarına (`SITE/src/entities/page-node/lib/tree.ts`, testlər).
  Fokus: qayda bir yerdədir, komponentlər bayrağı təkrar hesablamır. Sonra `SITE`: `npm run verify`

### Admin panel (MR 3)

- [X] T080 [P] [US5] `ADMIN/src/features/pages/pages.test.tsx`. Hallar:
  - üç radio düzgün cütü göndərir (`contracts/admin-ux.md` §3 cədvəli);
  - bölmə kökündə "Yalnız açılan menyularda" deaktivdir;
  - saxlanılmış `true`+`false` cütü məlumat mətni göstərir və dəyişməz göndərilir;
  - en tabında `menuGroup` göndərilmirsə saxlanılır;
  - "Saytın menyusunda" xülasəsi yeni qaydanı göstərir.
  (`pages.test.tsx`: üç seçim `it.each`, kök, köhnə `true`+`false` cütü, kart xülasəsi, menyu qrupu — dəyişməyən etiket PUT-da göndərilmir.
  `menu-visibility.test.ts`-də `menuLocationOf` matrisi; spec 041/048 testləri checkbox-dan radio-ya keçdi)
- [X] T081 [US5] Admin implementasiyası (`ADMIN/src/features/pages/`). T080 yaşıl olur:
  - `ADMIN/src/features/pages/model/{schemas.ts,menu-visibility.ts}`: radio ↔ cüt çevrilməsi, `isInDropdownNav` qaydası;
  - `components/menu-visibility-card.tsx`: kit `radio-group` + `Field`, kömək mətnləri;
  - `components/page-form.tsx`: dil tabında "Menyu qrupu" sahəsi;
  - `ADMIN/src/shared/testing/handlers/pages.ts`: merge iki sahəni saxlayır;
  - `locales/{az,en}/pages.json`.
  (Panel `menuGroup`-u yalnız redaktor dəyişəndə göndərir: göndərilməyən = saxla. "Sol menyuda göstər" checkbox-u bayraqlar kartından çıxdı,
  kartdakı radio qrupuna keçdi. Yeni səbəblər: `dropdownNavOff`, `parentDropdownNavOff`)
- [X] T082 [US5] Review: `ui-kit-review` + `senior-front` checklist US5-də dəyişən `ADMIN` fayllarına. Fokus: radio qrupu `fieldset/legend`, qadağan vəziyyətlər, i18n.
  Tapılanları düzəlt
- [X] T083 [US5] `ADMIN`: `npm run verify`
  (69 fayl, 702 test; Node 22 ilə də yaşıl)

**Checkpoint**: menyu yeri redaktor tərəfindən idarə olunur. Etiket data kimi hazırdır (spec 055 üçün).

---

## Phase 8: User Story 6 — köhnə məqalələr və ünvanlar (P3) — son faza, təxirə salına bilər

**Goal**: ~78 köhnə məqalə canlı cbar.az-dan köçürülür. Köhnə `page-NNN/*` ünvanları 308 ilə detala gedir. Köçürülməmiş, amma tanınan köhnə məqalə 307 ilə siyahıya
gedir.

**Independent Test**: seed boş, köhnə və artıq köçürülmüş bazada işlədilir. Say köhnə linklərin sayına bərabərdir. Bir neçə köhnə ünvan brauzerdə açılır.

**Həcm qeydi** (yaddaş `flag-token-heavy-work`): ~78 məqalə × 2 dil oxunur, ~78 PDF yüklənir. Başlamazdan əvvəl istifadəçidən təsdiq alınır.

- [ ] T084 [US6] `SEED/extract-papers.mjs`:
  - köhnə siyahı linklərini (T001-dəki 73 az/en mətni) götürür, hər `page-<id>`-ni canlı saytdan `?language=az|en` ilə oxuyur;
  - research R18-dəki etiketləri çıxarır;
  - `SEED/working-papers.json` yazır, yarımçıq sətirləri ayrıca siyahıda göstərir;
  - en mətni boşdursa və ya az ilə eynidirsə en başlığı boş qalır;
  - sorğular arasında gecikmə var, ümumi User-Agent işlədilir (şəxsi məlumat yoxdur).

  Yoxlama: `az 77 links / 76 ids`, `en 78 / 77`.
- [ ] T085 [US6] `SEED/upload-media.mjs`: PDF-ləri `uploads.cbar.az`-dan `TMP/pdf/`-ə endirir, admin API-yə `POST /api/v1/media` ilə yükləyir (login env-dən, repo-ya yazılmır).
  Nəticə `SEED/media-map.json`: köhnə fayl → `original_name`. Təkrar işlətmək yeni media yaratmır
- [ ] T086 [US6] `SEED/build-papers-seed.mjs` iki fayl yaradır:
  - `ADMIN-API/db/migrations/0043-working-papers-seed.sql` (`0042` spec 056-nın seed-idir; o vaxt `0043` də məşğuldursa növbəti boş nömrə): media `original_name` ilə tapılır, `(number, year)` və ya
    `legacy_page_id` varsa ötürülür, status `published`, `NOTICE` sayları;
  - `SITE/src/shared/config/legacy-working-papers.ts`: `Record<number, string>` köhnə id → `NN-YYYY`.

  Generator deterministikdir.
- [ ] T087 [US6] PGlite (`ADMIN-API/db/migrations/0043-working-papers-seed.sql`): seed iki dəfə işlədilir, ikinci dəfə 0 sətir yaranır. Say köhnə linklərin sayı ilə tutuşdurulur (SC-007). Yarımçıq məqalələr istifadəçiyə
  siyahı kimi verilir
- [ ] T088 [P] [US6] `SITE/src/proxy.test.ts`-ə hallar:
  - `/page-895/nowcasting-household-consumption`, `/en/page-895/x`, `/page-895/x?language=en` → 308 → `/az|en/{WORKING_PAPERS_SLUG}/02-2025`;
  - xəritədə olmayan `page-NNN` bugünkü kimi işləyir.

  `SITE/src/views/working-paper/loader.test.ts`-ə hal: xəritədəki açar API-də yoxdursa siyahıya 307, xəritədə olmayan açar → 404.
- [ ] T089 [US6] `SITE/src/proxy.ts`: `LEGACY_WORKING_PAPERS` qaydası `legacyPageRedirect` nümunəsi ilə, `legacyLocale`, 308. `SITE/src/views/working-paper/loader.ts`: köçürülməmiş
  köhnə açar üçün `redirect` (307). T088 yaşıl olur
- [ ] T090 [US6] Review (`senior-front` checklist: proxy statik və sinxron qalır) və `SITE`: `npm run verify`, Node 22 ilə `npm run test:run`

**Checkpoint**: köhnə siyahıdakı bütün məqalələr yeni siyahıda və axtarışda var. Köhnə ünvanlar 404 vermir.

---

## Phase 9: Polish & Cross-Cutting

- [X] T091 [P] `SITE/docs/publications-cms-guide.md` (yeni) və `SITE/CLAUDE.md`. Təlimatın mövzuları:
  - bölmə şablonu formaya görə seçilir (il akkordionu, fayl linki, adi mətn);
  - "Hamısı";
  - sənəd kartı və ölçü;
  - işçi məqalələri: admin forması, vergüllü sahələr, ünvan açarı;
  - menyu yeri üç seçimi, menyu qrupu (055-də görünəcək);
  - fallback.
  (`docs/publications-cms-guide.md` yeni, `CLAUDE.md`-yə bölmə bəndi və `SectionKey` siyahısı)

  `SITE/CLAUDE.md`-yə bölmə bəndi.
- [X] T092 [P] `dokumentasiyalar/nesrler-ve-tedqiqatlar-guide.md` (admin paneldən idarəetmə, ekran-ekran, azərbaycanca) + `dokumentasiyalar/README.md` sətri
- [X] T093 [P] Kök `CLAUDE.md` və `ADMIN/CLAUDE.md`:
  - kök `CLAUDE.md`, web-cbar-new bölməsinə "Nəşrlər və tədqiqatlar" bəndi: `SectionKey 'publications'`, `publicationsLayoutFor`, iki layout guard-ın siyahısına, işçi
    məqalələri məzmun növü və ünvanı, `showInDropdownNav`, `menuGroup` (göstərilmir, 055);
  - kök `CLAUDE.md`, admin bölməsinə: "İşçi məqalələri", menyu yeri radio-su;
  - kök `CLAUDE.md`, api-cbar-admin bölməsinə: `MediaSizeBackfillService` və `media_asset_details`;
  - kök `CLAUDE.md`, Object storage bölməsinə: ölçü düzəlişi qeydi;
  - `ADMIN/CLAUDE.md`: vergüllü siyahı sahəsi nümunəsi.
  (Kök `CLAUDE.md`-də spec 041/048 bəndi də radio-ya görə yeniləndi)
- [X] T094 [P] Menyu sənədləri (yaddaş `menu-changes-update-docs`):
  - `specs/046-international-memberships/contracts/admin-nav.md`: `publications` qrupu və sıra;
  - `SITE/docs/consumer-rights-cms-guide.md`: "Ödəniş xidmətləri" və "Rəqəmsal fırıldaqçılıq statistikası" bu bölməyə köçüb;
  - digər `SITE/docs/*-cms-guide.md`-lərdəki admin menyu yolları yoxlanılır.
  (`admin-nav.md`-yə `publications` qrupu. "Sol menyuda göstər" checkbox-u radio-ya keçdiyi üçün about, media, cooperation, literacy,
  consumer təlimatları və `dokumentasiyalar/`-da iki təlimat yeni seçimə görə yeniləndi)
- [X] T095 [P] `business_logic/new_business_logic.md` və `diff_report_logic.md` (`/sync-business-logic`, `pages + navigation + data-model + admin + media` modulları)
  (`/sync-business-logic` modul filtri ilə: new §3.1, §3.3 (`0038`–`0041`), §5.1 menyu yeri və menyu qrupu, yeni §5.1i, §7.1, §8.1 ölçü düzəlişi,
  §9.2, §12 #51–54; diff §5.1-ə bölmə sətri, fayl ölçüsü ❓ → ⚠️. `old_businesslogic.md` dəyişməyib: `product-host` toxunulmayıb)
- [X] T096 [P] İki `openapi.yaml`-ın `# Sync:` sətri (`/sync-openapi` qaydası); `route-diff` hər iki API-də fərqsiz
  (`# Sync:` sətirlərində spec 054 artıq var; `route-diff` api-cbar və api-cbar-admin-də fərqsiz)
- [X] T097 Figma ölçməsi (yaddaş `figma-measure-dom`, `hybrid-fixture-proxy-for-ui-measuring`; 744-də scrollbar 15 px):
  - 1728, 744 və 390 enliyində Edge CDP ilə `getBoundingClientRect` ölçülür və `contracts/ui-contract.md` §1–§7 ilə tutuşdurulur, fərq ≤ 2 px (SC-001);
  - ekranlar: siyahı, detal, üç il arxivi ("Hamısı" daxil), tək sənəd, ekonometrik, kök, iki qrup, il menyusu açıq;
  - üfüqi sürüşmə olmamalıdır;
  - fərqlər düzəldilir.
  (Edge headless + xam CDP, `.tmp-pubs/t097-measure.mjs`, PGlite + 12 nümunə məqalə. 9 ekran × 3 en + açıq il menyusu. Üfüqi sürüşmə yoxdur.
  Düzəldildi: tablet-də menyu → başlıq 32 → 40 və mobil H1 22/28 → 24/32, altı 32 → 24 (`section-shell` `publications` variantı, digər bölmələr
  dəyişmir); siyahı filtrinin sahələri tablet-də 44 → 48; tablet meta sütunları 245.5/139.5 → 240.2/141.3. Qalan fərqlər qəsdəndir: il menyusu
  panelinin kölgəsi kit `shadow-md` (Figma 0 8 24 /.08), səhifələmənin passiv fonu kit rəngi (Figma #f9f9f9), detal kartında ölçü (research R9))
- [X] T098 `quickstart.md`-nin bütün addımlarını icra et. Yoxlanır:
  - JS söndürülmüş brauzerdə axtarış, il menyusu, səhifələmə və sol menyu işləyir;
  - `Cbar.Domain` diff boşdur;
  - SC-002: T001 baza xəttindəki hər fayl linki yeni saytda az/en-də əlçatandır.
  (§1–§6 əvvəlki tapşırıqlarda (T040, T052, T068–T069, T076) və bu sessiyada: `Cbar.Domain` mənbəsi eynidir (fərq yalnız `bin/obj`);
  SC-002: baza xəttinin 43 səhifə/dil üzrə 342 fayl linkinin hamısı yeni saytda var (`.tmp-pubs/t098-links.mjs`); JS-siz axtarış, il menyusu,
  səhifələmə, sol menyu və arxiv `?year=all` işləyir (`.tmp-pubs/t098-nojs.mjs`, 8/8). §7 (köçürmə) US6 ilə təxirə salınıb.
  Sayt `verify`: 173 fayl, 1657 test)
- [X] T099 Təhvil qeydi `specs/054-publications-research/README.md`-də (yaddaş `root-tracker-for-multiday-work`):
  - en qrup başlıqları, girişlər və menyu qrupları draft-dır;
  - backfill nəticəsi (T052);
  - US6-nın vəziyyəti (edilib / təxirə salınıb);
  - spec 055 üçün açıq məsələlər: mega menyu Variant B, "Maraqlı ola bilər", qısa menyu adları, `menuGroup`-un göstərilməsi, mobil F.
  (README "Təhvil" bölməsi: qaralamalar, backfill, US6 təxirə salınıb, spec 055 məsələləri)

---

## Dependencies & Execution Order

### Phase asılılıqları

- **Phase 1** asılılıqsızdır. T004 (OpenAPI təsdiqi) bütün controller tapşırıqlarını bloklayır: T022, T039, T074, T075.
- **Phase 2** Phase 1-dən sonra gəlir.
  - API: T006 → T009 → T010 → T013; T007, T008, T011, T012 T006 ilə paralel gedir.
  - Sayt (T014–T021) T003-dən sonra paralel gedir.
- **US1 (Phase 3)** Phase 2-dən sonra gəlir. T022 T010-dan sonra. Sayt fikstürlə işləyir. MVP.
- **US2 (Phase 4)** yalnız Phase 2-dən asılıdır. US1 ilə paralel gedə bilər (başqa komponentlər).
- **US3 (Phase 5)** Phase 2-dən sonra gəlir (T017, T019, T020). T050–T052 T008-dən sonra. US1-dən asılı deyil. T057-nin işçi məqalələri fallback halı T035-dən sonra
  yaşıl olur.
- **US4 (Phase 6)** T005, T007 və T001-dən sonra gəlir. Sayt testləri T021-dən sonra. Səhifə şablonları (tək sənəd) US3-dədir, ona görə ekranların tam görünüşü US3-dən
  sonradır.
- **US5 (Phase 7)** T007, T009-dan sonra gəlir. Seed-in 102 bayrağının saytda görünməsi T068 + T075 + T078-dən sonradır.
- **US6 (Phase 8)** US1 (T034) və US2 (media yükləmə admin API ilə) bitdikdən sonra gəlir. İstifadəçi təsdiqi lazımdır.
- **Polish** bütün hekayələrdən sonra gəlir (US6 təxirə salınıbsa onsuz).

### Deploy sırası (Konstitusiya IV.2)

1. MR 1 `api-cbar-admin`: T002, T006–T013, T039–T040, T050–T052, T068–T069, T074 (son faza: T086-nın SQL faylı).
2. MR 2 `api-cbar`: T003, T010, T022–T023, T075.
3. MR 3 `web-cbar-admin-new`: T041–T049, T053 (admin fixture nüsxəsi), T064, T080–T083.
4. MR 4 `web-cbar-new`: T014–T021, T024–T038, T053–T063, T065–T066, T070–T073, T077–T079 (son faza: T086-nın TS faylı, T088–T090).

### Fayl toqquşmaları (ardıcıl olmalıdır)

- `SITE/src/entities/page-node/lib/tree.ts` + `tree.test.ts`: T014 → T015 → T077 → T078
- `SITE/src/views/cms-page/{loader.ts,index.tsx}`: T015 → T061
- `SITE/src/views/cms-page/publications.test.tsx`: T057 → T070 (eyni faylda yazılırsa)
- `SITE/src/views/working-paper/{loader.ts,loader.test.ts}`: T027 → T034 → T088 → T089
- `SITE/src/app/[locale]/(content)/[...slug]/page.tsx`: yalnız T035
- `SITE/src/widgets/about-blocks/consumer-parts.tsx`: yalnız T017
- `AC/model/layout-fixtures.test.ts`, `AC/model/parse.ts`: T054 → T061
- `ADMIN/src/features/pages/*` (`managed-sections.ts`, `pages.test.tsx`, `page-form.tsx`, `menu-visibility*`): T047 → T080 → T081
- `ADMIN/src/app/routes/nav.ts`: yalnız T045
- `ADMIN-API/.../PagesController.cs`: yalnız T074 · `WEB-API/.../PagesController.cs`: yalnız T075
- `SITE/src/proxy.ts` + `proxy.test.ts`: T088 → T089

### Paralel imkanlar

- Phase 1: T002 ‖ T003 ‖ T005 (T001 ilə də paralel).
- Phase 2: T007 ‖ T008 ‖ T011 ‖ T012. Sayt tərəfi T014, T016, T018, T020 və T021 testləri/fikstürləri paralel gedir.
- US1: testlər T024–T027 paralel; widget-lər T030–T032 paralel; T036 istənilən vaxt.
- US2: admin API (T039–T040) panel işi (T041–T047) ilə paralel; T041 ‖ T042 ‖ T046.
- US3: T050–T052 (API) sayt işi ilə paralel; testlər T053–T057 paralel.
- US1, US2, US3 Phase 2-dən sonra üç paralel axın kimi gedə bilər (fərqli fayllar, yuxarıdakı toqquşmalardan başqa).
- Polish: T091–T096 paralel.

### Paralel nümunə: US1

```text
T024 select.test.ts ‖ T025 loader.test.ts ‖ T026 index.test.tsx ‖ T027 detail tests
sonra: T028 api/schemas/MSW → T029 select.ts → (T030 filter ‖ T031 row ‖ T032 meta ‖ T036 locales)
       → T033 list view → T034 detail view → T035 route dispatch → T037 review → T038 verify
```

### Paralel nümunə: US3

```text
API:  T050 backfill service → T051 upload details → T052 yoxlama
Sayt: T053 fixtures ‖ T054 EXPECTED_BLOCKS ‖ T055 file-archive test ‖ T056 document-list/layouts test ‖ T057 view test
      → T058 types → (T059 file-archive ‖ T060 document-list) → T061 wiring → T062 blocks ‖ T063 locales → T064 admin roundtrip → T065 → T066
```

## Implementation Strategy

### MVP (Phase 1 + 2 + US1 + US2)

İşçi məqalələri tam işləyir: redaktor məqaləni admin-də dərc edir, ziyarətçi tapır və oxuyur. Köhnə məqalələr hələ köçmədiyi üçün redaktor yeni məqalələri əl ilə əlavə
edir. Siyahı boş olanda səhifə köhnə mətni göstərir, ona görə MVP deploy-u heç nəyi pozmur.

### Artımlı çatdırılma

1. MVP: US1 + US2.
2. US3: bölmə şablonu və real ölçülər. Bütün köhnə səhifələr yeni görünüşdə olur.
3. US4: ağac seed-i. Bölmə Figma quruluşunu alır.
4. US5: menyu yeri ("Ödəniş xidmətləri" yalnız açılan menyularda).
5. Polish: sənədlər, Figma ölçməsi, quickstart.
6. US6: istifadəçi təsdiqindən sonra köhnə məqalələr və 308 xəritəsi.

US3 və US4 MVP-dən əvvəl də gedə bilər. Onlar məqalə endpoint-indən asılı deyil.

Diqqət: US4-ün seed-i (T068) "Ödəniş xidmətləri"nə `show_in_side_nav = false` + `show_in_dropdown_nav = true` yazır. Sayt T078-ə qədər yeni bayrağı tanımır, o vaxta qədər
səhifə hər iki menyudan gizli qalır. Bu, bugünkü vəziyyətdir (0031 onu gizlətmişdi), reqressiya deyil. Yenə də US4 və US5 eyni buraxılışda deploy edilməlidir.

### Qeydlər

- Mega menyu komponenti, "Maraqlı ola bilər", qısa menyu adları və `menuGroup`-un göstərilməsi heç bir tapşırıqda yoxdur (spec 055, istifadəçi qərarı 2026-11-20).
- Hər frontend fazası review (ui-kit-review + senior-front) və `npm run verify` ilə bitir (layihə qaydası).
- en draft mətnləri redaktor işidir (T099).
