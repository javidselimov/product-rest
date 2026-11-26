---
description: "Task list — 029 Media → Xəbərlər / Elanlar (api-cbar, api-cbar-admin, web-cbar-admin-new, web-cbar-new)"
---

# Tasks: Media → Xəbərlər və Elanlar siyahı və detal səhifələri (Figma)

**Input**: `specs/029-media-news/` — [spec.md](./spec.md), [plan.md](./plan.md),
[research.md](./research.md), [data-model.md](./data-model.md),
[contracts/public-api.md](./contracts/public-api.md), [contracts/admin-api.md](./contracts/admin-api.md),
[contracts/ui-contract.md](./contracts/ui-contract.md), [quickstart.md](./quickstart.md)

**Branch**: `feature/029-media-news`. Yollar `product-rest/`-ə nisbətəndir (`api-cbar/…`,
`web-cbar-new/src/…` və s.).

**Ümumi qaydalar (hər task üçün)**:

- Kod şərhləri **ingiliscə**. Toxunulan hər faylda mövcud azərbaycanca şərhlər də ingiliscəyə
  çevrilir (locale JSON-ları istisna).
- Testlər **funksionaldır** (research R12): istifadəçi əməli → görünən nəticə; element rol/etiketlə
  tapılır, `userEvent`, data MSW-dən real API kontraktı ilə. Render/snapshot/class testi yazılmır.
  Hər test üçün: "davranış qırılsa, düşərmi?" — yox → yazılmır.
- Endpoint dəyişikliyi **spec-first**: əvvəl `openapi/`, lint + bundle, sonra controller.
- UI task-dan əvvəl Figma dəyərləri node-dan oxunur (`figma_node` depth 2–3, `figma_text`;
  id-lər [ui-contract](./contracts/ui-contract.md)).
- `web-cbar-new`-də `prettier --write` işlədilmir (yaddaş).

**Commit-lər** (plan "Mərhələlər"): hər mərhələ bir commit, öz gate-i ilə bitir. Commit yalnız
istifadəçi istəyəndə.

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Setup

- [x] T001 Root `FIGMA-REDIZAYN-PLANI.md`-yə "029 — Media: Xəbərlər / Elanlar" bölməsi: "Harada
  qaldım", qərarlar (R1–R10 qısa), 4 komponent × mərhələ checkbox-ları, deploy sırası
- [x] T002 [P] `web-cbar-new/src/shared/testing/fixtures/press-releases.ts`: elementlərə `type`
  (1 / 2), real formatlı `publishedAt` (fərqli günlər, filtr testləri üçün ən azı 3 gün sərhədi,
  biri `20:30Z` — Bakıda növbəti gün), başlıqlarda axtarış üçün tanınan söz ("Dünya Bankı" 3
  dəfə, böyük/kiçik fərqli), biri `imageUrl: null`. Detal fikstürləri: `pressReleaseDetailFixture`
  (`type: 1`, 5 şəkil + 1 PDF qoşma, `SortOrder` sırası ilə), `announcementDetailFixture` (`type: 2`,
  1 şəkil), `noImageDetailFixture` (0 şəkil, 1 PDF). Fayl daxilində şərhlər ingiliscə

---

## Phase 2: Foundational (bütün hekayələrin əsası)

**Məqsəd**: Public API `type` sahəsi və filtrləri, frontend API funksiyası və MSW handler-i. US1–US3
bundan asılıdır. US4 (admin) asılı deyil.

### api-cbar (mərhələ 2 — commit `feat(api-cbar): 029 press release search and date filters`)

- [x] T003 `api-cbar/openapi/components/parameters.yaml`-a `Query` (`q`, string, maxLength 200),
  `DateFrom` / `DateTo` (`from`/`to`, `format: date`) parametrləri — mövcud `Locale`/`Page` üslubunda
- [x] T004 `api-cbar/openapi/paths/press-releases.yaml` `List.get.parameters`-ə `q`, `from`, `to`
  (təsvirlər contracts/public-api.md §1 cədvəlindən: Bakı gün sərhədi, `%`/`_` hərfi, `from > to` →
  boş); `type` təsviri "1 = news, 2 = announcement; omitted = both"
- [x] T005 `api-cbar/openapi/components/schemas/press-releases.yaml`: siyahı elementi və
  `PressReleaseDetail`-ə `type` (integer, enum [1, 2], required). Sonra `cd api-cbar/openapi &&
  npm run lint && npm run bundle && npm run contract && npm run drift` təmiz
- [x] T006 `api-cbar/src/Cbar.WebApi/Controllers/PressReleasesController.cs` `GetList`:
  `[FromQuery] string? q`, `[FromQuery] DateOnly? from`, `[FromQuery] DateOnly? to`. `q` trim, boş →
  null, > 200 → `BadRequest()` (mövcud public xəta forması). `ILIKE` escape köməkçisi (`\`, `%`, `_`
  → `\` prefiksi; `EF.Functions.ILike(t.Title, pattern, "\\")`). Tarix: `BakuOffset =
  TimeSpan.FromHours(4)`; `from` → `new DateTimeOffset(from.ToDateTime(TimeOnly.MinValue), BakuOffset)`
  `≤ PublishedAt`; `to` → `< (to+1)` eyni qayda. Projeksiyaya `type = t.PressRelease.Type`.
  Mövcud şərhləri ingiliscəyə çevir
- [x] T007 Eyni controller `GetBySlug` projeksiyasına `type`. **R9 yoxlaması**: hər iki sorğunun
  `ToQueryString()` çıxışını müvəqqəti kodla (commit olunmur — scratchpad konsol layihəsi və ya
  müvəqqəti log) götür, `deleted_at IS NULL` axtar. Nəticəni `specs/029-media-news/research.md` R9-a
  "Ölçmə" sətri kimi yaz; yoxdursa sorğulara `&& t.PressRelease.DeletedAt == null` əlavə et
- [x] T008 `dotnet build api-cbar/src/Cbar.WebApi` (0 xəta, yeni xəbərdarlıq yox);
  `node .claude/skills/sync-openapi/scripts/route-diff.mjs` route fərqi yoxdur

### web-cbar-new əsas (mərhələ 4-ün başlanğıcı)

- [x] T009 `web-cbar-new/src/features/press-releases/model/schemas.ts`: list item-ə `type:
  z.number().int().optional().transform(v => v === 2 ? '2' : '1')` (köhnə API sahəni göndərmirsə
  `'1'`, R2); `PRESS_RELEASE_TYPES` qalır. Şərhlər ingiliscə
- [x] T010 `web-cbar-new/src/features/press-releases/api/press-releases.api.ts`:
  `getPressReleases(locale, { page, pageSize, type, q, from, to })` — `URLSearchParams`, boş dəyərlər
  atlanır. `web-cbar-new/src/views/home/loader.ts` çağırışlarını yeni imzaya keçir (davranış eyni).
  Mövcud `press-releases.api.test.ts`-i yeni imzaya uyğunlaşdır: sorğu URL-ində `q`, `from`, `to`,
  `type` düzgün gedir, boşlar getmir (funksional — MSW-də sorğunu tut)
- [x] T011 `web-cbar-new/src/shared/testing/handlers/press-releases.ts`: siyahı handler-i real API
  kimi süzür — `type` (yoxdursa hər ikisi), `q` (case-insensitive alt-sətir başlıqda), `from`/`to`
  (Bakı `+04:00` günü), səhv tarix → 400, `q` > 200 → 400; `type` sahəsi cavabda. Detal handler-i
  slug → uyğun fikstür (T002), `yoxdur` → 404

**Checkpoint**: API build olunur, frontend testləri köhnə davranışla yaşıl (`npm run test:run`).

---

## Phase 3: User Story 1 — Xəbərlər siyahısı Figma şablonunda (P1) 🎯 MVP

**Məqsəd**: `/press-releases[?type=1|2]` Media şablonunda, 3 sütunlu kart grid-i, 9/səhifə,
paginasiya. Filtr sətri bu fazada **görünmür** (US2).

**Independent test**: `/az/press-releases`, `?type=2` — H1, breadcrumb, aktiv menyu bəndi, 9 kart,
şəkilsiz kartda boz qutu, paginasiya; 1728/744/390-da Figma ilə ölçmə.

### Tests (US1)

- [x] T012 [P] [US1] `web-cbar-new/src/views/press-releases/press-releases.test.tsx` — **yenidən
  yazılır** (köhnə "Hamısı/Relizlər" testləri silinir). Media ağacı `server.use` ilə
  (`fixtures/media-section.ts`, Xəbərlər bəndi `navUrl /press-releases?type=1`). Ssenarilər:
  (a) tipsiz URL → loader API-yə `type=1&pageSize=9` göndərir, H1 "Xəbərlər", menyuda "Xəbərlər"
  `aria-current="page"`, breadcrumb son elementi "Xəbərlər";
  (b) `type=2` → H1 "Elanlar", yalnız elan başlıqları, menyuda "Elanlar" aktiv;
  (c) kartlar: hər kart başlığı detala aparan linkdir (`href` slug-la), tarix `dd.mm.yyyy`;
  şəkilsiz kartın da linki və başlığı var;
  (d) 20 elementdə 2-ci səhifə linki `?type=1&page=2`;
  (e) `type=abc`, `page=-1` → `type=1`, `page=1` (səhifə sınmır);
  (f) siyahı 500 → şablon (breadcrumb, menyu) qalır, xəta vəziyyəti görünür;
  (g) en locale: "News"/"Announcements"

### Implementation (US1)

- [x] T013 [P] [US1] `web-cbar-new/src/app/globals.css` site token blokuna
  `--site-image-placeholder: var(--ui-color-neutral-200); /* #E5E5E5 — news card image box */` və
  `@theme`-də `--color-site-image-placeholder`. Route B bloku toxunulmur. Kit neutral-200-ün
  `#E5E5E5` olduğunu kit CSS-dən yoxla
- [x] T014 [P] [US1] `web-cbar-new/src/locales/{az,en}/content.json`: data-model §6 `news.*` açarları
  (`news.title`, `news.announcementsTitle`, `news.empty`, `news.noResults` — filtr/qalereya açarları
  US2/US3-də). `key-parity`, `utf8-guard` keçir
- [x] T015 [US1] Yeni `web-cbar-new/src/widgets/news-grid/{news-grid.tsx,index.ts}`: `NewsGrid({ items })`
  server komponenti, `NewsCardItem` tipi (data-model §4.2). `<ul>` grid: mobil 1, `tab:` 2,
  `desk:` 3 sütun, `gap-6`. Kart = bütöv `next/link`: şəkil qutusu `aspect-[312/197]`
  `bg-site-image-placeholder` + `next/image fill object-cover alt=""` (`sizes` sütun sayına görə),
  `mt-6` tarix `<time dateTime>` 16/600 lh28 `text-muted-foreground`, `mt-4` `<h2>` 20/600 lh28
  `text-foreground`, hover başlıq `text-primary`. Ölçülər ui-contract §2.1 (Figma `1048:20711`,
  tablet `1662:30138`)
- [x] T016 [US1] `web-cbar-new/src/views/press-releases/loader.ts` yenidən yazılır: `loadPressReleases(
  locale, searchParams)` → `NewsListData` (data-model §4.2). `type` default `'1'`; `getPressReleases`
  + `getPagesTree` `Promise.allSettled`; H1 = `sectionPageTitle(tree, locale, typedHref)` (media-galleries
  loader-indəki köməkçi — `views` arası import qadağandırsa `entities/page-node`-a köçür) ?? i18n;
  `buildSectionShell({ section: 'media', current: { href: typedHref }, … })`; `NEWS_PAGE_SIZE = 9`;
  kartlar `formatDate`. Şərhlər ingiliscə
- [x] T017 [US1] `web-cbar-new/src/views/press-releases/index.tsx` yenidən yazılır: `SectionShell`
  (`title`), `NewsGrid` / `EmptyState news.empty` / `ErrorState`, `ListPagination` (`params`: type,
  q, from, to; `className` `mt-15 flex justify-end` — Figma 60). Köhnə tip düymələri silinir
- [x] T018 [US1] `web-cbar-new/src/app/[locale]/(content)/press-releases/page.tsx`:
  `generateMetadata` başlığı növə görə (`searchParams.type`), `alternates` tipli ünvanla. Şərhlər
  ingiliscə
- [x] T019 [US1] İstifadəsiz qalanları təmizlə: `content.json`-da `releases`, `type` (press-reliz
  kontekstində), `widgets/content-list` press-reliz istifadəsi bitirsə widget başqa yerdə işlənirmi
  — işlənmirsə silinmir, yalnız yoxlanır (laws və s.). `npm run verify` yaşıl

**Checkpoint**: US1 tək başına deploy oluna bilər (filtrsiz Figma siyahısı).

---

## Phase 4: User Story 2 — Axtarış və tarix aralığı filtri (P2)

**Məqsəd**: Filtr sətri: axtarış, tarix aralığı, "Filtrləri təmizlə", "Axtar"; URL-də saxlanır, JS-siz.

**Independent test**: Fikstürdə məlum başlıq/tarixlərlə filtr kombinasiyaları; paginasiya filtri
saxlayır; təmizlə; boş nəticə; JS-siz (forma native GET).

**Asılılıq**: Phase 2 (API filtrləri). Real filtrləmə test mühitində yalnız `api-cbar` deploy-undan
sonra görünür — o vaxta qədər MSW testləri sübutdur.

### Tests (US2)

- [x] T020 [P] [US2] `web-cbar-new/src/views/press-releases/press-releases.test.tsx`-ə filtr
  ssenariləri (loader + view birlikdə, MSW real süzgəclə):
  (a) `q=dünya bankı` → yalnız 3 "Dünya Bankı" kartı, axtarış sahəsinin dəyəri "dünya bankı";
  (b) `from=…&to=…` → yalnız aralıq günləri (Bakı sərhədindəki `20:30Z` elementi düzgün günə düşür),
  tarix sahələri doludur;
  (c) `q` + tarix birlikdə; paginasiya linkləri `q`, `from`, `to`, `type`-ı saxlayır, `page` var;
  (d) uyğunsuz `q` → "Heç nə tapılmadı", sahələr dolu, paginasiya yoxdur;
  (e) "Filtrləri təmizlə" linki `/{locale}/press-releases?type=1` (Elanlarda `type=2`), filtr yox;
  (f) forma `method="get"`, `action` siyahı ünvanı, gizli `type` input-u, `page` göndərmir —
  `userEvent` ilə sahəni doldurub `form`-un `FormData`-sını yoxla (JS-siz göndərmə ilə eyni məlumat);
  (g) səhv `from=abc` → filtr atılır, API-yə getmir, siyahı gəlir; `from > to` → boş nəticə mesajı

### Implementation (US2)

- [x] T021 [P] [US2] `content.json` (az/en): `news.filterLabel`, `news.searchLabel`,
  `news.searchPlaceholder`, `news.dateRange`, `news.dateFrom`, `news.dateTo`, `news.submit`,
  `news.clear`
- [x] T022 [US2] Yeni `web-cbar-new/src/views/press-releases/news-filter.tsx` (server):
  `<form method="get" action role="search" aria-label>`; gizli `type`; axtarış `<input type="search"
  name="q" maxLength={200} defaultValue aria-label>` kit `inputVariants({ size: 'md' })` (h44);
  tarix qrupu `role="group"` bir çərçivədə iki çərçivəsiz `<input type="date" name="from|to">` +
  "–"; sağda "Filtrləri təmizlə" `<a>` (14/500 lh20 underline px4) və kit `Button` primary
  `type="submit"` 144×44. Layout ui-contract §2: desktop `justify-between` sətir, sahələr 312, gap 24;
  `< desk` alt-alta gap 16, tam en. `inputVariants` client modulundadırsa `date-field.tsx` kimi həll
  et (yeni `'use client'` lazım olarsa — ui-contract §5-i yenilə). Figma `1048:18772`, `1658:13840`
- [x] T023 [US2] `views/press-releases/loader.ts`: `q` (`queryParam`), `from`/`to` (`dateParam`) API-yə
  ötürülür; `filters` data-ya; `hasFilters` → boş nəticədə `news.noResults` vs `news.empty`.
  `index.tsx`-də H1 ilə grid arasında `NewsFilter` (H1→filtr 36, filtr→grid 60)

**Checkpoint**: US1 + US2 — tam siyahı.

---

## Phase 5: User Story 3 — Detal: örtük, fotoqalereya, qoşmalar (P2)

**Məqsəd**: Detal Media şablonunda, 4 səviyyəli breadcrumb, örtük, tarix, mətn, qoşmalar, qalereya.

**Independent test**: 5 şəkil + PDF, 1 şəkil, 0 şəkil fikstürləri; Elan detalı; qalereya klaviatura.

### Tests (US3)

- [x] T024 [P] [US3] `web-cbar-new/src/features/press-releases/model/split-assets.test.ts`:
  `splitPressReleaseAssets` — 0 şəkil, 1 şəkil, 5 şəkil + PDF qarışıq sıra (sıra qorunur, PDF
  qoşmalarda, şəkil qoşmalarda yox), `image/svg+xml` şəkil sayılır
- [x] T025 [P] [US3] `web-cbar-new/src/widgets/photo-gallery/photo-gallery.test.tsx` (`userEvent`):
  (a) ilk açılışda böyük şəkil 1-ci, 1-ci miniatür `aria-current="true"`, canlı bölgə "Şəkil 1 / 4",
  "Əvvəlki" deaktiv;
  (b) 3-cü miniatürə klik → böyük şəklin `src`-i 3-cü şəklin ünvanını daşıyır, `aria-current` keçir,
  canlı bölgə "Şəkil 3 / 4";
  (c) "Növbəti" düyməsi ilə sona qədər → sonda deaktiv, dövr etmir;
  (d) miniatür fokusdayken `→`/`←` seçimi dəyişir;
  (e) böyük şəkil linki orijinal fayla (`/media/{id}`), `target="_blank"`
- [x] T026 [P] [US3] `web-cbar-new/src/views/press-release/press-release.test.tsx` (yeni; köhnə
  detal testi varsa birləşdir): (a) 5 şəkil + PDF → örtük şəkli 1-ci şəkil, qalereyada 4 miniatür,
  PDF qoşmalar siyahısında, şəkil adları qoşmalarda yoxdur; (b) 1 şəkil → örtük var, qalereya
  bölgəsi (`region` "Fotoqalereya") yoxdur; (c) 0 şəkil → `img` yoxdur, tarix və mətn var;
  (d) `type: 2` → breadcrumb "Ana səhifə › Media › Elanlar › {başlıq}", menyuda "Elanlar" aktiv,
  son crumb link deyil; (e) `type` sahəsiz cavab → "Xəbərlər"; (f) `yoxdur` slug → `notFound`

### Implementation (US3)

- [x] T027 [P] [US3] `web-cbar-new/src/features/press-releases/model/split-assets.ts` +
  `schemas.ts` detal sxeminə `type` (T009 kimi) — `splitPressReleaseAssets` (data-model §4.4)
- [x] T028 [P] [US3] `content.json` (az/en): `news.gallery.*`, `news.imageAlt`
- [x] T029 [US3] Yeni `web-cbar-new/src/widgets/photo-gallery/{photo-gallery.tsx,index.ts}`
  (`'use client'`): props `images: { id, url, alt }[]`, `labels` (serverdən tərcümə olunmuş — client-də
  `getT` yoxdursa); `useState(index)`; böyük şəkil `aspect-[984/601] object-contain
  bg-site-surface-muted`, orijinala link; sıra: kit `IconButton` 44 (`CaretLeft/Right`, aktiv
  `border-primary`), miniatür düymələri 180×124 gap 24 `overflow-x-auto snap-x`, seçilmiş 2px
  `border-primary` inset; `scrollIntoView({ inline: 'nearest', block: 'nearest' })`; ←/→ zolaqda;
  vizual gizli `aria-live="polite"`. Figma `1652:36210`, `1652:36242`. `next/image` `sizes`
- [x] T030 [US3] `web-cbar-new/src/views/press-release/loader.ts` yenidən yazılır (data-model §4.3):
  `getPressRelease` + `getPagesTree`; `type` → tipli siyahı ünvanı → `buildSectionShell({ section:
  'media', current: { href }, trail: title, … })`; `splitPressReleaseAssets` → `cover`, `gallery`,
  `attachments`; `dateLabel` `formatDate`. `cache()` qalır. Şərhlər ingiliscə
- [x] T031 [US3] `web-cbar-new/src/views/press-release/index.tsx` yenidən yazılır: `SectionShell`
  (`title` H1); örtük `aspect-[984/502] object-cover priority` (H1→örtük 36, örtük→mətn 32); tarix
  14/400 lh28; `CmsContent` (tarix→mətn 24, mövcud variant 028 Media ilə eyni); `Attachments`
  (yalnız varsa); `PhotoGallery` (mətn→qalereya 36, yalnız `gallery.length > 0`). `BackLink` və `Card`
  çərçivəsi silinir. Figma `1298:19683`, `1298:18952`; tablet/mobil `1658:14818`, `1658:15384`
- [x] T032 [US3] `web-cbar-new/CLAUDE.md` `'use client'` siyahısına `photo-gallery (spec 029)`;
  `content.json`-da `back.pressReleases` istifadəsizdirsə sil

**Checkpoint**: US1–US3 — sayt tərəfi tam.

---

## Phase 6: User Story 4 — Admin: "Növ" sahəsi, sütunu, filtri (P3)

**Məqsəd**: Redaktor Xəbər/Elan seçir; admin API səssiz `type=0` yazmır.

**Independent test**: Admin-də "Elan" yaradılır → saytda yalnız `type=2` siyahısında; siyahı filtri;
`type` göndərilməyən PUT növü dəyişmir.

### api-cbar-admin (mərhələ 1 — commit `fix(api-cbar-admin): 029 press release type filter and validation`)

- [x] T033 [US4] `api-cbar-admin/openapi/components/parameters.yaml`: `PressReleaseType` (`type`,
  int16, enum [1, 2]); `paths/press-releases.yaml` siyahıya əlavə; upsert sxemində `type` nullable,
  təsvir (null → POST 1 / PUT saxlanır), `400` cavabı. Siyahı elementində `type` sənədləşdirilib —
  yoxdursa əlavə. `npm run lint && npm run bundle && npm run contract && npm run drift`
- [x] T034 [US4] `api-cbar-admin/src/Cbar.AdminApi/Controllers/PressReleasesController.cs`:
  `List` `[FromQuery] short? type` filtri; `PressReleaseUpsertDto.Type` → `short?`; Create:
  `dto.Type ?? 1`; Update: `dto.Type ?? entity.Type`; `is not (1 or 2)` → `BadRequestProblem("Type
  must be 1 (news) or 2 (announcement).")` (validasiya entity dəyişməmişdən əvvəl). Faylda
  azərbaycanca şərh varsa ingiliscəyə. `dotnet build api-cbar-admin/src/Cbar.AdminApi`; route-diff

### web-cbar-admin-new (mərhələ 3 — commit `feat(web-cbar-admin-new): 029 press release type field`)

- [x] T035 [P] [US4] `web-cbar-admin-new/src/locales/{az,en}/pressReleases.json`: `fields.type`,
  `columns.type`, `filters.type` (Növ / Type), `types.1` (Xəbər / News), `types.2` (Elan /
  Announcement). `check:i18n` keçir
- [x] T036 [US4] `web-cbar-admin-new/src/features/press-releases/model/schemas.ts`: row və detail-ə
  `type: z.number().int()`; `PRESS_RELEASE_TYPE_OPTIONS` (data-model §5). Şərhlər ingiliscə
- [x] T037 [US4] `web-cbar-admin-new/src/features/press-releases/model/module.ts`: `fields`-də
  `status`-dan əvvəl `type` select (`valueAsNumber: true`, `defaultValue: '1'`, `required`),
  `columns`-a `type` (`render: 'badge'`, `badgeLabelKey`, palitra), `filters`-ə `type` select.
  Şərhlər ingiliscə
- [x] T038 [US4] `web-cbar-admin-new/src/shared/testing/handlers/press-releases.ts` + mock sətirləri
  (`PressReleaseMockRow`-a `type`): siyahı `type` query filtri; POST/PUT contracts/admin-api.md §2
  cədvəli (null → 1 / saxlanır, `∉ {1,2}` → 400 problem+json `message`)
- [x] T039 [US4] `web-cbar-admin-new/src/features/press-releases/press-releases.test.tsx`-ə
  funksional ssenarilər: (a) yeni forma — "Növ" "Xəbər" seçili; "Elan" seç, doldur, saxla → POST
  gövdəsində `type: 2` (MSW-də tutulur); (b) mövcud elanı redaktə et (növə toxunmadan), saxla → PUT
  gövdəsində `type: 2`; (c) siyahıda "Növ: Elan" filtri → sorğuda `type=2`, cədvəldə yalnız elanlar,
  "Elan" badge görünür. `npm run verify` yaşıl

**Checkpoint**: Admin tərəfi tam; SC-004 deploy-dan sonra yoxlanılır.

---

## Phase 7: Polish & cross-cutting

- [x] T040 `web-cbar-new`: `npm run verify` + `npx -p node@22 npm run test:run`;
  `web-cbar-admin-new`: `npm run verify`. Hər ikisi yaşıl, nəticə tracker-ə
- [x] T041 `npm run local:testcbar` (web-cbar-new :3002): quickstart §3 əl ilə addımları; 1728, 744,
  390-da siyahı və detal ölçmələri (`getBoundingClientRect` vs Figma) →
  `specs/029-media-news/visual-diff.md` (028 formatında; qəbul edilmiş fərqlər: native tarix
  placeholder-i, H1 `#333`, tarix rəngi). JS-siz axtarış yoxlaması
- [ ] T042 [P] `business_logic/new_business_logic.md` və `diff_report_logic.md`-də press-reliz
  bölməsini `/sync-business-logic press-releases` ilə yenilə (tarix filtri pariteti bərpa olunub)
- [ ] T043 [P] `/sync-openapi` ilə hər iki API spec-inin `# Sync:` sətrini yenilə (route-diff təmiz)
- [x] T044 Root `FIGMA-REDIZAYN-PLANI.md` tracker-i yekunlaşdır; deploy sırası (quickstart §5) və
  deploy-dan sonra test mühiti ssenariləri (quickstart §2, SC-004, SC-005) "gözləyir" kimi qeyd

---

## Dependencies & Execution Order

```text
Phase 1 (T001–T002)
   └─► Phase 2 Foundational: api-cbar (T003–T008) ─┐
                             web-cbar-new (T009–T011)┴─► US1 (T012–T019) ─► US2 (T020–T023)
                                                                         └─► US3 (T024–T032)
US4 (T033–T039) — Phase 1-dən sonra istənilən vaxt, digərlərindən asılı deyil
Polish (T040–T044) — hamısından sonra
```

- US2 və US3 hər ikisi US1-in loader/view qabığından asılıdır, bir-birindən yox (fərqli view-lar).
- Deploy sırası (commit sırası deyil): `api-cbar-admin` → `api-cbar` → `web-cbar-admin-new` →
  `web-cbar-new`.

### Story daxilində

Testlər (funksional) əvvəl yazılır və qırmızı olur → implementasiya → yaşıl → gate.

## Parallel nümunələr

- **Phase 2**: T003–T008 (api-cbar, C#/YAML) ∥ T009–T011 (web-cbar-new TS) — fərqli repo-lar.
- **US1**: T012 (test) ∥ T013 (token) ∥ T014 (i18n); sonra T015 → T016 → T017.
- **US3**: T024 ∥ T025 ∥ T026 ∥ T027 ∥ T028; sonra T029 → T030 → T031.
- **US4**: bütöv faza digər fazalarla paralel (fərqli iki repo); daxildə T035 ∥ T036.

## Implementation strategy

1. **MVP** = Phase 1 + 2 + US1: Figma siyahısı filtrsiz, ünvanlar eyni. Tək başına dəyərlidir.
2. **US4-ü erkən** götürmək tövsiyə olunur (gizli `type=0` bug-ı) — admin API hissəsi (T033–T034)
   kiçikdir və hər şeydən əvvəl deploy oluna bilər.
3. Sonra US2 (filtr) və US3 (detal) — istənilən sırada.
4. Polish: ölçmə, sync, tracker.
