# Implementation Plan: "Tarix" səhifəsinin interaktiv dizaynı

**Branch**: `026-history-interactive` | **Date**: 2026-10-22 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/026-history-interactive/spec.md`

## Summary

024-ün şaquli Tarix timeline-ı və yan il naviqasiyası Figma `1845:118772` / `tarix.html`
prototipinə uyğun **interaktiv il kartı + üfüqi il oxu** ilə əvəz olunur. Məlumat mənbəyi
dəyişmir: CMS cədvəli 024 parser-i ilə oxunur. Onun üstünə iki şey əlavə olunur: il üzrə
qruplaşdırma və foto düzülüşü (avtomatik + redaktorun `[foto: …]` işarəsi).

Bütün illər serverdə render olunur. Kiçik bir client island (`HistoryStepper`) aktiv ili,
düymələri, klaviaturanı, swipe-ı, hash-i, avtomatik keçidi və lightbox-u idarə edir.
Qeyri-aktiv panellər yalnız `@media (scripting: enabled)` daxilində gizlənir, ona görə JS-siz,
axtarış robotu və çap rejimində hər şey görünür.

Yol üstündə test mühitində tapılmış slug problemi də həll olunur: layout reyestri dilə görə
ayrılır, az əsas səhifəsinin slug-ı `tarix` əlavə edilir. Yalnız `web-cbar-new` dəyişir, bir MR.

## Technical Context

**Language/Version**: TypeScript 5 (strict), Node 24 lokal / Node 22 CI

**Primary Dependencies**: Next.js 16 App Router, React 19, `@cbar/lib-react-ui-kit` (`Dialog`),
Tailwind 4, react-i18next. **Yeni dependency yoxdur.**

**Storage**: Yoxdur. Məzmun `api-cbar` `GET /api/v1/pages/{slug}`-dən gəlir (dəyişmir, keşsiz).

**Testing**: Vitest + Testing Library + MSW (jsdom). `vi.useFakeTimers` avtomatik keçid üçün.
Admin: `npm run roundtrip`.

**Target Platform**: Müasir brauzerlər. `@media (scripting)` dəstəklənməyən köhnə brauzerdə
bütün illər görünür, bu da zərərsiz fallback-dır (research R5).

**Project Type**: SSR web app (FSD), bir proyekt: `product-rest/web-cbar-new`.

**Performance Goals**: İl keçidi < 300 ms (SC-006). Client island kiçikdir (yalnız state,
dinləyicilər, kit `Dialog`). Panel HTML-i JSON kimi ikiqat ötürülmür.

**Constraints**: JS-siz tam məzmun (FR-017). CLS yoxdur: hydration-dan əvvəl və sonra eyni panel
görünür. `dangerouslySetInnerHTML` yalnız `CmsContent`-dədir. Nonce CSP-yə toxunulmur, yeni
inline skript yoxdur.

**Scale/Scope**: 1 layout, ~17–30 il, 4 slug (2 dil × əsas və kopya). 7 yeni / 5 silinən fayl
(aşağıda).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Workspace konstitusiyası (**WS**) və web-cbar-new konstitusiyası (**W**).

| Maddə | Yoxlama | Status |
|---|---|---|
| WS I.2 `product-host` referansı | Spec `PagesController::actionIndex`, `views/pages/*`-ı göstərir | ✅ |
| WS I.3 səssiz itki yoxdur | Hər sətir hansısa ilin kartına düşür (R3). Tanınmayan işarə mətn kimi qalır (V3). JS-siz və çapda hamısı görünür | ✅ |
| WS I.5 informasiya arxitekturası | URL-lər eynidir. 024 lövbərləri (`#year-yyyy`) işləməyə davam edir | ✅ |
| WS II.3 çox proyekt | Yalnız `web-cbar-new`. Admin panelində kod dəyişikliyi yoxdur, işarə adi mətndir (R4), roundtrip yalnız icra olunur | ✅ |
| WS V.4 redaksiya mətni API-dən | Bütün tarix mətni CMS-dəndir. Kodda yalnız chrome etiketləri var (`about.json`) | ✅ |
| WS VII.2 public URL-lər | Dəyişmir | ✅ |
| WS VIII icra ilə verification | quickstart: `verify`, Node 22, `local:testcbar`, roundtrip, Figma ölçüsü | ✅ |
| W I.2 hardcoded string yoxdur | Yeni etiketlər `locales/{az,en}/about.json` → `history.*` | ✅ |
| W II yeni dependency | Yoxdur. Lightbox kit `Dialog`-udur, swipe və avtomatik keçid öz kodudur | ✅ |
| W III.1 kit control-ları | `Dialog` kitdəndir. Ox və düymələr adi `<a>` / `<button>`-dur (kitdə timeline control-u yoxdur, 024 il çipləri ilə eyni yanaşma) | ✅ |
| W III.3 yalnız semantik rəng | Komponentlərdə hex yoxdur. `--site-history-*` token-ləri kit primitivlərinə bağlıdır (R11) | ✅ |
| W IV FSD | `features/about-content/model` → `widgets/about-blocks` → `views/cms-page`. Import yalnız aşağıya | ✅ |
| W V state | `index` / `autoplay` lokal `useState`-dir. Törəmə dəyərlər hesablanır. Hash: aşağıdakı Complexity Tracking-ə bax | ⚠️ əsaslandırılıb |
| W VI test | Parser və model üçün saf funksiya testləri, `HistoryStepper` üçün komponent testləri. API mock yalnız MSW ilə | ✅ |
| W VII.4 vəziyyətlər | data-model §5 | ✅ |
| W X.1 XSS | Yeni `dangerouslySetInnerHTML` yoxdur. Fraqmentlər `CmsContent`-dən keçir. Şəkil `src` `safeImageSrc` ilə yoxlanılır. Lightbox yalnız artıq yoxlanmış `src`-ni işlədir | ✅ |
| W XI.1 `'use client'` ən aşağıda | Yalnız `HistoryStepper`. Panel məzmunu server komponentidir və client-ə `ReactNode` kimi ötürülür | ✅ |
| W XI.4 `window` / `document` | Yalnız effekt və hadisə dinləyicilərində | ✅ |
| W XI.5 hydration mismatch | SSR və ilk client render eyni `index = 0` ilə gedir. Hash effektdə oxunur | ✅ |

**Gate nəticəsi**: keçir. İki əsaslandırılmış sapma var (Complexity Tracking).

**Post-design re-check**: [data-model.md](./data-model.md), [contracts/cms-markup.md](./contracts/cms-markup.md),
[contracts/ui-contract.md](./contracts/ui-contract.md) yuxarıdakı cədvələ uyğundur. Dizayn
zamanı yeni pozuntu yaranmayıb. Rənglər kit token-lərinə bağlanıb (R11).

## Project Structure

### Documentation (this feature)

```text
specs/026-history-interactive/
├── spec.md
├── plan.md              # bu fayl
├── research.md          # R1–R12
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── cms-markup.md    # 024 §3-ə əlavə (foto düzülüşü, [foto: …] işarəsi)
│   └── ui-contract.md   # ölçülər, a11y, i18n açarları, çap
├── checklists/requirements.md
└── tasks.md             # /speckit-tasks
```

### Source Code (`product-rest/web-cbar-new`)

```text
src/
├── app/globals.css                                   # DƏYİŞİR: --site-history-* token-ləri,
│                                                     #   @custom-variant js / no-js (scripting), çap qaydası
├── locales/{az,en}/about.json                        # DƏYİŞİR: history.prev/next/zoom/zoomWithAlt
├── features/about-content/model/
│   ├── types.ts                                      # DƏYİŞİR: PhotoLayout, HistoryYear, timeline bloku
│   ├── parse.ts                                      # DƏYİŞİR: photoLayout + işarə, groupByYear
│   ├── parse.test.ts                                 # DƏYİŞİR
│   ├── layouts.ts                                    # DƏYİŞİR: layoutFor(slug, locale)
│   └── layouts.test.ts                               # YENİ
├── views/cms-page/loader.ts                          # DƏYİŞİR: layoutFor(page.slug, locale)
└── widgets/about-blocks/
    ├── about-blocks.tsx                              # DƏYİŞİR: timeline → <HistoryTimeline>
    ├── about-blocks.test.tsx                         # DƏYİŞİR
    ├── history-timeline.tsx                          # YENİ (server): panelləri qurur, Stepper-ə ötürür
    ├── history-year-panel.tsx                        # YENİ (server): il, ghost, hadisələr, rail, qutu
    ├── history-photos.tsx                            # YENİ (server): 4 düzülüş, <a href> içində şəkil
    ├── history-rings.tsx                             # YENİ (server): dekorativ SVG
    ├── history-stepper.tsx                           # YENİ ('use client'): state, ox, düymələr, hash,
    │                                                 #   klaviatura, swipe, avtomatik keçid, lightbox
    ├── history-stepper.test.tsx                      # YENİ
    ├── timeline.tsx                                  # SİLİNİR (FR-021)
    ├── timeline-motion.tsx, timeline-motion.test.tsx # SİLİNİR
    ├── year-nav.tsx, year-nav-spy.tsx                # SİLİNİR
    └── history-hero.tsx                              # dəyişmir

docs/about-cms-guide.md                               # DƏYİŞİR: foto düzülüşü və işarə (redaktor üçün)
specs/024-about-us-redesign/contracts/cms-markup.md   # DƏYİŞİR: §3-ə 026 əlavəsi köçürülür
```

**Structure Decision**: Mövcud 024 FSD yerləşimi saxlanılır. Model `features/about-content`-də,
görünüş `widgets/about-blocks`-da qalır. Yeni slice yaradılmır. Tarix bloku yalnız
`AboutBlocks`-dan istifadə olunur.

## Mərhələlər (hər biri ayrıca commit, sonunda `npm run verify`)

1. **Model**: `types.ts` (`PhotoLayout`, `HistoryYear`, `AboutImage.width/height`),
   `parse.ts`: işarə paraqrafı (V2/V3), avtomatik düzülüş (R4), `groupByYear` (R3). Bunlara
   `layoutFor(slug, locale)` və loader çağırışı da daxildir. Testlər: V1–V5, test mühitinin
   real cədvəli fixture kimi.
2. **Statik görünüş (JS-siz)**: `HistoryTimeline`, `HistoryYearPanel`, `HistoryPhotos`,
   `HistoryRings`. Ox server-də lövbər linkləri kimi render olunur. `globals.css`-ə token-lər,
   `js` / `no-js` variantları və çap qaydası əlavə olunur. Köhnə `Timeline`, `YearNav` və
   `TimelineMotion` silinir. Bu mərhələdən sonra səhifə JS-siz tam işləyir (US6).
3. **Stepper**: aktiv il, ox (`aria-current`, irəliləmə), düymələr, ←/→, swipe, hash (R6, R9, R10).
4. **Avtomatik keçid və lightbox**: R7, R8.
5. **Figma təsdiqi və responsiv**: bridge ilə `tarix/Timeline` dərinlik 6 ilə ölçülür, tablet
   və mobil frame axtarılır (səhifə üzrə). `ui-contract.md` yenilənir. 1728, 744 və 390
   enlərində tutuşdurulur, nəticə `visual-diff.md`-yə yazılır.
6. **Sənədlər və redaktor yoxlaması**: 024 kontraktına əlavə, `about-cms-guide.md`,
   admin `npm run roundtrip`, quickstart §2 və §4.

## Complexity Tracking

| Sapma | Niyə lazımdır | Rədd edilən sadə alternativ |
|---|---|---|
| **WCAG 2.2.2** (Pause, Stop, Hide): avtomatik keçiddə görünən "dayandır" düyməsi yoxdur | Clarification Q2 → C: dizayn və prototip sahibinin qərarı. Risk azaldılır: reduced-motion, hash, görünürlük şərti, ilk müdaxilədə (fokus daxil olmaqla) həmişəlik dayanma, sonuncu ildə dayanma, avtomatik keçiddə `aria-live` söndürülür (R7, R9) | Görünən düymə (Q2-A) və ya avtomatik keçidi çıxarmaq (Q2-B). İstifadəçi rədd edib |
| **W V URL state**: aktiv il `searchParams` yox, URL fraqmentindədir (`#1992`, `replaceState`) | Fraqment serverə getmir, bu lokal UI state-in paylaşıla bilən əksidir. `searchParams` hər keçiddə keşsiz SSR sorğusu yaradardı (R6) | `?year=` searchParam: sürətli vərəqləmədə hər klik tam server render olardı |
