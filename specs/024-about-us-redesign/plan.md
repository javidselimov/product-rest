# Implementation Plan: "Haqqımızda" bölməsinin Figma dizaynına keçidi

**Branch**: `feature/024-about-us-redesign` | **Date**: 2026-10-14 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/024-about-us-redesign/spec.md`

## Summary

`web-cbar-new`-də "Haqqımızda" ağacının bütün səhifələri (CMS səhifələri, İdarə Heyəti,
Rəhbərlik, bio, struktur bölmələr, ərazi idarələr) Figma "About us" dizaynına keçir. Backend və
admin panel dəyişmir.

Əsas texniki qərarlar ([research.md](./research.md)):

- **Markup kontraktı** yalnız TipTap-ın qoruduğu elementlərdən qurulur: `table`, `blockquote`,
  `details`, başlıqlar, "yalnız qalın" paraqraf, `img`. `class` / `data-*` işlədilmir, çünki
  redaktor onları silir. Kontrakt: [contracts/cms-markup.md](./contracts/cms-markup.md). (R1)
- **Layout slug ilə seçilir**: `haqqimizda`/`about-us` → `about-main`, `tarixi`/`history` →
  `history`, `missiya-ve-deyerler`/`mission-and-values` → `mission`, `-copy` variantları daxil.
  Qalanı `plain`. (R2)
- **DOM-suz tokenizer** (`shared/lib/html-blocks.ts`): yeni dependency yoxdur. Uğursuzluq
  olanda `plain` fallback işləyir. Sanitizasiya bölmədən əvvəl bir dəfə edilir, fraqmentlər
  yenə yalnız `CmsContent` ilə render olunur. (R3, R4)
- **Ümumi şablon** yeni `widgets/about-shell`-dir: breadcrumb, paylaşma, menyu. Digər
  bölmələrin `SectionSidebar`-ı dəyişmir. (R5–R7)
- Tarix il naviqasiyası serverdə lövbər linkləridir. Aktiv il kiçik client spy ilə izlənir. (R8)
- İdarə Heyəti üçün Figma `1189:15956` seçilib, "Sədr" və "Sədr müavinləri" başlıqları
  `sr-only` qalır. (R9)
- "Struktur bölmələr" öz CMS səhifəsini (sxem, PDF) bir dəfə oxuyur. Şöbələr üçün yeni
  `/organization/divisions/{id}` səhifəsi var. (R10)
- Rənglər və kölgə kit token-lərindəndir, yeni literal yoxdur. Kart kölgəsi `--ui-shadow-md`-dir,
  Figma-dan fərqi qəbul edilmiş fərq kimi qeyd olunur (istifadəçi qərarı 2026-10-14). (R11)

## Technical Context

**Language/Version**: TypeScript 5 (strict), React 19, Next.js 16 App Router (`src/proxy.ts`)

**Primary Dependencies**: `@cbar/lib-react-ui-kit` (`breadcrumb`, `icons`, `card`), Tailwind 4,
react-i18next. **Yeni runtime dependency yoxdur**. Hero naxışı və brend ikonları statik SVG-dir.

**Storage**: N/A. Backend və DB dəyişmir.

**Testing**: Vitest + Testing Library + MSW (`onUnhandledRequest: 'error'`), `npm run verify`.
Parser real test-mühit HTML-i və kontraktın nümunələri ilə fikstür testindən keçir. Vizual
müqayisə əl ilə aparılır (quickstart §4).

**Target Platform**: Next standalone Node server (SSR), müasir brauzerlər, 320–1920px, JS-siz baxış

**Project Type**: web application, yalnız `product-rest/web-cbar-new`

**Performance Goals**: sorğu sayı artmır (SC-007). Yalnız divisions bölməsində +1 CMS səhifə
sorğusu, şöbə səhifəsində 1 siyahı sorğusu olur. Parser xətti mürəkkəblikdədir (O(n) HTML
uzunluğu), ən böyük About səhifəsi ~11 KB-dır.

**Constraints**: `dangerouslySetInnerHTML` yalnız `widgets/cms-content`-də (D2). CSP dəyişmir,
kənar skript yoxdur. Rənglər və kölgə yalnız kit token-lərindən gəlir. `globals.css` route B
bloku toxunulmazdır. `'use client'` yalnız iki yeni yerdə olur.

**Scale/Scope**: 9 Figma səhifəsi × 3 breakpoint, 4 mövcud view (cms-page, organization,
staff-member + yeni division), 2 yeni widget qovluğu, 1 yeni feature (`about-content`),
1 shared util, 1 yeni route, yeni i18n namespace `about`, redaktor təlimatı.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Workspace konstitusiyası (`.specify/memory/constitution.md`, **WS**) və web-cbar-new konstitusiyası
(`product-rest/web-cbar-new/.specify/memory/constitution.md`, **W**).

| Maddə | Yoxlama | Status |
|---|---|---|
| WS I.2 `product-host` referansı | Spec `PagesController::actionIndex`, `StructureController::actionIndex`, `views/pages`, `views/structure`-u sadalayır | ✅ |
| WS I.3 səssiz itki yoxdur | Formaya uymayan məzmun adi mətn kimi qalır (FR-008). Ərazi idarələr qalır. Tab düymələri menyu ilə əvəz olunur, funksiya itmir | ✅ |
| WS I.5 informasiya arxitekturası | Menyu və breadcrumb CMS ağacından gəlir. URL-lər dəyişmir, yalnız şöbə səhifəsi əlavə olunur (R13) | ✅ |
| WS II.3 çox proyekt | Yalnız `web-cbar-new`, bir MR. Admin paneldə dəyişiklik yoxdur (roundtrip yalnız icra olunur) | ✅ |
| WS III.1 admin/client ayrılığı | Sayt yalnız `api-cbar`-ı oxuyur | ✅ |
| WS V.4 redaksiya mətni API-dən | Bütün mətn CMS/API-dəndir. Kodda yalnız chrome etiketləri var (`about.json`) | ✅ |
| WS VII.2 public URL-lər | Dəyişmir. `legacyRedirect()` toxunulmur | ✅ |
| WS VIII icra ilə verification | quickstart: `verify`, `local:testcbar`, roundtrip, 3 enlikdə vizual müqayisə | ✅ |
| W I.2 hardcoded UI string yoxdur | Yeni etiketlər `locales/{az,en}/about.json`-dadır | ✅ |
| W II yeni runtime dependency | Yoxdur. Tokenizer öz kodudur (R3) | ✅ |
| W III.1 kit control-ları | Breadcrumb kit-dəndir. Accordion native `<details>`-dir (CMS məzmunu, kit control-u deyil, mövcud `cms-content.css` yolu). Paylaşma adi `<a>`-dır | ✅ |
| W III.3 yalnız semantik rəng | Komponentlərdə hex yoxdur. Yeni token-lər (kölgə daxil) kit primitivlərinə istinad edir. Yeni literal yoxdur | ✅ |
| W III.4 route B bloku | Toxunulmur. Yeni token-lər və print qaydası ondan sonra gəlir | ✅ |
| W IV FSD | `shared/lib/html-blocks` → `features/about-content/model` → `widgets/about-shell`, `widgets/about-blocks` → `views/*`. Import yalnız aşağıya, view-lar bir-birini import etmir | ✅ |
| W IV.2 nazik route | Yeni `divisions/[id]/page.tsx` yalnız `loadDivision()` + `<DivisionView>` + metadata-dır | ✅ |
| W VI test | Parser, view və loader testləri. Mock yalnız MSW (kontrakt) | ✅ |
| W VII.4 vəziyyətlər | data-model §5 cədvəli: xəta olanda şablon qalır | ✅ |
| W X.1 XSS | `dangerouslySetInnerHTML` yeni yerdə yoxdur. Fraqmentlər `prepareCmsHtml`-dən keçir. Şəkil `src` protokolu yoxlanılır | ✅ |
| W X.4 üçüncü tərəf skript | Paylaşma SDK-sız, adi linklərdir | ✅ |
| W XI server/client | Yeni `'use client'` yalnız `print-button` və `year-nav-spy`-dadır. `window` yalnız effekt və klikdə istifadə olunur | ✅ |

**Gate nəticəsi**: keçir, sapma yoxdur. Figma-dan vizual fərqlər (yaxın kit rəngləri, kart
kölgəsi) `visual-diff.md`-də qəbul edilmiş fərq kimi qeyd olunur.

**Post-design re-check (Phase 1-dən sonra)**: [data-model.md](./data-model.md),
[contracts/cms-markup.md](./contracts/cms-markup.md) və
[contracts/ui-contract.md](./contracts/ui-contract.md) yuxarıdakı cədvələ uyğundur. Dizayn
zamanı yeni pozuntu yaranmayıb. Rəng literalları sıfıra endirilib (R11).

## Project Structure

### Documentation (this feature)

```text
specs/024-about-us-redesign/
├── spec.md
├── plan.md                  # bu fayl
├── research.md              # R1–R15
├── data-model.md            # view model-lər, validasiya, vəziyyətlər
├── quickstart.md            # verification addımları
├── contracts/
│   ├── cms-markup.md        # redaktor HTML-i ↔ Figma blokları
│   └── ui-contract.md       # route-lar, Figma node → komponent, token-lər, i18n
├── checklists/requirements.md
└── tasks.md                 # /speckit-tasks
```

### Source Code (`product-rest/web-cbar-new`)

```text
src/
├── app/
│   ├── globals.css                         # site token-ləri (timeline, ikon fonu, hero, kölgə) + print qaydası
│   ├── cms-content.css                     # .about tipoqrafiya variantı, accordion Figma stili
│   └── [locale]/(content)/organization/divisions/[id]/page.tsx   # YENİ, nazik route
├── shared/lib/
│   └── html-blocks.ts (+test)              # YENİ: DOM-suz dayaz HTML ağacı (R3)
├── entities/page-node/lib/
│   └── tree.ts                             # + findChainByHref, markChain (SectionSidebar-dan çıxarılır)
├── features/about-content/                 # YENİ (yalnız model, API yoxdur)
│   └── model/
│       ├── layouts.ts                      # slug → layout reyestri (R2)
│       ├── types.ts                        # AboutBlock, TimelineEvent, ValueItem …
│       └── parse.ts (+test)                # kontrakt qaydaları → AboutBlock[]
├── features/organization/model/schemas.ts  # + splitBoard(staff) → { chair, deputies }
├── widgets/
│   ├── about-shell/                        # YENİ
│   │   ├── about-shell.tsx                 # qrid: alətlər, menyu, başlıq, slot
│   │   ├── about-nav.tsx                   # Figma "subcategories"
│   │   ├── page-tools.tsx                  # kit Breadcrumb + ShareButtons
│   │   ├── share-buttons.tsx               # FB, LinkedIn, WhatsApp, mailto
│   │   ├── print-button.tsx                # 'use client'
│   │   └── model.ts                        # buildAboutShell(tree, locale, current, pageUrl)
│   ├── about-blocks/                       # YENİ
│   │   ├── about-blocks.tsx                # AboutBlock[] → komponentlər
│   │   ├── date-cards.tsx, highlight-box.tsx, history-hero.tsx
│   │   ├── timeline.tsx, year-nav.tsx, year-nav-spy.tsx ('use client')
│   │   ├── mission-banner.tsx, value-row.tsx
│   │   └── staff-cards.tsx                 # ChairCard, StaffCard, StaffGrid, StaffHeaderCard
│   ├── attachments/attachments.tsx         # + variant="about" (Figma pdf file sətri)
│   └── section-sidebar/section-sidebar.tsx # markChain entities-ə köçür, görünüş dəyişmir
├── views/
│   ├── cms-page/{loader.ts,index.tsx}      # About olanda shell + layout + bloklar
│   ├── organization/{loader.ts,index.tsx}  # shell, board split, divisions intro, şöbə linkləri, tablar silinir
│   ├── staff-member/{loader.ts,index.tsx}  # shell + StaffHeaderCard + bio tipoqrafiyası
│   └── division/{loader.ts,index.tsx}      # YENİ
├── locales/{az,en}/about.json              # YENİ namespace
└── shared/testing/{fixtures,handlers}/     # about HTML fikstürləri, divisions CMS səhifəsi
public/site/about/history-hero.svg          # dekorativ naxış (Figma export)
public/site/icons/{facebook,linkedin,whatsapp}.svg   # kitdə yoxdursa
docs/about-cms-guide.md                     # YENİ: redaktor təlimatı (FR-009)
CLAUDE.md                                   # 'use client' siyahısı, about-shell, html-blocks qeydi
```

**Structure Decision**: tək komponent (`web-cbar-new`). FSD qatları dəyişmir. Yeni feature
`about-content` yalnız `model/`-dir: API yoxdur, data mövcud `pages` və `organization`
feature-larından gəlir. Yeganə yeni route şöbə səhifəsidir.

## Mərhələlər (hər biri ayrıca commit, sonunda `npm run verify`)

1. **Fundament**: `html-blocks` + testlər, `entities/page-node` köməkçiləri, token-lər, `about`
   i18n namespace.
2. **Ümumi şablon (US1)**: `about-shell`. `CmsPageView` About səhifələrində onu `plain`
   layout ilə işlədir. Komitə və Əlaqə səhifələri hazır olur. Desktop + planşet + mobil.
3. **Haqqımızda + Missiya (US2)**: `about-content` parser (`about-main`, `mission`), bloklar,
   accordion stili.
4. **Tarix (US3)**: `history` parser, timeline, il naviqasiyası, spy, hero SVG.
5. **Təşkilat (US4)**: İdarə Heyəti, Rəhbərlik, bio. Tablar silinir.
6. **Struktur və şöbələr (US5)**: divisions intro, şöbə route-u, ərazi idarələr, fayl sətri.
7. **Yekun**: redaktor təlimatı, roundtrip sübutu, vizual müqayisə (`visual-diff.md`),
   CLAUDE.md, `/sync-business-logic` qeydi.

## Complexity Tracking

| Pozuntu | Niyə lazımdır | Daha sadə alternativ niyə rədd edildi |
|---|---|---|
| Öz HTML tokenizer-i (dependency əvəzinə) | Strukturlu bloklar CMS HTML-indən çıxarılmalıdır, serverdə DOM yoxdur | `htmlparser2`/`parse5` yeni runtime dependency-dir (W II). Normallaşdırılmış TipTap çıxışı üçün artıqdır. Fallback (`plain`) riski sıfıra endirir |
