# Implementation Plan: FinCERT səhifəsi — Figma dizaynı və ayrıca admin bölməsi

**Branch**: `053-fincert-page` | **Date**: 2026-11-18 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/053-fincert-page/spec.md`

## Summary

FinCERT köhnə saytda adi CMS səhifəsidir (köhnə `page-893/fincert`, yeni səhifə 133): missiya, dörd istiqamət, əlaqə, portal linki və RFC-2350 PDF-i
bir HTML mətnindədir. Yeni sistemdə o, FAQ (spec 051) kimi ayrıca məzmun növü olur:
- tipli cədvəllər: tək ümumi qeyd, istiqamətlər, üzvlüklər; az/en;
- admin paneldə "FinCERT" bölməsi: "Ümumi" forması və iki sıralanan siyahı;
- public `GET /api/v1/fincert`;
- saytda Figma dizaynı: missiya, nömrəli native akkordionlar, əlaqə, portal, RFC və üzvlük kartları; desktop/tablet/mobil.

Figma-da gizli olan "Bu səhifədə" bloku qurulmur (istifadəçi qərarı), bölmələrin sabit ankerləri qalır. CMS səhifəsi 133 başlıq və ünvanı verir. FinCERT
məlumatı olmayanda onun köhnə mətni fallback-dir. Köhnə məzmun deterministik seed ilə köçür. RFC faylı test mühitində media kitabxanasında
olmadığı üçün köhnə link kimi köçür.

Admin paneldə ikinci iş: öz bölməsi olan səhifənin formasında sol menyu "Səhifələr"-i yox, həmin bölməni aktiv göstərir. Bu, bütün idarə olunan
səhifələrə aiddir və paylaşılan UI store-da override ilə qurulur.

## Technical Context

**Language/Version**: C# / .NET 10 (iki API); TypeScript 5 strict — Next.js 16 + React 19 (sayt), React 19 + Vite (admin)

**Primary Dependencies**: EF Core + Npgsql; `@cbar/lib-react-ui-kit`, Tailwind 4, react-i18next, Zod; admin: TanStack Router/Query, Zustand, RHF,
TipTap 3. Yeni runtime dependency **yoxdur**.

**Storage**: PostgreSQL — altı yeni `fincert_*` cədvəli (`0036`), məzmun seed-i (`0037`); mövcud `page_details`-ə bir sətir (INSERT … ON CONFLICT, 479).
Mövcud cədvəllərə `ALTER` yoxdur.

**Testing**: Vitest + RTL + MSW (iki frontend, `npm run verify`); API-lərdə test layihəsi yoxdur → `dotnet build` + PGlite ilə endpoint icrası +
`route-diff.mjs` (Konstitusiya VIII).

**Target Platform**: Linux konteynerlər (CBAR GitLab pipeline); sayt SSR Node, admin nginx.

**Project Type**: web — 4 upstream komponent (`api-cbar-admin`, `api-cbar`, `web-cbar-admin-new`, `web-cbar-new`).

**Performance Goals**: FinCERT səhifəsi bir CMS sorğusu + bir `GET /fincert` sorğusu (paralel). Yeni client JS yoxdur (yalnız mövcud `Reveal`).

**Constraints**:
- JS-siz işləmə.
- Migration: append-only, unikal ad, `IF NOT EXISTS`.
- `Cbar.Domain` iki nüsxədə eyni; spec-first OpenAPI.
- `dangerouslySetInnerHTML` yalnız `widgets/cms-content`-də.
- Magic number yoxdur (spec 032).
- UI mətni i18n az/en.
- Token yalnız yaddaşda (admin).

**Scale/Scope**:
- Məzmun: 1 tək qeyd, 4 istiqamət, 1 üzvlük × 2 dil.
- Admin: 3 ekran (1 forma + 2 CRUD modulu) və sidebar aktivlik qaydası.
- Sayt: 1 view, 1 widget dəsti, 1 legacy yönləndirmə.

## Constitution Check

*GATE: Phase 0-dan əvvəl keçdi; Phase 1 dizaynından sonra yenidən yoxlandı — pozuntu yoxdur.*

| Maddə | Yoxlama | Nəticə |
|---|---|---|
| I — `product-host` referansdır | Əvəz edilən: `visitor/controllers/PagesController` + `views/pages/index.php` (`page-893/fincert`) və admin-in səhifə redaktoru (FinCERT mətni). Paritet cədvəli aşağıda. Köhnə URL 308. `product-host` dəyişmir. | ✅ |
| II — Dörd müstəqil proyekt | 4 iş paketi / MR, deploy sırası yazılıb; seed generatoru `specs/` altında tooling-dir, heç bir komponent onu import etmir. | ✅ |
| III — Admin/client ayrılığı | Sayt yalnız `api-cbar`, admin yalnız `api-cbar-admin`. Public sorğular `published`, `deleted_at`, dildə məzmun filtri ilə. Admin endpoint-ləri JWT + `fincert.*` icazələri + audit. | ✅ |
| IV — Start sırası | Dəyişmir; yeni port/servis yoxdur. | ✅ |
| V — Sxem, migration, ikidillilik | Yeni cədvəllər, `0036`/`0037` unikal, BEGIN/COMMIT yox, `*_translations (entity_id, locale)`; `Fincert.cs` iki nüsxədə eyni; bir dilin boş qalması xəta deyil; chrome etiketləri az/en; editorial mətn API-dən. | ✅ |
| VI — Admin template stack | Kit + TanStack + Zustand + RHF/Zod + i18n; siyahılar `ModuleConfig` şablonunda; rich-text redaktoruna extension əlavə/silinmir (roundtrip yenə işlədilir); token yalnız yaddaşda. | ✅ |
| VII — Xarici kontraktlar | Mövcud endpoint-lər dəyişmir, yalnız yeni route-lar; köhnə URL 308 xəritəsi spec-dədir. | ✅ |
| VIII — Verification | `dotnet build` ×2, PGlite ilə endpoint icrası, route-diff, `npm run verify` ×2, Figma ↔ DOM ölçmə (quickstart). | ✅ |

**Paritet cədvəli (Maddə I.3)**

| `product-host` | Yeni qarşılıq | Status |
|---|---|---|
| `/page-893/fincert` (az/en) | `/az/fincert`, `/en/fincert` (308) | əvəz |
| Missiya, 4 istiqamət | Missiya + nömrəli akkordionlar | əvəz + yaxşılaşma |
| E-poçt, telefon | Əlaqə kartları (`mailto:`, `tel:`) | əvəz |
| Portal linki | Portal kartı | əvəz |
| RFC-2350 PDF (dil üzrə) | RFC kartı (köhnə link, sonra media faylı) | əvəz |
| Admin: səhifə 133-ün rich-text mətni | "FinCERT" bölməsi | əvəz |
| — | Beynəlxalq əməkdaşlıq (FIRST) | yeni |

## Frontend Skills Gate

Yüklənib: `senior-front`, `frontendpatterns`, `frontend-standards` (web-cbar-new), `ui-kit-usage` (web-cbar-new; admin eyni kit). Admin üçün
`product-rest/web-cbar-admin-new/.claude/skills/{frontend-standards,ui-kit-usage}` implement mərhələsində admin işinə başlamazdan əvvəl yüklənir.

| UI piece | Kit components (`ui-kit-usage`) | Patterns (`frontendpatterns`) | Smells avoided (`senior-front`) |
|----------|----------------------------------|-------------------------------|----------------------------------|
| İstiqamət akkordionu (sayt) | native `<details>`/`<summary>` + kit token-ları, ox ikonu `<pkg>/icons` | Disclosure, Progressive Enhancement, Semantic HTML | kit `Accordion` client komponenti; `<div onClick>`; nömrəni state/DB-də saxlamaq (Derive, don't store) |
| İstiqamət mətni (sayt) | `widgets/cms-content` (tək sink), `prepareCmsHtml`, FinCERT variantı CSS-də | Sanitize Untrusted HTML, Output Encoding | ikinci `dangerouslySetInnerHTML` |
| Əlaqə / RFC / üzvlük kartları | bütün kart bir `<a>`, kit ikonları, `SiteImage` (loqo) | Card-as-link, External link safety (`noopener noreferrer`), Lazy Loading (ölçülü şəkil) | iç-içə interaktiv elementlər; hex rəng |
| Portal düyməsi | kit `Button` (`asChild` + `<a>`), `variant="solid"` | External link safety | hand-rolled `<a className="btn">` |
| Bölmələr və ankerlər | `<section id aria-labelledby>`, `Reveal` (bölmə başına bir) | Semantic HTML, Fragment navigation, scroll-margin | iç-içə `Reveal`; client scroll-spy (Figma-da yoxdur) |
| Boş bölmə / boş məzmun / API xətası | bölmə render olunmur; CMS fallback view | Explicit empty/error states, Graceful degradation | yalnız happy path; boş başlıqlı bölmə |
| Admin "Ümumi" forması | `Card`, `Field`, `Input`, `Textarea`, `Tabs` (az/en), mövcud media seçici, `Button`, `toast` | Form validation (RHF+Zod, server `problem+json` sahəyə), Unsaved-changes guard (`useBlocker`) | xüsusi CRUD-u şablonsuz təkrarlamaq — yalnız tək qeyd üçün forma, siyahılar şablondadır |
| Admin siyahılar | `ModuleConfig` → `CrudListPage`/`CrudFormPage`, `SectionTabs`, `Badge`, `SortableList` dialoqu | Container/Presentational, Keyboard-accessible DnD alternative, Live Region | əl ilə yazılmış CRUD ekranı (Duplicate Code) |
| Sol menyu aktivliyi (admin) | mövcud `Sidebar` (`aria-current`), Zustand `ui-store` | Focus/Location semantics (`aria-current="page"`), Single source of truth | slug-ı route-dan təxmin etmək; menyu komponentində səhifə sorğusu (Feature Envy); ikinci aktivlik mənbəyi |

Review: tasks.md-də hər frontend fazası `ui-kit-review` + senior-front review checklist tapşırığı ilə bitir, sonra `npm run verify`.

## Project Structure

### Documentation (this feature)

```text
specs/053-fincert-page/
├── spec.md
├── plan.md               # bu fayl
├── research.md           # R1–R13
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── public-api.md     # GET /fincert
│   ├── admin-api.md      # settings / directions / memberships / order
│   ├── ui-contract.md    # Figma ölçüləri (desktop, tablet, mobil)
│   └── admin-ux.md       # admin ekranları, sol menyu aktivliyi
├── seed/                 # extract.mjs, fincert-az.json, fincert-en.json, fincert-first.json, build-seed.mjs (tooling)
├── checklists/requirements.md
└── tasks.md              # /speckit-tasks
```

### Source Code

```text
product-rest/api-cbar-admin/                     # MR 1 (birinci deploy)
├── openapi/paths/fincert.yaml, openapi.yaml      # spec-first
├── db/migrations/0036-fincert.sql, 0037-fincert-seed.sql
├── src/Cbar.Domain/Entities/Fincert.cs, CbarDbContext.cs      # == api-cbar nüsxəsi
├── src/Cbar.AdminApi/Authorization/Permissions.cs (Fincert.*)
└── src/Cbar.AdminApi/Controllers/FincertSettingsController.cs, FincertDirectionsController.cs, FincertMembershipsController.cs

product-rest/api-cbar/                           # MR 2
├── openapi/paths/fincert.yaml, openapi.yaml
├── src/Cbar.Domain/Entities/Fincert.cs, CbarDbContext.cs      # == api-cbar-admin nüsxəsi
└── src/Cbar.WebApi/Controllers/FincertController.cs

product-rest/web-cbar-admin-new/                 # MR 3
├── src/shared/model/ui-store.ts                  # activeNavOverride
├── src/app/routes/nav.ts                         # fincert bəndi + qrupu, activeNavKey(); sidebar.tsx onu işlədir
├── src/app/shell/sidebar.tsx (+ sidebar.test.tsx)
├── src/features/pages/model/managed-sections.ts  # fincert sətri
├── src/features/pages/components/page-form.tsx   # override yazır/təmizləyir (hook: features/pages/hooks/use-managed-nav.ts)
├── src/features/fincert/{api,hooks,model,components}/   # settings form, directions/memberships modules, reorder dialogs
├── src/pages/fincert/index.tsx
├── src/app/routes/index.ts                        # /fincert, /fincert/directions, /fincert/memberships
├── src/locales/{az,en}/fincert.json, nav.json
└── src/shared/testing/handlers/fincert.ts

product-rest/web-cbar-new/                       # MR 4 (sonuncu deploy)
├── src/entities/page-node/lib/tree.ts            # FINCERT_SLUG, isFincertSlug
├── src/features/fincert/{api/fincert.api.ts, model/{schemas,view,constants}.ts}
├── src/widgets/fincert/{fincert-directions,fincert-contacts,fincert-portal,fincert-document,fincert-memberships,fincert-section}.tsx, index.ts
├── src/widgets/cms-content/cms-content.css       # FinCERT siyahı variantı
├── src/views/fincert/{loader.ts,index.tsx}
├── src/app/[locale]/(content)/[...slug]/page.tsx # FINCERT_SLUG → FincertView, metadata
├── src/proxy.ts                                   # page-893 → /fincert
├── src/locales/{az,en}/fincert.json
├── src/shared/testing/{handlers,fixtures}/fincert.ts
└── docs/fincert-cms-guide.md

Root: CLAUDE.md, business_logic/, dokumentasiyalar/fincert-guide.md (+ README sətri),
specs/046-international-memberships/contracts/admin-nav.md
```

**Structure Decision**: Dörd komponent, dörd MR, deploy sırası API-admin → API → admin panel → sayt. Admin-də siyahılar CRUD şablonundadır, tək
qeyd üçün kiçik xüsusi forma var. Sayt FinCERT-i CMS səhifəsinin ünvanında ayrıca view ilə göstərir (FAQ nümunəsi). Sol menyu aktivliyi generik
qaydadır: `managed-sections` + UI store override.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — (pozuntu yoxdur) | | |

Qeydlər:
- RFC sənədi iki sütunla saxlanılır (`rfc_media_id`, `rfc_url`). Köhnə fayl media kitabxanasında deyil, deploy günü bölmə itməməlidir (research R10).
- UI store-a bir sahə əlavə olunur (`activeNavOverride`). Alternativlər research R9-dadır.
