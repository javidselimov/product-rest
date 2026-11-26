# Deploy: spec 056 — header naviqasiyası

Bu checkout-un `origin`-i GitHub-dır, deploy GitLab-dadır. Fayllar aşağıdakı siyahı ilə üç GitLab repo-suna köçürülür. Hər repo
ayrıca MR-dır. MR mətnləri (ingiliscə) bu faylın sonundadır.

## 1. Deploy-dan əvvəl: prod yoxlaması

Bu sorğunun nəticəsində olan kök bölmələr bu gün heç nəyə təsir etmir, spec 056-dan sonra isə geniş hamburger panelindən çıxacaq
(research R3):

```sql
SELECT p.id, t.title FROM pages p
JOIN page_details d ON d.page_id = p.id AND d.show_in_side_nav = false
JOIN page_translations t ON t.page_id = p.id AND t.locale = 'az'
WHERE p.parent_id IS NULL AND p.deleted_at IS NULL;
```

Boş nəticə gözlənilir (test API-də belədir). Gözlənilməyən bölmə çıxsa, deploy-dan əvvəl redaktorla razılaşdırılır.

## 2. Sıra

| # | Repo | Niyə bu sırada |
|---|---|---|
| 1 | `api-cbar-admin` | seed `0042` ağacı qurur. Yeni sayt seed-dən əvvəl çıxsa, 9-cu yerə "Media" düşər |
| 2 | `web-cbar-new` | seed-dən sonra. Arada köhnə sayt 8 bölmə göstərir ("Nəşrlər" hamburgerə keçir) və kök bayraqlarına baxmır |
| 3 | `web-cbar-admin-new` | istənilən vaxt. Yalnız kartın mətni dəyişir |

`api-cbar` dəyişmir.

## 3. Fayllar

### `api-cbar-admin` (1 fayl, C# dəyişmir)

```
db/migrations/0042-financial-stability-nav-seed.sql
```

### `web-cbar-new` (13 fayl)

```
CLAUDE.md
docs/navigation-cms-guide.md            (yeni)
docs/publications-cms-guide.md
src/features/pages/api/pages.api.test.ts
src/shared/testing/fixtures/pages.ts
src/shell/constants.ts
src/shell/mega-menu.tsx
src/shell/mega-menu.test.tsx
src/shell/mobile-nav.test.tsx
src/shell/nav-overflow.test.tsx
src/shell/nav.ts
src/shell/nav.test.ts
src/views/cms-page/index.test.tsx
```

### `web-cbar-admin-new` (6 fayl)

```
src/features/pages/components/menu-visibility-card.tsx
src/features/pages/model/menu-visibility.ts
src/features/pages/model/menu-visibility.test.ts
src/features/pages/pages.test.tsx
src/locales/az/pages.json
src/locales/en/pages.json
```

### Yalnız bu workspace-də (GitLab-a getmir)

`CLAUDE.md` (root), `business_logic/new_business_logic.md`, `business_logic/diff_report_logic.md`,
`dokumentasiyalar/nesrler-ve-tedqiqatlar-guide.md`, `specs/056-header-financial-stability-nav/`,
`specs/054-publications-research/tasks.md` (məqalələr seed-i indi `0043`-dür).

## 4. Deploy-dan sonra yoxlama (test mühiti)

- `api-cbar-admin` log-unda: `spec 056: 10 pages created (roots: maliyye-sabitliyi, reqemsal-maliyye-ekosistemi)`, `3 pages moved`,
  `… roots renumbered`, `4 roots left out of the hamburger panel`. `WARNING … skipped` görünürsə rolun `pages`/`page_details`
  üzrə imtiyazı çatmır və heç nə dəyişməyib.
- 1440px-də nav zolağı: Haqqımızda … Maliyyə sabitliyi (3-cü) … Nəşrlər və tədqiqatlar (9 bölmə).
- Hamburger paneli (1440px): İstehlakçı hüquqları | Rəqəmsal maliyyə ekosistemi | Beynəlxalq əməkdaşlıq | Maliyyə savadlılığı +
  FinCERT + Naxçıvan.
- `/az/dayaniqli-maliyye`, `/az/maliyye-sabitliyi-hesabati`, `/az/reqemsal-kyc` açılır, sol menyu yeni bölmənindir.
- Admin: "İstinadlar"ın formunda "Menyularda yox" seçilib, "Üst menyu" sətrində panel qeydi var.

## 5. MR mətnləri

### api-cbar-admin

```
feat(db): seed the header navigation from Figma (spec 056)

Adds migration 0042, data only (no schema change):
- new root "Maliyyə sabitliyi" / "Financial stability", third among the roots;
  "Dayanıqlı Maliyyə" (with its subtree) and the two financial-stability reports
  from "Nəşrlər və tədqiqatlar" move under it; addresses (slugs) do not change
- new root "Rəqəmsal maliyyə ekosistemi" / "Digital financial ecosystem" with
  eight empty pages (en titles are drafts); a taken slug gets "-2"
- roots renumbered in the Figma order; four roots set to "no menus", which on a
  root only hides it from the wide-screen hamburger panel of web-cbar-new

Each part runs only in the run that creates its root, so a rerun changes
nothing and later editor changes stand. Skips a database without the legacy
tree and warns (does not fail) without INSERT/UPDATE on the page tables.

Deploy before web-cbar-new. Before prod, check that no root already has
show_in_side_nav = false (query in specs/056 deploy.md §1).
Verified on PGlite with a copy of the test environment's tree: two runs,
empty database, editor change kept.
```

### web-cbar-new

```
feat(shell): nav bar and hamburger panel as in Figma (spec 056)

- the nav bar shows 9 root sections from 1360px (VISIBLE_SECTIONS) and 8 from
  1024px (VISIBLE_SECTIONS_NARROW): nine do not fit there (measured, az and en);
  the 9th moves into the hamburger panel at that width
- a root an editor set to "no menus" (isInDropdownNav false, now on
  NavSection.inDropdownNav) leaves the hamburger panel from 1360px only; the
  bar, the narrower panel, the mobile drawer and the footer keep it
- from 1360px the first three panel sections each open a column and the rest
  stack in the last one (break-before: column), matching Figma 1088:26873;
  Firefox keeps the balanced columns
- docs/navigation-cms-guide.md for editors

Deploy after api-cbar-admin (seed 0042). npm run verify green, tests also on
Node 22.
```

### web-cbar-admin-new

```
feat(pages): explain "no menus" on a section root (spec 056)

On a section root "Menyularda yox" now only hides the section from the site's
wide-screen hamburger panel. The "Saytın menyusunda" card says so in the
option's hint and as a note on the top-menu row (rootPanelHidden,
MENU_BAR_SECTIONS mirrors web-cbar-new VISIBLE_SECTIONS). No API change.

npm run verify green, tests also on Node 22.
```
