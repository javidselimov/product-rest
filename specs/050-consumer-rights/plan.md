# Implementation Plan: "İstehlakçıların və investorların hüquqları" bölməsinin Figma redizaynı

**Branch**: `050-consumer-rights` | **Date**: 2026-11-17 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/050-consumer-rights/spec.md`; `/speckit-plan` arqumenti: "sonda bu panellərin idarə edilməsi üçün
`dokumentasiyalar`-da sənəd yazmağı nəzərə al".

## Summary

Bölmə bölmə şablonuna keçir (yeni `SectionKey` `consumer`). Beş Figma səhifəsi dörd yeni layout ilə qurulur. Hamısı redaktorun adi işarələməsindən
oxunur ([research.md](./research.md) R1, R3):

- **`consumer-text`** — kök (87) və İnzibati işlər (86): lead, başlıq sətirləri, nömrələnmiş kartlar.
- **`complaint-index`** — 95 + yoldaş 96. Bank/Sığorta link-tabları, "son məlumat" kartı, il → ay arxivi, taba görə metodologiya.
- **`appeal-statistics`** — 94 + yoldaş 93. Ortaq son ayın qısa icmalı, kanal tabları, il seçimi və cədvəl, İnfoqrafika (son məlumat + arxiv).
- **`consumer-documents`** — 101. Akkordeon bölmələri, sənəd kartları.

Seçim (tab, kanal, il) URL parametridir, server render olunur, yeni client komponenti yoxdur (R5). Yoldaş səhifəni loader əlavə bir sorğu ilə
oxuyur (R4). `proxy.ts` 88, 93 və 96-nın ünvanlarını yönləndirir (R6). 86 köçəndə ünvanı dəyişmir (R7).

`api-cbar-admin`-ə bir seed (`0031`) əlavə olunur. Seed bunları edir:
- 86-nı bölməyə köçürür;
- 95 və 101-in başlıqlarını dəyişir;
- kökün lead-ini bölür;
- 95 və 96-ya metodologiya yazır;
- 101-ə "İnformasiya sorğusu" bölməsini əlavə edir;
- 14 səhifəni sol menyudan çıxarır.

Redaktorlar üçün `dokumentasiyalar/`-da idarəetmə təlimatı yazılır (R13).

## Technical Context

**Language/Version**: TypeScript 5 strict (iki frontend); SQL (PostgreSQL, bir seed migration-u). C# kodu dəyişmir.

**Primary Dependencies**:
- Sayt: Next.js 16 App Router, `@cbar/lib-react-ui-kit`, Tailwind 4, react-i18next və mövcud modullar: `parseAbout`, `html-blocks`, `CmsContent`,
  `AboutFileRow`, `section-shell`, `Reveal`.
- Admin: TipTap dəyişmir, yalnız fixture əlavə olunur.
- Yeni dependency yoxdur.

**Storage**: `pages` (parent/path/sort_order — yalnız seed), `page_translations`, `page_details`. Hamısı mövcuddur, `ALTER` yoxdur.

**Testing**:
- Vitest + MSW (iki frontend, `npm run verify`, Node 24 və 22);
- layout fixture guard;
- köhnə forma parser testləri;
- admin `roundtrip` (unit + canlı);
- seed PGlite üzərində real icra edilir;
- UI fikstür proxy + Edge CDP ilə ölçülür.

**Target Platform**: Linux konteynerlər (CBAR GitLab pipeline); brauzer 1728 / 744 / 390.

**Project Type**: web — üç upstream repo: `api-cbar-admin` (yalnız SQL), `web-cbar-new`, `web-cbar-admin-new` (yalnız fixture və test siyahısı).
`api-cbar` dəyişmir. Workspace sənədləri (`dokumentasiyalar/`, kök `CLAUDE.md`, `business_logic/`) ayrıca commit-dir.

**Performance Goals**: Əlavə API çağırışı yalnız 94 və 95-də var (yoldaş səhifə, bir `GET /pages/{slug}`). Parse O(HTML uzunluğu). 94-ün mətni ~123 KB-dır,
2921 hüceyrəsi var; parse bir sorğuda bir dəfə edilir (`cache()`).

**Constraints**:
- Migration yalnız əlavə olunur, adı unikaldır, icazə yoxlanır, idempotentdir.
- `dangerouslySetInnerHTML` yalnız `widgets/cms-content`-də işlədilir.
- Yeni `'use client'` yoxdur.
- Spec 032 sabitlər standartı tətbiq olunur (`QUERY_PARAM.TAB/CHANNEL/YEAR`, ay adları, ölçülər `constants.ts`-də).
- Layout fixture guard işləyir.
- Reveal iç-içə olmur (spec 049).
- `prettier --write` işlədilmir.
- Kod şərhləri ingiliscə yazılır.

**Scale/Scope**:
- 1 bölmə açarı;
- 4 layout (parser + widget);
- 2 ortaq parser (arxiv, statistika cədvəli);
- 3 yönləndirmə qaydası;
- 1 seed;
- 4 fixture (×2 nüsxə);
- 2 redaktor təlimatı;
- ~6 sənəd faylı.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Maddə | Yoxlama | Status |
|---|---|---|
| I | Köhnə saytın davranışı (adi CMS səhifələri, R1) referansdır. Bütün fayl linkləri və cədvəllər yeni görünüşdə qalır (SC-002). `product-host` dəyişmir | ✔ |
| I | URL-lər qalır: 88, 93, 96 üçün 308 yönləndirmə var, 86-nın ünvanı dəyişmir. Heç bir səhifə silinmir və görünməz edilmir, yalnız sol menyudan çıxır | ✔ |
| II | 3 ayrı MR, deploy sırası aşağıdadır | ✔ |
| III | Yazan yalnız `api-cbar-admin`-dir (seed). `api-cbar` və public filtrlər dəyişmir | ✔ |
| IV | `api-cbar-admin` (seed) → `web-cbar-new`. Admin fixture MR-ı müstəqildir | ✔ |
| V | `Cbar.Domain` dəyişmir. `0031-consumer-rights-seed.sql` yeni və unikaldır, yalnız DML-dir, icazə yoxlanır, idempotentdir. az və en ayrı yazılır. Chrome mətnləri (`SON MƏLUMAT`, `Arxiv`, `İl:`, tab adları, "qısa icmal") `locales/*/about.json`-dadır, redaksiya mətni CMS-dəndir | ✔ |
| VI | Redaktor extension-larına toxunulmur. 4 fixture `roundtrip.test.ts`-ə və canlı `roundtrip`-ə əlavə olunur. `td > details` riski R15-dədir | ✔ |
| VII | Endpoint və OpenAPI dəyişmir. Yeni yönləndirmələr `legacyRedirect` qaydasıdır | ✔ |
| VIII | Real icra [quickstart.md](./quickstart.md)-də təsvir olunub (PGlite seed, brauzer ölçmə, canlı roundtrip) | ✔ |

Dizayndan sonra təkrar yoxlama: data-model, kontraktlar və seed planı heç bir maddəni pozmur. Complexity Tracking boşdur.

## Project Structure

### Documentation (this feature)

```text
specs/050-consumer-rights/
├── spec.md
├── plan.md                 # bu fayl
├── research.md             # R1–R15
├── data-model.md           # view-modellər + seed addımları
├── quickstart.md
├── contracts/
│   ├── ui-contract.md      # Figma ölçüləri (desktop; tablet/mobil implementasiyada)
│   └── cms-markup.md       # işarələmə qaydası, iki forma, fixture-lər
├── checklists/requirements.md
└── tasks.md                # /speckit-tasks
```

### Source Code — iş paketləri deploy sırası ilə

```text
A. product-rest/api-cbar-admin/                         (MR 1)
   db/migrations/0031-consumer-rights-seed.sql

B. product-rest/web-cbar-new/                           (MR 2, A-dan sonra; A-sız da təhlükəsizdir — köhnə mətn tanınan bloklarla və ya adi məzmun kimi görünür)
   src/entities/page-node/lib/tree.ts                   (SectionKey 'consumer', SECTION_TITLES, CONSUMER_ROOT_SLUG, CONSUMER_COMPANION, yönləndirmə slug-ları)
   src/shared/constants/query-params.ts                 (TAB, CHANNEL, YEAR)
   src/features/about-content/model/{types.ts,layouts.ts,parse.ts,constants.ts}
   src/features/about-content/model/year-archive.ts (+test)            (yeni: il → ay → fayl, ay adları)
   src/features/about-content/model/consumer-text.ts (+test)          (yeni)
   src/features/about-content/model/complaint-index.ts (+test)        (yeni: tablar, metodologiya, düstur)
   src/features/about-content/model/appeal-statistics.ts (+test)      (yeni: kanallar, cədvəl formaları, icmal)
   src/features/about-content/model/consumer-documents.ts (+test)     (yeni)
   src/features/about-content/model/consumer-select.ts (+test)        (yeni: query → seçilmiş tab/kanal/il)
   src/features/about-content/model/{layouts.test.ts,layout-fixtures.test.ts}
   src/features/about-content/fixtures/{consumer-text,complaint-index,appeal-statistics,consumer-documents}.html
   src/widgets/about-blocks/{consumer-text,complaint-index,appeal-statistics,consumer-documents}.tsx (+testlər)
   src/widgets/about-blocks/{year-archive.tsx,document-card.tsx,link-tabs.tsx}                      (yeni ortaq hissələr)
   src/widgets/about-blocks/{about-blocks.tsx,constants.ts,index.ts}
   src/views/cms-page/{loader.ts,index.tsx}             (sectionLayout 'consumer'; yoldaş səhifə; query → AboutBlocks)
   src/views/cms-page/consumer.test.tsx                 (yeni)
   src/proxy.ts, src/proxy.test.ts                      (88 → kök, 93 → 94#infoqrafika, 96 → 95?tab=insurance)
   src/locales/{az,en}/about.json                       (consumer.*)
   src/shared/testing/fixtures/consumer-section.ts      (yeni: ağac + səhifələr)
   docs/consumer-rights-cms-guide.md (yeni), docs/how-to-use.md, CLAUDE.md

C. product-rest/web-cbar-admin-new/                     (MR 3, B ilə eyni seriyada)
   src/features/rich-text/fixtures/layouts/{consumer-text,complaint-index,appeal-statistics,consumer-documents}.html
   src/features/rich-text/roundtrip.test.ts, CLAUDE.md (fixture siyahısı)

D. Workspace sənədləri (ayrıca commit)
   dokumentasiyalar/istehlakci-huquqlari-guide.md (yeni), dokumentasiyalar/README.md (yeni "İstehlakçı hüquqları" cədvəli)
   CLAUDE.md (spec 050 bəndi), business_logic/ (/sync-business-logic)
```

**Structure Decision**:
- Sayt mövcud `about-content` layout sisteminə qoşulur: `consumerLayoutFor` slug-ları dörd layout-a xəritələyir, `parseAbout` yeni parser-ləri çağırır.
- Arxiv parser-i (R8) üç səhifədə ortaqdır. Arxiv, sənəd kartı və link-tab widget-ləri `complaint-index`, `appeal-statistics` və `consumer-documents` arasında paylaşılır.
- Yoldaş səhifə `ParseContext`-ə `companion` (mətn + fayllar) kimi ötürülür. Seçim (`query`) parse-dan sonra, view-da tətbiq olunur. Beləcə `loadCmsPage`
  `cache()`-i sorğu parametrlərindən asılı olmur və imzası dəyişmir (spec 045 nümunəsi).
- Bloklar faylları özü göstərir: bu layout-larda `Attachments` siyahısından istifadə olunan fayllar çıxarılır (`usedMediaIds`, spec 047). Beləcə 64 PDF
  səhifənin altında ikinci dəfə görünmür.

**Deploy sırası**: A → B. C B ilə eyni MR seriyasında birləşir (`check:layout-fixtures` yalnız yan-yana checkout-da işləyir). D istənilən vaxt.

**İcra sırası (təklif)**:
1. Canlı `roundtrip` yoxlaması (R15 riski).
2. B: bölmə açarı, `consumer-text` və yönləndirmələr.
3. `year-archive` → `complaint-index`.
4. `consumer-documents`.
5. `appeal-statistics`.
6. A (seed, fixture mətni ilə eyni).
7. C.
8. Ölçmə (tablet/mobil dəyərləri `ui-contract`-a yazılır).
9. D.

## Açıq suallar (dizayner / redaktor)

İcranı bloklamır, MR təsvirində qeyd olunacaq:

1. "…“966” Çağrı Mərkəzinin istifadəsinə dair Qaydalar" PDF-i media kitabxanasında yoxdur (R10). Redaktor yükləyənə qədər "İnformasiya sorğusu"
   bölməsində kart olmur.
2. Qısa icmal kartlarının adları və sırası redaktor mətnindəndir (R9). Figma-dan fərqlər: kart adları redaktor mətnidir, zənglər birinci deyil,
   sütunun adı "Kapital bazarı"dır ("bazarları" yox).
3. Metodologiyanın, İnformasiya sorğusunun və yeni başlıqların en mətni tərcümə qaralamasıdır.

## Complexity Tracking

Pozuntu yoxdur.
