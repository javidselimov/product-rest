# CLAUDE.md — web-cbar-admin-next

CBAR CMS admin paneli (`api-cbar-admin` istehlakçısı). `new-template`-in kopyasıdır:
`@cbar/lib-react-ui-kit` + Tailwind v4, FSD, TanStack Router/Query, Zustand, Axios,
RHF+Zod, react-i18next (az/en), Vitest+RTL+MSW.

**Əvvəlcə oxu:** `.specify/memory/constitution.md` (template konstitusiyası — burada da
məcburidir) və root `../.specify/memory/constitution.md` (workspace qaydaları).
Bu panelin spec-i: `../specs/001-admin-template-migration/` (spec → plan → tasks;
`contracts/admin-api.md` API kontraktı, `contracts/module-config.md` CRUD konfiq
kontraktı). API ünvanı build zamanı sabitlənir: `.env.<env>` + `BUILD_ENV` (README "Deploy").

```bash
npm run dev        # Vite :5174 (köhnə panel 5173-də yanaşı işləyir) — /api/v1 → localhost:5253 proxy (real API)
npm run local:testcbar  # Vite :5175 — /api/v1 → https://api-cbar-admin-test.cbar.az proxy (test mühiti, lokal API lazım deyil)
npm run verify     # lint + check:kit + check:i18n + check:layout-fixtures + check:chart-layout + tsc -b + test + build — merge şərti
npm run roundtrip  # canlı API ilə redaktor round-trip (səhifə başlıqları arqument)
VITE_ENABLE_MSW=true npm run dev   # API-siz demo (MSW real kontraktla)
```

## Arxitektura (FSD)

`app → pages → widgets → features → entities → shared` — import yalnız aşağıya.

| Yer | Nə var |
| --- | --- |
| `src/app/routes/` | `root.ts` (404, `staticData.crumb`), `index.ts` (login + `authed` layout + bölmə route-ları), `nav.ts` (saytın bölmələri üzrə qruplu nav, `navEntries()`, spec 046) |
| `src/app/providers/` | `app-providers` (Query+Tooltip+Toaster), `error-boundary`, `auth-bridge` (sessiya bərpası, refresh, logout), `query-client` |
| `src/app/shell/` | `app-shell`, `sidebar` (açılıb-bağlanan qruplar, `nav-group`), `topbar` (dil, tema, istifadəçi menyusu), `command-palette` |
| `src/pages/<x>/` | hər route bir qovluq; CRUD səhifələri yalnız `<CrudListPage config>` / `<CrudFormPage config>` |
| `src/widgets/` | `section-tabs` (alt bölmə tabları), `delete-dialog` |
| `src/features/` | `auth`, `crud` (mühərrik UI + hook-lar), `media`, `assets`, `rich-text`, hər məzmun bölməsi (`model/module.ts` + `api/`) |
| `src/entities/` | `user` (AuthUser, JWT-dən), `content` (status, tərcümə tipləri), `media` |
| `src/shared/` | `api/` (axios, `AppError` — üç xəta forması), `crud/` (React-siz mühərrik: tiplər, coercion, payload, sxem), `config/` (brend, runtime konfiq), `constants/` (texniki sabitlər: `pagination`, `timing`, `http`, `storage`, `files`, `limits`, `ui`), `i18n/`, `lib/` (jwt, sanitize-html, debounce), `testing/` (MSW handler-ləri = real kontrakt) |
| `src/locales/{az,en}/` | namespace JSON-ları — `scripts/check-i18n.mjs` açar bərabərliyini yoxlayır |

**Sabitlər (spec 032, konstitusiya Maddə XI):** magic number qadağandır —
`@typescript-eslint/no-magic-numbers` (`detectObjects`, istisna `0 1 -1 2 100`) `verify`-də
işləyir. Cross-cutting sabit `src/shared/constants/<mövzu>.ts`-də (barrel yoxdur, fayl üzrə
import), slice sabiti `features/<x>/model/constants.ts`-də (`COLUMN_WIDTH`,
`PRESS_RELEASE_TYPE`…); `SCREAMING_SNAKE_CASE` + `as const`. HTTP status kodu, storage açarı,
növ kodu kimi magic string-lər də sabitdən oxunur. `shared/config/` konfiqdir, sabit deyil.
Testlər konfiq dəyərini sabitdən import edir; `*.test.*`, `shared/testing`,
`crud/fixtures` və sabit faylları lint-dən azaddır.

**Yeni CRUD bölməsi:** `features/<x>/model/schemas.ts` (Zod) → `api/<x>.service.ts` +
`keys.ts` → `model/constants.ts` (səhifə ölçüsü, sütun enləri, növ kodları) →
`model/module.ts` (`ModuleConfig`, `rowSchema` məcburi) → `pages/<x>` →
`createCrudRoutes` `app/routes/index.ts`-də → `nav.ts` → `locales/{az,en}/<x>.json` →
`shared/testing/handlers/<x>.ts` + test. Hər dil üçün ayrı media sahəsi olan nümunə:
`features/image-popups` (spec 009 — `perLocale` media, `mediaNameKey` `{locale}` ilə,
siyahıda aktiv/deaktiv toggle; sayt tərəfi `web-cbar-new` `widgets/image-popup`).

**Sol menyu** (spec 046, `../specs/046-international-memberships/contracts/admin-nav.md`): bəndin `group`-u saytın doldurduğu bölməsidir
(`about`, `marketParticipants`, `legalActs`, `nationalCurrency`, `statistics`, `media`, `cooperation`, `faq` — saytın sırası ilə), sonra panelin öz
`homepage`, `admin` qrupları; Səhifələr və Media kitabxanası qrupsuzdur. `navEntries()` tək bəndlik qrupu başlıqsız bənd edir. Qruplar
açılıb-bağlanır, vəziyyət `useUiStore.openNavGroups`-dadır (persist `nexus-ui`), ekrana gələndə onun qrupu açılır. Yeni saytın bölməsi:
`NAV_GROUPS` + `nav.json` `groups.<açar>` (az/en). Ayrıca məzmun növü bir CMS səhifəsinin cədvəlini/kartlarını verirsə, səhifənin az slug-ı
`features/pages/model/managed-sections.ts`-ə yazılır — səhifə formunda `ManagedSectionCard` bölməyə keçid göstərir. Menyu dəyişəndə
`web-cbar-new/docs/*-cms-guide.md`-dəki yollar ("**Media → Tədbirlər**") eyni dəyişiklikdə yenilənir.

**Tədbirlər** (spec 034): `features/events` iki modul (`/events`, `/events/categories`), `pages/events` seçimləri `LookupGate` ilə yükləyir
(`pages/laws` nümunəsi). Uzun siyahılı `select` üçün `searchable: true` (kit `Combobox`), siyahıdan kənar dəyərin adı `mediaNameKey`-dəndir.
Saat sahəsi `type: 'time'`.

**Yayım qrafiki** (spec 039): `features/release-schedule` üç modul (`/release-schedule`, `/groups`, `/periodicities`), qrup və dövrilik
seçimləri `pages/release-schedule`-də `LookupGate` ilə. `timingUrl` sahəsi həmişə görünür (mühərrikdə şərti sahə yoxdur): `superRefine`
onu yalnız "Link" rejimində məcburi edir, `buildPayload` digər rejimlərdə `null` göndərir. Link qaydası `shared/lib/site-link.ts`.

**Sual-cavab** (spec 051, `../specs/051-faq-page/`): `features/faq` üç modul (`/faq` suallar, `/faq/topics`, `/faq/videos`), `pages/faq`
mövzu seçimlərini `LookupGate` ilə yükləyir. Sıra form sahəsi deyil: mövzunun sualları mövzu formunun `editExtras`-ında, mövzular və videolar
siyahının üstündəki "Sıranı dəyiş" dialoqunda — hər ikisi `shared/ui/sortable-list` (sürüşdür-burax + yuxarı/aşağı düymələri, live region), hər
hərəkət dərhal saxlanır. Mövzu formunda səhifə bağlantıları da dərhal saxlanır (`pageIds`; form adı və statusu göndərir, `pageIds`-i yox — API onda
bağlantılara toxunmur). Bağlı səhifənin formunda `FaqPageLinksCard`. CRUD mühərrikinə iki genişlənmə: `prefillFromSearch` (siyahının eyni adlı
filtri "Yeni" ilə yaratma formuna keçir, `/faq/new?topicId=`) və formdan yadda saxlanmamış dəyişikliklə çıxanda soruşan `useBlocker` (bütün
modullarda; saxlama zamanı `crudSaveKey` mutasiyası gedirkən soruşmur).

**Beynəlxalq maliyyə təşkilatları** (spec 044, `../specs/044-ifi-cooperation/`): `features/ifi-organizations` bir modul (`/ifi-organizations`),
öz səhifə komponenti yoxdur. Üzvlük tarixləri `editExtras`-dakı `IfiMembershipsSection`-dadır: alt resurs `/{id}/memberships` (əlavə, redaktə,
sıra, silmə), ilk saxlamadan sonra görünür — KSM fotoları kimi. Dil boş qalan tarix həmin dildə saytda görünmür.

**Memorandumlar** (spec 045, `../specs/045-central-banks-cooperation/`): `features/memorandums` bir modul (`/memorandums`), öz səhifə komponenti
və alt resursu yoxdur. Sahələr: imzalanma ili (1991 … gələn il, `model/constants.ts`), sıra (il daxilində), hər dil üçün təşkilat və ölkə.
Başlanmış dildə hər ikisi məcburidir (`superRefine`), boş dil göndərilmir. Siyahı API-dəki kimi il azalan sıradadır.

**Aylıq hesabatlar** (spec 052, `../specs/052-monthly-reports/`): `features/monthly-reports` bir modul (`/monthly-reports`), qrup `consumer`
("İstehlakçı hüquqları", tək bənd). Seriyalar `GET /monthly-reports/series`-dən `pages/monthly-reports`-də `LookupGate` ilə (FAQ mövzuları kimi),
seriya hər yerdə **açarla** gedir (`series`, id yox). Sahələr: seriya, il (2000 … gələn il), ay (`months.1…12`), hər dil üçün fayl (`perLocale`
media, ən azı bir dil), status. Başlıq sahəsi yoxdur: dövr `model/period.ts` `periodLabel`-dir (Sığorta 12 ay, "İyun 2025 – May 2026").
CRUD mühərrikinin üçüncü genişlənməsi `ModuleConfig.newSearch(rows, filters)`: "Yeni" siyahıdakı sətirlərdən törənən sorğu əlavə edir — seriya
tabında (il/status süzgəci olmadan) birinci sətrin növbəti ayı. Təkrar dövr API-dən 409-dur, mesaj formada göstərilir. Silinmiş fayl siyahıda
"Fayl silinib" nişanıdır (`missingFile`). `LocaleBadges` `entities/content/ui`-dədir (FAQ ilə ortaq, etiketlər `common:languages.*`).
95, 96 və 93-ün səhifə formunda `ManagedSectionCard` bölməyə seriya süzgəci ilə aparır (`ManagedSection.search`, `textKey`).

**FinCERT** (spec 053, `../specs/053-fincert-page/`): qrup `fincert` (tək bənd, `/fincert`, `ShieldIcon`), üç tab (`fincertSectionTabs`).
- **Ümumi** (`/fincert`) CRUD modulu deyil: tək qeyd `GET|PUT /fincert/settings`, `features/fincert/components/settings-form.tsx`. Forma CRUD
  forma şəklindədir (`values` + `translations`, `model/settings-form.ts`), ona görə sahələri `FieldControl` çəkir. Server `errors` açarları
  (`email`, `translations.az.rfcUrl`) eyni yoldakı sahəyə düşür (`formPathOf`). `useBlocker` CRUD formaları kimidir. PUT həmişə iki dili göndərir,
  API göndərilməyən dili saxlayır.
- **Fəaliyyət istiqamətləri** və **Beynəlxalq üzvlüklər** iki modul (`model/module.ts`), sıra siyahının üstündəki dialoqdadır.
- **Generik sıralama dialoqu:** FAQ-ın "Sıranı dəyiş"-i `features/crud/components/reorder-dialog.tsx`-ə çıxarılıb (dördüncü istifadə). Başlığı
  çağıran verir, qalan mətnlər `crud:reorder.*`, `crud:sortable.*`-dadır.
- `isBlankHtml` FAQ və FinCERT üçün ortaqdır, `shared/lib/blank-html.ts`-ə köçüb.
- **Media sahəsinin növü:** `FieldConfig.mediaAccept` (`'image'` loqo, `'document'` RFC). Seçici uyğun olmayan faylları söndürür
  (`entities/media/model/accept.ts`).
- **İdarə olunan səhifənin formunda sol menyu bölməni aktiv göstərir** (FinCERT, 122, 121, KSM, 130, FAQ, 95/96/93 və `-copy`):
  - `features/pages/hooks/use-managed-nav.ts` `ui-store.activeNavOverride`-a bəndin açarını yazır. Bu sahə persist olunmur (`partialize`).
  - `nav.ts` `activeNavItem(pathname, override)` aktivliyin və açıq qrupun tək mənbəyidir.
  - Sidebar `Link`-i `activeOptions={{ exact: true }}` ilə işləyir: router prefiks uyğunluğuna özü `aria-current` qoymur.
  - `kind: 'note'` (554) override yazmır.

**İşçi məqalələri** (spec 054, `../specs/054-publications-research/`): `features/working-papers` bir modul (`/working-papers`), qrup `publications`
("Nəşrlər və tədqiqatlar", tək bənd, `consumer`-dən sonra). Sahələr: nömrə (1–99, il daxilində), il (1990 … gələn il), məqalənin dili, JEL kodları,
status; hər dil üçün başlıq, müəlliflər, xülasə, açar sözlər, PDF (`mediaAccept: 'document'`). Vergüllü sahələr formda bir sətirdir:
`model/payload.ts` göndərəndə massivə bölür (trim, boş və təkrar atılır, JEL böyük hərflə), oxuyanda `", "` ilə birləşdirir. CRUD mühərrikinə:
- server `errors` açarı `translations.<dil>.<sahə>` həmin tabdakı sahəyə düşür (`shared/crud/form-model.ts` `serverErrorPath`), tab "Xəta" ilə
  işarələnir; sahəyə düşən xəta banner-də təkrarlanmır (FinCERT forması kimi), sahəsiz açar banner-dədir;
- `ModuleConfig.conflictField`: sahə xətası olmayan 409 mesajı bu sahənin altına düşür (nömrə ildə artıq var);
- `buildPayload(values, translations, detail)`: formda olmayan, amma saxlamada geri göndərilməli sahə üçün (`legacyPageId`, seed yazır, köhnə
  ünvanlar onunla yönlənir).
"İşçi məqalələr silsiləsi" səhifəsinin formunda `ManagedSectionCard` (`isci-meqaleler-silsilesi`).

**Səhifənin menyu yeri və menyu qrupu** (spec 054 US5): "Saytın menyusunda" kartında radio qrupu "Menyudakı yeri" (`MENU_LOCATIONS`: bütün
menyularda / yalnız açılan menyularda / menyularda yox). Hər seçim `showInSideNav` + `showInDropdownNav` cütüdür (`MENU_LOCATION_FLAGS`), panel ikisini
də göndərir; `showInDropdownNav` `null`-dursa `showInSideNav`-ı izləyir (`isInDropdownNav`, saytın qaydasının güzgüsü). Köhnə `true` + `false`
cütündə heç bir radio seçilmir, kart xəbərdarlıq göstərir və dəyər dəyişməz göndərilir. Bölmə kökündə (`parentId === null`) "yalnız açılan" deaktivdir.
"Sol menyuda göstər" checkbox-u bayraqlar kartından çıxıb. Dil tabında "Menyu qrupu" (120 simvol) yalnız redaktor dəyişəndə göndərilir: API-də
göndərilməyən = saxla, `''` = sil. MSW `handlers/pages.ts` hər iki qaydanı təkrarlayır.

**Struktur sxemi** (spec 027, spec 060, `../specs/060-org-chart-auto-layout/`): `pages/org-chart` + `features/org-chart`, CRUD modulu deyil. İki görünüş,
`?view=list|chart&locale=az|en` (route `validateSearch`): **Siyahı** (ağac, "Sıranı dəyiş" — generik `reorder-dialog` üstündə `sibling-order-dialog`,
formda "Departamentlər" radio-su yalnız blok/qrupda) və **Sxem** (saytın desktop sxemi). Sxemin düzülüş kodu `features/org-chart/chart/` saytın
`entities/org-chart/{constants.ts,model/layout.ts}`-inin **bayt-bayt nüsxəsidir** — `check:chart-layout` fərqi tutur, ikisini birlikdə dəyiş. Süzgəc
`model/chart-view.ts` `api-cbar` `GetChart`-ın süzgəcini təkrarlayır (deaktiv kart, deaktiv əməkdaş/şöbə, dildə adsız — nəsli ilə). Render
`components/chart-preview*.tsx` saytın `widgets/org-chart`-ının əl portudur (keçid əvəzinə redaktə düyməsi): saytda dəyişəndə bunu da dəyiş. Rənglər
`index.css` `--org-*` (route B blokundan sonra, saytın `--site-org-*` dəyərləri, qaranlıq temada da açıq). "Saytda bax" `VITE_SITE_URL`.

**Strategiya və sənədlər** (spec 057, `../specs/057-homepage-strategy-docs/`): "Ana səhifə blokları"nın yeddinci tabı
(`/homepage-blocks/strategy-docs`, `model/section.ts`), `features/homepage/model/strategy-docs.ts` bir modul (`buildStrategyDocsModule`).
Səhifə seçimi səhifə ağacındandır (`pagesService.tree('az')`, düzləşdirilmiş, `searchable`), ona görə siyahı və forma `pages/homepage-blocks/
strategy-docs.tsx`-də `LookupGate` arxasındadır (Tədbirlər nümunəsi; bir feature başqasını import etmir). Formada sıra sahəsi yoxdur: "Sıranı dəyiş"
siyahının başlığındadır (`components/strategy-docs-reorder-dialog.tsx`, generik `reorder-dialog` üstündə, `PUT /homepage-strategy-docs/order`).
Hər dil üçün başlıq, qısa mətn, üz qabığı (`mediaAccept: 'image'`) və ünvan; ünvan dildə səhifədən üstündür, qaydası API ilə eynidir
(`http(s)://` və ya `/`). Siyahıda "Keçid işləmir" nişanı API-nin `linkBroken`-indəndir. Status `published`/`draft`, silmə bərpa olunandır (soft).
MSW `handlers/homepage.ts` validasiyanı və sıranı təkrarlayır. `rich-text/fixtures/strategy-letter.html` strategiya səhifəsinin (104) köçürülən
mətnidir: `roundtrip.test.ts` redaktorun onu bayt-bayt saxladığını yoxlayır (portret, sağa düzlənmiş imza, PDF linki).

**Media önizləməsi** (spec 010, `../specs/010-admin-image-preview/`):
`features/media/components/media-preview.tsx` — media sahəsi, seçici, qalereya,
əlavələr və kitabxana hamısı bunu işlədir. Mənbə `GET /media/{id}/preview`: blob
`apiClient` ilə (token başlıqda, URL-də yox), keş `mediaKeys.preview(id)` (invalidasiya
olunmur — baytlar SHA-256 ilə ünvanlanır), `<img src=blob:>` (SVG inline yox).
Testlərdə lazy-load üçün `shared/testing/in-view#mockAllInView`.

## API və auth

Yalnız `api-cbar-admin`, yollar API kökünə nisbi (`/laws`); `/api/v1` prefiksi
`apiUrl`-dədir (build-time `VITE_API_URL`, `.env.<env>`). Auth: `POST /auth/login` →
`{accessToken, expiresAt}`; istifadəçi JWT payload-undan (`entities/user#userFromToken`),
`/auth/me` yoxdur. Access token **yalnız yaddaşda** (Zustand); storage-a yazan kod qəbul
edilmir. Sessiya httpOnly refresh cookie ilədir (spec 005, `../specs/005-admin-persistent-session/`):
açılışda `restoreSession` (render-dən əvvəl), token bitmək üzrədirsə və ya 401-də
`refreshAccessToken` (single-flight + `navigator.locks`) və sorğu bir dəfə təkrarlanır.
Avtomatik çıxış yalnız refresh rədd ediləndə; taymer yoxdur, 5xx/şəbəkə çıxarmır.
`withCredentials: true` yalnız `auth.service`-dəki login/refresh/logout-dadır. Çıxış
`logoutEverywhere` (server + `BroadcastChannel` ilə digər tablar). Refresh cookie panel
və API eyni saytda (`*.cbar.az`) olanda işləyir; `local:testcbar` (:5175) proxy ilə
same-origin-dir, amma test API-si `Origin: localhost:5175`-i tanımırsa refresh 403 verir.
İki ayrı lokal əmr, qarışmasın deyə iki ayrı port: `npm run dev` → **:5174**, lokal API
(`.env.development`, `localhost:5253`); `npm run local:testcbar` → **:5175**, test API
(`https://api-cbar-admin-test.cbar.az/api/v1`). İkincisi `VITE_API_URL`/
`VITE_API_PROXY_TARGET`-i uşaq prosesin mühitinə qoyur (Vite `loadEnv` təyin olunmuş
dəyişəni `.env.*`-dan üstələmir), `VITE_ENABLE_MSW`-ni söndürür və başlamazdan əvvəl
`/healthz` + tokensiz `/laws` (401) yoxlayır; `--api=`, `--media=`, `--port=`, `--direct`,
`--skip-check` — `scripts/dev/local-testcbar.mjs`.

**Redaktor şəkilləri** `src="/media/{id}"` ilə nisbi saxlanılır (ictimai sayt öz
proxy-sindən keçirir); baytları **ictimai** api-cbar verir, admin API-də `/media/{id}`
yoxdur. Paneldə göstərmək üçün iki yol: lokalda Vite `/media`-nı
`VITE_MEDIA_PROXY_TARGET`-ə proxy edir (`npm run dev` → :5139, `local:testcbar` →
`--media`, defolt test api-cbar); deploy-da (nginx, proxy yox) `VITE_MEDIA_BASE_URL`
bundle-a düşür və `features/rich-text/model/extensions.ts#MediaImage` node view-u
yalnız redaktor DOM-unda `src`-i onunla tamamlayır — `getHTML()` nisbi qalır
(`roundtrip.test.ts`). Önizləmə dialoqu eyni qaydanı `model/preview-media.ts` ilə tətbiq edir.
Hər API cavabı Zod ilə parse olunur (`ModuleConfig.rowSchema/detailSchema`, B13);
uyğunsuzluq `AppError{code:'CONTRACT'}`.

**Deploy-dan sonra köhnə tab** (spec 004): hər deploy köhnə hash-li chunk-ları silir.
Route chunk-larını TanStack `lazyRouteComponent` özü bir dəfə reload ilə bərpa edir,
`React.lazy` isə yox. Buna görə hər yeni `React.lazy` import-u
`shared/lib/chunk-reload.ts`-in `isChunkLoadError` + `reloadOnce` funksiyaları ilə
sarılır (nümunə: `features/rich-text/index.ts`). `vite:preloadError` `main.tsx`-də
tutulur, nginx isə `index.html`-i `no-cache` ilə verir. `logger.error` production-da da
konsola yazır (yalnız ad + mesaj + componentStack); router xəta ekranı xətanı log-a ötürür.

## Styling: route B, və yalnız route B

`src/index.css` bloku **toxunulmazdır**. Rənglər yalnız semantik (`bg-background`,
`text-muted-foreground`…) — `npm run check:kit` hex/rgb/oklch/Tailwind palitra
utilitləri, barrel import və qadağan kitabxanaları tutur. Redaktor stilləri
`features/rich-text/ui/editor.css` — yalnız `var(--…)` tokenlər.

## Kit qaydaları

- Şrift DM Sans-dır (kitin `--ui-font-sans`-i): kit faylı göndərmir, `src/fonts.css` saytın fayllarını (`src/assets/fonts/dm-sans`, OFL) yükləyir
  (spec 060-a qədər panel sistem şriftinə düşürdü).
- Subpath import (`@cbar/lib-react-ui-kit/button`); `TooltipProvider`/`Toaster` yalnız
  `app-providers`; `''` Select/Combobox-da rezervdir — boş seçim `clearable` ilə.
- Kit-də olmayanlar və həlli: səhifələmə (`shared/ui/list-pagination`), alert dialog
  (`widgets/delete-dialog`), saat seçimi (`Input type="datetime-local"`), redaktor
  (TipTap, spec D1), redaktor ikonları (`features/rich-text/ui/editor-icons` — kit
  `Icon` bazası).
- Kit bug-ı `node_modules`-da yamaqlanmır — `showcase-ui`-yə report.

## i18n və test

Bütün mətnlər `t()` ilə, az default; AZ hərfli JSON-lar yalnız UTF-8 qoruyan alətlərlə.
Testlər `renderApp(path)` + MSW (`handlers/` real kontrakt, in-memory store); mock assert
qadağandır. `roundtrip.test.ts` legacy HTML fixture-larını TipTap-dan keçirir — redaktor
extension-larına toxunanda mütləq. Saytın redaktor markup-ından blok qurduğu səhifələrin (tarix, missiya, haqqımızda, media sorğuları)
fixture-ları (həmçinin `ifi-organizations`, spec 044, `memorandums`, spec 045, `memberships`, spec 046, `financial-literacy`, `literacy-platform`, spec 047, və `consumer-text`, `complaint-index`, `appeal-statistics`,
`consumer-documents`, spec 050 — sonuncular cədvəl xanasındakı il → ay akkordeonlarını saxlayır) `fixtures/layouts/`-dadır: `web-cbar-new`-dəki nüsxə ilə eynidir (`check:layout-fixtures`) və redaktordan bayt-bayt
dəyişmədən keçməlidir. Test burada qırılırsa, redaktor saytın oxuduğu formanı dəyişib: fixture-u yox, səbəbi düzəldin. Yeni layout
üçün qayda kök `CLAUDE.md`-dədir.
