# Research: 004-fix-page-add-child

## R1 — Kök səbəb: niyə yalnız deploy olunmuş saytda?

**Ölçmələr (2026-09-23)**

| # | Ssenari | Nəticə |
| --- | --- | --- |
| 1 | Mövcud test `pages.test.tsx` (öz route ağacı, mock API) → `/pages/new?parentId=5` | keçir |
| 2 | Tam aplikasiya (`renderApp`, real `routeTree` + app shell, mock API): `/pages` → "Haqqımızda" **+** kliki; birbaşa `/pages/new?parentId=1`; `/pages/new` | 3/3 xətasız, konsolda xəta yoxdur, `search = {parentId: 1}` |
| 3 | İstifadəçi: `npm run local:testcbar` (**eyni test API, eyni məlumat**) | xəta yoxdur |
| 4 | İstifadəçi: deploy olunmuş test sayt | xəta var; **təkrar cəhddə işləyir** |
| 5 | Production build (`vite build`, MSW ilə) + headless Chrome | nəticəsiz: MSW-li prod build-də login axını axios tərəfində "Network error" verdi (login cavabı 200 idi); ssenari bu mühitdə davam etdirilə bilmədi |

(1)–(3) məlumatı və kodun məntiqini istisna edir. (4) göstərir ki, xəta keçicidir
və build-in yüklənməsinə bağlıdır.

**Mexanizm (kodda yoxlanıb)**

- `/pages` və `/pages/new` eyni modulu (`@/pages/pages`) yükləyir, yəni **+**
  kliki route chunk-ı üçün yeni fayl istəmir.
- Yeni yüklənən yeganə şey mətn redaktorudur:
  `features/rich-text/index.ts:12` — `React.lazy(() => import('./ui/rich-text-editor'))`,
  build-də ayrıca `rich-text-editor-<hash>.js` (~485 kB).
- TanStack `lazyRouteComponent` modul tapılmayanda səhifəni bir dəfə yeniləyir
  (`node_modules/@tanstack/react-router/dist/esm/lazyRouteComponent.js:37`,
  `isModuleNotFoundError` → `sessionStorage` açarı → `location.reload()`).
  Ona görə route keçidləri deploy-dan sağ çıxır. `React.lazy`-də bu yoxdur:
  rədd olunmuş import render xətasıdır və router-in `defaultErrorComponent`-i
  (`RouterErrorFallback`) göstərilir. Başlıq "Nəsə səhv getdi / Səhifə render
  olunarkən xəta baş verdi" istifadəçinin gördüyü mətndir.
- `test` branch-i hər push-da avtomatik deploy olunur; 2026-09-20-dən bəri 8
  commit. Yeni image köhnə `assets/*-<hash>.js` fayllarını daşımır. nginx
  `location /assets/`-də `try_files` yoxdur, ona görə köhnə chunk 404 verir.
- `default.conf` `index.html` üçün cache başlığı vermir; brauzer evristik keşlə
  köhnə `index.html`-i saxlaya bilər, bu da pəncərəni genişləndirir.
- **Diaqnostika boşluğu**: `RouterErrorFallback` `error`-u qəbul edir, amma heç
  yerə yazmır. `logger.error` yalnız `import.meta.env.DEV`-də konsola yazır.
  Deploy olunmuş build-də səbəb **heç bir yerdə görünmür**. Ona görə istifadəçi
  F12-də xəta mətni tapa bilmədi.

**Qərar**: Kök səbəb köhnə tabda redaktor chunk-ının yüklənə bilməməsi hesab
edilir. **Təsdiq addımı** (tasks-da birinci): diaqnostika düzəlişi (R3) deploy
olunandan sonra ssenari quickstart §2 ilə təkrarlanır və konsolda
`Failed to fetch dynamically imported module` / `error loading dynamically
imported module` mətni görülür. Başqa mətn çıxsa, plan həmin xəta ilə
yenilənir. R2 düzəlişi yenə də qalır, çünki müstəqil olaraq doğru deploy
gigiyenasıdır.

**Alternativlər**: məlumat/API xətası (3-cü ölçü ilə istisna); route
`validateSearch` (2-ci ölçü ilə istisna); StrictMode/TipTap render xətası (lokal
dev-də görünərdi, istisna).

## R2 — Chunk yükləmə xətasının həlli

**Qərar**: üç qat, hamısı eyni `reloadOnce` qoruyucusu ilə:

1. `window.addEventListener('vite:preloadError', e => { e.preventDefault(); reloadOnce() })`
   Vite-in rəsmi tövsiyəsi, modulepreload uğursuzluqlarını tutur.
2. Redaktorun `lazy` import-u `.catch(err => isChunkLoadError(err) ? reloadOnce(err) : throw)`.
   `React.lazy` rədd olunmuş promise-i keşləyir; yenidən cəhd yalnız reload ilə mümkündür.
3. `RouterErrorFallback` chunk xətası alanda da `reloadOnce` çağırır (gələcək
   `React.lazy` istifadələri üçün təhlükəsizlik toru).

`reloadOnce`: `sessionStorage` açarı `chunk-reload-at`. Son 10 saniyədə reload
olubsa, yenidən yükləmir və xətanı yuxarı ötürür → xəta ekranı + log. Sonsuz
dövrə yoxdur. sessionStorage əlçatmazdırsa, reload etmir.

`isChunkLoadError`: mesajda `Failed to fetch dynamically imported module`
(Chromium), `error loading dynamically imported module` (Firefox),
`Importing a module script failed` (Safari), `Unable to preload CSS`, ya da
`TypeError` + `.js` URL-i. TanStack-in `isModuleNotFoundError` eyni mətnləri
yoxlayır; biz onu import etmirik (router-core daxili API-dir, versiya
yeniləməsində sına bilər).

**Alternativlər**: (a) redaktoru lazy-dən çıxarmaq: +485 kB ilkin bundle,
research R10 (spec 001) qərarına ziddir, rədd. (b) Köhnə chunk-ları nginx-də
saxlamaq (əvvəlki build-in assets-ini image-ə kopyalamaq): CI dəyişikliyi,
Maddə VII.4 pipeline-ı, rədd. (c) Service worker ilə versiya bildirişi: yeni
mürəkkəblik, rədd.

## R3 — Diaqnostika

**Qərar**: `logger.error` production-da da `console.error('[admin]', error.name, error.message, context)`
yazır: yalnız ad + mesaj + componentStack, response body və header yox (Maddə
VII.5, X.3). `RouterErrorFallback({error, reset})` `useEffect`-də
`logger.error(error)` çağırır. Ekrandakı mətn dəyişmir (VII.3: raw mesaj
istifadəçiyə göstərilmir).

## R4 — İctimai menyuda görünmə qaydaları

**Mənbələr**: `api-cbar/src/Cbar.WebApi/Controllers/PagesController.cs` (`GetTree`),
`web-cbar-new/src/shell/nav.ts`, `web-cbar-new/src/server/cached.ts`.

Səhifə `locale` menyusunda görünür ⇔ hamısı doğrudur:

1. `status == published`
2. `flags.active` və `flags.visible`
3. `locale == 'az' ? flags.showAz : flags.showEn`
4. həmin dildə tərcümə var: başlıq boş deyil (slug boşdursa `api-cbar-admin` onu başlıqdan yaradır)
5. valideyn də bu qaydalarla görünür. **Diqqət**: görünməyən valideynin
   uşaqları `api-cbar`-da **kökə qalxır** (`ParentId not in ids` → root), yəni
   menyuda üst səviyyədə görünür. Formda bu hal ayrıca xəbərdarlıqla göstərilir.
6. dərinlik ≤ 3 (`MAX_DEPTH`; kök = 1). "Haqqımızda" = 1, uşağı = 2.
7. Link: `navUrl` doludursa ona (xarici `https://` yeni tab), əks halda `/{locale}/{slug}` (`FEATURE_ROUTES` istisnaları).

**Gecikmə**: `pages/tree` `unstable_cache` ilə `TREE_REVALIDATE_SECONDS = 300`.
Dəyişiklik menyuda ən gec 5 dəqiqəyə görünür. Webhook ilə ani yeniləmə spec
003-də gələcək iş kimi qeyd olunub, burada əhatədən kənardır.

**Qərar**: qaydalar paneldə saf funksiya (`menuVisibility`) kimi təkrarlanır və
`contracts/menu-visibility.md`-də sənədləşdirilir. Kod paylaşılmır (Root Maddə II.4).
Default status **qaralama** qalır (spec Assumptions).

**Alternativlər**: `api-cbar-admin`-ə "menyu önizləmə" endpoint-i: iki MR və
deploy sırası tələb edir, dəyər əlavə etmir. `api-cbar`-ı paneldən çağırmaq:
Root Maddə III.1 qadağandır.
