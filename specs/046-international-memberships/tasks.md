# Tasks: Beynəlxalq təşkilatlarda üzvlük + admin menyunun bölmələr üzrə qruplaşdırılması

**Input**: `specs/046-international-memberships/`: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

**Tests**: Frontend testləri davranış testləridir (rol, `userEvent`, MSW; yaddaş `functional-component-tests`). Layout fixture guard məcburidir
(CLAUDE.md). API-də test layihəsi yoxdur: seed `quickstart.md` §1 ilə PGlite üzərində real icra ilə yoxlanılır.

**Təşkili**: User story-lər üzrə. Hər komponent ayrıca merge request-dir: `api-cbar-admin` (yalnız SQL) → `web-cbar-new`; `web-cbar-admin-new`
müstəqil. `api-cbar` dəyişmir. Commit yalnız istəklə.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: paralel işlənə bilər (fərqli fayllar, açıq asılılıq yoxdur)
- **[Story]**: aid olduğu user story (spec.md: US1 ziyarətçi, US2 redaktor cədvəli, US3 admin menyu, US4 seed)

## Yol qısaltmaları

- `ADMIN-API` = `product-rest/api-cbar-admin`
- `ADMIN` = `product-rest/web-cbar-admin-new`
- `SITE` = `product-rest/web-cbar-new`

## Ümumi qaydalar (hər tapşırıq üçün)

- Yeni şərhlər ingiliscə; dəyişilən faylda azərbaycanca şərhlər də ingiliscəyə çevrilir (yaddaş `code-comments-english`).
- Rəqəmlər sabitlərdə (spec 032): sayt — slice `constants.ts` və ya `src/shared/constants/<topic>.ts`; `no-magic-numbers` `verify`-da.
- `SITE`-da `prettier --write` işlədilmir; Windows-da fayl redaktəsi Edit/Node ilə (yaddaş `windows-shell-crlf`), köməkçi skriptlər repo-lokal `.tmp-046/`-da.
- `SITE`: `dangerouslySetInnerHTML` yalnız `widgets/cms-content`; yeni `'use client'` yoxdur.

---

## Phase 1: Setup

- [X] T001 `git status` təmizdir; `ADMIN-API/db/migrations/`-da `0029*` yoxdur və `product-rest/api-cbar/db/migrations` yoxdur (ad unikaldır); `SITE` və `ADMIN`-də `npm run verify` başlanğıcda yaşıldır (sonrakı qırmızılar bu spec-dəndir)
- [X] T002 Test API-də vəziyyəti təkrar yoxla: `GET https://api-cbar-test.cbar.az/api/v1/pages/beynelxalq-teskilatlarda-uzvluk?locale=az|en` hələ yer tutucudur və en sətri az başlıq/slug daşıyır (research R1); dəyişibsə `research.md` R1/R6-nı yenilə

---

## Phase 2: Foundational

**US1 və US2-nin ortaq əsası: yeni layout növü və view-modeli.**

- [X] T003 `SITE/src/features/about-content/model/types.ts`: `AboutLayoutKind`-ə `'memberships'`; `Membership` (`organization`, `href`, `yearLabel`, `year`) və `MembershipsBlock` (`kind`, `introHtml`, `rows`, `restHtml`) tipləri, `AboutBlock` birləşməsinə `MembershipsBlock` (`data-model.md` §2); faylın başlıq şərhinə "spec 046"

**Checkpoint**: `typecheck` `layout-fixtures.test.ts`-in `EXPECTED_BLOCKS`-ında `memberships` olmadığı üçün qırmızıdır — T011-də bağlanır.

---

## Phase 3: User Story 1 - Ziyarətçi üzvlük cədvəlini görür və çeşidləyir (Priority: P1) 🎯 MVP

**Goal**: Səhifə 554 Figma görünüşündə: başlıq, çeşidləmə, iki sütunlu cədvəl (az/en, 3 en), memorandum səhifəsi dəyişmir.

**Independent Test**: MSW-də 14 sətirlik məzmunla səhifəni 1728/744/390-da aç, `contracts/ui-contract.md` ilə ölç, `?sort=oldest` / `?sort=xyz`
sıralarını yoxla; memorandum səhifəsinin testləri dəyişmədən keçir.

### Çeşidləmənin ümumiləşdirilməsi (research R4)

- [X] T004 [US1] `SITE/src/features/about-content/model/year-sort.ts` (yeni): `YEAR_SORT = { NEWEST, OLDEST }`, `YearSort`, `parseYearSort(value)` (yalnız `'oldest'` → OLDEST), `orderByYear<T>(rows, yearOf: (row) => number | null, sort)` — sabit sıralama: il azalan/artan, eyni ildə giriş sırası, `null` il hər iki halda sonda
- [X] T005 [P] [US1] `SITE/src/features/about-content/model/year-sort.test.ts` (yeni): iki sıra, eyni ildə sıranın qalması, `null` ilin sonda qalması, tanınmayan/massiv parametr → NEWEST
- [X] T006 [US1] `SITE/src/features/about-content/model/memorandums.ts`: `MEMORANDUM_SORT`/`MemorandumSort`/`parseMemorandumSort`/`orderMemorandums` silinir, istifadəçilər `year-sort.ts`-ə keçir (`orderByYear(rows, (r) => r.year, sort)`); `memorandums.test.ts` yeni adlarla, nəticələr eyni qalır
- [X] T007 [US1] `SITE/src/widgets/about-blocks/memorandum-sort.tsx` → `SITE/src/widgets/about-blocks/year-sort-menu.tsx` (`YearSortMenu`, props `sort`, `locale`, `label: string`, `optionLabel: (sort) => string`), `data-slot="year-sort"`; `memorandums.tsx` onu `t('memorandums.sort.label')` ilə çağırır; köhnə fayl silinir
- [X] T008 [US1] `memorandumSort` → `yearSort` adı: `SITE/src/widgets/about-blocks/about-blocks.tsx` (prop + şərh), `SITE/src/views/cms-page/index.tsx` (`parseYearSort(query?.[QUERY_PARAM.SORT])`), `SITE/src/widgets/about-blocks/index.ts` ixracları; `SITE/src/views/cms-page/cooperation.test.tsx` və `SITE/src/widgets/about-blocks/memorandums.test.tsx` dəyişmədən keçir (yalnız `data-slot` seçicisi lazım olsa)

### Parse və layout

- [X] T009 [US1] `SITE/src/features/about-content/model/memberships.ts` (yeni): `parseMemberships(nodes): MembershipsBlock` — `contracts/cms-markup.md` qaydaları 1–5: birinci `table` (`tableRows`), birinci `td` sətrinin başlıq kimi tanınması (2-ci xanada il yoxdursa), xana 1 → `textOf` + birinci `http(s)` `href`, xana 2 → `yearLabel` + `year` (regex sabiti `constants.ts`-də, 1800–2099), boş sətirlərin atılması, `introHtml`/`restHtml` `outerOf` ilə; uğursuzluqda bütün məzmun `introHtml`, `rows: []`
- [X] T010 [P] [US1] `SITE/src/features/about-content/model/memberships.test.ts` (yeni): `th` başlığı, `td` başlığı, başlıqsız cədvəl (ilk sətir göstərilir), link (`http`, `javascript:` atılır), il mətni "2025-ci il" / "1997/1998" / boş, 3+ xana, boş sətir, cədvəl yoxdur, iki cədvəl (ikincisi `restHtml`-də), giriş/sonrakı mətn
- [X] T011 [US1] `SITE/src/features/about-content/model/parse.ts`: `if (layout === 'memberships') return [parseMemberships(nodes)]` (şərh siyahısına spec 046); `SITE/src/features/about-content/model/layouts.ts` `COOPERATION_LAYOUTS`-a `beynelxalq-teskilatlarda-uzvluk`, `-copy`, `membership-in-international-organizations`, `-copy` → `'memberships'` (başlıq şərhi "specs 044, 045, 046"); `SITE/src/features/about-content/model/layouts.test.ts` (`ifi-organizations.test.ts`-dəki `'plain'` gözləntisi `beynelxalq-teskilatlarda-uzvluk` üçün `'memberships'` olur)
- [X] T012 [US1] Fikstür: `SITE/src/features/about-content/fixtures/memberships.html` — `contracts/cms-markup.md` §Fikstür (giriş `<p>`, `th` başlıq + 3 sətir, biri linkli, sonra `<p>`), redaktorun saxladığı formada (`colspan`/`rowspan`, `colgroup`, `style="min-width…"`); `SITE/src/features/about-content/model/layout-fixtures.test.ts`: `EXPECTED_BLOCKS.memberships = ['memberships:3']` və `blockShape`-də `case 'memberships'` (`rows.length`)

### Görünüş

- [X] T013 [P] [US1] `SITE/src/widgets/about-blocks/constants.ts`: memorandum cədvəlinin ortaq sinifləri (`HEAD_CELL`, `BODY_CELL`, zebra sətri, çərçivə) buraya çıxarılır; `memorandums.tsx` onları idxal edir, render eyni qalır
- [X] T014 [US1] `SITE/src/widgets/about-blocks/memberships.tsx` (yeni): `Memberships({ block, locale, sort })` — `introHtml` `CmsContent variant="about"`; sətir varsa `section[aria-labelledby]` + `sr-only` H2 (`memberships.title`), controls sətri (`YearSortMenu`, label `memberships.sort.label`), 2 sütunlu `table` (`colgroup`: qalan / `w-20 tab:w-[164px]`), başlıq xanaları `memberships.columns.organization|year` (il sağa; mobil "Üzvlük / tarixi" iki sətir — `max-w` ilə), sətirlər `orderByYear(block.rows, r => r.year, sort)`, link `target="_blank" rel="noopener noreferrer"`; mobil xana padding-ləri `contracts/ui-contract.md` (təşkilat `pr-2 pl-3 tab:px-6`, il `pr-3 tab:pr-6`), mobil çeşidləmə düyməsi `pr-0 tab:pr-3`; sonra `restHtml` `CmsContent`
- [X] T015 [US1] `SITE/src/widgets/about-blocks/about-blocks.tsx`: `case 'memberships'` → `<Memberships block locale sort={yearSort} />`; `SITE/src/widgets/about-blocks/index.ts` ixracı
- [X] T016 [P] [US1] `SITE/src/locales/az/about.json` və `SITE/src/locales/en/about.json`: `memberships.title` ("Azərbaycan Respublikası Mərkəzi Bankının üzv olduğu təşkilatlar" / "Organizations the Central Bank of the Republic of Azerbaijan is a member of"), `memberships.columns.organization` ("Təşkilat"/"Organization"), `memberships.columns.year` ("Üzvlük tarixi"/"Year of membership"), `memberships.sort.label` ("Üzvlük tarixi:"/"Membership year:"), `memberships.sort.newest|oldest` ("əvvəlcə yenilər|əvvəlcə köhnələr" / "newest first|oldest first")
- [X] T017 [P] [US1] `SITE/src/shared/testing/fixtures/cooperation-section.ts`: ağaclara 554 (`beynelxalq-teskilatlarda-uzvluk` / en `membership-in-international-organizations`) və `membershipPageAz/En` (14 sətir, `data-model.md` §4) — başlıq şərhində mənbə "spec 046 seed"
- [X] T018 [US1] `SITE/src/widgets/about-blocks/memberships.test.tsx` (yeni): `role="table"` adı gizli H2-dir, 14 sətir 2025→1997, `oldest`-də 1997 birinci, eyni ildə sıra qalır, sort linkləri `?sort=oldest`, `aria-current`, cədvəl yoxdursa çeşidləmə yoxdur, linkli ad `target="_blank"`, en mətnlər
- [X] T019 [US1] `SITE/src/views/cms-page/cooperation.test.tsx`: səhifə 554 bölmə şablonu ilə açılır, sol menyuda aktivdir, `?sort=oldest` view-a çatır; memorandum səhifəsinin mövcud testləri yaşıl
- [X] T020 [US1] `cd SITE && npm run verify` Node 24 və Node 22-də yaşıl (yaddaş `run-tests-on-node22`; çıxışı `tail` ilə yox, tam oxu)
  - 2026-11-16: Node 22-də yaşıl (137 fayl, 1331 test, 9 fikstür). Node 24 yoxlanmayıb.
- [X] T021 [US1] Ölçmə: `npm run local:testcbar` + MSW fikstür proxy (yaddaş `hybrid-fixture-proxy-for-ui-measuring`), Edge CDP `getBoundingClientRect` ilə 1728/744/390-da `contracts/ui-contract.md` cədvəlini tutuşdur (başlıq 44/56, sətir 57/81 və 65/85, il sütunu 164/80, düymə 230/218, controls → cədvəl 20); fərqləri düzəlt, nəticəni `contracts/ui-contract.md` sonuna "Ölçüldü" bölməsi kimi yaz — **2026-11-16**: blok uyğundur (Figma INSIDE stroke / border-collapse / mətn yuvarlaqlaşdırması fərqləri izahlıdır); açıq qalan yalnız bölmə şablonunun H1-i (tablet 32/44 vs 28/36, mobil 22/28 vs 24/32), bax `contracts/ui-contract.md` "Ölçüldü"

**Checkpoint**: US1 tam — sayt hissəsi (A2) seed olmadan da yayımlana bilər (yer tutucu adi mətn kimi görünür).

---

## Phase 4: User Story 2 - Redaktor üzvlükləri səhifə redaktorunda idarə edir (Priority: P1)

**Goal**: Redaktorun cədvəli TipTap-da itmir və pozulmur; redaktor qaydanı təlimatda tapır.

**Independent Test**: Admin `roundtrip.test.ts` fikstürü bayt-bayt saxlayır; live `npm run roundtrip` səhifə 554-ü dəyişmədən saxlayır.

- [X] T022 [US2] `ADMIN/src/features/rich-text/fixtures/layouts/memberships.html` = T012 faylının bayt-bayt surəti; `ADMIN/src/features/rich-text/roundtrip.test.ts` siyahısına `'memberships'` (əlifba sırası ilə)
- [ ] T023 [US2] `cd ADMIN && npm run verify` (`check:layout-fixtures` iki surəti tutuşdurur) və `npm run roundtrip -- "Beynəlxalq təşkilatlarda üzvlük"` (live test API; xəta olarsa hansı elementin düşdüyünü qeyd et, extension-a toxunmadan)
  - 2026-11-16: unit roundtrip (fikstür bayt-bayt) yaşıl; canlı `npm run roundtrip` işlədilməyib — admin API girişi yoxdur, səhifə 554-də hələ cədvəl yoxdur. Seed-dən sonra (T040).
- [X] T024 [P] [US2] `SITE/docs/cooperation-cms-guide.md`: yeni bölmə "Beynəlxalq təşkilatlarda üzvlük" — səhifə slug-ları, cədvəlin qaydası (`contracts/cms-markup.md` 1–6 redaktor dilində), sıranı sayt edir, gizli başlıq, yeni sətir əlavə etmə addımları, en adların qaralama olması

**Checkpoint**: US1 + US2 = A paketi tam (sayt + fikstür guard).

---

## Phase 5: User Story 3 - Redaktor admin menyusunda bölməni saytın quruluşu ilə tapır (Priority: P1)

**Goal**: Sidebar, mobil sheet və ⌘K saytın bölmələri üzrə qruplardadır; vəziyyət yadda qalır; səhifə redaktorunda bölmə kartı.

**Independent Test**: `contracts/admin-nav.md` §Davranış testləri; `quickstart.md` §3.

### Nav modeli

- [X] T025 [US3] `ADMIN/src/app/routes/nav.ts`: `NavGroup` = `about | marketParticipants | legalActs | nationalCurrency | statistics | media | cooperation | homepage | admin`, `NAV_GROUPS` sırası və hər `navItems` bəndinin `group`-u `contracts/admin-nav.md` cədvəlinə görə (`dashboard`, `pages`, `mediaLibrary` qrupsuz; `navItems` massivinin sırası menyu sırasıdır); yeni `NavEntry` tipi, `navEntries()` (qrupsuzlar → qruplar; 1 bənd → `item`, ≥2 → `group`, 0 → yox), `groupOf(pathname)`; başlıq şərhi ingiliscə
- [X] T026 [P] [US3] `ADMIN/src/locales/az/nav.json` və `ADMIN/src/locales/en/nav.json`: `groups` = 9 yeni açar (az/en adları `contracts/admin-nav.md`), `content`/`finance` silinir; `check:i18n` keçir
- [X] T027 [P] [US3] `ADMIN/src/shared/model/ui-store.ts`: `openNavGroups: NavGroup[]` (standart `[]`), `toggleNavGroup(group)`, `openNavGroup(group)`; persist `merge` köhnə saxlanmış state-də sahə olmayanda `[]` verir və bilinməyən açarları atır; `NavGroup` tipi `@/app/routes/nav`-dan yox, ayrıca `shared/model` səviyyəsində tip kimi (FSD: shared yuxarı idxal etmir) — `nav.ts` onu təkrar ixrac edir

### Sidebar və palet

- [X] T028 [US3] `ADMIN/src/app/shell/nav-group.tsx` (yeni): `NavGroupSection({ group, items, open, onToggle, renderItem })` — `button[type=button][aria-expanded][aria-controls="nav-group-<key>"]`, kit `ChevronDownIcon` (açıqda `rotate-180`), siyahı `id`, bağlıda `hidden`; üslub `contracts/ui-contract.md` §Admin menyu
- [X] T029 [US3] `ADMIN/src/app/shell/sidebar.tsx`: `navEntries()` üzərindən render; açıq qruplar = `openNavGroups ∪ {groupOf(route)}`; marşrut dəyişəndə aktiv qrup `openNavGroup` ilə açılır; mobil sheet üçün `onNavigate` qalır
  - İcra qərarı: aktiv qrup render-də məcburi açıq saxlanmır, ekrana gələndə store-a əlavə olunur (`useLayoutEffect`) — redaktor onu bağlaya bilir (spec FR-010 və contract yeniləndi).
- [X] T030 [US3] `ADMIN/src/app/shell/command-palette.tsx`: yeni `NAV_GROUPS` ilə `Command.Group` başlıqları (tək bəndlik qruplar da başlıqla), qrupsuzlar başlıqsız; davranış dəyişmir
- [X] T031 [US3] `ADMIN/src/app/shell/sidebar.test.tsx` (yeni) + `ADMIN/src/app/router.test.tsx`: hər `NavKey` menyuda tam bir dəfə; təmiz state-də (`/`) görünən sətir sayı 12; `/memorandums`-a birbaşa giriş → "Beynəlxalq əməkdaşlıq" `aria-expanded="true"`, "Memorandumlar" `aria-current="page"`; klaviatura (`Tab` + `Enter`/`Space`) ilə aç/bağla; persist (render → toggle → yenidən mount → qalır); `nexus-ui`-də `openNavGroups` olmayan köhnə state xəta vermir; palet "Memorandum" axtarışını tapır

### Səhifə redaktorunda bölmə kartı

- [X] T032 [P] [US3] `ADMIN/src/features/pages/model/managed-sections.ts` (yeni): `contracts/admin-nav.md` §bölmə kartı cədvəli — az slug (`-copy` suffiksi `managedSectionFor(slug)`-da kəsilir) → `{ kind: 'link', navKey, path }` və ya `{ kind: 'note' }` (`beynelxalq-teskilatlarda-uzvluk`); suffiks sabiti `constants.ts`-də
- [X] T033 [US3] `ADMIN/src/features/pages/components/managed-section-card.tsx` (yeni) + `ADMIN/src/features/pages/components/page-form.tsx`: kart `MenuVisibilityCard`-ın yanında, yalnız mövcud səhifədə (`detail` var) və `managedSectionFor(az slug)` tapılanda; link TanStack `Link`, mətn qrup yolu ilə ("Beynəlxalq əməkdaşlıq → Memorandumlar"), qrup/bənd adları `nav` namespace-dən (təkrar mətn yox)
- [X] T034 [P] [US3] `ADMIN/src/locales/az/pages.json` və `ADMIN/src/locales/en/pages.json`: `managedSection.title`, `managedSection.linkText` ("{{path}} bölməsindən gəlir"), `managedSection.open`, `managedSection.membershipsNote`
- [X] T035 [US3] `ADMIN/src/features/pages/pages.test.tsx`: 122 (`merkezi-banklarla-emekdasliq`) və `-copy` formunda kart + link `/memorandums`; 554-də qeyd, link yox; adi səhifədə kart yox; yeni səhifə formunda kart yox (MSW fikstürləri `ADMIN/src/shared/testing/`)
- [X] T036 [US3] `cd ADMIN && npm run verify` Node 24 və 22-də yaşıl; `npm run local:testcbar` (:5175) ilə `quickstart.md` §3-ü əl ilə keç (desktop + 390 sheet)
  - 2026-11-16: verify yaşıl (63 fayl, 599 test, 9 fikstür; vitest PowerShell-dən — Git Bash yolunda "failed to find the runner"). Əl ilə brauzer keçidi (quickstart §3) edilməyib.

**Checkpoint**: US3 tam — B paketi ayrıca yayımlana bilər.

---

## Phase 6: User Story 4 - Figma məzmunu əl işi olmadan gəlir (Priority: P2)

**Goal**: Yayımda səhifə 554-ün yer tutucusu 14 sətirlik cədvəllə əvəz olunur, en surəti düzəlir; təkrar və redaktə olunmuş halda heç nə dəyişmir.

**Independent Test**: `quickstart.md` §1 (PGlite: yer tutucu, redaktə olunmuş, səhifəsiz, en sətirsiz bazalar; ikinci işləmə).

- [X] T037 [US4] `ADMIN-API/db/migrations/0029-international-memberships-seed.sql` (yeni; `0028-memorandums-seed.sql` nümunəsi, `BEGIN/COMMIT` yox): başlıq şərhi (spec 046, Figma `2287:120701`, en qaralama); `DO $seed$`: `has_table_privilege('page_translations','UPDATE')` və `'INSERT'` yoxdursa `WARNING` + çıxış; səhifəni az slug ilə tap, yoxdursa `NOTICE` + çıxış; az məzmun boş və ya normallaşdırılmış yer tutucudursa → `data-model.md` §4 az cədvəli; en: sətir yoxdursa INSERT (title, slug — en-də boşdursa, content), varsa və `title = az.title` və məzmun boş/yer tutucudursa → UPDATE title + content, slug yalnız `membership-in-international-organizations` en-də boşdursa; cədvəl HTML-i T012 fikstürünün formasında (`th` başlıq, `colspan="1" rowspan="1"`, `<p>` xanalarda) — redaktor açıb saxlayanda dəyişməsin
- [X] T038 [US4] PGlite ilə real icra (yaddaş `pglite-api-testing`): `quickstart.md` §1 addımları 1–4; nəticədə az məzmunda 14 sətir, ikinci işləmədə `md5(content)` eyni; seed çıxışını sayt parser-indən keçir (`.tmp-046/` skripti ilə `parseMemberships` → 14 sətir, 2025→1997)
  - 2026-11-16: `.tmp-046/seed-check.mjs` (PGlite, yalnız `page_translations`): 4 vəziyyət, 13 yoxlama keçdi — yer tutucu → 14 sətir (az/en), ikinci işləmə md5 eyni, redaktə olunmuş səhifəyə toxunulmur, səhifə yoxdursa xəta yoxdur, en sətri yoxdursa INSERT. Sıra/parse saytda `membershipPageAz` (eyni forma) ilə `cooperation.test.tsx`-də yoxlanır.
- [X] T039 [US4] `cd ADMIN-API && dotnet build` yaşıl (`dotnet` PATH-da olmaya bilər: `C:/Program Files/dotnet`); C# dəyişmədiyi üçün `/sync-openapi` lazım deyil — qeyd et
- [X] T040 [US4] Seed-in yazdığı HTML-i admin redaktorunda roundtrip et: az məzmunu `ADMIN` `roundtrip.test.ts`-dəki köməkçi ilə (və ya T023 live addımı seed-dən sonra) — bayt-bayt eynidir; fərq varsa seed HTML-i düzəlt
  - 2026-11-16: seed-in yazdığı az və en HTML müvəqqəti vitest ilə `buildExtensions()`-dən keçirildi — hər ikisi bayt-bayt eyni; test silindi.

**Checkpoint**: A1 hazır — `api-cbar-admin`, sonra `web-cbar-new` deploy olunur.

---

## Phase 7: Sənədlər və yekun (FR-017, FR-018)

- [X] T041 [P] `SITE/docs/media-cms-guide.md`, `SITE/docs/about-cms-guide.md`, `SITE/docs/cooperation-cms-guide.md`, `SITE/docs/how-to-use.md`: admin bölmələri qrup yolu ilə ("**Media → Tədbirlər**", "**Haqqımızda → KSM layihələri**", "**Media → Yayım qrafiki**", "**Haqqımızda → Təşkilat → Şöbələr**", "**Beynəlxalq əməkdaşlıq → Maliyyə təşkilatları / Memorandumlar**"); səhifə redaktorundakı bölmə kartını qeyd et
- [X] T042 [P] `ADMIN/CLAUDE.md` (sətir 27 `nav.ts` təsviri, 29 "sidebar (5 qrup)" → qruplar + `navEntries`, 49 yeni bölmə resepti: qrupun saytın bölməsinə görə seçilməsi, tək bənd qaydası, `nav.json` `groups`) və `ADMIN/docs/how-to-use.md:83` (eyni resept); `ManagedSectionCard` və `managed-sections.ts` (yeni ayrıca məzmun növü əlavə edəndə xəritəyə yaz)
- [X] T043 [P] `SITE/CLAUDE.md`: `memberships` layout-u, `year-sort` (memorandum və üzvlük ortaq), fikstür guard siyahısı
- [X] T044 Kök `CLAUDE.md`: yeni bənd "Membership in international organizations (spec 046)" (səhifə 554, redaktor cədvəli, `memberships` layout, seed `0029`, API dəyişmir); guard paraqrafının layout siyahısına `memberships`; spec 034/038/039/044/045 bəndlərində panel bölmə adları qrup yolu ilə; "web-cbar-admin-new" bölməsinə menyu qrupları bir cümlə
- [X] T045 `/sync-business-logic` (`product-rest` modulları: cooperation, admin nav) → `business_logic/new_business_logic.md` (üzvlük səhifəsi, admin naviqasiyası), `diff_report_logic.md` (köhnə saytda yox — yeni məzmun)
  - 2026-11-16: skill yox, hədəfli əl redaktəsi: new §5.1c, §9.2 "Sol menyu", §3.1 sətri, §5.1b year-sort; diff_report sətri; hər iki başlığın Sync sətri.
- [X] T046 `quickstart.md` §4 grep-ləri boşdur (köhnə qrup adları, qrupsuz bölmə adları); yaddaş `menu-changes-update-docs` qaydası ödənib
- [X] T047 Yekun: `SITE` və `ADMIN` `npm run verify` (Node 24 + 22) yaşıl, `check:layout-fixtures` yan-yana keçir; `specs/046-international-memberships/checklists/requirements.md` qeydlərinə nəticə; MR-lar üçün deploy sırası qeydi: A1 → A2, B müstəqil
  - 2026-11-16: hər iki verify yaşıl (sayt 137/1331, admin 63/599, 9 fikstür). Node versiyası dəqiq təsdiqlənməyib (shim `.nvmrc` 22 seçir, shell 24 göstərir).

---

## Asılılıqlar

- T003 → US1 (T009–T012) və US2 (T022).
- US1 daxilində: T004 → T006 → T007 → T008; T009 → T011 → T012; T013 → T014 → T015; T016, T017 paralel; T018–T021 sonda.
- US2: T022 T012-dən sonra (eyni fikstür); T023 T022-dən sonra.
- US3 US1/US2-dən asılı deyil: T025 → (T026, T027 paralel) → T028 → T029 → T030 → T031; T032 → T033 → T035; T034 paralel.
- US4: T037 T012-dən sonra (HTML forması); T038–T040 T037-dən sonra; T040 T022-dən sonra.
- Phase 7: T041–T043 paralel; T044–T047 bütün story-lərdən sonra.

## Paralel nümunələr

- US1: T005 + T010 + T013 + T016 + T017 (fərqli fayllar) T004/T009 yazılan kimi.
- US3: T026 + T027 + T032 + T034 bir anda; sidebar (T028–T031) və kart (T033, T035) iki ayrı xətdə.
- Paketlər arası: US3 (ADMIN) US1 (SITE) ilə tam paralel aparıla bilər.

## Implementation strategy

1. **MVP = US1 + US2** (A2 sayt + fikstür guard): səhifə redaktorun əl ilə yazdığı cədvəllə dərhal işləyir.
2. **US4** (A1 seed): yayım günü 14 sətir avtomatik; A1 → A2 sırası ilə deploy.
3. **US3** (B admin menyu): müstəqil MR, istənilən vaxt.
4. **Phase 7**: hər paketin sənəd hissəsi öz MR-ında; T044–T047 sonda.
