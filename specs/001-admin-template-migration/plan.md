# Implementation Plan: Admin panelinin `new-template` UI kiti üzərində yenidən qurulması

**Branch**: `001-admin-template-migration` | **Date**: 2026-09-07 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-admin-template-migration/spec.md`

## Summary

`web-cbar-admin` (Chakra UI 3, React Router, əl ilə yazılmış form-lar) `new-template`-in
kopyası olan yeni **`web-cbar-admin-next`** qovluğunda, template-in kilidli stack-i
(React 19 + Vite + Tailwind v4 + `@cbar/lib-react-ui-kit` + TanStack Router/Query +
Zustand + RHF/Zod + react-i18next + Vitest/MSW, FSD) üzərində yenidən qurulur. Köhnə
panelin **konsepsiyaları** köçürülür (deklarativ `ModuleConfig` CRUD mühərriki, az/en
tab modeli, `[config.id]` keş-invalidasiya kontraktı, boş-locale ötürmə qaydası,
legacy markup-ı qoruyan TipTap redaktoru); kodu, Chakra-sı, `react-icons`-u,
TanStack Table-ı və localStorage token-i gətirilmir. `api-cbar-admin` kontraktı
dəyişmir; panel onunla Vite proxy (`/api` → `:5253`) və runtime `/config.json`
(`urls.apiUrl` = `…/api/v1`) üzərindən danışır. Verification = `npm run verify` +
real stack ilə əl icrası + round-trip yoxlaması.

## Technical Context

**Language/Version**: TypeScript ~6.0 (strict), React 19.2, Node 22 (Docker `node:22-alpine`), ES2023 target

**Primary Dependencies**: template-dən miras — Vite 8, Tailwind CSS 4, `@cbar/lib-react-ui-kit` ^0.3.0 (optionalDependencies, Nexus), `@tanstack/react-router` 1.x, `@tanstack/react-query` 5.x, `zustand` 5, `axios` 1, `react-hook-form` 7 + `@hookform/resolvers` + `zod` 4, `react-i18next` 17 / `i18next` 26. **Yeganə yeni runtime dependency** (spec D1): `@tiptap/core` 3.26.0 (pin), `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-{details,image,link,table,text-align,text-style,youtube}` ^3.26.0. Yeni devDependency yoxdur (`jsdom` ^30 artıq var).

**Storage**: Yoxdur (SPA). Bütün məlumat `api-cbar-admin` (PostgreSQL + MinIO) üzərindən HTTP ilə. Brauzerdə: token yalnız yaddaşda (Zustand), `sessionStorage`-da qeyri-həssas user snapshot (template mexanizmi), `localStorage`-da yalnız dil (`nexus-language`) və tema (`nexus-ui`).

**Testing**: Vitest 4 + React Testing Library + MSW 2 (node server testlərdə; brauzer worker yalnız `VITE_ENABLE_MSW=true` olanda). `npm run verify` = `eslint` → `tsc -b` → `vitest run` → `vite build`. Round-trip: `roundtrip.test.ts` (vitest, fixture HTML) + `scripts/roundtrip-check.mjs` (canlı API, əl ilə).

**Target Platform**: Müasir brauzerlər (Chromium/Firefox/Safari son 2 versiya), masaüstü əsas, dar ekran dəstəklənir (mobil çekmecə). Deploy: nginx statik image (`Dockerfile`), Helm `.ci-cd/*.yaml`, `/config.json` configMap.

**Project Type**: Web SPA (frontend-only); backend mövcuddur və dəyişmir.

**Performance Goals**: SC-006 — giriş → istənilən bölmə < 3 s; 50 qeydlik siyahı < 1 s görünür. Route-lar lazy (ilkin bundle-a redaktor düşmür; TipTap yalnız richtext olan form-larda yüklənir).

**Constraints**: Kit-dən kənar control və rəng yoxdur (statik yoxlama: `#`, `rgb(`, `oklch(`, `bg-blue-*` və s. sıfır tapıntı, `src/index.css` route B bloku istisna); `dangerouslySetInnerHTML` yalnız sanitizasiya ilə (spec D2); token localStorage-a yazılmır; `''` Select/Combobox-da rezervdir; kit `DataTable`-da səhifələmə yoxdur — `pagination` primitivləri ilə tərtib olunur; kit `DatePicker` saat seçmir; `Tree` drag/drop və node render slot-u vermir; `Upload` HTTP-ni özü edir (`customRequest` ilə `apiClient`-ə yönləndirilir).

**Scale/Scope**: ~20 ekran, ~83 ünvan, 26 API resurs, 8 sahə tipi, 2 locale, ~25 i18n namespace. Köhnə panel 53 fayl / 9 212 sətir; köçürülən məntiq (utils, tiplər, 10 modul konfiqi) ~1 900 sətir.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Root konstitusiya (`.specify/memory/constitution.md` v1.0.0)

| Maddə | Tələb | Bu plan | Status |
| --- | --- | --- | --- |
| I.2, I.3 | Spec `product-host/admin` qarşılığını göstərir; səssiz itki yoxdur | Spec-də paritet cədvəli (20 ekran → Saxlanılır; template demo → Ləğv) | ✅ |
| I.4 | `product-host` yalnız oxunur | Toxunulmur | ✅ |
| II.1, II.4 | Root-da paylaşılan kod yoxdur; proyektlər arası yalnız HTTP | `web-cbar-admin-next` müstəqil qovluq, öz `package.json`/`Dockerfile`/`.ci-cd`; `web-cbar-admin`-dən fayl import edilmir, məntiq yenidən yazılır | ✅ |
| II.3 | İki proyektə toxunan dəyişiklik ayrı iş paketləri | Yalnız frontend + root orkestrasiya (`dev.ps1`/`dev.sh`); API-yə toxunulmur | ✅ |
| III.1 | Admin cütü: `web-cbar-admin-next` ↔ `api-cbar-admin` | Yalnız `/api/v1` admin API | ✅ |
| III.5 | Yeni admin: `/config.json` + `VITE_API_URL` | Template mexanizmi saxlanılır; `apiUrl` `/api/v1` ilə bitir (research R2) | ✅ |
| IV.1–IV.3 | `dev.ps1` və `dev.sh` eyni dəyişiklikdə; port 5173; start sırası sabit | Hər iki skriptə `-NextAdmin` / `next-admin` seçimi; port dəyişmir | ✅ |
| V.3, V.4 | İkidillilik; chrome etiketləri hər iki dildə; editorial mətn API-dən | `locales/{az,en}/*.json` paralel; modul konfiqləri i18n açarları ilə | ✅ |
| V.5 | AZ hərfli fayllar UTF-8 alətlərlə yazılır | Write/Edit alətləri; shell redirection yoxdur | ✅ |
| VI.1 | `new-template` kopyası; template konstitusiyası məcburi | Aşağıdakı cədvəl | ✅ |
| VI.2 | Stack kilidli | Yalnız TipTap əlavə olunur (spec D1, aşağıda Complexity) | ⚠️ əsaslandırılıb |
| VI.3 | Konsepsiya köçürülür, kod yox; Chakra/TanStack Table/hand-rolled gətirilmir | `ModuleConfig` yenidən yazılır, `DataTable` kit-dən, form RHF+Zod | ✅ |
| VI.4 | MSW handler-ləri real kontraktla əvəz olunur; auth `auth/login` (15 dəq), token yaddaşda | `handlers/*.ts` `contracts/admin-api.md`-yə uyğun; demo auth silinir | ✅ |
| VI.5 | Rich-text mirası; round-trip gate | TipTap extension-ları birə-bir; `roundtrip.test.ts` verify-də | ✅ |
| VI.6 | Köhnə panel cutover-ə qədər işlək | `web-cbar-admin` toxunulmur | ✅ |
| VII.4 | `.ci-cd`, `Dockerfile`, `.gitlab-ci.yml` paylaşılan pipeline-a uyğun | Template-in fayllarına köhnə panelin hostname-ləri `TODO(devops)` ilə | ✅ |
| VII.5 | Credential yalnız lokal | `.env.development` yalnız `localhost:5253`; Nexus credential `.env.nexus` (gitignored) | ✅ |
| VIII.1–VIII.2 | Verification real icra; `npm run verify` | quickstart.md | ✅ |

### Template konstitusiyası (`new-template/.specify/memory/constitution.md` v1.2.0)

| Maddə | Tələb | Bu plan | Status |
| --- | --- | --- | --- |
| I | UI mətnləri, comment-lər AZ; hardcoded string yoxdur; `az` default | Bütün etiketlər `t()`; modul konfiqləri label yox, **açar** saxlayır | ✅ |
| II | Stack kilidli; yeni runtime dep yalnız spec ilə; icon/chart/date/class-merge kitabxanası qadağan | TipTap spec D1 ilə; tarix üçün kit `date-picker` utilləri; icon üçün kit `icons` + kit `Icon` bazası (research R7); `react-icons` yox | ⚠️ TipTap əsaslandırılıb |
| III.1–III.3 | Hər control kit-dən, subpath import, semantik rənglər | `DataTable`, `Dialog`, `Sheet`, `Tabs`, `Select`, `DatePicker`, `Upload`, `toast`…; redaktor gövdəsi (ProseMirror contenteditable) yeganə qeyri-kit element — D1 | ✅ |
| III.4–III.6 | `index.css` route B toxunulmaz; Toaster/TooltipProvider bir dəfə; `.dark` html-də | Dəyişmir | ✅ |
| IV | FSD; API çağırışı yalnız `features/*/api`; `@/*` alias | Mühərrik `shared/crud` (generic, domain-siz); modul konfiqləri `features/<x>/model`; servislər `features/<x>/api` | ✅ |
| V | State matrisi; token localStorage-da yox; URL state Zod `validateSearch` | Siyahı filtr/səhifə URL-də; form RHF; token Zustand | ✅ |
| VI | Test hər feature; real davranış; gate | Hər feature üçün `*.test.tsx` (renderApp + MSW) | ✅ |
| VII | AppError axını; loading/empty/error/success | `normalizeApiError` üç error formasını əhatə edir (research R3) | ✅ |
| VIII | İki qatlı config | Saxlanılır | ✅ |
| IX | Spec → plan → tasks | Bu sənəd | ✅ |
| X.1 | `dangerouslySetInnerHTML` yalnız sanitizasiya ilə, D-qeyd | Redaktor önizləməsi: `sanitizeHtml` (DOMParser, `script`/`on*`/`javascript:` süzülür) — spec D2 | ⚠️ əsaslandırılıb |
| X.2 | Xarici sərhədlər Zod ilə | API cavabları Zod sxemi ilə parse olunur: generic mühərrik `listEnvelopeSchema` + `ModuleConfig.rowSchema/detailSchema/lookupSchema` (contracts/module-config.md B13, hər modul üçün məcburi), xüsusi servislər öz `model/schemas.ts`-i ilə; search params `validateSearch`; JWT payload və `/config.json` Zod | ✅ |
| X.4 | `npm audit` critical/high yoxdur; lockfile commit | TipTap quraşdırıldıqdan sonra audit (tasks-da) | ✅ |

**Gate nəticəsi**: Keçir. Üç əsaslandırılmış kənarlaşma Complexity Tracking-də.

## Project Structure

### Documentation (this feature)

```text
specs/001-admin-template-migration/
├── plan.md              # Bu fayl
├── research.md          # Faza 0 — qərarlar R1–R14
├── data-model.md        # Faza 1 — entity-lər, sahələr, validasiya
├── quickstart.md        # Faza 1 — icra/verification bələdçisi
├── contracts/
│   ├── admin-api.md     # api-cbar-admin HTTP kontraktı (panel istehlak etdiyi hissə)
│   ├── module-config.md # Deklarativ CRUD modul kontraktı (TS interfeys)
│   └── runtime-config.md# /config.json, .env.*, proxy, MSW rejimi
├── checklists/requirements.md
└── tasks.md             # Faza 2 — /speckit-tasks yaradır
```

### Source Code (repository root)

```text
web-cbar-admin-next/                 # new-template-in kopyası (git tarixçəsiz), yeni admin panel
├── package.json                     # name: cbar-admin; + @tiptap/* (D1)
├── .env.development                 # VITE_API_URL=/api/v1, VITE_API_PROXY_TARGET=http://localhost:5253
├── .env.production                  # VITE_API_URL=<<DEYISDIRIN>> (fallback; /config.json üstündür)
├── .ci-cd/{base,dev,test,prod}.yaml # hostname: cbaradmin-*.e-cbar.az (TODO(devops)), apiUrl …/api/v1
├── public/config.json               # {"urls":{"apiUrl":"/api/v1"}}
├── scripts/roundtrip-check.mjs      # canlı API round-trip (köhnədən köçürülür, extension-lar ortaq)
└── src/
    ├── index.css                    # DƏYİŞMİR (route B)
    ├── main.tsx                     # MSW yalnız VITE_ENABLE_MSW=true olanda
    ├── app/
    │   ├── routes/index.ts          # createCrudRoutes(config) ilə ~83 route; pathless section layout-lar
    │   ├── routes/nav.ts            # qruplu NavItem[] (group: content|media|homepage|finance|admin)
    │   ├── providers/               # dəyişmir (+ session-expiry timer auth-bridge-də)
    │   └── shell/                   # sidebar qrup başlıqları; breadcrumb route staticData-dan
    ├── pages/                       # hər route bir qovluq; CRUD səhifələri konfiqdən
    │   ├── dashboard/  pages/ press-releases/ laws/ meas/ organization/ money-marks/
    │   ├── galleries/ videos/ homepage-blocks/ info-lines/ media-library/
    │   ├── currency-rates/ currencies/ azir/ inflation/ yield-curves/ users/ settings/
    │   └── not-found/
    ├── widgets/
    │   ├── section-tabs/            # alt bölmə tab çubuğu (Qanunlar | Kateqoriyalar)
    │   └── delete-dialog/           # təsdiq dialoqu (Dialog, showCloseButton=false)
    ├── features/
    │   ├── auth/                    # api (login), model (store + JWT decode), routes (login-page)
    │   ├── crud/                    # ModuleConfig-dən list/form səhifəsi: CrudListPage, CrudFormPage,
    │   │                            #   hooks (useCrudList/Detail/Save/Delete/LookupOptions), keys, url-state
    │   ├── media/                   # api, hooks, components (MediaPickerDialog, MediaIdField, UploadButton)
    │   ├── assets/                  # AssetsSection (attach/detach), PageAttachmentsSection, GalleryImagesSection
    │   ├── rich-text/               # RichTextEditor, extensions.ts (React-siz), toolbar, preview, editor.css
    │   ├── pages/                   # page tree + PageForm (xüsusi) + api/hooks
    │   ├── press-releases/ laws/ meas/ organization/ money-marks/ galleries/ videos/
    │   ├── homepage/ info-lines/    # model/module.ts (ModuleConfig) + api + handlers-ə uyğun tiplər
    │   ├── currency/                # rates sheet + master grid (xüsusi)
    │   ├── azir/ inflation/         # upsert + siyahı (xüsusi, CrudList-i yenidən istifadə edir)
    │   ├── yield-curves/            # siyahı konfiqdən, forma xüsusi
    │   ├── users/                   # siyahı konfiqdən, forma xüsusi, ResetPasswordAction
    │   └── settings/                # açar/JSON
    ├── entities/
    │   ├── user/                    # AuthUser (username, roleCode, permissions), hasPermission
    │   ├── content/                 # ContentStatus, Translations<T>, statusPalette
    │   └── media/                   # MediaItem tipi, formatBytes, iconForMime
    ├── shared/
    │   ├── api/                     # axios, interceptors, types (normalizeApiError genişlənir)
    │   ├── config/                  # brand.ts (CBAR Admin, templateInfo.enabled=false), runtime-config
    │   ├── crud/                    # domain-siz mühərrik utilləri: types, coerce, payload, path, date-io
    │   ├── lib/                     # sanitize-html.ts, jwt.ts, debounce
    │   ├── ui/                      # page-header, error-state, empty-state, list-pagination, form-field-*
    │   └── testing/                 # handlers/<resource>.ts (real kontrakt), fixtures, factories
    └── locales/{az,en}/             # common, nav, auth, crud, + hər feature üçün namespace
```

**Structure Decision**: Template-in FSD ağacı olduğu kimi saxlanılır. Demo domain (`projects`, `team`, `reports`, `components` səhifə/feature/entity/handler-ləri) silinir. Generic CRUD mühərriki iki yerə bölünür: React-siz, domain-siz utillər `shared/crud` (tiplər, coercion, payload, path, tarix I/O — köhnə `crud/utils.ts`-in ekvivalenti), React səhifə/hook-lar `features/crud` (kit control-ları ilə). Hər məzmun bölməsi öz `features/<x>/model/module.ts` konfiqini və `api/<x>.service.ts` + `api/<x>.keys.ts`-ini saxlayır; `pages/<x>/index.tsx` yalnız `<CrudListPage config>` / `<CrudFormPage config>` çağırır. Xüsusi ekranlar (səhifə ağacı, məzənnə vərəqi, valyuta siyahısı, AZIR, inflyasiya, gəlirlik forması, istifadəçi forması, parametrlər) öz feature qovluğunda əl ilə yazılır, amma siyahı hissəsi mümkün olduqca `CrudListPage`-i konfiqlə istifadə edir (press-releases, AZIR, inflyasiya köhnədəki əl klonları mühərrikə qatılır — ~700 sətir qənaət).

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Yeni runtime dependency: TipTap 3.26 (9 paket) — template Maddə II, root VI.2 | Kit zəngin mətn redaktoru vermir; legacy cbar.az markup-ı (`<details>` accordion, cədvəl, media link, YouTube, ümumi `<iframe>`) yalnız köhnə panelin 4 xüsusi extension-ı ilə itkisiz saxlanılır (root VI.5). Spec D1 ilə icazəlidir. | `<textarea>` HTML mənbə rejimi tək başına: redaktorlar WYSIWYG itirir, paritet pozulur. Kit-ə redaktor əlavə olunmasını gözləmək: müddətsiz. Başqa redaktor (Lexical/Quill): legacy extension-lar yenidən yazılmalı, round-trip riski artır. |
| `dangerouslySetInnerHTML` (redaktor önizləməsi) — template Maddə X.1 | Önizləmə saxlanılan HTML-in ictimai görünüşünü göstərməlidir; başqa yol yoxdur. Spec D2. | Önizləməni ləğv etmək: paritet pozulur (FR-027). Sanitizasiya kitabxanası (DOMPurify): yeni dependency; DOMParser əsaslı `sanitizeHtml` (script/on*/javascript: süzgəci) kifayətdir, çünki məzmun yalnız daxil olmuş redaktorun öz API məzmunudur. |
| Kit-də olmayan redaktor alət ikonları (bold, italic, link, undo, redo, table, code, fullscreen) | Alət paneli tanınan qlif tələb edir; kit `icons`-da bu adlar yoxdur (research R7). | `react-icons`/`lucide-react` əlavə etmək: Maddə II ilə açıq qadağandır. Mətn etiketli düymələr: alət paneli 30+ düymə ilə oxunmaz olur. Həll: kit-in `Icon` baza komponenti + yerli path data (`features/rich-text/ui/editor-icons.tsx`), kit-ə report (`showcase-ui`). |

## Faza 0 və Faza 1 çıxışları

- Faza 0: [research.md](./research.md) — R1–R14, bütün texniki qeyri-müəyyənliklər həll olunub; açıq aydınlaşdırma markeri qalmayıb.
- Faza 1: [data-model.md](./data-model.md), [contracts/admin-api.md](./contracts/admin-api.md), [contracts/module-config.md](./contracts/module-config.md), [contracts/runtime-config.md](./contracts/runtime-config.md), [quickstart.md](./quickstart.md).

## Constitution Check — dizayn sonrası yenidən yoxlama

Faza 1 dizaynı yuxarıdakı cədvəlləri dəyişmir. Əlavə təsdiqlər:

- `shared/crud` domain-siz qalır (tiplər `Row = Record<string, unknown>`, heç bir entity adı yoxdur) — template IV.2 ✅.
- `features/rich-text/model/extensions.ts` React və DOM-dan asılı olmayan extension siyahısı verir; həm `RichTextEditor`, həm `roundtrip.test.ts`, həm `scripts/roundtrip-check.mjs` (kompilyasiya olunmuş `dist`-siz, `.mjs` öz kopyasını saxlayır — research R11) eyni semantikanı daşıyır — root VI.5 ✅.
- API cavabları Zod ilə yoxlanır (B13), amma **sxem `passthrough()` ilə** — backend əlavə sahə göndərəndə panel qırılmır; forma uyğunsuzluğu `AppError{code:'CONTRACT'}` kimi görünür, səssiz cast yoxdur (X.2 tələbi ilə uyğun; test fixture-ları eyni sxemlərdən tiplənir) ✅.
- Axios instansiyası `withCredentials: false` işləyir (T016): API CORS siyasəti `AllowCredentials` vermir, auth yalnız bearer header-dir; template-in `true` dəyəri deploy-da cross-origin sorğuları bloklayardı ✅.
- Səhifə PUT-u tam `flags` obyekti göndərir (detail-dən oxunmuş) — partial flags qorumaları silir (contracts/admin-api.md §Pages) ✅.
- Tərcümələr PUT-da **tam əvəzləmədir**: boş locale ötürmə qaydası (spec FR-016) qorunur, çünki boş locale-in silinməsi məhz istənilən davranışdır; UI-də "EN tərcüməsi silinəcək" xəbərdarlığı əlavə olunmur (paritet) — research R5 ✅.

## Faza 2 üçün istiqamət (`/speckit-tasks`)

Task-lar bir proyektdə (`web-cbar-admin-next`) + root orkestrasiya (`dev.ps1`, `dev.sh`, `GUIDE.md`, `CLAUDE.md`) olaraq iki bölmədə verilir. Faza sırası: (0) kopyalama və təmizləmə → (1) təməl: auth/API/i18n/nav/shell → (2) `shared/crud` + `features/crud` mühərriki və testləri → (3) media + assets + rich-text (round-trip gate) → (4) konfiq modulları (US2) → (5) səhifələr (US3) → (6) maliyyə ekranları (US4) → (7) media kitabxanası/istifadəçilər/parametrlər (US5) → (8) deploy config, dev skriptləri, sənədlər, tam verify + əl icrası. Hər faza `npm run verify` ilə bitir.
