---
description: "Task list — 024 Haqqımızda redizaynı (web-cbar-new)"
---

# Tasks: "Haqqımızda" bölməsinin Figma dizaynına keçidi

**Input**: `specs/024-about-us-redesign/` — [spec.md](./spec.md), [plan.md](./plan.md), [research.md](./research.md),
[data-model.md](./data-model.md), [contracts/cms-markup.md](./contracts/cms-markup.md),
[contracts/ui-contract.md](./contracts/ui-contract.md), [quickstart.md](./quickstart.md)

**Branch**: `feature/024-about-us-redesign`, `feature/022-figma-redesign`-dən ayrılır. Bütün yollar
`product-rest/web-cbar-new/`-ə nisbətəndir (əks qeyd olunmayıbsa).

**Sıra**: plan.md-dəki 7 mərhələ. Hər mərhələ **bir commit**-dir və `npm run verify` ilə bitir.
US1 (şablon) bütün digər story-lərin əsasıdır. US2–US5 ondan sonra bir-birindən asılı deyil.

**Testlər**: quickstart §1 və SC-008 (test əhatəsi azalmır) yeni testlər tələb edir. Parser və
tokenizer testləri kontraktın nümunələri və real test-mühit HTML-i ilə yazılır, mock yalnız MSW-dir.

**Hər UI task-dan əvvəl**: `ui-kit-usage` və `frontend-standards` skill-ləri. Figma dəyərləri
`figma_node` ilə həmin node-dan oxunur (node id-lər [ui-contract §2–§3](./contracts/ui-contract.md)).
Böyük frame-in PNG-si vaxt aşımına düşür, blok-blok çıxar.

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Setup

- [x] T001 Repo kökündə: `git switch -c feature/024-about-us-redesign` (`feature/022-figma-redesign`-dən). Root `FIGMA-REDIZAYN-PLANI.md`-yə "024 — Haqqımızda" bölməsi əlavə et: "Harada qaldım", ⛔ Bloklanan, mərhələ checkbox-ları (plan.md "Mərhələlər")
- [x] T002 [P] Test fikstürlərini topla: test API-dən (`https://api-cbar-test.cbar.az/api/v1/pages/{slug}?locale=az`) `haqqimizda`, `tarixi`, `missiya-ve-deyerler`, `pul-siyaseti-ve-maliyye-sabitliyi-komitesi`, `struktur-bolmeler` cavablarını və `pages/tree?locale=az|en`-in "Haqqımızda" alt ağacını `src/shared/testing/fixtures/about.ts`-ə yaz (UTF-8 qoruyan alətlə, Maddə I.5). Mövcud `fixtures/pages.ts`, `fixtures/organization.ts` ilə təkrarlananları oradan götür
- [x] T003 [P] Figma asset-lərini ixrac et: Tarix hero naxışı (`1111:64926` içindəki "Clip path group"-lar) `figma_svg` ilə → `public/site/about/history-hero.svg`. Kit `icons`-da Facebook, LinkedIn, WhatsApp, Printer, Envelope, Calendar, Phone, Caret ikonlarını yoxla. Olmayan brend ikonlarını `public/site/icons/{facebook,linkedin,whatsapp}.svg`-yə ixrac et (spec 022 footer ikonları varsa onları işlət) — **icrada dəyişdi**: naxış exporta düşmür, hero yalnız gradientdir, asset yoxdur. Bütün ikonlar kitdədir. Hero şrifti Lora-dır, vurğu `<em>` ilə (kontrakt §3, research R11). Fikstürdə "(Kopya)" alt ağacı əsl "Haqqımızda"-nın uşağıdır — analyze I1 problemi yoxdur

---

## Phase 2: Foundational — mərhələ 1 (commit: `feat(web-cbar-new): 024 about foundation`)

**Məqsəd**: tokenizer, ağac köməkçiləri, token-lər, i18n. Görünüşdə dəyişiklik yoxdur.

- [x] T004 `src/shared/lib/html-blocks.ts`: DOM-suz dayaz HTML ağacı (research R3). `parseBlocks(html): HtmlNode[] | null`, burada `HtmlNode = { tag, attrs: Record<string,string>, inner, outer, children? }`. Void elementlər `img br hr col`. Yalnız tələb olunanda uşaqlara enir: `childrenOf(node)`. Balanssız teq, bağlanmamış atribut və gözlənilməz bağlanış `null` qaytarır. `textOf(html)` (teqləri at, entity-ləri aç, boşluqları normallaşdır). Doc-şərh azərbaycanca, `*/` ardıcıllığı yoxdur
- [x] T005 `src/shared/lib/html-blocks.test.ts`: kontrakt §6 nümunələri (TipTap cədvəli `colgroup/tbody/td colspan`, `details data-accordion`, `blockquote > h3`, inline `img`), void teqlər, iç-içə eyni teq (`<p><strong><strong>`), atributda `>` simvolu, balanssız HTML → `null`, boş sətir → `[]`
- [x] T006 [P] `src/entities/page-node/lib/tree.ts`: `markChain` məntiqini `widgets/section-sidebar/section-sidebar.tsx`-dən çıxar (`activeChainIds(section, isCurrent)`). `findChainByHref(tree, href, locale)` əlavə et (`navUrl`, `?section=` daxil). `aboutSection(tree)` və `ABOUT_SECTION_TITLES`-i `views/organization/loader.ts`-dən bura köçür. `index.ts`-dən export et. `section-sidebar.tsx` yeni funksiyanı işlədir, görünüşü dəyişmir. `tree.test.ts`-ə testlər
- [x] T007 [P] `src/app/globals.css`: route B blokuna **toxunmadan** `:root`-a `--site-timeline-line`, `--site-icon-tile`, `--site-photo-placeholder`, `--site-hero-from`, `--site-hero-to`, `--site-shadow-card` (hamısı kit primitivinə `var()`, [ui-contract §4](./contracts/ui-contract.md)). `@theme inline`-a `--color-site-*` və `--shadow-site-card` alias-ları. `@media print` qaydası (R12): `[data-slot=site-header]`, `[data-slot=site-footer]`, `[data-print=hide]` gizlənir, `details > [data-type=details-content]` göstərilir
- [x] T008 [P] `src/locales/{az,en}/about.json` ([ui-contract §5](./contracts/ui-contract.md) açarları). Namespace-i i18n qeydiyyatına əlavə et (`src/shared/i18n/*`-də namespace siyahısı varsa). Key-parity testi keçməlidir
- [x] T009 `npm run verify` (Node 22 ilə də, quickstart §1). Commit

**Checkpoint**: tokenizer testlərlə kilidlənib, sayt əvvəlki kimi görünür.

---

## Phase 3: User Story 1 — Vahid "Haqqımızda" şablonu (P1) 🎯 MVP — mərhələ 2 (commit: `feat(web-cbar-new): 024 about shell`)

**Goal**: "Haqqımızda" ağacının bütün səhifələri breadcrumb, paylaşma, sol menyu və Figma
tipoqrafiyası ilə açılır. Desktop, planşet, mobil.

**Independent Test**: Komitə səhifəsi 1728/744/390 enlərində `1284:16521` / `1463:19539` /
`1444:27323` ilə müqayisə olunur (quickstart §4). Breadcrumb linkləri, aktiv menyu, paylaşma
linkləri (yeni tab), çap düyməsi işləyir.

- [x] T010 [P] [US1] `src/widgets/about-shell/model.ts`: `buildAboutShell({ tree, locale, current, pageUrl, pageTitle, trail? })` → `AboutShellData` (data-model §2). `current` = `{ slug } | { href }`. Ağac boşdursa `nav = []`, crumbs = [Ana səhifə, səhifə başlığı]. `trail` əməkdaş/şöbə adı üçündür. `model.test.ts`: CMS səhifəsi, `?section=board`, bio (trail), boş ağac
- [x] T011 [P] [US1] `src/widgets/about-shell/share-buttons.tsx` (server): 4 link ([research R7](./research.md) ünvanları, `encodeURIComponent`), `target="_blank" rel="noopener noreferrer"`, `aria-label` `about.share.*`. 36×36, r6, `bg-site-surface`, ikon 16 `text-muted-foreground` (Figma `social links`, 022 frame-lərində 36 variantı). `src/widgets/about-shell/print-button.tsx` (`'use client'`): `hidden` render olunur, `useEffect` göstərir, klikdə `window.print()`
- [x] T012 [P] [US1] `src/widgets/about-shell/about-nav.tsx` (server): Figma `subcategories` / `1382:36606` (ui-contract §2 ölçüləri). Üst səviyyə 16/600 neutral-800 + caret (uşaq varsa), alt səviyyə 14/400 `text-muted-foreground`, aktiv `text-primary` + `aria-current="page"`, açıq zəncir. Xarici link `target=_blank`. `nav[aria-label=about.nav.label]`
- [x] T013 [US1] `src/widgets/about-shell/page-tools.tsx`: kit `@cbar/lib-react-ui-kit/breadcrumb` (Figma `1272:11367`: 14/500, caret 16) + `ShareButtons` + `PrintButton`. `data-print="hide"`. `about-shell.tsx`: desktop `desk:grid desk:grid-cols-[312px_minmax(0,984px)] desk:gap-6`, alətlər sırası 100 hündürlük; `tab`/mobil alt-alta (alətlər → menyu → h1 → məzmun, Figma `1345:24722`, `1342:22407` boşluqları). H1 32/600 lh44, mobil 22/600. `index.ts` export
- [x] T014 [US1] `src/app/cms-content.css`: `.cms-content[data-variant=about]` tipoqrafiyası: `p` 16/400 lh28 neutral-800 (mobil 14/400), `h2`/`h3` 20/600 lh28, bloklar arası 32, legacy `style="text-align: justify"` saxlanır. Accordion: ağ, `border-neutral-200` token (`border-border` uyğun gəlirsə), r4, p16, gap16, summary 16/600, caret 20 (Figma `1186:14901`). `src/widgets/cms-content/cms-content.tsx`-ə `variant?: 'about'` prop-u
- [x] T015 [US1] `src/views/cms-page/loader.ts`: bölmə kökü `aboutSection` ilə eynidirsə `about: AboutShellData` qur (`headers()`-dən mütləq ünvan: `x-forwarded-proto` + `x-forwarded-host`/`host`, R7). `layout` hələlik həmişə `'plain'`, `blocks = [{ kind: 'html', html }]`. Digər bölmələr üçün nəticə dəyişmir. `loader.test.ts`-ə About halı
- [x] T016 [US1] `src/views/cms-page/index.tsx`: `data.about` varsa `AboutShell` + `CmsContent variant="about"` + `Attachments` + `childPages`. Yoxdursa mövcud `SectionSidebar` görünüşü. `index.test.tsx`: breadcrumb mətni və linkləri, son element `aria-current`, aktiv menyu, paylaşma `href`-ləri, About olmayan bölmə dəyişməyib
- [x] T017 [US1] Brauzerdə yoxla (`npm run local:testcbar`): `/az/pul-siyaseti-ve-maliyye-sabitliyi-komitesi`, `/az/elaqe`, `/en/monetary-policy-and-financial-stability-committee` 1728/744/390-da. `getBoundingClientRect` ilə menyu 312, məzmun 984, gap 24 (quickstart §4). JS söndürülmüş halda breadcrumb və paylaşma işləyir. `npm run verify`. Commit

**Checkpoint**: MVP — bütün About CMS səhifələri yeni şablondadır. Tarix/Missiya hələ adi mətndir.

---

## Phase 4: User Story 2 — Haqqımızda və Missiya blokları (P1) — mərhələ 3 (commit: `feat(web-cbar-new): 024 about main and mission blocks`)

**Goal**: `about-main` (tarix kartları, vurğulanmış qutu, accordion) və `mission` (banner, dəyər
sətirləri) layout-ları kontrakta görə qurulur. Formaya uymayan məzmun adi mətn qalır.

**Independent Test**: kontrakt §6 nümunəsi ilə fikstür testi. Test mühitində `haqqimizda-copy` /
`missiya-ve-deyerler-copy` formaya salınandan sonra `1186:14873`, `968:822` ilə müqayisə.
Bu günkü `haqqimizda`, `missiya-ve-deyerler` HTML-i mətn itirmədən göstərilir.

- [x] T018 [P] [US2] `src/features/about-content/model/types.ts` (data-model §3 tipləri) və `layouts.ts` (research R2 reyestri: az/en + `-copy` slug-ları → `AboutLayoutKind`, `layoutFor(slug)`)
- [x] T019 [US2] `src/features/about-content/model/parse.ts`: `parseAbout(html, layout): AboutBlock[]`. Ümumi köməkçilər: başlıq-sətir, şəkil-paraqraf, `safeImageSrc` (`/media/` və ya `https:`). `about-main` qaydaları (kontrakt §2: ilk cədvəl → `date-cards` 1–6 sətir, `blockquote` → `highlight`, ardıcıl `details` → `accordion-group`, ilkinə `open` atributu əlavə olunur). `mission` qaydaları (§4). `parseBlocks` `null` qaytaranda `[{ kind: 'html', html }]`
- [x] T020 [US2] `src/features/about-content/model/parse.test.ts`: §6 nümunələri → gözlənilən bloklar. 3 hücrəli cədvəl → `html`. Banner yoxdur → yalnız `values`. "Yalnız qalın" paraqraf başlıq kimi tanınır. İkonsuz dəyər. `javascript:` şəkil atılır. T002-nin real `haqqimizda` və `missiya-ve-deyerler` HTML-i: blokların `textOf`-u birləşəndə orijinal `textOf`-a bərabərdir (SC-004)
- [x] T021 [P] [US2] `src/widgets/about-blocks/date-cards.tsx` (`1186:14884`: 312×160, r4, p20, `border-site-divider`, tarix 18/600 `text-primary`, mətn `CmsContent`; tab 3×211 p16 gap16, mobil 1 sütun gap12) və `highlight-box.tsx` (`1186:14894`: `bg-site-on-accent-muted`, r4, p20, gap24, başlıq 20/600 `text-primary`, ilk paraqraf `text-primary`)
- [x] T022 [P] [US2] `src/widgets/about-blocks/mission-banner.tsx` (`968:1094`: `bg-primary` r8 p40, 22/500 `text-primary-foreground`) və `value-row.tsx` (`968:1100`: sol 200 sütun, ikon 48×48 r6 `bg-site-icon-tile` + `next/image` deyil adi `<img>` (CMS media, eslint qeydi ilə, attachments-dəki kimi), ad 18/700 `text-primary`, sağ mətn `CmsContent`; sətirlər arası `border-border` xətt və 36 boşluq; mobil alt-alta)
- [x] T023 [US2] `src/widgets/about-blocks/about-blocks.tsx`: `AboutBlock[]` → komponentlər (`html` → `CmsContent variant="about"`, `accordion-group` → `CmsContent`). `about-blocks.test.tsx`: hər blok növü render olunur, `dangerouslySetInnerHTML` yalnız `CmsContent`-dədir (grep testi lazım deyil, FSD/ESLint tutur)
- [x] T024 [US2] `src/views/cms-page/loader.ts`: About halında `layout = layoutFor(page.slug)`, `blocks = parseAbout(html, layout)`. `src/views/cms-page/index.tsx`: `CmsContent` yerinə `AboutBlocks`. `loader.test.ts`-ə `haqqimizda` və `-copy` halları
- [x] T025 [US2] Brauzerdə yoxla: `/az/haqqimizda`, `/az/missiya-ve-deyerler` (bu günkü məzmun, mətn itmir) və kontrakt nümunəsi ilə lokal fikstür (və ya formaya salınmış `-copy` səhifələri) 3 endə `1186:14873`/`1345:24722`/`1342:22407`, `968:822`/`1396:18475`/`1396:15392` ilə. JS-siz accordion açılır. `npm run verify`. Commit

**Checkpoint**: Haqqımızda və Missiya Figma bloklarını göstərir.

---

## Phase 5: User Story 3 — Tarix timeline-ı (P2) — mərhələ 4 (commit: `feat(web-cbar-new): 024 history timeline`)

**Goal**: `history` layout-u: hero kart, timeline, vurğulu mərhələlər, şəkillər, il naviqasiyası
(desktop sticky, planşet/mobil üfüqi).

**Independent Test**: kontrakt §6 history nümunəsi və `tarix-copy` (formaya salınandan sonra)
ilə `898:3060` / `1400:28042` / `1400:23720` müqayisəsi. İl linkləri JS-siz işləyir, JS ilə aktiv
il dəyişir. Yeni sətir əlavə edəndə kod dəyişmədən görünür (SC-005).

- [x] T026 [US3] `src/features/about-content/model/parse.ts`: `history` qaydaları (kontrakt §3): timeline cədvəlindən əvvəlki ilk başlıq-sətir → `history-hero`; sətir → `event` (il = ilk `[12]\d{3}`, `dayMonth` = qalan mətn, vurğu = il `<strong>` içində, başlıq, şəkillər, `card`), ili tapılmayan sətir → `loose`; `years` unikal, `anchorId = year-{yyyy}` yalnız ilk hadisədə. Cədvəl yoxdursa `plain` davranışı
- [x] T027 [US3] `parse.test.ts`-ə history testləri: nümunə, eyni ildə iki hadisə (bir il linki), ilsiz sətir, iki şəkil, vurğu, hero yoxdur, real `tarixi` HTML-i mətn itirmir
- [x] T028 [P] [US3] `src/widgets/about-blocks/history-hero.tsx` (`1111:64926`: 984×206, r8, `bg-linear-to-*` `from-site-hero-from to-site-hero-to` + `history-hero.svg` `aria-hidden` arxa fon, mətn 36/600 lh53 ağ, p50; mobil 342×120 p24 24/600)
- [x] T029 [P] [US3] `src/widgets/about-blocks/timeline.tsx`: hadisə qrid 112 / marker 16 / gövdə 704 (desktop), xətt 4 en `bg-site-timeline-line` (`898:3060` Vector 678 x), hadisələr arası 60, il 44/600, gün-ay 14/500, marker ağ dairə + haşiyə, vurğulu: secondary-500 3 halqa (`1113:9831` 30/22/16), kart p20 r4 `border-site-divider`, şəkillər 360 hündürlük (1 → tam en, 2 → yan-yana gap12, `object-cover`), `scroll-mt-*` header hündürlüyü. Planşet/mobil düzülüş `1400:28042`/`1400:23720` (hadisə V gap16 pb40 pl32)
- [x] T030 [P] [US3] `src/widgets/about-blocks/year-nav.tsx` (server, `1272:15574`: desktop sağda `sticky` 88 sütun, 72×28 çip 16/500 `text-muted-foreground`, gap28; planşet/mobil timeline üstündə `overflow-x-auto` sıra gap16) və `year-nav-spy.tsx` (`'use client'`: `IntersectionObserver` ilə `[id^=year-]` izləyir, aktiv linkə `aria-current="true"` + `data-active` qoyur; aktiv stil `bg-site-on-brand-heading`(secondary-50) haşiyə secondary-500 mətn 16/600 secondary-700 — token yoxdursa `globals.css`-ə kit primitivi ilə əlavə et)
- [x] T031 [US3] `about-blocks.tsx`-ə `history-hero` və `timeline` (+ `YearNav`) bloklarını qoş. Desktop-da timeline + il naviqasiyası iki sütun (896 + 88). `about-blocks.test.tsx`: il linkləri `href="#year-…"`, hər ilin ilk hadisəsində `id`, vurğulu marker, kart. Brauzerdə 3 en, JS-li və JS-siz (quickstart §2, §4). `npm run verify`. Commit

**Checkpoint**: Tarix timeline-ı işləyir.

---

## Phase 6: User Story 4 — İdarə Heyəti, Rəhbərlik, bio (P2) — mərhələ 5 (commit: `feat(web-cbar-new): 024 board, management and biography`)

**Goal**: təşkilat səhifələri yeni şablonda. Sədr kartı mərkəzdə, müavinlər və rəhbərlik 3 sütunlu
şəbəkədə. Bio başlıq kartı və bölmə tipoqrafiyası. `?section=` tab düymələri silinir.

**Independent Test**: test-mühit datası ilə `1189:15956`, `986:4734`, `1199:17024` müqayisəsi.
Köhnə `?section=` ünvanları açılır.

- [x] T032 [P] [US4] `src/features/organization/model/schemas.ts`: `splitBoard(staff)` → `{ chair, deputies }` (ilk = sədr, boş siyahı → `chair: null`). Test `schemas.test.ts` (yoxdursa yarat)
- [x] T033 [P] [US4] `src/widgets/about-blocks/staff-cards.tsx`: `ChairCard` (`1189:16699`: 424 en mərkəzdə, foto 424×264 `object-cover object-top`, p24 gap12, ad 20/600, vəzifə 18/500 neutral-700, `shadow-site-card`), `StaffCard` (`1189:15970`/`986:5004`: 312 en, foto 312×250 `bg-site-photo-placeholder`, ad 18/600, vəzifə 16/400, px24 pb24 gap24, r4, kölgə; foto yoxdursa `initials`), `StaffGrid` (3 / tab 2 / mobil 1 sütun, gap24), `StaffHeaderCard` (`1199:17650`: haşiyə neutral-200 r4, foto 312×272, gap42, ad 32/600, vəzifə 18/400, `Separator`, qəbul günləri və telefon 48 dairəvi ikon `bg-site-on-accent-muted` + Calendar/Phone kit ikonu, telefon `tel:` linki). Kartlar `next/image` (mövcud kimi)
- [x] T034 [US4] `src/views/organization/loader.ts`: `shell` (`buildAboutShell`, `current = { href }`), `board = splitBoard(...)` (`section=board`), `staff` (`management`). `aboutSection` entities-dən. `src/views/organization/index.tsx`: `AboutShell`, tab `nav`-ı sil, board üçün `h2.sr-only` "Sədr" + `ChairCard`, `h2.sr-only` "Sədr müavinləri" + `StaffGrid` (müavin yoxdursa bölmə yoxdur), management `StaffGrid`. Ərazi idarələr və divisions hələlik mövcud kartlarla, amma şablon içində. `organization.json`-dan istifadəsiz açarları sil (`sections.*` breadcrumb üçün lazımdırsa qalır)
- [x] T035 [US4] `src/views/staff-member/loader.ts` + `index.tsx`: `shell` (trail = ad, ana qovşaq `type`-a görə `?section=board|management`), `StaffHeaderCard`, bio `CmsContent variant="about"` (kontrakt §5: `h2`/`h3` və "yalnız qalın" paraqraf bölmə başlığı kimi — bunun üçün `parseAbout(bio, 'plain')` köməkçisi və ya CSS kifayətdirsə yalnız CSS; qərarı task-da qeyd et). `BackLink` silinir (breadcrumb əvəz edir)
- [x] T036 [US4] Testlər: `src/views/sections.test.tsx` və ya yeni `src/views/organization/index.test.tsx`: tab düymələri yoxdur, sədr ayrıca, müavinlər şəbəkədə, `sr-only` başlıqlar, xəta halında `ErrorState` + şablon qalır. Bio: başlıq kartı, telefon `tel:`. `src/app/metadata.test.ts` dəyişmir (yoxla)
- [x] T037 [US4] Brauzerdə yoxla: `?section=board`, `?section=management`, `/az/organization/staff/detail/3`, 1728/744/390, uzun ad ("Abdulla Kərim oğlu Məlik-Aslanov") kartı pozmur. `npm run verify`. Commit

**Checkpoint**: İdarə Heyəti, Rəhbərlik, bio Figma-dadır.

---

## Phase 7: User Story 5 — Struktur bölmələr, şöbə səhifəsi, ərazi idarələr (P3) — mərhələ 6 (commit: `feat(web-cbar-new): 024 divisions and offices`)

**Goal**: "Struktur bölmələr" CMS səhifəsinin sxem və PDF-ləri, şöbə kart-linkləri, yeni
`/organization/divisions/{id}`, ərazi idarələri yeni kartlarda.

**Independent Test**: test mühitində `struktur-bolmeler`-ə şəkil və 2 PDF əlavə edildikdən sonra
`996:8542` ilə müqayisə. `/az/organization/divisions/20` → `996:9576`. Mövcud olmayan id → 404.

- [x] T038 [P] [US5] `src/widgets/attachments/attachments.tsx`: `variant="about"` — Figma `pdf file` (`1000:12443`): 72 hündürlük, ağ, `border-site-divider`, p20, fayl ikonu 32, ad 16/600, ölçü `text-muted-foreground`, yeni tab. Mövcud variant dəyişmir. `attachments.test.tsx`-ə variant testi
- [x] T039 [US5] `src/views/organization/loader.ts`: `section=divisions` olanda ağacda `navUrl` `/organization?section=divisions` olan qovşağı tap, `getPage(locale, slug)` (bir sorğu, `Promise.all` ilə divisions-la paralel). `divisionsIntro` = `{ html: prepareCmsHtml(content) (ilk şəkil `<a target=_blank>` ilə sarılır), attachments }` və ya `null`. `divisions` → `{ id, name, href }`. MSW handler: `src/shared/testing/handlers/pages.ts`-ə `struktur-bolmeler`
- [x] T040 [US5] `src/views/organization/index.tsx`: divisions — intro (`CmsContent variant="about"`, sxem `max-w-[713px] w-full h-auto`), `Attachments variant="about"`, şöbə kart-linkləri. Offices — ad, ünvan, `tel:` telefon kartları (`border-site-divider` p24, ad 18/600). Testlər `index.test.tsx`-ə
- [x] T041 [P] [US5] `src/views/division/loader.ts` (server-only, `cache()`): `getDivisions` → `id` ilə tap, yoxdursa `null`. `shell` trail = şöbə adı, ana qovşaq = divisions. `html = prepareCmsHtml(description)`. `src/views/division/index.tsx`: `AboutShell`, H1 28/600, məlumat kartı (`1003:12462`: `border-site-divider` p24, `CmsContent variant="about"`). `loader.test.ts` (MSW): tapılır, tapılmır, API xətası
- [x] T042 [US5] `src/app/[locale]/(content)/organization/divisions/[id]/page.tsx`: nazik route (`params.id` Zod ilə müsbət tam ədəd, yoxdursa `notFound()`), `generateMetadata` (title = şöbə adı, `alternates.languages`), `export const dynamic = 'force-dynamic'`. ESLint FSD/route qaydaları keçir
- [x] T043 [US5] Brauzerdə yoxla: `?section=divisions` (sxem yoxdursa yalnız siyahı), `?section=offices`, `/az/organization/divisions/20`, `/az/organization/divisions/999999` → 404, 3 en. Server log-unda sorğu sayı (SC-007). `npm run verify`. Commit

**Checkpoint**: bütün spec user story-ləri hazırdır.

---

## Phase 8: Polish — mərhələ 7 (commit: `docs: 024 about redesign wrap-up`)

- [x] T044 [P] `product-rest/web-cbar-new/docs/about-cms-guide.md`: redaktor təlimatı (azərbaycanca, admin panelin düymələri ilə: cədvəl, sitat, accordion, başlıq, qalın, şəkil), hər layout üçün addım-addım nümunə, "(Kopya)" səhifələrində hazırlıq qaydası, nə edilməməli (rəngli mətn, birləşdirilmiş hücrə). Mənbə [contracts/cms-markup.md](./contracts/cms-markup.md) (FR-009)
- [ ] T045 Roundtrip sübutu (research R15, SC-003): kontrakt §6 nümunəsini `web-cbar-admin-new`-də müvəqqəti fikstür kimi `roundtrip.test.ts` mexanizmi ilə lokal işlət, **commit etmə**. Nəticəni `specs/024-about-us-redesign/visual-diff.md`-yə yaz. Redaktor "(Kopya)" səhifələrini doldurubsa `npm run roundtrip -- "Haqqımızda (Kopya)" "Tarix (Kopya)" "Missiya və dəyərlər (Kopya)"`. Doldurmayıbsa root tracker-də ⛔ Bloklanan kimi qeyd et — **Qismən (2026-10-15)**: kontrakt nümunəsi TipTap-dan keçdi, bloklar və mətn eynidir (`visual-diff.md`). Real "(Kopya)" səhifələri ⛔
- [x] T046 [P] `specs/024-about-us-redesign/visual-diff.md`: quickstart §4 cədvəli üzrə nəticələr (səhifə, en, element, Figma, sayt, qərar). Qəbul edilmiş fərqlər: yaxın kit rəngləri və kart kölgəsi (research R11), İdarə Heyəti başlıqları `sr-only` (R9)
- [x] T047 [P] `product-rest/web-cbar-new/CLAUDE.md`: §2 `'use client'` siyahısına `print-button`, `year-nav-spy`. `widgets/about-shell`, `widgets/about-blocks`, `features/about-content`, `shared/lib/html-blocks` qısa qeydi və CMS markup kontraktına link. Root `CLAUDE.md` web-cbar-new bölməsinə bir sətir
- [x] T048 [P] `ui-kit-review` skill-i ilə dəyişən faylları yoxla (hex, barrel import, hand-rolled control). `npm audit` dəyişməyib (yeni dependency yoxdur)
- [x] T049 Quickstart §5: 320–1920 üfüqi sürüşmə, klaviatura yolu, çap önizləməsi, sorğu sayı. Root `FIGMA-REDIZAYN-PLANI.md`-də "Harada qaldım" və checkbox-ları yenilə. `/sync-business-logic web-cbar-new` təklifi (kod dəyişmir)
- [x] T050 Son `npm run verify` + Node 22, quickstart-ın hamısı. Commit

---

## Dependencies & Execution Order

- Phase 1 → Phase 2 (fikstürlər və asset-lər testlərə və hero-ya lazımdır).
- Phase 2 **bütün story-ləri bloklayır** (tokenizer, ağac köməkçiləri, token-lər, i18n).
- US1 (Phase 3) US2–US5-i bloklayır: hamısı `AboutShell`-i işlədir.
- US2 (Phase 4) və US3 (Phase 5) eyni `parse.ts` və `about-blocks.tsx`-ə toxunur, ona görə ardıcıl gedir. US3 US2-nin `types.ts`/`layouts.ts`-indən asılıdır.
- US4 (Phase 6) və US5 (Phase 7) US2/US3-dən asılı deyil. Hər ikisi `views/organization/*`-ə toxunur, ona görə ardıcıl gedir. Lazım olsa US4 US2-dən əvvəl edilə bilər.
- Polish ən sonda. T045 redaktorun "(Kopya)" səhifələrini doldurmasından asılıdır (kod işini bloklamır).

## Parallel Opportunities

- Phase 1: T002 ∥ T003.
- Phase 2: T006 ∥ T007 ∥ T008 (T004–T005 ilə də paralel, fərqli fayllar).
- US1: T010 ∥ T011 ∥ T012. T013 onlardan sonra, T014 ∥ T013.
- US2: T018 ∥ T021 ∥ T022. T019 → T020 ardıcıl.
- US3: T028 ∥ T029 ∥ T030 (T026 ilə də paralel).
- US4: T032 ∥ T033.
- US5: T038 ∥ T041.
- Polish: T044 ∥ T046 ∥ T047 ∥ T048.

## Implementation Strategy

**MVP**: Phase 1–2 + US1. Bütün "Haqqımızda" səhifələri yeni şablon və tipoqrafiya ilə açılır,
CMS məzmunu dəyişmədən. Sonra US2 → US3 → US4 → US5. Hər biri ayrıca commit və ayrıca
yoxlanılan addımdır.

Redaksiya işi paralel gedir: redaktor US2 commit olunandan sonra "(Kopya)" səhifələrini
`docs/about-cms-guide.md` (T044-ü US2 ilə birlikdə erkən yazmaq olar) ilə formaya salır. Canlı
səhifələr məzmun hazır olanda köçürülür.

MR GitLab-a `feature/024-about-us-redesign`-dən gedir. 022 merge olunandan sonra merge edilir.
`test`-ə birləşmə istifadəçinin qərarıdır.
