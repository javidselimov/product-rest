# Tasks: Səhifə ağacında alt səhifə əlavə edəndə yaranan xətanın düzəldilməsi

**Input**: Design documents from `/specs/004-fix-page-add-child/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/menu-visibility.md, quickstart.md

**Tests**: Tələb olunur: spec FR-006, SC-004 və panel konstitusiyası Maddə VI. Testlər real istifadəçi davranışı üzərindədir (`renderApp`/RTL + MSW); mock davranışı assert edilmir.

**Organization**: Tapşırıqlar user story üzrə qruplaşdırılıb.

**Hədəf repo**: yalnız `web-cbar-admin-new/` (bir upstream MR). Aşağıdakı bütün yollar ona nisbidir. `web-cbar-new`, `api-cbar`, `api-cbar-admin` **toxunulmur**.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: paralel icra oluna bilər (fərqli fayllar, tamamlanmamış tapşırıqdan asılılıq yoxdur)
- **[Story]**: US1–US4 (spec.md)

## Ümumi qaydalar (hər tapşırığa aiddir)

- AZ hərfli fayllar yalnız UTF-8 qoruyan alətlərlə yazılır (Edit/Write). `Set-Content` və shell redirection qadağandır.
- UI mətnləri yalnız `t()` ilə və `locales/az` + `locales/en`-də eyni açarlarla (`npm run check:i18n`).
- Kit yalnız subpath import ilə, rənglər yalnız semantik (`npm run check:kit`).
- Raw xəta mətni istifadəçiyə göstərilmir (Maddə VII.3); log-a token/response body düşmür (VII.5).

---

## Phase 1: Setup

**Purpose**: Başlanğıc vəziyyəti qeydə almaq

- [X] T001 `web-cbar-admin-new/`-də feature branch yarat (`bugfix/004-fix-page-add-child`, `test`-dən) və `npm run verify` işlət. Başlanğıcın yaşıl olduğunu qeyd et; qırmızıdırsa, işə başlamazdan əvvəl bildir.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: US1 və US3-ün hər ikisinin istifadə etdiyi chunk-reload qoruyucusu və log

**⚠️ CRITICAL**: US1 və US3 bu faza bitmədən başlaya bilməz. US4 bundan asılı deyil.

- [X] T002 [P] `src/shared/lib/chunk-reload.test.ts` yaz (əvvəlcə uğursuz olmalıdır):
  - `isChunkLoadError` bu mesajlar üçün `true` qaytarır: `Failed to fetch dynamically imported module: http://x/assets/a-1.js`, `error loading dynamically imported module`, `Importing a module script failed.`, `Unable to preload CSS for /assets/a.css`; `new Error('boom')` və `null` üçün `false`.
  - `reloadOnce(err)` ilk çağırışda `window.location.reload`-u bir dəfə çağırır və `true` qaytarır.
  - 10 s ərzində ikinci çağırış reload etmir və `false` qaytarır (`vi.useFakeTimers` + `vi.setSystemTime`).
  - 10 s-dən sonra yenə reload edir.
  - `sessionStorage.setItem` atırsa, reload etmir və `false` qaytarır.
  - `installChunkReloadGuard()`-dan sonra `window.dispatchEvent(new Event('vite:preloadError', { cancelable: true }))` reload çağırır və `defaultPrevented === true` olur.

  `window.location.reload`-u `Object.defineProperty(window, 'location', { value: { ...window.location, reload: vi.fn() } })` ilə əvəz et. Bu, brauzer API-sidir, mock assert qadağasına düşmür.
- [X] T003 `src/shared/lib/chunk-reload.ts` yarat (research R2, data-model "ChunkReloadGuard"):
  - `export function isChunkLoadError(error: unknown): boolean`: T002-dəki dörd mesaj nümunəsi (case-insensitive regex).
  - `export function reloadOnce(error?: unknown): boolean`: açar `chunk-reload-at`, pəncərə 10 000 ms; `try/catch` ilə sessionStorage; reload-dan əvvəl `logger.warn('chunk-reload', { message })`.
  - `export function installChunkReloadGuard(): void`: `window.addEventListener('vite:preloadError', (event) => { if (reloadOnce((event as Event & { payload?: unknown }).payload)) event.preventDefault() })`.

  Azərbaycan dilində qısa fayl başlığı şərhi yaz: niyə lazımdır, TanStack `lazyRouteComponent` bunu route-lar üçün edir, `React.lazy` isə etmir. T002 yaşıl olur.
- [X] T004 [P] `src/shared/lib/logger.ts`: `error()` production-da da `console.error('[admin]', …)` yazsın.
  - `Error` üçün yalnız `name`, `message` və `context.componentStack` ötürülür. Obyektin özü, axios `config`/`response` ötürülmür.
  - Dev davranışı eyni qalır (tam obyekt).
  - `warn`/`info` dəyişmir.
  - Başlıq şərhini yenilə: "production-da da error yazılır — spec 004 FR-009".
- [X] T005 `src/main.tsx`: `installChunkReloadGuard()`-u `initTheme()`-dən dərhal sonra, hər dinamik `import(...)`-dan **əvvəl** çağır.

**Checkpoint**: `npx vitest run src/shared/lib/chunk-reload.test.ts` yaşıl, `npx tsc -b` təmiz.

---

## Phase 3: User Story 1 — "Haqqımızda" altına alt səhifə əlavə etmək (P1) 🎯 MVP

**Goal**: **+** düyməsi deploy-dan sonra da xəta ekranı göstərmədən formu açır (FR-001, FR-002, FR-004, FR-008).

**Independent Test**: quickstart §1 (yeni testlər) + §2 addım 5 (test mühitində deploy-dan sonra **+** kliki).

### Tests for User Story 1

- [X] T006 [US1] `src/features/pages/pages.test.tsx`-ə iki test əlavə et:
  - **(a) Real route ağacı** (`renderApp` + `useAuthStore.login(makeAdminJwt(), adminUser, …)`, `src/app/router.test.tsx`-dəki `signIn` nümunəsi): `/pages` → `findByRole('button', { name: 'Alt səhifə əlavə et: Haqqımızda' })` klik → `router.state.location.pathname === '/pages/new'`, `search.parentId === 1`, `#page-form` görünür, "Nəsə səhv getdi" yoxdur. Sonra AZ başlıq yazıb saxla → `pagesStore`-da yeni səhifənin `parentId === 1`, ağac səhifəsinə qayıdış.
  - **(b) Reqressiya (SC-004)**: redaktor chunk-ı yüklənmir. `vi.doMock('@/features/rich-text/ui/rich-text-editor', () => { throw new TypeError('Failed to fetch dynamically imported module: /assets/rich-text-editor-x.js') })` + `vi.resetModules()`, sonra `/pages/new?parentId=1` render et. Gözlənilən: `window.location.reload` bir dəfə çağırılıb. Mövcud kodda (T007-dən əvvəl) bu test **uğursuz** olmalıdır. Bunu T007-dən əvvəl işlədib yoxla və nəticəni commit mesajında qeyd et.

  Bu faylda artıq olan ProseMirror polyfill-lərini saxla.

### Implementation for User Story 1

- [X] T007 [US1] `src/features/rich-text/index.ts`: lazy import-a `.catch((error: unknown) => { if (isChunkLoadError(error) && reloadOnce(error)) return new Promise<never>(() => {}); throw error })` əlavə et. Reload gedənə qədər Suspense fallback (skeleton) görünür. Reload olmursa, xəta boundary-yə ötürülür. Şərhdə spec 004 R1-ə istinad et. T006(b) yaşıl olur.
- [X] T008 [US1] T006(a)-nın yaşıl olduğunu yoxla. Qırmızıdırsa, səbəbi düzəlt (`src/pages/pages/index.tsx` `onAddChild`, `src/app/routes/index.ts` `pagesNewRoute`) və research.md R1-ə qeyd əlavə et.

**Checkpoint**: US1 testləri yaşıl. Deploy-dan sonra **+** → bir reload → login → eyni form (quickstart §2.5).

---

## Phase 4: User Story 2 — ağacın istənilən sətrindən (P2)

**Goal**: Kök, 2-ci və 3-cü səviyyə sətirləri və yuxarıdakı "Yeni səhifə" düyməsi eyni şəkildə işləyir.

**Independent Test**: T009 yaşıldır.

- [X] T009 [US2] `src/features/pages/pages.test.tsx`-ə `it.each` testi əlavə et. MSW fixture-dakı (`src/shared/testing/fixtures/pages.ts`) səhifələr üzrə:
  - kök `Haqqımızda` (id 1), 2-ci səviyyə (id 11 "İllik hesabat"), 3-cü səviyyə (fixture-da varsa; yoxdursa, `pagesStore`-a test daxilində əlavə et), readonly səhifə;
  - hər biri üçün **+** → forma açılır, saxlama → `parentId` düzgündür;
  - ayrıca test: yuxarıdakı "Yeni səhifə" düyməsi (`pages:newPage` mətni) → saxlama → `parentId === null`.

  Readonly valideynin kilidi uşağa keçmir: formda `lockedHint` görünmür.

---

## Phase 5: User Story 3 — xəta olarsa aydın bildiriş və görünən səbəb (P3)

**Goal**: Xəta ekranı səbəbi log-a yazır (FR-009); chunk xətasında özü bir dəfə reload edir (US3 ssenari 2); raw mətn ekranda yoxdur.

**Independent Test**: T010 yaşıldır; deploy olunmuş saytda F12 Console-da `[admin] … message` sətri görünür (quickstart §2.4).

- [X] T010 [P] [US3] `src/app/providers/error-boundary.test.tsx` yarat:
  - **(a)** `RouterErrorFallback`-i `error = new Error('boom')` ilə render et → ekranda "Nəsə səhv getdi" var, "boom" **yoxdur**; `console.error` `[admin]` prefiksi və "boom" ilə çağırılıb (`vi.spyOn(console, 'error')`: bu, logger çıxışının müşahidəsidir, mock davranışı deyil).
  - **(b)** `error = new TypeError('Failed to fetch dynamically imported module: /assets/x.js')` → `window.location.reload` bir dəfə çağırılıb.
- [X] T011 [US3] `src/app/providers/error-boundary.tsx`: `RouterErrorFallback({ error, reset }: { error: unknown; reset: () => void })` daxilində `useEffect(() => { logger.error(error, { source: 'router' }); if (isChunkLoadError(error)) reloadOnce(error) }, [error])`. Class `ErrorBoundary.componentDidCatch` artıq `logger.error` çağırır, dəyişmir. Fayl başlığı şərhinə FR-009 qeydi əlavə et. T010 yaşıl olur.

---

## Phase 6: User Story 4 — ictimai saytın menyusunda görünmə (P1)

**Goal**: Formda hər dil üçün "menyuda görünəcək / görünməyəcək — səbəb" (FR-010). Qaydalar [contracts/menu-visibility.md](./contracts/menu-visibility.md) ilə eynidir. `web-cbar-new`/`api-cbar` dəyişmir (FR-011).

**Independent Test**: T012, T015 yaşıl; quickstart §3 test mühitində.

### Tests for User Story 4

- [X] T012 [P] [US4] `src/features/pages/model/menu-visibility.test.ts` yaz. [data-model.md](./data-model.md) cədvəlinin hər sətri üçün ayrıca hal:
  - `status`: draft → `['status']`;
  - `inactive`, `hidden`;
  - `localeOff`: yalnız `showEn=false` → az görünür, en `['localeOff']`;
  - `noTitle`: EN başlığı boş/boşluq;
  - `tooDeep`: depth 4;
  - hamısı qaydasında → `visible: true, reasons: []`;
  - bir neçə səbəb birlikdə → cədvəl sırası ilə;
  - `promotedToRoot`: valideyn həmin dildə görünmür və səhifə özü görünür → `true`.

### Implementation for User Story 4

- [X] T013 [US4] `src/features/pages/model/menu-visibility.ts` yarat:
  - `export type MenuHiddenReason = 'status' | 'inactive' | 'hidden' | 'localeOff' | 'noTitle' | 'tooDeep'`;
  - `export const MENU_MAX_DEPTH = 3`;
  - `export function menuVisibility(input: { status: string; flags: Pick<PageFlags, 'active' | 'visible' | 'showAz' | 'showEn'>; titles: Record<Locale, string>; depth: number; parentVisible: Record<Locale, boolean> | null }): Record<Locale, { visible: boolean; reasons: MenuHiddenReason[]; promotedToRoot: boolean }>`.

  `parentVisible: null` kök deməkdir. Fayl başlığında `contracts/menu-visibility.md`-yə və mənbə fayllara (`api-cbar/…/PagesController.cs` `GetTree`, `web-cbar-new/src/shell/nav.ts` `MAX_DEPTH`) istinad et: "bunlar dəyişərsə bu fayl da dəyişir". T012 yaşıl olur.
- [X] T014 [P] [US4] `src/locales/az/pages.json` və `src/locales/en/pages.json`-a `menuVisibility` bloku əlavə et:
  - `title` ("Saytın menyusunda" / "On the public site menu");
  - `visible` ("Görünəcək" / "Will be shown");
  - `hiddenBecause` ("Görünməyəcək: {{reasons}}" / "Hidden: {{reasons}}");
  - `reasons.status` ("status «Dərc olunub» deyil" / "status is not «Published»"), `reasons.inactive`, `reasons.hidden`, `reasons.localeOff`, `reasons.noTitle`, `reasons.tooDeep` ("menyu yalnız 3 səviyyə göstərir");
  - `promotedToRoot` ("Valideyn bu dildə görünmür — səhifə menyuda üst səviyyədə çıxacaq");
  - `hint` ("Dəyişiklik saytın menyusunda 5 dəqiqəyə qədər gecikmə ilə görünür.").

  EN mətnləri eyni mənada. `npm run check:i18n` yaşıl.
- [X] T015 [US4] `src/features/pages/components/page-form.tsx`: "Ümumi sahələr" kartından sonra "Saytın menyusunda" kartı əlavə et.
  - `useWatch` ilə `status`, `flags`, `translations.{az,en}.title` izlənir.
  - Valideyn: `detail?.parentId ?? parentId`.
  - Dərinlik və valideyn görünürlüyü: `usePagesTree('az')` və `usePagesTree('en')`-dən (`features/pages/hooks/use-pages.ts`). `model/tree.ts`-ə kiçik köməkçi `findWithDepth(nodes, id): { node, depth } | null` əlavə et, kök = 1. Yeni səhifənin dərinliyi `parentDepth + 1`, valideyn yoxdursa 1. Redaktədə səhifənin öz dərinliyi. Valideynin görünürlüyü `menuVisibility`-nin özü ilə, ağac node-unun `status`/`flags`/`title` dəyərlərindən hesablanır. Ağac yüklənməyibsə, `tooDeep`/`promotedToRoot` hesablanmır və yalnız qalan səbəblər göstərilir.
  - Hər dil üçün bir sətir: `Badge` (görünür → `colorPalette="green"`, görünmür → `"red"`, semantik), səbəblər `hiddenBecause` ilə vergüllə birləşdirilir, lazım olsa `promotedToRoot` xəbərdarlığı, altda `hint`.
  - Kit `Card`/`Badge`/`Alert`-dən başqa yeni komponent yoxdur.
- [X] T016 [US4] `src/features/pages/pages.test.tsx`-ə test əlavə et: "Haqqımızda" **+** → kartda AZ və EN "Görünməyəcək: status «Dərc olunub» deyil…". Status "Dərc olunub" seç, AZ başlıq yaz → AZ "Görünəcək", EN "Görünməyəcək: …başlıq…". `showAz` checkbox-unu söndür → AZ `localeOff` səbəbi.

**Checkpoint**: T012, T016 yaşıl. Formda kart hər dəyişikliyə canlı reaksiya verir.

---

## Phase 7: Polish & Cross-Cutting Concerns

- [X] T017 [P] `default.conf`: `location = /index.html { root /usr/share/nginx/html; add_header Cache-Control "no-cache" always; }` əlavə et. `location /` bloku SPA fallback üçün `/index.html`-ə düşdüyündən, başlıq deep link-lərdə də tətbiq olunur. `/assets/` immutable bloku dəyişmir. Şərh yaz: "köhnə index.html köhnə chunk hash-lərinə işarə edir — spec 004 R1". Docker varsa, `docker build -t admin-004 . && docker run --rm -p 8088:80 admin-004` və `curl -sI localhost:8088/pages/new | grep -i cache-control` ilə yoxla. Docker yoxdursa, bunu hesabatda "yoxlanılmadı" kimi qeyd et.
- [X] T018 [P] `web-cbar-admin-new/CLAUDE.md`-də "API və auth" bölməsindən sonra 3–4 sətirlik qeyd: chunk-reload qoruyucusu (`shared/lib/chunk-reload.ts`), yeni `React.lazy` istifadəsinin `isChunkLoadError`/`reloadOnce` ilə sarılması qaydası, production-da `logger.error`-un konsola yazması.
- [X] T019 `npm run verify` (lint + check:kit + check:i18n + tsc -b + test + build) — hamısı yaşıl. Redaktor faylına toxunulmadığı üçün `npm run roundtrip` tələb olunmur. `features/rich-text/index.ts` yalnız import sarğısıdır, bunu MR-də qeyd et.
- [ ] T020 Commit və push: `bugfix/004-fix-page-add-child` → MR → `test`. Deploy-dan sonra quickstart §2 (addım 2–6, **iki ardıcıl deploy**, SC-005) və §3 (SC-006) icra et. Konsolda görünən real xəta mətnini `research.md` R1-ə "Təsdiq" bəndi kimi yaz; gözləniləndən fərqlidirsə, işi dayandır və planı yenilə.
- [ ] T021 `checklists/requirements.md`-ə nəticə qeydi əlavə et: SC-001…SC-006 üzrə ölçülmüş nəticələr (keçdi / keçmədi / yoxlanılmadı + səbəb).

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (T001)** → hamısından əvvəl.
- **Foundational (T002–T005)** → US1 və US3-ü bloklayır. US4-ü bloklamır.
- **US1 (T006–T008)** → Foundational-dan sonra.
- **US2 (T009)** → US1 T006(a)-dakı `renderApp` + login quruluşunu təkrar istifadə edir; T006-dan sonra.
- **US3 (T010–T011)** → Foundational-dan sonra; US1-dən müstəqil.
- **US4 (T012–T016)** → yalnız T001-dən asılıdır; Phase 2 ilə paralel gedə bilər.
- **Polish** → T017, T018 istənilən vaxt; T019 bütün kod tapşırıqlarından sonra; T020 → T019-dan sonra; T021 → T020-dən sonra.

### Fayl toqquşmaları (paralel etmə)

- `src/features/pages/pages.test.tsx`: T006 → T009 → T016 ardıcıl.
- `src/features/pages/components/page-form.tsx` yalnız T015-dədir.
- `src/shared/lib/chunk-reload.ts` (T003) T007 və T011-dən əvvəl olmalıdır.

### Parallel Opportunities

- T002 ‖ T004 ‖ T012 ‖ T014 ‖ T017 ‖ T018 — fərqli fayllar.
- T010 (US3 testi) ‖ T006 (US1 testi) — Foundational bitəndən sonra.

## Parallel Example

```text
# Foundational və US4 modeli eyni vaxtda:
T002 src/shared/lib/chunk-reload.test.ts
T004 src/shared/lib/logger.ts
T012 src/features/pages/model/menu-visibility.test.ts
T014 src/locales/{az,en}/pages.json
T017 default.conf
```

## Implementation Strategy

### MVP (xətanı aradan qaldırmaq)

Phase 1 → Phase 2 → US1 (T006–T008) → US3-ün log hissəsi (T010–T011) → T017 → T019 → deploy.
Bu, istifadəçinin bildirdiyi xətanı bağlayır və səbəbi konsolda görünən edir (R1-in təsdiqi).

### Incremental Delivery

1. MVP deploy → quickstart §2 ilə kök səbəb təsdiqlənir.
2. US4 (menyu görünürlüyü kartı) → deploy → quickstart §3.
3. US2 testləri — reqressiya əhatəsi.

Hər addım `npm run verify` ilə bitir.

## Notes

- Reload token-i yaddaşdan silir (token yalnız yaddaşdadır, Maddə V). İstifadəçi `/login?redirect=…` vasitəsilə eyni formaya qayıdır. Bu, gözlənilən davranışdır, bug deyil. Doldurulmuş formda chunk xətası baş vermir, çünki redaktor formun ilk render-ində yüklənir.
- `api-cbar` `GetTree` filtri və ya `web-cbar-new` `nav.ts` (`MAX_DEPTH`, `navFor`) dəyişərsə, `menu-visibility.ts` və `contracts/menu-visibility.md` eyni vaxtda yenilənir.

## İcra qeydləri (2026-09-23)

**Nəticə**: T001–T019 tamamlandı. `npm run verify` yaşıl — 46 fayl, **375/375 test** (başlanğıcda 338).
Tam test yığını ardıcıl 3 dəfə yaşıl keçdi. T020 (deploy) və T021 (nəticələr) açıqdır.

Plandan kənarlaşmalar:

- **T001**: branch yaradılmadı. İş `test` branch-ində, commit olunmamış qalır, commit/push istifadəçinin qərarıdır.
  Başlanğıc `verify` **qırmızı** idi: 3 test, hər faylın ilk testi. Səbəb: soyuq lazy import tam paralel
  qaçışda RTL-in 1000 ms `findBy` limitini keçirdi. Təkbaşına işlədiləndə keçirdi. Düzəliş:
  `src/shared/testing/setup.ts` `configure({ asyncUtilTimeout: 5000 })` və `vitest.config.ts` `testTimeout: 15_000`.
  Qalıq: `money-marks.test.tsx` "forma: kateqoriya seçimi…" testi ~8 tam qaçışdan 2-də render xətası verdi
  (TanStack "Something went wrong!"). Xətanın mətni tutula bilmədi, sonrakı 7 qaçış yaşıl oldu.
  Bu test spec 004-ə aid deyil və mövcud flakiness kimi qeyd olunur.
- **T003**: `isChunkLoadError` `error.cause` zəncirinə də baxır (3 səviyyəyə qədər). Vitest modul-mock xətasını
  sarğıya bükür və əsl mesaj `cause`-dadır. Brauzerdə zərərsizdir, reqressiya testini isə real `React.lazy`
  yolu ilə aparmağa imkan verir.
- **T006(b)**: `vi.doMock` + `resetModules` əvəzinə ayrı fayl `src/features/pages/pages-chunk-reload.test.tsx`
  və faylın yuxarısında `vi.mock` istifadə olundu, ki mock digər testlərə sızmasın. Test **düzəlişdən əvvəl
  qırmızı** oldu (reload 0 dəfə, xəta boundary-yə getdi), T007-dən sonra yaşıl oldu (SC-004 ✓).
- **T009**: fixture-da id 11 səhifə deyil, sənəddir. Səviyyələr: Haqqımızda (1, kök) → Tarix (2, readonly) → Sədrlər (3), əlavə olaraq kök Pul siyasəti (5).
- **T013/T015**: dərinlik və valideyn görünürlüyü **hər dil üçün ayrıca** hesablanır (`placementUnder`).
  `api-cbar` görünməyən əcdadın uşağını kökə qaldırır, ona görə ictimai menyudakı dərinlik dildən asılıdır.
  `data-model.md` yeniləndi. Kart ayrıca komponentdədir
  (`src/features/pages/components/menu-visibility-card.tsx`). Form dəyərləri `useWatch` ilə ötürülür, `Control` cast-ı yoxdur.
- **T012**: test və modul birlikdə yazıldı, testin əvvəlcə qırmızı olması ayrıca müşahidə edilmədi.
- **T017**: Docker daemon işləmirdi, nginx konfiqi **icra ilə yoxlanılmayıb**. Məntiq belədir: `try_files … /index.html`
  və `index` daxili yönləndirmə edir və `location = /index.html` ona tətbiq olunur. Test mühitində quickstart §2.6 ilə yoxlanmalıdır.
- **T021**: `/speckit-implement` checklist fayllarını dəyişməməlidir. Nəticələr buradadır:

| SC | Nəticə |
| --- | --- |
| SC-001 (+ 100% xətasız) | ✓ testlərdə: 4 səviyyə + yuxarıdakı düymə (`renderApp`, real route ağacı). Test mühitində yoxlanılmayıb |
| SC-002 (< 1 dəq) | yoxlanılmayıb (əl ilə) |
| SC-003 (düzgün valideyn) | ✓ testlərdə (`parentId` 1/2/3/5 və kök üçün `null`) |
| SC-004 (reqressiya testi) | ✓ əvvəl qırmızı, sonra yaşıl; `verify` yaşıl |
| SC-005 (iki deploy) | yoxlanılmayıb: T020 gözləyir |
| SC-006 (menyuda ≤ 5 dəq) | yoxlanılmayıb: T020 gözləyir; qaydalar kartda və testlərdə |
