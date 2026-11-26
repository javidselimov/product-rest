---
description: "Task list — 026 Tarix səhifəsinin interaktiv dizaynı (web-cbar-new)"
---

# Tasks: "Tarix" səhifəsinin interaktiv dizaynı

**Input**: `specs/026-history-interactive/` — [spec.md](./spec.md), [plan.md](./plan.md), [research.md](./research.md),
[data-model.md](./data-model.md), [contracts/cms-markup.md](./contracts/cms-markup.md),
[contracts/ui-contract.md](./contracts/ui-contract.md), [quickstart.md](./quickstart.md)

**Branch**: `feature/026-history-interactive`. Bütün yollar `product-rest/web-cbar-new/`-ə
nisbətəndir (əks qeyd olunmayıbsa).

**Sıra**: Setup (Figma təsdiqi) → Foundational (model) → US1 (MVP: kart + ox + düymələr) → US2,
US3, US4, US5, US6 → Polish. Hər phase **bir commit**-dir və `npm run verify` ilə bitir.

**Testlər**: W VI və quickstart §1 tələb edir. Model testləri saf funksiya testləridir.
Komponent testləri Testing Library + jsdom ilə yazılır, API mock yalnız MSW-dir.
`matchMedia`, `IntersectionObserver` və `scrollTo` jsdom-da stub-lanır.

**Hər UI task-dan əvvəl**: `ui-kit-usage` və `frontend-standards` skill-ləri. Figma dəyərləri
`figma_node` ilə **kiçik node-lardan** oxunur. Bridge `png` və sənəd üzrə (`page: "*"`) `find`-də
vaxt aşımına düşür və plugin-i ayırır (research R12).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: paralel icra oluna bilər (fərqli fayl, tamamlanmamış task-dan asılı deyil)
- **[Story]**: US1–US6 (spec.md)

---

## Phase 1: Setup — Figma təsdiqi (commit: `docs(specs): 026 figma measurements`)

**Purpose**: ui-contract-dakı **P** (prototip) dəyərlərini **F** (Figma) ilə əvəz etmək və ya
təsdiqləmək, tablet/mobil variant olub-olmadığını müəyyən etmək.

- [X] T001 `figma_health` ilə plugin-in qoşulduğunu yoxla. `figma_node 1845:119481 depth 6` (`tarix/Timeline`) ilə Card, Axis, Controls daxili elementlərini oxu: il, ghost, rail, hadisə tipoqrafiyası, foto ölçüləri, nöqtə (adi, keçilmiş, aktiv), etiket, düymə ölçüsü. Lazım olanda tək-tək `figma_css`. Nəticəni `specs/026-history-interactive/contracts/ui-contract.md` §2-də **P** → **F** kimi yenilə. Fərqlənən dəyərdə Figma qalib gəlir. Düymə 22×44-dürsə, ≥ 44×44 toxunma sahəsi (görünüş saxlanılır, klik sahəsi böyüdülür) qərarını ui-contract-a yaz. Hero → timeline aralığını (`1845:118772` → `Content row` itemSpacing 40) və tablet/mobil aralığını ui-contract §2 "Konteyner"-də təsdiqlə. 024-ün `gap-8 tab:gap-9`-undan fərqlənirsə, bunu FR-003 baxımından qəbul edilmiş fərq kimi `visual-diff.md`-yə yaz.
- [X] T002 `tarix/Timeline` komponentinin main component-ini və variantlarını tap: `figma_find` `query: "tarix/"` `page: "About us"`, `type: "COMPONENT_SET,COMPONENT"`. Mobil və tablet variantı / frame-i varsa, ölçülərini ui-contract §1–§2-yə əlavə et, yoxdursa §1-də "Figma-da yoxdur, prototip qaydası" qeydini saxla. Nəticəni `specs/026-history-interactive/research.md` R12-yə yaz.

---

## Phase 2: Foundational — model (commit: `feat(web-cbar-new): 026 history model`)

**Purpose**: Bütün story-lərin istifadə etdiyi data modeli (data-model §2–§3) və layout reyestri.

**⚠️ CRITICAL**: UI task-ları bu phase bitmədən başlamır.

- [X] T003 `src/features/about-content/model/types.ts`:
  - `PhotoLayout = 'single' | 'note' | 'hero2' | 'tall'` əlavə et.
  - `AboutImage`-ə `width?: number`, `height?: number` əlavə et.
  - `TimelineEvent` (`kind: 'event'`): `anchorId`-ni sil, `photoLayout: PhotoLayout | null` əlavə et, `card`-ı `boxed` adlandır (data-model §2).
  - `HistoryYear = { year: string; anchorId: string; items: TimelineEvent[] }` əlavə et.
  - `timeline` blokunu `{ kind: 'timeline'; years: HistoryYear[] }` et, `YearLink`-i sil.
- [X] T004 `src/features/about-content/model/parse.ts`:
  1. `imagesIn`: `width` / `height` atributlarını müsbət tam ədəd kimi oxusun (deyilsə `undefined`).
  2. `photoMarker(node)`: hücrə 2-nin yuxarı səviyyə `<p>`-sinin `textOf` nəticəsini
     `/^\[\s*foto\s*:\s*(single|note|hero2|tall)\s*\]$/i` ilə yoxlasın (data-model V2).
  3. `timelineEvent`-də tanınan işarə paraqraflarını `html`-dən çıxar. Birincisinin dəyəri
     düzülüş olsun. Tanınmayan işarə adi paraqraf kimi qalsın (V3).
  4. `autoPhotoLayout(images)`: research R4 cədvəli (1 → `single`, 2 → `note`, 3 → `tall` yalnız
     `images[0].height > images[0].width` olanda, əks halda `hero2`, 4+ → `hero2`).
  5. `photoLayout = images.length ? (işarə ?? auto) : null`.
  6. `boxed = highlighted || (images.length > 0 && photoLayout !== 'note')`.
  7. `groupByYear(events): HistoryYear[]` (R3: ilk rast gəlinmə sırası; `loose` əvvəlki hadisənin
     ilinə, ilk sətir ilsizdirsə birinci ilin əvvəlinə; `anchorId = year-{yyyy}`). `timeline()`
     `{ kind: 'timeline', years }` qaytarsın.
- [X] T005 `src/features/about-content/model/parse.test.ts`-i yenilə: mövcud history testlərini yeni bloka uyğunlaşdır. Əlavə et:
  - (a) işarə tanınır və HTML-dən çıxır;
  - (b) `[foto: xyz]` mətndə qalır, düzülüş avtomatik seçilir;
  - (c) avtomatik 1/2/3/4 şəkil, 3 şəkil + `width=600 height=900` → `tall`;
  - (d) şəkilsiz hadisədə işarə gizlənir, `photoLayout === null`;
  - (e) ardıcıl olmayan eyni il bir qrupa düşür;
  - (f) ilk sətir ilsiz → birinci ilə;
  - (g) `note` qutuda deyil, vurğulu `note` qutudadır;
  - (h) test mühitinin real "Tarix (Kopya)" cədvəli (fixture, aşağıda) heç bir başlığı itirmir, illər cədvəl sırası ilə gəlir.

  Fixture: `src/shared/testing/fixtures/about.ts`-ə `historyCopyHtml` (quickstart §0-dakı test sətri **daxil**, R3 riskini sənədləşdirir).
- [X] T006 [P] `src/features/about-content/model/layouts.ts` (FR-022, FR-022a):
  - `layoutFor(slug, locale)` dil üzrə reyestr olsun (research R2):
    - `az`: `haqqimizda`, `haqqimizda-copy` → `about-main`; `tarix`, `tarixi`, `tarix-copy` → `history`; `missiya-ve-deyerler`, `missiya-ve-deyerler-copy` → `mission`;
    - `en`: `about-us`, `about-us-copy` → `about-main`; `history`, `history-copy` → `history`; `mission-and-values`, `mission-and-values-copy` → `mission`.
  - Fayl başı şərhini yenilə.
  - `src/views/cms-page/loader.ts:77-78`-də `layoutFor(page.slug, locale)` işlət, bir dəfə hesabla.
- [X] T007 [P] `src/features/about-content/model/layouts.test.ts` (YENİ): az `tarix` → `history`; az `history-copy` → `plain` (yəni "Haqqımızda (Kopya)" timeline almır); en `history-copy` → `history`; en `tarix` → `plain`; naməlum slug → `plain`.

**Checkpoint**: `npm run typecheck` yalnız `widgets/about-blocks`-da (köhnə `Timeline` / `YearNav`) xəta verir. Onlar US1-də əvəz olunur. Model testləri yaşıldır.

---

## Phase 3: User Story 1 — Tarixi il-il vərəqləmək (P1) 🎯 MVP (commit: `feat(web-cbar-new): 026 history stepper`)

**Goal**: Bir ilin kartı, ox, əvvəlki/növbəti. Server bütün panelləri render edir, client
island aktiv ili idarə edir.

**Independent Test**: `/az/tarix-copy` (`npm run local:testcbar`) → quickstart §2 addım 1–3.
Oxda il kliki və "Növbəti" düyməsi kartı dəyişir, sərhəddə düymə deaktivdir.

### Tests for User Story 1

- [X] T008 [P] [US1] `src/widgets/about-blocks/history-stepper.test.tsx` (YENİ). Fixture: 3 il, birində 2 hadisə. Yoxla:
  - ilkin halda birinci panel `data-active`-dir, digərləri deyil;
  - "Növbəti il" → ikinci panel aktiv olur, ox nöqtəsində `aria-current="step"` var, birinci nöqtə "keçilmiş" (`data-done`) olur;
  - birinci ildə "Əvvəlki il" `disabled`-dir, sonuncuda "Növbəti il" `disabled`-dir;
  - ox linkinə klik `preventDefault` edir və ili dəyişir;
  - bir il olanda ox və düymələr render olunmur;
  - irəliləmə xəttində `--tl-progress` dəyişir;
  - FR-007a: "Növbəti il" düyməsinin `getBoundingClientRect` stub-ı klikdən əvvəl `top: 900`, sonra `top: 700` qaytarır → `window.scrollY` 200 azalır (jsdom-da `window.scrollBy` real deyil, ona görə nəticə `scrollY` / `scrollTo` vəziyyəti ilə yoxlanılır, spy çağırışı ilə yox).

  Əvvəlcə qırmızı olmalıdır.

### Implementation for User Story 1

- [X] T009 [P] [US1] `src/app/globals.css`:
  - 024-ün `--site-*` blokuna `--site-history-card-from: var(--ui-color-brand-700)`, `--site-history-card-to: var(--ui-color-brand-500)`, `--site-history-accent: var(--ui-color-secondary-500)`, `--site-history-track: var(--ui-color-neutral-200)`, `--site-history-photo: var(--ui-color-brand-700)` əlavə et. Şərhlərdə prototip hex-i olsun (research R11). `@theme`-də `--color-site-history-*` qarşılıqlarını əlavə et.
  - `@custom-variant js (@media (scripting: enabled));` və `@custom-variant no-js (@media (scripting: none));` əlavə et (research R5).
- [X] T010 [P] [US1] `src/locales/az/about.json` və `src/locales/en/about.json` → `history` altına `prev`, `next`, `zoom`, `zoomWithAlt` (ui-contract §4). `npm run setup:check` i18n açarlarının paritetini yoxlayır.
- [X] T011 [P] [US1] `src/widgets/about-blocks/history-rings.tsx` (YENİ, server): 360×360 SVG, 6 konsentrik dairə (r 55 / 84 / 113 / 142 / 171 + prototipdəki qalanı, `tarix.html` `.vis svg`). `stroke` `currentColor` (`text-site-history-accent`), şəffaflıq azalan, `aria-hidden`, `focusable="false"`. Yalnız `desk:`-də görünür.
- [X] T012 [P] [US1] `src/widgets/about-blocks/history-photos.tsx` (YENİ, server): `{ images, layout }`. 4 düzülüş ui-contract §2 "Foto" cədvəli ilə (CSS grid, `aspect-*`, gap 8, r4, `object-fit: cover`, fon `bg-site-history-photo`). Hər şəkil `<a href={src} target="_blank" rel="noopener" data-zoom aria-label={t('history.zoomWithAlt' | 'history.zoom')}>` içində `<img loading="lazy" decoding="async">` olsun (eslint `@next/next/no-img-element` istisnası 024 kimi, CMS media).
- [X] T013 [US1] `src/widgets/about-blocks/history-year-panel.tsx` (YENİ, server): `{ year: HistoryYear }`. Kart ui-contract §2 "Kart" və "Hadisə" cədvəlləri ilə qurulur:
  - fon `bg-linear-to-r from-site-history-card-from to-site-history-card-to`;
  - ghost il `aria-hidden`;
  - il `h3` deyil, `<p>`: başlıq iyerarxiyası hadisə `h3`-ləri üçündür;
  - hadisələr `<ol>` olsun. ≥ 2 elementdə rail göstərilir, sonuncu elementdə xətt yoxdur;
  - `boxed` olan hadisə qutuda olsun;
  - `loose` element markersiz `CmsContent` kimi göstərilsin;
  - hadisə mətni `CmsContent variant="about"` ilə verilsin, tünd fon üçün `className` override-ları: ağ 80%, 14/400 lh28, linklər `text-site-history-accent`;
  - şəkillər üçün `HistoryPhotos`;
  - sağda `HistoryRings`.
- [X] T014 [US1] `src/widgets/about-blocks/history-stepper.tsx` (YENİ, `'use client'`): props `{ years: { year: string; anchorId: string }[]; panels: ReactNode[]; labels: { nav, prev, next } }` (labels server-də `getT` ilə hazırlanır, client i18n init lazım deyil).
  - `useState(index = 0)`.
  - Panelləri `<div data-panel id={anchorId} data-active={i === index || undefined}>` ilə sarı. Class: `js:not-data-active:hidden print:block`.
  - Kart sahəsi `aria-live` (US3-də aktivləşir, hələlik `off`).
  - Ox: `<nav aria-label>` → `<ol>` → `<a href="#{anchorId}">`. Nöqtə, etiket, `aria-current="step"`, `data-done` (ui-contract "İl oxu"). Mövqe `left: calc(p + (100% − 2p) · i/(N−1))`, minimal en `(N−1)·56 + 2p` (R10). Trek + irəliləmə `--tl-progress`.
  - Linkə klik `preventDefault` + `setIndex(i)`.
  - Düymələr: `<button type="button" aria-label disabled>`, `no-js:hidden`. İkonlar: `import { ChevronLeftIcon, ChevronRightIcon } from '@cbar/lib-react-ui-kit/icons'` (layihədə artıq belə işlədilir). `lucide-react`-i birbaşa import etmə, çünki layihənin asılılığı deyil (W II).
  - FR-007a / research R10a: düymə və ya nöqtə klikində kliklənən elementin `getBoundingClientRect().top`-unu ref-də saxla. `useLayoutEffect`-də (`index` dəyişəndən sonra) `window.scrollBy(0, yeniTop − köhnəTop)` et. Avtomatik keçiddə və swipe-da etmə.
  - `N === 1` → yalnız panel.
  - Keçid solması: aktiv panelə `motion-safe:animate-[history-fade_400ms_ease]`. `@keyframes` `globals.css`-dədir.
- [X] T015 [US1] `src/widgets/about-blocks/history-timeline.tsx` (YENİ, server): `{ block: timeline, locale }` → `getT(locale, 'about')`, `panels = years.map(y => <HistoryYearPanel …/>)`, `<HistoryStepper …/>`. Konteyner aralıqları ui-contract §2 "Konteyner" ilə (36 / 32 / 24).
- [X] T016 [US1] `src/widgets/about-blocks/about-blocks.tsx`:
  - `HistoryTimeline` (köhnə daxili funksiya) və `YearNav` importunu çıxar, `timeline` → `<HistoryTimeline>`.
  - Hero → timeline aralığı desk-də 40 olsun (024-ün `desk:-mt-9`-u silinir; ümumi `gap-8 tab:gap-9`-a nisbətən düzəliş ui-contract-a görə).
  - Fayl başı şərhlərini yenilə.
- [X] T017 [US1] Köhnə görünüşü sil (FR-021):
  - `src/widgets/about-blocks/timeline.tsx`, `timeline-motion.tsx`, `timeline-motion.test.tsx`, `year-nav.tsx`, `year-nav-spy.tsx`;
  - onlara aid `globals.css` qaydaları (`--tl-fill`, `site-year-active-*` — başqa yerdə istifadə olunmursa, `grep` ilə yoxla).
- [X] T018 [US1] `src/widgets/about-blocks/about-blocks.test.tsx`-i yenilə. `timeline` bloku `HistoryTimeline` ilə render olunur, bütün illərin başlıqları DOM-dadır (JS-siz məzmun), ox linkləri `#year-…`-dir. T008 yaşıl olmalıdır. Sonra `npm run verify`.

**Checkpoint**: MVP: il-il vərəqləmə işləyir. JS-siz rejimdə hamısı alt-alta görünür (US6-nın əsası artıq buradadır).

---

## Phase 4: User Story 2 — Müəyyən ilə birbaşa keçid (P1) (commit: `feat(web-cbar-new): 026 history year hash`)

**Goal**: `#1992` / `#year-1992` ilə açılış, il dəyişəndə `replaceState`.

**Independent Test**: quickstart §2 addım 2, 4, 5, həmçinin "geri" düyməsi (addım 3).

- [X] T019 [P] [US2] `history-stepper.test.tsx`-ə əlavə et:
  - `location.hash = '#1992'` → mount-dan sonra 1992 aktivdir;
  - `#year-1992` → eyni nəticə;
  - `#1850` → birinci il;
  - il dəyişəndə `location.hash === '#1993'` olur, `history.length` artmır (nəticə yoxlanılır, `replaceState` spy-ı yox, W VI.2);
  - timeline-a aid olmayan hash-ə (`#main`) toxunulmur və o, avtomatik keçidi söndürmür (US4 testində də yoxlanılır).
- [X] T020 [US2] `src/widgets/about-blocks/history-stepper.tsx`:
  - mount effektində `location.hash`-i oxu (`/^#(?:year-)?(\d{4})$/`, yalnız `years`-də olan il).
  - `index` dəyişəndə (ilk mount-dakı hash-li hal istisna, artıq doğrudur) `history.replaceState(null, '', '#' + year)`.
  - Mount effekti `hashFromUrl: boolean` ref-i qaytarsın (US4 avtomatik keçid şərti üçün). `true` **yalnız** hash `years`-dəki ili göstərəndə olur. `#1850`, `#main` → `false` (spec FR-014, research R6).

**Checkpoint**: Paylaşılan link həmin ili açır, köhnə 024 linkləri işləyir.

---

## Phase 5: User Story 3 — Klaviatura, toxunma, əlçatanlıq (P2) (commit: `feat(web-cbar-new): 026 history keyboard and swipe`)

**Goal**: ←/→, swipe, oxun aktiv ili ortaya gətirməsi, `aria-live`.

**Independent Test**: quickstart §2 addım 9 və 14. Ekran oxuyucusu il dəyişikliyini elan edir.

- [X] T021 [P] [US3] `history-stepper.test.tsx`-ə əlavə et:
  - `ArrowRight` / `ArrowLeft` ili dəyişir;
  - fokus `<input>`-dadırsa, `Alt` / `Ctrl` / `Meta` basılıbsa və ya `[role=dialog]` açıqdırsa dəyişmir;
  - `touchstart` / `touchend` `dx = −80, dy = 10` → növbəti il; `dx = −80, dy = 120` → dəyişmir; `dx = −30` → dəyişmir;
  - istifadəçi keçidindən sonra kart sahəsi `aria-live="polite"`, ondan əvvəl `off`.
- [X] T022 [US3] `src/widgets/about-blocks/history-stepper.tsx`:
  - `document` `keydown` dinləyicisi (research R9 istisnaları). ←/→ ilə keçiddə FR-007a kompensasiyası fokuslu element üçün tətbiq olunur (fokus ox / düymədədirsə);
  - kart sahəsində passive `touchstart` / `touchend` (`|dx| > 50 && |dx| > |dy|`);
  - `announce` state (data-model §4);
  - ox konteyneri `overflow-x-auto` + gizli scrollbar. `index` dəyişəndə aktiv nöqtəni `scrollTo({ left, behavior })` ilə ortaya gətir: reduced-motion-da `auto`, əks halda `smooth`, səhifəni şaquli sürüşdürmədən (024 `revealHorizontally` nümunəsi).
  - Fokus halqası: link və düymələrdə kitin `focus-visible:ring` class-ları.

**Checkpoint**: Klaviatura və toxunma ilə tam idarə.

---

## Phase 6: User Story 4 — Avtomatik keçid (P2) (commit: `feat(web-cbar-new): 026 history autoplay`)

**Goal**: 5 s interval, research R7 başlamama və dayanma şərtləri.

**Independent Test**: quickstart §2 addım 6–8.

- [X] T023 [P] [US4] `history-stepper.test.tsx`-ə `vi.useFakeTimers` ilə əlavə et (`IntersectionObserver` stub-ı timeline-ı "görünən" bildirir):
  - 5000 ms → ikinci il; 10000 → üçüncü;
  - sonuncu ildə dayanır;
  - `prefers-reduced-motion: reduce` → başlamır;
  - hash ilə açılış → başlamır;
  - düymə kliki, `keydown` (←/→), swipe, `touchstart` → dayandırmır, sayğac sıfırlanır (FR-015);
  - `pointerenter` (kart) → fasilə, `pointerleave` → davam (FR-015b); lightbox açıq → fasilə;
  - klaviatura fokusu timeline içində → fasilə, çıxanda → davam; siçan klikinin fokusu → fasilə yox (FR-015a);
  - istifadəçi keçidi elan olunur, ardınca gələn avtomatik keçid yox (FR-015c);
  - hündür timeline-ın viewport-un yarısı qədər görünməsi kifayətdir, dörddə biri yox (FR-014a);
  - timeline görünmür (observer `isIntersecting: false`) → il dəyişmir;
  - `document.visibilityState === 'hidden'` → il dəyişmir;
  - avtomatik keçiddə `aria-live` `off` qalır.
- [X] T024 [US4] `src/widgets/about-blocks/history-stepper.tsx`:
  - `pauses: Set<'hover' | 'focus' | 'zoom'>` ref-i + `cycle` state-i (data-model §4 keçid diaqramı); `openedWithYear` mount-da bir dəfə oxunur.
  - `setInterval(5000)` yalnız `running`-də işləyir. Hər "tik"də `visible` ref-i (IntersectionObserver, 0…1 hədlər, pay `isVisibleEnough`-da viewport-a görə) və `document.visibilityState` yoxlanır.
  - İstifadəçi keçidi (`go`) `cycle`-ı artırsın — interval yenidən qurulsun (FR-015). Lightbox açılması `zoom` fasiləsini US5-də əlavə edir.
  - Effekt cleanup-ı interval-ı və observer-i təmizləsin.
  - Fayl şərhində qəbul edilmiş WCAG 2.2.2 sapmasını göstər (plan Complexity Tracking).

**Checkpoint**: Hekayə özü oynayır və ilk toxunuşda dayanır.

---

## Phase 7: User Story 5 — Şəkilləri böyütmək (P3) (commit: `feat(web-cbar-new): 026 history lightbox`)

**Goal**: Kit `Dialog` ilə lightbox.

**Independent Test**: quickstart §2 addım 10.

- [X] T025 [P] [US5] `history-stepper.test.tsx`-ə əlavə et:
  - `[data-zoom]` linkinə klik `preventDefault` edir, dialog açılır, `img`-in `src` / `alt`-ı linkdəkidir, `DialogTitle` alt mətnidir;
  - Escape bağlayır, fokus linkə qayıdır;
  - açıq dialogda `ArrowRight` ili dəyişmir;
  - dialog açılması avtomatik keçidi dayandırır.
- [X] T026 [US5] `src/widgets/about-blocks/history-stepper.tsx`:
  - kart sahəsində `click` hadisəsini `closest('a[data-zoom]')` ilə tut. Modifikatorlu klik (`ctrl` / `meta` / orta düymə) brauzerə buraxılır.
  - `zoom` state (`{ src, alt }`).
  - `@cbar/lib-react-ui-kit/dialog`-dan `Dialog`, `DialogContent`, `DialogTitle` (`sr-only`). Görünüş ui-contract "Lightbox" ilə, `image-popup-dialog.tsx`-in `CONTENT_CLASS` nümunəsinə bax.
  - Açılanda `stop()`.

**Checkpoint**: Şəkillər böyüdülür.

---

## Phase 8: User Story 6 — Skriptsiz, axtarış sistemi və çap (P2) (commit: `feat(web-cbar-new): 026 history no-js and print`)

**Goal**: US1-də qoyulmuş JS-siz əsası tamamlamaq və yoxlamaq. Burada çap qaydası və
`no-js` görünüşü işlənir.

**Independent Test**: quickstart §2 addım 11–13.

- [X] T027 [P] [US6] `src/app/globals.css` → `@media print` (024 çap bloku):
  - `[data-panel]` hamısı görünsün;
  - ox (`nav` timeline içində), düymələr, ghost il və `HistoryRings` gizlənsin (`data-print="hide"`, 024 atributu);
  - kart fonu ağ, mətn `foreground` olsun;
  - şəkillər səhifə qırılmasında bölünməsin (`break-inside: avoid`).
- [X] T028 [US6] `history-year-panel.tsx` / `history-stepper.tsx`: `no-js` görünüşü. Panellər arası aralıq 24, ox lövbər linkləri panelə `scroll-mt-6` ilə sürüşdürür, düymələr gizlidir. `history-stepper.test.tsx`-də SSR markup-ını (`renderToString`) yoxla: bütün panellər markup-dadır, yalnız birincidə `data-active` var.
- [ ] T029 [US6] Manual: quickstart §2 addım 11 (DevTools → JavaScript söndür), 12 (`view-source:`), 13 (çap önizləməsi). Nəticəni `specs/026-history-interactive/visual-diff.md`-yə qısa qeyd kimi yaz.

**Checkpoint**: Məzmun JS-siz, robot və çap üçün tamdır.

---

## Phase 9: Polish (commit: `docs: 026 history interactive wrap-up`)

- [X] T030 [P] `specs/024-about-us-redesign/contracts/cms-markup.md` §3: `specs/026-history-interactive/contracts/cms-markup.md`-dəki əvəz olunan sətirləri və "Foto düzülüşü" / "Redaktorun düzülüş işarəsi" bölmələrini köçür, 026-ya istinad əlavə et.
- [X] T031 [P] `docs/about-cms-guide.md` §2 "Tarix": redaktor dili ilə yeni görünüşü, 4 düzülüşü (sxematik təsvir), `[foto: …]` işarəsini, ilsiz sətrin hansı ilə düşdüyünü və sınaq sətirlərinin oxu pozduğunu (R3) izah et.
- [ ] T032 Vizual tutuşdurma (quickstart §3): 1728 / 1024 / 744 / 390 enlərində `getBoundingClientRect` ilə ui-contract dəyərlərini (±2 px, SC-003) və `scrollWidth === innerWidth`-i (SC-004) yoxla. SC-006: DevTools Performance ilə "Növbəti il" klikindən yeni panelin çəkilməsinə qədər olan müddət < 300 ms. 024 görünüşü ilə (`git stash` və ya əvvəlki commit) müqayisədə LCP 100 ms-dən çox artmır. FR-007a: ardıcıl 5 "Növbəti" klikində düymə yerindən tərpənmir. Fərqləri `specs/026-history-interactive/visual-diff.md`-yə yaz (024 `visual-diff.md` formatı ilə).
- [ ] T033 [P] Admin roundtrip (quickstart §1): `cd product-rest/web-cbar-admin-new && npm run roundtrip -- "Tarix (Kopya)"` (redaktor quickstart §0-dakı işarəni qoyduqdan sonra). Fərq çıxsa, işi dayandır və istifadəçiyə bildir: ayrıca admin MR lazımdır (spec, WS II.3).
- [X] T034 Node 22 testi: `npx -y node@22 node_modules/vitest/vitest.mjs run src/features/about-content src/widgets/about-blocks`. Sonra son `npm run verify`.
- [ ] T035 quickstart §2-nin bütün addımları (1–17) və §4 redaktor ssenarisi test mühitində. SC-005: Chrome Lighthouse → Accessibility `/az/tarix-copy` üçün 024 görünüşü ilə müqayisədə yeni xəta yoxdur. Yalnız klaviatura ilə bütün funksiyaları keç. Nəticəni `specs/026-history-interactive/checklists/requirements.md` Notes bölməsinə yaz.

---

## Dependencies & Execution Order

```text
Setup (T001–T002) ──▶ Foundational (T003–T007) ──▶ US1 (T008–T018) ──┬─▶ US2 (T019–T020) ─┐
                                                                     ├─▶ US3 (T021–T022) ─┤
                                                                     ├─▶ US6 (T027–T029) ─┼─▶ Polish (T030–T035)
                                                                     └─▶ US4 (T023–T024) ─▶ US5 (T025–T026) ─┘
```

- **Setup → US1**: ui-contract dəyərləri UI yazılmazdan əvvəl təsdiqlənir. Setup model işini
  (Foundational) bloklamır, ikisi paralel gedə bilər.
- **US2, US3, US4, US5** eyni faylı (`history-stepper.tsx`) dəyişir, ona görə **ardıcıl**
  gedir. Tövsiyə olunan sıra: US2 → US3 → US4 → US5. US4 hash ref-indən (US2), US5 `stop()`-dan
  (US4) istifadə edir.
- **US6** əsasən CSS və manual yoxlamadır, US1-dən sonra istənilən vaxt gedə bilər.

## Parallel Opportunities

- **Setup ∥ Foundational**: T001–T002 (Figma, sənəd) ∥ T003–T007 (kod).
- **Foundational daxilində**: T006 + T007 (layouts) ∥ T003 → T004 → T005 (parse).
- **US1 daxilində**: T008 (test), T009 (css), T010 (i18n), T011 (rings), T012 (photos) paraleldir. T013 → T014 → T015 → T016 → T017 → T018 ardıcıldır.
- **Hər story-nin test task-ı** ([P]) implementasiyadan əvvəl yazılır, digər story-nin test faylına toxunmur. Hamısı eyni faylda olduğu üçün `describe` blokları ayrıdır.
- **Polish**: T030, T031, T033 paraleldir.

## Implementation Strategy

1. **MVP = Setup + Foundational + US1**: test mühitində `/az/tarix-copy` yeni kart və oxla
   işləyir, JS-siz rejimdə tam məzmun görünür. Bu nöqtədə istifadəçiyə göstərib dizayn rəyi
   almaq olar (Figma ilə ilk tutuşdurma).
2. **US2 + US3**: paylaşma və əlçatanlıq. Production-a çıxmazdan əvvəl məcburidir.
3. **US4 + US5**: prototipin "canlı" davranışı.
4. **US6 + Polish**: çap, sənədlər, redaktor bələdçisi, vizual fərq hesabatı.

Hər phase ayrıca commit-dir. Push və MR yalnız istifadəçi istəyəndə edilir (deploy GitLab-dadır).
