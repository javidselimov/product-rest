---
description: "Task list — 028 Media giriş səhifəsi və ümumi şablon (web-cbar-new)"
---

# Tasks: "Media" giriş səhifəsi və ümumi şablon (Figma)

**Input**: `specs/028-media-redesign/` — [spec.md](./spec.md), [plan.md](./plan.md),
[research.md](./research.md), [data-model.md](./data-model.md),
[contracts/ui-contract.md](./contracts/ui-contract.md), [quickstart.md](./quickstart.md)

**Branch**: `feature/028-media-redesign`. Bütün yollar `product-rest/web-cbar-new/`-ə nisbətəndir.

**Sıra**: plan.md-dəki 4 mərhələ. Hər mərhələ **bir commit**-dir və `npm run verify` ilə bitir.
Mərhələ 1 (şablonun ümumiləşməsi) qalanların əsasıdır; 2 və 3 ondan sonra bir-birindən asılı deyil.

**Hər UI task-dan əvvəl**: Figma dəyərləri `figma_node` ilə node-dan oxunur (id-lər
[ui-contract §2](./contracts/ui-contract.md)). Şablon ölçüləri 024-də ölçülüb — dəyişmir.

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Setup

- [x] T001 Root `FIGMA-REDIZAYN-PLANI.md`-yə "028 — Media" bölməsi: "Harada qaldım", ⛔ Bloklanan,
  qərarlar, mərhələ checkbox-ları
- [x] T002 [P] Fikstür: test API-dən `pages/tree?locale=az|en` "Media" alt ağacı (id 77, 9 uşaq +
  `media-copy`) və `pages/media?locale=az|en` cavabı → `src/shared/testing/fixtures/media-section.ts`
  (`mediaTreeAz`, `mediaTreeEn`, `mediaPageAz`, `mediaPageEn`). UTF-8 qorunur. Qlobal `pageTreeAz`
  dəyişmir — Media testləri `server.use` ilə verir

---

## Phase 2: Mərhələ 1 — Şablonun ümumiləşməsi (commit: `refactor(web-cbar-new): 028 section-agnostic page shell`)

**Məqsəd**: `about-shell` → `section-shell`, bölmə açarı ilə. Görünüş və About davranışı dəyişmir.

- [x] T003 `src/entities/page-node/lib/tree.ts`: `SectionKey`, `SECTION_TITLES`, `sectionRoot`,
  `isSectionCopy`, `sectionKeyOf` (data-model §2). `ABOUT_SECTION_TITLES`, `aboutSection`,
  `isAboutCopy` bunların üstündən saxlanır. `index.ts` export. `tree.test.ts`: Media kökü az/en,
  `sectionKeyOf`, Kopya
- [x] T004 `git mv src/widgets/about-shell src/widgets/section-shell`; fayllar: `about-shell.tsx` →
  `section-shell.tsx` (`SectionShell`), `about-nav.tsx` → `section-nav.tsx` (`SectionNav`,
  `data-slot="section-nav"`), `model.ts` (`buildSectionShell({ section, … })`, `SectionShellData`,
  `SectionNavItem`), `page-tools.tsx`, `share-buttons.tsx`, `print-button.tsx` → `getT(locale, 'section')`.
  `data-slot="section-shell"`. `index.ts`
- [x] T005 [P] `src/locales/{az,en}/section.json` (data-model §8); `about.json`-dan `breadcrumb`,
  `share`, `nav` silinir; `src/shared/i18n/index.ts` `NAMESPACES` + resources. `key-parity`, `utf8-guard` keçir
- [x] T006 İstehlakçılar: `views/cms-page/{loader,index}.tsx` (`about` → `shellPage`, `section`),
  `views/organization/{loader,index}.tsx`, `views/division/{loader,index}.tsx`,
  `views/staff-member/{loader,index}.tsx` — import və tip adları; `buildSectionShell({ section: 'about', … })`
- [x] T007 Testlər: `widgets/section-shell/model.test.ts` (adlar + `section: 'about'`),
  `views/cms-page/index.test.tsx`, `loader.test.ts` (`shellPage`), digər About testləri yaşıl.
  `grep -r "about-shell\|AboutShell\|buildAboutShell"` boş
- [x] T008 `npm run verify` (Node 22 ilə də). Commit

**Checkpoint**: About səhifələri dəyişməyib, şablon bölmə parametri ilə işləyir.

---

## Phase 3: Mərhələ 2 — Media giriş səhifəsi (US1, US3) 🎯 MVP (commit: `feat(web-cbar-new): 028 media landing`)

- [x] T009 [US1] `src/views/media/loader.ts` yenidən: `cache()`; `getPage(locale, 'media')` +
  `getPagesTree(locale)` `allSettled`; `prepareCmsHtml`; `attachments` (cms-page loader-dəki kimi);
  `buildSectionShell({ section: 'media', current: { slug: 'media' }, pageUrl: await absolutePageUrl('/{locale}/media'), pageTitle })`.
  Səhifə yoxdursa `title = t('media:title')`, `html = ''` (FR-008). Köhnə `GalleryCard`/`VideoCard`/`StreamCard`
  tipləri və map-ləri `views/media-galleries`, `views/media-videos` loader-lərinə köçür (T014–T015);
  bu mərhələdə hələ `views/media/loader.ts`-də `export` qalır ki, build sınmasın
- [x] T010 [US1] `src/views/media/index.tsx`: `<SectionShell shell title>` + `<CmsContent html variant="about" />`
  + `<Attachments>`. Lövbər düymələri, grid-lər silinir. `media.json`: `sectionNav` silinir
- [x] T011 [US1] `app/[locale]/(content)/media/page.tsx`: `generateMetadata` başlıq `data.title`
- [x] T012 [US1][US2] `src/views/cms-page/loader.ts`: `sectionKeyOf(tree, section)`; `'about'` → mövcud yol;
  `'media'` → `layout 'plain'`, `blocks [{kind:'html'}]`; `null` → köhnə. `index.tsx` `SectionPage`
  (bloklar yalnız `section === 'about'`, yoxsa `CmsContent variant="about"`)
- [x] T013 [US1][US3] Testlər: `views/media/loader.test.ts` (səhifə + ağac; ağac uğursuz; səhifə yoxdur),
  `views/media/index.test.tsx` (breadcrumb "Ana səhifə › Media", bir H1 = CMS başlığı, mətn, paylaşma,
  aktiv bənd yoxdur, menyu bəndləri ağacdan), `widgets/section-shell/model.test.ts` Media halları
  (Kopya kökü, `/media/galleries` href ilə aktiv), `views/cms-page/loader.test.ts` Media səhifəsi
  şablon alır / About blokları almır. `npm run verify`. Commit

**Checkpoint**: `/az/media` Figma giriş səhifəsidir; grid-lər hələ köhnə loader-də (route yoxdur) — mərhələ 3.

---

## Phase 4: Mərhələ 3 — Siyahılar və ünvanlar (US2, US3) (commit: `feat(web-cbar-new): 028 media lists and legacy routes`)

- [x] T014 [P] [US2] `src/views/media-galleries/{loader.ts,index.tsx}`: `getGalleries` + ağac,
  `title` ağacdan (`isCurrentNode` href) yoxsa `t('media:galleries')`, `shell current {href}`,
  mövcud qalereya kart markup-ı; `ErrorState`/`EmptyState`. Route `(content)/media/galleries/page.tsx`
  (`force-dynamic`, metadata, alternates)
- [x] T015 [P] [US2] `src/views/media-videos/{loader.ts,index.tsx}`: `getVideoStreams` + `getVideos` + ağac;
  canlı yayım kartı + video grid-i (mövcud markup). Route `(content)/media/videos/page.tsx`
- [x] T016 [US2] `src/views/gallery/{loader.ts,index.tsx}`: ağac sorğusu, `shell` (`current {href:/media/galleries}`,
  `trail: title`), `SectionShell title={title}`; `BackLink` silinir; `media.json` `backToMedia` silinir.
  Köhnə `views/media/loader.ts`-dəki kart tipləri/map-ləri silinir (T009 qeydi)
- [x] T017 [US2] `src/shell/nav.ts` `FEATURE_ROUTES`: `fotoqalereya`/`photo-gallery` → `media/galleries`,
  `videoqalereya`/`video-gallery` → `media/videos`. `nav.test.ts` varsa yenilənir
- [x] T018 [US3] `src/proxy.ts`: matcher `media/\\d+`; `legacyRedirect` — `/gallery/photos[/detail/{id}]`,
  `/videos` (research R6). `proxy.test.ts`: matcher (`/media`, `/media/galleries` düşür; `/media/12` kənarda),
  legacy 308 cədvəli
- [x] T019 [US2] Testlər: `views/media-galleries/index.test.tsx`, `views/media-videos/index.test.tsx`
  (kart sayı = fikstür, xəta → şablon qalır + `ErrorState`), `views/gallery` breadcrumb trail.
  `npm run verify`. Commit

**Checkpoint**: grid-lər yeni ünvanlarda, köhnə URL-lər yönlənir, locale-siz `/media` işləyir.

---

## Phase 5: Mərhələ 4 — Yekun (commit: `docs(web-cbar-new): 028 media visual diff and editor notes`)

- [x] T020 Brauzerdə (`npm run local:testcbar`) 1728/744/390 ölçmə (quickstart §3) → `visual-diff.md`
  cədvəli; JS-siz yoxlama; About reqressiya (`/az/haqqimizda`, `?section=board`, şöbə)
- [x] T021 [P] `docs/media-cms-guide.md` (qısa): menyu CMS ağacından, `navUrl` yeni ünvanları,
  Figma adlarına keçid cədvəli (spec "Redaktor tapşırıqları")
- [x] T022 [P] `CLAUDE.md` (web-cbar-new): "Haqqımızda bölməsi" qeydi → `widgets/section-shell`
  bölmə-agnostik, Media giriş səhifəsi; root `CLAUDE.md` web-cbar-new bəndinə 028 cümləsi
- [x] T023 Root `notdoneyet.md`: `/gallery/photos`, `/videos` bəndi ✅; `FIGMA-REDIZAYN-PLANI.md`
  "Harada qaldım (028)" yekun. `npm run verify`. Commit
