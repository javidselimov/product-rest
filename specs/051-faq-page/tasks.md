# Tasks: "Sual-cavab" (FAQ) — məzmun növü, Figma redizaynı, en dəstəyi və bölmə keçid kartı

**Input**: `specs/051-faq-page/`: `plan.md`, `spec.md` (Clarifications 2026-11-17 daxil), `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

**Tests**:
- Frontend testləri davranış testləridir: rol, `userEvent`, MSW (yaddaş `functional-component-tests`); `frontend-standards` TDD tələb edir — test
  tapşırığı implementasiyadan əvvəl gəlir və əvvəl qırmızı olmalıdır.
- Bu spec yeni `AboutLayoutKind` əlavə etmir — layout fixture guard tələb olunmur.
- API-lərdə test layihəsi yoxdur: `dotnet build` + PGlite üzərində endpoint icrası (`quickstart.md` §1, yaddaş `pglite-api-testing`) + route-diff.

**Təşkili**: Tapşırıqlar user story-lər üzrə qruplaşdırılıb. Hər komponent ayrıca merge request-dir; deploy sırası:
`api-cbar-admin` (MR 1) → `api-cbar` (MR 2) → `web-cbar-admin-new` (MR 3) → `web-cbar-new` (MR 4). Workspace sənədləri və `specs/` ayrıca commit-dir.
Commit yalnız istəklə edilir.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: paralel işlənə bilər (fərqli fayllar, açıq asılılıq yoxdur)
- **[Story]**: aid olduğu user story (spec.md):
  - US1 — mövzunu açıb cavabı oxumaq (A görünüşü, videolar, sual linki) — P1
  - US2 — axtarış — P1
  - US3 — mövzu seçimi (B görünüşü) — P1
  - US6 — redaktorun admin paneli — P1
  - US5 — bölmə səhifəsindən keçid kartı — P2
  - US4 — en versiyası (sistem hazırlığı; məzmun təxirə salınıb) — P3

## Yol qısaltmaları

- `ADMIN-API` = `product-rest/api-cbar-admin` · `WEB-API` = `product-rest/api-cbar`
- `ADMIN` = `product-rest/web-cbar-admin-new` · `SITE` = `product-rest/web-cbar-new`
- `SEED` = `specs/051-faq-page/seed`
- `FAQ-SITE` = `SITE/src/features/faq` · `FAQ-W` = `SITE/src/widgets/faq` · `FAQ-ADMIN` = `ADMIN/src/features/faq`

## Ümumi qaydalar (hər tapşırıq üçün)

- **Frontend skill qaydası** (layihə, `.claude/hooks/frontend-skills.mjs`): `SITE` və ya `ADMIN` tapşırığına başlamazdan əvvəl `senior-front`,
  `frontendpatterns` və həmin komponentin `frontend-standards`, `ui-kit-usage` skill-ləri yüklənir; kod `plan.md` "Frontend Skills Gate" cədvəlinə uyğun yazılır.
- Yeni şərhlər ingiliscə (yaddaş `code-comments-english`); UI mətni yalnız i18n açarı ilə, az və en.
- Rəqəmlər adlı sabitdir (spec 032): `FAQ-SITE/model/constants.ts`, `FAQ-W/constants.ts`, `FAQ-ADMIN/model/constants.ts`, `SITE/src/shared/constants/query-params.ts`.
- `SITE`-da `prettier --write` işlədilmir; fayllar Edit və ya Node ilə redaktə olunur (yaddaş `windows-shell-crlf`, `no-prettier-write-web-cbar-new`).
  Köməkçi skriptlər və test API cavabları `.tmp-faq/`-dadır (yaddaş `fork-agents-share-tmp`).
- `SITE`-da `dangerouslySetInnerHTML` yalnız `widgets/cms-content`-də; `'use client'` yalnız `faq-topic-select.tsx` və `faq-hash-opener.tsx`; `Reveal` iç-içə olmur.
- API endpoint-ləri spec-first: OpenAPI əvvəl (T004–T005), `.claude/hooks/spec-first.mjs` bundle-da olmayan route-u rədd edir.
- `Cbar.Domain` iki nüsxədə bayt-bayt eynidir; `dotnet` `C:/Program Files/dotnet/dotnet`-dədir; Docker işlətmə (yaddaş `dotnet-sdk-local-build`).

---

## Phase 1: Setup

**Purpose**: köhnə məzmunun çıxarılması və spec-first kontraktlar.

- [X] T001 Test API-dən FAQ səhifəsini (`/api/v1/pages/sual-cavab?locale=az`) və səhifə ağacını `.tmp-faq/api/`-yə yaz; köhnə HTML-in mövzu və tək bəndli sual (`<ol><li><strong>…</strong></li></ol>`) saylarını `.tmp-faq/counts.json`-a çıxar (SC-002 baza xətti)
- [X] T002 `SEED/extract-faq.mjs` yaz: FAQ HTML → `SEED/faq-az.json` (`{ topics: [{ slug, name, questions: [{ question, answer }] }], videos: [{ url, title }] }`); `<details>` → mövzu, tək bəndli qalın `ol` → sual (nömrə prefiksi və boşluqlar təmizlənir), növbəti suala qədər elementlər → cavab HTML-i (dəyişmədən), mövzu daxilində birinci sualdan əvvəlki mətn → itirilmir (xəbərdarlıq çap et), `div[data-youtube-video] iframe` → video (oEmbed başlığı, alınmasa Figma başlığı); saylar T001 ilə tutuşmursa xəta ilə çıx; `slug` az addan (`SlugService` qaydası ilə eyni transliterasiya)
- [X] T003 [P] `SEED/topic-names-en.json` yaz (8 mövzunun en adı, slug açarı ilə) və `SEED/README.md` (generatorun işlədilməsi, `faq-en.json` verilərsə sual/cavab en-i də yazılır — təxirə salınmış iş)
- [X] T004 [P] `ADMIN-API/openapi/paths/faq.yaml` + `openapi.yaml` `paths` sətirləri: `contracts/admin-api.md`-dəki bütün route-lar (topics, topics/order, topics/{id}/questions/order, questions, videos, videos/order), DTO sxemləri, 400/404/409 `problem+json`; `npm run lint && npm run bundle` (`ADMIN-API/openapi`)
- [X] T005 [P] `WEB-API/openapi/paths/faq.yaml` + `openapi.yaml`: `GET /api/v1/faq`, `GET /api/v1/faq/topics` (`contracts/public-api.md`); `npm run lint && npm run bundle` (`WEB-API/openapi`)
- [X] T006 OpenAPI dəyişikliklərini istifadəçiyə təsdiq üçün göstər (spec-first qaydası, `/api-endpoint` skill-i); təsdiqsiz controller yazılmır

**Checkpoint**: məzmun JSON-u saylarla təsdiqlənib, iki OpenAPI bundle hazırdır və təsdiqlənib.

---

## Phase 2: Foundational (bütün hekayələr bundan asılıdır)

**Purpose**: sxem, entity-lər, seed, ictimai FAQ endpoint-i və saytın paylaşılan modulları.

### Sxem və seed (`api-cbar-admin`, MR 1)

- [X] T007 `ADMIN-API/db/migrations/0032-faq.sql`: `data-model.md`-dəki 7 cədvəl (`faq_topics`, `faq_topic_translations`, `faq_topic_pages`, `faq_questions`, `faq_question_translations`, `faq_videos`, `faq_video_translations`), indekslər, şərti FK DO bloku (0025 kimi, `users`/`locales`/`pages`), `set_updated_at` trigger-ləri, `cbar_web_ro` GRANT, `faq.read|create|update|delete` icazələri + `moderator`; `IF NOT EXISTS`, BEGIN/COMMIT yox
- [X] T008 [P] `ADMIN-API/src/Cbar.Domain/Entities/Faq.cs` (`FaqTopic`, `FaqTopicTranslation`, `FaqTopicPage`, `FaqQuestion`, `FaqQuestionTranslation`, `FaqVideo`, `FaqVideoTranslation`) və `ADMIN-API/src/Cbar.Domain/CbarDbContext.cs` mapping-i (snake_case cədvəl/sütun, `content_status` enum, soft-delete sorğu filtri yoxdur — controller-lər filtr edir, mövcud qayda ilə)
- [X] T009 T008-in fayllarını `WEB-API/src/Cbar.Domain/`-a bayt-bayt köçür; `git diff --no-index WEB-API/src/Cbar.Domain ADMIN-API/src/Cbar.Domain` boş olmalıdır
- [X] T010 [P] `ADMIN-API/src/Cbar.AdminApi/Authorization/Permissions.cs` (+ `PermissionMatrix.cs` lazım olsa): `Faq.Read/Create/Update/Delete`
- [X] T011 `SEED/build-seed.mjs` yaz və işlət → `ADMIN-API/db/migrations/0033-faq-seed.sql`: bir DO bloku `IF NOT EXISTS (SELECT FROM faq_topics)`; mövzular (az ad + en ad, slug, sort), suallar (az sual + cavab `$faq$…$faq$`), video (az başlıq); az səhifə başlığı yalnız "Sual − cavab"-dırsa "Sual-cavab" (`page_translations` UPDATE, slug `sual-cavab` ilə); "Pul siyasəti" mövzusu → `pul-siyaseti` slug-lı səhifə (`faq_topic_pages`, tapılmasa keç); en səhifə tərcüməsi **yaradılmır**
- [X] T012 `dotnet build ADMIN-API` və `dotnet build WEB-API`; PGlite ilə boş bazada `api-cbar-admin` start → 0032+0033 tətbiq olunur, ikinci start → 0033 heç nə etmir; SQL ilə mövzu/sual saylarını T001 ilə tutuşdur (quickstart §1)

### İctimai FAQ (`api-cbar`, MR 2)

- [X] T013 `WEB-API/src/Cbar.WebApi/Controllers/FaqController.cs`: `GET /api/v1/faq?locale=` — `contracts/public-api.md` forması, `data-model.md` "Görünürlük qaydaları" (published, `deleted_at`, həmin dildə dolu sual+cavab, mövzu yalnız görünən sualı ilə), sıra `sort_order, id`; PGlite ilə yoxla (`topics[0].questions.length == 23`, en → `topics: []`)

### Saytın paylaşılan qatı (`web-cbar-new`, MR 4)

- [X] T014 [P] `foldForSearch`-i `SITE/src/features/release-schedule/model/search.ts`-dən `SITE/src/shared/lib/search-fold.ts`-ə köçür (+ testi), importer-ləri yenilə, köhnə yerdə re-export qalmasın
- [X] T015 (lazım olmadı: `views → features` icazəlidir, FAQ view loader-i `features/media/model/youtube`-u mövcud iki loader kimi birbaşa işlədir — köçürmə churn olardı) [P] `SITE/src/features/media/model/youtube.ts`-i `SITE/src/shared/lib/youtube.ts`-ə köçür (+ testi varsa), 2 importer-i yenilə
- [X] T016 [P] `FAQ_SLUG: Record<Locale, string> = { az: 'sual-cavab', en: 'faq' }` və `isFaqSlug()` `SITE/src/entities/page-node/lib/tree.ts`-də (+ `index.ts` export), `LITERACY_ROOT_SLUG` nümunəsi
- [X] T017 [P] `FAQ-SITE/model/schemas.ts` (Zod: `faqSchema`, `faqTopicLinkSchema`) və `FAQ-SITE/api/faq.api.ts` (`server-only`: `getFaq(locale)`, `getFaqTopicsForPage(locale, pageId)`, mövcud `cachedJsonOrNull`/api-client pattern-i ilə, keşsiz)
- [X] T018 [P] `SITE/src/shared/testing/fixtures/faq.ts` (2 mövzu: biri 6 sual, biri cədvəlli cavab; 1 video; en variantı) və `SITE/src/shared/testing/handlers/faq.ts` (+ `handlers/index.ts`-də qeydiyyat) — `contracts/public-api.md` forması
- [X] T019 [P] `SITE/src/locales/{az,en}/faq.json` namespace-i (başlıq "Video sual-cavab", axtarış placeholder-ləri, "N sual" cəm formaları, "Bütün mövzular", "Göstər", "Ayrıca aç", boş vəziyyət, "Axtarışı təmizlə", keçid kartı mətnləri) və i18n qeydiyyatı (mövcud namespace-lər kimi)

**Checkpoint**: baza seed olunub, `GET /api/v1/faq` işləyir, saytın FAQ api/model/fikstürləri hazırdır.

---

## Phase 3: User Story 1 — mövzunu açıb cavabı oxumaq (P1) 🎯 MVP

**Goal**: `/az/sual-cavab` Figma A kimi: breadcrumb, paylaşma, başlıq, tam enli axtarış sahəsi (US2-də işə düşür), mövzu kartları, nömrəli sual
akkordeonları, video kartları, sual linki, köhnə URL, footer linki.

**Independent Test**: fikstür/seed ilə səhifəni üç endə açmaq; mövzu/sual saylarını, JS-siz akkordeonu, `#sual-<id>`-i, 308-i yoxlamaq.

### Tests (əvvəl yazılır, qırmızı)

- [X] T020 [P] [US1] `FAQ-SITE/model/select.test.ts`: `buildFaqView(faq, query)` — A görünüşü, nömrələmə 1-dən, `total`, bütün `open=false`, boş FAQ → `null`
- [X] T021 [P] [US1] `SITE/src/views/faq/index.test.tsx`: `renderApp` — H1, 8 → 2 fikstür mövzu kartı adı və "6 sual", kartı açıb sualı açmaq (`userEvent`), cavabda cədvəl, video kartının linki `target=_blank rel=noopener noreferrer`, sualın `id="sual-<id>"`-i
- [X] T022 [P] [US1] `SITE/src/views/faq/loader.test.ts`: MSW — FAQ səhifəsi + `GET /faq`; API xətasında və boş FAQ-da CMS mətni fallback-i
- [X] T023 [P] [US1] `SITE/src/proxy.test.ts`-ə: `/page-131/sual-cavab` → 308 `/az/sual-cavab`; `?language=en` → `/en/faq`
- [X] T024 [P] [US1] `SITE/src/shell/nav.test.ts`-ə: footer naviqasiyasında "Sual-cavab" "Nəşrlər və tədqiqatlar"-dan sonra

### Implementation

- [X] T025 [US1] `FAQ-SITE/model/select.ts` + `FAQ-SITE/model/constants.ts`: `FaqView` tipləri (`data-model.md` "Saytdakı görünüş modeli"), saf `buildFaqView` (A hissəsi), cavab HTML-i `prepareCmsHtml` ilə
- [X] T026 [P] [US1] `FAQ-W/faq-item.tsx` + `FAQ-W/constants.ts`: native `<details id="sual-<id>" data-accordion>` / `<summary>` (`"N. "` prefiksi, açıqda 600 + `text-primary`, ikon 20), cavab `CmsContent` ilə; `ui-contract.md` "Sual — FAQ / Item"
- [X] T027 [US1] `FAQ-W/faq-topics.tsx`: mövzu kartları (`<details>`, başlıq sətri ad + "N sual" + caret, açıqda sual siyahısı və "Ayrıca aç" linki `?topic=<slug>`), kart sinifləri `FAQ-W/constants.ts`-də (keçid kartı ilə paylaşılır), `Reveal index` kartlarda (iç-içə yox); `ui-contract.md` "Mövzu kartı"
- [X] T028 [P] [US1] `FAQ-W/faq-videos.tsx`: başlıq (interfeys etiketi), kartlar (`SiteImage` YouTube önizləməsi 16:9, play ikonu, başlıq, bütün kart `<a target="_blank" rel="noopener noreferrer">`), desktop 3 sütun / tablet wrap / mobil sütun; video yoxdursa `null`
- [X] T029 [P] [US1] `FAQ-W/faq-hash-opener.tsx` (`'use client'`): mount-da `location.hash` `#sual-` ilə başlayırsa həmin `<details>`-i və ata `<details>`-ləri açır, `scrollIntoView`; `hashchange`-i dinləyir və cleanup edir
- [X] T030 [US1] `SITE/src/views/faq/loader.ts` (`server-only`, `cache()`): FAQ CMS səhifəsi (başlıq, breadcrumb/shell üçün ağac) + `getFaq`; `searchParams` Zod ilə; FAQ boş/xəta → `null` (route CMS görünüşünə düşür)
- [X] T031 [US1] `SITE/src/views/faq/index.tsx`: breadcrumb + paylaşma (mövcud shell/breadcrumb widget-ləri ilə, sol menyu yox), H1, axtarış sahəsi yeri (US2), `FaqTopics`, `FaqVideos`, `FaqHashOpener`; ölçülər `ui-contract.md` "Səhifə çərçivəsi"
- [X] T032 [US1] `SITE/src/app/[locale]/(content)/[...slug]/page.tsx`: son seqment `isFaqSlug` olanda `loadFaqPage` → `FaqView`, null-da mövcud CMS axını; `generateMetadata` FAQ üçün də işləyir
- [X] T033 [P] [US1] `SITE/src/proxy.ts` `legacyRedirect()`: `^/(?:(az|en)/)?page-131(?:/.*)?$` → `/{locale}/{FAQ_SLUG[locale]}` (308, `legacyLocale`), regex sabiti
- [X] T034 [P] [US1] `SITE/src/shell/nav.ts` `NAV_SECTION_TITLES`-ə "Sual-cavab", "Sual − cavab", "FAQ", "Frequently asked questions" (footer Figma sırası ilə — sıra ağacdan gəlir; lazım olsa footer sırası "Nəşrlər və tədqiqatlar"-dan sonra) (FR-017a)
- [X] T035 [US1] Review: `ui-kit-review` + `senior-front` review checklist (`references/review-checklist.md`) US1-də dəyişən `SITE` fayllarına, `plan.md` "Frontend Skills Gate" ilə tutuşdur; tapılanları düzəlt
- [X] T036 [US1] `SITE`: `npm run verify` (və Node 22 ilə `npm run test:run` — yaddaş `run-tests-on-node22`)

**Checkpoint**: A görünüşü, videolar, sual linki, 308 və footer işləyir — MVP.

---

## Phase 4: User Story 2 — axtarış (P1)

**Goal**: `?q=` serverdə sual + cavab mətnində, İ/ı və böyük/kiçik hərf qatlanması ilə; uyğun suallar və mövzular açıq, boş vəziyyət.

**Independent Test**: `?q=REPO`, `?q=İNFLYASİYA` = `?q=inflyasiya`, uyğunsuz sorğu, boş sorğu; JS-siz forma.

- [X] T037 [P] [US2] `FAQ-SITE/model/select.test.ts`-ə axtarış halları: sual və cavab mətnində uyğunluq, İ/ı, uyğun sualların `open=true` və köhnə nömrəsi, mövzu `total` = uyğunların sayı, uyğunsuz mövzular çıxır, boşluqlu `q` = ilkin vəziyyət, çox uzun `q` (limit sabiti) kəsilir
- [X] T038 [P] [US2] `SITE/src/views/faq/index.test.tsx`-ə: axtarış forması (label, `name="q"`, GET), nəticə yoxdursa boş vəziyyət mətni və "Axtarışı təmizlə" linki, video bloku qalır
- [X] T039 [US2] `FAQ-SITE/model/select.ts`: `q` filtri — `foldForSearch` (`shared/lib/search-fold`) + cavabın düz mətni (`stripHtml`, bir dəfə hesablanır), `MAX_QUERY_LENGTH` sabiti
- [X] T040 [US2] `FAQ-W/faq-search-form.tsx`: GET forma, `inputVariants` ilə `type="search"` (axtarış ikonu, `ui-contract.md` ölçüləri, desktop placeholder uzun / mobil qısa — i18n), A-da tam en; `FAQ-W/faq-empty.tsx` boş vəziyyət
- [X] T041 [US2] `SITE/src/views/faq/index.tsx` və `loader.ts`: `q`-nu Zod ilə oxu, axtarış formasını və boş vəziyyəti qoş; `QUERY_PARAM` sabiti istifadə et
- [X] T042 [US2] Review: `ui-kit-review` + `senior-front` checklist US2 fayllarına
- [X] T043 [US2] `SITE`: `npm run verify`

**Checkpoint**: axtarış JS-siz işləyir.

---

## Phase 5: User Story 3 — mövzu seçimi, B görünüşü (P1)

**Goal**: `?topic=<slug>` B görünüşü: axtarış + seçim, mövzu başlığı, düz nömrəli siyahı; A-da seçim yoxdur.

**Independent Test**: "Ayrıca aç" linki, seçimlə dəyişmə, "Bütün mövzular", tanınmayan `topic`, `topic` + `q`, JS-siz "Göstər" düyməsi.

- [X] T044 [P] [US3] `FAQ-SITE/model/select.test.ts`-ə: `topic` → `kind: 'topic'`, tanınmayan → A, `topic` + `q` birlikdə, seçim siyahısı (görünən mövzular)
- [X] T045 [P] [US3] `SITE/src/views/faq/index.test.tsx`-ə: B-də başlıq (H2) və nömrəli suallar, seçim (`combobox` rolu, label), A-da seçim yoxdur, "Göstər" düyməsi; `FAQ-W/faq-topic-select.test.tsx`: seçim dəyişəndə forma göndərilir (`requestSubmit` — davranış: naviqasiya çağırışı)
- [X] T046 [US3] `FAQ-SITE/model/select.ts`: B hissəsi (`kind: 'topic'`, `topics: TopicOption[]`)
- [X] T047 [P] [US3] (seçim `FAQ-W/faq-search-form.tsx`-ın içindədir: forma onsuz da `inputVariants` üçün client-dir, ikinci client faylı lazım olmadı) `FAQ-W/faq-topic-select.tsx` (`'use client'`): native `<select name="topic">` kit stilində, "Bütün mövzular" (`''` dəyəri yox — boş `topic` parametri göndərilmir, `disabled` deyil, server boşu A sayır), `change`-də `form.requestSubmit()`, hidratasiyadan sonra "Göstər" düyməsini gizlədir
- [X] T048 [US3] `FAQ-W/faq-topic-list.tsx`: B — mövzu başlığı (24/32, mobil 20/28) + `FaqItem` siyahısı (üst xətt); `FAQ-W/faq-search-form.tsx` B-də sətir (axtarış 904 + seçim 400, gap 16; tablet/mobil sütun)
- [X] T049 [US3] `SITE/src/views/faq/index.tsx`: `view.kind`-ə görə A/B; `topic` Zod ilə
- [X] T050 [US3] Review: `ui-kit-review` + `senior-front` checklist US3 fayllarına (xüsusən client sərhədi: yalnız leaf)
- [X] T051 [US3] `SITE`: `npm run verify`

**Checkpoint**: A ↔ B keçidləri və paylaşılan `?topic=` linki işləyir.

---

## Phase 6: User Story 6 — redaktorun admin paneli (P1)

**Goal**: "Sual-cavab" bölməsi: Suallar / Mövzular / Videolar, sürüşdür-burax + klaviatura sıralama, az/en, "EN yoxdur" filtri, səhifə bağlantısı.

**Independent Test**: moderator rolu ilə `quickstart.md` §3 ssenarisi; admin API-ni PGlite ilə yoxlamaq.

### Admin API (`api-cbar-admin`, MR 1)

- [X] T052 [US6] `ADMIN-API/src/Cbar.AdminApi/Controllers/FaqTopicsController.cs`: list (search, status, `pageId`, `questionCount`, `locales`, `pages`), get, create (slug `SlugService`/`UniqueSlug` az, yoxdursa en addan), update (slug dəyişmir), delete (silinməmiş sualı varsa 409 Azərbaycanca mesaj), `PUT topics/order`, `PUT topics/{id}/questions/order` (tam dəst yoxlaması); `pageIds` mövcudluq yoxlaması; `AuditService` (`faq.topic_*`); `RequirePermission(Faq.*)`
- [X] T053 [US6] `ADMIN-API/src/Cbar.AdminApi/Controllers/FaqQuestionsController.cs`: list (`topicId`, `search` az+en ILIKE, `status`, `missingLocale`, `number`, `locales`, `incompleteLocales`), get, create (mövzunun sonuna), update (mövzu dəyişəndə yeni mövzunun sonuna), delete; yarımçıq dil → 400; audit
- [X] T054 [US6] `ADMIN-API/src/Cbar.AdminApi/Controllers/FaqVideosController.cs`: CRUD + `PUT videos/order`; YouTube id çıxarılmırsa 400 "YouTube linki tanınmadı"; audit
- [X] T055 [US6] `dotnet build ADMIN-API`; `node .claude/skills/sync-openapi/scripts/route-diff.mjs` təmiz; PGlite ilə: CRUD, sıra, mövzu köçürmə sayları, 409, 400, `audit_log` sətirləri, moderator icazələri (quickstart §1)

### Admin panel (`web-cbar-admin-new`, MR 3) — əvvəl `ADMIN/.claude/skills/{frontend-standards,ui-kit-usage}` yüklənir

- [X] T056 [P] [US6] `ADMIN/src/shared/ui/sortable-list.test.tsx` (əvvəl): klaviatura ilə yuxarı/aşağı (`userEvent`), kənarda disabled, `onReorder` id sırası, `aria-live` elanı; drag (`fireEvent.dragStart/dragOver/drop`)
- [X] T057 [US6] `ADMIN/src/shared/ui/sortable-list.tsx`: native HTML5 DnD + tutacaq (`aria-hidden`) + `IconButton` yuxarı/aşağı (`aria-label` adla) + polite live region; props `contracts/admin-ux.md` "SortableList"
- [X] T058 [US6] `ADMIN/src/shared/crud/types.ts` + `ADMIN/src/features/crud/components/crud-list-page.tsx`, `crud-form-page.tsx`: opsional `listExtras?: ComponentType` (siyahının üstündə) və `initialValues?: (search) => Partial<FormValues>` (yaratma formunda URL-dən); mövcud modullar dəyişmir; testlər `crud-*.test.tsx`-ə — **İcra**: `initialValues` əvəzinə deklarativ `prefillFromSearch: string[]` (siyahının eyni adlı filtri "Yeni" düyməsi ilə URL-ə keçir, yaratma route-unda `newFormSearchSchema`); `listExtras` lazım olmadı — mövcud `extraActions` prop-u `pages/faq`-dan istifadə olunur
- [X] T059 [P] [US6] `ADMIN/src/shared/testing/handlers/faq.ts` (+ `index.ts`): `contracts/admin-api.md` endpoint-ləri, 409/400 halları; `FAQ-ADMIN/api/faq.keys.ts`, `FAQ-ADMIN/model/schemas.ts` (Zod: sətir/detal), `FAQ-ADMIN/model/constants.ts`
- [X] T060 [P] [US6] `ADMIN/src/locales/{az,en}/faq.json` və `nav.json` (`groups.faq`, `faq.label/description`), `ADMIN/src/shared/i18n/index.ts` qeydiyyatı — `nav.json` `groups.faq` + `faq` bəndi, `shared/i18n` qeydiyyatı
- [X] T061 [US6] `FAQ-ADMIN/faq.test.tsx` (əvvəl): suallar siyahısı mövzu tabları + "EN yoxdur" filtri; "Yeni sual" `?topicId=` ilə mövzu seçili; sual formu az/en, yarımçıq dil xətası; mövzu formunda sualları klaviatura ilə sıralamaq → `PUT …/questions/order`; sualı olan mövzunu silmək → 409 mesajı; video səhv link xətası
- [X] T062 [US6] `FAQ-ADMIN/model/module.ts`: `faqQuestionsModule` (sectionTabs, tabs filtri mövzular lookup-ı ilə, `missingLocale` filtri, sütunlar № / sual / mövzu / dillər `Badge` / status, `initialValues` `topicId`, sahələr mövzu `select searchable`, status default published, sual `textarea` perLocale, cavab `richtext` perLocale), `faqTopicsModule` (ad perLocale, status, `pageIds`, `editExtras`, `listExtras`), `faqVideosModule` (link, başlıq perLocale, status, önizləmə sütunu, `editExtras`, `listExtras`); `defineModule`
- [X] T063 [P] [US6] `FAQ-ADMIN/components/topic-questions-section.tsx` (mövzu formunun `editExtras`-ı: `SortableList`, optimistik sıra + xətada geri + toast, redaktə linkləri, "Yeni sual"), `reorder-dialog.tsx` (mövzular/videolar üçün `listExtras`: kit `Dialog` + `SortableList` + "Yadda saxla"), `video-preview.tsx`, `topic-pages-field.tsx` (kit `Combobox` çoxseçimli, səhifə ağacından) — səhifə bağlantıları form sahəsi deyil, ayrıca `topic-pages-section.tsx` (dərhal saxlanır); `topic-extras.tsx` ünvan + suallar + səhifələr; sıra dialoqu hər hərəkəti dərhal saxlayır ("Bağla" düyməsi)
- [X] T064 [US6] `ADMIN/src/pages/faq/index.tsx` (release-schedule kimi: modullar + `LookupGate`) və `ADMIN/src/app/routes/index.ts` (`createCrudRoutes` üç modul üçün), `ADMIN/src/app/routes/nav.ts` (`NAV_GROUPS`-a `faq` `cooperation`-dan sonra, `NavKey` `faq`, bir bənd `/faq`) — ikon `ChatIcon`
- [X] T065 [US6] `ADMIN/src/features/pages/model/managed-sections.ts`: `sual-cavab` → `{ kind: 'link', to: '/faq', group: 'faq', item: 'faq' }`; səhifə formunda `GET /faq/topics?pageId=` boş deyilsə "Bu səhifədə FAQ keçid kartı: <mövzu>" kartı (mövcud managed-section kartının yanında) + testi — kart `features/faq/components/faq-page-links-card.tsx`, testlər `pages.test.tsx`-də
- [X] T066 [US6] Yadda saxlanmamış dəyişiklik xəbərdarlığını CRUD formunda yoxla; yoxdursa `crud-form-page.tsx`-ə TanStack Router `useBlocker` ilə əlavə et + testi — yox idi; `crud-form-page.tsx`-ə `useBlocker` + `DeleteDialog` ("Çıx"); saxlama vaxtı `crudSaveKey` mutasiyası ilə yoxlanır (render zamanlamasından asılı deyil)
- [X] T067 [US6] Rich-text guard: `ADMIN/src/features/rich-text/fixtures/faq-answer.html` (seed-dən cədvəlli cavab) roundtrip testinə əlavə et; `npm run roundtrip -- "Haqqımızda" "Pul siyasəti"` — fikstür `features/rich-text/fixtures/faq-answer.html` (seed-in xam cavabı): cədvəl/xanalar qalır, ilk saxlamadan sonra sabitdir. Canlı `npm run roundtrip` işlədilmədi (lokal API yoxdur)
- [X] T068 [US6] Review: `ui-kit-review` + `senior-front` checklist US6-da dəyişən `ADMIN` fayllarına (`plan.md` gate: CRUD şablonu, `SortableList` a11y) — öz review: kit komponentləri, semantik rənglər, ikon düymələrində `aria-label`, live region; `check:kit` keçir
- [X] T069 [US6] `ADMIN`: `npm run verify` (və Node 22 ilə testlər) — 65 fayl / 628 test; Node 24 və Node 22 (`--coverage`) yaşıl

**Checkpoint**: redaktor HTML bilmədən sual əlavə edir, sıranı bir hərəkətlə dəyişir (SC-004, SC-005).

---

## Phase 7: User Story 5 — bölmə səhifəsindən keçid kartı (P2)

**Goal**: mövzuya bağlı CMS səhifəsinin mətnindən sonra keçid kartı "<Mövzu> üzrə sual-cavab · N sual · Bax →" → B.

**Independent Test**: `/az/pul-siyaseti` kartı və linki; bağlantı yoxdursa kart yoxdur; iki mövzu → iki kart.

- [X] T070 [US5] `WEB-API/src/Cbar.WebApi/Controllers/FaqController.cs`: `GET /api/v1/faq/topics?pageId=&locale=` — yüngül `{ slug, name, questionCount }`, `faq_topic_pages.sort_order`, `questionCount = 0` olan qaytarılmır, `pageId` səhvdirsə 400; `dotnet build`, PGlite ilə yoxla
- [X] T071 [P] [US5] `SITE/src/views/cms-page/index.test.tsx` (və ya yeni `faq-topic-link-card.test.tsx`): bağlı mövzu → kart (link adı, href `?topic=`), bağlantı yoxdur → kart yoxdur, iki kart sırası; loader testi: `getFaqTopicsForPage` xətası səhifəni pozmur — view testləri `views/cms-page/index.test.tsx`-də (kart sırası, href, mətndən sonra/fayllardan əvvəl, şablonda da, bağlantı yoxdursa kart yox), loader testləri `loader.test.ts`-də (`pageId`/`locale`, xəta → `[]`)
- [X] T072 [P] [US5] `FAQ-W/faq-topic-link-card.tsx`: bütün kart bir `Link`, mövzu kartının çərçivə sinifləri (`FAQ-W/constants.ts`), ad + say + "Bax" ox ikonu; `ui-contract.md` "Bölmə bloku" — fayl adı `FAQ-W/faq-topic-links.tsx` (siyahı + kartlar bir komponentdə, `aria-label` "Sual-cavab"); mətnlər mövcud `link.*` açarlarıdır, `link.list` əlavə olundu
- [X] T073 [US5] `SITE/src/views/cms-page/loader.ts`: `getFaqTopicsForPage(locale, page.id)` (xəta → `[]`), `CmsPageViewData`-ya `faqTopics`; `SITE/src/views/cms-page/index.tsx`: həm `ShellPage`, həm köhnə görünüşdə mətndən (və `Attachments`-dən əvvəl) sonra kartlar; FAQ səhifəsinin özündə göstərilmir — `loadFaqTopics` ağac sorğusu ilə paralel (`Promise.all`), FAQ səhifəsinin özündə (`isFaqSlug`) sorğu getmir; `href` loader-də qurulur
- [X] T074 [US5] Review: `ui-kit-review` + `senior-front` checklist US5 fayllarına — öz review: bütün kart bir `Link` (bir fokus nöqtəsi, `focus-visible` halqası, hover-də `border-primary`), ox ikonu `aria-hidden`, rənglər token, çərçivə sinifləri `FAQ-W/constants.ts`-dən
- [X] T075 [US5] `SITE`: `npm run verify` — 159 fayl / 1525 test, build; Node 22 ilə testlər də yaşıl

**Checkpoint**: "Pul siyasəti" səhifəsindən FAQ-ın həmin mövzusuna bir klik.

---

## Phase 8: User Story 4 — en versiyası, sistem hazırlığı (P3)

**Goal**: en məzmun dolanda en FAQ kod dəyişikliyi olmadan işləyir; seed-dən sonra boş en səhifə yayılmır.

**Independent Test**: en fikstürü ilə testlər; admin-də bir suala en əlavə edib API en cavabını yoxlamaq.

- [X] T076 [P] [US4] `SITE/src/views/faq/index.test.tsx` və `loader.test.ts`-ə en halları: en fikstürü ilə en etiketləri və məzmun, yalnız az sual en-də yoxdur, en-də sualı olmayan mövzu yoxdur, en axtarış ("inflation"); en səhifə tərcüməsi yoxdursa `/en/faq` not-found (mövcud axın) — əvvəlki 2 testə 5 view + 2 loader testi əlavə olundu: az-da olan mövzu en-də yoxdur, `#sual-<id>` ankoru dillərdə eynidir, en-də B görünüşü eyni slug ilə, en sualı olmayan mövzu → A, en boş axtarış, en FAQ boşdursa `null` (CMS mətni), sorğu `locale=en` ilə. Hamısı kod dəyişmədən keçdi — sistem hazırdır
- [X] T077 [US4] Dil dəyişdiricisini yoxla: az FAQ-da en səhifə yoxdursa en linki mövcud qayda ilə (spec 002 `findLocaleCounterpart`) — lazım olsa `SITE/src/views/faq/loader.ts`-də `alternates` yalnız mövcud dil üçün; testi — dəyişdirici `/en/sual-cavab?…`-ı `findLocaleCounterpart` ilə `/en/faq`-a yönləndirirdi, amma sorğunu atırdı; indi sorğu qalır (`?topic=`, `?sort=` — bütün CMS səhifələri üçün), test `cms-page/loader.test.ts`-də. en səhifə yoxdursa 404 qalır (mövcud qayda). `generateMetadata` `alternates` bütün səhifələrdə eyni qaydadadır, dəyişdirilmədi
- [X] T078 [US4] PGlite: admin API ilə bir suala en əlavə et → `GET /api/v1/faq?locale=en` həmin mövzunu və sualı qaytarır (quickstart §1)
- [X] T079 [US4] `SITE`: `npm run verify` — 159 fayl / 1533 test, build; Node 22 ilə testlər də yaşıl

---

## Phase 9: Polish & Cross-Cutting

- [X] T080 [P] `SITE/docs/faq-cms-guide.md` (məzmun növü, sual/mövzu/video əlavə etmə, mövzunu səhifəyə bağlama, sual linki `#sual-<id>`, en tərcümənin necə əlavə olunacağı) və `SITE/CLAUDE.md` §3-ə FAQ bəndi — + §2 client siyahısına iki FAQ leaf-i
- [X] T081 [P] `dokumentasiyalar/sual-cavab-guide.md` (admin paneldən idarəetmə, ekran-ekran) + `dokumentasiyalar/README.md` sətri
- [X] T082 [P] Kök `CLAUDE.md` (web-cbar-new bölməsinə FAQ bəndi: məzmun növü, `FAQ_SLUG`, keçid kartı, playlist ləğvi, en təxirə salınıb; admin bölməsinə `SortableList`, `listExtras`/`initialValues`), `ADMIN/CLAUDE.md` (CRUD genişlənmə nöqtələri) — admin hissəsi: CRUD genişlənmə nöqtələri (`prefillFromSearch`, leave guard, `SortableList`); ADMIN/CLAUDE.md admin işi ilə yenilənib
- [X] T083 [P] Menyu sənədləri (yaddaş `menu-changes-update-docs`): `specs/046-international-memberships/contracts/admin-nav.md` (`faq` qrupu), `SITE/docs/*-cms-guide.md`-dəki admin menyu yolları — `admin-nav.md` (qrup `faq`, 13 sətir, `sual-cavab` kartı) admin işi ilə; mövcud `*-cms-guide.md` menyu yolları dəyişmir (FAQ yeni qrupdur)
- [X] T084 [P] `business_logic/new_business_logic.md` və `diff_report_logic.md` (`/sync-business-logic` FAQ modulu ilə) — FAQ, playlist ləğvi, en təxirə salınıb — skill-də `faq` açarı yoxdur, əvvəlki spec-lər kimi `pages + navigation + data-model + admin`: new §3.1, yeni §5.1f, §7.1, §7.2, §9.1, §9.2, §12 #42 + #50; diff §5.1 sətri; old dəyişmir (köhnədə adi CMS səhifəsi); Sync sətri yox, `qismən` qeydi
- [X] T085 [P] İki `openapi.yaml`-ın `# Sync:` sətrinə "faq (spec 051) işçi ağac 2026-11-…" (`/sync-openapi` qaydası) — `route-diff` hər iki API-də fərqsiz
- [ ] T086 Figma ölçməsi: Edge CDP ilə 1728/744/390-da A, B və keçid kartı `getBoundingClientRect` → `contracts/ui-contract.md` (2 px), üfüqi sürüşmə yoxdur (yaddaş `figma-measure-dom`, `hybrid-fixture-proxy-for-ui-measuring`); fərqləri düzəlt
- [ ] T087 `quickstart.md`-nin bütün addımlarını icra et; JS söndürülmüş brauzerdə A/B/axtarış/seçim (SC-007); `Cbar.Domain` diff boş
- [ ] T088 Deploy-dan əvvəl: produksiya dump-ında köhnə FAQ səhifəsinin id-sini və slug-ını yoxla (R12); `page-131` deyilsə `SITE/src/proxy.ts` regex-i və testi düzəlt
- [X] T089 Follow-up qeydi: admin-də mövcud 5 yuxarı/aşağı siyahının (qalereya, IFI, CSR, işçi şəkilləri, səhifə faylları) `SortableList`-ə köçürülməsi və təxirə salınmış en tərcümə (generator `faq-en.json`) — kök tracker-ə və ya `specs/051-faq-page/README` qeydinə (yaddaş `root-tracker-for-multiday-work`) — `specs/051-faq-page/README.md` (kök tracker spec 035-də dayanıb)

---

## Dependencies & Execution Order

### Phase asılılıqları

- **Phase 1** asılılıqsızdır; T006 (OpenAPI təsdiqi) bütün controller tapşırıqlarını (T013, T052–T054, T070) bloklayır.
- **Phase 2** Phase 1-dən sonra; T007 → T008 → T009 → T011 → T012; T013 T009-dan sonra; T014–T019 sayt tərəfi T005-dən sonra paralel.
- **US1 (Phase 3)** Phase 2-dən sonra — MVP.
- **US2, US3** US1-dən sonra (eyni `select.ts`, `index.tsx`, `faq-search-form.tsx` faylları) — ardıcıl: US2 → US3.
- **US6** yalnız Phase 2-dən asılıdır (sayt hekayələri ilə paralel ola bilər — başqa komponentlər).
- **US5** T013 və US1-dən sonra (`FAQ-W/constants.ts` paylaşılır).
- **US4** US1–US3-dən sonra (testlər həmin view-a əlavə olunur).
- **Polish** bütün hekayələrdən sonra.

### Deploy sırası (Maddə IV.2)

MR 1 `api-cbar-admin` (T004, T007–T012, T052–T055) → MR 2 `api-cbar` (T005, T009, T013, T070) → MR 3 `web-cbar-admin-new` (T056–T069) →
MR 4 `web-cbar-new` (T014–T051, T071–T079).

### Fayl toqquşmaları (ardıcıl olmalıdır)

- `FAQ-SITE/model/select.ts` + `select.test.ts`: T020/T025 → T037/T039 → T044/T046
- `SITE/src/views/faq/index.tsx` + `index.test.tsx`: T021/T031 → T038/T041 → T045/T049 → T076
- `FAQ-W/faq-search-form.tsx`: T040 → T048
- `WEB-API/.../FaqController.cs`: T013 → T070
- `ADMIN/src/features/crud/components/*`: T058 → T066
- `SITE/src/views/cms-page/*`: yalnız T073

### Paralel imkanlar

- Phase 1: T003, T004, T005 paralel (T002-dən sonra T003).
- Phase 2: T008 ‖ T010; sayt tərəfi T014–T019 hamısı paralel.
- US1: testlər T020–T024 paralel; T026, T028, T029, T033, T034 paralel.
- US6 admin API (T052–T054) sayt hekayələri ilə paralel; T056, T059, T060 paralel.

### Paralel nümunə: US1

```text
T020 select.test.ts ‖ T021 index.test.tsx ‖ T022 loader.test.ts ‖ T023 proxy.test.ts ‖ T024 nav.test.ts
sonra: T025 select.ts → (T026 faq-item ‖ T028 faq-videos ‖ T029 faq-hash-opener ‖ T033 proxy ‖ T034 nav) → T027 → T030 → T031 → T032 → T035 → T036
```

## Implementation Strategy

### MVP (Phase 1 + 2 + US1)

Seed olunmuş məzmun A görünüşündə, videolar, sual linki, 308 və footer — köhnə FAQ-ın tam əvəzi. Axtarışsız və seçimsiz də dərc oluna bilər.

### Artımlı çatdırılma

1. MVP (US1) → 2. US2 axtarış → 3. US3 B görünüşü → 4. US6 admin (paralel komanda üçün Phase 2-dən sonra başlaya bilər) → 5. US5 keçid kartı →
6. US4 en hazırlığı → 7. Polish.

### Qeydlər

- en sual/cavab tərcüməsi bu tasks-a daxil deyil (istifadəçi qərarı, yaddaş `flag-token-heavy-work`); generator hazırdır.
- Playlist linki ləğv edilib — heç bir tapşırıqda yoxdur.
- Hər frontend fazası review (ui-kit-review + senior-front) və `npm run verify` ilə bitir (layihə qaydası).
