# Implementation Plan: Frontend sabitlər standartı — magic number yoxdur

**Branch**: `feature/032-frontend-constants-standard` | **Date**: 2026-11-03 | **Spec**: [spec.md](./spec.md)

## Summary

Hər iki frontend-də `@typescript-eslint/no-magic-numbers` `error` olur (eyni opsiyalar, `detectObjects`),
sabitlər iki pillədə saxlanılır — cross-cutting `src/shared/constants/<mövzu>.ts`, slice-a məxsus
`<slice>/constants.ts` — və mövcud 121 + 158 tapıntı tam miqrasiya olunur (davranış dəyişmir, rəqəmlər
dəyişmir). Qayda konstitusiyaya (web XII, admin XI), `CLAUDE.md`-lərə, `frontend-standards` skill-lərinə və
`senior-front` smell kataloquna yazılır. Kontrakt: [contracts/constants-contract.md](./contracts/constants-contract.md).

Əsas qərarlar (research.md):

- **İki pillə, barrel yoxdur** — FSD IV.5 qorunur; import fayl üzrə (`@/shared/constants/pagination`).
- **`shared/config/` qalır** — konfiq ≠ sabit.
- **`detectObjects: true`, `ignore [0,1,-1,2,100]`** — obyekt dəyərləri də tutulur.
- **Magic string konvensiya ilə**, Tailwind `[Npx]` əhatədən kənar, hook yoxdur.

## Technical Context

**Language/Version**: TypeScript 5 strict; Next.js 16 / React 19 (`web-cbar-new`), React 19 + Vite
(`web-cbar-admin-new`). **Yeni dependency yoxdur** — qayda `@typescript-eslint/eslint-plugin`-dədir
(web: `eslint-config-next/typescript`; admin: `typescript-eslint`).

**Testing**: Vitest + MSW; web `scripts/lint-rules.test.mjs` ESLint-i proqram vasitəsilə işlədir (yeni hallar
ora); `npm run verify` hər iki layihədə, Node 24 və Node 22.

**Constraints**: davranış dəyişmir (refactor); heç bir rəqəmin dəyəri dəyişmir; `prettier --write` işlədilmir
(web); yeni şərhlər ingiliscə.

## Constitution Check

- Web II/admin II (yığın kilidli) — yeni paket yoxdur ✅
- FSD IV.5 — `shared/constants` biznes adı daşımır; domen sabitləri slice-dadır ✅
- VI (gate) — lint `verify`-dədir, test ilə qorunur (web `lint-rules.test.mjs`) ✅
- IX (spec-driven) — konstitusiya amendment-ləri bu spec ilə, MINOR bump ✅
- Amendment proseduru (Governance §2) — `/speckit-constitution` əvəzinə birbaşa fayl redaktəsi, eyni
  formatda (Sync Impact Report + versiya sətri) — 2.1.0-dakı kimi.

## Project Structure

### Documentation (this feature)

```text
specs/032-frontend-constants-standard/
├── spec.md
├── plan.md
├── research.md
├── tasks.md
└── contracts/constants-contract.md
```

### Source Code

```text
product-rest/web-cbar-new/
├── eslint.config.mjs                       konstitusiya/sabitler (SABIT_FAYLLARI, SABIT_QAYDASI)
├── scripts/lint-rules.test.mjs             +2 tutma, +1 keçmə halı
├── src/shared/constants/{pagination,time,timing,cache,http,headers,query-params,layout,text,files,limits}.ts
├── src/{entities/content/lib,features/{stats,currencies,about-content,organization}/model}/constants.ts
├── src/{views/{press-releases,home,statistics,media-videos},widgets/{home-cards,chart-card,org-chart,about-blocks,list-pagination},shell}/constants.ts
├── src/entities/content/lib/files.ts       splitFileSize — photos.ts dublikatı tək funksiyaya
├── .specify/memory/constitution.md         2.2.0, Maddə XII
├── CLAUDE.md, .claude/skills/frontend-standards/SKILL.md

product-rest/web-cbar-admin-new/
├── eslint.config.js                        ikinci obyekt, eyni opsiyalar
├── src/shared/constants/{pagination,timing,http,storage,files,limits,ui}.ts
├── src/{entities/user/model,features/{azir,currency,homepage,inflation,media,org-chart,organization,pages,press-releases,rich-text,yield-curves}/model,pages/settings}/constants.ts
├── src/shared/api/types.ts                 STATUS_CODES ← HTTP_STATUS
├── .specify/memory/constitution.md         1.4.0, Maddə XI
├── CLAUDE.md, .claude/skills/frontend-standards/SKILL.md

workspace/
├── CLAUDE.md                               "Frontend skills" bəndinə bir cümlə
├── .claude/skills/senior-front/references/code-smells.md   Magic Number / Magic String
└── FIGMA-REDIZAYN-PLANI.md                 Harada qaldım (032)
```

## Mərhələlər (commit-lər, yalnız istifadəçi deyəndə)

1. `docs(specs): 032 frontend constants standard` — spec sənədləri, konstitusiya amendment-ləri, skill-lər, tracker.
2. `refactor(web-cbar-new): 032 constants folder + no-magic-numbers gate`.
3. `refactor(web-cbar-admin-new): 032 constants folder + no-magic-numbers gate`.

İki repo, iki MR; deploy sırası asılılığı yoxdur.

## Complexity Tracking

| Sapma | Səbəb | Rədd edilən sadə alternativ |
|---|---|---|
| Lint istisnası `shared/lib/xlsx/**` | bayt formatı — rəqəm məlumatın özüdür | 46 adlı sabit — oxunaqlılıq pisləşir |
| Lint istisnası `features/crud/fixtures/**` (admin) | CRUD mühərrikinin test fikstürü, məhsul kodu deyil | fikstürü `constants.ts`-ə bölmək — mənasız |
| Admin sütun enləri hibrid (`shared/constants/ui.ts` + modul) | 8 dəyər 10+ modulda təkrarlanır | hər modulda öz `COLUMN_WIDTH` — təkrar qalır |
