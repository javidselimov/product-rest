# Tasks: Maliyyə savadlılığı bölməsinin Figma redizaynı

**Input**: `specs/047-financial-literacy/`: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

**Tests**:
- Frontend testləri davranış testləridir: rol, `userEvent`, MSW (yaddaş `functional-component-tests`).
- Layout fixture guard məcburidir (kök CLAUDE.md).
- API-də test layihəsi yoxdur. Seed `quickstart.md` §2-dəki kimi PGlite üzərində real icra ilə yoxlanılır.

**Təşkili**: Tapşırıqlar user story-lər üzrə qruplaşdırılıb. Hər komponent ayrıca merge request-dir. Sıra: `api-cbar-admin` (yalnız SQL) → `web-cbar-new`;
`web-cbar-admin-new` (fixture) `web-cbar-new` ilə eyni seriyada birləşir. `api-cbar` dəyişmir. Commit yalnız istəklə edilir.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: paralel işlənə bilər (fərqli fayllar, açıq asılılıq yoxdur)
- **[Story]**: aid olduğu user story. spec.md-dəki story-lər:
  - US1 — kök "Maliyyə savadlılığı" səhifəsi
  - US2 — platforma səhifələri
  - US3 — naviqasiya
  - US4 — redaktor
  - US5 — seed

## Yol qısaltmaları

- `ADMIN-API` = `product-rest/api-cbar-admin`
- `ADMIN` = `product-rest/web-cbar-admin-new`
- `SITE` = `product-rest/web-cbar-new`

## Ümumi qaydalar (hər tapşırıq üçün)

- Yeni şərhlər ingiliscə yazılır. Dəyişilən faylda azərbaycanca şərhlər də ingiliscəyə çevrilir (yaddaş `code-comments-english`).
- Rəqəmlər sabitlərdə saxlanılır (spec 032): slice-ın `constants.ts`-i və ya `src/shared/constants/<topic>.ts`. `no-magic-numbers` `verify`-da yoxlanılır.
- `SITE`-da `prettier --write` işlədilmir. Windows-da fayllar Edit və ya Node ilə redaktə olunur (yaddaş `windows-shell-crlf`). Köməkçi skriptlər `.tmp-047/`-dadır, orada artıq `summarize.cjs` və Figma dump-ları var.
- `SITE`-da `dangerouslySetInnerHTML` yalnız `widgets/cms-content`-də işlədilir, yeni `'use client'` əlavə olunmur. Şəkillər `shared/ui/site-image` ilə göstərilir (spec 036).
- Seed mətni, iki fixture və MSW fikstürü **eyni HTML-dir**. HTML bir dəfə yazılır (T020, T030), qalanları ondan kopyalanır.

---

## Phase 1: Setup

- [X] T001 Başlanğıc vəziyyətini yoxla:
  - `git status` təmizdir.
  - `ADMIN-API/db/migrations/`-da `0030*` yoxdur və `product-rest/api-cbar/db/migrations`-da yalnız README var, yəni ad unikaldır.
  - `SITE` və `ADMIN`-də `npm run verify` yaşıldır. Bundan sonrakı qırmızılar bu spec-dəndir.
- [X] T002 Test API-də vəziyyəti təkrar yoxla:
  - `GET https://api-cbar-test.cbar.az/api/v1/pages/tree?locale=az|en` ağacı `research.md` R1 ilə eynidir.
  - Səhifə 106/110/111/112 mətninin md5-i R9 cədvəlinə uyğundur (`.tmp-047/`-da kiçik Node skripti).
  - Fərq varsa `research.md` R1/R9-u yenilə.
- [X] T003 [P] İkonları Figma-dan götür:
  - `figma_components` ilə `FL / Principle card` və `FL / Target group` komponentlərinin əsas tərifini tap.
  - Hər 4 prinsip və 7 hədəf qrupu ikonunu `figma_svg` ilə `.tmp-047/icons/`-a yaz.
  - Instance id-ləri (`I…;…`) bridge-də tapılmır (research R7). SVG alınmasa, səbəbi R7-yə yaz və istifadəçidən Figma-dan export istə.

---

## Phase 2: Foundational

**Bütün story-lərin ortaq əsası: bölmə açarı, layout tipləri, media paraqrafı, faylların süzülməsi.**

- [X] T004 `SITE/src/entities/page-node/lib/tree.ts` faylını yenilə:
  - `SectionKey`-ə `'literacy'` əlavə et.
  - `SECTION_TITLES.literacy = new Set(['Maliyyə savadlılığı', 'Financial Literacy', 'Financial literacy'])`.
  - Başlıq şərhinə spec 047-ni əlavə et.
  - `SITE/src/entities/page-node/lib/tree.test.ts`-ə `sectionKeyOf` üçün literacy halı yaz: kökü və "(Kopya)" alt ağacını (`isSectionCopy`) yoxla.
- [X] T005 `SITE/src/features/about-content/model/types.ts` faylını yenilə (`data-model.md` §2–3):
  - `AboutLayoutKind`-ə `'financial-literacy' | 'literacy-platform'` əlavə et.
  - `LiteracyImage`, `LiteracyPart`, `LiteracySection`, `LiteracyCta`, `FinancialLiteracyBlock`, `LiteracyPlatformBlock` tiplərini yaz.
  - Yeni blokları `AboutBlock` birləşməsinə qoş. Başlıq şərhinə spec 047-ni əlavə et.
- [X] T006 `SITE/src/features/about-content/model/layouts.ts` faylını yenilə:
  - `LITERACY_LAYOUTS` + `literacyLayoutFor(slug)` əlavə et: research R3 cədvəli, hər slug-ın `-copy`-si ilə birlikdə.
  - `SITE/src/views/cms-page/loader.ts` `sectionLayout`-a `if (section === 'literacy') return literacyLayoutFor(slug)` sətrini əlavə et.
  - Loader-in başlıq şərhinə spec 047-ni əlavə et.
  - `SITE/src/features/about-content/model/layouts.test.ts`-də 12 slug + `seminarlar-vebinarlar` → `'plain'` halını yoxla.
- [X] T007 `SITE/src/features/about-content/model/markup.ts` faylına iki köməkçi funksiya əlavə et (`contracts/cms-markup.md` ümumi təriflər):
  - `mediaParagraphIds(node, files): number[] | null`. Yalnız `data-media-link` + `/media/{id}` linklərini qəbul edir. Fayllar arasında şəkil olmayan fayl kimi olan id-də `null` qaytarır, fayllarda olmayan id-ni şəkil sayır.
  - `mailtoIn(html): string | null`. `mailto:`-dan sonrakı ünvanı kiçik hərflə, `?`-dən əvvəlki hissə ilə qaytarır.
  - Regex-ləri `constants.ts`-də saxla.
  - `SITE/src/features/about-content/model/markup.test.ts` (yeni və ya mövcud) testləri: qarışıq paraqraf, PDF id, naməlum id, `mailto:MMPI@cbar.az?subject=x`.
- [X] T008 `SITE/src/views/cms-page/index.tsx` faylını yenilə:
  - `ShellPage` `Attachments`-ə blokların `usedMediaIds`-də olmayan faylları ötürür (research R5). Şərh spec 038/040 qaydasının ümumiləşdirilməsini izah edir.
  - Mövcud CSR və loqo halı dəyişmir.
- [X] T009 [P] `SITE/src/locales/az/about.json` və `SITE/src/locales/en/about.json` fayllarına `literacy.*` açarlarını əlavə et:
  - `cta.button` (`"{{email}}-a yazın"` / `"Write to {{email}}"`)
  - `imageAlt` (`"{{title}} — şəkil {{n}}"` / `"{{title}} — image {{n}}"`)
  - `photos.label`, `principles.label`, `targetGroups.label`, `newWindow`
- [X] T010 [P] `SITE/src/widgets/about-blocks/literacy-icons.tsx` (yeni) faylını yarat:
  - `PRINCIPLE_ICONS` (4) və `TARGET_GROUP_ICONS` (7) inline SVG komponentləridir: `currentColor`, `aria-hidden`.
  - `GENERIC_ICON` sıradan kənar elementlər üçündür.
  - `iconAt(list, i)` köməkçisini yaz.
  - Mənbə T003-dür. Ölçülər (24 / 20) `SITE/src/widgets/about-blocks/constants.ts`-də saxlanılır.
- [X] T011 [P] `SITE/src/shared/testing/fixtures/literacy-section.ts` (yeni) faylını yarat:
  - az və en ağacı (research R1, `showInSideNav` dəyərləri ilə) yaz.
  - Dörd səhifənin köhnə mətnini və assets-ini test API-dən olduğu kimi götür.
  - Yeni mətn sabitləri boş saxlanır, T020/T030-da doldurulur.

**Checkpoint**: `typecheck` qırmızıdır, çünki `layout-fixtures.test.ts` `EXPECTED_BLOCKS`-ında iki yeni layout yoxdur. Bu T023 və T033-də bağlanır.

---

## Phase 3: User Story 1 - Kök "Maliyyə savadlılığı" səhifəsi Figma görünüşündə (Priority: P1) 🎯 MVP

**Goal**: `/az/maliyye-savadliligi` və `/en/financial-literacy` bölmə şablonunda açılır: bölmələr, sitat, 4 kart, 7 etiket, qalereya və CTA, 3 endə.

**Independent Test**: MSW-də seed mətni ilə kök səhifəni render et, blokları rol ilə yoxla. Fikstür proxy ilə 1728/744/390-da `ui-contract.md` §1 ilə ölç.
Köhnə mətnlə səhifə adi mətn kimi açılır.

- [X] T012 [US1] `SITE/src/features/about-content/model/financial-literacy.ts` (yeni) faylında `parseFinancialLiteracy(nodes, files): FinancialLiteracyBlock` yaz (`contracts/cms-markup.md` §1):
  - Giriş birinci `h2`-dən əvvəlki məzmundur, hər `h2` yeni bölmədir. `h3` və yalnız `<strong>`-dan ibarət `<p>` `subheading`-dir.
  - Poçt linki olmayan `blockquote` sitatdır: bir neçə paraqraf varsa sonuncusu mənbədir (`trim`).
  - Hər `li`-si başlıq sətri ilə açılan `ul` prinsip kartlarıdır. Başlıqsız `ul` `h3`-dən dərhal sonra gəlirsə etiketlərdir. Kartlar "bütöv və ya heç" qaydası ilə tanınır.
  - Media paraqrafı (T007) qalereyadır, `usedMediaIds` toplanır.
  - Poçt linkli **birinci** `blockquote` CTA-dır: 1-ci paraqraf yuxarı sətir, 2-ci başlıq, qalanları ünvan. CTA bölmələrdən çıxarılır.
  - Qalan hər şey `html`-dir. Ardıcıl `html` birləşdirilir.
  - Heç bir mətn atılmır.
- [X] T013 [P] [US1] `SITE/src/features/about-content/model/financial-literacy.test.ts` (yeni) faylında bu halları yoxla:
  - seed mətni: 4 bölmə, 4 kart, 7 etiket, 7 şəkil, CTA, `mmpi@cbar.az`
  - köhnə mətn: bütün mətn tək giriş `html`-i, CTA yox (köhnə mətndə `blockquote` yoxdur)
  - təsvirsiz kart; qarışıq `ul` (adi siyahı qalır); `h3`-dən sonra gəlməyən başlıqsız `ul` (adi siyahı)
  - iki CTA (ikincisi sitat); mənbəsiz sitat
  - şəkil olmayan media id (paraqraf `html` qalır); en mətni
- [X] T014 [US1] `SITE/src/features/about-content/model/parse.ts` faylına `if (layout === 'financial-literacy') return [parseFinancialLiteracy(nodes, context.files ?? [])]` əlavə et. Şərh siyahısına spec 047-ni yaz.
- [X] T015 [US1] `SITE/src/widgets/about-blocks/financial-literacy.tsx` (yeni) server komponentini yaz (`contracts/ui-contract.md` §1):
  - Bölmələr `section` + `h2` ilə qurulur. Alt başlıq `h3`-dür.
  - Sitat `figure`/`blockquote` + `figcaption` ilə qurulur.
  - Kartlar `ul` grid-dir (4/2/1, `stretch`), ikon `iconAt`-dan gəlir. Etiketlər `ul` grid-dir (4/2/1).
  - Qalereya mövcud `PhotoGallery`-dir: `images` `{id, url: src, alt}`, etiketlər `media` namespace-dən; `alt` `literacy.imageAlt` ilə qurulur.
  - CTA `section` + `a href=mailto` düyməsidir: tablet/mobildə şaquli, mobildə tam en.
  - `html` hissələri `CmsContent variant="about"` ilə render olunur.
  - Rənglər mövcud `site-*` tokenləridir. Uyğun token yoxdursa, `globals.css` route B blokundan kənarda yeni token əlavə et və bunu tapşırıqda qeyd et.
- [X] T016 [US1] `SITE/src/widgets/about-blocks/about-blocks.tsx`-də `financial-literacy` blokunu `FinancialLiteracy`-yə yönləndir. `SITE/src/widgets/about-blocks/index.ts` ixraclarını yenilə.
- [X] T017 [P] [US1] `SITE/src/widgets/about-blocks/financial-literacy.test.tsx` (yeni) davranış testlərini yaz:
  - `h2` bölmə başlıqları rol ilə tapılır; sitat və mənbə görünür.
  - 4 kart `listitem` kimi tapılır; 7 etiket görünür.
  - Qalereyada miniatürə klikləyəndə şəkil dəyişir.
  - CTA linkinin `href`-i `mailto:mmpi@cbar.az`-dir, adı `"mmpi@cbar.az-a yazın"`-dır.
  - en dilində düymə `"Write to mmpi@cbar.az"`-dir.
- [X] T018 [US1] `SITE/src/views/cms-page/literacy.test.tsx` (yeni) faylında view səviyyəsində yoxla (MSW, `literacy-section.ts`):
  - kök səhifə `SectionShell`-də açılır: breadcrumb "Ana səhifə › Maliyyə savadlılığı", sol menyu
  - fayl siyahısında qalereyanın 7 şəkli **yoxdur**
  - köhnə mətnlə adi mətn kimi açılır
  - kök mətni boş olanda alt səhifə kartları göstərilir
- [X] T019 [US1] Fikstür proxy ilə ölç (`quickstart.md` §3, yaddaş `hybrid-fixture-proxy-for-ui-measuring`):
  - `/az/maliyye-savadliligi` səhifəsini 1728, 744 və 390 endə Edge CDP `getBoundingClientRect` ilə `ui-contract.md` §1-ə qarşı ölç.
  - Fərqləri düzəlt. Nəticəni `.tmp-047/measure-us1.md`-yə yaz.
- [X] T020 [US1] Kök səhifənin seed HTML-ini (az + en) yaz:
  - Mənbə `data-model.md` §4.1-dir, forma redaktorun saxladığı formadır (`contracts/cms-markup.md` §1).
  - Faylları `.tmp-047/financial-literacy.az.html` və `.en.html` adı ilə saxla.
  - az versiyası `SITE/src/features/about-content/fixtures/financial-literacy.html` faylına kopyalanır.
  - Hər iki dil `literacy-section.ts`-in yeni mətn sabitlərinə yazılır.

**Checkpoint**: US1 MSW-də işləyir. Ölçmə fikstür proxy ilə aparılıb.

---

## Phase 4: User Story 2 - Platforma səhifələri Figma görünüşündə (Priority: P1)

**Goal**: Portal, Virtual Təhsil və infobank səhifələri eyni şablonda göstərilir: giriş, qeyd, foto sırası, xətli bölmələr, keçid düyməsi.

**Independent Test**: MSW-də üç səhifəni seed mətni ilə render et. Qeydi, foto linklərini, bölmə başlıqlarını və yeni tabda açılan düyməni yoxla.
`ui-contract.md` §2 ilə ölç.

- [X] T021 [US2] `SITE/src/features/about-content/model/literacy-platform.ts` (yeni) faylında `parseLiteracyPlatform(nodes, files): LiteracyPlatformBlock` yaz (`contracts/cms-markup.md` §2):
  - Giriş birinci `h2`-yə qədərdir.
  - Birinci `blockquote` qeyddir, birinci media paraqrafı foto sırasıdır, hər ikisi girişdən çıxarılır.
  - Hər `h2` bölmədir.
  - Mətnin **sonuncu** bloku yalnız bir xarici `http(s)` linkli `<p>`-dirsə, keçid düyməsidir.
  - İkinci `blockquote` və ikinci media paraqrafı yerində `html` kimi qalır.
  - `usedMediaIds` toplanır.
- [X] T022 [P] [US2] `SITE/src/features/about-content/model/literacy-platform.test.ts` (yeni) faylında bu halları yoxla:
  - üç seed mətni (portal: 6 bölmə + 3 şəkil; Virtual: 5 bölmə; infobank: 2 bölmə)
  - köhnə mətn: hər şey giriş, düymə yox
  - `javascript:` linkli son paraqraf (düymə deyil); sonda iki linkli paraqraf (düymə deyil)
  - iki `blockquote`; şəkilsiz səhifə
- [X] T023 [US2] `SITE/src/features/about-content/model/parse.ts`-ə `literacy-platform` halını əlavə et. Fixture və guard-ı qur:
  - `SITE/src/features/about-content/fixtures/literacy-platform.html`: Virtual səhifəsinin seed az mətnidir, T030-dan gəlir.
  - `SITE/src/features/about-content/fixtures/financial-literacy.html`: T020-dən gəlir.
  - `SITE/src/features/about-content/model/layout-fixtures.test.ts` faylında:
    - `EXPECTED_BLOCKS['financial-literacy'] = ['financial-literacy:4']`
    - `EXPECTED_BLOCKS['literacy-platform'] = ['literacy-platform:5']`
    - `blockShape`-ə iki `case` əlavə et:
      - `financial-literacy`: `sections.filter((s) => s.heading).length` (girişsiz `h2` bölmələri)
      - `literacy-platform`: `sections.length`
- [X] T024 [US2] `SITE/src/widgets/about-blocks/literacy-platform.tsx` (yeni) server komponentini yaz (`ui-contract.md` §2):
  - Qeyd qutusu: sol xətt 3px.
  - Foto sırası `ul`-dur:
    - desktop və tablet: 3 sütun, sıra növbəti sətrə keçir
    - mobil: üfüqi sürüşmə, `scroll-snap`
    - hər element `a href=/media/{id} target=_blank rel="noopener noreferrer"` + `SiteImage fill`; boş qutunun rəngi valideyndədir
  - Bölmələr `section` + `h2`-dir: üst xətt `#e5e5e5`, `pt 24`, `gap 12`.
  - Düymə `a target=_blank`-dir, `sr-only` "yeni pəncərədə açılır" mətni ilə; mobildə tam en.
- [X] T025 [US2] `SITE/src/widgets/about-blocks/about-blocks.tsx`-də `literacy-platform` blokunu yeni komponentə yönləndir. `index.ts` ixraclarını yenilə.
- [X] T026 [P] [US2] `SITE/src/widgets/about-blocks/literacy-platform.test.tsx` (yeni) faylında bu davranışları yoxla:
  - qeyd mətni görünür
  - 3 foto linki yeni tabda açılır, link adı `alt`-dır
  - `h2` başlıqları rol ilə tapılır
  - düymənin `href`-i `https://edu.e-cbar.az/`-dir, adında "yeni pəncərədə" sözü var
- [X] T027 [US2] `SITE/src/views/cms-page/literacy.test.tsx` faylına bu halları əlavə et:
  - üç səhifə layout-u alır
  - fayl siyahısında foto sırasının şəkilləri yoxdur
  - `-copy` qaralaması (`virtual-tehsil-platformasi-copy`) eyni görünüşü alır
  - `seminarlar-vebinarlar` adi məzmundur, akkordeon işləyir
- [X] T028 [US2] `/az/maliyye-savadliligi-portali`, `/az/virtual-tehsil-platformasi` və `/az/maliyye-mehsul-ve-xidmetlerinin-melumat-axtaris-sistemi` səhifələrini fikstür proxy ilə ölç:
  - Endlər 1728, 744, 390-dır, qarşılaşdırma `ui-contract.md` §2 iləd. Nəticəni `.tmp-047/measure-us2.md`-yə yaz.
  - Portalın foto sırası (Figma-da yoxdur) və Facts sırasının edilməməsi qəsdən sapmalardır (research R6).
- [X] T029 [P] [US2] Portal və infobank səhifələrinin seed HTML-ini (az + en) yaz:
  - Mənbə `data-model.md` §4.2-dir.
  - Faylları `.tmp-047/{portal,infobank}.{az,en}.html` adı ilə saxla.
  - Hər ikisini `literacy-section.ts`-ə yaz.
- [X] T030 [US2] Virtual Təhsil səhifəsinin seed HTML-ini (az + en) yaz:
  - Mənbə `data-model.md` §4.2-dir. YouTube linkindəki `%C2%A0` təmizlənir.
  - Faylları `.tmp-047/virtual.{az,en}.html` adı ilə saxla.
  - az versiyası `SITE/src/features/about-content/fixtures/literacy-platform.html`-ə kopyalanır.
  - Hər iki dil `literacy-section.ts`-ə yazılır.

**Checkpoint**: US1 + US2 hazırdır. `SITE` `npm run verify` yaşıldır, amma `check:layout-fixtures` T036-ya qədər fərq göstərir.

---

## Phase 5: User Story 3 - Bölmə naviqasiyası (Priority: P1)

**Goal**: Sol menyuda yalnız üç platforma bəndi qalır. "Ümumi məlumat"ın ünvanı köka yönlənir. Gizlədilən səhifələr birbaşa ünvanla açılır.

**Independent Test**: `showInSideNav: false` olan ağacla bölmənin hər səhifəsini aç, sol menyunu yoxla. `/az/umumi-melumat` 308 verir.

- [X] T031 [US3] `SITE/src/proxy.ts` faylına yönləndirmə əlavə et (research R8):
  - Qayda: `LITERACY_GENERAL_SLUG` `^/(az|en)/(?:.+/)?(umumi-melumat|general-information)/?$`.
  - Hədəf: az `/{locale}/maliyye-savadliligi`, en `/{locale}/financial-literacy`, 308 ilə.
  - Slug-ları və hədəfi `SITE/src/features/about-content/model/constants.ts`-də və ya `entities/page-node`-da sabit kimi saxla. `RELEASE_SCHEDULE_SLUGS` nümunəsini izlə.
- [X] T032 [P] [US3] `SITE/src/proxy.test.ts`-ə bu halları əlavə et:
  - `/az/umumi-melumat` → `/az/maliyye-savadliligi`
  - `/en/general-information/` → `/en/financial-literacy`
  - `/az/maliyye-savadliligi/umumi-melumat` → `/az/maliyye-savadliligi`
  - `/az/umumi-melumat-copy` yönlənmir
- [X] T033 [US3] `SITE/src/views/cms-page/literacy.test.tsx` faylına sol menyu hallarını əlavə et (seed-dən sonrakı ağac: 107/108/109/452 `showInSideNav: false`):
  - portal açıqdırsa menyuda 3 bənd var, sıra Figma-dakıdır
  - `seminarlar-vebinarlar` açıqdırsa 3 bəndə əlavə olaraq o da görünür (spec 041)
  - en dilində 3 bənd var
  - üst menyuda bölmə bütün alt səhifələri ilə qalır (`shell/nav`)

**Checkpoint**: US3 kod tərəfi hazırdır. Bayraqların özü US5-də, seed ilə gəlir.

---

## Phase 6: User Story 4 - Redaktor bölməni adi redaktorla idarə edir (Priority: P2)

**Goal**: İki fixture redaktordan bayt-bayt dəyişmədən keçir. Redaktor təlimatı var.

**Independent Test**: `ADMIN` `roundtrip.test.ts` iki yeni fixture ilə yaşıldır, `check:layout-fixtures` iki nüsxəni eyni tapır.

- [X] T034 [US4] Fixture-ları admin panelə kopyala və test siyahısını yenilə:
  - `SITE/src/features/about-content/fixtures/{financial-literacy,literacy-platform}.html` → `ADMIN/src/features/rich-text/fixtures/layouts/`, eyni baytlarla.
  - `ADMIN/src/features/rich-text/roundtrip.test.ts` siyahısına iki layout-u əlavə et.
- [X] T035 [US4] `ADMIN`-də `npx vitest run src/features/rich-text/roundtrip.test.ts` işlət (PowerShell-dən, yaddaş `windows-shell-crlf`):
  - Fixture dəyişirsə, redaktorun saxladığı formaya uyğunlaşdır: `li > p`, `blockquote` içində link atributlarının sırası.
  - Dəyişikliyi **hər üç yerə** yaz: `SITE` fixture-u, `.tmp-047` seed HTML-i və `literacy-section.ts`.
  - Kodu dəyişmə.
- [X] T036 [US4] `SITE` və `ADMIN`-də `npm run check:layout-fixtures` iki nüsxəni eyni tapmalıdır. `ADMIN/CLAUDE.md`-də fixture siyahısına `financial-literacy` və `literacy-platform`-u əlavə et (spec 047).
- [X] T037 [P] [US4] `SITE/docs/financial-literacy-cms-guide.md` (yeni) redaktor təlimatını yaz:
  - Panel yolu "**Səhifələr**"-dir, hansı səhifənin hansı layout-u aldığını göstər.
  - Hər blokun işarələməsini nümunə ilə izah et: `h2`, `h3`, sitat və mənbə, kart siyahısı, etiket siyahısı, "Media" düyməsi ilə qalereya, poçt linkli CTA, qeyd qutusu, keçid düyməsi.
  - İkonların sıra ilə verildiyini qeyd et.
  - "Sol menyuda göstər" bayrağını və "(Kopya)" qaralamasının necə istifadə olunduğunu izah et.
  - `SITE/docs/how-to-use.md`-ə keçid əlavə et.

**Checkpoint**: US4 hazırdır. Hər iki frontend-in `verify` yoxlaması yaşıldır.

---

## Phase 7: User Story 5 - Seed (Priority: P2)

**Goal**: Yayımda köhnə mətn Figma quruluşunda yenidən yazılır, dörd səhifə sol menyudan çıxır. Redaktə olunmuş mətnə toxunulmur.

**Independent Test**: `quickstart.md` §2-dəki beş ssenari PGlite-də keçir.

- [X] T038 [US5] `ADMIN-API/db/migrations/0030-financial-literacy-seed.sql` (yeni) seed faylını yaz (research R9, 0029 nümunəsi):
  - Başlıq şərhi ingiliscədir.
  - Bir `DO $seed$` bloku: `has_table_privilege` (`page_translations` UPDATE, `page_details` INSERT) çatmayanda `RAISE WARNING` + `RETURN`.
  - Səhifələr az slug ilə tapılır: `maliyye-savadliligi`, `maliyye-savadliligi-portali`, `virtual-tehsil-platformasi`, `maliyye-mehsul-ve-xidmetlerinin-melumat-axtaris-sistemi`.
  - `UPDATE page_translations SET content = … WHERE page_id = … AND locale = … AND md5(content) = '<R9 hash>'`. HTML `.tmp-047/*.html`-dən dollar-quote ilə (`$html$…$html$`) gəlir.
  - `INSERT INTO page_details (page_id, show_in_side_nav) SELECT t.page_id, false FROM page_translations t WHERE t.locale='az' AND t.slug IN ('umumi-melumat','seminarlar-vebinarlar','musabiqeler','maliyye-savadliligi-copy') ON CONFLICT (page_id) DO NOTHING`.
  - `BEGIN`/`COMMIT` yoxdur, `ALTER` yoxdur.
- [X] T039 [US5] Seed-i PGlite-də yoxla (yaddaş `pglite-api-testing`, skript `.tmp-047/seed-check.mjs`):
  - Dump-dan `pages`, `page_translations` (106–112, 452–458), `page_details` cədvəllərini yüklə.
  - `quickstart.md` §2-nin beş ssenarisini işlət.
  - Yazılan mətnlərin `.tmp-047/*.html` ilə bayt-bayt eyni olduğunu yoxla.
  - Nəticəni tapşırığa qeyd et.
- [X] T040 [US5] `ADMIN-API`-də `dotnet build` işlət (yaddaş `dotnet-sdk-local-build`, `C:/Program Files/dotnet`). Docker işlətmə.

**Checkpoint**: Bütün story-lər hazırdır.

---

## Phase 8: Polish & Cross-Cutting

- [X] T041 [P] `SITE/CLAUDE.md` faylını yenilə:
  - §3 "Bölmə şablonu" bəndinə `literacy` açarını əlavə et.
  - Spec 047 qeydini yaz: iki layout, qalereyanın faylları `Attachments`-dən çıxarması, `umumi-melumat` yönləndirməsi, ikonların sıra ilə verilməsi.
- [X] T042 [P] Kök `CLAUDE.md`-ə spec 047 bəndini əlavə et ("web-cbar-new" bölməsi, spec 046 bəndindən sonra):
  - layout siyahısına `financial-literacy` və `literacy-platform`-u yaz
  - seed `0030`
  - redaktor təlimatı
- [X] T043 `/sync-business-logic` işlət (`new_business_logic.md`, `diff_report_logic.md`: Maliyyə savadlılığı bölməsi). Skill commit etmir.
- [X] T044 Testləri Node 22 ilə də işlət (yaddaş `run-tests-on-node22`): `SITE` `npx vitest run` + `ADMIN` `npx vitest run`.
- [X] T045 `quickstart.md` §3-ün yeddi bəndini brauzerdə yoxla. Bura daxildir: JS söndürülmüş halda yoxlama, çap önizləməsi, en dili.
- [X] T046 MR təsviri üçün qeydləri `.tmp-047/mr-notes.md`-yə yaz:
  - deploy sırası (A → B, C B ilə)
  - research R6-dakı dizayner sualları (Facts sırası, portalın şəkilləri)
  - en mətninin yeni hissələrinin qaralama olması

---

## Dependencies & Execution Order

- **Setup (T001–T003)** asılılıqsızdır. T003 yalnız T010-u bloklayır.
- **Foundational (T004–T011)** bütün story-ləri bloklayır. T004 → T006 (loader `literacy` açarını gözləyir). T005 → T006, T007.
- **US1 (T012–T020)** Foundational-dan sonra gəlir. T020 (seed HTML) T012-dən **sonra** gəlir, çünki parser qaydaları HTML-in formasını təsdiqləyir.
- **US2 (T021–T030)** Foundational-dan sonra gəlir, US1 ilə paralel ola bilər (fərqli fayllar). T023 həm T020-ni, həm T030-u gözləyir (guard iki fixture tələb edir).
- **US3 (T031–T033)** Foundational-dan sonra gəlir. T033 T011-in ağacını istifadə edir.
- **US4 (T034–T037)** T023-dən sonra gəlir.
- **US5 (T038–T040)** T035-dən sonra gəlir: seed HTML round-trip ilə təsdiqlənmiş forma olmalıdır.
- **Polish** hamısından sonra gəlir.

```text
T001─T002─T003
        │
T004─T005─T006─T007─T008   T009 T010 T011 (P)
        │
   ┌────┴─────┬──────────┐
  US1        US2        US3
 T012…T020  T021…T030  T031…T033
   └────┬─────┘
       T023 (guard) → US4 T034…T037 → US5 T038…T040 → Polish
```

## Parallel Example

```text
# Foundational-dan sonra:
US1: T012 parser  ∥  US2: T021 parser  ∥  US3: T031 proxy
# Hər story daxilində:
T013 (parser testləri) ∥ T015 (widget)     — T012 bitəndən sonra
T022 ∥ T024                                — T021 bitəndən sonra
T029 (portal/infobank HTML) ∥ T030 (Virtual HTML)
T041 ∥ T042                                — polish
```

## Implementation Strategy

1. **MVP = US1 + US2 sayt tərəfi (T001–T030)**. Seed olmadan da təhlükəsizdir: köhnə mətn adi məzmun kimi bölmə şablonunda görünür. Bölmə
   şablonuna keçid özü də Figma-ya yaxınlaşmadır.
2. **US3** yönləndirməni gətirir. Menyunun özü seed-ə qədər 7 bəndli qalır.
3. **US4** guard-ı bağlayır, bundan sonra `SITE` + `ADMIN` MR-ları birləşə bilər.
4. **US5** seed-dir, ayrıca `api-cbar-admin` MR-ıdır və `web-cbar-new`-dan **əvvəl** deploy olunur. Seed-dən sonra səhifələr Figma görünüşünə keçir və
   menyu 3 bəndə enir.

## Notes

- `.tmp-047/` commit olunmur (yaddaş `fork-agents-share-tmp`).
- Figma dump-ları `tools/bridge/figma-bridge/out/`-dadır, `summarize.cjs` ilə oxunur: `node .tmp-047/summarize.cjs <dump> [depth] [subtreeId]`.
- Bir fixture dəyişəndə **dörd yer** birlikdə dəyişir: `SITE` fixture, `ADMIN` fixture, `.tmp-047/*.html` (seed mənbəyi), `literacy-section.ts`.

## İcra qeydləri (2026-11-16)

- T003/T010: `figma_svg` instance-ın özündən işlədi (`2249:118793`…); `figma_find` (`page: "*"`) plugini çökdürdü. Uzun siyahıda ikonlar təkrarlanır (research R7).
- T012/T015: alt başlıq düz mətndir (`text`), qeyd sahəsi `noteHtml`-dir (data-model yeniləndi). Köhnə mətndə media paraqrafı da qalereya olur.
- T019/T028: fikstür proxy + Edge CDP, 90 PASS (`.tmp-047/measure.log`). Ölçmə zamanı tapılıb düzəldilib: `.cms-content` qutu daxilində ölçü/rəng/margin-i üstələyirdi, yeni `CmsContent variant="inherit"` (sitat, qeyd, banner ünvanı); düymədə `sr-only` mətndən əvvəl boşluq itirdi. Qəbul edilən fərqlər: tablet qalereyası 406/405, mobil 342×209 (mövcud `PhotoGallery` aspect-i, Figma 228), düymələr ±1px.
- T035: 8 seed HTML-in hamısı redaktordan bayt-bayt keçdi, fixture dəyişmədi.
- T037: `docs/how-to-use.md`-də redaktor təlimatlarının siyahısı yoxdur, keçid əlavə edilmədi.
- T039: PGlite 19/19 (`.tmp-047/seed-check.mjs`). T040: `dotnet build` 0 xəbərdarlıq. T044: Node 22-də sayt və admin yaşıl.
- verify: sayt 1389 test (başlanğıc 1331), admin 601 (599); `check:layout-fixtures` 11 fixture.
