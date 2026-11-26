# Tasks: FinCERT səhifəsi — Figma dizaynı və ayrıca admin bölməsi

**Input**: `specs/053-fincert-page/`: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

**Tests**:
- Frontend testləri davranış testləridir: rol, `userEvent`, MSW (yaddaş `functional-component-tests`). `frontend-standards` TDD tələb edir: test
  tapşırığı implementasiyadan əvvəl gəlir və əvvəl qırmızı olmalıdır.
- Bu spec yeni `AboutLayoutKind` əlavə etmir, layout fixture guard tələb olunmur.
- API-lərdə test layihəsi yoxdur: `dotnet build` + PGlite üzərində endpoint icrası (`quickstart.md` §2–§4, yaddaş `pglite-api-testing`) + route-diff.

**Təşkili**: Tapşırıqlar user story-lər üzrə qruplaşdırılıb. Hər komponent ayrıca merge request-dir. Deploy sırası: `api-cbar-admin` (MR 1) →
`api-cbar` (MR 2) → `web-cbar-admin-new` (MR 3) → `web-cbar-new` (MR 4). Workspace sənədləri və `specs/` ayrıca commit-dir. Commit yalnız istəklə
edilir.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: paralel işlənə bilər (fərqli fayllar, açıq asılılıq yoxdur)
- **[Story]**: aid olduğu user story (spec.md):
  - US1 — ziyarətçi FinCERT səhifəsini Figma dizaynında görür — P1
  - US2 — redaktor FinCERT-i admin bölməsində redaktə edir — P1
  - US3 — köhnə məzmun avtomatik köçürülür — P1
  - US4 — səhifə formasında sol menyuda bölmə işarələnir — P2
  - US5 — köhnə ünvanlar və fallback — P3

## Yol qısaltmaları

- `ADMIN-API` = `product-rest/api-cbar-admin` · `WEB-API` = `product-rest/api-cbar`
- `ADMIN` = `product-rest/web-cbar-admin-new` · `SITE` = `product-rest/web-cbar-new`
- `SEED` = `specs/053-fincert-page/seed`
- `FIN-SITE` = `SITE/src/features/fincert` · `FIN-W` = `SITE/src/widgets/fincert` · `FIN-ADMIN` = `ADMIN/src/features/fincert`

## Ümumi qaydalar (hər tapşırıq üçün)

- **Frontend skill qaydası** (`.claude/hooks/frontend-skills.mjs`): `SITE` və ya `ADMIN` tapşırığına başlamazdan əvvəl bu skill-lər yüklənir:
  `senior-front`, `frontendpatterns` və həmin komponentin `frontend-standards`, `ui-kit-usage` skill-ləri. Kod `plan.md` "Frontend Skills Gate"
  cədvəlinə uyğun yazılır.
- Yeni şərhlər ingiliscə yazılır (yaddaş `code-comments-english`). UI mətni yalnız i18n açarı ilə verilir, az və en.
- Rəqəmlər adlı sabitdir (spec 032): `FIN-SITE/model/constants.ts`, `FIN-W/constants.ts`, `FIN-ADMIN/model/constants.ts`.
- `SITE`-da `prettier --write` işlədilmir. Fayllar Edit və ya Node ilə redaktə olunur (yaddaş `windows-shell-crlf`, `no-prettier-write-web-cbar-new`).
  Köməkçi skriptlər və test API cavabları `.tmp-053/`-dədir (yaddaş `fork-agents-share-tmp`).
- `SITE`-da `dangerouslySetInnerHTML` yalnız `widgets/cms-content`-dədir. Yeni `'use client'` yoxdur. `Reveal` iç-içə olmur.
- Figma-da gizli qatlar ("On this page", "Anchors", "İnsident hesabatı") qurulmur.
- API endpoint-ləri spec-first yazılır: OpenAPI əvvəl gəlir (T002–T004). `.claude/hooks/spec-first.mjs` bundle-da olmayan route-u rədd edir.
- `Cbar.Domain` iki nüsxədə bayt-bayt eynidir. `dotnet` `C:/Program Files/dotnet/dotnet`-dədir. Docker işlətmə (yaddaş `dotnet-sdk-local-build`).

---

## Phase 1: Setup

**Purpose**: köhnə məzmunun baza xətti və spec-first kontraktlar.

- [X] T001 Test API-dən `GET /api/v1/pages/fincert?locale=az` və `?locale=en` cavablarını `.tmp-053/api/`-yə yaz. `.tmp-053/baseline.json`-a bunları çıxar (SC-002 baza xətti):
  - istiqamət başlıqlarının sayı (az: bir bəndli `<ol><li><strong>`; en: `h3` "1."–"4.");
  - hər istiqamətin `li` sayı;
  - e-poçt, telefon, portal və RFC linkləri.
- [X] T002 [P] `ADMIN-API/openapi/paths/fincert.yaml` + `openapi.yaml` `paths` sətirləri. Əhatə: `contracts/admin-api.md`-dəki bütün route-lar (`fincert/settings`, `fincert/directions[/{id}]`, `fincert/directions/order`, `fincert/memberships[/{id}]`, `fincert/memberships/order`), DTO sxemləri, 400/404 `problem+json`. Sonra `npm run lint && npm run bundle` (`ADMIN-API/openapi`)
- [X] T003 [P] `WEB-API/openapi/paths/fincert.yaml` + `openapi.yaml`: `GET /api/v1/fincert` (`contracts/public-api.md`). Sonra `npm run lint && npm run bundle` (`WEB-API/openapi`)
- [X] T004 OpenAPI dəyişikliklərini istifadəçiyə təsdiq üçün göstər (spec-first qaydası, `/api-endpoint` skill-i). Təsdiqsiz controller yazılmır

**Checkpoint**: baza xətti yazılıb, iki OpenAPI bundle hazırdır və təsdiqlənib.

---

## Phase 2: Foundational (bütün hekayələr bundan asılıdır)

**Purpose**: sxem, entity-lər, ictimai endpoint və saytın paylaşılan qatı.

### Sxem (`api-cbar-admin`, MR 1)

- [X] T005 `ADMIN-API/db/migrations/0036-fincert.sql`. Tələblər:
  - `data-model.md`-dəki 6 cədvəl: `fincert_settings` (`CHECK (id = 1)`), `fincert_setting_translations`, `fincert_directions`, `fincert_direction_translations`, `fincert_memberships`, `fincert_membership_translations`;
  - indekslər;
  - şərti FK DO bloku (0032 kimi: `users`, `media_assets`, `locales`);
  - `set_updated_at` trigger-ləri;
  - `cbar_web_ro` GRANT;
  - `fincert.read|create|update|delete` icazələri + `moderator` (0034 nümunəsi, `INSERT` yoxdursa `RAISE WARNING`);
  - `IF NOT EXISTS`, BEGIN/COMMIT yox.
- [X] T006 [P] `ADMIN-API/src/Cbar.Domain/Entities/Fincert.cs` və `ADMIN-API/src/Cbar.Domain/CbarDbContext.cs` mapping-i.
  - Entity-lər: `FincertSettings`, `FincertSettingsTranslation`, `FincertDirection`, `FincertDirectionTranslation`, `FincertMembership`, `FincertMembershipTranslation`.
  - Mapping: snake_case cədvəl/sütun, `content_status` enum, soft-delete filtri controller-də.
  - Hər class üçün ingiliscə `<summary>` (IFI entity-si kimi).
- [X] T007 T006-nın fayllarını `WEB-API/src/Cbar.Domain/`-a bayt-bayt köçür. `git diff --no-index WEB-API/src/Cbar.Domain ADMIN-API/src/Cbar.Domain` boş olmalıdır
- [X] T008 [P] `ADMIN-API/src/Cbar.AdminApi/Authorization/Permissions.cs` (+ `PermissionMatrix.cs` lazım olsa): `Fincert.Read/Create/Update/Delete`
- [X] T009 `dotnet build ADMIN-API` və `dotnet build WEB-API`. PGlite ilə boş bazada `api-cbar-admin`-i start et: `0036` tətbiq olunur. İkinci start heç nə etmir (quickstart §2)

### İctimai endpoint (`api-cbar`, MR 2)

- [X] T010 `WEB-API/src/Cbar.WebApi/Controllers/FincertController.cs`: `GET /api/v1/fincert?locale=`.
  - Cavab forması `contracts/public-api.md`-dəki kimidir.
  - Görünürlük `data-model.md`-dəki qaydalarla: `published`, `deleted_at IS NULL`, həmin dildə başlıq + mətn (istiqamət) və ad (üzvlük); boş sətir `null` olur; silinmiş media `null` olur.
  - Sıra `sort_order, id`; `logo` `/media/{id}`; `rfc.file` `{ url, mimeType, sizeBytes }`.
  - PGlite-də əl ilə yazılmış sətirlərlə yoxla. Hallar: az/en, `draft`, en başlığı boş, `cbar_web_ro` ilə yazmaq → permission denied.

### Saytın paylaşılan qatı (`web-cbar-new`, MR 4)

- [X] T011 [P] `FINCERT_SLUG: Record<Locale, string> = { az: 'fincert', en: 'fincert' }` və `isFincertSlug()` `SITE/src/entities/page-node/lib/tree.ts`-də (+ `index.ts` export), `FAQ_SLUG` nümunəsi
- [X] T012 [P] `FIN-SITE/model/schemas.ts` (Zod: `fincertSchema` — `contracts/public-api.md`) və `FIN-SITE/api/fincert.api.ts` (`server-only`, `getFincert(locale)`, FAQ-ın `getFaq` pattern-i ilə, keşsiz)
- [X] T013 [P] `SITE/src/shared/testing/fixtures/fincert.ts` + `SITE/src/shared/testing/handlers/fincert.ts` (+ `handlers/index.ts`-də qeydiyyat). Fikstürlər:
  - `full`: seed-ə uyğun 4 istiqamət (paraqraf + `ul`), RFC xarici link, FIRST loqosuz;
  - `partial`: yalnız missiya və əlaqə;
  - `empty`;
  - en variantı.
- [X] T014 [P] `SITE/src/locales/{az,en}/fincert.json` namespace-i və i18n qeydiyyatı (mövcud namespace-lər kimi). Açarlar:
  - altı bölmə başlığı;
  - "Elektron poçt", "Əlaqə nömrəsi";
  - "Portala keçid";
  - RFC kartının adı "RFC-2350";
  - "Endir" və "yeni vərəqdə açılır" aria mətnləri.

**Checkpoint**: sxem tətbiq olunur, `GET /api/v1/fincert` işləyir, saytın FinCERT api/model/fikstürləri hazırdır.

---

## Phase 3: User Story 1 — ziyarətçi FinCERT səhifəsini Figma dizaynında görür (P1) 🎯 MVP

**Goal**: `/az/fincert` və `/en/fincert` Figma kimi görünür. Tərkibi:
- breadcrumb və paylaşma;
- H1;
- missiya;
- nömrəli native akkordionlar;
- əlaqə, portal, RFC və üzvlük kartları;
- desktop, tablet və mobil düzülüş.

"Bu səhifədə" bloku yoxdur, bölmə ankerləri var.

**Independent Test**: `full` fikstürü ilə view üç enlikdə açılır, bölmə sırası və ankerlər yoxlanır, akkordionlar `userEvent` ilə açılır, linklər
düzgündür. `partial` fikstüründə yalnız dolu bölmələr görünür.

### Tests (əvvəl yazılır, qırmızı)

- [X] T015 [P] [US1] `FIN-SITE/model/view.test.ts`: `buildFincertView(data, page)`. Hallar:
  - bölmə görünürlük qaydaları (`data-model.md` "Bölmələr və ankerlər");
  - nömrələmə görünən siyahıya görədir, boşluq qalmır;
  - `tel:` href yalnız rəqəm və `+` ilə qurulur;
  - RFC: media linkdən üstündür, fayl növü `mimeType`-dan və ya `.pdf` uzantısından gəlir, tanınmayanda `null`;
  - missiya paraqraflara bölünür;
  - bütün bölmələr boşdursa nəticə `null`.
- [X] T016 [P] [US1] `SITE/src/views/fincert/index.test.tsx`: `renderApp`, `full` fikstürü. Yoxlanır:
  - H1;
  - bölmə başlıqları Figma sırası ilə, `section` id-ləri `data-model.md` ankerləri ilə;
  - dörd akkordion bağlıdır, birini `userEvent` ilə açanda gövdə (`li`) görünür, digəri bağlı qalır;
  - e-poçt linki `mailto:`, telefon linki `tel:+994124370097`;
  - "Portala keçid" linki `target=_blank rel=noopener noreferrer`;
  - RFC kartı bir link-dir, PDF nişanı var;
  - üzvlük kartında ad və nişan.

  `partial` fikstüründə portal, RFC və üzvlük bölmələri render olunmur.
- [X] T017 [P] [US1] `SITE/src/views/fincert/loader.test.ts`: MSW ilə FinCERT səhifəsi + `GET /fincert`. Hallar:
  - `locale` sorğuya keçir;
  - API 500 → `null`;
  - `empty` → `null`;
  - səhifə 404 → `null`;
  - `shell.crumbs` "Ana səhifə › FinCERT".

### Implementation

- [X] T018 [US1] `FIN-SITE/model/view.ts` + `FIN-SITE/model/constants.ts`.
  - `constants.ts`: `FINCERT_ANCHORS`, `FINCERT_SECTION_ORDER`, telefon təmizləmə regex-i.
  - `view.ts`: `FincertView` tipi (`data-model.md`) və saf `buildFincertView`; istiqamət gövdəsi `prepareCmsHtml` ilə hazırlanır.
- [X] T019 [P] [US1] `FIN-W/fincert-section.tsx` + `FIN-W/constants.ts`.
  - `fincert-section.tsx`: `<section id aria-labelledby>`, h2 (24/32 → mobil 20/28), `Reveal` (bölmə başına bir), `scroll-margin-top` saytın header hündürlüyü sabiti ilə.
  - `constants.ts`: kart çərçivə sinifləri, bölmə ara məsafələri.
- [X] T020 [P] [US1] `FIN-W/fincert-directions.tsx`, `ui-contract.md` §3-ə görə.
  - Struktur: `<details data-accordion>`, `<summary>` (nömrə dairəsi, başlıq, ox ikonu), gövdə `CmsContent variant="fincert"`.
  - Açıq vəziyyət `open:`/`group-open` variantları ilə verilir. Reduced-motion-da fırlanma keçidi yoxdur.
  - `<details>`-də `gap` yox, gövdəyə `mt`.
- [X] T021 [P] [US1] `SITE/src/widgets/cms-content/cms-content.tsx` `variant` birliyinə `'fincert'` əlavə et. `SITE/src/widgets/cms-content/cms-content.css`-də `[data-variant='fincert']` qaydaları: 16/26 mətn (mobil 16/28), elementlər arası 12, `ul` bəndləri arası 10, 6 px `primary` nöqtə, nöqtə ↔ mətn 12 (`ui-contract.md` §3)
- [X] T022 [P] [US1] `FIN-W/fincert-contacts.tsx`, `ui-contract.md` §4-ə görə.
  - Desktop iki sütun, kart şaquli; tablet/mobil alt-alta, kart üfüqi.
  - Bütün kart `<a>`-dır.
  - İkonlar kitdən (e-poçt, telefon), `aria-hidden`.
- [X] T023 [P] [US1] `FIN-W/fincert-portal.tsx`, `ui-contract.md` §5-ə görə.
  - Düzülüş: desktop üfüqi; tablet/mobil şaquli; mobildə düymə tam en.
  - Düymə: kit `Button asChild` + `<a target="_blank" rel="noopener noreferrer">`, xarici link ikonu.
- [X] T024 [P] [US1] `FIN-W/fincert-document.tsx`, `ui-contract.md` §6-ya görə.
  - Bütün kart bir link: media üçün `download`, xarici link üçün yeni vərəq.
  - Fayl çipində nişan və endirmə ikonu.
  - Mövcud fayl nişanı köməkçisi/rəngi `widgets/attachments`-də varsa o işlədilir.
- [X] T025 [P] [US1] `FIN-W/fincert-memberships.tsx`, `ui-contract.md` §7-yə görə.
  - Loqo `SiteImage` 120×48 `object-contain`; loqo yoxdursa yer tutulmur.
  - Nişan; `url` varsa bütün kart xarici linkdir.
  - Mobil düzülüş şaquli.
- [X] T026 [US1] `FIN-W/index.ts` export-ları. Rəng token-ları:
  - `#e6eef4` və `#f5f5f5` üçün əvvəl mövcud `--site-*` token-ları axtar;
  - yoxdursa `SITE/src/app/globals.css`-ə `--site-fincert-*` (light/dark) əlavə et, route B blokuna toxunmadan;
  - PDF nişan rəngi mövcud token-dan.
- [X] T027 [US1] `SITE/src/views/fincert/loader.ts` (`server-only`, `cache()`).
  - `getPage(locale, slug)` və `getFincert(locale)` `Promise.allSettled` ilə alınır.
  - `buildFincertView`; `null` halları: səhifə yox, API xətası, boş məzmun.
  - `shell`: breadcrumb "Ana səhifə › <başlıq>", `nav: []`, `share` (`absolutePageUrl`).
  - Metadata üçün `description` missiyadan götürülür.
- [X] T028 [US1] `SITE/src/views/fincert/index.tsx`, `ui-contract.md` §1-ə görə.
  - Tərkib: `PageTools`, H1 (32/44 → mobil 24/32), bölmələr `FINCERT_SECTION_ORDER` ilə.
  - Ara məsafələr: desktop 56, tablet 48, mobil 40; H1 → ilk bölmə 36/36/24.
  - Sol menyu yoxdur; `SHELL_CLASS`; alt boşluq FAQ view kimi.
- [X] T029 [US1] `SITE/src/app/[locale]/(content)/[...slug]/page.tsx`.
  - FAQ yoxlamasından sonra: son seqment `isFincertSlug` olanda `loadFincertPage`, nəticə varsa `FincertView`, `null`-da mövcud CMS axını.
  - `generateMetadata`: FinCERT məlumatı varsa `description` missiyadan, yoxdursa bugünkü kimi.
- [X] T030 [US1] Review: `ui-kit-review` + `senior-front` review checklist (`references/review-checklist.md`) US1-də dəyişən `SITE` fayllarına. `plan.md` "Frontend Skills Gate" ilə tutuşdur: native disclosure, tək HTML sink, kartda bir fokus nöqtəsi, semantik rənglər, ikon düymələrində `aria-label`. Tapılanları düzəlt
- [X] T031 [US1] `SITE`: `npm run verify`, Node 22 ilə `npm run test:run` (yaddaş `run-tests-on-node22`)

**Checkpoint**: fikstürlə FinCERT səhifəsi Figma görünüşündədir, JS-siz işləyir (MVP — sayt hissəsi).

---

## Phase 4: User Story 2 — redaktor FinCERT-i admin bölməsində redaktə edir (P1)

**Goal**: admin paneldə "FinCERT" bölməsi. Üç tabı var: "Ümumi" forması, "Fəaliyyət istiqamətləri" və "Beynəlxalq üzvlüklər" (sıralanan siyahılar).
Admin API endpoint-ləri.

**Independent Test**: admin-də telefon dəyişib saxlamaq, beşinci istiqamət əlavə edib ikinci yerə çəkmək; `GET /api/v1/fincert` yeni dəyəri və
sıranı qaytarır, sayt onu göstərir.

### Admin API (`api-cbar-admin`, MR 1)

- [X] T032 [US2] `ADMIN-API/src/Cbar.AdminApi/Controllers/FincertSettingsController.cs`: `GET`/`PUT /api/v1/fincert/settings`, `contracts/admin-api.md`-ə görə.
  - `PUT` upsert edir (`id = 1`); göndərilməyən dil dəyişmir.
  - Validasiya `data-model.md`-ə görədir; xəta `BadRequestProblem` + `errors`-dur.
  - `rfcMediaId` sənəd növü olmalıdır (`MediaStorage` icazəli növləri).
  - Audit `fincert.settings_update` (`before`/`after`). İcazələr `fincert.read`/`fincert.update`.
- [X] T033 [P] [US2] `ADMIN-API/src/Cbar.AdminApi/Controllers/FincertDirectionsController.cs`: paged siyahı (`number`, `locales`, `incompleteLocales`), detal, `POST`, `PUT`, soft-delete və `PUT order`.
  - Yaradılanda `sortOrder` = max+1.
  - Yarımçıq dil 400 verir.
  - `order`-də tam dəst tələb olunur, əks halda 400.
  - Audit `fincert.direction_*`; `FaqQuestionsController` nümunəsi.
- [X] T034 [P] [US2] `ADMIN-API/src/Cbar.AdminApi/Controllers/FincertMembershipsController.cs`: CRUD + `PUT order`.
  - `logoMediaId` yalnız `image/*` qəbul edir.
  - `url` `http(s)://` olmalıdır.
  - Audit `fincert.membership_*`.
- [X] T035 [US2] `dotnet build ADMIN-API`. `node .claude/skills/sync-openapi/scripts/route-diff.mjs` (admin API) fərqsiz olmalıdır. PGlite ilə `quickstart.md` §3 cədvəlini icra et

### Admin panel (`web-cbar-admin-new`, MR 3) — əvvəl `ADMIN/.claude/skills/{frontend-standards,ui-kit-usage}` yüklənir

- [X] T036 [P] [US2] `ADMIN/src/shared/testing/handlers/fincert.ts` (+ `index.ts`): `contracts/admin-api.md` endpoint-ləri və 400 halları. Yanında:
  - `FIN-ADMIN/api/fincert.keys.ts`;
  - `FIN-ADMIN/api/fincert.service.ts`;
  - `FIN-ADMIN/model/schemas.ts` (Zod: settings, sətir, detal);
  - `FIN-ADMIN/model/constants.ts` (route-lar, modul id-ləri).
- [X] T037 [P] [US2] `ADMIN/src/locales/{az,en}/fincert.json`. Açarlar: tablar, kart başlıqları, sahə etiketləri və kömək mətnləri ("Fayl seçilibsə link göstərilmir", nişan nümunəsi), xəta mesajları.
  - `nav.json`: `fincert.label` "FinCERT", `fincert.description`, `groups.fincert`.
  - `ADMIN/src/shared/i18n/index.ts` qeydiyyatı; `check:i18n` keçməlidir.
- [X] T038 [US2] `FIN-ADMIN/fincert.test.tsx` (əvvəl yazılır, qırmızı). Ümumi forma:
  - yüklənən dəyərlər;
  - yanlış e-poçt sahə xətası verir və `PUT` getmir;
  - düzgün saxlamada `PUT` body-si kontraktla eynidir;
  - server 400 `errors` sahənin altında görünür;
  - yadda saxlanmamış dəyişikliklə başqa menyuya keçəndə soruşur.

  İstiqamətlər:
  - siyahıda №, dil nişanları;
  - formada yarımçıq dil xətası;
  - "Sıranı dəyiş" dialoqunda klaviatura ilə hərəkət → `PUT …/order`.

  Üzvlüklər:
  - loqo sahəsi yalnız şəkil seçir.
- [X] T039 [US2] Sıralama dialoqunu ümumiləşdir. FAQ-ın `features/faq/components/reorder-dialog.tsx` siyahıya bağlıdırsa, FinCERT-in iki siyahısı ilə dördüncü istifadə olur (senior-front: üçüncü istifadədə çıxarış). Bu halda:
  - generik `ADMIN/src/features/crud/components/reorder-dialog.tsx` çıxar: `queryKey`, `load`, `save`, başlıq, sətir etiketi parametr kimi;
  - FAQ-ın iki dialoqunu ona keçir; FAQ testləri dəyişmədən keçməlidir.
- [X] T040 [US2] `FIN-ADMIN/model/module.ts`. Hər iki modulda `sectionTabs` (`contracts/admin-ux.md` §2), `defineModule`.
  - `fincertDirectionsModule`. Sütunlar: №, başlıq, dillər `Badge`, status, yenilənib. Sahələr: status (default `published`); başlıq `text` perLocale; mətn `richtext` perLocale.
  - `fincertMembershipsModule`. Sütunlar: loqo önizləməsi, ad, nişan, status. Sahələr: status, loqo media (şəkil), link, ad/təsvir/nişan perLocale.
- [X] T041 [US2] `FIN-ADMIN/components/settings-form.tsx` + `FIN-ADMIN/hooks/use-fincert-settings.ts` (Query + mutation).
  - Forma: RHF + Zod; kit `Card`, `Field`, `Input`, `Textarea`, `Tabs` (az/en, xətalı tabda işarə); mövcud media seçici (RFC: yalnız sənəd).
  - "Yadda saxla" düyməsi; uğurda `toast`.
  - Server `problem+json` `errors` sahələrə yazılır.
  - `useBlocker` ilə çıxış xəbərdarlığı (`crud-form-page.tsx` nümunəsi).
  - Yükləmə və xəta vəziyyətləri.
- [X] T042 [US2] `ADMIN/src/pages/fincert/index.tsx`: `FincertSettingsPage` (`SectionTabs` + `SettingsForm`), `FincertDirectionsPage`, `FincertMembershipsPage` (`CrudListPage` + "Sıranı dəyiş"). Bağlı dəyişikliklər:
  - `ADMIN/src/app/routes/index.ts`: `/fincert` route-u (`lazyRouteComponent` + `chunk-reload` sarğısı) və iki `createCrudRoutes`.
  - `ADMIN/src/app/routes/nav.ts`: `NAV_GROUPS`-da `fincert` `faq`-dan sonra; `NavKey` `fincert`; bənd `/fincert`, kit ikonu `references/icons.md`-dən (qalxan/təhlükəsizlik).
- [X] T043 [US2] `ADMIN/src/features/pages/model/managed-sections.ts`: `fincert: { kind: 'link', to: '/fincert', group: 'fincert', item: 'fincert' }` (`fincert-copy` avtomatik). Mövcud `managed-section-card` testinə FinCERT halı əlavə olunur
- [X] T044 [US2] Rich-text guard. `ADMIN/src/features/rich-text/fixtures/fincert-direction.html` yarat (seed-dəki birinci istiqamətin gövdəsi: paraqraf + `ul`) və roundtrip testinə əlavə et. Lokal API varsa `npm run roundtrip -- "Haqqımızda" "Pul siyasəti"` işlət, yoxdursa bunu qeyd et
- [X] T045 [US2] Review: `ui-kit-review` + `senior-front` checklist US2-də dəyişən `ADMIN` fayllarına. `plan.md` gate ilə tutuşdur: CRUD şablonu, tək qeyd forması, `SortableList` a11y, semantik rənglər, ikon düymələrində `aria-label`
- [X] T046 [US2] `ADMIN`: `npm run verify`, Node 22 ilə testlər

**Checkpoint**: redaktor HTML bilmədən FinCERT-in hər bölməsini dəyişir, sıranı bir hərəkətlə dəyişir (SC-003, SC-004).

---

## Phase 5: User Story 3 — köhnə məzmun avtomatik köçürülür (P1)

**Goal**: `0037-fincert-seed.sql` köhnə səhifə 133-ün az/en məzmununu və FIRST üzvlüyünü yazır. "FinCERT (Kopya)" menyulardan çıxır.

**Independent Test**: PGlite-də səhifə 133/479 olan baza qurulur, API start olur. `GET /api/v1/fincert` az/en köhnə mətnin bütün bəndlərini
qaytarır, ikinci start heç nə dəyişmir.

- [X] T047 [US3] `SEED/extract.mjs`. Giriş: `.tmp-053/api/` (T001) və ya test API. Çıxış: `SEED/fincert-az.json`, `SEED/fincert-en.json`. Qaydalar `research.md` R10-dadır:
  - missiya "Bu məqsədlə" / "To this end" cümləsinə qədər kəsilir;
  - 4 istiqamət: az bir bəndli `ol>li>strong` başlıqlar, en `h3`, nömrə prefiksi atılır, gövdə HTML olduğu kimi qalır;
  - e-poçt; telefon Figma formasında `(+994 12) 437 00 97`;
  - portal ünvanı; portal başlığı/təsviri: az Figma mətni, en köhnə mətndən;
  - RFC köhnə linki və fayl adı.

  Saylar T001 baza xətti ilə tutuşmursa xəta ilə çıxır.
- [X] T048 [P] [US3] `SEED/fincert-first.json`: az Figma mətni (ad, təsvir, nişan "2026-cı ildən tam hüquqlu üzv"), en qaralama, `url` `https://www.first.org/`. Yanında `SEED/README.md`: generatorun işlədilməsi, en qaralamanın yoxlanmalı olduğu, loqonun admin-dən yükləndiyi
- [X] T049 [US3] `SEED/build-seed.mjs` yaz və işlət → `ADMIN-API/db/migrations/0037-fincert-seed.sql`. Bir DO bloku, şərt: az slug-ı `fincert` olan silinməmiş səhifə var və üç əsas cədvəl boşdur (silinmişlər daxil). Yazılanlar:
  - `fincert_settings` + az/en tərcümələr;
  - RFC: `media_assets.original_name` üzrə axtarış; tapılmırsa `rfc_url` köhnə link;
  - 4 istiqamət (`published`, `$fincert$…$fincert$` dollar-quote);
  - FIRST üzvlüyü (`published`, loqosuz);
  - `fincert-copy` səhifəsinin `page_details.show_in_side_nav = false` (`ON CONFLICT (page_id) DO UPDATE`);
  - `RAISE NOTICE` xülasəsi.

  Səhifə mətnlərinə toxunmur. Generatoru ikinci dəfə işlətmək eyni baytları verir.
- [X] T050 [US3] PGlite yoxlaması (`quickstart.md` §2, §4):
  - bazaya səhifə 133/479 yüklənir, `0036`+`0037` tətbiq olunur;
  - `NOTICE` gözlənilən kimidir;
  - `GET /api/v1/fincert?locale=az|en` T001 baza xətti ilə eynidir (istiqamət sayı, hər istiqamətin `li` sayı, linklər; SC-002 itən bənd 0);
  - ikinci start heç nə yaratmır;
  - bir sətri silib `0037`-ni təkrar işlətmək heç nə yaratmır;
  - boş bazada (səhifəsiz) xəta və sətir yoxdur.

**Checkpoint**: deploy günü FinCERT yeni dizaynda köhnə məzmunla açılır, redaktor heç nə yenidən yazmır.

---

## Phase 6: User Story 4 — səhifə formasında sol menyuda bölmə işarələnir (P2)

**Goal**: öz bölməsi olan səhifənin formasında sol menyu (desktop və mobil) həmin bölməni aktiv göstərir, qrupunu açır (`contracts/admin-ux.md` §3,
research R9).

**Independent Test**: `/pages/{FinCERT id}` açılır: "FinCERT" `aria-current="page"`, "Səhifələr" yox. 122-də "Memorandumlar" aktivdir, "Beynəlxalq
əməkdaşlıq" qrupu açıqdır. Adi səhifədə "Səhifələr" aktivdir.

- [X] T051 [US4] `ADMIN/src/app/shell/sidebar.test.tsx` və `ADMIN/src/features/pages/pages.test.tsx` (əvvəl yazılır, qırmızı). Hallar `contracts/admin-ux.md` §4-dədir:
  - FinCERT, 122, adi səhifə, 554 (`note`), `fincert-copy`;
  - formadan `/pages`-ə qayıdanda override təmizlənir;
  - mobil `Sheet`-də eyni aktivlik;
  - override `localStorage`-a yazılmır.
- [X] T052 [US4] `ADMIN/src/shared/model/ui-store.ts`. Əlavələr: `activeNavOverride: string | null`, `setActiveNavOverride(key)`, `clearActiveNavOverride()`.
  - Override `persist`-in `partialize`-ından çıxarılır: yalnız `openNavGroups` və mövcud saxlanılan sahələr yaddaşa düşür.
  - Ingiliscə şərhdə "why" yazılır.
- [X] T053 [US4] `ADMIN/src/app/routes/nav.ts` + `ADMIN/src/app/shell/sidebar.tsx`.
  - `nav.ts`: `activeNavItem(pathname, override)` — override məlum `NavKey`-dirsə o bənd, yoxsa `findNavItem(pathname)`.
  - `sidebar.tsx`: `active` və `activeGroup` bundan hesablanır; `aria-current` aktiv bəndə keçir; mövcud `useLayoutEffect` qrupu açır.
  - `document.title` və breadcrumb dəyişmir.
- [X] T054 [US4] `ADMIN/src/features/pages/hooks/use-managed-nav.ts`. Siqnatura: `useManagedNav(slug)`.
  - `managedSectionFor(slug)` `kind: 'link'` qaytaranda `setActiveNavOverride(section.item)`.
  - Unmount-da və slug dəyişəndə təmizləyir.
  - `ADMIN/src/features/pages/components/page-form.tsx` səhifə yüklənəndən sonra onu çağırır.
- [X] T055 [US4] Review: `ui-kit-review` + `senior-front` checklist (`aria-current`, tək aktivlik mənbəyi, effektin cleanup-ı, store-un persist sərhədi)
- [X] T056 [US4] `ADMIN`: `npm run verify`, Node 22 ilə testlər

**Checkpoint**: redaktor menyuya baxıb məzmunun harada redaktə olunduğunu görür (SC-005).

---

## Phase 7: User Story 5 — köhnə ünvanlar işləyir, məlumat olmayanda səhifə boş qalmır (P3)

**Goal**: `page-893/*` → `/{locale}/fincert` (308). FinCERT məlumatı olmayanda və ya API xətasında səhifə 133-ün CMS mətni göstərilir.

**Independent Test**: proxy testləri; `GET /fincert` 500 qaytaranda route CMS view-u göstərir.

- [X] T057 [P] [US5] `SITE/src/proxy.test.ts`-ə bu hallar əlavə olunur (əvvəl yazılır, qırmızı):
  - `/page-893/fincert` → 308 `/az/fincert`;
  - `/en/page-893/fincert` → `/en/fincert`;
  - `/page-893/fincert?language=en` → `/en/fincert`;
  - `/page-8931/x` uyğun gəlmir.
- [X] T058 [US5] `SITE/src/proxy.ts` `legacyRedirect()`: `LEGACY_FINCERT_PAGE = /^\/(?:(az|en)\/)?page-893(?:\/.*)?$/i` → `/${legacyLocale}/${FINCERT_SLUG[locale]}`, `LEGACY_FAQ_PAGE` nümunəsi ilə
- [X] T059 [US5] Fallback testi `SITE/src/views/fincert/loader.test.ts`-də (T017-də yoxdursa əlavə et): API xətası, `empty` və səhifə yox halında `null` qayıdır. Route `null`-da `loadCmsPage` axınına düşür; bunu `[...slug]` route-un mövcud testi varsa orada, yoxdursa `quickstart.md` §6-dakı əl ilə yoxlama ilə təsdiqlə
- [X] T060 [US5] `SITE`: `npm run verify`

---

## Phase 8: Polish & Cross-Cutting

- [X] T061 [P] `SITE/docs/fincert-cms-guide.md` və `SITE/CLAUDE.md`. Təlimatın mövzuları:
  - məzmun növü;
  - bölmələr və onların görünmə qaydası;
  - RFC: fayl üstündür, link köhnədir;
  - FIRST loqosunu yükləmək;
  - ankerlər;
  - fallback.

  `SITE/CLAUDE.md` §3-ə FinCERT bəndi.
- [X] T062 [P] `dokumentasiyalar/fincert-guide.md` (admin paneldən idarəetmə, ekran-ekran, azərbaycanca) + `dokumentasiyalar/README.md` sətri
- [X] T063 [P] Kök `CLAUDE.md` və `ADMIN/CLAUDE.md`.
  - Kök `CLAUDE.md`, web-cbar-new bölməsinə FinCERT bəndi: məzmun növü, `FINCERT_SLUG`, gizli Figma qatları qurulmur, RFC fayl/link, `page-893` yönləndirməsi.
  - Kök `CLAUDE.md`, admin bölməsinə: FinCERT bölməsi və idarə olunan səhifə formasında sol menyu aktivliyi qaydası (`activeNavOverride`, `MANAGED_SECTIONS`).
  - `ADMIN/CLAUDE.md`: generik sıralama dialoqu çıxarılıbsa onun qeydi.
- [X] T064 [P] Menyu sənədləri (yaddaş `menu-changes-update-docs`): `specs/046-international-memberships/contracts/admin-nav.md` (`fincert` qrupu, sıra, idarə olunan səhifə kartı və aktivlik qaydası). Mövcud `SITE/docs/*-cms-guide.md`-dəki admin menyu yolları yoxlanılır; dəyişmirsə qeyd et
- [X] T065 [P] `business_logic/new_business_logic.md` və `diff_report_logic.md` (`/sync-business-logic`, `pages + navigation + data-model + admin` modulları)
- [X] T066 [P] İki `openapi.yaml`-ın `# Sync:` sətri (`/sync-openapi` qaydası); `route-diff` hər iki API-də fərqsiz
- [X] T067 Figma ölçməsi (yaddaş `figma-measure-dom`, `hybrid-fixture-proxy-for-ui-measuring`; 744-də scrollbar 15 px).
  - 1728, 744 və 390 enliyində Edge CDP ilə `getBoundingClientRect` ölçülür və `contracts/ui-contract.md` ilə tutuşdurulur, fərq ≤ 2 px (SC-001).
  - Akkordion açıq və bağlı ölçülür; üfüqi sürüşmə olmamalıdır.
  - Üzvlük nişanının fonu `figma_node` ilə dəqiqləşdirilir.
  - Fərqlər düzəldilir.
- [X] T068 `quickstart.md`-nin bütün addımlarını icra et: JS söndürülmüş brauzerdə akkordion və linklər işləməlidir, `Cbar.Domain` diff boş olmalıdır
- [X] T069 İstifadəçiyə təhvil qeydi: FIRST loqosu admin-dən yüklənməlidir, en FIRST mətni qaralamadır, RFC faylları yüklənəndə köhnə link əvəz olunur. Yeri `specs/053-fincert-page/README.md`-dir (yaddaş `root-tracker-for-multiday-work`)

---

## Dependencies & Execution Order

### Phase asılılıqları

- **Phase 1** asılılıqsızdır. T004 (OpenAPI təsdiqi) bütün controller tapşırıqlarını bloklayır: T010, T032–T034.
- **Phase 2** Phase 1-dən sonra gəlir. Ardıcıllıq: T005 → T006 → T007 → T009, T010 isə T007-dən sonra. Sayt tərəfi T011–T014 T003-dən sonra paralel gedir.
- **US1 (Phase 3)** Phase 2-dən sonra gəlir. Sayt fikstürlə işləyir, seed-dən asılı deyil. MVP.
- **US2 (Phase 4)** yalnız Phase 2-dən asılıdır: admin API T005–T009-dan, panel T036-dan sonra. US1 ilə paralel gedə bilər (başqa komponentlər).
- **US3 (Phase 5)** T005 və T001-dən sonra gəlir. Seed-in PGlite yoxlaması (T050) T010-dan sonra.
- **US4 (Phase 6)** T042–T043-dən sonra gəlir (`fincert` NavKey və managed-sections sətri), ADMIN faylları US2 ilə ardıcıldır.
- **US5 (Phase 7)** T011-dən (`FINCERT_SLUG`) və T027-dən sonra gəlir.
- **Polish** bütün hekayələrdən sonra.

### Deploy sırası (Konstitusiya IV.2)

1. MR 1 `api-cbar-admin`: T002, T005–T009, T032–T035, T049–T050.
2. MR 2 `api-cbar`: T003, T007, T010.
3. MR 3 `web-cbar-admin-new`: T036–T046, T051–T056.
4. MR 4 `web-cbar-new`: T011–T031, T057–T060.

### Fayl toqquşmaları (ardıcıl olmalıdır)

- `ADMIN/src/app/routes/nav.ts`: T042 → T053
- `ADMIN/src/features/pages/*` (`managed-sections.ts`, `pages.test.tsx`, `page-form.tsx`): T043 → T051 → T054
- `ADMIN/src/features/faq/components/reorder-dialog.tsx`: yalnız T039
- `SITE/src/views/fincert/loader.test.ts`: T017 → T059
- `SITE/src/app/[locale]/(content)/[...slug]/page.tsx`: yalnız T029
- `SITE/src/proxy.ts` + `proxy.test.ts`: T057 → T058

### Paralel imkanlar

- Phase 1: T002 ‖ T003 (T001 ilə də paralel).
- Phase 2: T006 ‖ T008; sayt tərəfi T011–T014 hamısı paralel.
- US1: testlər T015–T017 paralel; widget-lər T019–T025 paralel (fərqli fayllar).
- US2: T033 ‖ T034; T036 ‖ T037; admin API (T032–T035) panel işi ilə paralel.
- US3 generatoru (T047–T049) US1/US2 ilə paralel gedə bilər.
- Polish: T061–T066 paralel.

### Paralel nümunə: US1

```text
T015 view.test.ts ‖ T016 index.test.tsx ‖ T017 loader.test.ts
sonra: T018 view.ts → (T019 section ‖ T020 directions ‖ T021 cms-content variant ‖ T022 contacts ‖ T023 portal ‖ T024 document ‖ T025 memberships)
       → T026 → T027 → T028 → T029 → T030 → T031
```

## Implementation Strategy

### MVP (Phase 1 + 2 + US1 + US3)

Ziyarətçi tərəfi tam əvəz olunur. Seed köhnə məzmunu yeni dizaynda göstərir, redaktə müvəqqəti olaraq birbaşa SQL/seed ilədir. Faktiki buraxılış üçün
US2 (admin) də lazımdır: redaktor olmadan məzmun dəyişmir.

### Artımlı çatdırılma

Admin hissəsi Phase 2-dən sonra paralel komanda ilə başlaya bilər.

1. MVP (US1 + US3).
2. US2 admin bölməsi.
3. US4 sol menyu aktivliyi.
4. US5 köhnə ünvan.
5. Polish (sənədlər, Figma ölçməsi).

### Qeydlər

- "Bu səhifədə" bloku heç bir tapşırıqda yoxdur (Figma-da gizlidir, istifadəçi qərarı 2026-11-18).
- Hər frontend fazası review (ui-kit-review + senior-front) və `npm run verify` ilə bitir (layihə qaydası).
- en FIRST mətni və loqo redaktor işidir (T069).
