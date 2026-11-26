# web-cbar-admin-next — CBAR CMS admin paneli

cbar.az məzmun idarəetmə panelinin yeni versiyası: `api-cbar-admin` (.NET, `/api/v1`)
üzərində işləyən React SPA. `new-template` (CBAR React Template) kopyasından
qurulub — stack, FSD arxitektura və UI kiti (`@cbar/lib-react-ui-kit`) oradan
miras qalır. Spec: `../specs/001-admin-template-migration/`.

Görünüş qatı yalnız kitdir: rəng, boşluq, tipoqrafiya kitin semantik tokenlərindən
gəlir (`npm run check:kit` bunu yoxlayır). Funksionallıq köhnə `web-cbar-admin`
ilə birə-bir paritetdədir; köhnə panel cutover-ə qədər işlək qalır.

## Quraşdırma

```bash
npm run install:public      # public registry paketləri (VPN tələb olunmur)
npm run install:nexus       # UI kit — VPN + .env.nexus (bax .env.nexus.example)
```

`install:public` `--omit=optional` ilə işlədiyi üçün kit **və** platforma native
binding-ləri (rolldown/tailwind/lightningcss) quraşdırılmır — `install:nexus` onları
tamamlayır. VPN-siz mühitdə kiti mövcud `new-template/node_modules/@cbar` qovluğundan
kopyalamaq olar (yalnız lokal, sənədləşdirilmiş fallback).

## İşə salma

```bash
npm run dev                 # http://localhost:5174 — /api/v1/* → http://localhost:5253 (Vite proxy)
npm run local:testcbar      # http://localhost:5175 — /api/v1/* → https://api-cbar-admin-test.cbar.az (Vite proxy)
```

Port 5174-dür: köhnə `web-cbar-admin` cutover-ə qədər 5173-də qalır (API CORS siyasəti
yalnız 5173-ə icazə verir); bu panel `/api`-ni proxy etdiyi üçün portu sərbəstdir.
Admin API əvvəlcə qalxmalıdır (`dotnet run --project ../api-cbar-admin/src/Cbar.AdminApi`
və ya root-dan `.\dev.ps1` / `./dev.sh` — hər iki paneli yan-yana qaldırır). Giriş: `admin / ChangeMe123!`
(`../api-cbar-admin/CREDENTIALS.md`).

`local:testcbar` lokal API qaldırmadan **test** mühitinin admin API-si ilə işləyir:
ayrı portda (5175) qalxır, ona görə `npm run dev` ilə yanaşı işləyə bilər, və sorğu
brauzerdən eyni mənbəyə (`/api/v1/...`) gedib Vite proxy vasitəsilə test API-yə
ötürülür — test API-nin CORS siyahısına lokal port əlavə etmək lazım deyil. Başlamazdan
əvvəl `/healthz` və tokensiz `/laws` (401 gözlənilir) yoxlanılır. Giriş test mühitinin
istifadəçisi ilədir, lokal `admin` hesabı ilə deyil. Arqumentlər:
`--api=<url>` (başqa mühit), `--port=<n>`, `--direct` (proxy yox — brauzer birbaşa
gedir, test API CORS icazəsi tələb olunur), `--skip-check`; `scripts/dev/local-testcbar.mjs`.

API-siz demo: `VITE_ENABLE_MSW=true npm run dev` — MSW `/api/v1/*`-ni real kontraktla
cavablandırır (`src/shared/testing/handlers/`).

API ünvanı build zamanı bundle-a yazılır (`VITE_API_URL`, `/api/v1` prefiksi daxil);
servis yolları API kökünə nisbidir. Mühit faylları: `.env.development` (`npm run dev`,
Vite proxy), `.env.dev` / `.env.test` / `.env.production` (`npm run build:<env>`).

## Keyfiyyət qapısı

```bash
npm run verify     # lint → check:kit → check:i18n → tsc -b → test → build
npm run audit      # npm audit --audit-level=high — sıfır tapıntı (müvəqqəti istisna: specs/003-dev-audit-exception)
npm run roundtrip -- "Haqqımızda" "Pul siyasəti"   # canlı API ilə redaktor round-trip yoxlaması
```

`roundtrip` seed-lənmiş səhifələri TipTap-dan keçirib struktur sayğaclarını
(accordion, cədvəl, media link, şəkil, iframe) müqayisə edir; redaktor
dəyişikliyi ondan keçmədən merge edilmir.

## Struktur

FSD: `app → pages → widgets → features → entities → shared`. Konfiqurasiya ilə
yaradılan CRUD ekranları `features/<x>/model/module.ts` (`ModuleConfig`) +
`pages/<x>` ilə; mühərrik `shared/crud` (React-siz) + `features/crud`. Xüsusi
ekranlar (səhifə ağacı, məzənnə vərəqi, valyuta siyahısı, AZIR, inflyasiya,
gəlirlik əyrisi, istifadəçi forması, parametrlər) öz feature qovluğundadır.
Zəngin mətn redaktoru `features/rich-text` (TipTap — spec D1).

## Deploy

`Dockerfile` (node build + nginx), `.gitlab-ci.yml` (paylaşılan CBAR pipeline),
`.ci-cd/{base,dev,test,prod}.yaml` (Helm). Bundle hər mühit üçün ayrıca qurulur —
köhnə `web-cbar-admin` ilə eyni model: `BUILD_ENV` (`dev|test|production`) Dockerfile-da
`npm run build:<env>` skriptini və Vite-in oxuduğu `.env.<env>` faylını seçir, API
ünvanı build zamanı sabitlənir (runtime `/config.json` yoxdur). CI-də `build-image`
override-i `BUILD_ENV`-i `$DEPLOY_ENVIRONMENT`-dən ötürür (`prod` → `production`);
lokal: `npm run docker:build -- --build-arg BUILD_ENV=test`. `TODO(devops)` markerləri:
hostname-lər, API tərəfində `Cors__Origins`.
