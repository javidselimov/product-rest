# Research: Public saytın `nextjs-template` üzərində yenidən qurulması

**Faza 0 çıxışı** | Tarix: 2026-09-14 | Spec: [spec.md](./spec.md)

Mənbələr: `nextjs-template/src` (`server/env.ts`, `proxy.ts`, `providers/*`, `shared/api/*`,
`shared/i18n/*`, `shell/*`, `shared/testing/*`), `nextjs-template/eslint.config.mjs`,
`nextjs-template/scripts/*`, `nextjs-template/.specify/memory/constitution.md` v2.0.0,
`@cbar/lib-react-ui-kit@0.4.0` (`package.json#exports`, `dist/i18n`, `dist/pagination`,
`dist/date-picker`, `tokens.json`), `web-cbar/src` (`lib/api.ts`, `lib/content.ts`, `lib/t.ts`,
`proxy.ts`, `components/Header.tsx`, `Footer.tsx`, `app/globals.css`, `app/[locale]/page.tsx`,
`[...slug]/page.tsx`, siyahı səhifələri), `web-cbar/.ci-cd/*`, `dev.ps1`, `dev.sh`,
`product-host/visitor` (yalnız davranış referansı).

---

## R1 — İş qovluğu, başlanğıc və port

**Decision**: `nextjs-template` → `web-cbar-next` (git tarixçəsiz kopya; `node_modules`, `coverage`,
`tsconfig.tsbuildinfo`, `specs/001-*`, `specs/002-*` kopyalanmır; `vendor/*.tgz` kopyalanır).
`npm run setup` ilə placeholder-lər: `PROJECT_NAME=web-cbar-next`, `PROJECT_DISPLAY_NAME=Azərbaycan
Respublikasının Mərkəzi Bankı`, `INGRESS_DOMAIN`/`API_HOST_*` — `web-cbar/.ci-cd`-dən
(`api-cbar-test.e-cbar.az` dev/test; prod `TODO(devops)`), `NEXUS_*`/`GIT_REPO_URL`/`CI_TEMPLATE_REF`
— köhnə `.gitlab-ci.yml` (`ref: 1.0.0`) və admin-next-dəki dəyərlər; `setup:check --strict` sıfır
qalıq. Kit lokal olaraq `npm run install:offline` ilə (vendor tarball, VPN-siz); Docker
`install:nexus` template-dən. Demo domain və sessiya qatı silinir (plan.md "Structure Decision").
`brand.ts`: `displayName` bank adı (i18n-də `common:brand.name` də var), `templateInfo.enabled=false`,
`demoPassword` silinir. Dev port: `package.json` `dev: next dev -p 3001`; `start`/Docker `3000`.

**Rationale**: Root konstitusiya II.1 (müstəqil proyekt), spec Assumptions "İş yeri", D5. Vendor
tarball template-də artıq var — admin-next-dəki `.env.nexus` tələbi burada yaranmır.

**Alternatives considered**: `web-cbar`-i yerində yenidən yazmaq (cutover-ə qədər işlək sayt qalmır,
SC-002/SC-003 müqayisəsi mümkün olmur); `PROJECT_NAME=web-cbar` (image adı mövcud deployment ilə
toqquşur; cutover spec-i adı dəyişir).

## R2 — Məlumat alma modeli: yalnız server, brauzer API-yə müraciət etmir

**Decision**: Bütün API çağırışları server tərəfindədir. `src/server/api-client.ts` (`import
'server-only'`): axios instansiyası `baseURL: env.API_URL`, `timeout: 20000`, `Accept: application/json`,
`withCredentials` yoxdur; hər cavab Zod sxemi ilə parse olunur (`parseOrThrow`), uğursuzluq
`AppError{kind:'schema'}`; `getOrNull` variantı 404-ü `null` qaytarır (köhnə `getJsonOrNull`).
Keş yoxdur: axios Next-in fetch keşindən keçmir, hər sorğu təzədir (köhnə `cache:'no-store'`
ekvivalenti); route-lar `export const dynamic = 'force-dynamic'` saxlayır (SSR-in build-time
prerender-ə düşməməsi üçün). `features/<x>/api/*.ts` bu client-i çağıran server-only funksiyalardır
(köhnə `api.ts`-in 30 funksiyası, eyni URL və parametr qurma qaydası — contracts/public-api.md).
Brauzer axios client-i (`shared/api/api-client.ts`), `interceptors.ts`, `registerUnauthorizedHandler`
silinir; `shared/api/app-error.ts` qalır. `@tanstack/react-query` provider template stack-i olaraq
qalır, query yazılmır. İnteraktiv seçimlər (məzənnə tarixi, siyahı filtrləri, səhifə) URL sorğu
parametri + server render ilə (köhnə sayt kimi GET formaları və `Link`); tablar (xəbər/media)
yalnız görünüş vəziyyətidir və məlumat yenidən yüklənmir.

**Rationale**: Köhnə sayt eyni modeldədir (heç bir client fetch yoxdur); `API_URL` yalnız serverdə
(root III.5, template VIII.1); CSP `connect-src 'self'` dəyişmir; JS-siz işləmə (FR-025) qorunur.
Axios seçimi template Maddə II ("HTTP: Axios") ilə uyğundur; ESLint `fetch` qadağası presentation
qatlarında qalır.

**Alternatives**: Route handler proxy (`/api/*` → api-cbar) + client TanStack Query — ikinci yol,
CSP və test səthi artır, paritet üçün lazım deyil; Next `fetch` (server) — işləyir, amma Maddə II
axios deyir, fərq yalnız keş semantikasıdır (bizdə keş yoxdur).

## R3 — Cavab validasiyası: Zod sxemləri, envelope, `passthrough`

**Decision**: `entities/content/model/schemas.ts`: `localeSchema = z.enum(['az','en'])`,
`listEnvelope(item) = z.object({items: z.array(item), total: z.number(), page: z.number(),
pageSize: z.number()}).passthrough()`; hər feature `model/schemas.ts`-də köhnə `api.ts`
interfeyslərini birə-bir Zod ilə yazır (data-model.md), hamısı `.passthrough()`, `null`-lanan
sahələr `.nullable()`, `?` sahələr `.optional()`. Tiplər `z.infer` ilə çıxarılır — əl ilə interfeys
yazılmır. Uyğunsuzluq `AppError kind:'schema'` — siyahı `ErrorState` (`errors:contract`), detal
route `error.tsx`. Enum-a bənzər rəqəmlər (`StaffMember.type` 1|2, `MoneyMarkDetail.type` 1|2,
press reliz `type` 1|2) `z.number()` olaraq qalır + entity helper (`isBoard(type)`), çünki API
gələcəkdə yeni dəyər verə bilər.

**Rationale**: Template X.2 (xarici sərhəd Zod ilə); `passthrough` backend-in əlavə sahə
göndərməsini qırılma saymır (root VII.3 geriyə uyğunluq ruhu).

**Alternatives**: `z.strictObject` (backend əlavə sahə əlavə edəndə sayt boşalır); `as T` cast
(X.2 pozuntusu).

## R4 — Route params, `searchParams` və səhifələmə

**Decision**: `shared/lib/search-params.ts`: `first(value)` (string | string[] | undefined → ilk
string), `pageSchema = z.coerce.number().int().positive().catch(1)`, `idSchema`,
`optionalIdSchema` (`categoryId`, `emitentId`, `infoTypeId`), `enumParam(values, fallback)`
(press reliz `type` 1|2, pul nişanı `type` 1|2, qanun `type`), `dateParam` (`YYYY-MM-DD`, yoxsa
`undefined`), `q` (trim, boş → `''`). Statistika və media səhifələri parametr oxumur (köhnə
saytla eyni — SC-002). Hər view-un
loader-i öz `searchParamsSchema`-sını `z.object` ilə qurur və `await searchParams` nəticəsini
parse edir (Next 16: `params`/`searchParams` Promise-dır). Route `params.slug`
`decodeURIComponent` ilə (catch-all: son seqment). `widgets/list-pagination`: kit `Pagination*`
(subpath `pagination`) + Next `Link`, `buildHref(page)` mövcud sorğu parametrlərini qoruyur;
`totalPages = max(ceil(total/pageSize),1)`; 1 səhifədə control göstərilmir; `pageSize` default 10
(ana səhifə 5/6 — köhnə kimi). Filtr formaları GET `<form>` + kit `Button` (JS-siz işləyir).

**D6 (icra zamanı təsdiqlənib)**: kitin `Select`-i Radix əsaslı client komponentidir, `DatePicker`-i
isə `name` prop-u daşımır — hər ikisi JS-siz GET formasında dəyər göndərmir. Ona görə filtr
sahələri `widgets/filter-form/{select-field,date-field}.tsx`-də kit `Field` + kit `inputVariants`
stilində **native** `<select>` / `<input type="date">` kimi qurulub; rəng və ölçü yalnız kit
token-larıdır (FR-022 "kit primitivlərindən yığılır"). Kitin `Pagination*` keçidləri `asChild`
dəstəkləmir — adi `<a href>` ilə tam səhifə keçidi (siyahılar onsuz da hər sorğuda serverdən gəlir).
Kitin `TabsTrigger`-i `role="tab"` verir — URL ilə idarə olunan seçimlər (reliz/elan, əskinas/sikkə,
təşkilat bölmələri) kit `Button asChild` + `Link` ilə qurulub.

**Rationale**: Template V (URL state Zod ilə), köhnə saytın `parsePositiveInt` və inline
`<nav>` təkrarları bir yerə toplanır (spec FR-017, FR-018).

**Alternatives**: Client tərəfli filtr (router.push) — JS tələb edir, FR-025 ilə zidd.

## R5 — Proxy, locale yönləndirməsi, cookie-lər və CSP

**Decision**: `src/proxy.ts` template-dən uyğunlaşdırılır: (1) yol locale ilə başlamırsa —
ilk seqment locale-ə bənzəyirsə (`/^[a-z]{2}(-[A-Za-z]{2,4})?$/`) ötür (app 404 verir: `/ru`),
əks halda **həmişə** `/az{path}` yönləndirməsi (307, sorğu parametrləri qorunur) — `NEXT_LOCALE`
cookie oxunmur və yazılmır, `rememberLocale` silinir; (2) sessiya gate və login yönləndirməsi
silinir; (3) `x-locale` header, nonce, CSP — template kimi. `matcher` köhnə saytla eyni:
`['/((?!_next|api|.*\\..*).*)']`. CSP (`src/server/security-headers.ts` və proxy nonce variantı):
`img-src 'self' data: {API_URL origin}`, `media-src {API_URL origin}`, `frame-src
https://www.youtube.com https://www.youtube-nocookie.com {CSP_FRAME_SRC}`, qalanı template
(`script-src 'self' 'nonce' 'strict-dynamic'`, `style-src 'self' 'unsafe-inline'`, `connect-src
'self'`, `frame-ancestors 'none'`). `CSP_FRAME_SRC` — boşluqla ayrılmış əlavə mənbələr (env,
optional). Cookie inventarı: yalnız `ui-theme` (template `ui-store`); analitik cookie yoxdur.

**Rationale**: Spec FR-005/SC-007 (həmişə `az`), root VII.2 (köhnə yönləndirmə davranışı eyni),
template VIII.6 (cookie siyahısı), X.6 (başlıqlar tətbiq səviyyəsində; genişlənmə plan
Complexity-də). `img-src` genişlənməsi olmadan heç bir media şəkli yüklənmir.

**Alternatives**: `NEXT_LOCALE` ilə yadda saxlanan dil (template default) — spec-ə zidd, cookie
sayı artır; şəkilləri Node üzərindən proxy etmək (`/media/*` route handler) — əlavə yük, media
ünvanı kontraktı dəyişir.

## R6 — i18n: namespace-lər, `t.ts` köçürülməsi, kit etiketləri

**Decision**: Namespace-lər: `common` (brand, actions, states, language, theme, pagination,
dateLocale), `nav` (menyu, "daha çox", axtarış, qaynar xətt, E-CBAR), `footer` (naviqasiya, əlaqə,
telefon, mətbuat, daxili, onlayn müraciət, sorğu, müəlliflik), `home` (bölmə başlıqları, kart
etiketləri — köhnə `keyIndicators`… `bankingSector`), `content` (press relizlər, elanlar,
qanunlar, kateqoriya, tip, əlavə fayllar, oxu, tarix), `finance` (məzənnə, nominal, kod, XML,
AZIR, inflyasiya, gəlirlik, MEAS sütunları), `organization`, `media`, `search`, `errors`
(`loadError`, `contract`, `notFound`, `unexpected`, `retry`). Köhnə `t.ts` 50 açarı və hər
səhifədəki `content` obyektləri bu namespace-lərə paylanır; `dateLocale` (`az-AZ`/`en-GB`)
`common`-da. `shared/i18n/index.ts` `NAMESPACES` yenilənir; `key-parity.test.ts` və
`utf8-guard.test.ts` qalır. Server komponentlərində `t` üçün `shared/i18n/server.ts`:
`getT(locale, ns)` — `createI18n(locale).getFixedT(null, ns)` (react-i18next-siz, server-safe);
client komponentləri `useTranslation`. Kit etiketləri: `shared/i18n/ui-messages.ts` — `UIMessages`
az/en (31 açar: `pagination.*`, `breadcrumb.*`, `sheet.close`, `dialog.close`, `datePicker.clear`,
`spinner.label` …), `AppProviders`-də `<UIMessagesProvider messages={uiMessages[locale]}>`
bir dəfə. `DatePicker` `locale={locale === 'az' ? 'az-AZ' : 'en-GB'}`.

**Rationale**: Template I.2, IV (i18n URL ilə), spec FR-009, FR-024; kit 0.4.0 `i18n` subpath-i
məhz bunun üçündür (template hələ mount etmir — burada edilir).

**Alternatives**: Tək `common` namespace (böyük fayl, paralellik testi zəifləyir); server üçün
ayrıca i18n instansiyası saxlamaq — `createI18n` artıq per-locale instansiya yaradır, kifayətdir.

## R7 — CMS HTML: hazırlama, sanitizasiya, `.cms-content` stilləri

**Decision**: `shared/lib/cms-html.ts` (server-safe, DOM-suz): `prepareCmsHtml(html, apiUrl)` =
köhnə `prepareContent` (media `href`/`src` → mütləq, `target="_blank"` + `rel="noopener
noreferrer"` yalnız yoxdursa) + `sanitizeCmsHtml`: `<script …>…</script>` blokları silinir,
`on[a-z]+="…"`/`'…'` atributları silinir, `href`/`src`/`xlink:href` dəyəri `javascript:` (boşluq və
entity variantları normallaşdırılaraq) ilə başlayanda atribut silinir; `<details>`, `<table>`,
`<iframe>`, `data-*` və inline `style` **toxunulmur**. Nəticə `widgets/cms-content/CmsContent`
(server komponenti) `<div className="cms-content" dangerouslySetInnerHTML>` — yeganə yer, fayl
başında ESLint istisnası + D2 istinadı. 7 istifadə yeri (CMS səhifəsi, qanun, press reliz, pul
nişanı təsviri + mühafizə, pul nişanı xəbəri, şöbə təsviri, əməkdaş bio) bu komponenti çağırır.
Stil: `src/app/cms-content.css` — köhnə 27 selektor semantik token-larla yenidən yazılır
(`text-foreground`, `text-primary` keçidlər, `border-border` cədvəl, `bg-muted` summary,
`text-muted-foreground`); `globals.css` route B blokundan **sonra** `@import './cms-content.css'`.
Şəkil `max-width:100%`, YouTube `aspect-ratio:16/9`, `.tableWrapper{overflow-x:auto}`.
Test: `cms-html.test.ts` — fikstür HTML (accordion ×N, table ×N, media link, img, YouTube,
iframe, `<script>`, `onclick`, `javascript:`): say sabit qalır, üç zərərli sinif sıfır olur.
`stripHtml`/`excerpt(260)` (ana səhifə featured) `entities/content/lib`-də.

**Rationale**: Spec FR-013/FR-014, D2; template X.1 (sanitizasiya + D-qeyd); serverdə DOMParser
yoxdur, jsdom runtime-a gətirilmir.

**Alternatives**: `html-react-parser`/`sanitize-html` (yeni dependency, Maddə II); client tərəfli
DOMParser (məzmun SSR-də görünməz olur, FR-025 pozulur).

## R8 — Qrafiklər: ECharts, token rəngləri, SSR sərhədi

**Decision**: `echarts@6.1.x` pin (`npm i -E`). `widgets/chart-card/chart.tsx` (`'use client'`):
`useEffect`-də `import('echarts')` (yalnız lazım olan modullar: `echarts/core`, `LineChart`,
`BarChart`, `GridComponent`, `TooltipComponent`, `LegendComponent`, `CanvasRenderer`), `ResizeObserver`,
unmount-da `dispose`; rənglər mount-da `getComputedStyle(document.documentElement)` ilə
`--ui-color-chart-1..5`, `--ui-color-foreground`, `--ui-color-border`-dən oxunur; `html.class`
üzərində `MutationObserver` tema dəyişəndə `setOption` təzələyir. Server tərəfi: loader seriyanı
serializable `ChartSeries` (`{name, points:[x,y][]}`) kimi verir; `ChartCard` (server) kit `Card` +
başlıq + `Suspense`-siz `Skeleton` (client mount-a qədər `Chart`
placeholder göstərir) + `EmptyState` (nöqtə yoxdursa) + `ErrorState`. 6 kart: ana səhifə
`InflationCard`, `MoneyMarketCard`, `YieldCurveCard`; statistika AZIR, inflyasiya, gəlirlik.
Köhnə `Chart.tsx` seçimləri (ox formatı, tooltip) davranış referansıdır.

**Rationale**: Spec D1, FR-020; template XI.4 (`window` yalnız effektdə); ilkin bundle-a ECharts
düşmür (Performance Goals).

**Alternatives**: `echarts-for-react` (əlavə dependency); tam `echarts` importu (bundle böyük).

## R9 — Qabıq: header, mega-menyu, mobil çekmecə, footer, dil/tema

**Decision**: `[locale]/layout.tsx` (server) `getPagesTree(locale)`-ni `try/catch` ilə çağırır
(uğursuzluq → `[]`, menyu boş, səhifə render olunur — spec Edge Case), `SiteShell{tree, locale}`
render edir. `shell/nav.ts`: `FEATURE_ROUTES` (6 slug cütü → `press-releases|media|organization|
national-currency|laws`), `VISIBLE_SECTIONS=8`, `MAX_DEPTH=3`, `navFor(node, locale)` (`navUrl`
üstünlüyü: mütləq → xarici, nisbi → `/${locale}${navUrl}`), `buildNavSections(tree)`.
`SiteHeader` (server): loqo (`/site/logo-{locale}.svg`), `HeaderSearch` (client, kit `Input` +
`IconButton`, GET `/{locale}/search`), `tel:966` keçidi, `LanguageSwitcher` (client — template-dən,
`useSearchParams` ilə sorğu qorunur, yalnız digər dil), `ThemeToggle` (template), E-CBAR `Button`
(`asChild` xarici keçid), `MegaMenu` (server): `<nav>` → `<ul>` → hər bölmə `<li class="group">` +
`<a>`; alt səviyyələr `group-hover:` / `group-focus-within:` ilə açılan flyout (`bg-popover`,
`border-border`, `shadow`) — control deyil, semantik `<nav>`; 9+ bölmə "daha çox" flyout-u. Mobil:
`MobileNav` (client) kit `Sheet` + `Accordion` ilə tam ağac. `SiteFooter` (server): kit `Separator`,
`Button asChild` (onlayn müraciət / sorğu), sosial keçidlər kit `icons`-dan (varsa) — yoxdursa
inline SVG `currentColor` ilə (ikon kitabxanası yox); `NAV_SECTION_TITLES` allowlist + `slice(0,6)`
fallback; əlaqə dəyərləri `shared/config/contacts.ts` (telefon, ünvan i18n-də). Breadcrumb: köhnə
saytda yoxdur, əlavə edilmir (paritet); `SectionSidebar` widget-i saxlanılır.

**Rationale**: Spec FR-006/FR-007/FR-008/FR-010, D4; template III.1 (control-lar kit-dən), XI.1
(`'use client'` minimal: header-in yalnız 4 kiçik parçası client).

**Alternatives**: Kit `dropdown-menu`/`navigation` ilə mega-menyu — kitdə `navigation-menu`
yoxdur, `dropdown-menu` klik-əsaslıdır və JS tələb edir (FR-025 hover/JS-siz keçidlər); tam client
header (XI.1 pozuntusu).

## R10 — FSD xəritəsi: route → loader → view → widget/feature

**Decision**: Hər route üçün `views/<x>/loader.ts` (server-only: `params`/`searchParams` Zod
parse, `features/*/api` çağırışları, `Promise.all`, per-blok `.catch` → `{data:null, error:true}`)
və `views/<x>/index.tsx` (prop-lu, mümkün qədər server komponenti). `app/[locale]/<x>/page.tsx`
3 sətirdir: loader + view (+ `generateMetadata` eyni loader-in yüngül variantı və ya
`loadMeta`). `features/<x>/api/` funksiyaları köhnə `api.ts` adları ilə (`getPressReleases`…),
`features/<x>/model/schemas.ts` + helper-lər; `entities/content` (Locale, envelope, `mediaUrl`,
`formatDate(locale)`, `excerpt`), `entities/page-node` (`PageNode` sxemi, `findChain`, `hrefFor`).
Widget-lər plan.md ağacında. Ana səhifə loader-i köhnə `page.tsx`-in 8 paralel sorğusunu,
`fetchPreviousSheet` (5 günə qədər geri) və featured excerpt-i eyni qaydada təkrarlayır
(SC-002); per-blok xəta → kart `ErrorState` (spec US2 ssenari 5 — köhnədə blok gizlənirdi,
yeni davranış qəbul edilmiş yaxşılaşmadır).

**Rationale**: Template IV.2 (nazik route), IV.6 (fetch yalnız api qatında), VI (view-lar
test olunur).

**Alternatives**: Fetch-i route faylında saxlamaq (IV.2-yə zidd); view-un özünü async server
komponenti etmək (RTL ilə test olunmur — R11).

## R11 — Test strategiyası

**Decision**: Dörd səviyyə: (a) **view testləri** — `renderApp(<XView {...fixture}/>, {locale})`
(template `render.tsx`), real davranış: keçidlər, etiketlər, boş/xəta vəziyyəti, hər iki locale;
(b) **loader testləri** — MSW node server (`shared/testing/handlers/<feature>.ts` real
kontrakt cavabları, `onUnhandledRequest:'error'`), loader-i çağırıb URL/parametr və Zod
davranışını (404 → null, sxem uyğunsuzluğu → error) yoxlayır; axios node-da MSW ilə tutulur;
(c) **server-side** — `proxy.test.ts` (yönləndirmə cədvəli: `/`, `/laws?x=1`, `/en/laws`, `/ru`,
`/favicon.ico`), `security-headers.test.ts` (CSP mənbələri), `theme-ssr.test.tsx` (template),
`cms-html.test.ts` (R7), `key-parity.test.ts`, `search-params.test.ts`; (d) **əl ilə** —
quickstart §4 (iki sayt yanaşı, SC-002 üçün `logs/api-web.log`-dan sorğu müqayisəsi, SC-003 üçün
DOM sayları). Vitest konfiqi template-dən; `include` əlavə edilmir.

**Rationale**: Template VI, spec FR-030, SC-005.

**Alternatives**: E2E (Playwright) — yeni devDependency, əhatəyə daxil deyil; yalnız snapshot
testləri (mock davranışını assert etmə riski, VI.2).

## R12 — Runtime konfiqurasiya, deploy və dev skriptləri

**Decision**: `src/server/env.ts`: `API_URL` (`z.url()`, default `http://localhost:5139`),
`NODE_ENV`, `TZ` (`Asia/Baku`), `CSP_FRAME_SRC` (optional string); `SESSION_COOKIE_NAME`,
`ENABLE_MOCK_API` silinir (mock yalnız testlərdə; `instrumentation.ts` MSW boot silinir).
`.ci-cd/dev|test|prod.yaml` `env`: `API_URL` (`web-cbar` dəyərləri), `NODE_ENV=production`,
`TZ`; `SESSION_*`/`ENABLE_MOCK_API` sətirləri silinir; hostname `TODO(devops)`. `Dockerfile`,
`.gitlab-ci.yml` template-dən (`CI_TEMPLATE_REF` → `1.0.0`). Root: `dev.ps1` `$Services`-ə
`@{ Name='web-cbar-next'; Port=3001; Dir='web-cbar-next'; Cmd='npm run dev'; Log='web-public-next.log';
Url='http://localhost:3001/az' }` (sonuncu), install bloku `npm run install:offline`; `dev.sh`
eyni; port siyahısı (kill) `3001` ilə; `GUIDE.md` "Yeni public sayt" bölməsi; root `CLAUDE.md`
arxitektura diaqramı və komanda cədvəli.

**Rationale**: Template VIII, root IV.1–IV.3, spec FR-026/FR-028/FR-029.

**Alternatives**: `.env.local` ilə port (skriptlərdən görünmür); Docker-də də 3001 (Helm
`listenPort` və ingress dəyişərdi — lazımsız).

## R13 — Metadata, 404, loading, error

**Decision**: Hər route `generateMetadata` ixrac edir: başlıq `${entityTitle} | ${brand}` (siyahı
səhifələri `t('content:pressReleases')` kimi), `description` — CMS məzmunundan `excerpt(160)`
(varsa), `alternates.languages` `{az, en}` eyni yol; root `metadata` template-dən (`icons`).
`[locale]/not-found.tsx` (kit `EmptyState` + ana səhifə `Button`, i18n) — detal `notFound()`
buradan çıxır; root `app/not-found.tsx` dəstəklənməyən locale üçün (i18n-siz, iki dildə statik
mətn — ESLint istisnası yalnız bu faylda, sanki `views/components` qalereyası kimi); `error.tsx`
`RouteError` (client, `reset`). Köhnə saytda `generateMetadata` yoxdur — FR-012 tələbi ilə əlavə
olunur.

**İcra qeydi (D7)**: route səviyyəli `loading.tsx` **qoyulmur**. Suspense sərhədi Next-i cavabı
dərhal `200` ilə axıtmağa məcbur edir və səhifənin sonradan çağırdığı `notFound()` HTTP statusunu
dəyişə bilmir (real stack ilə yoxlanıb: naməlum slug `200` qaytarırdı). Köhnə saytda da
`loading.tsx` yoxdur və 404 statusu real 404-dür (SEO). Yükləmə vəziyyəti blok səviyyəsində
(`Skeleton`, kartlar) qalır.

**Rationale**: Spec FR-011, FR-012; template VII.4.

**Alternatives**: Statik başlıq (SEO itkisi); `not-found`-u tək root-da saxlamaq (locale-siz
layout-da i18n yoxdur).

## R14 — Ana səhifə məlumat orkestrasiyası və trend məntiqi

**Decision**: `views/home/loader.ts` köhnə `page.tsx`-i birə-bir təkrarlayır: `Promise.all` 8
çağırış (`getHomepage`, `getCurrencies`, `getPressReleases(locale,1,5)`, `getInflation()`,
`getAzir()`, `getGalleries(locale,1,6)`, `getVideos(locale,1,6)`, `getYieldCurveLatest()`), hər
biri `.catch` → `{data:null,error:true}`; sonra `fetchPreviousSheet(locale, sheet.date)` (1–5 gün
geri, ilk tapılan), `getPressRelease(locale, first.slug)` → `excerpt(stripHtml(content), 260)`.
Kart xəritəsi: `CurrencyCard` (`showOnHomepage`), `CorridorCard` (`corridor_min/max/percent`),
`InflationCard` (`cpi_yoy`, `target`), `MoneyMarketCard` (AZIR `1D/30D/90D/180D`), `InfoWidget`
(`money_reserve_usd`, `money_base`; `nots_volume` + `nots_levels_28/84/168/252`; `bank_credit`,
`bank_nation`), `YieldCurveCard`, `NewsTabs` (press/foto/video), `MediaTabs`, promo banner
(`description` olan banner), nəşrlər + sürətli keçidlər, faydalı keçidlər (`description`-sız
bannerlər). Hər bölmə `length > 0` qoruması ilə; xəta halında kart `ErrorState`.

**Rationale**: SC-002 (eyni sorğu çoxluğu), spec FR-021.

**Alternatives**: Sorğuları azaltmaq/birləşdirmək (API dəyişikliyi — əhatədən kənar).

## Həll olunmuş qeyri-müəyyənliklər (xülasə)

| Sual | Cavab |
| --- | --- |
| Məlumat brauzerdən mi, serverdən mi alınır? | Yalnız serverdən (R2); brauzer API-yə müraciət etmir |
| Kit qrafik verirmi? | Xeyr — ECharts D1 (R8), rənglər `--ui-color-chart-*` |
| Kit səhifələmə/çekmecə etiketləri necə lokallaşır? | `UIMessagesProvider` az/en (R6) |
| `NEXT_LOCALE` cookie? | Silinir; həmişə `az` (R5) |
| CSP media/iframe-i necə buraxır? | `img-src`/`media-src` API origin, `frame-src` YouTube + `CSP_FRAME_SRC` (R5) |
| CMS HTML sanitizasiyası dependency-siz mümkündürmü? | Bəli — üç sinif üçün server tərəfli süzgəc (R7) |
| View-lar necə test olunur? | Prop-lu view + loader ayrımı (R10, R11) |
| Kit lokal quraşdırma VPN tələb edirmi? | Xeyr — `install:offline` vendor tarball (R1) |
| Dev port | `3001`, Docker `3000` (R1, R12) |
