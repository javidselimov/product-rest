---
description: "Task list — 033 Müsahibələr və çıxışlar: press-relizin üçüncü tipi və qoşma dili (api-cbar-admin, api-cbar, web-cbar-admin-new, web-cbar-new)"
---

# Tasks: Müsahibələr və çıxışlar — press-relizin üçüncü tipi

**Input**: `specs/033-media-interviews/` — [spec.md](./spec.md), [plan.md](./plan.md),
[research.md](./research.md), [data-model.md](./data-model.md), [contracts/api.md](./contracts/api.md),
[contracts/ui-contract.md](./contracts/ui-contract.md), [quickstart.md](./quickstart.md)

**Branch**: `main` (istifadəçi qərarı, ayrıca branch açılmır). Yollar `product-rest/`-ə nisbətəndir,
başqa cür göstərilməyibsə.

**Testlər**: spec tələb edir (FR-026, FR-033). Funksional yazılır: rol və etiket, `userEvent`, MSW. Əvvəl
test yazılır və qırmızı olduğu görülür, sonra kod. API-lərdə test layihəsi yoxdur: build + route-diff +
test mühitində icra.

**Ümumi qaydalar**

- Kod şərhləri ingiliscədir. Dəyişilən faylda azərbaycanca şərhlər də çevrilir.
- Commit yalnız istifadəçi istəyəndə.
- Spec 032: magic number yoxdur. Yeni kit komponenti yox, mövcud kit importları (`check:kit`).
- `web-cbar-new`-də `prettier --write` işlədilmir.
- Faylların çoxu CRLF-dir: `sed -i` işlədilmir, redaktə Edit alətilə və ya Node ilə. Azərbaycan mətni
  shell ilə yazılmır.
- `verify` nəticəsi `tail`-dən yox, exit code ilə oxunur. Docker-ə toxunulmur.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: paralel icra oluna bilər (ayrı fayl, bitməmiş tapşırıqdan asılı deyil)
- **[Story]**: US1 siyahı, US2 detal və PDF, US3 fayl dili, US4 redaktor axını

---

## Phase 1: Setup

**Purpose**: Çoxgünlük iş üçün gündəliyi açmaq

- [X] T001 Root `FIGMA-REDIZAYN-PLANI.md`-yə "Harada qaldım (033)" əlavə et: Normativ link, 5 istifadəçi
  qərarı, "⛔ Bloklanan (033)" (API real baza ilə yalnız test deployunda, prod inventarı ölçülməyib),
  mərhələlər checkbox ilə. Spec/plan/tasks normativdir, bu fayl gündəlikdir

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: OpenAPI, miqrasiya, EF modeli və saytın tip modeli. Spec-first olduğu üçün controller kodu
bu fazadan əvvəl başlaya bilməz: `.claude/hooks/spec-first.mjs` yeni route-u `dist/openapi.json`-da
tapmasa redaktəni rədd edir

**⚠️ CRITICAL**: T005 istifadəçi təsdiqidir, təsdiqsiz US3 və US4-ün API tapşırıqları başlamır

- [X] T002 `/api-endpoint` axını ilə `api-cbar-admin/openapi/`: `components/schemas/press-releases.yaml`-da
  `type` enum `[1, 2, 3, null]` (`PressReleaseListItem`, `PressReleaseDetail`, `PressReleaseUpsert`), yeni
  `PressReleaseAssetRef` (`allOf` `common.yaml#/AssetRef` + `locale: string | null`) və
  `PressReleaseAssetLocale` (`locale` required, nullable, `az | en | null`); `PressReleaseDetail.assets`
  `AssetRef` əvəzinə `PressReleaseAssetRef`; `paths/press-releases.yaml`-da `type` parametri və yeni
  `assetLocale` (`PUT`, operationId `setPressReleaseAssetLocale`, 204/400/401/403/404); `openapi.yaml`-da
  `/api/v1/press-releases/{id}/assets/{mediaId}/locale`. Mətnlər ingiliscə. Qanunlar `AssetRef`-də qalır
- [X] T003 [P] `api-cbar/openapi/paths/press-releases.yaml` və əlaqəli sxemlər: `type` enum `[1, 2, 3]`,
  təsvirdə `3` interview or speech; `imageUrl` və `assets` təsvirində dil qaydası (`locale` null və ya
  sorğu dili). Yeni route və cavab sahəsi yoxdur
- [X] T004 Hər iki `openapi/` qovluğunda `npm run lint` və `npm run bundle`; `dist/` yenilənir. `npm` üçün
  `NODE_EXTRA_CA_CERTS` lazım ola bilər, TLS yoxlaması söndürülmür
- [X] T005 ⛔ OpenAPI diff-ini istifadəçiyə göstər və təsdiq al. Təsdiqə qədər heç bir controller dəyişmir
- [X] T006 `api-cbar-admin/db/migrations/0017-press-release-asset-details.sql`: yoldaş cədvəl
  `press_release_asset_details (asset_id bigint PRIMARY KEY, locale varchar(5))`, `0016` nümunəsi ilə: FK-lər
  `has_table_privilege` şərti ilə, `cbar_web_ro`-ya `SELECT`. Sütun yox: `ALTER TABLE` paylaşılan mühitlərdə
  yıxılır (research R2). Backfill, `BEGIN`/`COMMIT` yoxdur
- [X] T007 `PressReleaseAssetDetail { long AssetId; string? Locale }`, `PressReleaseAsset.Details` və xəritələmə:
  `src/Cbar.Domain/Entities/Content.cs` və `src/Cbar.Domain/CbarDbContext.cs`, `api-cbar-admin` və `api-cbar`-da
  bayt-bayt eyni. `diff -r` boş qalmalıdır
- [X] T008 `api-cbar-admin` və `api-cbar` üçün `dotnet build` (`dotnet` PATH-da yoxdursa
  `C:/Program Files/dotnet`)
- [X] T009 `web-cbar-new/src/features/press-releases/model/constants.ts` yarat:
  `PRESS_RELEASE_TYPE = { NEWS: '1', ANNOUNCEMENT: '2', INTERVIEW: '3' } as const`.
  `model/schemas.ts`: `PRESS_RELEASE_TYPES` üç dəyər; `typeSchema` transform-u
  `PRESS_RELEASE_TYPES.find((t) => t === String(v)) ?? PRESS_RELEASE_TYPE.NEWS`, ona görə `4` və `undefined`
  xəbər qalır; "the site never shows a third kind" şərhini yenilə.
  `views/press-releases/constants.ts`: `DEFAULT_PRESS_RELEASE_TYPE = PRESS_RELEASE_TYPE.NEWS`
- [X] T010 [P] `web-cbar-admin-new/src/features/press-releases/model/constants.ts`: `INTERVIEW: 3`, şərhdə üç
  tip. `src/shared/testing/handlers/press-releases.ts`: `isValidType` `3`-ü qəbul edir, `INVALID_TYPE`
  `Type must be 1 (news), 2 (announcement) or 3 (interview or speech).`

**Checkpoint**: OpenAPI təsdiqlənib, iki API build olunur, Domain kopyaları eynidir, sayt və panel üçüncü
tipi tanıyır. `npm run typecheck` və mövcud testlər yaşıldır

---

## Phase 3: User Story 1 — Ziyarətçi siyahını görür (Priority: P1) 🎯 MVP

**Goal**: `/{locale}/press-releases?type=3` Xəbərlərin hazır şablonu ilə açılır

**Independent Test**: MSW ilə `type=3`: şəkilli kartlar, link detala aparır, H1 menyu adından gəlir,
node yoxdursa fallback etiket, filtr `type=3`-ü saxlayır. `type=1` və `type=2` testləri dəyişmir

### Tests

- [X] T011 [US1] `web-cbar-new/src/shared/testing/fixtures/press-releases.ts`: `interviewItems` (biri şəkilli,
  biri şəkilsiz); `handlers/press-releases.ts`: `byType`-a `'3'`, tipsiz sorğuda üç siyahı birlikdə
- [X] T012 [US1] `web-cbar-new/src/views/press-releases/press-releases.test.tsx`: yalnız üçüncü tip, şəkilli kart
  (`data-variant="photo"`), şəkilsizdə placeholder, tarix, detal linki; axtarış və tarix filtri `type=3`-ü
  saxlayır, "Filtrləri təmizlə" `?type=3`-ə qaytarır; fallback H1 `Müsahibələr və çıxışlar` və EN-də
  `Interviews and speeches`; `pressReleasesMetadata` başlığı və alternates. Qırmızı olduğunu gör
- [X] T013 [P] [US1] `web-cbar-new/src/app/metadata.test.ts` və ana səhifə testlərini yoxla: ana səhifə loader-i
  yalnız `1`/`2` sorğulayır, üçüncü tip Media tablarına düşmür (Acceptance 1.5). Əhatə yoxdursa ana
  səhifənin mövcud test faylına bir yoxlama əlavə et

### Implementation

- [X] T014 [P] [US1] `web-cbar-new/src/locales/{az,en}/content.json`: `newsList.interviews`
  (`Müsahibələr və çıxışlar` / `Interviews and speeches`)
- [X] T015 [US1] `web-cbar-new/src/views/press-releases/constants.ts`:
  `PRESS_RELEASE_LABEL_KEYS: Record<PressReleaseType, string>`; `loader.ts` `pressReleasesLabel` bu xəritədən
  oxuyur, `type === '2'` budağı qalmır
- [X] T016 [US1] `web-cbar-new/src/views/press-releases/index.tsx`: `variant` `PRESS_RELEASE_TYPE.ANNOUNCEMENT` ilə;
  fayl başlığı şərhini üç tipə uyğunlaşdır. `routes.ts` şərhində `news or announcements` yenilənir

**Checkpoint**: Siyahı MSW-də tam işləyir, `npm run test:run` yaşıldır. Xəbər və Elan siyahısı dəyişməyib

---

## Phase 4: User Story 2 — Ziyarətçi mətni oxuyur və PDF-i yükləyir (Priority: P1)

**Goal**: Detal: H1 → mətn → `Save as PDF` → qalan qoşmalar; örtük, qalereya, tarix yoxdur

**Independent Test**: MSW-də 4 hal (mətn + PDF, yalnız PDF, yalnız mətn, 2 PDF + 2 şəkil). Xəbər və Elan
detalı dəyişmir

### Tests

- [X] T017 [US2] `web-cbar-new/src/shared/testing/fixtures/press-releases.ts`: 4 detal fiksturu `type: 3`
  (`interviewDetailFixture` və yalnız PDF, yalnız mətn, 2 PDF + 2 şəkil variantları); yalnız-PDF
  fiksturunda `content: '<p></p>'`, çünki TipTap boş sahəni belə saxlayır; `handlers/press-releases.ts`
  `details`-ə əlavə
- [X] T018 [P] [US2] `web-cbar-new/src/features/press-releases/model/split-assets.test.ts`: mövcud çağırışlarda
  yalnız forma dəyişir (`{ photos: false }` → `'files'`, `{ photos: true }` → `'photos'`), gözləntilər eyni
  qalır. Yeni: `'document'` rejimi (`cover null`, `gallery []`, `pdf` ilk PDF, ilk şəkil heç yerdə yox, ikinci
  PDF və ikinci şəkil `attachments`-də); `layoutFor` üç tip
- [X] T019 [P] [US2] `web-cbar-new/src/features/press-releases/model/pdf-file-name.test.ts`: `/ \ : * ? " < > |`
  və idarəetmə simvolları çıxır, azərbaycan hərfləri qalır, 120 simvola kəsilir, `.pdf` kəsilmir, boşluqlar
  kənardan təmizlənir, tam təmizlənən başlıqda ehtiyat ad (`document.pdf`)
- [X] T020 [US2] `web-cbar-new/src/views/press-release/press-release.test.tsx`: mətn + PDF sırası, `href`
  `/media/{id}`, `download` başlıqdan, `target` yoxdur; yalnız PDF (boş `<p></p>`-də `CmsContent` yoxdur); yalnız
  mətn (link yoxdur); 2 PDF + 2 şəkil ("Sənədlər"-də ikinci PDF və ikinci şəkil fayl sətri kimi, miniatür yox);
  örtük, qalereya, `time` yoxdur; EN etiketi `Save as PDF`, AZ `PDF kimi yüklə`. Mövcud xəbər və elan
  testlərinə toxunma. Qırmızı olduğunu gör

### Implementation

- [X] T021 [P] [US2] `web-cbar-new/src/locales/{az,en}/content.json`: `newsList.saveAsPdf` (`PDF kimi yüklə` /
  `Save as PDF`)
- [X] T022 [US2] `web-cbar-new/src/features/press-releases/model/split-assets.ts`:
  `export type PressReleaseLayout = 'photos' | 'files' | 'document'`, `layoutFor(type)`,
  `splitPressReleaseAssets(assets, layout = 'photos')`; `SplitAssets`-ə `pdf: MediaAsset | null`. `photos` və
  `files` rejimlərində `pdf: null`, nəticə əvvəlki kimi. Faylın şərhini yenilə
- [X] T023 [P] [US2] `web-cbar-new/src/features/press-releases/model/pdf-file-name.ts`: `pdfFileName(title)`;
  limit `PDF_FILE_NAME_MAX_LENGTH = 120` eyni slice-ın `model/constants.ts`-ində
- [X] T024 [US2] `web-cbar-new/src/views/press-release/loader.ts`: `layout = layoutFor(release.type)`,
  `wrapTables` şərti `layout === 'files'`; `PressReleaseViewData`-ya `layout`, `hasText`
  (`stripHtml(html).trim() !== ''`) və `pdf: { url, fileName } | null`. Şərh üç rejimi izah edir
- [X] T025 [US2] `web-cbar-new/src/views/press-release/index.tsx`: `isAnnouncement` əvəzinə `layout`; `document`
  rejimində `time` yoxdur, `CmsContent` yalnız `hasText` olanda; `tables` `layout === 'files'`;
  `imagesAsFiles={data.layout !== 'photos'}`. Sıra: mətn → düymə → `Attachments`. Xəbər və elanda DOM dəyişmir
  (`CmsContent`-in `mt-6`-sı `time`-dan sonrakı boşluqdur, `document`-də H1 → mətn 36-dır, `SectionShell`
  ölçüsünü `visual-diff`-də yoxla)
- [X] T026 [US2] Eyni faylda `Save as PDF`: `Button asChild`, `variant="outline"`,
  `<a href={pdf.url} download={pdf.fileName}>`, `data-slot="press-release-pdf"`, `data-print="hide"`, `h-14 w-78`,
  ağ fon, 1px `#A3A3A3` üçün semantik token, radius 4, 18/500 lh 28, mətndən 60 aşağı (`mt-15`), ikon yoxdur.
  Hər üç ekranda 312 en. `asChild` nümunəsi: `src/shell/language-switcher.tsx`

**Checkpoint**: US1 + US2 saytda MSW ilə tamdır. 029/030/031 view testləri dəyişmədən yaşıldır

---

## Phase 5: User Story 3 — Hər dildə öz PDF-i açılır (Priority: P1)

**Goal**: Redaktor fayla dil verir, public API yalnız uyğun qoşmaları qaytarır

**Independent Test**: Panel: MSW-də dil seçimi PUT sorğusu göndərir. Sayt: EN fikstürü yalnız EN faylı. API:
test deployunda `locale=az` və `locale=en` fərqli fayl (T046)

### Tests

- [X] T027 [P] [US3] `web-cbar-new/src/shared/testing/`: `handlers/press-releases.ts` detal handleri `locale` sorğu
  parametri ilə qoşmaları `api-cbar` kimi süzür (fiksturda daxili `locale`, cavabdan silinir);
  `views/press-release/press-release.test.tsx`: AZ və EN PDF-də hər dil öz faylı; yalnız AZ PDF-də `/en`-də düymə
  və fayl yoxdur; dilsiz qoşma hər ikisində
- [X] T028 [US3] `web-cbar-admin-new/src/shared/testing/handlers/press-releases.ts`: `PUT ${base}/:id/assets/:mediaId/locale`
  (204; naməlum dil 400; tapılmayan 404), `fixtures/press-releases.ts`-də `locale` sahəsi
- [X] T029 [US3] `web-cbar-admin-new/src/features/press-releases/press-releases.test.tsx`: sətirdə `Fayl dili`
  select-i, dəyişəndə PUT body `{ locale: 'en' }`, `Hər iki dil` → `{ locale: null }`, sonra detail refetch,
  uğursuz sorğuda xəta göstərilir; Qanunlar formasında select yoxdur. Qırmızı olduğunu gör

### Implementation

- [X] T030 [US3] `api-cbar-admin/src/Cbar.AdminApi/Controllers/PressReleasesController.cs` (T005-dən sonra):
  `[HttpPut("{id:int}/assets/{mediaId:long}/locale")]`, `[RequirePermission(Permissions.PressReleases.Update)]`;
  `PressReleaseAssetLocaleDto`-da `locale` sahəsi məcburidir, dəyəri null ola bilər (`[property: JsonRequired]`).
  Qoşmanı `Set<PressReleaseAsset>().Include(a => a.Details)` ilə tap, yoxdursa `NotFound`. `Locale` doludursa
  `db.Locales.AnyAsync` ilə yoxla, yoxdursa `BadRequestProblem`. Audit: `audit.Log("press_releases.set_asset_locale",
  "press_release", id, before: new { mediaId, locale = asset.Details?.Locale }, after: dto)`, köhnə dəyər dəyişməzdən
  əvvəl götürülür, sonra `asset.Details ??= new()`. Cavab 204. `Get` `ThenInclude(a => a.Details)`, `ToDetailDto`-ya
  `a.Details?.Locale`. `DetachAsset` `Include(a => a.Details)`: FK olmayan mühitdə sətir yetim qalmasın
- [X] T031 [US3] `api-cbar/src/Cbar.WebApi/Controllers/PressReleasesController.cs`: siyahı `imageUrl`-də və detal
  `assets`-də `a.Details!.Locale == null || a.Details.Locale == locale` süzməsi, sıradan əvvəl. Cavab forması eynidir, `locale`
  çıxışa əlavə olunmur
- [X] T032 [US3] `dotnet build` hər iki API, `node .claude/skills/sync-openapi/scripts/route-diff.mjs` (repo kökündən),
  fərq olmamalıdır
- [X] T033 [P] [US3] `web-cbar-admin-new/src/entities/media/model/types.ts`: `AttachedAsset` və `attachedAssetSchema`-ya
  `locale: string | null` opsional; `Köhnə panelin…` şərhini ingiliscəyə çevir
- [X] T034 [P] [US3] `web-cbar-admin-new/src/features/assets/api/assets.service.ts`:
  `setLocale(assetsPath, mediaId, locale)` → `PUT ${assetsPath}/${mediaId}/locale` `{ locale }`; fayl şərhi
- [X] T035 [US3] `web-cbar-admin-new/src/features/assets/components/assets-section.tsx`: opsional `localeControl`
  (ui-contract §4), `Select` (`@cbar/lib-react-ui-kit/select`, nümunə `features/crud/components/crud-list-page.tsx`),
  `useMutation` `reorder` kimi, `all` ↔ `null`, `pending` zamanı disabled, xəta `orderError` alert-i ilə eyni yerdə.
  Prop verilməsə DOM dəyişmir. `src/locales/{az,en}/media.json`: `assets.localeChanged`, `assets.localeFailed`
- [X] T036 [US3] `web-cbar-admin-new/src/features/press-releases/components/press-release-attachments-section.tsx`
  və `src/locales/{az,en}/pressReleases.json`: bütün tiplərdə `localeControl`; açarlar `attachments.locale.{label,all,az,en}`

**Checkpoint**: Panel dil dəyişir, API build və route-diff təmizdir, sayt testləri dil qaydasını təsdiqləyir

---

## Phase 6: User Story 4 — Redaktor materialı admin paneldən daxil edir (Priority: P1)

**Goal**: Formada "Müsahibə və çıxış", siyahıda nişan və filtr, qoşmalarda düzgün nişanlar

**Independent Test**: MSW-də `type: 3` yaradılması, nişan, filtr, qoşma nişanları; `type: 4` 400; xəbər və
elan nişanları dəyişmir

### Tests

- [X] T037 [US4] `web-cbar-admin-new/src/features/press-releases/press-releases.test.tsx` (`fixtures/press-releases.ts`-ə
  `type: 3` sətir): forma `type: 3` göndərir; siyahıda nişan; filtr; "Kart şəkli" ilk şəkildə; "PDF düyməsi" AZ və EN
  PDF-də ikisində də, eyni dilli ikinci PDF-də yox; `locale: null` PDF hər iki dil üçün birincidirsə tək nişan; izah
  mətni; `type: 4` 400 xətası formada görünür. Qırmızı olduğunu gör

### Implementation

- [X] T038 [P] [US4] `api-cbar-admin/src/Cbar.AdminApi/Controllers/PressReleasesController.cs`: `private const short
  Interview = 3`; `IsValidType` `null or News or Announcement or Interview`; `InvalidTypeMessage`
  `Type must be 1 (news), 2 (announcement) or 3 (interview or speech).`; XML şərhləri. `dotnet build`
- [X] T039 [P] [US4] `web-cbar-admin-new/src/features/press-releases/model/schemas.ts`: `INTERVIEW` sabiti,
  `PRESS_RELEASE_TYPE_OPTIONS`, `_LABEL_KEYS`, `_PALETTE` (`tertiary`); fayl şərhində üç tip.
  `src/locales/{az,en}/pressReleases.json`: `types.3`
- [X] T040 [US4] `web-cbar-admin-new/src/features/press-releases/components/press-release-attachments-section.tsx`:
  `detail.type === PRESS_RELEASE_TYPE.INTERVIEW` üçün `badgeFor`: şəkil və ya PDF, `az` və `en` üzrə ayrıca hər
  dilin görünən (`locale == null || locale == L`) ilk faylıdırsa `attachments.cardImage` / `attachments.pdfButton`,
  sayt qaydası ilə eyni; `descriptionKey` `attachments.descriptionInterview`. Xəbər və elan axını dəyişmir. Şərh
  yenilənir. `src/locales/{az,en}/pressReleases.json`-a üç açar (ui-contract §4)

**Checkpoint**: Dörd hekayə kodda tamdır

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Gate-lər, sənədlər, ölçü

- [X] T041 `web-cbar-new/docs/media-cms-guide.md`: "Müsahibələr və çıxışlar" bölməsi: node `80` adı
  (`Müsahibələr və çıxışlar` / `Interviews and speeches`), `navUrl` `/press-releases?type=3`, kopya `409`
  `?type=3&copy=1`, material əlavə etmə, fayl dili, kart şəkli qaydası; "Figma adlarına keçid" bölməsində köhnə
  ad varsa yenilə (FR-040)
- [X] T042 [P] Root `CLAUDE.md` və `web-cbar-new/CLAUDE.md` (sətir 108–111): üçüncü tip,
  `splitPressReleaseAssets(assets, layout)`, qoşma dili; `{ photos: false }` izləri silinir (FR-044)
- [X] T043 `/sync-business-logic` (dəyişən modullar) və `/sync-openapi` (`# Sync:` sətri, hər iki API)
- [X] T044 Gate-lər ([quickstart.md](./quickstart.md)): `npm run verify` `web-cbar-admin-new` və `web-cbar-new`
  (exit code), testlər Node 22-də də; `dotnet build` hər iki API; `diff -r` iki `Cbar.Domain` (`bin`/`obj` xaric);
  `route-diff.mjs` (SC-006, SC-007)

### Test deployundan sonra (istifadəçi deploy edir, GitLab; sıra: `api-cbar-admin` → `api-cbar` → panel → sayt)

- [ ] T045 ⛔ `specs/033-media-interviews/quickstart.md` "Test mühitində" addım 1: `0017` tətbiq olunub,
  `api-cbar` qalxır, `cbar_web_ro` `locale`-ni oxuyur
- [ ] T046 ⛔ `quickstart.md` addım 2–8 və 10: real API, dil süzməsi, `type=1`/`type=2` dəyişməyib (SC-003,
  SC-004, SC-005), Chrome və Firefox-da yüklənən faylın adı (R6). Test qaralamasını sil
- [ ] T047 ⛔ `specs/033-media-interviews/visual-diff.md` yarat: siyahı və detal 1728/744/390, Figma rəqəmi +
  `getBoundingClientRect`, ±2px (SC-001, SC-002); tablet və mobil kart ölçüləri burada ölçülür, `#A3A3A3` token
  fərqi və sual/cavab `CmsContent` fərqi qeyd olunur

### Məzmun (kod yox, redaktor işi, sayt deployundan sonra)

- [ ] T048 ⛔ `specs/033-media-interviews/content-inventory.md`-ni prod-da yoxla: id-lər, fayl adları, 404-lər (FR-042)
  və yenilə, sonra redaktorlara təhvil ver. Global Finance EN PDF-i köhnə saytdan yenidən yüklənir
- [ ] T049 ⛔ Redaktor 15 materialı `content-inventory.md` üzrə daxil edir, sonra node `80` və kopya `409` CMS-də
  dəyişir (`web-cbar-new/docs/media-cms-guide.md`, quickstart addım 9). Səhifə `80`-in 44 qoşması hamısı
  yoxlanana qədər silinmir (FR-043)
- [ ] T050 Root `FIGMA-REDIZAYN-PLANI.md`: "Harada qaldım (033)" yekunu, nə edilmədi və niyə

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: asılılıq yoxdur
- **Foundational (Phase 2)**: T002–T004 → **T005 təsdiq** → API kodu. T006–T010 təsdiqdən asılı deyil
- **US1–US2 (Phase 3–4)**: T009-dan sonra başlaya bilər, T005-i gözləmir (MSW ilə)
- **US3–US4 (Phase 5–6)**: API tapşırıqları (T030, T031, T038) T005 və T007-dən sonra; panel tapşırıqları MSW ilə
  T010-dan sonra
- **Polish (Phase 7)**: T041–T044 bütün hekayələrdən sonra. T045–T049 yalnız deploydan sonra

### User Story Dependencies

- **US1**: yalnız T009
- **US2**: T009. US1-dən asılı deyil, amma `content.json` və test fiksturları eyni fayldır, ardıcıl birləşdir
- **US3**: T005, T007. Sayt kodu dəyişmir, yalnız test əlavə olunur; T027 US2-nin düyməsindən asılıdır
- **US4**: T005, T010. T040 US3-ün `locale` sahəsindən (T033) asılıdır

### Within Each User Story

- Test əvvəl yazılır və qırmızı olur, sonra kod
- OpenAPI → EF → controller; sabitlər → model → loader → view
- `press-release-attachments-section.tsx`: T036 → T040; `PressReleasesController.cs` (admin): T030 → T038

### Deploy sırası (kod sırasından fərqlidir)

`api-cbar-admin` (miqrasiya) → `api-cbar` → `web-cbar-admin-new` → `web-cbar-new` → redaktor məzmunu. Hər komponent
ayrıca MR-dir. Sayt deploy olunmadan `type = 3` dərc edilmir: köhnə sayt onu xəbər kimi açar.

### Parallel Opportunities

- **Faza 2**: T003, T010
- **US1**: T013, T014
- **US2**: T018, T019, T021, T023
- **US3**: T027, T033, T034
- **US4**: T038, T039

---

## Parallel Example: User Story 2

```bash
# Testlər, ayrı fayllar:
Task: "split-assets.test.ts: document rejimi və layoutFor"
Task: "pdf-file-name.test.ts: başlıq təmizlənməsi və 120 limit"

# Implementasiya, ayrı fayllar:
Task: "content.json: newsList.saveAsPdf"
Task: "pdf-file-name.ts: pdfFileName(title)"
```

---

## Implementation Strategy

### MVP First

Dörd hekayənin hamısı P1-dir, çünki məzmun yalnız hamısı olanda sayta çıxır: redaktorsuz (US4) material yoxdur, dilsiz
(US3) AZ və EN faylı ayrılmır. Kod baxımından **MVP US1 + US2-dir**: saytın görünüşü MSW ilə tam yoxlanır və API
təsdiqini gözləmir. Deploy üçün minimum dörd hekayənin hamısıdır.

### Incremental Delivery

1. T001–T010: təsdiqlənmiş kontrakt, sxem, tip modeli
2. US1 → siyahı testləri yaşıl
3. US2 → detal testləri yaşıl, Xəbər və Elan dəyişməyib
4. US3 → dil API-də və paneldə
5. US4 → redaktor axını tam
6. T041–T044 gate-lər, sonra istifadəçi deploy edir, T045–T050

---

## Spec əhatəsi

| Tələb | Tapşırıq |
|---|---|
| FR-001 | T002, T010, T038 |
| FR-002 | T006 |
| FR-003 | T007 |
| FR-004, FR-005 | T002, T030 |
| FR-010, FR-011 | T003, T031 |
| FR-020 | T009 |
| FR-021 | T014, T015, T016 |
| FR-022 | T018, T022 |
| FR-023, FR-024 | T020, T023–T026 |
| FR-025 | T018, T020, T044 |
| FR-026 | T012, T018–T020, T027 |
| FR-030 | T010, T039 |
| FR-031 | T033–T036 |
| FR-032 | T036, T040 |
| FR-033 | T029, T037 |
| FR-040 | T041 |
| FR-041, FR-042 | T048 |
| FR-043 | T049 |
| FR-044 | T042, T043 |
| SC-001, SC-002 | T047 |
| SC-003–SC-005 | T046 |
| SC-006, SC-007 | T044 |
