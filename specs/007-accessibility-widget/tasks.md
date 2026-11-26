# Tasks: Müyəssərlik menyusu (accessibility widget)

**Input**: `specs/007-accessibility-widget/` — [plan](./plan.md), [spec](./spec.md), [research](./research.md), [data-model](./data-model.md), [contracts/](./contracts/), [quickstart](./quickstart.md)

**Testlər**: `web-cbar-new` və `web-cbar-admin-new` konstitusiyaları hər dəyişən davranış üçün Vitest + MSW testi tələb edir. Buna görə test tapşırıqları daxil edilib. `api-cbar`-da test layihəsi yoxdur. Orada yoxlama `dotnet build` və test mühitində curl ilə aparılır.

**Format**: `- [ ] T### [P?] [US?] təsvir — yol`. Yollar repo kökünə nisbətəndir. `[P]` o deməkdir ki, tapşırıq başqa fayla toxunur və tamamlanmamış tapşırıqdan asılı deyil. ⛔ işarəsi lokalda icra oluna bilməyən addımı göstərir (.NET SDK yoxdur).

**MR/deploy sırası** (plan.md): 1) `api-cbar` → 2) `web-cbar-admin-new` → 3) `web-cbar-new`. `api-cbar-admin` dəyişmir: mövcud `SettingsController` istifadə olunur, miqrasiya yoxdur.

---

## Phase 1: Setup — vendor faylları (`web-cbar-new`)

**Məqsəd**: widget-in yoxlanmış surətini və resurslarını saytın öz serverinə qoymaq (Q2-B, FR-012, FR-012a, research R1).

- [X] T001 Orijinal faylları yüklə və yoxla. Rəsmi hostdan `acc-widget.min.js`, `assets/img/accw-icon.png`, `fonts/OpenDyslexic3-Regular.woff` və `.ttf` endirilir. Skriptin SHA-256-sı `6eba54dd23e8e805d53353894581e4ed8f3ead662c8cfcb102e4579535c0e59d` olmalıdır. Uyğun gəlmirsə, dayan: rəsmi versiya dəyişib, yenidən nəzərdən keçirmək lazımdır. Ölçülər: skript 33,904 B, woff 86,256 B, ttf 237,868 B, ikon 15,406 B. Yer: `web-cbar-new/public/vendor/accw/` (`acc-widget.min.js`, `accw-icon.png`, `fonts/OpenDyslexic3-Regular.woff`, `fonts/OpenDyslexic3-Regular.ttf`). Binar fayllar `curl -o` ilə yazılır, shell yönləndirməsi ilə yox.
- [X] T002 `web-cbar-new/public/vendor/accw/acc-widget.min.js` faylına yalnız 3 mətn əvəzləməsi et (research R1). Başqa heç nəyə toxunma:
  - `https://accessibility.cert.gov.az/assets/img/accw-icon.png` → `/vendor/accw/accw-icon.png`
  - `./fonts/OpenDyslexic3-Regular.woff` → `/vendor/accw/fonts/OpenDyslexic3-Regular.woff`
  - `./fonts/OpenDyslexic3-Regular.ttf` → `/vendor/accw/fonts/OpenDyslexic3-Regular.ttf`

  Sonra `grep -o 'accessibility.cert.gov.az[^"]*'` ilə yoxla ki, qalan hər rast gəlmə yalnız `href` daxilindədir. Yamaqlı SHA-256-nı qeyd et.
- [X] T003 [P] `web-cbar-new/public/vendor/accw/fonts/OFL.txt` faylını əlavə et: OpenDyslexic üçün SIL Open Font License 1.1 mətni.
- [X] T004 `web-cbar-new/public/vendor/accw/VENDOR.md` faylını yaz. Məzmun:
  - mənbə URL-ləri və endirilmə tarixi (2026-09-29);
  - orijinalın `Last-Modified` dəyəri (25 Feb 2026);
  - orijinal və yamaqlı SHA-256;
  - T002-dəki 3 əvəzləmənin siyahısı;
  - yeniləmə addımları: endir, sha yoxla, fərqi nəzərdən keçir, əvəzləmələri təkrarla, yeni sha-nı yaz;
  - lisenziya qeydi: CERT yenidən paylamanı hələ təsdiqləməyib (spec Assumptions);
  - məlum vendor xüsusiyyətləri: `accw` sessiya kukisi (R9) və `readystatechange` init (R2).

  T002-dən asılıdır.
- [X] T005 [P] `public/vendor/` qovluğunu `web-cbar-new/.prettierignore` faylına əlavə et.
- [X] T006 [P] `web-cbar-new/eslint.config.mjs` faylında `globalIgnores`-a `'public/vendor/**'` əlavə et. Yeri `'public/mockServiceWorker.js'`-in yanıdır, qısa şərhlə: "vendor kodu, redaktə edilmir".
- [X] T007 [P] `web-cbar-new/scripts/check-self-contained.mjs` faylının `EXCLUDED_DIRS` siyahısına `'public/vendor'` əlavə et, şərhlə. Sonra `web-cbar-new/scripts/check-self-contained.test.mjs` testinin keçdiyini yoxla. Əgər test `EXCLUDED_DIRS`-in tam siyahısını yoxlayırsa, onu da yenilə.

**Checkpoint**: `web-cbar-new` üçün `npm run lint` və `npm run format:check` (yaxud verify-in müvafiq addımları) vendor fayllarına görə sınmır.

---

## Phase 2: Foundational — public endpoint (`api-cbar`, MR 1)

**Məqsəd**: sayt ayarın dəyərini oxuya bilsin ([contracts/public-api.md](./contracts/public-api.md), research R6, R7). US1-in işləməsi buna bağlıdır. US2 isə mövcud admin API-dən istifadə edir, buna görə Phase 2-dən asılı deyil.

- [X] T008 `api-cbar/src/Cbar.WebApi/Controllers/SiteSettingsController.cs` faylını yarat. Nümunə atribut-routing üslubu `StatsController.cs:48`-dədir.
  - Endpoint: `[HttpGet("api/v1/site-settings/accessibility-widget")]`.
  - `db.Settings.AsNoTracking()` ilə `Key == "accessibility.widget"` sətri oxunur. Açar sabit (`const string AccessibilityWidgetKey`) kimi elan olunur.
  - `Value` jsonb-dən `enabled` yalnız JSON `true` olanda `true` sayılır. Sətir yoxdursa, `enabled` xassəsi yoxdursa, boolean deyilsə və ya JSON səhvdirsə, `false` qaytarılır. Cədvəl data-model.md-dədir.
  - Cavab həmişə `200 { enabled: bool }` olur, anonim DTO kimi. Qlobal "public" rate limit tətbiq olunur. Yazma əməliyyatı yoxdur (`cbar_web_ro` rolu).
  - `Setting.Value`-nun EF tipini (`JsonDocument`/`string`) hər iki `Cbar.Domain` surətində yoxla. Entity dəyişmir.
- [ ] T009 ⛔ `cd api-cbar && dotnet build`. Lokalda SDK yoxdur. Build GitLab pipeline-da və ya SDK olan maşında yoxlanılır.
- [ ] T010 ⛔ MR 1 deploy olunandan sonra test mühitində `curl -s https://<test-api-cbar>/api/v1/site-settings/accessibility-widget` icra et. Ayar yoxdursa, gözlənilən cavab `{"enabled":false}`-dur (quickstart §3).

**Checkpoint**: endpoint test mühitində `200 {"enabled":false}` qaytarır.

---

## Phase 3: User Story 1 — Ziyarətçi menyudan istifadə edir (P1) 🎯 MVP (`web-cbar-new`, MR 3)

**Məqsəd**: ayar aktiv olanda saytın hər səhifəsində sol aşağıda menyu ikonu görünür. Menyu cari dildə açılır və seçimlər brauzer sessiyası boyunca qalır.

**Müstəqil test**: MSW fixture `{enabled:true}` ilə teq render olunur. `false`, 500 və 404 hallarında teq yoxdur. Brauzerdə quickstart addımları 3–10 yoxlanılır. Admin paneli lazım deyil: dəyəri bazada `settings` sətri ilə, yaxud lokal MSW ilə vermək olar.

### Testlər (əvvəl yazılır, uğursuz olmalıdır)

- [X] T011 [P] [US1] `web-cbar-new/src/shared/testing/fixtures/site-settings.ts` faylını yarat: `accessibilityWidgetEnabled = { enabled: true }` və `accessibilityWidgetDisabled = { enabled: false }`.
- [X] T012 [US1] `web-cbar-new/src/shared/testing/handlers/site-settings.ts` faylını yarat. Handler `GET {apiBase}/api/v1/site-settings/accessibility-widget` sorğusuna defolt olaraq `accessibilityWidgetEnabled` qaytarır. Üslub `handlers/media.ts` və `api-base.ts` ilə eynidir. Handler `web-cbar-new/src/shared/testing/handlers/index.ts`-də qeydiyyata alınır. T011-dən asılıdır.
- [X] T013 [P] [US1] `web-cbar-new/src/features/accessibility-widget/api/accessibility-widget.api.test.ts` testini yaz. Hallar:
  - `true` → `{enabled:true}`;
  - `false` → `{enabled:false}`;
  - 500 → `{enabled:false}`, atmır;
  - 404 → `{enabled:false}`;
  - səhv forma (`{enabled:"yes"}`) → `{enabled:false}`.

  `server.use(...)` ilə override edilir.
- [X] T014 [P] [US1] `web-cbar-new/src/widgets/accessibility-widget/accessibility-widget-script.test.tsx` testini yaz. `enabled:true` olanda `<script>` render olunur və bu atributları daşıyır: `src="/vendor/accw/acc-widget.min.js"`, `defer`, ötürülmüş `nonce`, `data-accw-lang` (az/en), `data-accw-position="bottom-left"`, `data-accw-offset="20,20"`, `data-accw-size="md"`. `async` yoxdur. `enabled:false` olanda heç nə render olunmur. Kontrakt: [widget-embed.md](./contracts/widget-embed.md).
- [X] T015 [P] [US1] `web-cbar-new/src/features/accessibility-widget/vendor-invariant.test.ts` testini yaz. Test `public/vendor/accw/acc-widget.min.js` faylını `fs` ilə oxuyur və yoxlayır ki:
  - `accessibility.cert.gov.az` `src=`, `url(` və `.png` kontekstində yoxdur, yalnız `href="https://accessibility.cert.gov.az/"`-da qalır;
  - `./fonts/` yoxdur;
  - `/vendor/accw/accw-icon.png` və `/vendor/accw/fonts/OpenDyslexic3-Regular.woff` var.
- [X] T016 [P] [US1] `web-cbar-new/src/shell/language-switcher.test.tsx` testini yenilə: link Next `Link` yox, adi `<a href>` olmalıdır, çünki tam yüklənmə tələb olunur (R4). `href` dəyəri dəyişmir (`switchLocaleHref`).

### İmplementasiya

- [X] T017 [P] [US1] `web-cbar-new/src/features/accessibility-widget/model/schemas.ts` faylını yarat: `accessibilityWidgetSettingSchema = z.object({ enabled: z.boolean() })` və `type AccessibilityWidgetSetting`.
- [X] T018 [US1] `web-cbar-new/src/features/accessibility-widget/api/accessibility-widget.api.ts` faylını yarat. `import 'server-only'` ilə başlayır.
  - Fetcher: `cachedJson(accessibilityWidgetSettingSchema, { keyPrefix: 'accessibility-widget', tag: 'settings' })`. Revalidate defolt 60 s-dir.
  - `getAccessibilityWidgetSetting(): Promise<AccessibilityWidgetSetting>` funksiyası `/api/v1/site-settings/accessibility-widget` sorğusunu edir. Hər xəta `.catch(() => ({ enabled: false }))` ilə udulur (R5).
  - Nümunə: `src/features/media/api/media.api.ts`.
  - Lazım olarsa, feature-in `index.ts` public API-si ilə export olunur.

  T017-dən asılıdır. T013 keçməlidir.
- [X] T019 [US1] `web-cbar-new/src/widgets/accessibility-widget/accessibility-widget-script.tsx` faylını yarat: server komponenti, `'use client'` yoxdur.
  - Props: `{ enabled: boolean; locale: Locale; nonce: string | undefined }`.
  - `enabled` false olanda `null` qaytarılır. Əks halda T014-dəki atributlarla adi `<script>` render olunur. `next/script` istifadə olunmur (R2).
  - Sabitlər (`src`, `position`, `offset`, `size`) faylın başında elan olunur.
  - Qovluqda FSD qaydasına uyğun `index.ts` olur. T014 keçməlidir.
- [X] T020 [US1] `web-cbar-new/src/app/[locale]/layout.tsx` faylında:
  - mövcud `Promise.all`-a `getAccessibilityWidgetSetting()` və `headers()` əlavə et;
  - nonce-u `(await headers()).get(NONCE_HEADER)` ilə oxu (`NONCE_HEADER` `src/proxy.ts`-dən və ya onun paylaşılan modulundan gəlir);
  - `accessibilityWidget={{ enabled, nonce }}` dəyərini `SiteShell`-ə ötür.

  T018 və T019-dan asılıdır.
- [X] T021 [US1] `web-cbar-new/src/shell/site-shell.tsx` faylında `SiteShellProps`-a `accessibilityWidget?: { enabled: boolean; nonce?: string }` əlavə et (defolt deaktiv). `<LiveStreamDialog>`-dan sonra `<AccessibilityWidgetScript enabled nonce locale />` render et. T019-dan asılıdır. T020 ilə eyni MR-dadır.
- [X] T022 [US1] `web-cbar-new/src/shell/language-switcher.tsx` faylında `next/link` `Link`-i `switchLocaleHref` ilə adi `<a>`-ya çevir. Səbəb qısa şərhdə yazılır: widget dili yalnız init-də oxuyur, root `<html lang>` isə client naviqasiyasında yenilənmir (R4). `className` və `aria` atributları olduğu kimi qalır. T016 keçməlidir.
- [X] T023 [P] [US1] `web-cbar-new/src/app/globals.css` faylına çap qaydası əlavə et: `@media print { .accw-widget, .accw-menu { display: none !important; } }`. Sinif adlarını əvvəlcə vendor skriptində təsdiqlə (R11).
- [X] T024 [P] [US1] `web-cbar-new/docs/cookies.md` reyestrinə `accw` kukisini əlavə et: sahibi vendor widget-dir, məqsədi müyəssərlik seçimləridir, JSON, `path=/`, sessiya müddətlidir ("Invalid Date" expires), SameSite/Secure yoxdur, zəruri/funksional kateqoriyadadır (R9, data-model).
- [X] T025 [P] [US1] `web-cbar-new/CLAUDE.md` faylına qeyd əlavə et:
  - D-1 sapması (X.4 üçüncü tərəf runtime skripti, X.1 innerHTML) və `public/vendor/accw/VENDOR.md`-yə keçid;
  - "widget-i `next/script`/`async` ilə yükləmə" xəbərdarlığı;
  - dil dəyişdiricisinin niyə `<a>` olduğu.

  `'use client'` whitelist-i dəyişmir.
- [X] T026 [US1] `cd web-cbar-new && npm run verify`. Mövcud CSP testləri (`security-headers.test.ts`, `headers.test.ts`, `proxy.test.ts`) **dəyişdirilmədən** keçməlidir (SC-006).

**Checkpoint**: MSW (defolt `enabled:true`) ilə `npm run dev` işlədilir. `:3001/az`-da sol aşağıda ikon görünür, menyu azərbaycancadır, `/en`-ə keçid tam yüklənmə edir. Konsolda CSP pozuntusu yoxdur, şəbəkədə `accessibility.cert.gov.az`-a sorğu yoxdur.

---

## Phase 4: User Story 2 — Admin menyunu aktiv/deaktiv edir (P1) (`web-cbar-admin-new`, MR 2)

**Məqsəd**: Ayarlar səhifəsində "Müyəssərlik menyusu" kartı və keçid açarı olur. Dəyişiklik mövcud `PUT /api/v1/settings/accessibility.widget` ilə saxlanılır və audit olunur ([contracts/admin-setting.md](./contracts/admin-setting.md), R8).

**Müstəqil test**: MSW ilə kart render olunur. Açar yoxdursa, keçid deaktivdir. Keçid dəyişəndə PUT `{value:{enabled}}` göndərilir. Xəta olanda keçid geri qayıdır. Canlı sayt lazım deyil: ümumi ayarlar cədvəlində `accessibility.widget` dəyəri görünür.

### Testlər

- [X] T027 [P] [US2] `web-cbar-admin-new/src/shared/testing/fixtures/settings.ts` faylına `accessibility.widget` elementi üçün variantlar əlavə et: `enabled:true`, `enabled:false` və səhv forma. Mövcud defolt siyahını pozma, çünki başqa testlər ondan asılıdır. Lazım olarsa, ayrıca export et.
- [X] T028 [US2] `web-cbar-admin-new/src/features/settings/settings.test.tsx` faylına kart testləri əlavə et. MSW handler-i `src/shared/testing/handlers/settings.ts`-dədir. Hallar:
  - açar yoxdur → keçid deaktivdir;
  - `enabled:true` → keçid aktivdir;
  - səhv forma → keçid deaktivdir;
  - kliklə PUT `/api/v1/settings/accessibility.widget` gövdəsi `{value:{enabled:true}}` olur, uğur toast-u görünür, siyahı yenidən sorğulanır;
  - PUT 500 → xəta toast-u görünür, keçid əvvəlki vəziyyətdə qalır (optimistik deyil);
  - PUT gedərkən keçid `disabled`-dır;
  - `settings.manage` icazəsi olmayan istifadəçi kartı görmür.

  T027-dən asılıdır.

### İmplementasiya

- [X] T029 [P] [US2] `web-cbar-admin-new/src/features/settings/model/accessibility-widget.ts` faylını yarat:
  - `ACCESSIBILITY_WIDGET_KEY = 'accessibility.widget'`;
  - `accessibilityWidgetValueSchema = z.object({ enabled: z.boolean() })`;
  - `readAccessibilityWidgetEnabled(items: SettingItem[]): boolean`. Funksiya `find` edir, sonra `safeParse` tətbiq edir. Uğursuz olsa, `false` qaytarır.
- [X] T030 [P] [US2] `web-cbar-admin-new/src/locales/az/settings.json` və `web-cbar-admin-new/src/locales/en/settings.json` fayllarına `accessibilityWidget.*` açarlarını əlavə et: başlıq, təsvir ("Saytın sol aşağı küncündə müyəssərlik menyusu"), keçid etiketi, aktiv/deaktiv statusu, uğur və xəta toast-ları, "son dəyişiklik" etiketi. Hər iki dil tam olmalıdır. Fayl UTF-8 alətlə yazılır.
- [X] T031 [US2] `web-cbar-admin-new/src/features/settings/components/accessibility-widget-card.tsx` faylını yarat.
  - Kit `Card` və `Switch` istifadə olunur (`@cbar/lib-react-ui-kit/switch`, nümunə `currency-master-grid.tsx:128-136`).
  - Dəyər `useSettingsList()`-dən `readAccessibilityWidgetEnabled` ilə oxunur.
  - Dəyişiklik `useSettingSave()` ilə `put(ACCESSIBILITY_WIDGET_KEY, { value: { enabled } })` edir. Uğurdan sonra `settingsKeys.all` invalidasiya olunur.
  - Optimistik deyil: pending zamanı `disabled`, server vəziyyəti göstərilir. Nümunə: `features/live-streams/components/live-status-toggle.tsx`.
  - Toast-lar və `updatedAt` göstərilir.
  - Kart `<Can permission="settings.manage">` ilə bükülür (`features/auth/components/can.tsx`).
  - Cross-feature import yalnız `auth`-un public API-si ilə olur. Admin konstitusiyasına görə `features/auth` public API-dən istifadə icazəlidir. Mövcud importları yoxla.

  T029 və T030-dan asılıdır.
- [X] T032 [US2] `web-cbar-admin-new/src/pages/settings/index.tsx` faylında `SettingsPage`-in `return`-ündə DataTable-dan əvvəl `<AccessibilityWidgetCard />` render et. Lazım olarsa, `features/settings/index.ts` public API-sindən export et. T031-dən asılıdır.
- [X] T033 [US2] `cd web-cbar-admin-new && npm run verify` icra et: lint, checks, tsc, test, build.

**Checkpoint**: `:5174` → Ayarlar. Kart görünür, keçid dəyişir, ümumi cədvəldə `accessibility.widget` yenilənir.

---

## Phase 5: Polish və uçdan-uca yoxlama

- [ ] T034 Test mühitində (MR 1 → 2 → 3 deploy olunandan sonra) [quickstart §4](./quickstart.md) addımları 1–12 yoxlanılır. Hər addımda DevTools konsolunda CSP və hidratasiya xəbərdarlığı olmamalıdır, şəbəkədə gov host sorğusu olmamalıdır (SC-003, SC-005).
- [X] T035 Nonce hidratasiyasını yoxla. React `nonce` atributu üçün hidratasiya xəbərdarlığı verirsə, `web-cbar-new/src/widgets/accessibility-widget/accessibility-widget-script.tsx`-də `<script>`-ə `suppressHydrationWarning` əlavə et. Sonra `specs/007-accessibility-widget/plan.md` Complexity Tracking bölməsində D-2-ni (XI.5) "tətbiq olundu" kimi qeyd et və `web-cbar-new/CLAUDE.md`-yə bir sətir yaz (R2).
- [ ] T036 [P] Ana səhifədə aktiv və deaktiv halda Lighthouse (mobile, hər biri 3 dəfə) işə sal. Performance və LCP medianlarını `specs/007-accessibility-widget/research.md` R12 bölməsinə yaz (SC-004).
- [ ] T037 [P] Quickstart §6 SQL sorğusu ilə `audit_log`-da `settings.create`/`settings.update` sətirlərini təsdiqlə (US2-3).
- [X] T038 `specs/007-accessibility-widget/spec.md` faylında Status sahəsini yenilə. Lisenziya riski (CERT təsdiqi) hələ açıqdırsa, Assumptions-da qeyd olaraq saxla.

---

## Asılılıqlar və icra sırası

```
Phase 1 (vendor, web-cbar-new) ──┐
Phase 2 (api-cbar, MR 1) ────────┼──▶ Phase 3 US1 (web-cbar-new, MR 3) ──┐
                                 │                                        ├──▶ Phase 5
Phase 4 US2 (admin-new, MR 2) ───┘  (Phase 1–2-dən asılı deyil) ──────────┘
```

- **Kod səviyyəsində**: US1 lokalda MSW ilə Phase 2 olmadan hazırlana bilər. Deploy isə Phase 2-dən sonra olur. Sayt endpoint-i tapmasa, 404 alır, bu `enabled:false` sayılır, yəni zərərsizdir, amma widget görünmür.
- **Deploy**: api-cbar → admin-new → web-cbar-new. Bu sıra ilə sayt yayımlananda endpoint artıq mövcuddur, admin də ayarı yaza bilir.
- **US2 US1-dən asılı deyil**: fərqli repo və fərqli fayllardır, paralel aparıla bilər.
- **Phase daxilində**: testlər implementasiyadan əvvəl yazılır. Sxem → api → komponent → layout/shell.

## Paralel icra nümunələri

**Phase 1**: T001 bitəndən sonra T003, T005, T006 və T007 birlikdə icra olunur. T002 → T004 ardıcıldır.

**US1**: T011, T013, T014, T015, T016 və T017 eyni vaxtda yazıla bilər (fərqli fayllar). Sonra T018 → T019 → T020/T021 gəlir. T022, T023, T024 və T025 layout-dan asılı deyil.

**US2**: T027, T029 və T030 paralel icra olunur. Sonra T028 və T031, sonra T032 → T033.

**Repolar arası**: Phase 2 (api-cbar), Phase 4 (admin-new) və Phase 1+3 (web-cbar-new) üç ayrı iş axını kimi aparıla bilər.

## İmplementasiya strategiyası

1. **MVP = US1**, admin keçidi olmadan. Phase 1 → Phase 2 → Phase 3. Test mühitində ayar birbaşa bazaya `{"enabled":true}` yazılaraq yoxlanılır. Bu, əsas dəyəri (ziyarətçi menyunu görür) ən tez göstərir.
2. **Sonra US2**: admin keçidi. Artıq redaktorun bazaya toxunmadan idarə etməsi mümkün olur.
3. **Polish**: uçdan-uca yoxlama, performans ölçüsü və D-2 qərarı.

Hər mərhələ ayrıca MR-dır. `test` branch-ına push GitLab-da avtomatik deploy edir, buna görə push yalnız istifadəçinin göstərişi ilə edilir.
