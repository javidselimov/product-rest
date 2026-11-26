---
description: "Task list — 022 Figma redizaynı (web-cbar-new)"
---

# Tasks: Public saytın Figma dizaynına keçidi

**Input**: `specs/022-figma-redesign/` — [spec.md](./spec.md), [plan.md](./plan.md), [research.md](./research.md),
[data-model.md](./data-model.md), [contracts/ui-contract.md](./contracts/ui-contract.md), [quickstart.md](./quickstart.md)

**Branch**: `feature/022-figma-redesign`. Bütün yollar `product-rest/web-cbar-new/`-ə nisbətəndir (əks qeyd olunmayıbsa).

**Sıra**: plan.md-dəki 6 mərhələ. Hər mərhələ **bir commit**-dir və `npm run verify` ilə bitir.
Story sırası: US2 (header) → US3 (footer) → US1 (home), çünki home shell-in token və
konteynerinə söykənir. US4 (planşet/mobil) desktop-dan sonra gəlir.

**Testlər**: spec yeni test tələb etmir, amma SC-006 (test əhatəsi azalmır) üçün dəyişən hər
komponentin mövcud testi yenilənir və yeni widget-lərə test əlavə olunur.

**Hər UI task-dan əvvəl**: `ui-kit-usage` və `frontend-standards` skill-ləri. Figma dəyərləri
`figma_node` / `figma_css` ilə həmin node-dan oxunur (node id-lər [ui-contract §4](./contracts/ui-contract.md)).

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Setup

- [x] T001 Font fayllarını əldə et: `npm pack @fontsource-variable/dm-sans` (scratchpad-da, korporativ CA ilə), tarball-dan latin və latin-ext `wght` variable woff2 fayllarını və lisenziyanı `src/app/fonts/dm-sans/` qovluğuna köçür (`OFL.txt`). Paket dependency kimi əlavə **edilmir** (research R2)
- [x] T002 Figma rəng və ölçülərini yoxla: `figma_css` ilə `813:25084` (Media fonu), `12:1065` (header kölgəsi) və gradient style-ı oxu, [ui-contract §1](./contracts/ui-contract.md) dəyərlərini təsdiqlə və fərq varsa contract-ı yenilə

---

## Phase 2: Foundational — mərhələ 1 (commit: `feat(web-cbar-new): 022 design foundation`)

**Məqsəd**: font, token-lər, layout primitivləri, tam enli ana səhifə imkanı və tünd temanın ləğvi.
Bu mərhələdən sonra bütün səhifələr əvvəlki kimi görünür, yalnız font DM Sans olur və konteyner 1320-yə keçir.

- [x] T003 `src/app/fonts.ts` yarat: `next/font/local` ilə T001 fayllarından `dmSans` — **icrada dəyişdi**: `src/app/fonts.css` (2 × `@font-face` `unicode-range` ilə) + `public/fonts/dm-sans/`, səbəb research R2
- [x] T004 `src/app/layout.tsx`: `dmSans.variable` class-ını `<html>`-ə ver. `cookies()`/`THEME_COOKIE`/`parseTheme` oxumasını və `dark` class-ını sil. Doc-şərhi yenilə
- [x] T005 `src/app/globals.css`: route B blokuna **toxunmadan**, ondan sonra `:root`-da `--ui-font-sans: var(--font-dm-sans), …` və [ui-contract §1](./contracts/ui-contract.md) `--site-*` token-ləri yaz. D-2 literallarını oklch-də ver, şərhdə Figma hex-i olsun. `@theme inline`-da rəng/kölgə alias-ları, `--container-site`, `--breakpoint-tab`, `--breakpoint-desk` əlavə et. `html.dark` qaydasını sil
- [x] T006 [P] Tünd temanı sil: `src/shell/theme-toggle.tsx`, `src/shell/theme-toggle.test.tsx`, `src/shared/model/ui-store.ts`. `src/providers/app-providers.tsx`-dən tema prop-u və `hydrateTheme`. `src/app/[locale]/layout.tsx`-də tema ötürülürsə onu da sil (research R8)
- [x] T007 [P] `src/shared/config/cookies.ts`: `THEME_COOKIE`, `ThemePreference`, `parseTheme` sil. `UI_COOKIE_MAX_AGE` başqa yerdə işlənmirsə sil. Registr şərhini yenilə (`accw` qalır). `docs/cookies.md`-dən `ui-theme`-i çıxar
- [x] T008 `src/shell/site-header.tsx`: `ThemeToggle` importu və render-i, loqonun `dark:` class-larını sil (header-in qalanı US2-də dəyişir)
- [x] T009 Route group: `src/app/[locale]/(content)/layout.tsx` yarat (yalnız `<div className="mx-auto w-full max-w-site px-4 py-8">`). `git mv` ilə `[...slug] currencies laws media national-currency organization press-releases search securities statistics` qovluqlarını `src/app/[locale]/(content)/`-a köçür. `page.tsx`, `layout.tsx`, `error.tsx`, `loading.tsx`, `not-found.tsx` `[locale]`-də qalır (research R3)
- [x] T010 `src/shell/site-shell.tsx`: `<main>`-dən `mx-auto max-w-7xl px-4 py-8`-i çıxar (`w-full flex-1` qalır). `src/app/[locale]/error.tsx`, `loading.tsx`, `not-found.tsx` və müvəqqəti olaraq `src/views/home/index.tsx` kök elementi öz `mx-auto max-w-site px-4 py-8` konteynerini alır
- [x] T011 Route köçürməsinin yan təsirlərini yoxla: `grep -rn "app/\[locale\]/" scripts eslint.config.* vitest.config.mts src` (self-contained check, ESLint boundary qaydaları, import yolları). Lazım olanı yenilə
- [x] T012 `npm run verify` + Node 22 test (quickstart §1). `npm run dev` ilə `/az`, `/az/press-releases`, `/az/statistics/azir`-də layout-un əvvəlki kimi qaldığını və DM Sans-ın yükləndiyini yoxla (quickstart §2 #9–11). Commit

**Checkpoint**: shell və bütün səhifələr işləyir, tema yoxdur, font və token-lər hazırdır.

---

## Phase 3: User Story 2 — Header və mega-menyu (P1) — mərhələ 2 (commit: `feat(web-cbar-new): 022 header and mega-menu`)

**Goal**: Figma header-i (üst zolaq + nav) və tam enli mega-menyu paneli, desktop.

**Independent Test**: istənilən səhifədə nav bəndinə hover/Tab → panel Figma `1083:26783` kimi, JS-siz keçid işləyir (quickstart §2 #5–7).

- [x] T013 [P] [US2] `src/shared/config/contacts.ts`: `topLinks` (Karyera, Media, Əlaqə, az/en href, köhnə `product-host/visitor/views/layouts/header.php`-dən). Hotline/E-CBAR mövcud dəyərlərdən
- [x] T014 [P] [US2] `src/locales/{az,en}/nav.json`: üst zolaq etiketləri (`career`, `media`, `contact`, axtarış placeholder "Axtar"/"Search"), key-parity saxla
- [x] T015 [US2] `src/shell/site-header.tsx`: Figma `12:1065` quruluşu. Üst zolaq (loqo, `topLinks`, `HeaderSearch`, `LanguageSwitcher`, hotline, canlı yayım düyməsi, E-CBAR `Button`) və nav çubuğu (`max-w-site`, 74px, `shadow-site-header`). Header `relative` olsun (mega panel üçün)
- [x] T016 [P] [US2] `src/shell/header-search.tsx`, `src/shell/language-switcher.tsx`: Figma `12:1058` və axtarış input-u ölçü/tipoqrafiyası (GET forma və adi `<a>` davranışı dəyişmir)
- [x] T017 [US2] `src/shell/mega-menu.tsx`: nav bəndləri 600 14 (`9:10`). `LEVEL_2` flyout → header-in altında `inset-x-0 top-full` tam enli panel (`bg-background shadow-site-panel`, daxildə `max-w-site`, padding 30/60). Bölmə başlığı 600 20/28, `border-site-divider` xətt, `grid grid-cols-4 gap-6` sütunlar: 2-ci səviyyə sütun başlığı (600 16/28), 3-cü səviyyə siyahı (400 14/28, gap 8). `ThirdLevel` flyout ləğv, overflow menyusu eyni panel. `group-hover`/`focus-within`/`data-closed` modeli saxlanılır (research R5)
- [x] T018 [P] [US2] `src/shell/nav-section.tsx`, `src/shell/nav-anchor.tsx`: yeni panel üçün lazım olan class/slot dəyişiklikləri (bağlanma davranışı eyni)
- [x] T019 [US2] Testlər: `src/shell/mega-menu.test.tsx` (panel quruluşu: başlıq, sütun başlıqları, 3-cü səviyyə linkləri görünür; overflow), `src/shell/site-header.test.tsx` (üst zolaq linkləri, E-CBAR, tema düyməsinin olmaması), `src/shell/accessibility.test.tsx` yaşıl
- [x] T020 [US2] `npm run verify` + Node 22. Brauzerdə 1728 enində header və açıq panel Figma ilə müqayisə (quickstart §3). Commit

---

## Phase 4: User Story 3 — Footer (P2) — mərhələ 3 (commit: `feat(web-cbar-new): 022 footer`)

**Goal**: Figma footer-i 3 breakpoint-də.

**Independent Test**: istənilən səhifənin footer-i Figma `813:24811` / `834:5609` / `847:9688` ilə uyğundur, linklər işləyir.

- [x] T021 [P] [US3] `src/shared/config/contacts.ts`: footer `usefulLinks` (8 xarici link, URL-lər `product-host/visitor/views/layouts/footer.php`-dən). `press.extension` fərqini (kod 572, Figma 2243) köhnə saytdan yoxla və düzgün dəyəri saxla, nəticəni commit mesajında qeyd et
- [x] T022 [P] [US3] `src/locales/{az,en}/footer.json`: Əlaqə, Naviqasiya, Bizimlə əlaqə (başlıq + mətn), Faydalı linklər, Onlayn müraciət, Sorğu platforması, Məxfilik siyasəti, Saytın xəritəsi, © mətni
- [x] T023 [US3] `src/shell/site-footer.tsx`: 10px `bg-site-accent` xətt + `bg-primary` fon. 4 sütun (Əlaqə: ünvan, `tel:` linkləri, 2 düymə; Naviqasiya: `footerSections`; Bizimlə əlaqə kartı; Faydalı linklər) + alt zolaq. Desktop 1728 Figma ölçüləri, `tab:` və mobil düzülüşü `834:5609` / `847:9688`-dən. Sosial ikonlar Figma-da varsa yeri oradan, yoxdursa alt zolaqda saxlanılır
- [x] T024 [US3] `src/shell/site-footer.test.tsx`: yeni sütunlar, `tel:` linkləri, faydalı linklər `target="_blank" rel="noopener noreferrer"`
- [x] T025 [US3] `npm run verify` + Node 22, 3 enlikdə vizual müqayisə. Commit

---

## Phase 5: User Story 1 + 5 — Ana səhifə blokları (P1, P3) — mərhələ 4 (commit: `feat(web-cbar-new): 022 home page`)

**Goal**: Figma home strukturu desktopda. Real data mövcud mənbələrdən, 3 blok mock, 4 blok gizli.

**Independent Test**: `/az` 1728-də Figma `813:25078` ilə uyğundur. Network-da `/videos` yoxdur (quickstart §2 #1–4).

### Data qatı

- [x] T026 [P] [US1] `src/views/home/blocks.ts`: `HOME_BLOCKS` bayraqları (data-model §1), doc-şərhlə (gizli, ləğv deyil, spec FR-015)
- [x] T027 [P] [US5] `src/views/home/mock.ts` (`import 'server-only'`): `StrategyDoc`, `CalendarEvent`, `Announcement` tipləri və `getHomeMocks(locale)` az/en (data-model §5). Mətnlər Figma-dan (`813:25082` text). Hər export `TODO(api)` şərhi ilə. Şəkilləri `figma_png` ilə `public/site/home/`-ə export et (strategiya üz qabıqları)
- [x] T028 [US1] `src/views/home/loader.ts`: `HOME_BLOCKS.videosTab` söndürülüdürsə `/videos` çağırılmır (`settle` əvəzinə boş nəticə). `feedTabs` = news (ilk 4 press-reliz) · announcements (mock) · gallery. `strategyDocs`, `calendar` sahələri (mock-dan). Statistika tabları üçün href-lər. `HomeViewData` tipini data-model §2-yə uyğunlaşdır
- [x] T029 [US1] `src/shared/testing/handlers/*`, `src/shared/testing/fixtures/homepage.ts` + `src/views/home/loader.test.ts`: video sorğusunun getmədiyini, yeni feed tablarını, mock sahələrini yoxla (MSW `onUnhandledRequest: 'error'` saxlanılır)
- [x] T030 [P] [US1] `src/locales/{az,en}/home.json`: İcmal göstəricilər, 5 tab adı, Media, Xəbərlər/Elanlar/Qalereya, Bütün xəbərlər, Daha ətraflı, Ətraflı, Strategiya və sənədlər, Təqvim, teqlər (Mətbuat konfransı, Press-reliz), ay adları lazım olduqda

### Widget-lər

- [x] T031 [P] [US1] `src/widgets/hero-slider/hero-slider.tsx`: Figma first screen sol hissəsi (1188×744 şəkil, başlıq 40/54, alt mətn 24/36, "Ətraflı" düymə, "1/3" sayğac). 1 slayd → sayğac və keçidlər gizli (spec Edge Cases). `hero-slider.test.tsx` yenilə
- [x] T032 [P] [US1] `src/widgets/home-cards/currency-card.tsx`, `inflation-card.tsx`, `corridor-card.tsx`: 424 en Figma kartları (`809:24614`, `809:24678`, `809:24733`), `stat-card.tsx` lazım olarsa yenilə
- [x] T033 [US1] `src/widgets/home-cards/statistics-tabs.tsx` (`'use client'`, kit `Tabs`): data-model §3 tabları. Panellərdə `info-widget.tsx`, `yield-curve-card.tsx`, `money-market-card.tsx` Figma `212:3234` variantlarına görə restyle (böyük rəqəm 800 36/40 + vahid 24). Boş tab gizli, xəta → `ErrorState`, "Daha ətraflı"
- [x] T034 [US1] `src/widgets/home-cards/news-tabs.tsx`: Xəbərlər · Elanlar · Qalereya, press-release kartı (`314:1926` default + hover/active), "Bütün xəbərlər". Video render yolu qalır (gizli tab üçün)
- [x] T035 [P] [US1] `src/widgets/home-cards/links-grid.tsx`: yalnız `PromoBannerCard` coin banner kimi (1320×220, `813:26806`). `Publications`, `QuickLinks`, `UsefulLinks` dəyişmir
- [x] T036 [P] [US5] `src/widgets/home-cards/strategy-docs.tsx`: başlıq + 2 kart (üz qabığı, başlıq 600 18/24, mətn 16/28, "Daha ətraflı")
- [x] T037 [P] [US5] `src/widgets/home-cards/event-calendar.tsx`: "Təqvim" başlığı + tədbir sətirləri (`382:1551`: gün 800 24, ay 500 14, teq, başlıq 600 16/28, saat 12). Tarix `Intl.DateTimeFormat(locale)` ilə
- [x] T038 [US1] `src/widgets/home-cards/home-cards.test.tsx`: `StatisticsTabs`, yeni `NewsTabs` tabları, `StrategyDocs`, `EventCalendar`, restyle olunmuş kartlar. Gizli blokların widget testləri olduğu kimi qalır

### View

- [x] T039 [US1] `src/views/home/index.tsx`: Figma sırası. Birinci ekran (`bg-site-surface-muted` tam enli, solda slayder, sağda 424 sütunda 3 kart, slayder yoxdursa kartlar tam en) → İcmal göstəricilər → Media (`bg-site-surface-muted` tam enli, `py-20`) → promo → Strategiya \| Təqvim. Bölmələr arası 80. Hər bölmə öz `max-w-site` konteynerində. Gizli bloklar `HOME_BLOCKS` ilə. T010-dakı müvəqqəti kök konteyneri çıxar. Doc-şərhi yenilə
- [x] T040 [US1] `src/views/home/index.test.tsx`: blok sırası, gizli blokların render olunmaması (bayraq), blok xətası izolyasiyası (FR-016), mock bloklar
- [x] T041 [US1] `npm run verify` + Node 22. `npm run local:testcbar` ilə quickstart §2 #1–4, #8 və 1728 vizual müqayisə. Commit

---

## Phase 6: User Story 4 — Planşet və mobil (P2) — mərhələ 5 (commit: `feat(web-cbar-new): 022 tablet and mobile`)

**Goal**: 744 və 390 enlikləri Figma-ya uyğun.

**Independent Test**: quickstart §3 744/390 sətirləri. 320–1920 aralığında üfüqi sürüşmə yoxdur.

- [ ] T042 [US4] Figma tablet/mobil ölçülərini oxu (`figma_node` `813:25077`, `839:7046`, `821:2320`, `820:2151`, `839:8335`), kənar boşluqları və blok düzülüşlərini [ui-contract §2](./contracts/ui-contract.md)-də dəqiqləşdir
- [ ] T043 [US4] `src/shell/mobile-nav.tsx` (+ `site-header.tsx` breakpoint-ləri): planşet header (`820:2151`), mobil header (`839:8335`, `bg-primary`), açılan menyu "opened" variantı (`821:2320`). Kit `Sheet` saxlanılır. `mobile-nav.test.tsx` yenilə
- [ ] T044 [P] [US4] Footer-in 744/390 dəqiq ölçüləri (`834:5609`, `847:9688`; mərhələ 3-də yalnız əsas 2→1 sütun düzülüşü var) və home widget-lərinin `tab:` / mobil variantları: `hero-slider`, 3 kart, `statistics-tabs` (`1072:24780`, `1075:26138`), `news-tabs` (`831:4140`, `847:9079`), `strategy-docs`, `event-calendar`, `views/home/index.tsx`
- [ ] T045 [US4] Üfüqi sürüşmə yoxlaması 320/390/744/1024/1360/1920 (quickstart §3). `npm run verify` + Node 22. Commit

---

## Phase 7: Polish — mərhələ 6 (commit: `docs: 022 figma redesign wrap-up`)

- [ ] T046 [P] `specs/022-figma-redesign/visual-diff.md`: quickstart §3-ün nəticələri, qalan fərqlər və istifadəçi qərarı
- [ ] T047 [P] `product-rest/web-cbar-new/CLAUDE.md`: `'use client'` siyahısı (`statistics-tabs`, `theme-toggle` çıxır), `(content)` route group-u, tema yoxdur, D-2 qeydi. Root `CLAUDE.md` web-cbar-new bölməsinə qısa qeyd
- [ ] T048 [P] `ui-kit-review` skill-i ilə dəyişən faylları yoxla (hex, barrel import, hand-rolled control)
- [ ] T049 Root tracker-i (`022-figma-redesign` checkbox-ları) yenilə. `/sync-business-logic web-cbar-new` təklifi (kod dəyişmir, yalnız sənəd)
- [ ] T050 Son `npm run verify` + Node 22, quickstart-ın hamısı. Commit

---

## Dependencies & Execution Order

- Phase 1 → Phase 2 (font faylları və token dəyərləri lazımdır).
- Phase 2 **bütün story-ləri bloklayır** (token, konteyner, route group).
- US2 (Phase 3) və US3 (Phase 4) bir-birindən asılı deyil. Hər ikisi `contacts.ts`-ə toxunur, ona görə ardıcıl gedir.
- US1+US5 (Phase 5) Phase 2-dən asılıdır. Header/footer-dən texniki asılı deyil, amma vizual müqayisə üçün sonra gəlir.
- US4 (Phase 6) Phase 3–5-dən asılıdır (eyni komponentlərin responsiv variantı).
- Polish ən sonda.

## Parallel Opportunities

- Phase 2: T006 ∥ T007 (fərqli fayllar). T009–T011 ardıcıldır.
- US2: T013 ∥ T014 ∥ T016 ∥ T018. T017 T015-dən sonra.
- US3: T021 ∥ T022.
- US1/US5: T026 ∥ T027 ∥ T030. Widget-lərdə T031 ∥ T032 ∥ T035 ∥ T036 ∥ T037. T033, T034 loader-dən (T028) sonra.
- Polish: T046 ∥ T047 ∥ T048.

## Implementation Strategy

**MVP**: Phase 1–2 + US2 (header/mega-menyu): bütün sayt yeni font, token və naviqasiyanı alır.
Sonra US3 → US1/US5 → US4, hər biri ayrıca commit və ayrıca yoxlanılan addımdır. MR GitLab-a
`feature/022-figma-redesign`-dən dev mühitinə (manual) gedir. `test`-ə birləşmə istifadəçinin qərarıdır.
