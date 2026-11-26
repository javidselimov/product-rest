# Implementation Plan: "Sual-cavab" (FAQ) — məzmun növü, Figma redizaynı, en və bölmə bloku

**Branch**: `051-faq-page` | **Date**: 2026-11-17 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/051-faq-page/spec.md`

## Summary

Köhnə saytda FAQ bir CMS səhifəsinin (`sual-cavab`) içində 8 `<details>` akkordeonu və 200+ nömrəli sualdır. Yeni sistemdə o, ayrıca məzmun növü
olur (mövzular, suallar, videolar), admin paneldə redaktor üçün "Sual-cavab" bölməsi (sürüşdür-burax sıralama, az/en yan-yana,
rich-text cavab), saytda Figma A/B görünüşləri (native `<details>`, server axtarışı, JS-siz mövzu seçimi) və mövzuya bağlı CMS səhifələrinin altında
FAQ bloku. Sistem tam ikidillidir, amma sual/cavabların en tərcüməsi təxirə salınıb (istifadəçi qərarı — token həcmi): seed az məzmunu və 8 en mövzu
adını yazır, en FAQ səhifəsi en məzmun dolana qədər açılmır. Mövcud cədvəllərə toxunulmur; köhnə məzmun seed ilə köçür.

## Technical Context

**Language/Version**: C# / .NET 10 (iki API); TypeScript 5 strict — Next.js 16 + React 19 (sayt), React 19 + Vite (admin)

**Primary Dependencies**: EF Core + Npgsql; `@cbar/lib-react-ui-kit`, Tailwind 4, react-i18next, Zod; admin: TanStack Router/Query, RHF, TipTap 3.
Yeni runtime dependency **yoxdur** (sortable native HTML5 DnD ilə).

**Storage**: PostgreSQL — yeni `faq_*` cədvəlləri (0032), az məzmun seed-i + en mövzu adları (0033); mövcud `page_translations` (yalnız az başlığın düzəlişi — UPDATE, şərtli).

**Testing**: Vitest + RTL + MSW (iki frontend, `npm run verify`); API-lərdə test layihəsi yoxdur → `dotnet build` + PGlite ilə endpoint icrası +
route-diff (Maddə VIII).

**Target Platform**: Linux konteynerlər (CBAR GitLab pipeline); sayt SSR Node, admin nginx.

**Project Type**: web — 4 upstream komponent (`api-cbar-admin`, `api-cbar`, `web-cbar-admin-new`, `web-cbar-new`).

**Performance Goals**: FAQ səhifəsi bir API sorğusu (~190 KB JSON) + axtarış serverdə; bölmə bloku CMS səhifəsinə bir yüngül sorğu əlavə edir.
Client JS: yalnız `faq-topic-select` (~1 KB).

**Constraints**: JS-siz işləmə (SC-007); `ALTER TABLE` yox; migration append-only, unikal ad; `Cbar.Domain` iki nüsxədə eyni; spec-first OpenAPI;
`dangerouslySetInnerHTML` yalnız `widgets/cms-content`; magic number yox (spec 032); bütün UI mətni i18n az/en.

**Scale/Scope**: 8 mövzu, ~230 sual × 2 dil, 1 video; admin 3 ekran + 1 paylaşılan komponent; sayt 1 view + 1 blok.

## Constitution Check

*GATE: Phase 0-dan əvvəl keçdi; Phase 1 dizaynından sonra yenidən yoxlandı — pozuntu yoxdur.*

| Maddə | Yoxlama | Nəticə |
|---|---|---|
| I — `product-host` referansdır | Əvəz edilən: `visitor/controllers/PagesController` + `views/pages/index.php` (FAQ səhifəsi `page-131/sual-cavab`) və admin-in səhifə redaktoru (FAQ mətni). Paritet cədvəli aşağıda. Köhnə URL 308 ilə xəritələnir. `product-host` dəyişmir. | ✅ |
| II — Dörd müstəqil proyekt | 4 ayrı iş paketi / MR, deploy sırası yazılıb; root-da paylaşılan kod yoxdur (seed generatoru `specs/` altında tooling-dir, heç bir komponent onu import etmir). | ✅ |
| III — Admin/client ayrılığı | Sayt yalnız `api-cbar`, admin yalnız `api-cbar-admin`; public sorğular `published`, `deleted_at`, dil dolu filtri ilə; admin endpoint-ləri JWT + `faq.*` icazələri + audit. | ✅ |
| IV — Start sırası | Dəyişmir; yeni port/servis yoxdur. | ✅ |
| V — Sxem, migration, ikidillilik | Yeni cədvəllər, `IF NOT EXISTS`, `0032`/`0033` unikal, BEGIN/COMMIT yox, `*_translations (entity_id, locale)`; `Faq.cs` iki nüsxədə eyni; bir dilin boş qalması xəta deyil; chrome etiketləri az/en. | ✅ |
| VI — Admin template stack | Kit + TanStack + RHF/Zod + i18n; `ModuleConfig` şablonu; rich-text redaktoruna extension əlavə/silinmir (roundtrip yenə işlədilir); token yalnız yaddaşda. | ✅ |
| VII — Xarici kontraktlar | Mövcud endpoint-lər dəyişmir, yalnız yeni route-lar; köhnə URL 308 xəritəsi spec-dədir. | ✅ |
| VIII — Verification | `dotnet build` ×2, PGlite ilə endpoint icrası, route-diff, `npm run verify` ×2, ölçmə (quickstart). | ✅ |

**Paritet cədvəli (Maddə I.3)**

| `product-host` | Yeni qarşılıq | Status |
|---|---|---|
| `/page-131/sual-cavab` (az; köhnə en ünvanı FAQ deyil) | `/az/sual-cavab` (308); `/en/faq` en məzmun dolanda | əvəz |
| FAQ akkordeonları, nömrəli suallar | FAQ A/B görünüşləri | əvəz + yaxşılaşma |
| Video embed | Video kartları (YouTube-da açılır) | əvəz (istifadəçi qərarı) |
| "Playlist-ə keçid" linki | — | **ləğv edilir** (clarify 2026-11-17; eyni videoya aparırdı, Figma-da yoxdur) |
| Admin: FAQ səhifəsinin rich-text mətni | "Sual-cavab" bölməsi | əvəz |
| — | Axtarış, mövzu seçimi, bölmə bloku, en dəstəyi (məzmun təxirə salınıb) | yeni |

## Frontend Skills Gate

Yüklənib: `senior-front`, `frontendpatterns`, `frontend-standards` (web-cbar-new), `ui-kit-usage` (web-cbar-new; admin eyni kit). Admin üçün
`product-rest/web-cbar-admin-new/.claude/skills/{frontend-standards,ui-kit-usage}` implement mərhələsində admin işinə başlamazdan əvvəl yüklənir.

| UI piece | Kit components (`ui-kit-usage`) | Patterns (`frontendpatterns`) | Smells avoided (`senior-front`) |
|----------|----------------------------------|-------------------------------|----------------------------------|
| Mövzu kartı + sual (sayt) | native `<details>`/`<summary>` + kit token-ları, ikonlar `<pkg>/icons` | Disclosure, Progressive Enhancement, Semantic HTML | kit `Accordion` client komponentini 250 element üçün hidratasiya etmək; `<div onClick>` |
| Axtarış + mövzu seçimi (sayt) | `inputVariants` (input), native `<select>` kit stilində, `Button` | Progressive Enhancement (GET form), URL-as-state (Zod) | Derived state-i client-də saxlamaq; `'use client'`-i view-a qaldırmaq — yalnız `faq-topic-select` leaf |
| Sual linki `#sual-<id>` | — (görünməz) | Fragment navigation + ancestor details reveal (platform), kiçik client leaf `faq-hash-opener` (sualı açır, `scrollIntoView`) | `useEffect`-i render hesablaması üçün işlətmək — burada yalnız DOM sinxronizasiyası |
| Cavab HTML | `widgets/cms-content` (tək sink), `prepareCmsHtml` | Sanitize Untrusted HTML, Output Encoding | ikinci `dangerouslySetInnerHTML` |
| Video kartı | `SiteImage` (spec 036), `<a target="_blank" rel="noopener noreferrer">` | Lazy Loading (şəkil ölçülü), External link safety | iframe facade-ı (lazımsız JS, CSP) |
| Boş/xəta vəziyyəti | mövcud boş vəziyyət üslubu, `Button variant="link"` | Explicit empty/error states | yalnız happy path |
| Bölmə keçid kartı | bütün kart bir `<a>` (Next `Link`), kit ox ikonu, token-lar; mövzu kartının çərçivə sinifləri paylaşılır (`widgets/faq/constants.ts`) | Card-as-link (bir fokus nöqtəsi) | iç-içə interaktiv elementlər (kart içində ayrıca link + düymə) |
| Sual elementi (A və B) | eyni `FaqItem` | Composition (bir `FaqItem` iki görünüşdə) | Duplicate Code (A və B üçün ayrı komponentlər) |
| Admin siyahılar/formalar | `ModuleConfig` → `CrudListPage`/`CrudFormPage`, `Badge`, `Combobox`, `Tabs`, `Dialog`, `Switch`/`Select` | Container/Presentational, Form validation (RHF+Zod, server xətası `problem+json`) | əl ilə yazılmış CRUD ekranı (Duplicate Code) |
| Sıralama (admin) | `IconButton` (yuxarı/aşağı, `aria-label`), `Dialog` | Keyboard-accessible DnD alternative, Live Region elanı, Optimistic update + rollback | beşinci kopyalanmış yuxarı/aşağı siyahı → `shared/ui/sortable-list` |
| Köçürmələr | — | — | Feature Envy / yanlış qat: `foldForSearch`, `youtube` → `shared/lib` |

Review: tasks.md-də hər frontend fazası `ui-kit-review` + senior-front review checklist tapşırığı ilə bitir, sonra `npm run verify`.

## Project Structure

### Documentation (this feature)

```text
specs/051-faq-page/
├── spec.md
├── plan.md               # bu fayl
├── research.md           # R1–R13
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── public-api.md     # GET /faq, GET /faq/topics?pageId
│   ├── admin-api.md      # topics / questions / videos / order / settings
│   ├── ui-contract.md    # Figma ölçüləri (A, B, video, blok)
│   └── admin-ux.md       # admin ekranları, SortableList
├── seed/                 # extract-faq.mjs, faq-az.json, topic-names-en.json, build-seed.mjs (tooling; faq-en.json — gələcək en seed-i)
├── checklists/requirements.md
└── tasks.md              # /speckit-tasks
```

### Source Code

```text
product-rest/api-cbar-admin/                     # MR 1 (birinci deploy)
├── openapi/paths/faq.yaml, openapi.yaml          # spec-first
├── db/migrations/0032-faq.sql, 0033-faq-seed.sql
├── src/Cbar.Domain/Entities/Faq.cs, CbarDbContext.cs          # == api-cbar nüsxəsi
├── src/Cbar.AdminApi/Authorization/Permissions.cs (Faq.*)
└── src/Cbar.AdminApi/Controllers/FaqTopicsController.cs, FaqQuestionsController.cs, FaqVideosController.cs

product-rest/api-cbar/                           # MR 2
├── openapi/paths/faq.yaml, openapi.yaml
├── src/Cbar.Domain/Entities/Faq.cs, CbarDbContext.cs          # == api-cbar-admin nüsxəsi
└── src/Cbar.WebApi/Controllers/FaqController.cs

product-rest/web-cbar-admin-new/                 # MR 3
├── src/shared/ui/sortable-list.tsx (+ test)
├── src/shared/crud/types.ts                      # listExtras, initialValues
├── src/features/crud/components/crud-list-page.tsx, crud-form-page.tsx   # iki genişlənmə nöqtəsi
├── src/features/faq/{api,model,components}/      # modules (questions/topics/videos), topic-questions-section, reorder-dialog, video-preview
├── src/pages/faq/index.tsx                       # üç modul + lookup gate (release-schedule kimi)
├── src/app/routes/{index.ts,nav.ts}              # route-lar, `faq` qrupu
├── src/features/pages/model/managed-sections.ts, components (FAQ bloku kartı)
├── src/locales/{az,en}/faq.json, nav.json
└── src/shared/testing/handlers/faq.ts

product-rest/web-cbar-new/                       # MR 4 (sonuncu deploy)
├── src/shared/lib/search-fold.ts (köçür), youtube.ts (köçür)
├── src/entities/page-node/lib/tree.ts            # FAQ_SLUG { az: 'sual-cavab', en: 'faq' }
├── src/features/faq/{api/faq.api.ts, model/{schemas,select,constants}.ts}
├── src/widgets/faq/{faq-item,faq-topics,faq-topic-list,faq-search-form,faq-topic-select (client),faq-hash-opener (client),faq-videos,faq-topic-link-card}.tsx
├── src/shell/nav.ts                               # footer: "Sual-cavab" (FR-017a)
├── src/views/faq/{loader.ts,index.tsx,skeleton?}
├── src/app/[locale]/(content)/[...slug]/page.tsx # FAQ_SLUG → FaqView
├── src/views/cms-page/{loader.ts,index.tsx}      # bölmə bloku
├── src/proxy.ts                                   # page-131 → FAQ
├── src/locales/{az,en}/faq.json
├── src/shared/testing/{handlers,fixtures}/faq.ts
└── docs/faq-cms-guide.md

Root: CLAUDE.md, business_logic/new_business_logic.md, dokumentasiyalar/ (idarəetmə təlimatı + README sətri),
specs/046-international-memberships/contracts/admin-nav.md
```

**Structure Decision**: Dörd komponent, dörd MR, deploy sırası API-admin → API → admin panel → sayt. Admin UI CRUD şablonu üzərində (iki kiçik
genişlənmə nöqtəsi + paylaşılan `SortableList`); sayt FAQ-ı CMS səhifəsinin ünvanında, ayrıca view ilə göstərir.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — (pozuntu yoxdur) | | |

Qeyd: `ModuleConfig`-ə iki genişlənmə nöqtəsi (`listExtras`, `initialValues`) əlavə olunur — generik, opsional; mövcud modullar dəyişmir. Mövcud beş
yuxarı/aşağı siyahının `SortableList`-ə köçürülməsi bu spec-ə daxil deyil (follow-up).
